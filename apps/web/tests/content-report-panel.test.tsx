import type { AnalyticsSink } from "@thainaute/analytics";
import {
  createContentReportOutbox,
  enqueueContentReport,
  rejectContentReport,
  type ContentReportOutboxRejection,
  type ContentReportRejectionReason,
} from "@thainaute/sync";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  version: "20000000-0000-4000-8000-000000000001",
  exercise: "20000000-0000-4000-8000-000000000002",
  report: "30000000-0000-4000-8000-000000000001",
  nextReport: "30000000-0000-4000-8000-000000000002",
} as const;

const mocks = vi.hoisted(() => ({
  auth: {
    session: {
      user: { id: "10000000-0000-4000-8000-000000000001" },
    },
    sessionBoundaryRevision: 0,
    status: "signed_in",
  } as Record<string, unknown>,
  read: vi.fn(),
  discard: vi.fn(),
  submit: vi.fn(),
  synchronize: vi.fn(),
}));

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => mocks.auth,
}));

vi.mock("../lib/client/content-report", () => ({
  discardRejectedWebContentReport: mocks.discard,
  readWebContentReports: mocks.read,
  submitWebContentReport: mocks.submit,
  synchronizeWebContentReports: mocks.synchronize,
}));

import { ContentReportPanel } from "../app/learn/demo/content-report-panel";

function rejection(
  reason: ContentReportRejectionReason = "invalid_request",
): ContentReportOutboxRejection {
  const entry = {
    idempotencyKey: ids.report,
    body: {
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "tone" as const,
      platform: "web" as const,
    },
    createdAt: "2026-08-02T10:00:00.000Z",
  };
  return rejectContentReport(
    enqueueContentReport(createContentReportOutbox(), entry),
    entry,
    { reason, rejectedAt: "2026-08-02T12:00:00.000Z" },
  ).rejection as ContentReportOutboxRejection;
}

function renderPanel(analytics: AnalyticsSink, online = true) {
  return render(
    <ContentReportPanel
      analytics={analytics}
      contentVersionId={ids.version}
      exerciseId={ids.exercise}
      online={online}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth = {
    session: { user: { id: ids.user } },
    sessionBoundaryRevision: 0,
    status: "signed_in",
  };
  mocks.read.mockResolvedValue(createContentReportOutbox());
  mocks.synchronize.mockResolvedValue({
    acknowledgedIdempotencyKeys: [],
    pendingCount: 0,
    rejectedHead: null,
  });
  mocks.discard.mockResolvedValue({
    acknowledgedIdempotencyKeys: [],
    pendingCount: 0,
    rejectedHead: null,
  });
});

afterEach(cleanup);

