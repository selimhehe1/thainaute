# ADR-0006 — SRS déterministe provisoire

- Statut : Accepted for prototype
- Date : 2026-08-01

## Décision

La tranche fictive utilise `srs-v0`, sans dépendance externe. Une bonne réponse
ajoute 250 points de maîtrise sur 1000 et programme successivement 1, 3, 7, 14
puis 30 jours. Une erreur retire 250 points, sans passer sous zéro, et programme
une reprise dix minutes plus tard. L'ordre canonique est `answeredAt`, puis
`eventId`.

Le client n'envoie jamais la note, la maîtrise ou la prochaine échéance. Il peut
les calculer pour un retour hors ligne, mais le serveur les recalcule à partir de
la version immuable du contenu. Trois réussites et 750 points sont nécessaires
avant d'afficher un état confirmé.

## Conséquences

Cet algorithme prouve le déterminisme et l'idempotence ; il n'est pas une
validation pédagogique. `OPEN-LEARN-001` reste ouverte. Toute calibration future
créera une nouvelle `algorithm_version` et conservera la reproductibilité des
événements existants.
