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
  database: {},
  focusEffect: null as (() => void | (() => void)) | null,
  push: vi.fn(),
  read: vi.fn(),
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    useFocusEffect: (effect: () => void | (() => void)) =>
      React.useEffect(() => {
        testState.focusEffect = effect;
        return effect();
      }, [effect]),
    useRouter: () => ({ push: testState.push }),
  };
});
vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.read;
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
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: { selected?: boolean };
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
import PracticeScreen from "../internal/practice-screen";

function onboarded() {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "completed",
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
      startedAt: "2026-08-02T08:00:00.000Z",
      completedAt: "2026-08-02T08:00:00.000Z",
    },
    lesson: null,
    expedition: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.read.mockResolvedValue(onboarded());
});

afterEach(() => cleanup());

describe("écran Pratiquer mobile", () => {
  it("expose les aperçus vérifiés et bloque les leçons incomplètes", async () => {
    render(<PracticeScreen />);

    expect(
      await screen.findByRole("heading", {
        name: "Entraîner l'oreille, sans pression.",
      }),
    ).toBeTruthy();
    expect(screen.getByTestId("practice-lesson-u01-l1a")).toBeTruthy();
    expect(screen.getByTestId("practice-lesson-u01-l1b")).toBeTruthy();
    // Cinq, et non six : `u01-l1e` reste un brouillon, et une build
    // distribuable ne montre que ce que la signature couvre.
    expect(screen.getAllByText("DISPONIBLE")).toHaveLength(5);
    expect(screen.queryAllByText("EN PRÉPARATION")).toHaveLength(0);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Ouvrir l'aperçu" })[0]!,
    );
    expect(testState.push).toHaveBeenCalledWith(
      "/mobile-lesson-expedition?lessonId=u01-l1a",
    );
  });

  it("relie la navigation principale aux deux nouvelles surfaces", async () => {
    render(<PracticeScreen />);
    await screen.findByRole("heading", {
      name: "Entraîner l'oreille, sans pression.",
    });

    fireEvent.click(screen.getByRole("tab", { name: "Progrès" }));
    await waitFor(() =>
      expect(testState.push).toHaveBeenCalledWith("/progress"),
    );
  });
});
