import { describe, expect, it, vi } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import { DeviceRegistrationApiError } from "../lib/server/device-registration/errors";
import { createDeviceRegistrationHttpHandler } from "../lib/server/device-registration/http";

const DEVICE_ID = "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const VALID_BODY = {
  deviceId: DEVICE_ID,
  platform: "web" as const,
  appVersion: "1.0.0",
};
const SUCCESS_RESPONSE = {
  device: {
    ...VALID_BODY,
    registeredAt: "2026-08-01T10:00:00.000Z",
  },
};

function request(
  body: string = JSON.stringify(VALID_BODY),
  headers: Readonly<Record<string, string>> = {},
): Request {
  return new Request("http://localhost/api/v1/devices/register", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
    body,
  });
}

function dependencies() {
  return {
    accessTokenVerifier: {
      verify: vi.fn(async () => ({ userId: USER_ID })),
    },
    registerDevice: vi.fn(async () => SUCCESS_RESPONSE),
    requestIdFactory: () => "70000000-0000-4000-8000-000000000001",
    reportOperationalFailure: vi.fn(),
  };
}

describe("transport HTTP d'enregistrement d'appareil", () => {
  it("retourne la ressource sans cache ni donnée d'identité", async () => {
    const deps = dependencies();
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.json()).toEqual(SUCCESS_RESPONSE);
    expect(deps.registerDevice).toHaveBeenCalledWith({
      userId: USER_ID,
      registration: VALID_BODY,
    });
  });

  it("refuse l'absence de Bearer avant l'appel d'authentification", async () => {
    const deps = dependencies();
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request(undefined, { Authorization: "" }));

    expect(response.status).toBe(401);
    expect(deps.accessTokenVerifier.verify).not.toHaveBeenCalled();
    expect(deps.registerDevice).not.toHaveBeenCalled();
  });

  it("refuse les champs autoritaires et les versions invalides", async () => {
    const deps = dependencies();
    const handler = createDeviceRegistrationHttpHandler(deps);
    const withOwner = await handler(
      request(JSON.stringify({ ...VALID_BODY, userId: "victim" })),
    );
    const invalidVersion = await handler(
      request(JSON.stringify({ ...VALID_BODY, appVersion: "1.0.0 unsafe" })),
    );

    expect(withOwner.status).toBe(422);
    expect(invalidVersion.status).toBe(422);
    expect(deps.registerDevice).not.toHaveBeenCalled();
  });

  it("distingue JSON invalide et média invalide", async () => {
    const handler = createDeviceRegistrationHttpHandler(dependencies());
    const invalidJson = await handler(request("{"));
    const invalidMedia = await handler(
      request(undefined, { "Content-Type": "text/plain" }),
    );

    expect(await invalidJson.json()).toMatchObject({
      error: { code: "invalid_json" },
    });
    expect(await invalidMedia.json()).toMatchObject({
      error: { code: "unsupported_media_type" },
    });
  });

  it("mesure réellement le corps et refuse plus de 4 Kio", async () => {
    const handler = createDeviceRegistrationHttpHandler(dependencies());
    const response = await handler(
      request(JSON.stringify({ ...VALID_BODY, padding: "x".repeat(5_000) })),
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({
      error: { code: "payload_too_large" },
    });
  });

  it("renvoie la collision fermée sans transfert implicite", async () => {
    const deps = dependencies();
    deps.registerDevice.mockRejectedValueOnce(
      new DeviceRegistrationApiError("device_conflict"),
    );
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: { code: "device_conflict" },
    });
  });

  it("renvoie la limite fermée sans détail de stockage", async () => {
    const deps = dependencies();
    deps.registerDevice.mockRejectedValueOnce(
      new DeviceRegistrationApiError("device_limit_reached"),
    );
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: { code: "device_limit_reached" },
    });
  });

  it("ferme une panne d'authentification en 503", async () => {
    const deps = dependencies();
    deps.accessTokenVerifier.verify.mockRejectedValueOnce(
      new AttemptInfrastructureError("auth_unavailable"),
    );
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: { code: "auth_unavailable" },
    });
    expect(deps.registerDevice).not.toHaveBeenCalled();
  });

  it("ne renvoie ni ne journalise une exception sensible", async () => {
    const deps = dependencies();
    deps.registerDevice.mockRejectedValueOnce(
      new Error("SUPABASE_SECRET_KEY=secret-value bearer=test-token"),
    );
    const handler = createDeviceRegistrationHttpHandler(deps);
    const response = await handler(request());
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(500);
    expect(serialized).not.toContain("secret-value");
    expect(serialized).not.toContain("test-token");
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "device_registration",
      errorKind: "internal_error",
      requestId: "70000000-0000-4000-8000-000000000001",
    });
  });
});
