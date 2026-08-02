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
reprend donc le lot durable. Le client authentifié ne déclenche la fusion
qu'après le choix explicite de l'apprenant. Le Route Handler Next.js conserve
l'autorité sur
l'authentification, l'évaluation et la transaction serveur.

## Fusion anonyme vers compte

La machine pure de fusion impose un consentement affirmatif horodaté et un seul
marqueur actif par installation. `startAnonymousProgressFusion` copie les
tentatives dans l'espace compte en conservant `eventId` et `answeredAt`, remplace
uniquement le `deviceId`, remet chaque nouvelle copie à `pending` sans
`retryReason` et libère le lot `inFlight` anonyme. La révision et les projections
du compte restent inchangées ; celles de l'espace anonyme ne sont jamais
importées.

Le marqueur, le snapshot anonyme et le snapshot compte retournés doivent être
persistés ensemble dans une transaction IndexedDB ou SQLite. Après chaque accusé
de lot, l'adaptateur appelle `applyAnonymousProgressFusionBatchSuccess`, qui
applique la réponse d'outbox et met à jour le marqueur dans une même valeur à
persister. Les événements déjà acceptés restent ainsi connus même après
compaction immédiate de l'outbox. Une reprise avec
`resumeAnonymousProgressFusion` rejoue uniquement les copies encore non accusées
et échoue sans résultat partiel si un `eventId` porte un autre payload ou si la
capacité pending serait dépassée.

`completeAnonymousProgressFusion` refuse de terminer tant que chaque événement
n'a pas reçu un résultat terminal. Après le dernier accusé, elle retire de la
source les événements acceptés, conserve les rejets avec leur code fermé et
conserve aussi les éventuels événements anonymes plus récents. Un rejet déjà
classé n'est jamais recopié dans une fusion suivante.
Un changement de compte doit rester bloqué tant que le marqueur est
`awaiting_server_ack` ; la source anonyme n'est donc jamais supprimée avant la
confirmation serveur.

## Transport HTTP multiplateforme

`createSyncHttpClient` fournit un adaptateur pur, sans React ni Supabase, pour :

- `POST /api/v1/devices/register` ;
- `DELETE /api/v1/account` ;
- `POST /api/v1/attempts/batch` ;
- `POST /api/v1/content/reports` ;
- `GET /api/v1/progress/snapshot` ;
- `GET /api/v1/account/export`.

Le web peut utiliser une `baseUrl` vide ; le mobile fournit l'origine absolue de
l'API. La session et son jeton Bearer sont demandés juste avant chaque appel :
son `userId` doit rester égal au propriétaire attendu de l'outbox, y compris
après un refresh ou un changement de compte inter-onglets. `fetch` est
injectable pour les tests et les runtimes concernés. Aucun cookie n'est joint
par le client. HTTPS est obligatoire, sauf dérogation explicite d'un build
local, et chaque requête possède un délai borné.

L’export applique en plus le schéma fermé
`thainaute.account-export/v2`, vérifie que l’identité du document correspond au
compte attendu, puis relit la session après la réponse avant de remettre les
données au navigateur ou à l’application native. Un `AbortSignal` externe
permet à la frontière de session d’annuler cette lecture sensible.

Le client ne crée jamais de clé d'idempotence : `sendAttemptBatch` exige le
`PreparedAttemptOutboxBatch` durable produit par l'outbox et réemploie donc sa
clé lors d'une reprise. Il ne mute et n'acquitte aucun snapshot. Seule une
réponse 2xx dont le média, le JSON, le schéma strict et l'ordre des `eventId`
sont valides est rendue à l'appelant, qui peut alors appliquer
`applyAttemptOutboxSuccess` dans sa transaction locale.

`sendContentReport` applique la même frontière de session à une entrée de file
durable. Il transmet uniquement son corps structuré et sa clé d'idempotence ;
`createdAt` reste local. Seules les réponses strictes `received` ou `duplicate`
sont rendues à l'adaptateur qui peut alors acquitter la tête FIFO. La session
est relue après cette réponse : une bascule A→B interdit donc tout acquittement
de l'ancienne file.

Les réponses d'inscription doivent correspondre à l'appareil demandé. Le
snapshot de progression accepte une révision initiale égale à zéro et des états
uniques, triés par `itemId` puis `skill`. Les pannes réseau, absences de session,
erreurs API et violations de protocole ont des classes distinctes ; leurs
messages sont fixes et ne recopient ni jeton, ni corps, ni exception du réseau.

`synchronizeAttemptOutbox` orchestre ensuite une passe bornée : il refuse tout
journal anonyme ou appartenant à un autre compte, puis effectue l'inscription
idempotente de l'appareil, l'hydratation de l'image autoritaire complète, la
reprise des entrées `device_not_registered` et au plus vingt lots séquentiels.
Une erreur conserve le lot `inFlight`; aucune voie d'erreur n'acquitte
localement une tentative.

Les versions SRS persistables sont listées explicitement dans
`SUPPORTED_ATTEMPT_ALGORITHM_VERSIONS`. `OPEN-SRS-001` bloque tout changement
de version avant ajout du dispatch rétrocompatible. La relation exercice/item
est résolue côté serveur conformément à l'ADR-0009.

## Expérience locale v1

`local-experience.ts` versionne l’onboarding et le checkpoint d’une séance sans
dupliquer la progression. Il ne conserve ni texte libre, ni note, ni maîtrise,
ni clé de correction. Le checkpoint `submitting` réserve le payload exact avant
l’enqueue. Après un crash, la reprise réessaie cet enqueue idempotent puis
n’affiche le résultat que lorsque ce même `eventId` est durable dans l’outbox.

Ce contrat sert uniquement la fixture technique tant que
`OPEN-OFFLINE-001` n’a pas défini la correction du vrai contenu hors connexion.
Les catégories d’onboarding ne personnalisent pas le parcours avant
`OPEN-PRODUCT-001`.

## Dépendances

- Zod (MIT, gratuit) fournit la validation runtime du contrat public ;
  l'alternative serait une validation manuelle plus difficile à maintenir.
- Vitest et fast-check (MIT, gratuits) sont limités au développement et
  couvrent respectivement les exemples et les propriétés d'idempotence.
