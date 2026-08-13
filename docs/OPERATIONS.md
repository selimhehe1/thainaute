# Guide d'exploitation et cible d'hébergement

- Statut : cible technique acceptée ; un projet Supabase de développement
  existe et porte les 13 migrations
- Date de vérification documentaire : 2026-08-13
- Portée : MVP et première bêta ; à réévaluer avant la production

Ce guide applique le brief sans autoriser un déploiement. Toute ouverture de
compte, création de projet, dépense, modification DNS, publication ou action de
production nécessite encore une instruction explicite du fondateur.

## Projet Supabase de développement

`thainaute-dev`, référence `minvwksilqikqvgbpwsd`, région `eu-west-3`, créé le
2 août 2026 dans l'organisation `Hehe`, plan `free`. Aucune facturation n'est
possible sur ce plan. C'est un bac à sable de développement : il ne contient
aucune donnée réelle et ne doit jamais en contenir.

Supabase met en pause les projets gratuits inutilisés. Le projet peut donc être
`INACTIVE` au retour ; il se réveille par le tableau de bord ou par l'API, et le
réveil prend quelques minutes.

**Ne rien mesurer pendant un réveil.** Une base encore en `COMING_UP` répond aux
requêtes tout en présentant un état incomplet : le 13 août elle a rapporté zéro
table publique et aucun schéma d'historique alors qu'elle en portait neuf et un.
Attendre `ACTIVE_HEALTHY`, ou recouper avant de conclure.

### État vérifié le 13 août 2026

Les 13 migrations du dépôt sont appliquées, et leur contenu a été comparé aux
fichiers par empreinte MD5 sur une normalisation qui ignore espaces et
points-virgules : les 13 sont identiques au dépôt.

Les advisors hébergés ne remontent **aucun constat en `WARN` ni `ERROR`**, ni en
sécurité ni en performance. La posture hébergée vaut donc celle que la CI vérifie
en local.

Les neuf tables de `public` ont toutes RLS activé. Quatre d'entre elles
(`audio_assets`, `content_reports`, `learning_items`, `lesson_versions`) n'ont
aucune politique, ce que l'advisor signale en `INFO` : c'est voulu, et ce n'est
pas une faille, car ces quatre tables n'accordent **aucun droit** à `anon` ni à
`authenticated`. Deux verrous indépendants les ferment, et tout accès passe par
des fonctions serveur. Les autres constats de performance sont des index jamais
utilisés, ce qui n'a aucun sens sur une base sans lignes ni requêtes.

### Le piège des versions de migration

Le 2 août, les neuf premières migrations ont été appliquées par une route qui
**réhorodate** les versions à l'heure d'application au lieu de conserver celles
des noms de fichiers. `supabase db push` ne reconnaissait donc aucune des neuf et
refusait d'avancer.

La réparation a consisté à réécrire la colonne `version` de
`supabase_migrations.schema_migrations` pour la faire correspondre aux noms de
fichiers, après avoir prouvé par empreinte que le contenu appliqué était bien
celui du dépôt. Aucune table, aucune donnée et aucune politique n'ont été
touchées.

**Toujours appliquer les migrations avec `supabase db push`**, jamais par un
outil qui régénère les versions, sous peine de rendre l'historique distant
irréconciliable avec le dépôt.

Le `db push` du 13 août affiche des erreurs Docker : elles concernent un cache
local optionnel, arrivent après l'application, et n'empêchent rien. La ligne qui
compte est `Finished supabase db push.`

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

