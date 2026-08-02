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

interface ToneCurveProps {
  readonly tone: ToneCurveName;
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
  width = 100,
  height = 54,
  strokeWidth,
  className,
  title,
}: ToneCurveProps) {
  return (
    <CurveSvg
      viewBox={TONE_CURVE_VIEW_BOX}
      d={toneCurves[tone]}
      width={width}
      height={height}
      strokeWidth={strokeWidth}
      className={className}
      title={title}
    />
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
