# Contre-audit adversarial de la leçon 3A

- Fichier audité : `content/authoring/unite-03/lecon-3a.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5), mandat « trouver des
  erreurs, pas confirmer »
- Méthode : re-vérification autonome de CHAQUE item, sans faire confiance aux
  citations du rédacteur. Contrairement à l'audit 2A, les quatre autorités ont
  cette fois été atteintes pour de vrai :
  - **RID 2554** interrogé directement, 33 requêtes POST sur `func_lookup.php`,
    espacées de 1,3 s, agent utilisateur identifiant le projet, aucune
    définition conservée ni reproduite ci-dessous ;
  - **VOLUBILIS v26.2** téléchargé depuis SourceForge (`belisan`), 10 848 409
    octets, feuille unique `Volubilis`, 114 579 lignes, ligne 1
    « VOLUBILIS Database | Multilingual Thai Database Tha-Eng-Fra |
    v. 26.2 (Jul. 2026) | 114577 entr. », lu avec `openpyxl` en lecture seule,
    filtrage exact sur `THA`, sans normalisation Unicode. Les numéros de ligne
    cités par le rédacteur ont été rouverts un par un ;
  - **Unicode 17.0** : `UnicodeData.txt` et `IndicPositionalCategory.txt`
    (en-tête `IndicPositionalCategory-17.0.0.txt`, daté du 2025-07-29)
    retéléchargés depuis `unicode.org/Public/UCD/latest/ucd/` ;
  - **FrequencyWords** `content/2018/th/th_50k.txt` retéléchargé, 50 000 lignes,
    rangs recalculés ;
  - **Wiktionary** en et th relus en wikitexte brut (`action=raw`) ET en rendu
    (`action=render`), pour lire les tables `{{th-pron}}` réellement affichées.
  - Les séquences Unicode ont été recalculées par script Node indépendant.
- Verdict global : la LANGUE est solide. Sur 168 faits re-vérifiés seul, aucune
  graphie n'est fausse, aucun ton n'est faux, aucun sens n'est faux, aucun
  corrigé d'exercice n'est faux, aucune URL n'est inventée, et les 18 citations
  Volubilis sont exactes au caractère près. Ce qui bloque tient en quatre points :
  un fait faux affiché en page 4, une citation tronquée qui supprime l'exception
  qu'elle porte, une page mono-sourcée, et une affirmation de dossier
  démontrablement fausse qui sert à justifier un choix éditorial contesté.
  **4 findings bloquants, 8 non bloquants. Statut recommandé : reste `draft`.**

## 1. Contrôles mécaniques exécutés

| Contrôle                                                    | Résultat                                |
| ----------------------------------------------------------- | --------------------------------------- |
| Séquences NFC des 8 items recalculées par script            | 8/8 conformes aux `codepoints` déclarés |
| Séquences NFC des reprises ค่ะ et ครับ                      | 2/2 conformes                           |
| Stabilité NFC : 110 chaînes thaïes distinctes du fichier    | 110/110 stables, 0 instable             |
| Tiret cadratin U+2014, demi-cadratin U+2013, U+2015, U+2212 | 0 occurrence                            |
| Apostrophe : U+0027 / U+2019                                | 0 / 198, conforme ADR-0022              |
| Codepoints des dix chiffres U+0E50..U+0E59                  | conformes                               |
| Ordre des sections imposé par `CONVENTIONS.md`              | conforme (pas de Dialogue, assumé)      |
| Champs obligatoires du contrat d'item                       | présents sur les 8 items                |
| URLs citées, existence réelle                               | toutes vivantes, 0 inventée             |

## 2. Faits que j'ai CONFIRMÉS moi-même (168)

Décompte recomputable à partir de ce tableau, exigence que je reproche par
ailleurs au dossier du rédacteur (finding N3).

| Bloc de faits                                                                 | Nombre  |
| ----------------------------------------------------------------------------- | ------- |
| 8 items × 6 dimensions (graphie+NFC, IPA, ton, longueur, sens, transcription) | 48      |
| Lettres ต ถ ท : rang, nom de récitation, classe                               | 9       |
| IPA des trois noms de lettres                                                 | 3       |
| เต่า et ทหาร : sens et IPA                                                    | 4       |
| Signes de voyelle : valeur et opposition de longueur                          | 12      |
| Faits Unicode d'encodage, de catégorie, de position et de valeur              | 8       |
| Valeur des dix chiffres thaïs                                                 | 10      |
| Corrigés d'exercices (6 + 8 + 6 + 10)                                         | 30      |
| Rangs de fréquence `th_50k.txt`                                               | 11      |
| Citations VOLUBILIS rouvertes ligne par ligne                                 | 18      |
| Structure des vedettes RID et absences déclarées                              | 9       |
| Contrôles mécaniques du §1                                                    | 6       |
| **Total**                                                                     | **168** |

### 2.1 Les huit items

| Item | Graphie / NFC | IPA          | Ton        | Longueur  | Sens             | Transcription v1.1 |
| ---- | ------------- | ------------ | ---------- | --------- | ---------------- | ------------------ |
| ตา   | OK            | /taː˧/ OK    | moyen OK   | longue OK | œil OK           | `taa` OK           |
| ทา   | OK            | /tʰaː˧/ OK   | moyen OK   | longue OK | étaler OK        | `thaa` OK          |
| ตัด  | OK            | /tat̚˨˩/ OK   | bas OK     | courte OK | couper OK        | `tàt` OK           |
| ถัด  | OK            | /tʰat̚˨˩/ OK  | bas OK     | courte OK | suivant OK       | `thàt` OK          |
| เตะ  | OK            | /teʔ˨˩/ OK   | bas OK     | courte OK | coup de pied OK  | `tè` OK            |
| แตะ  | OK            | /tɛʔ˨˩/ OK   | bas OK     | courte OK | toucher léger OK | `tàe` OK           |
| ติด  | OK            | /tit̚˨˩/ OK   | bas OK     | courte OK | collé, coincé OK | `tìt` OK           |
| ถุง  | OK            | /tʰuŋ˩˩˦/ OK | montant OK | courte OK | sac OK           | `thǒung` OK        |

Recalcul indépendant des tons par la règle de classe, non par lecture des
sources : ต moyenne + syllabe vivante sans marque = moyen ; ท basse + vivante
sans marque = moyen ; ต moyenne + syllabe morte = bas ; ถ haute + syllabe morte
= bas ; ถ haute + syllabe vivante sans marque = montant. Les huit résultats
concordent avec les lettres tonales relevées sur les deux éditions de Wiktionary
ET avec la colonne `THAIPHON` de VOLUBILIS (`-` moyen, `_` bas, `/` montant),
qui est hors écosystème Wikimedia. Aucun ton n'est faux.

Transcriptions recontrôlées contre l'amendement v1.1 : `ae` et non `è`, `ou`
pour /u/, doublement de la DERNIÈRE lettre du graphème, diacritique de ton sur
la PREMIÈRE lettre du noyau. Les huit sont conformes, y compris les deux cas
pièges `thǒung` (noyau `ou`, ton montant sur le `o`) et `tàe` (noyau `ae`, ton
bas sur le `a`).

### 2.2 Le dossier RID, rouvert requête par requête

J'ai réinterrogé le dictionnaire moi-même. Les faits de structure annoncés par
le rédacteur sont EXACTS : ตา donne bien deux vedettes dont la seconde porte le
sens anatomique et la première le sens familial ; ถัด donne bien deux vedettes
dont la seconde est l'ordre lancé aux bovins de labour ; ท donne bien trois
vedettes ; ทา, ตัด, เตะ, แตะ, ถุง donnent bien une vedette unique ; ติด donne
trois vedettes et l'item cite correctement « ติด ๑ ». Les six absences déclarées
(เลขไทย, ถุงมือ, ถัดไป, ๐, ๑, ๕) sont réelles.

Les faits de fonction sont eux aussi exacts, et je les avais abordés en
soupçonnant une paraphrase complaisante :

- ต : vingt-et-unième consonne, récitée ตอ เต่า, classe moyenne. Confirmé.
- ถ : vingt-deuxième, récitée ถอ ถุง, classe haute. Confirmé.
- ท : vingt-troisième, récitée ทอ ทหาร, classe basse. Confirmé.
- ไม้หันอากาศ : le RID énonce bien que le signe tient lieu du son de la voyelle
  อะ dans le cas où il y a une consonne finale, avec une composition en exemple,
  et donne bien ไม้ผัด et หางกังหัน comme autres noms, dont les deux entrées
  répètent le même énoncé. Confirmé.
- วิสรรชนีย์ : le RID énonce bien que ะ se place derrière la lettre. C'est le
  seul fait de POSITION que j'aie trouvé hors Unicode dans toute la leçon, et le
  rédacteur l'a correctement identifié.
- ตีนเหยียด nomme สระอุ, ตีนคู้ nomme สระอู, พินทุอิ / พินทุ์อิ est bien une
  vedette groupée. Confirmé.
- ตัวเลข : l'entrée illustre bien le mot par un exemple en chiffres thaïs, un
  en chiffres arabes et un en chiffres romains. Confirmé.

Aucune définition du RID n'est reproduite ici, conformément à la politique.

### 2.3 VOLUBILIS : les 18 citations sont exactes

C'est le point que je soupçonnais le plus, parce qu'un numéro de ligne dans un
tableur non joint au dépôt est invérifiable pour un relecteur. J'ai téléchargé
la base et rouvert chaque ligne. Résultat : **18 citations sur 18 exactes**,
colonne par colonne, y compris les glosses françaises reproduites au
point-virgule près et les étiquettes `TYPE` et `DOM`.

Lignes contrôlées : 95738 et 95739 (ตา, dont l'homographie), 95814 et 95815
(แตะ, dont le sens de chaussure), 97461 (เต่า), 97754 (ตัด), 97958 (เตะ),
98187 (ทา), 98456 à 98458 (ทหาร), 100999, 101000 et 101001 (ถัด, dont les deux
emplois verbaux écartés), 101816 à 101818 (ที), 104171 et 104172 (ถุง, dont le
classificateur), 104435 (ตี), 104693 et 104694 (ติด).

Le fait annoncé au dossier « VOLUBILIS relève six lignes pour la graphie ตา »
est vrai : 95738 à 95743. La colonne `THAIPHON` encode bien séparément le ton et
la longueur, et les huit relevés concordent sans exception avec les deux
éditions de Wiktionary. **La levée de l'incertitude 2 du dossier 2A est
légitime** : cette leçon n'est plus mono-écosystème.

### 2.4 Unicode : les citations sont exactes au caractère près

- `0E30 ; Right # Lo THAI CHARACTER SARA A` : chaîne présente telle quelle.
- `0E31 ; Top # Mn`, `0E34..0E37 ; Top # Mn`, `0E38..0E3A ; Bottom # Mn` :
  présentes, plages exactes.
