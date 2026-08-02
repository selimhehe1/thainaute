import { expect, test } from "@playwright/test";

async function completeFixtureLesson(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/today");
  await page.getByRole("radio", { name: "5 minutes" }).check();
  await page.getByRole("radio", { name: "Préparer un séjour" }).check();
  await page.getByRole("radio", { name: "Je débute" }).check();
  await page.getByRole("button", { name: "Préparer ma session" }).click();
  await page.getByRole("link", { name: "Commencer la session" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.getByRole("radio", { name: "Option A" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La boucle technique fonctionne." }),
  ).toBeFocused();
}

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
  await expect(page.getByRole("link", { name: "Compte" })).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
});

test("reflète la clôture durable de la fixture", async ({ page }) => {
  await completeFixtureLesson(page);
  await page.goto("/path");

  await expect(page.getByText("Étape technique terminée")).toBeVisible();
  await expect(
    page.getByRole("progressbar", {
      name: "Progression de l’unité technique",
    }),
  ).toHaveJSProperty("value", 100);
  await expect(
    page.getByRole("link", { name: "Revoir la démonstration" }),
  ).toHaveAttribute("href", "/learn/demo");
});
