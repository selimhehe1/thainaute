# ADR-0004 — Progression hors ligne et synchronisation

- Statut : Accepted
- Date : 2026-08-01

## Décision

Séparer les releases de contenu du journal de progression. Chaque réponse crée
un événement immuable identifié par `event_id`, avec appareil, item, note,
horodatage, version du contenu et version de l'algorithme.

Le serveur accepte plusieurs envois du même `event_id` sans appliquer plusieurs
fois son effet. Les projections de maîtrise et de prochaine révision sont
recalculables depuis le journal.

## Conséquences

SQLite mobile et IndexedDB web sont des caches, pas la source de vérité d'un
utilisateur connecté. Les conflits sont résolus par événements et versions,
jamais par remplacement silencieux de toute la base locale.

La progression anonyme reste exclusivement locale et appartient à un
`device_id`. Après authentification, une commande serveur explicite fusionnera
les événements vers l'identité `auth.uid()` ; aucun `user_id` fourni par le corps
client n'est accepté.

Le web persiste désormais un snapshot d'outbox versionné dans IndexedDB via
Dexie. Le mobile persiste le même contrat dans SQLite. Chaque snapshot conserve
les tentatives, les projections autoritaires, la révision connue et au plus un
lot `inFlight` avec sa clé d'idempotence. L'accusé des événements et les
projections sont écrits atomiquement : une coupure ne peut ni recomposer un
retry sous la même clé, ni perdre l'état serveur après avoir libéré le lot.

Le snapshot v3 porte obligatoirement un espace propriétaire : `anonymous` ou
`account:<auth.uid()>`. Les adaptateurs utilisent des clés d'outbox et des
`device_id` distincts par compte. Ils ne lisent jamais automatiquement l'espace
anonyme depuis un espace compte ; la fusion restera une commande explicite,
atomique et consentie. Changer de compte ne réutilise donc ni `syncRevision`, ni
device, ni projections du compte précédent.

ADR-0011 définit désormais le marqueur de reprise, le checkpoint des accusés,
la transaction à deux snapshots et l’identité d’appareil dérivée d’un UUID
d’installation opaque.

La v3 retire aussi `itemId` et `skill` des soumissions clientes. La lecture
accepte les snapshots v1/v2, conserve événements, statuts, propriétaire,
révision et projections, puis supprime ces deux champs dérivés. Un ancien lot
`inFlight` est libéré afin que son corps modifié ne réutilise jamais sa clé
d'idempotence ; le retry suivant reçoit une nouvelle clé et reste dédupliqué
par son `eventId` immuable.

`device_not_registered` reste `pending`, bloque un nouvel envoi et exige un
accusé local d'inscription avant de créer un nouveau lot et une nouvelle clé
d'idempotence. Les événements pending sont plafonnés à 1 000 ; les résultats
terminaux sont compactés aux 200 plus récents après persistance des projections.
SQLite sérialise les mutations dans une file locale et retente brièvement
`SQLITE_BUSY`. Le journal historique est purgé dans la même transaction que sa
migration.

La liste des versions d'algorithme acceptées est explicite dans le contrat de
sync. `OPEN-SRS-001` interdit de changer de version courante sans définir la
rétrocompatibilité, le dispatch serveur et la migration des appareils restés
hors ligne.

La fixture technique continue d'être évaluée localement dans un namespace
IndexedDB/SQLite séparé pour démontrer la boucle, mais elle n'est jamais reprise
par l'outbox synchronisable ni envoyée au serveur. Le branchement distant reste
conditionné à l'enregistrement serveur du profil et de l'appareil, à une fusion
explicitement acceptée après authentification et aux décisions
`OPEN-SRS-001`/`OPEN-OFFLINE-001`. La confiance temporelle est fixée par
l'ADR-0010 : un nouvel événement de plus de trente jours reste local et est
rejeté par le serveur sans réécriture de son heure.
