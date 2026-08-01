import { randomUUID } from "node:crypto";

import {
  apiErrorResponseSchema,
  progressSnapshotResponseSchema,
  type ProgressSnapshotResponse,
} from "@thainaute/sync";

import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../attempt-sync/errors";
import type { AccessTokenVerifier } from "../attempt-sync/ports";

export interface ProgressSnapshotHttpDependencies {
  readonly accessTokenVerifier: AccessTokenVerifier;
  readonly readSnapshot: (userId: string) => Promise<ProgressSnapshotResponse>;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "progress_snapshot";
    readonly errorKind:
      "auth_unavailable" | "database_unavailable" | "internal_error";
    readonly requestId: string;
  }) => void;
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined) throw new AttemptApiError("unauthorized");
  return match[1];
}

function jsonResponse(body: unknown, status: number, requestId: string) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    },
  });
}

function errorResponse(error: AttemptApiError, requestId: string): Response {
  return jsonResponse(
    apiErrorResponseSchema.parse({
      error: { code: error.code, message: error.message, requestId },
    }),
    error.status,
    requestId,
  );
}

export function createProgressSnapshotHttpHandler(
  dependencies: ProgressSnapshotHttpDependencies,
) {
  return async function handleProgressSnapshot(request: Request) {
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
        if (
          error instanceof AttemptApiError ||
          error instanceof AttemptInfrastructureError
        ) {
          throw error;
        }
        throw new AttemptInfrastructureError("auth_unavailable");
      }

      return jsonResponse(
        progressSnapshotResponseSchema.parse(
          await dependencies.readSnapshot(userId),
        ),
        200,
        requestId,
      );
    } catch (error) {
      const apiError =
        error instanceof AttemptApiError
          ? error
          : error instanceof AttemptInfrastructureError
            ? new AttemptApiError(error.code)
            : new AttemptApiError("internal_error");
      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "progress_snapshot",
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

export function unavailableProgressSnapshotResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(new AttemptApiError("database_unavailable"), requestId);
}
