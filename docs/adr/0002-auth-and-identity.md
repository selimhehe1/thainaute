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

ADR-0011 concrétise ce parcours avec un code email à six chiffres, un stockage
de session natif chiffré, une fusion locale transactionnelle et une purge ciblée
avant la déconnexion locale.

## Sécurité

L'autorisation utilise la propriété de ligne et, si nécessaire,
`app_metadata`. `user_metadata`, les emails et les identifiants publicitaires
ne servent jamais à accorder un droit. Les clés secrètes restent côté serveur.

Toute API réservée à un compte permanent passe par la même frontière serveur :
le même Bearer est vérifié par `auth.getClaims(accessToken)` puis relu auprès
d'Auth par `auth.getUser(accessToken)`. Le premier contrôle la signature et
l'expiration du JWT ; le second confirme que l'utilisateur existe encore. Les
UUID `sub` et `user.id` doivent concorder, et un utilisateur anonyme est refusé.
Cette double vérification est notamment nécessaire parce que supprimer un
utilisateur n'invalide pas immédiatement un JWT déjà émis.

Un rejet documenté des credentials ou un utilisateur relu à `null` produit un
`401` générique. Une panne temporaire, une réponse Auth mal formée ou une
divergence entre les deux canaux produit un `503` générique. Aucun détail Auth,
jeton ou identifiant utilisateur n'est inclus dans la réponse ou les journaux.

## Conséquences

Le parcours gratuit avant compte reste possible. Les achats anonymes sont
écartés pour réduire les erreurs de transfert et de restauration. La suppression
et la recréation de compte devront conserver les obligations financières sans
réutiliser implicitement une ancienne identité.

## Références officielles

- [Supabase — `auth.getClaims`](https://supabase.com/docs/reference/javascript/auth-getclaims)
- [Supabase — `auth.getUser`](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase — suppression d'un utilisateur et durée de validité du JWT](https://supabase.com/docs/guides/auth/managing-user-data#deleting-users)
- [Supabase — utilisateurs anonymes et claim `is_anonymous`](https://supabase.com/docs/guides/auth/auth-anonymous)
