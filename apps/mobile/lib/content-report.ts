import {
  classifyContentReportRejection,
  contentReportOutboxEntriesAreEqual,
  countPendingContentReports,
  contentReportRequestSchema,
  createContentReportOutboxEntry,
  createSyncHttpClient,
  peekContentReport,
  readContentReportOutboxRejection,
  type AuthenticatedSyncSession,
  type ContentReportCategory,
  type ContentReportOutboxEntry,
  type ContentReportOutboxRejection,
  type ContentReportOutboxSnapshot,
  type ContentReportResponse,
} from "@thainaute/sync";
import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import {
  MobileAttemptOutboxStorageError,
  MobileAttemptOutboxStore,
} from "./attempt-outbox-store";
import { assertNoPendingMobileAccountDeletion } from "./mobile-account-deletion";
import { mobileSha256Hex } from "./sha256";
import { getMobileSupabaseAuthClient } from "./supabase-auth";

export class MobileContentReportSessionError extends Error {
  public constructor() {
    super("Reconnectez le compte concerné avant d’envoyer ce signalement.");
    this.name = "MobileContentReportSessionError";
  }
}

export interface MobileContentReportFlushResult {
  readonly acknowledgedIdempotencyKeys: readonly string[];
  readonly pendingCount: number;
  readonly rejectedHead: ContentReportOutboxRejection | null;
}

export type MobileContentReportSubmissionResult =
  | {
      readonly status: "sent";
      readonly pendingCount: number;
    }
  | {
      readonly status: "queued";
      readonly pendingCount: number;
      readonly reason: "offline" | "delivery_failed";
    }
  | {
      readonly status: "queued";
      readonly pendingCount: number;
      readonly reason: "blocked_by_rejected";
      readonly rejectedHead: ContentReportOutboxRejection;
    }
  | {
      readonly status: "rejected";
      readonly pendingCount: number;
      readonly rejectedHead: ContentReportOutboxRejection;
    };

function readMobileApiOrigin(): string {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (value === undefined) {
    throw new Error("L’API de signalement mobile n’est pas configurée.");
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
    throw new Error("L’API de signalement mobile est mal configurée.");
  }
}

function authenticatedSessionProvider(expectedUserIdInput: string) {
  const expectedUserId = expectedUserIdInput.toLowerCase();
  return async (): Promise<AuthenticatedSyncSession | null> => {
    await assertNoPendingMobileAccountDeletion(expectedUserId);
    const client = getMobileSupabaseAuthClient();
    if (client === null) return null;

    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (
      error !== null ||
      session === null ||
      session.user.is_anonymous === true ||
      session.user.id.toLowerCase() !== expectedUserId
    ) {
      return null;
    }
    return {
      accessToken: session.access_token,
      userId: session.user.id.toLowerCase(),
    };
  };
}

async function requirePermanentSession(
  getSession: () => Promise<AuthenticatedSyncSession | null>,
): Promise<void> {
  if ((await getSession()) === null)
    throw new MobileContentReportSessionError();
}

function reportStore(
  database: SQLiteDatabase,
  expectedUserId: string,
): MobileAttemptOutboxStore {
  return new MobileAttemptOutboxStore(
    database,
    { kind: "account", userId: expectedUserId },
    "learning",
    mobileSha256Hex,
  );
}

export async function readMobileContentReports(input: {
  readonly database: SQLiteDatabase;
  readonly expectedUserId: string;
}): Promise<ContentReportOutboxSnapshot> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  return reportStore(input.database, input.expectedUserId).readContentReports();
}

/**
 * Rejoue strictement en FIFO. La session et le tombstone sont relus avant
 * chaque réseau puis avant chaque accusé, afin qu'une bascule A → B ne puisse
 * jamais acquitter la file du compte A.
 */
export async function synchronizeMobileContentReports(input: {
  readonly database: SQLiteDatabase;
  readonly expectedUserId: string;
}): Promise<MobileContentReportFlushResult> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  const client = createSyncHttpClient({
    baseUrl: readMobileApiOrigin(),
    allowInsecureHttp: process.env.NODE_ENV !== "production",
    expectedUserId: input.expectedUserId,
    getSession,
  });
  const store = reportStore(input.database, input.expectedUserId);
  const acknowledgedIdempotencyKeys: string[] = [];

  let snapshot = await store.readContentReports();
  let head = peekContentReport(snapshot);
  while (head !== null) {
    await assertNoPendingMobileAccountDeletion(input.expectedUserId);
    let response: ContentReportResponse;
    try {
      response = await client.sendContentReport(head);
    } catch (error) {
      const reason = classifyContentReportRejection(error);
      if (reason === null) throw error;

      await assertNoPendingMobileAccountDeletion(input.expectedUserId);
      await requirePermanentSession(getSession);
      try {
        snapshot = await store.rejectContentReport(head, {
          reason,
          rejectedAt: new Date().toISOString(),
        });
      } catch (storageError) {
        if (!(storageError instanceof MobileAttemptOutboxStorageError)) {
          throw storageError;
        }
        snapshot = await store.readContentReports();
        const durableRejection = readContentReportOutboxRejection(snapshot);
        if (
          durableRejection !== null &&
          contentReportOutboxEntriesAreEqual(durableRejection.entry, head) &&
          durableRejection.reason === reason
        ) {
          break;
        }
        if (
          snapshot.entries.some(
            ({ idempotencyKey }) => idempotencyKey === head?.idempotencyKey,
          )
        ) {
          throw storageError;
        }
        head = peekContentReport(snapshot);
        continue;
      }
      break;
    }
    await requirePermanentSession(getSession);
    try {
      snapshot = await store.ackContentReport(head, response);
      acknowledgedIdempotencyKeys.push(head.idempotencyKey);
    } catch (error) {
      if (!(error instanceof MobileAttemptOutboxStorageError)) throw error;
      snapshot = await store.readContentReports();
      if (
        snapshot.entries.some(
          ({ idempotencyKey }) => idempotencyKey === head?.idempotencyKey,
        )
      ) {
        throw error;
      }
      // Une autre tâche a déjà acquitté exactement la même tête durable.
      acknowledgedIdempotencyKeys.push(head.idempotencyKey);
    }
    head = peekContentReport(snapshot);
  }

  return {
    acknowledgedIdempotencyKeys,
    pendingCount: countPendingContentReports(snapshot),
    rejectedHead: readContentReportOutboxRejection(snapshot),
  };
}

