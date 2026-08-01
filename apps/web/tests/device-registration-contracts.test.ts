import { describe, expect, it } from "vitest";

import { deviceRegistrationRequestSchema } from "../lib/server/device-registration/contracts";

describe("contrat d'enregistrement d'appareil", () => {
  it("normalise l'UUID et accepte les trois plateformes", () => {
    for (const platform of ["web", "ios", "android"] as const) {
      expect(
        deviceRegistrationRequestSchema.parse({
          deviceId: "DAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA",
          platform,
          appVersion: "1.2.3-beta+42",
        }),
      ).toEqual({
        deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        platform,
        appVersion: "1.2.3-beta+42",
      });
    }
  });

  it("refuse les champs supplémentaires et les versions ambiguës", () => {
    expect(
      deviceRegistrationRequestSchema.safeParse({
        deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        platform: "web",
        appVersion: "1.0.0",
        userId: "victim",
      }).success,
    ).toBe(false);
    expect(
      deviceRegistrationRequestSchema.safeParse({
        deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        platform: "desktop",
        appVersion: "1.0.0",
      }).success,
    ).toBe(false);
    expect(
      deviceRegistrationRequestSchema.safeParse({
        deviceId: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        platform: "web",
        appVersion: "1.0.0 avec espace",
      }).success,
    ).toBe(false);
  });
});
