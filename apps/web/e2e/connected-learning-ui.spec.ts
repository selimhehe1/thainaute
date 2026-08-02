import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import { expect, test, type Page } from "@playwright/test";

const WEB_ORIGIN = "http://localhost:3000";

test.skip(
  process.env.THAINAUTE_PUBLIC_CONTENT_MODE !== "supabase" ||
    process.env.THAINAUTE_SYNC_MODE !== "supabase",
  "La preview UI exige contenu et synchronisation Supabase locaux.",
);

async function readLocalOtp(email: string): Promise<string> {
  const query = new URLSearchParams({ query: `to:${email}` });
  const url = `http://127.0.0.1:54324/view/latest.html?${query.toString()}`;
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html" },
        signal: AbortSignal.timeout(1_500),
      });
      if (response.ok) {
        const html = await response.text();
        const match =
          /letter-spacing:\s*8px;[\s\S]*?>\s*(\d{6})\s*<\/p>/iu.exec(html);
        if (match?.[1] !== undefined) return match[1];
      }
    } catch {
      // Mailpit peut indexer le message après la réponse Auth.
    }
    await delay(200);
  }
  throw new Error("Le code OTP local n'a pas été trouvé à temps.");
}

async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("/account");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  await page.getByLabel("Code reçu par email").fill(await readLocalOtp(email));
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Votre progression, sous votre contrôle.",
    }),
  ).toBeVisible();
}

test("parcourt la vraie UI puis retrouve la progression sur un second navigateur", async ({
  browser,
  page,
}) => {
  test.setTimeout(60_000);
  const email = `connected-learning-${randomUUID()}@thainaute.invalid`;
  await signIn(page, email);

  await page.goto("/learn/connected");
  await expect(
    page.getByRole("heading", { name: "Boucle technique locale" }),
  ).toBeVisible();
  const audioResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /\/api\/v1\/content\/lessons\/.+\/audio\/.+/u.test(
        new URL(response.url()).pathname,
      ),
  );
  await page.getByRole("button", { name: "Préparer l’audio" }).click();
  expect((await audioResponse).ok()).toBe(true);
  await expect(page.locator("audio")).toBeVisible();

  await page.getByRole("radio", { name: "Option A" }).check();
  const attemptResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/attempts/batch",
  );
  await page.getByRole("button", { name: "Valider ma réponse" }).click();
  expect((await attemptResponse).ok()).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Correction autoritaire" }),
  ).toBeVisible();
  await expect(
    page.getByText("La boucle technique fonctionne.", { exact: true }),
  ).toBeVisible();
  const firstProgress = page.getByRole("region", {
    name: "Maîtrise et prochaine révision",
  });
  await expect(firstProgress.getByText("25 %", { exact: true })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Correction autoritaire" }),
  ).toBeVisible();
  await expect(
    page.getByText("La boucle technique fonctionne.", { exact: true }),
  ).toBeVisible();

  const authStorageState = await page.context().storageState({
    indexedDB: false,
  });
  const secondContext = await browser.newContext({
    baseURL: WEB_ORIGIN,
    storageState: authStorageState,
  });
  try {
    const secondPage = await secondContext.newPage();
    await secondPage.goto("/learn/connected");
    await expect(
      secondPage.getByRole("heading", { name: "Boucle technique locale" }),
    ).toBeVisible();
    const secondProgress = secondPage.getByRole("region", {
      name: "Maîtrise et prochaine révision",
    });
    await expect(
      secondProgress.getByText("25 %", { exact: true }),
    ).toBeVisible();
    await expect(secondProgress.getByText("1", { exact: true })).toBeVisible();
  } finally {
    await secondContext.close();
  }
});
