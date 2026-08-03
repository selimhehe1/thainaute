# Contre-audit adversarial de `lecon-6e.md`

- Date : 3 août 2026
- Fichier audité : `content/authoring/unite-06/lecon-6e.md`
- Posture : adversariale. Aucune source citée par la leçon n'a été crue sur
  parole. Chaque graphie, ton, longueur, IPA, sens, ligne de classeur, rang de
  fréquence, référence externe et renvoi interne au dépôt a été rouvert depuis
  la source primaire pendant cet audit.
- Verdict : **NE PASSE PAS en `review`**. 7 findings bloquants, 5 non bloquants.
- Revue native : en attente (inchangé).

## Méthode de re-vérification

- **RID 2554** : 39 consultations ponctuelles, mot par mot, faites par moi le
  2026-08-03, requête POST unique par graphie sur
  `dictionary.orst.go.th/func_lookup.php` avec
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, requêtes espacées de 1,4 s, agent
  utilisateur identifiant le projet et l'objet du contrôle. Aucune définition
  n'est reproduite ici : seules la présence de la graphie comme vedette, le
  numéro d'acception, la catégorie, la présence d'un exemple ou d'une chaîne
  cherchée, et les listes ลูกคำ / แม่คำ sont consignées par référence.
- **VOLUBILIS.ods v26.2** : exemplaire local revérifié par empreinte, puis
  reparsé en flux depuis l'archive par un parseur expat écrit pour cet audit,
  avec expansion de `table:number-columns-repeated` et
  `table:number-rows-repeated`, aucune normalisation Unicode appliquée aux
  chaînes comparées, numérotation remise à 1 à chaque `table:table`. Les
  48 lignes citées par 6E ont été lues une à une, plus les 13 lignes témoins,
  le bloc `TONES` de `Codes` et cinq recherches de contrôle négatif.
- **Wiktionary** : 14 pages récupérées en rendu (`action=render`) sur les deux
  éditions, les modèles `{{th-pron}}` n'exposant pas l'IPA en wikitexte ; les
  trois recherches `insource` refaites sur `en` et sur `th`.
- **FrequencyWords** `th_50k.txt` : empreinte recalculée, rangs et occurrences
  recomptés depuis l'exemplaire local.
- **Unicode** : les 15 séquences `codepoints` recalculées caractère par
  caractère, stabilité NFC et NFD recontrôlée sur toutes les suites thaïes du
  fichier.
- **Cohérence interne** : les 15 items ont été recalculés ton par ton et
  longueur par syllabe à partir de la classe de consonne, du type de syllabe et
  de la marque, sans reprendre les valeurs du fichier. Les 16 tirages
  d'exercices ont été rejoués contre le dialogue. Les 26 renvois vers les
  unités 1 à 5 et vers l'unité 6 ont été ouverts dans les fichiers cibles.

## Décompte des faits confirmés par moi-même

**292 faits confirmés**, répartis ainsi :

| Bloc                                                                                                          | Confirmés |
| ------------------------------------------------------------------------------------------------------------- | --------- |
| RID : 13 absences de vedette, 26 attestations, acceptions, catégories, ลูกคำ et แม่คำ                         | 39        |
| VOLUBILIS : 48 lignes citées                                                                                  | 48        |
| VOLUBILIS : 2 empreintes SHA-256 et 2 tailles                                                                 | 4         |
| VOLUBILIS : 6 décomptes de feuilles, 1 position de colonne `THA`                                              | 7         |
| VOLUBILIS : 5 lignes `TONES` de `Codes`                                                                       | 5         |
| VOLUBILIS : 13 lignes témoins                                                                                 | 13        |
| VOLUBILIS : 22 énoncés `DOM` contient / ne contient pas `RID`                                                 | 22        |
| VOLUBILIS : 5 contrôles négatifs (combinaisons absentes du classeur)                                          | 5         |
| Wiktionary : 14 IPA et romanisations rendues                                                                  | 14        |
| Wiktionary : 12 faits de structure (particule, étymologies, classificateurs, slang, etc.)                     | 12        |
| Wiktionary : 2 réponses 404 sur « แล้วคุณล่ะ »                                                                | 2         |
| Wiktionary : 6 mesures `insource` sur les deux éditions                                                       | 6         |
| FrequencyWords : 1 empreinte, 1 taille, 28 rangs, 2 absences                                                  | 32        |
| Unicode : 15 séquences `codepoints`, invariance NFC, invariance NFD, 35 caractères, aucun caractère hors bloc | 19        |
| Absence de tiret cadratin et demi-cadratin                                                                    | 1         |
| Tons et longueurs recalculés à la règle pour les 15 items                                                     | 15        |
| Conformité de la transcription à `thainaute-fr` v1.1                                                          | 1         |
| Règle de ton de la classe basse de 6A, et ses 9 exemples de page 10                                           | 2         |
| Corrigés et tirages d'exercices rejoués et justes                                                             | 16        |
| Répartition des particules dans le dialogue (ครับ, คะ, pronoms)                                               | 3         |
| Renvois internes au dépôt ouverts et vérifiés vrais                                                           | 26        |

