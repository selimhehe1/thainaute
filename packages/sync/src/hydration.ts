import {
  attemptOutboxSnapshotSchema,
  type AttemptOutboxSnapshot,
} from "./outbox";
import {
  progressSnapshotResponseSchema,
  type ProgressSnapshotResponse,
} from "./client-contracts";

/**
 * Hydrate la projection complète sans toucher aux tentatives locales. Une
 * réponse plus ancienne que le curseur déjà appliqué est ignorée.
 */
export function applyProgressSnapshot(
  snapshotInput: AttemptOutboxSnapshot,
  responseInput: ProgressSnapshotResponse,
): AttemptOutboxSnapshot {
  const snapshot = attemptOutboxSnapshotSchema.parse(snapshotInput);
  const response = progressSnapshotResponseSchema.parse(responseInput);
  if (response.syncRevision < snapshot.syncRevision) return snapshot;

  return attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    syncRevision: response.syncRevision,
    authoritativeStates: response.states,
  });
}
