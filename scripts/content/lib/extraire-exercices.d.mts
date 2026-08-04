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

export interface TirageReading {
  readonly rang: number;
  readonly itemId: string | null;
  /** Presentes quand les options varient d'un tirage a l'autre. */
  readonly libelles?: readonly string[];
  readonly indiceCorrect: number;
}

export interface TirageRecall {
  readonly rang: number;
  readonly itemId: string | null;
  readonly invite: string;
  readonly reponses: readonly { valeur: string; genre: string }[];
}

export interface TirageWordOrder {
  readonly rang: number;
  readonly itemId: string | null;
  readonly jetons: readonly { thai: string; transcription: string | null }[];
  /** Indices, base 0, des jetons de la reponse, dans l'ordre. */
  readonly ordreCorrect: readonly number[];
}

export interface PolitiqueSaisie {
  readonly normalisation: "nfc";
  readonly rognerEspaces: boolean;
  readonly reduireEspaces: boolean;
}

export type BlocExtrait =
  | { readonly ok: false; readonly motif: string }
  | {
      readonly ok: true;
      readonly type: "reading";
      readonly consigne: string;
      readonly feedback: FeedbackExtrait;
      /** Presents quand les options sont partagees par tout le bloc. */
      readonly libelles?: readonly string[];
      readonly tirages: readonly TirageReading[];
    }
  | {
      readonly ok: true;
      readonly type: "recall";
      readonly consigne: string;
      readonly feedback: FeedbackExtrait;
      readonly politique?: PolitiqueSaisie;
      readonly tirages: readonly TirageRecall[];
    }
  | {
      readonly ok: true;
      readonly type: "word_order";
      readonly consigne: string;
      readonly feedback: FeedbackExtrait;
      readonly tirages: readonly TirageWordOrder[];
    }
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
