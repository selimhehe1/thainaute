# Contre-audit adversarial de `u06-l6c`

- Fichier audité : `content/authoring/unite-06/lecon-6c.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5)
- Consignes appliquées : `content/authoring/CONVENTIONS.md` (amendements v1.1 et
  v1.2), `docs/content-policy/sources-verification.md` (section 1 bis incluse)
- Posture : re-vérification directe de chaque fait, sans faire confiance aux
  sources citées par le dossier. Toutes les consultations ci-dessous ont été
  refaites par l'auditeur le 2026-08-03.

## Méthode réellement employée

1. **RID 2554**, 26 interrogations directes en POST sur
   `https://dictionary.orst.go.th/func_lookup.php`
   (`word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
   `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l'audit,
   requêtes espacées de 1,3 s). Graphies interrogées : คำเป็น, อักษรต่ำ,
   อักษรสูง, อักษรกลาง, มาตรา, เกอว, เขา, เค้า, คุณ, ใจดี, ดีใจ, สูง, นี้,
   คนนี้, สรรพนาม, ดี, น้า, ไหม, พี่, ท่าน, มัน, เธอ, ชื่อ, เขาใจดี, ใจดีมาก,
   สูงมาก. Aucune définition n'est reproduite ici, citation par référence.
2. **VOLUBILIS.ods v26.2**, exemplaire local re-empreinté puis re-parsé en flux
   (expat, expansion de `table:number-columns-repeated` et
   `table:number-rows-repeated`, aucune normalisation Unicode, lignes
   renumérotées à chaque `table:table`). 49 lignes citées par le dossier ont été
   ré-extraites une à une.
3. **Wiktionary** en et th, en wikitexte brut et en rendu, plus l'annexe
   « Appendix:Thai script » et l'API `prop=categories`.
4. **FrequencyWords** `th_50k.txt`, empreinte recalculée et 18 rangs recalculés.
5. **Contrôles locaux** : NFC, `codepoints`, typographie, et relecture des
   leçons amont réellement présentes dans le dépôt (`u04-l4a`, `u05-l5a`,
   `u01-l1d`, `u02-l2e`, `u03-l3d`) ainsi que de `u06-l6a`.

## Décompte

**128 faits re-vérifiés par l'auditeur et confirmés**, dont : 26 relevés RID,
35 relevés VOLUBILIS (empreinte SHA-256 `bb9c5da5…a094cc`, décomptes de lignes
non vides 118 571 / 227 / 86, feuille `Codes` lignes 215 à 220, feuille
`Romanization` lignes 10, 11 et 14), 18 relevés Wiktionary, 20 relevés de
fréquence (empreinte `20e7052f…1b6083`, 50 000 lignes), 15 contrôles locaux
Unicode et typographiques, 14 contrôles de cohérence avec les leçons amont.

Le dossier de production de 6C est, sur le plan de l'exactitude des relevés,
d'une qualité inhabituelle : **aucune référence inventée n'a été trouvée**, et
les valeurs de cellule, numéros de ligne, empreintes et rangs cités sont
reproductibles au caractère près. Les findings ci-dessous portent donc presque
tous sur des **inférences** faites à partir de sources exactes, ou sur des
affirmations d'écran que le dossier ne couvre pas.

## Findings bloquants

### B1. Le corrigé du tirage 5 de l'exercice 3 est faux depuis que 6A existe

`u06-l6a` existe désormais dans le dépôt et enseigne à sa page 9 la troisième
ligne du tableau de ton : consonne BASSE, syllabe vivante, sans marque, ton
MOYEN. Sa page 10 emploie nommément **คน** dans la liste des mots que
l'apprenant peut désormais expliquer.

6C, écrite avant 6A, dit exactement le contraire à l'écran :

- exercice 3, tirage 5, cible คน, réponse déclarée « la règle ne le dit pas » ;
- feedback : « ค est de classe basse, et la règle de 4A ne couvre que les
  initiales moyennes et hautes. Le ton de คน est moyen, **mais vous ne pouviez
  pas le calculer.** »

