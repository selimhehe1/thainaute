# Contre-audit adversarial de la leçon 6A

- Cible : `content/authoring/unite-06/lecon-6a.md`, statut `draft`
- Date de l’audit : 2026-08-03
- Auditeur : agent adversarial indépendant (Claude Opus 5)
- Consigne : chercher des erreurs, ne rien croire sur parole, re-vérifier chaque
  fait à la source, y compris quand la source est citée dans le fichier
- Cadre : `content/authoring/CONVENTIONS.md` amendements v1.1 et v1.2,
  `docs/content-policy/sources-verification.md` section 1 bis

## Méthode

Aucune affirmation du fichier n’a été acceptée sur la foi de sa citation. Ont
été refaits de bout en bout, le 2026-08-03 :

- 25 interrogations du RID 2554 en POST direct sur
  `dictionary.orst.go.th/func_lookup.php`, une requête par graphie, espacées,
  agent utilisateur identifiant l’audit ;
- 24 relevés en rendu sur en.wiktionary et l’annexe « Appendix:Thai script » ;
- téléchargement et empreinte du PDF UNGEGN, plus extraction de ses deux tables ;
- ré-extraction indépendante de `VOLUBILIS.ods` par un parseur expat écrit pour
  l’audit, sans réutiliser aucun script du dossier, avec recalcul des empreintes,
  des décomptes de lignes et du contenu des lignes citées ;
- recalcul des rangs FrequencyWords sur `th_50k.txt` ;
- balayage du dépôt `content/authoring/unite-01` à `unite-05` pour recompter les
  items, les graphies et les syllabes concernées par la règle du jour ;
- contrôle Unicode, NFC et typographie sur le fichier tel qu’édité.

## Verdict

**Non recevable en l’état.** Six constats bloquants, six constats non bloquants.
La règle de ton de la classe basse, qui est le fait le plus lourd de la leçon,
est JUSTE et tient à la re-vérification. En revanche la leçon appuie deux de ses
démonstrations sur des exemples faux, et le dossier certifie deux mesures qui ne
se reproduisent pas.

108 faits ont été confirmés par l’auditeur lui-même, dont la totalité des
citations RID, la totalité des IPA Wiktionary, la totalité des relevés UNGEGN,
la totalité des numéros de ligne VOLUBILIS et la totalité des empreintes
SHA-256. La qualité du dossier de preuve est réelle ; les erreurs trouvées sont
concentrées ailleurs.

## Constats bloquants

### B1. เท่าไร ne contient pas la voyelle ออ (page 5)

La page 5 affirme : « Vous connaissez ออ depuis เท่าไร et ขอบคุณ ». C’est faux
pour เท่าไร. Sa première syllabe porte สระเอา, la diphtongue /aw/, et non ออ
/ɔː/.

Preuves indépendantes :

- en.wiktionary, entrée « เท่าไร », relevée en rendu le 2026-08-03 :
  IPA `/tʰaw˥˩.raj˧/`, Royal Institute `thao-rai`, Paiboon `tâo-rai` ;
- la transcription déjà publiée par le parcours, `u03-l3c` item 1, est
  `thâo·rai`, donc `ao` et non `aww` ;
- `CONVENTIONS.md`, amendement v1.1 point 3, oppose explicitement les deux
  graphèmes et impose la règle de lecture « aw = o ouvert, ao = a puis o ».

La page 5 enseigne donc à l’apprenant que le son qu’il doit apprendre à
distinguer se trouve précisément dans le mot qui porte l’autre son. C’est la
confusion que l’amendement v1.1 existe pour empêcher, réintroduite sur un écran
d’enseignement. Le dossier confirme d’ailleurs l’anomalie sans la voir : la
section « Reprises des unités 1 à 5 citées à l’écran » ne rattache เท่าไร qu’à
la page 7, pour la lettre ร, et ne couvre pas cet emploi.

Correction attendue : retirer เท่าไร de la page 5. ขอบคุณ suffit, et sa
transcription publiée `khàwwp·khoun` porte bien `aww`.

