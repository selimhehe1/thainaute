import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxEntry,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import { synchronizeMobileAccount } from "./account-sync";
import { MobileAttemptOutboxStore } from "./attempt-outbox-store";
import {
  assertNoPendingMobileAccountDeletion,
  withNoPendingMobileAccountDeletion,
} from "./mobile-account-deletion";
import { mobileSha256Hex } from "./sha256";

interface ConnectedAttemptStore {
  read(): Promise<AttemptOutboxSnapshot>;
  getOrCreateAccountDeviceId(
    createUuid: () => string,
    sha256Hex: (value: string) => Promise<string>,
  ): Promise<string>;
  enqueue(
    submission: ValidatedAttemptSubmission,
  ): Promise<AttemptOutboxSnapshot>;
}

export interface MobileConnectedLearningPorts {
  readonly assertAccountWritable: (userId: string) => void | Promise<void>;
  readonly createStore: (
    database: SQLiteDatabase,
    userId: string,
  ) => ConnectedAttemptStore;
  readonly createUuid: () => string;
  readonly now: () => Date;
  readonly synchronize: typeof synchronizeMobileAccount;
  readonly withAccountWriteBarrier: <T>(
    userId: string,
    operation: () => Promise<T>,
  ) => Promise<T>;
}

const defaultPorts: MobileConnectedLearningPorts = {
  assertAccountWritable: assertNoPendingMobileAccountDeletion,
  createStore: (database, userId) =>
    new MobileAttemptOutboxStore(
      database,
      { kind: "account", userId },
      "learning",
      mobileSha256Hex,
    ),
  createUuid: randomUUID,
  now: () => new Date(),
  synchronize: synchronizeMobileAccount,
  withAccountWriteBarrier: withNoPendingMobileAccountDeletion,
};

export function findLatestConnectedMobileAttempt(
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

export async function readLatestConnectedMobileAttempt(
  input: {
    readonly database: SQLiteDatabase;
    readonly userId: string;
    readonly contentVersionId: string;
    readonly exerciseId: string;
  },
  ports: MobileConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry | null> {
  const store = ports.createStore(input.database, input.userId);
  return findLatestConnectedMobileAttempt(await store.read(), input);
}

export async function enqueueConnectedMobileAttempt(
  input: {
    readonly database: SQLiteDatabase;
    readonly userId: string;
    readonly contentVersionId: string;
    readonly exerciseId: string;
    readonly selectedOptionId: string;
    readonly durationMs: number;
  },
  ports: MobileConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry> {
  return ports.withAccountWriteBarrier(input.userId, async () => {
    await ports.assertAccountWritable(input.userId);
    const store = ports.createStore(input.database, input.userId);
    const deviceId = await store.getOrCreateAccountDeviceId(
      ports.createUuid,
      mobileSha256Hex,
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
    const durable = snapshot.entries.find(
      (entry) => entry.submission.eventId === submission.eventId,
    );
    if (durable === undefined) {
      throw new Error("La tentative durable n'a pas pu être relue.");
    }
    return durable;
  });
}

export async function synchronizeConnectedMobileAttempt(
  input: {
    readonly database: SQLiteDatabase;
    readonly userId: string;
    readonly eventId: string;
  },
  ports: MobileConnectedLearningPorts = defaultPorts,
): Promise<AttemptOutboxEntry> {
  return ports.withAccountWriteBarrier(input.userId, async () => {
    await ports.assertAccountWritable(input.userId);
    const synchronized = await ports.synchronize({
      database: input.database,
      userId: input.userId,
      startAnonymousFusion: false,
      assertAccountWritable: async () =>
        ports.assertAccountWritable(input.userId),
    });
    await ports.assertAccountWritable(input.userId);
    const entry = synchronized.snapshot.entries.find(
      (candidate) => candidate.submission.eventId === input.eventId,
    );
    if (entry === undefined) {
      throw new Error(
        "La réponse autoritaire ne correspond pas à la tentative.",
      );
    }
    return entry;
  });
}
