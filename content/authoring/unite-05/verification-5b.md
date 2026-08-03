# Contre-audit adversarial de `u05-l5b`

- Fichier audité : `content/authoring/unite-05/lecon-5b.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent indépendant, consigne adversariale (chercher des erreurs,
  ne pas confirmer)
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` (v1, amendements
  v1.1 et v1.2, arbitrage v1.2) et `docs/content-policy/sources-verification.md`
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Le RID a
  été réinterrogé en direct, les entrées Wiktionary refetchées en wikitexte brut
  et en rendu, les fichiers Unicode retéléchargés, les codepoints recalculés et
  les leçons antérieures citées relues dans le dépôt.

## Verdict

**NON RECEVABLE en l'état pour un passage `draft -> review`.**

9 findings bloquants, 3 findings non bloquants. La leçon est par ailleurs d'une
honnêteté documentaire remarquable : sur 165 faits que j'ai revérifiés
moi-même, 165 se sont révélés exacts au caractère près, y compris des relevés
très exposés comme le nombre de composés d'un bloc `ลูกคำ`, l'en-tête daté d'un
fichier Unicode ou la présence exacte d'une balise `File:` dans un wikitexte.
Les défauts trouvés ne sont donc pas des inventions de source. Ce sont des
généralisations trop larges, des affirmations sans source sur le français, et
deux endroits où la leçon s'applique à elle-même une règle plus souple que
celle qu'elle invoque pour retirer un mot.

## Ce que j'ai revérifié moi-même, et qui est confirmé

| Dimension contrôlée                                                                 | Faits confirmés |
| ----------------------------------------------------------------------------------- | --------------- |
| Graphie, codepoints, stabilité NFC des 7 items                                      | 7               |
| Catégories générales et classes combinatoires Unicode                               | 3               |
| Position des signes, `IndicPositionalCategory-17.0.0.txt` (en-tête, date, 3 plages) | 5               |
| Ton par item, recalculé depuis classe + marque + type de syllabe                    | 7               |
| Longueur par item                                                                   | 7               |
| IPA par item, dont 2 chaînes composées correctement à partir de notations attestées | 7               |
| Sens français par item                                                              | 7               |
| Registre par item                                                                   | 6               |
| Transcription `thainaute-fr` v1.1 par item                                          | 7               |
| RID, présence ou absence de la vedette                                              | 9               |
| RID, taille des blocs `ลูกคำ`                                                       | 5               |
| RID, définitions et mots d'exemple cités par référence                              | 15              |
| Wiktionary, valeurs IPA                                                             | 7               |
| Wiktionary, romanisations Paiboon et Royal Institute                                | 14              |
| Wiktionary, sections grammaticales et gloses                                        | 7               |
| Wiktionary, réponses 404 revendiquées                                               | 3               |
| Wiktionary, listes de termes dérivés                                                | 4               |
| Wiktionary, illustration du panneau `บ-1`                                           | 1               |
| Ancrages dans les leçons antérieures du dépôt                                       | 13              |
| Position de la marque de ton (2e dans ซ้าย, 4e dans เลี้ยว)                         | 2               |
| Corrigés des quatre exercices                                                       | 25              |
| Origine VOLUBILIS (projet SourceForge `belisan`, fichier, version 26.2)             | 3               |
| Absence de tiret cadratin et demi-cadratin                                          | 1               |
| **Total**                                                                           | **165**         |

Quelques points saillants de cette revérification, parce qu'ils sont exposés :

- RID interrogé en POST le 3 août 2026 : `ไป` porte bien `ก. เคลื่อนจากตัวผู้พูด`,
  l'exemple `เขาไปตลาด`, la mention `ใช้ตรงข้ามกับ มา`, l'emploi de continuité
  `ทำไปกินไป` et l'emploi d'intensif avec `ขาวไป ช้าไป ดีเกินไป` ; bloc `ลูกคำ` de
  dix composés, exactement dix. `มา` porte bien deux vedettes, la lune au pali
  puis le verbe, `ตรงกันข้ามกับ ไป`, deux composés. `เลี้ยว` est défini par l'écart
  `ไปจากแนวตรง` avec `เลี้ยวซ้าย เลี้ยวขวา` en exemples, un seul composé. `ตรง`
  groupe bien `ตรง, ตรง ๆ`, sept acceptions, trois composés. `หยุด` a bien deux
  acceptions verbales et un seul composé. `เลี้ยวซ้าย` répond bien `ไม่พบคำศัพท์`.
