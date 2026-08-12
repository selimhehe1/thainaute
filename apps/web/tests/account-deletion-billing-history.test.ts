import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc })),
}));

import { createSupabaseAccountDeletionBillingHistoryReader } from "../lib/server/account-deletion/supabase-billing-history";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SIGNAL = new AbortController().signal;

function reader() {
  return createSupabaseAccountDeletionBillingHistoryReader({
    url: "https://project.supabase.co",
    secretKey: "sb_secret_server_only_value",
  });
}

describe("preuve Supabase de l'historique billing avant suppression", () => {
  beforeEach(() => rpc.mockReset());

  it.each([true, false])(
    "accepte uniquement le booléen serveur %s",
    async (hasBillingHistory) => {
      rpc.mockResolvedValueOnce({ data: hasBillingHistory, error: null });

      await expect(
        reader().hasBillingHistory({ userId: USER_ID, signal: SIGNAL }),
      ).resolves.toBe(hasBillingHistory);
      expect(rpc).toHaveBeenCalledWith("billing_has_history_v1", {
        p_user_id: USER_ID,
      });
    },
  );

  it.each([
    { data: null, error: { code: "42501" } },
    { data: { hasBillingHistory: false }, error: null },
  ])("échoue fermé pour une réponse RPC non prouvée", async (result) => {
    rpc.mockResolvedValueOnce(result);

    await expect(
      reader().hasBillingHistory({ userId: USER_ID, signal: SIGNAL }),
    ).rejects.toMatchObject({ code: "billing_unavailable" });
  });

  it("masque une panne de transport derrière l'erreur billing générique", async () => {
    rpc.mockRejectedValueOnce(new Error("private upstream detail"));

    await expect(
      reader().hasBillingHistory({ userId: USER_ID, signal: SIGNAL }),
    ).rejects.toMatchObject({ code: "billing_unavailable" });
  });
});
