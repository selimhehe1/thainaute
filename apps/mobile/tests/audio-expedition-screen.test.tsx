// @vitest-environment jsdom

import {
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { readEmbeddedUnite01LessonBundle } from "@thainaute/content/mobile";
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
  announce: vi.fn(),
  abandonLesson: vi.fn(),
  confirm: vi.fn(),
  clearCompleted: vi.fn(),
  database: {},
  enqueue: vi.fn(),
  finish: vi.fn(),
  getDeviceId: vi.fn(),
  openQuestion: vi.fn(),
  prepare: vi.fn(),
  playerPause: vi.fn(),
  randomUUID: vi.fn(),
  readDemoOutbox: vi.fn(),
  readExperience: vi.fn(),
  readOutbox: vi.fn(),
  recordResult: vi.fn(),
  selectExpeditionOption: vi.fn(),
  selectOption: vi.fn(),
  startExpedition: vi.fn(),
  startLesson: vi.fn(),
}));

const testRouter = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("expo-router", async () => {
  return {
    useLocalSearchParams: () => ({}),
    useRouter: () => testRouter,
  };
});
vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("expo-crypto", () => ({ randomUUID: testState.randomUUID }));
vi.mock("expo-audio", () => ({
  useAudioPlayer: () => ({
    pause: testState.playerPause,
    play: vi.fn(),
    replace: vi.fn(),
  }),
}));
vi.mock("../lib/analytics-provider", () => ({
  useMobileAnalytics: () => ({ analytics: { capture: vi.fn() } }),
}));
vi.mock("../lib/embedded-audio-expedition-config", () => ({
  getMobileUnit01AudioExpeditionConfig: vi.fn(),
}));
vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStore: class {
    read: typeof testState.readOutbox;
    enqueue = testState.enqueue;
    getOrCreateDeviceId = testState.getDeviceId;

    constructor(_database: unknown, _owner?: unknown, namespace?: string) {
      this.read =
        namespace === "demo" ? testState.readDemoOutbox : testState.readOutbox;
    }
  },
}));
vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    clearCompletedExpedition = testState.clearCompleted;
    read = testState.readExperience;
    startExpedition = testState.startExpedition;
    selectExpeditionOption = testState.selectExpeditionOption;
    startLesson = testState.startLesson;
    openLessonQuestion = testState.openQuestion;
    selectLessonOption = testState.selectOption;
    prepareLessonSubmission = testState.prepare;
    confirmLessonResult = testState.confirm;
    finishLesson = testState.finish;
    abandonLessonForVersionChange = testState.abandonLesson;
    recordExpeditionResult = testState.recordResult;
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
    accessibilityState?: { checked?: boolean; disabled?: boolean };
    children?: ReactNode;
    disabled?: boolean;
    onPress?: () => void;
  };
  const container = ({ children }: NativeProps) =>
    React.createElement("div", null, children);
  const Text = React.forwardRef<HTMLElement, NativeProps>(
    ({ accessibilityRole, children }, ref) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "p",
        { ref, role: accessibilityRole === "alert" ? "alert" : undefined },
        children,
      ),
  );
  Text.displayName = "MockText";
  return {
    AccessibilityInfo: { announceForAccessibility: testState.announce },
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
          "aria-checked": accessibilityState?.checked,
          "aria-label": accessibilityLabel,
          disabled,
          onClick: onPress,
          role: accessibilityRole === "radio" ? "radio" : undefined,
        },
        children,
      ),
    ScrollView: container,
    StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
    Text,
    View: container,
  };
});

// Les doubles natifs doivent être installés avant de résoudre l’écran.
// eslint-disable-next-line import/first
import { AudioExpeditionExperience } from "../internal/audio-expedition-screen";
// eslint-disable-next-line import/first
import type { AudioExpeditionConfig } from "../lib/embedded-audio-expedition-config";

const bundle = readEmbeddedUnite01LessonBundle("u01-l1a");
const exercises = bundle.lesson.exercises.filter(
  (exercise): exercise is Extract<typeof exercise, { type: "audio_choice" }> =>
    exercise.type === "audio_choice",
);
const config: AudioExpeditionConfig = {
  bannerText: "test",
  bannerTitle: "test",
  completionPrivacy: "test",
  exercises: exercises.map((exercise) => ({
    exercise,
    item: bundle.lesson.items.find(({ id }) => id === exercise.itemId)!,
    modelAudioSource: 1,
  })),
  headerStep: "test",
  introEyebrow: "test",
  key: "u01-l1a",
  lesson: bundle.lesson,
  outboxNamespace: "learning",
};

const deviceId = "40000000-0000-4000-8000-000000000001";
const sessionStartedAt = "2026-08-02T08:00:00.000Z";

