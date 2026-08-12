import {
  abandonLocalExpeditionForVersionChange,
  abandonLocalLessonForVersionChange,
  discardLocalLessonQuestion,
  beginLocalOnboarding,
  completeLocalOnboarding,
  confirmLocalLessonResult,
  createLocalExperienceSnapshot,
  clearCompletedLocalExpedition,
  deserializeLocalExperienceSnapshot,
  finishLocalLesson,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  recordLocalExpeditionResult,
  saveLocalLessonDraft,
  selectLocalLessonOption,
  serializeLocalExperienceSnapshot,
  startLocalExpedition,
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

import {
  runMobileSQLiteTransaction,
  serializeMobileSQLiteOperation,
} from "./mobile-sqlite-operation-queue";

const EXPERIENCE_KEY = "local-experience-v1";

interface ExperienceRow {
  readonly snapshot: string;
}

export class MobileLocalExperienceStorageError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MobileLocalExperienceStorageError";
  }
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
      return await serializeMobileSQLiteOperation(this.#database, () =>
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

  public startExpedition(input: {
    readonly lessonVersionId: string;
    readonly exerciseIds: readonly string[];
    readonly startedAt: string;
  }): Promise<LocalExperienceSnapshot> {
    return this.#replace(input.startedAt, (snapshot) =>
      startLocalExpedition(snapshot, input),
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
    return this.#replace(replacement.startedAt, (snapshot) => {
      let next = abandonLocalLessonForVersionChange(
        snapshot,
        expectedCheckpoint,
        replacementTarget,
        outbox,
      );
      if (next.expedition !== null) {
        next = abandonLocalExpeditionForVersionChange(
          next,
          next.expedition,
          replacement.lessonVersionId,
        );
      }
      return startLocalLesson(next, replacement);
    });
  }

  public discardLessonQuestion(): Promise<LocalExperienceSnapshot> {
    return this.#replace(new Date().toISOString(), (snapshot) =>
      discardLocalLessonQuestion(snapshot),
    );
  }

  public abandonLessonForVersionChange(
    expectedCheckpoint: LocalLessonCheckpoint,
    replacementLessonVersionId: string,
    replacementExerciseId: string,
    outbox: AttemptOutboxSnapshot,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(new Date().toISOString(), (snapshot) =>
      abandonLocalLessonForVersionChange(
        snapshot,
        expectedCheckpoint,
        {
          lessonVersionId: replacementLessonVersionId,
          exerciseId: replacementExerciseId,
        },
        outbox,
      ),
    );
  }

  public openLessonQuestion(now: string): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      openLocalLessonQuestion(snapshot, now),
    );
  }

  public saveLessonDraft(
    draft: Parameters<typeof saveLocalLessonDraft>[1],
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      saveLocalLessonDraft(snapshot, draft, now),
    );
  }

  /**
   * Ouvre le checkpoint de l'exercice courant et conserve son choix dans une
   * seule transaction. Cela évite une chaîne de verrous SQLite lors du
   * premier choix d'une expédition sur Android.
   */
  public selectExpeditionOption(input: {
    readonly lessonVersionId: string;
    readonly exerciseId: string;
    readonly startedAt: string;
    readonly selectedOptionId: string;
    readonly now: string;
  }): Promise<LocalExperienceSnapshot> {
    return this.#replace(input.now, (snapshot) => {
      let next = snapshot;
      if (next.lesson === null) {
        next = startLocalLesson(next, {
          lessonVersionId: input.lessonVersionId,
          exerciseId: input.exerciseId,
          startedAt: input.startedAt,
        });
      } else if (next.lesson.phase !== "question") {
        if (next.lesson.phase !== "intro") {
          throw new Error(
            "Une autre question locale doit d'abord être terminée.",
          );
        }
        if (
          next.lesson.lessonVersionId !== input.lessonVersionId ||
          next.lesson.exerciseId !== input.exerciseId
        ) {
          throw new Error(
            "Une autre question locale doit d'abord être terminée.",
          );
        }
      } else if (
        next.lesson.lessonVersionId !== input.lessonVersionId ||
        next.lesson.exerciseId !== input.exerciseId
      ) {
        throw new Error(
          "Une autre question locale doit d'abord être terminée.",
        );
      }

      if (next.lesson?.phase === "intro") {
        next = openLocalLessonQuestion(next, input.now);
      }
      return selectLocalLessonOption(next, input.selectedOptionId, input.now);
    });
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

  public recordExpeditionResult(result: {
    readonly exerciseId: string;
    readonly rating: 0 | 1;
    readonly answeredAt: string;
  }): Promise<LocalExperienceSnapshot> {
    return this.#replace(result.answeredAt, (snapshot) =>
      recordLocalExpeditionResult(snapshot, result),
    );
  }

  public clearCompletedExpedition(
    now: string,
  ): Promise<LocalExperienceSnapshot> {
    return this.#replace(now, (snapshot) =>
      clearCompletedLocalExpedition(snapshot),
    );
  }

  async #replace(
    updatedAt: string,
    update: (snapshot: LocalExperienceSnapshot) => LocalExperienceSnapshot,
  ): Promise<LocalExperienceSnapshot> {
    try {
      return await serializeMobileSQLiteOperation(this.#database, async () => {
        let returned: LocalExperienceSnapshot | undefined;
        await runMobileSQLiteTransaction(
          this.#database,
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
