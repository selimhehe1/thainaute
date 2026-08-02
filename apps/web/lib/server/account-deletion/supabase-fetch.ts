import { fetchSupabase } from "../attempt-sync/supabase-fetch";

/** Combine la deadline globale de suppression avec la borne de chaque appel. */
export function createAccountDeletionSupabaseFetch(
  deletionSignal: AbortSignal,
): (request: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return (request, init) => {
    const requestSignal = init?.signal;
    const signal =
      requestSignal === undefined || requestSignal === null
        ? deletionSignal
        : AbortSignal.any([deletionSignal, requestSignal]);
    return fetchSupabase(request, { ...init, signal });
  };
}