| Variable                               | Surface                   | Secret  | Rôle                                          |
| -------------------------------------- | ------------------------- | ------- | --------------------------------------------- |
| `THAINAUTE_PUBLIC_URL`                 | serveur                   | non     | origine canonique exacte, sans chemin         |
| `THAINAUTE_PUBLIC_INDEXING`            | serveur                   | non     | `disabled` ou `enabled`                       |
| `THAINAUTE_RELEASE`                    | serveur                   | non     | identifiant court de release                  |
| `THAINAUTE_SYNC_MODE`                  | serveur                   | non     | `disabled` ou `supabase`                      |
| `THAINAUTE_CONTENT_REPORT_MODE`        | serveur                   | non     | `disabled` ou `supabase`                      |
| `THAINAUTE_PUBLIC_CONTENT_MODE`        | serveur                   | non     | `disabled` ou `supabase`                      |
| `THAINAUTE_PUBLIC_CONTENT_RELEASE_ID`  | serveur                   | non     | UUID de la release publique active            |
| `THAINAUTE_LANGUAGE_PACK`              | build web/mobile          | non     | identifiant du pack cible                     |
| `NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK`  | web client                | non     | copie publique du pack actif                  |
| `THAINAUTE_STUDIO_MODE`                | serveur                   | non     | `disabled` ou `fixture`                       |
| `THAINAUTE_BILLING_MODE`               | serveur                   | non     | `disabled`, `stripe_test` ou `stripe_live`    |
| `NEXT_PUBLIC_SUPABASE_URL`             | web et serveur            | non     | URL publique du projet Supabase               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | web et serveur            | non     | clé publique soumise à RLS                    |
| `EXPO_PUBLIC_SUPABASE_URL`             | mobile                    | non     | URL publique du même environnement            |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | mobile                    | non     | clé publique soumise à RLS                    |
| `EXPO_PUBLIC_API_URL`                  | mobile                    | non     | origine HTTPS de l’API Next.js                |
| `SUPABASE_SECRET_KEY`                  | serveur Next.js seulement | **oui** | accès élevé `service_role`/BYPASSRLS          |
| `ACCOUNT_DELETION_RECEIPT_PEPPER`      | serveur Next.js seulement | **oui** | HMAC des reçus de suppression                 |
| `REVENUECAT_WEBHOOK_AUTHORIZATION`     | serveur Next.js seulement | **oui** | autorisation exacte des webhooks RevenueCat   |
| `REVENUECAT_WEBHOOK_SIGNING_SECRET`    | serveur Next.js seulement | **oui** | secret HMAC du webhook RevenueCat             |
| `REVENUECAT_ALLOWED_APP_IDS`           | serveur Next.js seulement | non     | App IDs RevenueCat autorisés, séparés par `,` |
| `STRIPE_RESTRICTED_KEY`                | serveur Next.js seulement | **oui** | clé restreinte Stripe test/live               |
| `STRIPE_WEBHOOK_SECRET`                | serveur Next.js seulement | **oui** | secret de signature du webhook Stripe         |
| `STRIPE_PREMIUM_PRICE_ID`              | serveur Next.js seulement | non     | prix récurrent Premium déjà créé              |
| `STRIPE_LIVE_CONFIRMATION`             | serveur Next.js seulement | non     | doit valoir `ENABLE_STRIPE_LIVE`              |

`SUPABASE_SECRET_KEY` est enregistrée comme variable sensible dans Vercel. Elle
n'est ni copiée dans EAS, ni préfixée par `NEXT_PUBLIC_`, ni téléchargée dans un
fichier commité. Elle n'est utilisée que derrière les autorisations serveur et
les RPC explicitement accordées ; sa portée réelle reste élevée. Les secrets
RevenueCat et Stripe présents dans `.env.example` restent absents des builds
clients. Les routes de paiement restent fermées par défaut avec
`THAINAUTE_BILLING_MODE=disabled` et par une capacité serveur codée en dur,
indépendante des variables ; aucun secret, prix ou endpoint distant n'a été
créé dans cette tranche.

### Socle de facturation sans encaissement réel

Le web utilise Checkout Sessions Stripe en mode abonnement et Customer Portal ;
les mobiles recevront leurs événements via
`POST /api/v1/billing/revenuecat/webhook`. Les deux fournisseurs alimentent le
même miroir privé `entitlements_cache` avec l'entitlement unique `premium`.
Le webhook RevenueCat exige à la fois l'autorisation statique et le HMAC
`X-RevenueCat-Webhook-Signature` du corps brut, refuse les App IDs absents de
`REVENUECAT_ALLOWED_APP_IDS` et attend `SANDBOX` en `stripe_test`, puis
`PRODUCTION` en `stripe_live`. Le webhook Stripe vérifie sa signature et le
champ `livemode`. Les événements sont dédupliqués par `(provider, event_id)` et
les événements plus anciens sont ignorés. Le statut du compte passe par
`GET /api/v1/billing/status` ; aucun client ne lit les tables privées.
Avant d'accorder `invoice.paid`, le serveur relit la Subscription et son prix
chez Stripe. La clé restreinte doit donc autoriser au minimum la lecture des
Subscriptions, en plus des créations Checkout, Customer et Customer Portal
nécessaires aux routes ; aucune permission d'écriture Subscription directe
n'est requise par ce socle.

