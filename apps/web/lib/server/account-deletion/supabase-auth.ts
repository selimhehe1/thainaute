import { createClient } from "@supabase/supabase-js";

import {
  SupabaseAuthenticationError,
  verifySupabasePermanentUser,
} from "../supabase-auth/verified-user";
import {
  AccountDeletionApiError,
  AccountDeletionInfrastructureError,
} from "./errors";
import type { AccountDeletionIdentityVerifier } from "./ports";
import { createAccountDeletionSupabaseFetch } from "./supabase-fetch";

export function createSupabaseAccountDeletionIdentityVerifier(input: {
  readonly url: string;
  readonly publishableKey: string;
}): AccountDeletionIdentityVerifier {
  return {
    async verify({ accessToken, signal }) {
      const client = createClient(input.url, input.publishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: { fetch: createAccountDeletionSupabaseFetch(signal) },
      });
      try {
        const verified = await verifySupabasePermanentUser({
          auth: client.auth,
          accessToken,
        });
        return { userId: verified.userId, claims: verified.claims };
      } catch (error) {
        if (error instanceof SupabaseAuthenticationError) {
          if (error.kind === "unauthorized") {
            throw new AccountDeletionApiError("unauthorized");
          }
          throw new AccountDeletionInfrastructureError("auth_unavailable");
        }
        if (
          error instanceof AccountDeletionApiError ||
          error instanceof AccountDeletionInfrastructureError
        ) {
          throw error;
        }
        throw new AccountDeletionInfrastructureError("auth_unavailable");
      }
    },
  };
}
