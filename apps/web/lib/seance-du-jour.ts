import type { LessonLearningProgress } from "@thainaute/sync";

/**
 * Une leçon proposable comme séance du jour.
 *
 * `href` appartient à la leçon parce que la boucle technique et un cours réel
 * ne s'ouvrent pas au même endroit, et qu'une page ne doit pas avoir à le
 * deviner depuis un drapeau.
 */
export interface SeanceProposable {
  readonly versionId: string;
  readonly exerciseId: string;
  readonly title: string;
  readonly objective: string;
  readonly href: string;
  readonly estFixture: boolean;
}

export interface ChoixSeanceEntree {
  /** Dans l'ordre du parcours, la fixture technique en dernier recours. */
  readonly proposables: readonly SeanceProposable[];
  /** Projection locale, une entrée par leçon déjà rencontrée. */
  readonly progression: readonly LessonLearningProgress[];
  /** Version de la leçon dont une expédition est ouverte, s'il y en a une. */
  readonly expeditionOuverte: string | null;
}

/**
 * Quelle séance proposer aujourd'hui.
 *
 * POURQUOI CETTE FONCTION EXISTE
 * ------------------------------
 * `/today` servait la fixture technique et envoyait vers `/learn/demo`. Le
 * chemin par défaut d'un nouvel arrivant, `/` puis `/today`, ne rencontrait
 * donc jamais un cours : les cinq leçons publiées n'étaient atteignables
 * qu'en passant par `/practice`, qui n'avait longtemps aucun lien entrant.
 *
 * La règle est délibérément courte, et elle est ici plutôt que dans le
 * composant pour être éprouvée sans monter React ni IndexedDB.
 *
 * 1. Une expédition ouverte gagne toujours. Reprendre ce qu'on a commencé
 *    passe avant de proposer autre chose, et c'est aussi ce que l'écran
 *    promet quand il affiche « Reprendre l'expédition ».
 * 2. Sinon, la première leçon jamais travaillée, dans l'ordre du parcours.
 * 3. Sinon, celle qui a le plus de révisions dues : tout a été vu une fois,
 *    la séance du jour devient une séance de rappel.
 * 4. Sinon la première, faute de mieux, plutôt qu'un écran vide.
 */
export function choisirSeanceDuJour({
  proposables,
  progression,
  expeditionOuverte,
}: ChoixSeanceEntree): SeanceProposable | null {
  if (proposables.length === 0) return null;

  if (expeditionOuverte !== null) {
    const reprise = proposables.find(
      ({ versionId }) => versionId === expeditionOuverte,
    );
    if (reprise !== undefined) return reprise;
  }

  const parVersion = new Map(
    progression.map((lecon) => [lecon.versionId, lecon] as const),
  );

  const jamaisTravaillee = proposables.find(
    ({ versionId }) => (parVersion.get(versionId)?.reviewedItems ?? 0) === 0,
  );
  if (jamaisTravaillee !== undefined) return jamaisTravaillee;

  const parDues = [...proposables].sort(
    (a, b) =>
      (parVersion.get(b.versionId)?.dueCount ?? 0) -
      (parVersion.get(a.versionId)?.dueCount ?? 0),
  );
  return parDues[0] ?? proposables[0] ?? null;
}
