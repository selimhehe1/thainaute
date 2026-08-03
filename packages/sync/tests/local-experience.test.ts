import { describe, expect, it } from "vitest";

import {
  LocalExperienceAttemptIntegrityError,
  LocalExperienceOwnerError,
  LocalExperienceTransitionError,
  abandonLocalLessonForVersionChange,
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  createLocalExperienceSnapshot,
  deserializeLocalExperienceSnapshot,
  enqueueAttempt,
  finishLocalLesson,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  selectLocalLessonOption,
  serializeLocalExperienceSnapshot,
  startLocalLesson,
  saveLocalLessonDraft,
  discardLocalLessonQuestion,
  startLocalExpedition,
  recordLocalExpeditionResult,
  clearCompletedLocalExpedition,
  abandonLocalExpeditionForVersionChange,
  updateLocalOnboarding,
  type LocalExperienceSnapshot,
  type LocalDraftAnswer,
  type ValidatedAttemptSubmission,
} from "../src";

const LESSON_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const OPTION_ID = "20000000-0000-4000-8000-000000000001";
const OTHER_OPTION_ID = "20000000-0000-4000-8000-000000000002";
const EVENT_ID = "30000000-0000-4000-8000-000000000001";
const OTHER_EVENT_ID = "30000000-0000-4000-8000-000000000002";
const DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const NEXT_LESSON_ID = "50000000-0000-4000-8000-000000000002";
const NEXT_EXERCISE_ID = "50000000-0000-4000-8000-000000000004";
const STARTED_AT = "2026-08-02T08:00:00.000Z";
const ANSWERED_AT = "2026-08-02T08:01:00.000Z";

const selection = {
  goalOptionId: "prototype_goal_short",
  motivationOptionId: "prototype_motivation_a",
  experienceOptionId: "prototype_experience_new",
} as const;

function onboarded(): LocalExperienceSnapshot {
  return completeLocalOnboarding(
    createLocalExperienceSnapshot(),
    selection,
    STARTED_AT,
  );
}

function question(): LocalExperienceSnapshot {
  return selectLocalLessonOption(
    openLocalLessonQuestion(
      startLocalLesson(onboarded(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: STARTED_AT,
      }),
      "2026-08-02T08:00:10.000Z",
    ),
    OPTION_ID,
    "2026-08-02T08:00:20.000Z",
  );
}

function submission(
  overrides: Partial<ValidatedAttemptSubmission> = {},
): ValidatedAttemptSubmission {
  return {
    eventId: EVENT_ID,
    deviceId: DEVICE_ID,
    exerciseId: EXERCISE_ID,
    selectedOptionId: OPTION_ID,
    answeredAt: ANSWERED_AT,
    durationMs: 1_000,
    contentVersionId: LESSON_ID,
    algorithmVersion: "srs-v0",
    ...overrides,
  };
}

