# Vérification adversariale de `lecon-7d.md`

- Fichier audité : `content/authoring/unite-07/lecon-7d.md` (88 800 octets, horodatage
  2026-08-03 23:13)
- Date de l'audit : 2026-08-03
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer »
- Méthode : aucune source citée par le fichier n'a été crue sur parole. Les
  22 graphies du dossier RID ont été réinterrogées par mes propres requêtes POST,
  le classeur Volubilis a été retéléchargé et relu par un extracteur XLSX que
  j'ai écrit moi-même sans réutiliser `scripts/verification/volubilis-lookup.mjs`,
  les 19 pages Wiktionary ont été rechargées en rendu, la liste de fréquence a été
  retéléchargée et les rangs recalculés, et les tons ont été redérivés à la main
  depuis la classe consonantique avant d'être confrontés aux dictionnaires.
- Résultat : **189 faits confirmés par mes propres relevés, 12 findings dont
  5 bloquants.** Aucun ton faux, aucune graphie fausse, aucun corrigé faux,
  aucune référence inventée.

## 1. Ce que j'ai refait moi-même, et qui tient

### 1.1 Encodage et forme (10 faits)

Les huit champs `codepoints` correspondent exactement, point de code par point de
code, à la graphie du champ `thai` du même item ; les huit graphies sont stables
en NFC et NFC coïncide avec NFD pour toutes. Le fichier ne contient **aucun tiret
cadratin ni demi-cadratin** (0 occurrence de U+2014 et U+2013), conformément à
ADR-0022. Le décompte de la section « Contrôle Unicode » du dossier de production
(นอน 3, ทำงาน 5, ดู 2, ทีวี 4, ที่ 3, บ้าน 4, ที่บ้าน 7, ทุกวัน 6, ตอนเช้า 7,
ผมทำงานที่บ้านทุกวันครับ 24) est exact.

### 1.2 Tons et longueurs, redérivés puis confrontés (16 faits)

J'ai recalculé chaque ton depuis la classe de la consonne initiale, la forme de
la syllabe et la présence d'une marque, avant de regarder ce qu'annonce le
fichier. Les huit items et les huit syllabes de la phrase du jour sont justes :

| graphie | dérivation                    | ton annoncé  | IPA de contrôle |
| ------- | ----------------------------- | ------------ | --------------- |
| นอน     | น basse, vivante, nue         | moyen        | /nɔːn˧/         |
| ทำ      | ท basse, vivante (ำ), nue     | moyen        | /tʰam˧/         |
| งาน     | ง basse, vivante, nue         | moyen        | /ŋaːn˧/         |
| ดู      | ด moyenne, vivante, nue       | moyen        | /duː˧/          |
| ที · วี | ท et ว basses, vivantes, nues | moyen, moyen | /tʰiː˧.wiː˧/    |
| ที่     | ท basse + ไม้เอก              | descendant   | /tʰiː˥˩/        |
| บ้าน    | บ moyenne + ไม้โท             | descendant   | /baːn˥˩/        |
| ทุก     | ท basse, MORTE, brève         | haut         | /tʰuk̚˦˥/        |
| วัน     | ว basse, vivante, nue         | moyen        | /wan˧/          |
| ตอน     | ต moyenne, vivante, nue       | moyen        | /tɔːn˧/         |
| เช้า    | ช basse + ไม้โท               | haut         | /t͡ɕʰaːw˦˥/      |
| ผม      | ผ haute, vivante, nue         | montant      | /pʰom˩˩˦/       |
| ครับ    | ค basse, morte, brève         | haut         | /kʰrap̚˦˥/       |

Les longueurs annoncées sont justes elles aussi, y compris les deux qui comptent :
le ำ de ทำ est bref et les deux syllabes de ทุกวัน sont brèves.

**Contrôle du tableau des marques de ton, case par case.** Le fichier ne contient
pas ce tableau (il appartient à `lecon-7a.md`), mais trois de ses items en
dépendent directement et fournissent chacun un point de contrôle indépendant.
J'ai vérifié les trois cases au dictionnaire :

