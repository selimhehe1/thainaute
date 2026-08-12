import type { AnalyticsSink } from "@thainaute/analytics";
import {
  readCompiledLessonBundle,
  readFiveMechanicsFixtureBundle,
} from "@thainaute/content";
import {
  attemptSubmissionSchema,
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  selectLocalLessonOption,
  recordLocalExpeditionResult,
  startLocalExpedition,
  startLocalLesson,
} from "@thainaute/sync";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExpeditionExperience } from "../app/learn/demo/expedition-experience";
import {
  WebAttemptOutboxStore,
  type LegacyDemoFixtureMigrationOperation,
  type LegacyDemoFixtureMigrationResult,
} from "../lib/client/attempt-outbox-store";
import { WebAuthSessionProvider } from "../lib/client/auth-session";
import { WebLocalExperienceStore } from "../lib/client/local-experience-store";

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const { lesson } = readFiveMechanicsFixtureBundle();
const dialogueLesson = readCompiledLessonBundle("u01-l1e")?.lesson;
const OLD_FIXTURE_LESSON_ID = "10000000-0000-4000-8000-000000000002";
const OLD_FIXTURE_EXERCISE_ID = "10000000-0000-4000-8000-000000000004";

class FakeLessonAudio {
  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public readonly load = vi.fn();
  public readonly pause = vi.fn();
  public readonly play = vi.fn(() => Promise.resolve());
  public readonly removeAttribute = vi.fn();
}

const NativeAudio = globalThis.Audio;
const nativeMatchMedia = window.matchMedia;

function renderExpedition(
  analytics?: AnalyticsSink,
  lessonOverride = lesson,
  storageHydrationTimeoutMs?: number,
  storageMigrationFactory?: () => LegacyDemoFixtureMigrationOperation,
) {
  return render(
    <WebAuthSessionProvider>
      <ExpeditionExperience
        lesson={lessonOverride}
        {...(analytics === undefined ? {} : { analytics })}
        {...(storageHydrationTimeoutMs === undefined
          ? {}
          : { storageHydrationTimeoutMs })}
        {...(storageMigrationFactory === undefined
          ? {}
          : { storageMigrationFactory })}
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
  routerPush.mockReset();
  Object.defineProperty(globalThis, "Audio", {
    configurable: true,
    value: FakeLessonAudio as unknown as typeof Audio,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
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
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: nativeMatchMedia,
  });
  window.localStorage.clear();
  vi.restoreAllMocks();
  await new WebAttemptOutboxStore("thainaute-demo-v1").deleteForTests();
  await new WebLocalExperienceStore().deleteForTests();
});

async function passListeningCard(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(/Écoute · exercice 1 sur 5/u);
  await user.click(screen.getByRole("radio", { name: "Signal technique A" }));
  await user.click(screen.getByRole("button", { name: "Valider" }));
  await screen.findByRole("heading", {
    name: "La mécanique d’écoute fonctionne.",
  });
  await user.click(screen.getByRole("button", { name: "Continuer" }));
}

async function passAssociationCard(
  user: ReturnType<typeof userEvent.setup>,
  { failFirst = false } = {},
) {
  await screen.findByText(/Association · exercice 2 sur 5/u);
  if (failFirst) {
    await user.click(screen.getByRole("button", { name: "ก่" }));
    await user.click(
      screen.getByRole("button", { name: "Signal technique B" }),
    );
    await screen.findByText(
      "Cette étiquette appartient à un autre caractère. Réessayez.",
    );
  }
  await user.click(screen.getByRole("button", { name: "ก่" }));
  await user.click(screen.getByRole("button", { name: "Signal technique A" }));
  await user.click(screen.getByRole("button", { name: "ก้" }));
  await user.click(screen.getByRole("button", { name: "Signal technique B" }));
  await screen.findByText(failFirst ? "À revoir" : "Juste");
  await user.click(screen.getByRole("button", { name: "Continuer" }));
}

