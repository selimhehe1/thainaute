import { createHmac } from "node:crypto";

import {
  ACCOUNT_DELETION_CONFIRMATION,
  accountDeletionContinuationSecretSchema,
} from "@thainaute/sync";

import type { AccountDeletionHasher } from "./ports";

const REQUEST_CANONICAL_JSON = JSON.stringify({
  confirmation: ACCOUNT_DELETION_CONFIRMATION,
});

function hmac(
  key: Uint8Array,
  domain: "subject" | "idempotency" | "request" | "continuation",
  value: string,
): string {
  return createHmac("sha256", key)
    .update(`thainaute.account-deletion/${domain}/v1\0`, "utf8")
    .update(value, "utf8")
    .digest("hex");
}

export function createAccountDeletionHasher(
  encodedPepper: string,
): AccountDeletionHasher {
  const parsed =
    accountDeletionContinuationSecretSchema.safeParse(encodedPepper);
  if (!parsed.success) {
    throw new Error("La configuration de suppression de compte est invalide.");
  }
  const pepper = Buffer.from(parsed.data, "base64url");
  if (pepper.byteLength !== 32) {
    throw new Error("La configuration de suppression de compte est invalide.");
  }

  return {
    fingerprint({ userId, headers }) {
      return {
        subjectHmac:
          userId === undefined ? "" : hmac(pepper, "subject", userId),
        idempotencyHmac: hmac(pepper, "idempotency", headers.idempotencyKey),
        requestHmac: hmac(pepper, "request", REQUEST_CANONICAL_JSON),
        continuationHmac: hmac(
          pepper,
          "continuation",
          headers.continuationSecret,
        ),
      };
    },
  };
}
