/**
 * Compatibilité entre le champ historique du pack thaï et le champ commun
 * destiné aux futures langues cibles.
 */
export interface TargetTextCarrier {
  readonly targetText?: string | null | undefined;
  readonly thaiRaw?: string | null | undefined;
}

export function targetTextOf(value: TargetTextCarrier): string | null {
  if (value.targetText !== undefined && value.targetText !== null) {
    return value.targetText;
  }
  return value.thaiRaw ?? null;
}
