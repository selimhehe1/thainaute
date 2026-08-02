import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  type AttemptOutboxEntry,
} from "@thainaute/sync";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audio: vi.fn(),
  enqueue: vi.fn(),
  load: vi.fn(),
  progress: vi.fn(),
  readLatest: vi.fn(),
  synchronize: vi.fn(),
}));

vi.mock("@/lib/client/auth-session", () => ({
  useWebAuthSession: mocks.auth,
}));
vi.mock("@/lib/client/connected-learning", () => ({
  enqueueConnectedWebAttempt: mocks.enqueue,
  readLatestConnectedWebAttempt: mocks.readLatest,
  synchronizeConnectedWebAttempt: mocks.synchronize,
}));
vi.mock("@/lib/client/connected-public-lesson", () => ({
  loadCurrentConnectedPublicLesson: mocks.load,
}));
vi.mock("@/lib/client/lesson-progress", () => ({
  readWebLessonProgress: mocks.progress,
}));
vi.mock("@/lib/client/public-audio-cache", () => ({
  loadVerifiedWebAudio: mocks.audio,
}));
vi.mock("@/app/learn/demo/content-report-panel", () => ({
  ContentReportPanel: () => null,
}));

import { ConnectedExperience } from "@/app/learn/connected/connected-experience";

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

const publicLesson = cachedPublicLessonSchema.parse({
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
const publicRelease = cachedPublicReleaseSchema.parse({
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
const connectedLesson = {
  release: publicRelease,
  lesson: publicLesson,
  audioUrl: (assetId: string) => `/audio/${assetId}`,
};
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

const serverProgress = {
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
} as const;

function signedOut() {
  mocks.auth.mockReturnValue({
    status: "signed_out",
    session: null,
    sessionBoundaryRevision: 0,
  });
}

function signedIn(
  userId: string = ids.user,
  sessionBoundaryRevision: number = 0,
) {
  mocks.auth.mockReturnValue({
    status: "signed_in",
    session: { user: { id: userId } },
    sessionBoundaryRevision,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: true,
  });
  mocks.load.mockResolvedValue(connectedLesson);
  mocks.readLatest.mockResolvedValue(null);
  mocks.enqueue.mockResolvedValue(pending);
  mocks.audio.mockResolvedValue({
    objectUrl: "blob:verified",
    revalidated: false,
    revoke: vi.fn(),
  });
  mocks.progress.mockResolvedValue(serverProgress);
});

afterEach(cleanup);

describe("preview web connectée", () => {
  it("présente le contenu public mais exige un compte pour la correction", async () => {
    signedOut();
    render(<ConnectedExperience />);
    expect(
      await screen.findByRole("heading", { name: "Boucle technique locale" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Me connecter" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(mocks.enqueue).not.toHaveBeenCalled();
  });

  it("n'invente aucune correction quand le réseau échoue après l'enqueue", async () => {
    signedIn();
    mocks.synchronize.mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    render(<ConnectedExperience />);
    await screen.findByRole("heading", { name: "Boucle technique locale" });
    await user.click(screen.getByRole("button", { name: "Préparer l’audio" }));
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(
      screen.getByRole("button", { name: "Valider ma réponse" }),
    );
    expect(
      await screen.findByText(
        /correction sera reprise avec ce même événement/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Correction autoritaire"),
    ).not.toBeInTheDocument();
  });

  it("affiche le feedback et la progression provenant du serveur", async () => {
    signedIn();
    mocks.synchronize.mockResolvedValue({
      status: "synced",
      submission,
      serverStatus: "accepted",
      rating: 1,
      feedbackFr: "La boucle technique fonctionne.",
    } satisfies AttemptOutboxEntry);
    const user = userEvent.setup();
    render(<ConnectedExperience />);
    await screen.findByRole("heading", { name: "Boucle technique locale" });
    await user.click(screen.getByRole("button", { name: "Préparer l’audio" }));
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(
      screen.getByRole("button", { name: "Valider ma réponse" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Correction autoritaire" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La boucle technique fonctionne."),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("100 %")).toBeInTheDocument());
  });

  it("ignore une progression du compte A résolue après le passage au compte B", async () => {
    let resolveAccountA!: (value: typeof serverProgress) => void;
    const accountAProgress = new Promise<typeof serverProgress>((resolve) => {
      resolveAccountA = resolve;
    });
    mocks.progress
      .mockImplementationOnce(() => accountAProgress)
      .mockResolvedValueOnce({ ...serverProgress, exercises: [] });
    signedIn(ids.user, 0);
    const view = render(<ConnectedExperience />);
    await screen.findByRole("heading", { name: "Boucle technique locale" });

    signedIn("00000000-0000-4000-8000-000000000009", 1);
    view.rerender(<ConnectedExperience />);
    await waitFor(() => expect(mocks.progress).toHaveBeenCalledTimes(2));
    await act(async () => {
      resolveAccountA(serverProgress);
      await accountAProgress;
      await Promise.resolve();
    });

    expect(screen.queryByText("100 %")).not.toBeInTheDocument();
  });

  it("révoque un objet audio du compte A résolu après le passage au compte B", async () => {
    const revoke = vi.fn();
    let resolveAudio!: (value: {
      readonly objectUrl: string;
      readonly revalidated: boolean;
      readonly revoke: () => void;
    }) => void;
    const audioRequest = new Promise<{
      readonly objectUrl: string;
      readonly revalidated: boolean;
      readonly revoke: () => void;
    }>((resolve) => {
      resolveAudio = resolve;
    });
    mocks.audio.mockReturnValue(audioRequest);
    signedIn(ids.user, 0);
    const user = userEvent.setup();
    const view = render(<ConnectedExperience />);
    await screen.findByRole("heading", { name: "Boucle technique locale" });
    await user.click(screen.getByRole("button", { name: "Préparer l’audio" }));
    await waitFor(() => expect(mocks.audio).toHaveBeenCalledOnce());

    signedIn("00000000-0000-4000-8000-000000000009", 1);
    view.rerender(<ConnectedExperience />);
    await waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(2));
    await act(async () => {
      resolveAudio({
        objectUrl: "blob:stale-account-a",
        revalidated: false,
        revoke,
      });
      await audioRequest;
    });

    expect(revoke).toHaveBeenCalledOnce();
    expect(document.querySelector("audio")?.getAttribute("src")).not.toBe(
      "blob:stale-account-a",
    );
  });
});
