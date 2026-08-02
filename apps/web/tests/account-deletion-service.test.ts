import { describe, expect, it, vi } from "vitest";

import { AccountDeletionInfrastructureError } from "../lib/server/account-deletion/errors";
import type { AccountDeletionReceiptState } from "../lib/server/account-deletion/ports";
import { createAccountDeleter } from "../lib/server/account-deletion/service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const RECEIPT = {
  format: "thainaute.account-deletion-receipt/v1" as const,
  receiptId: "10000000-0000-4000-8000-000000000001",
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true as const,
};
const HEADERS = {
  idempotencyKey: "20000000-0000-4000-8000-000000000001",
  continuationSecret: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA",
};
const FINGERPRINTS = {
  subjectHmac: "a".repeat(64),
  idempotencyHmac: "b".repeat(64),
  requestHmac: "c".repeat(64),
  continuationHmac: "d".repeat(64),
};
const NOW = new Date("2026-08-02T10:00:00.000Z");
const CLAIMS = {
  session_id: "30000000-0000-4000-8000-000000000001",
  amr: [{ method: "otp", timestamp: Math.floor(NOW.getTime() / 1_000) }],
};

function input(accessToken: string | null = "sensitive.jwt") {
  return {
    accessToken,
    request: { confirmation: "delete_account" as const },
    headers: HEADERS,
    signal: new AbortController().signal,
  };
}

function dependencies() {
  return {
    identityVerifier: {
      verify: vi.fn(async () => ({ userId: USER_ID, claims: CLAIMS })),
    },
    sessionVerifier: { isActive: vi.fn(async () => true) },
    repository: {
      resume: vi.fn(async (): Promise<AccountDeletionReceiptState> => ({
        kind: "not_found",
      })),
      begin: vi.fn(
        async (): Promise<
          Exclude<AccountDeletionReceiptState, { kind: "not_found" }>
        > => ({
          kind: "in_progress",
          receiptId: RECEIPT.receiptId,
          targetUserId: USER_ID,
        }),
      ),
      readCompleted: vi.fn(async (): Promise<AccountDeletionReceiptState> => ({
        kind: "completed",
        receipt: RECEIPT,
      })),
    },
    storage: { purgeUserObjects: vi.fn(async () => undefined) },
    authAdministrator: {
      revokeGlobalSessions: vi.fn(async () => undefined),
      hardDeleteUser: vi.fn(async () => undefined),
    },
    hasher: { fingerprint: vi.fn(() => FINGERPRINTS) },
    now: () => NOW,
  };
}

