import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  AttemptOutboxCapacityError,
  ContentReportOutboxAckMismatchError,
  ContentReportOutboxCapacityError,
  ContentReportOutboxCollisionError,
  ContentReportOutboxRejectionMismatchError,
  ackContentReport,
  applyAnonymousProgressFusionBatchSuccess as applyFusionBatchSuccess,
  applyAttemptOutboxSuccess,
  applyProgressSnapshot,
  attemptOutboxSnapshotSchema,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  completeAnonymousProgressFusion as completeFusion,
  createContentReportOutbox,
  deriveDeletedAccountSubjectFingerprint,
  deriveAccountDeviceId,
  deserializeAnonymousProgressFusionMarker,
  deserializeAttemptOutboxSnapshot,
  deserializeContentReportOutbox,
  discardRejectedContentReport,
  enqueueContentReport,
  enqueueAttempt,
  idempotencyKeySchema,
  prepareAttemptOutboxBatch,
  rejectAttemptOutboxInFlightIdempotencyConflict,
  rejectContentReport,
  resumeAnonymousProgressFusion as resumeFusion,
  resumeAttemptOutboxAfterDeviceRegistration,
  serializeAttemptOutboxSnapshot,
  serializeAnonymousProgressFusionMarker,
  serializeContentReportOutbox,
  startAnonymousProgressFusion as startFusion,
  type ApplyAttemptOutboxSuccessResult,
  type AnonymousProgressFusionMarker,
  type AttemptBatchResponse,
  type AttemptOutboxEntry,
  type AttemptOutboxOwner,
  type AttemptOutboxSnapshot,
  type CompletedAnonymousProgressFusionState,
  type ContentReportOutboxEntry,
  type ContentReportOutboxRejection,
  type ContentReportOutboxSnapshot,
  type ContentReportRejectionReason,
  type ContentReportResponse,
  type PendingAnonymousProgressFusionState,
  type PrepareAttemptOutboxResult,
  type ProgressSnapshotResponse,
  type Sha256Hex,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

const OUTBOX_KEY = "attempts-v1";
const CONTENT_REPORT_OUTBOX_KEY = "content-reports-v1";
const DEVICE_KEY = "device_id";
const INSTALLATION_KEY = "installation_id_v1";
const LEGACY_MIGRATION_KEY = "legacy_attempt_journal_migrated_v1";
const LEGACY_DEMO_NAMESPACE_REPAIR_KEY = "legacy_demo_namespace_repaired_v1";
const FUSION_MARKER_KEY = "anonymous_progress_fusion_v1";
const DELETED_ACCOUNT_TOMBSTONE_PREFIX = "deleted_account_subject_v1:";
const DELETED_ACCOUNT_TOMBSTONE_VALUE = "deleted";
const SQLITE_BUSY_RETRY_COUNT = 3;
const DEMO_OUTBOX_KEY = `demo:${OUTBOX_KEY}`;
const LEGACY_FIXTURE_EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const LEGACY_FIXTURE_CONTENT_VERSION_ID =
  "10000000-0000-4000-8000-000000000002";
const LEGACY_FIXTURE_OPTION_IDS = new Set([
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
]);
const LEGACY_FIXTURE_ALGORITHM_VERSION = "srs-v0";

type MobileAttemptOutboxNamespace = "learning" | "demo";

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

export class MobileAccountDataTombstonedError extends MobileAttemptOutboxStorageError {
  public constructor() {
    super(
      "Ce compte a été supprimé de cet appareil et ne peut plus être réécrit.",
    );
    this.name = "MobileAccountDataTombstonedError";
  }
}

