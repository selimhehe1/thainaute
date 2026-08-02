import {
  contentStudioReviewEnvelopeSchema,
  type ContentStudioReviewEnvelope,
} from "../content-studio-contracts";

const CONTENT_STUDIO_CLIENT_TIMEOUT_MS = 15_000;
const CONTENT_STUDIO_MAX_RESPONSE_BYTES = 256 * 1_024;
const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;

export type ContentStudioClientErrorKind =
  "session_expired" | "access_denied" | "unavailable";

export class ContentStudioClientError extends Error {
  public readonly kind: ContentStudioClientErrorKind;

  public constructor(kind: ContentStudioClientErrorKind) {
    super(kind);
    this.name = "ContentStudioClientError";
    this.kind = kind;
  }
}

function mapStatus(status: number): ContentStudioClientError {
  if (status === 401) return new ContentStudioClientError("session_expired");
  if (status === 404) return new ContentStudioClientError("access_denied");
  return new ContentStudioClientError("unavailable");
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) ||
      Number(declaredLength) > CONTENT_STUDIO_MAX_RESPONSE_BYTES)
  ) {
    throw new ContentStudioClientError("unavailable");
  }

  const reader = response.body?.getReader();
  if (reader === undefined) throw new ContentStudioClientError("unavailable");
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      byteLength += chunk.value.byteLength;
      if (byteLength > CONTENT_STUDIO_MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new ContentStudioClientError("unavailable");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ContentStudioClientError("unavailable");
  }
}

export async function requestFixtureContentReview(input: {
  readonly accessToken: string;
  readonly fetcher?: typeof fetch;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}): Promise<ContentStudioReviewEnvelope> {
  if (
    input.accessToken.length === 0 ||
    input.accessToken.length > ACCESS_TOKEN_MAX_LENGTH ||
    /\s/u.test(input.accessToken)
  ) {
    throw new ContentStudioClientError("session_expired");
  }

  const controller = new AbortController();
  const signals = [controller.signal];
  if (input.signal !== undefined) signals.push(input.signal);
  const signal = AbortSignal.any(signals);
  const timeout = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? CONTENT_STUDIO_CLIENT_TIMEOUT_MS,
  );

  try {
    const response = await (input.fetcher ?? fetch)(
      "/api/v1/studio/content/review",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${input.accessToken}`,
        },
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
        signal,
      },
    );
    const body = await readBoundedJson(response);
    if (!response.ok) throw mapStatus(response.status);

    const parsed = contentStudioReviewEnvelopeSchema.safeParse(body);
    if (!parsed.success) throw new ContentStudioClientError("unavailable");
    return parsed.data;
  } catch (error) {
    if (error instanceof ContentStudioClientError) throw error;
    throw new ContentStudioClientError("unavailable");
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}