function experience(
  expedition: LocalExperienceSnapshot["expedition"],
  lesson: LocalExperienceSnapshot["lesson"] = null,
): LocalExperienceSnapshot {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "completed",
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_a",
      experienceOptionId: "prototype_experience_new",
      startedAt: sessionStartedAt,
      completedAt: sessionStartedAt,
    },
    lesson,
    expedition,
  };
}

function activeExpedition() {
  return {
    lessonVersionId: config.lesson.versionId,
    exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
    results: [],
    startedAt: sessionStartedAt,
    updatedAt: sessionStartedAt,
  };
}

function questionLesson(
  exerciseId: string,
  selectedOptionId: string | null,
): NonNullable<LocalExperienceSnapshot["lesson"]> {
  return {
    phase: "question",
    lessonVersionId: config.lesson.versionId,
    exerciseId,
    selectedOptionId,
    draftAnswer: null,
    missedOnce: false,
    sessionStartedAt,
    updatedAt: sessionStartedAt,
  };
}

function setupFlow() {
  let currentExperience = experience(null);
  let outbox: AttemptOutboxSnapshot = createAttemptOutboxSnapshot();
  testState.readExperience.mockResolvedValue(currentExperience);
  testState.readOutbox.mockResolvedValue(outbox);
  testState.readDemoOutbox.mockResolvedValue(createAttemptOutboxSnapshot());
  testState.randomUUID.mockReturnValue("30000000-0000-4000-8000-000000000001");
  testState.getDeviceId.mockResolvedValue(deviceId);
  testState.startExpedition.mockImplementation(async () => {
    currentExperience = experience(activeExpedition());
    return currentExperience;
  });
  testState.startLesson.mockImplementation(async () => {
    currentExperience = experience(activeExpedition(), {
      phase: "intro",
      lessonVersionId: config.lesson.versionId,
      exerciseId: config.exercises[0]!.exercise.id,
      sessionStartedAt,
      updatedAt: sessionStartedAt,
    });
    return currentExperience;
  });
  testState.selectExpeditionOption.mockImplementation(
    async ({ selectedOptionId }: { readonly selectedOptionId: string }) => {
      currentExperience = experience(
        activeExpedition(),
        questionLesson(config.exercises[0]!.exercise.id, selectedOptionId),
      );
      return currentExperience;
    },
  );
  testState.openQuestion.mockImplementation(async () => {
    currentExperience = experience(
      activeExpedition(),
      questionLesson(config.exercises[0]!.exercise.id, null),
    );
    return currentExperience;
  });
  testState.selectOption.mockImplementation(async (optionId: string) => {
    currentExperience = experience(
      activeExpedition(),
      questionLesson(config.exercises[0]!.exercise.id, optionId),
    );
    return currentExperience;
  });
  testState.prepare.mockImplementation(
    async (submission: ValidatedAttemptSubmission) => {
      currentExperience = experience(activeExpedition(), {
        phase: "submitting",
        lessonVersionId: config.lesson.versionId,
        exerciseId: submission.exerciseId,
        sessionStartedAt,
        submission,
        updatedAt: submission.answeredAt,
      });
      return currentExperience;
    },
  );
  testState.enqueue.mockImplementation(
    async (submission: ValidatedAttemptSubmission) => {
      outbox = enqueueAttempt(outbox, submission);
      return outbox;
    },
  );
  testState.confirm.mockImplementation(async () => {
    const checkpoint = currentExperience.lesson;
    if (checkpoint === null || checkpoint.phase !== "submitting") {
      throw new Error("missing submitting");
    }
    currentExperience = experience(activeExpedition(), {
      ...checkpoint,
      phase: "result",
      updatedAt: checkpoint.submission.answeredAt,
    });
    return currentExperience;
  });
  testState.finish.mockImplementation(async () => {
    const checkpoint = currentExperience.lesson;
    if (checkpoint === null) {
      throw new Error("missing result");
    }
    if (checkpoint.phase === "completed") return currentExperience;
    if (checkpoint.phase !== "result") throw new Error("missing result");
    currentExperience = experience(activeExpedition(), {
      ...checkpoint,
      phase: "completed",
      completedAt: checkpoint.submission.answeredAt,
      updatedAt: checkpoint.submission.answeredAt,
    });
    return currentExperience;
  });
  testState.abandonLesson.mockImplementation(async () => {
    currentExperience = experience(null);
    return currentExperience;
  });
  testState.clearCompleted.mockImplementation(async () => {
    currentExperience = experience(null);
    return currentExperience;
  });
  testState.recordResult.mockImplementation(
    async ({ exerciseId, rating, answeredAt }) => {
      currentExperience = experience({
        ...activeExpedition(),
        results: [{ exerciseId, rating, answeredAt }],
        updatedAt: answeredAt,
      });
      return currentExperience;
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setupFlow();
});

afterEach(() => cleanup());

describe("expédition audio mobile", () => {
  it("persiste chaque étape puis ouvre l'exercice suivant", async () => {
    render(
      <AudioExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    await waitFor(() =>
      expect(testState.readExperience).toHaveBeenCalledOnce(),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Commencer l'expédition" }),
    );
    await waitFor(() =>
      expect(testState.startExpedition).toHaveBeenCalledOnce(),
    );
    expect(await screen.findByText(/1\/6/)).toBeTruthy();

    const first = config.exercises[0]!;
    fireEvent.click(
      await screen.findByRole("radio", {
        name: first.exercise.options[0]!.labelFr ?? "",
      }),
    );
    await waitFor(() =>
      expect(testState.selectExpeditionOption).toHaveBeenCalledOnce(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));

    expect(
      await screen.findByText(first.exercise.feedback.correctFr),
    ).toBeTruthy();
    expect(testState.prepare).toHaveBeenCalledOnce();
    expect(testState.enqueue).toHaveBeenCalledOnce();
    expect(testState.confirm).toHaveBeenCalledOnce();
    expect(testState.finish).toHaveBeenCalledOnce();
    expect(testState.recordResult).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(await screen.findByText(/2\/6/)).toBeTruthy();
  });

  it("reprend une question et son choix durable sans recréer l'expédition", async () => {
    const first = config.exercises[0]!;
    const resumed = experience(
      {
        ...activeExpedition(),
        results: [],
      },
      questionLesson(first.exercise.id, first.exercise.options[1]!.id),
    );
    testState.readExperience.mockResolvedValue(resumed);

    render(
      <AudioExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    const option = await screen.findByRole("radio", {
      name: first.exercise.options[1]!.labelFr ?? "",
    });
    expect(
      (
        option as { getAttribute: (name: string) => string | null }
      ).getAttribute("aria-checked"),
    ).toBe("true");
    expect(testState.startExpedition).not.toHaveBeenCalled();
    expect(testState.startLesson).not.toHaveBeenCalled();
  });

  it("récupère le journal démo pour remplacer un ancien checkpoint technique", async () => {
    const legacyLessonVersionId = "10000000-0000-4000-8000-000000000002";
    const legacyExerciseId = "10000000-0000-4000-8000-000000000004";
    const legacySubmission: ValidatedAttemptSubmission = {
      algorithmVersion: "srs-v0",
      answeredAt: "2026-08-02T08:00:01.000Z",
      contentVersionId: legacyLessonVersionId,
      deviceId,
      durationMs: 1000,
      eventId: "30000000-0000-4000-8000-000000000002",
      exerciseId: legacyExerciseId,
      selectedOptionId: "20000000-0000-4000-8000-000000000001",
    };
    const legacyLesson: NonNullable<LocalExperienceSnapshot["lesson"]> = {
      completedAt: "2026-08-02T08:00:02.000Z",
      exerciseId: legacyExerciseId,
      lessonVersionId: legacyLessonVersionId,
      phase: "completed",
      sessionStartedAt,
      submission: legacySubmission,
      updatedAt: "2026-08-02T08:00:02.000Z",
    };
    const legacyExperience = experience(null, legacyLesson);
    const demoOutbox = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      legacySubmission,
    );
    testState.readExperience.mockResolvedValue(legacyExperience);
    testState.readDemoOutbox.mockResolvedValue(demoOutbox);
    testState.finish.mockResolvedValue(legacyExperience);
    testState.abandonLesson.mockResolvedValue(experience(null));

    render(
      <AudioExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Commencer l'expédition" }),
    ).toBeTruthy();
    expect(testState.readDemoOutbox).toHaveBeenCalledOnce();
    expect(testState.finish).toHaveBeenCalledWith(
      demoOutbox,
      expect.any(String),
    );
    expect(testState.abandonLesson).toHaveBeenCalledWith(
      legacyLesson,
      config.lesson.versionId,
      config.exercises[0]!.exercise.id,
      demoOutbox,
    );
  });

  it("revient à l'unité après avoir purgé le récapitulatif local", async () => {
    const completedAt = "2026-08-02T08:01:00.000Z";
    const completedExpedition = {
      ...activeExpedition(),
      results: config.exercises.map(({ exercise }) => ({
        answeredAt: completedAt,
        exerciseId: exercise.id,
        rating: 1 as const,
      })),
      updatedAt: completedAt,
    };
    testState.readExperience.mockResolvedValue(experience(completedExpedition));

    render(
      <AudioExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Retour à l'unité 1" }),
    );

    await waitFor(() =>
      expect(testState.clearCompleted).toHaveBeenCalledOnce(),
    );
    expect(testRouter.push).toHaveBeenCalledWith("/unit-01");
  });

  it("laisse useAudioPlayer g\u00e9rer la lib\u00e9ration au d\u00e9montage", async () => {
    render(
      <AudioExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    await waitFor(() =>
      expect(testState.readExperience).toHaveBeenCalledOnce(),
    );
    cleanup();

    expect(testState.playerPause).not.toHaveBeenCalled();
  });
});
