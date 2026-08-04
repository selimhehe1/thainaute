# Contre-audit adversarial de `lecon-11b.md`

- Fichier audité : `content/authoring/unite-11/lecon-11b.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Consigne : chercher à invalider, pas à confirmer. Chaque contrôle a été
  REFAIT par l'auditeur avec les scripts versionnés du dépôt ou par requête
  directe, jamais lu dans le dossier de production de la leçon.
- Statut rendu : **12 findings, dont 7 bloquants.** La leçon ne peut pas passer
  `draft -> review` en l'état.

## 0. Ce que l'auditeur n'a PAS pu recomputer

À déclarer avant tout le reste, parce que cela borne la portée de ce rapport.

- `VOLUBILIS_Database.xlsx` **n'est pas dans le dépôt** et n'a pas été trouvé
  sur la machine. Aucun numéro de ligne VOLUBILIS de la leçon n'a donc pu être
  recomputé. Les recoupements VOLUBILIS de ce rapport passent uniquement par
  les relevés déjà versionnés du dépôt (`unite-02/verification-volubilis.md`).
- `content/2018/th/th_50k.txt` (FrequencyWords) n'est pas dans le dépôt non
  plus. Aucun rang de fréquence n'a pu être recomputé. Ceux qui coïncident avec
  `u06-l6b` (พี่ 165, น้อง 6 713, พ่อ 53, แม่ 51, พี่ชาย 458) sont cohérents
  avec le dépôt ; les rangs neufs (คุณพ่อ 780, คุณแม่ 1 057) ne le sont pas.
- Les empreintes SHA-256 annoncées par le dossier n'ont pas pu être vérifiées,
  pour la même raison.

## 1. Faits re-vérifiés par l'auditeur et CONFIRMÉS (31)

### 1.1 RID 2554, requêtes refaites le 2026-08-04

Toutes par `node scripts/verification/rid-entry.mjs <graphie>` et
`node scripts/verification/rid-lookup.mjs <graphie>`, endpoint
`POST https://dictionary.orst.go.th/func_lookup.php`,
`word=<graphie>&funcName=lookupWord&status=lookup`.

1. **พี่** : vedette unique à deux sens. Sens (๒) est bien un `คำนำหน้าชื่อ`
   avec **deux exemples** de la forme mot + prénom. Aucun des deux sens ne
   mentionne le sexe. Trois `ลูกคำ` : พี่น้อง, พี่เบิ้ม, พี่เลี้ยง. CONFIRMÉ.
2. **น้อง** : vedette unique à trois sens. Le sens (๑) réunit bien la personne
   née après, l'enfant d'un อา ou d'un น้า, et `เรียกคน` d'un âge de cadet.
   **Aucun `คำนำหน้าชื่อ`**, là où พี่ en porte un : l'asymétrie invoquée par la
   leçon est réelle. Deux `ลูกคำ` : น้อง ๆ, น้องเพล. CONFIRMÉ.
3. **คุณ** : deux vedettes, « คุณ ๑, คุณ- » et « คุณ ๒ ». CONFIRMÉ.
4. « คุณ ๑, คุณ- » porte bien **six sens** et la lecture `[คุน, คุนนะ-]`.
   CONFIRMÉ.
5. Sens (๓) : mot placé devant une personne pour marquer l'égard, et le RID
   **prend lui-même คุณพ่อ et คุณแม่ pour exemples**, plus un troisième
   (คุณสมร). CONFIRMÉ, c'est la jambe RID des items 3 et 4.
6. Sens (๖) : pronom de deuxième personne, `คำสุภาพ`, plus un emploi de
   troisième personne étiqueté `(ปาก)`. CONFIRMÉ, y compris la correction
   consignée contre `u02-l2d`.
7. **Dix-huit `ลูกคำ`** sous « คุณ ๑, คุณ- ». Recomptés un par un. CONFIRMÉ.
8. « คุณ ๒ » porte bien un sens de sortilège. CONFIRMÉ.
9. **ครับ** : vedette unique, catégorie ว., lecture `[คฺรับ]`, dont la séquence
   est bien U+0E04 U+0E3A U+0E23 U+0E31 U+0E1A. Mot d'acquiescement ou mot
   final poli employé par les hommes. **Aucun exemple, aucune restriction de
   type d'énoncé.** CONFIRMÉ.
10. **ค่ะ** : vedette unique, ว., même valeur que จ้ะ, mot final employé par les
    femmes pour informer poliment, **deux exemples affirmatifs**. CONFIRMÉ.
11. **คะ** : bien **deux vedettes homographes**. « คะ ๑ » est la forme réduite
    de redoublement poétique ; « คะ ๒ » est le mot final féminin après une
    question ou une marque de doute, avec deux exemples, plus un emploi après
    ซิ et นะ. CONFIRMÉ, y compris le fait qu'aucune leçon antérieure ne le
    signalait.
12. **Contrôle négatif** : `rid-lookup.mjs คุณพ่อ คุณแม่` rend `absent` pour les
    deux. CONFIRMÉ.
13. Décompte du dossier : **8 graphies interrogées, 6 vedettes, 2 absentes**.
    Recompté. CONFIRMÉ.

### 1.2 Wiktionary, API MediaWiki, refaite le 2026-08-04

14. **คุณพ่อ**, en.wiktionary : pageid **6614720**, wikitexte entier
    `#REDIRECT [[พ่อ]]`. CONFIRMÉ au caractère près.
15. **คุณแม่**, en.wiktionary : pageid **6614721**, wikitexte entier
    `#REDIRECT [[แม่]]`. CONFIRMÉ au caractère près.
16. **พี่**, en.wiktionary : **aucune section `Pronoun`**, seulement `Noun`.
    CONFIRMÉ, l'argument de la partie 3 tient sur ce point.
17. **พี่**, quatrième définition nominale : `used as a title or term of
address`, première sous-entrée vers `an elder brother, elder sister, or
older person` avec emploi réciproque. CONFIRMÉ.
18. **น้อง**, cinquième définition nominale : titre ou terme d'adresse, avec
    **quatre** sous-entrées, la première vers les cadets et les personnes plus
    jeunes, emploi réciproque. CONFIRMÉ.
19. **คุณ** : section `Pronoun` = `(colloquial, polite) a second or third person
pronoun, used out of respect`. CONFIRMÉ.
20. **คุณ** : huitième définition nominale = `(colloquial, polite) used as a
title for or term of address to anyone out of respect`. CONFIRMÉ, y compris
    le rang exact de la définition.

### 1.3 Unicode et graphies

21. Le fichier entier est **stable en NFC** :
    `texte === texte.normalize("NFC")` rend `true`. CONFIRMÉ.
22. Les **six lignes du tableau Unicode** de la leçon (พี่, น้อง, คุณพ่อ, คุณแม่,
    พี่ต้น, คุณ) ont été recalculées depuis les graphies, pas recopiées : toutes
    exactes. CONFIRMÉ. Idem pour ค่ะ = U+0E04 U+0E48 U+0E30 contre
    คะ = U+0E04 U+0E30, un seul point de code d'écart, U+0E48.
23. `node scripts/verification/item-fields-check.mjs content/authoring/unite-11/lecon-11b.md`
    rend **0 champ `codepoints` en faute, 0 écart de réemploi**. Rejoué par
    l'auditeur. CONFIRMÉ.
24. **Fidélité de réemploi relue à la main**, en plus du script, sur `u01-l1e`
    items 2 et 3, `u02-l2d` items 1, 2, 4, `u02-l2e` items 1, 12, 13, `u06-l6b`
    items 1, 2, 3, 4, 5 : les champs `ipa`, `ton`, `longueur`, `transcription`
    et `codepoints` sont repris **au caractère près**, apostrophes droites des
    items 6 et 7 comprises. CONFIRMÉ, y compris l'arbitrage assumé sur ces
    apostrophes.
25. Aucun tiret cadratin (U+2014) ni demi-cadratin (U+2013) dans le fichier.
    CONFIRMÉ.

### 1.4 Contrôles de dépôt

26. `repo-thai-scan.mjs 11 11` : **5 fichiers, 51 entrées, 42 graphies
    distinctes, 16 ไม้เอก, 16 ไม้โท**. Identique au troisième relevé de la
    leçon. CONFIRMÉ.
27. `repo-thai-scan.mjs 1 10` : **50 fichiers, 461 entrées, 337 graphies, 106
    ไม้เอก, 82 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา**. CONFIRMÉ.
28. `--grep คุณพ่อ` et `--grep คุณแม่` : **0** sur les unités 1 à 10, **1** sur
    l'unité 11, celle de ce fichier. **Aucune collision.** CONFIRMÉ.
29. Les **six cartes SRS citées existent** : `srs-u01-l1e-04`, `srs-u02-l2b-03`,
    `srs-u02-l2e-03`, `srs-u04-l4a-06`, `srs-u06-l6b-02`, `srs-u07-l7a-03`.
    CONFIRMÉ par lecture directe des fichiers d'origine.

### 1.5 Arithmétique des exercices, recalculée

30. **Exercice 1** : répartition strictement 4 / 4 / 4 vérifiée tirage par
    tirage ; plancher de réponse constante 4/12 = 33,3 % ; espérance de la
    stratégie « je sais qu'une particule marque le locuteur » = 4 + 8 × 0,5 = 8,
    soit 66,7 % ; P(≥ 10/12) = (28 + 8 + 1)/256 = **37/256 = 14,5 %** ;
    P(≥ 11/12) = (8 + 1)/256 = **9/256 = 3,5 %**. Les quatre chiffres sont
    EXACTS. CONFIRMÉ.
