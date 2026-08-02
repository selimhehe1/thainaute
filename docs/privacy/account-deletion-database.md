# Suppression de compte v1 — contrat PostgreSQL

## Portée

Cette note décrit la persistance privée qui rend un hard delete Auth reprenable
et idempotent. L'authentification récente, la purge Storage, le transport HTTP,
la purge locale et la durée de conservation relèvent de la tranche applicative
de suppression de compte.

La migration `20260802013348_account_deletion_receipts_v1.sql` corrige aussi la
relation `attempt_events(user_id, device_id) → devices(user_id, id)` en
`ON DELETE CASCADE`. `attempt_events` et `devices` ont déjà une FK directe
`ON DELETE CASCADE` vers `auth.users` ; conserver `RESTRICT` sur la relation
composite pouvait rendre le hard delete dépendant de l'ordre des triggers.

## Registre privé

`private.account_deletion_receipts` n'est pas dans les schémas exposés par
PostgREST. `anon` et `authenticated` n'ont ni `USAGE` sur `private`, ni
privilège sur la table, ni droit d'exécution sur les RPC. `service_role` reçoit
seulement `SELECT` et l'`INSERT` des cinq champs d'entrée. Il ne peut ni choisir
`receipt_id` ou `created_at`, ni modifier ou finaliser une ligne, ni supprimer
un reçu. RLS reste active en défense en profondeur.

Le registre contient :

- `receipt_id`, UUID v4 généré par PostgreSQL et stable entre les retries ;
- quatre HMAC-SHA-256 en hexadécimal minuscule : sujet Auth, idempotence,
  requête canonique et secret de continuation ;
- `target_user_id`, UUID Auth temporaire avec FK `ON DELETE SET NULL`,
  obligatoire uniquement dans l'état `in_progress` ;
- `status`, borné à `in_progress` ou `completed` ;
- les dates autoritaires `created_at`, `updated_at` et `completed_at`.

Une ligne `completed` doit avoir `target_user_id IS NULL`, un `completed_at`
non nul et `updated_at = completed_at`. Le reçu terminé survit donc à
`auth.users`, mais ne contient plus l'UUID utilisateur brut. L'unicité
`(subject_hmac_sha256, idempotency_hmac_sha256)` déduplique la commande et
l'unicité du HMAC de continuation ferme les collisions de reprise. Un index
B-tree dédié à `idempotency_hmac_sha256` borne aussi le lookup de collision
exécuté avant Auth : une requête publique ne provoque pas de scan du registre.
Un second index partiel sur `target_user_id IS NOT NULL` borne la cascade Auth
aux seuls reçus encore actifs.

La nullification FK passe par
`private.finalize_account_deletion_receipt_v1()`, trigger `BEFORE UPDATE`
`SECURITY INVOKER` au `search_path` vide. Il fixe `status`, `updated_at` et
`completed_at` dans la transaction du hard delete. Il ne fait qu'ajuster
`NEW`, ne possède aucun privilège élevé et n'est exécutable directement par
aucun rôle applicatif.

## Hypothèses cryptographiques côté serveur

PostgreSQL ne reçoit jamais le pepper HMAC ni le secret de continuation brut.
Le serveur Next.js doit :

1. utiliser un secret aléatoire dédié à cette fonction, distinct des clés
   Supabase et conservé uniquement dans le coffre de l'environnement ;
2. appliquer HMAC-SHA-256 avec des contextes distincts et versionnés, par
   exemple
   `thainaute.account-deletion/{subject|idempotency|request|continuation}/v1\0` ;
3. produire exactement 64 caractères hexadécimaux minuscules ;
4. canoniser le corps strict de requête avant le HMAC de requête ;
5. valider la continuation imprévisible de 32 octets produite par le client,
   ne jamais la journaliser et ne persister en base que son HMAC ;
6. conserver la version de secret nécessaire pendant toute la fenêtre de retry.

Une rotation qui rendrait les anciens HMAC impossibles à recalculer casse la
reprise après hard delete. Le déploiement applicatif doit donc gérer la lecture
de la version précédente avant toute rotation. La durée de conservation des
reçus terminés doit être fixée avec la politique RGPD avant la bêta distante.

## Session Auth vivante

