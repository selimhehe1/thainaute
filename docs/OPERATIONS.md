# Guide d'exploitation et cible d'hébergement

- Statut : cible technique acceptée, aucune ressource cloud créée
- Date de vérification documentaire : 2026-08-01
- Portée : MVP et première bêta ; à réévaluer avant la production

Ce guide applique le brief sans autoriser un déploiement. Toute ouverture de
compte, création de projet, dépense, modification DNS, publication ou action de
production nécessite encore une instruction explicite du fondateur.

## Cible retenue

```text
Web, studio et API /api/v1   Vercel, application Next.js unique
             │
             ├── Auth, Postgres et Storage   Supabase géré, région UE
             │
iOS et Android               Expo EAS Build / Submit
             │
DNS facultatif               Cloudflare en DNS-only uniquement
```

### Vercel

Vercel héberge le site, l'application web, le studio futur et les Route
Handlers `/api/v1` dans un seul déploiement Next.js. Cette topologie respecte le
monolithe modulaire du brief et évite un second serveur à exploiter.

Avant un premier déploiement, placer les fonctions Node.js dans la région
Vercel la plus proche de la base Supabase. Le couple recommandé est Paris
(`cdg1`) avec Supabase Paris (`eu-west-3`) si ces régions sont disponibles lors
de la création ; sinon choisir un couple européen proche, puis mesurer la
latence. Un changement ultérieur de région Postgres exige une migration
planifiée ; ce n'est pas un simple réglage. Le CDN Vercel continue de servir les
ressources statiques au plus près des utilisateurs.

### Supabase UE

Supabase géré héberge Auth, Postgres et Storage dans une région de l'Union
européenne. Une région ne peut pas être déplacée implicitement après création :
le choix doit donc être vérifié au moment où l'autorisation de créer le projet
est donnée.

Les environnements de test/preview et de production ne partagent jamais une
base ni des clés. Les migrations sont appliquées comme une étape contrôlée et
unique, jamais au démarrage de chaque instance web. RLS, privilèges Data API
explicites, pgTAP et advisors restent des portes avant promotion.

### Expo EAS

EAS Build produit les binaires iOS et Android ; EAS Submit ne publie qu'après
un go/no-go explicite. Les profils `development`, `preview` et `production`
doivent pointer vers les environnements correspondants. Toute variable
`EXPO_PUBLIC_*` est publique et intégrée au bundle : aucune clé secrète,
`service_role`, clé Stripe ou secret de webhook ne peut y être placée.

### DNS et services écartés au MVP

Cloudflare est facultatif comme gestionnaire DNS. S'il est retenu, les entrées
Vercel restent en mode **DNS-only** au MVP : aucun proxy, cache, Worker ou WAF
Cloudflare n'est interposé tant qu'un besoin mesuré ne le justifie. Les
redirections des domaines défensifs sont gérées par Vercel ou le registrar.

Railway, un hébergement AWS construit sur mesure et Redis ne sont pas ajoutés :

- Railway dupliquerait l'exécution des Route Handlers déjà couverte par
  Vercel ;
- AWS augmenterait fortement le périmètre d'exploitation sans exigence que
  Vercel et Supabase ne satisfont pas ;
- Postgres suffit pour l'idempotence, les quotas initiaux et les verrous courts ;
  Redis ne sera étudié qu'après mesure d'une contention ou latence réelle.

Aucun de ces choix n'empêche une migration future : le domaine reste en
TypeScript et les données principales restent dans PostgreSQL.

## Environnements

| Environnement | Indexation                   | Synchronisation              | Données                 | Usage                 |
| ------------- | ---------------------------- | ---------------------------- | ----------------------- | --------------------- |
| local         | désactivée                   | `disabled` ou Supabase local | fixtures non publiables | développement         |
| preview       | désactivée                   | Supabase test isolé          | synthétiques            | revue et E2E          |
| production    | activée après portes légales | Supabase production UE       | réelles                 | publication contrôlée |

Une preview ne doit jamais recevoir les secrets ni la base de production. La
valeur publique `THAINAUTE_PUBLIC_URL` correspond exactement à l'origine de
l'environnement et l'indexation reste désactivée sur toute URL temporaire.

## Variables de la tranche actuelle

| Variable                               | Surface                   | Secret  | Rôle                                  |
| -------------------------------------- | ------------------------- | ------- | ------------------------------------- |
| `THAINAUTE_PUBLIC_URL`                 | serveur                   | non     | origine canonique exacte, sans chemin |
| `THAINAUTE_PUBLIC_INDEXING`            | serveur                   | non     | `disabled` ou `enabled`               |
| `THAINAUTE_RELEASE`                    | serveur                   | non     | identifiant court de release          |
| `THAINAUTE_SYNC_MODE`                  | serveur                   | non     | `disabled` ou `supabase`              |
| `NEXT_PUBLIC_SUPABASE_URL`             | web et serveur            | non     | URL publique du projet Supabase       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | web et serveur            | non     | clé publique soumise à RLS            |
| `EXPO_PUBLIC_SUPABASE_URL`             | mobile                    | non     | URL publique du même environnement    |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | mobile                    | non     | clé publique soumise à RLS            |
| `SUPABASE_SECRET_KEY`                  | serveur Next.js seulement | **oui** | accès serveur à la RPC restreinte     |

