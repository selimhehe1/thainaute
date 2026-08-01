import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";

import {
  AnonymousProgressFusionAlreadyActiveError,
  AnonymousProgressFusionCapacityError,
  AnonymousProgressFusionEventCollisionError,
  AnonymousProgressFusionNotAcknowledgedError,
  AnonymousProgressFusionOwnerError,
  MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES,
  anonymousProgressFusionMarkerSchema,
  applyAnonymousProgressFusionBatchSuccess,
  attemptOutboxSnapshotSchema,
  completeAnonymousProgressFusion,
  createAttemptOutboxSnapshot,
  deserializeAnonymousProgressFusionMarker,
  enqueueAttempt,
  prepareAttemptOutboxBatch,
  resumeAnonymousProgressFusion,
  serializeAnonymousProgressFusionMarker,
  startAnonymousProgressFusion,
  type AttemptOutboxEntry,
  type AttemptOutboxSnapshot,
  type LearnerItemState,
  type ValidatedAttemptSubmission,
} from "../src/index";

const ids = {
  anonymousDevice: "00000000-0000-4000-8000-000000008001",
  accountDevice: "00000000-0000-4000-8000-000000008002",
  otherAccountDevice: "00000000-0000-4000-8000-000000008003",
  user: "00000000-0000-4000-8000-000000008004",
  otherUser: "00000000-0000-4000-8000-000000008005",
  exercise: "00000000-0000-4000-8000-000000008006",
  option: "00000000-0000-4000-8000-000000008007",
  otherOption: "00000000-0000-4000-8000-000000008008",
  contentVersion: "00000000-0000-4000-8000-000000008009",
  fusion: "00000000-0000-4000-8000-000000008010",
  anonymousBatch: "00000000-0000-4000-8000-000000008011",
  accountBatch: "00000000-0000-4000-8000-000000008014",
  itemAnonymous: "00000000-0000-4000-8000-000000008012",
  itemAccount: "00000000-0000-4000-8000-000000008013",
} as const;

const consent = {
  accepted: true,
  consentedAt: "2026-08-01T10:00:00.000+02:00",
} as const;

function eventId(sequence: number): string {
  return `00000000-0000-4000-8000-${sequence.toString().padStart(12, "0")}`;
}

