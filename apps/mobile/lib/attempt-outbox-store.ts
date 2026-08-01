import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  applyAnonymousProgressFusionBatchSuccess as applyFusionBatchSuccess,
  applyAttemptOutboxSuccess,
  applyProgressSnapshot,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  completeAnonymousProgressFusion as completeFusion,
  deriveAccountDeviceId,
  deserializeAnonymousProgressFusionMarker,
  deserializeAttemptOutboxSnapshot,
  enqueueAttempt,
  idempotencyKeySchema,
  prepareAttemptOutboxBatch,
  resumeAnonymousProgressFusion as resumeFusion,
  resumeAttemptOutboxAfterDeviceRegistration,
  serializeAttemptOutboxSnapshot,
  serializeAnonymousProgressFusionMarker,
  startAnonymousProgressFusion as startFusion,
  type ApplyAttemptOutboxSuccessResult,
  type AnonymousProgressFusionMarker,
  type AttemptBatchResponse,
  type AttemptOutboxOwner,
  type AttemptOutboxSnapshot,
  type CompletedAnonymousProgressFusionState,
  type PendingAnonymousProgressFusionState,
  type PrepareAttemptOutboxResult,
  type ProgressSnapshotResponse,
  type Sha256Hex,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

const OUTBOX_KEY = "attempts-v1";
const DEVICE_KEY = "device_id";
const INSTALLATION_KEY = "installation_id_v1";
const LEGACY_MIGRATION_KEY = "legacy_attempt_journal_migrated_v1";
const FUSION_MARKER_KEY = "anonymous_progress_fusion_v1";
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

export interface ExpectedMobileAccountPurgeState {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly fusionMarker: AnonymousProgressFusionMarker | null;
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

function parseStoredSnapshot(
  row: OutboxRow | null,
  owner: AttemptOutboxOwner,
): AttemptOutboxSnapshot {
  if (row === null) return createAttemptOutboxSnapshot(owner);

  const snapshot = deserializeAttemptOutboxSnapshot(row.snapshot);
  if (!attemptOutboxOwnersAreEqual(snapshot.owner, owner)) {
    throw new Error("Le propriétaire du journal local ne correspond pas.");
  }
  return snapshot;
}

async function readSnapshot(
  database: SQLiteDatabase,
  outboxKey: string,
  owner: AttemptOutboxOwner,
): Promise<AttemptOutboxSnapshot> {
  return parseStoredSnapshot(
    await database.getFirstAsync<OutboxRow>(
      "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
      outboxKey,
    ),
    owner,
  );
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

function parseStoredFusionMarker(
  row: MetadataRow | null,
): AnonymousProgressFusionMarker | null {
  if (row === null) return null;
  return deserializeAnonymousProgressFusionMarker(row.value);
}

async function writeFusionMarker(
  database: SQLiteDatabase,
  marker: AnonymousProgressFusionMarker,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO local_metadata (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    FUSION_MARKER_KEY,
    serializeAnonymousProgressFusionMarker(marker),
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
    namespace: "learning" | "demo" = "learning",
  ) {
    this.#database = database;
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    const scope = attemptOutboxOwnerStorageKey(this.#owner);
    const prefix = namespace === "learning" ? "" : "demo:";
    this.#outboxKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${OUTBOX_KEY}`
        : `${prefix}${OUTBOX_KEY}:${scope}`;
    this.#deviceKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${DEVICE_KEY}`
        : `${prefix}${DEVICE_KEY}:${scope}`;
    this.#legacyMigrationKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${LEGACY_MIGRATION_KEY}`
        : `${prefix}${LEGACY_MIGRATION_KEY}:${scope}`;
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
    if (this.#owner.kind === "account") {
      throw new MobileAttemptOutboxStorageError(
        "Un compte doit utiliser un identifiant d’appareil dérivé de l’installation.",
      );
    }
    return this.#getOrCreateMetadataUuid(this.#deviceKey, createUuid);
  }

  public async getOrCreateAccountDeviceId(
    createUuid: () => string,
    sha256Hex: Sha256Hex,
  ): Promise<string> {
    if (this.#owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "Aucun compte n’est associé à ce journal local.",
      );
    }

    try {
      const installationId = await this.#getOrCreateMetadataUuid(
        INSTALLATION_KEY,
        createUuid,
      );
      return await deriveAccountDeviceId({
        installationId,
        userId: this.#owner.userId,
        sha256Hex,
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
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
    return this.#applySuccessWithFusion(response);
  }

  public applyProgressSnapshot(
    response: ProgressSnapshotResponse,
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) =>
      applyProgressSnapshot(snapshot, response),
    );
  }

  public resumeAfterDeviceRegistration(
    registeredDeviceId: string,
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) =>
      resumeAttemptOutboxAfterDeviceRegistration(snapshot, registeredDeviceId),
    );
  }

