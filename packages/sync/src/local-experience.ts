import { z } from "zod";

import {
  attemptSubmissionSchema,
  type ValidatedAttemptSubmission,
} from "./contracts";
import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxSnapshotSchema,
  type AttemptOutboxOwner,
  type AttemptOutboxSnapshot,
} from "./outbox";

export const LOCAL_EXPERIENCE_SCHEMA_VERSION = 1 as const;

/** Identifiant catégoriel borné ; jamais un libellé ni du texte libre. */
export const localOnboardingOptionIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,47}$/u);

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z
  .string()
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());

export const localOnboardingSelectionSchema = z.strictObject({
  goalOptionId: localOnboardingOptionIdSchema,
  motivationOptionId: localOnboardingOptionIdSchema,
  experienceOptionId: localOnboardingOptionIdSchema,
});

export const localOnboardingStateSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("not_started") }),
  z.strictObject({
    status: z.literal("in_progress"),
    goalOptionId: localOnboardingOptionIdSchema.nullable(),
    motivationOptionId: localOnboardingOptionIdSchema.nullable(),
    experienceOptionId: localOnboardingOptionIdSchema.nullable(),
    startedAt: utcIsoTimestampSchema,
    updatedAt: utcIsoTimestampSchema,
  }),
  z.strictObject({
    status: z.literal("completed"),
    ...localOnboardingSelectionSchema.shape,
    startedAt: utcIsoTimestampSchema,
    completedAt: utcIsoTimestampSchema,
  }),
]);

const localLessonCheckpointBaseShape = {
  lessonVersionId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
  sessionStartedAt: utcIsoTimestampSchema,
  updatedAt: utcIsoTimestampSchema,
} as const;

export const localLessonCheckpointSchema = z
  .discriminatedUnion("phase", [
    z.strictObject({
      phase: z.literal("intro"),
      ...localLessonCheckpointBaseShape,
    }),
    z.strictObject({
      phase: z.literal("question"),
      ...localLessonCheckpointBaseShape,
      selectedOptionId: canonicalUuidSchema.nullable(),
    }),
    z.strictObject({
      phase: z.literal("submitting"),
      ...localLessonCheckpointBaseShape,
      submission: attemptSubmissionSchema,
    }),
    z.strictObject({
      phase: z.literal("result"),
      ...localLessonCheckpointBaseShape,
      submission: attemptSubmissionSchema,
    }),
    z.strictObject({
      phase: z.literal("completed"),
      ...localLessonCheckpointBaseShape,
      submission: attemptSubmissionSchema,
      completedAt: utcIsoTimestampSchema,
    }),
  ])
  .superRefine((checkpoint, context) => {
    if (
      Date.parse(checkpoint.updatedAt) < Date.parse(checkpoint.sessionStartedAt)
    ) {
      context.addIssue({
        code: "custom",
        message: "updatedAt ne peut pas précéder le début de la séance.",
        path: ["updatedAt"],
      });
    }
    if (
      checkpoint.phase === "submitting" ||
      checkpoint.phase === "result" ||
      checkpoint.phase === "completed"
    ) {
      if (
        checkpoint.submission.contentVersionId !== checkpoint.lessonVersionId ||
        checkpoint.submission.exerciseId !== checkpoint.exerciseId
      ) {
        context.addIssue({
          code: "custom",
          message: "La tentative préparée doit appartenir à la séance.",
          path: ["submission"],
        });
      }
      if (
        Date.parse(checkpoint.submission.answeredAt) <
          Date.parse(checkpoint.sessionStartedAt) ||
        Date.parse(checkpoint.updatedAt) <
          Date.parse(checkpoint.submission.answeredAt)
      ) {
        context.addIssue({
          code: "custom",
          message: "La tentative préparée a une chronologie invalide.",
          path: ["submission", "answeredAt"],
        });
      }
    }
    if (
      checkpoint.phase === "completed" &&
      checkpoint.completedAt !== checkpoint.updatedAt
    ) {
      context.addIssue({
        code: "custom",
        message:
          "La clôture et la dernière mise à jour doivent être atomiques.",
        path: ["completedAt"],
      });
    }
  });

