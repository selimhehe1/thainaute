# Contre-audit adversarial de `lecon-9a.md`

- Date : 2026-08-04
- Auditeur : agent adversarial indépendant, Claude Opus 5 (`claude-opus-5[1m]`)
- Objet : `content/authoring/unite-09/lecon-9a.md`, statut `draft`, jamais relu
- Consigne : chercher des erreurs, ne rien croire sur parole, tout recomputer
- Verdict : **NE PEUT PAS PASSER EN `review`.** Sept findings bloquants.

## Méthode

Aucune affirmation du dossier n'a été acceptée telle quelle. Chaque source
citée a été réinterrogée le 2026-08-04, avec les scripts versionnés du dépôt
(`rid-entry.mjs`, `volubilis-lookup.mjs`, `volubilis-codes.mjs`,
`repo-thai-scan.mjs`) et, pour les faits qu'aucun script du dépôt ne couvre,
avec des relevés écrits pour l'audit et reproductibles.

Empreintes des exemplaires employés, recalculées et **identiques** à celles
que le dossier déclare :

| Artefact                              | Octets     | SHA-256             |
| ------------------------------------- | ---------- | ------------------- |
| `VOLUBILIS_Database.xlsx`             | 10 848 409 | `b9ab7418…a20fc0c`  |
| `VOLUBILIS.ods`                       | 15 724 718 | `bb9c5da5…04a094cc` |
| `UnicodeData.txt` (17.0)              | 2 198 209  | `2e1efc1d…1d96470c` |
| `PropList-17.0.0.txt`                 | 145 465    | `130dcddc…1d8c64dd` |
| `IndicPositionalCategory-17.0.0.txt`  | 52 257     | `68cedc29…97d6c480` |
| `Appendix:Thai script` (`action=raw`) | 16 236     | `c9776c6a…624690f3` |

**309 faits ont été re-vérifiés un par un et trouvés exacts.** Le détail est
donné plus bas. Cela dit quelque chose d'important sur ce fichier : sa masse
documentaire est réelle et, sur les faits de dictionnaire, elle est presque
toujours juste. Les erreurs trouvées ne sont pas de la négligence diffuse,
ce sont sept points précis, dont quatre touchent un écran d'apprenant.

---

## Findings bloquants

### N1 — `FINALE-YW` : « ย et ว se rattachent à la voyelle » est FAUX comme règle de finale

**Où.** Méta, « Règle enseignée », troisième énoncé. Page 5, quatrième ligne
du bloc des familles, à côté des familles `n`, `ng` et `m` :

> ย et ว se rattachent à la voyelle, comme la page 8 de 6A vous l'a montré

**Pourquoi c'est faux.** Le RID, autorité n° 1 du projet et source que la
leçon cite elle-même pour ses huit familles, dit exactement l'inverse.
Relevé du 2026-08-04, `rid-entry.mjs มาตรา`, sens (๒) :

> ถ้ามีตัว ย สะกด จัดอยู่ในมาตราเกยหรือแม่เกย, ถ้ามีตัว ว สะกด
> จัดอยู่ในมาตราเกอวหรือแม่เกอว

et l'entrée de lettre « ว », `rid-entry.mjs ว`, sépare explicitement les deux
emplois, ce que la leçon aurait dû reprendre :

> ใช้เป็นตัวสะกดในมาตราเกอวหรือแม่เกอว เช่น **กล่าว นิ้ว**, ใช้ประสมกับรูป
> ไม้หันอากาศเป็นสระอัวในคำที่ไม่มีตัวสะกด เช่น **ตัว มัว**, ใช้เป็นสระอัว
> ในคำที่มีตัวสะกด เช่น **สวย รวม**

L'annexe Wiktionary, deuxième jambe du dossier, donne ligne 34 `IPA Final` =
`j` pour ย et ligne 37 `IPA Final` = `w` pour ว. Ce ne sont pas des cases
vides.

**La citation d'appui dit le contraire de ce qu'on lui fait dire.** Page 8 de
`u06-l6a`, relue le 2026-08-04, lignes 168 à 173 :

> ย et ว **gardent leur son**. Dans หน่อย et dans หิว, **la transcription** les
> rattache à la voyelle plutôt que de les écrire comme une consonne

6A parlait d'un choix de TRANSCRIPTION Thaïnaute. 9A le transforme en fait
d'écriture, dans la seule leçon du parcours dont l'objet est justement de
dire quelle lettre ferme une syllabe.

**Et le parcours en dépend déjà.** Page 6 de `u04-l4a`, ligne 117 : la règle
du ton en syllabe vivante s'applique à une syllabe « qui se termine sur une
voyelle longue, ou sur ง, น, ม, **ย ou ว** ». Si ย et ว se rattachent à la
voyelle, cette règle n'a plus de sens.

