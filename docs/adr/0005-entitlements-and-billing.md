# ADR-0005 — Entitlements et frontières de paiement

- Statut : Accepted avec OPEN-BILL-001
- Date : 2026-08-01

## Décision

RevenueCat est la source de l'entitlement multiplateforme `premium`. StoreKit
et Google Play Billing couvrent les achats natifs. Stripe Billing, Checkout et
Customer Portal couvrent le web. Supabase conserve une projection serveur pour
les contrôles et l'audit, jamais une décision uniquement cliente.

Les webhooks sont signés, idempotents et tolèrent doublons et désordre. Les
quotas et droits coûteux sont contrôlés côté serveur. Stripe Tax n'est pas
activé sans inscriptions actives et validation comptable.

## Décision différée

Avant la Phase 3, `OPEN-BILL-001` choisira soit un parcours RevenueCat Web avec
Stripe Billing, soit des Checkout Sessions créées par Next.js puis importées
dans RevenueCat. Aucun code de paiement n'est ajouté à la tranche actuelle.
