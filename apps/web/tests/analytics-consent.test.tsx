import {
  applyAnalyticsConsentDecision,
  createInitialAnalyticsConsentSnapshot,
} from "@thainaute/analytics";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrivacyExperience } from "../app/privacy/privacy-experience";
import {
  WEB_ANALYTICS_CONSENT_STORAGE_KEY,
  WebAnalyticsConsentProvider,
  useWebAnalyticsConsent,
} from "../lib/client/analytics-consent";

const analyticsEvent = {
  name: "lesson_started",
  lessonVersionId: "fixture-v1",
  platform: "web",
} as const;

function ConsentHarness() {
  const { accept, analytics, refuse, retry, status, withdraw } =
    useWebAnalyticsConsent();

  return (
    <>
      <output aria-label="État du consentement">{status}</output>
      <button onClick={accept} type="button">
        Accepter
      </button>
      <button onClick={refuse} type="button">
        Refuser
      </button>
      <button onClick={withdraw} type="button">
        Retirer
      </button>
      <button onClick={retry} type="button">
        Réessayer
      </button>
      <button onClick={() => analytics.capture(analyticsEvent)} type="button">
        Émettre
      </button>
    </>
  );
}

function renderHarness(capture = vi.fn()) {
  render(
    <WebAnalyticsConsentProvider sink={{ capture }}>
      <ConsentHarness />
    </WebAnalyticsConsentProvider>,
  );
  return capture;
}

async function expectStatus(status: string) {
  await waitFor(() =>
    expect(screen.getByLabelText("État du consentement")).toHaveTextContent(
      status,
    ),
  );
}

describe("consentement analytics web", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("rend un état de chargement fermé pendant le rendu serveur", () => {
    const markup = renderToStaticMarkup(
      <WebAnalyticsConsentProvider>
        <PrivacyExperience />
      </WebAnalyticsConsentProvider>,
    );

    expect(markup).toContain("Lecture de votre préférence");
  });

  it("reste muet avant l’accord et ne rejoue aucun événement après l’accord", async () => {
    const capture = renderHarness();
    await expectStatus("unknown");

    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
    await expectStatus("granted");
    expect(capture).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith(analyticsEvent);
  });

  it("présente accepter et refuser au même niveau puis rend le retrait accessible", async () => {
    render(
      <WebAnalyticsConsentProvider>
        <PrivacyExperience />
      </WebAnalyticsConsentProvider>,
    );

    expect(
      await screen.findByText(/Aucune préférence n’est enregistrée/i),
    ).toBeVisible();
    const accept = screen.getByRole("button", {
      name: "Accepter la mesure facultative",
    });
    const refuse = screen.getByRole("button", {
      name: "Refuser la mesure facultative",
    });
    expect(accept).toHaveClass("buttonGhost");
    expect(refuse).toHaveClass("buttonGhost");

    fireEvent.click(accept);
    expect(
      await screen.findByText(/La mesure facultative est autorisée/i),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Retirer mon consentement" }),
    );
    expect(
      await screen.findByText(/La mesure facultative est refusée/i),
    ).toBeVisible();
  });

  it("persiste l’accord puis le restaure sur un nouveau montage", async () => {
    const capture = renderHarness();
    await expectStatus("unknown");
    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
    await expectStatus("granted");

    expect(
      JSON.parse(
        window.localStorage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY) ??
          "null",
      ),
    ).toMatchObject({
      schemaVersion: 1,
      decision: "granted",
      revision: 1,
    });

    cleanup();
    renderHarness(capture);
    await expectStatus("granted");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).toHaveBeenCalledOnce();
  });

  it("coupe immédiatement le sink après le retrait et persiste le refus", async () => {
    const capture = renderHarness();
    await expectStatus("unknown");
    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
    await expectStatus("granted");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));
    await expectStatus("denied");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).toHaveBeenCalledOnce();
    expect(
      JSON.parse(
        window.localStorage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY) ??
          "null",
      ),
    ).toMatchObject({ decision: "denied", revision: 2 });
  });

  it("retente un retrait échoué sans restaurer l'ancien accord", async () => {
    const granted = applyAnalyticsConsentDecision(
      createInitialAnalyticsConsentSnapshot(),
      "granted",
      "2026-08-02T08:00:00.000Z",
    );
    window.localStorage.setItem(
      WEB_ANALYTICS_CONSENT_STORAGE_KEY,
      JSON.stringify(granted),
    );
    const capture = renderHarness();
    await expectStatus("granted");

    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Écriture indisponible", "QuotaExceededError");
    });
    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));
    await expectStatus("error");

    // L'ancien accord est supprimé avant l'écriture : un remontage resterait
    // donc fermé même avant que l'utilisateur retente la sauvegarde.
    expect(
      window.localStorage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await expectStatus("denied");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).not.toHaveBeenCalled();
    expect(
      JSON.parse(
        window.localStorage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY) ??
          "null",
      ),
    ).toMatchObject({ decision: "denied", revision: 2 });
  });

  it("échoue fermé face à une préférence corrompue et permet un refus de récupération", async () => {
    window.localStorage.setItem(
      WEB_ANALYTICS_CONSENT_STORAGE_KEY,
      '{"schemaVersion":1,"decision":"granted"}',
    );
    render(
      <WebAnalyticsConsentProvider sink={{ capture: vi.fn() }}>
        <PrivacyExperience />
      </WebAnalyticsConsentProvider>,
    );

    expect(
      await screen.findByText(/La mesure d’audience reste désactivée/i),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Réinitialiser en refusant" }),
    );
    expect(
      await screen.findByText(/La mesure facultative est refusée/i),
    ).toBeVisible();
    expect(
      JSON.parse(
        window.localStorage.getItem(WEB_ANALYTICS_CONSENT_STORAGE_KEY) ??
          "null",
      ),
    ).toMatchObject({ decision: "denied" });
  });

  it("relit la valeur canonique lors des événements multi-onglets, même livrés en retard", async () => {
    const capture = renderHarness();
    await expectStatus("unknown");
    const initial = createInitialAnalyticsConsentSnapshot(
      "2026-08-02T08:00:00.000Z",
    );
    const denied = applyAnalyticsConsentDecision(
      initial,
      "denied",
      "2026-08-02T08:01:00.000Z",
    );
    const granted = applyAnalyticsConsentDecision(
      denied,
      "granted",
      "2026-08-02T08:02:00.000Z",
    );

    window.localStorage.setItem(
      WEB_ANALYTICS_CONSENT_STORAGE_KEY,
      JSON.stringify(denied),
    );
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: WEB_ANALYTICS_CONSENT_STORAGE_KEY,
          newValue: JSON.stringify(denied),
          storageArea: window.localStorage,
        }),
      );
    });
    await expectStatus("denied");

    window.localStorage.setItem(
      WEB_ANALYTICS_CONSENT_STORAGE_KEY,
      JSON.stringify(granted),
    );
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: WEB_ANALYTICS_CONSENT_STORAGE_KEY,
          // Événement obsolète : le provider doit relire localStorage.
          newValue: JSON.stringify(denied),
          storageArea: window.localStorage,
        }),
      );
    });
    await expectStatus("granted");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).toHaveBeenCalledOnce();
  });

  it("n’active pas le sink si la persistance de l’accord échoue", async () => {
    const capture = renderHarness();
    await expectStatus("unknown");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota indisponible", "QuotaExceededError");
    });

    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
    await expectStatus("error");
    fireEvent.click(screen.getByRole("button", { name: "Émettre" }));
    expect(capture).not.toHaveBeenCalled();
  });
});
