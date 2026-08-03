# Contre-audit adversarial de `lecon-3d.md`

- Fichier audité : `content/authoring/unite-03/lecon-3d.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent de contre-audit interne, consigne adversariale (chercher
  l'erreur, ne pas confirmer le travail)
- Méthode : re-vérification indépendante. Aucune affirmation du fichier n'a été
  reprise sur parole. Le RID a été interrogé directement, VOLUBILIS a été
  téléchargé et relu, les deux éditions de Wiktionary ont été lues en wikitexte
  brut et en rendu, la liste FrequencyWords a été téléchargée et indexée, et
  tous les renvois internes au dépôt ont été ouverts.
- Verdict : **4 findings bloquants, 8 findings non bloquants.** La leçon ne peut
  pas passer en `review` en l'état. Le socle linguistique est en revanche
  d'une solidité inhabituelle : sur 136 faits re-vérifiés, aucune graphie,
  aucun ton, aucune IPA, aucune longueur et aucun corrigé n'est faux.

## Note d'accès technique

Le POST vers `dictionary.orst.go.th/func_lookup.php` renvoie
`ไม่พบคำศัพท์` si le corps est produit par `--data-urlencode` depuis un shell
Windows : le serveur reçoit alors des points d'interrogation. Il faut envoyer
le corps déjà pourcent-encodé en UTF-8 (`--data-raw "word=%E0%B8%84%E0%B8%99..."`)
avec `Referer` et `X-Requested-With`. À consigner pour les prochains relevés,
sans quoi un auditeur pressé conclura à tort que les entrées sont absentes.

## 1. Ce que j'ai confirmé moi-même

Décompte auditable, chaque ligne étant reproductible avec les commandes ci-dessus.

| Domaine                          | Faits re-vérifiés | Résultat                    |
| -------------------------------- | ----------------: | --------------------------- |
| Unicode, codepoints, typographie |                13 | tous exacts                 |
| Valeurs IPA                      |                 9 | toutes exactes              |
| Tons par syllabe                 |                 9 | tous exacts                 |
| Longueurs par syllabe            |                 8 | toutes exactes              |
| RID 2554                         |                15 | tous exacts                 |
| en.wiktionary hors IPA           |                12 | tous exacts                 |
| th.wiktionary hors IPA           |                 8 | tous exacts                 |
| VOLUBILIS v26.2                  |                13 | 12 exacts, 1 faux (voir B4) |
| FrequencyWords `th_50k`          |                13 | tous exacts                 |
| Renvois internes au dépôt        |                11 | 10 exacts, 1 faux (voir N1) |
| Corrigés d'exercices             |                22 | tous justes                 |
| Arithmétique du dossier          |                 3 | toutes exactes              |
| **Total**                        |           **136** |                             |

### 1.1 Unicode et typographie

Les huit séquences `codepoints` des items concordent une à une avec la graphie
`thai` correspondante. Recomptage indépendant : le fichier contient exactement
**95 chaînes thaïes contiguës distinctes**, toutes stables en NFC et toutes
identiques à leur propre forme NFD. Aucun tiret cadratin U+2014, aucun
demi-cadratin U+2013, zéro apostrophe droite U+0027, **266** apostrophes
typographiques U+2019. Les cinq chiffres annoncés dans le dossier de production
sont donc exacts au caractère près.

### 1.2 Tons, IPA, longueurs

J'ai redérivé chaque ton depuis la classe de consonne, le caractère vif ou mort
de la syllabe et la marque tonale, sans regarder les valeurs annoncées :

- คน : ค classe basse, finale sonante, sans marque, syllabe vive, ton **moyen**.
- ตัว : ต classe moyenne, diphtongue, syllabe vive, ton **moyen**.
- ใบ : บ classe moyenne, syllabe vive, ton **moyen**.
- อัน : อ classe moyenne, finale sonante, syllabe vive, ton **moyen**.
- ปลา : groupe ป + ล, la moyenne gouverne, syllabe vive, ton **moyen**.
- สอง et สาม : ส classe haute, finale sonante, sans marque, ton **montant**.
- ถุง : ถ classe haute, voyelle brève mais finale sonante donc syllabe vive,
  ton **montant**. C'est le point où une erreur était le plus probable, la
  brièveté de la voyelle invitant à conclure à tort à une syllabe morte. Le
  fichier ne s'y trompe pas.
- กี่ : ก classe moyenne, ไม้เอก, ton **bas**.

Les neuf valeurs concordent avec les deux éditions de Wiktionary, relevées en
rendu : `/kʰon˧/`, `/tua̯˧/`, `/baj˧/`, `/ʔan˧/`, `/plaː˧/`, `/kiː˨˩/`,
`/tʰuŋ˩˩˦/`, `/sɔːŋ˩˩˦/`, `/saːm˩˩˦/`. Les romanisations Paiboon annoncées sont
également exactes, y compris les moins évidentes : `dtuua`, `bplaa`, `gìi`.

### 1.3 RID 2554, relevé direct

Toutes les citations du fichier ont été retrouvées, y compris les exemples
numérotés, ce qui est le point le plus falsifiable du dossier :

- คน ๑ `น. มนุษย์.` et une seconde vedette คน ๒, verbe de brassage. Conforme.
- ตัว ๑ sens (๒) : `ลักษณนามใช้เรียกสัตว์และสิ่งของบางอย่าง` avec **ม้า ๕ ตัว,
  ตะปู ๓ ตัว, เสื้อ ๒ ตัว**. Les trois exemples annoncés sont exacts.
- ใบ sens (๕) : `ลักษณนามสำหรับใช้เรียกผลไม้ ภาชนะ เครื่องใช้บางอย่าง
หรือแผ่นเอกสาร` avec **มะม่วง ๒ ใบ, ถ้วย ๓ ใบ, ตู้ ๔ ใบ, ใบขับขี่ ๕ ใบ**.
  Les quatre exemples sont exacts.
- อัน sens (๓) : objets `แบนยาวหรือเป็นชิ้นเป็นแผ่น`, puis ลักษณนาม, avec
  **ไม้อันหนึ่ง** et **ไม้ ๒ อัน**. Voir B2 et B3.
- ลักษณนาม : entrée autonome, `คำนามที่แสดงลักษณะของสิ่งต่าง ๆ`, exemples
  **คน ๓ คน, แมว ๒ ตัว, ขลุ่ย ๓ เลา, ลูกคนโต, หมวกใบใหญ่**. Le fichier annonce
  « trois exemples de la forme nom, nombre, classificateur » : exact, les deux
  derniers étant de forme nom + classificateur + adjectif.
- ปลา ๑ `[ปฺลา] น. ชื่อสัตว์น้ำเลือดเย็นมีกระดูกสันหลัง` et ปลา ๒, serpents
  d'eau. Conforme. Le rattachement ปลา → สัตว์ → ตัว à l'intérieur du RID seul
  est donc valide.
- กี่ ๒ `ว. คำประกอบหน้าคำอื่น หมายความว่า เท่าไร เช่น กี่วัน กี่บาท` et กี่ ๑,
  métier à tisser. Conforme.
- **ขวด** : `ภาชนะกลวงใน ... , ลักษณนามว่า ใบ.` Le RID donne ใบ comme
  classificateur de ขวด et ne décrit nulle part ขวด comme un ลักษณนาม. **Le
  signalement que 3D adresse au dossier de `u03-l3e` est donc juste**, et je le
  confirme de façon indépendante : la ligne 1029 de `lecon-3e.md` affirme bien
  que ขวด classificateur est « double-sourcée (RID, entrée ขวด ; Volubilis ...) »,
  ce que l'entrée RID ne dit pas. À corriger dans 3E.
- ถุง : aucun classificateur nommé. Conforme.
- ไข่ ๑ : `ลักษณนามว่า ฟอง ลูก หรือ ใบ`. Les trois classificateurs de l'œuf,
  invoqués page 8, sont exacts.
- สอง et สาม ๑ attestées comme entrées autonomes.
- Contrôles négatifs : อันนี้ et ตัวนี้ sont bien absents, แก้ว bien présent.
  L'arithmétique de la passe 1 est juste : 17 attestées énumérées plus 5
  absentes énumérées font bien 22, et 22 + 8 + 2 + 1 font bien 33.

### 1.4 VOLUBILIS v26.2

Le fichier `VOLUBILIS.ods` a été téléchargé depuis l'URL exacte citée
(`sourceforge.net/projects/belisan/files/VOLUBILIS.ods`), publiée le
**2026-07-01** comme annoncé, puis dépouillé (118 897 lignes, colonnes
`ThaiRom, EasyThai, ThaiPhon, Etymo, THA, ENG, FRA, LEV, TYPE, USAGE, DOM, KEY`).
Toutes les gloses citées dans la leçon sont exactes au caractère près, y compris
les lignes de classificateur, qui sont le nerf de la leçon :

- คน : `[classif. : personnes, individus]`, exact.
- ตัว : `[classif. : animaux, insectes, poissons, objets possédant des pieds ...]`,
  exact, la mention **poissons** est bien là et fonde l'item 6.
- ใบ : ligne française exacte, et la ligne anglaise porte bien
  `... tin-cans, eggs, fruit, **bags, wallets** ...`, ce qui fonde ถุง + ใบ.
- อัน : français `[classif. : petits objets, choses en général]` et anglais
  `[classif.: small objects, pieces of candy, ashtrays, round objects,
**objects with unknown classifiers**]`. Exact. Voir B1.
- กี่คน : entrée autonome, `combien de personnes`, exact.
- สองคน : `pr.`, `vous deux ; tous les deux ; tous deux`. Exact, et la réserve
  de l'incertitude 6 est fondée : la glose est bien pronominale.
- ขวด : `[classif. : bouteilles (soda, bière ...)]`, exact.
- ถุง : `[classif. : sacs, porte-monnaies]`, exact, la divergence de
  l'incertitude 5 est réelle.
- ลักษณนาม, ปลา, สอง : exacts.
- Contrôles négatifs de la passe 2 : กี่ตัว, กี่ใบ, กี่อัน et สองอัน sont bien
  absentes, กี่คน et สองคน bien présentes comme entrées, ไม่กี่คน bien à part.

### 1.5 FrequencyWords

Les treize chiffres cités ont été recomptés sur `th_50k.txt` téléchargée depuis
le dépôt de Hermit Dave. **Les treize sont exacts, rang et occurrences**, y
compris ceux que le fichier ne donne qu'en rang : คน 88 (3776), ตัว 859 (453),
ใบ 1857 (210), อัน 1981 (197), อันนี้ 2932, ปลา 5047 (78), สองคน 5320,
ขวด 5952, ตัวนี้ 9865, กี่คน 12572 (31), สามคน 17219, สองตัว 24065. Et กี่ est
bien absente comme jeton isolé. Aucun chiffre n'a été arrondi ni inventé.

### 1.6 Renvois internes et corrigés

`u03-l3a` enseigne bien ถุง avec la transcription `thǒung`, les dix chiffres
thaïs et le contraste /t/ contre /tʰ/. `u03-l3b` enseigne bien สอง (`sǎwwng`) et
สาม (`sǎam`). `u03-l3c` enseigne bien อันนี้ (`an·níi`), บาท (`bàat`) et
กี่บาท (`kìi bàat`). `1a` enseigne bien อ comme lettre muette d'appui, `1d`
donne bien ไหม (`mǎi`, montant), `1e` donne bien `kan` bref, `2a` donne bien
เพลง (`phleeng`), le ป non aspiré et les voyelles antéposées เ et แ. Le
précédent d'extension invoqué est réel : `awi` existe en 2C, `aao` et `awwi`
en 3B. Et l'incertitude 1 vise juste : `lecon-3a.md` ne contient aucune
occurrence de สาม, donc c'est bien 3B qui l'introduit et c'est 3E qui se trompe
en l'attribuant à 3A.

Les 22 corrigés ont été refaits un par un : les 6 tirages de l'exercice 1
(réponse et carte à retirer), les 6 paires de l'exercice 2, les 5 réponses de
l'exercice 3, les 5 réponses de l'exercice 4. **Aucun corrigé n'est faux, aucun
distracteur n'est accidentellement correct.** Les distracteurs sont proprement
faux : ใบ pour un poisson, ตัว pour un sac, คน pour un poisson, อัน pour un sac.
La politique de saisie de l'exercice 3 est exacte : les quatre réponses
attendues (`toua`, `bai`, `khon`, `an`) ne portent effectivement aucun signe de
ton. Les transcriptions respectent la table v1.1 sans exception, et aucun
graphème abandonné de la v1.0 (`é`, `è`, `eu`, `oû`) ne s'est glissé dans le
fichier.

## 2. Findings bloquants

### B1. Le statut de « recours » de อัน est mono-sourcé, et la page 6 attribue le fait à deux dictionnaires

**Localisation** : page 6 de l'enseignement, champ `fr` de l'item 4, objectif
observable de la Méta, carte `srs-u03-l3d-05`, incertitude 7.

La page 6 affirme : « deux des dictionnaires consultés le donnent aussi comme le
mot à employer quand on ne connaît pas celui de l'objet ». J'ai relu les quatre
sources consultées :

- VOLUBILIS, ligne anglaise de อัน : `objects with unknown classifiers`. C'est
  bien le fait allégué.
- en.wiktionary, section Classifier de อัน : `Classifier for small objects; the
general classifier for small inanimate things`. Ce n'est **pas** le même
  énoncé. « Classificateur général des petites choses inanimées » décrit une
  large extension d'emploi, pas une consigne de repli en cas d'ignorance.
- RID, อัน sens (๓) : objets typiquement plats, longs ou en morceaux. Rien sur
  l'ignorance du classificateur, et rien sur la petitesse.
- th.wiktionary : reprise du RID.

**Exactement une source sur quatre porte le fait.** L'affirmation « deux des
dictionnaires » est fausse, et l'incertitude 7 répète la même erreur en écrivant
que le statut de recours « repose sur VOLUBILIS et en.wiktionary ».

Le fait n'est pas décoratif : il est inscrit dans le champ `fr` normatif de
l'item 4, il figure dans l'objectif observable de la leçon, il est la paire 4 de
l'exercice 2, il est le tirage 5 de l'exercice 3, et il constitue à lui seul la
carte SRS 05. Un fait mono-sourcé ne peut pas porter une carte de maîtrise.

**Correction attendue** : soit trouver une deuxième source indépendante
(une grammaire de référence sur exemplaire serait ici la bonne porte, cf. N4 du
dossier), soit rétrograder l'enseignement à ce que trois sources soutiennent
réellement, à savoir « อัน couvre de petits objets et une gamme très large de
choses », retirer la promesse de repli de la page 6 et du champ `fr`, et
supprimer la carte SRS 05 comme l'incertitude 7 le prévoit déjà.

### B2. « Cet ordre ne change pas » est un absolu faux, contredit par un exemple que la leçon cite elle-même

**Localisation** : page 2 de l'enseignement, feedback correct de l'exercice 1.

La page 2 pose l'ordre nom, nombre, classificateur comme « le seul point de
structure de la leçon » et invite à l'installer « comme un geste ». Le feedback
correct de l'exercice 1 conclut : « C'est l'inverse du français, et **cet ordre
ne change pas**. »

Or l'entrée RID « อัน », que l'item 4 cite en toutes lettres, donne deux
exemples : `ไม้อันหนึ่ง` et `ไม้ ๒ อัน`. Le premier est de forme nom +
classificateur + nombre, exactement l'ordre que la leçon déclare impossible.
th.wiktionary reproduit la même paire. En regard, l'exemple en.wiktionary retenu
par la leçon, `แปรงสีฟันหนึ่งอัน`, met หนึ่ง avant le classificateur. Les deux
ordres sont donc attestés pour « un », dans les sources mêmes du fichier. Les
entrées ลักษณนาม du RID et de th.wiktionary ajoutent `ลูกคนโต` et `หมวกใบใหญ่`,
de forme nom + classificateur + adjectif, qui sortent également du schéma
présenté comme unique.

Le dossier de production, lui, compte correctement : il retient onze exemples
concordants, 3 + 3 + 4 + 1, et n'attribue qu'un seul exemple à อัน. Les auteurs
ont donc vu `ไม้อันหนึ่ง` et l'ont écarté du décompte, mais ils ne l'ont jamais
dit à l'apprenant et lui ont affirmé le contraire.

**Correction attendue** : remplacer l'absolu par une formulation vraie et tout
aussi utilisable, du type « avec un nombre à partir de deux, cet ordre est
constant ; avec « un », vous entendrez aussi l'ordre inverse, que vous
apprendrez plus tard ». Le geste pédagogique est préservé, la promesse fausse
disparaît.

### B3. Item 6 : les trois entrées RID ne donnent pas toutes le même ordre

**Localisation** : champ `sources` de l'item 6, premier point.

Le texte affirme : « Les entrées « ตัว ๑ », « ใบ » et « อัน » du même
dictionnaire donnent le même ordre dans leurs propres exemples. » C'est vrai
pour ตัว ๑ (trois exemples sur trois) et pour ใบ (quatre sur quatre). C'est
**faux pour อัน**, dont un des deux exemples, `ไม้อันหนึ่ง`, présente l'ordre
inverse.

La formulation est d'autant plus gênante qu'elle est contredite par le dossier
de production du même fichier, qui n'accorde qu'un exemple à อัน. Un dossier de
preuve ne peut pas soutenir deux comptes différents de la même entrée.

**Correction attendue** : reformuler en « les entrées ตัว ๑ et ใบ donnent le
même ordre dans tous leurs exemples ; l'entrée อัน en donne un de cette forme,
`ไม้ ๒ อัน`, et un de forme nom + classificateur + nombre, `ไม้อันหนึ่ง` ».

### B4. Item 6 : le contrôle négatif sur VOLUBILIS est mal cité

**Localisation** : champ `sources` de l'item 6, dernier point.

Le texte affirme : « la recherche de la sous-chaîne สองตัว dans VOLUBILIS v26.2
ne retourne que des composés savants de ตัวแปร ». J'ai refait la requête sur le
fichier réel. Elle retourne **huit** lignes distinctes :

- six composés de ตัวแปร (`ฟังก์ชันสองตัวแปร`, `พหุนามเอกพันธุ์สองตัวแปร`,
  `การแจกแจงปรกติสองตัวแปร`, `อนุพันธ์ย่อยของฟังก์ชันสองตัวแปร`,
  `ความหมายทางเรขาคณิตของฟังก์ชันสองตัวแปร`, `ค่าสูงสุดและค่าต่ำสุดของฟังก์ชันสองตัวแปร`) ;
- `ทฤษฎีสองตัวประกอบ`, qui repose sur ตัวประกอบ et non sur ตัวแปร ;
- `ยิงปืนนัดเดียวได้นกสองตัว`, le proverbe « faire d'une pierre deux coups ».

Cette dernière ligne n'est pas un composé savant : c'est une **attestation
réelle du patron enseigné**, `นก` + `สอง` + `ตัว`, avec un animal comme nom
compté. L'affirmation du fichier est donc fausse sur les faits, et elle
sous-estime son propre dossier : le seul contre-exemple utile de la base est
précisément une preuve de naturalité du patron, que l'incertitude 4 réclame.

**Correction attendue** : réécrire le contrôle négatif avec le décompte réel, et
verser `ยิงปืนนัดเดียวได้นกสองตัว` à l'appui de l'incertitude 4, qui s'en trouve
partiellement levée pour ปลาสองตัว.

## 3. Findings non bloquants

### N1. Le kh soufflé n'est pas enseigné en 2A

La Méta annonce : « La leçon réemploie **le kh soufflé de 2A** dans คน ».
`lecon-2a.md` a pour cible phonétique le contraste d'aspiration **bilabiale**,
/p/ contre /pʰ/ sur ป, ผ et พ, et ne contient **aucune** occurrence de `kh` dans
ses transcriptions. Le travail explicite sur l'initiale aspirée `kh` est la
cible de **2C** (« opposer sur la même initiale aspirée `kh` le ton bas long de
ขอบ et le ton montant long de ขอ »). Renvoi à corriger en 2C. Les autres renvois
de la même phrase (t non soufflé de 3A, ton bas de กี่ en 3C, tons montants de
3B) sont exacts.

### N2. Le feedback de l'exercice 4 nomme mal le ton bas

Le feedback de confusion 4 et 5 dit : « **kìi descend** et pose une question,
sǎwwng monte ». Le champ `ton` de l'item 8 dit correctement « bas ». Dans un
cours dont la taxonomie réserve le mot « descendant » au ton /˥˩/, décrire le
ton bas par le verbe « descendre » installe exactement la confusion que les
unités 1 et 2 travaillent à défaire. Proposer : « kìi reste en bas et pose une
question, sǎwwng monte et donne une réponse ».

### N3. « Comme la fin de tatoua » enseigne la mauvaise proéminence pour /ua̯/

Page 4 : « lisez ou, puis a, dans la même syllabe, comme la fin de « tatoua » ».
En français, « tatoua » se réalise le plus souvent [ta.twa] : le /u/ y est une
semi-consonne d'attaque et le /a/ porte la syllabe. Le thaï fait l'inverse, et
la leçon le sait, puisqu'elle retient l'IPA `/tua̯˧/`, où le diacritique de
non-syllabicité est posé sur le `a` : c'est le /u/ qui est noyau et le /a/ qui
est glissement de sortie. Un francophone qui suit l'exemple produira quelque
chose de plus proche de ตวา que de ตัว. Le champ `note_fr` de l'item 2, lui,
décrit correctement le mouvement. C'est donc l'exemple d'appui qu'il faut
changer, pas la description.

### N4. Un objectif observable n'est mesuré par aucun exercice

La Méta annonce que l'apprenant « complète la question กี่ + classificateur pour
demander un nombre de personnes ». Dans toute la section Exercices, กี่
n'apparaît qu'à un seul endroit : le tirage 4 de l'exercice 4, qui est une
**reconnaissance à l'écoute** parmi trois gloses françaises. Aucun exercice ne
fait produire ni compléter กี่ + classificateur. La carte `srs-u03-l3d-06`
demande pourtant de « produire กี่คน », compétence que la leçon n'entraîne ni ne
mesure. Soit ajouter un sixième tirage `recall` du type « … คน (combien de
personnes) : réponse `kìi` », soit rétrograder l'objectif et la carte SRS à la
reconnaissance.

### N5. Le champ `longueur` sort du contrat pour deux items

`CONVENTIONS.md` impose `longueur` par syllabe avec les valeurs courte ou
longue. L'item 2 porte « diphtongue /ua/ » et l'item 6 porte « toua diphtongue ».
Ce ne sont pas des valeurs de longueur. L'item 3 s'en tire mieux en écrivant
« brève (diphtongue /aj/) ». Harmoniser sur ce modèle, ou amender le contrat
pour prévoir explicitement le cas des diphtongues, ce que l'arbitrage de
l'incertitude 2 devra de toute façon trancher.

### N6. สาม est employé en face de l'apprenant sans recontrôle dans cette leçon

สาม apparaît dans les tirages 3 et 4 de l'exercice 1, le tirage 4 de
l'exercice 3, le tirage 3 de l'exercice 4 et dans un feedback d'écoute. C'est
donc un mot affiché et entendu. สอง, dans la même situation, reçoit un
recontrôle explicite dans le champ `sources` de l'item 6, sur quatre sources.
สาม n'en reçoit aucun. J'ai vérifié qu'il est correctement sourcé dans
`lecon-3b.md` et que sa graphie, son ton montant et son IPA `/saːm˩˩˦/` sont
justes, donc le fait est bon ; c'est la traçabilité qui est asymétrique. Ajouter
une ligne de recontrôle de สาม à l'item 6, au même titre que สอง.

### N7. La passe 1 VOLUBILIS n'est pas reproductible

Le dossier écrit : « Passe 1, correspondance exacte : 24 graphies cherchées, 24
trouvées, aucune absente. » Les 24 graphies ne sont pas énumérées. Le relevé RID
du même fichier fait exactement l'inverse et le fait bien : il liste ses 17
attestées et ses 5 absentes, ce qui m'a permis de les recontrôler une à une.
Énumérer les 24 graphies, comme le fait la passe 2 pour ses 11 sous-chaînes.

### N8. La liste « hors périmètre » du SRS oublie deux classificateurs réellement rencontrés

La section SRS liste les classificateurs croisés mais non enseignés : ฟอง, ลูก,
หัว, ราย, นาย, ท่าน, คัน et เลา. Or les entrées « กี่ » des deux éditions de
Wiktionary, que la leçon exploite pour l'item 8, attachent à กี่ ๑ les
classificateurs **หลัง** (en et th) et **เครื่อง** (th). Ces deux-là sont
rencontrés et ne figurent pas dans la liste, alors qu'ils viennent de l'entrée
la plus centrale de l'item 8. À l'inverse, je n'ai pas retrouvé คัน en position
de classificateur dans les entrées consultées pour cette leçon. Compléter et
resserrer la liste.

## 4. Ce que l'audit ne couvre pas

- **Naturalité.** Aucun locuteur n'a été consulté. L'incertitude 4 reste ouverte
  pour ถุงสองใบ, même si B4 apporte une attestation utile pour le patron
  ปลาสองตัว via `ยิงปืนนัดเดียวได้นกสองตัว`.
- **Primauté manuelle du RID.** Mon relevé est automatisé lui aussi. La porte
  manuelle de l'incertitude 10 reste requise, et elle est bien, comme le fichier
  le dit, plus importante ici qu'ailleurs, puisque B1, B2 et l'écart de ขวด
  reposent sur la lecture d'entrées précises.
- **Grammaire de référence.** Aucune n'est acquise. B2 en est l'illustration
  directe : un énoncé grammatical explicite aurait immédiatement signalé que
  l'ordre varie avec « un ». C'est la dépense la plus rentable à débloquer avant
  `review`.
- **Audio, accessibilité, revue native.** Non couverts, toujours en attente.

## 5. Suite

1. Corriger B1 à B4. B1 et B2 touchent le texte affiché à l'apprenant, B3 et B4
   touchent le dossier de preuve.
2. Corriger N1 à N8, qui sont tous des corrections locales.
3. Corriger dans `lecon-3e.md` l'affirmation « double-sourcée (RID, entrée
   ขวด ...) », que ce fichier signalait déjà et que je confirme fausse.
4. Préparer ensuite le lot de contre-audit externe `contre-audit-gpt56.md`, en y
   versant prioritairement B1, B2 et l'incertitude 4.
5. Statut inchangé : `draft`. Revue native : en attente.
