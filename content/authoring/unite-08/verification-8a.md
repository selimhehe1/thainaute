# Contre-audit adversarial de `u08-l8a`

- Fichier audité : `content/authoring/unite-08/lecon-8a.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5)
- Cadre : `CONVENTIONS.md` amendements v1.1 et v1.2,
  `docs/content-policy/sources-verification.md` section 1 bis
- Posture : chercher des erreurs. Aucune source citée par la leçon n'a été
  crue sur parole. Toutes les consultations ci-dessous ont été refaites par
  l'auditeur, à la source, le 2026-08-04.

## 1. Ce qui a été recontrôlé, et comment

| Source               | Méthode de l'auditeur                                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RID 2554             | `node scripts/verification/rid-lookup.mjs` pour la présence ; POST direct sur `func_lookup.php` (`word=<graphie>&funcName=lookupWord&status=lookup`, en-tête `x-requested-with`, 1,3 s entre requêtes) pour lire chaque entrée, avec échappement explicite de la plage U+E000..U+F8FF |
| Wiktionary (en)      | `action=render`, extraction de l'IPA et des étiquettes                                                                                                                                                                                                                                |
| Appendix:Thai script | exemplaire local `Appendix_Thai_script.txt`                                                                                                                                                                                                                                           |
| Unicode 17.0         | `UnicodeData.txt` et `IndicPositionalCategory.txt` locaux, relus champ par champ                                                                                                                                                                                                      |
| UNGEGN 2013          | `rom1_th.pdf` local, empreinte recalculée, texte extrait relu                                                                                                                                                                                                                         |
| VOLUBILIS            | `node scripts/verification/volubilis-lookup.mjs` sur `VOLUBILIS_Database.xlsx` local                                                                                                                                                                                                  |
| Dépôt                | rebalayage des 35 fichiers `lecon-*.md` des unités 1 à 7, convention de comptage validée en reproduisant à l'identique les chiffres publiés par `u07-l7a`                                                                                                                             |

### Décompte des faits confirmés par l'auditeur : 151

| Bloc                                                                  | Faits |
| --------------------------------------------------------------------- | ----: |
| RID, 8 graphies attestées comme vedettes                              |     8 |
| RID, description de vedette et de sens conforme pour les 8 items      |     8 |
| RID, 11 entrées de structure et de terminologie conformes             |    11 |
| RID, 5 absences annoncées, confirmées absentes                        |     5 |
| RID, 7 présences secondaires confirmées                               |     7 |
| RID, 9 lectures entre crochets, séquence de codes exacte              |     9 |
| Wiktionary, 11 IPA                                                    |    11 |
| Wiktionary, 6 faits annexes (classificateurs, étymologies, étiquette) |     6 |
| Appendix:Thai script, 3 valeurs de graphème vocalique                 |     3 |
| Unicode, 12 propriétés de caractère plus l'en-tête daté du fichier    |    13 |
| Unicode, 8 séquences NFC recalculées et stables                       |     8 |
| UNGEGN, empreinte, table I, table II, notes                           |     7 |
| VOLUBILIS, 2 empreintes, 8 lignes, 5 marqueurs de ton                 |    15 |
| Dépôt, 17 transcriptions publiées concordantes                        |    17 |
| Dépôt, 7 blocs du dialogue tracés jusqu'à leur item d'origine         |     7 |
| Tableau des tons, 11 cases recontrôlées une par une                   |    11 |
| Exercices, 5 plafonds de réponse constante recalculés                 |     5 |

## 2. Priorité 8A : les deux marques restantes, case par case

C'est le point le plus lourd de la leçon et il est **juste**. Les trois entrées
de classe du RID ont été relues intégralement le 2026-08-04.

| Case enseignée                                                     | Ce que dit le RID, relu par l'auditeur                                                                                   | Verdict                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| MOYENNE + ไม้ตรี → haut                                            | « อักษรกลาง » : mot vivant, `ผันได้ครบ ๔ รูป ๕ เสียง`, `มีรูปวรรณยุกต์กับเสียงวรรณยุกต์ตรงกัน`, série กา ก่า ก้า ก๊า ก๋า | conforme                                            |
| MOYENNE + ไม้จัตวา → montant                                       | même entrée, même série                                                                                                  | conforme                                            |
| MOYENNE, 9 lettres ก จ ฎ ฏ ด ต บ ป อ                               | `มี ๙ ตัว คือ ก จ ฎ ฏ ด ต บ ป อ`                                                                                         | conforme                                            |
| HAUTE : ◌๊ et ◌๋ ne s'y posent pas en syllabe vivante              | « อักษรสูง » : `ผันได้ ๓ เสียง มี ๒ รูป`, série ขา ข่า ข้า, et le mot mort n'y ajoute que ไม้โท (ขะ ข้ะ)                 | conforme                                            |
| BASSE : ◌๊ et ◌๋ ne s'y posent pas en syllabe vivante              | « อักษรต่ำ » : `ผันได้ ๓ เสียง มี ๒ รูป`, série คา ค่า ค้า                                                               | conforme                                            |
| Réserve consignée : ไม้จัตวา existe sur une BASSE en syllabe morte | « อักษรต่ำ » donne bien คะ ค่ะ ค๋ะ et คาก ค้าก ค๋าก                                                                      | réserve exacte, et correctement exclue du périmètre |
| BASSE + ◌่ → descendant, BASSE + ◌้ → haut                         | `ผันด้วยวรรณยุกต์ [ไม้เอก] เป็นเสียงโท ... [ไม้โท] เป็นเสียงตรี`                                                         | conforme                                            |
| HAUTE + ◌่ → bas, HAUTE + ◌้ → descendant                          | `[ไม้เอก] เป็นเสียงเอก ... [ไม้โท] เป็นเสียงโท`                                                                          | conforme                                            |
| Tons de base : moyenne สามัญ, haute จัตวา, basse สามัญ             | conformes aux trois entrées                                                                                              | conforme                                            |

Les onze cases du tableau de la page 11 sont donc justes, et les huit tons
d'items sont justes eux aussi (recoupés Wiktionary et VOLUBILIS, tableau
§ 4). **Aucune case fausse. Le tableau complété en 7A n'est pas cassé.**

Une réserve de formulation, non bloquante, est consignée au finding N8 :
le retour de l'exercice 3 énonce l'inférence inverse (« puisque cette marque
est là, l'initiale est forcément moyenne ») sans y répéter la condition de
syllabe vivante, condition que la page 9 porte pourtant explicitement.

## 3. Priorité 8C : sans objet ici, mais le cas analogue a été traité

La graphie ถูก n'apparaît **pas** dans `lecon-8a.md` (0 occurrence). Le cas
analogue de la leçon est เสีย, dont le RID donne quatorze sens numérotés.
Recontrôle fait : la leçon n'enseigne que les sens (๓) et (๔), le dit, et
signale explicitement les sens (๘) payer et (๑๐) mourir comme non enseignés.
Le traitement de la polysémie est donc correct sur le fond ; seule
l'étiquette de registre attachée au sens « mourir » est fautive, voir N11.

## 4. Tons et IPA, recoupement fait par l'auditeur

| Mot             | Ton enseigné     | Wiktionary relu | VOLUBILIS relu             | Verdict                              |
| --------------- | ---------------- | --------------- | -------------------------- | ------------------------------------ |
| เงิน            | moyen            | /ŋɤn˧/          | `-ngoen`, ligne xlsx 61297 | conforme                             |
| ง่าย            | descendant       | /ŋaːj˥˩/        | `\ngāi`, 60822             | conforme                             |
| เสีย            | montant          | /sia̯˩˩˦/        | `/sīa`, 91870              | conforme                             |
| เสื้อ           | descendant       | /sɯa̯˥˩/         | `\seūa`, 91543             | conforme                             |
| ตั๋ว            | montant          | /tua̯˩˩˦/        | `/tūa`, 106408             | conforme                             |
| เก๊             | haut             | /keː˦˥/         | `¯kē`, 28648               | conforme                             |
| เปลี่ยน         | bas              | /plia̯n˨˩/       | `_plīen`, 76838            | conforme                             |
| กระเป๋า         | bas puis montant | /kra˨˩.paw˩˩˦/  | `_kra/pao`, 45115          | conforme                             |
| เสือ (spécimen) | montant          | /sɯa̯˩˩˦/        | —                          | conforme                             |
| งง (spécimen)   | moyen            | /ŋoŋ˧/          | —                          | conforme                             |
| งาน (spécimen)  | moyen            | /ŋaːn˧/         | —                          | conforme, et l'IPA existe : voir N10 |

Les huit séquences NFC de la section Unicode ont été recalculées : **toutes
exactes et toutes stables**. Les neuf lectures entre crochets du RID
(เปลี่ยน, กลัว, ปลา, ตรง, ครัว d'un côté, ตลาด, สถานี, สบาย, ฝรั่ง de
l'autre) ont été relevées avec leur séquence de codes : **les neuf sont
exactes au caractère près**, U+0E3A d'un côté, U+0E30 de l'autre. C'est la
partie la plus solide du dossier.

## 5. Findings

Bloquants : N1 à N7. Non bloquants : N8 à N13.

### N1. BLOQUANT. Exercice 2, piège faux : « le groupe est ขว »

Ligne 717. Le texte écrit : « entendre le ว de ขวด comme une glissade alors
que le groupe est ขว et que le noyau est `oua` ». Les deux moitiés de la
phrase se contredisent, et la première est fausse. Dans ขวด, ว **n'est pas**
le second membre d'un groupe consonantique : il fait partie du graphème
vocalique, la forme que prend ◌ัว devant une consonne finale. Preuves
recontrôlées : `u04-l4c`, item publié, écrit lui-même « La voyelle est la
diphtongue de ตัว, notée `oua` » et donne `khòuat` ; la Méta de 8A le dit
aussi ligne 40 ; Wiktionary donne /kʰùat/ ; Appendix:Thai script classe
–ัว comme _sara ua_, un graphème vocalique. Un apprenant qui applique la
règle du jour à un vrai groupe ขว lirait ce mot en cherchant le ton sur ข
comme première lettre d'un groupe, ce qui est une analyse fausse.

### N2. BLOQUANT. Segmentation fausse : « vivante par la finale ว / ย » pour ตัว, ตั๋ว et เสีย

Occurrences : item 3 ligne 372, item 5 ligne 467, exercice 3 tirages 2, 9
et 10 (lignes 742, 753, 754), tableau de l'étage 2 lignes 1167, 1172, 1173.

Le ว de ◌ัว et le ย de เ◌ีย appartiennent au graphème vocalique ; ce ne sont
pas des consonnes finales. Trois preuves indépendantes, toutes recontrôlées
par l'auditeur :

1. **La leçon elle-même**, page 5 : « เ◌ีย se lit `ia` », « ◌ัว se lit
   `oua` ». Si ces deux signes sont des voyelles page 5, ils ne peuvent pas
   être des finales page 11 et à l'exercice 3.
2. **Appendix:Thai script**, relue le 2026-08-04 : –ัว est _sara ua_ ;
   เ–ีย est _sara ia_ ; et l'entrée voisine เ–ียว est décrite comme
   « _sara ia_ **with wo waen as closing consonant** », ce qui montre a
   contrario que dans เ–ีย le ย n'est pas la consonne de fermeture.
3. **Le parcours a déjà tranché.** `u07-l7a` écrit noir sur blanc, dans sa
   convention de comptage : « le ย de เ◌ีย [est traité] comme partie du
   digramme vocalique ». 8A contredit une décision explicite de la leçon
   dont il se réclame.

Le ton produit reste juste dans les trois cas, la syllabe étant vivante par
l'autre voie. Mais la justification enseignée est fausse, et elle est
enseignée : un apprenant qui suit « cherchez la finale » sur ตัว isole ◌ั,
soit /a/ bref, plus une finale ว, et lit `tao`. À corriger en
« vivante par sa voyelle », formulation que la leçon emploie déjà
correctement pour เสื้อ et เก๊.

Noter aussi que ง่าย « vivante par la finale ย » est, lui, correct : ◌าย est
bien voyelle plus consonne finale. La correction ne doit pas être appliquée
en aveugle.

### N3. BLOQUANT. Dialogue : `khàwwp·khun khráp` est une transcription fautive

Ligne 878. La leçon écrit `khàwwp·khun khráp` pour ขอบคุณครับ. L'item publié
de `u02-l2c` écrit `khàwwp·khoun khráp`. La convention v1.1 note /u/ par
`ou` ; `u` seul n'existe pas dans son inventaire vocalique. Relevé fait sur
tout le dépôt : `khoun` apparaît 103 fois dans les leçons des unités 1 à 7,
et les seules occurrences de `khun` y sont des romanisations VOLUBILIS
citées dans des champs `sources`, jamais une transcription Thaïnaute.
C'est donc une transcription fausse sur un écran d'apprenant, qui plus est
en contradiction avec un bloc déjà cartonné en SRS.

### N4. BLOQUANT. Le contrôle interne au dépôt ne se recompute pas

Lignes 1186 à 1199. Le dossier annonce un balayage « recomputable » sur les
« 36 fichiers `lecon-*.md` des unités 1 à 7 », « même convention de comptage
que `u07-l7a` », et en tire **341 entrées, 250 graphies distinctes, 77
ไม้เอก, 55 ไม้โท**.

L'auditeur a d'abord **validé la convention** en la rejouant sur les unités
1 à 6 : elle rend exactement 30 fichiers, 285 entrées, 216 graphies, 70
ไม้เอก, 40 ไม้โท, 0 et 0, et 9 puis 7 occurrences en texte entier, c'est-à-dire
les sept chiffres publiés par `u07-l7a`, sans écart. La convention est donc
la bonne. Appliquée aux unités 1 à 7, elle rend :

| Grandeur                  | 8A annonce | Recompté | Verdict |
| ------------------------- | ---------: | -------: | ------- |
| fichiers `lecon-*.md`     |         36 |   **35** | faux    |
| entrées                   |        341 |  **333** | faux    |
| graphies distinctes       |        250 |  **247** | faux    |
| graphies portant ไม้เอก   |         77 |   **81** | faux    |
| graphies portant ไม้โท    |         55 |       55 | juste   |
| graphies portant ไม้ตรี   |          0 |        0 | juste   |
| graphies portant ไม้จัตวา |          0 |        0 | juste   |
| U+0E4A en texte entier    |         12 |       12 | juste   |
| U+0E4B en texte entier    |         14 |       14 | juste   |

Il n'y a que 35 fichiers de leçon dans les unités 1 à 7 (5 par unité), ce
qui se vérifie d'un `ls`. La **conclusion** de la section, elle, tient :
0 et 0, donc la page 8 a raison de présenter ces deux marques comme neuves.
Mais quatre chiffres sur neuf sont faux dans une section qui se présente
comme la preuve chiffrée du dossier. C'est bloquant parce que c'est
précisément ce qu'un audit ne peut pas laisser passer : une preuve annoncée
recomputable et qui ne se recompute pas.

### N5. BLOQUANT. Deux références internes fausses dans la Méta

1. Ligne 49 : « leçon 5E : ตรง et ไม่ไกล, items publiés à groupe
   consonantique ». **ตรง est publié par `u05-l5b`**, item 6, ligne 564.
   `u05-l5e` publie ตรงไป, item 8, et son propre dossier écrit « 5B publie
   ตรง seul, item 6 ». Les exercices 1 et 4 de 8A citent d'ailleurs
   correctement `u05-l5b` ; c'est la Méta qui est fausse.
2. Lignes 33 et 34 : « ปลา, publié le même jour, est le premier groupe
   consonantique du parcours ». **Faux.** เพลง, item publié de `u02-l2a`,
   porte le groupe พล et précède ปลา de deux unités ; `u03-l3d` l'écrit
   lui-même dans la note de ปลา : « vous avez déjà vu ce phénomène dans
   เพลง (phleeng) en 2A ». ครับ, publié en 2B, est un second contre-exemple.
   La page 12 aggrave le point en énumérant les mots à groupe déjà lus sans
   y faire figurer เพลง, alors que เพลง est joué au tirage 8 de l'exercice 1
   de la même leçon.

### N6. BLOQUANT. Item 5 : « le deuxième empilement du parcours après นั่ง et ตื่น de 7A »

Lignes 470 et 471. Deux problèmes.

D'abord la phrase est incohérente avec elle-même : après deux mots cités,
ตั๋ว serait le troisième et non le deuxième.

Ensuite et surtout elle est fausse. Balayage refait par l'auditeur sur les
graphies publiées des unités 1 à 7 : **44 graphies empilent déjà deux signes
hauts**, et la première est ชื่อ, publiée en `u02-l2d`, cinq unités avant
7A. Suivent ที่, พี่, สี่, นี้, ร้อย, ยี่สิบ, ฝรั่งเศส, เลี้ยว, แท็กซี่ et
une trentaine d'autres. La phrase voisine « C'est la pile la plus haute du
parcours à ce jour » n'est pas davantage établie : ◌ั plus ◌๋ est une pile à
deux niveaux, exactement comme ◌ื plus ◌้ dans ชื่อ et เสื้อ. Le point de
rendu à contrôler à l'intégration reste utile ; c'est sa justification qui
est fausse.

### N7. BLOQUANT. Affirmations non sourcées sur le français, sur écran d'apprenant

Le dossier écrit lignes 1255 à 1261 : « L'affirmation qui intéresse vraiment
la leçon, à savoir qu'un francophone ne sait pas ATTAQUER une syllabe avec ce
son, n'est appuyée par aucune source de la politique. Elle n'est donc écrite
nulle part sur un écran d'apprenant. »

Elle y est écrite deux fois, sous une forme à peine adoucie :

- page 1, ligne 107 : « C'est la même lettre, le même son, et pourtant **une
  bouche française bute dessus**. »
- page 6, ligne 162 : « C'est là qu'**une bouche française a envie de couper
  en deux**. »

Ce sont des assertions générales sur ce que fait une bouche française. Elles
ne sont ni sourcées par les deux références de la section 1 bis (en.wikipedia
« French phonology » et fr.wiktionary « parking » ne disent rien de
l'attaque de syllabe ni du découpage des diphtongues), ni reformulées en
observation que l'apprenant vérifie lui-même, alors que la page 2 montre que
la leçon sait très bien faire cette reformulation. Le manquement n'est pas
seulement de forme : le dossier certifie une conformité qui n'existe pas, ce
qui invalide l'auto-contrôle de cette dimension.

Le reste du bloc français est conforme et a été recontrôlé : les deux
références citées existent, sont gratuites, indépendantes, et disent bien ce
qu'on leur fait dire.

### N8. Non bloquant. Trois absolus faux sur l'écriture

1. Page 8, ligne 183 : « elles se posent AU-DESSUS de la consonne initiale,
   **et jamais ailleurs** ». Contredit par la leçon elle-même : l'item 7
   écrit « la marque de ton se pose sur la voyelle qui suit, pas sur le ป »,
   et la section Unicode confirme que le ไม้เอก de เปลี่ยน est empilé sur ล
   et non sur ป, tandis que celui de ตั๋ว est posé au-dessus du ◌ั.
2. Page 14, ligne 254 : « Il n'y a pas de moyen de deviner à l'œil ». Trop
   absolu : l'inventaire des groupes initiaux du thaï est fermé, et ตล comme
   ฝร n'en font pas partie. Deux des quatre fausses paires du tirage sont
   donc devinables à l'œil par qui connaît l'inventaire.
3. Exercice 4, feedback incorrect, ligne 810 : « ce sont **deux lettres
   identiques** qui se lisent tantôt ensemble, tantôt séparées ». Faux pour
   les huit tirages : aucun ne fait s'opposer la même paire de lettres. Les
   paires opposées sont ปล/ตร/คร contre ตล/สถ/สบ/ฝร.

Contrôle fait par l'auditeur sur la mesure elle-même : l'heuristique la plus
naturelle, « seconde lettre ร ou ล donc groupe », plafonne à 6 sur 8, sous
le seuil de 7. L'exercice reste donc valide malgré ces formulations.

### N9. Non bloquant. Deux décomptes internes faux

1. « quatre mots sur huit commencent à l'écrit par เ », Méta ligne 39, repris
   à l'identique dans la section Unicode ligne 1420 : ce sont **cinq** items,
   เงิน, เสีย, เสื้อ, เก๊ et เปลี่ยน. L'exercice 3, lui, compte juste, et
   écrit « soit la moitié du tirage » en énumérant les cinq.
2. Exercice 3, ligne 729 : « six tirages sur dix portent ◌่, ◌้ ou aucune
   marque ». Ce sont **huit** : trois sans marque (1, 2, 10), trois ไม้เอก
   (3, 4, 5), deux ไม้โท (6, 8). L'erreur va dans le sens de la prudence,
   mais elle contredit la liste des tirages du même paragraphe.

### N10. Non bloquant. L'incertitude 7 énonce un empêchement qui n'existe pas

Lignes 1464 à 1471 et section VOLUBILIS. Le dossier explique que l'outil
versionné n'a pas tourné parce que le miroir SourceForge servant le `.xlsx`
était injoignable.

Or `scripts/verification/volubilis-lookup.mjs` prend un **chemin de fichier
local** en argument et ne télécharge rien. L'auditeur a trouvé
`VOLUBILIS_Database.xlsx` déjà présent sur le poste, l'a passé au script, et
l'exécution a réussi. Empreinte du fichier : 10 848 409 octets, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`,
c'est-à-dire exactement l'empreinte que l'en-tête du script documente.
L'empreinte `.ods` annoncée par 8A est par ailleurs exacte, recalculée :
15 724 718 octets, SHA-256 `bb9c5da5...a094cc`.

