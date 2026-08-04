# Contre-audit adversarial de `u10-l10e` (« Une rue thaïe »)

- Fichier audité : `content/authoring/unite-10/lecon-10e.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent de contre-audit indépendant, consigne adversariale (chercher
  des erreurs, ne rien confirmer sur parole)
- Méthode : chaque fait a été RE-VÉRIFIÉ par l'auditeur, jamais lu et accepté.
  Scripts versionnés du dépôt, RID interrogé en direct, VOLUBILIS lu sur
  l'exemplaire authentifié par empreinte, en.wiktionary récupéré en rendu,
  fichiers Unicode 17.0 relus.
- Statut du fichier après audit : reste `draft`. Quatre findings BLOQUANTS.

## 1. Ce qui a été recomputé, et avec quoi

### 1.1 Scripts versionnés

```
node scripts/verification/repo-thai-scan.mjs --check-u07
node scripts/verification/repo-thai-scan.mjs 1 9
node scripts/verification/repo-thai-scan.mjs 10 10
node scripts/verification/repo-thai-scan.mjs 1 9 --stacked --pure
node scripts/verification/repo-thai-scan.mjs 1 9 --grep <graphie>   (12 fois)
node scripts/verification/item-fields-check.mjs content/authoring/unite-10/lecon-10e.md
node scripts/verification/item-fields-check.mjs --unite 10
node scripts/verification/item-fields-check.mjs --tout
node scripts/verification/item-fields-check.mjs content/authoring/unite-03/lecon-3b.md
node scripts/verification/rid-entry.mjs เปิด | ปิด | ตลาด | โรง | ร้าน | โรงเรียน | โรงแรม
node scripts/verification/rid-lookup.mjs  (21 graphies)
node scripts/verification/volubilis-lookup.mjs <xlsx> <graphie>
```

Une variante d'audit de `volubilis-lookup.mjs` a été employée pour lire au-delà
de la 5e ligne (limite réelle du script versionné, déjà signalée par l'auteur à
son arbitrage 1). La variante ne change QUE la limite d'affichage ; les cinq
premiers numéros de ligne coïncident avec la sortie du script versionné, ce qui
la valide.

### 1.2 Exemplaires employés

| Artefact                             | Octets     | SHA-256                            |
| ------------------------------------ | ---------- | ---------------------------------- |
| `VOLUBILIS_Database.xlsx`            | 10 848 409 | `b9ab7418…a20fc0c` (conforme)      |
| `Appendix:Thai script` (action=raw)  | 16 236     | `c9776c6a…624690f3` (conforme)     |
| `UnicodeData.txt` (UCD 17.0.0)       | 2 198 209  | ReadMe : Version 17.0.0 (conforme) |
| `IndicPositionalCategory-17.0.0.txt` | 52 257     | conforme                           |

L'empreinte VOLUBILIS et l'empreinte de l'annexe annoncées par le dossier sont
EXACTES, octet pour octet. L'annexe est bien identique à celle de `u09-l9a`.

## 2. Résultat global

**78 faits distincts ont été re-vérifiés par l'auditeur et confirmés.**
**12 findings sont ouverts, dont 4 BLOQUANTS.**

Le dossier de production de cette leçon est, sur sa partie mécanique, d'une
solidité inhabituelle : les onze décomptes internes, les cinq planchers
d'exercice, les douze séquences NFC, les quatre séquences de nombres, les
numéros de ligne VOLUBILIS, les décomptes de ลูกคำ du RID et les empreintes de
fichier sont tous EXACTS. Les erreurs trouvées ne sont pas là. Elles sont dans
ce que la leçon DIT à l'apprenant et dans deux citations de source.

### 2.1 Décomptes recomputés, tous conformes

| Chiffre annoncé par la leçon                         | Recompté | Verdict |
| ---------------------------------------------------- | -------- | ------- |
| `--check-u07` passe, dix sur dix                     | oui      | exact   |
| `1 9` : 45 fichiers, 429 entrées, 317 graphies       | idem     | exact   |
| `10 10` : 5 fichiers, 32 entrées, 31 graphies        | idem     | exact   |
| 10E contribue 0 entrée à `## Items`                  | 0        | exact   |
| `--stacked --pure` 1 à 9 : 46 graphies, profondeur 2 | idem     | exact   |
| `item-fields-check` sur 10E : 0 faute, 0 écart       | idem     | exact   |
| `item-fields-check --tout` : 50 / 13 / 38            | idem     | exact   |
| 11 graphies de l'unité 10 publiées en fait par 1 à 9 | 11       | exact   |
| ราคา publié par 10C ET 10D                           | oui      | exact   |
| `u03-l3b` item 8 : `codepoints` non conforme         | oui      | exact   |
| เปิด et ปิด : 0 occurrence dans les unités 1 à 9     | 0        | exact   |

