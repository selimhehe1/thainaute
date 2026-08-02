// @vitest-environment jsdom

import { createAttemptOutboxSnapshot, enqueueAttempt } from "@thainaute/sync";
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
  confirm: vi.fn(),
  database: {},
  enqueue: vi.fn(),
  focusCleanup: null as (() => void) | null,
  focusEffect: null as (() => void | (() => void)) | null,
  migrate: vi.fn(),
  migrateFixture: vi.fn(),
  push: vi.fn(),
  read: vi.fn(),
  replace: vi.fn(),
  replaceVersion: vi.fn(),
  startLesson: vi.fn(),
}));
const testRouter = vi.hoisted(() => ({
  push: testState.push,
  replace: testState.replace,
}));

vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    Link: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
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
    useRouter: () => testRouter,
  };
});

vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));

vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.read;
    startLesson = testState.startLesson;
    replaceLessonVersion = testState.replaceVersion;
    confirmLessonResult = testState.confirm;
  },
}));

vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStore: class {
    migrateLegacyFixtureAttemptsToDemo = testState.migrateFixture;
    migrateLegacyJournal = testState.migrate;
    enqueue = testState.enqueue;
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
    accessibilityState?: { busy?: boolean; disabled?: boolean };
    children?: ReactNode;
    disabled?: boolean;
    onPress?: () => void;
    style?: {
      flexShrink?: number;
      flexWrap?: string;
      minHeight?: number;
      paddingVertical?: number;
    };
    testID?: string;
  };
  const container = ({ children, style, testID }: NativeProps) =>
    React.createElement(
      "div",
      {
        "data-flex-shrink": style?.flexShrink,
        "data-flex-wrap": style?.flexWrap,
        "data-padding-vertical": style?.paddingVertical,
        "data-testid": testID,
      },
      children,
    );
  return {
    ActivityIndicator: () => React.createElement("span", null, "chargement"),
    Pressable: ({
      accessibilityRole,
      accessibilityState,
      children,
      disabled,
      onPress,
      style,
    }: NativeProps) =>
      React.createElement(
        "button",
        {
          "aria-busy": accessibilityState?.busy,
          "aria-disabled": accessibilityState?.disabled,
          "data-min-height": style?.minHeight,
          disabled,
          onClick: onPress,
          role: accessibilityRole === "button" ? undefined : accessibilityRole,
        },
        children,
      ),
    ScrollView: container,
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      hairlineWidth: 1,
    },
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
import TodayScreen from "../app/index";

const startedAt = "2026-08-02T08:00:00.000Z";

function attributeValue(element: unknown, name: string): string | null {
  return (
    element as {
      readonly getAttribute: (attributeName: string) => string | null;
    }
  ).getAttribute(name);
}

function experience(lesson: Record<string, unknown> | null = null) {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "completed",
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
      startedAt,
      completedAt: startedAt,
    },
    lesson,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.focusCleanup = null;
  testState.focusEffect = null;
  testState.read.mockResolvedValue(experience());
  testState.migrateFixture.mockResolvedValue(createAttemptOutboxSnapshot());
  testState.migrate.mockResolvedValue(createAttemptOutboxSnapshot());
  testState.startLesson.mockResolvedValue(
    experience({
      phase: "intro",
      lessonVersionId: "10000000-0000-4000-8000-000000000002",
      exerciseId: "10000000-0000-4000-8000-000000000004",
      sessionStartedAt: startedAt,
      updatedAt: startedAt,
    }),
  );
  testState.enqueue.mockImplementation(async (submission) =>
    enqueueAttempt(createAttemptOutboxSnapshot(), submission),
  );
  testState.replaceVersion.mockResolvedValue(
    experience({
      phase: "intro",
      lessonVersionId: "10000000-0000-4000-8000-000000000002",
      exerciseId: "10000000-0000-4000-8000-000000000004",
      sessionStartedAt: startedAt,
      updatedAt: startedAt,
    }),
  );
});

afterEach(() => cleanup());

