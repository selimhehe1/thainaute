import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { terminerOnboarding } from "./expedition-helpers";

/**
 * La porte d'accessibilité que le brief exige et qui n'existait pas.
 *
 * `docs/PROJECT_BRIEF.md` pose WCAG 2.2 AA sur le web, et `AGENTS.md` en
 * fait un invariant. Rien ne le vérifiait : l'accessibilité était soignée
 * à la main, écran par écran, sans filet.
 *
 * CE QUE CE TEST PROUVE, ET CE QU'IL NE PROUVE PAS
 * ------------------------------------------------
 * axe détecte environ un tiers des critères WCAG. Il attrape le contraste,
 * les noms accessibles, l'ordre des titres, les rôles et les libellés de
 * formulaire. Il ne dit rien de la pertinence d'un texte alternatif, de la
 * logique du parcours au clavier, ni de la lisibilité des signes thaïs.
 * Un test vert n'est donc pas une conformité ; un test rouge est en
 * revanche toujours un vrai défaut.
 *
 * Les trois largeurs sont celles du brief : 390 pour un téléphone, 768
 * pour une tablette, 1440 pour un écran. Une règle de contraste ou de
 * cible tactile peut ne casser qu'à une seule d'entre elles.
 */
const LARGEURS = [
  { nom: "téléphone", width: 390, height: 844 },
  { nom: "tablette", width: 768, height: 1024 },
  { nom: "écran", width: 1440, height: 900 },
] as const;

/** Les écrans qu'une personne traverse réellement. */
const ECRANS = [
  { nom: "accueil", url: "/", onboarding: false },
  { nom: "pratiquer", url: "/practice", onboarding: false },
  { nom: "parcours", url: "/path", onboarding: false },
  { nom: "progrès", url: "/progress", onboarding: false },
  { nom: "aujourd’hui", url: "/today", onboarding: false },
  { nom: "leçon publiée", url: "/learn/lecon/u01-l1a", onboarding: true },
  { nom: "confidentialité", url: "/privacy", onboarding: false },
  { nom: "mentions légales", url: "/mentions-legales", onboarding: false },
] as const;

async function analyser(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
}

/** Un message qui nomme la règle, la cible et la façon de la retrouver. */
function decrire(
  violations: Awaited<ReturnType<typeof analyser>>["violations"],
) {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}) : ${violation.help}\n` +
        violation.nodes
          .slice(0, 3)
          .map((node) => `    ${node.target.join(" ")}`)
          .join("\n"),
    )
    .join("\n");
}

for (const largeur of LARGEURS) {
  test.describe(`accessibilité · ${largeur.nom} (${largeur.width} px)`, () => {
    for (const ecran of ECRANS) {
      test(`${ecran.nom} ne porte aucune violation WCAG détectable`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: largeur.width,
          height: largeur.height,
        });
        if (ecran.onboarding) await terminerOnboarding(page);
        await page.goto(ecran.url);

        const { violations } = await analyser(page);

        expect(
          violations,
          `${ecran.nom} à ${largeur.width} px :\n${decrire(violations)}`,
        ).toEqual([]);
      });
    }
  });
}