describe("parcours local versionné", () => {
  it("persiste des identifiants d'option bornés sans figer la taxonomie produit", () => {
    const partial = updateLocalOnboarding(
      createLocalExperienceSnapshot(),
      { goalOptionId: selection.goalOptionId },
      STARTED_AT,
    );
    const completed = completeLocalOnboarding(
      partial,
      selection,
      "2026-08-02T08:00:10.000Z",
    );

    expect(completed.onboarding).toMatchObject({
      status: "completed",
      ...selection,
      startedAt: STARTED_AT,
    });
    expect(
      deserializeLocalExperienceSnapshot(
        serializeLocalExperienceSnapshot(completed),
      ),
    ).toEqual(completed);
    expect(
      completeLocalOnboarding(
        completed,
        {
          goalOptionId: "changed_goal",
          motivationOptionId: "changed_motivation",
          experienceOptionId: "changed_experience",
        },
        "2026-08-02T08:00:20.000Z",
      ),
    ).toEqual(completed);
  });

  it("refuse un snapshot corrompu, du texte libre et une date régressive", () => {
    expect(() => deserializeLocalExperienceSnapshot("{invalide")).toThrow(
      "JSON valide",
    );
    expect(() =>
      completeLocalOnboarding(
        createLocalExperienceSnapshot(),
        {
          ...selection,
          motivationOptionId: "phrase avec espaces",
        },
        STARTED_AT,
      ),
    ).toThrow();
    const partial = updateLocalOnboarding(
      createLocalExperienceSnapshot(),
      { goalOptionId: selection.goalOptionId },
      STARTED_AT,
    );
    expect(() =>
      updateLocalOnboarding(
        partial,
        { motivationOptionId: selection.motivationOptionId },
        "2026-08-02T07:59:59.000Z",
      ),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("exige l'onboarding et refuse d'écraser une séance active", () => {
    expect(() =>
      startLocalLesson(createLocalExperienceSnapshot(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: STARTED_AT,
      }),
    ).toThrow(LocalExperienceTransitionError);

    const active = openLocalLessonQuestion(
      startLocalLesson(onboarded(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: STARTED_AT,
      }),
      STARTED_AT,
    );
    expect(() =>
      startLocalLesson(active, {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: ANSWERED_AT,
      }),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("réserve le payload exact avant enqueue et attend sa durabilité", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    expect(prepared.lesson).toMatchObject({
      phase: "submitting",
      submission: { eventId: EVENT_ID },
    });

    const emptyOutbox = createAttemptOutboxSnapshot();
    expect(
      confirmLocalLessonResult(prepared, emptyOutbox, ANSWERED_AT),
    ).toEqual(prepared);

    const durableOutbox = enqueueAttempt(emptyOutbox, submission());
    const result = confirmLocalLessonResult(
      prepared,
      durableOutbox,
      "2026-08-02T08:01:01.000Z",
    );
    expect(result.lesson).toMatchObject({
      phase: "result",
      submission: { selectedOptionId: OPTION_ID, eventId: EVENT_ID },
    });
    expect(
      finishLocalLesson(result, durableOutbox, "2026-08-02T08:01:02.000Z")
        .lesson,
    ).toMatchObject({
      phase: "completed",
      submission: { eventId: EVENT_ID },
    });
  });

  it("ne rattache jamais une autre tentative plus récente", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const withReserved = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission(),
    );
    const withConcurrent = enqueueAttempt(
      withReserved,
      submission({
        eventId: OTHER_EVENT_ID,
        selectedOptionId: OTHER_OPTION_ID,
        answeredAt: "2026-08-02T08:01:01.000Z",
      }),
    );

    expect(
      confirmLocalLessonResult(
        prepared,
        withConcurrent,
        "2026-08-02T08:01:02.000Z",
      ).lesson,
    ).toMatchObject({
      submission: { eventId: EVENT_ID, selectedOptionId: OPTION_ID },
    });
  });

  it("rend la preparation idempotente sans accepter un payload concurrent", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );

    expect(
      prepareLocalLessonSubmission(
        prepared,
        submission(),
        "2026-08-02T08:01:01.000Z",
      ),
    ).toEqual(prepared);
    expect(() =>
      prepareLocalLessonSubmission(
        prepared,
        submission({ eventId: OTHER_EVENT_ID }),
        "2026-08-02T08:01:01.000Z",
      ),
    ).toThrow(LocalExperienceAttemptIntegrityError);
  });

  it("refuse un autre propriétaire ou un eventId au payload divergent", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const accountOutbox = enqueueAttempt(
      createAttemptOutboxSnapshot({
        kind: "account",
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
      submission(),
    );
    expect(() =>
      confirmLocalLessonResult(prepared, accountOutbox, ANSWERED_AT),
    ).toThrow(LocalExperienceOwnerError);

    const divergent = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission({ selectedOptionId: OTHER_OPTION_ID }),
    );
    expect(() =>
      confirmLocalLessonResult(prepared, divergent, ANSWERED_AT),
    ).toThrow(LocalExperienceAttemptIntegrityError);
  });

  it("refuse une clôture sans événement durable et une date antérieure", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const outbox = enqueueAttempt(createAttemptOutboxSnapshot(), submission());
    const result = confirmLocalLessonResult(
      prepared,
      outbox,
      "2026-08-02T08:01:10.000Z",
    );

    expect(() =>
      finishLocalLesson(
        result,
        createAttemptOutboxSnapshot(),
        "2026-08-02T08:01:11.000Z",
      ),
    ).toThrow(LocalExperienceAttemptIntegrityError);
    expect(() =>
      finishLocalLesson(result, outbox, "2026-08-02T08:01:09.000Z"),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("refuse une lecon active sans onboarding termine", () => {
    const active = openLocalLessonQuestion(
      startLocalLesson(onboarded(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: STARTED_AT,
      }),
      STARTED_AT,
    );

    expect(() =>
      deserializeLocalExperienceSnapshot(
        JSON.stringify({
          ...active,
          onboarding: { status: "not_started" },
        }),
      ),
    ).toThrow();
  });

  it("refuse une reponse horodatee avant la selection", () => {
    expect(() =>
      prepareLocalLessonSubmission(
        question(),
        submission({ answeredAt: "2026-08-02T08:00:19.000Z" }),
        "2026-08-02T08:00:20.000Z",
      ),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("revalide l'outbox sur les retries terminaux", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const outbox = enqueueAttempt(createAttemptOutboxSnapshot(), submission());
    const result = confirmLocalLessonResult(
      prepared,
      outbox,
      "2026-08-02T08:01:10.000Z",
    );
    const completed = finishLocalLesson(
      result,
      outbox,
      "2026-08-02T08:01:11.000Z",
    );
    const wrongOwner = enqueueAttempt(
      createAttemptOutboxSnapshot({
        kind: "account",
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
      submission(),
    );

    expect(() =>
      confirmLocalLessonResult(result, wrongOwner, ANSWERED_AT),
    ).toThrow(LocalExperienceOwnerError);
    expect(() =>
      finishLocalLesson(completed, createAttemptOutboxSnapshot(), ANSWERED_AT),
    ).toThrow(LocalExperienceAttemptIntegrityError);
  });

  it("abandonne explicitement une ancienne introduction ou question", () => {
    const intro = startLocalLesson(onboarded(), {
      lessonVersionId: LESSON_ID,
      exerciseId: EXERCISE_ID,
      startedAt: STARTED_AT,
    });
    const opened = openLocalLessonQuestion(intro, STARTED_AT);
    const replacement = {
      lessonVersionId: NEXT_LESSON_ID,
      exerciseId: NEXT_EXERCISE_ID,
    };

    expect(
      abandonLocalLessonForVersionChange(intro, intro.lesson!, replacement)
        .lesson,
    ).toBeNull();
    expect(
      abandonLocalLessonForVersionChange(opened, opened.lesson!, replacement)
        .lesson,
    ).toBeNull();
    expect(
      abandonLocalLessonForVersionChange(intro, intro.lesson!, {
        lessonVersionId: LESSON_ID,
        exerciseId: NEXT_EXERCISE_ID,
      }).lesson,
    ).toBeNull();
  });

  it("exige la tentative durable exacte avant d'abandonner submitting ou result", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const replacement = {
      lessonVersionId: NEXT_LESSON_ID,
      exerciseId: NEXT_EXERCISE_ID,
    };
    const durable = enqueueAttempt(createAttemptOutboxSnapshot(), submission());
    const result = confirmLocalLessonResult(prepared, durable, ANSWERED_AT);

    expect(() =>
      abandonLocalLessonForVersionChange(
        prepared,
        prepared.lesson!,
        replacement,
      ),
    ).toThrow(LocalExperienceAttemptIntegrityError);
    expect(
      abandonLocalLessonForVersionChange(
        prepared,
        prepared.lesson!,
        replacement,
        durable,
      ).lesson,
    ).toBeNull();
    expect(
      abandonLocalLessonForVersionChange(
        result,
        result.lesson!,
        replacement,
        durable,
      ).lesson,
    ).toBeNull();
    expect(() =>
      abandonLocalLessonForVersionChange(result, result.lesson!, replacement, {
        ...durable,
        entries: [
          {
            status: "rejected",
            submission: submission(),
            code: "invalid_submission",
          },
        ],
      }),
    ).toThrow(LocalExperienceAttemptIntegrityError);
  });

  it("refuse une confirmation périmée, une même cible et un payload divergent", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const durable = enqueueAttempt(createAttemptOutboxSnapshot(), submission());
    const result = confirmLocalLessonResult(prepared, durable, ANSWERED_AT);
    const replacement = {
      lessonVersionId: NEXT_LESSON_ID,
      exerciseId: NEXT_EXERCISE_ID,
    };

    expect(() =>
      abandonLocalLessonForVersionChange(
        result,
        prepared.lesson!,
        replacement,
        durable,
      ),
    ).toThrow(LocalExperienceTransitionError);
    expect(() =>
      abandonLocalLessonForVersionChange(
        result,
        result.lesson!,
        { lessonVersionId: LESSON_ID, exerciseId: EXERCISE_ID },
        durable,
      ),
    ).toThrow(LocalExperienceTransitionError);

    const divergent = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission({ selectedOptionId: OTHER_OPTION_ID }),
    );
    expect(() =>
      abandonLocalLessonForVersionChange(
        result,
        result.lesson!,
        replacement,
        divergent,
      ),
    ).toThrow(LocalExperienceAttemptIntegrityError);
  });

  it("permet d'abandonner un checkpoint déjà clôturé", () => {
    const prepared = prepareLocalLessonSubmission(
      question(),
      submission(),
      ANSWERED_AT,
    );
    const durable = enqueueAttempt(createAttemptOutboxSnapshot(), submission());
    const completed = finishLocalLesson(
      confirmLocalLessonResult(prepared, durable, ANSWERED_AT),
      durable,
      "2026-08-02T08:01:01.000Z",
    );

    expect(() =>
      startLocalLesson(completed, {
        lessonVersionId: NEXT_LESSON_ID,
        exerciseId: NEXT_EXERCISE_ID,
        startedAt: "2026-08-02T08:01:02.000Z",
      }),
    ).toThrow(LocalExperienceTransitionError);

    expect(
      abandonLocalLessonForVersionChange(completed, completed.lesson!, {
        lessonVersionId: NEXT_LESSON_ID,
        exerciseId: NEXT_EXERCISE_ID,
      }).lesson,
    ).toBeNull();
  });
});

describe("expédition locale multi-exercices", () => {
  const PLAN = [
    EXERCISE_ID,
    "10000000-0000-4000-8000-000000000011",
    "10000000-0000-4000-8000-000000000012",
  ] as const;

  function expedition(): LocalExperienceSnapshot {
    return startLocalExpedition(onboarded(), {
      lessonVersionId: LESSON_ID,
      exerciseIds: PLAN,
      startedAt: STARTED_AT,
    });
  }

  it("démarre, consigne les résultats dans l'ordre libre du plan et se libère", () => {
    let snapshot = expedition();
    snapshot = recordLocalExpeditionResult(snapshot, {
      exerciseId: PLAN[1],
      rating: 1,
      answeredAt: "2026-08-02T08:02:00.000Z",
    });
    snapshot = recordLocalExpeditionResult(snapshot, {
      exerciseId: PLAN[0],
      rating: 0,
      answeredAt: "2026-08-02T08:03:00.000Z",
    });
    snapshot = recordLocalExpeditionResult(snapshot, {
      exerciseId: PLAN[2],
      rating: 1,
      answeredAt: "2026-08-02T08:04:00.000Z",
    });
    expect(snapshot.expedition?.results).toHaveLength(3);

    const cleared = clearCompletedLocalExpedition(snapshot);
    expect(cleared.expedition).toBeNull();
  });

  it("rejoue un résultat identique de façon idempotente et refuse un résultat divergent", () => {
    const first = recordLocalExpeditionResult(expedition(), {
      exerciseId: PLAN[0],
      rating: 1,
      answeredAt: "2026-08-02T08:02:00.000Z",
    });
    const replay = recordLocalExpeditionResult(first, {
      exerciseId: PLAN[0],
      rating: 1,
      answeredAt: "2026-08-02T08:02:00.000Z",
    });
    expect(replay.expedition?.results).toHaveLength(1);
    expect(() =>
      recordLocalExpeditionResult(first, {
        exerciseId: PLAN[0],
        rating: 0,
        answeredAt: "2026-08-02T08:05:00.000Z",
      }),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("refuse un résultat hors du plan et une libération incomplète", () => {
    expect(() =>
      recordLocalExpeditionResult(expedition(), {
        exerciseId: NEXT_EXERCISE_ID,
        rating: 1,
        answeredAt: "2026-08-02T08:02:00.000Z",
      }),
    ).toThrow(LocalExperienceTransitionError);
    expect(() => clearCompletedLocalExpedition(expedition())).toThrow(
      LocalExperienceTransitionError,
    );
  });

  it("archive la sous-session close en consignant son résultat", () => {
    let snapshot = startLocalLesson(expedition(), {
      lessonVersionId: LESSON_ID,
      exerciseId: EXERCISE_ID,
      startedAt: "2026-08-02T08:00:05.000Z",
    });
    snapshot = selectLocalLessonOption(
      openLocalLessonQuestion(snapshot, "2026-08-02T08:00:10.000Z"),
      OPTION_ID,
      "2026-08-02T08:00:20.000Z",
    );
    let outbox = createAttemptOutboxSnapshot();
    snapshot = prepareLocalLessonSubmission(
      snapshot,
      submission(),
      ANSWERED_AT,
    );
    outbox = enqueueAttempt(outbox, submission());
    snapshot = confirmLocalLessonResult(
      snapshot,
      outbox,
      "2026-08-02T08:01:10.000Z",
    );
    snapshot = finishLocalLesson(snapshot, outbox, "2026-08-02T08:01:20.000Z");
    expect(snapshot.lesson?.phase).toBe("completed");

    const recorded = recordLocalExpeditionResult(snapshot, {
      exerciseId: EXERCISE_ID,
      rating: 1,
      answeredAt: "2026-08-02T08:01:30.000Z",
    });
    expect(recorded.lesson).toBeNull();
    expect(recorded.expedition?.results[0]?.exerciseId).toBe(EXERCISE_ID);
  });

  it("refuse de consigner pendant une sous-session encore ouverte", () => {
    const snapshot = openLocalLessonQuestion(
      startLocalLesson(expedition(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: "2026-08-02T08:00:05.000Z",
      }),
      "2026-08-02T08:00:10.000Z",
    );
    expect(() =>
      recordLocalExpeditionResult(snapshot, {
        exerciseId: EXERCISE_ID,
        rating: 1,
        answeredAt: "2026-08-02T08:02:00.000Z",
      }),
    ).toThrow(LocalExperienceTransitionError);
  });

  it("abandonne seulement sur état attendu identique et autre version", () => {
    const snapshot = expedition();
    const checkpoint = snapshot.expedition;
    if (checkpoint === null) throw new Error("Expédition manquante.");

    expect(() =>
      abandonLocalExpeditionForVersionChange(snapshot, checkpoint, LESSON_ID),
    ).toThrow(LocalExperienceTransitionError);

    const moved = recordLocalExpeditionResult(snapshot, {
      exerciseId: PLAN[0],
      rating: 1,
      answeredAt: "2026-08-02T08:02:00.000Z",
    });
    expect(() =>
      abandonLocalExpeditionForVersionChange(moved, checkpoint, NEXT_LESSON_ID),
    ).toThrow(LocalExperienceTransitionError);

    const abandoned = abandonLocalExpeditionForVersionChange(
      snapshot,
      checkpoint,
      NEXT_LESSON_ID,
    );
    expect(abandoned.expedition).toBeNull();
  });

  it("relit un instantané v1 sans champ expedition", () => {
    const legacy = JSON.parse(
      serializeLocalExperienceSnapshot(onboarded()),
    ) as Record<string, unknown>;
    delete legacy.expedition;
    const revived = deserializeLocalExperienceSnapshot(JSON.stringify(legacy));
    expect(revived.expedition).toBeNull();
  });

  it("refuse une expédition sans onboarding ou en double", () => {
    expect(() =>
      startLocalExpedition(createLocalExperienceSnapshot(), {
        lessonVersionId: LESSON_ID,
        exerciseIds: PLAN,
        startedAt: STARTED_AT,
      }),
    ).toThrow(LocalExperienceTransitionError);
    expect(() =>
      startLocalExpedition(expedition(), {
        lessonVersionId: LESSON_ID,
        exerciseIds: PLAN,
        startedAt: STARTED_AT,
      }),
    ).toThrow(LocalExperienceTransitionError);
  });
});

describe("brouillon de réponse durable", () => {
  function questionForDraft(): LocalExperienceSnapshot {
    return openLocalLessonQuestion(
      startLocalLesson(onboarded(), {
        lessonVersionId: LESSON_ID,
        exerciseId: EXERCISE_ID,
        startedAt: STARTED_AT,
      }),
      "2026-08-02T08:00:10.000Z",
    );
  }

  const wordOrderDraft: LocalDraftAnswer = {
    kind: "word_order",
    tokenIds: [OPTION_ID, OTHER_OPTION_ID],
  };

  it("conserve la réponse en construction et la restitue telle quelle", () => {
    const saved = saveLocalLessonDraft(
      questionForDraft(),
      { answer: wordOrderDraft },
      "2026-08-02T08:00:20.000Z",
    );
    const revived = deserializeLocalExperienceSnapshot(
      serializeLocalExperienceSnapshot(saved),
    );
    expect(revived.lesson?.phase).toBe("question");
    if (revived.lesson?.phase !== "question") throw new Error("phase perdue.");
    expect(revived.lesson.draftAnswer).toEqual(wordOrderDraft);
  });

  it("retient l'erreur comme un cliquet : elle ne se retire jamais", () => {
    let snapshot = saveLocalLessonDraft(
      questionForDraft(),
      { answer: null, missedOnce: true },
      "2026-08-02T08:00:20.000Z",
    );
    // Une sauvegarde ultérieure sans erreur ne doit pas blanchir la faute.
    snapshot = saveLocalLessonDraft(
      snapshot,
      { answer: wordOrderDraft, missedOnce: false },
      "2026-08-02T08:00:30.000Z",
    );
    if (snapshot.lesson?.phase !== "question") throw new Error("phase perdue.");
    expect(snapshot.lesson.missedOnce).toBe(true);
  });

  it("relit un instantané v1 dont la question n'a ni brouillon ni erreur", () => {
    const legacy = JSON.parse(
      serializeLocalExperienceSnapshot(questionForDraft()),
    ) as { lesson: Record<string, unknown> };
    delete legacy.lesson.draftAnswer;
    delete legacy.lesson.missedOnce;
    const revived = deserializeLocalExperienceSnapshot(JSON.stringify(legacy));
    if (revived.lesson?.phase !== "question") throw new Error("phase perdue.");
    expect(revived.lesson.draftAnswer).toBeNull();
    expect(revived.lesson.missedOnce).toBe(false);
  });

  it("refuse d'envoyer une réponse qui ne correspond pas au brouillon", () => {
    const saved = saveLocalLessonDraft(
      questionForDraft(),
      { answer: wordOrderDraft },
      "2026-08-02T08:00:20.000Z",
    );
    const divergent = submission({
      selectedOptionId: undefined,
      answer: { kind: "word_order", tokenIds: [OTHER_OPTION_ID, OPTION_ID] },
    });
    expect(() =>
      prepareLocalLessonSubmission(saved, divergent, ANSWERED_AT),
    ).toThrow(LocalExperienceAttemptIntegrityError);

    const faithful = submission({
      selectedOptionId: undefined,
      answer: { ...wordOrderDraft },
    });
    expect(
      prepareLocalLessonSubmission(saved, faithful, ANSWERED_AT).lesson?.phase,
    ).toBe("submitting");
  });

  it("referme une carte sans tentative, jamais une tentative durable", () => {
    expect(discardLocalLessonQuestion(questionForDraft()).lesson).toBeNull();

    const submitting = prepareLocalLessonSubmission(
      selectLocalLessonOption(
        questionForDraft(),
        OPTION_ID,
        "2026-08-02T08:00:20.000Z",
      ),
      submission(),
      ANSWERED_AT,
    );
    expect(() => discardLocalLessonQuestion(submitting)).toThrow(
      LocalExperienceTransitionError,
    );
  });
});
