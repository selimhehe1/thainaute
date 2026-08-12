import { readSupabaseServerConfiguration } from "../attempt-sync/runtime";
import { areBillingProviderActionsEnabled } from "./capability";
import { createStripeClient, createBillingService } from "./service";
import {
  readBillingConfiguration,
  readBillingMode,
  readRevenueCatWebhookConfiguration,
} from "./runtime";
import { createRevenueCatWebhookService } from "./revenuecat";
import { createSupabaseBillingIdentityVerifier } from "./supabase-auth";
import { createSupabaseBillingRepository } from "./supabase-repository";

export function readBillingHandlerDependencies() {
  if (!areBillingProviderActionsEnabled()) return null;

  const billing = readBillingConfiguration();
  const supabase = readSupabaseServerConfiguration();
  if (billing === null || supabase === null) return null;

  const repository = createSupabaseBillingRepository({
    url: supabase.url,
    secretKey: supabase.secretKey,
  });
  return {
    identityVerifier: createSupabaseBillingIdentityVerifier({
      url: supabase.url,
      publishableKey: supabase.publishableKey,
    }),
    service: createBillingService({
      configuration: billing,
      repository,
      stripe: createStripeClient(billing),
    }),
  };
}

export function readRevenueCatHandlerDependencies() {
  if (!areBillingProviderActionsEnabled()) return null;

  const mode = readBillingMode();
  const webhook = readRevenueCatWebhookConfiguration();
  const supabase = readSupabaseServerConfiguration();
  if (
    mode === null ||
    mode === "disabled" ||
    webhook === null ||
    supabase === null
  ) {
    return null;
  }

  const repository = createSupabaseBillingRepository({
    url: supabase.url,
    secretKey: supabase.secretKey,
  });
  return {
    authorization: webhook.authorization,
    signingSecret: webhook.signingSecret,
    service: createRevenueCatWebhookService({
      repository,
      expectedEnvironment: webhook.expectedEnvironment,
      allowedAppIds: webhook.allowedAppIds,
    }),
  };
}
