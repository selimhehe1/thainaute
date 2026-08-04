# Contre-audit adversarial de `u09-l9e` (Je ne me sens pas bien)

- Fichier audité : `content/authoring/unite-09/lecon-9e.md`
- sha256 du fichier au moment de l'audit :
  `6ef25781a96be16c1df7bc55b0543dda124ebcc193b7efc18bf397cb914a5ee6`
  (145 385 octets, relevé par `unicode-thai.mjs`)
- Date : 2026-08-04
- Posture : adversariale. Aucune source citée par la leçon n'a été crue sur
  parole. Chaque fait a été re-relevé par les scripts versionnés ou par lecture
  directe des fichiers du dépôt.
- Résultat : **121 faits confirmés par moi-même**, **12 findings**, dont
  **4 bloquants**.

## Méthode

Tout ce qui suit a été re-produit, jamais recopié du dossier de la leçon.

| Instrument                                | Ce qui a été refait                                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `rid-entry.mjs`                           | 15 articles lus en entier : หา, สบาย, หมอ, ปวด, ไหม, ค่ะ, กี่, ไม่, วัน, ผม, แล้ว, มาก, ไป, ครับ, หัว                                           |
| `rid-lookup.mjs`                          | 9 relevés de présence : ไม่สบาย, ปวดหัว, ไปหาหมอ, ไม่เป็นไร, นอน, ถ่าน, ช้อน, ง่าย, พ่อ                                                         |
| `volubilis-codes.mjs` sur `VOLUBILIS.ods` | feuille `Volubilis` dépouillée en entier, 24 identifiants vérifiés un par un, feuille `Codes` pour la clé `TONES`, empreinte recalculée         |
| `unicode-thai.mjs`                        | NFC, zone privée, 14 champs `thai` et leurs séquences                                                                                           |
| `repo-thai-scan.mjs 9 9` et `1 9`         | décomptes de l'unité et du parcours                                                                                                             |
| Wiktionary en rendu                       | entrées « ไม่สบาย » et « ปวดหัว »                                                                                                               |
| Lecture directe du dépôt                  | 18 renvois d'items, 13 identifiants de cartes SRS, inventaire des exercices de l'unité, citation de `u05-l5a`, familles de finales de `u09-l9a` |
| Recalcul à la main                        | 10 dérivations de ton de l'exercice 2, 39 syllabes, tableau de tons, marques, empilement, planchers des 4 exercices                             |

