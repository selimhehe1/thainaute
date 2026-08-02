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
explicites, pgTAP, lint PL/pgSQL et Security Advisors restent des portes avant
promotion. Les Performance Advisors restent visibles et doivent être triés,
mais ne bloquent pas automatiquement une CI sans charge représentative.

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
| `EXPO_PUBLIC_API_URL`                  | mobile                    | non     | origine HTTPS de l’API Next.js        |
| `SUPABASE_SECRET_KEY`                  | serveur Next.js seulement | **oui** | accès élevé `service_role`/BYPASSRLS  |

`SUPABASE_SECRET_KEY` est enregistrée comme variable sensible dans Vercel. Elle
n'est ni copiée dans EAS, ni préfixée par `NEXT_PUBLIC_`, ni téléchargée dans un
fichier commité. Elle n'est utilisée que derrière les autorisations serveur et
les RPC explicitement accordées ; sa portée réelle reste élevée. Les secrets
RevenueCat et Stripe présents dans
`.env.example` restent hors périmètre tant que les tranches de paiement ne sont
pas commencées.

Le projet Supabase local utilise `supabase/templates/magic_link.html` pour
envoyer un OTP à six chiffres valable dix minutes. Dans un projet hébergé, le
modèle équivalent, l'URL autorisée et un SMTP adapté doivent être configurés et
testés dans Auth avant d'ouvrir la preview. Aucun contenu d'email ni adresse ne
doit apparaître dans les logs applicatifs.

La session native reste exclusivement dans SecureStore, fragmentée en valeurs
bornées pour tolérer les limites variables du trousseau. Une bascule de compte
pendant une synchronisation invalide la passe avant l'appel suivant : le sujet
de session doit toujours correspondre au propriétaire de l'outbox.

`EXPO_PUBLIC_API_URL` et l'URL Supabase mobile doivent être renseignées avec des
origines joignables depuis l'appareil : l'adresse LAN de la machine en
développement, `http://10.0.2.2:3000/` dans l'émulateur Android standard, ou les
origines HTTPS de la preview. Le HTTP n'est accepté que dans un bundle de
développement ; preview et production exigent HTTPS. `127.0.0.1` désigne le
téléphone lui-même et n'est donc pas fourni comme valeur par défaut.

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
- en mode `supabase`, sonde en parallèle Auth (`/auth/v1/health`) et la Data API
  avec une lecture `HEAD` sans rapatrier de ligne ; chaque dépendance est bornée
  à 2,5 secondes ;
- renvoie `200` uniquement si la configuration, Auth et la Data API sont prêts,
  sinon `503` avec des statuts et codes de diagnostic fermés ;
- en mode `disabled`, n'appelle aucune dépendance externe ;
- ne révèle aucune valeur de secret.

La sonde Data API traverse PostgREST et Postgres sans créer de donnée. Elle ne
valide ni Storage, ni l'envoi SMTP, ni la configuration hébergée des advisors :
ces dépendances conservent leurs contrôles synthétiques dédiés en preview. Les
deux contrôles distants utilisent la clé publiable et ne valident donc pas directement la
clé serveur ; le scénario connecté couvre ensuite son accès aux RPC. Les sondes
sont non cachables ; toute la surface `/api/v1` porte `nosniff`, une politique
de référent fermée, une CSP d'API et une Permissions Policy restrictive.

## Chemin de mise en service

Cette séquence est un runbook à exécuter seulement après autorisation :

1. créer les projets isolés et confirmer leurs régions, titulaires, MFA et
   contacts ;
2. configurer les variables par environnement dans les coffres Vercel/EAS ;
3. exécuter lint, types, tests, audit de production et build en CI Linux ;
4. démarrer Supabase local, appliquer les migrations, puis exécuter pgTAP, les
   tests RLS utilisateur A/utilisateur B/anonyme, `db:lint`, les Security
   Advisors bloquants et les Performance Advisors visibles ;
5. appliquer les migrations au projet de preview comme une tâche unique ;
6. relancer les advisors sur la preview hébergée, sans exposer ses identifiants,
   et résoudre tout finding de sécurité avant promotion ;
7. déployer la preview avec indexation désactivée ;
8. vérifier `live`, `ready`, le scénario de synchronisation nominal, le rejeu
   du même lot, le refus d'une clé réutilisée avec un autre corps, les quatre
   bornes temporelles de l'ADR-0010, l'impossibilité d'insérer `received_at`, la
   mise à jour de `app_version` sans nouvel appareil et la coupure d'une session
   A→B en cours de passe ;
9. vérifier qu'aucun token, email, corps de requête ou identifiant sensible
   n'apparaît dans les logs ;
10. tester sauvegarde/restauration et documenter le rollback applicatif ;
11. promouvoir manuellement la même release après go/no-go.

Un rollback Vercel réassigne une version applicative déjà construite. Une
migration de données n'est jamais annulée automatiquement avec le code : elle
est d'abord validée sur un environnement isolé et reste compatible avec la
version applicative précédente pendant la fenêtre de déploiement.

### Surveillance de la confiance temporelle

