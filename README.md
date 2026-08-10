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

## Packs de langue

Une build sélectionne une seule langue cible avec `THAINAUTE_LANGUAGE_PACK`.
Le français reste la langue d'enseignement. La valeur actuellement disponible
est `thai-fr` ; un identifiant absent du registre fait échouer la build plutôt
que de servir silencieusement du contenu thaï. Pour le web, la configuration
Next.js recopie aussi l'identifiant dans `NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK`.

Ajouter une langue signifie donc ajouter un pack enregistré, son registre de
contenu audité et ses adaptateurs audio/typographiques avant de sélectionner
son profil. Aucun cours italien n'est inclus dans cette tranche.

Pour la base locale :

```powershell
pnpm exec supabase start
pnpm db:reset
pnpm db:test
pnpm db:lint
pnpm exec supabase db query --local --file supabase/fixtures/connected_sync.sql
# Obtenir les trois valeurs locales sous les noms attendus, puis les charger
# comme variables `$env:` dans ce même terminal sans les committer :
pnpm exec supabase status -o env `
  --override-name api.url=NEXT_PUBLIC_SUPABASE_URL `
  --override-name auth.anon_key=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY `
  --override-name auth.service_role_key=SUPABASE_SECRET_KEY
$env:THAINAUTE_SYNC_MODE="supabase"
$env:THAINAUTE_LANGUAGE_PACK="thai-fr"
$env:NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK="thai-fr"
$pepperBytes = [byte[]]::new(32)
$pepperRng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $pepperRng.GetBytes($pepperBytes) } finally { $pepperRng.Dispose() }
$env:ACCOUNT_DELETION_RECEIPT_PEPPER = [Convert]::ToBase64String($pepperBytes).TrimEnd('=').Replace('+','-').Replace('/','_')
Remove-Variable pepperBytes
Remove-Variable pepperRng
$env:THAINAUTE_PUBLIC_CONTENT_RELEASE_ID="30000000-0000-4000-8000-000000000001"
pnpm test:e2e:web:connected
$env:THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP="1"
pnpm fixture:bootstrap-local-audio
$env:THAINAUTE_PUBLIC_CONTENT_MODE="supabase"
pnpm test:e2e:web:connected:ui
$env:THAINAUTE_PUBLIC_CONTENT_MODE="disabled"
$env:THAINAUTE_CONTENT_REPORT_MODE="supabase"
pnpm test:e2e:web:connected:reports
```

Ces commandes exigent Docker. `pnpm test:e2e:mobile` exige Maestro et une
application mobile en cours d'exécution.

La preuve native connectée se lance séparément :

```powershell
pnpm test:e2e:mobile:connected
```

Cette commande locale purge la stack Supabase de ce dépôt et les données
privées de `com.thainaute.app` sur un unique émulateur Android. Sans hook de
build APK, elle régénère aussi `apps/mobile/android` avec
`expo prebuild --clean` : aucun changement local à conserver ne doit rester
dans ce répertoire généré. Elle exige Docker Desktop, Maestro, ADB, un
émulateur Android déjà démarré, le SDK Android et Java 17. Elle possède et
nettoie ses serveurs Next.js et Metro avec des commandes non surchargeables et
une écoute loopback, force le mode paiement désactivé et n'utilise aucune
ressource cloud. Seul le build APK peut être remplacé par le hook local sans
shell documenté par le pilote.
Sous Linux Desktop ou rootless sans `/var/run/docker.sock`, définir
explicitement `DOCKER_HOST=unix:///chemin/absolu/local.sock`. Le garde local
refuse les endpoints Docker TCP/SSH et les contextes distants ; cette origine
Unix n'est transmise qu'aux enfants Docker proxifiés de la recette.
Le parcours standard `pnpm test:e2e:mobile` exclut volontairement ces flows
connectés afin de rester une vérification rapide de la fixture publique.

La boucle connectée locale vérifiée est volontairement séparée du parcours fictif :
`/learn/connected` sur le web et `/connected-lesson` dans Expo. Elle ne devient
disponible qu'avec `THAINAUTE_PUBLIC_CONTENT_MODE=supabase`, une release locale
explicite et un compte permanent. Elle reste une fixture technique non
publiable ; aucun corrigé n'est embarqué dans les clients.

Le centre `/privacy` sur le web et le mobile conserve un consentement analytics
indépendant du compte. La valeur initiale ferme le flux et aucun événement
antérieur n'est rejoué après acceptation. Cette tranche n'active aucun
fournisseur, SDK, cookie analytics ou transport distant.

Les identifiants natifs réservés localement sont `com.thainaute.app` pour iOS
et Android. Ils ne créent aucune fiche boutique et restent soumis à la
clearance du nom avant toute réservation Apple, Google ou EAS.

La source de vérité produit est [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md).
Les décisions d'architecture sont consignées dans [docs/adr](docs/adr).
