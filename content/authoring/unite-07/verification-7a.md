# Contre-audit adversarial de la leçon 7A

> **Statut au 2026-08-04 : audit PASSÉ, findings résolus à la consolidation.**
> Les douze constats ci-dessous ont été repris un par un. Sept bloquants et
> cinq non bloquants sont traités ; la résolution de chacun est consignée dans
> `lecon-7a.md`, section « État des audits », une ligne par finding. Trois
> constats ont conduit à SUPPRIMER un fait plutôt qu’à le corriger, faute de
> source rouvrable : B3 en partie, B4 et B6. Deux corrections proposées par
> l’audit ont été mesurées avant d’être appliquées, et l’une des deux a été
> écartée au profit d’une formulation plus prudente, voir la section 6 ajoutée
> en fin de document. Le fichier reste `draft` : les portes encore ouvertes
> sont l’accessibilité, la contre-vérification RID manuelle, l’audio et la
> revue native.

- Cible : `content/authoring/unite-07/lecon-7a.md`, statut `draft`
- Date de l’audit : 2026-08-03
- Date de la consolidation : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5)
- Consigne : chercher des erreurs, ne rien croire sur parole, re-vérifier chaque
  fait à la source, y compris quand la source est citée dans le fichier
- Cadre : `content/authoring/CONVENTIONS.md` amendements v1.1 et v1.2,
  `docs/content-policy/sources-verification.md` section 1 bis

## Méthode

Aucune affirmation du fichier n’a été acceptée sur la foi de sa citation. Aucun
script du dossier n’a été réutilisé. Ont été refaits de bout en bout, le
2026-08-03 :

- 24 interrogations du RID 2554 en POST direct sur
  `dictionary.orst.go.th/func_lookup.php`, une requête par graphie, espacées de
  1,3 seconde, agent utilisateur identifiant l’audit, avec conservation des
  points de code bruts pour repérer la zone à usage privé ;
- relevés en rendu (`action=render`) sur en.wiktionary et th.wiktionary pour les
  8 items, les 2 spécimens, les 2 marques, les 3 entrées de classe, les 6 mots
  de la série tonale, les 4 paires minimales et les 10 graphies de la clé de
  longueur, plus l’annexe « Appendix:Thai script » ;
- lecture du wikitexte brut de th.wiktionary « ถ่าน » pour trancher une
  étiquette de registre ;
- ré-extraction indépendante de `VOLUBILIS.ods` par un parseur expat écrit pour
  l’audit, avec recalcul de l’empreinte, de la taille de `content.xml`, des
  décomptes de lignes non vides des trois feuilles, du contenu de toutes les
  lignes citées, et recherche indépendante des graphies dans la colonne `THA` ;
- téléchargement et empreinte du PDF UNGEGN, puis extraction de sa section
  « Notes » ;
- recalcul des 15 rangs FrequencyWords sur `th_50k.txt` après contrôle
  d’empreinte ;
- balayage indépendant des 30 fichiers `lecon-*.md` des unités 1 à 6, avec
  recomptage des entrées, des graphies distinctes et des tons publiés ;
- contrôle Unicode, NFC, codepoints et typographie sur le fichier tel qu’édité.

## Verdict

**Non recevable en l’état.** Sept constats bloquants, cinq constats non
bloquants.

**Le tableau des marques de ton est JUSTE, case par case.** C’est le point le
plus lourd de la leçon et il a été re-vérifié le plus durement possible : les
neuf cases tiennent contre le RID, contre th.wiktionary, contre dix prédictions
de mot et contre les vingt-trois tons déjà publiés par le parcours. Aucun écart.
Les erreurs trouvées sont ailleurs : deux transcriptions de reprise fausses
affichées à l’écran, une règle de position de la marque énoncée en absolu et
fausse, une affirmation superlative sur l’oreille française contredisant la
section 1 bis, et trois citations mal rendues.

**265 faits ont été confirmés par l’auditeur lui-même.** La qualité du dossier
de preuve est très élevée : la totalité des citations RID, la totalité des IPA
Wiktionary, la totalité des numéros de ligne VOLUBILIS, la totalité des rangs de
fréquence, la totalité des faits Unicode, la totalité des empreintes SHA-256 et
la totalité des corrigés d’exercice sont exacts.

## 1. Le tableau, case par case, au dictionnaire

