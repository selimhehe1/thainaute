# Contre-audit adversarial de `lecon-10a.md`

- Fichier audité : `content/authoring/unite-10/lecon-10a.md`
  (125 989 octets, sha256 `e8a9c0468c14c1cd1da81b575493e8ec761a39ba92e51bcbc4b3a5c448e4a13f`)
- Date de l'audit : 2026-08-04
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), consigne adversariale
- Posture : chercher des erreurs, pas confirmer. Aucun chiffre, aucune source et
  aucun corrigé du fichier n'a été admis sur déclaration. Tout ce qui est
  vérifiable a été re-exécuté ou re-consulté à la source.

## Méthode réellement exécutée

Réseau disponible pendant cet audit, ce qui a permis de rouvrir les sources
externes au lieu de les croire sur parole.

| Contrôle                                       | Commande ou accès                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Réemploi des 8 items                           | `node scripts/verification/item-fields-check.mjs content/authoring/unite-10/lecon-10a.md` |
| Réemploi élargi à `fr`, `litteral`, `registre` | script d'audit ad hoc, champs non couverts par l'outil du dépôt                           |
| Décomptes d'unité                              | `repo-thai-scan.mjs --check-u07`, `1 9`, `10 10`, `10 10 --stacked`                       |
| Unicode du fichier                             | `unicode-thai.mjs content/authoring/unite-10/lecon-10a.md`                                |
| Mesure du tableau                              | `table-des-tons.mjs <xlsx>` sur exemplaire retéléchargé indépendamment                    |
| Volubilis                                      | `volubilis-lookup.mjs <xlsx>` sur 19 graphies                                             |
| RID                                            | `rid-entry.mjs` sur 13 vedettes, requêtes réelles                                         |
| Wiktionary                                     | 8 entrées d'item plus `Appendix:Thai script` en `action=raw`                              |
| Unicode 17.0                                   | `PropList.txt` et `IndicPositionalCategory.txt` retéléchargés et empreintés               |
| Balayage formules                              | `head -n` jusqu'au dossier puis `grep -o                                                  | wc -l`, portée « écrans » |

L'exemplaire Volubilis a été retéléchargé sans passer par l'adresse du dossier :
`https://master.dl.sourceforge.net/project/belisan/VOLUBILIS%20Database.xlsx?viasf=1`
rend 10 848 409 octets, sha256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, exactement
l'empreinte citée. L'adresse `belisan-volubilis` de l'en-tête du script rend bien
un 404 : l'arbitrage 1 de 10A est fondé.

## Résultat d'ensemble

**70 faits vérifiés par l'auditeur lui-même et CONFIRMÉS. 12 findings, dont 8
bloquants.**

Le dossier de sources externe de cette leçon est d'une qualité inhabituelle :
sur les huit items, les trois jambes RID, Volubilis et Wiktionary tombent juste
au caractère près, numéros de ligne compris, et les trois empreintes Unicode et
Wiktionary sont exactes à l'octet. La mesure de masse du tableau des tons se
reproduit à l'identique, 2 125 entrées et neuf divergences aux mêmes lignes.

Les défauts ne sont donc PAS dans les sources externes. Ils sont, tous sans
exception, dans ce que la leçon dit d'elle-même et du dépôt : positions comptées
faux sur un écran d'enseignement, affirmation « une seule case » démentie par
son propre tableau, test du ห sur-généralisé, une lecture RID qui n'existe pas,
un relevé de coordination périmé présenté comme final, et des attributions de
publication fausses. La leçon consacre plusieurs paragraphes à dénoncer le
défaut « chiffre écrit sans être exécuté » ; elle le reproduit quatre fois.

## Ce que l'auditeur a confirmé lui-même

### Réemplois, priorité 1 : CONFIRMÉS sur les huit items

`item-fields-check.mjs` rend 0 champ `codepoints` en faute et 0 écart de
réemploi. Ce script ne compare toutefois que `ipa`, `ton`, `longueur`,
`transcription` et `codepoints`. La comparaison a donc été **refaite en
incluant `fr`, `litteral` et `registre`**, que l'outil ne voit pas et où une
divergence silencieuse était possible. Résultat : **zéro divergence sur les huit
items, sur tous les champs**, y compris les traductions longues de แล้ว et จาน,
reprises mot pour mot.

