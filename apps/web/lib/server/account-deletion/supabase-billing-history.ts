import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AccountDeletionInfrastructureError } from "./errors";
import type { AccountDeletionBillingHistoryReader } from "./ports";
import { createAccountDeletionSupabaseFetch } from "./supabase-fetch";

interface RpcErrorShape {
  readonly code?: unknown;
}

export function parseAccountDeletionBillingHistoryResult(
  data: unknown,
  error: RpcErrorShape | null,
): boolean {
  if (error !== null) {
    throw new AccountDeletionInfrastructureError("billing_unavailable");
  }
  const parsed = z.boolean().safeParse(data);
  if (!parsed.success) {
    throw new AccountDeletionInfrastructureError("billing_unavailable");
  }
  return parsed.data;
}

export function createSupabaseAccountDeletionBillingHistoryReader(input: {
  readonly url: string;
  readonly secretKey: string;
}): AccountDeletionBillingHistoryReader {
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
    async hasBillingHistory({ userId, signal }) {
      try {
        const { data, error } = await client(signal).rpc(
          "billing_has_history_v1",
          { p_user_id: userId },
        );
        return parseAccountDeletionBillingHistoryResult(data, error);
      } catch (error) {
        if (error instanceof AccountDeletionInfrastructureError) throw error;
        throw new AccountDeletionInfrastructureError("billing_unavailable");
      }
    },
  };
}