**Impact mesuré.** Vingt-quatre graphies publiées des unités 1 à 8 finissent
par ว ou ย (relevé écrit pour l'audit sur les sections `## Items`) : ข้าว,
ขาว, หน่อย, ตัว, ก้าว, กินข้าว, หิว, อร่อย, แก้ว, นิดหน่อย, เลี้ยว, พี่ชาย,
น้องสาว, ครอบครัว, ห้องครัว, ง่าย, เสีย, ตั๋ว, plus les blocs. Dans ตัว, เสีย
et ตั๋ว la leçon a raison, le ว et le ย appartiennent au graphème vocalique.
Dans ข้าว, หิว, แก้ว, ก้าว, ขาว, ง่าย, พี่ชาย, น้องสาว, อร่อย et หน่อย, ils
ferment la syllabe. Un apprenant qui applique la règle de la page 5 répond
« aucune consonne ne ferme ce mot » sur ข้าว. C'est précisément le risque que
l'audit devait chercher : une correspondance de finale fausse fait mal lire
tout le vocabulaire du parcours.

**Ce qui n'est PAS en cause.** Les douze corrigés de l'exercice 1 sont justes,
y compris les tirages 11 et 12 (เสีย, ตัว). Les pièges consignés sont justes.
C'est l'énoncé général qui est faux, pas son application aux mots du jour.

**Correction attendue.** Dire ce que dit le RID : ย et ว ferment aussi une
syllabe, dans les familles เกย et เกอว, et le cas des graphèmes เ◌ีย et ◌ัว
est une exception qui se reconnaît à la présence du graphème, pas une règle
générale. Ou bien restreindre explicitement l'énoncé à เ◌ีย et ◌ัว et dire
que les familles เกย et เกอว sont hors programme.

---

### N2 — `NOTE-8FAM` : la Note culturelle énonce une règle fausse pour deux familles sur huit

**Où.** Note culturelle, dernier paragraphe :

> Les huit familles de fin portent des noms bâtis sur le même modèle : on
> prend la syllabe ก, on lui colle la finale, et on obtient le nom de la
> famille.

**Pourquoi c'est faux.** Le relevé RID de l'entrée « มาตรา », que le dossier
cite lui-même à la ligne 1267, donne huit noms : มาตรากก, มาตรากง, มาตรากด,
มาตรากน, มาตรากบ, มาตรากม, **มาตราเกย**, **มาตราเกอว**. Le modèle « ก +
finale » ne produit ni เกย ni เกอว. Les trois exemples donnés par la note
(กด, กบ, กง) sont exactement les trois qui marchent.

Même racine que N1 : la leçon a écarté les familles de ย et ว, puis a énoncé
des universels sur « les huit ». La Note culturelle est soumise au contrat
« chaque fait sourcé » ; ici le fait contredit sa source.

---

### N3 — `PAGE1-SEPT` : la liste « sept mots » de la page 1 est fausse

**Où.** Page 1, premier écran de la leçon :

> Sept mots que vous dites correctement depuis des semaines finissent à l'écrit
> sur une lettre qui ne se prononce pas comme au début : ขอบคุณ, คุณ, ขอโทษ,
> ฝรั่งเศส, บาท, รถ et ต้องการ.

**Pourquoi c'est faux.** ด vaut `d` à l'initiale et `t` à la finale ; บ vaut
`b` à l'initiale et `p` à la finale. Les mots qui finissent par ด ou บ
remplissent donc le critère énoncé. Relevé écrit pour l'audit sur les
sections `## Items` des unités 1 à 8, graphies purement thaïes :

- finissent par ด : หัด, หาด, พูด, ตัด, ถัด, ติด, เจ็ด, แปด, เอ็ด, ข้าวผัด,
  ขวด, เผ็ด, ไม่เผ็ด, ผัด, หยุด, ตลาด ;
- finissent par บ : ครับ, สิบ, ยี่สิบ, ใบ, ชอบ, ไม่ชอบ, สามสิบ, แปดสิบ, plus
  une douzaine de blocs en …ครับ.

Soit **au moins vingt-deux graphies simples publiées** en plus des sept. La
leçon l'enseigne d'ailleurs elle-même trois écrans plus loin : la note de
l'item 1 dit « un บ qui ferme sur un `p` **comme dans ครับ et ชอบ** ».

**Cause identifiée.** Le dossier explique honnêtement sa méthode : le tri
manuel est parti de `repo-thai-scan.mjs 1 8 --grep <lettre>` sur ณ, ษ, ส, ท,
ถ et ร seulement. Les six comptes annoncés (7, 2, 41, 32, 9, 47) sont exacts,
je les ai recomputés. Mais le filtre a été construit sur « lettres qui ne sont
pas tête de famille », alors que la phrase de la page 1 énonce un critère
plus large.

**Correction attendue.** Soit resserrer la phrase (« sept mots finissent sur
une lettre dont vous n'avez jamais eu à lire la valeur de fin »), soit
annoncer un ordre de grandeur au lieu d'un décompte fermé.

---

### N4 — `UNICODE-VOL` : la « correction de nomenclature » apportée à 8A est elle-même fausse, et sa propagation est demandée sur dix-sept fichiers

**Où.** Section « Vérification Unicode », dernier point, et Arbitrage 4 :

> ce dossier écrivait « U+0E40 est classé `Visual_Order_Left` ». **Cette
> propriété n'existe pas dans la base de caractères**, vérification faite le
> 2026-08-04 sur `PropList-17.0.0.txt` …, où le mot « visual » n'apparaît pas
> une seule fois. […] **Arbitrage demandé** : remplacer le nom partout en une
> seule passe.

**Pourquoi c'est faux.** `Visual_Order_Left` existe. C'est une valeur de la
propriété `Indic_Positional_Category`, et elle figure dans le fichier que ce
dossier empreinte lui-même (`IndicPositionalCategory-17.0.0.txt`, SHA-256
`68cedc29…`, en-tête daté du 2025-07-29) :

```
0E40..0E44    ; Visual_Order_Left # Lo   [5] THAI CHARACTER SARA E..THAI CHARACTER SARA AI MAIMALAI
```

La preuve invoquée ne prouve rien : `PropList.txt` ne liste que des propriétés
binaires, une valeur d'énumération n'y figure jamais. Chercher « visual » dans
`PropList.txt` pour conclure que `Visual_Order_Left` n'existe pas revient à
chercher un mot dans le mauvais fichier.

Les deux propriétés s'appliquent bien à U+0E40..U+0E44 : `Logical_Order_Exception`
dans `PropList.txt` (ligne relevée, exacte) **et** `Indic_Positional_Category =
Visual_Order_Left` dans `IndicPositionalCategory.txt`. **`u08-l8a` avait
raison** ; sa ligne 1602 est exacte.

**Gravité.** L'arbitrage 4 demande de remplacer le nom « partout en une seule
passe ». `grep -rl Visual_Order_Left content/authoring/` rend le 2026-08-04
quinze fichiers `lecon-*.md` et huit fichiers `verification-*.md`. Exécuter cet
arbitrage injecterait une erreur dans vingt-trois fichiers exacts. Le décompte
annoncé par 9A (« DIX fichiers lecon-_.md en plus du présent, plus sept
fichiers verification-_.md ») est lui aussi faux.

---

### N5 — `BALAYAGE-INVENTE` : un résultat de balayage inventé, et un arbitrage bâti dessus

**Où.** Section « Sources du fait de phonétique, et pourquoi il n'y en a
presque pas » :

> Les trois formules que `u08-l8a` demandait de traquer à son arbitrage 2 ont
> été cherchées mécaniquement dans le fichier le 2026-08-04. **Résultat brut :
> une occurrence de chacune. Les trois sont dans le présent paragraphe de
> contrôle, et nulle part ailleurs.**

**Pourquoi c'est faux.** Les trois formules sont nommées par l'arbitrage 2 de
`u08-l8a`, ligne 1754 : « une bouche française », « un francophone »,
« l'oreille française ». Comptes réels dans `lecon-9a.md` le 2026-08-04 :

```
une bouche française   : 0
un francophone         : 0
l’oreille française    : 0
francophone            : 0
```

Zéro, pas une. Le paragraphe de contrôle ne les cite pas. Le « résultat brut »
est donc inventé, et le raisonnement qui en découle (« un balayage automatisé
devra exclure la section de contrôle, ou la leçon devra citer ces formules
autrement ; c'est une précision à apporter à l'arbitrage 2 ») porte sur un
problème qui n'existe pas dans ce fichier.

**Ironie utile.** La conclusion de fond, elle, est vraie : `français` et
`française` n'apparaissent qu'aux lignes 1118, 1125 et 1626, toutes dans le
dossier de production, jamais sur un écran d'apprenant. La section 1 bis est
respectée. C'est la PREUVE qui est fabriquée, pas le fait.

---

### N6 — `SENS-MONO` : la distinction ปวด / เจ็บ affichée page 8 est mono-sourcée, et elle reproduit des définitions du RID

**Où.** Page 8, écran d'apprenant :

> Le dictionnaire définit ปวด par une douleur ressentie de façon continue dans
> le corps ; il donne à เจ็บ deux sens, être souffrant, et ressentir la douleur
> d'un coup ou d'une plaie.

**Ce que disent réellement les trois sources.** Relevés du 2026-08-04.

| Source                        | ปวด                                  | เจ็บ                                                         | porte le contraste continu / ponctuel ? |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------ | --------------------------------------- |
| RID                           | รู้สึกเจ็บ**ต่อเนื่อง**อยู่ในร่างกาย | (๑) ป่วยไข้ (๒) รู้สึกทางกายเมื่อ**ถูกทุบตีหรือเป็นแผล**     | **oui**                                 |
| VOLUBILIS 79445 / 19427-19430 | « avoir mal à ; souffrir de »        | « être blessé ; avoir mal », « être malade », « douloureux » | non                                     |
| Wiktionary                    | « to ache; to be in pain »           | « to be sick », « to be hurt; be in pain »                   | non                                     |

Le contraste enseigné ne tient donc que sur **une** source. La politique du
projet exige deux sources indépendantes par fait, et le tableau d'audit de la
leçon déclare pourtant « Sens : vérifié, RID plus VOLUBILIS plus Wiktionary
pour les 8 items ». La Méta déclare en outre « le sens fin qui sépare เจ็บ de
ปวด » explicitement hors périmètre : la page 8 l'ouvre à moitié.

**Second problème, même écran.** La politique de sources écrit du RID :
« Citation par référence, jamais de reproduction des définitions. » La page 8
restitue les définitions en français sur un écran d'apprenant, alors que le
dossier affirme « **aucune définition du RID n'est reproduite dans ce
fichier** » et que le tableau d'audit porte « Licence : vérifiée, aucune
définition reproduite ». Les deux affirmations sont contredites par la page 8.

**Correction attendue.** Soit trouver une seconde source pour le contraste
(grammaire de référence sur exemplaire, ou distribution TNC), soit retirer la
page 8 au profit d'un énoncé purement graphique : deux mots, deux fins écrites,
ด et บ, ce qui est le vrai objet de la leçon.

---

### N7 — `COORD-42-3` : le relevé de coordination d'unité est faux, deux collisions sur cinq sont manquées

**Où.** Méta, « Coordination d'unité, faite sur l'état réel du dossier le
2026-08-04 » :

> Il est fait par script sur les sections `## Items` des cinq fichiers : **42
> graphies distinctes pour l'unité, 8 items en 9A, 9B, 9C et 9D, 14 en 9E, et
> TROIS collisions.**

**Recomputé le 2026-08-04**, même convention que `repo-thai-scan.mjs` (bloc
d'item portant `thai` et `ton`, section `## Items`, comparaison sans
normalisation) :

```
lecon-9a.md : 8 items      lecon-9d.md : 8 items
lecon-9b.md : 8 items      lecon-9e.md : 14 items
lecon-9c.md : 8 items
graphies distinctes unité 9 : 40
collisions :
  เจ็บ                             : 9a, 9b
  ปวด                              : 9a, 9b
  หมอ                              : 9a, 9c, 9e
  ปวดหัว                            : 9b, 9e
  กี่วันแล้วครับ / กี่วันแล้วคะ    : 9d, 9e
```

Les comptes par fichier sont exacts (8/8/8/8/14). Mais il y a **40 graphies
distinctes, pas 42**, et **CINQ collisions, pas trois**. 46 entrées moins un
excédent de 6 donne 40 ; le chiffre 42 correspond exactement à un excédent de
4, c'est-à-dire aux trois collisions repérées. Les deux manquées sont ปวดหัว
(9B ∩ 9E) et le bloc กี่วันแล้วครับ / กี่วันแล้วคะ (9D ∩ 9E).

**Gravité.** Ce relevé est annoncé « fait par script » et sert de base à trois
arbitrages d'attribution à exécuter à la consolidation. Exécuté tel quel, il
laisserait deux graphies revendiquées deux fois, donc deux cartes SRS en
double. C'est exactement le défaut que le finding N4 de `u08-l8a` avait voulu
bannir et que l'en-tête de `repo-thai-scan.mjs` interdit : « un décompte
interne cité par une leçon est produit par CE script, ou il n'est pas cité ».

**Ce qui est confirmé en revanche.** La concordance de champs annoncée est
vraie. ปวด, เจ็บ et หมอ portent les mêmes `codepoints`, `ipa`, `ton`,
`longueur` et `transcription` en 9A, 9B, 9C et 9E, vérifié champ par champ.
ปวดหัว est également concordant entre 9B et 9E.

---

## Findings non bloquants

### N8 — `REF-MALCITEE` : deux relevés de source faux dans le dossier

1. **แม่คำ de ทัณฑฆาต.** Le dossier écrit : « Son mot de rattachement (แม่คำ)
   est « ไม้ ๒ », la vedette générique des petits signes déjà citée par
   `u07-l7a` et `u08-l8a` ». Relevé du 2026-08-04, `rid-entry.mjs ทัณฑฆาต` :
   `แม่คำของ "ทัณฑฆาต" คือ ทัณฑ์ ทัณฑ-`. C'est l'entrée **ไม้ทัณฑฆาต** dont le
   แม่คำ est « ไม้ ๒ ». Les deux relevés existent, ils ont été échangés.
2. **Boîte Homophones de รถ.** Le dossier écrit, comme « réserve de méthode » :
   « la boîte « Homophones » de l'entrée รส liste bien รถ, mais celle de
   l'entrée รถ liste รด et รท **sans lister รส**. Cette asymétrie est une
   inconsistance de la source. » Relevé du 2026-08-04 sur
   `en.wiktionary.org/wiki/รถ?action=render` : `Homophones … รด รท **รส**`.
   Il n'y a pas d'asymétrie. La conclusion (รถ et รส homophones) reste juste,
   et la preuve retenue par le dossier, la coïncidence des IPA /rot̚˦˥/, est
   exacte.

### N9 — `LONGUEUR-PUAT` : l'incertitude 3 s'appuie sur un désaccord en partie fabriqué

Le champ `longueur` de ปวด est laissé « NON ÉTABLIE » au motif que
« l'IPA d'en.wiktionary ne porte aucune marque d'allongement, alors que la
romanisation VOLUBILIS `pūat` porte le macron ». La même page Wiktionary
donne, deux lignes plus bas, `Romanization Paiboon **bpùuat**` : le doublement
`uu` note la voyelle longue dans le système Paiboon, exactement comme le
macron chez VOLUBILIS. La feuille `Romanization` du `.ods` romanise en outre
`-ว- (อัว ลดรูป)` en `ūa`, avec macron.

Les deux sources concordent donc plutôt vers « longue ». Le désaccord invoqué
oppose une convention de notation IPA des diphtongues à une romanisation, ce
qui n'est pas un désaccord de fait. Ce point compte : c'est le **cinquième**
signalement d'une divergence de parcours, et il est signalé sur une base
inexacte.

### N10 — `VOL-INDEP` : la « troisième jambe » n'est pas indépendante du RID

Le dossier écrit de la feuille `Romanization` du `.ods` : « C'est la troisième
jambe du tableau de concordance ci-dessous, **entièrement indépendante du RID
et de Wikimedia**. » L'en-tête de cette feuille, relu le 2026-08-04, dit :

> ORST Office of the Royal Society (comparison with Volubilis Thai Romanization
>
> - compatibility 90%) — ORST (black) / Volubilis Thairom (red) / Volubilis
>   EasyThai (blue)

Chaque cellule de la colonne « consonne finale » donne d'abord la valeur ORST,
c'est-à-dire celle de l'éditeur du RID. Le dossier se contredit d'ailleurs
lui-même trente lignes plus bas : « VOLUBILIS reste donc qualifiée de
corroboration **partiellement indépendante** ».

Sans conséquence sur le fait lui-même : les familles tiennent sur RID plus
annexe Wiktionary, deux sources réellement indépendantes.

### N11 — `TONES-CMD` : citation non recomputable telle qu'écrite

Le dossier écrit : « Notation des tons, citée par CLÉ …, relue le 2026-08-04
par `node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> TONES` :
sous l'intitulé `TONES`, `-x` normal, `¯x` high, `_x` low, `/x` rising,
`\x` falling. »

Le contenu est exact, je l'ai relu. Mais la commande citée ne rend qu'une
ligne, `TONES | ● ● ●` : le filtre est une recherche de sous-chaîne et les
cinq lignes de clé ne contiennent pas le mot « TONES ». Un tiers qui refait
la consultation à l'identique n'obtient pas ce qui est cité, ce que
l'amendement v1.2 exige. La commande sans filtre, elle, fonctionne.

### N12 — `COMPTE-LETTRES` : deux décomptes de lettres incohérents

1. **13 contre 18.** La page 3 enseigne treize lettres pour la famille du `t`.
   Le RID en donne dix-huit : จ ฉ ช ซ ฌ ฎ ฏ ฐ ฑ ฒ ด ต ถ ท ธ ศ ษ ส. Le dossier
   ne justifie que deux omissions, ฉ et ฌ, au titre d'un désaccord de sources.
   Les trois autres, **ฐ, ฑ et ฒ**, ne sont nommées nulle part ailleurs que
   dans la citation du RID, ligne 1267 : elles sont écartées en silence, alors
   qu'aucune source ne les conteste (RID `มาตรากด`, Wiktionary `IPA Final` =
   `t` lignes 16 à 18, VOLUBILIS groupe « ฐ ฑ ฒ – ถ ท – ธ » = `t`). Écarter
   des lettres rares est légitime ; le faire sans le dire ne l'est pas.
2. **26 contre 30.** Le tableau d'audit porte « Finales écrites : vérifiées,
   **26 lettres** sur 3 autorités concordantes » là où le tableau de
   concordance en aligne trente et conclut « Trente lettres, trois autorités,
   zéro écart ». Le chiffre 30 est le bon, je l'ai recomputé.

## Observations, sans finding

- **Exercice 2, plancher annoncé optimiste.** « la probabilité d'atteindre le
  seuil sans lire est de 1 sur 720 » suppose l'ignorance totale. Or ง et ม
  sont seules dans leur famille et donnent leur nom à la famille : โรง ↔ `-ng`
  et ดื่ม ↔ `-m` sont appariables sans connaître la règle du jour. Il reste
  une bijection de quatre, soit 1 sur 24, ou 4,2 %. Très en dessous du seuil,
  donc l'exercice reste sain, mais le chiffre affiché n'est pas le bon.
- **Onze contre dix.** Le tableau des lectures entre crochets annonce « onze
  formes phonémiques Wiktionary » puis écrit deux lignes plus bas que โอกาส
  « n'a pas été relevé chez Wiktionary ». Il y en a dix.
- **Deux graphies à vingt-quatre codes.** Le dossier écrit « la plus longue
  étant ขอข้าวผัดสองจานหน่อยครับ à vingt-quatre codes ». ผมทำงานที่บ้านทุกวันครับ
  (`u07-l7d`) en fait vingt-quatre aussi. Le chiffre est bon, l'unicité non.

## Contrainte de sujet — santé : RIEN À SIGNALER

Balayage complet des sections visibles par l'apprenant (pages 1 à 14, champs
`fr` et `note_fr` des huit items, consignes, options, feedbacks et pièges des
cinq exercices, dialogue, note culturelle), plus recherche des motifs
`urgence`, `appelez`, `composez`, `numéro`, `dose`, `posologie`, `médicament`,
`prenez`, `il faut`, `vous devez`, `traitement`, `ambulance`, `secours`.

