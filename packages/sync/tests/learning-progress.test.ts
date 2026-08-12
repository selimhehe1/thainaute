import { fiveMechanicsFixtureLesson } from "@thainaute/content/fixture";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import { describe, expect, it } from "vitest";

import {
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  projectLearningProgress,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "../src";

const DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const MAINTENANT = "2026-08-13T09:00:00.000Z";
const lesson = fiveMechanicsFixtureLesson;

function ecoute() {
  const exercise = lesson.exercises.find(
    (candidate) => candidate.type === "audio_choice",
  );
  if (exercise?.type !== "audio_choice") throw new Error("Fixture absente.");
  return exercise;
}

function soumission(
  fields: Partial<ValidatedAttemptSubmission> = {},
): ValidatedAttemptSubmission {
  return {
    eventId: "30000000-0000-4000-8000-0000000000c1",
    deviceId: DEVICE_ID,
    exerciseId: ecoute().id,
    selectedOptionId: ecoute().correctOptionId,
    answeredAt: "2026-08-13T08:00:00.000Z",
    durationMs: 1_000,
    contentVersionId: lesson.versionId,
    algorithmVersion: SRS_ALGORITHM_VERSION,
    ...fields,
  };
}

function journal(
  ...submissions: readonly ValidatedAttemptSubmission[]
): AttemptOutboxSnapshot {
  return submissions.reduce(
    (snapshot, submission) => enqueueAttempt(snapshot, submission),
    createAttemptOutboxSnapshot(),
  );
}

describe("projectLearningProgress", () => {
  it("ne compte rien tant qu'aucune tentative n'existe", () => {
    const progress = projectLearningProgress({
      lessons: [lesson],
      outbox: createAttemptOutboxSnapshot(),
      now: MAINTENANT,
    });

    expect(progress.reviewedItems).toBe(0);
    expect(progress.masteryPermille).toBe(0);
    expect(progress.dueCount).toBe(0);
    expect(progress.nextReviewAt).toBeNull();
    expect(progress.lessons[0]?.titleFr).toBe(lesson.titleFr);
  });

  it("compte une réponse juste et annonce sa prochaine révision", () => {
    const progress = projectLearningProgress({
      lessons: [lesson],
      outbox: journal(soumission()),
      now: MAINTENANT,
    });

    expect(progress.attemptedCount).toBe(1);
    expect(progress.successfulAttempts).toBe(1);
    expect(progress.reviewedItems).toBe(1);
    expect(progress.masteryPermille).toBeGreaterThan(0);
    // Une réponse juste éloigne la révision : elle n'est donc pas due.
    expect(progress.dueCount).toBe(0);
    expect(progress.nextReviewAt).not.toBeNull();
  });

  it("compte comme due une révision dont l'échéance est passée", () => {
    const progress = projectLearningProgress({
      lessons: [lesson],
      outbox: journal(soumission()),
      // Bien après l'intervalle d'un jour d'une première réussite.
      now: "2026-09-30T09:00:00.000Z",
    });

    expect(progress.dueCount).toBe(1);
  });

  it("ignore une tentative qui vise une autre version de contenu", () => {
    const progress = projectLearningProgress({
      lessons: [lesson],
      outbox: journal(
        soumission({
          contentVersionId: "50000000-0000-4000-8000-000000000002",
        }),
      ),
      now: MAINTENANT,
    });

    expect(progress.attemptedCount).toBe(0);
  });

  /**
   * La règle qui compte vraiment : le serveur fait autorité, mais une réponse
   * qu'il n'a pas encore reçue ne doit pas disparaître de l'écran.
   */
  it("laisse l'état du serveur primer sur la projection locale", () => {
    const local = projectLearningProgress({
      lessons: [lesson],
      outbox: journal(soumission()),
      now: MAINTENANT,
    });
    const etatLocal = local.lessons[0];
    if (etatLocal === undefined) throw new Error("Projection absente.");

    const progress = projectLearningProgress({
      lessons: [lesson],
      // Journal vide : cette progression vient d'un AUTRE appareil, et doit
      // apparaître quand même. C'est le cas que la projection ratait.
      outbox: createAttemptOutboxSnapshot(),
      now: MAINTENANT,
      authoritativeStates: [
        {
          itemId: ecoute().itemId,
          skill: "listening",
          masteryScore: 1000,
          status: "confirmed" as const,
          totalAttempts: 9,
          successfulAttempts: 9,
          consecutiveCorrect: 9,
          lastRating: 1 as const,
          lastAnsweredAt: "2026-08-13T08:00:00.000Z",
          lastEventId: "30000000-0000-4000-8000-0000000000c1",
          dueAt: "2026-12-01T09:00:00.000Z",
          algorithmVersion: SRS_ALGORITHM_VERSION,
        },
      ],
    });

    expect(progress.masteryPermille).toBe(1000);
    expect(progress.attemptedCount).toBe(9);
    expect(progress.nextReviewAt).toBe("2026-12-01T09:00:00.000Z");
    expect(progress.masteryPermille).toBeGreaterThan(etatLocal.masteryPermille);
  });

  it("refuse un instant de projection qui n'est pas une date", () => {
    expect(() =>
      projectLearningProgress({
        lessons: [lesson],
        outbox: createAttemptOutboxSnapshot(),
        now: "pas une date",
      }),
    ).toThrow(/date ISO/u);
  });
});
