import { describe, expect, it } from "vitest";

import { AccountExportInfrastructureError } from "../lib/server/account-export/errors";
import { accountExportIdentityFromSupabaseUser } from "../lib/server/account-export/supabase-auth";

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

    expect(() =>
      accountExportIdentityFromSupabaseUser(
        supabaseUser,
        claimsWithoutAnonymousMarker,
      ),
    ).toThrow(AccountExportInfrastructureError);
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
