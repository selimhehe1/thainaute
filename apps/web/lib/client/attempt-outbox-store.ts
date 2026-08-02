"use client";

import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  applyAnonymousProgressFusionBatchSuccess as applyFusionBatchSuccess,
  applyAttemptOutboxSuccess,
  applyProgressSnapshot,
  attemptOutboxSnapshotSchema,
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
  type AttemptOutboxEntry,
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
const DEFAULT_LEARNING_DATABASE_NAME = "thainaute-learning-v1";
const DEFAULT_DEMO_DATABASE_NAME = "thainaute-demo-v1";
const LEGACY_DEMO_FIXTURE_QUARANTINE_KEY = "legacy-demo-fixture-quarantine-v1";
const LEGACY_DEMO_FIXTURE_EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const LEGACY_DEMO_FIXTURE_CONTENT_VERSION_ID =
  "10000000-0000-4000-8000-000000000002";
const LEGACY_DEMO_FIXTURE_OPTION_IDS = new Set([
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
]);
const LEGACY_DEMO_FIXTURE_ALGORITHM_VERSION = "srs-v0";

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

export interface LegacyDemoFixtureMigrationOptions {
  readonly learningDatabaseName?: string;
  readonly demoDatabaseName?: string;
}

export type LegacyDemoFixtureMigrationResult =
  | {
      readonly status: "not_needed";
      readonly copiedEntries: 0;
      readonly deduplicatedEntries: 0;
    }
  | {
      readonly status: "migrated";
      readonly copiedEntries: number;
      readonly deduplicatedEntries: number;
    };

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

function parseStoredFixtureQuarantine(
  row: OutboxRow | undefined,
): AttemptOutboxSnapshot {
  if (row === undefined) {
    return createAttemptOutboxSnapshot(ANONYMOUS_ATTEMPT_OUTBOX_OWNER);
  }

  try {
    const snapshot = deserializeAttemptOutboxSnapshot(row.snapshot);
    const isDedicatedSnapshot =
      attemptOutboxOwnersAreEqual(
        snapshot.owner,
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      ) &&
      snapshot.syncRevision === 0 &&
      snapshot.authoritativeStates.length === 0 &&
      snapshot.inFlight === null &&
      snapshot.entries.length > 0 &&
      snapshot.entries.every(isLegacyDemoFixtureEntry);
    if (!isDedicatedSnapshot) {
      throw new Error("La quarantaine contient un état inattendu.");
    }
    return snapshot;
  } catch (error) {
    throw new AttemptOutboxStorageError(
      "La quarantaine de la fixture historique est illisible et a été conservée.",
      { cause: error },
    );
  }
}

function isLegacyDemoFixtureSubmission(
  submission: ValidatedAttemptSubmission,
): boolean {
  return (
    submission.exerciseId === LEGACY_DEMO_FIXTURE_EXERCISE_ID &&
    submission.contentVersionId === LEGACY_DEMO_FIXTURE_CONTENT_VERSION_ID &&
    LEGACY_DEMO_FIXTURE_OPTION_IDS.has(submission.selectedOptionId) &&
    submission.algorithmVersion === LEGACY_DEMO_FIXTURE_ALGORITHM_VERSION
  );
}

function isLegacyDemoFixtureEntry(entry: AttemptOutboxEntry): boolean {
  return isLegacyDemoFixtureSubmission(entry.submission);
}

function assertFusionIsNotContaminated(
  marker: AnonymousProgressFusionMarker | null,
): void {
  if (
    marker?.status === "awaiting_server_ack" &&
    marker.submissions.some(isLegacyDemoFixtureSubmission)
  ) {
    throw new AttemptOutboxStorageError(
      "La fusion locale contient une fixture technique et a été bloquée sans modification.",
    );
  }
}

function assertSnapshotHasNoLegacyDemoFixture(
  snapshot: AttemptOutboxSnapshot,
): void {
  if (snapshot.entries.some(isLegacyDemoFixtureEntry)) {
    throw new AttemptOutboxStorageError(
      "La progression anonyme contient une fixture technique et doit être isolée avant la fusion.",
    );
  }
}

function attemptPayloadsAreEqual(
  left: ValidatedAttemptSubmission,
  right: ValidatedAttemptSubmission,
): boolean {
  return (
    left.eventId === right.eventId &&
    left.deviceId === right.deviceId &&
    left.exerciseId === right.exerciseId &&
    left.selectedOptionId === right.selectedOptionId &&
    left.answeredAt === right.answeredAt &&
    left.durationMs === right.durationMs &&
    left.contentVersionId === right.contentVersionId &&
    left.algorithmVersion === right.algorithmVersion
  );
}

