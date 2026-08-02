import type { SQLiteDatabase } from "expo-sqlite";

export const LOCAL_DATABASE_VERSION = 3;

/** Migrations locales séquentielles, transactionnelles et sans downgrade. */
export async function initializeDatabase(
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const versionRow = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion > LOCAL_DATABASE_VERSION) {
    throw new Error(
      "Cette base locale provient d'une version plus récente de Thaïnaute.",
    );
  }
  if (currentVersion === LOCAL_DATABASE_VERSION) return;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    if (currentVersion < 1) {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS local_metadata (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS attempt_journal (
          event_id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'synced')),
          created_at TEXT NOT NULL
        );
        PRAGMA user_version = 1;
      `);
    }

    if (currentVersion < 2) {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS attempt_outbox_state (
          key TEXT PRIMARY KEY NOT NULL,
          snapshot TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        PRAGMA user_version = 2;
      `);
    }

    if (currentVersion < 3) {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS local_experience_state (
          key TEXT PRIMARY KEY NOT NULL,
          snapshot TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        PRAGMA user_version = 3;
      `);
    }
  });
}
