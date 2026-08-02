import { randomUUID } from "node:crypto";

import {
  apiErrorResponseSchema,
  contentReportHeadersSchema,
  contentReportRequestSchema,
  type ContentReportResponse,
} from "@thainaute/sync";

import { apiResponseHeaders } from "../api-http";
import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "./errors";
import type {
  ContentReportAccessTokenVerifier,
  SubmitContentReportInput,
} from "./ports";

const MAX_REQUEST_BYTES = 4 * 1_024;

type ContentReportSubmitter = (
  input: SubmitContentReportInput,
) => Promise<ContentReportResponse>;

export interface ContentReportHttpDependencies {
  readonly accessTokenVerifier: ContentReportAccessTokenVerifier;
  readonly submit: ContentReportSubmitter;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "content_report";
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
    headers: apiResponseHeaders(status, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Request-Id": requestId,
    }),
  });
}

function errorResponse(
  error: ContentReportApiError,
  requestId: string,
): Response {
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
  if (match?.[1] === undefined) {
    throw new ContentReportApiError("unauthorized");
  }
  return match[1];
}

function assertJsonContentType(value: string | null): void {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new ContentReportApiError("unsupported_media_type");
  }
}

async function readLimitedBody(request: Request): Promise<string> {
  const announcedLength = request.headers.get("content-length");
  if (announcedLength !== null) {
    const parsedLength = Number(announcedLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_REQUEST_BYTES) {
      throw new ContentReportApiError("payload_too_large");
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
          // Le transport ne doit pas pouvoir transformer ce refus en erreur 500.
        }
        throw new ContentReportApiError("payload_too_large");
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
    throw new ContentReportApiError("invalid_json");
  }
}

function parseJsonBody(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new ContentReportApiError("invalid_json");
  }
}

export function createContentReportHttpHandler(
  dependencies: ContentReportHttpDependencies,
) {
  return async function handleContentReport(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      assertJsonContentType(request.headers.get("content-type"));
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );
      const headersResult = contentReportHeadersSchema.safeParse({
        idempotencyKey: request.headers.get("idempotency-key"),
      });
      if (!headersResult.success) {
        throw new ContentReportApiError("invalid_idempotency_key");
      }

      let authenticatedUser: { readonly userId: string };
      try {
        authenticatedUser =
          await dependencies.accessTokenVerifier.verify(accessToken);
      } catch (error) {
        if (
          error instanceof ContentReportApiError ||
          error instanceof ContentReportInfrastructureError
        ) {
          throw error;
        }
        throw new ContentReportInfrastructureError("auth_unavailable");
      }

      const rawBody = await readLimitedBody(request);
      const reportResult = contentReportRequestSchema.safeParse(
        parseJsonBody(rawBody),
      );
      if (!reportResult.success) {
        throw new ContentReportApiError("invalid_request");
      }

      const response = await dependencies.submit({
        userId: authenticatedUser.userId,
        idempotencyKey: headersResult.data.idempotencyKey,
        report: reportResult.data,
      });
      return jsonResponse(response, 200, requestId);
    } catch (error) {
      const apiError =
        error instanceof ContentReportApiError
          ? error
          : error instanceof ContentReportInfrastructureError
            ? new ContentReportApiError(error.code)
            : new ContentReportApiError("internal_error");

      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "content_report",
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

export function unavailableContentReportResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new ContentReportApiError("database_unavailable"),
    requestId,
  );
}
