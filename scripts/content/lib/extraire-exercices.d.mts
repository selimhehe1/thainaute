// Contrat typé de l'extraction déterministe des blocs d'exercice.

import type { BlocExercice } from "./parse-authoring.mjs";

export interface FeedbackExtrait {
  readonly correctFr: string;
  readonly incorrectFr: string;
  readonly variants: readonly never[];
}

export interface PaireExtraite {
  readonly rang: number;
  readonly itemId: string;
  readonly labelFr: string;
}

export interface TirageExtrait {
  readonly rang: number;
  readonly itemId: string;
  readonly indiceCorrect: number;
}

export type BlocExtrait =
  | { readonly ok: false; readonly motif: string }
  | {
      readonly ok: true;
      readonly type: "association";
      readonly consigne: string;
      readonly feedback: FeedbackExtrait;
      readonly paires: readonly PaireExtraite[];
    }
  | {
      readonly ok: true;
      readonly type: "audio_choice";
      readonly consigne: string;
      readonly feedback: FeedbackExtrait;
      readonly libelles: readonly string[];
      readonly tirages: readonly TirageExtrait[];
    };

/** `resoudreItem` rend l'identifiant de l'item portant cette graphie. */
export declare function extraireBloc(
  bloc: BlocExercice,
  resoudreItem: (graphie: string) => string | null,
): BlocExtrait;