Résultat du contrôle, favorable au dossier : **les huit citations VOLUBILIS
sont corroborées**, gloses françaises, types, marqueurs de ton et entrées
voisines compris, y compris la ligne « (oral) » de กระเป๋า et les lignes
voisines de เงิน, ง่าย et เสีย. Seuls les numéros de ligne diffèrent, parce
qu'ils portent sur l'édition `.ods` et non sur le `.xlsx`, ce que la
convention v1.2 autorise explicitement.

L'incertitude 7 doit donc être **fermée** et sa justification corrigée : ce
n'est pas le miroir qui a empêché le contrôle.

À signaler dans le même mouvement : l'incertitude 8 dit que l'entrée
Wiktionary de งาน n'a pas été consultée. Elle existe et donne /ŋaːn˧/, ce
qui concorde. La lacune était évitable.

### N11. Non bloquant. Registre non sourcé sur le sens « mourir » de เสีย

Item 3, ligne 379 : « dans un registre respectueux, qu'une personne est
morte ». Recontrôle : le RID donne le sens (๑๐) `ก. ตาย` **sans aucune
étiquette de registre** ; en.wiktionary étiquette ce sens
**« (humble, informal) to die »**. Aucune des deux sources du dossier ne
soutient « respectueux », et l'une le contredit sur l'axe formel/informel.
Le sens n'étant pas enseigné, l'effet est limité, mais la politique impose
deux sources pour un fait de registre : il faut soit sourcer, soit écrire
« euphémisme courant », soit retirer la qualification.

