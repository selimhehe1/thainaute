import { describe, expect, it, vi } from "vitest";

import { authorizeSupabaseContentEditor } from "../lib/server/content-studio/supabase-auth";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CLAIMS = {
  sub: USER_ID,
  is_anonymous: false,
  app_metadata: { roles: [] },
};
const LIVE_USER = {
  id: USER_ID,
  is_anonymous: false,
  email_confirmed_at: "2026-08-01T09:01:00+00:00",
  app_metadata: { roles: ["content_editor"] },
};

function createAuth(input?: {
  readonly claims?: unknown;
  readonly user?: unknown;
  readonly userError?: { readonly status?: number } | null;
}) {
  return {
    getClaims: vi.fn().mockResolvedValue({
      data: { claims: input?.claims ?? CLAIMS },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: input !== undefined && "user" in input ? input.user : LIVE_USER,
      },
      error: input?.userError ?? null,
    }),
  };
}

describe("autorisation live du Studio de contenu", () => {
  it("autorise le rôle exact relu dans app_metadata", async () => {
    const auth = createAuth();

    await expect(
      authorizeSupabaseContentEditor({
        auth,
        accessToken: "verified-access-token",
      }),
    ).resolves.toBeUndefined();
    expect(auth.getClaims).toHaveBeenCalledWith("verified-access-token");
    expect(auth.getUser).toHaveBeenCalledWith("verified-access-token");
  });

  it("utilise le rôle live et non les claims éventuellement périmés", async () => {
    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({
          claims: {
            ...CLAIMS,
            app_metadata: { roles: ["content_editor"] },
          },
          user: { ...LIVE_USER, app_metadata: { roles: [] } },
        }),
        accessToken: "stale-role-token",
      }),
    ).rejects.toMatchObject({ code: "not_found", status: 404 });

    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({
          claims: { ...CLAIMS, app_metadata: { roles: [] } },
          user: LIVE_USER,
        }),
        accessToken: "fresh-live-role-token",
      }),
    ).resolves.toBeUndefined();
  });

  it("ignore totalement user_metadata et les rôles approchants", async () => {
    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({
          user: {
            ...LIVE_USER,
            app_metadata: { roles: ["content_editor_admin"] },
            user_metadata: { roles: ["content_editor"] },
          },
        }),
        accessToken: "user-metadata-role-token",
      }),
    ).rejects.toMatchObject({ code: "not_found", status: 404 });

    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({
          user: {
            ...LIVE_USER,
            app_metadata: {
              roles: ["content_editor", { injected: true }],
            },
          },
        }),
        accessToken: "malformed-live-roles-token",
      }),
    ).rejects.toMatchObject({ code: "not_found", status: 404 });
  });

  it("classe l'anonyme et le compte supprimé en 401", async () => {
    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({
          claims: { ...CLAIMS, is_anonymous: true },
          user: { ...LIVE_USER, is_anonymous: true },
        }),
        accessToken: "anonymous-token",
      }),
    ).rejects.toMatchObject({ code: "unauthorized", status: 401 });

    await expect(
      authorizeSupabaseContentEditor({
        auth: createAuth({ user: null }),
        accessToken: "deleted-user-token",
      }),
    ).rejects.toMatchObject({ code: "unauthorized", status: 401 });
  });

  it("classe une panne Auth en 503 sans en propager le détail", async () => {
    const failure = await authorizeSupabaseContentEditor({
      auth: createAuth({ userError: { status: 503 } }),
      accessToken: "temporary-failure-token",
    }).catch((error: unknown) => error);

    expect(failure).toMatchObject({ code: "auth_unavailable", status: 503 });
    expect(String(failure)).not.toContain("temporary-failure-token");
  });
});
