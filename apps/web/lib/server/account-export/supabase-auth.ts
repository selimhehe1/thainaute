import { createClient } from "@supabase/supabase-js";
import {
  accountExportIdentitySchema,
  type AccountExportIdentity,
} from "@thainaute/sync";
import { z } from "zod";

import {
  AccountExportApiError,
  AccountExportInfrastructureError,
} from "./errors";
import type { AccountExportIdentityVerifier } from "./ports";
import { createAccountExportSupabaseFetch } from "./supabase-fetch";

const providerNameSchema = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/u);
const providerSourceSchema = z.array(providerNameSchema).max(64);
const appMetadataSchema = z
  .object({ providers: z.unknown().optional() })
  .passthrough();
const supabaseUserSchema = z
  .object({
    id: z.uuid().transform((uuid) => uuid.toLowerCase()),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
    last_sign_in_at: z.string().nullable().optional(),
    email_confirmed_at: z.string().nullable().optional(),
    phone_confirmed_at: z.string().nullable().optional(),
    is_anonymous: z.boolean(),
    app_metadata: z.unknown().optional(),
  })
  .passthrough();

function providersFromAppMetadata(metadata: unknown): string[] {
  if (metadata === undefined) return [];
  const parsedMetadata = appMetadataSchema.safeParse(metadata);
  if (!parsedMetadata.success) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  const parsedProviders = providerSourceSchema.safeParse(
    parsedMetadata.data.providers ?? [],
  );
  if (!parsedProviders.success) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  return [...new Set(parsedProviders.data)].sort();
}

/**
 * Produit uniquement la whitelist publique du document. Les identités OAuth,
 * `user_metadata` et les autres clés de `app_metadata` sont volontairement
 * ignorées ; seuls les noms de `app_metadata.providers` sont extraits.
 */
export function accountExportIdentityFromSupabaseUser(
  value: unknown,
): AccountExportIdentity | null {
  const user = supabaseUserSchema.safeParse(value);
  if (!user.success) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  if (user.data.is_anonymous !== false) return null;

  const result = accountExportIdentitySchema.safeParse({
    id: user.data.id,
    email: user.data.email ?? null,
    phone: user.data.phone ?? null,
    providers: providersFromAppMetadata(user.data.app_metadata),
    createdAt: user.data.created_at,
    updatedAt: user.data.updated_at ?? null,
    lastSignInAt: user.data.last_sign_in_at ?? null,
    emailConfirmedAt: user.data.email_confirmed_at ?? null,
    phoneConfirmedAt: user.data.phone_confirmed_at ?? null,
  });
  if (!result.success) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  return result.data;
}

export function createSupabaseAccountExportIdentityVerifier(input: {
  readonly url: string;
  readonly publishableKey: string;
}): AccountExportIdentityVerifier {
  return {
    async verify({ accessToken, signal }) {
      const client = createClient(input.url, input.publishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: { fetch: createAccountExportSupabaseFetch(signal) },
      });

      try {
        const { data, error } = await client.auth.getUser(accessToken);
        if (error !== null) {
          const status = typeof error.status === "number" ? error.status : 0;
          if (status >= 400 && status < 500) {
            throw new AccountExportApiError("unauthorized");
          }
          throw new AccountExportInfrastructureError("auth_unavailable");
        }
        const identity = accountExportIdentityFromSupabaseUser(data.user);
        if (identity === null) {
          throw new AccountExportApiError("unauthorized");
        }
        return identity;
      } catch (error) {
        if (
          error instanceof AccountExportApiError ||
          error instanceof AccountExportInfrastructureError
        ) {
          throw error;
        }
        throw new AccountExportInfrastructureError("auth_unavailable");
      }
    },
  };
}
