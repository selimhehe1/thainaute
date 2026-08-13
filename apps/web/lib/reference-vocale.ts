import type { Lesson } from "@thainaute/content/schemas";

import type { ReferenceVocale } from "@/app/learn/demo/local-voice-comparison";

/** Ce qu'on entend quand la leçon ne fait entendre aucun mot. */
export const REFERENCE_TECHNIQUE: ReferenceVocale = {
  src: "/audio/fixture-tone.wav",
  libelle: "signal modèle fictif",
  description:
    "Signal sonore fictif : une note pure de 440 hertz pendant 0,32 seconde, sans parole.",
  captionsSrc: "/captions/fixture-tone.fr.vtt",
};

/**
 * À quoi l'apprenant compare sa voix.
 *
 * POURQUOI CETTE FONCTION EXISTE : la référence valait
 * `/audio/fixture-tone.wav` écrit en dur, y compris dans une leçon publiée.
 * On proposait donc de comparer une prononciation thaïe à une note pure de
 * 440 hertz, ce qui n'apprend rien et laisse croire à une mesure.
 *
 * La référence est le premier mot que la leçon fait entendre. On retombe sur
 * le signal de test uniquement là où c'est la vérité, c'est-à-dire quand la
 * leçon n'a pas de voix : un manifeste vide, ou la fixture technique. Aucune
 * piste de sous-titres n'est inventée pour une voix thaïe ; sa description
 * accessible est construite depuis l'item, qui la porte déjà.
 */
export function referenceVocalePourLecon(
  lesson: Lesson,
  audioSources: Readonly<Record<string, string>> | undefined,
): ReferenceVocale {
  const exercice = lesson.exercises.find(
    (candidat) => candidat.type === "audio_choice",
  );
  if (exercice === undefined || exercice.type !== "audio_choice") {
    return REFERENCE_TECHNIQUE;
  }

  const src = audioSources?.[exercice.audioAssetId];
  const item = lesson.items.find(({ id }) => id === exercice.itemId);
  if (src === undefined || item === undefined) return REFERENCE_TECHNIQUE;

  const libelle = `${item.thaiRaw} · ${item.transcription.value}`;
  return {
    src,
    libelle,
    description: `Voix de référence pour ${libelle}, qui signifie « ${item.translationFr} ».`,
    captionsSrc: null,
  };
}
