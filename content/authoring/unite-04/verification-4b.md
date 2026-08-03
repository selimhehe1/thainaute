# Contre-audit adversarial de `unite-04/lecon-4b.md`

- Date : 3 août 2026
- Auditeur : agent indépendant, consigne adversariale (chercher des erreurs,
  pas confirmer)
- Fichier audité : `content/authoring/unite-04/lecon-4b.md`
- Cadre : `content/authoring/CONVENTIONS.md` (v1, amendements v1.1 et v1.2 et
  arbitrage v1.2 compris) et `docs/content-policy/sources-verification.md`
- Méthode : aucune source citée par la leçon n’a été crue sur parole. Le RID a
  été interrogé directement, graphie par graphie ; les deux éditions de
  Wiktionary ont été relues en wikitexte brut et en rendu ; `VOLUBILIS.ods`
  v26.2 a été retéléchargé depuis SourceForge et reparsé avec un parseur
  indépendant ; `th_50k.txt` et `UnicodeData.txt` ont été retéléchargés ; tous
  les tons et toutes les longueurs ont été recalculés par la règle de classe
  avant d’être comparés aux champs déclarés.
- Verdict : **la leçon ne peut pas passer en `review` en l’état.** Quatre
  findings bloquants, huit findings non bloquants. Le socle linguistique est en
  revanche remarquablement solide : sur 71 faits re-vérifiés, aucune graphie
  fausse, aucun ton faux, aucune longueur fausse, aucun sens faux, aucun
  codepoint faux et aucune ligne VOLUBILIS inventée.

## 1. Ce qui a été re-vérifié et confirmé (71 faits)

### 1.1 Encodage et typographie (15)

Contrôles refaits sur le fichier entier, indépendamment du script cité par le
dossier (qui n’existe pas, voir le finding 10).

- Le fichier entier est stable en NFC.
- 561 occurrences thaïes, 92 chaînes distinctes, toutes stables en NFC, aucune
  hors de la plage U+0E00 à U+0E7F. Les deux chiffres du dossier tombent
  exactement.
- Les 8 champs `codepoints` recalculés depuis leur champ `thai` : 8
  correspondances exactes, 0 écart. L’ordre logique est correct dans les trois
  cas sensibles : `ดื่ม` = consonne, signe de voyelle, marque de ton, finale ;
  `น้ำ` = consonne, marque de ton, U+0E33 ; `ข้าว` = consonne, marque de ton,
  U+0E32, U+0E27.
- Typographie : 0 U+2014, 0 U+2013, 0 U+2015, 0 U+2212, 0 apostrophe droite,
  362 apostrophes typographiques U+2019. Conforme à ADR-0022, et identique au
  décompte du dossier.
- `UnicodeData.txt` (téléchargement du jour) : `0E34 SARA I` contre
  `0E35 SARA II`, `0E36 SARA UE` contre `0E37 SARA UEE`, `0E27 WO WAEN`,
  et `0E33 SARA AM` porte bien la décomposition de compatibilité
  `<compat> 0E4D 0E32`. Les cinq lignes citées par le dossier existent et
  disent ce qu’on leur fait dire.

### 1.2 Royal Institute Dictionary (16)

Interrogations directes en POST sur `dictionary.orst.go.th/func_lookup.php`,
paramètres `word=<graphie>&funcName=lookupWord&status=lookup`, une requête par
graphie, espacées, agent utilisateur identifiant l’audit. Faits cités par
référence, aucune définition reproduite.

- `กิน` : entrée autonome, vedette unique, quatre acceptions numérotées ; la
  première couvre bien la mastication, la déglutition et l’absorption d’un
  liquide, et donne bien `กินข้าว` et `กินน้ำ` en exemples ; bloc `ลูกคำ`
  présent. **Conforme à l’item 1.**
- `กินน้ำ` : vedette existante, sens maritime, rattachée à la vedette mère
  `กิน`. **Conforme au dossier et à l’incertitude 9.**
- `ข้าว` : entrée autonome, sens botanique et céréalier, mention du grain comme
  aliment de base. **Conforme à l’item 2.**
- `ข้าว` : le bloc `ลูกคำ` compte **exactement 133 segments** séparés par une
  espace, recomptés indépendamment. Le chiffre de la note culturelle tombe au
  segment près.
- `กินข้าว` : aucune entrée. **Conforme.**
- `หิวน้ำ` : aucune entrée. **Conforme à l’item 7.**
- `รับประทาน` : entrée autonome, vedette unique, définie par `กิน`, exemple
  `รับประทานอาหาร`, rattachée à la vedette mère `รับ`, **aucune marque de
  registre**. Conforme à l’item 3, y compris sur le point délicat que le RID ne
  soutient pas le contraste de registre.
