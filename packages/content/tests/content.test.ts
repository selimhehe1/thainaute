import { describe, expect, it } from "vitest";

import {
  assertPublishable,
  authoringCompiledLessonIds,
  authoringCatalog,
  authoringDrafts,
  catalogByUnit,
  compiledLessonIds,
  contentBundleSchema,
  getPublicationBlockers,
  lessonSchema,
  readCompiledLessonBundle,
  readAuthoringCompiledLessonBundle,
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

  it.each(
    compiledLessonIds().filter((identifiant) => identifiant.startsWith("u01-")),
  )(
    "%s : les textes visibles de l'unité active emploient le vocabulaire tonal canonique",
    (identifiant) => {
      const bundle = readCompiledLessonBundle(identifiant);
      if (bundle === null) throw new Error(`Leçon absente : ${identifiant}.`);

      const textesVisibles = [
        bundle.lesson.titleFr,
        bundle.lesson.objectiveFr,
        ...bundle.lesson.teaching.flatMap(({ titleFr, bodyFr }) => [
          titleFr,
          bodyFr,
        ]),
        ...bundle.lesson.pools.map(({ promptFr }) => promptFr),
        ...bundle.lesson.exercises.flatMap((exercise) => [
          exercise.promptFr,
          exercise.feedback.correctFr,
          exercise.feedback.incorrectFr,
          ...exercise.feedback.variants.flatMap(({ labelFr, textFr }) => [
            labelFr,
            textFr,
          ]),
        ]),
      ];

      expect(textesVisibles.join("\n")).not.toMatch(/mélodie|tonalité/iu);
    },
  );

  it("décrit les 66 leçons d'autorat sans doublon et les 13 unités", () => {
    expect(authoringCatalog).toHaveLength(66);
    expect(new Set(authoringCatalog.map(({ lessonId }) => lessonId)).size).toBe(
      authoringCatalog.length,
    );
    expect([...catalogByUnit().keys()]).toEqual(
      Array.from(
        { length: 13 },
        (_, index) => `u${String(index + 1).padStart(2, "0")}`,
      ),
    );
    expect(authoringCatalog.filter(({ compiled }) => compiled)).toHaveLength(
      66,
    );
    expect(
      compiledLessonIds().every((lessonId) =>
        authoringCatalog.some(
          (entry) => entry.lessonId === lessonId && entry.compiled,
        ),
      ),
    ).toBe(true);
    expect(
      authoringCatalog.every(
        ({ titleFr, objectiveFr }) =>
          titleFr.length > 0 && objectiveFr.length > 0,
      ),
    ).toBe(true);
    expect(
      authoringCatalog.every(
        ({ titleFr }) =>
          titleFr.length <= 160 &&
          !/(?:\*\*|__|`|titre de travail|note éditoriale|arbitrage)/iu.test(
            titleFr,
          ),
      ),
    ).toBe(true);
  });

  it("embarque les 66 paquets compilés pour la relecture interne", () => {
    const ids = authoringCompiledLessonIds();
    expect(ids).toHaveLength(66);
    expect(new Set(ids).size).toBe(ids.length);

    // Le corpus n'est plus uniformément brouillon depuis la signature de
    // l'unité 1. Ce qui doit rester invariant, c'est l'ACCORD entre les deux
    // champs : `published` va avec `public`, `draft` avec `internal`. Un
    // paquet publié mais resté interne, ou l'inverse, serait une porte
    // entrouverte.
    for (const lessonId of ids) {
      const bundle = readAuthoringCompiledLessonBundle(lessonId);
      expect(bundle).not.toBeNull();
      expect({
        statut: bundle?.lesson.workflowStatus,
        visibilite: bundle?.lesson.visibility,
      }).toStrictEqual(
        bundle?.lesson.workflowStatus === "published"
          ? { statut: "published", visibilite: "public" }
          : { statut: "draft", visibilite: "internal" },
      );
      expect(bundle?.lesson.items.length).toBeGreaterThan(0);
      expect(bundle?.lesson.exercises.length).toBeGreaterThan(0);
    }
  });

  it("conserve une preview textuelle interne pour chaque leçon non compilée", () => {
    expect(authoringDrafts).toHaveLength(
      authoringCatalog.filter(({ compiled }) => !compiled).length,
    );
    expect(
      authoringDrafts.every(
        ({ teaching, blockers, visibility, workflowStatus }) =>
          teaching.length > 0 &&
          blockers.length > 0 &&
          visibility === "internal" &&
          workflowStatus === "draft",
      ),
    ).toBe(true);
    expect(
      authoringDrafts.every(
        ({ lessonId }) =>
          !compiledLessonIds().includes(lessonId) &&
          authoringCatalog.some(
            (entry) => entry.lessonId === lessonId && !entry.compiled,
          ),
      ),
    ).toBe(true);
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

describe("pédagogie rédigée : options thaïes, retours ciblés, viviers", () => {
  function audioChoiceOf(
    bundle: ReturnType<typeof readFiveMechanicsFixtureBundle>,
  ) {
    const exercise = bundle.lesson.exercises.find(
      (candidate) => candidate.type === "audio_choice",
    );
    if (exercise?.type !== "audio_choice") {
      throw new Error("Fixture audio_choice incomplète.");
    }
    return exercise;
  }

  it("accepte une option portant du thaï sans libellé français", async () => {
    // Un exercice d'écoute oppose couramment des graphies entre elles.
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    const option = exercise.options[0];
    if (option === undefined) throw new Error("Fixture option incomplète.");
    option.labelFr = null;
    option.thaiRaw = "ขา";
    option.transcription = "khǎa";

    await expect(validateBundle(bundle)).resolves.toBeUndefined();
  });

  it("refuse une option muette des deux côtés", () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    const option = exercise.options[0];
    if (option === undefined) throw new Error("Fixture option incomplète.");
    option.labelFr = null;
    option.thaiRaw = null;

    expect(contentBundleSchema.safeParse(bundle).success).toBe(false);
  });

  it("refuse une transcription qui ne transcrit rien", () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    const option = exercise.options[0];
    if (option === undefined) throw new Error("Fixture option incomplète.");
    option.transcription = "khǎa";

    expect(contentBundleSchema.safeParse(bundle).success).toBe(false);
  });

  it("refuse une option thaïe non normalisée NFC", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    const option = exercise.options[0];
    if (option === undefined) throw new Error("Fixture option incomplète.");
    // Marque de ton (mai ek, classe combinatoire 107) saisie AVANT une
    // voyelle souscrite (sara u, classe 103) : NFC les réordonne. C'est la
    // saisie fautive la plus courante en thaï, et deux chaînes visuellement
    // identiques ne se compareraient plus.
    const malOrdonne = "กุ่";
    // On affirme la prémisse : sans elle, ce test passerait pour de
    // mauvaises raisons le jour où la chaîne choisie deviendrait stable.
    expect(malOrdonne).not.toEqual(malOrdonne.normalize("NFC"));
    option.thaiRaw = malOrdonne;

    await expect(validateBundle(bundle)).rejects.toThrow(
      /Option non normalisée NFC/u,
    );
  });

  it("refuse un retour ciblé sur une option qui n'existe pas", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    exercise.feedback.variants = [
      {
        selectedOptionId: "41000000-0000-4000-8000-000000000099",
        labelFr: "confusion bas contre descendant",
        textFr: "Réécoutez : la voix se pose, elle ne tombe pas.",
      },
    ];

    await expect(validateBundle(bundle)).rejects.toThrow(
      /Retour ciblé sur une option inconnue/u,
    );
  });

  it("accepte un retour ciblé sur un distracteur réel", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    const distracteur = exercise.options.find(
      ({ id }) => id !== exercise.correctOptionId,
    );
    if (distracteur === undefined) {
      throw new Error("Fixture distracteur incomplète.");
    }
    exercise.feedback.variants = [
      {
        selectedOptionId: distracteur.id,
        labelFr: "confusion bas contre descendant",
        textFr: "Réécoutez : la voix se pose, elle ne tombe pas.",
      },
    ];

    await expect(validateBundle(bundle)).resolves.toBeUndefined();
  });

  it("refuse un vivier qui annonce plus de tirages qu'il n'en porte", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    exercise.poolId = "u01-l1a-p1";
    exercise.drawIndex = 1;
    bundle.lesson.pools = [
      {
        poolId: "u01-l1a-p1",
        promptFr: "Quel ton entendez-vous ?",
        mechanic: "audio_choice",
        drawCount: 5,
        passRequired: 4,
        sampleSize: 5,
      },
    ];

    await expect(validateBundle(bundle)).rejects.toThrow(
      /annonce 5 tirages mais en porte 1/u,
    );
  });

  it("refuse un vivier dont la mécanique contredit son tirage", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    const exercise = audioChoiceOf(bundle);
    exercise.poolId = "u01-l1a-p1";
    exercise.drawIndex = 1;
    bundle.lesson.pools = [
      {
        poolId: "u01-l1a-p1",
        promptFr: "Reliez chaque mot à sa courbe.",
        mechanic: "association",
        drawCount: 1,
        passRequired: 1,
        sampleSize: 1,
      },
    ];

    await expect(validateBundle(bundle)).rejects.toThrow(
      /annonce association mais .* est audio_choice/u,
    );
  });

  it("refuse un seuil de réussite impossible à atteindre", () => {
    const bundle = readFiveMechanicsFixtureBundle();
    bundle.lesson.pools = [
      {
        poolId: "u01-l1a-p1",
        promptFr: "Quel ton entendez-vous ?",
        mechanic: "audio_choice",
        drawCount: 12,
        // On ne joue que 5 tirages : en exiger 9 rend le vivier invalidable.
        passRequired: 9,
        sampleSize: 5,
      },
    ];

    expect(contentBundleSchema.safeParse(bundle).success).toBe(false);
  });

  it("refuse un tirage numéroté sans vivier", async () => {
    const bundle = readFiveMechanicsFixtureBundle();
    audioChoiceOf(bundle).drawIndex = 3;

    await expect(validateBundle(bundle)).rejects.toThrow(/Tirage sans vivier/u);
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

  const toneCheck = {
    method: "f0_contour" as const,
    tool: "scripts/verification/f0-contour.mjs",
    expectedTone: "rising" as const,
    observedShape: "dipping" as const,
    semitoneSlope: 0.77,
    semitoneRange: 3.4,
    consistent: true,
    checkedAt: "2026-08-04T12:02:00.000Z",
  };

  it("accepte le contrôle acoustique seul, sans reconnaissance vocale", () => {
    // La mesure de hauteur n'a aucun modèle de langue dans la boucle : elle
    // suffit là où une transcription ne prouverait rien.
    const bundle = contentBundleSchema.parse(
      withVoice("synthetic_tts", {
        synthesis: { ...synthesis, sourceText: "ขา" },
        toneCheck,
      }),
    );
    expect(
      getPublicationBlockers(bundle).map(({ code }) => code),
    ).not.toContain("SYNTHETIC_AUDIO_UNVERIFIED");
  });

  it("bloque la publication d'un contour incompatible avec le ton", () => {
    const bundle = contentBundleSchema.parse(
      withVoice("synthetic_tts", {
        synthesis: { ...synthesis, sourceText: "ขา" },
        toneCheck: {
          ...toneCheck,
          observedShape: "falling" as const,
          semitoneSlope: -3.44,
          consistent: false,
        },
      }),
    );
    expect(getPublicationBlockers(bundle).map(({ code }) => code)).toContain(
      "SYNTHETIC_AUDIO_TONE_MISMATCH",
    );
  });

  it("refuse d'attester conforme un ton montant réalisé descendant", () => {
    // Le cas mesuré le 2026-08-04 sur tts-1-hd : ขา (jambe) sort avec le
    // contour de ค่า (valeur). Déclarer cela conforme serait une
    // attestation complaisante, donc le schéma lui-même la refuse.
    expect(
      contentBundleSchema.safeParse(
        withVoice("synthetic_tts", {
          synthesis: { ...synthesis, sourceText: "ขา" },
          toneCheck: {
            ...toneCheck,
            observedShape: "falling" as const,
            consistent: true,
          },
        }),
      ).success,
    ).toBe(false);
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