**Aucun conseil médical, aucun numéro d'appel, aucune posologie, aucune
information de secours, aucune conduite à tenir.** Les seuls faits enseignés
sont linguistiques. Le dialogue met en scène une demande de chemin. La
réplique ผมเจ็บครับ a été retirée et le motif est consigné, ce qui est la
bonne décision.

Une seule phrase est directive, page 14 : « Pour un problème de santé,
adressez-vous à un professionnel de santé, pas à une application
d'apprentissage. » C'est un avertissement de non-conseil, pas un conseil, et
je ne le compte pas comme un manquement. Si la règle d'unité est lue au sens
strict (aucune consigne du tout), une formulation non impérative ferait le
même travail : « Thaïnaute enseigne une langue, ce n'est pas un service de
santé. »

Note connexe : ยา, le médicament, est correctement signalé en prérequis comme
item publié que la leçon n'enseigne pas et ne réemploie pas.

## Exercices — aucun n'est réussissable sans savoir

Les cinq planchers ont été recomputés.

| Exercice | Mécanique     | Répartition vérifiée                           | Réponse constante                            | Seuil | Verdict                |
| -------- | ------------- | ---------------------------------------------- | -------------------------------------------- | ----- | ---------------------- |
| 1        | `reading`     | 2 par option sur 6 options, 12 tirages         | 2/12 = 16,7 %                                | 10/12 | sain                   |
| 2        | `association` | bijection de 6                                 | impossible ; hasard 1/720, en pratique 1/24  | 6/6   | sain, voir observation |
| 3        | `listening`   | 3 par option sur 4 options, 12 tirages         | 3/12 = 25 %                                  | 9/12  | sain                   |
| 4        | `reading`     | 3 sans signe, 3 à une lettre, 2 à deux lettres | « aucune » 3/8 ; heuristique de position 6/8 | 7/8   | sain                   |
| 5        | `recall`      | saisie libre, 8 tirages                        | au mieux 1/8                                 | 6/8   | sain                   |

