import { z, type ZodIssue } from "zod";

import {
  getPublicationBlockers,
  publicationBlockerSchema,
  type PublicationBlocker,
} from "./audit";
import {
  CONTENT_SCHEMA_LIMITS,
  auditDimensionSchema,
  auditStatusSchema,
  contentBundleSchema,
  contentVisibilitySchema,
  workflowStatusSchema,
  type ContentBundle,
} from "./schemas";
import { validateBundleMetadata } from "./validation";

export const CONTENT_REVIEW_MAX_ISSUES = 50;
export const CONTENT_REVIEW_MAX_SUMMARY_ENTRIES = 50;

const safePathSegmentSchema = z.union([
  z.string().min(1).max(64),
  z.number().int().nonnegative().max(999_999),
]);

export const contentReviewIssueSchema = z.strictObject({
  code: z.enum(["SCHEMA_INVALID", "METADATA_INVALID"]),
  path: z.array(safePathSegmentSchema).max(16),
  message: z.string().min(1).max(160),
});

const auditReviewEntrySchema = z.strictObject({
  dimension: auditDimensionSchema,
  status: auditStatusSchema,
  auditorKind: z.enum(["human", "ai"]),
});

const sourceReviewEntrySchema = z.strictObject({
  sourceId: z.string().min(1).max(120),
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
  consultedAt: z.string().datetime({ offset: true }),
  commercialUse: z.boolean(),
  redistribution: z.boolean(),
  publicationAuthorized: z.boolean(),
});

const findingReviewEntrySchema = z.strictObject({
  code: z.string().min(1).max(120),
  status: z.enum(["open", "resolved"]),
  blocking: z.boolean(),
});

const unicodeItemReviewEntrySchema = z.strictObject({
  itemId: z.string().min(1).max(120),
  thaiRaw: z.string().min(1).max(CONTENT_SCHEMA_LIMITS.thaiRawLength),
  declaredCodePoints: z
    .array(z.string().regex(/^U\+[0-9A-F]{4,6}$/u))
    .min(1)
    .max(CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem),
  actualCodePoints: z
    .array(z.string().regex(/^U\+[0-9A-F]{4,6}$/u))
    .min(1)
    .max(CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem),
  exactMatch: z.boolean(),
});

const audioReviewEntrySchema = z.strictObject({
  assetId: z.string().min(1).max(120),
  itemId: z.string().min(1).max(120),
  variant: z.enum(["fixture", "natural", "pedagogical"]),
  voiceKind: z.enum(["synthetic_test_tone", "synthetic_tts", "native_human"]),
  consentStatus: z.enum(["not_applicable", "present", "missing"]),
});

export const contentReviewSummarySchema = z.strictObject({
  lesson: z.strictObject({
    lessonId: z.string().min(1).max(120),
    versionId: z.string().min(1).max(120),
    revision: z.number().int().positive(),
    titleFr: z.string().min(1).max(160),
    workflowStatus: workflowStatusSchema,
    visibility: contentVisibilitySchema,
    publishedAt: z.string().datetime({ offset: true }).nullable(),
  }),
  audits: z.strictObject({
    total: z.number().int().nonnegative(),
    passed: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    conflict: z.number().int().nonnegative(),
    entries: z.array(auditReviewEntrySchema).max(7),
  }),
  sources: z.strictObject({
    total: z.number().int().nonnegative(),
    truncated: z.boolean(),
    entries: z
      .array(sourceReviewEntrySchema)
      .max(CONTENT_REVIEW_MAX_SUMMARY_ENTRIES),
  }),
  findings: z.strictObject({
    total: z.number().int().nonnegative(),
    open: z.number().int().nonnegative(),
    openBlocking: z.number().int().nonnegative(),
    truncated: z.boolean(),
    entries: z
      .array(findingReviewEntrySchema)
      .max(CONTENT_REVIEW_MAX_SUMMARY_ENTRIES),
  }),
  items: z.strictObject({
    total: z.number().int().nonnegative(),
    unicodeMismatches: z.number().int().nonnegative(),
    truncated: z.boolean(),
    entries: z
      .array(unicodeItemReviewEntrySchema)
      .max(CONTENT_REVIEW_MAX_SUMMARY_ENTRIES),
  }),
  audio: z.strictObject({
    manifestId: z.string().min(1).max(120),
    total: z.number().int().nonnegative(),
    nativeHuman: z.number().int().nonnegative(),
    missingConsent: z.number().int().nonnegative(),
    truncated: z.boolean(),
    entries: z
      .array(audioReviewEntrySchema)
      .max(CONTENT_REVIEW_MAX_SUMMARY_ENTRIES),
  }),
});

