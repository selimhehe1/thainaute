# ADR-0027 : extrait mobile de contenu réel interne

- Statut : accepté pour le pilote local
- Date : 5 août 2026
- Concerne : `packages/content`, `apps/mobile`, audio Unit 1A

> Distribution remplacée par l'ADR-0041 : cet aperçu reste un outil interne et
> n'appartient plus au graphe Expo distributable.

## Contexte

Le lecteur web peut déjà ouvrir les leçons compilées de l’unité 1. Le mobile
utilisait encore uniquement une fixture mono-exercice. Il faut donner au
cobaye français un premier geste réellement représentatif sur iOS et Android,
sans importer dans Metro le registre web Node.js ni publier une leçon encore
en attente de revue native.

## Décision

Le paquet `@thainaute/content/mobile` expose un bundle JSON embarqué et limité
à `u01-l1a`. Il n’importe ni registre de sources, ni `node:fs`, ni helper du
repository web. L’écran mobile générique reçoit une configuration de tranche
typée : leçon, premier exercice d’écoute, item référencé, audio local et
namespace de stockage.

L’écran `/pilot-lesson` joue uniquement le premier exercice de 1A. Il est
explicitement marqué comme aperçu interne non publiable. Le WAV est résolu
depuis l’asset canonique du paquet de contenu et son identifiant est contrôlé
contre le manifeste avant le build. Aucun autre son n’est substitué en cas de
changement ou d’absence.

La fixture historique reste le comportement par défaut de `/lesson` afin de
préserver les tests de la chaîne technique. Le bouton du parcours mobile ouvre
l’extrait réel ; un démarrage à froid local est autorisé uniquement pour cette
configuration interne. Les tentatives restent locales et ne constituent pas
une release publique.

## Conséquences

- Expo embarque effectivement un asset audio de 1A sur Android et iOS.
- La première tranche mobile couvre contenu réel, écoute, exercice, tentative,
  maîtrise estimée et prochaine révision.
- L’unité complète, les autres assets audio et la revue native restent à
  brancher avant une release ; le mobile ne prétend pas avoir publié Unit 1.
- Une future livraison connectée devra remplacer cette configuration interne
  par le cache de contenu public signé, sans réutiliser le namespace de fixture.
