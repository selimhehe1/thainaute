# Vérification adversariale de `u13-l13e`

- Fichier audité : `content/authoring/unite-13/lecon-13e.md`
- Date : 2026-08-04
- Posture : audit adversarial. Objectif : trouver des erreurs, pas confirmer.
  Chaque affirmation de registre a été rejouée par l'auditeur avec
  `node scripts/verification/rid-entry.mjs`, corps de l'entrée lu, jamais
  présence seule. Chaque proposition de correction ci-dessous a elle-même été
  vérifiée contre le dépôt avant d'être écrite.
- Artefacts employés : `VOLUBILIS_Database.xlsx`
  (sha256 `b9ab7418…a20fc0c`, 114 579 lignes non vides, 586 541 chaînes
  partagées), `th_50k.txt` (sha256 `20e7052f…81b6083`, 50 000 lignes),
  en.wiktionary en rendu, RID 2554 via `func_lookup.php`.

## 1. Ce qui a été refait et qui tient

### 1.1 Les 17 corps d'entrée du dictionnaire normatif

Le tableau de dépouillement du dossier a été rejoué graphie par graphie. **Les
17 lectures sont exactes**, y compris les catégories, les vedettes homographes
et les exemples imprimés :

| Graphie                 | Rejoué par l'auditeur                                                                                                   | Verdict                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| นะ                      | 2 vedettes ; นะ ๑ ว., valeurs อ้อนวอน / บังคับ / เน้นให้หนักแน่น, exemples อยู่นะ et ไปละนะ ; นะ ๒ nom, formule magique | conforme, **aucune étiquette** |
| คะ                      | 2 vedettes ; คะ ๒ ว. donne DEUX emplois, le second après ซิ et นะ เพื่อแสดงความสุภาพ, exemples เชิญซิคะ et **ไปนะคะ**   | conforme                       |
| ครับ                    | vedette unique, `[คฺรับ]`, ว., คำรับหรือคำลงท้ายอย่างสุภาพที่ผู้ชายใช้                                                  | conforme                       |
| สิ                      | vedette unique, exemples **ไปสิ** et **มาสิ**, variantes ซิ ซิ่ ซี                                                      | conforme, **aucune étiquette** |
| เหรอ                    | vedette groupée « เหรอ, เหรอะ », **(ปาก)**, son écarté de หรือ                                                          | conforme                       |
| วะ                      | 2 vedettes ; วะ ๑ (๒) ว., ความคุ้นเคยเป็นกันเองหรือแสดงความไม่สุภาพ, exemple **ไปไหนวะ**                                | conforme                       |
| หรือ                    | vedette unique, สัน., 2 valeurs, exemple **ไปหรือ**                                                                     | conforme, aucune étiquette     |
| ค่ะ                     | vedette unique, exemples ไปค่ะ et ไม่ไปค่ะ                                                                              | conforme                       |
| ล่ะ                     | vedette unique, ว., ยืนยันให้มีน้ำหนักขึ้น                                                                              | conforme, aucune étiquette     |
| ละ                      | ละ ๑ (๔) ว., exemple **ไปละ**                                                                                           | conforme, écart légitime       |
| หรอ                     | `[หฺรอ]` **ก.**, สึกเข้าไป / กร่อนเข้าไป                                                                                | conforme, écart légitime       |
| มั้ย                    | aucune vedette, le service propose d'ajouter le mot                                                                     | conforme                       |
| จ๊ะ, จ้ะ, เถอะ, จ๋า, ฮะ | conformes (voir §2.12 pour จ๋า)                                                                                         | conformes                      |

**Décompte confirmé : 17 interrogées, 16 attestées, 1 sans vedette, et une
seule étiquette `(ปาก)`, sur เหรอ.** C'est le fait central du fichier et il
tient.

Aucune **sous-affirmation** n'a été trouvée : les entrées wiktionary de นะ, สิ
et หรือ ne portent aucun label d'usage, et leurs lignes VOLUBILIS (57471,
91851, 82378 et 82379) ne portent aucune marque `(inf.)`. Le refus d'affirmer
un registre pour ces trois graphies est un résultat de lecture, pas une lacune.

Le piège de référence `จ้า` n'a pas de jumeau non déclaré dans ce fichier : les
deux cas de graphie attestée pour autre chose (**หรอ**, verbe d'usure, et
**ละ**, quasi-homographe de ล่ะ) sont détectés, écartés et expliqués par le
fichier lui-même, page 8 et incertitude 2.

