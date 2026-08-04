# Contre-audit adversarial de `unite-08/lecon-8c.md`

- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Fichier audité : `content/authoring/unite-08/lecon-8c.md`, statut `draft`
- Cadre : `content/authoring/CONVENTIONS.md` (v1 + amendements v1.1 et v1.2) et
  `docs/content-policy/sources-verification.md` (dont la section 1 bis)
- Consigne : chercher des erreurs, ne rien accepter sur parole. Toutes les
  sources citées par la leçon ont été RE-CONSULTÉES par l'auditeur ; aucune
  affirmation du dossier de production n'a été reprise sans contrôle.
- Note de périmètre : la consigne mentionnait aussi une priorité « 8A, les deux
  marques de ton restantes ». Au 2026-08-04, `content/authoring/unite-08/` ne
  contient que `lecon-8c.md` : 8A n'existe pas et n'a pas pu être audité. Le
  tableau de 7A a néanmoins été relu, parce que la page 8 de 8C s'y appuie ;
  c'est de là que sort le finding F1.

## 1. Ce que l'auditeur a lui-même vérifié

**89 faits atomiques re-vérifiés, 0 sur parole.** Détail des relevés ci-dessous.

### 1.1 Royal Institute Dictionary 2554 (12 faits)

Accès : `node scripts/verification/rid-lookup.mjs` puis requête POST directe sur
`https://dictionary.orst.go.th/func_lookup.php`, paramètres
`word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
`x-requested-with: XMLHttpRequest`, une requête par graphie espacée de 1,3 s,
agent utilisateur identifiant le projet. Faits cités par référence, aucune
définition reproduite.

`rid-lookup.mjs` sur ถูก, ใหญ่, เล็ก, เกิน, เกินไป, แพง : **six sur six
`entree`**, zéro erreur, zéro absence. Décompte identique à celui du dossier.

| #   | Fait re-vérifié                                                                                                                                                                                       | Verdict            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | ถูก porte DEUX vedettes numérotées, ถูก ๑ et ถูก ๒                                                                                                                                                    | confirmé           |
| 2   | ถูก ๑ est étiquetée ก. et porte cinq sens : contact, convenance, coïncidence et absence d'erreur, adéquation, auxiliaire de subissement                                                               | confirmé           |
| 3   | Le cinquième sens porte la réserve explicite « มักใช้ในข้อความที่ทำให้ผู้ถูกทำเดือดร้อนหรือไม่พอใจ »                                                                                                  | confirmé           |
| 4   | La liste ลูกคำ de ถูก ๑ compte **exactement seize** entrées (ถูกกระทำ, ถูกกัน, ถูกขา, ถูกคอ, ถูกคู่, ถูกใจ, ถูกโฉลก, ถูกชะตา, ถูกต้อง, ถูกตา, ถูกน้อย, ถูกปาก, ถูกส่วน, ถูกเส้น, ถูกใหญ่, ถูกอกถูกใจ) | confirmé           |
| 5   | ถูก ๒ donne le prix bas, défini par référence à แพง, et ne porte AUCUNE liste de dérivés                                                                                                              | confirmé           |
| 6   | ถูก ๒ est étiquetée ก. et non ว.                                                                                                                                                                      | confirmé (voir F6) |
| 7   | เกินไป est étiquetée ว. et définie comme un élément d'adjonction en FIN de คำวิเศษณ์                                                                                                                  | confirmé           |
| 8   | เกินไป donne trois exemples, et les trois postposent เกินไป                                                                                                                                           | confirmé           |
| 9   | เกินไป déclare เกิน comme แม่คำ, et เกิน porte เกินไป dans ses ลูกคำ                                                                                                                                  | confirmé           |
| 10  | ใหญ่ : vedette unique en deux parties, toutes deux ว. ; la première se clôt par une définition en creux « มีขนาดไม่เล็ก », exemple บ้านหลังใหญ่ ; la seconde donne l'intensité d'une action           | confirmé           |
| 11  | เล็ก : vedette unique ว., comparaison puis « มีขนาดไม่โต » avec บ้านหลังนี้เล็ก, puis sens figuré ; **exactement deux** ลูกคำ, เล็กน้อย et เล็กพริกขี้หนู                                             | confirmé           |
| 12  | แพง ๑ : ว., prix élevé, déclaré ตรงข้ามกับ ถูก                                                                                                                                                        | confirmé           |

### 1.2 Wiktionary, éditions en et th (10 faits)

Accès : wikitexte brut (`action=raw`) ET rendu (`action=parse`), le 2026-08-04.
Les deux éditions sont traitées comme UN seul écosystème, jamais comme deux
sources indépendantes ; ce traitement du dossier est correct.

| #   | Fait re-vérifié                                                                                                                                                                                                                         | Verdict  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 13  | en:ถูก IPA `/tʰuːk̚˨˩/`, Paiboon `tùuk`, Royal Institute `thuk`                                                                                                                                                                          | confirmé |
| 14  | en:ถูก sépare deux étymologies ; étym. 1 = adjectif « (of a price) cheap ; inexpensive ; low », antonyme แพง, exemple ราคาถูก ; étym. 2 = verbe à **sept** sens, dont l'auxiliaire de voix passive                                      | confirmé |
| 15  | en:ถูก note d'usage : le marqueur passif « is only used when the target of the action undergoes something unfavourable »                                                                                                                | confirmé |
| 16  | th:ถูก : même partage en deux รากศัพท์ ; la première réunit คำกริยา (contact) et คำกริยาวิเศษณ์ (justesse) et porte ลูกคำ ถูกโฉลก et ถูกต้อง ; la seconde ne contient que l'adjectif du prix, glosé « มีราคาต่ำ, ไม่แพง », antonyme แพง | confirmé |
| 17  | en:ใหญ่ IPA `/jaj˨˩/`, Paiboon `yài`, RI `yai`, réécriture phonémique ไหฺย่ (พินทุ sous le ห), antonyme เล็ก                                                                                                                            | confirmé |
| 18  | th:ใหญ่ : définition โต / มีขนาดไม่เล็ก, คำตรงกันข้าม เล็ก et น้อย                                                                                                                                                                      | confirmé |
| 19  | en:เล็ก IPA `/lek̚˦˥/`, Paiboon `lék`, RI `lek`, exemple หินก้อนเล็ก, antonyme ใหญ่                                                                                                                                                      | confirmé |
| 20  | th:เล็ก : trois sens, คำตรงข้าม ใหญ่ (la page 3 de 8C dit vrai : dans les DEUX éditions chacun des deux mots est donné comme le contraire de l'autre)                                                                                   | confirmé |
| 21  | en:เกินไป IPA `/kɤːn˧.paj˧/`, Paiboon `gəən-bpai`, RI `koen-pai`, adverbe « too much ; too ; excessively », synonyme มากไป, étymologie เกิน + ไป, **aucune note de position**                                                           | confirmé |
| 22  | th:เกินไป reprend mot pour mot la définition du RID ET ses trois exemples. La réserve d'indépendance écrite par le dossier est **justifiée** et honnête                                                                                 | confirmé |

Vérifié en outre : en:แพง IPA `/pʰɛːŋ˧/`, antonymes ถูก et เยา, ce qui appuie la
note culturelle.

### 1.3 VOLUBILIS (14 faits)

Exemplaire employé par l'auditeur, identité établie par empreinte :
`10 848 409` octets, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`. Sortie du
script versionné `scripts/verification/volubilis-lookup.mjs` : **586 541**
chaînes partagées, **114 579** lignes non vides. Chaînes internes du classeur :
« VOLUBILIS Database » et « v. 26.2 (Jul. 2026) ». **Le classeur ne contient
qu'une seule feuille, nommée `Volubilis`** (point décisif pour F5).

