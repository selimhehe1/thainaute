// @vitest-environment jsdom

import { SyncHttpApiError } from "@thainaute/sync";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => {
  class MockMobileAccountExportError extends Error {
    readonly code: string;

    constructor(code: string) {
      super("mobile export failure");
      this.code = code;
    }
  }

  return {
    MobileAccountExportError: MockMobileAccountExportError,
    prepare: vi.fn(),
    purge: vi.fn(),
    request: vi.fn(),
    share: vi.fn(),
  };
});

vi.mock("../lib/mobile-account-export", () => ({
  MobileAccountExportError: testState.MobileAccountExportError,
  prepareMobileAccountExportDelivery: testState.prepare,
  purgeMobileAccountExportCache: testState.purge,
  requestMobileAccountExport: testState.request,
  shareMobileAccountExport: testState.share,
}));

// Le hook doit recevoir les doubles avant la résolution de son module.
// eslint-disable-next-line import/first
import { useMobileAccountExport } from "../lib/use-mobile-account-export";

const USER_A = "10000000-0000-4000-8000-000000000001";
const USER_B = "10000000-0000-4000-8000-000000000002";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.prepare.mockResolvedValue(undefined);
  testState.purge.mockReturnValue(undefined);
  testState.request.mockResolvedValue({ format: "test-document" });
  testState.share.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("useMobileAccountExport", () => {
  it("remet le document sans jamais le placer dans l’état React", async () => {
    const capture = vi.fn();
    const { result } = renderHook(() =>
      useMobileAccountExport({
        analytics: { capture },
        expectedUserId: USER_A,
        platform: "android",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.exportAccount();
    });

    expect(testState.prepare).toHaveBeenCalledOnce();
    expect(testState.request).toHaveBeenCalledWith({
      expectedUserId: USER_A,
      signal: expect.any(AbortSignal),
    });
    expect(testState.share).toHaveBeenCalledWith({
      document: { format: "test-document" },
      signal: expect.any(AbortSignal),
    });
    expect(result.current).toMatchObject({
      status: "success",
      isBusy: false,
    });
    expect(result.current.message).toMatch(/copie temporaire.*supprimée/i);
    expect(capture).toHaveBeenCalledWith({
      name: "account_export_requested",
      platform: "android",
    });
    expect(Object.keys(result.current).sort()).toEqual([
      "exportAccount",
      "isBusy",
      "message",
      "status",
    ]);
  });

  it("ne bloque pas l’export si le sink analytics échoue", async () => {
    const { result } = renderHook(() =>
      useMobileAccountExport({
        analytics: {
          capture: () => {
            throw new Error("analytics unavailable");
          },
        },
        expectedUserId: USER_A,
        platform: "ios",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.exportAccount();
    });

    expect(testState.share).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("success");
  });

  it("annule A et ne remet jamais son document après une bascule vers B", async () => {
    const pending = deferred<unknown>();
    testState.request.mockReturnValue(pending.promise);
    const { result, rerender } = renderHook(
      ({ revision, userId }) =>
        useMobileAccountExport({
          expectedUserId: userId,
          platform: "android",
          sessionBoundaryRevision: revision,
        }),
      { initialProps: { revision: 0, userId: USER_A } },
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));
    let operation!: Promise<void>;

    act(() => {
      operation = result.current.exportAccount();
    });
    await waitFor(() => expect(testState.request).toHaveBeenCalledOnce());
    const signal = testState.request.mock.calls[0]?.[0].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    rerender({ revision: 1, userId: USER_B });
    // L’invalidation appartient au commit : aucun effet passif ni attente
    // supplémentaire ne doit être nécessaire avant de résoudre A.
    expect(signal.aborted).toBe(true);
    await act(async () => {
      pending.resolve({ format: "document-a" });
      await operation;
    });

    expect(testState.share).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(result.current.message).toMatch(/session a changé/i),
    );
    expect(result.current.status).toBe("error");
    expect(testState.purge.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("bloque un double appui pendant la préparation", async () => {
    const pending = deferred<unknown>();
    testState.request.mockReturnValue(pending.promise);
    const { result } = renderHook(() =>
      useMobileAccountExport({
        expectedUserId: USER_A,
        platform: "android",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));
    let first!: Promise<void>;
    let second!: Promise<void>;

    act(() => {
      first = result.current.exportAccount();
      second = result.current.exportAccount();
    });
    await waitFor(() => expect(testState.request).toHaveBeenCalledOnce());
    await act(async () => {
      pending.resolve({ format: "document" });
      await Promise.all([first, second]);
    });

    expect(testState.prepare).toHaveBeenCalledOnce();
    expect(testState.share).toHaveBeenCalledOnce();
  });

  it("explique un export trop volumineux sans proposer de fichier partiel", async () => {
    testState.request.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "account_export",
        status: 409,
        code: "export_capacity_exceeded",
      }),
    );
    const { result } = renderHook(() =>
      useMobileAccountExport({
        expectedUserId: USER_A,
        platform: "android",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.exportAccount();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.message).toMatch(/trop de données/i);
    expect(result.current.message).toMatch(/aucun fichier partiel/i);
    expect(testState.share).not.toHaveBeenCalled();
  });

  it("affiche et conserve le blocage si la purge ciblée échoue", async () => {
    testState.prepare.mockRejectedValue(
      new testState.MobileAccountExportError("cache_cleanup_failed"),
    );
    const { result } = renderHook(() =>
      useMobileAccountExport({
        expectedUserId: USER_A,
        platform: "android",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.exportAccount();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.message).toMatch(/export reste bloqué/i);
    expect(testState.request).not.toHaveBeenCalled();
    expect(testState.share).not.toHaveBeenCalled();
  });

  it("annule et purge au démontage", async () => {
    const pending = deferred<unknown>();
    testState.request.mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() =>
      useMobileAccountExport({
        expectedUserId: USER_A,
        platform: "android",
        sessionBoundaryRevision: 0,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    let operation!: Promise<void>;
    act(() => {
      operation = result.current.exportAccount();
    });
    await waitFor(() => expect(testState.request).toHaveBeenCalledOnce());
    const signal = testState.request.mock.calls[0]?.[0].signal as AbortSignal;

    unmount();
    // Même garantie au commit de démontage, avant toute continuation de A.
    expect(signal.aborted).toBe(true);
    await act(async () => {
      pending.resolve({ format: "stale" });
      await operation;
    });

    expect(testState.share).not.toHaveBeenCalled();
    expect(testState.purge.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