Les dix graphies réemployées et leur première publication ont été retrouvées une
par une par `--grep`, avec les mêmes effectifs que ceux du dossier : ตลาด 5
(`u05-l5d`), ห้องน้ำ 3 (`u05-l5c`), ร้านขายยา 2 (`u09-l9d`), โรงพยาบาล 1
(`u09-l9a`), รถเมล์ 1 (`u05-l5d`), ข้าวผัด 4 (`u04-l4c`), ไข่ 2 (`u03-l3e`), น้ำ 7
(`u02-l2c`), บาท 7 (`u03-l3c`), เสื้อ 2 (`u08-l8a`).

### 2.2 Priorité 1, les réemplois : rien de divergent sur les champs comparés

`item-fields-check.mjs` compare `ipa`, `ton`, `longueur`, `transcription` et
`codepoints` des douze blocs réemployés contre la leçon qui les publie. Résultat
recomputé : **0 champ `codepoints` en faute, 0 écart de réemploi**, sur les douze
blocs, y compris ceux de เปิด et ปิด repris de `u10-l10b`.

L'auditeur a poussé la comparaison AU-DELÀ des cinq champs du script, sur `fr`,
`litteral` et `registre`. Les valeurs présentes sont toutes identiques à celles
de la leçon d'origine. Ce qui apparaît est une OMISSION, pas une divergence :
voir le finding N3.

### 2.3 Priorité 2, les spécimens : contrainte tenue

Les huit supports sont déclarés construits en Méta, à la page 1, en tête de
`## Spécimens construits` et à la page 13. Chaque support porte en outre la
mention `Construit.` dans son bloc. Aucune enseigne, aucun nom de commerce,
aucun nom de rue, aucun nom de station. Les quatre montants sont déclarés
« chiffres de lecture » et deux d'entre eux sont des reprises littérales de
montants du dépôt, ce qui a été vérifié : ๔๐ correspond au สี่สิบบาท de
`u07-l7e` (réponse à ข้าวผัดเท่าไรครับ) et ๙๐ au เก้าสิบบาท de `u08-l8e`
(réponse à ตัวนี้เท่าไรครับ, spécimen affiché ligne 212 de `lecon-8e.md`). ๑๕
correspond au bloc สิบห้าบาท de `u03-l3c`.

**Aucun finding de priorité 2.** C'est le point le mieux tenu du fichier.

### 2.4 Priorité 3, fréquence d'affichage : un finding bloquant

Voir B2.

### 2.5 Planchers d'exercice, tous recalculés à la main

| Exercice | Plancher annoncé                                    | Recalcul auditeur                      | Verdict |
| -------- | --------------------------------------------------- | -------------------------------------- | ------- |
| 1        | constante 1/8 ; hasard 0,038 %                      | 8·(3/4)/4⁷ + 1/4⁸ = 0,03815 %          | exact   |
| 1        | « l'hôpital » 5 fois sur 32 ; somme 4+4+4+4+4+5+4+3 | recompté depuis la liste des tirages   | exact   |
| 2        | 1 paire en moyenne ; 1/720 = 0,139 %                | dérangements, 1/6! = 0,1389 %          | exact   |
| 3        | constante 1/8 ; hasard 0,00034 %                    | 8·(7/8)/8⁷ + 1/8⁸ = 0,00034 %          | exact   |
| 4        | pas de plancher ; constante ≤ 1/6                   | saisie libre                           | exact   |
| 5        | hasard 0,031 %                                      | 770/2 488 320 + 1/2 488 320 = 0,0310 % | exact   |
| 5        | heuristique ครับ final 1,5 %                        | 131/8640 = 1,516 %                     | exact   |

**Aucun exercice n'est réussissable par une réponse constante.** Le seuil le plus
haut atteignable par une constante est 1 sur 8 (12,5 %) aux exercices 1 et 3,
1 sur 6 (16,7 %) à l'exercice 4, et l'exercice 2 est structurellement immunisé
par sa bijection. Ce critère est TENU. Une faiblesse résiduelle de l'exercice 3
est traitée au finding N1, mais elle ne relève pas de la réponse constante.

### 2.6 Sources primaires re-consultées