- `0E30;THAI CHARACTER SARA A;Lo` opposé à `0E31;...;Mn` : exact, et
  l'argument tiré de `Mn` contre `Lo` est correct.
- `0E32 SARA AA`, `0E34 SARA I` contre `0E35 SARA II`, `0E38 SARA U` contre
  `0E39 SARA UU` : les oppositions de longueur sont bien inscrites dans les noms
  normatifs.
- `0E50;THAI DIGIT ZERO;Nd;0;L;;0;0;0` et `0E59;THAI DIGIT NINE;Nd;0;L;;9;9;9` :
  exacts, y compris les trois champs numériques.
- En-tête `IndicPositionalCategory-17.0.0.txt`, `Date: 2025-07-29` : exact.
- L'aveu du dossier selon lequel les deux fichiers « comptent pour UNE autorité
  indépendante, pas deux » est juste et honnête.

### 2.5 Fréquences : les onze rangs sont exacts

Recalculés sur `th_50k.txt` : ตา 2756, ทา 11989, ตัด 4000, เตะ 9299, แตะ 20814,
ติด 13507, ถุง 13554, ถัดไป 14671, ตี 3563, ที 1619, et ถัด réellement ABSENT
des 50 000 premiers tokens. Aucun rang n'est arrondi ni embelli, y compris le
rang 4000 qui avait l'air trop rond pour être vrai.

