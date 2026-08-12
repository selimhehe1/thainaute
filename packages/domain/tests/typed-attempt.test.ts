import { describe, expect, it } from "vitest";

import { evaluateAttempt, type AttemptSubmission } from "../src/index";

const ids = {
  event: "70000000-0000-4000-8000-000000000001",
  device: "70000000-0000-4000-8000-000000000002",
  user: "70000000-0000-4000-8000-000000000003",
  exercise: "70000000-0000-4000-8000-000000000004",
  item: "70000000-0000-4000-8000-000000000005",
  firstToken: "70000000-0000-4000-8000-000000000006",
  secondToken: "70000000-0000-4000-8000-000000000007",
  firstPair: "70000000-0000-4000-8000-000000000008",
  secondPair: "70000000-0000-4000-8000-000000000009",
  version: "70000000-0000-4000-8000-000000000010",
} as const;

function submission(
  answer: NonNullable<AttemptSubmission["answer"]>,
): AttemptSubmission {
  return {
    eventId: ids.event,
    deviceId: ids.device,
    exerciseId: ids.exercise,
    answer,
    answeredAt: "2026-08-06T10:00:00.000Z",
    durationMs: 1_000,
    contentVersionId: ids.version,
    algorithmVersion: "srs-v0",
  };
}

describe("correction autoritaire des réponses typées", () => {
  it("corrige un ordre de mots et conserve missedOnce", () => {
    const key = {
      kind: "word_order" as const,
      exerciseId: ids.exercise,
      itemId: ids.item,
      skill: "production" as const,
      contentVersionId: ids.version,
      validTokenIds: [ids.firstToken, ids.secondToken],
      correctOrder: [ids.firstToken, ids.secondToken],
    };
    expect(
      evaluateAttempt(
        submission({
          kind: "word_order",
          tokenIds: key.correctOrder,
        }),
        key,
        ids.user,
      ).rating,
    ).toBe(1);
    expect(
      evaluateAttempt(
        submission({
          kind: "word_order",
          tokenIds: key.correctOrder,
          missedOnce: true,
        }),
        key,
        ids.user,
      ).rating,
    ).toBe(0);
  });

  it("normalise le rappel selon la politique du contenu", () => {
    const key = {
      kind: "recall" as const,
      exerciseId: ids.exercise,
      itemId: ids.item,
      skill: "recall" as const,
      contentVersionId: ids.version,
      acceptedAnswers: ["สวัสดี"],
      answerPolicy: {
        normalization: "nfc" as const,
        trimWhitespace: true,
        collapseInnerWhitespace: true,
      },
    };
    expect(
      evaluateAttempt(
        submission({ kind: "recall", value: "  สวัสดี  " }),
        key,
        ids.user,
      ).rating,
    ).toBe(1);
  });

  it("exige toutes les paires d'une association", () => {
    const key = {
      kind: "association" as const,
      exerciseId: ids.exercise,
      itemId: ids.item,
      skill: "reading" as const,
      contentVersionId: ids.version,
      pairIds: [ids.firstPair, ids.secondPair],
    };
    expect(
      evaluateAttempt(
        submission({
          kind: "association",
          pairs: [
            { promptPairId: ids.firstPair, chosenPairId: ids.firstPair },
            { promptPairId: ids.secondPair, chosenPairId: ids.secondPair },
          ],
        }),
        key,
        ids.user,
      ).rating,
    ).toBe(1);
  });
});
