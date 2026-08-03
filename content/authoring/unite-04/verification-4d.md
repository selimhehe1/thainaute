# Contre-audit adversarial de `unite-04/lecon-4d.md`

- Date : 2026-08-03
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), agent indépendant du rédacteur
- Consigne : chercher des erreurs, ne rien tenir pour acquis, re-vérifier chaque
  fait contre les sources primaires plutôt que contre le dossier de la leçon
- Verdict : `draft` maintenu. 4 findings bloquants, 8 findings non bloquants.
- Revue native : en attente (inchangé)

## 0. Note liminaire sur la consigne d'audit

La consigne demandait de vérifier en priorité « la règle de ton énoncée en 4A ».
Cette cible n'a pas de référent :

- `content/authoring/unite-04/` ne contient aucun fichier `lecon-4a.md` ;
- `git log --all --diff-filter=A -- 'content/authoring/unite-04/*'` ne retourne
  rien, le répertoire entier étant encore non suivi (`?? content/authoring/unite-04/`) ;
- 4D n'énonce aucune règle de ton, et le dit explicitement dans sa section SRS :
  « la règle qui relie la classe d'une consonne au ton n'est ni énoncée ni
  révisée, bien que เผ็ด et ชอบ en seraient de bons supports ».

Aucune règle de ton fausse ou trop générale ne contamine donc le parcours depuis
4D. En revanche, les tons attribués par 4D à ses huit items ont été recalculés à
la main par classe de consonne et par type de syllabe, puis recoupés : ils sont
tous justes (voir §1).

## 1. Méthode

Rien n'a été repris du dossier de production de la leçon. Chaque source a été
réinterrogée directement, le même jour :