Après 6A, l'apprenant peut le calculer, et c'est même l'exemple canonique de
6A. Sont également périmés : la ligne de Méta « Ce que la leçon n'ouvre pas :
… la règle de ton des initiales de classe basse », le prérequis « leçon 5A …
page 11 qui dit que la règle de ton de 4A ne couvre pas la classe basse », et
l'objectif observable formulé sur « la règle de ton de 4A ».

Vérifié par l'auditeur : la règle énoncée en 6A est elle-même **juste**
(RID « อักษรต่ำ » : pour une basse, le mot vivant a pour ton de base le ton
สามัญ ; 24 lettres ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ). Le défaut
est donc bien dans 6C, pas dans 6A.

**Correction attendue** : retirer ou reformuler le tirage 5, mettre à jour Méta,
prérequis et objectif pour parler de « la règle de ton » et non de « la règle de
ton de 4A ».

### B2. Page 4 : un exemple de Wiktionary attribué au dictionnaire normatif

Texte d'écran : « Le dictionnaire donne la même construction sur un autre sujet,
คนไทยใจดี ».

Relevé direct de l'auditeur, RID entrée « ใจดี » : vedette unique, classée ว.,
deux sens, et **le seul exemple de l'entrée est une locution figée sur le second
sens**. Le RID ne contient pas คนไทยใจดี. Cet exemple vient de en.wiktionary,
entrée « ใจดี », ce que le dossier écrit correctement à l'item 3 et à l'item 5.

