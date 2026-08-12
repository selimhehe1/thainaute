# Ordre du parcours, décidé par la difficulté réelle pour un francophone

Statut : appliqué à l'unité 1, proposé pour les unités 2 à 13.
Date : 2026-08-05.

## Pourquoi ce document existe

L'ordre des leçons n'avait jamais été écrit. Dans le code, il valait
`Object.keys(LECONS_COMPILEES).sort()` : la séquence pédagogique, qui est la
décision produit la plus lourde d'un cours de langue, était une conséquence
accidentelle de l'ordre alphabétique des identifiants. Elle n'avait donc
jamais pu être discutée, puisqu'elle n'existait nulle part comme décision.

Ce document écrit la décision, dit sur quoi elle s'appuie, et laisse une
trace de ce qui a été mesuré plutôt que supposé.

## Ce qui est réellement difficile pour un francophone

Classement par difficulté décroissante, du point de vue d'un locuteur
natif du français. Le critère n'est pas « ce qui est exotique », mais
**ce que le français ne permet pas d'entendre ou de produire par défaut**.

### Rang 1 : les catégories que le français n'a pas du tout

Un francophone ne fait pas une approximation, il fait une **substitution
complète** et n'entend pas son erreur.

1. **Le ton lexical.** Le français utilise la hauteur pour l'attitude, jamais
   pour le mot. La difficulté n'est pas d'entendre la hauteur, un francophone
   l'entend très bien, mais de la traiter comme faisant partie du mot. S'y
   ajoute une interférence précise : le français descend en fin de phrase
   déclarative, ce qui corrompt systématiquement les tons haut et montant en
   position finale.

2. **La longueur vocalique distinctive.** Le français l'a perdue. Le thaï
   oppose neuf paires de voyelles longues et brèves, et la longueur y
   distingue des mots. C'est probablement **plus difficile que les tons**, et
   c'est sous-estimé pour une raison simple : les tons sont saillants, alors
   que la longueur ne l'est pas du tout pour une oreille française, qui ne
   remarque même pas qu'il y a quelque chose à entendre.

3. **Les voyelles /ɯ/ et /ɤ/.** Le français possède /y/ et /ø/, qui sont
   **antérieures et arrondies**. Le thaï demande **postérieure et non
   arrondie**. Les deux traits sont faux à la fois. Un francophone dira
   systématiquement /ʃø/ pour ชื่อ, et ne s'entendra pas se tromper.

4. **L'opposition à trois termes des occlusives**, /p/ contre /pʰ/ contre
   /b/. Le français n'en a que deux. Bonne nouvelle rarement dite : le /p/
   français est **non aspiré**, il correspond donc directement au ป thaï, ce
   qui est un vrai avantage sur un anglophone, dont le /p/ initial est
   aspiré. La difficulté est de l'autre côté, produire et entendre พ /pʰ/.

### Rang 2 : le son existe en français, mais pas à cette place

5. **Les finales occlusives non relâchées** /p̚ t̚ k̚/. Le français relâche
   toutes ses finales. Une finale thaïe est bloquée, presque inaudible.

6. **/ŋ/ à l'initiale.** Le français ne connaît [ŋ] qu'en finale d'emprunts
   (« parking »). En attaque de syllabe, il est très difficile.

### Rang 3 : réel mais accessible

7. ร, battue ou roulée alvéolaire, contre le /ʁ/ uvulaire français.
8. L'écriture : 44 consonnes en trois classes, ton déterminé par la classe,
   le type de syllabe et la marque, voyelles écrites autour de la consonne.
9. Les classificateurs, catégorie grammaticale absente du français.

### Ce qui est plus facile qu'on ne le croit, et qu'il faut dire

Pas de conjugaison, pas de genre, pas de pluriel, pas d'article, pas de cas.
Le taire serait malhonnête : la grammaire thaïe est un soulagement pour un
francophone, et c'est ce qui rend le coût phonétique supportable.