- `ทาน` : **exactement trois vedettes**, `ทาน ๑, ทาน-` (nom, le don), `ทาน ๒`
  (verbe, soutenir ou résister, en couple avec `ต้าน`), `ทาน ๓` (verbe,
  collationner un texte). **Aucune ne porte le sens de manger.** Le fait
  porteur de l’item 4 est confirmé au mot près.
- `ดื่ม` : entrée autonome, vedette unique, définie par `กิน` restreint aux
  boissons, plus l’emploi intransitif ; bloc `ลูกคำ` présent. **Conforme.**
- `หิว` : entrée autonome, vedette unique, définie par le fait de vouloir
  manger et de vouloir boire, emploi figuré illustré par `หิวเงิน`.
  **Conforme.**
- `อร่อย` : entrée autonome, vedette unique, catégorie `ว.`, prononciation
  donnée entre crochets sous forme de respelling thaï, première acception
  restreinte à ce qui se mange, deuxième acception marquée `(ปาก)`.
  **Conforme.** Voir toutefois le finding 2 : le contenu de ce respelling est
  décisif et n’a pas été exploité.
- `น้ำ` : entrée autonome, cinq acceptions numérotées, très long bloc `ลูกคำ`.
  **Conforme.**
- `คำเป็น` : la définition normative est bien la syllabe à voyelle longue sans
  consonne finale, plus les séries `กง กน กม เกย เกอว`. La citation de 4A est
  fidèle, y compris sur ce qu’elle n’inclut pas.
- `อักษรสูง` : ton de base `จัตวา`, onze lettres `ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห`.
- `อักษรกลาง` : ton de base `สามัญ`, neuf lettres `ก จ ฎ ฏ ด ต บ ป อ`.
- `คำตาย` : définition contrôlée en complément, cohérente avec les exclusions
  énoncées à la page 8 de 4A.

### 1.3 Wiktionary, éditions `en` et `th` (14)

Relecture en `action=raw` et en `action=render`.

- `กิน` : IPA `/kin˧/` ; `en` donne bien « to consume : to eat ; to take ; to
  drink » ; `th` donne bien une acception `เคี้ยวกลืน` avec l’exemple `กินข้าว`
  et une acception `ดื่ม` avec l’exemple `กินน้ำ`. Citation exacte.
- `กินข้าว` : IPA `/kin˧.kʰaːw˥˩/`, sens et synonyme `ทานข้าว` conformes,
  étymologie donnée comme `กิน` plus `ข้าว` ; page `th` absente, HTTP 404.
  Conforme.
- `ข้าว` : IPA `/kʰaːw˥˩/`, sens « rice » puis un sens marqué `colloquial`
  « food ; meal ». Conforme.
- `รับประทาน` : IPA `/rap̚˦˥.pra˨˩.tʰaːn˧/`, verbe marqué `{{lb|th|formal}}`,
  note d’usage « Colloquially, the term is clipped as ทาน ». Conforme.
- `รับประทาน` sur `th` : `{{th-pron|รับ-ปฺระ-ทาน}}`, `คำกริยา` marqué
  `{{lb|th|ทางการ}}`, défini par `กิน`. Conforme au caractère.
- `ทาน` : IPA `/tʰaːn˧/`, étymologie déclarée `{{clipping|th|รับประทาน}}`,
  verbe marqué `{{lb|th|colloquial}}`. Conforme sur le fond, voir le finding 5
  sur le décompte des étymologies.
- `ทาน` sur `th` : `รากศัพท์ 4` déclarée `{{clipping|th|รับประทาน}}`, `คำกริยา`
  marqué `{{lb|th|ปาก}}`, défini par `กิน`. Conforme.
- `ดื่ม` : IPA `/dɯːm˨˩/`, verbe transitif puis intransitif ; `th` marque
  `สกรรม` et `อกรรม` et définit par `กิน` pour les boissons. Conforme.
- `หิว` : IPA `/hiw˩˩˦/`, sens « to have a desire for food or drink : to be
  hungry, to be thirsty, etc. » ; `th` définit par `อยากกิน, อยากดื่ม`.
  Conforme.
- `หิว` : l’exemple `{{th-x|หิว น้ำ|...}}` existe bien à l’intérieur de
  l’entrée, et `หิวน้ำ` comme `หิวข้าว` figurent bien dans les termes dérivés.
  La note de l’item 7 sur les trois apostrophes de balisage retirées est exacte
  au caractère près.
- `อร่อย` : IPA `/ʔa˨˩.rɔj˨˩/` ; le tableau de prononciation porte bien le
  respelling `อะ-หฺร็่อย` accompagné des mentions `Unorthographical` et
  `Short` ; l’adjectif est marqué `{{lb|th|of food}}` et deux acceptions sont
  marquées `slang`. Conforme, y compris la réserve d’indépendance sur `th`,
  dont la définition reprend effectivement celle du RID.
