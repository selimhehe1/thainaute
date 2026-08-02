// @vitest-environment jsdom

import { fixtureLesson } from "@thainaute/content/fixture";
import {
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  createLocalExperienceSnapshot,
  enqueueAttempt,
  finishLocalLesson,
  startLocalLesson,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import {
  act,
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
  findNodeHandle: vi.fn((_node: unknown): number | null => null),
  focusCleanup: null as (() => void) | null,
  focusEffect: null as (() => void | (() => void)) | null,
  push: vi.fn(),
  read: vi.fn(),
  setAccessibilityFocus: vi.fn((_node: number) => undefined),
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    useFocusEffect: (effect: () => void | (() => void)) =>
      React.useEffect(() => {
        testState.focusEffect = effect;
        const cleanupEffect = effect();
        testState.focusCleanup = cleanupEffect ?? null;
        return () => {
          testState.focusCleanup?.();
          testState.focusCleanup = null;
        };
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
    accessibilityLiveRegion?: string;
    accessibilityRole?: string;
    accessibilityValue?: {
      max?: number;
      min?: number;
      now?: number;
      text?: string;
    };
    children?: ReactNode;
    onPress?: () => void;
    style?: {
      flexShrink?: number;
      flexWrap?: string;
      minHeight?: number;
      paddingVertical?: number;
    };
    testID?: string;
  };
  const container = ({
    accessibilityLabel,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityValue,
    children,
    style,
    testID,
  }: NativeProps) =>
    React.createElement(
      "div",
      {
        "aria-label": accessibilityLabel,
        "aria-live": accessibilityLiveRegion,
        "aria-valuemax": accessibilityValue?.max,
        "aria-valuemin": accessibilityValue?.min,
        "aria-valuenow": accessibilityValue?.now,
        "aria-valuetext": accessibilityValue?.text,
        "data-flex-shrink": style?.flexShrink,
        "data-flex-wrap": style?.flexWrap,
        "data-padding-vertical": style?.paddingVertical,
        "data-testid": testID,
        role: accessibilityRole,
      },
      children,
    );
  const Text = React.forwardRef<HTMLElement, NativeProps>(
    ({ accessibilityRole, children }, ref) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "p",
        { ref },
        children,
      ),
  );
  Text.displayName = "MockText";
  return {
    AccessibilityInfo: {
      setAccessibilityFocus: testState.setAccessibilityFocus,
    },
    ActivityIndicator: () => React.createElement("span", null, "chargement"),
    Pressable: ({ accessibilityRole, children, onPress, style }: NativeProps) =>
      React.createElement(
        "button",
        {
          "data-min-height": style?.minHeight,
          onClick: onPress,
          role: accessibilityRole === "button" ? undefined : accessibilityRole,
        },
        children,
      ),
    findNodeHandle: testState.findNodeHandle,
    ScrollView: container,
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      hairlineWidth: 1,
    },
    Text,
    View: container,
  };
});

// Les doubles natifs doivent être installés avant de résoudre l’écran.
// eslint-disable-next-line import/first
import LearningPathScreen from "../app/path";

const LESSON_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const OPTION_ID = "20000000-0000-4000-8000-000000000001";
const EVENT_ID = "30000000-0000-4000-8000-000000000001";
const DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const STARTED_AT = "2026-08-02T08:00:00.000Z";
const ANSWERED_AT = "2026-08-02T08:01:00.000Z";

const target = {
  lessonVersionId: LESSON_ID,
  exerciseId: EXERCISE_ID,
} as const;

function attributeValue(element: unknown, name: string): string | null {
  return (
    element as {
      readonly getAttribute: (attributeName: string) => string | null;
    }
  ).getAttribute(name);
}

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
    },
    STARTED_AT,
  );
}

function intro(): LocalExperienceSnapshot {
  return startLocalLesson(onboarded(), {
    ...target,
    startedAt: STARTED_AT,
  });
}

function submission(): ValidatedAttemptSubmission {
  return {
    eventId: EVENT_ID,
    deviceId: DEVICE_ID,
    exerciseId: EXERCISE_ID,
    selectedOptionId: OPTION_ID,
    answeredAt: ANSWERED_AT,
    durationMs: 1_000,
    contentVersionId: LESSON_ID,
    algorithmVersion: "srs-v0",
  };
}

