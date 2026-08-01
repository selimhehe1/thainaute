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

  it("fusionne puis efface la source seulement après l'accusé serveur", async () => {
    const name = databaseName();
    const anonymous = new WebAttemptOutboxStore(name);
    const account = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    await anonymous.enqueue(submission);
    const accountDeviceId = await account.getOrCreateAccountDeviceId(
      () => ids.deviceB,
      () => Promise.resolve("11".repeat(32)),
    );

    const started = await account.startAnonymousFusion({
      fusionId: ids.idempotency,
      accountDeviceId,
      consentedAt: "2026-08-01T10:01:00.000Z",
    });
    expect(started.anonymousSnapshot.entries).toHaveLength(1);
    expect(started.accountSnapshot.entries[0]?.submission).toMatchObject({
      eventId: ids.event,
      deviceId: accountDeviceId,
      answeredAt: submission.answeredAt,
    });
    await expect(anonymous.purgeOwnerData()).rejects.toThrow(
      "fusion encore active",
    );
    expect((await anonymous.read()).entries).toHaveLength(1);
    expect((await account.read()).entries).toHaveLength(1);
    expect((await account.readFusionMarker())?.status).toBe(
      "awaiting_server_ack",
    );
    const otherAccount = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userB,
    });
    await expect(otherAccount.resumeAnonymousFusion()).resolves.toBeNull();
    expect((await otherAccount.read()).entries).toHaveLength(0);
    otherAccount.close();

    await account.prepare(ids.ignoredIdempotency);
    await account.applySuccess({
      syncRevision: 1,
      results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
      states: [],
    });
    const completed = await account.completeAnonymousFusion(
      "2026-08-01T10:02:00.000Z",
    );
    expect(completed.marker.status).toBe("completed");
    expect(completed.anonymousSnapshot.entries).toHaveLength(0);
    expect((await anonymous.read()).entries).toHaveLength(0);
    expect((await account.read()).entries[0]?.status).toBe("synced");
    await account.purgeOwnerData();
    expect(await account.readFusionMarker()).toBeNull();
    expect((await account.read()).entries).toHaveLength(0);

    anonymous.close();
    await account.deleteForTests();
  });

  it("sépare les journaux et dérive un device opaque par compte", async () => {
    const name = databaseName();
    const accountA = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    const accountB = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userB,
    });

    const sha256Hex = (material: string) =>
      Promise.resolve(
        material.endsWith(ids.userA) ? "11".repeat(32) : "22".repeat(32),
      );
    const deviceA = await accountA.getOrCreateAccountDeviceId(
      () => ids.device,
      sha256Hex,
    );
    const deviceB = await accountB.getOrCreateAccountDeviceId(
      () => ids.deviceB,
      sha256Hex,
    );
    expect(deviceA).not.toBe(deviceB);
    expect(deviceA[14]).toBe("8");
    expect(deviceB[14]).toBe("8");
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
    await expect(accountB.purgeAccountDataIfSettled()).resolves.toBe(true);
    await expect(accountA.purgeAccountDataIfSettled()).resolves.toBe(false);
    expect((await accountA.read()).entries).toHaveLength(1);
    const observedBeforeLogout = await accountA.read();
    await accountA.enqueue({
      ...submission,
      eventId: ids.eventB,
      answeredAt: "2026-08-01T10:00:01.000Z",
    });
    await expect(
      accountA.purgeAccountDataIfSettled({
        snapshot: observedBeforeLogout,
        fusionMarker: null,
      }),
    ).resolves.toBe(false);
    expect((await accountA.read()).entries).toHaveLength(2);
    await accountA.prepare(ids.idempotency);
    await accountA.applySuccess({
      syncRevision: 1,
      results: [
        { eventId: ids.event, status: "accepted", rating: 1 },
        { eventId: ids.eventB, status: "accepted", rating: 1 },
      ],
      states: [],
    });
    await expect(
      accountA.purgeAccountDataIfSettled({
        snapshot: observedBeforeLogout,
        fusionMarker: null,
      }),
    ).resolves.toBe(false);
    await expect(
      accountA.purgeAccountDataIfSettled({
        snapshot: await accountA.read(),
        fusionMarker: null,
      }),
    ).resolves.toBe(true);
    expect((await accountA.read()).entries).toHaveLength(0);
    expect((await accountB.read()).entries).toHaveLength(0);
    await expect(
      accountA.getOrCreateAccountDeviceId(() => {
        throw new Error("l’installation doit être conservée");
      }, sha256Hex),
    ).resolves.toBe(deviceA);
    accountB.close();
    await accountA.deleteForTests();
  });
});
