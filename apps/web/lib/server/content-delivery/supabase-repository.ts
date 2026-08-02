import { createClient } from "@supabase/supabase-js";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import { ContentInfrastructureError, ContentIntegrityError } from "./errors";
import type {
  PublishedLessonRepository,
  PublishedReleaseRepository,
} from "./ports";
import {
  verifyPublishedBundleRow,
  verifyPublishedReleaseRows,
} from "./verified-bundle";

export function createSupabasePublishedLessonRepository(input: {
  readonly url: string;
  readonly secretKey: string;
  readonly releaseId: string;
}): PublishedLessonRepository & PublishedReleaseRepository {
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
        .eq("release_id", input.releaseId)
        .eq("status", "published")
        .eq("content_releases.status", "published")
        .maybeSingle();

      if (error !== null) throw new ContentInfrastructureError();
      if (data === null) return null;
      const verified = verifyPublishedBundleRow(data);
      if (verified === null) throw new ContentIntegrityError();
      return verified;
    },

    async loadPublishedRelease(releaseId) {
      if (releaseId !== input.releaseId) return null;
      const { data, error } = await client
        .from("lesson_versions")
        .select(
          "id,lesson_id,version,release_id,status,title_fr,payload,payload_sha256,published_at,content_releases!inner(id,version,status,published_at)",
        )
        .eq("release_id", releaseId)
        .eq("content_releases.status", "published")
        .order("lesson_id", { ascending: true })
        .order("id", { ascending: true });

      if (error !== null) throw new ContentInfrastructureError();
      const verified = verifyPublishedReleaseRows(data, releaseId);
      if (verified === null) {
        if (Array.isArray(data) && data.length === 0) return null;
        throw new ContentIntegrityError();
      }
      return verified;
    },
  };
}