### B2. « la deuxième fois du parcours » est faux (note culturelle)

La note culturelle affirme : « C’est la deuxième fois du parcours qu’une lettre
se récite avec un mot déjà appris, après ม, dont le nom ม้า est un item de la
leçon 1D ».

Le dépôt dit le contraire. `u04-l4a`, page 5, enseigne ถ = ถอ ถุง, et le dossier
de la même leçon écrit noir sur blanc, ligne 678 : « ถ ถอ ถุง, le sac, que vous
connaissez déjà comme vocabulaire ». ถุง est l’item 8 de `u03-l3a`, donc appris
avant 4A. L’unité 4 précède l’unité 5.

L’ordre réel est donc : ถ avec ถุง en 4A, ม avec ม้า en 5A, ร avec เรือ en 6A.
La phrase se trompe à la fois de rang et de prédécesseur. Fait non sourcé de
surcroît, dans une section où `CONVENTIONS.md` exige que chaque fait le soit.

### B3. La règle de transcription des finales ย et ว énoncée page 8 est fausse

La page 8 énonce : « ย et ว gardent leur son, et la transcription les écrit avec
la voyelle plutôt que comme une consonne ».

Relevé exhaustif des transcriptions publiées portant un ว dans les unités 1 à 5 :

| graphie | transcription publiée | leçon     | ว écrit |
| ------- | --------------------- | --------- | ------- |
| หิว     | `hǐo`                 | `u04-l4b` | `o`     |
| ข้าว    | `khâao`               | `u04-l4a` | `o`     |
| ก้าว    | `kâao`                | `u04-l4a` | `o`     |
| ขาว     | `khǎao`               | `u04-l4a` | `o`     |
| เลี้ยว  | `líao`                | `u05-l5b` | `o`     |
| แล้ว    | `láeew`               | `u01-l1e` | `w`     |
| แก้ว    | `kâeew`               | `u04-l4c` | `w`     |

Deux cas sur sept écrivent ว comme une consonne, et ce sont exactement les deux
que 6A met sous les yeux de l’apprenant : `láeew·joee·kan` est affiché à la page
1, et แก้ว est cité à la page 7 comme mot où l’apprenant lit déjà un ว. La règle
de la page 8 est donc démentie à l’intérieur de la même leçon.

Deux issues possibles, l’une et l’autre hors de la seule 6A : soit la convention
tranche et les transcriptions publiées sont réalignées, soit la page 8 cesse
d’énoncer une règle générale et décrit seulement les cas qu’elle montre. Dans
les deux cas, la formulation actuelle ne peut pas passer en `review`.

### B4. « Même mâchoire des deux côtés » contredit les IPA déclarés par la leçon

Les pages 4, 5 et 12, ainsi que le feedback incorrect de l’exercice 2, réduisent
l’opposition เออ contre ออ à un seul paramètre : « Même mâchoire ouverte des
deux côtés ; d’un côté les lèvres font le rond, de l’autre non ».

La leçon déclare elle-même, en Méta et dans ses items, `/ɤː/` pour เออ et
`/ɔː/` pour ออ. Ces deux voyelles ne diffèrent pas seulement par
l’arrondissement : `/ɤ/` est mi-fermée, `/ɔ/` est mi-ouverte. L’aperture
n’est pas la même, et un apprenant qui garde la mâchoire de `/ɔː/` en
désarrondissant ne produira pas `/ɤː/`.

Le contraste est net avec le geste de la page 2, qui est juste : `/ɯ/` est bien
le non-arrondi de `/u/`, donc « la langue de ou, les lèvres de i » décrit
exactement la bonne opposition. La leçon a transposé mécaniquement ce geste
correct sur une paire où il ne s’applique pas.

La politique n’autorise aucune source de description articulatoire du thaï hors
grammaires sur exemplaire, ce que le dossier reconnaît. Le constat ne demande
donc pas une source : il demande que la leçon cesse d’affirmer une chose que ses
propres champs `ipa` contredisent. Reformuler en deux différences, ou opposer
เออ à โอ si l’on veut un contraste d’arrondissement pur.

