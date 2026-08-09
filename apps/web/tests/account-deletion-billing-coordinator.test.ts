import { describe, expect, it, vi } from "vitest";

import { createRuntimeAccountDeletionBillingCoordinator } from "../lib/server/account-deletion/billing-coordinator";

const INPUT = {
  receiptId: "10000000-0000-4000-8000-000000000001",
  userId: "20000000-0000-4000-8000-000000000001",
  signal: new AbortController().signal,
};

describe("coordinateur billing de suppression de compte", () => {
  it("autorise le no-op désactivé uniquement après deux preuves négatives", async () => {
    const historyReader = { hasBillingHistory: vi.fn(async () => false) };
    const coordinator = createRuntimeAccountDeletionBillingCoordinator({
      billingMode: "disabled",
      historyReader,
    });

    await expect(
      coordinator.assertCanStartAccountDeletion(INPUT),
    ).resolves.toBeUndefined();
    await expect(
      coordinator.prepareForAccountDeletion(INPUT),
    ).resolves.toBeUndefined();
    expect(historyReader.hasBillingHistory).toHaveBeenCalledTimes(2);
    expect(historyReader.hasBillingHistory).toHaveBeenNthCalledWith(1, {
      userId: INPUT.userId,
      signal: INPUT.signal,
    });
    expect(historyReader.hasBillingHistory).toHaveBeenNthCalledWith(2, {
      userId: INPUT.userId,
      signal: INPUT.signal,
    });
  });

  it.each([
    { result: true, failure: null },
    { result: false, failure: new Error("database unavailable") },
  ])(
    "échoue fermé sans preuve négative durable %#",
    async ({ result, failure }) => {
      const historyReader = {
        hasBillingHistory: vi.fn(async () => {
          if (failure !== null) throw failure;
          return result;
        }),
      };
      const coordinator = createRuntimeAccountDeletionBillingCoordinator({
        billingMode: "disabled",
        historyReader,
      });

      await expect(
        coordinator.assertCanStartAccountDeletion(INPUT),
      ).rejects.toMatchObject({ code: "billing_unavailable" });
      await expect(
        coordinator.prepareForAccountDeletion(INPUT),
      ).rejects.toMatchObject({ code: "billing_unavailable" });
    },
  );

  it.each(["stripe_test", "stripe_live", null] as const)(
    "bloque le mode %s avant le reçu sans consulter ni exposer l'historique",
    async (mode) => {
      const historyReader = { hasBillingHistory: vi.fn(async () => false) };
      const coordinator = createRuntimeAccountDeletionBillingCoordinator({
        billingMode: mode,
        historyReader,
      });

      await expect(
        coordinator.assertCanStartAccountDeletion(INPUT),
      ).rejects.toMatchObject({ code: "billing_unavailable" });
      await expect(
        coordinator.prepareForAccountDeletion(INPUT),
      ).rejects.toMatchObject({ code: "billing_unavailable" });
      expect(historyReader.hasBillingHistory).not.toHaveBeenCalled();
    },
  );
});
