// @vitest-environment jsdom

import {
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  device: "40000000-0000-4000-8000-000000000001",
  event: "30000000-0000-4000-8000-000000000001",
  exercise: "10000000-0000-4000-8000-000000000004",
  lesson: "10000000-0000-4000-8000-000000000002",
  optionA: "20000000-0000-4000-8000-000000000001",
  optionB: "20000000-0000-4000-8000-000000000002",
} as const;
const sessionStartedAt = "2020-08-02T08:00:00.000Z";

const testState = vi.hoisted(() => ({
  announce: vi.fn(),
  confirm: vi.fn(),
  database: {},
  deleteRecording: vi.fn(() => Promise.resolve(true)),
  enqueue: vi.fn(),
  finish: vi.fn(),
  getDeviceId: vi.fn(),
  migrate: vi.fn(),
  migrateFixture: vi.fn(),
  openQuestion: vi.fn(),
  outboxNamespaces: [] as (string | undefined)[],
  pausePlayback: vi.fn(),
  playModel: vi.fn(),
  prepare: vi.fn(),
  push: vi.fn(),
  randomUUID: vi.fn(),
  read: vi.fn(),
  replace: vi.fn(),
  selectOption: vi.fn(),
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
    useRouter: () => testRouter,
  };
});

vi.mock("expo-status-bar", () => ({ StatusBar: () => null }));
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => testState.database,
}));
vi.mock("expo-crypto", () => ({ randomUUID: testState.randomUUID }));
vi.mock("expo-audio", () => ({ useAudioPlayer: () => ({}) }));

vi.mock("../lib/auth-session", () => ({
  useMobileAuthSession: () => ({ sessionBoundaryRevision: 0 }),
}));

vi.mock("../lib/use-local-voice-practice", () => ({
  useLocalVoicePractice: () => ({
    canPlayRecording: false,
    deleteRecording: testState.deleteRecording,
    error: "",
    hasRecording: false,
    isBusy: false,
    isRecording: false,
    notice: "",
    pausePlayback: testState.pausePlayback,
    playModel: testState.playModel,
    playRecording: vi.fn(),
    playback: null,
    remainingSeconds: 20,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));

vi.mock("../lib/mobile-local-experience-store", () => ({
  MobileLocalExperienceStore: class {
    read = testState.read;
    openLessonQuestion = testState.openQuestion;
    selectLessonOption = testState.selectOption;
    prepareLessonSubmission = testState.prepare;
    confirmLessonResult = testState.confirm;
    finishLesson = testState.finish;
  },
}));

vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStorageError: class extends Error {},
  MobileAttemptOutboxStore: class {
    constructor(_database: unknown, _owner: unknown, namespace?: string) {
      testState.outboxNamespaces.push(namespace);
    }
    migrateLegacyFixtureAttemptsToDemo = testState.migrateFixture;
    migrateLegacyJournal = testState.migrate;
    getOrCreateDeviceId = testState.getDeviceId;
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
    accessibilityLabel?: string;
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
    style?: { color?: string; fontFamily?: string };
  };
  const container = ({ children }: NativeProps) =>
    React.createElement("div", null, children);
  const Text = React.forwardRef<HTMLElement, NativeProps>(
    ({ accessibilityLiveRegion, accessibilityRole, children, style }, ref) =>
      React.createElement(
        accessibilityRole === "header" ? "h1" : "p",
        {
          "aria-live": accessibilityLiveRegion,
          "data-color": style?.color,
          "data-font-family": style?.fontFamily,
          ref,
          role: accessibilityRole === "alert" ? "alert" : undefined,
        },
        children,
      ),
  );
  Text.displayName = "MockText";
  return {
    AccessibilityInfo: {
      announceForAccessibility: testState.announce,
      setAccessibilityFocus: vi.fn(),
    },
    findNodeHandle: vi.fn(() => 1),
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
          "aria-busy": accessibilityState?.busy,
          "aria-checked": accessibilityState?.checked,
          "aria-disabled": accessibilityState?.disabled,
          "aria-label": accessibilityLabel,
          disabled,
          onClick: onPress,
          role: accessibilityRole === "radio" ? "radio" : undefined,
        },
        children,
      ),
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
import { LessonExperience } from "../app/lesson";

function baseExperience(lesson: Record<string, unknown>) {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "completed",
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
      startedAt: sessionStartedAt,
      completedAt: sessionStartedAt,
    },
    lesson,
  };
}