Le champ `codepoints` de ป่า sans « (NFC) » est bien la forme exacte de
`u01-l1c`, et l'ajouter aurait créé l'écart. Le motif donné est juste.

Un seul défaut de réemploi, et il porte sur le POINTEUR, pas sur les champs :
voir finding N1.

### Sources externes : CONFIRMÉES

- **RID, huit items.** สอง deux sens dont (๑) numéral ; จาน trois vedettes dont
  จาน ๓ étiquetée (ถิ่น-อีสาน) ; แพง ๑ « มีราคาสูง, ตรงข้ามกับ ถูก » et แพง ๒
  étiquetée (ถิ่น-อีสาน, พายัพ) ; ป่า vedette unique à six sens ; ง่าย vedette
  unique avec ง่าย ๆ et ง่ายดาย ; ห้า deux sens et ห้าแต้ม ; แล้ว deux vedettes ;
  รถ « รถ, รถ- » avec lecture `[รด, ระถะ-]`, exemples รถม้า รถยนต์ รถไฟ et
  origine (ป.). Tout est exact, description par description.
- **La séquence `[รด]` est bien U+0E23 U+0E14**, ce qui corrobore la famille du
  `t` comme la leçon l'affirme.
- **RID, trois entrées de classe.** อักษรกลาง 9 lettres, quatre formes cinq
  tons, série กา ก่า ก้า ก๊า ก๋า. อักษรสูง 11 lettres, base จัตวา, deux formes
  trois tons, série ขา ข่า ข้า. อักษรต่ำ 24 lettres, base สามัญ, ◌่ donne โท,
  ◌้ donne ตรี, série คา ค่า ค้า. Le tableau de la page 2 est exact.
- **La règle manquante de l'incertitude 1 est exacte elle aussi** : อักษรกลาง
  donne คำตาย → เอก, อักษรสูง → เอก, อักษรต่ำ se dédouble, สระสั้น → ตรี et
  สระยาว → โท. La leçon a lu ses entrées correctement et a eu raison de ne pas
  enseigner la règle faute de seconde source.
- **RID มาตรา sens (๒)** range bien ย dans เกย, ว dans เกอว et ถ dans กด.
- **Wiktionary, huit entrées.** IPA, Paiboon, Royal Institute et définitions
  concordent au caractère près, y compris la forme phonémique `ฮ่า` de ห้า, la
  forme phonémique `รด` de รถ et ses homophones `รด รท รส`, et le classificateur
  แห่ง de ป่า.
- **Volubilis, 19 graphies.** Tous les numéros de ligne cités sont exacts :
  สอง 93932, จาน 18351-18353, แพง 67653, ป่า 65412-65413, ง่าย 60822-60823,
  ห้า 14524, แล้ว 47342-47343, รถ 84431, มาก 53109, สี่ 91868, ถุง 104171-104172,
  ปลา 76068, ตรง 106282-106286, เพลง 72181, เปลี่ยน 76838, โรค 83332,
  มา 50904-50905, มี 55262-55266. Les respellings `[ตฺรง]`, `[เปฺล่า]` et
  `[เปฺลี่ยน]` sont là, พินทุ sous la PREMIÈRE consonne. Les deux numéros donnés
  pour เปล่า, 76566 et 76567, ne sont pas contradictoires : le premier porte
  `DOM=RID`, le second porte le respelling. Le classeur rend bien
  114 579 lignes non vides et 586 541 chaînes partagées.
- **Mesure du tableau.** `table-des-tons.mjs` rend exactement 2 125 entrées et
  les neuf cases aux effectifs annoncés, plus les neuf divergences aux lignes
  10400, 18381, 49905, 102568, 105274, 107808, 111646, 111647 et 113117. Zéro
  contre-exemple. C'est le résultat le plus solide du dossier et il tient.
- **Unicode 17.0.** `PropList.txt` 145 465 octets, sha256 `130dcdd…64dd`, ligne
  1461 `0E40..0E44 ; Logical_Order_Exception`.
  `IndicPositionalCategory.txt` 52 257 octets, sha256 `68cedc2…c480`, en-tête
  `IndicPositionalCategory-17.0.0.txt` du 2025-07-29, ligne 384
  `0E40..0E44 ; Visual_Order_Left`. Les deux noms sont bien chacun dans son
  fichier, et l'avertissement contre la fausse correction de `u09-l9a` est juste.
