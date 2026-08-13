import { expect, test } from "@playwright/test";

import { lireLeCours } from "./expedition-helpers";

async function completeLocalOnboarding(page: import("@playwright/test").Page) {
  await page.goto("/today");
  await expect(
    page.getByRole("heading", {
      name: "Préparons votre première session.",
    }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "10 minutes" }).check();
  await page.getByRole("radio", { name: "Communiquer au quotidien" }).check();
  await page.getByRole("radio", { name: "Je débute" }).check();
  await page.getByRole("button", { name: "Préparer ma session" }).click();
  await expect(
    page.getByRole("heading", { name: "Une seule étape, bien comprise." }),
  ).toBeVisible();
}

async function readLocalLessonCheckpoint(
  page: import("@playwright/test").Page,
): Promise<unknown> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("thainaute-local-experience-v1");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("snapshots", "readonly");
          const rowRequest = transaction
            .objectStore("snapshots")
            .get("local-experience-v1");
          rowRequest.onerror = () => reject(rowRequest.error);
          rowRequest.onsuccess = () => {
            const row = rowRequest.result as { snapshot?: string } | undefined;
            database.close();
            resolve(
              row?.snapshot === undefined
                ? null
                : (JSON.parse(row.snapshot) as { lesson?: unknown }).lesson,
            );
          };
        };
      }),
  );
}

test("termine l’onboarding local et prépare la session du jour", async ({
  page,
}) => {
  await completeLocalOnboarding(page);

  // La séance du jour est un COURS, pas la boucle technique. C'était la
  // rupture : le chemin par défaut, accueil puis Aujourd'hui, ne rencontrait
  // jamais un cours, et les leçons publiées n'étaient atteignables que par
  // Pratiquer.
  await expect(
    page.getByRole("link", { name: "Commencer la session" }),
  ).toHaveAttribute("href", "/learn/lecon/u01-l1a");
  await expect(
    page.getByRole("heading", {
      name: "Écouter le thaï pour la première fois",
    }),
  ).toBeVisible();
  await expect(page.getByText("Fixture · non publiable")).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Une seule étape, bien comprise." }),
  ).toBeVisible();
});

test("annonce la limite du mode hors ligne sans promettre de démarrage à froid", async ({
  context,
  page,
}) => {
  await completeLocalOnboarding(page);
  await context.setOffline(true);
  try {
    await expect(
      page.getByText("Hors ligne · les données déjà chargées restent locales"),
    ).toBeVisible();
    await expect(
      page.getByText(/Aucun démarrage à froid hors ligne n’est garanti/u),
    ).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("reprend exactement la question puis retrouve l’expédition depuis Aujourd’hui", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await completeLocalOnboarding(page);
  // La reprise se prouve sur la boucle technique, seule à porter les cinq
  // mécaniques. On y va directement : depuis que la séance du jour est un
  // cours réel, le lien de session ne mène plus ici.
  await page.goto("/learn/demo");
  await lireLeCours(page);
  await page.getByRole("button", { name: "Commencer l’expédition" }).click();
  await page.getByRole("radio", { name: "Signal technique A" }).check();
  await expect
    .poll(() => readLocalLessonCheckpoint(page))
    .toMatchObject({
      phase: "question",
      selectedOptionId: "41000000-0000-4000-8000-000000000001",
    });

  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Signal technique A" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "Signal technique B" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Réécoutez le signal et choisissez l’étiquette A.",
    }),
  ).toBeVisible();
  await page.goto("/today");
  await expect(page.getByText("Expédition en cours · 1 sur 5")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Reprendre l’expédition" }),
  ).toBeVisible();
});
