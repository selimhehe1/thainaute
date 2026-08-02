import {
  abandonLocalLessonForVersionChange,
  beginLocalOnboarding,
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createLocalExperienceSnapshot,
  deserializeLocalExperienceSnapshot,
  finishLocalLesson,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  selectLocalLessonOption,
  serializeLocalExperienceSnapshot,
  startLocalLesson,
  updateLocalOnboarding,
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  attemptOutboxOwnerSchema,
  attemptOutboxOwnersAreEqual,
  attemptOutboxOwnerStorageKey,
  type AttemptOutboxOwner,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type LocalLessonCheckpoint,
  type LocalLessonReplacementTarget,
  type LocalOnboardingSelection,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";

const EXPERIENCE_KEY = "local-experience-v1";
const SQLITE_BUSY_RETRY_COUNT = 3;

interface ExperienceRow {
  readonly snapshot: string;
}

const databaseQueues = new WeakMap<object, Promise<void>>();

export class MobileLocalExperienceStorageError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MobileLocalExperienceStorageError";
  }
}

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
      if (!isSqliteBusy(error) || retry >= SQLITE_BUSY_RETRY_COUNT) throw error;
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 10 * (retry + 1)),
      );
    }
  }
}

function serializeDatabaseOperation<T>(
  database: SQLiteDatabase,
  operation: () => Promise<T>,
): Promise<T> {
  const previous = databaseQueues.get(database) ?? Promise.resolve();
  const result = previous.then(
    () => retrySqliteBusy(operation),
    () => retrySqliteBusy(operation),
  );
  const tail = result.then(
    () => undefined,
    () => undefined,
  );
  databaseQueues.set(database, tail);
  void tail.finally(() => {
    if (databaseQueues.get(database) === tail) databaseQueues.delete(database);
  });
  return result;
}

async function readSnapshot(
  database: SQLiteDatabase,
  experienceKey: string,
  owner: AttemptOutboxOwner,
): Promise<LocalExperienceSnapshot> {
  const row = await database.getFirstAsync<ExperienceRow>(
    "SELECT snapshot FROM local_experience_state WHERE key = ?",
    experienceKey,
  );
  if (row === null) return createLocalExperienceSnapshot(owner);
  const snapshot = deserializeLocalExperienceSnapshot(row.snapshot);
  if (!attemptOutboxOwnersAreEqual(snapshot.owner, owner)) {
    throw new Error("Le propriétaire du parcours local ne correspond pas.");
  }
  return snapshot;
}

async function writeSnapshot(
  database: SQLiteDatabase,
  experienceKey: string,
  snapshot: LocalExperienceSnapshot,
  updatedAt: string,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO local_experience_state (key, snapshot, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (key) DO UPDATE SET
       snapshot = excluded.snapshot,
       updated_at = excluded.updated_at`,
    experienceKey,
    serializeLocalExperienceSnapshot(snapshot),
    updatedAt,
  );
}

/** Adaptateur SQLite strict du parcours local. Une ligne corrompue n'est jamais remplacée. */
export class MobileLocalExperienceStore {
  readonly #database: SQLiteDatabase;
  readonly #experienceKey: string;
  readonly #owner: AttemptOutboxOwner;

  public constructor(
    database: SQLiteDatabase,
    ownerInput: AttemptOutboxOwner = ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  ) {
    this.#database = database;
    this.#owner = attemptOutboxOwnerSchema.parse(ownerInput);
    this.#experienceKey = `${EXPERIENCE_KEY}:${attemptOutboxOwnerStorageKey(this.#owner)}`;
  }

  public async read(): Promise<LocalExperienceSnapshot> {
    try {
      return await serializeDatabaseOperation(this.#database, () =>
        readSnapshot(this.#database, this.#experienceKey, this.#owner),
      );
    } catch (error) {
      throw new MobileLocalExperienceStorageError(
        "Le parcours local est illisible et n'a pas été écrasé.",
        { cause: error },
      );
    }
  }

  public beginOnboarding(now: string): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      beginLocalOnboarding(snapshot, now),
    );
  }

  public updateOnboarding(
    update: Partial<LocalOnboardingSelection>,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      updateLocalOnboarding(snapshot, update, now),
    );
  }

  public completeOnboarding(
    selection: LocalOnboardingSelection,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      completeLocalOnboarding(snapshot, selection, now),
    );
  }

  public startLesson(input: {
    readonly lessonVersionId: string;
    readonly exerciseId: string;
    readonly startedAt: string;
  }): Promise<LocalExperienceSnapshot> {
    return this.#replace(input.startedAt, (snapshot) =>
      startLocalLesson(snapshot, input),
    );
  }

  public replaceLessonVersion(
    expectedCheckpoint: LocalLessonCheckpoint,
    replacement: LocalLessonReplacementTarget & { readonly startedAt: string },
    outbox: AttemptOutboxSnapshot,
  ): Promise<LocalExperienceSnapshot> {
    const replacementTarget = {
      lessonVersionId: replacement.lessonVersionId,
      exerciseId: replacement.exerciseId,
    };
    return this.#replace(replacement.startedAt, (snapshot) =>
      startLocalLesson(
        abandonLocalLessonForVersionChange(
          snapshot,
          expectedCheckpoint,
          replacementTarget,
          outbox,
        ),
        replacement,
      ),
    );
  }

  public openLessonQuestion(now: string): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      openLocalLessonQuestion(snapshot, now),
    );
  }

  public selectLessonOption(
    selectedOptionId: string,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      selectLocalLessonOption(snapshot, selectedOptionId, now),
    );
  }

  public prepareLessonSubmission(
    submission: ValidatedAttemptSubmission,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      prepareLocalLessonSubmission(snapshot, submission, now),
    );
  }

  public confirmLessonResult(
    outbox: AttemptOutboxSnapshot,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      confirmLocalLessonResult(snapshot, outbox, now),
    );
  }

  public finishLesson(
    outbox: AttemptOutboxSnapshot,
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      finishLocalLesson(snapshot, outbox, now),
    );
  }

  async #replace(
    updatedAt: string,
    update: (snapshot: LocalExperienceSnapshot) => LocalExperienceSnapshot,
  ): Promise<LocalExperienceSnapshot> {
    try {
      return await serializeDatabaseOperation(this.#database, async () => {
        let returned: LocalExperienceSnapshot | undefined;
        await this.#database.withExclusiveTransactionAsync(
          async (transaction) => {
            const current = await readSnapshot(
              transaction,
              this.#experienceKey,
              this.#owner,
            );
            const next = update(current);
            await writeSnapshot(
              transaction,
              this.#experienceKey,
              next,
              updatedAt,
            );
            returned = next;
          },
        );
        if (returned === undefined) {
          throw new Error("La transaction locale n'a renvoyé aucun état.");
        }
        return returned;
      });
    } catch (error) {
      if (error instanceof MobileLocalExperienceStorageError) throw error;
      throw new MobileLocalExperienceStorageError(
        "Le parcours local n'a pas pu être mis à jour.",
        { cause: error },
      );
    }
  }
}
