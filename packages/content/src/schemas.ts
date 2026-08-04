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
  // Un bloc d'exercice rédigé annonce ses tirages (« Tirages : 12 au
  // total ») et son seuil (« Seuil de réussite : 9 sur 12 »). Le corpus
  // monte à 12 ; la marge tient les futurs blocs sans être un blanc-seing.
  drawsPerPool: 24,
  poolsPerLesson: 12,
  // Un retour par distracteur, plus quelques cas non liés à une option.
  feedbackVariantsPerExercise: 8,
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

export const itemSchema = z
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

/**
 * Une option d'exercice n'est pas toujours du français.
 *
 * Dans le curriculum rédigé, un exercice d'écoute oppose couramment des
 * graphies thaïes entre elles : สบายดีไหมครับ contre สบายดีครับ. Les
 * enfermer dans un `labelFr` reviendrait à ranger du thaï dans un champ
 * français, donc sans contrôle NFC ni relevé de points de code, sur des
 * chaînes qui en ont précisément besoin.
 *
 * `labelFr` et `thaiRaw` sont donc tous deux facultatifs, mais une option
 * vide des deux côtés n'affiche rien : elle est refusée.
 */
const optionSchema = z
  .object({
    id: identifier,
    labelFr: z.string().min(1).max(120).nullable().default(null),
    thaiRaw: z
      .string()
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.thaiRawLength)
      .nullable()
      .default(null),
    transcription: nullableText.default(null),
  })
  .strict()
  .superRefine((option, context) => {
    if (option.labelFr === null && option.thaiRaw === null) {
      context.addIssue({
        code: "custom",
        message: "Une option doit porter au moins un libellé français ou thaï.",
        path: ["labelFr"],
      });
    }
    if (option.thaiRaw === null && option.transcription !== null) {
      context.addIssue({
        code: "custom",
        message: "Une transcription sans graphie thaïe n'a rien à transcrire.",
        path: ["transcription"],
      });
    }
  });

const promptFrSchema = z.string().min(1).max(280);

/**
 * Retour conditionnel au distracteur choisi.
 *
 * Le curriculum n'écrit pas un seul message d'erreur mais des messages
 * ciblés : « confusion ค่ะ contre คะ : réécoutez la dernière syllabe ».
 * C'est là qu'est l'enseignement, pas dans le fait de dire « raté ».
 *
 * `selectedOptionId` à `null` couvre les conditions qui ne dépendent pas
 * d'une option, par exemple un groupe de tirages.
 */
const feedbackVariantSchema = z
  .object({
    selectedOptionId: identifier.nullable(),
    /** Condition lisible, reprise du markdown source. */
    labelFr: z.string().min(1).max(120),
    textFr: z.string().min(1).max(280),
  })
  .strict();

const feedbackSchema = z
  .object({
    correctFr: z.string().min(1).max(280),
    incorrectFr: z.string().min(1).max(280),
    /** Repli sur `incorrectFr` quand aucune variante ne correspond. */
    variants: z
      .array(feedbackVariantSchema)
      .max(CONTENT_SCHEMA_LIMITS.feedbackVariantsPerExercise)
      .default([]),
  })
  .strict();

export const exerciseMechanicSchema = z.enum([
  "audio_choice",
  "association",
  "word_order",
  "recall",
  "reading",
]);

/**
 * Rattachement d'un exercice au vivier dont il est un tirage.
 *
 * Le curriculum rédigé ne décrit pas des exercices isolés mais des blocs
 * (« Tirages : 12 au total, ordre aléatoire »). Un bloc vaut donc douze
 * exercices, et une séance n'en joue que quelques-uns. Sans ce
 * rattachement, la séance ne saurait pas que ces douze mesurent la même
 * chose et les enchaînerait tous.
 *
 * Nullable par défaut : les exercices déjà écrits restent valides sans
 * migration, et un exercice unique n'a pas besoin d'un vivier.
 */
