import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  SRS_ALGORITHM_VERSION,
  evaluateAttempt,
  type AttemptEvent,
  type AttemptSubmission,
  type ExerciseAnswerKey,
} from "@thainaute/domain";

import {
  AnswerKeyIdentityCollisionError,
  API_ERROR_CODES,
  MAX_ATTEMPTS_PER_BATCH,
  apiErrorResponseSchema,
  attemptBatchSchema,
  attemptBatchResponseSchema,
  ingestAttemptBatch,
  projectAttemptEvents,
  type LearnerItemState,
} from "../src/index";

const ids = {
  deviceA: "00000000-0000-4000-8000-000000000001",
  deviceB: "00000000-0000-4000-8000-000000000002",
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

function eventId(sequence: number): string {
  return `00000000-0000-4000-8000-${sequence.toString().padStart(12, "0")}`;
}

function submission(
  sequence: number,
  options: {
    readonly correct?: boolean;
    readonly deviceId?: string;
    readonly answeredAt?: string;
  } = {},
): AttemptSubmission {
  return {
    eventId: eventId(sequence),
    deviceId: options.deviceId ?? ids.deviceA,
    exerciseId: ids.exercise,
    selectedOptionId:
      options.correct === false ? ids.wrongOption : ids.correctOption,
    answeredAt:
      options.answeredAt ??
      new Date(Date.UTC(2026, 7, 1, 8, sequence)).toISOString(),
    durationMs: 1_000,
    contentVersionId: ids.contentVersionId,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function evaluated(sequence: number, correct = true): AttemptEvent {
  return evaluateAttempt(
    submission(sequence, { correct }),
    answerKey,
    ids.user,
  );
}

function state(
  itemSequence: number,
  skill: LearnerItemState["skill"] = "listening",
): LearnerItemState {
  return {
    itemId: eventId(itemSequence),
    skill,
    masteryPermille: 250,
    status: "learning",
    attemptCount: 1,
    successfulAttempts: 1,
    consecutiveCorrect: 1,
    dueAt: "2026-08-02T08:01:00.000Z",
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

describe("contrat Zod de synchronisation", () => {
  it("accepte une soumission canonique", () => {
    expect(
      attemptBatchSchema.parse({ attempts: [submission(1)] }).attempts,
    ).toHaveLength(1);
  });

  it("normalise un instant avec décalage vers UTC avant le hash et le journal", () => {
    const parsed = attemptBatchSchema.parse({
      attempts: [
        submission(1, { answeredAt: "2026-08-01T10:00:00.000+02:00" }),
      ],
    });

    expect(parsed.attempts[0]?.answeredAt).toBe("2026-08-01T08:00:00.000Z");
  });

  it("normalise tous les UUID avant la déduplication et le hash", () => {
    const canonicalEventId = "abcdefab-cdef-4abc-8def-abcdefabcdef";
    const uppercase = {
      ...submission(1),
      eventId: canonicalEventId.toUpperCase(),
    };
    const parsed = attemptBatchSchema.parse({ attempts: [uppercase] });

    expect(parsed.attempts[0]?.eventId).toBe(canonicalEventId);
  });

  it("refuse les résultats métier envoyés par le client", () => {
    const result = attemptBatchSchema.safeParse({
      attempts: [{ ...submission(1), rating: 1, mastery: 1_000 }],
    });

    expect(result.success).toBe(false);
  });

  it("refuse un userId fourni par le client", () => {
    const result = attemptBatchSchema.safeParse({
      attempts: [{ ...submission(1), userId: ids.user }],
    });

    expect(result.success).toBe(false);
  });

  it("refuse itemId et skill fournis par le client", () => {
    const result = attemptBatchSchema.safeParse({
      attempts: [
        {
          ...submission(1),
          itemId: "00000000-0000-4000-8000-000000000099",
          skill: "tone",
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("limite un lot à cinquante tentatives", () => {
    const attempts = Array.from({ length: 51 }, (_, index) =>
      submission(index + 1),
    );

    expect(attemptBatchSchema.safeParse({ attempts }).success).toBe(false);
  });

  it("refuse deux occurrences du même eventId dans un lot", () => {
    const result = attemptBatchSchema.safeParse({
      attempts: [submission(1), submission(1)],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({ path: ["attempts", 1, "eventId"] }),
      ]);
    }
  });

  it("valide une réponse autoritaire et un lot entièrement rejeté", () => {
    const acceptedResponse = {
      syncRevision: 1,
      results: [
        { eventId: eventId(1), status: "accepted", rating: 1 },
        { eventId: eventId(2), status: "duplicate", rating: 0 },
      ],
      states: [state(10)],
    };
    const rejectedResponse = {
      syncRevision: 2,
      results: [
        {
          eventId: eventId(3),
          status: "rejected",
          code: "device_not_registered",
        },
      ],
      states: [],
    };

    expect(attemptBatchResponseSchema.safeParse(acceptedResponse).success).toBe(
      true,
    );
    expect(attemptBatchResponseSchema.safeParse(rejectedResponse).success).toBe(
      true,
    );
    expect(
      attemptBatchResponseSchema.safeParse({
        ...acceptedResponse,
        syncRevision: 0,
      }).success,
    ).toBe(false);
  });

  it("ferme chaque branche de résultat", () => {
    const rejectedWithServerRating = {
      syncRevision: 1,
      results: [
        {
          eventId: eventId(1),
          status: "rejected",
          code: "invalid_submission",
          rating: 0,
        },
      ],
      states: [],
    };
    const acceptedWithRejectionCode = {
      syncRevision: 1,
      results: [
        {
          eventId: eventId(1),
          status: "accepted",
          rating: 1,
          code: "invalid_submission",
        },
      ],
      states: [],
    };

    expect(
      attemptBatchResponseSchema.safeParse(rejectedWithServerRating).success,
    ).toBe(false);
    expect(
      attemptBatchResponseSchema.safeParse(acceptedWithRejectionCode).success,
    ).toBe(false);
  });

  it("limite l'état public aux champs explicitement prévus", () => {
    const stateWithInternalIdentity = {
      ...state(1),
      lastEventId: eventId(1),
    };

    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: [{ eventId: eventId(1), status: "accepted", rating: 1 }],
        states: [stateWithInternalIdentity],
      }).success,
    ).toBe(false);
  });

  it("applique les mêmes limites aux résultats et aux états", () => {
    const tooManyResults = Array.from(
      { length: MAX_ATTEMPTS_PER_BATCH + 1 },
      (_, index) => ({
        eventId: eventId(index + 1),
        status: "accepted" as const,
        rating: 1 as const,
      }),
    );
    const tooManyStates = Array.from(
      { length: MAX_ATTEMPTS_PER_BATCH + 1 },
      (_, index) => state(index + 1),
    );

    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: tooManyResults,
        states: [],
      }).success,
    ).toBe(false);
    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: [tooManyResults[0]],
        states: tooManyStates,
      }).success,
    ).toBe(false);
  });

  it("exige des états uniques et triés par item puis dimension", () => {
    const ordered = [state(1, "listening"), state(1, "reading"), state(2)];
    const outOfOrder = [ordered[1], ordered[0]];
    const duplicate = [ordered[0], ordered[0]];
    const result = [
      { eventId: eventId(1), status: "accepted" as const, rating: 1 as const },
    ];

    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: result,
        states: ordered,
      }).success,
    ).toBe(true);
    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: result,
        states: outOfOrder,
      }).success,
    ).toBe(false);
    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: result,
        states: duplicate,
      }).success,
    ).toBe(false);
  });

  it("refuse un état dont les compteurs sont incohérents", () => {
    const impossibleState = {
      ...state(1),
      attemptCount: 1,
      successfulAttempts: 2,
      consecutiveCorrect: 2,
    };

    expect(
      attemptBatchResponseSchema.safeParse({
        syncRevision: 1,
        results: [{ eventId: eventId(1), status: "accepted", rating: 1 }],
        states: [impossibleState],
      }).success,
    ).toBe(false);
  });

  it("ferme l'enveloppe et les codes d'erreur HTTP globaux", () => {
    const knownError = {
      error: {
        code: API_ERROR_CODES[0],
        message: "La requête est invalide.",
        requestId: "request-01",
      },
    };

    expect(apiErrorResponseSchema.safeParse(knownError).success).toBe(true);
    expect(
      apiErrorResponseSchema.safeParse({
        error: { ...knownError.error, code: "unknown_error" },
      }).success,
    ).toBe(false);
    expect(
      apiErrorResponseSchema.safeParse({
        error: { ...knownError.error, stack: "ne doit pas sortir" },
      }).success,
    ).toBe(false);
  });
});

