import { expect, test } from "@playwright/test";

/**
 * Les cinq leçons de l'unité 1 doivent être listées ET atteignables.
 *
 * Ce test existe parce que jusqu'ici une seule leçon était accessible, en
 * dur : les quatre autres étaient compilées, validées, et invisibles. Un
 * contenu qu'aucun chemin ne mène nulle part n'existe pas pour l'apprenant.
 */
const LECONS = [
  { id: "u01-l1a", titre: "Écouter le thaï pour la première fois" },
  { id: "u01-l1b", titre: "Longues et courtes" },
  { id: "u01-l1c", titre: "Mi contre bas" },
  { id: "u01-l1d", titre: "Montant contre haut" },
  { id: "u01-l1e", titre: "Premier dialogue minimal" },
];

test("liste les cinq leçons de l'unité 1 depuis le parcours", async ({
  page,
}) => {
  await page.goto("/path");
  await expect(
    page.getByRole("heading", {
      name: "Écouter le thaï pour la première fois",
      level: 2,
    }),
  ).toBeVisible();

  for (const lecon of LECONS) {
    await expect(
      page.locator(`a[href="/learn/lecon/${lecon.id}"]`),
    ).toHaveCount(1);
  }
});

test("ouvre chaque leçon de l'unité 1 et y trouve du thaï", async ({
  page,
}) => {
  for (const lecon of LECONS) {
    const reponse = await page.goto(`/learn/lecon/${lecon.id}`);
    expect(reponse?.status(), lecon.id).toBe(200);

    // Le lecteur doit annoncer son nombre d'exercices : c'est le signe que
    // la leçon a bien été montée, et pas seulement que la route répond.
    // Le compte apparait dans l'en-tete ET dans la carte : on vise le
    // premier plutot que de rendre le selecteur fragile.
    await expect(
      page.getByText(/Expédition · \d+ exercices?/u).first(),
      lecon.id,
    ).toBeVisible();
  }
});

test("rend une page introuvable pour une leçon inexistante", async ({
  page,
}) => {
  const reponse = await page.goto("/learn/lecon/u99-l9z");
  expect(reponse?.status()).toBe(404);
});
