import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";

import {
  ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
  MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES,
  MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES,
  AttemptOutboxCapacityError,
  AttemptOutboxEventCollisionError,
  AttemptOutboxResponseMismatchError,
  applyAttemptOutboxSuccess,
  attemptOutboxSnapshotSchema,
  createAttemptOutboxSnapshot,
  deserializeAttemptOutboxSnapshot,
  enqueueAttempt,
  prepareAttemptOutboxBatch,
  resumeAttemptOutboxAfterDeviceRegistration,
  serializeAttemptOutboxSnapshot,
  type AttemptBatchResponse,
  type AttemptOutboxSnapshot,
  type LearnerItemState,
  type ValidatedAttemptSubmission,
} from "../src/index";

const ids = {
  device: "00000000-0000-4000-8000-000000009001",
  exercise: "00000000-0000-4000-8000-000000009002",
  item: "00000000-0000-4000-8000-000000009003",
  option: "00000000-0000-4000-8000-000000009004",
  contentVersion: "00000000-0000-4000-8000-000000009005",
  batchA: "00000000-0000-4000-8000-000000009006",
  batchB: "00000000-0000-4000-8000-000000009007",
} as const;

function eventId(sequence: number): string {
  return `00000000-0000-4000-8000-${sequence.toString().padStart(12, "0")}`;
}

