import {
  applyAnalyticsConsentDecision,
  createInitialAnalyticsConsentSnapshot,
  parseAnalyticsConsentSnapshot,
  type AnalyticsConsentDecision,
  type AnalyticsConsentSnapshot,
} from "@thainaute/analytics";
import type { SQLiteDatabase } from "expo-sqlite";

import {
  runMobileSQLiteTransaction,
  serializeMobileSQLiteOperation,
} from "./mobile-sqlite-operation-queue";

const ANALYTICS_CONSENT_METADATA_KEY = "analytics_consent_v1";
const ANALYTICS_DENIAL_METADATA_KEY = "analytics_consent_denied_v1";
const UPSERT_METADATA_SQL = `INSERT INTO local_metadata (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value`;

export class MobileAnalyticsConsentCorruptionError extends Error {
  public constructor() {
    super(
      "La préférence analytics locale est illisible. Aucun événement n'est autorisé.",
    );
    this.name = "MobileAnalyticsConsentCorruptionError";
  }
}

export interface MobileAnalyticsConsentStorePort {
  read(): Promise<AnalyticsConsentSnapshot>;
  decide(
    decision: Exclude<AnalyticsConsentDecision, "unknown">,
    updatedAt: string,
  ): Promise<AnalyticsConsentSnapshot>;
}

function parseStoredSnapshot(value: string): AnalyticsConsentSnapshot {
  try {
    const parsed = parseAnalyticsConsentSnapshot(JSON.parse(value) as unknown);
    if (parsed !== null) return parsed;
  } catch {
    // La même erreur fermée couvre JSON invalide et snapshot non canonique.
  }
  throw new MobileAnalyticsConsentCorruptionError();
}

async function readStoredSnapshot(
  database: Pick<SQLiteDatabase, "getFirstAsync">,
): Promise<AnalyticsConsentSnapshot> {
  const denialRow = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM local_metadata WHERE key = ?",
    ANALYTICS_DENIAL_METADATA_KEY,
  );
  if (denialRow !== null) {
    const denial = parseStoredSnapshot(denialRow.value);
    if (denial.decision !== "denied") {
      throw new MobileAnalyticsConsentCorruptionError();
    }
    return denial;
  }

  const row = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM local_metadata WHERE key = ?",
    ANALYTICS_CONSENT_METADATA_KEY,
  );
  return row === null
    ? createInitialAnalyticsConsentSnapshot()
    : parseStoredSnapshot(row.value);
}

async function readSnapshotForExplicitDecision(
  database: Pick<SQLiteDatabase, "getFirstAsync">,
): Promise<AnalyticsConsentSnapshot> {
  try {
    return await readStoredSnapshot(database);
  } catch (error) {
    if (!(error instanceof MobileAnalyticsConsentCorruptionError)) {
      throw error;
    }
    return createInitialAnalyticsConsentSnapshot();
  }
}

/**
 * Persistance globale à l'installation. Elle n'est jamais rattachée au compte
 * et partage la table clé/valeur déjà créée par la migration SQLite v1.
 */
export class MobileAnalyticsConsentStore implements MobileAnalyticsConsentStorePort {
  public constructor(private readonly database: SQLiteDatabase) {}

  public read(): Promise<AnalyticsConsentSnapshot> {
    return this.enqueue(async () => {
      let snapshot: AnalyticsConsentSnapshot | null = null;
      await runMobileSQLiteTransaction(this.database, async (transaction) => {
        snapshot = await readStoredSnapshot(transaction);
      });
      if (snapshot === null) {
        throw new Error("La lecture du consentement n'a pas été confirmée.");
      }
      return snapshot;
    });
  }

  public decide(
    decision: Exclude<AnalyticsConsentDecision, "unknown">,
    updatedAt: string,
  ): Promise<AnalyticsConsentSnapshot> {
    return this.enqueue(() => this.persistDecision(decision, updatedAt));
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return serializeMobileSQLiteOperation(this.database, operation);
  }

  private async persistDecision(
    decision: Exclude<AnalyticsConsentDecision, "unknown">,
    updatedAt: string,
  ): Promise<AnalyticsConsentSnapshot> {
    let persisted: AnalyticsConsentSnapshot | null = null;

    if (decision === "denied") {
      // Le tombstone denied est l'état autoritaire jusqu'à un nouvel accord.
      // L'ancien snapshot peut rester présent : read() consulte toujours ce
      // refus en premier dans une transaction cohérente.
      await runMobileSQLiteTransaction(this.database, async (transaction) => {
        const current = await readSnapshotForExplicitDecision(transaction);
        const next = applyAnalyticsConsentDecision(
          current,
          decision,
          updatedAt,
        );
        await transaction.runAsync(
          UPSERT_METADATA_SQL,
          ANALYTICS_DENIAL_METADATA_KEY,
          JSON.stringify(next),
        );
        persisted = next;
      });

      if (persisted === null) {
        throw new Error(
          "Le tombstone de retrait analytics n'a pas été confirmé.",
        );
      }

      return persisted;
    }

    await runMobileSQLiteTransaction(this.database, async (transaction) => {
      // Une action explicite de l'utilisateur peut réparer une ancienne valeur
      // corrompue. Avant cette action, read() reste strictement fail-closed.
      const current = await readSnapshotForExplicitDecision(transaction);

      const next = applyAnalyticsConsentDecision(current, decision, updatedAt);
      await transaction.runAsync(
        UPSERT_METADATA_SQL,
        ANALYTICS_CONSENT_METADATA_KEY,
        JSON.stringify(next),
      );
      await transaction.runAsync(
        "DELETE FROM local_metadata WHERE key = ?",
        ANALYTICS_DENIAL_METADATA_KEY,
      );
      persisted = next;
    });

    if (persisted === null) {
      throw new Error("La transaction de consentement n'a pas été confirmée.");
    }
    return persisted;
  }
}
