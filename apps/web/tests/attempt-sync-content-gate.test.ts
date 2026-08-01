import { attemptBatchSchema } from "@thainaute/sync";
import { describe, expect, it } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import {
  deriveAuthoritativeAttemptScope,
  derivePublishedAnswerKeys,
} from "../lib/server/attempt-sync/supabase-repository";
import {
  makePublishableBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

describe("porte serveur des clés de correction publiées", () => {
  it("accepte seulement un bundle complet, cohérent et hashé", () => {
    const bundle = makePublishableBundle();

    expect(derivePublishedAnswerKeys([makePublishedLessonRow(bundle)])).toEqual(
      [
        {
          exerciseId: bundle.lesson.exercises[0]?.id,
          itemId: bundle.lesson.exercises[0]?.itemId,
          correctOptionId: bundle.lesson.exercises[0]?.correctOptionId,
          skill: "listening",
          contentVersionId: bundle.lesson.versionId,
          validOptionIds: bundle.lesson.exercises[0]?.options.map(
            (option) => option.id,
          ),
        },
      ],
    );
  });

  it("refuse une altération postérieure au hash", () => {
    const bundle = makePublishableBundle();
    const row = makePublishedLessonRow(bundle);
    bundle.lesson.titleFr = "Titre altéré après signature";

    expect(derivePublishedAnswerKeys([row])).toEqual([]);
  });

  it("refuse une source sans droit commercial", () => {
    const bundle = makePublishableBundle();
    const source = bundle.sources[0];
    if (source === undefined) throw new Error("Fixture source manquante.");
    source.commercialUse = false;

    expect(derivePublishedAnswerKeys([makePublishedLessonRow(bundle)])).toEqual(
      [],
    );
  });

  it("refuse une source non redistribuable ou synthetique", () => {
    const restricted = makePublishableBundle();
    const restrictedSource = restricted.sources[0];
    if (restrictedSource === undefined) {
      throw new Error("Fixture source manquante.");
    }
    restrictedSource.redistribution = false;
    expect(
      derivePublishedAnswerKeys([makePublishedLessonRow(restricted)]),
    ).toEqual([]);

    const synthetic = makePublishableBundle();
    const syntheticSource = synthetic.sources[0];
    if (syntheticSource === undefined) {
      throw new Error("Fixture source manquante.");
    }
    syntheticSource.kind = "synthetic_fixture";
    expect(
      derivePublishedAnswerKeys([makePublishedLessonRow(synthetic)]),
    ).toEqual([]);
  });

  it("dérive le périmètre historique uniquement depuis la clé publiée", () => {
    const bundle = makePublishableBundle();
    const answerKeys = derivePublishedAnswerKeys([
      makePublishedLessonRow(bundle),
    ]);
    const exercise = bundle.lesson.exercises[0];
    if (exercise === undefined) throw new Error("Fixture exercice manquante.");
    const attempt = attemptBatchSchema.parse({
      attempts: [
        {
          eventId: "40000000-0000-4000-8000-000000000001",
          deviceId: "41000000-0000-4000-8000-000000000001",
          exerciseId: exercise.id,
          selectedOptionId: exercise.options[0]?.id,
          answeredAt: "2026-08-01T10:00:00.000Z",
          durationMs: 1_000,
          contentVersionId: bundle.lesson.versionId,
          algorithmVersion: "srs-v0",
        },
      ],
    }).attempts[0];
    if (attempt === undefined) throw new Error("Fixture tentative manquante.");

    const scope = deriveAuthoritativeAttemptScope([attempt], answerKeys);

    expect(scope.itemIds).toEqual([exercise.itemId]);
    expect([...scope.requestedPairs]).toEqual([
      `${exercise.itemId}\u0000${exercise.skill}`,
    ]);
  });

  it("échoue fermée si deux clés autoritaires divergent", () => {
    const bundle = makePublishableBundle();
    const answerKey = derivePublishedAnswerKeys([
      makePublishedLessonRow(bundle),
    ])[0];
    if (answerKey === undefined) throw new Error("Fixture clé manquante.");
    const attempt = attemptBatchSchema.parse({
      attempts: [
        {
          eventId: "40000000-0000-4000-8000-000000000001",
          deviceId: "41000000-0000-4000-8000-000000000001",
          exerciseId: answerKey.exerciseId,
          selectedOptionId: answerKey.validOptionIds[0],
          answeredAt: "2026-08-01T10:00:00.000Z",
          durationMs: 1_000,
          contentVersionId: answerKey.contentVersionId,
          algorithmVersion: "srs-v0",
        },
      ],
    }).attempts[0];
    if (attempt === undefined) throw new Error("Fixture tentative manquante.");

    expect(() =>
      deriveAuthoritativeAttemptScope(
        [attempt],
        [
          answerKey,
          {
            ...answerKey,
            itemId: "42000000-0000-4000-8000-000000000099",
          },
        ],
      ),
    ).toThrow(AttemptInfrastructureError);
  });
});
