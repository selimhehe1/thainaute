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
const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());

/** Valeur attendue dans l'en-tête HTTP `Idempotency-Key`. */
export const idempotencyKeySchema = canonicalUuidSchema;

/** Contrat public v1 d'une tentative enregistrée localement. */
export const attemptSubmissionSchema = z.strictObject({
  eventId: canonicalUuidSchema,
  deviceId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
  selectedOptionId: canonicalUuidSchema,
  answeredAt: utcIsoTimestampSchema,
  durationMs: z.number().int().min(0).max(MAX_ATTEMPT_DURATION_MS),
  contentVersionId: canonicalUuidSchema,
  algorithmVersion: attemptAlgorithmVersionSchema,
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
  }),
  z.strictObject({
    eventId: canonicalUuidSchema,
    status: z.literal("duplicate"),
    rating: attemptRatingSchema,
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
export type ValidatedAttemptSubmission = z.infer<
  typeof attemptSubmissionSchema
>;
