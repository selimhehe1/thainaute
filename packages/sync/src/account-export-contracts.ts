import { SKILL_DIMENSIONS } from "@thainaute/domain";
import { z } from "zod";

import { attemptAnswerSchema } from "./contracts";

export const ACCOUNT_EXPORT_FORMAT = "thainaute.account-export/v2" as const;
export const ACCOUNT_EXPORT_FILE_NAME = "thainaute-account-export-v2.json";

/**
 * Bornes du premier export synchrone. Les adaptateurs doivent refuser le
 * document entier avant toute troncature si l'une d'elles est dépassée.
 */
export const MAX_ACCOUNT_EXPORT_DEVICES = 20;
export const MAX_ACCOUNT_EXPORT_ATTEMPTS = 10_000;
export const MAX_ACCOUNT_EXPORT_LEARNER_STATES = 10_000;
export const MAX_ACCOUNT_EXPORT_CONTENT_REPORTS = 10_000;
export const MAX_ACCOUNT_EXPORT_JSON_BYTES = 4_000_000;

export const ACCOUNT_EXPORT_ERROR_CODES = [
  "unauthorized",
  "export_capacity_exceeded",
  "concurrent_update",
  "auth_unavailable",
  "database_unavailable",
  "internal_error",
] as const;

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());
const nullableUtcIsoTimestampSchema = utcIsoTimestampSchema.nullable();
const providerNameSchema = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/u);

export const accountExportIdentitySchema = z
  .strictObject({
    id: canonicalUuidSchema,
    email: z.email().max(320).nullable(),
    phone: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/u)
      .nullable(),
    providers: z.array(providerNameSchema).max(16),
    createdAt: utcIsoTimestampSchema,
    updatedAt: nullableUtcIsoTimestampSchema,
    lastSignInAt: nullableUtcIsoTimestampSchema,
    emailConfirmedAt: nullableUtcIsoTimestampSchema,
    phoneConfirmedAt: nullableUtcIsoTimestampSchema,
  })
  .superRefine((identity, context) => {
    let previousProvider: string | undefined;
    identity.providers.forEach((provider, index) => {
      if (previousProvider !== undefined && provider <= previousProvider) {
        context.addIssue({
          code: "custom",
          message: "providers doit être trié et dédupliqué.",
          path: ["providers", index],
        });
      }
      previousProvider = provider;
    });
  });

