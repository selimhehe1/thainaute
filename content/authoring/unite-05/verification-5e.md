# Contre-audit adversarial de `unite-05/lecon-5e.md`

- Date : 2026-08-03
- Auditeur : agent de contre-audit interne, consignes adversariales
- Objet : trouver des erreurs, pas confirmer. Chaque fait a été revérifié à la
  source, sans faire confiance aux relevés du fichier audité.
- Verdict : **ne peut pas passer en `review`**. 6 findings bloquants, 6 non
  bloquants.

## Méthode réellement employée

- **RID 2554** : 32 consultations ponctuelles, mot par mot, faites par moi le
  2026-08-03, requête POST unique par graphie sur
  `dictionary.orst.go.th/func_lookup.php` avec
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, requêtes espacées de 1,3 s, agent
  utilisateur identifiant le projet et l'objet du contrôle. Aucune définition
  n'est reproduite ici : seules la présence de la graphie comme vedette, la
  lecture entre crochets, le numéro d'acception et la présence d'une chaîne
  recherchée sont consignées par référence.
- **Wiktionary** : 26 pages récupérées en wikitexte brut (`action=raw`) et
  18 en rendu (`action=render`), pour contrôler que les IPA et les
  romanisations Paiboon citées sont bien celles qui s'affichent, le gabarit
  `{{th-pron}}` ne les contenant pas. Recherche `insource` refaite sur les deux
  éditions.
- **VOLUBILIS.ods v26.2** : exemplaire local revérifié par empreinte, puis
  reparsé en flux depuis l'archive par un parseur expat écrit pour cet audit,
  avec expansion de `table:number-columns-repeated` et
  `table:number-rows-repeated`, aucune normalisation Unicode, numérotation
  remise à 1 à chaque `table:table`. Les 40 lignes citées par 5E ont été lues
  une à une, plus 16 lignes de `Romanization` et le bloc `TONES` de `Codes`.
- **Unicode 17.0** : `UnicodeData.txt` local, noms normatifs et points de code
  recalculés.
- **FrequencyWords** `th_50k.txt` : rangs et occurrences recomptés.
- **Cohérence interne** : les 15 items ont été recalculés ton par ton et
  longueur par syllabe à partir de la classe de consonne, du type de syllabe et
  de la marque, sans reprendre les valeurs du fichier ; les 13 corrigés
  d'exercices ont été rejoués contre le dialogue.

## Décompte des faits confirmés par moi-même

**193 faits confirmés**, répartis ainsi :

