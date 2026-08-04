# Vérification adversariale de `lecon-12c.md`

- Fichier audité : `content/authoring/unite-12/lecon-12c.md` (2034 lignes)
- Date : 2026-08-04
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer »
- Politique appliquée : `content/authoring/CONVENTIONS.md`,
  `docs/content-policy/sources-verification.md` sections 1 bis et 1 ter
- Environnement : **aucun accès réseau**. Le RID, VOLUBILIS (`.xlsx` absent du
  dépôt), en.wiktionary et les fichiers Unicode n'ont pas pu être réinterrogés.
  Tout ce qui dépend d'eux est marqué NON VÉRIFIABLE ICI, jamais confirmé.

## 1. Ce que j'ai vérifié moi-même et qui tient

29 faits contrôlés en exécutant les outils ou en relisant les fichiers cités.

**Outils réexécutés sur le fichier, sorties identiques à celles annoncées**

1. `item-fields-check.mjs` : 0 champ `codepoints` en faute, **1 écart de
   réemploi** (item 3, `(NFC)` en trop), **1 référence non suivie** (`u01-l1a`).
   Code de sortie 0. Exactement ce que le dossier écrit.
2. `item-fields-fr-check.mjs` : 0 écart sur `fr`, `litteral`, `registre` ; seule
   ligne rendue, le même « ขา absent de u01-l1a ».
3. `unicode-thai.mjs` : 13 champs `thai`, séquences NFC **identiques une à une**
   au tableau de la section Unicode du fichier.
4. `unicode-stack-scan.mjs` : 146 sous-chaînes, profondeur maximale 2, **7
   graphies** ตั๋ว ที่ สี่ หนึ่ง เปลี่ยน เปฺลี่ยน เสื้อ. Exact.
5. `repo-thai-scan.mjs 1 11` : 55 fichiers, 512 entrées, 353 graphies. Exact.
6. `lecture-corpus.mjs 1 11` : 94 / 0 / 36 / 2 / 16 / 11 / 1 / 191 / 1 / 1,
   total 353. **Les dix cases du tableau de la partie 1 sont exactes.**
7. `lecture-corpus.mjs 1 11 --detail` : 33 confirmés, 0 contredit, 3 longueurs
   non déclarées (ขวด, ปวด, เรียก). Exact.
8. Les sept graphies ouvertes brèves de la partie 3 (ดุ, คะ, เตะ, แตะ, และ, ค่ะ,
   ล่ะ), leur classe, leur marque et leur ton publié : conformes au script.
9. Le seul « non classé » est bien ก็, publié par `u11-l11c`.
10. Inventaire des citations de `srs-u04-l4a-06` et `srs-u07-l7a-03` : les deux
    listes du fichier sont exactes (12B mise à part, écrite depuis).
11. 280 identifiants SRS distincts hors `lecon-12b.md` et `lecon-12c.md` :
    recompté, exact.
12. Aucun tiret cadratin ni demi-cadratin : **0 occurrence**.

**Citations de leçons sœurs relues dans le dépôt**

13. La page 5 de `u10-l10a` : la citation « DEDANS … DEHORS … » est **verbatim**,
    et la branche « ouverte à voyelle brève » y manque réellement. L'ajout de la
    page 6 de 12C est fondé.
14. `u08-l8a` écrit bien « la marque de ton se pose sur la voyelle qui suit, pas
    sur le ป » ; `u10-l10a` bien « il est posé au-dessus du ล, la lettre
    d'après ». La divergence signalée existe.
15. `u10-l10a` définit bien `absent` par « thaï seul, aucune révélation avant la
    réponse ».
16. Le critère de CONTACT vient bien de la page 5 de `u05-l5a`, et 12C le
    reprend sans le déformer.
17. Item 2 (ขา) : `thai`, `codepoints`, `ipa`, `ton`, `longueur`, `fr`,
    `transcription`, `registre` **identiques** à `u01-l1a` item 5, relecture
    manuelle. Le « graphie absente » du script est bien un défaut d'outil.
18. หมา = `u01-l1d` item 1, ถุง = `u03-l3a` item 8, เตะ = `u03-l3a` item 5,
    หนึ่ง = `u03-l3b` 1.1, สอง = 1.2, สี่ = 1.4, ห้า = 1.5 : références exactes.

