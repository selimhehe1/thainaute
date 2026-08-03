# Vérification adversariale de `unite-06/lecon-6d.md`

- Date : 2026-08-03
- Auditeur : agent adversarial indépendant (Claude Opus 5)
- Consigne : trouver des erreurs, ne rien croire sur parole, réinterroger les
  sources citées, interroger le RID directement.
- Cadre appliqué : `content/authoring/CONVENTIONS.md` (amendements v1.1 et v1.2,
  arbitrage v1.2) et `docs/content-policy/sources-verification.md` (section 1
  bis).
- Verdict : **5 findings bloquants, 7 non bloquants. 156 faits vérifiés par
  moi-même.** Le statut `draft` doit être maintenu.

## 0. Préambule sur la consigne reçue

La mission demandait de contrôler « la règle de ton de la classe basse énoncée
en 6A ». Au moment où j'ai commencé, `unite-06/lecon-6a.md` n'existait pas ; le
fichier est apparu pendant la session (horodatage 21:28, contre 21:20 pour 6D).
Je l'ai donc audité en fin de course, et **c'est de là que sort le finding le
plus lourd** : la règle de 6A est juste, mais 6D dit le contraire de ce qu'elle
établit. Voir B1.

## 1. Méthode de re-vérification

Rien n'a été repris des champs `sources` de la leçon. Chaque source a été
réinterrogée à la source, avec la méthode que l'amendement v1.2 rend exigible
(référence reproductible plutôt qu'URL par entrée).

- **RID 2554** : 17 requêtes POST distinctes sur
  `dictionary.orst.go.th/func_lookup.php`, paramètres
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l'audit,
  requêtes espacées d'au moins 1,3 seconde. Aucune définition n'est reproduite
  ci-dessous ; seuls sont consignés la présence, le nombre de vedettes, la
  classe grammaticale, la concordance du sens et la présence d'un exemple.
- **Wiktionary** : 17 pages tirées en rendu (`action=render`), éditions en et
  th traitées comme un seul écosystème.
- **Unicode 17.0** : `IndicPositionalCategory.txt` et `UnicodeData.txt` de la
  base de caractères, téléchargés depuis `unicode.org/Public/17.0.0/ucd/`.
- **VOLUBILIS** : `VOLUBILIS.ods` retéléchargé depuis le projet SourceForge
  `belisan`, empreintes recalculées, `content.xml` reparcouru en flux avec un
  parseur expat, expansion explicite de `table:number-columns-repeated` et
  `table:number-rows-repeated`, numérotation remise à 1 par `table:table`,
  lignes non vides comptées après retrait des cellules finales vides. C'est la
  méthode que le dossier de 6D décrit ; je l'ai réimplémentée de zéro plutôt que
  de reprendre un script existant.
- **FrequencyWords** : `content/2018/th/th_50k.txt` retéléchargé, empreinte
  recalculée, rangs recalculés.
- **Tons** : redérivés à la main depuis classe de la consonne initiale, nature
  de la syllabe et marque, sans regarder les champs `ton` avant.

## 2. Décompte des faits confirmés par moi-même : 156

| Famille                                                                                                       | Confirmés |
| ------------------------------------------------------------------------------------------------------------- | --------- |
| RID 2554, entrées présentes et leur contenu structurel                                                        | 11        |
| RID 2554, absences déclarées                                                                                  | 6         |
| Wiktionary, couples titre-langue                                                                              | 16        |
| Wiktionary, `Appendix:Thai script`                                                                            | 1         |
| Unicode 17.0 (date du fichier, ligne `0E40..0E44`, catégories, ccc)                                           | 7         |
| VOLUBILIS (2 empreintes, 3 décomptes, 6 lignes `Codes`, 6 lignes `Romanization`, 30 lignes de données citées) | 47        |
| FrequencyWords (empreinte, 14 rangs, 3 absences)                                                              | 18        |
| Séquences de code et stabilité NFC des graphies                                                               | 13        |
| Tons redérivés indépendamment                                                                                 | 13        |
| Renvois internes au dépôt (leçons et numéros d'items cités)                                                   | 14        |
| Règle de 6A et ses neuf exemples de la page 10                                                                | 10        |
| **Total**                                                                                                     | **156**   |

### 2.1 RID, relevé du 2026-08-03

Toutes les affirmations de 6D sur le RID sont exactes, y compris les plus
vérifiables :

- `มี` : vedette unique, un bloc `ว.` et un bloc `ก.`. Le bloc verbal porte bien
  `มีเงิน` et `มีลูก` pour la possession et `มีคนอยู่ไหม` pour l'existence ; le
  bloc `ว.` porte bien `ในหม้อมีข้าว` et `ในห้องน้ำมีคน`. Conforme.
- `ไม่` : vedette unique, `ว.`, décrite comme niant le sens du mot qui suit, avec
  `ไม่กิน` et `ไม่ดี`. Sa liste `ลูกคำ` contient bien `ไม่มีเงาหัว`,
  `ไม่มีปี่มีกลอง` et `ไม่มีวันเสียละ`. Conforme. **Mais l'entrée dit aussi autre
  chose : voir B5.**
- `คน` : deux vedettes, `คน ๑` nominale et `คน ๒` verbale. Conforme.
- `กี่` : deux vedettes, `กี่ ๑` nominale (métier à tisser, plus un second sens
  nominal) et `กี่ ๒` classée `ว.`, glosée `เท่าไร`, décrite comme se plaçant
  devant un autre mot, avec `กี่วัน` et `กี่บาท`. Conforme au mot près.
- `ลักษณนาม` : premier exemple `คน ๓ คน`, deuxième `แมว ๒ ตัว`. Conforme.
- `พี่น้อง` : vedette unique, deux sens nominaux, `แม่คำ` = `พี่`. Conforme, et la
  réserve de portée de la page 7 est bien fondée sur le second sens.
- `ครอบครัว` : vedette unique, `น.`, lecture entre crochets `[คฺรอบคฺรัว]`.
  Conforme.
- `สอง`, `สี่` : premiers sens numéraux concordants. `ผม` : deux vedettes.
  Conforme.
- Les six absences déclarées (`ไม่มี`, `มีกี่คน`, `มีคน`, `มีลูก`, `คนเดียว`,
  `ครอบครัวเดียว`) sont réellement absentes. Le décompte « 20 graphies, 14
  attestées, 6 absentes » est arithmétiquement cohérent avec les listes du
  dossier.

### 2.2 Wiktionary

Aucune référence inventée. Toutes les IPA, romanisations Paiboon, romanisations
Royal Institute, notes d'emploi et étymologies citées existent et disent ce
qu'on leur fait dire :

- `มี` /miː˧/, `ไม่` /maj˥˩/, `ไม่มี` /maj˥˩.miː˧/, `คน` /kʰon˧/, `กี่` /kiː˨˩/,
  `พี่น้อง` /pʰiː˥˩.nɔːŋ˦˥/, `ครอบครัว` /kʰrɔːp̚˥˩.kʰrua̯˧/, `สอง` /sɔːŋ˩˩˦/,
  `สี่` /siː˨˩/.
- `th.wiktionary` n'a effectivement PAS de page `ไม่มี` : HTTP 404 confirmé.
- La note d'emploi anglaise de `กี่`, « followed by classifier or common noun »
  avec l'exemple `กี่บาท`, existe telle quelle ; la note thaïe
  `ใช้ขึ้นต้นคำลักษณนามหรือคำนามที่ไม่ทราบปริมาณ` aussi.
- `th.wiktionary` porte bien `คำลักษณนาม คน` sur la section `คำนาม` de `พี่น้อง` :
  le classificateur de l'item 8 vient donc réellement de la source.
- Les deux citations d'`en.wiktionary` dans l'entrée `มี` existent : `มี บุตร ธิดา
หลาย คน` (1917) et `มี ข้าหลวง พิเศษ ประจำการ ๓ นาย` (1896). **Leur portée
  probatoire est en revanche surévaluée : voir B4.**
- `Appendix:Thai script` existe, et sa ligne 26 est bien `บ`, `Royal Thai`
  initiale `b`, finale `p`. Citation exacte.

### 2.3 Unicode 17.0

- `IndicPositionalCategory-17.0.0.txt` porte bien la date `2025-07-29` en
  en-tête.
- La ligne `0E40..0E44 ; Visual_Order_Left # Lo [5] THAI CHARACTER SARA E..THAI
CHARACTER SARA AI MAIMALAI` existe telle que citée.
- `U+0E31`, `U+0E35`, `U+0E48`, `U+0E49` sont bien `Mn` / `Top` ; `U+0E44` est
  bien `Lo`. Les noms normatifs du tableau de 6D sont exacts. `U+0E3A` est bien
  `THAI CHARACTER PHINTHU`.
- `U+0E48` et `U+0E49` ont bien `ccc = 107`. **Mais l'usage qui en est fait est
  faux : voir N7.**

### 2.4 VOLUBILIS

Vérification la plus lourde, et la plus concluante en faveur du dossier.

- Archive retéléchargée : **15 724 718 octets**, SHA-256
  `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`. Identique
  au dossier.
- `content.xml` : **379 601 910 octets**, SHA-256
  `3072e4d3751371c01e385fd00a00c9699b21b881d7a113b94a9148057cfab0e7`. Identique.
- Décompte reproduit avec mon propre parseur : `Volubilis` **118 571**, `Codes`
  **227**, `Romanization` **86**. Identique aux trois nombres annoncés.
- Feuille `Codes`, ligne 215 `TONES`, puis 216 `-x normal`, 217 `¯x high`,
  218 `_x low`, 219 `/x rising`, 220 `\x falling`. Exact.
- Feuille `Romanization` : ligne 20 (`บ` = `b` initiale, `p` finale, exemple
  `กาบ`), 44 (`อิ` = `i`), 45 (`อี` = `ī`), 56 (`โอะ ลดรูป`, « o caché », exemple
  `ลม`), 58 (`เอาะ` = `o`), 59 (`ออ` = `ø`). Exact.
- Les trente lignes de données citées par 6D sont toutes à la bonne place, avec
  les bonnes colonnes : 57398, 57399, 57400, 53694, 53695, 53696, 54126, 54246,
  54247, 54248, 54400, 36807, 36808, 36811, 36812, 39517, 39518, 42318, 42381,
  57687, 57908, 58016, 58034, 64376, 66380, 73507, 73770, 75293, 94960, 97075, 97139. Les gloses françaises citées sont exactes, y compris les longues
  (`พี่น้อง` ligne 73770, `ครอบครัว` ligne 39517).
- Le relevé `DOM` est exact dans les deux sens : `RID` figure pour `มี` (57398),
  `ครอบครัว` (39517), `พี่น้อง` (73770) et `กี่` (42318), et ne figure pas pour
  `ไม่มี` (54246), `ไม่` (53694), `คน` (36807), `สอง` (97075), `สี่` (94960).
- L'incertitude 3 est fondée : la ligne 16813 écrit bien `\hǿng¯nām`, et la
  feuille `Romanization` ne documente nulle part `ǿ`.

### 2.5 FrequencyWords

- `th_50k.txt` retéléchargé : **1 504 712 octets**, SHA-256
  `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`. Identique.
- Rangs recalculés, tous exacts : `ไม่` 3 (52 948), `ครับ` 10, `ผม` 69, `คน` 88
  (3 776), `ไม่มี` 185 (1 918), `สอง` 273, `มี` 276 (1 348), `สี่` 994,
  `ครอบครัว` 1193 (322), `พี่น้อง` 3104 (127), `สองคน` 5320 (73), `กี่คน` 12572
  (31), `มีกี่คน` 18240 (21), `สี่คน` 28813. Absents confirmés : `กี่` isolé,
  `มีพี่น้อง`, `ไม่มีพี่น้อง`.

### 2.6 Encodage et tons

- Les 13 graphies de la leçon, dialogue compris, ont la séquence de code
  déclarée, au caractère près, et `NFC(graphie) == graphie` pour chacune.
- Le fichier entier est en NFC et **ne contient aucun tiret cadratin ni
  demi-cadratin**.
- Tons redérivés indépendamment : `มี` moyen, `ไม่` descendant, `คน` moyen, `กี่`
  bas, `พี่` descendant, `น้อง` haut, `ครอบ` descendant, `ครัว` moyen, `สอง`
  montant, `สี่` bas, `ไหม` montant, `ค่ะ` descendant, `คะ` haut. Tous
  concordent avec les champs `ton` de la leçon, et avec les lettres tonales de
  Wiktionary et les marqueurs VOLUBILIS. **Aucun ton faux dans cette leçon.**
- Transcriptions conformes à v1.1 et à l'arbitrage v1.2 : marque de ton sur la
  première lettre du noyau (`sǎwwng`, `náwwng`, `khrâwwp`, `phîi`, `kìi`),
  doublement de la dernière lettre du graphème pour la longueur. **Sauf trois
  occurrences : voir B2.**

### 2.7 Renvois internes au dépôt

Tous vérifiés dans les fichiers cités : `u02-l2c` item 3 = `ไม่เป็นไร` ;
`u02-l2e` item 10 = `ไหม`, enseigné en 2B ; `u03-l3b` item 1.2 = `สอง` et item
1.4 = `สี่` ; `u03-l3d` item 1 = `คน`, item 6 = `ปลาสองตัว`, item 8 = `กี่คน` ;
`u04-l4d` item 1 = `ไม่`, item 3 = `ไม่เผ็ด` ; `u05-l5a` page 11 dit bien ce
qu'on lui fait dire et sa liste des neuf basses est bien `ค ง ช ซ ท น พ ฟ ม` ;
`u05-l5c` transcrit bien `ห้อง` en `hâwng`, donc brève ; `u05-l5d` item 7 =
`ผมไปตลาดครับ` ; `u05-l5e` recartonne bien `ไม่` ; `1B` installe bien le
doublement de la dernière lettre ; `3B` porte bien `ห้า` descendant et `ร้อย`
haut.

## 3. Findings bloquants

### B1. La leçon nie la règle de ton que 6A enseigne dans la même unité

**Où** : `Méta` (prérequis `u05-l5a`), item 1 `note_fr`, item 4 `note_fr`,
section `SRS` (« hors périmètre »), page 9.

**Ce qui est écrit** : « la règle de ton de 4A ne prédit rien ici : le ton est
donné, pas calculé » (item 1) ; « l'avertissement de sa page 11, la règle de ton
de 4A ne couvre pas la classe basse » (prérequis) ; « aucune carte ne demande le
ton d'un mot à consonne initiale basse » (SRS).

**Ce que dit 6A**, page 9 et champ « Règle enseignée » du `Méta` :

> consonne MOYENNE → ton MOYEN
> consonne HAUTE → ton MONTANT
> consonne BASSE → ton MOYEN

**J'ai vérifié cette règle et elle est juste.** Syllabe vivante, sans marque de
ton : initiale de classe basse donne bien le ton moyen. Les neuf exemples de la
page 10 de 6A (`ยา`, `คา`, `พา`, `ทา`, `แพง`, `ทาน`, `คน`, `มา`, `เรือ`) sont
tous corrects, et ses deux limites déclarées (marque de ton, syllabe morte) le
sont aussi. La règle de 6A n'est donc pas en cause.

**Le problème est dans 6D.** `มี` est exactement le cas d'école de cette règle :
`ม` basse, voyelle longue sans consonne finale donc syllabe vivante, aucune
marque. Son ton moyen est **calculé**, pas donné. Idem pour `คน`, que 6A prend
comme item 7 et commente ainsi : « `ค` est basse, la voyelle est brève mais la
syllabe est vivante puisqu'elle se ferme sur `น`, et aucune marque n'est posée :
ton moyen. » 6D dit le contraire du même mot, dans la même unité, deux leçons
plus loin.

Trois conséquences en cascade, toutes à corriger ensemble :

1. le `Méta` de 6D ne cite **aucun** prérequis de l'unité 6, alors que 6A y
   introduit la règle qui gouverne le ton de trois de ses huit items ;
2. l'argument « le ton est donné, pas calculé » doit devenir « le ton se calcule
   depuis 6A » ;
3. l'exclusion SRS « aucune carte ne demande le ton d'un mot à consonne initiale
   basse » repose sur une prémisse périmée et prive la leçon d'une révision
   gratuite et utile.

Bloquant : règle fausse au point où la leçon est jouée.

### B2. Variante acceptée `naawng`, qui n'est pas une transcription Thaïnaute

**Où** : exercice 3, tirages 1, 2 et 6.

**Ce qui est écrit** : `mii phii naawng sawwng khon`, `mai mii phii naawng`,
`mii phii naawng sii khon`.

**Ce qui est juste** : `náwwng` privé de sa marque de ton donne `nawwng`, pas
`naawng`. La v1.1 §2 double la **dernière** lettre du graphème (`aw` → `aww`), et
1B installe la même règle (« une voyelle longue s'écrit avec sa dernière lettre
doublée »). `naawng` doublerait la première lettre et ne correspond à aucun
graphème de la convention.

La leçon se contredit elle-même dans le même exercice : le dernier piège connu
dit « écrire `sawng` au lieu de `sǎwwng`, la règle de doublement valant aussi
pour le graphème `aww` ». L'exercice exige donc `aww` d'un côté et accepte
`aawng` de l'autre. Un apprenant qui écrit `naawng` est validé, alors que la
graphie est fausse, et le tirage 1 ajoute « et toute combinaison sans signes de
ton », ce qui étend la faute.

Bloquant : corrigé faux, sur trois tirages sur six.

### B3. Page 9 fait passer une voyelle pour une marque de ton

**Où** : page 9, premier paragraphe.

**Ce qui est écrit** : « Les petits signes posés au-dessus de พี่ et de ไม่
règlent le ton et arrivent à l'unité 7. »

**Ce qui est faux** : au-dessus de `พี่` il y a deux signes, `ี` (U+0E35, SARA
II) et `่` (U+0E48, MAI EK). Le premier est une **voyelle**, pas une marque de
ton, et elle est enseignée depuis 2A, dont le bloc d'écriture est « les six
voyelles longues simples écrites -า, -ี, -ู, -อ… ». La phrase apprend donc à
l'apprenant que le signe qu'il lit depuis quatre unités règle le ton.

Le dossier du même fichier fait pourtant la distinction correctement : « les
signes de พี่, de น้อง et de ไม่ sont des marques non espaçantes posées
au-dessus, et **deux d'entre elles**, U+0E48 et U+0E49, sont les marques de
ton ». C'est la page écran, pas le dossier, qui est fausse.

Aggravant : `มี` porte le même `ี` et la leçon n'en dit rien, ce qui rend la
distinction impossible à reconstruire pour l'apprenant.

Bloquant : fait d'écriture faux, affiché.

### B4. Le patron central de la leçon n'a qu'une seule source

**Où** : `Dossier de production`, « Fait C », et item 8, champ `sources`.

**Ce qui est annoncé** : « **Fait C, le groupe compté peut suivre มี dans son
entier.** Deux jambes indépendantes. »

**Ce que j'ai trouvé dans les deux jambes** :

- VOLUBILIS ligne 58016 `มีสี่กร` (« avoir quatre bras ») et ligne 58034
  `มีสองสี` (« bicolore ») : lignes réelles, gloses exactes, mais elles portent
  `มี` + **nombre** + unité. **Il n'y a pas de nom entre `มี` et le nombre.**
  Elles attestent le cas sans nom, celui de `มีสี่คน`, pas celui de
  `มีพี่น้องสองคน`.
- `en.wiktionary`, entrée `มี` : les deux citations existent, et la seconde
  (`มี ข้าหลวง พิเศษ ประจำการ ๓ นาย`) porte bien nom, puis nombre chiffré, puis
  classificateur de personnes.

Autrement dit, la forme réellement enseignée, `มี` + nom + nombre +
classificateur, qui est l'item 8, l'instance de la page 5, le but des tirages 1,
2, 5 et 6 de l'exercice 2 et la carte `srs-u06-l6d-03`, **repose sur un seul
écosystème de sources**. Le dossier le présente comme doublement attesté, ce qui
n'est pas le cas. La reconstruction par composition des faits A et B est
légitime comme raisonnement, mais elle doit être annoncée comme telle, et non
comme une seconde attestation.

Bloquant : fait mono-sourcé présenté comme double, sur le point central de la
leçon.

### B5. « ไม่ … jamais après » est un absolu que le RID contredit

**Où** : exercice 2, feedback « ไม่ mal placé ». Et, par omission, item 2, champ
`sources`.

**Ce qui est écrit à l'écran** : « ไม่ nie le mot qui le suit, donc il se met
devant lui, **jamais après**. »

**Ce que dit l'entrée `ไม่` du RID**, que la leçon désigne elle-même comme
autorité n° 1 et que j'ai réinterrogée en direct : après la partie citée par la
leçon, l'entrée poursuit en décrivant le cas où `ไม่` **est en fin**, à condition
que `หา` le précède, et donne un exemple de cette forme. La synthèse de source de
l'item 2 s'arrête juste avant cette clause.

L'usage est littéraire et n'a pas sa place en A1 ; ce n'est pas le sujet. Le
problème est qu'un absolu (« jamais ») est affirmé à l'écran alors que la source
citée dans le même fichier dit le contraire, et que la citation de cette source
est tronquée exactement là où elle gênait. Il suffit de porter l'énoncé sur ce
que l'apprenant produit (« dans tout ce que vous direz, `ไม่` passe devant ») et
de compléter la synthèse de l'item 2.

Bloquant : absolu faux à l'écran, et source citée partiellement.

## 4. Findings non bloquants

### N6. L'incertitude 1 sous-estime gravement la collision d'unité

L'incertitude 1 annonce que seuls les items 6 et 7 (`พี่น้อง`, `ครอบครัว`) sont
susceptibles de partir vers 6B, « sans qu'aucun autre élément de la leçon ne
change, la structure du jour ne dépendant d'aucun mot particulier ».

Les autres leçons de l'unité existent maintenant, et disent autre chose :

- **6B**, objectif observable n° 3 : « reconstruit le bloc `[qui] + มี + [qui] +
[nombre] + คน + [particule]` ». Son item 7 est `มี` et son item 8 est
  `ผมมีพี่ชายสองคนครับ`. C'est le verbe du jour de 6D et sa structure du jour.
- **6E** reprend `มี` (item 3) et `พี่น้อง` (item 4) en « réemploi attendu de
  l'unité 6, à confirmer », et son item 7 `น้องสาวสองคน` rejoue le groupe compté.
- **6A** reprend `คน` (item 7) comme exemple de sa règle de ton.

Ce n'est donc pas « aucun autre élément » qui bouge : c'est l'item 1, l'item 8 et
la carte `srs-u06-l6d-03`. La consolidation doit trancher qui enseigne `มี` et le
patron, pas seulement qui enseigne deux mots de vocabulaire.

### N7. L'explication de la stabilité NFC est fausse

Dossier, section « Séquence Unicode » : « Elles portent toutes deux la classe
combinatoire canonique 107, ce qui explique que l'ordre `ี` puis `่` de พี่ soit
stable en NFC. »

`U+0E48` et `U+0E49` ont bien `ccc = 107`, je l'ai vérifié dans
`UnicodeData.txt`. Mais ce n'est pas ce qui rend la paire stable : `U+0E35` a
`ccc = 0`, et l'ordonnancement canonique ne réordonne jamais au travers d'un
caractère de classe 0. La cause énoncée n'est pas la bonne cause. La conclusion,
elle, est juste, et le test `NFC(graphie) == graphie` la démontre déjà tout seul.

### N8. Assertion d'usage non sourcée à l'écran, page 6

« C'est la question qu'on vous posera devant une photo de famille, et c'est aussi
celle qu'on vous posera à l'entrée d'un restaurant » (page 6, reprise dans
l'item 5). Aucune source ne porte cette affirmation d'usage, et le dossier
reconnaît lui-même que `มีกี่คน` n'est lexicalisé ni par le RID ni par VOLUBILIS
(incertitude 5) et que l'audit naturalité n'est pas fait. La leçon a par ailleurs
retiré `มีพี่น้องกี่คน` faute de source : la même exigence doit s'appliquer ici.
À reformuler en observation prudente ou à sourcer.

### N9. Le tirage 6 de l'exercice 2 n'est pas dans « l'ordre français »

« cartes déjà posées dans l'ordre français (สอง, พี่น้อง, มี, คน) ». Le calque
français de « j'ai deux frères et sœurs » place le verbe en tête : `มี สอง
พี่น้อง`. L'ordre proposé met `มี` en troisième position, ce qui n'est ni du
français ni du thaï. Le tirage ne mesure donc pas le calque annoncé, et le
feedback « C'est l'ordre du français, pas celui du thaï » devient faux quand il
se déclenche sur ce tirage.

### N10. Deux incohérences internes dans l'exercice 1

- « Ce qu'il mesure » affirme que les options « ne diffèrent que par l'une des
  deux », alors qu'aux tirages 1 à 3 l'option `ไม่มีพี่น้อง` diffère par la
  polarité **et** par l'absence de nombre.
- Le piège de longueur se conclut par « d'où l'intérêt des tirages 4 à 6, où la
  négative est le bloc le plus court de tous ». Cela renforce le raccourci au
  lieu de le neutraliser : pour le casser, il faudrait un tirage où la réponse
  négative n'est pas la plus courte.

### N11. Le feedback de longueur oublie la voyelle la plus exposée

« `mii`, `kìi`, `sìi`, `phîi` et `sǎwwng` portent tous une voyelle longue. »
`náwwng` manque, alors qu'il est long et présent dans trois des six tirages.
C'est précisément la voyelle que B2 laisse mal orthographier : le seul feedback
qui traite la longueur ne nomme pas l'erreur la plus probable.

### N12. Vocabulaire du champ `longueur` hors contrat

Le contrat d'item de `CONVENTIONS.md` fixe l'énumération `(courte, longue)`. 6D
écrit « brève » aux items 2, 3, 4, 5 et 8, et « non établie » à l'item 7. Les
unités 3 à 5 écrivent « courte ». À normaliser avant compilation vers
`packages/content`, sinon un validateur d'énumération rejettera la leçon.

## 5. Ce que je n'ai PAS trouvé, et que j'ai cherché

Ces contrôles sont passés, et méritent d'être dits :

- **Aucun ton faux.** Les treize tons de la leçon sont exacts, redérivés à la
  main puis recoupés à Wiktionary et à VOLUBILIS.
- **Aucune graphie fausse.** Les treize séquences de code déclarées sont
  exactes, toutes NFC-stables.
- **Aucune référence inventée.** Les 17 entrées RID, les 16 couples Wiktionary,
  l'annexe `Appendix:Thai script`, les deux fichiers Unicode, les trente lignes
  VOLUBILIS et les quatorze rangs FrequencyWords existent et disent ce que la
  leçon leur fait dire, à l'exception discutée en B4 et B5.
- **Aucune empreinte fausse.** Les quatre empreintes annoncées (archive
  VOLUBILIS, `content.xml`, `th_50k.txt`, plus les trois décomptes de feuilles)
  sont exactes au bit près. Le dossier est réellement reproductible.
- **Aucun tiret cadratin ni demi-cadratin.**
- **Section 1 bis respectée.** Les quatre énoncés qui touchent au français sont
  soit des observations vérifiables par l'apprenant (« comparez vous-même “bon”
  et “bonne” », « dites le i de “midi” », « Regardez maintenant l'expression
  française… »), soit des constats lexicaux triviaux. Aucun absolu non sourcé
  sur le français. Le seul absolu problématique de la leçon porte sur le thaï,
  pas sur le français : c'est B5.
- **Aucun distracteur juste.** Les cartes en trop des six tirages de l'exercice
  2 et les options fausses des six tirages de l'exercice 1 sont toutes
  réellement fausses pour la cible demandée.

## 6. Recommandation

Maintenir `draft`. Les cinq bloquants se corrigent sans réécrire la leçon :

1. B1 : ajouter 6A aux prérequis, remplacer « donné, pas calculé » par le renvoi
   à la règle de 6A, rouvrir l'exclusion SRS correspondante.
2. B2 : `naawng` → `nawwng` aux trois tirages.
3. B3 : réécrire la phrase de la page 9 pour ne viser que `่` et `้`.
4. B4 : requalifier la jambe VOLUBILIS du fait C en attestation du cas **sans
   nom**, et annoncer la forme avec nom comme mono-sourcée plus composition des
   faits A et B, ou trouver une seconde jambe.
5. B5 : porter « jamais après » sur la production de l'apprenant, et compléter
   la synthèse de source de l'item 2.

L'incertitude 1 doit par ailleurs être réécrite à la lumière de 6A, 6B, 6C et 6E,
qui existent maintenant tous les quatre.
