# Ce qui sépare réellement le corpus de la publication

Date : 2026-08-13. Mesure rejouable :
`node scripts/content/mesurer-portes-de-publication.mjs`, recoupée avec
`pnpm content:audit`.

## Le constat qui change le plan

Le plan de reprise supposait que l'audio tenait les 61 leçons en brouillon, et
la décision du fondateur de traiter l'audio en dernier reposait sur cette
hypothèse. **Elle est fausse.**

Décomposition des 252 bloqueurs actifs :

| Bloqueur                       | Leçons touchées | Nature                            |
| ------------------------------ | --------------: | --------------------------------- |
| `WORKFLOW_NOT_PUBLISHED`       |              61 | drapeau levé au moment de publier |
| `VISIBILITY_NOT_PUBLIC`        |              61 | drapeau levé au moment de publier |
| `HUMAN_AUTHOR_MISSING`         |              61 | **signature humaine**             |
| `HUMAN_AUDITOR_MISSING`        |              61 | **signature humaine**             |
| `AUDIO_ASSET_MISSING`          |               7 | fichiers audio absents            |
| `LINGUISTIC_FIELDS_INCOMPLETE` |               1 | champ à compléter                 |

Les deux premiers se lèvent mécaniquement pendant la publication. Les deux
suivants attendent `content/signatures/NN.json`, c'est-à-dire un acte du
fondateur après lecture du dossier de preuve.

**Ce n'est donc pas l'audio qui tient 61 leçons en brouillon. C'est l'absence
de signature.**

## Les sept leçons que l'audio bloque vraiment

| Leçon     | Exercices d'écoute sans fichier |
| --------- | ------------------------------: |
| `u02-l2b` |                               1 |
| `u03-l3b` |                               8 |
| `u04-l4b` |                               6 |
| `u05-l5d` |                               6 |
| `u07-l7e` |                               6 |
| `u08-l8b` |                               6 |
| `u08-l8c` |                               8 |

Soit 41 exercices d'écoute muets, répartis sur sept leçons de six unités. La
porte les bloque, et elle a raison de le faire.

## Le trou que personne ne mesurait

C'est le vrai résultat de cette mesure, et il est plus gênant que l'audio.

| Unité   | Leçons | Exercices | Dont écoute |
| ------- | -----: | --------: | ----------: |
| u01     |      6 |        48 |          27 |
| u02     |      5 |        18 |           1 |
| u03     |      5 |        34 |           8 |
| u04     |      5 |        22 |           6 |
| u05     |      5 |        26 |           6 |
| **u06** |      5 |        17 |       **0** |
| u07     |      5 |        26 |           6 |
| u08     |      5 |        45 |          14 |
| **u09** |      5 |        26 |       **0** |
| **u10** |      5 |        56 |       **0** |
| **u11** |      5 |        22 |       **0** |
| **u12** |      5 |        23 |       **0** |
| **u13** |      5 |        30 |       **0** |

**Six unités entières, trente leçons, 174 exercices, n'ont aucun exercice
d'écoute.** Cinquante-cinq leçons sur soixante-quatre n'en ont aucun.

Aucune porte ne le signale, et c'est logique : la porte vérifie que l'audio
_référencé_ existe. Elle ne vérifie pas qu'une leçon de langue fait écouter
quelque chose. Ces unités passeraient donc tous les contrôles et se
publieraient sans un seul son.

Un apprenant pourrait traverser les unités 9 à 13, cent cinquante-sept
exercices, sans jamais entendre un mot de thaï, et le produit se déclarerait
complet.

Le brief demande explicitement que les cinq mécaniques soient garanties dans le
produit et réparties de façon équilibrée sur le parcours. Ce n'est pas le cas,
et rien ne le mesurait.

## Ce que cela implique pour la suite

1. **La production audio n'est pas le préalable qu'on croyait.** Sept leçons en
   dépendent, pas soixante et une. Le chiffrage d'un lot d'audio doit donc être
   comparé au bénéfice réel, unité par unité, et non traité comme une porte
   universelle.
2. **Le préalable réel est éditorial et humain.** Produire les dossiers de
   preuve par unité, les faire lire, puis signer.
3. **Le déséquilibre des mécaniques est un défaut de contenu**, pas un défaut
   d'outillage. Il se corrige en écrivant des exercices d'écoute dans les
   unités 6 et 9 à 13, ce qui créera ensuite un besoin d'audio réel pour ces
   unités.
4. **Une porte manque.** Rien n'empêche aujourd'hui de publier une unité de
   langue sans aucune écoute. Le seuil acceptable est une décision du
   fondateur, pas une évidence technique : il n'est donc pas posé ici.

## Ce que cette mesure ne dit pas

Elle compte des exercices, pas de la qualité pédagogique. Une unité avec des
exercices d'écoute peut rester faible, et une unité sans écoute peut être
volontairement consacrée à la lecture. Le déséquilibre constaté demande un
jugement éditorial, que ce document n'a pas la prétention de rendre.
