import { describe, expect, it, vi } from "vitest";

import { DeviceRegistrationApiError } from "../lib/server/device-registration/errors";
import { createDeviceRegistrar } from "../lib/server/device-registration/service";

const command = {
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  registration: {
    deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    platform: "web" as const,
    appVersion: "1.0.0",
  },
};

describe("cas d'usage d'enregistrement d'appareil", () => {
  it("retourne uniquement la représentation publique de l'appareil", async () => {
    const register = vi.fn(async () => ({
      kind: "registered" as const,
      device: {
        deviceId: command.registration.deviceId,
        platform: "web" as const,
        appVersion: "1.0.0",
        registeredAt: "2026-08-01T10:00:00.000Z",
      },
    }));
    const registrar = createDeviceRegistrar({ register });

    await expect(registrar(command)).resolves.toEqual({
      device: expect.objectContaining({
        deviceId: command.registration.deviceId,
      }),
    });
    expect(register).toHaveBeenCalledWith({
      userId: command.userId,
      ...command.registration,
    });
  });

  it("ferme la collision sans proposer de transfert", async () => {
    const registrar = createDeviceRegistrar({
      register: vi.fn(async () => ({ kind: "device_conflict" as const })),
    });

    await expect(registrar(command)).rejects.toMatchObject({
      code: "device_conflict",
      status: 409,
    } satisfies Partial<DeviceRegistrationApiError>);
  });

  it("ferme la limite d'appareils sans retourner de ressource", async () => {
    const registrar = createDeviceRegistrar({
      register: vi.fn(async () => ({ kind: "device_limit_reached" as const })),
    });

    await expect(registrar(command)).rejects.toMatchObject({
      code: "device_limit_reached",
      status: 409,
    } satisfies Partial<DeviceRegistrationApiError>);
  });
});
