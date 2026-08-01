import { randomUUID } from "node:crypto";

import type { AccessTokenVerifier } from "../attempt-sync/ports";
import { apiResponseHeaders } from "../api-http";
import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../attempt-sync/errors";
import {
  deviceRegistrationErrorResponseSchema,
  deviceRegistrationRequestSchema,
  deviceRegistrationResponseSchema,
  type DeviceRegistrationRequest,
  type DeviceRegistrationResponse,
} from "./contracts";
import {
  DeviceRegistrationApiError,
  DeviceRegistrationInfrastructureError,
} from "./errors";

const MAX_REQUEST_BYTES = 4 * 1_024;

type DeviceRegistrar = (input: {
  readonly userId: string;
  readonly registration: DeviceRegistrationRequest;
}) => Promise<DeviceRegistrationResponse>;

export interface DeviceRegistrationHttpDependencies {
  readonly accessTokenVerifier: AccessTokenVerifier;
  readonly registerDevice: DeviceRegistrar;
  readonly requestIdFactory?: () => string;
  readonly reportOperationalFailure?: (event: {
    readonly operation: "device_registration";
    readonly errorKind:
      "auth_unavailable" | "database_unavailable" | "internal_error";
    readonly requestId: string;
  }) => void;
}

function jsonResponse(body: unknown, status: number, requestId: string) {
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
  error: DeviceRegistrationApiError,
  requestId: string,
): Response {
  const body = deviceRegistrationErrorResponseSchema.parse({
    error: { code: error.code, message: error.message, requestId },
  });
  return jsonResponse(body, error.status, requestId);
}

function parseBearerAuthorization(value: string | null): string {
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? "");
  if (match?.[1] === undefined) {
    throw new DeviceRegistrationApiError("unauthorized");
  }
  return match[1];
}

function assertJsonContentType(value: string | null): void {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new DeviceRegistrationApiError("unsupported_media_type");
  }
}

async function readLimitedBody(request: Request): Promise<string> {
  const announcedLength = request.headers.get("content-length");
  if (announcedLength !== null) {
    const parsedLength = Number(announcedLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_REQUEST_BYTES) {
      throw new DeviceRegistrationApiError("payload_too_large");
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
          // La réponse reste un 413 si le transport refuse l'annulation.
        }
        throw new DeviceRegistrationApiError("payload_too_large");
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
    throw new DeviceRegistrationApiError("invalid_json");
  }
}

function parseJsonBody(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new DeviceRegistrationApiError("invalid_json");
  }
}

function mapAccessTokenFailure(error: unknown): never {
  if (error instanceof AttemptApiError && error.code === "unauthorized") {
    throw new DeviceRegistrationApiError("unauthorized");
  }
  if (
    error instanceof AttemptInfrastructureError &&
    error.code === "auth_unavailable"
  ) {
    throw new DeviceRegistrationApiError("auth_unavailable");
  }
  throw new DeviceRegistrationApiError("auth_unavailable");
}

export function createDeviceRegistrationHttpHandler(
  dependencies: DeviceRegistrationHttpDependencies,
) {
  return async function handleDeviceRegistration(
    request: Request,
  ): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();

    try {
      assertJsonContentType(request.headers.get("content-type"));
      const accessToken = parseBearerAuthorization(
        request.headers.get("authorization"),
      );

      let userId: string;
      try {
        ({ userId } =
          await dependencies.accessTokenVerifier.verify(accessToken));
      } catch (error) {
        mapAccessTokenFailure(error);
      }

      const rawBody = await readLimitedBody(request);
      const registration = deviceRegistrationRequestSchema.safeParse(
        parseJsonBody(rawBody),
      );
      if (!registration.success) {
        throw new DeviceRegistrationApiError("invalid_request");
      }

      const response = deviceRegistrationResponseSchema.parse(
        await dependencies.registerDevice({
          userId,
          registration: registration.data,
        }),
      );
      return jsonResponse(response, 200, requestId);
    } catch (error) {
      const apiError =
        error instanceof DeviceRegistrationApiError
          ? error
          : error instanceof DeviceRegistrationInfrastructureError
            ? new DeviceRegistrationApiError(error.code)
            : new DeviceRegistrationApiError("internal_error");

      if (apiError.status >= 500) {
        dependencies.reportOperationalFailure?.({
          operation: "device_registration",
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

export function unavailableDeviceRegistrationResponse(): Response {
  const requestId = randomUUID();
  return errorResponse(
    new DeviceRegistrationApiError("database_unavailable"),
    requestId,
  );
}
