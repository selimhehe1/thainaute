"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface PublicSupabaseConfiguration {
  readonly url: string;
  readonly publishableKey: string;
}

let browserClient: SupabaseClient | undefined;

function parsePublicSupabaseConfiguration(
  urlInput: string | undefined,
  keyInput: string | undefined,
): PublicSupabaseConfiguration | null {
  if (urlInput === undefined || keyInput === undefined) return null;

  try {
    const url = new URL(urlInput);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const key = keyInput.trim();
    if (
      (url.protocol !== "https:" && !(loopback && url.protocol === "http:")) ||
      url.username !== "" ||
      url.password !== "" ||
      key.length < 20 ||
      /\s/u.test(key) ||
      key.startsWith("sb_secret_")
    ) {
      return null;
    }

    return { url: url.origin, publishableKey: key };
  } catch {
    return null;
  }
}

export function readWebSupabaseConfiguration(): PublicSupabaseConfiguration | null {
  return parsePublicSupabaseConfiguration(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Client Auth navigateur. Toute autorisation reste revérifiée côté serveur. */
export function getWebSupabaseAuthClient(): SupabaseClient | null {
  const configuration = readWebSupabaseConfiguration();
  if (configuration === null) return null;

  browserClient ??= createClient(
    configuration.url,
    configuration.publishableKey,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    },
  );
  return browserClient;
}