const localLessonReplacementTargetSchema = z.strictObject({
  lessonVersionId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
});

export const localExperienceSnapshotSchema = z
  .strictObject({
    schemaVersion: z.literal(LOCAL_EXPERIENCE_SCHEMA_VERSION),
    owner: attemptOutboxOwnerSchema,
    onboarding: localOnboardingStateSchema,
    lesson: localLessonCheckpointSchema.nullable(),
  })
  .superRefine((snapshot, context) => {
    if (
      snapshot.lesson !== null &&
      snapshot.onboarding.status !== "completed"
    ) {
      context.addIssue({
        code: "custom",
        message: "Une seance locale exige un onboarding termine.",
        path: ["lesson"],
      });
    }
    if (
      snapshot.onboarding.status === "in_progress" &&
      Date.parse(snapshot.onboarding.updatedAt) <
        Date.parse(snapshot.onboarding.startedAt)
    ) {
      context.addIssue({
        code: "custom",
        message: "updatedAt ne peut pas précéder le début de l’onboarding.",
        path: ["onboarding", "updatedAt"],
      });
    }
    if (
      snapshot.onboarding.status === "completed" &&
      Date.parse(snapshot.onboarding.completedAt) <
        Date.parse(snapshot.onboarding.startedAt)
    ) {
      context.addIssue({
        code: "custom",
        message: "completedAt ne peut pas précéder le début de l’onboarding.",
        path: ["onboarding", "completedAt"],
      });
    }
  });

export type LocalOnboardingSelection = z.infer<
  typeof localOnboardingSelectionSchema
>;
export type LocalOnboardingState = z.infer<typeof localOnboardingStateSchema>;
export type LocalLessonCheckpoint = z.infer<typeof localLessonCheckpointSchema>;
export type LocalLessonReplacementTarget = z.infer<
  typeof localLessonReplacementTargetSchema
>;
export type LocalExperienceSnapshot = z.infer<
  typeof localExperienceSnapshotSchema
>;

export class LocalExperienceTransitionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "LocalExperienceTransitionError";
  }
}

export class LocalExperienceOwnerError extends Error {
  public constructor() {
    super(
      "Le parcours local et le journal n’appartiennent pas au même espace.",
    );
    this.name = "LocalExperienceOwnerError";
  }
}

export class LocalExperienceAttemptIntegrityError extends Error {
  public constructor() {
    super("La tentative durable ne correspond pas au checkpoint local.");
    this.name = "LocalExperienceAttemptIntegrityError";
  }
}

function canonicalTimestamp(value: string): string {
  return utcIsoTimestampSchema.parse(value);
}

function assertTimestampCanFollow(
  candidate: string,
  previous: string,
  label: string,
): void {
  if (Date.parse(candidate) < Date.parse(previous)) {
    throw new LocalExperienceTransitionError(
      `${label} ne peut pas précéder l’état déjà enregistré.`,
    );
  }
}

