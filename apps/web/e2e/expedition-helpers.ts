import { expect, type Page } from "@playwright/test";

/** Onboarding court puis ouverture du lecteur, en mouvement réduit pour un
 * déroulé déterministe (bouton Continuer au lieu de l'auto-avance). */
export async function openExpeditionAfterOnboarding(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/today");
  await page.getByRole("radio", { name: "5 minutes" }).check();
  await page.getByRole("radio", { name: "Préparer un séjour" }).check();
  await page.getByRole("radio", { name: "Je débute" }).check();
  await page.getByRole("button", { name: "Préparer ma session" }).click();
  await page.getByRole("link", { name: "Commencer la session" }).click();
}

export async function completeExpedition(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Commencer l’expédition" }).click();

  await expect(page.getByText("Écoute · exercice 1 sur 5")).toBeVisible();
  await page.getByRole("radio", { name: "Signal technique A" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La mécanique d’écoute fonctionne." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.getByText("Association · exercice 2 sur 5")).toBeVisible();
  await page.getByRole("button", { name: "ก่", exact: true }).click();
  await page.getByRole("button", { name: "Signal technique A" }).click();
  await page.getByRole("button", { name: "ก้", exact: true }).click();
  await page.getByRole("button", { name: "Signal technique B" }).click();
  await expect(
    page.getByRole("heading", {
      name: "La mécanique d’association fonctionne.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(
    page.getByText("Ordre des mots · exercice 3 sur 5"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Déplacer ก่ dans la réponse" })
    .click();
  await page
    .getByRole("button", { name: "Déplacer ก้ dans la réponse" })
    .click();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La mécanique d’ordre fonctionne." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.getByText("Rappel · exercice 4 sur 5")).toBeVisible();
  await page.getByRole("textbox", { name: "Votre réponse" }).fill("ก่");
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La mécanique de rappel fonctionne." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.getByText("Lecture · exercice 5 sur 5")).toBeVisible();
  await page.getByRole("radio", { name: "Signal technique A" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", { name: "La mécanique de lecture fonctionne." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(
    page.getByRole("heading", {
      name: "La courbe de la séance est complète.",
    }),
  ).toBeVisible();
}
