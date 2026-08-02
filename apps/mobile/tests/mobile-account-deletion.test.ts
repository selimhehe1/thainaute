import {
  SyncHttpTransportError,
  type SyncHttpClientOptions,
} from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  idempotency: "10000000-0000-4000-8000-000000000001",
  receipt: "10000000-0000-4000-8000-000000000002",
  userA: "20000000-0000-4000-8000-000000000001",
  userB: "20000000-0000-4000-8000-000000000002",
} as const;

const receipt = {
  format: "thainaute.account-deletion-receipt/v1" as const,
  receiptId: ids.receipt,
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true as const,
};

const testState = vi.hoisted(() => ({
  clearSession: vi.fn(() => Promise.resolve()),
  createSyncHttpClient: vi.fn(),
  deleteItem: vi.fn(),
  forcePurge: vi.fn(() => Promise.resolve()),
  getItem: vi.fn(),
  getRandomBytes: vi.fn(),
  getSession: vi.fn(),
  purgeExport: vi.fn(),
  randomUUID: vi.fn(),
  setItem: vi.fn(),
  stored: null as string | null,
}));

vi.mock("@thainaute/sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@thainaute/sync")>();
  return { ...actual, createSyncHttpClient: testState.createSyncHttpClient };
});

vi.mock("expo-crypto", () => ({
  getRandomBytesAsync: testState.getRandomBytes,
  randomUUID: testState.randomUUID,
}));

vi.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "when-unlocked-this-device-only",
  getItemAsync: testState.getItem,
  setItemAsync: testState.setItem,
  deleteItemAsync: testState.deleteItem,
}));

vi.mock("../lib/account-sync", () => ({
  forcePurgeDeletedMobileAccountData: testState.forcePurge,
}));

vi.mock("../lib/mobile-account-export", () => ({
  purgeMobileAccountExportCache: testState.purgeExport,
}));

vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: () => ({
    auth: { getSession: testState.getSession },
  }),
}));

// Les doubles natifs doivent être installés avant la résolution du module.
// eslint-disable-next-line import/first
import {
  assertNoPendingMobileAccountDeletion,
  createMobileAccountDeletionOperation,
  MobileAccountDeletionError,
  parseMobileAccountDeletionOperation,
  readMobileAccountDeletionOperation,
  resumeMobileAccountDeletion,
  withNoPendingMobileAccountDeletion,
} from "../lib/mobile-account-deletion";

function persistedOperation() {
  if (testState.stored === null) throw new Error("Opération absente");
  return JSON.parse(testState.stored) as Record<string, unknown>;
}

