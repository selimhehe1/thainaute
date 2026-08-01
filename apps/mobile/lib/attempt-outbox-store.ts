import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  applyAttemptOutboxSuccess,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  deserializeAttemptOutboxSnapshot,
  enqueueAttempt,
  idempotencyKeySchema,
  prepareAttemptOutboxBatch,
  resumeAttemptOutboxAfterDeviceRegistration,
  serializeAttemptOutboxSnapshot,
  type ApplyAttemptOutboxSuccessResult,
  type AttemptBatchResponse,
  type AttemptOutboxOwner,
  type AttemptOutboxSnapshot,
  type PrepareAttemptOutboxResult,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

const OUTBOX_KEY = "attempts-v1";
const DEVICE_KEY = "device_id";
const LEGACY_MIGRATION_KEY = "legacy_attempt_journal_migrated_v1";
const SQLITE_BUSY_RETRY_COUNT = 3;

interface MetadataRow {
  readonly value: string;
}

interface OutboxRow {
  readonly snapshot: string;
}

interface LegacyJournalRow {
  readonly payload: string;
}

const databaseQueues = new WeakMap<object, Promise<void>>();

export class MobileAttemptOutboxStorageError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MobileAttemptOutboxStorageError";
  }
}

function isSqliteBusy(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /SQLITE_BUSY|database is locked/i.test(error.message);
}

async function retrySqliteBusy<T>(operation: () => Promise<T>): Promise<T> {
  for (let retry = 0; ; retry += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isSqliteBusy(error) || retry >= SQLITE_BUSY_RETRY_COUNT) throw error;
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 10 * (retry + 1)),
      );
    }
  }
}

/** Une seule mutation SQLite à la fois, même avec deux montages StrictMode. */
function serializeDatabaseOperation<T>(
  database: SQLiteDatabase,
  operation: () => Promise<T>,
): Promise<T> {
  const previous = databaseQueues.get(database) ?? Promise.resolve();
  const result = previous.then(
    () => retrySqliteBusy(operation),
    () => retrySqliteBusy(operation),
  );
  const tail = result.then(
    () => undefined,
    () => undefined,
  );
  databaseQueues.set(database, tail);
  void tail.finally(() => {
    if (databaseQueues.get(database) === tail) databaseQueues.delete(database);
  });
  return result;
}

async function readSnapshot(
  database: SQLiteDatabase,
  outboxKey: string,
  owner: AttemptOutboxOwner,
): Promise<AttemptOutboxSnapshot> {
  const row = await database.getFirstAsync<OutboxRow>(
    "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
    outboxKey,
  );
  if (row === null) return createAttemptOutboxSnapshot(owner);

  const snapshot = deserializeAttemptOutboxSnapshot(row.snapshot);
  if (!attemptOutboxOwnersAreEqual(snapshot.owner, owner)) {
    throw new Error("Le propriétaire du journal local ne correspond pas.");
  }
  return snapshot;
}

