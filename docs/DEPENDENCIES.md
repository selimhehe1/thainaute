# Registre des dépendances

Dernière vérification : 2 août 2026. Les versions sont exactes dans chaque
`package.json` et dans `pnpm-lock.yaml`.

| Dépendance                      | Besoin                                                          | Licence / coût                            | Alternative examinée                                                                      |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Next.js 16                      | Site SEO, application web, studio et API                        | MIT ; hébergement au choix                | Vite seul ne fournit pas le cadre SSR/SEO retenu                                          |
| Expo SDK 57 / React Native 0.86 | Applications iOS et Android                                     | MIT ; EAS optionnel et payant selon usage | Développement natif séparé, trop coûteux pour une personne                                |
| Expo Audio / FileSystem 57      | Capture A/B locale, validation et suppression du cache privé    | MIT ; gratuits                            | Deux modules natifs maison augmenteraient fortement le risque de cycle de vie et de fuite |
| Expo Sharing 57                 | Remise explicite de l’export JSON via le panneau natif          | MIT ; gratuit                             | `Share` React Native vise surtout le texte ; un envoi cloud ajouterait une rétention      |
| Noto Sans Thai                  | Rendu thaï déterministe, embarqué sur web, iOS et Android       | OFL-1.1 / MIT ; gratuit                   | Polices système variables selon l’appareil, rendu des signes combinatoires non maîtrisé   |
| Supabase JS / CLI               | Auth, Data API, Storage et environnement Postgres local         | MIT/Apache-2.0 ; cloud optionnel          | Postgres + services séparés, davantage d'exploitation                                     |
| Expo SecureStore                | Chiffrer la session Supabase fragmentée dans le trousseau natif | MIT ; gratuit                             | AsyncStorage/SQLite exposeraient les jetons en clair                                      |
| React Native URL polyfill       | Contrat URL requis par Supabase JS sur React Native             | MIT ; gratuit                             | Polyfill local incomplet et plus difficile à maintenir                                    |
| Zod 4                           | Validation stricte des contrats et du contenu                   | MIT ; gratuit                             | JSON Schema/Ajv, moins direct avec TypeScript ici                                         |
| Dexie 4                         | Journal hors ligne IndexedDB de l'application web               | Apache-2.0 ; gratuit, sans service        | API IndexedDB native, plus complexe à migrer et tester                                    |
| fake-indexeddb 6                | Tester IndexedDB/Dexie sans navigateur réel                     | Apache-2.0 ; test uniquement              | Playwright seul, plus lent pour les cas transactionnels                                   |
| Turborepo / pnpm                | Graphe de tâches et workspaces                                  | MIT ; gratuit                             | Nx, plus large que le besoin actuel                                                       |
| Vitest / fast-check             | Tests unitaires et propriétés du SRS                            | MIT ; gratuits                            | Jest seul, moins intégré au socle ESM/Vite                                                |
| Testing Library React / jsdom   | Courses du hook vocal testées avec React et cycle de vie simulé | MIT ; test uniquement                     | Helpers purs seuls ne prouvent pas l’intégration ; React Test Renderer est déprécié       |
| Playwright                      | Parcours web réels                                              | Apache-2.0 ; gratuit                      | Cypress, sans avantage décisif pour cette tranche                                         |
| RevenueCat                      | Entitlement mobile partagé, phase ultérieure                    | service commercial                        | Implémentation StoreKit/Play Billing maison, plus risquée                                 |
| Stripe                          | Abonnements web, phase ultérieure                               | service facturé à l'usage                 | Paiement maison exclu pour sécurité et conformité                                         |

TypeScript reste en `6.0.3` : le dist-tag `latest` pointe déjà vers TypeScript 7,
mais Expo SDK 57 et `typescript-eslint` 8.65 bornent encore la version supportée
à une version antérieure à 6.1. React est épinglé par application : Next et Expo
n'ont pas exactement le même contrat de pair.