### 1.2 Frontière reconnaissance / production

Contrôle refait exercice par exercice. **Aucune forme étiquetée n'est mise en
production.** Les seules formes produites (exercices 3 et 4, carte
`srs-u13-l13e-02`) sont ไปครับ, ไปค่ะ, ไปนะครับ, ไปนะคะ, leurs formes niées, et
les blocs isolés ไป et นะ. สิ, เหรอ et วะ ne sont produits nulle part, ni en
exercice, ni en SRS, ni par le personnage-apprenant du dialogue.

La caractérisation de `13c` faite à la page 5 est **exacte** : la page 8 de
`13c` admet effectivement en production เอาสิครับ et ไม่รู้สิครับ seulement, et
laisse ไปสิ « à reconnaître seulement ». Son exercice 4 fait écrire `sì` en
transcription, mais `13c` distingue explicitement écrire une transcription et
parler à quelqu'un. 13E ne déforme pas sa voisine.

### 1.3 Mesures rejouées, toutes reproduites

- **Planchers** : `tmp-13e-planchers.mjs` réexécuté ; les 17 chiffres du
  fichier sont reproduits au chiffre près. Trois d'entre eux ont en outre été
  recalculés à la main par l'auditeur, sans le script : « carte la plus
  longue » 4 stricts + 2 ex aequo, « carte la plus courte » 1 strict + 5 ex
  aequo, « carte qui porte นะ » 1 strict + 2 ex aequo + 3 inapplicables. La
  binomiale de la position constante donne 0,386 % (fichier : 0,4 %) et celle
  du hasard uniforme de l'exercice 5 donne 0,0078 % (fichier : 0,0 %).
  **Aucun exercice n'est réussissable par une réponse constante.**
- **Fréquence** : les 21 rangs cités sont exacts, empreinte et nombre de lignes
  compris. ไปหรือ et ไปไหนวะ sont bien ABSENTS.
- **VOLUBILIS** : les 13 numéros de ligne cités sont exacts, ainsi que les 10
  recherches rendant ABSENT et la ligne 1870 `เอาชนะคะคาน` du balayage par
  sous-chaîne.
- **Unicode** : `unicode-thai.mjs` réexécuté. NFC conforme, aucune zone à usage
  privé, et **l'inventaire des douze signes non consonantiques est reproduit
  occurrence par occurrence** (U+0E31 12, U+0E34 13, U+0E35 3, U+0E36 3,
  U+0E37 4, U+0E38 5, U+0E39 5, U+0E3A 5, U+0E48 18, U+0E49 12, U+0E4A 1,
  U+0E4B 1). `item-fields-check.mjs` : 0 champ `codepoints` en faute.
- **Coordination** : `repo-thai-scan.mjs 13 13` rend bien 5 fichiers, 33
  entrées, 28 graphies distinctes ; la répartition 7 / 8 / 8 / 8 / 2 et les
  cinq collisions sont exactes ; เหรอ est bien absente des 33 champs `thai` ;
  นะ, เหรอ et วะ sont bien absentes des unités 1 à 12 et สิ n'y apparaît que
  dans les composés de สิบ. Les 14 cartes SRS de l'unité sont vérifiées.
- **Transcriptions** : `rǒee` et `rǔee` sont conformes à l'amendement v1.1
  (`oe` et `ue`, dernière lettre doublée pour la longue, ton sur la première
  lettre du noyau), et concordent avec /rɤː˩˩˦/ et /rɯː˩˩˦/.
- **Aucun tiret cadratin ni demi-cadratin** dans le fichier. **Aucune promesse
  de parler comme un natif.** Les affirmations sur le français restent du côté
  de l'observation vérifiable par l'apprenant (section 1 bis, voie 2) ; aucun
  absolu non sourcé n'a été trouvé.

**123 faits ont été confirmés par l'auditeur lui-même.**

## 2. Findings

### 2.1 BLOQUANT : `REG-NA-BANGKHAP` : « le dictionnaire les sépare » est faux

Ligne 644, pièges connus de l'exercice 2 :

> apparier นะ avec « on vous pousse », les deux valeurs étant proches en
> français **alors que le dictionnaire les sépare**

Le dictionnaire ne les sépare pas : il emploie **le même mot** pour les deux.

- นะ ๑ : « บอกความเป็นเชิงอ้อนวอน **บังคับ** หรือเน้นให้หนักแน่น »
- สิ : « โดยมากใช้กับกริยาเป็น**เชิงบังคับ** เชิงชวน หรือรับคำ »

