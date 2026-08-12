# ADR-0033 — Expédition mobile mixte et portes audio

- Statut : accepté
- Date : 2026-08-06
- Portée : application mobile, contenu interne de l’unité 1

> Distribution remplacée par l'ADR-0041 : cette expédition reste un outil
> interne hors du graphe Expo distributable.

## Contexte

Une leçon thaï ne se résume pas à une série d’écoute. Le parcours canonique
doit pouvoir enchaîner audio, association, ordre des mots, rappel et lecture,
tout en conservant un checkpoint local et un journal de tentatives communs.
Les manifestes 1B et 1F ont d’abord été incomplets : le manifeste 1F contenait
en outre des chemins provenant de 1A. Réutiliser ces fichiers aurait créé une
incohérence linguistique et aurait contourné la porte de publication.

## Décision

- Le mobile utilise un contrôleur d’expédition mixte ordonné par le bundle de
  leçon ; chaque exercice reste associé à son item et à sa compétence.
- Les choix audio et les réponses typées passent par le même checkpoint local,
  la même outbox et le même calcul SRS local.
- La navigation mobile des leçons disponibles passe par
  `mobile-lesson-expedition`; les anciens écrans audio et mécaniques restent
  conservés pour compatibilité et comparaison de test.
- Une leçon n’entre dans la carte des expéditions mixtes que si ses audios
  locaux sont résolus et que leurs chemins appartiennent à la bonne leçon.
- Les sept audios de 1B et les cinq audios de 1F sont désormais produits,
  rouverts, contrôlés par empreinte et vérifiés tonalement fichier par fichier.
- La présence dans l’expédition mobile ne remplace pas la revue native,
  l’audit linguistique, la provenance et la licence ; aucune leçon n’est donc
  promue automatiquement en publication.

## Conséquences

Le parcours démontrable couvre désormais 1A, 1B, 1C, 1D, 1E et 1F avec une
seule expérience mobile. La correction d’une réponse audio et celle d’une
réponse typée produisent des événements et des projections SRS compatibles
avec la reprise hors ligne. Les six leçons restent toutefois des aperçus
internes tant que la revue native, l’audit linguistique, la provenance et la
licence ne sont pas réalisés.

La prochaine étape est la recette cobaye sur appareil, puis la revue native des
audios et le pilote francophone ; aucune publication distante n’est autorisée
par cette ADR.
