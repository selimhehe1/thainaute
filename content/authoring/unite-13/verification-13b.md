# Contre-audit adversarial de `u13-l13b`

- Fichier audité : `content/authoring/unite-13/lecon-13b.md`
- Date : 2026-08-04
- Auditeur : agent de contre-audit interne, consigne adversariale
- Méthode : aucune affirmation du fichier n'a été reprise sur parole. Chaque
  relevé cité a été REFAIT ici, avec le même script versionné et le même
  artefact identifié par empreinte. Les scripts `tmp-13b-*` ont été relus avant
  d'être crus, pour vérifier que les tirages qu'ils encodent sont bien ceux du
  fichier.
- Verdict : **2 findings bloquants**, 9 findings non bloquants.
  L'audit de REGISTRE, priorité absolue de la consigne, **passe intégralement** :
  les six corps d'entrée ont été relus par l'auditeur et aucune affirmation de
  registre du fichier n'est infondée.

## 1. Audit de registre : passé, sur pièce

Tous les corps d'entrée ont été relus par l'auditeur avec
`node scripts/verification/rid-entry.mjs`, et non recopiés du fichier.

| Graphie | Ce que l'auditeur a lu lui-même                                                                                                                                                                                                          | Ce que 13B en conclut          | Verdict                 |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| นะ      | 2 vedettes. นะ ๑ : `ว.` + « คำประกอบท้ายคำอื่น … อ้อนวอน บังคับ หรือเน้นให้หนักแน่น » + exemples อยู่นะ, ไปละนะ. นะ ๒ : `น.`, syllabe de formule. **0 occurrence de ปาก, 0 de ถิ่น, 0 caractère PUA échappé, 0 lecture entre crochets.** | aucun registre affirmé         | **exact**               |
| ครับ    | 1 vedette, lecture `[คฺรับ]` = U+0E04 U+0E3A U+0E23 U+0E31 U+0E1A, `ว.`, « คำรับหรือคำลงท้ายอย่างสุภาพที่ผู้ชายใช้ »                                                                                                                     | `poli`, homme                  | **exact**               |
| คะ      | 2 vedettes. คะ ๒ `ว.` porte bien DEUX emplois et QUATRE exemples : อะไรคะ, กระมังคะ, puis « ต่อจากคำ ซิ นะ » avec เชิญซิคะ et **ไปนะคะ**                                                                                                 | `poli` + règle du cas après นะ | **exact**               |
| ค่ะ     | 1 vedette, `ว.`, mot de réponse + final poli, exemples ไปค่ะ, ไม่ไปค่ะ. **N'évoque pas นะ.**                                                                                                                                             | `poli`, réponse                | **exact**               |
| น่ะ     | **aucune vedette**, le service rend la page « proposer un mot »                                                                                                                                                                          | aucun registre, item refusé    | **exact**               |
| จ้า     | 1 vedette, `ว.`, « จัด, ยิ่ง, แรง, (ใช้แก่สี แสง หรือเสียง) », exemples สีจ้า, แสงจ้า                                                                                                                                                    | ce n'est pas la particule      | **exact, piège refait** |

Le piège de référence du plan de parcours est donc réellement refait et non
recopié. Aucune graphie enseignée par 13B ne se trouve dans la situation de
จ้า, c'est-à-dire attestée pour autre chose que ce que la leçon en dit.

**Frontière reconnaissance / production : respectée.** La seule forme portant
une étiquette d'usage dans une source consultée est น่ะ, `{{lb|th|colloquial}}`
sur ses DEUX sens à en.wiktionary. Elle n'apparaît dans aucun tirage, aucune
carte SRS et aucune réponse. La leçon ne met en production que des formes sans
étiquette d'usage ou étiquetées polies.

## 2. Findings bloquants

### B1 : `VOL-FIN-NA` : โชคดีนะ est le SEUL contre-exemple de l'inventaire, et le fichier le cite comme confirmation

Dossier de production, section des contrôles mécaniques, à propos de
`tmp-13b-volubilis-fin-na.mjs` :