`BILLING_PROVIDER_ACTIONS_CAPABILITY.enabled` reste explicitement à `false`
dans le code serveur. Les routes Checkout, Portal, statut, webhook Stripe et
webhook RevenueCat vérifient cette capacité avant toute construction de leurs
dépendances. Même avec une configuration `stripe_test` ou `stripe_live`
complète, elles répondent donc `503 billing_unavailable` sans contacter Stripe,
RevenueCat ou Supabase. La readiness expose séparément
`billing_provider_actions_not_approved` : elle documente le blocage mais ne
constitue pas elle-même le contrôle d'exécution. La capacité ne pourra être
ouverte qu'après l'agrégation autoritaire par fournisseur/abonnement, l'ajout
de la facturation à l'export de compte, la coordination durable de suppression
chez les deux fournisseurs et la validation de la matrice sandbox.

Le mode `stripe_test` est réservé à une sandbox explicitement configurée avec
un prix et des secrets de test. Le mode `stripe_live` exige une origine HTTPS et
`STRIPE_LIVE_CONFIRMATION=ENABLE_STRIPE_LIVE`, mais cette validation technique
ne résout ni `OPEN-PRICE-001`, ni `OPEN-TAX-001`, ni les règles de publication
Apple/Google. Il ne faut donc pas renseigner ces variables ou brancher un
webhook distant avant le go/no-go légal et commercial.

Turborepo fonctionne en mode d'environnement strict. Les variables publiques
et les modes `THAINAUTE_*` déclarés dans `turbo.json` sont donc transmis aux
tâches et participent à leur clé de cache. Les secrets serveur n'entrent pas
dans les builds mobiles : ils sont autorisés uniquement pour la tâche
`@thainaute/web#dev` lancée depuis la racine, puis injectés directement par la
plateforme au runtime déployé. Toute nouvelle variable qui façonne un build doit
être ajoutée explicitement à cette politique avant activation.

### Consentement analytics local

Cette tranche n'ajoute aucune variable analytics. Les providers web et mobile
utilisent un sink nul, même après un accord : aucune requête, cookie, clé projet
ou identifiant fournisseur n'est créé. La préférence versionnée est conservée
dans `localStorage` sous `thainaute.analytics-consent.v1` sur le web et dans la
clé `analytics_consent_v1` de `local_metadata` sur mobile. Un refus mobile est
conservé sous `analytics_consent_denied_v1` comme tombstone prioritaire sur tout
ancien accord ; un nouvel accord remplace le snapshot et retire ce tombstone
dans la même transaction. Ces valeurs ne contiennent ni compte, ni contenu, ni
donnée de session.

Avant d'activer un transport distant, créer une tranche distincte qui documente
au minimum le fournisseur et sa région, la clé publique attendue, la rétention,
le registre de sous-traitance, la purge de l'identifiant local, les CSP/egress,
les tests de retrait et la mise à jour de la politique de confidentialité. Une
clé ou un SDK présent ne doit jamais suffire à contourner l'état `unknown` ou
`denied`. Le snapshot v1, même `granted`, n'autorise aucun transport distant :
la tranche doit incrémenter le schéma, invalider les anciens accords vers
`unknown` sans migration implicite, puis recueillir un nouveau consentement
informé avant la première requête. La purge d'identifiant du fournisseur devra
être idempotente et sérialisée ; aucune réactivation ne pourra précéder la fin
d'une purge déjà lancée, même après un remontage du provider.

`ACCOUNT_DELETION_RECEIPT_PEPPER` contient exactement 32 octets aléatoires
encodés en base64url canonique sans `=` (43 caractères). Il est distinct de
toute clé Supabase, Stripe ou RevenueCat et n'est jamais envoyé au navigateur
ou à Expo. Sa rotation exige une fenêtre de lecture de l'ancienne version tant
que des reçus peuvent être rejoués ; aucune rotation destructive n'est donc
permise avant d'avoir fixé leur rétention dans `OPEN-SYNC-002`.

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
web/serveur, le pepper de suppression et l'UUID explicite de la release active.
La route de tentative recoupe chaque version avec cette release, même lorsque la
livraison publique reste désactivée. Une configuration incomplète doit faire
échouer la readiness et laisser les API synchronisées indisponibles, jamais
basculer vers une écriture non protégée.

