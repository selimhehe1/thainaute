# Contre-audit adversarial de `u07-l7e` (Une journée ordinaire)

- Fichier audité : `content/authoring/unite-07/lecon-7e.md`
- Date de l'audit : 2026-08-03
- Auditeur : agent adversarial indépendant (Claude Opus 5), consigne « trouver
  des erreurs, pas confirmer »
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` (contrat d'item,
  transcription v1.1, amendement v1.2 sur la référence recevable) et
  `docs/content-policy/sources-verification.md`, section 1 bis incluse
- Méthode : aucune source citée par le dossier n'a été crue sur parole. Le RID a
  été interrogé directement mot par mot, le classeur VOLUBILIS relu ligne par
  ligne sur l'exemplaire `.ods`, les pages Wiktionary rechargées en rendu, la
  liste de fréquence recomptée localement, `UnicodeData.txt` relu, et les
  renvois internes au dépôt rouverts fichier par fichier.

## 1. Ce que j'ai revérifié moi-même

**308 faits confirmés par mesure ou consultation directe.** Détail :

| Bloc de vérification                                                    | Faits contrôlés                                            | Résultat                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- |
| RID 2554, requêtes POST directes                                        | 37 graphies                                                | 37 conformes                     |
| VOLUBILIS `.ods` v26.2, lignes et métadonnées                           | 46                                                         | 44 conformes, 2 fautives         |
| Wiktionary en et th, 7 pages en rendu                                   | 21                                                         | 21 conformes                     |
| FrequencyWords `th_50k.txt`                                             | 38 (25 rangs, 11 occurrences, empreinte, nombre de lignes) | 38 conformes                     |
| Unicode 17.0, noms et normalisation                                     | 10                                                         | 9 conformes, 1 écart de comptage |
| Items : graphie, points de code, NFC, ton, longueur, IPA, transcription | 96                                                         | 94 conformes, 2 fautifs          |
| Recensement tonal des 8 répliques, recalculé syllabe par syllabe        | 13 lignes et totaux                                        | 13 conformes                     |
| Comptages annoncés (marques de ton, particules)                         | 5                                                          | 5 conformes                      |
| Corrigés et distracteurs des 4 exercices                                | 12                                                         | 12 conformes                     |
| Renvois au dépôt (items, cartes SRS, citations, curriculum)             | 32                                                         | 30 conformes, 2 fautifs          |

### 1.1 Ce qui tient, et qui mérite d'être dit

Le dossier de sources de ce fichier est, pour l'essentiel, exact au mot près.
J'ai cherché la faille et je ne l'ai pas trouvée là où je l'attendais.

- **RID.** Les 37 graphies annoncées ont bien été interrogeables et donnent
  exactement ce que le dossier leur fait dire : วัน a bien TROIS vedettes, son
  bloc `ลูกคำ` compte bien **48** composés et les 48 commencent bien par วัน ;
  les six composés cités par la note culturelle (วันที่, วันพระ, วันสงกรานต์,
  วันครู, วันแรงงาน, วันรัฐธรรมนูญ) y figurent tous. L'attestation interne qui
  compense l'absence de วันนี้ est réelle : « พรุ่ง, พรุ่งนี้ » définit bien
  demain comme `วันถัดจากวันนี้ไปวันหนึ่ง`. Même chose pour สบายดี, dont la
  cinquième valeur de « สบาย » porte bien l'exemple `เวลานี้เขาสบายดี`. L'entrée
  « ไป » a bien pour **premier** exemple `เขาไปตลาด`. « สัปดาห์ » décrit bien un
  cycle `ตั้งแต่วันอาทิตย์ถึงวันเสาร์`. Les neuf absences annoncées (วันนี้,
  สบายดี, วันอาทิตย์, วันจันทร์, เมื่อวาน, ทุกวัน, สี่สิบ, สิบสี่, ไม่ไกล) sont
  toutes réelles.
- **VOLUBILIS.** L'empreinte SHA-256 `bb9c5da5…`, les 15 724 718 octets, les
  379 601 910 octets de `content.xml` et les décomptes 118 571 / 227 / 86 sont
  exacts. La colonne thaïe est bien la cinquième (`THA`). La table `TONES` est
  bien en ligne 215 de la feuille `Codes` avec la notation annoncée. Toutes les
  lignes citées portent bien la graphie annoncée, à deux exceptions traitées en
  findings.
- **Wiktionary.** L'IPA `/wan˧/`, `/wan˧.niː˦˥/` et `/niː˦˥/`, la romanisation
  Paiboon et Royal Institute, la coupe `วัน-นี้`, l'étymologie explicite
  `วัน + นี้`, l'exemple `วันนี้เป็นวันสงกรานต์` qui ouvre bien la phrase, la
  section `Determiner` de นี้ : tout est conforme. Les trois étymologies de วัน
  sont bien, dans l'ordre, le jour, la mouche et la forêt, ce qui recoupe bien
  l'ordre des trois vedettes du RID. Les deux réserves de méthode sont fondées :
  th.wiktionary « วัน » et « นี้ » reproduisent bien la définition du RID.
- **Fréquence.** Les 25 rangs et les 11 nombres d'occurrences sont exacts au
  chiffre près sur l'exemplaire dont l'empreinte est annoncée.
- **Tons.** J'ai recalculé les 66 syllabes des 8 répliques à partir des règles de
  classe, de syllabe vivante ou morte et de marque. Le tableau du dossier est
  juste, ligne par ligne et case par case : 19 moyennes, 15 basses, 15 hautes,
  12 descendantes, 5 montantes. Les 16 champs `ton` des items sont tous corrects,
  y compris les cas qui dépendent des deux marques de l'unité : basse + ไม้เอก →
  descendant (ค่ะ, ไม่, เท่า, ล่ะ), haute + ไม้เอก → bas (สี่), ห- devant sonante
  - ไม้เอก → bas (อร่อย), basse + ไม้โท → haut (นี้, แล้ว), haute + ไม้โท →
    descendant (ข้าว). Aucune case fausse.
- **Comptages.** 10 ◌่ et 7 ◌้ dans le dialogue : exact. Neuf ครับ, cinq ค่ะ,
  une คะ : exact, réplique par réplique.
- **Unicode.** Les cinq noms normatifs annoncés sont exacts, la totalité du
  fichier est NFC-invariante, 59 caractères thaïs distincts, aucun caractère hors
  du bloc `Thai`. Les 16 séquences de points de code des items sont exactes.
- **Transcription.** Les 16 champs `transcription` respectent v1.1 : graphèmes
  `ae`, `aw`, `ou`, `oe`, doublement de la dernière lettre pour la longueur,
  marque de ton sur la première lettre du noyau. `khàwwp·khoun`, `láeew`,
  `à·ràwi`, `pòuu`, `hǐo`, `thâo·rai` sont cohérents avec les leçons publiées.
- **Renvois au dépôt.** Les numéros d'item cités pour 1D, 1E, 2B, 2C, 2D, 2E, 3B,
  3C, 3E, 4B, 4C, 4D, 5B, 5C, 5D, 5E, 6C et 6E sont tous justes. Les 17
  identifiants de cartes SRS cités existent tous et portent bien l'objet annoncé.
  `u01-l1c` n'a effectivement aucun identifiant de carte. La page 9 de `u06-l6a`
  énonce bien « consonne BASSE → ton MOYEN », ce qui fonde la prévision du ton de
  วัน. La ligne 7 du curriculum donne bien « La maison et le quotidien », « ton
  mi vs bas (sur-entraînement) », « marques de ton ่ ้ ». La citation reprochée à
  `u01-l1c` page 2 à l'incertitude 8 est exacte au mot près.
- **Corrigés.** Aucun corrigé faux, aucun distracteur juste. สิบสี่ vaut bien
  quatorze et สี่สิบ quarante ; ตลาด est bien deux tons bas et ขอบคุณ bas puis
  moyen ; les six paires de l'exercice 2 sont bien celles de `u01-l1c` items 1 à
  6, avec les bons sens et les bons tons ; les deux éléments à retirer de
  l'exercice 3 sont bien les bons.

## 2. Findings

### B1 (BLOQUANT) : le « constat » de contrat d'entrée vide est faux

La Méta écrit, en gras et deux fois : « Contrat d'entrée de l'unité 7 : VIDE…
le répertoire `content/authoring/unite-07/` ne contenait aucun fichier avant
celui-ci, et `lecon-7a.md`, `lecon-7b.md`, `lecon-7c.md` et `lecon-7d.md`
n'existent pas. Ce n'est donc pas une hypothèse à confirmer, c'est un constat. »

Relevé du répertoire au moment de l'audit :

```
lecon-7a.md   108202 octets   2026-08-03 23:24
lecon-7b.md    89221 octets   2026-08-03 23:16
lecon-7c.md    86842 octets   2026-08-03 23:02
lecon-7d.md    88800 octets   2026-08-03 23:13
lecon-7e.md   116306 octets   2026-08-03 23:19
```

Trois des quatre fichiers portent une date de dernière écriture **antérieure** à
celle de `lecon-7e.md`. Le constat était donc déjà faux au moment où le fichier a
été enregistré, et il l'est a fortiori aujourd'hui.

Ce n'est pas un détail de forme : le prétendu vide est la prémisse explicite de
cinq décisions du fichier, l'autonomie de la leçon, l'écartement de la mécanique
`reading`, l'écartement de บ้าน, l'avertissement de coordination SRS, et
l'incertitude 1 qui interdit le passage en `review`. Or `lecon-7a.md` est
précisément « Les deux marques qui changent tout » et déclare en bloc d'écriture
« les deux marques de ton ไม้เอก (◌่) et ไม้โท (◌้) » : le motif d'écartement de
`reading` (« aucune leçon publiée n'énonce la règle ») ne tient plus, et
`lecon-7b.md` item 1 publie บ้าน.

Aggravant : `u06-l6e` avait déjà commis l'erreur symétrique, corrigée à son
incertitude 2 (« Cette incertitude portait le contrat d'entrée de l'unité 6 comme
"hypothèse", au motif que les leçons 6A à 6D n'existaient pas. C'était faux »).
La Méta de 7E invoque nommément ce précédent pour affirmer avoir fait mieux.

Correction attendue : refaire le relevé, réécrire la Méta et le dossier, puis
rouvrir `reading` et la coordination SRS à la lumière de 7A.

### B2 (BLOQUANT) : วัน n'est pas un item nouveau, il est déjà publié par `u07-l7c`

La Méta annonce « deux items nouveaux », l'item 1 porte l'étiquette
« (NOUVEAU) », et l'objectif observable comme la carte `srs-u07-l7e-02` reposent
sur cette nouveauté.

`content/authoring/unite-07/lecon-7c.md` publie วัน à son **item 3**, avec les
mêmes `thai`, `codepoints`, `ipa` `/wan˧/`, `ton` moyen et `transcription` `wan`,
et le présente comme « deuxième mot du jour entièrement lisible par la règle de
6A ». 7C emploie de plus วัน dans deux items composés, ทุกวัน (item 6) et les
instances des items 7 et 8.

Conséquence directe : le compte d'items nouveaux de 7E tombe à un, l'étiquette
« NOUVEAU » de l'item 1 est fausse, et la carte `srs-u07-l7e-02`, qui mesure
« วัน et วันนี้ en reconnaissance », double une carte de 7C. Le fichier avait
anticipé ce scénario à son incertitude 2, mais l'avait explicitement rangé au
rang d'hypothèse future, alors qu'il était déjà réalisé.

Aggravant secondaire : le dossier d'écartement écarte ทุกวัน au motif qu'il
« aurait fait passer le compte d'items nouveaux au-dessus de deux », alors que
ทุกวัน est enseigné par 7C **et** par 7D (item 6).

### B3 (BLOQUANT) : `longueur` « thâo longue » est faux, contredit l'IPA du même item et rouvre sans source un champ descendu à « NON ÉTABLIE »

Item 12, `ข้าวผัดเท่าไร` :

```
- `ipa` : /kʰaːw˥˩.pʰat̚˨˩ tʰaw˥˩.raj˧/
- `longueur` : khâao longue ; phàt courte ; thâo longue ; rai courte
```

Trois contrôles, trois échecs :

1. **Contre la phonologie.** เ-า note /aw/, diphtongue **brève** ; la grammaire
   thaïe traditionnelle range สระเอา parmi les สระเสียงสั้น. La longue
   correspondante est /aːw/, celle de ข้าว, que le même item note correctement
   `khâao longue`.
2. **Contre son propre IPA.** `/tʰaw˥˩/` ne porte aucun `ː`, là où `/kʰaːw˥˩/`
   en porte un. Le champ `longueur` contredit donc le champ `ipa` de la même
   ligne. Vérifié en source : en.wiktionary « เท่าไร » donne
   `/tʰaw˥˩.raj˧/`, sans marque de longueur.
3. **Contre sa propre transcription.** La règle v1.1 marque la longueur par le
   doublement de la dernière lettre du graphème. Le fichier écrit `thâo`, non
   doublé, c'est-à-dire bref, et `khâao`, doublé, c'est-à-dire long. Le champ
   `longueur` dit l'inverse de ce que la transcription affiche.

S'ajoute un problème de sourçage. `u03-l3c`, qui publie เท่าไร, a **descendu ce
champ au statut d'inconnu affiché** après contre-audit : « `longueur` : NON
ÉTABLIE pour les deux syllabes… aucune source hors écosystème Wikimedia consultée
ne mesure leur longueur… aucune longueur n'est enseignée ni affichée pour ce
mot » (incertitude 2 du même fichier). 7E réattribue une valeur aux deux
syllabes sans produire la moindre source nouvelle : ses trois jambes pour l'item
12 (RID « เท่าไร », VOLUBILIS ligne 104152, contrôle négatif) ne mesurent aucune
longueur. C'est un fait non sourcé qui ressuscite une décision d'audit, et il
est en plus faux dans un sens sur deux.

### B4 (BLOQUANT) : référence mal citée, VOLUBILIS ligne 54145 n'est pas ไม่ไป

Dossier d'écartement : « **ไม่ไป**, « ne pas aller », attesté par VOLUBILIS ligne
54145 comme expression verbale. »

Relecture du classeur, colonnes dans l'ordre de l'en-tête :

```
54145 | ThaiRom 'mai klai' | ThaiPhon '\mai -klai' | THA 'ไม่ไกล' | FRA 'pas loin' | TYPE 'adv.'
54570 | ThaiRom 'mai pai'  | ThaiPhon '\mai -pai'  | THA 'ไม่ไป'  | FRA 'ne pas aller' | TYPE 'v. exp.'
```

La ligne 54145 est ไม่ไกล, et c'est celle que le **même fichier** cite
correctement à son item 8. ไม่ไป est à la ligne 54570. La citation du dossier
d'écartement fait donc dire à une ligne ce qu'elle ne dit pas, et la référence
n'est pas reproductible telle qu'écrite : un tiers qui refait la consultation
tombe sur un autre mot. L'amendement v1.2 exige exactement le contraire.

### B5 (BLOQUANT) : référence mal citée, la colonne `DOM` des sept jours

Note culturelle : « Les sept portent `n. exp.` en `TYPE` et `CALEND` en `DOM`, et
les sept commencent par วัน. »

Six des sept lignes portent bien `CALEND` en `DOM`. La septième ne porte rien :

```
112341 | THA 'วันพฤหัสบดี' | ENG 'Thursday' | FRA 'jeudi [m]' | LEV 'U' | TYPE 'n. exp.' | USAGE '' | DOM '' | KEY 'W730'
```

Le champ `TYPE` est bien `n. exp.`, mais le champ `DOM` est vide. L'affirmation
est donc fausse pour un septième des lignes qu'elle couvre. Le fait pédagogique
lui-même, « les sept commencent par วัน », reste vrai et double-sourcé ; c'est la
description de la source qui est inexacte, ce que l'amendement v1.2 et la
politique de citation par référence rendent bloquant.

### B6 (BLOQUANT) : quatre énoncés sur le français hors des deux voies de la section 1 bis, et une incertitude qui les certifie à tort

La section 1 bis n'admet un fait sur le français que sourcé deux fois ou
reformulé en observation vérifiable par l'apprenant. Le fichier ne cite aucune
source de cette catégorie, contrôle fait sur tout le fichier. Énoncés concernés :

1. Page 7 : « มาก se place APRÈS le mot qu'il renforce, **à l'inverse du
   français** ».
2. Page 7 : « **Le français met « très » devant**, le thaï met มาก derrière ».
3. Item 10, `note_fr` : « มาก se pose APRÈS le mot qu'il renforce, **à l'inverse
   du français** ».
4. Exercice 3, tirage 2, feedback incorrect : « **En français, très passe
   devant** ; en thaï, มาก passe derrière ».
   (Le feedback correct du même tirage reprend « à l'inverse du français ».)

Aucun n'est sourcé, aucun n'est reformulé en observation. C'est exactement la
forme que le contre-audit de `u06-l6e` a jugée bloquante à son B4, cas 5 (« Le
mot qui interroge reste tout à la fin, jamais au début comme en français »).

Aggravant : l'incertitude 10 affirme que « les énoncés de cette leçon qui
touchent au français, à la page 4 et à la page 7, sont des invitations à comparer
que l'apprenant vérifie lui-même sur sa propre production, ce qui relève de la
voie 2 ». C'est vrai de la page 4, qui demande effectivement de dire les deux
phrases et de regarder où tombe le mot de temps. Ce n'est pas vrai de la page 7,
qui n'invite à rien et affirme. Et l'incertitude ne mentionne ni l'item 10 ni les
deux feedbacks de l'exercice 3. Le dossier certifie donc conforme ce qui ne l'est
pas, ce qui est plus grave que l'écart lui-même.

Correction attendue : reformuler sur le modèle de la page 4, par exemple « dites
la phrase française puis la phrase thaïe et regardez de quel côté du mot tombe
l'intensité », et corriger l'incertitude 10.

### N1 (non bloquant) : la Méta compte deux mots à deux tons bas consécutifs, il y en a au moins quatre

Méta : « Deux mots du dialogue enchaînent deux tons bas de suite, ตลาด (tà·làat)
et สี่สิบ (sìi·sìp) », puis « deux autres font passer la voix d'un étage bas à la
ligne moyenne à l'intérieur d'un seul mot, ขอบคุณ et สบายดี ».

Le recensement est incomplet, et il est contredit par le fichier lui-même :
l'item 10 écrit « อร่อย enchaîne DEUX tons bas, comme ตลาด ». S'y ajoute สวัสดี
(sà·wàt·dii), qui enchaîne deux tons bas **et** passe ensuite à la ligne moyenne,
donc qui relève des deux inventaires. Le chiffre est présenté comme le résultat
d'un « recensement syllabe par syllabe » ; il ne l'est pas.

### N2 (non bloquant) : le distracteur « À la gare » ne rend pas le sens publié de สถานี

Exercice 1, tirage 2 : option 2 « À la gare », avec la mention « les deux
distracteurs sont สถานี et ห้องน้ำ, items publiés de `u05-l5c` ».

`u05-l5c` item 6 donne `fr` « **la station** » et écrit explicitement : « Le mot
désigne une station au sens large, et le dictionnaire l'emploie dans สถานีรถไฟ
pour le train comme dans สถานีตำรวจ pour la police ; ces assemblages ne sont pas
enseignés ici. » Rendre สถานี par « la gare » restreint le mot au train, c'est-à-
dire fait exactement ce que la leçon publiée refuse. L'option restant fausse dans
tous les cas, l'exercice fonctionne, mais la glose est incohérente avec l'item
qu'elle prétend réemployer.

### N3 (non bloquant) : le contrôle de normalisation annonce 862 occurrences, j'en recompte 863

Le dossier décrit une méthode explicitement recomputable : « extraire toutes les
suites de caractères de la plage U+0E00 à U+0E7F, en gardant ensemble deux suites
séparées par un espace unique ». Exécutée telle quelle sur le fichier livré, elle
donne **863** occurrences, pas 862. Les quatre autres nombres du même contrôle
sont exacts : 199 graphies distinctes, 59 caractères thaïs distincts, 0 caractère
hors du bloc `Thai`, 0 graphie non invariante par NFC comme par NFD. L'écart est
d'une unité et ne touche à aucune conclusion, mais une mesure présentée comme
recomputable doit se recomputer.

### N4 (non bloquant) : « repris mot pour mot de l'item publié » est faux deux fois

Le fichier revendique cinq fois la reprise verbatim du champ `fr`, au titre du
finding N2 du contre-audit de `u05-l5a`. Trois reprises sont exactes (นี้,
แล้วคุณล่ะ, แล้วเจอกัน). Deux ne le sont pas :

- item 9, ข้าวผัด : `fr` « **le** riz sauté » ; `u04-l4c` item 1 publie
  « riz sauté » ;
- item 8, ไม่ไกล : `fr` « pas loin » ; `u05-l5e` item 2 publie « pas loin,
  ce n'est pas loin ».

Aucune des deux différences ne change le sens enseigné. C'est la revendication de
verbatim qui est inexacte.

### N5 (non bloquant) : le feedback de l'exercice 2 décrit le ton bas comme une descente

Exercice 2, tirage 8, feedback correct : « Le mot descend d'abord, puis revient
sur la ligne. » Le mot est ขอบคุณ, dont la première syllabe porte un ton **bas**,
que la page 5 du même fichier enseigne comme « aussi plat, un étage plus bas », et
que l'ancre de `u01-l1c` décrit comme un plateau. Décrire un plateau bas comme une
descente réintroduit précisément la confusion bas / descendant que l'unité 7 doit
lever. Formulation attendue : « le mot commence un étage en dessous, puis revient
sur la ligne ».

### N6 (non bloquant) : « วัน ๓ est un mot poétique » n'est pas ce que dit le RID

Item 1 : « « วัน ๓ » est un mot poétique pour la forêt, d'origine pali », le tout
attribué au RID. L'entrée consultée donne `น. ป่าไม้, ดง, เช่น อัมพวัน คือ
ป่ามะม่วง. (ป. วน).` Elle porte bien l'origine pali, elle ne porte **aucune**
étiquette de registre poétique. L'étiquette existe, mais chez en.wiktionary,
étymologie 3, « (elegant, poetic) forest ». Le fait est donc vrai et sourçable ;
il est attribué à la mauvaise source.

## 3. Points contrôlés et jugés conformes malgré une suspicion initiale

Consignés parce qu'un auditeur suivant perdrait du temps à les rouvrir.

- **Absence de paire minimale moyen contre bas dans le dialogue.** Vérifiée
  syllabe par syllabe : les neuf syllabes moyennes et les onze basses du dialogue
  ne forment aucune paire. La réserve de la Méta est exacte, et le report des
  paires sur `u01-l1c` est justifié.
- **Arbitrage de ton sur อร่อย.** VOLUBILIS note bien `-a_røi`, donc moyen puis
  bas, là où le fichier enseigne bas puis bas. L'arbitrage hérité de `u04-l4b` en
  faveur du RID et de Wiktionary est correctement repris et correctement signalé.
  Le ton bas est le bon : อ est de classe moyenne, syllabe morte brève.
- **ที่ตลาด absent de VOLUBILIS.** Exact tel qu'écrit : aucune cellule ne contient
  cette graphie. La ligne 105836 existe bien avec la glose « au marché », mais sa
  cellule `THA` contient ตลาด, pas ที่ตลาด. La formulation du dossier est plus
  précise que ce que j'attendais.
- **Divergence de notation `/kʰaʔ˥˩/` contre `/kʰa˥˩/`.** Réelle dans le dépôt,
  correctement consignée, sans effet sur ce qui est enseigné.
- **Numéro de ligne VOLUBILIS de เท่าไร.** 7E cite 104152, `u03-l3c` cite 100805.
  J'ai vérifié : 104152 est le bon numéro sur l'exemplaire `.ods` dont l'empreinte
  est annoncée. L'écart vient du `.xlsx` employé ailleurs, ce que l'incertitude 7
  documente. 7E n'est pas en faute.
- **Aucun tiret cadratin ni demi-cadratin** dans le fichier, contrôle sur les
  102 359 caractères.

## 4. Verdict

**Statut `draft` maintenu, passage en `review` refusé.**

Six findings bloquants. Deux d'entre eux, B1 et B2, ne sont pas des erreurs de
détail : ils invalident la prémisse déclarée du fichier et le compte de son
contenu neuf, donc la Méta, le dossier de production, l'écartement de `reading`,
l'écartement de บ้าน et deux cartes SRS. Ils demandent une reprise éditoriale,
pas une correction ponctuelle, et cette reprise doit se faire après lecture de
7A à 7D, qui existent tous.

Les quatre autres, B3 à B6, sont corrigeables ligne par ligne : un champ
`longueur` à ramener à « NON ÉTABLIE » conformément à `u03-l3c`, deux références
à rectifier, quatre énoncés sur le français à reformuler et une incertitude à
cesser de certifier.

Il faut dire aussi ce que cet audit n'a pas trouvé, parce que la consigne était
de chercher : aucune graphie fausse, aucune séquence NFC fautive, aucun ton faux,
aucune case fausse dans la mécanique des deux marques de l'unité, aucun corrigé
faux, aucun distracteur juste, aucune référence inventée, et un dossier RID,
VOLUBILIS, Wiktionary et fréquence exact à quelques unités près sur plus de
cent cinquante relevés. Les erreurs de ce fichier sont des erreurs de contexte et
de certification, pas des erreurs de langue.

Revue native : en attente. Questions prioritaires à lui poser, inchangées :
incertitudes 3, 4 et 6 du dossier, plus la naturalité de วันนี้สบายดีไหมครับ.
