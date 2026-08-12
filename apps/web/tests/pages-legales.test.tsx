import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ConditionsPage from "../app/conditions/page";
import ConfidentialitePage from "../app/confidentialite/page";
import CookiesPage from "../app/cookies/page";
import MentionsLegalesPage from "../app/mentions-legales/page";

const PAGES = [
  {
    nom: "mentions-legales",
    titre: "Mentions légales",
    Page: MentionsLegalesPage,
  },
  {
    nom: "conditions",
    titre: "Conditions d’utilisation",
    Page: ConditionsPage,
  },
  {
    nom: "confidentialite",
    titre: "Politique de confidentialité",
    Page: ConfidentialitePage,
  },
  { nom: "cookies", titre: "Cookies et traceurs", Page: CookiesPage },
] as const;

afterEach(cleanup);

describe("pages légales", () => {
  it.each(PAGES)(
    "$nom porte un titre et une date de mise à jour",
    ({ Page, titre }) => {
      render(<Page />);

      expect(
        screen.getByRole("heading", { level: 1, name: titre }),
      ).toBeInTheDocument();
      // Un document légal sans date de mise à jour ne vaut rien pour qui le lit.
      expect(screen.getByText(/Dernière mise à jour/u)).toBeInTheDocument();
    },
  );

  it.each(PAGES)(
    "$nom renvoie vers les trois autres documents",
    ({ Page, titre }) => {
      render(<Page />);

      const autres = PAGES.filter((page) => page.titre !== titre);
      for (const page of autres) {
        expect(
          screen.getAllByRole("link", {
            name: new RegExp(
              page.nom === "confidentialite"
                ? "Confidentialité"
                : (page.titre.split(" ")[0] ?? ""),
              "iu",
            ),
          }).length,
        ).toBeGreaterThan(0);
      }
    },
  );

  /**
   * La garde qui compte : ces pages engagent juridiquement. Tant qu'une
   * mention appartient au fondateur, elle doit rester VISIBLE, jamais
   * remplacée par une identité plausible mais inventée.
   */
  it("marque visiblement ce qui reste à renseigner par l'éditeur", () => {
    render(<MentionsLegalesPage />);

    const marques = screen.getAllByText(/À renseigner par l’éditeur/u);
    expect(marques.length).toBeGreaterThan(0);
  });

  it("n'invente aucune identité d'éditeur", () => {
    const racine = join(import.meta.dirname, "..", "app");
    const suspects = /SIRET|SARL|SASU|RCS \w|siège social à/iu;
    for (const dossier of [
      "mentions-legales",
      "conditions",
      "confidentialite",
    ]) {
      const fichiers = readdirSync(join(racine, dossier));
      for (const fichier of fichiers) {
        const source = readFileSync(join(racine, dossier, fichier), "utf8");
        expect(source).not.toMatch(suspects);
      }
    }
  });
});