`SUPABASE_SECRET_KEY` est enregistrée comme variable sensible dans Vercel. Elle
n'est ni copiée dans EAS, ni préfixée par `NEXT_PUBLIC_`, ni téléchargée dans un
fichier commité. Les secrets RevenueCat et Stripe présents dans
`.env.example` restent hors périmètre tant que les tranches de paiement ne sont
pas commencées.

En production, `THAINAUTE_SYNC_MODE=supabase` exige les trois valeurs Supabase
web/serveur. Une configuration incomplète doit faire échouer la readiness et
laisser l'API de synchronisation indisponible, jamais basculer vers une écriture
non protégée.

## Sondes de santé

### `GET /api/v1/health/live`

- confirme que le Route Handler Node.js répond ;
- renvoie `200` avec `status: "ok"` et la release ;
- n'appelle pas Supabase et ne doit pas être utilisé pour conclure que la base
  fonctionne.

### `GET /api/v1/health/ready`

- vérifie l'origine publique, l'indexation, le mode de synchronisation et la
  présence des variables Supabase requises ;
- renvoie `200` si la configuration est cohérente, sinon `503` avec uniquement
  des codes de diagnostic fermés ;
- ne révèle aucune valeur de secret.

La readiness actuelle est une sonde de **configuration**, pas encore un test de
connexion à Auth/Postgres/Storage. Un contrôle synthétique séparé doit tester
la vraie dépendance en preview et en production sans créer de donnée sensible.
Les deux sondes sont non cachables et portent `nosniff`.

## Chemin de mise en service

Cette séquence est un runbook à exécuter seulement après autorisation :

1. créer les projets isolés et confirmer leurs régions, titulaires, MFA et
   contacts ;
2. configurer les variables par environnement dans les coffres Vercel/EAS ;
3. exécuter lint, types, tests, audit de production et build en CI Linux ;
4. démarrer Supabase local, appliquer les migrations, puis exécuter pgTAP, les
   tests RLS utilisateur A/utilisateur B/anonyme et les advisors ;
5. appliquer les migrations au projet de preview comme une tâche unique ;
6. déployer la preview avec indexation désactivée ;
7. vérifier `live`, `ready`, le scénario de synchronisation nominal, le rejeu
   du même lot et le refus d'une clé réutilisée avec un autre corps ;
8. vérifier qu'aucun token, email, corps de requête ou identifiant sensible
   n'apparaît dans les logs ;
9. tester sauvegarde/restauration et documenter le rollback applicatif ;
10. promouvoir manuellement la même release après go/no-go.

Un rollback Vercel réassigne une version applicative déjà construite. Une
migration de données n'est jamais annulée automatiquement avec le code : elle
est d'abord validée sur un environnement isolé et reste compatible avec la
version applicative précédente pendant la fenêtre de déploiement.

## Limites connues avant tout hébergement

- Aucun compte, projet, domaine, variable distante ou déploiement n'a été créé.
- Docker ou un runtime compatible n'est pas disponible localement ; les
  migrations, la RPC, RLS et pgTAP ne sont donc pas encore vérifiés en exécution.
- La politique de confiance de `answeredAt` reste `OPEN-SYNC-001`.
- Le DTO/API de contenu gratuit est expurgé et les payloads bruts restent côté
  serveur, mais aucun catalogue, téléchargement audio opaque ou contenu réel
  autorisé n'est encore branché. La relation exercice/item est désormais
  dérivée côté serveur ; elle ne constitue plus une porte ouverte.
- Les adaptateurs d'outbox sont durables mais aucun transport distant n'est
  activé ; la fusion anonyme→compte, la suppression au logout et les décisions
  `OPEN-SYNC-001`/`OPEN-SRS-001` restent des portes.
- La limitation de débit par utilisateur/IP et la rétention du registre
  d'idempotence restent des portes avant bêta distante.
- La sonde `ready` ne vérifie pas encore une connexion réelle à Supabase.
- EAS n'est pas encore configuré et aucun build distribué n'a été produit.
- La clearance de la marque et l'autorisation d'indexer restent des portes
  séparées de la réussite technique.

## Références officielles

- [Vercel — régions des Functions](https://vercel.com/docs/functions/configuring-functions/region)
- [Vercel — variables sensibles](https://vercel.com/docs/environment-variables/sensitive-environment-variables)
- [Supabase — régions disponibles](https://supabase.com/docs/guides/platform/regions)
- [Supabase — checklist de production](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase — développement local](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase — changement des privilèges Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Expo — EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo — variables d'environnement EAS](https://docs.expo.dev/eas/environment-variables/)
- [Cloudflare — mode DNS-only](https://developers.cloudflare.com/dns/proxy-status/)