### La règle de ton de la classe basse énoncée en 6A est JUSTE

C'était le point de contrôle prioritaire, parce qu'une erreur ici aurait
contaminé la lecture de tout le vocabulaire déjà enseigné. Elle ne l'est pas.

La page 9 de `lecon-6a.md` énonce, pour une syllabe VIVANTE et SANS marque de
ton : consonne moyenne → ton moyen, consonne haute → ton montant, consonne
basse → ton moyen. C'est exact : en syllabe vivante non marquée, la classe basse
a bien le ton สามัญ, donc le même ton moyen que la classe moyenne, et seule la
classe haute donne le montant. Les deux limites que la même page maintient sont
exactes elles aussi : la marque de ton commande (ชื่อ, initiale basse ช plus
ไม้เอก, donne bien un descendant) et les syllabes mortes ne sont pas couvertes
(ครับ, มาก).

Les neuf exemples de la page 10 ont été recontrôlés un par un : ยา, คา, พา, ทา,
แพง, ทาน, คน, มา et เรือ ont tous une initiale basse, sont tous vivants, ne
portent aucune marque, et se disent tous au ton moyen. Aucun contre-exemple.

Conséquence pour 6E : les tons des 15 items ont été recalculés à la règle, sans
reprendre les valeurs du fichier, et ils sont tous justes. En particulier
มี moyen, คน moyen, ชาย moyen (basses vivantes non marquées), สอง et สาว
montants (haute vivante non marquée), พี่ et ที่ et นี่ descendants (basse plus
ไม้เอก), น้อง et แล้ว hauts (basse plus ไม้โท), คะ haut (basse morte brève non
marquée), ล่ะ et ค่ะ descendants, หนึ่ง bas (haute หน plus ไม้เอก), อยู่ bas
(อ moyenne plus ไม้เอก), ไกล moyen, มาก descendant (basse morte longue), et les
trois syllabes basses de ฝรั่งเศส.

### Autres faits notables confirmés

- Les **10 absences déclarées au RID** sont exactes, les 10 : น่ะ, พี่ชาย,
  พี่สาว, น้องชาย, น้องสาว, ที่นี่, แล้วคุณล่ะ, มีพี่น้อง, ไกลมาก, กี่คน.
- Les **empreintes VOLUBILIS et FrequencyWords** sont exactes au bit près, et
  les décomptes de feuilles aussi (`Volubilis` 118 573 / 118 571, `Codes`
  257 / 227, `Romanization` 94 / 86).
- Les **48 lignes VOLUBILIS** citées portent bien la graphie, les marqueurs de
  ton, le `LEV`, le `TYPE` et les gloses annoncés, y compris la ligne 49250
  (แล้วคุณล่ะ, `¯laēo -khun \la`, `[แล้ว คุน ล่ะ]`, `A0 B`, `xp`, « Et vous ? »)
  et la ligne 49069 (ล่ะ, `... \la`, `A2 M`, `X`, colonne `DOM` réellement vide).
- Les **22 énoncés sur la colonne `DOM`** sont exacts, un par un. Les jambes
  VOLUBILIS des deux items nouveaux et des deux termes de parenté sont bien
  indépendantes du RID.