31. **Exercice 3** : 4 × 3! = 24 donc 4,2 % ; 3 × 2! = 6 donc 16,7 % ;
    5 × 4! = 120 donc 0,83 % ; heuristique « garder ครับ » = 1/2 + 1/24 = 0,54.
    EXACTS. **Exercice 4** : 11 × 0,5 + 1/3 = 5,833 sur 12 = 48,6 %. EXACT. Le
    contrôle « au moins deux options à particule compatible » a été refait
    tirage par tirage sur les douze : **vrai partout**. CONFIRMÉ.

## 2. Findings

Sept bloquants, cinq non bloquants. Ordre de gravité décroissante.

---

### F1. BLOQUANT. Le critère de RANG du RID est effacé, et la leçon affirme sur écran que ce critère n'existe pas

**Ce que dit la source, relevée par l'auditeur le 2026-08-04.** L'entrée
« พี่ » du RID, sens (๒), est :

> คำนำหน้าชื่อคนที่มีอายุคราวพี่**หรือมีศักดิ์เสมอพี่** เช่น พี่แดง พี่ส้ม.

Le dictionnaire donne **deux** critères alternatifs, et pas un : l'âge d'un
aîné **ou** un `ศักดิ์` (rang, dignité, statut) équivalent à celui d'un พี่. Le
sens (๑) porte déjà la même alternative, `ผู้ที่มีศักดิ์เสมอพี่`, ce que
`u06-l6b` avait d'ailleurs consigné en clair par « ainsi que la personne de
rang équivalent ».

**Ce que la leçon en fait.** Elle supprime la seconde branche partout, puis
affirme positivement qu'elle n'existe pas :

- Méta : « les sources autorisées donnent trois choses et trois seulement :
  une étiquette de registre sur chaque forme, un critère d'ÂGE RELATIF pour
  พี่ et น้อง, et un critère d'ÉGARD sans condition d'âge pour คุณ » ;
- page 10, écran d'apprenant : « Elles donnent un critère d'âge pour พี่ et
  น้อง, un critère d'égard sans condition pour คุณ, une étiquette de politesse
  sur les particules, **et c'est tout** » ;
- SRS, exclusion déclarée bloquante : « aucun tirage ne décrit une personne par
  son rang, sa fonction ou son statut. **Le seul critère que les sources donnent
  est l'âge relatif** » ;
- item 1, champ `sources` : le sens (๒) y est rendu par « un mot placé devant
  le NOM d'une personne dont l'âge est celui d'un พี่ », sans la seconde
  branche.