/** Persiste avant toute tentative réseau, puis rejoue la file du compte. */
export async function submitMobileContentReport(input: {
  readonly database: SQLiteDatabase;
  readonly expectedUserId: string;
  readonly contentVersionId: string;
  readonly exerciseId: string;
  readonly category: ContentReportCategory;
  readonly attemptDelivery: boolean;
  readonly idempotencyKey?: string;
  readonly createdAt?: string;
}): Promise<MobileContentReportSubmissionResult> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  const entry: ContentReportOutboxEntry = createContentReportOutboxEntry({
    idempotencyKey: input.idempotencyKey ?? randomUUID(),
    body: contentReportRequestSchema.parse({
      contentVersionId: input.contentVersionId,
      exerciseId: input.exerciseId,
      category: input.category,
      platform: Platform.OS === "ios" ? "ios" : "android",
    }),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  const persisted = await reportStore(
    input.database,
    input.expectedUserId,
  ).enqueueContentReport(entry);

  if (!input.attemptDelivery) {
    const rejectedHead = readContentReportOutboxRejection(persisted);
    if (rejectedHead !== null) {
      return {
        status: "queued",
        pendingCount: countPendingContentReports(persisted),
        reason: "blocked_by_rejected",
        rejectedHead,
      };
    }
    return {
      status: "queued",
      pendingCount: countPendingContentReports(persisted),
      reason: "offline",
    };
  }

  try {
    const synchronized = await synchronizeMobileContentReports(input);
    if (
      synchronized.acknowledgedIdempotencyKeys.includes(entry.idempotencyKey)
    ) {
      return { status: "sent", pendingCount: synchronized.pendingCount };
    }
    if (
      synchronized.rejectedHead?.entry.idempotencyKey === entry.idempotencyKey
    ) {
      return {
        status: "rejected",
        pendingCount: synchronized.pendingCount,
        rejectedHead: synchronized.rejectedHead,
      };
    }
    return synchronized.rejectedHead === null
      ? {
          status: "queued",
          pendingCount: synchronized.pendingCount,
          reason: "delivery_failed",
        }
      : {
          status: "queued",
          pendingCount: synchronized.pendingCount,
          reason: "blocked_by_rejected",
          rejectedHead: synchronized.rejectedHead,
        };
  } catch {
    // Le payload fermé et sa clé restent dans SQLite pour un rejeu identique.
    return {
      status: "queued",
      pendingCount: countPendingContentReports(persisted),
      reason: "delivery_failed",
    };
  }
}

/** Retrait explicite du refus exact, puis reprise best-effort de la FIFO. */
export async function discardRejectedMobileContentReport(input: {
  readonly database: SQLiteDatabase;
  readonly expectedUserId: string;
  readonly rejection: ContentReportOutboxRejection;
  readonly attemptDelivery: boolean;
}): Promise<MobileContentReportFlushResult> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  const store = reportStore(input.database, input.expectedUserId);
  await assertNoPendingMobileAccountDeletion(input.expectedUserId);
  // Dernière relecture avant la transaction SQLite qui vérifie elle-même le
  // tombstone et le refus durable exact.
  await requirePermanentSession(getSession);
  const snapshot = await store.discardRejectedContentReport(input.rejection);

  if (!input.attemptDelivery) {
    return {
      acknowledgedIdempotencyKeys: [],
      pendingCount: countPendingContentReports(snapshot),
      rejectedHead: readContentReportOutboxRejection(snapshot),
    };
  }

  try {
    return await synchronizeMobileContentReports(input);
  } catch {
    const current = await readMobileContentReports(input);
    return {
      acknowledgedIdempotencyKeys: [],
      pendingCount: countPendingContentReports(current),
      rejectedHead: readContentReportOutboxRejection(current),
    };
  }
}
