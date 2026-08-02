import { z } from "zod";

import { idempotencyKeySchema } from "./contracts";

export const CONTENT_REPORT_CATEGORIES = [
  "orthography",
  "meaning",
  "pronunciation",
  "tone",
  "vowel_length",
  "register",
  "naturalness",
  "audio",
] as const;

export const CONTENT_REPORT_PLATFORMS = ["web", "ios", "android"] as const;
export const CONTENT_REPORT_RESPONSE_STATUSES = [
  "received",
  "duplicate",
] as const;

export const CONTENT_REPORT_IDEMPOTENCY_HEADER = "Idempotency-Key";
export const CONTENT_REPORT_OUTBOX_LEGACY_FORMAT =
  "thainaute.content-report-outbox/v1" as const;
export const CONTENT_REPORT_OUTBOX_FORMAT =
  "thainaute.content-report-outbox/v2" as const;
export const CONTENT_REPORT_REJECTION_REASONS = [
  "invalid_request",
  "idempotency_key_reused",
] as const;

/**
 * Un signalement est une alerte rare, pas une télémétrie. Cinquante entrées
 * permettent une reprise hors ligne réaliste tout en bornant strictement la
 * rétention locale. Une file pleine doit être synchronisée avant tout ajout.
 */
export const MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES = 50;

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z.iso
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());

export const contentReportCategorySchema = z.enum(CONTENT_REPORT_CATEGORIES);
export const contentReportPlatformSchema = z.enum(CONTENT_REPORT_PLATFORMS);

/** Corps public fermé de la mutation HTTP de signalement. */
export const contentReportRequestSchema = z.strictObject({
  contentVersionId: canonicalUuidSchema,
  exerciseId: canonicalUuidSchema,
  category: contentReportCategorySchema,
  platform: contentReportPlatformSchema,
});

/** L'identité de la mutation reste dans l'en-tête, jamais dans le corps. */
export const contentReportHeadersSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
});

export interface ContentReportHeaderReader {
  get(name: string): string | null;
}

export function parseContentReportHeaders(
  headers: ContentReportHeaderReader,
): ContentReportHeaders {
  return contentReportHeadersSchema.parse({
    idempotencyKey: headers.get(CONTENT_REPORT_IDEMPOTENCY_HEADER),
  });
}

/** Réponse 2xx fermée, identique pour une création et son rejeu exact. */
export const contentReportResponseSchema = z.strictObject({
  status: z.enum(CONTENT_REPORT_RESPONSE_STATUSES),
});

const reportCountSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

/** Agrégat éditorial fermé : aucun identifiant de compte ou de report. */
export const contentReportAggregateSchema = z
  .strictObject({
    total: reportCountSchema,
    byCategory: z.strictObject({
      orthography: reportCountSchema,
      meaning: reportCountSchema,
      pronunciation: reportCountSchema,
      tone: reportCountSchema,
      vowel_length: reportCountSchema,
      register: reportCountSchema,
      naturalness: reportCountSchema,
      audio: reportCountSchema,
    }),
  })
  .superRefine((aggregate, context) => {
    const total = Object.values(aggregate.byCategory).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (!Number.isSafeInteger(total) || total !== aggregate.total) {
      context.addIssue({
        code: "custom",
        message: "Le total doit être la somme exacte des catégories.",
        path: ["total"],
      });
    }
  });

/** Entrée locale complète, sans texte libre ni identité de l'utilisateur. */
export const contentReportOutboxEntrySchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  body: contentReportRequestSchema,
  createdAt: utcIsoTimestampSchema,
});

export const contentReportRejectionReasonSchema = z.enum(
  CONTENT_REPORT_REJECTION_REASONS,
);

/**
 * Refus serveur terminal conservé localement. L'entrée complète rend le
 * retrait explicite comparable sans dépendre d'un identifiant seul.
 */
