import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  completeLocalOnboarding,
  createLocalExperienceSnapshot,
  localExperienceSnapshotSchema,
  type LocalExperienceSnapshot,
  type LocalLessonCheckpoint,
} from "@thainaute/sync";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "../app/page";
import { PathExperience } from "../app/path/path-experience";
import TodayPage from "../app/today/page";
import { WebLocalExperienceStore } from "../lib/client/local-experience-store";

const lesson = {
  versionId: "10000000-0000-4000-8000-000000000002",
  exerciseId: "10000000-0000-4000-8000-000000000004",
  title: "Boucle technique locale",
  objective: "Vérifier la reprise sans enseigner de contenu.",
};

const OTHER_LESSON_VERSION_ID = "30000000-0000-4000-8000-000000000001";
const OTHER_EXERCISE_ID = "30000000-0000-4000-8000-000000000002";

function completedOnboardingSnapshot(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "five_minutes",
      motivationOptionId: "travel",
      experienceOptionId: "beginner",
    },
    "2026-08-02T08:00:00.000Z",
  );
}

function checkpointFor(
  phase: LocalLessonCheckpoint["phase"],
  conflicting = false,
): LocalLessonCheckpoint {
  const lessonVersionId = conflicting
    ? OTHER_LESSON_VERSION_ID
    : lesson.versionId;
  const exerciseId = conflicting ? OTHER_EXERCISE_ID : lesson.exerciseId;
  const base = {
    lessonVersionId,
    exerciseId,
    sessionStartedAt: "2026-08-02T08:00:00.000Z",
  } as const;
  const submission = {
    eventId: "40000000-0000-4000-8000-000000000001",
    deviceId: "40000000-0000-4000-8000-000000000002",
    exerciseId,
    selectedOptionId: "20000000-0000-4000-8000-000000000001",
    answeredAt: "2026-08-02T08:01:00.000Z",
    durationMs: 1_000,
    contentVersionId: lessonVersionId,
    algorithmVersion: "srs-v0" as const,
  };

  switch (phase) {
    case "intro":
      return { phase, ...base, updatedAt: base.sessionStartedAt };
    case "question":
      return {
        phase,
        ...base,
        selectedOptionId: null,
        draftAnswer: null,
        missedOnce: false,
        updatedAt: "2026-08-02T08:00:30.000Z",
      };
    case "submitting":
      return {
        phase,
        ...base,
        submission,
        updatedAt: submission.answeredAt,
      };
    case "result":
      return {
        phase,
        ...base,
        submission,
        updatedAt: "2026-08-02T08:02:00.000Z",
      };
    case "completed": {
      const completedAt = "2026-08-02T08:03:00.000Z";
      return {
        phase,
        ...base,
        submission,
        completedAt,
        updatedAt: completedAt,
      };
    }
  }
}

function snapshotWithCheckpoint(
  phase: LocalLessonCheckpoint["phase"],
  conflicting = false,
): LocalExperienceSnapshot {
  return localExperienceSnapshotSchema.parse({
    ...completedOnboardingSnapshot(),
    owner: ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
    lesson: checkpointFor(phase, conflicting),
  });
}

async function seedSnapshot(snapshot: LocalExperienceSnapshot): Promise<void> {
  const store = new WebLocalExperienceStore();
  await store.update(() => snapshot);
  store.close();
}

async function clearExperienceDatabase(): Promise<void> {
  await new WebLocalExperienceStore().deleteForTests();
}

beforeEach(async () => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "visible",
  });
  await clearExperienceDatabase();
});

afterEach(async () => {
  cleanup();
  await clearExperienceDatabase();
  vi.restoreAllMocks();
});

