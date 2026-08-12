import { expect, test } from "@playwright/test";

test("ne révèle ni catalogue ni brouillon hors mode éditeur", async ({
  page,
}) => {
  await page.goto("/path");

  await expect(
    page.getByRole("heading", {
      name: "Le premier parcours linguistique reste en relecture.",
    }),
  ).toBeVisible();
  await expect(page.locator('a[href^="/learn/lecon/"]')).toHaveCount(0);
  await expect(page.getByText("Compter de un à cent")).toHaveCount(0);

  const response = await page.goto("/learn/lecon/u03-l3b");
  expect(response?.status()).toBe(404);
});
