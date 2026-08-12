import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PrimaryNavigation } from "../components/layout/primary-navigation";

const APP = join(import.meta.dirname, "..", "app");
const DESTINATIONS = ["/today", "/practice", "/progress"] as const;

afterEach(cleanup);

describe("navigation principale", () => {
  it.each(DESTINATIONS)("marque %s comme page courante", (active) => {
    render(<PrimaryNavigation active={active} />);

    const courant = screen
      .getAllByRole("link")
      .filter((lien) => lien.getAttribute("aria-current") === "page");
    // Exactement un onglet courant : deux seraient un mensonge, zéro une
    // perte de repère.
    expect(courant).toHaveLength(1);
    expect(courant[0]?.getAttribute("href")).toBe(active);
  });

  it("mène toujours aux trois destinations", () => {
    render(<PrimaryNavigation active="/today" />);

    expect(
      screen.getAllByRole("link").map((lien) => lien.getAttribute("href")),
    ).toStrictEqual([...DESTINATIONS]);
  });

  /**
   * La régression qui a motivé ce fichier : `/practice` et `/progress` ont
   * existé pendant une tranche entière sans qu'aucun lien n'y mène. Un écran
   * qu'on ne peut atteindre qu'en tapant son adresse n'existe pas.
   */
  it("laisse chaque écran d'apprentissage atteignable par un lien", () => {
    const sources = readdirSync(APP, { recursive: true, withFileTypes: true })
      .filter((entree) => entree.isFile() && entree.name.endsWith(".tsx"))
      .map((entree) =>
        readFileSync(join(entree.parentPath, entree.name), "utf8"),
      )
      .join("\n");

    for (const destination of DESTINATIONS) {
      const depuisUnePage = sources.includes(`href="${destination}"`);
      const depuisLaBarre = sources.includes("PrimaryNavigation");
      expect(depuisUnePage || depuisLaBarre).toBe(true);
    }
    // La barre elle-même doit être posée sur les trois écrans.
    for (const dossier of ["today", "practice", "progress"]) {
      const page = readFileSync(join(APP, dossier, "page.tsx"), "utf8");
      expect(page).toContain("PrimaryNavigation");
    }
  });
});
