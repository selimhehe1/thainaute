import type { AttemptEvent } from "@thainaute/domain";
import { attemptBatchSchema, type AttemptBatchResponse } from "@thainaute/sync";
import { describe, expect, it } from "vitest";

import { AttemptApiError } from "../lib/server/attempt-sync/errors";
import type {
  AttemptRepository,
  AttemptSyncSnapshot,
  CommitAttemptBatchInput,
  CommitAttemptBatchResult,
  ServerExerciseAnswerKey,
} from "../lib/server/attempt-sync/ports";
import { createAttemptBatchSynchronizer } from "../lib/server/attempt-sync/service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const DEVICE_ID = "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_DEVICE_ID = "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const EVENT_ID = "40000000-0000-4000-8000-000000000001";
const SECOND_EVENT_ID = "40000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "41000000-0000-4000-8000-000000000001";
const ITEM_ID = "32000000-0000-4000-8000-000000000001";
const VERSION_ID = "31000000-0000-4000-8000-000000000001";
const CORRECT_OPTION_ID = "42000000-0000-4000-8000-000000000001";
const WRONG_OPTION_ID = "42000000-0000-4000-8000-000000000002";
const UNKNOWN_OPTION_ID = "42000000-0000-4000-8000-000000000003";
const IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";
const SECOND_IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000002";

const ANSWER_KEY: ServerExerciseAnswerKey = {
  exerciseId: EXERCISE_ID,
  itemId: ITEM_ID,
  correctOptionId: CORRECT_OPTION_ID,
  skill: "listening",
  contentVersionId: VERSION_ID,
  validOptionIds: [CORRECT_OPTION_ID, WRONG_OPTION_ID],
};

function attempt(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    eventId: EVENT_ID,
    deviceId: DEVICE_ID,
    exerciseId: EXERCISE_ID,
    selectedOptionId: CORRECT_OPTION_ID,
    answeredAt: "2026-08-01T10:00:00.000Z",
    durationMs: 1_200,
    contentVersionId: VERSION_ID,
    algorithmVersion: "srs-v0",
    ...overrides,
  };
}

interface StoredIdempotency {
  readonly requestSha256: string;
  readonly response: AttemptBatchResponse;
}

class MemoryAttemptRepository implements AttemptRepository {
  public revision = 0;
  public events: AttemptEvent[] = [];
  public commitCalls = 0;
  public loadCalls = 0;
  public forceOneRevisionConflict = false;
  private readonly idempotency = new Map<string, StoredIdempotency>();

  public async loadSnapshot(): Promise<AttemptSyncSnapshot> {
    this.loadCalls += 1;
    return {
      revision: this.revision,
      registeredDeviceIds: [DEVICE_ID],
      existingEvents: [...this.events],
      collidingEventIds: [],
      answerKeys: [ANSWER_KEY],
    };
  }

  public async commit(
    input: CommitAttemptBatchInput,
  ): Promise<CommitAttemptBatchResult> {
    this.commitCalls += 1;
    const stored = this.idempotency.get(input.idempotencyKey);
    if (stored !== undefined) {
      return stored.requestSha256 === input.requestSha256
        ? { kind: "replayed", response: stored.response }
        : { kind: "idempotency_conflict" };
    }

    if (this.forceOneRevisionConflict) {
      this.forceOneRevisionConflict = false;
      this.revision += 1;
      return { kind: "revision_conflict" };
    }

    if (input.expectedRevision !== this.revision) {
      return { kind: "revision_conflict" };
    }

    this.events.push(...input.events);
    this.revision += 1;
    this.idempotency.set(input.idempotencyKey, {
      requestSha256: input.requestSha256,
      response: input.response,
    });
    return { kind: "committed", response: input.response };
  }
}

function batch(...attempts: ReturnType<typeof attempt>[]) {
  return attemptBatchSchema.parse({ attempts });
}

