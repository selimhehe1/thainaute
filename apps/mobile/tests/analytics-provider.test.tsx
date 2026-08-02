// @vitest-environment jsdom

import {
  applyAnalyticsConsentDecision,
  createInitialAnalyticsConsentSnapshot,
  type AnalyticsConsentSnapshot,
  type AnalyticsEvent,
} from "@thainaute/analytics";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MobileAnalyticsProvider,
  useMobileAnalytics,
} from "../lib/analytics-provider";
import type { MobileAnalyticsConsentStorePort } from "../lib/mobile-analytics-consent-store";

vi.mock("expo-sqlite", () => ({
  useSQLiteContext: vi.fn(),
}));

afterEach(cleanup);

function memoryStore(
  initial: AnalyticsConsentSnapshot = createInitialAnalyticsConsentSnapshot(),
): MobileAnalyticsConsentStorePort {
  let snapshot = initial;
  return {
    read: vi.fn(async () => snapshot),
    decide: vi.fn(async (decision, updatedAt) => {
      snapshot = applyAnalyticsConsentDecision(snapshot, decision, updatedAt);
      return snapshot;
    }),
  };
}

function Probe() {
  const consent = useMobileAnalytics();
  const event: AnalyticsEvent = {
    name: "onboarding_started",
    platform: "android",
  };
  return (
    <div>
      <span data-testid="status">{consent.status}</span>
      <span data-testid="decision">{consent.decision}</span>
      <button type="button" onClick={() => consent.analytics.capture(event)}>
        capturer
      </button>
      <button type="button" onClick={() => void consent.decide("granted")}>
        accepter
      </button>
      <button type="button" onClick={() => void consent.decide("denied")}>
        refuser
      </button>
      <button type="button" onClick={consent.retry}>
        réessayer
      </button>
    </div>
  );
}

describe("provider de consentement analytics mobile", () => {
  it("n'émet rien avant le choix et ne rejoue pas le passé après acceptation", async () => {
    const capture = vi.fn();
    render(
      <MobileAnalyticsProvider store={memoryStore()} sink={{ capture }}>
        <Probe />
      </MobileAnalyticsProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "capturer" }));
    expect(capture).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "accepter" }));
    await waitFor(() => expect(screen.getByText("granted")).toBeTruthy());
    expect(capture).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "capturer" }));
    expect(capture).toHaveBeenCalledOnce();
  });

  it("coupe immédiatement le sink et appelle son reset au retrait", async () => {
    const initial = applyAnalyticsConsentDecision(
      createInitialAnalyticsConsentSnapshot(),
      "granted",
      "2026-08-02T09:00:00.000Z",
    );
    const capture = vi.fn();
    const reset = vi.fn();
    render(
      <MobileAnalyticsProvider
        store={memoryStore(initial)}
        sink={{ capture, reset }}
      >
        <Probe />
      </MobileAnalyticsProvider>,
    );
    await waitFor(() => expect(screen.getByText("granted")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "capturer" }));
    expect(capture).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "refuser" }));
    fireEvent.click(screen.getByRole("button", { name: "capturer" }));

    expect(capture).toHaveBeenCalledOnce();
    await waitFor(() => expect(reset).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByText("denied")).toBeTruthy());
  });

  it("reste fermé si la préférence ne peut pas être relue", async () => {
    const capture = vi.fn();
    const store: MobileAnalyticsConsentStorePort = {
      read: vi.fn(async () => {
        throw new Error("corrupt");
      }),
      decide: vi.fn(),
    };
    render(
      <MobileAnalyticsProvider store={store} sink={{ capture }}>
        <Probe />
      </MobileAnalyticsProvider>,
    );

    await waitFor(() => expect(screen.getByText("error")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "capturer" }));
    expect(capture).not.toHaveBeenCalled();
  });

  it("retente le refus après un échec sans relire l'ancien accord", async () => {
    let snapshot = applyAnalyticsConsentDecision(
      createInitialAnalyticsConsentSnapshot(),
      "granted",
      "2026-08-02T09:00:00.000Z",
    );
    let failNextDenial = true;
    const store: MobileAnalyticsConsentStorePort = {
      read: vi.fn(async () => snapshot),
      decide: vi.fn(async (decision, updatedAt) => {
        if (decision === "denied" && failNextDenial) {
          failNextDenial = false;
          throw new Error("sqlite unavailable");
        }
        snapshot = applyAnalyticsConsentDecision(snapshot, decision, updatedAt);
        return snapshot;
      }),
    };
    const capture = vi.fn();
    render(
      <MobileAnalyticsProvider store={store} sink={{ capture }}>
        <Probe />
      </MobileAnalyticsProvider>,
    );
    await waitFor(() => expect(screen.getByText("granted")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "refuser" }));
    await waitFor(() => expect(screen.getByText("error")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "capturer" }));
    expect(capture).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "réessayer" }));
    await waitFor(() => expect(screen.getByText("denied")).toBeTruthy());
    expect(store.read).toHaveBeenCalledOnce();
    expect(store.decide).toHaveBeenCalledTimes(2);
    await expect(store.read()).resolves.toMatchObject({ decision: "denied" });
  });

  it("conserve le dernier choix si un reset fournisseur se termine en retard", async () => {
    const store = memoryStore();
    let finishReset: (() => void) | undefined;
    const reset = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishReset = resolve;
        }),
    );
    render(
      <MobileAnalyticsProvider store={store} sink={{ capture: vi.fn(), reset }}>
        <Probe />
      </MobileAnalyticsProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "accepter" }));
    await waitFor(() => expect(screen.getByText("granted")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "refuser" }));
    fireEvent.click(screen.getByRole("button", { name: "accepter" }));
    await waitFor(() => expect(screen.getByText("granted")).toBeTruthy());
    await expect(store.read()).resolves.toMatchObject({
      decision: "granted",
      revision: 3,
    });

    await act(async () => {
      finishReset?.();
      await Promise.resolve();
    });
    expect(screen.getByText("granted")).toBeTruthy();
  });

  it("ignore une résolution tardive après démontage", async () => {
    let resolveRead: ((value: AnalyticsConsentSnapshot) => void) | undefined;
    const store: MobileAnalyticsConsentStorePort = {
      read: () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        }),
      decide: vi.fn(),
    };
    const rendered = render(
      <MobileAnalyticsProvider store={store}>
        <Probe />
      </MobileAnalyticsProvider>,
    );
    rendered.unmount();

    await act(async () => {
      resolveRead?.(createInitialAnalyticsConsentSnapshot());
      await Promise.resolve();
    });
  });
});
