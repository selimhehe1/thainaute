import type {
  AttemptEvent,
  ExerciseAnswerKey,
  LearnerItemState as DomainLearnerItemState,
} from "@thainaute/domain";
import type {
  AttemptBatch,
  AttemptBatchResponse,
  ValidatedAttemptSubmission,
} from "@thainaute/sync";

export interface ServerExerciseAnswerKey extends ExerciseAnswerKey {
  readonly validOptionIds: readonly string[];
  readonly feedback: {
    readonly correctFr: string;
    readonly incorrectFr: string;
  };
}

export interface AttemptSyncSnapshot {
  readonly revision: number;
  readonly registeredDeviceIds: readonly string[];
  /** Événements du compte requis pour reconstruire les projections touchées. */
  readonly existingEvents: readonly AttemptEvent[];
  /** UUID déjà employé par un événement qui n'appartient pas à ce compte. */
  readonly collidingEventIds: readonly string[];
  readonly answerKeys: readonly ServerExerciseAnswerKey[];
}

export interface LoadAttemptSnapshotInput {
  readonly userId: string;
  readonly attempts: readonly ValidatedAttemptSubmission[];
}

export interface AttemptProjectionWrite {
  readonly state: DomainLearnerItemState;
  readonly contentVersionId: string;
}

export interface CommitAttemptBatchInput {
  readonly userId: string;
  readonly idempotencyKey: string;
  readonly requestSha256: string;
  readonly expectedRevision: number;
  readonly events: readonly AttemptEvent[];
  readonly projections: readonly AttemptProjectionWrite[];
  readonly response: AttemptBatchResponse;
}

export type CommitAttemptBatchResult =
  | {
      readonly kind: "committed" | "replayed";
      readonly response: AttemptBatchResponse;
    }
  | { readonly kind: "revision_conflict" }
  | { readonly kind: "idempotency_conflict" }
  | { readonly kind: "event_collision" };

export interface AttemptRepository {
  loadSnapshot(input: LoadAttemptSnapshotInput): Promise<AttemptSyncSnapshot>;
  commit(input: CommitAttemptBatchInput): Promise<CommitAttemptBatchResult>;
}

export interface SyncAttemptBatchInput {
  readonly userId: string;
  readonly idempotencyKey: string;
  readonly batch: AttemptBatch;
}

export interface AccessTokenVerifier {
  verify(accessToken: string): Promise<{ readonly userId: string }>;
}
