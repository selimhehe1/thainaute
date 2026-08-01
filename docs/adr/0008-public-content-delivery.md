# ADR-0008 — Distribution expurgée du contenu publié

- Statut : Accepted avec `OPEN-OFFLINE-001`
- Date : 2026-08-01
- Critères concernés : `AC-LING-001`, `AC-FREE-001`
- Décisions verrouillées concernées : `DEC-004`, `DEC-005`, `DEC-006`

## Contexte

Le bundle éditorial complet contient les clés de correction, les preuves et
constats internes, les références de consentement ainsi que les chemins de
stockage audio. Ces données sont nécessaires au serveur, mais ne constituent
pas un contrat client. Les rôles Supabase `anon` et `authenticated` ne peuvent
donc pas lire directement `lesson_versions`, `learning_items` ou
`audio_assets`.

## Décision

La première API de lecture est
`GET /api/v1/content/lessons/{versionId}`. Elle sert seulement une version :

- au statut et à la visibilité `published` et `public` ;
- rattachée à une release publiée ;
- dont le hash éditorial, le schéma, les liens, les licences, les sept audits,
  les conflits et les consentements repassent la porte serveur commune ;
- gratuite, avec `requiredEntitlement` à `null`.

Une version absente, invalide, non publiable ou Premium reçoit le même
`404 content_not_found`. Lorsqu'une ligne publiée existe mais que son bundle
échoue à la porte, le serveur émet seulement un événement opérationnel fermé
`content_integrity_failed`, sans identifiant ni donnée éditoriale. Une panne de
la dépendance reçoit une enveloppe fermée `503 content_unavailable`. Les erreurs
ne reprennent ni exception libre, ni identifiant de contenu, ni secret.

Le DTO public strict contient les identifiants de version et d'exercice, le
prompt, les options proposées et les métadonnées d'intégrité audio. Les options
sont ordonnées de manière déterministe indépendamment de leur ordre éditorial.
Il exclut notamment `correctOptionId`, les feedbacks, les items pédagogiques et
leurs traductions, tout `itemId`, la relation audio-item, la provenance, les
sources, les acteurs, les audits, les findings, les références de consentement
et tous les chemins Storage. Cette tranche n'ajoute ni catalogue, ni URL audio,
ni accès Premium.

Les tables éditoriales restent lisibles uniquement par le serveur. Celui-ci
vérifie le bundle brut puis construit une nouvelle valeur conforme au schéma
public ; il ne retire pas quelques propriétés d'un objet destiné à être
sérialisé.

Les privilèges `SELECT` de `anon` et `authenticated` sont révoqués et les
anciennes policies client de `lesson_versions`, `learning_items` et
`audio_assets` sont supprimées. Une future ouverture de ces tables exigera donc
une migration explicite des deux couches, privilèges et RLS ; le DTO reste le
seul contrat client.

## Cache et intégrité

L'URL contient l'UUID immuable de la version. Le serveur calcule un SHA-256
canonique sur le DTO public avec le namespace `thainaute.public-lesson/v1`.
Ce hash, distinct du hash éditorial brut, devient `contentSha256` et un ETag
fort. `If-None-Match` permet une réponse `304` vide.

Une version publiée reste immuable, mais son accès peut devoir être révoqué en
urgence pour une raison juridique ou linguistique. La réponse utilise donc
l'ETag avec `max-age=0`, un cache partagé limité à cinq minutes et
`must-revalidate`, sans directive `immutable`. La fenêtre maximale du cache CDN
est ainsi bornée ; un retrait d'urgence n'attend pas un an. Toutes les erreurs
portent `no-store`. Aucun contenu personnalisé ou Premium ne pourra utiliser
cette politique de cache.

## Tension avec la correction immédiate hors ligne

Un client capable de noter réellement une réponse sans réseau possède
nécessairement assez d'information pour déterminer la bonne option. Masquer le
nom `correctOptionId`, chiffrer ou obfusquer cette information ne la rend pas
secrète dès lors que le client détient aussi le code et la clé permettant de
noter.

La présente tranche privilégie donc la frontière autoritaire : le DTO public
ne contient aucune clé, une tentative hors ligne reste en attente et la
correction arrive après traitement serveur. En ligne, le serveur renvoie la
note autoritaire et le client peut afficher un feedback générique.

`OPEN-OFFLINE-001` doit décider avant la vraie expérience hors ligne si le
produit accepte cette correction différée ou distribue volontairement un
matériel de notation local considéré comme non secret, dont le résultat restera
provisoire puis recalculé par le serveur. Cette ADR ne tranche pas cette seconde
politique.

## Conséquences

- Une porte de publication unique sert la notation et la distribution.
- Le hash éditorial contenant les données internes n'est jamais présenté comme
  un hash vérifiable du DTO public.
- Le téléchargement audio devra utiliser une route opaque dédiée avant son
  branchement ; aucun chemin factice n'est ajouté au contrat actuel.
- L'intégration des tentatives dérive désormais l'item et la dimension côté
  serveur depuis `(exerciseId, contentVersionId)` ; ni le DTO de contenu ni la
  commande de tentative ne transportent `itemId`.
- `OPEN-CONTENT-001` continue de bloquer toute première publication réelle.

## Références officielles

- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Storage — contrôle d'accès](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
