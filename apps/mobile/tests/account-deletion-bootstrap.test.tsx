// @vitest-environment jsdom

import { SyncHttpApiError } from "@thainaute/sync";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class MockMobileAccountDeletionError extends Error {
    public constructor(public readonly code: string) {
      super(code);
      this.name = "MobileAccountDeletionError";
    }
  }

  return {
    AppState: {
      addEventListener: vi.fn(),
      listener: null as ((state: string) => void) | null,
      remove: vi.fn(),
    },
    auth: {
      clearDeletedSession: vi.fn(() => Promise.resolve()),
      session: null,
      sessionBoundaryRevision: 0,
    },
    database: {},
    MobileAccountDeletionError: MockMobileAccountDeletionError,
    resume: vi.fn(),
  };
});

vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mocks.database,
}));

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: mocks.AppState.addEventListener,
  },
}));

vi.mock("../lib/auth-session", () => ({
  useMobileAuthSession: () => mocks.auth,
}));

vi.mock("../lib/mobile-account-deletion", () => ({
  MobileAccountDeletionError: mocks.MobileAccountDeletionError,
  resumeMobileAccountDeletion: mocks.resume,
}));

// Les doubles natifs doivent Ãªtre installÃ©s avant la rÃ©solution du module.
// eslint-disable-next-line import/first
import { MobileAccountDeletionBootstrap } from "../lib/account-deletion-bootstrap";

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("bootstrap racine de suppression mobile", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.auth.sessionBoundaryRevision = 0;
    mocks.AppState.listener = null;
    mocks.AppState.addEventListener.mockImplementation((_event, listener) => {
      mocks.AppState.listener = listener;
      return { remove: mocks.AppState.remove };
    });
    mocks.resume.mockResolvedValue({ status: "idle" });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("reprend au montage m\u00eame sign\u00e9 out et transmet la purge de session", async () => {
    render(<MobileAccountDeletionBootstrap />);
    await flushEffects();

    expect(mocks.resume).toHaveBeenCalledOnce();
    expect(mocks.resume).toHaveBeenCalledWith({
      database: mocks.database,
      clearDeletedSession: mocks.auth.clearDeletedSession,
    });
  });

  it("se r\u00e9veille au retour actif sans accumuler plusieurs timers", async () => {
    vi.useFakeTimers();
    mocks.resume.mockRejectedValue(new Error("offline"));
    render(<MobileAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.resume).toHaveBeenCalledOnce();

    await act(async () => {
      mocks.AppState.listener?.("background");
      mocks.AppState.listener?.("active");
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mocks.resume).toHaveBeenCalledTimes(2);

    await act(async () => vi.advanceTimersByTimeAsync(30_000));
    expect(mocks.resume).toHaveBeenCalledTimes(3);
  });

  it("arr\u00eate un \u00e9tat local permanent mais repart apr\u00e8s un changement de session", async () => {
    vi.useFakeTimers();
    mocks.resume.mockRejectedValueOnce(
      new mocks.MobileAccountDeletionError("operation_corrupt"),
    );
    const view = render(<MobileAccountDeletionBootstrap />);
    await flushEffects();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.resume).toHaveBeenCalledOnce();

    mocks.resume.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_deletion",
        status: 401,
        code: "unauthorized",
      }),
    );
    mocks.auth.sessionBoundaryRevision = 1;
    view.rerender(<MobileAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.resume).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.resume).toHaveBeenCalledTimes(2);

    mocks.auth.sessionBoundaryRevision = 2;
    view.rerender(<MobileAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.resume).toHaveBeenCalledTimes(3);
  });

  it("ne relance pas billing_unavailable sur la boucle fixe", async () => {
    vi.useFakeTimers();
    mocks.resume.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_deletion",
        status: 503,
        code: "billing_unavailable",
      }),
    );

    render(<MobileAccountDeletionBootstrap />);
    await flushEffects();
    expect(mocks.resume).toHaveBeenCalledOnce();

    await act(async () => {
      mocks.AppState.listener?.("active");
      await Promise.resolve();
    });
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.resume).toHaveBeenCalledOnce();
  });
});
