import "fake-indexeddb/auto";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import type { AttemptOutboxOwner } from "@thainaute/sync";
import Dexie from "dexie";
import { describe, expect, it } from "vitest";

import {
  WebAttemptOutboxStore as RealWebAttemptOutboxStore,
  migrateLegacyDemoFixtureAttempts,
} from "../lib/client/attempt-outbox-store";

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
  fixtureEvent: "30000000-0000-4000-8000-000000000001",
  fixtureExercise: "10000000-0000-4000-8000-000000000004",
  fixtureOptionA: "20000000-0000-4000-8000-000000000001",
  fixtureOptionB: "20000000-0000-4000-8000-000000000002",
  fixtureVersion: "10000000-0000-4000-8000-000000000002",
} as const;

const testSha256Hex = (material: string): Promise<string> =>
  Promise.resolve(
    material.endsWith(ids.userB) ? "22".repeat(32) : "11".repeat(32),
  );

class WebAttemptOutboxStore extends RealWebAttemptOutboxStore {
  public constructor(databaseName?: string, owner?: AttemptOutboxOwner) {
    super(
      databaseName,
      owner,
      owner?.kind === "account" ? testSha256Hex : undefined,
    );
  }
}

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

const legacyFixtureSubmission = {
  eventId: ids.fixtureEvent,
  deviceId: ids.device,
  exerciseId: ids.fixtureExercise,
  selectedOptionId: ids.fixtureOptionA,
  answeredAt: "2026-08-01T09:59:00.000Z",
  durationMs: 900,
  contentVersionId: ids.fixtureVersion,
  algorithmVersion: SRS_ALGORITHM_VERSION,
};

function databaseName(): string {
  return `thainaute-test-${crypto.randomUUID()}`;
}

function migrationDatabaseNames(): {
  readonly learningDatabaseName: string;
  readonly demoDatabaseName: string;
} {
  const suffix = crypto.randomUUID();
  return {
    learningDatabaseName: `thainaute-learning-test-${suffix}`,
    demoDatabaseName: `thainaute-demo-test-${suffix}`,
  };
}

async function readRawOutboxRow(
  databaseName: string,
  key: string,
): Promise<{ readonly key: string; readonly snapshot: string } | undefined> {
  const database = new Dexie(databaseName);
  database.version(1).stores({ metadata: "&key", outbox: "&key" });
  try {
    return await database
      .table<{ readonly key: string; readonly snapshot: string }>("outbox")
      .get(key);
  } finally {
    database.close();
  }
}

async function readRawMetadataRows(
  databaseName: string,
): Promise<readonly { readonly key: string; readonly value: string }[]> {
  const database = new Dexie(databaseName);
  database.version(1).stores({ metadata: "&key", outbox: "&key" });
  try {
    return await database
      .table<{ readonly key: string; readonly value: string }>("metadata")
      .toArray();
  } finally {
    database.close();
  }
}

async function seedFusionMarker(
  databaseName: string,
  marker: unknown,
): Promise<void> {
  const database = new Dexie(databaseName);
  database.version(1).stores({ metadata: "&key", outbox: "&key" });
  try {
    await database.table("metadata").put({
      key: "anonymous-progress-fusion-v1",
      value: JSON.stringify(marker),
    });
  } finally {
    database.close();
  }
}

