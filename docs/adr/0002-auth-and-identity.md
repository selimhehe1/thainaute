# ADR-0002 — Authentification et identité stable

- Statut : Accepted
- Date : 2026-08-01

## Décision

La progression peut commencer localement sans compte. Après la première
réussite, Supabase Auth crée l'identité durable. `auth.users.id` est le seul
identifiant de compte partagé et devient exactement l'App User ID RevenueCat.

Un utilisateur doit être authentifié avant tout achat. Aucun rapprochement de
comptes, de droits ou de données ne se fait par email. La fusion local-vers-
compte est explicite, idempotente et journalisée sans contenu sensible.

## Sécurité

L'autorisation utilise la propriété de ligne et, si nécessaire,
`app_metadata`. `user_metadata`, les emails et les identifiants publicitaires
ne servent jamais à accorder un droit. Les clés secrètes restent côté serveur.

## Conséquences

Le parcours gratuit avant compte reste possible. Les achats anonymes sont
écartés pour réduire les erreurs de transfert et de restauration. La suppression
et la recréation de compte devront conserver les obligations financières sans
réutiliser implicitement une ancienne identité.
