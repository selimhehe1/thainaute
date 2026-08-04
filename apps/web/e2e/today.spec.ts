import { expect, test } from "@playwright/test";

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

  await expect(
    page.getByRole("link", { name: "Commencer la session" }),
  ).toHaveAttribute("href", "/learn/demo");
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
  await page.getByRole("link", { name: "Commencer la session" }).click();
  await page.getByRole("button", { name: "Commencer l’expédition" }).click();
  await page.getByRole("radio", { name: "posé en bas (bas)" }).check();
  await expect
    .poll(() => readLocalLessonCheckpoint(page))
    .toMatchObject({
      phase: "question",
      selectedOptionId: "b78d3b37-8017-5166-a2d5-58d53b271868",
    });

  await page.reload();
  await expect(
    page.getByRole("radio", { name: "posé en bas (bas)" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "à plat au milieu (moyen)" }).check();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Oui. คา (khaa) : à plat au milieu (moyen). Votre oreille vient de faire le travail.",
    }),
  ).toBeVisible();
  await page.goto("/today");
  await expect(page.getByText("Expédition en cours · 1 sur 6")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Reprendre l’expédition" }),
  ).toBeVisible();
});
