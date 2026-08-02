import { describe, expect, it, vi } from "vitest";

import {
  AttemptSyncRunLimitError,
  AttemptSyncOwnerMismatchError,
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  applyAttemptOutboxSuccess,
  applyProgressSnapshot,
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  prepareAttemptOutboxBatch,
  rejectAttemptOutboxInFlightIdempotencyConflict,
  resumeAttemptOutboxAfterDeviceRegistration,
  synchronizeAttemptOutbox,
  type AttemptOutboxSnapshot,
  type AttemptSyncStore,
  type SyncHttpClient,
} from "../src/index";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  device: "20000000-0000-4000-8000-000000000001",
  event: "30000000-0000-4000-8000-000000000001",
  secondEvent: "30000000-0000-4000-8000-000000000002",
  exercise: "40000000-0000-4000-8000-000000000001",
  secondExercise: "40000000-0000-4000-8000-000000000002",
  option: "50000000-0000-4000-8000-000000000001",
  secondOption: "50000000-0000-4000-8000-000000000002",
  version: "60000000-0000-4000-8000-000000000001",
  secondVersion: "60000000-0000-4000-8000-000000000002",
  batch: "70000000-0000-4000-8000-000000000001",
} as const;

class MemoryStore implements AttemptSyncStore {
  public snapshot: AttemptOutboxSnapshot;

  public constructor() {
    this.snapshot = enqueueAttempt(
      createAttemptOutboxSnapshot({ kind: "account", userId: ids.user }),
      {
        eventId: ids.event,
        deviceId: ids.device,
        exerciseId: ids.exercise,
        selectedOptionId: ids.option,
        answeredAt: "2026-08-01T10:00:00.000Z",
        durationMs: 1_000,
        contentVersionId: ids.version,
        algorithmVersion: "srs-v0",
      },
    );
  }

  public read() {
    return Promise.resolve(this.snapshot);
  }

  public prepare(key: string) {
    const result = prepareAttemptOutboxBatch(this.snapshot, key);
    this.snapshot = result.snapshot;
    return Promise.resolve(result);
  }

  public applySuccess(
    response: Parameters<typeof applyAttemptOutboxSuccess>[1],
  ) {
    const result = applyAttemptOutboxSuccess(this.snapshot, response);
    this.snapshot = result.snapshot;
    return Promise.resolve(result);
  }

  public rejectInFlightIdempotencyConflict() {
    this.snapshot = rejectAttemptOutboxInFlightIdempotencyConflict(
      this.snapshot,
    );
    return Promise.resolve(this.snapshot);
  }

  public applyProgressSnapshot(
    response: Parameters<typeof applyProgressSnapshot>[1],
  ) {
    this.snapshot = applyProgressSnapshot(this.snapshot, response);
    return Promise.resolve(this.snapshot);
  }

  public resumeAfterDeviceRegistration(deviceId: string) {
    this.snapshot = resumeAttemptOutboxAfterDeviceRegistration(
      this.snapshot,
      deviceId,
    );
    return Promise.resolve(this.snapshot);
  }
}

function client(
  sendAttemptBatch: SyncHttpClient["sendAttemptBatch"],
): SyncHttpClient {
  return {
    deleteAccount: () => Promise.reject(new Error("Non utilisé ici.")),
    getAccountExport: () => Promise.reject(new Error("Non utilisé ici.")),
    getLessonProgress: () => Promise.reject(new Error("Non utilisé ici.")),
    sendContentReport: () => Promise.reject(new Error("Not used here.")),
    registerDevice: () =>
      Promise.resolve({
        device: {
          deviceId: ids.device,
          platform: "web",
          appVersion: "0.0.1",
          registeredAt: "2026-08-01T10:00:00.000Z",
        },
      }),
    getProgressSnapshot: () => Promise.resolve({ syncRevision: 0, states: [] }),
    sendAttemptBatch,
  };
}