async function writeSnapshot(
  database: SQLiteDatabase,
  outboxKey: string,
  snapshot: AttemptOutboxSnapshot,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO attempt_outbox_state (key, snapshot, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (key) DO UPDATE SET
       snapshot = excluded.snapshot,
       updated_at = excluded.updated_at`,
    outboxKey,
    serializeAttemptOutboxSnapshot(snapshot),
    new Date().toISOString(),
  );
}

function parseLegacySubmission(payload: string): ValidatedAttemptSubmission {
  const candidate = JSON.parse(payload) as unknown;
  if (typeof candidate !== "object" || candidate === null) {
    throw new Error("Entrée historique invalide.");
  }
  const row = candidate as Record<string, unknown>;
  return attemptSubmissionSchema.parse({
    eventId: row.eventId,
    deviceId: row.deviceId,
    exerciseId: row.exerciseId,
    selectedOptionId: row.selectedOptionId,
    answeredAt: row.answeredAt,
    durationMs: row.durationMs,
    contentVersionId: row.contentVersionId,
    algorithmVersion: row.algorithmVersion,
  });
}

/** Adaptateur SQLite transactionnel du snapshot partagé `@thainaute/sync`. */
export class MobileAttemptOutboxStore {
  readonly #database: SQLiteDatabase;
  readonly #owner: AttemptOutboxOwner;
  readonly #outboxKey: string;
  readonly #deviceKey: string;
  readonly #legacyMigrationKey: string;

  public constructor(
    database: SQLiteDatabase,
    ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  ) {
    this.#database = database;
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    const scope = attemptOutboxOwnerStorageKey(this.#owner);
    this.#outboxKey =
      this.#owner.kind === "anonymous" ? OUTBOX_KEY : `${OUTBOX_KEY}:${scope}`;
    this.#deviceKey =
      this.#owner.kind === "anonymous" ? DEVICE_KEY : `${DEVICE_KEY}:${scope}`;
    this.#legacyMigrationKey =
      this.#owner.kind === "anonymous"
        ? LEGACY_MIGRATION_KEY
        : `${LEGACY_MIGRATION_KEY}:${scope}`;
  }

  public async read(): Promise<AttemptOutboxSnapshot> {
    try {
      return await serializeDatabaseOperation(this.#database, () =>
        readSnapshot(this.#database, this.#outboxKey, this.#owner),
      );
    } catch (error) {
      throw new MobileAttemptOutboxStorageError(
        "Le journal local est illisible et n'a pas été écrasé.",
        { cause: error },
      );
    }
  }

  public async migrateLegacyJournal(): Promise<AttemptOutboxSnapshot> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let migrated = createAttemptOutboxSnapshot(this.#owner);
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const marker = await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              this.#legacyMigrationKey,
            );
            if (marker !== null && marker.value !== "done") {
              throw new Error("Marqueur de migration historique invalide.");
            }
            let snapshot = await readSnapshot(
              transaction,
              this.#outboxKey,
              this.#owner,
            );

            if (marker === null) {
              if (this.#owner.kind === "anonymous") {
                const rows = await transaction.getAllAsync<LegacyJournalRow>(
                  "SELECT payload FROM attempt_journal ORDER BY created_at, event_id",
                );
                for (const row of rows) {
                  snapshot = enqueueAttempt(
                    snapshot,
                    parseLegacySubmission(row.payload),
                  );
                }
              }
              await writeSnapshot(transaction, this.#outboxKey, snapshot);
              await transaction.runAsync(
                "INSERT INTO local_metadata (key, value) VALUES (?, ?)",
                this.#legacyMigrationKey,
                "done",
              );
              if (this.#owner.kind === "anonymous") {
                await transaction.runAsync("DELETE FROM attempt_journal");
              }
            }

            migrated = snapshot;
          },
        );
        return migrated;
      });
    } catch (error) {
      throw new MobileAttemptOutboxStorageError(
        "L'ancien journal local n'a pas pu être migré.",
        { cause: error },
      );
    }
  }

  public async getOrCreateDeviceId(createUuid: () => string): Promise<string> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let deviceId = "";
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const row = await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              this.#deviceKey,
            );
            if (row !== null) {
              deviceId = idempotencyKeySchema.parse(row.value);
              return;
            }

            deviceId = idempotencyKeySchema.parse(createUuid());
            await transaction.runAsync(
              "INSERT INTO local_metadata (key, value) VALUES (?, ?)",
              this.#deviceKey,
              deviceId,
            );
          },
        );
        return deviceId;
      });
    } catch (error) {
      throw new MobileAttemptOutboxStorageError(
        "L'identité locale de cet appareil est indisponible.",
        { cause: error },
      );
    }
  }

  public enqueue(
    submission: ValidatedAttemptSubmission,
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) => enqueueAttempt(snapshot, submission));
  }

  public prepare(
    candidateIdempotencyKey: string,
  ): Promise<PrepareAttemptOutboxResult> {
    return this.#replaceWithResult((snapshot) => {
      const result = prepareAttemptOutboxBatch(
        snapshot,
        candidateIdempotencyKey,
      );
      return { snapshot: result.snapshot, result };
    });
  }

  public applySuccess(
    response: AttemptBatchResponse,
  ): Promise<ApplyAttemptOutboxSuccessResult> {
    return this.#replaceWithResult((snapshot) => {
      const result = applyAttemptOutboxSuccess(snapshot, response);
      return { snapshot: result.snapshot, result };
    });
  }

  public resumeAfterDeviceRegistration(
    registeredDeviceId: string,
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) =>
      resumeAttemptOutboxAfterDeviceRegistration(snapshot, registeredDeviceId),
    );
  }

  async #replace(
    update: (snapshot: AttemptOutboxSnapshot) => AttemptOutboxSnapshot,
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replaceWithResult((snapshot) => {
      const next = update(snapshot);
      return { snapshot: next, result: next };
    });
  }

  async #replaceWithResult<T>(
    update: (snapshot: AttemptOutboxSnapshot) => {
      readonly snapshot: AttemptOutboxSnapshot;
      readonly result: T;
    },
  ): Promise<T> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: T | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const { snapshot, result } = update(
              await readSnapshot(transaction, this.#outboxKey, this.#owner),
            );
            await writeSnapshot(transaction, this.#outboxKey, snapshot);
            returned = result;
          },
        );
        if (returned === undefined) {
          throw new Error("La transaction SQLite n'a renvoyé aucun résultat.");
        }
        return returned;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      if (error instanceof AttemptOutboxCapacityError) {
        throw new MobileAttemptOutboxStorageError(error.message, {
          cause: error,
        });
      }
      throw new MobileAttemptOutboxStorageError(
        "Le journal local n'a pas pu être mis à jour.",
        { cause: error },
      );
    }
  }
}
