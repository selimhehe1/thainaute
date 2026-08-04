# Contre-audit adversarial de `u11-l11e`

- Fichier audité : `content/authoring/unite-11/lecon-11e.md`
- Date : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Consigne : chercher des erreurs, pas confirmer. Rien de ce rapport n'est repris
  du fichier audité : chaque affirmation ci-dessous a été recomputée par script,
  par consultation RID, par consultation VOLUBILIS sur l'exemplaire dont
  l'empreinte est vérifiée, ou par consultation Wiktionary en rendu.
- Ce rapport REMPLACE la version antérieure du même nom, qui déclarait les
  citations VOLUBILIS « non vérifiées, faute de classeur ». Le classeur a été
  retrouvé (`%TEMP%\VOLUBILIS_Database.xlsx` et `%TEMP%\VOLUBILIS.ods`,
  empreintes conformes) et toutes les citations ont donc été refaites.

## 0. Méthode et outillage

| Contrôle                               | Commande réellement exécutée                                                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Réemploi, 5 champs                     | `node scripts/verification/item-fields-check.mjs content/authoring/unite-11/lecon-11e.md`                                                                                    |
| Réemploi, `fr`, `litteral`, `registre` | extraction des blocs d'item de `1e`, `2b`, `2c`, `2d`, `2e`, `5e`, `6e` avec le MÊME analyseur de champ que `item-fields-check.mjs`, puis comparaison chaîne à chaîne        |
| Décomptes d'unité                      | `node scripts/verification/repo-thai-scan.mjs 11 11`                                                                                                                         |
| Décompte par fichier                   | même fonction `entriesOf`, appliquée fichier par fichier                                                                                                                     |
| Corps d'entrée RID                     | `node scripts/verification/rid-entry.mjs ครับ ค่ะ คะ ผม ดิฉัน คุณ เขา พี่ น้อง`                                                                                              |
| Présence RID                           | `node scripts/verification/rid-lookup.mjs สบายดี สบาย ชื่อ ต้น นก ตลาด ล่ะ แล้ว อะไร ไหม`                                                                                    |
| VOLUBILIS                              | `node scripts/verification/volubilis-lookup.mjs <xlsx> <graphie>` pour les 21 graphies citées, PUIS une variante locale du même script sans la troncature `hits.slice(0, 5)` |
| VOLUBILIS `Codes`                      | `node scripts/verification/volubilis-codes.mjs <ods>`                                                                                                                        |
| Wiktionary                             | `action=render` sur ครับ, ค่ะ, คะ, ดิฉัน                                                                                                                                     |
| NFC, empilement, tirets, apostrophes   | script ad hoc sur le fichier entier et sur les 33 séquences des deux tableaux                                                                                                |

## 1. Priorité 1, les réemplois : RIEN À SIGNALER

C'est le point le plus solide du fichier, et il tient à la re-vérification.

`item-fields-check.mjs` rend `champs codepoints en faute : 0` et
`écarts de réemploi à lire : 0`, sans aucune ligne `??` : les douze graphies ont
donc réellement été retrouvées dans les fichiers pointés.

Le script ne contrôlant ni `fr`, ni `litteral`, ni `registre`, la comparaison a
été refaite à part sur ces trois champs. **Les douze items sont identiques
caractère par caractère à leur item d'origine**, apostrophes droites de `u01-l1e`
comprises. Correspondances vérifiées une par une : ครับ et ค่ะ contre `u01-l1e`
items 2 et 3 ; ผม, ดิฉัน, คุณ et ชื่อ contre `u02-l2d` items 1, 2, 4 et 5 ;
คะ, สบายดี / สบายดีไหม, ต้น et นก contre `u02-l2e` items 1, 11, 12 et 13 ;
แล้วคุณล่ะ contre `u06-l6e` item 2 ; ตลาดอยู่ที่ไหน contre `u05-l5e` item 7.

Réserve consignée sans être un écart de champ : `u02-l2e` intitule lui-même ses
items 1 et 11 « réemploi, enseigné en 2B » et « réemploi de 2B ». Écrire
« publié par `u02-l2e` » pour คะ et pour สบายดี désigne donc la première leçon
qui porte un BLOC d'item, pas la leçon qui enseigne. C'est la convention de
`u11-l11b`, qui écrit la même chose pour คะ ; il n'y a pas de divergence dans
l'unité, et l'audit ne la compte pas comme un finding.

## 2. Priorité 2, la décodabilité : RIEN À SIGNALER

Les huit répliques ont été décomposées et chaque bloc rattaché à un item
réellement ouvert dans le dépôt, lecture faite des sections `## Items`.

