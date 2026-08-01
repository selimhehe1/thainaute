import { z } from "zod";

import {
  MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES,
  MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES,
  applyAttemptOutboxSuccess,
  attemptOutboxSnapshotSchema,
  type AttemptOutboxEntry,
  type AttemptOutboxSnapshot,
} from "./outbox";
import {
  attemptBatchResponseSchema,
  attemptSubmissionSchema,
  type AttemptBatchResponse,
  type ValidatedAttemptSubmission,
} from "./contracts";

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z.iso
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());

/**
 * Un snapshot v3 peut contenir 1 000 tentatives pending et 200 résultats
 * terminaux. La fusion les journalise toutes, puis la capacité pending de la
 * cible décide si la copie peut être appliquée sans perte.
 */
export const MAX_ANONYMOUS_PROGRESS_FUSION_ATTEMPTS =
  MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES + MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES;

export const anonymousProgressFusionConsentSchema = z.strictObject({
  accepted: z.literal(true),
  consentedAt: utcIsoTimestampSchema,
});

const awaitingServerAcknowledgementMarkerSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    status: z.literal("awaiting_server_ack"),
    fusionId: canonicalUuidSchema,
    targetUserId: canonicalUuidSchema,
    accountDeviceId: canonicalUuidSchema,
    consentedAt: utcIsoTimestampSchema,
    submissions: z
      .array(attemptSubmissionSchema)
      .max(MAX_ANONYMOUS_PROGRESS_FUSION_ATTEMPTS),
    acknowledgedEventIds: z
      .array(canonicalUuidSchema)
      .max(MAX_ANONYMOUS_PROGRESS_FUSION_ATTEMPTS),
  })
  .superRefine((marker, context) => {
    const seenEventIds = new Set<string>();

    marker.submissions.forEach((submission, index) => {
      if (submission.deviceId !== marker.accountDeviceId) {
        context.addIssue({
          code: "custom",
          message:
            "Chaque tentative fusionnée doit utiliser le device du compte.",
          path: ["submissions", index, "deviceId"],
        });
      }

      if (seenEventIds.has(submission.eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque eventId doit être unique dans une fusion.",
          path: ["submissions", index, "eventId"],
        });
      }
      seenEventIds.add(submission.eventId);

      const previous = marker.submissions[index - 1];
      if (
        previous !== undefined &&
        compareSubmissions(previous, submission) >= 0
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Les tentatives fusionnées doivent être triées par answeredAt puis eventId.",
          path: ["submissions", index],
        });
      }
    });

    const acknowledgedEventIds = new Set<string>();
    let previousAcknowledgedIndex = -1;
    marker.acknowledgedEventIds.forEach((eventId, index) => {
      const submissionIndex = marker.submissions.findIndex(
        (submission) => submission.eventId === eventId,
      );
      if (submissionIndex === -1) {
        context.addIssue({
          code: "custom",
          message: "Un accusé doit référencer une tentative de la fusion.",
          path: ["acknowledgedEventIds", index],
        });
      }
      if (acknowledgedEventIds.has(eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque accusé de fusion doit être unique.",
          path: ["acknowledgedEventIds", index],
        });
      }
      if (submissionIndex <= previousAcknowledgedIndex) {
        context.addIssue({
          code: "custom",
          message:
            "Les accusés doivent suivre l’ordre canonique des tentatives.",
          path: ["acknowledgedEventIds", index],
        });
      }
      acknowledgedEventIds.add(eventId);
      previousAcknowledgedIndex = submissionIndex;
    });
  });

const completedMarkerSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    status: z.literal("completed"),
    fusionId: canonicalUuidSchema,
    targetUserId: canonicalUuidSchema,
    accountDeviceId: canonicalUuidSchema,
    consentedAt: utcIsoTimestampSchema,
    completedAt: utcIsoTimestampSchema,
    eventIds: z
      .array(canonicalUuidSchema)
      .max(MAX_ANONYMOUS_PROGRESS_FUSION_ATTEMPTS),
  })
  .superRefine((marker, context) => {
    const seenEventIds = new Set<string>();
    marker.eventIds.forEach((eventId, index) => {
      if (seenEventIds.has(eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque eventId doit être unique dans une fusion terminée.",
          path: ["eventIds", index],
        });
      }
      seenEventIds.add(eventId);
    });
  });

/** Marqueur durable partagé par IndexedDB et SQLite pour reprendre un crash. */
export const anonymousProgressFusionMarkerSchema = z.discriminatedUnion(
  "status",
  [awaitingServerAcknowledgementMarkerSchema, completedMarkerSchema],
);