| #   | Ligne     | Contenu re-relevé                                                                                                                           | Verdict  |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 23  | 103833    | ถูก, `_thūk`, v., « touch ; come into contact with », FRA « toucher »                                                                       | confirmé |
| 24  | 103834    | ถูก, v., « suffer ; undergo ; be a victim of ; be hit by ; fall into »                                                                      | confirmé |
| 25  | 103836    | ถูก, v., prix bas, **DOM `RID`** : écartée à juste titre                                                                                    | confirmé |
| 26  | 103837    | ถูก, adj., « right ; correct ; accurate ; true », FRA « exact ; correct ; vrai ; juste »                                                    | confirmé |
| 27  | 103838    | ถูก, **adj.**, DOM `TOURIST`, ENG « cheap ; inexpensive ; low-cost, low-price », FRA « bon marché ; pas cher »                              | confirmé |
| 28  | 111345    | ใหญ่, `_yai`, adj., DOM `ORNITHO ; TOURIST ; ZOOL`, FRA « grand ; large ; vaste ; gros ; volumineux » ; aucune ligne de ใหญ่ ne porte `RID` | confirmé |
| 29  | 111346-47 | ใหญ่, sens de principal et de responsable, colonne `M` = [ไหฺย่]                                                                            | confirmé |
| 30  | 48524     | เล็ก, `¯lek`, adj., domaines `ORNITHO ; RID ; TOURIST ; ZOOL` : la réserve d'indépendance écrite par le dossier est exacte                  | confirmé |
| 31  | 42721     | เกินไป, `-koēn-pai`, adv., **DOM `RID`** ; l'exclusion de cette ligne pour le fait de position est correcte                                 | confirmé |
| 32  | 67669     | แพงเกินไป, `-phaēng -koēn-pai`, adj., DOM `COMM`, FRA « trop cher », sans `RID`                                                             | confirmé |
| 33  | 111366    | ใหญ่เกินไป, `_yai -koēn-pai`, adj., sans DOM, `M` = [ไหฺย่ เกิน-ไป]                                                                         | confirmé |
| 34  | 48591     | เล็กเกินไป, `¯lek -koēn-pai`, adj., sans DOM, `M` = [เล็ก เกิน-ไป]                                                                          | confirmé |
| 35  | 53248-49  | มากเกินไป, `\māk -koēn-pai`, adj. et adv., sans DOM                                                                                         | confirmé |
| 36  | aucune    | **ถูกเกินไป : ABSENT** de l'exemplaire                                                                                                      | confirmé |