const poolMembership = {
  poolId: identifier.nullable().default(null),
  drawIndex: z
    .number()
    .int()
    .min(1)
    .max(CONTENT_SCHEMA_LIMITS.drawsPerPool)
    .nullable()
    .default(null),
};

const lessonPoolSchema = z
  .object({
    poolId: identifier,
    promptFr: promptFrSchema,
    mechanic: exerciseMechanicSchema,
    /** Nombre de tirages écrits pour ce vivier. */
    drawCount: z.number().int().min(1).max(CONTENT_SCHEMA_LIMITS.drawsPerPool),
    /** Tirages à réussir pour valider le vivier, « 9 sur 12 ». */
    passRequired: z
      .number()
      .int()
      .min(1)
      .max(CONTENT_SCHEMA_LIMITS.drawsPerPool),
    /** Tirages effectivement joués dans une séance. */
    sampleSize: z.number().int().min(1).max(CONTENT_SCHEMA_LIMITS.drawsPerPool),
  })
  .strict()
  .superRefine((pool, context) => {
    if (pool.passRequired > pool.drawCount) {
      context.addIssue({
        code: "custom",
        message: "Le seuil de réussite dépasse le nombre de tirages écrits.",
        path: ["passRequired"],
      });
    }
    if (pool.sampleSize > pool.drawCount) {
      context.addIssue({
        code: "custom",
        message: "On ne peut pas jouer plus de tirages qu'il n'en existe.",
        path: ["sampleSize"],
      });
    }
    if (pool.passRequired > pool.sampleSize) {
      context.addIssue({
        code: "custom",
        message:
          "Un seuil supérieur au nombre de tirages joués rend le vivier impossible à valider.",
        path: ["passRequired"],
      });
    }
  });