function result(): LocalExperienceSnapshot {
  const attempt = submission();
  return confirmLocalLessonResult(
    {
      ...intro(),
      lesson: {
        phase: "submitting",
        ...target,
        submission: attempt,
        sessionStartedAt: STARTED_AT,
        updatedAt: ANSWERED_AT,
      },
    },
    enqueueAttempt(createAttemptOutboxSnapshot(), attempt),
    "2026-08-02T08:01:01.000Z",
  );
}

function completed(): LocalExperienceSnapshot {
  const snapshot = result();
  return finishLocalLesson(
    snapshot,
    enqueueAttempt(createAttemptOutboxSnapshot(), submission()),
    "2026-08-02T08:01:02.000Z",
  );
}

function mismatched(): LocalExperienceSnapshot {
  return startLocalLesson(onboarded(), {
    lessonVersionId: "50000000-0000-4000-8000-000000000002",
    exerciseId: EXERCISE_ID,
    startedAt: STARTED_AT,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.focusCleanup = null;
  testState.focusEffect = null;
  testState.findNodeHandle.mockImplementation((node: unknown) => {
    const text = (node as { readonly textContent?: string } | null)
      ?.textContent;
    if (text === "Parcours local indisponible") return 11;
    if (text === "Votre première unité technique") return 22;
    return null;
  });
  testState.read.mockResolvedValue(onboarded());
});

afterEach(() => cleanup());

describe("écran Parcours mobile", () => {
  it.each([
    {
      action: "Configurer depuis Aujourd’hui",
      expectedRoute: "/",
      label: "Onboarding requis",
      progress: "0",
      snapshot: createLocalExperienceSnapshot(),
    },
    {
      action: "Commencer depuis Aujourd’hui",
      expectedRoute: "/",
      label: "Disponible",
      progress: "0",
      snapshot: onboarded(),
    },
    {
      action: "Reprendre la leçon",
      expectedRoute: "/lesson",
      label: "En cours",
      progress: "0",
      snapshot: intro(),
    },
    {
      action: "Voir le résultat",
      expectedRoute: "/lesson",
      label: "Résultat prêt",
      progress: "0",
      snapshot: result(),
    },
    {
      action: "Revoir la leçon",
      expectedRoute: "/lesson",
      label: "Terminée",
      progress: "1",
      snapshot: completed(),
    },
    {
      action: "Vérifier depuis Aujourd’hui",
      expectedRoute: "/",
      label: "Version à vérifier",
      progress: "0",
      snapshot: mismatched(),
    },
  ])(
    "projette $label et route son action contextuelle",
    async ({ action, expectedRoute, label, progress, snapshot }) => {
      testState.read.mockResolvedValue(snapshot);
      render(<LearningPathScreen />);

      const primaryAction = await screen.findByRole("button", {
        name: action,
      });
      expect(screen.getByText("DONNÉE FICTIVE / NON PUBLIABLE")).toBeTruthy();
      expect(
        screen.getByText("UNITÉ TECHNIQUE · PROTOTYPE LOCAL"),
      ).toBeTruthy();
      expect(screen.getByText(fixtureLesson.titleFr)).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText("UNITÉS FUTURES · BLOQUÉES")).toBeTruthy();
      expect(screen.getByText(/contenus linguistiques audités/u)).toBeTruthy();
      const progressbar = screen.getByRole("progressbar");
      expect(attributeValue(progressbar, "aria-valuenow")).toBe(progress);
      expect(attributeValue(progressbar, "aria-valuemax")).toBe("1");
      expect(attributeValue(progressbar, "aria-label")).toBe(
        "Progression de l’unité technique",
      );
      expect(attributeValue(progressbar, "aria-valuetext")).toBe(
        `${progress} étape technique terminée sur 1`,
      );

      fireEvent.click(primaryAction);

      expect(testState.push).toHaveBeenCalledWith(expectedRoute);
    },
  );

  it("garde le checkpoint intact après une erreur puis permet de relire", async () => {
    testState.read
      .mockRejectedValueOnce(new Error("lecture impossible"))
      .mockResolvedValueOnce(onboarded());
    render(<LearningPathScreen />);

    expect(
      await screen.findByRole("heading", {
        name: "Parcours local indisponible",
      }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(testState.setAccessibilityFocus).toHaveBeenCalledWith(11),
    );
    expect(screen.getByText(/Rien n’a été effacé/u)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(
      await screen.findByRole("button", {
        name: "Commencer depuis Aujourd’hui",
      }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(testState.setAccessibilityFocus).toHaveBeenCalledWith(22),
    );
    expect(testState.read).toHaveBeenCalledTimes(2);
  });

  it("invalide toute réponse ancienne dès l’action Réessayer", async () => {
    let resolveOldRead!: (snapshot: LocalExperienceSnapshot) => void;
    let resolveRetryRead!: (snapshot: LocalExperienceSnapshot) => void;
    const oldRead = new Promise<LocalExperienceSnapshot>((resolve) => {
      resolveOldRead = resolve;
    });
    const retryRead = new Promise<LocalExperienceSnapshot>((resolve) => {
      resolveRetryRead = resolve;
    });
    testState.read
      .mockReturnValueOnce(oldRead)
      .mockRejectedValueOnce(new Error("refocus impossible"))
      .mockReturnValueOnce(retryRead);
    render(<LearningPathScreen />);
    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());

    await act(async () => {
      const cleanupEffect = testState.focusEffect?.();
      testState.focusCleanup = cleanupEffect ?? null;
      await Promise.resolve();
    });
    await screen.findByRole("heading", {
      name: "Parcours local indisponible",
    });

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(testState.read).toHaveBeenCalledTimes(3));
    await act(async () => {
      resolveOldRead(onboarded());
      await oldRead;
    });

    expect(screen.getByText("Lecture du parcours local…")).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "Commencer depuis Aujourd’hui",
      }),
    ).toBeNull();

    await act(async () => {
      resolveRetryRead(completed());
      await retryRead;
    });
    expect(
      await screen.findByRole("button", { name: "Revoir la leçon" }),
    ).toBeTruthy();
  });

  it("ignore une ancienne lecture quand un refocus plus récent aboutit", async () => {
    let resolveFirst!: (snapshot: LocalExperienceSnapshot) => void;
    const firstRead = new Promise<LocalExperienceSnapshot>((resolve) => {
      resolveFirst = resolve;
    });
    testState.read
      .mockReturnValueOnce(firstRead)
      .mockResolvedValueOnce(completed());
    render(<LearningPathScreen />);
    await waitFor(() => expect(testState.read).toHaveBeenCalledOnce());

    await act(async () => {
      testState.focusCleanup?.();
      const cleanupEffect = testState.focusEffect?.();
      testState.focusCleanup = cleanupEffect ?? null;
    });

    expect(
      await screen.findByRole("button", { name: "Revoir la leçon" }),
    ).toBeTruthy();

    await act(async () => {
      resolveFirst(onboarded());
      await firstRead;
    });

    expect(
      screen.getByRole("button", { name: "Revoir la leçon" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "Commencer depuis Aujourd’hui",
      }),
    ).toBeNull();
  });

  it("propose aussi un retour Aujourd’hui sur une cible de 44 points", async () => {
    render(<LearningPathScreen />);

    const todayButton = await screen.findByRole("button", {
      name: "Aujourd’hui",
    });
    const header = screen.getByTestId("path-header");
    const actions = screen.getByTestId("path-header-actions");
    expect(attributeValue(header, "data-flex-wrap")).toBe("wrap");
    expect(attributeValue(header, "data-padding-vertical")).toBe("8");
    expect(attributeValue(actions, "data-flex-wrap")).toBe("wrap");
    expect(attributeValue(actions, "data-flex-shrink")).toBe("1");
    expect(attributeValue(todayButton, "data-min-height")).toBe("44");

    fireEvent.click(todayButton);

    expect(testState.push).toHaveBeenCalledWith("/");
  });
});
