// @vitest-environment jsdom

import type { AnalyticsSink } from "@thainaute/analytics";
import { SyncHttpApiError } from "@thainaute/sync";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  idempotency: "10000000-0000-4000-8000-000000000001",
  receipt: "10000000-0000-4000-8000-000000000002",
  userA: "20000000-0000-4000-8000-000000000001",
  userB: "20000000-0000-4000-8000-000000000002",
} as const;

const receipt = {
  format: "thainaute.account-deletion-receipt/v1" as const,
  receiptId: ids.receipt,
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true as const,
};

const awaitingOperation = {
  format: "thainaute.mobile-account-deletion-operation/v1" as const,
  status: "awaiting_server_receipt" as const,
  expectedUserId: ids.userA,
  idempotencyKey: ids.idempotency,
  continuationSecret: "A".repeat(43),
};

const testState = vi.hoisted(() => ({
  create: vi.fn(),
  pending: null as unknown,
  read: vi.fn(),
  resume: vi.fn(),
}));

vi.mock("../lib/mobile-account-deletion", () => ({
  MobileAccountDeletionError: class MobileAccountDeletionError extends Error {
    constructor(public code: string) {
      super("account deletion error");
    }
  },
  createMobileAccountDeletionOperation: testState.create,
  readMobileAccountDeletionOperation: testState.read,
  resumeMobileAccountDeletion: testState.resume,
}));

// Le double doit être résolu avant le hook.
// eslint-disable-next-line import/first
import { useMobileAccountDeletion } from "../lib/use-mobile-account-deletion";
// eslint-disable-next-line import/first
import { MobileAccountDeletionError } from "../lib/mobile-account-deletion";

const clearDeletedSession = vi.fn(() => Promise.resolve());
const requestReauthenticationCode = vi.fn(() => Promise.resolve());
const verifyReauthenticationCode = vi.fn(() => Promise.resolve());
const database = {} as never;

function renderDeletionHook(
  currentUserId: string | null,
  analytics?: AnalyticsSink,
) {
  return renderHook(() =>
    useMobileAccountDeletion({
      database,
      currentUserId,
      platform: "android",
      ...(analytics === undefined ? {} : { analytics }),
      clearDeletedSession,
      requestReauthenticationCode,
      verifyReauthenticationCode,
    }),
  );
}