L'API accepte un nouvel `eventId` entre l'heure serveur moins trente jours et
l'heure serveur plus cinq minutes, bornes incluses. Une métrique agrégée peut
compter les rejets `invalid_submission`, mais aucun `eventId`, `answeredAt`,
email ou corps de requête ne doit être journalisé. Une hausse doit d'abord faire
vérifier l'horloge et la durée hors ligne des appareils, pas conduire à
réécrire silencieusement les heures clientes.

`received_at` est attribué par PostgreSQL et sert à l'audit. Avant promotion,
vérifier le privilège de colonne, la contrainte de défense
`[-31 jours, +10 minutes]` et l'index `(user_id, device_id)` avec pgTAP. La
marge SQL ne doit jamais être reprise comme règle produit côté client.

### Preuve connectée locale

Le job CI `database` démarre une stack Supabase locale complète sans afficher
ses clés, applique les migrations, exécute pgTAP et `db:lint`, puis charge la
fixture isolée `supabase/fixtures/connected_sync.sql`. Cette fixture est
strictement réservée au test : elle n'est ni une migration, ni un seed partagé,
ni un contenu publiable en production.

`pnpm test:e2e:web:connected` couvre ensuite, avec un seul worker et sans trace :

1. une readiness réelle d'Auth et de la Data API ;
2. un vrai OTP Supabase récupéré dans le Mailpit local ;
3. le consentement explicite à la fusion d'une tentative anonyme IndexedDB ;
4. l'enregistrement de l'appareil web, le snapshot et le commit autoritaire ;
5. un envoi Android via le client HTTP partagé, rejoué avec la même clé
   d'idempotence et le même corps ;
6. l'hydratation d'un second navigateur sans IndexedDB préalable ;
7. la relecture des deux événements par la Data API avec la clé publiable et le
   JWT utilisateur, donc sous RLS.

Les clés locales restent dans le processus de l'étape Bash : aucun `.env`,
secret GitHub, artefact, email, OTP ou Bearer n'est écrit ou journalisé. Cette
preuve valide le contrat transport/données Android ; elle ne remplace pas le
scénario Maestro dans une vraie application Expo.

### Portes des Database Advisors

La CLI Supabase est épinglée à `2.111.0`. Le job `database` exécute les portes
suivantes immédiatement après `pnpm db:lint`, avant le chargement de toute
fixture E2E :

- `pnpm db:advisors:security` inspecte la base locale avec
  `--type security --level warn --fail-on warn`. Tout finding de niveau `warn`
  ou `error` arrête la CI ;
- `pnpm db:advisors:performance` affiche tous les findings à partir de `info`
  avec `--fail-on none`. Sa sortie reste donc visible sans rendre la CI rouge,
  car certaines recommandations dépendent du volume et des requêtes réelles.

La réussite locale prouve la posture du schéma migré, pas la configuration
complète d'un projet hébergé. Les advisors doivent être relancés sur la preview
après migration et avant promotion. Un finding de performance est trié avec une
mesure et une décision documentée ; il n'est ni ignoré silencieusement, ni
« corrigé » par un index ou une policy sans vérifier le chemin de requête.

Cette tranche ne choisit volontairement ni les seuils de limitation de débit,
ni la durée de conservation des réponses idempotentes. `OPEN-API-001` et
`OPEN-SYNC-002` bloquent ces mécanismes avant la bêta distante sans empêcher
les contrôles locaux.

## Limites connues avant tout hébergement

- Aucun compte, projet, domaine, variable distante ou déploiement n'a été créé.
- Docker ou un runtime compatible n'est pas disponible localement. La CI
  GitHub exécute toutefois un démarrage Supabase complet, `db:reset`, pgTAP et
  `db:lint` ; ces contrôles ont validé les migrations, RPC, privilèges et RLS
  sur l'état poussé. Une exécution locale reste indisponible sur ce poste.
- Le DTO/API de contenu gratuit est expurgé et les payloads bruts restent côté
  serveur, mais aucun catalogue, téléchargement audio opaque ou contenu réel
  autorisé n'est encore branché. La relation exercice/item est désormais
  dérivée côté serveur ; elle ne constitue plus une porte ouverte.
- Le transport, la fusion anonyme→compte, le snapshot multi-appareil et la purge
  au logout sont implémentés. Leur parcours Auth/OTP, fusion, rejeu idempotent,
  hydratation multi-appareil et lecture RLS est exécuté contre Supabase local en
  CI. Un projet de preview, son SMTP et ses variables restent nécessaires pour
  la recette distante ; `OPEN-SRS-001` et `OPEN-OFFLINE-001` restent des portes
  pour leurs périmètres respectifs.
- Une déconnexion explicite depuis l’écran compte purge le namespace local
  après vérification du sujet de session et confirmation si nécessaire. Une
  mutation concurrente après cette confirmation annule la purge et laisse le
  journal verrouillé jusqu’à reconnexion. Une
  expiration ou révocation distante purge seulement un namespace déjà soldé ;
  les tentatives non confirmées restent verrouillées, et seule une reconnexion
  au même identifiant Supabase permet de les reprendre ou de les effacer.
