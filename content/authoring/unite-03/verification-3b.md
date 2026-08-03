# Contre-audit adversarial de la leçon 3B

- Cible : `content/authoring/unite-03/lecon-3b.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent de contre-audit interne, consigne adversariale (chercher
  l'erreur, ne rien confirmer sur parole)
- Méthode : aucune affirmation de la leçon n'a été acceptée sur la foi de sa
  citation. Chaque graphie, chaque ton, chaque longueur, chaque IPA, chaque
  corrigé et chaque source ont été recalculés ou réinterrogés à la source.
- Verdict : **la leçon ne peut pas passer `draft → review` en l'état.**
  Quatre findings bloquants, huit findings mineurs. Aucun n'atteint le noyau
  linguistique thaï : les 25 formes enseignées sont justes en graphie, en ton,
  en longueur et en sens. Les défauts portent sur trois affirmations non
  sourcées ou sur-traduites, un renvoi de prérequis faux, et sur la
  reproductibilité de deux dossiers de preuve.

## 1. Ce que j'ai revérifié moi-même

281 contrôles indépendants. Détail et outillage ci-dessous.

### 1.1 Unicode et graphie (27 contrôles, 0 écart)

- Les **24 séquences de codepoints déclarées** ont été recalculées par script
  Node sur les chaînes du fichier lui-même : les 10 nombres de un à dix, ยี่สิบ,
  les 7 dizaines, เอ็ด, สิบเอ็ด, ยี่สิบเอ็ด, ร้อย, หนึ่งร้อย et le bloc ๐ à ๙.
  **24 sur 24 exactes**, y compris les cas piégeux ห้า (U+0E2B U+0E49 U+0E32,
  marque de ton avant la voyelle spatiale) et เก้า (U+0E40 U+0E01 U+0E49 U+0E32).
- Les 24 chaînes et le fichier entier sont **stables en NFC**.
- **Aucun tiret cadratin U+2014, aucun demi-cadratin U+2013, U+2012 ni U+2212.**
- `UnicodeData.txt` retéléchargé (2 198 209 octets) : les lignes `0E50` à `0E59`
  portent bien THAI DIGIT ZERO à THAI DIGIT NINE, catégorie `Nd`, valeurs
  numériques 0 à 9. Conforme à l'item 8.
- `IndicPositionalCategory.txt` version **17.0.0, daté 2025-07-29** : la ligne
  `0E40..0E44 ; Visual_Order_Left # Lo [5] THAI CHARACTER SARA E..THAI CHARACTER
