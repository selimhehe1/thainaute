import { expect, test } from "@playwright/test";

test("termine la leçon fictive", async ({ page }) => {
  await page.goto("/learn/demo");
  await expect(page.getByText("Donnée fictive — non publiable")).toBeVisible();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.getByRole("radio", { name: "Option A" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La boucle technique fonctionne." }),
  ).toBeFocused();
  await expect(page.getByText("250 ‰")).toBeVisible();
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
});
