import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { apiErrorResponseSchema, idempotencyKeySchema } from "@thainaute/sync";
import { z } from "zod";

import { apiResponseHeaders } from "../api-http";
import {
  BillingApiError,
  BillingAuthenticationError,
  BillingInfrastructureError,
} from "./errors";
import type {
  BillingCheckoutService,
  BillingRevenueCatService,
  BillingIdentityVerifier,
} from "./ports";

const MAX_REQUEST_BYTES = 4 * 1_024;
const MAX_WEBHOOK_BYTES = 256 * 1_024;
const REVENUECAT_SIGNATURE_TOLERANCE_SECONDS = 5 * 60;
const emptyRequestSchema = z
  .strictObject({})
  .or(z.strictObject({ plan: z.literal("premium") }));

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

function errorResponse(error: BillingApiError, requestId: string): Response {
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
    throw new BillingApiError("unauthorized");
  }
  return match[1];
}

function assertJsonContentType(value: string | null): void {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new BillingApiError("unsupported_media_type");
  }
}

async function readLimitedBody(
  request: Request,
  maxBytes: number,
): Promise<string> {
  const announcedLength = request.headers.get("content-length");
  if (announcedLength !== null) {
    const parsedLength = Number(announcedLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      throw new BillingApiError("payload_too_large");
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
      if (byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new BillingApiError("payload_too_large");
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
    throw new BillingApiError("invalid_json");
  }
}

function parseJsonBody(rawBody: string): unknown {
  if (rawBody.trim() === "") return {};
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new BillingApiError("invalid_json");
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.byteLength !== rightBytes.byteLength) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

function verifyRevenueCatSignature(input: {
  readonly header: string;
  readonly rawBody: string;
  readonly signingSecret: string;
  readonly now: number;
}): boolean {
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of input.header.split(",")) {
    const separator = part.indexOf("=");
    if (separator <= 0) return false;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === "t") {
      if (timestamp !== null) return false;
      timestamp = value;
    } else if (key === "v1") {
      signatures.push(value.toLowerCase());
    }
  }

  if (
    timestamp === null ||
    !/^\d{1,16}$/u.test(timestamp) ||
    signatures.length === 0 ||
    signatures.some((signature) => !/^[0-9a-f]{64}$/u.test(signature))
  ) {
    return false;
  }

  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(input.now / 1_000);
  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) >
      REVENUECAT_SIGNATURE_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const expected = createHmac("sha256", input.signingSecret)
    .update(`${timestamp}.${input.rawBody}`, "utf8")
    .digest("hex");
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

function parseIdempotencyKey(request: Request): string {
  const parsed = idempotencyKeySchema.safeParse(
    request.headers.get("idempotency-key"),
  );
  if (!parsed.success) throw new BillingApiError("invalid_idempotency_key");
  return parsed.data;
}

async function verifyUser(
  request: Request,
  verifier: BillingIdentityVerifier,
): Promise<string> {
  const accessToken = parseBearerAuthorization(
    request.headers.get("authorization"),
  );
  try {
    return (await verifier.verify(accessToken)).userId;
  } catch (error) {
    if (error instanceof BillingAuthenticationError) {
      throw new BillingApiError(
        error.kind === "unauthorized" ? "unauthorized" : "billing_unavailable",
      );
    }
    throw error;
  }
}

function normalizeError(error: unknown): BillingApiError {
  if (error instanceof BillingApiError) return error;
  if (error instanceof BillingInfrastructureError) {
    return new BillingApiError(error.code);
  }
  return new BillingApiError("billing_unavailable");
}

export interface BillingHttpDependencies {
  readonly identityVerifier: BillingIdentityVerifier;
  readonly service: BillingCheckoutService;
  readonly requestIdFactory?: () => string;
}

