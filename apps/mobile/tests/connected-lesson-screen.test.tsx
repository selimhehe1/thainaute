// @vitest-environment jsdom

import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  type AttemptOutboxEntry,
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

const state = vi.hoisted(() => ({
  announce: vi.fn(),
  audio: vi.fn(),
  auth: vi.fn(),
  database: {},
  enqueue: vi.fn(),
  load: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  progress: vi.fn(),
  readLatest: vi.fn(),
  replace: vi.fn(),
  synchronize: vi.fn(),
}));

vi.mock("expo-audio", () => {
  const player = {
    pause: state.pause,
    play: state.play,
    replace: state.replace,
  };
  return { useAudioPlayer: () => player };
});
vi.mock("expo-router", async () => {
  const React = await import("react");
  return {
    Link: ({ children }: { readonly children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});
vi.mock("expo-sqlite", () => ({
  useSQLiteContext: () => state.database,
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
  interface NativeProps {
    readonly accessibilityLiveRegion?: string;
    readonly accessibilityRole?: string;
    readonly accessibilityState?: {
      readonly busy?: boolean;
      readonly checked?: boolean;
      readonly disabled?: boolean;
    };
    readonly children?: ReactNode;
    readonly disabled?: boolean;
    readonly onPress?: () => void;
  }
  const container = ({ children }: NativeProps) =>
    React.createElement("div", null, children);
  return {
    AccessibilityInfo: { announceForAccessibility: state.announce },
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
          role: accessibilityRole === "radio" ? "radio" : accessibilityRole,
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
        accessibilityRole === "header" ? "h1" : "span",
        { "aria-live": accessibilityLiveRegion },
        children,
      ),
    View: container,
  };
});
vi.mock("../components/content-report-panel", () => ({
  MobileContentReportPanel: () => null,
}));
vi.mock("../lib/auth-session", () => ({
  useMobileAuthSession: state.auth,
}));
vi.mock("../lib/expo-public-audio-cache", () => ({
  ensureExpoPublicAudioCached: state.audio,
}));
vi.mock("../lib/mobile-connected-learning", () => ({
  enqueueConnectedMobileAttempt: state.enqueue,
  readLatestConnectedMobileAttempt: state.readLatest,
  synchronizeConnectedMobileAttempt: state.synchronize,
}));
vi.mock("../lib/mobile-connected-public-lesson", () => ({
  loadCurrentMobileConnectedPublicLesson: state.load,
}));
vi.mock("../lib/mobile-lesson-progress", () => ({
  readMobileLessonProgress: state.progress,
}));

// Les doubles natifs sont installés avant la résolution de l'écran.
// eslint-disable-next-line import/first
import ConnectedLessonScreen from "../app/connected-lesson";

const ids = {
  user: "00000000-0000-4000-8000-000000000001",
  device: "00000000-0000-4000-8000-000000000002",
  event: "00000000-0000-4000-8000-000000000003",
  release: "30000000-0000-4000-8000-000000000001",
  lesson: "10000000-0000-4000-8000-000000000001",
  version: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000004",
  asset: "10000000-0000-4000-8000-000000000005",
  optionA: "20000000-0000-4000-8000-000000000001",
  optionB: "20000000-0000-4000-8000-000000000002",
} as const;
const lesson = cachedPublicLessonSchema.parse({
  kind: "lesson",
  key: ids.version,
  etag: `"sha256-${"a".repeat(64)}"`,
  validatedAt: "2026-08-02T08:00:00.000Z",
  response: {
    schemaVersion: 1,
    contentSha256: "a".repeat(64),
    lesson: {
      releaseId: ids.release,
      releaseVersion: 1,
      lessonId: ids.lesson,
      versionId: ids.version,
      revision: 1,
      locale: "fr-FR",
      titleFr: "Boucle technique locale",
      objectiveFr: "Vérifier la correction distante.",
      publishedAt: "2026-08-01T10:00:00.000Z",
      access: "free",
      exercises: [
        {
          id: ids.exercise,
          type: "audio_choice",
          skill: "listening",
          audioAssetId: ids.asset,
          promptFr: "Choisissez l'option technique A.",
          options: [
            { id: ids.optionA, labelFr: "Option A" },
            { id: ids.optionB, labelFr: "Option B" },
          ],
        },
      ],
      audioAssets: [
        {
          assetId: ids.asset,
          variant: "natural",
          mimeType: "audio/wav",
          sha256: "c".repeat(64),
          byteLength: 5_164,
          durationMs: 320,
        },
      ],
    },
  },
});
const release = cachedPublicReleaseSchema.parse({
  kind: "release",
  key: "current",
  etag: `"sha256-${"b".repeat(64)}"`,
  validatedAt: "2026-08-02T08:00:00.000Z",
  response: {
    schemaVersion: 1,
    manifestSha256: "b".repeat(64),
    release: {
      releaseId: ids.release,
      releaseVersion: 1,
      publishedAt: "2026-08-01T10:00:00.000Z",
      lessons: [
        {
          lessonId: ids.lesson,
          versionId: ids.version,
          revision: 1,
          titleFr: "Boucle technique locale",
          objectiveFr: "Vérifier la correction distante.",
          access: "free",
          contentSha256: "a".repeat(64),
        },
      ],
    },
  },
});
const submission = {
  eventId: ids.event,
  deviceId: ids.device,
  exerciseId: ids.exercise,
  selectedOptionId: ids.optionA,
  answeredAt: "2026-08-02T08:00:00.000Z",
  durationMs: 500,
  contentVersionId: ids.version,
  algorithmVersion: "srs-v0",
} as const;
const pending = {
  status: "pending",
  submission,
} as const satisfies AttemptOutboxEntry;

beforeEach(() => {
  vi.clearAllMocks();
  state.auth.mockReturnValue({
    status: "signed_in",
    session: { user: { id: ids.user } },
    sessionBoundaryRevision: 0,
  });
  state.load.mockResolvedValue({
    lesson,
    release,
    audioUrl: (assetId: string) => `https://api.test/audio/${assetId}`,
  });
  state.readLatest.mockResolvedValue(null);
  state.audio.mockResolvedValue({
    asset: lesson.response.lesson.audioAssets[0],
    uri: "file:///verified.wav",
    reused: false,
  });
  state.enqueue.mockResolvedValue(pending);
  state.synchronize.mockResolvedValue({
    status: "synced",
    submission,
    serverStatus: "accepted",
    rating: 1,
    feedbackFr: "La boucle technique fonctionne.",
  } satisfies AttemptOutboxEntry);
  state.progress.mockResolvedValue({
    schemaVersion: 1,
    lessonVersionId: ids.version,
    syncRevision: 1,
    exercises: [
      {
        exerciseId: ids.exercise,
        skill: "listening",
        status: "confirmed",
        masteryPermille: 1_000,
        attemptCount: 1,
        successfulAttempts: 1,
        consecutiveCorrect: 1,
        dueAt: "2026-08-03T08:00:00.000Z",
        algorithmVersion: "srs-v0",
      },
    ],
  });
});

afterEach(cleanup);

describe("écran mobile de preview connectée", () => {
  it("enchaîne audio vérifié, enqueue durable et correction serveur", async () => {
    render(<ConnectedLessonScreen />);
    expect(
      await screen.findByRole("heading", { name: "Boucle technique locale" }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger et écouter" }),
    );
    await waitFor(() =>
      expect(state.replace).toHaveBeenCalledWith({
        uri: "file:///verified.wav",
      }),
    );
    expect(state.play).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("radio", { name: "Option A" }));
    fireEvent.click(screen.getByRole("button", { name: "Valider ma réponse" }));
    expect(
      await screen.findByRole("heading", { name: "Correction autoritaire" }),
    ).toBeTruthy();
    expect(screen.getByText("La boucle technique fonctionne.")).toBeTruthy();
    expect(state.enqueue.mock.invocationCallOrder[0]).toBeLessThan(
      state.synchronize.mock.invocationCallOrder[0] ?? 0,
    );
    expect(state.announce).toHaveBeenCalledWith(
      "Correction autoritaire. La boucle technique fonctionne.",
    );
  });

  it("synchronise le compte B sans attendre la requête encore active du compte A", async () => {
    const accountB = "00000000-0000-4000-8000-000000000009";
    let resolveAccountA!: (value: AttemptOutboxEntry) => void;
    const accountARequest = new Promise<AttemptOutboxEntry>((resolve) => {
      resolveAccountA = resolve;
    });
    const synchronized = {
      status: "synced",
      submission,
      serverStatus: "accepted",
      rating: 1,
      feedbackFr: "La boucle technique fonctionne.",
    } as const satisfies AttemptOutboxEntry;
    state.readLatest.mockResolvedValue(pending);
    state.synchronize.mockImplementation(
      ({ userId }: { readonly userId: string }) =>
        userId === ids.user ? accountARequest : Promise.resolve(synchronized),
    );
    const view = render(<ConnectedLessonScreen />);
    await waitFor(() => expect(state.synchronize).toHaveBeenCalledTimes(1));

    state.auth.mockReturnValue({
      status: "signed_in",
      session: { user: { id: accountB } },
      sessionBoundaryRevision: 1,
    });
    view.rerender(<ConnectedLessonScreen />);
    await waitFor(() => expect(state.synchronize).toHaveBeenCalledTimes(2));
    expect(state.synchronize).toHaveBeenLastCalledWith(
      expect.objectContaining({ userId: accountB }),
    );

    await act(async () => {
      resolveAccountA(synchronized);
      await accountARequest;
    });
  });

  it("annule et ignore un audio du compte A résolu après le passage au compte B", async () => {
    let resolveAudio!: (value: {
      readonly asset: (typeof lesson.response.lesson.audioAssets)[number];
      readonly reused: boolean;
      readonly uri: string;
    }) => void;
    const audioRequest = new Promise<{
      readonly asset: (typeof lesson.response.lesson.audioAssets)[number];
      readonly reused: boolean;
      readonly uri: string;
    }>((resolve) => {
      resolveAudio = resolve;
    });
    state.audio.mockReturnValue(audioRequest);
    const view = render(<ConnectedLessonScreen />);
    await screen.findByRole("heading", { name: "Boucle technique locale" });
    fireEvent.click(
      screen.getByRole("button", { name: "Télécharger et écouter" }),
    );
    await waitFor(() => expect(state.audio).toHaveBeenCalledOnce());
    const signal = state.audio.mock.calls[0]?.[0]?.signal as
      AbortSignal | undefined;

    state.auth.mockReturnValue({
      status: "signed_in",
      session: { user: { id: "00000000-0000-4000-8000-000000000009" } },
      sessionBoundaryRevision: 1,
    });
    view.rerender(<ConnectedLessonScreen />);
    await waitFor(() => expect(signal?.aborted).toBe(true));
    await act(async () => {
      resolveAudio({
        asset: lesson.response.lesson.audioAssets[0]!,
        reused: false,
        uri: "file:///stale-account-a.wav",
      });
      await audioRequest;
    });

    expect(state.replace).not.toHaveBeenCalledWith({
      uri: "file:///stale-account-a.wav",
    });
  });
});
