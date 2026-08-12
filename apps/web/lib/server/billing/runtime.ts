import { z } from "zod";

export const BILLING_API_VERSION = "2026-07-29.dahlia" as const;

export type BillingMode = "disabled" | "stripe_test" | "stripe_live";

type Environment = Readonly<Record<string, string | undefined>>;

const originSchema = z
  .url()
  .transform((value) => new URL(value))
  .refine(
    (url) =>
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username === "" &&
      url.password === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === "",
  )
  .transform((url) => url.origin);

const stripeRestrictedKeySchema = z
  .string()
  .trim()
  .regex(/^rk_(test|live)_[A-Za-z0-9]+$/u);

const configurationSchema = z
  .strictObject({
    mode: z.enum(["stripe_test", "stripe_live"]),
    publicOrigin: originSchema,
    stripeRestrictedKey: stripeRestrictedKeySchema,
    stripeWebhookSecret: z
      .string()
      .trim()
      .regex(/^whsec_[A-Za-z0-9]+$/u),
    stripePremiumPriceId: z
      .string()
      .trim()
      .regex(/^price_[A-Za-z0-9]+$/u),
    liveConfirmation: z.string().optional(),
  })
  .superRefine((configuration, context) => {
    const expectedPrefix =
      configuration.mode === "stripe_live" ? "rk_live_" : "rk_test_";
    if (!configuration.stripeRestrictedKey.startsWith(expectedPrefix)) {
      context.addIssue({
        code: "custom",
        message: "La clé Stripe ne correspond pas au mode de facturation.",
        path: ["stripeRestrictedKey"],
      });
    }
    if (configuration.mode === "stripe_live") {
      if (!configuration.publicOrigin.startsWith("https://")) {
        context.addIssue({
          code: "custom",
          message: "Stripe live exige une origine HTTPS.",
          path: ["publicOrigin"],
        });
      }
      if (configuration.liveConfirmation !== "ENABLE_STRIPE_LIVE") {
        context.addIssue({
          code: "custom",
          message: "La confirmation explicite Stripe live manque.",
          path: ["liveConfirmation"],
        });
      }
    }
  });

export interface BillingConfiguration {
  readonly mode: Exclude<BillingMode, "disabled">;
  readonly publicOrigin: string;
  readonly stripeRestrictedKey: string;
  readonly stripeWebhookSecret: string;
  readonly stripePremiumPriceId: string;
}

export interface RevenueCatWebhookConfiguration {
  readonly authorization: string;
  readonly signingSecret: string;
  readonly expectedEnvironment: "SANDBOX" | "PRODUCTION";
  readonly allowedAppIds: readonly string[];
}

export function readBillingMode(
  environment: Environment = process.env,
): BillingMode | null {
  const value = environment.THAINAUTE_BILLING_MODE?.trim() ?? "disabled";
  if (
    value === "disabled" ||
    value === "stripe_test" ||
    value === "stripe_live"
  ) {
    return value;
  }
  return null;
}

export function readBillingConfiguration(
  environment: Environment = process.env,
): BillingConfiguration | null {
  const mode = readBillingMode(environment);
  if (mode === null || mode === "disabled") return null;

  const result = configurationSchema.safeParse({
    mode,
    publicOrigin:
      environment.THAINAUTE_PUBLIC_URL?.trim() || "http://localhost:3000/",
    stripeRestrictedKey: environment.STRIPE_RESTRICTED_KEY,
    stripeWebhookSecret: environment.STRIPE_WEBHOOK_SECRET,
    stripePremiumPriceId: environment.STRIPE_PREMIUM_PRICE_ID,
    liveConfirmation: environment.STRIPE_LIVE_CONFIRMATION,
  });
  return result.success ? result.data : null;
}

export function readRevenueCatWebhookAuthorization(
  environment: Environment = process.env,
): string | null {
  const mode = readBillingMode(environment);
  if (mode === null || mode === "disabled") return null;
  const value = environment.REVENUECAT_WEBHOOK_AUTHORIZATION?.trim() ?? "";
  const result = z.string().min(16).max(5_000).safeParse(value);
  return result.success ? result.data : null;
}

export function readRevenueCatWebhookConfiguration(
  environment: Environment = process.env,
): RevenueCatWebhookConfiguration | null {
  const mode = readBillingMode(environment);
  const authorization = readRevenueCatWebhookAuthorization(environment);
  if (mode === null || mode === "disabled" || authorization === null) {
    return null;
  }

  const signingSecret = z
    .string()
    .trim()
    .min(32)
    .max(5_000)
    .safeParse(environment.REVENUECAT_WEBHOOK_SIGNING_SECRET);
  const allowedAppIds = z
    .array(z.string().trim().min(1).max(255))
    .min(1)
    .max(16)
    .superRefine((values, context) => {
      if (new Set(values).size !== values.length) {
        context.addIssue({
          code: "custom",
          message: "Les identifiants RevenueCat doivent être uniques.",
        });
      }
    })
    .safeParse(
      (environment.REVENUECAT_ALLOWED_APP_IDS ?? "")
        .split(",")
        .map((value) => value.trim()),
    );

  if (!signingSecret.success || !allowedAppIds.success) return null;
  return {
    authorization,
    signingSecret: signingSecret.data,
    expectedEnvironment: mode === "stripe_live" ? "PRODUCTION" : "SANDBOX",
    allowedAppIds: allowedAppIds.data,
  };
}
