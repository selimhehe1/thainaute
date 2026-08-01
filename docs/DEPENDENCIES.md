# Registre des dépendances

Dernière vérification : 1er août 2026. Les versions sont exactes dans chaque
`package.json` et dans `pnpm-lock.yaml`.

| Dépendance                      | Besoin                                                  | Licence / coût                            | Alternative examinée                                       |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| Next.js 16                      | Site SEO, application web, studio et API                | MIT ; hébergement au choix                | Vite seul ne fournit pas le cadre SSR/SEO retenu           |
| Expo SDK 57 / React Native 0.86 | Applications iOS et Android                             | MIT ; EAS optionnel et payant selon usage | Développement natif séparé, trop coûteux pour une personne |
| Supabase JS / CLI               | Auth, Data API, Storage et environnement Postgres local | MIT/Apache-2.0 ; cloud optionnel          | Postgres + services séparés, davantage d'exploitation      |
| Zod 4                           | Validation stricte des contrats et du contenu           | MIT ; gratuit                             | JSON Schema/Ajv, moins direct avec TypeScript ici          |
| Dexie 4                         | Journal hors ligne IndexedDB de l'application web       | Apache-2.0 ; gratuit, sans service        | API IndexedDB native, plus complexe à migrer et tester     |
| fake-indexeddb 6                | Tester IndexedDB/Dexie sans navigateur réel             | Apache-2.0 ; test uniquement              | Playwright seul, plus lent pour les cas transactionnels    |
| Turborepo / pnpm                | Graphe de tâches et workspaces                          | MIT ; gratuit                             | Nx, plus large que le besoin actuel                        |
| Vitest / fast-check             | Tests unitaires et propriétés du SRS                    | MIT ; gratuits                            | Jest seul, moins intégré au socle ESM/Vite                 |
| Playwright                      | Parcours web réels                                      | Apache-2.0 ; gratuit                      | Cypress, sans avantage décisif pour cette tranche          |
| RevenueCat                      | Entitlement mobile partagé, phase ultérieure            | service commercial                        | Implémentation StoreKit/Play Billing maison, plus risquée  |
| Stripe                          | Abonnements web, phase ultérieure                       | service facturé à l'usage                 | Paiement maison exclu pour sécurité et conformité          |

TypeScript reste en `6.0.3` : le dist-tag `latest` pointe déjà vers TypeScript 7,
mais Expo SDK 57 et `typescript-eslint` 8.65 bornent encore la version supportée
à une version antérieure à 6.1. React est épinglé par application : Next et Expo
n'ont pas exactement le même contrat de pair.

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