- **`Appendix:Thai script`** 16 236 octets, sha256 `c9776c6…90f3`. Les quinze
  lignes de classe citées sont exactes une par une, ainsi que ◌าย ligne 142 et
  แ◌ว ligne 198. Le mot-image จอ จาน est bien à la ligne 30, ce qui fonde la
  remarque de la `note_fr` de จาน.
- **Mono-sourçage de vivante/morte : le constat de la leçon est exact.**
  `en.wiktionary.org/wiki/คำตาย` rend un 404 réel, et l'entrée th.wiktionary
  reproduit la définition RID mot pour mot. La leçon n'a pas exagéré sa
  difficulté ; elle l'a décrite juste. Voir toutefois le finding N6.
- **Note culturelle : le seul fait réellement à deux sources indépendantes.**
  RID ป่า sens (๔) étiqueté (โบ) avec ป่าถ่าน et ป่าตะกั่ว, et Wiktionary
  quatrième sens nominal « (obsolete) market or marketplace, especially one for
  selling a specific kind of product ». Les deux disent la même chose et la
  restriction au commerce spécialisé est dans les deux. Rien à redire.

### Exercices : les 49 corrigés recomputés un par un

- **Exercice 1, les douze initiales sont justes**, y compris ป pour เปลี่ยน,
  พ pour เพลง et พ pour แพง.
- **Planchers de l'exercice 1 : recomptés et exacts.** Position 1 sur sept
  tirages, position 2 sur cinq, donc 7 sur 12 pour la meilleure position
  constante et pour l'heuristique « première lettre écrite », 5 sur 12 pour la
  deuxième, 2 sur 12 pour une réponse constante par lettre (พ deux fois, ป deux
  fois).
- **Exercice 2 : les cinq paires portent bien le même ton**, et le raisonnement
  du plancher est juste. L'heuristique classe + marque verrouille exactement les
  paires 2 et 5, laisse une bijection de trois, donc 1 sur 6. Les trois paires
  restantes ne s'apparient effectivement jamais par classe.
- **Exercice 3 : les douze tons sont justes**, répartition strictement 2 par
  option vérifiée, et le plancher « voir s'il y a une marque » vaut bien 4 sur
  12, les six tirages sans marque se répartissant en moyen, montant et morte à
  deux chacun.
- **Exercice 4 : les douze tons et les 36 cartes sont justes**, 19 graphies
  distinctes, et la répartition des bonnes réponses est bien 4 sans marque,
  4 ไม้เอก, 4 ไม้โท.
- **Exercice 5 : les huit transcriptions sont conformes** à l'amendement v1.1 et
  identiques aux champs `transcription` publiés.
- **Aucun exercice n'est réussissable par une réponse constante.** Vérifié pour
  les cinq : plafonds 7/12, impossible par bijection, 2/12, 4/12 et 1/8.

### Décomptes internes, cross-références, conventions

- `repo-thai-scan.mjs --check-u07` passe, dix chiffres sur dix.
- `repo-thai-scan.mjs 1 9` rend bien 45 fichiers, 429 entrées, 317 graphies,
  103 ไม้เอก, 76 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา.
- `repo-thai-scan.mjs 10 10 --stacked` rend bien profondeur 2, et ครึ่ง, ชั้น,
  ชั่วโมง appartiennent bien toutes trois à `lecon-10d.md`.
- `unicode-thai.mjs` confirme 8 champs `thai`, NFC partout, aucun caractère de
  zone à usage privé, et U+0E4C exactement 3 fois.
- **Le balayage des formules interdites est réel et reproductible.** Sur les
  écrans, les quatre motifs rendent 0, et « français » apparaît bien 3 fois.
  La section 1 bis est respectée : la leçon n'affirme rien sur la bouche ou
  l'oreille françaises.