function introExperience() {
  return baseExperience({
    phase: "intro",
    lessonVersionId: ids.lesson,
    exerciseId: ids.exercise,
    sessionStartedAt,
    updatedAt: sessionStartedAt,
  });
}

function questionExperience(selectedOptionId: string | null) {
  return baseExperience({
    phase: "question",
    lessonVersionId: ids.lesson,
    exerciseId: ids.exercise,
    selectedOptionId,
    sessionStartedAt,
    updatedAt: sessionStartedAt,
  });
}

function submission(): ValidatedAttemptSubmission {
  return {
    eventId: ids.event,
    deviceId: ids.device,
    exerciseId: ids.exercise,
    selectedOptionId: ids.optionA,
    answeredAt: "2026-08-02T00:00:00.000Z",
    durationMs: 1_000,
    contentVersionId: ids.lesson,
    algorithmVersion: "srs-v0",
  };
}

function submittingExperience(exact = submission()) {
  return baseExperience({
    phase: "submitting",
    lessonVersionId: ids.lesson,
    exerciseId: ids.exercise,
    submission: exact,
    sessionStartedAt,
    updatedAt: exact.answeredAt,
  });
}

function resultExperience(exact = submission()) {
  return baseExperience({
    phase: "result",
    lessonVersionId: ids.lesson,
    exerciseId: ids.exercise,
    submission: exact,
    sessionStartedAt,
    updatedAt: exact.answeredAt,
  });
}

function completedExperience(exact = submission()) {
  return baseExperience({
    phase: "completed",
    lessonVersionId: ids.lesson,
    exerciseId: ids.exercise,
    submission: exact,
    sessionStartedAt,
    completedAt: "2026-08-02T00:01:00.000Z",
    updatedAt: "2026-08-02T00:01:00.000Z",
  });
}

let outbox: AttemptOutboxSnapshot;

beforeEach(() => {
  vi.clearAllMocks();
  testState.outboxNamespaces.splice(0);
  outbox = createAttemptOutboxSnapshot();
  testState.read.mockResolvedValue(introExperience());
  testState.migrateFixture.mockImplementation(async () => outbox);
  testState.migrate.mockImplementation(async () => outbox);
  testState.getDeviceId.mockResolvedValue(ids.device);
  testState.randomUUID.mockReturnValue(ids.event);
  testState.openQuestion.mockResolvedValue(questionExperience(null));
  testState.selectOption.mockImplementation(async (optionId: string) =>
    questionExperience(optionId),
  );
  testState.prepare.mockImplementation(
    async (candidate: ValidatedAttemptSubmission) =>
      submittingExperience(candidate),
  );
  testState.enqueue.mockImplementation(
    async (candidate: ValidatedAttemptSubmission) => {
      outbox = enqueueAttempt(outbox, candidate);
      return outbox;
    },
  );
  testState.confirm.mockImplementation(async (_outbox: AttemptOutboxSnapshot) =>
    resultExperience(submission()),
  );
  testState.finish.mockImplementation(async () => ({
    ...resultExperience(submission()),
    lesson: {
      ...resultExperience(submission()).lesson,
      phase: "completed",
      completedAt: "2026-08-02T00:01:00.000Z",
    },
  }));
});

afterEach(() => cleanup());

