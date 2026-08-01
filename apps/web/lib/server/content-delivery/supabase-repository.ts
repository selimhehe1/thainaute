import { createClient } from "@supabase/supabase-js";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import { ContentInfrastructureError, ContentIntegrityError } from "./errors";
import type { PublishedLessonRepository } from "./ports";
import { verifyPublishedBundleRow } from "./verified-bundle";

export function createSupabasePublishedLessonRepository(input: {
  readonly url: string;
  readonly secretKey: string;
}): PublishedLessonRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async loadPublishedBundle(versionId) {
      const { data, error } = await client
        .from("lesson_versions")
        .select(
          "id,lesson_id,version,release_id,status,title_fr,payload,payload_sha256,published_at,content_releases!inner(id,version,status,published_at)",
        )
        .eq("id", versionId)
        .eq("status", "published")
        .eq("content_releases.status", "published")
        .maybeSingle();

      if (error !== null) throw new ContentInfrastructureError();
      if (data === null) return null;
      const verified = verifyPublishedBundleRow(data);
      if (verified === null) throw new ContentIntegrityError();
      return verified;
    },
  };
}
