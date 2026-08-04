# Contre-audit adversarial de `u10-l10c` (Lire un menu)

- Date : 2026-08-04
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), consigne adversariale, aucun
  contact avec le rédacteur
- Fichier audité : `content/authoring/unite-10/lecon-10c.md`, sha256 du fichier
  au moment de l'audit `aab486eca60c55d1bdb1624647171528df47e68bc310496e93ef9ea575b0eea4`
- Verdict : **passage en `review` REFUSÉ.** 8 findings bloquants, 4 non
  bloquants. 74 faits re-vérifiés par l'auditeur et confirmés.

## 1. Ce que j'ai re-vérifié moi-même, et qui tient

Je n'ai repris aucun chiffre du dossier sur parole. Tout ce qui suit a été
recalculé ou re-interrogé le 2026-08-04.

### Contrôles mécaniques du dépôt, ré-exécutés

| Contrôle                             | Ce que la leçon annonce                                                            | Ce que j'obtiens      |
| ------------------------------------ | ---------------------------------------------------------------------------------- | --------------------- |
| `item-fields-check.mjs lecon-10c.md` | 1 fichier, 0 codepoints en faute, 0 écart                                          | identique             |
| `unicode-thai.mjs lecon-10c.md`      | 8 champs `thai`, 171 chaînes dont 163 hors champs, toutes NFC, 0 PUA, 12 signes    | identique             |
| U+0E4D résiduel                      | aucun                                                                              | aucun                 |
| U+0E3A / U+0E4C / U+0E47             | 1 / 3 / 1                                                                          | 1 / 3 / 1             |
| `repo-thai-scan.mjs 1 9`             | 45 fichiers, 429 entrées, 317 graphies, 103 ไม้เอก, 76 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา | identique             |
| `--grep หมู` / `ราคา` / `อาหาร`      | 0 / 0 / 0                                                                          | 0 / 0 / 0             |
| `--grep ข้าวผัด`                     | 4 graphies, liste nommée                                                           | identique, même liste |
| `--grep ร้าน`                        | 2 graphies, `u09-l9d`                                                              | identique             |
| décompte cartes SRS                  | 243                                                                                | 243                   |
| balayage phonétique français         | 0, 0, 0, 0 et `français` 6 fois                                                    | identique             |

Les huit séquences NFC des champs `thai` sont celles déclarées, caractère par
caractère.

### VOLUBILIS, exemplaire et lignes

Empreinte recalculée : 10 848 409 octets, sha256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, 114 579
lignes non vides, 586 541 chaînes partagées. C'est bien l'exemplaire annoncé.

**Les vingt et un numéros de ligne cités sont tous exacts** : หมู 56943,
ราคา 80679, อาหาร 337 et 338, ข้าวผัด 31810, ข้าวผัดหมู 31825, ข้าวผัดไก่ 31813,
บาท 4504, ห้าสิบ 15257, ข้าวผัดไข่ 31817, ข้าวผัดกุ้ง 31822, กุ้ง 46832,
ไก่ 21437, ไข่ 29401, น้ำเปล่า 59305, สี่สิบ 93087, สิบห้า 92935, แปดสิบ 65547,
ร้านอาหาร 81049, รายการอาหาร 80489, หมูสับ 57422, เมนู 54672. Les lignes voisines
signalées le sont aussi (56944 et 56945 pour หมู, 4505 à 4507 pour บาท, 21438
`(vulg.)` pour ไก่). Les marqueurs de ton `\khāo_phat /mū` et `\khāo_phat _kai`
donnent bien descendant, bas, montant et descendant, bas, bas.

### RID, entrées re-interrogées une par une

- « หมู » : six vedettes homographes, sens (๑) Suidae et sens (๒) étiqueté
  (ปาก). Conforme.
- « ข้าวผัด » : vedette unique, แม่คำ ข้าว, et **la définition nomme bien หมู**.
  Le fait le plus porteur de la leçon est vrai.
- « ราคา » : vedette unique, deux sens numérotés, ลูกคำ ราคาตลาด, aucune lecture
  entre crochets, aucune étiquette de registre. Conforme.
