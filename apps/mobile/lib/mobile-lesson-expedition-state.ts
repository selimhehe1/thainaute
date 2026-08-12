import {
  readEmbeddedUnite01LessonBundle,
  type LessonExercise,
} from "@thainaute/content/mobile";
import type { AnyExerciseAnswerKey, AttemptEvent } from "@thainaute/domain";
import {
  ingestAttemptBatch,
  type AttemptOutboxSnapshot,
  type LearnerItemProjection,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";

import type {
  MobileLessonExpeditionConfig,
  MobileLessonExerciseConfig,
} from "./mobile-lesson-expedition-config";

function answerKeyForExercise(
  exercise: LessonExercise,
  contentVersionId: string,
): AnyExerciseAnswerKey | null {
  if (exercise.type === "audio_choice" || exercise.type === "reading") {
    return {
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      correctOptionId: exercise.correctOptionId,
      skill: exercise.skill,
      contentVersionId,
    };
  }
  if (exercise.type === "association") {
    const itemId = exercise.pairs[0]?.itemId;
    if (itemId === undefined) return null;
    return {
      kind: "association",
      exerciseId: exercise.id,
      itemId,
      skill: exercise.skill,
      contentVersionId,
      pairIds: exercise.pairs.map(({ id }) => id),
    };
  }
  if (exercise.type === "word_order") {
    return {
      kind: "word_order",
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      skill: exercise.skill,
      contentVersionId,
      validTokenIds: exercise.tokens.map(({ id }) => id),
      correctOrder: exercise.correctOrder,
    };
  }
  return {
    kind: "recall",
    exerciseId: exercise.id,
    itemId: exercise.itemId,
    skill: exercise.skill,
    contentVersionId,
    acceptedAnswers: exercise.acceptedAnswers.map(({ value }) => value),
    answerPolicy: exercise.answerPolicy,
  };
}

export function nextMobileLessonExercise(
  config: MobileLessonExpeditionConfig,
  snapshot: LocalExperienceSnapshot | null,
): MobileLessonExerciseConfig | undefined {
  const completed = new Set(
    snapshot?.expedition?.results.map(({ exerciseId }) => exerciseId) ?? [],
  );
  return config.exercises.find(({ exercise }) => !completed.has(exercise.id));
}

export function mobileLessonAnswerKeys(
  config: MobileLessonExpeditionConfig,
): readonly AnyExerciseAnswerKey[] {
  const bundle = readEmbeddedUnite01LessonBundle(config.key);
  return bundle.lesson.exercises.flatMap((exercise) => {
    const key = answerKeyForExercise(exercise, bundle.lesson.versionId);
    return key === null ? [] : [key];
  });
}

export function ingestMobileLessonOutbox(
  outbox: AttemptOutboxSnapshot,
  config: MobileLessonExpeditionConfig,
) {
  return ingestAttemptBatch({
    authenticatedUserId: null,
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission),
    answerKeys: mobileLessonAnswerKeys(config),
  });
}

export function getMobileLessonEvent(
  outbox: AttemptOutboxSnapshot,
  config: MobileLessonExpeditionConfig,
  eventId: string,
): AttemptEvent | undefined {
  return ingestMobileLessonOutbox(outbox, config).events.find(
    (event) => event.eventId === eventId,
  );
}

export function getProjectionForMobileLessonExercise(
  outbox: AttemptOutboxSnapshot,
  config: MobileLessonExpeditionConfig,
  current: MobileLessonExerciseConfig,
): LearnerItemProjection | undefined {
  return ingestMobileLessonOutbox(outbox, config).projections.find(
    ({ state }) =>
      state.itemId === current.item.id &&
      state.skill === current.exercise.skill,
  );
}
