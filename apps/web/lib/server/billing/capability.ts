/**
 * Barrière d'activation indépendante de la configuration d'environnement.
 *
 * Elle reste volontairement fermée tant que l'entitlement multi-fournisseur
 * n'est pas agrégé par fournisseur/abonnement, que l'export de compte ne
 * couvre pas la facturation et que la suppression n'est pas coordonnée avec
 * Stripe et RevenueCat. Son ouverture exige donc une modification de code
 * revue avec les preuves correspondantes ; une variable ne peut pas la
 * contourner.
 */
export const BILLING_PROVIDER_ACTIONS_CAPABILITY = Object.freeze({
  enabled: false,
  blockers: Object.freeze([
    "multi_provider_entitlement_aggregation",
    "billing_account_export",
    "coordinated_provider_account_deletion",
  ]),
});

export function areBillingProviderActionsEnabled(): boolean {
  return BILLING_PROVIDER_ACTIONS_CAPABILITY.enabled;
}