Les signalements linguistiques restent désactivés par défaut. Le mode
`THAINAUTE_CONTENT_REPORT_MODE=supabase` ouvre seulement la capacité de preview
`POST /api/v1/content/reports` aux comptes permanents. Son corps fermé contient
la version, l'exercice, une catégorie prédéfinie et la plateforme ; aucun texte
libre, audio, email ou identifiant d'item fourni par le client n'est accepté.
La clé serveur reste confinée au Route Handler et à la RPC explicitement
accordée. Tant que les seuils compte/IP de `OPEN-API-001` ne sont pas décidés et
implémentés, ce mode ajoute l'issue de readiness
`content_report_rate_limit_missing` : la preview peut être testée, mais ne peut
pas être déclarée prête ni promue. Il ajoute aussi
`content_report_sync_required` si `THAINAUTE_SYNC_MODE` n'est pas `supabase` :
le Route Handler refuse alors toute collecte, même si les clés Supabase sont
présentes. Une readiness dégradée ne constitue jamais l'unique barrière entre
la collecte et la base commune d'export/suppression.

La livraison publique reste elle aussi désactivée par défaut.
`THAINAUTE_PUBLIC_CONTENT_MODE=supabase` exige l'URL Supabase, la clé serveur et
un `THAINAUTE_PUBLIC_CONTENT_RELEASE_ID` UUID explicite. Les routes servent alors
le manifeste courant, ses leçons expurgées et l'audio privé par identifiants
opaques. La progression personnelle par exercice et la preview connectée exigent
en plus `THAINAUTE_SYNC_MODE=supabase`, sa clé publiable et le pepper de
suppression. Une ligne incohérente invalide toute la release ; aucun fallback
vers la fixture du build n'est permis. Tant que `OPEN-API-001` reste ouvert, l'issue
`public_content_rate_limit_missing` maintient la readiness en échec et interdit
une promotion distante. Les écrans `/learn/connected` et
`/connected-lesson` restent identifiés comme previews techniques. Voir
l'ADR-0020.

Le bootstrap audio est exclusivement local. Il faut placer dans le même
processus `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` et
`THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP=1`, puis exécuter
`pnpm fixture:bootstrap-local-audio`. Le script refuse toute cible autre qu'une
boucle locale, contrôle le fichier avant et après upload et ne révèle aucune
clé. Cette commande n'est jamais utilisée contre une preview hébergée.

Le studio reste désactivé par défaut. `THAINAUTE_STUDIO_MODE=fixture` ouvre
uniquement le préflight de la fixture technique et exige Auth ainsi que le rôle
`content_editor` dans `app_metadata`, relu en direct. Le dépôt n'attribue ce
rôle à aucun compte. La clé serveur est également requise pour joindre les
agrégats historiques de `content_reports`, indépendamment de l'activation des
nouvelles soumissions ; une absence de configuration ferme la route au lieu
d'afficher un faux zéro. Ce mode ne permet ni import, ni édition, ni écriture
en base, ni publication et la page reste non indexable. Voir l'ADR-0017.

## Sondes de santé

### `GET /api/v1/health/live`

- confirme que le Route Handler Node.js répond ;
- renvoie `200` avec `status: "ok"` et la release ;
- n'appelle pas Supabase et ne doit pas être utilisé pour conclure que la base
  fonctionne.

### `GET /api/v1/health/ready`

- vérifie l'origine publique, l'indexation, les modes de synchronisation, de
  signalement, de contenu public et de studio, les variables Supabase et le
  pepper de suppression
  requis ;
- en mode `supabase`, sonde la Data API avec une lecture `HEAD` sans rapatrier
  de ligne et sonde aussi Auth (`/auth/v1/health`) dès qu'une capacité de compte
  est active ; le mode contenu public seul n'active pas la sonde Auth ; chaque
  dépendance est bornée à 2,5 secondes ;
- renvoie `200` uniquement si la configuration et toutes les dépendances requises
  par les capacités actives sont prêtes, sinon `503` avec des statuts et codes
  de diagnostic fermés ;
- lorsque synchronisation, signalements, contenu public et studio sont
  désactivés, n'appelle aucune dépendance externe ; le studio fixture sonde Auth
  et son agrégat `content_reports` ;
- ne révèle aucune valeur de secret.