Interrogation directe du RID, le 2026-08-03. Les glyphes de marque renvoyés par
le service sont bien en zone à usage privé ; ils ont été relevés en points de
code bruts avant tout dépouillement.

| Entrée RID | Ton de base, mot vivant | Première marque                                              | Seconde marque                 | Inventaire |
| ---------- | ----------------------- | ------------------------------------------------------------ | ------------------------------ | ---------- |
| อักษรกลาง  | สามัญ                   | 4 rupas, 5 tons, rupa et ton coïncident (กา ก่า ก้า ก๊า ก๋า) | idem                           | 9 lettres  |
| อักษรสูง   | จัตวา                   | U+F70A → เสียงเอก                                            | U+F70B → เสียงโท (ขา ข่า ข้า)  | 11 lettres |
| อักษรต่ำ   | สามัญ                   | U+F70A → เสียงโท                                             | U+F70B → เสียงตรี (คา ค่า ค้า) | 24 lettres |

Identification des glyphes de zone privée, confirmée par trois voies
concordantes comme l’annonce le dossier : la série d’exemples, l’emploi du vrai
U+0E49 dans la clause « คำตายสระยาว » de « อักษรต่ำ », et les entrées
th.wiktionary « อักษรกลาง », « อักษรสูง » et « อักษรต่ำ », qui reprennent la
formulation du RID avec ◌่ et ◌้ normalisés. Correspondance établie :
U+F70A = ไม้เอก, U+F70B = ไม้โท, U+F70C = ไม้ตรี, U+F70D = ไม้จัตวา.

Verdict case par case, en syllabe vivante :

| Case                | Enseigné par 7A | Re-vérifié                             |
| ------------------- | --------------- | -------------------------------------- |
| moyenne + ไม้เอก    | bas             | **JUSTE** (RID เอก ; th.wikt ◌่ → เอก) |
| moyenne + ไม้โท     | descendant      | **JUSTE** (RID โท)                     |
| haute + ไม้เอก      | bas             | **JUSTE** (RID เอก)                    |
| haute + ไม้โท       | descendant      | **JUSTE** (RID โท)                     |
| basse + ไม้เอก      | descendant      | **JUSTE** (RID โท)                     |
| basse + ไม้โท       | haut            | **JUSTE** (RID ตรี)                    |
| moyenne sans marque | moyen           | **JUSTE** (พื้นเสียงสามัญ)             |
| haute sans marque   | montant         | **JUSTE** (พื้นเสียงจัตวา)             |
| basse sans marque   | moyen           | **JUSTE** (พื้นเสียงสามัญ)             |

La correspondance nom de ton thaï vers contour a été refaite indépendamment sur
les six mots de la série : คา /kʰaː˧/, ข่า /kʰaː˨˩/, ค่า /kʰaː˥˩/, ข้า
/kʰaː˥˩/, ค้า /kʰaː˦˥/, ขา /kʰaː˩˩˦/. Six sur six concordent avec le nom de ton
que le RID emploie et avec les marqueurs VOLUBILIS cités.

Les exemples de leçon portent tous le ton annoncé : อ่าน /ʔaːn˨˩/, ถ่าน
/tʰaːn˨˩/, นั่ง /naŋ˥˩/, บ้าน /baːn˥˩/, ห้อง /hɔŋ˥˩/, ช้อน /t͡ɕʰɔːn˦˥/, นอน
/nɔːn˧/, ตื่น /tɯːn˨˩/, อาน /ʔaːn˧/, ทาน /tʰaːn˧/. Dix sur dix.

Contrôle le plus sévère, refait de zéro : balayage des 30 fichiers de leçon des
unités 1 à 6, **285 entrées et 216 graphies distinctes** (chiffres identiques à
ceux du dossier), puis relevé des tons publiés des 23 graphies de la page 9.
**23 concordances, zéro écart.** La liste de la page 9 est exacte, y compris
ดื่ม, ผ่า, ต้น et เลี้ยว.

L’entrée « ไม้เอก » d’en.wiktionary porte bien la note d’usage annoncée, mot pour
mot : « In modern Thai syllables with low class initial consonant and mai ek
become falling, mid class and high class - low. E.g. อ่าน (àan)… ». L’entrée
« ไม้โท » de la même édition ne porte que la glose « mai tho - ◌้ », sans note
d’usage. L’annexe « Appendix:Thai script » ne contient aucune règle de ton, rien
que la table des consonnes. **L’incertitude 1 est donc honnête et exacte.**

