import { z } from "zod";

const identifier = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9_-]+$/u);
const utcDateTime = z.string().datetime({ offset: true });
const nullableText = z.string().min(1).nullable();

export const auditDimensionSchema = z.enum([
  "orthography",
  "meaning",
  "pronunciation",
  "tone",
  "vowel_length",
  "register",
  "naturalness",
]);

export const sourceSchema = z
  .object({
    schemaVersion: z.literal(1),
    sourceId: identifier,
    label: z.string().min(1).max(240),
    kind: z.enum([
      "synthetic_fixture",
      "official",
      "academic",
      "licensed_corpus",
    ]),
    versionSource: z.string().min(1).max(160),
    confidence: z.enum(["low", "medium", "high"]),
    license: z.string().min(1).max(120),
    commercialUse: z.boolean(),
    redistribution: z.boolean(),
    publicationAuthorized: z.boolean(),
    consultedAt: utcDateTime,
  })
  .strict();

const syllableSchema = z
  .object({
    thaiRaw: z.string().min(1),
    ipa: nullableText,
    tone: nullableText,
    vowelLength: z.enum(["short", "long"]).nullable(),
    initial: nullableText,
    final: nullableText,
  })
  .strict();

const itemSchema = z
  .object({
    id: identifier,
    thaiRaw: z.string().min(1),
    unicodeCodePoints: z.array(z.string().regex(/^U\+[0-9A-F]{4,6}$/u)).min(1),
    translationFr: nullableText,
    transcription: z
      .object({
        systemVersion: identifier,
        value: nullableText,
      })
      .strict(),
    syllables: z.array(syllableSchema).min(1),
    register: nullableText,
    sourceIds: z.array(identifier).min(1),
  })
  .strict();

const optionSchema = z
  .object({
    id: identifier,
    labelFr: z.string().min(1).max(120),
  })
  .strict();

const exerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("audio_choice"),
    itemId: identifier,
    skill: z.literal("listening"),
    audioAssetId: identifier,
    promptFr: z.string().min(1).max(280),
    options: z.array(optionSchema).min(2).max(6),
    correctOptionId: identifier,
    feedback: z
      .object({
        correctFr: z.string().min(1).max(280),
        incorrectFr: z.string().min(1).max(280),
      })
      .strict(),
  })
  .strict();

const provenanceActorKindSchema = z.enum(["human", "ai"]);

const generationActorSchema = z
  .object({
    actorId: identifier,
    kind: provenanceActorKindSchema,
    role: z.enum(["author", "ai_assistant"]),
  })
  .strict();

const auditActorSchema = z
  .object({
    actorId: identifier,
    kind: provenanceActorKindSchema,
    role: z.literal("auditor"),
  })
  .strict();

const auditSchema = z
  .object({
    dimension: auditDimensionSchema,
    status: z.enum(["pending", "passed", "failed", "conflict"]),
    auditor: auditActorSchema,
  })
  .strict();

const findingSchema = z
  .object({
    code: identifier,
    status: z.enum(["open", "resolved"]),
    blocking: z.boolean(),
    note: z.string().min(1).max(500),
  })
  .strict();

export const lessonSchema = z
  .object({
    schemaVersion: z.literal(1),
    lessonId: identifier,
    versionId: identifier,
    revision: z.number().int().positive(),
    workflowStatus: z.enum(["draft", "review", "approved", "published"]),
    visibility: z.enum(["fixture", "internal", "public"]),
    publishedAt: utcDateTime.nullable(),
    locale: z.literal("fr-FR"),
    titleFr: z.string().min(1).max(160),
    objectiveFr: z.string().min(1).max(400),
    requiredEntitlement: z.literal("premium").nullable(),
    audioManifestId: identifier,
    items: z.array(itemSchema).min(1),
    exercises: z.array(exerciseSchema).min(1),
    provenance: z
      .object({
        sourceIds: z.array(identifier).min(1),
        generationActors: z.array(generationActorSchema).min(1),
        audits: z.array(auditSchema).length(7),
        findings: z.array(findingSchema),
      })
      .strict(),
  })
  .strict()
  .superRefine((lesson, context) => {
    const dimensions = lesson.provenance.audits.map(
      ({ dimension }) => dimension,
    );
    if (new Set(dimensions).size !== auditDimensionSchema.options.length) {
      context.addIssue({
        code: "custom",
        message:
          "Chaque dimension d'audit linguistique doit apparaître exactement une fois.",
        path: ["provenance", "audits"],
      });
    }

    const generationActorIds = lesson.provenance.generationActors.map(
      ({ actorId }) => actorId,
    );
    if (new Set(generationActorIds).size !== generationActorIds.length) {
      context.addIssue({
        code: "custom",
        message: "Chaque acteur de génération doit être référencé une fois.",
        path: ["provenance", "generationActors"],
      });
    }
  });

const audioEntrySchema = z
  .object({
    assetId: identifier,
    itemId: identifier,
    variant: z.enum(["fixture", "natural", "pedagogical"]),
    canonicalPath: z.string().min(1).max(500),
    distributionPaths: z.array(z.string().min(1).max(500)),
    mimeType: z.enum(["audio/wav", "audio/mpeg"]),
    sha256: z.string().regex(/^[0-9a-f]{64}$/u),
    byteLength: z.number().int().positive(),
    durationMs: z.number().int().positive().max(3_600_000),
    voiceKind: z.enum(["synthetic_test_tone", "native_human"]),
    consentReference: nullableText,
  })
  .strict();

export const audioManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    manifestId: identifier,
    lessonVersionId: identifier,
    entries: z.array(audioEntrySchema).min(1),
  })
  .strict();

export const contentBundleSchema = z
  .object({
    lesson: lessonSchema,
    audioManifest: audioManifestSchema,
    sources: z.array(sourceSchema).min(1),
  })
  .strict();

export type ContentSource = z.infer<typeof sourceSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type AudioManifest = z.infer<typeof audioManifestSchema>;
export type AudioChoiceExercise = Lesson["exercises"][number];
export type ContentBundle = z.infer<typeof contentBundleSchema>;
