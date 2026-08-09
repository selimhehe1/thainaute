# ADR-0036 — Paiements web et entitlement partagé

- Statut : Accepted pour le socle sandbox
- Date : 7 août 2026
- Résout : `OPEN-BILL-001`
- Ne résout pas : `OPEN-PRICE-001`, `OPEN-TAX-001`, les règles Apple/Google et
  le go/no-go d'encaissement réel

## Contexte

Le brief impose un entitlement unique `premium`, partagé entre les comptes
Supabase, le web et les applications natives. Les droits ne doivent jamais
dépendre d'un état client ou d'un événement reçu deux fois. Le projet ne
possède encore ni prix validé, ni inscription fiscale, ni comptes de boutiques
autorisés pour une publication.

## Décision

- Le web utilise Stripe Billing avec Checkout Sessions en `subscription` et
  Customer Portal. Une session crée ou réutilise un client Stripe, porte
  l'identifiant Supabase, l'entitlement et l'identifiant du prix Premium dans
  ses métadonnées et reçoit une clé d'idempotence. La clé envoyée à Stripe
  est un SHA-256 séparé par domaine de l'opération, de l'utilisateur et de
  l'UUID client : elle isole deux comptes et Checkout du Portal sans exposer
  leurs identifiants. L'`integration_identifier` conserve le suffixe de huit
  lettres demandé par Stripe, mais ce suffixe est déterministe pour qu'un
  rejeu porte exactement les mêmes paramètres.
  `payment_method_types` n'est pas forcé ; Stripe conserve la configuration du
  Dashboard. `checkout.session.completed` ne provisionne jamais un droit à lui
  seul. Seuls un abonnement Premium dans un état canonique `active|trialing` ou
  une facture `invoice.paid` peuvent ouvrir le droit. Une facture payée ne
  peut ouvrir ou prolonger Premium qu'après relecture de la Subscription chez
  Stripe, concordance de son identifiant, de son client et de son `livemode`,
  puis présence du prix Premium dans ses items canoniques. Les metadata ne
  servent qu'à reconnaître un abonnement Thaïnaute historique et peuvent le
  révoquer après un changement de prix ; elles ne suffisent jamais à accorder
  le droit. `incomplete`,
  `incomplete_expired`, `past_due`, `unpaid`, un premier paiement échoué et
  `invoice.payment_action_required` révoquent le miroir par défaut. La future
  politique de grâce reste bloquée tant qu'elle n'est pas décidée et modélisée.
  Aucun renouvellement artisanal par PaymentIntent n'est ajouté.
- Les achats iOS et Android restent du ressort de RevenueCat. La route
  `POST /api/v1/billing/revenuecat/webhook` vérifie l'autorisation configurée
  **et** le HMAC officiel du corps brut avec une tolérance de cinq minutes.
  Elle refuse un environnement ou un App ID non autorisé avant toute recherche
  de compte, puis résout l'App User ID stable ou ses alias.
- Stripe et RevenueCat écrivent le même `private.entitlements_cache` via des
  RPC `SECURITY INVOKER` réservées à `service_role`. Le registre
  `private.billing_events` déduplique `(provider, event_id)`, rejette un hash
  différent pour un même identifiant et ignore les événements plus anciens,
  y compris lorsqu'ils proviennent de deux fournisseurs différents.
- Les routes, variables et UI sont fermées par défaut. Une capacité serveur
  indépendante des variables, `BILLING_PROVIDER_ACTIONS_CAPABILITY`, reste
  explicitement à `enabled: false` dans le code. Checkout, Portal, statut et
  les deux webhooks la vérifient avant de construire un client Stripe, un
  dépôt Supabase ou un service RevenueCat. Une configuration complète
  `stripe_test` ou `stripe_live` répond donc `billing_unavailable` sans appel
  externe. Le mode live exige en plus une origine HTTPS, une clé restreinte
  live et une confirmation explicite ; ces barrières ne remplacent aucune
  validation juridique, fiscale, commerciale ou de boutique.

## Blocage avant activation multi-fournisseur

Le schéma sandbox actuel conserve une seule ligne `(user_id, entitlement)`.
Il applique donc un ordre total entre Stripe et RevenueCat : un événement plus
récent d'un fournisseur peut encore écraser le droit valide de l'autre. Une
union sûre exige un état canonique séparé par fournisseur et abonnement, puis
une agrégation serveur. Ce changement de modèle et sa migration ne sont pas
inventés dans ce durcissement. La capacité serveur reste fermée jusqu'à cette
agrégation, l'ajout des données de facturation à l'export de compte et une
coordination durable de la suppression avec Stripe et RevenueCat. Son ouverture
exigera une modification de code revue avec la matrice sandbox complète ; ni
`THAINAUTE_BILLING_MODE`, ni une readiness rouge ou verte ne peuvent la
contourner.

## Conséquences

- Un compte retrouve le même entitlement `premium` après une connexion sur une
  autre plateforme, sans lecture directe des tables privées.
- Les événements RevenueCat inconnus ou ne contenant pas l'entitlement
  `premium` sont conservés comme ignorés sans ouvrir un droit. Une expiration
  ne peut pas laisser un statut actif ; une période sans date d'échéance n'est
  pas considérée comme active.
- Un échec Stripe ne bénéficie d'aucune grâce implicite. Ce comportement est
  volontairement conservateur jusqu'à une décision explicite sur la grâce.
- Les secrets restent serveur-only : aucun SDK de paiement, token, prix ou
  webhook n'entre dans le bundle web ou mobile.
- La tranche n'a créé aucun produit Stripe, client distant, configuration
  RevenueCat, compte de boutique, achat ou déploiement. Une recette sandbox
  réelle reste nécessaire avant toute activation.

## Validation

- Tests Vitest des configurations, Checkout, Portal, signatures et HMAC,
  environnements, premier paiement échoué, états impayés, ordre inversé,
  idempotence HTTP et panneau compte. Des tests de routes prouvent aussi qu'une
  configuration test ou live complète ne construit aucune dépendance et
  n'effectue aucun appel fournisseur tant que la capacité est fermée.
- pgTAP : RLS, privilèges, compte A/B/anonyme, doublon, conflit de hash et ordre
  d'arrivée inter-fournisseurs.
- `pnpm db:reset --local` et `pnpm db:test` après la migration.

## Références

- [Stripe — concevoir une intégration d'abonnement](https://docs.stripe.com/billing/subscriptions/design-an-integration)
- [Stripe — Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [RevenueCat — webhooks](https://www.revenuecat.com/docs/integrations/webhooks)
- [RevenueCat — types et champs d'événement](https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields)
