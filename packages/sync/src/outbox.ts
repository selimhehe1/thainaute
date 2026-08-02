import { z } from "zod";

import { SKILL_DIMENSIONS } from "@thainaute/domain";

import {
  MAX_ATTEMPTS_PER_BATCH,
  attemptBatchResponseSchema,
  attemptBatchSchema,
  attemptFeedbackSchema,
  attemptRejectionCodeSchema,
  attemptSubmissionSchema,
  idempotencyKeySchema,
  learnerItemStateSchema,
  type AttemptBatch,
  type AttemptBatchResponse,
  type AttemptRejectionCode,
  type LearnerItemState,
  type ValidatedAttemptSubmission,
} from "./contracts";

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const attemptRatingSchema = z.union([z.literal(0), z.literal(1)]);
const legacyAttemptSubmissionSchema = attemptSubmissionSchema.extend({
  itemId: canonicalUuidSchema,
  skill: z.enum(SKILL_DIMENSIONS),
});

export const MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES = 1_000;
export const MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES = 200;
export const MAX_AUTHORITATIVE_LEARNER_STATES = 10_000;

export const attemptOutboxOwnerSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("anonymous") }),
  z.strictObject({
    kind: z.literal("account"),
    userId: canonicalUuidSchema,
  }),
]);

export type AttemptOutboxOwner = z.infer<typeof attemptOutboxOwnerSchema>;

export const ANONYMOUS_ATTEMPT_OUTBOX_OWNER = {
  kind: "anonymous",
} as const satisfies AttemptOutboxOwner;

export function attemptOutboxOwnerStorageKey(
  ownerInput: AttemptOutboxOwner,
): string {
  const owner = attemptOutboxOwnerSchema.parse(ownerInput);
  return owner.kind === "anonymous" ? "anonymous" : `account:${owner.userId}`;
}

export function attemptOutboxOwnersAreEqual(
  left: AttemptOutboxOwner,
  right: AttemptOutboxOwner,
): boolean {
  return (
    attemptOutboxOwnerStorageKey(left) === attemptOutboxOwnerStorageKey(right)
  );
}

const pendingAttemptOutboxEntrySchema = z.strictObject({
  status: z.literal("pending"),
  submission: attemptSubmissionSchema,
  retryReason: z.literal("device_not_registered").optional(),
});

const syncedAttemptOutboxEntrySchema = z.strictObject({
  status: z.literal("synced"),
  submission: attemptSubmissionSchema,
  serverStatus: z.enum(["accepted", "duplicate"]),
  rating: attemptRatingSchema,
  /** Optionnel pour relire les snapshots et réponses persistés avant feedback. */
  feedbackFr: attemptFeedbackSchema.optional(),
});

const rejectedAttemptOutboxEntrySchema = z.strictObject({
  status: z.literal("rejected"),
  submission: attemptSubmissionSchema,
  code: attemptRejectionCodeSchema,
});

export const attemptOutboxEntrySchema = z.discriminatedUnion("status", [
  pendingAttemptOutboxEntrySchema,
  syncedAttemptOutboxEntrySchema,
  rejectedAttemptOutboxEntrySchema,
]);

const legacyAttemptOutboxEntrySchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("pending"),
    submission: legacyAttemptSubmissionSchema,
    retryReason: z.literal("device_not_registered").optional(),
  }),
  z.strictObject({
    status: z.literal("synced"),
    submission: legacyAttemptSubmissionSchema,
    serverStatus: z.enum(["accepted", "duplicate"]),
    rating: attemptRatingSchema,
  }),
  z.strictObject({
    status: z.literal("rejected"),
    submission: legacyAttemptSubmissionSchema,
    code: attemptRejectionCodeSchema,
  }),
]);

export const attemptOutboxInFlightSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  eventIds: z.array(canonicalUuidSchema).min(1).max(MAX_ATTEMPTS_PER_BATCH),
});

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

function learnerStateKey(state: LearnerItemState): string {
  return `${state.itemId}\u0000${state.skill}`;
}