La meilleure heuristique de position de l'exercice 4 a été cherchée
activement : « la lettre sous le ◌์, rien sinon » donne bien 6/8 ; la variante
« la lettre sous le signe plus celle d'avant » tombe à 5/8. Le seuil de 7/8
n'est atteignable qu'en sachant que le signe peut en éteindre deux.

**Les quarante-six corrigés des cinq exercices ont été recalculés un par un et
sont tous justes** : douze finales à l'exercice 1, six paires à l'exercice 2,
douze tons à l'exercice 3, huit ensembles de lettres éteintes à l'exercice 4,
huit transcriptions à l'exercice 5. Aucun corrigé faux.

## Ce que j'ai confirmé moi-même — 309 faits

### Graphie, Unicode, encodage (28)

- Les huit séquences NFC d'items et les neuf de spécimens : identiques aux
  valeurs déclarées, et **NFC stable** (`s.normalize('NFC') === s`) dans les
  dix-sept cas.
- `0E4C;THAI CHARACTER THANTHAKHAT;Mn;0;NSM` ; `0E48` à `0E4B` en classe
  combinatoire **107** ; `0E47;MAITAIKHU;Mn;0`. Le contraste enseigné page 9
  est exact.
- `IndicPositionalCategory-17.0.0.txt` : `0E47..0E4E ; Top`. Même catégorie
  positionnelle pour le ◌์ et les quatre marques de ton, comme annoncé.