const audioChoiceExerciseSchema = z
  .object({
    ...poolMembership,
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
    ...poolMembership,
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
    ...poolMembership,
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
    ...poolMembership,
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
    ...poolMembership,
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
    /**
     * Viviers de tirages. Vide par défaut : une leçon dont chaque exercice
     * est unique n'en a pas besoin, et les leçons déjà écrites restent
     * valides sans migration.
     */
    pools: z
      .array(lessonPoolSchema)
      .max(CONTENT_SCHEMA_LIMITS.poolsPerLesson)
      .default([]),
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

/**
 * Ce qui a produit un son synthétique. Le brief exige que le fournisseur,
 * le modèle, la version et les paramètres soient conservés : sans eux, un
 * audio n'est pas reproductible et son défaut n'est pas explicable.
 */
const synthesisSchema = z
  .object({
    provider: z.string().min(1).max(80),
    model: z.string().min(1).max(120),
    voice: z.string().min(1).max(80),
    /** Texte exactement envoyé au fournisseur, souvent différent de l'item. */
    sourceText: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
    parameters: z.record(z.string(), z.string()).default({}),
    generatedAt: utcDateTime,
  })
  .strict();

const roundTripSchema = z
  .object({
    transcriber: z.string().min(1).max(120),
    /** Ce que la reconnaissance vocale a relu dans l'audio produit. */
    transcript: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
    matchesSource: z.boolean(),
    checkedAt: utcDateTime,
  })
  .strict();

/**
 * Formes de contour acceptables pour chaque ton, en forme de citation.
 *
 * Volontairement tolérant : un même ton admet plusieurs réalisations selon
 * la voix et le débit. Le but n'est pas de noter finement, c'est de refuser
 * l'inverse exact, par exemple un ton montant réalisé descendant, qui ne
 * produit pas un accent approximatif mais un autre mot. Les contours de
 * référence sont ceux décrits en leçon 1A avec leurs sources.
 */
const TONS = ["mid", "low", "falling", "high", "rising"] as const;
const FORMES = ["level", "rising", "falling", "peaking", "dipping"] as const;

const SHAPES_ATTENDUES: Record<
  (typeof TONS)[number],
  readonly (typeof FORMES)[number][]
> = {
  mid: ["level"],
  low: ["level", "falling"],
  falling: ["falling", "peaking"],
  high: ["rising", "peaking"],
  rising: ["rising", "dipping"],
};

/**
 * Contrôle acoustique du ton, mesuré sur le signal lui-même.
 *
 * Pourquoi ce contrôle existe en plus de l'aller-retour : une reconnaissance
 * vocale possède son propre modèle de langue et corrige vers le mot le plus
 * probable, ce qui masque exactement l'erreur cherchée. Mesuré le
 * 2026-08-04, `gpt-4o-transcribe` ne rend même pas d'écriture thaïe sur une
 * syllabe isolée, et `whisper-1` hallucine. La hauteur, elle, est une
 * grandeur physique : aucun modèle ne s'interpose.
 *
 * Voir `scripts/verification/f0-contour.mjs`.
 */
const toneCheckSchema = z
  .object({
    method: z.literal("f0_contour"),
    /** Outil et version, pour que la mesure reste reproductible. */
    tool: z.string().min(1).max(160),
    expectedTone: z.enum(TONS),
    /** Forme observée du contour, indépendamment du ton attendu. */
    observedShape: z.enum(FORMES),
    /** Pente début vers fin, en demi-tons. Négative si la voix descend. */
    semitoneSlope: z.number().min(-48).max(48),
    /** Étendue entre le point le plus bas et le plus haut, en demi-tons. */
    semitoneRange: z.number().min(0).max(48),
    /** La forme mesurée est-elle compatible avec le ton attendu. */
    consistent: z.boolean(),
    checkedAt: utcDateTime,
  })
  .strict();

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
    voiceKind: z.enum(["synthetic_test_tone", "synthetic_tts", "native_human"]),
    consentReference: nullableText,
    /** Traçabilité exigée par le brief : qui a produit ce son, et comment. */
    synthesis: synthesisSchema.nullable().default(null),
    /**
     * Contrôle aller-retour : l'audio produit est retranscrit, et la
     * transcription comparée à la graphie demandée. Sur une paire minimale
     * de tons, c'est un test de ton, pas seulement d'intelligibilité.
     */
    roundTrip: roundTripSchema.nullable().default(null),
    /**
     * Contrôle acoustique du contour de hauteur. Preuve indépendante de
     * l'aller-retour, et la seule des deux dont le juge ne soit pas un
     * modèle de langue.
     */
    toneCheck: toneCheckSchema.nullable().default(null),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.voiceKind === "synthetic_tts" && entry.synthesis === null) {
      context.addIssue({
        code: "custom",
        message:
          "Une voix synthétique doit conserver son fournisseur, son modèle et ses paramètres.",
        path: ["synthesis"],
      });
    }
    if (entry.voiceKind === "native_human" && entry.consentReference === null) {
      context.addIssue({
        code: "custom",
        message: "Une voix humaine exige une référence de consentement.",
        path: ["consentReference"],
      });
    }
    if (entry.voiceKind !== "synthetic_tts" && entry.synthesis !== null) {
      context.addIssue({
        code: "custom",
        message: "Seule une voix synthétique porte des paramètres de synthèse.",
        path: ["synthesis"],
      });
    }
    // Un contour mesuré et déclaré compatible alors que la forme observée
    // contredit le ton attendu serait une attestation complaisante. On
    // vérifie donc la cohérence interne de la déclaration elle-même.
    if (entry.toneCheck !== null && entry.toneCheck.consistent) {
      const attendu = SHAPES_ATTENDUES[entry.toneCheck.expectedTone];
      if (!attendu.includes(entry.toneCheck.observedShape)) {
        context.addIssue({
          code: "custom",
          message:
            `Un ton « ${entry.toneCheck.expectedTone} » ne peut pas être déclaré ` +
            `conforme avec un contour « ${entry.toneCheck.observedShape} ».`,
          path: ["toneCheck", "consistent"],
        });
      }
    }
  });

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
