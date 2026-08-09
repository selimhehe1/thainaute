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
  auth: {
    session: null as { readonly user: { readonly id: string } } | null,
    sessionBoundaryRevision: 0,
    status: "signed_out",
  },
  database: {},
  localProgress: vi.fn(),
  push: vi.fn(),
  read: vi.fn(),
  project: vi.fn<(input: unknown) => unknown>(),
  refresh: vi.fn(),
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    useFocusEffect: (effect: () => void | (() => void)) =>
      React.useEffect(() => effect(), [effect]),
    useRouter: () => ({ push: testState.push }),
  };
});
vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("../lib/auth-session", () => ({
  useMobileAuthSession: () => testState.auth,
}));
vi.mock("../lib/mobile-account-progress", () => ({
  readMobileLocalProgress: testState.localProgress,
  refreshMobileAccountProgress: testState.refresh,
}));
vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.read;
  },
}));
vi.mock("../lib/mobile-progress", () => ({
  projectMobileLearningProgress: testState.project,
}));
vi.mock("../lib/mobile-lesson-expedition-config", () => ({
  mobileUnit01MixedExpeditionConfigs: {},
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
    accessibilityLabel?: string;
    accessibilityRole?: string;
    children?: ReactNode;
    onPress?: () => void;
    style?: { minHeight?: number };
    testID?: string;
  };
  const container = ({
    accessibilityLabel,
    accessibilityRole,
    children,
    testID,
  }: NativeProps) =>
    React.createElement(
      "div",
      {
        "aria-label": accessibilityLabel,
        role: accessibilityRole,
        "data-testid": testID,
      },
      children,
    );
  return {
    ActivityIndicator: () => React.createElement("span", null, "chargement"),
    Pressable: ({ accessibilityRole, children, onPress, style }: NativeProps) =>
      React.createElement(
        "button",
        {
          "data-min-height": style?.minHeight,
          onClick: onPress,
          role: accessibilityRole,
        },
        children,
      ),
    ScrollView: container,
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      hairlineWidth: 1,
    },
    Text: ({ accessibilityRole, children }: NativeProps) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "p",
        null,
        children,
      ),
    View: container,
  };
});

// Les doubles natifs doivent être installés avant de résoudre l’écran.
// eslint-disable-next-line import/first
import ProgressScreen from "../internal/progress-screen";

const progress = {
  activeExpedition: null,
  attemptedCount: 0,
  confirmedItems: 0,
  dueCount: 0,
  lessons: [
    {
      attemptedCount: 0,
      confirmedItems: 0,
      dueCount: 0,
      exerciseCount: 6,
      key: "u01-l1a",
      lessonTitle: "Premiers repères",
      masteryPermille: 0,
      mode: "audio",
      nextReviewAt: null,
      reviewedItems: 0,
      successfulAttempts: 0,
    },
  ],
  masteryPermille: 0,
  reviewedItems: 0,
  successfulAttempts: 0,
} as const;

function onboarded() {
  return {
    onboarding: { status: "completed" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.auth = {
    session: null,
    sessionBoundaryRevision: 0,
    status: "signed_out",
  };
  testState.read.mockResolvedValue(onboarded());
  testState.localProgress.mockResolvedValue({ entries: [] });
  testState.project.mockReturnValue(progress);
});

afterEach(() => cleanup());

describe("écran Progrès mobile", () => {
  it("affiche honnêtement l’état vide et propose Pratiquer", async () => {
    render(<ProgressScreen />);

    expect(
      await screen.findByRole("heading", {
        name: "Voir ce qui s'installe, séance après séance.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Aucun repère à afficher")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Aller pratiquer" }));
    await waitFor(() =>
      expect(testState.push).toHaveBeenCalledWith("/practice"),
    );
    const projectInput = testState.project.mock.calls[0]?.[0];
    expect(projectInput).toBeTruthy();
    if (typeof projectInput !== "object" || projectInput === null) {
      throw new Error("La projection n’a pas reçu d’entrée.");
    }
    expect("now" in projectInput).toBe(true);
    if ("now" in projectInput) expect(typeof projectInput.now).toBe("string");
  });

  it("affiche le snapshot synchronisé d’un compte connecté", async () => {
    testState.auth = {
      session: {
        user: {
          id: "00000000-0000-4000-8000-000000000001",
        },
      },
      sessionBoundaryRevision: 1,
      status: "signed_in",
    };
    testState.localProgress
      .mockResolvedValueOnce({ entries: [] })
      .mockResolvedValueOnce({ entries: [], authoritativeStates: [] });

    render(<ProgressScreen />);

    expect(await screen.findByText("MAÎTRISE SYNCHRONISÉE")).toBeTruthy();
    expect(testState.refresh).toHaveBeenCalledWith({
      database: testState.database,
      userId: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("reprend une expédition mécanique depuis la carte de progression", async () => {
    testState.project.mockReturnValue({
      ...progress,
      activeExpedition: {
        completedCount: 1,
        key: "u01-l1e",
        mode: "mixed",
        totalCount: 2,
      },
      attemptedCount: 1,
    });

    render(<ProgressScreen />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Reprendre la séance" }),
    );
    expect(testState.push).toHaveBeenCalledWith(
      "/mobile-lesson-expedition?lessonId=u01-l1e",
    );
  });
});