### B5. Le contrôle interne annoncé ne se reproduit pas

Le dossier certifie, dans « Troisième contrôle » et dans « État des audits » :
« 195 items et 151 graphies distinctes balayés, neuf syllabes vivantes sans
marque à initiale basse trouvées, neuf `ton : moyen` déclarés, zéro écart ».

Balayage refait le 2026-08-03 sur `content/authoring/unite-01` à `unite-05`,
sections `## Items` uniquement :

- 215 champs `thai` (205 si les sous-items `#### N.M` de `u03-l3b` sont repliés
  sur leur item parent), pour 166 graphies distinctes (161 repliées). Aucune des
  deux conventions de comptage ne donne 195 et 151.
- les graphies monosyllabiques vivantes, sans marque de ton, à initiale basse
  sont **treize** et non neuf. Aux neuf citées (คน, คา, ทา, ทาน, พา, มา, ยา,
  เรือ, แพง) il faut ajouter :

| graphie | leçon     | pourquoi elle qualifie           | `ton` publié  |
| ------- | --------- | -------------------------------- | ------------- |
| คุณ     | `u02-l2d` | ค basse, finale ณ, aucune marque | `khoun moyen` |
| พอ      | `u02-l2a` | พ basse, voyelle ออ longue       | `moyen`       |
| เพลง    | `u02-l2a` | พ basse, finale ง                | `moyen`       |
| ฟอง     | `u03-l3e` | ฟ basse, finale ง                | `moyen`       |

La règle elle-même n’est PAS invalidée : les treize déclarent `ton : moyen`,
donc treize sur treize, zéro écart. C’est la certification qui est fausse, et
elle porte sur le fait le plus lourd de la leçon. L’omission la plus gênante est
คุณ, que la page 11 de 6A utilise justement comme contrepoint de registre à เธอ
sans voir qu’il illustre aussi la règle du jour.

Le même dénominateur erroné contamine une seconde ligne de l’état des audits :
« ย apparaît dans 24 graphies, ร dans 22, ล dans 15 et ว dans 22 ». Mesuré sur
les 166 graphies distinctes : ย 28, ร 25, ล 15, ว 22. Deux valeurs sur quatre
sont fausses. Le fait « ธ, ภ et ฮ n’apparaissent dans aucune » est confirmé.

### B6. Un fait de phonétique française hors des deux voies de la section 1 bis

La page 4 écrit : « Dites le « eu » de « deux », puis regardez vos lèvres :
selon les personnes et les régions, elles s’arrondissent plus ou moins ».

La proposition « selon les personnes et les régions » est un fait de phonétique
française. La section 1 bis de `docs/content-policy/sources-verification.md` ne
lui laisse que deux formes recevables, « et d’aucune autre » : sourcé deux fois,
ou reformulé en observation vérifiable par l’apprenant. Elle n’est ni l’un ni
l’autre. L’apprenant peut observer sa propre bouche ; il ne peut pas observer
« les personnes et les régions ».

Le titre a pourtant été changé avec beaucoup de soin pour éviter exactement ce
défaut, et le dossier certifie : « Les observations adressées à l’apprenant
portent uniquement sur SA propre bouche, ce que la section 1 bis de la politique
autorise explicitement, et aucun absolu sur le français n’est énoncé ». La
seconde moitié est vraie, la première ne l’est pas.

Correction simple et suffisante : supprimer la clause de variation, ou la
ramener à l’observation, par exemple « regardez si vos lèvres s’arrondissent ».

## Constats non bloquants, à corriger avant `review`

### N1. Exercice 3, la composition annoncée ne correspond pas aux tirages

« Tirages et réponses : 8 au total, quatre portant les voyelles du jour, quatre
portant leurs voisines ». En réalité cinq portent une voyelle du jour (มือ, ลืม,
ถือ pour `uee` ; เธอ, เจอ pour `oee`) et trois une voisine (ถู, คู pour `ouu` ;
จอ pour `aww`). Les blocs de feedback du même exercice, « tirages 1, 2, 3 et
6, 7 » contre « tirages 4, 5 et 8 », donnent bien 5 contre 3. Les huit corrigés
sont justes ; seule la phrase de présentation est fausse.

