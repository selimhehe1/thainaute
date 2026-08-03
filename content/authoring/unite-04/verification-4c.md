# Contre-audit adversarial de la leçon 4C

- Fichier audité : `content/authoring/unite-04/lecon-4c.md`
- Date de l'audit : 2026-08-03
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), consigne adversariale, mandat
  de trouver des erreurs et non de confirmer.
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Le RID a
  été interrogé directement, mot par mot, par requête POST sur
  `dictionary.orst.go.th/func_lookup.php` (`funcName=lookupWord`,
  `status=lookup`, en-tête `x-requested-with: XMLHttpRequest`, requêtes espacées
  de 1,4 seconde, agent utilisateur identifiant le projet). Les entrées
  Wiktionary ont été rechargées en rendu. Les tons ont été RECALCULÉS depuis la
  classe consonantique, la marque de ton et le type de syllabe, sans regarder le
  champ `ton` de la leçon. Les `codepoints` ont été recomputés par outil depuis
  les chaînes du fichier. Conformément à la politique, aucune définition du RID
  n'est reproduite ici : seules la présence des vedettes, la concordance des
  sens et la FORME des exemples sont consignées, par référence.
- Non vérifiable par cet audit : `VOLUBILIS.ods` n'est pas au dépôt et n'a pas
  été téléchargé. Aucun numéro de ligne VOLUBILIS n'a pu être recontrôlé. Les
  faits qui reposent sur VOLUBILIS seul sont donc signalés comme tels.

## Verdict

68 faits re-vérifiés indépendamment et confirmés. 4 findings bloquants,
8 findings non bloquants. La leçon reste `draft` et n'est pas prête pour
`review`.

Point important pour le fondateur : les erreurs trouvées ne sont PAS des erreurs
de thaï. La graphie, les tons, les longueurs, l'IPA et les sens des huit items
sont justes, et les références citées existent et disent bien ce qu'on leur fait
dire. Les quatre findings bloquants portent sur un sens pragmatique mono-sourcé
et sur trois textes de correction faux affichés à l'apprenant.

## Ce que l'audit a confirmé lui-même

### Tons, longueurs et IPA, recalculés sans regarder la leçon

Les cinq règles de ton ont été appliquées à chaque syllabe du fichier depuis la
classe de l'initiale, la marque de ton et le type de syllabe. Aucun écart.

| Syllabe | Classe + marque + type          | Ton recalculé | Ton déclaré | Verdict |
| ------- | ------------------------------- | ------------- | ----------- | ------- |
| ข้าว    | haute + mai tho                 | descendant    | descendant  | OK      |
| ผัด     | haute, morte brève              | bas           | bas         | OK      |
| น้ำ     | basse + mai tho                 | haut          | haut        | OK      |
| เปล่า   | moyenne + mai ek                | bas           | bas         | OK      |
| จาน     | moyenne, vivante                | moyen         | moyen       | OK      |
| แก้ว    | moyenne + mai tho               | descendant    | descendant  | OK      |
| ขวด     | haute, morte                    | bas           | bas         | OK      |
| ขอ      | haute, vivante                  | montant       | montant     | OK      |
| หน่อย   | ห de tête, donc haute, + mai ek | bas           | bas         | OK      |
| สอง     | haute, vivante                  | montant       | montant     | OK      |
| ครับ    | basse, morte brève              | haut          | haut        | OK      |
| ค่ะ     | basse + mai ek                  | descendant    | descendant  | OK      |
| คิด     | basse, morte brève              | haut          | haut        | OK      |
| เงิน    | basse, vivante                  | moyen         | moyen       | OK      |
| แปดสิบ  | moyenne morte, puis haute morte | bas, bas      | bas, bas    | OK      |
| บาท     | moyenne, morte longue           | bas           | bas         | OK      |
| ขอบคุณ  | haute morte, puis basse vivante | bas, moyen    | bas, moyen  | OK      |
| ไหม     | ห de tête, vivante              | montant       | montant     | OK      |

Les IPA des huit items concordent avec les valeurs relevées directement sur
en.wiktionary, lettres tonales comprises.

### Unicode

