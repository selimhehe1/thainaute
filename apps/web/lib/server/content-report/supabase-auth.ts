import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../attempt-sync/errors";
import type { AccessTokenVerifier } from "../attempt-sync/ports";
import { createSupabaseAccessTokenVerifier } from "../attempt-sync/supabase-auth";
import {
  ContentReportApiError,
  ContentReportInfrastructureError,
} from "./errors";
import type { ContentReportAccessTokenVerifier } from "./ports";

export function adaptContentReportAccessTokenVerifier(
  verifier: AccessTokenVerifier,
): ContentReportAccessTokenVerifier {
  return {
    async verify(accessToken) {
      try {
        return await verifier.verify(accessToken);
      } catch (error) {
        if (error instanceof AttemptApiError && error.code === "unauthorized") {
          throw new ContentReportApiError("unauthorized");
        }
        if (
          error instanceof AttemptInfrastructureError &&
          error.code === "auth_unavailable"
        ) {
          throw new ContentReportInfrastructureError("auth_unavailable");
        }
        throw new ContentReportInfrastructureError("auth_unavailable");
      }
    },
  };
}

/**
 * Réutilise la vérification croisée claims/utilisateur courant et son refus des
 * comptes anonymes. Aucune clé secrète Supabase n'entre dans ce client Auth.
 */
export function createSupabaseContentReportAccessTokenVerifier(input: {
  readonly url: string;
  readonly publishableKey: string;
}): ContentReportAccessTokenVerifier {
  return adaptContentReportAccessTokenVerifier(
    createSupabaseAccessTokenVerifier(input),
  );
}