Or dans 6C « le dictionnaire » désigne partout ailleurs le RID (page 3 « le
dictionnaire normatif », page 7 « le dictionnaire normatif », page 8 « le
dictionnaire thaï », page 10 « le dictionnaire illustre par โต๊ะตัวนี้ », relevé
confirmé à l'entrée « นี้ »). La page 4 attribue donc au dictionnaire normatif
une attestation qu'il ne porte pas, sur un écran destiné à l'apprenant.

**Correction attendue** : « le dictionnaire collaboratif » ou une formule qui
nomme la source réelle.

### B3. Page 8 : la substitution du terme de parenté en TROISIÈME personne n'est pas portée par les sources citées

Texte d'écran : « Reprendre น้า, พี่ ou le prénom là où le français mettrait
« il » forme donc une phrase entière et correcte, **et vous l'entendrez.** »

Le dossier appuie ce point sur le Fait D (RID « สรรพนาม ») et le Fait F.
Relevés directs de l'auditeur :

- RID « สรรพนาม » : définition du pronom comme mot employé à la place d'un nom
  déjà dit, illustrée par quatre pronoms dont เขา. Cela définit ce qu'est un
  pronom ; cela n'atteste rien sur l'emploi d'un terme de parenté en position de
  troisième personne.
- VOLUBILIS 73508 : พี่, TYPE `pr.`, USAGE `(inf.)`, FRA « tu ». VOLUBILIS
  73510 : พี่, TYPE `pr. pers.`, FRA « je ; tu ». Ce sont des emplois de
  **première et de deuxième** personne.
- en.wiktionary « พี่ », quatrième sens : titre ou terme d'adresse, et
  auto-désignation par la personne ainsi appelée. Là encore première et
  deuxième personne. La page n'est catégorisée qu'en `Thai terms of address`,
  et **pas** en pronom (contrôle API refait).

Aucune des deux jambes n'atteste donc l'emploi enseigné, qui est celui de la
réplique 4 du dialogue (น้าใจดีมากครับ, « ma tante est très gentille »). Une
attestation existe pourtant dans le dossier, non exploitée à cet endroit : RID
« ท่าน », dont un exemple met un terme de parenté en position de sujet suivi du
pronom. Elle ne suffit pas à elle seule et elle ne porte pas la seconde jambe.

Aggravant : « et vous l'entendrez » est une affirmation d'usage à **zéro
source**, dans une leçon dont la page 9 refuse explicitement toute affirmation
de fréquence faute de source.

**Correction attendue** : ou bien sourcer deux fois l'emploi en troisième
personne d'un terme de parenté, ou bien retirer « et vous l'entendrez » et
présenter la construction comme une possibilité montrée, non mesurée.

### B4. Exercice 3, tirage 6 : une exclusion mono-sourcée, obtenue par argument du silence, qui sanctionne la bonne réponse linguistique

Le dossier écrit : RID « คำเป็น » définit la syllabe vivante comme la syllabe à
voyelle longue sans consonne finale plus les séries กง กน กม เกย เกอว, et
« les formes écrites avec ไ, ใ, เ-า et -ำ n'y figurent pas ».

Relevé direct de l'auditeur : **la citation du texte de l'entrée est exacte.**
L'entrée ne les mentionne pas. Mais l'inférence qui en est tirée ne tient pas :

1. Une absence dans une définition de dictionnaire n'est pas une exclusion. Le
   RID « มาตรา », relevé le même jour, range les syllabes par **ตัวสะกด écrit**,
   et l'analyse traditionnelle place สระอำ, ใอ, ไอ et เอา dans แม่กม, แม่เกย et
   แม่เกอว parce qu'elles portent une finale sonante inhérente. Sous cette
   analyse, เขา est une syllabe vivante.
2. La seconde autorité de ton employée par la leçon elle-même contredit la
   conclusion : Wiktionary donne เขา /kʰaw˩˩˦/, montant, ce qui est **exactement
   la sortie de la règle « initiale haute + syllabe vivante + aucune marque »**.
   Une syllabe morte à initiale haute donnerait un ton bas.
3. Le dossier reconnaît lui-même n'avoir qu'une source (« la limite de la règle
   est elle-même sourcée » renvoie au seul RID, `u04-l4a` n'étant pas une
   source mais une leçon interne). Le contrat d'item exige deux sources
   indépendantes par fait.

Conséquence pédagogique, admise par le fichier dans ses propres « pièges
connus » : « répondre au tirage 6 « ton montant » parce que c'est le bon ton,
alors que la question porte sur ce que la règle permet de conclure ». La leçon
compte donc comme erreur la réponse linguistiquement correcte.

Le défaut est hérité de `u04-l4a` page 8 (relue par l'auditeur : la formulation
y est bien présente, 6C la cite fidèlement). 6C l'aggrave en le transformant en
item noté.

**Correction attendue** : arbitrage au niveau du parcours. Soit une seconde
source recevable est produite pour l'exclusion, soit เขา rejoint le cas général
et le tirage 6 disparaît.

### B5. Page 3 : « en parlant vite, beaucoup de gens » n'est porté par aucune source

Texte d'écran : « En parlant vite, **beaucoup de gens** le disent la voix
perchée, kháo, et deux de nos sources notent cette prononciation familière ».

Relevés directs de l'auditeur :

- en.wiktionary « เขา », wikitexte `{{th-pron|เขา|เค้า:informal}}`, rendu
  /kʰaw˩˩˦/ et [informal] /kʰaw˦˥/, Paiboon kǎo puis káo. L'étiquette est
  `informal`. Rien sur le débit, rien sur le nombre de locuteurs.
- VOLUBILIS, colonne `ThaiPhon` : `/khao = ¯khao` sur les quatre lignes de
  pronom (32702 à 32705) et `/khao` seul sur les quatre lignes nominales (32698
  à 32701). Confirmé ligne à ligne. Là encore, rien sur le débit ni sur la
  fréquence.

La seconde moitié de la phrase est donc irréprochable, la première est une
affirmation d'usage et de fréquence à zéro source, dans la leçon même qui
consacre sa page 9 et son incertitude 4 au refus de ce type d'affirmation.

**Correction attendue** : « une forme familière, notée par deux de nos sources,
se dit la voix perchée » sans quantificateur ni condition de débit.

## Findings non bloquants

### N1. Item 1, champ `registre` : la formule dépasse ce que disent les sources

« Nos sources ne posent aucune marque de politesse ni de familiarité sur ce
mot ». Or la même entrée en.wiktionary porte `{{lb|th|childish}}` sur son second
sens de pronom (« I; oneself »), et `informal` sur la variante เค้า. La phrase
est vraie du **sens de troisième personne** seulement ; elle est fausse « sur ce
mot ». Reformuler en nommant le sens visé.

### N2. La transcription du dialogue emploie un graphème non ratifié, alors que l'audit déclare zéro écart

Réplique 2 : น้อย transcrit `Náwwi`. Le graphème `awwi` pour /ɔːj/ est une
**extension proposée par `u03-l3b`**, explicitement non ratifiée dans
`CONVENTIONS.md` et suspendue à la ratification de `awi` proposé par `u02-l2c`
(3B, incertitude 6 ; 3C, incertitude 4). L'« État des audits » de 6C affirme
pourtant « Aucun écart à v1.1 ni à l'arbitrage v1.2 » et ne nomme que trois
graphèmes du jour, `ao`, `ouu` et `ai`. La notation est cohérente avec le
dépôt, mais la déclaration de conformité est inexacte. Ajouter `awwi` à la liste
des graphèmes employés et renvoyer à l'arbitrage ouvert.

### N3. Contrat d'item : vocabulaire du champ `longueur`

`CONVENTIONS.md` impose `courte` ou `longue`. Les items 2 et 7 écrivent
« brève » (« khon brève », « khoun brève »). Uniformiser, faute de quoi un
compilateur strict rejettera le champ.

### N4. Note culturelle : sous-sens de พี่ mal comptés

« le quatrième sens est glosé « used as a title or term of address », avec deux
sous-sens ». Relevé direct : l'entrée porte **trois** sous-sens `##` sous ce
quatrième sens, le troisième étiqueté `colloquial` pour le supérieur ou le chef.
Le fait soutenu reste vrai ; le décompte est faux.

### N5. Exercice 4, paire 1 : la situation associée introduit une restriction fausse

« เขาชื่ออะไร ↔ vous demandez le nom d'une personne **qui n'est pas devant
vous** ». Le RID définit เขา ๔ comme le mot employé à la place de la personne
dont on parle, sans condition de présence. On peut parfaitement dire เขาชื่ออะไร
d'une personne présente que l'on ne tutoie pas. Le feedback de l'exercice, lui,
est exact. Reformuler la situation en « une personne dont vous parlez, plutôt
qu'à qui vous parlez ».

### N6. Exercice 1, tirage 5 : rupture d'accord dans une option affichée

« la tante, ou l'oncle, est très gentille » sera affiché tel quel. L'accord au
féminin ne peut pas couvrir « l'oncle ». Écrire par exemple « la personne, tante
ou oncle, est très gentille » ou dédoubler.

### N7. Page 8 : généralisation sur le français ni sourcée ni reformulée

« En français, une fois la personne nommée, la phrase suivante prend « il » ou
« elle » presque d'office. » La section 1 bis de
`docs/content-policy/sources-verification.md` n'admet un fait sur le français
que sourcé deux fois, ou reformulé en observation vérifiable par l'apprenant.
Cette phrase n'est ni l'un ni l'autre, et elle porte de surcroît sur une
fréquence, ce que la leçon s'interdit ailleurs. La page 1 (« Le français choisit
entre « il » et « elle » avant même d'ouvrir la bouche ») est dans la même zone,
plus défendable parce qu'un francophone la vérifie immédiatement. Reformuler la
page 8 en invitation à observer.

### N8. Item 5 : la jambe RID du patron « personne + qualité » est plus faible que le dossier ne le dit

Relevé direct : RID « ดี ๒ », troisième sens, est classé **ก.** et son exemple
est de la forme เขา + ดี + complément + มาก. La description du dossier est
exacte, mais le sens invoqué est un emploi **verbal** (« bien agir envers »), et
non un emploi de qualité. La leçon refusant par ailleurs de trancher la nature
de ใจดี et de สูง (incertitude 1), la formulation « le patron personne + qualité
est attesté par deux autorités indépendantes » surestime cette jambe. La seconde
jambe, en.wiktionary avec คนไทยใจดี, est en revanche pleinement valide, et
VOLUBILIS 40064 atteste la suite complète คุณใจดีมาก. Nuancer le dossier.

### N9. Page 5 : « สูง … se dit d'une personne comme d'une montagne » n'est pas hedgé à l'écran

Le dossier déclare honnêtement l'incertitude 2 : la meilleure attestation pour
une personne, chez en.wiktionary, est เขาเป็นผู้ชายตัวสูง, avec ตัว, et les
exemples du RID portent sur un arbre et une montagne (les deux vérifiés). La
seule jambe pour สูง seul appliqué à une personne est VOLUBILIS 98335, glose
« grand », domaine `MEDIC` (vérifiée). L'écran, lui, pose l'équivalence sans
réserve. Aligner l'écran sur le dossier.

## Ce que l'auditeur a tenté de casser sans y parvenir

Ces points ont été attaqués et **tiennent** :

- **Graphies et Unicode.** Les 8 champs `codepoints` recalculés depuis `thai`
  correspondent exactement ; 150 chaînes thaïes distinctes extraites du fichier,
  150 stables en NFC, fichier entier stable en NFC. 0 tiret cadratin, 0
  demi-cadratin, 0 U+2015, 0 U+2212, 0 U+2012, 0 guillemet droit, 567
  apostrophes U+2019, et une seule apostrophe U+0027, à la ligne 472, dans la
  citation verbatim de la colonne `ENG` de VOLUBILIS. L'arbitrage proposé par le
  dossier (exclure les champs `sources` du contrôle plutôt que falsifier la
  citation) est le bon.
- **Tons et longueurs.** Les 8 items ont été recalculés à la main depuis
  l'orthographe et recoupés : เขา montant, คน moyen, นี้ haut, ใจ moyen, ดี
  moyen, สูง montant, คุณ moyen, มาก descendant, ชื่อ descendant, อะ bas, ไร
  moyen, ไหม montant, น้า haut, ไม่ descendant, น้อย haut, ครับ haut, คะ haut,
  ค่ะ descendant. Aucun écart.
- **Transcriptions v1.1.** `khǎo`, `khon níi`, `jai·dii`, `sǒuung`,
  `khǎo jai·dii`, `khǎo sǒuung mǎi`, `khoun jai·dii mâak`, `khǎo chûee à·rai` :
  aucun accent de qualité vocalique, ton porté sur la première lettre du noyau,
  longueur doublée. Conforme, à la réserve N2 près.
- **VOLUBILIS.** Empreinte, décomptes de lignes, feuille `Codes` (216 `-x`
  normal, 217 `¯x` high, 218 `_x` low, 219 `/x` rising, 220 `\x` falling),
  feuille `Romanization` (10 : ข ฃ ค ฅ ฆ = kh à l'initiale ; 11 : ง = ng aux
  deux positions ; 14 : ซ ศ ษ ส ทร = s à l'initiale) et les 49 lignes citées :
  toutes conformes, valeur par valeur, y compris 40064 คุณใจดีมาก et 8597
  ชื่ออะไร.
- **L'écart de numérotation signalé à l'incertitude 9 est réel.** L'extraction
  indépendante de l'auditeur donne 55172 pour มาก, et la ligne 53109 porte
  แม่ม่ายลองไน. `u04-l4d` est donc bien à corriger, pas 6C ni 5A.
- **L'incertitude 7 est fondée.** Le dossier de `u02-l2e` conclut bien « Aucune
  entrée dédiée n'existe pour le bloc » sur la seule foi de deux 404 Wiktionary,
  alors que VOLUBILIS 8597 atteste ชื่ออะไร.
- **Fréquences.** Empreinte du fichier, 50 000 lignes, et les 18 rangs cités
  recalculés : คุณ 46, เขา 225, ใคร 228, ชื่อ 608, คนนี้ 2448, สูง 2494, เค้า
  3557, น้า 7226, ใจดี 11169, เก่ง 12208, พี่ 165, มาก 1301, ครับ 10, ห้า 1118,
  หก 1684, หิว 8183, ผัก 27047, ผัด et ข้าวผัด absents. Tous concordants.
- **Décompte RID.** Les quatre absences déclarées (คนนี้, สูงมาก, เขาใจดี,
  ใจดีมาก) sont vérifiées absentes. Le contrôle négatif sur เค้า est exact :
  trois vedettes, aucune de valeur pronominale.
- **คุณ en troisième personne.** RID « คุณ ๑, คุณ- », sixième sens, classé ส.,
  deuxième personne puis, sous la marque de langue parlée, troisième personne
  avec un exemple sur une personne absente. en.wiktionary : `Pronoun` étiqueté
  `colloquial` et `polite`, glosé « a second or third person pronoun, used out
  of respect », page catégorisée **à la fois** en `Thai second person pronouns`
  et `Thai third person pronouns` (contrôle API). Deux autorités indépendantes,
  même réserve de registre des deux côtés. L'ambiguïté assumée du tirage 4 de
  l'exercice 1 est donc fidèle aux sources.
- **Prérequis et renvois internes.** `u04-l4a` page 6 (consonne initiale qui
  n'est pas la première lettre) et page 8 (marque de ton, classe basse, formes
  ไ ใ เ-า -ำ), `u05-l5a` page 11, `srs-u04-l4a-05`, `u01-l1d` items 6 et 8,
  `u03-l3d` item 1, `u02-l2e` item 7, statut publié de คะ (2E), ค่ะ (1E), ไม่
  (4D), น้า (1D) : tous vérifiés, tous exacts. `u06-l6b` ne contient aucune
  occurrence de เขา, la première des trois vérifications de séquence annoncées
  par le dossier passe donc.

## Verdict

**Non publiable en l'état.** Cinq findings bloquants, dont un (B1) créé par
l'arrivée de 6A après la rédaction de 6C, un (B4) hérité de `u04-l4a` et à
arbitrer au niveau du parcours, et trois (B2, B3, B5) internes à 6C et
corrigeables sans rouvrir d'autre leçon.

Le fichier reste `draft`. Revue native : en attente.

## Suite donnée (ajout de la consolidation du 3 août 2026)

Ce rapport n'est pas modifié : il reste la trace de l'audit tel qu'il a été
rendu. La résolution des quatorze findings est consignée dans
`content/authoring/unite-06/lecon-6c.md`, section « Dossier de production »,
sous-section « État des audits », une ligne par finding.

Résumé : B1 corrigé, B2 référence retirée et fait re-attribué à sa source
réelle, B3 fait supprimé sans attestation de remplacement et page réécrite sur
un fait plus faible mais double-sourcé, B4 fait supprimé et exercice remplacé,
B5 supprimé ; N1, N3, N4, N5, N6, N9 corrigés ; N2 déclaration de conformité
corrigée et arbitrage renvoyé ; N7 reformulé par la voie de l'observation
vérifiable ; N8 jambe retirée.

Trois arbitrages sont ouverts par cette consolidation et ne peuvent pas être
tranchés depuis une leçon : la page 8 de `u04-l4a` sur les formes ไ, ใ, เ-า et
-ำ (incertitude 15 de 6C, issue de B4), la ratification du graphème `awwi` dans
`CONVENTIONS.md` (incertitude 16, issue de N2), et la portée de la section 1 bis
de `docs/content-policy/sources-verification.md` pour les faits non phonétiques
sur le français (incertitude 17, issue de N7). Ni `CONVENTIONS.md`, ni
`sources-verification.md`, ni `u04-l4a` n'ont été modifiés.

Le fichier reste `draft`. Revue native : en attente.