function submission(
  sequence: number,
  answeredAt = new Date(Date.UTC(2026, 7, 1, 8, 0, sequence)).toISOString(),
): ValidatedAttemptSubmission {
  return {
    eventId: eventId(sequence),
    deviceId: ids.device,
    exerciseId: ids.exercise,
    selectedOptionId: ids.option,
    answeredAt,
    durationMs: 1_000,
    contentVersionId: ids.contentVersion,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function legacySubmission(
  sequence: number,
  answeredAt = new Date(Date.UTC(2026, 7, 1, 8, 0, sequence)).toISOString(),
) {
  return {
    ...submission(sequence, answeredAt),
    itemId: ids.item,
    skill: "listening" as const,
  };
}

function enqueueMany(
  submissions: readonly ValidatedAttemptSubmission[],
  initial = createAttemptOutboxSnapshot(),
): AttemptOutboxSnapshot {
  return submissions.reduce(
    (snapshot, attempt) => enqueueAttempt(snapshot, attempt),
    initial,
  );
}

function state(): LearnerItemState {
  return {
    itemId: ids.item,
    skill: "listening",
    masteryPermille: 250,
    status: "learning",
    attemptCount: 1,
    successfulAttempts: 1,
    consecutiveCorrect: 1,
    dueAt: "2026-08-02T08:00:01.000Z",
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function acceptedResponse(
  snapshot: AttemptOutboxSnapshot,
  syncRevision: number,
  states: readonly LearnerItemState[] = [],
): AttemptBatchResponse {
  const inFlight = snapshot.inFlight;
  if (inFlight === null) throw new Error("Le test exige un lot en vol.");

  return {
    syncRevision,
    results: inFlight.eventIds.map((id) => ({
      eventId: id,
      status: "accepted" as const,
      rating: 1 as const,
    })),
    states: [...states],
  };
}

describe("outbox locale sérialisable", () => {
  it("crée un snapshot vide et ajoute une soumission canonique une seule fois", () => {
    const initial = createAttemptOutboxSnapshot();
    const uppercase = {
      ...submission(1, "2026-08-01T10:00:01.000+02:00"),
      eventId: "ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF",
    };
    const first = enqueueAttempt(initial, uppercase);
    const replay = enqueueAttempt(first, {
      ...uppercase,
      eventId: uppercase.eventId.toLowerCase(),
      answeredAt: "2026-08-01T08:00:01.000Z",
    });

    expect(first.entries).toHaveLength(1);
    expect(first.entries[0]?.submission).toMatchObject({
      eventId: uppercase.eventId.toLowerCase(),
      answeredAt: "2026-08-01T08:00:01.000Z",
    });
    expect(replay).toEqual(first);
  });

  it("signale explicitement une collision d’eventId sans modifier le snapshot", () => {
    const original = enqueueAttempt(
      createAttemptOutboxSnapshot(),
      submission(1),
    );

    expect(() =>
      enqueueAttempt(original, {
        ...submission(1),
        selectedOptionId: "00000000-0000-4000-8000-000000009999",
      }),
    ).toThrow(AttemptOutboxEventCollisionError);
    expect(original.entries[0]?.submission.selectedOptionId).toBe(ids.option);
  });

  it("prépare au plus cinquante tentatives dans un ordre stable", () => {
    const attempts = Array.from({ length: 53 }, (_, index) =>
      submission(53 - index),
    );
    const queued = enqueueMany(attempts);
    const prepared = prepareAttemptOutboxBatch(queued, ids.batchA);

    expect(prepared.prepared?.batch.attempts).toHaveLength(50);
    expect(
      prepared.prepared?.batch.attempts.map(({ eventId: id }) => id),
    ).toEqual(Array.from({ length: 50 }, (_, index) => eventId(index + 1)));
    expect(prepared.snapshot.inFlight).toEqual({
      idempotencyKey: ids.batchA,
      eventIds: Array.from({ length: 50 }, (_, index) => eventId(index + 1)),
    });
  });

  it("réutilise exactement la clé et le payload en vol après une erreur", () => {
    const queued = enqueueMany([submission(2), submission(1)]);
    const first = prepareAttemptOutboxBatch(queued, ids.batchA);
    const retry = prepareAttemptOutboxBatch(first.snapshot, ids.batchB);

    expect(retry.snapshot).toEqual(first.snapshot);
    expect(retry.prepared).toEqual(first.prepared);
    expect(retry.prepared?.idempotencyKey).toBe(ids.batchA);
  });

  it("classe chaque résultat autoritaire et libère le lot en vol", () => {
    const queued = enqueueMany([submission(1), submission(2), submission(3)]);
    const prepared = prepareAttemptOutboxBatch(queued, ids.batchA);
    const applied = applyAttemptOutboxSuccess(prepared.snapshot, {
      syncRevision: 1,
      results: [
        { eventId: eventId(1), status: "accepted", rating: 1 },
        { eventId: eventId(2), status: "duplicate", rating: 0 },
        {
          eventId: eventId(3),
          status: "rejected",
          code: "invalid_submission",
        },
      ],
      states: [state()],
    });

    expect(applied.snapshot.inFlight).toBeNull();
    expect(applied.snapshot.syncRevision).toBe(1);
    expect(applied.snapshot.entries).toMatchObject([
      { status: "synced", serverStatus: "accepted", rating: 1 },
      { status: "synced", serverStatus: "duplicate", rating: 0 },
      { status: "rejected", code: "invalid_submission" },
    ]);
    expect(applied.snapshot.authoritativeStates).toEqual([state()]);
  });

  it("refuse une réponse sans lot ou dont les résultats ne correspondent pas", () => {
    const queued = enqueueMany([submission(1), submission(2)]);
    const prepared = prepareAttemptOutboxBatch(queued, ids.batchA);
    const reversed = acceptedResponse(prepared.snapshot, 1);

    expect(() =>
      applyAttemptOutboxSuccess(queued, acceptedResponse(prepared.snapshot, 1)),
    ).toThrow(AttemptOutboxResponseMismatchError);
    expect(() =>
      applyAttemptOutboxSuccess(prepared.snapshot, {
        ...reversed,
        results: [...reversed.results].reverse(),
      }),
    ).toThrow(AttemptOutboxResponseMismatchError);
    expect(prepared.snapshot.inFlight).not.toBeNull();
  });

  it("ne régresse ni la révision ni les projections sur une réponse tardive", () => {
    const current = attemptOutboxSnapshotSchema.parse({
      ...enqueueMany([submission(1)]),
      syncRevision: 7,
    });
    const prepared = prepareAttemptOutboxBatch(current, ids.batchA);
    const applied = applyAttemptOutboxSuccess(
      prepared.snapshot,
      acceptedResponse(prepared.snapshot, 3, [state()]),
    );

    expect(applied.snapshot.syncRevision).toBe(7);
    expect(applied.snapshot.entries[0]?.status).toBe("synced");
    expect(applied.snapshot.authoritativeStates).toEqual([]);
  });

  it("sérialise et relit uniquement un snapshot respectant les invariants", () => {
    const prepared = prepareAttemptOutboxBatch(
      enqueueMany([submission(1), submission(2)]),
      ids.batchA,
    ).snapshot;
    const serialized = serializeAttemptOutboxSnapshot(prepared);

    expect(deserializeAttemptOutboxSnapshot(serialized)).toEqual(prepared);
    expect(() => deserializeAttemptOutboxSnapshot("{pas du json")).toThrow();
    expect(() =>
      deserializeAttemptOutboxSnapshot(
        JSON.stringify({
          ...prepared,
          inFlight: { idempotencyKey: ids.batchA, eventIds: [eventId(99)] },
        }),
      ),
    ).toThrow();
  });

  it("migre un snapshot v1 en retirant les champs dérivés et le lot ancien", () => {
    const prepared = prepareAttemptOutboxBatch(
      enqueueMany([submission(1), submission(2)]),
      ids.batchA,
    ).snapshot;
    const legacyEntries = prepared.entries.map((entry) => ({
      ...entry,
      submission: {
        ...entry.submission,
        itemId: ids.item,
        skill: "listening" as const,
      },
    }));
    const migrated = deserializeAttemptOutboxSnapshot(
      JSON.stringify({
        schemaVersion: 1,
        syncRevision: prepared.syncRevision,
        entries: legacyEntries,
        inFlight: prepared.inFlight,
      }),
    );

    expect(migrated).toMatchObject({
      schemaVersion: 3,
      owner: ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
      authoritativeStates: [],
      entries: prepared.entries,
      inFlight: null,
    });
    expect(migrated.entries[0]?.submission).not.toHaveProperty("itemId");
    expect(migrated.entries[0]?.submission).not.toHaveProperty("skill");
  });

  it("migre v2 en conservant propriétaire et états mais renouvelle la clé", () => {
    const owner = {
      kind: "account" as const,
      userId: "00000000-0000-4000-8000-000000009999",
    };
    const prepared = prepareAttemptOutboxBatch(
      enqueueMany([submission(1)], createAttemptOutboxSnapshot(owner)),
      ids.batchA,
    ).snapshot;
    const migrated = deserializeAttemptOutboxSnapshot(
      JSON.stringify({
        ...prepared,
        schemaVersion: 2,
        authoritativeStates: [state()],
        entries: prepared.entries.map((entry) => ({
          ...entry,
          submission: {
            ...entry.submission,
            itemId: ids.item,
            skill: "listening",
          },
        })),
      }),
    );

    expect(migrated).toMatchObject({
      schemaVersion: 3,
      owner,
      authoritativeStates: [state()],
      inFlight: null,
    });
    expect(
      prepareAttemptOutboxBatch(migrated, ids.batchB).prepared,
    ).toMatchObject({ idempotencyKey: ids.batchB });
  });

  it("préserve les statuts terminaux lors de la migration v2", () => {
    const migrated = deserializeAttemptOutboxSnapshot(
      JSON.stringify({
        schemaVersion: 2,
        owner: ANONYMOUS_ATTEMPT_OUTBOX_OWNER,
        syncRevision: 4,
        authoritativeStates: [state()],
        entries: [
          {
            status: "synced",
            submission: legacySubmission(1),
            serverStatus: "duplicate",
            rating: 1,
          },
          {
            status: "rejected",
            submission: legacySubmission(2),
            code: "invalid_submission",
          },
        ],
        inFlight: null,
      }),
    );

    expect(migrated.entries).toMatchObject([
      { status: "synced", serverStatus: "duplicate", rating: 1 },
      { status: "rejected", code: "invalid_submission" },
    ]);
    expect(
      migrated.entries.every(
        ({ submission: item }) => !("itemId" in item) && !("skill" in item),
      ),
    ).toBe(true);
  });

  it("répare le rejet device_not_registered hérité de v1", () => {
    const oldSubmission = legacySubmission(1);
    const migrated = deserializeAttemptOutboxSnapshot(
      JSON.stringify({
        schemaVersion: 1,
        syncRevision: 1,
        entries: [
          {
            status: "rejected",
            submission: oldSubmission,
            code: "device_not_registered",
          },
        ],
        inFlight: null,
      }),
    );

    expect(migrated.entries[0]).toEqual({
      status: "pending",
      submission: submission(1),
      retryReason: "device_not_registered",
    });
    expect(prepareAttemptOutboxBatch(migrated, ids.batchA)).toMatchObject({
      prepared: null,
      blockedReason: "device_registration",
    });
  });

  it("isole la révision et les projections dans l'espace du compte", () => {
    const owner = {
      kind: "account" as const,
      userId: "00000000-0000-4000-8000-000000009999",
    };
    const snapshot = createAttemptOutboxSnapshot(owner);

    expect(
      deserializeAttemptOutboxSnapshot(
        serializeAttemptOutboxSnapshot(snapshot),
      ),
    ).toEqual(snapshot);
    expect(snapshot.owner).toEqual(owner);
  });

  it("garde device_not_registered en attente jusqu'à l'inscription explicite", () => {
    const prepared = prepareAttemptOutboxBatch(
      enqueueMany([submission(1)]),
      ids.batchA,
    );
    const applied = applyAttemptOutboxSuccess(prepared.snapshot, {
      syncRevision: 1,
      results: [
        {
          eventId: eventId(1),
          status: "rejected",
          code: "device_not_registered",
        },
      ],
      states: [],
    });

    expect(applied.requiresDeviceRegistration).toBe(true);
    expect(applied.snapshot.entries[0]).toMatchObject({
      status: "pending",
      retryReason: "device_not_registered",
    });
    expect(
      prepareAttemptOutboxBatch(applied.snapshot, ids.batchB),
    ).toMatchObject({ prepared: null, blockedReason: "device_registration" });

    const resumed = resumeAttemptOutboxAfterDeviceRegistration(
      applied.snapshot,
      ids.device,
    );
    expect(
      prepareAttemptOutboxBatch(resumed, ids.batchB).prepared,
    ).not.toBeNull();
  });

  it("refuse une nouvelle tentative lorsque la capacité pending est atteinte", () => {
    const commonTimestamp = "2026-08-01T08:00:00.000Z";
    const full = attemptOutboxSnapshotSchema.parse({
      ...createAttemptOutboxSnapshot(),
      entries: Array.from(
        { length: MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES },
        (_, index) => ({
          status: "pending" as const,
          submission: submission(index + 1, commonTimestamp),
        }),
      ),
    });

    expect(() =>
      enqueueAttempt(
        full,
        submission(MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES + 1, commonTimestamp),
      ),
    ).toThrow(AttemptOutboxCapacityError);
  });

  it("borne la rétention terminale sans supprimer la nouvelle tentative", () => {
    const commonTimestamp = "2026-08-01T08:00:00.000Z";
    const pending = submission(1_000, "2026-08-02T08:00:00.000Z");
    const snapshot = attemptOutboxSnapshotSchema.parse({
      ...createAttemptOutboxSnapshot(),
      entries: [
        ...Array.from(
          { length: MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES },
          (_, index) => ({
            status: "synced" as const,
            submission: submission(index + 1, commonTimestamp),
            serverStatus: "accepted" as const,
            rating: 1 as const,
          }),
        ),
        { status: "pending" as const, submission: pending },
      ],
      inFlight: { idempotencyKey: ids.batchA, eventIds: [pending.eventId] },
    });
    const applied = applyAttemptOutboxSuccess(snapshot, {
      syncRevision: 1,
      results: [{ eventId: pending.eventId, status: "accepted", rating: 1 }],
      states: [],
    });

    expect(applied.snapshot.entries).toHaveLength(
      MAX_TERMINAL_ATTEMPT_OUTBOX_ENTRIES,
    );
    expect(
      applied.snapshot.entries.some(
        ({ submission: retained }) => retained.eventId === pending.eventId,
      ),
    ).toBe(true);
  });
});

describe("propriétés de reprise de l’outbox", () => {
  it("produit le même lot stable pour toute permutation puis tout retry", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 500 }), {
          minLength: 1,
          maxLength: 80,
        }),
        (sequences) => {
          const commonTimestamp = "2026-08-01T08:00:00.000Z";
          const queued = enqueueMany(
            sequences.map((sequence) => submission(sequence, commonTimestamp)),
          );
          const first = prepareAttemptOutboxBatch(queued, ids.batchA);
          const retry = prepareAttemptOutboxBatch(first.snapshot, ids.batchB);
          const expected = [...sequences]
            .map(eventId)
            .sort((left, right) => left.localeCompare(right))
            .slice(0, 50);

          expect(
            first.prepared?.batch.attempts.map(({ eventId: id }) => id),
          ).toEqual(expected);
          expect(retry.prepared).toEqual(first.prepared);
          expect(retry.snapshot).toEqual(first.snapshot);
        },
      ),
    );
  });

  it("conserve toujours le maximum des révisions locale et distante", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 1, max: 10_000 }),
        (localRevision, remoteRevision) => {
          const queued = attemptOutboxSnapshotSchema.parse({
            ...enqueueMany([submission(1)]),
            syncRevision: localRevision,
          });
          const prepared = prepareAttemptOutboxBatch(queued, ids.batchA);
          const applied = applyAttemptOutboxSuccess(
            prepared.snapshot,
            acceptedResponse(prepared.snapshot, remoteRevision, [state()]),
          );

          expect(applied.snapshot.syncRevision).toBe(
            Math.max(localRevision, remoteRevision),
          );
          expect(applied.snapshot.authoritativeStates).toHaveLength(
            remoteRevision >= localRevision ? 1 : 0,
          );
        },
      ),
    );
  });
});