Vérifié aussi : อันนี้ ligne 1579 (`-an ¯nī`, pr.) et แพง ligne 67653
(`-phaēng`, adj., DOM `TOURIST`).

### 1.4 FrequencyWords, signal indicatif (13 faits)

Fichier `2018_th50k.txt`, `1 504 712` octets, SHA-256
`20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`, empreinte
identique à celle consignée par la leçon. Rangs recalculés par l'auditeur sur
les 50 000 lignes : ถูก 754 (519 occ.), ถูกต้อง 170 (2 112 occ.), มาก 1301,
เล็ก 2771 (142), อันนี้ 2932, ใหญ่ 4136 (95), เกิน 6852 (57), เกินไป 7766 (50),
แพง 24549 (16). แพงเกินไป, ใหญ่เกินไป et เล็กเกินไป : **ABSENTS**. Tous les
chiffres cités par la leçon sont exacts au token près.

### 1.5 Unicode (10 faits)

Les huit graphies des champs `thai` ont été ré-énumérées programmatiquement :
les huit séquences `codepoints` sont **exactes**, les huit chaînes sont en NFC,
leur forme NFD leur est identique, aucun caractère de la zone à usage privé.
Contrôle confirmé, à une exception près, voir F8.

### 1.6 Cohérence avec le dépôt (14 faits)

