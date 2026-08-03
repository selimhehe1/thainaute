import { z } from "zod";

export const CONTENT_SCHEMA_LIMITS = {
  thaiRawLength: 512,
  unicodeCodePointsPerItem: 512,
  syllablesPerItem: 64,
  sourceIdsPerItem: 32,
  itemsPerLesson: 100,
  exercisesPerLesson: 200,
  pairsPerAssociation: 6,
  tokensPerWordOrder: 12,
  acceptedAnswersPerRecall: 8,
  provenanceSourcesPerLesson: 100,
  generationActorsPerLesson: 32,
  findingsPerLesson: 100,
  distributionPathsPerAudio: 8,
  audioEntriesPerManifest: 200,
  sourcesPerBundle: 100,
} as const;

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

export const auditStatusSchema = z.enum([
  "pending",
  "passed",
  "failed",
  "conflict",
]);

export const workflowStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "conflict",
  "published",
]);

export const contentVisibilitySchema = z.enum([
  "fixture",
  "internal",
  "public",
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
    thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
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
    thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
    unicodeCodePoints: z
      .array(z.string().regex(/^U\+[0-9A-F]{4,6}$/u))
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem),
    translationFr: nullableText,
    transcription: z
      .object({
        systemVersion: identifier,
        value: nullableText,
      })
      .strict(),
    syllables: z
      .array(syllableSchema)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.syllablesPerItem),
    register: nullableText,
    sourceIds: z
      .array(identifier)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.sourceIdsPerItem),
  })
  .strict();

const optionSchema = z
  .object({
    id: identifier,
    labelFr: z.string().min(1).max(120),
  })
  .strict();

const promptFrSchema = z.string().min(1).max(280);

const feedbackSchema = z
  .object({
    correctFr: z.string().min(1).max(280),
    incorrectFr: z.string().min(1).max(280),
  })
  .strict();

const audioChoiceExerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("audio_choice"),
    itemId: identifier,
    skill: z.literal("listening"),
    audioAssetId: identifier,
    promptFr: promptFrSchema,
    options: z.array(optionSchema).min(2).max(6),
    correctOptionId: identifier,
    feedback: feedbackSchema,
  })
  .strict();

const associationPairSchema = z
  .object({
    id: identifier,
    itemId: identifier,
    labelFr: z.string().min(1).max(120),
  })
  .strict();

const associationExerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("association"),
    skill: z.literal("reading"),
    promptFr: promptFrSchema,
    pairs: z
      .array(associationPairSchema)
      .min(2)
      .max(CONTENT_SCHEMA_LIMITS.pairsPerAssociation),
    feedback: feedbackSchema,
  })
  .strict();

const wordOrderTokenSchema = z
  .object({
    id: identifier,
    thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
    transcription: nullableText,
  })
  .strict();

const wordOrderExerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("word_order"),
    itemId: identifier,
    skill: z.literal("production"),
    audioAssetId: identifier.nullable(),
    promptFr: promptFrSchema,
    tokens: z
      .array(wordOrderTokenSchema)
      .min(2)
      .max(CONTENT_SCHEMA_LIMITS.tokensPerWordOrder),
    correctOrder: z
      .array(identifier)
      .min(2)
      .max(CONTENT_SCHEMA_LIMITS.tokensPerWordOrder),
    feedback: feedbackSchema,
  })
  .strict();

const recallAcceptedAnswerSchema = z
  .object({
    value: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
    kind: z.enum(["thai", "transcription"]),
  })
  .strict();

const recallExerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("recall"),
    itemId: identifier,
    skill: z.literal("recall"),
    promptFr: promptFrSchema,
    acceptedAnswers: z
      .array(recallAcceptedAnswerSchema)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.acceptedAnswersPerRecall),
    answerPolicy: z
      .object({
        normalization: z.literal("nfc"),
        trimWhitespace: z.boolean(),
        collapseInnerWhitespace: z.boolean(),
      })
      .strict(),
    feedback: feedbackSchema,
  })
  .strict();

const readingExerciseSchema = z
  .object({
    id: identifier,
    type: z.literal("reading"),
    itemId: identifier,
    skill: z.literal("reading"),
    promptFr: promptFrSchema,
    options: z.array(optionSchema).min(2).max(6),
    correctOptionId: identifier,
    feedback: feedbackSchema,
  })
  .strict();

const exerciseSchema = z.discriminatedUnion("type", [
  audioChoiceExerciseSchema,
  associationExerciseSchema,
  wordOrderExerciseSchema,
  recallExerciseSchema,
  readingExerciseSchema,
]);

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
    status: auditStatusSchema,
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
    workflowStatus: workflowStatusSchema,
    visibility: contentVisibilitySchema,
    publishedAt: utcDateTime.nullable(),
    locale: z.literal("fr-FR"),
    titleFr: z.string().min(1).max(160),
    objectiveFr: z.string().min(1).max(400),
    requiredEntitlement: z.literal("premium").nullable(),
    audioManifestId: identifier,
    items: z.array(itemSchema).min(1).max(CONTENT_SCHEMA_LIMITS.itemsPerLesson),
    exercises: z
      .array(exerciseSchema)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.exercisesPerLesson),
    provenance: z
      .object({
        sourceIds: z
          .array(identifier)
          .min(1)
          .max(CONTENT_SCHEMA_LIMITS.provenanceSourcesPerLesson),
        generationActors: z
          .array(generationActorSchema)
          .min(1)
          .max(CONTENT_SCHEMA_LIMITS.generationActorsPerLesson),
        audits: z.array(auditSchema).length(7),
        findings: z
          .array(findingSchema)
          .max(CONTENT_SCHEMA_LIMITS.findingsPerLesson),
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
    distributionPaths: z
      .array(z.string().min(1).max(500))
      .max(CONTENT_SCHEMA_LIMITS.distributionPathsPerAudio),
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
    entries: z
      .array(audioEntrySchema)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.audioEntriesPerManifest),
  })
  .strict();

export const contentBundleSchema = z
  .object({
    lesson: lessonSchema,
    audioManifest: audioManifestSchema,
    sources: z
      .array(sourceSchema)
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.sourcesPerBundle),
  })
  .strict();

export type ContentSource = z.infer<typeof sourceSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type AudioManifest = z.infer<typeof audioManifestSchema>;
export type LessonExercise = Lesson["exercises"][number];
export type AudioChoiceExercise = Extract<
  LessonExercise,
  { type: "audio_choice" }
>;
export type AssociationExercise = Extract<
  LessonExercise,
  { type: "association" }
>;
export type WordOrderExercise = Extract<LessonExercise, { type: "word_order" }>;
export type RecallExercise = Extract<LessonExercise, { type: "recall" }>;
export type ReadingExercise = Extract<LessonExercise, { type: "reading" }>;
export type ContentBundle = z.infer<typeof contentBundleSchema>;
