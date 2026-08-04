# Contre-audit adversarial de `u13-l13c`

- Fichier audité : `content/authoring/unite-13/lecon-13c.md`
- Date : 2026-08-04
- Auditeur : Claude Opus 5 (`claude-opus-5`), passe adversariale indépendante
- Consigne : chercher des erreurs, pas confirmer. Toute affirmation de registre
  relue moi-même dans le corps de l'entrée. Chaque chiffre du dossier recomputé
  avant d'être accepté ou rejeté.
- Résultat : **105 faits confirmés par relecture directe, 12 findings, dont 6
  bloquants.**

## 1. Ce que j'ai relu moi-même, et ce que cela donne

### 1.1 Les affirmations de registre, priorité absolue

Les six corps d'entrée qui portent la charge de la leçon ont été relus par
`node scripts/verification/rid-entry.mjs`, plus quatre contrôles et six
contrôles négatifs. **Aucune affirmation de registre de la leçon ne s'est
révélée fabriquée**, et l'absence d'étiquette qu'elle revendique est réelle.

| Graphie interrogée                         | Ce que le corps rend, relu par moi                                                                                                                                                   | Verdict                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| สิ                                         | aucune étiquette, aucune catégorie grammaticale ; `คำประกอบท้ายประโยค…` ; `โดยมากใช้กับกริยาเป็นเชิงบังคับ เชิงชวน หรือรับคำ` ; exemples `ไปสิ มาสิ` ; renvoi `ซิ ซิ่ หรือ ซี ก็ว่า` | conforme               |
| ล่ะ                                        | `ว.` seul, aucune étiquette ; `ประกอบข้อความข้างหน้าเพื่อยืนยันให้มีน้ำหนักขึ้น` ; exemples `มิน่าล่ะ`, `จะไปไหมล่ะ` ; `เล่า ก็ว่า`                                                  | conforme               |
| ซิ et ซี                                   | même vedette groupée « ซิ, ซิ่, ซี », définition identique à celle de สิ, renvoi `สิ ก็ว่า`, aucune étiquette                                                                        | conforme               |
| เล่า                                       | sens (๒) `ว.`, même définition, renvoi `ล่ะ ก็ว่า`                                                                                                                                   | conforme               |
| รู้                                        | `ก.`, glosé `แจ้ง, เข้าใจ, ทราบ`, aucune étiquette                                                                                                                                   | conforme               |
| หรอก                                       | `[หฺรอก] (ปาก) ว.`                                                                                                                                                                   | contrôle positif OK    |
| เว้า ๑                                     | `(ถิ่น-อีสาน) ก. พูด.`                                                                                                                                                               | contrôle positif OK    |
| โว้ย                                       | `ใช้ในลักษณะที่ไม่สุภาพหรือเป็นกันเอง`                                                                                                                                               | contrôle positif OK    |
| แหละ                                       | `[แหฺละ] ว.`, aucune étiquette                                                                                                                                                       | contrôle négatif OK    |
| จ๊ะ ๑                                      | `คำต่อท้ายคำเชิญชวนหลังคำ “นะ” หรือ “ซิ”`, exemples `ไปนะจ๊ะ`, `เชิญซิจ๊ะ`                                                                                                           | preuve d'ordre OK      |
| ไหนล่ะ                                     | vedette groupée « ไหน ๒, ไหนล่ะ, ไหนว่า, ไหนว่าจะ », `ว.`, question de tadphǭ / réclamation / doute                                                                                  | conforme, mais voir F6 |
| ไปสิ, เอาสิ, ไม่รู้สิ, นั่นสิ, ทำไมล่ะ, ดิ | aucune vedette                                                                                                                                                                       | conforme               |

Le piège de référence จ้า **n'est pas reproduit ici** : les deux graphies
enseignées rendent bien la particule finale que la leçon décrit, et non un
homographe. Le renvoi croisé สิ ↔ ซิ/ซิ่/ซี est réel dans les deux sens.