## 2. Constats bloquants

### B1. La transcription publiée de แม่ est falsifiée, et l’audit qui le certifie est faux

`u06-l6b` publie แม่ avec `ipa` /mɛː˥˩/, `longueur` longue et
`transcription` **`mâee`**. La leçon 7A affiche `mâe` :

- page 8, ligne 174, à l’écran : « Spécimen : แม่ (mâe) · นั่ง (nâng) » ;
- ligne 1236 : « Transcription publiée `mâe` » ;
- ligne 1554 : `mâe` figure dans la liste des reprises déclarées
  « reprises MOT POUR MOT de leur leçon d’origine, sans réécriture ni
  normalisation ».

`mâe` note une voyelle BRÈVE. L’amendement v1.1 impose le doublement de la
dernière lettre du graphème pour la longue, donc `aee`. La leçon affiche donc à
l’apprenant une longueur fausse pour un mot déjà publié, et le bilan
« Conformité de la transcription à la convention `thainaute-fr` v1.1 :
VÉRIFIÉE » (ligne 1546) est faux.

### B2. Même défaut sur พ่อ, et la liste de contrôle des reprises est incomplète

`u06-l6b` publie พ่อ avec /pʰɔː˥˩/, longue, `transcription` **`phâww`**. La
page 9, ligne 190, affiche « Spécimen : พ่อ (phâw) contre น้อง (náwwng) ».
`phâw` note une voyelle brève, `phâww` la longue.

Aggravant : ni พ่อ ni น้อง ne figurent dans la liste de contrôle de la ligne
1554, alors que les deux sont affichés à l’écran avec leur transcription. Le
contrôle de conformité n’a donc pas couvert l’ensemble des transcriptions
visibles.

### B3. Page 2, la position de la marque est énoncée en absolu, et l’absolu est faux

Page 2 : « Elles se posent toujours au-dessus, et toujours au-dessus de la
CONSONNE INITIALE, jamais au-dessus d’une autre lettre du mot. »

En thaï la marque se pose sur la DERNIÈRE consonne du groupe initial, pas sur la
première lettre. Contre-exemples déjà publiés par le parcours, et affichés à
l’écran par la page 10 de cette leçon même :

| Mot               | Séquence                           | Lettre qui porte la marque |
| ----------------- | ---------------------------------- | -------------------------- |
| หน่อย (`u02-l2c`) | U+0E2B U+0E19 U+0E48 U+0E2D U+0E22 | น, deuxième lettre         |
| อยู่ (`u05-l5c`)  | U+0E2D U+0E22 U+0E39 U+0E48        | ย, deuxième lettre         |
| อร่อย (`u04-l4b`) | U+0E2D U+0E23 U+0E48 U+0E2D U+0E22 | ร, deuxième lettre         |
| ไหว้ (`u02-l2b`)  | U+0E44 U+0E2B U+0E27 U+0E49        | ว, deuxième consonne       |

La page 10 présente ces quatre mots comme hors périmètre pour le TON, ce qui est
juste, mais l’apprenant qui applique la consigne absolue de la page 2 les lira
en contradiction directe avec ce qu’il voit.

Aggravant : la section « Position du signe » (lignes 1151 à 1156) déclare le
fait « la marque se pose au-dessus de la consonne initiale » sourcé deux fois.
Les deux sources ont été relues : le RID, entrée « วรรณยุกต์ », écrit
อยู่เบื้องบนอักษร, « au-dessus de la lettre » ; Unicode 17.0 range 0E47..0E4E en
catégorie Top. **Aucune des deux ne dit « consonne initiale ».** Le fait est
donc plus fort que ses sources.

### B4. Page 11, un absolu non sourcé sur l’oreille française, contredit deux fois par le dossier

Page 11, ligne 207, à l’écran : « Le tableau met deux fois le ton bas dans votre
lecture, et ce ton est justement celui que l’oreille française confond le plus
volontiers avec le ton moyen. »

La section 1 bis de `docs/content-policy/sources-verification.md` proscrit
explicitement les superlatifs et les absolus non sourcés sur le français. Aucune
source n’est citée ici, et la phrase est présentée comme un fait, pas comme une
décision du projet.

