const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;

/** Évite le cache Next et borne chaque appel Auth/PostgREST. */
export function fetchSupabase(
  request: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS);
  const signal =
    init?.signal === undefined || init.signal === null
      ? timeoutSignal
      : AbortSignal.any([init.signal, timeoutSignal]);
  return fetch(request, { ...init, cache: "no-store", signal });
}