- Wiktionary : `/paj˧/`, `/maː˧/`, `/lia̯w˦˥/`, `/saːj˦˥/`, `/kʰwaː˩˩˦/`,
  `/troŋ˧/`, `/jut̚˨˩/` sont exacts, ainsi que les sept couples de romanisations
  Paiboon et Royal Institute. La section Interjection `begone` existe. La
  section Northern Thai donne bien `/paj˧˧˦/`. Les trois 404 sont réels. La
  page `หยุด` s'ouvre bien sur `[[File:Thailand_road_sign_บ-1.svg|thumb|Stop
sign of Thailand]]`.
- Unicode : les plages `0E34..0E37 ; Top`, `0E47..0E4E ; Top` et
  `0E38..0E3A ; Bottom` sont exactes, et le fichier porte bien en tête
  `IndicPositionalCategory-17.0.0.txt` et la date `2025-07-29, 13:35:52 GMT`.
- Les neuf graphies sont identiques sous NFC et sous NFD, les valeurs `ccc`
  sont bien 0, 107 et 103, et la marque de ton est bien en deuxième position
  dans `ซ้าย` et en quatrième dans `เลี้ยว`.
- L'ancrage `aai` est correct : `ไม้` est bien `/maːj˦˥/`, Paiboon `máai`,
  voyelle longue. J'ai vérifié ce point en soupçonnant l'inverse.
- Les 25 corrigés des quatre exercices sont justes, et les distracteurs sont
  bien faux. La contrainte « jamais deux fois de suite la même réponse » est
  respectée par la suite gauche, droite, gauche, aucun, droite, gauche.

## Findings bloquants

### F1. Le RID n'est pas muet sur ตรงไป, et le retrait est donc infondé

Gravité : bloquante. Type : référence mal citée, décision éditoriale erronée.

La leçon écrit, au bloc « Le cas ตรงไป » :

> **RID 2554 : ABSENT.** [...] Et l'absence n'est pas compensée par un exemple :
> l'entrée « ตรง » contient bien la chaîne ตรงไป, mais uniquement à l'intérieur
> de l'idiome ตรงไปตรงมา [...] La contre-vérification a été faite caractère par
> caractère sur le texte de l'entrée.

La contre-vérification a porté sur **une seule entrée**, `ตรง`, puis sa
conclusion a été généralisée au dictionnaire entier : « Le fait « ตรงไป veut
dire tout droit » repose donc sur **une seule source recevable** ».

J'ai interrogé le RID directement le 3 août 2026, mot par mot, sur les entrées
que la chaîne `ตรงไป` traverse. Elle y est employée avec sa valeur
directionnelle dans au moins six vedettes indépendantes :

| Vedette    | Occurrence relevée                              |
| ---------- | ----------------------------------------------- |
| `ชี้` (๒)  | `เหยียดนิ้วชี้เป็นต้นตรงไปที่ใดที่หนึ่ง`        |
| `พุ่ง`     | `ทำให้เคลื่อนตรงไปโดยแรงและเร็ว` et `มุ่งตรงไป` |
| `ลัด` (๑)  | `ตัดตรงไปเพื่อย่นทางย่นเวลา`                    |
| `เล็ง` (๑) | `เพ่งมอง, จ้องตรงไป`                            |
| `จ้อง`     | `เล็งมุ่งตรงไปยังสิ่งใดสิ่งหนึ่ง`               |
| `โคน` ๓    | `เดินตรงไปข้างหน้าคราวละ ๑ ตา`                  |

Le dictionnaire normatif emploie donc lui-même `ตรงไป` au sens « droit vers,
tout droit », six fois, dans six articles sans rapport entre eux. C'est
exactement le régime de preuve que la leçon accepte pour `เลี้ยวซ้าย` et
`เลี้ยวขวา`, qu'elle enseigne sur la base d'un emploi du RID en exemple sans
vedette propre. Le fait n'est donc pas mono-sourcé, le retrait n'est pas imposé
par la règle des deux sources, et l'incertitude 1 demande au fondateur un
arbitrage et éventuellement une dépense de 100 à 150 EUR pour lever un blocage
qui n'existe pas.

Aggravant : `u05-l5e` enseigne `ตรงไป` en s'appuyant précisément sur ces
attestations d'usage du RID. Deux leçons de la même unité tranchent donc en sens
opposé le même fait, sur le même dictionnaire, le même jour.

Correction attendue : refaire le relevé sur l'ensemble des entrées, pas sur une
seule, puis soit réintégrer `ตรงไป`, soit motiver son absence par une raison de
charge éditoriale, ce qui est légitime, et non par une fausse insuffisance de
sources. Retirer l'arbitrage demandé au fondateur tant que le motif n'est pas
rétabli.

### F2. ปลา est donné comme exemple de voyelle non écrite, ce qui est faux

Gravité : bloquante. Type : règle fausse, exemple faux, dans un champ `note_fr`.

Item 6, `ตรง`, `note_fr` :

> Deux, aucune voyelle n'est écrite entre ร et ง : elle est sous-entendue, comme
> dans ผม (phǒm) appris en 2D et dans ปลา (plaa) de 3D.

`ผม` est un exemple correct de voyelle inhérente. `ปลา` ne l'est pas. Sa voyelle
est écrite : U+0E32 SARA AA. Le mot est `/plaː˧/`, et la leçon 3D, item 5, le
donne elle-même avec `longueur : longue` et une `note_fr` qui décrit un groupe
consonantique `ปล` prononcé d'un seul élan, sans jamais parler de voyelle
sous-entendue. Il n'y a aucun phonème implicite entre `ป` et `ล`, et la voyelle
du mot est visible.

L'affirmation installe donc chez l'apprenant une fausse généralisation, à savoir
que tout groupe consonantique cacherait une voyelle. La page 8, qui traite le
même point à l'écran, est correcte et ne cite que `ผม` : l'erreur est confinée à
la `note_fr` de l'item 6.

Correction attendue : supprimer `ปลา` de cette énumération.

### F3. Affirmation phonétique sur le français sans aucune source

Gravité : bloquante. Type : fait non sourcé, affirmation sur la production d'une
bouche française.

Item 7, `หยุด`, `note_fr` :

> La voyelle est brève et se ferme net sur le t, jamais relâché comme dans
> « bac ».

La comparaison affirme ce que fait un locuteur français avec la finale de
« bac », c'est-à-dire qu'il la relâche audiblement. Aucune source de
`docs/content-policy/sources-verification.md` ne couvre la phonétique du
français. Le RID, VOLUBILIS, Wiktionary, Unicode et FrequencyWords documentent
le thaï, pas la bouche de l'apprenant. Aucune grammaire de référence n'est
acquise, et la politique n'autorise aucune source de phonétique française.

Le champ `sources` de l'item 7 ne cite rien pour ce point, et le dossier de
production ne le mentionne pas non plus dans ses incertitudes.

Le défaut est ancien et se propage : la même phrase, au mot près, figure déjà
dans `u02-l2d` et `u02-l2e`. `u05-l5a` affirme de son côté que « Le français,
lui, relâche ses fins de mots avec un petit bruit de détente », et son bloc de
sources ne couvre explicitement que le versant thaï. Le traiter dans 5B seule ne
suffira pas.

Correction attendue : soit supprimer la comparaison et décrire uniquement le
geste thaï, qui est sourçable, soit ouvrir une décision de politique de sources
pour admettre une référence de phonétique du français, ce qui est une décision
de projet et non une décision de leçon.

### F4. La finale non relâchée de หยุด est mono-sourcée dans 5B

Gravité : bloquante. Type : fait mono-sourcé, énoncé à l'écran.

Page 9, texte affiché :

> Lisez donc « yòut », en une syllabe brève qui se ferme net sur le t.

Le seul appui de « se ferme net » est le diacritique `◌̚` de `/jut̚˨˩/`. Ce
diacritique ne vient que de Wiktionary, et le dossier de production de la leçon
pose lui-même la règle qui l'invalide comme preuve unique :

> **Les deux éditions sont traitées comme UN seul écosystème**, jamais comme
> deux sources indépendantes.

Ni le RID ni VOLUBILIS ne sont cités pour ce fait dans l'item 7 : VOLUBILIS n'y
est invoquée que pour le ton, la longueur et l'absence de `h`. Le fait est donc
porté par une seule autorité.

L'incohérence est interne et elle est nette. L'incertitude 8 applique la
discipline inverse au diacritique de non-syllabicité de `เลี้ยว` :

> Wiktionary note la diphtongue de เลี้ยว avec un diacritique de non-syllabicité,
> /ia̯w/, que ni le RID ni VOLUBILIS ne permettent de recouper. [...] aucune page
> d'enseignement, aucun feedback et aucune transcription Thaïnaute ne s'appuient
> dessus.

Deux diacritiques mono-sourcés, deux traitements opposés, dans le même fichier.

À noter que la deuxième jambe existe et qu'elle a été trouvée ailleurs :
`u05-l5a` s'appuie sur l'entrée `คำตาย` du RID, qui range ensemble les séries
`กก`, `กด` et `กบ`. 5B ne la cite pas.

Correction attendue : citer la seconde jambe, ou retirer l'affirmation de
l'écran et la laisser au champ `ipa`.

### F5. Le registre « familier et brusque » de ไป n'est porté par aucune source citée

Gravité : bloquante. Type : référence mal citée, fait non sourcé présenté comme
double-sourcé.

Item 1, champ `registre` :

> **Familier et brusque employé seul comme interjection**, au sens de
> « va-t'en » : marque portée par deux sources indépendantes, voir ci-dessous.

Les deux sources invoquées n'établissent que l'existence de l'emploi, pas son
registre.

- en.wiktionary : j'ai relu le wikitexte brut. La section est
  `===Interjection===` puis `{{th-interj}}` puis `# [[begone]]`. **Aucun
  `{{lb|th|...}}`**, donc aucune étiquette de registre. La brusquerie perçue est
  celle du mot anglais `begone`, pas une marque portée par l'entrée thaïe.