export const contentReportOutboxRejectionSchema = z.strictObject({
  entry: contentReportOutboxEntrySchema,
  reason: contentReportRejectionReasonSchema,
  rejectedAt: utcIsoTimestampSchema,
});

const contentReportOutboxLegacySnapshotSchema = z
  .strictObject({
    format: z.literal(CONTENT_REPORT_OUTBOX_LEGACY_FORMAT),
    entries: z
      .array(contentReportOutboxEntrySchema)
      .max(MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES),
  })
  .superRefine(validateUniqueEntryKeys);

export const contentReportOutboxSnapshotSchema = z
  .strictObject({
    format: z.literal(CONTENT_REPORT_OUTBOX_FORMAT),
    entries: z
      .array(contentReportOutboxEntrySchema)
      .max(MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES),
    rejection: contentReportOutboxRejectionSchema.nullable(),
  })
  .superRefine((snapshot, context) => {
    validateUniqueEntryKeys(snapshot, context);
    if (
      snapshot.rejection !== null &&
      (snapshot.entries[0] === undefined ||
        !entriesAreEqual(snapshot.entries[0], snapshot.rejection.entry))
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Un refus durable doit correspondre exactement à la tête FIFO.",
        path: ["rejection", "entry"],
      });
    }
  });

export type ContentReportCategory = z.infer<typeof contentReportCategorySchema>;
export type ContentReportPlatform = z.infer<typeof contentReportPlatformSchema>;
export type ContentReportRequest = z.infer<typeof contentReportRequestSchema>;
export type ContentReportHeaders = z.infer<typeof contentReportHeadersSchema>;
export type ContentReportResponse = z.infer<typeof contentReportResponseSchema>;
export type ContentReportAggregate = z.infer<
  typeof contentReportAggregateSchema
>;
export type ContentReportOutboxEntry = z.infer<
  typeof contentReportOutboxEntrySchema
>;
export type ContentReportRejectionReason = z.infer<
  typeof contentReportRejectionReasonSchema
>;
export type ContentReportOutboxRejection = z.infer<
  typeof contentReportOutboxRejectionSchema
>;
export type ContentReportOutboxSnapshot = z.infer<
  typeof contentReportOutboxSnapshotSchema
>;

export class ContentReportOutboxCapacityError extends Error {
  public constructor() {
    super(
      "La file de signalements est pleine. Reconnectez-vous avant de poursuivre.",
    );
    this.name = "ContentReportOutboxCapacityError";
  }
}

export class ContentReportOutboxCollisionError extends Error {
  public readonly idempotencyKey: string;

  public constructor(idempotencyKey: string) {
    super(
      `La clé d'idempotence ${idempotencyKey} existe avec un autre signalement.`,
    );
    this.name = "ContentReportOutboxCollisionError";
    this.idempotencyKey = idempotencyKey;
  }
}

export class ContentReportOutboxAckMismatchError extends Error {
  public constructor() {
    super("L'accusé ne correspond pas exactement à la tête de la file.");
    this.name = "ContentReportOutboxAckMismatchError";
  }
}

export class ContentReportOutboxRejectionMismatchError extends Error {
  public constructor() {
    super("Le refus ne correspond pas exactement à la tête de la file.");
    this.name = "ContentReportOutboxRejectionMismatchError";
  }
}

function bodiesAreEqual(
  left: ContentReportRequest,
  right: ContentReportRequest,
): boolean {
  return (
    left.contentVersionId === right.contentVersionId &&
    left.exerciseId === right.exerciseId &&
    left.category === right.category &&
    left.platform === right.platform
  );
}

function entriesAreEqual(
  left: ContentReportOutboxEntry,
  right: ContentReportOutboxEntry,
): boolean {
  return (
    left.idempotencyKey === right.idempotencyKey &&
    left.createdAt === right.createdAt &&
    bodiesAreEqual(left.body, right.body)
  );
}