- `PropList-17.0.0.txt` : `0E40..0E44 ; Logical_Order_Exception`, couvrant
  bien เ, แ, โ, ใ et ไ.
- Six empreintes d'artefacts, toutes identiques aux valeurs déclarées, y
  compris les 16 236 octets et le SHA-256 de l'annexe Wiktionary.

### RID, 63 entrées interrogées et lues

- **มาตรา sens (๒)** : la citation de la ligne 1267 est mot pour mot exacte.
  Huit familles plus มาตรา ก กา.
- **Trente entrées de lettre** : ก ข ค ฆ ด ต ถ ท ธ ฎ ฏ จ ช ซ ศ ษ ส บ ป พ ฟ ภ
  น ณ ร ล ฬ ญ ง ม. Chacune range bien la lettre dans la famille annoncée. Les
  exemples cités par le dossier sont exacts, y compris les plus utiles :
  entrée « ค » → โรค en premier, entrée « ถ » → รถ, entrée « ต » → จิต,
  entrée « ส » → รส, entrée « ป » → บาป, entrée « บ » → ดิบ, entrée « ด » →
  มดกัด, entrée « ร » → การ วาร, entrée « ล » → กาล พาล ฟุตบอล, entrée « พ » →
  ภพ ภาพ สรรพ, entrée « ท » → ประมาท บท.