function attemptEntriesAreEqual(
  left: AttemptOutboxEntry,
  right: AttemptOutboxEntry,
): boolean {
  if (!attemptPayloadsAreEqual(left.submission, right.submission)) return false;
  if (left.status === "pending") {
    return right.status === "pending" && left.retryReason === right.retryReason;
  }
  if (left.status === "synced") {
    return (
      right.status === "synced" &&
      left.serverStatus === right.serverStatus &&
      left.rating === right.rating
    );
  }
  return right.status === "rejected" && left.code === right.code;
}

function compareOutboxEntries(
  left: AttemptOutboxEntry,
  right: AttemptOutboxEntry,
): number {
  const timestampDifference =
    Date.parse(left.submission.answeredAt) -
    Date.parse(right.submission.answeredAt);
  return timestampDifference === 0
    ? left.submission.eventId.localeCompare(right.submission.eventId)
    : timestampDifference;
}

function assertMigrationCanMutate(
  snapshot: AttemptOutboxSnapshot,
  marker: AnonymousProgressFusionMarker | null,
  fixtureEntries: readonly AttemptOutboxEntry[],
  databaseLabel: "learning" | "demo",
): void {
  const fixtureEventIds = new Set(
    fixtureEntries.map(({ submission }) => submission.eventId),
  );
  if (
    snapshot.inFlight?.eventIds.some((eventId) => fixtureEventIds.has(eventId))
  ) {
    throw new AttemptOutboxStorageError(
      `La migration de la fixture attend la fin du lot ${databaseLabel} en vol.`,
    );
  }
  if (
    marker?.status === "awaiting_server_ack" &&
    marker.submissions.some(isLegacyDemoFixtureSubmission)
  ) {
    throw new AttemptOutboxStorageError(
      `La migration de la fixture attend la fin de la fusion ${databaseLabel}.`,
    );
  }
}

function mergeFixtureEntries(
  destination: AttemptOutboxSnapshot,
  sourceEntries: readonly AttemptOutboxEntry[],
): {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly copiedEntries: number;
  readonly deduplicatedEntries: number;
} {
  const mergedEntries = [...destination.entries];
  const destinationByEventId = new Map(
    destination.entries.map((entry) => [entry.submission.eventId, entry]),
  );
  let copiedEntries = 0;
  let deduplicatedEntries = 0;

  for (const sourceEntry of sourceEntries) {
    const existing = destinationByEventId.get(sourceEntry.submission.eventId);
    if (existing !== undefined) {
      if (
        !attemptPayloadsAreEqual(existing.submission, sourceEntry.submission)
      ) {
        throw new AttemptOutboxStorageError(
          "La fixture historique entre en conflit avec une tentative demo existante.",
        );
      }
      if (!attemptEntriesAreEqual(existing, sourceEntry)) {
        throw new AttemptOutboxStorageError(
          "Le payload de fixture existe avec un état de synchronisation différent.",
        );
      }
      deduplicatedEntries += 1;
      continue;
    }

    mergedEntries.push(sourceEntry);
    destinationByEventId.set(sourceEntry.submission.eventId, sourceEntry);
    copiedEntries += 1;
  }

  return {
    snapshot: attemptOutboxSnapshotSchema.parse({
      ...destination,
      entries: mergedEntries.sort(compareOutboxEntries),
    }),
    copiedEntries,
    deduplicatedEntries,
  };
}

function fixturePayloadSetsAreEqual(
  left: readonly AttemptOutboxEntry[],
  right: readonly AttemptOutboxEntry[],
): boolean {
  if (left.length !== right.length) return false;
  const rightByEventId = new Map(
    right.map((entry) => [entry.submission.eventId, entry]),
  );
  return left.every((entry) => {
    const matching = rightByEventId.get(entry.submission.eventId);
    return matching !== undefined && attemptEntriesAreEqual(entry, matching);
  });
}

async function inspectLegacyFixtureSource(
  database: LearningDatabase,
): Promise<readonly AttemptOutboxEntry[]> {
  return database.transaction(
    "r",
    database.metadata,
    database.outbox,
    async () => {
      const learningSnapshot = parseStoredSnapshot(
        await database.outbox.get(OUTBOX_KEY),
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      );
      const fixtureEntries = learningSnapshot.entries.filter(
        isLegacyDemoFixtureEntry,
      );
      const quarantineRow = await database.outbox.get(
        LEGACY_DEMO_FIXTURE_QUARANTINE_KEY,
      );
      if (fixtureEntries.length === 0 && quarantineRow === undefined) return [];

      const marker = parseStoredFusionMarker(
        await database.metadata.get(FUSION_MARKER_KEY),
      );
      const quarantine = parseStoredFixtureQuarantine(quarantineRow);
      const migrationEntries = mergeFixtureEntries(quarantine, fixtureEntries)
        .snapshot.entries;
      assertMigrationCanMutate(
        learningSnapshot,
        marker,
        migrationEntries,
        "learning",
      );
      return migrationEntries;
    },
  );
}

