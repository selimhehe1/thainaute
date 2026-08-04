import {
  TONE_CURVE_VIEW_BOX,
  brandCurves,
  toneCurves,
  type ToneCurveName,
} from "@thainaute/design-tokens";

interface CurveSvgProps {
  readonly viewBox: string;
  readonly d: string;
  readonly width: number;
  readonly height: number;
  readonly strokeWidth?: number | undefined;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
}

function CurveSvg({
  viewBox,
  d,
  width,
  height,
  strokeWidth = 6,
  className,
  title,
}: CurveSvgProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      aria-hidden={title === undefined ? true : undefined}
      role={title === undefined ? undefined : "img"}
    >
      {title === undefined ? null : <title>{title}</title>}
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Point de depart d'un trace, lu dans sa commande « M x,y ».
 *
 * Derive du chemin plutot que recopie a cote : si un contour est retouche,
 * le repere de depart suit, au lieu de mentir silencieusement.
 */
function startOf(d: string): { x: number; y: number } | null {
  const trouve = /^M\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/u.exec(d.trim());
  if (trouve === null) return null;
  return { x: Number(trouve[1]), y: Number(trouve[2]) };
}

/**
 * Trois hauteurs de reference, dans le cadre « 0 0 120 64 ».
 *
 * Elles existent pour une raison precise : le ton HAUT et le ton MONTANT
 * finissent tous deux en haut, et se ressemblent donc si l'on ne regarde
 * que la fin. Ce qui les separe est leur DEPART, le montant partant d'en
 * bas. Sans repere, l'oeil ne peut pas lire cette difference, et
 * l'exercice devient un piege au lieu d'un apprentissage.
 */
const PITCH_LINES = [12, 33, 55] as const;

interface ToneCurveProps {
  readonly tone: ToneCurveName;
  /**
   * Affiche l'echelle de hauteur et le point de depart. A activer quand la
   * courbe PORTE le sens, par exemple quand elle est la reponse d'un
   * exercice, et non quand elle decore.
   */
  readonly withScale?: boolean | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly strokeWidth?: number | undefined;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
}

/** Une des cinq courbes tonales. Décorative par défaut (aria-hidden) :
 * fournir `title` uniquement quand la courbe est le seul porteur de sens. */
export function ToneCurve({
  tone,
  withScale = false,
  width = 100,
  height = 54,
  strokeWidth,
  className,
  title,
}: ToneCurveProps) {
  const d = toneCurves[tone];
  if (!withScale) {
    return (
      <CurveSvg
        viewBox={TONE_CURVE_VIEW_BOX}
        d={d}
        width={width}
        height={height}
        strokeWidth={strokeWidth}
        className={className}
        title={title}
      />
    );
  }

  const debut = startOf(d);
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={TONE_CURVE_VIEW_BOX}
      fill="none"
      aria-hidden={title === undefined ? true : undefined}
      role={title === undefined ? undefined : "img"}
    >
      {title === undefined ? null : <title>{title}</title>}
      {PITCH_LINES.map((y) => (
        <line
          key={y}
          x1={4}
          y1={y}
          x2={116}
          y2={y}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.18}
        />
      ))}
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth ?? 6}
        strokeLinecap="round"
      />
      {/* Le depart de la voix, marque : c'est lui qui separe le haut du
          montant, pas l'arrivee. */}
      {debut !== null && (
        <circle cx={debut.x} cy={debut.y} r={5} fill="currentColor" />
      )}
    </svg>
  );
}

interface BrandCurveProps {
  readonly curve: keyof typeof brandCurves;
  readonly width: number;
  readonly height: number;
  readonly strokeWidth?: number | undefined;
  readonly className?: string | undefined;
}

/** Déclinaisons de marque (hero, souligné, séparateur), toujours décoratives. */
export function BrandCurve({
  curve,
  width,
  height,
  strokeWidth,
  className,
}: BrandCurveProps) {
  const { viewBox, d } = brandCurves[curve];
  return (
    <CurveSvg
      viewBox={viewBox}
      d={d}
      width={width}
      height={height}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