const authoritativeLearnerStatesSchema = z
  .array(learnerItemStateSchema)
  .max(MAX_AUTHORITATIVE_LEARNER_STATES)
  .superRefine((states, context) => {
    let previousKey: string | undefined;
    states.forEach((state, index) => {
      const key = learnerStateKey(state);
      if (previousKey !== undefined && key <= previousKey) {
        context.addIssue({
          code: "custom",
          message:
            "Les états autoritaires doivent être uniques et triés par itemId puis skill.",
          path: [index],
        });
      }
      previousKey = key;
    });
  });

export const attemptOutboxSnapshotSchema = z
  .strictObject({
    schemaVersion: z.literal(3),
    owner: attemptOutboxOwnerSchema,
    syncRevision: z.number().int().nonnegative(),
    authoritativeStates: authoritativeLearnerStatesSchema,
    entries: z.array(attemptOutboxEntrySchema),
    inFlight: attemptOutboxInFlightSchema.nullable(),
  })
  .superRefine((snapshot, context) => {
    const entriesByEventId = new Map<
      string,
      (typeof snapshot.entries)[number]
    >();

    snapshot.entries.forEach((entry, index) => {
      const { eventId } = entry.submission;
      if (entriesByEventId.has(eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque eventId doit être unique dans l’outbox.",
          path: ["entries", index, "submission", "eventId"],
        });
      }
      entriesByEventId.set(eventId, entry);

      const previous = snapshot.entries[index - 1];
      if (
        previous !== undefined &&
        compareSubmissions(previous.submission, entry.submission) >= 0
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Les entrées doivent être triées par answeredAt puis eventId.",
          path: ["entries", index],
        });
      }
    });

    const pendingCount = snapshot.entries.filter(
      ({ status }) => status === "pending",
    ).length;
    const terminalCount = snapshot.entries.length - pendingCount;
    if (pendingCount > MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES) {
      context.addIssue({
        code: "custom",
        message: "La capacité maximale des tentatives en attente est dépassée.",
        path: ["entries"],
      });
    }
    if (terminalCount > MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES) {
      context.addIssue({
        code: "custom",
        message:
          "La rétention maximale des tentatives terminales est dépassée.",
        path: ["entries"],
      });
    }

    if (snapshot.inFlight === null) return;

    const seenInFlightIds = new Set<string>();
    const pendingSubmissions: ValidatedAttemptSubmission[] = [];

    snapshot.inFlight.eventIds.forEach((eventId, index) => {
      if (seenInFlightIds.has(eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque eventId en vol doit être unique.",
          path: ["inFlight", "eventIds", index],
        });
      }
      seenInFlightIds.add(eventId);

      const entry = entriesByEventId.get(eventId);
      if (
        entry === undefined ||
        entry.status !== "pending" ||
        entry.retryReason !== undefined
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Un lot en vol doit référencer une entrée pending prête à envoyer.",
          path: ["inFlight", "eventIds", index],
        });
        return;
      }
      pendingSubmissions.push(entry.submission);
    });

    const canonicalEventIds = [...pendingSubmissions]
      .sort(compareSubmissions)
      .map((submission) => submission.eventId);

    if (
      canonicalEventIds.length === snapshot.inFlight.eventIds.length &&
      canonicalEventIds.some(
        (eventId, index) => eventId !== snapshot.inFlight?.eventIds[index],
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Le lot en vol doit suivre l’ordre canonique de l’outbox.",
        path: ["inFlight", "eventIds"],
      });
    }
  });

const legacyAttemptOutboxSnapshotV2Schema = z.strictObject({
  schemaVersion: z.literal(2),
  owner: attemptOutboxOwnerSchema,
  syncRevision: z.number().int().nonnegative(),
  authoritativeStates: authoritativeLearnerStatesSchema,
  entries: z.array(legacyAttemptOutboxEntrySchema),
  inFlight: attemptOutboxInFlightSchema.nullable(),
});

const legacyAttemptOutboxSnapshotV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  syncRevision: z.number().int().nonnegative(),
  entries: z.array(legacyAttemptOutboxEntrySchema),
  inFlight: attemptOutboxInFlightSchema.nullable(),
});

export type AttemptOutboxEntry = z.infer<typeof attemptOutboxEntrySchema>;
export type AttemptOutboxInFlight = z.infer<typeof attemptOutboxInFlightSchema>;
export type AttemptOutboxSnapshot = z.infer<typeof attemptOutboxSnapshotSchema>;

export interface PreparedAttemptOutboxBatch {
  readonly idempotencyKey: string;
  readonly batch: AttemptBatch;
}

export interface PrepareAttemptOutboxResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly prepared: PreparedAttemptOutboxBatch | null;
  readonly blockedReason: "device_registration" | null;
}

export interface ApplyAttemptOutboxSuccessResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly requiresDeviceRegistration: boolean;
}

export class AttemptOutboxEventCollisionError extends Error {
  public readonly eventId: string;

  public constructor(eventId: string) {
    super(`L’eventId ${eventId} existe déjà avec une autre soumission.`);
    this.name = "AttemptOutboxEventCollisionError";
    this.eventId = eventId;
  }
}

export class AttemptOutboxResponseMismatchError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AttemptOutboxResponseMismatchError";
  }
}

export class AttemptOutboxCapacityError extends Error {
  public constructor() {
    super(
      "Le journal hors ligne est plein. Reconnectez-vous avant de poursuivre.",
    );
    this.name = "AttemptOutboxCapacityError";
  }
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

function mergeAuthoritativeStates(
  current: readonly LearnerItemState[],
  received: readonly LearnerItemState[],
): readonly LearnerItemState[] {
  const merged = new Map(
    current.map((state) => [learnerStateKey(state), state] as const),
  );
  for (const state of received) merged.set(learnerStateKey(state), state);
  return [...merged.values()].sort((left, right) =>
    learnerStateKey(left).localeCompare(learnerStateKey(right)),
  );
}

function compactTerminalEntries(
  entries: readonly AttemptOutboxEntry[],
): readonly AttemptOutboxEntry[] {
  const terminal = entries.filter(({ status }) => status !== "pending");
  if (terminal.length <= MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES) return entries;

  const retainedIds = new Set(
    terminal
      .slice(-MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES)
      .map(({ submission }) => submission.eventId),
  );
  return entries.filter(
    (entry) =>
      entry.status === "pending" || retainedIds.has(entry.submission.eventId),
  );
}

function preparedBatchFromSnapshot(
  snapshot: AttemptOutboxSnapshot,
): PreparedAttemptOutboxBatch | null {
  if (snapshot.inFlight === null) return null;

  const entriesByEventId = new Map(
    snapshot.entries.map((entry) => [entry.submission.eventId, entry] as const),
  );
  const attempts = snapshot.inFlight.eventIds.map((eventId) => {
    const entry = entriesByEventId.get(eventId);
    if (
      entry === undefined ||
      entry.status !== "pending" ||
      entry.retryReason !== undefined
    ) {
      throw new AttemptOutboxResponseMismatchError(
        "Le lot en vol ne correspond plus aux entrées pending.",
      );
    }
    return entry.submission;
  });

  return {
    idempotencyKey: snapshot.inFlight.idempotencyKey,
    batch: attemptBatchSchema.parse({ attempts }),
  };
}

/** Snapshot vide, versionné et explicitement rattaché à un espace local. */
export function createAttemptOutboxSnapshot(
  ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
): AttemptOutboxSnapshot {
  return attemptOutboxSnapshotSchema.parse({
    schemaVersion: 3,
    owner: attemptOutboxOwnerSchema.parse(ownerInput),
    syncRevision: 0,
    authoritativeStates: [],
    entries: [],
    inFlight: null,
  });
}

/** Ajoute une soumission canonique, sans duplication ni perte silencieuse. */
export function enqueueAttempt(
  snapshotInput: AttemptOutboxSnapshot,
  submissionInput: ValidatedAttemptSubmission,
): AttemptOutboxSnapshot {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const submission = attemptSubmissionSchema.parse(submissionInput);
  const existing = snapshot.entries.find(
    (entry) => entry.submission.eventId === submission.eventId,
  );

  if (existing !== undefined) {
    if (submissionsAreEqual(existing.submission, submission)) return snapshot;
    throw new AttemptOutboxEventCollisionError(submission.eventId);
  }

  if (
    snapshot.entries.filter(({ status }) => status === "pending").length >=
    MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES
  ) {
    throw new AttemptOutboxCapacityError();
  }

  return attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: [
      ...snapshot.entries,
      { status: "pending" as const, submission },
    ].sort((left, right) =>
      compareSubmissions(left.submission, right.submission),
    ),
  });
}