### 2.6 Corrigés d'exercices : 30 sur 30 corrects

- Exercice 1 : les 6 corrigés sont justes, la répartition est équilibrée
  (3 cibles soufflées, 3 non soufflées), aucune cible n'est répétée deux fois
  de suite, chaque paire est tirée trois fois. Le postulat « le ton est le même
  dans les deux options » est vrai pour les deux paires (moyen/moyen et
  bas/bas), donc l'exercice mesure bien l'aspiration et rien d'autre.
- Exercice 2 : les 5 corrigés et les 3 variantes tolérées sont conformes v1.1.
- Exercice 3 : les 6 corrigés sont justes, y compris เพลง (noyau เ- long) et ปี.
- Exercice 4 : les 10 appariements chiffre/valeur sont justes.

### 2.7 Citations Wiktionary : aucune n'est inventée, presque aucune n'est déformée

Les 46 pages citées existent toutes. Les tables `{{th-pron}}` rendues donnent
exactement les IPA et les romanisations Paiboon citées (`dtaa`, `taa`, `dtàt`,
`tàt`, `dtè`, `dtɛ̀`, `dtìt`, `tǔng`), y compris le piège apparent de
`ถัด → tàt` qui semble contredire l'aspiration mais reflète la convention
Paiboon. « Appendix:Thai script » contient bien les lignes 21, 22 et 23 avec les
gloses `to tao (turtle)`, `tho thung (sack)` et `tho thahan (soldier)`, et son
tableau des voyelles oppose bien ligne à ligne ◌ิ /i/ et ◌ี /iː/, ◌ุ /u/ et
◌ู /uː/, เ◌ะ /eʔ/ et เ◌ /eː/, แ◌ะ /ɛʔ/ et แ◌ /ɛː/. Les dix entrées de chiffres
portent bien l'en-tête `Number`, le type `numeral symbol` et les gloses `0 (zero)`
à `9 (nine)`. La seule citation déformée est celle de la note d'usage de ั,
finding B2.

