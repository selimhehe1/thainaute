import type { ContentBundle } from "./schemas";
import { targetTextOf } from "./target-text";

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

const PUBLIC_METADATA_MARKDOWN_PATTERN =
  /(?:\*\*|__|`|!\[[^\]]*\]\(|\[[^\]]+\]\(|^#{1,6}\s|^\s*[-+*]\s)/mu;
const INTERNAL_METADATA_PATTERN =
  /(?:titre de travail|note (?:interne|éditoriale)|contre-audit|finding\s|tmp-[a-z0-9-]+)/iu;

function assertPublicMetadata(
  value: string,
  label: string,
  maximumLength: number,
): void {
  if (value !== value.trim() || value.length === 0) {
    throw new Error(`${label}: texte public vide ou entouré d'espaces.`);
  }
  if (value.length > maximumLength) {
    throw new Error(
      `${label}: ${value.length} caractères, maximum ${maximumLength}.`,
    );
  }
  if (PUBLIC_METADATA_MARKDOWN_PATTERN.test(value)) {
    throw new Error(
      `${label}: Markdown interdit dans une métadonnée publique.`,
    );
  }
  if (INTERNAL_METADATA_PATTERN.test(value)) {
    throw new Error(`${label}: note éditoriale interne détectée.`);
  }
}