### N2. SRS, « Quatre d’entre eux » alors qu’ils sont trois

La section « Hors périmètre » écrit : « Quatre d’entre eux sont écrits en
transcription d’après l’audio aux tirages 4, 5 et 8 de l’exercice 3 ». Trois
tirages, trois spécimens : ถู, คู et จอ. คือ et ทอ n’apparaissent pas dans
l’exercice 3.

### N3. Cinq imprécisions de citation de VOLUBILIS

Ré-extraction indépendante de `content.xml`, empreintes recalculées et
identiques à celles du dossier. Les numéros de ligne cités sont tous exacts, y
compris les lignes témoins et les sept mots-images. Restent cinq écarts :

1. « `RID` … n’y figure pas pour มือ, ชื่อ, คน, คือ, จอ, ทอ et ถู ». Faux pour
   คือ : la ligne 34741, celle-là même que le dossier cite, porte `DOM = RID`.
2. ถือ : « Les lignes 104955 à 104959 portent les sens dérivés ». ถือ occupe en
   réalité les lignes 104954 à 104960 ; la ligne 104960, `LEV U`, `DOM RID`,
   n’est pas comptée.
3. « L’en-tête complet relevé en ligne 1 » s’arrête à `KEY`. La feuille compte
   quatorze colonnes : `SCIENT_ABBREV` et `NOTE` suivent `KEY`.
4. Champs présentés comme uniformes sur plusieurs lignes alors qu’ils varient :
   เจอ ligne 20740 porte `LEV A2 S` et un `DOM` vide, pas `A0 B` ni `RID` ; คน
   ligne 36811 porte `LEV X` ; คือ ligne 34743 porte `LEV A1 B`.
5. มือ : `DOM` cité « MEDIC (anato) ; MINENG » alors que la cellule porte
   « MEDIC (anato) ; MINENG ; TOURIST ».

Aucun fait enseigné ne dépend de ces cinq points, mais un dossier de preuve doit
citer ce qu’il a lu.

### N4. Trois graphies mal classées dans le décompte RID

L’arithmétique du décompte est juste, 33 plus 12 plus 1 égale 46. En revanche
พี่ figure parmi les « attestées et retenues comme preuve » alors qu’il
n’apparaît dans 6A que dans le paragraphe qui écarte le dialogue, exactement au
même titre que น้อง, พ่อ et แม่, eux classés « exploratoires, non retenues ». De
même ไม้เอก et คำตาย sont annoncés comme preuve sans être cités nulle part dans
le fichier.

### N5. « la deuxième jumelle basse de ถ » est inexact

La page 7 présente ธ comme « la deuxième jumelle basse de ถ, après ท ». Le
dossier relève lui-même que VOLUBILIS `Romanization` ligne 18 réunit ฐ, ฑ, ฒ, ถ,
ท et ธ sous la valeur `th`, ce que l’audit confirme : ฑ et ฒ sont également des
basses à valeur `th`. ธ est donc la deuxième que l’apprenant rencontre, pas la
deuxième qui existe. Même réserve pour le feedback de l’exercice 5, « th par ถ,
ท et ธ », qui se lit comme une énumération complète. Le cas de ภ est en revanche
correct : ผ, พ et ภ sont bien les trois seules lettres à valeur `ph`, et ห et ฮ
les deux seules à valeur `h`.

### N6. « de votre âge » n’est attesté par aucune des sources citées

La page 11 conclut : « Gardez เธอ pour des personnes proches et de votre âge ».
Le RID dit « entre amies » ou vers « une personne de rang inférieur », avec le
professeur et son élève pour exemple ; en.wiktionary dit « equal or lower
status » ; VOLUBILIS donne « tu », « toi ; te ». Aucune source ne parle d’âge.
La leçon substitue une frontière d’âge à une frontière de statut. L’incertitude
12 du dossier affirme pourtant que la page « s’en tient à ce qui est attesté et
à un conseil prudent, et n’invente aucune règle sociale ».