> « Filtrées sur les lignes dont la colonne `ThaiPhon` porte `¯na` comme jeton
> final séparé […] Le reste est bien de vraies particules finales : อะไรนะ,
> ไปนะ, ฟังนะ, เดี๋ยวนะ, หยุดนะ, อย่าลืมนะ, **โชคดีนะ**, ฝันดีนะ, เจอกันนะ […]
> **Toutes portent `¯na`, ton haut, sans exception**, ce qui corrobore le ton de
> l'item 1 sur une trentaine d'occurrences indépendantes. »

Relevé de l'auditeur, sur le même `.xlsx` et la même empreinte : l'inventaire
rend bien 243 lignes, dont **31** portent `¯na` comme jeton final séparé. Le
dépouillement de la colonne `ThaiPhon` de ces 243 lignes donne un seul jeton
final non marqué dans tout l'inventaire :

```
ligne 8953 : A=chōk dī ; chōk dī na | C=\chōk -dī ; \chōk -dī na | E=โชคดี ; โชคดีนะ
```

Trois conséquences :

1. **โชคดีนะ ne fait pas partie des 31 lignes filtrées.** Son jeton final est
   `na`, sans le `¯`. Le fichier l'énumère parmi les survivants du filtre : la
   citation est fausse, et elle a été produite par le filtrage « à la main »
   que le fichier assume au paragraphe suivant.
2. **La seule ligne de l'inventaire qui aurait pu contredire le ton haut est
   précisément celle qui est présentée comme le confirmant.** VOLUBILIS écrit
   la finale de โชคดีนะ sans marque de ton, là où il l'écrit `¯na` partout
   ailleurs.
3. **La corroboration annoncée est circulaire.** Filtrer sur `¯na` puis
   observer que « toutes portent `¯na` » ne corrobore rien : c'est la
   définition du filtre. La phrase « sans exception » donne à un tri une valeur
   de mesure.

Le ton haut de นะ reste par ailleurs bien établi (VOLUBILIS ligne 57471 `¯na`,
en.wiktionary /naʔ˦˥/), donc l'item 1 n'est pas en cause. C'est la PREUVE qui
est fausse, dans un dossier dont toute la valeur est d'être recomputable.

**Correction attendue** : retirer โชคดีนะ de la liste, retirer « sans
exception », et remplacer la phrase de corroboration par le constat réel, qui
est plus fort et vrai : sur 243 entrées finissant par นะ, une seule porte une
finale non marquée, et c'est โชคดีนะ.

### B2 : `SYLL-MELODIE` : « seule la mélodie les sépare » est faux, et la page 10 se contredit en quatre lignes

Le fichier écrit trois fois la même affirmation, dont deux sur des pages
d'apprenant :

- Méta, fil des tons : « Les trois syllabes sont brèves, fermées par un coup de
  glotte, et **ne diffèrent que par la mélodie**. »
- Page 8 : « Vous avez donc trois syllabes brèves à distinguer, et **elles ne
  diffèrent que par la mélodie** : ná monte et reste perché, khá aussi, khâ
  tombe. »
- Page 10, titre : « **trois syllabes brèves, trois mélodies** », puis « Elles
  sont construites pareil […] et **seule la mélodie les sépare**. »

Les trois syllabes sont ná /naʔ˦˥/, khá /kʰaʔ˦˥/ et khâ /kʰaʔ˥˩/.

1. ná et khá **ne diffèrent pas par la mélodie** : elles portent le même ton
   haut. Elles diffèrent par la consonne initiale, น contre ค.
2. Il n'y a donc pas **trois** mélodies mais **deux**, haut et descendant.
3. Le fichier le sait et l'écrit, **quatre lignes plus bas sur la même page** :
   « คะ (khá) · HAUT · **même mélodie, autre consonne** ». La page 10 affirme et
   nie la même chose dans le même bloc.

Le défaut se propage à l'exercice 1, tirage 9, dont les trois cartes sont ค่ะ,
คะ et **นะคะ** : « les trois cartes sont des syllabes brèves fermées d'un coup
de glotte, et seule la mélodie les sépare ». นะคะ est **bisyllabique**. Le
tirage annoncé comme « décisif » pour le contraste haut / descendant se gagne
partiellement au comptage de syllabes.

