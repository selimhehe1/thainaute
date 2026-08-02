"use client";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxEntry,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";

import { synchronizeWebAccount } from "./account-sync";
import {
  assertNoPendingWebAccountDeletion,
  withNoPendingWebAccountDeletion,
} from "./account-deletion";
import { WebAttemptOutboxStore } from "./attempt-outbox-store";
import { browserSha256Hex } from "./sha256";

interface ConnectedAttemptStore {
  read(): Promise<AttemptOutboxSnapshot>;
  getOrCreateAccountDeviceId(
    createUuid: () => string,
    sha256Hex: (value: string) => Promise<string>,
  ): Promise<string>;
  enqueue(
    submission: ValidatedAttemptSubmission,
  ): Promise<AttemptOutboxSnapshot>;
  close(): void;
}

export interface ConnectedLearningPorts {
  readonly assertAccountWritable: (userId: string) => void | Promise<void>;
  readonly createStore: (userId: string) => ConnectedAttemptStore;
  readonly createUuid: () => string;
  readonly now: () => Date;
  readonly synchronize: typeof synchronizeWebAccount;
  readonly withAccountWriteBarrier: <T>(
    userId: string,
    operation: () => Promise<T>,
  ) => Promise<T>;
}

const defaultPorts: ConnectedLearningPorts = {
  assertAccountWritable: assertNoPendingWebAccountDeletion,
  createStore: (userId) =>
    new WebAttemptOutboxStore(
      "thainaute-learning-v1",
      { kind: "account", userId },
      browserSha256Hex,
    ),
  createUuid: globalThis.crypto.randomUUID.bind(globalThis.crypto),
  now: () => new Date(),
  synchronize: synchronizeWebAccount,
  withAccountWriteBarrier: withNoPendingWebAccountDeletion,
};

export function findConnectedAttempt(
  snapshot: AttemptOutboxSnapshot,
  eventId: string,
): AttemptOutboxEntry | null {
  return (
    snapshot.entries.find((entry) => entry.submission.eventId === eventId) ??
    null
  );
}

export function findLatestConnectedAttempt(
  snapshot: AttemptOutboxSnapshot,
  input: { readonly contentVersionId: string; readonly exerciseId: string },
): AttemptOutboxEntry | null {
  for (let index = snapshot.entries.length - 1; index >= 0; index -= 1) {
    const entry = snapshot.entries[index];
    if (
      entry !== undefined &&
      entry.submission.contentVersionId === input.contentVersionId &&
      entry.submission.exerciseId === input.exerciseId
    ) {
      return entry;
    }
  }
  return null;
}

export async function readLatestConnectedWebAttempt(
  input: {
    readonly userId: string;
    readonly contentVersionId: string;
    readonly exerciseId: string;
  },
  ports: ConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry | null> {
  const store = ports.createStore(input.userId);
  try {
    return findLatestConnectedAttempt(await store.read(), input);
  } finally {
    store.close();
  }
}

/** Réserve et persiste l'événement exact avant le moindre appel réseau. */
export async function enqueueConnectedWebAttempt(
  input: {
    readonly userId: string;
    readonly contentVersionId: string;
    readonly exerciseId: string;
    readonly selectedOptionId: string;
    readonly durationMs: number;
  },
  ports: ConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry> {
  return ports.withAccountWriteBarrier(input.userId, async () => {
    await ports.assertAccountWritable(input.userId);
    const store = ports.createStore(input.userId);
    try {
      const deviceId = await store.getOrCreateAccountDeviceId(
        ports.createUuid,
        browserSha256Hex,
      );
      const submission = attemptSubmissionSchema.parse({
        eventId: ports.createUuid(),
        deviceId,
        exerciseId: input.exerciseId,
        selectedOptionId: input.selectedOptionId,
        answeredAt: ports.now().toISOString(),
        durationMs: Math.min(
          MAX_ATTEMPT_DURATION_MS,
          Math.max(0, Math.round(input.durationMs)),
        ),
        contentVersionId: input.contentVersionId,
        algorithmVersion: SRS_ALGORITHM_VERSION,
      });
      await ports.assertAccountWritable(input.userId);
      const snapshot = await store.enqueue(submission);
      const durable = findConnectedAttempt(snapshot, submission.eventId);
      if (durable === null) {
        throw new Error("La tentative durable n'a pas pu être relue.");
      }
      return durable;
    } finally {
      store.close();
    }
  });
}

export async function synchronizeConnectedWebAttempt(
  input: { readonly userId: string; readonly eventId: string },
  ports: ConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry> {
  return ports.withAccountWriteBarrier(input.userId, async () => {
    await ports.assertAccountWritable(input.userId);
    const synchronized = await ports.synchronize({
      userId: input.userId,
      startAnonymousFusion: false,
    });
    await ports.assertAccountWritable(input.userId);
    const entry = findConnectedAttempt(synchronized.snapshot, input.eventId);
    if (entry === null) {
      throw new Error(
        "La réponse autoritaire ne correspond pas à la tentative.",
      );
    }
    return entry;
  });
}
