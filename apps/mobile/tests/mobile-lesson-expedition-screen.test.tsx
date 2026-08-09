// @vitest-environment jsdom

import {
  completeLocalOnboarding,
  createAttemptOutboxSnapshot,
  createLocalExperienceSnapshot,
  enqueueAttempt,
  type AttemptOutboxSnapshot,
  type LocalDraftAnswer,
  type LocalExperienceSnapshot,
  type LocalLessonCheckpoint,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import {
  readEmbeddedUnite01LessonBundle,
  type LessonExercise,
} from "@thainaute/content/mobile";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MobileLessonExpeditionConfig,
  MobileLessonExerciseConfig,
} from "../lib/mobile-lesson-expedition-config";

const testState = vi.hoisted(() => ({
  announce: vi.fn(),
  database: {},
  enqueue: vi.fn(),
  finish: vi.fn(),
  getDeviceId: vi.fn(),
  openQuestion: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  prepare: vi.fn(),
  randomUUID: vi.fn(),
  readExperience: vi.fn(),
  readOutbox: vi.fn(),
  recordResult: vi.fn(),
  replace: vi.fn(),
  saveDraft: vi.fn(),
  selectExpeditionOption: vi.fn(),
  startExpedition: vi.fn(),
  startLesson: vi.fn(),
  confirm: vi.fn(),
}));

const testRouter = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));

vi.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => testRouter,
}));
vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("expo-crypto", () => ({ randomUUID: testState.randomUUID }));
vi.mock("expo-audio", () => ({
  useAudioPlayer: () => ({
    pause: testState.pause,
    play: testState.play,
    replace: testState.replace,
  }),
}));
vi.mock("../components/content-report-panel", () => ({
  MobileContentReportPanel: () => null,
}));
vi.mock("../lib/analytics-provider", () => ({
  useMobileAnalytics: () => ({ analytics: { capture: vi.fn() } }),
}));
vi.mock("../lib/mobile-lesson-expedition-config", () => ({
  getMobileUnit01MixedExpeditionConfig: vi.fn(),
}));
vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStore: class {
    read = testState.readOutbox;
    enqueue = testState.enqueue;
    getOrCreateDeviceId = testState.getDeviceId;
  },
}));
vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.readExperience;
    startExpedition = testState.startExpedition;
    startLesson = testState.startLesson;
    openLessonQuestion = testState.openQuestion;
    saveLessonDraft = testState.saveDraft;
    selectExpeditionOption = testState.selectExpeditionOption;
    prepareLessonSubmission = testState.prepare;
    confirmLessonResult = testState.confirm;
    finishLesson = testState.finish;
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
    accessibilityState?: {
      checked?: boolean;
      disabled?: boolean;
      selected?: boolean;
    };
    children?: ReactNode;
    disabled?: boolean;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    style?: { minHeight?: number };
    value?: string;
  };
  const container = ({
    accessibilityLabel,
    accessibilityRole,
    children,
  }: NativeProps) =>
    React.createElement(
      "div",
      { "aria-label": accessibilityLabel, role: accessibilityRole },
      children,
    );
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
          "aria-selected": accessibilityState?.selected,
          disabled: disabled || accessibilityState?.disabled,
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
    TextInput: ({ accessibilityLabel, onChangeText, value }: NativeProps) =>
      React.createElement("input", {
        "aria-label": accessibilityLabel,
        onChange: (event: { target: { value: string } }) =>
          onChangeText?.(event.target.value),
        value,
      }),
    View: container,
  };
});

// Les doubles natifs doivent être installés avant de résoudre l’écran.
// eslint-disable-next-line import/first
import { MobileLessonExpeditionExperience } from "../internal/mobile-lesson-expedition-screen";

const bundle = readEmbeddedUnite01LessonBundle("u01-l1a");
type AudioExercise = Extract<LessonExercise, { type: "audio_choice" }>;
type AssociationExercise = Extract<LessonExercise, { type: "association" }>;
const audioExercise = bundle.lesson.exercises.find(
  (exercise): exercise is AudioExercise => exercise.type === "audio_choice",
);
const associationExercise = bundle.lesson.exercises.find(
  (exercise): exercise is AssociationExercise =>
    exercise.type === "association",
);
if (audioExercise === undefined || associationExercise === undefined) {
  throw new Error("Le parcours mixte de test est incomplet.");
}

