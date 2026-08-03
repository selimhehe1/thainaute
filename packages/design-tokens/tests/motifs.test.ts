import { describe, expect, it } from "vitest";

import {
  expeditionInkedPath,
  expeditionTrailPath,
  expeditionWaypoints,
  toneCurves,
} from "../src";

describe("itinéraire d'expédition", () => {
  it("emprunte exactement le contour du ton montant", () => {
    // La route de la séance EST la courbe tonale : si l'une bouge, l'autre
    // doit bouger avec elle, sinon le motif signature ment.
    const strip = (path: string): string => path.replaceAll(" ", "");
    expect(strip(expeditionTrailPath())).toBe(strip(toneCurves.rising));
  });

  it("place les étapes sur la courbe, extrémités comprises", () => {
    const points = expeditionWaypoints(5);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ x: 10, y: 44 });
    expect(points[4]).toEqual({ x: 110, y: 12 });
    // Le ton montant descend avant de remonter : on vérifie la marche en
    // avant et le fait que l'arrivée culmine, pas une montée monotone.
    for (let index = 1; index < points.length; index += 1) {
      expect(points[index]!.x).toBeGreaterThan(points[index - 1]!.x);
    }
    const highest = Math.min(...points.map((point) => point.y));
    expect(points.at(-1)!.y).toBe(highest);
  });

  it("n'encre rien tant qu'aucune étape n'est franchie", () => {
    expect(expeditionInkedPath(0, 5)).toBe("");
    expect(expeditionInkedPath(-2, 5)).toBe("");
  });

  it("encre jusqu'à l'étape franchie et pas au-delà", () => {
    const half = expeditionInkedPath(2, 5);
    const full = expeditionInkedPath(5, 5);
    expect(half).not.toBe("");
    expect(half).not.toBe(full);
    // Encrer tout le plan revient au contour complet.
    expect(full).toBe(expeditionTrailPath());
  });

  it("supporte un plan à une seule étape", () => {
    expect(expeditionWaypoints(1)).toHaveLength(1);
    expect(expeditionInkedPath(1, 1)).toBe("");
  });
});
