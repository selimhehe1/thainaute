# Contre-audit adversarial de `lecon-11a.md`

- Fichier audité : `content/authoring/unite-11/lecon-11a.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent de contre-audit interne, consigne adversariale
- Politique appliquée : `content/authoring/CONVENTIONS.md` (v1, amendements v1.1,
  v1.2, v1.3, arbitrage sur les digrammes, fil des tons) et
  `docs/content-policy/sources-verification.md`, sections 1 bis et 1 ter
- Méthode : aucun chiffre, aucune citation et aucun réemploi de la leçon n'a été
  admis sur parole. Tout a été réexécuté ou re-consulté depuis les artefacts
  d'origine. Les empreintes des quatre artefacts externes ont été recalculées
  AVANT toute lecture de ligne.

## Verdict

**18 findings, dont 10 bloquants.** Le fichier est remarquablement solide sur ce
qu'il a mécanisé : Unicode, empreintes, numéros de ligne VOLUBILIS, rangs de
fréquence, planchers d'exercice et fidélité de réemploi sont exacts au caractère
près, et **57 faits distincts ont été confirmés par re-exécution**.

Les défauts se concentrent tous au même endroit, et c'est le seul endroit que la
leçon n'a pas mécanisé : **les phrases françaises qui interprètent une source**.
Là où le dossier recopie un relevé, il est juste. Là où il conclut, il conclut
trois fois contre sa propre preuve, et une fois en supprimant la colonne qui le
contredit. Le finding 1 est le plus grave du fichier : la page 7 enseigne à
l'apprenant une règle d'usage que ses deux sources démentent.

Aucun passage `draft → review` avant résolution des dix bloquants.

## Ce qui a été confirmé par re-exécution (57 faits)

### Contrôles internes au dépôt (16)

| Contrôle                                           | Résultat obtenu ici                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `repo-thai-scan.mjs --check-u07`                   | passe, dix chiffres sur dix                                                        |
| `repo-thai-scan.mjs 1 10`                          | 50 fichiers, 461 entrées, 337 graphies, 106 ไม้เอก, 82 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา |
| `repo-thai-scan.mjs 11 11`                         | 5 fichiers, 51 entrées, 42 graphies, 16 ไม้เอก, 16 ไม้โท                           |
| Répartition par fichier de l'unité 11              | 8 / 15 / 8 / 8 / 12                                                                |
| Collisions d'attribution de l'unité 11             | **exactement les neuf nommées**, ni plus ni moins                                  |
| Graphies de 11A revendiquées ailleurs dans l'unité | **aucune**, confirmé                                                               |
| `--grep เข้าใจ` sur 1 à 10                         | 0                                                                                  |
| `--grep อีก` sur 1 à 10                            | 0                                                                                  |
| `--grep ช้า` sur 1 à 10                            | 3, toutes เช้า de `u07-l7c`                                                        |
| `--grep ได้` sur 1 à 10                            | 1, อยากได้ de `u08-l8b`                                                            |
| `--grep ที` sur 1 à 10                             | 13, aucune n'étant ที seul                                                         |
| `--grep ๆ` sur 1 à 10                              | 0                                                                                  |
| `item-fields-check.mjs`                            | 0 champ `codepoints` en faute                                                      |
| `unicode-thai.mjs`                                 | les 8 séquences NFC exactes, y compris les U+0020 déclarés                         |
| `repo-thai-scan.mjs 11 11 --stacked`               | aucune graphie de 11A parmi les empilements de profondeur 2                        |
| Tableau de réemploi, 24 lignes                     | **24 sur 24 identiques à la leçon d'origine, 0 écart**                             |

### Réemplois et décodabilité (7)

Le contrôle demandé par `item-fields-check.mjs` **ne peut pas s'exécuter sur
11A** : le script ne compare un item à sa leçon d'origine que si le TITRE de
l'item porte une référence `uXX-lYz`, et aucun des huit titres de 11A n'en porte.
Le script rend donc « 0 écart de réemploi » sans avoir comparé quoi que ce soit.
Les 24 lignes ont été relues à la main, champ par champ, dans les fichiers
d'origine.

- `u02-l2a` item 5 พูด `phôuut` ; `u01-l1d` items 9 et 10 ไหม `mǎi` / ไม้ `máai` ;
  `u04-l4d` items 1, 4, 6 ไม่ `mâi` / นิดหน่อย `nít·nàwi` / ชอบ `châwwp` ;
  `u09-l9c` item 1 ช่วย `chôuai` ; `u01-l1c` items 1 à 3 ปา / ป่า / ปู ;
  `u01-l1e` items 2 et 3 ครับ / ค่ะ ; `u02-l2e` item 1 คะ ; `u01-l1b` item 1 เข้า ;
  `u06-l6c` item 3 ใจดี ; `u02-l2b` items 2 et 3 ; `u02-l2d` items 7 et 8 ;
  `u08-l8d` item 1 ; `u02-l2c` items 1 et 3 : **toutes conformes.**
- `u02-l2d` collocation de l'item 5 : `phǒm chûee … khráp / dì·chǎn chûee … khâ`,
  repris à l'identique.
- `u02-l2d` collocation de l'item 6 : `khoun chûee à·rai khá / khoun chûee à·rai
khráp`, repris à l'identique.
- `u02-l2e` répliques 5 et 6 : les deux assemblages du dialogue sont bien les
  siens, à la particule près, celle de 2E étant féminine à la réplique 5.
- **Décodabilité du dialogue : vérifiée bloc par bloc.** Les douze répliques ne
  contiennent que คุณ, ชื่อ, อะไร, ผม, มาจาก, ฝรั่งเศส, สวัสดี, ขอโทษ, ขอบคุณ,
  ไม่เป็นไร, ไหม et les particules, tous publiés par les unités 1 à 10, plus les
  quatre formules du jour. **Aucun mot non enseigné.**
- `u02-l2b` publie bien le schéma « énoncé + ไหม + particule » (items 4 et 5,
  plus l'exercice d'ordre).
- `u01-l1d` signale bien elle-même que ไหม / ไม้ opposent le ton ET la longueur.

### Cohérence de parcours (5)

- `u04-l4a` page 8 met bien les formes en ไ, ใ, เ-า et -ำ hors du domaine de la
  règle du ton : l'incertitude 5 est fondée.
- `u04-l4a` page 9 traite bien montant contre haut « à l'oreille ».
- `srs-u04-l4a-06` et `srs-u07-l7a-03` existent et portent bien les deux
  contrastes annoncés.
- `u10-l10a` page 9 définit bien les trois états `visible`, `au_toucher`,
  `absent` : la référence de la Méta est exacte.
- `u05-l5e` item 2 emploie bien la même construction de preuve que l'item 2 de
  11A (locution VOLUBILIS + RID sur le composant + patron publié).

### RID 2554, corps d'entrée relu par `rid-entry.mjs` (8)

- « เข้าใจ » : vedette autonome unique, ก., glosée par deux synonymes thaïs dont
  รู้เรื่อง, แม่คำ « เข้า ๑ ». **Conforme.**
- « ได้ » : six sens numérotés, le (๒) après un verbe avec la valeur อาจ /
  สามารถ, le (๔) อนุญาต. **Aucune lecture entre crochets : l'absence est réelle.**
- « ช้า » : trois vedettes ; ช้า ๑ ว. à deux sens, exemples เดินช้า, วิ่งช้า,
  มาช้า ; ลูกคำ contenant le proverbe ช้า ๆ ได้พร้าสองเล่มงาม ; ช้า ๒ péjorative,
  ช้า ๓ musique et théâtre. **Conforme.**
- « ยมก » : lecture `[ยะมก]` = U+0E22 U+0E30 U+0E21 U+0E01, sens (๑) paire, ๒ ชั้น,
  origine (ป., ส.), sens (๒) nommant le signe. **Conforme au caractère près.**
- « ไม้ยมก » : reprend l'emploi, แม่คำ « ไม้ ๒ ». **Conforme.**
- « อีก » : ว., notions de suite, répétition, ajout, exemple ขออีก. **Conforme.**
- « ที ๑ » : น., fois et moment, employée comme ลักษณนาม. **Conforme.**
- Contrôles négatifs : ไม่เข้าใจ, อีกที, ฟังไม่ออก, พูดช้า et ๆ ne rendent aucune
  vedette. **Les cinq confirmés.**

### en.wiktionary, consulté en rendu (7)

- « อีกที » : Orthographic `อีกที`, Phonemic `อีก-ที`, IPA /ʔiːk̚˨˩.tʰiː˧/,
  Paiboon `ìik-tii`, RI `ik-thi`, adverbe « once more, again », étymologie
  อีก + ที, **et l'exemple glosé กรุณาพูดอีกทีได้ไหมครับ « Could you please repeat
  that? », romanisé `gà-rú-naa pûut ìik-tii dâai mǎi kráp`**. Conforme mot pour
  mot à ce que citent les items 4, 5 et 6, et à la partie 5.
- « ไหม » : la particule porte bien **deux** prononciations, /maj˩˩˦/ `mǎi` et
  /maj˦˥/ `mái`, cette seconde avec la variante graphique มั้ย. Conforme.
- « ได้ » : Phonemic `ด้าย`, IPA /daːj˥˩/, Paiboon `dâai`, homophone `ด้าย`.
  Conforme.
- « เข้าใจ » : Phonemic `เข้า-ไจ`, IPA /kʰaw˥˩.t͡ɕaj˧/, Paiboon `kâo-jai`, RI
  `khao-chai`, verbe, étymologie เข้า + ใจ « to enter the heart ». Conforme.
- « ช้า » : IPA /t͡ɕʰaː˦˥/, Paiboon `cháa`, RI `cha`, adjectif « slow, not
  quick », antonyme เร็ว, trois étymologies, exemple พูดช้าลงหน่อย. Conforme.
  **ช้าๆ figure bien en tête des termes dérivés de l'étymologie 1**, vérifié en
  wikitexte brut.
- « ๆ » : nommé ยมก ou ไม้ยมก, marque d'itération du mot ou du groupe précédent.
  Conforme.
- **404 confirmés** : `ได้ไหม`, `ช้าๆ`, `ฟังออก`.

### Artefacts externes, empreintes recalculées (14)

| Artefact                           | Octets     | SHA-256        | Verdict                            |
| ---------------------------------- | ---------- | -------------- | ---------------------------------- |
| `UnicodeData.txt` 17.0             | 2 198 209  | `2e1efc1d…70c` | identique à la déclaration         |
| `PropList.txt` 17.0                | 145 465    | `130dcdda…4dd` | identique                          |
| `IndicPositionalCategory.txt` 17.0 | 52 257     | `68cedc29…480` | identique, en-tête daté 2025-07-29 |
| `VOLUBILIS_Database.xlsx` v26.2    | 10 848 409 | `b9ab7418…c0c` | identique                          |
| `th_50k.txt`                       | —          | `20e7052f…083` | identique, 50 000 lignes           |

- `UnicodeData.txt` **ligne 3257** =
  `0E46;THAI CHARACTER MAIYAMOK;Lm;0;L;;;;;N;THAI MAI YAMOK;;;;`, **au caractère
  près**.
- `PropList.txt` **ligne 1461** = `0E40..0E44 ; Logical_Order_Exception`. Exact.
- `IndicPositionalCategory.txt` **ligne 384** = `0E40..0E44 ;
Visual_Order_Left`. Exact.
- VOLUBILIS : **114 579 lignes non vides, 586 541 chaînes partagées**, identiques
  à la déclaration.
- **Les vingt-quatre numéros de ligne VOLUBILIS cités ont été rouverts un par
  un** : 31513, 51942, 17100, 17101, 17170, 101816 à 101820, 9941, 75426, 6407,
  7002, 7652, 75313, 111852, 6953, 75424, 17131, 62368, 70597, 41124, 55280,
  111566, 13703, 13709, 85389, 52691. **Toutes exactes**, avec les colonnes
  ThaiRom, ThaiPhon, TYPE, ENG, FRA, DOM et SYLLAB annoncées. Seul le compte de
  ช้า est faux, voir le finding 7.
- **La divergence de ton de la partie 3 est réelle** : la ligne 17170 porte bien
  `_īk \thī`, la ligne 75426 `\phūt _īk -thī`, et les lignes 101816 à 101820
  toutes `-thī`. Le verdict « ton moyen » est correct et bien fondé.
- Les quatre recherches exactes des formes redoublées rendent bien **0 ligne** :
  le faux « absent » est réel, la cause identifiée est la bonne.
- VOLUBILIS ไหม (lignes 51644 à 51647) ne donne bien que `/mai`, la montante.
- FrequencyWords : **les onze rangs cités sont exacts** — เข้าใจ 846,
  ไม่เข้าใจ 5 533, ไม่ 3, อีกที 3 257, อีก 310, ที 1 619, ได้ไหม 830, ช้า 3 289,
  ช้าๆ 1 223, รู้เรื่อง 34 249, ไม่รู้เรื่อง 29 023. La première ligne du fichier
  est bien un artefact d'encodage (`เธ 81142`).
- L'adresse de téléchargement de l'en-tête de `volubilis-lookup.mjs` est bien
  **morte (HTTP 404)**, et **celle proposée par l'arbitrage 5 fonctionne** et
  rend l'empreinte annoncée. L'arbitrage 5 est fondé.

### Recalculs indépendants (7)

- **Tons recalculés depuis les règles de classe et de syllabe** : เข้าใจ
  (ข haute + ไม้โท → descendant ; ใจ moyen), ไม่ (ม basse + ไม้เอก → descendant),
  ไหม (ห de tête → haute, vivante sans marque → montant), ไม้ (ม basse + ไม้โท →
  haut), ได้ (ด moyenne + ไม้โท → descendant), ช้า (ช basse + ไม้โท → haut),
  อีก (อ moyenne, morte, voyelle longue → bas), ที (ท basse, vivante, sans marque
  → moyen). **Les huit conformes à la leçon.**
- **Plancher de l'exercice 1** recalculé sur la table de tirages telle qu'écrite :
  réponse constante par carte 1/12 (les douze bonnes réponses sont bien douze
  graphies distinctes) ; position constante 4/12 ; « carte la plus longue » 3
  strictement décidés (tirages 3, 7, 12) plus 2 ex aequo (tirages 8, 9), plafond
  5/12 ; « la plus courte » 2 strictement (tirages 2, 6) plus 4 ex aequo
  (8, 9, 10, 11), plafond 6/12 ; « finit par ครับ » 2/12 sur 4 tirages
  applicables ; « porte ไม่ » 1/12 sur 6 applicables. **Les six chiffres sont
  exacts, y compris le plafond de 6 sur 12.**
- **Plancher de l'exercice 2** : 6! = 720 donc 0,14 % ; bijection résiduelle de
  quatre après verrouillage de ไม่ et นิดหน่อย, 1/24 = 4,2 %. **Exacts.** Une
  réponse constante y est structurellement impossible.
- **Planchers de l'exercice 3** : 1/24, 1/24, 1/6, 1/6, 1/360 (deux ครับ
  interchangeables sur 6 blocs) et 1/2 520 (deux ครับ sur 7 blocs) ; espérance
  0,4198 soit **7,0 %**. Stratégie des règles publiées : 2 + 2 × (1/6) = 2,33
  soit **38,9 %**. **Exacts, et aucune des deux n'atteint 5 sur 6.**
- **Plancher de l'exercice 4** : saisie libre, aucune option, 1/8 au mieux.
  **Exact.**
- **Planchers de l'exercice 5** : constante 2/8 (répartition strictement 2 par
  option, vérifiée : A aux tirages 1 et 7, B aux 2 et 5, C aux 3 et 8, D aux 4 et 6) ; heuristique de longueur 4/8 d'espérance et
  P(≥ 7 sur 8) = 9/256 = **3,5 %** ; heuristique « porte ไม่ » 2/8, aucun autre
  tirage ne portant ไม่. **Exacts.**
- **Les huit réponses de l'exercice 4** sont conformes à la convention v1.1 :
  marque de ton sur la première lettre du noyau, doublement de la dernière lettre
  du graphème pour la longue, `·` à l'intérieur des polysyllabiques seulement.

## Findings

### 1. `SENS-RUEUANG` — BLOQUANT — la page 7 enseigne une règle d'usage que ses deux sources démentent

La page 7, écran d'apprenant, dit de ไม่รู้เรื่อง :

> celle-là n'est pas un synonyme, et **les deux sources concordent sur ce
> point**. Elles la rangent du côté de « être au courant de l'affaire », pas du
> côté de « saisir la phrase qu'on vient de me dire ». **Ne l'employez pas pour
> ce que fait ไม่เข้าใจ.**

Les deux sources disent le contraire, et je les ai rouvertes toutes les deux.

**RID, entrée « เข้าใจ », relevée ici le 2026-08-04** : `ก. รู้เรื่อง,
รู้ความหมาย.` Le dictionnaire normatif **définit เข้าใจ PAR รู้เรื่อง**. Ce sont
des synonymes au sens le plus fort qui soit : l'un est la glose de l'autre. La
leçon le sait, et l'écrit elle-même à l'item 1 (« glosée par deux synonymes thaïs
dont รู้เรื่อง »), puis affirme l'inverse à la page 7.

**RID, entrée « รู้เรื่อง »** : `ก. เข้าใจเรื่อง (มักใช้ในความปฏิเสธ) เช่น
พูดเท่าไร ๆ ก็ไม่รู้เรื่อง.` L'exemple du dictionnaire normatif est **exactement
la situation de la leçon** : « on a beau répéter, il ne comprend pas ». C'est
littéralement de la parole non saisie. Le dossier cite cette entrée à la partie 4,
mentionne la note d'usage et l'existence d'un exemple négatif, mais **ne dit pas
ce que l'exemple contient**, et conclut à l'opposé de ce qu'il montre.

**VOLUBILIS ligne 52691, ไม่รู้เรื่อง** : la colonne **ENG porte « do not
understand a word »**. Le dossier ne cite que la colonne FRA (« ne pas être au
courant ; ignorer ») et **supprime la colonne ENG**. Ailleurs dans le même
fichier, VOLUBILIS est systématiquement cité avec ses deux colonnes : ligne 51942
« ENG … FRA … », ligne 9941 « ENG « can you? ; could you? », FRA … », ligne 75313
« ENG « speak slowly », FRA … ». La colonne n'est omise **qu'à l'endroit où elle
contredit la conclusion**. Ligne 85389, รู้เรื่อง porte de même « ENG understand ;
see ; know ».

Ce n'est pas une nuance manquée : c'est une consigne d'usage donnée à
l'apprenant (« Ne l'employez pas »), contredite par les deux autorités citées à
son appui, obtenue par citation sélective d'une colonne.

**Correction attendue** : retirer entièrement le paragraphe ไม่รู้เรื่อง de la
page 7, ou le réécrire sur ce que les sources établissent réellement, à savoir
que le RID donne รู้เรื่อง comme glose de เข้าใจ et illustre ไม่รู้เรื่อง par un
énoncé non compris. Reprendre la partie 4 dans le même mouvement, et y citer la
colonne ENG de la ligne 52691.

### 2. `REF-FANGOK` — BLOQUANT — la citation qui a motivé un retrait est fausse

Page 7 : « le dictionnaire normatif donne à sa forme positive **exactement le
même sens** qu'à เข้าใจ ». Partie 4 : l'entrée « ฟังออก » « est glosée par **les
deux mêmes mots** que l'entrée « เข้าใจ » ».

Relevé ici :

| Entrée | Glose du RID                 |
| ------ | ---------------------------- |
| เข้าใจ | `ก. รู้เรื่อง, รู้ความหมาย.` |
| ฟังออก | `ก. เข้าใจ, รู้เรื่อง.`      |

Ce ne sont **pas les deux mêmes mots**. เข้าใจ est glosé par {รู้เรื่อง,
รู้ความหมาย} ; ฟังออก est glosé par {เข้าใจ, รู้เรื่อง}. Un seul mot est commun.
La relation réelle est autre, et plus forte : ฟังออก est glosé **par** เข้าใจ.

La conclusion tirée reste défendable, mais **la citation qui la porte est
fausse**, et cette citation est ce qui a fait supprimer un paragraphe entier de
la page 7 et alimente l'incertitude 1. Une décision de contenu s'appuie ici sur
un relevé inexact.

**Correction attendue** : réécrire la partie 4 et la page 7 avec les deux gloses
telles qu'elles sont, et refonder la conclusion sur le fait exact, à savoir que
le RID glose ฟังออก par เข้าใจ.

### 3. `TON-CH3` — BLOQUANT — trois tons annoncés, deux tons donnés

Item 7, champ `note_fr`, écran d'apprenant :

> l'attaque ch est la même que celle de ชอบ (châwwp, 4D) et de ช่วย (chôuai, 9C),
> ce qui vous donne **trois mots en ช à trois tons différents, haut, descendant
> et descendant**.

L'énoncé se contredit dans sa propre phrase. Vérifié dans les leçons d'origine :
`u04-l4d` item 6 ชอบ, champ `ton` = `descendant` ; `u09-l9c` item 1 ช่วย, champ
`ton` = `descendant`. Deux tons distincts, pas trois.

La conséquence dépasse la phrase : le **tirage 10 de l'exercice 1** oppose ช้า
(haut) à ชอบ et ช่วย, présentés comme un départage de tons, alors que les deux
distracteurs partagent le même ton. Le tirage reste discriminable par le noyau
vocalique, mais il ne mesure pas ce que la note annonce, et le tirage est compté
parmi ceux qui « entretiennent les deux contrastes de tons du parcours ».

**Correction attendue** : corriger la note en « deux tons, haut et descendant »,
et soit retirer le tirage 10 du décompte des tirages de tons, soit remplacer un
distracteur par un mot en ช d'un troisième ton réellement publié.

### 4. `REF-4D5E` — BLOQUANT — citation entre guillemets attribuée à la mauvaise leçon

Item 2, `note_fr` : « dans ไม่ไกล de **5E**, dont l'item dit déjà « sa place est
fixe, devant le mot nié » ».

Recherche exécutée sur tout `content/authoring/` : la chaîne « place est fixe »
n'apparaît que dans **`unite-04/lecon-4d.md` ligne 152**, dans le `note_fr` de
son item 1. L'item 2 de `u05-l5e` écrit autre chose : « ไม่ passe devant ce qu'il
annule ».

La Méta de 11A attribue pourtant la même formule correctement, ligne 76 : «
`u04-l4d` : ไม่, dont la page dit que sa place est fixe, devant le mot nié ». Le
fichier porte donc la bonne et la mauvaise attribution de la même citation.

C'est exactement le geste que `item-fields-check.mjs` a été écrit pour attraper,
et qu'il **ne peut pas attraper ici** : le script ne suit une référence
`uXX-lYz` que si elle figure dans le TITRE de l'item, or aucun des huit titres de
11A n'en porte. Le « 0 écart de réemploi » rendu par le script sur ce fichier est
un zéro vide, pas un zéro mesuré.

**Correction attendue** : rattacher la citation à `u04-l4d` item 1. Et porter à
l'arbitrage que le script doit aussi lire les références du CORPS des champs, ou
que les items citants doivent porter leur référence au titre.

### 5. `SON-AAI` — BLOQUANT — le tableau « aucun son nouveau » cite un noyau qui n'est pas le bon

Partie 2, tableau de contrôle syllabe par syllabe, celui qui certifie la Méta :

> | dâai | attaque `d` de ดี, noyau `aai` long de ง่าย (`u08-l8a`) et de **ก้าว
> (`u04-l4a`)** |

Relevé dans `u04-l4a` item 4 : ก้าว, `ipa` = `/kaːw˥˩/`, `transcription` =
`kâao`. Le noyau de ก้าว est **`aao`, /aːw/**, pas `aai`, /aːj/. Ce sont deux
noyaux différents, et la convention v1.1 les distingue explicitement (`ai` pour
/aj/, `ao` pour /aw/, « aw = o ouvert, ao = a puis o »).

L'antécédent ง่าย (`ngâai`, /ŋaːj˥˩/) est correct et suffit à sauver la
conclusion. Mais la seconde jambe du seul tableau qui prouve « aucun son
nouveau » désigne une autre voyelle. Le même glissement se retrouve à l'item 1,
qui appuie l'exercice de contrôle sur ข้าว (`khâao`, /aːw/).

**Correction attendue** : remplacer ก้าว par un antécédent réellement en /aːj/,
ou retirer la seconde jambe et déclarer que dâai repose sur ง่าย seul.

### 6. `COORD-2` — BLOQUANT — « deux graphies » là où il y en a vingt-six

Méta, section de coordination d'unité, présentée comme **RECOMPUTÉE** :

> Deux graphies de l'unité, ไหม dans `lecon-11d.md` et แล้ว dans `lecon-11c.md`,
> sont déjà publiées par `u01-l1d` et par `u09-l9d`.

Recomputé ici avec la convention d'entrée de `repo-thai-scan.mjs`, la même que
celle qui a servi au dépouillement des collisions : l'unité 11 compte **35
redéclarations portant sur 26 graphies distinctes** déjà publiées par les unités
1 à 10.

| Fichier        | Graphies déjà publiées par les unités 1 à 10                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lecon-11b.md` | พี่, น้อง, พ่อ, แม่, พี่ชาย (`u06-l6b`) ; คุณ, ผม, ดิฉัน (`u02-l2d`) ; ครับ, ค่ะ (`u01-l1e`) ; คะ, ต้น, นก (`u02-l2e`)                                       |
| `lecon-11c.md` | ด้วย (`u09-l9c`) ; แล้ว (`u09-l9d`)                                                                                                                          |
| `lecon-11d.md` | ไหม (`u01-l1d`) ; แล้วเจอกัน (`u01-l1e`) ; แล้วคุณล่ะ (`u06-l6e`) ; ทุกวัน, ตอนเช้า, ตอนเย็น (`u07-l7c`) ; วันนี้ (`u07-l7e`) ; เขา (`u01-l1b`)              |
| `lecon-11e.md` | ครับ, ค่ะ (`u01-l1e`) ; คะ, ต้น, นก, สบายดี / สบายดีไหม (`u02-l2e`) ; ผม, ดิฉัน, คุณ, ชื่อ (`u02-l2d`) ; แล้วคุณล่ะ (`u06-l6e`) ; ตลาดอยู่ที่ไหน (`u05-l5e`) |