| Bloc de réplique   | Publication vérifiée                                                |
| ------------------ | ------------------------------------------------------------------- |
| สวัสดีค่ะ          | `u02-l2b` item 3                                                    |
| สบายดีไหมคะ        | `u02-l2b` item 5                                                    |
| สบายดีครับ         | `u02-l2b` item 6                                                    |
| สบายดีค่ะ          | `u02-l2b` item 7                                                    |
| แล้วคุณล่ะครับ     | `u06-l6e` item 2, champ `registre`, qui donne les deux formes       |
| คุณชื่ออะไรคะ      | `u02-l2d`, collocation rattachée à l'item 6                         |
| ผมชื่อต้นครับ      | `u02-l2d`, collocation rattachée à l'item 5, plus `u02-l2e` item 12 |
| ดิฉันชื่อนกค่ะ     | idem, plus `u02-l2e` item 13                                        |
| ตลาดอยู่ที่ไหนครับ | `u05-l5e` item 7 (substitution de particule déclarée)               |
| ตรงไปค่ะ           | `u05-l5e` item 8 (substitution déclarée)                            |
| ไม่ไกลค่ะ          | `u05-l5e` item 2, champ `registre`, qui donne bien ไม่ไกลค่ะ        |
| ขอบคุณค่ะ          | `u02-l2c` item 2                                                    |
| แล้วเจอกันค่ะ      | `u01-l1e` item 5                                                    |

Les quatre substitutions de particule sont exactement celles que la leçon
déclare, ni plus ni moins : `u05-l5e` ne donne que ตลาดอยู่ที่ไหนคะ et que
ตรงไปครับ, `u01-l1e` n'écrit que « poli avec la particule » pour แล้วเจอกัน, et
`u06-l6e` donne bien les deux formes polies de แล้วคุณล่ะ. Aucun mot du dialogue
n'échappe aux unités 1 à 6.

Les tuiles d'exercice et les repères de la page 10 sont également couverts :
สวัสดี, ไหม, ตลาด, อยู่, ที่ไหน sont publiés ; หมา, ม้า, หนี, นี้ viennent de
`u01-l1d` items 1, 2, 7 et 8 et ปา, ป่า, ปู, ปู่ de `u01-l1c` items 1 à 4.

## 3. Findings

Huit findings bloquants, quatre à corriger avant `review`.

### B1, BLOQUANT : la règle centrale de la leçon n'a aucune source

`REG-INTERLOCUTEUR`

La page 3 énonce, comme cœur de la leçon : « La particule ne change pas selon la
personne à qui vous parlez. Une femme dit ค่ะ à un homme comme à une femme ; un
homme dit ครับ à tout le monde. » La Méta en fait l'apport n° 1 de la leçon et
l'« erreur que cette leçon existe pour empêcher », et les exercices 3 et 5 la
mesurent.

**Aucune ligne `sources` du fichier ne porte ce fait**, relevé fait section par
section. Les sources réellement consultées disent autre chose, et seulement
autre chose : RID « ครับ … ที่ผู้ชายใช้ » et « ค่ะ … ที่ผู้หญิงใช้ »,
en.wiktionary `men's speech` / `women's speech`. Ces énoncés portent sur le
LOCUTEUR ; aucun ne dit quoi que ce soit de l'allocutaire. La ligne
« Emploi par un homme ou par une femme, fait central » de l'État des audits ne
couvre donc pas la règle enseignée, elle couvre une autre proposition.

Ce qui rend le point bloquant plutôt que discutable, c'est que **le même fichier
applique la règle de preuve inverse à trois paragraphes de là** : เขา est retiré
du dialogue au motif exprès que « Aucune des deux [sources] ne dit ce que vaut
cet emploi devant l'intéressée ». Le silence des sources fait retirer เขา et
fait publier « un homme dit ครับ à tout le monde ». Le contrat d'item soumet le
registre à deux sources indépendantes « sans exception ».

Correction à faire, pas à improviser : soit sourcer l'indépendance à
l'allocutaire par deux autorités de la politique, soit reformuler en fait de
forme observable (« dans tout ce que vous avez lu depuis l'unité 1, la particule
suit celui qui parle »), soit porter le point en tête du lot de contre-audit
externe et le déclarer NON ÉTABLI au même titre que เขา.

### B2, BLOQUANT : la note culturelle énonce une assertion sur le français, que la leçon déclare deux fois ne pas énoncer

`FR-TUVOUS`

Note culturelle, deuxième paragraphe : « Là où le français vous demande surtout
de choisir entre le tutoiement et le vouvoiement, le thaï vous donne en plus une
façon de situer les gens les uns par rapport aux autres selon l'âge. »

