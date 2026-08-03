# Contre-audit adversarial de la leçon 4A

- Fichier audité : `content/authoring/unite-04/lecon-4a.md`
- Date de l'audit : 2026-08-03
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), consigne adversariale, mandat
  de trouver des erreurs et non de confirmer.
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Le RID a
  été interrogé directement, graphie par graphie, par requête POST sur
  `dictionary.orst.go.th/func_lookup.php` (`funcName=lookupWord`,
  `status=lookup`, en-tête `x-requested-with: XMLHttpRequest`, requêtes espacées
  de 1,3 seconde, agent utilisateur identifiant le projet et l'objet du
  contrôle). Les pages Wiktionary ont été rechargées, en rendu et, pour les cas
  litigieux, en wikitexte brut (`action=raw`). Le chapitre 16 du standard
  Unicode a été rouvert. Les tons ont été RECALCULÉS depuis la classe de
  l'initiale, la marque de ton et le type de syllabe, sans regarder le champ
  `ton` de la leçon. Les `codepoints` et la stabilité NFC ont été recomputés par
  outil depuis les chaînes du fichier. Conformément à
  `docs/content-policy/sources-verification.md`, aucune définition du RID n'est
  reproduite ici : seules la présence des vedettes, leur nombre, la concordance
  des sens et la FORME des séries d'exemples sont consignées, par référence.
- Non vérifiable par cet audit : `VOLUBILIS.ods` n'est pas au dépôt et n'a pas
  été téléchargé. Aucun numéro de ligne VOLUBILIS n'a pu être rouvert dans le
  classeur. Les recoupements possibles ont été faits contre
  `unite-03/verification-volubilis.md`, qui transcrit certaines des mêmes
  lignes.

## Verdict

61 faits re-vérifiés indépendamment et confirmés. 3 findings bloquants,
9 findings non bloquants. La leçon reste `draft` et n'est pas prête pour
`review`.

Point important pour le fondateur : **la règle de ton enseignée en 4A est
juste**, et c'était le principal risque de contamination du parcours. Le thaï de
la leçon est également juste : graphie, séquence NFC, ton, longueur, IPA, sens
et registre des sept items sont exacts, et l'homophonie ก้าว / เก้า, qui
paraissait suspecte au premier regard, est réelle et correctement sourcée. Les
trois findings bloquants portent sur deux affirmations fausses au sujet de
sources nommées, et sur le fait que deux des sept items du jour sont déjà des
items publiés de l'unité 1, ce que la leçon ignore et ce qui vide l'exercice 4
de sa validité de mesure.

## Ce que l'audit a confirmé lui-même

### La règle de ton, recalculée puis re-sourcée

La règle de la page 6 est le fait porteur de la leçon. Elle a été contrôlée
contre le RID interrogé aujourd'hui, sans passer par la leçon.

- Entrée `อักษรสูง` : la classe haute est bien définie par un ton de base
  จัตวา, c'est-à-dire montant, pour le mot vivant, et l'entrée énumère bien
  onze lettres, ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห.
- Entrée `อักษรกลาง` : la classe moyenne est bien définie par un ton de base
  สามัญ, c'est-à-dire moyen, pour le mot vivant, et l'entrée énumère bien neuf
  lettres, ก จ ฎ ฏ ด ต บ ป อ.
- Entrée `คำเป็น` : la définition de la syllabe vivante correspond bien à
  « voyelle longue sans consonne finale, plus les séries กง กน กม เกย เกอว »,
  donc aux finales ง น ม ย ว. La page 6 la reprend fidèlement.
- Entrée `วรรณยุกต์, วรรณยุต` : cinq tons nommés, quatre marques. Conforme.