- **Renvois aux leçons antérieures : exacts.** 4A page 6 énonce bien que เ, แ, โ,
  ใ et ไ s'écrivent avant leur consonne ; 8A pages 12, 13 et 14 portent bien le
  groupe, la première des deux et le cas ตลาด ; 9A page 7 dit bien qu'un ย ou un
  ว final ferme la syllabe « partout ailleurs » ; 5A page 5 traite bien le ห
  muet ; 7A page 1 est bien « une promesse de la leçon 1C ».
- **Les findings cités de `u09-l9a` existent et disent ce qu'on leur fait dire** :
  `BALAYAGE-INVENTE`, `SENS-MONO`, `COORD-42-3`, incertitudes 5 et 6,
  arbitrages 1 et 6.
- **Le fil des tons de `CONVENTIONS.md` est cité correctement** : sur-entraînement
  en 4 et en 7, entretien à partir de 8, jamais déclaré acquis.
- **Attributions de publication des spécimens d'exercice : exactes** pour ปลา
  (3D), ตรง (5B), เพลง (2A), โรค (9A), เปลี่ยน (8A), นั่ง (7A), ถุง (3A), สี่
  (3B), น้อง (6B), มาก (4D) et ถ่าน (7A, ton bas).
- **Spécimens et contrainte d'unité : RIEN à signaler, priorité 2 satisfaite.**
  Le fichier ne nomme aucune enseigne, aucun commerce, aucun prix, aucune rue,
  aucune station. Le dialogue est déclaré COMPOSÉ à partir d'ossatures publiées,
  et ces ossatures existent : `u09-l9e` item 9 est bien une instance du patron
  « état + ไหม + particule », et le dialogue de 9A emploie bien « ไม่ไกลค่ะ » en
  réponse. ป่าถ่าน est présenté comme un exemple du dictionnaire et rien d'autre,
  et la note culturelle prend soin de dire ce qu'elle n'affirme pas.
- **Priorité 3 : aucune affirmation de fréquence d'affichage non sourcée.** Le
  fichier n'écrit nulle part qu'un mot « se voit partout ». La phrase de la
  page 1 sur la rue et le menu porte sur la transcription propre au cours, pas
  sur la signalisation thaïe.

## Findings

### N1 — `REF-ITEM4` : l'item 4 renvoie au mauvais item de sa leçon d'origine

**Bloquant.** Le titre de l'item 4 écrit « ป่า (réemploi, publié par `u01-l1c`
item 4) ». Dans `u01-l1c`, l'item 4 est **ปู่**, grand-père paternel. ป่า y est
l'**item 2**. Un tiers qui suit la référence tombe sur un autre mot.

Le défaut est invisible à `item-fields-check.mjs`, qui apparie par la graphie et
non par le numéro d'item : c'est exactement le genre d'erreur que le contrôle
mécanique ne peut pas voir, et la leçon s'appuie pourtant sur ce contrôle pour
autoriser sa phrase « repris sans modification ».

Correction : « publié par `u01-l1c` item 2 ». Les champs, eux, sont exacts.

### N2 — `POS-เพลง` : une page d'enseignement donne la position fausse, et c'est la position piège

**Bloquant.** Page 3, bloc encadré : « Les deux à la fois. Dans เพลง, l'initiale
est พ, **en troisième position**. »

เพลง est เ(1) พ(2) ล(3) ง(4). Le พ est en DEUXIÈME position. La troisième est
ล, c'est-à-dire la deuxième consonne du groupe, c'est-à-dire précisément la
réponse que l'exercice 1 compte comme fausse et que ses « pièges connus »
nomment : « toucher la deuxième consonne d'un groupe ».

La page qui apprend à trouver l'initiale enseigne donc à toucher la mauvaise
lettre, sur le seul mot qui cumule les deux difficultés. Le fichier se contredit
lui-même : son propre plancher d'exercice 1 range เพลง parmi les cinq tirages
dont la réponse est **en position 2**.

Correction : « en deuxième position ». À rapprocher de N11, qui est le même
défaut de comptage sur เปลี่ยน.

### N3 — `CASE-UNIQUE` : « le montant n'a qu'une case » est démenti par le tableau de la page 2

**Bloquant.** Trois endroits affirment la même chose :

1. exercice 2, limite structurelle : « en syllabe vivante, le ton montant n'a
   qu'une case, haute sans marque, et le ton haut n'en a qu'une, basse plus
   ไม้โท. Il n'existe donc aucun autre chemin vers ces deux tons » ;