async function passWordOrderCard(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(/Ordre des mots · exercice 3 sur 5/u);
  await user.click(
    screen.getByRole("button", { name: "Déplacer ก่ dans la réponse" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Déplacer ก้ dans la réponse" }),
  );
  await user.click(screen.getByRole("button", { name: "Valider" }));
  await screen.findByRole("heading", {
    name: "La mécanique d’ordre fonctionne.",
  });
  await user.click(screen.getByRole("button", { name: "Continuer" }));
}

async function passRecallCard(
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) {
  await screen.findByText(/Rappel · exercice 4 sur 5/u);
  await user.type(
    screen.getByRole("textbox", { name: "Votre réponse" }),
    value,
  );
  await user.click(screen.getByRole("button", { name: "Valider" }));
  await screen.findByRole("heading", {
    name: "La mécanique de rappel fonctionne.",
  });
  await user.click(screen.getByRole("button", { name: "Continuer" }));
}

async function passReadingCard(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(/Lecture · exercice 5 sur 5/u);
  await user.click(screen.getByRole("radio", { name: "Signal technique A" }));
  await user.click(screen.getByRole("button", { name: "Valider" }));
  await screen.findByRole("heading", {
    name: "La mécanique de lecture fonctionne.",
  });
  await user.click(screen.getByRole("button", { name: "Continuer" }));
}

describe("lecteur Expédition", () => {
  it("ferme toute la génération expirée et ignore sa reprise tardive après retry", async () => {
    let resolveFirstMigration: (() => void) | undefined;
    const firstMigration = new Promise<LegacyDemoFixtureMigrationResult>(
      (resolve) => {
        resolveFirstMigration = () =>
          resolve({
            status: "not_needed",
            copiedEntries: 0,
            deduplicatedEntries: 0,
          });
      },
    );
    const closeFirstMigration = vi.fn();
    const closeRetryMigration = vi.fn();
    const startMigration = vi
      .fn<() => LegacyDemoFixtureMigrationOperation>()
      .mockReturnValueOnce({
        promise: firstMigration,
        close: closeFirstMigration,
      })
      .mockReturnValueOnce({
        promise: Promise.resolve({
          status: "not_needed",
          copiedEntries: 0,
          deduplicatedEntries: 0,
        }),
        close: closeRetryMigration,
      });
    const read = vi
      .spyOn(WebAttemptOutboxStore.prototype, "read")
      .mockResolvedValue(createAttemptOutboxSnapshot());
    const closeOutbox = vi.spyOn(WebAttemptOutboxStore.prototype, "close");
    const closeExperience = vi.spyOn(
      WebLocalExperienceStore.prototype,
      "close",
    );
    const user = userEvent.setup();

    renderExpedition(undefined, lesson, 100, startMigration);
    await screen.findByRole("heading", {
      name: "Vos réponses ne peuvent pas être enregistrées.",
    });
    expect(closeFirstMigration).toHaveBeenCalledOnce();
    expect(closeOutbox).toHaveBeenCalled();
    expect(closeExperience).toHaveBeenCalled();
    expect(read).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Réessayer le stockage" }),
    );
    await screen.findByRole("button", { name: "Commencer l’expédition" });
    expect(startMigration).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenCalledOnce();

    resolveFirstMigration?.();
    await firstMigration;
    await Promise.resolve();
    expect(read).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Commencer l’expédition" }),
    ).toBeInTheDocument();
    expect(closeRetryMigration).not.toHaveBeenCalled();
  });

  it("rend les pages de cours réelles sans afficher les marqueurs Markdown", async () => {
    if (dialogueLesson === undefined) {
      throw new Error("Leçon réelle u01-l1e absente du registre.");
    }
    const user = userEvent.setup();
    renderExpedition(undefined, dialogueLesson);

    await screen.findByText(/sawàtdii/u);
    expect(screen.getByText("dii")).toBeInTheDocument();

    for (let page = 0; page < 4; page += 1) {
      await user.click(screen.getByRole("button", { name: "Page suivante" }));
    }

    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("joue les cinq mécaniques puis clôt la séance", async () => {
    const user = userEvent.setup();
    renderExpedition();

    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);
    await passAssociationCard(user);
    await passWordOrderCard(user);
    // Espaces volontaires : la politique de normalisation doit les absorber.
    await passRecallCard(user, " ก่ ");
    await passReadingCard(user);

    await screen.findByRole("heading", {
      name: "La courbe de la séance est complète.",
    });
    expect(screen.getAllByText("Juste")).toHaveLength(5);
    expect(screen.getByText("250 ‰")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Terminer la séance" }),
    );
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/today"));
  }, 20_000);

  it("consigne les cinq mécaniques dans le journal durable, pas seulement l’écoute", async () => {
    const user = userEvent.setup();
    renderExpedition();

    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);
    await passAssociationCard(user);
    await passWordOrderCard(user);
    await passRecallCard(user, " ก่ ");
    await passReadingCard(user);
    await screen.findByRole("heading", {
      name: "La courbe de la séance est complète.",
    });

    const store = new WebAttemptOutboxStore("thainaute-demo-v1");
    const durable = await store.read();
    store.close();

    // Une tentative par exercice : avant, quatre sur cinq n'atteignaient
    // jamais le journal et donc jamais le serveur.
    expect(durable.entries).toHaveLength(5);
    expect(
      durable.entries.map(({ submission }) => submission.exerciseId).sort(),
    ).toStrictEqual(lesson.exercises.map(({ id }) => id).sort());

    const byExercise = new Map(
      durable.entries.map(({ submission }) => [
        submission.exerciseId,
        submission,
      ]),
    );
    for (const exercise of lesson.exercises) {
      const submission = byExercise.get(exercise.id);
      if (exercise.type === "audio_choice" || exercise.type === "reading") {
        expect(submission?.selectedOptionId).toBe(exercise.correctOptionId);
        expect(submission?.answer).toBeUndefined();
      } else {
        expect(submission?.answer?.kind).toBe(exercise.type);
        expect(submission?.selectedOptionId).toBeUndefined();
      }
    }
  }, 30_000);

  it("affiche la maîtrise de chaque mécanique, plus seulement celle de l’écoute", async () => {
    const user = userEvent.setup();
    renderExpedition();

    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);
    await passAssociationCard(user);
    await passWordOrderCard(user);
    await passRecallCard(user, " ก่ ");
    await passReadingCard(user);
    await screen.findByRole("heading", {
      name: "La courbe de la séance est complète.",
    });

    // Cinq lignes portent une maîtrise chiffrée. Aucune ne reste « à
    // calculer », qui était le sort de quatre exercices sur cinq.
    expect(screen.getAllByText(/^Maîtrise \d+ ‰$/u)).toHaveLength(5);
    expect(screen.queryByText("Maîtrise à calculer")).not.toBeInTheDocument();
    expect(screen.queryByText("À calculer")).not.toBeInTheDocument();
  }, 30_000);

  it("consigne une erreur d’association sans punir", async () => {
    const user = userEvent.setup();
    renderExpedition();

    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);
    await passAssociationCard(user, { failFirst: true });
    await screen.findByText(/Ordre des mots · exercice 3 sur 5/u);
  }, 20_000);

  it("reprend l'expédition là où elle s'est arrêtée", async () => {
    const store = new WebLocalExperienceStore();
    await store.update((snapshot) => {
      let next = startLocalExpedition(snapshot, {
        lessonVersionId: lesson.versionId,
        exerciseIds: lesson.exercises.map(({ id }) => id),
        startedAt: "2026-08-02T09:00:00.000Z",
      });
      next = recordLocalExpeditionResult(next, {
        exerciseId: lesson.exercises[0]?.id ?? "",
        rating: 1,
        answeredAt: "2026-08-02T09:01:00.000Z",
      });
      return recordLocalExpeditionResult(next, {
        exerciseId: lesson.exercises[1]?.id ?? "",
        rating: 0,
        answeredAt: "2026-08-02T09:02:00.000Z",
      });
    });
    store.close();

    renderExpedition();
    await screen.findByText(/Ordre des mots · exercice 3 sur 5/u);
  });

  it("protège une ancienne session mono-exercice par double confirmation", async () => {
    const user = userEvent.setup();
    const store = new WebLocalExperienceStore();
    await store.update((snapshot) =>
      startLocalLesson(snapshot, {
        lessonVersionId: OLD_FIXTURE_LESSON_ID,
        exerciseId: OLD_FIXTURE_EXERCISE_ID,
        startedAt: "2026-08-02T09:00:00.000Z",
      }),
    );
    store.close();

    renderExpedition();
    await screen.findByRole("heading", {
      name: "Une session précédente est encore conservée.",
    });
    await user.click(
      screen.getByRole("button", { name: "Abandonner cette ancienne session" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Confirmer l’abandon et démarrer",
      }),
    );
    await screen.findByRole("button", { name: "Commencer l’expédition" });
  });
});

