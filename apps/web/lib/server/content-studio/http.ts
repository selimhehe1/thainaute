import { randomUUID } from "node:crypto";

import { contentReviewResponseSchema } from "@thainaute/content/studio";

import { apiResponseHeaders } from "../api-http";
import { ContentStudioError } from "./errors";
import type {
  ContentStudioAuthorizer,
  ContentStudioFixtureReviewer,
} from "./ports";

export const CONTENT_STUDIO_TIMEOUT_MS = 10_000;
const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;

export interface ContentStudioHttpDependencies {
  readonly authorizer: ContentStudioAuthorizer;
  readonly reviewFixture: ContentStudioFixtureReviewer;
  readonly requestIdFactory?: () => string;
  readonly timeoutMs?: number;
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined || match[1].length > ACCESS_TOKEN_MAX_LENGTH) {
    throw new ContentStudioError("unauthorized");
  }
  return match[1];
}

function responseHeaders(status: number, requestId: string): Headers {
  return apiResponseHeaders(status, {
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    "Referrer-Policy": "no-referrer",
    Vary: "Authorization",
    "X-Frame-Options": "DENY",
    "X-Request-Id": requestId,
  });
}

function errorResponse(error: ContentStudioError, requestId: string): Response {
  return Response.json(
    {
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    },
    {
      status: error.status,
      headers: responseHeaders(error.status, requestId),
    },
  );
}

async function runWithDeadline<T>(input: {
  readonly requestSignal: AbortSignal;
  readonly timeoutMs: number;
  readonly run: (signal: AbortSignal) => Promise<T>;
}): Promise<T> {
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, input.requestSignal]);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new ContentStudioError("auth_unavailable"));
    }, input.timeoutMs);
  });

  try {
    return await Promise.race([input.run(signal), deadline]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    controller.abort();
  }
}

function asContentStudioError(error: unknown): ContentStudioError {
  return error instanceof ContentStudioError
    ? error
    : new ContentStudioError("content_unavailable");
}

export function createContentStudioHttpHandler(
  dependencies: ContentStudioHttpDependencies,
) {
  return async function handleContentStudioReview(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );
      const report = await runWithDeadline({
        requestSignal: request.signal,
        timeoutMs: dependencies.timeoutMs ?? CONTENT_STUDIO_TIMEOUT_MS,
        run: async (signal) => {
          await dependencies.authorizer.authorize({ accessToken, signal });
          return contentReviewResponseSchema.parse(
            dependencies.reviewFixture(),
          );
        },
      });

      return Response.json(report, {
        status: 200,
        headers: responseHeaders(200, requestId),
      });
    } catch (error) {
      return errorResponse(asContentStudioError(error), requestId);
    }
  };
}

/** Réponse identique au refus d'autorisation afin de masquer le Studio. */
export function hiddenContentStudioResponse(): Response {
  return errorResponse(new ContentStudioError("not_found"), randomUUID());
}