- VOLUBILIS : la leçon cite elle-même la ligne 67994 comme `TYPE v. exp.`,
  `LEV I`, `FRA « Va-t'en ! ; Décampe ! »`. Aucun code de registre n'est relevé.
  L'argument est d'autant plus faible que la leçon sait relever ces codes quand
  ils existent : elle rapporte `mettre les voiles (fam.)` sur la ligne 67993 et
  `make a right (inf.)` sur la ligne 51300. Leur absence sur la ligne 67994 est
  donc significative.

Le RID, autorité n° 1, n'enregistre pas cet emploi du tout, ce que la leçon ne
signale pas.

La conséquence n'est pas cosmétique : le registre affirmé justifie une consigne
affichée, « Ne l'employez pas isolé » à la page 4, et une exclusion SRS motivée
par « une raison évidente de sécurité sociale de l'apprenant ».

Correction attendue : ramener le champ `registre` à ce qui est attesté, à savoir
un emploi interjectif de renvoi, et retirer la mention « marque portée par deux
sources indépendantes », ou produire une source qui porte réellement la marque.

### F6. La Méta cite mal la page 8 de 4A, et l'énoncé qui en découle est faux

Gravité : bloquante. Type : règle fausse, référence interne mal citée.

Méta, prérequis :

> le fait, énoncé à sa page 8, que cette règle ne couvre ni les syllabes portant
> une marque, ni les initiales hors des deux classes enseignées, ni les syllabes
> fermées par un k, un t ou un p. Les sept mots du jour se répartissent
> exactement entre ces cas : voir la page 9