/**
 * Prépare au plus 50 entrées. Un lot en vol est rejoué à l’identique. Après
 * `device_not_registered`, aucun retry ne part avant l’accusé d’inscription.
 */
export function prepareAttemptOutboxBatch(
  snapshotInput: AttemptOutboxSnapshot,
  candidateIdempotencyKey: string,
): PrepareAttemptOutboxResult {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const alreadyPrepared = preparedBatchFromSnapshot(snapshot);
  if (alreadyPrepared !== null) {
    return { snapshot, prepared: alreadyPrepared, blockedReason: null };
  }

  if (
    snapshot.entries.some(
      (entry) =>
        entry.status === "pending" &&
        entry.retryReason === "device_not_registered",
    )
  ) {
    return {
      snapshot,
      prepared: null,
      blockedReason: "device_registration",
    };
  }

  const pending = snapshot.entries
    .filter(
      (entry) => entry.status === "pending" && entry.retryReason === undefined,
    )
    .slice(0, MAX_ATTEMPTS_PER_BATCH);
  if (pending.length === 0) {
    return { snapshot, prepared: null, blockedReason: null };
  }

  const idempotencyKey = idempotencyKeySchema.parse(candidateIdempotencyKey);
  const nextSnapshot = attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    inFlight: {
      idempotencyKey,
      eventIds: pending.map((entry) => entry.submission.eventId),
    },
  });

  return {
    snapshot: nextSnapshot,
    prepared: preparedBatchFromSnapshot(nextSnapshot),
    blockedReason: null,
  };
}

/** Débloque uniquement les tentatives du device dont l’inscription a réussi. */
export function resumeAttemptOutboxAfterDeviceRegistration(
  snapshotInput: AttemptOutboxSnapshot,
  registeredDeviceIdInput: string,
): AttemptOutboxSnapshot {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const registeredDeviceId = canonicalUuidSchema.parse(registeredDeviceIdInput);
  return attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: snapshot.entries.map((entry) =>
      entry.status === "pending" &&
      entry.retryReason === "device_not_registered" &&
      entry.submission.deviceId === registeredDeviceId
        ? { status: "pending" as const, submission: entry.submission }
        : entry,
    ),
  });
}

/**
 * Applique atomiquement une réponse 2xx au lot en vol. Les projections serveur
 * font partie du snapshot persisté : aucun crash ne peut acquitter les events
 * tout en perdant l’état autoritaire correspondant.
 */
export function applyAttemptOutboxSuccess(
  snapshotInput: AttemptOutboxSnapshot,
  responseInput: AttemptBatchResponse,
): ApplyAttemptOutboxSuccessResult {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const response = attemptBatchResponseSchema.parse(responseInput);
  const inFlight = snapshot.inFlight;

  if (inFlight === null) {
    throw new AttemptOutboxResponseMismatchError(
      "Aucun lot en vol ne peut recevoir cette réponse.",
    );
  }

  if (response.results.length !== inFlight.eventIds.length) {
    throw new AttemptOutboxResponseMismatchError(
      "La réponse ne contient pas un résultat par tentative en vol.",
    );
  }

  response.results.forEach((result, index) => {
    if (result.eventId !== inFlight.eventIds[index]) {
      throw new AttemptOutboxResponseMismatchError(
        "L’ordre ou les eventId de la réponse divergent du lot en vol.",
      );
    }
  });

  const resultsByEventId = new Map(
    response.results.map((result) => [result.eventId, result] as const),
  );
  const entries = snapshot.entries.map((entry): AttemptOutboxEntry => {
    const result = resultsByEventId.get(entry.submission.eventId);
    if (result === undefined) return entry;

    if (result.status === "rejected") {
      if (result.code === "device_not_registered") {
        return {
          status: "pending",
          submission: entry.submission,
          retryReason: "device_not_registered",
        };
      }
      return {
        status: "rejected",
        submission: entry.submission,
        code: result.code satisfies AttemptRejectionCode,
      };
    }

    return {
      status: "synced",
      submission: entry.submission,
      serverStatus: result.status,
      rating: result.rating,
      ...(result.feedbackFr === undefined
        ? {}
        : { feedbackFr: result.feedbackFr }),
    };
  });
  const responseIsCurrent = response.syncRevision >= snapshot.syncRevision;
  const nextSnapshot = attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    syncRevision: Math.max(snapshot.syncRevision, response.syncRevision),
    authoritativeStates: responseIsCurrent
      ? mergeAuthoritativeStates(snapshot.authoritativeStates, response.states)
      : snapshot.authoritativeStates,
    entries: compactTerminalEntries(entries),
    inFlight: null,
  });

  return {
    snapshot: nextSnapshot,
    requiresDeviceRegistration: nextSnapshot.entries.some(
      (entry) =>
        entry.status === "pending" &&
        entry.retryReason === "device_not_registered",
    ),
  };
}

