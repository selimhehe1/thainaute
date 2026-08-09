import {
  applyProgressSnapshot,
  createAttemptOutboxSnapshot,
  type AttemptOutboxSnapshot,
  type ProgressSnapshotResponse,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  applyCount: 0,
  createClient: vi.fn(),
  getSession: vi.fn(),
  owners: [] as readonly unknown[],
  remote: { syncRevision: 0, states: [] } as ProgressSnapshotResponse,
  snapshot: null as AttemptOutboxSnapshot | null,
}));

vi.mock("@thainaute/sync", async () => {
  const actual =
    await vi.importActual<typeof import("@thainaute/sync")>("@thainaute/sync");
  return { ...actual, createSyncHttpClient: testState.createClient };
});
vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStore: class {
    public constructor(
      _database: SQLiteDatabase,
      owner: unknown = { kind: "anonymous" },
    ) {
      testState.owners = [...testState.owners, owner];
    }

    public read(): Promise<AttemptOutboxSnapshot> {
      if (testState.snapshot === null) {
        throw new Error("Snapshot de test absent.");
      }
      return Promise.resolve(testState.snapshot);
    }

    public applyProgressSnapshot(
      response: ProgressSnapshotResponse,
    ): Promise<AttemptOutboxSnapshot> {
      if (testState.snapshot === null) {
        throw new Error("Snapshot de test absent.");
      }
      testState.applyCount += 1;
      testState.snapshot = applyProgressSnapshot(testState.snapshot, response);
      return Promise.resolve(testState.snapshot);
    }
  },
}));
vi.mock("../lib/mobile-account-deletion", () => ({
  assertNoPendingMobileAccountDeletion: vi.fn(async () => undefined),
}));
vi.mock("../lib/mobile-connected-public-lesson", () => ({
  readMobileApiOrigin: vi.fn(() => "https://api.thainaute.test"),
}));
vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(async () => "a".repeat(64)),
}));
vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: vi.fn(() => ({
    auth: { getSession: testState.getSession },
  })),
}));

// Les doubles natifs doivent être installés avant de résoudre le module testé.
// eslint-disable-next-line import/first
import {
  readMobileLocalProgress,
  readMobileProgress,
  refreshMobileAccountProgress,
} from "../lib/mobile-account-progress";

const userA = "00000000-0000-4000-8000-000000000001";
const userB = "00000000-0000-4000-8000-000000000002";
const database = {} as SQLiteDatabase;

function session(userId: string) {
  return {
    access_token: "token-for-tests",
    user: { id: userId, is_anonymous: false },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  testState.applyCount = 0;
  testState.owners = [];
  testState.remote = { syncRevision: 0, states: [] };
  testState.snapshot = createAttemptOutboxSnapshot({
    kind: "account",
    userId: userA,
  });
  testState.getSession.mockResolvedValue({
    data: { session: session(userA) },
    error: null,
  });
  testState.createClient.mockReturnValue({
    getProgressSnapshot: vi.fn(async () => testState.remote),
  });
});

describe("progression mobile connectée", () => {
  it("hydrate le snapshot serveur dans le namespace du compte", async () => {
    testState.remote = { syncRevision: 7, states: [] };

    const result = await refreshMobileAccountProgress({
      database,
      userId: userA.toUpperCase(),
    });

    expect(result.syncRevision).toBe(7);
    expect(testState.applyCount).toBe(1);
    expect(testState.owners).toContainEqual({
      kind: "account",
      userId: userA,
    });
    expect(testState.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: "https://api.thainaute.test",
        expectedUserId: userA,
      }),
    );
  });

  it("revient à la projection locale si le réseau est indisponible", async () => {
    const remoteClient = {
      getProgressSnapshot: vi.fn(async () => {
        throw new Error("offline");
      }),
    };
    testState.createClient.mockReturnValue(remoteClient);

    const result = await readMobileProgress({ database, userId: userA });

    expect(result.source).toBe("local");
    expect(result.snapshot.syncRevision).toBe(0);
    expect(testState.applyCount).toBe(0);
  });

  it("ne lit pas les données du compte A avec la session du compte B", async () => {
    testState.getSession.mockResolvedValue({
      data: { session: session(userB) },
      error: null,
    });

    const result = await readMobileProgress({ database, userId: userA });

    expect(result.source).toBe("local");
    expect(testState.createClient).not.toHaveBeenCalled();
    expect(testState.applyCount).toBe(0);
  });

  it("isole le journal anonyme des namespaces compte", async () => {
    await readMobileLocalProgress({ database, userId: null });
    await readMobileLocalProgress({ database, userId: userB });

    expect(testState.owners).toEqual([
      { kind: "anonymous" },
      { kind: "account", userId: userB },
    ]);
  });
});
