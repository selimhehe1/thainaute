import { createClient } from "@supabase/supabase-js";
import { contentReportResponseSchema } from "@thainaute/sync";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import { ContentReportInfrastructureError } from "./errors";
import type {
  ContentReportRepository,
  SubmitContentReportRepositoryResult,
} from "./ports";

interface RpcErrorShape {
  readonly code?: unknown;
}

export function parseContentReportRpcResult(
  data: unknown,
  error: RpcErrorShape | null,
): SubmitContentReportRepositoryResult {
  if (error !== null) {
    if (error.code === "TR003") return { status: "idempotency_conflict" };
    if (error.code === "TR001" || error.code === "TR004") {
      return { status: "invalid_target" };
    }
    throw new ContentReportInfrastructureError("database_unavailable");
  }

  const result = contentReportResponseSchema.safeParse(data);
  if (!result.success) {
    throw new ContentReportInfrastructureError("database_unavailable");
  }
  return result.data;
}

export function createSupabaseContentReportRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): ContentReportRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async submit(command) {
      try {
        const { data, error } = await client.rpc("submit_content_report_v1", {
          p_user_id: command.userId,
          p_idempotency_key: command.idempotencyKey,
          p_request_sha256: command.requestSha256,
          p_lesson_version_id: command.report.contentVersionId,
          p_exercise_id: command.report.exerciseId,
          p_category: command.report.category,
          p_platform: command.report.platform,
        });
        return parseContentReportRpcResult(data, error);
      } catch (error) {
        if (error instanceof ContentReportInfrastructureError) throw error;
        throw new ContentReportInfrastructureError("database_unavailable");
      }
    },
  };
}