## Ce que l’audit a confirmé, et qui tient

Cette section existe pour que la correction ne défasse pas ce qui est juste.

### La règle de ton de la classe basse est exacte

Interrogé directement le 2026-08-03, le RID donne :

- « อักษรต่ำ » : `พยัญชนะที่คำเป็นมีพื้นเสียงเป็นเสียงสามัญ`, série d’exemples
  คา ค่า ค้า, et les vingt-quatre lettres ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย
  ร ล ว ฬ ฮ. Conforme mot pour mot à ce que la leçon lui fait dire.
- « อักษรกลาง » : même ton de base สามัญ, série กา ก่า ก้า ก๊า ก๋า, neuf lettres.
- « อักษรสูง » : ton de base จัตวา, série ขา ข่า ข้า, onze lettres.
- « คำเป็น » : `คำสระยาวที่ไม่มีตัวสะกด และคำในมาตรากง กน กม เกย เกอว`. La leçon
  cite cette définition exactement, sans ajout ni retrait.

Les trois lignes du tableau de la page 9 sont donc justes, et la formulation
« deux classes sur trois donnent le même ton dans ce cas précis » l’est aussi.
L’étage 2 du dossier a été refait : les douze prédictions sont confirmées mot par
mot chez en.wiktionary, มือ `/mɯː˧/`, ลืม `/lɯːm˧/`, เธอ `/tʰɤː˧/`, คือ
`/kʰɯː˧/`, คู `/kʰuː˧/`, ทอ `/tʰɔː˧/`, คน `/kʰon˧/`, ทาน `/tʰaːn˧/`, มา
`/maː˧/`, ยา `/jaː˧/`, พา `/pʰaː˧/`, แพง `/pʰɛːŋ˧/`.

### Les sept lettres, leur classe et leur valeur

Chaque entrée de lettre du RID a été rouverte. Rang, lecture entre crochets, nom
de récitation, classe et série de ตัวสะกด concordent pour les sept : ย 34e [ยอ]
ยอ ยักษ์ อักษรต่ำ มาตราเกย ; ร 35e [รอ] รอ เรือ อักษรต่ำ มาตรากน ; ล 36e [ลอ]
ลอ ลิง อักษรต่ำ มาตรากน ; ว 37e [วอ] วอ แหวน อักษรต่ำ มาตราเกอว ; ธ 24e [ทอ]
ธอ ธง อักษรต่ำ มาตรากด, deux vedettes ; ภ 32e [พอ] ภอ สำเภา อักษรต่ำ มาตรากบ ;
ฮ 44e [ฮอ] ฮอ นกฮูก อักษรต่ำ, dernière consonne thaïe, initiale seulement.
en.wiktionary porte bien « low consonant class » sur les sept.

### Les paires minimales et les items

Les douze IPA relevés sur en.wiktionary concordent avec les champs `ipa` de la
leçon, sans exception, y compris le détail des sections régionales de จอ. Les
sens RID concordent également, y compris le nombre de vedettes annoncé pour
มือ (trois), คน (deux), คู (deux), จอ (deux), ทอ (deux), สำเภา (deux), et
l’entrée à titre groupé « เจอ, เจอะ ». นกฮูก renvoie bien `ไม่พบคำศัพท์`, comme
le dossier le consigne.

Les deux graphèmes du jour sont établis trois fois, et l’audit a refait les trois
relevés : UNGEGN table II entrées 9, 10 et 11 en `ue` contre 12 et 13 en `u`,
entrées 25, 26 et 27 en `oe` contre 21 à 24 en `o` ; VOLUBILIS `Romanization`
lignes 47, 49, 59 et 62 ; annexe Wiktionary. Le refus argumenté de la colonne
« Similar Sound », qui donne « u in French du » et « u in French dur » pour les
deux longueurs de la même voyelle, est vérifié sur la table et bien fondé.

