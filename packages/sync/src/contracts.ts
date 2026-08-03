import { SKILL_DIMENSIONS } from "@thainaute/domain";
import { z } from "zod";

export const MAX_ATTEMPTS_PER_BATCH = 50;
export const MAX_ATTEMPT_DURATION_MS = 30 * 60 * 1_000;

/**
 * Liste de compatibilité persistante. Toute nouvelle version SRS doit conserver
 * ici les versions encore synchronisables et ajouter son dispatch serveur.
 */
export const SUPPORTED_ATTEMPT_ALGORITHM_VERSIONS = ["srs-v0"] as const;
export const attemptAlgorithmVersionSchema = z.enum(
  SUPPORTED_ATTEMPT_ALGORITHM_VERSIONS,
);

export const ATTEMPT_REJECTION_CODES = [
  "answer_key_not_found",
  "invalid_submission",
  "event_id_collision",
  "device_not_registered",
] as const;

export const API_ERROR_CODES = [
  "invalid_json",
  "invalid_idempotency_key",
  "unauthorized",
  "payload_too_large",
  "unsupported_media_type",
  "invalid_request",
  "idempotency_key_reused",
  "concurrent_update",
  "auth_unavailable",
  "database_unavailable",
  "internal_error",
] as const;

const utcIsoTimestampSchema = z.iso
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());
const attemptRatingSchema = z.union([z.literal(0), z.literal(1)]);
export const attemptFeedbackSchema = z.string().min(1).max(280);
const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());

/** Valeur attendue dans l'en-tête HTTP `Idempotency-Key`. */
export const idempotencyKeySchema = canonicalUuidSchema;

export const MAX_ASSOCIATION_PAIRS_PER_ANSWER = 6;
export const MAX_WORD_ORDER_TOKENS_PER_ANSWER = 12;
export const MAX_RECALL_ANSWER_LENGTH = 512;

/**
 * Réponse typée des mécaniques qui ne tiennent pas dans une option unique
 * (ADR-0024). L'écoute et la lecture continuent d'employer
 * `selectedOptionId` : leurs tentatives déjà persistées restent valides.
 */
export const attemptAnswerSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("association"),
    pairs: z
      .array(
        z.strictObject({
          promptPairId: canonicalUuidSchema,
          chosenPairId: canonicalUuidSchema,
        }),
      )
      .min(1)
      .max(MAX_ASSOCIATION_PAIRS_PER_ANSWER),
  }),
  z.strictObject({
    kind: z.literal("word_order"),
    tokenIds: z
      .array(canonicalUuidSchema)
      .min(1)
      .max(MAX_WORD_ORDER_TOKENS_PER_ANSWER),
  }),
  z.strictObject({
    kind: z.literal("recall"),
    /** Saisie brute : la normalisation Unicode appartient au serveur. */
    value: z.string().min(1).max(MAX_RECALL_ANSWER_LENGTH),
  }),
]);

function assertUniqueAssociationPairs(
  answer: z.infer<typeof attemptAnswerSchema>,
  context: z.RefinementCtx,
  path: readonly (string | number)[],
): void {
  if (answer.kind !== "association") return;
  const prompts = answer.pairs.map(({ promptPairId }) => promptPairId);
  const chosen = answer.pairs.map(({ chosenPairId }) => chosenPairId);
  if (new Set(prompts).size !== prompts.length) {
    context.addIssue({
      code: "custom",
      message: "Chaque paire proposée ne peut être appariée qu'une fois.",
      path: [...path, "pairs"],
    });
  }
  if (new Set(chosen).size !== chosen.length) {
    context.addIssue({
      code: "custom",
      message: "Chaque étiquette ne peut être choisie qu'une fois.",
      path: [...path, "pairs"],
    });
  }
}

