import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  SRS_ALGORITHM_VERSION,
  applyAttemptToState,
  createInitialLearnerItemState,
  evaluateAttempt,
  projectLearnerItemState,
  type AttemptEvent,
  type AttemptSubmission,
  type ExerciseAnswerKey,
} from "../src/index";

const ids = {
  event: "00000000-0000-4000-8000-000000000001",
  device: "00000000-0000-4000-8000-000000000002",
  user: "00000000-0000-4000-8000-000000000003",
  exercise: "00000000-0000-4000-8000-000000000004",
  item: "00000000-0000-4000-8000-000000000005",
  correctOption: "00000000-0000-4000-8000-000000000006",
  wrongOption: "00000000-0000-4000-8000-000000000007",
  contentVersionId: "00000000-0000-4000-8000-000000000008",
} as const;

const answerKey: ExerciseAnswerKey = {
  exerciseId: ids.exercise,
  itemId: ids.item,
  correctOptionId: ids.correctOption,
  skill: "listening",
  contentVersionId: ids.contentVersionId,
};

function submission(
  eventId: string,
  selectedOptionId: string,
  answeredAt: string,
): AttemptSubmission {
  return {
    eventId,
    deviceId: ids.device,
    exerciseId: ids.exercise,
    selectedOptionId,
    answeredAt,
    durationMs: 1_200,
    contentVersionId: ids.contentVersionId,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function event(
  sequence: number,
  rating: 0 | 1,
  answeredAt: string,
): AttemptEvent {
  const eventId = `00000000-0000-4000-8000-${sequence.toString().padStart(12, "0")}`;
  return evaluateAttempt(
    submission(
      eventId,
      rating === 1 ? ids.correctOption : ids.wrongOption,
      answeredAt,
    ),
    answerKey,
    ids.user,
  );
}

describe("evaluateAttempt", () => {
  it("calcule la note depuis la clé serveur", () => {
    const correct = evaluateAttempt(
      submission(ids.event, ids.correctOption, "2026-08-01T08:00:00.000Z"),
      answerKey,
      ids.user,
    );
    const incorrect = evaluateAttempt(
      submission(ids.event, ids.wrongOption, "2026-08-01T08:00:00.000Z"),
      answerKey,
      ids.user,
    );

    expect(correct.rating).toBe(1);
    expect(incorrect.rating).toBe(0);
    expect(correct).toMatchObject({
      itemId: answerKey.itemId,
      skill: answerKey.skill,
    });
  });

  it("écrase toute cible injectée avec la clé serveur", () => {
    const untrusted = {
      ...submission(ids.event, ids.correctOption, "2026-08-01T08:00:00.000Z"),
      itemId: "00000000-0000-4000-8000-000000000099",
      skill: "tone",
    } as AttemptSubmission;

    expect(evaluateAttempt(untrusted, answerKey, ids.user)).toMatchObject({
      itemId: answerKey.itemId,
      skill: answerKey.skill,
    });
  });

  it("refuse une version de contenu qui ne correspond pas", () => {
    expect(() =>
      evaluateAttempt(
        {
          ...submission(
            ids.event,
            ids.correctOption,
            "2026-08-01T08:00:00.000Z",
          ),
          contentVersionId: "00000000-0000-4000-8000-000000000099",
        },
        answerKey,
        ids.user,
      ),
    ).toThrow(/version du contenu/i);
  });

  it("refuse une version d'algorithme inconnue", () => {
    expect(() =>
      evaluateAttempt(
        {
          ...submission(
            ids.event,
            ids.correctOption,
            "2026-08-01T08:00:00.000Z",
          ),
          algorithmVersion: "srs-v99",
        },
        answerKey,
        ids.user,
      ),
    ).toThrow(/version SRS/i);
  });
});

describe("SRS v0", () => {
  it("applique les intervalles 1, 3 et 7 jours puis confirme la maîtrise", () => {
    const events = [
      event(1, 1, "2026-08-01T08:00:00.000Z"),
      event(2, 1, "2026-08-02T08:00:00.000Z"),
      event(3, 1, "2026-08-05T08:00:00.000Z"),
    ];

    const first = applyAttemptToState(
      createInitialLearnerItemState(ids.item, "listening"),
      events[0]!,
    );
    const second = applyAttemptToState(first, events[1]!);
    const third = applyAttemptToState(second, events[2]!);

    expect(first.dueAt).toBe("2026-08-02T08:00:00.000Z");
    expect(second.dueAt).toBe("2026-08-05T08:00:00.000Z");
    expect(third.dueAt).toBe("2026-08-12T08:00:00.000Z");
    expect(third).toMatchObject({
      masteryScore: 750,
      status: "confirmed",
      successfulAttempts: 3,
    });
  });

  it("programme un nouvel essai dix minutes après une erreur", () => {
    const state = applyAttemptToState(
      createInitialLearnerItemState(ids.item, "listening"),
      event(1, 0, "2026-08-01T08:00:00.000Z"),
    );

    expect(state.masteryScore).toBe(0);
    expect(state.dueAt).toBe("2026-08-01T08:10:00.000Z");
    expect(state.status).toBe("learning");
  });

  it("ne mute ni les événements ni l'état initial", () => {
    const initial = createInitialLearnerItemState(ids.item, "listening");
    const attempt = event(1, 1, "2026-08-01T08:00:00.000Z");
    const initialSnapshot = structuredClone(initial);
    const attemptSnapshot = structuredClone(attempt);

    applyAttemptToState(initial, attempt);

    expect(initial).toEqual(initialSnapshot);
    expect(attempt).toEqual(attemptSnapshot);
  });

  it("maintient toujours la maîtrise dans l'intervalle 0..1000", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 100 }), (answers) => {
        const attempts = answers.map((isCorrect, index) =>
          event(
            index + 1,
            isCorrect ? 1 : 0,
            new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString(),
          ),
        );
        const state = projectLearnerItemState(ids.item, "listening", attempts);

        expect(state.masteryScore).toBeGreaterThanOrEqual(0);
        expect(state.masteryScore).toBeLessThanOrEqual(1_000);
      }),
    );
  });
});
