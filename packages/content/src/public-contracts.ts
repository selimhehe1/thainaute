import { z } from "zod";

import { CONTENT_SCHEMA_LIMITS } from "./schemas";
import {
  DEFAULT_LANGUAGE_PACK_ID,
  LANGUAGE_PACK_IDS,
  thaiFrLanguagePack,
} from "./language-packs";

export const publicContentUuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
  );
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const utcDateTimeSchema = z.iso.datetime({ precision: 3, offset: true });

export const PUBLIC_AUDIO_MAX_BYTES = 25 * 1_024 * 1_024;

const publicOptionSchema = z
  .strictObject({
    id: publicContentUuidSchema,
    labelFr: z.string().min(1).max(120).nullable().default(null),
    targetText: z
      .string()
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.thaiRawLength)
      .nullable()
      .default(null),
    thaiRaw: z
      .string()
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.thaiRawLength)
      .nullable()
      .default(null),
  })
  .refine(
    (option) =>
      option.labelFr !== null ||
      option.targetText !== null ||
      option.thaiRaw !== null,
    { message: "Une option publique doit porter un texte." },
  );

const publicExerciseBase = {
  id: publicContentUuidSchema,
  promptFr: z.string().min(1).max(280),
} as const;

const publicItemReference = {
  targetText: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
  thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
} as const;

const publicLessonExerciseSchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...publicExerciseBase,
    type: z.literal("audio_choice"),
    skill: z.literal("listening"),
    audioAssetId: publicContentUuidSchema,
    options: z.array(publicOptionSchema).min(2).max(6),
  }),
  z.strictObject({
    ...publicExerciseBase,
    type: z.literal("association"),
    skill: z.literal("reading"),
    pairs: z
      .array(
        z.strictObject({
          id: publicContentUuidSchema,
          ...publicItemReference,
          labelFr: z.string().min(1).max(120),
        }),
      )
      .min(2)
      .max(6),
  }),
  z.strictObject({
    ...publicExerciseBase,
    type: z.literal("word_order"),
    skill: z.literal("production"),
    ...publicItemReference,
    audioAssetId: publicContentUuidSchema.nullable(),
    tokens: z
      .array(
        z.strictObject({
          id: publicContentUuidSchema,
          targetText: z
            .string()
            .min(1)
            .max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
          thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
          transcription: z.string().max(120).nullable(),
        }),
      )
      .min(2)
      .max(12),
  }),
  z.strictObject({
    ...publicExerciseBase,
    type: z.literal("recall"),
    skill: z.literal("recall"),
    ...publicItemReference,
    answerPolicy: z.strictObject({
      normalization: z.literal("nfc"),
      trimWhitespace: z.boolean(),
      collapseInnerWhitespace: z.boolean(),
    }),
  }),
  z.strictObject({
    ...publicExerciseBase,
    type: z.literal("reading"),
    skill: z.literal("reading"),
    ...publicItemReference,
    options: z.array(publicOptionSchema).min(2).max(6),
  }),
]);

export const publicAudioAssetSchema = z.strictObject({
  assetId: publicContentUuidSchema,
  variant: z.enum(["natural", "pedagogical"]),
  mimeType: z.enum(["audio/wav", "audio/mpeg"]),
  sha256: sha256Schema,
  byteLength: z.number().int().positive().max(PUBLIC_AUDIO_MAX_BYTES),
  durationMs: z.number().int().positive().max(3_600_000),
});

/** DTO distribué aux clients. Il ne contient aucune clé de correction. */
export const publicLessonSchema = z.strictObject({
  releaseId: publicContentUuidSchema,
  releaseVersion: z.number().int().positive(),
  languagePackId: z.enum(LANGUAGE_PACK_IDS).default(DEFAULT_LANGUAGE_PACK_ID),
  targetLocale: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/u)
    .default(thaiFrLanguagePack.targetLocale),
  lessonId: publicContentUuidSchema,
  versionId: publicContentUuidSchema,
  revision: z.number().int().positive(),
  locale: z.literal("fr-FR"),
  titleFr: z.string().min(1).max(160),
  objectiveFr: z.string().min(1).max(400),
  publishedAt: utcDateTimeSchema,
  access: z.literal("free"),
  exercises: z
    .array(publicLessonExerciseSchema)
    .min(1)
    .max(CONTENT_SCHEMA_LIMITS.exercisesPerLesson),
  audioAssets: z
    .array(publicAudioAssetSchema)
    .max(CONTENT_SCHEMA_LIMITS.audioEntriesPerManifest),
});

export const publicLessonResponseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  contentSha256: sha256Schema,
  lesson: publicLessonSchema,
});

export const publicLessonVersionIdSchema = publicContentUuidSchema;

export const publicContentReleaseIdSchema = publicContentUuidSchema;
export const publicAudioAssetIdSchema = publicContentUuidSchema;

export const publicReleaseLessonSchema = z.strictObject({
  lessonId: publicContentUuidSchema,
  versionId: publicContentUuidSchema,
  revision: z.number().int().positive(),
  titleFr: z.string().min(1).max(160),
  objectiveFr: z.string().min(1).max(400),
  access: z.literal("free"),
  contentSha256: sha256Schema,
});

export const publicReleaseSchema = z
  .strictObject({
    releaseId: publicContentUuidSchema,
    releaseVersion: z.number().int().positive(),
    languagePackId: z.enum(LANGUAGE_PACK_IDS).default(DEFAULT_LANGUAGE_PACK_ID),
    targetLocale: z
      .string()
      .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/u)
      .default(thaiFrLanguagePack.targetLocale),
    publishedAt: utcDateTimeSchema,
    lessons: z.array(publicReleaseLessonSchema).min(1).max(500),
  })
  .superRefine((release, context) => {
    if (
      release.languagePackId === DEFAULT_LANGUAGE_PACK_ID &&
      release.targetLocale !== thaiFrLanguagePack.targetLocale
    ) {
      context.addIssue({
        code: "custom",
        message: "La locale cible de la release thai-fr doit rester th-TH.",
        path: ["targetLocale"],
      });
    }
    let previousKey: string | undefined;
    release.lessons.forEach((lesson, index) => {
      const key = `${lesson.lessonId}\u0000${lesson.versionId}`;
      if (previousKey !== undefined && key <= previousKey) {
        context.addIssue({
          code: "custom",
          message:
            "Les leçons doivent être uniques et triées par lessonId puis versionId.",
          path: ["lessons", index],
        });
      }
      previousKey = key;
    });
  });

export const publicReleaseResponseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  manifestSha256: sha256Schema,
  release: publicReleaseSchema,
});

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
export type PublicAudioAsset = z.infer<typeof publicAudioAssetSchema>;
export type PublicRelease = z.infer<typeof publicReleaseSchema>;
export type PublicReleaseResponse = z.infer<typeof publicReleaseResponseSchema>;
export type PublicContentErrorResponse = z.infer<
  typeof publicContentErrorResponseSchema
>;
