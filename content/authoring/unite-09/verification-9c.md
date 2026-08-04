# Contre-audit interne adversarial de `u09-l9c` — round 2 (version consolidée)

- Fichier audité : `content/authoring/unite-09/lecon-9c.md`
- Empreinte au moment de cet audit, rendue par
  `node scripts/verification/unicode-thai.mjs content/authoring/unite-09/lecon-9c.md` :
  136 804 octets, SHA-256
  `c614da70cc912d6278edcb2da4ca7eae1129811f8625869360b7431709218409`
- Date : 2026-08-04
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer ».
  Aucune source citée par la leçon n'a été crue sur parole.
- Le round 1 (sur la version `2bc50404…`) est conservé en annexe, plus bas.
- Résultat : **50 faits re-vérifiés et confirmés par l'auditeur**,
  **3 findings bloquants**, **9 findings non bloquants**.

## Méthode

Consultations refaites le 2026-08-04 avec les scripts versionnés
(`rid-entry.mjs`, `rid-lookup.mjs`, `repo-thai-scan.mjs`, `unicode-thai.mjs`,
`item-fields-check.mjs`, `volubilis-codes.mjs`), plus un lecteur ODS écrit pour
l'occasion afin d'obtenir les colonnes NON collapsées du classeur (le script
versionné joint les cellules non vides, ce qui interdit d'indexer `THA` et
`KEY`). Le lecteur a été calibré sur `C086`, dont la sortie coïncide
caractère pour caractère avec celle de `volubilis-codes.mjs`.

## Faits re-vérifiés et CONFIRMÉS (50)

### Dictionnaire royal, 13 consultations refaites

| Graphie                                                        | Ce que l'auditeur a lu                                                                                                                                                                                      | Verdict                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ช่วย                                                           | vedette, 5 sens ; (๑) étiqueté (โบ) = ไถ่ตัว ; (๒) ทำให้สำเร็จประโยชน์ + ช่วยเอาของไปส่ง ; (๓) ค้ำจุน สงเคราะห์ ; (๔) แบ่งเบาภาระ ; (๕) ทำให้พ้นจากอันตราย + ช่วยชีวิต ; ลูกคำ ช่วยเหลือ                    | conforme                                                                  |
| ด้วย                                                           | vedette, 3 sens ; (๑) ว. dont แสดงความขอร้อง avec les DEUX exemples ช่วยด้วย et บอกด้วย ; (๒) บ. ; (๓) สัน.                                                                                                 | conforme                                                                  |
| เรียก                                                          | vedette, 4 sens ; (๑) เปล่งเสียง… + แม่เรียกให้มาทำการบ้าน et ช่วยเรียกสุนัขไปเสียที, puis ออกชื่อ, puis เชิญ + เรียกประชุม เรียกหมอ เรียกน้ำ เรียกลม ; (๔) (ปาก) ; la liste ลูกคำ ne contient PAS เรียกหมอ | conforme                                                                  |
| หมอ                                                            | หมอ ๑ : (๑) ผู้รู้ ผู้ชำนาญ + หมองู หมอนวด ; (๒) ผู้ตรวจรักษาโรค + หมอฟัน หมอเด็ก. หมอ ๒ (ปาก). หมอ ๓ poisson                                                                                               | conforme                                                                  |
| ห                                                              | 41e lettre, nommée หอ หีบ, อักษรสูง, mène une basse ISOLÉE pour qu'elle s'infléchisse comme une haute, ห non prononcé, ex. หงอย หนา ; lecture [หอ] = U+0E2B U+0E2D                                          | conforme                                                                  |
| คำเป็น                                                         | voyelle longue sans finale ET séries กง กน กม เกย เกอว                                                                                                                                                      | conforme ; suffit à établir que ช่วย et ด้วย sont vivantes et เรียก morte |
| ช่วยเหลือ, ฉุกเฉิน                                             | `entree`                                                                                                                                                                                                    | conforme                                                                  |
| ช่วยด้วย, เรียกหมอ, คุณหมอ, ขอความช่วยเหลือ, ช่วยเรียกหมอหน่อย | `absent` toutes les cinq                                                                                                                                                                                    | conforme                                                                  |

Le décompte du dossier, **13 interrogées = 8 attestées + 5 absentes**, est exact.

### Wiktionary, 8 relevés refaits en rendu

- ช่วย : IPA /t͡ɕʰua̯j˥˩/, Paiboon `chûai`, RI `chuai`, verbe transitif « to help ».
- ด้วย : IPA /dua̯j˥˩/ ; adverbe dont « used at the end of an expression to
  indicate an appeal, request, or requirement » ; conjonction ; préposition.
- ช่วยด้วย : IPA /t͡ɕʰua̯j˥˩.dua̯j˥˩/, interjection, « help! (an urgent call for
  assistance and saving) », étymologie ช่วย + ด้วย, la seconde nommée
  « request particle ».
- เรียก : IPA /ria̯k̚˥˩/ ; « to call: to summon » et « to call: to ask or invite
  (to come) » ; เรียกตำรวจ et เรียกแท็กซี่ parmi les exemples.
- หมอ : IPA /mɔː˩˩˦/, respelling phonémique หฺมอ (พินทุ sous le ห), classificateur
  คน, ordre des sens expert → occulte → médecine, puis « slang, often
  derogatory » pour l'emploi d'adresse.
- Annexe « Appendix:Thai script » : `–ว–` _sara ua_ IPA `ua` RTGS `ua` ;
  **`–วย` _sara ua with yo yak as closing consonant_, IPA `uɛj`, RTGS `uai`** ;
  `–อ` _sara o_ IPA `ɔː` RTGS `o`. La divergence IPA `uɛj` signalée par le
  dossier est réelle.
- Existence : th.wiktionary répond 200 pour ช่วย, ด้วย, เรียก, หมอ et **404 pour
  ช่วยด้วย** ; คุณหมอ, เรียกหมอ et ช่วยเรียกหมอหน่อย sont en 404 dans les DEUX
  éditions.

### Volubilis, exemplaires et 26 entrées refaites

- `VOLUBILIS.ods` : 15 724 718 octets, SHA-256
  `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`.
  **Identique à ce qu'annonce le dossier.**
- `VOLUBILIS_Database.xlsx` : 154 octets, contenu = page HTML `404 Not Found`,
  SHA-256 `8cf5ce27d21490c24eedf91e0ac2bc4a748ba8f4eb20cb7c1fc9442d2d580008`.
  **Identique à ce qu'annonce le dossier.** L'aveu de l'empreinte fausse
  retirée est donc lui-même exact.
- Contenus exacts confirmés cellule par cellule pour `C086`, `C1645`, `C3166`,
  `C087`, `C1062`, `C1592`, `C1371`, `C339`, `C1627`, `D162`, `D051`, `D163`,
  `R296`, `R5674`, `R1479`, `R5773`, `R1762`, `M537`, `M122`, `M4415`, `M5653`,
  `K25758`, `K4943`, `K11009`, `N678`, `N2677`.