- consonne BASSE + ไม้เอก → DESCENDANT : ที่, RID entrée attestée, en.wiktionary
  et th.wiktionary donnent /tʰiː˥˩/, Volubilis L101824 porte `\thī`. Case juste.
- consonne MOYENNE + ไม้โท → DESCENDANT : บ้าน, en.wiktionary et th.wiktionary
  donnent /baːn˥˩/, Volubilis L3744 porte `\bān`. Case juste.
- consonne BASSE + ไม้โท → HAUT : เช้า, RID donne la lecture [ช้าว],
  th.wiktionary donne /t͡ɕʰaːw˦˥/, Volubilis L105405 porte `¯chāo`. Case juste.

Les trois cases utilisées par 7D sont donc correctes et corroborées chacune par
au moins deux autorités. Aucune case fausse.

### 1.3 RID 2554, 22 graphies réinterrogées (52 faits)

J'ai relancé les 22 requêtes POST sur `dictionary.orst.go.th/func_lookup.php`,
espacées de 1,4 seconde, agent utilisateur identifiant l'audit. Le décompte du
dossier de production (16 attestées, 6 absentes) est exact. **Piège à consigner
pour les auditeurs suivants** : passer la graphie thaïe en argument de `curl`
depuis Git Bash la convertit silencieusement en `???` et le RID répond alors
« mot introuvable » sans la moindre erreur. Il faut émettre la requête depuis
Node, en UTF-8.

Contenus vérifiés et concordants avec ce qu'en dit le fichier :

- **นอน** : deux blocs, ก. étendre le corps pour se reposer, ว. état horizontal
  opposé à ยืน et ตั้ง. Exactement ce qu'annonce l'item 1.
- **ดู** : trois blocs ; le premier porte bien ดูภาพ, ดูละคร et ดูบ้านให้ด้วย.
  La page 5 de la leçon cite donc juste.
- **ที่** : huit sens ; le sens (๘) range bien ที่ comme บ., le glose par ณ et
  donne อยู่ที่บ้าน pour unique exemple. C'est le fait porteur de la leçon, et
  il est exact.
- **วัน ๑** : l'exemple du premier sens contient bien ไปทำงานทุกวัน ; วัน ๒ est
  la mouche, วัน ๓ la forêt d'origine pali.
- **ตอน ๑** : porte bien ขอให้มาตอนเช้า ; ตอน ๒ marcottage, ตอน ๓ castration.
- **เช้า ๑** : porte bien la lecture [ช้าว], la fourchette ๖.๐๐ à ๙.๐๐ puis
  l'étendue du lever du jour à midi ; เช้า ๒ est le panier ancien.
- **ทำ** : sept sens verbaux ; le deuxième est bien ประกอบการงาน avec ทำนา et
  ทำสวน. La liste des ลูกคำ de ทำ ne contient pas ทำงาน, comme annoncé.
- **งาน** : trois vedettes, dont ๔๐๐ ตารางเมตร et le sens de physique.
- **ทุก** : le titre groupe bien « ทุก ๑, ทุก ๆ » ; ทุก ๒ renvoie à ค้าว, et j'ai
  interrogé ค้าว pour vérifier qu'il s'agit bien d'un poisson d'eau douce de la
  famille des Siluridae. C'est le cas.
- **บ้าน**, **โทรทัศน์** (avec « (อ. television) » et le renvoi à โทร-),
  **ครับ** (avec [คฺรับ]), **ค่ะ** (avec ไปค่ะ et ไม่ไปค่ะ) : tous conformes.
- **Absences confirmées** : ทำงาน, ทีวี, ทุกวัน, ตอนเช้า, ดูทีวี et ทำงานที่บ้าน
  renvoient toutes six « ไม่พบคำศัพท์ที่ต้องการค้นหา ».
- **Requêtes exploratoires** : เรียน, พัก et ประจำ sont bien attestées.

### 1.4 Volubilis, exemplaire retéléchargé et relu (24 faits)