Trois contrôles supplémentaires que la leçon ne demandait pas :
en.wiktionary ne porte **aucune** étiquette de registre sur `สิ` ni sur `ซิ`
(pages relues en `action=render` et en `action=raw`), et la note d'usage
« Less formal than เล่า » de `ล่ะ` est bien la seule marque disponible, donc
bien une seconde jambe sans première. La section **Isan** de la page `ซิ`
existe et décrit un auxiliaire de futur apparenté au lao `ຊິ` : la leçon la
consigne sans rien en enseigner, ce qui est le traitement correct.

### 1.2 La frontière reconnaissance / production

Aucune forme mise en production par 13C ne porte d'étiquette qui la marque
impolie, intime ou régionale : les deux entrées n'ont aucune étiquette du tout.
La priorité 2 n'est donc pas déclenchée au sens strict. **Mais la leçon se
donne à elle-même une frontière plus stricte que ses sources et ne la tient
pas** : voir F9. Les formes en ซิ et ลองดูสิ, déclarées « à reconnaître
seulement » page 8, sont des réponses attendues de l'exercice 4 (`recall`).

### 1.3 Les réemplois du fondamental

`node scripts/verification/item-fields-check.mjs` rend **0 écart** et
`item-fields-fr-check.mjs` rend **2 écarts, tous deux sur l'item 3** (`fr` et
`registre`), exactement les deux divergences déclarées. Les 24 blocs de la
partie 6 ont été relus un par un dans leur fichier d'origine : **24 sur 24
concordent**, y compris `ดู` → `douu`, publié par `u01-l1b` item 10 dans une
syntaxe de champ sans accents graves que les scripts du dépôt n'indexent pas.

Divergences de fond trouvées ailleurs que dans les champs d'item : F2 et F5.

### 1.4 Chiffres recomputés

Tous exacts, sans exception :

- `repo-thai-scan.mjs 1 12` → 60 / 525 / 353, et 114 / 90 / 1 / 2 ;
  `13 13` → 5 / 33 / 28 ; `1 13` → 65 / 558 / 374 ;
- `--grep` : สิ 13 (aucune n'est la particule, toutes bâties sur สิบ), ซิ 0,
  ล่ะ 2 toutes deux de `u06-l6e`, รู้ 0, นะ 0, หรอก 0 ;
- `unicode-thai.mjs` : 8 champs `thai`, 126 chaînes distinctes dont 118 hors
  des champs, **NFC toutes conformes, aucune zone à usage privé** ; les onze
  signes non consonantiques des items recomptés à la main sur les huit
  séquences, la liste est juste ;
- `tmp-13c-planchers.mjs` : les sept stratégies de l'exercice 1, les deux de
  l'exercice 3 et les quatre de l'exercice 5 reproduisent les chiffres publiés.
  J'ai en outre refait à la main le plafond « carte la plus longue » (1 strict,
  7 ex aequo, plafond 8) et `P(9/12) = 0,386 %` pour la position constante :
  identiques ;
- VOLUBILIS `.xlsx` : empreinte `b9ab74…fc0c`, 10 848 409 octets, 114 579
  lignes, 586 541 chaînes partagées, **identiques** ; les 8 recherches exactes,
  les 16 lignes de `ล่ะ` avec leur dépouillement 1 / 10 / 5, les 13 `\la` plus
  la 65634 en `_la` plus la 48189 sans ThaiPhon, les 5 lignes finissant par
  `ซิ` toutes en `¯si` : **tout concorde** ;
- `th_50k.txt` : empreinte `20e7052f…6083`, 50 000 lignes, et les huit rangs
  cités (ล่ะ 586/659, แล้วคุณล่ะ 707/557, สิ 815/476, นั่นสิ 642/607, ไม่รู้สิ
  106/3054, ซิ 2636/150, นะ 82/3976, หรอก 1243/311, เล่า absente) sont exacts ;
- réancrage `.ods` → `.xlsx` : les quatre numéros cités par `u06-l6e` (49069,
  49250, 49121, 49254) sont bien dans le fichier de l'unité 6, et les quatre
  numéros `.xlsx` (47169, 47348, 47219, 47352) sont ceux que rend le balayage.
  Les écarts 1 900 / 1 902 / 1 902 / 1 902 sont exacts ;
