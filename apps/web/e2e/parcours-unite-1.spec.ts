import { expect, test } from "@playwright/test";

const DRAFT_LESSON_IDS = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1c",
  "u01-l1d",
  "u01-l1f",
  "u01-l1e",
];

test("ne crée aucun lien public vers l'unité 1 encore en brouillon", async ({
  page,
}) => {
  await page.goto("/path");
  for (const lessonId of DRAFT_LESSON_IDS) {
    await expect(
      page.locator(`a[href="/learn/lecon/${lessonId}"]`),
    ).toHaveCount(0);
  }
});

test("rend chaque brouillon de l'unité 1 introuvable par défaut", async ({
  page,
}) => {
  for (const lessonId of DRAFT_LESSON_IDS) {
    const response = await page.goto(`/learn/lecon/${lessonId}`);
    expect(response?.status(), lessonId).toBe(404);
  }
});

test("rend aussi une page introuvable pour une leçon inexistante", async ({
  page,
}) => {
  const response = await page.goto("/learn/lecon/u99-l9z");
  expect(response?.status()).toBe(404);
});