/** Enveloppe HTTP v1. Le bundle reste unknown afin que la revue rapporte ses erreurs. */
export const contentReviewRequestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  bundle: z.unknown(),
});

export const contentReviewResponseSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    valid: z.boolean(),
    publishable: z.boolean(),
    issues: z.array(contentReviewIssueSchema).max(CONTENT_REVIEW_MAX_ISSUES),
    blockers: z.array(publicationBlockerSchema).max(64),
    summary: contentReviewSummarySchema.nullable(),
  })
  .superRefine((report, context) => {
    const expectedPublishable = report.valid && report.blockers.length === 0;
    if (report.publishable !== expectedPublishable) {
      context.addIssue({
        code: "custom",
        path: ["publishable"],
        message: "Le verdict doit correspondre à la validité et aux blocages.",
      });
    }
    if (report.valid === report.issues.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["issues"],
        message: "La validité doit correspondre à la présence de problèmes.",
      });
    }
    if (report.valid && report.summary === null) {
      context.addIssue({
        code: "custom",
        path: ["summary"],
        message: "Un rapport valide doit contenir un résumé.",
      });
    }
    if (!report.valid && report.blockers.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["blockers"],
        message: "Un rapport invalide doit rester bloqué.",
      });
    }
  });

export type ContentReviewIssue = z.infer<typeof contentReviewIssueSchema>;
export type ContentReviewSummary = z.infer<typeof contentReviewSummarySchema>;
export type ContentReviewRequest = z.infer<typeof contentReviewRequestSchema>;
export type ContentReviewResponse = z.infer<typeof contentReviewResponseSchema>;

const SAFE_PATH_FIELDS = new Set([
  "lesson",
  "audioManifest",
  "sources",
  "schemaVersion",
  "lessonId",
  "versionId",
  "revision",
  "workflowStatus",
  "visibility",
  "publishedAt",
  "locale",
  "titleFr",
  "objectiveFr",
  "requiredEntitlement",
  "audioManifestId",
  "items",
  "exercises",
  "provenance",
  "id",
  "thaiRaw",
  "unicodeCodePoints",
  "translationFr",
  "transcription",
  "systemVersion",
  "value",
  "syllables",
  "ipa",
  "tone",
  "vowelLength",
  "initial",
  "final",
  "register",
  "sourceIds",
  "type",
  "itemId",
  "skill",
  "audioAssetId",
  "promptFr",
  "options",
  "labelFr",
  "pairs",
  "tokens",
  "correctOrder",
  "acceptedAnswers",
  "answerPolicy",
  "normalization",
  "trimWhitespace",
  "collapseInnerWhitespace",
  "correctOptionId",
  "feedback",
  "correctFr",
  "incorrectFr",
  "generationActors",
  "audits",
  "findings",
  "actorId",
  "kind",
  "role",
  "dimension",
  "status",
  "auditor",
  "code",
  "blocking",
  "note",
  "manifestId",
  "lessonVersionId",
  "entries",
  "assetId",
  "variant",
  "canonicalPath",
  "distributionPaths",
  "mimeType",
  "sha256",
  "byteLength",
  "durationMs",
  "voiceKind",
  "consentReference",
  "sourceId",
  "label",
  "versionSource",
  "confidence",
  "license",
  "commercialUse",
  "redistribution",
  "publicationAuthorized",
  "consultedAt",
]);