async function deleteMigrationDatabases(names: {
  readonly learningDatabaseName: string;
  readonly demoDatabaseName: string;
}): Promise<void> {
  await Promise.all([
    Dexie.delete(names.learningDatabaseName),
    Dexie.delete(names.demoDatabaseName),
  ]);
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

  it("déplace la fixture historique et conserve toutes les vraies tentatives", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const demo = new WebAttemptOutboxStore(names.demoDatabaseName);
    await learning.enqueueMany([legacyFixtureSubmission, submission]);
    await demo.enqueue({
      ...submission,
      eventId: ids.eventB,
      answeredAt: "2026-08-01T10:01:00.000Z",
    });
    learning.close();
    demo.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "migrated",
      copiedEntries: 1,
      deduplicatedEntries: 0,
    });

    const learningInspector = new WebAttemptOutboxStore(
      names.learningDatabaseName,
    );
    const demoInspector = new WebAttemptOutboxStore(names.demoDatabaseName);
    expect(
      (await learningInspector.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    expect(
      (await demoInspector.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.fixtureEvent, ids.eventB]);
    learningInspector.close();
    demoInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("rejoue une copie exacte sans doublon puis nettoie la quarantaine", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const demo = new WebAttemptOutboxStore(names.demoDatabaseName);
    await learning.enqueue(legacyFixtureSubmission);
    await demo.enqueue(legacyFixtureSubmission);
    learning.close();
    demo.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "migrated",
      copiedEntries: 0,
      deduplicatedEntries: 1,
    });
    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "not_needed",
      copiedEntries: 0,
      deduplicatedEntries: 0,
    });
    expect(
      await readRawOutboxRow(
        names.learningDatabaseName,
        "legacy-demo-fixture-quarantine-v1",
      ),
    ).toBeUndefined();

    const demoInspector = new WebAttemptOutboxStore(names.demoDatabaseName);
    expect((await demoInspector.read()).entries).toHaveLength(1);
    demoInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("refuse un eventId en conflit sans modifier la source", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const demo = new WebAttemptOutboxStore(names.demoDatabaseName);
    await learning.enqueue(legacyFixtureSubmission);
    await demo.enqueue({
      ...legacyFixtureSubmission,
      selectedOptionId: ids.fixtureOptionB,
    });
    learning.close();
    demo.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).rejects.toThrow(
      "conflit",
    );
    const learningInspector = new WebAttemptOutboxStore(
      names.learningDatabaseName,
    );
    expect((await learningInspector.read()).entries).toHaveLength(1);
    expect(
      await readRawOutboxRow(
        names.learningDatabaseName,
        "legacy-demo-fixture-quarantine-v1",
      ),
    ).toBeUndefined();
    learningInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("conserve la source byte-identique si la base demo est corrompue", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    await learning.enqueue(legacyFixtureSubmission);
    learning.close();
    const learningBefore = await readRawOutboxRow(
      names.learningDatabaseName,
      "attempts-v1",
    );
    const corruptDemo = new Dexie(names.demoDatabaseName);
    corruptDemo.version(1).stores({ metadata: "&key", outbox: "&key" });
    await corruptDemo.table("outbox").put({
      key: "attempts-v1",
      snapshot: "{corrompu",
    });
    corruptDemo.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).rejects.toThrow(
      "illisible",
    );
    expect(
      await readRawOutboxRow(names.learningDatabaseName, "attempts-v1"),
    ).toEqual(learningBefore);
    expect(
      await readRawOutboxRow(
        names.learningDatabaseName,
        "legacy-demo-fixture-quarantine-v1",
      ),
    ).toBeUndefined();
    expect(
      await readRawOutboxRow(names.demoDatabaseName, "attempts-v1"),
    ).toEqual({ key: "attempts-v1", snapshot: "{corrompu" });
    await deleteMigrationDatabases(names);
  });

  it("refuse un payload identique avec un état d'entry différent", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const demo = new WebAttemptOutboxStore(names.demoDatabaseName);
    await learning.enqueue(legacyFixtureSubmission);
    await demo.enqueue(legacyFixtureSubmission);
    await demo.prepare(ids.idempotency);
    await demo.applySuccess({
      syncRevision: 1,
      results: [{ eventId: ids.fixtureEvent, status: "accepted", rating: 1 }],
      states: [],
    });
    learning.close();
    demo.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).rejects.toThrow(
      "état de synchronisation différent",
    );
    const learningInspector = new WebAttemptOutboxStore(
      names.learningDatabaseName,
    );
    expect((await learningInspector.read()).entries[0]?.status).toBe("pending");
    learningInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("conserve une fixture engagée dans un lot en vol", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    await learning.enqueue(legacyFixtureSubmission);
    await learning.prepare(ids.idempotency);
    learning.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).rejects.toThrow(
      "lot learning en vol",
    );
    const learningInspector = new WebAttemptOutboxStore(
      names.learningDatabaseName,
    );
    expect((await learningInspector.read()).inFlight).not.toBeNull();
    learningInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("isole la fixture hors lot sans interrompre un lot réel en vol", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    await learning.enqueue(submission);
    await learning.prepare(ids.idempotency);
    await learning.enqueue(legacyFixtureSubmission);
    learning.close();

    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "migrated",
      copiedEntries: 1,
      deduplicatedEntries: 0,
    });

    const learningInspector = new WebAttemptOutboxStore(
      names.learningDatabaseName,
    );
    const demoInspector = new WebAttemptOutboxStore(names.demoDatabaseName);
    expect((await learningInspector.read()).inFlight?.eventIds).toEqual([
      ids.event,
    ]);
    expect(
      (await learningInspector.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    expect(
      (await demoInspector.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.fixtureEvent]);
    learningInspector.close();
    demoInspector.close();
    await deleteMigrationDatabases(names);
  });

  it("isole une fixture hors marqueur puis laisse reprendre la fusion active", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const account = new WebAttemptOutboxStore(names.learningDatabaseName, {
      kind: "account",
      userId: ids.userA,
    });
    await learning.enqueue(submission);
    await account.startAnonymousFusion({
      fusionId: ids.idempotency,
      accountDeviceId: ids.deviceB,
      consentedAt: "2026-08-01T10:01:00.000Z",
    });
    await learning.enqueue(legacyFixtureSubmission);

    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "migrated",
      copiedEntries: 1,
      deduplicatedEntries: 0,
    });
    await expect(account.resumeAnonymousFusion()).resolves.toMatchObject({
      marker: {
        status: "awaiting_server_ack",
        submissions: [expect.objectContaining({ eventId: ids.event })],
      },
    });
    expect(
      (await learning.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    learning.close();
    account.close();
    await deleteMigrationDatabases(names);
  });

  it("ne touche pas une fusion active sans fixture", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const account = new WebAttemptOutboxStore(names.learningDatabaseName, {
      kind: "account",
      userId: ids.userA,
    });
    await learning.enqueue(submission);
    await account.startAnonymousFusion({
      fusionId: ids.idempotency,
      accountDeviceId: ids.deviceB,
      consentedAt: "2026-08-01T10:01:00.000Z",
    });

    await expect(migrateLegacyDemoFixtureAttempts(names)).resolves.toEqual({
      status: "not_needed",
      copiedEntries: 0,
      deduplicatedEntries: 0,
    });
    expect((await account.readFusionMarker())?.status).toBe(
      "awaiting_server_ack",
    );
    expect((await learning.read()).entries).toHaveLength(1);
    learning.close();
    account.close();
    await deleteMigrationDatabases(names);
  });

  it("refuse de démarrer une fusion tant que la fixture reste dans learning", async () => {
    const names = migrationDatabaseNames();
    const learning = new WebAttemptOutboxStore(names.learningDatabaseName);
    const account = new WebAttemptOutboxStore(names.learningDatabaseName, {
      kind: "account",
      userId: ids.userA,
    });
    await learning.enqueue(legacyFixtureSubmission);

    await expect(
      account.startAnonymousFusion({
        fusionId: ids.idempotency,
        accountDeviceId: ids.deviceB,
        consentedAt: "2026-08-01T10:01:00.000Z",
      }),
    ).rejects.toThrow("doit être isolée");
    expect((await learning.read()).entries).toHaveLength(1);
    learning.close();
    account.close();
    await deleteMigrationDatabases(names);
  });

  it("bloque lecture, reprise, prepare et batch d'une fusion contaminée", async () => {
    const names = migrationDatabaseNames();
    const account = new WebAttemptOutboxStore(names.learningDatabaseName, {
      kind: "account",
      userId: ids.userA,
    });
    const accountFixture = {
      ...legacyFixtureSubmission,
      deviceId: ids.deviceB,
    };
    await account.enqueue(accountFixture);
    await account.prepare(ids.ignoredIdempotency);
    await seedFusionMarker(names.learningDatabaseName, {
      schemaVersion: 1,
      status: "awaiting_server_ack",
      fusionId: ids.idempotency,
      targetUserId: ids.userA,
      accountDeviceId: ids.deviceB,
      consentedAt: "2026-08-01T10:01:00.000Z",
      submissions: [accountFixture],
      acknowledgedEventIds: [],
    });
    const accountKey = `attempts-v1:account:${ids.userA}`;
    const accountBefore = await readRawOutboxRow(
      names.learningDatabaseName,
      accountKey,
    );

    await expect(account.read()).rejects.toThrow("fixture technique");
    await expect(account.readFusionMarker()).rejects.toThrow(
      "fixture technique",
    );
    await expect(account.resumeAnonymousFusion()).rejects.toThrow(
      "fixture technique",
    );
    await expect(account.prepare(ids.idempotency)).rejects.toThrow(
      "fixture technique",
    );
    await expect(
      account.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.fixtureEvent, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("fixture technique");
    expect(
      await readRawOutboxRow(names.learningDatabaseName, accountKey),
    ).toEqual(accountBefore);
    account.close();
    await deleteMigrationDatabases(names);
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

  it("scelle atomiquement un compte entre deux onglets et refuse la réponse tardive", async () => {
    const name = databaseName();
    const anonymous = new WebAttemptOutboxStore(name);
    const accountAFirstTab = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    const accountASecondTab = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    const accountB = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userB,
    });

    await anonymous.enqueue(submission);
    await accountB.enqueue(submission);
    await accountASecondTab.enqueue(submission);
    await accountASecondTab.prepare(ids.idempotency);
    expect(await accountASecondTab.isAccountTombstoned()).toBe(false);

    await accountAFirstTab.tombstoneAndPurgeAccountData();
    await expect(
      accountASecondTab.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("ne peut plus être réécrit");
    await expect(
      accountASecondTab.enqueue({
        ...submission,
        eventId: ids.eventB,
        answeredAt: "2026-08-01T10:00:01.000Z",
      }),
    ).rejects.toThrow("ne peut plus être réécrit");
    await expect(accountASecondTab.read()).rejects.toThrow(
      "ne peut plus être réécrit",
    );
    await expect(accountASecondTab.purgeOwnerData()).rejects.toThrow(
      "ne peut plus être réécrit",
    );

    expect(await accountASecondTab.isAccountTombstoned()).toBe(true);
    await expect(
      accountASecondTab.tombstoneAndPurgeAccountData(),
    ).resolves.toBeUndefined();
    expect(
      await readRawOutboxRow(name, `attempts-v1:account:${ids.userA}`),
    ).toBeUndefined();
    expect((await anonymous.read()).entries).toHaveLength(1);
    expect((await accountB.read()).entries).toHaveLength(1);

    const metadataRows = await readRawMetadataRows(name);
    const tombstones = metadataRows.filter(({ key }) =>
      key.startsWith("deleted-account-subject-v1:"),
    );
    expect(tombstones).toEqual([
      {
        key: `deleted-account-subject-v1:${"11".repeat(32)}`,
        value: "deleted",
      },
    ]);
    expect(JSON.stringify(tombstones)).not.toContain(ids.userA);

    anonymous.close();
    accountAFirstTab.close();
    accountASecondTab.close();
    accountB.close();
    await Dexie.delete(name);
  });

  it("scelle le compte malgré un marqueur de fusion corrompu sans toucher sa source anonyme", async () => {
    const name = databaseName();
    const anonymous = new WebAttemptOutboxStore(name);
    const account = new WebAttemptOutboxStore(name, {
      kind: "account",
      userId: ids.userA,
    });
    await anonymous.enqueue(submission);
    await account.enqueue(submission);
    await account.prepare(ids.idempotency);
    const anonymousBefore = await readRawOutboxRow(name, "attempts-v1");
    const corruptMarker = JSON.stringify({ schemaVersion: "corrupt" });
    await seedFusionMarker(name, { schemaVersion: "corrupt" });

    await account.tombstoneAndPurgeAccountData();

    expect(await account.isAccountTombstoned()).toBe(true);
    expect(
      await readRawOutboxRow(name, `attempts-v1:account:${ids.userA}`),
    ).toBeUndefined();
    expect(await readRawOutboxRow(name, "attempts-v1")).toEqual(
      anonymousBefore,
    );
    expect(
      (await readRawMetadataRows(name)).find(
        ({ key }) => key === "anonymous-progress-fusion-v1",
      )?.value,
    ).toBe(corruptMarker);
    await expect(
      account.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("ne peut plus être réécrit");

    anonymous.close();
    account.close();
    await Dexie.delete(name);
  });
});
