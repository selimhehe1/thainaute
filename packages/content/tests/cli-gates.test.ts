import { describe, expect, it } from "vitest";

import { runContentCli } from "../src/cli";
import {
  readFiveMechanicsFixtureBundle,
  validateBundle,
  validateBundleStructureMetadata,
} from "../src";

function capturedOutput() {
  const logs: string[] = [];
  const errors: string[] = [];
  return {
    errors,
    logs,
    output: {
      error: (...values: unknown[]) =>
        errors.push(values.map(String).join(" ")),
      log: (...values: unknown[]) => logs.push(values.map(String).join(" ")),
    },
  };
}

describe("portes CLI du corpus", () => {
  it("valide les 66 paquets, une voix en attente n'étant pas un défaut de structure", async () => {
    const capture = capturedOutput();

    const status = await runContentCli(["validate", "--all"], capture.output);

    // Ce test attendait l'échec, et nommait u03-l3b et u04-l4b. Il entérinait
    // la dette au lieu de la faire tomber, et il empêchait la CI de garder le
    // corpus : `content:validate` n'inspectait que la fixture technique.
    expect(status).toBe(0);
    expect(capture.logs.join("\n")).toMatch(/66 paquet\(s\)/u);
    expect(capture.errors).toStrictEqual([]);
  });

  it("refuse de PUBLIER un exercice dont la voix manque encore", async () => {
    const capture = capturedOutput();

    const status = await runContentCli(
      ["audit", "u03-l3b", "--release"],
      capture.output,
    );

    expect(status).toBe(1);
    expect(capture.errors.join("\n")).toContain("AUDIO_ASSET_MISSING");
  });

  it("ne reproche aucune voix manquante à une leçon dont l'audio est complet", async () => {
    const capture = capturedOutput();

    await runContentCli(["audit", "u01-l1a", "--release"], capture.output);

    expect(capture.errors.join("\n")).not.toContain("AUDIO_ASSET_MISSING");
  });

  it("audit --release audite tout le corpus et bloque chaque brouillon", async () => {
    const capture = capturedOutput();

    const status = await runContentCli(["audit", "--release"], capture.output);

    expect(status).toBe(1);
    expect(capture.errors.join("\n")).toContain(
      "u01-l1a [publication] VISIBILITY_NOT_PUBLIC",
    );
    expect(capture.errors.join("\n")).toContain(
      "u13-l13e [publication] VISIBILITY_NOT_PUBLIC",
    );
    expect(capture.errors.join("\n")).toMatch(/sur 66 paquet\(s\)/u);
  });

  it("l'audit informatif historique reste utilisable sur une cible", async () => {
    const capture = capturedOutput();

    const status = await runContentCli(["audit", "fixture"], capture.output);

    expect(status).toBe(0);
    expect(capture.logs.join("\n")).toMatch(/bloqueur\(s\) actif\(s\)/u);
  });
});

describe("portes indépendantes d'un paquet", () => {
  it("restitue ensemble une erreur structurelle et une référence audio absente", async () => {
    const bundle = structuredClone(readFiveMechanicsFixtureBundle());
    const wordOrder = bundle.lesson.exercises.find(
      (exercise) => exercise.type === "word_order",
    );
    if (wordOrder === undefined || wordOrder.type !== "word_order") {
      throw new Error("Fixture word_order absente.");
    }
    wordOrder.correctOrder = ["41000000-0000-4000-8000-000000000099"];
    // Un manifeste VIDE ne convient plus pour ce test : une voix en attente
    // est légitime pendant tout le brouillon, et c'est désormais la porte de
    // publication qui la refuse. On garde donc une vraie incohérence de
    // structure : un audio rattaché à un item que la leçon ne porte pas.
    const entree = bundle.audioManifest.entries[0];
    if (entree === undefined) throw new Error("Fixture audio absente.");
    entree.itemId = "41000000-0000-4000-8000-000000000099";

    await expect(validateBundle(bundle)).rejects.toThrow(
      /\[structure\].*Jeton inconnu[\s\S]*\[références audio\].*Item inconnu pour l'audio/u,
    );
  });

  it("refuse Markdown et notes internes dans un titre utilisateur", () => {
    const bundle = structuredClone(readFiveMechanicsFixtureBundle());
    bundle.lesson.titleFr = "Titre **de travail** pour arbitrage";

    expect(() => validateBundleStructureMetadata(bundle)).toThrow(
      /titleFr: Markdown interdit/u,
    );
  });
});
