import { expect, test } from "@playwright/test";

test("expose des sondes sûres et garde la sync fermée sans configuration", async ({
  request,
}) => {
  const live = await request.get("/api/v1/health/live");
  expect(live.status()).toBe(200);
  expect(await live.json()).toMatchObject({ status: "ok" });
  expect(live.headers()["cache-control"]).toContain("no-store");

  const ready = await request.get("/api/v1/health/ready");
  expect(ready.status()).toBe(200);
  expect(await ready.json()).toMatchObject({
    status: "ok",
    checks: { sync: { status: "ok", mode: "disabled" } },
  });

  const sync = await request.post("/api/v1/attempts/batch", {
    data: { attempts: [] },
  });
  expect(sync.status()).toBe(503);
  expect(await sync.json()).toMatchObject({
    error: { code: "database_unavailable" },
  });
  expect(sync.headers()["cache-control"]).toContain("no-store");

  const content = await request.get(
    "/api/v1/content/lessons/10000000-0000-4000-8000-000000000001",
  );
  expect(content.status()).toBe(503);
  expect(await content.json()).toMatchObject({
    error: { code: "content_unavailable" },
  });
  expect(content.headers()["cache-control"]).toContain("no-store");

  const device = await request.post("/api/v1/devices/register", {
    data: {
      deviceId: "10000000-0000-4000-8000-000000000002",
      platform: "web",
      appVersion: "0.0.0",
    },
  });
  expect(device.status()).toBe(503);
  expect(await device.json()).toMatchObject({
    error: { code: "database_unavailable" },
  });
  expect(device.headers()["cache-control"]).toContain("no-store");
});

test("reste non indexable tant que la porte publique est fermée", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/u,
  );
});