Le rédacteur signale honnêtement que la source utilise un trait comme
emplacement de consonne et qu'il le rend par ◌ : c'est vrai, la source emploie
`&ndash;`, que la règle typographique du projet interdit. Bonne prise.

## 3. Findings BLOQUANTS (4)

### B1. Page 4 affirme une symétrie qui n'existe pas, et la carte SRS 04 en hérite

Page 4 : « En 2A, vous avez appris six signes de voyelles longues. **Chacun a un
jumeau bref, et c'est ce jumeau qui arrive aujourd'hui.** »

C'est faux. La Méta déclare elle-même que 2A a enseigné six longues, า, ี, ู,
**อ**, เ- et แ-, et le fichier `lecon-2a.md` le confirme. Or le bloc affiché
page 4 ne comporte que CINQ lignes : อ n'y figure pas, et son jumeau bref
เ-าะ /ɔʔ/ n'est ni affiché, ni enseigné, ni mentionné nulle part dans la leçon.
Un des six signes longs annoncés n'a donc pas de jumeau bref aujourd'hui.

Le décompte est faux dans l'autre sens aussi. La Méta annonce « les six voyelles
brèves écrites ะ, ั, ิ, ุ, เ-ะ et แ-ะ, face à leurs longues correspondantes ».
Mais ะ et ั ne sont pas deux voyelles : la page 5 enseigne explicitement le
contraire, « Il note toujours le même a bref ». Six signes brefs font donc face
à CINQ signes longs.

Conséquence opérationnelle, et c'est ce qui rend le finding bloquant plutôt que
rédactionnel : la carte `srs-u03-l3a-04` fixe comme critère de maîtrise « les six
paires appariées sans erreur sur deux sessions espacées ». Il n'existe pas six
paires. Le critère est inimplémentable tel quel, et un exercice d'appariement
généré à partir de cette carte ne pourra pas se fermer.

Correction attendue : soit ajouter เ-าะ face à อ et renoncer à compter ะ et ั
comme deux voyelles, soit reformuler en « cinq oppositions de longueur, dont
l'une a deux graphies pour la brève », et corriger la carte SRS en conséquence.

### B2. Citation tronquée exactement à l'endroit de l'exception : la note d'usage de ั

Le dossier présente le fait central du bloc d'écriture, « ั note le même a bref
et remplace ะ lorsqu'une consonne finale suit », avec deux autorités. La seconde
est ainsi citée :

> en.wiktionary, https://en.wiktionary.org/wiki/ั ... note d'usage : « When it
> is solely used with a consonant, it produces /a/, and it is always followed by
> a final consonant »

Texte réel de la note d'usage, relu en wikitexte brut le 2026-08-03 :

> When it is solely used with a consonant, it produces /a/, and it is always
> followed by a final consonant. **Except, ◌ัว becomes /ua̯/ instead.**

