import type {
  DevicePlatform,
  ProgressSnapshotResponse,
} from "./client-contracts";
import type { SyncHttpClient } from "./http-client";
import {
  attemptOutboxOwnerSchema,
  type ApplyAttemptOutboxSuccessResult,
  type AttemptOutboxSnapshot,
  type PrepareAttemptOutboxResult,
} from "./outbox";
import type { AttemptBatchResponse } from "./contracts";

export const MAX_ATTEMPT_SYNC_BATCHES_PER_RUN = 20;

export interface AttemptSyncStore {
  read(): Promise<AttemptOutboxSnapshot>;
  prepare(idempotencyKey: string): Promise<PrepareAttemptOutboxResult>;
  applySuccess(
    response: AttemptBatchResponse,
  ): Promise<ApplyAttemptOutboxSuccessResult>;
  applyProgressSnapshot(
    response: ProgressSnapshotResponse,
  ): Promise<AttemptOutboxSnapshot>;
  resumeAfterDeviceRegistration(
    registeredDeviceId: string,
  ): Promise<AttemptOutboxSnapshot>;
}

export interface SynchronizeAttemptOutboxInput {
  readonly store: AttemptSyncStore;
  readonly client: SyncHttpClient;
  readonly expectedUserId: string;
  readonly device: {
    readonly deviceId: string;
    readonly platform: DevicePlatform;
    readonly appVersion: string;
  };
  readonly createIdempotencyKey: () => string;
  readonly maxBatches?: number;
}

export interface AttemptSyncRunResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly batchesSent: number;
}

export class AttemptSyncDeviceMismatchError extends Error {
  public constructor() {
    super("Une tentative locale appartient à un autre appareil du compte.");
    this.name = "AttemptSyncDeviceMismatchError";
  }
}

export class AttemptSyncRunLimitError extends Error {
  public constructor() {
    super("La synchronisation locale exige une nouvelle passe bornée.");
    this.name = "AttemptSyncRunLimitError";
  }
}

export class AttemptSyncOwnerMismatchError extends Error {
  public constructor() {
    super("Le journal local n’appartient pas à la session attendue.");
    this.name = "AttemptSyncOwnerMismatchError";
  }
}

function assertExpectedOwner(
  snapshot: AttemptOutboxSnapshot,
  expectedUserIdInput: string,
): void {
  const expectedOwner = attemptOutboxOwnerSchema.safeParse({
    kind: "account",
    userId: expectedUserIdInput,
  });
  if (
    !expectedOwner.success ||
    expectedOwner.data.kind !== "account" ||
    snapshot.owner.kind !== "account" ||
    snapshot.owner.userId !== expectedOwner.data.userId
  ) {
    throw new AttemptSyncOwnerMismatchError();
  }
}

/**
 * Une passe durable : inscription idempotente, hydratation complète, puis lots
 * séquentiels. Une erreur réseau laisse le lot `inFlight` intact pour le retry.
 */
export async function synchronizeAttemptOutbox(
  input: SynchronizeAttemptOutboxInput,
): Promise<AttemptSyncRunResult> {
  assertExpectedOwner(await input.store.read(), input.expectedUserId);
  const registered = await input.client.registerDevice(input.device);
  assertExpectedOwner(
    await input.store.resumeAfterDeviceRegistration(registered.device.deviceId),
    input.expectedUserId,
  );
  assertExpectedOwner(
    await input.store.applyProgressSnapshot(
      await input.client.getProgressSnapshot(),
    ),
    input.expectedUserId,
  );

  const maxBatches = input.maxBatches ?? MAX_ATTEMPT_SYNC_BATCHES_PER_RUN;
  if (!Number.isInteger(maxBatches) || maxBatches < 1) {
    throw new AttemptSyncRunLimitError();
  }

  for (let batchesSent = 0; batchesSent < maxBatches; batchesSent += 1) {
    const prepared = await input.store.prepare(input.createIdempotencyKey());
    assertExpectedOwner(prepared.snapshot, input.expectedUserId);
    if (prepared.blockedReason === "device_registration") {
      throw new AttemptSyncDeviceMismatchError();
    }
    if (prepared.prepared === null) {
      return { snapshot: prepared.snapshot, batchesSent };
    }

    const applied = await input.store.applySuccess(
      await input.client.sendAttemptBatch(prepared.prepared),
    );
    assertExpectedOwner(applied.snapshot, input.expectedUserId);
    if (applied.requiresDeviceRegistration) {
      const replayedRegistration = await input.client.registerDevice(
        input.device,
      );
      assertExpectedOwner(
        await input.store.resumeAfterDeviceRegistration(
          replayedRegistration.device.deviceId,
        ),
        input.expectedUserId,
      );
    }
  }

  const finalSnapshot = await input.store.read();
  assertExpectedOwner(finalSnapshot, input.expectedUserId);
  if (
    finalSnapshot.inFlight === null &&
    !finalSnapshot.entries.some(({ status }) => status === "pending")
  ) {
    return { snapshot: finalSnapshot, batchesSent: maxBatches };
  }
  throw new AttemptSyncRunLimitError();
}
