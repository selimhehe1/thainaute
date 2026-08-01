# Synchronisation de progression

`POST /api/v1/attempts/batch` reçoit un lot de 1 à 50 réponses hors ligne. La
clé UUID de l'en-tête `Idempotency-Key` identifie la mutation répétable. Le
corps est validé par `attemptBatchSchema` ; les objets sont stricts et refusent
notamment les champs de résultat calculables côté serveur (`rating`, `correct`,
`mastery`, `dueAt`), les cibles dérivées (`itemId`, `skill`) ainsi que toute
identité utilisateur fournie par le client.
Les `eventId` doivent être uniques dans un même lot ; une répétition invalide le
lot entier. Le même lot peut en revanche être rejoué sous sa clé d'idempotence.

Une réponse 2xx est validée par `attemptBatchResponseSchema` :

- `syncRevision` est un curseur monotone ; un client ne remplace jamais un
  état local par une réponse portant une révision inférieure ;
- `results` contient exactement un résultat par entrée, dans l'ordre du lot ;
- un résultat `accepted` ou `duplicate` contient la `rating` autoritaire ;
- un résultat `rejected` contient uniquement un code fermé et sûr à exposer ;
- `states` contient au plus 50 projections affectées, uniques et triées par
  `itemId`, puis par `skill`. Chaque projection expose seulement la maîtrise en
  millièmes, les compteurs, l'échéance et la version d'algorithme nécessaires
  au client ; le tableau peut être vide si tout le lot est rejeté.

Les erreurs qui empêchent de traiter tout le lot utilisent
`apiErrorResponseSchema`. L'enveloppe et son objet `error` sont stricts ; le
code appartient à `API_ERROR_CODES`, le message est borné à 500 caractères et
un identifiant de requête opaque peut être joint. Une erreur globale ne doit
pas être mélangée à la réponse 2xx par tentative.

L'ingestion pure :

1. retrouve la clé de correction de la version de contenu ;
2. dérive `itemId` et `skill`, puis évalue la réponse ;
3. déduplique par `eventId` ;
4. refuse une collision où un même identifiant porte un autre contenu ;
5. recalcule les projections dans l'ordre `(answeredAt, eventId)`.

Les événements d'un compte sont regroupés entre appareils. Avant création de
compte, ils restent séparés par appareil ; leur fusion exige donc une commande
explicite, conformément au brief.

## Outbox locale pure

Le package fournit aussi un moteur d'outbox sans React, navigateur, Expo,
réseau ni authentification. Un adaptateur IndexedDB ou SQLite persiste un
`AttemptOutboxSnapshot` validé par Zod :

- les entrées sont `pending`, `synced` ou `rejected` et restent triées par
  `answeredAt`, puis `eventId` ;
- chaque snapshot appartient explicitement à l'espace `anonymous` ou à un
  compte ; révision, projections et device ne traversent jamais ces espaces ;
- `inFlight` contient au plus un lot de 50 identifiants et sa clé
  d'idempotence ;
- `prepareAttemptOutboxBatch` crée ce lot une seule fois puis renvoie exactement
  la même clé et le même payload tant qu'aucune réponse 2xx valide ne l'a
  clôturé ;
- `applyAttemptOutboxSuccess` exige un résultat par `eventId`, dans l'ordre du
  lot, classe chaque entrée, fusionne les projections dans le snapshot et ne
  diminue jamais `syncRevision` ; l'adaptateur persiste donc accusé et états
  autoritaires dans une seule transaction ;
- `device_not_registered` reste récupérable et bloque tout nouvel envoi jusqu'à
  `resumeAttemptOutboxAfterDeviceRegistration` ;
- les projections d'une réponse tardive sont écartées même si ses résultats
  permettent de clôturer le lot local ;
- le journal refuse plus de 1 000 événements pending et compacte les résultats
  terminaux aux 200 plus récents sans supprimer une tentative non synchronisée ;
- réutiliser un `eventId` avec un autre payload déclenche
  `AttemptOutboxEventCollisionError`, sans écrasement silencieux ;
- `serializeAttemptOutboxSnapshot` et `deserializeAttemptOutboxSnapshot`
  appliquent les mêmes schémas et invariants croisés aux données persistées.

Le snapshot courant est v3. Les lectures v1/v2 retirent les anciens `itemId` et
`skill` clients. Elles libèrent aussi tout ancien lot `inFlight` : son payload
allégé doit recevoir une nouvelle clé d'idempotence, tandis que l'`eventId`
préservé empêche un second effet si le premier envoi avait déjà été committé.

Une erreur réseau ne modifie pas le snapshot : l'appel suivant à `prepare`
reprend donc le lot durable. Le futur client authentifié reste responsable de
ne déclencher cette synchronisation qu'après la fusion explicite choisie par
l'apprenant. Le Route Handler Next.js conserve l'autorité sur
l'authentification, l'évaluation et la transaction serveur.

Les versions SRS persistables sont listées explicitement dans
`SUPPORTED_ATTEMPT_ALGORITHM_VERSIONS`. `OPEN-SRS-001` bloque tout changement
de version avant ajout du dispatch rétrocompatible. La relation exercice/item
est résolue côté serveur conformément à l'ADR-0009.

## Dépendances

- Zod (MIT, gratuit) fournit la validation runtime du contrat public ;
  l'alternative serait une validation manuelle plus difficile à maintenir.
- Vitest et fast-check (MIT, gratuits) sont limités au développement et
  couvrent respectivement les exemples et les propriétés d'idempotence.
