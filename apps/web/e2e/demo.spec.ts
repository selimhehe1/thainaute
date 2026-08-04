import { expect, test } from "@playwright/test";

import {
  completeExpedition,
  openMecaniquesFixture,
} from "./expedition-helpers";

test("termine l'expédition des cinq mécaniques", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });
  await openMecaniquesFixture(page);
  await expect(page.getByText("Donnée fictive · non publiable")).toBeVisible();
  const thaiGlyph = page.getByLabel("Graphème thaï fictif de test");
  const loadedThaiFaces = await page.evaluate(
    async () =>
      (await document.fonts.load('600 100px "Noto Sans Thai"', "ก่")).length,
  );
  expect(loadedThaiFaces).toBeGreaterThan(0);
  await expect(thaiGlyph).toHaveCSS("font-family", /Noto Sans Thai/iu);
  expect((await thaiGlyph.boundingBox())?.height).toBeGreaterThan(100);
  expect(fontRequests).not.toHaveLength(0);
  const appOrigin = new URL(page.url()).origin;
  expect(fontRequests.every((url) => new URL(url).origin === appOrigin)).toBe(
    true,
  );
  expect(
    fontRequests.some((url) =>
      url.includes("/_next/static/media/noto-sans-thai"),
    ),
  ).toBe(true);

  await completeExpedition(page);
  await expect(page.getByText("Juste")).toHaveCount(5);
  await expect(page.getByText("250 ‰")).toBeVisible();
});

test("enregistre, compare puis supprime une prise locale", async ({ page }) => {
  await openMecaniquesFixture(page);
  await completeExpedition(page);
  await page.getByRole("button", { name: "M’enregistrer" }).click();
  const stop = page.getByRole("button", { name: "Arrêter l’enregistrement" });
  await expect(stop).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Temps restant pour la prise" }),
  ).toHaveAttribute("aria-valuetext", /^\d+ secondes? restantes?$/);
  await expect
    .poll(() =>
      page
        .getByRole("progressbar", { name: "Temps restant pour la prise" })
        .evaluate((element: HTMLProgressElement) => element.value),
    )
    .toBeLessThan(20);
  await stop.click();

  await expect(page.getByLabel("Lire ma prise locale")).toBeVisible();
  await page
    .getByRole("button", { name: "Supprimer cette prise locale" })
    .click();
  await expect(page.getByLabel("Lire ma prise locale")).toHaveCount(0);
  await expect(
    page.getByText("Prise locale supprimée de cet onglet."),
  ).toBeVisible();
});

test("le compte échoue proprement quand Supabase n'est pas configuré", async ({
  page,
}) => {
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "Compte non configuré ici" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continuer hors ligne" }),
  ).toBeVisible();
  await expect(page.getByLabel("Adresse email")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Télécharger mon export JSON" }),
  ).toHaveCount(0);
});