J'ai relu `content/authoring/unite-04/lecon-4a.md`. Sa page 8 pose une exclusion
supplémentaire que la Méta laisse tomber :

> Celles qui se terminent sur un k, un t ou un p, **et celles qui s'écrivent avec
> ไ, ใ, เ-า ou -ำ**, comme ไก่ et ไข่, sont d'autres cas

Trois conséquences.

1. La citation est inexacte : 4A énonce quatre exclusions, la Méta en rapporte
   trois.
2. L'énoncé « Les sept mots du jour se répartissent exactement entre ces cas »
   est faux tel qu'écrit. `ไป` n'entre dans aucun des trois cas listés : sa
   consonne initiale `ป` est une des neuf moyennes enseignées, la syllabe ne
   porte aucune marque, et elle n'est pas fermée par un k, un t ou un p. Sous le
   résumé de la Méta, `ไป` serait donc couvert par la règle, et la page 10 aurait
   dû annoncer trois mots couverts et non deux.
3. La page 11 utilise pourtant l'exclusion manquante : « ไป s'écrit avec ไ : 4A
   rangeait déjà ces deux formes parmi les cas non couverts. » Cette phrase est
   correcte au regard de 4A, mais elle contredit le résumé de la Méta.

Le renvoi « voir la page 9 » est faux par ailleurs : la répartition des sept mots
est faite aux pages 10 et 11, la page 9 traitant de `หยุด`.

