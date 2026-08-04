# Contre-audit adversarial de `unite-11/lecon-11c.md` (passe 2)

- Date : 2026-08-04
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), consigne adversariale
- Fichier audité : `content/authoring/unite-11/lecon-11c.md`, **108 722 octets**,
  SHA-256 `04f4917da5ded16db9e181ae6237929c01d98c4cd80447d2ce60bb80841d3c01`
- Cadre : `content/authoring/CONVENTIONS.md` (v1.1, v1.2, v1.3, fil des tons) et
  `docs/content-policy/sources-verification.md`, sections 1 bis et 1 ter
- Mandat : chercher des erreurs, pas confirmer. Chaque contre-proposition écrite
  ici a été re-vérifiée à la source avant d'être écrite, et les sources ont été
  ré-interrogées par moi, jamais reprises du dossier audité.

## 0. Pourquoi cette passe 2, et ce qu'elle change

Le fichier `verification-11c.md` portait déjà un contre-audit du 2026-08-04, sur
un exemplaire de **107 302 octets** (SHA-256 `5472cadd…`). L'exemplaire audité
aujourd'hui en fait **108 722**. Le fichier a donc été retouché entre les deux,
et sa Méta affirme désormais :

> **Contre-audit interne : passé le 2026-08-04**, douze findings dont huit
> bloquants, tous traités ; la consolidation qui en résulte est datée du même
> jour et son relevé point par point est à la section « État des audits ».

**Cette affirmation est fausse sur ses trois moitiés**, et c'est le premier
finding de cette passe. Le détail est au N1.

## 1. Ce qui a été refait, et comment

Aucun chiffre de ce rapport n'est repris du dossier audité ni du rapport
précédent. Tout a été recalculé ou ré-interrogé le 2026-08-04 depuis ce poste.

| Contrôle              | Commande ou accès                                 | Résultat obtenu par moi                                                                                                                               |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Champs d'item         | `item-fields-check.mjs …/lecon-11c.md`            | 0 champ `codepoints` en faute, 0 écart de réemploi                                                                                                    |
| Unicode du fichier    | `unicode-thai.mjs …/lecon-11c.md`                 | 8 champs `thai`, 158 chaînes thaïes distinctes dont 150 hors champs `thai`, toutes NFC, aucune zone à usage privé                                     |
| Inventaire des signes | même passage                                      | U+0E31 (47), U+0E34 (32), U+0E35 (20), U+0E36 (1), U+0E37 (2), U+0E38 (5), U+0E39 (13), U+0E47 (24), U+0E48 (63), U+0E49 (55), aucun U+0E4A ni U+0E4B |
| Périmètre du dépôt    | `repo-thai-scan.mjs 1 11`                         | 55 fichiers, 512 entrées, 353 graphies                                                                                                                |
| Périmètre de l'unité  | `repo-thai-scan.mjs 11 11`                        | 5 fichiers, 51 entrées, 42 graphies                                                                                                                   |
| Collisions            | `repo-thai-scan.mjs 1 11 --grep` sur และ, แต่, ก็ | 2 graphies chacune, toutes dans `lecon-11c.md`                                                                                                        |
| RID, présence         | `rid-lookup.mjs` sur 14 graphies                  | voir §3                                                                                                                                               |
| RID, corps            | `rid-entry.mjs` sur และ, แต่, ก็, ด้วย, ทั้ง      | voir §3                                                                                                                                               |
| Wiktionary en         | `action=raw` sur ก็, แต่, ด้วย, และ, ทั้ง         | voir §4                                                                                                                                               |
| VOLUBILIS             | `volubilis-lookup.mjs <xlsx>` sur 10 graphies     | voir §5                                                                                                                                               |
| VOLUBILIS, codes      | `volubilis-codes.mjs <ods>`                       | voir §5                                                                                                                                               |
| FrequencyWords        | recomptage sur l'exemplaire local                 | 1 504 712 octets, SHA-256 `20e7052f…b6083`, 50 000 lignes                                                                                             |
| Unicode 17.0          | retéléchargement de `UnicodeData.txt`             | **200 OK**, 2 198 209 octets, SHA-256 `2e1efc1d…6470c`, lignes 3258 à 3260                                                                            |

**Tous les chiffres mesurables du dossier audité sont exacts.** Les dix
compteurs Unicode, les trois décomptes `repo-thai-scan`, l'absence de collision,
les six rangs de fréquence, les empreintes des quatre artefacts et les seize
numéros de ligne VOLUBILIS que j'ai testés ont été retrouvés à l'identique.

Note d'accès, parce que le dossier consigne l'inverse : le retéléchargement de
`UnicodeData.txt` depuis unicode.org **a fonctionné aujourd'hui depuis ce
poste**, et l'exemplaire téléchargé porte exactement l'empreinte et les numéros
de ligne cités par l'item 3. La citation Unicode est donc pleinement
reproductible, mieux que ce que le dossier annonce lui-même.

La leçon casse ailleurs : sur **ce que les références disent réellement**, sur
**la cohérence des écrans avec les champs des items**, et sur **l'état déclaré
de son propre audit**.

## 2. Réemplois (priorité 1)

`item-fields-check.mjs` rend zéro écart, et ce résultat est exact. Il est
insuffisant : l'outil n'apparie que les items dont le TITRE porte une référence
`uXX-lYz`, et il compare cinq champs seulement. Vérification manuelle faite en
plus, item par item, dans les fichiers d'origine.

- **Item 4, ด้วย contre `u09-l9c` item 2** : `ipa`, `ton`, `longueur`,
  `transcription`, `codepoints` identiques. Pointeur d'item exact.
  **Mais le champ `longueur` recopié est faux DANS 11C**, finding N8.
- **Item 5, แล้ว contre `u09-l9d` item 6** : les cinq champs identiques, et j'ai
  vérifié en plus le champ `fr`, également identique. Pointeur exact.
