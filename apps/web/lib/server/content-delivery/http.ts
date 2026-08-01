import { randomUUID } from "node:crypto";

import {
  publicContentErrorResponseSchema,
  publicLessonVersionIdSchema,
  type PublicLessonResponse,
} from "@thainaute/content/public";

import {
  ContentDeliveryError,
  ContentInfrastructureError,
  ContentIntegrityError,
} from "./errors";
import { apiResponseHeaders } from "../api-http";
import { toPublicLessonResponse } from "./mapper";
import type { PublishedLessonRepository } from "./ports";

const REVOCABLE_CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, must-revalidate";

export interface PublishedLessonHttpDependencies {
  readonly repository: PublishedLessonRepository;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "published_lesson_read";
    readonly errorKind: "content_integrity_failed" | "content_unavailable";
    readonly requestId: string;
  }) => void;
}

function errorResponse(
  error: ContentDeliveryError,
  requestId: string,
): Response {
  const body = publicContentErrorResponseSchema.parse({
    error: {
      code: error.code,
      message: error.message,
      requestId,
    },
  });
  return Response.json(body, {
    status: error.status,
    headers: apiResponseHeaders(error.status, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Request-Id": requestId,
    }),
  });
}

function contentEtag(response: PublicLessonResponse): string {
  return `"sha256-${response.contentSha256}"`;
}

function matchesIfNoneMatch(value: string | null, etag: string): boolean {
  if (value === null) return false;
  return value.split(",").some((candidate) => {
    const normalized = candidate.trim();
    return (
      normalized === "*" || normalized === etag || normalized === `W/${etag}`
    );
  });
}

function successHeaders(status: 200 | 304, etag: string): Headers {
  return apiResponseHeaders(status, {
    "Cache-Control": REVOCABLE_CACHE_CONTROL,
    ETag: etag,
  });
}

export function createPublishedLessonHttpHandler(
  dependencies: PublishedLessonHttpDependencies,
) {
  return async function handlePublishedLesson(
    request: Request,
    rawVersionId: string,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      const versionIdResult =
        publicLessonVersionIdSchema.safeParse(rawVersionId);
      if (!versionIdResult.success) {
        throw new ContentDeliveryError("invalid_content_id");
      }

      let verified;
      try {
        verified = await dependencies.repository.loadPublishedBundle(
          versionIdResult.data,
        );
      } catch (error) {
        if (error instanceof ContentInfrastructureError) throw error;
        if (error instanceof ContentIntegrityError) {
          dependencies.reportOperationalFailure?.({
            operation: "published_lesson_read",
            errorKind: "content_integrity_failed",
            requestId,
          });
          throw new ContentDeliveryError("content_not_found");
        }
        throw new ContentInfrastructureError();
      }

      if (verified === null) {
        throw new ContentDeliveryError("content_not_found");
      }
      const responseBody = toPublicLessonResponse(verified);
      if (responseBody === null) {
        throw new ContentDeliveryError("content_not_found");
      }

      const etag = contentEtag(responseBody);
      if (matchesIfNoneMatch(request.headers.get("if-none-match"), etag)) {
        return new Response(null, {
          status: 304,
          headers: successHeaders(304, etag),
        });
      }
      return Response.json(responseBody, {
        status: 200,
        headers: successHeaders(200, etag),
      });
    } catch (error) {
      const apiError =
        error instanceof ContentDeliveryError
          ? error
          : error instanceof ContentInfrastructureError
            ? new ContentDeliveryError("content_unavailable")
            : new ContentDeliveryError("content_unavailable");

      if (apiError.code === "content_unavailable") {
        dependencies.reportOperationalFailure?.({
          operation: "published_lesson_read",
          errorKind: "content_unavailable",
          requestId,
        });
      }
      return errorResponse(apiError, requestId);
    }
  };
}

export function unavailablePublishedLessonResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new ContentDeliveryError("content_unavailable"),
    requestId,
  );
}
