import {
  readCompiledLessonBundle,
  readFiveMechanicsFixtureBundle,
} from "@thainaute/content";
import { describe, expect, it } from "vitest";

import {
  REFERENCE_TECHNIQUE,
  referenceVocalePourLecon,
} from "../lib/reference-vocale";

const publiee = readCompiledLessonBundle("u01-l1a")?.lesson;
const { lesson: fixture } = readFiveMechanicsFixtureBundle();

describe("référence de la comparaison vocale", () => {
  it("prend le premier mot que la leçon fait entendre", () => {
    if (publiee === undefined) {
      throw new Error("Leçon publiée u01-l1a absente du registre.");
    }
    const exercice = publiee.exercises.find(
      (candidat) => candidat.type === "audio_choice",
    );
    if (exercice?.type !== "audio_choice") {
      throw new Error("La leçon 1A doit porter un exercice d’écoute.");
    }

    const reference = referenceVocalePourLecon(publiee, {
      [exercice.audioAssetId]: "/audio/u01-l1a/mot.wav",
    });

    expect(reference.src).toBe("/audio/u01-l1a/mot.wav");
    // Le libellé porte la graphie thaïe ET sa transcription : la personne
    // doit savoir ce qu'elle écoute avant de s'y comparer.
    expect(reference.libelle).toMatch(/[฀-๿]/u);
    expect(reference.libelle).toContain(" · ");
    // Aucune piste de sous-titres inventée pour une voix thaïe.
    expect(reference.captionsSrc).toBeNull();
    expect(reference.description).toContain("Voix de référence");
  });

  it("retombe sur le signal de test quand la leçon n’a pas de voix", () => {
    if (publiee === undefined) {
      throw new Error("Leçon publiée u01-l1a absente du registre.");
    }
    // Manifeste vide : c'est le cas de 62 leçons sur 68 aujourd'hui. Servir
    // le bip est alors la vérité, pas un défaut.
    expect(referenceVocalePourLecon(publiee, {})).toStrictEqual(
      REFERENCE_TECHNIQUE,
    );
    expect(referenceVocalePourLecon(publiee, undefined)).toStrictEqual(
      REFERENCE_TECHNIQUE,
    );
  });

  it("garde son signal fictif à la boucle technique", () => {
    expect(referenceVocalePourLecon(fixture, {})).toStrictEqual(
      REFERENCE_TECHNIQUE,
    );
  });
});