- **Blocs de l'item 6** : ผม (`u02-l2d` item 1), มี (`u06-l6b` item 7), พี่ชาย
  et น้องสาว (`u06-l6b` items 5 et 6), ครับ (`u01-l1e` item 2). Tons, longueurs
  et IPA relus dans les fichiers d'origine : **concordants**, et l'IPA composée
  est bien la concaténation des IPA publiées.
- **Blocs de l'item 7** : อร่อย (`u04-l4b` item 8), เผ็ด et มาก (`u04-l4d`),
  ครับ. **Concordants**, y compris le doublement `bas · bas` de อร่อย rendu
  `à bas ; ràwi bas`.
- **Blocs de l'item 8** : แพงเกินไป (`u08-l8c` item 5), ผม, เอา (`u08-l8b`
  item 7), ครับ : concordants. **Une exception**, N12 : ไม่ est publié
  « brève » par `u04-l4d` item 1 et recopié « courte », sous la mention « Tons
  et longueurs recopiés sans modification ».
- **Transcriptions du dialogue** : les vingt et une transcriptions de la table
  ont été comparées une par une aux items d'origine (`hǐo`, `thòuuk`,
  `khâao·phàt·mǒuu`, `khâao·phàt·kài`, `pàeet·sìp`, `bàat`, `thâo·rai`,
  `dì·chǎn`, `tà·làat`, `kin`, `khâao`, `phaeeng koeen·pai`, `mâi`, `ao`,
  `phǒm`, `khráp`, `khâ`, `mii`, `láeew`, `dôuai`, `à·ràwi`) : **toutes
  identiques**. Aucune divergence silencieuse dans le dialogue.

Le réemploi est donc propre partout **sauf** au champ `longueur` de l'item 4, où
la fidélité littérale produit un énoncé faux (N8).

## 3. Ce que le RID dit réellement

Corps relevé par moi le 2026-08-04 avec `rid-entry.mjs`.

**และ.** Deux vedettes. « และ ๑ » ก., geste de découpe, deux ลูกคำ (และเล็ม,
และเลียม). « และ ๒ » สัน., glosée par deux mots (กับ, ด้วยกัน). **Aucune
étiquette d'usage.** Le dossier est exact au mot près.

**แต่.** Trois vedettes. « แต่ ๑ » ว. « เฉพาะ, อย่างเดียว, เท่านั้น », un ลูกคำ.
« แต่ ๒ » บ., **deux sens distincts** : le temps (« นำหน้านามบอกเวลาที่เป็น
จุดเริ่มต้น », exemple มาแต่เช้า) puis « จาก » (exemple มาแต่บ้าน) ; trois ลูกคำ.
« แต่ ๓, แต่ว่า » sens (๑) สัน., **deux exemples de phrase entière**,
นํ้าขึ้นแต่ลมลง et นาย ก กินข้าว แต่นาย ข นอน, où แต่ ouvre à chaque fois le
second morceau ; sens (๒) sur citation littéraire. Exact, à deux détails de
comptage près (N12).

**ก็.** Vedette unique, สัน., glosée par trois mots (แล้ว, จึง, ย่อม), **deux
exemples** : พอหันหน้ามาก็พบเขา et ทำดีก็ได้ดี. Aucune lecture entre crochets.
Exact sur la lettre. **Décisif** : dans les deux exemples, ก็ précède bien
immédiatement le verbe du second morceau, mais **aucun des deux ne comporte de
sujet exprimé**. Voir N3.

**ด้วย.** Trois sens. Le (๑), ว., enchaîne trois volets :
กริยารวมหรือเพิ่ม (exemple สวยด้วยดีด้วย), กริยาร่วมกันหรือในทำนองเดียวกัน
(exemple กินด้วย), ความขอร้อง (exemples ช่วยด้วย et บอกด้วย). **Quatre exemples
pour ce sens, pas trois**, et l'unique exemple du volet enseigné,
สวยด้วยดีด้วย, porte un premier ด้วย suivi de ดีด้วย. Voir N4.

**ทั้ง.** Le ลูกคำ « ทั้ง...และ » existe. Le sens (๑) porte deux séries
énumératives avec และ devant le dernier élément
(โกฐหัวบัว โกฐสอ โกฐเขมา โกฐเชียง และโกฐจุฬาลัมพา ; ต้น ราก เปลือก ใบ และดอก).
**Exact.** La position médiane de และ est la seule des quatre places dont les
deux jambes résistent entièrement à l'audit.

**Présences et absences**, `rid-lookup.mjs`, toutes reproduites par moi : และ,
แต่, ก็, ด้วย, แล้ว, ทั้ง, กับ, เหมือนกัน rendent `entree` ; แล้วก็, ไปด้วย,
ถูกแต่อร่อย, ผมก็ไม่เอา, เผ็ดเกินไป, กินข้าวแล้ว, เอาด้วย, ไปตลาดแล้ว rendent
`absent`. Le décompte additif « 8 + 13 = 21 » du dossier est cohérent.

## 4. Ce que Wiktionary dit réellement

Wikitexte relevé par moi le 2026-08-04 en `action=raw`.

**ก็.** `{{th-pron|เก้าะ|ก้อ}}`, deux prononciations : exact. Puis, textuellement :

```
===Conjunction===
# {{n-g|used to indicate a consequence or result:}} so, thus, then, next, accordingly, etc.
# also; as well
===Particle===
# {{n-g|used just for linking words or for starting or emphasising an expression}}
#: ความ จริง ก็ คือ ความ จริง
#: ก็ ที่ จริง ไม่ มี ใคร รู้
#: ฉัน ก็ ไม่ กิน เนื้อ วัว   « I also do not eat beef. (Emphasising the fact) »
```

Trois faits, tous contraires au dossier : **la section Conjunction ne porte
aucun exemple** ; **les trois exemples sont sous Particle** ;
**ถึงเธอจะแพ้แต่เธอก็ไปต่อ n'est pas dans cette entrée**. Voir N2.

