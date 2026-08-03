# Vérification adversariale : unité 2, leçon 2E

- Fichier audité : `content/authoring/unite-02/lecon-2e.md`
- Date : 3 août 2026
- Auditeur : agent de contre-audit indépendant (Claude Opus 5), consigne
  adversariale : chercher des erreurs, ne rien confirmer sur la foi du
  rédacteur.
- Méthode : re-consultation directe de CHAQUE source citée (WebFetch, 24
  requêtes), recalcul programmatique des codepoints et de la normalisation,
  relecture des leçons 2A à 2D livrées, contrôle des corrigés d'exercices.
  Aucune valeur du rédacteur n'a été reprise sans re-vérification.

## Résumé

- Faits re-vérifiés et CONFIRMÉS par l'auditeur : **63**
- Findings : **12**, dont **5 bloquants**
- Verdict : **le passage `draft → review` doit être refusé** tant que
  F-2E-01 à F-2E-05 ne sont pas résolus.

Le dossier de sources de cette leçon est, dans l'ensemble, d'une honnêteté
inhabituelle : toutes les citations Wiktionary que j'ai pu rejouer sont
exactes au mot près, y compris les trois constats de 404, et les abstentions
volontaires (ต้น / นก comme prénoms) sont justifiées. Les défauts ne sont pas
des inventions de sources : ce sont un ton faux propagé depuis l'unité 1, un
fait grammatical mono-sourcé, un exercice qui enseigne une règle fausse, et
un dossier de production qui décrit un état du dépôt qui n'est pas le bon.

## 1. Ce que j'ai confirmé moi-même

### 1.1 Unicode et intégrité du fichier (5 contrôles)

Calcul programmatique sur les 73 chaînes thaïes distinctes du fichier :

- toutes les chaînes sont NFC-stables et identiques en NFC et en NFD ;
- les **12** champs `codepoints` déclarés correspondent exactement à leur
  champ `thai` (y compris les deux chaînes de l'item 9 et les 17 points de
  code de ยินดีที่ได้รู้จัก) ;
- `codepoints` de ไหว้ dans la note culturelle : exact ;
- aucun tiret cadratin (U+2014), demi-cadratin (U+2013), barre horizontale
  (U+2015) ni signe moins (U+2212). Règle ADR-0022 respectée ;
- ordre de stockage des voyelles antéposées (ไ dans อะไร, ไหม, ได้, ไหว้)
  conforme à l'ordre logique thaï.

### 1.2 Items linguistiques (48 contrôles)

Chaque ligne ci-dessous a été rejouée sur la source citée. « exact » signifie
que la citation du rédacteur reproduit fidèlement ce que la source dit.

