import {
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  startLocalExpedition,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";
import { readEmbeddedUnite01LessonBundle } from "@thainaute/content/mobile";
import { describe, expect, it, vi } from "vitest";

import {
  type MobileLessonExpeditionConfig,
  type MobileLessonExerciseConfig,
} from "../lib/mobile-lesson-expedition-config";
import {
  getProjectionForMobileLessonExercise,
  ingestMobileLessonOutbox,
  nextMobileLessonExercise,
} from "../lib/mobile-lesson-expedition-state";

vi.mock("../lib/mobile-lesson-expedition-config", () => ({}));

const deviceId = "40000000-0000-4000-8000-000000000001";
const startedAt = "2026-08-06T10:00:00.000Z";
function testConfig(key: "u01-l1a" | "u01-l1b"): MobileLessonExpeditionConfig {
  const bundle = readEmbeddedUnite01LessonBundle(key);
  return {
    bannerText: "test",
    bannerTitle: "test",
    completionPrivacy: "test",
    exercises: bundle.lesson.exercises.map((exercise) => {
      const itemId =
        exercise.type === "association"
          ? exercise.pairs[0]?.itemId
          : exercise.itemId;
      const item = bundle.lesson.items.find(({ id }) => id === itemId);
      if (item === undefined) throw new Error("Item de test absent.");
      if (exercise.type === "audio_choice") {
        return { exercise, item, modelAudioSource: 1 };
      }
      return { exercise, item };
    }) as readonly MobileLessonExerciseConfig[],
    headerStep: "test",
    introEyebrow: "test",
    key,
    lesson: bundle.lesson,
    mode: "mixed",
    outboxNamespace: "learning",
  };
}

const mobileUnit01MixedExpedition1a = testConfig("u01-l1a");
const mobileUnit01MixedExpedition1b = testConfig("u01-l1b");

function onboarded(): LocalExperienceSnapshot {
  return {
    schemaVersion: 1,
    owner: { kind: "anonymous" },
    onboarding: {
      status: "completed",
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_a",
      experienceOptionId: "prototype_experience_new",
      startedAt,
      completedAt: startedAt,
    },
    lesson: null,
    expedition: null,
  };
}

function optionSubmission(
  current: MobileLessonExerciseConfig,
  selectedOptionId: string,
  eventId: string,
) {
  return {
    algorithmVersion: "srs-v0" as const,
    answeredAt: startedAt,
    contentVersionId: mobileUnit01MixedExpedition1a.lesson.versionId,
    deviceId,
    durationMs: 2_000,
    eventId,
    exerciseId: current.exercise.id,
    selectedOptionId,
  };
}

describe("expédition mobile mixte", () => {
  it("démarre la leçon 1B complète sans tronquer ses 21 exercices", () => {
    const exerciseIds = mobileUnit01MixedExpedition1b.exercises.map(
      ({ exercise }) => exercise.id,
    );

    expect(exerciseIds).toHaveLength(21);
    expect(
      startLocalExpedition(onboarded(), {
        lessonVersionId: mobileUnit01MixedExpedition1b.lesson.versionId,
        exerciseIds,
        startedAt,
      }).expedition?.exerciseIds,
    ).toEqual(exerciseIds);
  });

  it("respecte l'ordre canonique audio puis mécanique", () => {
    const snapshot = startLocalExpedition(onboarded(), {
      lessonVersionId: mobileUnit01MixedExpedition1a.lesson.versionId,
      exerciseIds: mobileUnit01MixedExpedition1a.exercises.map(
        ({ exercise }) => exercise.id,
      ),
      startedAt,
    });
    const first = mobileUnit01MixedExpedition1a.exercises[0];
    if (first?.exercise.type !== "audio_choice") {
      throw new Error("Le premier exercice doit être audio.");
    }

    expect(
      nextMobileLessonExercise(mobileUnit01MixedExpedition1a, snapshot),
    ).toBe(first);

    const afterAudio = {
      ...snapshot,
      expedition: {
        ...snapshot.expedition!,
        results: [
          {
            answeredAt: startedAt,
            exerciseId: first.exercise.id,
            rating: 1 as const,
          },
        ],
      },
    };
    const next = nextMobileLessonExercise(
      mobileUnit01MixedExpedition1a,
      afterAudio,
    );
    expect(next?.exercise.type).toBe("audio_choice");

    const association = mobileUnit01MixedExpedition1a.exercises.find(
      ({ exercise }) => exercise.type === "association",
    );
    expect(association?.exercise.type).toBe("association");
  });

  it("évalue audio et association avec deux compétences SRS distinctes", () => {
    const audio = mobileUnit01MixedExpedition1a.exercises[0];
    const association = mobileUnit01MixedExpedition1a.exercises.find(
      ({ exercise }) => exercise.type === "association",
    );
    if (
      audio?.exercise.type !== "audio_choice" ||
      association?.exercise.type !== "association"
    ) {
      throw new Error("Le parcours mixte de test est incomplet.");
    }

    let outbox = createAttemptOutboxSnapshot();
    outbox = enqueueAttempt(
      outbox,
      optionSubmission(
        audio,
        audio.exercise.correctOptionId,
        "30000000-0000-4000-8000-000000000001",
      ),
    );
    outbox = enqueueAttempt(outbox, {
      algorithmVersion: "srs-v0",
      answer: {
        kind: "association",
        pairs: association.exercise.pairs.map(({ id }) => ({
          chosenPairId: id,
          promptPairId: id,
        })),
      },
      answeredAt: startedAt,
      contentVersionId: mobileUnit01MixedExpedition1a.lesson.versionId,
      deviceId,
      durationMs: 2_000,
      eventId: "30000000-0000-4000-8000-000000000002",
      exerciseId: association.exercise.id,
    });

    const ingestion = ingestMobileLessonOutbox(
      outbox,
      mobileUnit01MixedExpedition1a,
    );
    expect(ingestion.events.map(({ rating }) => rating)).toEqual([1, 1]);
    expect(
      getProjectionForMobileLessonExercise(
        outbox,
        mobileUnit01MixedExpedition1a,
        audio,
      ),
    ).toMatchObject({ state: { skill: "listening", masteryScore: 250 } });
    expect(
      getProjectionForMobileLessonExercise(
        outbox,
        mobileUnit01MixedExpedition1a,
        association,
      ),
    ).toMatchObject({ state: { skill: "reading", masteryScore: 250 } });
  });
});
