// Contrat typé de l'extraction des pages d'enseignement.

export interface PageEnseignement {
  /** Ordre de lecture, tel que la leçon le numérote. */
  readonly ordre: number;
  readonly titleFr: string;
  /** Prose, paragraphes séparés par une ligne vide. */
  readonly bodyFr: string;
  /** Ce que la page donne à voir, ou `null`. */
  readonly specimen: string | null;
}

/** Tableau vide quand la leçon n'a pas de section d'enseignement. */
export declare function analyserEnseignement(texte: string): PageEnseignement[];