function sanitizePath(
  path: readonly PropertyKey[],
): ContentReviewIssue["path"] {
  return path.slice(0, 16).map((segment) => {
    if (typeof segment === "number") {
      return Math.min(Math.max(segment, 0), 999_999);
    }
    if (typeof segment === "string" && SAFE_PATH_FIELDS.has(segment)) {
      return segment;
    }
    return "$field";
  });
}

function safeSchemaMessage(issue: ZodIssue): string {
  switch (issue.code) {
    case "invalid_type":
      return "Le type de donnée attendu n'est pas respecté.";
    case "invalid_value":
      return "La valeur ne fait pas partie des choix autorisés.";
    case "too_small":
      return "Une valeur requise est absente ou trop courte.";
    case "too_big":
      return "Une valeur ou une collection dépasse la limite autorisée.";
    case "invalid_format":
      return "Le format de la valeur n'est pas valide.";
    case "unrecognized_keys":
      return "Le document contient au moins un champ non autorisé.";
    case "custom":
      return "Une règle de cohérence du schéma n'est pas respectée.";
    default:
      return "Le document ne respecte pas le schéma de contenu.";
  }
}

function codePoints(value: string): string[] {
  return [...value].map((character) => {
    const point = character.codePointAt(0);
    return `U+${String(point?.toString(16).toUpperCase()).padStart(4, "0")}`;
  });
}

function countAuditStatus(
  bundle: ContentBundle,
  status: ContentBundle["lesson"]["provenance"]["audits"][number]["status"],
): number {
  return bundle.lesson.provenance.audits.filter(
    (audit) => audit.status === status,
  ).length;
}

function buildSummary(bundle: ContentBundle): ContentReviewSummary {
  const { lesson, audioManifest, sources } = bundle;
  const sourceEntries = sources.slice(0, CONTENT_REVIEW_MAX_SUMMARY_ENTRIES);
  const findingEntries = lesson.provenance.findings.slice(
    0,
    CONTENT_REVIEW_MAX_SUMMARY_ENTRIES,
  );
  const itemEntries = lesson.items.slice(0, CONTENT_REVIEW_MAX_SUMMARY_ENTRIES);
  const audioEntries = audioManifest.entries.slice(
    0,
    CONTENT_REVIEW_MAX_SUMMARY_ENTRIES,
  );
  const unicodeRows = itemEntries.map((item) => {
    const actualCodePoints = codePoints(item.thaiRaw);
    return {
      itemId: item.id,
      thaiRaw: item.thaiRaw,
      declaredCodePoints: item.unicodeCodePoints,
      actualCodePoints,
      exactMatch:
        JSON.stringify(item.unicodeCodePoints) ===
        JSON.stringify(actualCodePoints),
    };
  });

  return {
    lesson: {
      lessonId: lesson.lessonId,
      versionId: lesson.versionId,
      revision: lesson.revision,
      titleFr: lesson.titleFr,
      workflowStatus: lesson.workflowStatus,
      visibility: lesson.visibility,
      publishedAt: lesson.publishedAt,
    },
    audits: {
      total: lesson.provenance.audits.length,
      passed: countAuditStatus(bundle, "passed"),
      pending: countAuditStatus(bundle, "pending"),
      failed: countAuditStatus(bundle, "failed"),
      conflict: countAuditStatus(bundle, "conflict"),
      entries: lesson.provenance.audits.map(
        ({ dimension, status, auditor }) => ({
          dimension,
          status,
          auditorKind: auditor.kind,
        }),
      ),
    },
    sources: {
      total: sources.length,
      truncated: sources.length > sourceEntries.length,
      entries: sourceEntries.map(
        ({
          sourceId,
          label,
          kind,
          versionSource,
          confidence,
          license,
          consultedAt,
          commercialUse,
          redistribution,
          publicationAuthorized,
        }) => ({
          sourceId,
          label,
          kind,
          versionSource,
          confidence,
          license,
          consultedAt,
          commercialUse,
          redistribution,
          publicationAuthorized,
        }),
      ),
    },
    findings: {
      total: lesson.provenance.findings.length,
      open: lesson.provenance.findings.filter(
        (finding) => finding.status === "open",
      ).length,
      openBlocking: lesson.provenance.findings.filter(
        (finding) => finding.status === "open" && finding.blocking,
      ).length,
      truncated: lesson.provenance.findings.length > findingEntries.length,
      entries: findingEntries.map(({ code, status, blocking }) => ({
        code,
        status,
        blocking,
      })),
    },
    items: {
      total: lesson.items.length,
      unicodeMismatches: lesson.items.filter((item) => {
        return (
          JSON.stringify(item.unicodeCodePoints) !==
          JSON.stringify(codePoints(item.thaiRaw))
        );
      }).length,
      truncated: lesson.items.length > itemEntries.length,
      entries: unicodeRows,
    },
    audio: {
      manifestId: audioManifest.manifestId,
      total: audioManifest.entries.length,
      nativeHuman: audioManifest.entries.filter(
        (entry) => entry.voiceKind === "native_human",
      ).length,
      missingConsent: audioManifest.entries.filter(
        (entry) =>
          entry.voiceKind === "native_human" && entry.consentReference === null,
      ).length,
      truncated: audioManifest.entries.length > audioEntries.length,
      entries: audioEntries.map(
        ({ assetId, itemId, variant, voiceKind, consentReference }) => ({
          assetId,
          itemId,
          variant,
          voiceKind,
          consentStatus:
            voiceKind !== "native_human"
              ? ("not_applicable" as const)
              : consentReference === null
                ? ("missing" as const)
                : ("present" as const),
        }),
      ),
    },
  };
}