## Premier problème mesuré : l'échelle des tâches était inversée

### Le constat

Avant la correction, la toute première question du parcours demandait
d'identifier un ton **parmi cinq**, à quelqu'un qui n'avait jamais entendu de
thaï. Dans cette ancienne séquence, les leçons 1C et 1D proposaient ensuite
des choix **binaires**.

La tâche la plus difficile arrivait donc en premier, et l'échafaudage qui la
rend possible arrivait après.

### Ce qui rend le constat solide

Le choix des contrastes de 1C (moyen contre bas) et 1D (montant contre haut)
est **bon et sourcé**. Le dossier de production de 1C cite Wayland et Guion,
deux travaux d'entraînement perceptif consacrés à ces paires chez des
auditeurs non natifs. Ce sont bien les paires les plus confusables, donc
celles qui méritent un entraînement dédié.

Mais ces travaux entraînent les auditeurs naïfs **un contraste à la fois, en
choix binaire**. L'exercice d'ouverture de 1A contredisait donc la
méthodologie qui fonde les leçons 1C et 1D du même parcours. Le problème
n'est pas le contenu, il est le placement.

### La décision appliquée

Une échelle de tâche explicite, indépendante de l'ordre de rédaction :

| Rang | Leçon     | Tâche                                     | Choix |
| ---- | --------- | ----------------------------------------- | ----- |
| 1    | `u01-l1a` | descendant contre montant (écart maximal) | 2     |
| 2    | `u01-l1b` | longueur vocalique, fondation             | 2     |
| 3    | `u01-l1c` | moyen contre bas (paire confusable)       | 2     |
| 4    | `u01-l1d` | montant contre haut (paire confusable)    | 2     |
| 5    | `u01-l1f` | les cinq tons, synthèse                   | 5     |
| 6    | `u01-l1e` | premier dialogue                          | aucun |

Le premier barreau oppose les deux seuls tons qui **bougent en sens
inverse** : c'est le seul contraste des cinq raisonnablement identifiable
sans entraînement préalable, parce qu'il ne demande aucune référence de
hauteur, seulement une direction. La longueur vocalique vient immédiatement
après cette exposition : elle est indépendante du duel tonal, mais elle doit
être installée avant les deux contrastes qui la déclarent comme prérequis.

L'exercice à cinq choix n'a pas été supprimé. Il a été déplacé dans une
leçon de synthèse nouvelle, `u01-l1f`, au terme de l'arc tonal.

Les identifiants n'ont **pas** été renommés : `u01-l1c` est cité par 30
leçons du corpus et `u01-l1d` par 35. L'ordre est porté par une constante
explicite dans `packages/content/src/repository.ts`. La longueur est placée
avant les deux duels tonals pour que l'ordre d'exécution et les prérequis
déclarés racontent la même histoire.

La leçon 1F ne contient **aucun matériel lexical neuf** : ses cinq items et
leurs sources sont repris verbatim de 1A. Ses cinq audios doivent toutefois
être produits dans le périmètre de 1F, avec un manifeste et des chemins propres
à cette leçon. Le manifeste est actuellement vide : aucun appel à un
fournisseur ni aucune dépense n'a été lancé tant que la dette audio n'est pas
financée et auditée.

## Second problème mesuré : un son exigé avant d'être enseigné

### Le constat

`scripts/content/verifier-dette-phonetique.mjs` compare, pour chaque
difficulté connue, la première leçon qui **exige** le son et la leçon qui
l'**enseigne**.

| Son  | Première exigence         | Enseigné  | Écart     |
| ---- | ------------------------- | --------- | --------- |
| /ɤ/  | `u01-l1e` (แล้วเจอกัน)    | `u06-l6a` | 22 leçons |
| /ɯ/  | `u02-l2d` (ชื่อ, « nom ») | `u06-l6a` | 17 leçons |
| /kʰ/ | `u01-l1a` (คา)            | `u04-l4a` | 16 leçons |
| /tʰ/ | `u02-l2c` (ขอโทษ)         | `u03-l3a` | 3 leçons  |

