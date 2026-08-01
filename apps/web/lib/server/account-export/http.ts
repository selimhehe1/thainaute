import { randomUUID } from "node:crypto";

import {
  ACCOUNT_EXPORT_FILE_NAME,
  MAX_ACCOUNT_EXPORT_JSON_BYTES,
  accountExportDocumentSchema,
  accountExportErrorResponseSchema,
} from "@thainaute/sync";

import { apiResponseHeaders } from "../api-http";
import {
  AccountExportApiError,
  AccountExportInfrastructureError,
} from "./errors";
import type { AccountExporter } from "./ports";

export const ACCOUNT_EXPORT_TIMEOUT_MS = 20_000;
const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;

export interface AccountExportHttpDependencies {
  readonly exportAccount: AccountExporter;
  readonly requestIdFactory?: () => string;
  readonly timeoutMs?: number;
  readonly maxJsonBytes?: number;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "account_export";
    readonly errorKind:
      "auth_unavailable" | "database_unavailable" | "internal_error";
    readonly requestId: string;
  }) => void;
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined || match[1].length > ACCESS_TOKEN_MAX_LENGTH) {
    throw new AccountExportApiError("unauthorized");
  }
  return match[1];
}

function responseHeaders(
  status: number,
  requestId: string,
  initialHeaders?: HeadersInit,
): Headers {
  return apiResponseHeaders(status, {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Authorization",
    "X-Request-Id": requestId,
    ...Object.fromEntries(new Headers(initialHeaders)),
  });
}

function errorResponse(error: AccountExportApiError, requestId: string) {
  const body = accountExportErrorResponseSchema.parse({
    error: { code: error.code, message: error.message, requestId },
  });
  return new Response(JSON.stringify(body), {
    status: error.status,
    headers: responseHeaders(error.status, requestId, {
      "Content-Type": "application/json; charset=utf-8",
    }),
  });
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
      reject(new AccountExportInfrastructureError("database_unavailable"));
    }, input.timeoutMs);
  });

  try {
    return await Promise.race([input.run(signal), deadline]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    controller.abort();
  }
}

export function createAccountExportHttpHandler(
  dependencies: AccountExportHttpDependencies,
) {
  return async function handleAccountExport(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );
      const document = accountExportDocumentSchema.parse(
        await runWithDeadline({
          requestSignal: request.signal,
          timeoutMs: dependencies.timeoutMs ?? ACCOUNT_EXPORT_TIMEOUT_MS,
          run: (signal) => dependencies.exportAccount({ accessToken, signal }),
        }),
      );
      const body = JSON.stringify(document);
      const byteLength = new TextEncoder().encode(body).byteLength;
      if (
        byteLength >
        (dependencies.maxJsonBytes ?? MAX_ACCOUNT_EXPORT_JSON_BYTES)
      ) {
        throw new AccountExportApiError("export_capacity_exceeded");
      }

      return new Response(body, {
        status: 200,
        headers: responseHeaders(200, requestId, {
          "Content-Disposition": `attachment; filename="${ACCOUNT_EXPORT_FILE_NAME}"`,
          "Content-Length": String(byteLength),
          "Content-Type": "application/json; charset=utf-8",
        }),
      });
    } catch (error) {
      const apiError =
        error instanceof AccountExportApiError
          ? error
          : error instanceof AccountExportInfrastructureError
            ? new AccountExportApiError(error.code)
            : new AccountExportApiError("internal_error");
      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "account_export",
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

export function unavailableAccountExportResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new AccountExportApiError("database_unavailable"),
    requestId,
  );
}
