import {
  completeLocalOnboarding,
  createAttemptOutboxSnapshot,
  attemptOutboxSnapshotSchema,
  createLocalExperienceSnapshot,
  enqueueAttempt,
  startLocalExpedition,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { readEmbeddedUnite01LessonBundle } from "@thainaute/content/mobile";
import { describe, expect, it } from "vitest";

import type { AudioExpeditionConfig } from "../lib/embedded-audio-expedition-config";
import { mobileUnit01MechanicsExpedition1c } from "../lib/embedded-mechanics-expedition-config";
import { projectMobileLearningProgress } from "../lib/mobile-progress";

const bundle = readEmbeddedUnite01LessonBundle("u01-l1a");
const audioExercises = bundle.lesson.exercises.filter(
  (exercise): exercise is Extract<typeof exercise, { type: "audio_choice" }> =>
    exercise.type === "audio_choice",
);
const config: AudioExpeditionConfig = {
  bannerText: "test",
  bannerTitle: "test",
  completionPrivacy: "test",
  exercises: audioExercises.map((exercise) => ({
    exercise,
    item: bundle.lesson.items.find(({ id }) => id === exercise.itemId)!,
    modelAudioSource: 1,
  })),
  headerStep: "test",
  introEyebrow: "test",
  key: "u01-l1a",
  lesson: bundle.lesson,
  outboxNamespace: "learning",
};

const startedAt = "2026-08-02T08:00:00.000Z";
const deviceId = "40000000-0000-4000-8000-000000000001";

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    {
      goalOptionId: "prototype_goal_short",
      motivationOptionId: "prototype_motivation_travel",
      experienceOptionId: "prototype_experience_new",
    },
    startedAt,
  );
}

function activeExperience(): LocalExperienceSnapshot {
  return startLocalExpedition(onboarded(), {
    lessonVersionId: config.lesson.versionId,
    exerciseIds: config.exercises.map(({ exercise }) => exercise.id),
    startedAt,
  });
}

function submission(
  index: number,
  selectedOptionId: string,
): ValidatedAttemptSubmission {
  const exercise = audioExercises[index];
  if (exercise === undefined) throw new Error("Missing test exercise.");
  return {
    eventId: `30000000-0000-4000-8000-00000000000${index + 1}`,
    deviceId,
    exerciseId: exercise.id,
    selectedOptionId,
    answeredAt: `2026-08-02T08:0${index + 1}:00.000Z`,
    durationMs: 2_000,
    contentVersionId: config.lesson.versionId,
    algorithmVersion: "srs-v0",
  };
}

function activeMechanicsExperience(): LocalExperienceSnapshot {
  return startLocalExpedition(onboarded(), {
    lessonVersionId: mobileUnit01MechanicsExpedition1c.lesson.versionId,
    exerciseIds: mobileUnit01MechanicsExpedition1c.exercises.map(
      ({ exercise }) => exercise.id,
    ),
    startedAt,
  });
}

function mechanicsSubmission(index: 0): ValidatedAttemptSubmission {
  const current = mobileUnit01MechanicsExpedition1c.exercises[index];
  if (current === undefined) throw new Error("Missing mechanics exercise.");
  const base = {
    answeredAt: `2026-08-02T08:0${index + 1}:00.000Z`,
    contentVersionId: mobileUnit01MechanicsExpedition1c.lesson.versionId,
    deviceId,
    durationMs: 2_000,
    eventId: `30000000-0000-4000-8000-00000000000${index + 3}`,
    exerciseId: current.exercise.id,
    algorithmVersion: "srs-v0" as const,
  };
  if (current.exercise.type === "word_order") {
    return {
      ...base,
      answer: {
        kind: "word_order",
        tokenIds: current.exercise.correctOrder,
      },
    };
  }
  if (current.exercise.type !== "reading") {
    throw new Error("Expected a reading exercise.");
  }
  return { ...base, selectedOptionId: current.exercise.correctOptionId };
}