function itemFor(exercise: LessonExercise) {
  const itemId =
    exercise.type === "association"
      ? exercise.pairs[0]?.itemId
      : exercise.itemId;
  const item = bundle.lesson.items.find(({ id }) => id === itemId);
  if (item === undefined) throw new Error("Item de test absent.");
  return item;
}

const config: MobileLessonExpeditionConfig = {
  bannerText: "test",
  bannerTitle: "test",
  completionPrivacy: "test",
  exercises: [
    {
      exercise: audioExercise,
      item: itemFor(audioExercise),
      modelAudioSource: 1,
    },
    { exercise: associationExercise, item: itemFor(associationExercise) },
  ] as readonly MobileLessonExerciseConfig[],
  headerStep: "test",
  introEyebrow: "test",
  key: "u01-l1a",
  lesson: bundle.lesson,
  mode: "mixed",
  outboxNamespace: "learning",
};

const sessionStartedAt = "2026-08-06T10:00:00.000Z";
const deviceId = "40000000-0000-4000-8000-000000000001";
let uuidIndex = 1;

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_a",
      experienceOptionId: "prototype_experience_new",
    },
    sessionStartedAt,
  );
}

function activeExperience(
  lesson: LocalLessonCheckpoint | null = null,
): LocalExperienceSnapshot {
  return {
    ...onboarded(),
    expedition: {
      exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
      lessonVersionId: config.lesson.versionId,
      results: [],
      startedAt: sessionStartedAt,
      updatedAt: sessionStartedAt,
    },
    lesson,
  };
}

function questionLesson(
  exerciseId: string,
  selectedOptionId: string | null = null,
  draftAnswer: LocalDraftAnswer | null = null,
): Extract<LocalLessonCheckpoint, { phase: "question" }> {
  return {
    draftAnswer,
    exerciseId,
    lessonVersionId: config.lesson.versionId,
    missedOnce: false,
    phase: "question",
    selectedOptionId,
    sessionStartedAt,
    updatedAt: sessionStartedAt,
  };
}

