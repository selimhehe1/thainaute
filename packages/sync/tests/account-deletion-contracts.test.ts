import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DELETION_CONFIRMATION,
  ACCOUNT_DELETION_CONTINUATION_HEADER,
  ACCOUNT_DELETION_ERROR_CODES,
  ACCOUNT_DELETION_IDEMPOTENCY_HEADER,
  ACCOUNT_DELETION_RECEIPT_FORMAT,
  MAX_ACCOUNT_DELETION_ERROR_MESSAGE_LENGTH,
  accountDeletionContinuationSecretSchema,
  accountDeletionErrorResponseSchema,
  accountDeletionHeadersSchema,
  accountDeletionReceiptSchema,
  accountDeletionRequestSchema,
  parseAccountDeletionHeaders,
} from "../src/index";

const ids = {
  idempotency: "10000000-0000-4000-8000-000000000001",
  receipt: "20000000-0000-4000-8000-000000000001",
  request: "30000000-0000-4000-8000-000000000001",
} as const;

// base64url sans padding de 32 octets dont les deux derniers bits sont nuls.
const continuationSecret = "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA";

describe("contrat de suppression de compte v1", () => {
  it("exige la confirmation exacte dans un corps fermé", () => {
    expect(
      accountDeletionRequestSchema.parse({
        confirmation: ACCOUNT_DELETION_CONFIRMATION,
      }),
    ).toEqual({ confirmation: "delete_account" });
    expect(
      accountDeletionRequestSchema.safeParse({
        confirmation: "DELETE_ACCOUNT",
      }).success,
    ).toBe(false);
    expect(
      accountDeletionRequestSchema.safeParse({
        confirmation: "delete_account ",
      }).success,
    ).toBe(false);
    expect(
      accountDeletionRequestSchema.safeParse({
        confirmation: "delete_account",
        continuationSecret,
      }).success,
    ).toBe(false);
  });

  it("valide exactement 32 octets en base64url canonique", () => {
    expect(
      accountDeletionContinuationSecretSchema.parse(continuationSecret),
    ).toBe(continuationSecret);

    expect(
      accountDeletionContinuationSecretSchema.safeParse(
        continuationSecret.slice(0, -1),
      ).success,
    ).toBe(false);
    expect(
      accountDeletionContinuationSecretSchema.safeParse(
        `${continuationSecret}A`,
      ).success,
    ).toBe(false);
    expect(
      accountDeletionContinuationSecretSchema.safeParse(
        `${continuationSecret.slice(0, -1)}=`,
      ).success,
    ).toBe(false);
    expect(
      accountDeletionContinuationSecretSchema.safeParse(
        `${continuationSecret.slice(0, -1)}B`,
      ).success,
    ).toBe(false);
  });

  it("normalise l'UUID d'idempotence et lit uniquement les en-têtes prévus", () => {
    const headers = new Headers({
      [ACCOUNT_DELETION_IDEMPOTENCY_HEADER]: ids.idempotency.toUpperCase(),
      [ACCOUNT_DELETION_CONTINUATION_HEADER]: continuationSecret,
    });

    expect(parseAccountDeletionHeaders(headers)).toEqual({
      idempotencyKey: ids.idempotency,
      continuationSecret,
    });
    expect(
      accountDeletionHeadersSchema.safeParse({
        idempotencyKey: "10000000-0000-0000-0000-000000000001",
        continuationSecret,
      }).success,
    ).toBe(false);
    expect(
      accountDeletionHeadersSchema.safeParse({
        idempotencyKey: ids.idempotency,
        continuationSecret,
        authorization: "Bearer secret",
      }).success,
    ).toBe(false);
    expect(() =>
      parseAccountDeletionHeaders(
        new Headers({
          [ACCOUNT_DELETION_IDEMPOTENCY_HEADER]: ids.idempotency,
        }),
      ),
    ).toThrow();
  });

  it("valide un reçu fermé, versionné et sans secret de continuation", () => {
    const receipt = {
      format: ACCOUNT_DELETION_RECEIPT_FORMAT,
      receiptId: ids.receipt.toUpperCase(),
      completedAt: "2026-08-02T12:00:00.000+02:00",
      deleted: true,
    } as const;

    expect(accountDeletionReceiptSchema.parse(receipt)).toEqual({
      format: "thainaute.account-deletion-receipt/v1",
      receiptId: ids.receipt,
      completedAt: "2026-08-02T10:00:00.000Z",
      deleted: true,
    });
    expect(
      accountDeletionReceiptSchema.safeParse({
        ...receipt,
        continuationSecret,
      }).success,
    ).toBe(false);
    expect(
      accountDeletionReceiptSchema.safeParse({
        ...receipt,
        format: "THAINAUTE.ACCOUNT-DELETION-RECEIPT/V1",
      }).success,
    ).toBe(false);
    expect(
      accountDeletionReceiptSchema.safeParse({ ...receipt, deleted: false })
        .success,
    ).toBe(false);
  });

  it("refuse les UUID et horodatages non conformes du reçu", () => {
    const receipt = {
      format: ACCOUNT_DELETION_RECEIPT_FORMAT,
      receiptId: ids.receipt,
      completedAt: "2026-08-02T10:00:00.000Z",
      deleted: true,
    } as const;

    expect(
      accountDeletionReceiptSchema.safeParse({
        ...receipt,
        receiptId: "not-a-uuid",
      }).success,
    ).toBe(false);
    expect(
      accountDeletionReceiptSchema.safeParse({
        ...receipt,
        completedAt: "2026-08-02T10:00:00Z",
      }).success,
    ).toBe(false);
    expect(
      accountDeletionReceiptSchema.safeParse({
        ...receipt,
        completedAt: "2026-08-02T10:00:00.000",
      }).success,
    ).toBe(false);
  });

  it.each(ACCOUNT_DELETION_ERROR_CODES)(
    "accepte le code d'erreur fermé %s",
    (code) => {
      expect(
        accountDeletionErrorResponseSchema.safeParse({
          error: {
            code,
            message: "La suppression n'a pas pu aboutir.",
            requestId: ids.request,
          },
        }).success,
      ).toBe(true);
    },
  );

  it("refuse les codes, tailles, UUID et champs d'erreur non prévus", () => {
    const error = {
      code: "invalid_request",
      message: "La requête est invalide.",
      requestId: ids.request,
    } as const;

    expect(
      accountDeletionErrorResponseSchema.safeParse({
        error: { ...error, code: "INVALID_REQUEST" },
      }).success,
    ).toBe(false);
    expect(
      accountDeletionErrorResponseSchema.safeParse({
        error: {
          ...error,
          message: "x".repeat(MAX_ACCOUNT_DELETION_ERROR_MESSAGE_LENGTH + 1),
        },
      }).success,
    ).toBe(false);
    expect(
      accountDeletionErrorResponseSchema.safeParse({
        error: { ...error, requestId: "request-01" },
      }).success,
    ).toBe(false);
    expect(
      accountDeletionErrorResponseSchema.safeParse({
        error: { ...error, continuationSecret },
      }).success,
    ).toBe(false);
    expect(
      accountDeletionErrorResponseSchema.safeParse({
        error,
        debug: true,
      }).success,
    ).toBe(false);
  });
});