- Balayage complet de la feuille : **21 graphies distinctes commencent par
  ช่วย** (chiffre du dossier exact) et **une seule entrée de toute la base
  combine ช่วย et หน่อย**, `C1627` ช่วยแนะนำ...ให้หน่อยได้มั้ย, **qui porte ให้**.
- Absences confirmées : ช่วยเรียกหมอหน่อย, ช่วยเรียกหมอ, เรียกหมอหน่อย, ช่วยหน่อย,
  ช่วยด้วยครับ.
- Feuille `Codes`, clé `TONES` : `-x` normal, `¯x` high, `_x` low, `/x` rising,
  `\x` falling — et le filtre `TONES` ne rend bien que la ligne d'intitulé, la
  correction de citation du dossier est fondée.
- Feuille `Romanization` : `ออ` = `ø` / ลอม ; `เอาะ` = `o` / เลาะ ; `อวย` = RTGS
  `uai`, VOLUBILIS `ūay` / มวย ; `-ว- (อัว ลดรูป)` = `ūa` / รวม ; `เอีย` = `īe` ;
  `เอียะ` = `īa` ; `เอือ` et `เอือะ` toutes deux `eūa` ; `อัว` = `ūa` contre
  `อัวะ` = `ua`. **L'observation de l'incertitude 2 est exacte sur les quatre
  points**, y compris le fait que le macron ne distingue rien pour la famille
  `เอีย`/`เอียะ`.

### Fréquence, 6 relevés refaits

`th_50k` du 2026-08-04 : ช่วย 2291 (172), ด้วย 377 (981), ช่วยด้วย 172 (2 106),
เรียก 2343 (167), หมอ 643 (604), ครับ 10 (15 205). **Les six valeurs citées sont
exactes**, contrôle de reproductibilité de ครับ contre `u02-l2c` compris.

### Dépôt, décomptes recomputés

- `repo-thai-scan.mjs --check-u07` : convention REPRODUITE.
- Unités 1 à 8 : 40 fichiers, 383 entrées, 283 graphies distinctes. Exact.
- `--grep` : ช่วย 0, ด้วย 0, เรียก 0, หมอ 0, วย 0 ; **หม 7, la première étant
  หมา (`u01-l1d`)**. La correction de la ligne fautive est bonne.
- Unité 9 : หมอ n'est publié que par `u09-l9a` ; ช่วย, ด้วย, เรียก, ช่วยด้วย,
  เรียกหมอ et le bloc du jour ne sont publiés que par 9C. Attribution exacte.
- `unicode-thai.mjs` : NFC stable partout, 0 caractère de zone privée, les 8
  champs `thai` ont exactement les points de code déclarés, aucune lettre ne
  porte plus d'un signe, le bloc central compte bien 21 codes.
- 0 tiret cadratin, 0 demi-cadratin.
- Antériorités vérifiées une à une : `u01-l1d` (หมา montant/longue, ม้า haut),
  `u01-l1e` (ครับ /kʰrap̚˦˥/ haut, ค่ะ /kʰaʔ˥˩/ descendant, ขอบคุณ
  /kʰɔːp̚˨˩.kʰun˧/ « khàwwp bas ; khoun moyen », item 4), `u02-l2c` (items 3 à 8
  et leurs tons), `u03-l3c` incertitude 15, `u03-l3d` (ตัว `toua`, et NON 8A),
  `u04-l4a` (haute sans marque → montant), `u04-l4c` (items 1, 5 et 7),
  `u05-l5a` (neuf basses ค ง ช ซ ท น พ ฟ ม, ร absente), `u05-l5e` item 10,
  `u06-l6b` item 3 (พี่ descendant), `u07-l7a` item 5 (ช้อน haut) et ses deux
  règles de marque, `u08-l8a` (8 graphies dont 5 en เ), `u08-l8d` (la phrase
  « périmètre et non de source » est bien celle du fichier), `u09-l9a` item 3.
- Section 1 bis : balayage refait sur « français », « française »,
  « francophone », « oreille », « bouche », « réflexe », « un œil ».
  **Zéro assertion de phonétique française résiduelle** dans le texte
  d'apprenant. La correction annoncée est réelle.
- **Sujet sensible : rien à signaler, et c'est vérifié.** Aucun numéro
  d'appel, aucune posologie, aucune consigne de conduite à tenir, aucun conseil
  médical. ฉุกเฉิน, รถพยาบาล et ตำรวจ n'apparaissent QUE dans le dossier de
  production et dans un champ `sources`, jamais sur un écran d'apprenant. Le
  renvoi au professionnel est bien en pages 1 et 12, dans les mots de la leçon.
- **Correspondances de finales : exactes.** La seule que la leçon pose, « le ว
  appartient au noyau, le ย est la consonne finale, donc syllabe vivante », est
  établie deux fois de façon indépendante (nom de la ligne `–วย` de l'annexe
  Wiktionary + séries de คำเป็น au RID), et la finale ก de เรียก est bien traitée
  comme morte, sans règle de ton déduite.
- **Planchers des exercices : aucun exercice n'est réussissable par une réponse
  constante.** Ex. 1 : 2/8 pour un seuil de 7. Ex. 2 : 3/9 pour un seuil de 7,
  et 3/9 aussi pour un apprenant qui intervertit systématiquement montant et
  haut. Ex. 3 : appariement, espérance 1 paire, sans-faute 1/720, seuil 5/6.
  Ex. 5 : 2/10 pour un seuil de 8. Ex. 6 : production libre, 1/8 au mieux.
  Ex. 4 : voir le finding N2, la conclusion tient mais la valeur affichée est
  fausse.

## Findings BLOQUANTS (3)

### B1 — « หมอ se lit exactement comme หมา » est faux, et l'erreur induite est un contresens

**Où.** Page 9 : « หมอ se lit exactement comme หมา, et son ton est le même :
montant. » Page 10 : « หมา […] s'écrit avec le même ห de tête devant le même ม,
**la même voyelle longue**, la même syllabe vivante et aucune marque. »
`note_fr` de l'item 5 reprend « même voyelle longue ».

**Preuve.** en.wiktionary donne หมอ /mɔː˩˩˦/ et `u01-l1d` donne หมา /mǎː/ ;
Volubilis M122 romanise `mø` quand 1D transcrit `mǎa`. Les deux mots ne
partagent NI la voyelle NI la lecture : ils partagent la structure d'écriture
et le ton. La page 10 se contredit d'ailleurs deux phrases plus loin (« หมอ ne
change qu'une voyelle ») et la Méta écrit correctement « à la voyelle près ».