Empreintes confirmées : `VOLUBILIS.ods` = 15 724 718 octets, sha256
`bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, identique à
ce qu'annonce l'en-tête du script et le dossier de la leçon.
`VOLUBILIS_Database.xlsx` présent sur le poste fait bien **154 octets** et n'est
pas un classeur : l'incertitude 5 de la leçon est exacte, l'artefact prescrit
par l'amendement v1.3 n'était pas servi.

## Décompte des faits confirmés

| Famille                                                       |   Faits |
| ------------------------------------------------------------- | ------: |
| RID 2554 (15 articles lus, 9 présences)                       |      24 |
| VOLUBILIS (24 identifiants, clé `TONES`, empreinte)           |      26 |
| Wiktionary (2 entrées, IPA et définitions)                    |       2 |
| Scripts du dépôt (Unicode, deux balayages, état du `.xlsx`)   |       6 |
| Dérivations de ton de l'exercice 2, recalculées               |      10 |
| Prosodie du dialogue (syllabes, tableau, marques, empilement) |       6 |
| Planchers des quatre exercices                                |       4 |
| Renvois d'items vers d'autres leçons                          |      18 |
| Cartes SRS (13 identifiants, 4 décomptes)                     |      17 |
| Faits structurels du parcours                                 |       8 |
| **Total**                                                     | **121** |

### Ce qui est confirmé et tient

- **RID.** L'entrée « หา ๑ » imprime bien `ไปหาหมอ` comme PREMIER exemple du sens
  (๑) มุ่งพบ, พบ, avec `เพื่อนมาหา` en second, et le sens (๒) est bien
  เยี่ยม, เยี่ยมเยียน. « ไหม ๒ » vient bien de หรือไม่ et n'imprime que
  `กินไหม`. « ค่ะ » imprime bien `ไปค่ะ` et `ไม่ไปค่ะ`. « กี่ ๒ » imprime bien
  `กี่วัน` et `กี่บาท`. « ไม่ » définit bien le mot comme niant le sens du mot
  suivant, avec `ไม่กิน` et `ไม่ดี`, et sa liste de ลูกคำ compte 71 entrées sans
  ไม่สบาย. « วัน ๑ » donne bien des exemples où le nombre précède วัน. « มาก »
  donne bien คนมาก, น้ำมาก, กินมาก, tous postposés. « สบาย » porte bien six sens,
  le (๕) étant ไม่เจ็บไม่ไข้, et donne la lecture `[สะบาย]` dont la séquence est
  exactement U+0E2A U+0E30 U+0E1A U+0E32 U+0E22. « ครับ » porte bien `[คฺรับ]`.
  ไม่สบาย, ปวดหัว, ไปหาหมอ et ไม่เป็นไร sont bien `absent` comme vedettes : les
  relevés négatifs de la leçon sont exacts et honnêtement consignés.
- **VOLUBILIS.** Les 24 identifiants existent et disent ce qu'on leur fait dire :
  `M044`, `M4303`, `M2504`, `M122`, `P14291`, `H117`, `H269`, `M055`, `K075`,
  `K212`, `K200`, `K3420`, `M178`, `S006`, `S4340`, `S007`, `M1198`, `M3663`,
  `M537`, `M5653`, `P14354`, `P12042`, `R5638`, `K27115`. La clé `TONES` est
  bien `-x` normal, `¯x` high, `_x` low, `/x` rising, `\x` falling. La citation
  par identifiant d'entrée est effectivement plus reproductible qu'un numéro de
  ligne : la proposition portée à l'arbitrage 1 est fondée.
- **Unicode.** Toutes les chaînes thaïes du fichier sont NFC, aucune n'emploie la
  zone à usage privé, et les 14 champs `codepoints` correspondent caractère pour
  caractère aux champs `thai`. L'empilement `Top` maximal est bien de deux, dans
  กี่ seul.
- **Décomptes.** `repo-thai-scan.mjs 9 9` rend bien 5 fichiers, 46 entrées,
  40 graphies ; `1 9` rend bien 45 fichiers, 429 entrées, 317 graphies. Les
  chiffres de la Méta sont exacts et l'écart signalé avec la Méta de `u09-l9a`
  (42) existe réellement.
- **Prosodie.** Les 39 syllabes, la répartition 9 / 7 / 4 / 11 / 8 et les huit
  lignes du tableau se recomptent juste, réplique par réplique. Les 4 ไม้เอก, les
  2 ไม้โท et l'absence de ไม้ตรี et de ไม้จัตวา sont exacts. La répartition des
  particules (ครับ six fois, คะ trois fois sur les trois questions, ค่ะ une fois
  sur la seule affirmation) est exacte.
- **Tons de l'exercice 2.** Les dix dérivations sont justes, recalculées sans
  regarder la réponse annoncée : วัน et นอน moyens, กี่ et ถ่าน bas, ง่าย et
  พ่อ descendants, แล้ว et ช้อน hauts, ผม et หา montants.
- **Planchers.** Exercice 1 : les bonnes réponses occupent bien deux fois chaque
  position, plancher 2 sur 6 pour un seuil de 5 sur 6. Exercice 2 : deux tirages
  par ton, plancher 2 sur 10 pour un seuil de 8 sur 10. Exercice 3 : 6, 120 et 6
  permutations, plancher réel 0 sur 3. Exercice 4 : saisie libre, plancher 0 sur
  4, et aucune réponse ne vaut pour deux tirages. **Aucun exercice n'est
  réussissable par une réponse constante.**
- **Renvois internes.** 17 des 18 renvois d'items sont exacts (le dix-huitième
  est le finding 4). Les 13 identifiants de cartes SRS cités existent. Les
  décomptes de cartes (4 pour 9A, 5 pour 9B, 5 pour 9C, 6 pour 9D) sont exacts,
  y compris le piège de 9B, dont les cartes 06 et 07 ne sont qu'hypothétiques.
  L'inventaire des exercices de l'unité est exact.
- **Citation de `u05-l5a`.** La phrase du repère du ห muet est reprise
  littéralement, sans déformation.
- **Familles de finales.** `u09-l9a` publie bien les huit familles มาตรา d'après
  l'entrée « มาตรา » du RID, et le ย final relève bien de มาตราเกย. Le renvoi de
  l'item 1 est juste.
- **Cohérence de หมอ.** Les trois fichiers de l'unité publient la même IPA
  /mɔː˩˩˦/, le même ton montant, la même transcription `mǎww` et les mêmes
  codepoints. La divergence signalée avec 9C porte bien sur la méthode et non
  sur le fait, et la description que 9E donne de la position de 9A est fidèle.
- **Politique de contenu, partie tenue.** Aucun médicament, aucun numéro, aucune
  posologie, aucune information de secours. ยา, ร้านขายยา, เจ็บ, ท้อง, ป่วย et
  ไม่สบายใจ n'apparaissent nulle part sur un écran d'apprenant. Zéro tiret
  cadratin. Le seul manquement est le finding 3.

## Findings

### F1. BLOQUANT. หัว est traité comme un ห de tête muet, ce qui est faux

**Ce que la leçon écrit.** Six endroits rangent หัว avec หมอ parmi les mots à
« ห de tête » : la page 10 (« le ton de หมอ et celui de หัว ne se calculent pas
avec le tableau de 7A, parce que leur ห de tête fait partie des cas que 7A a
nommément mis de côté »), la note de l'item 4 (« le ห de หัว est un ห de tête,
donc son ton n'est PAS déductible »), l'exclusion nominative de l'exercice 2
(« consonne de tête ห : หัว et หมอ »), un piège de ce même exercice (« croire
que le ห de หา est muet comme celui de หมอ et de หัว »), la clause SRS
(« les tons de หมอ et de หัว ne sont donc jamais demandés en déduction ») et la
section de sources, qui écrit noir sur blanc : « หัว est ห suivi de ◌ั puis ว :
le repère s'applique aux deux », sous un titre qui affirme que le ห de หัว
« ne se prononce pas ».

**Pourquoi c'est faux, quatre preuves indépendantes.**

1. Le ห de หัว **se prononce**. L'IPA que le fichier lui-même publie à son
   item 4 est /pua̯t̚˨˩.**h**ua̯˩˩˦/. Une leçon ne peut pas écrire /h/ dans son
   champ `ipa` et « ne se prononce pas » dans sa section de sources.
2. Wiktionary, entrée « ปวดหัว », relevée par moi le 2026-08-04 : respelling
   phonémique `ปวด-หัว`, Paiboon `bpùuat-**h**ǔua`, IPA /pua̯t̚˨˩.hua̯˩˩˦/.
3. Le repère de `u05-l5a` que la leçon invoque **exclut explicitement** ce cas.
   Sa formulation, que j'ai relue mot à mot, est : « le ห se tait quand une des
   lettres ง, น, ม, ย, ว ou ร est collée juste derrière lui, **sans le moindre
   signe posé sur le ห** ». Dans หัว (U+0E2B U+0E31 U+0E27), la lettre collée
   derrière le ห n'est pas ว mais la voyelle U+0E31, qui est précisément un
   signe posé sur le ห. 5A ajoute même : « Dans ห้า et หิว, le ห porte un signe
   [...] il se prononce. » หัว est de cette famille, pas de l'autre.
4. `u09-l9b`, la leçon qui PUBLIE หัว, dit exactement le contraire, à sa page 5
   et à la note de son item 2 : « ห est l'une des consonnes hautes de 4A [...]
   le ◌ั visible sur le ห est la première moitié du graphème ◌ัว, un signe de
   VOYELLE et non de ton [...] La règle de 4A donne donc le ton montant. »

**Conséquence.** Le fichier enseigne à l'écran, page 10, qu'un mot dont le ton
est parfaitement calculable ne l'est pas, et son piège d'exercice 2 pose comme
acquis que le ห de หัว est muet, ce qui apprend à ne pas prononcer un /h/ réel.
C'est exactement le type d'erreur qui contamine la lecture de tout le
vocabulaire. Le fichier prétend par ailleurs réemployer l'item de 9B « sans
changement » et « sans divergence », alors qu'il en renverse la lecture.

**Correction.** Retirer หัว de toutes les mentions de « ห de tête » ; laisser
หมอ seul, où le mécanisme est réel. Décider ensuite si หัว rejoint les tirages
dérivables de l'exercice 2 (il l'est, par 4A) ou reste écarté pour une autre
raison écrite.

### F2. BLOQUANT. La longueur des syllabes en /aj/ est inversée dans sept items

**Ce que la leçon écrit.** Neuf valeurs de longueur, réparties sur sept items :
`mâi longue` (items 1 et 3), `mâi longue par diphtongue` (item 14),
`pai longue par diphtongue` (items 2, 8 et 10), `mǎi longue par diphtongue`
(items 8 et 9), `rai longue par diphtongue` (item 14).

**Ce que le parcours publie, relu par moi dans le dépôt le 2026-08-04.**

| Graphie   | Item publié       | `longueur` publiée                |
| --------- | ----------------- | --------------------------------- |
| ไม่       | `u04-l4d` item 1  | brève (diphtongue /aj/)           |
| ไป        | `u05-l5b` item 1  | courte                            |
| ไหม       | `u02-l2e` item 10 | courte                            |
| ไม่เป็นไร | `u02-l2c` item 3  | mâi brève ; pen brève ; rai brève |

`u01-l1d` a en outre publié la distinction elle-même, en opposant la diphtongue
brève /aj/ notée `ai` à la longue /aːj/. Un balayage de tout le corpus montre
que la formule « longue par diphtongue » **n'existe que dans `lecon-9e.md`** :
les unités 1 à 9 écrivent partout ailleurs « brève » ou « courte » pour /aj/.

**Gravité.** Ce n'est pas une coquette divergence de vocabulaire : la longueur
vocalique est une cible pédagogique du parcours (unité 1) et un champ obligatoire
du contrat d'item. L'item 14 est le même bloc que `u02-l2c` item 3, et son
dossier affirme « Aucune divergence » alors que deux syllabes sur trois sont
inversées. La ligne « Longueur : vérifiée pour l'item nouveau » du tableau des
audits est fausse, l'item nouveau portant `mâi longue`.

**Correction.** Remettre `brève` sur les neuf valeurs concernées et corriger les
trois déclarations de non-divergence qui en dépendent.

### F3. BLOQUANT. Un conseil de santé est adressé à l'apprenant, page 10

**Texte à l'écran.** « Elle ne vous dit pas quoi faire, elle ne nomme aucun
médicament et elle ne remplace personne : **si vous ne vous sentez pas bien,
parlez à un professionnel de santé.** »

La phrase se contredit en son milieu : elle annonce ne pas dire quoi faire, puis
dit quoi faire. Quelle que soit sa banalité, c'est une consigne de conduite
sanitaire adressée à l'apprenant par la voix du produit, dans une unité dont la
Méta affirme, en gras, que le fichier « ne contient aucun conseil médical ». La
règle d'audit ne souffre pas d'exception de bon sens : une leçon de langue ne
prescrit rien en matière de santé, même une évidence, même bien intentionnée.

**Correction.** Formuler la limite sans instruction, par exemple : « Thaïnaute
est un cours de langue. Il vous donne des mots, il ne donne pas de conseils de
santé et ne remplace aucun professionnel. » La Méta et la ligne « Politique de
contenu » du tableau des audits redeviennent alors exactes.

**Point voisin, non bloquant mais à confirmer à la consolidation.** La réplique 6
fait proposer par une pharmacienne d'aller voir un médecin. C'est un personnage
de fiction et un acte de langage, non une consigne au lecteur ; le dossier le
motive et l'incertitude 3 le porte déjà. Je ne le compte pas comme un
manquement, mais il gagnerait à être tranché explicitement plutôt que laissé au
lecteur.

### F4. BLOQUANT. Renvoi interne faux : สอง n'est pas l'item 2 de `u03-l3b`

**Ce que la leçon écrit**, dans les sources de son item 7 : « สอง, item 2 de
`u03-l3b`, relu le 2026-08-04 : transcription publiée `sǎwwng`, ton montant. »

**Ce que contient réellement `u03-l3b`.** L'item 2 est « le bloc six à dix ».
สอง est le **sous-item 1.2**, à l'intérieur de l'item 1, « le bloc un à cinq ».
Le fait linguistique, lui, est exact : `sǎwwng`, ton montant.

**Gravité.** Le fait est vrai, le pointeur est faux, et il est présenté comme le
résultat d'une relecture datée. C'est précisément ce que l'amendement v1.2
proscrit : une référence qu'un tiers ne peut pas refaire à l'identique. À
corriger avant tout passage en `review`, avec un balayage des autres renvois de
l'unité qui pointent vers des blocs à sous-items.

### F5. NON BLOQUANT. La garantie « deux tirages consécutifs n'ont jamais la même réponse » est fausse

L'exercice 2 annonce : « Aucune option n'est correcte plus de deux fois, l'ordre
des tirages est aléatoire, et deux tirages consécutifs n'ont jamais la même
réponse. » Or les dix tirages sont écrits par paires de même ton : 1 et 2
moyens, 3 et 4 bas, 5 et 6 descendants, 7 et 8 hauts, 9 et 10 montants. **Les
cinq paires consécutives ont donc chacune la même réponse.** Et un ordre
aléatoire ne peut pas davantage garantir la propriété annoncée : il la viole en
moyenne plus d'une fois par tirage. La leçon applique ici à elle-même exactement
le reproche qu'elle fait à l'exercice 1 de `u08-l8e`, à savoir faire reposer une
garantie sur un mélange qu'elle ne contrôle pas.

Effet mesuré : l'appariement ne rend pas l'exercice réussissable sans savoir
(espérance de 2 sur 10 pour qui exploiterait le motif), donc ce n'est pas un
défaut de plancher, mais la phrase doit être retirée ou l'ordre d'autorat
entrelacé.

### F6. NON BLOQUANT. Le compte des applications de ไม่ est faux à l'écran

La page 3 dit : « le parcours vous l'a montré cinq fois » et énumère ไม่เผ็ด,
ไม่ชอบ, ไม่ไกล, ไม่มี, ไม่ปวด. La Méta et la section « Sources et méthode du
dialogue » du même fichier en comptent **six**, en ajoutant ไม่ใช่ (`u08-l8d`),
que j'ai vérifié comme publié. Un chiffre à l'écran contredit le dossier du
même fichier.

### F7. NON BLOQUANT. L'entrée VOLUBILIS `H269` n'est pas indépendante du RID

Les sources de l'item 2 présentent `H269` comme « la seconde jambe du fait de
valeur, indépendante de l'exemple du RID ». Relevé fait : `H269` porte `RID`
dans sa colonne `DOM`, tout comme `H117`. C'est exactement la réserve que le
dossier pose lui-même plus bas (« une partie des entrées porte `RID` en colonne
`DOM` »), mais il ne l'applique pas là où elle mord.

Le fait central n'est pas menacé pour autant : il reste doublement attesté par
l'exemple imprimé du RID à « หา ๑ » et par l'entrée `P14291`, dont la colonne
`DOM` ne porte que `MEDIC ; (Covid-19)`. Seule la qualification d'indépendance
de `H269` est à retirer.

### F8. NON BLOQUANT. « Le fichier n'affirme rien sur le français » est inexact

Le tableau des audits porte « Phonétique française : SANS OBJET, le fichier
n'affirme rien sur le français », appuyé sur un balayage de quatre formules
figées. Le balayage est honnête, mais il mesure des chaînes de caractères, pas
des affirmations. Le fichier affirme bien des choses sur le français dans du
texte destiné à l'écran :

- page 4 : « C'est l'ordre naturel d'une conversation, en thaï comme en
  français » ;
- note culturelle : « C'est la même famille de sens que le français répartit
  entre "aller bien", "être à l'aise" et "être confortable" » ;
- note culturelle : « vous ne demandez pas "comment allez-vous" au sens
  français ».

Aucune n'est un fait de PHONÉTIQUE, donc la section 1 bis de
`docs/content-policy/sources-verification.md` n'est pas violée au sens strict,
et les trois sont vérifiables par l'apprenant, qui est locuteur natif du
français. La ligne du tableau doit néanmoins être reformulée en « aucune
affirmation de phonétique française », faute de quoi elle promet plus qu'elle ne
tient.

### F9. NON BLOQUANT. La règle de réponse par écho du verbe est énoncée à l'écran et non sourcée comme règle

La page 8 énonce : « En thaï, on répond souvent à une question fermée en
reprenant le verbe de la question, puis en ajoutant sa particule », et invoque
comme preuve le `ไปค่ะ` imprimé par le RID à l'entrée « ค่ะ ». J'ai vérifié cet
exemple : il existe, avec `ไม่ไปค่ะ` en second. Mais un exemple d'entrée de
particule atteste une FORME, pas une stratégie de réponse générale. Le dossier
du fichier le reconnaît d'ailleurs, à propos de la réplique 3 : « C'est la
stratégie de réponse thaïe ordinaire, mais aucune source de la politique du
projet ne l'énonce comme règle. » L'écran affirme donc ce que le dossier déclare
non sourcé.

Correction possible sans perte pédagogique : ramener la page 8 à ce qui est
attesté (« le dictionnaire lui-même imprime ไปค่ะ en réponse ») et réserver la
généralisation à une leçon appuyée sur une grammaire de référence.

### F10. NON BLOQUANT. L'inventaire des tons dérivables du dialogue est faux et incohérent

Le préambule de l'exercice 2 écrit : « seuls **quatre** ont un ton dérivable
[...] à savoir กี่, แล้ว, ผม et หา, **auxquels s'ajoutent** วัน et สอง ». La
phrase se dément en son milieu : ils sont six. Et l'inventaire est incomplet à
deux titres : หัว est dérivable (finding 1), et ni ดี, syllabe de สวัสดี, ni
คุณ, syllabe de ขอบคุณ, ne figurent dans l'exclusion des syllabes mortes ni dans
la liste des dérivables, alors que toutes deux le sont (moyennes).

Aucune conséquence sur les tirages, qui sont justes ; conséquence réelle sur la
justification écrite d'aller chercher la moitié des tirages hors du dialogue.

### F11. NON BLOQUANT. Un piège de l'exercice 3 décrit la bonne réponse comme une erreur

Pièges connus du tirage 2 : « écrire คะ au tirage 2 sans voir que la locutrice
interroge, bien que ce tirage ne propose que คะ et ครับ ». Or คะ **est** la
réponse correcte du tirage 2, et la subordonnée qui suit le reconnaît. Le piège
visé est vraisemblablement ค่ะ, qui n'est pas proposé. Passage à réécrire ou à
supprimer.

### F12. NON BLOQUANT. Le champ `codepoints` de l'item 9 ne couvre qu'une des deux graphies

L'item 9 porte `thai` = « ปวดหัวไหมครับ / ปวดหัวไหมคะ » mais ne donne la séquence
que de la forme féminine. Les items 3, 6, 8 et 10, construits sur le même moule,
donnent les deux. Le contrat d'item exige la séquence exacte de la graphie mise
à l'écran ; ici la forme masculine, employée par la transcription et par
l'exercice 3, n'en a pas.

## Points examinés et écartés, pour éviter qu'ils ne soient rouverts

- **Distinction ปวด contre เจ็บ.** 9E ne l'enseigne pas et ne l'affirme nulle
  part : เจ็บ est écarté avec un motif écrit, et la question est renvoyée à la
  carte fermée `srs-u09-l9b-05`. Rien à signaler.
- **Exercices réussissables sans savoir.** Les quatre planchers ont été
  recalculés indépendamment. Aucun n'est franchissable par une réponse
  constante. La contrainte de production audio du tirage 6 de l'exercice 1, qui
  empêche de trancher le genre au timbre, est présente.
- **Écart de citation VOLUBILIS.** Le fichier cite le `.ods` par identifiant
  d'entrée au lieu du `.xlsx` par numéro de ligne. J'ai vérifié que le `.xlsx`
  présent sur le poste est bien une page 404 de 154 octets et que le `.ods` a
  l'empreinte annoncée. L'écart à l'amendement v1.3 est réel, documenté, et la
  proposition portée à l'arbitrage 1 est meilleure que la règle en vigueur.
  Ce n'est pas un finding contre la leçon.
- **Divergence sur la dérivation du ton de หมอ.** L'incertitude 2 décrit
  fidèlement les positions de 9A, 9C et 9E, y compris la déclaration de
  `u09-l9a` sur les tons jamais demandés en lecture. C'est un arbitrage d'unité,
  pas une erreur de ce fichier.
- **Écart de décompte avec la Méta de `u09-l9a`** (42 contre 40) : réel,
  signalé par le fichier plutôt que masqué, à trancher à la consolidation.

## Conclusion

Le dossier de preuve de `u09-l9e` est, dans sa très grande majorité, exact :
sur 121 faits re-vérifiés, quatre seulement sont pris en défaut, et deux d'entre
eux (F1 et F2) viennent du même geste, celui de décrire un mot réemployé
autrement que la leçon qui l'a publié tout en déclarant le réemployer sans
modification.

Aucun passage en `review` avant correction de F1, F2, F3 et F4. F1 est le plus
grave : il enseigne à l'écran une lecture fausse d'un mot central de l'unité,
contre l'IPA du fichier lui-même, contre la leçon qui publie le mot et contre le
repère qu'il invoque.

---

# Contre-audit adversarial, TOUR 2, du 2026-08-04

- Fichier audité : `content/authoring/unite-09/lecon-9e.md`, version consolidée
  après le tour 1.
- sha256 au moment de ce tour :
  `a642550675d4d4371d4935c446a409abc4497514d9d9c6bb4f8706c4fc6108c8`
  (176 040 octets, relevé par `unicode-thai.mjs`).
- Posture : adversariale. Aucune source citée par la leçon n'a été crue sur
  parole, y compris les corrections annoncées au tour 1. Chaque relevé a été
  refait par les scripts versionnés, par consultation directe des sources, ou
  par lecture des fichiers du dépôt.
- Résultat : **123 faits confirmés par moi-même**, **12 findings**, dont
  **5 bloquants**.

## Ce qui a été refait, instrument par instrument

| Instrument                                | Ce que j'ai produit moi-même                                                                                                                                                                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rid-lookup.mjs`                          | 6 relevés de présence : ไม่สบาย, ไปหาหมอ, ปวดหัว, ไม่เป็นไร (absents), สบาย, หมอ (attestés)                                                                                                                                                                       |
| `rid-entry.mjs`                           | 16 articles lus en entier : หา, สบาย, หมอ, ปวด, ไหม, ค่ะ, ครับ, กี่, วัน, ผม, แล้ว, มาก, ไม่, ดิฉัน, ไป, et « มาตรา » pour les finales                                                                                                                            |
| `volubilis-codes.mjs` sur `VOLUBILIS.ods` | feuille `Volubilis` dépouillée en entier (118 577 lignes), 26 identifiants relevés un par un, colonne `DOM` lue pour chacun, feuille `Codes` pour la clé `TONES` et pour le sens du marqueur `RID`                                                                |
| `unicode-thai.mjs`                        | NFC, zone à usage privé, 14 champs `thai` et leurs séquences                                                                                                                                                                                                      |
| `item-fields-check.mjs`                   | sur 9E, puis `--tout` sur les 45 leçons                                                                                                                                                                                                                           |
| `repo-thai-scan.mjs`                      | `1 8`, `1 9`, `9 9`                                                                                                                                                                                                                                               |
| Wiktionary en rendu                       | 5 entrées : ไม่สบาย, หา, หมอ, ปวดหัว, สบาย                                                                                                                                                                                                                        |
| Lecture directe du dépôt                  | 23 pointeurs d'items, les cartes SRS des 5 leçons de l'unité, l'inventaire des mécaniques d'exercice de l'unité, `u05-l5a` page 5, `u07-l7a` page 10, `u09-l9a` Méta et pages 5 et 7, `u09-l9c` item 5, dialogues de `u02-l2e`, `u06-l6e`, `u07-l7e` et `u08-l8e` |
| Recalcul par moi                          | 39 syllabes du dialogue et leur ton, les 8 lignes du tableau de tons, les marques, l'empilement `Top`, les 10 dérivations de ton de l'exercice 2, les 4 planchers, le balayage des formules sur le français                                                       |