export const accountExportProfileSchema = z.strictObject({
  createdAt: utcIsoTimestampSchema,
  syncRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

export const accountExportDeviceSchema = z.strictObject({
  id: canonicalUuidSchema,
  platform: z.enum(["web", "ios", "android"]),
  appVersion: z.string().regex(/^[0-9A-Za-z._+-]{1,32}$/u),
  createdAt: utcIsoTimestampSchema,
});

export const accountExportAttemptAnswerSchema = attemptAnswerSchema.superRefine(
  (answer, context) => {
    if (answer.kind !== "association") return;

    const promptIds = answer.pairs.map(({ promptPairId }) => promptPairId);
    const chosenIds = answer.pairs.map(({ chosenPairId }) => chosenPairId);
    if (new Set(promptIds).size !== promptIds.length) {
      context.addIssue({
        code: "custom",
        message: "Chaque paire proposée ne peut être appariée qu'une fois.",
        path: ["pairs"],
      });
    }
    if (new Set(chosenIds).size !== chosenIds.length) {
      context.addIssue({
        code: "custom",
        message: "Chaque étiquette ne peut être choisie qu'une fois.",
        path: ["pairs"],
      });
    }
  },
);

export const accountExportAttemptEventSchema = z
  .strictObject({
    eventId: canonicalUuidSchema,
    deviceId: canonicalUuidSchema,
    exerciseId: canonicalUuidSchema,
    itemId: canonicalUuidSchema,
    lessonVersionId: canonicalUuidSchema,
    /** UUID historique pour l'écoute et la lecture ; `null` sinon. */
    selectedOptionId: canonicalUuidSchema.nullable(),
    /**
     * Absent seulement dans un document v2 produit avant les réponses typées.
     * Les nouveaux exports émettent explicitement `null` pour une option.
     */
    answer: accountExportAttemptAnswerSchema.nullable().optional(),
    skill: z.enum(SKILL_DIMENSIONS),
    rating: z.union([z.literal(0), z.literal(1)]),
    answeredAt: utcIsoTimestampSchema,
    durationMs: z.number().int().min(0).max(1_800_000),
    algorithmVersion: z.string().regex(/^[0-9A-Za-z._-]{1,64}$/u),
    payloadSha256: z.string().regex(/^[0-9a-f]{64}$/u),
    receivedAt: utcIsoTimestampSchema,
  })
  .superRefine((attempt, context) => {
    const hasOption = attempt.selectedOptionId !== null;
    const hasTypedAnswer =
      attempt.answer !== undefined && attempt.answer !== null;
    if (hasOption === hasTypedAnswer) {
      context.addIssue({
        code: "custom",
        message:
          "Une tentative exportée porte soit une option choisie, soit une réponse typée.",
        path: ["answer"],
      });
    }
  });

export const accountExportContentReportSchema = z.strictObject({
  idempotencyKey: canonicalUuidSchema,
  contentVersionId: canonicalUuidSchema,
  itemId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
  category: z.enum([
    "orthography",
    "meaning",
    "pronunciation",
    "tone",
    "vowel_length",
    "register",
    "naturalness",
    "audio",
  ]),
  platform: z.enum(["web", "ios", "android"]),
  receivedAt: utcIsoTimestampSchema,
});

export const accountExportLearnerItemStateSchema = z
  .strictObject({
    itemId: canonicalUuidSchema,
    lessonVersionId: canonicalUuidSchema,
    skill: z.enum(SKILL_DIMENSIONS),
    masteryPermille: z.number().int().min(0).max(1_000),
    successfulAttempts: z.number().int().nonnegative(),
    consecutiveCorrect: z.number().int().nonnegative(),
    attemptCount: z.number().int().positive(),
    lastEventId: canonicalUuidSchema,
    lastAnsweredAt: utcIsoTimestampSchema,
    dueAt: utcIsoTimestampSchema,
    algorithmVersion: z.string().regex(/^[0-9A-Za-z._-]{1,64}$/u),
    updatedAt: utcIsoTimestampSchema,
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

function assertStrictOrder(
  values: readonly string[],
  path: string,
  context: z.RefinementCtx,
): void {
  let previous: string | undefined;
  values.forEach((value, index) => {
    if (previous !== undefined && value <= previous) {
      context.addIssue({
        code: "custom",
        message: `${path} doit être trié et dédupliqué.`,
        path: [path, index],
      });
    }
    previous = value;
  });
}

export const accountExportDataSchema = z
  .strictObject({
    profile: accountExportProfileSchema.nullable(),
    devices: z.array(accountExportDeviceSchema).max(MAX_ACCOUNT_EXPORT_DEVICES),
    attemptEvents: z
      .array(accountExportAttemptEventSchema)
      .max(MAX_ACCOUNT_EXPORT_ATTEMPTS),
    learnerItemStates: z
      .array(accountExportLearnerItemStateSchema)
      .max(MAX_ACCOUNT_EXPORT_LEARNER_STATES),
    contentReports: z
      .array(accountExportContentReportSchema)
      .max(MAX_ACCOUNT_EXPORT_CONTENT_REPORTS),
  })
  .superRefine((data, context) => {
    assertStrictOrder(
      data.devices.map((device) => `${device.createdAt}\u0000${device.id}`),
      "devices",
      context,
    );
    assertStrictOrder(
      data.attemptEvents.map(
        (attempt) => `${attempt.answeredAt}\u0000${attempt.eventId}`,
      ),
      "attemptEvents",
      context,
    );
    assertStrictOrder(
      data.learnerItemStates.map(
        (state) => `${state.itemId}\u0000${state.skill}`,
      ),
      "learnerItemStates",
      context,
    );
    assertStrictOrder(
      data.contentReports.map(
        (report) => `${report.receivedAt}\u0000${report.idempotencyKey}`,
      ),
      "contentReports",
      context,
    );

    if (
      data.profile === null &&
      (data.devices.length > 0 ||
        data.attemptEvents.length > 0 ||
        data.learnerItemStates.length > 0 ||
        data.contentReports.length > 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "Un compte sans profil ne peut pas contenir de progression.",
        path: ["profile"],
      });
    }

    const deviceIds = new Set(data.devices.map((device) => device.id));
    const eventIds = new Set(
      data.attemptEvents.map((attempt) => attempt.eventId),
    );
    data.attemptEvents.forEach((attempt, index) => {
      if (!deviceIds.has(attempt.deviceId)) {
        context.addIssue({
          code: "custom",
          message: "La tentative référence un appareil absent de l'export.",
          path: ["attemptEvents", index, "deviceId"],
        });
      }
    });
    data.learnerItemStates.forEach((state, index) => {
      if (!eventIds.has(state.lastEventId)) {
        context.addIssue({
          code: "custom",
          message: "L'état référence une tentative absente de l'export.",
          path: ["learnerItemStates", index, "lastEventId"],
        });
      }
    });
  });

export const accountExportDocumentSchema = z
  .strictObject({
    format: z.literal(ACCOUNT_EXPORT_FORMAT),
    exportedAt: utcIsoTimestampSchema,
    identity: accountExportIdentitySchema,
    data: accountExportDataSchema,
  })
  .superRefine((document, context) => {
    if (
      document.data.profile !== null &&
      document.data.profile.createdAt < document.identity.createdAt
    ) {
      context.addIssue({
        code: "custom",
        message: "Le profil ne peut pas précéder le compte Auth.",
        path: ["data", "profile", "createdAt"],
      });
    }
  });

export const accountExportErrorCodeSchema = z.enum(ACCOUNT_EXPORT_ERROR_CODES);

export const accountExportErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: accountExportErrorCodeSchema,
    message: z.string().trim().min(1).max(500),
    requestId: canonicalUuidSchema,
  }),
});

export type AccountExportIdentity = z.infer<typeof accountExportIdentitySchema>;
export type AccountExportProfile = z.infer<typeof accountExportProfileSchema>;
export type AccountExportDevice = z.infer<typeof accountExportDeviceSchema>;
export type AccountExportAttemptEvent = z.infer<
  typeof accountExportAttemptEventSchema
>;
export type AccountExportAttemptAnswer = z.infer<
  typeof accountExportAttemptAnswerSchema
>;
export type AccountExportContentReport = z.infer<
  typeof accountExportContentReportSchema
>;
export type AccountExportLearnerItemState = z.infer<
  typeof accountExportLearnerItemStateSchema
>;
export type AccountExportData = z.infer<typeof accountExportDataSchema>;
export type AccountExportDocument = z.infer<typeof accountExportDocumentSchema>;
export type AccountExportErrorCode = z.infer<
  typeof accountExportErrorCodeSchema
>;
export type AccountExportErrorResponse = z.infer<
  typeof accountExportErrorResponseSchema
>;
