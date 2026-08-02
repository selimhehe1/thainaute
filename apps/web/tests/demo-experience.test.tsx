import type { AnalyticsSink } from "@thainaute/analytics";
import {
  completeLocalOnboarding,
  createLocalExperienceSnapshot,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  selectLocalLessonOption,
  serializeLocalExperienceSnapshot,
  startLocalLesson,
} from "@thainaute/sync";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DemoExperience } from "../app/learn/demo/demo-experience";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";
import { WebAuthSessionProvider } from "../lib/client/auth-session";
import { WebLocalExperienceStore } from "../lib/client/local-experience-store";

const lesson = {
  versionId: "10000000-0000-4000-8000-000000000002",
  title: "Boucle technique locale",
  objective: "Vérifier la boucle sans contenu pédagogique.",
  itemId: "10000000-0000-4000-8000-000000000003",
  thaiRaw: "ก่",
  exercise: {
    id: "10000000-0000-4000-8000-000000000004",
    prompt: "Sélectionnez l’option technique A.",
    options: [
      { id: "20000000-0000-4000-8000-000000000001", labelFr: "Option A" },
      { id: "20000000-0000-4000-8000-000000000002", labelFr: "Option B" },
    ],
    correctOptionId: "20000000-0000-4000-8000-000000000001",
    feedback: {
      correctFr: "La boucle technique fonctionne.",
      incorrectFr: "Réessayez.",
    },
  },
};

class FakeLessonAudio {
  public static readonly instances: FakeLessonAudio[] = [];

  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public readonly load = vi.fn();
  public readonly pause = vi.fn();
  public readonly play = vi.fn(() => Promise.resolve());
  public readonly removeAttribute = vi.fn();

  public constructor(public readonly initialSrc?: string) {
    FakeLessonAudio.instances.push(this);
  }
}

const NativeAudio = globalThis.Audio;

function renderDemo(analytics?: AnalyticsSink, lessonInput = lesson) {
  return render(
    <WebAuthSessionProvider>
      <DemoExperience
        lesson={lessonInput}
        {...(analytics === undefined ? {} : { analytics })}
      />
    </WebAuthSessionProvider>,
  );
}

async function seedCompletedOnboarding(): Promise<void> {
  const store = new WebLocalExperienceStore();
  await store.update((snapshot) =>
    completeLocalOnboarding(
      snapshot,
      {
        goalOptionId: "prototype_goal_short",
        motivationOptionId: "prototype_motivation_a",
        experienceOptionId: "prototype_experience_new",
      },
      "2026-08-02T08:00:00.000Z",
    ),
  );
  store.close();
}

beforeEach(async () => {
  FakeLessonAudio.instances.splice(0);
  Object.defineProperty(globalThis, "Audio", {
    configurable: true,
    value: FakeLessonAudio as unknown as typeof Audio,
  });
  await new WebAttemptOutboxStore("thainaute-demo-v1").deleteForTests();
  await new WebLocalExperienceStore().deleteForTests();
  await seedCompletedOnboarding();
});

afterEach(async () => {
  cleanup();
  Object.defineProperty(globalThis, "Audio", {
    configurable: true,
    value: NativeAudio,
  });
  window.localStorage.clear();
  vi.restoreAllMocks();
  await new WebAttemptOutboxStore("thainaute-demo-v1").deleteForTests();
  await new WebLocalExperienceStore().deleteForTests();
});