function invalidBundleBlocker(): PublicationBlocker {
  return {
    code: "INVALID_CONTENT_BUNDLE",
    detail: "Le bundle doit être valide avant toute publication.",
  };
}

function invalidSchemaResponse(
  issues: readonly ZodIssue[],
): ContentReviewResponse {
  return {
    schemaVersion: 1,
    valid: false,
    publishable: false,
    issues: issues.slice(0, CONTENT_REVIEW_MAX_ISSUES).map((issue) => ({
      code: "SCHEMA_INVALID",
      path: sanitizePath(issue.path),
      message: safeSchemaMessage(issue),
    })),
    blockers: [invalidBundleBlocker()],
    summary: null,
  };
}

/**
 * Produit un rapport éditorial déterministe et sérialisable sans accès disque.
 * Les erreurs de schéma sont bornées et ne recopient jamais les valeurs reçues.
 */
export function reviewContentBundle(input: unknown): ContentReviewResponse {
  let parsed: ReturnType<typeof contentBundleSchema.safeParse>;
  try {
    parsed = contentBundleSchema.safeParse(input);
  } catch {
    return {
      schemaVersion: 1,
      valid: false,
      publishable: false,
      issues: [
        {
          code: "SCHEMA_INVALID",
          path: [],
          message: "Le document n'a pas pu être analysé en toute sécurité.",
        },
      ],
      blockers: [invalidBundleBlocker()],
      summary: null,
    };
  }

  if (!parsed.success) {
    return invalidSchemaResponse(parsed.error.issues);
  }

  const summary = buildSummary(parsed.data);
  const publicationBlockers = getPublicationBlockers(parsed.data);

  try {
    validateBundleMetadata(parsed.data);
  } catch {
    return {
      schemaVersion: 1,
      valid: false,
      publishable: false,
      issues: [
        {
          code: "METADATA_INVALID",
          path: [],
          message: "Les références internes du bundle sont incohérentes.",
        },
      ],
      blockers: [invalidBundleBlocker(), ...publicationBlockers],
      summary,
    };
  }

  return {
    schemaVersion: 1,
    valid: true,
    publishable: publicationBlockers.length === 0,
    issues: [],
    blockers: publicationBlockers,
    summary,
  };
}
