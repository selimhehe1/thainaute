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

test("enregistre, compare puis supprime une prise locale", async ({ page }) => {
  await page.goto("/learn/demo");
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.getByRole("radio", { name: "Option A" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
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
