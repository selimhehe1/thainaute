import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import {
  LOCAL_DATABASE_VERSION,
  initializeDatabase,
} from "../lib/initialize-database";

class FakeMigrationTransaction {
  readonly statements: string[];

  constructor(statements: string[]) {
    this.statements = statements;
  }

  async execAsync(statement: string): Promise<void> {
    this.statements.push(statement);
  }
}

class FakeMigrationDatabase {
  readonly mainStatements: string[] = [];
  readonly transactionStatements: string[] = [];
  readonly #version: number;
  transactionCount = 0;

  constructor(version: number) {
    this.#version = version;
  }

  async execAsync(statement: string): Promise<void> {
    this.mainStatements.push(statement);
  }

  async getFirstAsync<T>(): Promise<T> {
    return { user_version: this.#version } as T;
  }

  async withExclusiveTransactionAsync(
    callback: (transaction: SQLiteDatabase) => Promise<void>,
  ): Promise<void> {
    this.transactionCount += 1;
    const transaction = new FakeMigrationTransaction(
      this.transactionStatements,
    );
    await callback(transaction as unknown as SQLiteDatabase);
  }
}

describe("initialisation SQLite mobile", () => {
  it("applique v1 puis v2 dans une transaction sur une nouvelle base", async () => {
    const database = new FakeMigrationDatabase(0);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionCount).toBe(1);
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 1",
    );
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 2",
    );
  });

  it("reprend séquentiellement depuis v1 sans recréer le journal historique", async () => {
    const database = new FakeMigrationDatabase(1);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionStatements).toHaveLength(1);
    expect(database.transactionStatements[0]).toContain("attempt_outbox_state");
    expect(database.transactionStatements[0]).not.toContain("attempt_journal");
  });

  it("refuse une base plus récente sans tenter de downgrade", async () => {
    const database = new FakeMigrationDatabase(LOCAL_DATABASE_VERSION + 1);

    await expect(
      initializeDatabase(database as unknown as SQLiteDatabase),
    ).rejects.toThrow("version plus récente");
    expect(database.transactionCount).toBe(0);
  });
});
