import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { BillingApiError } from "../lib/server/billing/errors";
import { createRevenueCatWebhookService } from "../lib/server/billing/revenuecat";
import { createBillingService } from "../lib/server/billing/service";
import type { BillingConfiguration } from "../lib/server/billing/runtime";
import type { BillingRepository } from "../lib/server/billing/ports";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const IDEMPOTENCY_KEY = "50000000-0000-4000-8000-000000000001";
const CONFIGURATION: BillingConfiguration = {
  mode: "stripe_test",
  publicOrigin: "http://localhost:3000",
  stripeRestrictedKey: "rk_test_example123",
  stripeWebhookSecret: "whsec_example123",
  stripePremiumPriceId: "price_premium123",
};
const REVENUECAT_CONFIGURATION = {
  expectedEnvironment: "SANDBOX",
  allowedAppIds: ["app_ios_example", "app_android_example"],
} as const;

function repository(
  overrides: Partial<BillingRepository> = {},
): BillingRepository {
  return {
    getCustomer: vi.fn(async () => ({
      stripeCustomerId: null,
      revenuecatAppUserId: null,
    })),
    upsertCustomer: vi.fn(async () => ({
      stripeCustomerId: "cus_test123",
      revenuecatAppUserId: null,
    })),
    findUserByCustomer: vi.fn(async () => USER_ID),
    getStatus: vi.fn(async () => ({
      entitlement: "premium" as const,
      status: "none" as const,
      active: false,
      provider: null,
      currentPeriodEnd: null,
    })),
    applyEvent: vi.fn(async () => ({
      status: "applied" as const,
      userId: USER_ID,
      entitlement: "premium" as const,
      active: true,
    })),
    ...overrides,
  };
}

function stripeDouble(
  overrides: {
    readonly event?: Stripe.Event;
    readonly subscription?: Stripe.Subscription | Error;
  } = {},
) {
  const subscription =
    overrides.subscription ??
    ({
      id: "sub_test123",
      status: "active",
      livemode: false,
      customer: "cus_test123",
      metadata: {
        thainaute_user_id: USER_ID,
        thainaute_entitlement: "premium",
        thainaute_price_id: "price_premium123",
      },
      items: {
        data: [
          {
            current_period_end: 1_756_000_000,
            price: { id: "price_premium123" },
          },
        ],
      },
    } as unknown as Stripe.Subscription);
  return {
    customers: {
      create: vi.fn(async () => ({ id: "cus_test123" })),
    },
    checkout: {
      sessions: {
        create: vi.fn(async () => ({
          id: "cs_test123",
          url: "https://checkout.stripe.com/c/pay/cs_test123",
        })),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(async () => ({
          url: "https://billing.stripe.com/p/session_test123",
        })),
      },
    },
    subscriptions: {
      retrieve: vi.fn(async () => {
        if (subscription instanceof Error) throw subscription;
        return subscription;
      }),
    },
    webhooks: {
      constructEvent: vi.fn(() => {
        if (overrides.event === undefined) throw new Error("bad signature");
        return overrides.event;
      }),
    },
  } as unknown as Stripe;
}

