# ADR-0023 — Lecteur « Expédition » et système de récompenses

- Statut : Accepted (concept et maquette interactive validés par le fondateur
  le 2 août 2026)
- Date : 2 août 2026
- Complète : ADR-0022 et les principes de rétention éthique du brief
- Ne choisit pas : le contenu pédagogique réel, les fournisseurs audio, la
  déclinaison mobile détaillée

## Contexte

Le fondateur veut une expérience d'apprentissage aussi engageante qu'un jeu.
Le brief interdit les mécaniques punitives et infantilisantes (vies, faux
rabais, classements agressifs, monnaies virtuelles). La rétention doit venir
de la preuve de progression réelle. Une maquette interactive du lecteur de
leçon a été construite, jouée et validée.

## Décision

### Le rythme du lecteur

- Une carte plein écran par exercice, un seul geste demandé, cinq mécaniques
  (écoute, association, ordre des mots, rappel, lecture).
- Après une bonne réponse, passage automatique à la carte suivante après
  environ 800 ms ; désactivable dans les réglages et inactif sous
  `prefers-reduced-motion`.
- Une erreur ne punit jamais : indice contextuel, nouvel essai, aucune perte.
- Les pages d'enseignement (spécimen thaï géant, courbe du ton, explication
  brève pensée pour l'oreille française) alternent avec les séries de cartes.
- Une anecdote culturelle surprise s'insère aux deux tiers de la séance.
- Moment signature à construire : pendant la lecture d'un audio, la courbe du
  ton se dessine en synchronisation avec le son.

### Le feedback

- Tampon « Juste » à chaque bonne réponse (rebond bref), micro-son de
  réussite discret et désactivable, retour haptique léger sur mobile.
- La courbe de progression de la séance se trace d'un cran par réussite ; la
  portion nouvellement tracée scintille une fois.
- Fin de séance : la courbe s'achève, le tampon d'acquis s'appose, le
  récapitulatif liste les mots avec leur jauge de maîtrise et la prochaine
  révision.

### La hiérarchie des récompenses

1. **Micro** (chaque réponse) : tampon, son, haptique.
2. **Séance** : courbe complétée, récapitulatif, tampon d'acquis quand un mot
   franchit le seuil SRS (750 ‰ et 3 réussites).
3. **Unité** : un timbre d'expédition saffron unique par unité terminée,
   apposé sur la carte du parcours. Douze timbres pour le parcours
   fondamental : la rareté fait la valeur.
4. **Long terme** :
   - **Le carnet feuilletable** : chaque mot acquis devient une page
     consultable (mot, tampon daté, courbe de maîtrise). La collection est du
     savoir réel.
   - **Les moments de réel** : à des seuils d'acquis, l'application présente
     un contenu authentique (enseigne, message, menu) que l'utilisateur peut
     désormais comprendre en entier. C'est la récompense différenciante.
   - **Les sons débloqués** : maîtriser un phonème ou un ton l'ajoute au
     clavier des sons du futur laboratoire. La progression donne des
     capacités, pas des cosmétiques.
   - **La courbe de constance** : la semaine se dessine jour après jour ; un
     jour manqué fait un plateau, jamais une chute.

### Exclusions définitives

Gemmes et monnaies virtuelles, coffres et récompenses aléatoires acquises,
classements entre personnes, compteurs de série punitifs. Ces mécaniques
repositionneraient le produit en jouet et contrediraient la promesse « je
progresse réellement ».

## Conséquences

- La tranche « cinq mécaniques d'exercices » implémente d'abord les schémas
  de contenu manquants (association, ordre des mots, rappel, lecture), puis
  le lecteur selon cette cible, la maquette faisant référence visuelle.
- Les moments de réel et le carnet feuilletable exigent du contenu audité :
  ils arrivent avec le curriculum, pas avant.
- Tout nouvel élément de feedback respecte `prefers-reduced-motion` et reste
  compréhensible sans son ni couleur seule.