| Item              | Contrôle                                                                                                                                              | Résultat                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| คะ                | IPA /kʰaʔ˦˥/, ton haut, brève                                                                                                                         | confirmé (en.wikt)                                                          |
| คะ                | citation en.wikt « formerly used by noblemen, now often employed by women » / « doubt, interrogation, or suggestion »                                 | exact                                                                       |
| คะ                | citation th.wikt คำลงท้ายที่ผู้หญิงใช้ในการถาม หรือบอกให้ทราบอย่างสุภาพ + exemple มีอะไรให้ฉันช่วยไหมคะ                                               | exact                                                                       |
| ผม                | IPA /pʰom˩˩˦/, ton montant, brève                                                                                                                     | confirmé (en.wikt + th.wikt)                                                |
| ผม                | citation en.wikt « slightly formal, men's speech », « employed by a male when addressing any commoner », กระผม plus formel, sens nominal « headhair » | exact                                                                       |
| ผม                | citation th.wikt คำใช้แทนตัวผู้พูด เพศชาย et ขนที่ขึ้นอยู่บนศีรษะ โดยปกติเป็นเส้นยาว                                                                  | exact                                                                       |
| ผม                | registre « poli »                                                                                                                                     | soutenu (en.wikt « slightly formal », th.wikt สุภาพ)                        |
| ดิฉัน             | IPA /di˨˩.t͡ɕʰan˩˩˦/, bas + montant, deux brèves                                                                                                       | confirmé                                                                    |
| ดิฉัน             | citation en.wikt « formal, women's speech », « addressing a commoner of equal or higher status », formes liées ฉัน / อิฉัน                            | exact                                                                       |
| ชื่อ              | IPA /t͡ɕʰɯː˥˩/, descendant, longue                                                                                                                     | confirmé (en.wikt + th.wikt)                                                |
| ชื่อ              | citation en.wikt « name ; title » / « dignity ; reputation »                                                                                          | exact                                                                       |
| ชื่อ              | citation th.wikt คำที่ตั้งขึ้นสำหรับเรียกคน... + composés ชื่อจริง / ชื่อเล่น / ชื่อสกุล                                                              | exact                                                                       |
| คุณ               | IPA /kʰun˧/, ton moyen, brève                                                                                                                         | confirmé                                                                    |
| คุณ               | citation en.wikt « colloquial, polite », 2e ou 3e personne, titre d'adresse                                                                           | exact                                                                       |
| อะไร              | IPA /ʔa˨˩.raj˧/, bas + moyen, deux brèves                                                                                                             | confirmé                                                                    |
| อะไร              | citation en.wikt « what? » + « something ; anything », romanisation à-rai                                                                             | exact                                                                       |
| ยินดี             | IPA /jin˧.diː˧/                                                                                                                                       | confirmé                                                                    |
| ยินดี             | l'entrée porte bien l'exemple ยินดีที่ได้รู้จักครับ glosé « Nice to know you! (male speaker) »                                                        | exact                                                                       |
| รู้จัก            | IPA /ruː˦˥.t͡ɕak̚˨˩/, « to know (a person) ; to be acquainted with »                                                                                    | confirmé                                                                    |
| รู้จัก            | l'entrée porte bien l'exemple ยินดีที่ได้รู้จัก glosé « pleased to know you »                                                                         | exact                                                                       |
| ที่               | IPA /tʰiː˥˩/, sens de pronom relatif                                                                                                                  | confirmé                                                                    |
| ได้               | IPA /daːj˥˩/, voyelle **longue**                                                                                                                      | confirmé, la longueur annoncée est juste                                    |
| ยินดีที่ได้รู้จัก | séquence de tons yin·dii thîi dâai róuu·jàk                                                                                                           | confirmée par la romanisation propre à en.wikt « yin-dii tîi dâai rúu-jàk » |
| สบายดี            | IPA /sa˨˩.baːj˧.diː˧/, « to be well (in health), happy, contented »                                                                                   | exact                                                                       |
| ไหม               | IPA /maj˩˩˦/, montant, **brève**, variante มั้ย                                                                                                       | confirmé                                                                    |
| ต้น               | IPA /ton˥˩/, descendant, brève                                                                                                                        | confirmé                                                                    |
| ต้น               | citation en.wikt « tree ; trunk ; beginning ; source » + classificateur plantes et poteaux                                                            | exact                                                                       |
| ต้น               | l'entrée ne comporte aucun emploi comme prénom                                                                                                        | confirmé, l'abstention du rédacteur est justifiée                           |
| นก                | IPA /nok̚˦˥/, haut, brève, « bird »                                                                                                                    | confirmé                                                                    |
| นก                | « L'entrée ne mentionne aucun emploi comme prénom ou surnom »                                                                                         | confirmé mot pour mot                                                       |
| ไหว้              | IPA /waːj˥˩/                                                                                                                                          | confirmé                                                                    |
| ไหว้              | citation en.wikt « an expression of respect or reverence by pressing the palms together, accompanied by a bow... »                                    | exact                                                                       |
| ไหว้              | citation th.wikt ทำความเคารพโดยยกมือขึ้นประนม ถ้าเป็นผู้น้อยไหว้ผู้ใหญ่...                                                                            | exact                                                                       |

Trois constats d'absence, annoncés par le rédacteur, sont eux aussi exacts :

- `https://en.wiktionary.org/wiki/ยินดีที่ได้รู้จัก` : **404 confirmé** ;
- `https://th.wiktionary.org/wiki/ยินดีที่ได้รู้จัก` : **404 confirmé** ;
- `https://en.wiktionary.org/wiki/พอล` : **404 confirmé**.

Aucune URL Wiktionary citée dans la leçon n'est inventée, et aucune ne dit
autre chose que ce qu'on lui fait dire. C'est le point fort du dossier.

### 1.3 Exercices (4 contrôles de corrigé)

- Exercice 1 : la réponse 1 est la bonne, les distracteurs 2 et 3 sont faux.
  **Mais** voir F-2E-03 sur le feedback et la validité de l'item.
- Exercice 2 : les 4 appariements sont corrects, particule et genre compris.
- Exercice 3 : `ผม ชื่อ ต้น ครับ` est l'ordre correct, et ค่ะ est bien
  l'intrus à retirer. Corrigé juste.