- collision d'unité : `lecon-13a.md` item 7 publie bien แล้วคุณล่ะ en réemploi
  de `u06-l6e` item 2 ; les listes d'items de 13b, 13d et 13e ne revendiquent
  aucune des sept autres graphies de 13C ;
- aucun tiret cadratin ni demi-cadratin ; « familier » apparaît trois fois hors
  de la partie 2, les trois fois en négation ; aucune promesse de parler comme
  un natif.

## 2. Findings

### F1, BLOQUANT : `REG-ITEM8-NEUTRE`

L'item 8 publie `registre` : « neutre (poli avec la particule …) ». C'est une
**affirmation de registre sans étiquette lue ni citée**, exactement ce que la
règle du parcours avancé et la section 1 quater interdisent. Elle est de plus
en contradiction frontale avec la partie 2 du fichier lui-même, qui écrit :
« elle ne prouve pas que สิ et ล่ะ appartiennent au registre neutre. Elle prouve
que le dictionnaire ne se prononce pas. »

La leçon se protège par une formule trop étroite : « aucun champ `registre` de
cette leçon ne qualifie une forme de **familière** ». Vrai, et hors sujet : la
règle porte sur toute affirmation de registre, pas sur la seule étiquette
« familier ». 13C bloque l'affirmation de registre de `u06-l6e` sur ล่ะ à son
item 3, puis reconduit sans réserve l'affirmation de registre de `u06-l6e` sur
le bloc qui contient ce même ล่ะ à son item 8. Le contrôle `item-fields-fr-check`
rendant 0 écart sur l'item 8 prouve que la valeur est bien reprise telle quelle,
et donc bien publiée par 13C.

Correction attendue : traiter l'item 8 comme l'item 3, c'est-à-dire déclarer
l'écart et porter la valeur à l'arbitrage 1, au lieu de la reconduire en
silence. Ne pas se contenter d'ajouter une phrase au `note_fr`.

### F2, BLOQUANT : `SRC-6E-FAUX`

13C affirme trois fois que `u06-l6e` n'avait pas lu de quoi fonder la valeur de
ล่ะ :

- page 5, écran d'apprenant : « elle n'avait pas de quoi établir ce que ล่ะ fait
  toute seule. Aujourd'hui, l'entrée a été rouverte et lue » ;
- item 3 `note_fr` : « `u06-l6e` refusait d'en donner un, faute d'avoir lu de
  quoi le fonder » ;
- incertitude 1 : « `u06-l6e` avait laissé la particule sans valeur propre faute
  d'avoir lu de quoi la fonder. Le corps de l'entrée a été lu depuis ».

**C'est faux.** `content/authoring/unite-06/lecon-6e.md`, item 1, ligne de
sources RID : l'entrée y est « décrite comme un mot qui accompagne le texte qui
PRÉCÈDE **pour l'appuyer, c'est-à-dire lui donner davantage de poids**, avec
deux exemples dont un interrogatif, et donnée comme équivalente de เล่า ». C'est
mot pour mot ce que 13C présente comme une lecture neuve. Le même item ajoute :
« Ce segment de valeur est consigné ici parce qu'une version antérieure de cet
item le passait sous silence et **laissait croire que l'autorité normative ne
disait rien du sens. Elle en dit quelque chose** ».

`u06-l6e` avait donc lu le corps, consigné la valeur d'appui, et corrigé à sa
consolidation la lecture exacte que 13C réintroduit. Le motif réel de son refus
est autre et il est écrit : le sens de RENVOI (« et à propos de … ? ») est
mono-sourcé VOLUBILIS, ce qui interdisait de l'enseigner comme sens du mot.

Conséquence : le champ `fr` neuf de l'item 3 reste défendable, mais son motif
publié est faux, et la page 5 raconte à l'apprenant une histoire du parcours qui
ne s'est pas produite. À réécrire en disant ce qui a réellement changé : 13C
choisit de publier au niveau du mot une valeur que `u06-l6e` avait choisi de
n'enseigner qu'au niveau du bloc.

