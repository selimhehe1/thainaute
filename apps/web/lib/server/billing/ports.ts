import type {
  BillingCustomer,
  BillingEventResponse,
  BillingStatus,
} from "./contracts";

export interface BillingRepository {
  readonly getCustomer: (userId: string) => Promise<BillingCustomer>;
  readonly upsertCustomer: (input: {
    readonly userId: string;
    readonly stripeCustomerId?: string | null;
    readonly revenuecatAppUserId?: string | null;
  }) => Promise<BillingCustomer>;
  readonly findUserByCustomer: (input: {
    readonly provider: "stripe" | "revenuecat";
    readonly providerCustomerId: string;
  }) => Promise<string | null>;
  readonly getStatus: (userId: string) => Promise<BillingStatus>;
  readonly applyEvent: (input: {
    readonly provider: "stripe" | "revenuecat" | "manual";
    readonly eventId: string;
    readonly eventType: string;
    readonly eventCreatedAt: string;
    readonly payloadSha256: string;
    readonly userId?: string | null;
    readonly entitlement?: "premium" | null;
    readonly providerCustomerId?: string | null;
    readonly providerSubscriptionId?: string | null;
    readonly status?:
      "active" | "trialing" | "grace" | "expired" | "revoked" | null;
    readonly currentPeriodEnd?: string | null;
  }) => Promise<BillingEventResponse>;
}

export interface BillingIdentityVerifier {
  readonly verify: (
    accessToken: string,
  ) => Promise<{ readonly userId: string }>;
}

export interface BillingCheckoutService {
  readonly createCheckout: (input: {
    readonly userId: string;
    readonly idempotencyKey: string;
  }) => Promise<{ readonly sessionId: string; readonly url: string }>;
  readonly createPortal: (input: {
    readonly userId: string;
    readonly idempotencyKey: string;
  }) => Promise<{ readonly url: string }>;
  readonly getStatus: (userId: string) => Promise<BillingStatus>;
  readonly handleStripeWebhook: (input: {
    readonly rawBody: string;
    readonly signature: string;
  }) => Promise<BillingEventResponse>;
}

export interface BillingRevenueCatService {
  readonly handleRevenueCatWebhook: (input: {
    readonly rawBody: string;
  }) => Promise<BillingEventResponse>;
}
