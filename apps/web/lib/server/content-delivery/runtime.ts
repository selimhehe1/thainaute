import { z } from "zod";

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

const configurationSchema = z
  .strictObject({
    url: supabaseOriginSchema,
    secretKey: z.string().trim().min(20).regex(/^\S+$/u),
  })
  .refine(({ secretKey }) => !secretKey.startsWith("sb_publishable_"), {
    path: ["secretKey"],
  });

type Environment = Readonly<Record<string, string | undefined>>;

export type PublicContentMode = "disabled" | "supabase";

export interface SupabaseContentConfiguration {
  readonly url: string;
  readonly secretKey: string;
}

export interface PublicContentConfiguration extends SupabaseContentConfiguration {
  readonly releaseId: string;
}

export function readActiveContentReleaseId(
  environment: Environment = process.env,
): string | null {
  const result = z
    .uuid()
    .safeParse(environment.THAINAUTE_PUBLIC_CONTENT_RELEASE_ID?.trim());
  return result.success ? result.data.toLowerCase() : null;
}

export function readPublicContentMode(
  environment: Environment = process.env,
): PublicContentMode | null {
  const value = environment.THAINAUTE_PUBLIC_CONTENT_MODE?.trim();
  if (value === undefined || value === "" || value === "disabled") {
    return "disabled";
  }
  return value === "supabase" ? "supabase" : null;
}

export function readSupabaseContentConfiguration(
  environment: Environment = process.env,
): SupabaseContentConfiguration | null {
  const result = configurationSchema.safeParse({
    url: environment.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: environment.SUPABASE_SECRET_KEY,
  });
  return result.success ? result.data : null;
}

/**
 * Frontière d'activation explicite. La présence d'une clé serveur utilisée par
 * une autre capacité ne doit jamais publier le contenu par effet de bord.
 */
export function readPublicContentConfiguration(
  environment: Environment = process.env,
): PublicContentConfiguration | null {
  if (readPublicContentMode(environment) !== "supabase") return null;
  const supabase = readSupabaseContentConfiguration(environment);
  const releaseId = readActiveContentReleaseId(environment);
  if (supabase === null || releaseId === null) return null;
  return { ...supabase, releaseId };
}