**RID 2554**, une requête POST par graphie, 21 graphies. Relevé auditeur :
19 attestées comme vedettes, 2 absentes (ร้านขายยา, น้ำเปล่า). Conforme au
dossier. อักษรนำ et พยัญชนะต้น rendent `absent`, conforme.

- เปิด : vedette unique, trois sens numérotés, le (๑) portant `ตรงข้ามกับ ปิด`,
  le (๓) étiqueté `(ปาก)`. Aucune lecture entre crochets. **Bloc ลูกคำ recompté :
  19 composés**, เปิดหัว comptant bien pour deux vedettes numérotées. Exact.
- ปิด : vedette unique, trois sens, le (๓) `โดยปริยายหมายความว่า หยุด` dont le
  premier exemple est bien `โรงเรียนปิด`. Aucune lecture entre crochets, aucune
  étiquette de registre. **Bloc ลูกคำ recompté : 17 composés.** Exact.
- ตลาด : lecture `[ตะหฺลาด]`, séquence rendue par le script
  `U+0E15 U+0E30 U+0E2B U+0E3A U+0E25 U+0E32 U+0E14`. Identique au caractère près
  à ce que le spécimen 1 cite. Exact.
- โรง : sens nominal unique conforme, exemples โรงรถ et โรงพิมพ์ présents,
  mention de classificateur présente, **bloc ลูกคำ recompté : 28 composés**,
  portant โรงพยาบาล, โรงเรียน et โรงแรม. Exact.
- ร้าน : « plateforme surélevée … lieu où l'on vend » conforme, **bloc ลูกคำ
  recompté : 3 composés** (ร้านชำ, ร้านม้า, ร้านรวง). Exact.
- โรงเรียน et โรงแรม : les deux portent bien `แม่คำ = โรง`. Gloses conformes.

**VOLUBILIS v26.2**, exemplaire authentifié avant citation. Feuille unique
`Volubilis`, 114 579 lignes non vides, 586 541 chaînes partagées : conforme.
Numéros de ligne recomputés un par un, tous exacts : เปิด 77221 à 77225 (77225
`adj.` « ouvert »), ปิด 75953 à 75958 (75958 `adj.` « fermé ; clos ») plus
110885 hors sujet, ร้านขายยา 81352, ห้องน้ำ 16245, รถเมล์ 84669, ตลาด 96552 et
102433, โรง 83823 et 83824, โรงเรียน 84108, โรงแรม 84051, ร้าน 81048, ขาย 29410.
La limite d'affichage à cinq lignes du script versionné est réelle, et la ligne
75958 est bien au-delà : l'arbitrage 1 du dossier est fondé.

**en.wiktionary**, récupéré en rendu par l'auditeur le 2026-08-04. Toutes les
prononciations citées sont exactes : เปิด /pɤːt̚˨˩/ Paiboon `bpə̀ət` RI `poet`
avec section Verb ET section Adjective ; ปิด /pit̚˨˩/ `bpìt` `pit` SANS section
Adjective, avec le sens « to be out of action; to stop work » ; ตลาด Phonemic
`ตะ-หฺลาด` et IPA /ta˨˩.laːt̚˨˩/ ; ห้องน้ำ /hɔŋ˥˩.naːm˦˥/, la page portant en outre
la mention `{Unorthographical; Short}` qui corrobore le champ « hâwng brève » ;
โรงพยาบาล /roːŋ˧.pʰa˦˥.jaː˧.baːn˧/ ; รถเมล์ /rot̚˦˥.meː˧/ ; เสื้อ /sɯa̯˥˩/ ;
ร้านขายยา /raːn˦˥.kʰaːj˩˩˦.jaː˧/ ; ร้าน /raːn˦˥/ et ขาย /kʰaːj˩˩˦/, les deux
portant bien ร้านขายยา dans leur liste de dérivés ; โรง /roːŋ˧/ « building or
structure, especially one roofed or canopied » ; les deux étymologies
« From โรง (roong, building) + เรียน (riian, to learn) » et « + แรม (rɛɛm, to
stay overnight) » sont présentes en toutes lettres. Une seule citation est
fausse : voir B4.

Annexe `Appendix:Thai script`, lignes citées vérifiées : ligne 54 = ด
(`Royal Thai Final` t, `IPA Final` t, initiale d, classe mid), ligne 68 = ป
(p / p, classe mid), ligne 174 = le graphème `เ◌ิ◌` sous le nom `sara oe` avec
IPA `ɤ` sans marque d'allongement. La ligne 148, que le dossier ne cite pas,
donne `◌ิ` sous le nom `sara i` avec IPA `i` : c'est elle qui fonde le finding B1.

