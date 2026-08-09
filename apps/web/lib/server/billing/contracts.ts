import { z } from "zod";

const stripeCustomerIdSchema = z
  .string()
  .regex(/^cus_[A-Za-z0-9]+$/u)
  .nullable();

const revenuecatAppUserIdSchema = z.string().min(1).max(128).nullable();

const currentPeriodEndSchema = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value).toISOString())
  .nullable();

export const billingCustomerResponseSchema = z.strictObject({
  stripeCustomerId: stripeCustomerIdSchema,
  revenuecatAppUserId: revenuecatAppUserIdSchema,
});

export const billingStatusResponseSchema = z.strictObject({
  entitlement: z.literal("premium"),
  status: z.enum(["none", "active", "trialing", "grace", "expired", "revoked"]),
  active: z.boolean(),
  provider: z.enum(["stripe", "revenuecat", "manual"]).nullable(),
  currentPeriodEnd: currentPeriodEndSchema,
});

export const billingEventResponseSchema = z.strictObject({
  status: z.enum(["applied", "ignored", "duplicate"]),
  userId: z.uuid().optional(),
  entitlement: z.literal("premium").optional(),
  active: z.boolean().optional(),
});

export const billingCheckoutResponseSchema = z.strictObject({
  sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/u),
  url: z.url(),
});

export type BillingCustomer = z.infer<typeof billingCustomerResponseSchema>;
export type BillingStatus = z.infer<typeof billingStatusResponseSchema>;
export type BillingEventResponse = z.infer<typeof billingEventResponseSchema>;
export type BillingCheckoutResponse = z.infer<
  typeof billingCheckoutResponseSchema
>;
