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

/**
 * Ouvre la page technique des cinq mecaniques. La lecon reelle de l'unite 1
 * n'en emploie que deux : sans cette route, la couverture de bout en bout
 * des trois autres disparaitrait.
 */
export async function openMecaniquesFixture(page: Page): Promise<void> {
  // Le lecteur exige l'etat d'accueil que /today met en place : on passe
  // donc par l'onboarding, puis on rejoint la route technique au lieu de
  // suivre le lien de session, qui mene a la lecon reelle.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/today");
  await page.getByRole("radio", { name: "5 minutes" }).check();
  await page.getByRole("radio", { name: "Préparer un séjour" }).check();
  await page.getByRole("radio", { name: "Je débute" }).check();
  await page.getByRole("button", { name: "Préparer ma session" }).click();
  await page.goto("/learn/mecaniques");
}

/** Les cinq tirages d'ecoute de la lecon 1A, dans l'ordre du vivier. */
const TIRAGES_1A = [
  { mot: "คา", transcription: "khaa", reponse: "à plat au milieu (moyen)" },
  { mot: "ข่า", transcription: "khàa", reponse: "posé en bas (bas)" },
  { mot: "ค่า", transcription: "khâa", reponse: "qui tombe (descendant)" },
  { mot: "ค้า", transcription: "kháa", reponse: "perché et tendu (haut)" },
  { mot: "ขา", transcription: "khǎa", reponse: "qui grimpe (montant)" },
] as const;

/** Termine la lecon reelle de l'unite 1 : cinq ecoutes puis une association. */
export async function completeLecon1a(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Commencer l’expédition" }).click();

  for (const [index, tirage] of TIRAGES_1A.entries()) {
    await expect(
      page.getByText(`Écoute · exercice ${index + 1} sur 6`),
    ).toBeVisible();
    await page.getByRole("radio", { name: tirage.reponse }).check();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(
      page.getByRole("heading", {
        name: `Oui. ${tirage.mot} (${tirage.transcription}) : ${tirage.reponse}. Votre oreille vient de faire le travail.`,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continuer" }).click();
  }

  await expect(page.getByText("Association · exercice 6 sur 6")).toBeVisible();
  for (const tirage of TIRAGES_1A) {
    await page.getByRole("button", { name: tirage.mot, exact: true }).click();
    await page
      .getByRole("button", {
        name: new RegExp(`· ${tirage.transcription}$`, "u"),
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: /^Bonne association/u }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();
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