Fichier retéléchargé, **10 848 409 octets, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`** : identique
à l'empreinte annoncée. Feuille unique `Volubilis`, **114 579 lignes non vides**,
**586 541 chaînes partagées**, ligne 1 `VOLUBILIS Database | … | v. 26.2 (Jul.
2026) | 114577 entr.`, colonnes A=THAIROM à O=SYN sans colonne `LEV` : tout est
exact, y compris l'avertissement du dossier sur l'écart avec l'exemplaire `.ods`
des unités 1 à 6.

Les dix-sept relevés cités tombent tous sur la bonne ligne, avec les bonnes
valeurs : นอน 63999-64001, ทำงาน 99613-99614, ทำ 98950, ดู 12147-12148, ทีวี
102545, ดูทีวี 12574, ที่บ้าน 101831, บ้าน 3744, ที่ 101824, ทุกวัน 104096,
ตอนเช้า 105405-105406, ผม 72679-72681, ทำงานที่บ้าน 99651, ทำอาหาร 98968, อาหาร
337-338, ตอนเย็น 105763-105764, น้ำ (voir finding 12). Les marqueurs de ton
`-`, `¯`, `\`, `/` et les macrons de longueur concordent partout avec les tons et
longueurs annoncés.

### 1.5 Wiktionary, 19 pages rechargées (45 faits)

IPA, romanisations Paiboon et ราชบัณฑิตยสภา, sens, fonctions grammaticales,
étymologies et exemples : tout concorde. En particulier l'exemple ดูยูทูบ glosé
« to watch YouTube », l'exemple วางไว้ที่หน้าประตู sous la section Preposition de
ที่, l'exemple เราเคยขับรถไปทำงานทุกวัน แต่เดี๋ยวนี้ชอบขี่จักรยานไป sous ทุกวัน,
la présence de ไม่ทำงาน dans les termes dérivés de ทำงาน, la marque
« (colloquial) » sur ทีวี avec โทรทัศน์ pour synonyme, et le troisième sens
sexuel de นอน avec l'exemple en กับ. Les quatre absences consignées sont exactes :
HTTP 404 sur `en` pour ที่บ้าน, ดูทีวี et ทำงานที่บ้าน, HTTP 404 sur `th` pour
ทุกวัน, et la requête `th` sur ตอนเช้า aboutit bien à l'entrée เช้า.

### 1.6 Fréquence (28 faits)

Liste retéléchargée : **1 504 712 octets, SHA-256
`20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`**, 50 000
lignes. Les vingt rangs et les six décomptes d'occurrences cités sont exacts au
rang près : ที่ 203, วัน 241, ดู 427/888, ทุก 1006, ห้อง 1079, บ้าน 1192, ทำ 1291,
ทำงาน 1843/212, งาน 2143, ทุกวัน 2166/181, อาหาร 2305, ทีวี 4907/80, ที่บ้าน 5108,
ตอนเช้า 5544/71, นอน 6103/64, เช้า 8619, ทำอาหาร 13018, โทรทัศน์ 22608, ตอนเย็น
23461, ครัว 33145 ; ทำกับข้าว absent.

### 1.7 Prérequis internes au dépôt (14 faits)

5A enseigne bien neuf consonnes basses ค ง ช ซ ท น พ ฟ ม et 6A sept autres
ย ร ล ว ธ ภ ฮ, soit seize, dont ท, ง, น, ว et ช. La troisième ligne du tableau de
6A dit bien « consonne BASSE → ton MOYEN » en syllabe vivante sans marque, et 6A
met bien explicitement les syllabes mortes hors périmètre. 1B item 10 donne bien
ดู avec `fr` « regarder » et transcription `douu`, repris mot pour mot par 7D.
1B établit bien `khâo` contre `khâao`. 4D contient ไม่เผ็ด, 5D contient
ผมไปตลาดครับ, 6E contient อยู่ที่ฝรั่งเศส et แล้วคุณล่ะ (`láeew khoun lâ`), 6D
contient พี่น้อง, 5C contient อยู่ที่นี่, 2B donne ไหม avec /maj˩˩˦/ montant.
7C items 4 et 6 donnent bien ตอนเช้า et ทุกวัน avec les mêmes codepoints, IPA,
tons, longueurs et transcriptions que 7D. 7C ne contient effectivement aucune
occurrence de « ton bas », « sur-entraînement » ni « cible phonétique »,
l'incertitude 2 du fichier est donc exacte au moment où elle a été écrite.

### 1.8 Honnêteté du dossier

Le fichier signale de lui-même dix incertitudes, dont plusieurs qu'un auditeur
aurait mis du temps à trouver : l'absence de co-occurrence lieu + temps dans les
sources, la convention des marqueurs Volubilis non re-vérifiable faute de feuille
`Codes`, la coexistence de deux exemplaires Volubilis, le sens sexuel de นอน, la
faiblesse du label de registre de ทีวี, l'absence totale d'audio. Toutes se
vérifient et aucune n'est un faux aveu destiné à masquer autre chose.

## 2. Findings

### F1. BLOQUANT. « Ces deux marques ne sont pas encore à vous » est faux

Trois endroits du fichier affirment que les marques ◌่ et ◌้ ne sont pas encore
enseignées et que l'apprenant ne doit pas chercher à déchiffrer ที่, บ้าน et เช้า :

- page 11 : « ces deux marques sont justement le bloc d'écriture de cette unité :
  elles ne sont pas encore à vous… Ne cherchez donc pas à déchiffrer ces mots
  aujourd'hui, reconnaissez-les » ;
- item 5, `note_fr` : « La graphie de บ้าน n'est pas à déchiffrer aujourd'hui, sa
  marque de ton appartenant au bloc d'écriture de l'unité » ;
- préambule des exercices, qui écarte la mécanique `reading` sur ce motif.

`content/authoring/unite-07/lecon-7a.md` existe désormais et s'intitule « Les deux
marques qui changent tout ». Son bloc d'écriture est exactement « les deux marques
de ton ไม้เอก (◌่) et ไม้โท (◌้), et le tableau complet de leur effet sur les trois
classes de consonnes, en syllabe vivante », et son item 1 est บ้าน. 7A précède 7D
dans l'unité. Un apprenant qui arrive sur 7D possède donc les deux marques et sait
calculer les tons de ที่, de บ้าน et de เช้า. Les trois affirmations sont fausses
telles quelles, la page 11 sous-compte les mots calculables (quatre au lieu de
sept), et la justification de l'abandon de `reading` tombe : un exercice de lecture
mesurerait maintenant l'application du tableau de 7A à des mots nouveaux, ce que
`srs-u06-l6a-04` ne fait pas.

Circonstance à consigner : 7A a été écrite après 7D (23:24 contre 23:13), et le
fichier avait explicitement prévu ce risque dans sa note de coordination. Le
finding reste bloquant parce que l'écran ment à l'apprenant dans l'état actuel du
dépôt.

### F2. BLOQUANT. Note culturelle : fait mono-sourcé

La note culturelle affiche à l'écran la fourchette « environ six à neuf heures »
et déclare deux sources : le RID entrée « เช้า ๑ » et th.wiktionary entrée « เช้า ».

Ces deux sources ne sont pas indépendantes. J'ai comparé les deux textes : l'entrée
th.wiktionary reproduit le RID mot pour mot, y compris la définition nominale
(« เวลาระหว่างรุ่งสว่างกับสาย », « เวลาตั้งแต่รุ่งสว่างถึงเที่ยง »), les exemples
adjectivaux รอบเช้า et ผลัดเช้า, l'exemple adverbial มาแต่เช้า, et jusqu'à la
citation ancienne « ครั้นเช้าก็หิ้วเช้า (ม. คำหลวง มัทรี) » du sens archaïque. Il
s'agit d'un décalque, pas d'un recoupement.

Pire pour le fait précis affiché : th.wiktionary **ne donne pas** la fourchette
๖.๐๐ à ๙.๐๐. Le seul chiffre montré à l'apprenant repose donc sur une source
unique. `CONVENTIONS.md` exige deux sources indépendantes par fait.

Correction possible sans perte : retirer le chiffre de l'écran et ne garder que
les deux étendues, qui sont elles aussi mono-sourcées en l'état, ou trouver une
seconde autorité réellement indépendante du RID.

### F3. BLOQUANT. นอน est déjà l'item 3 de 7A, avec un `fr` différent

7D présente นอน comme un mot nouveau (page 2, item 1, et carte
`srs-u07-l7d-04` « vocabulaire nouveau du jour, นอน, ทำงาน et ทีวี »).

`lecon-7a.md` item 3 est นอน, avec les mêmes codepoints, la même IPA, le même ton,
la même longueur et la même transcription `nawwn`. Sa carte `srs-u07-l7a-05` est
déjà une carte de vocabulaire portant sur « บ้าน, นอน, นั่ง, ช้อน, อ่าน… ». Deux
conséquences :

1. deux cartes de vocabulaire pour le même item dans la même unité ;
2. surtout, **deux champs `fr` divergents** pour un item unique : 7A donne
   « dormir, se coucher », 7D donne « dormir ; s'allonger ». 7D applique
   explicitement à ดู la règle inverse (« Le champ `fr` est repris mot pour mot de
   l'item publié, conformément au finding N2 du contre-audit de 5A ») ; elle ne
   l'applique pas ici.

La consolidation doit trancher la propriété éditoriale de นอน et unifier `fr`.

### F4. BLOQUANT. La règle centrale du jour n'est appuyée par aucune source

Le fichier désigne lui-même le cœur de la leçon, page 7 : « Voilà le vrai point de
la leçon… นอน et ทำงาน ne fonctionnent pas comme ça. Pour dire où ils se passent,
**il faut** annoncer l'endroit avec ที่. »

Cette nécessité est posée comme une règle grammaticale, et elle n'est sourcée
nulle part. Les sources de l'item 8 établissent trois choses différentes :
que ที่ est une préposition (RID sens ๘ et Volubilis L101824), qu'un groupe
ที่ + lieu se place après le verbe (อยู่ที่บ้าน et วางไว้ที่หน้าประตู), et que le
bloc ทำงานที่บ้าน est lexicalisé chez Volubilis. Aucune ne dit que ที่ est
**obligatoire** derrière นอน ou ทำงาน. Je n'ai pas non plus trouvé de source qui
l'infirme, ce qui est exactement le problème : la règle la plus structurante de la
leçon a zéro source, alors que des faits bien plus périphériques en ont trois.

À signaler à la consolidation : le meilleur argument existe et n'est pas employé.
**ทำงานบ้าน est une entrée attestée de Volubilis, ligne 99618, et signifie
« accomplir les tâches ménagères », pas « travailler à la maison »**, qui est
ทำงานที่บ้าน ligne 99651. Un apprenant qui omet ที่ ne produit donc pas une phrase
maladroite, il produit un autre mot attesté. C'est un piège réel, sourçable, et il
n'apparaît ni page 7, ni dans les pièges connus des exercices 2 et 4. Par ailleurs
`lecon-7b.md` enseigne อยู่บ้าน sans ที่ tout en signalant que อยู่ที่บ้าน existe
aussi : la leçon 7D ne peut donc pas laisser la nécessité de ที่ non qualifiée.

### F5. BLOQUANT. Wiktionary mal cité sur น้ำ

Item 2, champ `sources` : « en.wiktionary, entrée « น้ำ » … qui donne la
prononciation standard /naːm˦˥/ ET la variante /nam˦˥/ ». L'item 2 `note_fr`
reformule de même : « Wiktionary donne comme prononciation standard longue à côté
d'une variante brève ».

Relevé réel de la page, section thaïe : trois lectures sont données, et les deux
dernières portent la mention explicite `[bound form]` :

```
Phonemic   น้ำ            น้าม- [bound form]   นั้ม- [bound form]
IPA        /naːm˦˥/       /naːm˦˥./            /nam˦˥./
```

/nam˦˥/ n'est donc pas une variante libre du mot น้ำ : c'est la lecture de la forme
liée, celle du premier élément d'un composé. La citation transforme un allomorphe
conditionné en variante libre. Le risque est concret : un consolidateur pourrait
en déduire que `hâwng·náam` de `u05-l5c` admet aussi `hâwng·nám` et « corriger »
une transcription juste. Le fait enseigné à l'apprenant (le ำ de น้ำ est long dans
ห้องน้ำ) n'est pas atteint, la correction est donc purement rédactionnelle.

### F6. Non bloquant. Page 11 : « sept syllabes » au lieu de six

Page 11 : « Quatre des mots du jour ont un ton que vous CALCULEZ… นอน, ทำงาน, ดู
et ทีวี… Cela fait sept syllabes lues à la règle. »

นอน 1 + ทำงาน 2 + ดู 1 + ทีวี 2 = **six**. Le prérequis `u06-l6a` du même fichier
compte d'ailleurs correctement cinq syllabes à consonne basse, auxquelles ดู en
ajoute une. Erreur d'arithmétique affichée à l'écran. À corriger en même temps que
F1, qui rouvre de toute façon ce paragraphe.

### F7. Non bloquant. L'URL Volubilis annoncée comme identique à celle du script ne l'est pas

Dossier de production : « Fichier téléchargé … depuis
`https://master.dl.sourceforge.net/project/belisan/VOLUBILIS%20Database.xlsx`, **au
moyen de la même URL que celle documentée en tête de
`scripts/verification/volubilis-lookup.mjs`** ».