- **Neuf entrées de mot** : เจ็บ (deux sens, renvoi royal ประชวร, dérivé
  เจ็บปวด), ปวด (exemples ปวดหัว ปวดท้องเยี่ยว ปวดฟัน, dérivés ปวดร้าว
  ปวดแสบปวดร้อน), หมอ (trois vedettes, หมอ ๒ étiquetée ปาก, หมอ ๓ le poisson),
  แพทย์ ([แพดทะยะ-, แพด], origine ส. ไวทฺย, dérivés แพทยศาสตร์ แพทยา), โรค
  ([โรก, โรคะ-], origine ป. ส.), อาการ (cinq sens, [อากาน, อาการะ-], exemple
  อาการเจ็บคอ), โรงพยาบาล (แม่คำ โรง, **aucune** lecture entre crochets),
  โทรศัพท์ (อ. telephone, abréviation โทร. lue [โท], sens ๒ étiqueté ปาก),
  พยาบาล ([พะยาบาน]).
- **Dix entrées de spécimen** : รถ [รด, ระถะ-], รส (aucune lecture), จิต
  [จิด, จิดตะ-], สุข [สุก, สุกขะ-], รูป [รูบ, รูบปะ-], ศาสตร์
  [สาดตฺระ-, สาดสะตฺระ-, สาด], จันทร์, โรง, โอกาส [-กาด], เมล์ (อ. mail).
