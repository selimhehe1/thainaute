import { describe, expect, it } from "vitest";

import { libelleMaitrise, maitriseEnPourcent } from "../src/maitrise";

describe("maîtrise affichée", () => {
  it("convertit le score interne sur mille en pour cent", () => {
    expect(maitriseEnPourcent(0)).toBe(0);
    expect(maitriseEnPourcent(250)).toBe(25);
    expect(maitriseEnPourcent(1000)).toBe(100);
  });

  it("garde les paliers du SRS distincts après arrondi", () => {
    // Le moteur avance par pas de 250. Un arrondi qui écraserait deux
    // paliers l'un sur l'autre ferait croire à une progression absente.
    const paliers = [0, 250, 500, 750, 1000].map(maitriseEnPourcent);
    expect(new Set(paliers).size).toBe(paliers.length);
  });

  it("rend le seuil de confirmation lisible tel quel", () => {
    // Le moteur SRS confirme une carte à 750 sur mille.
    expect(libelleMaitrise(750)).toBe("75 %");
  });

  it("dit une unité que le monde emploie", () => {
    // Le pour mille était la mesure interne montrée telle quelle. Son signe
    // est assez rare pour être lu comme un pour cent mal imprimé.
    expect(libelleMaitrise(640)).toBe("64 %");
    expect(libelleMaitrise(640)).not.toContain("‰");
  });
});