**Pourquoi c'est bloquant.** Un apprenant qui applique la phrase de la page 9
prononce [mǎː], c'est-à-dire หมา, « chien », sur l'écran même qui lui apprend à
faire venir un médecin. La paire n'est pas théorique : le RID donne
ช่วยเรียกสุนัขไปเสียที au sens (๑) de เรียก, et เรียกหมา contre เรียกหมอ est
exactement la confusion que la leçon fabrique. Corriger en énonçant ce qui est
vrai : même ห de tête, même ม, même longueur, même type de syllabe, aucune
marque, **donc même ton** ; la voyelle, elle, change.

### B2 — le bloc enseigné en production n'est attesté nulle part, et le seul relevé qui porte sur sa jonction va contre lui

**Où.** Item 7, pages 5, 9 et 12, exercices 3, 4, 5 et 6, dialogue, carte
`srs-u09-l9c-03`.

**Preuve, refaite par l'auditeur.** ช่วยเรียกหมอหน่อย : `absent` au RID, 404 sur
les deux Wiktionary, absent de Volubilis. Balayage complet de la feuille
`Volubilis` : 21 graphies commencent par ช่วย, **une seule entrée de toute la
base combine ช่วย et หน่อย**, `C1627` ช่วยแนะนำ...ให้หน่อยได้มั้ย, **et elle
porte ให้**.

**Pourquoi c'est bloquant.** La chaîne enseignée, ช่วย + verbe + หน่อย SANS ให้,
est un fait ZÉRO-sourcé, enseigné en PRODUCTION (l'exercice 4 et l'exercice 6
demandent de la fabriquer) et cartonné. Le dossier le dit avec honnêteté à
l'incertitude 1 et interdit le passage en `review` : **le finding est CONFIRMÉ,
il n'est pas levé**. La question à poser au contre-audit externe est bien posée.
Tant qu'elle n'a pas de réponse, la leçon ne peut pas quitter `draft`.

### B3 — l'« étage 2 » fait dire aux relevés Volubilis autre chose que ce qu'ils disent

**Où.** Section « Sources du fait "ช่วย ouvre une demande d'action" », étage 2 :
« Aucune ne comporte ni ขอ ni ให้ : **le หน่อย de politesse s'attache donc bien à
un verbe seul.** » Et incertitude 1 : « ses deux articulations le sont, quatre
fois pour la première et **sept fois pour la seconde** ».

**Preuve, entrée par entrée sur le `.ods` dont le dossier donne l'empreinte.**

| Clé    | Graphie       | TYPE     | Glose de la base                      | Quel หน่อย ?     |
| ------ | ------------- | -------- | ------------------------------------- | ---------------- |
| C1968  | ชิมหน่อย      | v. exp.  | « goûter un peu »                     | adverbial        |
| K13081 | ขยับไปหน่อย   | v. exp.  | « move over a bit ; bouger un peu »   | adverbial        |
| L1569  | ลดหน่อย       | v. exp.  | « lower the price ; baisser le prix » | adverbial        |
| K7900  | คิดหน่อย      | v. exp.  | « réfléchir »                         | indécidable      |
| N101   | เงียบหน่อย    | **adj.** | « silent ; silencieux ; calme »       | **pas un verbe** |
| K16926 | เก็บเงินหน่อย | v. exp.  | « The bill, please »                  | demande adoucie  |
| R2601  | รีบหน่อย      | v. exp.  | « Dépêchons un peu ! »                | demande adoucie  |

Volubilis distingue les deux หน่อย par des ENTRÉES séparées, `N678` adverbe
« un peu ; pas très » et `N2677` particule « please », mais ne dit jamais
laquelle est en jeu dans une expression. Les gloses de la base rattachent au
moins trois des sept relevés à l'adverbe, et `N101` n'est même pas typée verbe.

**Pourquoi c'est bloquant.** C'est une référence qui ne dit pas ce qu'on lui
fait dire, sur le fait porteur du jour, et le chiffre « sept » sert de
contrepoids dans l'incertitude BLOQUANTE elle-même : il y rend la jonction
moins fragile qu'elle n'est. Le compte défendable est de deux relevés clairs,
plus la particule `N2677` en lemme et l'exemple ขอหน่อย de th.wiktionary cité
par `u02-l2c` — lequel porte ขอ, donc l'AUTRE patron. À réécrire en disant
exactement ce que les lignes établissent.

## Findings NON BLOQUANTS (9)

### N1 — « premier endroit du parcours » : faux

`note_fr` de l'item 6 : « C'est aussi le premier endroit du parcours où
l'apprenant enchaîne un ton descendant sur un ton montant à l'intérieur d'un
même groupe. » Balayage de tous les champs `ton` des unités 1 à 8 : `u05-l5c`
publie **ที่ไหน**, /tʰiː˥˩.naj˩˩˦/, « thîi descendant ; nǎi montant », et
`u05-l5e` publie อยู่ที่ไหน avec la même séquence. Le fait pédagogique reste
vrai et utile ; l'antériorité est fausse.

### N2 — plancher de l'exercice 4 : valeur fausse

« les six réponses étant deux à deux différentes ; la meilleure réponse
constante en vaut une sur six. » Les tirages 1 et 5 ont la MÊME réponse,
ช่วยเรียกหมอหน่อยครับ (seul le jeton excédentaire change, ขอ puis น้ำ). Les six
réponses ne sont donc pas deux à deux différentes et la meilleure réponse
constante vaut **2 sur 6**. La conclusion tient (seuil 5/6), la mesure affichée
est fausse dans une section qui revendique la mesure.

### N3 — le dossier se contredit sur l'unité 9

« Le dossier ne cite donc AUCUN item de 9A, 9B, 9D ou 9E, ne suppose rien de
leur contenu, et ne renvoie à aucun prérequis de l'unité 9. » Contredit par
l'item 5 (source « Item publié `u09-l9a` item 3, relu dans le dépôt »), par la
Méta, par le tableau des reprises, par l'incertitude 8 et par l'Arbitrage 4.
Paragraphe resté à l'état antérieur à la consolidation.

### N4 — citation Volubilis non reproductible telle qu'écrite

« Elle porte aussi, **deux lignes plus haut**, `-ว- (อัว ลดรูป)` ». Sur
l'exemplaire dont le dossier donne l'empreinte, la feuille `Romanization`
sépare `-ว-` de `อวย` par douze entrées (อัว, `-ว-`, ใอ, ไอ, อัย, ไอย, อาย,
เอา, อาว, อุย, โอย, ออย, เอย, เอือย, อวย). Le CONTENU cité est exact, le repère
de position ne l'est pas, ce que l'amendement v1.2 interdit.

### N5 — « trois nommés pour quatre »

« `u01-l1d` publie หมา, หนา et หนี, **quatre** mots à ห muet ». 1D en publie bien
quatre, mais le quatrième, **ไหม** (son item 9), n'est pas nommé, alors que la
Méta et le tableau des reprises s'appuient dessus par ailleurs.

### N6 — `registre` de l'item 1 trop absolu