**Aggravant : le critère écarté est doublement sourcé.** en.wiktionary, entrée
« พี่ », relevée par l'auditeur, porte une troisième définition nominale
`{{lb|th|colloquial}} superior; master; leader; boss`, et une sous-entrée
d'adresse `used as a title for or term of address to a superior, master,
leader, or boss`. Le critère de rang a donc deux jambes indépendantes, RID et
en.wiktionary. La leçon ne l'écarte pas faute de preuve : elle le supprime et
écrit ensuite qu'il n'y en a pas.

**Pourquoi c'est bloquant.** C'est un fait de source mal cité, sur un écran
d'apprenant, et c'est en outre la prémisse de l'exclusion bloquante de la carte
`srs-u11-l11b-01`. Une exclusion peut rester pour des raisons pédagogiques,
mais alors elle se déclare comme un choix, pas comme un constat de source.

**Reproduction** : `node scripts/verification/rid-entry.mjs พี่` ;
`action=parse&page=พี่&prop=wikitext` sur en.wiktionary.

---

### F2. BLOQUANT. Le corrigé des tirages 11 et 12 de l'exercice 4, et celui de la carte SRS 01, n'est pas dérivable du matériel enseigné

**Tirage 11.** Situation : « Paul s'adresse à ต้น, dont il sait qu'il est plus
âgé que lui, et lui demande comment il va. » Options :
`พี่ต้นสบายดีไหมครับ` (donnée juste) | `คุณพ่อสบายดีไหมครับ` |
`สบายดีไหมครับ`.

La page 9 de la même leçon donne à `สบายดีไหมครับ` **exactement la même
traduction française** qu'à `พี่ต้นสบายดีไหมครับ`, à savoir « Vous allez
bien ? », et la page 8 enseigne explicitement que la forme sans particule de
désignation « ne devient pas fausse pour autant : elle devient neutre ». La
troisième option est donc, par la leçon elle-même, une manière correcte et
enseignée de dire ce que la situation demande. Le corrigé la compte fausse.

**Tirage 12.** Situation : « Nok s'adresse à ต้น, dont elle sait qu'il est plus
âgé qu'elle, et lui demande comment il va. » Options :
`พี่ต้นสบายดีไหมคะ` (donnée juste) | `พี่ต้นสบายดีไหมครับ` |
`คุณสบายดีไหมคะ`.

La page 4 enseigne que คุณ vaut pour « **n'importe qui** » et que « คุณ ne vous
demande de savoir ni l'âge, ni le rang, ni rien du tout » ; l'item 5 le nomme
« le mot par défaut du cours » ; l'exercice 2 fait apparier คุณ à « la personne
à qui vous parlez, **quelle qu'elle soit** ». `คุณสบายดีไหมคะ` est donc licite
pour ต้น par la règle même que la leçon enseigne. Le corrigé la compte fausse.

**La seule chose qui exclurait ces deux options est une règle sociale que la
leçon déclare ne pas pouvoir enseigner.** Page 10 : « Vous vous demandez
sûrement quand employer l'un plutôt que l'autre avec une vraie personne. La
réponse honnête est que nos sources ne le disent pas. » Le feedback des tirages
11 et 12 le dit d'ailleurs lui-même : « les trois sont correctes en thaï, et
une seule dit ce que la situation demande » ; or ce que la situation demande
n'est justement pas déterminé par ce qui est enseigné.

**Le même défaut atteint la carte `srs-u11-l11b-01`**, dont le critère de
maîtrise est « devant une personne décrite en français par son âge relatif
seul, ou sans indication d'âge, choisir entre คุณ, พี่ et น้อง, sur 5 tirages
sur 6 ». Si la personne est décrite comme plus âgée, คุณ reste licite par la
page 4 : la carte n'a pas de bonne réponse unique.

**Détail de construction qui confirme le diagnostic** : l'exercice utilise
ailleurs une formule pour lever exactement cette ambiguïté, « en la désignant »
au tirage 3. Cette formule est absente des tirages 11 et 12, les deux seuls où
le choix du mot de désignation est justement l'objet mesuré. Les pièges connus
du tirage 11 n'anticipent d'ailleurs que le choix de `คุณพ่อสบายดีไหมครับ`,
jamais celui de `สบายดีไหมครับ`.

**Pourquoi c'est bloquant** : corrigé faux, sur deux tirages sur douze d'un
exercice dont le seuil est 10 sur 12, plus une carte SRS sans réponse unique.

---

### F3. BLOQUANT. `คุณพ่อสบายดีไหมครับ` reçoit deux traductions françaises contradictoires, sur deux écrans de la même leçon

- **Page 9**, présentée comme « le cœur de la leçon » :
  `คุณพ่อสบายดีไหมครับ · Vous allez bien ?`, alignée avec trois autres phrases
  sous le constat « Regardez la colonne de droite : elle est identique quatre
  fois », et suivie de « ce qui est devant vous dit quelque chose de la
  personne, jamais de vous ». คุณพ่อ y est donc un terme d'ADRESSE, la phrase
  s'adresse au père.
- **Dialogue, ligne 9** : même chaîne, `คุณพ่อสบายดีไหมครับ`, glosée
  « **Votre père va bien ?** ». La remarque Deux qui suit le dialogue confirme
  le renversement : « คุณพ่อ n'y désigne pas la personne à qui Paul parle : il
  désigne une personne dont on parle. C'est un emploi différent de celui des
  lignes 3 et 7, et le cours les tient séparés exprès. »

Le cours ne les tient PAS séparés : la page 9 les confond, puisqu'elle range
`คุณพ่อสบายดีไหมครับ` avec trois phrases d'adresse et affirme que le français
ne bouge pas. L'apprenant voit la même phrase thaïe recevoir deux sens
différents, sans qu'aucun écran ne lui donne le critère de choix, qui est
contextuel et n'est enseigné nulle part.

Accessoirement, le français « Votre père » introduit un possessif qui n'est ni
dans le thaï ni enseigné par le parcours.

**Pourquoi c'est bloquant** : l'un des deux écrans porte une traduction fausse,
et le constat central de la page 9 est faux tel qu'écrit.

---

### F4. BLOQUANT. en.wiktionary « พี่ » est mal cité : une étiquette `(colloquial)` est attribuée à une sous-entrée qui n'en porte aucune

**Ce que la leçon écrit**, item 1 : « Les deux autres sous-entrées, affective
et vers un supérieur, sont marquées `(colloquial)` et ne sont pas enseignées. »
Et, tableau de la partie 3, colonne « Étiquette de registre » :
« aucune sur cette sous-entrée ; `(colloquial)` sur les deux autres ».

**Ce que la page contient réellement**, wikitexte relevé le 2026-08-04 :

- `## {{n-g|used as a title for or term of address to an elder brother, elder
sister, or older person; ...}}` : aucune étiquette ;
- `## {{n-g|used as an affectionate title for or term of address to a beloved,
older person; ...}}` : **aucune étiquette non plus** ;
- `## {{lb|th|colloquial}} {{n-g|used as a title for or term of address to a
superior, master, leader, or boss}}` : seule celle-ci porte `colloquial`.

Une seule des deux sous-entrées écartées porte l'étiquette annoncée. L'erreur
n'est pas décorative : la leçon s'en sert pour justifier le périmètre enseigné,
et l'étiquette inventée sur la sous-entrée affective sert à la faire sortir du
périmètre.

**Pourquoi c'est bloquant** : référence mal citée, employée comme argument de
périmètre.

---

### F5. BLOQUANT. Le champ `registre` des quatre items neufs est déduit d'un silence, donc porté par zéro jambe

- item 1, พี่ : « neutre dans l'emploi enseigné, devant un prénom. **Aucune
  source ne pose d'étiquette de registre sur cet emploi-là.** »
- item 2, น้อง : « neutre. Aucune des trois sources ne pose d'étiquette de
  registre sur l'emploi enseigné. »
- item 3, คุณพ่อ : « neutre. Le champ ne dit pas "poli", et c'est une décision.
  ... sans étiquette. »
- item 4, คุณแม่ : « neutre, pour le même motif qu'à l'item 3. »

`docs/content-policy/sources-verification.md`, section 1 ter, dernière phrase :
« Le sens d'un mot ordinaire, son ton, sa longueur, **son registre** et sa
naturalité restent soumis aux deux sources indépendantes, **sans exception**. »
Une absence d'étiquette n'est pas une source ; « neutre » est une valeur
positive de champ, pas un vide.

Le dossier de production affirme pourtant, en toutes lettres : « Chaque fait de
cette leçon porte donc deux jambes indépendantes, ou il a été retiré. » Cette
phrase est fausse pour quatre champs `registre` sur quatre items neufs.

**Aggravant, propre aux items 3 et 4.** La seule source définitionnelle
mobilisée est le RID sens (๓), qui définit คุณ comme le mot placé devant une
personne `เพื่อแสดงความยกย่อง`, pour marquer l'égard. Poser `registre : neutre`
sur un composé dont la source définitionnelle dit qu'il marque l'égard est un
choix qui se retourne contre lui-même dans le fichier : le champ `litteral` des
mêmes items dit « la marque d'égard, puis père », l'exercice 2 affiche « avec la
marque d'égard placée devant » sur les cartes 4 et 5, et le feedback affiche
« Le mot d'égard se pose devant ». Le dossier écrit néanmoins que le supplément
d'égard « n'est affiché sur aucun écran ».

**Aggravant, cohérence de méthode.** Le refus d'enseigner พี่ seul est motivé
par le fait que son registre « repose sur une seule source ». Le même standard,
appliqué aux quatre items neufs, les ferait tomber : leur registre repose sur
zéro source.

**Pourquoi c'est bloquant** : fait de registre non sourcé, catégorie que la
politique soumet explicitement et sans exception à deux jambes.

---

### F6. BLOQUANT. L'indépendance des deux jambes du fait le plus lourd de la leçon n'est pas établie, et le dépôt documente le contraire

La partie 1 du dossier annonce, pour « la particule dépend du sexe de celui qui
parle », fait des pages 2 et 3 et des exercices 1, 3 et 4 : « Il tient sur deux
jambes indépendantes », le RID et VOLUBILIS lignes 37006 et 37007 (ครับ), 28945
(ค่ะ) et 28944 (คะ).

`content/authoring/unite-02/verification-volubilis.md`, relevé versionné du
dépôt, donne la colonne `DOM` de ces mêmes lignes :

| Ligne | THA  | DOM                    |
| ----- | ---- | ---------------------- |
| 28944 | คะ   | `RID ; TOURIST`        |
| 28945 | ค่ะ  | `CHAT ; RID ; TOURIST` |
| 37006 | ครับ | `RID ; TOURIST`        |
| 37007 | ครับ | `RID ; TOURIST`        |

Le même document conclut : « **PORTE NON FRANCHIE** : le domaine `RID` porté
par ไหว้, ครับ, คะ et ค่ะ est un indice indirect, ce n'est pas une consultation
du RID. »

La leçon connaît ce risque, puisqu'elle écrit « VOLUBILIS est donc une
corroboration partiellement indépendante » et qu'elle vérifie l'absence de
`RID` en `DOM`. Mais elle ne fait ce contrôle que **sur les quatre items
neufs** : « Sur les quatre items neufs, la seconde jambe n'est jamais un `DOM`
marqué `RID` : les lignes 38698, 38614, 70926, 70927, 70929, 64027 et 64028 ne
portent pas `RID` en `DOM`. » Le contrôle est donc fait là où il ne changeait
rien, et omis exactement là où il change tout.

Note : la leçon écarte par ailleurs en.wiktionary comme jambe (« Troisième
relevé, non compté comme jambe ») au motif qu'il appartient au même écosystème
que th.wiktionary. Ce motif ne vaut que pour ne pas compter DEUX jambes
Wikimedia ; il n'interdit pas d'en compter UNE, indépendante du RID et de
VOLUBILIS. La jambe manquante est donc disponible, elle n'est simplement pas
réclamée.

**Pourquoi c'est bloquant** : le fait porteur de la leçon est déclaré doublement
sourcé alors que sa seconde jambe est, d'après le dépôt lui-même, un indice
indirect du RID.

---

### F7. BLOQUANT. « Trois tirages sur douze » à l'exercice 4 : il y en a un, et le fichier se contredit lui-même

Exercice 4, section « Ce qu'il mesure » : « Trois tirages sur douze poussent la
chose à son terme : **les trois options y portent la même particule.** »

Contrôle refait par l'auditeur, tirage par tirage, sur le tirage exact publié :

| Tirage | Particules des trois options | Trois identiques ? |
| ------ | ---------------------------- | ------------------ |
| 1      | ครับ, ค่ะ, ครับ              | non                |
| 2      | ค่ะ, ครับ, ค่ะ               | non                |
| 3      | ครับ, คะ, ครับ               | non                |
| 4      | คะ, ค่ะ, ครับ                | non                |
| 5      | ครับ, ค่ะ, ครับ              | non                |
| 6      | ค่ะ, ครับ, คะ                | non                |
| 7      | ครับ, ค่ะ, ครับ              | non                |
| 8      | ค่ะ, ครับ, ค่ะ               | non                |
| 9      | ครับ, คะ, ครับ               | non                |
| 10     | คะ, ครับ, คะ                 | non                |
| 11     | ครับ, ครับ, ครับ             | **oui**            |
| 12     | คะ, ครับ, คะ                 | non                |

**Un seul tirage, le 11.** L'affirmation est fausse d'un facteur trois, et elle
est démentie par les deux autres passages du même exercice : le plancher mesuré
écrit « Deux options sur trois portent la bonne particule aux tirages 1 à 10 et
12 ; au tirage 11, les TROIS options portent ครับ », et le contrôle de
construction écrit « Les tirages 11 et 12 poussent le plus loin, avec trois
options sur trois puis deux sur trois ». Ces deux passages sont justes ; c'est
la phrase de tête qui est fausse.

**Pourquoi c'est bloquant** : le fichier annonce que ses planchers et ses
contrôles de construction sont « recalculés sur le tirage exact publié
ci-dessous, jamais estimés ». Une propriété annoncée de la construction de
l'exercice est fausse.

---

### F8. BLOQUANT. Affirmation non sourçable sur toute la langue, page 3, écran d'apprenant

Page 3 : « **C'est une des rares fois où le thaï demande plus à une femme qu'à
un homme**, et ce n'est pas une règle sociale, c'est une répartition de
formes. »

C'est une généralisation quantifiée (« une des rares fois ») sur l'ensemble du
thaï, et une comparaison de charge entre hommes et femmes. Aucune source n'est
citée, aucune ne pourrait l'être avec les sources autorisées : ni le RID, ni
VOLUBILIS, ni Wiktionary ne mesurent la fréquence des asymétries de genre dans
la langue. La phrase se disqualifie elle-même comme règle sociale dans sa
seconde moitié, mais sa première moitié en est une.

Elle contredit en outre la Méta du fichier : « Elle n'énonce **AUCUNE** règle
sociale », et le principe de la politique qui proscrit les absolus non
vérifiables.

**Pourquoi c'est bloquant** : affirmation d'usage social non sourcée, affichée
à l'apprenant.

---

### F9. NON BLOQUANT. L'arbitrage 1 est fondé sur une lecture fausse de `lecon-11d.md`, et le relevé des recouvrements omet `lecon-11e.md`

**Ce que la leçon écrit** : « `lecon-11d.md` **revendique** `แล้วคุณล่ะ` », puis
arbitrage 1 : « Le bloc est publié par `u06-l6e` item 2, ... et **revendiqué
comme graphie par `lecon-11d.md`** ... **Deux leçons ne peuvent pas le
publier.** L'arbitrage appartient à la consolidation. »

**Ce que `lecon-11d.md` écrit réellement**, ligne 360 :

> `### Item 1 : แล้วคุณล่ะ (réemploi, publié par u06-l6e item 2)`

`lecon-11d.md` attribue explicitement la publication à `u06-l6e`, exactement
comme 11B. Il n'y a pas deux leçons qui prétendent publier le bloc, donc pas de
conflit, donc pas d'arbitrage à porter. La confusion vient de ce que
`repo-thai-scan.mjs --grep` compte une ENTRÉE, ce qui n'est pas une
revendication de publication.

**Second point.** Le relevé « Recouvrements constatés dans l'unité » ne nomme
que `lecon-11c.md` et `lecon-11d.md`. Il omet `lecon-11e.md`, qui réemploie
**onze** des mêmes items que 11B (ครับ, ค่ะ, คะ, ผม, ดิฉัน, คุณ, ชื่อ,
สบายดี / สบายดีไหม, แล้วคุณล่ะ, ต้น, นก) et qui porte lui aussi
`แล้วคุณล่ะ` en item 9, avec la même mention « réemploi, publié par `u06-l6e`
item 2 ». C'est le plus gros recouvrement de l'unité, et c'est le seul qui ne
soit pas mentionné, alors que le fichier écrit que « Les contrôles de collision
ci-dessous ont tous été REFAITS sur cet état à cinq fichiers ».

---

### F10. NON BLOQUANT. Un fait mono-sourcé et non recomputable est affiché sur un écran d'apprenant, page 7

Page 7 : « **Ce sont des mots courants** : dans un relevé de fréquence de
cinquante mille mots, คุณพ่อ arrive au rang 780 et คุณแม่ au rang 1057. »

