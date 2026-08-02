import { expect, test } from "@playwright/test";

test("conserve un choix analytics local, réversible et sans trafic distant", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin !== "http://localhost:3000"
    ) {
      externalRequests.push(url.origin);
    }
  });

  await page.goto("/privacy");
  const accept = page.getByRole("button", {
    name: "Accepter la mesure facultative",
  });
  const refuse = page.getByRole("button", {
    name: "Refuser la mesure facultative",
  });
  await expect(accept).toBeVisible();
  await expect(refuse).toBeVisible();
  expect(await accept.getAttribute("class")).toBe(
    await refuse.getAttribute("class"),
  );

  await refuse.click();
  await expect(
    page.getByText("La mesure facultative est refusée sur ce navigateur."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("La mesure facultative est refusée sur ce navigateur."),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Autoriser la mesure facultative" })
    .click();
  await expect(
    page.getByText("La mesure facultative est autorisée sur ce navigateur."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("La mesure facultative est autorisée sur ce navigateur."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Retirer mon consentement" }).click();
  await expect(
    page.getByText("La mesure facultative est refusée sur ce navigateur."),
  ).toBeVisible();

  const stored = await page.evaluate(() => {
    const serialized = localStorage.getItem("thainaute.analytics-consent.v1");
    return serialized === null ? null : (JSON.parse(serialized) as unknown);
  });
  expect(stored).toMatchObject({
    schemaVersion: 1,
    decision: "denied",
    revision: 3,
  });
  expect(Object.keys(stored as object).sort()).toEqual([
    "decision",
    "revision",
    "schemaVersion",
    "updatedAt",
  ]);
  expect(externalRequests).toEqual([]);
});
