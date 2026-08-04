# Contre-audit adversarial de `lecon-10b.md`

- Fichier audité : `content/authoring/unite-10/lecon-10b.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial indépendant, consigne « trouver des erreurs, pas
  confirmer »
- Méthode : re-exécution de tous les scripts versionnés cités par le dossier,
  plus deux outils de travail écrits pour l'occasion (index de collision,
  balayage des écrans d'apprenant), plus relecture champ par champ des items
  publiés dont 10B se réclame.
- Verdict : **7 findings bloquants, 5 non bloquants. Le fichier ne peut pas
  passer en `review`.**

Avertissement de méthode, à lire avant les findings : `lecon-10e.md` a été
modifié DEUX fois pendant cet audit (06:27 puis 06:33). Une partie des chiffres
de coordination de 10B était vraie au moment de sa rédaction et ne l'est plus.
Le finding 3 le dit en ces termes plutôt que d'accuser 10B d'avoir inventé.

## Ce qui est réellement bon dans ce fichier

Il faut le dire avant d'attaquer, parce que cela change ce que le consolidateur
doit relire. **Le travail de sources de ce fichier est le meilleur que j'aie
re-vérifié.** Les 16 relevés RID et les 14 relevés VOLUBILIS ont tous été
reproduits à l'identique, y compris les numéros de ligne, les étiquettes de
type, les gloses françaises et les listes de sens explicitement écartés. Les
10 faits Unicode sont exacts au caractère près, empreintes SHA-256 comprises.
Aucune référence n'est inventée. Aucun ton, aucune longueur, aucune IPA, aucune
transcription des huit items n'est fausse. Aucun corrigé d'exercice n'est faux.

Les findings ci-dessous ne portent donc pas sur la matière linguistique. Ils
portent sur ce que la leçon PRÉTEND que l'apprenant peut déduire, sur des
chiffres présentés comme mesurés qui ne le sont pas, et sur une affirmation
d'affichage que le fichier s'interdit explicitement ailleurs.

## Findings bloquants

### F1. BLOQUANT. `เข้า` est traité comme une syllabe vivante et son ton comme déductible, alors que le parcours met explicitement cette forme hors du tableau

C'est le finding le plus lourd, et il touche un écran d'apprenant.

La page 6 dit à l'apprenant, sous le titre « ce que vous lisez tout seul
aujourd'hui » :

> เข้า : ข haute, syllabe vivante, ไม้โท → ton DESCENDANT

L'item 3 le répète (« Les deux tons se déduisent : ... ข haute et vivante avec
un ไม้โท donne descendant »), l'item 8 aussi (« les deux syllabes sont vivantes,
les deux portent un ไม้โท »), et la page 11 en fait un argument (« la même règle
appliquée deux fois dans un seul mot »).

**Or `เข้า` s'écrit avec สระเอา, et le parcours a rangé cette forme hors du
domaine de la règle de ton, quatre fois, en toutes lettres.**

- `u04-l4a` page 6 définit la syllabe vivante couverte comme celle qui « se
  termine sur une voyelle LONGUE, ou sur ง, น, ม, ย ou ว ». `เข้า` ne remplit
  ni l'une ni l'autre condition : `u01-l1b` la publie `longueur : courte`.
- `u04-l4a` page 8, vérifiée mot pour mot : « la règle ne couvre pas toutes les
  formes de syllabe. Celles qui se terminent sur un k, un t ou un p, **et celles
  qui s'écrivent avec ไ, ใ, เ-า ou -ำ**, comme ไก่ et ไข่, sont d'autres cas ;
  ne cherchez pas à les trancher aujourd'hui. »
- `u07-l7a` NOMME `เข้า` parmi les exclusions, deux fois : à sa Méta (« les
  formes de syllabe que 4A avait déjà mises de côté, ไ, ใ, เ◌า et ◌ำ, donc ไก่,
  ไข่, ไม่, ไม้, เก้า, **เข้า** et น้ำ ») et à sa page qui liste les quatre
  familles restées dehors.
- `u08-l8a`, la leçon même dont 10B invoque le tableau, publie à son item
  กระเป๋า : « pǎo **non enseignée**, la seconde syllabe étant une forme en เ◌า,
  **hors du périmètre du tableau depuis 4A** ».

**Et cette erreur exacte a déjà été trouvée et corrigée dans ce dépôt.** Le
finding F6 de `u07-l7c` a fait retirer la cellule `Syllabe = vivante` de เช้า,
avec ce motif : « Affirmer `vivante` ici aurait donc tranché devant l'auteur ce
que le parcours a explicitement différé devant l'apprenant. » 10B rouvre le même
trou, sur un mot qui figure nommément dans la liste d'exclusion de 7A.

Conséquences en chaîne, toutes à corriger ensemble :

1. La page 6 demande à l'apprenant un calcul que le parcours lui a interdit de
   tenter. Le résultat annoncé (descendant) est juste, mais le chemin ne l'est
   pas, et c'est le chemin que la leçon enseigne.
2. Le tableau du dossier « Tons déductibles : 7 syllabes sur 11 » est faux.
   Recompté syllabe par syllabe contre le périmètre réel de `u08-l8a` :
   déductibles = `thaang` (×3, dans ทาง, ทางเข้า, ทางออก) et `hâam` (×2, dans
   ห้าม, ห้ามเข้า), soit **5 sur 11**. Donnés = `àwwk` (×2), `pòeet`, `pìt` et
   `khâo` (×2), soit **6 sur 11**.
3. La ligne « Tons déductibles » du tableau des audits (« 7 syllabes sur 11 »)
   est donc fausse elle aussi.
4. L'arbitrage 1, qui chiffre le coût du manque à « 4 syllabes sur 11 », le
   sous-estime : le vrai coût est 6 sur 11, c'est-à-dire la MAJORITÉ des
   syllabes de la leçon. L'argument de l'arbitrage en sort renforcé, pas
   affaibli, mais il doit être rechiffré avant d'être porté.

Correction attendue : soit retirer `เข้า` de la page 6 et des notes d'items en
renvoyant à la limite de 4A comme `u07-l7c` l'a fait, soit faire ouvrir la forme
เ◌า par une leçon avant celle-ci. 10B ne peut pas trancher seule, exactement
comme pour les syllabes mortes.

### F2. BLOQUANT. La leçon affirme où ces mots sont écrits, sans source, dans le fichier même qui déclare ne jamais le faire

Le dossier écrit, section « Ce que la leçon N'AFFIRME PAS sur l'affichage » :

> Ce qu'elle n'affirme nulle part : **où ces mots sont écrits**, à quelle
> fréquence, sous quelle forme typographique [...]

Et la page 14 le dit à l'apprenant : « Nous ne vous avons rien dit de l'endroit
où ils sont écrits ».

**Les deux énoncés sont faux, et c'est vérifiable dans le fichier.** Page 8,
écran d'apprenant :

> เปิด veut dire ouvrir, et **sur une porte, ouvert**. ปิด veut dire fermer, et
> **sur une porte, fermé**.

Note culturelle, écran d'apprenant :

> **Le mot que vous lirez sur une porte** est donc aussi celui qu'on emploie
> pour dire qu'on a trouvé comment s'en sortir.

Et les items 5 et 6 justifient leur second sens par le même fait non sourcé :
« c'est cette ligne qui soutient la traduction **affichée sur une porte** ».

La ligne VOLUBILIS 77225 (adj. « ouvert ») et la ligne 75958 (adj. « fermé »)
établissent l'emploi ADJECTIVAL. Elles n'établissent rien sur les portes.
Aucune source du dossier ne porte sur le support d'affichage.

Deux aggravations :

- **Le balayage est calibré pour manquer exactement ce cas.** Les cinq formules
  comptées sont `partout`, `on voit partout`, `sur tous les`, `toujours écrit`
  et `en Thaïlande`. J'ai reproduit le balayage : les cinq rendent bien 0. Mais
  `sur une porte` rend 3 occurrences et `sur les panneaux` figure aussi, hors
  contexte de dénégation. Un contrôle qui ne cherche que les formules qu'on n'a
  pas écrites n'est pas un contrôle.
- **C'est le motif même pour lequel la leçon écarte deux autres mots.** Section
  « Mots vérifiés puis écartés » : « le projet n'a aucune source sur ce qui est
  écrit sur une porte en Thaïlande. Les enseigner sous l'étiquette _ce qu'on lit
  sur les portes_ aurait été exactement l'affirmation que le brief interdit. »
  La leçon applique donc à ผลัก et ดึง un critère qu'elle enfreint pour เปิด et
  ปิด, dans la même page.

Correction attendue : retirer « sur une porte » des pages 8 et 14 et de la note
culturelle, ou produire une source recevable sur l'affichage, ou reformuler en
observation vérifiable par l'apprenant conformément à la section 1 bis de la
politique de sources.

### F3. BLOQUANT. Le relevé de collision de l'unité 10 ne se reproduit pas, et l'inférence qui le fonde est invalide

Deux problèmes distincts, sur le même relevé.

**a) Les chiffres cités ne se reproduisent pas.** La Méta et la section des
contrôles annoncent : « `repo-thai-scan.mjs 10 10` rend **5 fichiers, 34 entrées
et 31 graphies distinctes** ». Exécution de ma part, plusieurs fois :

```
fichiers lecon-*.md : 5
entrées (thai + ton) : 32
graphies distinctes  : 31
```

Mon index indépendant (même convention d'entrée que `repo-thai-scan.mjs`, un
bloc portant à la fois `thai` et `ton`, mais graphie vers TOUS ses fichiers)
rend 32 entrées, 31 graphies et **une seule collision, ราคา entre `lecon-10c.md`
et `lecon-10d.md`**. `lecon-10e.md` contribue **zéro entrée** : sa section
`## Items` est vide, ses items sont sous `## Spécimens construits`, que la
convention de comptage ne balaye pas.