- `น้ำ` : la section thaïe donne `/naːm˦˥/` et une variante brève. Conforme au
  choix `náam`.
- Les six absences déclarées sont confirmées : `หิวน้ำ`, `หิวข้าว`, `ดื่มน้ำ`,
  `กระหายน้ำ` en HTTP 404 sur les deux éditions, plus `กินข้าว` et `ทานข้าว` en
  404 sur `th`.
- Contrôles hors leçon utiles au parcours : `เก้า` est donné avec le respelling
  `ก้าว` et l’IPA `/kaːw˥˩/`, donc **voyelle longue** : la transcription
  `kâao` de 3B et de 4B est correcte et non une erreur de doublement.
  `ฟอง` est donné `/fɔːŋ˧/`, donc `fawwng` est correct.

### 1.4 VOLUBILIS v26.2 (12)

Fichier retéléchargé depuis `https://sourceforge.net/projects/belisan/files/VOLUBILIS.ods`,
reparsé avec un parseur expat écrit pour cet audit, sans normalisation Unicode,
avec expansion explicite des attributs de répétition.

- Identité du fichier confirmée sur le contenu décompressé :
  `dc:date = 2026-07-01T09:56:28`,
  `meta:generator = LibreOffice/26.2.3.2$Windows_X86_64`, `table-count="3"`,
  `cell-count="1284481"`, `content.xml` de **379 601 910 octets**. Les cinq
  valeurs du dossier tombent exactement.
- En-tête de la feuille `Volubilis` conforme.
- **Les 37 numéros de ligne cités sont tous exacts**, contrôlés cellule par
  cellule sur les colonnes `THA`, `ThaiRom`, `ThaiPhon`, `ENG`, `FRA`, `LEV`,
  `TYPE`, `USAGE`, `DOM`, `KEY` et `SCIENT_ABBREV`. Aucune ligne inventée,
  aucune valeur déformée. C’est le point le plus fort du dossier.
- Ligne 84379, `รับประทาน` : colonne `USAGE` = `(form.)`. Le fait porteur de la
  leçon est confirmé à la source.
- Ligne 103224, `ทาน` : `USAGE` = `(form.)`, `ENG` = « eat ». Le conflit de
  registre avec Wiktionary est donc réel et correctement décrit.
- Lignes 42447 et 42448, `กิน` : colonne `USAGE` vide sur les deux.
- Feuille `Codes`, ligne 54 : `(form.)` défini par « formal, polite » et
  « formel, poli ».
- Feuille `Codes`, ligne 125 : `(oral)` défini par « langue parlée » et par le
  mot thaï `ปาก`.
- Feuille `Romanization`, ligne 28 : `ว` en consonne finale noté `-`.
- Feuille `Romanization`, lignes 46 et 47 : `อึ` = `eu` contre `อื` = `eū` en
  colonne Volubilis, ce qui fait bien du macron une marque de longueur.
- Feuille `Romanization`, lignes 75, 76 et 83 : `เอา`, `อาว` et `อิว` romanisés
  `ao`, `ao` et `io` en colonne ORST, et `iū` en colonne Volubilis pour `อิว`.
  Le raisonnement de l’item 6 sur `hiū` est correct : le macron appartient au
  digramme, il ne note pas la longueur.
- Lignes 88392 et 81679 : `สบาย` = `_sa-bāi` et `ประตู` = `_pra-tū`. Le
  contrôle de comparabilité de l’item 8 est exact.
- Décompte confirmé : 25 graphies interrogées, 24 trouvées, `หิวจัง` absente ;
  `Codes` 227 lignes non vides, `Romanization` 86 lignes non vides.

### 1.5 Fréquence (2)

- `th_50k.txt` retéléchargé : **les dix-huit rangs cités sont exacts**, sans
  exception, y compris les trois contrôles de reproductibilité empruntés à 3A
  (`ตา` 2756, `ตัด` 4000, `ถุง` 13554).
- Les quatre absences déclarées sont confirmées : `รับประทาน`,
  `รับประทานอาหาร`, `หิวน้ำ`, `กระหาย`.

### 1.6 Tons et longueurs recalculés (8)

Chaque valeur a été redérivée de la classe de la consonne initiale, du type de
syllabe et de la marque de ton, sans regarder les champs déclarés, puis
comparée.

| Item        | Attendu par la règle                     | Déclaré         | Verdict                  |
| ----------- | ---------------------------------------- | --------------- | ------------------------ |
| `กิน`       | moyen, brève                             | moyen, courte   | conforme                 |
| `กินข้าว`   | moyen puis descendant, brève puis longue | idem            | conforme                 |
| `รับประทาน` | haut, bas, moyen ; brève, brève, longue  | idem            | conforme                 |
| `ทาน`       | moyen, longue                            | idem            | conforme                 |
| `ดื่ม`      | bas, longue                              | idem            | conforme                 |
| `หิว`       | montant, brève                           | montant, courte | conforme                 |
| `หิวน้ำ`    | montant puis haut                        | idem            | conforme                 |
| `อร่อย`     | bas, bas                                 | bas, bas        | conforme, voir finding 2 |