export function createBillingCheckoutHttpHandler(
  dependencies: BillingHttpDependencies,
) {
  return async function handle(request: Request): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      assertJsonContentType(request.headers.get("content-type"));
      const idempotencyKey = parseIdempotencyKey(request);
      const body = emptyRequestSchema.safeParse(
        parseJsonBody(await readLimitedBody(request, MAX_REQUEST_BYTES)),
      );
      if (!body.success) throw new BillingApiError("invalid_request");
      const userId = await verifyUser(request, dependencies.identityVerifier);
      const result = await dependencies.service.createCheckout({
        userId,
        idempotencyKey,
      });
      return jsonResponse(result, 200, requestId);
    } catch (error) {
      return errorResponse(normalizeError(error), requestId);
    }
  };
}

export function createBillingPortalHttpHandler(
  dependencies: BillingHttpDependencies,
) {
  return async function handle(request: Request): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      assertJsonContentType(request.headers.get("content-type"));
      const idempotencyKey = parseIdempotencyKey(request);
      const body = emptyRequestSchema.safeParse(
        parseJsonBody(await readLimitedBody(request, MAX_REQUEST_BYTES)),
      );
      if (!body.success) throw new BillingApiError("invalid_request");
      const userId = await verifyUser(request, dependencies.identityVerifier);
      const result = await dependencies.service.createPortal({
        userId,
        idempotencyKey,
      });
      return jsonResponse(result, 200, requestId);
    } catch (error) {
      return errorResponse(normalizeError(error), requestId);
    }
  };
}

export function createBillingStatusHttpHandler(
  dependencies: BillingHttpDependencies,
) {
  return async function handle(request: Request): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      const userId = await verifyUser(request, dependencies.identityVerifier);
      const result = await dependencies.service.getStatus(userId);
      return jsonResponse(result, 200, requestId);
    } catch (error) {
      return errorResponse(normalizeError(error), requestId);
    }
  };
}

export function createStripeWebhookHttpHandler(
  dependencies: Pick<BillingHttpDependencies, "service" | "requestIdFactory">,
) {
  return async function handle(request: Request): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      const signature = request.headers.get("stripe-signature");
      if (signature === null || signature.trim() === "") {
        throw new BillingApiError("billing_invalid_signature");
      }
      const rawBody = await readLimitedBody(request, MAX_WEBHOOK_BYTES);
      const result = await dependencies.service.handleStripeWebhook({
        rawBody,
        signature,
      });
      return jsonResponse(result, 200, requestId);
    } catch (error) {
      return errorResponse(normalizeError(error), requestId);
    }
  };
}

export function createRevenueCatWebhookHttpHandler(dependencies: {
  readonly authorization: string;
  readonly signingSecret: string;
  readonly service: BillingRevenueCatService;
  readonly requestIdFactory?: () => string;
  readonly now?: () => number;
}) {
  return async function handle(request: Request): Promise<Response> {
    const requestId = (dependencies.requestIdFactory ?? randomUUID)();
    try {
      const authorization = request.headers.get("authorization") ?? "";
      if (!constantTimeEqual(authorization, dependencies.authorization)) {
        throw new BillingApiError("billing_invalid_signature");
      }
      assertJsonContentType(request.headers.get("content-type"));
      const signature =
        request.headers.get("x-revenuecat-webhook-signature") ?? "";
      const rawBody = await readLimitedBody(request, MAX_WEBHOOK_BYTES);
      if (
        !verifyRevenueCatSignature({
          header: signature,
          rawBody,
          signingSecret: dependencies.signingSecret,
          now: (dependencies.now ?? Date.now)(),
        })
      ) {
        throw new BillingApiError("billing_invalid_signature");
      }
      const result = await dependencies.service.handleRevenueCatWebhook({
        rawBody,
      });
      return jsonResponse(result, 200, requestId);
    } catch (error) {
      return errorResponse(normalizeError(error), requestId);
    }
  };
}

export function unavailableBillingResponse(
  code: "billing_disabled" | "billing_unavailable" = "billing_disabled",
): Response {
  return errorResponse(new BillingApiError(code), randomUUID());
}
