import {
  attemptOutboxSnapshotSchema,
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { describe, expect, it, vi } from "vitest";

import {
  enqueueConnectedWebAttempt,
  findLatestConnectedAttempt,
  synchronizeConnectedWebAttempt,
  type ConnectedLearningPorts,
} from "@/lib/client/connected-learning";

const ids = {
  user: "00000000-0000-4000-8000-000000000001",
  device: "00000000-0000-4000-8000-000000000002",
  event: "00000000-0000-4000-8000-000000000003",
  version: "00000000-0000-4000-8000-000000000004",
  exercise: "00000000-0000-4000-8000-000000000005",
  option: "00000000-0000-4000-8000-000000000006",
} as const;

function ports() {
  let snapshot = createAttemptOutboxSnapshot({
    kind: "account",
    userId: ids.user,
  });
  const close = vi.fn();
  const enqueue = vi.fn(async (submission: ValidatedAttemptSubmission) => {
    snapshot = enqueueAttempt(snapshot, submission);
    return snapshot;
  });
  const createStore = vi.fn(() => ({
    read: vi.fn(async () => snapshot),
    getOrCreateAccountDeviceId: vi.fn(async () => ids.device),
    enqueue,
    close,
  }));
  const assertAccountWritable = vi.fn(async () => undefined);
  let barrierCalls = 0;
  const harness: ConnectedLearningPorts = {
    assertAccountWritable,
    createStore,
    createUuid: vi
      .fn<() => string>()
      .mockReturnValueOnce(ids.event)
      .mockReturnValue(ids.event),
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
          feedbackFr: "La boucle technique fonctionne.",
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
    close,
    createStore,
    enqueue,
    harness,
    barrierCalls: () => barrierCalls,
    snapshot: () => snapshot,
  };
}

describe("orchestration web de tentative connectée", () => {
  it("persiste un payload borné avant toute synchronisation", async () => {
    const { harness, close, snapshot } = ports();
    const entry = await enqueueConnectedWebAttempt(
      {
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
    expect(close).toHaveBeenCalledOnce();
  });

  it("livre uniquement le résultat exact renvoyé par la synchronisation", async () => {
    const { barrierCalls, harness } = ports();
    const pending = await enqueueConnectedWebAttempt(
      {
        userId: ids.user,
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
        selectedOptionId: ids.option,
        durationMs: 500,
      },
      harness,
    );
    const result = await synchronizeConnectedWebAttempt(
      { userId: ids.user, eventId: pending.submission.eventId },
      harness,
    );
    expect(result).toMatchObject({ status: "synced", rating: 1 });
    expect(barrierCalls()).toBe(2);
  });

  it("ne lance pas la synchronisation si la barrière de suppression la ferme", async () => {
    const { harness } = ports();
    const blocked: ConnectedLearningPorts = {
      ...harness,
      withAccountWriteBarrier: async () => {
        throw new Error("suppression en cours");
      },
    };

    await expect(
      synchronizeConnectedWebAttempt(
        { userId: ids.user, eventId: ids.event },
        blocked,
      ),
    ).rejects.toThrow("suppression en cours");
    expect(harness.synchronize).not.toHaveBeenCalled();
  });

  it("retrouve la tentative la plus récente du couple version/exercice", () => {
    const snapshot = createAttemptOutboxSnapshot({
      kind: "account",
      userId: ids.user,
    });
    expect(
      findLatestConnectedAttempt(snapshot, {
        contentVersionId: ids.version,
        exerciseId: ids.exercise,
      }),
    ).toBeNull();
  });

  it("n'écrit rien si une suppression apparaît avant l'enqueue", async () => {
    const { assertAccountWritable, close, enqueue, harness } = ports();
    assertAccountWritable
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("suppression en cours"));

    await expect(
      enqueueConnectedWebAttempt(
        {
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
    expect(close).toHaveBeenCalledOnce();
  });
});