| Bloc                                                                                                            | Confirmés |
| --------------------------------------------------------------------------------------------------------------- | --------- |
| Faits RID (vedettes, lectures, acceptions, ลูกคำ, แม่คำ, absences)                                              | 32        |
| Faits Wiktionary (IPA rendues, Paiboon, gloses, exemples, 404, insource)                                        | 23        |
| VOLUBILIS (2 empreintes, 3 décomptes de feuilles, 5 lignes `TONES`, 16 lignes `Romanization`, 40 lignes citées) | 66        |
| Unicode et NFC (15 séquences d'items, 15 noms normatifs, stabilité NFC globale)                                 | 31        |
| Rangs et occurrences FrequencyWords                                                                             | 9         |
| Lignes du contrat de dépendance vérifiées vraies contre 5A à 5D                                                 | 3         |
| Corrigés d'exercices rejoués et justes                                                                          | 13        |
| Tons et longueurs recalculés à la règle pour les 15 items                                                       | 15        |
| Absence de tiret cadratin et demi-cadratin                                                                      | 1         |

## Findings bloquants

### B1. Le contrat de dépendance est faux, et il est désormais vérifiable

La Méta affirme : « Au moment où ce fichier est écrit,
`content/authoring/unite-05/` ne contient aucune autre leçon. Les leçons 5A,
5B, 5C et 5D ne sont pas écrites. » Les quatre fichiers existent
(`lecon-5a.md`, `lecon-5b.md`, `lecon-5c.md`, `lecon-5d.md`), et deux d'entre
eux portent une date de modification antérieure à celle de 5E. L'incertitude 1,
qui déclare la vérification « IMPOSSIBLE aujourd'hui », est donc caduque : la
vérification est possible, je l'ai faite, et **deux des cinq lignes sont
fausses**.

| Ligne du contrat                                                     | Réel                                                                                     | Verdict  |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| 1. 5B publie ตลาด                                                    | ตลาด est l'item 6 de **5D** ; 5B publie ไป, มา, เลี้ยว, เลี้ยวซ้าย, เลี้ยวขวา, ตรง, หยุด | **FAUX** |
| 2. 5C publie อยู่, ที่ไหน et le patron                               | items 1, 2 et 3 de 5C                                                                    | vrai     |
| 3. 5D publie ตรงไป                                                   | absent de 5D, absent des quatre leçons                                                   | **FAUX** |
| 4. 5A traite /h/ initial, finales retenues, bloc de consonnes basses | conforme à la Méta et à l'objectif de 5A                                                 | vrai     |
| 5. aucune des quatre ne publie ไกล ni ไม่ไกล                         | 0 occurrence de ไกล dans les quatre fichiers                                             | vrai     |

Conséquence directe : l'étiquette « (dépendance 5B) » de l'item 4 et
l'étiquette « (dépendance 5D) » de l'item 8 sont deux renvois internes faux.

### B2. ตรงไป n'est publié par aucune leçon, et 5B l'a explicitement retiré

C'est le finding le plus lourd. 5B contient une section entière, « Le cas ตรงไป,
et pourquoi la leçon s'arrête où elle s'arrête », qui conclut au **retrait** du
mot pour insuffisance de sources, et qui prescrit que « la forme n'apparaît donc
dans aucune page d'enseignement, aucun item, aucun exercice et aucune carte SRS,
et **aucun écran ne mentionne son existence** ». 5B demande là-dessus un
arbitrage du fondateur.

5E fait exactement l'inverse : item 8, réplique 4 du dialogue, tirage 2 de
l'exercice 1, carte `srs-u05-l5e-06`, page 8 et cible phonétique.

Il faut être précis sur qui a raison, parce que les deux fichiers s'appuient sur
le même RID consulté le même jour :

- 5B écrit que l'absence de vedette « n'est pas compensée par un exemple » et
  que l'entrée ตรง ne contient ตรงไป qu'à l'intérieur de ตรงไปตรงมา. Ce constat
  est exact **pour la seule entrée ตรง**, que j'ai relue : la chaîne n'y figure
  que dans l'acception (๔).
- 5E écrit que le RID emploie lui-même ตรงไป dans la définition de six vedettes
  indépendantes. **J'ai interrogé les six, et les six confirment**, y compris la
  numérotation citée : ชี้ acception (๒), พุ่ง, ลัด ๑ acception (๑), เล็ง
  acception (๑), จ้อง ๒ avec ตรงไปยัง, et โคน ๓ avec เดินตรงไปข้างหน้า. J'ai
  aussi confirmé สูด, que 5E déclare vérifiée mais non citée. La recherche
  `insource:"ตรงไป"` que 5E dit avoir faite donne bien 9 pages sur en et 47 sur
  th, chiffres que j'ai reproduits à l'unité près.

Autrement dit, **le dossier de preuve de 5E est le bon et celui de 5B est
sous-cherché**. Cela ne rend pas 5E publiable pour autant :

1. tant que 5B tient, aucune leçon de l'unité n'enseigne ตรงไป, donc 5E
   introduit un **troisième item nouveau** non déclaré, ce qui contredit
   « Items nouveaux : **deux** » et « deux items nouveaux, et deux seulement » ;
2. la phrase « Compréhension : 100 % du lexique du dialogue est soit enseigné
   avant cette leçon [...] soit enseigné plus tôt dans l'unité 5 pour ตลาด,
   อยู่, ที่ไหน et ตรงไป » est fausse en l'état ;
3. l'unité expédierait deux décisions éditoriales contradictoires sur le même
   mot, prises le même jour, sur la même source.

À arbitrer avant toute mise en `review`, et l'arbitrage doit remonter dans 5B,
dont le bloc de retrait et l'incertitude 1 sont à rouvrir.

### B3. Affirmations phonétiques sur le français sans aucune source autorisée

`docs/content-policy/sources-verification.md` n'autorise aucune source portant
sur la phonétique du français. Le fichier en affirme pourtant trois, dont deux à
l'écran :

- page 6, écran : « Un francophone a le réflexe inverse : il fait exploser sa
  consonne finale. » C'est une affirmation d'articulation sur le français, non
  sourcée ;
- item 15, `note_fr`, écran : « Ne pas remonter sur la fin comme le ferait un
  "de rien" français. » Affirmation d'intonation sur le français, non sourcée ;
- exercice 1, pièges connus : « entendre ไกลไหม comme une affirmation parce que
  le français marquerait la question par l'intonation ». Non sourcée, et elle
  sert de justification à la conception du tirage.

Aucun des blocs `sources` du fichier ne couvre ces trois faits, et aucune source
de la politique ne le pourrait en l'état. Soit une source recevable est ajoutée
à la politique et citée deux fois, soit ces phrases sont récrites en consigne
d'exécution sur le thaï, sans énoncer ce que fait une bouche française. Les
tournures de comparaison purement syntaxiques du fichier, sur la place du mot
interrogatif, ne sont pas concernées : elles portent sur la grammaire française,
pas sur sa phonétique.

### B4. « Trois syllabes de suite en /aj/ » dans ไกลไหมคะ : il y en a deux

Affirmé deux fois, dont une à l'écran :

- item 3, `note_fr` : « Trois syllabes de suite en /aj/ dans la réplique
  complète, sur trois tons différents, c'est le vrai exercice d'oreille de la
  leçon » ;
- Production audio : « La réplique 5, ไกลไหมคะ, contient trois syllabes en /aj/
  sur trois tons différents. »

La réplique 5 est ไกลไหมคะ, soit klai `/klaj˧/`, mǎi `/maj˩˩˦/` et khá
`/kʰaʔ˦˥/`. La troisième syllabe est `/kʰaʔ/`, pas `/aj/` : le fichier le dit
lui-même à l'item 11, dont l'IPA est `/kʰaʔ˦˥/`. Il y a **deux** syllabes en
/aj/, sur deux tons, moyen puis montant.

Le défaut n'est pas cosmétique : la note d'item annonce à l'apprenant un
contraste d'oreille à trois termes qui n'existe pas, et la consigne de
production audio demande de préserver trois contours au lieu de deux.

### B5. Exercice 4 : la différence entre ไ et ใ est localisée au mauvais endroit

Le feedback incorrect du tirage 3 dit : « Regardez deux endroits précis. **En bas
à gauche** : la voyelle de tête a-t-elle une seule boucle, ไ, ou une boucle en
plus vers l'intérieur, ใ ? En haut : y a-t-il une marque au-dessus de la
ligne ? »

La boucle supplémentaire de ใ est **en haut**, pas en bas à gauche. Les deux
lettres partagent la même boucle de base, et c'est le sommet qui les sépare.
Source : en.wiktionary, entrée « ไม้ม้วน »,
https://en.wiktionary.org/wiki/ไม้ม้วน, relevée le 2026-08-03, qui donne
l'étymologie ไม้ + ม้วน et précise que le nom renvoie à l'aspect enroulé du
symbole **on the top** ; l'entrée « ใ » de la même édition confirme que ใ est
traditionnellement nommée ไม้ม้วน et « ไ » qu'elle est nommée ไม้มลาย.

L'effet est le pire possible pour un feedback correctif : l'apprenant est envoyé
regarder la seule zone où les deux lettres sont identiques, et la zone qui les
distingue réellement lui est présentée comme réservée à la marque de ton. Cela
défait l'exercice 4, qui est le seul à mesurer cette discrimination, et la carte
`srs-u05-l5e-02`, qui la mesure sur six spécimens.

### B6. Item 6 : l'entrée RID « ที่ไหน » est mal citée

L'item 6 écrit : « RID 2554, entrée "ที่ไหน" [...] premier sens interrogatif de
lieu concordant, avec un exemple construit sur ไป ».

J'ai relu l'entrée. Son acception (๑) est une série de gloses en แห่งใด,
แห่งใดแห่งหนึ่ง et แห่งใดก็ตาม, et l'exemple qui l'illustre est ไปที่ไหนก็ได้,
c'est-à-dire précisément la lecture **indéfinie**, « n'importe où », et non la
lecture interrogative. L'acception (๒) est une valeur rhétorique de doute.
L'entrée ne donne aucun exemple interrogatif. La corroboration va dans le même
sens : VOLUBILIS ligne 105532, que j'ai lue, glose ที่ไหน par « où que ce soit »
en français et « wherever ; how on earth » en anglais, et non par « où ».

Le sens enseigné reste juste, et il est correctement établi ailleurs dans le
même item : le RID atteste la valeur interrogative à l'entrée ไหน ๑, avec les
exemples คนไหน, อันไหน et ที่ไหน, ce que j'ai confirmé, et en.wiktionary donne
ที่ไหน comme pronom interrogatif « where? ». C'est donc la **description de la
source**, pas le fait, qui doit être corrigée : en l'état, un relecteur croit
que l'autorité n° 1 valide la glose interrogative sur cette entrée, ce qu'elle
ne fait pas. Le champ `fr` de l'item devrait s'appuyer explicitement sur ไหน ๑
et sur en.wiktionary, et l'entrée ที่ไหน être citée pour ce qu'elle donne
réellement, la vedette autonome, la catégorie น. et le rattachement à แม่คำ ที่,
tous trois vérifiés et exacts.

## Findings non bloquants

### N1. Le décompte RID auto-déclaré ne se recompute pas

Le dossier annonce « 52 graphies interrogées en 52 requêtes, 0 erreur de
requête, 46 attestées et 6 absentes », et précise « Décompte recomputable depuis
les trois listes ci-dessous ». Je l'ai recomputé :

- liste « attestées et retenues comme preuve », annoncée à 28 : **27** membres
  réels (21 graphies plus les six vedettes ชี้, พุ่ง, ลัด, เล็ง, จ้อง, โคน ;
  l'occurrence de ตรงไป dans cette phrase est le mot commenté, pas un membre) ;
- liste « attestées, non retenues », annoncée à 18 : **19** membres réels
  (12 graphies plus les 7 lettres de la classe basse) ;
- liste des absences, annoncée à 6 : 6, exact.

Les totaux 46 et 52 sont justes, les deux sous-totaux sont chacun faux d'une
unité, en sens inverse. À corriger en 27 et 19.

### N2. Production audio : la locutrice n'a pas cinq répliques

« Cinq répliques distinctes sont enregistrées par la voix féminine ». Le
dialogue compte 8 répliques, 4 pour la locutrice (1, 3, 5, 7) et 4 pour le
locuteur. La feuille de session doit être refaite sur 4, ou le décompte des
huit segments explicité s'il inclut des reprises isolées.

### N3. Une absence RID affirmée sans consultation consignée

Le dossier d'écartement écrit : « ตรงนี้, ตรงนั้น, ทางนี้, ไปไหน et อยู่ไหน,
ÉCARTÉS. Aucun n'a d'entrée au RID (contrôlé le 2026-08-03 pour les quatre
premiers [...]) ». Or la liste des 6 absences contient ตรงนี้, ตรงนั้น, ไปไหน et
อยู่ไหน, et **pas** ทางนี้ : les quatre contrôlés ne sont donc pas « les quatre
premiers », et ทางนี้ n'a été interrogé nulle part dans le journal des 52
requêtes. J'ai fait la requête manquante : ทางนี้ est bien absente du RID, donc
l'affirmation est vraie, mais elle n'était pas couverte par la preuve. À
reformuler.

### N4. Le champ `longueur` n'emploie pas le vocabulaire du contrat d'item

`CONVENTIONS.md` fixe `longueur` : par syllabe, valeurs « courte, longue ». Les
15 items de 5E écrivent « brève » partout, là où 5D écrit « courte » pour le
même mot ตลาด. Sans conséquence linguistique, mais la compilation vers
`packages/content` lira deux vocabulaires différents pour un champ contraint.

### N5. Page 4 : une valeur prêtée au dictionnaire qu'il ne donne pas

« C'est le "oui" et le "je vous écoute" d'un homme, et le dictionnaire lui donne
exactement ces deux emplois, celui de réponse et celui de fin de phrase. »
L'entrée RID « ครับ », que j'ai relue, donne bien la lecture [คฺรับ], la
catégorie ว. et les deux emplois de คำรับ et de คำลงท้าย ; ce point est exact et
confirmé. Mais « je vous écoute » n'est pas dans la source, et le fichier
l'admet lui-même en fin de section Dialogue, où la convenance de ครับ seul comme
accusé de réception est classée « fait d'usage, pas de dictionnaire ». La phrase
d'écran doit cesser de faire porter « exactement » sur les deux gloses
françaises.

Détail de même nature, sans gravité : l'item 10 dit que la citation
d'en.wiktionary rend ครับ par « Yea, I know it ». J'ai relu la citation de
2 Rois 2:3 : ครับ y correspond au seul « Yea », le reste de la glose traduisant
ข้าพเจ้าทราบแล้ว. L'emploi autonome, lui, est bien attesté.

### N6. Renvois vers 5B et 5D erronés en cascade

Conséquences de B1, à corriger avec lui :

- « เลี้ยวซ้าย et เลี้ยวขวา [...] restent disponibles pour 5D » : elles sont
  publiées par 5B, items 4 et 5 ;
- « ห้องน้ำ, โรงแรม, ร้าน, สถานี, ถนน et ทาง [...] relèvent de 5B » : ห้องน้ำ et
  สถานี sont les items 5 et 6 de **5C** ;
- incertitude 5 : « la recommandation explicite est que 5B retienne ห้องน้ำ ».
  La recommandation est sans objet, 5C le publie déjà, ce qui répare d'ailleurs
  le manque de /h/ initial signalé.

Autre imprécision isolée : l'item 4 cite « La ligne 105836 [de VOLUBILIS] donne
le syntagme ที่ตลาด ». La ligne existe et glose bien « au marché », avec
ThaiRom `thī talāt` et ThaiPhon `\thī _ta_lāt`, mais sa cellule `THA`, telle que
mon parseur la lit, contient ตลาด et non ที่ตลาด. À revérifier avant de
maintenir la citation sous cette forme.

## Ce que l'audit n'a pas réussi à faire tomber

Il faut le dire aussi nettement que les défauts, parce que cela oriente la
correction : **le sourçage linguistique de ce fichier est exact partout où j'ai
pu le contrôler**, et il l'est à un niveau de détail inhabituel.

- Les 15 blocs `codepoints` sont exacts caractère par caractère ; les 205
  séquences thaïes distinctes du fichier sont NFC-stables et sans marque hors
  ordre canonique ; les 15 noms normatifs cités concordent avec
  `UnicodeData.txt`.
- Les 9 rangs FrequencyWords sont exacts, y compris les 41 occurrences de
  ตรงไป.
- Les empreintes VOLUBILIS concordent au bit près, archive comme `content.xml`,
  ainsi que les décomptes 118 573 / 118 571, 257 / 227 et 94 / 86. Les 40 lignes
  citées, les 16 lignes de `Romanization` et le bloc `TONES` en lignes 215 à 220
  sont exacts, colonne par colonne, gloses françaises comprises.
- Les IPA et les romanisations Paiboon attribuées à Wiktionary sont exactement
  celles que les pages rendent, pour les 18 vérifiées. Les 404 annoncés
  (en et th pour ตรงไป, th pour ที่ไหน) sont réels. Les exemples cités existent
  au mot près, y compris สนามบินอยู่ใกล้สถานีรถไฟฟ้า, les trois exemples de
  ที่ไหน, Proverbes 9:15 dans « ร้องเรียก » et Zacharie 6:6 dans « ประเทศ ».
- Aucune référence inventée n'a été trouvée. Les citations RID les plus exposées,
  ที่ acception (๘) avec อยู่ที่บ้าน, ไม่ avec la contrainte de หา, ไหม ๒ avec
  l'exemple sur กิน, ขอโทษ et ขอบคุณ groupées avec leur variante déférente et
  leur note de registre, แห่ง comme ลักษณนาม, les trois composés de ตลาด, sont
  toutes exactes.
- L'incertitude 7 est fondée : la vedette ไหม ๒ porte bien un exemple de la
  forme verbe + ไหม construit sur กิน. La correction B4 de `u04-l4e` est donc à
  rouvrir, comme 5E le demande.
- Les 15 items ont le bon ton et la bonne longueur, recalculés à la règle sans
  reprendre le fichier, et les 13 corrigés d'exercices sont justes, distracteurs
  compris. La transcription respecte l'amendement v1.1, marque de ton sur la
  première lettre du noyau vocalique comprise, et ne crée aucun graphème.
- Aucun tiret cadratin ni demi-cadratin. Aucune information pratique de voyage
  non sourcée : la note culturelle s'abstient explicitement, et cette abstention
  est justifiée.

## Porte

Le fichier reste `draft`. Aux trois lignes déjà marquées NON FAIT, NON PRÉPARÉ
et IMPOSSIBLE dans l'état des audits, il faut substituer ceci :

1. B1 et B2 se traitent ensemble, et ils remontent dans 5B et 5D. Tant que
   l'unité n'a pas tranché qui publie ตรงไป, ou s'il est retiré, 5E n'a pas de
   dialogue valide.
2. B3, B4, B5 et B6 sont des corrections locales à 5E, sans dépendance externe.
3. N1 à N6 sont des corrections de dossier et de renvois.
4. La revue native reste EN ATTENTE et doit continuer d'être affichée telle
   quelle.
