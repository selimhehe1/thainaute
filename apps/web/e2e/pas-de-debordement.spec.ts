import { expect, test, type Page } from "@playwright/test";

import { terminerOnboarding } from "./expedition-helpers";

/**
 * Rien ne doit sortir de l'écran sur le côté.
 *
 * POURQUOI CE TEST EXISTE : la barre de navigation ne se repliait jamais.
 * Elle mesurait 533 px de large sur Aujourd'hui et 457 sur Pratiquer et
 * Progrès, quelle que soit la fenêtre. Elle sortait donc de l'écran de
 * 143 px et 67 px à 390 px de large, et davantage en dessous, sur toutes
 * les largeurs de téléphone jusqu'à 430 px comprises.
 *
 * La conséquence n'était pas cosmétique. Le lien vers le compte était
 * masqué sur l'accueil et sur Parcours par une classe `.optional` prévue
 * pour ça, hors champ sur les trois écrans applicatifs, et absent du
 * lecteur de leçon : sur un téléphone, la connexion, l'export RGPD, la
 * suppression du compte et l'abonnement n'étaient joignables depuis
 * aucune page.
 *
 * AUCUNE DES AUTRES PORTES NE POUVAIT LE VOIR. Axe ne mesure pas le
 * débordement. `cibles-et-clavier.spec.ts` mesure la TAILLE des commandes,
 * pas leur POSITION : un lien de 76 × 44 px posé à 200 px hors de l'écran
 * passe son contrôle sans difficulté.
 */
const ECRANS = [
  { nom: "accueil", url: "/", onboarding: false },
  { nom: "aujourd’hui", url: "/today", onboarding: false },
  { nom: "pratiquer", url: "/practice", onboarding: false },
  { nom: "progrès", url: "/progress", onboarding: false },
  { nom: "parcours", url: "/path", onboarding: false },
  { nom: "compte", url: "/account", onboarding: false },
  { nom: "mentions légales", url: "/mentions-legales", onboarding: false },
  { nom: "leçon publiée", url: "/learn/lecon/u01-l1a", onboarding: true },
] as const;

/**
 * 320 px est le plancher réaliste (iPhone SE de première génération),
 * 390 la référence du brief, 430 le plus grand téléphone courant, et
 * 1440 le bureau. Le défaut d'origine touchait les quatre largeurs de
 * téléphone : le mesurer à 390 seulement l'aurait sous-estimé.
 */
const LARGEURS = [320, 390, 430, 1440] as const;

/** Ce qui dépasse, et de combien. Un écart nu ne se corrige pas. */
async function coupables(page: Page) {
  return page.evaluate(() => {
    const debord = document.documentElement.scrollWidth - window.innerWidth;
    if (debord <= 0) return { debord: 0, elements: [] };

    const elements: { balise: string; classe: string; droite: number }[] = [];
    for (const element of document.querySelectorAll("*")) {
      const rect = element.getBoundingClientRect();
      if (rect.right <= window.innerWidth + 0.5) continue;
      elements.push({
        balise: element.tagName.toLowerCase(),
        classe: String(element.className).slice(0, 60),
        droite: Math.round(rect.right),
      });
    }
    return { debord, elements: elements.slice(0, 5) };
  });
}

for (const largeur of LARGEURS) {
  for (const ecran of ECRANS) {
    test(`${ecran.nom} ne déborde pas à ${largeur} px`, async ({ page }) => {
      await page.setViewportSize({ width: largeur, height: 844 });
      if (ecran.onboarding) await terminerOnboarding(page);
      await page.goto(ecran.url);

      const { debord, elements } = await coupables(page);

      expect(
        debord,
        `${ecran.nom} déborde de ${debord} px à ${largeur} px de large\n` +
          elements
            .map((e) => `    ${e.balise}.${e.classe} atteint x=${e.droite}`)
            .join("\n"),
      ).toBe(0);
    });
  }
}

/**
 * Le compte porte la connexion, l'export, la suppression et l'abonnement.
 * Une page qui prétend y mener doit le faire pour de bon : ni masqué, ni
 * hors champ, ni sous la taille de cible du brief.
 */
test("le lien vers le compte est réellement atteignable sur téléphone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });

  const porteurs = ["/", "/today", "/practice", "/progress", "/path"];
  const fautifs: string[] = [];

  for (const url of porteurs) {
    await page.goto(url);
    const etat = await page.evaluate(() => {
      const lien = document.querySelector('a[href="/account"]');
      if (lien === null) return "absent";
      const rect = lien.getBoundingClientRect();
      const style = window.getComputedStyle(lien);
      if (style.display === "none" || style.visibility === "hidden") {
        return "masqué";
      }
      if (rect.right > window.innerWidth + 0.5) {
        return `hors champ (atteint x=${Math.round(rect.right)})`;
      }
      if (rect.height < 44) {
        return `cible trop courte (${Math.round(rect.height)} px)`;
      }
      return "atteignable";
    });
    if (etat !== "atteignable") fautifs.push(`${url} : ${etat}`);
  }

  expect(
    fautifs,
    `le compte n'est pas joignable depuis :\n    ${fautifs.join("\n    ")}`,
  ).toEqual([]);
});
