import { createClient } from "@supabase/supabase-js";
import { progressSnapshotResponseSchema } from "@thainaute/sync";

import { AttemptInfrastructureError } from "../attempt-sync/errors";
import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import type { ProgressSnapshotRepository } from "./ports";

export function parseProgressSnapshotRpcResult(data: unknown, error: unknown) {
  if (error !== null)
    throw new AttemptInfrastructureError("database_unavailable");
  const result = progressSnapshotResponseSchema.safeParse(data);
  if (!result.success) {
    throw new AttemptInfrastructureError("database_unavailable");
  }
  return result.data;
}

export function createSupabaseProgressSnapshotRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): ProgressSnapshotRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async read(userId) {
      try {
        const { data, error } = await client.rpc("get_progress_snapshot_v1", {
          p_user_id: userId,
        });
        return parseProgressSnapshotRpcResult(data, error);
      } catch (error) {
        if (error instanceof AttemptInfrastructureError) throw error;
        throw new AttemptInfrastructureError("database_unavailable");
      }
    },
  };
}
