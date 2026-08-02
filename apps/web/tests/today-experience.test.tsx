import {
  beginLocalOnboarding,
  completeLocalOnboarding,
  updateLocalOnboarding,
} from "@thainaute/sync";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TodayExperience } from "../app/today/today-experience";
import { WebLocalExperienceStore } from "../lib/client/local-experience-store";

const lesson = {
  versionId: "10000000-0000-4000-8000-000000000002",
  exerciseId: "10000000-0000-4000-8000-000000000004",
  title: "Boucle technique locale",
  objective: "Vérifier la reprise sans enseigner de contenu.",
};

async function clearExperienceDatabase(): Promise<void> {
  await new WebLocalExperienceStore().deleteForTests();
}

async function seedCompletedOnboarding(): Promise<void> {
  const store = new WebLocalExperienceStore();
  await store.update((snapshot) =>
    completeLocalOnboarding(
      snapshot,
      {
        goalOptionId: "five_minutes",
        motivationOptionId: "travel",
        experienceOptionId: "beginner",
      },
      "2026-08-02T08:00:00.000Z",
    ),
  );
  store.close();
}

beforeEach(async () => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: true,
  });
  await clearExperienceDatabase();
});

afterEach(async () => {
  cleanup();
  await clearExperienceDatabase();
  vi.restoreAllMocks();
});

describe("écran Aujourd’hui web", () => {
  it("termine un onboarding local borné puis affiche une seule action", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    render(<TodayExperience lesson={lesson} analytics={{ capture }} />);

    expect(
      await screen.findByRole("heading", {
        name: "Préparons votre première session.",
      }),
    ).toBeVisible();
    expect(capture).toHaveBeenCalledWith({
      name: "onboarding_started",
      platform: "web",
    });
    expect(
      screen.getByRole("button", { name: "Préparer ma session" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "10 minutes" }));
    await user.click(
      screen.getByRole("radio", { name: "Communiquer au quotidien" }),
    );
    await user.click(
      screen.getByRole("radio", { name: "J’ai quelques bases" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Préparer ma session" }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Une seule étape, bien comprise.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Commencer la session" }),
    ).toHaveAttribute("href", "/learn/demo");
    expect(
      screen
        .getAllByRole("link")
        .filter((link) => link.classList.contains("buttonPrimary")),
    ).toHaveLength(1);
    expect(capture).toHaveBeenCalledWith({
      name: "onboarding_completed",
      platform: "web",
    });

    const inspector = new WebLocalExperienceStore();
    expect((await inspector.read()).onboarding).toMatchObject({
      status: "completed",
      goalOptionId: "ten_minutes",
      motivationOptionId: "daily_life",
      experienceOptionId: "some_basics",
    });
    inspector.close();
  });

  it("restaure l’onboarding sans renvoyer les analytics", async () => {
    await seedCompletedOnboarding();
    const capture = vi.fn();

    render(<TodayExperience lesson={lesson} analytics={{ capture }} />);

    expect(
      await screen.findByRole("heading", {
        name: "Une seule étape, bien comprise.",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Objectif choisi : 5 minutes/u)).toBeVisible();
    expect(capture).not.toHaveBeenCalled();
  });

  it("conserve chaque choix avant la validation finale", async () => {
    const user = userEvent.setup();
    const capture = vi.fn();
    const firstRender = render(
      <TodayExperience lesson={lesson} analytics={{ capture }} />,
    );

    await screen.findByRole("heading", {
      name: "Préparons votre première session.",
    });
    await user.click(screen.getByRole("radio", { name: "10 minutes" }));

    await waitFor(async () => {
      const inspector = new WebLocalExperienceStore();
      const onboarding = (await inspector.read()).onboarding;
      inspector.close();
      expect(onboarding).toMatchObject({
        status: "in_progress",
        goalOptionId: "ten_minutes",
      });
    });
    firstRender.unmount();

    render(<TodayExperience lesson={lesson} analytics={{ capture }} />);

    expect(
      await screen.findByRole("radio", { name: "10 minutes" }),
    ).toBeChecked();
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith({
      name: "onboarding_started",
      platform: "web",
    });
  });

  it("affiche un identifiant inconnu comme un choix neutre et bloque la fin", async () => {
    const store = new WebLocalExperienceStore();
    await store.update((snapshot) =>
      updateLocalOnboarding(
        beginLocalOnboarding(snapshot, "2026-08-02T08:00:00.000Z"),
        {
          goalOptionId: "ancienne_taxonomie",
          motivationOptionId: "travel",
          experienceOptionId: "beginner",
        },
        "2026-08-02T08:00:01.000Z",
      ),
    );
    store.close();

    render(<TodayExperience lesson={lesson} />);

    await screen.findByRole("heading", {
      name: "Préparons votre première session.",
    });
    expect(screen.getByRole("radio", { name: "5 minutes" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "10 minutes" })).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "Préparer ma session" }),
    ).toBeDisabled();
  });

  it("décrit honnêtement les limites hors ligne", async () => {
    await seedCompletedOnboarding();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(<TodayExperience lesson={lesson} />);

    expect(
      await screen.findByText(
        "Hors ligne · les données déjà chargées restent locales",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/Aucun démarrage à froid hors ligne n’est garanti/u),
    ).toBeVisible();
  });

  it("préserve un snapshot cassé et propose seulement de réessayer", async () => {
    const seed = new Dexie("thainaute-local-experience-v1");
    seed.version(1).stores({ snapshots: "&key" });
    await seed.table("snapshots").put({
      key: "local-experience-v1",
      snapshot: "{cassé",
    });
    seed.close();

    render(<TodayExperience lesson={lesson} />);

    expect(
      await screen.findByRole("heading", {
        name: "Vos données existantes sont conservées.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeEnabled();

    const inspector = new Dexie("thainaute-local-experience-v1");
    inspector.version(1).stores({ snapshots: "&key" });
    await waitFor(async () => {
      const row = (await inspector
        .table("snapshots")
        .get("local-experience-v1")) as { snapshot: string };
      expect(row.snapshot).toBe("{cassé");
    });
    inspector.close();
  });
});
