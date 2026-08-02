import { describe, expect, it } from "vitest";

import { parseAccountDeletionRpcResult } from "../lib/server/account-deletion/supabase-repository";

const RECEIPT_ID = "10000000-0000-4000-8000-000000000001";
const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("adaptateur du reçu de suppression", () => {
  it("garde la cible uniquement dans l'état interne en cours", () => {
    expect(
      parseAccountDeletionRpcResult(
        {
          status: "in_progress",
          receiptId: RECEIPT_ID,
          targetUserId: USER_ID,
          completedAt: null,
        },
        null,
        true,
      ),
    ).toEqual({
      kind: "in_progress",
      receiptId: RECEIPT_ID,
      targetUserId: USER_ID,
    });
  });

  it("construit le reçu public sans cible ni HMAC", () => {
    expect(
      parseAccountDeletionRpcResult(
        {
          status: "completed",
          receiptId: RECEIPT_ID,
          targetUserId: null,
          completedAt: "2026-08-02T10:00:00.000Z",
        },
        null,
        false,
      ),
    ).toEqual({
      kind: "completed",
      receipt: {
        format: "thainaute.account-deletion-receipt/v1",
        receiptId: RECEIPT_ID,
        completedAt: "2026-08-02T10:00:00.000Z",
        deleted: true,
      },
    });
  });

  it("distingue introuvable et conflit sans accepter une forme incohérente", () => {
    expect(
      parseAccountDeletionRpcResult(null, { code: "TA002" }, true),
    ).toEqual({
      kind: "not_found",
    });
    expect(
      parseAccountDeletionRpcResult(null, { code: "TA004" }, true),
    ).toEqual({
      kind: "idempotency_key_reused",
    });
    expect(() =>
      parseAccountDeletionRpcResult(
        {
          status: "completed",
          receiptId: RECEIPT_ID,
          targetUserId: USER_ID,
          completedAt: null,
        },
        null,
        false,
      ),
    ).toThrowError(expect.objectContaining({ code: "database_unavailable" }));
  });

  it("ferme les erreurs SQL et les réponses non conformes", () => {
    expect(() =>
      parseAccountDeletionRpcResult(null, { code: "PGRST500" }, true),
    ).toThrowError(expect.objectContaining({ code: "database_unavailable" }));
    expect(() =>
      parseAccountDeletionRpcResult(null, { code: "TA002" }, false),
    ).toThrowError(expect.objectContaining({ code: "database_unavailable" }));
  });
});