- `u02-l2a` item 7 แพง : IPA `/pʰɛːŋ˧/`, ton moyen, longueur longue,
  transcription `phaeeng`, « cher (d'un prix élevé) » : repris sans
  modification. **Confirmé.**
- `srs-u02-l2a-05` porte bien, en toutes lettres, « la production n'est pas
  exigée en 2A ». **Confirmé.**
- `u03-l3c` item 5 อันนี้ : IPA, tons, transcription et points de code
  concordants ; les blocs อันนี้เท่าไรครับ et ห้าสิบบาท y sont publiés.
  **Confirmé.**
- `u01-l1e` : สวัสดี `sawàtdii`, ครับ `khráp` (/kʰrap̚˦˥/, haut, courte),
  ค่ะ `khâ`, ขอบคุณ `khàwwp·khoun`. **Confirmé**, la transcription du dialogue
  reprend exactement les items publiés.
- `u02-l2c` item 3 ไม่เป็นไร `mâi·pen·rai`. **Confirmé.**
- `u04-l4d` item 8 มาก, note publiée : « se place après ce qu'il intensifie,
  exactement à l'opposé de ไม่ ». **Confirmé**, la page 7 dit vrai.
- `u05-l5a` : ผัก et มาก sont bien des items de 5A, dont la cible est les
  finales `-p -t -k` non relâchées. **Confirmé.**
- `u05-l5b` item 1 ไป. `u05-l5c` item 1 อยู่ `yòuu` (graphème `ouu`).
  `u06-l6a` items 5 et 6 เธอ `thoee` et เจอ `joee` (graphème `oee`).
  `u06-l6c` items 5 et 6 เขาใจดี et เขาสูงไหม, avec la page 4 « le thaï pose la
  personne, puis la qualité, et rien entre les deux ». `u03-l3d` item 4 อัน.
  **Tous confirmés.**
- `u07-l7a` page 10 nomme bien la famille « consonne de tête » et les quatre
  formes ไ, ใ, เ◌า, ◌ำ comme hors du tableau, et met les syllabes mortes hors
  périmètre. **Confirmé** ; c'est ce qui rend F1 démontrable.
- ADR-0022 : aucun tiret cadratin ni demi-cadratin dans `lecon-8c.md`.
  **Confirmé.**

### 1.7 Contrôles arithmétiques des exercices (7 faits)

- Ex. 1 : 4 tirages avec เกินไป (2, 4, 6, 8) contre 4 sans (1, 3, 5, 7) ;
  stratégie constante plafonnée à 4/8, sous le seuil de 6/8. Tirage 8 : ses
  trois options portent toutes เกินไป, la stratégie « la plus longue » y échoue.
  Espérance au hasard 8/3 = 2,67. **Tous les chiffres confirmés.**
- Ex. 2 : six libellés français distincts, correspondance un pour un, plafond
  mécanique de 1/6 pour une réponse constante. **Confirmé.**
- Ex. 3 : 3 tirages avec เกินไป, 2 sans ; « toujours l'employer » plafonne à
  3/5, « jamais » à 2/5, seuil 4/5. **Confirmé.**
- Ex. 4 : six bonnes réponses distinctes, plafond 1/6 pour une constante,
  espérance au hasard 6/4 = 1,5. **Confirmé** pour les bonnes réponses, mais
  non vérifiable pour l'ensemble du tirage, voir F10.
- Transcription : les huit items respectent `thainaute-fr` v1.1 (graphèmes
  `ouu`, `ai`, `e`, `oe`/`oee`, `ae`/`aee`, `aw`/`aww` ; accent de ton sur la
  première lettre du noyau ; point médian de syllabation). **Confirmé.**

## 2. Findings

Sept findings BLOQUANTS, cinq non bloquants.

### F1 (BLOQUANT) : « Aucun des quatre mots nouveaux n'entre dans la règle de 7A » est faux

**Où** : page 8, son titre, et la dernière puce de « Ce que la leçon n'ouvre
pas » (« la lecture du ton des quatre mots nouveaux, dont aucun n'entre dans la
règle de 7A »).

**Ce qui est faux** : le quatrième mot nouveau est เกินไป, et sa première
syllabe เกิน entre exactement dans le tableau. Décomposition : initiale ก,
classe MOYENNE (les neuf moyennes de `u01-l1a`, rappelées par `u04-l4a`) ;
noyau เ◌ิ, qui ne figure dans AUCUNE des quatre formes écartées par 4A puis 7A
(ไ, ใ, เ◌า, ◌ำ) ; finale น, donc syllabe VIVANTE au sens de la définition citée
par 7A page 4 (« voyelle longue sans consonne finale, ou finale en ง, น, ม, ย
ou ว ») ; aucune marque de ton. La case est donc « MOYENNE : rien → moyen »,
première colonne du tableau de la page 6 de 7A, et le ton réel de เกิน est bien
MOYEN, comme l'item 4 le donne lui-même (`/kɤːn˧/`).

**Aggravant** : la page 8 n'examine jamais เกิน. Elle traite ถูก, เล็ก, ใหญ่,
puis **ไป**, qui n'est pas un mot nouveau du jour : c'est un item publié de
`u05-l5b`, cité comme prérequis quatre lignes plus haut dans la même leçon. La
substitution fait disparaître le seul cas qui contredit l'affirmation.

**Conséquence** : le titre « quatre mots dont vous ne pouvez pas lire le ton »
est faux, et la leçon apprend à l'apprenant à renoncer devant une syllabe que la
règle qu'il vient d'acquérir lit sans difficulté. C'est une case du tableau de
7A rendue inopérante par une leçon postérieure.

**Correction minimale** : traiter เกิน explicitement (« celui-là, vous savez le
lire : ก moyenne, syllabe vivante, aucune marque, donc ton moyen ») et
restreindre l'affirmation aux trois mots d'état plus la syllabe ไป.

### F2 (BLOQUANT) : La « Cible de la leçon » licencie ถูกเกินไป, que la leçon refuse

**Où** : Méta, « Cible de la leçon » : « Trois mots d'état nouveaux, ถูก, ใหญ่
et เล็ก, qui rejoignent แพง déjà connu, et une seule construction, เกินไป, qui
transforme **n'importe lequel de ces mots** en reproche. »

**Ce qui est faux** : « ces mots » désigne les quatre, ถูก compris. Or le
dossier de production consacre une section entière (« Un cas qui NE l'est pas,
et qui n'est donc pas enseigné ») à refuser ถูกเกินไป, et l'exercice 3 tirage 4
fait RETIRER le bloc เกินไป devant ถูก. La cible affirme donc exactement ce que
la leçon passe une section et un tirage à écarter.

**Conséquence** : un apprenant qui lit la cible produit ถูกเกินไป, forme que la
leçon ne veut ni enseigner ni corriger. Contradiction interne entre l'objectif
annoncé et le corrigé de l'exercice 3.

### F3 (BLOQUANT) : Affirmation de fréquence relative des sens, non sourcée et démentie par le dossier lui-même

**Où** : Méta, « Point d'attention traité à l'écran » : « le sens "bon marché"
n'est ni le seul ni le plus courant ».

**Ce qui est faux** : « ni le plus courant » est un classement de fréquence
entre les sens d'une même graphie. Aucune source du dossier ne l'établit, et le
dossier le dit lui-même à deux endroits :

- « Ce que la leçon N'affirme PAS » : « Elle n'affirme rien sur la fréquence
  relative des sens de ถูก. »
- Incertitude 2 : « Le rang de fréquence de ถูก est inexploitable tel quel […]
  La liste ne permet pas de le vérifier, et le dossier ne l'affirme donc pas. »

L'auditeur a recalculé le rang lui-même : ถูก est au rang 754 avec 519
occurrences, **tous sens confondus**, sur un corpus de sous-titres non annoté.
Ce chiffre ne dit rien de la répartition par sens. Le nombre de sens et de
dérivés du RID ne l'établit pas davantage : c'est un fait de lexicographie, pas
un décompte d'usage.

**Aggravant** : « Ce que la leçon N'affirme PAS » décrit en outre la page 4 de
travers, en lui prêtant de dire que les autres sens « sont courants ». La page 4
ne dit pas cela ; la Méta, si.

### F4 (BLOQUANT) : Deux corrigés opposés pour un stimulus identique, ถูก présenté seul

**Où** : quatre endroits, deux réponses inconciliables.

| Emplacement      | Stimulus                                           | Réponse exigée                             |
| ---------------- | -------------------------------------------------- | ------------------------------------------ |
| Ex. 4, tirage 4  | ถูก, « présenté seul, sans aucun cadre »           | « on ne peut pas savoir sans le contexte » |
| `srs-u08-l8c-03` | ถูก, « présenté seul, sans cadre »                 | « le sens dépend du contexte »             |
| Ex. 2, paire 2   | ถูก, carte isolée, aucun cadre                     | « bon marché »                             |
| `srs-u08-l8c-01` | ถูก, « reconnaissance à l'écoute et à la lecture » | le sens enseigné, donc « bon marché »      |

L'exercice 1 (tirages 1, 3 et 7) affiche également l'option « ถูก (thòuuk, bon
marché) » hors de tout cadre, et `srs-u08-l8c-04` demande le couple แพง et ถูก
« dans les deux sens de traduction », donc aussi thaï vers français sur le mot
nu.

**Conséquence** : l'un des deux corrigés est nécessairement faux. Un apprenant
qui a intégré la page 4 et la carte 03 échoue à l'exercice 2 et à la carte 01 ;
l'inverse est vrai aussi. La leçon mesure donc, sur le même stimulus, deux
comportements contradictoires, et la page 10 (« ถูก ailleurs veut dire autre
chose ») ne tranche pas laquelle des deux situations est « ailleurs ».

**Correction minimale** : encadrer explicitement tous les emplois d'exercice de
ถูก (étiquette, boutique, prix), ou retirer ถูก isolé de l'exercice 2 et de la
carte 01. La leçon ne peut pas à la fois enseigner l'indécidabilité et la
sanctionner.

### F5 (BLOQUANT) : Référence mal citée : la feuille `Codes` n'existe pas dans le classeur cité

**Où** : item 3, champ `sources` : « VOLUBILIS Database.xlsx v26.2, ligne 48524
[…] Le marqueur `¯` note le ton haut, **feuille `Codes`** ».

**Ce qui est faux** : l'auditeur a ouvert l'exemplaire exact désigné par le
dossier (SHA-256 `b9ab7418…fc0c`, 10 848 409 octets) et énuméré ses feuilles.
Le classeur `.xlsx` **ne contient qu'une seule feuille, nommée `Volubilis`**
(`xl/worksheets/` ne contient que `sheet1.xml`). La feuille `Codes` existe dans
un AUTRE exemplaire, `VOLUBILIS.ods` (SHA-256 `bb9c5da5…a094cc`, 15 724 718
octets), qui compte trois feuilles : `Volubilis`, `Codes`, `Romanization`.

Le fait sous-jacent est vrai : la feuille `Codes` de l'`.ods` donne bien la clé
des marqueurs, et donne au passage `adj.` = « วิเศษณ์ (ว.) », ce qui sert au
finding F6. Mais la citation est irreproductible telle qu'écrite, ce que
l'amendement v1.2 interdit expressément (« un tiers puisse refaire la
consultation à l'identique »).

**Correction minimale** : citer la feuille `Codes` du classeur `.ods` avec son
empreinte propre, ou supprimer la mention de feuille. L'incertitude 4 signale
déjà l'écart de numérotation entre les deux exemplaires, mais pas cet écart de
structure, qui est plus grave parce qu'il rend une citation impossible à suivre.

### F6 (BLOQUANT) : L'argument « ถูก ๒ n'est pas ว. » est mono-sourcé et contredit par les pièces du dossier

**Où** : dossier de production, « Un cas qui NE l'est pas, et qui n'est donc pas
enseigné » : « Le RID étiquette ถูก ๒ comme ก., verbe, et non comme ว. La
construction "ถูกเกินไป" n'est donc pas licenciée par la définition même de
"เกินไป" ».

**Ce qui cloche** : l'étiquette ก. du RID est exacte, l'auditeur l'a relevée
lui-même. Mais elle est la **seule** pièce qui va dans ce sens, et les trois
autres sources du dossier disent l'inverse, sans que le dossier le mentionne :

- VOLUBILIS ligne 103838, la ligne que le dossier RETIENT pour l'item 1, porte
  `TYPE = adj.` pour le sens « bon marché » ; et la feuille `Codes` du même
  projet traduit `adj.` par « วิเศษณ์ (ว.) », c'est-à-dire exactement la classe à
  laquelle « เกินไป » déclare s'adjoindre ;
- en.wiktionary range le sens du prix sous **Adjective** ;
- th.wiktionary le range sous **คำคุณศัพท์**.

La leçon applique ailleurs un raisonnement de licence par catégorie (« Le RID
étiquette lui-même ใหญ่, เล็ก et แพง ๑ comme ว. […] Les trois blocs enseignés
sont donc licenciés »). Appliqué à VOLUBILIS, ce même raisonnement licencie
ถูกเกินไป. Le dossier tranche donc sur une seule autorité en taisant trois
pièces contraires qu'il a lui-même relevées.

**Ce qui reste juste** : la DÉCISION de ne pas enseigner ถูกเกินไป est prudente
et sans risque, et la leçon ne déclare nulle part la forme fautive.
L'incertitude 3 le dit bien. C'est la MOTIVATION écrite qui est incomplète, et
elle est incomplète au détriment de la seule conclusion qu'elle sert.

**Correction minimale** : réécrire l'incertitude 3 en nommant les trois pièces
contraires, et fonder la décision sur l'absence d'attestation du bloc plutôt que
sur une étiquette contestée par les autres sources.

### F7 (BLOQUANT) : Section 1 bis violée, et conformité faussement déclarée

**Où** : trois endroits.

- Item 5, `note_fr` : « beaucoup de francophones ont tendance à monter en fin de
  groupe, ce qui s'entend immédiatement ».
- Item 8, `note_fr` : « l'envie française de la faire monter vers la fin est **le
  principal défaut** à corriger à l'enregistrement ».
- Dossier, « Ce que la leçon N'affirme PAS » : « Elle n'affirme aucun absolu sur
  le français. »

**Ce qui cloche** : les deux premières sont des affirmations sur la prosodie des
locuteurs francophones. Elles relèvent donc de la section 1 bis de
`docs/content-policy/sources-verification.md`, qui n'admet que deux formes :
sourcée par deux sources indépendantes, ou reformulée en observation vérifiable
par l'apprenant. Aucune source n'est donnée, et aucune des deux n'est
reformulée en observation. La seconde est de surcroît un **superlatif** (« le
principal défaut »), que 1 bis proscrit nommément.

La troisième affirmation, elle, déclare une conformité que le fichier ne tient
pas. C'est ce point qui rend le finding bloquant plutôt que cosmétique : le
dossier de preuve certifie un contrôle qui n'a pas été fait.

**Ce qui est en revanche correct** : la page 6 est irréprochable. « Dites "trop
cher" à voix haute, puis "trop grand" » est exactement la reformulation en
observation vérifiable qu'exige 1 bis, et l'auditeur la confirme conforme.

**Correction minimale** : ramener les deux notes à une observation (« écoutez
votre enregistrement : votre voix remonte-t-elle sur la dernière syllabe ?
comparez avec la référence »), et retirer la déclaration de conformité tant
qu'elle n'est pas vraie.

### F8 (non bloquant) : Le contrôle Unicode déclaré est faux sur son inventaire et incomplet sur son périmètre

**Où** : dossier, « Contrôle Unicode » : « effectué le 2026-08-04 sur les **neuf
graphies** du fichier […] Les **deux** signes non consonantiques employés sont
◌็ (U+0E47) dans เล็ก et ◌่ (U+0E48) dans ใหญ่. »

**Ce qui est faux** : l'énumération programmatique des huit champs `thai` de la
leçon fait apparaître **sept** signes suscrits ou souscrits, pas deux :

`U+0E31` (◌ั, deux fois : อันนี้ et ครับ) · `U+0E34` (◌ิ, เกิน) · `U+0E35`
(◌ี, นี้) · `U+0E39` (◌ู, ถูก) · `U+0E47` (◌็, เล็ก) · `U+0E48` (◌่, ใหญ่) ·
`U+0E49` (◌้, นี้).

Le périmètre annoncé est en outre trop étroit : les items ne comptent que huit
graphies, et surtout le contrôle ne couvre AUCUNE des chaînes réellement
affichées hors items : อันนี้เล็กเกินไปค่ะ (page 9), อันนี้ถูก et อันนี้ไม่แพง
et อันนี้ใหญ่เกินไป (exercice 4), สวัสดีครับ, ห้าสิบบาทค่ะ, ไม่เป็นไรค่ะ,
ขอบคุณครับ (dialogue). Ce sont pourtant elles que l'apprenant verra.

**Ce qui est vrai** : les huit séquences `codepoints` sont exactes, les huit
chaînes sont en NFC, leur NFD leur est identique, et aucune ne contient de
caractère de la zone à usage privé. L'auditeur le confirme séparément.

### F9 (non bloquant) : Décompte de tons faux dans la note de l'item 8

**Où** : item 8, `note_fr` : « Six syllabes dont **quatre au ton moyen
consécutives** au milieu ».

**Ce qui est faux** : le champ `ton` du même item donne an moyen ; níi HAUT ;
phaeeng moyen ; koeen moyen ; pai moyen ; khráp haut. Il y a quatre syllabes au
ton moyen en tout, mais seulement **trois consécutives** (phaeeng, koeen, pai) :
an en est séparé par níi, qui est haut. La note contredit le champ qu'elle
commente.

### F10 (non bloquant) : Exercice 4 : distracteurs non spécifiés, contrôle de la réponse constante invérifiable

**Où** : exercice 4, section « Options » et « Tirages ».

Seule la quatrième option est spécifiée (« on ne peut pas savoir sans le
contexte », présente à tous les tirages). Les trois autres ne le sont pour aucun
des six tirages. Le « Contrôle de la réponse constante » ne porte donc que sur
les six bonnes réponses : il établit qu'aucune réponse répétée ne dépasse 1/6,
mais **pas** qu'aucune stratégie de surface ne franchit le seuil de 5/6, ce qui
dépend entièrement des distracteurs absents. Les exercices 1, 2 et 3, eux,
énumèrent leurs options et sont vérifiables ; l'exercice 4 fait exception.

**Second point** : le cadre du tirage 3 (« dans une boutique, devant un objet,
**le vendeur parle du prix** ») annonce le champ sémantique de la réponse avant
toute lecture du thaï. Selon les distracteurs retenus, il peut suffire à
répondre sans lire อันนี้ถูก.

### F11 (non bloquant) : Prérequis inutilisé

**Où** : Méta, prérequis : « leçon 5E : ไกลไหม, le patron "mot d'état + ไหม" ».

ไหม n'apparaît **nulle part** dans la leçon : ni page d'enseignement, ni item,
ni exercice, ni dialogue, ni carte SRS. Les deux seules occurrences de la chaîne
dans le fichier sont cette ligne de prérequis et la ligne voisine sur 6C
(เขาสูงไหม). Un prérequis qui n'est jamais réemployé fausse la lecture de la
dépendance de la leçon et allonge sans motif la liste que l'apprenant est censé
posséder.

### F12 (non bloquant) : Arbitrage v1.2 sur les digrammes non appliqué, et version de convention périmée

**Où** : Méta, « Transcription : convention `thainaute-fr` v1.1 » ; pages 2, 3
et 8.

L'arbitrage v1.2 de `CONVENTIONS.md` impose que « toute leçon qui présente
ensemble deux voyelles dont l'une s'écrit en digramme doit montrer la paire côte
à côte **et nommer le noyau**, plutôt que laisser l'apprenant deviner pourquoi
l'accent se déplace ». La leçon met bien les paires côte à côte, mais ne nomme
jamais le noyau :

- page 2 : « แพง (phaeeng) contre ถูก (thòuuk) », accent sur le `o` du trigramme
  `ouu` d'un côté, aucun accent de l'autre ;
- page 3 : « ใหญ่ (yài) contre เล็ก (lék) », accent sur le `a` du digramme `ai`
  contre accent sur un graphème simple ;
- page 8 : « ถูก (thòuuk) · เล็ก (lék) · ใหญ่ (yài) », trois placements
  d'accent d'aspect différent en une ligne.

La déclaration de version est par ailleurs à revoir : le fichier se réclame de
v1.1 alors que `CONVENTIONS.md` porte deux amendements postérieurs, dont celui
qui régit les références du champ `sources` que la leçon applique déjà.

## 3. Ce que l'audit CONFIRME, sans réserve

Pour que la liste ci-dessus ne soit pas lue comme un verdict global, voici ce
qui résiste à un contrôle adversarial complet.

- **Le fait central de la leçon est solide.** La position postposée de เกินไป
  est établie par deux jambes réellement indépendantes, l'auditeur l'a vérifié
  ligne à ligne : la définition du RID (« คำประกอบท้ายคำวิเศษณ์ ») avec ses
  trois exemples tous postposés, et quatre entrées composées de VOLUBILIS dont
  aucune ne porte `RID` en colonne `DOM`. La mise à l'écart de th.wiktionary
  pour ce fait est justifiée : sa définition et ses trois exemples sont ceux du
  RID, mot pour mot.
- **Aucune graphie fausse.** Huit sur huit exactes, en NFC, séquences de points
  de code exactes.
- **Aucun ton faux, aucune longueur fausse.** Les six lignes du tableau de
  vérification du dossier ont été recalculées : concordance parfaite entre
  l'IPA de Wiktionary, le marqueur `ThaiPhon` de VOLUBILIS et les valeurs
  publiées par `u02-l2a` et `u03-l3c`. La mise en garde sur ˨˩ (bas) contre ˥˩
  (descendant) est correcte et utile.
- **Aucun sens faux.** Les gloses françaises des sept premiers items sont
  concordantes avec le RID, avec VOLUBILIS et avec les deux éditions de
  Wiktionary.
- **Aucun registre faux.** `neutre` pour les items 1 à 7, `poli, locuteur
masculin` pour l'item 8 avec la variante féminine signalée : conforme aux
  items publiés de `u01-l1e`.
- **Aucune référence inventée.** Toutes les entrées citées existent, toutes les
  lignes VOLUBILIS citées existent et portent bien ce qu'on leur fait dire,
  toutes les empreintes annoncées sont exactes. Le seul défaut de citation est
  F5, et il porte sur la feuille, pas sur l'existence de la donnée.
- **Aucun exercice réussissable par une réponse constante.** Les quatre
  contrôles arithmétiques ont été refaits et tiennent. Le tirage 8 de
  l'exercice 1 et les tirages 4 et 5 de l'exercice 3 sont de vrais verrous, pas
  des formalités.
- **Le double visage de ถูก est traité, et bien traité, dans la prose.** La
  page 4, la page 10, le tirage 4 de l'exercice 4 et la note culturelle disent
  franchement que le mot occupe deux vedettes sans lien. Le problème n'est pas
  l'absence de traitement, c'est que trois exercices et une carte SRS
  contredisent ce traitement, ce qui est le finding F4 et rien de plus.
- **Le refus d'employer `recall` est bien argumenté** et cohérent avec le
  périmètre du parcours.
- **L'honnêteté du dossier est réelle** sur plusieurs points coûteux :
  l'écartement de th.wiktionary, l'écartement de la ligne 103836, la réserve
  d'indépendance sur เล็ก, l'absence d'attestation de la phrase de l'item 8, la
  correction de l'URL SourceForge, l'écart de numérotation entre `.ods` et
  `.xlsx`. Ces déclarations ont été contrôlées et sont exactes.

## 4. Verdict

**Ne pas passer `draft → review` en l'état.** Sept findings bloquants, dont
trois (F1, F2, F4) sont des contradictions internes visibles par l'apprenant et
un (F1) casse une case du tableau construit en 7A.

Aucun de ces sept findings n'attaque le cœur linguistique de la leçon, qui est
juste et correctement sourcé. Six sur sept se corrigent par réécriture, sans
nouvelle consultation de source : F2, F3, F4, F6 et F7 sont des reformulations,
F5 est une correction de citation d'une ligne. Seul F1 demande un vrai ajout
pédagogique, l'examen explicite de เกิน.

- Revue native : **en attente**. Rien dans ce fichier ne doit être présenté
  comme validé par un locuteur natif.
- Contre-audit externe `GPT-5.6 SOL ULTRA` : toujours **à préparer**. Les sept
  findings bloquants ci-dessus doivent y figurer comme points de contrôle.