Le même paragraphe rend le dépouillement des neuf collisions INTERNES à l'unité
**exactement juste**, ce que j'ai confirmé graphie par graphie. Le relevé des
redéclarations VENANT des unités antérieures, lui, n'a manifestement pas été
exécuté : il est faux d'un ordre de grandeur, et il est présenté dans la même
phrase, sous la même autorité de mesure. C'est précisément le défaut que le
dossier nomme lui-même : « un chiffre écrit sans être exécuté produit toujours
le résultat que l'auteur espère ».

L'arbitrage 1 s'appuie en partie sur ce relevé et doit être repris avec le bon
chiffre, qui le renforce plutôt qu'il ne l'affaiblit.

**Correction attendue** : remplacer la phrase par le relevé recomputé, ou la
restreindre explicitement aux deux fichiers examinés en disant qu'aucun balayage
d'unité n'a été fait.

### 7. `VOL-CHA` — BLOQUANT — cinq lignes annoncées, six lignes dans la base

Item 7 : « VOLUBILIS v26.2, `.xlsx`, **lignes 6345 à 6349** … (ThaiPhon `¯chā`
**sur les cinq**, respelling `[ช้า]`) ».

Relevé ici sur l'exemplaire d'empreinte `b9ab7418…c0c`, la même que celle
déclarée : la recherche exacte de ช้า rend **six lignes, 6345 à 6350**. La ligne
6350 (`¯chā`, TYPE adv., FRA « tardivement ; tard ; en retard », DOM `RID`,
respelling `[ช้า]`) est omise, et le compte « les cinq » est faux.

