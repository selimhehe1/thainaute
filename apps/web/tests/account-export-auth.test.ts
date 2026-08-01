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

describe("identité Auth de l'export de compte", () => {
  it("whiteliste les champs et canonise uniquement les noms de providers", () => {
    expect(accountExportIdentityFromSupabaseUser(supabaseUser)).toEqual({
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
      JSON.stringify(accountExportIdentityFromSupabaseUser(supabaseUser)),
    ).not.toContain("never-exported");
  });

  it("refuse les comptes anonymes", () => {
    expect(
      accountExportIdentityFromSupabaseUser({
        ...supabaseUser,
        is_anonymous: true,
      }),
    ).toBeNull();
  });

  it("ferme une réponse Auth sans marqueur d'anonymat explicite", () => {
    const userWithoutAnonymousMarker: Record<string, unknown> = {
      ...supabaseUser,
    };
    delete userWithoutAnonymousMarker.is_anonymous;

    expect(() =>
      accountExportIdentityFromSupabaseUser(userWithoutAnonymousMarker),
    ).toThrow(AccountExportInfrastructureError);
  });

  it("ferme un provider non conforme au lieu d'exporter la metadata brute", () => {
    expect(() =>
      accountExportIdentityFromSupabaseUser({
        ...supabaseUser,
        app_metadata: { providers: ["email", "Provider Injecté"] },
      }),
    ).toThrow(AccountExportInfrastructureError);
  });

  it("classe une réponse Auth mal formée comme indisponible, pas comme anonyme", () => {
    expect(() =>
      accountExportIdentityFromSupabaseUser({
        ...supabaseUser,
        created_at: null,
      }),
    ).toThrow(AccountExportInfrastructureError);
  });
});
