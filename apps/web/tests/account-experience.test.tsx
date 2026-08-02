import type { Session } from "@supabase/supabase-js";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
} as const;

const mocks = vi.hoisted(() => ({
  discardAnonymous: vi.fn(),
  purgeAccount: vi.fn(),
  purgeSettledAccount: vi.fn(),
  readLocalState: vi.fn(),
  state: { client: null as Record<string, unknown> | null },
  synchronize: vi.fn(),
}));

vi.mock("../lib/client/account-sync", () => ({
  discardWebAnonymousProgress: mocks.discardAnonymous,
  purgeWebAccountData: mocks.purgeAccount,
  purgeSettledWebAccountData: mocks.purgeSettledAccount,
  readWebAccountLocalState: mocks.readLocalState,
  synchronizeWebAccount: mocks.synchronize,
}));

vi.mock("../lib/client/supabase-auth", () => ({
  getWebSupabaseAuthClient: () => mocks.state.client,
}));

import { AccountExperience } from "../app/account/account-experience";
import { WebAuthSessionProvider } from "../lib/client/auth-session";

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

describe("parcours compte web", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.state.client = null;
  });

  it("reste explicitement hors ligne sans configuration Supabase", () => {
    render(
      <WebAuthSessionProvider>
        <AccountExperience />
      </WebAuthSessionProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Compte non configuré ici" }),
    ).toBeVisible();
    expect(screen.queryByLabelText("Adresse email")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Télécharger mon export JSON" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continuer hors ligne" }),
    ).toHaveAttribute("href", "/learn/demo");
  });

  it("nomme explicitement la suppression locale avant déconnexion", async () => {
    const currentSession = session(ids.userA);
    mocks.state.client = {
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: currentSession }, error: null }),
        ),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    };
    mocks.readLocalState.mockResolvedValue({
      accountSnapshot: {
        authoritativeStates: [],
        entries: [{ status: "pending" }],
        owner: { kind: "account", userId: ids.userA },
      },
      anonymousSnapshot: { entries: [] },
      fusionMarker: null,
      contentReportOutbox: {
        format: "thainaute.content-report-outbox/v1",
        entries: [
          {
            idempotencyKey: "30000000-0000-4000-8000-000000000001",
          },
        ],
      },
    });

    render(
      <WebAuthSessionProvider>
        <AccountExperience />
      </WebAuthSessionProvider>,
    );

    const logout = await screen.findByRole("button", {
      name: "Me déconnecter de cet appareil",
    });
    await waitFor(() => expect(logout).toBeEnabled());
    expect(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    ).toBeEnabled();
    fireEvent.click(logout);

    expect(
      screen.getByRole("button", {
        name: "Effacer les données locales liées à ce compte et me déconnecter",
      }),
    ).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "effacement uniquement sur cet appareil",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Votre compte reste en ligne",
    );
    expect(screen.getByRole("status")).toHaveTextContent("signalements");
    expect(
      screen.getByText("signalements en attente").parentElement,
    ).toHaveTextContent("1");
  });

  it("rend les signalements envoyés et encore en attente observables après la synchronisation", async () => {
    const currentSession = session(ids.userA);
    mocks.state.client = {
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: currentSession }, error: null }),
        ),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    };
    const localState = (pendingReports: number) => ({
      accountSnapshot: {
        authoritativeStates: [],
        entries: [],
        owner: { kind: "account", userId: ids.userA },
      },
      anonymousSnapshot: { entries: [] },
      fusionMarker: null,
      contentReportOutbox: {
        format: "thainaute.content-report-outbox/v1",
        entries: Array.from({ length: pendingReports }, (_, index) => ({
          idempotencyKey: `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        })),
      },
    });
    mocks.readLocalState
      .mockResolvedValueOnce(localState(2))
      .mockResolvedValueOnce(localState(1));
    mocks.synchronize.mockResolvedValue({
      snapshot: localState(1).accountSnapshot,
      batchesSent: 0,
      fusionCompleted: false,
      fusionRejectedCount: 0,
      contentReportsSent: 1,
      contentReportsPending: 1,
      contentReportsRejected: 1,
    });

    render(
      <WebAuthSessionProvider>
        <AccountExperience />
      </WebAuthSessionProvider>,
    );

    const synchronize = await screen.findByRole("button", {
      name: "Synchroniser maintenant",
    });
    await waitFor(() => expect(synchronize).toBeEnabled());
    fireEvent.click(synchronize);

    await waitFor(() =>
      expect(mocks.synchronize).toHaveBeenCalledWith({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "1 signalement envoyé",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 signalement reste conservé",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Un signalement a été refusé définitivement",
    );
    await waitFor(() =>
      expect(
        screen.getByText("signalements en attente").parentElement,
      ).toHaveTextContent("1"),
    );
  });
});