Les huit champs `ipa` correspondent aux valeurs de Wiktionary relevées le jour
même, et les huit champs `transcription` sont conformes aux règles v1.1
(qualité vocalique sans accent, longueur par doublement de la dernière lettre,
marque de ton sur la première lettre du noyau), sous réserve du finding 7.

### 1.7 La règle de ton de 4A (2)

- **Le fond de la règle est juste.** « Syllabe vivante sans marque de ton :
  consonne moyenne, ton moyen ; consonne haute, ton montant » est exactement ce
  qu’énoncent les entrées `อักษรกลาง` et `อักษรสูง` du RID, relues directement.
  La règle n’est pas trop générale : les trois limites énoncées à la page 8 de
  4A (syllabe portant une marque, classe basse, syllabes brèves ouvertes et
  finales occlusives) sont correctes et suffisent à écarter tous les
  contre-exemples. Aucun mot du parcours dans le domaine déclaré ne la met en
  défaut.
- **La définition de la syllabe vivante est fidèle au RID**, y compris dans son
  périmètre restreint. Elle omet les `สระเกิน`, mais le RID les omet aussi dans
  l’entrée `คำเป็น` : c’est une sous-généralité, jamais une réponse fausse.
- La formulation destinée à l’écran est en revanche défectueuse : voir le
  finding 3.

## 2. Findings

### Finding 1 (BLOQUANT) : le classeur VOLUBILIS documente bel et bien ses symboles de ton

La leçon l’affirme trois fois, dont une en revendiquant une lecture intégrale :

- item 8, bloc « Divergence sur le ton de la première syllabe » : « **Le
  classeur ne documente nulle part la valeur de ces symboles** : les feuilles
  `Codes` et `Romanization` ont été relues intégralement le 2026-08-03 et n’en
  donnent aucune légende. » ;
