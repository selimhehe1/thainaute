import { describe, expect, it } from "vitest";

import { buildLessonProgress } from "../lib/server/lesson-progress/service";
import { verifyPublishedBundleRow } from "../lib/server/content-delivery/verified-bundle";
import {
  makePublishableBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

function verifiedFixture() {
  const bundle = makePublishableBundle();
  const verified = verifyPublishedBundleRow(makePublishedLessonRow(bundle));
  if (verified === null) throw new Error("Fixture publiée invalide.");
  const exercise = bundle.lesson.exercises[0];
  if (exercise?.type !== "audio_choice") {
    throw new Error("Exercice fixture manquant.");
  }
  return { verified, exercise };
}

describe("projection publique d'une leçon connectée", () => {
  it("projette une maîtrise existante sans révéler itemId", () => {
    const { verified, exercise } = verifiedFixture();
    const response = buildLessonProgress({
      verified,
      snapshot: {
        syncRevision: 7,
        states: [
          {
            itemId: exercise.itemId,
            skill: exercise.skill,
            masteryPermille: 750,
            status: "confirmed",
            attemptCount: 3,
            successfulAttempts: 3,
            consecutiveCorrect: 3,
            dueAt: "2026-08-08T10:00:00.000Z",
            algorithmVersion: "srs-v0",
          },
        ],
      },
    });

    expect(response).toEqual({
      schemaVersion: 1,
      lessonVersionId: verified.bundle.lesson.versionId,
      syncRevision: 7,
      exercises: [
        {
          exerciseId: exercise.id,
          skill: "listening",
          masteryPermille: 750,
          status: "confirmed",
          attemptCount: 3,
          successfulAttempts: 3,
          consecutiveCorrect: 3,
          dueAt: "2026-08-08T10:00:00.000Z",
          algorithmVersion: "srs-v0",
        },
      ],
    });
    expect(JSON.stringify(response)).not.toContain(exercise.itemId);
    expect(JSON.stringify(response)).not.toContain("translationFr");
  });

  it("retourne un état initial explicite sans inventer d'échéance", () => {
    const { verified, exercise } = verifiedFixture();
    const response = buildLessonProgress({
      verified,
      snapshot: { syncRevision: 0, states: [] },
    });

    expect(response.exercises).toEqual([
      {
        exerciseId: exercise.id,
        skill: "listening",
        masteryPermille: 0,
        status: "new",
        attemptCount: 0,
        successfulAttempts: 0,
        consecutiveCorrect: 0,
        dueAt: null,
        algorithmVersion: "srs-v0",
      },
    ]);
  });
});
