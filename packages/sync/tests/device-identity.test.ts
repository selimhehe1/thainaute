import { describe, expect, it, vi } from "vitest";

import { deriveAccountDeviceId } from "../src/device-identity";

const installationId = "11111111-1111-4111-8111-111111111111";
const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("identité d'appareil par compte", () => {
  it("dérive un UUIDv8 déterministe à partir d'un condensat SHA-256", async () => {
    const sha256Hex = vi.fn(() => Promise.resolve("00".repeat(32)));

    await expect(
      deriveAccountDeviceId({ installationId, userId, sha256Hex }),
    ).resolves.toBe("00000000-0000-8000-8000-000000000000");
    expect(sha256Hex).toHaveBeenCalledWith(
      `thainaute/account-device/v1\u0000${installationId}\u0000${userId}`,
    );
  });

  it("sépare deux comptes d'une même installation", async () => {
    const sha256Hex = (material: string) =>
      Promise.resolve(
        material.endsWith(userId) ? "11".repeat(32) : "22".repeat(32),
      );

    const first = await deriveAccountDeviceId({
      installationId,
      userId,
      sha256Hex,
    });
    const second = await deriveAccountDeviceId({
      installationId,
      userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      sha256Hex,
    });

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[0-9a-f-]{36}$/u);
    expect(second).toMatch(/^[0-9a-f-]{36}$/u);
  });

  it("refuse les identités et condensats non canoniques", async () => {
    await expect(
      deriveAccountDeviceId({
        installationId: "installation",
        userId,
        sha256Hex: () => Promise.resolve("00".repeat(32)),
      }),
    ).rejects.toThrow();
    await expect(
      deriveAccountDeviceId({
        installationId,
        userId,
        sha256Hex: () => Promise.resolve("not-a-digest"),
      }),
    ).rejects.toThrow();
  });
});