**Correction attendue** : dire ce qui est vrai et suffisant, à savoir que les
trois syllabes se construisent pareil et que **deux d'entre elles ne se
distinguent que par la mélodie**, ná et khá partageant la leur ; et corriger la
description du tirage 9, où la troisième carte porte une syllabe de plus.

## 3. Findings non bloquants

### N1 : `SCAN-337` : deux chiffres incompatibles pour le même décompte

Méta : « Les 28 graphies de l'unité 13 croisées contre les **337** des unités 1
à 12 ». Partie 1 du dossier : « 60 fichiers de leçon, 525 entrées et **353**
graphies distinctes ».

`node scripts/verification/repo-thai-scan.mjs 1 12` rend **353**. Le croisement
refait par l'auditeur donne bien 353 ∩ 28 = **7**, et la liste des sept est
exacte (ครับ, ค่ะ, คะ, ไหม, ไปครับ / ไปค่ะ, แล้วคุณล่ะ, ล่ะ). Seul le nombre
337 est faux.

### N2 : `COLL-13E-FR` : « aucune divergence de fait » avec 13E, alors que le champ `fr` diverge sur le point que la page 4 tranche

Méta : « `lecon-13e.md` publie นะ avec les mêmes `codepoints` […] la même
`transcription` `ná`. **Aucune divergence de fait.** »

Les cinq champs énumérés sont bien identiques, vérification faite. Mais le
champ `fr`, qui appartient au contrat d'item, diverge :

