# Vérification adversariale de `lecon-8e.md`

- Fichier audité : `content/authoring/unite-08/lecon-8e.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer »
- Cadre : `content/authoring/CONVENTIONS.md` amendement v1.2 ;
  `docs/content-policy/sources-verification.md` section 1 bis
- Méthode : aucune citation de la leçon n'a été crue sur parole. Chaque relevé
  a été refait ici, en direct, le 2026-08-04, avec l'outillage versionné du
  dépôt, une sonde RID écrite pour l'occasion qui ne renvoie que des booléens
  de présence, et l'exemplaire de VOLUBILIS présent sur la machine, dont
  l'empreinte est recalculée plus bas.

## 0. Portée des deux priorités de la commande d'audit

La commande demandait de traiter en priorité les deux marques de ton restantes
(consigne écrite pour 8A) et la polysémie de ถูก (consigne écrite pour 8C).
Mesure faite sur le fichier audité :

- **Marques ไม้ตรี (◌๊) et ไม้จัตวา (◌๋) : zéro occurrence dans 8E.** Comptage
  caractère par caractère refait ici : le fichier n'affiche aucune des deux, ni
  dans le dialogue, ni dans un item, ni dans un exercice. La déclaration de la
  Méta est exacte. Il n'y a donc aucune case de tableau à contrôler dans ce
  fichier. Les cases que 8E emploie réellement sont celles de 7A, et elles ont
  été recontrôlées une par une, voir la section 1.B et le finding F-05.
- **ถูก : zéro occurrence en thaï.** Le mot n'apparaît que dans la section des
  items écartés et dans deux options d'exercice rédigées **en français**. La
  leçon ne peut donc pas laisser croire à un sens unique : elle n'enseigne pas
  le mot du tout, et son renvoi (« ถูก, bon marché, publié par `u08-l8c`
  item 1 ») correspond exactement au sens que 8C enseigne, 8C traitant par
  ailleurs la polysémie en propre. Contrôlé au RID : la vedette ถูก porte bien
  des sens sans rapport entre eux (prix, contact, justesse, auxiliaire de
  subir), ce qui rend la prudence de 8C nécessaire et celle de 8E suffisante.
  **Aucun finding sur ce point.**

## 1. Ce qui a été re-vérifié et confirmé

Décompte total des faits re-vérifiés et confirmés par l'auditeur : **176**.

### A. Encodage et graphie, 23 faits

Les 21 graphies déclarées par les 18 items (dont quatre items à double forme)
ont été recalculées point de code par point de code à partir du champ `thai`
du même item, puis comparées au champ `codepoints`. **21 graphies sur 21
concordent, 0 écart.** La déclaration « 18 items sur 18 concordants » du
dossier est donc exacte.

Contrôle de normalisation refait sur le fichier entier : 881 suites de
caractères thaïs extraites, **0 suite non invariante par NFC, 0 non invariante
par NFD, 0 caractère du bloc `Thai` hors plage assignée**. Conforme à la
déclaration du dossier.

### B. Tons par syllabe, 27 faits

Les 27 mots distincts du dialogue ont vu leur ton recalculé depuis la classe de
l'initiale, la nature de la syllabe et la marque éventuelle, sans regarder les
champs de la leçon avant le calcul : สวัสดี, ครับ, ผม, หา, เสื้อ, ค่ะ, ตัว, นี้,
ไหม, คะ, เท่า, ไร, เก้า, สิบ, บาท, แพง, เกิน, ไป, มี, เงิน, แปด, ขอ, โทษ, ปัญหา,
ใหญ่, เปลี่ยน, หน่อย, ขอบ, คุณ, แล้ว, เจอ, กัน. **Tous les tons publiés par 8E
sont justes**, y compris les trois cas où la leçon devait résister à une
analogie : ครับ haut par syllabe morte brève sur basse, ค่ะ descendant par
ไม้เอก sur basse, คะ haut par syllabe morte brève sur basse.

Le recomptage complet a été refait indépendamment : **67 syllabes**, réparties
en **18 moyens, 16 bas, 14 hauts, 11 descendants, 8 montants**. Les huit
sous-totaux par réplique (8, 8, 5, 4, 11, 4, 17, 10) sont exacts eux aussi. La
somme et le détail de la Méta sont donc recomputables et justes.

### C. Marques de ton présentes, 6 faits

Comptage refait caractère par caractère sur les huit répliques : **10 ไม้เอก,
6 ไม้โท, 16 au total, dans neuf mots distincts** (ค่ะ, เสื้อ, นี้, เท่าไร, เก้า,
ใหญ่, เปลี่ยน, หน่อย, แล้ว), **0 ไม้ตรี, 0 ไม้จัตวา**. Tous les chiffres de la
Méta sont exacts.

Les trois mots que 8E déclare lisibles avec le tableau de 7A le sont
réellement : เสื้อ (haute + ไม้โท, descendant), นี้ et แล้ว (basse + ไม้โท,
haut). Les cinq mots déclarés hors règle pour syllabe morte, forme เ◌า ou
consonne de tête le sont aussi, et 7A les écarte bien nommément. **Le sixième,
เปลี่ยน, ne l'est pas : voir F-05.**

### D. Royal Institute Dictionary 2554, 30 faits

Trente-deux graphies interrogées par moi le 2026-08-04, une requête POST par
mot sur `func_lookup.php` avec `word=<graphie>&funcName=lookupWord&status=lookup`,
via `scripts/verification/rid-lookup.mjs` :

- **Attestées, conformes à la leçon** : ตัว, นี้, หา, เสื้อ, เงิน, ปัญหา,
  เปลี่ยน, เกินไป, ใหญ่, แพง, มี, ขอ, หน่อย, ขอโทษ (titre groupant ขอโทษ et
  ขอประทานโทษ, exactement comme écrit), เท่าไร, บาท, เก้า, เท่า, มาก.
- **Absentes, contrôles négatifs conformes** : ตัวนี้, แพงเกินไป, ใหญ่เกินไป,
  มีปัญหา, ขอเปลี่ยน, เก้าสิบ, ห้าสิบ, et trois sondages de la liste des
  absences non citées, ไม่เป็นไร, แล้วเจอกัน, เชียงใหม่.
- **Sonde d'article, ตัว** : la chaîne exacte **เสื้อ ๒ ตัว est présente** dans
  l'article, ainsi que ลักษณนาม et สัตว์. La citation de l'item 4 et de la note
  culturelle est donc juste sur ce point précis, et la variante เสื้อ ๑ ตัว est
  absente, ce qui confirme que le nombre cité est le bon.
- Arithmétique du dossier recomptée : 35 attestées + 22 absentes = 57 graphies,
  59 requêtes avec les deux ré-interrogations déclarées. **Cohérent.**

Deux sondes supplémentaires produisent des findings et sont détaillées en
section 2 : l'article de ตัว **ne contient ni โต๊ะ ni เก้าอี้** ; l'article de
ใบ **ne contient ni ขวด ni หมวก**, tandis que ขวด porte lui-même l'étiquette
ลักษณนาม.

### E. VOLUBILIS, 14 faits

L'exemplaire cité par 8E, `VOLUBILIS_Database.xlsx` de 10 848 409 octets,
**n'existe pas sur cette machine** et son URL de téléchargement, documentée en
tête de `scripts/verification/volubilis-lookup.mjs`, **renvoie HTTP 404 au
2026-08-04**. Voir F-07. Le contrôle a donc été fait sur l'exemplaire présent,
`VOLUBILIS.ods`, 15 724 718 octets, sha256
`bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, identique à
l'empreinte consignée par `scripts/verification/volubilis-codes.mjs`, feuille
`Volubilis`, 118 573 lignes. La comparaison porte donc sur le **contenu** des
entrées, pas sur les numéros de ligne.