**Contenu pédagogique recalculé à la main**

19. Les douze décodages des pages 8 à 12 (classe, marque, fermeture, vivante ou
    morte, ton, transcription) : **corrects un par un**, y compris le point
    délicat du อ voyelle dans สอง et พ่อ, et le groupe ปล de เปลี่ยน.
20. Les trois listes de la page 3 sont les vraies listes thaïes : 9 moyennes,
    11 hautes, 24 basses, sans faute de lettre.
21. Les 24 transcriptions employées sont conformes à `thainaute-fr` v1.1
    (`aww`, `aee`, `ouu`, `ai`, accent sur la première lettre du noyau,
    séparateur `·` dans `tà·làat`).
22. Exercice 1 : réponse constante 4/12 (4 tirages par classe, recompté) ;
    « première lettre » et « deuxième lettre » 8/12 en espérance ;
    **10,0 % de sessions au seuil = 73/729, recalculé, exact**.
23. Exercice 2 : constante 6/14 ; méthode `u10-l10a` **11/14 déterministe**,
    échec exactement sur คะ, และ, เตะ ; « finit par une lettre-consonne » 6/14 ;
    « hors domaine reconnus » 8/14. Les quatre recomptés, exacts.
24. Exercice 3 : constante 3/14 ; stratégie « classe seule » 6/14 avec le détail
    1/3, 3/5, 2/6, recompté, exact ; **les neuf cases du tableau sont bien
    représentées**.
25. Exercice 4 : 1/720, 1/8, 1/12 recalculés, exacts ; l'argument « pas de score
    intermédiaire entre 4 et 6 » est juste pour une bijection.
26. Exercice 5 : les huit réponses attendues sont distinctes, donc une réponse
    constante plafonne bien à 1/8.
27. Les cinq seuils du champ « Objectif observable » correspondent un à un aux
    cinq seuils des exercices.
28. Balayage des promesses de niveau refait sur les écrans seuls : **0
    occurrence** de `A1`, `A2`, `B1`, `B2`, `CECR`, `heures`, `mois`,
    `semaines`, `équivalent` ; `niveau` apparaît deux fois, pages 1 et 14, dans
    des phrases qui refusent d'en donner un. **La contrainte principale de
    l'unité est tenue sur ce plan-là.**
29. Le total hors domaine de 12C (16 + 11 + 1 = 28) concorde avec le « 28 » que
    `u12-l12a` affiche à sa page 12.

## 2. Findings

### F1 — BLOQUANT — La page 3 déclare acquises dix lettres que le parcours n'a jamais enseignées

**Ce que 12C écrit.** Page 3 : « Elles sont trois, vous les avez apprises en
trois fois, et le dictionnaire normatif les énumère lettre par lettre : neuf
moyennes, onze hautes, vingt-quatre basses », suivi des trois listes complètes.
Méta, prérequis : « `u04-l4a` : les **onze** consonnes hautes » et
« `u06-l6a` : les **vingt-quatre** consonnes basses ».

**Ce que les fichiers cités disent.**

- `u04-l4a`, bloc d'écriture : « les **neuf** consonnes hautes d'usage courant,
  ข, ฉ, ถ, ผ, ฝ, ศ, ษ, ส, ห ». Page 5 : « les neuf consonnes hautes ».
  `srs-u04-l4a-04` porte sur ces neuf. **ฃ et ฐ ne sont pas enseignées.**
- `u05-l5a` page 9 : neuf basses ค ง ช ซ ท น พ ฟ ม, avec cette phrase :
  « Une honnêteté de comptage : le dictionnaire range vingt-quatre lettres dans
  cette classe, pas neuf. Les autres viendront. »
- `u06-l6a` page 7 : sept basses de plus, puis, mot pour mot : « Neuf plus sept
  font seize. Le dictionnaire en range vingt-quatre dans cette classe : **ฅ, ฆ,
  ฌ, ญ, ฑ, ฒ, ณ et ฬ ne sont pas enseignées ici et viendront plus tard.** »
