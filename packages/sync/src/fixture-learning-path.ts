import {
  localExperienceSnapshotSchema,
  localLessonReplacementTargetSchema,
  type LocalLessonCheckpoint,
} from "./local-experience";

type PendingFixtureLearningPathProjection = Readonly<{
  status: "onboarding_required" | "available";
  lessonPhase: null;
  completedSteps: 0;
  totalSteps: 1;
  progressPercent: 0;
}>;

type ActiveFixtureLearningPathProjection = Readonly<{
  status: "in_progress";
  lessonPhase: "intro" | "question" | "submitting";
  completedSteps: 0;
  totalSteps: 1;
  progressPercent: 0;
}>;

type ResultReadyFixtureLearningPathProjection = Readonly<{
  status: "result_ready";
  lessonPhase: "result";
  completedSteps: 0;
  totalSteps: 1;
  progressPercent: 0;
}>;

type CompletedFixtureLearningPathProjection = Readonly<{
  status: "completed";
  lessonPhase: "completed";
  completedSteps: 1;
  totalSteps: 1;
  progressPercent: 100;
}>;

type ConflictingFixtureLearningPathProjection = Readonly<{
  status: "version_conflict";
  lessonPhase: LocalLessonCheckpoint["phase"];
  completedSteps: 0;
  totalSteps: 1;
  progressPercent: 0;
}>;

export type FixtureLearningPathProjection =
  | PendingFixtureLearningPathProjection
  | ActiveFixtureLearningPathProjection
  | ResultReadyFixtureLearningPathProjection
  | CompletedFixtureLearningPathProjection
  | ConflictingFixtureLearningPathProjection;

export type FixtureLearningPathStatus = FixtureLearningPathProjection["status"];

const pendingProgress = {
  completedSteps: 0,
  totalSteps: 1,
  progressPercent: 0,
} as const;

/**
 * Projette le checkpoint local sur l'unique etape technique de la fixture.
 * Cette projection ne definit ni curriculum, ni contenu, ni navigation produit.
 */
export function projectFixtureLearningPath(
  snapshotInput: unknown,
  targetInput: unknown,
): FixtureLearningPathProjection {
  const snapshot = localExperienceSnapshotSchema.parse(snapshotInput);
  const target = localLessonReplacementTargetSchema.parse(targetInput);

  if (snapshot.onboarding.status !== "completed") {
    return {
      status: "onboarding_required",
      lessonPhase: null,
      ...pendingProgress,
    };
  }

  const lesson = snapshot.lesson;
  if (lesson === null) {
    return {
      status: "available",
      lessonPhase: null,
      ...pendingProgress,
    };
  }

  if (
    lesson.lessonVersionId !== target.lessonVersionId ||
    lesson.exerciseId !== target.exerciseId
  ) {
    return {
      status: "version_conflict",
      lessonPhase: lesson.phase,
      ...pendingProgress,
    };
  }

  switch (lesson.phase) {
    case "intro":
    case "question":
    case "submitting":
      return {
        status: "in_progress",
        lessonPhase: lesson.phase,
        ...pendingProgress,
      };
    case "result":
      return {
        status: "result_ready",
        lessonPhase: lesson.phase,
        ...pendingProgress,
      };
    case "completed":
      return {
        status: "completed",
        lessonPhase: lesson.phase,
        completedSteps: 1,
        totalSteps: 1,
        progressPercent: 100,
      };
  }
}