2. **feedback affiché à l'apprenant**, paires 2 et 5 : « le montant et le haut
   n'ont qu'une case chacun en syllabe vivante » ;
3. `note_fr` de l'item 1 : « le seul chemin du tableau qui mène au montant en
   syllabe vivante ».

Le tableau de la **page 2 de la même leçon** dit le contraire :

> MOYENNE : rien → moyen · ◌่ → bas · ◌้ → descendant · **◌๊ → haut · ◌๋ → montant**

Le montant a donc deux cases, haute sans marque et **moyenne plus ◌๋**. Le haut
en a deux, basse plus ไม้โท et **moyenne plus ◌๊**. Les onze cases du tableau de
`u08-l8a` sont d'ailleurs affichées page 2 en entier, et la Méta reconnaît
explicitement que « les deux cases de ◌๊ et ◌๋ existent au tableau depuis
`u08-l8a` ».

La contrainte réelle vient du VOCABULAIRE publié, qui ne porte aucun mot en ◌๊
ni en ◌๋, et non du tableau. La leçon impute la limite au tableau, l'affiche à
l'écran comme un enseignement, et enseigne ainsi un fait faux sur l'objet même
qu'elle récapitule.

Correction : « aucun mot publié par le parcours n'emprunte l'autre chemin, la
moyenne avec ◌๊ ou ◌๋ », dans les trois endroits.

### N4 — `H-TEST` : le test du ห de l'item 6 est faux, et le contre-exemple est dans la leçon d'origine citée

**Bloquant.** `note_fr` de ห้า : « Le test à retenir tient en un coup d'œil : un
ห suivi d'une consonne se tait, un ห suivi d'une voyelle ou d'une marque se
prononce. »

Balayage des graphies publiées : **หก**, six, publié par `u03-l3b` item 2.1,
c'est-à-dire la leçon que 10A cite comme origine de ห้า et de สอง. Le ห y est
suivi de la consonne ก et il se PRONONCE : la page 2 de `u03-l3b` le transcrit
elle-même « หก (hòk) ». หกสิบ, publié par le même item 4 de la même leçon, est un
second contre-exemple.

La ligne de sources du même item énonce pourtant la règle juste : « Le ห se tait
devant une **sonante** et se prononce ailleurs ». La `note_fr` sur-généralise
« sonante » en « consonne » et devient fausse. Un apprenant qui applique le test
à l'œil sur หก conclut que le ห est muet.

Correction : reprendre le mot « sonante » de la source, avec la liste des lettres
concernées, ou renvoyer à la page 5 de `u05-l5a` sans reformuler.

### N5 — `RID-หนี` : la lecture entre crochets citée n'existe pas dans l'entrée

**Bloquant.** Sources de l'item 6 : « corroboré par la lecture RID de หนี,
relevée le 2026-08-04, `[หฺนี]`, où le พินทุ sous le ห note la consonne muette. »

Entrée RID « หนี » réinterrogée le 2026-08-04 par
`node scripts/verification/rid-entry.mjs หนี` : l'entrée donne deux sens verbaux
et trois mots dérivés, et **ne porte aucune lecture entre crochets**. Le script
extrait explicitement les crochets quand il y en a, et il n'en sort aucun pour
หนี, alors qu'il en sort pour รถ, อักษรสูง, อักษรกลาง, อักษรต่ำ, มาตรา, ท et ถ
dans la même session.

Conséquence : le fait « le ห se tait devant une sonante » perd sa seconde jambe.
Il ne repose plus que sur la page 5 de `u05-l5a`, c'est-à-dire sur une autre
leçon du dépôt, qui n'est pas une source au sens de la politique. Le fait devient
mono-sourcé sans être déclaré tel, et il porte à la fois la `note_fr` de l'item 6
et l'exclusion des mots à consonne de tête.

Piste : l'entrée RID « ห » elle-même, ou une entrée qui porte réellement un
พินทุ. Ne pas réécrire la citation sans la réinterroger.

### N6 — `MONO-VIVANTE-MORTE` : le seul énoncé neuf de la leçon est enseigné sur une seule autorité