- **Six entrées de terminologie** : ทัณฑฆาต, ไม้ทัณฑฆาต, การันต์ ([การัน],
  glose ที่สุดอักษร, exemple ต์ de การันต์ lui-même), ทัณฑ์
  ([ทันดะ-, ทันทะ-, ทัน]), ฆาต ([คาด, คาดตะ-]), ตัวสะกด.
- **La forme du signe en zone à usage privé** : les entrées ทัณฑฆาต et
  ไม้ทัณฑฆาต renvoient bien `<U+F709>`, correspondance établie par le
  dictionnaire lui-même comme le dossier l'affirme.
- **Sept absences confirmées** : แม่กก, แม่กด, แม่กน, แม่กบ, มาตรากด, อักษรนำ,
  พยัญชนะต้น renvoient toutes la page « proposer un mot ».
- **Les onze lignes du tableau des lectures entre crochets** sont exactes, y
  compris les cas délicats : [แพด] est bien la seconde lecture, [สาด] la
  troisième, [-กาด] est bien préfixée d'un tiret, et รส n'a bien aucune
  lecture.

### Wiktionary, 48 relevés

- **Annexe « Appendix:Thai script »**, 44 lignes de consonnes dépouillées :
  `IPA Final` = `k` pour ก ข ค ฆ ; `t` pour ด ต ถ ท ธ ฎ ฏ จ ช ซ ศ ษ ส ; `p`
  pour บ ป พ ฟ ภ ; `n` pour น ณ ร ล ฬ ญ ; `ŋ` pour ง ; `m` pour ม. Trente sur
  trente. Les numéros de ligne cités sont exacts : บ ligne 26, ด ligne 20, ท
  ligne 23, ค ligne 4, ร ligne 35, ล ligne 36, พ ligne 30.
- **Réserves confirmées** : ฉ et ฌ portent bien `-` en colonne Final ; ฃ et ฅ
  portent bien `k`.
- **Quatorze entrées de mot** : IPA, formes Orthographic et Phonemic,
  romanisations Paiboon et Royal Institute, étiquette `(formal)` de แพทย์,
  homophone แพศย์, classificateur เครื่อง, tout est conforme. Les huit IPA
  d'items sont exactes au caractère près, y compris /pua̯t̚˨˩/,
  /roːŋ˧.pʰa˦˥.jaː˧.baːn˧/ et /tʰoː˧.ra˦˥.sap̚˨˩/.

### VOLUBILIS, 50 relevés