- `u09-l9a` traite ฃ et ฅ comme des « lettres obsolètes » et consigne ฉ ฌ,
  ฐ ฑ ฒ, ฃ ฅ en réserves.
- Aucune leçon de 1 à 11 ne revient sur les dix manquantes. Elles ne sont
  jamais venues.

**Compte.** Le parcours enseigne 9 moyennes + 9 hautes + 16 basses = **34
lettres**. 12C en affiche 44 et dit à l'apprenant qu'il les a apprises. Dix
lettres, ฃ ฐ ฅ ฆ ฌ ญ ฑ ฒ ณ ฬ, n'ont jamais été présentées comme initiales
portant une classe.

**Pourquoi c'est bloquant.** C'est très exactement une capacité annoncée sans
leçon derrière, dans la leçon-bilan qui est censée dire ce que l'apprenant sait
faire. Deux des trois prérequis de la Méta sont faux contre le fichier qu'ils
citent, et l'un d'eux, `u06-l6a`, énumère lui-même les huit lettres qu'il
n'enseigne pas. La page 3 transforme une dette déclarée par le parcours en
acquis affirmé à l'apprenant.

**Correction attendue.** Soit n'afficher que les 34 lettres réellement
enseignées et nommer les dix autres comme non couvertes, soit garder les trois
listes complètes en écrivant que dix lettres n'ont pas été enseignées et que la
leçon ne les mesure pas. Dans les deux cas, corriger les deux prérequis.

### F2 — BLOQUANT — « le mot le plus difficile à lire du parcours, et vous venez de le lire »

**Ce que 12C écrit.** Page 12 : « C'est le mot le plus difficile à lire du
parcours, et vous venez de le lire. »

**Ce qui ne va pas, en trois points.**

1. **Aucune mesure de difficulté n'existe** dans le dossier. Les six parties du
   dossier mesurent des tons prédits, des lignes de VOLUBILIS, des piles Unicode
   et des planchers d'exercice. Rien n'ordonne les graphies par difficulté de
   lecture. Le superlatif n'est adossé à rien.
2. **La leçon se contredit dix lignes plus bas.** La même page 12 écrit que ตลาด
   et ปลา sont indistinguables à l'œil et conclut « fiez-vous à ce que vous
   entendez » : un mot que la méthode ne permet pas de trancher est plus
   difficile à lire, pas moins. Et la page 13 déclare 191 entrées polysyllabiques
   hors de portée.
3. **La source interne dit autre chose.** `u08-l8a`, qui publie เปลี่ยน, écrit
   dans sa `note_fr` : « C'est le mot le plus difficile à lire **de la leçon**,
   et c'est assumé. » 12C élargit « de la leçon » en « du parcours » sans rien
   ajouter qui le justifie.

La seconde moitié de la phrase, « et vous venez de le lire », est une
gratification adressée à l'apprenant sur la base de ce superlatif. C'est une
affirmation flatteuse invérifiable dans l'unité qui parle du niveau atteint.

**Correction attendue.** Retomber sur le périmètre mesurable : « c'est le mot
qui empile le plus de complications de cette leçon », ou reprendre la
formulation bornée de `u08-l8a`.

### F3 — BLOQUANT — La page 1 promet une mesure personnelle que la page 13 refuse explicitement de donner

**Page 1** : « Elle vous dira une chose plus utile et plus petite : sur les mots
que ce cours vous a publiés, **combien vous pouvez lire entièrement**, et où
exactement vous devez vous arrêter. »

**Page 13** : « Reste ce que **vous** lisez entièrement : 94 entrées d'une seule
syllabe … Ce n'est pas une promesse, c'est un décompte, et **il porte sur le
COURS, pas sur vous**. »

Les deux pages ne peuvent pas être vraies ensemble. La page 1 promet un nombre
de mots que l'apprenant sait lire ; la page 13 livre un nombre de mots que la
méthode couvre et dit dans la phrase suivante que ce nombre ne parle pas de lui.
La page 13 répète d'ailleurs la même faute dans sa proposition principale,
« Reste ce que vous lisez entièrement », avant de la démentir.