Empreintes recalculées et confirmées : `VOLUBILIS.ods` = 15 724 718 octets,
sha256 `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc` ;
`%TEMP%/VOLUBILIS_Database.xlsx` = 154 octets, sha256
`8cf5ce27d21490c24eedf91e0ac2bc4a748ba8f4eb20cb7c1fc9442d2d580008`, et son
contenu est bien une page HTML « 404 Not Found ». Les chiffres de
`repo-thai-scan.mjs` cités par la leçon tombent juste (40/383/283, 45/429/317,
5/46/40). `item-fields-check.mjs --tout` rend bien 45 fichiers, 18 champs
`codepoints` en faute et 38 écarts de réemploi, et 0 puis 7 pour 9E seul.

## Les priorités de la commande, traitées d'abord

### Politique de contenu santé : aucun conseil, aucun numéro, aucune posologie

Balayage fait sur tout le fichier. **Aucun conseil médical, aucun numéro
d'urgence, aucun nom de médicament, aucune posologie et aucune information
pratique de secours** ne subsistent sur un écran d'apprenant. La suppression
annoncée au tour 1 (F3) est réelle. Le seul contenu à coloration sanitaire est
la réplique 6, où un personnage de fiction demande `ไปหาหมอไหมคะ` ; c'est une
formulation de langue, elle est encadrée par la page 10 et signalée par
l'incertitude 3. **Ce n'est pas un finding.**

