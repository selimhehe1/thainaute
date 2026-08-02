import { readFixtureBundle } from "@thainaute/content";
import { reviewContentBundle } from "@thainaute/content/studio";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    status: "signed_in" as
      "loading" | "unconfigured" | "signed_out" | "signed_in",
    session: {
      access_token: "header.payload.editor-token",
      user: { id: "10000000-0000-4000-8000-000000000001" },
    } as { access_token: string; user: { id: string } } | null,
    sessionBoundaryRevision: 0,
  },
  request: vi.fn(),
}));

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => mocks.auth,
}));

vi.mock("../lib/client/content-studio", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../lib/client/content-studio")>();
  return {
    ...original,
    requestFixtureContentReview: mocks.request,
  };
});

import { ContentReviewStudio } from "../app/studio/content-review-studio";
import { ContentStudioClientError } from "../lib/client/content-studio";
import { EMPTY_CONTENT_REPORT_AGGREGATE } from "../lib/content-studio-contracts";

const fixtureReport = reviewContentBundle(readFixtureBundle());
const invalidReport = reviewContentBundle({ invalid: true });
const fixtureEnvelope = {
  review: fixtureReport,
  userReports: EMPTY_CONTENT_REPORT_AGGREGATE,
};
const invalidEnvelope = {
  review: invalidReport,
  userReports: EMPTY_CONTENT_REPORT_AGGREGATE,
};
const fixtureTitle = fixtureReport.summary?.lesson.titleFr;
if (fixtureTitle === undefined) throw new Error("Fixture de revue incomplète.");