Verdict : **la règle « consonne moyenne, ton moyen ; consonne haute, ton
montant, en syllabe vivante sans marque » est exacte, et elle est correctement
restreinte**. Aucun contre-exemple n'a pu être construit dans le périmètre où la
leçon l'applique, y compris sur les clusters (ปลา se décide bien sur ป) et sur
les syllabes à voyelle brève plus finale sonore (กิน, ผม). La leçon a eu raison
de rester à deux classes et d'exclure explicitement les syllabes marquées, la
classe basse et les syllabes mortes.

### Tons, longueurs et IPA, recalculés sans regarder la leçon

| Graphie           | Classe, marque, type de syllabe | Ton recalculé | Ton déclaré | Verdict |
| ----------------- | ------------------------------- | ------------- | ----------- | ------- |
| กิน               | moyenne, nue, vivante brève + น | moyen         | moyen       | OK      |
| ไก่               | moyenne + mai ek                | bas           | bas         | OK      |
| ไข่               | haute + mai ek                  | bas           | bas         | OK      |
| ก้าว              | moyenne + mai tho               | descendant    | descendant  | OK      |
| ข้าว              | haute + mai tho                 | descendant    | descendant  | OK      |
| ขาว               | haute, nue, vivante longue + ว  | montant       | montant     | OK      |
| ขา                | haute, nue, vivante longue      | montant       | montant     | OK      |
| ค้า               | basse + mai tho                 | haut          | haut        | OK      |
| น้ำ               | basse + mai tho                 | haut          | haut        | OK      |
| ร้อย              | basse + mai tho                 | haut          | haut        | OK      |
| ไม้               | basse + mai tho                 | haut          | haut        | OK      |
| ตา, ปลา, อัน      | moyenne, nue, vivante           | moyen         | moyen       | OK      |
| ผม, ฉัน, สาม, สอง | haute, nue, vivante             | montant       | montant     | OK      |

Longueurs vérifiées de la même façon : ไก่ et ไข่ brèves, ก้าว, ข้าว, ขาว et ขา
longues, กิน brève. Conforme aux champs déclarés.

### Le point qui paraissait faux et qui ne l'est pas

`ก้าว` et `เก้า` sont annoncés comme homophones exacts par l'item 4. La graphie
เ-า note normalement une voyelle brève, et l'unité 1 enseigne elle-même le
contraste de longueur เขา contre ขาว, ce qui rendait l'affirmation suspecte.
Contrôle fait :

- en.wiktionary `เก้า`, rechargée aujourd'hui : respelling phonémique ก้าว,
  IPA /kaːw˥˩/, Paiboon gâao, ligne « Homophones » portant ก้าว ;
- en.wiktionary `ก้าว` : IPA /kaːw˥˩/, ligne « Homophones » portant เก้า ;
- témoin de contrôle en.wiktionary `เขา` : IPA /kʰaw˩˩˦/, voyelle brève.

Le témoin prouve que Wiktionary ne traite pas เ-า comme long par défaut : la
longueur de เก้า est une irrégularité réellement documentée, pas un artefact.
La deuxième jambe existe hors Wikimedia, VOLUBILIS donnant la même chaîne
`\kāo` pour les deux graphies. **L'item 4 est juste, y compris l'avertissement
de l'incertitude 4 qui interdit de « corriger » l'une des deux transcriptions.**

Même contrôle sur `ไม้`, transcrit `máai` à l'exercice 2, ce qui contredit en
apparence `kài` pour ไก่ : en.wiktionary donne le respelling ม้าย et
IPA /maːj˦˥/. La voyelle est bien longue, la transcription est juste, et
l'asymétrie avec ไก่ est réelle et non une faute de convention.

### RID, relevé refait graphie par graphie