Aggravant : le dossier affirme le contraire, deux fois. Ligne 1193 : « La seule
phrase de la leçon qui touche au français est celle de la Méta et de
l’incertitude 3 ». Ligne 1419 : « aucun écran ne le présente comme un fait ».
Les deux affirmations sont fausses.

Remède conforme à la section 1 bis : soit deux sources indépendantes, soit une
reformulation en observation vérifiable par l’apprenant, soit le même cadrage
« décision pédagogique du projet » que la Méta emploie déjà.

### B5. th.wiktionary « ถ่าน » est mal cité, et la note de registre en dépend

Le wikitexte brut de `th.wiktionary.org/wiki/ถ่าน`, relu le 2026-08-03, donne
sous « คำนาม » :

```
# ไม้ที่เผาแล้วจนสุก มีสีดำ โดยมากสำหรับใช้เป็นเชื้อเพลิง
# {{คำย่อ|th|ถ่านไฟฉาย}}
# {{lb|th|ปาก}} [[คาร์บอน]]
```

L’étiquette ภาษาปาก porte donc sur **คาร์บอน**, pas sur l’abrègement de
ถ่านไฟฉาย, qui n’est étiqueté d’aucun registre. Or 7A écrit ligne 509 : « puis
« คำย่อของ ถ่านไฟฉาย » étiqueté ภาษาปาก », et l’incertitude 12 répète « la
version thaïe le marquant ภาษาปาก ». Conséquence directe : la note de l’item
(ligne 490) qualifie l’emploi « pile » d’« abrègement familier » sur la foi
d’une étiquette qui ne porte pas là.

Second point de la même phrase : la page ne « traduit pas le mot par charbon en
français », elle donne `ฝรั่งเศส: charbon de bois`.

### B6. La note de l’item บ้าน attribue au RID un sens qu’il n’a pas

Note de l’item, ligne 243 : « Le dictionnaire donne aussi à cette graphie le
sens de village, employé devant un nom de lieu ; ce second sens n’est pas
enseigné ici. »

Relevé RID du 2026-08-03 : le sens (๑) est nominal et contient déjà หมู่บ้าน
(village) ; le sens (๒) est un ADVERBE ou adjectif, ที่มีอยู่ตามบ้าน, illustré
par หนูบ้าน opposé à หนูนา et หมูบ้าน opposé à หมูป่า, c’est-à-dire
« domestique » et non « village ». La glose « village de … suivi du nom » est
celle de VOLUBILIS ligne 3878, correctement citée quatre lignes plus haut dans
le champ `sources`. La note attribue donc au dictionnaire une chose qu’il ne dit
pas, et décrit à tort son second sens.

### B7. `srs-u01-l1c` n’existe pas, et la carte de 1C est mal décrite

Ligne 738 : « Cette carte prolonge `srs-u01-l1c` et ne la remplace pas : celle
de 1C mesure des syllabes isolées, celle-ci des mots dont deux paires n’opposent
que la marque. »

Deux problèmes. D’abord l’identifiant n’existe nulle part dans le dépôt : la
section SRS de `u01-l1c` est rédigée en prose et ne porte aucun identifiant de
carte. Ensuite la description est fausse : la carte de 1C met en révision des
PAIRES de mots, nommément ปา/ป่า, ปู/ปู่, ปี/ปี่, คา/ข่า et ยา/หย่า, dont deux
sont reprises telles quelles par `srs-u07-l7a-03`. La justification de
non-recouvrement ne tient donc pas, et le recouvrement réel n’est signalé par
aucune incertitude, contrairement à celui de la carte 02.

## 3. Constats non bloquants

### N1. « Les neuf consonnes hautes »

Méta ligne 33, note de l’item ห้อง et note de l’item ถ่าน écrivent « les neuf
consonnes hautes ». Le RID, entrée « อักษรสูง », et th.wiktionary donnent
**onze** consonnes hautes, ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห. `u04-l4a` écrivait « les neuf
consonnes hautes d’usage courant », qualificatif que 7A laisse tomber. Le raccourci
est interne au dossier et n’apparaît sur aucun écran, mais il est faux hors
contexte et se propage d’unité en unité.

### N2. « De loin les plus courantes » n’est appuyé par aucune source