« Aucune étiquette de registre sur la vedette du RID, **aucune chez VOLUBILIS**,
aucune chez en.wiktionary. » La même graphie porte `C3166` avec USAGE
`(obsol.)`, ce que le dossier écrit lui-même trois lignes plus bas. L'item 2
emploie la bonne réserve, « pour la ligne retenue » ; l'item 1 doit faire pareil.

### N7 — `codepoints` de l'item 8 ne décrit pas son champ `thai`

`node scripts/verification/item-fields-check.mjs` le signale : le champ `thai`
vaut `ขอ … หน่อย` et contient U+2026, absent de la séquence déclarée. Défaut
partagé avec `9a`, `9b`, `9d` et `9e` ; à traiter à la consolidation d'unité,
pas ici seul.

### N8 — vocabulaire de longueur divergent sur des items réemployés

L'item 7 écrit « khráp brève » et « khâ brève » là où `u01-l1e` publie
« courte ». Le script de champs signale la même dérive sur `9e`. Choisir un
terme et l'appliquer.

### N9 — l'item 3 nie une qualification que la page 3 énonce

Le `registre` de l'item 3 affirme que la leçon « ne le qualifie pas non plus de
poli ». La page 3 écrit « C'est un cri, **pas une phrase polie** », ce qui est
une négation de registre sur un bloc dont le dossier établit lui-même
qu'aucune des trois sources ne porte d'étiquette. Reformuler en fait de forme
(« il ne porte ni หน่อย ni particule finale ») plutôt qu'en jugement de registre.

## Ce que l'auditeur n'a PAS pu trancher

- La naturalité du bloc central et du dialogue. Aucun relevé ne remplace un
  locuteur natif ; le lot de contre-audit externe est le bon véhicule.
- La longueur des noyaux glissés. L'observation de l'incertitude 2 est exacte,
  mais elle demande un arbitrage de dépôt, pas une source de plus.
- La distinction ปวด contre เจ็บ : hors périmètre de 9C, ces deux graphies sont
  ABSENTES du fichier. À vérifier sur les autres leçons de l'unité.

---

# Annexe : contre-audit round 1, conservé tel quel

Ce rapport porte sur la version ANTÉRIEURE du fichier, SHA-256
`2bc50404…`. Ses findings N1 à N12 ont été traités par la consolidation ; le
round 2 ci-dessus les a revérifiés sur la version courante.

- Fichier audité : `content/authoring/unite-09/lecon-9c.md`
- Empreinte du fichier au moment de l'audit, rendue par
  `node scripts/verification/unicode-thai.mjs content/authoring/unite-09/lecon-9c.md` :
  109 095 octets, SHA-256
  `2bc504046336f9470d21db037bb21185973de2586443b0b0974fe0cb1971d7c3`
- Date : 2026-08-04
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer »
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Chaque
  fait a été re-consulté par l'auditeur, avec les scripts versionnés du dépôt
  quand ils existent, et avec un lecteur ODS écrit pour l'occasion quand le
  script versionné ne pouvait pas s'exécuter.
- Résultat : **159 faits re-vérifiés et confirmés par l'auditeur**,
  **5 findings bloquants**, **7 findings non bloquants**.

## Ce qui a été re-vérifié, et comment

### Dictionnaire royal, 8 consultations refaites

Toutes par `node scripts/verification/rid-entry.mjs` et
`node scripts/verification/rid-lookup.mjs`, le 2026-08-04.

| Graphie                                                        | Ce que l'auditeur a lu                                                                                                                                                                                   | Verdict                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| ช่วย                                                           | vedette, 5 sens, (๑) étiqueté (โบ) et donnant ไถ่ตัว, (๒) ทำให้สำเร็จประโยชน์ avec ช่วยเอาของไปส่ง, (๓) ค้ำจุน สงเคราะห์, (๔) แบ่งเบาภาระ, (๕) ทำให้พ้นจากอันตราย avec ช่วยชีวิต, ลูกคำ ช่วยเหลือ        | conforme au dossier                                          |
| ด้วย                                                           | vedette, 3 sens, (๑) ว. dont แสดงความขอร้อง avec les DEUX exemples ช่วยด้วย et บอกด้วย, (๒) บ., (๓) สัน.                                                                                                 | conforme                                                     |
| เรียก                                                          | vedette, 4 sens, (๑) เปล่งเสียงเพื่อให้มา avec ช่วยเรียกสุนัขไปเสียที, puis ออกชื่อ, puis เชิญ avec เรียกประชุม เรียกหมอ เรียกน้ำ เรียกลม ; (๔) étiqueté (ปาก) ; la liste ลูกคำ ne contient PAS เรียกหมอ | conforme                                                     |
| หมอ                                                            | หมอ ๑ deux sens, expert d'abord avec หมองู หมอนวด, soignant ensuite avec หมอฟัน หมอเด็ก ; หมอ ๒ étiquetée (ปาก) ; หมอ ๓ poisson                                                                          | conforme                                                     |
| ห                                                              | 41e lettre, nommée หอ หีบ, อักษรสูง, mène une basse isolée pour qu'elle s'infléchisse comme une haute, ห non prononcé, exemples หงอย หนา, lecture [หอ] = U+0E2B U+0E2D                                   | conforme                                                     |
| คำเป็น                                                         | voyelle longue sans consonne finale, ET séries กง กน กม เกย เกอว                                                                                                                                         | conforme, et suffit à établir que ช่วย et ด้วย sont vivantes |
| ช่วยเหลือ, ฉุกเฉิน                                             | attestées                                                                                                                                                                                                | conforme                                                     |
| ช่วยด้วย, เรียกหมอ, คุณหมอ, ขอความช่วยเหลือ, ช่วยเรียกหมอหน่อย | `absent` toutes les cinq                                                                                                                                                                                 | conforme, les 5 absences annoncées sont réelles              |

Le décompte annoncé par le dossier, 13 graphies interrogées, 8 attestées et
5 absentes, est exact.

### Volubilis, 44 relevés refaits sur le `.ods`

