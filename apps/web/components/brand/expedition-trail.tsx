import {
  EXPEDITION_TRAIL_VIEW_BOX,
  expeditionInkedPath,
  expeditionTrailPath,
  expeditionWaypoints,
} from "@thainaute/design-tokens";

import styles from "./expedition-trail.module.css";

interface ExpeditionTrailProps {
  readonly total: number;
  readonly completed: number;
}

/**
 * La progression de la séance dessinée sur le contour du ton montant : le
 * même objet que celui qu'on apprend à entendre. La portion parcourue est une
 * subdivision exacte de la courbe, donc juste sans mesurer le DOM.
 */
export function ExpeditionTrail({ total, completed }: ExpeditionTrailProps) {
  const waypoints = expeditionWaypoints(total);
  const inked = expeditionInkedPath(completed, total);

  return (
    <svg
      className={styles.trail}
      viewBox={EXPEDITION_TRAIL_VIEW_BOX}
      fill="none"
      aria-hidden="true"
    >
      <path
        className={styles.route}
        d={expeditionTrailPath()}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {inked !== "" && (
        <path
          className={styles.inked}
          d={inked}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}
      {waypoints.map((waypoint, index) => {
        const done = index < completed;
        const current = index === completed;
        return (
          <circle
            key={`${waypoint.x}-${index}`}
            className={
              done
                ? styles.stepDone
                : current
                  ? styles.stepCurrent
                  : styles.stepAhead
            }
            cx={waypoint.x}
            cy={waypoint.y}
            r={current ? 5 : done ? 3.6 : 2.6}
            strokeWidth={current ? 2.5 : undefined}
          />
        );
      })}
    </svg>
  );
}
