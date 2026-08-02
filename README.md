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
pnpm exec supabase db query --local --file supabase/fixtures/connected_sync.sql
pnpm test:e2e:web:connected
# Avec THAINAUTE_CONTENT_REPORT_MODE=supabase dans le même processus :
pnpm test:e2e:web:connected:reports
```

Ces commandes exigent Docker. `pnpm test:e2e:mobile` exige Maestro et une
application mobile en cours d'exécution.

Les identifiants natifs réservés localement sont `com.thainaute.app` pour iOS
et Android. Ils ne créent aucune fiche boutique et restent soumis à la
clearance du nom avant toute réservation Apple, Google ou EAS.

La source de vérité produit est [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md).
Les décisions d'architecture sont consignées dans [docs/adr](docs/adr).