describe("reprise durable du lecteur", () => {
  async function seedInterruptedListeningAttempt(): Promise<void> {
    const listening = lesson.exercises[0];
    if (listening?.type !== "audio_choice") {
      throw new Error("Fixture d'écoute manquante.");
    }
    const outboxStore = new WebAttemptOutboxStore("thainaute-demo-v1");
    const deviceId = await outboxStore.getOrCreateDeviceId(
      () => "40000000-0000-4000-8000-0000000000aa",
    );
    const submission = attemptSubmissionSchema.parse({
      eventId: "40000000-0000-4000-8000-0000000000bb",
      deviceId,
      exerciseId: listening.id,
      // Réponse fausse : la reprise doit consigner un échec, pas un succès.
      selectedOptionId: listening.options[1]?.id,
      answeredAt: "2026-08-03T09:00:00.000Z",
      durationMs: 1_500,
      contentVersionId: lesson.versionId,
      algorithmVersion: "srs-v0",
    });
    const outbox = await outboxStore.enqueue(submission);
    outboxStore.close();

    const experienceStore = new WebLocalExperienceStore();
    await experienceStore.update((snapshot) => {
      let next = startLocalExpedition(snapshot, {
        lessonVersionId: lesson.versionId,
        exerciseIds: lesson.exercises.map(({ id }) => id),
        startedAt: "2026-08-03T08:59:00.000Z",
      });
      next = startLocalLesson(next, {
        lessonVersionId: lesson.versionId,
        exerciseId: listening.id,
        startedAt: "2026-08-03T08:59:30.000Z",
      });
      next = openLocalLessonQuestion(next, "2026-08-03T08:59:40.000Z");
      next = selectLocalLessonOption(
        next,
        submission.selectedOptionId ?? "",
        "2026-08-03T08:59:50.000Z",
      );
      next = prepareLocalLessonSubmission(
        next,
        submission,
        "2026-08-03T09:00:00.000Z",
      );
      // Le processus meurt ici : la tentative est durable, jamais consignée.
      return confirmLocalLessonResult(next, outbox, "2026-08-03T09:00:01.000Z");
    });
    experienceStore.close();
  }

  it("rejoue la correction jamais montrée puis reprend le plan", async () => {
    const user = userEvent.setup();
    await seedInterruptedListeningAttempt();
    renderExpedition();

    // La correction perdue par le crash est présentée, pas sautée.
    await screen.findByRole("heading", {
      name: "Réécoutez le signal et choisissez l’étiquette A.",
    });
    expect(screen.getByText("À revoir")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await screen.findByText(/Association · exercice 2 sur 5/u);
  });

  it("ne consigne le résultat rejoué qu'une seule fois", async () => {
    await seedInterruptedListeningAttempt();
    const first = renderExpedition();
    await screen.findByRole("heading", {
      name: "Réécoutez le signal et choisissez l’étiquette A.",
    });
    first.unmount();

    // Au remontage l'exercice est déjà consigné : le lecteur enchaîne au
    // lieu de rejouer la correction, et surtout il ne note pas deux fois.
    renderExpedition();
    await screen.findByText(/Association · exercice 2 sur 5/u);

    const store = new WebLocalExperienceStore();
    const snapshot = await store.read();
    store.close();
    expect(snapshot.expedition?.results).toHaveLength(1);
    expect(snapshot.expedition?.results[0]?.rating).toBe(0);
  });
});

describe("mesure et rythme du lecteur", () => {
  it("émet les événements de séance sans texte libre", async () => {
    const user = userEvent.setup();
    const captured: { name: string }[] = [];
    renderExpedition({
      capture: (event) => {
        captured.push(event as { name: string });
      },
    });

    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);

    expect(captured.map(({ name }) => name)).toEqual([
      "lesson_started",
      "exercise_answered",
    ]);
    expect(captured[1]).toMatchObject({
      exerciseType: "audio_choice",
      correct: true,
      platform: "web",
    });
  }, 20_000);

  it("laisse toujours la main pour continuer, sans dépendre de l'auto-avance", async () => {
    const user = userEvent.setup();
    renderExpedition();
    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await screen.findByText(/Écoute · exercice 1 sur 5/u);
    await user.click(screen.getByRole("radio", { name: "Signal technique A" }));
    await user.click(screen.getByRole("button", { name: "Valider" }));

    // Mouvement réduit : aucune avance automatique, mais une sortie explicite.
    await screen.findByRole("button", { name: "Continuer" });
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    expect(
      screen.getByRole("heading", {
        name: "La mécanique d’écoute fonctionne.",
      }),
    ).toBeInTheDocument();
  }, 20_000);
});

