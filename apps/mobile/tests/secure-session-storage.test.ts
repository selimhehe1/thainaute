import { describe, expect, it } from "vitest";

import { createChunkedSecureSessionStorage } from "../lib/secure-session-storage";

class MemorySecureStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.values.get(key) ?? null);
  }

  removeItem(key: string): Promise<void> {
    this.values.delete(key);
    return Promise.resolve();
  }

  setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
    return Promise.resolve();
  }
}

describe("stockage chiffré fragmenté de session", () => {
  it("recompose exactement un payload long avec Unicode", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    const session = JSON.stringify({
      access_token: "a".repeat(3_000),
      email: "สวัสดี@example.invalid",
    });

    await storage.setItem("auth-token", session);

    await expect(storage.getItem("auth-token")).resolves.toBe(session);
    expect(native.values.get("auth-token")).not.toContain("access_token");
    expect(native.values.size).toBeGreaterThan(2);
  });

  it("lit une session historique monobloc puis purge tous ses fragments", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set("auth-token", "legacy-session");
    native.values.set("auth-token.thainaute_chunk_20", "orphan");

    await expect(storage.getItem("auth-token")).resolves.toBe("legacy-session");
    await storage.removeItem("auth-token");

    expect(native.values.size).toBe(0);
  });

  it("refuse une lecture partielle si un fragment manque", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem("auth-token", "x".repeat(1_000));
    native.values.delete("auth-token.thainaute_chunk_1");

    await expect(storage.getItem("auth-token")).resolves.toBeNull();
  });

  it("borne la capacité sans écrire de manifeste trompeur", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);

    await expect(
      storage.setItem("auth-token", "x".repeat(30_000)),
    ).rejects.toThrow("capacité locale");
    expect(native.values.size).toBe(0);
  });
});
