import {
  createAttemptOutboxSnapshot,
  enqueueAttempt,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";
import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import {
  MobileLocalExperienceStorageError,
  MobileLocalExperienceStore,
} from "../lib/mobile-local-experience-store";

const ids = {
  device: "10000000-0000-4000-8000-000000000001",
  event: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000003",
  option: "10000000-0000-4000-8000-000000000004",
  lesson: "10000000-0000-4000-8000-000000000005",
} as const;
const startedAt = "2026-08-02T08:00:00.000Z";

class FakeExperienceDatabase {
  stored: string | null = null;
  readonly queries: string[] = [];
  writeCount = 0;
  transactionCount = 0;

  async getFirstAsync<T>(query: string): Promise<T | null> {
    this.queries.push(query);
    return this.stored === null ? null : ({ snapshot: this.stored } as T);
  }

  async runAsync(query: string, _key: string, snapshot: string): Promise<void> {
    this.queries.push(query);
    this.stored = snapshot;
    this.writeCount += 1;
  }

  async withExclusiveTransactionAsync(
    callback: (transaction: SQLiteDatabase) => Promise<void>,
  ): Promise<void> {
    this.transactionCount += 1;
    await callback(this as unknown as SQLiteDatabase);
  }
}

function createStore(database = new FakeExperienceDatabase()) {
  return {
    database,
    store: new MobileLocalExperienceStore(
      database as unknown as SQLiteDatabase,
    ),
  };
}

async function completedOnboarding(
  store: MobileLocalExperienceStore,
): Promise<LocalExperienceSnapshot> {
  return store.completeOnboarding(
    {
      goalOptionId: "prototype_goal_regular",
      motivationOptionId: "prototype_motivation_daily_life",
      experienceOptionId: "prototype_experience_new",
    },
    startedAt,
  );
}

describe("stockage du parcours local mobile", () => {
  it("retourne un snapshot vierge sans écrire sur une base vide", async () => {
    const { database, store } = createStore();

    await expect(store.read()).resolves.toEqual({
      schemaVersion: 1,
      owner: { kind: "anonymous" },
      onboarding: { status: "not_started" },
      lesson: null,
    });
    expect(database.writeCount).toBe(0);
  });

  it("persiste l’onboarding et le checkpoint dans des transactions", async () => {
    const { database, store } = createStore();
    await completedOnboarding(store);
    await store.startLesson({
      lessonVersionId: ids.lesson,
      exerciseId: ids.exercise,
      startedAt,
    });
    await store.openLessonQuestion("2026-08-02T08:00:01.000Z");
    await store.selectLessonOption(ids.option, "2026-08-02T08:00:02.000Z");

    await expect(store.read()).resolves.toMatchObject({
      onboarding: {
        status: "completed",
        goalOptionId: "prototype_goal_regular",
        motivationOptionId: "prototype_motivation_daily_life",
        experienceOptionId: "prototype_experience_new",
      },
      lesson: {
        phase: "question",
        lessonVersionId: ids.lesson,
        exerciseId: ids.exercise,
        selectedOptionId: ids.option,
      },
    });
    expect(database.transactionCount).toBe(4);
    expect(
      database.queries.every((query) =>
        query.includes("local_experience_state"),
      ),
    ).toBe(true);
    expect(
      database.queries.some((query) => query.includes("attempt_outbox_state")),
    ).toBe(false);
  });

  it("récupère un résultat durable après la fenêtre de crash", async () => {
    const { store } = createStore();
    await completedOnboarding(store);
    await store.startLesson({
      lessonVersionId: ids.lesson,
      exerciseId: ids.exercise,
      startedAt,
    });
    await store.openLessonQuestion("2026-08-02T08:00:01.000Z");
    await store.selectLessonOption(ids.option, "2026-08-02T08:00:02.000Z");
    const submission = {
      eventId: ids.event,
      deviceId: ids.device,
      exerciseId: ids.exercise,
      selectedOptionId: ids.option,
      answeredAt: "2026-08-02T08:00:03.000Z",
      durationMs: 1_000,
      contentVersionId: ids.lesson,
      algorithmVersion: "srs-v0",
    } as const;
    await store.prepareLessonSubmission(submission, "2026-08-02T08:00:03.000Z");
    const outbox = enqueueAttempt(createAttemptOutboxSnapshot(), submission);

    await expect(
      store.confirmLessonResult(outbox, "2026-08-02T08:00:04.000Z"),
    ).resolves.toMatchObject({
      lesson: {
        phase: "result",
        submission: {
          selectedOptionId: ids.option,
          eventId: ids.event,
        },
      },
    });
  });

  it("refuse une ligne corrompue sans l’écraser", async () => {
    const { database, store } = createStore();
    database.stored = '{"schemaVersion":1,"onboarding":{"status":"completed"}}';

    await expect(store.read()).rejects.toBeInstanceOf(
      MobileLocalExperienceStorageError,
    );
    await expect(
      store.beginOnboarding("2026-08-02T08:00:01.000Z"),
    ).rejects.toBeInstanceOf(MobileLocalExperienceStorageError);
    expect(database.writeCount).toBe(0);
    expect(database.stored).toContain('"status":"completed"');
  });
});
