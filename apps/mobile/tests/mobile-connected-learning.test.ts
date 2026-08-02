import {
  attemptOutboxSnapshotSchema,
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it, vi } from "vitest";

import {
  enqueueConnectedMobileAttempt,
  findLatestConnectedMobileAttempt,
  synchronizeConnectedMobileAttempt,
  type MobileConnectedLearningPorts,
} from "../lib/mobile-connected-learning";

vi.mock("expo-crypto", () => ({ randomUUID: vi.fn() }));
vi.mock("../lib/account-sync", () => ({
  synchronizeMobileAccount: vi.fn(),
}));
vi.mock("../lib/mobile-account-deletion", () => ({
  assertNoPendingMobileAccountDeletion: vi.fn(),
  withNoPendingMobileAccountDeletion: vi.fn(
    (_userId: string, operation: () => Promise<unknown>) => operation(),
  ),
}));
vi.mock("../lib/sha256", () => ({
  mobileSha256Hex: vi.fn(async () => "a".repeat(64)),
}));

const ids = {
  user: "00000000-0000-4000-8000-000000000001",
  device: "00000000-0000-4000-8000-000000000002",
  event: "00000000-0000-4000-8000-000000000003",
  version: "00000000-0000-4000-8000-000000000004",
  exercise: "00000000-0000-4000-8000-000000000005",
  option: "00000000-0000-4000-8000-000000000006",
} as const;
const database = {} as SQLiteDatabase;

function ports() {
  let snapshot = createAttemptOutboxSnapshot({
    kind: "account",
    userId: ids.user,
  });
  const enqueue = vi.fn(async (submission: ValidatedAttemptSubmission) => {
    snapshot = enqueueAttempt(snapshot, submission);
    return snapshot;
  });
  const createStore = vi.fn(() => ({
    read: vi.fn(async () => snapshot),
    getOrCreateAccountDeviceId: vi.fn(async () => ids.device),
    enqueue,
  }));
  const assertAccountWritable = vi.fn(async () => undefined);
  let barrierCalls = 0;
  const harness: MobileConnectedLearningPorts = {
    assertAccountWritable,
    createStore,
    createUuid: vi.fn(() => ids.event),
    now: () => new Date("2026-08-02T08:00:00.000Z"),
    synchronize: vi.fn(async () => ({
      snapshot: attemptOutboxSnapshotSchema.parse({
        ...snapshot,
        syncRevision: 1,
        entries: snapshot.entries.map((entry) => ({
          status: "synced",
          submission: entry.submission,
          serverStatus: "accepted",
          rating: 1,
          feedbackFr: "La boucle fonctionne.",
        })),
      }),
      batchesSent: 1,
      fusionCompleted: false,
      fusionRejectedCount: 0,
      contentReportsSent: 0,
      contentReportsPending: 0,
      contentReportsRejected: 0 as const,
    })),
    withAccountWriteBarrier: (_userId, operation) => {
      barrierCalls += 1;
      return operation();
    },
  };
  return {
    assertAccountWritable,
    createStore,
    enqueue,
    harness,
    barrierCalls: () => barrierCalls,
    snapshot: () => snapshot,
  };
}

describe("tentative connectée mobile", () => {
  it("écrit le payload borné avant de lancer le transport", async () => {
    const { harness, snapshot } = ports();
    const entry = await enqueueConnectedMobileAttempt(
      {
        database,
        userId: ids.user,
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
        selectedOptionId: ids.option,
        durationMs: Number.MAX_SAFE_INTEGER,
      },
      harness,
    );
    expect(entry.status).toBe("pending");
    expect(snapshot().entries[0]?.submission.durationMs).toBe(1_800_000);
    expect(harness.synchronize).not.toHaveBeenCalled();
  });

  it("retourne seulement l'entrée exacte après synchronisation", async () => {
    const { barrierCalls, harness } = ports();
    const pending = await enqueueConnectedMobileAttempt(
      {
        database,
        userId: ids.user,
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
        selectedOptionId: ids.option,
        durationMs: 500,
      },
      harness,
    );
    const result = await synchronizeConnectedMobileAttempt(
      { database, userId: ids.user, eventId: pending.submission.eventId },
      harness,
    );
    expect(result).toMatchObject({ status: "synced", rating: 1 });
    expect(barrierCalls()).toBe(2);
  });

  it("ne lance pas la synchronisation si la barrière de suppression la ferme", async () => {
    const { harness } = ports();
    const blocked: MobileConnectedLearningPorts = {
      ...harness,
      withAccountWriteBarrier: async () => {
        throw new Error("suppression en cours");
      },
    };

    await expect(
      synchronizeConnectedMobileAttempt(
        { database, userId: ids.user, eventId: ids.event },
        blocked,
      ),
    ).rejects.toThrow("suppression en cours");
    expect(harness.synchronize).not.toHaveBeenCalled();
  });

  it("ne trouve aucun état d'un autre couple version/exercice", () => {
    const snapshot: AttemptOutboxSnapshot = createAttemptOutboxSnapshot({
      kind: "account",
      userId: ids.user,
    });
    expect(
      findLatestConnectedMobileAttempt(snapshot, {
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
      }),
    ).toBeNull();
  });

  it("n'écrit rien si une suppression apparaît avant l'enqueue", async () => {
    const { assertAccountWritable, enqueue, harness } = ports();
    assertAccountWritable
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("suppression en cours"));

    await expect(
      enqueueConnectedMobileAttempt(
        {
          database,
          userId: ids.user,
          contentVersionId: ids.version,
          exerciseId: ids.exercise,
          selectedOptionId: ids.option,
          durationMs: 500,
        },
        harness,
      ),
    ).rejects.toThrow("suppression en cours");
    expect(enqueue).not.toHaveBeenCalled();
  });
});