### Distinction ปวด contre เจ็บ

9E n'énonce **aucune** distinction entre les deux : เจ็บ est écarté et le motif
renvoie à la carte `srs-u09-l9b-05`. Vérifié dans `u09-l9b` : la carte existe et
son jeu de tirages est bien borné. **Aucun finding.** Pour mémoire, l'entrée
« ปวด » du RID définit le verbe par รู้สึกเจ็บต่อเนื่องอยู่ในร่างกาย, ce qui
confirme que les deux mots ne sont pas interchangeables mais ne trace pas la
frontière ; 9E a raison de ne pas la tracer.

### Affirmations sur le français, section 1 bis

Balayage refait par script, espaces normalisés. Les quatre formules nommées par
l'arbitrage 2 de `u08-l8a` apparaissent **exactement une fois chacune**, et les
quatre sont dans la phrase d'auto-contrôle. Les trois affirmations réelles sur le
français (page 4, note culturelle deux fois) portent sur du sens et de l'ordre
des mots, jamais sur la phonétique : elles relèvent du point 2 de la section
1 bis, « reformulé en observation vérifiable par l'apprenant », qui est locuteur
natif du français. **Aucun finding.**

### Exercices réussissables par une réponse constante

Recalculés un par un. Exercice 1 : bonnes réponses aux positions 1, 2, 3, 2, 3,
1, donc deux par position, plancher 2/6 pour un seuil de 5/6. Exercice 2 : deux
tirages par ton, plancher 2/10 pour un seuil de 8/10, et l'ordre d'autorat
alterne réellement (moyen, bas, descendant, haut, montant, puis de nouveau).
Exercice 3 : aucune réponse constante ne passe. Exercice 4 : saisie libre, et les
quatre attendus n'ont aucun mot commun hormis la particule finale, différente au
tirage 2. **Aucun exercice n'est réussissable sans savoir.** Une justification de
plancher est en revanche fausse, voir T2-N2.

