/**
 * La maîtrise, dite à quelqu'un qui apprend le thaï.
 *
 * POURQUOI CE MODULE EXISTE : `srs.ts` calcule un score sur mille, et sept
 * écrans le montraient de trois façons. Le lecteur web, Progrès et les
 * quatre écrans mobiles affichaient « 640 ‰ ». Personne ne pense en pour
 * mille, et le signe est assez rare pour qu'on le confonde avec un pour
 * cent mal imprimé. L'écran connecté, lui, divisait déjà par dix sans que
 * rien ne le relie aux autres.
 *
 * Le pour mille reste la mesure interne : le SRS avance par pas de 250, et
 * arrondir plus tôt perdrait un palier. Seul l'affichage change, et il vit
 * ici pour que le web et le mobile ne puissent pas en donner deux versions.
 */
export function maitriseEnPourcent(surMille: number): number {
  return Math.round(surMille / 10);
}

/** Ce que l'écran affiche, unité comprise. */
export function libelleMaitrise(surMille: number): string {
  return `${maitriseEnPourcent(surMille)} %`;
}