/** Contrat public d'une tentative enregistrée localement. */
export const attemptSubmissionSchema = z
  .strictObject({
    eventId: canonicalUuidSchema,
    deviceId: canonicalUuidSchema,
    exerciseId: canonicalUuidSchema,
    /** Mécaniques à option unique. Exclusif avec `answer`. */
    selectedOptionId: canonicalUuidSchema.optional(),
    /** Mécaniques à réponse composée. Exclusif avec `selectedOptionId`. */
    answer: attemptAnswerSchema.optional(),
    answeredAt: utcIsoTimestampSchema,
    durationMs: z.number().int().min(0).max(MAX_ATTEMPT_DURATION_MS),
    contentVersionId: canonicalUuidSchema,
    algorithmVersion: attemptAlgorithmVersionSchema,
  })
  .superRefine((submission, context) => {
    const hasOption = submission.selectedOptionId !== undefined;
    const hasAnswer = submission.answer !== undefined;
    if (hasOption === hasAnswer) {
      context.addIssue({
        code: "custom",
        message:
          "Une tentative porte soit une option choisie, soit une réponse typée.",
        path: ["answer"],
      });
      return;
    }
    if (submission.answer !== undefined) {
      assertUniqueAssociationPairs(submission.answer, context, ["answer"]);
    }
  });

/** Corps de `POST /api/v1/attempts/batch`. */
export const attemptBatchSchema = z
  .strictObject({
    attempts: z
      .array(attemptSubmissionSchema)
      .min(1)
      .max(MAX_ATTEMPTS_PER_BATCH),
  })
  .superRefine((batch, context) => {
    const seenEventIds = new Set<string>();

    batch.attempts.forEach((attempt, index) => {
      if (seenEventIds.has(attempt.eventId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque eventId doit être unique dans un lot.",
          path: ["attempts", index, "eventId"],
        });
      }

      seenEventIds.add(attempt.eventId);
    });
  });

export const attemptRejectionCodeSchema = z.enum(ATTEMPT_REJECTION_CODES);

/** Résultat autoritaire d'une tentative, dans le même ordre que la requête. */
export const attemptBatchResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    eventId: canonicalUuidSchema,
    status: z.literal("accepted"),
    rating: attemptRatingSchema,
    /** Absent seulement lors du rejeu d'une réponse v1 déjà persistée. */
    feedbackFr: attemptFeedbackSchema.optional(),
  }),
  z.strictObject({
    eventId: canonicalUuidSchema,
    status: z.literal("duplicate"),
    rating: attemptRatingSchema,
    /** Absent seulement lors du rejeu d'une réponse v1 déjà persistée. */
    feedbackFr: attemptFeedbackSchema.optional(),
  }),
  z.strictObject({
    eventId: canonicalUuidSchema,
    status: z.literal("rejected"),
    code: attemptRejectionCodeSchema,
  }),
]);

/** Projection SRS serveur renvoyée pour un couple item/dimension affecté. */
export const learnerItemStateSchema = z
  .strictObject({
    itemId: canonicalUuidSchema,
    skill: z.enum(SKILL_DIMENSIONS),
    masteryPermille: z.number().int().min(0).max(1_000),
    status: z.enum(["new", "learning", "confirmed"]),
    attemptCount: z.number().int().min(1),
    successfulAttempts: z.number().int().min(0),
    consecutiveCorrect: z.number().int().min(0),
    dueAt: utcIsoTimestampSchema,
    algorithmVersion: attemptAlgorithmVersionSchema,
  })
  .superRefine((state, context) => {
    if (state.successfulAttempts > state.attemptCount) {
      context.addIssue({
        code: "custom",
        message: "successfulAttempts ne peut pas dépasser attemptCount.",
        path: ["successfulAttempts"],
      });
    }

    if (state.consecutiveCorrect > state.successfulAttempts) {
      context.addIssue({
        code: "custom",
        message: "consecutiveCorrect ne peut pas dépasser successfulAttempts.",
        path: ["consecutiveCorrect"],
      });
    }
  });