L'omission ne change aucun fait enseigné : le ton `¯chā` et le respelling `[ช้า]`
valent aussi sur la sixième ligne, et le sens « tard » n'est pas enseigné. Mais
l'amendement v1.2 exige qu'un tiers puisse refaire la consultation à
l'identique, et un tiers qui la refait n'obtient pas ce qui est écrit.

**Correction attendue** : citer « lignes 6345 à 6350 », « sur les six », et
mentionner que 6350 porte le sens de retard, non enseigné.

### 8. `ECHAF-EX3` — BLOQUANT — l'exercice 3 est déclaré `absent` et affiche la transcription

Méta :

> les pages 1 à 12 sont à l'état `visible` ; le dialogue est à l'état
> `au_toucher` ; **les exercices 1, 3 et 5 sont à l'état `absent`**.

Exercice 3, champ Interaction :

> Ordre d'apparition des blocs tiré au hasard à chaque tirage. **Blocs affichés
> en thaï avec leur transcription.**

L'état `absent` est défini par `u10-l10a` page 9 comme « thaï seul, aucune
révélation avant la réponse ». Les deux phrases ne peuvent pas être vraies
ensemble, et le produit ne peut pas implémenter les deux. Les exercices 1 et 5
sont, eux, cohérents avec leur déclaration ; l'exercice 2, non déclaré, affiche
la transcription sans contradiction.