export type AnonymousProgressFusionConsent = z.infer<
  typeof anonymousProgressFusionConsentSchema
>;
export type AnonymousProgressFusionMarker = z.infer<
  typeof anonymousProgressFusionMarkerSchema
>;
export type AwaitingAnonymousProgressFusionMarker = z.infer<
  typeof awaitingServerAcknowledgementMarkerSchema
>;

export interface StartAnonymousProgressFusionInput {
  /** Un seul marqueur actif est autorisé par installation. */
  readonly existingMarker: AnonymousProgressFusionMarker | null;
  readonly fusionId: string;
  readonly consent: AnonymousProgressFusionConsent;
  readonly anonymousSnapshot: AttemptOutboxSnapshot;
  readonly accountSnapshot: AttemptOutboxSnapshot;
  readonly accountDeviceId: string;
}

export interface ResumeAnonymousProgressFusionInput {
  readonly marker: AnonymousProgressFusionMarker;
  readonly anonymousSnapshot: AttemptOutboxSnapshot;
  readonly accountSnapshot: AttemptOutboxSnapshot;
}

export interface CompleteAnonymousProgressFusionInput extends ResumeAnonymousProgressFusionInput {
  readonly completedAt: string;
}

export interface ApplyAnonymousProgressFusionBatchSuccessInput extends ResumeAnonymousProgressFusionInput {
  readonly response: AttemptBatchResponse;
}

export interface PendingAnonymousProgressFusionState {
  readonly marker: AwaitingAnonymousProgressFusionMarker;
  readonly anonymousSnapshot: AttemptOutboxSnapshot;
  readonly accountSnapshot: AttemptOutboxSnapshot;
}

export interface CompletedAnonymousProgressFusionState {
  readonly marker: Extract<
    AnonymousProgressFusionMarker,
    { readonly status: "completed" }
  >;
  readonly anonymousSnapshot: AttemptOutboxSnapshot;
  readonly accountSnapshot: AttemptOutboxSnapshot;
}

export interface AppliedAnonymousProgressFusionBatchState extends PendingAnonymousProgressFusionState {
  readonly requiresDeviceRegistration: boolean;
}

export class AnonymousProgressFusionOwnerError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AnonymousProgressFusionOwnerError";
  }
}

export class AnonymousProgressFusionAlreadyActiveError extends Error {
  public readonly fusionId: string;

  public constructor(fusionId: string) {
    super("Une fusion de progression attend déjà son accusé serveur.");
    this.name = "AnonymousProgressFusionAlreadyActiveError";
    this.fusionId = fusionId;
  }
}

export class AnonymousProgressFusionAlreadyCompletedError extends Error {
  public readonly fusionId: string;

  public constructor(fusionId: string) {
    super("Cette fusion de progression est déjà terminée.");
    this.name = "AnonymousProgressFusionAlreadyCompletedError";
    this.fusionId = fusionId;
  }
}

export class AnonymousProgressFusionEventCollisionError extends Error {
  public readonly eventId: string;

  public constructor(eventId: string) {
    super(
      `L’eventId ${eventId} existe dans le compte avec une autre soumission.`,
    );
    this.name = "AnonymousProgressFusionEventCollisionError";
    this.eventId = eventId;
  }
}

export class AnonymousProgressFusionCapacityError extends Error {
  public readonly pendingCount: number;
  public readonly additionalCount: number;

  public constructor(pendingCount: number, additionalCount: number) {
    super(
      "La progression du compte n’a pas assez de capacité locale pour une fusion atomique.",
    );
    this.name = "AnonymousProgressFusionCapacityError";
    this.pendingCount = pendingCount;
    this.additionalCount = additionalCount;
  }
}

export class AnonymousProgressFusionNotAcknowledgedError extends Error {
  public readonly eventIds: readonly string[];

  public constructor(eventIds: readonly string[]) {
    super(
      "La fusion ne peut pas être terminée avant l’accusé serveur de toutes les tentatives.",
    );
    this.name = "AnonymousProgressFusionNotAcknowledgedError";
    this.eventIds = [...eventIds];
  }
}

function compareSubmissions(
  left: ValidatedAttemptSubmission,
  right: ValidatedAttemptSubmission,
): number {
  const timestampDifference =
    Date.parse(left.answeredAt) - Date.parse(right.answeredAt);

  return timestampDifference === 0
    ? left.eventId.localeCompare(right.eventId)
    : timestampDifference;
}