/** Réponse 2xx de `POST /api/v1/attempts/batch`. */
export const attemptBatchResponseSchema = z
  .strictObject({
    /** Curseur monotone : le client ignore toute réponse plus ancienne. */
    syncRevision: z.number().int().positive(),
    results: z
      .array(attemptBatchResultSchema)
      .min(1)
      .max(MAX_ATTEMPTS_PER_BATCH),
    states: z.array(learnerItemStateSchema).max(MAX_ATTEMPTS_PER_BATCH),
  })
  .superRefine((response, context) => {
    let previousKey: string | undefined;

    response.states.forEach((state, index) => {
      const key = `${state.itemId}\u0000${state.skill}`;

      if (previousKey !== undefined && key <= previousKey) {
        context.addIssue({
          code: "custom",
          message: "states doit être unique et trié par itemId puis par skill.",
          path: ["states", index],
        });
      }

      previousKey = key;
    });
  });

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);

/** Enveloppe fermée pour toute erreur HTTP globale de l'API v1. */
export const apiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: apiErrorCodeSchema,
    message: z.string().trim().min(1).max(500),
    requestId: z.string().trim().min(1).max(128).optional(),
  }),
});

export type AttemptBatch = z.infer<typeof attemptBatchSchema>;
export type AttemptRejectionCode = z.infer<typeof attemptRejectionCodeSchema>;
export type AttemptBatchResult = z.infer<typeof attemptBatchResultSchema>;
export type LearnerItemState = z.infer<typeof learnerItemStateSchema>;
export type AttemptBatchResponse = z.infer<typeof attemptBatchResponseSchema>;
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type AttemptAnswer = z.infer<typeof attemptAnswerSchema>;

/** Forme partagée par une réponse soumise et par un brouillon local. */
export type ComparableAttemptAnswer =
  | {
      readonly kind: "association";
      readonly pairs: readonly {
        readonly promptPairId: string;
        readonly chosenPairId: string;
      }[];
    }
  | { readonly kind: "word_order"; readonly tokenIds: readonly string[] }
  | { readonly kind: "recall"; readonly value: string };

/** Comparateur unique : trois copies divergentes laissaient passer deux
 * réponses différentes pour un même identifiant d'événement. */
export function attemptAnswersAreEqual(
  left: ComparableAttemptAnswer | null | undefined,
  right: ComparableAttemptAnswer | null | undefined,
): boolean {
  if (left == null || right == null) return (left ?? null) === (right ?? null);
  if (left.kind !== right.kind) return false;
  if (left.kind === "recall") {
    return right.kind === "recall" && left.value === right.value;
  }
  if (left.kind === "word_order") {
    return (
      right.kind === "word_order" &&
      left.tokenIds.length === right.tokenIds.length &&
      left.tokenIds.every((tokenId, index) => tokenId === right.tokenIds[index])
    );
  }
  return (
    right.kind === "association" &&
    left.pairs.length === right.pairs.length &&
    left.pairs.every(
      (pair, index) =>
        pair.promptPairId === right.pairs[index]?.promptPairId &&
        pair.chosenPairId === right.pairs[index]?.chosenPairId,
    )
  );
}

export type OptionAttemptSubmission = ValidatedAttemptSubmission & {
  readonly selectedOptionId: string;
};

/**
 * Garde de frontière : la notation actuelle ne sait corriger qu'une option
 * unique. Les réponses typées sont conservées mais restent sans note
 * autoritaire tant que le serveur ne les corrige pas (ADR-0024, phase C).
 */
export function isOptionAttempt(
  submission: ValidatedAttemptSubmission,
): submission is OptionAttemptSubmission {
  return submission.selectedOptionId !== undefined;
}

/** Égalité stricte de deux tentatives, réponse typée comprise. */
export function attemptSubmissionsAreEqual(
  left: ValidatedAttemptSubmission,
  right: ValidatedAttemptSubmission,
): boolean {
  return (
    left.eventId === right.eventId &&
    left.deviceId === right.deviceId &&
    left.exerciseId === right.exerciseId &&
    left.selectedOptionId === right.selectedOptionId &&
    attemptAnswersAreEqual(left.answer, right.answer) &&
    left.answeredAt === right.answeredAt &&
    left.durationMs === right.durationMs &&
    left.contentVersionId === right.contentVersionId &&
    left.algorithmVersion === right.algorithmVersion
  );
}
export type ValidatedAttemptSubmission = z.infer<
  typeof attemptSubmissionSchema
>;