Le fichier le sait : sa page 3 énumère elle-même les trois valeurs de นะ comme
« la prière, **l'injonction**, et l'appui ». L'exercice 2 impose ensuite une
bijection où นะ ↔ « en moins abrupte » et สิ ↔ « on vous pousse à le faire »,
compte faux un apprenant qui aurait retenu la valeur d'injonction lue à
l'entrée, et justifie ce comptage par une affirmation fausse sur la source.
Le même défaut atteint la paire 6 : ล่ะ est « ยืนยันให้มีน้ำหนักขึ้น », c'est-à-dire
la même valeur d'appui que le « เน้นให้หนักแน่น » de นะ, alors que les pièges
connus n'attribuent leur confusion qu'à la forme (« toutes deux brèves »).

Le champ `fr` de l'item 1 et le `litteral` de l'item 2 (« particule
d'adoucissement ») retiennent la seule lecture wiktionary et effacent la valeur
d'injonction du dictionnaire normatif. La page 3 affirme que « les deux se
rejoignent » alors que บังคับ et « moins abrupte » pointent en sens contraire.

Correction attendue : soit l'exercice 2 accepte les deux appariements et le dit,
soit ses libellés cessent d'être présentés comme des valeurs du dictionnaire.
Dans les deux cas, la phrase « alors que le dictionnaire les sépare » doit
disparaître. L'incertitude 4 anticipe le problème mais ne le résout pas.

### 2.2 BLOQUANT : `REG-FONDA-FAUX` : affirmation fausse sur le fondamental, à l'écran

Ligne 268, page 6 :

> Le fondamental ne vous a donné que des formes non étiquetées.

Faux, et vérifiable dans le dépôt :

- `u02-l2b` item 8, **หวัดดี**, champ `registre` : **familier**, avec la
  consigne « À ce stade, sachez la reconnaître ; ne la produisez pas » ;
- `u03-l3c`, **เท่าไหร่**, `registre` : **familier** ;
- trois autres items du fondamental portent `familier` (`u06-l6a`, `u07-l7d`,
  `u02-l2d`) ;
- et surtout **`u12-l12e` page 3**, que la Méta de 13E cite comme sa propre
  référence, écrit à l'apprenant, une leçon plus tôt : « **6 portent
  “familier”** », « 2 fiches seulement portent l'étiquette “formel” », et
  montre en spécimen หวัดดี « forme marquée “familier” en 2B ».

L'apprenant lit donc deux écrans contradictoires à une unité d'intervalle. La
phrase est un absolu non vérifié dans une page dont l'objet est précisément
l'étiquetage de registre. Reformulation possible et exacte : le fondamental ne
lui a donné aucune forme portant l'étiquette `(ปาก)` du dictionnaire normatif.

### 2.3 BLOQUANT : `REEMPLOI-LA` : ce que `u06-l6e` publie de ล่ะ n'est pas ce que 13E lui prête

Exercice 2, paire 6 :

> ล่ะ (lâ) ↔ « on appuie ce qui vient d'être dit ». **Item publié de
> `u06-l6e`**, redéclaré par `u13-l13c` item 3

`u06-l6e` item 1 publie exactement l'inverse d'une glose autonome. Son champ
`fr` est : « particule finale ; **enseignée ici uniquement comme dernière
syllabe du bloc** แล้วคุณล่ะ, c'est le bloc entier qui porte le sens “et
vous ?” ». Son `note_fr` écrit que la valeur d'insistance du dictionnaire
« n'est pas celle d'un renvoi vers l'interlocuteur » et qu'elle « est donc
enseignée là où elle est attestée, sur le bloc ». Sa carte `srs-u06-l6e-01`
précise : « La carte ne demande JAMAIS de produire ล่ะ seule **ni d'en
expliquer les autres emplois** ».

La glose « on appuie ce qui vient d'être dit » est celle de `u13-l13c` item 3,
qui l'a introduite après lecture du corps de l'entrée, en **déclarant son écart**
avec `u06-l6e`. 13E l'attribue à `u06-l6e`, qui ne la porte pas.

Conséquence mesurée : le plancher de l'exercice 2 repose sur une prémisse
fausse. « il verrouille les paires 1 et 6, publiées par `u01-l1e` et
`u06-l6e` » (ligne 625) est inexact ; un apprenant qui ne connaît que le
fondamental ne peut verrouiller que la paire 1, ce qui laisse une bijection de
cinq, soit 1 sur 120 et non 1 sur 24. L'erreur va dans le sens conservateur,
mais le chiffre publié comme « mesuré » ne l'est pas, et le script
`tmp-13e-planchers.mjs` code la même prémisse en dur.

### 2.4 BLOQUANT : `OUTIL-IFC` : le motif donné pour ne pas exécuter le contrôle de réemploi est faux

Ligne 1196 :

> ce script ne compare un item à sa leçon d'origine que si le TITRE de l'item
> porte une référence `uXX-lYz`, **or les deux titres de 13E n'en portent
> aucune, les deux items étant nouveaux**.

Deux erreurs dans une phrase.

1. Le titre de l'item 1 est « Item 1 : นะ (**REDÉCLARATION de `u13-l13b`
   item 1**) ». Il porte donc bien une référence.