Page 2 : « ce sont de loin les plus courantes ». Le dossier ne source ce fait
nulle part. Mesure indépendante faite pour l’audit sur `th_50k.txt` :
occurrences pondérées ◌่ 1 092 647 et ◌้ 750 004, contre ◌๊ 29 444 et ◌๋ 30 555.
**L’affirmation est vraie**, mais elle reste à sourcer ou à rattacher à cette
mesure, conformément à la règle des deux sources par fait.

### N3. La note culturelle dit « réserve » là où sa propre source dit le contraire

« ce sont des mots savants venus du pali et du sanskrit, que le thaï réserve aux
rangs et aux échelons ». L’entrée RID « เอก », citée juste en dessous, donne
aussi le sens (๔) ดีเลิศ et สำคัญ, avec กวีเอก et ตัวเอก comme exemples, qui ne
sont ni des rangs ni des échelons. Remplacer « réserve » par « emploie
notamment » suffirait.

### N4. Trois incohérences de périmètre

- La Méta ligne 76 range เข้า parmi les formes hors périmètre nommées, la page
  10 ne le cite pas. Les deux listes devraient coïncider ou la Méta le dire.
- ล่ะ est cité à l’écran page 10 mais absent de la section « Reprises des unités
  1 à 6 citées à l’écran », qui prétend être exhaustive.
- Les champs `longueur` des items ห้อง et นั่ง portent « brève » alors que
  `CONVENTIONS.md` fixe le couple « courte, longue ». Défaut hérité de
  `u05-l5c`, à trancher à la consolidation plutôt qu’ici.

### N5. L’exercice 2 n’offre jamais l’option « ton montant »

Les dix tirages offrent quatre options fixes, moyen, bas, descendant et haut.
L’apprenant connaît pourtant cinq tons depuis l’unité 1, et le tirage 7 (นอน)
porte précisément sur une syllabe sans marque, cas où une initiale haute
donnerait « montant ». L’absence systématique de ce distracteur réduit l’espace
de réponse et rend le seul tirage sans marque plus facile qu’annoncé. À arbitrer
avec l’audit pédagogie, en même temps que l’incertitude 9.

## 4. Ce qui a été re-vérifié et tient

265 faits confirmés par l’auditeur, dont :

- **RID** : les 3 entrées de classe, คำเป็น, คำตาย, วรรณยุกต์, ไม้เอก, ไม้โท,
  ไม้ ๒, เอก, โท, ตรี ๓, จัตวา, plus l’absence attestée de เสียงเอก et
  เสียงสามัญ comme vedettes. Toutes les citations du dossier sont exactes, y
  compris ตีนกา comme nom alternatif de ไม้จัตวา, la liste des ลูกคำ de ไม้ ๒
  qui contient bien ไม้หันอากาศ, et les exemples ร้อยเอก, ปริญญาเอก, ร้อยโท,
  ปริญญาโท.
- **Sens** des 8 items et des 2 spécimens : nombre de vedettes et de sens exact
  dans les 10 cas (บ้าน 2, ห้อง 3, นอน 2, นั่ง 1, ช้อน 4, อ่าน 4, ถ่าน ๑ et ๒,
  ตื่น 4, อาน ๑ à ๕, ทาน ๑ à ๓), premier sens concordant dans les 10 cas.
- **Wiktionary** : les 8 IPA d’item, les 2 IPA de spécimen, les 6 de la série
  tonale, les 8 des quatre paires minimales, les valeurs Paiboon et Royal
  Institute citées, l’annotation « { Unorthographical ; Short } » de ห้อง en
  anglais et « ไม่ตามอักขรวิธี ; เสียงสระสั้น » en thaï.
