import { z } from "zod";

const verifiedJwtClaimsSchema = z
  .object({
    sub: z.uuid().transform((uuid) => uuid.toLowerCase()),
    is_anonymous: z.boolean().optional(),
  })
  .passthrough();

const liveUserSchema = z
  .object({
    id: z.uuid().transform((uuid) => uuid.toLowerCase()),
    is_anonymous: z.boolean().optional(),
    email_confirmed_at: z.string().min(1).nullable().optional(),
    phone_confirmed_at: z.string().min(1).nullable().optional(),
  })
  .passthrough();

export interface SupabaseUserAuthClient {
  readonly getClaims: (accessToken: string) => Promise<{
    readonly data: { readonly claims: unknown } | null;
    readonly error: { readonly status?: number | undefined } | null;
  }>;
  readonly getUser: (accessToken: string) => Promise<{
    readonly data: { readonly user: unknown } | null;
    readonly error: { readonly status?: number | undefined } | null;
  }>;
}

export type SupabaseAuthenticationFailure = "unauthorized" | "auth_unavailable";

/**
 * Erreur interne volontairement opaque : aucun statut, message ou payload
 * provenant d'Auth ne doit franchir la frontière HTTP de l'application.
 */
export class SupabaseAuthenticationError extends Error {
  public readonly kind: SupabaseAuthenticationFailure;

  public constructor(kind: SupabaseAuthenticationFailure) {
    super(kind);
    this.name = "SupabaseAuthenticationError";
    this.kind = kind;
  }
}

export interface VerifiedPermanentSupabaseUser {
  readonly userId: string;
  readonly claims: unknown;
  readonly user: unknown;
}

// Les limites et pannes temporaires ne doivent pas provoquer une fausse
// déconnexion. Seuls les rejets documentés de credentials deviennent un 401.
const CREDENTIAL_REJECTION_STATUSES = new Set([400, 401, 403, 404, 422]);

function hasConfirmedPermanentIdentity(user: {
  readonly email_confirmed_at?: string | null | undefined;
  readonly phone_confirmed_at?: string | null | undefined;
}): boolean {
  return (
    (user.email_confirmed_at !== undefined &&
      user.email_confirmed_at !== null) ||
    (user.phone_confirmed_at !== undefined && user.phone_confirmed_at !== null)
  );
}

/**
 * Croise une identité JWT déjà vérifiée avec la relecture Auth courante.
 *
 * Les anciennes images Auth locales peuvent omettre `is_anonymous`. Dans ce
 * seul cas, une identité email/téléphone confirmée relue par Auth constitue la
 * preuve de conversion en compte permanent déjà retenue par ADR-0014.
 */
export function validatePermanentSupabaseUser(input: {
  readonly claims: unknown;
  readonly user: unknown;
}): VerifiedPermanentSupabaseUser {
  if (input.user === null) {
    throw new SupabaseAuthenticationError("unauthorized");
  }

  const claims = verifiedJwtClaimsSchema.safeParse(input.claims);
  const user = liveUserSchema.safeParse(input.user);
  if (!claims.success || !user.success) {
    throw new SupabaseAuthenticationError("auth_unavailable");
  }
  if (claims.data.sub !== user.data.id) {
    throw new SupabaseAuthenticationError("auth_unavailable");
  }

  const claimMarker = claims.data.is_anonymous;
  const userMarker = user.data.is_anonymous;
  if (
    claimMarker !== undefined &&
    userMarker !== undefined &&
    claimMarker !== userMarker
  ) {
    throw new SupabaseAuthenticationError("auth_unavailable");
  }
  if (claimMarker === true || userMarker === true) {
    throw new SupabaseAuthenticationError("unauthorized");
  }
  if (
    claimMarker !== false &&
    userMarker !== false &&
    !hasConfirmedPermanentIdentity(user.data)
  ) {
    throw new SupabaseAuthenticationError("unauthorized");
  }

  return {
    userId: claims.data.sub,
    claims: input.claims,
    user: input.user,
  };
}

/**
 * Vérifie le même Bearer par les deux chemins Supabase : signature/expiration
 * (`getClaims`) puis existence et état courants de l'utilisateur (`getUser`).
 */
export async function verifySupabasePermanentUser(input: {
  readonly auth: SupabaseUserAuthClient;
  readonly accessToken: string;
}): Promise<VerifiedPermanentSupabaseUser> {
  let claimsResult: Awaited<ReturnType<SupabaseUserAuthClient["getClaims"]>>;
  let userResult: Awaited<ReturnType<SupabaseUserAuthClient["getUser"]>>;
  try {
    [claimsResult, userResult] = await Promise.all([
      input.auth.getClaims(input.accessToken),
      input.auth.getUser(input.accessToken),
    ]);
  } catch {
    throw new SupabaseAuthenticationError("auth_unavailable");
  }

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
      throw new SupabaseAuthenticationError("unauthorized");
    }
    throw new SupabaseAuthenticationError("auth_unavailable");
  }
  if (claimsResult.data === null || userResult.data === null) {
    throw new SupabaseAuthenticationError("auth_unavailable");
  }

  return validatePermanentSupabaseUser({
    claims: claimsResult.data.claims,
    user: userResult.data.user,
  });
}
