import { createClient } from "@supabase/supabase-js";

import { fetchSupabase } from "../attempt-sync/supabase-fetch";
import { ContentInfrastructureError } from "./errors";
import type { PublishedAudioObjectStore } from "./ports";

function isNotFound(error: unknown): boolean {
  if (error === null || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  return candidate.status === 404 || candidate.statusCode === "404";
}

export function createSupabasePublishedAudioObjectStore(input: {
  readonly url: string;
  readonly secretKey: string;
}): PublishedAudioObjectStore {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async download({ bucket, objectPath }) {
      const { data, error } = await client.storage
        .from(bucket)
        .download(objectPath);
      if (error !== null) {
        if (isNotFound(error)) return null;
        throw new ContentInfrastructureError();
      }
      return data;
    },
  };
}