C'est une assertion sur l'usage du français, et c'est précisément le
rapprochement tu/vous que `u02-l2d` avait écarté faute de source. Or la Méta
écrit : « **la comparaison avec le français, qui n'est faite nulle part**.
`u02-l2d` avait déjà écarté le rapprochement avec le couple tu/vous faute de
source ; 11E ne le rouvre pas et n'énonce aucune assertion sur le français. » Et
l'État des audits écrit « Phonétique française | SANS OBJET, aucune assertion sur
le français ».

Le balayage des formules interdites ne pouvait pas l'attraper : il cherche
« une bouche française », « un francophone », « l'oreille française » et
« francophone ». Il ne cherche pas « le français ». Le résultat « 1 occurrence,
justifiée » est donc exact et sans rapport avec le problème.

Correction : retirer la subordonnée sur le français, ou la sourcer selon la
section 1 bis, ou la reformuler en observation vérifiable par l'apprenant. Et
corriger les deux auto-déclarations qui affirment qu'elle n'existe pas.

### B3, BLOQUANT : exercice 4 : la seconde « paire minimale » n'en est pas une, et le plancher qui en découle est faux

`EX4-PAIRE`

L'exercice écrit : « **Les tirages 1 et 2 d'une part, 3 et 4 d'autre part, sont
des paires minimales** : même phrase française, deux locuteurs, deux réponses qui
ne diffèrent que par la fin. »

Tirages réels :

- 1 « Je vais bien. » → `sà·baai·dii khráp`
- 2 « Je vais bien. » → `sà·baai·dii khâ`
- 3 « Vous allez bien ? » → `sà·baai·dii·mǎi khá`
- 4 « Et vous ? » → `láeew khoun lâ khráp`

3 et 4 n'ont ni la même phrase française, ni des réponses qui ne diffèrent que
par la fin : elles ne partagent aucun mot. **Une seule paire minimale existe.**

Conséquence mesurable, et c'est elle qui rend le point bloquant. Le plancher 3
écrit : « Réutiliser la réponse du tirage jumeau : les paires 1 et 2, puis 3 et 4,
partagent la même phrase française. Recopier l'une pour l'autre garantit une
erreur par paire, soit un plafond de **4 sur 6, ou 66,7 %**, sous le seuil. »
Avec une seule paire jumelle, recopier coûte UNE erreur, pas deux : le plafond
réel est **5 sur 6**, c'est-à-dire exactement le seuil de réussite. La stratégie
que le fichier annonce comme éliminée passe la porte.

Correction : soit rendre 3 et 4 réellement jumelles (par exemple « Vous allez
bien ? » dit par Ton et par la voisine), soit recalculer le plancher et remonter
le seuil, mais pas laisser les deux en l'état.

### B4, BLOQUANT : exercice 2 : « trois des cinq phrases françaises apparaissent deux fois » est faux, et l'exercice se contredit

`EX2-COMPTE`

« Ce qu'il mesure » écrit : « **Trois des cinq phrases françaises apparaissent
deux fois, une fois par sexe**, ce qui rend le sens seul insuffisant. »

Les cinq cartes de gauche portent trois phrases distinctes : « Je vais bien. »
(deux fois), « Et vous ? » (deux fois), « Bonjour. » (une fois). **Deux phrases
sont doublées, pas trois**, et il n'y a pas cinq phrases distinctes.

Le plancher 3 du même exercice décrit correctement la situation :
« la paire 5 est forcée, aucune autre carte ne portant « Bonjour » ; les paires 1
et 2 se réduisent à un tirage à pile ou face, et les paires 3 et 4 aussi ». Les
deux passages sont incompatibles ; le second est le juste.

Bloquant parce que la phrase fautive est l'argument de validité de l'exercice
(« ce qui rend le sens seul insuffisant ») : avec « Bonjour. » non doublé, une
carte sur cinq EST résoluble par le sens seul, ce que le plancher admet et ce
que la description nie.

### B5, BLOQUANT : item 3 คะ : le champ `fr` porte un sens qu'aucune de ses deux sources ne donne, et l'audit le déclare vérifié

`SENS-KHA`

Champ `fr` de l'item 3 : « particule finale d'une locutrice, **en fin de question
ou d'information donnée poliment** ».

Ce que rendent les deux sources citées, re-consultées ce jour :

- RID, « คะ ๒ » : « คำลงท้ายที่ผู้หญิงใช้ต่อจาก**คำถาม**หรือ**คำแสดงความสงสัย**
  เพื่อแสดงความสุภาพ », plus un emploi après ซิ et นะ. Question, doute,
  incitation. Rien qui corresponde à « information donnée poliment ».
- VOLUBILIS ligne 28944 : « oui ; [formule de politesse **en fin de vocatif ou de
  phrase interrogative**] ». Vocatif, interrogative. Rien de plus.