- 13E : « particule finale **qui adoucit** ou qui appuie ce qui précède » ;
- 13B : « (aucune traduction française ; particule finale qui **adresse la
  phrase** à l'interlocuteur) ».

C'est exactement le point auquel la page 4 de 13B consacre une page entière
pour refuser « adoucit » comme description suffisante. Deux fiches de la même
unité publient donc deux gloses inconciliables de la même graphie, et 13B
déclare l'inverse. `item-fields-check.mjs` ne compare pas `fr` : la divergence
est invisible à l'outillage.

### N3 : `FDBK-NAKHA` : l'exercice 4 condamne นะค่ะ, que la page 8 dit ne pas condamner

Page 8 : « Ce cours vous enseigne นะคะ […] et **il ne condamne pas l'autre**
faute de pouvoir le faire. »

Exercice 4, feedback incorrect : « Après นะ, c'est khá, qui reste en haut. khâ
tombe, et **il ne se met pas là**. »

« Il ne se met pas là » est une condamnation, et aucune source du fichier ne la
porte : le corpus consulté écrit นะค่ะ 49 fois, et l'entrée ค่ะ du dictionnaire
normatif est muette sur นะ, ce que le fichier consigne lui-même. Les autres
feedbacks du fichier sont, eux, correctement neutres (« vous avez dit autre
chose », « vous avez produit une autre forme »).

### N4 : `ASSEMBLAGE-ARNKH` : อะไรนะคะ est mis en production sans être déclaré ni contrôlé

Le fichier déclare honnêtement deux assemblages, mais seulement ceux du
dialogue : « อะไรนะครับ est l'item 4 suivi de ครับ, et ไปนะครับ est l'item 5
suivi de ครับ ».

อะไรนะคะ apparaît pourtant trois fois : spécimen de la page 8, réponse attendue
de l'exercice 3 tirage 4 (production), tirage 5 de l'exercice 5. Elle n'est
déclarée assemblage nulle part, n'apparaît dans aucune liste de sources, et
ne figure dans aucun des deux relevés `rid-lookup.mjs` du dossier, qui
contrôlent pourtant นะค่ะ et อะไรคะ. Elle est régulière et sans risque, mais
elle échappe à la règle de déclaration que le fichier s'impose ailleurs.

### N5 : `NAKHA-JAMBE` : la règle enseignée à la page 8 tient sur une seule autorité

Item 3, sources : le fichier écrit que la seconde jambe « n'est pas un
dictionnaire » et qu'il s'agit d'un rang de fréquence. Or le même fichier
définit FrequencyWords comme « signal indicatif de naturalité orale et
**jamais preuve d'un fait linguistique** ».

Vérification faite, ni VOLUBILIS ni en.wiktionary ne corroborent le cas de คะ
après นะ : VOLUBILIS ligne 28944 dit « after a vocative or at the end of a
question », en.wiktionary dit « doubt, interrogation, or suggestion ». La règle
« après นะ, une femme dit คะ », enseignée telle quelle à la page 8, repose donc
sur RID seul. Le fichier le signale à l'incertitude 1 et le route vers l'audit
de naturalité : c'est ce qui rend ce finding non bloquant, pas conforme.

### N6 : `AUDIT-SIX` : « six corps d'entrée lus » n'est aucun des comptes du dossier

Tableau « État des audits », ligne Registre : « passé, **six** corps d'entrée
lus et étiquettes citées ». Le dossier écrit ailleurs : « Corps d'entrée passés
à `rid-entry.mjs` : **8** graphies […] **Sept** rendent un corps d'entrée ; น่ะ
n'en rend aucun ». Le tableau des étiquettes compte 6 lignes, dont celle de น่ะ
qui n'a précisément pas de corps.

Le compte exact est : 8 graphies interrogées, 7 corps rendus, 6 lignes de
tableau, 5 corps effectivement lus parmi ces 6. « Six corps d'entrée lus »
n'est aucun de ces quatre nombres.

### N7 : `PAGE11-DEUX` : « deux tirages » là où la Méta en compte huit

Page 11 : « **Deux tirages** ne se gagnent que sur une syllabe de plus ou de
moins ». La ventilation de l'exercice 1, écrite par la Méta et par l'exercice
lui-même, donne quatre tirages opposant un bloc avec et sans นะ (1 à 4) et
quatre opposant นะ + politesse à la politesse seule (5 à 8), soit huit.

### N8 : `IPANA-DEPART` : la valeur de formule de départ est retirée à la page 5, puis jouée dans le dialogue

Page 5 : « La valeur de formule de départ n'est donc PAS enseignée. Vous
apprenez ไป, plus นะ derrière. » Incertitude 3 confirme le retrait.

Le dialogue met pourtant Nid, « une voisine qui s'en va au début de la scène »,
sur ไปนะคะ glosé « Je m'en vais », puis Paul sur ไปนะครับ glosé « Je m'en
vais » juste avant de quitter la boutique. La scène enseigne par démonstration
l'emploi que la page 5 déclare non enseigné. La glose française reste
compositionnelle, ce qui rend le point discutable, mais la mise en scène ne
l'est pas.

### N9 : `OBJ-HUIT` : « les huit formes du jour » en comprend deux qui ne sont pas du jour

Objectif observable : « il produit en transcription **les huit formes du jour**
à partir du français seul, sur 6 sur 8 ». Les tirages 7 et 8 de l'exercice 4
sont `à·rai` et `pai`, items publiés par 2D et 5B, ce que le plancher du même
exercice écrit noir sur blanc (« 2 sur 8 gagnables par l'antérieur seul »). Six
formes sur huit sont du jour.

## 4. Ce que l'auditeur a refait et trouvé EXACT

Les relevés ci-dessous ont été réexécutés par l'auditeur avec les scripts
versionnés et les artefacts vérifiés par empreinte AVANT usage. Tous
concordent au caractère près avec ce que le fichier écrit.

**Dictionnaire normatif.** Les six corps d'entrée du tableau de la section 1.
Les entrées ละ ๑ (๔) et ล่ะ, lues pour établir le relevé négatif qui fonde le
retrait de l'item 5 : aucune des deux ne glose la valeur de départ, et les
exemples ไปละ / เอาละ sont bien ceux de ละ ๑ (๔). Contrôles de présence :
นะครับ, นะคะ, ไปนะ, อะไรนะ, ไปนะคะ, ไปนะครับ, นะค่ะ, อะไรคะ tous `absent` ;
สิ, ซิ, ล่ะ, จ้ะ, ละ tous `entree`.

**VOLUBILIS.** `VOLUBILIS_Database.xlsx`, 10 848 409 octets, SHA-256
`b9ab7418…fc0c`, 114 579 lignes non vides, 586 541 chaînes partagées : identique
à l'annonce. `VOLUBILIS.ods`, 15 724 718 octets, SHA-256 `bb9c5da5…094cc`.
Lignes 57471 (นะ), 57472 (น่ะ), 58321 (นะครับ), 2215 (อะไรนะ), 65647 (ไปนะ),
65630, 65634, 28944 (คะ), 28945 (ค่ะ), 37006 et 37007 (ครับ) : contenu,
`ThaiPhon`, `TYPE`, marqueurs `(m.)` / `(f.)` et syllabation conformes. Aucune
colonne d'usage sur aucune des lignes citées comme preuve de registre.
นะคะ et นะค่ะ : ABSENT en exact et en sous-chaîne, à l'exception du faux
positif ligne 1870, เอาชนะคะคาน, qui est bien celui décrit. Feuille `Codes` :
en-tête `abbreviations | ENG | FRA | THA | DATA TYPE | REM`, et les trois
lignes décisives `(fam.) → FRA`, `(inf.) → ENG`, `(oral) → ปาก, usage`.
Section `TONES` : `-x normal`, `¯x high`, `_x low`, `/x rising`, `\x falling`.
Inventaire des finales en นะ : **243**, chiffre exact.

**en.wiktionary.** Lu en wikitexte ET en rendu, comme le fichier l'annonce.
นะ : `{{th-particle}}`, **aucun `{{lb|th|…}}` sur aucun des deux sens**, IPA
/naʔ˦˥/, Paiboon `ná`, Royal Institute `na`, formes dérivées ไปนะ et
วันนี้อากาศดีนะครับ, premier exemple glosé อะไรนะ « Pardon? What was that? ».
ครับ : `{{th-pron|คฺรับ}}`, `{{lb|th|formal|humble|men's speech}}`, IPA
/kʰrap̚˦˥/. คะ : `{{lb|th|formerly used by noblemen, now often employed by
women}}`, catégorie `women's speech terms`, et **aucune mention de la suite
นะ + คะ**. น่ะ : `{{lb|th|colloquial}}` sur ses deux sens, IPA /naʔ˥˩/.
นะคะ, นะครับ et ไปนะ : HTTP 404, la page d'erreur et non un article.

**Fréquence.** `th_50k.txt`, SHA-256 `20e7052f…6083`, 50 000 lignes, première
ligne bien un artefact d'encodage (U+0E40 U+0E18). Rangs : นะ 82 / 3 976,
น่ะ 437 / 876, นะคะ 1 268 / 306, นะครับ 1 330 / 291, นะค่ะ 7 980 / 49,
ครับ 10, ค่ะ 21, คะ 278. Les huit rangs et les cinq comptes cités sont exacts.

**Unicode 17.0.** `UnicodeData.txt` 2 198 209 octets SHA-256 `2e1efc1d…470c` et
`IndicPositionalCategory.txt` 52 257 octets SHA-256 `68cedc29…c480`, en-tête
daté 2025-07-29. Ligne 3239 : `0E30;THAI CHARACTER SARA A;Lo`. Ligne 3259 :
`0E48;THAI CHARACTER MAI EK;Mn;107`. IPC ligne 176 `0E30 ; Right`, ligne 384
`0E40..0E44 ; Visual_Order_Left`, ligne 452 `0E47..0E4E ; Top`. Les trois faits
d'encodage de la leçon sont exacts.

**Unicode des graphies.** Les 18 graphies du fichier recalculées depuis leur
champ `thai` : séquences conformes, `NFC === NFD` partout, aucune graphie
stockée hors NFC.

**Réemplois.** `item-fields-check.mjs` rend 1 fichier, 0 codepoints en faute,
0 écart de réemploi, et la comparaison a réellement eu lieu : les items 6, 7 et
8 portent la référence dans leur titre et leur graphie est trouvée dans le
fichier d'origine. Contrôle manuel indépendant des vingt blocs réemployés
contre leur leçon de publication : `khráp` (1E it. 2), `khâ` (1E it. 3),
`khá` (2E it. 1), `à·rai` (2D it. 6), `pai` (5B it. 1), `khâo·jai` et
`mâi khâo·jai` (11A it. 1 et 2), `sà·wàt·dii khráp` / `khâ` (2B it. 2 et 3),
`khoun chûee à·rai khá` et `phǒm chûee … khráp` (collocations 2D des items 6 et
5), `khàwwp·khoun khâ` (2C it. 2), `khǎww·thôot khráp` (8D it. 1),
`pai khráp / pai khâ` (9E it. 10), `mǎi` et `máai` (1D it. 9 et 10), `mâi`
(4D it. 1), `paa`, `pàa`, `pouu` (1C it. 1 à 3). **Vingt sur vingt exacts,
aucune divergence silencieuse.**

**Décomptes de dépôt.** `repo-thai-scan.mjs 13 13` : 5 fichiers, 33 entrées,
28 graphies, 6 ไม้เอก, 4 ไม้โท. Répartition par fichier recomptée par
l'auditeur : 13A 7, 13B 8, 13C 8, 13D 8, 13E 2. Les cinq collisions sont
réelles et 13B en porte bien quatre. `--grep นะ` sur 1 à 12 : **0 graphie**, la
particule est bien neuve. `--check-u07` : convention reproduite, sept chiffres
sur sept.

**Planchers.** `tmp-13b-planchers.mjs` relu ligne à ligne avant exécution : les
douze tirages de l'exercice 1, les six de l'exercice 3, les huit réponses de
l'exercice 4 et les huit tirages de l'exercice 5 encodés dans le script sont
**graphie par graphie** ceux du fichier. Les chiffres imprimés sont ceux
recopiés dans la leçon, y compris la variante écartée de l'exercice 2 à 50,0 %
et les 3,52 % de l'exercice 5, que l'auditeur a recalculés à la main
(9 / 256 = 3,515625 %).

**Cohérence de parcours.** `srs-u04-l4a-06` (montant contre haut à l'écoute) et
`srs-u07-l7a-03` (moyen contre bas à l'écoute) existent bien et portent les
contrastes annoncés. `u12-l12e` page 3 dit bien que le fondamental n'a donné
qu'un registre. L'item 1 de `u05-l5b` refuse bien un registre pour une lecture
non sourçable, geste que 13B dit reprendre.

**Règles d'écriture.** Aucun tiret cadratin ni demi-cadratin (0 occurrence).
Aucune promesse de parler comme un natif, aucune promesse non mesurée.
`Revue native : en attente` est bien affiché. Aucun exercice n'est réussissable
par une réponse constante : 1/12, impossible, 0,700/6, 1/8 et 2/8, tous très
en dessous de leur seuil.

**Affirmations sur le français (section 1 bis).** Les deux seules du fichier
sont couvertes : « une oreille française […] a tendance à faire retomber la
voix en fin de phrase » et « le français qui met souvent le mot d'adresse en
dernier » sont l'une et l'autre modalisées, sans superlatif ni absolu, ce que
la section 1 bis autorise. Le contrôle de l'item 1 (« dites คะ, puis นะ ; si
les deux mélodies vous semblent différentes… ») est une observation vérifiable
par l'apprenant, c'est-à-dire la seconde voie prévue par la politique.

## 5. Ce que le contre-audit externe doit encore attaquer

1. **La naturalité des quatre assemblages produits** : อะไรนะครับ, อะไรนะคะ,
   ไปนะครับ et la double phrase ขอโทษครับ อะไรนะครับ. Seul ไปนะคะ est imprimé
   par une source.
2. **La règle de คะ après นะ**, tant que sa seconde jambe est un corpus de
   sous-titres.
3. **Le régime de preuve de น่ะ**, seule graphie du fichier portant une
   étiquette d'usage lue, et pourtant écartée. L'arbitrage 7 est bien posé.
4. **Le champ `fr` de นะ**, sur lequel 13B et 13E divergent sans le savoir.
