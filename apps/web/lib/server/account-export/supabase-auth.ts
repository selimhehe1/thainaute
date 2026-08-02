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
import {
  SupabaseAuthenticationError,
  validatePermanentSupabaseUser,
  verifySupabasePermanentUser,
  type SupabaseUserAuthClient,
  type VerifiedPermanentSupabaseUser,
} from "../supabase-auth/verified-user";

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
    is_anonymous: z.boolean().optional(),
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
  return [...new Set(parsedProviders.data)].sort((left, right) => {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  });
}

function nullableAuthContact(value: string | null | undefined): string | null {
  return value === undefined || value === null || value === "" ? null : value;
}

/**
 * Produit uniquement la whitelist publique du document. Les identités OAuth,
 * `user_metadata` et les autres clés de `app_metadata` sont volontairement
 * ignorées ; seuls les noms de `app_metadata.providers` sont extraits.
 */
export function accountExportIdentityFromSupabaseUser(
  value: unknown,
  verifiedClaimsValue: unknown,
): AccountExportIdentity | null {
  try {
    return accountExportIdentityFromVerifiedSupabaseUser(
      validatePermanentSupabaseUser({
        claims: verifiedClaimsValue,
        user: value,
      }),
    );
  } catch (error) {
    if (
      error instanceof SupabaseAuthenticationError &&
      error.kind === "unauthorized"
    ) {
      return null;
    }
    if (error instanceof AccountExportInfrastructureError) throw error;
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
}

function accountExportIdentityFromVerifiedSupabaseUser(
  verified: VerifiedPermanentSupabaseUser,
): AccountExportIdentity {
  const user = supabaseUserSchema.safeParse(verified.user);
  if (!user.success || user.data.id !== verified.userId) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }

  const result = accountExportIdentitySchema.safeParse({
    id: user.data.id,
    email: nullableAuthContact(user.data.email),
    phone: nullableAuthContact(user.data.phone),
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

/**
 * Croise les claims vérifiés avec la relecture Auth du même jeton. Les limites
 * et pannes temporaires restent des 503 ; seules les erreurs de credentials
 * documentées deviennent un 401 invitant réellement à se reconnecter.
 */
export async function verifySupabaseAccountExportIdentity(input: {
  readonly auth: SupabaseUserAuthClient;
  readonly accessToken: string;
}): Promise<AccountExportIdentity> {
  try {
    return accountExportIdentityFromVerifiedSupabaseUser(
      await verifySupabasePermanentUser(input),
    );
  } catch (error) {
    if (error instanceof SupabaseAuthenticationError) {
      if (error.kind === "unauthorized") {
        throw new AccountExportApiError("unauthorized");
      }
      throw new AccountExportInfrastructureError("auth_unavailable");
    }
    if (
      error instanceof AccountExportApiError ||
      error instanceof AccountExportInfrastructureError
    ) {
      throw error;
    }
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
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

      return verifySupabaseAccountExportIdentity({
        auth: client.auth,
        accessToken,
      });
    },
  };
}
