import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc })),
}));

import { createSupabaseAccountDeletionSessionVerifier } from "../lib/server/account-deletion/supabase-session";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SESSION_ID = "10000000-0000-4000-8000-000000000001";
const SIGNAL = new AbortController().signal;

function verifier() {
  return createSupabaseAccountDeletionSessionVerifier({
    url: "https://project.supabase.co",
    secretKey: "sb_secret_server_only_value",
  });
}

describe("attestation de session Auth pour la suppression", () => {
  beforeEach(() => rpc.mockReset());

  it.each([true, false])(
    "valide strictement le booléen RPC %s",
    async (active) => {
      rpc.mockResolvedValueOnce({ data: active, error: null });
      await expect(
        verifier().isActive({
          userId: USER_ID,
          sessionId: SESSION_ID,
          signal: SIGNAL,
        }),
      ).resolves.toBe(active);
      expect(rpc).toHaveBeenCalledWith(
        "is_account_deletion_session_active_v1",
        { p_user_id: USER_ID, p_session_id: SESSION_ID },
      );
    },
  );

  it("ferme une erreur ou une réponse ambiguë", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: "42501" } });
    await expect(
      verifier().isActive({
        userId: USER_ID,
        sessionId: SESSION_ID,
        signal: SIGNAL,
      }),
    ).rejects.toMatchObject({ code: "database_unavailable" });

    rpc.mockResolvedValueOnce({ data: "true", error: null });
    await expect(
      verifier().isActive({
        userId: USER_ID,
        sessionId: SESSION_ID,
        signal: SIGNAL,
      }),
    ).rejects.toMatchObject({ code: "database_unavailable" });
  });
});