describe("studio web de prépublication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.status = "signed_in";
    mocks.auth.session = {
      access_token: "header.payload.editor-token",
      user: { id: "10000000-0000-4000-8000-000000000001" },
    };
    mocks.auth.sessionBoundaryRevision = 0;
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("ne révèle aucun dossier avant la connexion", () => {
    mocks.auth.status = "signed_out";
    mocks.auth.session = null;
    render(<ContentReviewStudio />);

    expect(
      screen.getByRole("heading", { name: "Connectez un compte autorisé." }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Ouvrir le compte" }),
    ).toHaveAttribute("href", "/account");
    expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("rend les états de chargement et de configuration sans exposer le studio", () => {
    mocks.auth.status = "loading";
    mocks.auth.session = null;
    const view = render(<ContentReviewStudio />);

    expect(
      screen.getByText("Vérification de l’accès au studio…"),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Vérifier la publication" }),
    ).not.toBeInTheDocument();

    mocks.auth.status = "unconfigured";
    view.rerender(<ContentReviewStudio />);

    expect(
      screen.getByRole("heading", { name: "Studio indisponible." }),
    ).toBeVisible();
    expect(screen.getByText(/Auth n’est pas configuré/u)).toBeVisible();
  });

  it("affiche le refus, les sept audits, les droits et l’Unicode sans publier", async () => {
    mocks.request.mockResolvedValue(fixtureEnvelope);
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );

    expect(
      await screen.findByRole("heading", {
        name: fixtureTitle,
      }),
    ).toHaveFocus();
    expect(screen.getByText("Publication refusée")).toBeVisible();
    expect(screen.getByText("FIXTURE_NOT_PUBLISHABLE")).toBeVisible();
    expect(screen.getByText("Fixture synthétique")).toBeVisible();
    expect(
      screen.getByText("Confiance faible · consultée le 2026-08-01"),
    ).toBeVisible();
    expect(screen.getByText("U+0E01 U+0E48")).toBeVisible();
    expect(screen.getAllByText("Orthographe")[0]).toBeVisible();
    expect(screen.getAllByText("À contrôler")).toHaveLength(7);
    expect(screen.getAllByText("À contrôler")[0]).toHaveClass(
      "studioAuditStatus-pending",
    );
    expect(screen.getByText(/aucune écriture, aucune release/u)).toBeVisible();
    expect(mocks.request).toHaveBeenCalledWith({
      accessToken: "header.payload.editor-token",
      signal: expect.any(AbortSignal),
    });
  });

  it("affiche seulement les comptes agrégés des signalements", async () => {
    mocks.request.mockResolvedValue({
      review: fixtureReport,
      userReports: {
        total: 3,
        byCategory: {
          ...EMPTY_CONTENT_REPORT_AGGREGATE.byCategory,
          tone: 2,
          audio: 1,
        },
      },
    });
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Signalements apprenants" }),
    ).toBeVisible();
    expect(
      screen.getByText(/3 signalements structurés, sans identité affichée/u),
    ).toBeVisible();
    expect(screen.queryByText(/@/u)).not.toBeInTheDocument();
  });

  it("signale chaque liste de rapport tronquée", async () => {
    const truncatedReport = structuredClone(fixtureReport);
    const summary = truncatedReport.summary;
    if (summary === null) throw new Error("Rapport fixture sans résumé.");
    summary.sources.truncated = true;
    summary.sources.total = 51;
    summary.items.truncated = true;
    summary.items.total = 52;
    summary.findings.truncated = true;
    summary.findings.total = 53;
    summary.audio.truncated = true;
    summary.audio.total = 54;
    mocks.request.mockResolvedValue({
      review: truncatedReport,
      userReports: EMPTY_CONTENT_REPORT_AGGREGATE,
    });
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );

    expect(await screen.findByText(/1 sources sur 51/u)).toBeVisible();
    expect(screen.getByText(/1 éléments sur 52/u)).toBeVisible();
    expect(screen.getByText(/1 findings sur 53/u)).toBeVisible();
    expect(screen.getByText(/1 assets audio détaillés sur 54/u)).toBeVisible();
  });

  it("masque un refus de rôle derrière une indisponibilité du studio", async () => {
    mocks.request.mockRejectedValue(
      new ContentStudioClientError("access_denied"),
    );
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );

    expect(
      await screen.findByText("Le studio n’est pas disponible pour ce compte."),
    ).toBeVisible();
    expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
  });

  it.each([
    [
      new ContentStudioClientError("session_expired"),
      "La session a expiré. Reconnectez-vous avant de relancer la revue.",
    ],
    [
      new Error("secret interne à ne pas refléter"),
      "La revue est indisponible. Aucun contenu n’a été modifié.",
    ],
  ])(
    "affiche une erreur sûre sans conserver de rapport",
    async (error, text) => {
      mocks.request.mockRejectedValue(error);
      render(<ContentReviewStudio />);

      fireEvent.click(
        screen.getByRole("button", { name: "Vérifier la publication" }),
      );

      expect(await screen.findByText(text)).toBeVisible();
      expect(screen.queryByText(/secret interne/u)).not.toBeInTheDocument();
      expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
    },
  );

  it("présente un schéma refusé sans essayer de le publier", async () => {
    mocks.request.mockResolvedValue(invalidEnvelope);
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Le document ne peut pas être contrôlé.",
      }),
    ).toHaveFocus();
    expect(screen.getByText("Schéma refusé")).toBeVisible();
    expect(
      screen.queryByText("INVALID_CONTENT_BUNDLE"),
    ).not.toBeInTheDocument();
  });

  it("bloque hors ligne puis reprend sans conserver de dossier local", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    mocks.request.mockResolvedValue(fixtureEnvelope);
    render(<ContentReviewStudio />);

    const button = screen.getByRole("button", {
      name: "Vérifier la publication",
    });
    await waitFor(() => expect(button).toBeDisabled());
    expect(
      screen.getByText(/exige une vérification Auth en ligne/u),
    ).toBeVisible();
    expect(mocks.request).not.toHaveBeenCalled();

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event("online"));
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    expect(await screen.findByText("Publication refusée")).toBeVisible();
  });

  it("annule une revue en cours dès que le réseau tombe", async () => {
    let resolveReview!: (value: typeof fixtureEnvelope) => void;
    mocks.request.mockImplementation(
      () =>
        new Promise<typeof fixtureEnvelope>((resolve) => {
          resolveReview = resolve;
        }),
    );
    render(<ContentReviewStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
    const requestSignal = mocks.request.mock.calls[0]?.[0]?.signal as
      AbortSignal | undefined;

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    window.dispatchEvent(new Event("offline"));

    await waitFor(() => expect(requestSignal?.aborted).toBe(true));
    expect(
      screen.getByRole("button", { name: "Vérification…" }),
    ).toBeDisabled();
    await act(async () => resolveReview(fixtureEnvelope));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Vérifier la publication" }),
      ).toBeDisabled(),
    );
    expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
  });

  it("retire un ancien rapport avant une nouvelle revue en échec", async () => {
    mocks.request
      .mockResolvedValueOnce(fixtureEnvelope)
      .mockRejectedValueOnce(new Error("indisponible"));
    render(<ContentReviewStudio />);

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    expect(
      await screen.findByRole("heading", { name: fixtureTitle }),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    expect(
      screen.queryByRole("heading", { name: fixtureTitle }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText(
        "La revue est indisponible. Aucun contenu n’a été modifié.",
      ),
    ).toBeVisible();
  });

  it("masque immédiatement le rapport A lors du passage au compte B", async () => {
    mocks.request.mockResolvedValue(fixtureEnvelope);
    const view = render(<ContentReviewStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    expect(
      await screen.findByRole("heading", { name: fixtureTitle }),
    ).toBeVisible();

    mocks.auth.sessionBoundaryRevision = 1;
    mocks.auth.session = {
      access_token: "header.payload.other-editor-token",
      user: { id: "20000000-0000-4000-8000-000000000002" },
    };
    view.rerender(<ContentReviewStudio />);
    expect(
      screen.queryByRole("heading", { name: fixtureTitle }),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByText(
        "Session changée. Lancez une nouvelle revue pour ce compte.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Voir chaque porte avant toute publication.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("heading", { name: fixtureTitle }),
    ).not.toBeInTheDocument();
  });

  it("annule et ignore une revue A encore en cours après le passage à B", async () => {
    let resolveReview!: (value: typeof fixtureEnvelope) => void;
    mocks.request.mockImplementation(
      () =>
        new Promise<typeof fixtureEnvelope>((resolve) => {
          resolveReview = resolve;
        }),
    );
    const view = render(<ContentReviewStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
    const requestSignal = mocks.request.mock.calls[0]?.[0]?.signal as
      AbortSignal | undefined;

    mocks.auth.sessionBoundaryRevision = 1;
    mocks.auth.session = {
      access_token: "header.payload.other-editor-token",
      user: { id: "20000000-0000-4000-8000-000000000002" },
    };
    view.rerender(<ContentReviewStudio />);

    expect(requestSignal?.aborted).toBe(true);
    await act(async () => resolveReview(fixtureEnvelope));
    expect(
      await screen.findByText(
        "Session changée. Lancez une nouvelle revue pour ce compte.",
      ),
    ).toBeVisible();
    expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
  });

  it("retire le rapport et place le focus sur la connexion après déconnexion", async () => {
    mocks.request.mockResolvedValue(fixtureEnvelope);
    const view = render(<ContentReviewStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Vérifier la publication" }),
    );
    expect(
      await screen.findByRole("heading", { name: fixtureTitle }),
    ).toBeVisible();

    mocks.auth.sessionBoundaryRevision = 1;
    mocks.auth.session = null;
    mocks.auth.status = "signed_out";
    view.rerender(<ContentReviewStudio />);

    const signInHeading = screen.getByRole("heading", {
      name: "Connectez un compte autorisé.",
    });
    await waitFor(() => expect(signInHeading).toHaveFocus());
    expect(screen.queryByText("Publication refusée")).not.toBeInTheDocument();
  });
});