Chiffres produits par l'outil, pas recopiés à la main. Le cas de /kʰ/ mérite
une nuance que l'outil ne peut pas porter : sa première apparition est คา en
1A, où la leçon ne demande **aucune production**, seulement de l'écoute. La
dette y est donc moins lourde qu'elle n'en a l'air, contrairement à celle de
/ɯ/, exigée en production dès que l'apprenant dit son nom.

Le cas de /ɯ/ est le plus coûteux. L'apprenant **dit son propre nom**
(`ผมชื่อ …`) à l'unité 2, **compte jusqu'à cent** (`หนึ่ง`) à l'unité 3 et
**commande à boire** (`ดื่ม`) à l'unité 4, en utilisant une voyelle qui n'est
enseignée qu'à l'unité 6. Comme le français n'a pas cette voyelle du tout
(rang 1 ci-dessus), l'apprenant installe une prononciation fausse sur ses
phrases les plus fréquentes, et devra la désapprendre.

### Ce qui n'est pas une dette, malgré l'alerte de l'outil

Les marques de ton écrites (่ ้ ๊ ๋) apparaissent dès l'unité 1 et ne sont
enseignées qu'à l'unité 7. C'est **délibéré** : l'unité 1 travaille l'oreille
et dit explicitement de ne pas retenir la graphie. L'outil signale l'écart,
un humain tranche. C'est le partage voulu.

### Décision proposée, pas encore appliquée

Enseigner /ɯ/ et /ɤ/ **au point de besoin**, c'est-à-dire dans l'unité 2,
juste avant `u02-l2d` « Dire qui on est », plutôt que 17 leçons trop tard.
La leçon `u06-l6a` deviendrait la consolidation au lieu de l'introduction.

Cette modification n'est **pas** appliquée : les unités 2 à 13 ne sont pas
encore compilées, et le volume de la bêta reste une décision ouverte du
fondateur. La dette est mesurée, l'outil la surveille, l'arbitrage reste à
faire.

## L'ordre thématique des unités n'est pas modifié

Les treize unités enchaînent salutations, nombres, nourriture, déplacements,
famille, maison, achats, santé, lecture, conversation, bilan et particules.
Cette progression thématique est cohérente et n'est pas remise en cause.

Elle est aussi coûteuse à déplacer : le corpus compte 1174 citations entre
leçons, soit 18 par leçon. Les 20 citations qui pointent vers l'avant sont
toutes **internes à une unité**, ce qui signifie que les dépendances entre
unités sont bien orientées. Déplacer une unité entière casserait cet
ordonnancement, alors que corriger la colonne phonétique qui la traverse ne
casse rien.

C'est pourquoi la décision porte sur **la colonne phonétique et l'échelle
des tâches**, pas sur les thèmes.

## Ce qui reste ouvert

1. L'arbitrage sur /ɯ/ et /ɤ/, à appliquer quand les unités 2 et suivantes
   seront compilées.
2. Le seuil « 4 fois sur 5 » des objectifs, repris de la rédaction initiale
   et jamais mesuré sur des apprenants réels.
3. La normalisation du vocabulaire de hauteur : `ton` désigne le contraste
   lexical thaï, tandis que `contour tonal` ou `courbe de hauteur` désigne sa
   réalisation acoustique. Les 117 occurrences historiques de « mélodie » dans
   33 leçons doivent encore être relues avant publication ; elles ne sont pas
   remplacées mécaniquement.
4. Les blocs d'exercices refusés à la compilation, dont la cause est
   maintenant connue : le corpus écrit les associations tantôt en tableau
   markdown, tantôt en liste numérotée, et l'extracteur ne lit que la
   seconde forme.