describe("coordinateur de synchronisation", () => {
  it("hydrate, envoie et acquitte un lot dans l'ordre", async () => {
    const store = new MemoryStore();
    const send = vi.fn(
      (prepared: Parameters<SyncHttpClient["sendAttemptBatch"]>[0]) =>
        Promise.resolve({
          syncRevision: 1,
          results: prepared.batch.attempts.map(({ eventId }) => ({
            eventId,
            status: "accepted" as const,
            rating: 1 as const,
          })),
          states: [],
        }),
    );

    const result = await synchronizeAttemptOutbox({
      store,
      client: client(send),
      expectedUserId: ids.user,
      device: { deviceId: ids.device, platform: "web", appVersion: "0.0.1" },
      createIdempotencyKey: () => ids.batch,
    });

    expect(result.batchesSent).toBe(1);
    expect(result.snapshot.entries[0]?.status).toBe("synced");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("laisse le lot en vol intact si le transport échoue", async () => {
    const store = new MemoryStore();
    await expect(
      synchronizeAttemptOutbox({
        store,
        client: client(() => Promise.reject(new Error("offline"))),
        expectedUserId: ids.user,
        device: {
          deviceId: ids.device,
          platform: "web",
          appVersion: "0.0.1",
        },
        createIdempotencyKey: () => ids.batch,
      }),
    ).rejects.toThrow("offline");
    expect(store.snapshot.inFlight?.idempotencyKey).toBe(ids.batch);
    expect(store.snapshot.entries[0]?.status).toBe("pending");
  });

  it("laisse le lot en vol intact si la session bascule avant un 409", async () => {
    const store = new MemoryStore();
    await expect(
      synchronizeAttemptOutbox({
        store,
        client: client(() =>
          Promise.reject(new SyncHttpAuthenticationError("attempt_batch")),
        ),
        expectedUserId: ids.user,
        device: {
          deviceId: ids.device,
          platform: "web",
          appVersion: "0.0.1",
        },
        createIdempotencyKey: () => ids.batch,
      }),
    ).rejects.toBeInstanceOf(SyncHttpAuthenticationError);
    expect(store.snapshot.inFlight?.idempotencyKey).toBe(ids.batch);
    expect(store.snapshot.entries[0]?.status).toBe("pending");
  });

  it("libère un lot devenu inéligible puis synchronise les tentatives suivantes", async () => {
    const store = new MemoryStore();
    let calls = 0;
    const send = vi.fn(
      (prepared: Parameters<SyncHttpClient["sendAttemptBatch"]>[0]) => {
        calls += 1;
        if (calls === 1) {
          store.snapshot = enqueueAttempt(store.snapshot, {
            eventId: ids.secondEvent,
            deviceId: ids.device,
            exerciseId: ids.secondExercise,
            selectedOptionId: ids.secondOption,
            answeredAt: "2026-08-01T10:01:00.000Z",
            durationMs: 900,
            contentVersionId: ids.secondVersion,
            algorithmVersion: "srs-v0",
          });
          return Promise.reject(
            new SyncHttpApiError({
              endpoint: "attempt_batch",
              status: 409,
              code: "idempotency_key_reused",
            }),
          );
        }
        return Promise.resolve({
          syncRevision: 2,
          results: prepared.batch.attempts.map(({ eventId }) => ({
            eventId,
            status: "accepted" as const,
            rating: 1 as const,
          })),
          states: [],
        });
      },
    );

    const result = await synchronizeAttemptOutbox({
      store,
      client: client(send),
      expectedUserId: ids.user,
      device: { deviceId: ids.device, platform: "web", appVersion: "0.0.1" },
      createIdempotencyKey: () => crypto.randomUUID(),
    });

    expect(send).toHaveBeenCalledTimes(2);
    expect(result.snapshot.inFlight).toBeNull();
    expect(
      result.snapshot.entries.find(
        ({ submission }) => submission.eventId === ids.event,
      ),
    ).toMatchObject({ status: "rejected", code: "invalid_submission" });
    expect(
      result.snapshot.entries.find(
        ({ submission }) => submission.eventId === ids.secondEvent,
      ),
    ).toMatchObject({ status: "synced", serverStatus: "accepted" });
  });

  it("borne une passe qui ne termine jamais", async () => {
    const store = new MemoryStore();
    const createIdempotencyKey = vi.fn(() => ids.batch);
    const rejecting = client((prepared) =>
      Promise.resolve({
        syncRevision: 1,
        results: prepared.batch.attempts.map(({ eventId }) => ({
          eventId,
          status: "rejected" as const,
          code: "device_not_registered" as const,
        })),
        states: [],
      }),
    );

    await expect(
      synchronizeAttemptOutbox({
        store,
        client: rejecting,
        expectedUserId: ids.user,
        device: {
          deviceId: ids.device,
          platform: "web",
          appVersion: "0.0.1",
        },
        createIdempotencyKey,
        maxBatches: 1,
      }),
    ).rejects.toBeInstanceOf(AttemptSyncRunLimitError);
    expect(createIdempotencyKey).toHaveBeenCalledTimes(1);
    expect(store.snapshot.inFlight).toBeNull();
    expect(store.snapshot.entries[0]?.status).toBe("pending");
  });

  it("refuse un journal anonyme ou d’un autre compte avant le réseau", async () => {
    const store = new MemoryStore();
    store.snapshot = createAttemptOutboxSnapshot();
    const registerDevice = vi.fn();

    await expect(
      synchronizeAttemptOutbox({
        store,
        client: {
          ...client(() => Promise.reject(new Error("unused"))),
          registerDevice,
        },
        expectedUserId: ids.user,
        device: {
          deviceId: ids.device,
          platform: "web",
          appVersion: "0.0.1",
        },
        createIdempotencyKey: () => ids.batch,
      }),
    ).rejects.toBeInstanceOf(AttemptSyncOwnerMismatchError);
    expect(registerDevice).not.toHaveBeenCalled();
  });
});