### Correspondances de finales

C'est là que se trouve le finding le plus grave de ce tour, voir T2-B1. Le fait
de langue lui-même est confirmé par le RID : à l'entrée « มาตรา », sens (๒),
ถ้ามีตัว ย สะกด จัดอยู่ในมาตราเกยหรือแม่เกย. Le ย final EST une consonne finale
d'une famille nommée. Ce n'est pas la leçon 9A qui le publie.

## Findings

### T2-B1, BLOQUANT : la finale ย de บาย est attribuée à `u09-l9a`, qui publie l'inverse à l'écran

La Méta de 9E écrit : « **la finale ย de บาย est désormais couverte**, 9A
publiant les familles de fin du dictionnaire, dont มาตราเกย, celle du ย final. »
La note de l'item 1 écrit : « Le pourquoi est publié par `u09-l9a`, qui nomme
cette famille มาตราเกย d'après le dictionnaire normatif. »

Relevé fait dans `u09-l9a` le 2026-08-04 :

- sa Méta énumère les familles enseignées : « les familles utiles à ce stade
  sont celles du `k`, du `t`, du `p`, du `n`, du `ng` et du `m` ; **ย et ว se
  rattachent à la voyelle**, comme `u06-l6a` l'a déjà dit » ;
- sa **page 5**, donc un écran d'apprenant, affiche en spécimen la même ligne :
  « ย et ว se rattachent à la voyelle, comme la page 8 de 6A vous l'a montré » ;
- sa page 7 renforce le point avec เสีย et ตัว ;
- son tableau de correspondances (7 lignes) ne porte que `k`, `t`, `t`, `p`,
  `n`, `ng`, `m`. Ni มาตราเกย ni มาตราเกอว n'y figurent ;
- มาตราเกย n'apparaît dans 9A que dans son dossier de production, à l'intérieur
  du relevé de l'entrée « มาตรา » du RID, jamais dans son Enseignement.

Donc : 9E fait dire à 9A le contraire de ce que 9A publie. Trois conséquences,
et la troisième est la pire.

1. **Référence mal citée**, au sens du critère bloquant.
2. **La couverture annoncée n'existe pas** : rien dans le parcours ne dit à
   l'apprenant pourquoi le ย de บาย est une consonne finale. Le seul appui réel
   est `u08-l8a`, dont le contre-audit a établi que « ง่าย EST bien une consonne
   finale » et qu'elle « relève de la série en ย » ; cette moitié de la citation
   de 9E est exacte.
3. **Contradiction d'unité non signalée, sur une correspondance de finale.**
   L'exercice 2 de 9E écrit au tirage 3 « ง่าย, ... vivante par la finale ย » et
   au tirage 4 « แล้ว, ... vivante par la finale ว », c'est-à-dire exactement ce
   que la page 5 de 9A interdit de penser. Les réponses de ces deux tirages
   restent justes (la syllabe est vivante de toute façon, par sa voyelle longue),
   mais un apprenant qui a lu 9A ne peut pas suivre le raisonnement de 9E.

Le fait de langue est du côté de 9E : le RID, entrée « มาตรา » sens (๒), range ย
dans มาตราเกย et ว dans มาตราเกอว. C'est donc **9A qui est fautive sur le fond et
9E qui est fautive sur la citation**. Correction minimale pour 9E : retirer
l'attribution à 9A, s'appuyer sur `u08-l8a` seul, et porter la contradiction à la
consolidation de l'unité comme une divergence de plus, au même titre que celle
sur le ton de หมอ.

### T2-B2, BLOQUANT : `srs-u09-l9a-04` est citée trois fois pour ce qu'elle ne dit pas

