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