**Bloquant.** La page 5 affiche à l'apprenant le partage vivante contre morte.
La partie 3 du dossier le déclare mono-sourcé, ce qui est honnête, et
l'auditeur confirme le constat : `en.wiktionary.org/wiki/คำตาย` rend un 404 réel,
et l'entrée th.wiktionary reproduit la définition RID mot pour mot, donc ne
compte pas comme seconde autorité.

Mais l'amendement v1.2 de `CONVENTIONS.md` est explicite : « l'exigence de **deux
sources indépendantes par fait** ne change pas ». La seconde jambe proposée n'est
pas une source, c'est une vérification par les conséquences sur dix mots dont
huit sont vivants. Elle établit que le tableau tombe juste sur les vivantes, ce
qui était déjà mesuré sur 2 125 entrées ; elle n'établit pas la DÉFINITION du
partage, qui est ce que la page 5 affiche.

Le déclarer ne suffit pas à l'autoriser sur un écran. Deux issues seulement :
trouver une seconde autorité recevable, ou replier la page 5 sur le fait
graphique déjà double-sourcé, à savoir les familles de finales de `u09-l9a`,
et n'employer « morte » que comme étiquette de la porte sans en donner la
définition normative. C'est exactement le repli que le finding `SENS-MONO` a
imposé à `u09-l9a` et que 10A cite par ailleurs.

### N7 — `COORD-10` : le relevé de coordination d'unité est faux, et il se déclare final

**Bloquant.** La Méta écrit, en insistant : « **Coordination d'unité, RECOMPUTÉE
le 2026-08-04** […] le présent relevé est refait sur **l'état final**, par
script », puis :

- « **5 fichiers, 34 entrées, 31 graphies distinctes** » ;
- « La répartition par fichier est de 8 items en 10A et de 26 pour les quatre
  autres réunies » ;
- « **Collisions d'attribution : TROIS dans l'unité** […] เปิด et ปิด
  revendiqués par `lecon-10b.md` et `lecon-10e.md`, et ราคา revendiqué par
  `lecon-10c.md` et `lecon-10d.md` ».

Relevé de l'auditeur, `node scripts/verification/repo-thai-scan.mjs 10 10` le
2026-08-04 : **5 fichiers, 32 entrées, 31 graphies distinctes**. Par fichier :
10A 8, 10B 8, 10C 8, 10D 8, **10E 0**. Une seule collision, ราคา entre 10C et
10D.

Le motif est écrit noir sur blanc dans `lecon-10e.md`, section `## Items` :
10E a déplacé ses deux blocs เปิด et ปิด hors de `## Items`, vers ses spécimens
construits, précisément pour supprimer la collision, et son dossier consigne
« après ce déplacement, `repo-thai-scan.mjs 10 10` rend 32 entrées et 31 graphies
pour cinq fichiers, contre 34 et 31 avant ».

10A a donc relevé un état ANTÉRIEUR et l'a présenté comme final. Deux des trois
collisions annoncées n'existent plus, le total d'entrées est faux, la répartition
« 26 pour les quatre autres » est fausse (24), et l'arbitrage 6 demandé sur la
foi de trois collisions repose sur une seule.

C'est la quatrième variante du défaut que la leçon dénonce elle-même sur deux
pages : un chiffre attribué à un script que le script ne rend pas. Le fait que la
leçon ait déjà refait ce relevé une fois, et ait écrit qu'elle le refaisait sur
l'état final, l'aggrave plutôt qu'il ne l'excuse.

### N8 — `PROV-EX4` : la provenance des tirages de l'exercice 4 et les cartes SRS citées sont fausses

**Bloquant.** Deux affirmations liées.

1. Exercice 4 : « Tous les tirages sont des graphies **PUBLIÉES des unités 1 à
   4**, aucune n'est fabriquée pour l'occasion ».
2. SRS, hors périmètre : « คา, ค่า, ค้า, ขา, ข่า, ปา, ปู, ปู่, ปี่, หมา, ม้า,
   **มา**, หนี, นี้, **มี**, ขาว, ข้าว et ก้าว gardent leurs cartes des leçons
   **1A, 1C, 1D et 4A** ».

Balayage des sections `## Items` de tout le dépôt d'autorat :