/** Vérifie la structure éditoriale, indépendamment de toute dette audio. */
export function validateBundleStructureMetadata(bundle: ContentBundle): void {
  const { lesson, sources } = bundle;
  const itemIds = lesson.items.map(({ id }) => id);
  const exerciseIds = lesson.exercises.map(({ id }) => id);
  const sourceIds = sources.map(({ sourceId }) => sourceId);

  assertUnique(itemIds, "items");
  assertUnique(exerciseIds, "exercises");
  assertUnique(sourceIds, "sources");
  assertUnique(lesson.provenance.sourceIds, "provenance de la leçon");
  assertUnique(
    lesson.provenance.generationActors.map(({ actorId }) => actorId),
    "acteurs de génération",
  );

  assertCanonicalUuid(lesson.lessonId, "lessonId");
  assertCanonicalUuid(lesson.versionId, "versionId");
  assertPublicMetadata(lesson.titleFr, "titleFr", 160);
  if (lesson.visibility === "public" || lesson.workflowStatus === "published") {
    assertPublicMetadata(lesson.objectiveFr, "objectiveFr", 400);
  }

  for (const sourceId of lesson.provenance.sourceIds) {
    if (!sourceIds.includes(sourceId)) {
      throw new Error(`Source de provenance inconnue ${sourceId}.`);
    }
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

  // Une option peut désormais porter du thaï. Elle passe donc la même porte
  // NFC que les items : deux graphies visuellement identiques mais encodées
  // différemment rendraient une comparaison de réponse imprévisible.
  const assertOptionTarget = (
    options: readonly {
      id: string;
      thaiRaw: string | null;
      targetText?: string | null | undefined;
    }[],
    exerciseId: string,
  ): void => {
    for (const option of options) {
      const targetText = targetTextOf(option);
      if (targetText === null) continue;
      if (targetText !== targetText.normalize("NFC")) {
        throw new Error(
          `Option non normalisée NFC pour ${exerciseId} (${option.id}).`,
        );
      }
    }
  };

  // Un retour ciblé qui désigne une option inexistante ne s'afficherait
  // jamais : le contenu serait écrit, payé en relecture, et muet.
  const assertFeedbackVariants = (
    feedback: {
      readonly variants: readonly { selectedOptionId: string | null }[];
    },
    optionIds: readonly string[],
    exerciseId: string,
  ): void => {
    for (const variant of feedback.variants) {
      if (variant.selectedOptionId === null) continue;
      if (!optionIds.includes(variant.selectedOptionId)) {
        throw new Error(
          `Retour ciblé sur une option inconnue pour ${exerciseId}.`,
        );
      }
    }
  };

  for (const exercise of lesson.exercises) {
    assertCanonicalUuid(exercise.id, `exercice ${exercise.id}`);
    switch (exercise.type) {
      case "audio_choice": {
        assertKnownItem(exercise.itemId, exercise.id);
        assertChoiceOptions(
          exercise.options,
          exercise.correctOptionId,
          exercise.id,
        );
        assertOptionTarget(exercise.options, exercise.id);
        assertFeedbackVariants(
          exercise.feedback,
          exercise.options.map(({ id }) => id),
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
        // Sans options, aucun retour ne peut cibler une option.
        assertFeedbackVariants(exercise.feedback, [], exercise.id);
        break;
      }
      case "word_order": {
        assertKnownItem(exercise.itemId, exercise.id);
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
        assertFeedbackVariants(exercise.feedback, [], exercise.id);
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
        assertFeedbackVariants(exercise.feedback, [], exercise.id);
        break;
      }
      case "reading": {
        assertKnownItem(exercise.itemId, exercise.id);
        assertChoiceOptions(
          exercise.options,
          exercise.correctOptionId,
          exercise.id,
        );
        assertOptionTarget(exercise.options, exercise.id);
        assertFeedbackVariants(
          exercise.feedback,
          exercise.options.map(({ id }) => id),
          exercise.id,
        );
        break;
      }
    }
  }

  // Cohérence des viviers. Un vivier qui annonce douze tirages et n'en
  // porte que huit ferait mentir son propre seuil de réussite, et une
  // séance en tirerait moins que prévu sans que personne le voie.
  const declaredPools = new Map(
    lesson.pools.map((pool) => [pool.poolId, pool]),
  );
  assertUnique(
    lesson.pools.map(({ poolId }) => poolId),
    "viviers de la leçon",
  );

  const drawsByPool = new Map<string, string[]>();
  for (const exercise of lesson.exercises) {
    if (exercise.poolId === null) {
      if (exercise.drawIndex !== null) {
        throw new Error(`Tirage sans vivier pour ${exercise.id}.`);
      }
      continue;
    }
    const pool = declaredPools.get(exercise.poolId);
    if (pool === undefined) {
      throw new Error(`Vivier inconnu ${exercise.poolId} pour ${exercise.id}.`);
    }
    if (pool.mechanic !== exercise.type) {
      throw new Error(
        `Le vivier ${exercise.poolId} annonce ${pool.mechanic} mais ${exercise.id} est ${exercise.type}.`,
      );
    }
    if (exercise.drawIndex === null) {
      throw new Error(`Tirage non numéroté pour ${exercise.id}.`);
    }
    const draws = drawsByPool.get(exercise.poolId) ?? [];
    draws.push(String(exercise.drawIndex));
    drawsByPool.set(exercise.poolId, draws);
  }

  for (const pool of lesson.pools) {
    const draws = drawsByPool.get(pool.poolId) ?? [];
    assertUnique(draws, `tirages du vivier ${pool.poolId}`);
    if (draws.length !== pool.drawCount) {
      throw new Error(
        `Le vivier ${pool.poolId} annonce ${pool.drawCount} tirages mais en porte ${draws.length}.`,
      );
    }
  }
}

/** Vérifie uniquement les identités et références audio du paquet. */
export function validateBundleAudioReferences(bundle: ContentBundle): void {
  const { lesson, audioManifest } = bundle;
  const itemIds = lesson.items.map(({ id }) => id);
  const assetIds = audioManifest.entries.map(({ assetId }) => assetId);

  assertUnique(assetIds, "audio");
  assertCanonicalUuid(lesson.audioManifestId, "audioManifestId");
  assertCanonicalUuid(audioManifest.manifestId, "manifestId");
  assertCanonicalUuid(audioManifest.lessonVersionId, "lessonVersionId audio");

  if (audioManifest.manifestId !== lesson.audioManifestId) {
    throw new Error("Le manifeste audio ne correspond pas à la leçon.");
  }
  if (audioManifest.lessonVersionId !== lesson.versionId) {
    throw new Error("Le manifeste audio cible une autre version de leçon.");
  }

  for (const entry of audioManifest.entries) {
    assertCanonicalUuid(entry.assetId, `asset ${entry.assetId}`);
    assertCanonicalUuid(entry.itemId, `item audio ${entry.assetId}`);
    if (!itemIds.includes(entry.itemId)) {
      throw new Error(`Item inconnu pour l'audio ${entry.assetId}.`);
    }
  }

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

  for (const exercise of lesson.exercises) {
    if (exercise.type === "audio_choice") {
      assertItemAudio(exercise.audioAssetId, exercise.itemId, exercise.id);
    } else if (
      exercise.type === "word_order" &&
      exercise.audioAssetId !== null
    ) {
      assertItemAudio(exercise.audioAssetId, exercise.itemId, exercise.id);
    }
  }
}

/** Vérifie tous les liens de métadonnées sans lire le système de fichiers. */
export function validateBundleMetadata(bundle: ContentBundle): void {
  validateBundleStructureMetadata(bundle);
  validateBundleAudioReferences(bundle);
}