async function assertDemoCanReceiveFixture(
  database: LearningDatabase,
  fixtureEntries: readonly AttemptOutboxEntry[],
): Promise<void> {
  await database.transaction(
    "r",
    database.metadata,
    database.outbox,
    async () => {
      const snapshot = parseStoredSnapshot(
        await database.outbox.get(OUTBOX_KEY),
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      );
      const marker = parseStoredFusionMarker(
        await database.metadata.get(FUSION_MARKER_KEY),
      );
      assertMigrationCanMutate(snapshot, marker, fixtureEntries, "demo");
      mergeFixtureEntries(snapshot, fixtureEntries);
    },
  );
}

async function quarantineLegacyFixtureSource(
  database: LearningDatabase,
): Promise<readonly AttemptOutboxEntry[]> {
  return database.transaction(
    "rw",
    database.metadata,
    database.outbox,
    async () => {
      const learningRow = await database.outbox.get(OUTBOX_KEY);
      const learningSnapshot = parseStoredSnapshot(
        learningRow,
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      );
      const fixtureEntries = learningSnapshot.entries.filter(
        isLegacyDemoFixtureEntry,
      );
      const quarantineRow = await database.outbox.get(
        LEGACY_DEMO_FIXTURE_QUARANTINE_KEY,
      );
      if (fixtureEntries.length === 0 && quarantineRow === undefined) return [];

      const marker = parseStoredFusionMarker(
        await database.metadata.get(FUSION_MARKER_KEY),
      );
      const quarantine = parseStoredFixtureQuarantine(quarantineRow);
      const quarantined = mergeFixtureEntries(quarantine, fixtureEntries);
      assertMigrationCanMutate(
        learningSnapshot,
        marker,
        quarantined.snapshot.entries,
        "learning",
      );

      if (fixtureEntries.length > 0) {
        const retainedSnapshot = attemptOutboxSnapshotSchema.parse({
          ...learningSnapshot,
          entries: learningSnapshot.entries.filter(
            (entry) => !isLegacyDemoFixtureEntry(entry),
          ),
        });
        await database.outbox.bulkPut([
          {
            key: OUTBOX_KEY,
            snapshot: serializeAttemptOutboxSnapshot(retainedSnapshot),
          },
          {
            key: LEGACY_DEMO_FIXTURE_QUARANTINE_KEY,
            snapshot: serializeAttemptOutboxSnapshot(quarantined.snapshot),
          },
        ]);
      }

      return quarantined.snapshot.entries;
    },
  );
}

async function copyFixtureToDemo(
  database: LearningDatabase,
  fixtureEntries: readonly AttemptOutboxEntry[],
): Promise<{
  readonly copiedEntries: number;
  readonly deduplicatedEntries: number;
}> {
  return database.transaction(
    "rw",
    database.metadata,
    database.outbox,
    async () => {
      const snapshot = parseStoredSnapshot(
        await database.outbox.get(OUTBOX_KEY),
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      );
      const marker = parseStoredFusionMarker(
        await database.metadata.get(FUSION_MARKER_KEY),
      );
      assertMigrationCanMutate(snapshot, marker, fixtureEntries, "demo");
      const merged = mergeFixtureEntries(snapshot, fixtureEntries);
      await database.outbox.put({
        key: OUTBOX_KEY,
        snapshot: serializeAttemptOutboxSnapshot(merged.snapshot),
      });
      return {
        copiedEntries: merged.copiedEntries,
        deduplicatedEntries: merged.deduplicatedEntries,
      };
    },
  );
}

async function clearFixtureQuarantine(
  database: LearningDatabase,
  expectedEntries: readonly AttemptOutboxEntry[],
): Promise<void> {
  await database.transaction(
    "rw",
    database.metadata,
    database.outbox,
    async () => {
      const quarantineRow = await database.outbox.get(
        LEGACY_DEMO_FIXTURE_QUARANTINE_KEY,
      );
      if (quarantineRow === undefined) return;

      const learningSnapshot = parseStoredSnapshot(
        await database.outbox.get(OUTBOX_KEY),
        ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      );
      const marker = parseStoredFusionMarker(
        await database.metadata.get(FUSION_MARKER_KEY),
      );
      assertMigrationCanMutate(
        learningSnapshot,
        marker,
        expectedEntries,
        "learning",
      );
      if (learningSnapshot.entries.some(isLegacyDemoFixtureEntry)) {
        throw new AttemptOutboxStorageError(
          "Une nouvelle tentative fixture doit être quarantainée avant le nettoyage.",
        );
      }

      const quarantine = parseStoredFixtureQuarantine(quarantineRow);
      if (!fixturePayloadSetsAreEqual(quarantine.entries, expectedEntries)) {
        throw new AttemptOutboxStorageError(
          "La quarantaine a changé pendant la migration et a été conservée.",
        );
      }
      await database.outbox.delete(LEGACY_DEMO_FIXTURE_QUARANTINE_KEY);
    },
  );
}

