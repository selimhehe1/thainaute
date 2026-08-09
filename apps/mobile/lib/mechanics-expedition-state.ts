import {
  readEmbeddedUnite01LessonBundle,
  type LessonExercise,
} from "@thainaute/content/mobile";
import {
  ingestAttemptBatch,
  type AttemptOutboxSnapshot,
  type LearnerItemProjection,
} from "@thainaute/sync";
import type { AnyExerciseAnswerKey, AttemptEvent } from "@thainaute/domain";

import type {
  MechanicsExpeditionConfig,
  MechanicsExpeditionExerciseConfig,
  MobileMechanicsExercise,
} from "./embedded-mechanics-expedition-config";

function primaryItemId(exercise: MobileMechanicsExercise): string | undefined {
  return exercise.type === "association"
    ? exercise.pairs[0]?.itemId
    : exercise.itemId;
}

export function nextMechanicsExpeditionExercise(
  config: MechanicsExpeditionConfig,
  snapshot: {
    readonly expedition: {
      readonly results: readonly { readonly exerciseId: string }[];
    } | null;
  } | null,
): MechanicsExpeditionExerciseConfig | undefined {
  if (snapshot?.expedition === null || snapshot?.expedition === undefined) {
    return undefined;
  }
  const completed = new Set(
    snapshot.expedition.results.map(({ exerciseId }) => exerciseId),
  );
  return config.exercises.find(({ exercise }) => !completed.has(exercise.id));
}

function answerKeyForExercise(
  exercise: LessonExercise,
  contentVersionId: string,
): AnyExerciseAnswerKey | null {
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
  if (exercise.type === "recall") {
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
  if (exercise.type === "audio_choice" || exercise.type === "reading") {
    return {
      exerciseId: exercise.id,
      itemId: exercise.itemId,
      correctOptionId: exercise.correctOptionId,
      skill: exercise.skill,
      contentVersionId,
    };
  }
  return null;
}

export function mechanicsAnswerKeys(
  config: MechanicsExpeditionConfig,
): readonly AnyExerciseAnswerKey[] {
  const bundle = readEmbeddedUnite01LessonBundle(config.key);
  return bundle.lesson.exercises.flatMap((exercise) => {
    const key = answerKeyForExercise(exercise, bundle.lesson.versionId);
    return key === null ? [] : [key];
  });
}

export function ingestMechanicsExpeditionOutbox(
  outbox: AttemptOutboxSnapshot,
  config: MechanicsExpeditionConfig,
): ReturnType<typeof ingestAttemptBatch> {
  const answerKeys = mechanicsAnswerKeys(config);
  return ingestAttemptBatch({
    authenticatedUserId: null,
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission),
    answerKeys,
  });
}

export function getProjectionForMechanicsExercise(
  outbox: AttemptOutboxSnapshot,
  config: MechanicsExpeditionConfig,
  current: MechanicsExpeditionExerciseConfig,
): LearnerItemProjection | undefined {
  const itemId = primaryItemId(current.exercise);
  if (itemId === undefined) return undefined;
  return ingestMechanicsExpeditionOutbox(outbox, config).projections.find(
    ({ state }) =>
      state.itemId === itemId && state.skill === current.exercise.skill,
  );
}

export function getMechanicsEvent(
  outbox: AttemptOutboxSnapshot,
  config: MechanicsExpeditionConfig,
  eventId: string,
): AttemptEvent | undefined {
  return ingestMechanicsExpeditionOutbox(outbox, config).events.find(
    (event) => event.eventId === eventId,
  );
}

export type MechanicsExercise = Extract<
  LessonExercise,
  { type: "association" | "word_order" | "recall" | "reading" }
>;
