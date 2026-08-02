import {
  createAttemptOutboxSnapshot,
  type AttemptOutboxOwner,
} from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  device: "10000000-0000-4000-8000-000000000001",
  fusion: "10000000-0000-4000-8000-000000000002",
  user: "20000000-0000-4000-8000-000000000001",
} as const;

const testState = vi.hoisted(() => ({
  calls: [] as string[],
  createSyncHttpClient: vi.fn(() => ({})),
  getSession: vi.fn(),
  randomUUID: vi.fn(),
  synchronizeAttemptOutbox: vi.fn(),
}));

vi.mock("@thainaute/sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@thainaute/sync")>();
  return {
    ...actual,
    createSyncHttpClient: testState.createSyncHttpClient,
    synchronizeAttemptOutbox: testState.synchronizeAttemptOutbox,
  };
});

vi.mock("expo-constants", () => ({
  default: { expoConfig: { version: "0.0.1-test" } },
}));
vi.mock("expo-crypto", () => ({ randomUUID: testState.randomUUID }));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(() => Promise.resolve("11".repeat(32))),
}));
vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: () => ({
    auth: { getSession: testState.getSession },
  }),
}));

vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStore: class {
    readonly owner: AttemptOutboxOwner;
    readonly namespace: "learning" | "demo";

    constructor(
      _database: unknown,
      owner: AttemptOutboxOwner = { kind: "anonymous" },
      namespace: "learning" | "demo" = "learning",
    ) {
      this.owner = owner;
      this.namespace = namespace;
    }

    async migrateLegacyFixtureAttemptsToDemo() {
      testState.calls.push(`migrate:${this.namespace}`);
      return createAttemptOutboxSnapshot();
    }

    async getOrCreateAccountDeviceId() {
      testState.calls.push("device");
      return ids.device;
    }

    async startAnonymousFusion() {
      testState.calls.push("start-fusion");
      return null;
    }

    async resumeAnonymousFusion() {
      testState.calls.push("resume-fusion");
      return null;
    }

    async readFusionMarker() {
      return null;
    }

    async read() {
      testState.calls.push(
        this.owner.kind === "account" ? "read-account" : "read-anonymous",
      );
      return createAttemptOutboxSnapshot(this.owner);
    }

    async purgeOwnerData() {
      testState.calls.push(
        this.owner.kind === "account"
          ? `purge-account:${this.owner.userId}`
          : "purge-anonymous",
      );
    }

    async tombstoneAndPurgeAccountData() {
      testState.calls.push(
        this.owner.kind === "account"
          ? `tombstone-account:${this.owner.userId}`
          : "tombstone-anonymous",
      );
    }

    async isAccountTombstoned() {
      testState.calls.push("read-tombstone");
      return true;
    }

    async purgeAccountDataIfSettled() {
      return true;
    }
  },
}));

// eslint-disable-next-line import/first
import {
  discardMobileAnonymousProgress,
  forcePurgeDeletedMobileAccountData,
  isDeletedMobileAccountTombstoned,
  readMobileAccountLocalState,
  synchronizeMobileAccount,
} from "../lib/account-sync";

describe("orchestration de la synchronisation mobile", () => {
  beforeEach(() => {
    testState.calls.splice(0);
    testState.randomUUID
      .mockReset()
      .mockReturnValueOnce(ids.device)
      .mockReturnValue(ids.fusion);
    testState.getSession.mockReset().mockResolvedValue({
      data: {
        session: {
          access_token: "unit-test-access",
          user: { id: ids.user, is_anonymous: false },
        },
      },
      error: null,
    });
    testState.synchronizeAttemptOutbox
      .mockReset()
      .mockImplementation(async () => {
        testState.calls.push("synchronize");
        return {
          snapshot: createAttemptOutboxSnapshot({
            kind: "account",
            userId: ids.user,
          }),
          batchesSent: 0,
        };
      });
    process.env.EXPO_PUBLIC_API_URL = "https://api.test.invalid";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("migre le journal brut avant une fusion lancée depuis le compte", async () => {
    await synchronizeMobileAccount({
      database: {} as never,
      userId: ids.user,
      startAnonymousFusion: true,
      assertAccountWritable: async () => undefined,
    });

    expect(testState.calls).toEqual([
      "migrate:demo",
      "device",
      "start-fusion",
      "synchronize",
    ]);
  });

  it("ferme la synchronisation avant toute mutation si une suppression existe", async () => {
    const deletionGuard = vi.fn(async () => {
      throw new Error("account deletion in progress");
    });

    await expect(
      synchronizeMobileAccount({
        database: {} as never,
        userId: ids.user,
        startAnonymousFusion: false,
        assertAccountWritable: deletionGuard,
      }),
    ).rejects.toThrow("account deletion in progress");

    expect(deletionGuard).toHaveBeenCalledOnce();
    expect(testState.calls).toEqual([]);
    expect(testState.getSession).not.toHaveBeenCalled();
  });

  it("migre aussi avant la lecture ou l'abandon explicite du progrès anonyme", async () => {
    await readMobileAccountLocalState({} as never, ids.user);
    expect(testState.calls[0]).toBe("migrate:demo");
    expect(testState.calls).toEqual([
      "migrate:demo",
      "read-account",
      "read-anonymous",
    ]);

    testState.calls.splice(0);
    await discardMobileAnonymousProgress({} as never);
    expect(testState.calls).toEqual(["migrate:demo", "purge-anonymous"]);
  });

  it("force uniquement la purge du namespace du compte supprimé", async () => {
    await forcePurgeDeletedMobileAccountData({} as never, ids.user);

    expect(testState.calls).toEqual([`tombstone-account:${ids.user}`]);
    expect(testState.calls).not.toContain("purge-anonymous");
  });

  it("relit le tombstone du sujet supprimé", async () => {
    await expect(
      isDeletedMobileAccountTombstoned({} as never, ids.user),
    ).resolves.toBe(true);
    expect(testState.calls).toEqual(["read-tombstone"]);
  });
});
