# Thaïnaute

Thaïnaute est un produit d'apprentissage du thaï conçu en français. Ce dépôt
contient sa fondation locale : site et application web Next.js, application
mobile Expo, domaine métier partagé, contenu versionné, synchronisation
idempotente et schéma Supabase protégé par RLS.

Le nom reste provisoire jusqu'à la fin de la recherche d'antériorité. Aucun
contenu linguistique de démonstration n'est publiable.

## Prérequis

- Node.js 24 LTS ;
- pnpm 11.18.0 (Corepack ou le gestionnaire automatique de pnpm) ;
- Docker Desktop uniquement pour la pile Supabase et les tests RLS ;
- Maestro et un émulateur/appareil uniquement pour les E2E mobiles.

## Démarrage

```powershell
pnpm install
pnpm dev
```

Commandes de contrôle principales :

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm audit:prod
pnpm content:validate
pnpm content:audit
pnpm build
```

Pour la base locale :

```powershell
pnpm exec supabase start
pnpm db:reset
pnpm db:test
pnpm db:lint
```

Ces commandes exigent Docker. `pnpm test:e2e:mobile` exige Maestro et une
application mobile en cours d'exécution.

Les identifiants natifs `com.example.thainauteprototype` sont des placeholders
locaux. Ils devront être remplacés une seule fois, après la clearance du nom et
avant toute création d'application dans les boutiques.

La source de vérité produit est [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md).
Les décisions d'architecture sont consignées dans [docs/adr](docs/adr).
