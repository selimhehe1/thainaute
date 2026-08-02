import {
  applyAnalyticsConsentDecision,
  createInitialAnalyticsConsentSnapshot,
  type AnalyticsConsentSnapshot,
} from "@thainaute/analytics";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import {
  MobileAnalyticsConsentCorruptionError,
  MobileAnalyticsConsentStore,
} from "../lib/mobile-analytics-consent-store";

function createDatabase(
  initialValue?: string,
  options: {
    readonly initialDenialValue?: string;
  } = {},
): SQLiteDatabase {
  const metadata = new Map<string, string>();
  if (initialValue !== undefined) {
    metadata.set("analytics_consent_v1", initialValue);
  }
  if (options.initialDenialValue !== undefined) {
    metadata.set("analytics_consent_denied_v1", options.initialDenialValue);
  }
  let transactionTail = Promise.resolve();

  const database = {
    async getFirstAsync<T>(_query: string, key: string): Promise<T | null> {
      const value = metadata.get(key);
      return (value === undefined ? null : { value }) as T | null;
    },
    async runAsync(
      query: string,
      key: string,
      value?: string,
    ): Promise<unknown> {
      if (query.trimStart().startsWith("DELETE")) {
        metadata.delete(key);
        return { changes: 1, lastInsertRowId: 0 };
      }
      if (value === undefined) {
        throw new Error("missing metadata value");
      }
      metadata.set(key, value);
      return { changes: 1, lastInsertRowId: 0 };
    },
    withExclusiveTransactionAsync(
      task: (transaction: SQLiteDatabase) => Promise<void>,
    ): Promise<void> {
      const next = transactionTail.then(() => task(database as SQLiteDatabase));
      transactionTail = next.catch(() => undefined);
      return next;
    },
  };

  return database as unknown as SQLiteDatabase;
}

describe("préférence analytics SQLite mobile", () => {
  it("reste inconnue et silencieuse lors de la première ouverture", async () => {
    const store = new MobileAnalyticsConsentStore(createDatabase());

    await expect(store.read()).resolves.toEqual(
      createInitialAnalyticsConsentSnapshot(),
    );
  });

  it("persiste le refus entre deux instances sans compte", async () => {
    const database = createDatabase();
    const first = new MobileAnalyticsConsentStore(database);
    const refused = await first.decide("denied", "2026-08-02T09:00:00.000Z");

    expect(refused).toMatchObject({ decision: "denied", revision: 1 });
    await expect(
      new MobileAnalyticsConsentStore(database).read(),
    ).resolves.toEqual(refused);
  });

  it("priorise le refus durable sur un ancien accord jusqu'à un nouvel accord explicite", async () => {
    const granted = applyAnalyticsConsentDecision(
      createInitialAnalyticsConsentSnapshot(),
      "granted",
      "2026-08-02T08:59:00.000Z",
    );
    const database = createDatabase(JSON.stringify(granted));
    const store = new MobileAnalyticsConsentStore(database);

    const refused = await store.decide("denied", "2026-08-02T09:00:00.000Z");
    expect(refused).toMatchObject({ decision: "denied", revision: 2 });
    await expect(
      new MobileAnalyticsConsentStore(database).read(),
    ).resolves.toEqual(refused);

    const regranted = await new MobileAnalyticsConsentStore(database).decide(
      "granted",
      "2026-08-02T09:01:00.000Z",
    );
    expect(regranted).toMatchObject({ decision: "granted", revision: 3 });
    await expect(
      new MobileAnalyticsConsentStore(database).read(),
    ).resolves.toEqual(regranted);
  });

  it("sérialise deux choix concurrents et conserve la dernière transaction", async () => {
    const store = new MobileAnalyticsConsentStore(createDatabase());
    const [granted, denied] = await Promise.all([
      store.decide("granted", "2026-08-02T09:00:00.000Z"),
      store.decide("denied", "2026-08-02T09:00:01.000Z"),
    ]);

    expect(granted).toMatchObject({ decision: "granted", revision: 1 });
    expect(denied).toMatchObject({ decision: "denied", revision: 2 });
    await expect(store.read()).resolves.toEqual(denied);
  });

  it("échoue fermé sur une valeur corrompue puis la répare sur refus explicite", async () => {
    const store = new MobileAnalyticsConsentStore(createDatabase("not-json"));

    await expect(store.read()).rejects.toBeInstanceOf(
      MobileAnalyticsConsentCorruptionError,
    );
    const repaired = await store.decide("denied", "2026-08-02T09:00:00.000Z");
    expect(repaired).toMatchObject({ decision: "denied", revision: 1 });
    await expect(store.read()).resolves.toEqual(repaired);
  });

  it("refuse une forme JSON qui n'est pas un snapshot strict", async () => {
    const invalid: Partial<AnalyticsConsentSnapshot> & { email: string } = {
      schemaVersion: 1,
      decision: "granted",
      revision: 1,
      updatedAt: "2026-08-02T09:00:00.000Z",
      email: "sensible@example.invalid",
    };
    const store = new MobileAnalyticsConsentStore(
      createDatabase(JSON.stringify(invalid)),
    );

    await expect(store.read()).rejects.toBeInstanceOf(
      MobileAnalyticsConsentCorruptionError,
    );
  });

  it("bloque un tombstone corrompu puis le répare sur un nouveau choix explicite", async () => {
    const granted = applyAnalyticsConsentDecision(
      createInitialAnalyticsConsentSnapshot(),
      "granted",
      "2026-08-02T09:00:00.000Z",
    );
    const database = createDatabase(JSON.stringify(granted), {
      initialDenialValue: "not-json",
    });
    const store = new MobileAnalyticsConsentStore(database);

    await expect(store.read()).rejects.toBeInstanceOf(
      MobileAnalyticsConsentCorruptionError,
    );
    const repaired = await store.decide("granted", "2026-08-02T09:01:00.000Z");
    expect(repaired).toMatchObject({ decision: "granted", revision: 1 });
    await expect(store.read()).resolves.toEqual(repaired);
  });
});