- **VOLUBILIS** : empreinte SHA-256
  `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, 15 724 718
  octets, `content.xml` 379 601 910 octets, lignes non vides `Volubilis` 118 571,
  `Codes` 227, `Romanization` 86. Les 25 numéros de ligne cités sont exacts, y
  compris 3878, 16740, 66353, 61805, 9442 à 9444, 101412 à 101414 et 103222. La
  clé des tons (feuille `Codes`, lignes 215 à 220) et la clé de longueur
  (feuille `Romanization`, lignes 58 et 59) sont exactes. La clé `ø` contre `ǿ`
  a été refaite sur les dix graphies citées : ของ, ทอง, น้อง, ฟอง, ลอง, สอง,
  หมอน et ร้อน portent `ø` et une voyelle longue chez Wiktionary ; ห้อง et ต้อง
  portent `ǿ` et sont tous deux annotés brefs par Wiktionary.
- **FrequencyWords** : empreinte
  `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`, 1 504 712
  octets. Les 15 rangs cités sont exacts au rang près : ตื่น 1046, ห้อง 1079,
  บ้าน 1192, นั่ง 1907, ร้อน 1906, นอน 6103, อ่าน 11510, ช้อน 27852, ปี 55,
  ปา 13219, ป่า 14655, ทาน 25596, อาน 43075, ถ่าน et ปี่ absents.
- **Unicode 17.0** : les 4 marques avec classe combinatoire 107 et anciens noms
  « THAI TONE MAI EK » et « THAI TONE MAI THO » ; U+0E31 et U+0E37 en classe 0 ;
  les 9 consonnes et 5 signes vocaliques cités ;
  `IndicPositionalCategory-17.0.0.txt` daté du 2025-07-29, lignes
  `0E47..0E4E ; Top` et `0E40..0E44 ; Visual_Order_Left`.
- **UNGEGN** : PDF re-téléchargé, 89 474 octets, SHA-256
  `d4d4c8c906e8ab39bafa4556f9025cb0de115498a8b02ea28aa4325bf7d62b07`, en-tête
  « Version 4.0, September 2013 », note 5 énumérant quatre marques de ton puis
  la marque de silence et la marque d’abrègement vocalique, « completely
  ignored ».
- **Fichier** : stable en NFC ; 178 chaînes thaïes distinctes, 0 instable ; les
  8 `codepoints` recalculés depuis `thai`, 8 correspondances exactes ; le couple
  cité en prose pour อาน exact ; 0 tiret cadratin, 0 demi-cadratin, 0 U+2015, 0
  U+2212, 0 U+2012, 0 apostrophe droite, 0 guillemet droit, 490 U+2019.
- **Corrigés** : les 8 tirages de l’exercice 1, les 10 de l’exercice 2 avec leur
  répartition annoncée de 3 bas, 4 descendants, 2 hauts et 1 moyen, les 6 paires
  de l’exercice 3 et les 8 transcriptions de l’exercice 4 sont tous justes.
  Aucun distracteur n’est vrai. Les 8 transcriptions d’item respectent
  l’amendement v1.1, accent sur la première lettre du noyau, longueur par
  doublement de la dernière lettre du graphème.
- **Reprises** : `pàa`, `khaa`, `khàa`, `khâa`, `kháa`, `khǎa`, `máa`, `sìi`,
  `thaan`, `khâ`, `hâwng` et `náwwng` sont conformes à leur leçon d’origine.
  Seules `mâe` et `phâw` ne le sont pas, voir B1 et B2.
- **Renvois au dépôt** : la phrase de `u01-l1c` sur le signe au-dessus du ป,
  l’avertissement de la page 8 de `u04-l4a`, l’existence de `srs-u04-l4a-05` et
  de `srs-u06-l6a-04`, la politique de saisie tolérante de `u05-l5a` et
  `u06-l6a`, la page 6 de `u06-l6a` sur la place de l’accent, et le fait que les
  sept mots nouveaux ne sont items d’aucune leçon des unités 1 à 6.

## 5. Ce qui reste à trancher hors de cet audit

- L’incertitude 1 est exacte : la ligne ไม้โท n’est énoncée comme RÈGLE que par
  le RID. Les six cases restent néanmoins vérifiées mot par mot sur deux sources
  indépendantes de lui. Une grammaire de référence sur exemplaire réglerait le
  point.
- La contre-vérification RID manuelle des trois entrées de grammaire
  (incertitude 10) reste requise. Cet audit l’a faite par outillage, avec relevé
  des points de code bruts ; elle confirme les six cases mais ne remplace pas
  une lecture humaine du dictionnaire.
- L’audit accessibilité reste bloquant, pour la raison que la leçon donne
  elle-même : si ◌่ et ◌้ ne se distinguent pas à l’écran, aucun exercice ne
  mesure ce qu’il prétend mesurer.
- Revue native : en attente.

## 6. Résolution des findings, consolidation du 2026-08-04

Chaque constat a été re-vérifié avant d’être traité : aucune correction n’a été
appliquée sur la seule foi de l’audit. Une ligne par finding.

| Code | Traitement                                                                  | Vérification faite avant application                                                                                     |
| ---- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| B1   | CORRIGÉ, `mâe` devient `mâee` en trois endroits                             | `u06-l6b` relu au dépôt : /mɛː˥˩/, longue, `mâee`                                                                        |
| B2   | CORRIGÉ, `phâw` devient `phâww` ; liste de contrôle refaite par extraction  | `u06-l6b` relu : /pʰɔː˥˩/, longue, `phâww` ; `náwwng` déjà conforme                                                      |
| B3   | Absolu SUPPRIMÉ, repère restreint au périmètre, frontière enseignée page 10 | 6 contre-exemples relevés en points de code ; ligne `0E47..0E4E ; Top` relue sur unicode.org                             |
| B4   | Fait SUPPRIMÉ, remplacé par décision de projet plus observation vérifiable  | aucune source autorisée trouvée ; les deux phrases de dossier qui le niaient corrigées                                   |
| B5   | Citation RECTIFIÉE, qualificatif « familier » SUPPRIMÉ                      | wikitexte brut et rendu de th.wiktionary/ถ่าน relus directement                                                          |
| B6   | Fait SUPPRIMÉ, aucune ré-attribution                                        | RID non rouvrable ici (POST seul) ; le relevé RID du dossier place déjà village au sens ๑                                |
| B7   | Identifiant RETIRÉ, recouvrement DÉCLARÉ et renvoyé à l’incertitude 8       | recherche `srs-u01-l1c` sur `content/`, `docs/`, `packages/` : une seule occurrence, la fautive ; SRS de `u01-l1c` relue |
| N1   | Qualificatif « d’usage courant » RESTAURÉ, inventaire consigné              | th.wiktionary « อักษรสูง » relu : « มี 11 ตัว » ; fait déclaré mono-sourcé, non affiché                                  |
| N2   | Fait de fréquence SUPPRIMÉ, remplacé par une mesure interne                 | 216 graphies publiées : 70 ไม้เอก, 40 ไม้โท, 0 ไม้ตรี, 0 ไม้จัตวา                                                        |
| N3   | Absolu AFFAIBLI, « réserve » devient « emploie notamment »                  | aucune source nouvelle invoquée, la correction ne fait que retirer un absolu                                             |
| N4   | CORRIGÉES toutes les trois                                                  | เข้า confirmé item de `u01-l1b` ; ล่ะ item de `u06-l6e`, `lâ` ; `CONVENTIONS.md` fixe « courte »                         |
| N5   | Option « ton montant » AJOUTÉE comme distracteur, retour dédié écrit        | les 10 corrigés relus, inchangés et justes ; répartition complétée par « aucun montant »                                 |

**Correction proposée par l’audit et NON retenue telle quelle.** L’audit énonce,
pour B3, que « la marque se pose sur la DERNIÈRE consonne du groupe initial ».
La formulation a été testée avant d’être appliquée, sur quatorze graphies du
dépôt, et elle tient sans contre-exemple à condition de la rapporter à la
SYLLABE et non au mot : dans อร่อย, ร n’est pas en groupe avec le อ initial,
il est l’initiale de la seconde syllabe. Elle n’a pourtant pas été écrite dans
la leçon, pour deux raisons cumulées : aucune source autorisée par
`docs/content-policy/sources-verification.md` ne l’énonce, et elle suppose les
notions de groupe initial et de consonne de tête que la page 10 met hors
périmètre. La leçon se limite donc au fait sourcé, « au-dessus d’une lettre »,
plus un repère explicitement restreint à ses propres mots. Point ouvert comme
incertitude 13 de `lecon-7a.md`.

**Ce que la consolidation n’a pas pu vérifier elle-même.** Le service du RID ne
répond qu’en POST et n’est pas atteignable depuis cet environnement ;
`VOLUBILIS.ods` et `th_50k.txt` ne sont pas dans le dépôt. Aucune citation
nouvelle issue de ces trois sources n’a donc été ajoutée, et le fait de B6 a
été supprimé plutôt que réécrit. Les 265 faits confirmés par cet audit ne sont
pas re-certifiés une troisième fois par la consolidation : ils restent portés
par le dossier d’origine et par cet audit.
