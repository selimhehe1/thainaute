// Motif de marque : les cinq contours tonals du thaï tracés à la plume.
// Données pures (viewBox + path SVG) sans JSX ni DOM, pour que le web les
// rende en <svg> inline et que le mobile les rende via react-native-svg.

export const TONE_CURVE_VIEW_BOX = "0 0 120 64";

export type ToneCurveName = "mid" | "low" | "falling" | "high" | "rising";

// Tracés validés sur la maquette approuvée : traits ronds, épaisseur 6
// dans le viewBox de référence.
export const toneCurves: Readonly<Record<ToneCurveName, string>> = {
  mid: "M10,34 C 45,32 80,32 110,33",
  low: "M10,40 C 40,46 78,52 110,55",
  falling: "M10,22 C 35,10 60,16 110,54",
  high: "M10,30 C 45,28 80,20 110,10",
  rising: "M10,44 C 35,56 60,52 110,12",
};

// Déclinaisons de marque hors grille tonale : le grand tracé du hero,
// le souligné des liens tertiaires et le séparateur de sections.
export const brandCurves = {
  hero: { viewBox: "0 0 420 78", d: "M12,60 C 110,76 210,68 408,14" },
  underline: { viewBox: "0 0 100 8", d: "M2,6 C30,7 55,5 98,2" },
  divider: { viewBox: "0 0 180 14", d: "M4,10 C 50,13 90,9 176,3" },
} as const;

// L'itinéraire d'une séance n'est pas une jauge : c'est le contour du ton
// montant, celui que l'apprenant travaille, dont chaque exercice est un point
// de passage. La portion parcourue s'encre le long de la même courbe.

export const EXPEDITION_TRAIL_VIEW_BOX = TONE_CURVE_VIEW_BOX;

export interface ExpeditionWaypoint {
  readonly x: number;
  readonly y: number;
}

type CubicPoints = readonly [
  ExpeditionWaypoint,
  ExpeditionWaypoint,
  ExpeditionWaypoint,
  ExpeditionWaypoint,
];

// Points de contrôle de `toneCurves.rising`, tenus en phase par un test.
const TRAIL_CUBIC: CubicPoints = [
  { x: 10, y: 44 },
  { x: 35, y: 56 },
  { x: 60, y: 52 },
  { x: 110, y: 12 },
];

const round = (value: number): number => Math.round(value * 100) / 100;

function lerp(
  from: ExpeditionWaypoint,
  to: ExpeditionWaypoint,
  ratio: number,
): ExpeditionWaypoint {
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function cubicPath(points: CubicPoints): string {
  const [start, control1, control2, end] = points;
  return `M${round(start.x)},${round(start.y)} C${round(control1.x)},${round(control1.y)} ${round(control2.x)},${round(control2.y)} ${round(end.x)},${round(end.y)}`;
}

/** Subdivision de De Casteljau : la portion de courbe de 0 à `ratio`. */
function splitCubic(points: CubicPoints, ratio: number): CubicPoints {
  const [p0, p1, p2, p3] = points;
  const a = lerp(p0, p1, ratio);
  const b = lerp(p1, p2, ratio);
  const c = lerp(p2, p3, ratio);
  const d = lerp(a, b, ratio);
  const e = lerp(b, c, ratio);
  return [p0, a, d, lerp(d, e, ratio)];
}

/** Étapes réparties le long du contour tonal, jamais sur une ligne droite. */
export function expeditionWaypoints(count: number): ExpeditionWaypoint[] {
  const total = Math.max(1, Math.trunc(count));
  if (total === 1) {
    const [, , , end] = splitCubic(TRAIL_CUBIC, 0.5);
    return [{ x: round(end.x), y: round(end.y) }];
  }
  return Array.from({ length: total }, (_unused, index) => {
    const [, , , point] = splitCubic(TRAIL_CUBIC, index / (total - 1));
    return { x: round(point.x), y: round(point.y) };
  });
}

/** Le contour tonal complet : la route de la séance. */
export function expeditionTrailPath(): string {
  return cubicPath(TRAIL_CUBIC);
}

/**
 * La portion déjà encrée, de la première étape à `completed`. Chaîne vide
 * tant qu'aucune étape n'est franchie.
 */
export function expeditionInkedPath(completed: number, total: number): string {
  const steps = Math.max(1, Math.trunc(total));
  const done = Math.min(Math.max(completed, 0), steps);
  if (done <= 0 || steps < 2) return "";
  const ratio = Math.min(done / (steps - 1), 1);
  return ratio >= 1
    ? cubicPath(TRAIL_CUBIC)
    : cubicPath(splitCubic(TRAIL_CUBIC, ratio));
}
