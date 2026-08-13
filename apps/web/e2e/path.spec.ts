import { expect, test } from "@playwright/test";

import {
  completeExpedition,
  openExpeditionAfterOnboarding,
} from "./expedition-helpers";

test("ouvre le parcours local depuis l’accueil sans inventer de contenu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  const pathLink = page.getByRole("link", { name: "Parcours" });
  const pathLinkBox = await pathLink.boundingBox();
  expect(pathLinkBox?.width).toBeGreaterThanOrEqual(44);
  expect(pathLinkBox?.height).toBeGreaterThanOrEqual(44);
  await pathLink.click();

  await expect(page).toHaveURL(/\/path$/u);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/u,
  );
  await expect(
    page.getByRole("heading", {
      name: "Votre progression, sans faux contenu.",
    }),
  ).toBeVisible();
  await expect(page.getByText("DONNÉE FICTIVE · NON PUBLIABLE")).toBeVisible();
  await expect(
    page.getByRole("progressbar", {
      name: "Progression de l’unité technique",
    }),
  ).toHaveJSProperty("value", 0);
  await expect(
    page.getByRole("link", { name: "Configurer ma session" }),
  ).toHaveAttribute("href", "/today");
  await expect(
    page.getByRole("heading", {
      name: "Les prochaines unités ne sont pas inventées.",
    }),
  ).toBeVisible();
  const todayLinkBox = await page
    .getByRole("link", { name: "Aujourd’hui" })
    .boundingBox();
  expect(todayLinkBox?.width).toBeGreaterThanOrEqual(44);
  expect(todayLinkBox?.height).toBeGreaterThanOrEqual(44);
  // Cette assertion exigeait auparavant que « Compte » soit MASQUÉ, parce
  // que la barre ne se repliait pas et qu'escamoter le lien était le seul
  // moyen connu d'éviter le débordement. C'était une amputation : la page
  // Compte porte la connexion, l'export, la suppression et l'abonnement,
  // et elle n'était joignable depuis aucune page sur un téléphone.
  // La barre se replie désormais, donc le lien reste et l'écran ne
  // déborde toujours pas. Voir `pas-de-debordement.spec.ts`.
  const compte = page.getByRole("link", { name: "Compte", exact: true });
  await expect(compte).toBeVisible();
  const compteBox = await compte.boundingBox();
  expect(compteBox?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
});

test("reflète la clôture durable de la démonstration technique", async ({
  page,
}) => {
  await openExpeditionAfterOnboarding(page);
  await completeExpedition(page);
  await page.goto("/path");

  await expect(page.getByText("Expédition terminée")).toBeVisible();
  await expect(
    page.getByRole("progressbar", {
      name: "Progression de l’unité technique",
    }),
  ).toHaveJSProperty("value", 100);
  await expect(
    page.getByRole("link", { name: "Revoir le récapitulatif" }),
  ).toHaveAttribute("href", "/learn/demo");
});
