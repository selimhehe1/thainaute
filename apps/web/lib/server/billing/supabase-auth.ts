import { createClient } from "@supabase/supabase-js";

import {
  SupabaseAuthenticationError,
  verifySupabasePermanentUser,
} from "../supabase-auth/verified-user";
import { BillingAuthenticationError } from "./errors";
import type { BillingIdentityVerifier } from "./ports";

export function createSupabaseBillingIdentityVerifier(input: {
  readonly url: string;
  readonly publishableKey: string;
}): BillingIdentityVerifier {
  return {
    async verify(accessToken) {
      const client = createClient(input.url, input.publishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      });
      try {
        const verified = await verifySupabasePermanentUser({
          auth: client.auth,
          accessToken,
        });
        return { userId: verified.userId };
      } catch (error) {
        if (error instanceof SupabaseAuthenticationError) {
          throw new BillingAuthenticationError(error.kind);
        }
        throw new BillingAuthenticationError("auth_unavailable");
      }
    },
  };
}
