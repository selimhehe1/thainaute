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
const verifiedJwtClaimsSchema = z
  .object({
    sub: z.uuid().transform((uuid) => uuid.toLowerCase()),
    is_anonymous: z.boolean().optional(),
  })
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
    // Certaines versions locales de Supabase Auth omettent encore ce champ
    // dans `/user`. Le claim JWT vérifié ci-dessus reste alors autoritaire.
    is_anonymous: z.boolean().optional(),
    app_metadata: z.unknown().optional(),
  })
  .passthrough();

interface AccountExportSupabaseAuthClient {
  readonly getClaims: (accessToken: string) => Promise<{
    readonly data: { readonly claims: unknown } | null;
    readonly error: { readonly status?: number | undefined } | null;
  }>;
  readonly getUser: (accessToken: string) => Promise<{
    readonly data: { readonly user: unknown };
    readonly error: { readonly status?: number | undefined } | null;
  }>;
}

const CREDENTIAL_REJECTION_STATUSES = new Set([400, 401, 403, 404, 422]);

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

function hasPermanentAccountEvidence(input: {
  readonly claimMarker: boolean | undefined;
  readonly userMarker: boolean | undefined;
  readonly emailConfirmedAt: string | null | undefined;
  readonly phoneConfirmedAt: string | null | undefined;
}): boolean {
  if (
    input.claimMarker !== undefined &&
    input.userMarker !== undefined &&
    input.claimMarker !== input.userMarker
  ) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  if (input.claimMarker === true || input.userMarker === true) return false;
  if (input.claimMarker === false || input.userMarker === false) return true;

  // Les anciennes images Auth locales peuvent omettre les deux marqueurs.
  // Une adresse ou un telephone confirmes par Auth constituent alors une
  // preuve serveur de conversion en compte permanent.
  return (
    (input.emailConfirmedAt !== null && input.emailConfirmedAt !== undefined) ||
    (input.phoneConfirmedAt !== null && input.phoneConfirmedAt !== undefined)
  );
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
  const user = supabaseUserSchema.safeParse(value);
  const verifiedClaims = verifiedJwtClaimsSchema.safeParse(verifiedClaimsValue);
  if (!user.success || !verifiedClaims.success) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  if (user.data.id !== verifiedClaims.data.sub) {
    throw new AccountExportInfrastructureError("auth_unavailable");
  }
  if (
    !hasPermanentAccountEvidence({
      claimMarker: verifiedClaims.data.is_anonymous,
      userMarker: user.data.is_anonymous,
      emailConfirmedAt: user.data.email_confirmed_at,
      phoneConfirmedAt: user.data.phone_confirmed_at,
    })
  ) {
    return null;
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
  readonly auth: AccountExportSupabaseAuthClient;
  readonly accessToken: string;
}): Promise<AccountExportIdentity> {
  try {
    const [claimsResult, userResult] = await Promise.all([
      input.auth.getClaims(input.accessToken),
      input.auth.getUser(input.accessToken),
    ]);
    const authErrors = [claimsResult.error, userResult.error].filter(
      (error) => error !== null,
    );
    if (authErrors.length > 0) {
      if (
        authErrors.some(
          ({ status }) =>
            status !== undefined && CREDENTIAL_REJECTION_STATUSES.has(status),
        )
      ) {
        throw new AccountExportApiError("unauthorized");
      }
      throw new AccountExportInfrastructureError("auth_unavailable");
    }
    if (claimsResult.data === null) {
      throw new AccountExportInfrastructureError("auth_unavailable");
    }
    const identity = accountExportIdentityFromSupabaseUser(
      userResult.data.user,
      claimsResult.data.claims,
    );
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