- Les `codepoints` des huit items ont été recomputés depuis les chaînes du
  fichier : les huit concordent au point de code près, y compris la séquence de
  24 points de code de l'item 7.
- Le fichier entier est identique à sa forme NFC.
- Zéro tiret cadratin, zéro demi-cadratin, zéro tiret de figure, zéro barre
  horizontale dans tout le fichier. La règle fondateur est respectée.

### Sourçage, contrôlé source par source

Dix-huit interrogations RID conduites pour cet audit. Toutes les affirmations de
la leçon sur le RID sont exactes :

- ข้าวผัด : vedette unique, sens culinaire concordant, rattachement à la vedette
  mère ข้าว confirmé.
- ผัด : vedette attestée, et son premier sens donne bien ข้าวผัด parmi ses
  exemples d'emploi.
- เปล่า : vedette attestée, premier sens concordant, avec un exemple formé sur
  ขวด, exactement comme la leçon l'annonce.
- จาน : trois vedettes. La première énonce bien les DEUX emplois de comptage,
  ใบ ou ลูก pour l'assiette vide, จาน pour ce qu'elle contient. Les deux
  exemples chiffrés du second emploi portent tous deux sur du riz, et l'un est
  exactement de la forme riz + deux + จาน, ce qui fonde l'ordre enseigné à
  l'item 7. La deuxième vedette est verbale, la troisième est botanique et
  régionale, comme annoncé.
- ขวด : vedette unique, sens concordant, l'entrée donne ใบ comme mot de comptage
  et reste muette sur l'emploi de ขวด comme mot de comptage. Le silence signalé
  par la leçon est réel.
- แก้ว : cinq vedettes. Le deuxième sens de la première est bien celui enseigné,
  et l'entrée nomme bien la forme longue et la forme abrégée. Les quatre autres
  vedettes sont ornithologique, entomologique, ichtyologique et botanique, dans
  cet ordre, comme annoncé.
- ข้าว : l'entrée normative ne donne que le sens botanique et alimentaire, sans
  le sens de repas. La divergence signalée à l'incertitude 5 est réelle. Le bloc
  ลูกคำ de l'entrée compte largement plus de cent composés en ข้าว…, ce qui
  soutient la note culturelle.
- ลักษณนาม : l'entrée donne bien des exemples de la forme nom + nombre + mot de
  comptage, dont un à deux unités.
- ที่ : le cinquième sens donne bien l'emploi de mot de comptage, avec un
  exemple à trois portions de nourriture. L'item écarté est correctement motivé.
- ถ้วย : deux vedettes, et la première énonce bien le même principe de comptage
  par le contenant que จาน.
- คิด : un de ses sens est bien le calcul, avec un exemple de calcul mental.
- เงิน : l'argent comme moyen de paiement légal est bien un de ses sens.
- เช็ค attesté ; เช็ก absent. Le conflit orthographique qui motive le retrait de
  เช็คบิล / เช็กบิล est réel.
- Absences confirmées comme vedettes : น้ำเปล่า, คิดเงิน, เก็บเงิน, เช็คบิล,
  บิล, เช็ก. Six absences annoncées, six absences vérifiées.