2. « les deux items étant nouveaux » contredit le reste du fichier, qui répète
   que l'item 1 n'est PAS nouveau (« Deux items, dont UN SEUL est nouveau »).

Le vrai motif est un défaut de l'outil, et il est plus grave que celui qui est
écrit. Le script filtre par `/u(\d\d)-l(\d)([a-e])/`, qui n'accepte qu'un
**chiffre unique** pour le numéro de leçon. Vérifié :

```
u09-l9e  -> ["u09-l9e"]     u01-l1e  -> ["u01-l1e"]
u13-l13b -> []              u13-l13c -> []   u13-l13d -> []
u11-l11a -> []              u10-l10a -> []   u12-l12e -> []
```

**Aucune référence à une leçon des unités 10 à 17 n'est visible par
`item-fields-check.mjs`.** Le « 0 écart de réemploi » qu'il imprime sur 13E est
donc vide, comme le fichier le pressent, mais il l'est aussi sur `13b`, `13c` et
`13d`, et il le sera sur tout le parcours avancé. Le point doit être porté à
l'arbitrage comme un correctif d'outil (`l(\d{1,2})`), et non comme une
particularité de 13E.

### 2.5 BLOQUANT : `SRC-ARAI` : renvoi de réemploi qui ne résout pas

Ligne 1171, tableau des blocs réemployés :

> | อะไร | `u02-l2d` item 7 | `à·rai` |

`u02-l2d` **item 7 est มาจาก** (`maa·jàak`). อะไร est l'**item 6**. La
transcription `à·rai` est exacte, le renvoi ne l'est pas.

Ce n'est pas une coquille indifférente : ce tableau est présenté comme le
contrôle qui REMPLACE `item-fields-check.mjs` (« Chaque ligne a été relue dans
le fichier d'origine le 2026-08-04 », « 24 blocs comparés, 0 écart »). Une ligne
qui ne résout pas prouve que la relecture annoncée n'a pas été faite sur
l'ensemble des lignes. Les 22 autres lignes ont été rejouées par l'auditeur et
sont exactes.

### 2.6 Non bloquant : `TON-TIRAGE12` : le tirage 12 ne porte pas le contraste qu'on lui prête

Méta, ligne 114 :

> **Moyen contre bas** […] ไป est MOYEN, สิ est BASSE […] **Tirages 11 et 12**
> de l'exercice 1.

Le tirage 12 est « สิ, contre นะ et เหรอ », soit bas / haut / montant :
**aucun ton moyen n'y figure**. Le contraste moyen contre bas n'est porté que
par le tirage 11 (ป่า contre ปา et ปู). La ventilation de l'exercice 1 le dit
d'ailleurs correctement de son côté (« les tirages 9, 10 et 11 […] entretiennent
les deux contrastes »), et la section SRS aussi. Seule la Méta est fausse.

### 2.7 Non bloquant : `DIAL-COMPTE` : six ou sept répliques

Ligne 816 : « **Les six répliques** sont enregistrées par des voix
différentes ». Ligne 835 : « le mot ไป est dans **les sept répliques** ». Le
tableau en compte **sept**. C'est la contrainte de production qui est fausse, et
elle est déclarée « le cœur de la leçon » : une consigne d'enregistrement qui
annonce le mauvais nombre de pistes se transmet telle quelle à la session audio.

### 2.8 Non bloquant : `LONG-BREVE` : « brève » là où l'origine et le contrat disent « courte »

Item 2, ligne 447 : `longueur` : « pai brève (diphtongue /aj/) ; **ná brève** ;
khráp brève ; khá brève ».

- L'item 1 du **même fichier** écrit « courte » pour la même syllabe นะ.
- `u13-l13b` items 2 et 3 écrivent « ná courte ; khráp courte » et « ná
  courte ; khá courte ».
