"use client";

import {
  countPendingContentReports,
  countRejectedContentReports,
  createSyncHttpClient,
  synchronizeAttemptOutbox,
  type AuthenticatedSyncSession,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";

import {
  type ExpectedWebAccountPurgeState,
  WebAttemptOutboxStore,
  migrateLegacyDemoFixtureAttempts,
} from "./attempt-outbox-store";
import { assertNoPendingWebAccountDeletion } from "./account-deletion";
import { browserSha256Hex } from "./sha256";
import { getWebSupabaseAuthClient } from "./supabase-auth";
import { synchronizeWebContentReports } from "./content-report";

export interface WebAccountSyncResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly batchesSent: number;
  readonly fusionCompleted: boolean;
  readonly fusionRejectedCount: number;
  readonly contentReportsSent: number;
  readonly contentReportsPending: number;
  readonly contentReportsRejected: 0 | 1;
}

function authenticatedSessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
    assertNoPendingWebAccountDeletion(expectedUserId);
    const client = getWebSupabaseAuthClient();
    if (client === null) return null;
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (
      error !== null ||
      session === null ||
      session.user.is_anonymous === true ||
      session.user.id.toLowerCase() !== expectedUserId.toLowerCase()
    ) {
      return null;
    }
    return {
      accessToken: session.access_token,
      userId: session.user.id.toLowerCase(),
    };
  };
}

/** Reprend toute fusion consentie, hydrate le compte puis vide l'outbox. */
export async function synchronizeWebAccount(input: {
  readonly userId: string;
  readonly startAnonymousFusion: boolean;
}): Promise<WebAccountSyncResult> {
  const getSession = authenticatedSessionProvider(input.userId);
  if ((await getSession()) === null) {
    throw new Error("La session du compte a changé avant la synchronisation.");
  }
  await migrateLegacyDemoFixtureAttempts();
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId: input.userId },
    browserSha256Hex,
  );

  try {
    assertNoPendingWebAccountDeletion(input.userId);
    const deviceId = await store.getOrCreateAccountDeviceId(
      globalThis.crypto.randomUUID.bind(globalThis.crypto),
      browserSha256Hex,
    );
    assertNoPendingWebAccountDeletion(input.userId);
    if (input.startAnonymousFusion) {
      await store.startAnonymousFusion({
        fusionId: globalThis.crypto.randomUUID(),
        accountDeviceId: deviceId,
        consentedAt: new Date().toISOString(),
      });
    } else {
      await store.resumeAnonymousFusion();
    }

    const client = createSyncHttpClient({
      baseUrl: "",
      expectedUserId: input.userId,
      getSession,
    });
    const deletionGuardedStore = {
      read: async () => {
        assertNoPendingWebAccountDeletion(input.userId);
        return store.read();
      },
      prepare: async (idempotencyKey: string) => {
        assertNoPendingWebAccountDeletion(input.userId);
        return store.prepare(idempotencyKey);
      },
      applySuccess: async (
        response: Parameters<typeof store.applySuccess>[0],
      ) => {
        assertNoPendingWebAccountDeletion(input.userId);
        return store.applySuccess(response);
      },
      applyProgressSnapshot: async (
        response: Parameters<typeof store.applyProgressSnapshot>[0],
      ) => {
        assertNoPendingWebAccountDeletion(input.userId);
        return store.applyProgressSnapshot(response);
      },
      resumeAfterDeviceRegistration: async (registeredDeviceId: string) => {
        assertNoPendingWebAccountDeletion(input.userId);
        return store.resumeAfterDeviceRegistration(registeredDeviceId);
      },
    };
    const synchronized = await synchronizeAttemptOutbox({
      store: deletionGuardedStore,
      client,
      expectedUserId: input.userId,
      device: { deviceId, platform: "web", appVersion: "0.0.1" },
      createIdempotencyKey: globalThis.crypto.randomUUID.bind(
        globalThis.crypto,
      ),
    });

    let snapshot = synchronized.snapshot;
    let fusionCompleted = false;
    let fusionRejectedCount = 0;
    assertNoPendingWebAccountDeletion(input.userId);
    const marker = await store.readFusionMarker();
    if (
      marker?.status === "awaiting_server_ack" &&
      marker.targetUserId === input.userId.toLowerCase()
    ) {
      assertNoPendingWebAccountDeletion(input.userId);
      const completed = await store.completeAnonymousFusion(
        new Date().toISOString(),
      );
      const fusionEventIds = new Set(completed.marker.eventIds);
      snapshot = completed.accountSnapshot;
      fusionCompleted = true;
      fusionRejectedCount = completed.anonymousSnapshot.entries.filter(
        (entry) =>
          entry.status === "rejected" &&
          fusionEventIds.has(entry.submission.eventId),
      ).length;
    }

    assertNoPendingWebAccountDeletion(input.userId);
    const reportsBefore = await store.readContentReports();
    let contentReportsSent = 0;
    let contentReportsPending = countPendingContentReports(reportsBefore);
    let contentReportsRejected = countRejectedContentReports(reportsBefore);
    if (reportsBefore.entries.length > 0) {
      try {
        const reportResult = await synchronizeWebContentReports(input.userId);
        contentReportsSent = reportResult.acknowledgedIdempotencyKeys.length;
        contentReportsPending = reportResult.pendingCount;
        contentReportsRejected = reportResult.rejectedHead === null ? 0 : 1;
      } catch (error) {
        // Un endpoint indisponible ne doit pas masquer une progression déjà
        // synchronisée. En revanche une bascule de sujet reste une frontière.
        if ((await getSession()) === null) throw error;
        assertNoPendingWebAccountDeletion(input.userId);
        const reportsAfter = await store.readContentReports();
        const remainingKeys = new Set(
          reportsAfter.entries.map(({ idempotencyKey }) => idempotencyKey),
        );
        contentReportsSent = reportsBefore.entries.filter(
          ({ idempotencyKey }) => !remainingKeys.has(idempotencyKey),
        ).length;
        contentReportsPending = countPendingContentReports(reportsAfter);
        contentReportsRejected = countRejectedContentReports(reportsAfter);
      }
    }

    return {
      snapshot,
      batchesSent: synchronized.batchesSent,
      fusionCompleted,
      fusionRejectedCount,
      contentReportsSent,
      contentReportsPending,
      contentReportsRejected,
    };
  } finally {
    store.close();
  }
}