Pire : « donner une information poliment » est la définition que le RID réserve à
**ค่ะ**, « คำลงท้ายที่ผู้หญิงใช้**ในการบอกให้ทราบ**อย่างสุภาพ », ce que la leçon
cite elle-même à l'item 2. Le champ `fr` de คะ empiète donc sur la valeur de ค่ะ,
c'est-à-dire exactement sur la distinction que la leçon enseigne et que les
exercices 3 et 4 corrigent sans variante admise (« une femme qui affirme dit
ค่ะ »).

L'« Écart de périmètre consigné » de l'item 3 recense les domaines EN PLUS donnés
par les sources (vocatif, suggestion, doute) et ne voit pas que son propre champ
`fr` en donne un que les sources ne donnent pas. Et l'État des audits écrit
« Sens | vérifié pour les 12 traductions, RID plus VOLUBILIS ». Cette ligne est
fausse pour l'item 3.

Le champ vient de `u02-l2e` et 11E ne peut pas le modifier : le finding est donc
à porter en arbitrage sur `u02-l2e`, mais la ligne « Sens vérifié » de 11E doit
être corrigée dès maintenant, et l'écart consigné dans l'item.

### B6, BLOQUANT : deux citations VOLUBILIS sont tronquées, et le contrôle négatif sur ต้น n'est pas établi par la sortie citée

`VOLU-TRONQUE`

`volubilis-lookup.mjs` n'affiche que les CINQ premiers résultats
(`for (const hit of hits.slice(0, 5))`) et les huit premières colonnes, alors
qu'il annonce le nombre total juste au-dessus. Deux des vingt et une graphies du
dossier dépassent cinq lignes, et ce sont exactement celles pour lesquelles la
leçon cite une plage de cinq :

- **ต้น** : le dossier cite « lignes 105364 à 105368 » et conclut
  « **Aucune ligne de type `n. prop.`**, ce qui est le contrôle négatif utile
  ici ». Le classeur en porte **SEPT**, 105364 à 105370 : les lignes 105369
  (`adj.`, « originel ; premier … ») et 105370 (`adj.`, « royal ») n'ont jamais
  été vues. La conclusion se trouve survivre (j'ai lu les sept, aucune n'est
  `n. prop.`), mais **elle n'était pas établie par la sortie citée** : le
  dossier a lu une liste coupée comme si elle était complète.
- **เขา** : le dossier cite « เขา 31400 à 31404 ». Le classeur en porte **HUIT**,
  31400 à 31407, dont 31406 « she | elle | pr. pers. | RID ; TOURIST » et 31407
  « her | elle ». La citation est incomplète sur une graphie dont le dossier
  discute précisément la valeur d'emploi.

Bloquant au titre « référence mal citée », et surtout parce que la méthode est
reproductible : tout dossier futur qui citera une plage de cinq lignes
VOLUBILIS sans vérifier le compte annoncé refera la même erreur. À signaler
comme arbitrage : le script doit afficher toutes les lignes, ou refuser de
tronquer sans le dire.

Le reste des citations VOLUBILIS est EXACT, ligne par ligne et glose par glose,
y compris le « fait NEUF » sur นก (ligne 62581, `A=Nok`, `D=(tha)`, `E=นก`,
`F=Nok`, `G=Nok`, `H=n. prop.`), l'absence de ตลาดอยู่ที่ไหน, les empreintes du
`.xlsx` et du `.ods`, les 586 541 chaînes partagées, les 114 579 lignes non vides
et l'absence de définition de `(m.)` et de `(f.)` dans la feuille `Codes`.

### B7, BLOQUANT : « CINQ demandes identiques empilées » est un décompte faux, et il fonde l'arbitrage 1

`SRS-DECOMPTE`

La section SRS écrit : « **CINQ demandes identiques sont désormais empilées sur
ces deux cartes**, relevé du 2026-08-04 : `u09-l9a`, `u10-l10a`, `u11-l11b`,
`u11-l11d` et celle-ci. » L'arbitrage 1 reprend le chiffre.

Balayage du dépôt sur `srs-u04-l4a-06` : la carte est alimentée ou réclamée par
`u09-l9a`, `u09-l9b`, `u09-l9c`, `u10-l10a`, `u10-l10c`, `u10-l10d`, `u10-l10e`,
`u11-l11a`, `u11-l11b`, `u11-l11c`, `u11-l11d` et 11E. Même chose, à peu de
choses près, pour `srs-u07-l7a-03`.

Les leçons omises le disent elles-mêmes, en toutes lettres :

- `u09-l9c` : « Les tirages du jour, หมอ et ครับ, alimentent `srs-u04-l4a-06` » ;
- `u10-l10c` : « elle APPORTE des tirages à la carte existante
  `srs-u04-l4a-06` … c'est une DEMANDE consignée » ;