- La source unique est FrequencyWords, que
  `docs/content-policy/sources-verification.md` classe comme « bon signal de
  naturalité orale **en complément** d'un signal écrit », et que le dossier de
  la leçon qualifie lui-même de « **signal indicatif seulement** », en ajoutant
  « aucun rang n'établit un sens, un ton ni un registre, et aucun n'est affiché
  sur un écran d'apprenant **sauf à la page 7** ». L'exception est donc reconnue
  et non résolue.
- « Ce sont des mots courants » est une affirmation de naturalité, catégorie que
  la section 1 ter soumet aux deux sources indépendantes sans exception.
- Le fichier `th_50k.txt` n'étant pas dans le dépôt, ni le rang 780 ni le rang
  1057 ne sont recomputables par un tiers, ce que l'amendement v1.2 de
  `CONVENTIONS.md` exige pourtant de toute référence.
- Cette exception contredit une nouvelle fois la phrase « Chaque fait de cette
  leçon porte donc deux jambes indépendantes, ou il a été retiré. »

---

### F11. NON BLOQUANT. Trois comptes faux ou incomplets dans le fichier

1. **Méta, cible phonétique** : « la syllabe sà de สบายดี, **présente dans huit
   des douze tirages de l'exercice 1** ». Recompté : สบายดี apparaît aux
   tirages 2, 4, 6, 8, 9 et 11, soit **six** sur douze. On atteint huit en
   comptant aussi la syllabe sà de สวัสดี (tirages 1 et 5), mais la phrase dit
   « de สบายดี ».
2. **Méta** : « **onze blocs** de dialogue et d'exercice, est du réemploi ». Le
   tableau « Blocs réemployés sans fiche d'item » en liste **quinze**, et la
   section SRS écrit elle-même « les **quinze** blocs du tableau ».
3. **Inventaire incomplet** : le bloc `สบายดี` seul, employé au tirage 11 de
   l'exercice 1 et nommé dans la section SRS parmi « les quatre blocs sans
   particule de l'exercice 1 », **ne figure pas** dans le tableau des blocs
   réemployés, qui est pourtant l'inventaire exhaustif déclaré. Il est bien
   publié par `u02-l2e` item 11, l'omission est de déclaration, pas de source.

---

### F12. NON BLOQUANT. Une citation interne inventée, et l'arbitrage 4 repose dessus

**Item 15, นก** : « Cette leçon écrivait que "**aucune des deux sources ne
l'atteste**" comme prénom, ses deux sources étant les deux éditions de
Wiktionary. »

La phrase entre guillemets n'appartient pas à l'item นก de `u02-l2e` : elle
appartient à son **item 12, ต้น**. L'item 13, นก, écrit : « Comme pour ต้น, la
leçon n'affirme rien sur son emploi comme surnom », et son champ `sources`
écrit « L'entrée ne mentionne aucun emploi comme prénom ou surnom », phrase
bornée à l'entrée consultée.

**Arbitrage 4** en tire : « `u02-l2e` écrit qu'aucune source ne l'atteste ; ...
la phrase de `u02-l2e` est trop absolue et devrait être resserrée à la
consolidation. » L'arbitrage vise une phrase qui, telle qu'écrite dans
`u02-l2e`, est déjà bornée à ses deux sources et n'est donc pas absolue.