- Sur web et mobile, chaque événement `SIGNED_OUT` reçu, chaque connexion depuis
  l’état déconnecté et chaque passage direct d’un utilisateur A à B incrémente
  une frontière de session qui purge aussi la prise vocale locale hors du
  callback Auth. Seuls le bootstrap `getSession()` et l’événement
  `INITIAL_SESSION` initialisent le premier sujet sans créer de fausse
  frontière ; tout autre premier `SIGNED_IN` est traité comme un changement.
  Une déconnexion dans un autre onglet est couverte dès sa
  propagation. Une révocation distante n’est observable qu’au prochain
  événement ou rafraîchissement Supabase : aucune purge antérieure à cette
  détection n’est garantie.
- L'enregistrement vocal local et la comparaison A/B sont implémentés sur web
  et mobile, sans persistance, synchronisation ni télémétrie. Les cycles
  contrôlés révoquent l'URL web ou rendent immédiatement le fichier natif
  non rejouable puis tentent son effacement ciblé dans le cache applicatif. iOS
  et Android dépendent du patch pnpm versionné d'`expo-audio`
  57.0.3 : Expo Go et `expo export` ne compilent pas ses changements Swift et
  Kotlin. L’autolinking force `expo-audio` depuis ses sources et la CI compile
  désormais un prebuild Android arm64 avec Gradle ainsi qu’un prebuild iOS
  simulateur avec CocoaPods/Xcode 26.4 sur macOS 26 ; ces deux jobs sont des
  portes de fusion. Le contrôle PR Android compile une ABI représentative ; un
  AAB de distribution devra conserver toutes les ABI prises en charge. Une vraie
  build native reconstruite sur appareils reste une porte de bêta.
  `pnpm --filter @thainaute/mobile run config:check` verrouille la surface de
  permissions sans accès Face ID, stockage externe, overlay, vibration ni
  audio de fond ; `native:check` verrouille l’arrêt sans reprise en
  arrière-plan et les callbacks de route du patch installé. Les interruptions,
  routes audio, Bluetooth, suppression native ciblée et absence de reprise
  doivent encore être vérifiées sur iPhone et
  Android réels ; un crash natif, ou le démontage après un refus d’effacement
  par le système, peut laisser un orphelin dans le cache jusqu'à la purge par
  l'OS, comme documenté dans l'ADR-0012.
- L’export portable synchrone du compte est disponible sur web et mobile via
  `GET /api/v1/account/export`. Il valide le Bearer auprès de Supabase Auth,
  lit uniquement les lignes du sujet sous RLS et refuse tout document tronqué
  ou rendu pendant un snapshot mouvant. Les réponses HTTP ne sont pas mises en
  cache. Le navigateur révoque son URL objet après le téléchargement ; le
  mobile remet un fichier JSON depuis un chemin ciblé du cache privé, puis en
  vérifie la suppression. Une interruption brutale peut laisser ce fichier
  jusqu’à la purge au prochain lancement/export ou celle du système. Le fichier
  remis par le navigateur ou le panneau natif relève ensuite de l’emplacement
  choisi par l’utilisateur. Voir l’ADR-0014 et la checklist
  `docs/privacy/account-export.md`.
- La limitation de débit par compte/IP n'est pas encore implémentée : ses
  seuils, fenêtres, rafales et comportement de repli relèvent de
  `OPEN-API-001` avant bêta distante.
- `private.attempt_sync_commits` conserve actuellement ses réponses sans purge
  temporelle. La durée minimale compatible avec les retries, la suppression et
  la supervision relèvent de `OPEN-SYNC-002` avant bêta distante.
- La sonde `ready` couvre Auth et Postgres via la Data API, mais pas encore
  Storage, l'envoi SMTP ni les réglages spécifiques au projet Supabase hébergé.
- EAS n'est pas encore configuré et aucun build distribué n'a été produit.
- L’identité mobile est réservée dans la configuration (`Thaïnaute`, slug et
  scheme `thainaute`, bundle/package `com.thainaute.app`, version `0.1.0`) mais
  aucun projet EAS, identifiant Apple ou fiche Google Play n’a été créé.
- La clearance de la marque et l'autorisation d'indexer restent des portes
  séparées de la réussite technique.

## Références officielles

- [Vercel — régions des Functions](https://vercel.com/docs/functions/configuring-functions/region)
- [Vercel — variables sensibles](https://vercel.com/docs/environment-variables/sensitive-environment-variables)
- [Supabase — régions disponibles](https://supabase.com/docs/guides/platform/regions)
- [Supabase — checklist de production](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase — développement local](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase — Database Advisors](https://supabase.com/docs/guides/database/database-advisors)
- [Supabase CLI 2.111.0 — notes de version](https://github.com/supabase/cli/releases/tag/v2.111.0)
- [Supabase — changement des privilèges Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Expo — EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo — variables d'environnement EAS](https://docs.expo.dev/eas/environment-variables/)
- [Cloudflare — mode DNS-only](https://developers.cloudflare.com/dns/proxy-status/)
