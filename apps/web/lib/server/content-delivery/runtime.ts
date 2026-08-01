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

export interface SupabaseContentConfiguration {
  readonly url: string;
  readonly secretKey: string;
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
