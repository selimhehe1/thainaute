import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AccountDeletionInfrastructureError } from "./errors";
import type { AccountDeletionSessionVerifier } from "./ports";
import { createAccountDeletionSupabaseFetch } from "./supabase-fetch";

const activeSessionResultSchema = z.boolean();

export function createSupabaseAccountDeletionSessionVerifier(input: {
  readonly url: string;
  readonly secretKey: string;
}): AccountDeletionSessionVerifier {
  return {
    async isActive({ userId, sessionId, signal }) {
      try {
        const client = createClient(input.url, input.secretKey, {
          auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false,
          },
          global: { fetch: createAccountDeletionSupabaseFetch(signal) },
        });
        const { data, error } = await client.rpc(
          "is_account_deletion_session_active_v1",
          {
            p_user_id: userId,
            p_session_id: sessionId,
          },
        );
        if (error !== null) {
          throw new AccountDeletionInfrastructureError("database_unavailable");
        }
        const parsed = activeSessionResultSchema.safeParse(data);
        if (!parsed.success) {
          throw new AccountDeletionInfrastructureError("database_unavailable");
        }
        return parsed.data;
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("database_unavailable");
      }
    },
  };
}
