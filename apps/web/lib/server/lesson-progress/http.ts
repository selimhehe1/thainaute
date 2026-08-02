import { randomUUID } from "node:crypto";

import {
  lessonProgressErrorResponseSchema,
  lessonProgressVersionIdSchema,
  type LessonProgressResponse,
  type ProgressSnapshotResponse,
} from "@thainaute/sync";

import { apiResponseHeaders } from "../api-http";
import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../attempt-sync/errors";
import type { AccessTokenVerifier } from "../attempt-sync/ports";
import {
  ContentInfrastructureError,
  ContentIntegrityError,
} from "../content-delivery/errors";
import type { PublishedLessonRepository } from "../content-delivery/ports";
import { LessonProgressApiError } from "./errors";
import { buildLessonProgress } from "./service";

export interface LessonProgressHttpDependencies {
  readonly accessTokenVerifier: AccessTokenVerifier;
  readonly repository: PublishedLessonRepository;
  readonly readSnapshot: (userId: string) => Promise<ProgressSnapshotResponse>;
  readonly activeReleaseId: string;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "lesson_progress";
    readonly errorKind:
      | "auth_unavailable"
      | "content_integrity_failed"
      | "database_unavailable"
      | "internal_error";
    readonly requestId: string;
  }) => void;
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined) {
    throw new LessonProgressApiError("unauthorized");
  }
  return match[1];
}

function errorResponse(error: LessonProgressApiError, requestId: string) {
  return Response.json(
    lessonProgressErrorResponseSchema.parse({
      error: { code: error.code, message: error.message, requestId },
    }),
    {
      status: error.status,
      headers: apiResponseHeaders(error.status, {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "X-Request-Id": requestId,
      }),
    },
  );
}

export function createLessonProgressHttpHandler(
  dependencies: LessonProgressHttpDependencies,
) {
  return async function handleLessonProgress(
    request: Request,
    rawVersionId: string,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );
      let userId: string;
      try {
        ({ userId } =
          await dependencies.accessTokenVerifier.verify(accessToken));
      } catch (error) {
        if (error instanceof AttemptApiError && error.code === "unauthorized") {
          throw new LessonProgressApiError("unauthorized");
        }
        if (
          error instanceof AttemptInfrastructureError &&
          error.code === "auth_unavailable"
        ) {
          throw new LessonProgressApiError("auth_unavailable");
        }
        throw new LessonProgressApiError("auth_unavailable");
      }

      const versionId = lessonProgressVersionIdSchema.safeParse(rawVersionId);
      if (!versionId.success) {
        throw new LessonProgressApiError("invalid_content_id");
      }

      let verified;
      try {
        verified = await dependencies.repository.loadPublishedBundle(
          versionId.data,
        );
      } catch (error) {
        if (error instanceof ContentIntegrityError) {
          dependencies.reportOperationalFailure?.({
            operation: "lesson_progress",
            errorKind: "content_integrity_failed",
            requestId,
          });
          throw new LessonProgressApiError("content_not_found");
        }
        if (error instanceof ContentInfrastructureError) {
          throw new LessonProgressApiError("database_unavailable");
        }
        throw new LessonProgressApiError("database_unavailable");
      }

      if (
        verified === null ||
        verified.release.id !== dependencies.activeReleaseId ||
        verified.bundle.lesson.requiredEntitlement !== null
      ) {
        throw new LessonProgressApiError("content_not_found");
      }

      let snapshot: ProgressSnapshotResponse;
      try {
        snapshot = await dependencies.readSnapshot(userId);
      } catch (error) {
        if (
          error instanceof AttemptInfrastructureError &&
          error.code === "database_unavailable"
        ) {
          throw new LessonProgressApiError("database_unavailable");
        }
        throw new LessonProgressApiError("database_unavailable");
      }

      const response: LessonProgressResponse = buildLessonProgress({
        verified,
        snapshot,
      });
      return Response.json(response, {
        status: 200,
        headers: apiResponseHeaders(200, {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
          "X-Request-Id": requestId,
        }),
      });
    } catch (error) {
      const apiError =
        error instanceof LessonProgressApiError
          ? error
          : new LessonProgressApiError("internal_error");
      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "lesson_progress",
          errorKind:
            apiError.code === "auth_unavailable" ||
            apiError.code === "database_unavailable"
              ? apiError.code
              : "internal_error",
          requestId,
        });
      }
      return errorResponse(apiError, requestId);
    }
  };
}

export function unavailableLessonProgressResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new LessonProgressApiError("database_unavailable"),
    requestId,
  );
}
