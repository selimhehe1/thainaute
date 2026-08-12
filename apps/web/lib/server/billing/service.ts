import { createHash } from "node:crypto";

import Stripe from "stripe";
import { z } from "zod";

import {
  billingCheckoutResponseSchema,
  billingEventResponseSchema,
} from "./contracts";
import { BillingApiError, BillingInfrastructureError } from "./errors";
import { BILLING_API_VERSION, type BillingConfiguration } from "./runtime";
import type { BillingCheckoutService, BillingRepository } from "./ports";

const userIdSchema = z.uuid();

export function createStripeClient(
  configuration: BillingConfiguration,
): Stripe {
  return new Stripe(configuration.stripeRestrictedKey, {
    apiVersion: BILLING_API_VERSION,
    maxNetworkRetries: 2,
    timeout: 10_000,
    appInfo: {
      name: "Thainaute",
      version: "0.0.0",
      url: configuration.publicOrigin,
    },
  });
}

type StripeMutation = "checkout" | "portal";

function stripeIdempotencyKey(input: {
  readonly operation: StripeMutation;
  readonly userId: string;
  readonly clientIdempotencyKey: string;
}): string {
  const digest = createHash("sha256")
    .update("thainaute-stripe-idempotency-v1\0", "utf8")
    .update(input.operation, "utf8")
    .update("\0", "utf8")
    .update(input.userId, "utf8")
    .update("\0", "utf8")
    .update(input.clientIdempotencyKey, "utf8")
    .digest("hex");
  return `thainaute-${input.operation}-${digest}`;
}

function stripeCustomerIdempotencyKey(userId: string): string {
  const digest = createHash("sha256")
    .update("thainaute-stripe-customer-v1\0", "utf8")
    .update(userId, "utf8")
    .digest("hex");
  return `thainaute-customer-${digest}`;
}

/**
 * Stripe exige un suffixe de huit lettres pour identifier l'intégration.
 * Il varie entre deux commandes, mais reste strictement stable au rejeu de la
 * même commande afin que les paramètres Stripe restent idempotents.
 */
function integrationSuffix(idempotencyKey: string): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const digest = createHash("sha256")
    .update("thainaute-stripe-integration-v1\0", "utf8")
    .update(idempotencyKey, "utf8")
    .digest();
  return Array.from({ length: 8 }, (_, index) =>
    alphabet.charAt((digest[index] ?? 0) % alphabet.length),
  ).join("");
}

function providerObjectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    value !== null &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string"
  ) {
    return value.id;
  }
  return null;
}

function metadataUserId(
  metadata: Stripe.Metadata | null | undefined,
): string | null {
  const candidate = metadata?.thainaute_user_id;
  return candidate !== undefined && userIdSchema.safeParse(candidate).success
    ? candidate.toLowerCase()
    : null;
}

function metadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function timestampFromUnixSeconds(
  value: number | null | undefined,
): string | null {
  if (value === null || value === undefined || !Number.isInteger(value)) {
    return null;
  }
  const date = new Date(value * 1_000);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function subscriptionPeriodEnd(
  subscription: Stripe.Subscription,
  priceId: string,
): string | null {
  const premiumItem = subscription.items.data.find(
    (item) => providerObjectId(item.price) === priceId,
  );
  return timestampFromUnixSeconds(premiumItem?.current_period_end);
}

function subscriptionStatus(
  subscription: Stripe.Subscription,
  eventType: string,
): "active" | "trialing" | "revoked" {
  if (eventType === "customer.subscription.deleted") return "revoked";
  if (subscription.status === "active") return "active";
  if (subscription.status === "trialing") return "trialing";
  return "revoked";
}

function hasPremiumPrice(
  subscription: Stripe.Subscription,
  priceId: string,
): boolean {
  return subscription.items.data.some(
    (item) => providerObjectId(item.price) === priceId,
  );
}

function isMarkedAsThainautePremium(
  metadata: Stripe.Metadata | null | undefined,
): boolean {
  return (
    metadataValue(metadata, "thainaute_entitlement") === "premium" &&
    metadataValue(metadata, "thainaute_price_id") !== null
  );
}

function assertCanonicalInvoiceSubscription(input: {
  readonly subscription: Stripe.Subscription;
  readonly subscriptionId: string;
  readonly invoiceCustomerId: string | null;
  readonly expectedLivemode: boolean;
}): string {
  const subscriptionCustomerId = providerObjectId(input.subscription.customer);
  if (
    input.subscription.id !== input.subscriptionId ||
    input.subscription.livemode !== input.expectedLivemode ||
    input.invoiceCustomerId === null ||
    subscriptionCustomerId === null ||
    input.invoiceCustomerId !== subscriptionCustomerId
  ) {
    throw new BillingInfrastructureError("billing_conflict");
  }
  return subscriptionCustomerId;
}

function consistentUserId(
  candidates: readonly (string | null)[],
): string | null {
  const present = candidates.filter(
    (candidate): candidate is string => candidate !== null,
  );
  if (new Set(present).size > 1) {
    throw new BillingInfrastructureError("billing_conflict");
  }
  return present[0] ?? null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (parent?.type !== "subscription_details") return null;
  return providerObjectId(parent.subscription_details?.subscription);
}

function invoiceSubscriptionMetadata(
  invoice: Stripe.Invoice,
): Stripe.Metadata | null {
  const parent = invoice.parent;
  if (parent?.type !== "subscription_details") return null;
  return parent.subscription_details?.metadata ?? null;
}

function payloadSha256(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function createBillingService(input: {
  readonly configuration: BillingConfiguration;
  readonly repository: BillingRepository;
  readonly stripe?: Stripe;
}): BillingCheckoutService {
  const stripe = input.stripe ?? createStripeClient(input.configuration);

  return {
    async createCheckout({ userId, idempotencyKey }) {
      const customer = await input.repository.getCustomer(userId);
      let stripeCustomerId = customer.stripeCustomerId;

      if (stripeCustomerId === null) {
        let created: Stripe.Customer;
        try {
          created = await stripe.customers.create(
            {
              metadata: {
                thainaute_user_id: userId,
                thainaute_entitlement: "premium",
              },
            },
            { idempotencyKey: stripeCustomerIdempotencyKey(userId) },
          );
        } catch {
          throw new BillingInfrastructureError("billing_unavailable");
        }
        stripeCustomerId = created.id;
        await input.repository.upsertCustomer({
          userId,
          stripeCustomerId,
        });
      }

      let session: Stripe.Checkout.Session;
      try {
        const providerIdempotencyKey = stripeIdempotencyKey({
          operation: "checkout",
          userId,
          clientIdempotencyKey: idempotencyKey,
        });
        session = await stripe.checkout.sessions.create(
          {
            mode: "subscription",
            customer: stripeCustomerId,
            client_reference_id: userId,
            line_items: [
              { price: input.configuration.stripePremiumPriceId, quantity: 1 },
            ],
            metadata: {
              thainaute_user_id: userId,
              thainaute_entitlement: "premium",
              thainaute_price_id: input.configuration.stripePremiumPriceId,
            },
            subscription_data: {
              metadata: {
                thainaute_user_id: userId,
                thainaute_entitlement: "premium",
                thainaute_price_id: input.configuration.stripePremiumPriceId,
              },
            },
            success_url: `${input.configuration.publicOrigin}/account?billing=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${input.configuration.publicOrigin}/account?billing=cancelled`,
            integration_identifier: `thainaute-${integrationSuffix(providerIdempotencyKey)}`,
          },
          { idempotencyKey: providerIdempotencyKey },
        );
      } catch {
        throw new BillingInfrastructureError("billing_unavailable");
      }

      const response = billingCheckoutResponseSchema.safeParse({
        sessionId: session.id,
        url: session.url,
      });
      if (!response.success) {
        throw new BillingInfrastructureError("billing_unavailable");
      }
      return response.data;
    },

    async createPortal({ userId, idempotencyKey }) {
      const customer = await input.repository.getCustomer(userId);
      if (customer.stripeCustomerId === null) {
        throw new BillingApiError("billing_conflict");
      }

      try {
        const providerIdempotencyKey = stripeIdempotencyKey({
          operation: "portal",
          userId,
          clientIdempotencyKey: idempotencyKey,
        });
        const session = await stripe.billingPortal.sessions.create(
          {
            customer: customer.stripeCustomerId,
            return_url: `${input.configuration.publicOrigin}/account`,
          },
          { idempotencyKey: providerIdempotencyKey },
        );
        if (typeof session.url !== "string" || session.url.length === 0) {
          throw new BillingInfrastructureError("billing_unavailable");
        }
        return { url: session.url };
      } catch (error) {
        if (error instanceof BillingInfrastructureError) throw error;
        throw new BillingInfrastructureError("billing_unavailable");
      }
    },

    async getStatus(userId) {
      return input.repository.getStatus(userId);
    },

    async handleStripeWebhook({ rawBody, signature }) {
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          input.configuration.stripeWebhookSecret,
        );
      } catch {
        throw new BillingApiError("billing_invalid_signature");
      }

      const eventCreatedAt = timestampFromUnixSeconds(event.created);
      const expectedLivemode = input.configuration.mode === "stripe_live";
      if (eventCreatedAt === null || event.livemode !== expectedLivemode) {
        throw new BillingApiError("billing_invalid_signature");
      }

      let command: Parameters<BillingRepository["applyEvent"]>[0] = {
        provider: "stripe",
        eventId: event.id,
        eventType: event.type,
        eventCreatedAt,
        payloadSha256: payloadSha256(rawBody),
        userId: null,
        entitlement: null,
        providerCustomerId: null,
        providerSubscriptionId: null,
        status: null,
        currentPeriodEnd: null,
      };

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.client_reference_id !== null
          ? userIdSchema.safeParse(session.client_reference_id)
          : null
        )?.success
          ? (session.client_reference_id?.toLowerCase() ?? null)
          : metadataUserId(session.metadata);
        const subscriptionId = providerObjectId(session.subscription);
        command = {
          ...command,
          userId,
          providerCustomerId: providerObjectId(session.customer),
          providerSubscriptionId: subscriptionId,
        };
      } else if (event.type.startsWith("customer.subscription.")) {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = metadataUserId(subscription.metadata);
        const customerId = providerObjectId(subscription.customer);
        if (userId === null && customerId !== null) {
          userId = await input.repository.findUserByCustomer({
            provider: "stripe",
            providerCustomerId: customerId,
          });
        }
        const isPremiumSubscription = hasPremiumPrice(
          subscription,
          input.configuration.stripePremiumPriceId,
        );
        const isHistoricalPremium = isMarkedAsThainautePremium(
          subscription.metadata,
        );
        let status = isPremiumSubscription
          ? subscriptionStatus(subscription, event.type)
          : isHistoricalPremium
            ? "revoked"
            : null;
        const currentPeriodEnd = isPremiumSubscription
          ? subscriptionPeriodEnd(
              subscription,
              input.configuration.stripePremiumPriceId,
            )
          : null;
        if (
          (status === "active" || status === "trialing") &&
          currentPeriodEnd === null
        ) {
          status = "revoked";
        }
        command = {
          ...command,
          userId,
          entitlement: status === null ? null : "premium",
          providerCustomerId: customerId,
          providerSubscriptionId: subscription.id,
          status,
          currentPeriodEnd,
        };
      } else if (
        event.type === "invoice.paid" ||
        event.type === "invoice.payment_failed" ||
        event.type === "invoice.payment_action_required"
      ) {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionMetadata = invoiceSubscriptionMetadata(invoice);
        const subscriptionId = invoiceSubscriptionId(invoice);
        const invoiceCustomerId = providerObjectId(invoice.customer);
        let canonicalSubscription: Stripe.Subscription | null = null;
        if (subscriptionId !== null) {
          try {
            canonicalSubscription =
              await stripe.subscriptions.retrieve(subscriptionId);
          } catch {
            // Un paiement ne peut jamais prolonger Premium depuis les seules
            // metadata de l'Invoice. Stripe rejouera le webhook.
            throw new BillingInfrastructureError("billing_unavailable");
          }
        }

        let customerId = invoiceCustomerId;
        let userId = consistentUserId([
          metadataUserId(invoice.metadata),
          metadataUserId(subscriptionMetadata),
        ]);
        let status: "active" | "trialing" | "revoked" | null = null;
        let currentPeriodEnd: string | null = null;

        if (canonicalSubscription !== null && subscriptionId !== null) {
          customerId = assertCanonicalInvoiceSubscription({
            subscription: canonicalSubscription,
            subscriptionId,
            invoiceCustomerId,
            expectedLivemode,
          });
          const mappedUserId = await input.repository.findUserByCustomer({
            provider: "stripe",
            providerCustomerId: customerId,
          });
          userId = consistentUserId([
            userId,
            metadataUserId(canonicalSubscription.metadata),
            mappedUserId,
          ]);

          const hasCanonicalPremiumPrice = hasPremiumPrice(
            canonicalSubscription,
            input.configuration.stripePremiumPriceId,
          );
          const isHistoricalPremium =
            isMarkedAsThainautePremium(subscriptionMetadata) ||
            isMarkedAsThainautePremium(canonicalSubscription.metadata);
          if (hasCanonicalPremiumPrice) {
            status =
              event.type === "invoice.paid"
                ? subscriptionStatus(canonicalSubscription, event.type)
                : "revoked";
            currentPeriodEnd = subscriptionPeriodEnd(
              canonicalSubscription,
              input.configuration.stripePremiumPriceId,
            );
            if (
              (status === "active" || status === "trialing") &&
              currentPeriodEnd === null
            ) {
              status = "revoked";
            }
          } else if (isHistoricalPremium) {
            // Les metadata ne peuvent qu'identifier un ancien abonnement
            // Thaïnaute : elles ne peuvent jamais accorder Premium.
            status = "revoked";
          }
        }
        command = {
          ...command,
          userId,
          entitlement: status === null ? null : "premium",
          providerCustomerId: customerId,
          providerSubscriptionId: subscriptionId,
          status,
          currentPeriodEnd,
        };
      }

      const result = await input.repository.applyEvent(command);
      const parsed = billingEventResponseSchema.safeParse(result);
      if (!parsed.success) {
        throw new BillingInfrastructureError("billing_unavailable");
      }
      return parsed.data;
    },
  };
}
