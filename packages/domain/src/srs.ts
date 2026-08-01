import {
  SRS_ALGORITHM_VERSION,
  type AttemptEvent,
  type AttemptRating,
  type SkillDimension,
} from "./attempt";

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const INCORRECT_DELAY_MS = 10 * MINUTE_MS;
const CORRECT_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
const MASTERY_STEP = 250;
const MAX_MASTERY = 1_000;
const CONFIRMED_MASTERY = 750;
const CONFIRMED_SUCCESS_COUNT = 3;

export type MasteryStatus = "new" | "learning" | "confirmed";

export interface LearnerItemState {
  readonly itemId: string;
  readonly skill: SkillDimension;
  readonly masteryScore: number;
  readonly status: MasteryStatus;
  readonly totalAttempts: number;
  readonly successfulAttempts: number;
  readonly consecutiveCorrect: number;
  readonly lastRating: AttemptRating | null;
  readonly lastAnsweredAt: string | null;
  readonly lastEventId: string | null;
  readonly dueAt: string | null;
  readonly algorithmVersion: typeof SRS_ALGORITHM_VERSION;
}

export function initialLearnerItemState(
  itemId: string,
  skill: SkillDimension,
): LearnerItemState {
  return {
    itemId,
    skill,
    masteryScore: 0,
    status: "new",
    totalAttempts: 0,
    successfulAttempts: 0,
    consecutiveCorrect: 0,
    lastRating: null,
    lastAnsweredAt: null,
    lastEventId: null,
    dueAt: null,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

/** Alias explicite pour les appelants qui préfèrent le vocabulaire de fabrique. */
export const createInitialLearnerItemState = initialLearnerItemState;

export function compareAttemptOrder(
  left: Pick<AttemptEvent, "answeredAt" | "eventId">,
  right: Pick<AttemptEvent, "answeredAt" | "eventId">,
): number {
  const timeDifference =
    Date.parse(left.answeredAt) - Date.parse(right.answeredAt);
  return timeDifference === 0
    ? left.eventId.localeCompare(right.eventId)
    : timeDifference;
}

function computeStatus(
  masteryScore: number,
  successfulAttempts: number,
): Exclude<MasteryStatus, "new"> {
  return masteryScore >= CONFIRMED_MASTERY &&
    successfulAttempts >= CONFIRMED_SUCCESS_COUNT
    ? "confirmed"
    : "learning";
}

function addMilliseconds(isoTimestamp: string, milliseconds: number): string {
  const timestamp = Date.parse(isoTimestamp);

  if (!Number.isFinite(timestamp)) {
    throw new RangeError("answeredAt doit être un horodatage ISO valide.");
  }

  return new Date(timestamp + milliseconds).toISOString();
}

function assertEventCanFollow(
  state: LearnerItemState,
  event: AttemptEvent,
): void {
  if (state.itemId !== event.itemId || state.skill !== event.skill) {
    throw new RangeError("La tentative ne correspond pas à l'état projeté.");
  }

  if (event.algorithmVersion !== SRS_ALGORITHM_VERSION) {
    throw new RangeError(
      "La version de l'algorithme SRS n'est pas prise en charge.",
    );
  }

  if (event.rating !== 0 && event.rating !== 1) {
    throw new RangeError("La note doit valoir 0 ou 1.");
  }

  if (state.lastAnsweredAt !== null && state.lastEventId !== null) {
    const previous = {
      answeredAt: state.lastAnsweredAt,
      eventId: state.lastEventId,
    };

    if (compareAttemptOrder(event, previous) < 0) {
      throw new RangeError(
        "Les tentatives doivent être appliquées dans l'ordre.",
      );
    }
  }
}

/** Applique un événement sans muter l'état fourni. */
export function applyAttemptToState(
  state: LearnerItemState,
  event: AttemptEvent,
): LearnerItemState {
  assertEventCanFollow(state, event);

  const wasCorrect = event.rating === 1;
  const successfulAttempts = state.successfulAttempts + (wasCorrect ? 1 : 0);
  const consecutiveCorrect = wasCorrect ? state.consecutiveCorrect + 1 : 0;
  const masteryScore = wasCorrect
    ? Math.min(MAX_MASTERY, state.masteryScore + MASTERY_STEP)
    : Math.max(0, state.masteryScore - MASTERY_STEP);

  const correctIntervalIndex = Math.min(
    Math.max(0, consecutiveCorrect - 1),
    CORRECT_INTERVAL_DAYS.length - 1,
  );
  const correctIntervalDays = CORRECT_INTERVAL_DAYS[correctIntervalIndex] ?? 30;
  const delayMs = wasCorrect
    ? correctIntervalDays * DAY_MS
    : INCORRECT_DELAY_MS;

  return {
    itemId: state.itemId,
    skill: state.skill,
    masteryScore,
    status: computeStatus(masteryScore, successfulAttempts),
    totalAttempts: state.totalAttempts + 1,
    successfulAttempts,
    consecutiveCorrect,
    lastRating: event.rating,
    lastAnsweredAt: event.answeredAt,
    lastEventId: event.eventId,
    dueAt: addMilliseconds(event.answeredAt, delayMs),
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

/** Recalcule une projection complète depuis un journal éventuellement désordonné. */
export function projectLearnerItemState(
  itemId: string,
  skill: SkillDimension,
  events: readonly AttemptEvent[],
): LearnerItemState {
  const orderedEvents = [...events].sort(compareAttemptOrder);

  return orderedEvents.reduce(
    (state, event) => applyAttemptToState(state, event),
    initialLearnerItemState(itemId, skill),
  );
}
