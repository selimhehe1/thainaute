# ADR-0041 : quarantaine du contenu mobile non publié

- Statut : accepté
- Date : 9 août 2026
- Concerne : application mobile, contenu U01, exports Expo

## Contexte

Les leçons U01 sont encore `draft/internal`. Les aperçus mobiles décrits par les
ADR-0027 à ADR-0029 et ADR-0033 embarquaient pourtant leurs JSON et leurs WAV
dans les exports Expo. Un écran marqué « interne » ne constitue pas une
protection : le contenu reste extractible de l'APK ou de l'IPA.

## Décision

Le graphe distributable sous `apps/mobile/app` n'importe aucun bundle, manifeste
ou média U01 tant que la leçon n'est pas `published/public`. Aujourd'hui et
`/lesson` utilisent seulement la fixture technique. Les anciennes interfaces
d'essai restent sous `apps/mobile/internal` pour les tests et le travail local,
hors du graphe Expo ; leurs anciennes routes publiques échouent de manière
fermée.

Le contenu réel mobile passe uniquement par la livraison serveur déjà bornée à
une release `published/public`. Aucun drapeau d'environnement ne réactive les
brouillons embarqués.

Chaque build mobile contrôle ensuite les exports Android et iOS : un seul WAV,
identique à la fixture autorisée, et aucun identifiant, titre, objectif ou
identifiant audio des six leçons U01. Un écart fait échouer le build.

Cette décision remplace les affirmations de distribution locale des ADR-0027,
ADR-0028, ADR-0029 et ADR-0033. Leurs choix de modèle d'exercice et leurs
interfaces internes restent des travaux préparatoires, pas une autorisation de
distribution.

## Conséquences

- un APK ou un IPA public ne révèle plus les brouillons linguistiques ;
- la démonstration technique reste utilisable hors ligne ;
- les tests internes peuvent continuer sans élargir le produit distribué ;
- toute future réintégration embarquée exigera une nouvelle décision, les
  portes éditoriales complètes et une adaptation explicite du contrôle de build.