describe("ingestion idempotente", () => {
  it("n'applique qu'une fois le même événement renvoyé", () => {
    const first = ingestAttemptBatch({
      existingEvents: [],
      submissions: [submission(1)],
      answerKeys: [answerKey],
      authenticatedUserId: ids.user,
    });
    const replay = ingestAttemptBatch({
      existingEvents: first.events,
      submissions: [submission(1)],
      answerKeys: [answerKey],
      authenticatedUserId: ids.user,
    });

    expect(first.events).toHaveLength(1);
    expect(first.events[0]).toMatchObject({
      itemId: answerKey.itemId,
      skill: answerKey.skill,
    });
    expect(replay.events).toEqual(first.events);
    expect(replay.projections).toEqual(first.projections);
    expect(replay.acceptedEventIds).toEqual([]);
    expect(replay.duplicateEventIds).toEqual([eventId(1)]);
  });

  it("reste idempotente pour tout lot rejoué", () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (answers) => {
          const batch = answers.map((correct, index) =>
            submission(index + 1, { correct }),
          );
          const first = ingestAttemptBatch({
            existingEvents: [],
            submissions: batch,
            answerKeys: [answerKey],
            authenticatedUserId: ids.user,
          });
          const replay = ingestAttemptBatch({
            existingEvents: first.events,
            submissions: batch,
            answerKeys: [answerKey],
            authenticatedUserId: ids.user,
          });

          expect(replay.events).toEqual(first.events);
          expect(replay.projections).toEqual(first.projections);
          expect(replay.acceptedEventIds).toEqual([]);
          expect(replay.duplicateEventIds).toHaveLength(batch.length);
        },
      ),
    );
  });

  it("refuse une collision d'identifiant sans remplacer l'événement", () => {
    const existing = evaluated(1);
    const collision = {
      ...submission(1),
      selectedOptionId: ids.wrongOption,
    };
    const result = ingestAttemptBatch({
      existingEvents: [existing],
      submissions: [collision],
      answerKeys: [answerKey],
      authenticatedUserId: ids.user,
    });

    expect(result.events).toEqual([existing]);
    expect(result.rejected).toEqual([
      expect.objectContaining({
        eventId: eventId(1),
        code: "event_id_collision",
      }),
    ]);
  });

  it("bloque deux clés de correction divergentes pour la même release", () => {
    expect(() =>
      ingestAttemptBatch({
        existingEvents: [],
        submissions: [submission(1)],
        answerKeys: [
          answerKey,
          { ...answerKey, correctOptionId: ids.wrongOption },
        ],
        authenticatedUserId: ids.user,
      }),
    ).toThrow(AnswerKeyIdentityCollisionError);
  });

  it("partage la projection d'un compte entre deux appareils", () => {
    const result = ingestAttemptBatch({
      existingEvents: [],
      submissions: [
        submission(1, { deviceId: ids.deviceA }),
        submission(2, { deviceId: ids.deviceB }),
      ],
      answerKeys: [answerKey],
      authenticatedUserId: ids.user,
    });

    expect(result.projections).toHaveLength(1);
    expect(result.projections[0]).toMatchObject({
      learner: { kind: "account", userId: ids.user },
      state: { totalAttempts: 2, masteryScore: 500 },
    });
  });

  it("garde les progressions anonymes séparées par appareil", () => {
    const events = [
      evaluateAttempt(
        submission(1, { deviceId: ids.deviceA }),
        answerKey,
        null,
      ),
      evaluateAttempt(
        submission(2, { deviceId: ids.deviceB }),
        answerKey,
        null,
      ),
    ];

    expect(projectAttemptEvents(events)).toHaveLength(2);
  });

  it("est invariant à l'ordre d'arrivée des événements", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 59 }), {
          minLength: 1,
          maxLength: 20,
        }),
        (sequenceNumbers) => {
          const chronological = sequenceNumbers
            .map((sequence) => evaluated(sequence, sequence % 2 === 0))
            .sort((left, right) => left.eventId.localeCompare(right.eventId));
          const reversed = [...chronological].reverse();

          expect(projectAttemptEvents(reversed)).toEqual(
            projectAttemptEvents(chronological),
          );
        },
      ),
    );
  });

  it("ne mute pas le journal ni le lot d'entrée", () => {
    const journal = [evaluated(1)];
    const batch = [submission(2)];
    const journalSnapshot = structuredClone(journal);
    const batchSnapshot = structuredClone(batch);

    ingestAttemptBatch({
      existingEvents: journal,
      submissions: batch,
      answerKeys: [answerKey],
      authenticatedUserId: ids.user,
    });

    expect(journal).toEqual(journalSnapshot);
    expect(batch).toEqual(batchSnapshot);
  });
});
