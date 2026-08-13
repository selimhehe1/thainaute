// Source de vérité du système visuel « Carnet de terrain » (ADR-0022).
// TS pur sans DOM : consommé par le web (via tokens.css généré) et, à terme,
// par le mobile React Native (import direct de ce module).

export const colors = {
  jasmine: "#fbfaf7",
  ink: "#283450",
  coral: "#e9615c",
  jade: "#43a283",
  saffron: "#f1b84b",
  mist: "#eef1f4",
  sky: "#5b8ee8",
  skyInk: "#315b9c",
  skyPale: "#edf3ff",
  paper: "#ffffff",
  inkSoft: "#56607a",
  coralDeep: "#cf4a45",
  coralPale: "#fbeae8",
  /**
   * Le corail QUI PORTE DU TEXTE.
   *
   * `coral` est la couleur de marque : traits de plume, courbes tonales,
   * pastilles, anneaux de focus. Elle ne porte jamais de texte, et c'est
   * heureux : blanc sur `coral` donne 3,32:1, encre sur `coral` 3,73:1, et
   * WCAG 2.2 AA exige 4,5:1 pour du texte de 15,5 px, même en gras. Le
   * bouton principal du produit échouait donc sur tous les écrans.
   *
   * `coralAction` tient 4,85:1 avec `paper`, `coralActionDeep` 5,64:1 pour
   * le survol. Mesuré, pas estimé : voir `tests/contraste.test.ts`.
   */
  coralAction: "#c74440",
  coralActionDeep: "#b93a36",
  jadeInk: "#236b58",
  jadePale: "#e6f3ee",
  saffronHalo: "rgba(241, 184, 75, 0.16)",
  line: "#e7e4da",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const radii = { sm: 8, md: 16, lg: 28, pill: 999 } as const;

export const minimumTouchTarget = 44;

export const fontFamilies = {
  sans: '"Manrope Variable", "Segoe UI", system-ui, sans-serif',
  thai: '"Noto Sans Thai", sans-serif',
  serifAccent: 'Georgia, "Times New Roman", serif',
} as const;

// Poids cibles normalisés : les valeurs historiques 750 et 850 se replient
// sur bold et display (l'axe variable de Manrope s'arrête à 800).
export const fontWeights = {
  body: 430,
  medium: 500,
  semibold: 650,
  bold: 700,
  display: 800,
} as const;

// Le thaï est toujours rendu plus grand que le latin environnant.
export const thaiScale = 1.18;

export const motionDurations = {
  fast: 120,
  base: 200,
  slow: 320,
  trace: 900,
} as const;

export const motionEasings = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const shadows = {
  card: "0 1px 2px rgba(40, 52, 80, 0.05), 0 10px 28px rgba(40, 52, 80, 0.07)",
  lifted: "0 3px 0 rgba(40, 52, 80, 0.10), 0 12px 24px rgba(40, 52, 80, 0.08)",
} as const;

export {
  toneCurves,
  brandCurves,
  expeditionInkedPath,
  expeditionTrailPath,
  expeditionWaypoints,
  EXPEDITION_TRAIL_VIEW_BOX,
  TONE_CURVE_VIEW_BOX,
  type ExpeditionWaypoint,
  type ToneCurveName,
} from "./motifs";
