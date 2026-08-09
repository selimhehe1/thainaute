import {
  expect,
  test,
  type APIResponse,
  type Response,
} from "@playwright/test";

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

function expectProductPageSecurityHeaders(response: Response): void {
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toBe(
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  );
  expect(headers["permissions-policy"]).toContain("microphone=(self)");
  expect(headers["permissions-policy"]).not.toContain("microphone=()");
  expect(headers["permissions-policy"]).toContain("payment=()");
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

  const studio = await request.get("/api/v1/studio/content/review");
  expect(studio.status()).toBe(404);
  expect(await studio.json()).toMatchObject({
    error: { code: "not_found" },
  });
  expect(studio.headers()["cache-control"]).toContain("no-store");

  const hiddenStudioMethods = [
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ] as const;
  const hiddenStudioResponses: APIResponse[] = [];
  for (const method of hiddenStudioMethods) {
    const response = await request.fetch("/api/v1/studio/content/review", {
      method,
    });
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["allow"]).toBeUndefined();
    hiddenStudioResponses.push(response);
  }

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
    studio,
    ...hiddenStudioResponses,
    missing,
    unsupportedMethod,
  ]) {
    expectApiSecurityHeaders(response);
  }
});

test("masque entièrement le studio tant que son mode reste fermé", async ({
  page,
}) => {
  const response = await page.goto("/studio");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Publication refusée")).toHaveCount(0);
});

test("interdit les anciens WAV internes sans retirer la fixture publique", async ({
  request,
}) => {
  const internal = await request.get(
    "/audio/u01-l1a/9ae0a4f7-d9cb-551d-b247-7d258e606b29.wav",
  );
  expect(internal.status()).toBe(404);
  expect(internal.headers()["content-type"]).not.toContain("audio/");
  expect(internal.headers()["cache-control"]).toContain("no-store");
  expect(internal.headers()["x-content-type-options"]).toBe("nosniff");

  const fixture = await request.get("/audio/fixture-tone.wav");
  expect(fixture.status()).toBe(200);
  expect(fixture.headers()["content-type"]).toContain("audio/wav");
});

test("reste non indexable tant que la porte publique est fermée", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expectProductPageSecurityHeaders(response!);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/u,
  );
});
