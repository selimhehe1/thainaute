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
  it("applique v1 à v4 dans une transaction sur une nouvelle base", async () => {
    const database = new FakeMigrationDatabase(0);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionCount).toBe(1);
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 1",
    );
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 2",
    );
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 3",
    );
    expect(database.transactionStatements.join("\n")).toContain(
      "PRAGMA user_version = 4",
    );
  });

  it("reprend séquentiellement depuis v1 sans recréer le journal historique", async () => {
    const database = new FakeMigrationDatabase(1);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionStatements).toHaveLength(3);
    expect(database.transactionStatements[0]).toContain("attempt_outbox_state");
    expect(database.transactionStatements[0]).not.toContain("attempt_journal");
    expect(database.transactionStatements[1]).toContain(
      "local_experience_state",
    );
    expect(database.transactionStatements[2]).toContain("public_content_cache");
  });

  it("reprend depuis v2 en ajoutant seulement le parcours local", async () => {
    const database = new FakeMigrationDatabase(2);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionStatements).toHaveLength(2);
    expect(database.transactionStatements[0]).toContain(
      "local_experience_state",
    );
    expect(database.transactionStatements[0]).not.toContain(
      "attempt_outbox_state",
    );
    expect(database.transactionStatements[1]).toContain("public_content_cache");
  });

  it("reprend depuis v3 en ajoutant seulement le cache public", async () => {
    const database = new FakeMigrationDatabase(3);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionStatements).toHaveLength(1);
    expect(database.transactionStatements[0]).toContain("public_content_cache");
    expect(database.transactionStatements[0]).not.toContain(
      "local_experience_state",
    );
  });

  it("ne rouvre aucune transaction quand la base est déjà en v4", async () => {
    const database = new FakeMigrationDatabase(4);
    await initializeDatabase(database as unknown as SQLiteDatabase);

    expect(database.transactionCount).toBe(0);
  });

  it("refuse une base plus récente sans tenter de downgrade", async () => {
    const database = new FakeMigrationDatabase(LOCAL_DATABASE_VERSION + 1);

    await expect(
      initializeDatabase(database as unknown as SQLiteDatabase),
    ).rejects.toThrow("version plus récente");
    expect(database.transactionCount).toBe(0);
  });
});
