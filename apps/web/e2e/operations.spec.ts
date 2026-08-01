import { expect, test, type APIResponse } from "@playwright/test";

function expectApiSecurityHeaders(response: APIResponse): void {
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["content-security-policy"]).toBe(
    "default-src 'none'; frame-ancestors 'none'; sandbox",
  );
  expect(headers["permissions-policy"]).toContain("microphone=()");
  expect(headers["permissions-policy"]).toContain("payment=()");
  expect(headers["access-control-allow-origin"]).toBeUndefined();
  expect(headers["x-powered-by"]).toBeUndefined();
}

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

  const missing = await request.get("/api/v1/route-inexistante");
  expect(missing.status()).toBe(404);

  const unsupportedMethod = await request.post("/api/v1/health/live");
  expect(unsupportedMethod.status()).toBe(405);

  for (const response of [
    live,
    ready,
    sync,
    content,
    device,
    missing,
    unsupportedMethod,
  ]) {
    expectApiSecurityHeaders(response);
  }
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
