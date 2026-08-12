// Volontairement `/fixture` et non `readFiveMechanicsFixtureBundle` :
// `repository.ts` tire `node:fs`, que ce paquet doit rester capable de
// compiler sans, puisqu'il est aussi consommé par React Native.
import { fiveMechanicsFixtureLesson } from "@thainaute/content/fixture";
import type { LessonExercise } from "@thainaute/content/schemas";
import {
  exerciseAnswerKeyKind,
  SRS_ALGORITHM_VERSION,
} from "@thainaute/domain";
import { describe, expect, it } from "vitest";

import {
  ingestAttemptBatch,
  localAnswerKeyForExercise,
  localAnswerKeysForLesson,
  type ValidatedAttemptSubmission,
} from "../src";

const DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const ANSWERED_AT = "2026-08-11T08:00:00.000Z";

const lesson = fiveMechanicsFixtureLesson;

function exerciseOfType<T extends LessonExercise["type"]>(
  type: T,
): Extract<LessonExercise, { type: T }> {
  const exercise = lesson.exercises.find(
    (candidate): candidate is Extract<LessonExercise, { type: T }> =>
      candidate.type === type,
  );
  if (exercise === undefined) {
    throw new Error(`La fixture ne porte aucun exercice ${type}.`);
  }
  return exercise;
}

function submit(
  fields: Partial<ValidatedAttemptSubmission> &
    Pick<ValidatedAttemptSubmission, "exerciseId">,
): ValidatedAttemptSubmission {
  return {
    eventId: "30000000-0000-4000-8000-0000000000a1",
    deviceId: DEVICE_ID,
    answeredAt: ANSWERED_AT,
    durationMs: 1_000,
    contentVersionId: lesson.versionId,
    algorithmVersion: SRS_ALGORITHM_VERSION,
    ...fields,
  };
}

describe("localAnswerKeysForLesson", () => {
  it("produit une clé par exercice de la leçon", () => {
    const keys = localAnswerKeysForLesson(lesson);
    expect(keys).toHaveLength(lesson.exercises.length);
    expect(keys.map(({ exerciseId }) => exerciseId)).toStrictEqual(
      lesson.exercises.map(({ id }) => id),
    );
  });

  it("couvre les cinq mécaniques avec la bonne nature de clé", () => {
    const kinds = new Map(
      localAnswerKeysForLesson(lesson).map((key) => [
        key.exerciseId,
        exerciseAnswerKeyKind(key),
      ]),
    );
    for (const exercise of lesson.exercises) {
      const expected =
        exercise.type === "audio_choice" || exercise.type === "reading"
          ? "option"
          : exercise.type;
      expect(kinds.get(exercise.id)).toBe(expected);
    }
  });

  it("porte la version de contenu de la leçon, jamais une autre", () => {
    for (const key of localAnswerKeysForLesson(lesson)) {
      expect(key.contentVersionId).toBe(lesson.versionId);
    }
  });
});