- **Dix-huit lignes** retrouvées au numéro exact : เจ็บ 19427, ปวด 79445, หมอ
  56112, แพทย์ 67888, โรค 83332, อาการ 706 et 707, โรงพยาบาล 83987, โทรศัพท์
  103245, จิต 19816, รส 84432, สุข 94929, รูป 85202, จันทร์ 18349 et 18350,
  โรง 83823, ศาสตร์ 89765, เมล์ 54545, ดื่ม 10935, แพง 67653. Les colonnes
  ThaiRom, ThaiPhon, TYPE et FRA citées sont exactes.
- **La réserve honnête sur โรงพยาบาล est vraie** : la colonne TYPE porte bien
  `adj.` pour un nom. Le dossier a raison de la signaler et de ne pas s'en
  servir.
- **114 579 lignes non vides et 586 541 chaînes partagées** : chiffres exacts.
- **Clé `TONES`** : `-x` normal, `¯x` high, `_x` low, `/x` rising, `\x`
  falling. Contenu exact.
- **Feuille `Romanization`** : l'entrée `-ว- (อัว ลดรูป)(signe abrégé /
shorten sign)` existe, romanisée `ua`/`ūa`, exemple รวม. Et la colonne
  « ตัวสะกด / final letter / consonne finale » donne bien `k`, `t`, `p`, `n`,
  `ng`, `m` pour les trente lettres du tableau de concordance.

### Prononciation, tons, transcription (68)

- **Les huit tons d'items redérivés** un par un : เจ็บ bas, ปวด bas, หมอ
  montant, แพทย์ descendant, โรค descendant, อาการ moyen-moyen, โรงพยาบาล
  moyen-haut-moyen-moyen, โทรศัพท์ moyen-haut-bas. Tous justes, et tous
  concordants avec les marqueurs VOLUBILIS et les IPA Wiktionary.
- **Les huit transcriptions du jour**, recalculées depuis l'amendement v1.1 :
  `jèp`, `pòuat`, `mǎww`, `phâeet`, `rôok`, `aa·kaan`, `roong·phá·yaa·baan`,
  `thoo·rá·sàp`. Toutes conformes, accent sur la première lettre du noyau,
  doublement de la dernière lettre du graphème pour les longues.
- **Les douze tons de l'exercice 3** redérivés : ปา, จาน, โรง moyens ; ป่า,
  ปวด, เจ็บ bas ; หมา, หมอ, ขา montants ; ม้า, รถ, รส hauts. Justes.
- **Vingt-quatre transcriptions publiées** citées par la section « Contrôles
  internes » ont été relues dans le dépôt : toutes exactes, aucune
  reconstruction.
- **หมอ et le ห muet** : la page 5 de `u05-l5a` dit bien « le ห se tait quand
  une des lettres ง, น, ม, ย, ว ou ร est collée juste derrière lui, sans le
  moindre signe posé sur le ห ». Citation exacte.

### Décomptes internes au dépôt (30)

- `repo-thai-scan.mjs --check-u07` : dix valeurs sur dix, sans écart. La
  convention de comptage est bien reproduite.
- `repo-thai-scan.mjs 1 8` : 40 fichiers, 383 entrées, 283 graphies, 92
  ไม้เอก, 66 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา. Sept chiffres sur sept.
- `repo-thai-scan.mjs 1 8 --grep "์"` : **une seule** graphie publiée porte le
  signe, รถเมล์ (`u05-l5d`). La page 11 a raison.
- Les six comptes de grep de la page 1 : ณ 7, ษ 2, ส 41, ท 32, ถ 9, ร 47.
  Exacts.
- 265 graphies purement thaïes sur les unités 1 à 8. Exact.
- โรงพยาบาล fait bien neuf codes, à égalité avec รับประทาน (`u04-l4b`) parmi
  les mots simples.

## Ce qu'il faut faire avant `review`

1. Corriger la règle de la page 5 et de la Méta sur ย et ว (**N1**), et la
   dernière phrase de la Note culturelle (**N2**). Ces deux-là touchent ce que
   l'apprenant apprend.
2. Corriger la page 1 (**N3**).
3. Retirer l'arbitrage 4 et la « correction » Unicode, et ne rien remplacer
   dans les autres fichiers (**N4**). `u08-l8a` avait raison.
4. Supprimer ou refaire le paragraphe de balayage phonétique (**N5**).
5. Trancher la page 8 : seconde source, ou repli sur le fait graphique
   (**N6**). Vérifier au passage la conformité à l'interdit de reproduction
   des définitions.
6. Refaire le relevé de coordination d'unité et le porter à cinq collisions
   (**N7**) avant toute consolidation.
7. Reprendre N8 à N12, qui sont des corrections de dossier sans effet sur les
   écrans.

Le reste du fichier tient. La chaîne de preuve des familles de finales est
solide sur les six familles enseignées, les corrigés des cinq exercices sont
justes, les planchers sont honnêtes, la contrainte de sujet est respectée, et
les décomptes internes sont, à l'exception de la coordination d'unité, tous
recomputables et exacts.

- Statut recommandé : reste `draft`. Revue native : en attente.