Résultat : **quatorze citations sur quinze sont exactes au mot près**, gloses
françaises, anglaises, catégories, colonnes de syllabation et marqueurs de ton
compris.

- ตัว : six lignes, dont la ligne de classificateur qui énumère bien
  « animaux, insectes, poissons, objets possédant des pieds (tables,
  chaises ...), vêtements avec manches ou jambes (chemises, pantalons,
  sous-vêtements ...), cigarettes, lettres de l'alphabet », `CLASS` en domaine
  et **pas** `RID`. Les quatre lignes précédentes portent bien corps, agent,
  signe et chiffre. Le décalage de numérotation annoncé entre les deux
  exemplaires est vérifié et constant sur ce bloc (109975 à 109979 ici contre
  106401 à 106405 cité).
- เสื้อ : ligne 94630 dans le `.ods`, exactement le numéro que cite `u08-l8a`,
  `TEXTILE`, gloses « vêtement [m] ; habit [m] ; chemise [f] ; tenue [f] », et
  la ligne porte en outre **le classificateur `tūa (ตัว)` en propre**, ce qui
  donne au fait du classificateur une jambe de plus que celles citées.
- เงิน : deux lignes, domaine `COMM ; ECONO ; MINENG ; SOCIO ; TOURIST`, gloses
  et ligne du métal conformes.
- หา : quatre lignes, `/hā`, `v.`, `RID` au domaine, « chercher ; rechercher »,
  puis trouver, accuser, rendre visite. Conforme, y compris l'aveu de
  dépendance au RID.
- เกินไป : `-koēn-pai`, `adv.`, `RID`, « trop ; excessivement ». Conforme.
- เปลี่ยน : `_plīen`, `v.`, syllabation `[เปฺลี่ยน]`, gloses conformes, **sans**
  `RID` au domaine, comme déclaré.