**แต่.** Étymologie 3, section Conjunction : « but ; however », trois exemples,
เธอเป็นคนไทยแต่เธอไม่กินเผ็ด, แต่เมื่อวานเป็นวันหยุดนะ, **ถึงเธอจะแพ้แต่เธอก็ไปต่อ**.
C'est bien ici, et pas dans ก็, que se trouve la phrase que les items 3 et 8
attribuent à ก็. Section Preposition (étymologie 2) : « from ; since », note
« more often ตั้ง~ », **trois exemples** et non un.

**ด้วย.** Section Adverb, exactement deux lignes, dans l'ordre annoncé :
`# also; as well; too`, **sans aucune étiquette et sans aucune indication de
position**, puis `# used at the end of an expression to indicate an appeal,
request, or requirement`. Il existe en outre une section Conjunction
`{{lb|th|formal}} because; as; since` et une section Preposition
`with; together with; along with`. Voir N4.

**และ.** `# {{lb|th|formal}} [[and]]`, deux exemples (ทั้งเช้าและเย็น,
กินยาและพักผ่อนให้มากๆ), และ médian dans les deux, See also กับ. **Exact**, et
l'étiquette `formal` est bien là. Voir N10.

## 5. VOLUBILIS, relevé par moi

Exemplaire `VOLUBILIS_Database.xlsx`, **10 848 409 octets**, SHA-256
`b9ab7418…fc0c`, 114 579 lignes non vides, 586 541 chaînes partagées : identique
à ce que le dossier annonce.

Toutes les lignes citées par la leçon sont exactes : และ 47205 (`¯lae`, `conj.`,
FRA « et », segmentation `[และ]`, **aucun code `(form.)`**) et 47206 (opérateur
logique) ; แต่ 95816 à 95818, dont 95817 (`_tāe`, `conj.`, ENG « but ; however »,
FRA « mais », DOM `RID`) ; ก็ 42625 (`kø [= kǿ]`, `\kø`, `adv.`, DOM `RID`,
entrée unique) ; ด้วย 12315 à 12317, dont 12316 (`\dūay`, `adv.`, ENG « also ;
too ; as well ; either ; likewise ») ; แล้ว 47342 et 47343 ; ไปด้วย 65581,
segmentation `[ไป ด้วย]` ; อาหารและที่พัก 393, segmentation
`[อา-หาน และ ที่ พัก]` ; กำไรและขาดทุน 22270. Le code `(form.)` existe bien dans
la feuille `Codes` du `.ods` (« formal, polite | formel, poli | ENG/FRA ; usage »).

Deux réserves de traçabilité, N12 : la ligne `สอง` de la table de mesure est
**93932** et ne figure dans aucune liste du dossier, alors que deux graphies
listées (พอ, ขอ) n'apparaissent dans aucune table ; et la feuille `Codes`
documente **cinq** marqueurs de ton sous la clé `TONES`, pas quatre.

Les quatre lignes de la table de mesure du noyau /ɔ/, relevées par moi :
น้อง 64026 `¯nøng`, ห้อง 16174 `\hǿng`, เกาะ 42620 `_kǿ`, สอง 93932 `/søng`.
Elles disent l'inverse de ce que le dossier leur fait dire. Voir N5.

## 6. Décodabilité (priorité 2)

Les **21 blocs** du dialogue, recomptés à la main puis vérifiés graphie par
graphie contre les champs `thai` du dépôt : ผม, หิว, แล้ว, ครับ, มี, ข้าวผัดหมู,
และ, ข้าวผัดไก่, ค่ะ, เท่าไร, แปดสิบ, บาท, แพงเกินไป, ก็, ไม่, เอา, ถูก, แต่,
อร่อย, ดิฉัน, ด้วย. Dix-huit publiés par les unités 1 à 10, trois par 11C. Les
neuf blocs supplémentaires des exercices (กิน, ข้าว, เผ็ด, มาก, ไป, ตลาด,
พี่ชาย, น้องสาว, เกินไป) sont tous publiés, et j'ai vérifié en plus les six
graphies des pages d'enseignement et de la note culturelle qui ne sont pas des
blocs d'exercice : ปา, ป่า, หมา, ม้า, มา, เช้า. Toutes publiées.

**Aucune graphie étrangère au parcours dans le dialogue ni dans les exercices.**
Priorité 2 : négative, l'audit n'a rien trouvé.

Une réserve résiduelle, N12 : l'inventaire écrit encore « `u06-l6b` pour มี »,
alors que la valeur employée par le dialogue est l'existentiel sans sujet, que
`u06-l6b` item 7 déclare explicitement non enseigné et que `u06-l6d` item 1
publie. Le prérequis a été ajouté à la Méta, l'inventaire ne l'a pas été.

## 7. Planchers d'exercice, recalculés à la main

- **Exercice 1.** Positions attendues recomptées sur les listes de blocs :
  1 → 4/6, 2 → 2/5, 3 → 3/6, 4 → 3/4, 5 → 4/5, 6 → 3/5, 7 → 2/4, 8 → 3/4.
  Distribution : position 2 deux fois, position 3 quatre fois, position 4 deux
  fois. Meilleure constante **4 sur 8**. Calque « en tête du second morceau »
  **2 sur 8**. **Les deux planchers du dossier sont exacts.**
- **Exercice 2.** Deux tirages par option : constante **2 sur 10** ; stratégie de
  place, 2 sûrs plus 8 à une chance sur deux, **6 sur 10**. **Exacts.**
- **Exercice 3.** Idem, **2 sur 10** et **6 sur 10**. **Exacts.** Mais la
  justification qui les accompagne est fausse, N7.
- **Exercice 4.** Saisie libre, aucun plancher. **Exact.**

