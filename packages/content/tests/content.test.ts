import { describe, expect, it } from "vitest";

import {
  assertPublishable,
  contentBundleSchema,
  getPublicationBlockers,
  lessonSchema,
  readFixtureBundle,
  validateBundle,
} from "../src";

describe("fixture de contenu", () => {
  it("conserve les points de code thaïs et vérifie les fichiers audio", async () => {
    const bundle = readFixtureBundle();
    await expect(validateBundle(bundle)).resolves.toBeUndefined();
    expect(bundle.lesson.items[0]?.unicodeCodePoints).toEqual([
      "U+0E01",
      "U+0E48",
    ]);
  });

  it("reste explicitement non publiable", () => {
    const bundle = readFixtureBundle();
    const codes = getPublicationBlockers(bundle).map(({ code }) => code);
    expect(codes).toContain("FIXTURE_NOT_PUBLISHABLE");
    expect(codes).toContain("AUDIT_INCOMPLETE");
    expect(codes).toContain("OPEN_BLOCKING_FINDING");
    expect(codes).toContain("SOURCE_NOT_COMMERCIAL");
    expect(codes).toContain("SOURCE_NOT_REDISTRIBUTABLE");
    expect(codes).toContain("SYNTHETIC_SOURCE_NOT_PUBLISHABLE");
    expect(() => assertPublishable(bundle)).toThrow(/FIXTURE_NOT_PUBLISHABLE/u);
  });

  it("exige les sept dimensions d'audit distinctes", () => {
    const lesson = structuredClone(readFixtureBundle().lesson);
    const secondAudit = lesson.provenance.audits[1];
    if (secondAudit === undefined) throw new Error("Fixture audit incomplète.");
    secondAudit.dimension = "orthography";

    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("exige version, confiance et acteurs dans la provenance", () => {
    const bundle = readFixtureBundle();
    const source = bundle.sources[0];
    const audit = bundle.lesson.provenance.audits[0];
    if (source === undefined || audit === undefined) {
      throw new Error("Fixture de provenance incomplète.");
    }

    expect(
      contentBundleSchema.safeParse({
        ...bundle,
        sources: [{ ...source, versionSource: undefined }],
      }).success,
    ).toBe(false);
    expect(
      contentBundleSchema.safeParse({
        ...bundle,
        sources: [{ ...source, confidence: undefined }],
      }).success,
    ).toBe(false);
    expect(
      lessonSchema.safeParse({
        ...bundle.lesson,
        provenance: {
          ...bundle.lesson.provenance,
          generationActors: [],
        },
      }).success,
    ).toBe(false);
    expect(
      lessonSchema.safeParse({
        ...bundle.lesson,
        provenance: {
          ...bundle.lesson.provenance,
          audits: [
            { ...audit, auditor: undefined },
            ...bundle.lesson.provenance.audits.slice(1),
          ],
        },
      }).success,
    ).toBe(false);
  });

  it("bloque une publication sans auteur et auditeurs humains", () => {
    const bundle = readFixtureBundle();
    const generationActor = bundle.lesson.provenance.generationActors[0];
    const audit = bundle.lesson.provenance.audits[0];
    if (generationActor === undefined || audit === undefined) {
      throw new Error("Fixture d'acteurs incomplète.");
    }
    generationActor.kind = "ai";
    audit.auditor.kind = "ai";

    const codes = getPublicationBlockers(bundle).map(({ code }) => code);
    expect(codes).toContain("HUMAN_AUTHOR_MISSING");
    expect(codes).toContain("HUMAN_AUDITOR_MISSING");
  });

  it("refuse un exercice rattache a l'audio d'un autre item", async () => {
    const bundle = readFixtureBundle();
    const firstItem = bundle.lesson.items[0];
    const exercise = bundle.lesson.exercises[0];
    if (firstItem === undefined || exercise === undefined) {
      throw new Error("Fixture incomplete.");
    }
    const secondItem = structuredClone(firstItem);
    secondItem.id = "30000000-0000-4000-8000-000000000099";
    bundle.lesson.items.push(secondItem);
    exercise.itemId = secondItem.id;

    await expect(validateBundle(bundle)).rejects.toThrow(
      /Audio rattache a un autre item/u,
    );
  });
});
