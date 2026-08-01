import { z } from "zod";

const httpOriginSchema = z
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
  .refine(
    (url) =>
      url.protocol === "https:" ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
    { message: "HTTPS est requis hors boucle locale." },
  )
  .transform((url) => url.origin);

const configurationSchema = z
  .strictObject({
    url: httpOriginSchema,
    publishableKey: z.string().trim().min(20).regex(/^\S+$/u),
    secretKey: z.string().trim().min(20).regex(/^\S+$/u),
  })
  .superRefine((configuration, context) => {
    if (
      configuration.publishableKey === configuration.secretKey ||
      configuration.publishableKey.startsWith("sb_secret_")
    ) {
      context.addIssue({
        code: "custom",
        message: "La clé publique et la clé secrète sont incohérentes.",
        path: ["publishableKey"],
      });
    }

    if (configuration.secretKey.startsWith("sb_publishable_")) {
      context.addIssue({
        code: "custom",
        message: "La clé serveur ne peut pas être une clé publiable.",
        path: ["secretKey"],
      });
    }
  });

type Environment = Readonly<Record<string, string | undefined>>;

export interface SupabaseAttemptSyncConfiguration {
  readonly url: string;
  readonly publishableKey: string;
  readonly secretKey: string;
}

export function readSupabaseAttemptSyncConfiguration(
  environment: Environment = process.env,
): SupabaseAttemptSyncConfiguration | null {
  if (environment.THAINAUTE_SYNC_MODE !== "supabase") return null;

  const result = configurationSchema.safeParse({
    url: environment.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: environment.SUPABASE_SECRET_KEY,
  });
  return result.success ? result.data : null;
}