**Correction attendue** : trancher. Si l'exercice 3 mesure la place des blocs et
non la lecture, il n'est pas `absent` et la Méta doit dire `visible` ; s'il est
`absent`, l'Interaction doit retirer la transcription et le plancher doit être
recalculé, la reconnaissance des blocs devenant elle-même une variable.

### 9. `REG-ORDRE` — BLOQUANT — un fait de pragmatique affirmé sans source

Page 3, écran d'apprenant :

> Posé à la fin, ได้ไหม change la nature de ce qui précède. **Sans lui, พูดอีกที
> est un ordre.** Avec lui, c'est une demande, et vous laissez à la personne la
> possibilité de dire non.

et le spécimen glosé : « พูดอีกที · phôuut ìik·thii · **redis-le** ».

Aucune source du dossier n'établit cela. VOLUBILIS ligne 75426, que j'ai
rouverte, glose พูดอีกที par « repeat » et « répéter », sans marque de mode ni
d'usage, TYPE `v. exp.` ; le RID n'a pas d'entrée pour la locution, ce que j'ai
confirmé ; en.wiktionary n'atteste que la forme AVEC ได้ไหม. Le champ `registre`
de l'item 5 écrit lui-même « Aucune étiquette de registre sur les sources
consultées », et le tableau des audits écrit « aucune étiquette de registre sur
aucune source consultée ».

Que ได้ไหม fasse une demande est double-sourcé (RID « ได้ » sens ๒ et ๔,
VOLUBILIS ligne 9941 « can you? ; could you? »). Que la forme NUE soit un ordre
ne l'est pas : c'est une inférence de l'auteur sur un usage social, exactement ce
que la priorité 3 de la politique interdit d'affirmer.

**Correction attendue** : reformuler sans affirmer le statut de la forme nue,
par exemple « ได้ไหม transforme l'énoncé en demande et laisse la possibilité de
dire non », et retirer la glose impérative « redis-le ». Ou sourcer la
pragmatique de l'impératif thaï sur une grammaire de référence, que la politique
autorise déjà au §2.

### 10. `USAGE-YAMOK` — BLOQUANT — la page 5 affirme ce que la note culturelle jure de ne pas affirmer

Page 5, écran d'apprenant :

> À l'écrit, **on laisse une espace devant lui**. Vous croiserez aussi la forme
> collée, ช้าๆ, **tout aussi courante** ; les deux notent la même chose.

Note culturelle, même fichier :

> **Ce que cette note n'affirme PAS.** Elle ne dit rien de **la fréquence du
> signe dans la langue écrite d'aujourd'hui**, rien de ce que le redoublement
> fait au sens en général, et **rien d'une règle typographique d'espacement**.

