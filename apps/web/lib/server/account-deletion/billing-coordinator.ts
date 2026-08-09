import type { BillingMode } from "../billing/runtime";
import { AccountDeletionInfrastructureError } from "./errors";
import type {
  AccountDeletionBillingCoordinator,
  AccountDeletionBillingHistoryReader,
} from "./ports";

function billingUnavailable(): never {
  throw new AccountDeletionInfrastructureError("billing_unavailable");
}

async function assertNoBillingHistory(
  historyReader: AccountDeletionBillingHistoryReader,
  input: { readonly userId: string; readonly signal: AbortSignal },
): Promise<void> {
  try {
    if (await historyReader.hasBillingHistory(input)) billingUnavailable();
  } catch (error) {
    if (
      error instanceof AccountDeletionInfrastructureError &&
      error.code === "billing_unavailable"
    ) {
      throw error;
    }
    billingUnavailable();
  }
}

/**
 * Le mode désactivé conserve la suppression v1 uniquement pour un compte dont
 * l'absence totale d'historique billing a été prouvée en base. La seconde
 * lecture après création/reprise du reçu réduit la fenêtre de course avant les
 * effets destructifs. Tout mode actif ou invalide reste fermé tant qu'un vrai
 * coordinateur durable n'est pas injecté ici.
 */
export function createRuntimeAccountDeletionBillingCoordinator(input: {
  readonly billingMode: BillingMode | null;
  readonly historyReader: AccountDeletionBillingHistoryReader;
}): AccountDeletionBillingCoordinator {
  if (input.billingMode !== "disabled") {
    return {
      assertCanStartAccountDeletion: async () => billingUnavailable(),
      prepareForAccountDeletion: async () => billingUnavailable(),
    };
  }

  return {
    assertCanStartAccountDeletion: ({ userId, signal }) =>
      assertNoBillingHistory(input.historyReader, { userId, signal }),
    prepareForAccountDeletion: ({ userId, signal }) =>
      assertNoBillingHistory(input.historyReader, { userId, signal }),
  };
}