Les deux URL diffèrent, et j'ai testé les deux :

- celle du fichier de leçon répond HTTP 301 puis sert le classeur ; c'est celle
  que j'ai employée, et elle donne bien l'empreinte annoncée ;
- celle du script,
  `https://master.dl.sourceforge.net/project/belisan-volubilis/VOLUBILIS_Database.xlsx?viasf=1`,
  **répond HTTP 404**.

L'affirmation d'identité est donc fausse. La reproductibilité exigée par
l'amendement v1.2 est sauve, puisque l'URL réellement citée fonctionne, mais c'est
l'en-tête du script qui doit être corrigé, sans quoi la commande que le dossier
présente comme rejouable ne l'est pas pour qui part du script. À noter aussi que le
nom réel du fichier sur SourceForge est `VOLUBILIS Database.xlsx`, avec une espace,
là où le fichier et le script écrivent tous deux `VOLUBILIS_Database.xlsx`.

### F8. Non bloquant. Exercice 3 : la consigne est fausse pour deux de ses six tirages

Consigne affichée : « Les deux options ne diffèrent que d'un mot : trouvez lequel. »

- tirage 4 : « Je travaille à la maison. » contre « Je **ne** travaille **pas** à
  la maison. » Deux mots ajoutés.
- tirage 6 : « Je **n'ai pas** de télé. » contre « J'**ai** une télé. » La
  négation et le déterminant changent tous les deux.

