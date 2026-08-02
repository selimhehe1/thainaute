import { createClient } from "@supabase/supabase-js";
import {
  CONTENT_REPORT_CATEGORIES,
  contentReportAggregateSchema,
  type ContentReportCategory,
} from "@thainaute/sync";

import { createAccountExportSupabaseFetch } from "../account-export/supabase-fetch";
import { ContentStudioError } from "./errors";
import type { ContentStudioReportAggregateReader } from "./ports";

function validCount(value: number | null): number {
  if (value === null || !Number.isSafeInteger(value) || value < 0) {
    throw new ContentStudioError("content_unavailable");
  }
  return value;
}

export function createSupabaseContentReportAggregateReader(input: {
  readonly url: string;
  readonly secretKey: string;
}): ContentStudioReportAggregateReader {
  return {
    async read({ contentVersionId, signal }) {
      const client = createClient(input.url, input.secretKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: { fetch: createAccountExportSupabaseFetch(signal) },
      });

      try {
        const counts = await Promise.all(
          CONTENT_REPORT_CATEGORIES.map(async (category) => {
            const { count, error } = await client
              .from("content_reports")
              .select("idempotency_key", { count: "exact", head: true })
              .eq("lesson_version_id", contentVersionId)
              .eq("category", category);
            if (error !== null) {
              throw new ContentStudioError("content_unavailable");
            }
            return [category, validCount(count)] as const;
          }),
        );
        const byCategory = Object.fromEntries(counts) as Record<
          ContentReportCategory,
          number
        >;
        return contentReportAggregateSchema.parse({
          total: counts.reduce((sum, [, count]) => sum + count, 0),
          byCategory,
        });
      } catch (error) {
        if (error instanceof ContentStudioError) throw error;
        throw new ContentStudioError("content_unavailable");
      }
    },
  };
}