Les sondes Data API traversent PostgREST et Postgres sans créer ni lire de
donnée. La synchronisation vérifie `content_releases` avec la clé publiable et
`content_reports` en `HEAD` avec la clé serveur dans `apikey`, car l'export de
compte v2 dépend de cette table même lorsque les
nouvelles soumissions sont désactivées. Une preview de signalement sans
synchronisation exécute elle aussi cette seconde sonde. Pour la CLI locale, la
clé JWT historique `service_role` est également portée dans `Authorization` ;
une clé opaque `sb_secret_` ne l'est jamais. Une migration ou un `GRANT` manquant
ferme donc la readiness. Aucune valeur de clé ne rejoint la réponse ou les logs.
Cette preuve ne valide pas encore l'exécution de la RPC, Storage,
l'envoi SMTP ni la configuration hébergée des advisors ; pgTAP et le scénario
connecté couvrent ces portes en preview. Les sondes sont non cachables ; toute
la surface `/api/v1` porte `nosniff`, une politique de référent fermée, une CSP
d'API et une Permissions Policy restrictive.

Les pages du produit portent également `nosniff`, une politique de référent
`strict-origin-when-cross-origin` et une CSP documentaire minimale qui interdit
l'intégration en frame, les changements de base hors origine et les objets
embarqués. Cette CSP ne définit volontairement ni `default-src`, ni
`script-src`, ni `style-src` : les scripts, styles et polices gérés par Next.js
restent fonctionnels sans nonce artificiel. La Permissions Policy des pages
réserve le microphone à la même origine pour les exercices vocaux et désactive
l'API Payment ; le Checkout Stripe hébergé reste une redirection vers Stripe et
n'utilise ni Stripe.js ni l'API Payment dans la page Thaïnaute.

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

Pour le scénario UI connecté, la même étape crée ensuite un bucket Storage
privé strictement local via `pnpm fixture:bootstrap-local-audio`. L'objet est
relu et vérifié par taille et SHA-256 avant le démarrage de Next.js. Cette
création locale ne documente ni n'autorise aucun bucket hébergé.

Les trois scénarios connectés envoient quatre OTP dans la même stack. La limite
`auth.rate_limit.email_sent = 10` de `supabase/config.toml` leur laisse une
marge locale bornée ; elle ne choisit ni ne documente le seuil d'un projet
hébergé, qui reste une porte sécurité distincte avant bêta.

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

`pnpm test:e2e:web:connected:ui` traverse ensuite le manifeste, la leçon,
l'audio privé vérifié, la tentative et la progression à 25 %. Un second contexte
de navigateur réutilise uniquement la session Auth, sans IndexedDB, puis relit
la projection autoritaire : il ne réutilise ni cache de contenu ni ancien OTP.

Le même job redémarre ensuite le serveur avec
`THAINAUTE_CONTENT_REPORT_MODE=supabase` pour exécuter isolément
`pnpm test:e2e:web:connected:reports` (`connected-content-report.spec.ts`). Ce
scénario crée un compte permanent et son profil, obtient `received` puis
`duplicate`, vérifie la collision HTTP 409, l'export v2 de l'unique ligne et le
refus de toute lecture directe de `content_reports` avec la clé publiable et le
JWT utilisateur. Le scénario de synchronisation conserve les modes contenu
public et signalement désactivés, avec une readiness à 200 ; les scénarios UI
et signalement acceptent volontairement la readiness non prête imposée par
`OPEN-API-001` sans la contourner. En local, la commande reports
exige que `THAINAUTE_CONTENT_REPORT_MODE=supabase` soit défini dans le même
processus que Playwright ; sinon le scénario est explicitement ignoré.

Les clés locales restent dans le processus de l'étape Bash : aucun `.env`,
secret GitHub, artefact, email, OTP ou Bearer n'est écrit dans le dépôt ou les
artefacts, ni journalisé par l'application. Mailpit conserve temporairement les
emails et OTP locaux nécessaires aux scénarios. Cette preuve valide le contrat
transport/données Android ; elle ne remplace pas le scénario Maestro dans une
vraie application Expo.

La preuve native locale est portée par :

```powershell
pnpm test:e2e:mobile:connected
```

