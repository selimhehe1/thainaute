// Contrat typé du module d'analyse d'autorat.
//
// Le module lui-même reste en JavaScript : il est chargé tel quel par les
// scripts de `scripts/verification/`, qui tournent sous Node sans étape de
// compilation. Ce fichier lui donne un type pour ses consommateurs
// TypeScript, sans imposer de build à ses consommateurs Node.

export interface ItemAutorat {
  readonly ordre: number;
  readonly titre: string;
  readonly thai: string;
  readonly codepoints?: string;
  readonly ipa?: string;
  readonly ton?: string;
  readonly longueur?: string;
  readonly fr?: string;
  readonly transcription?: string;
  readonly registre?: string;
  readonly note_fr?: string;
  readonly sources?: string;
  /** Discriminant de sens, réservé aux homographes. Voir ADR-0042. */
  readonly sens?: string;
}

export interface BlocExercice {
  readonly ordre: number;
  readonly titre: string;
  readonly mecanique: string | null;
  readonly corps: string;
}

export interface MetaLecon {
  readonly identifiant: string | null;
  readonly titreFr: string | null;
  readonly objectifFr: string | null;
  readonly statut: string | null;
  readonly transcription: string | null;
}

export interface LeconAutorat {
  readonly chemin: string;
  readonly meta: MetaLecon;
  readonly items: readonly ItemAutorat[];
  readonly blocsExercice: readonly BlocExercice[];
  readonly texte: string;
}

/** Une graphie extraite du champ `thai`, débarrassée de sa décoration. */
export interface Graphie {
  readonly valeur: string;
  readonly sansGlose: string;
  readonly gloseFr: string | null;
  /** Vrai si la graphie ne contient que du thaï publiable tel quel. */
  readonly propre: boolean;
}

export declare const SEPARATEURS_GRAPHIE: RegExp;

export declare function champ(bloc: string, nom: string): string | undefined;
export declare function sequencePointsDeCode(graphie: string): string;
export declare function graphies(champThai: string): Graphie[];
export declare function analyserItems(texte: string): ItemAutorat[];
export declare function analyserBlocsExercice(texte: string): BlocExercice[];
export declare function analyserMeta(texte: string): MetaLecon;
export declare function analyserLecon(chemin: string): LeconAutorat;