Ce que la leçon mesure réellement de l'apprenant : 54 tirages sur une vingtaine
de graphies, aux cinq exercices. Rien n'autorise à lui dire qu'il lit 94 entrées.

**Pourquoi c'est bloquant.** C'est la promesse de résultat que la consigne de
l'unité 12 interdit, et elle est en première page, là où elle oriente la lecture
de tout le reste. Le fait que la page 13 se rattrape ne l'annule pas : un
apprenant qui lit « 94 » retient 94.

**Correction attendue.** Page 1 : promettre ce que la leçon fait, c'est-à-dire
« combien de mots de ce cours la méthode permet de lire entièrement, et où elle
s'arrête », sans « vous ». Page 13 : « Reste ce que la méthode lit entièrement ».

### F4 — BLOQUANT — Trois graphies sont affichées à l'apprenant sans figurer dans l'inventaire des réemplois, et le contrôle « aucune graphie nouvelle » ne les a pas vues

**Les trois graphies.** Exercice 1, tirages 3, 7 et 8 : **เจอ, เสีย, เสื้อ**.

**Ce que le fichier affirme.**

- Section « Blocs et spécimens réemployés » : « **Onze** graphies de plus
  apparaissent sur un écran de 12C, comme spécimen ou comme tirage d'exercice ».
  Le tableau en donne onze, et aucune des trois n'y est.
- Méta : « les onze spécimens aussi, contrôle au dossier ».
- Partie 6 : « Le contrôle a été fait graphie par graphie … pour chacune des
  treize graphies d'items **et des onze spécimens du tableau** ».
- Décompte RID : « 24 graphies interrogées » = 13 items + 5 spécimens + 6 termes.
  Les trois n'y sont pas non plus.
- Section Unicode, liste des spécimens : les trois n'y sont pas.

**Vérification faite ici.** Les trois sont bien publiées, donc **aucun mot
nouveau n'est introduit** :
`repo-thai-scan.mjs 1 11 --grep` rend เจอ dans `u06-l6a` item 6, เสีย dans
`u08-l8a` item 3, เสื้อ dans `u08-l8a` item 4. Les trois classes annoncées par
l'exercice 1 (จ moyenne, ส haute, ส haute) sont justes.

**Pourquoi c'est quand même bloquant.** La leçon écrit « Aucun mot nouveau, et
c'est vérifié plutôt qu'annoncé ». Le contrôle qui fonde cette phrase a porté
sur 24 graphies et en a laissé trois de côté, dont une, เสื้อ, que le fichier
nomme lui-même comme tirage de l'exercice 1 dans sa section Unicode. Le décompte
« onze » est faux, et la vérification d'exhaustivité est donc fausse telle
qu'écrite. C'est le défaut que `item-fields-check.mjs` a été écrit pour attraper,
appliqué cette fois à l'inventaire plutôt qu'aux champs.

**Correction attendue.** Porter เจอ, เสีย et เสื้อ au tableau avec leur leçon de
publication, leur ton publié et leur transcription publiée, corriger « onze » en
« quatorze », et refaire le décompte RID et la liste Unicode en conséquence.

### F5 — non bloquant — เจ็บ n'est pas publiée par `u08-l8c`

Le fichier écrit : « เจ็บ et แพทย์ à la page 4, publiées par `u08-l8c` et
`u09-l9a` ». `grep -n "เจ็บ" content/authoring/unite-08/lecon-8c.md` ne rend
**aucune ligne** : la graphie n'apparaît nulle part dans ce fichier. Elle est
publiée par `u09-l9a` **item 1** (`ton` bas, `transcription` jèp), et republiée
par `u09-l9b` item 6.

แพทย์ est bien de `u09-l9a` (item 4). Une des deux références est donc juste et
l'autre pointe vers un fichier sans rapport.

Point voisin, à traiter en même temps : la page 4 affirme « Le ◌็ de เจ็บ
raccourcit la voyelle ». Le fait est correct et enseigné par `u03-l3b`, qui le
source. Mais 12C ne cite ni `u03-l3b` en prérequis, ni le signe dans son dossier
de sources : la seule assertion linguistique de la page 4 n'a aucune jambe dans
ce fichier.