export interface ExpectedMobileAccountPurgeState {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly fusionMarker: AnonymousProgressFusionMarker | null;
  readonly contentReportOutbox: ContentReportOutboxSnapshot;
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

function parseStoredContentReportOutbox(
  row: OutboxRow | null,
): ContentReportOutboxSnapshot {
  return row === null
    ? createContentReportOutbox()
    : deserializeContentReportOutbox(row.snapshot);
}

async function readContentReportOutbox(
  database: SQLiteDatabase,
  outboxKey: string,
): Promise<ContentReportOutboxSnapshot> {
  return parseStoredContentReportOutbox(
    await database.getFirstAsync<OutboxRow>(
      "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
      outboxKey,
    ),
  );
}

async function writeContentReportOutbox(
  database: SQLiteDatabase,
  outboxKey: string,
  snapshot: ContentReportOutboxSnapshot,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO attempt_outbox_state (key, snapshot, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (key) DO UPDATE SET
       snapshot = excluded.snapshot,
       updated_at = excluded.updated_at`,
    outboxKey,
    serializeContentReportOutbox(snapshot),
    new Date().toISOString(),
  );
}

function parseStoredFusionMarker(
  row: MetadataRow | null,
): AnonymousProgressFusionMarker | null {
  if (row === null) return null;
  return deserializeAnonymousProgressFusionMarker(row.value);
}

function validFusionMarkerTargetsAccount(
  row: MetadataRow | null,
  userId: string,
): boolean {
  try {
    return parseStoredFusionMarker(row)?.targetUserId === userId;
  } catch {
    // Une frontière de suppression ne doit pas être annulée par un marqueur
    // global illisible. Il reste intact pour éviter toute perte anonyme.
    return false;
  }
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

function isProvenLegacyFixtureSubmission(
  submission: ValidatedAttemptSubmission,
): boolean {
  return (
    submission.exerciseId === LEGACY_FIXTURE_EXERCISE_ID &&
    submission.contentVersionId === LEGACY_FIXTURE_CONTENT_VERSION_ID &&
    LEGACY_FIXTURE_OPTION_IDS.has(submission.selectedOptionId) &&
    submission.algorithmVersion === LEGACY_FIXTURE_ALGORITHM_VERSION
  );
}

function submissionsAreExactlyEqual(
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

function entriesAreExactlyEqual(
  left: AttemptOutboxEntry,
  right: AttemptOutboxEntry,
): boolean {
  if (!submissionsAreExactlyEqual(left.submission, right.submission)) {
    return false;
  }
  if (left.status === "pending") {
    return right.status === "pending" && left.retryReason === right.retryReason;
  }
  if (left.status === "synced") {
    return (
      right.status === "synced" &&
      left.serverStatus === right.serverStatus &&
      left.rating === right.rating &&
      left.feedbackFr === right.feedbackFr
    );
  }
  return right.status === "rejected" && left.code === right.code;
}

function compareAttemptEntries(
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

interface IsolatedLegacyFixtureSnapshots {
  readonly demoSnapshot: AttemptOutboxSnapshot;
  readonly learningSnapshot: AttemptOutboxSnapshot;
}

function mergeExactEntries(
  destination: AttemptOutboxSnapshot,
  sourceEntries: readonly AttemptOutboxEntry[],
): AttemptOutboxSnapshot {
  const destinationByEventId = new Map(
    destination.entries.map(
      (entry) => [entry.submission.eventId, entry] as const,
    ),
  );
  const additions: AttemptOutboxEntry[] = [];

  for (const sourceEntry of sourceEntries) {
    const existing = destinationByEventId.get(sourceEntry.submission.eventId);
    if (existing === undefined) {
      additions.push(sourceEntry);
      destinationByEventId.set(sourceEntry.submission.eventId, sourceEntry);
      continue;
    }
    if (
      !submissionsAreExactlyEqual(existing.submission, sourceEntry.submission)
    ) {
      throw new Error("Un eventId existe déjà avec un autre payload.");
    }
    if (!entriesAreExactlyEqual(existing, sourceEntry)) {
      throw new Error("Un payload identique existe avec un autre état.");
    }
  }

  return attemptOutboxSnapshotSchema.parse({
    ...destination,
    entries: [...destination.entries, ...additions].sort(compareAttemptEntries),
  });
}

function recoverMisroutedLegacyDemoEntries(input: {
  readonly demoSnapshot: AttemptOutboxSnapshot;
  readonly learningSnapshot: AttemptOutboxSnapshot;
}): IsolatedLegacyFixtureSnapshots {
  const misplacedEntries = input.demoSnapshot.entries.filter(
    ({ submission }) => !isProvenLegacyFixtureSubmission(submission),
  );
  if (misplacedEntries.length === 0) return input;

  const misplacedEventIds = new Set(
    misplacedEntries.map(({ submission }) => submission.eventId),
  );
  if (
    input.demoSnapshot.inFlight?.eventIds.some((eventId) =>
      misplacedEventIds.has(eventId),
    )
  ) {
    throw new Error(
      "Une tentative mal rangée appartient à un lot démo en vol.",
    );
  }

  return {
    learningSnapshot: mergeExactEntries(
      input.learningSnapshot,
      misplacedEntries,
    ),
    demoSnapshot: attemptOutboxSnapshotSchema.parse({
      ...input.demoSnapshot,
      entries: input.demoSnapshot.entries.filter(({ submission }) =>
        isProvenLegacyFixtureSubmission(submission),
      ),
    }),
  };
}

function assertFusionMarkerContainsNoLegacyFixture(
  marker: AnonymousProgressFusionMarker | null,
): void {
  if (
    marker?.status === "awaiting_server_ack" &&
    marker.submissions.some(isProvenLegacyFixtureSubmission)
  ) {
    throw new Error(
      "Une tentative de fixture participe déjà à une fusion active.",
    );
  }
}

function isolateLegacyFixtureSnapshots(input: {
  readonly demoSnapshot: AttemptOutboxSnapshot;
  readonly learningSnapshot: AttemptOutboxSnapshot;
  readonly fusionMarker: AnonymousProgressFusionMarker | null;
}): IsolatedLegacyFixtureSnapshots {
  const fixtureEntries = input.learningSnapshot.entries.filter(
    ({ submission }) => isProvenLegacyFixtureSubmission(submission),
  );
  const fixtureEventIds = new Set(
    fixtureEntries.map(({ submission }) => submission.eventId),
  );

  assertFusionMarkerContainsNoLegacyFixture(input.fusionMarker);
  if (
    fixtureEntries.length > 0 &&
    input.learningSnapshot.inFlight?.eventIds.some((eventId) =>
      fixtureEventIds.has(eventId),
    )
  ) {
    throw new Error(
      "Une tentative de fixture appartient à un lot synchronisable en vol.",
    );
  }
  if (fixtureEntries.length === 0) {
    return {
      demoSnapshot: input.demoSnapshot,
      learningSnapshot: input.learningSnapshot,
    };
  }

  return {
    demoSnapshot: mergeExactEntries(input.demoSnapshot, fixtureEntries),
    learningSnapshot: attemptOutboxSnapshotSchema.parse({
      ...input.learningSnapshot,
      entries: input.learningSnapshot.entries.filter(
        ({ submission }) => !fixtureEventIds.has(submission.eventId),
      ),
    }),
  };
}

/** Adaptateur SQLite transactionnel du snapshot partagé `@thainaute/sync`. */
export class MobileAttemptOutboxStore {
  readonly #database: SQLiteDatabase;
  readonly #owner: AttemptOutboxOwner;
  readonly #outboxKey: string;
  readonly #contentReportOutboxKey: string | null;
  readonly #deviceKey: string;
  readonly #legacyMigrationKey: string;
  readonly #namespace: MobileAttemptOutboxNamespace;
  readonly #sha256Hex: Sha256Hex | null;
  #accountTombstoneKeyPromise: Promise<string> | null = null;

  public constructor(
    database: SQLiteDatabase,
    ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
    namespace: MobileAttemptOutboxNamespace = "learning",
    sha256Hex?: Sha256Hex,
  ) {
    this.#database = database;
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    this.#namespace = namespace;
    const scope = attemptOutboxOwnerStorageKey(this.#owner);
    const prefix = namespace === "learning" ? "" : "demo:";
    this.#outboxKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${OUTBOX_KEY}`
        : `${prefix}${OUTBOX_KEY}:${scope}`;
    this.#contentReportOutboxKey =
      this.#owner.kind === "account" && namespace === "learning"
        ? `${CONTENT_REPORT_OUTBOX_KEY}:${scope}`
        : null;
    this.#deviceKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${DEVICE_KEY}`
        : `${prefix}${DEVICE_KEY}:${scope}`;
    this.#legacyMigrationKey =
      this.#owner.kind === "anonymous"
        ? `${prefix}${LEGACY_MIGRATION_KEY}`
        : `${prefix}${LEGACY_MIGRATION_KEY}:${scope}`;
    if (this.#owner.kind === "account" && sha256Hex === undefined) {
      throw new MobileAttemptOutboxStorageError(
        "Une empreinte SHA-256 est requise pour protéger les données du compte.",
      );
    }
    this.#sha256Hex =
      this.#owner.kind === "account" ? (sha256Hex ?? null) : null;
  }

  public async read(): Promise<AttemptOutboxSnapshot> {
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        await this.#assertAccountWritable(this.#database, tombstoneKey);
        assertFusionMarkerContainsNoLegacyFixture(
          parseStoredFusionMarker(
            await this.#database.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              FUSION_MARKER_KEY,
            ),
          ),
        );
        return readSnapshot(this.#database, this.#outboxKey, this.#owner);
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "Le journal local est illisible et n'a pas été écrasé.",
        { cause: error },
      );
    }
  }

  /** File de signalements strictement réservée au namespace du compte. */
  public async readContentReports(): Promise<ContentReportOutboxSnapshot> {
    const outboxKey = this.#requireContentReportOutboxKey();
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        await this.#assertAccountWritable(this.#database, tombstoneKey);
        return readContentReportOutbox(this.#database, outboxKey);
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "La file locale de signalements est illisible et n'a pas été écrasée.",
        { cause: error },
      );
    }
  }

  public enqueueContentReport(
    entry: ContentReportOutboxEntry,
  ): Promise<ContentReportOutboxSnapshot> {
    return this.#replaceContentReports((snapshot) =>
      enqueueContentReport(snapshot, entry),
    );
  }

  public ackContentReport(
    entry: ContentReportOutboxEntry,
    response: ContentReportResponse,
  ): Promise<ContentReportOutboxSnapshot> {
    return this.#replaceContentReports((snapshot) =>
      ackContentReport(snapshot, entry, response),
    );
  }

  public rejectContentReport(
    entry: ContentReportOutboxEntry,
    rejection: {
      readonly reason: ContentReportRejectionReason;
      readonly rejectedAt: string;
    },
  ): Promise<ContentReportOutboxSnapshot> {
    return this.#replaceContentReports((snapshot) =>
      rejectContentReport(snapshot, entry, rejection),
    );
  }

  public discardRejectedContentReport(
    rejection: ContentReportOutboxRejection,
  ): Promise<ContentReportOutboxSnapshot> {
    return this.#replaceContentReports((snapshot) =>
      discardRejectedContentReport(snapshot, rejection),
    );
  }

  public async migrateLegacyJournal(): Promise<AttemptOutboxSnapshot> {
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let migrated = createAttemptOutboxSnapshot(this.#owner);
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
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
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "L'ancien journal local n'a pas pu être migré.",
        { cause: error },
      );
    }
  }

  /**
   * Isole les tentatives de la fixture écrites par les premières versions dans
   * l'outbox anonyme synchronisable. Les deux snapshots sont remplacés dans la
   * même transaction SQLite; une collision, une corruption ou un lot en vol ne
   * provoque donc jamais d'effacement partiel.
   */
  public async migrateLegacyFixtureAttemptsToDemo(): Promise<AttemptOutboxSnapshot> {
    if (this.#owner.kind !== "anonymous" || this.#namespace !== "demo") {
      throw new MobileAttemptOutboxStorageError(
        "La migration de fixture exige l'espace démo anonyme.",
      );
    }

    try {
      // Le journal brut historique n'avait aucun namespace. Il doit d'abord
      // rejoindre l'outbox synchronisable; seule la signature de fixture
      // prouvée peut ensuite être déplacée vers demo.
      await new MobileAttemptOutboxStore(this.#database).migrateLegacyJournal();
      return await serializeDatabaseOperation(this.#database, async () => {
        let demoSnapshot: AttemptOutboxSnapshot | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const repairMarker = await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              LEGACY_DEMO_NAMESPACE_REPAIR_KEY,
            );
            if (repairMarker !== null && repairMarker.value !== "done") {
              throw new Error("Marqueur de réparation démo invalide.");
            }
            let sourceSnapshots = {
              demoSnapshot: await readSnapshot(
                transaction,
                DEMO_OUTBOX_KEY,
                ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
              ),
              learningSnapshot: await readSnapshot(
                transaction,
                OUTBOX_KEY,
                ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
              ),
            };
            if (repairMarker === null) {
              const legacyDemoMigrationMarker =
                await transaction.getFirstAsync<MetadataRow>(
                  "SELECT value FROM local_metadata WHERE key = ?",
                  this.#legacyMigrationKey,
                );
              if (
                legacyDemoMigrationMarker !== null &&
                legacyDemoMigrationMarker.value !== "done"
              ) {
                throw new Error("Marqueur de migration démo invalide.");
              }
              if (legacyDemoMigrationMarker?.value === "done") {
                sourceSnapshots =
                  recoverMisroutedLegacyDemoEntries(sourceSnapshots);
              }
            }
            const isolated = isolateLegacyFixtureSnapshots({
              ...sourceSnapshots,
              fusionMarker: parseStoredFusionMarker(
                await transaction.getFirstAsync<MetadataRow>(
                  "SELECT value FROM local_metadata WHERE key = ?",
                  FUSION_MARKER_KEY,
                ),
              ),
            });
            await writeSnapshot(
              transaction,
              OUTBOX_KEY,
              isolated.learningSnapshot,
            );
            await writeSnapshot(
              transaction,
              DEMO_OUTBOX_KEY,
              isolated.demoSnapshot,
            );
            if (repairMarker === null) {
              await transaction.runAsync(
                "INSERT INTO local_metadata (key, value) VALUES (?, ?)",
                LEGACY_DEMO_NAMESPACE_REPAIR_KEY,
                "done",
              );
            }
            demoSnapshot = isolated.demoSnapshot;
          },
        );
        if (demoSnapshot === undefined) {
          throw new Error(
            "La migration de fixture n'a renvoyé aucun résultat.",
          );
        }
        return demoSnapshot;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "Les anciennes tentatives de fixture n'ont pas pu être isolées.",
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

  public rejectInFlightIdempotencyConflict(): Promise<AttemptOutboxSnapshot> {
    return this.#replace((snapshot) =>
      rejectAttemptOutboxInFlightIdempotencyConflict(snapshot),
    );
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
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        await this.#assertAccountWritable(this.#database, tombstoneKey);
        const marker = parseStoredFusionMarker(
          await this.#database.getFirstAsync<MetadataRow>(
            "SELECT value FROM local_metadata WHERE key = ?",
            FUSION_MARKER_KEY,
          ),
        );
        assertFusionMarkerContainsNoLegacyFixture(marker);
        return marker;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
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
    return this.#mutateFusion(
      (marker, anonymousSnapshot, accountSnapshot) =>
        startFusion({
          existingMarker: marker,
          fusionId: input.fusionId,
          consent: { accepted: true, consentedAt: input.consentedAt },
          anonymousSnapshot,
          accountSnapshot,
          accountDeviceId: input.accountDeviceId,
        }),
      true,
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
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      await serializeDatabaseOperation(this.#database, () =>
        this.#database.withExclusiveTransactionAsync(async (transaction) => {
          await this.#assertAccountWritable(transaction, tombstoneKey);
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
          if (this.#contentReportOutboxKey !== null) {
            await transaction.runAsync(
              "DELETE FROM attempt_outbox_state WHERE key = ?",
              this.#contentReportOutboxKey,
            );
          }
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

  public async isAccountTombstoned(): Promise<boolean> {
    if (this.#owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "La lecture du tombstone exige un espace compte.",
      );
    }
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      if (tombstoneKey === null) return false;
      return await serializeDatabaseOperation(
        this.#database,
        async () =>
          (await this.#database.getFirstAsync<MetadataRow>(
            "SELECT value FROM local_metadata WHERE key = ?",
            tombstoneKey,
          )) !== null,
      );
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      throw new MobileAttemptOutboxStorageError(
        "Le tombstone local du compte est indisponible.",
        { cause: error },
      );
    }
  }

  /**
   * Scelle définitivement le sujet puis purge son namespace dans la même
   * transaction SQLite. Le tombstone opaque est conservé sans UUID brut.
   */
  public async tombstoneAndPurgeAccountData(): Promise<void> {
    const owner = this.#owner;
    if (owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "Le tombstone de suppression exige un espace compte.",
      );
    }

    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      if (tombstoneKey === null) {
        throw new MobileAttemptOutboxStorageError(
          "L’empreinte de suppression du compte est indisponible.",
        );
      }
      await serializeDatabaseOperation(this.#database, () =>
        this.#database.withExclusiveTransactionAsync(async (transaction) => {
          const removeFusionMarker = validFusionMarkerTargetsAccount(
            await transaction.getFirstAsync<MetadataRow>(
              "SELECT value FROM local_metadata WHERE key = ?",
              FUSION_MARKER_KEY,
            ),
            owner.userId,
          );
          await transaction.runAsync(
            `INSERT INTO local_metadata (key, value) VALUES (?, ?)
             ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
            tombstoneKey,
            DELETED_ACCOUNT_TOMBSTONE_VALUE,
          );
          await transaction.runAsync(
            "DELETE FROM attempt_outbox_state WHERE key = ?",
            this.#outboxKey,
          );
          if (this.#contentReportOutboxKey !== null) {
            await transaction.runAsync(
              "DELETE FROM attempt_outbox_state WHERE key = ?",
              this.#contentReportOutboxKey,
            );
          }
          await transaction.runAsync(
            "DELETE FROM local_metadata WHERE key IN (?, ?)",
            this.#deviceKey,
            this.#legacyMigrationKey,
          );
          if (removeFusionMarker) {
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
        "Le compte local n’a pas pu être scellé et supprimé atomiquement.",
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
    const expectedContentReports =
      expectedState === undefined
        ? undefined
        : serializeContentReportOutbox(expectedState.contentReportOutbox);

    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let purged = false;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
            const row = await transaction.getFirstAsync<OutboxRow>(
              "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
              this.#outboxKey,
            );
            const snapshot = parseStoredSnapshot(row, owner);
            const contentReportOutboxKey =
              this.#requireContentReportOutboxKey();
            const contentReportRow = await transaction.getFirstAsync<OutboxRow>(
              "SELECT snapshot FROM attempt_outbox_state WHERE key = ?",
              contentReportOutboxKey,
            );
            const contentReportOutbox =
              parseStoredContentReportOutbox(contentReportRow);
            const marker = parseStoredFusionMarker(
              await transaction.getFirstAsync<MetadataRow>(
                "SELECT value FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              ),
            );
            const unsettled =
              snapshot.inFlight !== null ||
              snapshot.entries.some(({ status }) => status === "pending") ||
              contentReportOutbox.entries.length > 0 ||
              (marker?.status === "awaiting_server_ack" &&
                marker.targetUserId === owner.userId);
            const markerValue =
              marker === null
                ? null
                : serializeAnonymousProgressFusionMarker(marker);
            const matchesExpected =
              expectedSnapshot !== undefined &&
              serializeAttemptOutboxSnapshot(snapshot) === expectedSnapshot &&
              markerValue === expectedMarker &&
              serializeContentReportOutbox(contentReportOutbox) ===
                expectedContentReports;
            const alreadyPurged =
              row === null &&
              contentReportRow === null &&
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
              "DELETE FROM attempt_outbox_state WHERE key = ?",
              contentReportOutboxKey,
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

  async #resolveAccountTombstoneKey(): Promise<string | null> {
    if (this.#owner.kind !== "account") return null;
    if (this.#sha256Hex === null) {
      throw new MobileAttemptOutboxStorageError(
        "L’empreinte SHA-256 du compte est indisponible.",
      );
    }
    this.#accountTombstoneKeyPromise ??= deriveDeletedAccountSubjectFingerprint(
      {
        userId: this.#owner.userId,
        sha256Hex: this.#sha256Hex,
      },
    ).then(
      (fingerprint) => `${DELETED_ACCOUNT_TOMBSTONE_PREFIX}${fingerprint}`,
    );
    return this.#accountTombstoneKeyPromise;
  }

  async #assertAccountWritable(
    database: SQLiteDatabase,
    tombstoneKey: string | null,
  ): Promise<void> {
    if (
      tombstoneKey !== null &&
      (await database.getFirstAsync<MetadataRow>(
        "SELECT value FROM local_metadata WHERE key = ?",
        tombstoneKey,
      )) !== null
    ) {
      throw new MobileAccountDataTombstonedError();
    }
  }

  async #getOrCreateMetadataUuid(
    key: string,
    createUuid: () => string,
  ): Promise<string> {
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let value = "";
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
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
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
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
    isolateLegacyFixture = false,
  ): Promise<T> {
    if (this.#owner.kind !== "account") {
      throw new MobileAttemptOutboxStorageError(
        "Une fusion locale exige un espace compte.",
      );
    }

    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: T | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
            const marker = parseStoredFusionMarker(
              await transaction.getFirstAsync<MetadataRow>(
                "SELECT value FROM local_metadata WHERE key = ?",
                FUSION_MARKER_KEY,
              ),
            );
            assertFusionMarkerContainsNoLegacyFixture(marker);
            let anonymousSnapshot = await readSnapshot(
              transaction,
              OUTBOX_KEY,
              ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
            );
            if (
              isolateLegacyFixture &&
              anonymousSnapshot.entries.some(({ submission }) =>
                isProvenLegacyFixtureSubmission(submission),
              )
            ) {
              const isolated = isolateLegacyFixtureSnapshots({
                demoSnapshot: await readSnapshot(
                  transaction,
                  DEMO_OUTBOX_KEY,
                  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
                ),
                learningSnapshot: anonymousSnapshot,
                fusionMarker: marker,
              });
              anonymousSnapshot = isolated.learningSnapshot;
              await writeSnapshot(
                transaction,
                DEMO_OUTBOX_KEY,
                isolated.demoSnapshot,
              );
            }
            const result = update(
              marker,
              anonymousSnapshot,
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
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: ApplyAttemptOutboxSuccessResult | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
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
            assertFusionMarkerContainsNoLegacyFixture(marker);
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

  #requireContentReportOutboxKey(): string {
    if (this.#contentReportOutboxKey === null) {
      throw new MobileAttemptOutboxStorageError(
        "Les signalements exigent le namespace d'un compte permanent.",
      );
    }
    return this.#contentReportOutboxKey;
  }

  async #replaceContentReports(
    update: (
      snapshot: ContentReportOutboxSnapshot,
    ) => ContentReportOutboxSnapshot,
  ): Promise<ContentReportOutboxSnapshot> {
    const outboxKey = this.#requireContentReportOutboxKey();
    try {
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: ContentReportOutboxSnapshot | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
            const next = update(
              await readContentReportOutbox(transaction, outboxKey),
            );
            await writeContentReportOutbox(transaction, outboxKey, next);
            returned = next;
          },
        );
        if (returned === undefined) {
          throw new Error(
            "La transaction de signalement n'a renvoyé aucun résultat.",
          );
        }
        return returned;
      });
    } catch (error) {
      if (error instanceof MobileAttemptOutboxStorageError) throw error;
      if (
        error instanceof ContentReportOutboxCapacityError ||
        error instanceof ContentReportOutboxCollisionError ||
        error instanceof ContentReportOutboxAckMismatchError ||
        error instanceof ContentReportOutboxRejectionMismatchError
      ) {
        throw new MobileAttemptOutboxStorageError(error.message, {
          cause: error,
        });
      }
      throw new MobileAttemptOutboxStorageError(
        "La file locale de signalements n'a pas pu être mise à jour.",
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
      const tombstoneKey = await this.#resolveAccountTombstoneKey();
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: T | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            await this.#assertAccountWritable(transaction, tombstoneKey);
            assertFusionMarkerContainsNoLegacyFixture(
              parseStoredFusionMarker(
                await transaction.getFirstAsync<MetadataRow>(
                  "SELECT value FROM local_metadata WHERE key = ?",
                  FUSION_MARKER_KEY,
                ),
              ),
            );
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