function requiredLesson(
  snapshot: LocalExperienceSnapshot,
): LocalLessonCheckpoint {
  if (snapshot.lesson === null) {
    throw new LocalExperienceTransitionError(
      "Aucune séance locale n’est active.",
    );
  }
  return snapshot.lesson;
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

function lessonCheckpointsAreEqual(
  left: LocalLessonCheckpoint,
  right: LocalLessonCheckpoint,
): boolean {
  if (
    left.phase !== right.phase ||
    left.lessonVersionId !== right.lessonVersionId ||
    left.exerciseId !== right.exerciseId ||
    left.sessionStartedAt !== right.sessionStartedAt ||
    left.updatedAt !== right.updatedAt
  ) {
    return false;
  }

  if (left.phase === "intro") return right.phase === "intro";
  if (left.phase === "question") {
    return (
      right.phase === "question" &&
      left.selectedOptionId === right.selectedOptionId
    );
  }
  if (left.phase === "completed") {
    return (
      right.phase === "completed" &&
      left.completedAt === right.completedAt &&
      submissionsAreEqual(left.submission, right.submission)
    );
  }
  return (
    right.phase === left.phase &&
    submissionsAreEqual(left.submission, right.submission)
  );
}

function validatedOwnedOutbox(
  owner: AttemptOutboxOwner,
  outboxInput: AttemptOutboxSnapshot,
): AttemptOutboxSnapshot {
  const outbox = attemptOutboxSnapshotSchema.parse(outboxInput);
  if (!attemptOutboxOwnersAreEqual(owner, outbox.owner)) {
    throw new LocalExperienceOwnerError();
  }
  return outbox;
}

function hasDurableSubmission(
  owner: AttemptOutboxOwner,
  outboxInput: AttemptOutboxSnapshot,
  submission: ValidatedAttemptSubmission,
): boolean {
  const outbox = validatedOwnedOutbox(owner, outboxInput);
  const entry = outbox.entries.find(
    (candidate) => candidate.submission.eventId === submission.eventId,
  );
  if (entry === undefined) return false;
  if (
    entry.status === "rejected" ||
    !submissionsAreEqual(entry.submission, submission)
  ) {
    throw new LocalExperienceAttemptIntegrityError();
  }
  return true;
}

export function createLocalExperienceSnapshot(
  ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
): LocalExperienceSnapshot {
  return localExperienceSnapshotSchema.parse({
    schemaVersion: LOCAL_EXPERIENCE_SCHEMA_VERSION,
    owner: attemptOutboxOwnerSchema.parse(ownerInput),
    onboarding: { status: "not_started" },
    lesson: null,
  });
}

export function beginLocalOnboarding(
  snapshotInput: LocalExperienceSnapshot,
  startedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  if (snapshot.onboarding.status !== "not_started") return snapshot;
  const startedAt = canonicalTimestamp(startedAtInput);
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    onboarding: {
      status: "in_progress",
      goalOptionId: null,
      motivationOptionId: null,
      experienceOptionId: null,
      startedAt,
      updatedAt: startedAt,
    },
  });
}

export function updateLocalOnboarding(
  snapshotInput: LocalExperienceSnapshot,
  update: Partial<LocalOnboardingSelection>,
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const started = beginLocalOnboarding(snapshotInput, updatedAtInput);
  if (started.onboarding.status === "completed") return started;
  if (started.onboarding.status !== "in_progress") {
    throw new LocalExperienceTransitionError(
      "L’onboarding local n’a pas pu être initialisé.",
    );
  }
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(
    updatedAt,
    started.onboarding.updatedAt,
    "La mise à jour de l’onboarding",
  );
  return localExperienceSnapshotSchema.parse({
    ...started,
    onboarding: {
      ...started.onboarding,
      goalOptionId: update.goalOptionId ?? started.onboarding.goalOptionId,
      motivationOptionId:
        update.motivationOptionId ?? started.onboarding.motivationOptionId,
      experienceOptionId:
        update.experienceOptionId ?? started.onboarding.experienceOptionId,
      updatedAt,
    },
  });
}

export function completeLocalOnboarding(
  snapshotInput: LocalExperienceSnapshot,
  selectionInput: LocalOnboardingSelection,
  completedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  if (snapshot.onboarding.status === "completed") return snapshot;
  const started = beginLocalOnboarding(snapshot, completedAtInput);
  if (started.onboarding.status !== "in_progress") {
    throw new LocalExperienceTransitionError(
      "L’onboarding local n’a pas pu être initialisé.",
    );
  }
  const selection = localOnboardingSelectionSchema.parse(selectionInput);
  const completedAt = canonicalTimestamp(completedAtInput);
  assertTimestampCanFollow(
    completedAt,
    started.onboarding.updatedAt,
    "La fin de l’onboarding",
  );
  return localExperienceSnapshotSchema.parse({
    ...started,
    onboarding: {
      status: "completed",
      ...selection,
      startedAt: started.onboarding.startedAt,
      completedAt,
    },
  });
}

