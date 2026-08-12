# ADR-0032 — Transactions SQLite mobiles exclusives et sérialisées

## Statut

Acceptée — supersède ADR-0030, tranche mobile interne, 2026-08-06.

## Contexte

Le parcours mobile écrit le checkpoint local, le journal des tentatives et la
projection de l'expédition depuis plusieurs stores qui partagent la même base.
Une transaction non exclusive peut être interrompue par une autre requête
asynchrone. La transaction exclusive n'est sûre que si toutes les requêtes de
son callback utilisent la connexion transactionnelle fournie.

## Décision

- Sérialiser les opérations par `databasePath` (ou par objet lorsque le chemin
  n'est pas disponible) avant toute lecture ou mutation.
- Préférer `withExclusiveTransactionAsync` et transmettre sa connexion au
  callback de l'opération.
- Utiliser `withTransactionAsync` sur la connexion principale uniquement comme
  fallback pour un adaptateur qui n'expose pas l'API exclusive.
- Retenter brièvement `SQLITE_BUSY` comme filet de sécurité, sans masquer une
  erreur persistante.
- Toute nouvelle lecture ou écriture SQLite mobile doit passer par la file ;
  aucune connexion secrète ou parallèle ne doit contourner cette frontière.

## Conséquences

Les mutations du parcours restent atomiques et ordonnées entre les stores, y
compris pendant la reprise d'un brouillon de réponse. Le contrat des doubles
SQLite doit représenter une connexion transactionnelle distincte afin de
détecter un store qui écrirait accidentellement sur la connexion principale.
Le smoke test Android complète les tests unitaires, car les doubles ne
reproduisent pas tous les verrous natifs.