function submissionsAreEqual(
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

function parseFusionSnapshots(
  anonymousInput: AttemptOutboxSnapshot,
  accountInput: AttemptOutboxSnapshot,
): {
  readonly anonymousSnapshot: AttemptOutboxSnapshot;
  readonly accountSnapshot: AttemptOutboxSnapshot;
} {
  const anonymousSnapshot = attemptOutboxSnapshotSchema.parse(anonymousInput);
  const accountSnapshot = attemptOutboxSnapshotSchema.parse(accountInput);

  if (anonymousSnapshot.owner.kind !== "anonymous") {
    throw new AnonymousProgressFusionOwnerError(
      "La source d’une fusion doit appartenir à l’espace anonyme.",
    );
  }
  if (accountSnapshot.owner.kind !== "account") {
    throw new AnonymousProgressFusionOwnerError(
      "La cible d’une fusion doit appartenir à un compte.",
    );
  }

  return { anonymousSnapshot, accountSnapshot };
}

function assertMarkerTargetsAccount(
  marker: AnonymousProgressFusionMarker,
  accountSnapshot: AttemptOutboxSnapshot,
): void {
  if (
    accountSnapshot.owner.kind !== "account" ||
    accountSnapshot.owner.userId !== marker.targetUserId
  ) {
    throw new AnonymousProgressFusionOwnerError(
      "Le marqueur de fusion ne cible pas ce compte.",
    );
  }
}

function mergePendingSubmissionsIntoAccount(
  accountSnapshot: AttemptOutboxSnapshot,
  submissions: readonly ValidatedAttemptSubmission[],
): AttemptOutboxSnapshot {
  const entriesByEventId = new Map(
    accountSnapshot.entries.map(
      (entry) => [entry.submission.eventId, entry] as const,
    ),
  );
  const additions: AttemptOutboxEntry[] = [];

  for (const submission of submissions) {
    const existing = entriesByEventId.get(submission.eventId);
    if (existing === undefined) {
      additions.push({ status: "pending", submission });
      continue;
    }
    if (!submissionsAreEqual(existing.submission, submission)) {
      throw new AnonymousProgressFusionEventCollisionError(submission.eventId);
    }
  }

  const pendingCount = accountSnapshot.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  if (pendingCount + additions.length > MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES) {
    throw new AnonymousProgressFusionCapacityError(
      pendingCount,
      additions.length,
    );
  }

  return attemptOutboxSnapshotSchema.parse({
    ...accountSnapshot,
    entries: [...accountSnapshot.entries, ...additions].sort((left, right) =>
      compareSubmissions(left.submission, right.submission),
    ),
  });
}

function assertAccountEntriesDoNotCollide(
  accountSnapshot: AttemptOutboxSnapshot,
  submissions: readonly ValidatedAttemptSubmission[],
): void {
  const entriesByEventId = new Map(
    accountSnapshot.entries.map(
      (entry) => [entry.submission.eventId, entry] as const,
    ),
  );

  for (const submission of submissions) {
    const existing = entriesByEventId.get(submission.eventId);
    if (
      existing !== undefined &&
      !submissionsAreEqual(existing.submission, submission)
    ) {
      throw new AnonymousProgressFusionEventCollisionError(submission.eventId);
    }
  }
}

function checkpointMarker(
  marker: AwaitingAnonymousProgressFusionMarker,
  additionalEventIds: ReadonlySet<string>,
): AwaitingAnonymousProgressFusionMarker {
  const acknowledgedEventIds = new Set(marker.acknowledgedEventIds);
  for (const eventId of additionalEventIds) acknowledgedEventIds.add(eventId);

  return awaitingServerAcknowledgementMarkerSchema.parse({
    ...marker,
    acknowledgedEventIds: marker.submissions
      .filter(({ eventId }) => acknowledgedEventIds.has(eventId))
      .map(({ eventId }) => eventId),
  });
}

function applyPendingFusion(
  markerInput: AwaitingAnonymousProgressFusionMarker,
  anonymousInput: AttemptOutboxSnapshot,
  accountInput: AttemptOutboxSnapshot,
): PendingAnonymousProgressFusionState {
  const marker = awaitingServerAcknowledgementMarkerSchema.parse(markerInput);
  const { anonymousSnapshot, accountSnapshot } = parseFusionSnapshots(
    anonymousInput,
    accountInput,
  );
  assertMarkerTargetsAccount(marker, accountSnapshot);
  assertAccountEntriesDoNotCollide(accountSnapshot, marker.submissions);

  const acknowledgedEventIds = new Set(marker.acknowledgedEventIds);
  const mergedAccountSnapshot = mergePendingSubmissionsIntoAccount(
    accountSnapshot,
    marker.submissions.filter(
      ({ eventId }) => !acknowledgedEventIds.has(eventId),
    ),
  );
  const mergedEntriesByEventId = new Map(
    mergedAccountSnapshot.entries.map(
      (entry) => [entry.submission.eventId, entry] as const,
    ),
  );
  const checkpointedMarker = checkpointMarker(
    marker,
    new Set(
      marker.submissions
        .filter(
          ({ eventId }) =>
            mergedEntriesByEventId.get(eventId)?.status === "synced",
        )
        .map(({ eventId }) => eventId),
    ),
  );

  return {
    marker: checkpointedMarker,
    anonymousSnapshot: attemptOutboxSnapshotSchema.parse({
      ...anonymousSnapshot,
      // Une clé créée sous l’identité anonyme ne doit jamais être réutilisée.
      inFlight: null,
    }),
    accountSnapshot: mergedAccountSnapshot,
  };
}

/**
 * Commence une fusion après consentement explicite. Le marqueur et les deux
 * snapshots retournés doivent être persistés dans une même transaction locale.
 */
export function startAnonymousProgressFusion(
  input: StartAnonymousProgressFusionInput,
): PendingAnonymousProgressFusionState {
  const consent = anonymousProgressFusionConsentSchema.parse(input.consent);
  const fusionId = canonicalUuidSchema.parse(input.fusionId);
  const accountDeviceId = canonicalUuidSchema.parse(input.accountDeviceId);
  const existingMarker =
    input.existingMarker === null
      ? null
      : anonymousProgressFusionMarkerSchema.parse(input.existingMarker);

  if (existingMarker?.status === "awaiting_server_ack") {
    throw new AnonymousProgressFusionAlreadyActiveError(
      existingMarker.fusionId,
    );
  }

  const { anonymousSnapshot, accountSnapshot } = parseFusionSnapshots(
    input.anonymousSnapshot,
    input.accountSnapshot,
  );
  if (accountSnapshot.owner.kind !== "account") {
    // Le garde de parseFusionSnapshots rend cette branche impossible, mais le
    // narrowing TypeScript reste local et explicite.
    throw new AnonymousProgressFusionOwnerError(
      "La cible d’une fusion doit appartenir à un compte.",
    );
  }

  const marker = awaitingServerAcknowledgementMarkerSchema.parse({
    schemaVersion: 1,
    status: "awaiting_server_ack",
    fusionId,
    targetUserId: accountSnapshot.owner.userId,
    accountDeviceId,
    consentedAt: consent.consentedAt,
    submissions: anonymousSnapshot.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => ({
        ...submission,
        // eventId et answeredAt restent strictement immuables.
        deviceId: accountDeviceId,
      })),
    acknowledgedEventIds: [],
  });

  return applyPendingFusion(marker, anonymousSnapshot, accountSnapshot);
}