describe("reprise de la leçon mobile", () => {
  it("restaure la question et l’option persistée", async () => {
    testState.read.mockResolvedValue(questionExperience(ids.optionB));
    render(<LessonExperience />);

    expect(await screen.findByRole("radio", { name: "Option B" })).toBeTruthy();
    expect(
      (
        screen.getByRole("radio", { name: "Option B" }) as {
          getAttribute: (name: string) => string | null;
        }
      ).getAttribute("aria-checked"),
    ).toBe("true");
    expect(testState.prepare).not.toHaveBeenCalled();
    expect(testState.enqueue).not.toHaveBeenCalled();
  });

  it("conserve la durée depuis le début durable après une reprise", async () => {
    const now = vi
      .spyOn(Date, "now")
      .mockReturnValue(Date.parse(sessionStartedAt) + 5_000);
    testState.read.mockResolvedValue(questionExperience(ids.optionB));

    try {
      render(<LessonExperience />);
      fireEvent.click(await screen.findByRole("radio", { name: "Option A" }));
      await waitFor(() =>
        expect(testState.selectOption).toHaveBeenCalledOnce(),
      );
      fireEvent.click(screen.getByRole("button", { name: "Valider" }));

      await waitFor(() => expect(testState.prepare).toHaveBeenCalledOnce());
      expect(testState.prepare.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ durationMs: 5_000 }),
      );
    } finally {
      now.mockRestore();
    }
  });

  it("ré-enqueue exactement la tentative réservée après un crash", async () => {
    const exact = submission();
    testState.read.mockResolvedValue(submittingExperience(exact));
    testState.confirm.mockResolvedValue(resultExperience(exact));
    render(<LessonExperience />);

    expect(
      await screen.findByText("La boucle technique fonctionne."),
    ).toBeTruthy();
    expect(testState.enqueue).toHaveBeenCalledTimes(1);
    expect(testState.enqueue).toHaveBeenCalledWith(exact);
    expect(testState.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: [expect.objectContaining({ submission: exact })],
      }),
      expect.any(String),
    );
    expect(testState.randomUUID).not.toHaveBeenCalled();
    expect(testState.outboxNamespaces).toEqual(["demo"]);
  });

  it("réserve, enqueue et confirme dans cet ordre avant le résultat", async () => {
    const capture = vi.fn();
    testState.confirm.mockImplementation(
      async (_currentOutbox: AttemptOutboxSnapshot) =>
        resultExperience(
          testState.prepare.mock.calls[0]?.[0] as ValidatedAttemptSubmission,
        ),
    );
    render(<LessonExperience analytics={{ capture }} />);

    expect(
      (
        (await screen.findByText("ก่")) as {
          getAttribute: (name: string) => string | null;
        }
      ).getAttribute("data-font-family"),
    ).toBe("NotoSansThai_400Regular");

    fireEvent.click(await screen.findByRole("button", { name: "Commencer" }));
    await waitFor(() => expect(testState.openQuestion).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("radio", { name: "Option A" }));
    await waitFor(() => expect(testState.selectOption).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));

    expect(
      await screen.findByText("La boucle technique fonctionne."),
    ).toBeTruthy();
    const prepared = testState.prepare.mock.calls[0]?.[0] as
      ValidatedAttemptSubmission | undefined;
    expect(prepared).toBeDefined();
    expect(testState.enqueue).toHaveBeenCalledWith(prepared);
    expect(testState.prepare.mock.invocationCallOrder[0]).toBeLessThan(
      testState.enqueue.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(testState.enqueue.mock.invocationCallOrder[0]).toBeLessThan(
      testState.confirm.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "exercise_answered",
        lessonVersionId: ids.lesson,
        correct: true,
        platform: "android",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Terminer" }));
    await waitFor(() => expect(testState.finish).toHaveBeenCalledOnce());
    expect(testState.deleteRecording.mock.invocationCallOrder[0]).toBeLessThan(
      testState.finish.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(testState.replace).toHaveBeenCalledWith("/");
  });

  it("revoit un résultat completed sans recréer ni compléter la tentative", async () => {
    const exact = submission();
    outbox = enqueueAttempt(createAttemptOutboxSnapshot(), exact);
    testState.read.mockResolvedValue(completedExperience(exact));
    const capture = vi.fn();
    render(<LessonExperience analytics={{ capture }} />);

    expect(
      await screen.findByText("La boucle technique fonctionne."),
    ).toBeTruthy();
    expect(
      (
        screen.getByText("250 ‰") as {
          getAttribute: (name: string) => string | null;
        }
      ).getAttribute("data-color"),
    ).toBe("#236b58");
    fireEvent.click(
      screen.getByRole("button", { name: "Retour à Aujourd’hui" }),
    );

    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith("/"));
    expect(testState.finish).not.toHaveBeenCalled();
    expect(testState.deleteRecording).toHaveBeenCalledOnce();
    expect(capture).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "lesson_completed" }),
    );
  });

  it("refuse un résultat dont le payload durable diverge malgré le même eventId", async () => {
    const exact = submission();
    outbox = enqueueAttempt(createAttemptOutboxSnapshot(), {
      ...exact,
      selectedOptionId: ids.optionB,
    });
    testState.read.mockResolvedValue(resultExperience(exact));

    render(<LessonExperience />);

    expect(
      await screen.findByRole("button", { name: "Réessayer le stockage" }),
    ).toBeTruthy();
    expect(screen.queryByText("La boucle technique fonctionne.")).toBeNull();
  });
});