9E écrit, à sa section de coordination SRS : « 9A porte `srs-u09-l9a-04`, qui
déclare elle-même ne demander les tons de เจ็บ, ปวด et หมอ qu'en reconnaissance
à l'écoute et **jamais en lecture**. » La même affirmation est reprise à la
section « Sources du fait "le ห de หมอ ne se prononce pas" » et à l'incertitude 2.

Texte réel de la carte, relevé dans `u09-l9a` :

> `srs-u09-l9a-04` : vocabulaire nouveau du jour, เจ็บ, ปวด, หมอ, แพทย์, โรค,
> อาการ, โรงพยาบาล et โทรศัพท์, et eux seuls. Critère : reconnaissance **à
> l'écoute et à la lecture**, 2 réussites espacées.

Trois écarts, tous vérifiables en une lecture :

- ce n'est **pas une carte de ton**, c'est une carte de vocabulaire ;
- elle ne parle **pas** de ton ;
- elle exige explicitement la reconnaissance **à la lecture**, soit le contraire
  du « jamais en lecture » que 9E lui prête.

Ce point n'est pas décoratif : c'est l'un des deux piliers sur lesquels 9E appuie
sa recommandation d'arbitrage de l'incertitude 2, déclarée bloquante pour le
passage en `review`. Le second pilier, lui, est exact : la Méta de 9A range bien
« la consonne de tête, qui commande le ton de หมอ » parmi ce qu'elle n'ouvre pas,
relevé confirmé. La recommandation survit donc, mais elle doit cesser de
s'appuyer sur une carte qui dit autre chose.

Effet secondaire à corriger aussi : la conclusion « lire un ton n'est mesuré
nulle part ailleurs dans l'unité » reste vraie (aucune carte ni aucun exercice
des quatre autres leçons ne demande le ton d'un mot LU, vérifié un par un), mais
le motif écrit pour l'établir est faux.

### T2-B3, BLOQUANT : `u09-l9c` citée deux fois comme citant des numéros de ligne du `.xlsx`, alors qu'elle déclare le `.xlsx` inutilisable

9E écrit, au dossier VOLUBILIS : « **Les leçons 9B et 9C citent pourtant des
numéros de ligne du `.xlsx` le même jour** », et le répète à l'arbitrage 1 :
« dans le même temps, `u09-l9b` et `u09-l9c` citent des numéros de ligne du
`.xlsx` datés du même jour ».

Relevé fait dans les quatre fichiers :

- `u09-l9a` cite bien des numéros de ligne du `.xlsx` (ligne 19427 pour เจ็บ,
  ligne 79445 pour ปวด) ;
- `u09-l9b` aussi (lignes 79445, 16463) ;
- **`u09-l9c` fait exactement le contraire** : elle cite « par identifiant
  d'entrée et non par numéro de ligne », et écrit « **Le `.xlsx` est INUTILISABLE
  sur ce poste** ». Elle a constaté la même page 404 que 9E ;
- `u09-l9d` documente elle aussi l'indisponibilité.

Le constat de fond de 9E survit, puisque `u09-l9a` et `u09-l9b` citent bien le
`.xlsx`, mais la leçon nommée est fausse et elle est nommée pour l'inverse de ce
qu'elle fait. Substituer `u09-l9a` à `u09-l9c` aux deux endroits.

### T2-B4, BLOQUANT : item 10, fait mono-sourcé, et la déclaration « colonne `DOM` relevée entrée par entrée » est fausse

L'item 10 (ไปครับ / ไปค่ะ) fonde la valeur affirmative propre des deux particules
sur deux jambes : le RID, et VOLUBILIS `K075` et `K212`.

Relevé refait sur le `.ods` :

- `K075` (ค่ะ) : colonne `DOM` = `CHAT ; RID ; TOURIST` ;
- `K212` (ครับ) : colonne `DOM` = `RID ; TOURIST` ;
- `K200` (ขอบคุณ), employée à l'item 13 : colonne `DOM` = `RID`.

La feuille `Codes` définit `RID` comme « Royal Institute Dictionary (2011) ».
Par la doctrine que 9E s'est elle-même donnée au finding 7 du tour 1 (« leur
colonne `DOM` porte `RID` ... elles ne comptent donc jamais comme jambe
indépendante du dictionnaire »), ces trois entrées ne sont **pas** indépendantes
du RID. La valeur affirmative de ครับ et ค่ะ repose donc sur le RID et sur un
dérivé du RID : **fait mono-sourcé**, exactement le défaut que le tour 1 avait
fait corriger pour `H269`.

Aggravant, et c'est ce qui rend le point bloquant plutôt que rattrapable : le
dossier de 9E écrit « **Colonne `DOM` relevée entrée par entrée le 2026-08-04** :
`H117` et `H269` portent `RID` ... ; `M122`, `P14291`, `M044`, `M4303`, `H046`
et `P222` ne le portent pas. » La liste passe sous silence `K075`, `K212` et
`K200`, qui le portent. Une déclaration de relevé exhaustif qui omet les trois
seules entrées où l'indépendance était en jeu n'est pas un oubli neutre.

Pour la suite du travail, voici le relevé complet que j'ai fait. Entrées citées
qui ne portent PAS `RID` : `M044`, `M4303`, `M2504`, `M122`, `P14291`, `H046`,
`P222`, `M055` (`TOURIST`), `M178` (`INSOLITE ; SOCIO ; TOURIST`), `K3420`
(aucun domaine), `S006` (`MEDIC`), `S007` (aucun), `S4340` (`INSOLITE`),
`P14354`, `P12042`, `R5638`, `K27115`, `M1198`, `M3663`. Entrées qui le
portent : `H117`, `H269`, `K075`, `K212`, `K200`, `M537`, `M5653`.

### T2-B5, BLOQUANT : page 7, une affirmation fausse sur le parcours, à l'écran

Page 7 de l'Enseignement, donc devant l'apprenant : « C'est la règle de 2B, et
c'est **la première fois du parcours** qu'un seul personnage vous la montre
quatre fois de suite. »

Relevé fait sur les dialogues des 45 leçons :

- `u02-l2e`, **unité 2**, Nok, quatre tours consécutifs : สวัสดีค่ะ ;
  ดิฉันชื่อนกค่ะ คุณชื่ออะไรคะ ; คุณมาจากฝรั่งเศสไหมคะ ; แล้วเจอกันค่ะ. Soit
  cinq particules, trois ค่ะ sur affirmation et deux คะ sur question, par un seul
  personnage, sur quatre tours ;
- `u06-l6e`, la femme, quatre tours, six particules, quatre ค่ะ sur affirmation
  et deux คะ sur question ;
- `u07-l7e` (นก, six particules) et `u08-l8e` (la vendeuse, sept particules)
  montrent aussi la règle à répétition chez une seule locutrice.

L'affirmation est donc fausse, et elle l'est au moins depuis l'unité 2. La
formulation voisine de la section Dialogue (« la démonstration **la plus nette**
du parcours ») est du même ordre : `u06-l6e` porte six particules chez la même
locutrice contre quatre ici. Le fait pédagogique intéressant (trois questions en
คะ et une affirmation en ค่ะ chez le même personnage) n'a pas besoin d'un
superlatif faux ; retirer « la première fois du parcours » suffit.

### T2-N1, non bloquant : le tableau Unicode n'est pas ce qu'il annonce

