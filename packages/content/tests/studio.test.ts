import { describe, expect, it } from "vitest";

import { getPublicationBlockers } from "../src/audit";
import { readFixtureBundle } from "../src/repository";
import {
  CONTENT_SCHEMA_LIMITS,
  lessonSchema,
  type ContentBundle,
} from "../src/schemas";
import {
  CONTENT_REVIEW_MAX_ISSUES,
  contentReviewRequestSchema,
  contentReviewResponseSchema,
  reviewContentBundle,
} from "../src/studio";

function blockerCodes(bundle: ContentBundle): string[] {
  return getPublicationBlockers(bundle).map(({ code }) => code);
}

function makePublishableBundle(): ContentBundle {
  const bundle = readFixtureBundle();
  bundle.lesson.workflowStatus = "published";
  bundle.lesson.visibility = "public";
  bundle.lesson.publishedAt = "2026-08-02T08:00:00.000Z";

  for (const audit of bundle.lesson.provenance.audits) {
    audit.status = "passed";
  }
  for (const finding of bundle.lesson.provenance.findings) {
    finding.status = "resolved";
  }
  for (const source of bundle.sources) {
    source.kind = "official";
    source.commercialUse = true;
    source.redistribution = true;
    source.publicationAuthorized = true;
  }
  for (const item of bundle.lesson.items) {
    item.translationFr = "Valeur française de test.";
    item.transcription.value = "transcription-test";
    item.register = "neutre";
    for (const syllable of item.syllables) {
      syllable.ipa = "k";
      syllable.tone = "bas";
      syllable.vowelLength = "short";
      syllable.initial = "k";
      syllable.final = "aucune";
    }
  }
  for (const entry of bundle.audioManifest.entries) {
    entry.variant = "natural";
    entry.voiceKind = "native_human";
    entry.consentReference = "CONSENT_TEST_REFERENCE";
  }

  return bundle;
}