- แพงเกินไป : `adj.`, `COMM`, « trop cher », « too expensive ». Conforme.
- ใหญ่เกินไป : `adj.`, syllabation `[ไหฺย่ เกิน-ไป]`, « trop grand », « too
  big ». Conforme.
- มีปัญหา : `v. exp.`, « avoir un problème ; avoir des problèmes ; il y a un
  problème », plus une seconde ligne adjectivale. Conforme.
- ขอโทษ : trois lignes, `/khø\thōt`, `LEGIS ; RID` puis deux expressions.
  Conforme.
- เก้าสิบ et แปดสิบ : `num.`, « quatre-vingt-dix », « quatre-vingt »,
  marqueurs `\kāo_sip` et `_paēt_sip`. Conforme.
- ใบ : ligne de classificateur conforme au texte cité.

La quinzième, ปัญหา, fait finding : la ligne porte `ECONO ; EDUC ; RID` en
domaine, alors que 8E la range parmi celles où `RID` **ne figure pas**. Voir
F-06.

### F. Wiktionary, 10 faits

Dix pages de l'édition `en` récupérées en rendu par moi le 2026-08-04. **Les
dix citations de 8E sont exactes**, IPA, romanisation Paiboon, gloses et
étymologies comprises : หา (`hǎa`, /haː˩˩˦/, to seek, to find, to search, to
look), เสื้อ (`sʉ̂ʉa`, la ligne d'en-tête porte bien « classifier ตัว »), ตัว
(`dtuua`, /tua̯˧/, section Classifier **sans** mention de vêtement, ce que 8E
déclare honnêtement au lieu de le masquer), เงิน (`ngən`, trois sens, forme
phonémique explicitement notée « Short »), ปัญหา (`bpan-hǎa`, problem,
question, trouble, difficulty, pali `pañha`), เปลี่ยน (`bplìian`, to change, to
modify, to alter, forme phonémique `เปฺลี่ยน`), เกินไป (`gəən-bpai`, adverbe,
too much, excessively, étymologie เกิน plus ไป), ใหญ่ (`yài`, forme phonémique
`ไหฺย่`, big, large, great), นี้ (`níi`, Royal Institute `ni`, this, these), et
เก้า, contrôlé en propre parce que sa longueur était suspecte.

**Point de méfiance levé** : `kâao` avec voyelle longue pour เก้า, contre
`thâo` bref pour เท่า, alors que les deux mots emploient la même forme เ◌า.
Ce n'est pas une incohérence de 8E. Wiktionary donne pour เก้า la forme
phonémique `ก้าว` et l'IPA /kaːw˥˩/, romanisation Paiboon `gâao`, et `u03-l3b`
avait déjà publié l'item avec cette longueur et cette transcription. 8E reprend
donc une décision publiée, sans la rouvrir.

### G. FrequencyWords, 16 faits

Fichier `th_50k.txt` retrouvé sur la machine : **1 504 712 octets, 50 000
lignes, sha256
`20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`**, identique
au chiffre publié par 8E. C'est bien le même exemplaire, ce qui rend le relevé
entièrement recomputable.

Quatorze rangs sur vingt-deux sont exacts : ครับ 10, ขอบคุณ 15, ค่ะ 21,
สวัสดี 54, ขอโทษ 103, มี 276, นี้ 318, แล้วเจอกัน 393, หน่อย 777, ไหม 966,
ขอ 1 457, เท่าไร 10 465, บาท 23 499, แพง 24 549 ; et les quatre absences
annoncées (แพงเกินไป, ใหญ่เกินไป, เก้าสิบ, แปดสิบ) sont réelles.

**Les huit autres sont faux. Voir F-01, qui est le finding le plus grave de cet
audit.**

### H. Comptages internes du dialogue, 16 faits

Recomptés sans reprendre les chiffres de la leçon : 67 syllabes ; les cinq
totaux par ton ; 10 ไม้เอก ; 6 ไม้โท ; 9 mots marqués ; 0 ไม้ตรี ; 0 ไม้จัตวา ;
ครับ neuf fois, dont quatre à la seule réplique 7 ; ค่ะ six fois ; คะ une seule
fois, à la seule question de la vendeuse ; six syllabes portant la cible
phonétique ; ตัว trois fois, aux répliques 2, 3 et 7 ; เงิน, เสื้อ et เปลี่ยน
une fois chacun ; un seul /ŋ/ final, dans แพง. **Tous exacts.**

Couverture lexicale : les 27 mots du dialogue ont été confrontés un par un aux
listes d'items des leçons citées. **La déclaration « 100 % du lexique est
couvert » est vraie**, et le seul contenu neuf est bien le bloc ตัวนี้.

### I. Renvois internes au dépôt, 40 faits

Quarante renvois d'item, de carte ou de page ont été ouverts dans le dépôt et
sont **exacts** : `u01-l1d` (นี้), `u01-l1e` items 2, 3 et 5, `u02-l2b` item 3,
`u02-l2c` items 3, 4, 5, 7 et 8, `u02-l2d` item 1, `u02-l2e` items 10, 12 et
13, `u03-l3b` item 4 et sous-item 2.5, `u03-l3c` items 1, 3, 5, 6, 7 et 8,
`u03-l3d` items 2 et 3, `u03-l3e` item 14 (สิบสาม, distracteur non enseigné,
exactement comme 8E l'écrit) et sa réplique de Nok, `u04-l4c` items 5, 6 et 7,
`u05-l5d` items 5 et 7, `u06-l6b` items 7 et 8, `u06-l6c` items 2 et 5,
`u06-l6d` item 1, `u07-l7a` item 2 (ห้อง) et page 10, `u07-l7e` carte 08 et
politique de saisie reprise mot pour mot, `u08-l8a` items 1, 3, 4, 5, 6, 7 et 8
et page 7 (qui annonce bien la paire เสีย contre เสื้อ), `u08-l8b` items 1 et 6,
`u08-l8c` items 1, 4, 5, 6 et 8, `u08-l8d` items 1, 4, 5, 6, 7 et 8, les sept
cartes SRS citées (`srs-u02-l2b-03`, `srs-u03-l3c-01`, `srs-u03-l3c-04`,
`srs-u04-l4d-02`, `srs-u05-l5e-08`, `srs-u06-l6e-09`, `srs-u07-l7e-04`) et le
finding N2 du contre-audit de `u05-l5a`, qui porte bien sur le champ `fr` des
items en réemploi.

**Deux renvois font finding** : celui de la page 6 sur le son ng (F-04) et
celui de 7A sur les groupes consonantiques (F-05). Un troisième chiffre est
faux, la longueur de la plus longue réplique de `u07-l7e` (F-08).

## 2. Findings

### F-01 (BLOQUANT) Huit rangs de fréquence sur vingt-deux sont faux, et la conclusion qu'ils portent l'est aussi

Le dossier écrit : « Empreinte recalculée le 2026-08-04 : 1 504 712 octets,
50 000 lignes, SHA-256 `20e7052f...`, identique à celle consignée par
`u05-l5a`, `u06-l6e` et `u07-l7e` : c'est le même exemplaire. Rangs
recalculés, premier rang d'apparition de la graphie en tête de ligne ».

L'empreinte est juste, le fichier est le même, la méthode annoncée est celle
que j'ai appliquée. Les valeurs, elles, ne sont pas celles du fichier :

| graphie | 8E annonce           | fichier réel        |
| ------- | -------------------- | ------------------- |
| เงิน    | rang 302, 1 232 occ. | **rang 916, 423**   |
| ตัว     | rang 348, 1 087 occ. | **rang 859, 453**   |
| หา      | rang 384, 979 occ.   | **rang 141, 2 417** |
| ปัญหา   | rang 618, 623 occ.   | **rang 3 676, 106** |
| ใหญ่    | rang 1 095, 351 occ. | **rang 4 136, 95**  |
| เปลี่ยน | rang 1 148, 336 occ. | **rang 1 155, 334** |
| เกินไป  | rang 1 462, 266 occ. | **rang 7 766, 50**  |
| เสื้อ   | rang 2 093, 187 occ. | **rang 14 674, 26** |

Ce ne sont pas des approximations : ce sont les valeurs d'**autres lignes** du
fichier. Le rang 302 est celui de `let` (1 225 occurrences), le 348 celui de
`will` (1 077), le 384 celui de ตกลงไหม (968), le 618 celui de โทษทีนะ (621),
le 1 095 celui de บอกมา (351, chiffre repris tel quel), le 1 462 celui de
แคร์รี่ (266, repris tel quel), le 2 093 celui de มานี่เร็ว (186). Autrement
dit, chaque paire rang/occurrences est plausible prise isolément, mais elle est
attachée à la mauvaise graphie, ce qui est précisément ce qu'un dossier de
preuve doit rendre impossible.

La contre-preuve la plus simple ne demande même pas le fichier : **les leçons
voisines de la même unité, relevées le même jour, donnent les vraies valeurs**.
`u08-l8b` écrit « หา au rang 141 sur 50 000, 2 417 occurrences ». `u08-l8c`
écrit « ใหญ่ au rang 4136, 95 occurrences » et « เกินไป au rang 7766, 50
occurrences ». `u08-l8d` écrit « ปัญหา au rang 3 676, 106 occurrences » et
« เปลี่ยน au rang 1 155, 334 occurrences ». `u03-l3d` écrit « ตัว au rang 859,
453 occurrences ». Sur les huit valeurs fausses, six sont donc contredites par
un fichier du dépôt que 8E déclare avoir relu.

Dégât secondaire, dans le même bloc : « Tous les mots du dialogue sauf trois
sont dans les 2 500 premiers rangs d'une liste de 50 000, ce qui est le
meilleur argument de choix dont dispose ce dossier. Les trois exceptions,
เท่าไร, บาท et แพง ». Il y en a **sept** : เท่าไร, บาท, แพง, เสื้อ (14 674),
เกินไป (7 766), ใหญ่ (4 136) et ปัญหา (3 676). L'argument de naturalité que le
dossier présente comme son meilleur est donc construit sur des chiffres faux.

À corriger en remplaçant les huit paires par les valeurs réelles et en
réécrivant le paragraphe de lecture. Le reste du bloc, empreinte comprise, est
bon.

### F-02 (BLOQUANT) « une bouteille se compte comme un chapeau » : faux, et contredit par les deux autorités du projet

Note culturelle, texte affiché : « Un vêtement à manches se compte comme un
animal à pattes, et **une bouteille se compte comme un chapeau**. » Le dossier
de sources dit explicitement « c'est-à-dire avec ใบ ».

Relevés refaits le 2026-08-04 :

- **VOLUBILIS, ligne ใบ** (celle que la note cite) : « [classif. : feuilles
  (arbres et plantes), objets ronds et creux (chapeaux, coupes, bols,
  cannettes, oeufs, fruits), petits documents (billets, tickets, certificats)] ».
  Les chapeaux y sont, les cannettes aussi, **les bouteilles n'y sont pas**.
- **VOLUBILIS, ligne ขวด** : la base donne à ขวด une ligne de classificateur en
  propre, « [classif. : bouteilles (soda, bière ...)] ». C'est donc la même
  source, à deux lignes de distance, qui donne l'autre réponse.
- **RID, article ใบ** : ลักษณนาม présent, ถ้วย présent, **ขวด absent, หมวก
  absent**.
- **RID, article ขวด** : l'article porte lui-même l'étiquette **ลักษณนาม**.

La seconde jambe invoquée par la note n'en est pas une : elle consiste à dire
que `u04-l4c` publie ขวด et que `u03-l3d` publie ใบ, ce qui n'établit aucun lien
entre les deux et que le dossier reconnaît d'ailleurs comme « interne au
parcours ». Le fait affiché est donc **non sourcé et faux**, dans une note qui
prétend en outre en tirer une « règle de survie ».

Le remède est simple et ne coûte rien à la note : remplacer l'exemple de la
bouteille par un exemple réellement porté par la ligne citée, par exemple le
verre แก้ว, publié par `u04-l4c` item 4, ou le retirer.

### F-03 (BLOQUANT) La note attribue au dictionnaire normatif une liste qu'il n'imprime pas, et le fait des tables et des chaises reste mono-sourcé

Note culturelle : « **Le dictionnaire normatif et la base de référence** rangent
sous ตัว les animaux, **les objets qui ont des pieds comme les tables et les
chaises**, et les vêtements qui ont des manches ou des jambes. »

Sonde de l'article RID de ตัว, refaite le 2026-08-04 : ลักษณนาม **présent**,
สัตว์ **présent**, เสื้อ **présent** avec l'exemple exact เสื้อ ๒ ตัว, **โต๊ะ
absent, เก้าอี้ absent, กางเกง absent**.

Deux conséquences :

1. L'attribution conjointe est fausse. Le RID atteste les animaux et le
   vêtement, pas les objets à pieds.
2. Le fait des tables et des chaises n'a donc **qu'une seule source**, la ligne
   de classificateur de VOLUBILIS. C'est un fait mono-sourcé affiché à l'écran,
   ce que le contrat d'item interdit.

Le fait est probablement vrai, ce n'est pas la question : il est affiché avec
une preuve qu'il n'a pas. Soit une seconde source indépendante est produite,
soit la phrase se réduit à ce que les deux sources disent réellement ensemble,
les animaux et les vêtements.

### F-04 (BLOQUANT) « le seul du parcours à commencer par le son ng » : faux, contredit par la leçon 8A de la même unité

Page 6, texte d'enseignement : « เงิน, l'argent, est le premier mot de 8A et
**le seul du parcours à commencer par le son ng**. »

`u08-l8a` item 2 est **ง่าย**, ngâai, facile, publié dans la même unité, avec
une note qui écrit noir sur blanc : « la seconde initiale ง, et cette fois la
lettre est la PREMIÈRE du mot écrit, ce qui la rend plus facile à repérer que
dans เงิน ».

L'affirmation est donc fausse au moment même où elle est écrite, et elle
contredit un fichier que 8E déclare avoir relu item par item pour reconstruire
son contrat d'entrée. Elle est en outre inutile : la formulation juste existe
déjà ailleurs dans le même fichier, à l'item 5, « le seul mot **du dialogue** à
commencer par le son ng », qui est vraie.

### F-05 (BLOQUANT) เปลี่ยน n'est pas hors du tableau, et 7A n'écarte nulle part les groupes consonantiques

Trois endroits de 8E disent la même chose fausse :

- Méta : « **six restent hors règle** [...] et เปลี่ยน parce que sa marque
  n'est PAS posée sur la consonne initiale » ;
- écartement de la mécanique `reading` : « les six autres tombent dans les cas
  que **7A écarte nommément**, [...] et groupe consonantique pour เปลี่ยน » ;
- page 9, texte affiché : « **Ne cherchez pas à calculer le ton de ce mot avec
  le tableau de 7A, il n'est pas fait pour lui.** » ; repris par le SRS : « le
  ton de เปลี่ยน n'est jamais demandé en DÉDUCTION [...] sa marque n'étant pas
  posée sur la consonne initiale ».

Texte réel de `u07-l7a` page 10, relu dans le dépôt : elle énumère **quatre**
familles, les syllabes mortes (ค่ะ, ล่ะ), les formes déjà écartées par 4A (ไ,
ใ, เ◌า, ◌ำ), les mots à consonne de tête « où un ห ou un อ muet change la
donne » (หน่อย, ไหว้, อยู่, อร่อย), et les deux marques non encore vues.
**Les groupes consonantiques n'y figurent pas**, et ปล n'est pas une consonne
de tête : il n'y a aucune lettre muette.

Surtout, le ton de เปลี่ยน **est** régulier et **est** calculable avec le
tableau, à condition de savoir quelle lettre commande. C'est exactement ce que
`u08-l8a` enseigne, dans la même unité, à sa page 13 et à son item 7 : « ป est
moyenne, ล est basse, la syllabe se ferme sur น donc elle est vivante, et un
ไม้เอก donne le ton bas sur une moyenne mais le ton descendant sur une basse.
Le ton relevé est BAS : c'est donc ป, la première lettre du groupe, qui a
commandé. » 8E dit donc à l'apprenant de ne pas appliquer une règle que la
leçon d'ouverture de la même unité vient de lui faire démontrer sur ce mot
précis.

Le même défaut a déjà été relevé dans `verification-8d.md` (finding F-08),
avec la même analyse. Le voir reparaître dans 8E confirme que la formulation
circule d'un fichier à l'autre et qu'il faut la corriger partout.

La décision de ne pas faire calculer ce ton dans un bilan reste défendable.
C'est sa justification qui est fausse, et elle abîme la frontière du tableau
que 7A a construite et que 8A complète.

### F-06 (non bloquant) « RID ne figure PAS au domaine de ปัญหา » : l'exemplaire présent dit le contraire

Dossier de production, réserve sur l'indépendance des sources : « `RID` ne
figure PAS au domaine de เสื้อ [...], de ปัญหา ligne 66110, de เปลี่ยน [...] ».

Sur l'exemplaire `VOLUBILIS.ods` présent sur la machine, la ligne ปัญหา porte
en domaine **`ECONO ; EDUC ; RID`**. Les autres lignes de la même énumération
sont, elles, correctement classées : เสื้อ (`TEXTILE`), เงิน, เปลี่ยน (aucun
domaine), ตัว (`CLASS`), แพงเกินไป (`COMM`), ใหญ่เกินไป et มีปัญหา (aucun).

Conséquence limitée mais réelle : pour le SENS de ปัญหา, la jambe VOLUBILIS
n'est pas indépendante du RID, contrairement à ce que le dossier affirme.
L'item garde une troisième jambe (Wiktionary), donc le fait reste doublement
sourcé, mais la phrase du dossier doit être corrigée. À revérifier sur
l'exemplaire `.xlsx` si celui-ci est retrouvé, voir F-07.

### F-07 (non bloquant) L'exemplaire VOLUBILIS cité est introuvable et son URL de téléchargement renvoie 404

8E cite `VOLUBILIS_Database.xlsx`, 10 848 409 octets, sha256 `b9ab7418...`,
114 579 lignes, et fonde sur lui **tous** ses numéros de ligne.

Constats du 2026-08-04 : ce fichier n'est présent nulle part sur la machine ;
seul `VOLUBILIS.ods`, 15 724 718 octets, sha256 `bb9c5da5...`, existe, et c'est
l'exemplaire que citent les unités 3 à 7 et `u08-l8a`. L'URL documentée en tête
de `scripts/verification/volubilis-lookup.mjs`,
`https://master.dl.sourceforge.net/project/belisan-volubilis/VOLUBILIS_Database.xlsx?viasf=1`,
**répond 404**, et les deux autres formes d'URL SourceForge essayées ne
renvoient rien d'exploitable.

Aucun fait linguistique de 8E n'en dépend, puisque j'ai pu retrouver les
quinze entrées par la graphie sur l'exemplaire `.ods` et confirmer quatorze
citations sur quinze au mot près. Mais l'amendement v1.2 exige qu'un tiers
puisse **refaire la consultation à l'identique**, et un numéro de ligne
invérifiable ne satisfait pas cette exigence. Le dossier déclare déjà le point
à son incertitude 5 ; il faut maintenant le trancher, et la note en tête de
`scripts/verification/volubilis-codes.mjs`, écrite après ce fichier, montre que
la coexistence des deux exemplaires a déjà produit une citation fausse dans
`u08-l8c`.

### F-08 (non bloquant) Cinq comptages faux, dont deux dans du texte affiché

Le fichier revendique des mesures recomputables. Cinq ne le sont pas :

1. **« à quatre syllabes d'intervalle »** entre le /ŋ/ final de แพง et le /ŋ/
   initial de เงิน dans la réplique 5. Recompté : แพง est la syllabe 1, เงิน la
   syllabe 7, cinq syllabes les séparent. L'erreur est écrite trois fois, en
   Méta, à l'item 7, et **dans un feedback affiché à l'apprenant** de
   l'exercice 4 (« à quatre syllabes d'écart »).
2. **« à quatre répliques d'intervalle »** pour หา et ปัญหา, item 2. L'item 9
   écrit « six répliques d'intervalle » pour la même paire, et c'est six qui
   est juste (répliques 1 et 7). Les deux items se contredisent.
3. **« Deux de ces neuf ferment une question »** pour les ครับ du client, suivi
   immédiatement de « ตัวนี้เท่าไรครับ étant la seule question qu'il pose ». Il
   n'y en a qu'un.
4. **« douze pour la plus longue réplique de `u07-l7e` »**, incertitude 8. Le
   tableau de recomptage de `u07-l7e` donne 14 syllabes à sa réplique 3, et 11
   à sa réplique 1.
5. Conséquence des points 1 et 2 : la note de l'item 2 (« C'est un hasard de
   vocabulaire, pas une parenté ») reste juste, mais son chiffre ne l'est pas.