describe("leçon web fictive", () => {
  it("arrete chaque signal detache avant remplacement, changement d'etape et pagehide", async () => {
    const user = userEvent.setup();
    renderDemo();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    const listenButton = screen.getByRole("button", {
      name: "Écouter le signal",
    });

    await user.click(listenButton);
    const firstAudio = FakeLessonAudio.instances[0];
    expect(firstAudio?.initialSrc).toBe("/audio/fixture-tone.wav");
    expect(firstAudio?.play).toHaveBeenCalledOnce();

    await user.click(listenButton);
    const secondAudio = FakeLessonAudio.instances[1];
    expect(firstAudio?.pause).toHaveBeenCalledOnce();
    expect(firstAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(firstAudio?.load).toHaveBeenCalledOnce();
    expect(secondAudio?.play).toHaveBeenCalledOnce();

    await user.click(startButton);
    expect(secondAudio?.pause).toHaveBeenCalledOnce();
    expect(secondAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(secondAudio?.load).toHaveBeenCalledOnce();

    await user.click(
      await screen.findByRole("button", { name: "Réécouter le signal" }),
    );
    const thirdAudio = FakeLessonAudio.instances[2];
    expect(thirdAudio?.play).toHaveBeenCalledOnce();

    fireEvent(
      window,
      Object.assign(new Event("pagehide"), { persisted: true }),
    );
    expect(thirdAudio?.pause).toHaveBeenCalledOnce();
    expect(thirdAudio?.removeAttribute).toHaveBeenCalledWith("src");
    expect(thirdAudio?.load).toHaveBeenCalledOnce();
  });

  it("annonce le caractère non publiable et termine une tentative", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    renderDemo({ capture });

    expect(
      screen.getByText("Donnée fictive — non publiable"),
    ).toBeInTheDocument();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Valider" }));

    const result = await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });
    await waitFor(() => expect(result).toHaveFocus());
    expect(screen.getByText("250 ‰")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Écouter A, puis votre prise B." }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "M’enregistrer" })).toBeEnabled();
    await waitFor(() =>
      expect(capture).toHaveBeenCalledWith({
        name: "lesson_completed",
        lessonVersionId: lesson.versionId,
        platform: "web",
      }),
    );
    expect(capture).toHaveBeenCalledWith({
      name: "lesson_started",
      lessonVersionId: lesson.versionId,
      platform: "web",
    });
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "exercise_answered",
        lessonVersionId: lesson.versionId,
        correct: true,
        platform: "web",
      }),
    );
  });

  it("reprend la question et le choix après un démontage", async () => {
    const user = userEvent.setup();
    const first = renderDemo();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option B" }));

    await waitFor(async () => {
      const inspector = new WebLocalExperienceStore();
      const checkpoint = (await inspector.read()).lesson;
      inspector.close();
      expect(checkpoint).toMatchObject({
        phase: "question",
        selectedOptionId: lesson.exercise.options[1]?.id,
      });
    });
    first.unmount();

    renderDemo();
    expect(
      await screen.findByRole("heading", { name: lesson.exercise.prompt }),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: "Option B" })).toBeChecked();
  });

  it("reprend exactement une soumission réservée après crash", async () => {
    const eventId = "30000000-0000-4000-8000-000000000001";
    const deviceId = "40000000-0000-4000-8000-000000000001";
    const startedAt = new Date(Date.now() - 60_000).toISOString();
    const answeredAt = new Date(Date.now() - 1_000).toISOString();
    const selectedOptionId = lesson.exercise.options[0]?.id;
    if (selectedOptionId === undefined) throw new Error("Fixture invalide");

    const checkpointStore = new WebLocalExperienceStore();
    await checkpointStore.update((snapshot) =>
      prepareLocalLessonSubmission(
        selectLocalLessonOption(
          openLocalLessonQuestion(
            startLocalLesson(snapshot, {
              lessonVersionId: lesson.versionId,
              exerciseId: lesson.exercise.id,
              startedAt,
            }),
            startedAt,
          ),
          selectedOptionId,
          answeredAt,
        ),
        {
          eventId,
          deviceId,
          exerciseId: lesson.exercise.id,
          selectedOptionId,
          answeredAt,
          durationMs: 60_000,
          contentVersionId: lesson.versionId,
          algorithmVersion: "srs-v0",
        },
        answeredAt,
      ),
    );
    checkpointStore.close();

    renderDemo();

    expect(
      await screen.findByRole("heading", {
        name: "La boucle technique fonctionne.",
      }),
    ).toBeVisible();
    const outboxInspector = new WebAttemptOutboxStore("thainaute-demo-v1");
    const entries = (await outboxInspector.read()).entries;
    outboxInspector.close();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.submission).toMatchObject({
      eventId,
      deviceId,
      selectedOptionId,
      answeredAt,
    });
  });

  it("mesure une reprise depuis le début durable de la session", async () => {
    const user = userEvent.setup();
    const sessionStartedAt = new Date(Date.now() - 65_000).toISOString();
    const selectedAt = new Date(Date.now() - 1_000).toISOString();
    const selectedOptionId = lesson.exercise.options[0]?.id;
    if (selectedOptionId === undefined) throw new Error("Fixture invalide");

    const checkpointStore = new WebLocalExperienceStore();
    await checkpointStore.update((snapshot) =>
      selectLocalLessonOption(
        openLocalLessonQuestion(
          startLocalLesson(snapshot, {
            lessonVersionId: lesson.versionId,
            exerciseId: lesson.exercise.id,
            startedAt: sessionStartedAt,
          }),
          sessionStartedAt,
        ),
        selectedOptionId,
        selectedAt,
      ),
    );
    checkpointStore.close();

    renderDemo();
    expect(
      await screen.findByRole("heading", { name: lesson.exercise.prompt }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Valider" }));
    await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });

    const outboxInspector = new WebAttemptOutboxStore("thainaute-demo-v1");
    const entries = (await outboxInspector.read()).entries;
    outboxInspector.close();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.submission.durationMs).toBeGreaterThanOrEqual(60_000);
    expect(entries[0]?.submission.durationMs).toBeLessThan(90_000);
  });

  it("ouvre une nouvelle version après la clôture de la précédente", async () => {
    const user = userEvent.setup();
    const firstRender = renderDemo();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });
    await waitFor(async () => {
      const inspector = new WebLocalExperienceStore();
      const checkpoint = (await inspector.read()).lesson;
      inspector.close();
      expect(checkpoint?.phase).toBe("completed");
    });
    firstRender.unmount();

    const nextLesson = {
      ...lesson,
      versionId: "10000000-0000-4000-8000-000000000012",
      title: "Nouvelle boucle technique locale",
      objective: "Vérifier le passage à une nouvelle version.",
      itemId: "10000000-0000-4000-8000-000000000013",
      exercise: {
        ...lesson.exercise,
        id: "10000000-0000-4000-8000-000000000014",
        prompt: "Sélectionnez l’option de la nouvelle version.",
      },
    };
    renderDemo(undefined, nextLesson);

    const nextStartButton = await screen.findByRole("button", {
      name: "Commencer",
    });
    await waitFor(() => expect(nextStartButton).toBeEnabled());
    await user.click(nextStartButton);
    expect(
      await screen.findByRole("heading", {
        name: nextLesson.exercise.prompt,
      }),
    ).toBeVisible();

    const inspector = new WebLocalExperienceStore();
    const checkpoint = (await inspector.read()).lesson;
    inspector.close();
    expect(checkpoint).toMatchObject({
      phase: "question",
      lessonVersionId: nextLesson.versionId,
      exerciseId: nextLesson.exercise.id,
    });
  });

  it("refuse de fusionner le parcours demo avec un propriétaire étranger", async () => {
    await new WebLocalExperienceStore().deleteForTests();
    const foreign = serializeLocalExperienceSnapshot(
      createLocalExperienceSnapshot({
        kind: "account",
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
    );
    const seed = new Dexie("thainaute-local-experience-v1");
    seed.version(1).stores({ snapshots: "&key" });
    await seed.table("snapshots").put({
      key: "local-experience-v1",
      snapshot: foreign,
    });
    seed.close();

    renderDemo();

    expect(await screen.findByText("Journal local indisponible")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Réessayer le stockage" }),
    ).toBeEnabled();
    const inspector = new Dexie("thainaute-local-experience-v1");
    inspector.version(1).stores({ snapshots: "&key" });
    const row = (await inspector
      .table("snapshots")
      .get("local-experience-v1")) as { snapshot: string };
    inspector.close();
    expect(row.snapshot).toBe(foreign);
  });

  it("demande l’onboarding avant une première session directe", async () => {
    await new WebLocalExperienceStore().deleteForTests();

    renderDemo();

    expect(
      await screen.findByRole("link", { name: "Préparer mon parcours" }),
    ).toHaveAttribute("href", "/today");
    expect(
      screen.queryByRole("button", { name: "Commencer" }),
    ).not.toBeInTheDocument();
  });

  it("conserve un ancien journal illisible au lieu de l'écraser", async () => {
    window.localStorage.setItem("thainaute.fixture.attempts.v1", "{invalide");
    renderDemo();

    expect(await screen.findByText("Journal local indisponible")).toBeVisible();
    expect(window.localStorage.getItem("thainaute.fixture.attempts.v1")).toBe(
      "{invalide",
    );
    expect(
      screen.getByRole("button", { name: "Réessayer le stockage" }),
    ).toBeEnabled();
  });

  it("déduplique une double activation et isole l’outbox demo", async () => {
    const user = userEvent.setup();
    const { unmount } = renderDemo();
    const startButton = screen.getByRole("button", { name: "Commencer" });
    await waitFor(() => expect(startButton).toBeEnabled());
    await user.click(startButton);
    await user.click(screen.getByRole("radio", { name: "Option A" }));

    const submit = screen.getByRole("button", { name: "Valider" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await screen.findByRole("heading", {
      name: "La boucle technique fonctionne.",
    });
    unmount();

    const inspector = new WebAttemptOutboxStore("thainaute-demo-v1");
    expect((await inspector.read()).entries).toHaveLength(1);
    await inspector.deleteForTests();
    const learningInspector = new WebAttemptOutboxStore();
    expect((await learningInspector.read()).entries).toHaveLength(0);
    await learningInspector.deleteForTests();
  });
});
