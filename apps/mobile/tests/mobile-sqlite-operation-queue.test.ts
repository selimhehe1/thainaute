import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import {
  runMobileSQLiteTransaction,
  serializeMobileSQLiteOperation,
} from "../lib/mobile-sqlite-operation-queue";

describe("file SQLite mobile", () => {
  it("utilise la connexion transactionnelle exclusive", async () => {
    let transactionCount = 0;
    let exclusiveTransactionCount = 0;
    const database = {
      databasePath: "mobile-sqlite-operation-queue-test",
      async withTransactionAsync(task: () => Promise<void>): Promise<void> {
        transactionCount += 1;
        await task();
      },
      async withExclusiveTransactionAsync(
        task: (transaction: SQLiteDatabase) => Promise<void>,
      ): Promise<void> {
        exclusiveTransactionCount += 1;
        await task({ databasePath: "transaction" } as SQLiteDatabase);
      },
    } as unknown as SQLiteDatabase;

    let seenConnection: SQLiteDatabase | undefined;
    const result = await serializeMobileSQLiteOperation(database, () =>
      runMobileSQLiteTransaction(database, async (transaction) => {
        seenConnection = transaction;
        return "ok";
      }),
    );

    expect(result).toBe("ok");
    if (seenConnection === undefined) throw new Error("transaction missing");
    expect(seenConnection).not.toBe(database);
    expect(seenConnection.databasePath).toBe("transaction");
    expect(transactionCount).toBe(0);
    expect(exclusiveTransactionCount).toBe(1);
  });
});