describe("projection locale de Progrès", () => {
  it("agrège les essais, la maîtrise, les échéances et la séance en cours", () => {
    const first = audioExercises[0]!;
    const second = audioExercises[1]!;
    let outbox = createAttemptOutboxSnapshot();
    outbox = enqueueAttempt(outbox, submission(0, first.correctOptionId));
    outbox = enqueueAttempt(outbox, submission(1, second.options[0]!.id));

    const progress = projectMobileLearningProgress({
      configs: { "u01-l1a": config },
      experience: activeExperience(),
      now: "2026-08-02T08:20:00.000Z",
      outbox,
    });

    expect(progress).toMatchObject({
      activeExpedition: {
        completedCount: 0,
        key: "u01-l1a",
        totalCount: 6,
      },
      attemptedCount: 2,
      confirmedItems: 0,
      dueCount: 1,
      reviewedItems: 2,
      successfulAttempts: 1,
    });
    expect(progress.lessons[0]).toMatchObject({
      masteryPermille: 125,
      nextReviewAt: "2026-08-02T08:12:00.000Z",
    });
  });

  it("ignore le journal d’une autre release et accepte un état vide", () => {
    const progress = projectMobileLearningProgress({
      configs: { "u01-l1a": config },
      experience: onboarded(),
      now: "2026-08-02T08:20:00.000Z",
      outbox: createAttemptOutboxSnapshot(),
    });

    expect(progress).toMatchObject({
      activeExpedition: null,
      attemptedCount: 0,
      dueCount: 0,
      masteryPermille: 0,
      reviewedItems: 0,
    });
    expect(progress.lessons[0]).toMatchObject({
      lessonTitle: bundle.lesson.titleFr,
      nextReviewAt: null,
    });
  });

  it("projette l’état autoritaire reçu d’un autre appareil", () => {
    const first = audioExercises[0]!;
    const outbox = attemptOutboxSnapshotSchema.parse({
      ...createAttemptOutboxSnapshot(),
      syncRevision: 9,
      authoritativeStates: [
        {
          itemId: first.itemId,
          skill: "listening",
          masteryPermille: 750,
          status: "confirmed",
          attemptCount: 3,
          successfulAttempts: 3,
          consecutiveCorrect: 3,
          dueAt: "2026-08-03T08:00:00.000Z",
          algorithmVersion: "srs-v0",
        },
      ],
    });

    const progress = projectMobileLearningProgress({
      configs: { "u01-l1a": config },
      experience: onboarded(),
      now: "2026-08-02T08:20:00.000Z",
      outbox,
    });

    expect(progress).toMatchObject({
      attemptedCount: 3,
      confirmedItems: 1,
      dueCount: 0,
      masteryPermille: 750,
      reviewedItems: 1,
      successfulAttempts: 3,
    });
    expect(progress.lessons[0]).toMatchObject({
      attemptedCount: 3,
      masteryPermille: 750,
      nextReviewAt: "2026-08-03T08:00:00.000Z",
    });
  });

  it("enrichit l’état serveur d’une tentative locale encore en attente", () => {
    const first = audioExercises[0]!;
    let outbox = attemptOutboxSnapshotSchema.parse({
      ...createAttemptOutboxSnapshot(),
      syncRevision: 9,
      authoritativeStates: [
        {
          itemId: first.itemId,
          skill: "listening",
          masteryPermille: 750,
          status: "confirmed",
          attemptCount: 3,
          successfulAttempts: 3,
          consecutiveCorrect: 3,
          dueAt: "2026-08-03T08:00:00.000Z",
          algorithmVersion: "srs-v0",
        },
      ],
    });
    outbox = enqueueAttempt(outbox, submission(0, first.correctOptionId));

    const progress = projectMobileLearningProgress({
      configs: { "u01-l1a": config },
      experience: onboarded(),
      now: "2026-08-02T08:20:00.000Z",
      outbox,
    });

    expect(progress.lessons[0]).toMatchObject({
      attemptedCount: 4,
      masteryPermille: 1_000,
      successfulAttempts: 4,
    });
  });
  it("projette une réponse typée d'expédition mécanique", () => {
    // Ce test portait deux exercices, empruntés à u01-l1e, retirée du
    // bundle mobile parce qu'elle reste un brouillon : un brouillon est
    // extractible d'un APK. Reste u01-l1c, qui n'en porte qu'un.
    //
    // Ce qui reste couvert : la correction et la projection d'une réponse
    // word_order. Ce qui l'est ailleurs : association et recall, par
    // mechanics-expedition-state.test.ts, sur une configuration typée qui
    // ne dépend d'aucune leçon publiée.
    let outbox = createAttemptOutboxSnapshot();
    outbox = enqueueAttempt(outbox, mechanicsSubmission(0));

    const progress = projectMobileLearningProgress({
      configs: { "u01-l1c": mobileUnit01MechanicsExpedition1c },
      experience: activeMechanicsExperience(),
      now: "2026-08-02T08:20:00.000Z",
      outbox,
    });

    expect(progress).toMatchObject({
      activeExpedition: {
        completedCount: 0,
        key: "u01-l1c",
        mode: "mechanics",
        totalCount: 1,
      },
      attemptedCount: 1,
      reviewedItems: 1,
      successfulAttempts: 1,
    });
    expect(progress.lessons[0]).toMatchObject({
      key: "u01-l1c",
      mode: "mechanics",
      attemptedCount: 1,
      successfulAttempts: 1,
    });
  });
});
