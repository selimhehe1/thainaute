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
  it("--all parcourt les 66 paquets sans s'arrêter à la première dette audio", async () => {
    const capture = capturedOutput();

    const status = await runContentCli(["validate", "--all"], capture.output);

    expect(status).toBe(1);
    expect(capture.errors.join("\n")).toMatch(/sur 66 paquet\(s\)/u);
    expect(capture.errors.join("\n")).toContain("u03-l3b");
    expect(capture.errors.join("\n")).toContain("u04-l4b");
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
    bundle.audioManifest.entries = [];

    await expect(validateBundle(bundle)).rejects.toThrow(
      /\[structure\].*Jeton inconnu[\s\S]*\[références audio\].*Audio inconnu/u,
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
