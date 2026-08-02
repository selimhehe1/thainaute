import {
  createSyncHttpClient,
  synchronizeAttemptOutbox,
  type AuthenticatedSyncSession,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";
import Constants from "expo-constants";
import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import {
  type ExpectedMobileAccountPurgeState,
  MobileAttemptOutboxStore,
} from "./attempt-outbox-store";
import { getMobileSupabaseAuthClient } from "./supabase-auth";
import { mobileSha256Hex } from "./sha256";

export interface MobileAccountSyncResult {
  readonly snapshot: AttemptOutboxSnapshot;
  readonly batchesSent: number;
  readonly fusionCompleted: boolean;
  readonly fusionRejectedCount: number;
}

function readMobileApiOrigin(): string {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (value === undefined) {
    throw new Error("L’API de synchronisation mobile n’est pas configurée.");
  }
  try {
    const url = new URL(value);
    const developmentHttp =
      process.env.NODE_ENV !== "production" && url.protocol === "http:";
    if (
      (url.protocol !== "https:" && !developmentHttp) ||
      url.username !== "" ||
      url.password !== "" ||
      url.pathname !== "/" ||
      url.search !== "" ||
      url.hash !== ""
    ) {
      throw new Error("invalid");
    }
    return url.origin;
  } catch {
    throw new Error("L’API de synchronisation mobile est mal configurée.");
  }
}

function authenticatedSessionProvider(expectedUserId: string) {
  return async (): Promise<AuthenticatedSyncSession | null> => {
    const client = getMobileSupabaseAuthClient();
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

async function migrateLegacyMobileAttempts(
  database: SQLiteDatabase,
): Promise<void> {
  await new MobileAttemptOutboxStore(
    database,
    undefined,
    "demo",
  ).migrateLegacyFixtureAttemptsToDemo();
}

export async function synchronizeMobileAccount(input: {
  readonly database: SQLiteDatabase;
  readonly userId: string;
  readonly startAnonymousFusion: boolean;
}): Promise<MobileAccountSyncResult> {
  const getSession = authenticatedSessionProvider(input.userId);
  if ((await getSession()) === null) {
    throw new Error("La session du compte a changé avant la synchronisation.");
  }
  await migrateLegacyMobileAttempts(input.database);
  const store = new MobileAttemptOutboxStore(input.database, {
    kind: "account",
    userId: input.userId,
  });
  const deviceId = await store.getOrCreateAccountDeviceId(
    randomUUID,
    mobileSha256Hex,
  );
  if (input.startAnonymousFusion) {
    await store.startAnonymousFusion({
      fusionId: randomUUID(),
      accountDeviceId: deviceId,
      consentedAt: new Date().toISOString(),
    });
  } else {
    await store.resumeAnonymousFusion();
  }

  const platform = Platform.OS === "ios" ? "ios" : "android";
  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: input.userId,
    getSession,
  });
  const synchronized = await synchronizeAttemptOutbox({
    store,
    client,
    expectedUserId: input.userId,
    device: {
      deviceId,
      platform,
      appVersion: Constants.expoConfig?.version ?? "0.0.1",
    },
    createIdempotencyKey: randomUUID,
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
}

export async function discardMobileAnonymousProgress(
  database: SQLiteDatabase,
): Promise<void> {
  await migrateLegacyMobileAttempts(database);
  await new MobileAttemptOutboxStore(database).purgeOwnerData();
}

export function purgeMobileAccountData(
  database: SQLiteDatabase,
  userId: string,
  expectedState: ExpectedMobileAccountPurgeState,
): Promise<boolean> {
  return new MobileAttemptOutboxStore(database, {
    kind: "account",
    userId,
  }).purgeAccountDataIfSettled(expectedState);
}

export function purgeSettledMobileAccountData(
  database: SQLiteDatabase,
  userId: string,
): Promise<boolean> {
  return new MobileAttemptOutboxStore(database, {
    kind: "account",
    userId,
  }).purgeAccountDataIfSettled();
}

export async function readMobileAccountLocalState(
  database: SQLiteDatabase,
  userId: string,
) {
  await migrateLegacyMobileAttempts(database);
  const account = new MobileAttemptOutboxStore(database, {
    kind: "account",
    userId,
  });
  const anonymous = new MobileAttemptOutboxStore(database);
  const [accountSnapshot, anonymousSnapshot, fusionMarker] = await Promise.all([
    account.read(),
    anonymous.read(),
    account.readFusionMarker(),
  ]);
  return { accountSnapshot, anonymousSnapshot, fusionMarker };
}