- dossier de production, « Limite constatée » : « ne documentent nulle part la
  valeur des symboles de ton de la colonne `THAIPHON` (`-`, `_`, `/`, `\`,
  `¯`). Ces valeurs sont donc inférées par concordance » ;
- incertitude 2 : « Le classeur ne documente nulle part la valeur de ses
  symboles de ton ».

C’est faux. La feuille `Codes` du même fichier porte une section explicitement
intitulée `TONES` à la ligne 215, suivie de sa légende complète aux lignes 216
à 220, qui associe chaque symbole à son ton en anglais et en français. Cette
légende se trouve à l’intérieur des 227 lignes que la leçon déclare avoir
dumpées intégralement.

Pourquoi c’est bloquant : c’est un fait affirmé sur une source, vérifiable en
une lecture, et faux. Il fonde deux affirmations de méthode (« inférées par
concordance ») et l’incertitude 2, qui bloque le passage en `review`. Toutes
les lectures de ton faites par la leçon sur la colonne `THAIPHON` se trouvent
d’ailleurs confirmées par cette légende : le problème n’est pas le résultat,
c’est l’affirmation sur la source.

Correction attendue : retirer les trois affirmations, citer la légende
`Codes` 215 à 220 comme source documentée, et requalifier toutes les lectures
de ton VOLUBILIS de « inférées » en « documentées par la source ».

### Finding 2 (BLOQUANT) : le ton de la première syllabe de อร่อย est double-sourcé, la leçon dit le contraire

L’item 8 et l’incertitude 2 concluent que « le fait n’atteint pas deux
autorités concordantes » et exigent, avant `review`, « soit obtenir une
troisième autorité, soit retirer l’accent de la première syllabe ».

Or la leçon cite elle-même, dans le même item, le fait qui tranche : l’entrée
`อร่อย` du RID donne une prononciation entre crochets sous forme de respelling
thaï. Ce respelling, relu directement, écrit la première syllabe comme une
syllabe morte brève à initiale de classe moyenne, ce qui donne un **ton bas**
par la règle même que 4A vient d’enseigner et que le RID énonce à `อักษรกลาง`.
Le respelling de Wiktionary, également relu, va dans le même sens, et son IPA
donne `/ʔa˨˩/`.

Il y a donc bien deux autorités indépendantes et concordantes, le RID et
Wiktionary, contre une notation isolée de VOLUBILIS. Et grâce au finding 1,
cette notation isolée est désormais lisible sans conjecture : la légende
`Codes` la range dans le ton normal, c’est-à-dire moyen. La divergence est
réelle, elle est même mieux caractérisée qu’avant, mais elle est arbitrée deux
contre un en faveur de la valeur déjà retenue.

Pourquoi c’est bloquant : la leçon décrit faussement l’état de sa propre
preuve, et en tire une porte de blocage inutile. La transcription retenue,
`à·ràwi`, est correcte et doit rester ; c’est le dossier qui doit être corrigé.

Correction attendue : réécrire l’item 8 et l’incertitude 2 pour dire que le ton
bas de la première syllabe est attesté par le RID (respelling) et par
Wiktionary (IPA), que VOLUBILIS note un ton moyen documenté comme tel, et que
le conflit est tranché en faveur des deux autorités concordantes. Lever la
porte « REQUIS avant `review` », ou la remplacer par une simple note de
divergence.

### Finding 3 (BLOQUANT) : la règle de ton de 4A est opérationnalisée sur « la première lettre », ce qui est faux

Le fond de la règle est juste et bien sourcé (voir 1.7). Sa formulation
destinée à l’apprenant ne l’est pas. 4A dit, à l’écran :

- page 6 : « la classe de la première lettre suffit à donner le ton » ;
- page 10 : « regardez la première lettre avant tout le reste » ;
- exercice 4, feedback incorrect : « Revenez à la première lettre du mot, et à
  elle seule. »

C’est faux pour toute syllabe écrite avec une voyelle antéposée `เ`, `แ`, `โ`,
`ใ` ou `ไ`, où la première lettre du mot n’est pas la consonne initiale. Ce
n’est pas un cas d’école : le parcours en contient déjà, et 4A elle-même en
affiche. `เสือ` est donnée à la page 5 de 4A comme mot-image de `ส` ; c’est une
syllabe vivante sans marque de ton, donc pleinement dans le domaine de la
règle, et sa première lettre est `เ`. `ไก่` et `ไข่`, les deux mots porteurs de
la leçon, ont `ไ` pour première lettre. `เก้า` vient de 3B.

La Méta de 4A énonce correctement le critère : « d’après la seule classe de la
consonne initiale ». Ce sont les trois formulations vues par l’apprenant qui
sont fausses, et ce sont elles qui seront compilées.

Pourquoi c’est bloquant : la consigne d’audit vise précisément une règle qui
contaminerait la suite du parcours. Celle-ci le ferait : elle produit une
réponse fausse dès la première syllabe à voyelle antéposée, et les unités 5 à 8
sont censées bâtir dessus.

Correction attendue : remplacer partout « la première lettre » par « la
consonne initiale » ou « la première consonne », et ajouter une phrase courte
sur les voyelles qui s’écrivent avant leur consonne, déjà rencontrées.

### Finding 4 (BLOQUANT) : deux distracteurs ne sont pas faux, et c’est la leçon qui l’établit

Deux tirages notent faux une réponse que la leçon vient de rendre défendable.

- **Exercice 1, tirage 1.** Audio `หิว`, options « avoir faim », « avoir
  soif », « boire », réponse attendue « avoir faim ». Mais la page 6 enseigne,
  et l’item 6 redit, que le RID définit `หิว` par le fait de vouloir manger ou
  de vouloir boire, et que « le mot ne se limite donc pas à la faim ». Vérifié
  à la source : c’est exact. La leçon apprend donc que `หิว` seul est ambigu,
  puis note faux l’apprenant qui en tient compte.
- **Exercice 3, tirage 4.** Consigne « boire », options `ดื่ม`, `กิน`,
  `อร่อย`, réponse attendue `ดื่ม`. Mais la page 2 et l’item 1 enseignent que
  le RID et VOLUBILIS donnent aussi à `กิน` le sens de boire. Vérifié à la
  source : la première acception du RID le donne explicitement, avec `กินน้ำ`
  en exemple, et la colonne `ENG` de VOLUBILIS ligne 42447 porte « drink ».

Pourquoi c’est bloquant : un corrigé qui contredit l’enseignement de la même
leçon est un corrigé faux du point de vue de l’apprenant, et il punit
précisément celui qui a le mieux lu.

Correction attendue : au choix, remplacer les distracteurs (`ดื่ม` au lieu de
« avoir soif » au tirage 1 ; `หิว` au lieu de `กิน` au tirage 4), ou rendre les
consignes discriminantes (« le verbe spécialisé du boire », « la faim, sans
autre précision »). L’exercice 3 tirage 6 montre d’ailleurs la bonne méthode,
en demandant « la forme la plus longue des trois », critère objectif que ni
`ทาน` ni `กิน` ne satisfont.

### Finding 5 : `ทาน` n’a pas quatre étymologies sur en.wiktionary, mais trois

L’item 4 écrit : « la page distingue quatre étymologies. L’étymologie 3 est
déclarée `{{clipping|th|รับประทาน}}` ». La page relue en wikitexte brut ne
contient que trois sections d’étymologie sous la langue thaïe, plus une section
palie sans étymologie numérotée. Le reste de la citation est exact au caractère
près : c’est bien l’étymologie 3 qui porte le `clipping` et le marqueur
`{{lb|th|colloquial}}`.

C’est `th.wiktionary` qui compte quatre `รากศัพท์`, et c’est bien sa quatrième
qui porte le `clipping` et le marqueur `ปาก` : la leçon le dit correctement
deux lignes plus bas. Le « quatre » a vraisemblablement glissé d’une source à
l’autre.

Non bloquant : la conclusion de l’item, le conflit de registre, n’est pas
affectée. Mais c’est une source mal citée, et le contrat de vérification exige
que la citation dise ce que la source dit.

### Finding 6 : `awi` n’est pas un graphème nouveau de 4B

La Méta annonce : « Nouveautés de transcription : le graphème `io` pour la
diphtongue /iw/ et le graphème `awi` pour /ɔj/. » La page 8 renchérit : « Deux
graphèmes nouveaux dans la transcription », « Deux notations apparaissent
aujourd’hui ». Le dossier répète que `recall` « mesure la production écrite des
deux graphèmes nouveaux, `io` et `awi` ».

`awi` est introduit en **2C**, pour `หน่อย` (`nàwi`), où il est explicitement
présenté comme « nouveau graphème dans nos transcriptions ». 4B liste elle-même
le patron `ขอ … หน่อย` dans ses prérequis d’unité 2. 3B en dérive `awwi` pour
`ร้อย`. Un apprenant arrivant en 4B a donc déjà écrit `awi` au moins une fois.

Deux conséquences annexes, à traiter ensemble :

- ni `awi`, ni `aao` (employé par `khâao` et `kâao`), ni `io` ne figurent dans
  `CONVENTIONS.md`. 3B signale explicitement `aao` et `awwi` comme des
  extensions non ratifiées à faire ratifier avant `review` ; 4B ne signale rien
  de tel, et son incertitude 6 ne couvre que la lisibilité française de `hǐo` ;
- la page 8 annonce le contraste « `io` contre `ao` » puis donne pour exemple
  `kâao`, qui contient `aao` et non `ao`. L’étiquette ne décrit pas l’exemple,
  et le contraste mélange une différence de glide avec une différence de
  longueur.

Non bloquant, mais à corriger avant `review` : `io` est la seule vraie
nouveauté du jour, et le statut non ratifié des trois graphèmes doit être
consigné comme il l’est en 3B.

### Finding 7 : `aww` est présenté comme pouvant être bref, ce que la convention interdit

Item 8, `note_fr` : « le second [`อ`] note la voyelle `aww` de 2A, ici brève et
refermée par un `ย` ».

Sous l’amendement v1.1, la longueur se note en doublant la dernière lettre du
graphème : `aw` est la forme brève, `aww` la forme longue. 2A introduit
d’ailleurs `aww` explicitement comme la voyelle longue, et 3E le redit mot pour
mot à propos de `ฟอง`. Écrire « la voyelle `aww` … ici brève » enseigne donc
qu’un graphème long peut se lire bref, ce qui casse la seule règle de longueur
du système et contredit la transcription que la leçon retient elle-même,
`à·ràwi`, qui écrit bien `aw`.

Non bloquant, car la transcription produite est correcte, mais c’est du texte
destiné à l’écran et il enseigne une fausse correspondance.

Correction attendue : « la voyelle `aw`, forme brève du `aww` de 2A, refermée
par un `ย` ».

### Finding 8 : 4B ignore l’existence de 4A et ré-enseigne son vocabulaire

`content/authoring/unite-04/lecon-4a.md` existe et enseigne `กิน` (page 4,
item 1), `ข้าว` et `ขาว` (page 3), avec la carte `srs-u04-l4a-07` qui porte
`กิน, ไก่, ไข่, ข้าว, ขาว`. 4B ne mentionne 4A nulle part : ses prérequis
s’arrêtent à l’unité 3, sa page 2 présente `กิน` comme le mot du jour et sa
page 3 introduit `ข้าว` comme neuf.

Trois effets mesurables :

- doublon d’enseignement sur deux leçons consécutives de la même unité ;
- glose divergente pour le même item : 4A donne `fr : manger, boire, consommer`
  à `กิน`, 4B donne `fr : manger` ; le périmètre sémantique du même mot change
  d’une leçon à l’autre sans que rien ne l’explique ;
- la Méta de 4B annonce « aucun signe nouveau n’est enseigné » et compte `ว` en
  fin de syllabe parmi les signes « déjà rencontrés ». Hors 4A, la seule
  occurrence antérieure de `ว` final dans le parcours est `ตัว` en 3D, où `ว`
  est composante de la voyelle `◌ัว` et non un glide de fin de syllabe. Sans
  4A, l’affirmation est fragile ; avec 4A, elle est vraie mais non sourcée.

Non bloquant au sens linguistique, mais c’est une incohérence de parcours qui
doit être tranchée à la consolidation de l’unité 4, avec 4C, 4D et 4E qui
portent la même cécité mutuelle.

### Finding 9 : la série d’exemples attribuée au RID dans le dossier de 4A n’est pas la sienne

Dans le bloc de sources de la règle de ton, 4A écrit : « **La série d’exemples
du dictionnaire est exactement celle de la leçon 1A**, `คา ข่า ค่า ค้า ขา`.
Cette coïncidence n’a pas été cherchée. »

Relecture directe des deux entrées : `อักษรสูง` donne `ขา ข่า ข้า` pour le mot
vivant, puis `ขะ ข้ะ` pour le mot mort ; `อักษรกลาง` donne `กา ก่า ก้า ก๊า ก๋า`.
Aucune des deux séries n’est `คา ข่า ค่า ค้า ขา`, et aucune ne mélange `ค` et
`ข` comme le fait 1A. La leçon décrit correctement les séries deux phrases plus
haut, puis en tire une coïncidence qui n’existe pas.

Non bloquant, et sans effet sur la règle, mais c’est exactement le type
d’affirmation qui se recopie ensuite dans une note culturelle.

### Finding 10 : les artefacts déclarés reproductibles n’existent pas

Le dossier de 4B cite comme preuves reproductibles `u4b/vol4b.py`,
`u4b/volrom.py` et `u4b/check4b.py` ; 4A cite `u4a/vol_ods.py` et
`u4a/vol_rule2.py`. Aucun de ces fichiers n’existe dans le dépôt. N’y figurent
pas davantage `VOLUBILIS.ods`, `th_50k.txt` ni `UnicodeData.txt`, et aucun
d’eux n’est couvert par `.gitignore`. Le répertoire
`content/authoring/unite-04/` est en outre entièrement non suivi par Git à
l’heure de cet audit.

L’amendement v1.2 est explicite sur ce qui est exigé : non pas une URL, mais
qu’un tiers puisse **refaire la consultation à l’identique**. Citer un script
absent ne satisfait pas ce critère.

Non bloquant pour la justesse des faits, puisque cet audit a pu tout refaire
sans ces scripts, et que tout est tombé juste. Mais la traçabilité déclarée est
inexacte.

Correction attendue : soit committer les scripts et documenter le
téléchargement des trois fichiers de données, soit remplacer les références aux
scripts par la description de la méthode, suffisante pour refaire le travail.

### Finding 11 : le décompte de lignes de la feuille `Volubilis` ne se recompute pas

Le dossier affirme que « la feuille `Volubilis` compte 118 924 lignes dont
118 884 non vides ». Un parseur indépendant, sur le même fichier et avec
expansion explicite des attributs de répétition de lignes et de colonnes, donne
**118 573 lignes dont 118 571 non vides**.

À signaler avec sa contrepartie, qui est rassurante : les deux autres feuilles
tombent exactement (`Codes` 227 lignes non vides, `Romanization` 86), et
surtout **les 37 numéros de ligne cités sont tous exacts**. La numérotation est
donc alignée entre les deux extractions ; seul le total ne l’est pas, ce qui
oriente vers une différence de convention sur les lignes vides de fin plutôt
que vers une erreur de fond.

Non bloquant. À reprendre à la consolidation, avec la même méthode pour les
unités 2 et 3, puisque le dossier s’appuie sur ces totaux pour attester qu’il
s’agit du même export.

### Finding 12 : critère SRS ambigu et objectifs non alignés sur les exercices

- **Carte `srs-u04-l4b-06`** : « sur quatre transcriptions affichées dont deux
  contiennent `io`, désigner sans erreur celles qui se terminent par un
  glissement vers ou ». Les deux propriétés ne coïncident pas : `kâao`,
  affiché à la page 8 de la même leçon, se termine par le même glissement sans
  contenir `io`. Selon le tirage, la carte a zéro, une ou deux bonnes réponses
  supplémentaires non prévues.
- **Objectif de la Méta** : « il écrit en transcription Thaïnaute la forme qui
  convient à une situation donnée sur 5 tirages sur 6 ». Aucun exercice ne
  présente de situation : l’exercice 4 est une dictée à partir de l’audio.
  L’objectif annoncé n’est mesuré par rien.
- **Graphèmes mesurés** : la Méta dit que `recall` porte sur `io` et `uee`, le
  dossier dit qu’il porte sur `io` et `awi`. Les deux ne peuvent pas être
  vraies ensemble.
- **Périmètre de l’exercice 2** : le dossier affirme que `association` « mesure
  l’appariement forme et sens sur les huit items », alors que `ทาน` en est
  délibérément exclu et que `น้ำ`, qui n’est pas un item du jour, y figure.

Non bloquant, mais ces quatre points doivent être resserrés avant `review`,
faute de quoi les critères de maîtrise ne mesurent pas ce qu’ils annoncent.

## 3. Ce que cet audit n’a pas pu vérifier

- **Naturalité réelle** des huit formes en situation. Aucune source recevable
  ne le permet, et la leçon a raison de s’en abstenir (incertitudes 4 et 5).
  Cet audit confirme seulement que rien de situationnel n’a été affirmé.
- **Registre de `ทาน`.** Le conflit est confirmé à la source, des deux côtés,
  et il n’est pas arbitrable avec les sources autorisées. Le traitement retenu,
  enseigner la reconnaissance et dire pourquoi on n’en dit pas plus, est le
  seul qui ne fabrique rien. Aucune correction demandée.
- **Rendu typographique** des piles à deux étages de `ดื่ม` et des marques
  hautes de `อร่อย` et `รับประทาน`. Relève de l’audit accessibilité.
- **Audio.** Aucune piste n’existe.
- **Revue native.** En attente, correctement affichée comme telle partout.

## 4. Décision

- Findings bloquants : **4** (findings 1, 2, 3 et 4). Les findings 1, 2 et 4
  portent sur 4B ; le finding 3 porte sur 4A et doit être corrigé avant que 4B
  ne soit consolidée, puisque toute l’unité s’appuie sur cette règle.
- Findings non bloquants : **8** (findings 5 à 12).
- Statut recommandé : **`draft` maintenu.** Le socle linguistique de 4B est
  sain et exceptionnellement bien sourcé ; ce sont trois affirmations sur les
  sources et deux corrigés qui doivent être corrigés, pas les items.
- Après correction, un second passage limité aux points 1 à 4 suffira.

## 5. Suite donnée, ajoutée par la consolidation du 2026-08-03

Section ajoutée après coup par l’agent de consolidation de 4B. Elle ne modifie
aucun finding ci-dessus : le rapport d’audit reste le rapport d’audit.

Les douze findings ont été traités. Chaque correction a été re-sourcée en direct
avant d’être écrite, sans jamais s’appuyer sur la seule citation du présent
rapport : le RID a été réinterrogé graphie par graphie sur le même endpoint,
`VOLUBILIS.ods` a été reparsé avec un troisième parseur écrit pour la
consolidation, les pages Wiktionary ont été relues, et `th_50k.txt` a été
recompté. Les trois points sur lesquels le rapport était le plus engagé sont
confirmés au caractère près :

- feuille `Codes`, ligne 215 `TONES`, puis 216 `-x` normal, 217 `¯x` high /
  haut, 218 `_x` low / bas, 219 `/x` rising / montant, 220 `\x` falling /
  descendant ;
- entrée `อร่อย` du RID, respelling `[อะหฺร่อย]`, lu par l’entrée `อักษรกลาง`
  du même dictionnaire : première syllabe morte brève à initiale de classe
  moyenne, donc ton `เอก`, c’est-à-dire bas ; concordant avec `/ʔa˨˩/` de
  Wiktionary ;
- feuille `Volubilis` : 118 573 lignes dont 118 571 non vides, `Codes` 227 et
  `Romanization` 86, valeurs identiques à celles du présent rapport.

Deux compléments trouvés pendant la consolidation, qui vont dans le sens du
rapport sans en changer les conclusions :

1. la colonne `SYLLAB` de la ligne VOLUBILIS 2377 donne `[อะ-หฺร่อย]`, soit le
   respelling du RID : la notation `-a` de la colonne `THAIPHON` est donc
   contredite par sa propre ligne, ce qui affaiblit encore la seule source
   divergente sur le ton de la première syllabe ;
2. l’empreinte SHA-256 de l’archive `VOLUBILIS.ods` est
   `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`. Elle est
   désormais consignée dans la leçon et constitue un critère d’identité de
   l’export plus sûr qu’un total de lignes.

Où lire le détail : `content/authoring/unite-04/lecon-4b.md`, section
« Résolution du contre-audit du 2026-08-03 » du dossier de production, une ligne
par finding. Les findings 3 et 9, qui portent sur 4A, sont corrigés dans
`content/authoring/unite-04/lecon-4a.md` et consignés dans son état des audits.

Ce qui reste ouvert après consolidation, et qui empêche toujours le passage en
`review` : le registre de ทาน (incertitude 1, aucune source concordante), et
l’arbitrage `CONVENTIONS.md` sur la lisibilité française de `hǐo`
(incertitude 6). Ce qui empêche le passage en `published` : la ratification des
graphèmes `io`, `awi`, `awwi`, `aao` et `aai` (incertitude 13), la revue native,
et l’audio, qui n’existe pas.
