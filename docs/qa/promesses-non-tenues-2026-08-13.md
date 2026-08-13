# Les leçons qui promettent ce qu'elles ne mesurent pas

Date : 2026-08-13. Mesure rejouable :
`node scripts/content/mesurer-promesses-tenues.mjs`.

## Le constat

**48 leçons sur 66 annoncent un objectif qu'aucun de leurs exercices ne
mesure.** Quarante-sept de ces contradictions portent sur l'écoute.

| Promesse non tenue | Leçons |
| ------------------ | -----: |
| écoute             |     47 |
| lecture            |      1 |
| rappel             |      1 |

Ce n'est pas un jugement de goût sur la pédagogie. C'est une contradiction
entre ce qu'une leçon déclare dans `objectiveFr` et ce que contient sa liste
d'exercices, et elle est vérifiable ligne à ligne.

## Une est déjà en ligne

`u01-l1c` est **publiée**. Elle contient **un seul exercice**, un ordre des
mots, et son objectif promet de l'écoute. Un apprenant qui l'ouvre aujourd'hui
lit une promesse que la leçon ne tient pas.

C'est le seul cas publié, et c'est le plus important : les 47 autres sont
encore en brouillon, donc rattrapables avant qu'ils n'atteignent quiconque.

Le contenu publié est immuable : corriger `u01-l1c` demande une nouvelle
version, avec des exercices d'écoute et l'audio correspondant, pas une
retouche en place.

## Ce que cela révèle

Ce ne sont pas 48 défauts indépendants. C'est un seul, systémique.

Le curriculum a été écrit avec l'oreille au centre, ce qui est juste pour une
langue à tons. Les exercices d'écoute, eux, n'ont été produits que pour
l'unité 1. Les objectifs des unités 2 à 13 décrivent donc une pédagogie que
leurs exercices n'implémentent pas encore.

Rapproché de `portes-de-publication-2026-08-13.md`, cela donne la vraie forme
du travail restant : ce n'est pas « produire l'audio des leçons existantes »,
c'est « écrire les exercices d'écoute que les objectifs annoncent déjà, puis
produire leur audio ».

## Un piège de mesure, consigné

La première version de ce script trouvait 28 leçons. Elle était fausse.

En JavaScript, `\b` est une frontière de mot **ASCII** et `\w` ne contient
aucune lettre accentuée. Le motif `\bécout\w+` ne correspond donc jamais :
entre une espace et « é », il n'y a pas de frontière au sens ASCII. Seules les
promesses commençant par une lettre non accentuée étaient détectées.

Tout motif d'analyse du français écrit avec `\b` et `\w` est faux par
construction. Le script utilise désormais `\p{L}` et des assertions explicites.

## Ce que cette mesure ne dit pas

Elle lit des objectifs et compte des mécaniques. Elle ne juge ni la qualité
d'un exercice, ni la pertinence d'un objectif. Une leçon peut tenir sa promesse
avec un seul bon exercice d'écoute, et en rater le sens avec dix mauvais.

Elle ne détecte pas non plus les promesses formulées autrement que par les
tournures listées dans le script. Le chiffre de 48 est donc un plancher.

## Aucune porte n'est posée

Le seuil acceptable appartient au fondateur. Transformer ce constat en
bloqueur de publication ferait échouer une leçon déjà publiée et changerait la
politique de publication : c'est une décision produit, pas une évidence
technique.
