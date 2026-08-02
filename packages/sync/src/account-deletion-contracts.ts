import { z } from "zod";

import { idempotencyKeySchema } from "./contracts";

export const ACCOUNT_DELETION_CONFIRMATION = "delete_account" as const;
export const ACCOUNT_DELETION_RECEIPT_FORMAT =
  "thainaute.account-deletion-receipt/v1" as const;

export const ACCOUNT_DELETION_IDEMPOTENCY_HEADER = "Idempotency-Key";
export const ACCOUNT_DELETION_CONTINUATION_HEADER =
  "Account-Deletion-Continuation";

/**
 * La commande ne contient qu'une confirmation fixe. La limite HTTP laisse la
 * place au JSON et aux espaces usuels, sans accepter un corps arbitrairement
 * volumineux avant sa validation Zod.
 */
export const MAX_ACCOUNT_DELETION_REQUEST_JSON_BYTES = 128;
export const ACCOUNT_DELETION_CONTINUATION_SECRET_BYTES = 32;
export const ACCOUNT_DELETION_CONTINUATION_SECRET_LENGTH = 43;
export const MAX_ACCOUNT_DELETION_ERROR_MESSAGE_LENGTH = 500;

export const ACCOUNT_DELETION_ERROR_CODES = [
  "invalid_request",
  "unauthorized",
  "reauthentication_required",
  "idempotency_key_reused",
  "deletion_in_progress",
  "auth_unavailable",
  "storage_unavailable",
  "database_unavailable",
  "internal_error",
] as const;

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const utcIsoTimestampSchema = z.iso
  .datetime({ precision: 3, offset: true })
  .transform((timestamp) => new Date(timestamp).toISOString());

/** Corps public et fermé de `DELETE /api/v1/account`. */
export const accountDeletionRequestSchema = z.strictObject({
  confirmation: z.literal(ACCOUNT_DELETION_CONFIRMATION),
});

/**
 * Secret de reprise généré par un CSPRNG à partir de 32 octets.
 *
 * La dernière classe de caractères impose les deux bits de bourrage nuls :
 * une valeur validée possède ainsi une représentation base64url canonique,
 * sans `=` et sans alias d'encodage. Ce secret reste un en-tête de requête ;
 * aucun schéma de réponse ne l'expose.
 */
export const accountDeletionContinuationSecretSchema = z
  .string()
  .length(ACCOUNT_DELETION_CONTINUATION_SECRET_LENGTH)
  .regex(/^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/u);

/** Valeurs normalisées des deux en-têtes obligatoires de la commande. */
export const accountDeletionHeadersSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  continuationSecret: accountDeletionContinuationSecretSchema,
});

export interface AccountDeletionHeaderReader {
  get(name: string): string | null;
}

/**
 * Lit les noms HTTP publics sans trim ni repli permissif. Une absence, une
 * valeur fusionnée ou une représentation non canonique ferme la requête.
 */
export function parseAccountDeletionHeaders(
  headers: AccountDeletionHeaderReader,
): AccountDeletionHeaders {
  return accountDeletionHeadersSchema.parse({
    idempotencyKey: headers.get(ACCOUNT_DELETION_IDEMPOTENCY_HEADER),
    continuationSecret: headers.get(ACCOUNT_DELETION_CONTINUATION_HEADER),
  });
}

/** Reçu 2xx versionné de `DELETE /api/v1/account`. */
export const accountDeletionReceiptSchema = z.strictObject({
  format: z.literal(ACCOUNT_DELETION_RECEIPT_FORMAT),
  receiptId: canonicalUuidSchema,
  completedAt: utcIsoTimestampSchema,
  deleted: z.literal(true),
});

export const accountDeletionErrorCodeSchema = z.enum(
  ACCOUNT_DELETION_ERROR_CODES,
);

/** Enveloppe fermée des erreurs de suppression de compte. */
export const accountDeletionErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: accountDeletionErrorCodeSchema,
    message: z
      .string()
      .trim()
      .min(1)
      .max(MAX_ACCOUNT_DELETION_ERROR_MESSAGE_LENGTH),
    requestId: canonicalUuidSchema,
  }),
});

export type AccountDeletionRequest = z.infer<
  typeof accountDeletionRequestSchema
>;
export type AccountDeletionContinuationSecret = z.infer<
  typeof accountDeletionContinuationSecretSchema
>;
export type AccountDeletionHeaders = z.infer<
  typeof accountDeletionHeadersSchema
>;
export type AccountDeletionReceipt = z.infer<
  typeof accountDeletionReceiptSchema
>;
export type AccountDeletionErrorCode = z.infer<
  typeof accountDeletionErrorCodeSchema
>;
export type AccountDeletionErrorResponse = z.infer<
  typeof accountDeletionErrorResponseSchema
>;
