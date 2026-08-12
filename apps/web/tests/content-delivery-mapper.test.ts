import { publicLessonResponseSchema } from "@thainaute/content/public";
import { describe, expect, it } from "vitest";

import { toPublicLessonResponse } from "../lib/server/content-delivery/mapper";
import { verifyPublishedBundleRow } from "../lib/server/content-delivery/verified-bundle";
import {
  makePublishableBundle,
  makePublishableMechanicsBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

function collectKeys(
  value: unknown,
  keys: Set<string> = new Set(),
): Set<string> {
  if (Array.isArray(value)) {
    for (const entry of value) collectKeys(entry, keys);
  } else if (value !== null && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      keys.add(key);
      collectKeys(entry, keys);
    }
  }
  return keys;
}

describe("DTO public de lecon", () => {
  it("expurge les reponses, la provenance et les chemins internes", () => {
    const verified = verifyPublishedBundleRow(
      makePublishedLessonRow(makePublishableBundle()),
    );
    if (verified === null) throw new Error("Bundle publiable refuse.");

    const response = toPublicLessonResponse(verified);
    expect(response).not.toBeNull();
    expect(publicLessonResponseSchema.safeParse(response).success).toBe(true);

    const keys = collectKeys(response);
    for (const forbidden of [
      "correctOptionId",
      "feedback",
      "items",
      "itemId",
      "translationFr",
      "transcription",
      "provenance",
      "generationActors",
      "actorId",
      "auditor",
      "sources",
      "versionSource",
      "confidence",
      "redistribution",
      "canonicalPath",
      "distributionPaths",
      "storage_path",
      "consentReference",
      "workflowStatus",
      "visibility",
    ]) {
      expect(keys.has(forbidden), forbidden).toBe(false);
    }

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("source-interne-sensible");
    expect(serialized).not.toContain("note-interne-sensible");
    expect(serialized).not.toContain("contrat-interne-sensible");
    expect(serialized).not.toContain("chemin-interne.wav");
    expect(serialized).not.toContain("Fixture juridique et technique");
  });

  it("refuse une lecon premium et un payload altere", () => {
    const premium = makePublishableBundle();
    premium.lesson.requiredEntitlement = "premium";
    const verifiedPremium = verifyPublishedBundleRow(
      makePublishedLessonRow(premium),
    );
    if (verifiedPremium === null) throw new Error("Bundle premium invalide.");
    expect(toPublicLessonResponse(verifiedPremium)).toBeNull();

    const altered = makePublishableBundle();
    const row = makePublishedLessonRow(altered);
    altered.lesson.titleFr = "Alteration posterieure au hash";
    expect(verifyPublishedBundleRow(row)).toBeNull();
  });

  it("refuse une ligne dont le pack ne correspond pas au payload", () => {
    const row = makePublishedLessonRow(makePublishableBundle());
    const mismatchedRow = { ...row, language_pack_id: "other-fr" };

    expect(verifyPublishedBundleRow(mismatchedRow)).toBeNull();
  });

  it("neutralise l'ordre editorial des options dans le DTO", () => {
    const firstBundle = makePublishableBundle();
    const firstVerified = verifyPublishedBundleRow(
      makePublishedLessonRow(firstBundle),
    );
    if (firstVerified === null) throw new Error("Premier bundle invalide.");
    const firstResponse = toPublicLessonResponse(firstVerified);

    const secondBundle = makePublishableBundle();
    const exercise = secondBundle.lesson.exercises[0];
    if (exercise?.type !== "audio_choice") {
      throw new Error("Exercice manquant.");
    }
    exercise.options.reverse();
    const secondVerified = verifyPublishedBundleRow(
      makePublishedLessonRow(secondBundle),
    );
    if (secondVerified === null) throw new Error("Second bundle invalide.");
    const secondResponse = toPublicLessonResponse(secondVerified);

    const firstExercise = firstResponse?.lesson.exercises[0];
    const secondExercise = secondResponse?.lesson.exercises[0];
    if (
      firstExercise?.type !== "audio_choice" ||
      secondExercise?.type !== "audio_choice"
    ) {
      throw new Error("Le DTO public audio est invalide.");
    }
    expect(secondExercise.options).toEqual(firstExercise.options);
    expect(secondResponse?.contentSha256).toBe(firstResponse?.contentSha256);
  });

  it("distribue les champs d'exercice typé sans clé éditoriale", () => {
    const verified = verifyPublishedBundleRow(
      makePublishedLessonRow(makePublishableMechanicsBundle()),
    );
    if (verified === null) throw new Error("Bundle mécanique invalide.");

    const response = toPublicLessonResponse(verified);
    expect(response).not.toBeNull();
    expect(response?.lesson.exercises).toHaveLength(5);
    const exercise = response?.lesson.exercises.find(
      (candidate) => candidate.type === "word_order",
    );
    if (exercise?.type !== "word_order") {
      throw new Error("Exercice word_order absent du DTO.");
    }
    expect(exercise.tokens).toHaveLength(3);
    expect(exercise).not.toHaveProperty("itemId");
    expect(exercise).not.toHaveProperty("translationFr");
    expect(exercise).not.toHaveProperty("correctOrder");
  });
});
