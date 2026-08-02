import type { AttemptEvent, LearnerItemState } from "@thainaute/domain";
import {
  attemptBatchResponseSchema,
  ingestAttemptBatch,
  type AttemptBatchResponse,
  type AttemptBatchResult,
  type AttemptRejectionCode,
  type LearnerItemState as PublicLearnerItemState,
  type RejectedAttempt,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";

import { answerKeyIdentity, indexServerAnswerKeys } from "./answer-key-index";
import { hashAttemptBatch } from "./canonical-json";
import { AttemptApiError, AttemptInfrastructureError } from "./errors";
import type {
  AttemptProjectionWrite,
  AttemptRepository,
  AttemptSyncSnapshot,
  SyncAttemptBatchInput,
} from "./ports";

const MAX_COMMIT_ATTEMPTS = 3;
const MAX_ANSWER_AGE_MS = 30 * 24 * 60 * 60 * 1_000;
const MAX_FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1_000;

export type AttemptSyncClock = () => number;

export interface AttemptBatchSynchronizerOptions {
  readonly activeReleaseId: string;
  readonly clock?: AttemptSyncClock;
}

function attemptKey(attempt: {
  readonly itemId: string;
  readonly skill: string;
}): string {
  return `${attempt.itemId}\u0000${attempt.skill}`;
}

function preflightRejections(
  snapshot: AttemptSyncSnapshot,
  attempts: readonly ValidatedAttemptSubmission[],
  serverNowMs: number,
): ReadonlyMap<string, AttemptRejectionCode> {
  const registeredDevices = new Set(snapshot.registeredDeviceIds);
  const collidingEvents = new Set(snapshot.collidingEventIds);
  const existingEventIds = new Set(
    snapshot.existingEvents.map((event) => event.eventId),
  );
  const answerKeys = indexServerAnswerKeys(snapshot.answerKeys);
  const rejected = new Map<string, AttemptRejectionCode>();

  for (const attempt of attempts) {
    if (!registeredDevices.has(attempt.deviceId)) {
      rejected.set(attempt.eventId, "device_not_registered");
      continue;
    }

    if (collidingEvents.has(attempt.eventId)) {
      rejected.set(attempt.eventId, "event_id_collision");
      continue;
    }

    // Un UUID déjà connu doit atteindre l'ingestion pour être classé comme
    // doublon ou collision, même si son horodatage a depuis quitté la fenêtre.
    // Les nouvelles tentatives conservent leur answeredAt exact : aucun clamp
    // ne doit modifier l'identité idempotente de l'événement.
    if (!existingEventIds.has(attempt.eventId)) {
      const answeredAtMs = Date.parse(attempt.answeredAt);
      if (
        answeredAtMs < serverNowMs - MAX_ANSWER_AGE_MS ||
        answeredAtMs > serverNowMs + MAX_FUTURE_CLOCK_SKEW_MS
      ) {
        rejected.set(attempt.eventId, "invalid_submission");
        continue;
      }
    }

    const answerKey = answerKeys.get(answerKeyIdentity(attempt));
    if (
      answerKey !== undefined &&
      !answerKey.validOptionIds.includes(attempt.selectedOptionId)
    ) {
      rejected.set(attempt.eventId, "invalid_submission");
    }
  }

  return rejected;
}

function toPublicState(state: LearnerItemState): PublicLearnerItemState {
  if (state.dueAt === null || state.totalAttempts < 1) {
    throw new AttemptApiError("internal_error");
  }

  return {
    itemId: state.itemId,
    skill: state.skill,
    masteryPermille: state.masteryScore,
    status: state.status,
    attemptCount: state.totalAttempts,
    successfulAttempts: state.successfulAttempts,
    consecutiveCorrect: state.consecutiveCorrect,
    dueAt: state.dueAt,
    algorithmVersion: state.algorithmVersion,
  };
}

function projectionWrites(
  projections: ReturnType<typeof ingestAttemptBatch>["projections"],
  affectedKeys: ReadonlySet<string>,
  events: readonly AttemptEvent[],
  userId: string,
): readonly AttemptProjectionWrite[] {
  const eventById = new Map(events.map((event) => [event.eventId, event]));

  return projections
    .filter(
      (projection) =>
        projection.learner.kind === "account" &&
        projection.learner.userId === userId &&
        affectedKeys.has(attemptKey(projection.state)),
    )
    .map((projection) => {
      const lastEventId = projection.state.lastEventId;
      const lastEvent =
        lastEventId === null ? undefined : eventById.get(lastEventId);

      if (lastEvent === undefined) {
        throw new AttemptApiError("internal_error");
      }

      return {
        state: projection.state,
        contentVersionId: lastEvent.contentVersionId,
      };
    });
}

function buildCandidate(
  snapshot: AttemptSyncSnapshot,
  attempts: readonly ValidatedAttemptSubmission[],
  userId: string,
  serverNowMs: number,
): {
  readonly response: AttemptBatchResponse;
  readonly acceptedEvents: readonly AttemptEvent[];
  readonly projections: readonly AttemptProjectionWrite[];
} {
  const preflight = preflightRejections(snapshot, attempts, serverNowMs);
  const answerKeys = indexServerAnswerKeys(snapshot.answerKeys);
  const eligibleAttempts = attempts.filter(
    (attempt) => !preflight.has(attempt.eventId),
  );
  const ingestion = ingestAttemptBatch({
    authenticatedUserId: userId,
    existingEvents: snapshot.existingEvents,
    submissions: eligibleAttempts,
    answerKeys: snapshot.answerKeys,
  });

  const acceptedIds = new Set(ingestion.acceptedEventIds);
  const duplicateIds = new Set(ingestion.duplicateEventIds);
  const rejected = new Map<string, RejectedAttempt>(
    ingestion.rejected.map((entry) => [entry.eventId, entry]),
  );
  const eventById = new Map(
    ingestion.events.map((event) => [event.eventId, event]),
  );
  const affectedKeys = new Set<string>();

  const results: AttemptBatchResult[] = attempts.map((attempt) => {
    const preflightCode = preflight.get(attempt.eventId);
    if (preflightCode !== undefined) {
      return {
        eventId: attempt.eventId,
        status: "rejected",
        code: preflightCode,
      };
    }

    const event = eventById.get(attempt.eventId);
    if (acceptedIds.has(attempt.eventId) && event !== undefined) {
      const answerKey = answerKeys.get(answerKeyIdentity(attempt));
      if (answerKey === undefined) throw new AttemptApiError("internal_error");
      affectedKeys.add(attemptKey(event));
      return {
        eventId: attempt.eventId,
        status: "accepted",
        rating: event.rating,
        feedbackFr:
          event.rating === 1
            ? answerKey.feedback.correctFr
            : answerKey.feedback.incorrectFr,
      };
    }

    if (duplicateIds.has(attempt.eventId) && event !== undefined) {
      const answerKey = answerKeys.get(answerKeyIdentity(attempt));
      if (answerKey === undefined) throw new AttemptApiError("internal_error");
      affectedKeys.add(attemptKey(event));
      return {
        eventId: attempt.eventId,
        status: "duplicate",
        rating: event.rating,
        feedbackFr:
          event.rating === 1
            ? answerKey.feedback.correctFr
            : answerKey.feedback.incorrectFr,
      };
    }

    const rejection = rejected.get(attempt.eventId);
    if (rejection !== undefined) {
      return {
        eventId: attempt.eventId,
        status: "rejected",
        code: rejection.code,
      };
    }

    throw new AttemptApiError("internal_error");
  });

  const writes = projectionWrites(
    ingestion.projections,
    affectedKeys,
    ingestion.events,
    userId,
  );
  const states = writes
    .map(({ state }) => toPublicState(state))
    .sort((left, right) => attemptKey(left).localeCompare(attemptKey(right)));
  const response = attemptBatchResponseSchema.parse({
    syncRevision: snapshot.revision + 1,
    results,
    states,
  });

  return {
    response,
    acceptedEvents: ingestion.events.filter((event) =>
      acceptedIds.has(event.eventId),
    ),
    projections: writes,
  };
}

function currentContentEligibility(
  snapshot: AttemptSyncSnapshot,
  attempts: readonly ValidatedAttemptSubmission[],
): readonly unknown[] {
  const answerKeys = indexServerAnswerKeys(snapshot.answerKeys);
  return attempts.map((attempt) => {
    const answerKey = answerKeys.get(answerKeyIdentity(attempt));
    return answerKey === undefined
      ? null
      : {
          contentVersionId: answerKey.contentVersionId,
          correctOptionId: answerKey.correctOptionId,
          exerciseId: answerKey.exerciseId,
          feedback: answerKey.feedback,
          itemId: answerKey.itemId,
          skill: answerKey.skill,
          validOptionIds: answerKey.validOptionIds,
        };
  });
}

export function createAttemptBatchSynchronizer(
  repository: AttemptRepository,
  options: AttemptBatchSynchronizerOptions,
) {
  return async function synchronizeAttemptBatch(
    input: SyncAttemptBatchInput,
  ): Promise<AttemptBatchResponse> {
    const serverNowMs = (options.clock ?? Date.now)();

    if (!Number.isFinite(serverNowMs)) {
      throw new AttemptApiError("internal_error");
    }

    for (
      let commitAttempt = 0;
      commitAttempt < MAX_COMMIT_ATTEMPTS;
      commitAttempt += 1
    ) {
      let snapshot: AttemptSyncSnapshot;
      try {
        snapshot = await repository.loadSnapshot({
          userId: input.userId,
          attempts: input.batch.attempts,
        });
      } catch (error) {
        if (error instanceof AttemptInfrastructureError) throw error;
        throw new AttemptInfrastructureError("database_unavailable");
      }

      // L'éligibilité et les corrections autoritaires courantes font partie du
      // hash, jamais du corps public. Un retry après révocation rencontre donc
      // un conflit fermé au lieu de rejouer une ancienne correction. Une
      // première soumission mixte garde en revanche ses rejets par tentative.
      const requestSha256 = hashAttemptBatch(
        input.batch,
        options.activeReleaseId,
        currentContentEligibility(snapshot, input.batch.attempts),
      );
      const candidate = buildCandidate(
        snapshot,
        input.batch.attempts,
        input.userId,
        serverNowMs,
      );
      let commitResult;
      try {
        commitResult = await repository.commit({
          userId: input.userId,
          idempotencyKey: input.idempotencyKey,
          requestSha256,
          expectedRevision: snapshot.revision,
          events: candidate.acceptedEvents,
          projections: candidate.projections,
          response: candidate.response,
        });
      } catch (error) {
        if (error instanceof AttemptInfrastructureError) throw error;
        throw new AttemptInfrastructureError("database_unavailable");
      }

      if (
        commitResult.kind === "committed" ||
        commitResult.kind === "replayed"
      ) {
        return attemptBatchResponseSchema.parse(commitResult.response);
      }

      if (commitResult.kind === "idempotency_conflict") {
        throw new AttemptApiError("idempotency_key_reused");
      }

      // Une révision ou un UUID concurrent exige de recharger puis recalculer.
      if (
        commitResult.kind === "revision_conflict" ||
        commitResult.kind === "event_collision"
      ) {
        continue;
      }
    }

    throw new AttemptApiError("concurrent_update");
  };
}