Honnêteté sur l'origine : j'ai obtenu 34 entrées à mon PREMIER passage, à 06:2x,
puis 32 après. `lecon-10e.md` a été réécrit à 06:27 puis à 06:33, pendant cet
audit. Le relevé de 10B était donc vrai quand il a été fait. Il ne l'est plus.

Conséquence à porter à la consolidation, pas à la charge de 10B : **la collision
เปิด / ปิด avec `lecon-10e.md` n'existe plus dans le dépôt**. Tombent avec elle
la mention « DEUX collisions à l'intérieur de l'unité 10 » de la Méta, le
« risque de doublon signalé » de la carte `srs-u10-l10b-02`, et l'arbitrage 8
en entier. Le fichier ne peut pas passer en `review` en portant un arbitrage
sans objet.

**b) L'inférence est invalide même sur ses propres chiffres.** Le fichier
écrit : « 34 moins 31 fait 3, et ce sont bien trois collisions ». La différence
entre le nombre d'entrées et le nombre de graphies distinctes compte des
DOUBLONS D'ENTRÉE, pas des graphies en collision : une graphie publiée quatre
fois pèse 3 dans cette différence et ne fait qu'UNE collision. Le contrôle est
présenté comme une preuve alors qu'il ne peut pas distinguer ces deux cas, et
c'est précisément pour cela que l'arbitrage 9 du même fichier demande un mode
`--collisions`. La demande est bonne ; la phrase qui la précède ne l'est pas.

