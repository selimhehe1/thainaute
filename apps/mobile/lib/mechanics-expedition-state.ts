import {
  readEmbeddedUnite01LessonBundle,
  type LessonExercise,
} from "@thainaute/content/mobile";
import {
  ingestAttemptBatch,
  localAnswerKeysForLesson,
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

export function mechanicsAnswerKeys(
  config: MechanicsExpeditionConfig,
): readonly AnyExerciseAnswerKey[] {
  return localAnswerKeysForLesson(
    readEmbeddedUnite01LessonBundle(config.key).lesson,
  );
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
