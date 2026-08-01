import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AttemptApiError, AttemptInfrastructureError } from "./errors";
import type { AccessTokenVerifier } from "./ports";
import { fetchSupabase } from "./supabase-fetch";

const claimsSchema = z
  .object({
    sub: z.uuid().transform((uuid) => uuid.toLowerCase()),
    is_anonymous: z.boolean().optional(),
  })
  .passthrough();

export function userIdFromVerifiedClaims(claims: unknown): string | null {
  const result = claimsSchema.safeParse(claims);
  return result.success && result.data.is_anonymous !== true
    ? result.data.sub
    : null;
}

export function createSupabaseAccessTokenVerifier(input: {
  readonly url: string;
  readonly publishableKey: string;
}): AccessTokenVerifier {
  const client = createClient(input.url, input.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async verify(accessToken) {
      try {
        const { data, error } = await client.auth.getClaims(accessToken);
        if (error !== null) {
          const status = typeof error.status === "number" ? error.status : 0;
          if (status >= 400 && status < 500) {
            throw new AttemptApiError("unauthorized");
          }
          throw new AttemptInfrastructureError("auth_unavailable");
        }

        const userId = userIdFromVerifiedClaims(data?.claims);
        if (userId === null) throw new AttemptApiError("unauthorized");
        return { userId };
      } catch (error) {
        if (
          error instanceof AttemptApiError ||
          error instanceof AttemptInfrastructureError
        ) {
          throw error;
        }
        throw new AttemptInfrastructureError("auth_unavailable");
      }
    },
  };
}
