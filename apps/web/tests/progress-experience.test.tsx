import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import { SRS_ALGORITHM_VERSION, type AttemptRating } from "@thainaute/domain";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ProgressExperience } from "../app/progress/progress-experience";
import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";

const { lesson } = readFiveMechanicsFixtureBundle();
const STORAGE = "thainaute-progress-test";

function ecoute() {
  const exercise = lesson.exercises.find(
    (candidate) => candidate.type === "audio_choice",
  );
  if (exercise?.type !== "audio_choice") throw new Error("Fixture absente.");
  return exercise;
}

beforeEach(async () => {
  await new WebAttemptOutboxStore(STORAGE).deleteForTests();
});

afterEach(async () => {
  cleanup();
  await new WebAttemptOutboxStore(STORAGE).deleteForTests();
});

async function semerUneReussite(rating: AttemptRating) {
  const store = new WebAttemptOutboxStore(STORAGE);
  const deviceId = await store.getOrCreateDeviceId(
    () => "40000000-0000-4000-8000-000000000001",
  );
  const exercise = ecoute();
  await store.enqueue({
    eventId: "30000000-0000-4000-8000-0000000000d1",
    deviceId,
    exerciseId: exercise.id,
    selectedOptionId:
      rating === 1
        ? exercise.correctOptionId
        : (exercise.options.find(({ id }) => id !== exercise.correctOptionId)
            ?.id ?? exercise.correctOptionId),
    answeredAt: new Date().toISOString(),
    durationMs: 1_000,
    contentVersionId: lesson.versionId,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  });
  store.close();
}

describe("écran Progrès", () => {
  it("invite à commencer tant qu'aucune tentative n'existe", async () => {
    render(<ProgressExperience lessons={[lesson]} storageKey={STORAGE} />);

    await screen.findByRole("heading", { name: "Votre carte commence ici." });
    expect(
      screen.getByRole("link", { name: "Commencer une séance" }),
    ).toBeInTheDocument();
  });

  it("montre la maîtrise réelle après une réussite", async () => {
    await semerUneReussite(1);

    render(<ProgressExperience lessons={[lesson]} storageKey={STORAGE} />);

    await screen.findByRole("heading", { name: "Ce que vous avez appris." });
    const barre = screen.getByRole("progressbar");
    // La valeur est portée par le rôle, pas seulement par la longueur de la
    // barre : sans cela, un lecteur d'écran n'apprendrait rien.
    expect(Number(barre.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
    expect(screen.getByText("Réussites").nextSibling).toHaveTextContent("1");
  });

  it("dit honnêtement que la progression reste dans ce navigateur", async () => {
    render(<ProgressExperience lessons={[lesson]} storageKey={STORAGE} />);

    await screen.findByRole("heading", { name: "Votre carte commence ici." });
    expect(
      screen.getByText(/reste dans ce navigateur|vit dans ce navigateur/u),
    ).toBeInTheDocument();
  });
});
