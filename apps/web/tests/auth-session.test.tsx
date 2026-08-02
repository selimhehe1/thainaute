import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(
      (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        state.authStateChange = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    ),
    purgeSettledAccount: vi.fn(() => Promise.resolve(false)),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    state,
  };
});

vi.mock("../lib/client/account-sync", () => ({
  purgeSettledWebAccountData: mocks.purgeSettledAccount,
}));

vi.mock("../lib/client/supabase-auth", () => ({
  getWebSupabaseAuthClient: () => ({
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
    },
  }),
}));

import {
  useWebAuthSession,
  WebAuthSessionProvider,
} from "../lib/client/auth-session";

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

function emitAuthStateChange(
  event: AuthChangeEvent,
  nextSession: Session | null,
): void {
  const callback = mocks.state.authStateChange;
  if (callback === null) throw new Error("Auth callback absent");
  act(() => callback(event, nextSession));
}

function SignOutHarness() {
  const auth = useWebAuthSession();
  const [result, setResult] = useState("idle");
  return (
    <>
      <span>{auth.status}</span>
      <span data-testid="session-boundary-revision">
        {auth.sessionBoundaryRevision}
      </span>
      <button
        type="button"
        onClick={() => {
          void auth
            .signOutLocal(ids.userA)
            .then(() => setResult("signed_out"))
            .catch(() => setResult("refused"));
        }}
      >
        Déconnecter A
      </button>
      <span>{result}</span>
    </>
  );
}

describe("session Auth web", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.signOut.mockClear();
    mocks.onAuthStateChange.mockClear();
    mocks.purgeSettledAccount.mockClear();
    mocks.state.authStateChange = null;
  });

  it("incrémente la frontière sur SIGNED_OUT", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <SignOutHarness />
      </WebAuthSessionProvider>,
    );

    expect(await screen.findByText("signed_in")).toBeVisible();
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "0",
    );

    emitAuthStateChange("SIGNED_OUT", null);

    expect(await screen.findByText("signed_out")).toBeVisible();
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "1",
    );
  });

  it("ignore le même sujet puis incrémente la frontière de A vers B", async () => {
    const userA = session(ids.userA);
    mocks.getSession.mockResolvedValue({
      data: { session: userA },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <SignOutHarness />
      </WebAuthSessionProvider>,
    );

    expect(await screen.findByText("signed_in")).toBeVisible();
    emitAuthStateChange("TOKEN_REFRESHED", session(ids.userA));
    emitAuthStateChange("SIGNED_IN", session(ids.userA));
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "0",
    );

    emitAuthStateChange("SIGNED_IN", session(ids.userB));

    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "1",
    );
  });

  it("incrémente la frontière quand un utilisateur arrive après l’état déconnecté", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <SignOutHarness />
      </WebAuthSessionProvider>,
    );

    expect(await screen.findByText("signed_out")).toBeVisible();
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "0",
    );

    emitAuthStateChange("SIGNED_IN", session(ids.userA));

    expect(await screen.findByText("signed_in")).toBeVisible();
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "1",
    );
  });

  it("traite un premier SIGNED_IN comme une frontière pendant le bootstrap", async () => {
    mocks.getSession.mockImplementation(() => new Promise(() => undefined));

    render(
      <WebAuthSessionProvider>
        <SignOutHarness />
      </WebAuthSessionProvider>,
    );

    await waitFor(() => expect(mocks.state.authStateChange).not.toBeNull());
    expect(screen.getByText("loading")).toBeVisible();

    emitAuthStateChange("SIGNED_IN", session(ids.userA));

    expect(await screen.findByText("signed_in")).toBeVisible();
    expect(screen.getByTestId("session-boundary-revision")).toHaveTextContent(
      "1",
    );
  });

  it("refuse de déconnecter B si la session a changé depuis l'écran A", async () => {
    mocks.getSession
      .mockResolvedValueOnce({
        data: { session: session(ids.userA) },
        error: null,
      })
      .mockResolvedValue({
        data: { session: session(ids.userB) },
        error: null,
      });

    render(
      <WebAuthSessionProvider>
        <SignOutHarness />
      </WebAuthSessionProvider>,
    );

    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Déconnecter A" }));
    await waitFor(() => expect(screen.getByText("refused")).toBeVisible());
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