**Aucun exercice n'est réussissable par une réponse constante.** Ce point de la
consigne est négatif.

## 8. Findings

Bloquants d'abord, du plus lourd au plus léger.

### N1. La Méta déclare un contre-audit passé et « tous traités » alors que six des huit bloquants sont intacts. BLOQUANT

La Méta écrit : « **Contre-audit interne : passé le 2026-08-04**, douze findings
dont huit bloquants, **tous traités** ; la consolidation qui en résulte est datée
du même jour et son relevé point par point est à la section « État des audits ».
Trois affirmations, trois faux.

1. **La section « État des audits » du même fichier écrit, huit lignes plus
   bas** : « Contre-audit interne par dimensions indépendantes : **NON
   LANCÉ**. » Deux sections du même fichier se contredisent frontalement sur son
   état de production.
2. **Le « relevé point par point » annoncé n'existe pas.** La section citée ne
   porte aucun relevé de finding.
3. **« Tous traités » est faux.** Reprise du rapport de la passe 1, contrôlée
   ligne par ligne sur l'exemplaire actuel :

| Finding passe 1                                            | État réel aujourd'hui                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| N1, exemples Wiktionary de ก็ mal attribués (BLOQUANT)     | **intact**, items 3 et 8 et tableau des places inchangés                                   |
| N2, place finale de ด้วย mono-sourcée (BLOQUANT)           | **intact**                                                                                 |
| N3, mesure `longueur` de ก็ auto-contradictoire (BLOQUANT) | **intact**                                                                                 |
| N4, page 9 applique le tableau hors domaine (BLOQUANT)     | **intact**                                                                                 |
| N5, longueur affichée page 8 (BLOQUANT)                    | **partiel** : page 8 corrigée, feedback de l'exercice 2 et `note_fr` de l'item 5 inchangés |
| N6, tirages 7 et 9 de l'exercice 3 (BLOQUANT)              | **intact**                                                                                 |
| N7, « ils ne se répartissent pas au hasard » (BLOQUANT)    | **traité**, page 3 réécrite                                                                |
| N8, renvoi interne faux de l'item 4 (BLOQUANT)             | **intact**                                                                                 |
| N9, séquence sujet + ก็ + verbe                            | **intact**                                                                                 |
| N10, `registre : neutre` sur และ                           | **intact**                                                                                 |
| N11, มี attribué à `u06-l6b`                               | **partiel** : prérequis ajouté, inventaire inchangé                                        |
| N12, six comptages                                         | **partiel** : seul le point สาว est traité                                                 |

Bilan : **un finding bloquant sur huit réellement traité**, deux partiellement,
cinq intacts. La Méta transforme cela en « tous traités ». Aggravant : elle
nomme des findings par leur numéro (N1, N11, N12) à trois endroits du corps,
donc la rédaction a bien vu le rapport, et a écrit « corrigé aux items 3 et 8 et
au tableau des quatre places » **sans corriger les items 3 et 8 ni le tableau**.

C'est le finding le plus lourd de cette passe, parce qu'il rend toutes les autres
déclarations de contrôle du fichier non fiables par défaut.

### N2. Les exemples Wiktionary de ก็ sont attribués à une entrée et à une section qui ne les portent pas. BLOQUANT

L'item 3 écrit : « en.wiktionary, entrée « ก็ » … **Trois exemples de phrase**,
dont ฉันก็ไม่กินเนื้อวัว **et ถึงเธอจะแพ้แต่เธอก็ไปต่อ** ». L'item 8 recite la
seconde comme preuve tirée de « en.wiktionary, entrée ก็ ». Le tableau des quatre
places écrit « Wiktionary, trois exemples, dont un avec négation ».

Relevé `action=raw` fait par moi, reproduit au §4 :

1. **ถึงเธอจะแพ้แต่เธอก็ไปต่อ n'est pas dans l'entrée ก็.** C'est le troisième
   exemple de la section Conjunction de l'entrée **แต่**, ce que **l'item 7 du
   même fichier cite correctement**. La même phrase est donc attribuée à deux
   entrées différentes dans un même fichier.
2. **La section Conjunction de ก็ ne porte aucun exemple**, et c'est la seule
   section que la leçon enseigne.
3. **Les trois exemples sont sous Particle**, catégorie que la Méta déclare hors
   programme et dont elle affirme n'emprunter « AUCUNE preuve, pas même une
   preuve de position ».
4. **ฉันก็ไม่กินเนื้อวัว est glosé « I ALSO do not eat beef. (Emphasising the
   fact) »**, c'est-à-dire la valeur additive, celle que la leçon attribue à ด้วย
   et dit ne pas enseigner pour ก็.
5. La seconde ligne de la section Conjunction, « also ; as well », n'est pas
   mentionnée par l'item 3, qui n'en cite qu'une.

Conséquence : **la place de ก็ n'a plus qu'une jambe, le RID.** Fait mono-sourcé
hors métalangue, donc bloquant par l'amendement v1.2 que la leçon invoque
elle-même pour retirer l'étiquette de และ.

### N3. La séquence enseignée sujet + ก็ + verbe n'est attestée par aucune source consultée. BLOQUANT

Page 5, écran d'apprenant, sans réserve : « **Le sujet passe d'abord, ก็ vient
ensuite, et le verbe le suit immédiatement.** » Puis : « Lisez l'ordre à voix
haute : le premier morceau, le sujet, ก็, le verbe. » L'item 3 `note_fr` répète
« le sujet passe devant, ก็ vient après lui, le verbe suit ».

Les deux exemples du RID, que j'ai relevés : พอหันหน้ามาก็พบเขา et ทำดีก็ได้ดี.
**Aucun des deux ne comporte de sujet exprimé.** Ils attestent exactement ce que
l'item 8 formule correctement, « ก็ devant le verbe du second morceau », et rien
de plus.

