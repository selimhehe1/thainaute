# ADR-0001 — Monorepo et surfaces d'interface

- Statut : Accepted
- Date : 2026-08-01

## Décision

Utiliser un workspace pnpm piloté par Turborepo. `apps/web` contient Next.js
App Router pour le site, l'application web, le studio futur et `/api/v1`.
`apps/mobile` contient Expo Router pour iOS et Android.

Partager le domaine, le SRS, la synchronisation, les contrats, les schémas de
contenu, les événements analytics et les tokens. Ne pas partager de force les
composants React web et React Native.

## Conséquences

Deux interfaces restent à tester et maintenir. Le cœur métier doit donc rester
sans dépendance à React ni aux plateformes. Aucun microservice n'est autorisé
sans mesure montrant la limite du monolithe.
