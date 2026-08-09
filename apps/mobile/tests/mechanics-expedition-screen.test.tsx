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
  MechanicsExpeditionConfig,
  MechanicsExpeditionExerciseConfig,
} from "../lib/embedded-mechanics-expedition-config";

const testState = vi.hoisted(() => ({
  announce: vi.fn(),
  clearCompleted: vi.fn(),
  confirm: vi.fn(),
  database: {},
  enqueue: vi.fn(),
  finish: vi.fn(),
  getDeviceId: vi.fn(),
  openQuestion: vi.fn(),
  prepare: vi.fn(),
  randomUUID: vi.fn(),
  readExperience: vi.fn(),
  readOutbox: vi.fn(),
  recordResult: vi.fn(),
  saveDraft: vi.fn(),
  startExpedition: vi.fn(),
  startLesson: vi.fn(),
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
vi.mock("../components/content-report-panel", () => ({
  MobileContentReportPanel: () => null,
}));
vi.mock("../lib/analytics-provider", () => ({
  useMobileAnalytics: () => ({ analytics: { capture: vi.fn() } }),
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
    prepareLessonSubmission = testState.prepare;
    confirmLessonResult = testState.confirm;
    finishLesson = testState.finish;
    recordExpeditionResult = testState.recordResult;
    clearCompletedExpedition = testState.clearCompleted;
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
    children?: ReactNode;
    disabled?: boolean;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    style?: { minHeight?: number };
    value?: string;
  };
  const container = ({ children }: NativeProps) =>
    React.createElement("div", null, children);
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
    AccessibilityInfo: { announceForAccessibility: testState.announce },
    Platform: { OS: "android" },
    Pressable: ({
      accessibilityLabel,
      children,
      disabled,
      onPress,
      accessibilityRole,
    }: NativeProps) =>
      React.createElement(
        "button",
        {
          "aria-label": accessibilityLabel,
          disabled,
          onClick: onPress,
          role: accessibilityRole === "button" ? "button" : undefined,
        },
        children,
      ),
    ScrollView: container,
    StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
    Text,
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
import { MechanicsExpeditionExperience } from "../internal/mechanics-expedition-screen";

const bundle = readEmbeddedUnite01LessonBundle("u01-l1b");
type AssociationExercise = Extract<LessonExercise, { type: "association" }>;
type RecallExercise = Extract<LessonExercise, { type: "recall" }>;
const associationExerciseCandidate = bundle.lesson.exercises.find(
  (exercise): exercise is AssociationExercise =>
    exercise.type === "association",
);
const recallExerciseCandidate = bundle.lesson.exercises.find(
  (exercise): exercise is RecallExercise => exercise.type === "recall",
);
if (
  associationExerciseCandidate === undefined ||
  recallExerciseCandidate === undefined
) {
  throw new Error("Les exercices de test association/rappel sont absents.");
}
const associationExercise: AssociationExercise = associationExerciseCandidate;
const recallExercise: RecallExercise = recallExerciseCandidate;

function exerciseConfig(
  exercise: AssociationExercise | RecallExercise,
): MechanicsExpeditionExerciseConfig {
  const itemId =
    exercise.type === "association"
      ? exercise.pairs[0]?.itemId
      : exercise.itemId;
  const item = bundle.lesson.items.find(({ id }) => id === itemId);
  if (item === undefined) throw new Error("Item de test absent.");
  return { exercise, item };
}

function configFor(
  exercise: AssociationExercise | RecallExercise,
): MechanicsExpeditionConfig {
  return {
    bannerText: "test",
    bannerTitle: "test",
    completionPrivacy: "test",
    exercises: [exerciseConfig(exercise)],
    headerStep: "test",
    introEyebrow: "test",
    key: "u01-l1b",
    lesson: bundle.lesson,
    outboxNamespace: "learning",
  };
}

const associationConfig = configFor(associationExercise);
const recallConfig = configFor(recallExercise);
const sessionStartedAt = "2026-08-06T10:00:00.000Z";
const deviceId = "40000000-0000-4000-8000-000000000001";

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
    },
    sessionStartedAt,
  );
}

function activeExperience(
  config: MechanicsExpeditionConfig,
  lesson: LocalLessonCheckpoint | null = null,
): LocalExperienceSnapshot {
  return {
    ...onboarded(),
    expedition: {
      lessonVersionId: config.lesson.versionId,
      exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
      results: [],
      startedAt: sessionStartedAt,
      updatedAt: sessionStartedAt,
    },
    lesson,
  };
}

function questionLesson(
  config: MechanicsExpeditionConfig,
  answer: LocalDraftAnswer | null = null,
): Extract<LocalLessonCheckpoint, { phase: "question" }> {
  return {
    phase: "question",
    lessonVersionId: config.lesson.versionId,
    exerciseId: config.exercises[0]!.exercise.id,
    selectedOptionId: null,
    draftAnswer: answer,
    missedOnce: false,
    sessionStartedAt,
    updatedAt: sessionStartedAt,
  };
}

function setup(
  config: MechanicsExpeditionConfig,
  initial = activeExperience(config),
): void {
  let experience = initial;
  let outbox: AttemptOutboxSnapshot = createAttemptOutboxSnapshot();
  testState.readExperience.mockImplementation(() =>
    Promise.resolve(experience),
  );
  testState.readOutbox.mockImplementation(() => Promise.resolve(outbox));
  testState.randomUUID.mockReturnValue("30000000-0000-4000-8000-000000000001");
  testState.getDeviceId.mockResolvedValue(deviceId);
  testState.startExpedition.mockImplementation(async () => {
    experience = activeExperience(config);
    return experience;
  });
  testState.startLesson.mockImplementation(async () => {
    experience = activeExperience(config, {
      phase: "intro",
      lessonVersionId: config.lesson.versionId,
      exerciseId: config.exercises[0]!.exercise.id,
      sessionStartedAt,
      updatedAt: sessionStartedAt,
    });
    return experience;
  });
  testState.openQuestion.mockImplementation(async () => {
    experience = activeExperience(config, questionLesson(config));
    return experience;
  });
  testState.saveDraft.mockImplementation(
    async ({
      answer,
      missedOnce,
    }: {
      answer: LocalDraftAnswer;
      missedOnce?: boolean;
    }) => {
      const currentLesson = experience.lesson;
      if (currentLesson?.phase !== "question") {
        throw new Error("question checkpoint absent");
      }
      experience = activeExperience(config, {
        ...currentLesson,
        draftAnswer: answer,
        missedOnce: currentLesson.missedOnce || (missedOnce ?? false),
        updatedAt: new Date().toISOString(),
      });
      return experience;
    },
  );
  testState.prepare.mockImplementation(
    async (submission: ValidatedAttemptSubmission) => {
      experience = activeExperience(config, {
        phase: "submitting",
        lessonVersionId: config.lesson.versionId,
        exerciseId: submission.exerciseId,
        sessionStartedAt,
        submission,
        updatedAt: submission.answeredAt,
      });
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
    if (lesson?.phase !== "submitting") throw new Error("submitting absent");
    experience = activeExperience(config, {
      ...lesson,
      phase: "result",
      updatedAt: lesson.submission.answeredAt,
    });
    return experience;
  });
  testState.finish.mockImplementation(async () => {
    const lesson = experience.lesson;
    if (lesson?.phase !== "result") throw new Error("result absent");
    experience = activeExperience(config, {
      ...lesson,
      phase: "completed",
      completedAt: lesson.submission.answeredAt,
      updatedAt: lesson.submission.answeredAt,
    });
    return experience;
  });
  testState.recordResult.mockImplementation(
    async ({ exerciseId, rating, answeredAt }) => {
      if (experience.expedition === null) throw new Error("expedition absent");
      experience = {
        ...experience,
        expedition: {
          ...experience.expedition,
          results: [{ exerciseId, rating, answeredAt }],
          updatedAt: answeredAt,
        },
      };
      return experience;
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe("écran mobile des mécaniques typées", () => {
  it("apparie les cartes, conserve le brouillon puis soumet une réponse typée", async () => {
    setup(associationConfig);
    render(
      <MechanicsExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={associationConfig}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Commencer la leçon" }),
    );
    for (const pair of associationExercise.pairs) {
      const item = bundle.lesson.items.find(({ id }) => id === pair.itemId);
      if (item === undefined) throw new Error("pair item absent");
      fireEvent.click(
        await screen.findByRole("button", {
          name: `Associer ${item.thaiRaw}`,
        }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: `Associer ${pair.labelFr}` }),
      );
      await waitFor(() =>
        expect(testState.saveDraft).toHaveBeenCalledTimes(
          associationExercise.pairs.indexOf(pair) + 1,
        ),
      );
    }

    fireEvent.click(
      await screen.findByRole("button", { name: "Valider l'association" }),
    );
    await waitFor(() => expect(testState.enqueue).toHaveBeenCalledOnce());
    expect(testState.enqueue.mock.calls[0]?.[0]).toMatchObject({
      answer: {
        kind: "association",
        pairs: associationExercise.pairs.map(({ id }) => ({
          promptPairId: id,
          chosenPairId: id,
        })),
      },
    });
    expect(
      await screen.findByText(associationExercise.feedback.correctFr),
    ).toBeTruthy();
  });

  it("conserve une erreur d'association comme tentative manquée", async () => {
    const firstPair = associationExercise.pairs[0];
    const wrongPair = associationExercise.pairs[1];
    if (firstPair === undefined || wrongPair === undefined) {
      throw new Error("association de test trop courte");
    }
    const firstItem = bundle.lesson.items.find(
      ({ id }) => id === firstPair.itemId,
    );
    if (firstItem === undefined) throw new Error("pair item absent");
    setup(associationConfig);
    render(
      <MechanicsExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={associationConfig}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Commencer la leçon" }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: `Associer ${firstItem.thaiRaw}`,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: `Associer ${wrongPair.labelFr}` }),
    );

    await waitFor(() =>
      expect(testState.saveDraft).toHaveBeenCalledWith(
        {
          answer: { kind: "association", pairs: [] },
          missedOnce: true,
        },
        expect.any(String),
      ),
    );
    expect(
      await screen.findByText(associationExercise.feedback.incorrectFr),
    ).toBeTruthy();
  });

  it("reprend un rappel durable et soumet la valeur sans la perdre", async () => {
    const accepted = recallExercise.acceptedAnswers[0]?.value;
    if (accepted === undefined) throw new Error("accepted answer absent");
    const initial = activeExperience(
      recallConfig,
      questionLesson(recallConfig, { kind: "recall", value: accepted }),
    );
    setup(recallConfig, initial);
    render(
      <MechanicsExpeditionExperience
        analytics={{ capture: vi.fn() }}
        config={recallConfig}
      />,
    );

    const input = await screen.findByRole("textbox", { name: "Votre réponse" });
    expect((input as unknown as { readonly value: string }).value).toBe(
      accepted,
    );
    fireEvent.click(screen.getByRole("button", { name: "Valider le rappel" }));

    await waitFor(() => expect(testState.enqueue).toHaveBeenCalledOnce());
    expect(testState.enqueue.mock.calls[0]?.[0]).toMatchObject({
      answer: { kind: "recall", value: accepted },
    });
    expect(
      await screen.findByText(recallExercise.feedback.correctFr),
    ).toBeTruthy();
  });
});
