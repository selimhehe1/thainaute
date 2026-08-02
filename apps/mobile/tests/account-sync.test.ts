import {
  ackContentReport,
  createAttemptOutboxSnapshot,
  createContentReportOutbox,
  enqueueContentReport,
  rejectContentReport,
  SyncHttpApiError,
  SyncHttpTransportError,
  type AuthenticatedSyncSession,
  type AttemptOutboxOwner,
  type ContentReportOutboxSnapshot,
} from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  device: "10000000-0000-4000-8000-000000000001",
  fusion: "10000000-0000-4000-8000-000000000002",
  user: "20000000-0000-4000-8000-000000000001",
} as const;

const testState = vi.hoisted(() => ({
  calls: [] as string[],
  completeAnonymousFusion: vi.fn(),
  createSyncHttpClient: vi.fn(
    (_options: {
      getSession: () => Promise<AuthenticatedSyncSession | null>;
    }) => ({}),
  ),
  ackContentReport: vi.fn(),
  getSession: vi.fn(),
  randomUUID: vi.fn(),
  readContentReports: vi.fn(),
  readFusionMarker: vi.fn(),
  rejectContentReport: vi.fn(),
  sendContentReport: vi.fn(),
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
  MobileAttemptOutboxStorageError: class extends Error {},
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
      return testState.readFusionMarker();
    }

    async completeAnonymousFusion(completedAt: string) {
      testState.calls.push("complete-fusion");
      return testState.completeAnonymousFusion(completedAt);
    }

    async read() {
      testState.calls.push(
        this.owner.kind === "account" ? "read-account" : "read-anonymous",
      );
      return createAttemptOutboxSnapshot(this.owner);
    }

    async readContentReports() {
      testState.calls.push("read-content-reports");
      return testState.readContentReports();
    }

    async ackContentReport(entry: unknown, response: unknown) {
      testState.calls.push("ack-content-report");
      return testState.ackContentReport(entry, response);
    }

    async rejectContentReport(entry: unknown, rejection: unknown) {
      testState.calls.push("reject-content-report");
      return testState.rejectContentReport(entry, rejection);
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

let contentReports: ContentReportOutboxSnapshot;

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
    contentReports = createContentReportOutbox();
    testState.readFusionMarker.mockReset().mockResolvedValue(null);
    testState.completeAnonymousFusion.mockReset();
    testState.readContentReports
      .mockReset()
      .mockImplementation(async () => contentReports);
    testState.ackContentReport
      .mockReset()
      .mockImplementation(async (entry, response) => {
        contentReports = ackContentReport(contentReports, entry, response);
        return contentReports;
      });
    testState.rejectContentReport
      .mockReset()
      .mockImplementation(async (entry, rejection) => {
        contentReports = rejectContentReport(contentReports, entry, rejection);
        return contentReports;
      });
    testState.sendContentReport
      .mockReset()
      .mockResolvedValue({ status: "received" });
    testState.createSyncHttpClient
      .mockReset()
      .mockImplementation((options) => ({
        sendContentReport: async (entry: unknown) => {
          if ((await options.getSession()) === null) {
            throw new Error("session changed before report request");
          }
          return testState.sendContentReport(entry);
        },
      }));
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
      "read-content-reports",
    ]);
  });

  it("vide aussi la file de signalements après la progression", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "tone" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);

    const result = await synchronizeMobileAccount({
      database: {} as never,
      userId: ids.user,
      startAnonymousFusion: false,
      assertAccountWritable: async () => undefined,
    });

    expect(result.contentReportsSent).toBe(1);
    expect(result.contentReportsPending).toBe(0);
    expect(result.contentReportsRejected).toBe(0);
    expect(contentReports.entries).toEqual([]);
    expect(testState.sendContentReport).toHaveBeenCalledWith(report);
    expect(
      testState.synchronizeAttemptOutbox.mock.invocationCallOrder[0],
    ).toBeLessThan(
      testState.sendContentReport.mock.invocationCallOrder[0] ??
        Number.MAX_SAFE_INTEGER,
    );
    expect(
      testState.sendContentReport.mock.invocationCallOrder[0],
    ).toBeLessThan(
      testState.ackContentReport.mock.invocationCallOrder[0] ??
        Number.MAX_SAFE_INTEGER,
    );
  });

  it("n'acquitte pas un signalement de A après une bascule vers B", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "audio" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);
    let sessionRead = 0;
    testState.getSession.mockImplementation(async () => {
      sessionRead += 1;
      const userId =
        sessionRead >= 5 ? "20000000-0000-4000-8000-000000000002" : ids.user;
      return {
        data: {
          session: {
            access_token: `access-${userId}`,
            user: { id: userId, is_anonymous: false },
          },
        },
        error: null,
      };
    });

    await expect(
      synchronizeMobileAccount({
        database: {} as never,
        userId: ids.user,
        startAnonymousFusion: false,
        assertAccountWritable: async () => undefined,
      }),
    ).rejects.toThrow("session du compte a changé");

    expect(testState.sendContentReport).toHaveBeenCalledOnce();
    expect(testState.ackContentReport).not.toHaveBeenCalled();
    expect(contentReports.entries).toEqual([report]);
  });

  it("conserve les reports si leur endpoint distant est indisponible sans annuler la progression", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "meaning" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);
    testState.sendContentReport.mockRejectedValue(
      new SyncHttpTransportError("content_report"),
    );

    const result = await synchronizeMobileAccount({
      database: {} as never,
      userId: ids.user,
      startAnonymousFusion: false,
      assertAccountWritable: async () => undefined,
    });

    expect(result.batchesSent).toBe(0);
    expect(result.contentReportsSent).toBe(0);
    expect(result.contentReportsPending).toBe(1);
    expect(result.contentReportsRejected).toBe(0);
    expect(testState.ackContentReport).not.toHaveBeenCalled();
    expect(contentReports.entries).toEqual([report]);
    expect(contentReports.rejection).toBeNull();
  });

  it("traite aussi le mode report serveur désactivé comme une livraison différée", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "naturalness" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);
    testState.sendContentReport.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 503,
        code: "database_unavailable",
      }),
    );

    const result = await synchronizeMobileAccount({
      database: {} as never,
      userId: ids.user,
      startAnonymousFusion: false,
      assertAccountWritable: async () => undefined,
    });

    expect(result.contentReportsSent).toBe(0);
    expect(result.contentReportsPending).toBe(1);
    expect(result.contentReportsRejected).toBe(0);
    expect(contentReports.entries).toEqual([report]);
    expect(contentReports.rejection).toBeNull();
  });

  it("termine la fusion avant de différer un report 422 permanent", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "orthography" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);
    testState.readFusionMarker.mockResolvedValue({
      status: "awaiting_server_ack",
      targetUserId: ids.user,
    });
    testState.completeAnonymousFusion.mockResolvedValue({
      marker: { eventIds: [] },
      accountSnapshot: createAttemptOutboxSnapshot({
        kind: "account",
        userId: ids.user,
      }),
      anonymousSnapshot: createAttemptOutboxSnapshot(),
    });
    testState.sendContentReport.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 422,
        code: "invalid_request",
      }),
    );

    const result = await synchronizeMobileAccount({
      database: {} as never,
      userId: ids.user,
      startAnonymousFusion: false,
      assertAccountWritable: async () => undefined,
    });

    expect(result.fusionCompleted).toBe(true);
    expect(result.contentReportsSent).toBe(0);
    expect(result.contentReportsPending).toBe(0);
    expect(result.contentReportsRejected).toBe(1);
    expect(
      testState.completeAnonymousFusion.mock.invocationCallOrder[0],
    ).toBeLessThan(
      testState.sendContentReport.mock.invocationCallOrder[0] ??
        Number.MAX_SAFE_INTEGER,
    );
    expect(contentReports.entries).toEqual([report]);
    expect(contentReports.rejection).toMatchObject({
      entry: report,
      reason: "invalid_request",
    });
  });

  it("propage le tombstone apparu pendant le réseau sans acquitter le report", async () => {
    const report = {
      idempotencyKey: "30000000-0000-4000-8000-000000000001",
      body: {
        contentVersionId: "10000000-0000-4000-8000-000000000002",
        exerciseId: "10000000-0000-4000-8000-000000000004",
        category: "register" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    contentReports = enqueueContentReport(contentReports, report);
    const assertAccountWritable = vi.fn(async () => {
      if (testState.sendContentReport.mock.calls.length > 0) {
        throw new Error("account tombstoned");
      }
    });

    await expect(
      synchronizeMobileAccount({
        database: {} as never,
        userId: ids.user,
        startAnonymousFusion: false,
        assertAccountWritable,
      }),
    ).rejects.toThrow("account tombstoned");

    expect(testState.sendContentReport).toHaveBeenCalledOnce();
    expect(testState.ackContentReport).not.toHaveBeenCalled();
    expect(contentReports.entries).toEqual([report]);
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
      "read-content-reports",
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
