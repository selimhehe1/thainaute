import type { LessonLearningProgress } from "@thainaute/sync";
import { describe, expect, it } from "vitest";

import {
  choisirSeanceDuJour,
  type SeanceProposable,
} from "../lib/seance-du-jour";

function lecon(versionId: string, estFixture = false): SeanceProposable {
  return {
    versionId,
    exerciseId: `${versionId}-ex1`,
    title: `Leçon ${versionId}`,
    objective: "objectif",
    href: estFixture ? "/learn/demo" : `/learn/lecon/${versionId}`,
    estFixture,
  };
}

function progression(
  versionId: string,
  champs: Partial<LessonLearningProgress>,
): LessonLearningProgress {
  return {
    versionId,
    titleFr: `Leçon ${versionId}`,
    exerciseCount: 7,
    reviewedItems: 0,
    confirmedItems: 0,
    attemptedCount: 0,
    successfulAttempts: 0,
    dueCount: 0,
    nextReviewAt: null,
    masteryPermille: 0,
    ...champs,
  };
}

const A = lecon("1a");
const B = lecon("1b");
const C = lecon("1c");

describe("séance du jour", () => {
  it("propose la première leçon du parcours à qui n'a rien fait", () => {
    expect(
      choisirSeanceDuJour({
        proposables: [A, B, C],
        progression: [],
        expeditionOuverte: null,
      }),
    ).toBe(A);
  });

  it("reprend l'expédition ouverte avant de proposer autre chose", () => {
    // L'écran promet « Reprendre l'expédition » : il ne doit pas, dans le
    // même temps, proposer une autre leçon.
    expect(
      choisirSeanceDuJour({
        proposables: [A, B, C],
        progression: [],
        expeditionOuverte: "1c",
      }),
    ).toBe(C);
  });

  it("passe à la leçon suivante une fois la précédente travaillée", () => {
    expect(
      choisirSeanceDuJour({
        proposables: [A, B, C],
        progression: [progression("1a", { reviewedItems: 4 })],
        expeditionOuverte: null,
      }),
    ).toBe(B);
  });

  it("bascule en séance de rappel quand tout a été vu une fois", () => {
    expect(
      choisirSeanceDuJour({
        proposables: [A, B, C],
        progression: [
          progression("1a", { reviewedItems: 4, dueCount: 1 }),
          progression("1b", { reviewedItems: 6, dueCount: 5 }),
          progression("1c", { reviewedItems: 2, dueCount: 0 }),
        ],
        expeditionOuverte: null,
      }),
    ).toBe(B);
  });

  it("ignore une expédition ouverte sur une leçon qui n'est plus proposée", () => {
    // Cas réel : une leçon dépubliée, ou un instantané plus ancien que la
    // release. On ne renvoie pas vers une leçon absente.
    expect(
      choisirSeanceDuJour({
        proposables: [A, B],
        progression: [],
        expeditionOuverte: "9z",
      }),
    ).toBe(A);
  });

  it("ne rend rien plutôt qu'une séance inventée quand il n'y a rien", () => {
    expect(
      choisirSeanceDuJour({
        proposables: [],
        progression: [],
        expeditionOuverte: null,
      }),
    ).toBeNull();
  });
});