describe("synchronisation autoritaire des tentatives", () => {
  it("calcule la note et l'identité côté serveur", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    });

    expect(response.results).toEqual([
      { eventId: EVENT_ID, status: "accepted", rating: 1 },
    ]);
    expect(response.syncRevision).toBe(1);
    expect(response.states[0]).toMatchObject({
      itemId: ITEM_ID,
      masteryPermille: 250,
      attemptCount: 1,
    });
    expect(repository.events[0]).toMatchObject({ userId: USER_ID, rating: 1 });
  });

  it("rejoue exactement la première réponse sans second effet", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);
    const input = {
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    };

    const first = await synchronize(input);
    const replay = await synchronize(input);

    expect(replay).toEqual(first);
    expect(replay.results[0]?.status).toBe("accepted");
    expect(repository.events).toHaveLength(1);
  });

  it("marque un replay tardif avec son ancienne révision", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);
    const firstInput = {
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    };
    await synchronize(firstInput);
    const latest = await synchronize({
      userId: USER_ID,
      idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      batch: batch(
        attempt({
          eventId: SECOND_EVENT_ID,
          answeredAt: "2026-08-02T10:00:00.000Z",
        }),
      ),
    });

    const lateReplay = await synchronize(firstInput);

    expect(latest.syncRevision).toBe(2);
    expect(lateReplay.syncRevision).toBe(1);
    expect(repository.revision).toBe(2);
  });

  it("refuse une clé réutilisée pour un autre corps", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);
    await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    });

    await expect(
      synchronize({
        userId: USER_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
        batch: batch(attempt({ selectedOptionId: WRONG_OPTION_ID })),
      }),
    ).rejects.toMatchObject({
      code: "idempotency_key_reused",
    } satisfies Partial<AttemptApiError>);
    expect(repository.events).toHaveLength(1);
  });

  it("traite une nouvelle clé et le même événement comme doublon", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);
    const requestBatch = batch(attempt());
    await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: requestBatch,
    });

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      batch: requestBatch,
    });

    expect(response.results[0]).toEqual({
      eventId: EVENT_ID,
      status: "duplicate",
      rating: 1,
    });
    expect(response.states[0]?.attemptCount).toBe(1);
    expect(repository.events).toHaveLength(1);
  });

  it("rejette une collision de contenu sans remplacer l'événement", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);
    await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    });

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      batch: batch(attempt({ selectedOptionId: WRONG_OPTION_ID })),
    });

    expect(response.results[0]).toEqual({
      eventId: EVENT_ID,
      status: "rejected",
      code: "event_id_collision",
    });
    expect(repository.events[0]?.selectedOptionId).toBe(CORRECT_OPTION_ID);
  });

  it("isole un appareil étranger dans un lot partiellement valide", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(
        attempt(),
        attempt({ eventId: SECOND_EVENT_ID, deviceId: OTHER_DEVICE_ID }),
      ),
    });

    expect(response.results).toEqual([
      { eventId: EVENT_ID, status: "accepted", rating: 1 },
      {
        eventId: SECOND_EVENT_ID,
        status: "rejected",
        code: "device_not_registered",
      },
    ]);
    expect(repository.events).toHaveLength(1);
  });

  it("rejette une option étrangère à l'exercice", async () => {
    const repository = new MemoryAttemptRepository();
    const synchronize = createAttemptBatchSynchronizer(repository);

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt({ selectedOptionId: UNKNOWN_OPTION_ID })),
    });

    expect(response).toEqual({
      syncRevision: 1,
      results: [
        {
          eventId: EVENT_ID,
          status: "rejected",
          code: "invalid_submission",
        },
      ],
      states: [],
    });
    expect(repository.events).toHaveLength(0);
  });

  it("ne révèle pas pourquoi la clé publiée est absente", async () => {
    const repository = new MemoryAttemptRepository();
    repository.loadSnapshot = async () => ({
      revision: 0,
      registeredDeviceIds: [DEVICE_ID],
      existingEvents: [],
      collidingEventIds: [],
      answerKeys: [],
    });
    const synchronize = createAttemptBatchSynchronizer(repository);

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    });

    expect(response).toEqual({
      syncRevision: 1,
      results: [
        {
          eventId: EVENT_ID,
          status: "rejected",
          code: "answer_key_not_found",
        },
      ],
      states: [],
    });
    expect(repository.events).toHaveLength(0);
  });

  it("échoue fermée si deux clés serveur divergent", async () => {
    const repository = new MemoryAttemptRepository();
    repository.loadSnapshot = async () => ({
      revision: 0,
      registeredDeviceIds: [DEVICE_ID],
      existingEvents: [],
      collidingEventIds: [],
      answerKeys: [
        ANSWER_KEY,
        {
          ...ANSWER_KEY,
          itemId: "32000000-0000-4000-8000-000000000099",
        },
      ],
    });
    const synchronize = createAttemptBatchSynchronizer(repository);

    await expect(
      synchronize({
        userId: USER_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
        batch: batch(attempt()),
      }),
    ).rejects.toMatchObject({ code: "database_unavailable" });
    expect(repository.commitCalls).toBe(0);
  });

  it("recharge et recalcule après un conflit de révision", async () => {
    const repository = new MemoryAttemptRepository();
    repository.forceOneRevisionConflict = true;
    const synchronize = createAttemptBatchSynchronizer(repository);

    const response = await synchronize({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      batch: batch(attempt()),
    });

    expect(response.results[0]?.status).toBe("accepted");
    expect(repository.loadCalls).toBe(2);
    expect(repository.commitCalls).toBe(2);
  });
});