- **Wiktionary** : les 404 sur « แล้วคุณล่ะ » sont réels sur les deux éditions,
  et les trois `insource` donnent exactement 0 / 0, 0 / 0, 23 / 31. Les 14 IPA
  citées sont celles qui s'affichent.
- Le **fait de l'incertitude 4** est exact : en.wiktionary donne bien
  « มีน้อง / to have a baby (= to be pregnant) » à l'entrée น้อง, et le RID
  range bien มีท้อง parmi les ลูกคำ de มี.
- La **note culturelle lit correctement le RID** sur คราวพี่ et คราวน้อง : elle
  écrit « dont l'âge paraît celui d'un aîné, ou dont l'âge paraît celui d'un
  cadet », et non « d'âge comparable ». C'est la lecture juste, celle que
  l'audit de 6B a dû exiger de `lecon-6b.md`.
- Les **28 rangs de fréquence** et les 2 absences sont exacts, occurrences
  comprises (ล่ะ 659, แล้วคุณล่ะ 557).
- **Aucun tiret cadratin ni demi-cadratin**, invariance NFC et NFD sur toutes
  les suites thaïes, 15 blocs `codepoints` exacts, 35 caractères distincts sur
  les items et les répliques, aucun caractère hors du bloc Thai.
- Les **16 tirages d'exercices** ont des corrigés justes et des distracteurs
  réellement faux.

## Findings bloquants

### B1. Le contrat d'entrée est faux, et il est vérifiable

La Méta écrit, sous le titre « Contrat d'entrée de l'unité 6, **mesuré et non
supposé** » : « Relevé du 2026-08-03 : le dossier `content/authoring/unite-06/`
existe mais ne contient **aucun autre fichier de leçon** ; `lecon-6a.md`,
`lecon-6b.md`, `lecon-6c.md` et `lecon-6d.md` sont absents du dépôt au moment où
ce fichier est écrit. » L'incertitude 2 répète : « Les leçons 6A à 6D n'existent
pas au 2026-08-03. »

Les quatre fichiers existent. Deux d'entre eux portent une date de modification
**antérieure** à celle de 6E : `lecon-6b.md` 21:17:48 et `lecon-6d.md` 21:20:05,
contre 21:26:14 pour `lecon-6e.md`. La mesure était donc possible au moment où
elle est déclarée impossible, exactement le reproche que 6E adresse elle-même à
5E deux phrases plus haut.

Le contrat, refait par moi ligne par ligne :

| Ligne du contrat                            | Réel                                  | Verdict |
| ------------------------------------------- | ------------------------------------- | ------- |
| 1. มี attendu de 6B, 6C ou 6D               | item 7 de **6B** et item 1 de **6D**  | vrai    |
| 2. พี่น้อง attendu de la même façon         | item 6 de **6D**                      | vrai    |
| 3. พี่ชาย, น้องสาว, พี่ et น้อง de même     | items 3, 4, 5 et 6 de **6B**          | vrai    |
| 4. /ɯ/, /ɤ/ et second bloc des basses en 6A | items 1 à 6 et pages 7 à 10 de **6A** | vrai    |

Les quatre lignes se révèlent vraies, et le compte d'items nouveaux reste donc
bien à deux. Le finding ne porte pas sur la conclusion, il porte sur le fait
qu'un énoncé présenté comme un relevé daté est faux, et qu'il porte à lui seul
la Méta, le compte d'items, la section de recouvrement SRS, l'incertitude 2 et
la justification d'écartement de `association`. Correction attendue : refaire le
relevé, réécrire le contrat en constat vérifié, supprimer l'incertitude 2,
retirer les mentions « attendu de l'unité 6, à confirmer » des items 3 à 6, et
reprendre la phrase « dès que ces leçons existent » du bloc SRS.

Deux conséquences annexes de ce relevé périmé, dans le dossier d'écartement :
เธอ est déclaré appartenir « à 6B à 6D » alors que c'est l'item 5 de **6A** ;
ครอบครัว et กี่คน sont bien en 6D, comme prévu.