describe("panneau de signalement web", () => {
  it("propose uniquement les huit catégories fermées et aucun texte libre", async () => {
    const user = userEvent.setup();
    renderPanel({ capture: vi.fn() });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );

    const category = screen.getByRole("combobox", { name: "Catégorie" });
    expect(category).toBeEnabled();
    expect(screen.getAllByRole("option")).toHaveLength(9);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Aucun texte libre, réponse ou audio/u),
    ).toBeVisible();
  });

  it("mesure uniquement après l’acquittement serveur", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    mocks.submit.mockResolvedValue({ status: "sent", pendingCount: 0 });
    renderPanel({ capture });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Catégorie" }),
      "vowel_length",
    );
    await user.click(
      screen.getByRole("button", { name: "Envoyer le signalement" }),
    );

    await waitFor(() =>
      expect(mocks.submit).toHaveBeenCalledWith({
        expectedUserId: ids.user,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "vowel_length",
          platform: "web",
        },
        online: true,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Signalement envoyé",
    );
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "web",
    });
  });

  it("annonce la file durable, l’erreur et permet un retry sans ressaisie", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    mocks.submit.mockResolvedValue({
      status: "queued",
      pendingCount: 1,
      reason: "delivery_failed",
    });
    mocks.synchronize.mockResolvedValue({
      acknowledgedIdempotencyKeys: [ids.report],
      pendingCount: 0,
      rejectedHead: null,
    });
    renderPanel({ capture });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Catégorie" }),
      "tone",
    );
    await user.click(
      screen.getByRole("button", { name: "Envoyer le signalement" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Signalement conservé",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "1 en attente sur cet appareil",
    );
    expect(capture).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Réessayer l’envoi" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Signalement envoyé",
    );
    expect(mocks.synchronize).toHaveBeenCalledWith(ids.user);
    expect(mocks.submit).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "web",
    });
  });

  it("explique la connexion obligatoire sans afficher le formulaire", async () => {
    const user = userEvent.setup();
    mocks.auth = {
      session: null,
      sessionBoundaryRevision: 1,
      status: "signed_out",
    };
    renderPanel({ capture: vi.fn() });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("compte permanent");
    expect(screen.getByRole("link", { name: "Me connecter" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("conserve explicitement hors ligne sans analytics", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    mocks.submit.mockResolvedValue({
      status: "queued",
      pendingCount: 1,
      reason: "offline",
    });
    renderPanel({ capture }, false);
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Catégorie" }),
      "audio",
    );
    await user.click(
      screen.getByRole("button", { name: "Conserver le signalement" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "conservé hors ligne",
    );
    expect(capture).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Réessayer l’envoi" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["invalid_request", /contenu ou sa version/u],
    ["idempotency_key_reused", /conflit de reprise/u],
  ] as const)(
    "affiche le refus durable %s sans analytics et exige un retrait explicite",
    async (reason, expectedText) => {
      const user = userEvent.setup();
      const capture = vi.fn();
      const durableRejection = rejection(reason);
      mocks.submit.mockResolvedValue({
        status: "rejected",
        pendingCount: 0,
        rejectedHead: durableRejection,
      });
      renderPanel({ capture });
      await user.click(
        screen.getByRole("button", { name: "Signaler une erreur" }),
      );
      await user.selectOptions(
        screen.getByRole("combobox", { name: "Catégorie" }),
        "tone",
      );
      await user.click(
        screen.getByRole("button", { name: "Envoyer le signalement" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(expectedText);
      expect(
        screen.getByRole("button", {
          name: "Retirer le signalement refusé et reprendre",
        }),
      ).toBeEnabled();
      expect(capture).not.toHaveBeenCalled();
    },
  );

  it("retire l'objet durable exact puis mesure uniquement le suivant acquitté", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    const durableRejection = rejection();
    const rejectedSnapshot = rejectContentReport(
      enqueueContentReport(
        enqueueContentReport(
          createContentReportOutbox(),
          durableRejection.entry,
        ),
        {
          ...durableRejection.entry,
          idempotencyKey: ids.nextReport,
          createdAt: "2026-08-02T10:01:00.000Z",
        },
      ),
      durableRejection.entry,
      {
        reason: durableRejection.reason,
        rejectedAt: durableRejection.rejectedAt,
      },
    );
    mocks.read.mockResolvedValue(rejectedSnapshot);
    mocks.discard.mockResolvedValue({
      acknowledgedIdempotencyKeys: [ids.nextReport],
      pendingCount: 0,
      rejectedHead: null,
    });
    renderPanel({ capture });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "refusé définitivement",
    );
    expect(capture).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    );

    await waitFor(() =>
      expect(mocks.discard).toHaveBeenCalledWith({
        expectedUserId: ids.user,
        rejection: durableRejection,
        online: true,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "file est à jour",
    );
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "web",
    });
  });

  it("garde le refus visible si le retrait exact échoue", async () => {
    const user = userEvent.setup();
    const durableRejection = rejection();
    mocks.read.mockResolvedValue({
      ...createContentReportOutbox(),
      entries: [durableRejection.entry],
      rejection: durableRejection,
    });
    mocks.discard.mockRejectedValue(new Error("session changed"));
    const capture = vi.fn();
    renderPanel({ capture });
    await user.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "reste conservé sans modification",
    );
    expect(capture).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    ).toBeEnabled();
  });
});
