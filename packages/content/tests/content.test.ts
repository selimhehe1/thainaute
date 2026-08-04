import { describe, expect, it } from "vitest";

import {
  assertPublishable,
  contentBundleSchema,
  getPublicationBlockers,
  lessonSchema,
  readFiveMechanicsFixtureBundle,
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

  it("valide la fixture des cinq mécaniques de bout en bout", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    await expect(validateBundle(bundle)).resolves.toBeUndefined();
    const types = bundle.lesson.exercises.map(({ type }) => type);
    expect(types).toEqual([
      "audio_choice",
      "association",
      "word_order",
      "recall",
      "reading",
    ]);
    const codes = getPublicationBlockers(bundle).map(({ code }) => code);
    expect(codes).toContain("FIXTURE_NOT_PUBLISHABLE");
  });

  it("refuse une association dont deux paires visent le même item", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const association = bundle.lesson.exercises.find(
      (exercise) => exercise.type === "association",
    );
    if (association?.type !== "association") {
      throw new Error("Fixture association incomplète.");
    }
    const secondPair = association.pairs[1];
    const firstPair = association.pairs[0];
    if (secondPair === undefined || firstPair === undefined) {
      throw new Error("Fixture association incomplète.");
    }
    secondPair.itemId = firstPair.itemId;

    await expect(validateBundle(bundle)).rejects.toThrow(
      /items des paires .*identifiant dupliqué/u,
    );
  });

  it("refuse un ordre correct citant un jeton inconnu", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const wordOrder = bundle.lesson.exercises.find(
      (exercise) => exercise.type === "word_order",
    );
    if (wordOrder?.type !== "word_order") {
      throw new Error("Fixture word_order incomplète.");
    }
    wordOrder.correctOrder = [
      wordOrder.correctOrder[0] ?? "",
      "41000000-0000-4000-8000-000000000099",
    ];

    await expect(validateBundle(bundle)).rejects.toThrow(
      /Jeton inconnu dans l'ordre correct/u,
    );
  });

  it("refuse une réponse de rappel non normalisée NFC", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const recall = bundle.lesson.exercises.find(
      (exercise) => exercise.type === "recall",
    );
    if (recall?.type !== "recall") {
      throw new Error("Fixture recall incomplète.");
    }
    // « à » décomposé (a + accent grave combinant), que NFC recomposerait.
    recall.acceptedAnswers = [{ value: "kà", kind: "transcription" }];

    await expect(validateBundle(bundle)).rejects.toThrow(/non normalisée NFC/u);
  });

  it("refuse une bonne réponse de lecture hors des options", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const reading = bundle.lesson.exercises.find(
      (exercise) => exercise.type === "reading",
    );
    if (reading?.type !== "reading") {
      throw new Error("Fixture reading incomplète.");
    }
    reading.correctOptionId = "41000000-0000-4000-8000-000000000099";

    await expect(validateBundle(bundle)).rejects.toThrow(
      /Bonne réponse inconnue/u,
    );
  });

  it("refuse un exercice d'un type inconnu", () => {
    const lesson = structuredClone(readFiveMechanicsFixtureBundle().lesson);
    const exercise = lesson.exercises[0];
    if (exercise === undefined) throw new Error("Fixture incomplète.");
    (exercise as { type: string }).type = "dictation";

    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("refuse un exercice rattache a l'audio d'un autre item", async () => {
    const bundle = readFixtureBundle();
    const firstItem = bundle.lesson.items[0];
    const exercise = bundle.lesson.exercises[0];
    if (firstItem === undefined || exercise?.type !== "audio_choice") {
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

describe("traçabilité de la voix synthétique", () => {
  function withVoice(
    voiceKind: "synthetic_tts" | "native_human",
    overrides: Record<string, unknown> = {},
  ) {
    const bundle = readFiveMechanicsFixtureBundle();
    const entry = bundle.audioManifest.entries[0];
    if (entry === undefined) throw new Error("Fixture audio manquante.");
    return {
      ...bundle,
      audioManifest: {
        ...bundle.audioManifest,
        entries: [{ ...entry, voiceKind, variant: "natural", ...overrides }],
      },
    };
  }

  const synthesis = {
    provider: "openai",
    model: "tts-1",
    voice: "alloy",
    sourceText: "ก่",
    parameters: { format: "wav", speed: "1.0" },
    generatedAt: "2026-08-04T12:00:00.000Z",
  };

  it("refuse une voix synthétique sans traçabilité de synthèse", () => {
    expect(
      contentBundleSchema.safeParse(withVoice("synthetic_tts")).success,
    ).toBe(false);
  });

  it("refuse des paramètres de synthèse sur une voix humaine", () => {
    expect(
      contentBundleSchema.safeParse(
        withVoice("native_human", {
          consentReference: "consent-2026-001",
          synthesis,
        }),
      ).success,
    ).toBe(false);
  });

  it("bloque la publication d'un audio synthétique non contrôlé", () => {
    const bundle = contentBundleSchema.parse(
      withVoice("synthetic_tts", { synthesis }),
    );
    expect(getPublicationBlockers(bundle).map(({ code }) => code)).toContain(
      "SYNTHETIC_AUDIO_UNVERIFIED",
    );
  });

  it("bloque la publication d'un audio relu autrement que demandé", () => {
    // La reconnaissance a relu ขา là où la leçon voulait ข่า : le ton est
    // écrasé, donc c'est un autre mot, donc la publication s'arrête.
    const bundle = contentBundleSchema.parse(
      withVoice("synthetic_tts", {
        synthesis: { ...synthesis, sourceText: "ข่า" },
        roundTrip: {
          transcriber: "whisper-1",
          transcript: "ขา",
          matchesSource: false,
          checkedAt: "2026-08-04T12:01:00.000Z",
        },
      }),
    );
    expect(getPublicationBlockers(bundle).map(({ code }) => code)).toContain(
      "SYNTHETIC_AUDIO_MISREAD",
    );
  });

  it("laisse passer un audio synthétique relu conforme", () => {
    const bundle = contentBundleSchema.parse(
      withVoice("synthetic_tts", {
        synthesis: { ...synthesis, sourceText: "ข่า" },
        roundTrip: {
          transcriber: "whisper-1",
          transcript: "ข่า",
          matchesSource: true,
          checkedAt: "2026-08-04T12:01:00.000Z",
        },
      }),
    );
    const codes = getPublicationBlockers(bundle).map(({ code }) => code);
    expect(codes).not.toContain("SYNTHETIC_AUDIO_UNVERIFIED");
    expect(codes).not.toContain("SYNTHETIC_AUDIO_MISREAD");
  });
});