describe("service de suppression de compte", () => {
  it("rejoue immédiatement un reçu terminé sans Auth ni effet destructif", async () => {
    const deps = dependencies();
    deps.repository.resume.mockResolvedValueOnce({
      kind: "completed",
      receipt: RECEIPT,
    });
    const deleteAccount = createAccountDeleter(deps);

    await expect(deleteAccount(input(null))).resolves.toEqual(RECEIPT);
    expect(deps.identityVerifier.verify).not.toHaveBeenCalled();
    expect(deps.storage.purgeUserObjects).not.toHaveBeenCalled();
    expect(deps.authAdministrator.hardDeleteUser).not.toHaveBeenCalled();
  });

  it("exige Auth puis un OTP récent avant de créer le reçu", async () => {
    const noToken = dependencies();
    await expect(
      createAccountDeleter(noToken)(input(null)),
    ).rejects.toMatchObject({
      code: "unauthorized",
    });
    expect(noToken.repository.begin).not.toHaveBeenCalled();

    const stale = dependencies();
    stale.identityVerifier.verify.mockResolvedValueOnce({
      userId: USER_ID,
      claims: {
        ...CLAIMS,
        amr: [{ method: "otp", timestamp: CLAIMS.amr[0]!.timestamp - 601 }],
      },
    });
    await expect(createAccountDeleter(stale)(input())).rejects.toMatchObject({
      code: "reauthentication_required",
    });
    expect(stale.repository.begin).not.toHaveBeenCalled();
  });

  it("refuse un JWT récent dont la session Auth a été révoquée", async () => {
    const deps = dependencies();
    deps.sessionVerifier.isActive.mockResolvedValueOnce(false);

    await expect(createAccountDeleter(deps)(input())).rejects.toMatchObject({
      code: "unauthorized",
    });
    expect(deps.sessionVerifier.isActive).toHaveBeenCalledWith({
      userId: USER_ID,
      sessionId: CLAIMS.session_id,
      signal: expect.any(AbortSignal),
    });
    expect(deps.repository.begin).not.toHaveBeenCalled();
  });

  it("purge Storage, révoque, hard-delete puis relit le reçu finalisé", async () => {
    const deps = dependencies();
    const deleteAccount = createAccountDeleter(deps);

    await expect(deleteAccount(input())).resolves.toEqual(RECEIPT);
    expect(deps.repository.begin).toHaveBeenCalledWith({
      ...FINGERPRINTS,
      targetUserId: USER_ID,
      signal: expect.any(AbortSignal),
    });
    expect(deps.storage.purgeUserObjects).toHaveBeenCalledWith({
      userId: USER_ID,
      signal: expect.any(AbortSignal),
    });
    expect(deps.authAdministrator.revokeGlobalSessions).toHaveBeenCalledWith({
      accessToken: "sensitive.jwt",
      signal: expect.any(AbortSignal),
    });
    expect(deps.authAdministrator.hardDeleteUser).toHaveBeenCalledWith({
      userId: USER_ID,
      signal: expect.any(AbortSignal),
      acceptAlreadyDeleted: true,
    });
    expect(deps.repository.readCompleted).toHaveBeenCalledWith({
      idempotencyHmac: FINGERPRINTS.idempotencyHmac,
      continuationHmac: FINGERPRINTS.continuationHmac,
      signal: expect.any(AbortSignal),
    });

    const order = [
      deps.storage.purgeUserObjects,
      deps.authAdministrator.revokeGlobalSessions,
      deps.authAdministrator.hardDeleteUser,
      deps.repository.readCompleted,
    ].map((mock) => mock.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((left, right) => left! - right!));
  });

  it("reprend sans Bearer une suppression déjà durable", async () => {
    const deps = dependencies();
    deps.repository.resume.mockResolvedValueOnce({
      kind: "in_progress",
      receiptId: RECEIPT.receiptId,
      targetUserId: USER_ID,
    });

    await expect(createAccountDeleter(deps)(input(null))).resolves.toEqual(
      RECEIPT,
    );
    expect(deps.identityVerifier.verify).not.toHaveBeenCalled();
    expect(deps.authAdministrator.revokeGlobalSessions).not.toHaveBeenCalled();
    expect(deps.authAdministrator.hardDeleteUser).toHaveBeenCalledOnce();
  });

  it("ne franchit aucune étape suivante après une panne Storage", async () => {
    const deps = dependencies();
    deps.storage.purgeUserObjects.mockRejectedValueOnce(
      new AccountDeletionInfrastructureError("storage_unavailable"),
    );

    await expect(createAccountDeleter(deps)(input())).rejects.toMatchObject({
      code: "storage_unavailable",
    });
    expect(deps.authAdministrator.revokeGlobalSessions).not.toHaveBeenCalled();
    expect(deps.authAdministrator.hardDeleteUser).not.toHaveBeenCalled();
    expect(deps.repository.readCompleted).not.toHaveBeenCalled();
  });

  it("conserve le reçu in_progress si Auth échoue et ferme une lecture incohérente", async () => {
    const authFailure = dependencies();
    authFailure.authAdministrator.hardDeleteUser.mockRejectedValueOnce(
      new AccountDeletionInfrastructureError("auth_unavailable"),
    );
    await expect(
      createAccountDeleter(authFailure)(input()),
    ).rejects.toMatchObject({ code: "auth_unavailable" });
    expect(authFailure.repository.readCompleted).not.toHaveBeenCalled();

    const databaseFailure = dependencies();
    databaseFailure.repository.readCompleted.mockRejectedValueOnce(
      new AccountDeletionInfrastructureError("database_unavailable"),
    );
    await expect(
      createAccountDeleter(databaseFailure)(input()),
    ).rejects.toMatchObject({ code: "database_unavailable" });
  });

  it("ferme un conflit durable avant toute purge", async () => {
    const deps = dependencies();
    deps.repository.resume.mockResolvedValueOnce({
      kind: "idempotency_key_reused",
    });
    await expect(createAccountDeleter(deps)(input(null))).rejects.toMatchObject(
      {
        code: "idempotency_key_reused",
      },
    );
    expect(deps.storage.purgeUserObjects).not.toHaveBeenCalled();
  });
});