La RPC `is_account_deletion_session_active_v1(user_id, session_id)` applique la
recommandation Supabase pour les actions sensibles : le claim `session_id`
doit encore correspondre à la clé primaire de `auth.sessions` et au même sujet.
Elle est `SECURITY INVOKER`, stable et exécutable uniquement par `service_role`,
qui reçoit explicitement la lecture des seules colonnes `id` et `user_id`. Un
JWT correctement signé mais issu d'une session supprimée ne peut donc pas
commencer un reçu.

## RPC internes

Les quatre RPC publiques sont `SECURITY INVOKER`, ont un `search_path` vide et
sont exécutables uniquement par `service_role`. La RPC de session et les deux
lectures sont `STABLE` ; `begin` est `VOLATILE` :

- `is_account_deletion_session_active_v1(user_id, session_id)` atteste que la
  session Auth appartient encore au sujet ;
- `begin_account_deletion_v1(subject_hmac, idempotency_hmac, request_hmac,
continuation_hmac, target_user_id)` crée la ligne ou rejoue la ligne
  existante. Un autre HMAC de requête, de continuation ou une autre cible en
  cours ferme l'appel ;
- `resume_account_deletion_v1(idempotency_hmac, continuation_hmac)` retrouve
  l'état. Il restitue `targetUserId` seulement pendant `in_progress` ;
- `read_account_deletion_completion_v1(idempotency_hmac,
continuation_hmac)` ne modifie rien. Il restitue uniquement un reçu déjà
  finalisé par la transaction Auth et lève `TA006` si la cible existe encore.

Les trois RPC de reçu renvoient l'objet interne fermé
`{status, receiptId, targetUserId, completedAt}`. La route HTTP transforme
l'état terminé vers son contrat public ; elle ne doit jamais transmettre
`targetUserId`, les HMAC ou la continuation.

| Code    | Signification                                     |
| ------- | ------------------------------------------------- |
| `TA001` | format ou champ obligatoire invalide              |
| `TA002` | reçu introuvable                                  |
| `TA003` | idempotence réutilisée avec une autre requête     |
| `TA004` | continuation absente, différente ou en collision  |
| `TA005` | cible différente pendant une suppression en cours |
| `TA006` | complétion Auth non encore commise                |

## Ordre applicatif attendu

1. Vérifier le JWT, la session récente, la confirmation stricte et la clé
   d'idempotence.
2. Calculer les quatre HMAC puis appeler `begin_account_deletion_v1`.
3. Si le reçu est terminé, rejouer la réponse sans toucher à Auth ou Storage.
4. Purger les objets Storage dont l'utilisateur est propriétaire.
5. Effectuer le hard delete Auth ; les lignes publiques et les commits de sync
   disparaissent par cascade, tandis que la FK et le trigger finalisent tous
   les reçus de la cible dans la même transaction.
6. Appeler `read_account_deletion_completion_v1` pour relire idempotemment le
   reçu. Un état encore `in_progress` est un invariant fermé, jamais un succès.
7. En reprise, appeler `resume_account_deletion_v1`, terminer la phase manquante
   puis rejouer le reçu persisté.

Le registre rend la phase finale rejouable, mais ne remplace pas les contrôles
de session : un access token déjà émis reste valide jusqu'à son expiration. Les
routes sensibles doivent relire l'utilisateur ou la session en direct.

## Validation et rollback

`supabase/tests/account_deletion_receipts_v1_test.sql` couvre 62 assertions sur
les privilèges A/B/anonyme, la session vivante ou révoquée, les index du lookup
pré-Auth et de la cascade, les conflits d'idempotence et de continuation, les
contraintes, les cascades de A sans toucher B, l'impossibilité de finaliser par
RPC, la finalisation transactionnelle, la reprise après suppression Auth et
l'absence d'UUID utilisateur dans le reçu final.

Avant mise en production, appliquer la migration en preview puis exécuter
`pnpm db:test`, `pnpm db:lint` et les Database Advisors. Le poste Windows local
actuel ne possède pas Docker ; ces portes doivent donc être obtenues en CI ou
sur une machine équipée d'un runtime compatible.

Un rollback avant toute donnée réelle peut supprimer les quatre RPC publiques,
le trigger, sa fonction privée et la table, puis remettre la FK composite en
`ON DELETE RESTRICT`. Après création de reçus, ne pas supprimer le registre
sans migration de conservation et preuve que plus aucun retry n'en dépend. La
cascade vers les tentatives peut rester en place : elle correspond au
comportement fonctionnel du hard delete.

## Références officielles

- [Supabase — gestion et suppression des utilisateurs](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — changements incompatibles](https://supabase.com/changelog?types=breaking-change)
