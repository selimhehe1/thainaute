# Thaïnaute — cahier des charges produit et technique

- Statut : proposition prête à lancer, sous réserve de validation juridique du nom
- Version : 1.0
- Date : 1er août 2026
- Marché initial : francophones apprenant le thaï
- Plateformes : site public, application web, iOS et Android
- Modèle : freemium généreux, sans publicité intrusive
- Source de vérité produit : ce document

## 1. Décision de marque

### Nom recommandé

**Thaïnaute**

- Nom de l'application iOS et Android : `Thaïnaute`
- Sous-titre de boutique : `Le thaï pensé en français`
- Nom du site : `Thaïnaute`
- Titre SEO principal : `Thaïnaute — Apprendre le thaï en français`
- Domaine principal recommandé : `thainaute.com`
- Domaines défensifs à rediriger : `thainaute.fr` et `thainaute.app`
- Identifiant interne provisoire : `thainaute`
- Bundle ID iOS provisoire : `com.thainaute.app`
- Application ID Android provisoire : `com.thainaute.app`

### Pourquoi ce nom

`Thaïnaute` assemble « thaï » et le suffixe « -naute », qui évoque l'exploration. Le nom est immédiatement compréhensible par un francophone, distinctif, mémorisable et cohérent avec un parcours visuel où l'apprenant explore progressivement la langue.

La marque doit toujours être écrite `Thaïnaute` dans les interfaces. Les domaines, identifiants techniques et comptes sociaux utilisent `thainaute` sans accent.

### Signature de marque

> **Le thaï, enfin pensé en français.**

Promesse secondaire :

> Écouter, parler et lire le vrai thaï — dix minutes à la fois.

### Contrôle préliminaire effectué le 1er août 2026