SARA AI MAIMALAI` existe mot pour mot. Conforme à l'item 2.2.

### 1.2 Tons et longueurs (32 contrôles, 0 écart)

Ton et longueur redérivés à la main pour 16 formes, par classe de consonne,
type de syllabe et marque de ton, puis confrontés aux lettres tonales IPA des
deux éditions de Wiktionary.

| Forme   | Dérivation                             | Ton annoncé      | Longueur annoncée | Verdict |
| ------- | -------------------------------------- | ---------------- | ----------------- | ------- |
| หนึ่ง   | ห entraîneur + น, classe haute, mai ek | bas              | courte            | juste   |
| สอง     | ส haute, syllabe vive, sans marque     | montant          | longue            | juste   |
| สาม     | ส haute, syllabe vive, sans marque     | montant          | longue            | juste   |
| สี่     | ส haute, mai ek                        | bas              | longue            | juste   |
| ห้า     | ห haute, mai tho                       | descendant       | longue            | juste   |
| หก      | ห haute, syllabe morte, brève          | bas              | courte            | juste   |
| เจ็ด    | จ moyenne, syllabe morte, brève        | bas              | courte            | juste   |
| แปด     | ป moyenne, syllabe morte, longue       | bas              | longue            | juste   |
| เก้า    | ก moyenne, mai tho                     | descendant       | longue            | juste   |
| สิบ     | ส haute, syllabe morte, brève          | bas              | courte            | juste   |
| ยี่     | ย basse, mai ek                        | descendant       | longue            | juste   |
| เอ็ด    | อ moyenne, syllabe morte, brève        | bas              | courte            | juste   |
| ร้อย    | ร basse, mai tho                       | haut             | longue            | juste   |
| ศูนย์   | ศ haute, syllabe vive                  | montant          | longue            | juste   |
| ยี่สิบ  | composition                            | descendant + bas | longue + courte   | juste   |
| สิบเอ็ด | composition                            | bas + bas        | courte + courte   | juste   |

Contrôles dérivés vérifiés eux aussi :

- Page 2 annonce **six tons bas, deux montants, deux descendants** sur les dix
  premiers nombres. Recompté : bas หนึ่ง สี่ หก เจ็ด แปด สิบ (6), montant สอง
  สาม (2), descendant ห้า เก้า (2). Juste.
- Page 3 annonce **quatre brefs, six longs**. Recompté : brefs หนึ่ง หก เจ็ด สิบ
  (4), longs สอง สาม สี่ ห้า แปด เก้า (6). Juste.
- Item 8 : la liste de dix tons et la liste de dix longueurs pour ๐ à ๙ sont
  exactes, dans l'ordre.
- Transcriptions : les 16 formes respectent l'amendement v1.1 sans exception,
  graphèmes sans accent (`ue`, `ae`, `aw`, `ou`, `e`), doublement de la dernière
  lettre du graphème pour la longue (`aww`, `aee`, `ouu`, `aa`, `ii`), ton porté
  sur la PREMIÈRE lettre du noyau. `sǒuun`, `pàeet`, `sǎwwng` et `ráwwi` sont
  conformes. Aucune transcription en v1.0 résiduelle.

### 1.3 Royal Institute Dictionary 2554 (46 contrôles, 0 écart)

J'ai réinterrogé **les 34 mots** du dossier, un par un, requête POST sur
`func_lookup.php`, espacées de 1,4 seconde, agent utilisateur identifiant
l'audit. Résultat : **19 trouvés, 15 absents**, exactement le décompte annoncé.

Contenus vérifiés mot pour mot, sans reproduction de définition dans le produit :

- « เอ็ด ๑ » définit bien เอ็ด comme หนึ่ง pour les nombres se terminant par ๑, et
  **donne bien ๑๑ et ๑๐๑ en exemple**. La leçon décrit cette entrée avec exactitude.
- « ยี่ ๑ » donne bien la valeur « deux » dans ยี่สิบ et la valeur ordinale pour
  เดือนยี่ décrit comme le 2e mois lunaire. Conforme.
- « ยี่สิบ » définit bien la valeur comme dix pris deux fois. Conforme.
- « ร้อย ๑ » définit bien la valeur comme dix pris dix fois, avec ๑๐๐ en chiffres,
  et les homographes « ร้อย ๒ » (enfiler) et « ร้อย ๓ » (grade) existent. Conforme.
- « ร้อยเอ็ด » porte bien deux valeurs, dont ๑๐๑ en chiffres, avec un exemple
  lexicalisé. Conforme sur la structure, **pas sur la traduction retenue** (F2).
- « หก » porte bien **trois** entrées, la troisième étant le numéral. Conforme.
- « สิบ ๑ » numéral, « สิบ ๒ » grade de sous-officier. Conforme.
- « แปด ๑ » numéral, « แปด ๒ » verbal. Conforme.
- « ศูนย-, ศูนย์ » donne bien le chiffre ๐ parmi ses sens. Conforme, y compris la
  forme groupée de la vedette citée par la leçon.
- « ไม้ไต่คู้ » décrit bien un signe qui donne au mot un son bref. Conforme.
- « สามสิบ » n'est bien qu'un renvoi vers รากสามสิบ. La réserve de l'item 4 est
  exacte et honnête.
- « บาท ๒ » est bien l'unité monétaire. Conforme.
- Les 15 absences annoncées sont **toutes** confirmées : สิบเอ็ด, ยี่สิบเอ็ด,
  ยี่สิบสอง, สองสิบ, สิบหนึ่ง, หนึ่งสิบ, ยี่สิบหนึ่ง, สี่สิบ, ห้าสิบ, หกสิบ,
  เจ็ดสิบ, แปดสิบ, เก้าสิบ, เลขไทย, สิบสอง.

### 1.4 VOLUBILIS v26.2 (42 contrôles, 0 écart de contenu)

J'ai réextrait `content.xml` du fichier `VOLUBILIS.ods` (15 724 718 octets, soit
les 15,7 Mo annoncés) et parcouru les 114 577 entrées avec un parseur SAX écrit
pour cet audit, sans faire confiance aux extractions antérieures.

- `meta.xml` donne `dc:date` **2026-07-01**, conforme.
- La ligne d'en-tête est bien `ThaiRom`, `EasyThai`, `ThaiPhon`, `Etymo`, `THA`,
  `ENG`, `FRA`, `LEV`, `TYPE`, `USAGE`, `DOM`, `KEY`. Les index de colonnes
  annoncés par la leçon (0, 2, 4, 5, 6, 7, 8) sont **exacts**.
- **29 graphies retrouvées**, avec romanisation, glose française, `TYPE` et
  `LEV` conformes à ce qu'annonce la leçon, y compris les détails que l'auteur
  aurait pu inventer et qui se révèlent vrais :
  - หนึ่ง a bien **deux** lignes, `num.` « un » et `art.` « un ; une » (L63029 et
    L63030) ;
  - เอ็ด n'a bien **que** l'homographe verbal, `v.` « crier ; faire du vacarme »
    et `adj.` « bruyant » (L13395 et L13396), **aucun sens numéral**. La réserve
    consignée à l'item 5 est exacte ;
  - หก a bien trois lignes dont « Loriculus » (le genre de perroquet) et
    « se renverser » ;
  - สิบ a bien trois lignes dont le grade et « dizaine [f] » ;
  - les sept dizaines existent avec exactement les romanisations annoncées,
    y compris l'incohérence `si-sip` de la base ;
  - ยี่สิบเอ็ด existe (L117280, `yīsip-et`, « vingt-et-un », num.), ce qui sauve
    l'item 6 malgré le 404 de th.wiktionary ;
  - ร้อยเอ็ด a bien deux lignes, `num.` « cent un » et `n. prop.` « Roi Et ».
- **Les 12 absences annoncées sont toutes confirmées** : สองสิบ, สิบหนึ่ง,
  หนึ่งสิบ, ยี่สิบหนึ่ง, สองร้อย, หนึ่งร้อยเอ็ด, เก้าสิบเก้า, สามสิบห้า,
  สี่สิบห้า, ๐, ๑ et ๒.

### 1.5 Wiktionary (86 contrôles, 0 écart)

- **Les 68 URLs citées ont été interrogées une à une : 68 réponses HTTP 200.**
  Aucune URL inventée, aucune URL morte. Le décompte 30 en plus 38 th recollé
  depuis le fichier lui-même donne bien 68 URLs distinctes.
- Contenus vérifiés à la source, tous conformes : note d'usage de สอง sur ยี่
  en position de dizaine ; note d'usage de สิบ contre หนึ่งสิบ ; note d'usage de
  ยี่ limitée à ยี่สิบ et เดือนยี่ ; définition de ไม้ไต่คู้ « which shortens
  vowels » citée mot pour mot ; เอ็ด « one (when used as part of another
  numeral) » avec สิบเอ็ด et ยี่สิบเอ็ด en exemples ; les trois lectures de ๑
  (หนึ่ง, เอ็ด, อ้าย) et de ๒ (สอง, ยี่, โท) ; respelling ก้าว de เก้า et ฮ่า de
  ห้า ; romanisations Paiboon `nʉ̀ng`, `bpɛ̀ɛt`, `gâao`, `rɔ́ɔi`, `sɔ̌ɔng` ;
  IPA de เก้าสิบ, หกสิบ, ยี่สิบห้า, สามสิบห้า et ยี่สิบเอ็ด ; définition
  th.wiktionary des dizaines comme « dix pris N fois ».
- **Les deux 404 annoncés sont réels** : th.wiktionary n'a ni ยี่สิบเอ็ด ni
  สามสิบห้า. L'asymétrie consignée à l'incertitude 5 est honnête.

### 1.6 FrequencyWords (17 contrôles, 0 écart de valeur)

J'ai téléchargé la liste et confronté les 17 rangs et fréquences annoncés.
**17 sur 17 exacts**, au rang et à la fréquence près, sur
`content/2018/th/th_50k.txt`. Voir toutefois F6 sur le millésime.

### 1.7 Corrigés d'exercices (25 tirages, 0 corrigé faux)

Les 25 tirages ont été recalculés indépendamment.

- Exercice 1 `listening`, 8 tirages : les 8 réponses sont justes, et **aucun
  distracteur n'est une forme correcte de la cible**. Les triplets 2/10/12/20 et
  1/10/11/21 sont bien construits, ils forcent la discrimination visée.
- Exercice 2 `word_order`, 5 tirages : 30 = สาม สิบ, 20 = ยี่ สิบ, 11 = สิบ เอ็ด,
  21 = ยี่ สิบ เอ็ด, 90 = เก้า สิบ. Les 5 sont justes. Chaque tirage porte au
  moins une étiquette distractrice réellement fausse (หนึ่ง, สอง, ยี่, เอ็ด,
  ร้อย selon les cas), donc l'erreur est possible et l'exercice mesure quelque
  chose.
- Exercice 3 `recall`, 5 tirages : les réponses et les variantes acceptées sont
  cohérentes avec la v1.1. Les deux refus explicites sont fondés : `sawwng…` pour
  20 et `sìp·nùeng` pour 11 sont bien des formes que les dictionnaires ne
  connaissent pas, et `kao·sip` perd effectivement la longueur de เก้า.
- Exercice 4 `reading`, 7 tirages : ๕ = 5, ๗ = 7, ๙ = 9, ๑๐ = 10, ๒๐ = 20,
  ๒๑ = 21, ๑๐๐ = 100. Les 7 sont justes.

### 1.8 Décomptes internes recalculés (6 contrôles, 1 écart)

Recomptés depuis le fichier : 18 vedettes RID retenues, 15 absences RID, 34
requêtes RID, 47 graphies VOLUBILIS dont 12 absentes, 68 URLs Wiktionary (30 plus
38), 25 mots thaïs enseignés. **Cinq concordent, un est contradictoire (F5).**

## 2. Findings bloquants

### B1. เอ็ด : la leçon dit que อ ne se prononce pas comme une consonne, son propre IPA dit le contraire

`note_fr` de l'item 5 : « La syllabe commence par อ, la lettre d'appui vue en 1A,
qui ne se prononce pas comme une consonne ici : la transcription commence donc
directement par la voyelle. »

Trois contradictions :

1. L'`ipa` du même item est `/ʔet̚˨˩/`. Le `/ʔ/` initial **est** une consonne, le
   coup de glotte. Deux champs du même item se contredisent.
2. `unite-01/lecon-1a.md` enseigne อ avec la valeur initiale `/ʔɔː˧/`, décrite en
   toutes lettres comme un coup de glotte et sourcée sur en.wiktionary. La leçon
   3B contredit un fait déjà enseigné et sourcé en 1A tout en s'en réclamant.
3. La dérivation du ton bas de เอ็ด repose précisément sur le fait que อ est une
   consonne de **classe moyenne**. Si อ ne se prononçait pas, la règle de ton
   n'aurait aucun point d'application.

Le nom « lettre d'appui » est en outre introduit en **2A** (« Et อ, la lettre
d'appui de… »), pas en 1A. Le renvoi est donc doublement inexact.

Correction attendue : dire que อ porte ici un coup de glotte à l'attaque, que la
transcription Thaïnaute ne le note pas, et renvoyer à 1A pour la lettre et à 2A
pour le rôle d'appui. Ne pas nier la consonne.

### B2. Note culturelle : « quantité innombrable » sur-traduit les sources, et « ancienne et figurée » est mono-sourcé

Texte affiché : « La seconde est ancienne et figurée : ร้อยเอ็ด y désigne une
quantité innombrable, comme notre "trente-six". »

Ce que disent réellement les sources que j'ai rouvertes :

- RID 2554, « ร้อยเอ็ด » sens (๒) : `เป็นจำนวนมากตั้งร้อย`, c'est-à-dire une
  grande quantité **de l'ordre de la centaine**. Aucune marque d'archaïsme,
  aucune marque de figuré, et surtout pas « innombrable ».
- en.wiktionary : « (archaic and figurative) many ; a good many ; numerous ».
  « Numerous » n'est pas « innombrable ».
- th.wiktionary : `เป็นจำนวนมากตั้งร้อย`, sans étiquette.

Deux défauts distincts :

1. **Sens sur-traduit.** « Innombrable » veut dire « qu'on ne peut pas compter ».
   Les deux autorités disent l'inverse, une grande quantité chiffrée autour de
   cent. C'est un glissement de sens dans un texte affiché à l'apprenant.
2. **Fait mono-sourcé.** L'étiquette « ancienne et figurée » ne repose que sur
   en.wiktionary. Le dossier de production de la leçon pose lui-même que « les
   deux éditions sont traitées comme UN seul écosystème ». Le RID, seule autre
   autorité, ne porte aucune marque. Le seuil de deux sources indépendantes
   n'est pas atteint pour cette qualification.

Accessoirement, le qualificatif « du nord-est » appliqué à la province ne
figure que sur th.wiktionary (`ภาคตะวันออกเฉียงเหนือ`). VOLUBILIS ne donne que
« Roi Et » et en.wiktionary « a province of Thailand ». Le fait est vrai, mais il
est également mono-écosystème tel qu'il est sourcé.

### B3. « comme notre trente-six » : affirmation sur le français à zéro source, contre la règle que la leçon s'impose elle-même

La même phrase de la note culturelle énonce un fait sur la numération
**française**, l'emploi de « trente-six » pour une quantité indéfinie. Aucune
source n'est citée pour ce fait.

Or le dossier de production de la leçon écrit, section « Choix pédagogiques » :
« **Aucune affirmation sur le français.** Conformément au finding B6 de la
leçon 2A, la leçon n'énonce rien sur la phonétique ou sur la numération du
français. »

J'ai rouvert `unite-02/verification-2a.md` : le finding B6 s'intitule « Fait
enseigné à zéro source : l'affirmation sur le p français ». La leçon 3B reproduit
exactement le défaut qu'elle prétend avoir évité, et affirme le contraire dans son
propre dossier. Il faut soit sourcer, soit retirer l'analogie, soit corriger la
phrase du dossier qui est fausse en l'état.

### B4. Prérequis mal cité : 1D n'enseigne pas le ton descendant

Méta, cible phonétique : « la leçon réinvestit le ton bas de 1C sur six mots
consécutifs, **les tons montant et descendant de 1D**, la longueur vocalique de
1B… »

`unite-01/lecon-1d.md` s'intitule « Montant contre haut ». Sa cible phonétique
déclarée est « ton montant /˩˩˦/ contre ton haut /˦˥/ ». Ses dix items portent
uniquement un ton montant ou un ton haut ; **aucun ne porte de ton descendant**.
Le ton descendant est posé en 1A parmi les cinq contours et réinvesti en 1E sur
ค่ะ (khâ).

Deux mots de la leçon 3B portent un ton descendant, ห้า et เก้า, plus ยี่. Leur
prérequis réel est 1A et 1E, pas 1D. Le renvoi doit être corrigé, sinon la
consolidation de l'unité 3 séquencera la leçon sur un acquis inexistant.

La même phrase contient une seconde inexactitude, mineure : les six mots à ton bas
sont หนึ่ง (1), สี่ (4), หก (6), เจ็ด (7), แปด (8) et สิบ (10). Ils ne sont pas
« consécutifs ».

## 3. Findings mineurs

### M1. Décompte FrequencyWords contradictoire dans le même fichier

Section « Sources employées » : « **17 formes cherchées, 17 trouvées** ».
Section « Décompte des consultations » : « 1 liste, **16 formes cherchées, 16
trouvées** ». Le chiffre juste est 17, soit les 16 formes enseignées plus บาท.
La section « Décompte » se présente comme recomputable depuis le fichier ; elle
ne l'est pas sur ce point.

### M2. FrequencyWords cité sans millésime ni URL

La leçon écrit « liste `th_50k` » sans indiquer le sous-répertoire ni l'URL,
alors que toutes les autres sources portent une adresse exacte. J'ai vérifié les
deux millésimes disponibles :

- `content/2018/th/th_50k.txt` : **les 17 valeurs correspondent exactement** ;
- `content/2016/th/th_50k.txt` : **aucune ne correspond**, et 10 des 17 formes y
  sont carrément absentes, dont สิบ, ร้อย, ยี่สิบ et สิบเอ็ด.

Un relecteur qui ouvrirait le fichier 2016 conclurait à une invention. Ajouter
`https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_50k.txt`.

### M3. VOLUBILIS cité sans identifiant de ligne, sans artefact d'unité

Aucune citation VOLUBILIS de la leçon ne porte de numéro de ligne, et
`unite-03/verification-volubilis.md` n'existe pas. C'est exactement le défaut que
le finding B1 de `unite-02/verification-2b.md` avait jugé bloquant, avec ce
motif : les citations « portaient une date mais aucune URL, aucun numéro
d'entrée et aucun artefact reproductible, ce qui faisait retomber de fait les
huit items sur le seul écosystème Wikimedia ».

L'enjeu est réel pour 3B : le RID **n'a aucune entrée** pour les sept dizaines,
pour สิบสอง ni pour ยี่สิบห้า. Si VOLUBILIS ne tient pas, l'item 4 tout entier
retombe sur le seul écosystème Wikimedia et devient mono-sourcé.

J'ai fait le travail à la place du dossier et les citations se révèlent exactes.
Les lignes à consigner : หนึ่ง 63029 et 63030, สอง 97075, สาม 89867, สี่ 94960,
ห้า 15033, หก 16554 à 16556, เจ็ด 20219, แปด 67975, เก้า 29048, สิบ 96037 à
96039, ยี่ 116882, ยี่สิบ 117279, เอ็ด 13395 et 13396, สิบเอ็ด 96048,
ยี่สิบเอ็ด 117280, สามสิบ 90742, สี่สิบ 96206, ห้าสิบ 15789, หกสิบ 16605,
เจ็ดสิบ 20246, แปดสิบ 67982, เก้าสิบ 29140, ร้อย 86074 à 86076, หนึ่งร้อย 63052,
ศูนย์ 98264 à 98268, ร้อยเอ็ด 86086 et 86087, สิบสอง 96096, ยี่สิบห้า 117282,
บาท 4656 à 4659.

### M4. Item 4 : « quatre-vingt » sans s

Le champ `fr` de l'item 4 donne « quatre-vingt » pour 80. En français,
« quatre-vingts » prend le s quand il termine le nombre. La glose VOLUBILIS
reproduite porte la même graphie, mais VOLUBILIS n'est pas une autorité
d'orthographe française et ce champ est affiché à l'apprenant.

Le même champ abrège trois gloses sans le signaler : la base donne
« soixante-dix [m] ; septante (Belg., Sui.) », « quatre-vingt [m] ; octante
(Sui.) » et « quatre-vingt-dix [m] ; nonante (Belg., Sui.) ».

### M5. Item 3 : « de forme ancienne » n'est sourcé nulle part

Le champ `litteral` de ยี่สิบ dit « "deux" de forme ancienne ». Aucune source
citée ne qualifie ยี่ d'ancien. Le RID « ยี่ ๑ » dit `ว. สอง ในคำว่า ยี่สิบ,
ที่สอง เช่น เดือนยี่` ; sa mention `โบราณใช้ว่า ญี่ ก็มี` porte sur la **graphie
ญี่**, pas sur ยี่. en.wiktionary ne porte aucune marque « archaic » sur ยี่ ; il
donne une simple note de distribution. Retirer « de forme ancienne » ou sourcer.

### M6. Contradiction interne sur la leçon 3A

Méta : « La leçon 3A est rédigée en parallèle ». Incertitude 10 : « 3A n'existe
pas encore au moment de la rédaction ». Les deux ne peuvent pas être vraies
ensemble, et `content/authoring/unite-03/lecon-3a.md` existe bel et bien
(58 621 octets). Aligner les deux passages.

### M7. `aao` est justifié par `aai`, qui n'est pas ratifié non plus

Le dossier justifie l'extension `aao` ainsi : « L'unité 1 a déjà posé `aai` pour
/aːj/ ». C'est vrai des fichiers de l'unité 1, mais `aai` **ne figure pas dans
`CONVENTIONS.md`** : l'amendement v1.1 ne liste que `ai` pour /aj/ et `ao` pour
/aw/. La leçon signale honnêtement que `awwi` dépend de `awi`, encore ouvert
depuis 2C ; elle ne signale pas que `aao` dépend d'un `aai` tout aussi ouvert.
L'incertitude 6 doit mentionner cette seconde dépendance.

### M8. Exercice 4 : deux pièges annoncés sans fondement

- « confondre ๑ et ๙, ainsi que ๖ et ๘, dont les tracés se ressemblent à petite
  taille » : affirmation typographique non sourcée, alors qu'elle détermine la
  composition des distracteurs des tirages 2 et 3. À trancher par l'audit
  d'accessibilité du rendu, déjà prévu, et non par assertion.
- « oublier que ๐ ne se lit pas comme un chiffre plein » : la formule est fausse
  ou au mieux inintelligible. ๐ est un chiffre à part entière, il se lit ศูนย์,
  et l'item 8 l'enseigne comme tel. Reformuler en visant ce qui est réellement
  mesuré, la valeur positionnelle dans ๑๐ et ๑๐๐.

Point connexe, non compté comme finding : le spécimen de la page 1 affiche
« ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙ ๑๐ » avant toute présentation des chiffres thaïs, qui
n'arrive qu'à la page 8. L'ordre pédagogique mérite un regard à la consolidation.

## 4. Ce que je n'ai PAS pu invalider

Par honnêteté d'auditeur, la leçon résiste à l'essentiel de l'attaque.

- Aucune graphie fausse. Aucun ton faux. Aucune longueur fausse. Aucun IPA faux.
- Aucun corrigé d'exercice faux sur 25 tirages, et aucun distracteur qui serait
  en réalité une réponse acceptable.
- Aucune source inventée : 68 URLs sur 68 répondent, 34 requêtes RID sur 34
  donnent le résultat annoncé, 41 lignes VOLUBILIS sur 41 concordent, 17 valeurs
  de fréquence sur 17 sont exactes au chiffre près.
- Les réserves que la leçon consigne elle-même sont vraies et vérifiables : le
  RID ne connaît pas les dizaines composées, VOLUBILIS ne connaît pas le sens
  numéral de เอ็ด, th.wiktionary n'a ni ยี่สิบเอ็ด ni สามสิบห้า, สามสิบ n'existe
  au RID que comme renvoi vers un nom de plante. Aucune de ces faiblesses n'a
  été dissimulée.
- Les deux irrégularités enseignées, ยี่สิบ et เอ็ด, sont les deux mieux sourcées
  de la leçon, chacune avec une entrée RID dédiée qui les fonde explicitement.
- La v1.1 de la transcription est appliquée sans écart.

## 5. Portes à franchir avant `draft → review`

1. Corriger B1, B2, B3 et B4. B2 et B3 portent sur du texte affiché à
   l'apprenant : les corriger d'abord.
2. Créer `unite-03/verification-volubilis.md` avec les numéros de ligne donnés en
   M3, et ajouter l'URL millésimée de FrequencyWords (M2).
3. Corriger le décompte 16/17 (M1), le « quatre-vingt » (M4), le « de forme
   ancienne » (M5), la contradiction 3A (M6), la dépendance `aai` (M7) et les
   deux pièges de l'exercice 4 (M8).
4. Les portes déjà identifiées par l'auteur restent ouvertes et cet audit ne les
   lève pas : contre-vérification manuelle RID, troisième autorité pour le sens
   numéral de เอ็ด, ratification de `aao` et `awwi`, description sourcée du r
   initial, production audio, audit d'accessibilité du rendu thaï.
5. Revue native : en attente. Aucune leçon de l'unité 3 n'est publiable.

## 6. Outillage de cet audit

Reproductible. Scripts écrits pour ce contre-audit, conservés au brouillon de
session : recalcul NFC et codepoints en Node ; interrogation RID mot par mot en
Node avec espacement de 1,4 s et agent utilisateur identifiant l'audit ;
parseur SAX Python sur `content.xml` réextrait de `VOLUBILIS.ods` ; contrôle
HTTP des 68 URLs Wiktionary ; confrontation des deux millésimes de
FrequencyWords ; lecture directe de `UnicodeData.txt` et de
`IndicPositionalCategory.txt`.

Aucune définition du RID n'est reproduite dans le produit. Les extraits thaïs
figurant ci-dessus servent uniquement de preuve de consultation, conformément à
`docs/content-policy/sources-verification.md`.
