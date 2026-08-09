import {
  AttemptEvaluationError,
  compareAttemptOrder,
  evaluateAttempt,
  projectLearnerItemState,
  type AnyExerciseAnswerKey,
  type AttemptEvent,
  type AttemptSubmission,
  type LearnerItemState,
} from "@thainaute/domain";

export type LearnerIdentity =
  | { readonly kind: "account"; readonly userId: string }
  | { readonly kind: "device"; readonly deviceId: string };

export interface LearnerItemProjection {
  readonly learner: LearnerIdentity;
  readonly state: LearnerItemState;
}

export type RejectionCode =
  "answer_key_not_found" | "invalid_submission" | "event_id_collision";

export interface RejectedAttempt {
  readonly eventId: string;
  readonly code: RejectionCode;
  readonly reason: string;
}

export interface AttemptIngestionInput {
  readonly existingEvents: readonly AttemptEvent[];
  readonly submissions: readonly AttemptSubmission[];
  readonly answerKeys: readonly AnyExerciseAnswerKey[];
  /** Identité issue de la session serveur, jamais du corps client. */
  readonly authenticatedUserId: string | null;
}

export interface AttemptIngestionResult {
  readonly events: readonly AttemptEvent[];
  readonly projections: readonly LearnerItemProjection[];
  readonly acceptedEventIds: readonly string[];
  readonly duplicateEventIds: readonly string[];
  readonly rejected: readonly RejectedAttempt[];
}

export class EventIdentityCollisionError extends Error {
  public readonly eventId: string;

  public constructor(eventId: string) {
    super(`L'identifiant d'événement ${eventId} désigne plusieurs tentatives.`);
    this.name = "EventIdentityCollisionError";
    this.eventId = eventId;
  }
}

export class AnswerKeyIdentityCollisionError extends Error {
  public readonly exerciseId: string;
  public readonly contentVersionId: string;

  public constructor(exerciseId: string, contentVersionId: string) {
    super(
      `Plusieurs clés de correction divergent pour ${exerciseId} (${contentVersionId}).`,
    );
    this.name = "AnswerKeyIdentityCollisionError";
    this.exerciseId = exerciseId;
    this.contentVersionId = contentVersionId;
  }
}

function eventsAreEqual(left: AttemptEvent, right: AttemptEvent): boolean {
  return (
    left.eventId === right.eventId &&
    left.deviceId === right.deviceId &&
    left.userId === right.userId &&
    left.exerciseId === right.exerciseId &&
    left.itemId === right.itemId &&
    left.selectedOptionId === right.selectedOptionId &&
    answersAreEqual(left.answer, right.answer) &&
    left.skill === right.skill &&
    left.answeredAt === right.answeredAt &&
    left.durationMs === right.durationMs &&
    left.contentVersionId === right.contentVersionId &&
    left.algorithmVersion === right.algorithmVersion &&
    left.rating === right.rating
  );
}

function answersAreEqual(
  left: AttemptEvent["answer"],
  right: AttemptEvent["answer"],
): boolean {
  if (left === undefined || right === undefined) return left === right;
  if (left.kind !== right.kind) return false;
  if (left.kind === "recall") {
    return (
      right.kind === "recall" &&
      left.value === right.value &&
      left.missedOnce === right.missedOnce
    );
  }
  if (left.kind === "word_order") {
    return (
      right.kind === "word_order" &&
      left.tokenIds.length === right.tokenIds.length &&
      left.missedOnce === right.missedOnce &&
      left.tokenIds.every((tokenId, index) => tokenId === right.tokenIds[index])
    );
  }
  return (
    right.kind === "association" &&
    left.pairs.length === right.pairs.length &&
    left.pairs.every(
      (pair, index) =>
        pair.promptPairId === right.pairs[index]?.promptPairId &&
        pair.chosenPairId === right.pairs[index]?.chosenPairId,
    ) &&
    left.missedOnce === right.missedOnce
  );
}

function normalizeJournal(events: readonly AttemptEvent[]): AttemptEvent[] {
  const byEventId = new Map<string, AttemptEvent>();

  for (const event of events) {
    const existing = byEventId.get(event.eventId);

    if (existing === undefined) {
      byEventId.set(event.eventId, event);
    } else if (!eventsAreEqual(existing, event)) {
      throw new EventIdentityCollisionError(event.eventId);
    }
  }

  return [...byEventId.values()].sort(compareAttemptOrder);
}

function learnerIdentity(event: AttemptEvent): LearnerIdentity {
  return event.userId === null
    ? { kind: "device", deviceId: event.deviceId }
    : { kind: "account", userId: event.userId };
}

