# ADR-0028 : catalogue mobile local et portes d’aperçu

- Statut : accepté
- Date : 5 août 2026
- Concerne : contenu embarqué mobile, parcours et lecteur local

> Distribution remplacée par l'ADR-0041 : le catalogue U01 reste interne et
> n'appartient plus au graphe Expo distributable.

## Contexte

Les six leçons de l’unité 1 sont compilées, mais leur état mobile n’est pas
homogène. Certaines n’ont pas encore de manifeste audio résoluble ; d’autres
utilisent une mécanique de réponse typée dont la correction synchronisée n’est
pas encore autoritaire sur mobile.

Afficher une leçon comme jouable dans ces conditions ferait croire à un
parcours complet et pourrait conduire à enregistrer une tentative sans média ou
sans correction fiable.

## Décision

- Le mobile embarque les six bundles JSON dans l’ordre pédagogique canonique.
- Le catalogue expose l’état de chaque leçon.
- Une leçon n’est ouverte que si son premier exercice et son audio local
  passent une porte de cohérence au build.
- Les aperçus actuellement ouverts sont 1A et 1D. Ils lancent une expédition
  locale de six exercices `audio_choice`, avec le WAV correspondant à chaque
  entrée du manifeste.
- Les leçons bloquées restent visibles avec une raison compréhensible : audio
  à embarquer ou mécanique mobile en préparation.
- Le lecteur conserve un espace `learning` séparé de la fixture de démonstration
  et peut abandonner proprement un ancien checkpoint terminé lorsqu’un
  apprenant ouvre une expédition réelle.
- Le checkpoint d’expédition est écrit avant les choix ; chaque sélection et
  chaque tentative restent rejouables dans le même journal local, puis le
  résultat est consigné dans le plan avant de passer à l’exercice suivant.

## Conséquences

Le parcours mobile devient inspectable et honnête sans publier de contenu ni
inventer de média. La progression locale couvre maintenant contenu → audio →
exercice → tentative → maîtrise → prochaine révision pour les deux aperçus.
La prochaine extension peut ouvrir les autres mécaniques une par une après
ajout de leur correction, de leurs médias et de leurs tests.