Correction attendue : rétablir la quatrième exclusion dans la Méta et corriger le
renvoi.

### F7. « ตรง contraire de เลี้ยว » est mono-sourcé et enseigné à l'écran

Gravité : bloquante. Type : fait mono-sourcé.

La leçon fait de `ตรง` le contraire de `เลี้ยว` en Méta (« plus un mot de forme,
ตรง, qui sert de contraire à เลี้ยว »), à la page 8 (« Retenez les deux ensemble :
เลี้ยว tourne, ตรง ne tourne pas ») et dans les pièges de l'exercice 2. Le dossier
justifie ainsi :

> Lien avec เลี้ยว : c'est le RID lui-même qui relie les deux mots, l'entrée
> « เลี้ยว » définissant l'action comme un écart par rapport à แนวตรง

J'ai relu l'entrée. Le RID écrit `หักแยก โค้ง หรือคดเคี้ยวไปจากแนวตรง`. Il relie
`เลี้ยว` à `แนวตรง`, un syntagme, et non à la vedette `ตรง` posée comme
antonyme. Aucune mention réciproque n'existe : l'entrée `ตรง` ne renvoie pas à
`เลี้ยว`. Aucune autre source citée ne porte ce couple : ni VOLUBILIS, ni
en.wiktionary, ni th.wiktionary.

Le contraste est d'autant plus visible que la leçon exige exactement le contraire
pour `ไป` et `มา`, où elle insiste sur la double mention explicite `ใช้ตรงข้ามกับ`
et `ตรงกันข้ามกับ` dans les deux entrées, et où elle vérifie que chaque entrée
renvoie à l'autre. Elle applique donc à `ตรง / เลี้ยว` un standard de preuve
qu'elle refuse ailleurs, et qui est plus faible que celui qui lui a fait retirer
`ตรงไป`.

Le sens enseigné de `ตรง`, « droit, qui ne tourne pas », est lui parfaitement
double-sourcé et n'est pas en cause. C'est la relation d'antonymie qui ne l'est
pas.

Correction attendue : soit une seconde source pour le couple, soit présenter
`ตรง` comme un mot de forme utile sans lui donner le statut d'antonyme établi.

### F8. La page 3 affirme sans source ce que fait le français, et ce que la politesse ne fait pas en thaï

Gravité : bloquante. Type : fait non sourcé, contradiction avec le dossier.

Page 3, texte affiché :

> En français, vous dites « j'arrive » à quelqu'un qui vous attend ailleurs,
> alors que vous vous éloignez de là où vous êtes. Le thaï ne fonctionne pas
> ainsi : c'est la position de celui qui parle qui tranche, pas la politesse ni
> la destination.

Deux affirmations distinctes, aucune sourcée.

1. La description de l'usage français de « j'arrive » est un fait de langue
   française. Aucune source de la politique ne couvre le français. Le fait est
   repris deux fois de plus, dans les pièges de l'exercice 2 (« par transfert du
   français « je viens » dit à quelqu'un qui attend ailleurs ») et dans le
   feedback de l'exercice 3 (« l'erreur est logique en français »).
2. « pas la politesse » est une affirmation négative sur l'usage thaï. Les
   entrées du RID définissent une déixis, elles ne disent rien de la politesse.
   Le dossier de production le reconnaît explicitement :

   > Ce que la leçon N'AFFIRME PAS : [...] rien sur les règles de politesse qui
   > pourraient s'y attacher. Ces faits demanderaient une grammaire de référence
   > sur exemplaire acquis, que le projet ne possède pas encore.

   La page 3 affirme donc à l'écran ce que le dossier certifie ne pas affirmer.

Correction attendue : réécrire la page 3 en restant sur ce que le RID établit,
c'est-à-dire l'éloignement et le rapprochement par rapport à celui qui parle,
sans caractériser le français ni exclure la politesse.