export function contentReportOutboxEntriesAreEqual(
  leftInput: ContentReportOutboxEntry,
  rightInput: ContentReportOutboxEntry,
): boolean {
  return entriesAreEqual(
    contentReportOutboxEntrySchema.parse(leftInput),
    contentReportOutboxEntrySchema.parse(rightInput),
  );
}

function rejectionsAreEqual(
  left: ContentReportOutboxRejection,
  right: ContentReportOutboxRejection,
): boolean {
  return (
    entriesAreEqual(left.entry, right.entry) &&
    left.reason === right.reason &&
    left.rejectedAt === right.rejectedAt
  );
}

function validateUniqueEntryKeys(
  snapshot: { readonly entries: readonly ContentReportOutboxEntry[] },
  context: z.RefinementCtx,
): void {
  const keys = new Set<string>();
  snapshot.entries.forEach((entry, index) => {
    if (keys.has(entry.idempotencyKey)) {
      context.addIssue({
        code: "custom",
        message: "Chaque clé d'idempotence doit être unique dans la file.",
        path: ["entries", index, "idempotencyKey"],
      });
    }
    keys.add(entry.idempotencyKey);
  });
}

/** Canonicalise une entrée avant sa première écriture durable. */
export function createContentReportOutboxEntry(
  entryInput: ContentReportOutboxEntry,
): ContentReportOutboxEntry {
  return contentReportOutboxEntrySchema.parse(entryInput);
}

/** Crée la file locale vide, fermée et versionnée. */
export function createContentReportOutbox(): ContentReportOutboxSnapshot {
  return contentReportOutboxSnapshotSchema.parse({
    format: CONTENT_REPORT_OUTBOX_FORMAT,
    entries: [],
    rejection: null,
  });
}

/**
 * Ajoute en FIFO. Un rejeu exact de la même clé et du même corps est neutre ;
 * une collision de corps ferme la file sans remplacer l'entrée durable.
 */
export function enqueueContentReport(
  snapshotInput: ContentReportOutboxSnapshot,
  entryInput: ContentReportOutboxEntry,
): ContentReportOutboxSnapshot {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  const entry = contentReportOutboxEntrySchema.parse(entryInput);
  const existing = snapshot.entries.find(
    (candidate) => candidate.idempotencyKey === entry.idempotencyKey,
  );

  if (existing !== undefined) {
    if (bodiesAreEqual(existing.body, entry.body)) return snapshot;
    throw new ContentReportOutboxCollisionError(entry.idempotencyKey);
  }

  if (snapshot.entries.length >= MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES) {
    throw new ContentReportOutboxCapacityError();
  }

  return contentReportOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: [...snapshot.entries, entry],
  });
}

/** Retourne uniquement la tête FIFO validée, sans modifier la file. */
export function peekContentReport(
  snapshotInput: ContentReportOutboxSnapshot,
): ContentReportOutboxEntry | null {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  if (snapshot.rejection !== null) return null;
  return snapshot.entries[0] ?? null;
}

/** Retourne le refus durable de tête, sans exposer d'identité de compte. */
export function readContentReportOutboxRejection(
  snapshotInput: ContentReportOutboxSnapshot,
): ContentReportOutboxRejection | null {
  return contentReportOutboxSnapshotSchema.parse(snapshotInput).rejection;
}

export function countPendingContentReports(
  snapshotInput: ContentReportOutboxSnapshot,
): number {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  return snapshot.entries.length - (snapshot.rejection === null ? 0 : 1);
}

export function countRejectedContentReports(
  snapshotInput: ContentReportOutboxSnapshot,
): 0 | 1 {
  return contentReportOutboxSnapshotSchema.parse(snapshotInput).rejection ===
    null
    ? 0
    : 1;
}

/**
 * Transforme uniquement la tête pendante exacte en refus durable. Aucun autre
 * statut HTTP ne doit appeler cette primitive.
 */