### N12. Non bloquant. Contradiction de corpus sur la longueur de /ia/

Les items 3 et 7 posent `longueur : NON ÉTABLIE` pour le noyau เ◌ีย, et
l'incertitude 2 présente cette réserve comme la décision constante du
parcours, en citant `u03-l3d`, `u04-l4c`, `u05-l5d` et `u06-l6d`.

Or `u05-l5b` publie เลี้ยว avec `longueur : longue (diphtongue /ia̯/ suivie
du glissement vers ou)`, c'est-à-dire une décision contraire sur le même
noyau. Et 8A fait entrer เลี้ยว au tirage 3 de son exercice 2 sans relever
la contradiction. La réserve est défendable, la décision de `u05-l5b` aussi ;
ce qui ne l'est pas, c'est de présenter comme uniforme un corpus qui ne
l'est pas. À trancher à la consolidation de l'unité 8, comme l'incertitude 2
le demande déjà, mais en y intégrant `u05-l5b`.

### N13. Non bloquant. Deux formulations à resserrer

1. Exercice 3, retour des tirages 7 et 9 : « puisque cette marque est là,
   l'initiale est forcément moyenne ». Vrai en syllabe vivante, faux en
   syllabe morte, où le RID donne ค๋ะ et ค๋าก sur une basse. La page 9 porte
   la condition ; le retour de l'exercice l'omet.