Le fait remonté sur le fond, VOLUBILIS attestant นก en `n. prop.`, n'a pas pu
être vérifié faute de classeur dans le dépôt, et la conclusion de la leçon
(une jambe, donc rien de neuf n'est enseigné) reste correcte quoi qu'il en soit.

---

## 3. Points attaqués sans succès, consignés pour ne pas être réattaqués

- **Le retrait de น้อง + prénom est justifié et exécuté.** Le RID écrit bien
  `คำนำหน้าชื่อ` pour พี่ et seulement `เรียกคน` pour น้อง, contrôlé par
  l'auditeur. La chaîne น้อง + prénom est bien absente du dialogue, des cinq
  exercices, des distracteurs et de la carte SRS : recherche faite sur tout le
  fichier.
- **Les quatre compositions de la partie 5** sont déclarées comme telles et non
  présentées comme attestées. Rien à ajouter tant qu'une source ne les infirme
  pas.
- **Les planchers d'exercice sont exacts** (voir 1.5), y compris le passage de
  10 sur 12 à 11 sur 12 à l'exercice 1, qui est arithmétiquement fondé. La
  réserve d'indépendance des tirages soulevée par la leçon elle-même reste
  valide et non traitée, mais elle rendrait le seuil PLUS sûr, pas moins.
- **Aucun exercice n'est réussissable par une réponse constante** : 33,3 % à
  l'exercice 1, bijection à l'exercice 2, tuiles variables à l'exercice 3,
  ordre mélangé à l'exercice 4, saisie libre à l'exercice 5. Vérifié.
- **Unicode, NFC, codepoints, fidélité de réemploi** : rien à redire, voir 1.3.
- **Décodabilité du dialogue** : les dix répliques sont intégralement composées
  de blocs publiés par les unités 1 à 10 ou d'items du jour. Aucun mot non
  enseigné. Seul le français de la ligne 9 pose problème, et c'est le F3.

## 4. Ce que la résolution doit produire

1. F1 : rétablir la seconde branche du sens (๒) du RID dans l'item 1, et
   récrire la page 10, la Méta et l'exclusion SRS pour qu'elles décrivent un
   CHOIX de périmètre et non un constat de source.
2. F2 : soit ajouter aux tirages 11 et 12 la contrainte explicite qui existe
   déjà au tirage 3 (« en la désignant », et une contrainte équivalente pour
   exclure คุณ), soit retirer ces deux tirages et refaire le plancher, soit
   accepter deux réponses. Idem pour `srs-u11-l11b-01`.
3. F3 : trancher le sens de `คุณพ่อสบายดีไหมครับ` et ne le montrer que dans un
   seul des deux emplois, ou récrire la page 9 pour qu'elle n'affirme plus
   l'identité de la colonne française sur quatre lignes.
4. F4 : corriger la citation d'en.wiktionary, item 1 et tableau partie 3.
5. F5 : sourcer le registre des quatre items neufs, ou écrire que le champ est
   indéterminé, et retirer la phrase « Chaque fait de cette leçon porte deux
   jambes indépendantes, ou il a été retiré ».
6. F6 : refaire le contrôle `DOM ≠ RID` sur les lignes 28944, 28945, 37006 et
   37007, et si le `DOM` porte bien `RID`, réclamer en.wiktionary comme seconde
   jambe au lieu de VOLUBILIS.
7. F7, F11 : corriger les chiffres.
8. F8 : supprimer la première moitié de la phrase de la page 3.
9. F9, F12 : retirer l'arbitrage 1 et récrire l'arbitrage 4 sur la phrase
   réellement écrite par `u02-l2e`.
10. F10 : retirer les deux rangs de la page 7 ou les présenter sans
    l'affirmation « Ce sont des mots courants ».
11. Verser `VOLUBILIS_Database.xlsx` et `th_50k.txt` au dépôt, ou renoncer à
    présenter leurs citations comme recomputables.

## 5. État après audit

- Contre-audit interne : **LANCÉ et rendu**, ce fichier.
- Findings bloquants ouverts : **7** (F1 à F8, F9 exclu).
- Statut de la leçon : reste `draft`. Revue native : en attente.
- Contre-audit externe `GPT-5.6 SOL ULTRA` : toujours non lancé. Les points à
  lui soumettre en priorité sont F1 (lecture du sens ๒ de « พี่ ») et F2
  (dérivabilité du corrigé des tirages 11 et 12).

---

# Passe 2 : second contre-audit adversarial, après résolution de la passe 1

- Fichier audité : `content/authoring/unite-11/lecon-11b.md`, état du
  2026-08-04 (2 180 lignes, postérieur à la résolution des douze findings de la
  passe 1 ci-dessus).
- Date : 2026-08-04.
- Auditeur : second agent adversarial indépendant (Claude Opus 5,
  `claude-opus-5[1m]`), qui n'a pas écrit la passe 1.
- Consigne appliquée : chercher à invalider. **Aucun chiffre, aucune citation
  et aucune ligne de la passe 1 n'a été repris de confiance** : tout a été
  refait à la source ou par les scripts versionnés. La consigne rappelait que
  des corrections d'audit se sont récemment révélées fausses ou incomplètes ;
  c'est exactement ce que cette passe a trouvé.
- Statut rendu : **12 findings, dont 6 bloquants.** La leçon ne peut pas passer
  `draft -> review` en l'état. **Quatre des douze findings de la passe 1 n'ont
  été corrigés qu'à MOITIÉ** : la correction a été portée à l'endroit que
  l'auditeur nommait, et l'autre occurrence du même défaut, dans une autre
  section du même fichier, a été laissée telle quelle.

## P2.0 Ce que cette passe n'a pas pu recomputer

- `VOLUBILIS_Database.xlsx` : absent du dépôt, contrôle refait
  (`find . -iname "*VOLUBILIS*"` ne rend que deux scripts et trois
  `verification-*.md`). Aucun numéro de ligne VOLUBILIS n'a été recomputé
  directement. Les seuls recoupements possibles passent par les relevés
  versionnés `unite-02/verification-volubilis.md`, `unite-02/lecon-2b.md` et
  `unite-02/lecon-2d.md`, et ils ont tous été faits.
- `content/2018/th/th_50k.txt` : absent du dépôt. Aucun rang de fréquence
  recomputé.
- Les empreintes SHA-256 annoncées ne sont donc pas recalculables. Elles sont
  en revanche **identiques**, au caractère près, à celles documentées dans
  l'en-tête de `scripts/verification/volubilis-lookup.mjs` et à celles de
  `u08-l8a`, `u09-l9a` et `u10-l10a` : la limite de recomputabilité déclarée
  par le dossier est exacte, et déclarée honnêtement.

## P2.1 Faits re-vérifiés par cette passe et CONFIRMÉS (41)

### RID 2554, huit requêtes refaites le 2026-08-04

Par `node scripts/verification/rid-entry.mjs` et `rid-lookup.mjs`, endpoint
`POST https://dictionary.orst.go.th/func_lookup.php`,
`word=<graphie>&funcName=lookupWord&status=lookup`.

1. **พี่** : vedette unique, deux sens. Le sens (๑) porte bien la branche
   `ผู้ที่มีศักดิ์เสมอพี่`. CONFIRMÉ.
2. **พี่**, sens (๒) : `คำนำหน้าชื่อคนที่มีอายุคราวพี่หรือมีศักดิ์เสมอพี่`,
   donc bien un `คำนำหน้าชื่อ` et bien **deux critères alternatifs** liés par
   `หรือ`. CONFIRMÉ, y compris la lecture « rang **équivalent** ».
3. **พี่** : deux exemples de la forme mot + prénom, `พี่แดง` et `พี่ส้ม` ;
   aucun des deux sens ne mentionne le sexe ; trois `ลูกคำ` (พี่น้อง, พี่เบิ้ม,
   พี่เลี้ยง). CONFIRMÉ.
4. **น้อง** : vedette unique, trois sens ; le sens (๑) réunit bien la personne
   née après, `ลูกของอาหรือของน้า` et `เรียกคนที่มีอายุคราวน้อง` ; deux `ลูกคำ`
   (น้อง ๆ, น้องเพล). CONFIRMÉ.
5. **L'asymétrie centrale de la leçon est réelle** : `คำนำหน้าชื่อ` pour พี่
   contre `เรียกคน` pour น้อง, sans aucune mention de position devant un nom.
   CONFIRMÉ à la source.
6. **คุณ** : deux vedettes, « คุณ ๑, คุณ- » (six sens, lecture
   `[คุน, คุนนะ-]`, dix-huit `ลูกคำ`) et « คุณ ๒ » (`อาถรรพณ์`, `คุณไสย`).
   CONFIRMÉ, dix-huit `ลูกคำ` recomptés un par un.
7. **คุณ**, sens (๓) : `คำที่ใช้เรียกนำหน้าบุคคลเพื่อแสดงความยกย่อง เช่น
คุณพ่อ คุณแม่ คุณสมร`. Le dictionnaire prend donc bien **คุณพ่อ et คุณแม่**
   pour ses deux premiers exemples, plus un troisième. CONFIRMÉ.
8. **คุณ**, sens (๖) : `เป็นคำสุภาพ`, pronom de 2e personne, plus un emploi de
   3e personne étiqueté `(ปาก)`. CONFIRMÉ.
9. **ครับ** : vedette unique, `ว.`, lecture `[คฺรับ]`
   (U+0E04 U+0E3A U+0E23 U+0E31 U+0E1A), `ที่ผู้ชายใช้`, aucun exemple, aucune
   restriction de type d'énoncé. CONFIRMÉ.
10. **ค่ะ** : `ว.`, `ที่ผู้หญิงใช้`, valeur de `จ้ะ`, `บอกให้ทราบอย่างสุภาพ`,
    deux exemples déclaratifs (`ไปค่ะ`, `ไม่ไปค่ะ`). CONFIRMÉ.
11. **คะ** : **deux vedettes homographes**, « คะ ๑ » (`คำกร่อน` de
    redoublement en poésie) et « คะ ๒ » (après question ou marque de doute,
    plus après `ซิ` et `นะ`). CONFIRMÉ, y compris le partage que la leçon
    signale comme inédit dans le dépôt.
12. **Contrôles négatifs** : `rid-lookup.mjs คุณพ่อ คุณแม่` rend `absent` pour
    les deux. CONFIRMÉ.

### en.wiktionary, API MediaWiki, relevés refaits le 2026-08-04

Par `action=query&prop=revisions&rvslots=main`, qui **ne suit pas** les
redirections. Piège à consigner pour les prochaines passes : `action=parse`
suit la redirection dès que le paramètre `redirects` est présent, quelle que
soit sa valeur, y compris `redirects=0` ; une vérification de redirection faite
par `action=parse` rend le contenu de la CIBLE et masque le fait à vérifier.

13. **พี่**, pageid **724653**. CONFIRMÉ.
14. **พี่** : aucune section `Pronoun`. CONFIRMÉ, la page ne porte qu'un
    `===Noun===` pour le thaï.
15. **พี่**, 3e définition nominale : `{{lb|th|colloquial}} [[superior]];
[[master]]; [[leader]]; [[boss]]`. CONFIRMÉ au caractère près.
16. **พี่**, 4e définition nominale : `{{n-g|used as a title or term of
address}}`, et sa 1re sous-entrée vise `an elder brother, elder sister, or
older person` avec l'emploi réciproque, **sans aucun `{{lb}}`**. CONFIRMÉ.
17. **น้อง**, 5e définition nominale : emploi comme titre ou terme d'adresse,
    **quatre** sous-entrées, la 1re visant les cadets et les personnes plus
    jeunes, sans étiquette. CONFIRMÉ.
18. **น้อง** : les deux sous-entrées étiquetées sont bien `{{lb|th|slang}}` et
    `{{lb|th|colloquial|sometimes considered|_|offensive}}`. CONFIRMÉ.
19. **คุณ** : section `Pronoun`, `{{lb|th|colloquial|polite}} {{n-g|a second or
third person pronoun, used out of respect}}`. CONFIRMÉ.
20. **คุณ**, 8e définition nominale : `{{lb|th|colloquial|polite}} {{n-g|used as
a title for or term of address to anyone out of respect}}`. CONFIRMÉ, y
    compris le mot **anyone** sur lequel la page 4 s'appuie.
21. **ครับ**, pageid **1909858**, étiquette
    `{{lb|th|formal|humble|men's speech}}`, définition « employed by males to
    express affirmation or assent, or to politely end any expression ».
    CONFIRMÉ.
22. **ค่ะ**, pageid **1909859**, et **คะ**, pageid **1954139**, toutes deux
    étiquetées « formerly used by noblemen, now often employed by women ».
    CONFIRMÉ. Le « souvent » que la page 2 affiche à l'apprenant est bien dans
    la source.
23. Les deux pages portent la catégorie `{{cln|th|…women's speech terms}}`.
    CONFIRMÉ.
24. **คุณพ่อ** en.wiktionary : pageid **6614720**, wikitexte entier
    `#REDIRECT [[พ่อ]]`. **คุณแม่** : pageid **6614721**, `#REDIRECT [[แม่]]`.
    **th.wiktionary คุณพ่อ** : `#เปลี่ยนทาง [[พ่อ]]`. CONFIRMÉ, les trois.

### Réemploi, priorité 1 de la consigne

25. `node scripts/verification/item-fields-check.mjs
content/authoring/unite-11/lecon-11b.md` rend **0 champ `codepoints` en
    faute, 0 écart de réemploi**. CONFIRMÉ, exécution refaite.
26. **Contrôle au-delà du script.** `item-fields-check.mjs` ne compare que
    `ipa`, `ton`, `longueur`, `transcription` et `codepoints`. Les champs `fr`
    et `registre` des **onze** réemplois ont donc été comparés à la main aux
    leçons d'origine : tous identiques (item 5 contre `u02-l2d` item 4 ;
    items 6 et 7 contre `u01-l1e` items 2 et 3 ; item 8 contre `u02-l2e`
    item 1 ; items 9 et 10 contre `u02-l2d` items 1 et 2 ; items 11, 12 et 13
    contre `u06-l6b` items 1, 2 et 5 ; items 14 et 15 contre `u02-l2e`
    items 12 et 13). **Aucune divergence silencieuse.** CONFIRMÉ.
27. **Items 1 et 2**, les deux extensions d'emploi : les cinq champs
    phonologiques sont identiques à `u06-l6b` items 3 et 4. CONFIRMÉ.
28. Les **deux apostrophes droites** des champs `fr` des items 6 et 7 sont bien
    U+0027 des deux côtés, dans 11B comme dans `u01-l1e`. La justification du
    dossier est exacte. CONFIRMÉ.
29. `u01-l1e` item 2 ne cite effectivement **pas** le RID (en.wiktionary,
    th.wiktionary, Volubilis seulement) : la remarque de l'item 6 est exacte.
    CONFIRMÉ.
30. `u02-l2d` consigne bien une divergence de registre sur ดิฉัน (l.939-941,
    « À arbitrer ») : la note de l'item 10 est exacte. CONFIRMÉ.

### Contrôles de dépôt

31. `repo-thai-scan.mjs 1 10` : **50 fichiers, 461 entrées, 337 graphies**.
    CONFIRMÉ au chiffre près.
32. `repo-thai-scan.mjs 11 11` : **5 fichiers, 51 entrées, 42 graphies, 16
    ไม้เอก, 16 ไม้โท**. CONFIRMÉ : c'est bien le troisième relevé qui décrit
    l'état actuel.
33. `--grep คุณพ่อ` et `--grep คุณแม่` : **0** sur 1-10, **1** sur l'unité 11 et
    c'est ce fichier. **Aucune collision de publication.** CONFIRMÉ.
34. `--grep พี่` (6 graphies, `u06-l6b`, `u06-l6d`, `u06-l6e`), `--grep น้อง`
    (5, mêmes fichiers), `--grep คุณ` (7, `u01-l1e`, `u02-l2c`, `u02-l2d`,
    `u06-l6c`, `u06-l6e`). CONFIRMÉ, les trois lignes du tableau de contrôle.
35. `lecon-11d.md` **ligne 360** et `lecon-11e.md` **ligne 697** portent bien,
    au caractère près, `### Item N : แล้วคุณล่ะ (réemploi, publié par
u06-l6e item 2)`. La correction de la Méta est exacte : aucun conflit de
    publication. CONFIRMÉ.