describe("localAnswerKeyForExercise", () => {
  it("rattache l'association à son premier item et liste ses paires", () => {
    const exercise = exerciseOfType("association");
    const key = localAnswerKeyForExercise(exercise, lesson.versionId);
    if (key === null || key.kind !== "association") {
      throw new Error("Clé d'association attendue.");
    }
    expect(key.itemId).toBe(exercise.pairs[0]?.itemId);
    expect(key.pairIds).toStrictEqual(exercise.pairs.map(({ id }) => id));
    expect(key.skill).toBe(exercise.skill);
  });

  it("conserve l'ordre attendu et les jetons valides de l'ordre des mots", () => {
    const exercise = exerciseOfType("word_order");
    const key = localAnswerKeyForExercise(exercise, lesson.versionId);
    if (key === null || key.kind !== "word_order") {
      throw new Error("Clé d'ordre des mots attendue.");
    }
    expect(key.correctOrder).toStrictEqual(exercise.correctOrder);
    expect(key.validTokenIds).toStrictEqual(
      exercise.tokens.map(({ id }) => id),
    );
  });

  it("transmet la politique de normalisation du rappel telle quelle", () => {
    const exercise = exerciseOfType("recall");
    const key = localAnswerKeyForExercise(exercise, lesson.versionId);
    if (key === null || key.kind !== "recall") {
      throw new Error("Clé de rappel attendue.");
    }
    expect(key.acceptedAnswers).toStrictEqual(
      exercise.acceptedAnswers.map(({ value }) => value),
    );
    expect(key.answerPolicy).toStrictEqual(exercise.answerPolicy);
  });

  it("traite la lecture comme un choix d'option, comme l'écoute", () => {
    for (const type of ["audio_choice", "reading"] as const) {
      const exercise = exerciseOfType(type);
      const key = localAnswerKeyForExercise(exercise, lesson.versionId);
      if (key === null || exerciseAnswerKeyKind(key) !== "option") {
        throw new Error(`Clé d'option attendue pour ${type}.`);
      }
      expect(key).toMatchObject({ correctOptionId: exercise.correctOptionId });
    }
  });
});

/**
 * La vraie promesse de ce module : les clés dérivées doivent NOTER. Une clé
 * bien formée mais inexploitable par le moteur laisserait les quatre
 * mécaniques composées à zéro sans qu'aucun type ne s'en plaigne.
 */
describe("notation locale des cinq mécaniques", () => {
  it("note juste une réponse correcte de chaque mécanique", () => {
    const association = exerciseOfType("association");
    const wordOrder = exerciseOfType("word_order");
    const recall = exerciseOfType("recall");
    const reading = exerciseOfType("reading");
    const listening = exerciseOfType("audio_choice");

    const submissions: readonly ValidatedAttemptSubmission[] = [
      submit({
        eventId: "30000000-0000-4000-8000-0000000000b1",
        exerciseId: listening.id,
        selectedOptionId: listening.correctOptionId,
      }),
      submit({
        eventId: "30000000-0000-4000-8000-0000000000b2",
        exerciseId: association.id,
        answer: {
          kind: "association",
          pairs: association.pairs.map(({ id }) => ({
            promptPairId: id,
            chosenPairId: id,
          })),
        },
      }),
      submit({
        eventId: "30000000-0000-4000-8000-0000000000b3",
        exerciseId: wordOrder.id,
        answer: { kind: "word_order", tokenIds: [...wordOrder.correctOrder] },
      }),
      submit({
        eventId: "30000000-0000-4000-8000-0000000000b4",
        exerciseId: recall.id,
        answer: {
          kind: "recall",
          value: recall.acceptedAnswers[0]?.value ?? "",
        },
      }),
      submit({
        eventId: "30000000-0000-4000-8000-0000000000b5",
        exerciseId: reading.id,
        selectedOptionId: reading.correctOptionId,
      }),
    ];

    const { events, rejected } = ingestAttemptBatch({
      authenticatedUserId: null,
      existingEvents: [],
      submissions,
      answerKeys: localAnswerKeysForLesson(lesson),
    });

    expect(rejected).toStrictEqual([]);
    expect(events).toHaveLength(5);
    expect(events.map(({ rating }) => rating)).toStrictEqual([1, 1, 1, 1, 1]);
  });

  it("note faux un ordre des mots inversé", () => {
    const wordOrder = exerciseOfType("word_order");
    const inverted = [...wordOrder.correctOrder].reverse();
    const { events } = ingestAttemptBatch({
      authenticatedUserId: null,
      existingEvents: [],
      submissions: [
        submit({
          exerciseId: wordOrder.id,
          answer: { kind: "word_order", tokenIds: inverted },
        }),
      ],
      answerKeys: localAnswerKeysForLesson(lesson),
    });
    expect(events[0]?.rating).toBe(0);
  });
});
