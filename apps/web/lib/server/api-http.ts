const BEARER_CHALLENGE = "Bearer";

export function apiResponseHeaders(
  status: number,
  initialHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(initialHeaders);
  headers.set("X-Content-Type-Options", "nosniff");

  if (status === 401) {
    headers.set("WWW-Authenticate", BEARER_CHALLENGE);
  }

  return headers;
}
