import { afterEach, describe, expect, it, vi } from "vitest";

const providerFactories = vi.hoisted(() => ({
  billing: vi.fn(() => {
    throw new Error("billing provider factory must stay unreachable");
  }),
  revenueCat: vi.fn(() => {
    throw new Error("RevenueCat provider factory must stay unreachable");
  }),
}));

vi.mock("../lib/server/billing/handler", () => ({
  readBillingHandlerDependencies: providerFactories.billing,
  readRevenueCatHandlerDependencies: providerFactories.revenueCat,
}));

import { POST as createCheckout } from "../app/api/v1/billing/checkout/route";
import { POST as createPortal } from "../app/api/v1/billing/portal/route";
import { POST as receiveRevenueCatWebhook } from "../app/api/v1/billing/revenuecat/webhook/route";
import { GET as readStatus } from "../app/api/v1/billing/status/route";
import { POST as receiveStripeWebhook } from "../app/api/v1/billing/webhook/route";
import {
  readBillingConfiguration,
  readRevenueCatWebhookConfiguration,
} from "../lib/server/billing/runtime";

const USER_IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";

function completeEnvironment(mode: "stripe_test" | "stripe_live") {
  const live = mode === "stripe_live";
  return {
    THAINAUTE_BILLING_MODE: mode,
    THAINAUTE_PUBLIC_URL: live
      ? "https://thainaute.example/"
      : "http://localhost:3000/",
    STRIPE_RESTRICTED_KEY: live ? "rk_live_example123" : "rk_test_example123",
    STRIPE_WEBHOOK_SECRET: "whsec_example123",
    STRIPE_PREMIUM_PRICE_ID: "price_premium123",
    STRIPE_LIVE_CONFIRMATION: live ? "ENABLE_STRIPE_LIVE" : "",
    REVENUECAT_WEBHOOK_AUTHORIZATION: "revenuecat-secret-value",
    REVENUECAT_WEBHOOK_SIGNING_SECRET:
      "revenuecat-signing-secret-example-123456",
    REVENUECAT_ALLOWED_APP_IDS: "app_ios_example,app_android_example",
    THAINAUTE_SYNC_MODE: "supabase",
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_public_value",
    SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
  } as const;
}

function mutationRequest(path: string): Request {
  return new Request(`https://thainaute.example/api/v1/billing/${path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer access-token",
      "Content-Type": "application/json",
      "Idempotency-Key": USER_IDEMPOTENCY_KEY,
      "Stripe-Signature": "t=1,v1=signature",
      "X-RevenueCat-Webhook-Signature": "t=1,v1=signature",
    },
    body: "{}",
  });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("capacité serveur des routes billing", () => {
  it("conserve la surface masquée en mode disabled sans construire de dépendance", async () => {
    vi.stubEnv("THAINAUTE_BILLING_MODE", "disabled");
    const providerFetch = vi.fn(() =>
      Promise.reject(new Error("provider network must stay unreachable")),
    );
    vi.stubGlobal("fetch", providerFetch);

    const response = await createCheckout(mutationRequest("checkout"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "billing_disabled" },
    });
    expect(providerFactories.billing).not.toHaveBeenCalled();
    expect(providerFactories.revenueCat).not.toHaveBeenCalled();
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it.each(["stripe_test", "stripe_live"] as const)(
    "refuse toutes les routes en %s avant construction ou appel fournisseur",
    async (mode) => {
      const environment = completeEnvironment(mode);
      expect(readBillingConfiguration(environment)).not.toBeNull();
      expect(readRevenueCatWebhookConfiguration(environment)).not.toBeNull();
      for (const [name, value] of Object.entries(environment)) {
        vi.stubEnv(name, value);
      }
      const providerFetch = vi.fn(() =>
        Promise.reject(new Error("provider network must stay unreachable")),
      );
      vi.stubGlobal("fetch", providerFetch);

      const responses = await Promise.all([
        createCheckout(mutationRequest("checkout")),
        createPortal(mutationRequest("portal")),
        readStatus(
          new Request("https://thainaute.example/api/v1/billing/status", {
            headers: { Authorization: "Bearer access-token" },
          }),
        ),
        receiveStripeWebhook(mutationRequest("webhook")),
        receiveRevenueCatWebhook(mutationRequest("revenuecat/webhook")),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toMatchObject({
          error: { code: "billing_unavailable" },
        });
      }
      expect(providerFactories.billing).not.toHaveBeenCalled();
      expect(providerFactories.revenueCat).not.toHaveBeenCalled();
      expect(providerFetch).not.toHaveBeenCalled();
    },
  );
});