36. Les **six** cartes SRS citées existent dans leur leçon d'origine, et leur
    description est exacte : `srs-u01-l1e-04` (« règle ครับ/ค่ะ »),
    `srs-u02-l2b-03` (« contraste คะ contre ค่ะ chez une locutrice »),
    `srs-u02-l2e-03` (« consolidation de 2B »), `srs-u04-l4a-06` (« montant
    contre haut à l'écoute »), `srs-u06-l6b-02` (âge relatif + le mot ne
    précise pas le sexe), `srs-u07-l7a-03` (« moyen contre bas à l'écoute »).
    CONFIRMÉ.
37. Empreinte VOLUBILIS annoncée (10 848 409 octets, SHA-256 `b9ab7418…`,
    114 579 lignes, 586 541 chaînes) **identique** à l'en-tête de
    `volubilis-lookup.mjs` et aux dossiers de `u08-l8a`, `u09-l9a` et
    `u10-l10a`. CONFIRMÉ par recoupement interne.
38. Lignes VOLUBILIS **28944, 28945, 37006, 37007**, leurs gloses françaises et
    leur `DOM` portant `RID` : recomputées sur le relevé versionné
    `unite-02/verification-volubilis.md`, qui travaille lui-même sur le
    `.xlsx`. La citation « PORTE NON FRANCHIE : le domaine `RID` porté par
    ไหว้, ครับ, คะ et ค่ะ est un indice indirect, ce n'est pas une consultation
    du RID » est exacte au mot près. **La récusation de VOLUBILIS comme seconde
    jambe de la partie 1 est fondée.** CONFIRMÉ.
39. Lignes VOLUBILIS **90790** (สวัสดีครับ) et **90788** (สวัสดีค่ะ) :
    concordent exactement avec `u02-l2b`, qui cite explicitement
    `VOLUBILIS Database.xlsx`. Deux numéros sur vingt-six sont donc bien
    recoupables dans le dépôt, et ils tombent juste. CONFIRMÉ.

### Arithmétique, décodabilité, Unicode

40. **Exercice 1** : répartition strictement 4/4/4, plancher constant 4/12 ;
    espérance de la stratégie « la particule marque le locuteur, sans savoir
    laquelle » = 4 + 8 × 0,5 = **8/12** ; P(≥10) = (28+8+1)/256 = **37/256** ;
    P(≥11) = (8+1)/256 = **9/256**. Les quatre chiffres sont exacts. CONFIRMÉ.
41. **Exercice 4** : recompté tirage par tirage sur les douze tirages publiés.
    Deux options sur trois portent la particule du locuteur aux tirages 1 à 10
    et 12 ; **au seul tirage 11 les trois options portent ครับ**. Espérance
    11 × 0,5 + 1/3 = **5,83/12 = 48,6 %**. La correction « UN tirage sur douze »
    de la passe 1 est exacte, et le contrôle 3 (« aucun tirage ne comporte une
    seule option à particule correcte ») tient. La dérivabilité des corrigés 11
    et 12 par la seule contrainte « en le désignant par son prénom » a été
    refaite option par option : elle tient. CONFIRMÉ.

Trois contrôles supplémentaires, comptés dans les 41 ci-dessus par regroupement
et consignés ici pour qu'on ne les refasse pas : la **couverture tonale de
l'exercice 5** (moyen 1/4/5, descendant 2/7/4/5, haut 3/6/8, montant 9/10, ton
bas absent) est exacte ; les **huit tirages de l'exercice 1 portant la syllabe
sà** sont exactement 1, 2, 4, 5, 6, 8, 9 et 11, dont six de สบายดี et deux de
สวัสดี, exactement comme la Méta le récrit après la passe 1 ; **toutes les
transcriptions du dialogue** concordent avec les blocs publiés (`sà·wàt·dii
khráp`, `sà·baai·dii khâ`, `sà·baai·dii·mǎi khráp`, `khàwwp·khoun khráp`,
`láeew khoun lâ`, `phîi·chaai`, `chûee`), et **aucune réplique ne contient un
mot hors des unités 1 à 11**. Les séquences NFC des quatre items neufs, de
พี่ต้น et de คุณ ont été recalculées depuis le champ `thai` : exactes.

## P2.2 Findings de la passe 2

### P2-F1. BLOQUANT. La correction de F4 (passe 1) n'a été portée qu'à un seul des deux endroits : la partie 3 reconduit la citation fausse d'en.wiktionary

L'item 1 (l.507-517) écrit, à juste titre : « La première rédaction écrivait
qu'elles étaient "marquées `(colloquial)`" toutes les deux : **c'est faux** …
**Une seule des deux porte l'étiquette.** »

Le tableau de la **partie 3** (l.1905) écrit toujours, pour en.wiktionary :
« aucune sur cette sous-entrée ; **`(colloquial)` sur les deux autres** ».

Wikitexte relevé à la source ce jour (pageid 724653), sous la définition
nominale 4 :

- sous-entrée 1 : `## {{n-g|used as a title for or term of address to an elder
brother, …}}` — aucune étiquette ;
- sous-entrée 2 : `## {{n-g|used as an affectionate title for or term of
address to a beloved, older person; …}}` — **aucune étiquette** ;
- sous-entrée 3 : `## {{lb|th|colloquial}} {{n-g|used as a title for or term of
address to a superior, master, leader, or boss; …}}`.

« `(colloquial)` sur les deux autres » est donc faux, et c'est mot pour mot
l'erreur que l'item 1 déclare corrigée. Le fichier porte les deux versions.

**Pourquoi c'est bloquant** : référence mal citée, sur la source qui porte la
seconde jambe de l'item 1, et dans la section du dossier qui sert justement à
justifier le périmètre enseigné.

**Correction attendue** : dans le tableau de la partie 3, remplacer par
« aucune sur la sous-entrée enseignée ; aucune sur la sous-entrée affective ;
`(colloquial)` sur la seule sous-entrée de rang supérieur ».

---

### P2-F2. BLOQUANT. Item 8 et incertitude 8 : « deux de nos sources donnent à คะ l'information polie » — aucune des trois sources citées par l'item ne la donne

Item 8, `note_fr` : « Le dictionnaire normatif la donne pour ce qui suit une
question ou une marque de doute ; **deux de nos sources lui donnent aussi
l'information polie**, ce qui est plus large. » L'incertitude 8 répète : « deux
autres sources lui donnent aussi l'information polie ».

Les trois sources que l'item 8 cite, relevées ce jour :

- **RID « คะ ๒ »** : `ต่อจากคำถามหรือคำแสดงความสงสัย`, plus l'emploi après `ซิ`
  et `นะ`. Pas d'information. (`บอกให้ทราบอย่างสุภาพ` est dans l'entrée **ค่ะ**,
  pas dans คะ.)
- **en.wiktionary, pageid 1954139** : « used to express doubt, interrogation,
  suggestion » et « used at the end of an expression of doubt, interrogation,
  or suggestion ». Pas d'information.
- **VOLUBILIS ligne 28944**, relevé versionné `unite-02/verification-volubilis.md` :
  « oui ; [formule de politesse en fin de **vocatif** ou de phrase
  **interrogative**] ». Pas d'information.

La lecture « information polie » vient d'une quatrième source, **th.wiktionary**
(`คำลงท้ายที่ผู้หญิงใช้ในการถาม **หรือบอกให้ทราบ**อย่างสุภาพ`), citée par
`u02-l2e` item 1 et **jamais citée par 11B**. Et par la règle d'écosystème que
11B pose elle-même (l.1773-1777), th.wiktionary ne pourrait de toute façon pas
faire une jambe séparée d'en.wiktionary.

Le champ `fr` réemployé tel quel de `u02-l2e` n'est pas en cause : c'est la
phrase de justification qui attribue à des sources ce qu'elles ne disent pas.

**Correction attendue** : soit citer th.wiktionary et dire que la largeur ne
tient que sur l'écosystème Wikimedia, donc sur une jambe, soit retirer la
phrase et écrire que la largeur vient de `u02-l2e` et n'est pas re-sourcée ici.

---

### P2-F3. BLOQUANT. Le statut du contre-audit interne porte deux valeurs opposées, et la section invoquée n'existe pas

- Méta l.199-201 : « **Contre-audit interne : passé le 2026-08-04**, douze
  findings rendus, résolus un par un à la section « **Réponse au contre-audit
  interne** » du dossier. »
- État des audits l.2111-2113 : « Contre-audit interne : **NON LANCÉ**. Ce
  fichier n'a été relu par aucun agent adversarial indépendant. Aucun chiffre
  de ce dossier n'a été recomputé par un tiers. »
- `grep "Réponse au contre-audit" lecon-11b.md` : **aucune occurrence**. La
  section citée par la Méta n'existe pas.

C'est la Méta qui dit vrai sur le fond : la passe 1 existe, elle est au même
fichier que ce rapport, et elle a bien rendu douze findings. Mais l'« État des
audits » est la ligne que lit une porte de publication, et elle affirme le
contraire. Le dossier laisse en outre croire qu'il existe une trace de
résolution finding par finding : il n'y en a pas, et cette passe montre qu'au
moins quatre résolutions sont incomplètes (P2-F1, P2-F5, P2-F6, P2-F10).

**Pourquoi c'est bloquant** : une porte de publication ne peut pas être
évaluée sur deux états contradictoires du même contrôle.

---

### P2-F4. BLOQUANT. Remarque « Deux » du dialogue : un fait de grammaire thaïe est enseigné sans aucune source, et c'est lui qui rend la ligne 9 traduisible

Texte affiché (l.1522-1526) : « elle porte "Votre", le thaï ne porte rien de
tel. **Le français a besoin d'un possessif pour dire de quel père il s'agit ;
le thaï s'en passe et laisse la situation le dire.** Ce n'est pas un mot de
plus à apprendre, c'est une différence entre les deux langues. »