2. Exercice 4 : « Tous les mots tirés sont des items publiés ou des items du
   jour ». ครัว n'est pas un item publié ; seul ห้องครัว l'est. La ligne du
   tirage 4 le dit honnêtement, la phrase de cadrage non.

## 6. Contrôles passés sans finding

- **Aucune référence inventée.** Les 41 graphies annoncées au RID ont été
  vérifiées par échantillon large : les 5 absences annoncées
  (อักษรควบ, ควบกล้ำ, คำควบกล้ำ, อักษรนำ, พยัญชนะต้น) sont bien absentes, et
  les présences testées (งง, งาน, เสือ, กล้ำ, ควบ, ทวิ, โต๊ะ, ง, ตัว) sont
  bien attestées. Le total annoncé, 22 + 8 + 6 + 5 = 41 dont 36 attestées,
  est arithmétiquement cohérent et sans doublon.
- **Aucune définition du RID reproduite** dans le fichier de leçon ; les
  champs `sources` citent par référence, conformément à la politique.
- **Note culturelle** : les quatre entrées RID (ไม้ตรี, ไม้จัตวา, ตรี ๓,
  จัตวา) disent exactement ce que la note leur fait dire, y compris
  `บอกเสียงสูงสุดใน ๕ เสียง` pour ไม้จัตวา, le classement de ตรี sous โท et
  au-dessus de จัตวา avec ร้อยตรี, ข้าราชการชั้นตรี et ปริญญาตรี, et le
  second nom ตีนกา. Les noms Unicode `THAI CHARACTER MAI TRI` et
  `THAI CHARACTER MAI CHATTAWA` corroborent.