Le seul exemple à sujet exprimé, ฉันก็ไม่กินเนื้อวัว, tombe avec N2 : il est sous
Particle et il est glosé « also ».

Cette séquence n'est pas un détail de formulation : elle porte l'item 8, la
réplique 5 du dialogue, la page 5, les tirages 3 et 4 de l'exercice 1, 5 et 6 de
l'exercice 2, 5 et 6 de l'exercice 3, et un feedback dédié. Le dossier voit le
problème et l'écrit à sa propre priorité 4 (« C'est le fait le plus mince de la
leçon »), puis en fait la phrase porteuse de la leçon. Le fait le plus mince ne
peut pas être le fait porteur.

**Ce que je propose, et je l'ai vérifié avant de l'écrire** : ramener la
formulation à « ก็ se place juste devant le verbe du second morceau », qui est
doublement attesté par le RID, et retirer l'obligation du sujet. Les phrases de
la leçon restent valides ; c'est la règle énoncée qui doit rétrécir.

### N4. La place finale de ด้วย pour l'emploi enseigné n'a pas deux jambes. BLOQUANT

La leçon enseigne page 2 et page 6 que **ด้วย se met à la fin**. Le tableau donne
deux jambes : « RID, trois exemples du sens (๑), tous finaux » et « Wiktionary,
"at the end of an expression" ».

- **RID.** Le sens (๑) porte **quatre** exemples, relevés par moi :
  สวยด้วยดีด้วย, กินด้วย, ช่วยด้วย, บอกด้วย. L'item 4 en compte trois et écrit
  « Dans les trois exemples de ce sens, ด้วย est en position finale ». Le compte
  est faux. Et **l'unique exemple du volet que 11C enseigne** (กริยารวมหรือเพิ่ม)
  est สวยด้วยดีด้วย, dont le premier ด้วย est suivi de ดีด้วย. On peut lire
  cette chaîne comme deux membres finissant chacun par ด้วย, et c'est une lecture
  défendable que je ne conteste pas ; mais elle n'est pas ce que l'item écrit, et
  l'item l'écrit sur un décompte faux.
- **Wiktionary.** Vérifié par moi : la mention « used at the end of an
  expression » est attachée à la **seconde** ligne de la section Adverb, celle de
  la demande, c'est-à-dire l'emploi de `u09-l9c`. La **première** ligne, « also ;
  as well ; too », celle que 11C enseigne, ne porte **aucune indication de
  position**. L'item 4 décrit correctement les deux lignes ; **c'est le tableau
  récapitulatif qui transfère la mention d'une ligne à l'autre.**
- La troisième mention, VOLUBILIS 65581, est déclarée corroborante et non
  fondatrice par le dossier lui-même, et j'ai reproduit le `absent` du RID sur
  ไปด้วย.

La place enseignée de ด้วย est donc **mono-sourcée**, et sur un décompte
inexact. Bloquant.

### N5. La mesure qui décide `longueur : NON ÉTABLIE` pour ก็ conclut contre son propre tableau et contre `u07-l7a`. BLOQUANT

Le dossier présente quatre lignes, que j'ai toutes ré-interrogées :

| Graphie | Longueur publiée   | ThaiPhon relevé par moi |
| ------- | ------------------ | ----------------------- |
| น้อง    | longue (`u06-l6b`) | `¯nøng` (ligne 64026)   |
| ห้อง    | courte (`u07-l7a`) | `\hǿng` (ligne 16174)   |
| เกาะ    | courte             | `_kǿ` (ligne 42620)     |
| สอง     | longue (`u03-l3b`) | `/søng` (ligne 93932)   |

Puis conclut : « un `ǿ` sur un mot court et un `ǿ` sur un mot **LONG selon
Wiktionary** : la distinction ne code pas la longueur ».

**Le tableau montre l'inverse exact.** Les deux `ø` tombent sur des mots longs,
les deux `ǿ` sur des mots courts : la corrélation est **parfaite sur quatre
lignes sur quatre**. La phrase « un `ǿ` sur un mot LONG selon Wiktionary » ne
nomme aucun mot, et **aucun des deux mots à `ǿ` n'est long** : เกาะ est bref, et
`u07-l7a` item 2 publie ห้อง « courte » en citant l'annotation Wiktionary
« {Unorthographical ; Short} », que j'ai relue dans le fichier.

Pire : `u07-l7a` a établi la clé sur **dix** graphies, relevé que j'ai relu à sa
ligne 954 et suivantes. ของ, ทอง, น้อง, ฟอง, ลอง, สอง, หมอน et ร้อน portent `ø`
et sont longues ; ห้อง et ต้อง portent `ǿ`. Conclusion publiée : « **Le `ǿ` note
donc la voyelle brève sous graphie ◌อ** ». **11C ne cite jamais ce relevé et
conclut contre lui**, sur un échantillon plus petit et mal lu.

Conséquence à ne pas manquer : si la clé s'applique, le `\kø` de la ligne 42625
note une voyelle **longue**, ce qui n'appuie pas la transcription brève `kâw`
publiée. Le dossier fait donc disparaître un désaccord de sources derrière une
affirmation fausse, au lieu de le poser.

Ce qui dépend de cette mesure et tombe avec : le champ `longueur` de l'item 3, la
seconde prononciation portée au champ `ipa`, l'acceptation de `kâww` à l'exercice
4, l'exclusion de tirage déclarée **bloquante** dans la section SRS,
l'incertitude 8 et l'arbitrage 4 porté au parcours.

**Ce que je ne conteste pas** : le verdict « non établie » peut survivre. La
ligne VOLUBILIS porte `kø [= kǿ]`, une notation qui hésite explicitement, et
Wiktionary donne deux prononciations. **C'est le motif écrit qui est faux**, et
il doit être réécrit en opposant frontalement `u07-l7a` plutôt qu'en l'ignorant.

### N6. Page 9 fait prédire au tableau des tons un mot qui est hors de son domaine. BLOQUANT

