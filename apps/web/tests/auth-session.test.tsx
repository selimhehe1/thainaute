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
    getUser: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    verifyOtp: vi.fn(),
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
      getUser: mocks.getUser,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithOtp: mocks.signInWithOtp,
      signOut: mocks.signOut,
      verifyOtp: mocks.verifyOtp,
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
      email: `${userId === ids.userA ? "a" : "b"}@example.test`,
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

function DeletionAuthHarness() {
  const auth = useWebAuthSession();
  const [result, setResult] = useState("idle");
  const execute = (operation: Promise<void>) => {
    void operation
      .then(() => setResult("ok"))
      .catch(() => setResult("refused"));
  };
  return (
    <>
      <span>{auth.status}</span>
      <button
        type="button"
        onClick={() => execute(auth.requestAccountDeletionCode(ids.userA))}
      >
        Demander suppression A
      </button>
      <button
        type="button"
        onClick={() =>
          execute(auth.verifyAccountDeletionCode(ids.userA, "123456"))
        }
      >
        Verifier suppression A
      </button>
      <button
        type="button"
        onClick={() => execute(auth.clearDeletedSession(ids.userA))}
      >
        Effacer session A
      </button>
      <span data-testid="deletion-auth-result">{result}</span>
    </>
  );
}

describe("session Auth web", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.getUser.mockReset();
    mocks.signInWithOtp.mockReset();
    mocks.signOut.mockClear();
    mocks.verifyOtp.mockReset();
    mocks.onAuthStateChange.mockClear();
    mocks.purgeSettledAccount.mockClear();
    mocks.state.authStateChange = null;
    mocks.getUser.mockResolvedValue({
      data: { user: session(ids.userA).user },
      error: null,
    });
    mocks.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    mocks.verifyOtp.mockResolvedValue({
      data: {
        session: session(ids.userA),
        user: session(ids.userA).user,
      },
      error: null,
    });
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

  it("demande un OTP sans creer de compte sur l'email exact du sujet", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Demander suppression A" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "ok",
      ),
    );
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: "a@example.test",
      options: { shouldCreateUser: false },
    });
  });

  it("refuse l'OTP si la session appartient a un autre sujet", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userB) },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Demander suppression A" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "refused",
      ),
    );
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
  });

  it("verifie l'OTP puis le meme utilisateur durable", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Verifier suppression A" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "ok",
      ),
    );
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      email: "a@example.test",
      token: "123456",
      type: "email",
    });
    expect(mocks.getUser).toHaveBeenCalledWith("unit-test-access");
  });

  it("refuse un utilisateur durable different apres verifyOtp", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });
    mocks.getUser.mockResolvedValue({
      data: { user: session(ids.userB).user },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Verifier suppression A" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "refused",
      ),
    );
  });

  it("efface seulement la session locale du compte supprime", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userA) },
      error: null,
    });

    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Effacer session A" }));

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("tolere une session absente et ne deconnecte jamais le compte B", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const first = render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_out")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Effacer session A" }));
    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "ok",
      ),
    );
    expect(mocks.signOut).not.toHaveBeenCalled();
    first.unmount();

    mocks.getSession.mockReset();
    mocks.getSession.mockResolvedValue({
      data: { session: session(ids.userB) },
      error: null,
    });
    render(
      <WebAuthSessionProvider>
        <DeletionAuthHarness />
      </WebAuthSessionProvider>,
    );
    expect(await screen.findByText("signed_in")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Effacer session A" }));
    await waitFor(() =>
      expect(screen.getByTestId("deletion-auth-result")).toHaveTextContent(
        "ok",
      ),
    );
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