Le tableau est introduit par « Le tableau ci-dessous donne les séquences que la
leçon met à l'écran, items et répliques compris ». Il en compte seize. Sont
affichées à l'écran et absentes du tableau, au minimum : les dix tirages de
l'exercice 2 (วัน, กี่, ง่าย, แล้ว, ผม, นอน, ถ่าน, พ่อ, ช้อน, หา), เรียกหมอ
(spécimen page 6), สบาย, สบายดี et สบายดีไหม (pages 2 et 3 et note culturelle),
ไปค่ะ (spécimen page 8), ดิฉันไม่สบายค่ะ, กี่วันแล้วครับ, ไปหาหมอไหมครับ,
ไม่เป็นไรค่ะ, et les jetons de l'exercice 3. Aucun défaut Unicode réel :
`unicode-thai.mjs` confirme que **les 210 chaînes thaïes du fichier sont NFC** et
qu'aucun caractère de la zone à usage privé n'y figure. C'est la portée annoncée
du tableau qui est fausse, pas son contenu. Les décomptes internes au tableau
(cinq chaînes commençant par U+0E44, trois en portant une ailleurs, empilement
maximal de deux dans กี่) sont exacts, je les ai recomptés.

### T2-N2, non bloquant : la justification du plancher de l'exercice 3 est fausse

« Il n'existe aucune réponse constante : les trois tirages n'ont ni la même
longueur, ni les mêmes éléments, ni le même intrus. » Les tirages 1 et 3 ont la
**même longueur** (quatre jetons proposés, trois retenus) et le **même intrus**
(ค่ะ). La conclusion, elle, tient : les séquences attendues diffèrent
(ผม ไม่สบาย ครับ contre ปวดหัว มาก ครับ), donc aucune réponse constante ne
réussit et le plancher reste 0/3. C'est la même espèce de défaut que le finding 5
du tour 1 : une garantie exacte adossée à une raison fausse.

### T2-N3, non bloquant : l'inventaire des syllabes dérivables reste incomplet

Le préambule de l'exercice 2 dit avoir refait l'inventaire « mot à mot » et
conclut : « S'y ajoutent deux SYLLABES dérivables, toutes deux moyennes, ดี dans
สวัสดี et คุณ dans ขอบคุณ ». Il en manque deux, toutes deux moyennes elles aussi :

- **บาย** dans สบาย : บ moyenne, syllabe vivante (voyelle longue), aucune marque,
  donc ton moyen ;
- **เป็น** dans ไม่เป็นไร : ป moyenne, syllabe vivante (finale น), aucune marque,
  donc ton moyen.

Par ailleurs la liste nominative des syllabes mortes écartées (« ค่ะ, ครับ, มาก,
ปวด, ขอบ, et les deux premières syllabes de สวัสดี ») omet **คะ**, qui est dans
le dialogue trois fois. Aucun effet sur les tirages ; effet réel sur la valeur de
preuve d'un inventaire annoncé exhaustif.

### T2-N4, non bloquant : la Méta et la section Exercices ne comptent pas la même chose

La Méta écrit que « 9B, 9C et 9D portent chacune un exercice de ton à l'écoute »
et qu'« un **quatrième** exercice auditif de ton dans la même unité serait de la
répétition ». La section Exercices et l'incertitude 1 comptent correctement
**quatre** exercices auditifs de ton (9A exercice 3, 9B exercice 2, 9C exercice 2,
9D exercice 1), ce qui ferait de 9E le **cinquième**. Relevé confirmé dans les
quatre fichiers. Le raisonnement est bon, le décompte de la Méta est en retard
d'une leçon.

### T2-N5, non bloquant : trois citations VOLUBILIS tronquées ou réordonnées sans marque

- `M122` : la colonne `FRA` est citée « médecin [m] ; docteur [m] » alors qu'elle
  porte sept gloses (« ... ; doctoresse [f] ; toubib [m] (fam.) ; thérapeute [m] ;
  praticien [m] ; praticienne [f] »). Le dossier se félicite précisément d'avoir
  recopié la colonne `DOM` « en entier » ; la colonne `FRA` de la même entrée ne
  l'est pas.
- `M178` : la colonne `DOM` est citée `SOCIO ; TOURIST`, elle porte
  `INSOLITE ; SOCIO ; TOURIST`. La colonne `FRA` est citée dans un ordre modifié
  et amputée de « ce n'est pas grave » et « tant pis ».
- `S007` : `FRA` citée « confortable ; douillet ; à l'aise ; décontracté », le
  champ réel étant « confortable ; douillet ; intime ; cosy ; décontracté ; bien
  ajusté ; à l'aise ; relax ».

Aucun fait de langue n'en dépend, mais une citation entre guillemets doit être
soit intégrale, soit marquée comme partielle.

### T2-N6, non bloquant : Wiktionary « หา », l'ordre des exemples est inversé

9E écrit : « ... avec เธอหาหมอคนนี้เดือนละครั้ง ... parmi ses exemples imprimés,
et **มาหาใคร dans le second** ». Consultation refaite : le sens 3 porte deux
exemples, et มาหาใคร est le **premier** (สวัสดีค่ะ มาหาใครคะ),
เธอหาหมอคนนี้เดือนละครั้ง le second. Le reste de la citation est exact :
IPA /haː˩˩˦/, Paiboon `hǎa`, quatre sens verbaux, le troisième étant « to visit;
to see; to meet ».

### T2-N7, non bloquant : « aucun écart, sur aucun champ » est plus large que ce que l'outil mesure

Le dossier écrit : « Les items 5, 11 et 14 ne rendent AUCUN écart, sur aucun
champ. » `item-fields-check.mjs` ne compare que cinq champs (`ipa`, `ton`,
`longueur`, `transcription`, `codepoints`). Sur ces cinq, la phrase est vraie, je
l'ai refaite. Sur le champ `registre`, l'item 5 diverge : `u09-l9a` item 3 et
`u09-l9c` item 5 écrivent « neutre », 9E écrit « neutre au sens enseigné ». Écart
de notation, sans conséquence de langue, mais la formule « sur aucun champ »
n'est pas soutenable.

## Ce que j'ai re-vérifié et qui est EXACT

Cette section compte autant que la précédente, et elle est plus longue.

**Sources externes.** Les seize articles du RID lus en entier confirment, mot
pour mot, ce que la leçon leur fait dire : « หา ๑ » sens (๑) มุ่งพบ, พบ avec
ไปหาหมอ en **premier exemple imprimé** et เพื่อนมาหา en second, sens (๒) เยี่ยม,
เยี่ยมเยียน ; « ไหม ๒ » mot de question issu de หรือไม่ avec กินไหม pour
**unique** exemple ; « ค่ะ » avec ไปค่ะ et ไม่ไปค่ะ imprimés ; « ครับ » avec la
lecture [คฺรับ] ; « สบาย » et ses six sens, le (๕) ไม่เจ็บไม่ไข้ avec
เวลานี้เขาสบายดี ไม่ป่วยไข้, et la lecture **[สะบาย]** dont j'ai recalculé la
séquence, U+0E2A U+0E30 U+0E1A U+0E32 U+0E22 ; « กี่ ๒ » avec กี่วัน et กี่บาท ;
« วัน ๑ » dont les exemples placent bien le nombre devant วัน ; « ผม ๒ » pronom
masculin poli, « ผม ๑ » les cheveux ; « แล้ว » adverbiale en première vedette ;
« มาก » avec คนมาก, น้ำมาก, กินมาก ; « หมอ ๑ » avec ses deux sens et les vedettes
2 (ปาก) et 3 (le poisson) ; « ไม่ » qui nie le mot suivant avec ไม่กิน et ไม่ดี ;
« ดิฉัน » féminin poli ; « ไป » qui porte bien
ผมขอให้คุณเดินทางไปหาผมวันอาทิตย์นี้. J'ai aussi compté les ลูกคำ de « ไม่ » :
**71**, donc « plus de soixante-dix » est juste, et ni ไม่สบาย ni ไม่เป็นไร n'y
figurent, tandis que ไม่เป็นการ, ไม่เป็นท่า et ไม่เป็นเรื่อง y sont.