Le français ne permet pas de faire autrement, mais la consigne, elle, peut être
reformulée : « ne diffèrent que sur un point ». Le texte « Ce qu'il mesure » de
l'exercice dit d'ailleurs déjà « identiques sauf sur un point », qui est juste.

### F9. Non bloquant. Le piège de l'exercice 2 invoque une habitude française que la leçon contredit

Exercice 2, pièges connus : « placer le temps avant le lieu, calqué sur une
habitude de phrase française, et c'est l'erreur que l'exercice existe pour
attraper ».

C'est une affirmation sur le français, non sourcée, et la leçon la contredit
elle-même : ses propres traductions placent le lieu avant le temps, « Je travaille
à la maison tous les jours », « Je regarde la télé à la maison le matin », c'est-à-dire
dans le même ordre que le thaï. La section 1 bis de
`docs/content-policy/sources-verification.md` n'interdit formellement que les
absolus, et « une habitude » est prudent, mais la raison d'être annoncée de
l'exercice repose ici sur un transfert non démontré. Deux issues propres : sourcer
le fait, ou reformuler le piège en observation neutre (« l'ordre thaï est fixe et
l'apprenant doit s'en assurer »), sans invoquer le français.

Rien d'autre dans le fichier ne contrevient à la section 1 bis. La page 4 est au
contraire un modèle du genre : « Dites la phrase française « il travaille » puis
dites `tham·ngaan`, et écoutez où votre voix bouge dans chacune des deux » est
exactement la reformulation en observation vérifiable que la section 1 bis
recommande.

