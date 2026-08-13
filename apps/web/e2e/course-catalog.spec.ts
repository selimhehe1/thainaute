import { expect, test } from "@playwright/test";

test("ne révèle ni catalogue ni brouillon hors mode éditeur", async ({
  page,
}) => {
  await page.goto("/path");

  // Le parcours montre désormais l'itinéraire réel. L'invariant protégé
  // n'est plus « aucun lien de leçon » mais « aucun BROUILLON révélé » :
  // les leçons signées sont faites pour être ouvertes, les autres n'ont
  // droit qu'à un nombre.
  await expect(
    page.getByRole("heading", { name: "Votre itinéraire, unité par unité." }),
  ).toBeVisible();
  await expect(page.locator('a[href="/learn/lecon/u03-l3b"]')).toHaveCount(0);
  await expect(page.getByText("Compter de un à cent")).toHaveCount(0);
  await expect(page.getByText("en préparation").first()).toBeVisible();

  // Pratiquer annonce désormais un catalogue, mais seulement un nombre : le
  // titre, l'objectif et le contenu d'un brouillon n'en sortent pas.
  await page.goto("/practice");
  await expect(page.locator('a[href="/learn/lecon/u03-l3b"]')).toHaveCount(0);
  await expect(page.getByText("Compter de un à cent")).toHaveCount(0);

  const response = await page.goto("/learn/lecon/u03-l3b");
  expect(response?.status()).toBe(404);
});
