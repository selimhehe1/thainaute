# ADR-0003 — Contenu versionné et publication bloquante

- Statut : Accepted
- Date : 2026-08-01

## Décision

Le contenu est stocké dans des fichiers structurés validés, puis publié sous
forme de releases immuables. Chaque fait référence à des sources portant une
`versionSource`, un niveau de confiance, une licence et des droits explicites.
Une source sans droit commercial ou de redistribution et toute
`synthetic_fixture` bloquent mécaniquement la publication.

La provenance référence au moins un acteur de génération. Une publication
exige un auteur humain responsable et chaque audit orthographe, sens,
prononciation, ton, longueur, registre et naturalité référence son auditeur
humain. Les identifiants de ces acteurs restent des données éditoriales
internes et ne sont pas distribués aux clients.

Une source manquante, une licence incompatible, un acteur absent ou un constat
bloquant interdit la publication. Une correction crée une nouvelle version ;
elle ne réécrit pas une release déjà publiée.

## Conséquences

La génération IA accélère seulement les brouillons. La fixture de Phase 1 est
volontairement non publiable et démontre la porte de sécurité.
