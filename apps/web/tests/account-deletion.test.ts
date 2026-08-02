import type { AccountDeletionReceipt } from "@thainaute/sync";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  WEB_ACCOUNT_DELETION_STORAGE_KEY,
  WebAccountDeletionLocalStateError,
  WebAccountDeletionInProgressError,
  WebAccountDeletionSubjectConflictError,
  WebAccountDeletionTombstonedError,
  assertNoPendingWebAccountDeletion,
  completePendingWebAccountDeletion,
  createPendingWebAccountDeletion,
  readPendingWebAccountDeletion,
} from "../lib/client/account-deletion";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
  idempotency: "20000000-0000-4000-8000-000000000001",
  receipt: "30000000-0000-4000-8000-000000000001",
} as const;

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

class SerialLockManager {
  #tail: Promise<unknown> = Promise.resolve();

  request<T>(
    _name: string,
    _options: Readonly<{ mode: "exclusive" }>,
    callback: () => Promise<T>,
  ): Promise<T> {
    const result = this.#tail.then(callback);
    this.#tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

const cryptoPort = {
  getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (array instanceof Uint8Array) {
      array.forEach((_value, index) => {
        array[index] = index;
      });
    }
    return array;
  },
  randomUUID: () => ids.idempotency,
};

const receipt: AccountDeletionReceipt = {
  format: "thainaute.account-deletion-receipt/v1",
  receiptId: ids.receipt,
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true,
};

describe("suppression de compte web locale", () => {
  let storage: MemoryStorage;
  let lockManager: SerialLockManager;

  beforeEach(() => {
    storage = new MemoryStorage();
    lockManager = new SerialLockManager();
  });

  it("persiste une operation versionnee avec 32 octets CSPRNG sans donnee de session", async () => {
    const operation = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });

    expect(operation).toEqual({
      format: "thainaute.web-account-deletion-operation/v1",
      expectedUserId: ids.userA,
      idempotencyKey: ids.idempotency,
      continuationSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
    });
    const persisted = storage.getItem(WEB_ACCOUNT_DELETION_STORAGE_KEY);
    expect(persisted).not.toContain("access_token");
    expect(persisted).not.toContain("email");
  });

  it("conserve un etat illisible et refuse de l'ecraser", () => {
    storage.setItem(WEB_ACCOUNT_DELETION_STORAGE_KEY, "{invalide");

    expect(() => readPendingWebAccountDeletion(storage)).toThrow(
      WebAccountDeletionLocalStateError,
    );
    expect(storage.getItem(WEB_ACCOUNT_DELETION_STORAGE_KEY)).toBe("{invalide");
  });

  it("reutilise la meme operation pour A et n'autorise pas B a l'ecraser", async () => {
    const first = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });
    const same = await createPendingWebAccountDeletion(ids.userA, {
      crypto: {
        ...cryptoPort,
        randomUUID: () => "ffffffff-ffff-4fff-8fff-ffffffffffff",
      },
      lockManager,
      storage,
    });

