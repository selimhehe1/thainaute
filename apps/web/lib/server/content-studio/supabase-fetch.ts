import { fetchSupabase } from "../attempt-sync/supabase-fetch";

/** Combine la deadline du Studio avec la borne de chaque appel Supabase. */
export function createContentStudioSupabaseFetch(
  signal: AbortSignal,
): typeof fetch {
  return (request, init) =>
    fetchSupabase(request, {
      ...init,
      signal:
        init?.signal === undefined || init.signal === null
          ? signal
          : AbortSignal.any([signal, init.signal]),
    });
}