Les quatre relevés négatifs sont confirmés : ไม่สบาย, ไปหาหมอ, ปวดหัว et
ไม่เป็นไร ne sont pas des vedettes du RID.

Les 26 identifiants VOLUBILIS existent tous et portent les valeurs citées, y
compris la clé `TONES` (`-x` normal, `¯x` high, `_x` low, `/x` rising,
`\x` falling), la lecture `[หฺมอ]` de `M122` avec son พินทุ contre le `[หัว]` de
`H046` qui n'en a pas, et `[ไม่ สะ-บาย]` en trois syllabes à `M044`.

Les cinq entrées Wiktionary existent et disent ce qu'on leur fait dire, IPA
comprise : /maj˥˩.sa˨˩.baːj˧/, /haː˩˩˦/, /mɔː˩˩˦/, /pua̯t̚˨˩.hua̯˩˩˦/,
/sa˨˩.baːj˧/.

**Faits de langue de l'item nouveau.** ไม่สบาย : graphie, séquence NFC, IPA, ton
par syllabe (descendant, bas, moyen), longueur (brève, brève, longue), sens,
registre neutre (aucune étiquette au RID sur สบาย, aucune sur Wiktionary),
segmentation en deux temps attestée par la lecture [สะบาย] du dictionnaire. Le
sens non enseigné « triste » est bien celui de `M2504`, et ไม่สบายใจ est bien un
autre mot (`M1198`, `M3663`).

**Le dialogue, recompté par moi, réplique par réplique.** 39 syllabes ; 9 au ton
moyen, 7 bas, 4 descendants, 11 hauts, 8 montants ; les **huit lignes** du tableau
de tons de la leçon sont justes, aucune ne s'écarte d'une unité. Quatre ไม้เอก
(deux dans ไม่, un dans กี่, un dans ค่ะ), deux ไม้โท (les deux dans แล้ว), zéro
ไม้ตรี, zéro ไม้จัตวา. Profondeur maximale d'empilement `Top` : deux, dans กี่
seul.

**Les dix dérivations de ton de l'exercice 2 sont toutes correctes**, classe par
classe et marque par marque, et les dix réponses concordent avec les items
publiés que j'ai relus (วัน moyen, กี่ bas, ง่าย descendant, แล้ว haut, ผม
montant, นอน moyen, ถ่าน bas, พ่อ descendant, ช้อน haut, หา montant).

**Pointeurs internes.** Les 23 renvois d'items que j'ai résolus tombent tous
juste, y compris les deux corrigés au tour 1 : สอง est bien le **sous-item 1.2**
de l'item 1 de `u03-l3b`, et `u03-l3b` est bien le seul des 45 fichiers à
employer des sous-items ; เจ็บ est bien l'item **6** de `u09-l9b`, dont l'item 4
est ท้อง. Les décomptes de cartes SRS sont exacts (4 pour 9A, 5 pour 9B, 5 pour
9C, 6 pour 9D) : les cartes `srs-u09-l9b-06` et `-07` mentionnées dans 9B sont
hypothétiques et n'existent pas, ce que 9E a correctement ignoré. L'inventaire
des mécaniques est exact (`association` en 9A ex. 2, 9B ex. 3, 9C ex. 3, 9D
ex. 3 ; les deux `reading` de 9A portent sur le son de fin et sur la lettre
muette, jamais sur le ton).

**Citations d'écrans du parcours.** La formulation du ห muet de `u05-l5a` page 5
est reproduite exactement, y compris la condition « sans le moindre signe posé
sur le ห » qui exclut หัว. La page 10 de `u07-l7a` écarte bien nommément les mots
à consonne de tête. La divergence avec `u09-l9c` est réelle : son item 5 dérive
le ton par la règle de 4A et porte même un champ `derivation_du_ton` qui
reconnaît le désaccord avec 9A et 9E. La réserve de la Méta de 9A sur « la
consonne de tête, qui commande le ton de หมอ » existe bien. La décision de 9B
d'écarter ไม่สบาย « pour une raison de périmètre et non de source » est citée
mot pour mot.

**Les corrections annoncées au tour 1 sont réelles.** F1 : หัว est partout
présenté comme un mot dont le ton se calcule, et les deux sources ajoutées
(`H046`, `P222`) existent et prouvent le /h/. F2 : plus aucune ligne `longueur`
ne porte « longue par diphtongue ». F3 : le conseil de santé a disparu. F4 : le
pointeur de สอง est juste. F5 : l'ordre d'autorat alterne réellement. F12 et le
troisième défaut de consolidation : les 14 champs `codepoints` se recalculent,
`item-fields-check.mjs` sort en code 0 sur ce fichier.

## Conclusion du tour 2

Le dossier reste, pour l'essentiel, solide : sur 123 faits re-vérifiés, 111
tiennent sans réserve, et tous les faits de langue de l'item nouveau, tous les
tons du dialogue et toutes les dérivations de l'exercice 2 sont exacts. Les douze
findings de ce tour ne portent presque jamais sur du thaï : ils portent sur ce
que la leçon fait dire aux fichiers voisins et aux colonnes des bases.

Quatre des cinq bloquants procèdent du même geste que les bloquants du tour 1 :
**écrire ce qu'une autre source dit sans la rouvrir**. T2-B1, T2-B2 et T2-B3
attribuent à trois fichiers du dépôt des contenus qu'ils ne portent pas, et
T2-B4 déclare un relevé exhaustif qui omet précisément les trois entrées où la
question se posait. Le tour 1 avait diagnostiqué ce risque et fait écrire
`item-fields-check.mjs` ; l'outil compare des champs d'items, il ne lit ni les
pages d'enseignement, ni les cartes SRS, ni les colonnes `DOM`. La dette signalée
à l'arbitrage 3 est donc plus large que ce que l'outil couvre.

**Aucun passage en `review` avant correction de T2-B1 à T2-B5.** T2-B1 est le
plus grave : il annonce couverte une correspondance de finale qui ne l'est pas,
et il place deux leçons de la même unité en contradiction ouverte sur ce que
l'apprenant doit penser d'un ย en fin de mot, sans que la contradiction soit
signalée nulle part. Le fait de langue, lui, est du côté de 9E : c'est `u09-l9a`
qu'il faudra corriger, et 9E qui doit cesser de s'en réclamer.