### F3, BLOQUANT : `DIAL-COMPTE`

Sous le dialogue : « Paul entend quatre fois une particule d'attitude et **n'en
produit qu'une seule**, celle de แล้วคุณล่ะครับ ».

Le dialogue du même fichier donne à Paul trois répliques portant une particule
d'attitude : `เข้าใจล่ะครับ`, `ไม่รู้สิครับ` et `แล้วคุณล่ะครับ`. Il en produit
donc **trois**, pas une. Le décompte des quatre écoutes est juste
(ลองดูสิค่ะ ×2, ลองดูซิ, เอาสิครับ).

La contradiction est interne au même bloc : le paragraphe « Contrainte de
production », six lignes plus haut, compte correctement « une relance et deux
réponses sur lui-même ». Une des deux phrases doit disparaître.

### F4, BLOQUANT : `ECH-EX4-THAI`

La Méta déclare, en se disant vérifiée « contre ce que chaque champ Interaction
affiche réellement » : « l'exercice 4 n'affiche aucun thaï, le stimulus étant
français et la réponse écrite en transcription ». L'objectif observable dit de
même « à partir du français **seul** ».

Le tirage 2 de l'exercice 4 est : « la même particule, écrite **ซิ** » → `sí`.
Il affiche du thaï, et c'est la seule chose qui le distingue du tirage 1 (« la
particule qui pousse ou qui confirme » → `sì`). Sans ce ซิ, les deux tirages
sont indiscernables et l'un des deux devient impossible.

L'état d'échafaudage déclaré est donc faux, et l'objectif observable
sur-promet. Les quatre autres déclarations d'échafaudage (exercices 1 et 5
`absent`, exercices 2 et 3 `visible`) sont, elles, conformes aux champs
Interaction.

### F5, BLOQUANT : `REGLE-2E-KHA`

Page 7, écran d'apprenant : « une locutrice dit คะ quand c'est une question,
ค่ะ sinon, **comme en 2E** ». L'incertitude 2 rebâtit dessus la justification de
ลองดูสิค่ะ.

`u02-l2e` ne dit pas cela, et prend explicitement le soin de dire l'inverse :

- page 3 : « **Attention à une simplification courante : คะ ne fabrique pas la
  question.** … Nos deux dictionnaires donnent d'ailleurs à คะ un emploi plus
  large, qui couvre aussi l'information donnée poliment » ;
- item 1, champ `fr` : « particule finale d'une locutrice, en fin de question
  **ou d'information donnée poliment** » ;
- item 1, `note_fr` : « **Simplification assumée en leçon** : nous présentons คะ
  du côté de la question … mais les deux dictionnaires lui donnent un emploi
  plus large ».

13C durcit en règle du parcours ce que la leçon d'origine déclare comme une
simplification pédagogique bornée, et lui attribue cette règle par un « comme en
2E » que le fichier de 2E contredit. La sortie produite (ค่ะ sur une invitation)
reste vraisemblable ; c'est la règle citée qui est fausse, et elle est affichée.

### F6, BLOQUANT : `SRC-NAILA-MONO`

Page 9, point 2, écran d'apprenant : « Le dictionnaire lexicalise une forme
voisine, ไหนล่ะ, et la décrit comme une question de reproche, de réclamation ou
de doute. »

Ce fait est **mono-sourcé**. Vérifications faites par moi le 2026-08-04 :
en.wiktionary n'a pas de page `ไหนล่ะ` (API `action=query` → `missing`) ; le
balayage par sous-chaîne de la colonne THA de VOLUBILIS rend seize lignes pour
`ล่ะ` et **aucune** ne porte ไหนล่ะ ; th.wiktionary reproduit la chaîne du RID et
ne compte donc pas, comme `u06-l6e` et `u10-l10a` l'ont déjà établi.