describe("revue éditoriale Studio", () => {
  it("résume la fixture valide sans la rendre publiable", () => {
    const report = reviewContentBundle(readFixtureBundle());

    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
    expect(report.valid).toBe(true);
    expect(report.publishable).toBe(false);
    expect(report.issues).toEqual([]);
    expect(report.blockers.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "VISIBILITY_NOT_PUBLIC",
        "FIXTURE_NOT_PUBLISHABLE",
        "WORKFLOW_NOT_PUBLISHED",
        "AUDIT_INCOMPLETE",
      ]),
    );
    expect(report.summary?.lesson).toMatchObject({
      lessonId: "10000000-0000-4000-8000-000000000001",
      versionId: "10000000-0000-4000-8000-000000000002",
      titleFr: "Boucle technique locale",
      workflowStatus: "draft",
      visibility: "fixture",
      publishedAt: null,
    });
    expect(report.summary?.audits).toMatchObject({
      total: 7,
      pending: 7,
      passed: 0,
    });
    expect(report.summary?.sources.entries[0]).toMatchObject({
      sourceId: "TEST_ONLY",
      label: "Fixture structurelle créée par le projet",
      license: "INTERNAL-TEST-ONLY",
      consultedAt: "2026-08-01T00:00:00.000Z",
      publicationAuthorized: false,
    });
    expect(report.summary?.findings).toMatchObject({
      total: 1,
      open: 1,
      openBlocking: 1,
    });
    expect(report.summary?.items.entries[0]).toMatchObject({
      thaiRaw: "ก่",
      declaredCodePoints: ["U+0E01", "U+0E48"],
      actualCodePoints: ["U+0E01", "U+0E48"],
      exactMatch: true,
    });
    expect(report.summary?.audio).toMatchObject({
      total: 1,
      nativeHuman: 0,
      missingConsent: 0,
    });
    expect(report.summary?.audio.entries[0]?.consentStatus).toBe(
      "not_applicable",
    );
  });

  it("expose une enveloppe de requête versionnée qui accepte un bundle à revoir", () => {
    const request = {
      schemaVersion: 1,
      bundle: { invalid: true },
    };

    expect(contentReviewRequestSchema.safeParse(request).success).toBe(true);
    expect(
      contentReviewRequestSchema.safeParse({ ...request, schemaVersion: 2 })
        .success,
    ).toBe(false);
    expect(
      contentReviewRequestSchema.safeParse({ ...request, extra: true }).success,
    ).toBe(false);
  });

  it("borne et assainit les erreurs d'un schéma invalide", () => {
    const bundle = readFixtureBundle();
    const item = bundle.lesson.items[0];
    if (item === undefined) throw new Error("Fixture sans item.");
    const sensitiveValue = "NE_JAMAIS_RETOURNER_CE_SECRET";
    const invalidInput = {
      ...bundle,
      lesson: {
        ...bundle.lesson,
        [sensitiveValue]: sensitiveValue,
        items: Array.from({ length: 80 }, () => ({
          ...item,
          thaiRaw: { sensitiveValue },
        })),
      },
    };

    const report = reviewContentBundle(invalidInput);
    const serialized = JSON.stringify(report);

    expect(report.valid).toBe(false);
    expect(report.publishable).toBe(false);
    expect(report.summary).toBeNull();
    expect(report.issues).toHaveLength(CONTENT_REVIEW_MAX_ISSUES);
    expect(report.issues.every(({ code }) => code === "SCHEMA_INVALID")).toBe(
      true,
    );
    expect(report.blockers[0]?.code).toBe("INVALID_CONTENT_BUNDLE");
    expect(serialized).not.toContain(sensitiveValue);
    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
  });

  it("rapporte une incohérence de métadonnées sans recopier l'identifiant reçu", () => {
    const bundle = readFixtureBundle();
    const item = bundle.lesson.items[0];
    if (item === undefined) throw new Error("Fixture sans item.");
    const sensitiveSourceId = "SOURCE_INTERNE_CONFIDENTIELLE";
    item.sourceIds = [sensitiveSourceId];

    const report = reviewContentBundle(bundle);
    const serializedIssues = JSON.stringify(report.issues);

    expect(report.valid).toBe(false);
    expect(report.publishable).toBe(false);
    expect(report.issues).toEqual([
      {
        code: "METADATA_INVALID",
        path: [],
        message: "Les références internes du bundle sont incohérentes.",
      },
    ]);
    expect(report.summary).not.toBeNull();
    expect(report.blockers[0]?.code).toBe("INVALID_CONTENT_BUNDLE");
    expect(serializedIssues).not.toContain(sensitiveSourceId);
    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
  });

  it("accepte le statut conflict et l'expose comme blocage dédié", () => {
    const bundle = readFixtureBundle();
    bundle.lesson.workflowStatus = "conflict";

    expect(lessonSchema.safeParse(bundle.lesson).success).toBe(true);
    expect(blockerCodes(bundle)).toContain("WORKFLOW_CONFLICT");
    expect(reviewContentBundle(bundle).summary?.lesson.workflowStatus).toBe(
      "conflict",
    );
  });

  it("bloque toutes les visibilités non publiques", () => {
    const bundle = makePublishableBundle();
    bundle.lesson.visibility = "internal";

    expect(blockerCodes(bundle)).toContain("VISIBILITY_NOT_PUBLIC");
    expect(reviewContentBundle(bundle).publishable).toBe(false);
  });

  it("exige publishedAt pour une version published", () => {
    const bundle = makePublishableBundle();
    bundle.lesson.publishedAt = null;

    expect(blockerCodes(bundle)).toContain("PUBLISHED_AT_MISSING");
    expect(reviewContentBundle(bundle).publishable).toBe(false);
  });

  it("refuse publishedAt avant le statut published", () => {
    const bundle = makePublishableBundle();
    bundle.lesson.workflowStatus = "approved";

    expect(blockerCodes(bundle)).toEqual(
      expect.arrayContaining([
        "WORKFLOW_NOT_PUBLISHED",
        "PUBLISHED_AT_INCONSISTENT",
      ]),
    );
    expect(reviewContentBundle(bundle).publishable).toBe(false);
  });

  it("déclare publiable un bundle qui franchit toutes les portes", () => {
    const report = reviewContentBundle(makePublishableBundle());

    expect(report).toMatchObject({
      schemaVersion: 1,
      valid: true,
      publishable: true,
      issues: [],
      blockers: [],
    });
    expect(report.summary?.audio.entries[0]?.consentStatus).toBe("present");
    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
  });

  it("refuse les verdicts de revue contradictoires", () => {
    const blocked = reviewContentBundle(readFixtureBundle());
    const publishable = reviewContentBundle(makePublishableBundle());

    for (const contradictory of [
      { ...blocked, publishable: true },
      { ...publishable, valid: false, publishable: true },
      {
        ...blocked,
        valid: true,
        issues: blocked.issues.concat({
          code: "SCHEMA_INVALID" as const,
          path: [],
          message: "Problème de test.",
        }),
      },
      { ...blocked, valid: false, issues: [], blockers: [] },
      { ...publishable, summary: null },
    ]) {
      expect(contentReviewResponseSchema.safeParse(contradictory).success).toBe(
        false,
      );
    }
  });

  it("accepte les bornes maximales du texte thaï et de ses points de code", () => {
    const bundle = readFixtureBundle();
    const item = bundle.lesson.items[0];
    if (item === undefined) throw new Error("Fixture sans item.");
    item.thaiRaw = "ก".repeat(CONTENT_SCHEMA_LIMITS.thaiRawLength);
    item.unicodeCodePoints = Array.from(
      { length: CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem },
      () => "U+0E01",
    );

    const report = reviewContentBundle(bundle);

    expect(report.valid).toBe(true);
    expect(report.summary?.items.entries[0]?.thaiRaw).toHaveLength(
      CONTENT_SCHEMA_LIMITS.thaiRawLength,
    );
    expect(report.summary?.items.entries[0]?.actualCodePoints).toHaveLength(
      CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem,
    );
    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
  });

  it("refuse le texte thaï et les tableaux de code points au-delà des bornes", () => {
    const bundle = readFixtureBundle();
    const item = bundle.lesson.items[0];
    if (item === undefined) throw new Error("Fixture sans item.");
    const oversizedThai = "ก".repeat(CONTENT_SCHEMA_LIMITS.thaiRawLength + 1);
    item.thaiRaw = oversizedThai;
    item.unicodeCodePoints = Array.from(
      { length: CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem + 1 },
      () => "U+0E01",
    );

    const report = reviewContentBundle(bundle);

    expect(report.valid).toBe(false);
    expect(report.publishable).toBe(false);
    expect(report.summary).toBeNull();
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SCHEMA_INVALID",
          path: ["lesson", "items", 0, "thaiRaw"],
        }),
        expect.objectContaining({
          code: "SCHEMA_INVALID",
          path: ["lesson", "items", 0, "unicodeCodePoints"],
        }),
      ]),
    );
    expect(JSON.stringify(report)).not.toContain(oversizedThai);
    expect(contentReviewResponseSchema.safeParse(report).success).toBe(true);
  });

  it("refuse une collection de leçon au-delà de sa borne", () => {
    const bundle = readFixtureBundle();
    const item = bundle.lesson.items[0];
    if (item === undefined) throw new Error("Fixture sans item.");
    bundle.lesson.items = Array.from(
      { length: CONTENT_SCHEMA_LIMITS.itemsPerLesson + 1 },
      () => structuredClone(item),
    );

    const report = reviewContentBundle(bundle);

    expect(report.valid).toBe(false);
    expect(report.summary).toBeNull();
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SCHEMA_INVALID",
          path: ["lesson", "items"],
        }),
      ]),
    );
  });

  it("ferme aussi le contrat de réponse sur les champs Unicode", () => {
    const report = reviewContentBundle(readFixtureBundle());
    const oversizedThaiReport = structuredClone(report);
    const oversizedThaiEntry = oversizedThaiReport.summary?.items.entries[0];
    if (oversizedThaiEntry === undefined) {
      throw new Error("Rapport fixture sans item.");
    }
    oversizedThaiEntry.thaiRaw = "ก".repeat(
      CONTENT_SCHEMA_LIMITS.thaiRawLength + 1,
    );

    const oversizedCodePointsReport = structuredClone(report);
    const oversizedCodePointsEntry =
      oversizedCodePointsReport.summary?.items.entries[0];
    if (oversizedCodePointsEntry === undefined) {
      throw new Error("Rapport fixture sans item.");
    }
    oversizedCodePointsEntry.actualCodePoints = Array.from(
      { length: CONTENT_SCHEMA_LIMITS.unicodeCodePointsPerItem + 1 },
      () => "U+0E01",
    );

    expect(
      contentReviewResponseSchema.safeParse(oversizedThaiReport).success,
    ).toBe(false);
    expect(
      contentReviewResponseSchema.safeParse(oversizedCodePointsReport).success,
    ).toBe(false);
  });
});