describe("orchestration UI de la suppression mobile", () => {
  beforeEach(() => {
    testState.pending = null;
    testState.read
      .mockReset()
      .mockImplementation(() => Promise.resolve(testState.pending));
    testState.create.mockReset().mockImplementation((_userId, options) => {
      testState.pending = awaitingOperation;
      options?.onCreated?.();
      return Promise.resolve(awaitingOperation);
    });
    testState.resume.mockReset().mockImplementation(() => {
      testState.pending = null;
      return Promise.resolve({
        status: "completed",
        expectedUserId: ids.userA,
        receipt,
      });
    });
    clearDeletedSession.mockClear();
    requestReauthenticationCode.mockClear();
    verifyReauthenticationCode.mockClear();
  });

  afterEach(() => cleanup());

  it("reprend automatiquement une commande au montage même sans session", async () => {
    testState.pending = awaitingOperation;
    const { result } = renderDeletionHook(null);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(testState.resume).toHaveBeenCalledWith({
      database,
      clearDeletedSession,
    });
    expect(result.current.message).toMatch(/compte visé.*données locales/i);
  });

  it("impose deux confirmations puis un code exact avant de créer la commande", async () => {
    const analytics = { capture: vi.fn() };
    const { result } = renderDeletionHook(ids.userA, analytics);
    await waitFor(() => expect(result.current.status).toBe("idle"));

    act(() => result.current.beginConfirmation());
    expect(result.current.status).toBe("confirming");
    await act(() => result.current.requestReauthenticationCode());
    expect(requestReauthenticationCode).toHaveBeenCalledWith(ids.userA);
    expect(result.current.status).toBe("awaiting_code");

    await act(() => result.current.verifyCodeAndDelete("12x"));
    expect(verifyReauthenticationCode).not.toHaveBeenCalled();
    expect(result.current.message).toMatch(/exactement six chiffres/i);

    await act(() => result.current.verifyCodeAndDelete("123456"));
    expect(verifyReauthenticationCode).toHaveBeenCalledWith(
      ids.userA,
      "123456",
    );
    expect(testState.create).toHaveBeenCalledWith(
      ids.userA,
      expect.objectContaining({ onCreated: expect.any(Function) }),
    );
    expect(analytics.capture).toHaveBeenCalledOnce();
    expect(analytics.capture).toHaveBeenCalledWith({
      name: "account_deletion_requested",
      platform: "android",
    });
    expect(testState.resume).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("success");
  });

  it("reste avant toute commande si l'envoi ou la vérification OTP échoue", async () => {
    requestReauthenticationCode.mockRejectedValueOnce(
      new Error("Le code de sécurité n’a pas pu être envoyé."),
    );
    const { result } = renderDeletionHook(ids.userA);
    await waitFor(() => expect(result.current.status).toBe("idle"));
    act(() => result.current.beginConfirmation());

    await act(() => result.current.requestReauthenticationCode());
    expect(result.current.status).toBe("error");
    expect(result.current.canReauthenticate).toBe(true);
    expect(testState.create).not.toHaveBeenCalled();

    await act(() => result.current.requestReauthenticationCode());
    verifyReauthenticationCode.mockRejectedValueOnce(
      new Error("Le code de sécurité est invalide ou a expiré."),
    );
    await act(() => result.current.verifyCodeAndDelete("123456"));
    expect(result.current.status).toBe("awaiting_code");
    expect(result.current.message).toMatch(/invalide ou a expiré/i);
    expect(testState.create).not.toHaveBeenCalled();
  });

  it.each([
    {
      code: "unauthorized" as const,
      status: 401,
      needsReauthentication: true,
      retryable: false,
    },
    {
      code: "idempotency_key_reused" as const,
      status: 409,
      needsReauthentication: false,
      retryable: false,
    },
    {
      code: "database_unavailable" as const,
      status: 503,
      needsReauthentication: false,
      retryable: true,
    },
  ])(
    "présente l'erreur serveur $status sans perdre la commande",
    async ({ code, status, needsReauthentication, retryable }) => {
      testState.pending = awaitingOperation;
      testState.resume.mockRejectedValue(
        new SyncHttpApiError({
          endpoint: "account_deletion",
          status,
          code,
        }),
      );
      const { result } = renderDeletionHook(ids.userA);

      await waitFor(() => expect(result.current.status).toBe("error"));
      expect(result.current.hasPendingOperation).toBe(true);
      expect(result.current.needsReauthentication).toBe(needsReauthentication);
      expect(result.current.retryable).toBe(retryable);
    },
  );

  it("ne réauthentifie jamais B pour reprendre la suppression de A", async () => {
    testState.pending = awaitingOperation;
    testState.resume.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_deletion",
        status: 401,
        code: "unauthorized",
      }),
    );
    const { result } = renderDeletionHook(ids.userB);
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.pendingTargetsCurrentUser).toBe(false);
    expect(result.current.canReauthenticate).toBe(false);

    await act(() => result.current.requestReauthenticationCode());

    expect(requestReauthenticationCode).not.toHaveBeenCalled();
    expect(result.current.message).toMatch(/compte actuel reste intact/i);
  });

  it("reprend uniquement le nettoyage local après un échec de purge", async () => {
    testState.pending = {
      ...awaitingOperation,
      status: "server_deleted",
      receipt,
    };
    testState.resume
      .mockRejectedValueOnce(new Error("sqlite unavailable"))
      .mockImplementationOnce(() => {
        testState.pending = null;
        return Promise.resolve({
          status: "completed",
          expectedUserId: ids.userA,
          receipt,
        });
      });
    const { result } = renderDeletionHook(null);
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.retryable).toBe(true);
    expect(result.current.message).toMatch(/nettoyage local/i);

    await act(() => result.current.retry());

    expect(testState.resume).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("success");
  });

  it("ne masque jamais une commande locale corrompue", async () => {
    testState.read.mockRejectedValue(
      new MobileAccountDeletionError("operation_corrupt"),
    );
    const { result } = renderDeletionHook(null);

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.hasPendingOperation).toBe(true);
    expect(result.current.retryable).toBe(false);
    act(() => result.current.cancelConfirmation());
    expect(result.current.status).toBe("error");
    expect(result.current.hasPendingOperation).toBe(true);
  });
});
