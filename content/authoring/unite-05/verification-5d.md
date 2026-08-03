# Contre-audit adversarial de `unite-05/lecon-5d.md`

- Date : 3 août 2026
- Auditeur : agent de contre-audit interne, consigne adversariale (chercher des
  erreurs, ne rien confirmer sur parole)
- Objet : `content/authoring/unite-05/lecon-5d.md`, statut `draft`
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` v1 + amendements
  v1.1 et v1.2 ; `docs/content-policy/sources-verification.md`
- Verdict à l'audit : **8 findings bloquants, 4 non bloquants. Le passage
  `draft → review` restait fermé.**
- **Consolidation appliquée le 2026-08-03**, par Claude Opus 5
  (`claude-opus-5[1m]`), sur `content/authoring/unite-05/lecon-5d.md`. Les
  douze findings sont traités : F1, F2, F4, F8 par suppression, faute de source
  autorisée ; F3, F5, F7, F9, F11 par correction re-sourcée sur le dossier
  existant ; F6 par arbitrage de répartition en faveur de 5B ; F10 par
  correction et par mise à l'écran de la paire prescrite ; F12 par
  requalification partielle, avec un écart assumé consigné ci-dessous. Le détail
  ligne à ligne est consigné dans la leçon, section « Traitement des findings du
  contre-audit du 2026-08-03 ».
- **Le passage `draft → review` reste fermé**, pour des motifs désormais
  différents de ceux de l'audit : ratification du graphème `uea`, lecture
  croisée avec 5A et 5E, arbitrage de parcours sur la description de /ɯ/ et du
  /r/, lot de contre-audit externe, relevé VOLUBILIS de l'unité, contrôle de
  rendu.

## Écart assumé du consolidateur par rapport à l'audit

Un seul, sur **F12**. L'audit conclut que l'absence de `ː` dans `/rɯa̯˧/` est la
notation constante de Wiktionary pour les trois voyelles glissées `เอีย`,
`เอือ` et `อัว`, et qu'il y a donc une source de moins en conflit que déclaré.
C'est probablement exact, mais **aucune des pages citées par la leçon ne
l'énonce**, et ni l'audit ni la consolidation n'ont relevé les entrées de `เอีย`
et de `อัว` pour l'établir. Écrire cette explication dans le dossier comme un
fait sourcé aurait été fabriquer une attestation. La leçon retient donc une
reformulation plus faible et vérifiable : les romanisations encodent une
longueur, l'IPA n'écrit pas `ː`, aucune source consultée ne dit ce que cette
absence signifie, la question est de convention de notation et se tranche pour
tout le parcours en même temps que `ตัว` (3D). Rien n'est enseigné ni révisé sur
ce point, ce qui rend l'écart sans effet à l'écran.

Deux findings débordent par ailleurs le périmètre d'un fichier de leçon et sont
signalés sans être exécutés, conformément à la règle « une leçon ne modifie pas
`CONVENTIONS.md` » :

- **F2 et F8** ouvrent une dette de parcours. `CONVENTIONS.md` v1 décrit `ue`
  comme « i avec les lèvres étirées », description reprise en 2D, 2E et 4B, et
  `u03-l3b` porte déjà la même dette sur le `/r/` à son incertitude 4. Aucune
  de ces descriptions n'est sourçable en l'état, la politique ne référençant
  aucune source de phonétique articulatoire. 5D retire ses propres consignes et
  ne crée pas de description concurrente ; l'arbitrage revient à la
  consolidation d'unité. Nouvelle incertitude 9 de la leçon.
- **F6** a une contrepartie dans `lecon-5e.md`, dont le contrat de Méta affirme
  que « 5B publie `ตลาด` », alors que c'est 5D, et que « 5D publie `ตรงไป` »,
  alors que 5D ne contient pas cette graphie et que 5B publie `ตรง`. Vérifié
  fichier par fichier le 2026-08-03. Ces deux lignes sont fausses côté 5E et ne
  se corrigent pas depuis 5D.

## Méthode

Aucune source citée par la leçon n'a été crue sur parole. Chaque affirmation a
été rejouée à la source, dans les formes exigées par l'amendement v1.2 :

- **RID 2554** : 25 interrogations directes, une requête par graphie, POST sur
  `dictionary.orst.go.th/func_lookup.php` avec
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, corps encodé
  `application/x-www-form-urlencoded; charset=UTF-8`, requêtes espacées de
  1,4 s, agent utilisateur identifiant l'audit. Aucune définition n'est
  reproduite ci-dessous ; seuls sont consignés la présence de la vedette, le
  nombre de sens, l'étiquette, la lecture entre crochets, le mot-tête et la
  concordance du sens.
- **Wiktionary (en et th)** : 13 pages relevées en wikitexte (`action=raw`) et
  en rendu (`action=render`), pour lire l'IPA et les romanisations telles que
  les modèles les produisent réellement.
- **FrequencyWords** : `content/2018/th/th_50k.txt` téléchargé, 50 000 lignes,
  rangs et occurrences recalculés.
- **Unicode** : normalisation NFC recalculée sur le fichier entier et sur les
  sept champs `codepoints`.
- **Tons, longueurs, transcription** : recalculés à la main, syllabe par
  syllabe, contre `CONVENTIONS.md` v1.1, sans lire les champs de la leçon
  d'abord.
- **Corrigés** : les 18 réponses des quatre exercices ont été recomposées de
  zéro, puis comparées.
- **Renvois internes** : chaque leçon citée (1A, 1B, 1E, 2B, 2D, 3A, 3B, 3D,
  3E, 4A, 4C) a été ouverte et lue au passage concerné.

**Limite d'audit à connaître.** `VOLUBILIS.ods` n'est pas dans le dépôt et
SourceForge est injoignable depuis cet environnement (trois URL essayées,
connexion refusée). **Aucune des références VOLUBILIS de cette leçon n'a donc
pu être rejouée par moi.** Les numéros de ligne, les marqueurs `ThaiPhon` et les
mentions `RID` en colonne `DOM` restent invérifiés. Pour deux faits, la seconde
jambe de preuve est exclusivement VOLUBILIS (`ไป` + lieu sans préposition, via
la ligne 68133 ; et l'omission du sujet, via la ligne 68087) : je n'ai pu
confirmer que la jambe RID. Ce point doit être refermé au relevé VOLUBILIS de
l'unité.

## Ce que j'ai confirmé moi-même : 101 faits

### RID 2554, 25 interrogations, 25 concordantes (0 écart)

Toutes les descriptions d'entrée de la leçon sont exactes, y compris les
détails les plus faciles à inventer. Relevé :

1. `ไป` : vedette unique, étiquette `ก.`, premier sens = déplacement à partir
   de celui qui parle, mention explicite d'opposition à `มา`, exemple
   `เขาไปตลาด`, exemple directionnel `เขาเดินไปโรงเรียน`, bloc `ลูกคำ` de
   10 composés. La leçon écrit « une dizaine » : exact.
2. `รถ` : vedette **groupée** `รถ, รถ-`, lecture entre crochets
   `[รด, ระถะ-]`, étiquette `น.`, sens = véhicule à roues, exemples `รถม้า`
   `รถยนต์` `รถไฟ`, origine pālie `(ป.)`. Bloc `ลูกคำ` recompté : **66**
   composés, dont `รถแท็กซี่`, `รถเมล์`, `รถไฟ`. La leçon écrit « plus de
   cinquante » : exact.
3. `แท็กซี่` : deux sens numérotés, (๑) nominal, voiture de louage publique
   avec limite de 7 passagers, `(อ. taxi)` ; (๒) verbal, roulage d'un avion.
   `ลูกคำ` = `แท็กซี่มิเตอร์`. Exact au détail près.
4. `รถเมล์` : vedette autonome, `น.`, sens = véhicule de ligne partant selon un
   horaire fixé, avec mot-tête déclaré par le dictionnaire.
5. `เมล์ ๑` : véhicule de ligne à horaire fixé, exemples `รถเมล์` et
   `เรือเมล์`, `(อ. mail)`. `เมล์ ๒` : sens postal. Exact.
6. `เรือ` : quatre sens numérotés, (๑) embarcation, (๒) pièce du jeu d'échecs
   se déplaçant en ligne droite, (๓) jouet, (๔) grade d'officier de marine ou
   d'aviation. `ลูกคำ` de plus de cent composés. Exact.
7. `ตลาด` : lecture `[ตะหฺลาด]`, `น.`, sens (๑) lieu de rassemblement pour
   acheter et vendre, sens (๒) étiqueté `(กฎ)`, juridique. `ลูกคำ` contient
   `ตลาดนัด`, `ตลาดน้ำ`, `ตลาดสด`. Exact.
8. `ค่ะ` : porte bien les DEUX valeurs, `คำรับ` et mot de clôture poli, avec
   exactement `ไปค่ะ` et `ไม่ไปค่ะ` pour exemples. Exact (voir cependant F5 sur
   ce que la leçon fait dire à cet exemple).
9. `ครับ` : porte bien les deux mêmes valeurs, pour un locuteur masculin.
10. `การันต์` : lettre non prononcée surmontée du signe `ไม้ทัณฑฆาต`. Exact.
11. `ไม้ไต่คู้` : signe qui rend brève la prononciation du mot. Exact.
12. `อักษรต่ำ` : l'entrée énumère bien **24** lettres, et `ท`, `ม`, `ร`, `ล` y
    figurent. Le raisonnement de la page 7 tient.
13. `คัน` : trois vedettes ; `คัน ๑` sens (๓) est bien le `ลักษณนาม` des
    véhicules, avec exactement l'exemple `รถ ๓ คัน`.
14. `ลำ` : trois vedettes ; `ลำ ๑` sens (๑) est bien le `ลักษณนาม` des objets
    longs et des bateaux, avec exactement l'exemple `เรือ ๓ ลำ`.
15. `ที่` : sens (๘) est bien étiqueté `บ.`, glosé par `ณ`, avec exactement
    l'exemple `อยู่ที่บ้าน`.
16. `รถแท็กซี่` : vedette autonome, étiquetée `(ปาก)`, mot-tête déclaré.
17. `รถไฟ` : vedette autonome, mot-tête déclaré.
18. `สถานี` : attestée.
19. `ขึ้น` : deux vedettes ; `ขึ้น ๑` porte exactement **21** sens numérotés.
    La leçon écrit « vingt et un » : exact.
20. `ลง` : attestée.
    21 à 25. Absences vérifiées, toutes confirmées : `ไปที่`, `ไปส่ง`, `รถบัส`,
    `รถโดยสาร`, `เรือด่วน` renvoient tous `ไม่พบคำศัพท์`.

### Wiktionary, 13 relevés, 13 concordants

26. en `ไป` : `/paj˧/`, Paiboon `bpai`, Royal Institute `pai`, verbe « to go ».
27. en `ไป` : la section de thaï du Nord donne bien `/paj˧/` pour Chiang Mai et
    `/paj˧˧˦/` pour Chiang Rai. La leçon décrit exactement cette structure.
28. th `ไป` : **la réserve de portée de la leçon est vraie et vérifiée.** Le
    corps de la page reproduit la définition du RID exemples compris, y compris
    `เขาไปตลาด`, `เขาเข็นเรือไม่ไปเพราะเรือเกยตื้น`, `เขาเดินไปโรงเรียน`,
    `ทำไปกินไป`, `ขาวไป ช้าไป ดีเกินไป` et `คำตรงข้าม มา`. Ne pas la compter
    comme autorité indépendante du RID pour le sens est correct.
29. en `รถ` : `/rot̚˦˥/`, `rót`, `rot`, « wheeled vehicle (of any kind) », note
    d'usage « Generally, wheeled vehicles are classified by the classifier
    คัน », homophones `รด` `รท` (+1), emprunt au pāli `ratha`, du sanskrit
    `रथ`.
30. en `แท็กซี่` : `/tʰɛk̚˦˥.siː˥˩/`, Paiboon `tɛ́k-sîi`, Royal Institute
    `thaek-si`, découpage `แท็ก-ซี่`, étiquette `informal`, classificateur
    `คัน`, exemple `รถแท็กซี่`, emprunt à l'anglais `taxi`, dérivé
    `แท็กซี่มิเตอร์`. **L'observation de la leçon est juste** : la romanisation
    Paiboon écrit `t` là où l'IPA de la même page écrit `/tʰ/`.
31. en `รถเมล์` : `/rot̚˦˥.meː˧/`, `rót-mee`, `rot-me`, `รด-เม`, « bus »,
    étymologie `รถ` + `เมล์`, synonyme `รถบัส`, dérivé `ป้ายรถเมล์`.
32. en `เมล์` : emprunt à l'anglais `mail`, dérivés `รถเมล์` et `เรือเมล์`.
33. en `เรือ` : `/rɯa̯˧/`, Paiboon `rʉʉa`, Royal Institute `ruea`,
    « watercraft: boat; ship », classificateur `ลำ`, second sens « (chess)
    rook ».
34. en `ตลาด` : `/ta˨˩.laːt̚˨˩/`, Paiboon `dtà-làat`, Royal Institute `ta-lat`,
    découpage `ตะ-หฺลาด`, étiquette `economics`.
35. en `์` : citation exacte, « A diacritic in Thai that silences a consonant or
    multiple ».
36. en `็` : citation exacte, « It is used to shorten the written form of the
    vowel เ-ะ to เ-็ ».
37. th `็` : nommé `ไม้ไต่คู้` ; note d'usage exacte,
    `สามารถใช้กับ เ, แ และ อ เป็นสระ เอะ แอะ เอาะ ที่มีตัวสะกด`.
38. th `์` : nommé `ทัณฑฆาต` ; note d'usage exacte,
    `ใช้กำกับพยัญชนะและสระที่ไม่ออกเสียง เรียกพยัญชนะนั้นว่า การันต์`.

Corollaire confirmé sans passer par VOLUBILIS : la ligne « Royal Institute »
de la page `เรือ` donne `ruea`, ce qui donne au graphème proposé `uea` un appui
RTGS **indépendant de la feuille `Romanization`** que la leçon cite.

### FrequencyWords, 10 mesures, 10 exactes

Liste `content/2018/th/th_50k.txt` retéléchargée, 50 000 lignes.

39. `ไป` rang 38, 6 765 occurrences.
40. `รถ` rang 2403, 163.
41. `แท็กซี่` rang 3079, 128.
42. `รถแท็กซี่` absent des 50 000.
43. `รถเมล์` rang 26216, 15.
44. `เมล์` absent des 50 000.
45. `เรือ` rang 4275, 91.
46. `ตลาด` rang 26132, 15.
47. `ไปตลาด` absent des 50 000.
48. `ไปที่` rang 3444, 113, soit 7,53 fois les 15 occurrences de `ตลาด`. La
    leçon écrit « sept fois et demie » : exact.

### Encodage, 8 contrôles

49 à 55. Les sept champs `codepoints` sont exacts, caractère par caractère,
pour `ไป`, `รถ`, `แท็กซี่`, `รถเมล์`, `เรือ`, `ตลาด` et `ผมไปตลาดครับ`. La
normalisation NFC ne change aucune graphie, et le fichier entier est déjà en
NFC. L'ordre logique de `แท็กซี่` est correct (voyelle suscrite avant marque de
ton) et celui de `เรือ` aussi.

56. Aucun tiret cadratin, demi-cadratin, `figure dash` ni `horizontal bar` dans
    le fichier. Règle fondateur ADR-0022 respectée.

### Tons, longueurs et transcription, 21 recalculs

57 à 70. Ton et longueur recalculés pour les 7 items, syllabe par syllabe :
`ไป` moyen bref ; `รถ` haut bref ; `แท็กซี่` haut bref puis descendant long ;
`รถเมล์` haut bref puis moyen long ; `เรือ` moyen ; `ตลาด` bas bref puis bas
long ; `ผมไปตลาดครับ` montant, moyen, bas, bas, haut. Tous concordent avec les
champs de la leçon et avec les lettres tonales des deux éditions de Wiktionary.

71 à 77. Les sept transcriptions sont conformes à `thainaute-fr` v1.1 :
diacritique réservé au ton, posé sur la première lettre du noyau
(`tháek`, `sîi`, `làat`, `rót`, `phǒm`, `khâ`, `khráp`) ; doublement de la
dernière lettre du graphème pour les longues (`ii`, `ee`, `aa`) ; `ai` pour
`/aj/` ; `ae` bref non doublé dans `tháek`. `khàwwp·khoun` est identique à
`u01-l1e` et `sà·wàt·dii` identique à `u02-l2b`.

### Corrigés, 18 recomposés, 18 justes

78 à 95. Exercice 1, six tirages : `เรือ` → un bateau ; `แท็กซี่` → un taxi ;
`รถเมล์` → un bus ; `รถ` → un véhicule ; `รถเมล์` → un bus ; `เรือ` → un
bateau. Aucun distracteur n'est vrai à aucun tirage.
Exercice 2, trois tirages : ordre et jeux de blocs corrects ; les blocs
déclarés « en trop » le sont réellement ; le tirage 3 n'offre effectivement
aucun pronom, ce qui est le bon choix de conception.
Exercice 3, cinq tirages : les cinq réponses et les variantes acceptées sont
conformes à v1.1 ; le refus de `rot me` est justifié par le doublement des
longues, le refus de `rua` par le graphème `ue` (mais voir F9 sur la
justification donnée).
Exercice 4, quatre tirages : `รถ` est bien le bloc commun aux trois mots ;
`รถ|เมล์` et `รถ|แท็กซี่` sont les bonnes coupes ; `เรือ` est bien le seul des
trois à ne pas contenir `รถ`. Les feedbacks sur la voyelle antéposée `เ`/`แ`
sont exacts.

### Renvois internes, 6 contrôles

96. `u01-l1a` établit bien les neuf consonnes moyennes, dont `ต` et `ป` :
    le raisonnement de la page 7 s'appuie sur un fait réellement publié.
97. `u04-l4a`, page 8 : la troisième limite nomme **explicitement** `ไ`, `ใ`,
    `เ-า` et `-ำ` parmi les formes non couvertes. Le motif donné par 5D pour
    écarter `ไป` du domaine de la règle est donc juste, et non inventé.
98. `u03-l3a` enseigne bien `แตะ` (`tàe`).
99. `u03-l3d` enseigne bien `ตัว` avec le graphème `oua`.
100.  `u03-l3e` est bien la scène du marché, avec `ไข่สิบฟอง`, dix œufs.
101.  Les cinq lignes témoins VOLUBILIS et les trois décomptes de feuilles cités
      par 5D sont **identiques** à ceux consignés par `unite-04/lecon-4a.md` :
      la numérotation est au moins cohérente avec l'unité 4, même si je n'ai pas
      pu ouvrir le classeur.

## Findings

### F1. BLOQUANT. Quatre affirmations de phonétique française, aucune source

La politique `docs/content-policy/sources-verification.md` ne référence aucune
source de phonétique du français. La leçon en affirme pourtant quatre fois,
à l'écran ou en `note_fr`, et aucun champ `sources` ne les couvre :

- ligne 156, page 8 : « beaucoup d'oreilles françaises remontent sans le
  vouloir sur la dernière syllabe » ;
- ligne 470, item 6 : « la remontée de fin de mot que le français **impose** » ;
- item 3 : « le mot ne commence donc pas par le t sec du français « taxi » » ;
- ligne 409, item 5, et ligne 82, page 2 : « Commencez par le u de « lu » ».

La formulation la plus exposée est « que le français impose » : elle énonce
comme une contrainte du système ce qui, en français, dépend du contour de
phrase, une déclarative finale descendant au lieu de monter. La leçon n'a
aucun moyen de sourcer cette affirmation dans le cadre du projet.

Défaut adjacent, même nature, sur une bouche thaïe cette fois : la note
culturelle affirme que le `็` de `แท็กซี่` raccourcit la voyelle « pour coller
à ce qu'une bouche thaïe fait naturellement ». Le RID atteste le rôle du signe,
pas la motivation phonologique de l'adaptation de l'emprunt.

**Correction attendue** : retirer les quatre affirmations, ou les remplacer par
une consigne qui ne dit rien du français, ou acquérir une source de phonétique
autorisée et l'ajouter à la politique avant de les rétablir.

### F2. BLOQUANT. L'ancrage articulatoire de la voyelle de `เรือ` est faux

Item 5, `note_fr` : « Commencez par le u de « lu », gardez les lèvres étirées
comme pour un i, puis glissez vers un a. » Page 2 dit la même chose.

Le `u` français de « lu » est `/y/`, une voyelle **antérieure arrondie**. La
désarrondir ne donne pas `/ɯ/`, elle donne `/i/`. La voyelle visée, celle que
Wiktionary note `/rɯa̯˧/` sur les deux éditions, part d'un `/ɯ/` **postérieur
non arrondi** : l'ancrage français correct est le `ou` de « loup », désarrondi,
pas le `u` de « lu ».

Le parcours dit d'ailleurs autre chose partout ailleurs, et la leçon crée donc
une troisième description du même graphème :

- `CONVENTIONS.md` v1 : « `ue` pour /ɯ/ (อือ, préciser en leçon : « i avec les
  lèvres étirées ») » ;
- `u02-l2d`, item `ชื่อ` : « Dites un « i » puis, sans bouger la langue, étirez
  les lèvres » ;
- `u02-l2e` : « la voyelle `uee` est le i des lèvres étirées » ;
- `u04-l4b` : « un i tenu, prononcé les lèvres étirées et non arrondies ».

Un apprenant qui suit la consigne de 5D produira `[i]`. C'est une règle de
prononciation fausse, et elle est en plus non sourcée, donc cumulée avec F1.

**Correction attendue** : aligner sur la formulation du parcours, ou trancher
la description du phonème pour tout le parcours à la consolidation, mais ne pas
laisser 5D introduire un ancrage différent et incorrect.

### F3. BLOQUANT. « รถ ne sert presque jamais seul dans une phrase » : faux

Page 3, ligne 90 : « รถ (rót) veut dire véhicule à roues. Il ne sert presque
jamais seul dans une phrase. » Aucune source n'est attachée à cette affirmation
d'usage, et le dossier de la leçon la contredit trois fois, avec des pièces que
j'ai moi-même vérifiées :

- le RID donne `รถ ๓ คัน` comme exemple à l'entrée `คัน ๑` sens (๓), que la
  leçon cite elle-même : `รถ` y est un nom plein, seul, compté ;
- la section « Items écartés » de la leçon cite `ขึ้นรถ` (VOLUBILIS 34932)
  comme une « expression verbale complète » : `รถ` y est complément d'objet,
  seul ;
- FrequencyWords place le token isolé `รถ` au rang 2403 avec 163 occurrences,
  soit quinze fois plus que `รถเมล์`, alors que la même liste ne contient pas
  `รถแท็กซี่`. J'ai recompté sur le fichier.

L'affirmation est d'autant plus coûteuse qu'elle sert de justification
pédagogique à la page 3 et au SRS `srs-u05-l5d-06`.

**Correction attendue** : supprimer la clause, ou la remplacer par le fait
réellement sourcé, `รถ` est la tête d'une famille de 66 composés au RID.

### F4. BLOQUANT. Deux affirmations pratiques de voyage, non sourcées

- Page 1, ligne 71 : « La personne au volant attend une chose de vous, et une
  seule : où vous allez. »
- Page 8, ligne 152 : « dites simplement le lieu suivi de votre particule, on
  vous comprendra. »

Ce sont des affirmations sur le comportement d'un chauffeur thaï et sur la
réception d'un énoncé par un locuteur natif. Aucune source de la politique ne
les couvre, et la leçon le sait : l'incertitude 7 dit « Aucune source ne dit ce
qu'un passager dit réellement à un chauffeur », et la section « Items écartés »
affirme qu'« aucun écran ne dit comment on hèle un véhicule ». Le dossier
décrit donc une leçon plus prudente que celle qui est écrite.

**Correction attendue** : réécrire les deux ouvertures sans affirmer ce que
fait ou comprend un tiers, et faire coïncider la déclaration du dossier avec le
texte réellement affiché.

### F5. BLOQUANT. Le RID est sur-lu et la page 6 se contredit sur trois lignes

Page 6, lignes 127 à 131 :

> Le dictionnaire normatif donne lui-même ไปค่ะ comme réponse polie complète,
> avec le verbe seul et la particule. Vous pouvez donc raccourcir sans crainte.
> Une réserve honnête : les sources consultées attestent que la forme courte
> existe, elles ne disent pas laquelle des deux formes est préférable devant un
> chauffeur.

Trois défauts, dans trois phrases consécutives :

1. J'ai relevé l'entrée. Le RID donne `ไปค่ะ` et `ไม่ไปค่ะ` comme exemples de
   `คำลงท้ายที่ผู้หญิงใช้ในการบอกให้ทราบอย่างสุภาพ`, un mot de clôture servant
   à **informer** poliment. L'entrée ne présente `ไปค่ะ` ni comme une
   « réponse », ni comme « complète » : ces deux qualifications sont ajoutées.
   Le même ajout est répété dans le `note_fr` de l'item 1, ligne 179.
2. « Vous pouvez donc raccourcir sans crainte » est une recommandation d'usage
   que la phrase suivante déclare précisément non sourçable.
3. La première phrase de la page, avant celles-ci, pose une condition d'emploi
   à zéro source : « Quand la personne en face sait déjà de qui on parle, et
   c'est le cas quand vous êtes seul devant elle, le pronom tombe. » La chute
   du sujet en thaï est réelle, mais la **condition** énoncée n'est appuyée par
   aucune des sources du dossier.

**Correction attendue** : ramener la citation du RID à ce qu'elle dit (`ไปค่ะ`
est un exemple d'emploi de la particule après un verbe seul, sans sujet
exprimé), retirer « sans crainte », et ne pas énoncer de condition d'omission
du sujet tant qu'elle n'est pas double-sourcée.

### F6. BLOQUANT. Déclaration de coordination fausse, et `ไป` enseigné deux fois dans l'unité

La Méta déclare : « au moment de la rédaction, le dossier
`content/authoring/unite-05/` ne contient aucune autre leçon. 5A, 5B, 5C et 5E
n'existent pas encore. » L'incertitude 1 le répète.

Au moment de cet audit, le dossier contient `lecon-5a.md`, `lecon-5b.md`,
`lecon-5c.md`, `lecon-5d.md` et `lecon-5e.md`. La déclaration est donc fausse
telle qu'elle est écrite dans le fichier, et le risque qu'elle annonçait s'est
réalisé :

- `lecon-5b.md`, « Aller, venir, tourner », enseigne **`ไป` comme son item 1**,
  avec dossier de sources complet, page d'enseignement dédiée (page 2) et deux
  prudences d'emploi que 5D ignore, dont « `ไป` lancé seul à quelqu'un n'est
  pas neutre » ;
- 5D enseigne `ไป` comme son item 1, marqué « (nouveau) ».
- `lecon-5c.md`, « Demander son chemin », enseigne `สถานี`, que 5D écarte
  « parce que hors du titre », et traite `ที่` dans `อยู่ที่ไหน` / `อยู่ไหน`,
  c'est-à-dire exactement l'alternance que 5D déclare insourçable pour écarter
  `ไปที่`.

Deux leçons de la même unité introduisent le même verbe comme nouveau. Ce n'est
pas une incertitude à consigner, c'est un conflit à trancher avant `review`.

**Correction attendue** : arbitrer la répartition `ไป` entre 5B et 5D, réécrire
la Méta et l'incertitude 1 sur l'état réel du dossier, et relire 5D contre 5A,
5C et 5E.

### F7. BLOQUANT. `เมล์` glosé « un service » là où le RID donne un véhicule

Deux textes vus par l'apprenant :

- page 3, ligne 92 : « c'est รถ suivi de เมล์, qui désigne un service à horaire
  fixe » ;
- note culturelle : « Le mot ne désigne pourtant pas la poste mais le service à
  horaire fixe. »

J'ai relevé l'entrée. `เมล์ ๑` est défini comme le terme employé pour appeler
un **ยานพาหนะ**, un véhicule de ligne partant à heure fixe. Ce n'est pas le
service, c'est le véhicule. Le champ `sources` de l'item 4 le restitue
d'ailleurs correctement, « le mot désigne un véhicule de service régulier à
horaire fixé » : l'écart est donc entre le dossier, juste, et les deux écrans,
faux. Le `litteral` de l'item 4, « véhicule de service régulier », est juste
lui aussi.

Défaut de rédaction adjacent, même passage : « Le mot ne désigne pourtant pas
la poste » puis « il s'applique aussi bien à la route qu'à l'eau » désignent
deux référents différents, `รถเมล์` puis `เมล์`, sans que le changement soit
visible. Un apprenant peut en conclure que `รถเมล์` s'emploie pour un bateau.

**Correction attendue** : dire que `เมล์` nomme un véhicule de ligne, pas un
service, et fixer le référent dans la note culturelle.

### F8. BLOQUANT. Consigne articulatoire sur le `r` thaï, non sourcée, et déjà signalée en 3B

Item 2, `note_fr`, ligne 235 : « Le r initial est roulé dans la prononciation
soignée et s'affaiblit souvent en parole rapide, comme dans ครับ appris en 1E. »

Aucune des six sources de l'item 2 ne porte sur l'articulation ou sur la
variation de registre du `/r/` thaï. Ce n'est pas un oubli isolé : le
contre-audit de `u03-l3b` a déjà consigné ce défaut comme ouvert, sur une
consigne plus faible que celle-ci, et a proposé deux issues, « acquérir une
source de phonétique thaïe qui décrive ce phonème, ou retirer la consigne ».
5D ne retire pas la consigne : elle l'aggrave, en ajoutant une affirmation de
variation sociophonétique, l'affaiblissement en parole rapide, que la leçon ne
mesure ni ne source.

**Correction attendue** : retirer la clause, ou attendre la source de phonétique
déjà demandée par 3B. En l'état, deux leçons de deux unités différentes portent
la même dette non sourcée.

### F9. Non bloquant. « le graphème `ue` … depuis l'unité 1 » : faux

Exercice 3, tirage 5, ligne 672 : « La réponse `rua` est refusée, le graphème
`ue` notant la voyelle aux lèvres étirées **depuis l'unité 1**. »

Recherche exhaustive sur les cinq fichiers de l'unité 1 : ni `ue`, ni `uee`, ni
`/ɯ/`, ni la formule « lèvres étirées » n'y apparaissent. Le graphème est
introduit en `u02-l2d` (item `ชื่อ`, transcription `chûee`), repris en
`u02-l2e` puis en `u04-l4b`. La justification du refus reste valable, sa
référence est fausse.

### F10. Non bloquant. L'analogie qui justifie `uea` est fausse, et l'arbitrage v1.2 n'est pas rendu à l'écran

Deux défauts sur le même sujet.

1. Méta, ligne 59 : `uea` « suit exactement la logique de `oua` … et de `aao` …
   : la voyelle glissée s'écrit avec ses deux qualités à la suite, **sans
   doublement**. » L'analogie tient pour `oua`, elle est fausse pour `aao` :
   `aao` note `/aːw/` et comporte précisément un doublement, `aa` pour la
   longue plus `o` pour le glissement, ce que `u03-l3b` documente et que le
   `ThaiPhon` de `เก้า` relevé par `unite-04/lecon-4a.md` confirme avec son
   macron. La justification du nouveau graphème s'appuie donc sur une
   description inexacte d'un graphème antérieur.
2. L'arbitrage v1.2 impose que toute leçon présentant ensemble deux voyelles
   dont l'une s'écrit en digramme « montre la paire côte à côte et nomme le
   noyau ». 5D affiche `tháek` (noyau digramme) et `tà·làat` (noyau simple) sur
   les mêmes écrans, mais la comparaison prescrite se trouve seulement dans le
   `note_fr` de l'item 3, une métadonnée, et porte sur `tàe` contre `tháek`,
   deux formes au **même** noyau `ae`, où l'accent ne se déplace pas. La paire
   affichée ne démontre donc rien, et l'obligation n'est pas tenue à l'écran.

### F11. Non bloquant. La leçon se décrit mal elle-même, quatre fois

1. Contrôle Unicode, ligne 1013 : « แท็กซี่ porte trois signes combinatoires
   sur **une même zone verticale** », puis la même phrase décrit `็` au-dessus
   de `ท` et `ี` + `่` au-dessus de `ซ`, soit deux zones. L'incertitude 8 dit
   « deux zones verticales **voisines** », alors que `ท` et `ซ` sont séparés
   par `ก`.
2. Section Dialogue : « 100 % du lexique du dialogue a été enseigné **avant**
   cette leçon », immédiatement suivi de « ou par cette leçon même pour ไป et
   ตลาด ».
3. Même section, ligne 767 : « Les pages 4 et 5 **les** rappellent avant
   l'écoute. » Ni `สวัสดี` ni `ขอบคุณ`, présents au dialogue, n'apparaissent
   sur aucune page d'enseignement de 5D.
4. L'objectif observable parle de « quatre mots de transport », la page 1 de
   « trois façons de vous déplacer », l'exercice 1 de « quatre mots de
   transport du jour » : `รถ` bascule d'une catégorie à l'autre selon le
   passage.

### F12. Non bloquant. La « réserve de longueur » de `เรือ` repose probablement sur une confusion de notation

L'item 5 déclare un conflit de sources : VOLUBILIS et la romanisation Paiboon
donneraient une voyelle longue, tandis que « l'IPA des deux éditions de
Wiktionary écrit `/rɯa̯˧/`, sans marque d'allongement ».

J'ai relevé les deux pages : l'IPA est bien `/rɯa̯˧/`. Mais l'absence de `ː`
n'est pas une prise de position sur la longueur. C'est la notation constante de
Wiktionary pour les trois diphtongues `เอีย`, `เอือ` et `อัว`, où le
diacritique `◌̯` marque l'élément non syllabique final, pas la brièveté ; la
brève correspondante s'écrirait `เรือะ` et n'est pas le mot enseigné. Il y a
donc, très probablement, une source de moins en conflit que ce que la leçon
déclare, et le même raisonnement a déjà été appliqué à `ตัว` en 3D.

Ce n'est pas bloquant, parce que la leçon choisit de ne rien enseigner et de ne
rien réviser sur ce point, ce qui est la décision prudente. Mais l'incertitude 2
doit être reformulée : ce n'est pas un désaccord entre sources, c'est une
question de convention de notation à trancher une fois pour tout le parcours.

## Ce que je n'ai PAS pu vérifier

- **Toutes les références VOLUBILIS** : classeur absent du dépôt, SourceForge
  injoignable depuis cet environnement. Numéros de ligne, marqueurs `ThaiPhon`,
  colonnes `DOM` et feuilles `Codes` et `Romanization` restent invérifiés. Deux
  faits de la leçon n'ont donc qu'une jambe de preuve confirmée par moi.
- **Les quatre requêtes exploratoires** `จอด`, `ท่าเรือ`, `ยานพาหนะ`, `ไฟ` :
  non rejouées, sans effet sur un fait affiché.
- **Le rendu réel des signes combinatoires** de `แท็กซี่` et de `เรือ` sur
  appareil : hors périmètre de cet audit, déjà porté par l'incertitude 8.
- **La naturalité** des répliques 2 et 3 du dialogue : aucune source de la
  politique ne permet de la trancher, la leçon le déclare, cela reste pour la
  revue native.

## Portes de sortie mises à jour

Aux cinq portes déjà listées par la leçon s'ajoutaient, dans cet ordre :

1. résolution des huit findings bloquants F1 à F8 ;
2. arbitrage de la répartition de `ไป` entre 5B et 5D, puis relecture croisée
   avec 5A, 5C et 5E, qui existent désormais ;
3. décision de parcours sur la description articulatoire de `/ɯ/` et sur la
   consigne relative au `r` thaï, toutes deux communes à plusieurs unités ;
4. relevé VOLUBILIS de l'unité 5, qui refermera la seule famille de sources que
   cet audit n'a pas pu rejouer.

### État après la consolidation du 2026-08-03

- Porte 1 : **franchie.** Les huit bloquants sont traités dans la leçon.
- Porte 2 : **partiellement franchie.** `ไป` est arbitré en faveur de 5B et 5D
  le traite désormais en réemploi ; la lecture croisée contre 5B et 5C est
  faite ; celle contre 5A et 5E reste à faire, et deux lignes fausses du contrat
  de Méta de 5E restent à corriger dans 5E.
- Porte 3 : **ouverte.** 5D a retiré ses consignes non sourçables, ce qui
  supprime le défaut sans trancher la question de parcours.
- Porte 4 : **ouverte**, inchangée.

### Contrôles de forme refaits après consolidation

Refaits sur le fichier consolidé le 2026-08-03 : normalisation NFC inchangée sur
l'intégralité du fichier ; zéro tiret cadratin, demi-cadratin, `figure dash` et
`horizontal bar` ; zéro apostrophe droite et zéro guillemet droit, 624
apostrophes typographiques ; transcriptions conformes à `thainaute-fr` v1.1, y
compris les deux formes ajoutées à l'écran, `làat` (noyau `aa`, marque sur la
première lettre du noyau) et `tháek` (noyau `ae`, marque sur la première lettre
du noyau).

`Revue native : en attente` reste affiché partout.