- **Fondation de la règle des groupes.** Les neuf lectures entre crochets du
  RID sont exactes au caractère près, U+0E3A d'un côté et U+0E30 de l'autre.
  U+0E3A est bien `THAI CHARACTER PHINTHU`, `Mn`, classe combinatoire 9, et
  `Bottom` dans `IndicPositionalCategory-17.0.0.txt` daté du 2025-07-29. La
  réserve du dossier sur « laquelle des deux lettres commande le ton »,
  fondée sur deux cas seulement, est honnête et correctement signalée.
- **UNGEGN.** Empreinte identique à celle annoncée (89 474 octets, SHA-256
  `d4d4c8c9...d62b07`). Table I, caractère 7 : `ng (ng)`. Table II :
  28 et 29 `ia`, 30 et 31 `uea`, 32, 33 et 34 `ua`. Note 1.1 : trait
  d'union quand la syllabe suivante commence par `ng`, exemple สง่า
  _Sa-nga_. Note sur les diphtongues : caractères 48 et 53. Les cinq faits
  sont conformes.
- **Aucun exercice réussissable par une réponse constante.** Plafonds
  recalculés : exercice 1, 4 sur 10 pour un seuil de 8 ; exercice 2, 3 sur 9
  pour un seuil de 7 ; exercice 3, 2 sur 10 pour un seuil de 8 ; exercice 4,
  4 sur 8 pour un seuil de 7 ; exercice 5, `recall`, sans plancher de
  hasard. Les répartitions annoncées correspondent aux tirages listés.
