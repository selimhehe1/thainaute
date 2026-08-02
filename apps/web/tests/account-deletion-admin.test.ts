import { beforeEach, describe, expect, it, vi } from "vitest";

const authAdmin = vi.hoisted(() => ({
  signOut: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { admin: authAdmin } })),
}));

import { createSupabaseAccountDeletionAuthAdministrator } from "../lib/server/account-deletion/supabase-admin";

const SIGNAL = new AbortController().signal;
const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function administrator() {
  return createSupabaseAccountDeletionAuthAdministrator({
    url: "https://project.supabase.co",
    secretKey: "sb_secret_server_only_value",
  });
}

describe("administrateur Auth de suppression", () => {
  beforeEach(() => {
    authAdmin.signOut.mockReset().mockResolvedValue({ error: null });
    authAdmin.deleteUser.mockReset().mockResolvedValue({ error: null });
  });

  it("révoque globalement avec le jeton puis demande un hard delete", async () => {
    const admin = administrator();
    await admin.revokeGlobalSessions({ accessToken: "jwt", signal: SIGNAL });
    await admin.hardDeleteUser({
      userId: USER_ID,
      signal: SIGNAL,
      acceptAlreadyDeleted: true,
    });

    expect(authAdmin.signOut).toHaveBeenCalledWith("jwt", "global");
    expect(authAdmin.deleteUser).toHaveBeenCalledWith(USER_ID, false);
  });

  it("tolère uniquement les codes Auth indiquant une révocation déjà acquise", async () => {
    for (const error of [
      { name: "AuthSessionMissingError", status: 400 },
      { code: "session_not_found", status: 401 },
      { code: "user_not_found", status: 404 },
    ]) {
      authAdmin.signOut.mockResolvedValueOnce({ error });
      await expect(
        administrator().revokeGlobalSessions({
          accessToken: "stale",
          signal: SIGNAL,
        }),
      ).resolves.toBeUndefined();
    }

    for (const error of [
      { code: "bad_jwt", status: 401 },
      { code: "not_admin", status: 403 },
      { code: "session_not_found", status: 404 },
      { code: "user_not_found", status: 401 },
      { code: "session_not_found", status: 500 },
    ]) {
      authAdmin.signOut.mockResolvedValueOnce({ error });
      await expect(
        administrator().revokeGlobalSessions({
          accessToken: "jwt",
          signal: SIGNAL,
        }),
      ).rejects.toMatchObject({ code: "auth_unavailable" });
    }
  });

  it("tolère uniquement user_not_found/404 après un reçu durable", async () => {
    authAdmin.deleteUser.mockResolvedValueOnce({
      error: { code: "user_not_found", status: 404 },
    });
    await expect(
      administrator().hardDeleteUser({
        userId: USER_ID,
        signal: SIGNAL,
        acceptAlreadyDeleted: true,
      }),
    ).resolves.toBeUndefined();

    for (const error of [
      { code: "bad_jwt", status: 401 },
      { code: "not_admin", status: 403 },
      { code: "unexpected_failure", status: 500 },
      { code: "not_admin", status: 404 },
      { status: 404 },
    ]) {
      authAdmin.deleteUser.mockResolvedValueOnce({ error });
      await expect(
        administrator().hardDeleteUser({
          userId: USER_ID,
          signal: SIGNAL,
          acceptAlreadyDeleted: true,
        }),
      ).rejects.toMatchObject({ code: "auth_unavailable" });
    }
  });

  it("refuse aussi user_not_found avant l'existence d'un reçu durable", async () => {
    authAdmin.deleteUser.mockResolvedValueOnce({
      error: { code: "user_not_found", status: 404 },
    });
    await expect(
      administrator().hardDeleteUser({
        userId: USER_ID,
        signal: SIGNAL,
        acceptAlreadyDeleted: false,
      }),
    ).rejects.toMatchObject({ code: "auth_unavailable" });
  });
});