### F6 — non bloquant — Les « familles de fin » sont attribuées à `u05-l5a` alors qu'elles viennent de `u09-l9a`, et 12C se contredit lui-même

Méta, prérequis : « `u05-l5a` : **les familles de fin**, et le critère de CONTACT
qui reconnaît une consonne de tête ».

Or :

- la page 5 de 12C écrit « Ce sont les familles de fin **de 9A** » ;
- la page 5 de `u10-l10a` écrit « Elle se lit avec ce que vous avez appris
  **en 9A** : les familles de fin » ;
- `u09-l9a` intitule sa propre partie « Les familles de fin », donne les huit
  มาตรา et les trois familles utilisées ;
- `u05-l5a` ouvre les fermetures `p`, `t`, `k` **du côté du son** et le dit :
  « La leçon d'aujourd'hui ouvre ces cas du côté du son, pas du côté du ton ».

Deux conséquences dans la même Méta : la capacité « familles de fin » est
créditée à la mauvaise leçon, et le vrai apport de `u05-l5a` au fil écriture,
les neuf premières consonnes basses, n'est crédité à personne, puisque la ligne
suivante donne les 24 basses à `u06-l6a` (voir F1).

### F7 — non bloquant — Le détail du plancher de l'exercice 3 classe ไม่ dans le groupe « sans marque », alors qu'il porte un ไม้เอก

Le fichier écrit : « **« je regarde la marque et j'ignore la classe »** … : 7 sur
14, détail des groupes, **rien 3 sur 7, ◌่ 2 sur 3**, ◌้ 2 sur 4 ».

Les quatorze tirages se répartissent ainsi : six sans marque (กิน, มา, ขา, สอง,
ถุง, รถ), **quatre avec ◌่** (ป่า, สี่, พ่อ **et ไม่**), quatre avec ◌้ (บ้าน,
ห้า, น้อง, แล้ว). La section Unicode du fichier lui-même donne
ไม่ = U+0E44 U+0E21 **U+0E48**, c'est-à-dire un ไม้เอก visible.

Le détail juste est donc **rien 3 sur 6, ◌่ 2 sur 4, ◌้ 2 sur 4**. Le total
reste 7 sur 14 et la conclusion de l'exercice n'est pas touchée, mais deux des
trois chiffres publiés sont faux, et ils sont présentés comme « comptes produits
par script sur les tables de tirages telles qu'elles sont écrites ». Le contrôle
croisé le montre : la stratégie « classe seule », recomptée ici, tombe juste
(1/3, 3/5, 2/6, somme 14) ; seule la partition par marque est fautive.

### F8 — non bloquant — « le parcours ne publie que ces deux mots dans ces deux cases » est faux

Page 7 : « la classe moyenne avec ◌๊ donne le ton haut (เก๊), et avec ◌๋ le ton
montant (ตั๋ว). Aucun exercice du jour ne les demande, parce que **le parcours ne
publie que ces deux mots dans ces deux cases** ».

`repo-thai-scan.mjs 1 11 --grep ๋` rend **deux** graphies : ตั๋ว et **กระเป๋า**,
toutes deux de `u08-l8a`. Le ◌๋ de กระเป๋า est posé sur ป, consonne moyenne :
la graphie est bien dans la case « moyenne + ◌๋ ».

Si l'auteur l'écarte parce qu'elle est polysyllabique et que sa syllabe finale
est en เ◌า, forme hors domaine, l'argument est recevable mais il n'est pas écrit.
En l'état la phrase est fausse contre l'outil du dépôt, dans une leçon qui fait
de la recomputabilité son argument central.

### F9 — non bloquant — Le plancher de l'exercice 5 se contredit dans la même phrase

« Une réponse écrite sans accent de ton vaut **0 sur 8**, y compris pour `maa`,
dont le ton moyen ne se note par aucun signe : c'est la **seule réponse du tirage
où l'absence d'accent est correcte**, et elle est correcte pour cette raison-là. »

Si l'absence d'accent est correcte pour `maa`, alors la stratégie « j'écris tout
sans accent » vaut **1 sur 8**, pas 0. La proposition principale et sa
subordonnée s'annulent. Le plancher réel de cette stratégie est 1/8, identique à
celui d'une réponse constante, ce qui ne change pas le verdict de l'exercice mais
rend le chiffre publié inexact.