### B2. Le sens enseigné de ล่ะ ne tient que sur une jambe, et la citation du RID escamote ce que le RID dit

Le champ `fr` de l'item 1 énonce un sens : « particule finale qui **relance ou
renvoie** ce qui précède **vers l'interlocuteur** ». La page 5 de l'Enseignement
l'affiche à l'écran : « ล่ะ (lâ) est une particule qui se pose à la fin et qui
**rebondit sur ce qui vient d'être dit** ».

J'ai rouvert l'entrée « ล่ะ » du RID. Elle est bien unique, bien de catégorie
ว., elle porte bien deux exemples dont un interrogatif, elle renvoie bien à
เล่า. Mais sa valeur est celle d'un mot qui accompagne le texte qui précède
**pour l'affirmer avec plus de poids** (ยืนยันให้มีน้ำหนักขึ้น). C'est une
valeur d'insistance, pas de renvoi vers l'interlocuteur. L'entrée « เล่า »
porte mot pour mot la même valeur.

La citation de l'item 1 supprime précisément ce segment : elle écrit « décrite
comme un mot qui accompagne le texte qui PRÉCÈDE, avec deux exemples dont un
interrogatif », ce qui laisse croire que le RID est muet sur la valeur alors
qu'il la donne, et qu'elle n'est pas celle qui est enseignée. La seule source
qui porte le sens enseigné est VOLUBILIS ligne 49069. en.wiktionary ne donne que
« alternative form of เล่า », et th.wiktionary recopie la définition du RID, ce
que le fichier reconnaît lui-même. Le sens de l'item 1 est donc **mono-sourcé**.

S'ajoute une contradiction interne : la section « Sources du premier item
nouveau » affirme que « la leçon n'affirme donc jamais que ล่ะ « veut dire »
quelque chose, elle dit seulement ce qu'elle FAIT dans le bloc où elle est
enseignée ». C'est faux deux fois, dans le champ `fr` et sur la page 5.

Correction attendue : restituer la valeur d'insistance dans la citation du RID,
puis soit trouver une seconde jambe pour le sens de renvoi, soit retirer le sens
du champ `fr` et de la page 5 et ne décrire que l'emploi observé dans le bloc.

### B3. « Le thaï n'a pas de petit mot unique pour "oui" » est un absolu non sourcé, contredit par les deux sources que la leçon cite elle-même

Page 7 de l'Enseignement : « Le thaï n'a pas de petit mot unique pour « oui ». »
Exercice 3, feedback incorrect du tirage 3 : « Ne cherchez pas de mot pour dire
oui, **il n'y en a pas**. »

Aucune source n'appuie ces deux phrases, et les sources que la leçon cite
ailleurs disent le contraire :

- RID, entrée « ค่ะ », que l'item 15 cite : le premier segment en fait un
  **คำรับ**, un mot de réponse affirmative, donné comme équivalent de จ้ะ. Le
  fichier le reconnaît lui-même sous le dialogue : « La VALEUR de ค่ะ comme mot
  de réponse affirmative est attestée deux fois, par le RID (คำรับ) et par
  VOLUBILIS ligne 30141 (« oui ») ».
- VOLUBILIS, relevé par moi : ligne 30141 ค่ะ FRA « **oui** ; d'accord ; … »,
  ligne 30140 คะ FRA « **oui** ; … », ligne 38457 ครับ FRA « **oui** ; ouais ».

La leçon affirme donc à l'écran qu'un mot n'existe pas, tout en produisant dans
son propre dossier deux autorités qui le glosent « oui ». Le geste pédagogique
enseigné (répondre en reprenant le verbe interrogé) reste juste et bien
installé par 2B ; c'est la justification absolue qui ne tient pas.

Correction attendue : remplacer l'absolu par ce qui est réellement mesurable et
sourcé, par exemple que le thaï répond couramment en reprenant le mot interrogé,
sans prétendre qu'aucun mot de réponse n'existe.

### B4. Six énoncés sur le français échappent à la section 1 bis, dont deux absolus