export function rejectContentReport(
  snapshotInput: ContentReportOutboxSnapshot,
  rejectedEntryInput: ContentReportOutboxEntry,
  rejectionInput: {
    readonly reason: ContentReportRejectionReason;
    readonly rejectedAt: string;
  },
): ContentReportOutboxSnapshot {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  const rejectedEntry =
    contentReportOutboxEntrySchema.parse(rejectedEntryInput);
  const rejection = contentReportOutboxRejectionSchema.parse({
    entry: rejectedEntry,
    ...rejectionInput,
  });
  const head = snapshot.entries[0];

  if (
    head === undefined ||
    !entriesAreEqual(head, rejectedEntry) ||
    (snapshot.rejection !== null &&
      (snapshot.rejection.reason !== rejection.reason ||
        !entriesAreEqual(snapshot.rejection.entry, rejectedEntry)))
  ) {
    throw new ContentReportOutboxRejectionMismatchError();
  }
  // Deux flushes concurrents peuvent observer le même refus avec des horloges
  // différentes. Le premier horodatage durable gagne sans réécriture.
  if (snapshot.rejection !== null) return snapshot;

  return contentReportOutboxSnapshotSchema.parse({
    ...snapshot,
    rejection,
  });
}

/**
 * Retire un refus uniquement après une action utilisateur explicite portant
 * sur l'entrée, la raison et l'horodatage exacts.
 */
export function discardRejectedContentReport(
  snapshotInput: ContentReportOutboxSnapshot,
  expectedRejectionInput: ContentReportOutboxRejection,
): ContentReportOutboxSnapshot {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  const expectedRejection = contentReportOutboxRejectionSchema.parse(
    expectedRejectionInput,
  );

  if (
    snapshot.rejection === null ||
    !rejectionsAreEqual(snapshot.rejection, expectedRejection)
  ) {
    throw new ContentReportOutboxRejectionMismatchError();
  }

  return contentReportOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: snapshot.entries.slice(1),
    rejection: null,
  });
}

/**
 * Retire uniquement la tête exacte après une réponse 2xx validée. La clé, le
 * corps et `createdAt` empêchent qu'une réponse ancienne acquitte une entrée
 * remplacée ou différente.
 */
export function ackContentReport(
  snapshotInput: ContentReportOutboxSnapshot,
  acknowledgedEntryInput: ContentReportOutboxEntry,
  responseInput: ContentReportResponse,
): ContentReportOutboxSnapshot {
  const snapshot = contentReportOutboxSnapshotSchema.parse(snapshotInput);
  const acknowledgedEntry = contentReportOutboxEntrySchema.parse(
    acknowledgedEntryInput,
  );
  contentReportResponseSchema.parse(responseInput);

  const head = snapshot.entries[0];
  if (
    snapshot.rejection !== null ||
    head === undefined ||
    !entriesAreEqual(head, acknowledgedEntry)
  ) {
    throw new ContentReportOutboxAckMismatchError();
  }

  return contentReportOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: snapshot.entries.slice(1),
  });
}

/** JSON strict validé avant écriture dans IndexedDB ou SQLite. */
export function serializeContentReportOutbox(
  snapshot: ContentReportOutboxSnapshot,
): string {
  return JSON.stringify(contentReportOutboxSnapshotSchema.parse(snapshot));
}

/**
 * Lecture stricte avec migration v1 → v2 sans perte. Tout champ inconnu reste
 * refusé dans les deux formats et seule la sérialisation v2 est produite.
 */
export function deserializeContentReportOutbox(
  serialized: string,
): ContentReportOutboxSnapshot {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new Error("La file de signalements n'est pas un JSON valide.", {
      cause: error,
    });
  }

  const current = contentReportOutboxSnapshotSchema.safeParse(candidate);
  if (current.success) return current.data;

  const legacy = contentReportOutboxLegacySnapshotSchema.safeParse(candidate);
  if (!legacy.success) throw current.error;
  return contentReportOutboxSnapshotSchema.parse({
    format: CONTENT_REPORT_OUTBOX_FORMAT,
    entries: legacy.data.entries,
    rejection: null,
  });
}
