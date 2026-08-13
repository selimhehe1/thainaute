import {
  readEmbeddedUnite01LessonBundle,
  type LessonExercise,
} from "@thainaute/content/mobile";
import {
  enqueueAttempt,
  createAttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { describe, expect, it } from "vitest";

import {
  mobileUnit01MechanicsExpedition1c,
  type MechanicsExpeditionConfig,
  type MechanicsExpeditionExerciseConfig,
} from "../lib/embedded-mechanics-expedition-config";
import {
  getProjectionForMechanicsExercise,
  ingestMechanicsExpeditionOutbox,
  mechanicsAnswerKeys,
  nextMechanicsExpeditionExercise,
} from "../lib/mechanics-expedition-state";

const deviceId = "40000000-0000-4000-8000-000000000001";

type AssociationExercise = Extract<LessonExercise, { type: "association" }>;
type RecallExercise = Extract<LessonExercise, { type: "recall" }>;

const typedBundle = readEmbeddedUnite01LessonBundle("u01-l1b");
const typedAssociation = typedBundle.lesson.exercises.find(
  (exercise): exercise is AssociationExercise =>
    exercise.type === "association",
);
const typedRecall = typedBundle.lesson.exercises.find(
  (exercise): exercise is RecallExercise => exercise.type === "recall",
);
if (typedAssociation === undefined || typedRecall === undefined) {
  throw new Error("Exercices typés absents de l'unité de test.");
}

function typedExerciseConfig(
  exercise: AssociationExercise | RecallExercise,
): MechanicsExpeditionExerciseConfig {
  const itemId =
    exercise.type === "association"
      ? exercise.pairs[0]?.itemId
      : exercise.itemId;
  const item = typedBundle.lesson.items.find(({ id }) => id === itemId);
  if (item === undefined) throw new Error("Item typé absent de l'unité.");
  return { exercise, item };
}

const typedMechanicsConfig: MechanicsExpeditionConfig = {
  ...mobileUnit01MechanicsExpedition1c,
  exercises: [
    typedExerciseConfig(typedAssociation),
    typedExerciseConfig(typedRecall),
  ],
  key: "u01-l1b",
  lesson: typedBundle.lesson,
};

function submission(
  exerciseId: string,
  contentVersionId: string,
  answer: ValidatedAttemptSubmission["answer"],
  eventId: string,
): ValidatedAttemptSubmission {
  if (answer === undefined) throw new Error("answer missing");
  return {
    eventId,
    deviceId,
    exerciseId,
    answer,
    answeredAt: "2026-08-06T10:00:00.000Z",
    durationMs: 2_000,
    contentVersionId,
    algorithmVersion: "srs-v0",
  };
}

describe("mécaniques locales de l'unité 1", () => {
  it("expose la leçon qui ne dépend d'aucun audio", () => {
    // Ce test portait aussi sur `u01-l1e`, retirée du bundle mobile parce
    // qu'elle reste un brouillon : un brouillon est extractible d'un APK.
    // Reste `u01-l1c`, seule leçon signée sans exercice d'écoute.
    expect(mobileUnit01MechanicsExpedition1c.exercises[0]?.exercise.type).toBe(
      "word_order",
    );
    expect(
      mobileUnit01MechanicsExpedition1c.exercises.map(
        ({ exercise }) => exercise.type,
      ),
    ).toEqual(["word_order"]);
    expect(mechanicsAnswerKeys(mobileUnit01MechanicsExpedition1c)).toHaveLength(
      1,
    );
  });

  it("évalue l'ordre correct et conserve la projection SRS", () => {
    const current = mobileUnit01MechanicsExpedition1c.exercises[0];
    if (current?.exercise.type !== "word_order")
      throw new Error("exercise missing");
    const outbox = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission(
        current.exercise.id,
        mobileUnit01MechanicsExpedition1c.lesson.versionId,
        {
          kind: "word_order",
          tokenIds: current.exercise.correctOrder,
        },
        "40000000-0000-4000-8000-000000000002",
      ),
    );
    const result = ingestMechanicsExpeditionOutbox(
      outbox,
      mobileUnit01MechanicsExpedition1c,
    );
    expect(result.events[0]?.rating).toBe(1);
    expect(
      getProjectionForMechanicsExercise(
        outbox,
        mobileUnit01MechanicsExpedition1c,
        current,
      )?.state.masteryScore,
    ).toBe(250);
  });

  it("corrige association et rappel puis projette leurs compétences séparément", () => {
    const association = typedMechanicsConfig.exercises[0];
    const recall = typedMechanicsConfig.exercises[1];
    if (
      association?.exercise.type !== "association" ||
      recall?.exercise.type !== "recall"
    ) {
      throw new Error("exercices typés manquants");
    }
    const accepted = recall.exercise.acceptedAnswers[0]?.value;
    if (accepted === undefined) throw new Error("réponse de rappel absente");

    let outbox = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission(
        association.exercise.id,
        typedMechanicsConfig.lesson.versionId,
        {
          kind: "association",
          pairs: association.exercise.pairs.map(({ id }) => ({
            promptPairId: id,
            chosenPairId: id,
          })),
        },
        "40000000-0000-4000-8000-000000000010",
      ),
    );
    outbox = enqueueAttempt(
      outbox,
      submission(
        recall.exercise.id,
        typedMechanicsConfig.lesson.versionId,
        { kind: "recall", value: accepted },
        "40000000-0000-4000-8000-000000000011",
      ),
    );

    const result = ingestMechanicsExpeditionOutbox(
      outbox,
      typedMechanicsConfig,
    );
    expect(result.events.map(({ rating }) => rating)).toEqual([1, 1]);
    expect(
      getProjectionForMechanicsExercise(
        outbox,
        typedMechanicsConfig,
        association,
      ),
    ).toMatchObject({ state: { masteryScore: 250, skill: "reading" } });
    expect(
      getProjectionForMechanicsExercise(outbox, typedMechanicsConfig, recall),
    ).toMatchObject({ state: { masteryScore: 250, skill: "recall" } });
  });

  it("fait de missedOnce un cliquet de correction", () => {
    const current = mobileUnit01MechanicsExpedition1c.exercises[0];
    if (current?.exercise.type !== "word_order")
      throw new Error("exercise missing");
    const outbox = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission(
        current.exercise.id,
        mobileUnit01MechanicsExpedition1c.lesson.versionId,
        {
          kind: "word_order",
          tokenIds: current.exercise.correctOrder,
          missedOnce: true,
        },
        "40000000-0000-4000-8000-000000000003",
      ),
    );
    expect(
      ingestMechanicsExpeditionOutbox(outbox, mobileUnit01MechanicsExpedition1c)
        .events[0]?.rating,
    ).toBe(0);
  });

  it("avance au prochain exercice de l'expédition", () => {
    // L'avance est un comportement du moteur, pas une propriété du contenu.
    // Le test s'appuyait sur une leçon qui portait deux exercices ; il
    // tombait donc dès qu'elle sortait du bundle. La configuration typée
    // en porte deux par construction, ce qui rend ce test indépendant de
    // ce que le corpus publie.
    const first = typedMechanicsConfig.exercises[0];
    const second = typedMechanicsConfig.exercises[1];
    if (first === undefined || second === undefined)
      throw new Error("exercises missing");
    const snapshot = {
      expedition: {
        results: [{ exerciseId: first.exercise.id }],
      },
    };
    expect(
      nextMechanicsExpeditionExercise(typedMechanicsConfig, snapshot),
    ).toBe(second);
  });
});
