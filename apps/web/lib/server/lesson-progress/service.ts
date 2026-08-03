import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  lessonProgressResponseSchema,
  type LessonProgressResponse,
  type ProgressSnapshotResponse,
} from "@thainaute/sync";

import type { VerifiedPublishedBundle } from "../content-delivery/verified-bundle";

function stateKey(input: { readonly itemId: string; readonly skill: string }) {
  return `${input.itemId}\u0000${input.skill}`;
}

/**
 * Traduit les identifiants éditoriaux internes vers les seuls exerciseId déjà
 * distribués au client. Aucun itemId ne traverse le contrat retourné.
 */
export function buildLessonProgress(input: {
  readonly verified: VerifiedPublishedBundle;
  readonly snapshot: ProgressSnapshotResponse;
}): LessonProgressResponse {
  const states = new Map(
    input.snapshot.states.map((state) => [stateKey(state), state] as const),
  );

  return lessonProgressResponseSchema.parse({
    schemaVersion: 1,
    lessonVersionId: input.verified.bundle.lesson.versionId,
    syncRevision: input.snapshot.syncRevision,
    exercises: input.verified.bundle.lesson.exercises.map((exercise) => {
      // L'association mesure plusieurs items ; son agrégation de progression
      // est définie à la phase C (ADR-0024). D'ici là elle reste « new ».
      const state =
        exercise.type === "association"
          ? undefined
          : states.get(stateKey(exercise));
      if (state === undefined) {
        return {
          exerciseId: exercise.id,
          skill: exercise.skill,
          status: "new",
          masteryPermille: 0,
          attemptCount: 0,
          successfulAttempts: 0,
          consecutiveCorrect: 0,
          dueAt: null,
          algorithmVersion: SRS_ALGORITHM_VERSION,
        };
      }

      return {
        exerciseId: exercise.id,
        skill: exercise.skill,
        status: state.status,
        masteryPermille: state.masteryPermille,
        attemptCount: state.attemptCount,
        successfulAttempts: state.successfulAttempts,
        consecutiveCorrect: state.consecutiveCorrect,
        dueAt: state.dueAt,
        algorithmVersion: state.algorithmVersion,
      };
    }),
  });
}