La phrase suivante, dans la MÊME note d'usage, est la restriction. Elle est
supprimée. Même schéma sur l'autre édition : th.wiktionary/ั porte deux
`หมายเหตุการใช้`, « ใช้แทนสระ อะ เมื่อมีตัวสะกด » ET
« สามารถใช้ร่วมกับ ว เป็นสระ อัว อัวะ ». Le dossier ne cite que la première.

Ce n'est pas anodin, parce que la page 5 affirme deux fois l'absolu :
« Il note **toujours** le même a bref, et il annonce **toujours** qu'une consonne
finale suit. » Les deux « toujours » sont faux pour ◌ัว. Le rédacteur le sait, il
l'écrit à l'incertitude 6 et demande explicitement « que la compilation ne
présente pas la règle du ไม้หันอากาศ comme sans exception ». La page
d'enseignement fait exactement l'inverse, et la citation a été coupée là où elle
aurait empêché de l'écrire.

Le RID, lui, est cité correctement : son entrée ไม้หันอากาศ ne porte pas
d'exception. Le problème est entier sur la jambe Wiktionary.

Correction attendue : rétablir la phrase « Except, ◌ัว becomes /ua̯/ instead » et
la note th correspondante dans la citation, et retirer au moins l'un des deux
« toujours » de la page 5.

### B3. Page 7 : trois affirmations à l'écran, une seule autorité chacune

Page 7 affirme : « Le thaï possède ses propres chiffres, **en plus des chiffres
arabes que vous connaissez**. Ils fonctionnent exactement comme les nôtres : dix
signes, mêmes valeurs, **même lecture de gauche à droite, même système de
position**. »

Les dix valeurs sont correctement double-sourcées, Unicode et Wiktionary. Les
trois autres affirmations ne le sont pas.

- Coexistence avec les chiffres arabes : le dossier ne produit que l'entrée RID
  « ตัวเลข », puis « Corroboration observée directement lors des consultations
  RID ... le dictionnaire numérote ses vedettes homographes avec ces chiffres ».
  Les deux jambes sont le MÊME ouvrage. C'est un fait mono-sourcé, ce que le
  contrat d'item, la politique de sources et la méthode déclarée en tête du
  dossier de production interdisent tous les trois.
- Lecture de gauche à droite : adossée au seul champ `bidi` de `UnicodeData.txt`.
  Les entrées Wiktionary des chiffres ne disent rien du sens de lecture.
- Système de position : adossé à la seule catégorie `Nd`. Wiktionary ne
  documente que la valeur.

Le dossier a par ailleurs le mérite de fermer explicitement la porte à la
question de l'usage réel (incertitude 5), ce qui est la bonne décision. Il faut
la même rigueur un cran plus haut : soit une deuxième autorité, soit une page 7
qui se limite aux dix valeurs.

### B4. « La seule paire minimale propre entre ต et ถ » est faux, et cette

affirmation porte une décision éditoriale

Item 4, `note_fr` : « Il est retenu ici parce qu'il fournit **la seule paire
minimale propre entre ต et ถ que la vérification ait pu établir**. » Incertitude
4 : « toutes les paires alternatives essayées échouent, soit parce que le
partenaire n'est pas un mot attesté, soit parce que les classes consonantiques
imposent deux tons différents et détruisent la paire. »

J'ai testé. Les deux motifs d'échec allégués ne s'appliquent pas à au moins trois
paires, toutes vérifiées le 2026-08-03 au RID (autorité n° 1) et sur
en.wiktionary :

| Paire     | IPA relevés               | Ton       | Statut RID                          |
| --------- | ------------------------- | --------- | ----------------------------------- |
| ตัก / ถัก | /tak̚˨˩/ contre /tʰak̚˨˩/   | bas / bas | ตัก ๑ et ตัก ๒ ; ถัก vedette unique |
| ตก / ถก   | /tok̚˨˩/ contre /tʰok̚˨˩/   | bas / bas | ตก ๑ et ตก ๒ ; ถก vedette unique    |
| ตอด / ถอด | /tɔːt̚˨˩/ contre /tʰɔːt̚˨˩/ | bas / bas | ตอด ๑ à ๓ ; ถอด vedette unique      |

Les six mots sont des vedettes autonomes du dictionnaire normatif. Les tons sont
identiques dans chaque paire, parce qu'une consonne moyenne et une consonne haute
donnent toutes deux un ton bas en syllabe morte : le mécanisme invoqué pour
écarter les alternatives ne joue justement pas ici. ตัก / ถัก a en outre
exactement la même structure d'écriture que ตัด / ถัด, ั plus consonne finale, et
servirait donc identiquement le bloc ไม้หันอากาศ.