La première moitié est une observation que l'apprenant vérifie sur l'écran, et
elle est recevable. La seconde est un **fait de grammaire thaïe** : l'omission
du possessif. Aucune partie du dossier ne le source. Le seul fait voisin
établi est celui de `u02-l2d` page 6, vérifié ce jour : « une phrase thaïe
reste complète et polie **sans pronom sujet** », montré « de deux manières
indépendantes ». Un pronom sujet n'est pas un possessif, et la Méta de 11B
cite d'ailleurs `u02-l2d` sous cette forme exacte, sans extension.

Or c'est de ce fait non sourcé que dépend la traduction de la ligne 9 du
dialogue, « **Votre** père va bien ? », et donc la lecture de `คุณพ่อ` comme
désignant le père de l'interlocutrice plutôt que celui du locuteur.

**Pourquoi c'est bloquant** : fait de langue enseigné sur écran avec zéro
jambe, dans une catégorie que la section 1 ter de
`docs/content-policy/sources-verification.md` soumet explicitement aux deux
sources indépendantes.

**Correction attendue** : sourcer l'omission du possessif sur deux jambes, ou
retirer la seconde moitié de la remarque et reformuler la ligne 9 en français
sans possessif (« Et le père, il va bien ? »), ou retirer la ligne 9.

---

### P2-F5. BLOQUANT. La correction de F12 (passe 1) n'a été portée qu'à l'item 15 : l'arbitrage 4 reconduit la lecture fausse, et demande à la consolidation de corriger une phrase qui n'existe pas

L'item 15 (l.1085-1096) corrige, et sa correction est exacte : relecture faite
de `unite-02/lecon-2e.md`, la phrase « aucune des deux sources ne l'atteste »
appartient à son **item 12, ต้น** ; son item 13, นก, écrit seulement « Comme
pour ต้น, la leçon n'affirme rien sur son emploi comme surnom », et son champ
`sources` écrit « L'entrée ne mentionne aucun emploi comme prénom ou surnom »,
phrase bornée aux entrées consultées. L'item 15 conclut : « **l'arbitrage 4 qui
reposait sur cette lecture a été retiré** ».

**L'arbitrage 4 n'a pas été retiré.** Il est toujours là, l.2165-2168 :
« `u02-l2e` écrit qu'aucune source ne l'atteste … la phrase de `u02-l2e` est
trop absolue et devrait être resserrée à la consolidation. »

Le fichier affirme donc simultanément que la phrase de `u02-l2e` n'est pas
absolue et qu'elle est trop absolue, et il envoie à la consolidation une action
fondée sur la seconde lecture. La passe 1 avait nommé l'arbitrage 4
explicitement dans son finding F12.

**Pourquoi c'est bloquant** : affirmation fausse sur le contenu d'une autre
leçon, transformée en demande d'action sur cette leçon.

---

### P2-F6. BLOQUANT. Item 5 : la ligne VOLUBILIS contestée est mal attribuée, l'explication « `.ods` » ne tient pas, et une divergence réelle est masquée

Item 5 (l.746-750) : « **La ligne 38546 citée par `u02-l2d` pour l'emploi
devant un nom** n'a pas d'équivalent à ce numéro dans le `.xlsx` : cette leçon
citait le `.ods`, dont les lignes ne coïncident pas. »

Relecture directe de `unite-02/lecon-2d.md` l.254-257 : « Volubilis v26.2,
lignes 38546, 38547 et 38548 … notation phonétique `-khun` (ton moyen) ;
pronom personnel « vous (sg.) » ; **et entrée distincte « คุณ... » glosée
« M. ; Mme ; Mlle ; cher », qui atteste l'emploi devant le nom d'une
personne.** » Les trois clauses suivent les trois numéros : l'emploi devant un
nom est rattaché par `u02-l2d` à la ligne **38548**, pas à 38546.

Or 11B lit 38548 comme `pr. pers. (DOP)`, FRA « vous ». Il y a donc une
**divergence réelle entre les deux leçons sur le contenu de la ligne 38548**,
et l'item 5 la déplace sur un numéro où elle n'existe pas.

L'explication `.ods` ne tient pas non plus :

- `u02-l2b`, même unité, cite explicitement `VOLUBILIS Database.xlsx` et ses
  lignes 90790 et 90788, que 11B reprend à l'identique ;
- les autres numéros de `u02-l2d` coïncident avec le `.xlsx` : 28944 pour คะ
  (identique au relevé `.xlsx` de `unite-02/verification-volubilis.md`),
  72679-72681 pour ผม et 11050-11051 pour ดิฉัน (11B les reprend tels quels) ;
- l'amendement v1.3 de `CONVENTIONS.md` date la dette `.ods` des **unités 4
  à 7**, pas de l'unité 2.

Le fait enseigné survit : l'emploi de คุณ devant un nom est porté par le RID
sens (๓) et par la 8e définition nominale d'en.wiktionary, tous deux vérifiés à
la source ce jour. C'est la citation interne qui est fausse.

**Pourquoi c'est bloquant** : référence mal citée et divergence de relevé
masquée, sur la source dont le dossier fait par ailleurs un usage central.

---

### P2-F7. NON BLOQUANT. Deux planchers d'exercice ne résistent pas au contrôle : l'intrus toujours en dernière position à l'exercice 3, et le seuil de l'exercice 1 sous l'hypothèse de corrélation que le dossier demande lui-même de tester

#### 7a. Exercice 3 : l'intrus est la DERNIÈRE tuile aux quatre tirages

Tirages publiés, intrus en gras :

1. `[ไหม] [คะ] [สบายดี] [**ครับ**]`
2. `[ครับ] [สบายดี] [**ค่ะ**]`
3. `[ค่ะ] [สบายดี] [**ครับ**]`
4. `[ครับ] [ไหม] [สบายดี] [พี่ต้น] [**คะ**]`

Quatre fois sur quatre, l'intrus est en dernière position. L'exercice 4 exige
explicitement que « l'ordre des trois cartes [soit] retiré au hasard à chaque
tirage » ; **l'exercice 3 n'exige rien de tel pour ses tuiles** (« ordre
aléatoire » y porte sur l'ordre des tirages).

L'heuristique aveugle « retirer toujours la dernière tuile » retire donc le bon
élément 4 fois sur 4 ; il reste à ordonner, ce qui donne une espérance de
1/6 + 1/2 + 1/2 + 1/24 ≈ **1,21 tirage sur 4**, contre les « **0,54 tirage sur
4** » que le dossier annonce comme « **meilleure** heuristique aveugle ». Le
seuil de 3 sur 4 tient encore (P ≈ 4,5 %), donc l'exercice n'est pas
réussissable sans connaissance, mais la phrase « meilleure heuristique
aveugle » est fausse et le plancher est sous-évalué de plus du double.

**Correction attendue** : exiger la randomisation de l'ordre des tuiles comme
le fait l'exercice 4, ou varier la position de l'intrus, et recalculer le
plancher avec cette heuristique.

#### 7b. Exercice 1 : sous corrélation, le seuil de 11 sur 12 devient un pile ou face

Le dossier demande explicitement de refaire ce calcul : « Le calcul de 9 sur
256 suppose une indépendance entre tirages qu'un apprenant réel n'a pas : s'il
se trompe sur ค่ะ, il se trompera sur les quatre. Un auditeur doit refaire ce
calcul avec une hypothèse de corrélation et dire si le seuil tient. »

Refait. Les huit tirages porteurs d'une particule ne présentent que **deux
indices distincts** : ครับ aux tirages 1 à 4, ค่ะ ou คะ aux tirages 5 à 8. Un
apprenant qui sait qu'une particule marque le locuteur mais ignore laquelle va
à qui n'a donc pas huit décisions à prendre, il en a **une seule** : quel
indice va à quel sexe. Sous corrélation totale, les deux issues sont :

- mapping correct : 8 tirages à particule justes + 4 tirages nus justes =
  **12 sur 12**, seuil franchi ;
- mapping inversé : 0 + 4 = **4 sur 12**, seuil manqué.

À une chance sur deux, donc **P(≥ 11 sur 12) = 50 %**, contre les 3,5 % que le
dossier annonce sous indépendance. **Le seuil ne tient pas sous l'hypothèse que
le dossier demande de tester**, et il tient d'autant moins que l'exercice donne
un feedback après chaque tirage, ce qui permet de corriger le mapping dès la
première erreur.

Ce n'est pas une réponse constante au sens strict, donc ce n'est pas classé
bloquant, mais la justification arithmétique du seuil est fausse dès qu'on
sort de l'hypothèse d'indépendance, et c'est le dossier lui-même qui désigne
cette hypothèse comme irréaliste.

**Correction attendue** : varier l'indice à l'intérieur des tirages féminins de
manière à ce que le mapping ne soit pas une décision unique (par exemple en
faisant dépendre deux tirages du partage ค่ะ / คะ), ou assumer que l'exercice
mesure une décision binaire et le dire, ou remplacer le seuil par une exigence
de deux sessions espacées comme le font les cartes SRS.

---

### P2-F8. NON BLOQUANT. Dialogue, panneau B : `พี่ต้น` est montré dans le seul contexte de la leçon où la condition enseignée n'est pas établie

Le critère enseigné est l'âge relatif **au locuteur** (page 5 ; et
`srs-u06-l6b-02`, relue : « dire si la personne est née avant ou après le
locuteur »). Les exercices sont méticuleux : « dont il sait **seulement qu'il
est plus âgé que lui** » (ex. 3, tirage 4), « plus âgé que lui » et « plus âgé
qu'elle » (ex. 4, tirages 11 et 12).

