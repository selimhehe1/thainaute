# Contre-audit adversarial de la leçon 2D

- Fichier audité : `content/authoring/unite-02/lecon-2d.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5), mandat explicite de
  chercher des erreurs et non de confirmer le travail
- Méthode : re-vérification directe de CHAQUE item, sans reprendre les
  constatations du rédacteur. 24 URL ouvertes par WebFetch le 2026-08-03,
  codepoints recalculés localement par script Python, tons recalculés de façon
  indépendante par les règles de classe consonantique, corrigés d'exercices
  rejoués un par un.
- Verdict global : la leçon NE PEUT PAS passer en `review`. 5 findings bloquants,
  7 findings non bloquants. Aucune source inventée n'a été trouvée : c'est le
  point fort du dossier.

## 1. Ce que j'ai confirmé moi-même

68 faits vérifiés indépendamment et confirmés.

### 1.1 Unicode (12 confirmations)

Script Python, comparaison caractère par caractère des 12 séquences déclarées,
plus test de stabilité NFC et NFD.

| Chaîne        | Codepoints recalculés                                                               | Conforme à la déclaration | NFC stable |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------- | ---------- |
| ผม            | U+0E1C U+0E21                                                                       | oui                       | oui        |
| ดิฉัน         | U+0E14 U+0E34 U+0E09 U+0E31 U+0E19                                                  | oui                       | oui        |
| ฉัน           | U+0E09 U+0E31 U+0E19                                                                | oui                       | oui        |
| คุณ           | U+0E04 U+0E38 U+0E13                                                                | oui                       | oui        |
| ชื่อ          | U+0E0A U+0E37 U+0E48 U+0E2D                                                         | oui                       | oui        |
| ผมชื่อครับ    | U+0E1C U+0E21 U+0E0A U+0E37 U+0E48 U+0E2D U+0E04 U+0E23 U+0E31 U+0E1A               | oui                       | oui        |
| ดิฉันชื่อค่ะ  | U+0E14 U+0E34 U+0E09 U+0E31 U+0E19 U+0E0A U+0E37 U+0E48 U+0E2D U+0E04 U+0E48 U+0E30 | oui                       | oui        |
| อะไร          | U+0E2D U+0E30 U+0E44 U+0E23                                                         | oui                       | oui        |
| คุณชื่ออะไร   | U+0E04 U+0E38 U+0E13 U+0E0A U+0E37 U+0E48 U+0E2D U+0E2D U+0E30 U+0E44 U+0E23        | oui                       | oui        |
| คุณชื่ออะไรคะ | idem + U+0E04 U+0E30                                                                | oui                       | oui        |
| มาจาก         | U+0E21 U+0E32 U+0E08 U+0E32 U+0E01                                                  | oui                       | oui        |
| ฝรั่งเศส      | U+0E1D U+0E23 U+0E31 U+0E48 U+0E07 U+0E40 U+0E28 U+0E2A                             | oui                       | oui        |

Aucune des 93 séquences thaïes du fichier n'est non NFC. La correction ษ (U+0E29)
vers ส (U+0E2A) signalée au dossier de production est bien effective dans le
fichier livré. Zéro tiret cadratin (U+2014), zéro demi-cadratin (U+2013), zéro
barre horizontale (U+2015) dans le fichier.

### 1.2 Graphie, sens, IPA, ton, longueur, registre (20 confirmations)

Chaque item a été rejoué sur les deux éditions citées. Toutes les valeurs
déclarées sont exactes.

- ผม : /pʰom˩˩˦/ confirmé sur les deux éditions. Ton montant, voyelle brève.
  Double sens « cheveux » et pronom masculin confirmé. Registre confirmé :
  en.wiktionary « slightly formal, men's speech », th.wiktionary « (สุภาพ) ».
- ดิฉัน : /di˨˩.t͡ɕʰan˩˩˦/ confirmé sur les deux éditions. Bas puis montant,
  deux syllabes brèves. Emploi féminin actuel, emploi masculin archaïque
  confirmés (th.wiktionary : « โบราณ, เลิกใช้ »).
- ฉัน : /t͡ɕʰan˩˩˦/ confirmé sur les deux éditions. Variante familière
  /t͡ɕʰan˦˥/ confirmée sur en.wiktionary. Étiquette « informal » confirmée.
- คุณ : /kʰun˧/ confirmé sur les deux éditions. Ton moyen, voyelle brève.
  Double valeur deuxième ET troisième personne confirmée textuellement sur
  th.wiktionary (« เป็นสรรพนามบุรุษที่ 2 ... » et « เป็นสรรพนามบุรุษที่ 3
  ใช้แทนผู้ที่เราพูดถึงด้วยความสุภาพ »).
- ชื่อ : /t͡ɕʰɯː˥˩/ confirmé sur les deux éditions. Ton descendant, voyelle
  longue. Absence de section verbale confirmée sur les DEUX éditions.
- อะไร : /ʔa˨˩.raj˧/ confirmé sur les deux éditions. Bas puis moyen.
  Étymologie อัน + ไร confirmée. Description « pronom substitut du nom »
  confirmée sur les deux éditions.
- มาจาก : /maː˧.t͡ɕaːk̚˨˩/ confirmé, verbe « to come from, be from », composé
  มา + จาก confirmé. Composants confirmés séparément sur les deux éditions,
  exemple ดื่มน้ำจากแก้ว confirmé sur th.wiktionary.
- ฝรั่งเศส : /fa˨˩.raŋ˨˩.seːt̚˨˩/ confirmé sur les deux éditions. Trois tons
  bas confirmés. Étymologie « Semi-learned borrowing from French français » et
  « ยืมโดยกึ่งเรียนรู้จากฝรั่งเศส » confirmées mot pour mot. Les trois sens
  (pays, langue, personne) confirmés, avec la répartition
  วิสามานยนาม / นาม que la leçon décrit correctement.

Contre-vérification indépendante des tons par les règles de classe
consonantique, sans passer par les dictionnaires : ผ haute classe + syllabe
vivante sans marque donne montant ; ดิ moyenne classe + syllabe morte brève
donne bas ; ฉ haute classe + syllabe vivante donne montant ; ค basse classe +
syllabe vivante donne moyen ; ช basse classe + mai ek donne descendant ; อะ
moyenne classe + morte brève donne bas ; ไร basse classe + vivante donne moyen ;
มา basse classe + vivante longue donne moyen ; จาก moyenne classe + morte donne
bas ; ฝ haute classe en อักษรนำ gouverne รั่ง, d'où trois tons bas dans
ฝรั่งเศส. Les dix résultats coïncident avec les IPA déclarées.

### 1.3 Mots auxiliaires du dialogue (5 confirmations)

- ครับ : /kʰrap̚˦˥/, ton haut, brève. La transcription `khráp` est correcte.
- ค่ะ : /kʰaʔ˥˩/, ton descendant, brève. `khâ` correct.
- คะ : /kʰaʔ˦˥/, ton haut. `khá` correct. Note d'usage confirmée : autrefois
  chez les nobles, aujourd'hui surtout chez les femmes.
- ขอบคุณ : /kʰɔːp̚˨˩.kʰun˧/. La transcription `khàwwp·khoun` est conforme à la
  v1.1 (`aw` long donne `aww`, ton sur la première lettre du noyau).
- สวัสดี : /sa˨˩.wat̚˨˩.diː˧/. Voir finding TON-01, la transcription de la leçon
  est fausse ici.

### 1.4 Existence et contenu des URL (24 confirmations)

Les 21 URL citées comme consultées existent toutes et disent bien ce qu'on leur
fait dire, aux deux exceptions près documentées en CIT-01 et CIT-02. Les 3 URL
déclarées inexistantes le sont réellement :

- https://th.wiktionary.org/wiki/มาจาก renvoie bien HTTP 404
- https://en.wiktionary.org/wiki/ชื่ออะไร renvoie bien HTTP 404
- https://en.wiktionary.org/wiki/คุณชื่ออะไร renvoie bien HTTP 404

Aucune source inventée. Aucune URL morte présentée comme vivante. Aucune URL
vivante présentée comme morte. C'est le point le plus solide du dossier.

### 1.5 Faits d'infrastructure (2 confirmations)

- RID 2554 : https://dictionary.orst.go.th/ est joignable, le formulaire de
  recherche est présent, et toute requête par outillage renvoie bien
  ไม่พบคำศัพท์ที่ต้องการค้นหา. Le constat du rédacteur est exact.
- Volubilis : https://belisan-volubilis.blogspot.com/ affiche bien « V. 26.2
  (JUL. 2026) », « 114.000 entr. » et la licence « VOLUBILIS MULTILINGUAL THAI
  DICT. & DATABASE by Belisan is licensed under CC BY-SA 4.0 ». Constat exact.

### 1.6 Corrigés des exercices (4 confirmations)

- Exercice 1 : la réponse 1 (« Votre nom ») est correcte pour คุณชื่ออะไรคะ. Les
  deux distracteurs sont bien faux : « D'où vous venez » demanderait มาจากไหน,
  « Si vous allez bien » demanderait สบายดีไหม.
- Exercice 2 : les quatre paires sont exactes, y compris l'attribution du genre
  du LOCUTEUR (et non de l'interlocuteur) pour ผม et ดิฉัน.
- Exercice 3 : ดิฉัน มาจาก ฝรั่งเศส ค่ะ est l'ordre correct, ค่ะ est bien la
  particule d'affirmation d'une locutrice, et ผม est bien l'intrus à retirer.
- Exercice 4 : la réponse 1 est correcte, les distracteurs « Merci » (ขอบคุณ) et
  « Je » sont bien faux.

Aucun corrigé faux détecté. Second point solide du dossier.

## 2. Findings bloquants

### BLOQ-SRC-01 : aucun fait de la leçon n'a deux sources indépendantes

Les huit items et les deux collocations reposent exclusivement sur
en.wiktionary et th.wiktionary. `docs/content-policy/sources-verification.md`
classe Wiktionary comme « AUTORISÉE pour recoupement ; jamais en source
unique » et fixe la chaîne standard RID puis Volubilis puis Wiktionary.
`CONVENTIONS.md` exige « au moins DEUX sources indépendantes ». Deux éditions
linguistiques du même projet Wikimédia, alimentées en grande partie par la même
base normative et par des communautés qui se recopient, ne constituent pas deux
sources indépendantes. Ni RID ni Volubilis n'a été recoupé pour cette leçon.

Conséquence : au sens de la politique, CHAQUE fait linguistique de la leçon est
mono-source. Le rédacteur le déclare honnêtement au dossier de production, ce
qui est à son crédit, mais la déclaration ne lève pas la porte. Reste bloquant.

### BLOQ-SRC-02 : les deux collocations qui portent toute la leçon sont sous-attestées

- « pronom + ชื่อ + prénom + particule » n'est attesté que par en.wiktionary, via
  deux exemples rédigés par les contributeurs (vérifié : ce sont bien des
  exemples d'éditeur, pas des citations datées d'ouvrages publiés, ce qui les
  affaiblit encore par rapport à ce que le dossier laisse entendre).
  th.wiktionary ne donne pas cet exemple et, confirmé par mes soins, ne classe
  ชื่อ que comme nom.
- คุณชื่ออะไร n'a d'entrée dans aucune des deux éditions (404 confirmés).

Or ces deux blocs portent l'objectif observable, l'audio de l'exercice 1, deux
paires de l'exercice 2, deux répliques du dialogue et trois items SRS. La leçon
est donc structurellement construite sur ses deux éléments les moins sourcés.

Élément que le rédacteur n'a PAS exploité et qui aurait aidé : th.wiktionary
donne pour อะไร des exemples en position in situ (ท่านไปซื้อของอะไรมา,
อะไรอยู่ในตู้) qui étayent directement la règle enseignée. Le fait qu'ils aient
été manqués suggère une consultation superficielle de cette entrée.

### BLOQ-TON-01 : ton faux sur สวัสดี dans le dialogue

Réplique 1 du dialogue : `sawàtdii khâ`. La première syllabe n'y porte aucun
diacritique, ce qui vaut TON MOYEN dans la convention Thaïnaute (v1 comme
v1.1). Or สวัสดี est /sa˨˩.wat̚˨˩.diː˧/, soit BAS, BAS, MOYEN. Vérification
indépendante par les règles : ส est de haute classe, la syllabe สะ est morte et
brève, donc ton bas. La transcription correcte est `sà·wàt·dii`.

Le même passage viole aussi la règle du séparateur de syllabes : `CONVENTIONS.md`
impose le point médian `·` dans les mots polysyllabiques, appliqué partout
ailleurs dans la leçon (`dì·chǎn`, `fà·ràng·sèet`, `maa·jàak`, `à·rai`,
`khàwwp·khoun`) mais pas ici.

### BLOQ-TRA-01 : `chûue` est non conforme à thainaute-fr v1.1, 20 occurrences

L'amendement v1.1 point 2 impose de doubler la DERNIÈRE lettre du graphème pour
marquer la longueur, et donne explicitement `uee` comme forme longue de `ue`
(/ɯː/). Le point 4 place le ton sur la PREMIÈRE lettre du noyau. La forme
attendue pour /t͡ɕʰɯː˥˩/ est donc `chûee`.

La leçon écrit `chûue`, qui double la première lettre : c'est exactement la
graphie que la v1.1 déclare abandonnée. Elle apparaît 20 fois, dans la cible
phonétique de la Méta, l'item 5, les deux collocations, les pages
d'enseignement 5 et 6, le dialogue, l'exercice 1 et ses deux feedbacks.

Aggravant : la `note_fr` de l'item 5 écrit elle-même « la voyelle `uee` est le
son le plus étranger de la leçon », donc la leçon se contredit à trois lignes
d'écart. Un apprenant qui applique la table v1.1 ne sait pas lire `ûue`.

### BLOQ-SRC-03 : la preuve de l'omission du pronom sujet ne tient que sur une source

Page 6, texte affiché à l'apprenant : « Nos deux dictionnaires donnent
d'ailleurs des phrases entières sans aucun pronom sujet. » Le dossier de
production (incertitude 3) identifie ces deux appuis :

1. th.wiktionary « ค่ะ » : ไปค่ะ et ไม่มีอะไรค่ะ. Vérifié, les deux exemples
   sont bien présents et sont bien des phrases sans pronom sujet. Appui valide.
2. en.wiktionary « อะไร » : อะไรนะ?. Vérifié : c'est glosé « What? What was
   that? Pardon? ». C'est une interjection elliptique, sans verbe et sans
   prédication. Elle ne démontre pas l'omission d'un pronom sujet, elle démontre
   seulement qu'un mot interrogatif peut valoir énoncé.

Le fait enseigné est linguistiquement vrai, mais il est affirmé à l'écran comme
doublement sourcé alors qu'un seul des deux appuis le soutient. C'est à la fois
un fait mono-source et une source à laquelle on fait dire plus qu'elle ne dit.

## 3. Findings non bloquants

### NB-REG-01 : registre « poli » attribué à une phrase qui ne l'est pas

La collocation คุณชื่ออะไร est déclarée `registre : poli` et glosée « Comment
vous appelez-vous ? », une forme polie en français. Mais la phrase est donnée
NUE, sans ครับ ni คะ. Or la leçon enseigne elle-même, en remarque d'écoute du
dialogue, que « la particule finale porte la politesse ». Sans particule,
คุณชื่ออะไร est neutre à sec, pas poli. Même remarque pour la paire 4 de
l'exercice 2 (ผมมาจากฝรั่งเศส sans ครับ, alors que la page 6 et le dialogue
donnent la version avec particule). À arbitrer : soit remettre la particule dans
les items, soit corriger le champ `registre` et la glose française.

### NB-PED-01 : l'objectif principal n'est mesuré par aucun exercice

L'objectif observable annonce que l'apprenant « reconstruit sans indice le bloc
pronom + ชื่อ + prénom + particule ». Le seul exercice `word_order` de la leçon
porte sur ดิฉัน มาจาก ฝรั่งเศส ค่ะ, c'est-à-dire sur l'origine, pas sur le bloc
du nom. L'item `srs-u02-l2d-02` exige « reconstruire l'ordre complet sans
indice » d'un bloc que la leçon ne fait jamais reconstruire. Il manque un
`word_order` sur le bloc du nom, ou l'objectif doit être réécrit.

### NB-CIT-01 : citation inexacte des dérivés de ฝรั่งเศส

L'item 8 attribue à en.wiktionary les « dérivés ประเทศฝรั่งเศส, ภาษาฝรั่งเศส,
คนฝรั่งเศส ». Vérification : la section « Derived terms » de cette entrée ne
contient QUE อินโดจีนฝรั่งเศส. Les trois formes citées apparaissent bien sur la
page, mais comme exemples d'usage à l'intérieur des définitions, pas comme
dérivés. Le contenu existe, son statut est mal rapporté. À corriger pour que le
dossier de preuve soit exact.

### NB-CIT-02 : ordre des sens de ดิฉัน inversé

L'item 2 écrit « second sens masculin donné comme ancien ». Sur en.wiktionary,
l'ordre réel est : sens 1 « (formal and archaic, men's speech) », sens 2
« (formal, women's speech) ». Le sens masculin archaïque est le PREMIER. La
substance rapportée est juste, la description de la source ne l'est pas.

### NB-SRC-04 : étymologie de ฉัน sur th.wiktionary non consultée

L'incertitude 6 du dossier affirme : « en.wiktionary donne ฉัน comme réduction
de ดิฉัน ; ni l'une ni l'autre édition n'indique si cette réduction est perçue
comme féminine. » Vérification : th.wiktionary possède bien une section
รากศัพท์ pour le pronom, qui dit « ตัดมาจาก ดิฉัน หรือ ดีฉัน ซึ่งใช้แทนผู้ชาย
และ อิฉัน หรือ อีฉัน ซึ่งใช้แทนผู้หญิง », soit : coupé de ดิฉัน ou ดีฉัน
employés pour les hommes, et de อิฉัน ou อีฉัน employés pour les femmes.

Deux conséquences. D'abord la page 3 de l'enseignement, qui affirme à l'écran
que ฉัน « est la forme raccourcie de ดิฉัน », est une réduction abusive : les
DEUX éditions donnent deux origines possibles, dont une explicitement féminine
(อิฉัน). Ensuite l'incertitude 6 est mal formulée, puisque la source contient
bien de l'information de genre sur les formes sources. Bonne nouvelle
collatérale : le fait « ฉัน est une forme raccourcie » est, lui, réellement
doublement attesté, ce que le dossier ne dit pas.

### NB-NAT-01 : « ฉัน sans restriction de genre » est une position minoritaire non étayée par une grammaire

La page 3 corrige explicitement les manuels à l'écran : « Beaucoup de manuels le
présentent comme le je des femmes. Nos deux sources ne disent pas cela. »
Vérification : en.wiktionary étiquette effectivement ฉัน « neutral (colloquial) »
dans sa table de pronoms, face à ดิฉัน « feminine ». La leçon n'invente donc
rien. Mais c'est un fait d'USAGE, et la politique impose pour ce type de fait
« grammaire de référence sur exemplaire acquis ». Aucune grammaire n'a été
consultée. En thaï standard contemporain, ฉัน dans la bouche d'un homme adulte
reste marqué comme féminin, littéraire ou intime, ce que les grammaires de
référence décrivent. Publier une correction des manuels sur la seule foi d'une
table Wiktionary est risqué. À trancher par Iwasaki et Ingkaphirom ou Smyth,
puis par la revue native. En attendant, la prudence serait de ne pas formuler la
correction à l'écran et de s'en tenir à « en reconnaissance seulement ».

### NB-CTR-01 : écarts au contrat d'item et incohérences internes

- `registre` de l'item 2 vaut « poli, plutôt formel », hors de la nomenclature
  fermée de `CONVENTIONS.md` (neutre, poli, familier, formel). Le champ doit
  porter une valeur, l'hésitation appartient à la note ou au dossier.
- `litteral` de l'item 4 contient « mot de respect adressé à une personne, ou
  placé devant son nom », qui est une glose d'usage et non une traduction
  littérale.
- Le champ `fr` de l'item 4 ne donne que « vous » et « Monsieur, Madame », alors
  que la note et l'item `srs-u02-l2d-05` enseignent aussi la valeur de troisième
  personne. Le champ ne couvre pas ce qui est enseigné.
- La page 4 annonce « Deux écarts avec le vous français, tous deux confirmés par
  nos sources », la `note_fr` du même mot en annonce « trois », dont le
  troisième est explicitement une non-affirmation. Incohérence à lever.
- L'exercice 4 est un `reading` sur คุณ affiché en script thaï sans
  transcription, alors que la section Exercices écarte `recall` au motif que
  « l'écriture thaïe n'a pas encore été enseignée en production ». La
  justification vaut contre l'exercice 4 autant que contre `recall`. À
  reformuler : reconnaissance d'une silhouette de mot n'est pas lecture.

## 4. Points où j'ai cherché une erreur et n'en ai pas trouvé

Consigné pour que le prochain auditeur ne refasse pas le travail.

- Les 12 séquences de codepoints : exactes, sans exception.
- Les 8 IPA d'items : exactes sur les deux éditions, et cohérentes avec un
  calcul de ton indépendant.
- Les 4 corrigés d'exercices : exacts, distracteurs réellement faux.
- Les 24 URL : toutes vérifiées, aucune inventée, les trois 404 sont réels.
- Le constat RID et le constat Volubilis : exacts au mot près.
- Zéro tiret cadratin.
- L'affichage « Revue native : en attente » est présent et aucun texte ne
  suggère une validation native.
- La leçon signale elle-même ses deux findings bloquants principaux, ce qui est
  le comportement attendu par la politique.

## 5. Conditions de passage en `review`

1. Lever BLOQ-SRC-01 par un recoupement réel hors écosystème Wikimédia : RID en
   manuel, et Volubilis une fois la base présente dans le dépôt.
2. Lever BLOQ-SRC-02 par une grammaire de référence sur exemplaire, pour les
   deux collocations.
3. Corriger `sawàtdii` en `sà·wàt·dii` (BLOQ-TON-01).
4. Corriger les 20 occurrences de `chûue` en `chûee` (BLOQ-TRA-01), ou amender
   formellement la convention si le rédacteur veut défendre `ûue`.
5. Reformuler la page 6 ou re-sourcer l'omission du pronom sujet (BLOQ-SRC-03).
6. Traiter les 7 findings non bloquants, au minimum NB-REG-01 et NB-PED-01 qui
   touchent ce que l'apprenant voit et ce que la leçon prétend mesurer.
7. Ajouter à `CONVENTIONS.md` le graphème `f` pour ฝ et ฟ, comme le dossier de
   production le demande déjà.
