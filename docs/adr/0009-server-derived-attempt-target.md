# ADR-0009 — Cible de tentative dérivée côté serveur

- Statut : Accepted
- Date : 2026-08-01
- Résout : `OPEN-ATTEMPT-001`
- Critères concernés : `AC-LEARN-001`, `AC-OFFLINE-001`
- Décisions verrouillées concernées : `DEC-005`, `DEC-007`, `DEC-008`

## Contexte

Le DTO public de contenu expose un exercice et ses options, mais aucun
`itemId`. Ce dernier révèle la structure éditoriale interne et ne peut pas être
une autorité client. L'ancien contrat de tentative exigeait pourtant `itemId`
et `skill`, créant une incompatibilité et permettant à une commande de choisir
la projection qu'elle souhaitait affecter.

## Décision

`POST /api/v1/attempts/batch` refuse désormais `itemId` et `skill`. Une
soumission contient uniquement ses identifiants d'événement, appareil,
exercice, option et version de contenu, son horodatage, sa durée et sa version
d'algorithme.

Le serveur charge exclusivement les versions publiées qui repassent la porte
éditoriale commune. La clé autoritaire est indexée par le couple exact
`(exerciseId, contentVersionId)`. Le cœur métier construit ensuite l'événement
en injectant l'`itemId` et le `skill` de cette clé ; la note, la projection,
l'historique ciblé et le payload PostgreSQL utilisent uniquement cet événement
résolu. Une clé absente produit `answer_key_not_found`, une option étrangère
`invalid_submission`, et des clés internes divergentes ferment le traitement
comme panne d'intégrité sans exposer le contenu.

L'historique est paginé avec un `count: exact` et le curseur avance du nombre
de lignes réellement reçues. Une limite PostgREST distante inférieure à la
taille demandée ne peut donc pas être interprétée comme une fin silencieuse.

La RPC PostgreSQL reste inchangée. Elle est une frontière interne appelée
uniquement avec la clé serveur, en `SECURITY INVOKER`, avec `EXECUTE` accordé au
seul `service_role`. Elle persiste les événements déjà résolus et conserve
l'atomicité, l'idempotence et le verrou de révision ; elle n'est pas une API
cliente et ne réimplémente pas les règles éditoriales TypeScript.

Le hash d'idempotence de requête porte sur le contrat client canonique. Le hash
de l'événement durable inclut séparément les valeurs autoritaires dérivées.

## Compatibilité hors ligne

Le snapshot partagé passe en v3. Les snapshots v1/v2 sont lus avec un schéma
legacy privé, puis migrés en retirant `itemId` et `skill`. Le propriétaire, la
révision, les projections, les statuts et les `eventId` sont préservés dans les
limites de rétention déjà fixées à 1 000 pending et 200 terminaux.

Un lot `inFlight` legacy est remis à `null` : réutiliser son ancienne clé avec
le nouveau corps provoquerait légitimement un conflit d'idempotence. La
préparation suivante génère une nouvelle clé. Si l'ancien envoi avait été
committé avant une perte de réponse, l'`eventId` immuable le transforme en
doublon sans appliquer une seconde fois la progression.

## Conséquences

- Le DTO de contenu public peut alimenter directement la commande distante.
- Un client ne peut plus cibler un autre item ou une autre dimension.
- Une lecture d'historique n'utilise jamais une cible fournie par le client.
- La bascule modifie `/api/v1`, admis ici car aucune version distante n'a été
  distribuée. Toute future rupture exigera une nouvelle version ou une fenêtre
  de compatibilité explicite.
- `OPEN-SRS-001` et `OPEN-OFFLINE-001` restent des portes distinctes avant une
  bêta distante. `OPEN-SYNC-001` est résolue par l'ADR-0010.

## Références officielles

- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — fonctions PostgreSQL](https://supabase.com/docs/guides/database/functions)
- [Supabase JavaScript — `select` et compte exact](https://supabase.com/docs/reference/javascript/select)
- [Supabase JavaScript — pagination `range`](https://supabase.com/docs/reference/javascript/using-modifiers-range)
- [PostgreSQL — `CREATE FUNCTION`](https://www.postgresql.org/docs/current/sql-createfunction.html)
