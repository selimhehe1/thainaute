"use client";

import {
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
import { browserSha256Hex } from "./sha256";
import { getWebSupabaseAuthClient } from "./supabase-auth";

export interface WebAccountSyncResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly batchesSent: number;
  readonly fusionCompleted: boolean;
  readonly fusionRejectedCount: number;
}

function authenticatedSessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
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
  const store = new WebAttemptOutboxStore("thainaute-learning-v1", {
    kind: "account",
    userId: input.userId,
  });

  try {
    const deviceId = await store.getOrCreateAccountDeviceId(
      globalThis.crypto.randomUUID.bind(globalThis.crypto),
      browserSha256Hex,
    );
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
    const synchronized = await synchronizeAttemptOutbox({
      store,
      client,
      expectedUserId: input.userId,
      device: { deviceId, platform: "web", appVersion: "0.0.1" },
      createIdempotencyKey: globalThis.crypto.randomUUID.bind(
        globalThis.crypto,
      ),
    });

    const marker = await store.readFusionMarker();
    if (
      marker?.status === "awaiting_server_ack" &&
      marker.targetUserId === input.userId.toLowerCase()
    ) {
      const completed = await store.completeAnonymousFusion(
        new Date().toISOString(),
      );
      const fusionEventIds = new Set(completed.marker.eventIds);
      return {
        snapshot: completed.accountSnapshot,
        batchesSent: synchronized.batchesSent,
        fusionCompleted: true,
        fusionRejectedCount: completed.anonymousSnapshot.entries.filter(
          (entry) =>
            entry.status === "rejected" &&
            fusionEventIds.has(entry.submission.eventId),
        ).length,
      };
    }
    return {
      ...synchronized,
      fusionCompleted: false,
      fusionRejectedCount: 0,
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
  const store = new WebAttemptOutboxStore("thainaute-learning-v1", {
    kind: "account",
    userId,
  });
  try {
    return await store.purgeAccountDataIfSettled(expectedState);
  } finally {
    store.close();
  }
}

export async function purgeSettledWebAccountData(
  userId: string,
): Promise<boolean> {
  const store = new WebAttemptOutboxStore("thainaute-learning-v1", {
    kind: "account",
    userId,
  });
  try {
    return await store.purgeAccountDataIfSettled();
  } finally {
    store.close();
  }
}

export async function readWebAccountLocalState(userId: string) {
  await migrateLegacyDemoFixtureAttempts();
  const account = new WebAttemptOutboxStore("thainaute-learning-v1", {
    kind: "account",
    userId,
  });
  const anonymous = new WebAttemptOutboxStore();
  try {
    const [accountSnapshot, anonymousSnapshot, fusionMarker] =
      await Promise.all([
        account.read(),
        anonymous.read(),
        account.readFusionMarker(),
      ]);
    return { accountSnapshot, anonymousSnapshot, fusionMarker };
  } finally {
    account.close();
    anonymous.close();
  }
}