/**
 * IndexedDB limite une transaction aux object stores d'une seule base. La
 * fixture est donc d'abord neutralisée atomiquement dans une quarantaine de la
 * base learning, puis copiée dans demo. Une interruption laisse la copie
 * source, la quarantaine ou les deux : le rejeu strict termine sans perte et
 * la fusion de compte ne lit jamais la clé de quarantaine.
 */
export async function migrateLegacyDemoFixtureAttempts(
  options: LegacyDemoFixtureMigrationOptions = {},
): Promise<LegacyDemoFixtureMigrationResult> {
  const learningDatabase = openDatabase(
    options.learningDatabaseName ?? DEFAULT_LEARNING_DATABASE_NAME,
  );
  const demoDatabase = openDatabase(
    options.demoDatabaseName ?? DEFAULT_DEMO_DATABASE_NAME,
  );

  try {
    const inspectedEntries = await inspectLegacyFixtureSource(learningDatabase);
    if (inspectedEntries.length === 0) {
      return {
        status: "not_needed",
        copiedEntries: 0,
        deduplicatedEntries: 0,
      };
    }

    // Le préflight laisse encore la source principale intacte en cas de conflit
    // déjà présent dans demo. La transaction de copie revalide après quarantaine.
    await assertDemoCanReceiveFixture(demoDatabase, inspectedEntries);
    const quarantinedEntries =
      await quarantineLegacyFixtureSource(learningDatabase);
    if (quarantinedEntries.length === 0) {
      return {
        status: "not_needed",
        copiedEntries: 0,
        deduplicatedEntries: 0,
      };
    }

    const destinationResult = await copyFixtureToDemo(
      demoDatabase,
      quarantinedEntries,
    );
    await clearFixtureQuarantine(learningDatabase, quarantinedEntries);
    return {
      status: "migrated",
      copiedEntries: destinationResult.copiedEntries,
      deduplicatedEntries: destinationResult.deduplicatedEntries,
    };
  } catch (error) {
    if (error instanceof AttemptOutboxStorageError) throw error;
    throw new AttemptOutboxStorageError(
      "La fixture historique n'a pas pu être déplacée sans risque.",
      { cause: error },
    );
  } finally {
    learningDatabase.close();
    demoDatabase.close();
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
    databaseName = DEFAULT_LEARNING_DATABASE_NAME,
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
      return await this.#database.transaction(
        "r",
        this.#database.metadata,
        this.#database.outbox,
        async () => {
          assertFusionIsNotContaminated(
            parseStoredFusionMarker(
              await this.#database.metadata.get(FUSION_MARKER_KEY),
            ),
          );
          return parseStoredSnapshot(
            await this.#database.outbox.get(this.#outboxKey),
            this.#owner,
          );
        },
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
      const marker = parseStoredFusionMarker(
        await this.#database.metadata.get(FUSION_MARKER_KEY),
      );
      assertFusionIsNotContaminated(marker);
      return marker;
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
    return this.#mutateFusion((marker, anonymousSnapshot, accountSnapshot) => {
      assertFusionIsNotContaminated(marker);
      assertSnapshotHasNoLegacyDemoFixture(anonymousSnapshot);
      return startFusion({
        existingMarker: marker,
        fusionId: input.fusionId,
        consent: { accepted: true, consentedAt: input.consentedAt },
        anonymousSnapshot,
        accountSnapshot,
        accountDeviceId: input.accountDeviceId,
      });
    });
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
      assertFusionIsNotContaminated(marker);
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
      assertFusionIsNotContaminated(marker);
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
          assertFusionIsNotContaminated(marker);
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
          assertFusionIsNotContaminated(marker);
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

          assertFusionIsNotContaminated(marker);
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
        this.#database.metadata,
        this.#database.outbox,
        async () => {
          assertFusionIsNotContaminated(
            parseStoredFusionMarker(
              await this.#database.metadata.get(FUSION_MARKER_KEY),
            ),
          );
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