Le dépôt a un précédent net : `u10-l10a` a **retiré de l'écran** l'énoncé
normatif de la porte vivante / morte parce qu'aucune seconde autorité n'existait,
et a écrit « aucune attestation n'a été fabriquée ». Le même traitement s'impose
ici : soit une seconde jambe, soit le fait descend de la page 9 vers le dossier.
La formule de prudence de 13C (« une source ne dit que ce qu'elle dit ») décrit
le problème, elle ne le résout pas.

### F7 : non bloquant, `TON-MORTE-CONTRA`

La Méta écrit : « Une première version de la page 4 affirmait que la règle des
unités 4 à 8 prédit toute seule les tons de สิ et ซิ. **C'est faux** ». L'item 2
écrit, six cents lignes plus bas, que en.wiktionary « corrobore **la prédiction
de la règle d'écriture** ».

Les deux phrases ne peuvent pas être vraies dans le même sens du mot « règle ».
Sur le fond, la règle générale du thaï prédit correctement les deux hauteurs
(initiale haute + syllabe morte → bas ; initiale basse + syllabe morte brève →
haut) ; ce qui est vrai est que **le parcours ne l'enseigne pas**, ce que
`u10-l10a` déclare bien noir sur blanc (relu : « le TON des syllabes mortes reste
hors programme », « aucune carte ne demande le ton d'une syllabe morte »). Le
traitement retenu page 4 est donc bon ; c'est la formulation « c'est faux » de la
Méta et le mot « prédiction » de l'item 2 qui doivent être accordés.

### F8 : non bloquant, `CHIFFRE-SOUSCHAINE`

Dossier, section VOLUBILIS : « une recherche par sous-chaîne y serait
inexploitable, **elle rend 14 lignes dont 6** n'ont rien à voir avec la
particule ».

Recomputé : `tmp-13c-volubilis-sous-chaine.mjs … สิ` rend **1 867 lignes**. Les
« 14 lignes dont 6 » sont le résultat de l'AUTRE script,
`tmp-13c-volubilis-fin.mjs` (14 cellules finissant par สิ, dont 6 hors
particule : อโหสิ, กสิ, ขออโหสิ, รังสี ; รังสิ, ตุลสิ, เวสิ). Le dossier écrit
que « aucun chiffre de ce dossier n'est cité sans » revalidation : celui-ci l'a
été. L'argument reste juste, et même renforcé, une fois le bon chiffre écrit.

### F9 : non bloquant, `SRS-PROD-RECALL`

Section SRS : « Aucune carte ne demande à produire สิ après un verbe, ni ซิ, ni
ไหนล่ะ, ni ลองดูสิ, ni ไปสิ, ni ดูสิ. **Ces formes sont montrées, entendues, lues
et remises dans l'ordre, jamais exigées en production.** »

L'énumération est incomplète et donc fausse : l'exercice 4 est une mécanique
`recall`, sans option à choisir, et ses tirages 2 et 4 attendent `sí` et
`lawwng douu sì`. L'exercice 4 se défend lui-même (« écrire une transcription
n'est pas parler à quelqu'un »), et cette défense est recevable ; mais la phrase
du SRS, elle, décrit un fichier qui n'est pas celui-ci. À corriger en nommant
explicitement l'exercice 4 dans la liste des modes autorisés.

### F10 : non bloquant, `ORDRE-MONO`

Page 7 : « Une seule règle de position aujourd'hui, et **elle est sourcée deux
fois**. »

Les deux jambes sont l'entrée « จ๊ะ ๑ » du RID et… `u06-l6e`, c'est-à-dire une
leçon Thaïnaute antérieure. Ce n'est pas une seconde autorité indépendante au
sens de la politique de sources. La règle neuve mesurée par l'exercice 3 repose
donc sur une seule autorité externe. Second point : l'entrée `จ๊ะ ๑`, que j'ai
relue, ne qualifie จ๊ะ ni de politesse ni de quoi que ce soit ; elle écrit
`คำต่อท้ายคำเชิญชวนหลังคำ “นะ” หรือ “ซิ”`. La transposition vers ครับ / ค่ะ est
une inférence de la leçon, à déclarer comme telle.

### F11 : non bloquant, `PATRON-111154`

Item 4 : le patron « verbe + สิ » est dit attesté par « trois AUTRES lignes »
dont **111154** `อย่าเอามาลงที่ผมสิ`. Relue : dans cette phrase, สิ suit ผม, un
pronom, pas un verbe. Elle atteste la particule en position finale d'énoncé, pas
le patron « verbe + สิ ». Les deux autres lignes citées (12554 `ดูสิ`, 98534
`ทายดูสิ`) l'attestent bien. Le décompte tombe à trois lignes en comptant celle
de l'item, ce qui reste suffisant mais doit être écrit juste, d'autant que la
leçon a déjà corrigé un décompte de ce type au même endroit.

### F12 : non bloquant, `PAGE1-ABSOLU`

Page 1, écran d'apprenant : « Depuis douze unités, **chaque mot** que vous avez
appris se remplace par un mot français. Les deux du jour ne se remplacent par
rien. »

Le parcours contredit cet absolu : ครับ et ค่ะ (`u01-l1e` items 2 et 3) et คะ
(`u02-l2e` item 1) ne se remplacent par aucun mot français, et leurs champs `fr`
publiés disent « particule de politesse d'un locuteur homme » et « particule
finale d'une locutrice ». La page 7 de cette leçon même les appelle « la
particule de politesse », et sa page 11 fait entendre à l'apprenant que « lâ
tombe et s'arrête net, exactement comme le ค่ะ que vous dites depuis 1E », donc
sur le modèle d'un mot déjà appris qui ne se remplace par rien.
La règle d'écriture du projet proscrit les absolus non vérifiables ;
ici l'absolu est en plus réfutable par le dépôt. Formulation de repli possible :
ces particules ne portent pas d'information, elles portent une attitude, ce qui
est le vrai propos de la page.

## 3. Ce que je n'ai PAS trouvé, et qui est à porter au crédit du fichier

- Aucune affirmation de registre fabriquée. Les six corps d'entrée disent bien
  ce que le fichier dit qu'ils disent, à la lettre.
- Aucune graphie attestée pour autre chose que ce que la leçon enseigne. Le cas
  จ้า n'a pas d'équivalent ici : le renvoi croisé สิ ↔ ซิ / ซิ่ / ซี est réel dans
  les deux sens et le double contrôle par `ซิ` et par `ซี` rend bien la même
  vedette groupée.
- Aucune divergence silencieuse de réemploi. 24 blocs sur 24 concordent.
- Aucun exercice réussissable par une réponse constante : le pire plafond mesuré
  reste sous le seuil dans les cinq exercices, et j'ai refait deux des calculs à
  la main.
- Aucun défaut Unicode : NFC partout, aucune zone à usage privé, l'inventaire des
  onze signes des items est exact.
- Aucune promesse de parler comme un natif, aucun tiret cadratin, aucune
  affirmation sur le français au sens de la section 1 bis (la leçon n'en fait
  aucune ; F12 porte sur une affirmation à propos du PARCOURS, pas du français).
- La réserve de lecture sur la ligne 49939, dont la colonne ThaiPhon s'arrête
  avant สิ, est réelle et honnêtement consignée. Idem pour la ligne 91851 dont la
  colonne `DOM` porte `RID`.

## 4. Portes à franchir avant `draft → review`

1. F1 à F6 résolus, et F1 en priorité : c'est la seule affirmation de registre
   non étayée du fichier.
2. F7 à F12 tranchés ou explicitement acceptés par la consolidation.
3. Contre-audit externe `GPT-5.6 SOL ULTRA` toujours NON LANCÉ.
4. Audio non produit : les tirages 1, 2, 11 et 12 de l'exercice 1 ne mesurent
   rien tant que la différence de hauteur สิ / ซิ n'est pas audible.
5. Revue native toujours en attente, et le fichier a raison d'écrire qu'elle est
   plus nécessaire ici qu'ailleurs : la leçon parle d'effet social.