- `u10-l10d` et `u10-l10e` : mêmes formules, avec « Sixième signalement » ;
- `u11-l11a` : « comme l'ont fait `u09-l9a`, `u10-l10a`, `u10-l10c`, `u10-l10d`
  et `u10-l10e` », soit cinq PRÉDÉCESSEURS avant elle ;
- `u11-l11c`, dans la MÊME unité : « à `srs-u04-l4a-06` … les tirages และ, แล้ว
  et ผม ».

Le vrai ordre de grandeur est d'une douzaine, pas de cinq. Bloquant parce que la
convention du dépôt est explicite (« un décompte interne cité par une leçon est
produit par CE script, ou il n'est pas cité ») et parce que le chiffre sert
d'argument : c'est sur lui que la leçon conclut « la consolidation ne suit pas ».
La coordination d'unité, présentée comme REFAITE sur l'état réel, a par ailleurs
manqué `u11-l11c`, qui est dans le même dossier.

### B8, BLOQUANT : exercice 3 : le feedback et la Méta s'appuient sur une information que l'exercice n'affiche jamais

`EX3-INTERLOCUTEUR`

Trois affirmations solidaires :

- Méta : « **Quatre des six tirages de l'exercice 3 sont construits contre cette
  erreur** [choisir la particule de son interlocuteur] » ;
- plancher 4 : « … réussit les tirages 2, 3, 5 et 6, soit 4 sur 6 … et c'est
  pourquoi **quatre tirages lui sont opposés** » ;
- feedback incorrect : « **Vous avez pris la fin de votre interlocuteur.** »

Deux défauts.

1. Arithmétique. La stratégie décrite RÉUSSIT les tirages 2, 3, 5 et 6 ; ceux qui
   l'attrapent sont les tirages 1 et 4, soit **DEUX**. Le « quatre » est le
   score de la stratégie, recopié comme s'il était un nombre de tirages
   opposés. Sous l'autre lecture (toujours répondre au masculin), le compte est
   bien quatre, mais ce n'est pas la stratégie que le texte nomme.
2. Dispositif. Les six tirages annoncent uniquement QUI PARLE (« Ton, un homme,
   affirme », « Nok, une femme, demande »). **Aucun n'affiche d'allocutaire.**
   Un apprenant ne peut donc pas y « prendre la fin de son interlocuteur » : il
   n'y en a pas à l'écran. Le feedback nomme une erreur que l'exercice ne peut
   pas produire, et la Méta lui attribue une mesure qu'il ne fait pas.

Correction : soit afficher l'allocutaire dans les tirages (ce qui rend
l'exercice conforme à son intention et au feedback), soit renoncer à dire que
l'exercice 3 mesure l'erreur de la page 3 et corriger le compte.

### N1, non bloquant : quatre auto-déclarations du dossier sont fausses

`DOSSIER-DECLARATIONS`

Toutes vérifiées, toutes contredites par le fichier lui-même ou par mesure :

1. État des audits, ligne Unicode : « profondeur d'empilement maximale **1** ».
   Mesure faite sur toutes les sous-chaînes thaïes du fichier : la profondeur
   maximale est **2**, et la section « Points de rendu » le dit, en ajoutant que
   « la première rédaction de cette ligne annonçait 1, ce qui était FAUX ». La
   correction n'a pas été reportée dans le tableau.
2. État des audits, ligne Décomptes internes : « coordination d'unité rendue
   **VIDE** et déclarée comme telle ». C'est le relevé abandonné ;
   `repo-thai-scan.mjs 11 11` rend bien 5 fichiers, 51 entrées, 42 graphies, ce
   que la Méta écrit trois fois.
3. « **Six entrées réellement consultées le 2026-08-04** : ครับ, ค่ะ, คะ, เขา,
   ผม, ดิฉัน, พี่ et น้อง, soit huit. » Six, puis huit noms, puis huit.
4. « **Aucune lecture entre crochets n'est citée dans ce dossier sauf une**,
   celle de l'entrée « ครับ » ». L'item 6 en cite une seconde, `[คุน, คุนนะ-]`,
   qui est bien une lecture RID (elle est exacte, je l'ai relue). La garantie
   anti-fabrication que ce paragraphe met en avant est donc fausse sur son objet
   même.

Non bloquant parce qu'aucune de ces quatre lignes ne fausse un contenu
d'apprenant, mais toutes doivent tomber avant `review` : l'État des audits est ce
que lit la consolidation.

### N2, non bloquant : l'énumération d'empilement se donne pour exhaustive et ne l'est pas

`UNICODE-EMPILEMENT`

« Mesure faite le 2026-08-04 sur toutes les sous-chaînes thaïes du fichier … **la
profondeur maximale est 2** … Les graphies concernées sont ชื่อ, item 7 … et
ตลาดอยู่ที่ไหน, item 10, où ◌ี et ◌่ se posent tous deux sur ท dans ที่ … et พี่
de la note culturelle également. **Deux conséquences d'intégration** : la cible
tactile de ช et celle de ท … ».

Relevé refait : les graphies de profondeur 2 du fichier sont ตลาดอยู่ที่ไหน,
เขาชื่ออะไรคะ, พี่, ชื่อ, ผมชื่อ, ดิฉันชื่อ, คุณชื่ออะไรคะ, คุณชื่ออะไรครับ,
**อยู่**, **ที่ไหน**, **นี้**, **ปู่**, ผมชื่อต้นครับ, ดิฉันชื่อนกค่ะ,
ตลาดอยู่ที่ไหนครับ, ผู้ชายใช้, ผู้หญิงใช้, ตลาดอยู่ที่ไหนคะ, ที่, ศักดิ์เสมอพี่,
คราวพี่, เขาชื่ออะไร.

Deux omissions comptent pour l'intégration :

- **อยู่ empile ◌ู U+0E39 et ◌่ U+0E48 sur ย**, et อยู่ est affiché comme TUILE
  ISOLÉE au tirage 6 de l'exercice 3, c'est-à-dire précisément dans le composant
  où la cible de 44 par 44 points est en cause. La consigne d'intégration ne
  nomme que ช et ท ;
- **ปู่ et นี้ empilent aussi deux signes**, et ce sont des repères affichés à la
  page 10.

La borne de 2 est juste ; l'énumération et les conséquences d'intégration ne le
sont pas.

### N3, non bloquant : « SIX cartes » : le relevé n'est pas reproductible et il se contredit

`SRS-SIX-CARTES`

« **SIX cartes du parcours mesurent déjà l'attribution du locuteur par la seule
particule finale**, relevées le 2026-08-04 par balayage des sections `## SRS` du
dépôt : `srs-u02-l2b-03`, `srs-u05-l5e-08`, `srs-u06-l6e-09`, `srs-u07-l7e-04`,
`srs-u08-l8e-07` et `srs-u09-l9e-06`. »

Trois problèmes.

1. `srs-u02-l2b-03` est comptée, or son critère est « trancher **question ou
   affirmation** à l'écoute sur la particule seule ». Elle ne mesure pas
   l'attribution d'un locuteur. Si on la compte, alors `srs-u02-l2e-03`
   (« contraste ค่ะ (affirmation) / คะ (question), consolidation de 2B ») doit
   l'être aussi : le balayage l'a manquée. La sœur `u11-l11b` la cite, elle.
   Le compte juste est donc cinq ou sept, jamais six.
2. La Méta écrit par ailleurs que `srs-u05-l5e-08` est la « **première** carte
   d'attribution du locuteur par la particule seule », ce qui est incompatible
   avec l'inclusion de `srs-u02-l2b-03` dans les six.
3. « Chacune des cinq dernières déclare prolonger les précédentes et demande la
   fusion » : `srs-u05-l5e-08` n'écrit ni l'un ni l'autre. Son texte est
   « (consolidation de 2B et de `srs-u04-l4e-08`) », sans demande de fusion.
   L'arbitrage 6 répète l'affirmation.

Est en revanche EXACT, et je l'ai relu carte par carte : aucun des six critères
n'exige plus de deux locuteurs, et `srs-u05-l5e-08` demande bien « au moins une
réplique réduite à la seule particule ». Est exact aussi le fait central de la
Méta : les dialogues de `u02-l2b`, `u05-l5e`, `u06-l6e`, `u07-l7e`, `u08-l8e` et
`u09-l9e` comptent tous deux voix, une par sexe. Sur ce point la leçon a raison.

### N4, non bloquant : « cinq des treize particules sont des syllabes mortes »

`SYLLABES-MORTES`

Méta : « Cinq des treize particules du dialogue sont des syllabes mortes, ครับ
compris ».

Les treize particules du dialogue sont ครับ (4 fois), ค่ะ (7) et คะ (2). ครับ
ferme sur บ, ค่ะ et คะ sur ◌ะ : **les treize sont des syllabes mortes**, treize
sur treize. Le « cinq » est le compte des GRAPHIES de la liste que la section SRS
écrit plus bas, « ครับ, ค่ะ, คะ, นก et ล่ะ », dont นก et ล่ะ ne sont pas des
particules du dialogue et dont ล่ะ n'y figure que dans แล้วคุณล่ะ.

Le fond est sain (aucun exercice ne demande le ton d'une syllabe morte, ce que
j'ai vérifié) ; c'est le chiffre qui est faux.

### N5, non bloquant : exercice 5 : « chaque forme nue a son jumeau particulé » est faux, et l'item 8 se trompe de tirage

`EX5-JUMEAU`

1. « Chaque forme nue a son jumeau particulé dans le même exercice : สบายดี
   contre สบายดีครับ, แล้วคุณล่ะ contre แล้วคุณล่ะครับ. » Il y a TROIS formes
   nues. La troisième, ตลาดอยู่ที่ไหน (tirage 12), n'a **aucun** jumeau dans les
   douze tirages : ni ตลาดอยู่ที่ไหนครับ ni ตลาดอยู่ที่ไหนคะ n'y figure. Le
   feedback « Le jumeau particulé du tirage est ensuite affiché à côté » n'a donc
   rien à afficher pour ce tirage sans sortir de l'exercice.
2. `note_fr` de l'item 8 : « les deux formes NUES … **ce sont les tirages 10 et
   11 de l'exercice 5** ». Le tirage 11 est แล้วคุณล่ะ, c'est-à-dire l'item 9,
   qui le revendique correctement de son côté. สบายดีไหม n'est tirage d'aucun
   exercice de cette leçon.

## 4. Ce que j'ai vérifié et qui tient

Recomputé, pas relu.

- **Réemploi** : 12 items sur 12, neuf champs, aucun écart, `??` inclus.
- **NFC** : le fichier entier est en forme NFC ; les **33 séquences** des deux
  tableaux (12 items, 21 répliques et spécimens) sont exactes au caractère près.
- **Tons et longueurs** : cohérents avec les règles de classe et corroborés
  syllabe par syllabe par les marques ThaiPhon de VOLUBILIS (`¯` haut, `\`
  descendant, `_` bas, `/` montant, `-` moyen) pour les douze items.
- **RID** : ครับ vedette unique, ว., ผู้ชายใช้, lecture `[คฺรับ]` =
  U+0E04 U+0E3A U+0E23 U+0E31 U+0E1A ; ค่ะ vedette unique, ผู้หญิงใช้,
  « บอกให้ทราบอย่างสุภาพ », deux exemples imprimés ; คะ deux vedettes, la ๑ de
  versification, la ๒ après question ou doute ; ผม deux vedettes, la ๒ ส. เพศชาย,
  บุรุษที่ ๑ ; ดิฉัน vedette unique, เพศหญิง, variante ดีฉัน ; คุณ « คุณ ๑, คุณ- »
  à six sens, (๓) devant le nom, (๖) ส. บุรุษที่ ๒ avec extension (ปาก) à la
  troisième personne, lecture `[คุน, คุนนะ-]`, plus une vedette คุณ ๒ ; เขา ๔ ส.
  บุรุษที่ ๓, sans un mot sur la présence de la personne ; พี่ deux sens avec
  ศักดิ์เสมอพี่ et คราวพี่ et deux exemples ; น้อง trois sens avec คราวน้อง,
  le botanique et le classificateur de bambou.
- **rid-lookup** : สบายดี `absent`, สบาย et les neuf autres `entree`. Le contrôle
  négatif de l'item 8 tient.
- **VOLUBILIS** : `10 848 409` octets, sha256 `b9ab74…a20fc0c`, 586 541 chaînes
  partagées, 114 579 lignes non vides ; `.ods` `15 724 718` octets, sha256
  `bb9c5da…a094cc`. Lignes exactes pour ครับ 37006-37007, ค่ะ 28945, คะ 28944,
  ผม 72679-72681, ดิฉัน 11050-11051, คุณ 38543 à 38548 (cinq lignes réelles,
  38546 n'existe pas), ชื่อ 8177-8180, สบายดี 85504-85507 dont 85504
  `(reg., Isan)`, แล้วคุณล่ะ 47348, นก 62578-62581 dont 62581 `n. prop.`,
  พี่ 70926/70927/70929, น้อง 64026-64028, ตรงไป 106313, ไม่ไกล 52084,
  ขอบคุณ 36465-36466, แล้วเจอกัน 47344, ไหม 51644-51647, แล้ว 47342-47343 ;
  ตลาดอยู่ที่ไหน `ABSENT`. Feuille `Codes` : 233 lignes de sortie, `TONES`
  présent, **aucune définition de `(m.)` ni de `(f.)`**. L'écart des marqueurs
  est donc justement écarté.
- **Wiktionary** (rendu) : ครับ /kʰrap̚˦˥/, `kráp`, `khrap`, respelling คฺรับ,
  particule, « employed by males to express affirmation or assent, or to
  politely end any expression », `formal`, `humble`, `men's speech` ; ค่ะ
  /kʰaʔ˥˩/, `kâ`, particule « used at the end of an indicative expression,
  request, or wish », note « formerly used by noblemen, now often employed by
  women » ; คะ /kʰaʔ˦˥/, `ká`, « doubt, interrogation, or suggestion », même
  note ; ดิฉัน /di˨˩.t͡ɕʰan˩˩˦/, `dì-chǎn`, **sens 1 `formal, archaic, men's
speech`, sens 2 `formal, women's speech`**, l'ordre annoncé est le bon.
  Réserve mineure : en.wiktionary donne une SECONDE prononciation de ค่ะ,
  /kʰaʔ˨˩/, que le dossier ne consigne pas.
- **Décomptes d'unité** : `repo-thai-scan.mjs 11 11` rend exactement 5 fichiers,
  51 entrées, 42 graphies, 16 ไม้เอก, 16 ไม้โท, 0 ไม้ตรี, 0 ไม้จัตวา. Répartition
  par fichier 8 / 15 / 8 / 8 / 12, recomputée avec la fonction `entriesOf` du
  script. Neuf graphies portées par deux fichiers (51 − 42 = 9), et la liste est
  exacte : les huit entre 11B et 11E, แล้วคุณล่ะ entre 11D et 11E.
- **Cartes de l'unité** : 11A quatre, 11B deux, 11C deux, 11D une, 11E une, soit
  dix. Exact.
- **Coordination avec 11B** : exercice 1 à douze tirages, quatre sans particule
  dont สบายดี et แล้วคุณล่ะ, trois options, seuil 11 sur 12, aucune carte ouverte
  et apport à `srs-u01-l1e-04`. Tout est exact, retrait de `srs-u11-l11e-02`
  compris.
- **Coordination avec 11D** : douze répliques, deux voix, ต้น et นก ; exclusion
  bloquante de `srs-u11-l11d-01` sur l'appariement par la seule particule.
  Exact. 11D ne publie aucun mot, ses huit items sont des réemplois. Exact.
  `u10-l10a` non plus, ses huit items sont des réemplois. Exact.
- **Prérequis** : les vingt renvois d'item ont été ouverts un par un
  (`u01-l1e` 2/3/5, `u02-l2b` 3/5/6/7, `u02-l2c` 2, `u02-l2d` 1/2/4/5,
  `u02-l2e` 1/11/12/13, `u05-l5e` 2/7/8, `u06-l6e` 2). Tous justes.
- **Répartition des particules du dialogue** : recomptée réplique par réplique,
  13 particules, ครับ 4, ค่ะ 7, คะ 2. Exact.
- **Planchers** : exercice 1 (3 sur 9 ; 7/64 = 10,9 % puis 1,2 % ; 5,5 sur 9),
  exercice 2 (1/120 ; 25 % ; impossibilité du 4 sur 5), exercice 3 (1 sur 6 ;
  2 sur 6 ; 13/729 = 1,8 % ; 4 sur 6 deux fois ; 1/12, 1/60, 1/360),
  exercice 5 (3 sur 12 ; 9 sur 12 deux fois ; 6 sur 12). **Tous recalculés,
  tous justes.** Seuls les deux points des findings B3 et B8 sont faux.
- **Écriture** : 0 occurrence de U+2014 et 0 de U+2013. Huit apostrophes droites,
  réparties exactement en deux catégories comme la leçon l'annonce : les champs
  `fr` des items 1 et 2, et six marques de possessif anglais à l'intérieur de
  citations Wiktionary. Aucune phrase française écrite par la leçon n'en porte.
- **Arbitrage 5** : 401 apostrophes droites sur les cinquante fichiers de leçon
  des unités 1 à 10, dont 90 en `1a`, 74 en `1b`, 82 en `1c`, 71 en `1d` et 59 en
  `1e`. Chiffre exact au fichier près.

## 5. Verdict

Le fichier ne peut pas passer en `review` en l'état. Les huit findings bloquants
se rangent en trois familles :

1. **Preuve** : B1 (la règle centrale n'est pas sourcée), B5 (un sens non
   soutenu par ses sources et déclaré vérifié), B6 (deux citations tronquées),
   B2 (une assertion sur le français déclarée absente).
2. **Corrigés et planchers** : B3 (un plancher qui ne tient pas, seuil
   franchissable), B4 (une description d'exercice contredite par son propre
   plancher), B8 (un feedback fondé sur une information jamais affichée).
3. **Décomptes** : B7 (un relevé faux qui fonde un arbitrage).

Aucun de ces huit points ne touche les réemplois ni la décodabilité, qui sont
irréprochables. Le fichier est solide là où il a été outillé et faible partout où
il s'est cru sur parole, ce qui est cohérent avec sa propre thèse.
