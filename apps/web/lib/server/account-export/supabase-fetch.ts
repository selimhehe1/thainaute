import { fetchSupabase } from "../attempt-sync/supabase-fetch";

/** Combine la deadline de l'export avec la borne de chaque appel Supabase. */
export function createAccountExportSupabaseFetch(
  exportSignal: AbortSignal,
): (request: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return (request, init) => {
    const requestSignal = init?.signal;
    const signal =
      requestSignal === undefined || requestSignal === null
        ? exportSignal
        : AbortSignal.any([exportSignal, requestSignal]);
    return fetchSupabase(request, { ...init, signal });
  };
}