Le pilote refuse plusieurs appareils et exige un unique émulateur Android. Il
remet la base Supabase locale à zéro, charge la fixture et son audio, démarre
des serveurs Next.js et Metro isolés, construit puis installe une APK debug et
crée un compte synthétique via le Mailpit local. Il coupe ensuite le réseau,
soumet une tentative dans l'outbox SQLite, force l'arrêt de l'application et
atteste la reprise hors ligne. À la reconnexion, un proxy loopback coupe la
première réponse seulement après le commit serveur ; le second envoi doit être
strictement identique et ne produire qu'un effet de progression. Enfin, un
contexte Playwright neuf retrouve exactement `attemptCount`, `masteryPermille`,
`status` et `dueAt` avec le même compte, puis contrôle l'isolation RLS A/B et
anonyme.

Les commandes Next.js et Metro sont fixes, possédées par le pilote et liées au
loopback ; les variables `THAINAUTE_QA_WEB_COMMAND_JSON` et
`THAINAUTE_QA_METRO_COMMAND_JSON` sont refusées. Seul le build APK peut employer
le hook local sans shell `THAINAUTE_QA_APK_BUILD_COMMAND_JSON`.

Sous Linux Desktop ou rootless, si le daemon n'écoute pas sur
`/var/run/docker.sock`, fournir explicitement un endpoint Unix local absolu,
par exemple `DOCKER_HOST=unix:///chemin/absolu/local.sock`. Les endpoints Docker
TCP/SSH et les contextes distants sont refusés ; le garde remplace cet endpoint
uniquement dans l'environnement des enfants Docker proxifiés.

L'email synthétique et l'OTP ne sont jamais transmis à Maestro. Le pilote les
saisit caractère par caractère par des keyevents Android envoyés sur un stdin
borné, sans valeur sensible dans les arguments, les variables Maestro, les
traces ou les captures ; le handler React efface le champ avant son premier
`await`, puis le pilote attend ce traitement avant toute nouvelle étape
Maestro. L'OTP n'est jamais écrit dans le handoff. Le handoff Android → web est un fichier
privé, borné et à usage unique sous le répertoire temporaire du système. Il
contient uniquement sa version de schéma, l'email synthétique et les quatre
valeurs de progression attendues ; il ne contient ni OTP, ni token, ni
identifiant de ligne et doit être consommé puis supprimé. Traces, vidéos et
captures de ce parcours sont désactivées. Le nettoyage force l'arrêt de
l'application, efface ses données privées, restaure le mode avion, retire le
reverse ADB et arrête uniquement les processus créés par le pilote. Un échec de
nettoyage conserve l'erreur primaire et nomme seulement l'étape locale
concernée.

Cette recette ne prouve ni iOS, ni un appareil Android physique, ni Supabase
hébergé. Ces preuves restent obligatoires avant une bêta distante.

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

- Un projet Vercel (`thainaute`, région `cdg1`, racine `apps/web`) et un projet
  Supabase de développement (`thainaute-dev`, plan gratuit, `eu-west-3`)
  existent. Le web est déployé en préversion par branche et en production
  depuis `main`. Aucun domaine n'est acheté, aucun projet EAS n'est créé, et
  aucune migration n'est poussée vers le Supabase hébergé : celui-ci ne sert
  aujourd'hui à aucun mode serveur, qui restent tous `disabled`.
- Docker n'est pas disponible sur le poste du fondateur, mais le job CI
  `database` démarre Supabase, exécute `db:reset`, pgTAP, `db:lint` et les
  advisors sur chaque PR, et il passe. La migration de suppression et ses 62
  assertions pgTAP sont donc une porte réellement obtenue en intégration, pas
  seulement une analyse statique. Le blocage de facturation GitHub qui figurait
  ici a été levé le 2 août 2026 ; seuls les jobs natifs restent conditionnés au
  cron hebdomadaire, au label `native` et au déclenchement manuel, parce qu'un
  runner macOS est facturé dix fois.
- Le manifeste, les leçons expurgées et le téléchargement audio opaque sont
  branchés sur une release explicitement configurée et vérifiés avec la fixture
  locale. La livraison serveur ne publie encore aucun catalogue thaï réel : les
  cinq leçons signées de l'unité 1 sont servies par les paquets compilés du
  dépôt, pas par une release Supabase. La relation exercice/item est dérivée
  côté serveur ; elle ne constitue plus une porte ouverte.