**Unicode 17.0.** Les douze séquences NFC du tableau sont exactes et NFC-stables.
Les quatre nombres aussi. U+0E33 est bien `Lo` avec `<compat> 0E4D 0E32` que NFC
ne défait pas. U+0E37 porte la classe combinatoire 0 et U+0E49 la classe 107.
`IndicPositionalCategory-17.0.0.txt` porte bien `0E40..0E44 ; Visual_Order_Left`
à sa ligne 384, sous le titre de section `# Indic_Positional_Category=Visual_Order_Left`
de la ligne 374 ; `PropList-17.0.0.txt` porte bien `0E40..0E44 ;
Logical_Order_Exception` et NE contient PAS la chaîne `Visual_Order_Left`. La
mise en garde du dossier contre une passe de remplacement est donc justifiée.
Le fichier ne contient aucun caractère de la zone à usage privé et aucun tiret
cadratin ou demi-cadratin (contrôle exécuté, 0 occurrence).

## 3. Findings

### B1. BLOQUANT. Le contraste เปิด / ปิด est enseigné comme une différence de DURÉE, alors que ce sont deux voyelles de qualité différente

**Où.** Page 6 et exercice 3.

> Page 6 : « Une seule chose les sépare, et c'est la voyelle. Dans le premier,
> elle s'écrit en deux morceaux […] elle est longue. Dans le second, il ne reste
> que le ◌ิ ; elle est brève. »

> Exercice 3, feedback correct des tirages 3 et 4 : « Oui. La différence est dans
> la voyelle : **la première dure, la seconde est brève.** Le ton, lui, est le
> même. »

**Pourquoi c'est faux.** เปิด porte /ɤː/ (`sara oe`, annexe ligne 174) et ปิด
porte /i/ (`sara i`, annexe ligne 148). Ce sont deux PHONÈMES DISTINCTS, pas la
forme longue et la forme brève d'une même voyelle. Les deux entrées de mot le
confirment : /pɤːt̚˨˩/ contre /pit̚˨˩/. Le retrait du เ ne raccourcit pas
`sara oe`, il change de voyelle. Un apprenant à qui l'on dit que la différence
audible est la durée cherchera un indice de durée dans un contraste qui est
d'abord un contraste de timbre.

**Aggravant : la leçon qui PUBLIE ces deux mots l'écrit correctement.**
`lecon-10b.md`, page 8 : « เปิด porte un `oee` long, celui de เธอ et de เจอ, et
ปิด un `i` bref. Le contraste est donc facile à entendre et difficile à voir. »
10E réemploie les deux items sans divergence de champ, mais elle en donne à
l'apprenant une description INCOMPATIBLE avec celle de 10B. C'est une divergence
de réemploi qui échappe à `item-fields-check.mjs` parce qu'elle ne porte pas sur
un champ, mais sur le texte enseigné.

**Aggravant 2 : le fichier se contredit.** L'exercice 4 dit juste, lui :
« `oee` long contre `i` bref ». L'exercice 3 et la page 6 disent autre chose.

**Ce que l'exercice 3 mesure en réalité.** Il fait reposer un exercice d'écoute
sur un indice mal nommé, et l'incertitude 6 demande d'ailleurs à la production
audio de vérifier que les deux mots « sont distincts par la SEULE voyelle » sans
jamais dire laquelle.

**Correction attendue.** Nommer les deux voyelles partout où le contraste est
expliqué, comme le fait l'exercice 4 et comme le fait 10B. La durée peut être
mentionnée en second, jamais seule.

### B2. BLOQUANT. Affirmation de fréquence d'affichage non sourcée, contredite par le fichier lui-même

**Où.** Note culturelle, première phrase, et page 2.

> Note culturelle : « **Un mot long, sur un panneau, est souvent un mot court
> plus une fonction.** »

> Page 2 : « … avec un temps de plus parce qu'**un support porte souvent
> plusieurs mots**. »

**Pourquoi c'est bloquant.** Les deux phrases affirment une fréquence de ce
qu'on rencontre sur des supports réels. Aucune source recevable de
`docs/content-policy/sources-verification.md` ne mesure cela, et le dossier de
la note ne cite rien de tel : ses sources établissent que โรง et ร้าน sont des
`แม่คำ` du dictionnaire et des têtes de composés, ce qui est un fait de
lexicographie, pas un fait d'affichage.

