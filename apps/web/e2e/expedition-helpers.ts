import { expect, type Page } from "@playwright/test";

/**
 * Repond aux trois questions d'accueil, en mouvement reduit pour un deroule
 * deterministe (bouton Continuer au lieu de l'auto-avance).
 *
 * Le lecteur refuse de demarrer une expedition tant que l'accueil n'est pas
 * termine : il propose « Preparer mon parcours » a la place du depart. Toute
 * ouverture de lecon passe donc par ici.
 */
export async function terminerOnboarding(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/today");
  await page.getByRole("radio", { name: "5 minutes" }).check();
  await page.getByRole("radio", { name: "Préparer un séjour" }).check();
  await page.getByRole("radio", { name: "Je débute" }).check();
  await page.getByRole("button", { name: "Préparer ma session" }).click();
}

/** Onboarding court puis ouverture du lecteur sur la boucle technique. */
export async function openExpeditionAfterOnboarding(page: Page): Promise<void> {
  await terminerOnboarding(page);
  await page.getByRole("link", { name: "Commencer la session" }).click();
}

/**
 * Ouvre la page technique des cinq mecaniques. Les lecons reelles de
 * l'unite 1 n'en emploient que quatre : sans cette route, la couverture de
 * bout en bout de l'ordre des mots disparaitrait.
 */
export async function openMecaniquesFixture(page: Page): Promise<void> {
  await terminerOnboarding(page);
  await page.goto("/learn/mecaniques");
}

/** Ouvre une lecon reelle publiee, accueil deja termine. */
export async function ouvrirLeconPubliee(
  page: Page,
  lessonId: string,
): Promise<void> {
  await terminerOnboarding(page);
  await page.goto(`/learn/lecon/${lessonId}`);
}

/**
 * Lit le cours jusqu'a sa derniere page.
 *
 * Le bouton de depart n'apparait qu'une fois le cours lu : c'est la
 * sequence « enseignement PUIS pratique » du brief. Sans elle, la premiere
 * question demandait de distinguer cinq contours tonaux a quelqu'un qui
 * n'avait jamais entendu de thai.
 */
export async function lireLeCours(page: Page): Promise<void> {
  const suivant = page.getByRole("button", { name: "Page suivante" });
  const depart = page.getByRole("button", { name: "Commencer l’expédition" });
  // On attend que l'ecran d'accueil soit rendu : sans cela, on constate
  // qu'il n'y a pas de bouton « Page suivante » avant meme qu'il existe, et
  // on sort du cours sans l'avoir lu.
  await expect(suivant.or(depart).first()).toBeVisible();
  // Borne haute : le schema plafonne une lecon a 40 pages.
  for (let garde = 0; garde < 40; garde += 1) {
    if ((await suivant.count()) === 0) return;
    await suivant.click();
  }
  throw new Error("Le cours ne se termine jamais.");
}

/** Les six tirages actifs de la leçon 1A : le contraste tombe/grimpe. */
const TIRAGES_AUDIO_1A = [
  { mot: "ค่า", transcription: "khâa", reponse: "la voix tombe" },
  { mot: "ขา", transcription: "khǎa", reponse: "la voix grimpe" },
  { mot: "ขา", transcription: "khǎa", reponse: "la voix grimpe" },
  { mot: "ค่า", transcription: "khâa", reponse: "la voix tombe" },
  { mot: "ค่า", transcription: "khâa", reponse: "la voix tombe" },
  { mot: "ขา", transcription: "khǎa", reponse: "la voix grimpe" },
] as const;

/** Les trois associations actives : moyen, descendant, montant. */
const ASSOCIATIONS_1A = [
  { mot: "คา", transcription: "khaa" },
  { mot: "ค่า", transcription: "khâa" },
  { mot: "ขา", transcription: "khǎa" },
] as const;

const TOTAL_EXERCICES_1A = TIRAGES_AUDIO_1A.length + 1;

/** Termine la leçon réelle de l'unité 1 : écoute puis association. */
export async function completeLecon1a(page: Page): Promise<void> {
  await lireLeCours(page);
  await page.getByRole("button", { name: "Commencer l’expédition" }).click();

  for (const [index, tirage] of TIRAGES_AUDIO_1A.entries()) {
    await expect(
      page.getByText(
        `Écoute · exercice ${index + 1} sur ${TOTAL_EXERCICES_1A}`,
      ),
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

  await expect(
    page.getByText(
      `Association · exercice ${TOTAL_EXERCICES_1A} sur ${TOTAL_EXERCICES_1A}`,
    ),
  ).toBeVisible();
  for (const tirage of ASSOCIATIONS_1A) {
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
