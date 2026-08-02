import { AttemptInfrastructureError } from "./errors";
import type { ServerExerciseAnswerKey } from "./ports";

export function answerKeyIdentity(
  answerKey: Pick<ServerExerciseAnswerKey, "exerciseId" | "contentVersionId">,
): string {
  return `${answerKey.exerciseId}\u0000${answerKey.contentVersionId}`;
}

/** Index fermé : aucune clé divergente ne peut être choisie arbitrairement. */
export function indexServerAnswerKeys(
  answerKeys: readonly ServerExerciseAnswerKey[],
): ReadonlyMap<string, ServerExerciseAnswerKey> {
  const index = new Map<string, ServerExerciseAnswerKey>();

  for (const answerKey of answerKeys) {
    const identity = answerKeyIdentity(answerKey);
    const existing = index.get(identity);
    if (
      existing !== undefined &&
      (existing.itemId !== answerKey.itemId ||
        existing.skill !== answerKey.skill ||
        existing.correctOptionId !== answerKey.correctOptionId ||
        existing.feedback.correctFr !== answerKey.feedback.correctFr ||
        existing.feedback.incorrectFr !== answerKey.feedback.incorrectFr ||
        existing.validOptionIds.length !== answerKey.validOptionIds.length ||
        existing.validOptionIds.some(
          (optionId, index) => optionId !== answerKey.validOptionIds[index],
        ))
    ) {
      throw new AttemptInfrastructureError("database_unavailable");
    }
    index.set(identity, answerKey);
  }

  return index;
}