Vérifiés présents, avec le nombre de vedettes annoncé par la leçon et un sens
concordant : กิน, ไก่, ไข่ (deux vedettes), ก้าว, ข้าว (vedette unique), ขาว
(deux vedettes), ขา (quatre vedettes), ค้า (avec le groupement « ค้า ๒, ค้าค้า »
exactement tel qu'annoncé), ข้าวสวย, ถุง, ฉิ่ง ๑, ผึ้ง ๑, หีบ ๑, เสือ ๑, ฤๅษี.

Vérifiés absents comme vedettes, exactement comme annoncé : ไก่ทอด, กินข้าว,
อักษรสามหมู่.

Lettres vérifiées une à une, rang, nom de récitation et classe : ก 1re, กอ ไก่,
moyenne ; ข 2e, ขอ ไข่, haute ; ค 4e, คอ ควาย, basse ; ฃ 3e, ฃอ ขวด, haute et
signalée abandonnée par le dictionnaire lui-même ; ฐ 16e, ฐอ ฐาน, haute ; ฉ 9e,
ฉอ ฉิ่ง, haute ; ถ 22e, ถอ ถุง, haute ; ผ 28e, ผอ ผึ้ง, haute ; ฝ 29e, ฝอ ฝา,
haute ; ศ 38e, ศอ ศาลา, haute ; ษ 39e, ษอ ฤๅษี, haute ; ส 40e, สอ เสือ, haute ;
ห 41e, หอ หีบ, haute. Les lectures entre crochets citées par le dossier, dont
[สอ] pour ศ comme pour ษ comme pour ส, sont exactes.

Le fait le plus délicat de la page 4, « le dictionnaire emploie une seule et
même entrée pour กินข้าว et pour กินน้ำ », est **confirmé** : l'entrée กิน porte
bien les deux emplois dans son premier bloc verbal.

### Wiktionary et Unicode

- Annexe `Appendix:Thai script` : la colonne `Class` vaut bien `high` pour les
  neuf lettres, ฉ comprise ; les colonnes `Royal Thai Initial` et `IPA Initial`
  donnent bien k /k/, kh /kʰ/, ch /tɕʰ/, th /tʰ/, ph /pʰ/, f /f/, s /s/, h /h/
  aux lettres citées ; les mots-images et leurs gloses anglaises correspondent.
- Le défaut `{{xlit}}` signalé par le dossier est réel : la page en.wiktionary de
  ษ porte littéralement `{{xlit|th|ศอ รือ-สี}}`, avec ศ à la place de ษ. La
  leçon a eu raison de suivre le RID.
- en.wiktionary `ฐ` porte bien « This is a rare Thai letter » et la note de
  classe haute. La phrase de la page 5 sur ฐ est donc sourcée.
- Unicode 17.0.0, chapitre 16 « Southeast Asia-I », section 16.1 « Thai » :
  la sous-section « Encoding Principles » existe, et le standard y énonce bien
  que les classes de consonnes indiquent en thaï moderne des différences de ton.
  La citation de la jambe n° 3 est fidèle.

### Contrôle mécanique du fichier, recomputé

Extraction indépendante de toutes les suites U+0E00 à U+0E7F puis comparaison
NFC :

- fichier stable en NFC : oui ;
- 164 chaînes thaïes distinctes, 0 instable. Le décompte de la leçon est exact ;
- 7 champs `codepoints` recalculés depuis leur champ `thai` : 7 exacts, 0 écart ;
- 6 couples graphie plus séquence cités en prose : 6 exacts, 0 écart ;
- 0 tiret cadratin U+2014, 0 demi-cadratin U+2013, 0 U+2015, 0 U+2212, 0
  apostrophe droite, 340 apostrophes U+2019. Les six décomptes typographiques
  annoncés sont exacts au caractère près.

### Corrigés et distracteurs

Les 25 corrigés des quatre exercices ont été recalculés. Aucun corrigé faux.
Aucun distracteur qui serait en réalité une bonne réponse. L'exercice 2 est
bien équilibré, quatre montants et quatre hauts, huit mots distincts, et les
quatre mots à ton haut sont bien des initiales de classe basse portant ไม้โท,
ce qui est cohérent avec le fait que la leçon n'enseigne pas encore à lire ce
ton. Les textes de correction de l'exercice 4 nomment les bonnes classes pour
les six mots.

## Findings bloquants

### B1. La série d'exemples attribuée au RID n'est pas celle du RID

Section « Sources du bloc d'écriture, partie 2 », premier point, sous-puce :

> **La série d'exemples du dictionnaire est exactement celle de la leçon 1A**,
> คา ข่า ค่า ค้า ขา. [...] Cette coïncidence n'a pas été cherchée ; elle est
> signalée parce qu'elle explique rétrospectivement le choix de 1A.

C'est faux, et le dossier se contredit lui-même deux phrases plus haut, où il
énonce correctement que le RID donne ขา ข่า ข้า à `อักษรสูง` et
กา ก่า ก้า ก๊า ก๋า à `อักษรกลาง`. Relevé refait aujourd'hui : la série de
`อักษรสูง` compte trois formes, celle de `อักษรกลาง` cinq formes toutes bâties
sur ก, et celle de `อักษรต่ำ` trois formes bâties sur ค. Aucune n'est
คา ข่า ค่า ค้า ขา, qui est une série pédagogique mixant classe basse et classe
haute. La « coïncidence » n'existe pas, et la conclusion qu'elle « explique
rétrospectivement le choix de 1A » est bâtie sur du vide.

Correction attendue : supprimer la sous-puce, ou la réécrire en disant
exactement ce qui est vrai, à savoir que ขา, premier mot de la démonstration du
RID pour la classe haute, est aussi l'item 7 de cette leçon.

### B2. L'écart Wiktionary sur ฉ est un écart inexistant

Section « Sources du bloc d'écriture, partie 1 », point 2 :

> **Écart relevé et tranché** : la page en.wiktionary de ฉ ne comporte
> aujourd'hui aucune section « Letter » pour le thaï, donc aucune note de
> classe ; sa classe n'est attestée dans l'écosystème Wikimedia que par le
> tableau de l'annexe.

Faux. Wikitexte brut rechargé aujourd'hui : la section `==Thai==` contient une
`====Letter====` sous `===Etymology 2===`, avec `{{xlit|th|ฉอ ฉิ่ง}}` et le
rang de neuvième consonne, suivie d'une `=====Usage notes=====` portant
littéralement « This letter belongs to the Thai high consonant class ». La
deuxième jambe de preuve pour ฉ est donc exactement aussi solide que pour les
huit autres lettres.

L'erreur va dans le sens prudent, elle sous-estime la preuve au lieu de la
gonfler, et le fait lui-même reste vrai. Elle est néanmoins bloquante : un
dossier d'audit qui affirme avoir constaté une absence sur une page publique
qui contient la chose est un dossier dont les autres constats deviennent
invérifiables par principe.

Correction attendue : supprimer l'écart, ou le remplacer par le constat réel.

### B3. ขาว et ข้าว sont donnés comme nouveaux alors qu'ils sont publiés depuis 1B

Contrôle fait dans le dépôt : `unite-01/lecon-1b.md` porte `#### Item 2 : ข้าว`
(transcription `khâao`, IPA /kʰaːw˥˩/, ton descendant, longueur longue) et
`#### Item 4 : ขาว` (transcription `khǎao`, IPA /kʰaːw˩˩˦/, ton montant). La
leçon 1B les enseigne, les oppose à เข้า et เขา, les fait discriminer à l'écoute
et fait produire `khâao` en transcription. Ses cartes SRS couvrent ses dix items.

La leçon 4A ignore entièrement ce fait. Conséquences vérifiées une à une :

1. L'exercice 4 étiquette `ขาว (item du jour)`. C'est faux.
2. La section « Limite de mesure de l'exercice 4 » écrit : « Trois mitigations
   sont en place : le sixième mot, ขาว, est enseigné le jour même ». C'est faux,
   et c'est la mitigation principale. Les six mots de l'exercice 4 sont donc
   TOUS déjà connus de l'apprenant, ce qui est exactement le défaut que la
   section prétend borner. **L'exercice 4 ne mesure plus la règle du jour, il
   mesure la mémoire du vocabulaire**, alors qu'il est le seul exercice à la
   mesurer et qu'il porte l'objectif observable « 5 cas sur 6 ».
3. La carte `srs-u04-l4a-07` crée des cartes de vocabulaire pour ข้าว et ขาว,
   qui en ont déjà en 1B, et pour ไข่, qui a déjà `srs-u03-l3e-01` avec un
   critère PLUS exigeant, production comprise. La nouvelle carte précise « la
   production n'est pas exigée en 4A » : elle constitue donc une régression de
   critère sur un item déjà cartonné. Le paragraphe « Hors périmètre » a fait ce
   travail proprement pour ขา et pour ก้าว, et l'a manqué pour trois items.
4. Le piège de l'exercice 3 affirme « la convention notant /aːw/ par `aao`
   depuis l'unité 3 ». Faux : 1B écrit déjà `khâao` et `khǎao`.
5. L'incertitude 9 dit que `aao` s'appuie sur `u03-l3b` et que l'unité 1
   n'emploie que `aai`. Faux pour la même raison. L'arbitrage à porter dans
   `CONVENTIONS.md` porte donc sur trois unités, pas deux, ce qui change son
   coût de migration.
6. La Méta déclare ses réemplois avec beaucoup de soin, ไข่ depuis 3E, เก้า
   depuis 3B, ขา depuis 1D, et omet ces deux-là.

Correction attendue avant `review` : déclarer ข้าว et ขาว comme réemplois de
1B, réécrire la mitigation de l'exercice 4 en conséquence, et remplacer au
moins deux des six mots de l'exercice 4 par des mots réellement nouveaux ou non
encore entendus, faute de quoi l'objectif observable de la règle n'est pas
mesuré. Reprendre `srs-u04-l4a-07` pour ne pas dupliquer ni affaiblir les cartes
existantes.

## Findings non bloquants

### N1. ถุง est cité comme entrée RID consultée mais ne figure pas dans le décompte

La note culturelle cite neuf entrées RID pour le sens des mots-images, dont
« ถุง ». Le dossier annonce par ailleurs un décompte « recomputable depuis les
trois listes ci-dessous : 59 graphies interrogées en 59 requêtes ». Recomptage
fait : 36 plus 20 plus 3 égale bien 59, et **ถุง ne figure dans aucune des trois
listes**. Le fait est vrai, l'entrée existe, elle a été rouverte aujourd'hui, et
`u03-l3a` la source déjà pour son item 8. C'est le décompte annoncé comme
recomputable qui est faux, sur la seule ligne où il est réellement testable.

### N2. Contradiction de mesure sur VOLUBILIS.ods entre 4A et l'unité 3

4A écrit : « la feuille `Volubilis` compte 118 571 lignes non vides, en-tête
comprise », et l'incertitude 11 attribue le même chiffre à l'unité 3.
`unite-03/verification-volubilis.md`, même fichier, même version 26.2, même
téléchargement du 2026-08-03, même taille de `content.xml` décompressé de
379 601 910 octets, écrit : « feuille `Volubilis` : 118 924 lignes au total,
dont 118 884 non vides ». Écart de 313 lignes, sur le contrôle même qui est
censé autoriser la comparabilité des numéros de ligne entre les deux unités.

Atténuation constatée : les cinq lignes recoupables contre le fichier de
l'unité 3 concordent, 4656 บาท, 29048 เก้า, 86074 ร้อย, 89867 สาม et
97075 สอง. L'identité tient donc en pratique là où elle est testable, mais elle
n'est pas établie par les chiffres annoncés.

### N3. La corroboration VOLUBILIS de la règle de ton n'est pas reproductible

Le tableau des 429 entrées et son verdict « zéro contre-exemple » sont la
DEUXIÈME jambe de preuve de la règle, et la seule qui soit empirique, puisque
th.wiktionary est écarté à juste titre et qu'Unicode n'atteste que le principe.
Or `u4a/vol_ods.py`, `u4a/vol_rule2.py` et `VOLUBILIS.ods` sont absents du
dépôt. Recherche faite sur tout l'arbre. Le protocole est décrit avec assez de
précision pour être réécrit, mais aucun tiers ne peut aujourd'hui refaire la
mesure à l'identique, ce que l'amendement v1.2 exige explicitement.

À noter également, comme réserve de méthode et non comme faute : la colonne
`ThaiPhon` de VOLUBILIS est une transcription d'auteur, et de nombreuses entrées
portent `RID` en colonne `DOM`. La qualifier d'« autorité de ton et de longueur
indépendante du RID et de Wikimedia » est plus fort que ce que le classeur
garantit. L'incertitude 2, qui demande une grammaire de référence sur
exemplaire, reste donc la bonne réponse.

### N4. ฉัน est le pire exemple possible dans une leçon qui oppose montant et haut

La page 7 range ฉัน parmi les mots dont « c'est bien ce que vous disiez sans
savoir pourquoi », à ton montant. Relevé fait sur en.wiktionary aujourd'hui : le
pronom ฉัน porte DEUX prononciations, /t͡ɕʰan˩˩˦/ et /t͡ɕʰan˦˥/, la seconde à ton
haut, familière, souvent écrite ชั้น. La prédiction de la règle est correcte,
c'est la prononciation normative ; l'affirmation sur ce que l'apprenant disait
déjà ne l'est qu'à moitié. Dans une leçon dont l'exercice 2 entraîne précisément
la discrimination montant contre haut, choisir comme démonstration un mot dont
la réalisation courante EST le ton haut est contre-productif.

Suggestion : remplacer ฉัน par ถุง, item de 3A, initiale haute, syllabe vivante,
sans variante familière connue.

### N5. Ce que la page 8 dit de la classe basse est inexact dans le domaine de la règle

Page 8 : « il existe une troisième classe, la basse, à laquelle appartient ค ;
elle suit une autre règle ». Vérification faite au RID, entrée `อักษรต่ำ` : pour
le mot vivant, la classe basse a le même ton de base สามัญ que la classe
moyenne. Dans le domaine EXACT de la règle du jour, syllabe vivante sans marque,
la classe basse donne donc le même résultat que la classe moyenne. Le dossier le
démontre lui-même en écartant la paire กา / คา avec les IPA relevés /kaː˧/ et
/kʰaː˧/, deux tons moyens, tout en justifiant l'écartement par le fait que คา
« obligerait à ouvrir la troisième classe ».

La phrase reste défendable pour la classe basse en général, dont le comportement
sous marque et en syllabe morte est bien différent. Elle est trompeuse telle
qu'écrite, présentée comme une LIMITE de la règle du jour. Reformulation
suggérée : dire que la classe basse se comporte comme la moyenne tant que la
syllabe est vivante et nue, et qu'elle diverge dès qu'une marque apparaît.

### N6. La définition de la syllabe vivante est incomplète pour les mots vedettes du jour

La page 6 reprend fidèlement la définition du RID, mais l'introduit par
« c'est-à-dire », donc comme complète, et la page 8 range ensuite « les syllabes
brèves ouvertes » sous une autre règle. Un apprenant appliquera cette phrase à
ไก่ et ไข่, qui sont les deux mots vedettes de la leçon et qui n'ont ni voyelle
longue ni finale écrite. Aucune réponse fausse n'en découle dans cette leçon,
puisque les deux portent une marque et sont déjà exclus par la première limite,
et puisque les séries en ไ, ใ, เ-า et -ำ n'apparaissent jamais nues à l'écran.
Le risque est différé : la formulation devra être défaite aux unités 5 à 8. Une
phrase courte page 8 suffirait à le neutraliser.

### N7. ผัก est déclaré vérifié, mais c'est ผัด qui figure dans le relevé RID

La section « Mots écartés » écrit : « ผัก (le légume) [...] est une syllabe
morte » et conclut « Ces trois mots sont vérifiés et disponibles pour 4B à 4E ».
La liste des 20 requêtes exploratoires porte ผัด, pas ผัก. Soit la liste
comporte une faute de frappe, soit ผัก n'a jamais été vérifié et l'affirmation
n'est pas soutenue. Les deux graphies existent et ne veulent pas la même chose.
Sans effet sur 4A, à corriger avant que 4B à 4E ne s'appuient sur cette phrase.

### N8. Deux incohérences internes de périmètre

- La section « Sources du réemploi des mots de la règle » annonce « Les six mots
  employés à la page 7 et à l'exercice 4 », puis tabule sept mots. La page 7 en
  cite dix, l'exercice 4 six, et deux des six, ขาว et กิน, ne sont pas dans le
  tableau. Le compte n'est juste pour aucune des deux listes.
- La note culturelle présente les noms normatifs Unicode comme « une autorité
  indépendante du dictionnaire », alors que la section des sources les traite,
  correctement, comme une « corroboration, non comptée comme troisième
  autorité ». Il faut choisir, et c'est la seconde formulation qui est juste.

### N9. Deux résumés d'entrées RID sont inexacts

- Item 2, ไก่ : « l'entrée signale ensuite deux emplois d'argot ». Le
  dictionnaire ne porte l'étiquette d'argot que sur l'un des deux sens
  concernés ; le second n'est pas étiqueté.
- Item 7, ขา : « Les vedettes ขา ๒ à ขา ๔ portent des sens de groupe, de trajet
  et de mesure ancienne ». Ces trois sens sont en réalité tous portés par la
  seule vedette ขา ๒. La vedette ขา ๓ porte la particule de réponse féminine, et
  la vedette ขา ๔ un pronom ancien. Le `note_fr` de l'item mentionne pourtant
  correctement la particule, ce qui rend le résumé de la source d'autant plus
  étonnant.

Ces deux imprécisions ne touchent aucun fait enseigné.

## Ce que l'audit N'A PAS pu vérifier

- Toute ligne VOLUBILIS, faute du classeur au dépôt. Les tons, longueurs et
  gloses de VOLUBILIS cités item par item sont donc pris pour ce qu'ils sont,
  une deuxième jambe déclarée, non recontrôlée. Le seul contrôle possible, la
  cohérence de l'ordre alphabétique des numéros de ligne au regard de la
  colonne `ThaiRom`, a été fait et ne révèle aucune anomalie.
- Les intitulés de la feuille `Codes`, section `TONES`, lignes 216 à 220, qui
  fondent enfin la lecture des marqueurs `-`, `¯`, `_`, `/` et `\`. Les
  marqueurs sont cependant employés de façon cohérente sur les treize graphies
  du fichier.
- Les rangs de fréquence de `th_50k.txt`, la liste n'étant pas au dépôt. Sans
  effet, la politique ne leur donne qu'une valeur indicative.
- La porte manuelle du RID prévue par l'incertitude 10 : cet audit a lui-même
  interrogé le service par outil, comme la leçon. Le doublon manuel reste dû.

## Suite

- Résoudre B1, B2 et B3 avant tout passage en `review`.
- Traiter N1, N2 et N7, qui sont des défauts de traçabilité et non de langue,
  à la consolidation de l'unité 4.
- Porter N3 au fondateur avec l'incertitude 2 : la règle de ton mérite une
  troisième autorité réellement distincte, et une grammaire de référence sur
  exemplaire est le moyen le moins cher d'y arriver.
- Revue native : EN ATTENTE. Rien de ce rapport ne vaut approbation linguistique
  par un locuteur natif.