Page 9, écran d'apprenant, sur ก็ : « L'initiale est ก, une moyenne. Le signe
posé dessus est ◌็ … qui raccourcit la voyelle et ne change aucun ton … **Une
moyenne sans marque de ton devrait donc donner le ton MOYEN.** Or ก็ se dit au
ton DESCENDANT. » L'item 3 `note_fr` répète : « **La méthode prédit donc un ton
moyen** ».

`u10-l10a` page 2, relue par moi : « **Si** elle tient sur une voyelle longue
sans rien après, **ou si** elle se ferme sur ง, น, ม, ย ou ว, croisez la classe
et la marque dans ce tableau ». Page 5 : mêmes deux cas pour DEDANS.
**ก็ n'est ni l'un ni l'autre** : voyelle brève, rien ne la ferme.

C'est exactement ce que 11C écrit **trois paragraphes plus haut, sur la même
page**, à propos de และ, qui a la même configuration : « Ni l'un ni l'autre ici.
Le tableau ne dit donc rien de ce mot. » Et c'est ce que l'incertitude 7 du même
fichier déclare être le comportement de la leçon : « La leçon s'en tire
honnêtement en disant seulement que le tableau ne répond pas, ce qui est vrai
**dans les trois cas** ». **Page 9 ne dit pas cela pour ก็ : elle fait parler le
tableau.**

Trois conséquences. Un, contradiction interne à une même page d'écran. Deux, la
prédiction annoncée est fausse en soi. Trois, la leçon fait le geste que
`u10-l10a` page 8 interdit nommément : « Si vous appliquiez quand même le
tableau … Le tableau se serait trompé … La bonne réponse aujourd'hui n'est pas de
deviner. C'est de reconnaître le cas et de vous arrêter. »

Le fait enseigné (« ce mot se retient ») est juste. **Le chemin enseigné pour y
arriver est faux**, et c'est un chemin que la leçon fait parcourir à l'apprenant.

### N7. Exercice 3 : un feedback affiché affirme un fait faux sur ses propres tirages, et la paire porteuse de la leçon n'est mesurée nulle part. BLOQUANT

Le dossier écrit : « Les tirages 7 et 9 sont construits exprès sur le **MÊME
verbe, ไป**, pour que la place ne puisse rien y décider. » Le feedback affiché à
l'apprenant sur ces deux tirages dit : « Exactement, et regardez : **même
verbe**, même trou, deux mots différents. » Le piège consigné dit : « ne pas voir
que les tirages 7 et 9 partagent leur verbe. »

Les tirages, tels qu'écrits :

- 7 : ผมไป `___` ครับ, verbe **ไป**
- 9 : ผมกินข้าว `___` ครับ, verbe **กิน**

Ils ne partagent pas leur verbe. Le feedback est faux au tirage 9, et le piège
décrit une propriété que le tirage n'a pas. (Le tirage **10**, ดิฉันไปตลาด `___`
ค่ะ, porte bien ไป, mais avec ตลาด intercalé et ce n'est pas celui que le dossier
nomme.)

Le défaut est plus large qu'une coquille. La **paire ไปด้วย contre ไปแล้ว** est
présentée page 8 comme « la seule paire du jour que la place ne distingue pas »,
page 11 comme l'objet de l'enregistrement A/B, et la carte `srs-u11-l11c-02`
l'exige comme critère de maîtrise (« au moins deux paires construites sur le MÊME
verbe … du type ไปด้วย contre ไปแล้ว »). **Aucun des trente-six tirages des
quatre exercices ne présente ผมไปแล้วครับ**, décompte que j'ai refait tirage par
tirage. La paire porteuse est enseignée, promise, exigée par le SRS, et jamais
mesurée.

Correction minimale, vérifiée : remplacer le tirage 9 par ผมไป `___` ครับ /
« J'y suis déjà allé » et déplacer ผมกินข้าวแล้วครับ ailleurs. Le plancher ne
bouge pas, le trou restant final dans les deux cas.

### N8. Item 4 : un renvoi interne faux, introduit sciemment pour verdir l'outil. BLOQUANT

Item 4, champ de contrat : « `longueur` : NON ÉTABLIE, **même noyau et même motif
que l'item 1**. »

Dans `u09-l9c`, d'où la formule est recopiée, l'item 1 est ช่วย, dont le noyau
est le glissé /ua̯/, exactement celui de ด้วย : le renvoi y est juste. **Dans 11C,
l'item 1 est และ**, dont le noyau est /ɛ/ et dont le champ `longueur` vaut
**« courte »**, c'est-à-dire une longueur établie. Le renvoi est faux sur ses deux
moitiés.

La `note_fr` du même item assume le geste : « Le champ `longueur` porte la formule
exacte de la leçon d'origine, renvoi interne compris, **pour que le contrôle de
réemploi passe sans écart**. »

C'est un contrôle satisfait au prix d'un énoncé faux dans un champ de contrat, et
`item-fields-check.mjs` rend bien zéro écart, ce que j'ai reproduit. La bonne
forme est un renvoi externe explicite, du type « NON ÉTABLIE, même noyau /ua̯/ et
même motif que `u09-l9c` item 1 », avec une ligne d'écart assumée au dossier.
**À remonter au parcours** : l'outil récompense aujourd'hui la copie littérale
d'un renvoi positionnel, ce qui incite à écrire faux.

### N9. Item 2 : la paire de longueur proposée à l'apprenant n'est pas une paire de longueur. BLOQUANT

Item 2 `note_fr` : « Comparez `tàee` et **`tè` de 3A, écrit เตะ** : même consonne,
même ton bas, **deux longueurs**. Là où เตะ se coupe net, แต่ dure. »