### F10. Non bloquant. `registre` hors énumération à l'item 4

Le contrat d'item de `CONVENTIONS.md` fixe `registre` à « neutre, poli, familier,
formel ». L'item 4 porte « courant, plutôt oral », qui ne contient aucune de ces
quatre valeurs et ne se compilera donc pas vers le schéma de `packages/content`.
La valeur juste au regard des sources (`(colloquial)` chez Wiktionary, absence au
dictionnaire normatif) est `familier`, la nuance restant dans `note_fr` où elle
est déjà écrite. L'item 8 porte « poli, locuteur homme », qui est conforme
puisqu'il commence par une valeur de l'énumération.

### F11. Non bloquant. Les réemplois de 7C ne reprennent pas les champs `fr` de 7C

7D applique explicitement à ดู la règle « le champ `fr` est repris mot pour mot de
l'item publié » (finding N2 du contre-audit de 5A) et s'y tient. Elle ne l'applique
pas à ses deux réemplois de 7C, pourtant présentés comme tels :

| champ              | 7C                                                 | 7D              |
| ------------------ | -------------------------------------------------- | --------------- |
| ตอนเช้า `fr`       | le matin (comme moment où l'on fait quelque chose) | le matin        |
| ตอนเช้า `litteral` | tranche, matin                                     | le moment matin |
| ทุกวัน `fr`        | tous les jours, chaque jour                        | tous les jours  |
| ทุกวัน `litteral`  | chaque, jour                                       | chaque jour     |

Aucune divergence n'est fausse, mais deux valeurs différentes pour un item unique
ne peuvent pas coexister à la compilation. La propriété éditoriale revenant à 7C
d'après la note de coordination de 7D, ce sont les valeurs de 7C qui doivent
gagner.

### F12. Non bloquant. Citation Volubilis sans numéro de ligne

L'amendement v1.2 exige, pour une source de type fichier, « nom, version, origine
de téléchargement, feuille et numéro de ligne ». La citation de น้ำ à l'item 2
(« VOLUBILIS_Database.xlsx, dont la cellule THAIPHON porte `¯nām [=¯nam]` ») ne
porte pas de numéro de ligne, seule occurrence du fichier dans ce cas. Pour
information, le relevé est **ligne 58873** (et 58874, 58875 pour les sens liquide
et jus).

## 3. Ce que je n'ai pas pu trancher

- **L'ordre lieu puis temps** (incertitude 3 du fichier) reste non relevé tel quel
  dans une source. Mes propres consultations ne l'ont pas produit davantage. Le
  fichier le dit et range l'ordre inverse hors périmètre : la position est honnête,
  mais elle demande le contre-audit externe annoncé.
- **La naturalité pragmatique** de ผมนอนที่บ้านทุกวันครับ, employée aux exercices 2
  et 3. La phrase est grammaticale et chacun de ses blocs est attesté, mais « je
  dors à la maison tous les jours » est une chose que peu de gens ont besoin de
  dire. Ce n'est pas une erreur, c'est un point à soumettre au contre-audit de
  naturalité.
- **La convention de transcription `aao`** pour la rime longue de เช้า. La règle
  v1.1 dit de doubler la DERNIÈRE lettre du graphème, ce qui donnerait `aoo` pour
  la longue de `ao`. Le corpus emploie `aao` depuis 1B (`khâao`) et 7C le reprend.
  L'usage est cohérent avec lui-même, mais il constitue, comme le `am` de
  l'incertitude 7 que le fichier signale, une extension non ratifiée de la
  convention. À ratifier en même temps que `am` et `oua`.

## 4. Conclusion

Le dossier de preuve de cette leçon est d'une solidité inhabituelle : 189 faits
recontrôlés, aucune référence inventée, aucun ton faux, aucune graphie fausse,
aucun corrigé faux, les empreintes de fichiers et les numéros de ligne exacts au
premier essai. Les trois findings qui coûtent réellement sont F1, F2 et F4 :
une affirmation devenue fausse à l'écran depuis l'arrivée de 7A, un fait culturel
affiché sur une seule autorité déguisée en deux, et la règle centrale du jour qui
n'est appuyée par rien alors que son meilleur appui, ทำงานบ้าน, dormait dans la
base déjà citée par le fichier.

Statut recommandé : rester en `draft`. Les cinq findings bloquants se corrigent
sans réécriture de fond, mais F1 et F3 exigent une décision de coordination avec
`lecon-7a.md`, et F4 exige une source ou une reformulation.