function submission(
  sequence: number,
  options: {
    readonly deviceId?: string;
    readonly answeredAt?: string;
    readonly selectedOptionId?: string;
  } = {},
): ValidatedAttemptSubmission {
  return {
    eventId: eventId(sequence),
    deviceId: options.deviceId ?? ids.anonymousDevice,
    exerciseId: ids.exercise,
    selectedOptionId: options.selectedOptionId ?? ids.option,
    answeredAt:
      options.answeredAt ??
      new Date(Date.UTC(2026, 7, 1, 8, 0, sequence)).toISOString(),
    durationMs: 1_000,
    contentVersionId: ids.contentVersion,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function enqueueMany(
  submissions: readonly ValidatedAttemptSubmission[],
  initial: AttemptOutboxSnapshot = createAttemptOutboxSnapshot(),
): AttemptOutboxSnapshot {
  return submissions.reduce(
    (snapshot, attempt) => enqueueAttempt(snapshot, attempt),
    initial,
  );
}

function accountSnapshot(userId: string = ids.user): AttemptOutboxSnapshot {
  return createAttemptOutboxSnapshot({ kind: "account", userId });
}

function state(itemId: string): LearnerItemState {
  return {
    itemId,
    skill: "listening",
    masteryPermille: 250,
    status: "learning",
    attemptCount: 1,
    successfulAttempts: 1,
    consecutiveCorrect: 1,
    dueAt: "2026-08-02T08:00:00.000Z",
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function acknowledgeAll(
  snapshot: AttemptOutboxSnapshot,
): AttemptOutboxSnapshot {
  return attemptOutboxSnapshotSchema.parse({
    ...snapshot,
    entries: snapshot.entries.map((entry): AttemptOutboxEntry =>
      entry.status === "pending"
        ? {
            status: "synced",
            submission: entry.submission,
            serverStatus: "accepted",
            rating: 1,
          }
        : entry,
    ),
    inFlight: null,
  });
}

describe("fusion explicite de la progression anonyme", () => {
  it("copie les événements sans altérer leur identité et isole les projections", () => {
    const anonymousWithStates = attemptOutboxSnapshotSchema.parse({
      ...enqueueMany([submission(2), submission(1)]),
      syncRevision: 31,
      authoritativeStates: [state(ids.itemAnonymous)],
    });
    const anonymousPrepared = prepareAttemptOutboxBatch(
      anonymousWithStates,
      ids.anonymousBatch,
    ).snapshot;
    const accountWithState = attemptOutboxSnapshotSchema.parse({
      ...accountSnapshot(),
      syncRevision: 7,
      authoritativeStates: [state(ids.itemAccount)],
    });

    const result = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: anonymousPrepared,
      accountSnapshot: accountWithState,
      accountDeviceId: ids.accountDevice,
    });

    expect(result.marker).toMatchObject({
      status: "awaiting_server_ack",
      targetUserId: ids.user,
      accountDeviceId: ids.accountDevice,
      consentedAt: "2026-08-01T08:00:00.000Z",
    });
    expect(
      result.marker.submissions.map(
        ({ eventId: id, answeredAt, deviceId }) => ({
          eventId: id,
          answeredAt,
          deviceId,
        }),
      ),
    ).toEqual(
      anonymousPrepared.entries.map(({ submission: attempt }) => ({
        eventId: attempt.eventId,
        answeredAt: attempt.answeredAt,
        deviceId: ids.accountDevice,
      })),
    );
    expect(result.accountSnapshot.entries).toMatchObject([
      { status: "pending", submission: { deviceId: ids.accountDevice } },
      { status: "pending", submission: { deviceId: ids.accountDevice } },
    ]);
    expect(result.accountSnapshot.syncRevision).toBe(7);
    expect(result.accountSnapshot.authoritativeStates).toEqual([
      state(ids.itemAccount),
    ]);
    expect(result.accountSnapshot.authoritativeStates).not.toContainEqual(
      state(ids.itemAnonymous),
    );
    expect(result.anonymousSnapshot.entries).toEqual(anonymousPrepared.entries);
    expect(result.anonymousSnapshot.inFlight).toBeNull();
  });

  it("recopie les tentatives importables sans réessayer un rejet local", () => {
    const anonymous = attemptOutboxSnapshotSchema.parse({
      ...createAttemptOutboxSnapshot(),
      entries: [
        {
          status: "synced",
          submission: submission(1),
          serverStatus: "duplicate",
          rating: 1,
        },
        {
          status: "pending",
          submission: submission(2),
          retryReason: "device_not_registered",
        },
        {
          status: "rejected",
          submission: submission(3),
          code: "invalid_submission",
        },
      ],
    });

    const result = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: anonymous,
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });

    expect(result.accountSnapshot.entries).toHaveLength(2);
    expect(result.marker.submissions).toHaveLength(2);
    expect(
      result.accountSnapshot.entries.every(
        (entry) => entry.status === "pending" && !("retryReason" in entry),
      ),
    ).toBe(true);
  });

  it("reprend idempotemment le même marqueur après une interruption", () => {
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany([submission(1), submission(2)]),
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });
    const resumed = resumeAnonymousProgressFusion({
      marker: deserializeAnonymousProgressFusionMarker(
        serializeAnonymousProgressFusionMarker(started.marker),
      ),
      anonymousSnapshot: started.anonymousSnapshot,
      accountSnapshot: started.accountSnapshot,
    });
    const resumedAgain = resumeAnonymousProgressFusion({
      marker: resumed.marker,
      anonymousSnapshot: resumed.anonymousSnapshot,
      accountSnapshot: resumed.accountSnapshot,
    });

    expect(resumed).toEqual(started);
    expect(resumedAgain).toEqual(resumed);
  });

  it("bloque une deuxième fusion tant qu’un marqueur actif existe", () => {
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany([submission(1)]),
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });

    expect(() =>
      startAnonymousProgressFusion({
        existingMarker: started.marker,
        fusionId: "00000000-0000-4000-8000-000000008099",
        consent,
        anonymousSnapshot: started.anonymousSnapshot,
        accountSnapshot: accountSnapshot(ids.otherUser),
        accountDeviceId: ids.otherAccountDevice,
      }),
    ).toThrow(AnonymousProgressFusionAlreadyActiveError);
  });

  it("échoue sans copie partielle lors d’une collision d’eventId", () => {
    const anonymous = enqueueMany([submission(1), submission(2)]);
    const account = enqueueMany(
      [
        submission(2, {
          deviceId: ids.accountDevice,
          selectedOptionId: ids.otherOption,
        }),
      ],
      accountSnapshot(),
    );
    const accountBefore = structuredClone(account);

    expect(() =>
      startAnonymousProgressFusion({
        existingMarker: null,
        fusionId: ids.fusion,
        consent,
        anonymousSnapshot: anonymous,
        accountSnapshot: account,
        accountDeviceId: ids.accountDevice,
      }),
    ).toThrow(AnonymousProgressFusionEventCollisionError);
    expect(account).toEqual(accountBefore);
  });

  it("refuse atomiquement une fusion dépassant la capacité pending", () => {
    const commonTimestamp = "2026-08-01T08:00:00.000Z";
    const fullAccount = attemptOutboxSnapshotSchema.parse({
      ...accountSnapshot(),
      entries: Array.from(
        { length: MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES },
        (_, index) => ({
          status: "pending" as const,
          submission: submission(index + 1, {
            deviceId: ids.accountDevice,
            answeredAt: commonTimestamp,
          }),
        }),
      ),
    });
    const anonymous = enqueueMany([
      submission(MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES + 1, {
        answeredAt: commonTimestamp,
      }),
    ]);

    expect(() =>
      startAnonymousProgressFusion({
        existingMarker: null,
        fusionId: ids.fusion,
        consent,
        anonymousSnapshot: anonymous,
        accountSnapshot: fullAccount,
        accountDeviceId: ids.accountDevice,
      }),
    ).toThrow(AnonymousProgressFusionCapacityError);
  });

  it("autorise un replay exact même lorsque la cible est à capacité", () => {
    const commonTimestamp = "2026-08-01T08:00:00.000Z";
    const fullAccount = attemptOutboxSnapshotSchema.parse({
      ...accountSnapshot(),
      entries: Array.from(
        { length: MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES },
        (_, index) => ({
          status: "pending" as const,
          submission: submission(index + 1, {
            deviceId: ids.accountDevice,
            answeredAt: commonTimestamp,
          }),
        }),
      ),
    });
    const anonymous = enqueueMany([
      submission(MAX_PENDING_ATTEMPT_OUTBOX_ENTRIES, {
        answeredAt: commonTimestamp,
      }),
    ]);

    const result = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: anonymous,
      accountSnapshot: fullAccount,
      accountDeviceId: ids.accountDevice,
    });

    expect(result.accountSnapshot).toEqual(fullAccount);
  });

  it("attend tous les accusés serveur avant de nettoyer la source", () => {
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany([submission(1), submission(2)]),
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });

    expect(() =>
      completeAnonymousProgressFusion({
        ...started,
        completedAt: "2026-08-01T08:05:00.000Z",
      }),
    ).toThrow(AnonymousProgressFusionNotAcknowledgedError);
    expect(started.anonymousSnapshot.entries).toHaveLength(2);
  });

  it("termine après un rejet terminal sans supprimer ni réessayer sa source", () => {
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany([submission(1), submission(2)]),
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });
    const prepared = prepareAttemptOutboxBatch(
      started.accountSnapshot,
      ids.accountBatch,
    );
    if (prepared.prepared === null) {
      throw new Error("Le test exige un lot de fusion préparé.");
    }
    const applied = applyAnonymousProgressFusionBatchSuccess({
      marker: started.marker,
      anonymousSnapshot: started.anonymousSnapshot,
      accountSnapshot: prepared.snapshot,
      response: {
        syncRevision: 1,
        results: [
          {
            eventId: eventId(1),
            status: "rejected",
            code: "invalid_submission",
          },
          { eventId: eventId(2), status: "accepted", rating: 1 },
        ],
        states: [],
      },
    });
    const completed = completeAnonymousProgressFusion({
      ...applied,
      completedAt: "2026-08-01T08:05:00.000Z",
    });

    expect(applied.marker.acknowledgedEventIds).toEqual([
      eventId(1),
      eventId(2),
    ]);
    expect(completed.marker.status).toBe("completed");
    expect(completed.anonymousSnapshot.entries).toMatchObject([
      {
        status: "rejected",
        code: "invalid_submission",
        submission: { eventId: eventId(1) },
      },
    ]);

    const nextFusion = startAnonymousProgressFusion({
      existingMarker: completed.marker,
      fusionId: "00000000-0000-4000-8000-000000008099",
      consent,
      anonymousSnapshot: completed.anonymousSnapshot,
      accountSnapshot: completed.accountSnapshot,
      accountDeviceId: ids.accountDevice,
    });
    expect(nextFusion.marker.submissions).toEqual([]);
  });

  it("termine idempotemment après accusé et conserve les événements anonymes plus récents", () => {
    const accountWithState = attemptOutboxSnapshotSchema.parse({
      ...accountSnapshot(),
      syncRevision: 17,
      authoritativeStates: [state(ids.itemAccount)],
    });
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany([submission(1), submission(2)]),
      accountSnapshot: accountWithState,
      accountDeviceId: ids.accountDevice,
    });
    const anonymousWithNewEvent = enqueueAttempt(
      started.anonymousSnapshot,
      submission(3),
    );
    const acknowledgedAccount = acknowledgeAll(started.accountSnapshot);
    const completed = completeAnonymousProgressFusion({
      marker: started.marker,
      anonymousSnapshot: anonymousWithNewEvent,
      accountSnapshot: acknowledgedAccount,
      completedAt: "2026-08-01T10:05:00.000+02:00",
    });
    const replay = completeAnonymousProgressFusion({
      ...completed,
      completedAt: "2026-08-01T08:06:00.000Z",
    });

    expect(completed.marker).toMatchObject({
      status: "completed",
      completedAt: "2026-08-01T08:05:00.000Z",
      eventIds: [eventId(1), eventId(2)],
    });
    expect(completed.anonymousSnapshot.entries).toHaveLength(1);
    expect(completed.anonymousSnapshot.entries[0]?.submission.eventId).toBe(
      eventId(3),
    );
    expect(completed.accountSnapshot).toEqual(acknowledgedAccount);
    expect(completed.accountSnapshot.syncRevision).toBe(17);
    expect(completed.accountSnapshot.authoritativeStates).toEqual([
      state(ids.itemAccount),
    ]);
    expect(replay).toEqual(completed);
  });

  it("mémorise les accusés au-delà de la compaction terminale de l’outbox", () => {
    const anonymous = enqueueMany(
      Array.from({ length: 250 }, (_, index) => submission(index + 1)),
    );
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: anonymous,
      accountSnapshot: accountSnapshot(),
      accountDeviceId: ids.accountDevice,
    });
    const firstTwoHundredAcknowledged = attemptOutboxSnapshotSchema.parse({
      ...started.accountSnapshot,
      entries: started.accountSnapshot.entries.map(
        (entry, index): AttemptOutboxEntry =>
          index < 200
            ? {
                status: "synced",
                submission: entry.submission,
                serverStatus: "accepted",
                rating: 1,
              }
            : entry,
      ),
    });
    const firstCheckpoint = resumeAnonymousProgressFusion({
      marker: started.marker,
      anonymousSnapshot: started.anonymousSnapshot,
      accountSnapshot: firstTwoHundredAcknowledged,
    });

    expect(firstCheckpoint.marker.acknowledgedEventIds).toHaveLength(200);

    const afterTerminalCompaction = attemptOutboxSnapshotSchema.parse({
      ...firstCheckpoint.accountSnapshot,
      entries: firstCheckpoint.accountSnapshot.entries
        .slice(200)
        .map((entry): AttemptOutboxEntry => ({
          status: "synced",
          submission: entry.submission,
          serverStatus: "accepted",
          rating: 1,
        })),
    });
    const finalCheckpoint = resumeAnonymousProgressFusion({
      marker: firstCheckpoint.marker,
      anonymousSnapshot: firstCheckpoint.anonymousSnapshot,
      accountSnapshot: afterTerminalCompaction,
    });
    const completed = completeAnonymousProgressFusion({
      ...finalCheckpoint,
      completedAt: "2026-08-01T08:05:00.000Z",
    });

    expect(finalCheckpoint.marker.acknowledgedEventIds).toHaveLength(250);
    expect(finalCheckpoint.accountSnapshot.entries).toHaveLength(50);
    expect(completed.marker.status).toBe("completed");
    expect(completed.anonymousSnapshot.entries).toEqual([]);
  });

  it("checkpoint l’accusé atomiquement même si la réponse compacte aussitôt l’événement", () => {
    const existingTerminalEntries = Array.from(
      { length: 200 },
      (_, index): AttemptOutboxEntry => ({
        status: "synced",
        submission: submission(index + 1_001, {
          deviceId: ids.accountDevice,
          answeredAt: "2026-08-02T08:00:00.000Z",
        }),
        serverStatus: "accepted",
        rating: 1,
      }),
    );
    const accountAtTerminalCapacity = attemptOutboxSnapshotSchema.parse({
      ...accountSnapshot(),
      entries: existingTerminalEntries,
    });
    const started = startAnonymousProgressFusion({
      existingMarker: null,
      fusionId: ids.fusion,
      consent,
      anonymousSnapshot: enqueueMany(
        Array.from({ length: 50 }, (_, index) => submission(index + 1)),
      ),
      accountSnapshot: accountAtTerminalCapacity,
      accountDeviceId: ids.accountDevice,
    });
    const prepared = prepareAttemptOutboxBatch(
      started.accountSnapshot,
      ids.accountBatch,
    );
    const fusionEventIds = prepared.prepared?.batch.attempts.map(
      ({ eventId: id }) => id,
    );
    if (fusionEventIds === undefined) {
      throw new Error("Le test exige un lot de fusion préparé.");
    }

    const applied = applyAnonymousProgressFusionBatchSuccess({
      marker: started.marker,
      anonymousSnapshot: started.anonymousSnapshot,
      accountSnapshot: prepared.snapshot,
      response: {
        syncRevision: 1,
        results: fusionEventIds.map((id) => ({
          eventId: id,
          status: "accepted" as const,
          rating: 1 as const,
        })),
        states: [],
      },
    });
    const retainedAccountEventIds = new Set(
      applied.accountSnapshot.entries.map(
        ({ submission: attempt }) => attempt.eventId,
      ),
    );
    const completed = completeAnonymousProgressFusion({
      marker: applied.marker,
      anonymousSnapshot: applied.anonymousSnapshot,
      accountSnapshot: applied.accountSnapshot,
      completedAt: "2026-08-01T08:05:00.000Z",
    });

    expect(applied.marker.acknowledgedEventIds).toEqual(fusionEventIds);
    expect(
      fusionEventIds.every((eventIdValue) =>
        retainedAccountEventIds.has(eventIdValue),
      ),
    ).toBe(false);
    expect(applied.accountSnapshot.entries).toHaveLength(200);
    expect(completed.marker.status).toBe("completed");
  });

  it("refuse une source ou une cible appartenant au mauvais espace", () => {
    expect(() =>
      startAnonymousProgressFusion({
        existingMarker: null,
        fusionId: ids.fusion,
        consent,
        anonymousSnapshot: accountSnapshot(),
        accountSnapshot: accountSnapshot(),
        accountDeviceId: ids.accountDevice,
      }),
    ).toThrow(AnonymousProgressFusionOwnerError);
  });

  it("exige un consentement affirmatif et un marqueur strict", () => {
    expect(() =>
      startAnonymousProgressFusion({
        existingMarker: null,
        fusionId: ids.fusion,
        consent: {
          accepted: false,
          consentedAt: consent.consentedAt,
        } as never,
        anonymousSnapshot: enqueueMany([submission(1)]),
        accountSnapshot: accountSnapshot(),
        accountDeviceId: ids.accountDevice,
      }),
    ).toThrow();
    expect(
      anonymousProgressFusionMarkerSchema.safeParse({
        schemaVersion: 1,
        status: "awaiting_server_ack",
        fusionId: ids.fusion,
        targetUserId: ids.user,
        accountDeviceId: ids.accountDevice,
        consentedAt: "2026-08-01T08:00:00.000Z",
        submissions: [submission(1)],
        acknowledgedEventIds: [],
      }).success,
    ).toBe(false);
  });
});

