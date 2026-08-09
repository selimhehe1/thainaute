import {
  completeLocalOnboarding,
  createAttemptOutboxSnapshot,
  createLocalExperienceSnapshot,
  enqueueAttempt,
  startLocalExpedition,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { readEmbeddedUnite01LessonBundle } from "@thainaute/content/mobile";
import { describe, expect, it } from "vitest";

import type { AudioExpeditionConfig } from "../lib/embedded-audio-expedition-config";
import {
  ingestAudioExpeditionOutbox,
  nextAudioExpeditionExercise,
} from "../lib/audio-expedition-state";

const firstBundle = readEmbeddedUnite01LessonBundle("u01-l1a");
const audioExercises = firstBundle.lesson.exercises.filter(
  (exercise): exercise is Extract<typeof exercise, { type: "audio_choice" }> =>
    exercise.type === "audio_choice",
);
const config: AudioExpeditionConfig = {
  bannerText: "test",
  bannerTitle: "test",
  completionPrivacy: "test",
  exercises: audioExercises.map((exercise) => ({
    exercise,
    item: firstBundle.lesson.items.find(({ id }) => id === exercise.itemId)!,
    modelAudioSource: 1,
  })),
  headerStep: "test",
  introEyebrow: "test",
  key: "u01-l1a",
  lesson: firstBundle.lesson,
  outboxNamespace: "learning",
};

const deviceId = "40000000-0000-4000-8000-000000000001";

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_a",
      experienceOptionId: "prototype_experience_new",
    },
    "2026-08-02T08:00:00.000Z",
  );
}

function submission(
  exerciseIndex: number,
  selectedOptionId: string,
  eventIndex: number,
): ValidatedAttemptSubmission {
  const exercise = audioExercises[exerciseIndex];
  if (exercise === undefined) throw new Error("missing exercise");
  return {
    eventId: `30000000-0000-4000-8000-00000000000${eventIndex}`,
    deviceId,
    exerciseId: exercise.id,
    selectedOptionId,
    answeredAt: `2026-08-02T08:0${eventIndex}:00.000Z`,
    durationMs: 2_000,
    contentVersionId: firstBundle.lesson.versionId,
    algorithmVersion: "srs-v0",
  };
}

describe("état de l'expédition audio mobile", () => {
  it("avance sur le premier exercice non résolu et conserve la reprise", () => {
    let snapshot = startLocalExpedition(onboarded(), {
      lessonVersionId: config.lesson.versionId,
      exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
      startedAt: "2026-08-02T08:00:00.000Z",
    });

    expect(nextAudioExpeditionExercise(config, snapshot)?.exercise.id).toBe(
      audioExercises[0]?.id,
    );

    snapshot = {
      ...snapshot,
      expedition: {
        ...snapshot.expedition!,
        results: [
          {
            exerciseId: audioExercises[0]!.id,
            rating: 1,
            answeredAt: "2026-08-02T08:01:00.000Z",
          },
        ],
        updatedAt: "2026-08-02T08:01:00.000Z",
      },
    };

    expect(nextAudioExpeditionExercise(config, snapshot)?.exercise.id).toBe(
      audioExercises[1]?.id,
    );
  });

  it("évalue les réponses locales, calcule la maîtrise et isole une autre leçon", () => {
    let outbox = createAttemptOutboxSnapshot();
    const first = audioExercises[0]!;
    const second = audioExercises[1]!;
    outbox = enqueueAttempt(outbox, submission(0, first.correctOptionId, 1));
    outbox = enqueueAttempt(outbox, submission(1, second.options[0]!.id, 2));
    outbox = enqueueAttempt(outbox, {
      ...submission(0, first.correctOptionId, 3),
      exerciseId: "50000000-0000-4000-8000-000000000004",
    });

    const ingestion = ingestAudioExpeditionOutbox(outbox, config);
    expect(ingestion.events).toHaveLength(2);
    expect(ingestion.rejected).toHaveLength(1);
    expect(ingestion.events.map(({ rating }) => rating)).toEqual([1, 0]);
    expect(
      ingestion.projections.find(
        ({ state }) => state.itemId === config.exercises[0]!.item.id,
      )?.state.masteryScore,
    ).toBeGreaterThan(0);
    expect(
      ingestion.projections.find(
        ({ state }) => state.itemId === config.exercises[1]!.item.id,
      )?.state.masteryScore,
    ).toBe(0);
  });
});