**Aggravant : le fichier se contredit à quinze lignes d'intervalle.** Le même
bloc écrit ensuite : « **Ce que la note n'affirme PAS.** Elle ne dit rien de la
fréquence de ces mots sur des supports réels, aucune source recevable ne mesurant
cela ». La note affirme donc précisément ce qu'elle déclare ne pas affirmer.

**Aggravant 2.** La phrase de la page 2 n'est même pas vraie des supports du
jour : six des huit supports construits portent un seul mot.

**Correction attendue.** Reformuler sans fréquence : « Un mot thaï long est
souvent formé d'un mot court plus une fonction » est déjà une généralisation à
éviter ; « โรง et ร้าน servent de tête à des mots plus longs, et le dictionnaire
les range comme tels » est sourcé et suffit. Supprimer « sur un panneau » et
« un support porte souvent plusieurs mots », ou les remplacer par une
formulation portant sur la leçon (« un support peut porter plusieurs mots, et
deux des huit d'aujourd'hui en portent »).

### B3. BLOQUANT. Deux faits enseignés reposent sur une source unique, et le dossier fait dire au RID plus qu'il ne dit

**Où.** Note culturelle, texte apprenant et bloc de sources.

> Texte apprenant : « Le premier est bâti sur **เรียน, apprendre** ; le second sur
> **แรม, passer la nuit**. »

> Sources : « en.wiktionary, entrées « โรงเรียน » et « โรงแรม » […] **Deux
> autorités indépendantes, même analyse.** »

**Ce que les sources disent réellement**, relevé par l'auditeur le 2026-08-04 :

- RID, entrée โรงเรียน : `น. สถานศึกษา.` puis `แม่คำของ "โรงเรียน" คือ โรง`.
- RID, entrée โรงแรม : `น. ที่พักคนเดินทางซึ่งต้องเสียค่าพักแรมด้วย.` puis
  `แม่คำของ "โรงแรม" คือ โรง`.
- en.wiktionary, โรงเรียน : « From โรง (roong, building) + เรียน (riian, to
  learn) ». โรงแรม : « From โรง (roong, building) + แรม (rɛɛm, to stay
  overnight) ».
- VOLUBILIS : lignes 83823, 84108, 84051, qui glosent โรง, โรงเรียน et โรงแรม.
  Le dossier reconnaît lui-même que c'est une corroboration de sens et non une
  autorité sur la composition.

Le RID établit donc le RATTACHEMENT du composé à la tête โรง. Il n'établit ni la
décomposition en deux morceaux, ni le sens de เรียน, ni le sens de แรม. **Les
gloses « apprendre » et « passer la nuit », qui sont affichées à l'apprenant, ne
tiennent que sur en.wiktionary.** La politique de sources l'interdit
explicitement : Wiktionary est « AUTORISÉE pour recoupement ; jamais en source
unique ». Et la phrase « Deux autorités indépendantes, même analyse » attribue au
RID une analyse qu'il ne porte pas.

**Ce n'est pas un doute sur le fond** : เรียน et แรม sont bien des vedettes du
RID et les gloses sont justes. C'est un défaut de dossier, donc réparable en
quelques minutes.

**Correction attendue.** Interroger `rid-entry.mjs เรียน` et `rid-entry.mjs แรม`,
citer les deux entrées, et corriger la phrase de synthèse : le RID atteste la
tête et les composants, Wiktionary atteste la décomposition.

### B4. BLOQUANT. Citation fausse d'en.wiktionary au bloc ปิด

**Où.** Spécimen 3, bloc réemployé ปิด, ligne de sources en.wiktionary.

> « **Antonyme donné à trois reprises : เปิด.** »

**Relevé auditeur** sur `https://en.wiktionary.org/wiki/ปิด?action=render`,
2026-08-04. La section Verb donne เปิด comme antonyme **cinq fois** :

```
to close                              Antonym: เปิด (bpə̀ət)
to block; to stop                     Antonym: เปิด (bpə̀ət)
to be out of action; to stop work     Antonym: เปิด (bpə̀ət)
to turn off                           Antonym: เปิด (bpə̀ət)
to hide; to conceal                   Antonyms: เปิด (bpə̀ət), เผย (pə̌əi)
```

Le chiffre est donc faux. Il est de la même famille que le « 19 au lieu de 46 »
que l'auteur déclare avoir corrigé lui-même à la section Unicode : un décompte
fait à l'œil et non depuis la sortie complète. Le fait de fond, l'antonymie, est
correct et abondamment attesté ; c'est la citation qui est fausse, et le dossier
lui-même pose la règle qu'un décompte cité est produit mécaniquement.