La section 1 bis de `docs/content-policy/sources-verification.md` n'admet un
fait de phonétique ou d'usage du français que de deux façons : sourcé deux fois
parmi les sources qu'elle nomme, ou reformulé en observation vérifiable par
l'apprenant. Le fichier ne cite **aucune** source de cette catégorie, contrôle
fait par recherche sur tout le fichier.

Énoncés concernés :

1. Item 3, `note_fr` : « une syllabe plate et longue, **sans aucun piège** de
   production pour un francophone. » Absolu, proscrit par la section 1 bis.
2. Item 5, `note_fr` : « c'est le contraire du **réflexe français, qui voudrait
   la faire monter parce qu'elle finit le mot**. » Énoncé de prosodie française,
   ni sourcé ni reformulé.
3. Item 7, `note_fr` : « deux syllabes montantes … que **l'oreille française
   tend à aplatir**. » Idem.
4. Item 4, `note_fr` : « Difficulté de production pour **une bouche
   française** : deux syllabes longues qui ne bougent pas de la même façon. »
   Idem.
5. Page 8 : « Le mot qui interroge reste tout à la fin, **jamais au début comme
   en français**. » Le second membre est un énoncé sur la syntaxe du français,
   non sourcé, et il est au moins discutable puisque « il est où ? » est courant
   à l'oral. Repris à l'exercice 2, feedback incorrect du tirage 2.
6. Item 2, `note_fr` : « c'est aussi ce qui le rend **difficile à deviner pour
   un francophone, habitué à reprendre le verbe**. » Celui-ci est en plus
   contredit par la leçon elle-même, qui traduit แล้วคุณล่ะ par « Et vous ? » :
   le français dispose exactement du même tour elliptique, ce qui rend le bloc
   facile à deviner et non difficile.

Les cas 1 à 4 sont récupérables en observations vérifiables (« posez la main,
comparez », « enregistrez-vous et écoutez si la fin remonte »), ce que la
section 1 bis autorise explicitement. Le cas 6 demande une réécriture de fond.

### B5. Item 15 : « la particule ne dépend pas de qui parle » contredit le champ `fr` du même item et trois feedbacks de la leçon

Item 15, `note_fr` : « Le repère reste celui de 2B : **la particule ne dépend
pas de qui parle**, elle dépend de ce que fait la phrase. »

Le champ `fr` du même item dit l'inverse : « particules de politesse **d'une
locutrice** ». Et trois feedbacks de la même leçon enseignent l'inverse :

- exercice 1, feedback correct des tirages 5 et 6 : « c'est la dernière syllabe
  qui **vous dit qui parle**, ครับ pour lui, ค่ะ pour elle » ;
- exercice 1, feedback incorrect des tirages 5 et 6 : « ครับ signale un homme,
  ค่ะ et คะ signalent une femme » ;
- exercice 4, feedback incorrect du tirage 2 : « Trois choses à vérifier dans
  cet ordre : **qui parle, une femme** ; ce qu'elle fait, elle affirme ».

J'ai rouvert 2B : la leçon d'origine écrit « une femme qui pose une question dit
คะ » et « affirmation par ค่ะ et une question par คะ ». Elle fait donc dépendre
la particule des deux facteurs, jamais d'un seul. Le repère attribué à 2B n'est
pas celui de 2B, et l'apprenant reçoit dans un même fichier deux règles
incompatibles. Correction attendue : restreindre explicitement l'énoncé au choix
entre les deux formes féminines.

### B6. « Les deux tons que l'unité 1 a désignés comme les plus faciles à confondre » : l'unité 1 en désigne un autre couple

Item 6, `note_fr` : « le mot enchaîne un ton haut et un ton montant,
c'est-à-dire **les deux tons que l'unité 1 a désignés comme les plus faciles à
confondre**. »

J'ai ouvert l'unité 1. La cible phonétique de `u01-l1c` est écrite noir sur
blanc : « discrimination ton moyen contre ton bas, **le contraste le plus
difficile pour une oreille non native** ». Le couple montant contre haut est
bien traité, mais par `u01-l1d`, qui l'introduit comme le « **deuxième** duel de
tons » et le qualifie de « piégeux », jamais de plus confusable.

