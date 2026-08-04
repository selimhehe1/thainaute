// Contrat typé de la mesure de contour de fréquence fondamentale.
//
// Le module reste en JavaScript : il est lancé directement par Node comme
// outil de vérification, sans étape de compilation.

export interface TrameF0 {
  readonly temps: number;
  /** `null` quand la trame n'est pas voisée. */
  readonly f0: number | null;
  readonly force: number;
  readonly rms: number;
}

export interface ContourF0 {
  readonly trames: readonly TrameF0[];
  readonly frequence: number;
  readonly duree: number;
}

export type AnalyseTon =
  | { readonly verdict: "insuffisant"; readonly nVoisees: number }
  | { readonly verdict: "erreur"; readonly erreur: string }
  | {
      readonly verdict: "mesure";
      readonly hauteurMediane: number;
      readonly debut: number;
      readonly milieu: number;
      readonly fin: number;
      /** Pente début vers fin, en demi-tons. Négative si la voix descend. */
      readonly pente: number;
      readonly amplitude: number;
      /** Description qualitative en français, voir le module. */
      readonly forme: string;
      readonly nVoisees: number;
      readonly dureeVoisee: number;
    };

export declare function contourF0(
  cheminOuTampon: string | Uint8Array,
): ContourF0;
export declare function analyserTon(contour: ContourF0): AnalyseTon;