Les deux passages sont incompatibles, et c'est la page 5 qui est à l'écran en
premier. « Tout aussi courante » est une affirmation de fréquence comparée que
rien dans le dossier ne mesure : le seul chiffre disponible est le rang
FrequencyWords de la forme collée (1 223, que j'ai confirmé), et la forme espacée
n'y est pas mesurable, la segmentation coupant sur l'espace. Le dossier le sait
et l'écrit dans sa propre réserve sur FrequencyWords.

La règle d'espacement est en meilleure posture — le RID écrit bien son ลูกคำ
« ช้า ๆ ได้พร้าสองเล่มงาม » avec l'espace, ce que j'ai relevé, et en.wiktionary
énonce la convention gouvernementale — mais alors c'est la déclaration d'audit
qui est fausse, et une déclaration d'audit fausse dans un fichier dont c'est
l'argument central ne peut pas passer.

**Correction attendue** : supprimer « tout aussi courante » et s'en tenir à « les
deux formes sont attestées », qui est établi par la cellule VOLUBILIS
`ช้า ๆ = ช้าๆ` de la ligne 6407 ; puis mettre la note culturelle en accord avec
ce que la page 5 dit réellement de l'espacement, ou retirer la règle de la
page 5.

### 11. `SYLL-ECART` — non bloquant — deux descriptions incompatibles du même écart

Page 5 : « cháa est HAUT … mǎi est MONTANT … **Trois syllabes les séparent**, et
c'est exactement l'écart que 4A vous a appris à entendre. »
Item 8, `note_fr` : « mǎi remonte, **juste après deux syllabes perchées** ».

La phrase est phôuut · cháa · cháa · dâai · mǎi · khráp. Entre le premier cháa et
mǎi il y a deux syllabes ; entre le second et mǎi, une seule ; et mǎi n'est pas
« juste après » les deux cháa, dâai s'intercale. Les deux formulations ne peuvent
pas être vraies ensemble, et aucune ne décrit exactement la phrase.

Par ailleurs, `u04-l4a` page 9, que j'ai relue, entraîne le contraste sur la
paire minimale **adjacente** ขา / ค้า. « Exactement l'écart que 4A vous a appris
à entendre » n'est donc pas exact : 4A entraîne le contraste sans écart.

### 12. `CNT-ABSENT5` — non bloquant — cinq faux « absent » annoncés, quatre énumérés

Le tableau des contrôles mécaniques annonce « **Cinq faux « absent »** sur les
formes redoublées », et l'arbitrage 4 répète « Cinq recherches de ce fichier ont
rendu ABSENT à tort ». Le corps du dossier n'en énumère que quatre : `ช้า ๆ`,
`ช้าๆ`, `พูดช้า ๆ` et `พูดช้าๆ`. J'ai exécuté les quatre : elles rendent bien 0
ligne chacune. La cinquième n'existe nulle part dans le fichier.

### 13. `CNT-RID17` — non bloquant — le décompte RID n'est pas additif comme il l'annonce

Le dossier écrit : « Décompte, fait sur les listes telles qu'elles sont, **et il
s'additionne** : 17 graphies distinctes interrogées, 5 sans entrée, 12
attestées. » L'addition des cinq listes donne bien 17.

Mais l'item 3 déclare un contrôle de présence supplémentaire : « RID 2554,
contrôle de présence le 2026-08-04 : **เข้าใจนิดหน่อย** n'a pas d'entrée ». J'ai
confirmé cette absence. La graphie ne figure dans aucune des cinq listes, et
n'est comptée ni parmi les 17 interrogées ni parmi les 5 absentes. Le décompte
est donc au minimum 18 et 6.

### 14. `REF-THAI` — non bloquant — renvoi qui ne mène nulle part

« Attestée et NON enseignée (1) : ไทย, interrogée puis écartée, **voir plus
bas**. » Recherche exécutée sur tout le fichier : ไทย n'apparaît qu'à deux
endroits, cette ligne et une mention incidente à l'item 5 (« dans la même session
où le script en extrait pour ยมก, ไทย et d'autres »). Aucune explication « plus
bas » n'existe. Le motif de l'interrogation puis de l'écart n'est consigné nulle
part.

### 15. `PATRON-NITNOI` — non bloquant — le patron est décrit trois fois de trois façons

- Item 3 : « le PATRON « mot + นิดหน่อย » **avec un verbe en tête, sur trois
  entrées** de la base ».
- Incertitude 3 : « Le patron est attesté trois fois dans VOLUBILIS, **dont une**
  avec un verbe, กินนิดหน่อย ».

J'ai rouvert les trois lignes. **Deux** portent un verbe en tête : 41124
กินนิดหน่อย (`v. exp.`, กิน) et 55280 มีอาการนิดหน่อย (`v. exp.`, มี). La
troisième, 111566 ยากนิดหน่อย, porte un adjectif et son champ TYPE vaut `X`. Ni
« trois » ni « une » : deux. L'item 3 surestime, l'incertitude 3 sous-estime, et
la seule instance verbale citée par l'incertitude n'est pas la seule.

### 16. `AUDIO-PAIRE` — non bloquant — la contrainte d'enregistrement contredit ce que Paul demande

Incertitude 6, point 1 : « la **paire de vitesses** des répliques 1 et 3 puis 5
et 7 du dialogue doit être produite par la MÊME voix, sur la MÊME phrase, en deux
prises, **l'une au débit courant et l'autre nettement ralentie** ».

La réplique 6 demande พูดอีกทีได้ไหมครับ, une RÉPÉTITION, pas un ralentissement.
Si la réplique 7 est ralentie, l'audio répond à une demande que Paul n'a pas
faite, et il efface la distinction même que la page 5, l'exercice 1 (tirages 4 à 7) et l'exercice 5 (tirages 1, 2, 5, 7) font travailler. Le tableau du dialogue
ne porte d'ailleurs l'annotation « lentement » qu'à la réplique 3, pas à la 7.

### 17. `CNT-EX1` — non bloquant — la ventilation des douze tirages en compte onze

Exercice 1, « Ce qu'il mesure » : « **Quatre** tirages sur douze opposent les
deux demandes du jour et leurs deux particules ; **trois** opposent les trois
réponses de compréhension ; **quatre** entretiennent les deux contrastes de tons
du parcours. » 4 + 3 + 4 = 11. Les tirages 1 à 3 sont les réponses, 4 à 7 les
demandes, et il reste les tirages 8, 9, 10, 11 et 12, soit **cinq**.

### 18. `REEMPLOI-24` — non bloquant — le périmètre des 24 blocs n'est pas celui du fichier

Les 24 lignes du tableau sont exactes, je les ai toutes relues et **aucune ne
diverge** de sa leçon d'origine. Deux réserves sur le périmètre, pas sur le
contenu :

- **ข้าว (`khâao`) manque au tableau** alors qu'il est réemployé avec sa
  transcription sur un écran d'apprenant, dans le `note_fr` de l'item 1. Sa
  transcription est correcte (`u01-l1b` item 2 publie bien `khâao`), donc le
  « 0 écart » tient, mais l'affirmation « les 24 blocs réemployés par ce fichier »
  n'est pas le compte réel des réemplois transcrits du fichier.
- **สวัสดีครับ figure au tableau alors que le fichier ne l'emploie nulle part** :
  le dialogue n'utilise que สวัสดีค่ะ.

## Récapitulatif

| #   | Code            | Bloquant | Objet                                                                                          |
| --- | --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| 1   | `SENS-RUEUANG`  | oui      | règle d'usage de ไม่รู้เรื่อง démentie par le RID et par la colonne ENG supprimée de VOLUBILIS |
| 2   | `REF-FANGOK`    | oui      | « les deux mêmes mots » faux ; c'est cette citation qui a motivé un retrait                    |
| 3   | `TON-CH3`       | oui      | « trois tons différents, haut, descendant et descendant »                                      |
| 4   | `REF-4D5E`      | oui      | citation entre guillemets attribuée à `u05-l5e` au lieu de `u04-l4d`                           |
| 5   | `SON-AAI`       | oui      | ก้าว donné comme antécédent du noyau `aai` alors qu'il porte `aao`                             |
| 6   | `COORD-2`       | oui      | « deux graphies » redéclarées, contre 26 mesurées                                              |
| 7   | `VOL-CHA`       | oui      | ช้า cité sur cinq lignes, la base en a six                                                     |
| 8   | `ECHAF-EX3`     | oui      | exercice 3 déclaré `absent` et affichant la transcription                                      |
| 9   | `REG-ORDRE`     | oui      | « พูดอีกที est un ordre » non sourcé                                                           |
| 10  | `USAGE-YAMOK`   | oui      | fréquence et règle d'espacement affirmées à l'écran, niées au dossier                          |
| 11  | `SYLL-ECART`    | non      | « trois syllabes les séparent » contre « juste après deux syllabes »                           |
| 12  | `CNT-ABSENT5`   | non      | cinq faux « absent » annoncés, quatre énumérés                                                 |
| 13  | `CNT-RID17`     | non      | décompte RID non additif, เข้าใจนิดหน่อย hors comptage                                         |
| 14  | `REF-THAI`      | non      | « voir plus bas » sans plus bas                                                                |
| 15  | `PATRON-NITNOI` | non      | patron « mot + นิดหน่อย » décrit trois fois de trois façons                                    |
| 16  | `AUDIO-PAIRE`   | non      | ralentir la réplique 7 contredit la demande de répétition                                      |
| 17  | `CNT-EX1`       | non      | ventilation de douze tirages qui en compte onze                                                |
| 18  | `REEMPLOI-24`   | non      | périmètre du tableau de réemploi incomplet et partiellement inutilisé                          |

## Recommandation d'outillage

Trois des dix bloquants viennent du même trou : **rien dans le dépôt ne vérifie
une phrase française qui interprète une source**. `item-fields-check.mjs`
compare des champs et ne lit pas les `note_fr` ; `repo-thai-scan.mjs` compte des
graphies ; `unicode-thai.mjs` compte des points de code. Les trois passent au
vert sur ce fichier, et les trois passeraient au vert sur un fichier qui dirait
n'importe quoi de ses sources.

Deux mesures concrètes, à porter aux arbitrages de la leçon :

1. **Étendre `item-fields-check.mjs` aux références du CORPS des champs**, pas
   seulement des titres. Le finding 4 est exactement ce que le script existe pour
   attraper, et il l'a manqué parce que la référence était dans un `note_fr`. Une
   règle simple suffirait : toute chaîne `uXX-lYz` suivie d'un texte entre
   guillemets français doit voir ce texte retrouvé dans le fichier référencé.
2. **Exiger que toute citation VOLUBILIS donne le nombre de lignes rendues**, pas
   seulement leur plage. Le finding 7 disparaîtrait à l'écriture.

Le finding 1, lui, ne se corrige pas par un script : il se corrige en citant les
colonnes qui contredisent, aussi systématiquement que celles qui confirment. Le
fichier le fait partout ailleurs. C'est ce qui rend l'omission de la ligne 52691
mesurable, et c'est pourquoi elle est bloquante.

## Ce qui n'a PAS pu être vérifié

- **Le contre-audit externe** : non lancé, conformément à la politique de budget.
- **La naturalité** des deux demandes complètes et de เข้าใจนิดหน่อย : les
  incertitudes 2 et 3 restent entières, aucune source consultable ne les tranche.
  L'incertitude 2 reste le point le plus incertain du fichier.
- **La revue native** : en attente, comme partout dans le parcours.
- **Le texte exact des conditions d'usage du RID** : inchangé depuis le constat
  du 3 août 2026, toujours porté aux points à re-vérifier de la politique.

---

# Second contre-audit indépendant de `lecon-11a.md`

- Date : 2026-08-04, passe 2
- Auditeur : second agent de contre-audit interne, consigne adversariale
- **Ce document ne remplace pas la passe 1 ci-dessus, il la contrôle.** La passe 1
  a été traitée comme une source de plus : chacune de ses affirmations a été
  réexécutée depuis les artefacts d'origine avant d'être reprise. Le dépôt a
  récemment produit des corrections d'audit fausses ; une passe qui recopierait
  la précédente ne vaudrait rien.
- Méthode : réexécution complète des sept scripts versionnés, retéléchargement
  des trois fichiers Unicode, relecture en direct de 9 entrées du RID, de 6
  entrées en.wiktionary et de 34 lignes VOLUBILIS sur l'exemplaire empreinté,
  recalcul des 13 planchers d'exercice, relecture des 24 réemplois dans leurs
  fichiers d'origine.

## Verdict de la passe 2

**156 faits confirmés par mes propres exécutions. 12 findings retenus, dont 8
bloquants.**

Sur les 18 findings de la passe 1 : **17 sont confirmés** par réexécution
indépendante, **1 est corrigé sur un point de fait** (finding 7, voir ci-dessous,
la citation est plus fausse que ce que la passe 1 a mesuré). Aucun finding de la
passe 1 ne s'est révélé faux. La passe 2 ajoute **six findings que la passe 1
n'a pas vus**, dont deux bloquants.

## A. Contre-vérification de la passe 1

| Finding passe 1    | Statut après réexécution indépendante                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 `SENS-RUEUANG`   | **CONFIRMÉ, et aggravé.** RID « รู้เรื่อง » relue ici : l'exemple est `พูดเท่าไร ๆ ก็ไม่รู้เรื่อง`, soit littéralement de la parole non saisie. RID « เข้าใจ » = `ก. รู้เรื่อง, รู้ความหมาย.` VOLUBILIS 52691 ENG « do not understand a word », 85389 ENG « understand ; see ; know ». Les deux sources citées contredisent l'interdiction affichée.                              |
| 2 `REF-FANGOK`     | **CONFIRMÉ.** ฟังออก = `ก. เข้าใจ, รู้เรื่อง.` contre เข้าใจ = `ก. รู้เรื่อง, รู้ความหมาย.` Un seul mot commun.                                                                                                                                                                                                                                                                   |
| 3 `TON-CH3`        | **CONFIRMÉ.** `u04-l4d` item 6 `ton: descendant`, `u09-l9c` item 1 `ton: descendant`. Deux tons, pas trois.                                                                                                                                                                                                                                                                       |
| 4 `REF-4D5E`       | **CONFIRMÉ.** `grep "place est fixe"` sur tout `content/authoring/` : une seule occurrence hors 11A, `unite-04/lecon-4d.md` ligne 152. `u05-l5e` item 2 écrit « ไม่ passe devant ce qu'il annule », pas la phrase citée.                                                                                                                                                          |
| 5 `SON-AAI`        | **CONFIRMÉ.** `u04-l4a` item 4 : ก้าว, `ipa /kaːw˥˩/`, `transcription kâao`. Noyau `aao`, pas `aai`.                                                                                                                                                                                                                                                                              |
| 6 `COORD-2`        | **CONFIRMÉ par recomputation indépendante** : croisement des 42 graphies de l'unité 11 contre les 337 des unités 1 à 10, **35 redéclarations portant sur 26 graphies distinctes**. La Méta en annonce deux.                                                                                                                                                                       |
| 7 `VOL-CHA`        | **CONFIRMÉ ET ÉTENDU.** ช้า rend bien **six** lignes, 6345 à 6350. La passe 1 s'arrête là ; j'ajoute que **la ligne 6349 ne porte AUCUNE colonne SYLLAB**, alors que l'item 7 écrit « respelling `[ช้า]` » pour les cinq. Or 6349 est précisément la ligne qui porte l'adverbe « lentement », c'est-à-dire le sens enseigné. La citation est donc fausse sur deux points, pas un. |
| 8 `ECHAF-EX3`      | **CONFIRMÉ.** Méta : exercices 1, 3, 5 en `absent` ; exercice 3 Interaction : « Blocs affichés en thaï avec leur transcription ».                                                                                                                                                                                                                                                 |
| 9 `REG-ORDRE`      | **CONFIRMÉ.** VOLUBILIS 75426 relue : `\phūt _īk -thī`, `v. exp.`, ENG « repeat », FRA « répéter », aucune marque de mode. RID sans vedette pour la locution, confirmé. Rien n'établit « พูดอีกที est un ordre ».                                                                                                                                                                 |
| 10 `USAGE-YAMOK`   | **CONFIRMÉ.** Page 5 « tout aussi courante » et « on laisse une espace devant lui » contre la note culturelle « rien de la fréquence … rien d'une règle typographique d'espacement ».                                                                                                                                                                                             |
| 11 `SYLL-ECART`    | **CONFIRMÉ.** `u04-l4a` page 9 relue : la paire d'entraînement est ขา / ค้า, adjacente et sans écart.                                                                                                                                                                                                                                                                             |
| 12 `CNT-ABSENT5`   | **CONFIRMÉ.** Quatre recherches énumérées, cinq annoncées ; j'ai exécuté les quatre, toutes ABSENT. Le « cinq » vient probablement du nombre de LIGNES retrouvées (6407, 7002, 7652, 75313, 111852), qui est bien cinq.                                                                                                                                                           |
| 13 `CNT-RID17`     | **CONFIRMÉ.** `rid-lookup.mjs เข้าใจนิดหน่อย` rend `absent` ; la graphie n'apparaît dans aucune des cinq listes du décompte. 18 interrogées, 6 absentes.                                                                                                                                                                                                                          |
| 14 `REF-THAI`      | **CONFIRMÉ.** ไทย n'apparaît qu'aux lignes 514 et 1152 ; le renvoi « voir plus bas » pointe vers une mention située PLUS HAUT et qui n'explique rien.                                                                                                                                                                                                                             |
| 15 `PATRON-NITNOI` | **CONFIRMÉ.** 41124 กินนิดหน่อย `v. exp.`, 55280 มีอาการนิดหน่อย `v. exp.`, 111566 ยากนิดหน่อย `TYPE X`. Deux verbes en tête, pas trois, pas un.                                                                                                                                                                                                                                  |
| 16 `AUDIO-PAIRE`   | **CONFIRMÉ.** Le tableau du dialogue n'annote « lentement » qu'à la réplique 3 ; la contrainte de production impose la même paire aux répliques 5 et 7, alors que la réplique 6 demande une répétition.                                                                                                                                                                           |
| 17 `CNT-EX1`       | **CONFIRMÉ.** 4 + 3 + 4 = 11 sur 12 tirages ; le tirage 12 (ได้ไหม) n'est décrit par aucune des trois catégories.                                                                                                                                                                                                                                                                 |
| 18 `REEMPLOI-24`   | **CONFIRMÉ.** `u01-l1b` item 2 publie ข้าว `khâao`, réemployé à l'écran dans le `note_fr` de l'item 1 et absent du tableau ; สวัสดีครับ figure au tableau et n'apparaît nulle part dans le fichier hors de ce tableau.                                                                                                                                                            |

**Aucun finding de la passe 1 n'est infirmé.** Le seul écart de mesure porte sur
le finding 7, dont la passe 1 sous-estime la portée.

## B. Ce que la passe 2 confirme sur le fond du dossier (156 faits)

Je ne reprends pas le détail de la passe 1, que mes propres exécutions
recoupent chiffre pour chiffre. Ce qui a été refait ici de bout en bout :

- **VOLUBILIS, 40 faits.** Empreinte recalculée `b9ab7418…c0c`, 10 848 409
  octets, **114 579 lignes non vides, 586 541 chaînes partagées**. Les 34 lignes
  citées rouvertes une par une, colonnes ThaiRom, ThaiPhon, TYPE, ENG, FRA, DOM
  et SYLLAB comparées à la lettre. Les cinq recherches exactes qui rendent un
  faux ABSENT reproduites.
- **RID, 17 faits.** Corps de 9 entrées relus (เข้าใจ, รู้เรื่อง, ฟังออก, ได้,
  ช้า, อีก, ที, ยมก, ไม้ยมก), 5 absences et 3 présences confirmées. ได้ porte bien
  six sens dont (๒) après verbe et (๔) permission, et **aucune lecture entre
  crochets** : l'absence déclarée est réelle. ยมก porte bien `[ยะมก]` =
  U+0E22 U+0E30 U+0E21 U+0E01.
- **en.wiktionary, 11 faits.** Six entrées lues en rendu, cinq HTTP 404
  confirmés. **L'exemple d'usage de l'entrée อีกที est exact au caractère près**,
  romanisation comprise : `กรุณาพูดอีกทีได้ไหมครับ` /
  `gà-rú-naa pûut ìik-tii dâai mǎi kráp` / « Could you please repeat that? ».
  C'est la pièce qui porte les items 5 et 6, et elle tient.
- **Unicode 17.0, 3 faits.** Trois fichiers retéléchargés, empreintes et tailles
  identiques aux déclarations, lignes 3257, 1461 et 384 exactes.
- **FrequencyWords, 12 faits.** Empreinte identique, 50 000 lignes, première
  ligne `เธ 81142`, et **les onze rangs cités exacts**.
- **Scripts du dépôt, 12 faits.** `--check-u07` passe dix sur dix ; 1 à 10 rend
  50 / 461 / 337 ; 11 à 11 rend 5 / 51 / 42 ; **les neuf collisions internes sont
  exactement les neuf nommées** et aucune graphie de 11A n'est revendiquée
  ailleurs ; `item-fields-check` rend 0 champ `codepoints` en faute ;
  `unicode-thai` rend les huit séquences NFC exactes.
- **Réemplois, 24 faits, priorité 1.** Les 24 blocs rouverts dans leurs fichiers
  d'origine et comparés champ par champ : **0 écart de transcription**. Les
  répliques 5 et 6 du dialogue de `u02-l2e` sont bien les siennes, à la
  particule près.
- **Décodabilité, priorité 2.** Vérifiée réplique par réplique : aucun mot du
  dialogue n'échappe aux unités 1 à 10 ni à 11A. Le seul mot que la source de
  l'item 6 apporte et que le parcours ne possède pas, กรุณา, est retiré et le
  retrait est déclaré.
- **Planchers, 13 faits.** Les six stratégies de l'exercice 1, les deux de
  l'exercice 2, les deux de l'exercice 3, l'absence de plancher de l'exercice 4
  et les trois de l'exercice 5 recalculés sur les tables telles qu'elles sont
  écrites. **Tous exacts, aucun exercice n'est réussissable par une réponse
  constante.**
- **Tons et longueurs, 8 faits.** Recalculés depuis la classe de la consonne et
  le type de syllabe pour les huit items, y compris la voyelle longue de ได้,
  double-sourcée (phonémique `ด้าย` chez en.wiktionary, macron chez VOLUBILIS).

## C. Findings propres à la passe 2

### 19. `META-ZERO3` — BLOQUANT — la Méta énonce un décompte que le dossier contredit lui-même

Méta, paragraphe qui justifie l'existence de la leçon :

> la recherche des graphies เข้าใจ, อีก, ช้า et ได้ dans les sections `## Items`
> des unités 1 à 10 **rend zéro pour trois d'entre elles** et une seule
> occurrence de ได้, à l'intérieur de อยากได้ (`u08-l8b`).

Réexécuté ici, `repo-thai-scan.mjs 1 10 --grep` :

| Motif  | Graphies rendues                                                |
| ------ | --------------------------------------------------------------- |
| เข้าใจ | **0**                                                           |
| อีก    | **0**                                                           |
| ช้า    | **3** — เช้า, ตอนเช้า, ผมไปตลาดตอนเช้าครับ, toutes de `u07-l7c` |
| ได้    | **1** — อยากได้                                                 |

Zéro pour **deux**, pas pour trois. Et la partie 1 du même fichier écrit le bon
chiffre, 3, huit cents lignes plus bas : **le fichier se contredit lui-même sur
le relevé qui fonde sa raison d'être.**

La substance survit, aucune des trois occurrences n'étant le mot du jour, et la
partie 1 le dit correctement. Mais c'est le défaut `BALAYAGE-INVENTE` de
`u09-l9a` reproduit une fois de plus, et il est cette fois dans le paragraphe le
plus lu du fichier. **Correction attendue** : aligner la Méta sur la partie 1.

### 20. `USAGE-DEBIT` — BLOQUANT — une page entière de normes d'interaction sans source

Le dossier s'engage explicitement : « Ce fichier n'invente AUCUNE information
pratique : … **aucun usage social qu'il ne pourrait pas sourcer**. »

La page 11, écran d'apprenant intitulé **« la règle du débit »**, affirme :

> Demander de répéter n'est pas une faute, et demander de ralentir n'en est pas
> une non plus. Vous pouvez le faire deux fois, trois fois, sur la même phrase.
> **La seule chose qui ferme une conversation**, c'est de faire semblant d'avoir
> compris.

et la page 1 ajoute « Dans la rue, **personne** ne fait cela » et « c'est ce qui
arrive à **tout le monde**, longtemps ».

Aucune source n'est produite pour aucun de ces quatre énoncés, qui portent sur le
comportement d'interlocuteurs et sur l'effet social d'une demande de répétition.
La section 1 bis de la politique proscrit nommément les absolus de ce type, et
l'incertitude 4 ne couvre QUE l'hypothèse de comportement du dialogue, pas ces
affirmations. Le finding 9 de la passe 1 (`REG-ORDRE`) relève le même geste sur
la page 3 ; il n'est pas isolé, c'est un régime d'écriture.

**Correction attendue** : soit sourcer sur une grammaire de référence ou une
publication en accès libre, soit reformuler en intention pédagogique assumée
(« ce cours vous encourage à demander, et il considère que … ») au lieu d'un fait
d'usage. La formulation actuelle n'est ni l'une ni l'autre, et elle est affichée.

### 21. `SRS-YAMOK-ECRIT` — non bloquant — une carte exige une production que rien n'enseigne

`srs-u11-l11a-02` : « Le tirage exige au moins deux situations où **la réponse
s'écrit, afin que le ๆ soit produit** et pas seulement entendu. »

Produire ๆ suppose d'écrire en thaï. Or :

- l'exercice 4, seul exercice de production du fichier, impose « **alphabet latin
  uniquement** » et attend `phôuut cháa cháa dâai mǎi khá`, transcription dans
  laquelle ๆ **n'apparaît pas** ;
- les exercices 1, 2, 3 et 5 se répondent au toucher ou au choix, aucun ne
  produit de graphie ;
- l'objectif observable de la Méta dit « il produit **en transcription** les huit
  formules ».

Aucun écran de 11A, et aucune leçon du parcours à ce stade, ne demande à
l'apprenant d'écrire du thaï. La carte 02 mesure donc une compétence que le
parcours n'a pas installée, et son critère « 8 situations sur 10 » ne peut pas
être atteint par ce que la leçon entraîne.

**Correction attendue** : soit retirer la clause du ๆ produit, soit la transformer
en reconnaissance (choisir entre `ช้า ๆ` et `ช้า` à l'écrit), soit déclarer
explicitement que la carte ouvre la production écrite du thaï, ce qui est une
décision de parcours et pas une décision de leçon.

### 22. `LONG-CHACHA` — non bloquant — une divergence VOLUBILIS de longueur, non signalée

Le dossier consacre sa partie 3 à une divergence de ton de la colonne `ThaiPhon`
et pose deux fois en règle que **le macron y note la voyelle longue** (items 5 et
7). Relevé ici sur le même exemplaire :

| Ligne       | Graphie              | ThaiPhon         | Longueur notée       |
| ----------- | -------------------- | ---------------- | -------------------- |
| 6345 à 6350 | ช้า                  | `¯chā`           | longue               |
| 6407        | `ช้า ๆ = ช้าๆ`       | `¯cha¯cha`       | **brève, deux fois** |
| 75313       | `พูดช้า ๆ = พูดช้าๆ` | `\phūt ¯cha¯cha` | **brève, deux fois** |

Par la convention que le dossier a lui-même énoncée, les deux seules lignes qui
attestent la forme du jour notent des voyelles BRÈVES, quand la leçon enseigne
« les deux cháa **longues** » et écrit `/t͡ɕʰaː˦˥.t͡ɕʰaː˦˥/`. La leçon a raison
sur le fond, la longueur étant confirmée par les six lignes de ช้า seul et par
en.wiktionary, mais elle applique ici le silence qu'elle refuse pour ที.

**Correction attendue** : signaler la divergence comme celle de la partie 3, en
concluant qu'il s'agit selon toute vraisemblance d'une notation de redoublement
et non d'un fait de longueur, ou l'ouvrir au contre-audit externe.

### 23. `LICENCE-YAMOK` — non bloquant — une définition du RID rendue sur un écran

Le dossier écrit deux fois qu'« aucune définition du RID n'est restituée sur un
écran d'apprenant », contrainte qu'il rattache au finding `SENS-MONO`, et le
tableau des audits coche Licence « vérifiée, … aucune définition restituée sur un
écran ». La note culturelle, qui est un écran, écrit :

> Le mot ยมก … veut d'abord dire **la paire, le double, ce qui est en deux
> étages**, et il vient du **pali et du sanskrit**.

RID, entrée « ยมก », relevée ici : `(๑) [ยะมก] น. คู่, แฝด, ๒ ชั้น (ป., ส.).`
C'est la traduction de la liste de gloses, dans l'ordre, origine comprise. La
section 1 ter fait du RID l'autorité définitionnelle pour ce terme ; elle
n'autorise pas à en reproduire la définition, que la politique de sources
interdit par ailleurs sans réserve.

**Correction attendue** : reformuler originalement, par l'effet du signe plutôt
que par la liste de sens, ou ramener l'engagement de licence à sa portée réelle.

### 24. `ARBI2-10B` — non bloquant — l'inventaire des demandes SRS en oublie une

Arbitrage 2 : « `u09-l9a`, `u10-l10a`, `u10-l10c`, `u10-l10d` et `u10-l10e` ont
toutes demandé d'ajouter leurs tirages … **exécuter les six demandes ensemble** ».

`content/authoring/unite-10/lecon-10b.md` porte lui aussi une demande d'apport,
ligne 1198, à `srs-u07-l7a-03` (tirages ทาง, ออก …), et déclare explicitement
n'avoir rien pour `srs-u04-l4a-06` (ligne 1201). Les demandes en attente sont
donc **sept** avec celle de 11A, pas six.

Le fait de fond est confirmé : `srs-u04-l4a-06`, dans `u04-l4a`, ne porte
toujours aucun tirage rapporté. L'arbitrage est fondé, son inventaire est
incomplet.

## D. Récapitulatif de la passe 2

| #   | Code              | Bloquant | Origine                                        |
| --- | ----------------- | -------- | ---------------------------------------------- |
| 1   | `SENS-RUEUANG`    | oui      | passe 1, confirmé et aggravé                   |
| 2   | `REF-FANGOK`      | oui      | passe 1, confirmé                              |
| 4   | `REF-4D5E`        | oui      | passe 1, confirmé                              |
| 5   | `SON-AAI`         | oui      | passe 1, confirmé                              |
| 6   | `COORD-2`         | oui      | passe 1, confirmé par recomputation (35 / 26)  |
| 7   | `VOL-CHA`         | oui      | passe 1, **étendu** : 6349 sans colonne SYLLAB |
| 19  | `META-ZERO3`      | **oui**  | **passe 2**                                    |
| 20  | `USAGE-DEBIT`     | **oui**  | **passe 2**                                    |
| 21  | `SRS-YAMOK-ECRIT` | non      | **passe 2**                                    |
| 22  | `LONG-CHACHA`     | non      | **passe 2**                                    |
| 23  | `LICENCE-YAMOK`   | non      | **passe 2**                                    |
| 24  | `ARBI2-10B`       | non      | **passe 2**                                    |

Les findings 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 et 18 de la passe 1 sont
confirmés par la passe 2 et restent au dossier, sans être répétés ici.

**Total consolidé : 24 findings, dont 10 bloquants** (les 10 de la passe 1, dont
un étendu, plus les 2 nouveaux bloquants de la passe 2, deux d'entre eux portant
sur le même geste que `REG-ORDRE` et pouvant être corrigés ensemble).

## E. Ce que la passe 2 n'a pas pu vérifier

- La naturalité des deux demandes complètes et de เข้าใจนิดหน่อย : aucune source
  de la politique ne la donne. Les incertitudes 2 et 3 restent entières et ne
  doivent être fermées ni par un modèle ni par un audit.
- Le degré de politesse après retrait de กรุณา : même remarque, c'est le point
  le plus incertain du fichier.
- Les grammaires de référence, non acquises, qui trancheraient l'incertitude 1
  (série des verbes en ออก) et le finding 9 (pragmatique de la forme nue).
- La revue native, en attente comme partout dans le parcours.

## F. Constat de méthode, à porter à l'arbitrage 7

Les deux passes convergent sur le même diagnostic, et la seconde le mesure : sur
**156 faits mécanisables**, le fichier est exact **156 fois**. Sur les phrases
françaises qui interprètent une source ou qui résument un relevé, il se trompe
**24 fois**, dont 10 fois de façon bloquante. Les trois scripts du dépôt passent
au vert sur ce fichier, et ils passeraient au vert sur un fichier qui dirait
n'importe quoi de ses sources.

Deux mesures, en plus de celles déjà proposées par la passe 1 :

1. **Un fichier de leçon ne devrait pouvoir écrire un décompte interne qu'en le
   produisant.** Les findings `META-ZERO3`, `COORD-2`, `CNT-ABSENT5`, `CNT-RID17`
   et `CNT-EX1` sont cinq variantes d'un seul geste : additionner de tête. Un
   contrôle qui extrait les nombres du fichier et redemande leur provenance
   coûterait moins qu'un contre-audit.
2. **Toute citation de source doit porter le nombre de résultats rendus, pas
   seulement leur plage**, et **toutes les colonnes lues de la ligne citée**.
   `VOL-CHA` et `SENS-RUEUANG` disparaîtraient l'un et l'autre à l'écriture.

Aucun passage `draft → review` avant résolution des dix bloquants consolidés.