`expo-audio` reste épinglé à `57.0.3` et reçoit le patch pnpm versionné décrit
par l’ADR-0012. Une montée de version ne peut pas conserver aveuglément ce
patch : elle doit d’abord vérifier le comportement natif amont, puis compiler
et recetter une nouvelle build iOS et Android sur appareils. Le patch stoppe
les interruptions iOS et les changements physiques de route audio sur les deux
plateformes ; il n’ajoute aucune permission. `expo-file-system` 57.0.1 est
utilisé uniquement pour confirmer la présence, la taille, l’entête et la
suppression du fichier privé avant d’autoriser B ; il n’accorde aucun accès aux
fichiers partagés de l’utilisateur.

`expo-sharing` 57.0.8 est épinglé à la version compatible avec Expo SDK 57. Il
n’est appelé qu’après vérification de sa disponibilité et seulement pour un
fichier JSON temporaire placé sur un chemin applicatif dédié du cache privé. Le
fichier est supprimé après fermeture du panneau, lors d’une frontière de
session et avant chaque nouvel export. Le module n’ajoute ici ni service cloud,
ni permission, ni configuration native de réception de fichiers.

Noto Sans Thai est embarquée sans requête distante : `@fontsource` 5.3.0 livre
les sous-ensembles thaïs 400/600 au build Next et
`@expo-google-fonts/noto-sans-thai` 0.4.2 livre les fontes statiques 400/600 au
bundle Expo via `expo-font` 57.0.1. La licence OFL-1.1 et la provenance sont
conservées dans `docs/licenses/`. Les fontes statiques évitent la prise en
charge inégale des fontes variables entre plateformes documentée par Expo.

Expo distribue certains modules sous forme d’artefacts natifs précompilés. La
configuration d’autolinking mobile force donc uniquement `expo-audio` à être
compilé depuis ses sources sur Android et iOS ; le reste du SDK conserve son
chemin de build normal. Ce réglage n’ajoute aucune dépendance, licence ou coût.
Les jobs natifs de CI doivent rester verts, car un simple `expo export` ou un
contrôle textuel du patch ne compile pas le Kotlin et le Swift modifiés.

ESLint reste en `9.39.5` bien que la ligne 10 soit stable : les plugins React,
import et accessibilité embarqués par les configurations officielles Next/Expo
ne sont pas encore exécutables avec l'API ESLint 10. Le lint réel a confirmé cette
incompatibilité ; aucune règle de pair n'est neutralisée pour la masquer.

Deux overrides transitifs, limités à Next.js 16.2.12, épinglent `postcss` 8.5.25
et `sharp` 0.35.3. Ils remplacent les versions vulnérables encore déclarées par
Next au 1er août 2026 pour corriger les avis [sharp](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)
et [PostCSS](https://github.com/advisories/GHSA-r28c-9q8g-f849). L'audit de
production et le build complet doivent rester des portes de CI tant que Next ne
les référence pas directement.

`sharp` 0.35.3 fait par ailleurs l'objet d'un
[incident ouvert sur certains imports serveur Vercel](https://github.com/lovell/sharp/issues/4567).
Avant le premier déploiement, la CI Linux devra compléter le build par un smoke
test de chargement de `sharp` et une transformation via l'optimiseur d'images
Next.

L'audit complet conserve une alerte modérée sur `uuid` 7.0.3, dépendance de
construction de `xcode` 3.0.1 via Expo. [L'avis GHSA](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
concerne les API `v3`, `v5` et
`v6` avec un buffer fourni, alors que `xcode` appelle seulement `uuid.v4()` sans
buffer. Un override hors contrat vers la version majeure 11 créerait ici plus de
risque de build natif que cette voie non atteignable ; l'alerte est donc acceptée
temporairement et doit disparaître par une mise à jour Expo/xcode. La CI bloque
les vulnérabilités élevées et critiques avec `pnpm audit:prod`.