- « อาหาร » : vedette unique, deux sens, (ป., ส.), exemples อาหารเช้า อาหารปลา
  อาหารนก, ลูกคำ อาหารว่าง. Conforme.
- « บาท » : quatre vedettes, la deuxième monétaire, lecture [บาด, บาดทะ-].
  Conforme.
- Entrées de lettre « ห », « ร », « ค », « ก » : อักษรสูง / อักษรต่ำ (ตัวสะกด
  แม่กน, exemples การ et วาร) / อักษรต่ำ / อักษรกลาง. Conformes, y compris la
  clause du ห qui mène une basse seule sans être prononcé.
- Absences : ข้าวผัดหมู, ข้าวผัดไก่, ข้าวผัดกุ้ง, ข้าวผัดไข่, ห้าสิบ, ร้านอาหาร,
  รายการอาหาร et เมนู rendent toutes `absent`. Présences : กุ้ง, ไก่, ไข่, ผัด,
  จาน rendent `entree`.

### Wiktionary

Les trois entrées neuves ont été relues en rendu. หมู : Phonemic หฺมู,
/muː˩˩˦/, Paiboon `mǔu`, RI `mu`, sens « pork » explicitement conditionné à un
เนื้อ qui précède. ราคา : Phonemic รา-คา, /raː˧.kʰaː˧/, emprunt semi-savant au
malais `harga` du sanskrit अर्घ. อาหาร : Phonemic **อา-หาน**, /ʔaː˧.haːn˩˩˦/,
Paiboon `aa-hǎan`, sanskrit आहार ou pali `āhāra`, classificateurs อย่าง, มื้อ,
ชนิด, จาน, dérivés ร้านอาหาร glosé « restaurant » romanisé `ráan-aa-hǎan` et
รายการอาหาร glosé « menu ». Le pivot pédagogique du jour, le ร final réécrit น,
est confirmé par la source citée.

### Fréquence

`th_50k.txt` : sha256 `20e7052f...b6083`, 50 000 lignes. Rangs et occurrences
identiques aux six annoncés (อาหาร 2305/171, ไก่ 4644/84, ราคา 4900/80,
หมู 5152/76, บาท 23 499/16, กุ้ง 35 842/11) ; เมนู, ข้าวผัด, ผัด et les trois
blocs sont bien absents.

### Réemplois, champ par champ

Au delà des cinq champs que `item-fields-check.mjs` compare, j'ai relu `fr`,
`litteral` et `registre` des trois réemplois stricts : ข้าวผัด contre `u04-l4c`
item 1, บาท et ห้าสิบบาท contre `u03-l3c` items 3 et 7. **Aucune divergence, pas
même sur le « sìp brève » de `u03-l3c` que la leçon reprend au lieu de le
normaliser en « courte ».** L'item 6 est bien la concaténation exacte de
`u04-l4c` item 1 et de `u04-l4a` item 2. Les transcriptions citées à l'écran
(`khǎww·thôot`, `khàwwp·khoun khráp`, `thâo·rai`, `khài`, `kài`) sont celles du
dépôt. Les cartes `srs-u04-l4a-06`, `srs-u03-l3c-03`, `-04`, `-05`,
`srs-u05-l5a-01` et `-02` mesurent bien ce que la leçon leur fait dire.

### Calculs

Les cinq planchers ont été recalculés : 79/4096 = 1,93 %, 299/4096 = 7,30 %,
1/720 = 0,14 %, 8 et 36 bijections compatibles, 120 / 60 / 360 arrangements,
espérance 2,25 sur 6 et P(au moins 5) = 0,025390625. **Tous justes.** Le
décompte de la page 10 est juste aussi : 12 syllabes distinctes, 5 calculables,
7 données, 19 occurrences. Les tons calculés (อา moyen, หาน montant, รา moyen,
คา moyen, ข้าว descendant) sont corrects. Les corrigés des exercices 1, 2, 3 et
5 sont exacts, et aucun exercice n'est réussissable par une réponse constante.

