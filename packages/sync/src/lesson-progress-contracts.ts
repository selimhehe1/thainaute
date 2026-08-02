import { SKILL_DIMENSIONS } from "@thainaute/domain";
import { z } from "zod";

import { attemptAlgorithmVersionSchema } from "./contracts";

export const MAX_LESSON_PROGRESS_EXERCISES = 500;

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z.iso
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());

export const lessonProgressVersionIdSchema = canonicalUuidSchema;

export const lessonExerciseProgressSchema = z
  .strictObject({
    exerciseId: canonicalUuidSchema,
    skill: z.enum(SKILL_DIMENSIONS),
    status: z.enum(["new", "learning", "confirmed"]),
    masteryPermille: z.number().int().min(0).max(1_000),
    attemptCount: z.number().int().nonnegative(),
    successfulAttempts: z.number().int().nonnegative(),
    consecutiveCorrect: z.number().int().nonnegative(),
    dueAt: utcIsoTimestampSchema.nullable(),
    algorithmVersion: attemptAlgorithmVersionSchema,
  })
  .superRefine((progress, context) => {
    if (progress.successfulAttempts > progress.attemptCount) {
      context.addIssue({
        code: "custom",
        message: "successfulAttempts ne peut pas dépasser attemptCount.",
        path: ["successfulAttempts"],
      });
    }
    if (progress.consecutiveCorrect > progress.successfulAttempts) {
      context.addIssue({
        code: "custom",
        message: "consecutiveCorrect ne peut pas dépasser successfulAttempts.",
        path: ["consecutiveCorrect"],
      });
    }

    const hasInitialState =
      progress.status === "new" &&
      progress.masteryPermille === 0 &&
      progress.successfulAttempts === 0 &&
      progress.consecutiveCorrect === 0 &&
      progress.dueAt === null;
    const hasReviewedState =
      progress.status !== "new" && progress.dueAt !== null;
    if (
      (progress.attemptCount === 0 && !hasInitialState) ||
      (progress.attemptCount > 0 && !hasReviewedState)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Un exercice nouveau doit avoir un état initial vide, sinon une échéance.",
        path: ["status"],
      });
    }
  });

/** Progression autoritaire d'une leçon sans identifiant éditorial d'item. */
export const lessonProgressResponseSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    lessonVersionId: canonicalUuidSchema,
    syncRevision: z.number().int().nonnegative(),
    exercises: z
      .array(lessonExerciseProgressSchema)
      .min(1)
      .max(MAX_LESSON_PROGRESS_EXERCISES),
  })
  .superRefine((response, context) => {
    const seen = new Set<string>();
    response.exercises.forEach((exercise, index) => {
      if (seen.has(exercise.exerciseId)) {
        context.addIssue({
          code: "custom",
          message: "Chaque exercice doit apparaître une seule fois.",
          path: ["exercises", index, "exerciseId"],
        });
      }
      seen.add(exercise.exerciseId);
    });
  });

export const LESSON_PROGRESS_ERROR_CODES = [
  "invalid_content_id",
  "unauthorized",
  "content_not_found",
  "auth_unavailable",
  "database_unavailable",
  "internal_error",
] as const;

export const lessonProgressErrorCodeSchema = z.enum(
  LESSON_PROGRESS_ERROR_CODES,
);

export const lessonProgressErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: lessonProgressErrorCodeSchema,
    message: z.string().trim().min(1).max(240),
    requestId: z.string().trim().min(1).max(128),
  }),
});

export type LessonExerciseProgress = z.infer<
  typeof lessonExerciseProgressSchema
>;
export type LessonProgressResponse = z.infer<
  typeof lessonProgressResponseSchema
>;
export type LessonProgressErrorCode = z.infer<
  typeof lessonProgressErrorCodeSchema
>;
export type LessonProgressErrorResponse = z.infer<
  typeof lessonProgressErrorResponseSchema
>;