### F10 — non bloquant — `repo-thai-scan.mjs 12 12` réfute maintenant « l'unité 12 ne publie aucun item », et c'est 12C qui l'a réfuté

Le fichier écrit deux fois, en Méta et au tableau des contrôles : « `12 12` rend
**0 entrée et 0 graphie** … parce que l'unité 12 ne publie aucun item » et
« 12C ne publie rien non plus ».

Réexécuté ici : `repo-thai-scan.mjs 12 12` rend **5 fichiers, 13 entrées, 13
graphies distinctes**. Compté fichier par fichier
(`grep -c '^- \`thai\` :'`), les **treize viennent de `lecon-12c.md`** et
d'aucun autre : 12A, 12B, 12D et 12E en portent zéro.

L'outil que la leçon cite comme preuve compte donc ses treize blocs d'item comme
des entrées publiées par l'unité 12. La conclusion de fond tient, `1 12` rend
toujours **353 graphies distinctes**, donc aucune graphie nouvelle n'entre par
12C ; mais les deux phrases citées sont fausses dès l'instant où le fichier
existe. Une leçon ne peut pas fonder une preuve sur un relevé qu'elle invalide en
étant enregistrée.

Trois autres relevés de coordination se sont périmés dans le même mouvement :

- « La page 6 de `u12-l12e` compte “353 entrées de vocabulaire distinctes,
  réparties sur **55 leçons**” » : 12E écrit aujourd'hui « réparties sur **60
  leçons** ». Le nombre cité entre guillemets n'est pas celui du fichier cité.
- Arbitrage 5 : « `u12-l12e` annonce “**271** cartes de révision” » : 12E annonce
  aujourd'hui **282 cartes**, et explique son propre recomptage. L'arbitrage
  attaque un chiffre qui n'existe plus. Le « 280 » du dépôt est en revanche
  exact au moment du relevé : recompté ici, 280 identifiants distincts hors 12B
  et 12C, 286 aujourd'hui.
- Méta : « Durée visée : 18 minutes. **C'est la leçon la plus longue de
  l'unité** » : `u12-l12d` vise 20 minutes et se déclare « la leçon la plus
  longue du parcours » ; 12A et 12B visent 18 minutes comme 12C.

### F11 — non bloquant — La concordance annoncée avec `u12-l12a` n'existe pas, et les deux écrans publient deux nombres différents

Le fichier écrit : « **12C fournit le chiffre que cette phrase n'a pas**, et les
deux concordent », à propos de la page 12 de `u12-l12a`.

État réel de `u12-l12a` :

- sa page 12 **donne maintenant ses propres chiffres** : « Sur les 353 graphies
  que le parcours publie, la méthode … se vérifie sur 94 … Pour les 259 autres
  elle ne dit rien : **193 comptent plus d'une syllabe**, 38 sont des syllabes
  mortes …, et 28 sont explicitement hors de son domaine » ;
- son dossier écrit noir sur blanc que « la version antérieure de cette page
  disait “une bonne part du vocabulaire de conversation est dans ce cas” », soit
  précisément la phrase que 12C cite comme actuelle.

Et la concordance affirmée est fausse sur un nombre : **12A affiche 193
polysyllabiques, 12C en affiche 191**. `lecture-corpus.mjs` rend 191, plus 1
« pas une graphie simple » et 1 « non classé » ; 12A a absorbé ces deux-là dans
son 193, 12C les laisse dehors. Les deux choix se défendent, mais deux écrans de
la même unité montrent deux nombres pour la même mesure, et 12C certifie leur
concordance sans l'avoir ouverte.

Corollaire à traiter avec l'arbitrage 5 : la page 13 de 12C donne 94 + 38 + 16 +
11 + 1 + 191 = **351**, sur un total annoncé de 353. Les deux graphies restantes
ne sont nommées que dans le dossier. La page ne le dit pas à l'apprenant.

### F12 — non bloquant — Les deux repères de tons sont déclarés « rejoués » alors qu'aucun écran ne les rejoue

