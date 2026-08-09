# ADR-0030 — Transactions SQLite mobile sur la connexion principale

## Statut

Supersédée par ADR-0032 — tranche mobile interne, 2026-08-06.

## Contexte

Les adaptateurs mobiles partagent une base SQLite locale et peuvent lancer des
lectures et mutations depuis plusieurs stores. Sur Android, l’utilisation de
`withExclusiveTransactionAsync` ouvrait une seconde connexion native. Une
mutation concurrente sur la connexion principale pouvait alors rester bloquée
sur `SQLITE_BUSY`, ce qui laissait un bouton d’exercice en état de chargement.

## Décision

- Sérialiser les opérations par `databasePath` (ou par objet lorsque le chemin
  n’est pas disponible) avant toute lecture ou mutation.
- Exécuter `runMobileSQLiteTransaction` avec `withTransactionAsync` sur la
  connexion principale déjà sérialisée.
- Conserver une compatibilité de test avec l’ancienne API exclusive, sans
  utiliser cette branche sur la version native supportée.
- Retenter brièvement `SQLITE_BUSY` comme filet de sécurité, sans masquer une
  erreur persistante.

## Conséquences

Les transactions des stores mobiles ne se font plus concurrence au niveau
applicatif et le parcours onboarding → exercice → tentative ne reste pas
bloqué sur Android. L’exclusivité est désormais une propriété de la file
applicative ; toute nouvelle écriture SQLite mobile doit passer par cette file.
Le test natif réel reste complété par le smoke test de l’émulateur, car les
doubles SQLite ne reproduisent pas le verrouillage Android.
