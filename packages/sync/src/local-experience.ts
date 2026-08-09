import { z } from "zod";

import {
  attemptAnswersAreEqual,
  attemptSubmissionSchema,
  attemptSubmissionsAreEqual,
  MAX_ASSOCIATION_PAIRS_PER_ANSWER,
  MAX_RECALL_ANSWER_LENGTH,
  MAX_WORD_ORDER_TOKENS_PER_ANSWER,
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

/**
 * Réponse en cours de construction. Plus permissive que la réponse soumise
 * (un appariement partiel, une piste vide ou une saisie effacée sont des
 * états légitimes), mais durable : une erreur déjà commise ne doit pas être
 * effacée par un rechargement, sans quoi une note 0 redeviendrait un 1.
 */
export const localDraftAnswerSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("association"),
    pairs: z
      .array(
        z.strictObject({
          promptPairId: canonicalUuidSchema,
          chosenPairId: canonicalUuidSchema,
        }),
      )
      .max(MAX_ASSOCIATION_PAIRS_PER_ANSWER),
    missedOnce: z.boolean().optional(),
  }),
  z.strictObject({
    kind: z.literal("word_order"),
    tokenIds: z
      .array(canonicalUuidSchema)
      .max(MAX_WORD_ORDER_TOKENS_PER_ANSWER),
    missedOnce: z.boolean().optional(),
  }),
  z.strictObject({
    kind: z.literal("recall"),
    value: z.string().max(MAX_RECALL_ANSWER_LENGTH),
    missedOnce: z.boolean().optional(),
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
      // Champs additifs à défaut : les instantanés v1 restent lisibles.
      draftAnswer: localDraftAnswerSchema.nullable().default(null),
      missedOnce: z.boolean().default(false),
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

export const localLessonReplacementTargetSchema = z.strictObject({
  lessonVersionId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
});

// La leçon interne 1B compile 21 exercices mixtes. La limite reste bornée
// pour protéger le checkpoint local, sans tronquer silencieusement ce plan.
export const LOCAL_EXPEDITION_MAX_EXERCISES = 24;

const localExpeditionResultSchema = z.strictObject({
  exerciseId: canonicalUuidSchema,
  rating: z.union([z.literal(0), z.literal(1)]),
  answeredAt: utcIsoTimestampSchema,
});

/**
 * Progression durable d'une séance multi-exercices (ADR-0024, phase B).
 * La sous-session d'un exercice en cours reste portée par `lesson` ;
 * cette couche conserve le plan ordonné et les résultats déjà acquis.
 */
export const localExpeditionCheckpointSchema = z
  .strictObject({
    lessonVersionId: canonicalUuidSchema,
    exerciseIds: z
      .array(canonicalUuidSchema)
      .min(1)
      .max(LOCAL_EXPEDITION_MAX_EXERCISES),
    results: z
      .array(localExpeditionResultSchema)
      .max(LOCAL_EXPEDITION_MAX_EXERCISES),
    startedAt: utcIsoTimestampSchema,
    updatedAt: utcIsoTimestampSchema,
  })
  .superRefine((expedition, context) => {
    if (
      new Set(expedition.exerciseIds).size !== expedition.exerciseIds.length
    ) {
      context.addIssue({
        code: "custom",
        message: "Le plan d'expédition ne peut pas répéter un exercice.",
        path: ["exerciseIds"],
      });
    }
    const resultIds = expedition.results.map(({ exerciseId }) => exerciseId);
    if (new Set(resultIds).size !== resultIds.length) {
      context.addIssue({
        code: "custom",
        message: "Chaque exercice a au plus un résultat d'expédition.",
        path: ["results"],
      });
    }
    for (const [index, resultId] of resultIds.entries()) {
      if (!expedition.exerciseIds.includes(resultId)) {
        context.addIssue({
          code: "custom",
          message: "Un résultat d'expédition doit appartenir au plan.",
          path: ["results", index],
        });
      }
    }
    if (Date.parse(expedition.updatedAt) < Date.parse(expedition.startedAt)) {
      context.addIssue({
        code: "custom",
        message: "updatedAt ne peut pas précéder le début de l'expédition.",
        path: ["updatedAt"],
      });
    }
  });

export const localExperienceSnapshotSchema = z
  .strictObject({
    schemaVersion: z.literal(LOCAL_EXPERIENCE_SCHEMA_VERSION),
    owner: attemptOutboxOwnerSchema,
    onboarding: localOnboardingStateSchema,
    lesson: localLessonCheckpointSchema.nullable(),
    // Champ additif avec défaut : les instantanés v1 restent lisibles.
    expedition: localExpeditionCheckpointSchema.nullable().default(null),
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
      snapshot.expedition !== null &&
      snapshot.onboarding.status !== "completed"
    ) {
      context.addIssue({
        code: "custom",
        message: "Une expédition locale exige un onboarding terminé.",
        path: ["expedition"],
      });
    }
    if (snapshot.expedition !== null && snapshot.lesson !== null) {
      const { expedition, lesson } = snapshot;
      if (lesson.lessonVersionId !== expedition.lessonVersionId) {
        context.addIssue({
          code: "custom",
          message: "La sous-session doit appartenir à l'expédition active.",
          path: ["lesson", "lessonVersionId"],
        });
      }
      if (!expedition.exerciseIds.includes(lesson.exerciseId)) {
        context.addIssue({
          code: "custom",
          message: "L'exercice en cours doit appartenir au plan d'expédition.",
          path: ["lesson", "exerciseId"],
        });
      }
      if (
        lesson.phase !== "completed" &&
        expedition.results.some(
          ({ exerciseId }) => exerciseId === lesson.exerciseId,
        )
      ) {
        context.addIssue({
          code: "custom",
          message: "Un exercice déjà résolu ne peut pas être rejoué en place.",
          path: ["lesson", "exerciseId"],
        });
      }
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
export type LocalDraftAnswer = z.infer<typeof localDraftAnswerSchema>;
export type LocalLessonCheckpoint = z.infer<typeof localLessonCheckpointSchema>;
export type LocalExpeditionCheckpoint = z.infer<
  typeof localExpeditionCheckpointSchema
>;
export type LocalExpeditionResult = z.infer<typeof localExpeditionResultSchema>;
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

const submissionsAreEqual = attemptSubmissionsAreEqual;

export const draftAnswersAreEqual = attemptAnswersAreEqual;

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
      left.selectedOptionId === right.selectedOptionId &&
      left.missedOnce === right.missedOnce &&
      draftAnswersAreEqual(left.draftAnswer, right.draftAnswer)
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
      draftAnswer: null,
      missedOnce: false,
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

/**
 * Conserve la réponse en construction et la trace d'une erreur déjà commise.
 * Sans cette persistance, un rechargement transformerait une note 0 en 1.
 */
export function saveLocalLessonDraft(
  snapshotInput: LocalExperienceSnapshot,
  draft: {
    readonly answer: LocalDraftAnswer | null;
    readonly missedOnce?: boolean;
  },
  updatedAtInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase !== "question") {
    throw new LocalExperienceTransitionError(
      "Une réponse ne peut être construite qu'à l'étape question.",
    );
  }
  const parsedAnswer =
    draft.answer === null ? null : localDraftAnswerSchema.parse(draft.answer);
  // L'erreur est un cliquet : une fois commise, elle ne se retire plus.
  const missedOnce = lesson.missedOnce || (draft.missedOnce ?? false);
  const answer =
    parsedAnswer === null || !missedOnce
      ? parsedAnswer
      : { ...parsedAnswer, missedOnce: true };
  if (
    draftAnswersAreEqual(lesson.draftAnswer, answer) &&
    missedOnce === lesson.missedOnce
  ) {
    return snapshot;
  }
  const updatedAt = canonicalTimestamp(updatedAtInput);
  assertTimestampCanFollow(updatedAt, lesson.updatedAt, "La réponse");
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: {
      ...lesson,
      draftAnswer: answer,
      missedOnce,
      updatedAt,
    },
  });
}

/**
 * Referme une sous-session qui n'a réservé aucune tentative durable, pour que
 * son résultat puisse être consigné dans l'expédition. Ne peut jamais
 * détruire une tentative déjà écrite dans le journal.
 */
export function discardLocalLessonQuestion(
  snapshotInput: LocalExperienceSnapshot,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const lesson = requiredLesson(snapshot);
  if (lesson.phase !== "intro" && lesson.phase !== "question") {
    throw new LocalExperienceTransitionError(
      "Une tentative durable ne peut pas être abandonnée silencieusement.",
    );
  }
  return localExperienceSnapshotSchema.parse({ ...snapshot, lesson: null });
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
  if (lesson.phase !== "question") {
    throw new LocalExperienceTransitionError(
      "La question doit avoir une réponse avant l’envoi.",
    );
  }
  const answersOption = submission.selectedOptionId !== undefined;
  if (
    answersOption
      ? lesson.selectedOptionId === null
      : lesson.draftAnswer === null
  ) {
    throw new LocalExperienceTransitionError(
      "La question doit avoir une réponse avant l’envoi.",
    );
  }
  if (
    submission.contentVersionId !== lesson.lessonVersionId ||
    submission.exerciseId !== lesson.exerciseId
  ) {
    throw new LocalExperienceAttemptIntegrityError();
  }
  // La tentative envoyée doit être exactement celle qui a été construite.
  if (answersOption) {
    if (submission.selectedOptionId !== lesson.selectedOptionId) {
      throw new LocalExperienceAttemptIntegrityError();
    }
  } else if (
    submission.answer === undefined ||
    !draftAnswersAreEqual(lesson.draftAnswer, submission.answer)
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

function expeditionCheckpointsAreEqual(
  left: LocalExpeditionCheckpoint,
  right: LocalExpeditionCheckpoint,
): boolean {
  return (
    left.lessonVersionId === right.lessonVersionId &&
    left.startedAt === right.startedAt &&
    left.updatedAt === right.updatedAt &&
    left.exerciseIds.length === right.exerciseIds.length &&
    left.exerciseIds.every((id, index) => id === right.exerciseIds[index]) &&
    left.results.length === right.results.length &&
    left.results.every(
      (result, index) =>
        result.exerciseId === right.results[index]?.exerciseId &&
        result.rating === right.results[index]?.rating &&
        result.answeredAt === right.results[index]?.answeredAt,
    )
  );
}

export function startLocalExpedition(
  snapshotInput: LocalExperienceSnapshot,
  input: {
    readonly lessonVersionId: string;
    readonly exerciseIds: readonly string[];
    readonly startedAt: string;
  },
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  if (snapshot.onboarding.status !== "completed") {
    throw new LocalExperienceTransitionError(
      "L'onboarding doit être terminé avant l'expédition.",
    );
  }
  if (snapshot.expedition !== null) {
    throw new LocalExperienceTransitionError(
      "Une expédition locale est déjà conservée et doit être reprise, terminée ou abandonnée explicitement.",
    );
  }
  if (snapshot.lesson !== null) {
    throw new LocalExperienceTransitionError(
      "Une séance locale isolée doit être terminée avant l'expédition.",
    );
  }
  const startedAt = canonicalTimestamp(input.startedAt);
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    expedition: {
      lessonVersionId: input.lessonVersionId,
      exerciseIds: [...input.exerciseIds],
      results: [],
      startedAt,
      updatedAt: startedAt,
    },
  });
}

function requiredExpedition(
  snapshot: LocalExperienceSnapshot,
): LocalExpeditionCheckpoint {
  if (snapshot.expedition === null) {
    throw new LocalExperienceTransitionError(
      "Aucune expédition locale n'est active.",
    );
  }
  return snapshot.expedition;
}

/**
 * Consigne le résultat d'un exercice du plan. Si la sous-session durable de
 * cet exercice est encore présente, elle doit être close et elle est
 * archivée dans la même transition (l'expédition devient la mémoire de la
 * progression).
 */
export function recordLocalExpeditionResult(
  snapshotInput: LocalExperienceSnapshot,
  resultInput: {
    readonly exerciseId: string;
    readonly rating: 0 | 1;
    readonly answeredAt: string;
  },
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const expedition = requiredExpedition(snapshot);
  const result = localExpeditionResultSchema.parse(resultInput);
  const existing = expedition.results.find(
    ({ exerciseId }) => exerciseId === result.exerciseId,
  );
  if (existing !== undefined) {
    if (
      existing.rating === result.rating &&
      existing.answeredAt === result.answeredAt
    ) {
      return snapshot;
    }
    throw new LocalExperienceTransitionError(
      "Cet exercice a déjà un résultat d'expédition différent.",
    );
  }
  if (!expedition.exerciseIds.includes(result.exerciseId)) {
    throw new LocalExperienceTransitionError(
      "Le résultat doit appartenir au plan d'expédition.",
    );
  }
  if (snapshot.lesson !== null) {
    if (snapshot.lesson.exerciseId !== result.exerciseId) {
      throw new LocalExperienceTransitionError(
        "Une autre sous-session est encore en cours.",
      );
    }
    if (snapshot.lesson.phase !== "completed") {
      throw new LocalExperienceTransitionError(
        "La sous-session doit être close avant de consigner son résultat.",
      );
    }
  }
  assertTimestampCanFollow(
    result.answeredAt,
    expedition.updatedAt,
    "Le résultat d'expédition",
  );
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    lesson: null,
    expedition: {
      ...expedition,
      results: [...expedition.results, result],
      updatedAt: result.answeredAt,
    },
  });
}

