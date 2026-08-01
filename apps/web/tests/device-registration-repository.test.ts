import { describe, expect, it } from "vitest";

import { DeviceRegistrationInfrastructureError } from "../lib/server/device-registration/errors";
import { parseRegisterDeviceRpcResult } from "../lib/server/device-registration/supabase-repository";

const DEVICE = {
  deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  platform: "web",
  appVersion: "1.0.0",
  registeredAt: "2026-08-01T10:00:00.000Z",
};

describe("adaptateur RPC d'enregistrement", () => {
  it("valide strictement la réponse de PostgreSQL", () => {
    expect(parseRegisterDeviceRpcResult(DEVICE, null)).toEqual({
      kind: "registered",
      device: DEVICE,
    });
    expect(() =>
      parseRegisterDeviceRpcResult({ ...DEVICE, userId: "sensible" }, null),
    ).toThrow(DeviceRegistrationInfrastructureError);
  });

  it("traduit uniquement la collision documentée", () => {
    expect(parseRegisterDeviceRpcResult(null, { code: "TD002" })).toEqual({
      kind: "device_conflict",
    });
    expect(() => parseRegisterDeviceRpcResult(null, { code: "TD001" })).toThrow(
      DeviceRegistrationInfrastructureError,
    );
    expect(() =>
      parseRegisterDeviceRpcResult(null, { code: "unexpected" }),
    ).toThrow(DeviceRegistrationInfrastructureError);
  });

  it("traduit la limite d'appareils sans exposer l'erreur SQL", () => {
    expect(parseRegisterDeviceRpcResult(null, { code: "TD004" })).toEqual({
      kind: "device_limit_reached",
    });
  });
});
