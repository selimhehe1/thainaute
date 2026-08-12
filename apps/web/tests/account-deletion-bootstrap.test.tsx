// @vitest-environment jsdom

import { SyncHttpApiError } from "@thainaute/sync";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const operation = {
  format: "thainaute.web-account-deletion-operation/v1" as const,
  expectedUserId: "10000000-0000-4000-8000-000000000001",
  idempotencyKey: "20000000-0000-4000-8000-000000000001",
  continuationSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
};

const mocks = vi.hoisted(() => ({
  auth: {
    clearDeletedSession: vi.fn(() => Promise.resolve()),
    session: null,
    sessionBoundaryRevision: 0,
  },
  complete: vi.fn(),
  read: vi.fn(),
}));

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => mocks.auth,
}));

vi.mock("../lib/client/account-deletion", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../lib/client/account-deletion")>();
  return {
    ...actual,
    completePendingWebAccountDeletion: mocks.complete,
    readPendingWebAccountDeletion: mocks.read,
  };
});

import {
  resumePendingWebAccountDeletion,
  WebAccountDeletionBootstrap,
} from "../lib/client/account-deletion-bootstrap";
import {
  WEB_ACCOUNT_DELETION_STORAGE_KEY,
  WebAccountDeletionCorruptStateError,
} from "../lib/client/account-deletion";

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("bootstrap racine de suppression web", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.auth.sessionBoundaryRevision = 0;
    mocks.read.mockReturnValue(operation);
    mocks.complete.mockResolvedValue({ deleted: true });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("reprend signé out au montage et partage le mutex avec l'écran", async () => {
    let release!: () => void;
    mocks.complete.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    render(<WebAccountDeletionBootstrap />);
    await flushEffects();

    const fromScreen = resumePendingWebAccountDeletion({
      operation,
      clearDeletedSession: mocks.auth.clearDeletedSession,
    });
    expect(mocks.complete).toHaveBeenCalledOnce();
    release();
    await act(async () => fromScreen);
  });

  it("réveille la reprise sans accumuler plusieurs timers", async () => {
    vi.useFakeTimers();
    mocks.complete.mockRejectedValue(new Error("offline"));
    render(<WebAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.complete).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event("online"));
    await flushEffects();
    document.dispatchEvent(new Event("visibilitychange"));
    await flushEffects();
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: WEB_ACCOUNT_DELETION_STORAGE_KEY,
        newValue: JSON.stringify(operation),
      }),
    );
    await flushEffects();
    expect(mocks.complete).toHaveBeenCalledTimes(4);

    await act(async () => vi.advanceTimersByTimeAsync(30_000));
    expect(mocks.complete).toHaveBeenCalledTimes(5);
  });

  it("arrête les retries permanents et repart sur une nouvelle session", async () => {
    vi.useFakeTimers();
    mocks.read.mockImplementationOnce(() => {
      throw new WebAccountDeletionCorruptStateError();
    });
    const view = render(<WebAccountDeletionBootstrap />);
    await flushEffects();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.read).toHaveBeenCalledOnce();
    expect(mocks.complete).not.toHaveBeenCalled();

    mocks.read.mockReturnValue(operation);
    mocks.complete.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_deletion",
        status: 401,
        code: "unauthorized",
      }),
    );
    mocks.auth.sessionBoundaryRevision = 1;
    view.rerender(<WebAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.complete).toHaveBeenCalledOnce();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.complete).toHaveBeenCalledOnce();

    mocks.auth.sessionBoundaryRevision = 2;
    view.rerender(<WebAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.complete).toHaveBeenCalledTimes(2);
  });

  it("ne relance pas billing_unavailable sur la boucle fixe", async () => {
    vi.useFakeTimers();
    mocks.complete.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_deletion",
        status: 503,
        code: "billing_unavailable",
      }),
    );

    render(<WebAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.complete).toHaveBeenCalledOnce();

    window.dispatchEvent(new Event("online"));
    document.dispatchEvent(new Event("visibilitychange"));
    await flushEffects();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.complete).toHaveBeenCalledOnce();
  });
});
