import { describe, expect, it } from "vitest";

import {
  areBillingProviderActionsEnabled,
  BILLING_PROVIDER_ACTIONS_CAPABILITY,
} from "../lib/server/billing/capability";
import {
  readBillingConfiguration,
  readBillingMode,
  readRevenueCatWebhookAuthorization,
  readRevenueCatWebhookConfiguration,
} from "../lib/server/billing/runtime";
import { diagnoseRuntime } from "../lib/server/runtime-config";

const testStripeEnvironment = {
  THAINAUTE_BILLING_MODE: "stripe_test",
  THAINAUTE_PUBLIC_URL: "http://localhost:3000/",
  STRIPE_RESTRICTED_KEY: "rk_test_example123",
  STRIPE_WEBHOOK_SECRET: "whsec_example123",
  STRIPE_PREMIUM_PRICE_ID: "price_premium123",
  REVENUECAT_WEBHOOK_AUTHORIZATION: "revenuecat-secret-value",
  REVENUECAT_WEBHOOK_SIGNING_SECRET: "revenuecat-signing-secret-example-123456",
  REVENUECAT_ALLOWED_APP_IDS: "app_ios_example,app_android_example",
} as const;

describe("configuration de facturation", () => {
  it("garde les actions fournisseur fermées par une capacité serveur non configurable", () => {
    expect(BILLING_PROVIDER_ACTIONS_CAPABILITY).toEqual({
      enabled: false,
      blockers: [
        "multi_provider_entitlement_aggregation",
        "billing_account_export",
        "coordinated_provider_account_deletion",
      ],
    });
    expect(areBillingProviderActionsEnabled()).toBe(false);
  });

  it("reste désactivée par défaut", () => {
    expect(readBillingMode({})).toBe("disabled");
    expect(readBillingConfiguration({})).toBeNull();
  });

  it("accepte une configuration Stripe test complète", () => {
    expect(readBillingMode(testStripeEnvironment)).toBe("stripe_test");
    expect(readBillingConfiguration(testStripeEnvironment)).toEqual({
      mode: "stripe_test",
      publicOrigin: "http://localhost:3000",
      stripeRestrictedKey: "rk_test_example123",
      stripeWebhookSecret: "whsec_example123",
      stripePremiumPriceId: "price_premium123",
    });
  });

  it("refuse les clés qui ne correspondent pas au mode", () => {
    expect(
      readBillingConfiguration({
        ...testStripeEnvironment,
        STRIPE_RESTRICTED_KEY: "sk_test_do_not_use",
      }),
    ).toBeNull();
    expect(
      readBillingMode({ THAINAUTE_BILLING_MODE: "stripe_prod" }),
    ).toBeNull();
  });

  it("garde Stripe live derrière HTTPS et une confirmation explicite", () => {
    const liveEnvironment = {
      ...testStripeEnvironment,
      THAINAUTE_BILLING_MODE: "stripe_live",
      THAINAUTE_PUBLIC_URL: "https://thainaute.example/",
      STRIPE_RESTRICTED_KEY: "rk_live_example123",
      STRIPE_LIVE_CONFIRMATION: "ENABLE_STRIPE_LIVE",
    } as const;

    expect(readBillingConfiguration(liveEnvironment)).toMatchObject({
      mode: "stripe_live",
      publicOrigin: "https://thainaute.example",
    });
    expect(
      readBillingConfiguration({
        ...liveEnvironment,
        STRIPE_LIVE_CONFIRMATION: "",
      }),
    ).toBeNull();
    expect(
      readBillingConfiguration({
        ...liveEnvironment,
        THAINAUTE_PUBLIC_URL: "http://thainaute.example/",
      }),
    ).toBeNull();
  });

  it("ferme la readiness si un mode actif n'a pas ses dépendances", () => {
    expect(
      diagnoseRuntime({ THAINAUTE_BILLING_MODE: "unknown" }).issues,
    ).toContain("billing_mode_invalid");
    const missing = diagnoseRuntime({
      ...testStripeEnvironment,
      REVENUECAT_WEBHOOK_AUTHORIZATION: "",
    });
    expect(missing.ready).toBe(false);
    expect(missing.issues).toEqual(
      expect.arrayContaining([
        "account_deletion_billing_coordinator_missing",
        "account_deletion_config_missing",
        "billing_revenuecat_config_missing",
        "supabase_config_missing",
      ]),
    );
  });

  it("reste non ready avec une configuration active complète tant que le coordinateur de suppression manque", () => {
    const diagnostic = diagnoseRuntime({
      ...testStripeEnvironment,
      THAINAUTE_SYNC_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
      ACCOUNT_DELETION_RECEIPT_PEPPER:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      THAINAUTE_PUBLIC_CONTENT_RELEASE_ID:
        "10000000-0000-4000-8000-000000000001",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toContain(
      "account_deletion_billing_coordinator_missing",
    );
    expect(diagnostic.issues).toContain(
      "billing_provider_actions_not_approved",
    );
    expect(diagnostic.issues).not.toContain("account_deletion_config_missing");
    expect(diagnostic.issues).not.toContain("supabase_config_missing");
  });

  it("refuse le bypass d'un billing actif avec la suppression distante désactivée", () => {
    const diagnostic = diagnoseRuntime({
      ...testStripeEnvironment,
      THAINAUTE_SYNC_MODE: "disabled",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_example_public_value",
      SUPABASE_SECRET_KEY: "sb_secret_example_server_value",
      ACCOUNT_DELETION_RECEIPT_PEPPER:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    });

    expect(diagnostic.ready).toBe(false);
    expect(diagnostic.issues).toEqual(
      expect.arrayContaining([
        "account_deletion_billing_coordinator_missing",
        "account_deletion_config_missing",
      ]),
    );
  });

  it("valide l'autorisation RevenueCat sans la rendre publique", () => {
    expect(
      readRevenueCatWebhookAuthorization({
        ...testStripeEnvironment,
        REVENUECAT_WEBHOOK_AUTHORIZATION: "revenuecat-secret-value",
      }),
    ).toBe("revenuecat-secret-value");
    expect(
      readRevenueCatWebhookAuthorization({
        ...testStripeEnvironment,
        REVENUECAT_WEBHOOK_AUTHORIZATION: "short",
      }),
    ).toBeNull();
  });

  it("verrouille RevenueCat sur le HMAC, les applications et l'environnement du mode", () => {
    expect(readRevenueCatWebhookConfiguration(testStripeEnvironment)).toEqual({
      authorization: "revenuecat-secret-value",
      signingSecret: "revenuecat-signing-secret-example-123456",
      expectedEnvironment: "SANDBOX",
      allowedAppIds: ["app_ios_example", "app_android_example"],
    });
    expect(
      readRevenueCatWebhookConfiguration({
        ...testStripeEnvironment,
        THAINAUTE_BILLING_MODE: "stripe_live",
        THAINAUTE_PUBLIC_URL: "https://thainaute.example/",
        STRIPE_RESTRICTED_KEY: "rk_live_example123",
        STRIPE_LIVE_CONFIRMATION: "ENABLE_STRIPE_LIVE",
      }),
    ).toMatchObject({ expectedEnvironment: "PRODUCTION" });
    expect(
      readRevenueCatWebhookConfiguration({
        ...testStripeEnvironment,
        REVENUECAT_WEBHOOK_SIGNING_SECRET: "short",
      }),
    ).toBeNull();
    expect(
      readRevenueCatWebhookConfiguration({
        ...testStripeEnvironment,
        REVENUECAT_ALLOWED_APP_IDS: "",
      }),
    ).toBeNull();
  });
});
