# ADR-0018 — Parcours visible limité à la fixture locale

- Statut : Accepted for fixture prototype
- Date : 2 août 2026
- Complète : surface P0 « parcours visible par unités » pour la tranche locale
- Ne résout pas : `OPEN-PRODUCT-001`, `OPEN-LEARN-001`,
  `OPEN-CONTENT-001`, `OPEN-OFFLINE-001`

## Contexte

L’onboarding, la séance du jour et la reprise durable savent déjà conserver une
unique leçon de démonstration sur le web et le mobile. L’apprenant ne dispose
cependant d’aucune vue d’ensemble : il ne peut pas distinguer une séance
disponible, en cours, à confirmer ou terminée sans ouvrir directement
« Aujourd’hui ».

Le vrai curriculum, ses unités, ses seuils de maîtrise et sa politique hors
ligne restent soumis à des décisions ouvertes. Présenter plusieurs leçons ou
une progression pédagogique chiffrée reviendrait donc à inventer un produit et
du contenu qui n’ont pas encore été validés.

## Décision

Le premier parcours est une projection en lecture seule de l’état local déjà
persisté :

- il contient exactement une unité technique et une étape, alimentées par la
  fixture synthétique embarquée ;
- il porte partout les mentions « donnée fictive » et « non publiable » ;
- une fonction pure partagée classe le snapshot local dans un ensemble fermé :
  onboarding requis, disponible, en cours, résultat à consulter, terminé ou
  conflit de version ;
- seul le checkpoint `completed` compte comme une étape terminée. Les états
  intermédiaires n’inventent aucun pourcentage pédagogique ;
- un checkpoint visant une autre version ou un autre exercice est affiché
  comme conflit. Il n’est ni supprimé, ni remplacé silencieusement ;
- les interfaces web et mobile relisent le stockage local et orientent vers le
  parcours de reprise existant. Elles ne mutent pas la progression ;
- les unités futures restent explicitement indisponibles jusqu’à validation du
  segment, du contenu, des seuils d’apprentissage et du contrat hors ligne.

La projection ne dépend ni de Supabase, ni du réseau, ni d’un compte. Elle ne
devient pas le schéma canonique des futurs `curricula` et `units`.

## Conséquences

- L’apprenant voit le point de reprise sur les deux familles d’interface sans
  dupliquer les règles d’interprétation du checkpoint.
- Une réponse tardive d’une ancienne lecture ne peut pas écraser l’état affiché
  après une nouvelle tentative ou un retour au premier plan.
- Le stockage corrompu reste intact ; l’interface propose uniquement de relire
  les données.
- Aucun schéma SQL, appel distant, dépendance, secret, variable d’environnement
  ou événement analytics n’est ajouté.
- Le statut « terminé » décrit uniquement la démo technique locale et ne vaut
  ni validation pédagogique, ni maîtrise réelle du thaï.

## Hors périmètre et suite

Cette tranche ne crée pas de curriculum réel, de seconde leçon, de règle de
déverrouillage, de quota, d’entitlement Premium ou de synchronisation de la
vue. Le futur parcours partagé devra être dérivé des releases de contenu
publiées et de la progression autoritaire après résolution des décisions
ouvertes concernées.

La prochaine tranche locale recommandée est le signalement linguistique
structuré, authentifié et désactivé par défaut, relié à une version immuable
sans texte libre ni capacité de publication.

## Validation attendue

- les six états sont projetés de façon exhaustive et identique sur web et
  mobile ;
- un identifiant de version ou d’exercice différent produit un conflit visible ;
- chargement, erreur, nouvelle tentative et reprise au focus sont testés ;
- une erreur de lecture ne réinitialise ni ne remplace le snapshot ;
- l’action principale mène vers l’onboarding, la séance ou le résultat adapté ;
- la progression est annoncée de façon accessible et les cibles tactiles font
  au moins 44 points ;
- la fixture reste explicitement non publiable et aucune unité future fictive
  n’est présentée comme disponible.
