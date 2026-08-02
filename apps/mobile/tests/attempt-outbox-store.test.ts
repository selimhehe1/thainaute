import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import type { AttemptOutboxOwner } from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import { MobileAttemptOutboxStore as RealMobileAttemptOutboxStore } from "../lib/attempt-outbox-store";

const ids = {
  device: "10000000-0000-4000-8000-000000000001",
  event: "10000000-0000-4000-8000-000000000002",
  eventB: "10000000-0000-4000-8000-000000000009",
  exercise: "10000000-0000-4000-8000-000000000003",
  item: "10000000-0000-4000-8000-000000000004",
  option: "10000000-0000-4000-8000-000000000005",
  version: "10000000-0000-4000-8000-000000000006",
  idempotency: "10000000-0000-4000-8000-000000000007",
  ignoredIdempotency: "10000000-0000-4000-8000-000000000008",
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

class MobileAttemptOutboxStore extends RealMobileAttemptOutboxStore {
  public constructor(
    database: SQLiteDatabase,
    owner?: AttemptOutboxOwner,
    namespace?: "learning" | "demo",
  ) {
    super(
      database,
      owner,
      namespace,
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

class FakeSQLiteTransaction {
  readonly #database: FakeSQLiteDatabase;

  constructor(database: FakeSQLiteDatabase) {
    this.#database = database;
  }

  getFirstAsync<T>(query: string, key: string): Promise<T | null> {
    return this.#database.transactionGetFirst<T>(query, key);
  }

  getAllAsync<T>(query: string): Promise<T[]> {
    return this.#database.transactionGetAll<T>(query);
  }

  runAsync(query: string, ...parameters: string[]): Promise<void> {
    return this.#database.transactionRun(query, ...parameters);
  }
}

class FakeSQLiteDatabase {
  readonly metadata = new Map<string, string>();
  readonly outboxes = new Map<string, string>();
  readonly legacyPayloads: string[] = [];
  failNextOutboxDelete = false;
  #transactionOpen = false;

  async getFirstAsync<T>(query: string, key: string): Promise<T | null> {
    this.#assertMainConnectionAvailable();
    return this.#getFirst<T>(query, key);
  }

  async getAllAsync<T>(query: string): Promise<T[]> {
    this.#assertMainConnectionAvailable();
    return this.#getAll<T>(query);
  }

  async runAsync(query: string, ...parameters: string[]): Promise<void> {
    this.#assertMainConnectionAvailable();
    this.#run(query, ...parameters);
  }

  async withExclusiveTransactionAsync(
    callback: (transaction: SQLiteDatabase) => Promise<void>,
  ): Promise<void> {
    if (this.#transactionOpen)
      throw new Error("SQLITE_BUSY: database is locked");
    this.#transactionOpen = true;
    const metadataBefore = new Map(this.metadata);
    const outboxesBefore = new Map(this.outboxes);
    const legacyBefore = [...this.legacyPayloads];
    try {
      await callback(asDatabase(new FakeSQLiteTransaction(this)));
    } catch (error) {
      this.metadata.clear();
      for (const [key, value] of metadataBefore) this.metadata.set(key, value);
      this.outboxes.clear();
      for (const [key, value] of outboxesBefore) this.outboxes.set(key, value);
      this.legacyPayloads.splice(
        0,
        this.legacyPayloads.length,
        ...legacyBefore,
      );
      throw error;
    } finally {
      this.#transactionOpen = false;
    }
  }

  async transactionGetFirst<T>(query: string, key: string): Promise<T | null> {
    this.#assertTransactionOpen();
    return this.#getFirst<T>(query, key);
  }

  async transactionGetAll<T>(query: string): Promise<T[]> {
    this.#assertTransactionOpen();
    return this.#getAll<T>(query);
  }

  async transactionRun(query: string, ...parameters: string[]): Promise<void> {
    this.#assertTransactionOpen();
    this.#run(query, ...parameters);
  }

  #getFirst<T>(query: string, key: string): T | null {
    if (query.includes("attempt_outbox_state")) {
      const snapshot = this.outboxes.get(key);
      return (snapshot === undefined ? null : { snapshot }) as T | null;
    }
    if (query.includes("local_metadata")) {
      const value = this.metadata.get(key);
      return (value === undefined ? null : { value }) as T | null;
    }
    throw new Error(`Requête non simulée : ${query}`);
  }

  #getAll<T>(query: string): T[] {
    if (!query.includes("attempt_journal")) {
      throw new Error(`Requête non simulée : ${query}`);
    }
    return this.legacyPayloads.map((payload) => ({ payload }) as T);
  }

  #run(query: string, ...parameters: string[]): void {
    if (query.includes("DELETE FROM attempt_outbox_state")) {
      if (this.failNextOutboxDelete) {
        this.failNextOutboxDelete = false;
        throw new Error("Suppression d'outbox simulée impossible.");
      }
      const [key] = parameters;
      if (key === undefined) throw new Error("Clé d'outbox absente.");
      this.outboxes.delete(key);
      return;
    }
    if (query.includes("DELETE FROM local_metadata")) {
      for (const key of parameters) this.metadata.delete(key);
      return;
    }
    if (query.includes("attempt_outbox_state")) {
      const [key, snapshot] = parameters;
      if (key === undefined || snapshot === undefined) {
        throw new Error("Snapshot incomplet.");
      }
      this.outboxes.set(key, snapshot);
      return;
    }
    if (query.includes("local_metadata")) {
      const [key, value] = parameters;
      if (key === undefined || value === undefined) {
        throw new Error("Métadonnée incomplète.");
      }
      if (this.metadata.has(key) && !query.includes("ON CONFLICT")) {
        throw new Error("Clé dupliquée.");
      }
      this.metadata.set(key, value);
      return;
    }
    if (query.includes("DELETE FROM attempt_journal")) {
      this.legacyPayloads.splice(0);
      return;
    }
    throw new Error(`Mutation non simulée : ${query}`);
  }

  #assertMainConnectionAvailable(): void {
    if (this.#transactionOpen) {
      throw new Error("Accès connexion principale pendant une transaction.");
    }
  }

  #assertTransactionOpen(): void {
    if (!this.#transactionOpen) throw new Error("Transaction absente.");
  }
}

function asDatabase(
  fake: FakeSQLiteDatabase | FakeSQLiteTransaction,
): SQLiteDatabase {
  return fake as unknown as SQLiteDatabase;
}

describe("outbox SQLite mobile", () => {
  it("conserve atomiquement le lot, sa clé et les projections après réouverture", async () => {
    const database = new FakeSQLiteDatabase();
    const first = new MobileAttemptOutboxStore(asDatabase(database));
    expect(await first.getOrCreateDeviceId(() => ids.device)).toBe(ids.device);
    await first.enqueue(submission);
    const prepared = await first.prepare(ids.idempotency);

    const reopened = new MobileAttemptOutboxStore(asDatabase(database));
    expect(
      await reopened.getOrCreateDeviceId(() => {
        throw new Error("ne doit pas recréer l'identité");
      }),
    ).toBe(ids.device);
    expect((await reopened.prepare(ids.ignoredIdempotency)).prepared).toEqual(
      prepared.prepared,
    );

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
    await reopened.applySuccess({
      syncRevision: 1,
      results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
      states: [state],
    });
    const afterCrashBoundary = new MobileAttemptOutboxStore(
      asDatabase(database),
    );
    const persisted = await afterCrashBoundary.read();
    expect(persisted.entries[0]?.status).toBe("synced");
    expect(persisted.syncRevision).toBe(1);
    expect(persisted.authoritativeStates).toEqual([state]);
  });

  it("migre un snapshot SQLite v2 avant de préparer un nouveau lot", async () => {
    const database = new FakeSQLiteDatabase();
    database.outboxes.set("attempts-v1", legacyV2Snapshot());
    const store = new MobileAttemptOutboxStore(asDatabase(database));

    const prepared = await store.prepare(ids.ignoredIdempotency);

    expect(prepared.prepared?.idempotencyKey).toBe(ids.ignoredIdempotency);
    expect(prepared.prepared?.batch.attempts[0]).not.toHaveProperty("itemId");
    expect(prepared.prepared?.batch.attempts[0]).not.toHaveProperty("skill");
    expect((await store.read()).schemaVersion).toBe(3);
  });

  it("migre puis purge le journal historique sans le rejouer", async () => {
    const database = new FakeSQLiteDatabase();
    database.legacyPayloads.push(
      JSON.stringify({
        ...submission,
        itemId: ids.item,
        skill: "listening",
        rating: 1,
        userId: null,
      }),
    );
    const store = new MobileAttemptOutboxStore(asDatabase(database));

    expect((await store.migrateLegacyJournal()).entries).toHaveLength(1);
    expect(database.legacyPayloads).toHaveLength(0);
    expect((await store.migrateLegacyJournal()).entries).toHaveLength(1);
  });

  it("importe le journal brut dans learning avant d'isoler uniquement la fixture", async () => {
    const database = new FakeSQLiteDatabase();
    database.legacyPayloads.push(
      JSON.stringify(legacyFixtureSubmission),
      JSON.stringify(submission),
    );
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );

    const migratedDemo = await demo.migrateLegacyFixtureAttemptsToDemo();

    expect(database.legacyPayloads).toHaveLength(0);
    expect(
      (await learning.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    expect(
      migratedDemo.entries.map(({ submission: item }) => item.eventId),
    ).toEqual([ids.fixtureEvent]);
  });

  it("répare atomiquement les vraies tentatives rangées en démo par l'ancien écran", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await demo.enqueue(legacyFixtureSubmission);
    await demo.enqueue(submission);
    database.metadata.set("demo:legacy_attempt_journal_migrated_v1", "done");

    const repairedDemo = await demo.migrateLegacyFixtureAttemptsToDemo();

    expect(
      (await learning.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    expect(
      repairedDemo.entries.map(({ submission: item }) => item.eventId),
    ).toEqual([ids.fixtureEvent]);
    expect(database.metadata.get("legacy_demo_namespace_repaired_v1")).toBe(
      "done",
    );
  });

  it("conserve les deux namespaces si la réparation démo rencontre une collision", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(submission);
    await demo.enqueue({ ...submission, selectedOptionId: ids.fixtureOptionB });
    database.metadata.set("demo:legacy_attempt_journal_migrated_v1", "done");
    const learningBefore = database.outboxes.get("attempts-v1");
    const demoBefore = database.outboxes.get("demo:attempts-v1");

    await expect(demo.migrateLegacyFixtureAttemptsToDemo()).rejects.toThrow(
      "n'ont pas pu être isolées",
    );

    expect(database.outboxes.get("attempts-v1")).toBe(learningBefore);
    expect(database.outboxes.get("demo:attempts-v1")).toBe(demoBefore);
    expect(database.metadata.has("legacy_demo_namespace_repaired_v1")).toBe(
      false,
    );
  });

  it("refuse un marqueur de migration corrompu sans purger l'historique", async () => {
    const database = new FakeSQLiteDatabase();
    database.metadata.set("legacy_attempt_journal_migrated_v1", "corrupt");
    database.legacyPayloads.push(JSON.stringify(submission));
    const store = new MobileAttemptOutboxStore(asDatabase(database));

    await expect(store.migrateLegacyJournal()).rejects.toThrow(
      "n'a pas pu être migré",
    );
    expect(database.legacyPayloads).toHaveLength(1);
    expect(database.outboxes.size).toBe(0);
  });

  it("sérialise deux mutations concurrentes sans SQLITE_BUSY ni perte", async () => {
    const database = new FakeSQLiteDatabase();
    const firstMount = new MobileAttemptOutboxStore(asDatabase(database));
    const strictModeMount = new MobileAttemptOutboxStore(asDatabase(database));
    const submissionB = {
      ...submission,
      eventId: ids.eventB,
      answeredAt: "2026-08-01T10:00:01.000Z",
    };

    await Promise.all([
      firstMount.enqueue(submission),
      strictModeMount.enqueue(submissionB),
    ]);

    expect(
      (await firstMount.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event, ids.eventB]);
  });

  it("isole la démonstration technique de l'outbox synchronisable", async () => {
    const database = new FakeSQLiteDatabase();
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    await demo.enqueue(submission);

    expect((await demo.read()).entries).toHaveLength(1);
    expect((await learning.read()).entries).toHaveLength(0);
  });

  it("déplace atomiquement l'ancienne fixture et conserve les vraies tentatives", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    await learning.enqueue(submission);

    const migrated = await demo.migrateLegacyFixtureAttemptsToDemo();

    expect(
      migrated.entries.map(({ submission: item }) => item.eventId),
    ).toEqual([ids.fixtureEvent]);
    expect(
      (await learning.read()).entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
  });

  it("rejoue la migration sans doublon si le payload exact existe déjà", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    await demo.enqueue(legacyFixtureSubmission);

    expect(
      (await demo.migrateLegacyFixtureAttemptsToDemo()).entries,
    ).toHaveLength(1);
    expect(
      (await demo.migrateLegacyFixtureAttemptsToDemo()).entries,
    ).toHaveLength(1);
    expect((await learning.read()).entries).toHaveLength(0);
  });

  it("refuse une collision de fixture sans modifier aucun namespace", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    await demo.enqueue({
      ...legacyFixtureSubmission,
      selectedOptionId: ids.fixtureOptionB,
    });
    const learningBefore = database.outboxes.get("attempts-v1");
    const demoBefore = database.outboxes.get("demo:attempts-v1");

    await expect(demo.migrateLegacyFixtureAttemptsToDemo()).rejects.toThrow(
      "n'ont pas pu être isolées",
    );
    expect(database.outboxes.get("attempts-v1")).toBe(learningBefore);
    expect(database.outboxes.get("demo:attempts-v1")).toBe(demoBefore);
  });

  it("conserve la source si le namespace démo est corrompu", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    database.outboxes.set("demo:attempts-v1", "{corrompu");
    const learningBefore = database.outboxes.get("attempts-v1");

    await expect(demo.migrateLegacyFixtureAttemptsToDemo()).rejects.toThrow(
      "n'ont pas pu être isolées",
    );
    expect(database.outboxes.get("attempts-v1")).toBe(learningBefore);
    expect(database.outboxes.get("demo:attempts-v1")).toBe("{corrompu");
  });

  it("refuse un lot fixture en vol sans le réécrire partiellement", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    await learning.prepare(ids.idempotency);
    const learningBefore = database.outboxes.get("attempts-v1");

    await expect(demo.migrateLegacyFixtureAttemptsToDemo()).rejects.toThrow(
      "n'ont pas pu être isolées",
    );
    expect(database.outboxes.get("attempts-v1")).toBe(learningBefore);
    expect(database.outboxes.has("demo:attempts-v1")).toBe(false);
  });

  it("refuse d'altérer une fixture déjà engagée dans une fusion active", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    await learning.enqueue(legacyFixtureSubmission);
    database.metadata.set(
      "anonymous_progress_fusion_v1",
      JSON.stringify({
        schemaVersion: 1,
        status: "awaiting_server_ack",
        fusionId: ids.idempotency,
        targetUserId: ids.userA,
        accountDeviceId: ids.deviceB,
        consentedAt: "2026-08-01T10:01:00.000Z",
        submissions: [{ ...legacyFixtureSubmission, deviceId: ids.deviceB }],
        acknowledgedEventIds: [],
      }),
    );
    const learningBefore = database.outboxes.get("attempts-v1");

    await expect(demo.migrateLegacyFixtureAttemptsToDemo()).rejects.toThrow(
      "n'ont pas pu être isolées",
    );
    expect(database.outboxes.get("attempts-v1")).toBe(learningBefore);
    expect(database.outboxes.has("demo:attempts-v1")).toBe(false);
  });

  it("bloque lecture, reprise et batch d'une ancienne fusion contaminée", async () => {
    const database = new FakeSQLiteDatabase();
    const account = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    const accountFixture = {
      ...legacyFixtureSubmission,
      deviceId: ids.deviceB,
    };
    await account.enqueue(accountFixture);
    await account.prepare(ids.ignoredIdempotency);
    database.metadata.set(
      "anonymous_progress_fusion_v1",
      JSON.stringify({
        schemaVersion: 1,
        status: "awaiting_server_ack",
        fusionId: ids.idempotency,
        targetUserId: ids.userA,
        accountDeviceId: ids.deviceB,
        consentedAt: "2026-08-01T10:01:00.000Z",
        submissions: [accountFixture],
        acknowledgedEventIds: [],
      }),
    );
    const accountKey = `attempts-v1:account:${ids.userA}`;
    const accountBefore = database.outboxes.get(accountKey);

    await expect(account.read()).rejects.toThrow("illisible");
    await expect(account.readFusionMarker()).rejects.toThrow("illisible");
    await expect(account.resumeAnonymousFusion()).rejects.toThrow(
      "fusion locale",
    );
    await expect(account.prepare(ids.idempotency)).rejects.toThrow(
      "n'a pas pu être mis à jour",
    );
    await expect(
      account.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.fixtureEvent, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("réponse serveur");
    expect(database.outboxes.get(accountKey)).toBe(accountBefore);
  });

  it("fusionne learning sain sans lire un namespace démo corrompu", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const account = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    await learning.enqueue(submission);
    database.outboxes.set("demo:attempts-v1", "{corrompu");

    const started = await account.startAnonymousFusion({
      fusionId: ids.idempotency,
      accountDeviceId: ids.deviceB,
      consentedAt: "2026-08-01T10:01:00.000Z",
    });

    expect(started.marker.status).toBe("awaiting_server_ack");
    expect(started.marker.submissions).toHaveLength(1);
    expect(database.outboxes.get("demo:attempts-v1")).toBe("{corrompu");
  });

  it("isole la fixture dans la même transaction avant toute fusion", async () => {
    const database = new FakeSQLiteDatabase();
    const learning = new MobileAttemptOutboxStore(asDatabase(database));
    const demo = new MobileAttemptOutboxStore(
      asDatabase(database),
      undefined,
      "demo",
    );
    const account = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    await learning.enqueue(legacyFixtureSubmission);
    await learning.enqueue(submission);

    const started = await account.startAnonymousFusion({
      fusionId: ids.idempotency,
      accountDeviceId: ids.deviceB,
      consentedAt: "2026-08-01T10:01:00.000Z",
    });

    expect(started.marker.status).toBe("awaiting_server_ack");
    if (started.marker.status !== "awaiting_server_ack") {
      throw new Error("Le marqueur de fusion devrait être actif.");
    }
    expect(started.marker.submissions).toHaveLength(1);
    expect(started.marker.submissions[0]?.exerciseId).toBe(ids.exercise);
    expect(
      started.anonymousSnapshot.entries.map(
        ({ submission: item }) => item.eventId,
      ),
    ).toEqual([ids.event]);
    expect(
      (await demo.read()).entries.map(({ submission: item }) => item.eventId),
    ).toEqual([ids.fixtureEvent]);
  });

  it("fusionne atomiquement puis efface la source après l'accusé serveur", async () => {
    const database = new FakeSQLiteDatabase();
    const anonymous = new MobileAttemptOutboxStore(asDatabase(database));
    const account = new MobileAttemptOutboxStore(asDatabase(database), {
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
    const otherAccount = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userB,
    });
    await expect(otherAccount.resumeAnonymousFusion()).resolves.toBeNull();
    expect((await otherAccount.read()).entries).toHaveLength(0);

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
    expect((await anonymous.read()).entries).toHaveLength(0);
    expect((await account.read()).entries[0]?.status).toBe("synced");
    await account.purgeOwnerData();
    expect(await account.readFusionMarker()).toBeNull();
    expect((await account.read()).entries).toHaveLength(0);
  });

  it("sépare les snapshots et dérive un device opaque par compte", async () => {
    const database = new FakeSQLiteDatabase();
    const accountA = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    const accountB = new MobileAttemptOutboxStore(asDatabase(database), {
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
    await expect(
      accountA.getOrCreateAccountDeviceId(() => {
        throw new Error("l’installation doit être conservée");
      }, sha256Hex),
    ).resolves.toBe(deviceA);
  });

  it("scelle atomiquement le compte et refuse une réponse sync tardive", async () => {
    const database = new FakeSQLiteDatabase();
    const anonymous = new MobileAttemptOutboxStore(asDatabase(database));
    const accountAFirstTask = new MobileAttemptOutboxStore(
      asDatabase(database),
      { kind: "account", userId: ids.userA },
    );
    const accountASecondTask = new MobileAttemptOutboxStore(
      asDatabase(database),
      { kind: "account", userId: ids.userA },
    );
    const accountB = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userB,
    });

    await anonymous.enqueue(submission);
    await accountB.enqueue(submission);
    await accountASecondTask.enqueue(submission);
    await accountASecondTask.prepare(ids.idempotency);
    expect(await accountASecondTask.isAccountTombstoned()).toBe(false);

    database.failNextOutboxDelete = true;
    await expect(
      accountAFirstTask.tombstoneAndPurgeAccountData(),
    ).rejects.toThrow("atomiquement");
    expect(database.outboxes.has(`attempts-v1:account:${ids.userA}`)).toBe(
      true,
    );
    expect(
      database.metadata.has(`deleted_account_subject_v1:${"11".repeat(32)}`),
    ).toBe(false);

    await accountAFirstTask.tombstoneAndPurgeAccountData();
    await expect(
      accountASecondTask.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("ne peut plus être réécrit");
    await expect(
      accountASecondTask.applyProgressSnapshot({
        syncRevision: 2,
        states: [],
      }),
    ).rejects.toThrow("ne peut plus être réécrit");
    await expect(accountASecondTask.read()).rejects.toThrow(
      "ne peut plus être réécrit",
    );
    await expect(accountASecondTask.purgeOwnerData()).rejects.toThrow(
      "ne peut plus être réécrit",
    );

    expect(await accountASecondTask.isAccountTombstoned()).toBe(true);
    await expect(
      accountASecondTask.tombstoneAndPurgeAccountData(),
    ).resolves.toBeUndefined();
    expect(database.outboxes.has(`attempts-v1:account:${ids.userA}`)).toBe(
      false,
    );
    expect(
      database.metadata.get(`deleted_account_subject_v1:${"11".repeat(32)}`),
    ).toBe("deleted");
    expect(JSON.stringify([...database.metadata])).not.toContain(ids.userA);
    expect((await anonymous.read()).entries).toHaveLength(1);
    expect((await accountB.read()).entries).toHaveLength(1);
  });

  it("scelle le compte malgré un marqueur de fusion corrompu et conserve la source anonyme", async () => {
    const database = new FakeSQLiteDatabase();
    const anonymous = new MobileAttemptOutboxStore(asDatabase(database));
    const account = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    await anonymous.enqueue(submission);
    await account.enqueue(submission);
    await account.prepare(ids.idempotency);
    const anonymousBefore = database.outboxes.get("attempts-v1");
    const corruptMarker = JSON.stringify({ schemaVersion: "corrupt" });
    database.metadata.set("anonymous_progress_fusion_v1", corruptMarker);

    await account.tombstoneAndPurgeAccountData();

    expect(await account.isAccountTombstoned()).toBe(true);
    expect(database.outboxes.has(`attempts-v1:account:${ids.userA}`)).toBe(
      false,
    );
    expect(database.outboxes.get("attempts-v1")).toBe(anonymousBefore);
    expect(database.metadata.get("anonymous_progress_fusion_v1")).toBe(
      corruptMarker,
    );
    await expect(
      account.applySuccess({
        syncRevision: 1,
        results: [{ eventId: ids.event, status: "accepted", rating: 1 }],
        states: [],
      }),
    ).rejects.toThrow("ne peut plus être réécrit");
  });
});