- Exercice 4 : la réponse 1 est correcte ; « Est-ce que vous allez bien ? »
  (สบายดีไหม) et « Enchanté de vous connaître » (ยินดีที่ได้รู้จัก) sont bien
  des distracteurs faux, tirés du lexique connu.

### 1.4 Transcription pédagogique

Conformité à `thainaute-fr-v1.1` vérifiée graphème par graphème sur les 11
transcriptions d'items et les 8 répliques. Sont **corrects** : `khá`, `phǒm`,
`dì·chǎn`, `chûee`, `khoun`, `à·rai`, `mǎi`, `tôn`, `nók`, `khâ`, `khráp`,
`khàwwp·khoun`, `láeew·joee·kan`, `yin·dii thîi róuu·jàk`. Les diacritiques
sont bien réservés aux tons, posés sur la première lettre du noyau, et les
longues doublent la dernière lettre du digramme. Deux exceptions traitées en
F-2E-01 et F-2E-08.

## 2. Findings

### F-2E-01 — BLOQUANT — ton faux sur สวัสดี, affiché à l'apprenant

`sawàtdii` (lignes 512 et 515, répliques 1 et 2 du dialogue ; également 695).

Vérifié sur en.wiktionary : สวัสดี = **/sa˨˩.wat̚˨˩.diː˧/**, romanisation
Paiboon **sà-wàt-dii**. La première syllabe porte un ton **bas**.

Or `thainaute-fr-v1.1` pose « moyen `a` (rien) ». En écrivant `sawàtdii`, la
leçon enseigne donc un ton **moyen** sur une syllabe qui est **basse**. Ce
n'est pas une question de séparateur : c'est une information de ton fausse,
sous les yeux de l'apprenant, dans la première réplique du dialogue.

Aggravant : la leçon **2B de la même unité** écrit correctement `sà·wàt·dii`
(7 occurrences, dont les spécimens d'enseignement des lignes 37 et 40), et sa
cible phonétique dit explicitement « garder le ton bas de la syllabe
d'attaque sà ». L'incertitude 6 du dossier de 2E ne mentionne QUE l'absence
de point médian et justifie de « conserver la forme de 1E pour ne pas
dérouter l'apprenant » : la justification tombe, puisque l'unité 2 a déjà
migré. Le rédacteur a d'ailleurs correctement marqué `sà·baai` dans l'item 9
du même fichier, ce qui rend l'incohérence purement mécanique.

Correction : `sà·wàt·dii` partout, et reclasser l'incertitude 6 en finding de
ton, pas en question de séparateur.

### F-2E-02 — BLOQUANT — « ชื่อ est à la fois nom et verbe » repose sur une seule source

Item 4, champ `fr` : « nom, prénom ; **s'appeler** ». `note_fr` : « le mot est
à la fois nom et verbe, ce qui explique pourquoi ผมชื่อต้น n'a pas besoin de
verbe "être" ». Ce fait grammatical porte toute la leçon : c'est lui qui
justifie le bloc « pronom + ชื่อ + nom » et le feedback de l'exercice 3.

Re-vérification :

- en.wiktionary ชื่อ, **wikitext brut** (`action=raw`) : la section thaïe ne
  contient qu'un `===Noun===`. **Aucune section Verb.** Les deux seules
  définitions sont « name; title » et « dignity; glory; honour; reputation ».
- th.wiktionary ชื่อ : une seule section **คำนาม** (nom). **Aucune คำกริยา.**
  Les définitions sont คำที่ตั้งขึ้นสำหรับเรียกคน... et เกียรติยศ.

Le rédacteur cite ces deux entrées honnêtement, sans leur prêter de sens
verbal. Mais il en résulte que le sens verbal ne repose que sur **Volubilis**
(`TYPE=v.`, « s'appeler ; se nommer ; se prénommer ») : **source unique**, et
qui plus est non reproductible (F-2E-06). La politique impose deux sources
indépendantes par fait.

Le fait est très probablement vrai (ชื่อ fonctionne bien comme verbe d'état en
thaï standard), mais il n'est pas doublement sourcé dans ce dossier. Il faut
une seconde source de la politique : RID 2554 en consultation manuelle, ou
une grammaire de référence (Iwasaki et Ingkaphirom, Smyth), qui traitent
explicitement ce type de prédicat.

### F-2E-03 — BLOQUANT — l'exercice 1 enseigne une règle fausse en correction

Stimulus : réplique 3 entière, « ดิฉันชื่อนกค่ะ **คุณชื่ออะไรคะ** ».
Feedback correct : « Chez une femme, c'est le ton de la particule finale qui
**transforme une affirmation en question**. »

C'est faux, et démontrablement faux sur ce stimulus précis : la seconde
phrase contient **อะไร**, mot interrogatif. คุณชื่ออะไร est une question quelle
que soit la particule finale ; คุณชื่ออะไรค่ะ resterait une question. La
particule คะ accompagne la question, elle ne la crée pas. En thaï, la question
est portée par le mot interrogatif, par ไหม, ou par l'intonation, jamais par
คะ seul.

Deux conséquences :

1. **Validité de l'item nulle** : un apprenant qui n'a strictement rien
   compris au contraste ค่ะ / คะ répond juste en reconnaissant อะไร, mot
   enseigné en 2D. L'exercice ne mesure donc pas l'objectif qu'il annonce.
   Le rédacteur a vu le problème mais l'a rangé en « pièges connus », comme
   s'il s'agissait d'une erreur d'apprenant, alors que c'est un défaut de
   construction de l'item.
2. **Fait faux enseigné** : la généralisation apparaît en correction, au
   moment où l'apprenant est le plus réceptif.

Même défaut dans l'exercice 4, « pièges connus » : « lire คะ comme ค่ะ et
conclure à une affirmation » — impossible, อะไร est là.

Correction : construire le stimulus sur une paire réellement minimale, sans
mot interrogatif, du type สบายดีค่ะ (affirmation) contre สบายดีไหมคะ, ou mieux
un couple où seule la particule change ; et réécrire le feedback en « la
particule signale que la locutrice pose une question » plutôt que « la
transforme en question ».

### F-2E-04 — BLOQUANT — prérequis inexistant : ยินดีที่ได้รู้จัก n'est enseigné nulle part en 2A à 2D

Méta, `Prérequis` : « leçons 2A à 2D (... **ยินดีที่ได้รู้จัก**, สบายดี, ไหม) ».

Vérifié par recherche sur les quatre fichiers livrés : la chaîne **ยินดี
n'apparaît 0 fois** dans `lecon-2a.md`, `lecon-2b.md`, `lecon-2c.md` et
`lecon-2d.md`. Les items déclarés de 2D sont ผม, ดิฉัน, ฉัน, คุณ, ชื่อ, อะไร,
มาจาก, ฝรั่งเศส. Le bloc « enchanté » n'existe pas dans l'unité avant 2E.

La leçon se contredit elle-même : le dossier de production déclare
ยินดีที่ได้รู้จัก comme l'un des **deux items de liaison réellement nouveaux**,
tandis que la Méta le range dans les **acquis** de 2A à 2D. Un apprenant
arrivant en 2E rencontrerait une formule de six syllabes présentée comme
connue.

Le reste des prérequis est, lui, exact et vérifié : ผม, ดิฉัน, ชื่อ, คุณ, อะไร
sont bien enseignés en 2D ; สบายดี et ไหม sont bien enseignés en 2B.

Correction : retirer ยินดีที่ได้รู้จัก de la liste des prérequis et l'assumer
comme item nouveau enseigné, avec une page d'enseignement dédiée (les 5 pages
actuelles ne l'enseignent jamais : il apparaît directement dans le dialogue).

### F-2E-05 — BLOQUANT — le dossier affirme que คะ est nouveau ; 2B l'enseigne déjà, c'est son objectif

Item 1 est titré « คะ (**nouveau**, item de liaison) ». La page 2 de
l'Enseignement le présente comme neuf (« Voici sa jumelle »). Le dossier
conclut : « Items de liaison réellement nouveaux : **deux** ».

Vérifié dans `lecon-2b.md` :

- objectif observable de 2B, lignes 10 et 11 : « il **distingue à l'écoute la
  particule de question คะ de la particule d'affirmation ค่ะ chez une
  locutrice** » ;
- cible phonétique de 2B, ligne 15 : « réinvestir le contraste ton haut
  contre ton descendant sur une syllabe brève (**คะ contre ค่ะ**) » ;
- page 4 entière de 2B, lignes 58 à 68, consacrée au contraste, spécimen
  สบายดีไหมคะ compris ;
- 25 occurrences de คะ dans 2B, 9 dans 2D (dont l'avertissement explicite
  ligne 358).

L'objectif observable de 2E (« distingue ค่ะ de คะ chez une locutrice »)
**duplique donc littéralement celui de 2B**, et l'item 1, la page 2, une
partie de l'exercice 1 et l'item SRS 03 réenseignent un acquis.

Aggravant, la prémisse invoquée par le dossier est fausse : « au moment de la
rédaction, le répertoire `content/authoring/unite-02/` ne contenait aucune
autre leçon ». Les horodatages de dernière modification sont 2B 14:18:12,
2C 14:20:25, 2A 14:21:45, **2E 14:22:47**, 2D 14:23:49 : 2A, 2B et 2C
existaient déjà. La clause de repli du dossier (« Si 2D enseigne déjà ce
second bloc... ») ne couvre que ยินดีที่ได้รู้จัก, jamais คะ.

Correction : reclasser คะ en réemploi consolidé, réécrire l'objectif de 2E
pour qu'il ne duplique pas 2B (2E est un bilan de rencontre, sa valeur propre
est l'assemblage et le dialogue suivi, pas la découverte de คะ), et corriger
l'affirmation « deux items nouveaux » du dossier.

### F-2E-06 — non bloquant — le double sourçage Volubilis n'est pas reproductible

11 items sur 12 s'appuient sur « Volubilis Database v26.2 » comme seconde
source. Or :

- le fichier `VOLUBILIS Database.xlsx` **n'est pas présent dans le dépôt**
  (recherche récursive : aucun résultat hors
  `unite-01/verification-volubilis.md`) ;
- la « source » citée est une URL de téléchargement SourceForge pointant un
  classeur de 114 577 lignes, ce qui ne satisfait pas l'exigence de
  `CONVENTIONS.md` : « URL exacte de **l'entrée** consultée ».

Aucun auditeur ultérieur ne peut rejouer ces 11 citations. Conséquence
concrète : une fois Volubilis écarté comme non reproductible, **ดิฉัน, คุณ,
อะไร, ต้น, นก, ไหม et le bloc ชื่ออะไร ne conservent qu'une seule source
vérifiable** (en.wiktionary), ce qui les met à la limite de la règle des deux
sources indépendantes. Le cas de ชื่อ verbe est déjà bloquant en F-2E-02.

Correction : verser un extrait figé et daté des lignes Volubilis utilisées
dans `unite-02/`, comme cela a été fait pour l'unité 1 dans
`verification-volubilis.md`, ou basculer la seconde source sur th.wiktionary
partout où l'entrée existe.

### F-2E-07 — non bloquant — surdéclaration du sourçage dans `note_fr` de ดิฉัน

Item 3, `note_fr` : « Le pronom est marqué formel par **les deux
dictionnaires consultés** ».

Le même fichier dit le contraire dans son incertitude 2 : « ดิฉัน est marqué
formel par en.wiktionary ("formal", women's speech) et **simplement (f.) par
Volubilis** ». Une seule des deux sources porte la marque de registre.
J'ai confirmé le côté en.wiktionary (« formal, women's speech ») ; le côté
Volubilis n'est pas vérifiable (F-2E-06), mais le rédacteur lui-même déclare
qu'il ne porte pas la mention. La phrase de `note_fr` doit être corrigée.

### F-2E-08 — non bloquant — la convention v1.1 ne définit pas la graphie d'un /aːj/ long

La leçon écrit `dâai` pour ได้ (/daːj/, longue) et `mǎi` pour ไหม (/maj/,
brève). Les deux valeurs phonétiques sont **justes**, je les ai confirmées
séparément sur en.wiktionary. Mais `thainaute-fr-v1.1` §3 ne donne qu'une
graphie de diphtongue, `ai` pour /aj/, et §2 impose de doubler la **dernière**
lettre du graphème pour la longue, ce qui donnerait `aii` et non `aai`.

La leçon applique donc implicitement une règle non écrite (« /aːj/ = `aa` +
`i` »), cohérente avec `baai` de สบาย mais absente de la convention. À
trancher et à documenter dans `CONVENTIONS.md` avant compilation, sinon
`ai` / `aai` deviendra ambigu pour l'apprenant.

### F-2E-09 — non bloquant — transcriptions divergentes entre leçons de la même unité

Sur le mot le plus répété de l'unité :

- 2E écrit **`chûee`** pour ชื่อ, 11 occurrences ;
- 2D écrit **`chûue`** pour le même mot, 20 occurrences (dont la cible
  phonétique, ligne 18).

**2E a raison** : v1.1 pose `ue` pour /ɯ/ et le doublement de la dernière
lettre pour la longue, soit `uee`. C'est 2D qui doit être corrigé. Divergence
mineure du même ordre sur le séparateur : 2E écrit `sà·baai dii mǎi`, 2B
écrit `sà·baai·dii·mǎi`.

Le dossier de 2E signale le point mineur du séparateur de สวัสดี mais pas ce
conflit-ci, qui est plus visible.

### F-2E-10 — non bloquant — la règle « ค่ะ = affirmation / คะ = question » est plus absolue que les sources citées

Page 2 : « Le mot s'écrit sans marque de ton pour la question, avec la marque
่ pour l'affirmation. »

Les deux sources citées dans l'item 1, que j'ai rejouées, sont plus larges :

- en.wiktionary : « used at the end of an expression of **doubt,
  interrogation, or suggestion** » ;
- th.wiktionary : « คำลงท้ายที่ผู้หญิงใช้ในการถาม **หรือบอกให้ทราบอย่างสุภาพ** »,
  soit « pour poser une question **ou pour informer poliment** ».

Le champ `fr` de l'item est correctement nuancé (« en fin de question ou
d'interpellation ») ; c'est le texte enseigné qui durcit la règle au-delà de
ses propres sources. La simplification est défendable à ce niveau, mais elle
doit être signalée comme telle dans l'item, sans quoi l'audit de sens la
relèvera.

### F-2E-11 — non bloquant — incohérence de scène en réplique 7

Le décor dit « Nok **anime** un atelier de cuisine ». En réplique 7, elle
indique la salle à Ton et dit แล้วเจอกันค่ะ, « à tout à l'heure », alors
qu'elle est censée animer l'atelier dans lequel elle l'envoie. Plausible si
elle reste à l'accueil, mais la scène ne le dit pas. À arbitrer à l'audit de
naturalité, avec l'incertitude 1 déjà consignée.

### F-2E-12 — non bloquant — ไหว้ réintroduit sans référence à 2B

La note culturelle de 2E présente ไหว้ avec fiche de sources complète,
codepoints et la réserve « nous attendons la revue d'un locuteur natif avant
de les enseigner ». Or ไหว้ est **l'item 1 de 2B**, enseigné dès sa page 1,
avec la même réserve formulée autrement. Redondance non signalée, et double
dossier de preuve pour un même item dans une même unité. À consolider.

## 3. Ce qui n'est PAS un finding

Pour éviter que ces points soient rouverts inutilement :

- **`dâai` longue n'est pas une erreur.** J'ai suspecté un ton et une
  longueur fautifs sur ได้ (ไ étant phonémiquement bref) : en.wiktionary donne
  bien /daːj˥˩/, respelling ด้าย, et sa propre romanisation de l'exemple de
  รู้จัก est « yin-dii tîi dâai rúu-jàk ». Le rédacteur a raison, et il a
  raison aussi de garder ไหม bref : l'asymétrie est celle de la source.
- **Les quatre mécaniques au lieu de cinq sont conformes.** `CLAUDE.md` dit
  explicitement de ne pas remplir artificiellement chaque leçon avec les cinq
  formats. L'écartement de `recall` est motivé et le rappel est porté par le
  SRS.
- **Les abstentions sur ต้น et นก sont exemplaires.** J'ai vérifié : aucune
  des deux entrées en.wiktionary ne mentionne d'emploi comme prénom ou
  surnom, exactement comme le dit la leçon. Le refus d'enseigner « surnoms
  courants » faute de seconde source est la bonne décision.
- **Les trois 404 annoncés sont réels.** Vérifiés un par un.
- **Aucun tiret cadratin.** Contrôle programmatique, zéro occurrence.

## 4. Portes à franchir avant `draft → review`

1. Corriger `sawàtdii` en `sà·wàt·dii` (F-2E-01) et reclasser l'incertitude 6.
2. Doublement sourcer le sens verbal de ชื่อ, ou retirer l'affirmation
   grammaticale (F-2E-02).
3. Reconstruire l'exercice 1 sur une paire réellement minimale et réécrire
   son feedback (F-2E-03).
4. Aligner Méta, dossier et contenu réel de 2A à 2D sur ยินดีที่ได้รู้จัก
   (F-2E-04) et sur คะ (F-2E-05).
5. Rendre les citations Volubilis reproductibles (F-2E-06).
6. Recoupement RID 2554 manuel, porte déjà identifiée par le rédacteur et
   toujours ouverte.
7. Traiter les findings non bloquants 07 à 12 à la consolidation de l'unité.

`Revue native : en attente` reste exact et doit rester affiché.
