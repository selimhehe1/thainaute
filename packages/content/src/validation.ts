import type { ContentBundle } from "./schemas";

const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label}: identifiant dupliqué.`);
  }
}

function codePoints(value: string): string[] {
  return [...value].map((character) => {
    const valueAtPoint = character.codePointAt(0);
    if (valueAtPoint === undefined) {
      throw new Error("Point de code Unicode introuvable.");
    }
    return `U+${valueAtPoint.toString(16).toUpperCase().padStart(4, "0")}`;
  });
}

function assertCanonicalUuid(value: string, label: string): void {
  if (!CANONICAL_UUID_PATTERN.test(value)) {
    throw new Error(
      `${label}: UUID canonique requis pour le contenu publiable.`,
    );
  }
}

/** Vérifie les liens et métadonnées sans lire le système de fichiers. */
export function validateBundleMetadata(bundle: ContentBundle): void {
  const { lesson, audioManifest, sources } = bundle;
  const itemIds = lesson.items.map(({ id }) => id);
  const exerciseIds = lesson.exercises.map(({ id }) => id);
  const assetIds = audioManifest.entries.map(({ assetId }) => assetId);
  const sourceIds = sources.map(({ sourceId }) => sourceId);

  assertUnique(itemIds, "items");
  assertUnique(exerciseIds, "exercises");
  assertUnique(assetIds, "audio");
  assertUnique(sourceIds, "sources");
  assertUnique(lesson.provenance.sourceIds, "provenance de la leçon");
  assertUnique(
    lesson.provenance.generationActors.map(({ actorId }) => actorId),
    "acteurs de génération",
  );

  assertCanonicalUuid(lesson.lessonId, "lessonId");
  assertCanonicalUuid(lesson.versionId, "versionId");
  assertCanonicalUuid(lesson.audioManifestId, "audioManifestId");
  assertCanonicalUuid(audioManifest.manifestId, "manifestId");
  assertCanonicalUuid(audioManifest.lessonVersionId, "lessonVersionId audio");

  for (const sourceId of lesson.provenance.sourceIds) {
    if (!sourceIds.includes(sourceId)) {
      throw new Error(`Source de provenance inconnue ${sourceId}.`);
    }
  }

  if (audioManifest.manifestId !== lesson.audioManifestId) {
    throw new Error("Le manifeste audio ne correspond pas à la leçon.");
  }
  if (audioManifest.lessonVersionId !== lesson.versionId) {
    throw new Error("Le manifeste audio cible une autre version de leçon.");
  }

  for (const item of lesson.items) {
    assertCanonicalUuid(item.id, `item ${item.id}`);
    if (
      JSON.stringify(codePoints(item.thaiRaw)) !==
      JSON.stringify(item.unicodeCodePoints)
    ) {
      throw new Error(`Points de code Unicode altérés pour ${item.id}.`);
    }
    for (const sourceId of item.sourceIds) {
      if (!sourceIds.includes(sourceId)) {
        throw new Error(`Source inconnue ${sourceId} pour ${item.id}.`);
      }
      if (!lesson.provenance.sourceIds.includes(sourceId)) {
        throw new Error(
          `Source ${sourceId} absente de la provenance de la leçon ${lesson.lessonId}.`,
        );
      }
    }
  }

  const assertKnownItem = (itemId: string, exerciseId: string): void => {
    assertCanonicalUuid(itemId, `item de ${exerciseId}`);
    if (!itemIds.includes(itemId)) {
      throw new Error(`Item inconnu pour ${exerciseId}.`);
    }
  };

  const assertItemAudio = (
    audioAssetId: string,
    itemId: string,
    exerciseId: string,
  ): void => {
    assertCanonicalUuid(audioAssetId, `audio de ${exerciseId}`);
    if (!assetIds.includes(audioAssetId)) {
      throw new Error(`Audio inconnu pour ${exerciseId}.`);
    }
    const audioEntry = audioManifest.entries.find(
      ({ assetId }) => assetId === audioAssetId,
    );
    if (audioEntry?.itemId !== itemId) {
      throw new Error(`Audio rattache a un autre item pour ${exerciseId}.`);
    }
  };

  const assertChoiceOptions = (
    options: readonly { id: string }[],
    correctOptionId: string,
    exerciseId: string,
  ): void => {
    const optionIds = options.map(({ id }) => id);
    for (const optionId of optionIds) {
      assertCanonicalUuid(optionId, `option de ${exerciseId}`);
    }
    assertCanonicalUuid(correctOptionId, `bonne réponse de ${exerciseId}`);
    assertUnique(optionIds, `options de ${exerciseId}`);
    if (!optionIds.includes(correctOptionId)) {
      throw new Error(`Bonne réponse inconnue pour ${exerciseId}.`);
    }
  };

  for (const exercise of lesson.exercises) {
    assertCanonicalUuid(exercise.id, `exercice ${exercise.id}`);
    switch (exercise.type) {
      case "audio_choice": {
        assertKnownItem(exercise.itemId, exercise.id);
        assertItemAudio(exercise.audioAssetId, exercise.itemId, exercise.id);
        assertChoiceOptions(
          exercise.options,
          exercise.correctOptionId,
          exercise.id,
        );
        break;
      }
      case "association": {
        const pairIds = exercise.pairs.map(({ id }) => id);
        for (const pairId of pairIds) {
          assertCanonicalUuid(pairId, `paire de ${exercise.id}`);
        }
        assertUnique(pairIds, `paires de ${exercise.id}`);
        const pairItemIds = exercise.pairs.map(({ itemId }) => itemId);
        for (const itemId of pairItemIds) {
          assertKnownItem(itemId, exercise.id);
        }
        // Deux paires sur le même item rendraient l'appariement ambigu.
        assertUnique(pairItemIds, `items des paires de ${exercise.id}`);
        break;
      }
      case "word_order": {
        assertKnownItem(exercise.itemId, exercise.id);
        if (exercise.audioAssetId !== null) {
          assertItemAudio(exercise.audioAssetId, exercise.itemId, exercise.id);
        }
        const tokenIds = exercise.tokens.map(({ id }) => id);
        for (const tokenId of tokenIds) {
          assertCanonicalUuid(tokenId, `jeton de ${exercise.id}`);
        }
        assertUnique(tokenIds, `jetons de ${exercise.id}`);
        assertUnique(exercise.correctOrder, `ordre correct de ${exercise.id}`);
        for (const tokenId of exercise.correctOrder) {
          if (!tokenIds.includes(tokenId)) {
            throw new Error(
              `Jeton inconnu dans l'ordre correct de ${exercise.id}.`,
            );
          }
        }
        break;
      }
      case "recall": {
        assertKnownItem(exercise.itemId, exercise.id);
        assertUnique(
          exercise.acceptedAnswers.map(({ value }) => value),
          `réponses acceptées de ${exercise.id}`,
        );
        for (const answer of exercise.acceptedAnswers) {
          if (answer.value !== answer.value.normalize("NFC")) {
            throw new Error(
              `Réponse acceptée non normalisée NFC pour ${exercise.id}.`,
            );
          }
        }
        break;
      }
      case "reading": {
        assertKnownItem(exercise.itemId, exercise.id);
        assertChoiceOptions(
          exercise.options,
          exercise.correctOptionId,
          exercise.id,
        );
        break;
      }
    }
  }

  for (const entry of audioManifest.entries) {
    assertCanonicalUuid(entry.assetId, `asset ${entry.assetId}`);
    assertCanonicalUuid(entry.itemId, `item audio ${entry.assetId}`);
    if (!itemIds.includes(entry.itemId)) {
      throw new Error(`Item inconnu pour l'audio ${entry.assetId}.`);
    }
  }
}