Méta, fil des tons : « Repère rejoué, celui de `u01-l1d` : หมา contre ม้า » et
« Repère rejoué, celui de `u01-l1c` : ปา contre ป่า ».

Recherche dans la section `## Enseignement`, c'est-à-dire les quatorze écrans :
**ม้า et ปา n'y apparaissent pas une seule fois**. ม้า n'existe que dans la Méta,
dans la section SRS et dans la liste Unicode du dossier ; ปา, que dans la Méta,
dans la `note_fr` de l'item 3 et dans la section SRS. Aucune paire n'est montrée
à l'apprenant, et « rejoué » est donc faux.

S'y ajoute que 12C ne joue **aucun audio avant la réponse** et ne porte **aucun
exercice `listening`**, ce qui est justifié par ailleurs mais signifie qu'aucun
des deux contrastes n'est pratiqué à l'oreille dans cette leçon. Le seul
entretien réel passe par `srs-u04-l4a-06` et `srs-u07-l7a-03`, dont 12C établit
elle-même qu'ils n'ont reçu aucun tirage depuis quatre unités.

`CONVENTIONS.md` demande, pour les unités 8 et suivantes, qu'une leçon qui a
besoin d'un contraste « le rappelle et le fait pratiquer ». 12C le rappelle en
Méta, ne le rappelle sur aucun écran, et ne le fait pratiquer nulle part. L'écart
est signalé à l'arbitrage 3, ce qui satisfait la clause de signalement, mais le
mot « rejoué » doit disparaître.

## 3. Points NON VÉRIFIABLES dans cet environnement

Aucun de ces points n'est confirmé par cet audit. Ils sont à porter en tête du
contre-audit externe, qui devra disposer du réseau et du classeur.

- Les 27 relevés VOLUBILIS, leurs numéros de ligne et l'empreinte SHA-256 du
  `.xlsx` : **le classeur n'est pas dans le dépôt**.
- Les 24 interrogations RID, dont les six termes de métalangue et les trois
  lectures entre crochets `[เพฺลง]`, `[เปฺลี่ยน]`, `[ตะหฺลาด]` sur lesquelles
  reposent la page 12 et les items 12 et 13.
- Les quatorze entrées en.wiktionary, l'annexe « Appendix:Thai script », et le
  **404 annoncé pour ไตรยางศ์** : à confirmer, l'absence d'entrée étant l'un des
  rares contrôles négatifs du dossier.
- Les trois empreintes des fichiers Unicode 17.0 et les numéros de ligne 3244,
  3259, 1461 et 384.
- La réexécution de `table-des-tons.mjs` (2 125 entrées, 9 divergences), qui
  dépend du classeur.

## 4. Verdict

29 faits confirmés par exécution ou relecture, dont l'intégralité du tableau de
la partie 1, les douze décodages d'écran, les cinq planchers à un détail près, et
le balayage des promesses de niveau, qui est **tenu** sur les motifs qu'il
annonce.

**Quatre findings bloquants**, dans cet ordre d'urgence :

1. **F1**, dix lettres déclarées apprises et jamais enseignées, contredit par
   `u05-l5a` et `u06-l6a` qui nomment eux-mêmes les lettres qu'ils laissent
   dehors ;
2. **F3**, la page 1 promet une mesure personnelle que la page 13 dément ;
3. **F2**, superlatif flatteur non mesuré et contredit par la page qui le porte ;
4. **F4**, trois graphies d'écran hors inventaire, qui rendent fausse la
   vérification d'exhaustivité annoncée.

Le fichier reste `draft`. Aucun passage en `review` avant résolution de F1 à F4,
en plus de l'arbitrage 1 que la leçon signale déjà.

Une remarque de méthode pour finir. Ce fichier est très majoritairement exact, et
ses erreurs se concentrent sur ce qu'il n'a pas recomputé : les affirmations
concernant les autres leçons, l'inventaire de ses propres écrans, et deux
partitions de planchers. Le mécanisme est le même que celui de son arbitrage 8,
la rédaction en parallèle, et il a produit ici quatre relevés périmés sur des
fichiers sœurs, plus une phrase que le fichier invalide en existant (F10).