- **Dialogue.** Les sept ossatures sont bien publiées et tracées ; les
  transcriptions concordent avec les items publiés, à l'exception de N3. La
  réserve de naturalité de l'incertitude 3 est justifiée et suffisante à ce
  stade.
- **Écriture produit.** Aucun tiret cadratin ni demi-cadratin. Ton conforme.
  Aucune promesse non mesurée. `Revue native : en attente` présent.

## 7. Conclusion

Le cœur linguistique de la leçon est juste : les onze cases du tableau de
tons, les huit tons d'items, les huit séquences NFC, les neuf lectures
du RID, les valeurs des trois graphèmes vocaliques et la fondation du bloc
sur les groupes ont tous résisté à un recontrôle indépendant. La chaîne de
sources externes est la plus solide auditée jusqu'ici dans le parcours.

Les défauts sont ailleurs, et ils sont réels : une segmentation fausse
répétée sur trois items et un exercice (N2), un piège d'exercice
factuellement faux (N1), une transcription fautive au dialogue (N3), et
surtout une série d'affirmations internes au dépôt que le dossier présente
comme mesurées et qui ne se vérifient pas (N4, N5, N6, N9). Le point le plus
préoccupant n'est pas une erreur de thaï, c'est que l'auto-contrôle du
dossier affirme des conformités qu'il n'a pas (N4 et N7).

**Statut recommandé : maintien en `draft`.** Pas de passage à `review` avant
résolution de N1 à N7. N4 et N7 imposent en outre de rejouer les balayages
internes et la relecture « section 1 bis » des autres leçons de l'unité 8,
les mêmes gabarits y étant probablement repris.
