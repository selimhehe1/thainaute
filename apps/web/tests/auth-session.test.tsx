import type { Session } from "@supabase/supabase-js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
} as const;

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  purgeSettledAccount: vi.fn(() => Promise.resolve(false)),
  signOut: vi.fn(() => Promise.resolve({ error: null })),
}));

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

function SignOutHarness() {
  const auth = useWebAuthSession();
  const [result, setResult] = useState("idle");
  return (
    <>
      <span>{auth.status}</span>
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
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.signOut.mockClear();
    mocks.onAuthStateChange.mockClear();
    mocks.purgeSettledAccount.mockClear();
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
