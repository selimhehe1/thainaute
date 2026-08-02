import {
  ackContentReport,
  createContentReportOutbox,
  discardRejectedContentReport,
  enqueueContentReport,
  rejectContentReport,
  SyncHttpApiError,
  type AuthenticatedSyncSession,
  type ContentReportOutboxSnapshot,
} from "@thainaute/sync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "20000000-0000-4000-8000-000000000001",
  userB: "20000000-0000-4000-8000-000000000002",
  version: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000004",
  report: "30000000-0000-4000-8000-000000000001",
} as const;

const testState = vi.hoisted(() => ({
  ack: vi.fn(),
  assertNoDeletion: vi.fn(),
  createSyncHttpClient: vi.fn(),
  enqueue: vi.fn(),
  discard: vi.fn(),
  getSession: vi.fn(),
  randomUUID: vi.fn(),
  read: vi.fn(),
  reject: vi.fn(),
  sendContentReport: vi.fn(),
}));

vi.mock("@thainaute/sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@thainaute/sync")>();
  return { ...actual, createSyncHttpClient: testState.createSyncHttpClient };
});

vi.mock("expo-crypto", () => ({ randomUUID: testState.randomUUID }));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(() => Promise.resolve("11".repeat(32))),
}));
vi.mock("../lib/mobile-account-deletion", () => ({
  assertNoPendingMobileAccountDeletion: testState.assertNoDeletion,
}));
vi.mock("../lib/supabase-auth", () => ({
  getMobileSupabaseAuthClient: () => ({
    auth: { getSession: testState.getSession },
  }),
}));
vi.mock("../lib/attempt-outbox-store", () => ({
  MobileAttemptOutboxStorageError: class extends Error {},
  MobileAttemptOutboxStore: class {
    readContentReports = testState.read;
    enqueueContentReport = testState.enqueue;
    ackContentReport = testState.ack;
    rejectContentReport = testState.reject;
    discardRejectedContentReport = testState.discard;
  },
}));

// Les adaptateurs doivent être remplacés avant de résoudre l'orchestrateur.
// eslint-disable-next-line import/first
import {
  discardRejectedMobileContentReport,
  submitMobileContentReport,
  synchronizeMobileContentReports,
} from "../lib/content-report";

function durableSession(userId: string = ids.userA): AuthenticatedSyncSession {
  return { accessToken: `access-${userId}`, userId };
}

let snapshot: ContentReportOutboxSnapshot;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.EXPO_PUBLIC_API_URL = "https://api.test.invalid";
  snapshot = createContentReportOutbox();
  testState.randomUUID.mockReturnValue(ids.report);
  testState.assertNoDeletion.mockResolvedValue(undefined);
  testState.getSession.mockResolvedValue({
    data: {
      session: {
        access_token: durableSession().accessToken,
        user: { id: ids.userA, is_anonymous: false },
      },
    },
    error: null,
  });
  testState.read.mockImplementation(async () => snapshot);
  testState.enqueue.mockImplementation(async (entry) => {
    snapshot = enqueueContentReport(snapshot, entry);
    return snapshot;
  });
  testState.ack.mockImplementation(async (entry, response) => {
    snapshot = ackContentReport(snapshot, entry, response);
    return snapshot;
  });
  testState.reject.mockImplementation(async (entry, rejection) => {
    snapshot = rejectContentReport(snapshot, entry, rejection);
    return snapshot;
  });
  testState.discard.mockImplementation(async (rejection) => {
    snapshot = discardRejectedContentReport(snapshot, rejection);
    return snapshot;
  });
  testState.sendContentReport.mockResolvedValue({ status: "received" });
  testState.createSyncHttpClient.mockImplementation((options) => ({
    sendContentReport: async (entry: unknown) => {
      if ((await options.getSession()) === null) {
        throw new Error("session changed before request");
      }
      return testState.sendContentReport(entry);
    },
  }));
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_API_URL;
});

