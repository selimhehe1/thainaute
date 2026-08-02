# ADR-0019 — Signalements linguistiques structurés v1

- Statut : Accepted
- Date : 2 août 2026
- Complète : signalement d’erreur P0, export de compte v2 et agrégat Studio
- Ne résout pas : `OPEN-API-001`, notification de résolution et corpus réel

## Contexte

Un apprenant doit pouvoir signaler une anomalie sur la version exacte d’un
exercice, y compris après une coupure réseau, sans créer un canal de texte libre
ou une nouvelle source linguistique. Cette donnée appartient au compte : elle
doit être exportable, supprimable et invisible aux autres apprenants.

## Décision

`POST /api/v1/content/reports` accepte uniquement un compte Supabase permanent,
une clé `Idempotency-Key` UUID et le corps fermé suivant :

```json
{
  "contentVersionId": "uuid",
  "exerciseId": "uuid",
  "category": "orthography | meaning | pronunciation | tone | vowel_length | register | naturalness | audio",
  "platform": "web | ios | android"
}
```

Il n’existe aucun champ libre, fichier, audio, réponse d’exercice, email ou
identifiant utilisateur dans la requête. Le serveur vérifie de nouveau le jeton
auprès d’Auth. La RPC `submit_content_report_v1`, exécutée avec
`SECURITY INVOKER` et un `search_path` vide, dérive l’item depuis le bundle JSON
immuable de la version puis exige sa présence relationnelle. Le client ne peut
donc ni choisir l’item enregistré ni écrire directement dans la table.

La table `public.content_reports` est immuable, liée à `auth.users` avec
`ON DELETE CASCADE`, protégée par RLS sans policy client et accessible au rôle
serveur uniquement en `SELECT` et `INSERT`. Un rejeu exact renvoie
`{"status":"duplicate"}` ; une même clé avec un autre hash est refusée. Un
nouvel insert verrouille le profil puis incrémente `sync_revision`, ce qui rend
le snapshot d’export cohérent. Un premier signalement peut amorcer ce profil
minimal après vérification du compte Auth permanent ; il ne crée aucun appareil
et ne fusionne aucune progression anonyme.

Web et mobile écrivent l’entrée dans la même base locale que la progression
avant tout appel réseau. La file FIFO est bornée à 50, isolée par compte et
réutilise exactement sa clé sur chaque retry. La purge conditionnelle refuse un
compte ayant un report en attente ; la suppression confirmée pose le tombstone
et purge progression, fusion et reports dans une seule transaction locale.

Le snapshot local courant est `thainaute.content-report-outbox/v2`. Il lit et
migre sans perte le format v1 en ajoutant `rejection: null`. Seuls les refus
fermés `409/idempotency_key_reused` et `422/invalid_request` deviennent un rejet
durable de la tête exacte. Auth, suppression en cours, transport, `408`, `429`,
`5xx` et toute réponse de protocole invalide restent réessayables ou
diagnostiques et ne deviennent jamais retirables. Un second flush concurrent
de la même entrée et de la même raison conserve le premier horodatage.

Une tête rejetée reste dans la file et bloque les suivantes. Le panneau web ou
mobile affiche explicitement le refus et propose « Retirer le signalement
refusé et reprendre ». Cette action compare l'entrée, la raison et l'horodatage
durables, relit la session et le tombstone, puis retire uniquement cette tête
dans la transaction locale. La FIFO reprend ensuite. Aucun événement analytics
n'est émis pour le refus ou le retrait ; seuls les reports suivants réellement
acquittés produisent `content_reported`.

`THAINAUTE_CONTENT_REPORT_MODE=disabled|supabase` reste `disabled` par défaut.
Le mode Supabase constitue une prévisualisation connectée : tant que les seuils
de limitation de débit de `OPEN-API-001` ne sont pas décidés et implémentés, la
readiness reste fermée et interdit une bêta distante accidentelle. Le mode
ajoute aussi `content_report_sync_required` si la synchronisation Supabase est
désactivée ; le Route Handler refuse alors toute collecte. La configuration de
suppression de compte est également obligatoire : la collecte, l’export et
l’effacement restent une seule base commune.

## Export et Studio

L’ajout d’une collection à un document Zod strict ne peut pas conserver le
format v1. L’export devient donc `thainaute.account-export/v2` et ajoute
`contentReports`, trié par réception puis clé et borné à 10 000 lignes. Les
lignes de progression restent lues sous le JWT utilisateur ; les reports, non
exposés au client, sont lus côté serveur avec un filtre sur l’UUID Auth vérifié
et une validation stricte de chaque propriétaire. Le hash interne n’est pas
exporté.

Le Studio reçoit uniquement `{total, byCategory}` pour la version contrôlée,
même lorsque les nouvelles soumissions sont désactivées.
Ni UUID utilisateur, ni clé de report, ni horodatage n’atteignent l’interface
éditoriale. Un signalement ouvre une piste d’audit ; il ne modifie jamais le
contenu, ne résout aucun finding et ne publie rien.

## Conséquences et limites

- Le signalement fonctionne hors ligne puis reprend sans doublon après retour
  du réseau et de la même session.
- Une file locale non envoyée n’apparaît pas encore dans l’export serveur ; les
  écrans d’export l’expliquent explicitement.
- Un refus permanent n’est jamais supprimé silencieusement : il reste en tête
  jusqu'au retrait explicite et les compteurs distinguent un rejet des entrées
  encore pendantes. Dans le modèle publié immuable, ce cas signale une collision
  ou un déploiement incohérent et doit rester observable opérationnellement.
- `content_reported` ne transporte que la plateforme et reste soumis au
  consentement analytics ; la catégorie et les identifiants sont exclus.
- La suppression du compte efface les reports serveur et locaux. Aucune
  conservation anonymisée n’est effectuée sans nouvelle décision légale.
- L’activation distante, le texte libre, les pièces jointes et une notification
  de résolution restent hors périmètre.

## Validation attendue

- contrats stricts, file FIFO, capacité, retry, collision et changement A→B ;
- HTTP JSON/taille/auth/idempotence/logs expurgés ;
- pgTAP utilisateur A, utilisateur B, anonyme, grants, RPC et cascade ;
- export v2, mutation concurrente et refus de ligne d’un autre sujet ;
- Studio agrégé sans identité ;
- web/mobile : connecté, déconnecté, hors ligne, erreur, retry et accessibilité.

## Références

- [ADR-0014 — Export portable du compte v1](0014-portable-account-export-v1.md)
- [Checklist de confidentialité de l’export](../privacy/account-export.md)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — fonctions de base de données](https://supabase.com/docs/guides/database/functions)