    expect(same).toEqual(first);
    await expect(
      createPendingWebAccountDeletion(ids.userB, {
        crypto: cryptoPort,
        lockManager,
        storage,
      }),
    ).rejects.toThrow(WebAccountDeletionSubjectConflictError);
    expect(readPendingWebAccountDeletion(storage)).toEqual(first);
  });

  it("bloque les mutations concurrentes de A sans bloquer le compte B", async () => {
    await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });

    expect(() => assertNoPendingWebAccountDeletion(ids.userA, storage)).toThrow(
      WebAccountDeletionInProgressError,
    );
    expect(() =>
      assertNoPendingWebAccountDeletion(ids.userB, storage),
    ).not.toThrow();
  });

  it("garde la reprise apres une reponse perdue puis rejoue les memes identifiants", async () => {
    storage.setItem("thainaute.onboarding.v1", "preserve");
    const operation = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });
    const deleteAccount = vi
      .fn()
      .mockRejectedValueOnce(new Error("response lost"))
      .mockResolvedValueOnce(receipt);
    const purgeOwnerData = vi.fn().mockResolvedValue(undefined);
    const clearDeletedSession = vi.fn().mockResolvedValue(undefined);
    const dependencies = { deleteAccount, purgeOwnerData, storage };

    await expect(
      completePendingWebAccountDeletion({
        operation,
        clearDeletedSession,
        dependencies,
      }),
    ).rejects.toThrow("response lost");
    expect(readPendingWebAccountDeletion(storage)).toEqual(operation);
    expect(purgeOwnerData).not.toHaveBeenCalled();

    await expect(
      completePendingWebAccountDeletion({
        operation,
        clearDeletedSession,
        dependencies,
      }),
    ).resolves.toEqual(receipt);
    expect(deleteAccount).toHaveBeenNthCalledWith(1, operation, undefined);
    expect(deleteAccount).toHaveBeenNthCalledWith(2, operation, undefined);
    expect(purgeOwnerData).toHaveBeenCalledWith(ids.userA);
    expect(clearDeletedSession).toHaveBeenCalledWith(ids.userA);
    expect(readPendingWebAccountDeletion(storage)).toBeNull();
    expect(storage.getItem("thainaute.onboarding.v1")).toBe("preserve");
  });

  it("ne retire la reprise qu'apres une purge locale reussie", async () => {
    const operation = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });
    const deleteAccount = vi.fn().mockResolvedValue(receipt);
    const purgeOwnerData = vi
      .fn()
      .mockRejectedValueOnce(new Error("indexeddb unavailable"))
      .mockResolvedValueOnce(undefined);
    const clearDeletedSession = vi.fn().mockResolvedValue(undefined);
    const dependencies = { deleteAccount, purgeOwnerData, storage };

    await expect(
      completePendingWebAccountDeletion({
        operation,
        clearDeletedSession,
        dependencies,
      }),
    ).rejects.toThrow(WebAccountDeletionLocalStateError);
    expect(clearDeletedSession).not.toHaveBeenCalled();
    expect(readPendingWebAccountDeletion(storage)).toEqual(operation);

    await completePendingWebAccountDeletion({
      operation,
      clearDeletedSession,
      dependencies,
    });
    expect(deleteAccount).toHaveBeenCalledTimes(2);
    expect(clearDeletedSession).toHaveBeenCalledWith(ids.userA);
    expect(readPendingWebAccountDeletion(storage)).toBeNull();
  });

  it("conserve aussi la reprise si le nettoyage de la session locale echoue", async () => {
    const operation = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });
    const deleteAccount = vi.fn().mockResolvedValue(receipt);
    const purgeOwnerData = vi.fn().mockResolvedValue(undefined);
    const clearDeletedSession = vi
      .fn()
      .mockRejectedValueOnce(new Error("session storage unavailable"))
      .mockResolvedValueOnce(undefined);
    const dependencies = { deleteAccount, purgeOwnerData, storage };

    await expect(
      completePendingWebAccountDeletion({
        operation,
        clearDeletedSession,
        dependencies,
      }),
    ).rejects.toThrow(WebAccountDeletionLocalStateError);
    expect(readPendingWebAccountDeletion(storage)).toEqual(operation);

    await completePendingWebAccountDeletion({
      operation,
      clearDeletedSession,
      dependencies,
    });
    expect(deleteAccount).toHaveBeenCalledTimes(2);
    expect(purgeOwnerData).toHaveBeenCalledTimes(2);
    expect(readPendingWebAccountDeletion(storage)).toBeNull();
  });

  it("serialise deux onglets et ne genere qu'une continuation", async () => {
    let randomCalls = 0;
    const crypto = {
      ...cryptoPort,
      randomUUID: () => {
        randomCalls += 1;
        return randomCalls === 1
          ? ids.idempotency
          : "ffffffff-ffff-4fff-8fff-ffffffffffff";
      },
    };

    const [first, second] = await Promise.all([
      createPendingWebAccountDeletion(ids.userA, {
        crypto,
        lockManager,
        storage,
      }),
      createPendingWebAccountDeletion(ids.userA, {
        crypto,
        lockManager,
        storage,
      }),
    ]);

    expect(first).toEqual(second);
    expect(randomCalls).toBe(1);
    expect(readPendingWebAccountDeletion(storage)).toEqual(first);
  });

  it("refuse une nouvelle commande lorsqu'un tombstone existe", async () => {
    await expect(
      createPendingWebAccountDeletion(ids.userA, {
        crypto: cryptoPort,
        isOwnerDataTombstoned: async () => true,
        lockManager,
        storage,
      }),
    ).rejects.toThrow(WebAccountDeletionTombstonedError);
    expect(storage.getItem(WEB_ACCOUNT_DELETION_STORAGE_KEY)).toBeNull();
  });

  it("accepte la purge concurrente d'un autre onglet uniquement avec tombstone", async () => {
    const operation = await createPendingWebAccountDeletion(ids.userA, {
      crypto: cryptoPort,
      lockManager,
      storage,
    });
    let tombstoned = false;
    const dependencies = {
      deleteAccount: vi.fn().mockResolvedValue(receipt),
      purgeOwnerData: vi.fn().mockImplementation(async () => {
        tombstoned = true;
      }),
      isOwnerDataTombstoned: vi.fn(async () => tombstoned),
      storage,
    };
    const clearDeletedSession = vi.fn().mockResolvedValue(undefined);

    await expect(
      Promise.all([
        completePendingWebAccountDeletion({
          operation,
          clearDeletedSession,
          dependencies,
        }),
        completePendingWebAccountDeletion({
          operation,
          clearDeletedSession,
          dependencies,
        }),
      ]),
    ).resolves.toEqual([receipt, receipt]);
    expect(dependencies.deleteAccount).toHaveBeenCalledTimes(2);
    expect(readPendingWebAccountDeletion(storage)).toBeNull();
    expect(tombstoned).toBe(true);
  });
});