### Les empreintes, les décomptes et l’encodage

Toutes recalculées par l’auditeur, toutes identiques :

- `VOLUBILIS.ods`, 15 724 718 octets, SHA-256 `bb9c5da5…a094cc` ;
- `content.xml`, 379 601 910 octets, SHA-256 `3072e4d3…fab0e7` ;
- `th_50k.txt`, 1 504 712 octets, SHA-256 `20e7052f…1b6083` ;
- `rom1_th.pdf`, 89 474 octets, SHA-256 `d4d4c8c9…d62b07`, téléchargé depuis
  `https://www.eki.ee/wgrs/rom1_th.pdf`, en-tête « Version 4.0, September
  2013 », endossement thaï de 2000 et approbation de Berlin 2002 confirmés dans
  le texte, glyphes thaïs effectivement non extractibles ;
- feuilles VOLUBILIS : `Volubilis` 118 571 lignes non vides, `Codes` 227,
  `Romanization` 86 ; bloc `TONES` en ligne 215 et les cinq marqueurs en 216 à
  220 ;
- les quatorze rangs FrequencyWords annoncés, y compris l’absence de ถู et จอ ;
- 181 chaînes thaïes distinctes dans le fichier, 181 stables en NFC, fichier
  entier stable, 0 cadratin, 0 demi-cadratin, 0 U+2015, 0 U+2212, 0 U+2012,
  0 apostrophe droite, 0 guillemet droit, 495 apostrophes typographiques ;
- les `codepoints` des sept items et les cinq couples cités en prose, recalculés
  depuis les graphies, sept et cinq correspondances exactes.

Les vingt faits d’encodage Unicode 17.0 cités sont exacts, noms normatifs,
catégories générales et classes combinatoires comprises.

### Les corrigés et la transcription

Les trente-cinq corrigés d’exercice ont été recalculés un par un : six tirages
de l’exercice 1, six de l’exercice 2, huit de l’exercice 3, huit de l’exercice 4
et sept paires de l’exercice 5. Tous sont justes, y compris les trois réemplois
ขา, ถุง et สอง de l’exercice 4, et les distracteurs sont bien faux.

Les sept transcriptions d’items et les cinq de spécimens respectent la
convention v1.1 : accent réservé au ton, posé sur la première lettre du noyau
vocalique, longueur notée par doublement de la dernière lettre du graphème.
`chûee`, `khon` et `joee` sont identiques aux formes publiées par `u02-l2d`,
`u03-l3d` et `u01-l1e`. L’arbitrage v1.2 est correctement appliqué à la page 6.

Les deux affirmations d’antériorité sont vraies, contrôle fait sur le dépôt :
le graphème `uee` apparaît pour la première fois dans ชื่อ, item 5 de `u02-l2d`,
et `oee` dans แล้วเจอกัน, item 5 de `u01-l1e`.

L’incertitude 7 est fondée : `aud5e_vol.py` compare bien la graphie attendue à
la PREMIÈRE colonne de la feuille `Volubilis`, alors que la colonne thaïe est la
cinquième.

## Actions demandées avant `review`

1. Retirer เท่าไร de la page 5 (B1).
2. Corriger la note culturelle et y consigner ถ, ถอ ถุง, comme premier cas (B2).
3. Arbitrer la transcription des finales ย et ว, puis réécrire la page 8 (B3).
4. Réécrire le geste de เออ contre ออ sur les pages 4, 5 et 12 et dans le
   feedback de l’exercice 2 (B4).
5. Refaire le balayage du dépôt, corriger les deux lignes de l’état des audits,
   et décider si คุณ, พอ, เพลง et ฟอง rejoignent la liste de la page 10 (B5).
6. Reformuler la clause de variation régionale de la page 4 (B6).
7. Corriger N1 à N6.

Ce rapport ne vaut que pour la version auditée le 2026-08-03. Toute retouche
relance les contrôles Unicode, NFC et typographie, dont les décomptes sont
déclarés à l’unité près.