La leçon attribue donc à l'unité 1 une désignation que l'unité 1 a donnée à un
autre couple. Le repère de production qui suit (« la première syllabe part déjà
en haut et y reste, la seconde part en bas et remonte ») est, lui, exact et
conforme à 1D. Correction attendue : supprimer le superlatif ou l'attribuer à
1D dans les termes de 1D.

### B7. `ปี่` est attribué à 1B ; il est publié par 1C

Méta, ligne Transcription : « le `ii` de phîi est celui de pìi (**ปี่, 1B**) ».

Recherche faite sur tout le dépôt : ปี่ n'apparaît dans l'unité 1 que dans
`lecon-1c.md`, où il est l'item qui porte `transcription : pìi`. `lecon-1b.md`
n'en contient aucune occurrence. La référence pointe la mauvaise leçon.

Les quatre autres renvois de la même ligne sont exacts et ont été vérifiés :
sǎwwng et le `ue` bref de nùeng sont bien en 3B, khâao bien en 4A, sáai bien en
5B, khâ bien en 1E.

## Findings non bloquants

### N1. Le RID `คะ ๒` couvre aussi ซิ et นะ, ce que la citation de l'item 15 gomme

L'item 15 conclut : « Les deux entrées donnent donc la répartition affirmation
contre question, chacune de son côté. » L'entrée `คะ ๒` que j'ai rouverte donne
deux contextes, pas un : après une question ou une expression de doute, **et**
après ซิ ou นะ, avec les exemples เชิญซิคะ et ไปนะคะ, qui ne sont pas des
questions. La règle binaire enseignée reste utilisable au niveau de la leçon,
mais elle est présentée comme ce que donnent les deux entrées, ce qui surestime
la source. À signaler comme simplification assumée plutôt qu'à faire porter par
le RID.

### N2. « ค่ะ trois fois » alors que l'énumération qui suit en donne quatre

Sous le dialogue : « La femme emploie ค่ะ **trois fois**, réplique 2 **deux
fois** et répliques **4 et 8** ». Deux plus un plus un font quatre. Le compte de
คะ, lui, est exact (répliques 4 et 6), ainsi que celui de ครับ (quatre
répliques, deux questions et deux affirmations).

### N3. L'incertitude 4 attribue à la carte SRS 05 une interdiction qu'elle ne porte pas

Incertitude 4 : « la **carte SRS 05 interdit explicitement** cette suite dans
les tirages générés ». La carte `srs-u06-l6e-05` ne dit rien de มีน้อง : elle
énonce « compter des personnes, nom + nombre + คน » et son critère de maîtrise.
L'interdiction figure ailleurs, dans la liste « Hors périmètre » du bloc SRS.
Renvoi à corriger, sous peine de rendre la contrainte de production
introuvable pour qui suit la référence.

### N4. Les cinq leçons nommées au recouvrement SRS ne sont pas celles des cinq cartes