| Surface | Résultat exact observé | Méthode |
|---|---|---|
| Web public | Aucun produit ou service exact pertinent trouvé pour `Thaïnaute` ou `Thainaute` | Recherche exacte multi-moteurs |
| Apple App Store France | 0 résultat logiciel pour `thainaute` | [Apple Search API](https://itunes.apple.com/search?term=thainaute&country=fr&entity=software&limit=200) |
| Google Play France | La recherche affichait « Aucun résultat pour thainaute » | [Recherche Google Play](https://play.google.com/store/search?q=thainaute&c=apps&hl=fr&gl=FR) |
| `thainaute.com` | Réponse RDAP 404, donc aucun enregistrement visible à l'instant du contrôle | [Registre Verisign](https://rdap.verisign.com/com/v1/domain/thainaute.com) |
| `thainaute.fr` | Réponse RDAP 404 | [Registre Afnic](https://rdap.nic.fr/domain/thainaute.fr) |
| `thainaute.app` | Réponse RDAP 404 | [Google Registry](https://pubapi.registry.google/rdap/domain/thainaute.app) |
| Marques exactes indexées | Aucun résultat exact public trouvé | Recherches INPI, EUIPO/TMview et web |

Ces vérifications écartent les collisions visibles, mais **ne constituent ni une réservation ni une recherche d'antériorité juridique**. La disponibilité peut changer à tout moment et une marque proche phonétiquement peut être opposable.

### Porte de validation obligatoire avant annonce publique

1. Lancer une recherche d'antériorité exacte, phonétique et visuelle auprès de l'[INPI](https://data.inpi.fr/marques), d'[EUIPO/TMview](https://www.tmdn.org/tmview/) et, si nécessaire, de la [base mondiale de l'OMPI](https://branddb.wipo.int/).
2. Faire confirmer les classes pertinentes par un professionnel ; les classes 9, 41 et 42 sont les candidates évidentes pour logiciel, éducation et service en ligne.
3. Réserver le même jour les trois domaines, les identifiants sociaux et les fiches de boutiques.
4. Déposer la marque avant une communication significative.

Le service public rappelle qu'une recherche de disponibilité sert justement à vérifier marques, dénominations et domaines avant lancement : [outil officiel](https://entreprendre.service-public.gouv.fr/vosdroits/R20292).

## 2. Convention de décision

- `LOCKED` : ne pas modifier sans accord explicite du fondateur.
- `OPEN` : décision à prendre avant la fonctionnalité concernée.
- `DEFERRED` : volontairement reporté après le MVP.
- `REQUIREMENT` : exigence testable.

## 3. Résumé du produit

Thaïnaute est une plateforme d'apprentissage du thaï conçue d'abord pour l'oreille francophone. Le site public attire par des contenus utiles et indexables. L'application web et les applications iOS/Android partagent le même compte, le même parcours, la même progression et les mêmes droits Premium.

Le produit ne doit pas être un clone générique de Duolingo. Son avantage est la combinaison de quatre éléments rarement bien réunis en français :

1. explications phonétiques pensées pour un francophone ;
2. travail sérieux des tons et de la longueur vocalique ;
3. thaï réellement parlé, avec registre et contexte ;
4. contenu traçable, versionné et auditable.

## 4. Positionnement économique

### Gratuit — utile jusqu'au bout

- une nouvelle leçon guidée par jour ;
- révisions espacées illimitées ;
- écoute des voix natives et réécoute de sa propre voix ;
- parcours fondamental intégralement atteignable sans payer ;
- laboratoire des tons de base ;
- nombre limité de conversations ou corrections coûteuses en IA ;
- aucune publicité intrusive et aucun système de « vies » qui empêche d'apprendre.

### Premium — accélérer, approfondir, personnaliser

- leçons nouvelles sans limite quotidienne ;
- analyse vocale et laboratoire des tons avancés ;
- conversations IA plus longues, avec quota clairement affiché ;
- parcours adaptatif et vocabulaire personnel ;
- histoires, dialogues et parcours spécialisés ;
- packs audio et mode hors connexion étendu ;
- statistiques pédagogiques détaillées.

Hypothèse de prix à tester, non verrouillée : `7,99 € / mois` ou `59 € / an`. Le prix final doit être validé par entretiens, page d'attente et bêta payante, pas par intuition seule.

### Règle de monétisation

Le gratuit donne une vraie réussite. Le Premium vend surtout de la vitesse, du volume, du confort et les fonctions ayant un coût marginal. Les quotas IA sont gérés côté serveur ; une réponse déterministe ou un quiz statique ne doit jamais appeler un grand modèle à chaque clic.

## 5. Principes d'expérience

### Boucle quotidienne

```text
Ouverture
  → une action principale évidente
  → séance de 5 à 10 minutes
  → correction immédiate et explicative
  → preuve visuelle de maîtrise
  → prochain petit objectif proposé
```

### Rétention éthique

- série flexible avec un « jour de respiration » plutôt qu'une punition ;
- progression par maîtrise réelle, pas seulement par XP ;
- petites surprises utiles : dialogue, anecdote culturelle, nouveau son ;
- objectif quotidien personnalisable ;
- reprise en un geste exactement là où l'utilisateur s'est arrêté ;
- célébrations courtes, désactivables et compatibles avec la réduction des animations ;
- aucun compte à rebours artificiel, culpabilisation, faux rabais ou difficulté volontairement frustrante.

### Navigation mobile principale

1. `Aujourd'hui` — séance recommandée et révisions dues ;
2. `Pratiquer` — sons, tons, vocabulaire, dialogues et lecture ;
3. `Progrès` — carte de maîtrise, série flexible et objectifs.

Le site public comporte en plus : méthode, cours gratuits, guide de prononciation, articles, tarifs, confiance linguistique et connexion.

## 6. Direction artistique

L'identité est thaïe contemporaine, chaleureuse et adulte. Éviter les éléphants, temples dorés, drapeaux omniprésents et autres clichés touristiques.

### Palette initiale

| Token | Valeur | Usage |
|---|---:|---|
| `jasmine` | `#FBFAF7` | fond principal |
| `ink` | `#283450` | texte et navigation |
| `coral` | `#E9615C` | action et réussite active |
| `jade` | `#43A283` | progression et validation |
| `saffron` | `#F1B84B` | accent rare et récompense |
| `mist` | `#EEF1F4` | surfaces secondaires |

### Typographie

- français/latin : `Manrope` ou équivalent variable sobre ;
- thaï : `Noto Sans Thai`, fichiers embarqués et licence conservée ;
- tailles thaïes légèrement supérieures aux tailles latines ;
- ne jamais réduire l'interligne au point de couper les signes combinatoires.

### Règles d'interface

- une action primaire maximum par écran ;
- zones tactiles d'au moins 44 × 44 points ;
- contraste conforme WCAG 2.2 AA ;
- états chargement, vide, erreur, réseau lent et hors connexion conçus dès la fonctionnalité ;
- thème sombre après le parcours fondamental, pas avant la première tranche verticale ;
- micro-interactions avec haptique légère, jamais obligatoires pour comprendre un résultat.

## 7. Décisions verrouillées

| ID | Statut | Décision |
|---|---|---|
| DEC-001 | LOCKED | Même marque pour le site et les applications : Thaïnaute, sous réserve de clearance juridique |
| DEC-002 | LOCKED | Site public + application web + iOS + Android |
| DEC-003 | LOCKED | Français comme langue pédagogique initiale |
| DEC-004 | LOCKED | Parcours fondamental réellement accessible gratuitement |
| DEC-005 | LOCKED | Compte, contenu, progression et droits Premium partagés entre plateformes |
| DEC-006 | LOCKED | Contenu linguistique sourcé, versionné et bloqué en cas de conflit non résolu |
| DEC-007 | LOCKED | TypeScript sur le web, le mobile et l'essentiel du serveur |
| DEC-008 | LOCKED | Monolithe modulaire ; aucun microservice sans besoin mesuré |
| DEC-009 | LOCKED | Voix de l'apprenant locale par défaut et jamais utilisée pour entraîner un modèle sans consentement explicite |
| DEC-010 | LOCKED | IA présentée comme assistance probabiliste, jamais comme autorité linguistique |

## 8. Périmètre fonctionnel

### MVP P0

- site public indexable et pages de confiance ;
- démarrage local sans création de compte obligatoire ;
- onboarding court : objectif, motivation et expérience antérieure ;
- une séance du jour ;
- parcours visible par unités ;
- écoute naturelle et pédagogique ;
- exercices d'écoute, association, ordre des mots, rappel et lecture ;
- enregistrement et réécoute de sa voix ;
- répétition espacée ;
- création de compte après une première réussite ;
- fusion et synchronisation de la progression ;
- offre gratuite, quota et Premium ;
- restauration d'achat ;
- signalement d'une erreur linguistique ;
- studio minimal de contenu ;
- export et suppression du compte ;
- observabilité, sauvegardes et builds distribuables.

### P1 après validation du MVP

- analyse locale du contour tonal avec niveau de confiance ;
- laboratoire complet des tons ;
- conversation IA avec texte et audio ;
- mode hors connexion étendu ;
- vocabulaire personnel ;
- notifications intelligentes ;
- histoires et parcours voyage, couple, expatriation et lecture.

### Hors périmètre initial

- réseau social public ;
- classement mondial agressif ;
- place de marché de professeurs ;
- dialectes régionaux complets ;
- conversation vocale temps réel illimitée ;
- traduction généraliste ;
- publicité ;
- microservices, Kubernetes ou infrastructure multi-cloud.

## 9. Stack recommandée

### Vue d'ensemble

| Couche | Choix | Pourquoi |
|---|---|---|
| Runtime | Node.js 24 LTS | Version LTS de production en août 2026 ; Node 20 est en fin de vie |
| Langage | TypeScript strict | Une langue et des contrats partagés |
| Monorepo | pnpm workspaces + Turborepo | Dépendances, cache et tâches partagés |
| Site + web app | Next.js App Router | SEO, rendu statique/dynamique, studio et routes serveur |
| Mobile | React Native + Expo Router | Vraies apps iOS/Android avec audio, liens et notifications |
| Builds mobiles | EAS Build + EAS Submit | Builds signés et livraison aux boutiques |
| Base | Supabase Postgres | Modèle relationnel, migrations et portabilité |
| Auth | Supabase Auth | Email, Apple, Google et sessions web/mobile |
| Fichiers | Supabase Storage | Audio publié et enregistrements privés |
| API privilégiée | Next.js Route Handlers sous `/api/v1` | Un serveur commun pour web et mobile, simple à exploiter |
| Validation | Zod | Contrats runtime et contenu auditable |
| Données client | TanStack Query | Cache réseau et mutations prévisibles |
| État local | Zustand, limité à l'interface | Éviter un store global métier |
| Hors ligne mobile | Expo SQLite + FileSystem | Packs de contenu, audio et journal d'événements |
| Hors ligne web | IndexedDB via Dexie | Cache local sans dépendre de SQLite web alpha |
| Abonnements | RevenueCat + achats natifs + Stripe Billing sur le web | Un entitlement commun aux trois plateformes |
| Analytics | PostHog Cloud EU, après consentement | Funnels, cohortes et tests produit |
| Erreurs | Sentry, région UE si disponible | Erreurs web/mobile et sourcemaps |
| Tests | Vitest, Testing Library, Playwright, Maestro, pgTAP | Couverture du métier aux parcours réels |
| CI/CD | GitHub Actions, Vercel, EAS | Aperçus, contrôles et releases reproductibles |

Au démarrage, Codex doit vérifier les versions stables dans les documentations officielles, les épingler exactement et enregistrer `pnpm-lock.yaml`. Ne pas copier des numéros de version depuis ce document, sauf Node 24 LTS.

### Pourquoi deux couches d'interface

Expo Router sait produire du web statique, mais le rendu serveur demande encore une infrastructure spécifique. Next.js reste plus adapté au contenu éditorial, au SEO, au studio et à l'application web. Expo reste meilleur pour l'audio, le hors-ligne, les achats natifs et les gestes mobiles.

La logique métier, les schémas, les contrats, le moteur de révision, les événements analytics et les tokens visuels sont partagés. Les composants d'interface web et mobile ne sont pas forcés à être identiques.

## 10. Architecture logique

```text
                            thainaute.com
                   ┌─────────────┴─────────────┐
                   │                           │
          Next.js : site + web app      Expo : iOS + Android
                   │                           │
                   └─────────────┬─────────────┘
                                 │
                         API Next.js /api/v1
               auth, sync, quotas, contenu, IA, paiements
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
      Supabase Postgres    Supabase Storage    Services externes
       Auth + données       audio + packs      RevenueCat/Stripe
                                               IA/voix via adaptateurs
```

Règles :

- tous les changements métier importants passent par des commandes API idempotentes ;
- les clients peuvent utiliser directement Supabase Auth et lire des ressources explicitement publiques ;
- une opération privilégiée n'utilise jamais une confiance implicite dans le client ;
- le serveur utilise le jeton utilisateur pour conserver la RLS quand l'opération est au nom de l'utilisateur ;
- une clé Supabase secrète ou `service_role` n'existe jamais dans le navigateur ou l'application mobile ;
- les fonctions lourdes de parole pourront devenir un service séparé seulement après mesure.

## 11. Structure du dépôt

```text
apps/
  web/                    # site, web app, studio et API /api/v1
  mobile/                 # Expo Router : iOS et Android

packages/
  core/                   # entités et règles sans React
  srs/                    # répétition espacée derrière une interface interne
  sync/                   # événements, idempotence et projections
  content-schema/         # schémas Zod et validateurs
  api-contracts/          # entrées/sorties versionnées
  design-tokens/          # couleurs, typographies, espaces, mouvements
  analytics/              # catalogue typé des événements
  test-utils/

content/
  sources/                # métadonnées, licence, URL et date de consultation
  lexicon/
  lessons/
  dialogues/
  gold/                   # petit jeu de référence indépendant

supabase/
  migrations/
  seed/
  tests/                  # pgTAP et tests RLS

docs/
  PROJECT_BRIEF.md
  adr/
  privacy/
  content-policy/

tooling/
  eslint/
  typescript/
```

## 12. Backend et modèle de données

### Entités principales

- `profiles`, `devices` ;
- `curricula`, `units`, `lesson_versions`, `content_releases` ;
- `lexemes`, `senses`, `syllables`, `pronunciations`, `example_sentences` ;
- `audio_assets`, `voice_uploads` ;
- `sources`, `source_licenses`, `audit_findings`, `content_reports` ;
- `attempt_events`, `learner_item_state`, `review_schedule` ;
- `plans`, `subscriptions`, `entitlements_cache`, `usage_ledger` ;
- `ai_requests`, avec coût et fonctionnalité mais sans contenu sensible dans les logs.

### Principes de données

- UUID stables indépendants des titres ou positions de cours ;
- timestamps stockés en UTC ;
- contenu publié immuable : toute correction crée une nouvelle version ;
- chaque tentative est un événement immuable avec `event_id` idempotent ;
- projections de maîtrise recalculables ;
- maîtrise distincte pour écoute, lecture, rappel, production et ton ;
- aucune carte bancaire stockée ;
- suppression et export utilisateur conçus dès le schéma initial.

### Sécurité Supabase

- RLS sur toute table d'un schéma exposé ;
- accès Data API accordé explicitement : les nouvelles tables ne sont plus automatiquement exposées par défaut ;
- politiques testées pour utilisateur A contre utilisateur B ;
- autorisations dans `app_metadata`, jamais dans `user_metadata` modifiable par l'utilisateur ;
- vues en `security_invoker` ;
- fonctions `SECURITY DEFINER` exceptionnelles, placées hors schéma exposé, avec contrôle d'utilisateur et droits d'exécution explicites ;
- buckets des voix privés, URL signées courtes et purge automatique ;
- environnements local, test, staging et production séparés.

## 13. Hors connexion et synchronisation

Ne pas synchroniser toute la base. Utiliser deux flux.

### Contenu

- manifeste de release versionné ;
- packs structurés validés et identifiés par hash ;
- SQLite sur mobile, IndexedDB sur le web ;
- audio téléchargé à la demande ;
- invalidation fichier par fichier.

### Progression

Chaque réponse produit :

```text
event_id
device_id
user_id nullable avant inscription
item_id
rating
answered_at
duration_ms
content_version
algorithm_version
```

Le serveur accepte plusieurs envois du même `event_id` sans dupliquer l'effet. À la création du compte, les événements locaux sont réattribués après une fusion explicite. Le moteur de répétition est isolé dans `packages/srs` ; une bibliothèque FSRS peut être utilisée après revue de licence et tests contre un jeu de référence.

## 14. Contenu linguistique et audit

### Hiérarchie des preuves

1. sources officielles normatives ;
2. publications universitaires et grammaires reconnues ;
3. corpus licenciés de langue réelle ;
4. exemples contemporains validés par des natifs ;
5. génération IA, uniquement comme brouillon.

Le dictionnaire de la Royal Society peut servir à vérifier certains faits, jamais à redistribuer automatiquement son contenu : [ressource officielle](https://dictionary.orst.go.th/).

### Statuts

`draft → review → approved → published`

Un statut `conflict` bloque la publication jusqu'à résolution documentée.

### Champs minimaux d'une entrée linguistique

- thaï original et représentation Unicode contrôlée ;
- segmentation syllabique ;
- traduction française naturelle ;
- traduction littérale facultative ;
- transcription pédagogique versionnée ;
- API ;
- ton et longueur vocalique par syllabe ;
- consonnes initiales/finales ;
- registre, contexte et variantes acceptables ;
- classificateur éventuel ;
- sources, licence, date de consultation et confiance ;
- auteur de la génération et audits effectués.

### Portes de publication

- schéma valide ;
- au moins une source autorisée par fait vérifiable ;
- licence compatible avec un produit commercial ;
- orthographe, sens, prononciation, registre et naturalité audités séparément ;
- aucun conflit ouvert ;
- exemples et explications rédigés originalement ;
- tests Unicode, tonaux et de variantes passants.

Deux modèles qui donnent la même réponse ne constituent pas deux sources. Codex et Claude peuvent générer, comparer et signaler les cas douteux ; ils ne doivent pas auto-publier un fait linguistique sans la chaîne de preuve prévue.

## 15. Audio, parole et IA

### MVP

- `expo-audio` pour lecture et enregistrement ;
- voix natives humaines pour les contenus principaux ;
- deux prises distinctes si nécessaire : naturelle et pédagogique, plutôt qu'un ralentissement déformant ;
- enregistrement local et comparaison A/B ;
- aucune promesse de notation tonale certaine.

### Analyse tonale P1

- fréquence fondamentale extraite localement lorsque possible ;
- comparaison de la forme du contour, pas de la hauteur absolue ;
- normalisation à la tessiture de l'apprenant ;
- retour séparé pour mot reconnu, longueur vocalique, ton et fluidité ;
- niveau de confiance affiché ;
- analyse distante seulement après consentement, via fichier privé supprimé sous 24 heures par défaut.

### Passerelle IA

Créer une interface serveur `AiProvider` indépendante d'un fournisseur. Chaque requête suit :

1. authentifier ;
2. vérifier l'entitlement ;
3. réserver un quota dans une transaction ;
4. appeler le fournisseur ;
5. valider la sortie structurée ;
6. enregistrer l'usage réel ;
7. rembourser la réservation en cas d'échec.

Prévoir limites par requête, jour, mois, utilisateur et IP, budget global dur, cache, repli et interrupteur général. Les tests ordinaires utilisent des réponses simulées ; les évaluations réelles se font séparément sur `content/gold`.

## 16. Paiements

### Architecture recommandée

- iOS : StoreKit via RevenueCat ;
- Android : Google Play Billing via RevenueCat ;
- web : Stripe Billing + Checkout Sessions + Customer Portal, reliés à RevenueCat ;
- identifiant RevenueCat identique à l'identifiant stable du compte Supabase ;
- entitlement unique initial : `premium` ;
- miroir serveur `entitlements_cache` mis à jour par webhooks signés et idempotents.

RevenueCat permet d'unifier les droits web et mobile : [documentation officielle](https://www.revenuecat.com/docs/web/payment-integrations). Les achats Expo nécessitent un development build pour les tests réels, pas seulement Expo Go : [guide Expo RevenueCat](https://www.revenuecat.com/docs/getting-started/installation/expo).

Pour Stripe : abonnements via Billing + Checkout, gestion autonome via Customer Portal, clés restreintes côté serveur et signatures de webhooks vérifiées. Ne jamais construire une boucle d'abonnement avec des PaymentIntents bruts. Ne pas activer automatiquement Stripe Tax sans inscriptions fiscales actives et validation comptable.

Les règles Apple/Google sur les liens et achats externes changent selon la boutique et le pays. Les revérifier juste avant l'implémentation puis avant chaque publication importante. L'application ne doit pas contourner les achats natifs.

## 17. Mesure, confidentialité et RGPD

### Événements de départ

- `onboarding_started`, `onboarding_completed` ;
- `lesson_started`, `exercise_answered`, `lesson_completed` ;
- `review_due`, `review_completed` ;
- `recording_started`, sans joindre d'audio ;
- `paywall_viewed`, `purchase_started`, `purchase_completed`, `purchase_restored` ;
- `content_reported` ;
- `account_export_requested`, `account_deletion_requested`.

### Règles

- PostHog en région UE après consentement ;
- identifiant pseudonyme ;
- aucun email, texte libre, transcription ou audio dans les événements ;
- session replay désactivé au lancement ;
- Sentry nettoyé des tokens et données vocales ;
- consentements séparés pour microphone, analytics non essentiels et marketing ;
- export, suppression du compte et suppression individuelle des voix ;
- registre des sous-traitants et durées de rétention ;
- revue des transferts hors UE avant production.

## 18. Qualité et tests

### Tests obligatoires

- Vitest : SRS, quotas, entitlements, règles de progression et contenu ;
- `fast-check` : idempotence, synchronisation et propriétés du moteur SRS ;
- Testing Library : composants et accessibilité ;
- Playwright : onboarding, leçon, connexion, paiement web et suppression ;
- Maestro : parcours iOS/Android, microphone, achat et restauration ;
- pgTAP/Supabase local : politiques RLS et opérations atomiques ;
- contrats Zod et snapshots de releases de contenu ;
- tests de webhooks RevenueCat/Stripe avec doublons et ordre d'arrivée différent ;
- tests sur appareils réels pour audio, interruption, Bluetooth et réseau lent.

### Seuils initiaux

- zéro lecture croisée entre utilisateurs dans les tests RLS ;
- zéro double tentative après resynchronisation du même événement ;
- LCP web public ≤ 2,5 s au 75e percentile ;
- CLS ≤ 0,1 et INP ≤ 200 ms au 75e percentile ;
- démarrage mobile froid cible ≤ 2,5 s sur l'appareil Android de référence ;
- lecture d'un audio déjà local ≤ 150 ms après le toucher ;
- aucune publication avec source absente ou conflit ouvert ;
- parcours clavier complet et WCAG 2.2 AA sur le web.

## 19. Phases de réalisation

### Phase 0 — marque et fondations

- clearance du nom et réservation ;
- dépôt du brief et du `AGENTS.md` ;
- création du monorepo ;
- versions stables vérifiées puis épinglées ;
- CI minimale ;
- environnements et secrets documentés ;
- ADR pour architecture, auth, contenu, sync et paiement.

**Sortie :** installations, lint, types, tests et builds web/mobile de démonstration passent.

### Phase 1 — tranche verticale

Construire une seule leçon complète : contenu versionné, audio, un exercice, tentative, maîtrise, prochaine révision, affichage web/mobile et événement analytics consentable.

**Sortie :** le même scénario fonctionne sur navigateur, iOS et Android avec données de test.

### Phase 2 — boucle pédagogique MVP

- onboarding local ;
- séance quotidienne ;
- cinq types d'exercices ;
- SRS ;
- parcours et progression ;
- compte puis synchronisation ;
- signalement et studio de contenu.

**Sortie :** bêta privée utilisable pendant quatre semaines.

### Phase 3 — freemium

- quotas serveur ;
- achats tests iOS/Android/web ;
- entitlement partagé ;
- restauration, expiration, remboursement et grâce ;
- export et suppression.

**Sortie :** matrice de paiements entièrement testée en sandbox.

### Phase 4 — bêta publique

- corpus initial audité ;
- hors ligne ;
- accessibilité et performance ;
- pages légales ;
- monitoring et support ;
- TestFlight et piste fermée Google Play.

### Phase 5 — lancement

- audit règles des boutiques ;
- revue RGPD/sécurité ;
- sauvegarde et restauration testées ;
- plan de rollback ;
- publication manuelle après go/no-go explicite.

## 20. Critères d'acceptation critiques

### AC-LEARN-001 — progression partagée

Étant donné un utilisateur connecté ayant terminé un exercice sur mobile, lorsqu'il ouvre le web avec le même compte, alors sa tentative, sa maîtrise et sa prochaine révision sont identiques.

### AC-OFFLINE-001 — synchronisation idempotente

Étant donné une séance terminée hors ligne, lorsque le client envoie deux fois les mêmes événements après reconnexion, alors chaque réponse n'affecte la progression qu'une seule fois.

### AC-LING-001 — publication bloquée

Étant donné une phrase avec une source absente ou un conflit non résolu, lorsqu'un éditeur tente de publier, alors la publication est refusée et la cause est affichée.

### AC-FREE-001 — socle gratuit

Étant donné un utilisateur gratuit respectant le rythme prévu, lorsqu'il poursuit le parcours, alors il peut terminer toutes les bases sans achat.

### AC-BILL-001 — restauration multi-appareil

Étant donné un abonnement valide, lorsque l'utilisateur se connecte sur un autre appareil et restaure ses achats, alors l'entitlement `premium` est accordé sans deuxième paiement.

### AC-RGPD-001 — voix supprimable

Étant donné un utilisateur ayant envoyé un enregistrement, lorsqu'il le supprime, alors l'accès est immédiatement révoqué et le fichier est purgé selon la rétention documentée.

## 21. Commandes canoniques à créer en Phase 0

| Action | Commande depuis la racine |
|---|---|
| Installer | `pnpm install --frozen-lockfile` en CI, `pnpm install` en local |
| Tout développer | `pnpm dev` |
| Web | `pnpm dev:web` |
| Mobile | `pnpm dev:mobile` |
| Lint | `pnpm lint` |
| Types | `pnpm typecheck` |
| Tests unitaires | `pnpm test` |
| Contenu | `pnpm content:validate` |
| Audit des sources | `pnpm content:audit` |
| Tests base/RLS | `pnpm db:test` |
| E2E web | `pnpm test:e2e:web` |
| E2E mobile | `pnpm test:e2e:mobile` |
| Build global | `pnpm build` |

Codex doit créer les scripts avant de les annoncer comme fonctionnels et ne doit jamais prétendre avoir exécuté une commande qu'il n'a pas réellement lancée.

## 22. Definition of Done

Une fonctionnalité est terminée seulement si :

- ses critères d'acceptation sont satisfaits ;
- les tests proportionnés au risque sont ajoutés et passants ;
- lint, types et builds concernés passent ;
- chargement, vide, erreur, hors ligne et reprise sont traités ;
- web et mobile sont vérifiés si concernés ;
- accessibilité et réduction des animations sont vérifiées ;
- événements analytics documentés et soumis au consentement ;
- migrations et rollback sont documentés ;
- textes français relus ;
- contenus thaïs sourcés et audités ;
- aucune donnée secrète ou personnelle ne fuit dans les logs ;
- le compte rendu final liste changements, tests réellement exécutés, limites et risques.

## 23. Budget technique de départ

Montants observés au 1er août 2026, à revérifier avant achat :

| Service | Développement | Production de départ |
|---|---:|---:|
| Vercel | essai possible | Pro à partir de 20 USD/mois pour un usage commercial |
| Supabase | Free possible | Pro à partir de 25 USD/mois |
| Expo EAS | Free : quotas de builds | Starter facultatif à 19 USD/mois |
| RevenueCat | 0 USD jusqu'à 2 500 USD de revenu mensuel suivi | puis 1 % du revenu suivi |
| PostHog et Sentry | paliers gratuits probables au lancement | selon volume |
| IA, voix et audio | variable | plafond global obligatoire |
| Domaine, email et sauvegardes | variable | prévoir une petite marge annuelle |

Budget d'exploitation réaliste au lancement, hors IA, commissions, fiscalité et comptes de boutiques : **environ 45 à 70 USD par mois**. Le développement peut commencer moins cher, mais une application commerciale ne doit pas dépendre durablement d'offres gratuites sans sauvegarde ni garantie adaptée.

Comptes de distribution : [Apple facture 99 USD par an](https://developer.apple.com/programs/enroll/) et [Google Play 25 USD une fois](https://support.google.com/googleplay/android-developer/answer/6112435). Apple indique qu'un indépendant inscrit comme individu est affiché sous son nom légal. Google publie également certaines informations légales et peut afficher l'adresse complète d'un compte personnel monétisé. Prévoir dès le départ un email, un numéro et une adresse de contact professionnels, puis vérifier le type de compte le plus adapté avant inscription.

Références de prix : [Vercel](https://vercel.com/pricing), [Supabase](https://supabase.com/pricing), [Expo](https://expo.dev/pricing), [RevenueCat](https://www.revenuecat.com/pricing).

## 24. Première mission à donner à Codex

Copier ce fichier dans `docs/PROJECT_BRIEF.md`, placer `AGENTS.md` à la racine, puis utiliser ce prompt :

```text
Lis entièrement AGENTS.md et docs/PROJECT_BRIEF.md.
Inspecte d'abord le dépôt et les changements existants.
Réalise uniquement la Phase 0, puis une coquille démontrable de la Phase 1 :
monorepo pnpm/Turborepo, app Next.js, app Expo, packages partagés,
validation de contenu, Supabase local, CI et une leçon fictive non publiée.

Avant d'installer, vérifie les versions stables et les changelogs officiels,
puis épingle les versions et commit le lockfile.
N'ouvre aucun compte, n'achète aucun domaine, ne déploie rien et ne crée
aucune ressource cloud sans mon autorisation explicite.

Présente un plan court, implémente par petites étapes, exécute les contrôles,
et termine par les fichiers changés, les commandes réellement passées,
les risques restants et la prochaine tranche recommandée.
```

## 25. Décisions ouvertes avant production

- résultat final de la clearance et du dépôt `Thaïnaute` ;
- prix et durée d'essai ;
- fournisseurs texte, STT et TTS après benchmark français-thaï ;
- durée exacte de rétention des voix ;
- outil et algorithme tonal après validation sur un jeu natif ;
- pays de lancement et traitement fiscal validé avec un comptable ;
- politique concernant les mineurs ;
- seuils de passage du gratuit au Premium ;
- volume de contenu minimal pour la bêta.

## 26. Références techniques officielles

- [Node.js — calendrier des versions](https://nodejs.org/en/about/previous-releases)
- [Next.js — App Router](https://nextjs.org/docs/app)
- [Expo Router — introduction](https://docs.expo.dev/router/introduction/)
- [Expo — rendu web statique](https://docs.expo.dev/router/web/static-rendering/)
- [Expo — EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Supabase avec Expo React Native](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RevenueCat — achats web et entitlements mobiles](https://www.revenuecat.com/docs/web/payment-integrations)
- [Stripe — conception d'un abonnement](https://docs.stripe.com/billing/subscriptions/design-an-integration)
- [Codex — configuration avec AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md.md)