**Correction attendue.** Remplacer par « à cinq reprises », ou par une formule
qui ne compte pas.

### N1. Exercice 3 : « aucune réponse ne se déduit des précédentes » est faux

> « **Une même carte peut être désignée plusieurs fois** : l'exercice n'impose
> pas de bijection, précisément pour qu'un apprenant ne puisse pas terminer par
> élimination. »
> « Chaque carte est la bonne réponse exactement une fois. »
> « Et comme les répétitions sont autorisées, aucune réponse ne se déduit des
> précédentes : la huitième question reste une question. »

L'autorisation de répéter porte sur la SAISIE, pas sur le CORRIGÉ. Le corrigé,
lui, est une bijection : huit cartes, huit tirages, chaque carte correcte
exactement une fois. Comme l'exercice donne un retour immédiat à chaque tirage,
un apprenant qui a répondu juste sept fois connaît la huitième réponse sans
écouter. La mesure anti-élimination annoncée ne produit pas l'effet annoncé.

Effet borné, ce qui explique le classement non bloquant : le gain maximal est
d'UN tirage, et il faut déjà 6 tirages justes sur les 7 premiers pour atteindre
le seuil de 7 sur 8. Le plancher de réponse constante reste 1 sur 8.

**Correction proposée.** Soit retirer la phrase et assumer le dernier tirage
déductible, soit casser la bijection du corrigé (par exemple neuf tirages sur
huit cartes, une carte correcte deux fois), soit ne révéler la correction qu'à
la fin.

### N2. Le tableau de couverture surestime ce que l'exercice 2 mesure

Le tableau écrit `tout` dans la colonne Ex. 2 pour les spécimens 7 et 8, et la
note sous le tableau ajoute : « Le spécimen 7 n'entre pas dans l'exercice 1 parce
que sa réponse ne serait pas un sens mais un montant, **ce que l'exercice 2
mesure mieux.** »

Or l'exercice 2 déclare lui-même écarter ๐, ๑, ๔ et ๖. Les chiffres réellement
affichés par les spécimens 7 et 8 sont ๔๐, ๑๕, ๑๐ et ๙๐, soit les tokens
๔ ๐ ๑ ๕ ๑ ๐ ๙ ๐. **Cinq des huit tokens affichés sont écartés du tirage** et
aucun nombre à deux chiffres n'est présenté. L'exercice 2 mesure six chiffres
isolés, pas la lecture d'un montant. L'exercice 2 le sait d'ailleurs : ses pièges
connus mentionnent « lire un nombre à deux chiffres de droite à gauche, erreur
qui ne peut pas se produire ici mais qui guette au spécimen 7 ».

Conséquence : la lecture d'un prix, que les pages 10 et 11 enseignent et que
l'objectif ne mentionne pas, n'est mesurée par AUCUN exercice.

**Correction proposée.** Remplacer `tout` par la mention des seuls ๕ et ๙, et
soit ajouter un tirage de nombre à deux chiffres, soit déclarer explicitement
que la lecture d'un montant n'est pas mesurée par cette leçon.

### N3. Les blocs réemployés ne donnent pas tous les champs de la leçon qui les publie

> « Chaque bloc réemployé donne les champs de la leçon qui le publie, **copiés à
> l'identique** de sorte que `item-fields-check.mjs` puisse les comparer. »

Comparaison auditeur, champ par champ, sur `codepoints`, `ipa`, `ton`,
`longueur`, `fr`, `litteral`, `transcription` et `registre` :

- `registre` est ABSENT de dix blocs sur douze (tous sauf เปิด et ปิด), alors
  que la leçon d'origine le publie : `neutre` pour ตลาด, ห้องน้ำ, ร้านขายยา,
  โรงพยาบาล, รถเมล์, ข้าวผัด, ไข่, น้ำ, บาท et เสื้อ ;