- `CONVENTIONS.md` énumère deux valeurs pour ce champ : **courte, longue**.

Le fichier écrit pourtant « les trois fiches concordent ». La divergence est
mineure sur le fond mais elle est silencieuse, et `item-fields-check.mjs` ne
peut pas la voir pour la raison du finding 2.4. « brève » vient de `u09-l9e`,
qui l'emploie pour ไป ; l'usage doit être unifié à la consolidation.

### 2.9 Non bloquant : `FR-REDECL` : le champ `fr` change dans une redéclaration, sans déclaration

L'item 1 se présente comme une redéclaration de `u13-l13b` item 1 et conclut
« Deux vérifications indépendantes du même jour, **zéro écart** ». Les six
champs de forme sont effectivement identiques, l'auditeur les a comparés. Mais
le champ `fr` diffère :

- 13E : « particule finale qui **adoucit ou qui appuie ce qui précède** »
- `13b` : « (aucune traduction française ; particule finale qui **adresse la
  phrase à l'interlocuteur**) »

L'énumération des six champs comparés rend la phrase littéralement défendable,
mais « zéro écart » sur une redéclaration donne une impression fausse. `13c`
item 3 fait mieux dans exactement la même situation : il déclare son écart de
`fr` avec `u06-l6e` en toutes lettres. Même traitement attendu ici, d'autant que
la divergence de `fr` recoupe le finding 2.1.

### 2.10 Non bloquant : `VOLUB-FR-WA` : la « base franco-thaïe » n'a pas de colonne française sur cette ligne

Page 7 : « La base franco-thaïe la rend par « **particule informelle et
impolie** », ce qui concorde. »

La ligne 107750 relue par l'auditeur ne porte **aucune colonne française** (G
absente). La formule citée est la traduction, par 13E, de la colonne **anglaise**
F : « [informal and impolite particle placed at the end of a phrase or sentence,
usually a question, to indicate familiarity] ». La note culturelle du même
fichier la cite correctement comme ENG. La page 7 doit faire de même : la source
n'apporte pas ici de pivot français, et le fichier est par ailleurs très
attentif à ce genre de nuance (il consigne le piège de glose « Hein ? (fam.) »
de la ligne 83139, que l'auditeur a vérifié et qui est exact).

### 2.11 Non bloquant : `INCERT-DOUBLON` : deux incertitudes numérotées 7

Les incertitudes de l'auteur vont 1, 2, 3, 4, 5, 6, **7, 7**. Les deux
dernières (« le récapitulatif d'une unité écrite en parallèle » et « le dialogue
place ไปสิ dans la bouche d'un habitué ») portent le même numéro. Le fichier
renvoie ailleurs à des incertitudes par leur numéro ; le doublon rend tout
renvoi à « l'incertitude 7 » ambigu.

### 2.12 Non bloquant : `INVENT-PRECISION` : trois inventaires arrondis

Trois relevés sont présentés comme des dépouillements exacts et ne le sont pas
tout à fait. Aucun ne change une conclusion.

- Arbitrage 2 : « `13a` publie ครับ, ค่ะ, คะ, ไหม, **สบายดีไหม**, **ไปครับ** et
  แล้วคุณล่ะ ». Les champs réels de `13a` sont `สบายดีไหมครับ / สบายดีไหมคะ` et
  `ไปครับ / ไปค่ะ`.
- Tableau de dépouillement : จ๋า est donné pour « deux vedettes » ; l'entrée
  rend **une** vedette à deux sens numérotés (๑) et (๒). Le fichier fait
  pourtant correctement la distinction ailleurs (หรือ, « vedette unique, deux
  valeurs »).
- Méta : l'objectif observable annonce huit formes « prises dans les DEUX seules
  déclinaisons » ; les tirages 7 et 8 de l'exercice 4 demandent `pai` et `ná`,
  qui sont des blocs isolés et non des déclinaisons.

## 3. Ce que le contre-audit externe doit encore attaquer

L'auditeur confirme les cinq priorités déjà listées par le fichier, et en
ajoute une : la question posée au finding 2.1 est un cas de test pour tout le
fil A. Si les libellés d'attitude d'un exercice d'association ne peuvent pas
être rendus mutuellement exclusifs par les seuls segments de valeur lus, alors
la mécanique `association` n'est pas le bon instrument pour mesurer ce que fait
une particule, et il vaut mieux le trancher à l'unité 13 qu'à l'unité 17.