C'est un dossier honnête et largement exact. Ce qui suit ne le contredit pas :
il porte sur ce que la leçon AFFIRME à l'écran, là où le dossier, lui, s'était
interdit de l'affirmer.

## 2. Findings bloquants

### B1 · MENU-REGLE. La leçon enseigne comme un fait la mise en page des cartes réelles, ce que son propre dossier s'interdit d'affirmer

L'écran énonce des règles générales sur les cartes thaïes :

- page 2 : « Une ligne de carte répond à deux questions, dans cet ordre : quoi,
  puis combien. » ;
- Méta, règle enseignée : « sur une ligne de carte, ce qui est écrit à gauche
  nomme, ce qui est écrit à droite chiffre ; le mot บาท ferme le bloc de
  droite » ;
- page 3 : « le nombre vient d'abord, le nom de la monnaie ensuite » ;
- exercice 3, feedback : « **บาท ferme la ligne, toujours.** » ;
- page 4 : « Notez au passage que **personne n'écrit จาน sur la carte** ».

Le dossier écrit l'inverse, deux fois : « aucune source n'a été consultée pour
savoir à quoi ressemble une carte réelle : cela n'aurait pas été vérifiable dans
le cadre de la politique du projet », et « elle ne dit rien de la façon dont les
restaurants sont signalés dans la rue, ni de la mise en page des cartes ». La
Méta va jusqu'à ranger « la mise en page des cartes réelles » dans ce que la
leçon n'ouvre pas.

Ces énoncés ne sont pas des descriptions du spécimen construit : ils sont écrits
au générique, avec deux absolus (« toujours », « personne »). Aucune source
recevable ne les porte, et une carte thaïe réelle peut parfaitement écrire un
prix sans บาท. C'est exactement la classe d'affirmation que la leçon déclare
éviter. Correction attendue : les rattacher explicitement au spécimen de la
page 9 (« sur cette carte », « dans les lignes que nous lisons ici »), retirer
« toujours » et « personne n'écrit », ou sourcer.

### B2 · ENTETE. Les deux en-têtes de colonne sont affirmés à l'écran comme un usage réel, alors que l'incertitude 3 les déclare inventés

L'incertitude 3 est parfaitement claire : « rien dans les sources consultées
n'atteste qu'ils sont employés comme EN-TÊTES DE COLONNE. C'est une mise en page
inventée pour faire lire. » Mais l'écran dit le contraire :

- page 6 : « Voici **le mot qui coiffe la colonne des plats.** » ;
- page 8, titre : « **ราคา, le mot qui coiffe les chiffres** » ;
- item 2, `note_fr` : « La première est **qu'il coiffe la colonne des chiffres
  sur une carte ou une étiquette.** »

La troisième est la plus grave : elle sort du spécimen et affirme un usage sur
« une carte ou une étiquette », c'est-à-dire dans le monde réel, dans un champ
d'item destiné à l'apprenant. La déclaration de la page 9 (« elle a été
fabriquée pour cette leçon ») ne couvre pas cette affirmation, qui porte sur
l'usage du mot et non sur l'origine de la carte.

### B3 · PROD-MONO. L'exercice 3 fait PRODUIRE les deux blocs mono-sourcés, ce que la leçon promet trois fois de ne jamais faire

La leçon justifie l'emploi de ข้าวผัดหมู et ข้าวผัดไก่, attestés par VOLUBILIS
seul, par une restriction de portée répétée :

- item 5 : « elle ne demande jamais ces blocs en production » ;
- `srs-u10-l10c-04` : « Ces deux blocs ne sont **jamais** demandés en production
  à partir du français » ;
- incertitude 2 : même formulation.

Or l'exercice 3 est un `word_order` dont la leçon dit elle-même qu'il « mesure
la COMPOSITION plutôt que la lecture ». Ses tirages 1, 2, 5 et 6 donnent les
blocs ข้าวผัด et หมู (ou ไก่) séparés et demandent de les assembler, et le
feedback de réussite valide la suite obtenue : « Oui. Le nom d'abord, le nombre
ensuite, บาท pour fermer. » L'apprenant produit donc, et reçoit comme correcte,
une séquence que la leçon ne peut attester qu'une fois. La restriction de portée
qui rend l'incertitude 2 acceptable n'existe pas dans le produit.