- `litteral` est ABSENT de quatre blocs qui en ont un à l'origine : ห้องน้ำ
  (« pièce (ห้อง) d'eau (น้ำ) »), ร้านขายยา (« boutique vendre médicament »),
  รถเมล์ (« véhicule de service régulier »), ข้าวผัด (« riz, sauté »).

Aucune VALEUR n'est divergente : ce sont des omissions, ce qui explique le
classement non bloquant, et `item-fields-check.mjs` ne les voit pas parce qu'il
ne compare pas ces deux champs. Mais la phrase citée est plus large que ce que le
fichier fait, et la leçon cite `litteral` de `u09-l9d` dans sa note culturelle
tout en l'omettant du bloc.

**Correction proposée.** Soit compléter les douze blocs, soit écrire « donne les
cinq champs que `item-fields-check.mjs` compare ».

### N4. La Méta décrit mal ce que publie 10C

> « `lecon-10c.md`, « Lire un menu », publie หมู, ราคา et อาหาร, et **reliste
> ข้าวผัด, ข้าวผัดหมู, ข้าวผัดไก่, บาท et ห้าสิบบาท** »

Relevé auditeur dans `lecon-10c.md` : les items 5 et 6 sont intitulés
`ข้าวผัดหมู (BLOC, …)` et `ข้าวผัดไก่ (BLOC, …)`. Ce sont des graphies NEUVES,
absentes des unités 1 à 9 (vérifié par balayage). 10C publie donc cinq graphies
neuves et n'en reliste que trois : ข้าวผัด, บาท et ห้าสิบบาท.

Le même fichier l'écrit correctement ailleurs, à son arbitrage 7 : « 10A place
huit réemplois dans `## Items`, **10C en place trois** ». Les deux passages se
contredisent. Le chiffre de l'arbitrage 7 est le bon, et le total de onze
graphies mal attribuées est exact.

### N5. Page 3 : la réécriture du dictionnaire n'ajoute pas qu'un ะ

> « ตลาด s'écrit avec quatre lettres et se dit en deux syllabes. Le dictionnaire
> le réécrit lui-même ตะหฺลาด pour donner sa lecture, **en ajoutant un ะ qui
> n'est pas écrit.** »

La réécriture du RID passe de quatre codes à sept :
`U+0E15 U+0E25 U+0E32 U+0E14` devient
`U+0E15 U+0E30 U+0E2B U+0E3A U+0E25 U+0E32 U+0E14`. Trois caractères sont
ajoutés : ะ, **ห** et le พินทุ **◌ฺ**. Le spécimen 1 du dossier donne d'ailleurs
la séquence complète et exacte.

L'apprenant voit donc à l'écran un ห qu'on ne lui explique pas, et c'est
précisément ce ห qui commande le ton bas de la seconde syllabe, ton que la leçon
lui donne ensuite comme un cadeau. La phrase est incomplète au point d'être
trompeuse.

**Correction proposée.** « … en ajoutant trois signes que le mot n'écrit pas, un
ะ, un ห et un point souscrit. Ce que fait ce ห relève d'un mécanisme que le
parcours n'a pas ouvert. »

### N6. « Cinq des douze graphies » : quatre au niveau du mot

> Méta : « la règle du ton se lit sur la consonne INITIALE, jamais sur « la
> première lettre » du mot. **Les deux ne coïncident pas dans cinq des douze
> graphies affichées aujourd'hui** ».

Quatre graphies commencent par une voyelle préposée : เปิด, โรงพยาบาล, ไข่ et
เสื้อ. Pour la cinquième, รถเมล์, la première lettre du mot EST la consonne
initiale de la première syllabe ; le cas n'apparaît que dans la seconde syllabe.

Le dossier l'écrit correctement à deux autres endroits (« quatre commencent […]
une cinquième en contient une sans commencer par elle ») et l'exercice 1 emploie
la formule prudente (« … ou dont une syllabe est dans ce cas »). Seule la Méta
compte cinq sans le qualificatif.

### N7. Comptages de lettres à l'écran, incohérents d'une page à l'autre

- Page 5, ห้องน้ำ : « **Sept lettres**, deux mots collés, et **deux marques de
  ton** posées au-dessus. » Le mot compte sept CODES, dont cinq lettres
  (ห อ ง น ำ) et deux marques. Annoncer sept lettres PUIS deux marques suggère
  neuf caractères.
- Page 7, ร้านขายยา : « **Neuf lettres**, trois syllabes ». Neuf codes, dont huit
  lettres et un ไม้โท.
- Pages 4, 6, 8, 9 : le mot « lettres » y désigne aussi les codes, sans marque de
  ton en jeu, donc sans ambiguïté.

Ce n'est pas une faute de fait, c'est un flottement de vocabulaire dans du texte
que l'apprenant lit en comptant. À trancher une fois pour tout le parcours.

### N8. « Calque du français » n'est pas justifié à l'exercice 5

> Pièges connus, tirage 2 : « placer le compteur จาน **avant** le nombre สอง au
> tirage 2, **calque du français** ».

