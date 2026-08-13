import { expect, test, type Page } from "@playwright/test";

import { terminerOnboarding } from "./expedition-helpers";

/**
 * Ce que l'audit axe ne peut pas voir.
 *
 * `apps/web/e2e/accessibilite.spec.ts` couvre le contraste, les noms
 * accessibles et les rôles. Il ne dit rien de deux exigences que le brief
 * pose explicitement, et que seule une vraie page peut mesurer.
 *
 * 1. LA CIBLE TACTILE. Le brief demande 44 × 44 points, ligne 166. WCAG 2.2
 *    se contente de 24 × 24 en AA, donc axe laisse passer tout ce qui tient
 *    entre les deux. Un jeton d'exercice de 30 pixels satisferait la norme
 *    et raterait le doigt.
 *
 * 2. LE CLAVIER. Un élément peut porter un nom accessible parfait et rester
 *    injoignable au clavier, ou joignable sans qu'on voie où l'on est. Rien
 *    ne le vérifiait.
 */
const ECRANS = [
  { nom: "accueil", url: "/", onboarding: false },
  { nom: "pratiquer", url: "/practice", onboarding: false },
  { nom: "parcours", url: "/path", onboarding: false },
  { nom: "aujourd’hui", url: "/today", onboarding: false },
  { nom: "leçon publiée", url: "/learn/lecon/u01-l1a", onboarding: true },
] as const;

/** Le minimum du brief, plus exigeant que les 24 points de WCAG 2.2 AA. */
const CIBLE_MINIMALE = 44;

/**
 * Les commandes réellement cliquables et visibles.
 *
 * On écarte ce qui est masqué, et les entrées d'un groupe radio dont la
 * cible est le libellé qui les enveloppe : c'est lui qu'on touche, pas
 * l'input, qui peut légitimement mesurer quelques pixels.
 */
async function commandesVisibles(page: Page) {
  return page.evaluate((minimum) => {
    const sortie: { balise: string; nom: string; l: number; h: number }[] = [];
    const cibles = document.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [role="button"], input:not([type="radio"]):not([type="hidden"]), textarea, select',
    );
    for (const cible of cibles) {
      const rect = cible.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      const style = window.getComputedStyle(cible);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (rect.width >= minimum && rect.height >= minimum) continue;
      sortie.push({
        balise: cible.tagName.toLowerCase(),
        nom: (cible.textContent ?? "").trim().slice(0, 40),
        l: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
    return sortie;
  }, CIBLE_MINIMALE);
}

for (const ecran of ECRANS) {
  test(`${ecran.nom} : chaque commande atteint 44 points`, async ({ page }) => {
    // La largeur du téléphone est celle où les cibles se resserrent.
    await page.setViewportSize({ width: 390, height: 844 });
    if (ecran.onboarding) await terminerOnboarding(page);
    await page.goto(ecran.url);

    const trop_petites = await commandesVisibles(page);

    expect(
      trop_petites,
      `${ecran.nom} : commandes sous ${CIBLE_MINIMALE} points\n` +
        trop_petites
          .map(({ balise, nom, l, h }) => `    ${balise} « ${nom} » ${l}×${h}`)
          .join("\n"),
    ).toEqual([]);
  });
}

test("le parcours au clavier atteint la leçon et montre où l’on est", async ({
  page,
}) => {
  await page.goto("/practice");

  // On avance à la tabulation jusqu'au premier lien de leçon, sans jamais
  // toucher la souris. Borne haute : au-delà, l'écran demande trop de
  // touches pour être utilisable.
  let atteint = false;
  for (let touche = 0; touche < 40 && !atteint; touche += 1) {
    await page.keyboard.press("Tab");
    atteint = await page.evaluate(() =>
      Boolean(
        document.activeElement
          ?.getAttribute("href")
          ?.startsWith("/learn/lecon/"),
      ),
    );
  }
  expect(atteint, "aucun lien de leçon atteint en 40 tabulations").toBe(true);

  // Le focus doit se VOIR, et pas d'un cheveu. On exige un contour dessiné
  // d'au moins deux pixels : le trait par défaut du navigateur, ou un filet
  // d'un pixel laissé par mégarde, ne suffisent pas à repérer où l'on est
  // sur un fond papier.
  const repere = await page.evaluate(() => {
    const actif = document.activeElement;
    if (actif === null) return null;
    const style = window.getComputedStyle(actif);
    return {
      style: style.outlineStyle,
      largeur: Number.parseFloat(style.outlineWidth),
      couleur: style.outlineColor,
    };
  });

  expect(repere, "aucun élément focalisé").not.toBeNull();
  expect(
    repere?.style,
    `le lien de leçon focalisé n'a pas de contour dessiné : ${JSON.stringify(repere)}`,
  ).not.toBe("none");
  expect(
    repere?.largeur ?? 0,
    `contour trop fin pour être vu : ${JSON.stringify(repere)}`,
  ).toBeGreaterThanOrEqual(2);
});