### F4. BLOQUANT. Le plancher « option la plus longue » de l'exercice 1 est faux d'un facteur trois

Le dossier annonce : « **Planchers mesurés, trois stratégies sans lecture ayant
été calculées plutôt qu'estimées** », puis : « La stratégie _prendre l'option la
plus longue_ plafonne à **1 sur 12**, l'option _le chemin, la voie_ étant la
plus longue du jeu et n'étant correcte qu'au tirage 1. »

J'ai refait le calcul sur les douze jeux d'options écrits dans le fichier.

- « le chemin, la voie » fait 18 caractères. « il est interdit de » en fait 18
  aussi. **Il n'y a donc pas d'option la plus longue du jeu, il y a une
  égalité**, et le raisonnement s'effondre dès l'énoncé.
- Tirage 8, options : « entrée interdite » (16), « fermé » (5), « l'entrée »
  (9), « il est interdit de » (18) ✔. La plus longue EST la bonne réponse.
- Tirage 10, options : « la pièce » (9), « les toilettes » (13) ✔, « l'eau »
  (6), « l'entrée » (9). La plus longue EST la bonne réponse.
- Tirage 1 : la plus longue est la bonne réponse, comme le dossier le dit.

La stratégie plafonne donc à **3 sur 12**, pas à 1 sur 12. Le comptage par mots
au lieu de caractères donne le même résultat, l'égalité étant à quatre mots des
deux côtés.

L'exercice n'est pas cassé : 3 sur 12 reste très en dessous du seuil, qui est
de 10 sur 12. Mais le fichier présente ce chiffre comme mesuré, et c'est le
défaut que les
findings `BALAYAGE-INVENTE` et `COMPTE-LETTRES` de `u09-l9a` ont sanctionné.
Un plancher faux dans un dossier qui se réclame de planchers calculés doit être
corrigé avant `review`.

Corollaire à corriger en même temps, exercice 4 : « ห้าม [...] portant _il est
interdit de_, **qui est le sens le plus long** ». Même égalité à 18 caractères
avec « le chemin, la voie ». La stratégie « plus long vers plus long » n'est
donc pas cassée aussi nettement que le dossier l'affirme.

### F5. BLOQUANT. « Six des douze tirages sont des composés » : il y en a quatre, et le fichier le dit ailleurs

Exercice 1, description de ce qu'il mesure :

> **Six** des douze tirages sont des composés, et chacun de ces six voit figurer
> parmi ses distracteurs le sens d'un de ses propres blocs

Les douze tirages sont ทาง, ทางเข้า, ทางออก, ออก, เข้า, เปิด, ปิด, ห้าม,
ห้ามเข้า, ห้องน้ำ, ห้อง, น้ำ. Les composés sont ทางเข้า, ทางออก, ห้ามเข้า et
ห้องน้ำ : **quatre**, tirages 2, 3, 9 et 10.

Le même exercice se contredit deux lignes plus bas : « Feedback correct, tirages
**2, 3, 9 et 10** » et « l'erreur attendue sur les tirages **2, 3, 9 et 10** ».
Le fichier connaît donc le bon chiffre et en écrit un autre en tête.