### F9. La note culturelle affirme un fait de voyage non sourcé

Gravité : bloquante. Type : information pratique non sourcée, contradiction
interne.

Note culturelle :

> le premier mot thaï que beaucoup de visiteurs déchiffrent sans le savoir est
> justement l'un des sept d'aujourd'hui.

« beaucoup de visiteurs déchiffrent » est une affirmation sur le comportement
réel de voyageurs. Aucune source ne la porte, et la note se contredit elle-même
quelques lignes plus bas :

> Ce qui n'est PAS affirmé : [...] rien sur la fréquence réelle de ce panneau

Second point, plus fin mais réel : la formule d'ouverture « หยุด est le mot qu'on
lit sur les panneaux de stop en Thaïlande » n'est pas non plus exactement portée
par les deux sources citées. VOLUBILIS classe le mot au domaine `TRANSP (auto,
code)`, ce qui le range dans le vocabulaire du code de la route mais ne dit pas
qu'il figure sur le panneau. Wiktionary place une image dont la légende, que
j'ai relue en wikitexte, dit seulement `Stop sign of Thailand` et non que le
panneau porte ce mot. La leçon décrit d'ailleurs honnêtement ce régime de preuve
(« l'autre en illustrant son article par le panneau lui-même »), mais elle en
tire ensuite une affirmation plus forte que ce que ses sources permettent.

Correction attendue : supprimer la phrase sur les visiteurs, et ramener
l'ouverture à ce que les sources disent, à savoir que le mot appartient au
vocabulaire du code de la route.

## Findings non bloquants

### F10. Collision d'unité : 5B est contredite par 5D et 5E, et ignore 5A

Gravité : non bloquante pour la justesse linguistique, bloquante pour la
consolidation de l'unité.

L'incertitude 11 signale honnêtement que 5B a été écrite en aveugle. Les quatre
autres leçons existent aujourd'hui, et le recouvrement est effectif.

- `u05-l5d` réenseigne `ไป` comme item 1, étiqueté `(nouveau)`, avec
  `registre : neutre` et aucune mise en garde sur l'emploi interjectif que 5B
  juge assez risqué pour l'exclure de la production SRS. Les deux leçons donnent
  donc deux registres différents pour la même graphie.
- `u05-l5e` enseigne `ตรงไป` en item 8, présenté comme « dépendance 5D ». La
  garantie de 5B, « **aucun écran ne mentionne son existence** », est donc fausse
  à l'échelle de l'unité.
- `u05-l5a`, la leçon immédiatement précédente, enseigne à sa page 5 le `ห` de
  tête muet et prend pour second volet phonétique les finales `-p`, `-t` et `-k`
  non relâchées. 5B réenseigne les deux comme neufs à sa page 9 et dans la
  `note_fr` de l'item 7, et ne liste pas 5A dans ses prérequis.
- L'item 7 renvoie à « une règle d'écriture qui n'est pas enseignée avant
  l'unité 6 ». Aucune unité 6 n'existe dans le dépôt, et c'est 5A qui traite déjà
  le `ห` muet.

Correction attendue : arbitrage de répartition à la consolidation de l'unité 5,
et ajout de 5A aux prérequis.

### F11. Trou de correction à l'exercice 4 sur le séparateur de bloc

Gravité : non bloquante. Type : politique de correction incomplète, risque de
faux négatif.

`CONVENTIONS.md` pose : « Séparateur de syllabes : point médian `·` dans les mots
polysyllabiques ». `u02-l2d` transcrit conformément le bloc `มาจาก` en
`maa·jàak`, et 5B cite elle-même cette forme en Méta et à la page 5.

L'exercice 4 exige pourtant un espace pour `líao sáai` et `líao khwǎa`, et sa
politique de saisie ne prévoit que deux cas :

> l'espace entre les deux mots d'un bloc est exigé, la forme collée est refusée

`líao·sáai` n'est ni exigé, ni accepté, ni refusé : il n'est pas prévu. Un
apprenant qui écrit depuis l'unité 2 des blocs avec un point médian produira
cette forme, et la carte la comptera fausse sans que rien ne le prévoie.

Correction attendue : accepter explicitement le point médian, ou expliquer à
l'écran pourquoi `เลี้ยวซ้าย` prend un espace là où `มาจาก` prend un point médian.

### F12. Quatre incohérences mineures de rédaction et de comptage

Gravité : non bloquante.

1. Exercice 1, pièges connus : « sur-corriger après deux réponses « à gauche »
   consécutives ». La contrainte de tirage de l'exercice interdit deux fois de
   suite la même réponse, et la suite retenue la respecte. Le piège décrit une
   situation que la conception rend impossible.
2. Exercice 1, pièges connus : « décider sur la première syllabe, identique dans
   deux tirages sur trois ». Les six tirages commencent tous par `เลี้ยว`. La
   première syllabe est identique dans six tirages sur six.
3. Feedback incorrect de l'exercice 1 : « ซ้าย ne bouge pas, il reste en haut ».
   L'item 4 donne `/saːj˦˥/`, c'est-à-dire une montée de 4 vers 5. La
   description contredit l'IPA du même fichier. Le repère pédagogique reste
   utilisable puisque le contraste avec `˩˩˦` tient, mais la formulation est à
   aligner. À noter que 4A page 9 pose déjà la même formule, le point dépasse
   donc 5B.
4. Bloc « Codepoints et Unicode » : « Les noms normatifs des dix-neuf points de
   code employés ». Les neuf graphies contrôlées emploient dix-huit points de
   code distincts, que j'ai recomptés. Le dix-neuvième est probablement U+0E3A
   PHINTHU, qui n'apparaît que dans les respellings et dans aucune des neuf
   graphies.

## Réserves de l'auditeur

- **VOLUBILIS n'est pas vérifiable en l'état.** Le fichier `VOLUBILIS.ods` n'est
  pas dans le dépôt, le dossier indique que les scripts d'extraction sont « des
  scripts de session, non versionnés », et aucun chemin local n'est consigné.
  J'ai pu confirmer que le projet SourceForge `belisan` existe, qu'il sert bien
  `VOLUBILIS.ods` et que la version 26.2 y est listée, mais **aucun numéro de
  ligne, aucune valeur de colonne, l'empreinte SHA-256 et les tailles en octets
  n'ont pu être recontrôlés**. La forme de citation reste conforme à
  l'amendement v1.2, qui n'exige pas la conservation de l'exemplaire, mais la
  reproductibilité réelle dépend aujourd'hui d'un fichier que personne ne
  conserve. À traiter au niveau du projet, pas de la leçon.
- La coquille signalée par l'incertitude 5, ligne 51300, « virer à gauche » dans
  une entrée qui signifie « tourner à droite », relève de la même réserve : je ne
  peux ni la confirmer ni l'infirmer. Le sens retenu par la leçon, droite, est
  lui confirmé de façon indépendante par le RID et par en.wiktionary.
- Les entrées th.wiktionary n'ont pas été refetchées une à une. Le traitement que
  la leçon leur applique, recoupement de lecture et exclusion du décompte des
  autorités pour le sens, est plus strict que ce que la politique impose et ne
  crée donc aucun risque de surévaluation.

## Ce qu'il faut faire avant `review`

1. Reprendre F1 : refaire le relevé RID sur l'ensemble des entrées, puis
   trancher `ตรงไป` sur un motif exact. Retirer l'arbitrage fondateur tant que
   son motif n'est pas rétabli.
2. Corriger F2, F6, F9 et F12, qui sont des corrections de texte.
3. Trancher F3 au niveau du projet : soit interdire toute affirmation phonétique
   sur le français, et purger `u02-l2d`, `u02-l2e`, `u05-l5a` et `u05-l5b`, soit
   ouvrir une entrée de politique de sources pour le français.
4. Sourcer ou retirer F4, F5, F7 et F8.
5. Consolider l'unité 5 avant toute compilation, F10.
6. Compléter la politique de correction de l'exercice 4, F11.
7. Les portes déjà signalées par la leçon restent valables : ratification des
   graphèmes `iao`, `aai` et des quatre autres en attente, contre-audit externe
   `unite-05/contre-audit-gpt56.md`, recoupements `verification-rid.md` et
   `verification-volubilis.md` de l'unité, audit d'accessibilité de la pile à
   deux étages de `เลี้ยว`, production audio.

Revue native : en attente. Aucune leçon de l'unité 5 n'est publiable en l'état.
