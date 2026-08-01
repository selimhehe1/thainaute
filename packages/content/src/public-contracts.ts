import { z } from "zod";

const canonicalUuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
  );
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const utcDateTimeSchema = z.iso.datetime({ precision: 3, offset: true });

const publicLessonExerciseSchema = z.strictObject({
  id: canonicalUuidSchema,
  type: z.literal("audio_choice"),
  skill: z.literal("listening"),
  audioAssetId: canonicalUuidSchema,
  promptFr: z.string().min(1).max(280),
  options: z
    .array(
      z.strictObject({
        id: canonicalUuidSchema,
        labelFr: z.string().min(1).max(120),
      }),
    )
    .min(2)
    .max(6),
});

const publicAudioAssetSchema = z.strictObject({
  assetId: canonicalUuidSchema,
  variant: z.enum(["natural", "pedagogical"]),
  mimeType: z.enum(["audio/wav", "audio/mpeg"]),
  sha256: sha256Schema,
  byteLength: z.number().int().positive(),
  durationMs: z.number().int().positive().max(3_600_000),
});

/** DTO v1 distribue aux clients. Il ne contient aucune cle de correction. */
export const publicLessonSchema = z.strictObject({
  releaseId: canonicalUuidSchema,
  releaseVersion: z.number().int().positive(),
  lessonId: canonicalUuidSchema,
  versionId: canonicalUuidSchema,
  revision: z.number().int().positive(),
  locale: z.literal("fr-FR"),
  titleFr: z.string().min(1).max(160),
  objectiveFr: z.string().min(1).max(400),
  publishedAt: utcDateTimeSchema,
  access: z.literal("free"),
  exercises: z.array(publicLessonExerciseSchema).min(1),
  audioAssets: z.array(publicAudioAssetSchema).min(1),
});

export const publicLessonResponseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  contentSha256: sha256Schema,
  lesson: publicLessonSchema,
});

export const publicLessonVersionIdSchema = canonicalUuidSchema;

export const publicContentErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum([
      "invalid_content_id",
      "content_not_found",
      "content_unavailable",
    ]),
    message: z.string().min(1).max(240),
    requestId: z.string().min(1).max(128),
  }),
});

export type PublicLesson = z.infer<typeof publicLessonSchema>;
export type PublicLessonResponse = z.infer<typeof publicLessonResponseSchema>;
export type PublicContentErrorResponse = z.infer<
  typeof publicContentErrorResponseSchema
>;
