import { createClient } from "@supabase/supabase-js";

import { AccountDeletionInfrastructureError } from "./errors";
import type { AccountDeletionAuthAdministrator } from "./ports";
import { createAccountDeletionSupabaseFetch } from "./supabase-fetch";

interface AuthErrorShape {
  readonly code?: unknown;
  readonly name?: unknown;
  readonly status?: unknown;
}

function isRevocationAlreadySettled(error: AuthErrorShape): boolean {
  if (
    error.name === "AuthSessionMissingError" &&
    Number(error.status) === 400
  ) {
    return true;
  }
  return (
    (error.code === "session_not_found" && Number(error.status) === 401) ||
    (error.code === "user_not_found" && Number(error.status) === 404)
  );
}

function isDeletedUserNotFound(error: AuthErrorShape): boolean {
  return error.code === "user_not_found" && Number(error.status) === 404;
}

export function createSupabaseAccountDeletionAuthAdministrator(input: {
  readonly url: string;
  readonly secretKey: string;
}): AccountDeletionAuthAdministrator {
  function client(signal: AbortSignal) {
    return createClient(input.url, input.secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: { fetch: createAccountDeletionSupabaseFetch(signal) },
    });
  }

  return {
    async revokeGlobalSessions({ accessToken, signal }) {
      try {
        const { error } = await client(signal).auth.admin.signOut(
          accessToken,
          "global",
        );
        if (error !== null && !isRevocationAlreadySettled(error)) {
          throw new AccountDeletionInfrastructureError("auth_unavailable");
        }
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("auth_unavailable");
      }
    },

    async hardDeleteUser({ userId, signal, acceptAlreadyDeleted }) {
      try {
        const { error } = await client(signal).auth.admin.deleteUser(
          userId,
          false,
        );
        if (
          error !== null &&
          !(acceptAlreadyDeleted && isDeletedUserNotFound(error))
        ) {
          throw new AccountDeletionInfrastructureError("auth_unavailable");
        }
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("auth_unavailable");
      }
    },
  };
}
