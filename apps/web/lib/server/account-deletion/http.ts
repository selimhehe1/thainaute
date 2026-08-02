import { randomUUID } from "node:crypto";

import {
  MAX_ACCOUNT_DELETION_REQUEST_JSON_BYTES,
  accountDeletionErrorResponseSchema,
  accountDeletionReceiptSchema,
  accountDeletionRequestSchema,
  parseAccountDeletionHeaders,
} from "@thainaute/sync";

import { apiResponseHeaders } from "../api-http";
import {
  AccountDeletionApiError,
  AccountDeletionInfrastructureError,
  type AccountDeletionInfrastructureFailure,
} from "./errors";
import type { AccountDeleter } from "./ports";

export const ACCOUNT_DELETION_TIMEOUT_MS = 30_000;
const ACCESS_TOKEN_MAX_LENGTH = 16 * 1_024;

export interface AccountDeletionHttpDependencies {
  readonly deleteAccount: AccountDeleter;
  readonly requestIdFactory?: () => string;
  readonly timeoutMs?: number;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "account_deletion";
    readonly errorKind: AccountDeletionInfrastructureFailure | "internal_error";
    readonly requestId: string;
  }) => void;
}

function optionalBearerAuthorization(value: string | null): string | null {
  if (value === null) return null;
  const match = /^Bearer ([^\s]+)$/u.exec(value);
  if (match?.[1] === undefined || match[1].length > ACCESS_TOKEN_MAX_LENGTH) {
    throw new AccountDeletionApiError("unauthorized");
  }
  return match[1];
}

function responseHeaders(
  status: number,
  requestId: string,
  initialHeaders?: HeadersInit,
): Headers {
  const headers = apiResponseHeaders(status, {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Vary: [
      "Authorization",
      "Idempotency-Key",
      "Account-Deletion-Continuation",
    ].join(", "),
    "X-Request-Id": requestId,
    ...Object.fromEntries(new Headers(initialHeaders)),
  });
  return headers;
}

function errorResponse(
  error: AccountDeletionApiError,
  requestId: string,
): Response {
  const body = accountDeletionErrorResponseSchema.parse({
    error: { code: error.code, message: error.message, requestId },
  });
  const headers = responseHeaders(error.status, requestId, {
    "Content-Type": "application/json; charset=utf-8",
  });
  if (error.code === "deletion_in_progress") {
    headers.set("Retry-After", "3");
  }
  return new Response(JSON.stringify(body), {
    status: error.status,
    headers,
  });
}

function assertJsonContentType(value: string | null): void {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new AccountDeletionApiError("invalid_request");
  }
}

async function readLimitedBody(
  request: Request,
  signal: AbortSignal,
): Promise<string> {
  const announcedLength = request.headers.get("content-length");
  if (announcedLength !== null) {
    const parsed = Number(announcedLength);
    if (
      !Number.isSafeInteger(parsed) ||
      parsed < 0 ||
      parsed > MAX_ACCOUNT_DELETION_REQUEST_JSON_BYTES
    ) {
      throw new AccountDeletionApiError("invalid_request");
    }
  }
  if (request.body === null) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  let interrupted = signal.aborted;
  const interrupt = () => {
    interrupted = true;
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", interrupt, { once: true });
  try {
    if (interrupted) {
      throw new AccountDeletionApiError("deletion_in_progress");
    }
    while (true) {
      const { done, value } = await reader.read();
      if (interrupted) {
        throw new AccountDeletionApiError("deletion_in_progress");
      }
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_ACCOUNT_DELETION_REQUEST_JSON_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // La réponse reste fermée même si le transport refuse l'annulation.
        }
        throw new AccountDeletionApiError("invalid_request");
      }
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener("abort", interrupt);
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
    throw new AccountDeletionApiError("invalid_request");
  }
}

function parseRequestBody(raw: string) {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    throw new AccountDeletionApiError("invalid_request");
  }
  const parsed = accountDeletionRequestSchema.safeParse(value);
  if (!parsed.success) {
    throw new AccountDeletionApiError("invalid_request");
  }
  return parsed.data;
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
      reject(new AccountDeletionApiError("deletion_in_progress"));
    }, input.timeoutMs);
  });
  try {
    return await Promise.race([input.run(signal), deadline]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    controller.abort();
  }
}

function asApiError(error: unknown): AccountDeletionApiError {
  if (error instanceof AccountDeletionApiError) return error;
  if (error instanceof AccountDeletionInfrastructureError) {
    return new AccountDeletionApiError(error.code);
  }
  return new AccountDeletionApiError("internal_error");
}

export function createAccountDeletionHttpHandler(
  dependencies: AccountDeletionHttpDependencies,
) {
  return async function handleAccountDeletion(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      assertJsonContentType(request.headers.get("content-type"));
      const headersResult = (() => {
        try {
          return parseAccountDeletionHeaders(request.headers);
        } catch {
          throw new AccountDeletionApiError("invalid_request");
        }
      })();
      const accessToken = optionalBearerAuthorization(
        request.headers.get("authorization"),
      );
      const receipt = accountDeletionReceiptSchema.parse(
        await runWithDeadline({
          requestSignal: request.signal,
          timeoutMs: dependencies.timeoutMs ?? ACCOUNT_DELETION_TIMEOUT_MS,
          run: async (signal) => {
            const command = parseRequestBody(
              await readLimitedBody(request, signal),
            );
            return dependencies.deleteAccount({
              accessToken,
              request: command,
              headers: headersResult,
              signal,
            });
          },
        }),
      );
      return new Response(JSON.stringify(receipt), {
        status: 200,
        headers: responseHeaders(200, requestId, {
          "Content-Type": "application/json; charset=utf-8",
        }),
      });
    } catch (error) {
      const apiError = asApiError(error);
      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "account_deletion",
          errorKind:
            apiError.code === "auth_unavailable" ||
            apiError.code === "storage_unavailable" ||
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

export function unavailableAccountDeletionResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new AccountDeletionApiError("database_unavailable"),
    requestId,
  );
}