describe("écran Aujourd’hui mobile", () => {
  it("ouvre Parcours depuis une cible d’en-tête de 44 points", async () => {
    render(<TodayScreen />);

    await screen.findByRole("heading", {
      name: "Une petite écoute, à votre rythme.",
    });
    const pathButton = screen.getByRole("button", { name: "Parcours" });
    const header = screen.getByTestId("today-header");
    const actions = screen.getByTestId("today-header-actions");
    expect(attributeValue(header, "data-flex-wrap")).toBe("wrap");
    expect(attributeValue(header, "data-padding-vertical")).toBe("8");
    expect(attributeValue(actions, "data-flex-wrap")).toBe("wrap");
    expect(attributeValue(actions, "data-flex-shrink")).toBe("1");
    expect(attributeValue(pathButton, "data-min-height")).toBe("44");

    fireEvent.click(pathButton);

    expect(testState.push).toHaveBeenCalledWith("/path");
  });

  it("annonce honnêtement la fixture locale et persiste avant navigation", async () => {
    render(<TodayScreen />);

    expect(
      await screen.findByRole("heading", {
        name: "Une petite écoute, à votre rythme.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Disponible hors connexion")).toBeTruthy();
    expect(screen.getByText(/Objectif choisi : 5 minutes/iu)).toBeTruthy();
    expect(testState.migrateFixture.mock.invocationCallOrder[0]).toBeLessThan(
      testState.migrate.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Commencer la démo locale" }),
    );
    await waitFor(() => expect(testState.startLesson).toHaveBeenCalledOnce());
    expect(testState.push).toHaveBeenCalledWith("/lesson");
    expect(testState.startLesson.mock.invocationCallOrder[0]).toBeLessThan(
      testState.push.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it("reprend une question sans écraser son checkpoint", async () => {
    testState.read.mockResolvedValue(
      experience({
        phase: "question",
        lessonVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        selectedOptionId: "20000000-0000-4000-8000-000000000002",
        sessionStartedAt: startedAt,
        updatedAt: startedAt,
      }),
    );
    render(<TodayScreen />);

    const resume = await screen.findByRole("button", {
      name: "Reprendre l’exercice",
    });
    fireEvent.click(resume);
    await waitFor(() => expect(testState.push).toHaveBeenCalledWith("/lesson"));
    expect(testState.startLesson).not.toHaveBeenCalled();
  });

  it("redirige un premier lancement vers l’onboarding", async () => {
    testState.read.mockResolvedValue({
      schemaVersion: 1,
      owner: { kind: "anonymous" },
      onboarding: { status: "not_started" },
      lesson: null,
    });
    render(<TodayScreen />);

    await waitFor(() =>
      expect(testState.replace).toHaveBeenCalledWith("/onboarding"),
    );
    expect(screen.getByText("Ouverture de l’onboarding…")).toBeTruthy();
  });

  it("finalise la tentative exacte réservée avant d’afficher la reprise", async () => {
    const exact = {
      eventId: "30000000-0000-4000-8000-000000000001",
      deviceId: "40000000-0000-4000-8000-000000000001",
      exerciseId: "10000000-0000-4000-8000-000000000004",
      selectedOptionId: "20000000-0000-4000-8000-000000000001",
      answeredAt: "2026-08-02T08:01:00.000Z",
      durationMs: 1_000,
      contentVersionId: "10000000-0000-4000-8000-000000000002",
      algorithmVersion: "srs-v0",
    } as const;
    testState.read.mockResolvedValue(
      experience({
        phase: "submitting",
        lessonVersionId: exact.contentVersionId,
        exerciseId: exact.exerciseId,
        submission: exact,
        sessionStartedAt: startedAt,
        updatedAt: exact.answeredAt,
      }),
    );
    testState.confirm.mockResolvedValue(
      experience({
        phase: "result",
        lessonVersionId: exact.contentVersionId,
        exerciseId: exact.exerciseId,
        submission: exact,
        sessionStartedAt: startedAt,
        updatedAt: exact.answeredAt,
      }),
    );
    render(<TodayScreen />);

    expect(
      await screen.findByRole("button", { name: "Voir mon résultat" }),
    ).toBeTruthy();
    expect(testState.enqueue).toHaveBeenCalledWith(exact);
    expect(testState.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: [expect.objectContaining({ submission: exact })],
      }),
      expect.any(String),
    );
    expect(testState.startLesson).not.toHaveBeenCalled();
  });

  it("récupère un ancien submitting puis exige deux confirmations", async () => {
    const exact = {
      eventId: "30000000-0000-4000-8000-000000000011",
      deviceId: "40000000-0000-4000-8000-000000000011",
      exerciseId: "10000000-0000-4000-8000-000000000014",
      selectedOptionId: "20000000-0000-4000-8000-000000000001",
      answeredAt: "2026-08-02T08:01:00.000Z",
      durationMs: 1_000,
      contentVersionId: "10000000-0000-4000-8000-000000000012",
      algorithmVersion: "srs-v0",
    } as const;
    const recoveredOutbox = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      exact,
    );
    testState.read.mockResolvedValue(
      experience({
        phase: "submitting",
        lessonVersionId: exact.contentVersionId,
        exerciseId: exact.exerciseId,
        submission: exact,
        sessionStartedAt: startedAt,
        updatedAt: exact.answeredAt,
      }),
    );
    testState.enqueue.mockResolvedValue(recoveredOutbox);
    const recovered = experience({
      phase: "result",
      lessonVersionId: exact.contentVersionId,
      exerciseId: exact.exerciseId,
      submission: exact,
      sessionStartedAt: startedAt,
      updatedAt: exact.answeredAt,
    });
    testState.confirm.mockResolvedValue(recovered);
    render(<TodayScreen />);

    const firstConfirmation = await screen.findByRole("button", {
      name: "Abandonner cette ancienne session",
    });
    expect(testState.enqueue).toHaveBeenCalledWith(exact);
    expect(testState.confirm).toHaveBeenCalledWith(
      recoveredOutbox,
      expect.any(String),
    );
    expect(testState.replaceVersion).not.toHaveBeenCalled();

    fireEvent.click(firstConfirmation);
    expect(testState.replaceVersion).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmer l’abandon et démarrer",
      }),
    );
    await waitFor(() => expect(testState.replaceVersion).toHaveBeenCalled());
    expect(testState.replaceVersion).toHaveBeenCalledWith(
      recovered.lesson,
      expect.objectContaining({
        lessonVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
      }),
      recoveredOutbox,
    );
    expect(testState.push).toHaveBeenCalledWith("/lesson");
  });

  it("ouvre un checkpoint completed sans redémarrer la leçon", async () => {
    const exact = {
      eventId: "30000000-0000-4000-8000-000000000001",
      deviceId: "40000000-0000-4000-8000-000000000001",
      exerciseId: "10000000-0000-4000-8000-000000000004",
      selectedOptionId: "20000000-0000-4000-8000-000000000001",
      answeredAt: "2026-08-02T08:01:00.000Z",
      durationMs: 1_000,
      contentVersionId: "10000000-0000-4000-8000-000000000002",
      algorithmVersion: "srs-v0",
    } as const;
    testState.migrate.mockResolvedValue(
      enqueueAttempt(createAttemptOutboxSnapshot(), exact),
    );
    testState.read.mockResolvedValue(
      experience({
        phase: "completed",
        lessonVersionId: exact.contentVersionId,
        exerciseId: exact.exerciseId,
        submission: exact,
        sessionStartedAt: startedAt,
        completedAt: "2026-08-02T08:02:00.000Z",
        updatedAt: "2026-08-02T08:02:00.000Z",
      }),
    );
    render(<TodayScreen />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Revoir la démo locale" }),
    );
    await waitFor(() => expect(testState.push).toHaveBeenCalledWith("/lesson"));
    expect(testState.startLesson).not.toHaveBeenCalled();
    expect(testState.replaceVersion).not.toHaveBeenCalled();
  });

  it("relit le checkpoint quand Aujourd’hui reprend le focus", async () => {
    render(<TodayScreen />);
    await screen.findByRole("button", { name: "Commencer la démo locale" });

    testState.read.mockResolvedValue(
      experience({
        phase: "question",
        lessonVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        selectedOptionId: "20000000-0000-4000-8000-000000000002",
        sessionStartedAt: startedAt,
        updatedAt: startedAt,
      }),
    );
    await act(async () => {
      testState.focusCleanup?.();
      const cleanupEffect = testState.focusEffect?.();
      testState.focusCleanup = cleanupEffect ?? null;
    });

    expect(
      await screen.findByRole("button", { name: "Reprendre l’exercice" }),
    ).toBeTruthy();
  });
});