Pourquoi c'est bloquant et pas cosmétique : ถัด est le seul item de la leçon
absent des 50 000 premiers tokens de `th_50k.txt`, il est de l'aveu du rédacteur
« rare employé seul », et l'incertitude 4 dit à l'audit pédagogie que refuser ถัด
ferait « perdre la paire ถ » à la leçon. C'est faux, et un audit qui lirait cette
phrase arbitrerait sur une information fausse. Un dossier de preuve qui contient
une affirmation démontrablement fausse ne peut pas ouvrir la porte
`draft → review`, indépendamment de la décision finale sur ถัด.

Correction attendue : réécrire l'incertitude 4 avec le vrai périmètre des
alternatives, puis trancher explicitement ถัด contre ตัก, ตก ou ตอด sur un
critère assumé (fréquence, utilité, charge d'apprentissage), pas sur une
prétendue unicité.

## 4. Findings NON BLOQUANTS (8)

### N1. « ถัดไป figure comme sous-entrée » du RID : faux

Dossier, bloc RID : « les compositions ถุงมือ et ถัดไป y figurent comme
sous-entrées et non comme vedettes ».

Vérification : l'entrée ถุง porte bien un bloc `ลูกคำ` et mentionne ถุงมือ. Mais
l'entrée ถัด **ne porte aucun bloc `ลูกคำ`**. ถัดไป n'y apparaît qu'à l'intérieur
d'un exemple d'usage. Le RID n'atteste donc pas ถัดไป comme unité lexicale, il
l'emploie. Cela affaiblit le seul contrefort de naturalité de l'item 4 et doit
être corrigé en même temps que B4.

### N2. Item 8 : « ถ se récite ถ ถุง », alors que le RID donne « ถอ ถุง »

L'item 8 écrit « ถ se récite ถ ถุง ». La note culturelle du MÊME fichier écrit
« ถ se récite ถอ ถุง », et c'est la forme que donne le RID. « ถ ถุง » est la
graphie de tableau, « ถอ ถุง » est la récitation. Le verbe « se récite » impose
la seconde. Incohérence interne sur un fait par ailleurs correctement
double-sourcé.

### N3. Les trois décomptes du dossier de preuve ne sont pas recomputables

C'est le finding N3 de l'audit 2A, qui n'a pas été absorbé.

- « 36 requêtes exécutées sur 36 mots distincts » : la liste qui suit énumère 20
  mots retenus, 12 exploratoires et 6 absents, soit 38, ou 37 si l'on considère
  que พินทุอิ et พินทุ์อิ n'ont demandé qu'une requête. Jamais 36.
- « 16 graphies cherchées, 16 trouvées, 39 lignes relevées » chez VOLUBILIS :
  seules 12 graphies sont citées avec un numéro de ligne dans tout le fichier, et
  ces 12 graphies totalisent 43 lignes dans la base, pas 39.
- « contrôlées par script Node ... sur 42 chaînes » : l'énumération qui suit
  additionne 8 items, 3 lettres, 10 signes de voyelle, 10 chiffres, 5 reprises,
  5 mots supplémentaires et 2 suites de chiffres, soit 43.

Aucun de ces écarts ne touche la langue. Tous touchent la crédibilité du dossier,
qui est précisément ce qui remplace la revue native à ce stade.

### N4. Page 8 décrit le réflexe de lecture avec la règle de la transcription

Page 8 : « Deux réflexes aujourd'hui. À l'oreille : la feuille bouge ou ne bouge
pas. **À l'œil : la voyelle est simple et courte, ou doublée et longue.** »

Rien n'est « doublé » dans l'écriture thaïe. ตา n'est pas une graphie doublée de
ตัด. Le doublement est la règle de la transcription Thaïnaute v1.1, pas un fait
d'écriture. Or l'exercice 3, qui met ce réflexe en pratique, affiche
explicitement « le mot en grand spécimen thaï ... sans transcription ni audio ».
La page de synthèse enseigne donc à chercher, dans le thaï, un indice qui n'y est
pas. Reformuler du type « la voyelle porte un ะ, un chapeau ou un petit signe
bref, ou bien c'est un des signes longs de 2A ».

### N5. `tè` contre `tàe` : conformes v1.1, trompeurs sur la page qui dit

« le ton est le même »

Page 6 : « เตะ (tè) ... แตะ (tàe) ... la consonne est la même, **le ton est le
même**, la brièveté est la même. Seul le signe placé à gauche change. »

Les deux transcriptions respectent l'amendement v1.1, je l'ai recontrôlé. Mais
pour un œil français elles disent le contraire de la page :

- `è` est, en français, exactement le son de แตะ. Un lecteur francophone lit
  donc `tè` comme แตะ et `tàe` comme autre chose.
- l'accent grave ne se pose pas sur la même lettre dans les deux formes, ce qui
  suggère visuellement une différence de ton, alors que la phrase juste au-dessus
  affirme que le ton ne change pas.

L'incertitude 12 ouvre la question de lisibilité pour `thǒung` seulement. Le cas
`tè` / `tàe` est plus dommageable, parce qu'il tombe sur la page dont c'est le
sujet. À verser à l'audit lisibilité avec `thǒung`.

### N6. Les affirmations sur le DESSIN des chiffres ne sont pas sourcées et

dépendent de la fonte

Page 7 : « ๓ et ๗ se ressemblent beaucoup, et ๕ et ๖ se distinguent par la boucle
du haut. » Exercice 4, pièges : « confondre ๓ et ๗, dont la partie basse se
ressemble ; confondre ๕ et ๖, qui se distinguent par la boucle du haut ; lire ๐
comme la lettre อ ».

Ce sont des affirmations affichées, au présent de vérité générale, sans aucune
source, et ce sont des faits de rendu, pas de langue. Le dossier double-source
scrupuleusement la valeur de chaque chiffre puis laisse passer quatre
affirmations sur leur forme. Le discriminant annoncé pour ๕ contre ๖ est de
surcroît douteux : dans les fontes thaïes à boucles, les deux signes portent une
boucle en haut, la différence utile est en bas ; dans une fonte display sans
boucle, que la direction artistique peut retenir, la boucle disparaît des deux.
Aucune de ces quatre phrases ne peut être maintenue sans une preuve de rendu dans
la fonte réellement expédiée. À traiter avec l'audit accessibilité, déjà EN
ATTENTE.

### N7. Exercice 3 : le feedback d'erreur ne couvre pas le tirage 3

Feedback incorrect : « Cherchez le signe de voyelle avant de décider. S'il porte
un ะ à la fin, ou un chapeau ั au-dessus, la voyelle est brève. »

Le tirage 3 est ติด, dont la brièveté est notée par ิ, ni ะ ni ั. Un apprenant
qui se trompe sur ติด reçoit un indice qui ne s'applique pas à son mot, alors que
le feedback de réussite, lui, cite correctement « le chapeau ั et le petit ิ ».
Un tiers des items brefs de l'exercice est hors indice.

### N8. Le contrat d'item exige une URL par entrée ; RID et VOLUBILIS n'en ont pas

`CONVENTIONS.md` impose « au moins DEUX sources indépendantes ... chacune avec
URL exacte de l'entrée consultée et date de consultation ». Les citations RID
pointent vers `func_lookup.php`, qui est le point d'entrée POST et non l'entrée,
et les citations VOLUBILIS ne portent qu'un numéro de ligne dans un classeur
absent du dépôt. La contrainte est objectivement impossible à satisfaire telle
quelle pour ces deux sources, et le rédacteur compense honnêtement par des
paramètres de requête reproductibles et des numéros de ligne stables, méthode qui
m'a effectivement permis de tout rouvrir. Le contrat doit être amendé pour
reconnaître « URL exacte OU méthode d'accès reproductible », faute de quoi les
huit items sont formellement non conformes alors qu'ils sont matériellement
mieux sourcés que ceux de l'unité 2.

## 5. Points contrôlés qui se sont révélés CORRECTS malgré un fort soupçon

Consignés pour éviter qu'un audit ultérieur ne les rouvre.

- Les 18 numéros de ligne VOLUBILIS. Je les tenais pour invérifiables et donc
  potentiellement décoratifs. Ils sont exacts, colonne par colonne.
- Le rang de fréquence 4000 pour ตัด, qui avait l'air arrondi. Il est exact.
- L'absence de ถัด des 50 000 premiers tokens, que je soupçonnais d'être une
  excuse. Elle est réelle, et ถัดไป est bien au rang 14671.
- Les gloses Paiboon `tàt` pour ถัด et `taa` pour ทา, qui semblent contredire
  l'aspiration. Elles sont exactes et reflètent la convention Paiboon.
- L'existence des sections lawa orientale et nyah kur sur la page เตะ, détail
  trop précis pour être inventé : il est exact.
- L'incertitude 2 (positions verticales de ั, ิ et ุ attestées par Unicode seul).
  J'ai relu les six pages concernées, plus les entrées RID ตีนเหยียด, ตีนคู้,
  พินทุอิ et ไม้หันอากาศ : aucune ne situe ces trois signes. Le rédacteur ne
  sous-estime pas le problème, contrairement à ce qui s'était passé en 2A.
  Je note en revanche qu'il a trouvé, et correctement exploité, la seule position
  réellement sourcée hors Unicode de toute la leçon, celle de ะ par วิสรรชนีย์.
- L'incertitude 3 (coup de glotte non enseigné) est correcte : les champs `ipa`
  des items 5 et 6 reproduisent la notation Wiktionary, et aucune page, aucun
  feedback et aucune transcription ne l'exploitent.
- La contrainte de production audio « les six tirages de l'exercice 1 doivent
  être générés par la MÊME voix » est reconduite depuis 2A et reste pertinente.
- L'avertissement d'homographie de ตา : le RID donne bien deux vedettes et
  VOLUBILIS bien six lignes.
- Le refus d'employer `word_order` en 3A, motivé par l'absence de syntaxe
  enseignée, est cohérent avec le contenu réel de la leçon.

## 6. Ce que cet audit n'a PAS pu couvrir

- La primauté MANUELLE du RID en orthographe. Mon relevé est automatisé comme
  celui du rédacteur : il atteste la présence des graphies et la concordance des
  sens, il ne remplace pas la contre-vérification humaine exigée avant `review`.
- La naturalité réelle du thaï produit. `th_50k.txt` est un signal de sous-titres,
  pas un jugement de locuteur. Le cas ถัด est arbitrable sur des données, pas
  tranchable sans oreille native.
- L'audio : aucune piste n'existe. Les exercices 1 et 2 et les pages 1, 3, 6 et 8
  ne sont pas testables.
- Le rendu des marques combinatoires ั, ิ et ุ et la lisibilité des chiffres
  thaïs aux trois largeurs de référence, qui conditionnent le finding N6.
- La deuxième autorité pour les positions verticales (incertitude 2), qui
  suppose une grammaire de référence sur exemplaire ou un article JSEALS ou
  MANUSYA.
- Les deux phrases de pratique sociale de la note culturelle (incertitude 7).
  Elles restent non sourcées, le rédacteur le dit lui-même et je le confirme :
  aucune source de la politique ne les couvre.
- La revue par un locuteur natif, toujours EN ATTENTE, à laquelle cet audit ne
  se substitue en rien.

## 7. Conclusion

C'est le meilleur dossier des trois unités à ce jour. La chaîne à quatre
autorités fonctionne réellement : le RID est interrogé, VOLUBILIS est ouvert,
Unicode est cité au caractère près, la fréquence est mesurée, et les 18 citations
de la base française sont exactes. Sur 168 faits que j'ai re-vérifiés seul, aucune
graphie n'est fausse, aucun ton n'est faux, aucun sens n'est faux, aucun des 30
corrigés d'exercices n'est faux, aucune URL n'est inventée.

Ce qui bloque est de quatre natures différentes, et aucune n'est de la
paresse : une symétrie pédagogique séduisante mais fausse qui contamine une carte
SRS (B1) ; une citation coupée exactement à l'endroit où la source relativise ce
qu'on lui fait dire (B2) ; une page entière dont trois affirmations tiennent sur
une seule autorité (B3) ; et une justification éditoriale démontrablement fausse
qui, si elle n'est pas corrigée, fera arbitrer l'audit pédagogie sur une
information erronée (B4).

Aucune décision fondateur n'est requise pour lever B1, B2, B3 et B4 : ce sont
des corrections rédactionnelles et une consultation complémentaire pour la
coexistence des chiffres. Tant qu'elles ne sont pas faites, la leçon 3A ne peut
pas passer `draft → review`.
