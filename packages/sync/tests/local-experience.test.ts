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
  updateLocalOnboarding,
  type LocalExperienceSnapshot,
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