L'ordre correct est ข้าวผัด + สอง + จาน. L'erreur décrite produit
ข้าวผัด + จาน + สอง, c'est-à-dire nom, classificateur, nombre. Le français place
le nombre AVANT le nom (« deux assiettes de riz sauté ») : l'ordre fautif décrit
n'est le calque d'aucun ordre français.

La section 1 bis de la politique de sources n'admet un fait sur le français que
sourcé, ou reformulé en observation vérifiable par l'apprenant. Cette phrase
n'est ni l'un ni l'autre. Elle est en outre dans une métadonnée de conception,
donc facile à corriger sans toucher au texte d'écran.

**Correction proposée.** Nommer l'erreur sans l'expliquer par le français, ou la
rattacher au vrai piège, qui est l'ordre nombre puis classificateur, inconnu du
français parce que le français n'a pas de classificateur obligatoire.

## 4. Ce que l'auditeur a cherché et n'a PAS trouvé

Ces points ont été attaqués et sont tenus. Ils sont consignés pour qu'un
troisième relecteur ne recommence pas.

1. **Graphies.** Les douze séquences NFC sont exactes et stables ; les quatre
   nombres aussi ; aucune graphie n'est fausse, aucune n'est hors NFC.
2. **Tons et longueurs.** Les douze blocs portent les valeurs de leur leçon
   d'origine sans un écart, et ces valeurs concordent avec l'IPA de Wiktionary
   mot par mot, y compris le cas contre-intuitif de ห้องน้ำ, dont la première
   syllabe est brève et que Wiktionary marque explicitement `Short`.
3. **Réemplois.** 0 écart sur les cinq champs comparés par le script, 0 écart de
   valeur sur les huit champs comparés par l'auditeur.
4. **Spécimens.** Aucune enseigne, aucun nom de commerce, aucun nom de rue ou de
   station, aucun prix présenté comme relevé. Déclaration quadruple vérifiée.
5. **Décomptes.** Onze décomptes internes recomputés, tous exacts, y compris les
   46 graphies empilées et les 28 / 19 / 17 / 3 ลูกคำ.
6. **Planchers.** Les sept valeurs de probabilité sont exactes au chiffre près,
   y compris le 1,5 % de l'heuristique ครับ, qui est le calcul le plus délicat du
   fichier.
7. **Renvois de parcours.** La page 14 de 9A est bien un geste en trois temps ;
   la page 6 de 4A énonce bien la préposition de เ, แ, โ, ใ, ไ et la règle du ton
   sur la classe de l'initiale ; `srs-u09-l9a-04` interdit bien l'écriture de
   mémoire de โรงพยาบาล ; `srs-u07-l7a-03` et `srs-u04-l4a-06` existent ; les
   quatre blocs de l'exercice 5 sont bien publiés par 9D, 4C, 8E et 5D ; les cinq
   ossatures du dialogue sont bien attestées dans le dépôt.
8. **Fil des tons.** L'attribution unité 4 pour montant contre haut et unité 7
   pour moyen contre bas est conforme à `CONVENTIONS.md`, et la leçon n'en
   déclare aucun acquis.
9. **Attribution de เปิด et ปิด.** La correction annoncée a bien été exécutée :
   `repo-thai-scan.mjs 10 10` ne compte aucune entrée au crédit de 10E.
10. **Honnêteté du dossier.** Les limites qu'il déclare sont réelles et vérifiées
    (limite d'affichage de `volubilis-lookup.mjs`, non-conformité du champ
    `codepoints` de `u03-l3b` item 8, collision ราคา entre 10C et 10D, onze
    graphies mal attribuées dans l'unité). Aucun de ces signalements n'est un
    faux-semblant.

## 5. Verdict

- **4 findings BLOQUANTS** : B1 (contraste เปิด / ปิด enseigné comme une
  différence de durée), B2 (fréquence d'affichage non sourcée et
  auto-contredite), B3 (gloses de เรียน et แรม mono-sourcées, RID sur-cité),
  B4 (« trois reprises » au lieu de cinq).
- **8 findings non bloquants** : N1 à N8.
- **78 faits re-vérifiés et confirmés par l'auditeur.**

B1 est le finding le plus lourd, parce qu'il touche le cœur pédagogique de la
leçon, qu'il contredit la leçon qui publie les deux items, et qu'un exercice
d'écoute entier repose dessus. B3 et B4 sont des défauts de dossier réparables
sans toucher au contenu. B2 demande deux reformulations.

Aucun passage à `review` avant résolution des quatre findings bloquants, en plus
des conditions déjà posées par le fichier lui-même (arbitrages 4, 5, 6, 7 et 8,
et relecture croisée avec 10A).
