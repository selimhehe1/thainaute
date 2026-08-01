import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import { MobileAttemptOutboxStore } from "../lib/attempt-outbox-store";

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
      if (this.metadata.has(key)) throw new Error("Clé dupliquée.");
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

  it("sépare snapshots, révisions et device IDs de deux comptes", async () => {
    const database = new FakeSQLiteDatabase();
    const accountA = new MobileAttemptOutboxStore(asDatabase(database), {
      kind: "account",
      userId: ids.userA,
    });
    const accountB = new MobileAttemptOutboxStore(asDatabase(database), {
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
  });
});