Le titre du panneau B dit seulement : « chez Nok, qui présente **son** frère
aîné ». Cela établit que Ton est l'aîné **de Nok**. Rien n'établit qu'il soit
plus âgé que Paul, qui l'appelle pourtant `พี่ต้น` à la ligne 7. L'unique
écran où la forme est mise en situation est donc celui où l'apprenant ne peut
pas dériver sa licéité par la règle qu'on vient de lui enseigner.

**Correction attendue** : une incise dans le titre du panneau ou dans la
remarque « Un », du type « Ton est plus âgé que Paul », qui coûte cinq mots.

---

### P2-F9. NON BLOQUANT. Les quatre apports de tirages SRS changent la mécanique des cartes visées, alors que le texte écrit « sans les modifier »

Les quatre cartes ont été relues dans leur leçon d'origine.

- `srs-u01-l1e-04` : « choisir la **bonne particule** pour 2 locuteurs
  nouveaux ». Sa réponse est une particule. 11B veut y verser des tirages dont
  la réponse est « la phrase ne le dit pas », c'est-à-dire une question
  inverse. 11B décrit d'ailleurs la carte comme « une carte où toute question a
  un sexe pour réponse », ce que son critère ne dit pas.
- `srs-u02-l2b-03` et `srs-u04-l4a-06` : cartes **à l'écoute**. 11B veut y
  verser des tirages **en écriture de la transcription**, et l'écrit lui-même :
  « ce qu'aucune des trois cartes ne fait aujourd'hui ».
- `srs-u07-l7a-03` : bâtie sur quatre **paires minimales** (ทาน/ถ่าน, อาน/อ่าน,
  ปา/ป่า, ปี/ปี่). `คุณ` contre la syllabe `sà` de สบายดี n'est pas une paire
  minimale.

Chacun de ces apports est une modification de carte, pas un apport de tirage.
La formule « 11B leur apporte des tirages … **sans les modifier** » est donc
inexacte pour les quatre.

---

### P2-F10. NON BLOQUANT. Deux sections du dossier décrivent un état du fichier qui n'existe plus, et les deux correspondent à des findings de la passe 1 corrigés à moitié

1. « Ce que le contre-audit doit attaquer », point 4 : « Le champ `registre`
   des items 3 et 4, **mis à « neutre »** là où l'intuition dirait « poli ». »
   Les items 3 et 4 portent « **non déterminé par les sources** », et le
   dossier explique lui-même (l.1655-1663) avoir retiré le « neutre ». C'est le
   reliquat de F5 (passe 1).
2. **Arbitrage 1** : « **revendiqué comme graphie par `lecon-11d.md`** … Deux
   leçons ne peuvent pas le publier. L'arbitrage appartient à la
   consolidation. » La Méta (l.104-110) démontre le contraire, et la
   vérification directe de `lecon-11d.md` ligne 360 lui donne raison : 11d
   attribue `แล้วคุณล่ะ` à `u06-l6e` item 2, exactement comme 11B. Il n'y a
   aucun arbitrage à porter. C'est le reliquat de F9 (passe 1).

Dans les deux cas la correction a été portée à l'endroit nommé par l'auditeur
et pas à l'autre occurrence du même défaut.

---

### P2-F11. NON BLOQUANT. La réserve la plus lourde du dossier est renvoyée à une incertitude qui n'existe pas et à un arbitrage sans rapport

La « Réserve résiduelle » de la partie 1 (l.1850-1860) est le seul endroit qui
consigne que, VOLUBILIS étant récusé, la valeur **polie** de ค่ะ et de คะ ne
repose plus que sur le RID et sur une corroboration dont le `DOM` porte `RID`
(en.wiktionary, vérifié ce jour, n'emploie le mot `polite` pour aucune des
deux). Elle renvoie ce point « à **l'incertitude 9** et à l'arbitrage 5 ».

- Le fichier ne porte que **huit** incertitudes. L'incertitude 9 n'existe pas.
- L'arbitrage 5 porte sur `volubilis-codes.mjs` qui ne lit pas le `.xlsx` :
  aucun rapport.

Deux autres renvois sont mal aiguillés de la même façon : l.1719 et l.1797
présentent l'**arbitrage 6** comme portant sur le versement du classeur au
dépôt, alors qu'il ne porte que sur l'URL de téléchargement en 404 (vérifiée :
l'en-tête de `volubilis-lookup.mjs` documente toujours
`master.dl.sourceforge.net/project/belisan-volubilis/…`, tandis que l'adresse
qui répond, celle que cite `u02-l2b`, est
`sourceforge.net/projects/belisan/files/VOLUBILIS%20Database.xlsx/download`).

Conséquence pratique : la seule réserve sur le fait le plus lourd de la leçon
n'est enregistrée nulle part où une consolidation irait la chercher.

---

### P2-F12. NON BLOQUANT. L'inventaire audio est faux et incomplet, et il omet deux dispositifs qui exigent de l'audio

« Les **vingt-deux** blocs sonores nécessaires sont listés implicitement par
les exercices 1 et 4 et par le dialogue. »

- Recompté : les exercices 1 et 4 et le dialogue donnent **23** blocs distincts
  (12 à l'exercice 1, 7 formes neuves à l'exercice 4, 4 énoncés neufs au
  dialogue), pas 22.
- L'**exercice 5** exige de l'audio : « Vous n'entendrez le mot qu'après avoir
  répondu », soit dix formes isolées. Il n'est pas compté.
- **`srs-u11-l11b-02`** exige de l'audio : « en reconnaissance **à l'écoute** et
  à la lecture … la carte présentant à chaque fois พ่อ et แม่ seuls comme
  distracteurs », soit quatre formes. Il n'est pas compté non plus.

Le besoin réel est d'au moins 33 blocs. Une feuille de session bâtie sur 22
serait incomplète dès le premier enregistrement.

Point voisin, consigné sans finding séparé : l'exercice 5 écrit « le registre
est mesuré par les exercices 2, 3 et 4 », alors qu'aucun des trois ne mesure un
registre (ils mesurent un critère de désignation et un choix de particule par
le sexe du locuteur), et que les items 1 et 2 écrivent au contraire « Aucun
écran et aucun exercice de cette leçon ne mesure ni n'affiche le registre ».

## P2.3 Points attaqués sans succès, consignés pour ne pas être réattaqués

- **Les quatre compositions de la partie 5**, que le dossier désigne lui-même
  comme la cible prioritaire. Chaque patron a été vérifié dans la leçon qui le
  publie : `u06-l6c` item 6 est bien `เขาสูงไหม`, son item 7 est bien
  `คุณใจดีมาก`, son item 8 est bien `เขาชื่ออะไร`, `u02-l2d` item 5 est bien
  `ชื่อ` avec sa collocation. La déclaration est complète et honnête ; le
  cumul de deux patrons dans `พี่ต้นสบายดีไหมครับ` reste non attesté, mais il
  est remonté comme tel à l'incertitude 4. Rien à reprocher au dossier ici.
- **Le refus d'enseigner พี่ seul.** L'argument de registre tient : vérifié à
  la source, en.wiktionary n'ouvre aucune section `Pronoun` pour พี่, le RID
  n'en parle pas, et VOLUBILIS est la seule à poser `(inf.)`. Une seule jambe
  de registre, refus fondé.
- **La note culturelle.** Aucune phrase n'y suggère d'étymologie ; le sens de
  valeur est bien celui que le RID donne en (๑) et (๒), vérifié à la source
  (`ความดีที่มีประจำอยู่ในสิ่งนั้น ๆ`, puis `ความเกื้อกูล`). Réserve mineure,
  sans finding : le contrôle d'indépendance `DOM ≠ RID` que le dossier applique
  aux quatre items neufs n'a pas été fait sur les lignes VOLUBILIS 38543-38545
  qui portent la seconde jambe de cette note. Le fait reste vrai et une seconde
  jambe indépendante existe de toute façon (en.wiktionary donne « excellence;
  goodness », « morality; virtue », « benefit; interest; use » à คุณ).
- **La décodabilité du dialogue et des tirages**, priorité 2 de la consigne :
  toutes les chaînes affichées ont été décomposées et rattachées à un item du
  jour, à un des seize blocs du tableau ou à une composition déclarée à la
  partie 5. **Aucun mot hors périmètre.** Le tableau des seize blocs est
  complet et chacune de ses attributions a été vérifiée dans la leçon citée.
- **Les affirmations de registre et d'usage social**, priorité 3 : après le
  retrait opéré à la passe 1, aucune règle sociale inventée ne subsiste. Les
  pages 4, 5, 6, 7 et 10 énoncent des critères de source, jamais des
  convenances. La seule affirmation de langue non sourcée trouvée est celle de
  P2-F4, qui n'est pas une règle sociale mais un fait de grammaire.

Deux imprécisions trop mineures pour un finding, consignées pour la
consolidation : la page 2 attribue à « la page 2 » de `u02-l2b` une phrase qui
se trouve en réalité dans le `note_fr` de son item 2 ; et l'objectif 2 de la
Méta parle des « **cinq** mots de désignation du jour » là où les pages 4, 5 et
9 n'en reconnaissent que **trois**, คุณพ่อ et คุณแม่ étant explicitement rangés
hors des mots d'adresse par la page 9.

## P2.4 État après la passe 2

- Findings bloquants ouverts : **6** (P2-F1 à P2-F6).
- Findings non bloquants ouverts : **6** (P2-F7 à P2-F12).
- **Quatre des douze findings de la passe 1 sont à moitié résolus** : F4 →
  P2-F1, F5 → P2-F10.1, F9 → P2-F10.2, F12 → P2-F5. Les huit autres sont
  correctement résolus, contrôle refait à la source pour chacun.
- Statut de la leçon : reste `draft`. Revue native : en attente.
- Recommandation de méthode pour la résolution : **ne pas corriger à l'endroit
  cité par l'auditeur, mais chercher toutes les occurrences du même énoncé dans
  le fichier**. Les quatre demi-résolutions viennent toutes du même geste.
