// Contrat typé du module de découpage phonétique thaï. Voir le commentaire
// d'en-tête de `parse-authoring.d.mts` pour la raison de ce doublage.

export type TonThai = "mid" | "low" | "falling" | "high" | "rising";

export interface SyllabeDecoupee {
  /** Syllabe telle qu'écrite, barres de ton comprises. */
  readonly ipa: string;
  readonly initial: string;
  readonly vowel: string;
  /** « aucune » pour une syllabe ouverte, jamais une chaîne vide. */
  readonly final: string;
  /** `null` si le contour n'est pas l'un des cinq tons canoniques. */
  readonly tone: TonThai | null;
  readonly vowelLength: "short" | "long";
}

/**
 * Familles de champ `ipa` relevées dans le corpus.
 *
 * `variante` et `compose` demandent un arbitrage éditorial : le compilateur
 * les signale au lieu de trancher.
 */
export type FamilleIpa =
  "absent" | "unique" | "separees" | "lettre" | "variante" | "compose";

export interface FormesIpa {
  readonly famille: FamilleIpa;
  readonly formes: readonly string[];
}

export declare function tonDepuisContour(barres: string): TonThai | null;
export declare function decouperSyllabe(
  syllabe: string,
): SyllabeDecoupee | null;
export declare function decouperItem(
  champIpa: string | undefined,
): SyllabeDecoupee[] | null;
export declare function formesDuChamp(champIpa: string | undefined): FormesIpa;