export async function discardWebAnonymousProgress(): Promise<void> {
  await migrateLegacyDemoFixtureAttempts();
  const store = new WebAttemptOutboxStore();
  try {
    await store.purgeOwnerData();
  } finally {
    store.close();
  }
}

export async function purgeWebAccountData(
  userId: string,
  expectedState: ExpectedWebAccountPurgeState,
): Promise<boolean> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    browserSha256Hex,
  );
  try {
    return await store.purgeAccountDataIfSettled(expectedState);
  } finally {
    store.close();
  }
}

export async function purgeSettledWebAccountData(
  userId: string,
): Promise<boolean> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    browserSha256Hex,
  );
  try {
    return await store.purgeAccountDataIfSettled();
  } finally {
    store.close();
  }
}

/** Purge irréversible après reçu serveur, avec tombstone local atomique. */
export async function forcePurgeDeletedWebAccountData(
  userId: string,
): Promise<void> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    browserSha256Hex,
  );
  try {
    await store.tombstoneAndPurgeAccountData();
  } finally {
    store.close();
  }
}

export async function isDeletedWebAccountTombstoned(
  userId: string,
): Promise<boolean> {
  const store = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    browserSha256Hex,
  );
  try {
    return await store.isAccountTombstoned();
  } finally {
    store.close();
  }
}

export async function readWebAccountLocalState(userId: string) {
  await migrateLegacyDemoFixtureAttempts();
  const account = new WebAttemptOutboxStore(
    "thainaute-learning-v1",
    { kind: "account", userId },
    browserSha256Hex,
  );
  const anonymous = new WebAttemptOutboxStore();
  try {
    const [
      accountSnapshot,
      anonymousSnapshot,
      fusionMarker,
      contentReportOutbox,
    ] = await Promise.all([
      account.read(),
      anonymous.read(),
      account.readFusionMarker(),
      account.readContentReports(),
    ]);
    return {
      accountSnapshot,
      anonymousSnapshot,
      fusionMarker,
      contentReportOutbox,
    };
  } finally {
    account.close();
    anonymous.close();
  }
}