Relevé dans `u03-l3a`, fait par moi : เตะ porte `ipa` /teʔ˨˩/ et `transcription`
`tè` ; แตะ porte `ipa` /tɛʔ˨˩/ et `transcription` `tàe`. Le noyau de เตะ est le
graphème `e` (/e/) ; celui de แต่ est le graphème `aee` (/ɛː/). **Ce ne sont pas
deux longueurs d'une même voyelle, ce sont deux voyelles différentes.** La paire
de longueur juste est แตะ `tàe` contre แต่ `tàee`, et c'est précisément celle que
la liste des pièges de l'exercice 4 emploie correctement (« confusion directe
avec `tàe` de แตะ, publié par 3A, qui est bref »).

Le fichier tient donc les deux versions à la fois, la fausse dans le champ d'item
et la juste dans l'exercice. `CONVENTIONS.md`, arbitrage v1.2, traite d'ailleurs
`tè` (เตะ) et `tàe` (แตะ) comme deux voyelles distinctes et demande, quand une
leçon présente deux voyelles ensemble, de « montrer la paire côte à côte et
nommer le noyau ». Fait phonétique faux dans un champ compilé : bloquant.

### N10. `registre : neutre` sur และ tranche contre la seule source qui parle de registre. BLOQUANT

Item 1 : `registre` : neutre, avec ce commentaire : « **Aucune étiquette de
registre n'est enseignée** ».

Les deux énoncés ne tiennent pas ensemble : `registre` est un champ du contrat
d'item, il est compilé, et « neutre » est une étiquette. Or la seule source
consultée qui dise quelque chose sur le registre de และ dit `{{lb|th|formal}}`,
que j'ai retrouvé mot pour mot dans le wikitexte. L'absence de mention chez le
RID et l'absence du code `(form.)` chez VOLUBILIS sont des **absences**, pas des
attestations de neutralité : je l'ai vérifié, le code existe bien dans la feuille
`Codes` mais rien n'indique que VOLUBILIS l'applique systématiquement.

Écrire « neutre » n'est donc pas s'abstenir : c'est trancher, sans source, sur un
fait de registre. La valeur honnête est « non établi », exactement ce que la
leçon a su écrire pour la longueur de ก็. Le reste du traitement (n'employer และ
que dans des énumérations) est une bonne précaution de conception et doit rester.

### N11. Page 6 affirme une fréquence d'usage que le dossier s'interdit lui-même d'établir. BLOQUANT

Page 6, écran d'apprenant : « Vous avez déjà rencontré ce mot en 9C … Il a un
second emploi, **aussi courant**, et il se pose de la même façon. »

Aucune source de la politique n'établit la fréquence relative des emplois de
ด้วย. Le dossier l'écrit lui-même deux fois : FrequencyWords est « employé
UNIQUEMENT pour consigner un rang, jamais pour fonder un fait de sens, de ton, de
longueur ou de registre », et l'item 4 précise que « le rang agrège les trois
emplois ». La note culturelle du même fichier refuse explicitement ce genre
d'affirmation (« Elle n'affirme rien … ni sur la fréquence de cet emploi »).

Le même standard doit valoir page 6. « Aussi courant » est à retirer ou à
remplacer par ce qui est vérifié : les trois sources enregistrent les deux
emplois séparément, ce qui dit qu'ils existent, pas qu'ils s'équivalent.

Point voisin du même paragraphe, non compté à part : le champ `fr` de l'item 4 et
la page 6 rendent l'emploi enseigné « par « aussi », **parfois par « avec »** ».
Or l'item écrit lui-même que 11C enseigne « le premier volet du (๑) », l'ajout, et
les deux jambes citées ne portent pas « avec » : Wiktionary ligne 1 de la section
Adverb donne « also ; as well ; too » et VOLUBILIS 12316 donne « aussi ;
également ; de même ; de plus ». Le « avec » relève du second volet ou de la
préposition, que la leçon déclare ne pas enseigner. À aligner sur le périmètre
déclaré.

### N12. Onze inexactitudes de comptage, de citation ou de conception, sans conséquence pédagogique isolée. NON BLOQUANT

Regroupées parce qu'aucune ne justifie seule un finding. Toutes recomptées par
moi sur l'exemplaire actuel.

1. **Méta** : « ses **quarante** tirages d'exercice ». Les quatre exercices en
   comptent **36** (8 + 10 + 10 + 8).
2. **Page 10**, écran d'apprenant : « Les mots du jour vous en donnent **quatre**
   de plus » puis en énumère **six** (แพง, มี, แต่, ผม, และ, แล้ว). La formule
   est héritée de `u10-l10a` page 11, qui écrit « trois de plus » devant six mots
   également : l'écart est donc à trancher au parcours, pas seulement ici.