Aucun de ces cinq points ne change un fait linguistique. Les deux premiers
apparaissent toutefois dans du texte destiné à l'écran.

### F-09 (non bloquant) L'objectif observable annonce une mesure que l'exercice 4 ne fait pas

Objectif observable : « il identifie à l'écoute **laquelle des trois voyelles
glissées de l'unité, `ia`, `uea` ou `oua`**, il vient d'entendre [...] 5 fois
sur 6 ».

L'exercice 4 et la carte `srs-u08-l8e-08` proposent quatre options, dont la
quatrième est « la voyelle glissée `uea` **ou** `oua` ». Les tirages 5 (เสื้อ)
et 6 (ตัว) ont donc la même bonne réponse, et un apprenant qui confond
exactement ces deux voyelles, confusion que le fichier liste lui-même comme le
piège principal, obtient 6 sur 6. L'objectif annoncé n'est mesuré par aucun
instrument de la leçon.

Deux issues possibles : soit l'objectif est réécrit sur ce que la leçon mesure
réellement (distinguer `ia` du couple `uea`/`oua`, et repérer la position du
ng), soit l'exercice sépare les deux options, ce qui suppose d'accepter un
plancher de réussite plus bas.

### F-10 (non bloquant) Exercice 1 : les six bonnes réponses sont en position 1, la garantie anti-réponse-constante repose entièrement sur un tirage aléatoire non implémenté