describe("écran Parcours web", () => {
  const states: readonly {
    readonly name: string;
    readonly snapshot: () => LocalExperienceSnapshot;
    readonly statusLabel: string;
    readonly actionLabel: string;
    readonly actionHref: string;
    readonly progress: "0" | "100";
  }[] = [
    {
      name: "onboarding requis",
      snapshot: createLocalExperienceSnapshot,
      statusLabel: "Préférences à choisir",
      actionLabel: "Configurer ma session",
      actionHref: "/today",
      progress: "0",
    },
    {
      name: "unité disponible",
      snapshot: completedOnboardingSnapshot,
      statusLabel: "Prête à commencer",
      actionLabel: "Préparer la session",
      actionHref: "/today",
      progress: "0",
    },
    {
      name: "unité en cours",
      snapshot: () => snapshotWithCheckpoint("question"),
      statusLabel: "Exercice en cours",
      actionLabel: "Reprendre la démonstration",
      actionHref: "/learn/demo",
      progress: "0",
    },
    {
      name: "résultat prêt",
      snapshot: () => snapshotWithCheckpoint("result"),
      statusLabel: "Résultat prêt à consulter",
      actionLabel: "Consulter le résultat",
      actionHref: "/learn/demo",
      progress: "0",
    },
    {
      name: "unité terminée",
      snapshot: () => snapshotWithCheckpoint("completed"),
      statusLabel: "Étape technique terminée",
      actionLabel: "Revoir la démonstration",
      actionHref: "/learn/demo",
      progress: "100",
    },
    {
      name: "conflit de version",
      snapshot: () => snapshotWithCheckpoint("question", true),
      statusLabel: "Version précédente détectée",
      actionLabel: "Traiter la version précédente",
      actionHref: "/learn/demo",
      progress: "0",
    },
  ];

  it.each(states)(
    "affiche l’état $name sans inventer de progression",
    async ({ snapshot, statusLabel, actionLabel, actionHref, progress }) => {
      await seedSnapshot(snapshot());

      render(<PathExperience lesson={lesson} />);

      expect(
        await screen.findByRole("heading", {
          name: "Votre progression, sans faux contenu.",
        }),
      ).toBeVisible();
      expect(screen.getByText(statusLabel)).toBeVisible();
      expect(screen.getByRole("link", { name: actionLabel })).toHaveAttribute(
        "href",
        actionHref,
      );
      expect(
        screen.getByRole("progressbar", {
          name: "Progression de l’unité technique",
        }),
      ).toHaveAttribute("value", progress);
      expect(screen.getByText("DONNÉE FICTIVE · NON PUBLIABLE")).toBeVisible();
      expect(
        screen.getByRole("heading", {
          name: "Les prochaines unités ne sont pas inventées.",
        }),
      ).toBeVisible();
      expect(
        screen
          .getAllByRole("link")
          .filter((link) => link.className.includes("primary")),
      ).toHaveLength(1);
    },
  );

  it.each([
    ["intro", "Présentation ouverte"],
    ["question", "Exercice en cours"],
    ["submitting", "Tentative locale à finaliser"],
  ] as const)(
    "rend le checkpoint %s compréhensible",
    async (phase, statusLabel) => {
      await seedSnapshot(snapshotWithCheckpoint(phase));

      render(<PathExperience lesson={lesson} />);

      expect(await screen.findByText(statusLabel)).toBeVisible();
    },
  );

  it("annonce un chargement qui ne modifie aucune donnée", () => {
    vi.spyOn(WebLocalExperienceStore.prototype, "read").mockReturnValue(
      new Promise(() => undefined),
    );

    render(<PathExperience lesson={lesson} />);

    expect(
      screen.getByRole("heading", {
        name: "Lecture de votre progression locale…",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Aucune donnée existante n’est modifiée pendant ce chargement.",
      ),
    ).toBeVisible();
  });

  it("relit au focus et ignore la première lecture lorsqu’elle revient plus tard", async () => {
    let resolveFirstRead!: (snapshot: LocalExperienceSnapshot) => void;
    const firstRead = new Promise<LocalExperienceSnapshot>((resolve) => {
      resolveFirstRead = resolve;
    });
    const readSpy = vi
      .spyOn(WebLocalExperienceStore.prototype, "read")
      .mockReturnValueOnce(firstRead)
      .mockResolvedValueOnce(snapshotWithCheckpoint("completed"));

    render(<PathExperience lesson={lesson} />);
    await waitFor(() => expect(readSpy).toHaveBeenCalledOnce());

    act(() => window.dispatchEvent(new Event("focus")));

    expect(await screen.findByText("Étape technique terminée")).toBeVisible();
    expect(readSpy).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveFirstRead(completedOnboardingSnapshot());
      await firstRead;
    });

    expect(screen.getByText("Étape technique terminée")).toBeVisible();
    expect(screen.queryByText("Prête à commencer")).not.toBeInTheDocument();
  });

  it("relit seulement lorsque le document redevient visible", async () => {
    const readSpy = vi
      .spyOn(WebLocalExperienceStore.prototype, "read")
      .mockResolvedValueOnce(completedOnboardingSnapshot())
      .mockResolvedValueOnce(snapshotWithCheckpoint("completed"));

    render(<PathExperience lesson={lesson} />);
    expect(await screen.findByText("Prête à commencer")).toBeVisible();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(readSpy).toHaveBeenCalledOnce();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));

    expect(await screen.findByText("Étape technique terminée")).toBeVisible();
    expect(readSpy).toHaveBeenCalledTimes(2);
  });

  it("invalide aussi une ancienne lecture avant un nouvel essai", async () => {
    let resolveFirstRead!: (snapshot: LocalExperienceSnapshot) => void;
    const firstRead = new Promise<LocalExperienceSnapshot>((resolve) => {
      resolveFirstRead = resolve;
    });
    const readSpy = vi
      .spyOn(WebLocalExperienceStore.prototype, "read")
      .mockReturnValueOnce(firstRead)
      .mockRejectedValueOnce(new Error("lecture au focus impossible"))
      .mockResolvedValueOnce(snapshotWithCheckpoint("completed"));
    const user = userEvent.setup();

    render(<PathExperience lesson={lesson} />);
    await waitFor(() => expect(readSpy).toHaveBeenCalledOnce());
    act(() => window.dispatchEvent(new Event("focus")));

    await screen.findByRole("heading", {
      name: "Votre parcours existant reste intact.",
    });
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("Étape technique terminée")).toBeVisible();
    expect(readSpy).toHaveBeenCalledTimes(3);

    await act(async () => {
      resolveFirstRead(completedOnboardingSnapshot());
      await firstRead;
    });

    expect(screen.getByText("Étape technique terminée")).toBeVisible();
    expect(screen.queryByText("Prête à commencer")).not.toBeInTheDocument();
  });

  it("préserve un snapshot illisible, place le focus et permet de réessayer", async () => {
    const seed = new Dexie("thainaute-local-experience-v1");
    seed.version(1).stores({ snapshots: "&key" });
    await seed.table("snapshots").put({
      key: "local-experience-v1",
      snapshot: "{cassé",
    });
    seed.close();
    const readSpy = vi.spyOn(WebLocalExperienceStore.prototype, "read");
    const user = userEvent.setup();

    render(<PathExperience lesson={lesson} />);

    const heading = await screen.findByRole("heading", {
      name: "Votre parcours existant reste intact.",
    });
    await waitFor(() => expect(heading).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(readSpy).toHaveBeenCalledTimes(2));

    const inspector = new Dexie("thainaute-local-experience-v1");
    inspector.version(1).stores({ snapshots: "&key" });
    const row = (await inspector
      .table("snapshots")
      .get("local-experience-v1")) as { snapshot: string };
    expect(row.snapshot).toBe("{cassé");
    inspector.close();
  });

  it("décrit honnêtement la limite hors ligne", async () => {
    await seedSnapshot(completedOnboardingSnapshot());
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(<PathExperience lesson={lesson} />);

    expect(
      await screen.findByText("Hors ligne · progression lue sur cet appareil"),
    ).toBeVisible();
    expect(
      screen.getByText(/exige que ses ressources aient déjà été chargées/u),
    ).toBeVisible();
  });

  it("rend le parcours accessible depuis l’accueil et Aujourd’hui", () => {
    const home = render(<HomePage />);
    expect(screen.getByRole("link", { name: "Parcours" })).toHaveAttribute(
      "href",
      "/path",
    );
    home.unmount();

    render(<TodayPage />);
    expect(screen.getByRole("link", { name: "Parcours" })).toHaveAttribute(
      "href",
      "/path",
    );
  });
});
