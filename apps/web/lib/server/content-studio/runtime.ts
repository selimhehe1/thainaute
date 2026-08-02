import { Buffer } from "node:buffer";

import { z } from "zod";

function isSupabasePublishableKey(value: string): boolean {
  if (value.startsWith("sb_publishable_")) return true;
  if (value.startsWith("sb_secret_")) return false;

  const segments = value.split(".");
  if (segments.length !== 3 || segments[1] === undefined) return false;
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(segments[1], "base64url").toString("utf8"),
    );
    return (
      typeof payload === "object" &&
      payload !== null &&
      "role" in payload &&
      payload.role === "anon"
    );
  } catch {
    return false;
  }
}

const supabaseOriginSchema = z
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
  )
  .transform((url) => url.origin);

const fixtureConfigurationSchema = z.strictObject({
  mode: z.literal("fixture"),
  url: supabaseOriginSchema,
  publishableKey: z
    .string()
    .trim()
    .min(20)
    .regex(/^\S+$/u)
    .refine(isSupabasePublishableKey),
});

type Environment = Readonly<Record<string, string | undefined>>;

export interface ContentStudioConfiguration {
  readonly mode: "fixture";
  readonly url: string;
  readonly publishableKey: string;
}

/**
 * Le Studio est opt-in. Toute valeur inconnue ou configuration incomplète le
 * rend indistinguable d'une route absente.
 */
export function readContentStudioConfiguration(
  environment: Environment = process.env,
): ContentStudioConfiguration | null {
  if (environment.THAINAUTE_STUDIO_MODE !== "fixture") return null;

  const parsed = fixtureConfigurationSchema.safeParse({
    mode: environment.THAINAUTE_STUDIO_MODE,
    url: environment.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return parsed.success ? parsed.data : null;
}
