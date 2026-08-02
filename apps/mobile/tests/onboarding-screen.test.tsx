// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  begin: vi.fn(),
  complete: vi.fn(),
  database: {},
  read: vi.fn(),
  replace: vi.fn(),
  update: vi.fn(),
}));

const testRouter = vi.hoisted(() => ({ replace: testState.replace }));

vi.mock("expo-router", () => ({
  useRouter: () => testRouter,
}));

vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));

vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.read;
    beginOnboarding = testState.begin;
    updateOnboarding = testState.update;
    completeOnboarding = testState.complete;
  },
}));

vi.mock("react-native-safe-area-context", async () => {
  const React = await import("react");
  return {
    SafeAreaView: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement("main", null, children),
  };
});

vi.mock("react-native", async () => {
  const React = await import("react");
  type NativeProps = {
    accessibilityLiveRegion?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      busy?: boolean;
      checked?: boolean;
      disabled?: boolean;
    };
    children?: ReactNode;
    disabled?: boolean;
    onPress?: () => void;
  };
  const container = ({ accessibilityRole, children }: NativeProps) =>
    React.createElement(
      accessibilityRole === "radiogroup" ? "fieldset" : "div",
      { role: accessibilityRole === "radiogroup" ? "radiogroup" : undefined },
      children,
    );
  return {
    ActivityIndicator: () => React.createElement("span", null, "chargement"),
    Platform: { OS: "android" },
    Pressable: ({
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
          disabled,
          onClick: onPress,
          role: accessibilityRole === "radio" ? "radio" : undefined,
        },
        children,
      ),
    ScrollView: container,
    StyleSheet: { create: <T,>(styles: T) => styles },
    Text: ({
      accessibilityLiveRegion,
      accessibilityRole,
      children,
    }: NativeProps) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "p",
        {
          "aria-live": accessibilityLiveRegion,
          role: accessibilityRole === "alert" ? "alert" : undefined,
        },
        children,
      ),
    View: container,
  };
});

// Les doubles natifs doivent être installés avant de résoudre l’écran.
// eslint-disable-next-line import/first
import { OnboardingScreen } from "../app/onboarding";

const startedAt = "2026-08-02T08:00:00.000Z";

function inProgress(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "in_progress",
      goalOptionId: null,
      motivationOptionId: null,
      experienceOptionId: null,
      startedAt,
      updatedAt: startedAt,
      ...overrides,
    },
    lesson: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  let snapshot = inProgress();
  testState.read.mockResolvedValue({
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: { status: "not_started" },
    lesson: null,
  });
  testState.begin.mockImplementation(async () => snapshot);
  testState.update.mockImplementation(
    async (update: Record<string, unknown>) => {
      snapshot = inProgress({ ...snapshot.onboarding, ...update });
      return snapshot;
    },
  );
  testState.complete.mockImplementation(async (selection) => ({
    ...snapshot,
    onboarding: {
      status: "completed",
      ...selection,
      startedAt,
      completedAt: "2026-08-02T08:01:00.000Z",
    },
  }));
});

afterEach(() => cleanup());

describe("onboarding mobile local", () => {
  it("persiste les trois choix avant d’ouvrir Aujourd’hui", async () => {
    const capture = vi.fn();
    render(<OnboardingScreen analytics={{ capture }} />);

    await screen.findByRole("heading", {
      name: "Un départ simple, pensé pour vous.",
    });
    expect(capture).toHaveBeenCalledWith({
      name: "onboarding_started",
      platform: "android",
    });

    fireEvent.click(screen.getByRole("radio", { name: "5 minutes" }));
    await waitFor(() =>
      expect(testState.update).toHaveBeenLastCalledWith(
        { goalOptionId: "prototype_goal_short" },
        expect.any(String),
      ),
    );
    fireEvent.click(screen.getByRole("radio", { name: "Voyager" }));
    await waitFor(() =>
      expect(testState.update).toHaveBeenLastCalledWith(
        { motivationOptionId: "prototype_motivation_travel" },
        expect.any(String),
      ),
    );
    fireEvent.click(screen.getByRole("radio", { name: "Je débute" }));
    await waitFor(() =>
      expect(testState.update).toHaveBeenLastCalledWith(
        { experienceOptionId: "prototype_experience_new" },
        expect.any(String),
      ),
    );

    const complete = screen.getByRole("button", {
      name: "Voir ma séance du jour",
    });
    await waitFor(() =>
      expect((complete as { disabled?: boolean }).disabled).toBe(false),
    );
    fireEvent.click(complete);

    await waitFor(() => expect(testState.complete).toHaveBeenCalledOnce());
    expect(testState.complete).toHaveBeenCalledWith(
      {
        goalOptionId: "prototype_goal_short",
        motivationOptionId: "prototype_motivation_travel",
        experienceOptionId: "prototype_experience_new",
      },
      expect.any(String),
    );
    expect(capture).toHaveBeenCalledWith({
      name: "onboarding_completed",
      platform: "android",
    });
    expect(testState.replace).toHaveBeenCalledWith("/");
  });

  it("reprend les choix existants sans doubler onboarding_started", async () => {
    testState.read.mockResolvedValue(
      inProgress({
        goalOptionId: "prototype_goal_regular",
        motivationOptionId: "prototype_motivation_daily_life",
      }),
    );
    const capture = vi.fn();
    render(<OnboardingScreen analytics={{ capture }} />);

    expect(
      (
        (await screen.findByRole("radio", {
          name: "10 minutes",
        })) as { getAttribute: (name: string) => string | null }
      ).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      (
        screen.getByRole("radio", {
          name: "Mieux vivre le quotidien",
        }) as { getAttribute: (name: string) => string | null }
      ).getAttribute("aria-checked"),
    ).toBe("true");
    expect(capture).not.toHaveBeenCalled();
    expect(testState.begin).not.toHaveBeenCalled();
  });

  it("reste fail-closed et permet de relire le stockage", async () => {
    testState.read
      .mockRejectedValueOnce(new Error("corrupt"))
      .mockResolvedValueOnce(inProgress());
    render(<OnboardingScreen />);

    expect(
      await screen.findByRole("heading", {
        name: "Stockage local indisponible",
      }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(
      await screen.findByRole("heading", {
        name: "Un départ simple, pensé pour vous.",
      }),
    ).toBeTruthy();
    expect(testState.read).toHaveBeenCalledTimes(2);
  });
});
