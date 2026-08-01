// @vitest-environment jsdom

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MobileAuthSessionProvider,
  useMobileAuthSession,
} from "../lib/auth-session";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
} as const;

const mocks = vi.hoisted(() => {
  const state = {
    authStateChange: null as
      ((event: AuthChangeEvent, session: Session | null) => void) | null,
  };
  return {
    database: {},
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(
      (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        state.authStateChange = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    ),
    purgeSettledAccount: vi.fn(() => Promise.resolve(false)),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    startAutoRefresh: vi.fn(),
    state,
    stopAutoRefresh: vi.fn(),
  };
});

vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mocks.database,
}));

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    currentState: "active",
  },
}));

vi.mock("../lib/account-sync", () => ({
  purgeSettledMobileAccountData: mocks.purgeSettledAccount,
}));

vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: () => ({
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
      startAutoRefresh: mocks.startAutoRefresh,
      stopAutoRefresh: mocks.stopAutoRefresh,
    },
  }),
}));

function session(userId: string): Session {
  return {
    access_token: "unit-test-access",
    expires_in: 3_600,
    refresh_token: "unit-test-refresh",
    token_type: "bearer",
    user: {
      app_metadata: {},
      aud: "authenticated",
      created_at: "2026-08-01T10:00:00.000Z",
      id: userId,
      is_anonymous: false,
      user_metadata: {},
    },
  } as Session;
}

function wrapper({ children }: PropsWithChildren) {
  return <MobileAuthSessionProvider>{children}</MobileAuthSessionProvider>;
}

function emitAuthStateChange(
  event: AuthChangeEvent,
  nextSession: Session | null,
): void {
  const callback = mocks.state.authStateChange;
  if (callback === null) throw new Error("Auth callback absent");
  act(() => callback(event, nextSession));
}

describe("session Auth mobile", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.onAuthStateChange.mockClear();
    mocks.purgeSettledAccount.mockClear();
    mocks.signOut.mockClear();
    mocks.startAutoRefresh.mockClear();
    mocks.state.authStateChange = null;
    mocks.stopAutoRefresh.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("incrémente la frontière sur SIGNED_OUT", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("signed_in"));
    expect(result.current.sessionBoundaryRevision).toBe(0);

    emitAuthStateChange("SIGNED_OUT", null);

    await waitFor(() => expect(result.current.status).toBe("signed_out"));
    expect(result.current.sessionBoundaryRevision).toBe(1);
  });

  it("ignore le même sujet puis incrémente la frontière de A vers B", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("signed_in"));
    emitAuthStateChange("TOKEN_REFRESHED", session(ids.userA));
    emitAuthStateChange("SIGNED_IN", session(ids.userA));
    expect(result.current.sessionBoundaryRevision).toBe(0);

    emitAuthStateChange("SIGNED_IN", session(ids.userB));

    expect(result.current.sessionBoundaryRevision).toBe(1);
  });

  it("traite SIGNED_OUT comme une frontière même sans sujet durable connu", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("signed_out"));
    emitAuthStateChange("SIGNED_OUT", null);

    expect(result.current.sessionBoundaryRevision).toBe(1);
  });

  it("incrémente la frontière quand un utilisateur arrive après l’état déconnecté", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("signed_out"));
    expect(result.current.sessionBoundaryRevision).toBe(0);

    emitAuthStateChange("SIGNED_IN", session(ids.userA));

    await waitFor(() => expect(result.current.status).toBe("signed_in"));
    expect(result.current.sessionBoundaryRevision).toBe(1);
  });

  it("traite un premier SIGNED_IN comme une frontière pendant le bootstrap", async () => {
    mocks.getSession.mockImplementation(() => new Promise(() => undefined));
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(mocks.state.authStateChange).not.toBeNull());
    expect(result.current.status).toBe("loading");

    emitAuthStateChange("SIGNED_IN", session(ids.userA));

    await waitFor(() => expect(result.current.status).toBe("signed_in"));
    expect(result.current.sessionBoundaryRevision).toBe(1);
  });

  it("refuse de déconnecter B si la session a changé depuis l’écran A", async () => {
    mocks.getSession
      .mockResolvedValueOnce({
        data: { session: session(ids.userA) },
        error: null,
      })
      .mockResolvedValue({
        data: { session: session(ids.userB) },
        error: null,
      });
    const { result } = renderHook(() => useMobileAuthSession(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("signed_in"));
    await expect(result.current.signOutLocal(ids.userA)).rejects.toThrow(
      "La session a changé avant la déconnexion.",
    );
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
