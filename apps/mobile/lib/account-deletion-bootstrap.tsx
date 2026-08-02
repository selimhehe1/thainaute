import {
  SyncHttpApiError,
  SyncHttpAuthenticationError,
  SyncHttpConfigurationError,
  SyncHttpProtocolError,
  SyncHttpRequestValidationError,
} from "@thainaute/sync";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState } from "react-native";

import { useMobileAuthSession } from "./auth-session";
import {
  MobileAccountDeletionError,
  resumeMobileAccountDeletion,
} from "./mobile-account-deletion";

const RETRY_DELAY_MS = 30_000;

function shouldRetryWithoutSessionChange(error: unknown): boolean {
  if (error instanceof MobileAccountDeletionError) {
    return error.code === "operation_storage_unavailable";
  }
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

/** Reprend et purge au lancement, même si l'écran Compte n'est jamais ouvert. */
export function MobileAccountDeletionBootstrap() {
  const database = useSQLiteContext();
  const auth = useMobileAuthSession();

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
        await resumeMobileAccountDeletion({
          database,
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

    void attempt();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") void attempt();
      },
    );
    return () => {
      active = false;
      clearRetry();
      appStateSubscription.remove();
    };
  }, [auth.clearDeletedSession, auth.sessionBoundaryRevision, database]);

  return null;
}