| Graphie | Leçon qui la publie réellement                    |
| ------- | ------------------------------------------------- |
| มา      | `u05-l5b` item 2, **unité 5**                     |
| มี      | `u06-l6b` item 7 et `u06-l6d` item 1, **unité 6** |
| ขาว     | `u01-l1b` item 4, puis `u04-l4a` item 6           |
| ข้าว    | `u01-l1b` item 2, puis `u04-l4a` item 5           |

มา et มี ne sont donc pas des graphies des unités 1 à 4, et leurs cartes ne sont
ni en 1A, ni en 1C, ni en 1D, ni en 4A. ขาว et ข้าว sont d'abord publiées par
**1B**, absente de la liste, ce qui compte puisque la règle d'attribution du
dépôt donne la publication à la leçon la plus précoce.

Ce n'est pas une coquille : la section SRS s'appuie sur cette liste pour affirmer
qu'« aucune carte n'est créée pour eux, aucune n'est affaiblie ». Une
consolidation qui exécute cette phrase cherchera des cartes là où il n'y en a pas
et laissera intactes celles de 5B, 6B et 6D sans le savoir.

### N9 — `RID-COMPTE` : le décompte RID annoncé « recomputable » ne l'est pas

**Non bloquant, mais il touche le dossier de preuve.** Le dossier écrit :
« Décompte recomputable depuis les listes ci-dessous : **20 graphies distinctes
interrogées, 0 erreur de requête, 20 attestées.** »

Recompte depuis les listes elles-mêmes : 8 items, 5 spécimens ou contrôles,
5 entrées de terminologie, soit **18 graphies distinctes**. La quatrième ligne,
« citées à la note culturelle (2) », ne peut pas ajouter 2 : elle contient ป่า,
que la ligne dit elle-même « déjà comptée comme item », et ถ่าน, dont la même
ligne dit qu'elle « n'a pas été réinterrogée ». Le total de 20 additionne les
étiquettes des quatre listes sans lire ce que la quatrième dit.

Trois autres écarts sur le même bloc :

- **คำ figure dans la liste des spécimens et contrôles alors qu'elle n'est citée
  nulle part ailleurs dans le fichier.** Relevé Unicode : la chaîne `คำ` isolée
  apparaît une seule fois dans les 125 989 octets, et c'est dans cette liste.
  L'entrée s'auto-atteste.
- **ท et ถ ont été interrogées** — l'item 8 cite l'entrée « ท ๑ » — mais ne
  figurent dans aucune des quatre listes.
- Le tableau des audits annonce « 8 items sur 8 attestés comme vedettes du RID
  […] **plus 12 spécimens** », quand la liste du dossier en donne 5.

À quoi s'ajoute une citation mal ciblée : l'item 8 écrit « RID, entrée « ท ๑ » et
suivantes […] qui rangent ถ dans la มาตรากด ». L'entrée ท ๑ range **ท**, pas ถ.
Les entrées qui rangent ถ sont « ถ », qui donne d'ailleurs รถ pour exemple, et
« มาตรา » sens (๒). Le fait est vrai et double-sourcé ; c'est le pointeur qui est
faux.

### N10 — `CASES-SIX` : « six cases » est faux deux fois

**Non bloquant.** Deux décomptes de cases, tous deux sous-évalués.

1. Exercice 3 : « Les dix autres couvrent **les six cases** du tableau que le
   vocabulaire publié permet d'atteindre. » Recompte des dix tirages vivants :
   moyenne-rien (จาน), basse-rien (แพง), moyenne-◌่ (ป่า), haute-◌่ (สี่),
   haute-◌้ (ห้า), basse-◌่ (ง่าย), basse-◌้ (แล้ว, น้อง), haute-rien (สอง,
   ถุง) → **huit cases distinctes** sur les neuf du tableau de 7A, seule
   moyenne-◌้ manquant.
2. SRS : « ajouter à son jeu de tirages les huit mots du jour, qui couvrent
   **six de ses cases** ». Les sept items vivants couvrent **sept cases**
   distinctes ; le huitième, รถ, est mort et n'est pas une case.

Le mot « case » désigne partout ailleurs dans le fichier un croisement classe ×
marque, donc les deux chiffres se lisent sans ambiguïté et sont faux tous les
deux. Ils sous-vendent la leçon, ce qui n'excuse pas de les citer.