Vérifié au passage, et bon : la propriété de conception annoncée tient pour les
quatre composés. Chacun a bien parmi ses distracteurs le sens d'au moins un de
ses blocs (ทางเข้า a « entrer » et « le chemin, la voie » ; ทางออก a « sortir »
et « le chemin, la voie » ; ห้ามเข้า a « il est interdit de » et « entrer » ;
ห้องน้ำ a « la pièce » et « l'eau »). Seul le compte est faux.

### F6. BLOQUANT. L'item 8 affirme être « le seul mot du jour dont les DEUX tons se déduisent », ce que l'item 3 et le tableau du dossier contredisent

`note_fr` de l'item 8 (ห้ามเข้า) :

> le **seul** mot du jour dont les DEUX tons se déduisent

`note_fr` de l'item 3 (ทางเข้า) :

> **Les deux tons se déduisent** : ท basse et vivante sans marque donne moyen,
> ข haute et vivante avec un ไม้โท donne descendant.

Et le tableau du dossier donne ทางเข้า : 2 syllabes, **2 tons déductibles**,
0 tons donnés. Trois endroits du fichier, deux réponses incompatibles.

Note d'articulation avec F1 : une fois F1 corrigé, la phrase de l'item 8 devient
fausse dans l'autre sens, puisque ni ทางเข้า ni ห้ามเข้า n'auront leurs deux
tons déductibles. Les deux findings doivent être corrigés d'un seul geste, pas
l'un après l'autre.

### F7. BLOQUANT. L'item 7 énonce la règle du ห muet autrement que la leçon qui la publie, et l'énoncé est faux

`note_fr` de l'item 7 (ห้าม) :

> Ce n'est pas le ห muet de หมา, qui n'apparaît que lorsqu'**une lettre basse**
> est collée juste derrière lui.

La règle publiée par `u05-l5a`, pages 5 et 12, relue mot pour mot :

> le ห se tait quand une des lettres **ง, น, ม, ย, ว ou ร** est collée juste
> derrière lui, **sans le moindre signe posé sur le ห**.

Deux écarts, tous deux dans le sens de la fausseté :

1. « une lettre basse » sur-généralise. Le RID, à son entrée « ห » que j'ai
   relevée, dit `ใช้นำอักษรตํ่าเดี่ยว`, c'est-à-dire une consonne basse
   **isolée**, pas l'une quelconque des vingt-quatre basses. Un apprenant qui
   applique la formule de 10B attendra un ห muet devant ค, ช, ท, พ ou ฟ, qui
   sont des lettres basses qu'il a apprises en 5A.
2. La condition « sans aucun signe posé sur le ห » disparaît. Cette condition
   n'est pas décorative : `u05-l5a` l'a ajoutée à sa consolidation, findings
   B3 et B5, parce que sans elle le repère échouait sur หิว.

C'est un réemploi divergent d'une règle publiée, dans un champ d'item, sur un
point que la leçon d'origine avait déjà dû corriger.

## Findings non bloquants

### F8. Le décompte RID « 26 graphies interrogées, 22 attestées, 4 absentes » contredit le fichier lui-même

Le dossier présente ce décompte comme « recomputable depuis les cinq listes
ci-dessous, dont la somme fait le total ». L'arithmétique des cinq listes est
juste : 6 + 1 + 7 + 8 + 4 = 26, et 22 attestées. Mais la section « Mots vérifiés
puis écartés » du même fichier rapporte des résultats RID sur au moins cinq
graphies de plus, qui ne figurent dans aucune des cinq listes :

- `ห้ามสูบบุหรี่` et `สูบบุหรี่` : « `rid-lookup.mjs` rend `absent` » ;
- `ห้ามจอด` : « RID `absent` pour le bloc » ;
- `ผลัก` et `ดึง` : « les deux sont des vedettes du RID ».

Le vrai décompte est donc d'au moins 31 graphies interrogées, 24 attestées et
7 absentes. Le total présenté comme recomputable ne l'est pas.

### F9. La page 6 range `เข้า` parmi « quatre des huit mots du jour », alors que ce n'est pas un des huit

Les huit items sont ทาง, ออก, ทางเข้า, ทางออก, เปิด, ปิด, ห้าม et ห้ามเข้า.
La page 6 annonce « Quatre des huit mots du jour ont un ton que vous pouvez
calculer » puis liste ทาง, **เข้า**, ห้าม et ห้ามเข้า. `เข้า` est un réemploi
de `u01-l1b` que la leçon déclare elle-même ne pas republier. Et ทางเข้า, qui
EST un des huit et dont l'item 3 dit que les deux tons se déduisent, ne figure
pas dans la liste. À reprendre avec F1, dont c'est le même paragraphe.

### F10. La Méta attribue `ห้อง` à 7B, tout le reste du fichier à `u07-l7a`, et les deux leçons le publient avec des champs différents

Méta : « leçon 7B : ห้อง, la pièce, publié `hâwng` ». Exercice 1 tirage 11 :
« Item publié de `u07-l7a` ». Exercice 3 tirage 4, SRS et tableau des composés :
`u07-l7a`. Page 12 : « ห้อง, la pièce, apprise en 7B ».

Relevé de ma part : les DEUX leçons publient un item `ห้อง`, et leurs champs
divergent entre elles, `u07-l7a` donnant `longueur : courte` et `fr : la pièce,
la chambre`, `u07-l7b` donnant `longueur : brève, malgré la graphie ออ qui fait
attendre une voyelle longue` et `fr : la pièce ; la salle`. La transcription
`hâwng` est identique dans les deux, donc rien de ce que 10B affiche n'est faux.
C'est une dette de l'unité 7, pas de 10B, mais 10B doit choisir une attribution
et s'y tenir, sans quoi la carte SRS visée est ambiguë.

### F11. L'incertitude 5 invoque la mauvaise entrée du dictionnaire pour justifier son raisonnement

Le texte dit : « le RID [...] énonce une clause plus large, la lettre précédant
une consonne basse isolée sans se prononcer, et ญ tombe sous cette clause,
**l'entrée `อักษรต่ำ` du même dictionnaire la rangeant parmi les vingt-quatre
consonnes basses** ».

J'ai relevé les deux entrées. `อักษรต่ำ` liste bien vingt-quatre lettres dont ญ,
donc la citation est exacte. Mais elle ne démontre pas ce qu'on lui fait
démontrer : la clause de l'entrée « ห » porte sur les `อักษรต่ำเดี่ยว`, les
basses ISOLÉES, et appartenir aux vingt-quatre ne suffit pas à en faire partie.
La conclusion est juste, ญ étant bien une basse isolée, mais l'appui cité est
le mauvais. À reprendre en citant `อักษรต่ำเดี่ยว`.

### F12. Deux affirmations sur le thaï sans aucune source, dans les pièges de l'exercice 3

- « construire เข้าทาง au tirage 1, ordre inversé, **qui existe en thaï avec un
  tout autre sens** » : aucune source citée. Le fait est vrai, `เข้าทาง` figure
  dans la liste des ลูกคำ de « เข้า ๑ » que j'ai relevée, mais le fichier ne
  l'y rattache pas.
- « construire ห้ามออก au tirage 3 [...] **forme que la leçon n'enseigne pas et
  dont aucune source n'a été consultée** » : celle-ci est correctement déclarée,
  et elle montre que l'auteur connaissait la distinction. D'où l'écart avec la
  précédente.

Rattacher la première à la liste des ลูกคำ déjà citée à l'item 3 suffit.

## Ce que j'ai re-vérifié moi-même et confirmé

85 faits, tous recomputés à partir des scripts versionnés ou des fichiers
empreintés, aucun repris sur la foi du dossier.

### A. Royal Institute Dictionary 2554, 16 faits

`node scripts/verification/rid-entry.mjs` et `rid-lookup.mjs`, le 2026-08-04.

1. « ทาง ๑ » porte neuf sens nominaux.
2. Son sens (๑) est la voie et illustre par ทางเดินรถ, ทางเท้า, ทางข้าม et
   ทางแยก, entre autres.
3. Son sens (๒) est ช่อง et illustre par ทางประตู et ทางหน้าต่าง.
4. « ทาง ๒ » est bien la palme, `ก้านช่อใบ` de certains arbres.
5. La liste des ลูกคำ de « ทาง ๑ » compte **dix-sept** formes, décompte refait
   par moi ; elle porte ทางออก, ทางเท้า, ทางด่วน, ทางม้าลาย, ทางข้าม et
   ทางผ่าน, et **ne porte pas ทางเข้า**.
6. ออก a trois vedettes ; « ออก ๑ » est un titre de noblesse ancien, « ออก ๒ »
   est bien un rapace, Haliaeetus leucogaster.
7. « ออก ๓ » porte **seize** sens ; le (๑) est le mouvement vers l'extérieur,
   avec เลือดออก, แดดออก et รถออก.
8. Le sens (๑๑) de « ออก ๓ » est `ว. ตรงข้ามกับ เข้า` et son **unique** exemple
   est ทางออก.
9. Le sens (๗) de « เข้า ๑ » est `ว. ตรงข้ามกับ ออก` et ses deux exemples sont
   ทางเข้า **puis** ขาเข้า, dans cet ordre.
10. « ทางออก » est une vedette unique, étiquetée (สำ), glosée ทางรอด et
    วิธีแก้ปัญหา, donc FIGURÉE, avec ทาง ๑ pour แม่คำ.
11. « เปิด » est une vedette unique à trois sens ; le (๑) porte
    `ตรงข้ามกับ ปิด` et เปิดประตู ; le (๒) est l'inauguration avec เปิดร้านใหม่ ;
    le (๓) est étiqueté (ปาก) et vaut s'enfuir ; ลูกคำ porte เปิดเผย.
12. « ปิด » est une vedette unique à trois sens ; le (๑) porte ปิดฝาหม้อ et
    ปิดถนน ; le (๒) est ติด avec ปิดประกาศ ; le (๓) est `โดยปริยาย` et vaut
    l'arrêt, premier exemple โรงเรียนปิด ; ลูกคำ porte ปิดบัง.
13. « ห้าม » est une vedette unique à deux sens ; le (๒) est le nom ancien
    นางห้าม et หม่อมห้าม ; ลูกคำ porte ห้ามไม่ให้ et ห้ามเข้าเขตกำหนด.
14. « อ ๑ » donne la 43e consonne, ออ อ่าง, de classe MOYENNE, employée comme
    พยัญชนะต้น ET comme รูปสระ ออ, avec รอ et ปอ pour exemples ; « ห » donne la
    41e consonne, หอ หีบ, de classe HAUTE.
15. « ทางม้าลาย », « ม้าลาย » et « ทางเท้า » ont exactement les définitions et
    les แม่คำ que la note culturelle leur prête, y compris บาทวิถี comme
    synonyme de ทางเท้า et le genre Equus pour ม้าลาย.
16. `rid-lookup.mjs` rend `absent` pour ทางเข้า, ห้ามเข้า, ห้องน้ำชาย et
    ห้องน้ำหญิง, et `entree` pour ทางออก.

### B. VOLUBILIS, 14 faits

`node scripts/verification/volubilis-lookup.mjs`, plus une copie de travail au
plafond porté à 60 lignes pour lire au delà de la troncature.

17. L'exemplaire fait 10 848 409 octets, SHA-256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, et le
    relevé donne 114 579 lignes non vides et 586 541 chaînes partagées.
18. ทาง ligne 100079, ThaiRom `thāng`, ThaiPhon `-thāng`, n., FRA « chemin [m] ;
    route [f] ; voie [f] ; passage [m] ; sentier [m] » ; 100080 à 100082
    donnent direction, moyen et l'emploi prépositionnel.
19. ออก ligne 64631, `_øk`, v., FRA « sortir ; aller dehors ; s'éloigner ;
    quitter » ; 64632 à 64634 donnent partir, émettre et l'emploi adverbial.
20. ทางเข้า ligne 100188, `-thāng\khao`, n. exp., ENG « entrance ; entry »,
    FRA « entrée [f] », entrée UNIQUE pour cette graphie.
21. ทางออก lignes 100290 et 100291, sens séparés : « sortie [f] ; issue [f] »
    puis « solution [f] ».
22. เปิด lignes 77221 (v., « ouvrir ») et **77225** (adj., ENG « open ; on »,
    FRA « ouvert ») ; 77222 à 77224 donnent allumer, inaugurer, révéler.
23. ปิด compte bien **sept** lignes ; 75953 (v.), **75958** (adj., ENG
    « closed », FRA « fermé ; clos »), 75954 à 75957, et 110885 qui est bien
    l'accolade droite, sans rapport.
24. ห้าม ligne 14994, `\hām`, v., entrée UNIQUE.
25. ห้ามเข้า lignes 15020 (« défense d'entrer ; ... ; entrée interdite ») et
    15021 (« sens interdit », TRANSP auto code), correctement écartée.
26. ห้องน้ำ ligne 16245 ; ห้องน้ำชาย ligne 16247 FRA « toilettes hommes » ;
    **ห้องน้ำหญิง ABSENT**, ce qui valide le motif d'écartement du bloc genré.
27. ทางเท้า 100411, ทางด่วน 100138, ทางม้าลาย 100254, avec les gloses
    françaises exactes citées par la note culturelle.
28. ระวัง 82106 et 82107 ; ชาย 6494 ; หญิง 113139.
29. ห้ามสูบบุหรี่ 15045 ; ห้ามจอด 15016.
30. La troncature du script à cinq lignes est réelle : la sortie par défaut
    annonce « ปิด : 7 ligne(s) » et n'en affiche que cinq, masquant 75958. Le
    constat de l'arbitrage 4 est exact et l'arbitrage justifié.

### C. Unicode 17.0, 10 faits

31. `UnicodeData.txt` SHA-256 `2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c`.
32. `PropList.txt` SHA-256 `130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd`.
33. `IndicPositionalCategory.txt` SHA-256 `68cedc29a7e57f984d90fe2c7712f2e6d0c717e253db219607daea8997d6c480`, en-tête `IndicPositionalCategory-17.0.0.txt`.
34. `PropList.txt` ligne **1461** : `0E40..0E44 ; Logical_Order_Exception`.
35. `IndicPositionalCategory.txt` ligne **384** : `0E40..0E44 ; Visual_Order_Left`.
36. `0E49;THAI CHARACTER MAI THO;Mn;107;NSM` et `0E34;THAI CHARACTER SARA I;Mn;0;NSM` ; la plage `0E34..0E37` est bien `Top`.
37. Les huit séquences NFC d'items sont exactes et STABLES, recalculées depuis
    les champs `thai`.
38. Les sept graphies réemployées ou citées le sont aussi : เข้า, ห้องน้ำ, ห้อง,
    น้ำ, ม้า, ม้าลาย, ทางม้าลาย.
39. Retirer le premier code de เปิด rend une chaîne strictement égale à ปิด :
    contrôle exécuté, résultat `true`.
40. Le fichier entier est NFC-stable, contient **0** caractère de la zone à
    usage privé et **0** tiret cadratin ou demi-cadratin ; ทางเข้า fait 7 codes,
    ห้ามเข้า 8, โรงพยาบาล 9.

### D. Dépôt, réemplois et références internes, 33 faits

41. `repo-thai-scan.mjs --check-u07` passe, dix chiffres sur dix.
42. `repo-thai-scan.mjs 1 9` rend 45 fichiers, 429 entrées, 317 graphies,
    103 ไม้เอก, 76 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา.
43. Les huit graphies du jour rendent **0** sur les unités 1 à 9 : huit relevés,
    huit zéros, refaits un par un.
44. `item-fields-check.mjs` rend « champs codepoints en faute : 0 ».
45. Il rend aussi « écarts de réemploi à lire : 0 », et **la mise en garde du
    dossier est exacte** : aucun titre d'item du fichier ne porte de référence
    `uXX-lYz`, donc le script n'a comparé aucun champ. J'ai lu son code pour le
    confirmer. Le zéro ne prouve rien, et le fichier a raison de le dire.
46. `เข้า` publié par `u01-l1b` : `ipa /kʰaw˥˩/`, `ton descendant`,
    `longueur courte`, `transcription khâo`,
    `codepoints U+0E40 U+0E02 U+0E49 U+0E32`. Les quatre valeurs reprises par
    les items 3 et 8 de 10B sont **identiques**. Aucun réemploi divergent.
47. `ห้องน้ำ` publié par `u05-l5c`, `hâwng·náam`.
48. `ห้อง` publié par `u07-l7a`, `hâwng`.
49. `น้ำ` publié par `u02-l2c`, `náam`, ton haut.
50. `ม้า` publié par `u01-l1d`, `máa`, ton haut.
51. `ปา` `paa` et `ป่า` `pàa` publiés par `u01-l1c`.
52. `ครับ` `khráp` et `ค่ะ` `khâ` publiés par `u01-l1e`.
53. `อยู่` `yòuu`, `ที่ไหน` `thîi·nǎi`, `ที่นี่` `thîi·nîi`, `ที่นั่น`
    `thîi·nân` publiés par `u05-l5c`.
54. `ห้องน้ำอยู่ที่ไหนครับ` publié par `u05-l5c`, transcription
    `hâwng·náam yòuu thîi·nǎi khráp` : la reprise VERBATIM annoncée au dialogue
    et à l'exercice 3 est exacte, caractère pour caractère.
55. `อยู่ที่นี่` `yòuu thîi·nîi` publié par `u06-l6e`.
56. `ขอโทษครับ` publié par `u08-l8d`, `khǎww·thôot khráp`.
57. `ขอบคุณครับ` `khàwwp·khoun khráp`, `ไม่เป็นไร` `mâi·pen·rai` et `ขอ`
    `khǎww` publiés par `u02-l2c`.
58. `เธอ` `thoee` publié par `u06-l6a`.
59. `เงิน` publié par `u08-l8a`, `ngoen`, `longueur : courte`.
60. `เกินไป` publié par `u08-l8c`, `koeen·pai`, `longueur : koeen longue`. Le
    dépôt porte donc bien les DEUX longueurs pour le graphème เ◌ิ◌, ce qui
    confirme l'incertitude 2 au lieu de la contredire.
61. `มาก` publié par `u04-l4d` ; `กระเป๋า` par `u08-l8a` ; `โรค` et `แพทย์` par
    `u09-l9a` ; `ปัญหา` par `u08-l8d` ; `หมา` par `u01-l1d` ; `อะไร` par
    `u02-l2d` ; `สิบ` par `u03-l3b`.
62. `จิต` et `โรง` figurent bien dans `u09-l9a` comme spécimens de lecture des
    finales : les deux renvois de 10B sont fondés.
63. `u04-l4a` page 6 dit bien « เ, แ, โ, ใ et ไ sont des voyelles qui s'écrivent
    AVANT leur consonne », citation exacte.
64. `u05-l5a` publie bien les neuf consonnes basses ค ง ช ซ ท น พ ฟ ม, et les
    six lettres derrière lesquelles le ห se tait, ง น ม ย ว ร.
65. `u07-l7a` publie bien, textuellement, « consonne HAUTE + ไม้โท → ton
    DESCENDANT, comme ห้อง ».
66. `u08-l8a` page 11 est bien « le tableau entier, onze cases ».
67. L'incertitude 6 de `u09-l9a` demande bien un arbitrage « au niveau de
    l'unité 10 » sur le ton des syllabes fermées par une occlusive.
68. Les trois cartes citées existent : `srs-u07-l7a-03` (`u07-l7a`),
    `srs-u04-l4a-06` (`u04-l4a`), `srs-u09-l9a-01` (`u09-l9a`).
69. Les quatre précédents de l'ossature `[lieu] + อยู่ที่ไหน` existent :
    `ห้องน้ำอยู่ที่ไหนครับ` (`u05-l5c`), `ตลาดอยู่ที่ไหน` (`u05-l5e`),
    `พี่ชายอยู่ที่ไหน` (`u06-l6e`), `ร้านขายยาอยู่ที่ไหนครับ` (`u09-l9d`).
70. `แล้วเจอกัน` `láeew·joee·kan` publié par `u01-l1e`.
71. `u08-l8a` et `u09-l9a` ont bien signalé le recouvrement des cartes de ton
    sans qu'il soit tranché.
72. `u08-l8d` n'a bien rencontré ญ qu'en position non initiale, dans ปัญหา, en
    déclarant le mécanisme non enseigné.
73. Le fichier ne modifie aucun autre fichier du dépôt : `git status` ne montre
    que l'unité 10 comme non suivie, et aucune leçon des unités 1 à 9 n'a été
    touchée.

### E. Faits linguistiques propres aux huit items, 8 faits

74. Les huit graphies sont orthographiquement correctes et chacune est attestée
    par au moins deux sources de la politique.
75. Les huit tons sont exacts, contrôlés contre le RID, VOLUBILIS et la règle
    de classe : ทาง moyen ; ออก bas (moyenne + syllabe morte) ; ทางเข้า moyen
    puis descendant ; ทางออก moyen puis bas ; เปิด bas ; ปิด bas ; ห้าม
    descendant ; ห้ามเข้า descendant deux fois.
76. Les longueurs sont exactes : ออก longue (ออ), เปิด longue (/ɤː/), ปิด
    courte (◌ิ), ห้าม longue (า), `khâo` courte, `thaang` longue.
77. Les huit IPA sont conformes à la source Wiktionary citée et à la valeur de
    ton attendue.
78. Les huit transcriptions respectent `thainaute-fr` v1.1 : accent de ton sur
    la PREMIÈRE lettre du noyau, doublement de la DERNIÈRE lettre du graphème,
    `aww` pour /ɔː/, `oee` pour /ɤː/, `ao` pour la diphtongue.
79. Les trois décompositions de composés sont justes, bloc par bloc, et les
    quatre `litteral` sont fidèles.
80. Le registre `neutre` est tenable pour les huit : ni le RID ni VOLUBILIS ne
    posent d'étiquette de registre sur ces vedettes, et l'unique étiquette
    rencontrée, (ปาก) sur เปิด (๓), porte sur un sens que la leçon n'enseigne
    pas.
81. Aucun nom propre thaï, aucun prix, aucune enseigne, aucun nom de commerce,
    de rue ou de station ne figure dans le fichier, lecture intégrale faite.

### F. Exercices, 4 faits

82. Les corrigés sont justes dans les cinq exercices : douze réponses de
    l'exercice 1, six de l'exercice 3, huit paires de l'exercice 4, huit
    transcriptions de l'exercice 5, toutes conformes aux champs `fr` et
    `transcription` publiés, ici comme dans les leçons d'origine.
83. L'équilibrage annoncé est réel : exercice 1, trois bonnes réponses par
    place, vérifié tirage par tirage ; exercice 2, trois tirages par option et
    jamais deux fois de suite le même mot, vérifié sur la séquence écrite.
84. Les calculs de hasard sont exacts, refaits : exercice 1, une fois sur 26 592
    (annoncé « environ 26 500 ») ; exercice 2, une fois sur 315,1 pour la
    stratégie syllabique et une sur 453 432 au hasard pur (annoncé « moins d'une
    fois sur 400 000 ») ; exercice 3, 45/497 664 soit une fois sur 11 059 ;
    exercice 4, une sur 40 320 au hasard pur et une sur 72 sous regroupement.
85. Aucun exercice n'est réussissable par une réponse constante : les planchers
    réels sont 3/12, 3/12, structurellement nul, structurellement nul et 1/8,
    contre des seuils de 10/12, 11/12, 5/6, 8/8 et 6/8. **Le finding F4 ne
    remet pas cela en cause** : il porte sur un chiffre faux, pas sur une faille
    d'exercice.

## Ordre de correction recommandé

1. F1 et F9 ensemble, puis F6 qui en dépend. C'est un seul geste éditorial sur
   la page 6, les items 3 et 8, la page 11, le tableau des tons déductibles et
   l'arbitrage 1.
2. F2, retrait ou sourçage des trois « sur une porte », et élargissement du
   balayage à des formules de LIEU et pas seulement de fréquence.
3. F3, refaire le relevé de coordination sur l'état courant du dépôt, retirer
   l'arbitrage 8 et la mention de doublon de `srs-u10-l10b-02`, corriger la
   phrase « 34 moins 31 fait 3 ».
4. F7, réaligner l'item 7 sur la formulation publiée par `u05-l5a`.
5. F4, F5, F8, F10, F11, F12, corrections de chiffres et d'attributions.

Aucun de ces findings ne demande de refaire un relevé de source. C'est la
raison pour laquelle ce fichier est réparable en une passe.

- Statut recommandé : reste `draft`. Contre-audit interne : LANCÉ, ce document.
  Revue native : en attente.
