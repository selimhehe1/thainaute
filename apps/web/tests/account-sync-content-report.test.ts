import {
  createAttemptOutboxSnapshot,
  createContentReportOutbox,
  createContentReportOutboxEntry,
  enqueueContentReport,
  rejectContentReport,
  type ContentReportOutboxEntry,
  type ContentReportOutboxSnapshot,
} from "@thainaute/sync";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
  device: "20000000-0000-4000-8000-000000000001",
  version: "30000000-0000-4000-8000-000000000001",
  exercise: "30000000-0000-4000-8000-000000000002",
  reportA: "40000000-0000-4000-8000-000000000001",
  reportB: "40000000-0000-4000-8000-000000000002",
} as const;

const reportA = createContentReportOutboxEntry({
  idempotencyKey: ids.reportA,
  body: {
    contentVersionId: ids.version,
    exerciseId: ids.exercise,
    category: "tone",
    platform: "web",
  },
  createdAt: "2026-08-02T10:00:00.000Z",
});
const reportB = createContentReportOutboxEntry({
  ...reportA,
  idempotencyKey: ids.reportB,
  body: { ...reportA.body, category: "audio" },
  createdAt: "2026-08-02T10:01:00.000Z",
});

const mocks = vi.hoisted(() => ({
  assertDeletion: vi.fn(),
  attemptSync: vi.fn(),
  contentReportSync: vi.fn(),
  deletionPending: false,
  reportReads: [] as ContentReportOutboxSnapshot[],
  storeClose: vi.fn(),
  userId: "10000000-0000-4000-8000-000000000001",
}));

vi.mock("@thainaute/sync", async (importOriginal) => {
  const original = await importOriginal<typeof import("@thainaute/sync")>();
  return {
    ...original,
    createSyncHttpClient: vi.fn(() => ({})),
    synchronizeAttemptOutbox: mocks.attemptSync,
  };
});

vi.mock("../lib/client/account-deletion", () => ({
  assertNoPendingWebAccountDeletion: (userId: string) => {
    mocks.assertDeletion(userId);
    if (mocks.deletionPending) throw new Error("deletion in progress");
  },
}));

vi.mock("../lib/client/content-report", () => ({
  synchronizeWebContentReports: mocks.contentReportSync,
}));

vi.mock("../lib/client/supabase-auth", () => ({
  getWebSupabaseAuthClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: {
              access_token: "unit-test-access",
              user: { id: mocks.userId, is_anonymous: false },
            },
          },
          error: null,
        }),
    },
  }),
}));

vi.mock("../lib/client/attempt-outbox-store", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../lib/client/attempt-outbox-store")>();
  return {
    ...original,
    migrateLegacyDemoFixtureAttempts: vi.fn(() =>
      Promise.resolve({
        status: "not_needed",
        copiedEntries: 0,
        deduplicatedEntries: 0,
      }),
    ),
    WebAttemptOutboxStore: class {
      async getOrCreateAccountDeviceId() {
        return ids.device;
      }

      async resumeAnonymousFusion() {
        return null;
      }

      async startAnonymousFusion() {
        return null;
      }

      async readFusionMarker() {
        return null;
      }

      async readContentReports() {
        const next = mocks.reportReads.shift();
        if (next === undefined) throw new Error("unexpected report read");
        return next;
      }

      close() {
        mocks.storeClose();
      }
    },
  };
});

import { synchronizeWebAccount } from "../lib/client/account-sync";

function reportSnapshot(entries: readonly ContentReportOutboxEntry[]) {
  return entries.reduce(
    (snapshot, entry) => enqueueContentReport(snapshot, entry),
    createContentReportOutbox(),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deletionPending = false;
  mocks.userId = ids.userA;
  mocks.reportReads = [];
  mocks.attemptSync.mockResolvedValue({
    snapshot: createAttemptOutboxSnapshot({
      kind: "account",
      userId: ids.userA,
    }),
    batchesSent: 0,
  });
});

describe("synchronisation compte et signalements web", () => {
  it("vide la file globale et expose les compteurs envoyés/restants", async () => {
    mocks.reportReads = [reportSnapshot([reportA, reportB])];
    mocks.contentReportSync.mockResolvedValue({
      acknowledgedIdempotencyKeys: [ids.reportA],
      pendingCount: 1,
      rejectedHead: null,
    });

    await expect(
      synchronizeWebAccount({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    ).resolves.toMatchObject({
      batchesSent: 0,
      contentReportsSent: 1,
      contentReportsPending: 1,
      contentReportsRejected: 0,
    });
    expect(mocks.contentReportSync).toHaveBeenCalledWith(ids.userA);
    expect(mocks.storeClose).toHaveBeenCalledOnce();
  });

  it("conserve un échec distant sans masquer la progression déjà synchronisée", async () => {
    mocks.reportReads = [
      reportSnapshot([reportA, reportB]),
      reportSnapshot([reportB]),
    ];
    mocks.contentReportSync.mockRejectedValue(new Error("service unavailable"));

    await expect(
      synchronizeWebAccount({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    ).resolves.toMatchObject({
      contentReportsSent: 1,
      contentReportsPending: 1,
      contentReportsRejected: 0,
    });
  });

  it("distingue un rejet durable des signalements encore pendants", async () => {
    const rejected = rejectContentReport(
      reportSnapshot([reportA, reportB]),
      reportA,
      {
        reason: "invalid_request",
        rejectedAt: "2026-08-02T12:00:00.000Z",
      },
    );
    mocks.reportReads = [rejected];
    mocks.contentReportSync.mockResolvedValue({
      acknowledgedIdempotencyKeys: [],
      pendingCount: 1,
      rejectedHead: rejected.rejection,
    });

    await expect(
      synchronizeWebAccount({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    ).resolves.toMatchObject({
      contentReportsSent: 0,
      contentReportsPending: 1,
      contentReportsRejected: 1,
    });
  });

  it("ferme le résultat si la session bascule de A vers B", async () => {
    mocks.reportReads = [reportSnapshot([reportA])];
    mocks.contentReportSync.mockImplementation(() => {
      mocks.userId = ids.userB;
      return Promise.reject(new Error("session changed"));
    });

    await expect(
      synchronizeWebAccount({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    ).rejects.toThrow("session changed");
    expect(mocks.reportReads).toHaveLength(0);
    expect(mocks.storeClose).toHaveBeenCalledOnce();
  });

  it("ferme aussi la reprise si une suppression démarre", async () => {
    mocks.reportReads = [reportSnapshot([reportA])];
    mocks.contentReportSync.mockImplementation(() => {
      mocks.deletionPending = true;
      return Promise.reject(new Error("deletion in progress"));
    });

    await expect(
      synchronizeWebAccount({
        userId: ids.userA,
        startAnonymousFusion: false,
      }),
    ).rejects.toThrow("deletion in progress");
    expect(mocks.storeClose).toHaveBeenCalledOnce();
  });
});