describe("signalement structuré mobile", () => {
  it("persiste avant le réseau puis acquitte seulement la réponse validée", async () => {
    const result = await submitMobileContentReport({
      database: {} as never,
      expectedUserId: ids.userA,
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "tone",
      attemptDelivery: true,
      createdAt: "2026-08-02T04:00:00.000Z",
    });

    expect(result).toEqual({ status: "sent", pendingCount: 0 });
    expect(testState.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: ids.report,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "tone",
          platform: "android",
        },
      }),
    );
    expect(testState.enqueue.mock.invocationCallOrder[0]).toBeLessThan(
      testState.sendContentReport.mock.invocationCallOrder[0] ??
        Number.MAX_SAFE_INTEGER,
    );
    expect(
      testState.sendContentReport.mock.invocationCallOrder[0],
    ).toBeLessThan(
      testState.ack.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it("conserve hors ligne sans créer de client HTTP", async () => {
    const result = await submitMobileContentReport({
      database: {} as never,
      expectedUserId: ids.userA,
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "audio",
      attemptDelivery: false,
      createdAt: "2026-08-02T04:00:00.000Z",
    });

    expect(result).toEqual({
      status: "queued",
      pendingCount: 1,
      reason: "offline",
    });
    expect(snapshot.entries).toHaveLength(1);
    expect(testState.createSyncHttpClient).not.toHaveBeenCalled();
    expect(testState.sendContentReport).not.toHaveBeenCalled();
  });

  it("n'acquitte jamais la file A après une bascule de session vers B", async () => {
    let sessionRead = 0;
    testState.getSession.mockImplementation(async () => {
      sessionRead += 1;
      const userId = sessionRead >= 4 ? ids.userB : ids.userA;
      return {
        data: {
          session: {
            access_token: durableSession(userId).accessToken,
            user: { id: userId, is_anonymous: false },
          },
        },
        error: null,
      };
    });

    const result = await submitMobileContentReport({
      database: {} as never,
      expectedUserId: ids.userA,
      contentVersionId: ids.version,
      exerciseId: ids.exercise,
      category: "meaning",
      attemptDelivery: true,
      createdAt: "2026-08-02T04:00:00.000Z",
    });

    expect(result).toEqual({
      status: "queued",
      pendingCount: 1,
      reason: "delivery_failed",
    });
    expect(testState.sendContentReport).toHaveBeenCalledOnce();
    expect(testState.ack).not.toHaveBeenCalled();
    expect(snapshot.entries).toHaveLength(1);
  });

  it("rejoue plusieurs signalements dans l'ordre FIFO", async () => {
    const first = {
      idempotencyKey: ids.report,
      body: {
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
        category: "pronunciation" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    const second = {
      ...first,
      idempotencyKey: "30000000-0000-4000-8000-000000000002",
      body: { ...first.body, category: "register" as const },
      createdAt: "2026-08-02T04:00:01.000Z",
    };
    snapshot = enqueueContentReport(
      enqueueContentReport(createContentReportOutbox(), first),
      second,
    );

    await expect(
      synchronizeMobileContentReports({
        database: {} as never,
        expectedUserId: ids.userA,
      }),
    ).resolves.toEqual({
      acknowledgedIdempotencyKeys: [
        first.idempotencyKey,
        second.idempotencyKey,
      ],
      pendingCount: 0,
      rejectedHead: null,
    });
    expect(
      testState.sendContentReport.mock.calls.map(([entry]) => entry),
    ).toEqual([first, second]);
  });

  it.each([
    [409, "idempotency_key_reused"],
    [422, "invalid_request"],
  ] as const)(
    "conserve le refus permanent %s/%s et bloque la suite sans la perdre",
    async (status, code) => {
      const first = {
        idempotencyKey: ids.report,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "tone" as const,
          platform: "android" as const,
        },
        createdAt: "2026-08-02T04:00:00.000Z",
      };
      const second = {
        ...first,
        idempotencyKey: "30000000-0000-4000-8000-000000000002",
        createdAt: "2026-08-02T04:00:01.000Z",
      };
      snapshot = enqueueContentReport(
        enqueueContentReport(createContentReportOutbox(), first),
        second,
      );
      testState.sendContentReport.mockRejectedValue(
        new SyncHttpApiError({
          endpoint: "content_report",
          status,
          code,
        }),
      );

      const result = await synchronizeMobileContentReports({
        database: {} as never,
        expectedUserId: ids.userA,
      });
      expect(result).toMatchObject({
        acknowledgedIdempotencyKeys: [],
        pendingCount: 1,
        rejectedHead: {
          entry: first,
          reason: code,
        },
      });
      expect(testState.sendContentReport).toHaveBeenCalledOnce();
      expect(snapshot.entries).toEqual([first, second]);
      expect(snapshot.rejection).toEqual(result.rejectedHead);
    },
  );

  it("retire le refus exact puis reprend la suite FIFO", async () => {
    const first = {
      idempotencyKey: ids.report,
      body: {
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
        category: "tone" as const,
        platform: "android" as const,
      },
      createdAt: "2026-08-02T04:00:00.000Z",
    };
    const second = {
      ...first,
      idempotencyKey: "30000000-0000-4000-8000-000000000002",
      createdAt: "2026-08-02T04:00:01.000Z",
    };
    snapshot = enqueueContentReport(
      enqueueContentReport(createContentReportOutbox(), first),
      second,
    );
    testState.sendContentReport.mockRejectedValue(
      new SyncHttpApiError({
        endpoint: "content_report",
        status: 422,
        code: "invalid_request",
      }),
    );
    const blocked = await synchronizeMobileContentReports({
      database: {} as never,
      expectedUserId: ids.userA,
    });
    if (blocked.rejectedHead === null) throw new Error("Expected rejection.");
    testState.sendContentReport.mockReset().mockResolvedValue({
      status: "received",
    });

    await expect(
      discardRejectedMobileContentReport({
        database: {} as never,
        expectedUserId: ids.userA,
        rejection: blocked.rejectedHead,
        attemptDelivery: true,
      }),
    ).resolves.toEqual({
      acknowledgedIdempotencyKeys: [second.idempotencyKey],
      pendingCount: 0,
      rejectedHead: null,
    });
    expect(testState.discard).toHaveBeenCalledWith(blocked.rejectedHead);
    expect(testState.sendContentReport).toHaveBeenCalledWith(second);
    expect(snapshot.entries).toEqual([]);
  });

  it("ne retire rien si la session n'est plus celle du compte", async () => {
    snapshot = rejectContentReport(
      enqueueContentReport(createContentReportOutbox(), {
        idempotencyKey: ids.report,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "tone",
          platform: "android",
        },
        createdAt: "2026-08-02T04:00:00.000Z",
      }),
      {
        idempotencyKey: ids.report,
        body: {
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          category: "tone",
          platform: "android",
        },
        createdAt: "2026-08-02T04:00:00.000Z",
      },
      {
        reason: "invalid_request",
        rejectedAt: "2026-08-02T05:00:00.000Z",
      },
    );
    const durableRejection = snapshot.rejection;
    if (durableRejection === null) throw new Error("Expected rejection.");
    testState.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: durableSession(ids.userB).accessToken,
          user: { id: ids.userB, is_anonymous: false },
        },
      },
      error: null,
    });

    await expect(
      discardRejectedMobileContentReport({
        database: {} as never,
        expectedUserId: ids.userA,
        rejection: durableRejection,
        attemptDelivery: false,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(testState.discard).not.toHaveBeenCalled();
    expect(snapshot.rejection).toEqual(durableRejection);
  });
});
