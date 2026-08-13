import { describe, expect, it } from "vitest";

import { colors } from "../src";

/**
 * Les contrastes que WCAG 2.2 AA exige, mesurés plutôt que supposés.
 *
 * POURQUOI CE TEST EXISTE : le bouton principal du produit portait du texte
 * blanc de 15,5 pixels sur `coral`, soit 3,32:1 là où AA demande 4,5:1. Le
 * défaut existait sur tous les écrans, depuis la première maquette, et
 * personne ne pouvait le voir : la palette était choisie à l'œil et aucune
 * mesure ne la contredisait.
 *
 * Une couleur ne « paraît » pas contrastée. Elle l'est ou elle ne l'est pas,
 * et c'est calculable.
 */
function luminance(hex: string): number {
  const canal = (position: number) => {
    const valeur = Number.parseInt(hex.slice(position, position + 2), 16) / 255;
    return valeur <= 0.03928
      ? valeur / 12.92
      : Math.pow((valeur + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/** Rapport de contraste WCAG entre deux couleurs opaques. */
export function contraste(a: string, b: string): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((haut ?? 0) + 0.05) / ((bas ?? 0) + 0.05);
}

/** Seuil AA pour du texte qui n'est pas « large » au sens de WCAG. */
const AA_TEXTE = 4.5;
/** Seuil AA pour un élément d'interface non textuel, bordure ou icône. */
const AA_NON_TEXTE = 3;

describe("contrastes du système visuel", () => {
  it("le bouton principal porte son texte à niveau AA", () => {
    // 15,5 px en gras ne sont PAS du « texte large » au sens de WCAG, qui
    // demande 18,66 px en gras. Le seuil applicable est donc 4,5:1.
    expect(contraste(colors.paper, colors.coralAction)).toBeGreaterThanOrEqual(
      AA_TEXTE,
    );
    expect(
      contraste(colors.paper, colors.coralActionDeep),
    ).toBeGreaterThanOrEqual(AA_TEXTE);
  });

  it("dit pourquoi le corail de marque ne peut pas porter ce texte", () => {
    // Ce n'est pas un test de régression, c'est la raison d'être de
    // `coralAction`. Si un jour `coral` passait AA, la distinction
    // deviendrait inutile et ce test le dirait.
    expect(contraste(colors.paper, colors.coral)).toBeLessThan(AA_TEXTE);
    expect(contraste(colors.ink, colors.coral)).toBeLessThan(AA_TEXTE);
  });

  it("garde le corail de marque utilisable comme signal non textuel", () => {
    // Traits de plume, pastilles d'itinéraire, anneaux de focus : le seuil
    // applicable est 3:1 contre le fond de page.
    expect(contraste(colors.coral, colors.jasmine)).toBeGreaterThanOrEqual(
      AA_NON_TEXTE,
    );
  });

  it("tient le texte secondaire à niveau AA sur le papier et le fond", () => {
    expect(contraste(colors.inkSoft, colors.paper)).toBeGreaterThanOrEqual(
      AA_TEXTE,
    );
    expect(contraste(colors.inkSoft, colors.jasmine)).toBeGreaterThanOrEqual(
      AA_TEXTE,
    );
  });

  it("tient l'encre principale très au-delà du seuil", () => {
    expect(contraste(colors.ink, colors.jasmine)).toBeGreaterThanOrEqual(7);
  });
});
