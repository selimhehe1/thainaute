import {
  ingestAttemptBatch,
  isOptionAttempt,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";

import type {
  AudioExpeditionConfig,
  AudioExpeditionExerciseConfig,
} from "./embedded-audio-expedition-config";

export function answerKeysFor(config: AudioExpeditionConfig): readonly {
  readonly contentVersionId: string;
  readonly correctOptionId: string;
  readonly exerciseId: string;
  readonly itemId: string;
  readonly skill: "listening";
}[] {
  return config.exercises.map(({ exercise, item }) => ({
    contentVersionId: config.lesson.versionId,
    correctOptionId: exercise.correctOptionId,
    exerciseId: exercise.id,
    itemId: item.id,
    skill: "listening",
  }));
}

export function ingestAudioExpeditionOutbox(
  outbox: AttemptOutboxSnapshot,
  config: AudioExpeditionConfig,
) {
  return ingestAttemptBatch({
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission)
      .filter(isOptionAttempt),
    answerKeys: answerKeysFor(config),
    authenticatedUserId: null,
  });
}

export function nextAudioExpeditionExercise(
  config: AudioExpeditionConfig,
  snapshot: LocalExperienceSnapshot | null,
): AudioExpeditionExerciseConfig | undefined {
  const resolved = new Set(
    snapshot?.expedition?.results.map(({ exerciseId }) => exerciseId) ?? [],
  );
  return config.exercises.find(({ exercise }) => !resolved.has(exercise.id));
}

export function getProjectionForExercise(
  outbox: AttemptOutboxSnapshot,
  config: AudioExpeditionConfig,
  exercise: AudioExpeditionExerciseConfig,
) {
  return ingestAudioExpeditionOutbox(outbox, config).projections.find(
    ({ state }) => state.itemId === exercise.item.id,
  )?.state;
}
