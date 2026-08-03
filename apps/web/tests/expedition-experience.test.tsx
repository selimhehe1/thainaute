import type { AnalyticsSink } from "@thainaute/analytics";
import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import {
  completeLocalOnboarding,
  recordLocalExpeditionResult,
  startLocalExpedition,
  startLocalLesson,
} from "@thainaute/sync";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExpeditionExperience } from "../app/learn/demo/expedition-experience";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";
import { WebAuthSessionProvider } from "../lib/client/auth-session";
import { WebLocalExperienceStore } from "../lib/client/local-experience-store";

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const { lesson } = readFiveMechanicsFixtureBundle();
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

function renderExpedition(analytics?: AnalyticsSink) {
  return render(
    <WebAuthSessionProvider>
      <ExpeditionExperience
        lesson={lesson}
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
