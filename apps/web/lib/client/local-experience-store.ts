"use client";

import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  createLocalExperienceSnapshot,
  deserializeLocalExperienceSnapshot,
  localExperienceSnapshotSchema,
  serializeLocalExperienceSnapshot,
  type AttemptOutboxOwner,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";
import Dexie, { type EntityTable } from "dexie";

const SNAPSHOT_KEY = "local-experience-v1";

interface LocalExperienceRow {
  readonly key: string;
  readonly snapshot: string;
}

type LocalExperienceDatabase = Dexie & {
  readonly snapshots: EntityTable<LocalExperienceRow, "key">;
};

function openDatabase(name: string): LocalExperienceDatabase {
  const database = new Dexie(name) as LocalExperienceDatabase;
  database.version(1).stores({ snapshots: "&key" });
  return database;
}

function parseStoredSnapshot(
  row: LocalExperienceRow | undefined,
  owner: AttemptOutboxOwner,
): LocalExperienceSnapshot {
  if (row === undefined) return createLocalExperienceSnapshot(owner);

  try {
    const snapshot = deserializeLocalExperienceSnapshot(row.snapshot);
    if (!attemptOutboxOwnersAreEqual(snapshot.owner, owner)) {
      throw new Error("Le propriétaire du parcours local ne correspond pas.");
    }
    return snapshot;
  } catch (error) {
    throw new LocalExperienceStorageError(
      "Le parcours local est illisible et n’a pas été écrasé.",
      { cause: error },
    );
  }
}

export class LocalExperienceStorageError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LocalExperienceStorageError";
  }
}

/**
 * Stockage local d'interface, séparé de l'outbox qui reste la seule source de
 * progression. Chaque mutation relit, valide puis remplace le snapshot dans
 * une transaction afin de ne jamais écraser silencieusement une ligne cassée.
 */
export class WebLocalExperienceStore {
  readonly #database: LocalExperienceDatabase;
  readonly #owner: AttemptOutboxOwner;
  readonly #snapshotKey: string;

  public constructor(
    databaseName = "thainaute-local-experience-v1",
    ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  ) {
    this.#database = openDatabase(databaseName);
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    const scope = attemptOutboxOwnerStorageKey(this.#owner);
    this.#snapshotKey =
      this.#owner.kind === "anonymous"
        ? SNAPSHOT_KEY
        : `${SNAPSHOT_KEY}:${scope}`;
  }

  public async read(): Promise<LocalExperienceSnapshot> {
    try {
      return parseStoredSnapshot(
        await this.#database.snapshots.get(this.#snapshotKey),
        this.#owner,
      );
    } catch (error) {
      if (error instanceof LocalExperienceStorageError) throw error;
      throw new LocalExperienceStorageError(
        "Le parcours local est temporairement indisponible.",
        { cause: error },
      );
    }
  }

  public async update(
    mutate: (snapshot: LocalExperienceSnapshot) => LocalExperienceSnapshot,
  ): Promise<LocalExperienceSnapshot> {
    try {
      return await this.#database.transaction(
        "rw",
        this.#database.snapshots,
        async () => {
          const current = parseStoredSnapshot(
            await this.#database.snapshots.get(this.#snapshotKey),
            this.#owner,
          );
          const next = localExperienceSnapshotSchema.parse(mutate(current));
          if (!attemptOutboxOwnersAreEqual(next.owner, this.#owner)) {
            throw new LocalExperienceStorageError(
              "Le propriétaire du parcours local ne peut pas être modifié.",
            );
          }
          await this.#database.snapshots.put({
            key: this.#snapshotKey,
            snapshot: serializeLocalExperienceSnapshot(next),
          });
          return next;
        },
      );
    } catch (error) {
      if (error instanceof LocalExperienceStorageError) throw error;
      throw new LocalExperienceStorageError(
        "Le parcours local n’a pas pu être mis à jour.",
        { cause: error },
      );
    }
  }

  public close(): void {
    this.#database.close();
  }

  public async deleteForTests(): Promise<void> {
    const name = this.#database.name;
    this.#database.close();
    await Dexie.delete(name);
  }
}
