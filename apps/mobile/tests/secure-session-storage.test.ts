import { describe, expect, it } from "vitest";

import { createChunkedSecureSessionStorage } from "../lib/secure-session-storage";

type StorageMethod = "getItem" | "removeItem" | "setItem";

interface StorageOperation {
  readonly key: string;
  readonly method: StorageMethod;
}

interface StorageFailure {
  readonly behavior: "ignore" | "throw-after" | "throw-before";
  readonly key: string;
  readonly method: Exclude<StorageMethod, "getItem">;
}

class MemorySecureStorage {
  readonly operations: StorageOperation[] = [];
  readonly values: Map<string, string>;
  maxConcurrentRemovals = 0;
  private activeRemovals = 0;
  private failure: StorageFailure | null = null;

  constructor(values = new Map<string, string>()) {
    this.values = values;
  }

  failOnce(
    method: StorageFailure["method"],
    key: string,
    afterMutation = false,
  ): void {
    this.failure = {
      method,
      key,
      behavior: afterMutation ? "throw-after" : "throw-before",
    };
  }

  ignoreOnce(method: StorageFailure["method"], key: string): void {
    this.failure = { method, key, behavior: "ignore" };
  }

  resetObservations(): void {
    this.operations.length = 0;
    this.maxConcurrentRemovals = 0;
  }

  getItem(key: string): Promise<string | null> {
    this.operations.push({ method: "getItem", key });
    return Promise.resolve(this.values.get(key) ?? null);
  }

  removeItem(key: string): Promise<void> {
    this.operations.push({ method: "removeItem", key });
    const failure = this.takeFailure("removeItem", key);
    this.activeRemovals += 1;
    this.maxConcurrentRemovals = Math.max(
      this.maxConcurrentRemovals,
      this.activeRemovals,
    );

    return Promise.resolve()
      .then(() => {
        if (failure?.behavior === "throw-before") {
          throw new Error("panne SecureStore simulée");
        }
        if (failure?.behavior !== "ignore") this.values.delete(key);
        if (failure?.behavior === "throw-after") {
          throw new Error("panne SecureStore simulée");
        }
      })
      .finally(() => {
        this.activeRemovals -= 1;
      });
  }

  setItem(key: string, value: string): Promise<void> {
    this.operations.push({ method: "setItem", key });
    const failure = this.takeFailure("setItem", key);
    if (failure?.behavior === "throw-before") {
      return Promise.reject(new Error("panne SecureStore simulée"));
    }

    if (failure?.behavior !== "ignore") this.values.set(key, value);
    return failure?.behavior === "throw-after"
      ? Promise.reject(new Error("panne SecureStore simulée"))
      : Promise.resolve();
  }

  private takeFailure(
    method: StorageFailure["method"],
    key: string,
  ): StorageFailure | null {
    if (this.failure?.method !== method || this.failure.key !== key)
      return null;
    const failure = this.failure;
    this.failure = null;
    return failure;
  }
}

const AUTH_KEY = "auth-token";
const STAGING_KEY = `${AUTH_KEY}.thainaute_staging_v2`;
const MIGRATION_KEY = `${AUTH_KEY}.thainaute_legacy_migrated_v2`;

function legacyChunk(index: number): string {
  return `${AUTH_KEY}.thainaute_chunk_${index}`;
}

function chunk(slot: 0 | 1, index: number): string {
  return `${AUTH_KEY}.thainaute_chunk_v2_${slot}_${index}`;
}

function fragmentKeys(storage: MemorySecureStorage): string[] {
  return [...storage.values.keys()].filter((key) =>
    key.includes(".thainaute_chunk_"),
  );
}

function expectOnlyMigrationMarker(storage: MemorySecureStorage): void {
  expect([...storage.values.entries()]).toEqual([[MIGRATION_KEY, "1"]]);
}

