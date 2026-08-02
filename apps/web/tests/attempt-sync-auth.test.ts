import { describe, expect, it, vi } from "vitest";

import {
  AttemptApiError,
  AttemptInfrastructureError,
} from "../lib/server/attempt-sync/errors";
import { verifySupabaseAccessToken } from "../lib/server/attempt-sync/supabase-auth";
import {
  validatePermanentSupabaseUser,
  verifySupabasePermanentUser,
} from "../lib/server/supabase-auth/verified-user";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const verifiedClaims = {
  sub: USER_ID.toUpperCase(),
  is_anonymous: false,
  role: "authenticated",
  session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};

const liveUser = {
  id: USER_ID.toUpperCase(),
  is_anonymous: false,
  email_confirmed_at: "2026-08-01T09:01:00+00:00",
  phone_confirmed_at: null,
};

function createAuth(input?: {
  readonly claimsData?: { readonly claims: unknown } | null;
  readonly claimsError?: { readonly status?: number } | null;
  readonly userData?: { readonly user: unknown } | null;
  readonly userError?: { readonly status?: number } | null;
}) {
  return {
    getClaims: vi.fn().mockResolvedValue({
      data:
        input?.claimsData === undefined
          ? { claims: verifiedClaims }
          : input.claimsData,
      error: input?.claimsError ?? null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: input?.userData === undefined ? { user: liveUser } : input.userData,
      error: input?.userError ?? null,
    }),
  };
}

describe("identité Supabase permanente vérifiée", () => {
  it("croise les claims et l'utilisateur courant avec exactement le même Bearer", async () => {
    const auth = createAuth();

    await expect(
      verifySupabasePermanentUser({ auth, accessToken: "verified-token" }),
    ).resolves.toEqual({
      userId: USER_ID,
      claims: verifiedClaims,
      user: liveUser,
    });
    expect(auth.getClaims).toHaveBeenCalledWith("verified-token");
    expect(auth.getUser).toHaveBeenCalledWith("verified-token");
  });

  it("refuse un ancien JWT encore vérifiable lorsque l'utilisateur a été supprimé", async () => {
    const auth = createAuth({ userData: { user: null } });

    await expect(
      verifySupabasePermanentUser({ auth, accessToken: "deleted-user-token" }),
    ).rejects.toMatchObject({ kind: "unauthorized" });
    expect(auth.getClaims).toHaveBeenCalledOnce();
    expect(auth.getUser).toHaveBeenCalledOnce();
  });

  it.each([400, 401, 403, 404, 422])(
    "classe le rejet Auth %i comme invalidité du Bearer",
    async (status) => {
      await expect(
        verifySupabasePermanentUser({
          auth: createAuth({ userError: { status } }),
          accessToken: "rejected-token",
        }),
      ).rejects.toMatchObject({ kind: "unauthorized" });
    },
  );

  it.each([408, 429, 500, 503])(
    "classe la panne Auth %i comme indisponibilité retryable",
    async (status) => {
      await expect(
        verifySupabasePermanentUser({
          auth: createAuth({ userError: { status } }),
          accessToken: "temporarily-unavailable-token",
        }),
      ).rejects.toMatchObject({ kind: "auth_unavailable" });
    },
  );

  it("refuse un utilisateur anonyme sur chacun des deux canaux", () => {
    expect(() =>
      validatePermanentSupabaseUser({
        claims: { ...verifiedClaims, is_anonymous: true },
        user: { ...liveUser, is_anonymous: true },
      }),
    ).toThrow(
      expect.objectContaining({
        kind: "unauthorized",
      }),
    );
  });

  it("ferme une divergence de sujet ou de marqueur d'anonymat", () => {
    expect(() =>
      validatePermanentSupabaseUser({
        claims: verifiedClaims,
        user: {
          ...liveUser,
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        },
      }),
    ).toThrow(
      expect.objectContaining({
        kind: "auth_unavailable",
      }),
    );
    expect(() =>
      validatePermanentSupabaseUser({
        claims: { ...verifiedClaims, is_anonymous: true },
        user: liveUser,
      }),
    ).toThrow(
      expect.objectContaining({
        kind: "auth_unavailable",
      }),
    );
  });

  it("préserve la compatibilité Auth locale seulement avec une preuve permanente relue", () => {
    const claimsWithoutMarker = { ...verifiedClaims } as Record<
      string,
      unknown
    >;
    const userWithoutMarker = { ...liveUser } as Record<string, unknown>;
    delete claimsWithoutMarker.is_anonymous;
    delete userWithoutMarker.is_anonymous;

    expect(
      validatePermanentSupabaseUser({
        claims: claimsWithoutMarker,
        user: userWithoutMarker,
      }).userId,
    ).toBe(USER_ID);

    userWithoutMarker.email_confirmed_at = null;
    expect(() =>
      validatePermanentSupabaseUser({
        claims: claimsWithoutMarker,
        user: userWithoutMarker,
      }),
    ).toThrow(
      expect.objectContaining({
        kind: "unauthorized",
      }),
    );
  });

  it("ferme les succès mal formés et masque les exceptions de transport", async () => {
    await expect(
      verifySupabasePermanentUser({
        auth: createAuth({ claimsData: null }),
        accessToken: "missing-claims-token",
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        kind: "auth_unavailable",
        message: "auth_unavailable",
      }),
    );

    const auth = createAuth();
    auth.getUser.mockRejectedValueOnce(
      new Error("secret upstream transport detail"),
    );
    const failure = await verifySupabasePermanentUser({
      auth,
      accessToken: "transport-failure-token",
    }).catch((error: unknown) => error);
    expect(failure).toEqual(
      expect.objectContaining({
        kind: "auth_unavailable",
        message: "auth_unavailable",
      }),
    );
    expect(String(failure)).not.toContain("secret upstream transport detail");
  });
});

describe("adaptateur Auth des tentatives, appareils et snapshots", () => {
  it("convertit le rejet en erreur API 401", async () => {
    const failure = await verifySupabaseAccessToken({
      auth: createAuth({ userData: { user: null } }),
      accessToken: "deleted-user-token",
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AttemptApiError);
    expect(failure).toMatchObject({ code: "unauthorized", status: 401 });
  });

  it("convertit une panne Auth en erreur d'infrastructure 503", async () => {
    const failure = await verifySupabaseAccessToken({
      auth: createAuth({ userError: { status: 503 } }),
      accessToken: "unavailable-token",
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AttemptInfrastructureError);
    expect(failure).toMatchObject({ code: "auth_unavailable" });
  });
});