Le fichier écrit : « les six tirages portent sur six contenus différents,
aucune option n'est correcte deux fois, et l'ordre des options est retiré au
hasard à chaque affichage. La meilleure stratégie constante [...] a une
espérance de 2 sur 6 ».

Le raisonnement est juste **si et seulement si** le mélange est fait. Or les
six tirages sont écrits avec la bonne réponse en **position 1** dans les six
cas. Si la compilation rend les options dans l'ordre de l'autorat, l'exercice
est réussi 6 sur 6 en répondant toujours « 1 », sans rien écouter.

L'exercice 4, lui, déclare explicitement « ordre aléatoire » et répartit ses
bonnes réponses sur quatre valeurs : il est robuste par construction. Il faut
soit alterner les positions dans l'autorat de l'exercice 1, soit faire du
mélange une contrainte de compilation vérifiée par un test, et non une phrase
de dossier.

### F-11 (non bloquant) Une affirmation sur le français hors des deux voies de la section 1 bis

Pièges connus de l'exercice 4 : « ne pas entendre le ng initial du tout, **un
francophone n'attaquant pas ordinairement une syllabe sur ce son** ».

La section 1 bis n'admet qu'une affirmation sourcée par deux sources
indépendantes, ou une reformulation en observation vérifiable par l'apprenant.
Celle-ci n'est ni l'une ni l'autre. L'adverbe « ordinairement » évite le
« jamais » proscrit, ce qui la rend moins grave que les cas retirés des unités
5 et 6, mais elle reste une affirmation de phonotactique française sans appui.

