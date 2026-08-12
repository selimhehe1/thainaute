import type { SQLiteDatabase } from "expo-sqlite";

const SQLITE_BUSY_RETRY_COUNT = 3;
const databasePathQueues = new Map<string, Promise<void>>();
const databaseObjectQueues = new WeakMap<object, Promise<void>>();

function isSqliteBusy(error: unknown): boolean {
  return (
    error instanceof Error &&
    /SQLITE_BUSY|database is locked/iu.test(error.message)
  );
}

async function retrySqliteBusy<T>(operation: () => Promise<T>): Promise<T> {
  for (let retry = 0; ; retry += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isSqliteBusy(error) || retry >= SQLITE_BUSY_RETRY_COUNT) {
        throw error;
      }
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 10 * (retry + 1)),
      );
    }
  }
}

/** Une seule opération SQLite à la fois par connexion, quel que soit l'adaptateur. */
export function serializeMobileSQLiteOperation<T>(
  database: SQLiteDatabase,
  operation: () => Promise<T>,
): Promise<T> {
  const databasePath = database.databasePath;
  const previous =
    (databasePath === undefined
      ? databaseObjectQueues.get(database)
      : databasePathQueues.get(databasePath)) ?? Promise.resolve();
  const result = previous.then(
    () => retrySqliteBusy(operation),
    () => retrySqliteBusy(operation),
  );
  const tail = result.then(
    () => undefined,
    () => undefined,
  );
  if (databasePath === undefined) {
    databaseObjectQueues.set(database, tail);
  } else {
    databasePathQueues.set(databasePath, tail);
  }
  void tail.finally(() => {
    if (databasePath === undefined) {
      if (databaseObjectQueues.get(database) === tail) {
        databaseObjectQueues.delete(database);
      }
      return;
    }
    if (databasePathQueues.get(databasePath) === tail) {
      databasePathQueues.delete(databasePath);
    }
  });
  return result;
}

/**
 * Exécute une transaction après la sérialisation par chemin de base.
 *
 * Les adaptateurs mobiles sérialisent déjà toutes leurs lectures et mutations
 * via `serializeMobileSQLiteOperation`. La transaction exclusive transmet la
 * connexion transactionnelle à toutes les requêtes du callback ; le fallback
 * non exclusif reste disponible pour les adaptateurs qui ne l'exposent pas.
 */
export async function runMobileSQLiteTransaction<T>(
  database: SQLiteDatabase,
  operation: (transaction: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  let result!: T;
  if (typeof database.withExclusiveTransactionAsync === "function") {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      result = await operation(transaction);
    });
  } else if (typeof database.withTransactionAsync === "function") {
    await database.withTransactionAsync(async () => {
      result = await operation(database);
    });
  } else {
    throw new Error("SQLite ne fournit aucune API de transaction.");
  }
  return result;
}