/**
 * Libère durablement un lot dont la clé est entrée en conflit avec un commit
 * serveur existant. Le même lot ne peut plus être rejoué sous cette clé ; les
 * entrées suivantes doivent néanmoins pouvoir continuer à se synchroniser.
 */
export function rejectAttemptOutboxInFlightIdempotencyConflict(
  snapshotInput: AttemptOutboxSnapshot,
): AttemptOutboxSnapshot {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const inFlight = snapshot.inFlight;
  if (inFlight === null) {
    throw new AttemptOutboxResponseMismatchError(
      "Aucun lot en vol ne peut recevoir ce conflit d’idempotence.",
    );
  }

  const inFlightIds = new Set(inFlight.eventIds);
  const entries = snapshot.entries.map((entry): AttemptOutboxEntry =>
    inFlightIds.has(entry.submission.eventId)
      ? {
          status: "rejected",
          submission: entry.submission,
          code: "invalid_submission",
        }
      : entry,
  );

  return attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: compactTerminalEntries(entries),
    inFlight: null,
  });
}

/** JSON canonique validé avant écriture dans IndexedDB ou SQLite. */
export function serializeAttemptOutboxSnapshot(
  snapshot: AttemptOutboxSnapshot,
): string {
  return JSON.stringify(attemptOutboxSnapshotSchema.parse(snapshot));
}

/**
 * Lecture stricte avec migration v1/v2 vers le contrat public v3. Un lot en
 * vol ancien est libéré : son payload contenait des champs désormais interdits
 * et devra recevoir une nouvelle clé d'idempotence avant son prochain envoi.
 */
export function deserializeAttemptOutboxSnapshot(
  serialized: string,
): AttemptOutboxSnapshot {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new Error("Le snapshot d’outbox n’est pas un JSON valide.", {
      cause: error,
    });
  }

  const current = attemptOutboxSnapshotSchema.safeParse(candidate);
  if (current.success) return current.data;

  const legacyV2 = legacyAttemptOutboxSnapshotV2Schema.safeParse(candidate);
  const legacy = legacyV2.success
    ? legacyV2.data
    : legacyAttemptOutboxSnapshotV1Schema.parse(candidate);
  const migratedEntries = legacy.entries.map((entry): AttemptOutboxEntry => {
    const submission = attemptSubmissionSchema.parse({
      eventId: entry.submission.eventId,
      deviceId: entry.submission.deviceId,
      exerciseId: entry.submission.exerciseId,
      selectedOptionId: entry.submission.selectedOptionId,
      answeredAt: entry.submission.answeredAt,
      durationMs: entry.submission.durationMs,
      contentVersionId: entry.submission.contentVersionId,
      algorithmVersion: entry.submission.algorithmVersion,
    });

    if (entry.status === "rejected" && entry.code === "device_not_registered") {
      return {
        status: "pending",
        submission,
        retryReason: "device_not_registered",
      };
    }
    if (entry.status === "pending") {
      return entry.retryReason === undefined
        ? { status: "pending", submission }
        : { status: "pending", submission, retryReason: entry.retryReason };
    }
    if (entry.status === "synced") {
      return {
        status: "synced",
        submission,
        serverStatus: entry.serverStatus,
        rating: entry.rating,
      };
    }
    return { status: "rejected", submission, code: entry.code };
  });
  return attemptOutboxSnapshotSchema.parse({
    schemaVersion: 3,
    owner: legacyV2.success
      ? legacyV2.data.owner
      : ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
    syncRevision: legacy.syncRevision,
    authoritativeStates: legacyV2.success
      ? legacyV2.data.authoritativeStates
      : [],
    entries: compactTerminalEntries(migratedEntries),
    inFlight: null,
  });
}