### N11 — `POS-เปลี่ยน` et `UNICODE-186` : positions et relevé Unicode périmés

**Non bloquant, mais N11 casse une spécification remise à l'intégration.**

Positions de เปลี่ยน, qui est เ(1) ป(2) ล(3) ◌ี(4) ◌่(5) ย(6) น(7) :

- page 3 : « le ไม้เอก est posé **quatre lettres plus loin** » — il est trois
  points de code plus loin, et deux des trois ne sont pas des lettres ;
- vérification Unicode : « porte sa marque sur la **quatrième position
  visible** » — le ◌่ se pose au-dessus du ล, troisième position visible ;
- vérification Unicode : « surligner le ป, **en troisième position de rendu** »
  — le ป est en DEUXIÈME position, de rendu comme de fichier, puisque seule la
  voyelle pré-posée เ le précède.

Cette dernière phrase est une consigne technique adressée au composant de
lecture. Exécutée telle quelle, elle surligne ล et l'exercice 1 mesure autre
chose que ce qu'il annonce, ce que la leçon déclare pourtant bloquant.

Sur le même bloc, le relevé cité de `unicode-thai.mjs`, « **186 chaînes thaïes
distinctes** dont 178 hors des champs `thai` », n'est plus reproductible : le
script rend aujourd'hui **192 et 184** sur ce fichier. Les autres résultats du
même relevé, 8 champs `thai`, NFC partout, aucune zone à usage privé, U+0E4C
3 fois, se reproduisent exactement. Le paragraphe s'auto-contamine, exactement
comme le balayage des formules dont la leçon a su, elle, restreindre la portée.

### N12 — `DATE-แล้ว` et `SEPT-SIX` : deux faits internes faux

**Non bloquant.**

1. `note_fr` de l'item 7 : « le mot le plus récent du jour, **publié la semaine
   dernière** ». `u09-l9d` porte « rédaction originale le 2026-08-04 » et l'unité
   9 a été committée le 2026-08-04 à 05:40. แล้ว a été publié le jour même, à
   quelques heures. La phrase est fausse, et elle n'a de toute façon aucun sens
   pour un apprenant, qui ne connaît pas les dates de publication du dépôt.
2. Bilan des incertitudes : « **Sept incertitudes sont OUVERTES**, la 1 à la 5
   plus la 7 ». L'énumération donne 1, 2, 3, 4, 5 et 7, soit **six**.

## Verdict

**Ne pas passer en `review`.** Huit findings bloquants, dont quatre portent sur
un écran d'apprenant : N2 (position fausse sur la page qui enseigne la position),
N3 (fait faux affiché en feedback, démenti par le tableau de la même leçon),
N4 (test du ห faux, contre-exemple publié en unité 3) et N6 (seul énoncé neuf,
mono-sourcé, affiché).

Ordre de traitement recommandé :

1. N2, N3, N4 : trois corrections d'écran, courtes, sans dépendance externe ;
2. N6 : décision éditoriale, seconde source ou repli sur les familles de 9A ;
3. N5 : réinterroger le RID et remplacer ou retirer la citation ;
4. N7, N8 : refaire les deux relevés par script et corriger Méta et SRS ;
5. N1, N9, N10, N11, N12 : corrections de citation et de décompte.

Après correction, deux contrôles suffisent à fermer la moitié de la liste :
`repo-thai-scan.mjs 10 10` pour N7, et un recompte de positions par point de code
pour N2 et N11. Ce qui manque au dépôt, et que N7 rend criant pour la deuxième
unité consécutive, est un contrôle qui REFUSE un fichier dont un chiffre cité ne
se reproduit pas. C'est l'arbitrage 6 de `u09-l9a`, toujours non exécuté.

Ce qui n'a PAS été trouvé mérite d'être dit, parce que l'audit a cherché :
aucune graphie fausse, aucun ton faux, aucun sens faux, aucun corrigé d'exercice
faux, aucun réemploi divergent sur les champs, aucun spécimen non déclaré, aucune
affirmation de fréquence non sourcée, aucune enseigne, aucun prix, aucune
adresse, et aucune référence externe inventée. Les 70 faits externes vérifiés
tiennent tous.

- Statut après audit : `draft`. Revue native : en attente.
