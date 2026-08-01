# ADR-0010 — Confiance temporelle des tentatives

- Statut : Accepted
- Date : 2026-08-01
- Résout : `OPEN-SYNC-001`
- Critères concernés : `AC-LEARN-001`, `AC-OFFLINE-001`
- Décisions verrouillées concernées : `DEC-005`, `DEC-007`, `DEC-008`

## Contexte

Une tentative créée hors ligne transporte `answeredAt`, nécessaire pour
reconstruire le journal pédagogique dans son ordre réel. Cette heure vient
cependant d'un appareil non fiable : une horloge très décalée ou manipulée peut
repousser artificiellement une révision. À l'inverse, remplacer silencieusement
la valeur par l'heure de réception casserait l'identité idempotente de
l'événement et effacerait l'ordre d'une session hors ligne légitime.

## Décision

Le serveur capture une seule heure au début de chaque commande
`POST /api/v1/attempts/batch`. Cette valeur est figée pour tout le lot et pour
les trois recalculs éventuels provoqués par un conflit de révision.

Pour un `eventId` encore inconnu, `answeredAt` est accepté dans la fenêtre
inclusive suivante :

```text
heure serveur - 30 jours <= answeredAt <= heure serveur + 5 minutes
```

Une valeur extérieure produit le rejet fermé `invalid_submission` pour cette
tentative seulement. Les autres événements du lot restent traitables.

Un `eventId` déjà présent est classé avant d'appliquer cette fenêtre : un
payload identique reste un `duplicate`, même lors d'un rejeu plus de trente
jours après sa création ; un payload différent reste un
`event_id_collision`. L'idempotence ne dépend donc pas de la date du retry.

L'heure acceptée est normalisée au format UTC par le contrat public puis
conservée exactement. Elle n'est ni tronquée, ni plafonnée, ni remplacée. Le
hash durable et la projection SRS utilisent cette même valeur. Une tentative
antidatée rend au pire une révision due plus tôt ; la capacité à la repousser
est bornée à cinq minutes.

PostgreSQL attribue séparément `received_at` avec son `default now()`. Le rôle
`service_role` peut insérer uniquement les colonnes calculées de
`attempt_events` et n'a aucun privilège d'insertion sur `received_at`. Ce champ
est l'heure d'audit autoritaire, jamais une entrée de l'API ou de la RPC.

Une contrainte SQL de défense en profondeur accepte
`[received_at - 31 jours, received_at + 10 minutes]`. Cette marge plus large
n'est pas la politique produit : elle absorbe seulement un faible écart entre
les horloges Node.js et PostgreSQL et ferme les écritures directes aberrantes.
L'API reste l'autorité sur la fenêtre exacte de trente jours et cinq minutes.

## Conséquences

- Un appareil hors ligne plus de trente jours ne peut pas créer tardivement un
  nouvel événement distant ; le client doit conserver le résultat local et
  expliquer son rejet, sans falsifier son heure.
- Un retry d'un événement déjà committé reste sûr sans exception temporelle
  spéciale ni nouveau hash.
- `answered_at` conserve la chronologie pédagogique ; `received_at` conserve
  la chronologie d'audit.
- L'index `(user_id, device_id)` couvre la clé étrangère correspondante et les
  vérifications par appareil.
- La migration est additive pour les données valides. Un rollback ne doit pas
  rendre `received_at` insérable tant qu'une version applicative dépend encore
  de cette garantie ; on retire d'abord la contrainte et l'index sur un
  environnement isolé, jamais automatiquement avec un rollback applicatif.

## Validation

Les tests TypeScript couvrent les quatre bornes à la milliseconde, la
conservation exacte de `answeredAt`, les doublons/collisions historiques et
l'unicité de l'heure serveur à travers un retry. Les tests pgTAP couvrent la
contrainte SQL, son index, les privilèges de colonnes et l'attribution par
défaut de `received_at`.

## Références officielles

- [PostgreSQL — contraintes](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — privilèges](https://www.postgresql.org/docs/current/ddl-priv.html)
- [PostgreSQL — date et heure courantes](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