Le reste du fichier est exemplaire sur ce point : la page 4 (« vous êtes
locuteur natif du français, vous tranchez mieux que nous »), la page 3
(« écoutez où part votre langue ») et la page 6 (« Vérifiez le calcul
vous-même ») appliquent exactement la seconde voie. Il suffit d'aligner cette
phrase-là.

### F-12 (non bloquant) Trois défauts de conformité rédactionnelle

1. **Champ `longueur` hors contrat.** Le contrat d'item n'admet que « courte »
   et « longue ». Huit syllabes sont déclarées « **brève** » (items 9, 10, 14,
   15, 17, 18). Le sens est clair pour un humain, pas pour la compilation, qui
   devra typer ce champ.
2. **Feedback numéral trompeur**, exercice 1 tirage 3 : « Celle qui vient en
   premier multiplie, celle qui suit ajoute. » La règle marche pour เก้าสิบ
   (9 multiplie 10) mais pas pour สิบเก้า, où สิบ vient en premier et ne
   multiplie rien. Le feedback du tirage 3 de l'exercice 3, « pàeet·sìp vaut
   quatre-vingts ; dans l'autre sens, vous avez écrit dix-huit », est juste et
   peut servir de modèle.
3. **Faute de français** dans une note d'autorat, item 12 : « on **ne apprend**
   pas de formule spéciale ».

