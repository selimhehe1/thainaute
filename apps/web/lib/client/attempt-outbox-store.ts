"use client";

import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  applyAnonymousProgressFusionBatchSuccess as applyFusionBatchSuccess,
  applyAttemptOutboxSuccess,
  applyProgressSnapshot,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
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
  type AttemptOutboxSnapshot,
  type AttemptOutboxOwner,
  type PrepareAttemptOutboxResult,
  type ProgressSnapshotResponse,
  type CompletedAnonymousProgressFusionState,
  type PendingAnonymousProgressFusionState,
  type Sha256Hex,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import Dexie, { type EntityTable } from "dexie";

const OUTBOX_KEY = "attempts-v1";
const DEVICE_KEY = "device-id-v1";
const INSTALLATION_KEY = "installation-id-v1";
const FUSION_MARKER_KEY = "anonymous-progress-fusion-v1";

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

export interface ExpectedWebAccountPurgeState {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly fusionMarker: AnonymousProgressFusionMarker | null;
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

function parseStoredFusionMarker(
  row: MetadataRow | undefined,
): AnonymousProgressFusionMarker | null {
  if (row === undefined) return null;
  try {
    return deserializeAnonymousProgressFusionMarker(row.value);
  } catch (error) {
    throw new AttemptOutboxStorageError(
      "Le marqueur de fusion locale est illisible et n’a pas été écrasé.",
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
    if (this.#owner.kind === "account") {
      throw new AttemptOutboxStorageError(
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
      throw new AttemptOutboxStorageError(
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
      if (error instanceof AttemptOutboxStorageError) throw error;
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
      return parseStoredFusionMarker(
        await this.#database.metadata.get(FUSION_MARKER_KEY),
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
        "Le marqueur de fusion locale est indisponible.",
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
        throw new AttemptOutboxStorageError(
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

  public close(): void {
    this.#database.close();
  }

  /** Purge ciblée d'un espace; l'identité opaque d'installation est conservée. */
  public async purgeOwnerData(): Promise<void> {
    try {
      await this.#database.transaction(
        "rw",
        this.#database.metadata,
        this.#database.outbox,
        async () => {
          const marker = parseStoredFusionMarker(
            await this.#database.metadata.get(FUSION_MARKER_KEY),
          );
          if (
            this.#owner.kind === "anonymous" &&
            marker?.status === "awaiting_server_ack"
          ) {
            throw new AttemptOutboxStorageError(
              "La progression anonyme participe à une fusion encore active.",
            );
          }
          await this.#database.outbox.delete(this.#outboxKey);
          await this.#database.metadata.delete(this.#deviceKey);
          if (
            this.#owner.kind === "account" &&
            marker?.targetUserId === this.#owner.userId
          ) {
            await this.#database.metadata.delete(FUSION_MARKER_KEY);
          }
        },
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
        "Les données locales du compte n’ont pas pu être supprimées.",
        { cause: error },
      );
    }
  }

  /**
   * Sans état attendu, ne purge qu'un compte soldé. Avec état attendu, exige
   * une égalité stricte afin qu'une confirmation ne couvre aucune mutation
   * concurrente invisible.
   */
  public async purgeAccountDataIfSettled(
    expectedState?: ExpectedWebAccountPurgeState,
  ): Promise<boolean> {
    if (this.#owner.kind !== "account") {
      throw new AttemptOutboxStorageError(
        "La purge conditionnelle exige un espace compte.",
      );
    }
    const owner = this.#owner;
    if (
      expectedState !== undefined &&
      !attemptOutboxOwnersAreEqual(expectedState.snapshot.owner, owner)
    ) {
      throw new AttemptOutboxStorageError(
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
      return await this.#database.transaction(
        "rw",
        this.#database.metadata,
        this.#database.outbox,
        async () => {
          const row = await this.#database.outbox.get(this.#outboxKey);
          const snapshot = parseStoredSnapshot(row, owner);
          const marker = parseStoredFusionMarker(
            await this.#database.metadata.get(FUSION_MARKER_KEY),
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
            row === undefined &&
            (marker === null || marker.targetUserId !== owner.userId);
          if (expectedSnapshot !== undefined) {
            if (!matchesExpected && !alreadyPurged) return false;
          } else if (unsettled) {
            return false;
          }

          await this.#database.outbox.delete(this.#outboxKey);
          await this.#database.metadata.delete(this.#deviceKey);
          if (marker?.targetUserId === owner.userId) {
            await this.#database.metadata.delete(FUSION_MARKER_KEY);
          }
          return true;
        },
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
        "Les données locales du compte n’ont pas pu être vérifiées.",
        { cause: error },
      );
    }
  }

  public async deleteForTests(): Promise<void> {
    const name = this.#database.name;
    this.#database.close();
    await Dexie.delete(name);
  }

  async #getOrCreateMetadataUuid(
    key: string,
    createUuid: () => string,
  ): Promise<string> {
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.metadata,
        async () => {
          const stored = await this.#database.metadata.get(key);
          if (stored !== undefined) {
            return idempotencyKeySchema.parse(stored.value);
          }

          const value = idempotencyKeySchema.parse(createUuid());
          await this.#database.metadata.add({ key, value });
          return value;
        },
      );
    } catch (error) {
      throw new AttemptOutboxStorageError(
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
      throw new AttemptOutboxStorageError(
        "Une fusion locale exige un espace compte.",
      );
    }

    try {
      return await this.#database.transaction(
        "rw",
        this.#database.metadata,
        this.#database.outbox,
        async (): Promise<T> => {
          const marker = parseStoredFusionMarker(
            await this.#database.metadata.get(FUSION_MARKER_KEY),
          );
          const anonymousSnapshot = parseStoredSnapshot(
            await this.#database.outbox.get(OUTBOX_KEY),
            ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
          );
          const accountSnapshot = parseStoredSnapshot(
            await this.#database.outbox.get(this.#outboxKey),
            this.#owner,
          );
          const result = update(marker, anonymousSnapshot, accountSnapshot);
          if (result === null) return result;
          await this.#database.outbox.bulkPut([
            {
              key: OUTBOX_KEY,
              snapshot: serializeAttemptOutboxSnapshot(
                result.anonymousSnapshot,
              ),
            },
            {
              key: this.#outboxKey,
              snapshot: serializeAttemptOutboxSnapshot(result.accountSnapshot),
            },
          ]);
          await this.#database.metadata.put({
            key: FUSION_MARKER_KEY,
            value: serializeAnonymousProgressFusionMarker(result.marker),
          });
          return result;
        },
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
        "La fusion locale n’a pas pu être enregistrée atomiquement.",
        { cause: error },
      );
    }
  }

  async #applySuccessWithFusion(
    response: AttemptBatchResponse,
  ): Promise<ApplyAttemptOutboxSuccessResult> {
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.metadata,
        this.#database.outbox,
        async () => {
          const accountSnapshot = parseStoredSnapshot(
            await this.#database.outbox.get(this.#outboxKey),
            this.#owner,
          );
          const marker = parseStoredFusionMarker(
            await this.#database.metadata.get(FUSION_MARKER_KEY),
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
            await this.#database.outbox.put({
              key: this.#outboxKey,
              snapshot: serializeAttemptOutboxSnapshot(applied.snapshot),
            });
            return applied;
          }

          const fused = applyFusionBatchSuccess({
            marker,
            anonymousSnapshot: parseStoredSnapshot(
              await this.#database.outbox.get(OUTBOX_KEY),
              ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
            ),
            accountSnapshot,
            response,
          });
          await this.#database.outbox.bulkPut([
            {
              key: OUTBOX_KEY,
              snapshot: serializeAttemptOutboxSnapshot(fused.anonymousSnapshot),
            },
            {
              key: this.#outboxKey,
              snapshot: serializeAttemptOutboxSnapshot(fused.accountSnapshot),
            },
          ]);
          await this.#database.metadata.put({
            key: FUSION_MARKER_KEY,
            value: serializeAnonymousProgressFusionMarker(fused.marker),
          });
          return {
            snapshot: fused.accountSnapshot,
            requiresDeviceRegistration: fused.requiresDeviceRegistration,
          };
        },
      );
    } catch (error) {
      if (error instanceof AttemptOutboxStorageError) throw error;
      throw new AttemptOutboxStorageError(
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
