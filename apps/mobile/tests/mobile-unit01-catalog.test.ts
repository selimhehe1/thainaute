import { describe, expect, it } from "vitest";

import {
  findMobileUnit01CatalogItem,
  formatMobileUnit01ExerciseCount,
  getMobileUnit01BlockedReasonText,
  mobileUnit01Catalog,
} from "../lib/mobile-unit01-catalog";

describe("catalogue mobile de l'unité 1", () => {
  it("accorde le libellé du nombre d'exercices", () => {
    expect(formatMobileUnit01ExerciseCount(1)).toBe("1 exercice local");
    expect(formatMobileUnit01ExerciseCount(21)).toBe("21 exercices locaux");
  });

  it("conserve les six leçons dans l'ordre pédagogique", () => {
    expect(mobileUnit01Catalog.map(({ key }) => key)).toEqual([
      "u01-l1a",
      "u01-l1b",
      "u01-l1c",
      "u01-l1d",
      "u01-l1f",
      "u01-l1e",
    ]);
  });

  it("ouvre les aperçus dont le média ou la mécanique locale passe la porte", () => {
    expect(
      mobileUnit01Catalog
        .filter(({ availability }) => availability === "preview")
        .map(({ key }) => key),
    ).toEqual([
      "u01-l1a",
      "u01-l1b",
      "u01-l1c",
      "u01-l1d",
      "u01-l1f",
      "u01-l1e",
    ]);
    expect(
      mobileUnit01Catalog
        .filter(({ availability }) => availability === "preview")
        .map(({ audioExerciseCount }) => audioExerciseCount),
    ).toEqual([6, 10, 0, 6, 5, 0]);
    expect(
      mobileUnit01Catalog
        .filter(({ availability }) => availability === "preview")
        .every(({ previewMode }) => previewMode === "mixed"),
    ).toBe(true);

    expect(
      mobileUnit01Catalog
        .filter(({ availability }) => availability === "blocked")
        .map(({ key, blockedReason }) => [key, blockedReason]),
    ).toEqual([]);
    expect(getMobileUnit01BlockedReasonText("audio_pending")).toContain(
      "Audio",
    );
  });

  it("ouvre 1B quand tous ses audios passent le contrôle de ton", () => {
    expect(findMobileUnit01CatalogItem("u01-l1b")).toMatchObject({
      availability: "preview",
      audioExerciseCount: 10,
      blockedReason: null,
      previewMode: "mixed",
    });
  });

  it("n'ouvre 1F qu'avec ses propres audios conformes", () => {
    expect(findMobileUnit01CatalogItem("u01-l1f")).toMatchObject({
      availability: "preview",
      audioExerciseCount: 5,
      previewMode: "mixed",
    });
  });
});