function setup(): void {
  let experience = onboarded();
  let outbox: AttemptOutboxSnapshot = createAttemptOutboxSnapshot();
  testState.readExperience.mockImplementation(() =>
    Promise.resolve(experience),
  );
  testState.readOutbox.mockImplementation(() => Promise.resolve(outbox));
  uuidIndex = 1;
  testState.randomUUID.mockImplementation(
    () => `30000000-0000-4000-8000-${String(uuidIndex++).padStart(12, "0")}`,
  );
  testState.getDeviceId.mockResolvedValue(deviceId);
  testState.startExpedition.mockImplementation(async () => {
    experience = activeExperience();
    return experience;
  });
  testState.startLesson.mockImplementation(
    async ({ exerciseId }: { exerciseId: string }) => {
      experience = {
        ...experience,
        lesson: {
          exerciseId,
          lessonVersionId: config.lesson.versionId,
          phase: "intro",
          sessionStartedAt,
          updatedAt: sessionStartedAt,
        },
      };
      return experience;
    },
  );
  testState.openQuestion.mockImplementation(async () => {
    const lesson = experience.lesson;
    if (lesson === null) throw new Error("lesson missing");
    experience = {
      ...experience,
      lesson: questionLesson(lesson.exerciseId),
    };
    return experience;
  });
  testState.selectExpeditionOption.mockImplementation(
    async ({
      exerciseId,
      selectedOptionId,
    }: {
      exerciseId: string;
      selectedOptionId: string;
    }) => {
      experience = {
        ...experience,
        lesson: questionLesson(exerciseId, selectedOptionId),
      };
      return experience;
    },
  );
  testState.saveDraft.mockImplementation(
    async ({
      answer,
      missedOnce,
    }: {
      answer: LocalDraftAnswer | null;
      missedOnce?: boolean;
    }) => {
      const lesson = experience.lesson;
      if (lesson === null || lesson.phase !== "question") {
        throw new Error("question checkpoint absent");
      }
      experience = {
        ...experience,
        lesson: {
          ...lesson,
          draftAnswer: answer,
          missedOnce: lesson.missedOnce || (missedOnce ?? false),
        },
      };
      return experience;
    },
  );
  testState.prepare.mockImplementation(
    async (submission: ValidatedAttemptSubmission) => {
      experience = {
        ...experience,
        lesson: {
          exerciseId: submission.exerciseId,
          lessonVersionId: config.lesson.versionId,
          phase: "submitting",
          sessionStartedAt,
          submission,
          updatedAt: submission.answeredAt,
        },
      };
      return experience;
    },
  );
  testState.enqueue.mockImplementation(
    async (submission: ValidatedAttemptSubmission) => {
      outbox = enqueueAttempt(outbox, submission);
      return outbox;
    },
  );
  testState.confirm.mockImplementation(async () => {
    const lesson = experience.lesson;
    if (lesson === null || lesson.phase !== "submitting") {
      throw new Error("submitting checkpoint absent");
    }
    experience = {
      ...experience,
      lesson: { ...lesson, phase: "result" },
    };
    return experience;
  });
  testState.finish.mockImplementation(async () => {
    const lesson = experience.lesson;
    if (lesson === null || lesson.phase !== "result") {
      throw new Error("result checkpoint absent");
    }
    experience = {
      ...experience,
      lesson: {
        ...lesson,
        completedAt: lesson.submission.answeredAt,
        phase: "completed",
      },
    };
    return experience;
  });
  testState.recordResult.mockImplementation(
    async ({
      exerciseId,
      rating,
      answeredAt,
    }: {
      exerciseId: string;
      rating: 0 | 1;
      answeredAt: string;
    }) => {
      if (experience.expedition === null) throw new Error("expedition missing");
      experience = {
        ...experience,
        expedition: {
          ...experience.expedition,
          results: [
            ...experience.expedition.results,
            { exerciseId, rating, answeredAt },
          ],
          updatedAt: answeredAt,
        },
        lesson: null,
      };
      return experience;
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setup();
});

afterEach(() => cleanup());

describe("écran de leçon mobile mixte", () => {
  it("enchaîne une écoute puis une association avec reprise locale", async () => {
    render(
      <MobileLessonExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={config}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Commencer la leçon" }),
    );
    const firstOption = audioExercise.options[0];
    if (firstOption === undefined) throw new Error("option audio absente");
    fireEvent.click(
      await screen.findByRole("radio", {
        name: firstOption.labelFr ?? firstOption.thaiRaw ?? "",
      }),
    );
    await waitFor(() =>
      expect(testState.selectExpeditionOption).toHaveBeenCalledOnce(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Valider l'écoute" }));
    await waitFor(() => expect(testState.enqueue).toHaveBeenCalledOnce());
    expect(testState.enqueue.mock.calls[0]?.[0]).toMatchObject({
      exerciseId: audioExercise.id,
      selectedOptionId: firstOption.id,
    });

    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(
      await screen.findByRole("heading", {
        name: associationExercise.promptFr,
      }),
    ).toBeTruthy();

    for (const [index, pair] of associationExercise.pairs.entries()) {
      const item = bundle.lesson.items.find(({ id }) => id === pair.itemId);
      if (item === undefined) throw new Error("item association absent");
      fireEvent.click(
        screen.getByRole("button", { name: `Associer ${item.thaiRaw}` }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: `Associer ${pair.labelFr}` }),
      );
      await waitFor(() =>
        expect(testState.saveDraft).toHaveBeenCalledTimes(index + 1),
      );
    }

    fireEvent.click(
      await screen.findByRole("button", { name: "Valider l'association" }),
    );
    await waitFor(() => expect(testState.enqueue).toHaveBeenCalledTimes(2));
    expect(testState.enqueue.mock.calls[1]?.[0]).toMatchObject({
      answer: {
        kind: "association",
        pairs: associationExercise.pairs.map(({ id }) => ({
          chosenPairId: id,
          promptPairId: id,
        })),
      },
      exerciseId: associationExercise.id,
    });
    expect(
      await screen.findByText(associationExercise.feedback.correctFr),
    ).toBeTruthy();
  });
});