function learnerKey(identity: LearnerIdentity): string {
  return identity.kind === "account"
    ? `account:${identity.userId}`
    : `device:${identity.deviceId}`;
}

function projectionKey(event: AttemptEvent): string {
  return `${learnerKey(learnerIdentity(event))}\u0000${event.itemId}\u0000${event.skill}`;
}

/**
 * Reconstruit les états à partir du journal. Les doublons identiques sont
 * ignorés ; une collision d'identité est une erreur d'intégrité explicite.
 */
export function projectAttemptEvents(
  events: readonly AttemptEvent[],
): readonly LearnerItemProjection[] {
  const normalizedEvents = normalizeJournal(events);
  const groups = new Map<
    string,
    { learner: LearnerIdentity; events: AttemptEvent[] }
  >();

  for (const event of normalizedEvents) {
    const key = projectionKey(event);
    const group = groups.get(key);

    if (group === undefined) {
      groups.set(key, { learner: learnerIdentity(event), events: [event] });
    } else {
      group.events.push(event);
    }
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) => {
      const firstEvent = group.events[0];

      if (firstEvent === undefined) {
        throw new Error("Un groupe de projection ne peut pas être vide.");
      }

      return {
        learner: group.learner,
        state: projectLearnerItemState(
          firstEvent.itemId,
          firstEvent.skill,
          group.events,
        ),
      };
    });
}

function answerKeyIndex(
  answerKeys: readonly AnyExerciseAnswerKey[],
): ReadonlyMap<string, AnyExerciseAnswerKey> {
  const index = new Map<string, AnyExerciseAnswerKey>();

  for (const answerKey of answerKeys) {
    const key = `${answerKey.exerciseId}\u0000${answerKey.contentVersionId}`;
    const existing = index.get(key);

    if (
      existing !== undefined &&
      JSON.stringify(existing) !== JSON.stringify(answerKey)
    ) {
      throw new AnswerKeyIdentityCollisionError(
        answerKey.exerciseId,
        answerKey.contentVersionId,
      );
    }

    index.set(key, answerKey);
  }

  return index;
}

function findAnswerKey(
  index: ReadonlyMap<string, AnyExerciseAnswerKey>,
  submission: AttemptSubmission,
): AnyExerciseAnswerKey | undefined {
  return index.get(
    `${submission.exerciseId}\u0000${submission.contentVersionId}`,
  );
}

/**
 * Évalue et ingère un lot sans modifier le journal fourni. La persistance et
 * la transaction restent la responsabilité de l'adaptateur serveur.
 */
export function ingestAttemptBatch(
  input: AttemptIngestionInput,
): AttemptIngestionResult {
  const events = normalizeJournal(input.existingEvents);
  const byEventId = new Map<string, AttemptEvent>(
    events.map((event) => [event.eventId, event] as const),
  );
  const keys = answerKeyIndex(input.answerKeys);
  const acceptedEventIds: string[] = [];
  const duplicateEventIds: string[] = [];
  const rejected: RejectedAttempt[] = [];

  for (const submission of input.submissions) {
    const answerKey = findAnswerKey(keys, submission);

    if (answerKey === undefined) {
      rejected.push({
        eventId: submission.eventId,
        code: "answer_key_not_found",
        reason: "Aucune clé de correction ne correspond à cette release.",
      });
      continue;
    }

    let evaluated: AttemptEvent;

    try {
      evaluated = evaluateAttempt(
        submission,
        answerKey,
        input.authenticatedUserId,
      );
    } catch (error) {
      const reason =
        error instanceof AttemptEvaluationError
          ? error.message
          : "La tentative ne peut pas être évaluée.";
      rejected.push({
        eventId: submission.eventId,
        code: "invalid_submission",
        reason,
      });
      continue;
    }

    const existing = byEventId.get(evaluated.eventId);

    if (existing !== undefined) {
      if (eventsAreEqual(existing, evaluated)) {
        duplicateEventIds.push(evaluated.eventId);
      } else {
        rejected.push({
          eventId: evaluated.eventId,
          code: "event_id_collision",
          reason: "Cet eventId existe déjà avec un contenu différent.",
        });
      }
      continue;
    }

    events.push(evaluated);
    byEventId.set(evaluated.eventId, evaluated);
    acceptedEventIds.push(evaluated.eventId);
  }

  const orderedEvents = [...events].sort(compareAttemptOrder);

  return {
    events: orderedEvents,
    projections: projectAttemptEvents(orderedEvents),
    acceptedEventIds,
    duplicateEventIds,
    rejected,
  };
}
