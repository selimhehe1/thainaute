"use client";

import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpConfigurationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
} from "@thainaute/sync";
import { useEffect } from "react";

import {
  WEB_ACCOUNT_DELETION_STORAGE_KEY,
  completePendingWebAccountDeletion,
  readPendingWebAccountDeletion,
  WebAccountDeletionCorruptStateError,
  type PendingWebAccountDeletion,
} from "./account-deletion";
import { useWebAuthSession } from "./auth-session";

const RETRY_DELAY_MS = 30_000;

let activeResume: Promise<unknown> | null = null;

/** Mutex de processus partagé entre le bootstrap racine et l'écran Compte. */
export function resumePendingWebAccountDeletion(input: {
  readonly operation: PendingWebAccountDeletion;
  readonly clearDeletedSession: (expectedUserId: string) => Promise<void>;
}): Promise<unknown> {
  if (activeResume !== null) return activeResume;
  activeResume = completePendingWebAccountDeletion(input).finally(() => {
    activeResume = null;
  });
  return activeResume;
}

function shouldRetryWithoutSessionChange(error: unknown): boolean {
  if (error instanceof WebAccountDeletionCorruptStateError) return false;
  if (error instanceof SyncHttpApiError) return error.retryable;
  if (error instanceof SyncHttpProtocolError) return error.retryable;
  if (
    error instanceof SyncHttpAuthenticationError ||
    error instanceof SyncHttpConfigurationError ||
    error instanceof SyncHttpRequestValidationError
  ) {
    return false;
  }
  return true;
}

/**
 * Reprend la suppression dès le bootstrap, même signé out et sans visiter
 * `/account`. Aucun secret ni état utilisateur n'est rendu dans le DOM.
 */
export function WebAccountDeletionBootstrap() {
  const auth = useWebAuthSession();

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attemptRunning = false;

    const clearRetry = () => {
      if (retryTimer === undefined) return;
      clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const scheduleRetry = () => {
      clearRetry();
      retryTimer = setTimeout(() => void attempt(), RETRY_DELAY_MS);
    };

    const attempt = async () => {
      if (!active || attemptRunning) return;
      clearRetry();
      attemptRunning = true;
      try {
        const operation = readPendingWebAccountDeletion();
        if (operation === null) return;
        await resumePendingWebAccountDeletion({
          operation,
          clearDeletedSession: auth.clearDeletedSession,
        });
      } catch (error) {
        if (active && shouldRetryWithoutSessionChange(error)) {
          scheduleRetry();
        }
      } finally {
        attemptRunning = false;
      }
    };
    const attemptWhenVisible = () => {
      if (document.visibilityState === "visible") void attempt();
    };
    const attemptAfterRemoteChange = (event: StorageEvent) => {
      if (
        event.key === WEB_ACCOUNT_DELETION_STORAGE_KEY &&
        (event.storageArea === null || event.storageArea === localStorage)
      ) {
        void attempt();
      }
    };

    void attempt();
    window.addEventListener("online", attempt);
    window.addEventListener("storage", attemptAfterRemoteChange);
    document.addEventListener("visibilitychange", attemptWhenVisible);
    return () => {
      active = false;
      clearRetry();
      window.removeEventListener("online", attempt);
      window.removeEventListener("storage", attemptAfterRemoteChange);
      document.removeEventListener("visibilitychange", attemptWhenVisible);
    };
  }, [auth.clearDeletedSession, auth.sessionBoundaryRevision]);

  return null;
}