describe("propriétés de reprise de fusion", () => {
  it("préserve toujours eventId/answeredAt et reste idempotente", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 500 }), {
          minLength: 0,
          maxLength: 50,
        }),
        (sequences) => {
          const commonTimestamp = "2026-08-01T08:00:00.000Z";
          const anonymous = enqueueMany(
            sequences.map((sequence) =>
              submission(sequence, { answeredAt: commonTimestamp }),
            ),
          );
          const started = startAnonymousProgressFusion({
            existingMarker: null,
            fusionId: ids.fusion,
            consent,
            anonymousSnapshot: anonymous,
            accountSnapshot: accountSnapshot(),
            accountDeviceId: ids.accountDevice,
          });
          const resumed = resumeAnonymousProgressFusion({
            marker: started.marker,
            anonymousSnapshot: started.anonymousSnapshot,
            accountSnapshot: started.accountSnapshot,
          });

          expect(resumed).toEqual(started);
          expect(
            started.marker.submissions.map(
              ({ eventId: id, answeredAt, deviceId }) => ({
                eventId: id,
                answeredAt,
                deviceId,
              }),
            ),
          ).toEqual(
            anonymous.entries.map(({ submission: attempt }) => ({
              eventId: attempt.eventId,
              answeredAt: attempt.answeredAt,
              deviceId: ids.accountDevice,
            })),
          );
        },
      ),
    );
  });
});