/** Rejoue exactement le marqueur durable après interruption ou redémarrage. */
export function resumeAnonymousProgressFusion(
  input: ResumeAnonymousProgressFusionInput,
): PendingAnonymousProgressFusionState {
  const marker = anonymousProgressFusionMarkerSchema.parse(input.marker);
  if (marker.status === "completed") {
    throw new AnonymousProgressFusionAlreadyCompletedError(marker.fusionId);
  }

  return applyPendingFusion(
    marker,
    input.anonymousSnapshot,
    input.accountSnapshot,
  );
}

/**
 * Applique une réponse 2xx et son checkpoint de fusion dans une seule valeur à
 * persister. Les accusés restent ainsi connus même si l'outbox compacte aussitôt
 * les résultats terminaux les plus anciens.
 */
export function applyAnonymousProgressFusionBatchSuccess(
  input: ApplyAnonymousProgressFusionBatchSuccessInput,
): AppliedAnonymousProgressFusionBatchState {
  const marker = anonymousProgressFusionMarkerSchema.parse(input.marker);
  if (marker.status === "completed") {
    throw new AnonymousProgressFusionAlreadyCompletedError(marker.fusionId);
  }

  const { anonymousSnapshot, accountSnapshot } = parseFusionSnapshots(
    input.anonymousSnapshot,
    input.accountSnapshot,
  );
  assertMarkerTargetsAccount(marker, accountSnapshot);
  assertAccountEntriesDoNotCollide(accountSnapshot, marker.submissions);

  const response = attemptBatchResponseSchema.parse(input.response);
  const applied = applyAttemptOutboxSuccess(accountSnapshot, response);
  const fusionEventIds = new Set(
    marker.submissions.map(({ eventId }) => eventId),
  );
  const terminalByResponse = new Set(
    response.results
      .filter(
        (result) =>
          fusionEventIds.has(result.eventId) &&
          (result.status !== "rejected" ||
            result.code !== "device_not_registered"),
      )
      .map(({ eventId }) => eventId),
  );
  const terminalRejections = new Map(
    response.results.flatMap((result) =>
      result.status === "rejected" &&
      result.code !== "device_not_registered" &&
      fusionEventIds.has(result.eventId)
        ? ([[result.eventId, result.code]] as const)
        : [],
    ),
  );
  const checkpointedAnonymousSnapshot = attemptOutboxSnapshotSchema.parse({
    ...anonymousSnapshot,
    entries: anonymousSnapshot.entries.map((entry): AttemptOutboxEntry => {
      const code = terminalRejections.get(entry.submission.eventId);
      return code === undefined
        ? entry
        : { status: "rejected", submission: entry.submission, code };
    }),
  });
  const checkpointedMarker = checkpointMarker(marker, terminalByResponse);
  const checkpointed = applyPendingFusion(
    checkpointedMarker,
    checkpointedAnonymousSnapshot,
    applied.snapshot,
  );

  return {
    ...checkpointed,
    requiresDeviceRegistration: applied.requiresDeviceRegistration,
  };
}