## 3. Points de méfiance levés, à ne pas rouvrir

- **`kâao` pour เก้า contre `thâo` pour เท่า** : ce n'est pas une incohérence.
  Wiktionary donne la forme phonémique ก้าว et l'IPA /kaːw˥˩/ pour เก้า, et
  `u03-l3b` publie l'item avec cette longueur, cette IPA et cette
  transcription, en documentant l'extension `aao`. 8E reprend sans rouvrir.
- **Transcription** : les 27 mots du dialogue ont été retranscrits depuis les
  règles v1.1 avant comparaison. Tous conformes, y compris `aee` pour /ɛː/,
  `oee` pour /ɤː/, `ouu`, `aww`, `oua`, `uea`, `ia`, et la marque de ton sur la
  première lettre du noyau.
- **Contrôles négatifs RID** : les sept cités et trois sondages
  supplémentaires de la liste des absences sont réels. Le dossier ne cache
  aucune absence gênante.
- **Citation de Wiktionary sur ตัว** : le fichier écrit que la page ne nomme
  pas les vêtements et que le fait vient de la page เสื้อ. Vérifié, c'est
  exact, et c'est une honnêteté de citation qu'il faut relever.
- **Deux valeurs de มี dans le même dialogue** : posséder à la réplique 5, il y
  a à la réplique 7. Les deux sont publiées (`u06-l6b` item 7, `u06-l6d`
  item 1) et la ligne VOLUBILIS de มีปัญหา porte bien les deux formulations.
  Le dossier signale le point de lui-même.