describe("service de facturation Stripe", () => {
  it("crée un Checkout abonnement avec idempotence et sans méthode de paiement forcée", async () => {
    const billingRepository = repository();
    const stripe = stripeDouble();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe,
    });

    const result = await service.createCheckout({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(result).toEqual({
      sessionId: "cs_test123",
      url: "https://checkout.stripe.com/c/pay/cs_test123",
    });
    expect(stripe.customers.create).toHaveBeenCalledWith(
      {
        metadata: {
          thainaute_user_id: USER_ID,
          thainaute_entitlement: "premium",
        },
      },
      {
        idempotencyKey: expect.stringMatching(
          /^thainaute-customer-[0-9a-f]{64}$/u,
        ),
      },
    );
    const customerIdempotencyKey = vi.mocked(stripe.customers.create).mock
      .calls[0]?.[1]?.idempotencyKey;
    expect(customerIdempotencyKey).not.toContain(USER_ID);
    expect(billingRepository.upsertCustomer).toHaveBeenCalledWith({
      userId: USER_ID,
      stripeCustomerId: "cus_test123",
    });
    const [parameters, options] =
      vi.mocked(stripe.checkout.sessions.create).mock.calls[0] ?? [];
    expect(parameters).toMatchObject({
      mode: "subscription",
      customer: "cus_test123",
      client_reference_id: USER_ID,
      line_items: [{ price: "price_premium123", quantity: 1 }],
      metadata: {
        thainaute_entitlement: "premium",
        thainaute_price_id: "price_premium123",
        thainaute_user_id: USER_ID,
      },
      subscription_data: {
        metadata: {
          thainaute_entitlement: "premium",
          thainaute_price_id: "price_premium123",
          thainaute_user_id: USER_ID,
        },
      },
    });
    expect(parameters).not.toHaveProperty("payment_method_types");
    expect(parameters?.integration_identifier).toMatch(/^thainaute-[a-z]{8}$/u);
    expect(options).toEqual({
      idempotencyKey: expect.stringMatching(
        /^thainaute-checkout-[0-9a-f]{64}$/u,
      ),
    });
    expect(options?.idempotencyKey).not.toContain(USER_ID);
    expect(options?.idempotencyKey).not.toContain(IDEMPOTENCY_KEY);
  });

  it("garde les paramètres Checkout identiques au rejeu et isole users/opérations", async () => {
    const billingRepository = repository({
      getCustomer: vi.fn(async () => ({
        stripeCustomerId: "cus_existing123",
        revenuecatAppUserId: null,
      })),
    });
    const stripe = stripeDouble();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe,
    });

    await service.createCheckout({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    await service.createCheckout({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    await service.createCheckout({
      userId: OTHER_USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    await service.createPortal({
      userId: USER_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    const checkoutCalls = vi.mocked(stripe.checkout.sessions.create).mock.calls;
    expect(checkoutCalls[1]).toEqual(checkoutCalls[0]);
    const firstKey = checkoutCalls[0]?.[1]?.idempotencyKey;
    const otherUserKey = checkoutCalls[2]?.[1]?.idempotencyKey;
    const portalKey = vi.mocked(stripe.billingPortal.sessions.create).mock
      .calls[0]?.[1]?.idempotencyKey;
    expect(firstKey).toMatch(/^thainaute-checkout-[0-9a-f]{64}$/u);
    expect(otherUserKey).toMatch(/^thainaute-checkout-[0-9a-f]{64}$/u);
    expect(portalKey).toMatch(/^thainaute-portal-[0-9a-f]{64}$/u);
    expect(new Set([firstKey, otherUserKey, portalKey]).size).toBe(3);
  });

  it("ouvre le portail uniquement pour un client déjà lié", async () => {
    const billingRepository = repository({
      getCustomer: vi.fn(async () => ({
        stripeCustomerId: "cus_existing123",
        revenuecatAppUserId: null,
      })),
    });
    const stripe = stripeDouble();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe,
    });

    await expect(
      service.createPortal({
        userId: USER_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
      }),
    ).resolves.toEqual({
      url: "https://billing.stripe.com/p/session_test123",
    });
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      {
        customer: "cus_existing123",
        return_url: "http://localhost:3000/account",
      },
      {
        idempotencyKey: expect.stringMatching(
          /^thainaute-portal-[0-9a-f]{64}$/u,
        ),
      },
    );

    const noCustomer = createBillingService({
      configuration: CONFIGURATION,
      repository: repository(),
      stripe: stripeDouble(),
    });
    await expect(
      noCustomer.createPortal({
        userId: USER_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
      }),
    ).rejects.toMatchObject({
      code: "billing_conflict",
    });
  });

  it("n'accorde jamais Premium depuis Checkout completed seul", async () => {
    const event = {
      id: "evt_checkout_completed123",
      type: "checkout.session.completed",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "cs_test123",
          mode: "subscription",
          payment_status: "paid",
          client_reference_id: USER_ID,
          customer: "cus_test123",
          subscription: "sub_test123",
          metadata: {
            thainaute_user_id: USER_ID,
            thainaute_entitlement: "premium",
            thainaute_price_id: "price_premium123",
          },
        },
      },
    } as unknown as Stripe.Event;
    const billingRepository = repository({
      applyEvent: vi.fn(async () => ({ status: "ignored" as const })),
    });
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({ event }),
    });

    await expect(
      service.handleStripeWebhook({
        rawBody: '{"id":"evt_checkout_completed123"}',
        signature: "t=1,v1=signature",
      }),
    ).resolves.toEqual({ status: "ignored" });
    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        providerSubscriptionId: "sub_test123",
        entitlement: null,
        status: null,
      }),
    );
  });

  it("vérifie la signature Stripe puis normalise un événement d'abonnement", async () => {
    const event = {
      id: "evt_test123",
      type: "customer.subscription.updated",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "sub_test123",
          status: "active",
          customer: "cus_test123",
          metadata: { thainaute_user_id: USER_ID },
          items: {
            data: [
              {
                current_period_end: 1_756_000_000,
                price: { id: "price_premium123" },
              },
            ],
          },
        },
      },
    } as unknown as Stripe.Event;
    const billingRepository = repository();
    const stripe = stripeDouble({ event });
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe,
    });

    await expect(
      service.handleStripeWebhook({
        rawBody: '{"id":"evt_test123"}',
        signature: "t=1,v1=signature",
      }),
    ).resolves.toMatchObject({ status: "applied" });

    expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
      '{"id":"evt_test123"}',
      "t=1,v1=signature",
      CONFIGURATION.stripeWebhookSecret,
    );
    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "stripe",
        eventId: "evt_test123",
        userId: USER_ID,
        providerCustomerId: "cus_test123",
        providerSubscriptionId: "sub_test123",
        status: "active",
        currentPeriodEnd: new Date(1_756_000_000 * 1_000).toISOString(),
      }),
    );
  });

  it("ne donne pas Premium à un abonnement Stripe d'un autre prix", async () => {
    const event = {
      id: "evt_other_price123",
      type: "customer.subscription.updated",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "sub_other_price123",
          status: "active",
          customer: "cus_test123",
          metadata: { thainaute_user_id: USER_ID },
          items: {
            data: [{ price: { id: "price_other123" } }],
          },
        },
      },
    } as unknown as Stripe.Event;
    const billingRepository = repository();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({ event }),
    });

    await service.handleStripeWebhook({
      rawBody: '{"id":"evt_other_price123"}',
      signature: "t=1,v1=signature",
    });

    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entitlement: null,
        status: null,
        providerSubscriptionId: "sub_other_price123",
      }),
    );
  });

  it("révoque un abonnement Thaïnaute passé sur un autre prix", async () => {
    const event = {
      id: "evt_price_switch123",
      type: "customer.subscription.updated",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "sub_test123",
          status: "active",
          customer: "cus_test123",
          metadata: {
            thainaute_user_id: USER_ID,
            thainaute_entitlement: "premium",
            thainaute_price_id: "price_premium123",
          },
          items: {
            data: [{ price: { id: "price_other123" } }],
          },
        },
      },
    } as unknown as Stripe.Event;
    const billingRepository = repository();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({ event }),
    });

    await service.handleStripeWebhook({
      rawBody: '{"id":"evt_price_switch123"}',
      signature: "valid",
    });

    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entitlement: "premium",
        providerSubscriptionId: "sub_test123",
        status: "revoked",
        currentPeriodEnd: null,
      }),
    );
  });

  it.each(["incomplete", "incomplete_expired", "past_due", "unpaid"] as const)(
    "révoque un abonnement Premium Stripe au statut non payé %s",
    async (subscriptionStatus) => {
      const event = {
        id: `evt_subscription_${subscriptionStatus}`,
        type: "customer.subscription.updated",
        created: 1_754_050_400,
        livemode: false,
        data: {
          object: {
            id: "sub_test123",
            status: subscriptionStatus,
            customer: "cus_test123",
            metadata: { thainaute_user_id: USER_ID },
            items: {
              data: [
                {
                  current_period_end: 1_756_000_000,
                  price: { id: "price_premium123" },
                },
              ],
            },
          },
        },
      } as unknown as Stripe.Event;
      const billingRepository = repository();
      const service = createBillingService({
        configuration: CONFIGURATION,
        repository: billingRepository,
        stripe: stripeDouble({ event }),
      });

      await service.handleStripeWebhook({
        rawBody: JSON.stringify({ id: event.id }),
        signature: "t=1,v1=signature",
      });

      expect(billingRepository.applyEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          entitlement: "premium",
          status: "revoked",
        }),
      );
    },
  );

  it("révoque une Invoice aux metadata Premium devenues obsolètes", async () => {
    const event = {
      id: "evt_invoice_stale_metadata123",
      type: "invoice.paid",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "in_stale_metadata123",
          customer: "cus_test123",
          metadata: null,
          parent: {
            type: "subscription_details",
            subscription_details: {
              metadata: {
                thainaute_user_id: USER_ID,
                thainaute_entitlement: "premium",
                thainaute_price_id: "price_premium123",
              },
              subscription: "sub_test123",
            },
          },
        },
      },
    } as unknown as Stripe.Event;
    const canonicalSubscription = {
      id: "sub_test123",
      status: "active",
      livemode: false,
      customer: "cus_test123",
      metadata: {
        thainaute_user_id: USER_ID,
        thainaute_entitlement: "premium",
        thainaute_price_id: "price_premium123",
      },
      items: { data: [{ price: { id: "price_other123" } }] },
    } as unknown as Stripe.Subscription;
    const billingRepository = repository();
    const stripe = stripeDouble({ event, subscription: canonicalSubscription });
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe,
    });

    await service.handleStripeWebhook({
      rawBody: '{"id":"evt_invoice_stale_metadata123"}',
      signature: "valid",
    });

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_test123");
    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entitlement: "premium",
        status: "revoked",
        currentPeriodEnd: null,
      }),
    );
  });

  it("n'accorde rien si la Subscription canonique d'une Invoice est indisponible", async () => {
    const event = {
      id: "evt_invoice_retrieve_failed123",
      type: "invoice.paid",
      created: 1_754_050_400,
      livemode: false,
      data: {
        object: {
          id: "in_retrieve_failed123",
          customer: "cus_test123",
          metadata: null,
          parent: {
            type: "subscription_details",
            subscription_details: {
              metadata: {
                thainaute_user_id: USER_ID,
                thainaute_entitlement: "premium",
              },
              subscription: "sub_test123",
            },
          },
        },
      },
    } as unknown as Stripe.Event;
    const billingRepository = repository();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({
        event,
        subscription: new Error("Stripe unavailable"),
      }),
    });

    await expect(
      service.handleStripeWebhook({
        rawBody: '{"id":"evt_invoice_retrieve_failed123"}',
        signature: "valid",
      }),
    ).rejects.toMatchObject({ code: "billing_unavailable" });
    expect(billingRepository.applyEvent).not.toHaveBeenCalled();
  });

  it.each([
    ["invoice.paid", "active"],
    ["invoice.payment_failed", "revoked"],
    ["invoice.payment_action_required", "revoked"],
  ] as const)(
    "normalise l'événement Stripe %s d'un abonnement Premium",
    async (eventType, status) => {
      const event = {
        id: `evt_${eventType.replaceAll(".", "_")}`,
        type: eventType,
        created: 1_754_050_400,
        livemode: false,
        data: {
          object: {
            id: "in_test123",
            customer: "cus_test123",
            period_end: 1_756_000_000,
            billing_reason:
              eventType === "invoice.payment_failed"
                ? "subscription_create"
                : "subscription_cycle",
            metadata: null,
            parent: {
              type: "subscription_details",
              subscription_details: {
                metadata: {
                  thainaute_user_id: USER_ID,
                  thainaute_entitlement: "premium",
                  thainaute_price_id: "price_premium123",
                },
                subscription: "sub_test123",
              },
              quote_details: null,
            },
          },
        },
      } as unknown as Stripe.Event;
      const billingRepository = repository();
      const stripe = stripeDouble({ event });
      const service = createBillingService({
        configuration: CONFIGURATION,
        repository: billingRepository,
        stripe,
      });

      await service.handleStripeWebhook({
        rawBody: JSON.stringify({ id: event.id }),
        signature: "t=1,v1=signature",
      });

      expect(billingRepository.applyEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          entitlement: "premium",
          providerSubscriptionId: "sub_test123",
          status,
          currentPeriodEnd: new Date(1_756_000_000 * 1_000).toISOString(),
        }),
      );
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_test123");
    },
  );

  it("préserve l'ordre canonique quand un ancien échec arrive après un paiement", async () => {
    let latestEventCreatedAt = "";
    let effectiveStatus: string | null = null;
    const applyEvent = vi.fn(
      async (command: Parameters<BillingRepository["applyEvent"]>[0]) => {
        if (command.eventCreatedAt <= latestEventCreatedAt) {
          return { status: "ignored" as const };
        }
        latestEventCreatedAt = command.eventCreatedAt;
        effectiveStatus = command.status ?? null;
        return {
          status: "applied" as const,
          userId: USER_ID,
          entitlement: "premium" as const,
          active: command.status === "active",
        };
      },
    );
    const billingRepository = repository({ applyEvent });
    const invoiceEvent = (
      id: string,
      type: "invoice.paid" | "invoice.payment_failed",
      created: number,
    ) =>
      ({
        id,
        type,
        created,
        livemode: false,
        data: {
          object: {
            id: `in_${id}`,
            customer: "cus_test123",
            period_end: 1_756_000_000,
            metadata: null,
            parent: {
              type: "subscription_details",
              subscription_details: {
                metadata: {
                  thainaute_user_id: USER_ID,
                  thainaute_entitlement: "premium",
                  thainaute_price_id: "price_premium123",
                },
                subscription: "sub_test123",
              },
            },
          },
        },
      }) as unknown as Stripe.Event;

    const paid = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({
        event: invoiceEvent("evt_paid_newer", "invoice.paid", 200),
      }),
    });
    const staleFailure = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({
        event: invoiceEvent("evt_failed_older", "invoice.payment_failed", 100),
      }),
    });

    await expect(
      paid.handleStripeWebhook({ rawBody: "paid", signature: "valid" }),
    ).resolves.toMatchObject({ status: "applied", active: true });
    await expect(
      staleFailure.handleStripeWebhook({
        rawBody: "failed",
        signature: "valid",
      }),
    ).resolves.toEqual({ status: "ignored" });
    expect(effectiveStatus).toBe("active");
    expect(applyEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventCreatedAt: new Date(100_000).toISOString(),
        status: "revoked",
      }),
    );
  });

  it("transforme une signature invalide en erreur publique contrôlée", async () => {
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: repository(),
      stripe: stripeDouble(),
    });

    await expect(
      service.handleStripeWebhook({ rawBody: "{}", signature: "invalid" }),
    ).rejects.toBeInstanceOf(BillingApiError);
    await expect(
      service.handleStripeWebhook({ rawBody: "{}", signature: "invalid" }),
    ).rejects.toMatchObject({ code: "billing_invalid_signature" });
  });

  it("refuse un événement Stripe d'un livemode différent du mode attendu", async () => {
    const event = {
      id: "evt_live_in_test123",
      type: "customer.subscription.updated",
      created: 1_754_050_400,
      livemode: true,
      data: { object: {} },
    } as unknown as Stripe.Event;
    const billingRepository = repository();
    const service = createBillingService({
      configuration: CONFIGURATION,
      repository: billingRepository,
      stripe: stripeDouble({ event }),
    });

    await expect(
      service.handleStripeWebhook({
        rawBody: '{"id":"evt_live_in_test123"}',
        signature: "t=1,v1=signature",
      }),
    ).rejects.toMatchObject({ code: "billing_invalid_signature" });
    expect(billingRepository.applyEvent).not.toHaveBeenCalled();
  });

  it("normalise un webhook RevenueCat avec alias, période et entitlement partagé", async () => {
    const expirationAt = Date.now() + 86_400_000;
    const billingRepository = repository({
      findUserByCustomer: vi.fn(async ({ providerCustomerId }) =>
        providerCustomerId === "rc_app_user" ? USER_ID : null,
      ),
    });
    const service = createRevenueCatWebhookService({
      repository: billingRepository,
      ...REVENUECAT_CONFIGURATION,
    });
    const rawBody = JSON.stringify({
      api_version: "1.0",
      event: {
        id: "rc_evt_test123",
        type: "INITIAL_PURCHASE",
        app_id: "app_ios_example",
        environment: "SANDBOX",
        event_timestamp_ms: Date.now(),
        app_user_id: "rc_app_user",
        original_app_user_id: "rc_original_user",
        aliases: ["rc_original_user"],
        entitlement_ids: ["premium"],
        period_type: "NORMAL",
        expiration_at_ms: expirationAt,
        transaction_id: "rc_transaction123",
      },
    });

    await expect(
      service.handleRevenueCatWebhook({ rawBody }),
    ).resolves.toMatchObject({
      status: "applied",
    });
    expect(billingRepository.findUserByCustomer).toHaveBeenCalledWith({
      provider: "revenuecat",
      providerCustomerId: "rc_app_user",
    });
    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "revenuecat",
        eventId: "rc_evt_test123",
        userId: USER_ID,
        entitlement: "premium",
        providerCustomerId: "rc_app_user",
        providerSubscriptionId: "rc_transaction123",
        status: "active",
        currentPeriodEnd: new Date(expirationAt).toISOString(),
      }),
    );
  });

  it("enregistre les événements non Premium comme ignorés sans accorder de droit", async () => {
    const billingRepository = repository({
      applyEvent: vi.fn(async () => ({ status: "ignored" as const })),
    });
    const service = createRevenueCatWebhookService({
      repository: billingRepository,
      ...REVENUECAT_CONFIGURATION,
    });
    const rawBody = JSON.stringify({
      api_version: "1.0",
      event: {
        id: "rc_evt_other123",
        type: "INITIAL_PURCHASE",
        app_id: "app_android_example",
        environment: "SANDBOX",
        event_timestamp_ms: Date.now(),
        app_user_id: USER_ID,
        entitlement_ids: ["other_entitlement"],
        expiration_at_ms: Date.now() + 86_400_000,
      },
    });

    await expect(service.handleRevenueCatWebhook({ rawBody })).resolves.toEqual(
      {
        status: "ignored",
      },
    );
    expect(billingRepository.applyEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entitlement: null,
        status: null,
      }),
    );
  });

  it.each([
    ["PRODUCTION", "app_ios_example"],
    ["SANDBOX", "app_unknown_example"],
  ] as const)(
    "refuse RevenueCat hors environnement/application (%s, %s)",
    async (environment, appId) => {
      const billingRepository = repository();
      const service = createRevenueCatWebhookService({
        repository: billingRepository,
        ...REVENUECAT_CONFIGURATION,
      });
      const rawBody = JSON.stringify({
        api_version: "1.0",
        event: {
          id: `rc_evt_${environment}_${appId}`,
          type: "INITIAL_PURCHASE",
          app_id: appId,
          environment,
          event_timestamp_ms: Date.now(),
          app_user_id: USER_ID,
          entitlement_ids: ["premium"],
          expiration_at_ms: Date.now() + 86_400_000,
        },
      });

      await expect(
        service.handleRevenueCatWebhook({ rawBody }),
      ).rejects.toMatchObject({ code: "invalid_request" });
      expect(billingRepository.applyEvent).not.toHaveBeenCalled();
    },
  );

  it("refuse un payload RevenueCat malformé", async () => {
    const service = createRevenueCatWebhookService({
      repository: repository(),
      ...REVENUECAT_CONFIGURATION,
    });

    await expect(
      service.handleRevenueCatWebhook({ rawBody: "not-json" }),
    ).rejects.toMatchObject({ code: "invalid_json" });
    await expect(
      service.handleRevenueCatWebhook({
        rawBody: JSON.stringify({ event: {} }),
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });
});