describe("intégrité de la note après rechargement", () => {
  it("garde l'erreur d'association : un rechargement ne blanchit pas la faute", async () => {
    const user = userEvent.setup();
    const first = renderExpedition();
    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);

    // Une première erreur, puis l'onglet meurt avant la fin de la carte.
    await screen.findByText(/Association · exercice 2 sur 5/u);
    await user.click(screen.getByRole("button", { name: "ก่" }));
    await user.click(
      screen.getByRole("button", { name: "Signal technique B" }),
    );
    await screen.findByText(
      "Cette étiquette appartient à un autre caractère. Réessayez.",
    );
    first.unmount();

    // Après reprise, l'apparié parfait ne doit pas effacer la faute.
    renderExpedition();
    await screen.findByText(/Association · exercice 2 sur 5/u);
    await user.click(await screen.findByRole("button", { name: "ก่" }));
    await user.click(
      screen.getByRole("button", { name: "Signal technique A" }),
    );
    await user.click(screen.getByRole("button", { name: "ก้" }));
    await user.click(
      screen.getByRole("button", { name: "Signal technique B" }),
    );

    await screen.findByText("À revoir");
    const store = new WebLocalExperienceStore();
    const snapshot = await store.read();
    store.close();
    const association = lesson.exercises[1];
    expect(
      snapshot.expedition?.results.find(
        ({ exerciseId }) => exerciseId === association?.id,
      )?.rating,
    ).toBe(0);
  }, 30_000);

  it("restitue les jetons déjà posés après un rechargement", async () => {
    const user = userEvent.setup();
    const first = renderExpedition();
    await user.click(
      await screen.findByRole("button", { name: "Commencer l’expédition" }),
    );
    await passListeningCard(user);
    await passAssociationCard(user);

    await screen.findByText(/Ordre des mots · exercice 3 sur 5/u);
    await user.click(
      screen.getByRole("button", { name: "Déplacer ก่ dans la réponse" }),
    );
    await screen.findByRole("button", { name: "Retirer ก่ de la réponse" });
    first.unmount();

    renderExpedition();
    await screen.findByText(/Ordre des mots · exercice 3 sur 5/u);
    await screen.findByRole("button", { name: "Retirer ก่ de la réponse" });
  }, 30_000);
});