- **Absence des deux marques nouvelles** : réelle, mesurée, et honnêtement
  présentée comme la raison d'écarter la mécanique `reading` plutôt que comme
  un choix.

## 4. Réserves mineures, sans finding

- L'exercice 4 nomme le mot et sa traduction à chaque tirage (« Audio เงิน
  (ngoen, l'argent) »). Si cette étiquette est affichée avant la réponse, une
  partie des tirages devient un exercice de mémoire lexicale et non d'écoute.
  À trancher à la compilation.
- L'item 1 glose ตัวนี้ par « celui-ci » alors que le dialogue le traduit
  partout par « celle-ci », l'article étant une chemise. Sans conséquence,
  mais à uniformiser.
- La réplique 2, ตัวนี้ไหมคะ, attache ไหม à un groupe nominal sans prédicat.
  Le fichier le signale déjà à l'audit de naturalité, ce qui est la bonne
  conduite ; le point mérite d'être en tête de ce lot.

## 5. Verdict

Le dossier de sources de ce fichier est, sur le fond, l'un des plus solides de
l'unité : trente relevés RID, quatorze lignes VOLUBILIS et dix pages Wiktionary
refaits ici concordent au mot près avec ce qu'il affirme, les 21 séquences de
points de code sont exactes, les 67 syllabes et leurs tons se recomptent
exactement, et quarante renvois internes sur quarante-deux sont justes.

Il ne peut pas passer en `review` en l'état pour cinq raisons, dont trois
touchent du texte affiché à l'apprenant : huit chiffres de fréquence faux dont
la conclusion dépend (F-01), un fait de classificateur faux et contredit par
les deux autorités du projet (F-02), une attribution de source fausse doublée
d'un fait mono-sourcé (F-03), une affirmation fausse sur le parcours (F-04) et
une règle d'écriture présentée comme inapplicable alors que la leçon
d'ouverture de la même unité vient de l'appliquer à ce mot (F-05).

Aucun de ces cinq points ne demande de refaire le fichier : quatre sont des
corrections de texte et de chiffres, le cinquième demande de reprendre une
formulation qui circule aussi dans 8D.
