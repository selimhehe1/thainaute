// @vitest-environment jsdom

import type { AnalyticsSink } from "@thainaute/analytics";
import {
  createContentReportOutbox,
  enqueueContentReport,
  rejectContentReport,
  type ContentReportOutboxRejection,
  type ContentReportRejectionReason,
} from "@thainaute/sync";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  user: "20000000-0000-4000-8000-000000000001",
  version: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000004",
  report: "30000000-0000-4000-8000-000000000001",
  nextReport: "30000000-0000-4000-8000-000000000002",
} as const;

const testState = vi.hoisted(() => ({
  announce: vi.fn(),
  auth: {
    status: "signed_out",
    session: null as null | { user: { id: string } },
    sessionBoundaryRevision: 0,
  },
  database: {},
  discard: vi.fn(),
  read: vi.fn(),
  submit: vi.fn(),
  synchronize: vi.fn(),
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    Link: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("../lib/auth-session", () => ({
  useMobileAuthSession: () => testState.auth,
}));
vi.mock("../lib/content-report", () => ({
  discardRejectedMobileContentReport: testState.discard,
  readMobileContentReports: testState.read,
  submitMobileContentReport: testState.submit,
  synchronizeMobileContentReports: testState.synchronize,
}));
vi.mock("react-native", async () => {
  const React = await import("react");
  type NativeProps = {
    accessibilityLabel?: string;
    accessibilityLiveRegion?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      busy?: boolean;
      checked?: boolean;
      disabled?: boolean;
      expanded?: boolean;
    };
    children?: ReactNode;
    disabled?: boolean;
    onPress?: () => void;
  };
  const View = ({ accessibilityRole, children }: NativeProps) =>
    React.createElement(
      "div",
      { role: accessibilityRole === "radiogroup" ? "radiogroup" : undefined },
      children,
    );
  return {
    AccessibilityInfo: {
      announceForAccessibility: testState.announce,
    },
    Platform: { OS: "android" },
    Pressable: ({
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      children,
      disabled,
      onPress,
    }: NativeProps) =>
      React.createElement(
        "button",
        {
          "aria-busy": accessibilityState?.busy,
          "aria-checked": accessibilityState?.checked,
          "aria-disabled": accessibilityState?.disabled,
          "aria-expanded": accessibilityState?.expanded,
          "aria-label": accessibilityLabel,
          disabled,
          onClick: onPress,
          role: accessibilityRole === "radio" ? "radio" : undefined,
        },
        children,
      ),
    StyleSheet: { create: <T,>(styles: T) => styles },
    Text: ({
      accessibilityLiveRegion,
      accessibilityRole,
      children,
    }: NativeProps) =>
      React.createElement(
        accessibilityRole === "header" ? "h2" : "p",
        {
          "aria-live": accessibilityLiveRegion,
          role: accessibilityRole === "alert" ? "alert" : undefined,
        },
        children,
      ),
    View,
  };
});

// Les doubles natifs doivent être installés avant de résoudre le composant.
// eslint-disable-next-line import/first
import { MobileContentReportPanel } from "../components/content-report-panel";

function rejection(
  reason: ContentReportRejectionReason = "invalid_request",
): ContentReportOutboxRejection {
  const entry = {
    idempotencyKey: ids.report,
    body: {
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "tone" as const,
      platform: "android" as const,
    },
    createdAt: "2026-08-02T04:00:00.000Z",
  };
  const snapshot = rejectContentReport(
    enqueueContentReport(createContentReportOutbox(), entry),
    entry,
    { reason, rejectedAt: "2026-08-02T05:00:00.000Z" },
  );
  if (snapshot.rejection === null) throw new Error("Expected rejection.");
  return snapshot.rejection;
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.auth.status = "signed_out";
  testState.auth.session = null;
  testState.auth.sessionBoundaryRevision = 0;
  testState.read.mockResolvedValue(createContentReportOutbox());
  testState.submit.mockResolvedValue({ status: "sent", pendingCount: 0 });
  testState.synchronize.mockResolvedValue({
    acknowledgedIdempotencyKeys: [],
    pendingCount: 0,
    rejectedHead: null,
  });
  testState.discard.mockResolvedValue({
    acknowledgedIdempotencyKeys: [],
    pendingCount: 0,
    rejectedHead: null,
  });
});

afterEach(() => cleanup());

function renderPanel(input?: {
  readonly analytics?: AnalyticsSink;
  readonly attemptDelivery?: boolean;
}) {
  const capture = vi.fn<AnalyticsSink["capture"]>();
  const analytics = input?.analytics ?? { capture };
  render(
    <MobileContentReportPanel
      analytics={analytics}
      contentVersionId={ids.version}
      exerciseId={ids.exercise}
      {...(input?.attemptDelivery === undefined
        ? {}
        : { attemptDelivery: input.attemptDelivery })}
    />,
  );
  return capture;
}

describe("interface de signalement mobile", () => {
  it("explique la connexion permanente sans proposer de texte libre", () => {
    renderPanel();
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );

    expect(screen.getByText(/Connectez un compte permanent/u)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Me connecter" })).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("présente exactement huit catégories fermées et annonce l'état hors ligne", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    testState.submit.mockResolvedValue({
      status: "queued",
      pendingCount: 1,
      reason: "offline",
    });
    const capture = renderPanel({ attemptDelivery: false });

    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    expect(screen.getAllByRole("radio")).toHaveLength(8);
    expect(screen.queryByRole("textbox")).toBeNull();
    const toneRadio = screen.getByRole("radio", { name: "Ton" });
    await waitFor(() =>
      expect((toneRadio as unknown as { disabled: boolean }).disabled).toBe(
        false,
      ),
    );
    fireEvent.click(toneRadio);
    fireEvent.click(
      screen.getByRole("button", { name: "Conserver le signalement" }),
    );

    expect(
      await screen.findByText(/Signalement conservé hors ligne/u),
    ).toBeTruthy();
    expect(testState.submit).toHaveBeenCalledWith({
      database: testState.database,
      expectedUserId: ids.user,
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "tone",
      attemptDelivery: false,
    });
    expect(capture).not.toHaveBeenCalled();
  });

  it("émet content_reported uniquement après l'accusé serveur", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    const capture = renderPanel();

    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    const audioRadio = screen.getByRole("radio", { name: "Audio" });
    await waitFor(() =>
      expect((audioRadio as unknown as { disabled: boolean }).disabled).toBe(
        false,
      ),
    );
    fireEvent.click(audioRadio);
    fireEvent.click(
      screen.getByRole("button", { name: "Envoyer le signalement" }),
    );

    expect(await screen.findByText(/Signalement envoyé/u)).toBeTruthy();
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "android",
    });
  });

  it("reprend une file durable et garde un bouton de rejeu après échec", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    testState.read.mockResolvedValue(
      enqueueContentReport(createContentReportOutbox(), {
        idempotencyKey: ids.report,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "naturalness",
          platform: "android",
        },
        createdAt: "2026-08-02T04:00:00.000Z",
      }),
    );
    testState.synchronize.mockRejectedValueOnce(new Error("offline"));
    renderPanel();

    await waitFor(() => expect(testState.synchronize).toHaveBeenCalledOnce());
    expect(testState.announce).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    expect(
      await screen.findByText(/Hors ligne ou service indisponible/u),
    ).toBeTruthy();
    await waitFor(() =>
      expect(testState.announce).toHaveBeenCalledWith(
        expect.stringMatching(/Hors ligne ou service indisponible/u),
      ),
    );
    expect(
      screen.getByRole("button", { name: "Réessayer l’envoi" }),
    ).toBeTruthy();
  });

  it.each([
    ["invalid_request", /contenu ou sa version/u],
    ["idempotency_key_reused", /conflit de reprise/u],
  ] as const)(
    "affiche le refus durable %s sans analytics et exige son retrait",
    async (reason, expectedText) => {
      testState.auth.status = "signed_in";
      testState.auth.session = { user: { id: ids.user } };
      const durableRejection = rejection(reason);
      testState.submit.mockResolvedValue({
        status: "rejected",
        pendingCount: 0,
        rejectedHead: durableRejection,
      });
      const capture = renderPanel();
      await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());
      fireEvent.click(
        screen.getByRole("button", { name: "Signaler une erreur" }),
      );
      const toneRadio = screen.getByRole("radio", { name: "Ton" });
      await waitFor(() =>
        expect((toneRadio as unknown as { disabled: boolean }).disabled).toBe(
          false,
        ),
      );
      fireEvent.click(toneRadio);
      fireEvent.click(
        screen.getByRole("button", { name: "Envoyer le signalement" }),
      );

      expect(
        (
          (await screen.findByRole("alert")) as unknown as {
            textContent: string | null;
          }
        ).textContent ?? "",
      ).toMatch(expectedText);
      expect(
        screen.getByRole("button", {
          name: "Retirer le signalement refusé et reprendre",
        }),
      ).toBeTruthy();
      expect(capture).not.toHaveBeenCalled();
    },
  );

  it("retire l'objet exact puis mesure uniquement le suivant acquitté", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    const durableRejection = rejection();
    const withNext = rejectContentReport(
      enqueueContentReport(
        enqueueContentReport(
          createContentReportOutbox(),
          durableRejection.entry,
        ),
        {
          ...durableRejection.entry,
          idempotencyKey: ids.nextReport,
          createdAt: "2026-08-02T04:01:00.000Z",
        },
      ),
      durableRejection.entry,
      {
        reason: durableRejection.reason,
        rejectedAt: durableRejection.rejectedAt,
      },
    );
    testState.read.mockResolvedValue(withNext);
    testState.discard.mockResolvedValue({
      acknowledgedIdempotencyKeys: [ids.nextReport],
      pendingCount: 0,
      rejectedHead: null,
    });
    const capture = renderPanel();
    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    expect(
      (
        (await screen.findByRole("alert")) as unknown as {
          textContent: string | null;
        }
      ).textContent,
    ).toContain("refusé définitivement");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    );

    await waitFor(() =>
      expect(testState.discard).toHaveBeenCalledWith({
        database: testState.database,
        expectedUserId: ids.user,
        rejection: durableRejection,
        attemptDelivery: true,
      }),
    );
    expect(await screen.findByText(/file est à jour/u)).toBeTruthy();
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "android",
    });
  });

  it("garde le refus visible si le retrait exact échoue", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    const durableRejection = rejection();
    testState.read.mockResolvedValue({
      ...createContentReportOutbox(),
      entries: [durableRejection.entry],
      rejection: durableRejection,
    });
    testState.discard.mockRejectedValue(new Error("session changed"));
    const capture = renderPanel();
    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());
    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    );

    expect(
      (
        (await screen.findByRole("alert")) as unknown as {
          textContent: string | null;
        }
      ).textContent,
    ).toContain("reste conservé sans modification");
    expect(capture).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", {
        name: "Retirer le signalement refusé et reprendre",
      }),
    ).toBeTruthy();
  });

  it("annonce une erreur de stockage sans remplacer la file", async () => {
    testState.auth.status = "signed_in";
    testState.auth.session = { user: { id: ids.user } };
    testState.read.mockRejectedValue(new Error("sqlite unavailable"));
    renderPanel();

    fireEvent.click(
      screen.getByRole("button", { name: "Signaler une erreur" }),
    );
    expect(
      (
        (await screen.findByRole("alert")) as unknown as {
          textContent: string | null;
        }
      ).textContent,
    ).toContain("file locale de signalements est indisponible");
    expect(testState.submit).not.toHaveBeenCalled();
  });
});
