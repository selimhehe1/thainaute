import { randomUUID } from "node:crypto";

import {
  apiErrorResponseSchema,
  attemptBatchSchema,
  idempotencyKeySchema,
  type AttemptBatchResponse,
} from "@thainaute/sync";

import { AttemptApiError, AttemptInfrastructureError } from "./errors";
import type { AccessTokenVerifier, SyncAttemptBatchInput } from "./ports";

const MAX_REQUEST_BYTES = 64 * 1_024;

type AttemptBatchSynchronizer = (
  input: SyncAttemptBatchInput,
) => Promise<AttemptBatchResponse>;

export interface AttemptBatchHttpDependencies {
  readonly accessTokenVerifier: AccessTokenVerifier;
  readonly synchronize: AttemptBatchSynchronizer;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "attempt_batch";
    readonly errorKind:
      "auth_unavailable" | "database_unavailable" | "internal_error";
    readonly requestId: string;
  }) => void;
}

function jsonResponse(
  body: unknown,
  status: number,
  requestId: string,
): Response {
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
  const body = apiErrorResponseSchema.parse({
    error: {
      code: error.code,
      message: error.message,
      requestId,
    },
  });
  return jsonResponse(body, error.status, requestId);
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined) throw new AttemptApiError("unauthorized");
  return match[1];
}

function assertJsonContentType(value: string | null): void {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new AttemptApiError("unsupported_media_type");
  }
}

async function readLimitedBody(request: Request): Promise<string> {
  const announcedLength = request.headers.get("content-length");
  if (announcedLength !== null) {
    const parsedLength = Number(announcedLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_REQUEST_BYTES) {
      throw new AttemptApiError("payload_too_large");
    }
  }

  if (request.body === null) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_REQUEST_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // La réponse reste un 413 même si le transport refuse l'annulation.
        }
        throw new AttemptApiError("payload_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new AttemptApiError("invalid_json");
  }
}

function parseJsonBody(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new AttemptApiError("invalid_json");
  }
}

export function createAttemptBatchHttpHandler(
  dependencies: AttemptBatchHttpDependencies,
) {
  return async function handleAttemptBatch(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      assertJsonContentType(request.headers.get("content-type"));
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );
      const idempotencyKeyResult = idempotencyKeySchema.safeParse(
        request.headers.get("idempotency-key"),
      );
      if (!idempotencyKeyResult.success) {
        throw new AttemptApiError("invalid_idempotency_key");
      }

      let authenticatedUser: { readonly userId: string };
      try {
        authenticatedUser =
          await dependencies.accessTokenVerifier.verify(accessToken);
      } catch (error) {
        if (
          error instanceof AttemptApiError ||
          error instanceof AttemptInfrastructureError
        ) {
          throw error;
        }
        throw new AttemptInfrastructureError("auth_unavailable");
      }

      const rawBody = await readLimitedBody(request);
      const batchResult = attemptBatchSchema.safeParse(parseJsonBody(rawBody));
      if (!batchResult.success) {
        throw new AttemptApiError("invalid_request");
      }

      const response = await dependencies.synchronize({
        userId: authenticatedUser.userId,
        idempotencyKey: idempotencyKeyResult.data,
        batch: batchResult.data,
      });
      return jsonResponse(response, 200, requestId);
    } catch (error) {
      const apiError =
        error instanceof AttemptApiError
          ? error
          : error instanceof AttemptInfrastructureError
            ? new AttemptApiError(error.code)
            : new AttemptApiError("internal_error");

      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "attempt_batch",
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

export function unavailableAttemptBatchResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(new AttemptApiError("database_unavailable"), requestId);
}