/**
 * Termine la fusion après une réponse terminale pour chaque événement. Les
 * sources acceptées sont supprimées ; les rejets restent localement classés
 * avec leur motif afin de ne jamais être réessayés ou effacés silencieusement.
 */
export function completeAnonymousProgressFusion(
  input: CompleteAnonymousProgressFusionInput,
): CompletedAnonymousProgressFusionState {
  const marker = anonymousProgressFusionMarkerSchema.parse(input.marker);
  const { anonymousSnapshot, accountSnapshot } = parseFusionSnapshots(
    input.anonymousSnapshot,
    input.accountSnapshot,
  );
  assertMarkerTargetsAccount(marker, accountSnapshot);

  if (marker.status === "completed") {
    return { marker, anonymousSnapshot, accountSnapshot };
  }

  const checkpointed = applyPendingFusion(
    marker,
    anonymousSnapshot,
    accountSnapshot,
  );
  const checkpointedMarker = checkpointed.marker;
  const acknowledgedEventIds = new Set(checkpointedMarker.acknowledgedEventIds);
  const unacknowledgedEventIds = checkpointedMarker.submissions
    .filter(({ eventId }) => !acknowledgedEventIds.has(eventId))
    .map(({ eventId }) => eventId);

  if (unacknowledgedEventIds.length > 0) {
    throw new AnonymousProgressFusionNotAcknowledgedError(
      unacknowledgedEventIds,
    );
  }

  const submissionsByEventId = new Map(
    checkpointedMarker.submissions.map(
      (submission) => [submission.eventId, submission] as const,
    ),
  );
  for (const entry of anonymousSnapshot.entries) {
    const fused = submissionsByEventId.get(entry.submission.eventId);
    if (
      fused !== undefined &&
      !submissionsAreEqual(
        { ...entry.submission, deviceId: marker.accountDeviceId },
        fused,
      )
    ) {
      throw new AnonymousProgressFusionEventCollisionError(
        entry.submission.eventId,
      );
    }
  }

  const eventIds = checkpointedMarker.submissions.map(({ eventId }) => eventId);
  const completedMarker = completedMarkerSchema.parse({
    schemaVersion: 1,
    status: "completed",
    fusionId: checkpointedMarker.fusionId,
    targetUserId: checkpointedMarker.targetUserId,
    accountDeviceId: checkpointedMarker.accountDeviceId,
    consentedAt: checkpointedMarker.consentedAt,
    completedAt: input.completedAt,
    eventIds,
  });
  const fusedEventIds = new Set(eventIds);

  return {
    marker: completedMarker,
    anonymousSnapshot: attemptOutboxSnapshotSchema.parse({
      ...checkpointed.anonymousSnapshot,
      entries: checkpointed.anonymousSnapshot.entries.filter(
        (entry) =>
          !fusedEventIds.has(entry.submission.eventId) ||
          entry.status === "rejected",
      ),
      inFlight: null,
    }),
    accountSnapshot: checkpointed.accountSnapshot,
  };
}

export function serializeAnonymousProgressFusionMarker(
  marker: AnonymousProgressFusionMarker,
): string {
  return JSON.stringify(anonymousProgressFusionMarkerSchema.parse(marker));
}

export function deserializeAnonymousProgressFusionMarker(
  serialized: string,
): AnonymousProgressFusionMarker {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new Error("Le marqueur de fusion n’est pas un JSON valide.", {
      cause: error,
    });
  }

  return anonymousProgressFusionMarkerSchema.parse(candidate);
}