export function startLocalLesson(
  snapshotInput: LocalExperienceSnapshot,
  input: {
    readonly lessonVersionId: string;
    readonly exerciseId: string;
    readonly startedAt: string;
  },
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  if (snapshot.onboarding.status !== "completed") {
    throw new LocalExperienceTransitionError(
      "L’onboarding doit être terminé avant la séance.",
    );
  }
  if (snapshot.lesson !== null) {
    throw new LocalExperienceTransitionError(
      "Une séance locale est déjà conservée et doit être reprise ou abandonnée explicitement.",
    );
  }
  const startedAt = canonicalTimestamp(input.startedAt);
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      phase: "intro",
      lessonVersionId: input.lessonVersionId,
      exerciseId: input.exerciseId,
      sessionStartedAt: startedAt,
      updatedAt: startedAt,
    },
  });
}

/**
 * Abandonne explicitement un checkpoint lorsque le client dispose d'une
 * version de remplacement. L'état attendu protège contre une confirmation
 * devenue obsolète. Une tentative encore en cours doit déjà exister, à
 * l'identique et non rejetée, dans l'outbox propriétaire.
 */
export function abandonLocalLessonForVersionChange(
  snapshotInput: LocalExperienceSnapshot,
  expectedCheckpointInput: LocalLessonCheckpoint,
  replacementTargetInput: LocalLessonReplacementTarget,
  outboxInput?: AttemptOutboxSnapshot,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  const expectedCheckpoint = localLessonCheckpointSchema.parse(
    expectedCheckpointInput,
  );
  const replacementTarget = localLessonReplacementTargetSchema.parse(
    replacementTargetInput,
  );

  if (!lessonCheckpointsAreEqual(lesson, expectedCheckpoint)) {
    throw new LocalExperienceTransitionError(
      "La séance locale a changé depuis la confirmation d’abandon.",
    );
  }
  if (
    replacementTarget.lessonVersionId === lesson.lessonVersionId &&
    replacementTarget.exerciseId === lesson.exerciseId
  ) {
    throw new LocalExperienceTransitionError(
      "L’abandon exige une autre cible de leçon.",
    );
  }
  if (lesson.phase === "submitting" || lesson.phase === "result") {
    if (
      outboxInput === undefined ||
      !hasDurableSubmission(snapshot.owner, outboxInput, lesson.submission)
    ) {
      throw new LocalExperienceAttemptIntegrityError();
    }
  }

  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: null,
  });
}

export function openLocalLessonQuestion(
  snapshotInput: LocalExperienceSnapshot,
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase === "question") return snapshot;
  if (lesson.phase !== "intro") {
    throw new LocalExperienceTransitionError(
      "La séance ne peut plus revenir à la question.",
    );
  }
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(updatedAt, lesson.updatedAt, "La question");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      phase: "question",
      lessonVersionId: lesson.lessonVersionId,
      exerciseId: lesson.exerciseId,
      sessionStartedAt: lesson.sessionStartedAt,
      selectedOptionId: null,
      updatedAt,
    },
  });
}

export function selectLocalLessonOption(
  snapshotInput: LocalExperienceSnapshot,
  selectedOptionId: string,
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase !== "question") {
    throw new LocalExperienceTransitionError(
      "Une option ne peut être choisie qu’à l’étape question.",
    );
  }
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(updatedAt, lesson.updatedAt, "La réponse");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      ...lesson,
      selectedOptionId,
      updatedAt,
    },
  });
}

