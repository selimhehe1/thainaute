import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Les tirets que l'ADR-0022 bannit de toute chaîne visible.
 *
 * POURQUOI CE TEST EXISTE : le fondateur a banni le tiret cadratin « — » et
 * le demi-cadratin « – » de l'interface, des contenus et des documents
 * destinés aux utilisateurs, parce qu'ils signent une écriture générée.
 * La règle était écrite dans un ADR et vérifiée à l'œil.
 *
 * Elle avait déjà échoué là où ça se voit le plus : `seoTitleFr` portait
 * « Thaïnaute — Le thaï, pensé en français », soit le titre de l'onglet et
 * la ligne affichée par les moteurs de recherche.
 *
 * CE QUE CE TEST NE COUVRE PAS : les commentaires de code et les documents
 * internes, où ces tirets ne gênent personne. Il lit les fichiers dont les
 * chaînes atteignent un écran.
 */
const TIRETS_BANNIS = /[—–]/u;

const RACINE = join(process.cwd(), "..", "..");

/** Fichiers dont chaque chaîne peut finir sous les yeux de quelqu'un. */
const SURFACES = [
  "packages/content/src/language-packs.ts",
  "apps/mobile/lib/lesson-config.ts",
  "apps/mobile/lib/embedded-mechanics-expedition-config.ts",
  "apps/mobile/lib/embedded-audio-expedition-config.ts",
  "apps/mobile/lib/mobile-lesson-expedition-config.ts",
  "apps/mobile/lib/unpublished-content-screen.tsx",
];

/** Les lignes qui portent un tiret banni hors commentaire. */
async function lignesFautives(relatif: string): Promise<string[]> {
  const source = await readFile(join(RACINE, relatif), "utf8");
  return source
    .split("\n")
    .filter((ligne) => TIRETS_BANNIS.test(ligne))
    .map((ligne) => ligne.trim())
    .filter((ligne) => !ligne.startsWith("*") && !ligne.startsWith("//"));
}

describe("tirets bannis par l'ADR-0022", () => {
  it.each(SURFACES)("%s n'en porte aucun", async (relatif) => {
    expect(
      await lignesFautives(relatif),
      `${relatif} : remplacer par deux-points, virgule, point, parenthèses ou « · »`,
    ).toEqual([]);
  });

  it("attraperait un tiret réintroduit", async () => {
    // Le test ne prouve rien si son détecteur est faux.
    expect(TIRETS_BANNIS.test("Thaïnaute — Le thaï")).toBe(true);
    expect(TIRETS_BANNIS.test("Thaïnaute – Le thaï")).toBe(true);
    expect(TIRETS_BANNIS.test("Thaïnaute · Le thaï")).toBe(false);
    expect(TIRETS_BANNIS.test("porte-monnaie")).toBe(false);
  });
});
