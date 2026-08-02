import type { AnalyticsSink } from "@thainaute/analytics";
import type { AccountExportDocument } from "@thainaute/sync";
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
  userB: "10000000-0000-4000-8000-000000000002",
} as const;

const mocks = vi.hoisted(() => ({
  deliver: vi.fn(),
  request: vi.fn(),
}));

vi.mock("../lib/client/account-export", () => ({
  deliverWebAccountExport: mocks.deliver,
  requestWebAccountExport: mocks.request,
}));

import { AccountExportSection } from "../app/account/account-export-section";

const exportDocument = {
  format: "thainaute.account-export/v2",
  exportedAt: "2026-08-02T10:00:00.000Z",
  identity: {
    id: ids.userA,
    email: "apprenant@example.test",
    phone: null,
    providers: ["email"],
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: null,
    lastSignInAt: null,
    emailConfirmedAt: null,
    phoneConfirmedAt: null,
  },
  data: {
    profile: null,
    devices: [],
    attemptEvents: [],
    learnerItemStates: [],
    contentReports: [],
  },
} satisfies AccountExportDocument;

function renderSection(sessionBoundaryRevision = 0, analytics?: AnalyticsSink) {
  return render(
    <AccountExportSection
      anonymousAttemptCount={1}
      expectedUserId={ids.userA}
      fusionPending
      pendingAttemptCount={2}
      sessionBoundaryRevision={sessionBoundaryRevision}
      {...(analytics === undefined ? {} : { analytics })}
    />,
  );
}

describe("section d'export du compte web", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("explique le périmètre serveur, les exclusions et les alertes locales", () => {
    renderSection();

    expect(
      screen.getByRole("heading", {
        name: "Exporter les données de mon compte",
      }),
    ).toBeVisible();
    expect(screen.getByText(/identité, appareils, tentatives/u)).toBeVisible();
    expect(
      screen.getByText(/prises de voix ne sont pas inclus/u),
    ).toBeVisible();
    expect(screen.getByText(/données personnelles/u)).toBeVisible();
    expect(screen.getByText(/2 tentatives.*ne figureront/u)).toBeVisible();
    expect(screen.getByText(/progression anonyme locale/u)).toBeVisible();
    expect(screen.getByText(/Terminez la fusion/u)).toBeVisible();
  });

  it("télécharge sans placer le document dans l'état React", async () => {
    const capture = vi.fn();
    let resolveRequest!: (value: AccountExportDocument) => void;
    mocks.request.mockImplementation(
      () =>
        new Promise<AccountExportDocument>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    renderSection(0, { capture });

    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    );

    expect(
      screen.getByRole("button", { name: "Préparation du fichier…" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("region", {
        name: "Exporter les données de mon compte",
      }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    resolveRequest(exportDocument);
    await waitFor(() =>
      expect(mocks.deliver).toHaveBeenCalledWith(exportDocument),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Le téléchargement de votre export JSON a été lancé.",
    );
    expect(
      screen.getByRole("region", {
        name: "Exporter les données de mon compte",
      }),
    ).toHaveAttribute("aria-busy", "false");
    expect(capture).toHaveBeenCalledWith({
      name: "account_export_requested",
      platform: "web",
    });
  });

  it("ne bloque pas l’export si le sink analytics échoue", async () => {
    mocks.request.mockResolvedValue(exportDocument);
    renderSection(0, {
      capture: () => {
        throw new Error("analytics unavailable");
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    );

    await waitFor(() =>
      expect(mocks.deliver).toHaveBeenCalledWith(exportDocument),
    );
  });

  it("annule et invalide une réponse si la frontière de session change", async () => {
    let resolveRequest!: (value: AccountExportDocument) => void;
    mocks.request.mockImplementation(
      () =>
        new Promise<AccountExportDocument>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const view = renderSection();
    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    );
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
    const signal = mocks.request.mock.calls[0]?.[0]?.signal as AbortSignal;

    view.rerender(
      <AccountExportSection
        anonymousAttemptCount={1}
        expectedUserId={ids.userA}
        fusionPending
        pendingAttemptCount={2}
        sessionBoundaryRevision={1}
      />,
    );

    expect(signal.aborted).toBe(true);
    resolveRequest(exportDocument);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Votre session a changé. Aucun fichier n’a été créé.",
      ),
    );
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it("invalide synchroniquement une remise lors du démontage", async () => {
    let resolveRequest!: (value: AccountExportDocument) => void;
    mocks.request.mockImplementation(
      () =>
        new Promise<AccountExportDocument>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const view = renderSection();
    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    );
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
    const signal = mocks.request.mock.calls[0]?.[0]?.signal as AbortSignal;

    view.unmount();

    expect(signal.aborted).toBe(true);
    resolveRequest(exportDocument);
    await Promise.resolve();
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it("efface le statut du compte précédent lors d'une bascule au repos", async () => {
    mocks.request.mockResolvedValue(exportDocument);
    const view = renderSection();
    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Le téléchargement de votre export JSON a été lancé.",
      ),
    );

    view.rerender(
      <AccountExportSection
        anonymousAttemptCount={0}
        expectedUserId={ids.userB}
        fusionPending={false}
        pendingAttemptCount={0}
        sessionBoundaryRevision={1}
      />,
    );

    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Télécharger mon export JSON" }),
    ).toBeEnabled();
  });
});