Deux issues possibles, aucune cosmétique : soit l'exercice 3 présente le nom du
plat comme UN bloc insécable (ข้าวผัดหมู en un seul jeton, ce qui conserve la
mesure de l'ordre plat / nombre / บาท sans faire composer le nom), soit la
revendication de non-production est retirée partout et l'incertitude 2 est
requalifiée en finding.

### B4 · REF-3D. จาน est attribué à la leçon 3D, qui ne contient pas ce mot

Deux endroits l'affirment, dont un écran :

- Méta, prérequis : « **leçon 3D : จาน**, le mot de comptage de ce qui est servi
  dans une assiette. » ;
- page 4 : « le mot de comptage **de 3D** sert quand on COMMANDE, pas quand on
  affiche. »

`content/authoring/unite-03/lecon-3d.md` ne contient **aucune occurrence** de
จาน : ses huit items sont คน, ตัว, ใบ, อัน, ปลา, ปลาสองตัว, ถุงสองใบ et กี่คน.
จาน est publié par `u04-l4c` item 3, avec exactement la glose que la leçon lui
prête (« assiette ; et, comme mot de comptage, ce qui est servi dans une
assiette ») **et le même fichier 10C l'écrit correctement deux lignes plus loin**
dans son prérequis 4C et dans sa liste de graphies d'écran. La référence 3D est
donc une erreur, pas une variante, et elle atteint l'apprenant.

### B5 · DUU. L'item 1 affirme que l'apprenant n'a pas encore vu ดู, publié depuis l'unité 1

Item 1, `note_fr` : « La voyelle ◌ู est le `ou` long, tenu, celle de ดู **que
vous n'avez pas encore vue** mais que vous entendez ici. »

ดู est un item publié de `u01-l1b`, **item 10**, où `u07-l7d` rappelle qu'« il
servait à poser la voyelle longue `ouu` ». Il est republié comme item 3 de
`u07-l7d`. Le scan du dépôt rend dix-neuf graphies portant ◌ู dans les unités 1
à 9, dont ดู, ปู, ปู่, พูด, อยู่ et ถูก. L'affirmation est fausse, et elle l'est
sur le point exact que la page 5 veut installer : la voyelle n'est pas neuve,
elle a été enseignée par ce mot précis.

### B6 · FREQ-VOIR. Deux affirmations de fréquence d'affichage, sans source recevable

- page 7 : « C'est 9A appliqué à **un mot que vous allez voir souvent.** » ;
- note culturelle : « c'est précisément ce qui rend un mot fréquent rentable :
  **il ne sert pas une fois, il sert partout.** »

Le seul signal de fréquence du dossier est `th_50k.txt`, un corpus de
sous-titres, dont la leçon écrit elle-même qu'il est « un mauvais témoin du
vocabulaire de table » et qu'il est employé « pour un usage précis et un seul,
trancher lesquels des mots de menu candidats sont à très haute fréquence ». Un
rang dans un corpus de parole filmée ne peut porter ni « vous allez le VOIR
souvent », qui est une fréquence d'affichage, ni « il sert partout », qui est une
ubiquité. Le dossier interdit d'ailleurs explicitement à la note culturelle de
parler de fréquence relative ; la phrase qui la clôt le fait quand même.

### B7 · HO-TOUS. Le repère du ห est présenté comme applicable à n'importe quel mot, alors que sa liste est incomplète

Page 6 : « Derrière le ห de หมู il y a un ม, qui est de la liste. Un seul coup
d'œil à la lettre suivante suffit à trancher, et **c'est un geste que vous
pouvez faire sur n'importe quel mot.** »

La liste employée est celle de `u05-l5a` page 5 : ง, น, ม, ย, ว, ร. Elle en
compte six, alors que les basses seules du thaï sont dix : ง ญ ณ น ม ย ร ล ว ฬ.
Un apprenant qui applique le geste « sur n'importe quel mot » lit หลาย, หลัง,
หญิง ou หนู avec un ห prononcé, ce qui est faux. `u05-l5a` prend d'ailleurs soin
de fermer la porte : « La liste complète et ce que ce ห muet fabrique viendront
plus tard. » Le dossier de 10C le sait aussi, puisqu'il écrit « il ne dit pas que
le repère de 5A couvre tous les cas de ห nu, ce que 5A elle-même ne prétend
pas ». L'écran, lui, le dit. Formulation attendue : « sur les mots de cette
leçon » ou « quand la lettre suivante est de cette liste », jamais « n'importe
quel mot ».

### B8 · VOLU-CITE. Trois citations VOLUBILIS attribuent à la base un contenu qu'elle ne porte pas

Le plus net, parce qu'il sert d'argument : le dossier écrit, à la section du
spécimen, « ข้าวผัดหมู, ข้าวผัดไก่ et ข้าวผัดไข่ sont attestés par VOLUBILIS avec
le domaine `CULINA (menu)` ». **La ligne 31817, celle de ข้าวผัดไข่, porte
`CULINA` seul**, sans `(menu)` ni `(THA)`. L'item de l'écran l'écrit d'ailleurs
correctement (« domaine `CULINA` ») : c'est le dossier qui généralise à trois ce
qui vaut pour deux, et il le fait dans le paragraphe qui justifie que les quatre
lignes de la carte sont « soit des items publiés, soit des blocs attestés ».

Trois autres citations sont tronquées sans marque de coupure, ce qui fait dire à
la base moins que ce qu'elle dit :

- ราคา ligne 80679 : domaine réel `COMM ; ECONO (market) ; VOGUE ; (Covid-19)`,
  cité sans `(Covid-19)` ;
- ร้านอาหาร ligne 81049 : même omission ;
- อาหาร ligne 337 : la glose FRA réelle continue par « popote [f] (fam.) ;
  bouffe [f] (fam.) ; boustifaille [f] (pop.) », coupée après « plat [m] » ; et
  le domaine `CULINA ; HOTEL ; MEDIC ; ORNITHO ; RID ; TOURIST`, donné comme
  couvrant les lignes 337 et 338, n'est celui que de la 337, la 338 portant
  `CULINA` seul ;
- กุ้ง ligne 46832 : FRA réelle « crevette [f] ; écrevisse [f] », citée
  « crevette [f] ».

Aucune de ces coupures ne change une décision, mais le dossier est un dossier de
preuve : une citation qui n'est pas recopiable à l'identique cesse d'être
vérifiable, ce qui est précisément l'objet de l'amendement v1.2.

## 3. Findings non bloquants

### N1 · RID-20. Le décompte « 20 graphies interrogées » est contredit par le dossier lui-même

Le dossier annonce « Décompte recomputable depuis les listes ci-dessous, dont la
somme fait le total : 20 graphies distinctes interrogées, 0 erreur de requête, 13
attestées comme vedettes et 7 absentes ». Les quatre sous-listes font bien 20.
Mais le même dossier consigne deux autres interrogations RID : « entrée
« กุ้ง ๑ » au RID, relevée le 2026-08-04 » et « เมนู est `absent` du RID, requête
du 2026-08-04 ». J'ai vérifié les deux : กุ้ง rend `entree`, เมนู rend `absent`.
Le total réel est donc d'au moins 22 graphies, 14 attestées et 8 absentes. Le
chiffre annoncé comme recomputable ne l'est pas.

### N2 · UNICODE-172. Le tableau d'état des audits annonce 172 chaînes, le script en rend 171

Le corps du dossier écrit « 171 chaînes thaïes distinctes dans tout le fichier
dont 163 hors des champs `thai` », ce que j'obtiens exactement. La ligne
« Unicode » du tableau d'état des audits écrit « 172 chaînes ». Une des deux
lignes n'a pas été relue après la dernière édition ; c'est le genre d'écart qui
fait perdre la confiance dans les autres chiffres du même tableau.

### N3 · SYLL-12. La page 10 annonce douze syllabes écrites, il y en a dix-neuf

Page 10 : « Sur cette carte, douze syllabes sont écrites en lettres thaïes. » Le
dossier, lui, écrit la phrase juste : « Douze syllabes DISTINCTES », puis compte
19 occurrences. Un apprenant qui compte les syllabes de la carte en trouve 19 et
ne retrouve pas le chiffre de l'écran, alors que la page prétend justement lui
donner un décompte exact. Ajouter « distinctes » suffit.

### N4 · TON-LECTURE. Le SRS déclare que ces tons ne sont jamais demandés en lecture ; l'exercice 5 les demande

Section SRS : « Les tons de ผัด, บาท, สิบ, หมู, ไก่, ไข่, น้ำ et เปล่า ne sont
donc **jamais demandés en lecture**, seulement en reconnaissance à l'écoute. »
L'exercice 5 montre la graphie thaïe, interdit l'écoute avant la réponse (« Vous
n'entendrez le mot qu'après avoir répondu »), rend l'accent de ton obligatoire et
non tolérant, et fait porter cette exigence sur หมู, ข้าวผัด, ข้าวผัดหมู,
ข้าวผัดไก่, บาท et ห้าสิบบาท. C'est bien une demande de ton en lecture, même si
le ton est restitué de mémoire et non calculé. La déclaration doit être
reformulée (« aucun ton n'est demandé au CALCUL en lecture ») ou l'exercice
révisé.

## 4. Points que j'ai attaqués et qui ont tenu

Pour que le prochain auditeur ne les refasse pas :

- la matrice de l'exercice 1 (4 plats par 3 prix) épuise bien 12 tirages, et
  aucune option n'est départageable par un seul bloc ;
- les cinq planchers sont justes au chiffre près, y compris le calcul détaillé
  de l'exercice 3 ;
- aucune réponse constante ne franchit un seuil, dans aucune des cinq
  mécaniques ;
- les trois mots neufs sont réellement absents des unités 1 à 9 ;
- le RID nomme bien หมู dans sa définition de ข้าวผัด, ce qui est le fait le plus
  porteur de la leçon et il est vrai ;
- la paire อาหาร contre หมู tranche bien par la lettre qui suit le ห, et les deux
  formes phonémiques de Wiktionary vont dans ce sens ;
- les tons de ราคา se déduisent réellement de la règle de 6A ;
- les trois réemplois stricts sont fidèles au champ près, `fr`, `litteral` et
  `registre` compris ;
- la carte ne porte aucune enseigne, aucun nom de commerce, aucune adresse, et
  son caractère construit est déclaré à l'écran page 9 ;
- le balayage des formules de phonétique française rend bien quatre zéros.

## 5. Collision d'unité, constatée après coup

La leçon déclare, à sa Méta et à son incertitude 8, ne pas pouvoir faire le
relevé de collisions de l'unité 10, le dossier étant vide au moment d'écrire. Le
dossier compte aujourd'hui cinq fichiers, écrits en parallèle dans la même
minute. **La collision annoncée existe** : `lecon-10d.md` publie ราคา comme son
item 1, avec les mêmes sept champs, et le déclare lui-même en proposant que 10C
publie et que 10D réemploie. `lecon-10e.md` republie par ailleurs ข้าวผัด et บาท
comme blocs de spécimen. Ce n'est pas un finding contre 10C, qui avait signalé le
risque et proposé la règle d'arbitrage ; c'est l'arbitrage 1 qui devient
exécutable et urgent.

## 6. Ce qu'il faut faire avant de relancer un audit

1. Rattacher B1 et B2 au spécimen, ou les sourcer. Ce sont les deux findings qui
   touchent ce que l'apprenant croira savoir de la Thaïlande.
2. Trancher B3 : bloc insécable dans l'exercice 3, ou retrait de la promesse de
   non-production.
3. Corriger B4, B5, B6 et B7, qui sont des corrections de phrase.
4. Corriger les citations de B8 et les trois décomptes N1 à N3.
5. Exécuter `repo-thai-scan.mjs 10 10` et appliquer l'arbitrage 1.
6. Seulement ensuite, préparer le lot de contre-audit externe.

Statut inchangé : `draft`. Revue native : en attente.