/** Libère une expédition dont tous les exercices du plan sont résolus. */
export function clearCompletedLocalExpedition(
  snapshotInput: LocalExperienceSnapshot,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const expedition = requiredExpedition(snapshot);
  if (expedition.results.length !== expedition.exerciseIds.length) {
    throw new LocalExperienceTransitionError(
      "L'expédition ne peut être libérée qu'une fois le plan résolu.",
    );
  }
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    expedition: null,
  });
}

/**
 * Abandonne une expédition pour changement de version, avec la même
 * protection d'état attendu que l'abandon de séance. Toute sous-session
 * doit avoir été abandonnée au préalable.
 */
export function abandonLocalExpeditionForVersionChange(
  snapshotInput: LocalExperienceSnapshot,
  expectedExpeditionInput: LocalExpeditionCheckpoint,
  replacementLessonVersionIdInput: string,
): LocalExperienceSnapshot {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const expedition = requiredExpedition(snapshot);
  const expectedExpedition = localExpeditionCheckpointSchema.parse(
    expectedExpeditionInput,
  );
  const replacementLessonVersionId = canonicalUuidSchema.parse(
    replacementLessonVersionIdInput,
  );
  if (!expeditionCheckpointsAreEqual(expedition, expectedExpedition)) {
    throw new LocalExperienceTransitionError(
      "L'expédition locale a changé depuis la confirmation d'abandon.",
    );
  }
  if (replacementLessonVersionId === expedition.lessonVersionId) {
    throw new LocalExperienceTransitionError(
      "L'abandon exige une autre version de leçon.",
    );
  }
  if (snapshot.lesson !== null) {
    throw new LocalExperienceTransitionError(
      "La sous-session doit être abandonnée avant l'expédition.",
    );
  }
  return localExperienceSnapshotSchema.parse({
    ...snapshot,
    expedition: null,
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
