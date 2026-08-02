import { describe, expect, it } from "vitest";

import {
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  createLocalExperienceSnapshot,
  enqueueAttempt,
  finishLocalLesson,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  projectFixtureLearningPath,
  selectLocalLessonOption,
  startLocalLesson,
  updateLocalOnboarding,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "../src";

const LESSON_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const OTHER_LESSON_ID = "50000000-0000-4000-8000-000000000002";
const OTHER_EXERCISE_ID = "50000000-0000-4000-8000-000000000004";
const OPTION_ID = "20000000-0000-4000-8000-000000000001";
const EVENT_ID = "30000000-0000-4000-8000-000000000001";
const DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const STARTED_AT = "2026-08-02T08:00:00.000Z";
const ANSWERED_AT = "2026-08-02T08:01:00.000Z";

const target = {
  lessonVersionId: LESSON_ID,
  exerciseId: EXERCISE_ID,
} as const;

const selection = {
  goalOptionId: "prototype_goal_short",
  motivationOptionId: "prototype_motivation_a",
  experienceOptionId: "prototype_experience_new",
} as const;

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    selection,
    STARTED_AT,
  );
}

function intro(): LocalExperienceSnapshot {
  return startLocalLesson(onboarded(), {
    ...target,
    startedAt: STARTED_AT,
  });
}

function question(): LocalExperienceSnapshot {
  return openLocalLessonQuestion(intro(), "2026-08-02T08:00:10.000Z");
}

function submission(): ValidatedAttemptSubmission {
  return {
    eventId: EVENT_ID,
    deviceId: DEVICE_ID,
    exerciseId: EXERCISE_ID,
    selectedOptionId: OPTION_ID,
    answeredAt: ANSWERED_AT,
    durationMs: 1_000,
    contentVersionId: LESSON_ID,
    algorithmVersion: "srs-v0",
  };
}

function submitting(): LocalExperienceSnapshot {
  const selected = selectLocalLessonOption(
    question(),
    OPTION_ID,
    "2026-08-02T08:00:20.000Z",
  );
  return prepareLocalLessonSubmission(selected, submission(), ANSWERED_AT);
}

function result(): LocalExperienceSnapshot {
  return confirmLocalLessonResult(
    submitting(),
    enqueueAttempt(createAttemptOutboxSnapshot(), submission()),
    "2026-08-02T08:01:01.000Z",
  );
}

function completed(): LocalExperienceSnapshot {
  const snapshot = result();
  return finishLocalLesson(
    snapshot,
    enqueueAttempt(createAttemptOutboxSnapshot(), submission()),
    "2026-08-02T08:01:02.000Z",
  );
}

describe("projection du parcours technique local", () => {
  it.each([
    ["not_started", createLocalExperienceSnapshot()],
    [
      "in_progress",
      updateLocalOnboarding(
        createLocalExperienceSnapshot(),
        { goalOptionId: selection.goalOptionId },
        STARTED_AT,
      ),
    ],
  ])(
    "projette l'onboarding %s sans exposer de progression",
    (_onboardingStatus, snapshot) => {
      expect(projectFixtureLearningPath(snapshot, target)).toEqual({
        status: "onboarding_required",
        lessonPhase: null,
        completedSteps: 0,
        totalSteps: 1,
        progressPercent: 0,
      });
    },
  );

  it("rend l'etape disponible apres l'onboarding", () => {
    expect(projectFixtureLearningPath(onboarded(), target)).toEqual({
      status: "available",
      lessonPhase: null,
      completedSteps: 0,
      totalSteps: 1,
      progressPercent: 0,
    });
  });

  it.each([
    ["intro", intro()],
    ["question", question()],
    ["submitting", submitting()],
  ] as const)("projette la phase %s comme en cours", (phase, snapshot) => {
    expect(projectFixtureLearningPath(snapshot, target)).toEqual({
      status: "in_progress",
      lessonPhase: phase,
      completedSteps: 0,
      totalSteps: 1,
      progressPercent: 0,
    });
  });

  it("distingue un resultat durable d'une etape terminee", () => {
    expect(projectFixtureLearningPath(result(), target)).toEqual({
      status: "result_ready",
      lessonPhase: "result",
      completedSteps: 0,
      totalSteps: 1,
      progressPercent: 0,
    });
    expect(projectFixtureLearningPath(completed(), target)).toEqual({
      status: "completed",
      lessonPhase: "completed",
      completedSteps: 1,
      totalSteps: 1,
      progressPercent: 100,
    });
  });

  it.each([
    [
      "lessonVersionId",
      { lessonVersionId: OTHER_LESSON_ID, exerciseId: EXERCISE_ID },
    ],
    [
      "exerciseId",
      { lessonVersionId: LESSON_ID, exerciseId: OTHER_EXERCISE_ID },
    ],
  ] as const)(
    "bloque la progression si %s ne correspond plus a la fixture",
    (_mismatchedField, mismatchedTarget) => {
      expect(projectFixtureLearningPath(completed(), mismatchedTarget)).toEqual(
        {
          status: "version_conflict",
          lessonPhase: "completed",
          completedSteps: 0,
          totalSteps: 1,
          progressPercent: 0,
        },
      );
    },
  );

  it("rejette strictement les entrees invalides", () => {
    expect(() =>
      projectFixtureLearningPath(
        { ...createLocalExperienceSnapshot(), schemaVersion: 2 },
        target,
      ),
    ).toThrow();
    expect(() =>
      projectFixtureLearningPath(onboarded(), {
        ...target,
        unexpected: "field",
      }),
    ).toThrow();
    expect(() =>
      projectFixtureLearningPath(onboarded(), {
        ...target,
        exerciseId: "not-a-uuid",
      }),
    ).toThrow();
  });

  it("ne modifie ni le snapshot ni la cible projetes", () => {
    const snapshot = completed();
    const mutableTarget = { ...target };
    const snapshotBefore = JSON.stringify(snapshot);
    const targetBefore = JSON.stringify(mutableTarget);

    projectFixtureLearningPath(snapshot, mutableTarget);

    expect(JSON.stringify(snapshot)).toBe(snapshotBefore);
    expect(JSON.stringify(mutableTarget)).toBe(targetBefore);
  });
});
