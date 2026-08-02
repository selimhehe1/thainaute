import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc })),
}));

import { createSupabaseAccountDeletionReceiptRepository } from "../lib/server/account-deletion/supabase-repository";

const SIGNAL = new AbortController().signal;
const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const RECEIPT_ID = "10000000-0000-4000-8000-000000000001";
const HASHES = {
  subjectHmac: "a".repeat(64),
  idempotencyHmac: "b".repeat(64),
  requestHmac: "c".repeat(64),
  continuationHmac: "d".repeat(64),
};

function repository() {
  return createSupabaseAccountDeletionReceiptRepository({
    url: "https://project.supabase.co",
    secretKey: "sb_secret_server_only_value",
  });
}

describe("RPC Supabase des reçus de suppression", () => {
  beforeEach(() => rpc.mockReset());

  it("envoie les seuls HMAC et la cible au begin", async () => {
    rpc.mockResolvedValueOnce({
      data: {
        status: "in_progress",
        receiptId: RECEIPT_ID,
        targetUserId: USER_ID,
        completedAt: null,
      },
      error: null,
    });

    await expect(
      repository().begin({
        ...HASHES,
        targetUserId: USER_ID,
        signal: SIGNAL,
      }),
    ).resolves.toMatchObject({ kind: "in_progress", targetUserId: USER_ID });
    expect(rpc).toHaveBeenCalledWith("begin_account_deletion_v1", {
      p_subject_hmac_sha256: HASHES.subjectHmac,
      p_idempotency_hmac_sha256: HASHES.idempotencyHmac,
      p_request_hmac_sha256: HASHES.requestHmac,
      p_continuation_hmac_sha256: HASHES.continuationHmac,
      p_target_user_id: USER_ID,
    });
  });

  it("reprend sans sujet ni UUID utilisateur", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: "TA002" } });
    await expect(
      repository().resume({
        idempotencyHmac: HASHES.idempotencyHmac,
        continuationHmac: HASHES.continuationHmac,
        signal: SIGNAL,
      }),
    ).resolves.toEqual({ kind: "not_found" });
    expect(rpc).toHaveBeenCalledWith("resume_account_deletion_v1", {
      p_idempotency_hmac_sha256: HASHES.idempotencyHmac,
      p_continuation_hmac_sha256: HASHES.continuationHmac,
    });
  });

  it("relit la finalisation transactionnelle vers le reçu public", async () => {
    rpc.mockResolvedValueOnce({
      data: {
        status: "completed",
        receiptId: RECEIPT_ID,
        targetUserId: null,
        completedAt: "2026-08-02T10:00:00.000Z",
      },
      error: null,
    });
    await expect(
      repository().readCompleted({
        idempotencyHmac: HASHES.idempotencyHmac,
        continuationHmac: HASHES.continuationHmac,
        signal: SIGNAL,
      }),
    ).resolves.toEqual({
      kind: "completed",
      receipt: expect.objectContaining({
        receiptId: RECEIPT_ID,
        deleted: true,
      }),
    });
    expect(rpc).toHaveBeenCalledWith("read_account_deletion_completion_v1", {
      p_idempotency_hmac_sha256: HASHES.idempotencyHmac,
      p_continuation_hmac_sha256: HASHES.continuationHmac,
    });
  });

  it("ferme un conflit et une exception de transport", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: "TA005" } });
    await expect(
      repository().begin({
        ...HASHES,
        targetUserId: USER_ID,
        signal: SIGNAL,
      }),
    ).resolves.toEqual({ kind: "idempotency_key_reused" });

    rpc.mockRejectedValueOnce(new Error("secret detail"));
    await expect(
      repository().resume({
        idempotencyHmac: HASHES.idempotencyHmac,
        continuationHmac: HASHES.continuationHmac,
        signal: SIGNAL,
      }),
    ).rejects.toMatchObject({ code: "database_unavailable" });
  });
});