Le `.xlsx` étant inutilisable sur le poste (voir le finding N6), l'auditeur a
relu le `.ods`, dont l'empreinte SHA-256 recalculée,
`bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, est bien
celle que le dossier annonce.

Le lecteur ODS employé a d'abord été **calibré** contre trois citations `.ods`
déjà publiées par le dépôt : ควาย 40395 (`u05-l5a`), กินข้าว 42559 (`u04-l4a`)
et เลี้ยว 51297 (`u05-l5b`). Les trois tombent au numéro exact. La numérotation
de l'auditeur est donc celle du classeur.

Toutes les entrées citées par la leçon existent et disent bien ce qu'on leur
fait dire :

- ช่วย, trois lignes, `\chūay`, « aider ; assister ; faciliter ; contribuer »
  puis « sauver ; secourir » puis l'emploi `(obsol.)`, domaines
  `RID ; SECURIT ; SOCIO ; TOURIST` sur la première ;
- `ช่วย...`, entrée à case vide, TYPE `X`, « Please … » ;
- ช่วยปิดหน้าต่าง, instance complète sans ให้ et sans หน่อย ;
- ช่วยด้วย, `n. exp.`, FRA « Au secours ! ; À l'aide ! ; Aidez-moi ! ; À la
  rescousse ! ; À moi ! », domaines `SECURIT ; TOURIST`, **aucune étiquette de
  registre**, ce qui confirme la prudence de l'item 3 ;
- ด้วย, trois lignes, préposition, adverbe, puis `loc.` « s'il vous plaît » ;
- เรียก `\rīek` et เรียกหมอ `\rīek /mø` avec la lecture entre crochets
  `[เรียก หฺมอ]`, พินทุ compris ;
- หมอ, quatre lignes, expert, médecin, `(oral)` « gars », Anabas testudineus ;
- หน่อย, deux lignes, dont `part.` glosée « please » et « s'il vous plaît » ;
- `ขอ … หน่อย`, TYPE `xp`, FRA « puis-je ... ? ; je voudrais ... s'il vous
  plaît » ;
- คุณหมอ, entrée unique, « Doctor » et « docteur [m] », `[คุน หฺมอ]` ;
- ขอความช่วยเหลือ, เรียกให้ช่วย, เรียกรถพยาบาล (« call an ambulance »),
  เรียกตำรวจ (« call the police ») ;
- les sept instances de verbe + หน่อย, ชิมหน่อย, คิดหน่อย, เก็บเงินหน่อย,
  ลดหน่อย, รีบหน่อย, เงียบหน่อย, ขยับไปหน่อย, aucune ne porte ขอ ni ให้ ;
- les cinq ABSENCES annoncées sont réelles : ช่วยเรียกหมอหน่อย, ช่วยเรียกหมอ,
  เรียกหมอหน่อย, ช่วยหน่อย, ช่วยด้วยครับ.

Clé `TONES` de la feuille `Codes`, relue : `-x` normal, `¯x` high, `_x` low,
`/x` rising, `\x` falling. Conforme.

Feuille `Romanization`, les sept entrées citées, relues une à une : `ออ` = RTGS
`o` / VOLUBILIS `ø` / exemple ลอม ; `เอาะ` = `o` / `o` / เลาะ ; `อวย` = `uai` /
`ūay` / มวย ; `-ว- (อัว ลดรูป)` = `ua` / `ūa` / รวม ; `เอีย` = `ia` / `īe` /
เลียน ; `เอียะ` = `ia` / `īa` / เผียะ ; `เอือ` et `เอือะ` toutes deux `eūa`.
**L'observation de l'incertitude 2 est exacte** : la forme brève `เอียะ` porte
le macron et la longue `เอีย` ne le porte pas au même endroit, donc le macron
ne marque pas la longueur dans cette famille, alors que pour `อัวะ` contre
`อัว` il la marque. L'auditeur confirme l'argument et la réserve.

### Wiktionary, 42 relevés refaits en rendu

Toutes les valeurs annoncées sont exactes, au caractère près :

- ช่วย /t͡ɕʰua̯j˥˩/, Paiboon `chûai`, RI `chuai`, verbe transitif « to help » ;
- ด้วย /dua̯j˥˩/, avec le sens adverbial « used at the end of an expression to
  indicate an appeal, request, or requirement », plus conjonction et
  préposition ;
- ช่วยด้วย /t͡ɕʰua̯j˥˩.dua̯j˥˩/, interjection, « help! (an urgent call for
  assistance and saving) », étymologie ช่วย + ด้วย, la seconde nommée
  « request particle » ;
- เรียก /ria̯k̚˥˩/, « to call: to summon » et « to call: to ask or invite (to
  come) », avec เรียกตำรวจ et เรียกแท็กซี่ ;
- หมอ /mɔː˩˩˦/, classificateur คน, sens expert AVANT sens médical, sens
  « slang, often derogatory », respelling หฺมอ ;
- annexe « Appendix:Thai script » : `◌ว◌` sara ua, IPA `ua`, RTGS `ua` ;
  `◌วย` **sara ua with yo yak as closing consonant**, IPA `uɛj`, RTGS `uai` ;
  `◌อ` sara o, IPA `ɔː`, RTGS `o` (l'annexe marque la consonne porteuse par un
  tiret, noté `◌` ici comme partout dans le parcours). La divergence `uɛj`
  contre /ua̯j/ que la
  leçon consigne existe bien, et la leçon a raison de ne pas la propager ;
- l'édition thaïe répond 200 pour ช่วย, ด้วย, เรียก et หมอ, et **404 pour
  ช่วยด้วย**. Absence réelle ;
- contrôles de l'auditeur sur les réemplois : ครับ /kʰrap̚˦˥/, ค่ะ /kʰaʔ˥˩/,
  ขอ /kʰɔː˩˩˦/, หน่อย /nɔj˨˩/ avec le respelling « Unorthographical ; Short »
  หฺน็่อย, ce qui confirme que `nàwi` est bien brève et que le contraste de la
  page 11 entre `awi` bref et `aww` long est juste.

### Fréquence, 6 rangs recalculés

Liste `th_50k` retéléchargée par l'auditeur. ช่วย rang 2291 / 172 occurrences,
ด้วย 377 / 981, ช่วยด้วย 172 / 2 106, เรียก 2343 / 167, หมอ 643 / 604,
ครับ 10 / 15 205. Les six valeurs tombent exactement, y compris le contrôle de
reproductibilité contre `u02-l2c`.

### Tons, re-dérivés à la main par l'auditeur

ช่วย basse + ไม้เอก en vivante = descendant. ด้วย moyenne + ไม้โท = descendant.
หมอ ห de tête, haute, vivante, sans marque = montant. เรียก syllabe MORTE à
voyelle longue, basse = descendant, non déductible des règles publiées, ce que
la page 10 dit honnêtement. Réemplois de l'exercice 2 : ขอ montant, ผม montant,
ครับ haut, น้ำ haut, ช้อน haut, ค่ะ descendant, พี่ descendant. Les neuf tirages
sont correctement étiquetés. Les tons de ขอบคุณ, ขอโทษ et ไม่เป็นไร employés au
dialogue sont eux aussi corrects.

Les règles invoquées existent bien où la leçon le dit : `u01-l1a` publie ด parmi
les neuf moyennes, `u04-l4a` la règle en vivante sans marque, `u05-l5a` les neuf
basses ค ง ช ซ ท น พ ฟ ม, `u07-l7a` le tableau, dont la ligne « consonne BASSE +
ไม้เอก, ton DESCENDANT » et « consonne MOYENNE + ไม้โท, ton DESCENDANT ».

### Unicode

`unicode-thai.mjs` sur le fichier : toutes chaînes NFC conformes, aucun
caractère de zone à usage privé, et les huit séquences des champs `thai`
identiques à celles écrites dans les items. ช่วยเรียกหมอหน่อยครับ compte bien
21 points de code.

### Sujet sensible

Contrôle refait ligne à ligne. **Aucun numéro d'appel, aucune posologie, aucune
consigne de premiers secours, aucune conduite à tenir, aucun conseil médical.**
Les situations de l'exercice 3 décrivent des circonstances pour choisir un bloc
de langue, elles ne prescrivent rien. Les renvois au professionnel des pages 1
et 12 existent et sont dans les mots de la leçon. Les candidats écartés
(เรียกตำรวจ, เรียกรถพยาบาล, ฉุกเฉิน) sont bien attestés là où la leçon le dit et
bien absents du contenu enseigné. **Rien à signaler sur ce périmètre : la leçon
tient sa promesse.**

Note de portée : la distinction ปวด contre เจ็บ demandée à l'audit ne concerne
pas 9C, qui ne contient ni l'un ni l'autre. Elle relève de `lecon-9b.md`.

### Planchers des exercices

Recalculés par l'auditeur. Exercice 1 : 4 options, 8 tirages, 2 par option, donc
2 sur 8 au mieux pour une réponse constante, seuil 7. Exercice 2 : 3 options,
9 tirages, 3 par option, 3 sur 9, seuil 7, et l'inversion systématique
montant/haut plafonne bien à 3 sur 9. Exercice 3 : appariement, espérance de
points fixes égale à 1, sans-faute à 1 sur 720, seuil 5 sur 6. Exercice 4 :
120 arrangements pour cinq jetons, 720 pour les six du tirage 4, meilleure
réponse constante 1 sur 6. Exercice 5 : 5 options, 10 tirages, 2 par bloc, 2 sur
10, seuil 8. Exercice 6 : production libre, pas de plancher.

**Aucun exercice n'est réussissable par une réponse constante.** L'arithmétique
du dossier est juste sur les six exercices.

## Findings

### N1, BLOQUANT. Le contrôle de la section 1 bis est certifié faux

Le dossier écrit, en toutes lettres : « Ce balayage a été fait sur le présent
fichier le 2026-08-04. Une seule occurrence existe, page 9 ». Et le tableau des
audits porte « Phonétique française | SANS OBJET, la leçon ne formule aucune
assertion sur ce que fait une bouche française ».

Le balayage refait par l'auditeur, sur les termes que le dossier dit lui-même
avoir cherchés, en trouve cinq :

| Ligne | Texte                                                                                           | Statut            |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------- |
| 172   | « ces deux tons se ressemblent à une oreille française »                                        | la seule reconnue |
| 557   | « Le seul jeton **qu'un francophone** a envie d'ajouter à tort est ขอ »                         | non reconnue      |
| 693   | « entendre le ton montant comme une question, **réflexe français** qui fait répondre « haut » » | non reconnue      |
| 794   | « placer หน่อย avant l'action, **par analogie avec l'adverbe français** »                       | non reconnue      |
| 1511  | « `ouai` peut se lire `ou` + `ai` **par un œil français** »                                     | non reconnue      |

La ligne 557 contient littéralement le mot « francophone », l'un des trois
termes que le dossier déclare avoir balayés. Le balayage annoncé n'a donc pas
été exécuté, ou son résultat n'a pas été reporté.

Sur le fond, aucune des quatre assertions non reconnues n'est recevable au sens
de la section 1 bis : aucune n'est sourcée par deux sources indépendantes, et
aucune n'est reformulée en observation vérifiable par l'apprenant. « Le SEUL
jeton qu'un francophone a envie d'ajouter » est en outre un absolu, que la
section 1 bis proscrit explicitement pour cette catégorie.

C'est exactement la faute pour laquelle `u08-l8a` a été sanctionnée, et que le
présent dossier se vante d'avoir évitée.

**Correction attendue** : soit sourcer, soit reformuler en observation
vérifiable (« essayez les deux ordres à voix haute et voyez lequel vous vient »),
soit supprimer ; puis refaire le balayage et corriger la ligne du tableau des
audits, qui ne peut pas rester à « SANS OBJET ».

### N2, BLOQUANT. Une valeur du contrôle interne est fausse et non reproductible

La section « Contrôle interne au dépôt, produit par script versionné » affirme :
« Toutes les valeurs ci-dessous sont rendues par
`node scripts/verification/repo-thai-scan.mjs`, le 2026-08-04, et sont donc
recomputables par un tiers. Aucune n'est tenue à la main. »

La dernière ligne du tableau annonce, pour
`repo-thai-scan.mjs 1 8 --grep หม` : « 6 graphies, toutes des instances de
ไหม ».

L'auditeur a exécuté la commande. Elle rend **7 graphies**, et elles ne sont
pas toutes des instances de ไหม :

```
# graphies contenant « หม » : 7
หมา              /content/authoring/unite-01/lecon-1d.md
ไหม              /content/authoring/unite-01/lecon-1d.md
สบายดีไหมครับ    /content/authoring/unite-02/lecon-2b.md
สบายดีไหมคะ      /content/authoring/unite-02/lecon-2b.md
สบายดี / สบายดีไหม /content/authoring/unite-02/lecon-2e.md
ไกลไหม           /content/authoring/unite-05/lecon-5e.md
เขาสูงไหม        /content/authoring/unite-06/lecon-6c.md
```

Aucun fichier des unités 1 à 8 n'a été modifié après 02:27 le 2026-08-04, alors
que la leçon a été enregistrée à 03:02 : la valeur était donc déjà fausse au
moment de la rédaction. Les cinq autres lignes du même tableau, elles, tombent
exactement (40 fichiers, 383 entrées, 283 graphies, et 0 pour ช่วย, ด้วย, เรียก,
หมอ et วย), et le paragraphe sur la limite du mode `--grep` est exact lui aussi
(`--grep ีย` rend bien la seule graphie เสีย).

Une seule valeur fausse dans un tableau qui revendique la recomputabilité suffit
à en retirer la valeur probante, et celle-ci porte précisément la conclusion
pédagogique de la page 10.

### N3, BLOQUANT. หมา, le précédent exact de หมอ, est absent de toute la leçon

C'est la conséquence de N2, et elle est plus grave que le décompte lui-même.

`u01-l1d` publie **หมา** comme item plein : `thai` หมา, `ipa` /mǎː/,
`ton` montant, `longueur` longue, `transcription` mǎa, sources en.wiktionary,
th.wiktionary et Volubilis. C'est le **jumeau structurel exact de หมอ** : ห de
tête, ม, voyelle longue, syllabe vivante, aucune marque, ton montant. Bien plus
proche que ไหม, dont la syllabe et la voyelle sont autres.

Pire, `u01-l1d` est la leçon qui a INSTALLÉ le contraste montant contre haut, et
elle l'a fait sur la paire หมา contre ม้า, c'est-à-dire sur le mot même que 9C
enseigne à une lettre près. Or :

- la Méta de 9C ne liste PAS `u01-l1d` parmi ses prérequis, alors qu'elle en
  liste dix autres ;
- le tableau « Reprises citées à l'écran » ne la mentionne pas ;
- la page 10 et l'item 5 nomment ไหม (`u04-l4d`) et หน่อย (`u02-l2c`) comme
  seuls précédents du ห de tête ;
- `u01-l1d` n'apparaît qu'une fois dans tout le fichier, en passant, dans la
  section SRS.

Le fil des tons des conventions fixe pourtant que « Unité 1 : 1D montant contre
haut ». Une leçon qui retravaille ce contraste sans citer celle qui l'a posé, et
qui enseigne หมอ sans jamais montrer หมา, laisse le travail le plus utile de
côté.

**Correction attendue** : ajouter `u01-l1d` aux prérequis et au tableau des
reprises, et faire de หมา le point d'appui de la page 10 et de l'exercice 2, où
il est à la fois le précédent d'écriture et le modèle de ton déjà appris.

### N4, BLOQUANT. Le corrigé de l'exercice 2 décrit faussement le ton haut

Trois formulations, toutes destinées à l'écran :

- page 9 : « ครับ (khráp) reste haut : la voix ne redescend pas » ;
- exercice 2, feedback correct : « le haut reste perché du début à la fin » ;
- exercice 2, feedback incorrect : « le ton haut commence déjà en haut et **n'en
  bouge pas** ».

Deux contre-preuves, dont une interne à la leçon :

1. l'IPA que la leçon cite elle-même pour ครับ, à l'item 7, est /kʰrap̚˦˥/,
   vérifiée par l'auditeur sur en.wiktionary. Les lettres tonales `˦˥` disent un
   départ à 4 et une arrivée à 5 : le ton haut MONTE. « N'en bouge pas » est
   contredit par la notation que le dossier a retenue ;
2. `u01-l1d`, la leçon publiée et sourcée qui installe ce contraste, écrit
   « le haut est déjà perché et **monte encore d'un petit cran** », et fait
   dessiner ce mouvement au doigt : « faites-le flotter d'un petit cran vers le
   haut ». 9C dit le contraire de la leçon dont elle prolonge la carte SRS.

Ce qui reste juste, et qu'il faut garder, c'est le repère de DÉPART : le montant
commence en bas, le haut commence en haut. C'est le repère de 1D, et il suffit.

S'ajoute un défaut de sources : les trois descriptions de contour de la page 9 et
de l'exercice 2 ne portent AUCUNE source, alors que le contrat d'item exige deux
sources indépendantes par fait, et que le tableau des audits déclare la
prononciation et le ton « vérifiés ».

**Correction attendue** : supprimer « n'en bouge pas » et « du début à la fin »,
aligner sur la formulation déjà publiée par 1D, et sourcer.

### N5, BLOQUANT. La réfutation de `u08-l8d` n'est pas soutenue par les relevés

9C écrit que « le blocage énoncé par 8D ne tient donc pas », que « la leçon
montre que le patron sans ให้ est attesté quatre fois », en fait son
incertitude 7, et va jusqu'à demander en Arbitrage 3 que le dossier d'une autre
leçon soit réécrit, au motif qu'« un motif d'exclusion faux se recopie ».

L'auditeur a relu 8D. Sa phrase exacte est : « la construction utile, ช่วย +
verbe + **ให้** + หน่อย, ajoute un troisième élément grammatical ». Elle porte
sur la chaîne complète, หน่อย compris. Or les quatre relevés que 9C lui oppose
ne contiennent aucun หน่อย :

| Relevé                      | Contient ช่วย | Contient หน่อย |
| --------------------------- | ------------- | -------------- |
| ช่วยเอาของไปส่ง, RID        | oui           | non            |
| ช่วยเรียกสุนัขไปเสียที, RID | oui           | non            |
| `ช่วย...`, Volubilis        | oui           | non            |
| ช่วยปิดหน้าต่าง, Volubilis  | oui           | non            |

Symétriquement, les sept à dix instances de verbe + หน่อย relevées par 9C, que
l'auditeur a toutes retrouvées, ne contiennent aucun ช่วย.

L'auditeur a cherché lui-même, dans le classeur, toutes les entrées commençant
par ช่วย. Il y en a 24, des lignes 9917 à 9941 du `.ods`. **Une seule combine
ช่วย, un verbe et หน่อย** :
ช่วยแนะนำ...ให้หน่อยได้มั้ย, celle-là même que 8D citait, et **elle porte ให้**.
Autrement dit, le seul relevé qui porte directement sur la question tranche du
côté de 8D, pas contre lui.

S'ajoute une citation tronquée : 8D écrit, juste avant la phrase citée,
« Écarté pour une raison de **périmètre et non de source** ». 9C omet ce membre
en présentant 8D comme ayant écarté ช่วย faute d'attestation.

Cela ne dit pas que ช่วยเรียกหมอหน่อยครับ est du mauvais thaï, et l'auditeur ne
le dit pas. Cela dit que la leçon présente comme réfutée une position qu'elle
n'a pas réfutée, et qu'elle demande sur cette base la réécriture d'un dossier
tiers. L'incertitude 1, elle, est honnête et doit rester bloquante.

**Correction attendue** : retirer l'affirmation que le motif de 8D est faux,
reformuler l'incertitude 7 et l'Arbitrage 3 en constat exact (le patron ช่วย +
verbe existe sans ให้ ; la chaîne ช่วย + verbe + หน่อย sans ให้ n'est attestée
nulle part), et rapatrier ce constat dans l'incertitude 1, où il renforce la
question à poser au contre-audit externe.

### N6, non bloquant. L'artefact `.xlsx` de référence est cassé sur le poste

Le dossier écrit : « Exemplaires employés, identifiés par empreinte,
**recalculée le 2026-08-04**. Le `.xlsx`, 10 848 409 octets, SHA-256
`b9ab7418…` ».

Le seul `VOLUBILIS_Database.xlsx` présent sur la machine,
`C:\Users\Selim\AppData\Local\Temp\VOLUBILIS_Database.xlsx`, écrit le
2026-08-04 à 02:31, soit AVANT l'enregistrement de la leçon à 03:02, fait
**154 octets** et contient une page HTML `404 Not Found`. Son empreinte est
`8cf5ce27d21490c24eedf91e0ac2bc4a748ba8f4eb20cb7c1fc9442d2d580008`. L'empreinte
citée par le dossier est, au caractère près, celle qui est écrite en dur dans
l'en-tête de `volubilis-lookup.mjs`.

Conséquence : `volubilis-lookup.mjs` ne peut pas s'exécuter, et **aucun numéro
de ligne `.xlsx` de la leçon n'est recomputable aujourd'hui**, ce que les
amendements v1.2 et v1.3 exigent pourtant.

L'auditeur a néanmoins établi que ces numéros sont très probablement
authentiques, par un contrôle indirect. Les écarts entre le numéro `.ods` qu'il
mesure et le numéro `.xlsx` que la leçon cite sont monotones et localement
constants, ce que seule une vraie lecture du `.xlsx` produit :

| Graphie         | `.ods` mesuré | `.xlsx` cité | écart |
| --------------- | ------------- | ------------ | ----- |
| ช่วย            | 9917          | 9530         | 387   |
| ช่วยด้วย        | 9923          | 9536         | 387   |
| `ช่วย...`       | 9920          | 9533         | 387   |
| ช่วยปิดหน้าต่าง | 9935          | 9548         | 387   |
| ช่วยเหลือ       | 9926          | 9539         | 387   |
| หมอ             | 58280         | 56111        | 2169  |
| เรียก           | 85574         | 82739        | 2835  |
| เรียกหมอ        | 85591         | 82756        | 2835  |
| เรียกรถพยาบาล   | 85602         | 82767        | 2835  |
| เรียกตำรวจ      | 85603         | 82768        | 2835  |

Ces écarts s'interpolent proprement entre ceux que donne `u08-l8a` sur huit
autres mots. La citation est donc juste ; c'est sa vérifiabilité qui est
perdue.

**Correction attendue avant `review`** : retélécharger l'exemplaire,
re-attester l'empreinte réellement obtenue, et ne plus recopier l'empreinte de
l'en-tête du script comme si elle avait été recalculée.

Point mineur rattaché : la colonne de la lecture entre crochets est la colonne
**O** dans le `.ods`, alors que la leçon la cite comme « colonne M ». Non
vérifiable tant que le `.xlsx` manque.

### N7, non bloquant. La page 11 attribue ตัว à la mauvaise leçon

Page 11 : « C'est le `oua` de ตัว, appris en 8A ».

`repo-thai-scan.mjs 1 8 --grep ตัว` place ตัว dans `u03-l3d`. La leçon 8A publie
ตั๋ว, qui est un autre mot. L'item 1 de 9C attribue d'ailleurs correctement ตัว à
`u03-l3d` : la page d'écran contredit son propre dossier.

### N8, non bloquant. La page 2 force le dictionnaire

Page 2 : « Le dictionnaire lui donne cinq sens et ils tournent **tous** autour
de la même idée ». Le sens (๑) du RID est étiqueté (โบ) et vaut ไถ่ตัว, le
rachat. Les quatre idées que la page énumère sont les sens (๒) à (๕), ce que
l'item 1 dit correctement. Le « tous » est de trop.

### N9, non bloquant. Le feedback de l'exercice 1 prescrit un repère qui ne discrimine pas

Le feedback incorrect dit « ne cherchez que le DÉBUT », puis décrit ช่วยด้วย
comme commençant « sur une voix qui tombe » et เรียกหมอ comme commençant « sur
une voix qui tombe puis remonte ». Deux options sur quatre commencent donc sur
le même ton descendant, et il faut écouter la seconde syllabe pour trancher. Le
repère annoncé et le repère utilisable ne sont pas le même.

### N10, non bloquant. La commande citée pour la clé des tons ne rend pas les valeurs citées

La leçon écrit : « relue le 2026-08-04 par
`node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> TONES` : `-x`
normal, `¯x` high, `_x` low, `/x` rising, `\x` falling ».

Les cinq valeurs sont exactes, l'auditeur les a lues. Mais la commande AVEC le
filtre `TONES` ne rend qu'une ligne, `TONES | ● ● ●` : les valeurs sont sur les
lignes suivantes et n'apparaissent qu'en exécutant le script sans filtre. La
citation n'est donc pas reproductible telle qu'écrite. Défaut hérité de
`u08-l8a`, à corriger dans les deux dossiers.

### N11, non bloquant. L'inventaire des superpositions est incomplet

Section Unicode : « Les seules superpositions du jour sont un signe de ton seul
au-dessus de sa consonne, U+0E48 sur ช et U+0E49 sur ด ».

`unicode-thai.mjs` montre que le bloc du jour ช่วยเรียกหมอหน่อยครับ porte en
outre U+0E48 sur น dans หน่อย et U+0E31 sur ร dans ครับ. La conclusion, aucune
pile de plus de deux signes, reste vraie ; la phrase d'inventaire, non.

### N12, non bloquant. Le doublon d'unité anticipé s'est déjà produit

Le dossier prévoit que « si une autre leçon de l'unité 9 publie หมอ, ช่วย ou l'un
des blocs du jour, le doublon doit être résolu en faveur de la leçon la plus
précoce ». C'est fait : `lecon-9e.md` publie **หมอ** comme item plein à sa ligne
402, et `lecon-9d.md` emploie ช่วย, ด้วย et เรียก. La clause se déclenche donc
dès maintenant, et la consolidation de l'unité 9 doit trancher avant `review`.

## Synthèse

| Dimension                           | Verdict de l'auditeur                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Graphie et NFC                      | CONFORME, 8 séquences recalculées, aucune divergence                                            |
| Sens                                | CONFORME sur les 4 mots et les 2 blocs, une imprécision de page (N8)                            |
| Ton, attribution                    | CONFORME, 15 tons re-dérivés, aucun faux                                                        |
| Ton, description à l'écran          | **FAUTIF**, voir N4                                                                             |
| Longueur                            | CONFORME, réserves justifiées, incertitude 2 vérifiée et exacte                                 |
| IPA                                 | CONFORME, 9 transcriptions recoupées à la source                                                |
| Registre                            | CONFORME, y compris la prudence sur ช่วยด้วย                                                    |
| Naturalité                          | NON ÉTABLIE, honnêtement signalée, mais voir N5                                                 |
| Références citées                   | AUCUNE INVENTÉE ; deux mal citées (N6 empreinte, N10 commande)                                  |
| Faits mono-sourcés                  | AUCUN détecté ; la règle des deux sources est appliquée, y compris au prix du retrait de คุณหมอ |
| Corrigés d'exercices                | JUSTES, sauf le corrigé de ton de l'exercice 2 (N4)                                             |
| Exercices réussissables sans savoir | AUCUN, arithmétique des six planchers refaite                                                   |
| Sujet sensible, santé               | CONFORME, aucun conseil, aucun numéro, aucune posologie, aucune conduite à tenir                |
| Phonétique française, section 1 bis | **NON CONFORME**, voir N1                                                                       |
| Contrôles internes au dépôt         | **UNE VALEUR FAUSSE**, voir N2                                                                  |

**Décision** : `draft` maintenu. Aucun passage à `review` avant résolution de
N1, N2, N3, N4 et N5, en plus de l'incertitude 1 que la leçon avait elle-même
déclarée bloquante.

Revue native : en attente.
