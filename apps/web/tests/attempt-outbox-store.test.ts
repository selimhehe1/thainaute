import "fake-indexeddb/auto";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import Dexie from "dexie";
import { describe, expect, it } from "vitest";

import { WebAttemptOutboxStore } from "../lib/client/attempt-outbox-store";

const ids = {
  device: "10000000-0000-4000-8000-000000000001",
  event: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000003",
  item: "10000000-0000-4000-8000-000000000004",
  option: "10000000-0000-4000-8000-000000000005",
  version: "10000000-0000-4000-8000-000000000006",
  idempotency: "10000000-0000-4000-8000-000000000007",
  ignoredIdempotency: "10000000-0000-4000-8000-000000000008",
  eventB: "10000000-0000-4000-8000-000000000009",
  userA: "20000000-0000-4000-8000-000000000001",
  userB: "20000000-0000-4000-8000-000000000002",
  deviceB: "20000000-0000-4000-8000-000000000003",
} as const;

const submission = {
  eventId: ids.event,
  deviceId: ids.device,
  exerciseId: ids.exercise,
  selectedOptionId: ids.option,
  answeredAt: "2026-08-01T10:00:00.000Z",
  durationMs: 1_000,
  contentVersionId: ids.version,
  algorithmVersion: SRS_ALGORITHM_VERSION,
};

function databaseName(): string {
  return `thainaute-test-${crypto.randomUUID()}`;
}

function legacyV2Snapshot(): string {
  return JSON.stringify({
    schemaVersion: 2,
    owner: { kind: "anonymous" },
    syncRevision: 0,
    authoritativeStates: [],
    entries: [
      {
        status: "pending",
        submission: {
          ...submission,
          itemId: ids.item,
          skill: "listening",
        },
      },
    ],
    inFlight: {
      idempotencyKey: ids.idempotency,
      eventIds: [ids.event],
    },
  });
}

describe("outbox IndexedDB web", () => {
  it("conserve l'identité appareil entre deux ouvertures", async () => {
    const name = databaseName();
    const first = new WebAttemptOutboxStore(name);

    expect(await first.getOrCreateDeviceId(() => ids.device)).toBe(ids.device);
    first.close();

    const second = new WebAttemptOutboxStore(name);
    expect(
      await second.getOrCreateDeviceId(() => {
        throw new Error("ne doit pas recréer l'identité");
      }),
    ).toBe(ids.device);
    await second.deleteForTests();
  });

  it("persiste le lot en vol et réutilise sa clé après réouverture", async () => {
    const name = databaseName();
    const first = new WebAttemptOutboxStore(name);
    await first.enqueue(submission);
    const prepared = await first.prepare(ids.idempotency);
    expect(prepared.prepared?.idempotencyKey).toBe(ids.idempotency);
    first.close();

    const second = new WebAttemptOutboxStore(name);
    const retry = await second.prepare(ids.ignoredIdempotency);
    expect(retry.prepared).toEqual(prepared.prepared);

    const state = {
      itemId: ids.item,
      skill: "listening" as const,
      masteryPermille: 250,
      status: "learning" as const,
      attemptCount: 1,
      successfulAttempts: 1,
      consecutiveCorrect: 1,
      dueAt: "2026-08-02T10:00:00.000Z",
      algorithmVersion: SRS_ALGORITHM_VERSION,
    };
    const applied = await second.applySuccess({
      syncRevision: 1,
      results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
      states: [state],
    });

    expect(applied.snapshot.inFlight).toBeNull();
    expect(applied.snapshot.entries[0]?.status).toBe("synced");
    const persisted = await second.read();
    expect(persisted.syncRevision).toBe(1);
    expect(persisted.authoritativeStates).toEqual([state]);
    await second.deleteForTests();
  });

  it("migre un snapshot IndexedDB v2 avant de préparer un nouveau lot", async () => {
    const name = databaseName();
    const seed = new Dexie(name);
    seed.version(1).stores({ metadata: "&key", outbox: "&key" });
    await seed.table("outbox").put({
      key: "attempts-v1",
      snapshot: legacyV2Snapshot(),
    });
    seed.close();

    const store = new WebAttemptOutboxStore(name);
    const prepared = await store.prepare(ids.ignoredIdempotency);

    expect(prepared.prepared?.idempotencyKey).toBe(ids.ignoredIdempotency);
    expect(prepared.prepared?.batch.attempts[0]).not.toHaveProperty("itemId");
    expect(prepared.prepared?.batch.attempts[0]).not.toHaveProperty("skill");
    expect((await store.read()).schemaVersion).toBe(3);
    await store.deleteForTests();
  });

  it("sérialise deux écritures concurrentes sans perdre de tentative", async () => {
    const name = databaseName();
    const firstTab = new WebAttemptOutboxStore(name);
    const secondTab = new WebAttemptOutboxStore(name);
    await Promise.all([
      firstTab.enqueue(submission),
      secondTab.enqueue({
        ...submission,
        eventId: ids.eventB,
        answeredAt: "2026-08-01T10:00:01.000Z",
      }),
    ]);

    expect(
      (await firstTab.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event, ids.eventB]);
    secondTab.close();
    await firstTab.deleteForTests();
  });

  it("sépare le journal et l'identité locale de deux comptes", async () => {
    const name = databaseName();
    const accountA = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    const accountB = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userB,
    });

    expect(await accountA.getOrCreateDeviceId(() => ids.device)).toBe(
      ids.device,
    );
    expect(await accountB.getOrCreateDeviceId(() => ids.deviceB)).toBe(
      ids.deviceB,
    );
    await accountA.enqueue(submission);

    expect((await accountA.read()).entries).toHaveLength(1);
    expect((await accountB.read()).entries).toHaveLength(0);
    expect((await accountA.read()).owner).toEqual({
      kind: "account",
      userId: ids.userA,
    });
    expect((await accountB.read()).owner).toEqual({
      kind: "account",
      userId: ids.userB,
    });
    accountB.close();
    await accountA.deleteForTests();
  });
});