  public async readFusionMarker(): Promise<AnonymousProgressFusionMarker | null> {
    try {
      return await serializeDatabaseOperation(this.#database, async () =>
        parseStoredFusionMarker(
          await this.#database.getFirstAsync<MetadataRow>(
            "SELECT value FROM local_metadata WHERE key = ?",
            FUSION_MARKER_KEY,
          ),
        ),
      );
    } catch (error) {
      throw new MobileAttemptOutboxStorageError(
        "Le marqueur de fusion locale est illisible et n’a pas été écrasé.",
        { cause: error },
      );
    }
  }

  public startAnonymousFusion(input: {
    readonly fusionId: string;
    readonly accountDeviceId: string;
    readonly consentedAt: string;
  }): Promise<PendingAnonymousProgressFusionState> {
    return this.#mutateFusion((marker, anonymousSnapshot, accountSnapshot) =>
      startFusion({
        existingMarker: marker,
        fusionId: input.fusionId,
        consent: { accepted: true, consentedAt: input.consentedAt },
        anonymousSnapshot,
        accountSnapshot,
        accountDeviceId: input.accountDeviceId,
      }),
    );
  }

  public async resumeAnonymousFusion(): Promise<PendingAnonymousProgressFusionState | null> {
    return this.#mutateFusion((marker, anonymousSnapshot, accountSnapshot) => {
      if (
        marker === null ||
        marker.status === "completed" ||
        this.#owner.kind !== "account" ||
        marker.targetUserId !== this.#owner.userId
      ) {
        return null;
      }
      return resumeFusion({ marker, anonymousSnapshot, accountSnapshot });
    });
  }

  public async completeAnonymousFusion(
    completedAt: string,
  ): Promise<CompletedAnonymousProgressFusionState> {
    return this.#mutateFusion((marker, anonymousSnapshot, accountSnapshot) => {
      if (
        marker === null ||
        this.#owner.kind !== "account" ||
        marker.targetUserId !== this.#owner.userId
      ) {
        throw new MobileAttemptOutboxStorageError(
          "Aucune fusion locale de ce compte n’attend d’être terminée.",
        );
      }
      return completeFusion({
        marker,
        anonymousSnapshot,
        accountSnapshot,
        completedAt,
      });
    });
  }

  /** Purge ciblée d'un espace; l'identité opaque d'installation est conservée. */
  public async purgeOwnerData(): Promise<void> {
    try {
      await serializeDatabaseOperation(this.#database, () =>
        this.#database.withExclusiveTransactionAsync(async (transaction) => {
          const marker = parseStoredFusionMarker(
            await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              FUSION_MARKER_KEY,
            ),
          );
          if (
            this.#owner.kind === "anonymous" &&
            marker?.status === "awaiting_server_ack"
          ) {
            throw new MobileAttemptOutboxStorageError(
              "La progression anonyme participe à une fusion encore active.",
            );
          }
          await transaction.runAsync(
            "DELETE FROM attempt_outbox_state WHERE key = ?",
            this.#outboxKey,
          );
          await transaction.runAsync(
            "DELETE FROM local_metadata WHERE key IN (?, ?)",
            this.#deviceKey,
            this.#legacyMigrationKey,
          );
          if (
            this.#owner.kind === "account" &&
            marker?.targetUserId === this.#owner.userId
          ) {
            await transaction.runAsync(
              "DELETE FROM local_metadata WHERE key = ?",
              FUSION_MARKER_KEY,
            );
          }
        }),
      );
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "Les données locales du compte n’ont pas pu être supprimées.",
        { cause: error },
      );
    }
  }

  /** Purge soldée, ou compare-and-purge strict après confirmation explicite. */
  public async purgeAccountDataIfSettled(
    expectedState?: ExpectedMobileAccountPurgeState,
  ): Promise<boolean> {
    if (this.#owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "La purge conditionnelle exige un espace compte.",
      );
    }
    const owner = this.#owner;
    if (
      expectedState !== undefined &&
      !attemptOutboxOwnersAreEqual(expectedState.snapshot.owner, owner)
    ) {
      throw new MobileAttemptOutboxStorageError(
        "L’état confirmé appartient à un autre compte.",
      );
    }
    const expectedSnapshot =
      expectedState === undefined
        ? undefined
        : serializeAttemptOutboxSnapshot(expectedState.snapshot);
    const expectedMarker =
      expectedState === undefined
        ? undefined
        : expectedState.fusionMarker === null
          ? null
          : serializeAnonymousProgressFusionMarker(expectedState.fusionMarker);

    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let purged = false;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const row = await transaction.getFirstAsync<OutboxRow>(
              "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
              this.#outboxKey,
            );
            const snapshot = parseStoredSnapshot(row, owner);
            const marker = parseStoredFusionMarker(
              await transaction.getFirstAsync<MetadataRow>(
                "SELECT value FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              ),
            );
            const unsettled =
              snapshot.inFlight !== null ||
              snapshot.entries.some(({ status }) => status === "pending") ||
              (marker?.status === "awaiting_server_ack" &&
                marker.targetUserId === owner.userId);
            const markerValue =
              marker === null
                ? null
                : serializeAnonymousProgressFusionMarker(marker);
            const matchesExpected =
              expectedSnapshot !== undefined &&
              serializeAttemptOutboxSnapshot(snapshot) === expectedSnapshot &&
              markerValue === expectedMarker;
            const alreadyPurged =
              row === null &&
              (marker === null || marker.targetUserId !== owner.userId);
            if (expectedSnapshot !== undefined) {
              if (!matchesExpected && !alreadyPurged) return;
            } else if (unsettled) {
              return;
            }

            await transaction.runAsync(
              "DELETE FROM attempt_outbox_state WHERE key = ?",
              this.#outboxKey,
            );
            await transaction.runAsync(
              "DELETE FROM local_metadata WHERE key IN (?, ?)",
              this.#deviceKey,
              this.#legacyMigrationKey,
            );
            if (marker?.targetUserId === owner.userId) {
              await transaction.runAsync(
                "DELETE FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              );
            }
            purged = true;
          },
        );
        return purged;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "Les données locales du compte n’ont pas pu être vérifiées.",
        { cause: error },
      );
    }
  }

  async #getOrCreateMetadataUuid(
    key: string,
    createUuid: () => string,
  ): Promise<string> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let value = "";
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const row = await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              key,
            );
            if (row !== null) {
              value = idempotencyKeySchema.parse(row.value);
              return;
            }

            value = idempotencyKeySchema.parse(createUuid());
            await transaction.runAsync(
              "INSERT INTO local_metadata (key, value) VALUES (?, ?)",
              key,
              value,
            );
          },
        );
        return value;
      });
    } catch (error) {
      throw new MobileAttemptOutboxStorageError(
        "L'identité locale de cet appareil est indisponible.",
        { cause: error },
      );
    }
  }

  async #mutateFusion<
    T extends
      | PendingAnonymousProgressFusionState
      | CompletedAnonymousProgressFusionState
      | null,
  >(
    update: (
      marker: AnonymousProgressFusionMarker | null,
      anonymousSnapshot: AttemptOutboxSnapshot,
      accountSnapshot: AttemptOutboxSnapshot,
    ) => T,
  ): Promise<T> {
    if (this.#owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "Une fusion locale exige un espace compte.",
      );
    }

    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: T | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const marker = parseStoredFusionMarker(
              await transaction.getFirstAsync<MetadataRow>(
                "SELECT value FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              ),
            );
            const result = update(
              marker,
              await readSnapshot(
                transaction,
                OUTBOX_KEY,
                ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
              ),
              await readSnapshot(transaction, this.#outboxKey, this.#owner),
            );
            if (result === null) {
              returned = result;
              return;
            }
            await writeSnapshot(
              transaction,
              OUTBOX_KEY,
              result.anonymousSnapshot,
            );
            await writeSnapshot(
              transaction,
              this.#outboxKey,
              result.accountSnapshot,
            );
            await writeFusionMarker(transaction, result.marker);
            returned = result;
          },
        );
        if (returned === undefined) {
          throw new Error(
            "La transaction de fusion n’a renvoyé aucun résultat.",
          );
        }
        return returned;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "La fusion locale n’a pas pu être enregistrée atomiquement.",
        { cause: error },
      );
    }
  }

  async #applySuccessWithFusion(
    response: AttemptBatchResponse,
  ): Promise<ApplyAttemptOutboxSuccessResult> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: ApplyAttemptOutboxSuccessResult | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const accountSnapshot = await readSnapshot(
              transaction,
              this.#outboxKey,
              this.#owner,
            );
            const marker = parseStoredFusionMarker(
              await transaction.getFirstAsync<MetadataRow>(
                "SELECT value FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              ),
            );
            if (
              this.#owner.kind !== "account" ||
              marker === null ||
              marker.status === "completed" ||
              marker.targetUserId !== this.#owner.userId
            ) {
              const applied = applyAttemptOutboxSuccess(
                accountSnapshot,
                response,
              );
              await writeSnapshot(
                transaction,
                this.#outboxKey,
                applied.snapshot,
              );
              returned = applied;
              return;
            }

            const fused = applyFusionBatchSuccess({
              marker,
              anonymousSnapshot: await readSnapshot(
                transaction,
                OUTBOX_KEY,
                ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
              ),
              accountSnapshot,
              response,
            });
            await writeSnapshot(
              transaction,
              OUTBOX_KEY,
              fused.anonymousSnapshot,
            );
            await writeSnapshot(
              transaction,
              this.#outboxKey,
              fused.accountSnapshot,
            );
            await writeFusionMarker(transaction, fused.marker);
            returned = {
              snapshot: fused.accountSnapshot,
              requiresDeviceRegistration: fused.requiresDeviceRegistration,
            };
          },
        );
        if (returned === undefined) {
          throw new Error("La transaction serveur n’a renvoyé aucun résultat.");
        }
        return returned;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "La réponse serveur n’a pas pu être appliquée atomiquement.",
        { cause: error },
      );
    }
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
