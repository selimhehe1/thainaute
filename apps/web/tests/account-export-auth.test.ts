import { describe, expect, it, vi } from "vitest";

import { AccountExportInfrastructureError } from "../lib/server/account-export/errors";
import {
  accountExportIdentityFromSupabaseUser,
  verifySupabaseAccountExportIdentity,
} from "../lib/server/account-export/supabase-auth";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const supabaseUser = {
  id: USER_ID.toUpperCase(),
  email: "selim@example.test",
  phone: "+33600000000",
  created_at: "2026-08-01T09:00:00+00:00",
  updated_at: "2026-08-01T09:05:00+00:00",
  last_sign_in_at: "2026-08-02T08:00:00+00:00",
  email_confirmed_at: "2026-08-01T09:01:00+00:00",
  phone_confirmed_at: null,
  is_anonymous: false,
  app_metadata: {
    provider: "email",
    providers: ["google", "email", "google"],
    internalRole: "never-exported",
  },
  user_metadata: { freeText: "never-exported" },
  identities: [{ identity_data: { email: "never-exported@example.test" } }],
};
const verifiedClaims = {
  sub: USER_ID.toUpperCase(),
  is_anonymous: false,
  role: "authenticated",
};

describe("identité Auth de l'export de compte", () => {
  it("whiteliste les champs et canonise uniquement les noms de providers", () => {
    expect(
      accountExportIdentityFromSupabaseUser(supabaseUser, verifiedClaims),
    ).toEqual({
      id: USER_ID,
      email: "selim@example.test",
      phone: "+33600000000",
      providers: ["email", "google"],
      createdAt: "2026-08-01T09:00:00.000Z",
      updatedAt: "2026-08-01T09:05:00.000Z",
      lastSignInAt: "2026-08-02T08:00:00.000Z",
      emailConfirmedAt: "2026-08-01T09:01:00.000Z",
      phoneConfirmedAt: null,
    });
    expect(
      JSON.stringify(
        accountExportIdentityFromSupabaseUser(supabaseUser, verifiedClaims),
      ),
    ).not.toContain("never-exported");
  });

  it("refuse les comptes anonymes", () => {
    expect(
      accountExportIdentityFromSupabaseUser(
        {
          ...supabaseUser,
          is_anonymous: true,
        },
        {
          ...verifiedClaims,
          is_anonymous: true,
        },
      ),
    ).toBeNull();
  });

  it("accepte l'objet user local sans marqueur si le claim vérifié est permanent", () => {
    const userWithoutAnonymousMarker: Record<string, unknown> = {
      ...supabaseUser,
    };
    delete userWithoutAnonymousMarker.is_anonymous;

    expect(
      accountExportIdentityFromSupabaseUser(
        userWithoutAnonymousMarker,
        verifiedClaims,
      ),
    ).toMatchObject({ id: USER_ID });
  });

  it("ferme une réponse sans claim d'anonymat vérifié", () => {
    const claimsWithoutAnonymousMarker: Record<string, unknown> = {
      ...verifiedClaims,
    };
    delete claimsWithoutAnonymousMarker.is_anonymous;

    expect(
      accountExportIdentityFromSupabaseUser(
        supabaseUser,
        claimsWithoutAnonymousMarker,
      ),
    ).toMatchObject({ id: USER_ID });
  });

  it("accepte le compte email local historique sans marqueurs d'anonymat", () => {
    const legacyUser: Record<string, unknown> = { ...supabaseUser };
    const legacyClaims: Record<string, unknown> = { ...verifiedClaims };
    delete legacyUser.is_anonymous;
    delete legacyClaims.is_anonymous;

    expect(
      accountExportIdentityFromSupabaseUser(legacyUser, legacyClaims),
    ).toMatchObject({ id: USER_ID });

    legacyUser.email_confirmed_at = null;
    legacyUser.phone_confirmed_at = null;
    expect(
      accountExportIdentityFromSupabaseUser(legacyUser, legacyClaims),
    ).toBeNull();
  });

  it("ferme une divergence entre le claim vérifié et l'objet user", () => {
    expect(() =>
      accountExportIdentityFromSupabaseUser(supabaseUser, {
        ...verifiedClaims,
        is_anonymous: true,
      }),
    ).toThrow(AccountExportInfrastructureError);
    expect(() =>
      accountExportIdentityFromSupabaseUser(supabaseUser, {
        ...verifiedClaims,
        sub: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
    ).toThrow(AccountExportInfrastructureError);
  });

  it("ferme un provider non conforme au lieu d'exporter la metadata brute", () => {
    expect(() =>
      accountExportIdentityFromSupabaseUser(
        {
          ...supabaseUser,
          app_metadata: { providers: ["email", "Provider Injecté"] },
        },
        verifiedClaims,
      ),
    ).toThrow(AccountExportInfrastructureError);
  });

  it("classe une réponse Auth mal formée comme indisponible, pas comme anonyme", () => {
    expect(() =>
      accountExportIdentityFromSupabaseUser(
        {
          ...supabaseUser,
          created_at: null,
        },
        verifiedClaims,
      ),
    ).toThrow(AccountExportInfrastructureError);
  });
});

describe("orchestration Auth vérifiée de l'export", () => {
  function createAuth(input?: {
    readonly claimsData?: { readonly claims: unknown } | null;
    readonly claimsError?: { readonly status?: number } | null;
    readonly userData?: { readonly user: unknown };
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
        data: input?.userData ?? { user: supabaseUser },
        error: input?.userError ?? null,
      }),
    };
  }

  it("vérifie les claims et l'utilisateur avec exactement le même jeton", async () => {
    const auth = createAuth();

    await expect(
      verifySupabaseAccountExportIdentity({
        auth,
        accessToken: "verified-access-token",
      }),
    ).resolves.toMatchObject({ id: USER_ID });
    expect(auth.getClaims).toHaveBeenCalledWith("verified-access-token");
    expect(auth.getUser).toHaveBeenCalledWith("verified-access-token");
  });

  it.each([400, 401, 403, 404, 422])(
    "classe le rejet de credentials %i comme unauthorized",
    async (status) => {
      await expect(
        verifySupabaseAccountExportIdentity({
          auth: createAuth({ claimsError: { status } }),
          accessToken: "rejected-access-token",
        }),
      ).rejects.toMatchObject({
        code: "unauthorized",
        status: 401,
      });
    },
  );

  it.each([408, 429, 500, 503])(
    "conserve l'erreur Auth retryable %i comme indisponibilité",
    async (status) => {
      await expect(
        verifySupabaseAccountExportIdentity({
          auth: createAuth({ userError: { status } }),
          accessToken: "temporarily-unavailable-token",
        }),
      ).rejects.toMatchObject({
        code: "auth_unavailable",
      });
    },
  );

  it("ferme les données claims nulles et les exceptions transport", async () => {
    await expect(
      verifySupabaseAccountExportIdentity({
        auth: createAuth({ claimsData: null }),
        accessToken: "missing-claims-token",
      }),
    ).rejects.toMatchObject({
      code: "auth_unavailable",
    });

    const auth = createAuth();
    auth.getClaims.mockRejectedValueOnce(new Error("transport detail"));
    await expect(
      verifySupabaseAccountExportIdentity({
        auth,
        accessToken: "transport-failure-token",
      }),
    ).rejects.toMatchObject({
      code: "auth_unavailable",
    });
  });
});