/** Réserve l'eventId et le payload exact avant toute écriture dans l'outbox. */
export function prepareLocalLessonSubmission(
  snapshotInput: LocalExperienceSnapshot,
  submissionInput: ValidatedAttemptSubmission,
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  const submission = attemptSubmissionSchema.parse(submissionInput);
  if (lesson.phase === "submitting") {
    if (submissionsAreEqual(lesson.submission, submission)) return snapshot;
    throw new LocalExperienceAttemptIntegrityError();
  }
  if (lesson.phase !== "question" || lesson.selectedOptionId === null) {
    throw new LocalExperienceTransitionError(
      "La question doit avoir une réponse avant l’envoi.",
    );
  }
  if (
    submission.contentVersionId !== lesson.lessonVersionId ||
    submission.exerciseId !== lesson.exerciseId ||
    submission.selectedOptionId !== lesson.selectedOptionId
  ) {
    throw new LocalExperienceAttemptIntegrityError();
  }
  assertTimestampCanFollow(
    submission.answeredAt,
    lesson.updatedAt,
    "La tentative",
  );
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(updatedAt, lesson.updatedAt, "La préparation");
  assertTimestampCanFollow(updatedAt, submission.answeredAt, "La préparation");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      phase: "submitting",
      lessonVersionId: lesson.lessonVersionId,
      exerciseId: lesson.exerciseId,
      sessionStartedAt: lesson.sessionStartedAt,
      submission,
      updatedAt,
    },
  });
}

/** Confirme le résultat uniquement quand l'eventId réservé est durable. */
export function confirmLocalLessonResult(
  snapshotInput: LocalExperienceSnapshot,
  outboxInput: AttemptOutboxSnapshot,
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase === "result" || lesson.phase === "completed") {
    if (!hasDurableSubmission(snapshot.owner, outboxInput, lesson.submission)) {
      throw new LocalExperienceAttemptIntegrityError();
    }
    return snapshot;
  }
  if (lesson.phase !== "submitting") {
    throw new LocalExperienceTransitionError(
      "Aucune tentative locale n’attend de confirmation.",
    );
  }
  if (!hasDurableSubmission(snapshot.owner, outboxInput, lesson.submission)) {
    return snapshot;
  }
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(updatedAt, lesson.updatedAt, "Le résultat");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      phase: "result",
      lessonVersionId: lesson.lessonVersionId,
      exerciseId: lesson.exerciseId,
      sessionStartedAt: lesson.sessionStartedAt,
      submission: lesson.submission,
      updatedAt,
    },
  });
}

export function finishLocalLesson(
  snapshotInput: LocalExperienceSnapshot,
  outboxInput: AttemptOutboxSnapshot,
  completedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase === "completed") {
    if (!hasDurableSubmission(snapshot.owner, outboxInput, lesson.submission)) {
      throw new LocalExperienceAttemptIntegrityError();
    }
    return snapshot;
  }
  if (lesson.phase !== "result") {
    throw new LocalExperienceTransitionError(
      "Le résultat durable doit être affiché avant de terminer.",
    );
  }
  if (!hasDurableSubmission(snapshot.owner, outboxInput, lesson.submission)) {
    throw new LocalExperienceAttemptIntegrityError();
  }
  const completedAt = canonicalTimestamp(completedAtInput);
  assertTimestampCanFollow(completedAt, lesson.updatedAt, "La clôture");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      ...lesson,
      phase: "completed",
      completedAt,
      updatedAt: completedAt,
    },
  });
}

export function serializeLocalExperienceSnapshot(
  snapshot: LocalExperienceSnapshot,
): string {
  return JSON.stringify(localExperienceSnapshotSchema.parse(snapshot));
}

export function deserializeLocalExperienceSnapshot(
  serialized: string,
): LocalExperienceSnapshot {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new Error("Le parcours local n’est pas un JSON valide.", {
      cause: error,
    });
  }
  return localExperienceSnapshotSchema.parse(candidate);
}