- Le Studio de prépublication est masqué par défaut. En mode `fixture`, il
  relit le rôle `content_editor` dans `app_metadata` puis affiche uniquement un
  rapport borné de la fixture technique. Il ne persiste aucun brouillon, ne
  modifie aucune release et ne résout pas `OPEN-CONTENT-001`. Un workflow
  éditorial immuable et transactionnel reste nécessaire avant tout corpus réel.
- Le transport, la fusion anonyme→compte, le snapshot multi-appareil et la purge
  au logout sont implémentés. Le job CI couvre leur parcours Auth/OTP, fusion,
  rejeu idempotent, hydratation multi-appareil et lecture RLS contre Supabase
  local, mais cette porte n'a pas encore été obtenue à cause du blocage de
  facturation indiqué ci-dessus. Un projet de preview, son SMTP et ses variables
  restent nécessaires pour la recette distante ; `OPEN-SRS-001` et
  `OPEN-OFFLINE-001` restent des portes pour leurs périmètres respectifs.
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
  lit la progression du sujet sous RLS et ses signalements avec la clé serveur,
  un filtre propriétaire explicite et une validation ligne par ligne. Le format
  fermé `thainaute.account-export/v2` refuse tout document tronqué ou rendu
  pendant un snapshot mouvant. Les réponses HTTP ne sont pas mises en cache. Le
  navigateur révoque son URL objet après le téléchargement ; le
  mobile remet un fichier JSON depuis un chemin ciblé du cache privé, puis en
  vérifie la suppression. Une interruption brutale peut laisser ce fichier
  jusqu’à la purge au prochain lancement/export ou celle du système. Le fichier
  remis par le navigateur ou le panneau natif relève ensuite de l’emplacement
  choisi par l’utilisateur. Voir les ADR-0014 et ADR-0019 ainsi que la checklist
  `docs/privacy/account-export.md`.
- La suppression de compte est exposée par `DELETE /api/v1/account` avec OTP
  récent, reçu privé reprenable et hard delete Auth. La continuation de 32
  octets est persistée seulement sur l'appareil initiateur, jamais renvoyée ni
  journalisée, puis supprimée après la purge locale du namespace compte. Le
  schéma actuel ne contient aucun bucket Storage utilisateur : toute future
  migration de fichiers privés devra compléter le registre de purge avant sa
  fusion. Sur l'appareil initiateur, un tombstone SHA-256 opaque est posé dans
  la même transaction que la purge du namespace compte ; il ferme les réponses
  sync tardives et les autres onglets sans contenir l'UUID brut. Une suppression
  manuelle de tout le stockage local ou une réinstallation efface aussi ce
  tombstone. La durée de conservation des reçus et la rotation du pepper restent
  bloquées par `OPEN-SYNC-002`; voir l'ADR-0016 et
  `docs/privacy/account-deletion.md`.
- La limitation de débit par compte/IP n'est pas encore implémentée : ses
  seuils, fenêtres, rafales et comportement de repli relèvent de
  `OPEN-API-001` avant bêta distante. L'activation Supabase des signalements
  rend donc explicitement la readiness non prête avec
  `content_report_rate_limit_missing` ; le mode doit rester `disabled` dans
  tout environnement promouvable jusque-là.
- Les outboxes de signalement lisent l'ancien format v1 et écrivent le format
  fermé `thainaute.content-report-outbox/v2`. Seuls
  `409/idempotency_key_reused` et `422/invalid_request` placent la tête en état
  rejeté durable. Elle n'est jamais supprimée automatiquement : le compte et le
  panneau l'affichent séparément des reports pendants, puis une action
  utilisateur compare le rejet exact avant de le retirer et de reprendre les
  suivants. Auth, suppression, transport, `408`, `429`, `5xx` et violations de
  protocole restent non retirables. Aucun analytics n'est émis pour un rejet ou
  son retrait ; seuls les accusés `received|duplicate` sont mesurés.
- Le flux SQLite → HTTP → accusé est couvert par tests unitaires React Native
  et le parcours Maestro canonique passe sur l'émulateur Android local avec la
  build release installée. La recette iOS sur appareil réel, ainsi qu'une
  vérification native connectée au Supabase hébergé, restent des portes avant
  bêta distante ; la preuve Android locale est consignée dans
  `docs/qa/native-android-maestro-2026-08-07.md`.
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
- [Expo — SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [CNIL — règles relatives aux cookies et autres traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles)
- [Cloudflare — mode DNS-only](https://developers.cloudflare.com/dns/proxy-status/)