- **RID 2554** : 22 requêtes `POST` sur `dictionary.orst.go.th/func_lookup.php`,
  corps `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l'audit,
  espacées de 1,3 seconde. Les 14 graphies du dossier ont été rejouées, plus 8
  graphies de contrôle que la leçon ne cite pas (`หน่อย`, `ไหม`, `เผ็ดน้อย`,
  `ไม่เผ็ดมาก`, `เผ็ดร้อน`, `ชอบใจ`, `ชอบพอ`, `ไม่ชอบมาพากล`).
- **VOLUBILIS** : le fichier `VOLUBILIS Database.xlsx` a été contrôlé sur son
  contenu, pas sur son nom. Taille 10 848 409 octets et SHA-256
  `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c` :
  identiques à ce que déclare la leçon. Feuille unique `Volubilis`, 114 579
  lignes, en-têtes conformes. Les 37 numéros de ligne cités ont été relus un par
  un, plus 24 lignes de contrôle non citées.
- **Wiktionary** : 27 pages `en` et `th` récupérées en wikitexte brut
  (`action=raw`) et en rendu (`action=render`), y compris les 7 pages que la
  leçon déclare en 404.
- **Unicode 17.0**, `UnicodeData.txt` (2 198 209 octets) et
  `IndicPositionalCategory.txt` (52 257 octets, en-tête
  `IndicPositionalCategory-17.0.0.txt`, daté du 2025-07-29).
- **FrequencyWords** `th_50k.txt` (1 504 712 octets, 50 000 lignes).
- **Corpus interne** : les 15 leçons des unités 1 à 3 et les 3 autres fichiers
  présents dans l'unité 4 ont été relus pour contrôler chaque affirmation que
  4D fait sur le parcours antérieur.

## 2. Ce qui est confirmé

**96 faits distincts ont été re-dérivés et confirmés.** Le socle documentaire de
cette leçon est d'une exactitude inhabituelle : aucune référence inventée,
aucune citation déformée, aucun fait mono-sourcé non déclaré.

### 2.1 Les huit items (48 champs contrôlés, 0 erreur)

Tons recalculés indépendamment par classe de consonne et type de syllabe, puis
recoupés sur Wiktionary et sur la colonne THAIPHON de VOLUBILIS :

| item | graphie      | ton                                 | longueur       | IPA                  | verdict |
| ---- | ------------ | ----------------------------------- | -------------- | -------------------- | ------- |
| 1    | ไม่          | descendant (ม basse + mai ek)       | brève /aj/     | /maj˥˩/              | juste   |
| 2    | เผ็ด         | bas (ผ haute + syllabe morte)       | courte         | /pʰet̚˨˩/             | juste   |
| 3    | ไม่เผ็ด      | descendant + bas                    | brève + brève  | /maj˥˩.pʰet̚˨˩/       | juste   |
| 4    | นิดหน่อย     | haut + bas                          | brève + brève  | /nit̚˦˥.nɔj˨˩/        | juste   |
| 5    | เผ็ดนิดหน่อย | bas + haut + bas                    | trois brèves   | /pʰet̚˨˩.nit̚˦˥.nɔj˨˩/ | juste   |
| 6    | ชอบ          | descendant (ช basse + morte longue) | longue         | /t͡ɕʰɔːp̚˥˩/           | juste   |
| 7    | ไม่ชอบ       | descendant + descendant             | brève + longue | /maj˥˩.t͡ɕʰɔːp̚˥˩/     | juste   |
| 8    | มาก          | descendant                          | longue         | /maːk̚˥˩/             | juste   |

Les 8 champs `codepoints` ont été recalculés depuis les champs `thai` : 8
correspondances exactes, 0 écart. Le fichier entier est stable en NFC, 110
chaînes thaïes distinctes, 0 instable. Les 8 transcriptions sont conformes à
l'amendement v1.1 (diacritique de ton sur la première lettre du noyau,
doublement de la dernière lettre du graphème pour la longueur) : `mâi`, `phèt`,
`nít·nàwi`, `châwwp`, `mâak` sont correctes.

### 2.2 RID (14 requêtes rejouées, 8 affirmations de contenu contrôlées)

Le décompte 9 attestées / 5 absentes est exact. Les 5 absences annoncées
(ไม่เผ็ด, ไม่ชอบ, เผ็ดนิดหน่อย, ชอบมาก, เผ็ดมาก) sont réelles. Les affirmations
de contenu sont toutes fidèles, et notablement précises :

- « ไม่ » : vedette unique, classée ว., l'entrée énonce bien que le mot nie le
  sens du mot qui suit, l'illustre par deux compositions où il précède ce mot, et
  signale l'emploi en fin de groupe conditionné par un mot en tête. Conforme mot
  pour mot à ce que décrit la leçon.
- « เผ็ด » : ว., sens défini par renvoi au goût du piment, bloc ลูกคำ contenant
  เผ็ดร้อน. Exact.
- « ชอบ » : deux vedettes, la première ก. avec trois sens et un bloc ลูกคำ
  contenant ชอบใจ et ชอบพอ, la seconde de sens normatif et de droit. Exact.
- « นิดหน่อย » : ว., bloc แม่คำ renvoyant à นิด ; « นิด » ว. avec ลูกคำ
  contenant นิดหน่อย. Exact.
- « มาก » : ว., donné comme contraire de น้อย, trois compositions où มาก suit le
  mot intensifié. Exact.
- « ไม้ไต่คู้ » : l'entrée nomme le signe, en donne le tracé et énonce qu'il rend
  le mot bref. Exact.
- « พริก ๑ » : Capsicum, famille Solanaceae, fruit porteur du goût, variétés
  citées ; « พริก ๒ » oiseau, « พริก ๓ » serpent. Exact.
- Le bloc ลูกคำ de « ไม่ » contient bien ไม่ชอบมาพากล, et la leçon a raison de
  préciser que cela ne vaut pas attestation de ไม่ชอบ.

L'appel malformé signalé par le dossier est crédible : la même erreur se
reproduit dès qu'on laisse un shell Windows encoder la graphie thaïe, la requête
partant alors avec `????`. Signalement honnête.

### 2.3 VOLUBILIS (37 lignes citées, toutes vérifiées)

Les 37 numéros de ligne renvoient exactement au contenu annoncé : THAIPHON,
gloses, TYPE, DOM et colonne SYLLAB. Contrôles notables :

- ligne 70558 porte bien `เผ็ด` **suivi d'une espace**, avec gloses anglaises et
  sans glose française, comme annoncé. Le détail est vrai ;
- ligne 95738 contient bien ตา, ce qui valide la concordance de numérotation
  annoncée avec l'item 1 de 3A ;
- les quatre entrées composées invoquées pour la position de ไม่ (52569, 51767,
  52710, 52717) placent toutes ไม่ en tête ;
- les décomptes auto-déclarés « 27 graphies » et « 37 numéros de ligne
  distincts » sont exacts, recomptés à la main.

Trois citations sont tronquées sans marque d'omission (ligne 9312, ligne 53109,
ligne 9329 : la leçon reprend les premières gloses et coupe la fin). Rien de
faux, mais l'usage des guillemets suggère une citation intégrale.

### 2.4 Wiktionary (13 affirmations de contenu, 7 codes 404)

Toutes exactes, y compris les détails les plus fins : la prononciation figurée
`นิด-หฺน็่อย`, la romanisation Paiboon `pèt` pour เผ็ด et `chɔ̂ɔp` pour ชอบ, les
deux sens secondaires de เผ็ด (substances qui piquent la langue ; emploi
argotique), les deux exemples de ชอบ avec le verbe devant son complément, la
présence de ไม่ชอบ dans les dérivés de ชอบ, l'antonyme น้อย sur มาก, les deux
notes d'usage de th.wiktionary sur ็ (le mot ก็ ; l'emploi avec เ, แ et อ pour
เอะ, แอะ et เอาะ pourvues d'une consonne finale). Les 7 pages annoncées en 404
renvoient bien 404.

L'affirmation que th.wiktionary reprend la formulation du RID pour ไม่, เผ็ด,
ชอบ et มาก est vérifiée mot pour mot, et la conclusion que la leçon en tire
(recoupement, pas autorité indépendante) est la bonne.

### 2.5 Unicode, typographie, corrigés

- `0E47;THAI CHARACTER MAITAIKHU;Mn;0;NSM;…` et
  `0E0A;THAI CHARACTER CHO CHANG;Lo;0;L;…` : lignes exactes.
- `0E47..0E4E ; Top`, `0E40..0E44 ; Visual_Order_Left`, `0E48` classe
  combinatoire 107, `0E34` et `0E31` en `Top` : exacts.
- ADR-0022 : 0 tiret cadratin U+2014, 0 demi-cadratin U+2013, 0 U+2015,
  0 U+2212, 0 apostrophe droite. 315 apostrophes U+2019, chiffre exact.
- Fréquences : les 11 rangs et 6 comptes d'occurrences cités sont exacts, et les
  3 absences annoncées sont réelles. La décision d'écarter ce signal (incertitude 3) est bien argumentée.
- **Corrigés** : les réponses des exercices 1, 2 et 4 sont toutes justes, et
  **tous les distracteurs sont réellement faux**. ผมไม่ชอบไข่ครับ (exercice 2,
  tirage 5) est correct. Les six blocs de l'exercice 4 sont correctement glosés.
- **Note culturelle** : la boucle de dictionnaire est réelle et double-sourcée.
  Elle se limite à ce que les sources disent et énumère explicitement ce qu'elle
  n'affirme pas. Rien à redire.

## 3. Findings bloquants

### B1. Le signe ◌็ est présenté comme inédit alors que 3B l'enseigne déjà

**BLOQUANT. Fait faux, répété en quatre endroits, dont un contenu apprenant.**

4D affirme :

- Méta : « Un seul signe est présenté en lecture accompagnée, ไม้ไต่คู้ (◌็),
  parce qu'il est visible dans เผ็ด et **qu'aucune leçon antérieure ne l'a
  rencontré** » ;
- item 2, `note_fr`, donc affiché à l'apprenant : « c'est **le premier mot du
  parcours** à le porter » ;
- dossier, section Codepoints : « **Signes nouveaux pour le parcours** : 0E47 » ;
- dossier, Absence de bloc d'écriture : « qu'aucune leçon antérieure ne l'a
  rencontré ».

Vérification dans `unite-03/lecon-3b.md` :

- 156 occurrences de U+0E47 ;
- **item 5 : « เอ็ด, le "un" de position d'unité »** ;
- **item 6 : « สิบเอ็ด et ยี่สิบเอ็ด, les deux blocs à mémoriser »** ;
- item 2 « le bloc "six à dix" », qui contient เจ็ด ;
- et surtout, dans son propre dossier de sources : « **Fonction abrégeante du
  signe ็ (U+0E47), source 1 : RID 2554, entrée "ไม้ไต่คู้"** ». 3B a donc non
  seulement rencontré le signe, mais l'a enseigné et sourcé, en interrogeant
  exactement la même entrée du RID que 4D présente comme sa nouveauté.

`unite-03/lecon-3e.md` réemploie เอ็ด et สิบเอ็ด. `unite-01/lecon-1a.md`
contient เด็ก.

La leçon sœur `lecon-4e.md` énonce d'ailleurs le contraire, correctement : « le
signe ็ (ไม้ไต่คู้), **rencontré en 3B dans เจ็ด et เอ็ด**, qui revient ici dans
เผ็ด ».

Conséquences : la page 3 réenseigne un signe déjà acquis sans le dire, la carte
`srs-u04-l4d-06` duplique une carte de 3B, et un apprenant qui a fait 3B lit une
affirmation fausse sur son propre parcours.

**Correction attendue** : reformuler la Méta, la `note_fr` de l'item 2 et la
section Codepoints en réemploi de 3B, et vérifier que la carte SRS ne double pas
celle de 3B.

### B2. Le contraste descendant contre montant n'est pas « travaillé en 1D »

**BLOQUANT. Référence interne fausse, qui masque une cible phonétique nouvelle.**

4D, Méta : « Cible phonétique : **aucune cible nouvelle**. La leçon réemploie le
contraste **descendant contre montant travaillé en 1D**, sur une seule paire qui
décide du sens au comptoir, ไม่ (mâi, descendant) contre ไหม (mǎi, montant). »

État réel de l'unité 1 :

- 1A : perception des cinq contours sur la série คา ข่า ค่า ค้า ขา (exposition,
  pas de duel) ;
- 1B : longueur vocalique ;
- 1C : « Mi contre bas » ;
- **1D : « Montant contre haut »**, cible déclarée « ton montant /˩˩˦/ contre ton
  haut /˦˥/ ». Le mot « descendant » n'y apparaît qu'une seule fois, dans la
  liste des étiquettes de tuiles d'un exercice. La paire travaillée y est
  ไหม contre ไม้, pas ไม่ contre ไหม ;
- 1E : réinvestissement, prérequis résumés par 1E elle-même comme « contrastes
  mi/bas et montant/haut ».

**Aucune leçon des unités 1 à 3 ne fait travailler le contraste descendant contre
montant.** 4D déclare donc « aucune cible nouvelle » sur la foi d'un
réinvestissement qui n'existe pas, alors que cette paire est présentée par la
leçon elle-même comme celle « qui décide du sens au comptoir ». La discrimination
la plus lourde de la leçon arrive sans échafaudage et sans être annoncée.

**Correction attendue** : soit déclarer honnêtement une cible phonétique
nouvelle et prévoir le travail correspondant, soit corriger la référence si un
duel descendant/montant est ajouté en amont. Ne pas se contenter de changer
« 1D » en « 1A ».

### B3. « Si vous allongez la dernière, vous glissez vers น้อย » est faux

**BLOQUANT. Ton faux dans une note d'enseignement, dans une leçon dont le sujet
est précisément que le ton décide du sens.**

Item 5, `note_fr` : « Si vous allongez la dernière, vous glissez vers น้อย, qui
est un autre mot. »

Valeurs recontrôlées sur deux sources indépendantes :

| mot   | ton      | longueur   | source A                           | source B                  |
| ----- | -------- | ---------- | ---------------------------------- | ------------------------- |
| หน่อย | **bas**  | **brève**  | Wiktionary /nɔj˨˩/, marqué `Short` | VOLUBILIS l. 62547 `_nǿi` |
| น้อย  | **haut** | **longue** | Wiktionary /nɔːj˦˥/                | VOLUBILIS l. 62550 `¯nøi` |

Les deux mots diffèrent par **deux** traits, la longueur et le ton. Allonger
`nàwi` sans rien changer d'autre produit /nɔ̀ːj/, qui n'est pas น้อย. La note
enseigne à l'apprenant qu'une seule erreur, de longueur, suffit à basculer vers
un autre mot, et lui masque le trait qui fait réellement la différence. C'est
l'inverse du message de la leçon.

À noter : le tableau des tons est correct partout ailleurs dans la leçon, y
compris pour l'item 4 dont cette note dépend. L'erreur est locale à la note.

**Correction attendue** : soit dire que น้อย se distingue par le ton haut et la
voyelle tenue, soit retirer la comparaison, qui n'est de toute façon pas
nécessaire à l'objectif.

### B4. Collision d'items avec 4E, sur un état de l'unité déclaré à tort

**BLOQUANT. Deux leçons de la même unité introduisent les mêmes trois items comme
nouveaux, et le dossier de 4D affirme comme vérifié un état du dépôt qui est
faux.**

4D, incertitude 5 : « **Au 2026-08-03, `content/authoring/unite-04/` ne contient
que ce fichier : 4A, 4B, 4C et 4E n'existent pas.** »

État réel du répertoire :

```
lecon-4b.md   (Manger, boire, avoir faim)
lecon-4c.md   (Commander un plat)
lecon-4d.md
lecon-4e.md   (Au restaurant)
```

Seul 4A n'existe pas. 4C et 4E portent même une date de modification antérieure
à celle de 4D.

Collision de contenu, et non simple coexistence :

- `lecon-4e.md` déclare en Méta : « Elle n'introduit que deux items, **เผ็ด et
  ไม่** », puis « **Items nouveaux : deux, เผ็ด et ไม่** », et son item 1 est
  titré « **เผ็ด (nouveau)** » ;
- son item 3 est **ไม่เผ็ด** ;
- ce sont exactement les items 1, 2 et 3 de 4D, avec les mêmes graphies, les
  mêmes IPA et les mêmes transcriptions.

Par ailleurs, `lecon-4b.md` enseigne อร่อย comme item, que 4D déclare « ÉCARTÉ,
hors objectif … Candidat naturel pour une leçon de l'unité 4 » sans savoir que
cette leçon existe déjà.

Enfin, la ligne d'état des audits de 4D demande de confirmer que ไม่, ชอบ et มาก
ne sont pas déjà enseignés « par 4A, 4B ou 4C » : elle omet précisément 4E, la
seule leçon qui les enseigne effectivement.

**Correction attendue** : arbitrer au niveau de l'unité quelle leçon introduit
ไม่, เผ็ด et ไม่เผ็ด, et faire du réemploi dans l'autre. Corriger l'incertitude 5
et la ligne d'audit correspondante. Tant que ce point n'est pas tranché, l'unité
4 n'est pas consolidable, quel que soit l'état de 4D prise isolément.

## 4. Findings non bloquants

### N1. « Signes nouveaux pour le parcours » : ช n'est pas nouveau

La section Codepoints déclare deux signes nouveaux, U+0E47 (voir B1) et
`0E0A THAI CHARACTER CHO CHANG`. Or ช figure déjà dans l'item **ชื่อ** de
`unite-02/lecon-2d.md` (item 5), réemployé comme item dans `lecon-2e.md`. Le
contrôle de nouveauté n'a manifestement jamais été passé contre les leçons
antérieures : c'est le même défaut de méthode que B1, sur un signe moins
structurant.

### N2. La calibration THAIPHON de VOLUBILIS est falsifiée par deux entrées, dont une citée par la leçon

Le dossier infère que, pour /ɔ/, VOLUBILIS note la voyelle longue `ø` et la brève
`ǿ`, et l'incertitude 11 juge l'inférence « cohérente sur les quatre contrôles ».

L'inférence a été retestée sur 14 mots dont la longueur est indépendamment
établie. Elle tient dans 12 cas (เกาะ `_kǿ`, เพราะ `¯phrǿ`, เหมาะ `_mǿ`,
เคาะ `¯khǿ`, ต้อง `\tǿng`, ห้อง `\hǿng`, ปล่อย `_plǿi`, บ่อย `_bǿi` tous brefs ;
ขอ, พอ, รอ, ของ, สอง, ทอง, มอง, ยอด, ร้อย, คอย tous longs), mais elle est
contredite par deux entrées :

- **อร่อย, ligne 2297, `-a_røi`** (marqueur « long ») alors que Wiktionary donne
  /ʔa˨˩.rɔj˨˩/ et marque explicitement la syllabe `Short`. Cette ligne est citée
  par 4D elle-même, dans la section des items écartés ;
- **สร้อย, ligne 93418, `\søi`** (marqueur « long ») alors que Wiktionary donne
  /sɔj˥˩/, marqué `Short`.

Aucun item de 4D n'est affecté : la longueur de ชอบ (longue) et celle de หน่อย
(brève) restent confirmées par deux sources concordantes. Mais l'incertitude 11
surévalue la fiabilité de l'inférence, et VOLUBILIS ne peut pas servir de garant
de longueur pour /ɔ/ sans recoupement. À reformuler avec ces deux
contre-exemples nommés.

### N3. Exercice 3 : les listes de variantes acceptées contredisent la politique de saisie

La politique énoncée juste au-dessus des tirages pose que les signes de ton sont
facultatifs et que le point médian peut être remplacé par une espace ou par
rien. Le tirage 1 en tire les quatre combinaisons (`mâi phèt`, `mai phet`,
`mâiphèt`, `maiphet`). Les quatre autres tirages en oublient au moins une :

- tirage 2 : `phetnitnawi`, `phèt nít nàwi` et `phètnít·nàwi` manquants ;
- tirage 3 : `maichawwp` manquant ;
- tirage 4 : `phetmaak` manquant ;
- tirage 5 : `chawwpmaak` manquant.

Un compilateur qui prend la liste énumérée pour clé refusera des réponses
correctes au regard de la politique affichée. À rendre exhaustif, ou à générer
depuis la politique plutôt qu'à énumérer.

### N4. La variante ผมชอบไข่มากครับ ne montre pas « la même géométrie »

Le dialogue présente cette variante comme servant « à montrer la même géométrie
dans l'autre sens ». Or มาก n'y suit pas ชอบ : il suit le complément ไข่. La
phrase est du thaï naturel, mais elle contredit la règle simple que la leçon
vient d'installer (« มาก derrière le mot qu'il dose »), et un apprenant appliquant
la règle produirait ผมชอบมากไข่.

Deux points aggravants : cet assemblage ne figure pas dans la liste des
« assemblages à faire valider par l'audit de naturalité », qui recense pourtant
les répliques 2, 3, 5, 6 et 7 ; et il n'est adossé à aucune source, alors que
ไม่เผ็ดมาก a été écarté précisément faute de source. C'est la même question de
portée que l'incertitude 2, non identifiée comme telle.

### N5. ไหม n'est pas un item de 2B

La section Reprises écrit « ไหม (mǎi), item de `u02-l2b` ». `lecon-2b.md`
n'enseigne que des blocs (สบายดีไหมครับ, สบายดีไหมคะ) ; ไหม n'y est pas un item.
Il n'apparaît comme item que dans `lecon-2e.md`, qui le présente lui-même comme
« réemploi, enseigné en 2B ». L'attribution circule dans le corpus sans avoir
jamais été vérifiée. Le prérequis de 4D reste correct au niveau du bloc, seule
l'attribution d'item est fausse.

### N6. Le graphème `awi` pour /ɔj/ n'est documenté nulle part

Le piège de l'exercice 3 invoque « la convention notant /ɔj/ par `awi` depuis
2C », et l'item 4 parle du « graphème `awi` ». L'usage existe bien dans 2C, mais
ni la v1, ni l'amendement v1.1, ni l'amendement v1.2 de `CONVENTIONS.md` ne
listent /ɔj/. Une règle de correction opposable à l'apprenant ne peut pas
reposer sur un précédent non écrit. À verser à un amendement v1.3.

### N7. Trois incohérences internes

- Exercice 1 : « Options, affichées ensemble **aux quatre tirages** », alors que
  la ligne suivante annonce « Tirages : **8 au total** ». La suite des 8 tirages
  est par ailleurs correcte (aucune cible répétée deux fois de suite).
- Ligne de compréhension du dialogue : มาก est listé parmi les mots « introduits
  par cette leçon » présents dans le dialogue, alors qu'il n'apparaît que dans
  les variantes affichées après l'écoute.
- Section Reprises : « น้อย … n'apparaît PAS à l'écran », alors qu'il figure dans
  la `note_fr` de l'item 5, champ que le contrat d'item destine à l'apprenant.
  À trancher à la compilation, en lien avec B3.

### N8. Trois citations VOLUBILIS tronquées sans marque d'omission

Lignes 9312, 53109 et 9329 : la leçon place entre guillemets les premières
gloses et coupe la fin sans points de suspension. Rien de faux n'en découle, mais
un relecteur qui recompte les gloses croira à une divergence de version.

## 5. Ce que cet audit ne tranche pas

- La **revue native** reste en attente et reste la seule voie pour les
  incertitudes 8 (degré réel de ไม่ชอบ) et 9 (lecture pragmatique de เผ็ดไหม).
  Ces deux incertitudes sont correctement posées.
- La réplique 7 (ค่ะ employé seul en réponse à un refus) mérite une mention :
  la glose VOLUBILIS invoquée, ligne 28945, précise « formule de politesse en fin
  de réponse **affirmative** ». La source n'est donc pas seulement muette sur cet
  emploi, elle le cadre autrement. À verser au dossier de revue native.
- La **contre-vérification RID manuelle** (incertitude 1) reste requise : le
  présent audit est lui aussi automatisé, il confirme les relevés mais ne
  remplace pas la porte manuelle.
- Aucun **audio** n'existe. Les exercices 1 et 3 et le dialogue en dépendent
  intégralement. Les contraintes de production consignées par la leçon (voix
  unique pour l'exercice 1, deux voix pour le dialogue, débit égal entre options)
  sont pertinentes et doivent être respectées.

## 6. Suite

Les quatre findings bloquants doivent être résolus avant tout passage
`draft → review`. B4 relève de l'unité entière et ne peut pas être corrigé dans
le seul fichier 4D. B1 et B2 imposent de rejouer le contrôle de nouveauté de tous
les signes et de toutes les cibles phonétiques de l'unité 4 contre les unités 1 à
3, contrôle qui n'a manifestement été fait pour aucune des deux.
