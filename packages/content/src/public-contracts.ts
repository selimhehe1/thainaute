import { z } from "zod";

import { CONTENT_SCHEMA_LIMITS } from "./schemas";

export const publicContentUuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
  );
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const utcDateTimeSchema = z.iso.datetime({ precision: 3, offset: true });

export const PUBLIC_AUDIO_MAX_BYTES = 25 * 1_024 * 1_024;

const publicLessonExerciseSchema = z.strictObject({
  id: publicContentUuidSchema,
  type: z.literal("audio_choice"),
  skill: z.literal("listening"),
  audioAssetId: publicContentUuidSchema,
  promptFr: z.string().min(1).max(280),
  options: z
    .array(
      // Une option d'ecoute oppose souvent des graphies thaies entre elles.
      // Le DTO les distribue telles quelles plutot que de les ranger dans
      // un champ francais : c'est du thai, il doit etre nomme comme tel.
      //
      // La transcription de l'option n'est deliberement PAS distribuee. Sur
      // un exercice de discrimination tonale opposant ขา et ข่า, joindre
      // khaa et khaa avec leurs accents reviendrait a ecrire la reponse a
      // cote de la question. Le contenu la porte, le reseau non.
      z
        .strictObject({
          id: publicContentUuidSchema,
          labelFr: z.string().min(1).max(120).nullable().default(null),
          // Valeur par defaut assumee : c'est un contrat reseau. Un client
          // a jour doit savoir lire une charge produite par un serveur qui
          // ne connait pas encore ce champ, sinon un deploiement progressif
          // casse les clients deja deployes.
          thaiRaw: z
            .string()
            .min(1)
            .max(CONTENT_SCHEMA_LIMITS.thaiRawLength)
            .nullable()
            .default(null),
        })
        .refine(
          (option) => option.labelFr !== null || option.thaiRaw !== null,
          { message: "Une option doit porter un libelle francais ou thai." },
        ),
    )
    .min(2)
    .max(6),
});

export const publicAudioAssetSchema = z.strictObject({
  assetId: publicContentUuidSchema,
  variant: z.enum(["natural", "pedagogical"]),
  mimeType: z.enum(["audio/wav", "audio/mpeg"]),
  sha256: sha256Schema,
  byteLength: z.number().int().positive().max(PUBLIC_AUDIO_MAX_BYTES),
  durationMs: z.number().int().positive().max(3_600_000),
});

/** DTO v1 distribue aux clients. Il ne contient aucune cle de correction. */
export const publicLessonSchema = z.strictObject({
  releaseId: publicContentUuidSchema,
  releaseVersion: z.number().int().positive(),
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
    .min(1)
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
    publishedAt: utcDateTimeSchema,
    lessons: z.array(publicReleaseLessonSchema).min(1).max(500),
  })
  .superRefine((release, context) => {
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
