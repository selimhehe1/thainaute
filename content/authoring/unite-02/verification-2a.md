# Contre-audit adversarial de la leçon 2A

- Fichier audité : `content/authoring/unite-02/lecon-2a.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5), mandat « trouver
  des erreurs, pas confirmer »
- Méthode : re-vérification autonome de CHAQUE item par consultation directe
  des pages, sans faire confiance aux citations du rédacteur. Les tables de
  prononciation et les définitions ont été relues en wikitexte brut
  (`action=raw`) ou en rendu (`action=render`) pour éviter les artefacts de
  résumé automatique. Les séquences Unicode ont été recalculées par script Node
  indépendant, pas relues à l'œil.
- Verdict global : la leçon est linguistiquement SOLIDE (aucune graphie fausse,
  aucun ton faux, aucun sens faux, aucun corrigé d'exercice faux, aucune URL
  inventée) mais son DOSSIER DE PREUVE est insuffisant. 6 findings bloquants,
  tous de nature « sourcing », dont deux citations que la source ne contient
  pas. Statut recommandé : reste `draft`.

## 1. Contrôles mécaniques exécutés

| Contrôle                                         | Résultat                                |
| ------------------------------------------------ | --------------------------------------- |
| Séquences NFC des 8 items recalculées par script | 8/8 conformes aux `codepoints` déclarés |
| Stabilité NFC du fichier entier                  | conforme                                |
| Tiret cadratin U+2014 / demi-cadratin U+2013     | 0 occurrence                            |
| URLs distinctes présentes dans le fichier        | 36 (35 Wiktionary + 1 orst.go.th)       |
| URLs Wiktionary citées et réellement existantes  | 35/35, aucune inventée                  |
| Ordre des sections imposé par `CONVENTIONS.md`   | conforme                                |
| Champs obligatoires du contrat d'item            | présents sur les 8 items                |

## 2. Faits que j'ai CONFIRMÉS moi-même (73)

### 2.1 Les huit items (48 faits : graphie+codepoints, IPA, ton, longueur, sens, transcription)

| Item | Graphie / NFC | IPA          | Ton           | Longueur  | Sens       | Transcription v1.1 |
| ---- | ------------- | ------------ | ------------- | --------- | ---------- | ------------------ |
| ปา   | OK            | /paː˧/ OK    | moyen OK      | longue OK | lancer OK  | `paa` OK           |
| พา   | OK            | /pʰaː˧/ OK   | moyen OK      | longue OK | emmener OK | `phaa` OK          |
| ป่า  | OK            | /paː˨˩/ OK   | bas OK        | longue OK | forêt OK   | `pàa` OK           |
| ผ่า  | OK            | /pʰaː˨˩/ OK  | bas OK        | longue OK | fendre OK  | `phàa` OK          |
| พูด  | OK            | /pʰuːt̚˥˩/ OK | descendant OK | longue OK | parler OK  | `phôuut` OK        |
| พอ   | OK            | /pʰɔː˧/ OK   | moyen OK      | longue OK | assez OK   | `phaww` OK         |
| แพง  | OK            | /pʰɛːŋ˧/ OK  | moyen OK      | longue OK | cher OK    | `phaeeng` OK       |
| เพลง | OK            | /pʰleːŋ˧/ OK | moyen OK      | longue OK | chanson OK | `phleeng` OK       |

Recalcul indépendant des tons par la règle de classe consonantique, non par la
lecture des sources : ป classe moyenne + syllabe vivante sans marque = moyen ;
พ classe basse + syllabe vivante sans marque = moyen ; ป มัธยม + ไม้เอก = bas ;
ผ classe haute + ไม้เอก = bas ; พ classe basse + syllabe morte à voyelle longue
= descendant. Les cinq résultats concordent avec les lettres tonales IPA
relevées. Aucun ton n'est faux.

Transcriptions recontrôlées ligne à ligne contre l'amendement v1.1 (`ae` et non
`è`, `aww` et non `aw`, `ouu` et non `oû`, doublement de la DERNIÈRE lettre du
graphème, diacritique de ton sur la PREMIÈRE lettre du noyau) : les 8
transcriptions sont conformes, y compris les cas pièges `phôuut` (nucleus
`ouu`, ton descendant sur le `o`) et `phaeeng` (nucleus `aee`).

### 2.2 Lettres et noms de lettres (6 faits)

49. ป = อักษรกลาง, initiale /p/ non aspirée (double source en + th).
50. ผ = อักษรสูง, initiale /pʰ/ (double source en + th).
51. พ = อักษรต่ำ, initiale /pʰ/ (double source en + th).
52. Nom ป ปลา, /pɔː˧.plaː˧/, donc `paww` correct.
53. Nom ผ ผึ้ง, /pʰɔː˩˩˦.pʰɯŋ˥˩/, donc `phǎww phûeng` correct (ton montant sur
    la lettre, ton descendant sur ผึ้ง ; th.wiktionary respelle `ผอ-พึ่ง`, ce
    qui confirme indépendamment le ton descendant).
54. Nom พ พาน, /pʰɔː˧.pʰaːn˧/, donc `phaww phaan` correct.

### 2.3 Signes de voyelle (6 faits)

55. แ = U+0E41, THAI CHARACTER SARA AE, valeur /ɛː/ longue seule avec consonne.
56. เ = U+0E40, THAI CHARACTER SARA E, valeur /eː/ longue seule avec consonne,
    nom traditionnel ไม้หน้า (confirmé sur les deux éditions).
57. อ = U+0E2D, classe moyenne, double rôle voyelle /ɔː/ et initiale muette.
58. า = nom ลากข้าง, valeur /aː/ (en.wiktionary, page existante).
59. ี = « พินทุ์อิกับฝนทอง, พินทุ์อี ก็เรียก; สระที่ออกเสียง อี » (th.wiktionary).
60. ู = « ตีนคู้; สระที่ออกเสียง อู » (th.wiktionary).

### 2.4 Mots cités hors items (4 faits)

61. ผึ้ง = abeille, /pʰɯŋ˥˩/, classificateur ตัว, famille Apidae, butineuse
    productrice de miel (double source en + th).
62. พาน = récipient à pied, formes proches de l'assiette ou de la coupe, servant
    à présenter fleurs, encens et bougies (double source en + th ; la définition
    thaïe citée par le rédacteur est reproduite fidèlement).
63. ผ่าตัด = opérer chirurgicalement, /pʰaː˨˩.tat̚˨˩/, transcription `phàa·tàt`
    conforme (double source en + th).
64. ปี = année, /piː˧/, transcription `pii` conforme (double source en + th).

### 2.5 Faits de conception (9 faits)

65. ปา / พา est une paire minimale exacte : /paː˧/ contre /pʰaː˧/, même ton,
    même longueur, seul l'aspiration diffère. L'affirmation de la page 4 tient.
66. ป่า / ผ่า est une paire minimale exacte : /paː˨˩/ contre /pʰaː˨˩/.
67. Exercice 1 (`listening`) : les 6 corrigés sont corrects, la répartition est
    équilibrée (3 cibles aspirées, 3 non aspirées), aucune cible n'est répétée
    deux fois de suite, chaque paire est bien tirée 3 fois. Le postulat
    « le ton est constant à l'intérieur de chaque option » est vrai, donc
    l'exercice mesure bien l'aspiration et rien d'autre.
68. Exercice 2 (`recall`) : les 5 corrigés et les 2 variantes tolérées sont
    corrects et conformes à v1.1.
69. Exercice 3 (`reading`) : les 5 corrigés sont corrects. Pour เพลง la réponse
    พ est exacte puisque le premier son émis est /pʰ/.
70. Exercice 4 (`association`) : les 6 appariements sont corrects.
71. แพง : antonyme ถูก et traduction française « cher » effectivement présents
    sur th.wiktionary (`* ฝรั่งเศส: {{t+|fr|cher}}, {{t+|fr|chère}}`). La
    citation du rédacteur, que je soupçonnais d'être inventée, est exacte.
72. Aucune des 35 URLs Wiktionary citées n'est morte ou inventée.
73. Registres annoncés `neutre` : vérifiés sur les 8 items. Les sens marqués
    (ภาษาปาก pour ผ่า et ปา, argot « élégant » pour แพง, sens isan de แพง, sens
    du sud de ผ่า) existent bien mais ne sont PAS ceux enseignés ; la leçon
    n'enseigne que le sens neutre, ce qui est correct.

## 3. Findings BLOQUANTS (6)

### B1. Écosystème de sources unique (Wikimedia) sur la totalité de la leçon

Chaque fait de la leçon est adossé à en.wiktionary + th.wiktionary et à rien
d'autre. `docs/content-policy/sources-verification.md` §3 statue :
« Wiktionary ... AUTORISÉE pour recoupement ; ... jamais en source unique »,
et la politique de vérification impose « deux sources indépendantes minimum par
fait, RID prioritaire en cas de conflit orthographique ». Deux éditions
linguistiques du même projet ne constituent pas deux sources indépendantes : le
contenu thaï de en.wiktionary et de th.wiktionary partage largement les mêmes
contributeurs, les mêmes modules de prononciation et, pour ปา et พอ, la même
source primaire déclarée (le dictionnaire ราชบัณฑิตยสถาน, cité en `อ้างอิง` sur
th.wiktionary/พอ). Ni le RID 2554, ni Volubilis, ni le TNC, ni FrequencyWords
n'ont été atteints. Le rédacteur le signale honnêtement (incertitude 1), ce qui
ne lève pas le blocage. Aucun passage en `review` possible en l'état.

### B2. Citation que la source ne contient pas : « เสียงสามัญ » attribué à th.wiktionary/พา

Item 2, champ `sources` : « th.wiktionary, entrée « พา » ... (IPA /pʰaː˧/,
เสียงสามัญ, définition ... ) ».

Vérification : la page rendue de `th.wiktionary.org/wiki/พา` ne contient nulle
part la chaîne `เสียงสามัญ`. La table `การออกเสียง` de th.wiktionary n'affiche
AUCUN nom de ton en langage naturel. Ses seules lignes sont : `การแบ่งพยางค์`
(พา), `ไพบูลย์พับบลิชชิง` (paa), `ราชบัณฑิตยสภา` (pha), `สัทอักษรสากล`
(/pʰaː˧/) et `คำพ้องเสียง` (ภา). Contrôle croisé sur th.wiktionary/ปา :
strictement la même structure, aucun nom de ton (ni เสียงสามัญ, ni เสียงเอก,
ni เสียงโท, ni เสียงตรี, ni เสียงจัตวา).

Le ton lui-même (moyen) est correct et se déduit de ˧. Mais l'étiquette
`เสียงสามัญ` a été portée au dossier de preuve comme une observation de la
source alors qu'elle n'y figure pas. C'est très probablement un artefact de
l'outillage de résumé, exactement le phénomène que l'auteur décrit à
l'incertitude 2 pour ป่า, ผ่า et พูด : le mécanisme a été identifié, puis la
contamination a quand même été consignée sur พา. Une preuve fabriquée dans un
dossier de preuve invalide le dossier, indépendamment de l'exactitude du fait.

Correction attendue : supprimer `เสียงสามัญ` de la citation, ou le remplacer
par la mention explicite « ton déduit de la lettre tonale ˧, non étiqueté par la
source ».

### B3. Citation que la source ne contient pas : position de ี attribuée à th.wiktionary

Incertitude 9 du dossier : « en.wiktionary décrit ี comme un diacritique sans
indiquer explicitement l'étage ; th.wiktionary le place au-dessus de la
consonne. »

Vérification en wikitexte brut de `th.wiktionary.org/wiki/ี` : l'entrée entière
tient en « พินทุ์อิกับฝนทอง, พินทุ์อี ก็เรียก; สระที่ออกเสียง อี », suivie de
deux notes d'usage sur เ◌ีย / เ◌ียะ et de la correspondance braille. Il n'y a
AUCUNE mention de position, ni « au-dessus », ni « ข้างบน », ni « บน ». La
source ne dit pas ce qu'on lui fait dire, et l'incertitude 9 sous-estime le
problème en présentant la situation comme « une source explicite et une source
implicite » alors qu'aucune des deux n'est explicite.

### B4. Le fait porteur de la leçon (position des signes de voyelle) est à zéro source explicite

La page 5, la page 6, l'exercice 3 dans sa totalité et la carte `srs-u02-l2a-04`
reposent sur un seul fait : า se pose à droite, ี au-dessus, ู en dessous, อ à
droite, et เ- / แ- s'écrivent devant la consonne mais se prononcent après elle.
C'est le « bloc d'écriture » annoncé en Méta et l'un des trois objectifs
observables.

Vérification page par page :

- `en.wiktionary.org/wiki/แ` : « A Thai vowel letter composed of two เ ... When
  it is solely used with a consonant, it produces /ɛː/. » Aucune phrase de
  position. La notation `แ◌ะ` / `แ◌็` la montre, elle ne l'énonce pas.
- `th.wiktionary.org/wiki/แ` : « ไม้หน้าสองรูป, สระที่ออกเสียง แอ ». Aucune
  position.
- `en.wiktionary.org/wiki/เ` : « A Thai vowel letter traditionally named
  ไม้หน้า ... produces /eː/ », puis une liste de combinaisons. Aucune position.
- `th.wiktionary.org/wiki/เ` : « ไม้หน้า, สระที่ออกเสียง เอ ». Aucune position.
- า, ี et ู : AUCUNE URL n'est consignée dans le fichier, ni dans un item, ni
  dans la note culturelle, ni dans le dossier. La position enseignée pour ces
  trois signes n'a donc aucune source citée, alors que le contrat d'item exige
  « au moins DEUX sources indépendantes ... chacune avec URL exacte ».

Le fait est VRAI, je l'ai vérifié par ailleurs, et le constat mécanique des
séquences NFC (U+0E41 puis U+0E1E dans แพง, U+0E40 puis U+0E1E dans เพลง) le
démontre effectivement pour เ et แ. Mais un constat interne n'est pas une
source, et il ne couvre ni « à droite », ni « au-dessus », ni « en dessous »,
qui sont des faits de rendu graphique et non d'ordre logique.

Piste de résolution non bloquante : le nom traditionnel ไม้หน้า, double-sourcé,
signifie littéralement « signe de devant » et documente la position de เ et แ.
Il suffirait de citer ce nom comme preuve de position au lieu de l'écarter
(incertitude 8 l'écarte au motif que sa transcription n'est pas vérifiable, ce
qui confond « enseigner un nom » et « citer un nom comme preuve »).

### B5. Fait enseigné adossé à une source unique : le double rôle de อ

Le double rôle de อ (voyelle /ɔː/ après consonne, initiale muette en tête de
syllabe) est enseigné page 5 et développé dans `note_fr` de l'item 6. Il n'est
sourcé que sur `en.wiktionary.org/wiki/อ`. Aucune entrée th.wiktionary/อ n'est
citée, et aucune autre source ne l'est. C'est un fait sur une seule source, ce
que le contrat d'item et la politique interdisent tous les deux. Les autres
signes de voyelle enseignés (เ, แ) sont, eux, cités sur les deux éditions : le
manque est spécifique à อ.

### B6. Fait enseigné à zéro source : l'affirmation sur le p français

Page 1 : « En français, le p sort sans bouffée d'air, et cette bouffée n'a de
toute façon aucun rôle : elle ne distingue jamais deux mots. »

C'est la prémisse de toute la leçon et de tout le test de la feuille de papier.
Elle est affichée à l'écran comme un fait, au présent de vérité générale, et
n'est adossée à aucune source. Le rédacteur le reconnaît (incertitude 3) et
argue que le fait est « présenté comme une expérience à faire soi-même » : la
formulation retenue ne fait pourtant pas cela, elle affirme. La phonétique
française est hors du périmètre de `sources-verification.md`, ce qui est
précisément la raison pour laquelle il faut soit acquérir une source, soit
reformuler en observation (« tenez la feuille devant votre bouche et dites
« papa » : elle ne bouge presque pas »).

## 4. Findings NON BLOQUANTS (6)

### N1. Erreur de description phonologique dans l'item 8

`note_fr` de เพลง : « เ (U+0E40) ouvre la suite écrite et ferme la syllabe
entendue. »

C'est faux. Dans /pʰleːŋ/, la syllabe est fermée par /ŋ/, pas par la voyelle.
เ est le NOYAU vocalique, jamais la coda. L'antithèse « ouvre / ferme » est
séduisante mais elle enseigne une structure syllabique inexacte à un apprenant
qui découvre justement l'ordre écriture / prononciation. Reformuler du type
« เ ouvre la suite écrite, mais la voix ne l'atteint qu'après les consonnes ».

### N2. Imprécision page 6 sur เพลง

« Même chose pour เพลง ... le เ ouvre la suite écrite, mais la voix ne le
prononce qu'après la consonne. » Dans เพลง la voyelle vient après le GROUPE พล,
pas après une consonne. L'item 8 le précise correctement, la page
d'enseignement non. Sur un mot choisi précisément pour son groupe consonantique,
l'écart mérite d'être corrigé.

### N3. Le décompte de consultations du dossier ne tient pas

Le dossier annonce « 28 pages distinctes ont été consultées », puis énumère
16 pages (8 mots × 2 éditions) + 6 lettres + 6 signes de voyelle + ผ่าตัด, ผึ้ง,
พาน et ปี. Or le fichier consigne 35 URLs Wiktionary distinctes, et le poste
« 6 signes de voyelle » ne correspond qu'à 5 URLs réellement consignées
(อ sur en seulement, เ et แ sur les deux éditions), les trois pages า, ี et ู
étant déclarées consultées sans qu'aucune URL n'apparaisse nulle part. Un
décompte de preuve doit être recomputable à partir du fichier lui-même.

### N4. Attribution imprécise du nom de ี

Incertitude 8 : « th.wiktionary donne ... ฝนทอง pour ี ». L'entrée dit en
réalité « พินทุ์อิกับฝนทอง, พินทุ์อี ก็เรียก » : le nom du signe complet est
พินทุ์อิ + ฝนทอง, également appelé พินทุ์อี. ฝนทอง ne nomme pas ี à lui seul.
Sans effet sur l'écran, mais le dossier doit être exact.

### N5. « Voisine » appliqué à ผ et พ

Page 3 : « Voici ses deux voisines soufflées, ผ ... et พ ». Note culturelle :
« Sa voisine ผ ». Selon th.wiktionary, ป est la 27e lettre, ผ la 28e et พ la
30e. ผ est effectivement voisine de ป ; พ ne l'est pas, et ผ n'est pas voisine
de พ, ฝ s'intercalant. Le mot est manifestement figuré (« lettres sœurs »), et
la leçon n'enseigne pas l'ordre alphabétique, donc le risque est faible. À
neutraliser malgré tout, l'unité 3 ou 4 finissant par enseigner cet ordre.

### N6. « La lettre du poisson » n'est pas sourcée dans ce fichier

Page 3 nomme ป « la lettre du poisson ». La valeur « poisson » de ปลา n'est
sourcée nulle part dans la leçon, alors que la note culturelle prend soin de
double-sourcer « abeille » pour ผึ้ง et « plateau à pied » pour พาน. Le dossier
range ป en reprise de `u01-l1a`, ce qui est recevable, mais l'asymétrie de
traitement entre les trois noms de lettres affichés sur le MÊME écran doit être
levée, soit par un renvoi explicite au dossier 1A, soit par deux sources ici.

## 5. Points contrôlés qui se sont révélés CORRECTS malgré un fort soupçon

Consignés pour éviter qu'un audit ultérieur ne les rouvre :

- « traduction française « cher » donnée par l'entrée » (item 7, th.wiktionary/
  แพง) : je soupçonnais une invention, les entrées th.wiktionary comportant
  rarement du français. Elle est EXACTE, la section `คำแปลภาษาอื่น` liste
  `ฝรั่งเศส: cher, chère`.
- Les définitions thaïes citées aux items 1, 3, 4, 5, 6, 8 et dans la note
  culturelle sont des préfixes fidèles des définitions réelles, jamais des
  paraphrases déguisées. Aucune ne déforme la source. Les troncatures sont
  signalables mais honnêtes.
- Les romanisations Paiboon citées (`bpaa`, `bpàa`, `pàa`, `pûut`, `pɔɔ`,
  `pɛɛng`, `pleeng`) sont toutes exactes, y compris le piège apparent de
  `ผ่า → pàa` qui semble contredire l'aspiration mais reflète simplement la
  convention Paiboon (`bp` = /p/, `p` = /pʰ/).
- La transcription `phôuut` semblait violer la règle de doublement v1.1 ; elle
  la respecte (nucleus `ouu`, ton descendant porté par la première lettre).
- L'exercice 1 semblait vulnérable à un biais de cible ; la répartition est
  équilibrée 3/3 entre aspirées et non aspirées.
- La contrainte de production audio « les six tirages doivent être générés par
  la MÊME voix » est pertinente et bien vue : sans elle l'exercice mesurerait la
  variation inter-locuteurs et non l'aspiration.

## 6. Ce que cet audit n'a PAS pu couvrir

- RID 2554 : même blocage que le rédacteur, la consultation d'une entrée passe
  par un POST non interrogeable. L'autorité orthographique n° 1 reste
  non consultée pour les 8 items.
- Volubilis v26.2 : non consultable entrée par entrée.
- Fréquence et naturalité : aucune liste consultée de mon côté non plus. Les
  incertitudes 4 et 10 du rédacteur restent entières, en particulier l'arbitrage
  sur ผ่า et sur la valeur d'usage de ปา.
- Audio : aucune piste n'existe, les exercices 1 et 2 et les pages 2, 4 et 7 ne
  sont donc pas testables.
- Rendu accessible des signes combinatoires ่ ี ู aux trois largeurs.
- Revue native : en attente, et cet audit ne s'y substitue pas.

## 7. Conclusion

Le travail linguistique est de bonne qualité : sur 73 faits re-vérifiés de
façon autonome, aucun n'est faux. Les huit graphies, les huit séquences NFC,
les huit tons, les huit longueurs, les huit sens, les huit transcriptions v1.1
et les vingt-deux corrigés d'exercices sont exacts. Aucune URL n'est inventée.

Ce qui bloque n'est pas la langue, c'est la preuve. Deux citations attribuent à
une source un contenu qu'elle ne contient pas (B2, B3), un fait est
mono-sourcé (B5), deux faits enseignés à l'écran sont à zéro source (B4, B6),
et l'ensemble du dossier repose sur un seul écosystème éditorial (B1). Tant que
B1 à B6 ne sont pas résolus, la leçon 2A ne peut pas passer `draft → review`.

Aucune décision fondateur n'est requise pour lever B2, B3, B4 et B5 : ce sont
des corrections rédactionnelles et des consultations complémentaires. B1 et B6
demandent une ressource externe (accès RID exploitable, base Volubilis, ou une
grammaire de référence sur exemplaire) et rejoignent donc la dépense de 100 à
150 EUR déjà identifiée dans la politique de sources.