describe("stockage chiffré fragmenté de session", () => {
  it("purge une écriture v1 crashée sans 64 suppressions séquentielles", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set(legacyChunk(20), "fragment-v1-orphelin");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBeNull();

    expect(fragmentKeys(native)).toEqual([]);
    expect(native.values.get(MIGRATION_KEY)).toBe("1");
    expect(native.maxConcurrentRemovals).toBe(8);
    expect(
      native.operations.filter(
        ({ key, method }) =>
          method === "removeItem" && key.includes(".thainaute_chunk_"),
      ),
    ).toHaveLength(64);

    native.resetObservations();
    const session = JSON.stringify({ access_token: "a".repeat(1_000) });
    await storage.setItem(AUTH_KEY, session);

    expect(
      native.operations.some(
        ({ key, method }) =>
          method === "removeItem" &&
          key.startsWith(`${AUTH_KEY}.thainaute_chunk_`),
      ),
    ).toBe(false);
    expect(native.values.get(AUTH_KEY)).not.toContain("access_token");
    await expect(storage.getItem(AUTH_KEY)).resolves.toBe(session);
  });

  it("préserve exactement une session vide", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);

    await storage.setItem(AUTH_KEY, "");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe("");
    expect(native.values.get(chunk(0, 0))).toBe("");
  });

  it("recompose exactement les points de code Unicode sans normalisation", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    const session = JSON.stringify({
      access_token: "ก่ำ😀e\u0301".repeat(300),
      email: "สวัสดี@example.invalid",
    });

    await storage.setItem(AUTH_KEY, session);

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe(session);
    expect(fragmentKeys(native).length).toBeGreaterThan(2);
  });

  it("remplace sans résidu une valeur par des payloads plus court puis plus long", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);

    await storage.setItem(AUTH_KEY, "a".repeat(1_000));
    await storage.setItem(AUTH_KEY, "court");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe("court");
    expect(fragmentKeys(native)).toEqual([chunk(1, 0)]);

    const longer = "b".repeat(1_601);
    await storage.setItem(AUTH_KEY, longer);

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe(longer);
    expect(fragmentKeys(native)).toEqual([
      chunk(0, 0),
      chunk(0, 1),
      chunk(0, 2),
      chunk(0, 3),
      chunk(0, 4),
    ]);
    expect(native.values.has(STAGING_KEY)).toBe(false);
  });

  it("lit puis migre un manifeste v1 en supprimant ses fragments exacts", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    const previous = "v".repeat(450);
    native.values.set(
      AUTH_KEY,
      JSON.stringify({
        schemaVersion: 1,
        chunkCount: 2,
        valueLength: previous.length,
      }),
    );
    native.values.set(legacyChunk(0), previous.slice(0, 400));
    native.values.set(legacyChunk(1), previous.slice(400));

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe(previous);
    await storage.setItem(AUTH_KEY, "nouvelle-session");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe("nouvelle-session");
    expect(native.values.has(legacyChunk(0))).toBe(false);
    expect(native.values.has(legacyChunk(1))).toBe(false);
  });

  it("lit une session historique monobloc puis purge ses fragments sans manifeste", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set(AUTH_KEY, "legacy-session");
    native.values.set(legacyChunk(20), "orphan");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBe("legacy-session");
    await storage.removeItem(AUTH_KEY);

    expectOnlyMigrationMarker(native);
  });

  it("purge un manifeste principal corrompu et tous les espaces de fragments bornés", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set(
      AUTH_KEY,
      JSON.stringify({
        schemaVersion: 2,
        slot: 0,
        chunkCount: 0,
        valueLength: 12,
      }),
    );
    native.values.set(legacyChunk(20), "ancien-secret");
    native.values.set(chunk(0, 12), "secret-slot-zéro");
    native.values.set(chunk(1, 63), "secret-slot-un");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBeNull();

    expectOnlyMigrationMarker(native);
  });

  it("purge un journal corrompu sans conserver le manifeste actif", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set(
      AUTH_KEY,
      JSON.stringify({
        schemaVersion: 2,
        slot: 0,
        chunkCount: 1,
        valueLength: 6,
      }),
    );
    native.values.set(chunk(0, 0), "secret");
    native.values.set(STAGING_KEY, "{journal-corrompu");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBeNull();

    expectOnlyMigrationMarker(native);
  });

  it("reprend un staging interrompu et conserve la dernière session validée", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "session-précédente");
    native.failOnce("setItem", chunk(1, 1), true);

    await expect(storage.setItem(AUTH_KEY, "n".repeat(1_000))).rejects.toThrow(
      "panne SecureStore simulée",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);
    expect(native.values.has(chunk(1, 0))).toBe(true);
    expect(native.values.has(chunk(1, 1))).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBe(
      "session-précédente",
    );
    expect(native.values.has(STAGING_KEY)).toBe(false);
    expect(fragmentKeys(native)).toEqual([chunk(0, 0)]);
  });

  it("purge les fragments d'une première écriture interrompue", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.failOnce("setItem", chunk(0, 1), true);

    await expect(storage.setItem(AUTH_KEY, "n".repeat(1_000))).rejects.toThrow(
      "panne SecureStore simulée",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("termine le nettoyage après un commit réussi mais interrompu", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "a".repeat(900));
    native.failOnce("removeItem", chunk(0, 1), true);

    await expect(storage.setItem(AUTH_KEY, "nouvelle")).rejects.toThrow(
      "panne SecureStore simulée",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBe("nouvelle");
    expect(native.values.has(STAGING_KEY)).toBe(false);
    expect(fragmentKeys(native)).toEqual([chunk(1, 0)]);
  });

  it("restaure le précédent manifeste si la cible de reprise est incomplète", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "session-précédente");
    native.failOnce("removeItem", chunk(0, 0));

    await expect(storage.setItem(AUTH_KEY, "cible")).rejects.toThrow(
      "panne SecureStore simulée",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);
    native.values.delete(chunk(1, 0));

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBe(
      "session-précédente",
    );
    expect(native.values.has(STAGING_KEY)).toBe(false);
    expect(fragmentKeys(native)).toEqual([chunk(0, 0)]);
  });

  it("reprend une suppression interrompue sans fragment sensible orphelin", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "a".repeat(900));
    native.failOnce("removeItem", chunk(0, 1), true);

    await expect(storage.removeItem(AUTH_KEY)).rejects.toThrow(
      "panne SecureStore simulée",
    );
    expect(native.values.has(AUTH_KEY)).toBe(false);
    expect(native.values.has(STAGING_KEY)).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("journalise et purge tous les espaces si un fragment manque", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "x".repeat(1_000));
    native.values.delete(chunk(0, 1));
    native.values.set(legacyChunk(63), "résidu-v1");
    native.values.set(chunk(1, 63), "résidu-slot-inactif");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("journalise et purge un manifeste dont la longueur diverge", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "x".repeat(500));
    native.values.set(chunk(0, 1), "longueur-altérée");

    await expect(storage.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("reprend la purge d'un manifeste invalide après une suppression no-op", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "x".repeat(1_000));
    native.values.delete(chunk(0, 1));
    native.ignoreOnce("removeItem", chunk(0, 0));

    await expect(storage.getItem(AUTH_KEY)).rejects.toThrow(
      "n'a pas confirmé la suppression locale",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);
    expect(native.values.has(chunk(0, 0))).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("sérialise deux wrappers et deux backends partageant le même magasin", async () => {
    const values = new Map<string, string>();
    const firstBackend = new MemorySecureStorage(values);
    const secondBackend = new MemorySecureStorage(values);
    const firstStorage = createChunkedSecureSessionStorage(firstBackend);
    const secondStorage = createChunkedSecureSessionStorage(secondBackend);

    await Promise.all([
      firstStorage.setItem(AUTH_KEY, "première".repeat(100)),
      secondStorage.setItem(AUTH_KEY, "dernière"),
    ]);

    await expect(firstStorage.getItem(AUTH_KEY)).resolves.toBe("dernière");
    expect(values.has(STAGING_KEY)).toBe(false);
    expect(fragmentKeys(firstBackend)).toEqual([chunk(1, 0)]);
  });

  it.each([
    ["journal", STAGING_KEY],
    ["fragment", chunk(1, 0)],
    ["manifeste", AUTH_KEY],
  ] as const)(
    "détecte une écriture silencieusement ignorée du %s",
    async (_label, ignoredKey) => {
      const native = new MemorySecureStorage();
      const storage = createChunkedSecureSessionStorage(native);
      await storage.setItem(AUTH_KEY, "session-stable");
      native.ignoreOnce("setItem", ignoredKey);

      await expect(
        storage.setItem(AUTH_KEY, "session-remplaçante"),
      ).rejects.toThrow("n'a pas confirmé");

      const restarted = createChunkedSecureSessionStorage(native);
      await expect(restarted.getItem(AUTH_KEY)).resolves.toBe("session-stable");
      expect(native.values.has(STAGING_KEY)).toBe(false);
      expect(fragmentKeys(native)).toEqual([chunk(0, 0)]);
    },
  );

  it("reprend si la suppression du manifeste est silencieusement ignorée", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "session");
    native.ignoreOnce("removeItem", AUTH_KEY);

    await expect(storage.removeItem(AUTH_KEY)).rejects.toThrow(
      "n'a pas confirmé la suppression locale",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);
    expect(native.values.has(AUTH_KEY)).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("reprend si la suppression finale du journal est ignorée", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    await storage.setItem(AUTH_KEY, "ancienne");
    native.ignoreOnce("removeItem", STAGING_KEY);

    await expect(storage.setItem(AUTH_KEY, "nouvelle")).rejects.toThrow(
      "n'a pas confirmé la suppression locale",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBe("nouvelle");
    expect(native.values.has(STAGING_KEY)).toBe(false);
    expect(fragmentKeys(native)).toEqual([chunk(1, 0)]);
  });

  it("reprend si l'écriture du marqueur de migration est ignorée", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);
    native.values.set(legacyChunk(63), "orphelin");
    native.ignoreOnce("setItem", MIGRATION_KEY);

    await expect(storage.getItem(AUTH_KEY)).rejects.toThrow(
      "n'a pas confirmé la migration",
    );
    expect(native.values.has(STAGING_KEY)).toBe(true);
    expect(native.values.has(MIGRATION_KEY)).toBe(false);

    const restarted = createChunkedSecureSessionStorage(native);
    await expect(restarted.getItem(AUTH_KEY)).resolves.toBeNull();
    expectOnlyMigrationMarker(native);
  });

  it("borne la capacité sans écrire de journal ni de manifeste trompeur", async () => {
    const native = new MemorySecureStorage();
    const storage = createChunkedSecureSessionStorage(native);

    await expect(storage.setItem(AUTH_KEY, "x".repeat(30_000))).rejects.toThrow(
      "capacité locale",
    );
    expect(native.values.size).toBe(0);
    expect(native.operations).toEqual([]);
  });
});