3. **Dossier, mesure VOLUBILIS** : « la feuille `Codes` … documente **seulement
   les quatre marqueurs de ton**, `-`, `¯`, `_`, `/` et `\` ». Cinq sont
   énumérés, et j'ai vérifié que la clé `TONES` en documente bien cinq.
4. **Dossier, liste des lignes du `.xlsx`** : สอง, employée dans la table de
   mesure, n'y figure pas (sa ligne est **93932**), alors que พอ et ขอ y figurent
   sans être employés nulle part. Traçabilité incomplète au sens de l'amendement
   v1.2.
5. **Item 7, sources** : l'exemple นํ้าขึ้นแต่ลมลง est décrit comme une « phrase
   de quatre syllabes ». Il en compte cinq (นํ้า, ขึ้น, แต่, ลม, ลง).
6. **Note culturelle** : la section Preposition de แต่ chez Wiktionary est
   décrite avec « un exemple de phrase ». Elle en porte **trois**.
7. **Note culturelle** : les « deux exemples » attribués au sens temporel de
   แต่ ๒ se répartissent en réalité sur deux sens distincts, มาแต่เช้า pour le
   temps et มาแต่บ้าน pour « จาก ».
8. **Item 8** : ไม่ porté « courte » alors que `u04-l4d` item 1 publie
   « **brève** », sous la mention « Tons et longueurs recopiés **sans
   modification** ». Valeur équivalente, mention inexacte.
9. **Inventaire de décodabilité** : « `u06-l6b` pour มี », alors que la valeur
   employée est l'existentiel que `u06-l6b` déclare non enseigné et que
   `u06-l6d` publie. Le prérequis a été ajouté, l'inventaire pas.
10. **Exercice 1, feedback « mauvaise particule »** : il ne peut jamais se
    déclencher. Le bloc en trop de chaque tirage est « toujours un AUTRE mot de
    liaison », donc l'apprenant ne reçoit jamais les deux particules ensemble et
    ne peut pas choisir la mauvaise. Branche morte.
11. **Exercice 1, pièges connus** : « poser ด้วย ou แล้ว **avant** la particule
    polie, alors que ครับ et ค่ะ ferment toujours en dernier ». La justification
    contredit le piège : si la particule ferme en dernier, alors ด้วย est
    précisément avant elle, ce que font les huit cibles. Le piège à décrire est
    « après la particule ».

## 9. Ce que l'audit n'a PAS trouvé, et qui vaut d'être écrit

Un rapport qui ne liste que des défauts ne permet pas de juger de sa sévérité.
Les points suivants ont été attaqués et ont tenu.

- Les trois graphies publiées, leurs points de code, leur NFC, leurs tons, leurs
  IPA et leurs transcriptions v1.1 : justes. `láe` haut bref, `tàee` bas long,
  `kâw` descendant, accents posés sur la première lettre du noyau.
- Les deux prononciations de ก็ chez Wiktionary : `{{th-pron|เก้าะ|ก้อ}}`,
  exactement ce que l'item 3 décrit.
- La lecture de แต่ page 9 : entièrement correcte, initiale ต en seconde
  position, ไม้เอก, syllabe vivante, moyenne plus ไม้เอก donnant le ton bas.
- La place médiane de และ : deux jambes solides, le ลูกคำ « ทั้ง...และ » du RID
  avec ses deux séries énumératives, et les segmentations VOLUBILIS 393 et 22270,
  toutes retrouvées par moi.
- La place de แต่ en tête du second morceau : deux jambes solides, RID (deux
  exemples de แต่ ๓) et Wiktionary (trois exemples de la section Conjunction).
  C'est la place la mieux établie de la leçon.
- Les six rangs de fréquence, les occurrences, l'empreinte et le nombre de lignes
  du fichier FrequencyWords : exacts au chiffre près.
- Les empreintes du `.xlsx`, du `.ods` et de `UnicodeData.txt`, ainsi que les
  lignes 3258 à 3260 de ce dernier : exactes.
- Les seize numéros de ligne VOLUBILIS testés : exacts.
- Les trois décomptes `repo-thai-scan`, les dix compteurs Unicode et l'absence de
  U+0E4A et U+0E4B : exacts.
- L'absence de collision sur les trois graphies revendiquées : vérifiée par
  `--grep`, chaque appel ne rendant que des graphies de `lecon-11c.md`.
- Les cinq champs de forme des deux réemplois, plus le champ `fr` de l'item 5 :
  identiques à leurs leçons d'origine.
- Les tons, longueurs et IPA des treize blocs des trois phrases composées :
  conformes à leurs items de publication.
- Les vingt et une transcriptions du dialogue : identiques aux items d'origine.
- Les quatre planchers d'exercice : recalculés, exacts. **Aucun exercice n'est
  réussissable par une réponse constante.**
- Les 21 blocs du dialogue, les 9 blocs supplémentaires des exercices et les 6
  graphies des pages d'enseignement : tous publiés par les unités 1 à 11.
- Les huit contrôles de présence et les huit contrôles négatifs au RID :
  reproduits à l'identique.
- Les citations de `u10-l10a` (pages 4, 5 et 8) et de `u09-l9c` : exactes.
- Aucun tiret cadratin ni demi-cadratin dans les textes d'écran.
- Aucun nom de commerce, aucune adresse, aucun horaire, aucune affirmation sur
  les prix réels.

**Faits re-vérifiés par cet auditeur et confirmés : 112.**

## 10. Verdict

`draft`. **Le passage en `review` est refusé**, et la Méta doit être corrigée
avant toute autre chose.

Le défaut central de cette passe n'est pas linguistique, il est procédural.
`u10-l10a` avait déjà établi qu'« un chiffre écrit à un instant et non recomputé
est faux plus souvent qu'on ne croit ». Le fichier applique cette leçon
scrupuleusement à ses chiffres, qui sont tous exacts, et l'oublie complètement
pour son propre état d'audit : il déclare douze findings « tous traités » alors
qu'un seul bloquant l'est, tout en gardant une section qui déclare le même audit
« NON LANCÉ ». Une déclaration d'audit non recomputée est exactement le même
genre de faux qu'un décompte non recomputé, et elle coûte plus cher, parce
qu'elle éteint la vigilance sur tout le reste.

Sur le fond, quatre findings (N2, N3, N4, N5) touchent au même geste : **prendre
l'exemple d'une section pour la preuve d'une autre**, ou faire dire à un relevé
l'inverse de ce qu'il montre. Aucune référence n'est inventée, toutes existent et
j'ai pu les ré-interroger ; mais trois des cinq faits que le dossier tient pour
doublement sourcés ne le sont pas.

N6 et N9 sont des contradictions internes entre un écran et un champ d'item du
même fichier : elles se corrigent en réécrivant deux paragraphes.

N7 découvre un trou réel de conception, la paire porteuse jamais mesurée.

N8 mérite d'être remonté au parcours : `item-fields-check.mjs` récompense
aujourd'hui la copie littérale d'un renvoi positionnel, ce qui pousse à écrire un
énoncé faux pour obtenir un contrôle vert. C'est le contrôle qu'il faut corriger,
pas seulement l'item.
