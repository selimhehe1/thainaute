import { expect, test } from "@playwright/test";

import { completeLecon1a, ouvrirLeconPubliee } from "./expedition-helpers";

/**
 * Les cinq leçons que la signature du fondateur couvre
 * (`content/signatures/01.json`). Elles portent `published` et `public`.
 */
const LECONS_SIGNEES = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1c",
  "u01-l1d",
  "u01-l1f",
] as const;

/**
 * 1E est volontairement hors signature. Elle sert de témoin : une leçon non
 * signée reste introuvable même lorsque ses voisines de la même unité sont
 * publiées. L'invariant protégé n'est pas « l'unité 1 est un brouillon »,
 * c'est « la signature, et elle seule, ouvre une leçon ».
 */
const LECON_NON_SIGNEE = "u01-l1e";

test("propose les leçons signées, et elles seules, depuis Pratiquer", async ({
  page,
}) => {
  await page.goto("/practice");

  for (const lessonId of LECONS_SIGNEES) {
    await expect(
      page.locator(`a[href="/learn/lecon/${lessonId}"]`),
      lessonId,
    ).toHaveCount(1);
  }
  await expect(
    page.locator(`a[href="/learn/lecon/${LECON_NON_SIGNEE}"]`),
  ).toHaveCount(0);
});

test("ouvre chaque leçon signée", async ({ page }) => {
  for (const lessonId of LECONS_SIGNEES) {
    const response = await page.goto(`/learn/lecon/${lessonId}`);
    expect(response?.status(), lessonId).toBe(200);
  }
});

test("garde introuvable la leçon que la signature ne couvre pas", async ({
  page,
}) => {
  const response = await page.goto(`/learn/lecon/${LECON_NON_SIGNEE}`);
  expect(response?.status()).toBe(404);
});

test("rend aussi une page introuvable pour une leçon inexistante", async ({
  page,
}) => {
  const response = await page.goto("/learn/lecon/u99-l9z");
  expect(response?.status()).toBe(404);
});

test("termine la leçon 1A et affiche sa maîtrise", async ({ page }) => {
  await ouvrirLeconPubliee(page, "u01-l1a");
  await completeLecon1a(page);

  await expect(
    page.getByRole("heading", { name: "La courbe de la séance est complète." }),
  ).toBeVisible();
  await expect(page.getByText("Prochaine révision")).toBeVisible();
});
