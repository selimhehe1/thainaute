import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { apiErrorResponseSchema } from "@thainaute/sync";

import {
  createBillingCheckoutHttpHandler,
  createBillingStatusHttpHandler,
  createRevenueCatWebhookHttpHandler,
  createStripeWebhookHttpHandler,
} from "../lib/server/billing/http";
import type { BillingCheckoutService } from "../lib/server/billing/ports";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";

function service(
  overrides: Partial<BillingCheckoutService> = {},
): BillingCheckoutService {
  return {
    createCheckout: vi.fn(async () => ({
      sessionId: "cs_test123",
      url: "https://checkout.stripe.com/c/pay/cs_test123",
    })),
    createPortal: vi.fn(async () => ({
      url: "https://billing.stripe.com/p/session_test123",
    })),
    getStatus: vi.fn(async () => ({
      entitlement: "premium" as const,
      status: "none" as const,
      active: false,
      provider: null,
      currentPeriodEnd: null,
    })),
    handleStripeWebhook: vi.fn(async () => ({
      status: "duplicate" as const,
    })),
    ...overrides,
  };
}

function identity() {
  return {
    verify: vi.fn(async (token: string) => {
      if (token === "expired") throw new Error("expired token");
      return { userId: USER_ID };
    }),
  };
}

function checkoutRequest(
  body = "{}",
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/v1/billing/checkout", {
    method: "POST",
    headers: {
      Authorization: "Bearer access-token",
      "Content-Type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
      ...headers,
    },
    body,
  });
}

describe("transport HTTP de la facturation", () => {
  it("protège Checkout par session, JSON, Bearer et idempotence", async () => {
    const billingService = service();
    const billingIdentity = identity();
    const handler = createBillingCheckoutHttpHandler({
      identityVerifier: billingIdentity,
      service: billingService,
      requestIdFactory: () => "request-billing-1",
    });

    const response = await handler(checkoutRequest('{"plan":"premium"}'));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-request-id")).toBe("request-billing-1");
    expect(await response.json()).toMatchObject({ sessionId: "cs_test123" });
    expect(billingIdentity.verify).toHaveBeenCalledWith("access-token");
    expect(billingService.createCheckout).toHaveBeenCalledWith({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
  });

  it("refuse une requête Checkout sans clé d'idempotence ou avec un média incorrect", async () => {
    const billingService = service();
    const handler = createBillingCheckoutHttpHandler({
      identityVerifier: identity(),
      service: billingService,
    });

    const missingKey = await handler(
      checkoutRequest("{}", { "Idempotency-Key": "" }),
    );
    const wrongMedia = await handler(
      checkoutRequest("{}", { "Content-Type": "text/plain" }),
    );

    expect(missingKey.status).toBe(400);
    expect(await missingKey.json()).toMatchObject({
      error: { code: "invalid_idempotency_key" },
    });
    expect(wrongMedia.status).toBe(415);
    expect(await wrongMedia.json()).toMatchObject({
      error: { code: "unsupported_media_type" },
    });
    expect(billingService.createCheckout).not.toHaveBeenCalled();
  });

  it("ne divulgue pas une panne d'authentification", async () => {
    const handler = createBillingCheckoutHttpHandler({
      identityVerifier: {
        verify: vi.fn(async () => {
          throw new Error("secret access token and service key");
        }),
      },
      service: service(),
    });

    const response = await handler(checkoutRequest());
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(
      apiErrorResponseSchema.safeParse(JSON.parse(serialized)).success,
    ).toBe(true);
    expect(serialized).not.toContain("service key");
  });

  it("sert le statut sans accepter de corps ni d'écriture client", async () => {
    const billingService = service();
    const handler = createBillingStatusHttpHandler({
      identityVerifier: identity(),
      service: billingService,
      requestIdFactory: () => "request-billing-status",
    });
    const response = await handler(
      new Request("http://localhost/api/v1/billing/status", {
        headers: { Authorization: "Bearer access-token" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "none",
      active: false,
    });
    expect(billingService.getStatus).toHaveBeenCalledWith(USER_ID);
  });

  it("exige la signature Stripe sur le transport webhook", async () => {
    const billingService = service();
    const handler = createStripeWebhookHttpHandler({
      service: billingService,
      requestIdFactory: () => "request-billing-webhook",
    });
    const response = await handler(
      new Request("http://localhost/api/v1/billing/webhook", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "billing_invalid_signature" },
    });
    expect(billingService.handleStripeWebhook).not.toHaveBeenCalled();
  });

  it("authentifie le webhook RevenueCat par autorisation et HMAC du corps brut", async () => {
    const now = 1_754_050_400_000;
    const rawBody = '{"api_version":"1.0","event":{}}';
    const signingSecret = "revenuecat-signing-secret-example-123456";
    const signature = (timestamp: number, body = rawBody) =>
      `t=${timestamp},v1=${createHmac("sha256", signingSecret)
        .update(`${timestamp}.${body}`, "utf8")
        .digest("hex")}`;
    const billingService = {
      handleRevenueCatWebhook: vi.fn(async () => ({
        status: "applied" as const,
        userId: USER_ID,
        entitlement: "premium" as const,
        active: true,
      })),
    };
    const handler = createRevenueCatWebhookHttpHandler({
      authorization: "revenuecat-secret-value",
      signingSecret,
      service: billingService,
      requestIdFactory: () => "request-revenuecat-1",
      now: () => now,
    });
    const request = (
      authorization: string,
      webhookSignature = signature(now / 1_000),
    ) =>
      new Request("http://localhost/api/v1/billing/revenuecat/webhook", {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          "X-RevenueCat-Webhook-Signature": webhookSignature,
        },
        body: rawBody,
      });

    const unauthorized = await handler(request("wrong-secret-value"));
    expect(unauthorized.status).toBe(400);
    expect(await unauthorized.json()).toMatchObject({
      error: { code: "billing_invalid_signature" },
    });
    expect(billingService.handleRevenueCatWebhook).not.toHaveBeenCalled();

    const invalidHmac = await handler(
      request(
        "revenuecat-secret-value",
        `t=${now / 1_000},v1=${"0".repeat(64)}`,
      ),
    );
    expect(invalidHmac.status).toBe(400);
    expect(await invalidHmac.json()).toMatchObject({
      error: { code: "billing_invalid_signature" },
    });

    const expiredHmac = await handler(
      request("revenuecat-secret-value", signature(now / 1_000 - 301)),
    );
    expect(expiredHmac.status).toBe(400);
    expect(await expiredHmac.json()).toMatchObject({
      error: { code: "billing_invalid_signature" },
    });

    const authorized = await handler(request("revenuecat-secret-value"));
    expect(authorized.status).toBe(200);
    expect(await authorized.json()).toMatchObject({
      status: "applied",
      userId: USER_ID,
    });
    expect(billingService.handleRevenueCatWebhook).toHaveBeenCalledWith({
      rawBody,
    });
  });
});
