# ADR-0034 — Borne du checkpoint d’expédition mobile

- Statut : accepté
- Date : 2026-08-06
- Portée : `packages/sync`, expéditions mobiles mixtes

## Contexte

La première recette Android a révélé que la leçon interne 1B compile 21
exercices mixtes. Le checkpoint local était encore limité à 20 exercices :
le démarrage échouait donc lors de la validation de l’état, avant le premier
exercice. Réduire la liste côté écran aurait supprimé du contenu sans le
signaler.

## Décision

La limite de `LOCAL_EXPEDITION_MAX_EXERCISES` passe à 24. Elle reste une borne
stricte de sécurité pour la taille du checkpoint et des résultats, tandis que
le plan de la leçon est conservé intégralement. Toute leçon dépassant cette
borne doit être découpée ou explicitement modélisée en viviers avant d’entrer
dans une expédition.

## Conséquences

- 1B peut démarrer et reprendre ses 21 exercices sans perte silencieuse ;
- la limite reste testée dans le domaine et dans le parcours mobile ;
- aucun contenu n’est promu, publié ou synchronisé par cette correction ;
- une future leçon de plus de 24 exercices devra faire l’objet d’une décision
  pédagogique dédiée, pas d’un relèvement automatique.