describe("suppression de compte mobile reprise depuis le trousseau", () => {
  beforeEach(() => {
    testState.stored = null;
    testState.clearSession.mockClear();
    testState.createSyncHttpClient.mockReset();
    testState.deleteItem.mockReset().mockImplementation(() => {
      testState.stored = null;
      return Promise.resolve();
    });
    testState.forcePurge.mockReset().mockResolvedValue(undefined);
    testState.getItem
      .mockReset()
      .mockImplementation(() => Promise.resolve(testState.stored));
    testState.getRandomBytes
      .mockReset()
      .mockResolvedValue(Uint8Array.from({ length: 32 }, (_, index) => index));
    testState.getSession.mockReset().mockResolvedValue({
      data: { session: null },
      error: null,
    });
    testState.purgeExport.mockReset();
    testState.randomUUID.mockReset().mockReturnValue(ids.idempotency);
    testState.setItem.mockReset().mockImplementation((_key, value) => {
      testState.stored = String(value);
      return Promise.resolve();
    });
    process.env.EXPO_PUBLIC_API_URL = "https://api.test.invalid";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("génère 32 octets CSPRNG, un UUID et une forme stricte versionnée", async () => {
    const operation = await createMobileAccountDeletionOperation(ids.userA);

    expect(testState.getRandomBytes).toHaveBeenCalledWith(32);
    expect(testState.randomUUID).toHaveBeenCalledOnce();
    expect(operation).toMatchObject({
      format: "thainaute.mobile-account-deletion-operation/v1",
      status: "awaiting_server_receipt",
      expectedUserId: ids.userA,
      idempotencyKey: ids.idempotency,
    });
    expect(operation.continuationSecret).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(testState.setItem).toHaveBeenCalledWith(
      "thainaute.mobile-account-deletion-operation.v1",
      expect.any(String),
      { keychainAccessible: "when-unlocked-this-device-only" },
    );
    await expect(readMobileAccountDeletionOperation()).resolves.toEqual(
      operation,
    );

    expect(() =>
      parseMobileAccountDeletionOperation({ ...operation, extra: true }),
    ).toThrow(MobileAccountDeletionError);
    expect(testState.deleteItem).not.toHaveBeenCalled();
  });

  it("rejoue les mêmes secrets sans session après une réponse perdue", async () => {
    await createMobileAccountDeletionOperation(ids.userA);
    const headers: unknown[] = [];
    const observedSessions: unknown[] = [];
    let attempt = 0;
    testState.createSyncHttpClient.mockImplementation(
      (options: SyncHttpClientOptions) => ({
        deleteAccount: async (input: unknown) => {
          headers.push(input);
          observedSessions.push(await options.getSession());
          attempt += 1;
          if (attempt === 1) {
            throw new SyncHttpTransportError("account_deletion");
          }
          return receipt;
        },
      }),
    );

    await expect(
      resumeMobileAccountDeletion({
        database: {} as never,
        clearDeletedSession: testState.clearSession,
      }),
    ).rejects.toBeInstanceOf(SyncHttpTransportError);
    expect(persistedOperation().status).toBe("awaiting_server_receipt");
    expect(testState.forcePurge).not.toHaveBeenCalled();

    await expect(
      resumeMobileAccountDeletion({
        database: {} as never,
        clearDeletedSession: testState.clearSession,
      }),
    ).resolves.toMatchObject({ status: "completed", receipt });

    expect(headers).toHaveLength(2);
    expect(headers[1]).toEqual(headers[0]);
    expect(observedSessions).toEqual([null, null]);
    expect(testState.forcePurge).toHaveBeenCalledWith({}, ids.userA);
    expect(testState.purgeExport).toHaveBeenCalledOnce();
    expect(testState.clearSession).toHaveBeenCalledWith(ids.userA);
    expect(testState.stored).toBeNull();
  });

  it("conserve le reçu si la purge locale échoue puis ne rappelle pas le serveur", async () => {
    await createMobileAccountDeletionOperation(ids.userA);
    const deleteAccount = vi.fn(() => Promise.resolve(receipt));
    testState.createSyncHttpClient.mockReturnValue({ deleteAccount });
    testState.forcePurge
      .mockRejectedValueOnce(new Error("sqlite unavailable"))
      .mockResolvedValueOnce(undefined);

    await expect(
      resumeMobileAccountDeletion({
        database: {} as never,
        clearDeletedSession: testState.clearSession,
      }),
    ).rejects.toThrow("sqlite unavailable");
    expect(persistedOperation()).toMatchObject({
      status: "server_deleted",
      receipt,
    });
    expect(testState.deleteItem).not.toHaveBeenCalled();

    await expect(
      resumeMobileAccountDeletion({
        database: {} as never,
        clearDeletedSession: testState.clearSession,
      }),
    ).resolves.toMatchObject({ status: "completed" });
    expect(deleteAccount).toHaveBeenCalledOnce();
    expect(testState.forcePurge).toHaveBeenCalledTimes(2);
    expect(testState.stored).toBeNull();
  });

  it("n'utilise pas la session d'un autre sujet lors d'une reprise", async () => {
    await createMobileAccountDeletionOperation(ids.userA);
    testState.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "account-b-token",
          user: { id: ids.userB, is_anonymous: false },
        },
      },
      error: null,
    });
    const observedSessions: unknown[] = [];
    testState.createSyncHttpClient.mockImplementation(
      (options: SyncHttpClientOptions) => ({
        deleteAccount: async () => {
          observedSessions.push(await options.getSession());
          return receipt;
        },
      }),
    );

    await resumeMobileAccountDeletion({
      database: {} as never,
      clearDeletedSession: testState.clearSession,
    });

    expect(observedSessions).toEqual([null]);
    expect(testState.clearSession).toHaveBeenCalledWith(ids.userA);
  });

  it("refuse de remplacer la reprise de A par une commande pour B", async () => {
    await createMobileAccountDeletionOperation(ids.userA);
    const before = testState.stored;

    await expect(
      createMobileAccountDeletionOperation(ids.userB),
    ).rejects.toMatchObject({ code: "pending_subject_changed" });

    expect(testState.stored).toBe(before);
    expect(testState.getRandomBytes).toHaveBeenCalledOnce();
  });

  it("bloque uniquement les nouvelles mutations du sujet en suppression", async () => {
    await createMobileAccountDeletionOperation(ids.userA);

    await expect(
      assertNoPendingMobileAccountDeletion(ids.userA),
    ).rejects.toMatchObject({ code: "deletion_in_progress" });
    await expect(
      assertNoPendingMobileAccountDeletion(ids.userB),
    ).resolves.toBeUndefined();
  });

  it("sérialise une mutation réelle avant la création concurrente de la suppression", async () => {
    let markStarted!: () => void;
    let releaseMutation!: () => void;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      releaseMutation = resolve;
    });
    const mutation = withNoPendingMobileAccountDeletion(ids.userA, async () => {
      markStarted();
      await gate;
    });
    await started;

    const deletion = createMobileAccountDeletionOperation(ids.userA);
    await Promise.resolve();
    await Promise.resolve();
    expect(testState.setItem).not.toHaveBeenCalled();

    releaseMutation();
    await mutation;
    await expect(deletion).resolves.toMatchObject({
      expectedUserId: ids.userA,
    });
  });

  it("n'envoie rien si le générateur cryptographique natif échoue", async () => {
    testState.getRandomBytes.mockRejectedValue(new Error("native unavailable"));

    await expect(
      createMobileAccountDeletionOperation(ids.userA),
    ).rejects.toMatchObject({ code: "secure_random_unavailable" });

    expect(testState.stored).toBeNull();
    expect(testState.setItem).not.toHaveBeenCalled();
    expect(testState.createSyncHttpClient).not.toHaveBeenCalled();
  });

  it("partage une seule reprise entre le bootstrap et l'Ã©cran", async () => {
    await createMobileAccountDeletionOperation(ids.userA);
    let releaseReceipt!: (value: typeof receipt) => void;
    const deleteAccount = vi.fn(
      () =>
        new Promise<typeof receipt>((resolve) => {
          releaseReceipt = resolve;
        }),
    );
    testState.createSyncHttpClient.mockReturnValue({ deleteAccount });

    const fromBootstrap = resumeMobileAccountDeletion({
      database: {} as never,
      clearDeletedSession: testState.clearSession,
    });
    const fromScreen = resumeMobileAccountDeletion({
      database: {} as never,
      clearDeletedSession: testState.clearSession,
    });

    expect(fromScreen).toBe(fromBootstrap);
    await Promise.resolve();
    await Promise.resolve();
    expect(deleteAccount).toHaveBeenCalledOnce();
    releaseReceipt(receipt);
    await expect(Promise.all([fromBootstrap, fromScreen])).resolves.toEqual([
      expect.objectContaining({ status: "completed" }),
      expect.objectContaining({ status: "completed" }),
    ]);
    expect(testState.forcePurge).toHaveBeenCalledOnce();
    expect(testState.clearSession).toHaveBeenCalledOnce();
  });
});
