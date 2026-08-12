import { createHash } from "node:crypto";

import { z } from "zod";

import { billingEventResponseSchema } from "./contracts";
import { BillingApiError, BillingInfrastructureError } from "./errors";
import type { BillingRepository, BillingRevenueCatService } from "./ports";

const userIdSchema = z.uuid();

const revenueCatEventSchema = z.object({
  api_version: z.string().min(1).max(32),
  event: z.object({
    id: z.string().trim().min(1).max(255),
    type: z.string().trim().min(1).max(160),
    app_id: z.string().trim().min(1).max(255),
    environment: z.enum(["SANDBOX", "PRODUCTION"]),
    event_timestamp_ms: z.number().int().nonnegative(),
    app_user_id: z.string().trim().min(1).max(128),
    original_app_user_id: z.string().trim().min(1).max(128).optional(),
    aliases: z.array(z.string().trim().min(1).max(128)).optional(),
    entitlement_id: z.string().trim().min(1).max(128).nullable().optional(),
    entitlement_ids: z.array(z.string().trim().min(1).max(128)).optional(),
    period_type: z.string().trim().max(32).optional(),
    expiration_at_ms: z.number().int().nonnegative().nullable().optional(),
    grace_period_expiration_at_ms: z
      .number()
      .int()
      .nonnegative()
      .nullable()
      .optional(),
    transaction_id: z.string().trim().min(1).max(255).nullable().optional(),
  }),
});

type RevenueCatEvent = z.infer<typeof revenueCatEventSchema>;
type BillingStatus = "active" | "trialing" | "grace" | "revoked";

function timestampFromUnixMilliseconds(
  value: number | null | undefined,
): string | null {
  if (value === null || value === undefined || !Number.isSafeInteger(value)) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function payloadSha256(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

function periodEnd(event: RevenueCatEvent["event"]): string | null {
  const value =
    event.type.toUpperCase() === "BILLING_ISSUE"
      ? (event.grace_period_expiration_at_ms ?? event.expiration_at_ms)
      : event.expiration_at_ms;
  return timestampFromUnixMilliseconds(value);
}

function hasPremiumEntitlement(event: RevenueCatEvent["event"]): boolean {
  return (
    event.entitlement_id === "premium" ||
    event.entitlement_ids?.includes("premium") === true
  );
}

function entitlementStatus(
  event: RevenueCatEvent["event"],
  currentPeriodEnd: string | null,
): BillingStatus | null {
  const type = event.type.toUpperCase();
  const hasFutureEnd =
    currentPeriodEnd !== null &&
    new Date(currentPeriodEnd).valueOf() > Date.now();
  const positiveStatus: BillingStatus =
    event.period_type?.toUpperCase() === "TRIAL" ? "trialing" : "active";

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "NON_RENEWING_PURCHASE":
    case "PRODUCT_CHANGE":
    case "SUBSCRIPTION_EXTENDED":
    case "REFUND_REVERSED":
      return positiveStatus;
    case "CANCELLATION":
      return hasFutureEnd ? positiveStatus : "revoked";
    case "BILLING_ISSUE":
      return "grace";
    case "SUBSCRIPTION_PAUSED":
      return hasFutureEnd ? positiveStatus : "revoked";
    case "EXPIRATION":
      return "revoked";
    default:
      return null;
  }
}

function candidateIds(event: RevenueCatEvent["event"]): string[] {
  return [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
  ].filter((value, index, values): value is string => {
    return value !== undefined && values.indexOf(value) === index;
  });
}

export function createRevenueCatWebhookService(input: {
  readonly repository: BillingRepository;
  readonly expectedEnvironment: "SANDBOX" | "PRODUCTION";
  readonly allowedAppIds: readonly string[];
}): BillingRevenueCatService {
  const allowedAppIds = new Set(input.allowedAppIds);

  return {
    async handleRevenueCatWebhook({ rawBody }) {
      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(rawBody) as unknown;
      } catch {
        throw new BillingApiError("invalid_json");
      }

      const parsed = revenueCatEventSchema.safeParse(parsedBody);
      if (!parsed.success) throw new BillingApiError("invalid_request");

      const event = parsed.data.event;
      if (
        event.environment !== input.expectedEnvironment ||
        !allowedAppIds.has(event.app_id)
      ) {
        throw new BillingApiError("invalid_request");
      }
      const candidates = candidateIds(event);
      let userId: string | null = null;
      for (const candidate of candidates) {
        const directUserId = userIdSchema.safeParse(candidate);
        if (directUserId.success) {
          userId = directUserId.data.toLowerCase();
          break;
        }
        const mappedUserId = await input.repository.findUserByCustomer({
          provider: "revenuecat",
          providerCustomerId: candidate,
        });
        if (mappedUserId !== null) {
          userId = mappedUserId;
          break;
        }
      }

      const currentPeriodEnd = periodEnd(event);
      const status = hasPremiumEntitlement(event)
        ? entitlementStatus(event, currentPeriodEnd)
        : null;
      const result = await input.repository.applyEvent({
        provider: "revenuecat",
        eventId: event.id,
        eventType: event.type,
        eventCreatedAt:
          timestampFromUnixMilliseconds(event.event_timestamp_ms) ??
          (() => {
            throw new BillingApiError("invalid_request");
          })(),
        payloadSha256: payloadSha256(rawBody),
        userId,
        entitlement: status === null ? null : "premium",
        providerCustomerId: event.app_user_id,
        providerSubscriptionId: event.transaction_id ?? null,
        status,
        currentPeriodEnd,
      });
      const validated = billingEventResponseSchema.safeParse(result);
      if (!validated.success) {
        throw new BillingInfrastructureError("billing_unavailable");
      }
      return validated.data;
    },
  };
}
