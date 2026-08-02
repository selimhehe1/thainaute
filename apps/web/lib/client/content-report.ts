"use client";

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
  type ContentReportOutboxEntry,
  type ContentReportOutboxRejection,
  type ContentReportOutboxSnapshot,
  type ContentReportRequest,
  type ContentReportResponse,
} from "@thainaute/sync";

import { assertNoPendingWebAccountDeletion } from "./account-deletion";
import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
} from "./attempt-outbox-store";
import { browserSha256Hex } from "./sha256";
import { getWebSupabaseAuthClient } from "./supabase-auth";

const LEARNING_DATABASE_NAME = "thainaute-learning-v1";

export class WebContentReportSessionError extends Error {
  public constructor() {
    super("Reconnectez le compte concerné avant d’envoyer ce signalement.");
    this.name = "WebContentReportSessionError";
  }
}

export interface WebContentReportFlushResult {
  readonly acknowledgedIdempotencyKeys: readonly string[];
  readonly pendingCount: number;
  readonly rejectedHead: ContentReportOutboxRejection | null;
}

export type WebContentReportSubmissionResult =
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

function reportStore(expectedUserId: string): WebAttemptOutboxStore {
  return new WebAttemptOutboxStore(
    LEARNING_DATABASE_NAME,
    { kind: "account", userId: expectedUserId },
    browserSha256Hex,
  );
}

function authenticatedSessionProvider(expectedUserIdInput: string) {
  const expectedUserId = expectedUserIdInput.toLowerCase();
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
  if ((await getSession()) === null) throw new WebContentReportSessionError();
}

export async function readWebContentReports(
  expectedUserId: string,
): Promise<ContentReportOutboxSnapshot> {
  const getSession = authenticatedSessionProvider(expectedUserId);
  await requirePermanentSession(getSession);
  const store = reportStore(expectedUserId);
  try {
    return await store.readContentReports();
  } finally {
    store.close();
  }
}

/**
 * Vide la file dans l’ordre FIFO. Chaque réponse est acquittée durablement
 * uniquement si la session appartient encore au même compte après le réseau.
 */
export async function synchronizeWebContentReports(
  expectedUserId: string,
): Promise<WebContentReportFlushResult> {
  const getSession = authenticatedSessionProvider(expectedUserId);
  await requirePermanentSession(getSession);
  const client = createSyncHttpClient({
    baseUrl: "",
    expectedUserId,
    getSession,
  });
  const store = reportStore(expectedUserId);
  const acknowledgedIdempotencyKeys: string[] = [];

  try {
    let snapshot = await store.readContentReports();
    let head = peekContentReport(snapshot);
    while (head !== null) {
      assertNoPendingWebAccountDeletion(expectedUserId);
      let response: ContentReportResponse;
      try {
        response = await client.sendContentReport(head);
      } catch (error) {
        const reason = classifyContentReportRejection(error);
        if (reason === null) throw error;

        // Le refus de A ne doit jamais être inscrit après une bascule A → B.
        assertNoPendingWebAccountDeletion(expectedUserId);
        await requirePermanentSession(getSession);
        try {
          snapshot = await store.rejectContentReport(head, {
            reason,
            rejectedAt: new Date().toISOString(),
          });
        } catch (storageError) {
          if (!(storageError instanceof AttemptOutboxStorageError)) {
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
          // Une autre tâche a déjà retiré explicitement ce refus exact.
          head = peekContentReport(snapshot);
          continue;
        }
        break;
      }
      // Une bascule A → B ne doit jamais acquitter la file de A sous B.
      await requirePermanentSession(getSession);
      try {
        snapshot = await store.ackContentReport(head, response);
        acknowledgedIdempotencyKeys.push(head.idempotencyKey);
      } catch (error) {
        if (!(error instanceof AttemptOutboxStorageError)) throw error;
        snapshot = await store.readContentReports();
        if (
          snapshot.entries.some(
            ({ idempotencyKey }) => idempotencyKey === head?.idempotencyKey,
          )
        ) {
          throw error;
        }
        // Un autre onglet a déjà acquitté exactement cette mutation.
        acknowledgedIdempotencyKeys.push(head.idempotencyKey);
      }
      head = peekContentReport(snapshot);
    }

    return {
      acknowledgedIdempotencyKeys,
      pendingCount: countPendingContentReports(snapshot),
      rejectedHead: readContentReportOutboxRejection(snapshot),
    };
  } finally {
    store.close();
  }
}

/** Persiste avant tout accès réseau, puis tente un rejeu FIFO si demandé. */
export async function submitWebContentReport(input: {
  readonly expectedUserId: string;
  readonly body: ContentReportRequest;
  readonly online: boolean;
  readonly idempotencyKey?: string;
  readonly createdAt?: string;
}): Promise<WebContentReportSubmissionResult> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  const entry: ContentReportOutboxEntry = createContentReportOutboxEntry({
    idempotencyKey: input.idempotencyKey ?? globalThis.crypto.randomUUID(),
    body: contentReportRequestSchema.parse(input.body),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  const store = reportStore(input.expectedUserId);
  let pendingCount: number;
  let persisted: ContentReportOutboxSnapshot;
  try {
    assertNoPendingWebAccountDeletion(input.expectedUserId);
    persisted = await store.enqueueContentReport(entry);
    pendingCount = countPendingContentReports(persisted);
  } finally {
    store.close();
  }

  if (!input.online) {
    const rejectedHead = readContentReportOutboxRejection(persisted);
    if (rejectedHead !== null) {
      return {
        status: "queued",
        pendingCount,
        reason: "blocked_by_rejected",
        rejectedHead,
      };
    }
    return { status: "queued", pendingCount, reason: "offline" };
  }

  try {
    const synchronized = await synchronizeWebContentReports(
      input.expectedUserId,
    );
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
    // Le payload et sa clé restent dans IndexedDB pour un rejeu identique.
    return { status: "queued", pendingCount, reason: "delivery_failed" };
  }
}

/**
 * Retire le seul refus exact après confirmation utilisateur, puis reprend la
 * FIFO si le réseau est disponible. Le retrait ne produit aucun analytics.
 */
export async function discardRejectedWebContentReport(input: {
  readonly expectedUserId: string;
  readonly rejection: ContentReportOutboxRejection;
  readonly online: boolean;
}): Promise<WebContentReportFlushResult> {
  const getSession = authenticatedSessionProvider(input.expectedUserId);
  await requirePermanentSession(getSession);
  const store = reportStore(input.expectedUserId);
  let snapshot: ContentReportOutboxSnapshot;
  try {
    assertNoPendingWebAccountDeletion(input.expectedUserId);
    // Dernière relecture de session avant la transaction qui vérifie elle-même
    // le tombstone et le refus exact.
    await requirePermanentSession(getSession);
    snapshot = await store.discardRejectedContentReport(input.rejection);
  } finally {
    store.close();
  }

  if (!input.online) {
    return {
      acknowledgedIdempotencyKeys: [],
      pendingCount: countPendingContentReports(snapshot),
      rejectedHead: readContentReportOutboxRejection(snapshot),
    };
  }

  try {
    return await synchronizeWebContentReports(input.expectedUserId);
  } catch {
    const current = await readWebContentReports(input.expectedUserId);
    return {
      acknowledgedIdempotencyKeys: [],
      pendingCount: countPendingContentReports(current),
      rejectedHead: readContentReportOutboxRejection(current),
    };
  }
}