Le bloc SRS écrit : « Les cartes 04, 05, 06, 07 et 09 recouvrent des cartes
existantes de **2B, 3B, 3D, 4D et 5C**. » Les cartes renvoient en réalité à
2B (carte 04), 3D (carte 05), 5C (carte 06), 2B (carte 07) et **5E** (carte 09,
qui déclare elle-même prolonger `srs-u05-l5e-08`, dont j'ai vérifié l'existence
et l'objet). 3B et 4D ne correspondent à aucune de ces cartes, et 5E manque.

### N5. Exercice 3 : une variante vide, un feedback manquant, et un objectif que les exercices ne mesurent pas

- Tirage 3 : « réponse `mii khâ` ; **variante acceptée `mii khâ` seule**, les
  signes de ton restant facultatifs sur `mii` ». La variante est identique au
  corrigé, et `mii` ne porte de toute façon aucun signe de ton en v1.1. La
  clause ne décrit rien.
- Le tirage 4 est le seul des quatre à n'avoir aucun feedback correct, alors que
  le contrat d'autorat en exige un.
- L'objectif observable annonce que l'apprenant « distingue **par écrit**
  พี่ชาย de น้องสาว … sur au moins **3 tirages sur 4** ». L'exercice 4 n'en
  porte que deux (tirages 3 et 4). Les deux autres tirages qui mesurent
  พี่ contre น้อง sont à l'exercice 1, donc à l'écoute et non par écrit. Le
  seuil annoncé n'est pas atteignable en l'état.

## Points mineurs relevés, à corriger au passage

- **« Les quarante graphies de la leçon, items et répliques complètes »** : j'en
  compte 24, soit 16 graphies d'items et 8 répliques. Le décompte voisin, lui,
  est exact : les 35 caractères distincts sont bien 35.
- **คนเดียว « lignes 36910 à 36913 »** : la ligne 36913 porte คนเดียวกัน, un
  autre lemme. Les trois catégories annoncées, n., adj. et adv., sont bien aux
  lignes 36910, 36911 et 36912, et le `LEV A0 B` est bien sur la deuxième.
- **th.wiktionary « ล่ะ » donne deux prononciations**, /laʔ˥˩/ et /laʔ˨˩/, et
  deux romanisations Paiboon, lâ et là. L'item 1 n'en cite qu'une sans le
  signaler. Le ton descendant retenu reste correct, il est confirmé par
  en.wiktionary, par VOLUBILIS et par la règle d'écriture ; c'est la fidélité de
  la citation qui est en cause. Même remarque pour l'entrée « ค่ะ » d'en, qui
  donne aussi /kʰaʔ˨˩/.
- **« Deux de ces vedettes sont numérotées … ไหน ๑ et ไหน ๒, ไหนล่ะ, … »** : le
  RID en donne trois, la troisième étant « ไหน ๓ », un nom de fruit. Le décompte
  de 52 requêtes n'est pas affecté, la formulation si.
- **Note culturelle** : « des mots que l'**on place devant le nom** de
  quelqu'un » vaut pour พี่ (คำนำหน้าชื่อ) mais pas exactement pour น้อง, dont
  l'acception ๑ dit seulement qu'on appelle ainsi une personne d'âge de cadet.
  L'item 6 lit ce point correctement ; c'est la note qui généralise.
- **Item 6 et note culturelle** omettent que l'acception ๑ de น้อง au RID inclut
  aussi les enfants d'un อา ou d'un น้า. Sans conséquence sur ce qui est
  enseigné, mais la citation est partielle.
- **Item 5** ne signale pas que la page en.wiktionary de พี่ชาย porte elle aussi
  un second sens marqué `slang`, alors que l'item 6 le signale pour น้องสาว. La
  symétrie de traitement manque.

## Ce que l'audit n'a pas pu trancher

- La naturalité des six assemblages listés sous le dialogue, มีค่ะ et
  พี่ชายหนึ่งคน en tête. Aucune source autorisée ne la donne, et le fichier a
  raison de la renvoyer à la revue native.
- Le registre exact de ล่ะ. La seule indication reste « less formal than เล่า »
  sur en.wiktionary, source unique, que le fichier a raison de ne pas afficher.
- Si l'on se compte soi-même en répondant à une question sur sa fratrie. Non
  tranché par les sources autorisées, correctement laissé ouvert.

## Conclusion

Le dossier de sources de cette leçon est, sur le plan de l'exécution, le plus
propre que j'aie eu à rouvrir : 292 faits recontrôlés à la source, dont
48 lignes de classeur, 39 consultations du dictionnaire normatif, 14 pages
Wiktionary et 30 rangs de fréquence, sans un seul écart sur les empreintes, les
numéros de ligne, les points de code, les tons ou les corrigés. La règle de ton
de la classe basse de 6A, qui était le risque de contamination le plus grave,
est juste.

Ce qui bloque n'est pas la mesure, c'est ce que le texte fait dire aux mesures :
un contrat d'entrée déclaré mesuré alors qu'il ne l'est pas, une citation du
dictionnaire normatif amputée du segment qui aurait révélé que le sens enseigné
est mono-sourcé, deux absolus posés sur des langues sans source, une règle de
particule qui se contredit à trois endroits, et deux renvois internes qui
désignent la mauvaise leçon. Les sept sont corrigeables sans toucher au
dialogue ni aux exercices.