- ขอ (trois vedettes) et หน่อย (vedette unique, avec l'exemple ขอหน่อย) sont
  bien attestés, mais voir le finding N3 sur le décompte.

Neuf entrées Wiktionary rechargées. Toutes les citations de la leçon sont
exactes, y compris les détails les plus faciles à inventer :

- en.wiktionary ข้าวผัด : IPA, découpe syllabique, étymologie et romanisation
  Paiboon conformes.
- th.wiktionary ข้าวผัด : la découpe `ค่าว-ผัด` citée par la leçon est bien
  celle de la page. Ce n'est pas une coquille : c'est une réécriture phonétique
  qui donne le même son que ข้าว.
- en.wiktionary น้ำเปล่า : les DEUX prononciations citées sont présentes, ainsi
  que la citation de presse du 20 décembre 2024.
- en.wiktionary จาน : la section « Classifier » distincte existe bien, glosée
  pour les plats de nourriture, et le nom porte bien ใบ ou ลูก.
- en.wiktionary แก้ว : c'est bien le quatrième sens de la première étymologie
  qui est le verre à boire, et ses classificateurs sont bien ใบ et แก้ว.
- en.wiktionary ขวด : IPA avec la diacritique de non-syllabicité citée par la
  leçon, classificateurs ใบ et ขวด.
- en.wiktionary เช็กบิล : le bloc de synonymes du sens « demander l'addition »
  liste bien คิดเงิน, เก็บเงิน, เก็บตังค์ et คิดตังค์, exactement ces quatre.
- คิดเงิน : 404 sur les deux éditions, comme annoncé.
- en.wiktionary เงิน : la mention explicite de brièveté et la réécriture
  phonétique citées par la leçon sont bien là.
- en.wiktionary ข้าว : le deuxième sens est bien étiqueté familier et glosé
  nourriture et repas, avec l'exemple annoncé.
- en.wiktionary หน่อย : la valeur de particule adoucissant une demande existe
  bien comme partie du discours distincte.

### Cohérence interne et lignage

- Les huit renvois à des leçons antérieures ont été ouverts un par un et disent
  bien ce que 4C leur fait dire : 2A pour le p soufflé et พูด, 2B pour ไหม et le
  couple ค่ะ / คะ, 2C pour ขอ, น้ำ, หน่อย et le graphème `awi`, 3A pour ตัด,
  3B pour สอง, แปดสิบ et le graphème `aao`, 3C pour บาท, 3D pour l'ordre, ตัว,
  ใบ, ปลา et le graphème `oua`, 3E pour le bloc des dix œufs, 1E pour ครับ
  (bien l'item 2) et pour `aee` et `oee`.
- La réserve de la page 5 sur l'ordre inverse avec « un » est bien celle de 3D,
  et elle est confirmée par le RID lui-même, dont l'entrée จาน donne les deux
  ordres selon que le nombre est un ou deux.
- Les trois lignes de contrôle VOLUBILIS citées par la leçon (บาท 4656,
  สิบ 96037, สอง 97075) figurent bien dans
  `unite-03/verification-volubilis.md`, avec le total de 118 924 lignes annoncé,
  et l'unité 2 a bien recoupé un export différent de 114 579 lignes. Le contrôle
  d'identité de la numérotation est donc réel.
- La transcription est conforme à la v1.1 sur les vingt et une formes du
  fichier : qualité vocalique sans accent, longueur par doublement de la
  dernière lettre du graphème, marque de ton sur la première lettre du noyau.
- Les corrigés des trois exercices sont tous justes et les distracteurs tous
  faux. Aucun corrigé n'est erroné. Les blocs « en trop » de l'exercice 3 sont
  bien en trop, et les particules attribuées aux locuteurs sont bien celles des
  personnes qui parlent.

### Contrôle de la règle de ton de 4A, demandé séparément

La règle de la page 6 de `lecon-4a.md` est : en syllabe vivante sans marque de
ton, consonne moyenne donne le ton moyen et consonne haute donne le ton montant.

Vérification indépendante au RID, trois entrées interrogées directement :

- l'entrée qui définit la syllabe vivante la définit bien comme la syllabe à
  voyelle longue sans consonne finale, plus les cinq séries de finales que 4A
  rend par ง, น, ม, ย et ว. La citation de 4A est exacte.
- l'entrée qui définit la classe haute donne bien le ton montant comme ton de
  base en syllabe vivante, avec la série d'exemples et le décompte de onze
  lettres que 4A cite.
- l'entrée qui définit la classe moyenne donne bien le ton moyen comme ton de
  base en syllabe vivante, avec la série d'exemples et le décompte de neuf
  lettres que 4A cite.

**La règle est vraie, correctement bornée et correctement sourcée. Elle n'est
pas trop générale : elle ne produit aucun ton faux sur aucun cas qu'elle
couvre.** Elle ne contamine donc pas le parcours, et 4C, qui n'enseigne aucune
règle de tons, n'en hérite aucun défaut. Deux rétrécissements non déclarés sont
consignés au finding N7 ci-dessous, pour la consolidation de 4A.

## Findings bloquants

### B1. คิดเงิน : le sens réellement enseigné n'a qu'une source, et VOLUBILIS est mal cité

La leçon enseigne un acte de parole précis : le client demande l'addition. C'est
ce que dit la page 6, ce que gloses la réplique 5 du dialogue, ce que propose
l'option « l'addition » du tirage 5 de l'exercice 1, et ce que révise la carte
`srs-u04-l4c-04`.

Or les deux sources ne disent pas la même chose :

- VOLUBILIS, tel que la leçon le cite elle-même, gloses en français « faire
  l'addition ; faire la note » et en anglais « calculate ; count ; reckon ; work
  out accounts ; do accounts ». Ce sont toutes des formulations du point de vue
  de l'ÉTABLISSEMENT qui totalise. En français, un client ne dit pas « faire
  l'addition ». VOLUBILIS n'atteste donc pas le sens enseigné.
- en.wiktionary, vérifié pour cet audit, atteste bien le sens enseigné, mais par
  une seule voie : le bloc de synonymes du sens « demander l'addition » de
  l'entrée เช็กบิล. Une seule source, un seul écosystème.
- Le RID est muet, vérifié.

La leçon écrit pourtant à l'item 8 : « Attestation indépendante de VOLUBILIS
pour le sens enseigné ». C'est une mauvaise citation de VOLUBILIS. Le fait
réellement enseigné est mono-sourcé.

Symptôme interne qui confirme le diagnostic : le champ `fr` de l'item 8 est
« faire l'addition, compter ce qui est dû », c'est-à-dire le sens de VOLUBILIS,
alors que le dialogue traduit คิดเงินค่ะ par « L'addition, s'il vous plaît ».
Le champ `fr` de l'item ne traduit pas la réplique que la leçon met dans la
bouche de Nok.

Correction attendue : soit une deuxième autorité indépendante pour l'emploi
client, soit un champ `fr` et un enseignement ramenés à ce qui est doublement
sourcé, soit le retrait de l'item jusqu'à la revue native. Il ne peut pas rester
présenté comme doublement sourcé.

### B2. Exercice 1 : le feedback et le piège désignent la mauvaise position dans la phrase

La leçon découpe elle-même le bloc en six morceaux, page 4 : ขอ, la chose, le
nombre, le mot de comptage, หน่อย, la particule. Le mot de comptage est donc
l'AVANT-AVANT-DERNIER bloc. L'avant-dernier bloc est หน่อย.

Deux textes affichés disent le contraire :

- feedback incorrect : « Réécoutez, et cette fois attendez l'avant-dernier
  bloc » ;
- pièges connus : « le tirage 6 ne se distingue du tirage 4 que par
  l'avant-dernier bloc ».

Les tirages 4 et 6 se distinguent par ขวด contre แก้ว, qui est le quatrième bloc
sur six, pas l'avant-dernier. L'apprenant à qui on demande d'attendre
l'avant-dernier bloc écoutera หน่อย, qui est identique dans tous les tirages, et
ne pourra pas répondre.

Le texte se contredit lui-même : le feedback correct de la même mécanique dit,
lui, la vérité, « juste avant หน่อย ».

Correction attendue : « le troisième bloc en partant de la fin », ou plus
simplement « le bloc juste avant หน่อย », dans les deux textes.

### B3. Exercice 1 : le feedback correct annoncé pour les tirages 3 à 6 est faux pour le tirage 5

Le feedback correct est cadré « tirages 3 à 6 » et dit : « Le mot de comptage
était à la fin, juste avant หน่อย ». Le tirage 5 diffuse คิดเงินครับ, qui ne
contient ni mot de comptage ni หน่อย. L'apprenant qui répond juste reçoit une
explication qui décrit un audio qu'il n'a pas entendu.

Même défaut, non cadré, du côté du feedback incorrect : il s'applique aussi aux
tirages 1 et 2, qui diffusent un mot seul, sans aucun bloc.

Correction attendue : cadrer le feedback correct sur les tirages 3, 4 et 6,
donner un feedback propre au tirage 5, et un feedback propre aux tirages 1 et 2.

### B4. Item 7 : la note affirme quatre tons alors que la phrase en porte cinq

La note de l'item 7 affiche : « sept syllabes, quatre tons différents ». Le
champ `ton` du même item liste montant, descendant, bas, montant, moyen, bas,
haut. Cela fait CINQ tons distincts, c'est-à-dire les cinq tons du thaï, tous
présents dans la même phrase.

C'est une affirmation fausse sur les tons, affichée à l'écran, contredite par
les données de son propre item, dans la leçon d'un parcours dont les tons sont
le sujet central. Le fait exact est d'ailleurs plus intéressant que l'erreur :
la phrase de commande fait entendre les cinq tons d'affilée.

Correction attendue : « les cinq tons », et une phrase d'enseignement qui
exploite ce point.

## Findings non bloquants

### N1. L'exercice 2 manche 2 ne mesure pas l'objectif qu'il annonce

Les trois premières situations nomment le contenant en français : « servi dans
une assiette », « vendue en bouteille », « servie au verre ». La réponse est
donc le mot thaï du contenant, que la manche 1 vient d'apparier deux minutes
plus tôt. La manche 2 remesure le vocabulaire de la manche 1.

Le feedback incorrect demande pourtant « dans quoi va-t-on me l'apporter ? ».
La question est déjà répondue par l'énoncé. Et l'objectif annonce « il associe
sans erreur ข้าวผัด à จาน », or aucune paire ne présente jamais ข้าวผัด sans
nommer l'assiette. Seule la quatrième paire, le poisson et ตัว, demande le
raisonnement décrit.

Correction attendue : des situations qui ne nomment pas le contenant, par
exemple « un riz sauté » contre « une eau au restaurant ».

### N2. Page 5 : le titre et la première phrase contredisent l'exemple

Le titre annonce « deux cases bougent, le reste ne bouge pas » et le texte dit
« Seules la chose et le mot de comptage ont changé ». Entre les deux exemples,
trois choses changent : ข้าวผัด devient น้ำเปล่า, จาน devient ขวด, et ครับ
devient ค่ะ. La phrase se corrige d'ailleurs elle-même juste après, en parlant
de la particule.

### N3. Le décompte RID du dossier n'est pas recomputable

Le dossier annonce « 24 graphies distinctes interrogées, 24 requêtes, 0 erreur »
et donne trois listes exhaustives de 12, 6 et 6 graphies. Mais l'item 6 affirme
un contrôle de présence RID sur ขอ et sur หน่อย, à la même date, et ces deux
graphies ne figurent dans aucune des trois listes.

J'ai vérifié les deux faits moi-même : ขอ est bien attesté, avec trois vedettes,
et หน่อย est bien attesté, avec l'exemple ขอหน่อย. Les faits tiennent. C'est le
décompte qui est faux, ou le contrôle de l'item 6 qui n'a pas été fait pour
cette leçon. Un décompte présenté comme recomputable doit l'être.

### N4. Item 6 : référence VOLUBILIS non conforme à l'amendement v1.2

La source VOLUBILIS de l'item 6 s'écrit « entrée du patron ขอ … หน่อย relevée le
2026-08-03 », sans feuille ni numéro de ligne, alors que l'amendement v1.2 exige
pour une source de type fichier le nom, la version, l'origine de téléchargement,
la feuille et le numéro de ligne. Toutes les autres citations VOLUBILIS du
fichier portent un numéro de ligne. Celle-ci n'est pas reproductible.

### N5. Traitement asymétrique de la longueur de náam

La leçon refuse de remplir le champ `longueur` pour la seconde syllabe de
น้ำเปล่า et pour ขวด, au motif que les sources ne concordent pas, et affiche un
inconnu assumé. C'est une bonne pratique. Mais elle affirme sans réserve
« náam longue » et enseigne « il est haut ET long », alors que son propre champ
`ipa` enregistre une variante attestée à voyelle brève, que j'ai retrouvée sur
la même page Wiktionary.

La règle que la leçon s'est donnée devrait s'appliquer aux deux cas, ou la
variante brève devrait être expliquée comme une réduction. En l'état, deux
poids deux mesures dans le même item.

### N6. L'incertitude 1 est périmée et la dépendance à 4A n'est pas tracée

La leçon écrit « Les leçons 4A, 4B, 4D et 4E n'existent pas au dépôt ». C'est
désormais faux : `lecon-4a.md`, `lecon-4b.md`, `lecon-4d.md` et `lecon-4e.md`
existent. Surtout, 4A enseigne ข้าว comme vocabulaire, avec sa propre carte SRS,
et s'en sert comme spécimen central de sa règle de ton, dans la paire ขาว contre
ข้าว.

4C ne cite pas 4A dans ses prérequis et réintroduit ข้าว en page 2 comme une
décomposition nouvelle. L'incertitude 1 avait anticipé exactement ce cas ; il
s'est produit. À traiter à la consolidation de l'unité.

### N7. Règle de ton de 4A : deux rétrécissements non déclarés

Pour mémoire, la règle est juste et bien sourcée, voir plus haut. Deux limites
qu'elle ne déclare pas :

1. La série de finales que le RID appelle มาตรากน ne se limite pas à la lettre
   น : elle couvre aussi ญ, ณ, ร, ล et ฬ. Un apprenant qui lit การ, กาล ou คุณ
   ne reconnaîtra pas une syllabe vivante avec la formulation de la page 6, alors
   que ce sont bien des syllabes vivantes.
2. Les syllabes en ไ, ใ, ำ et เ-า sont vivantes et suivent la même règle, ce que
   la page 6 ne dit pas. Pire, la troisième limite de la page 8 range les
   « syllabes brèves ouvertes » sous une autre règle à venir, ce qui pousse
   l'apprenant à classer ไข ou เขา du mauvais côté, alors que ces mots suivent
   exactement la règle du jour et sont montants.

Aucun des deux points ne fait produire un ton FAUX. Ce sont des trous, pas des
erreurs. Ils méritent une phrase chacun, parce que 4A choisit précisément ไก่ et
ไข่ comme paire vedette.

### N8. Extensions de transcription toujours non ratifiées, et 4C ne porte pas la porte

4C emploie `aao`, `oua` et `awi`. Ces trois graphèmes ne figurent pas dans
`CONVENTIONS.md`, ni en v1, ni en v1.1, ni en v1.2. 3B écrit explicitement
qu'ils « doivent être ratifiés dans `CONVENTIONS.md` ou remplacés avant le
passage en `review` », et porte cette porte dans son état des audits. L'état des
audits de 4C ne la porte pas.

4C déclare bien les emprunter sans en créer de nouveau, ce qui est honnête, mais
une leçon qui dépend d'une décision ouverte doit porter la décision ouverte.

## Point de forme signalé sans être compté comme finding

La transcription de สวัสดี diverge entre les leçons. 4C écrit `sà·wàt·dii`, ce
qui est conforme à la convention, séparateurs et marque de ton par syllabe. 2B
écrit de même `sà·baai·dii·mǎi`. Mais l'item 1 de 1E publie `sawàtdii`, sans
séparateur et sans marque sur la première syllabe, alors que son propre champ
`ton` dit bien que cette syllabe est basse. 4C a raison, 1E est l'exception.
L'apprenant verra deux orthographes du même mot. À corriger dans 1E, pas ici.

## Ce qui reste à faire avant `review`

1. Résoudre B1 à B4.
2. Résoudre N3 et N4, qui touchent la reproductibilité du dossier de preuve.
3. Trancher N1, N2 et N5 avec l'auteur.
4. Reporter N6 à la consolidation de l'unité 4, et N7 à 4A.
5. Faire ratifier `aao`, `oua` et `awi` dans `CONVENTIONS.md`, ou les remplacer.
6. Rappel : les faits qui reposent sur VOLUBILIS seul n'ont PAS pu être
   recontrôlés par cet audit, le fichier n'étant pas au dépôt. Sont concernés
   l'emploi de comptage de แก้ว et celui de ขวด côté VOLUBILIS, la ligne de
   fréquence de tous les items, et le patron de l'item 6. Le recoupement
   Wiktionary tient pour แก้ว et ขวด, donc ces deux faits gardent deux sources
   même sans VOLUBILIS. Conserver le fichier `VOLUBILIS.ods` employé, ou son
   empreinte, rendrait ces citations réellement reproductibles.
7. Revue native : toujours en attente, affichage honnête confirmé partout dans
   le fichier.
