import { createClient } from "@supabase/supabase-js";

import { AttemptApiError, AttemptInfrastructureError } from "./errors";
import type { AccessTokenVerifier } from "./ports";
import { fetchSupabase } from "./supabase-fetch";
import {
  SupabaseAuthenticationError,
  verifySupabasePermanentUser,
  type SupabaseUserAuthClient,
} from "../supabase-auth/verified-user";

export async function verifySupabaseAccessToken(input: {
  readonly auth: SupabaseUserAuthClient;
  readonly accessToken: string;
}): Promise<{ readonly userId: string }> {
  try {
    const verified = await verifySupabasePermanentUser(input);
    return { userId: verified.userId };
  } catch (error) {
    if (error instanceof SupabaseAuthenticationError) {
      if (error.kind === "unauthorized") {
        throw new AttemptApiError("unauthorized");
      }
      throw new AttemptInfrastructureError("auth_unavailable");
    }
    throw new AttemptInfrastructureError("auth_unavailable");
  }
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
    verify: (accessToken) =>
      verifySupabaseAccessToken({ auth: client.auth, accessToken }),
  };
}
