"use client";

import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  applyAttemptOutboxSuccess,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  createAttemptOutboxSnapshot,
  deserializeAttemptOutboxSnapshot,
  enqueueAttempt,
  idempotencyKeySchema,
  prepareAttemptOutboxBatch,
  resumeAttemptOutboxAfterDeviceRegistration,
  serializeAttemptOutboxSnapshot,
  type ApplyAttemptOutboxSuccessResult,
  type AttemptBatchResponse,
  type AttemptOutboxSnapshot,
  type AttemptOutboxOwner,
  type PrepareAttemptOutboxResult,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import Dexie, { type EntityTable } from "dexie";

const OUTBOX_KEY = "attempts-v1";
const DEVICE_KEY = "device-id-v1";

interface MetadataRow {
  readonly key: string;
  readonly value: string;
}

interface OutboxRow {
  readonly key: string;
  readonly snapshot: string;
}

type LearningDatabase = Dexie & {
  readonly metadata: EntityTable<MetadataRow, "key">;
  readonly outbox: EntityTable<OutboxRow, "key">;
};

export class AttemptOutboxStorageError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AttemptOutboxStorageError";
  }
}

function openDatabase(name: string): LearningDatabase {
  const database = new Dexie(name) as LearningDatabase;
  database.version(1).stores({
    metadata: "&key",
    outbox: "&key",
  });
  return database;
}

function parseStoredSnapshot(
  row: OutboxRow | undefined,
  owner: AttemptOutboxOwner,
): AttemptOutboxSnapshot {
  if (row === undefined) return createAttemptOutboxSnapshot(owner);

  try {
    const snapshot = deserializeAttemptOutboxSnapshot(row.snapshot);
    if (!attemptOutboxOwnersAreEqual(snapshot.owner, owner)) {
      throw new Error("Le propriétaire du journal local ne correspond pas.");
    }
    return snapshot;
  } catch (error) {
    throw new AttemptOutboxStorageError(
      "Le journal local est illisible et n'a pas été écrasé.",
      { cause: error },
    );
  }
}

/**
 * Adaptateur IndexedDB minimal. Le snapshot complet, y compris le lot en vol,
 * est remplacé dans une transaction afin qu'un retry conserve exactement sa
 * clé d'idempotence et son payload après un crash ou un rechargement.
 */
export class WebAttemptOutboxStore {
  readonly #database: LearningDatabase;
  readonly #owner: AttemptOutboxOwner;
  readonly #outboxKey: string;
  readonly #deviceKey: string;

  public constructor(
    databaseName = "thainaute-learning-v1",
    ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  ) {
    this.#database = openDatabase(databaseName);
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    const scope = attemptOutboxOwnerStorageKey(this.#owner);
    this.#outboxKey =
      this.#owner.kind === "anonymous" ? OUTBOX_KEY : `${OUTBOX_KEY}:${scope}`;
    this.#deviceKey =
      this.#owner.kind === "anonymous" ? DEVICE_KEY : `${DEVICE_KEY}:${scope}`;
  }

  public async read(): Promise<AttemptOutboxSnapshot> {
    try {
      return parseStoredSnapshot(
        await this.#database.outbox.get(this.#outboxKey),
        this.#owner,
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
        "Le journal local est temporairement indisponible.",
        { cause: error },
      );
    }
  }

  public async getOrCreateDeviceId(createUuid: () => string): Promise<string> {
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.metadata,
        async () => {
          const stored = await this.#database.metadata.get(this.#deviceKey);
          if (stored !== undefined) {
            return idempotencyKeySchema.parse(stored.value);
          }

          const deviceId = idempotencyKeySchema.parse(createUuid());
          await this.#database.metadata.add({
            key: this.#deviceKey,
            value: deviceId,
          });
          return deviceId;
        },
      );
    } catch (error) {
      throw new AttemptOutboxStorageError(
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

  public enqueueMany(
    submissions: readonly ValidatedAttemptSubmission[],
  ): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) =>
      submissions.reduce(
        (current, submission) => enqueueAttempt(current, submission),
        snapshot,
      ),
    );
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

  public close(): void {
    this.#database.close();
  }

  public async deleteForTests(): Promise<void> {
    const name = this.#database.name;
    this.#database.close();
    await Dexie.delete(name);
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
      return await this.#database.transaction(
        "rw",
        this.#database.outbox,
        async () => {
          const current = parseStoredSnapshot(
            await this.#database.outbox.get(this.#outboxKey),
            this.#owner,
          );
          const { snapshot, result } = update(current);
          await this.#database.outbox.put({
            key: this.#outboxKey,
            snapshot: serializeAttemptOutboxSnapshot(snapshot),
          });
          return result;
        },
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      if (error instanceof AttemptOutboxCapacityError) {
        throw new AttemptOutboxStorageError(error.message, { cause: error });
      }
      throw new AttemptOutboxStorageError(
        "Le journal local n'a pas pu être mis à jour.",
        { cause: error },
      );
    }
  }
}
