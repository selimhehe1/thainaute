# Contre-audit adversarial n° 2 de `u09-l9b`

- Fichier audité : `content/authoring/unite-09/lecon-9b.md`
- Empreinte de l'exemplaire audité, rendue par
  `node scripts/verification/unicode-thai.mjs` : **119 961 octets**, SHA-256
  `1ca1ea220658159840ad392971036dc58ca1a9ca24e7a0c218327724d2ba6ef0`
- Date des relevés : 2026-08-04. **Tous refaits par l'auditeur**, aucun repris
  du dossier de production ni du contre-audit n° 1.
- Consigne : chercher des erreurs, ne rien confirmer sur parole. Priorités
  reçues : correspondances de finales, sujet santé, distinction ปวด contre
  เจ็บ, conformité à la section 1 bis sur le français, exercices réussissables
  sans savoir.
- Statut rendu : **3 findings bloquants, 9 findings non bloquants.**
  `draft` ne doit pas passer en `review` en l'état.

## Note de traçabilité

Ce chemin portait le contre-audit n° 1 (findings B1 à B12), auquel le dossier
de production de la leçon renvoie nommément. Il a été copié à l'identique dans
`content/authoring/unite-09/verification-9b-passe1.md` avant l'écriture de ce
fichier. La référence du dossier de production doit être réancrée sur ce
nouveau nom à la consolidation.

## Ce que j'ai re-vérifié moi-même : 102 faits

| Source                                                | Faits re-vérifiés | Écarts trouvés |
| ----------------------------------------------------- | ----------------: | -------------: |
| RID 2554, par `rid-entry.mjs` et `rid-lookup.mjs`     |                24 |              1 |
| en.wiktionary et `Appendix:Thai script`               |                18 |              0 |
| FrequencyWords `th_50k.txt`, artefact retéléchargé    |                16 |              0 |
| Unicode 17.0, fichiers UCD relus à la source          |                 8 |              0 |
| Dépôt, `repo-thai-scan.mjs` et relecture de 17 leçons |                22 |              4 |
| Recalculs et balayages du fichier                     |                14 |              7 |
| **Total**                                             |           **102** |         **12** |

### RID 2554, relevés par script versionné (24 faits, 1 écart)

Faits cités par référence. Aucune définition n'est reproduite ici.

1. `ปวด` est une vedette autonome, classée `ก.`, vedette unique.
2. Sa définition porte sur une douleur ressentie de façon continue à
   l'intérieur du corps. Conforme aux pages 2 et 4 et à l'item 1.
3. Elle donne trois exemples d'emploi, `ปวดหัว`, `ปวดท้องเยี่ยว`, `ปวดฟัน`,
   tous du moule verbe plus partie du corps. Conforme.
4. La liste `ลูกคำ` de `ปวด` rend exactement les huit dérivés cités par
   l'item 1, dans le même ordre.
5. `ปวด` ne porte AUCUNE lecture entre crochets, donc aucun `พินทุ`. La page 10
   tient.
6. `เจ็บ` est une vedette autonome, deux sens tous deux `ก.`
7. Son sens (๑) est le fait d'être malade, avec l'équivalent de registre royal
   donné en regard. Son sens (๒) est la sensation physique après un coup ou sur
   une plaie. L'ORDRE annoncé page 3 est le bon.
8. La liste `ลูกคำ` de `เจ็บ` porte `เจ็บไข้`, `เจ็บใจ`, `เจ็บท้อง`,
   `เจ็บปวด`, `เจ็บป่วย` et cinq autres. Aucun `เจ็บหัว`.
9. `เจ็บท้อง` est une vedette, définie par la douleur du moment de
   l'accouchement. La page 4 et l'item 6 tiennent.
10. `ปวดท้องเบา, ปวดท้องเยี่ยว` forment une vedette GROUPÉE, définie une seule
    fois par le besoin d'uriner, `แม่คำ` = `ปวด`. La formulation « deux vedettes
    définies ensemble » de l'item 5 est exacte.
11. `หัว ๑` porte NEUF sens nominaux.
12. Son sens (๑) est la partie la plus haute du corps d'une personne ou d'un
    animal. Concordant avec « tête ».
13. Son sens (๓) est la partie initiale, en forme de boucle, d'un caractère
    d'écriture. La note culturelle est exacte sur ce point.
14. `หัว ๒` porte l'intelligence et la tournure d'esprit ; `หัว ๓` est marquée
    `(โบ)` et porte le rire. Conforme à l'item 2.
15. `ท้อง` est une vedette unique à CINQ sens. Le (๑) délimite exactement la
    zone décrite par l'item 4, nombril compris.
16. Ses sens (๒) grossesse, (๓) étendue vaste, (๔) forme courbe, (๕) classé
    `ก.` porter un enfant, sont conformes item pour item.
17. Le sens (๓) donne SIX exemples, `ท้องน้ำ`, `ท้องฟ้า`, `ท้องทุ่ง`,
    `ท้องไร่`, `ท้องนา`, `ท้องถนน`. Les trois cités par la note culturelle en
    font partie.
18. `ศีรษะ` porte la lecture `[สีสะ]`, est défini par `หัว`, marqué mot poli
    employé pour les personnes, origine sanskrite. Item 2 exact.
19. `กลัว` porte `[กฺลัว]`, séquence `U+0E01 U+0E3A U+0E25 U+0E31 U+0E27`,
    caractère pour caractère la séquence citée par la section « groupe
    consonantique ».
20. `ขวด` ne porte aucune lecture entre crochets. Le contraste de notation
    invoqué par la page 10 est produit par une seule autorité, comme annoncé.
21. `อักษรสูง` : ton de base `จัตวา` en `คำเป็น`, onze lettres
    `ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห`. Le ton MONTANT de `หัว` est bien calculé.
22. `อักษรต่ำ` : ton de base `สามัญ`, marque `ไม้โท` donnant le ton `ตรี`,
    vingt-quatre lettres dont `ท`. Le ton HAUT de `ท้อง` est bien calculé.
    **ÉCART, finding N12** : la série citée par le RID est `คา ค่า ค้า`, la
    leçon écrit `ค ค่า ค้า`.
23. `อักษรกลาง` : le mot MORT à initiale moyenne a pour ton de base `เอก`, neuf
    lettres `ก จ ฎ ฏ ด ต บ ป อ`. La concordance non enseignée de l'item 1 tient
    pour `ปวด` et pour `เจ็บ`.
24. `คำเป็น` : voyelle longue sans consonne finale, PLUS les séries
    `กง กน กม เกย เกอว`. `ท้อง` est vivante par `ง`. La réserve de la leçon sur
    `หัว`, déclarée vivante « par son noyau » alors que la longueur de ce noyau
    reste NON ÉTABLIE, est nécessaire et honnête.

Les sept absences employées comme preuves ont été refaites une à une et sont
toutes réelles : `ปวดหัว`, `ปวดท้อง`, `ปวดฟัน`, `ปวดคอ`, `เจ็บคอ`, `เจ็บหัว`,
`ไม่สบาย` rendent tous `absent`. Les huit graphies déclarées « attestées mais
non citées » le sont toutes : `คอ`, `ป่วย`, `เจ็บปวด`, `เจ็บป่วย`, `ท้องขึ้น`,
`ท้องเดิน`, `ปวดมวน`, `จุก`. Le décompte du dossier, 29 graphies interrogées,
22 attestées, 7 absentes, se recompose exactement à partir de ses quatre
listes. Aucune des quatre entrées `ท้องขึ้น`, `ท้องเดิน`, `ปวดมวน`, `จุก`
n'emploie `ปวดท้อง` dans son corps : la recherche décrite au dossier a bien
échoué et l'incertitude 1 est fondée.

### en.wiktionary et Appendix:Thai script (18 faits, 0 écart)

25. `ปวด` : IPA `/pua̯t̚˨˩/`, Paiboon `bpùuat`, Royal Institute `puat`, Verb,
    « to ache; to be in pain ». Exact au caractère près.
26. `ปวด` : exemple `ผู้ป่วยปวดกลางท้อง` glosé, verbe suivi d'une localisation.
27. `ปวด` : la liste des Derived terms compte **QUATORZE** entrées. Le
    quantificateur de l'item 1 est juste.
28. Cette liste porte `ปวดท้อง`, `ปวดฟัน`, `ปวดหลัง`, `ปวดหู`, `ปวดหัว`, et
    aussi `เจ็บปวด`, `ยาแก้ปวด`, `ยาบรรเทาปวด`, qui ne sont pas du moule. La
    formulation corrigée au finding B4 est exacte : la liste établit la
    PRODUCTIVITÉ du moule, pas son exclusivité.
29. `หัว` : IPA `/hua̯˩˩˦/`, Paiboon `hǔua`, RI `hua`.
30. `หัว` : premier sens « head: (anatomy) the upper part of the body »,
    classificateur `หัว`, synonymes `ศิระ`, `ศีรษะ`, `เศียร`.
31. `หัว` : sens « circle part of a Thai letter, that is the start point to
    write the letter ». La note culturelle le rapporte correctement.
32. `ท้อง` : IPA `/tʰɔːŋ˦˥/`, avec la marque de longueur `ː`. Paiboon
    `tɔ́ɔng`, RI `thong`.
33. `ท้อง` : premier sens nominal « (anatomy) abdomen; belly ».
34. `ท้อง` : quatrième sens nominal « body, content, extent, essence, or main
    part (of something large, vast, great, or the like) ».
35. `ท้อง` : verbe « (colloquial, intransitive) to be pregnant ». L'item 4 le
    rapporte correctement et ne l'enseigne pas.
36. `เจ็บ` : IPA `/t͡ɕep̚˨˩/`, Paiboon `jèp`, RI `chep`, étymologie proto-taï.
37. `เจ็บ` : « to be sick » puis « to be hurt; be in pain ».
38. `เจ็บ` : Derived terms, DIX-HUIT entrées, aucune n'est `เจ็บหัว`.
39. `เจ็บ` : section « See also » contenant exactement `ปวด`.
40. Statuts HTTP refaits le 2026-08-04 : `ปวดหัว` **200**, `ปวดฟัน` **200**,
    `ปวดท้อง` **404**, `เจ็บหัว` **404**, `เจ็บคอ` **404**, `ปวดหลัง` **404**.
    Les deux absences employées comme preuves sont réelles, et la correction du
    finding B11 sur `ปวดฟัน` est juste.
41. `ห้อง` : IPA `/hɔŋ˥˩/`, **sans** marque de longueur. Le contraste de
    longueur avec `ท้อง` tient sur une source relue par moi.
42. `Appendix:Thai script`, wikitexte brut relu ligne à ligne : la ligne
    `–ว–` porte `sara ua`, IPA `ua`, Royal Thai `ua`. C'est exactement la ligne
    citée par la page 10. Les lignes voisines `–ัว` (`ua`) et `–ัวะ` (`uaʔ`)
    confirment que la forme brève est un graphème distinct, ce qui fonde la
    réserve de longueur sans la trancher.

**Priorité finales, contrôle indépendant.** La table des consonnes de la même
annexe donne, colonne `Final` : ligne 20, `ด` do dek, Royal Thai `t`, IPA
`/t/`, classe `mid` ; ligne 26, `บ` bo baimai, Royal Thai `p`, IPA `/p/`,
classe `mid`. Ligne 7, `ง`, final `ng` `/ŋ/`. Ligne 8, `จ`, classe `mid`.
Ligne 27, `ป`, classe `mid`. Ligne 23, `ท`, classe `low`. **Les deux
correspondances de finale employées par la leçon, `ด` vers /t/ et `บ` vers
/p/, sont JUSTES**, et les classes qui portent les quatre tons du jour sont
confirmées lettre par lettre, indépendamment du RID.

### FrequencyWords (16 faits, 0 écart)

43. Artefact retéléchargé depuis le dépôt d'origine :
    **1 504 712 octets**, SHA-256
    `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`.
    C'est au caractère près l'empreinte annoncée par le dossier. 50 000 lignes.
    44 à 58. Rangs et occurrences recalculés, tous conformes : `หัว` 4611 / 85,
    `ท้อง` 14151 / 27, `เจ็บ` 1932 / 202, `ปวดหัว` 9688 / 40, `ปวดท้อง`
    18619 / 21, `คอ` 19130, `ปวดหัวจัง` 34667, `เจ็บไหม` 15540, `เจ็บตรงไหน`
    41347, `มี` 276 / 1 348, `ไม่` 3 / 52 948. Absences confirmées : `ปวด`
    seul, `ปวดฟัน`, `ไม่ปวด`, `เจ็บหัว`, `เจ็บคอ`.

C'est la seule source externe du dossier qui soit intégralement recomputable
aujourd'hui. Elle l'est vraiment : je l'ai refaite de bout en bout.

### Unicode 17.0 (8 faits, 0 écart)

59. Les dix séquences NFC du tableau de la leçon sont identiques aux séquences
    rendues par `unicode-thai.mjs` sur les champs `thai`, champ par champ.
60. Toutes les chaînes thaïes du fichier sont NFC. Aucun caractère de zone à
    usage privé.
61. `IndicPositionalCategory-17.0.0.txt` relu à la source : en-tête daté du
    **2025-07-29**, exactement la date citée.
62. `0E40..0E44` sont `Visual_Order_Left`. `เจ็บ` et `ไม่` commencent bien à
    l'écran par une voyelle écrite avant sa consonne.
63. `0E31` est `Top`. `0E47..0E4E` sont `Top`.
64. `UnicodeData.txt` : `0E47` MAITAIKHU a une classe combinatoire de **0**.
65. `0E48` à `0E4B` ont une classe combinatoire de **107**. La conclusion de la
    leçon, `เจ็บ` ne porte pas de marque de ton, est exacte.
66. Aucun mot du jour n'empile deux signes suscrits : profondeur maximale de
    UN, recomptée sur les dix graphies publiées.

### Dépôt (22 faits, 4 écarts)

67. `repo-thai-scan.mjs 1 8` rend **40 fichiers, 383 entrées, 283 graphies
    distinctes**, exactement les trois chiffres publiés.
    68 à 71. `--grep` sur `ปวด`, `เจ็บ`, `หัว`, `ท้อง` rend **0** graphie publiée
    dans les unités 1 à 8. Les six items lexicaux sont réellement nouveaux.
68. `u03-l3b` publie `เจ็ด` sous la transcription `jèt`.
69. `u04-l4c` publie `ขวด` en item 5, transcription `khòuat`.
70. `u04-l4d` publie `เผ็ด` (`phèt`) et `ไม่` (item 1).
71. `u06-l6b` publie `น้อง` (`náwwng`) et, à son item 8,
    `ผมมีพี่ชายสองคนครับ / ดิฉันมีพี่ชายสองคนค่ะ`. La correction du finding B6
    est juste : la phrase de la page 8 est bien de 6B.
72. `u06-l6d` publie à son item 8 `มีพี่น้องสองคน`, et publie `ครอบครัว` en
    `khrâwwp·khroua` avec la réserve de longueur sur `/ua/`. La lignée corrigée
    au finding B8 est juste.
73. `u07-l7a` publie `ช้อน` (`cháwwn`) et `ถ่าน` (`thàan`).
74. `u07-l7b` publie `ห้อง` (`hâwng`) et `ผมอยู่บ้านครับ`.
75. `u08-l8a` publie `เงิน` (item 1) et `ตั๋ว` (item 5), et son finding N1
    porte bien sur le piège faux « le groupe est ขว ».
76. `u02-l2b` publie `สบายดีไหมครับ` à son item 4, champ `fr` « vous allez
    bien ? », transcription `sà·baai·dii·mǎi khráp`. La correction du finding
    B10 est alignée sur le champ publié.
77. `u02-l2c` publie `khàwwp·khoun khráp`.
78. `u02-l2d` publie `ผม` et `ดิฉัน` à ses items 1 et 2 ; `u01-l1e` publie
    `ครับ` et `ค่ะ` à ses items 2 et 3.
79. `u05-l5d` publie `ผมไปตลาดครับ` à son item 7 ; `u05-l5e` porte `ไม่ไกล` ;
    `u08-l8d` porte `ไม่ใช่` ; `u03-l3d` publie `คน` (`khon`) et propose le
    graphème `oua` sur `ตัว` (`toua`).
80. `u02-l2e` publie la règle « `ไหม` se place avant la particule de politesse,
    jamais après ».
81. `srs-u04-l4a-06`, `srs-u07-l7a-03` et `srs-u07-l7e-03` existent réellement
    et portent bien les contrastes annoncés.
82. La leçon montant contre haut de l'unité 1 déclare l'identifiant `u01-1d`,
    irrégulier, ne contient **aucune** occurrence de « courbe », et ses six
    tirages proposent « Montant / Haut » en texte. La correction du finding B5
    est fondée sur ce point.
83. **ÉCART, finding N4** : `u04-l4a` publie bien des cartes à contour dessiné
    (ligne 541), mais il n'est **pas** la seule leçon du parcours à le faire.
84. `CONVENTIONS.md`, relu intégralement, ne contient aucune occurrence de
    `oua`. L'écart déclaré en Méta est réel et correctement déclaré.
    89 à 92. Unité 9, collisions : `u09-l9a` publie `เจ็บ` (item 1) et `ปวด`
    (item 2) et `หมอ` (item 3) ; `u09-l9c` reprend `หมอ` à son item 5 ;
    `u09-l9d` publie `ยา` à son item 1 ; `u09-l9e` publie `ไม่สบาย` à son
    item 1, réemploie `ปวดหัว` à son item 4 en le déclarant « publié par
    `u09-l9b` item 3 », et publie `ปวดหัวไหมครับ` à son item 9. `ป่วย` n'est
    publié par aucune leçon de l'unité. L'incertitude 5 est exacte de bout en
    bout.

### Recalculs et balayages (14 faits, 7 écarts)

93. Ton de `หัว` : `ห` haute, syllabe vivante, aucune marque, donc MONTANT.
    Recalculé, concordant avec `/hua̯˩˩˦/`.
94. Ton de `ท้อง` : `ท` basse, `ไม้โท`, syllabe vivante par `ง`, donc HAUT.
    Recalculé, concordant avec `/tʰɔːŋ˦˥/`.
95. Tons de `ปวด` et `เจ็บ` : initiales moyennes, syllabes mortes, donc BAS.
    Concordants avec `/pua̯t̚˨˩/` et `/t͡ɕep̚˨˩/`. La leçon a raison de les
    donner comme relevés et non comme calculés.
96. Les seize transcriptions employées sont conformes à `thainaute-fr` v1.1,
    marque de ton sur la première lettre du noyau comprise, `oua` mis à part,
    qui est l'écart déclaré.
97. Exercice 1 : répartition 3 par option sur 9 tirages, une réponse constante
    plafonne à 3 sur 9, seuil 7 sur 9. Plancher exact.
98. Exercice 2 : 3 par ton sur 12, plafond 3 sur 12, seuil 9 sur 12. Plancher
    exact. **ÉCART, finding N5** sur le décompte des items publiés.
99. Exercice 3 : les permutations de 8 ayant au moins 6 points fixes sont 28
    plus 1, soit **29** sur 40 320, environ 0,072 %. Le chiffre du fichier est
    juste au recalcul.
100.  Exercice 4 : espérance d'une réponse aveugle 1/24 + 1/24 + 1/24 + 1/6 +
      1/24 + 1/120 = 0,3417 ; probabilité d'atteindre 5 sur 6 au hasard
      9,08 × 10⁻⁷. Les deux chiffres du fichier sont justes.
101.  Exercice 5 : aucune option proposée, donc aucun plancher de hasard.
      **Aucun des cinq exercices n'est réussissable par une réponse constante,
      ni par une stratégie positionnelle.** C'est la conclusion la plus solide
      de cet audit.
102.  Balayage du fichier : 10 occurrences de « jamais », 1 de « toujours »,
      0 de « bouche française », « oreille française » et « francophone », ce
      qui confirme au chiffre près les décomptes du dossier ; **mais** 10
      occurrences de « français » avant le dossier, dont trois sont des
      assertions sur le français et non une seule (findings N2). Aucun tiret
      cadratin ni demi-cadratin dans tout le fichier.

**Balayage santé, priorité de l'unité.** Recherche sur tout le fichier de
« médecin », « pharmacien », « pharmacie », « urgence », « hôpital »,
« ambulance », « 1669 », « 112 », « posologie », « dose », « soigner »,
« soins », « traitement », « consulter », « appelez », « symptôme », « grave ».
**Aucune occurrence sur un écran d'apprenant.** Les seules occurrences sont
dans le dossier de production : le libellé du finding B7, qui documente la
suppression de « adressez-vous à un médecin ou à un pharmacien », et les motifs
d'écartement de `หมอ` et `ยา`. La consigne de périmètre est tenue. Une réserve
de formulation subsiste, voir le finding N8.

## Findings

### Bloquants

#### B1 (bloquant). Le piège de l'exercice 5 attribue à `u05-l5a` une graphie qu'elle ne publie pas

Priorité « correspondances de finales ».

Le piège écrit : « la finale ด ne se note pas `d` non plus : 3B publie เจ็ด
sous la transcription `jèt`, et **5A a établi la correspondance ด finale vers
`t` sur เป็ด** ». Le tableau des findings répète l'attribution : « เจ็ด publié
`jèt` en 3B et **เป็ด en 5A** comme appuis », mettant les deux graphies sur le
même plan.

Relevé : `u05-l5a`, dont le titre est pourtant « Le h qu'on oublie et les
finales retenues », publie sept items, `ห้า`, `หก`, `หิว`, `ผัด`, `ผัก`,
`ครับ`, `มาก`. **`เป็ด` n'est pas de ceux-là.** La correspondance `ด` finale
vers `t` y est portée par `ผัด`, item 4, transcrit `phàt`. `เป็ด` n'apparaît
qu'une seule fois dans 5A, ligne 346, à l'intérieur d'une citation de la
feuille `Romanization` de VOLUBILIS, comme exemple de cette feuille. Une
recherche `เป็ด` sur tout `content/` et `docs/` ne rend rien d'autre que cette
ligne, la ligne du piège de 9B, et les dossiers d'audit.

Deux conséquences. L'apprenant n'a jamais vu `เป็ด` : l'appui est vide pour
lui. Et l'appui réellement disponible dans le parcours, `ผัด`, n'est pas cité.
Aggravant : la seule trace de `เป็ด` dans 5A est une ligne VOLUBILIS, c'est-à-
dire précisément la catégorie de citation que l'incertitude 9 déclare non
recomputable.

La correspondance enseignée est JUSTE : la table des consonnes de
`Appendix:Thai script`, relue par moi, donne `ด` final Royal Thai `t`, IPA
`/t/`, et `บ` final `p`, `/p/`. C'est l'appui qui est faux, pas le fait.

**Correction** : citer `ผัด` (`u05-l5a`, item 4, `phàt`), qui est publié, et
retirer `เป็ด` des deux endroits.

#### B2 (bloquant). Une assertion non sourcée sur le français, et une certification du dossier qui affirme qu'il n'y en a pas

Priorité « affirmations sur le français conformes à la section 1 bis ».

La note culturelle se termine par : « Là où le français voit une surface, le
thaï voit un ventre. » C'est une généralisation sur le français, sur un écran
d'apprenant, sans source, et qui n'est pas vérifiable par l'apprenant au sens
de la voie 2 de la section 1 bis : un locuteur natif ne peut pas trancher une
affirmation de typologie lexicale en posant la main devant sa bouche.

Elle est en outre contredite par la liste « Ce qui n'est PAS affirmé » de la
même section, six lignes plus bas, qui promet que la note ne dit rien « d'une
manière de voir le monde qui serait propre au thaï ». C'est exactement ce que
la phrase fait.

Et la section « Ce que ce dossier N'affirme PAS sur le français » certifie :
« **La seule mention du français est descriptive et porte sur sa GRAMMAIRE,
page 1.** » Balayage refait par moi sur les 1 038 lignes qui précèdent le
dossier : dix occurrences de « français », dont **trois** assertions et non
une. Page 1, « En français, "j'ai mal" se dit avec le verbe avoir », qui est
bien la mention déclarée et qui, elle, est recevable. Ligne 869, piège de
l'exercice 4, « par calque du français "à la tête, j'ai mal" », qui affirme un
ordre des mots du français. Ligne 1013, la note culturelle. Le balayage décrit
par le dossier ne cherchait que cinq chaînes, « bouche française »,
« francophone », « oreille française », « jamais », « toujours » ; aucune
n'attrape ces deux phrases. Le contrôle est donc présenté comme exhaustif
alors qu'il ne peut pas l'être, et sa conclusion est fausse.

Le point est aggravé par le fait que ce contrôle est précisément celui que
`u08-l8a` demandait de ne plus reprendre sans le refaire.

**Correction** : supprimer la dernière phrase de la note culturelle, ou la
réduire à ce que les sources donnent, c'est-à-dire que le dictionnaire numérote
un sens d'étendue vaste pour `ท้อง`. Reformuler le piège de l'exercice 4 sans
affirmer un ordre du français. Refaire le balayage sur la chaîne « français »
et non sur cinq formules, et réécrire la conclusion sur le relevé réel.

#### B3 (bloquant). Le sens publié de `ปวดท้อง` tient sur une seule source, elle-même non recomputable

L'item 5 publie `fr` : « avoir mal au ventre ». Ses jambes, refaites une à une
par moi le 2026-08-04 :

- RID : `ปวดท้อง` rend `absent`. Le dictionnaire ne lexicalise pas le bloc.
- en.wiktionary : `https://en.wiktionary.org/wiki/ปวดท้อง` rend **404**.
  La graphie n'existe que dans une liste de dérivés, ce que le dossier dit
  correctement, et une liste de dérivés ne donne pas de sens.
- FrequencyWords : rang 18619, 21 occurrences, vérifié. La politique de
  sources qualifie cette liste de signal de naturalité orale et non de source
  de sens, ce que le dossier rappelle honnêtement.
- VOLUBILIS ligne 79472 : **la seule jambe de sens**. Et l'incertitude 9
  reconnaît qu'aucune citation VOLUBILIS n'a pu être re-vérifiée. J'ai refait
  la recherche : ni `.xlsx` ni `.ods` dans le dépôt, ni ailleurs sur la
  machine, et le script versionné exige le classeur en argument.

Le contrat d'item de `CONVENTIONS.md` exige deux sources indépendantes par
fait. Ce fait en a une, et elle n'est vérifiable par personne aujourd'hui.

Ce n'est pas un reproche de dissimulation : la leçon dit elle-même que
`ปวดท้อง` est moins solidement attesté que `ปวดหัว`, ouvre les incertitudes 1
et 9, et interdit son propre passage en `review` tant qu'elles ne sont pas
résolues. Le finding confirme cette lecture et la rend bloquante de l'extérieur
plutôt que de la laisser au rang d'incertitude d'auteur, parce que `ปวดท้อง`
est l'un des deux blocs que l'objectif observable fait produire.

**Correction** : soit acquérir la seconde jambe annoncée par l'incertitude 1,
une grammaire de référence sur exemplaire, soit archiver l'exemplaire VOLUBILIS
employé dans un stockage accessible et redonner la ligne 79472 comme
recomputable, soit rétrograder `ปวดท้อง` d'item publié à application déclarée
du moule, sans champ `fr` d'item.

### Non bloquants

#### N4. « seule leçon du parcours qui publie des cartes à contour dessiné » est faux

L'exercice 2 écrit : « chacune avec sa courbe, exactement comme en `u04-l4a`,
seule leçon du parcours qui publie des cartes à contour dessiné ».

`u04-l4a` publie bien des contours, ligne 541 vérifiée. Mais `u01-l1a` aussi,
et avant lui : son exercice 1 propose « cinq cartes fixes, chacune avec **la
courbe dessinée**, l'étiquette du ton et un mot-repère » ; son exercice 2
s'appelle « chaque courbe a son mot » et apparie cinq cartes de courbes ; sa
carte SRS n° 2 s'appelle « Association contour ».

L'exclusivité est donc fausse, et elle a été INTRODUITE par la correction du
finding B5, qui déclare pourtant avoir relu les fichiers concernés. La
correction a réparé une attribution fausse à la leçon 1D en en créant une autre
à 1A. Impact apprenant nul, impact sur la chaîne de preuve réel.

#### N5. Décompte faux et auto-contradictoire dans l'exercice 2

« Neuf des douze mots sont des items PUBLIÉS des unités 2 à 8. » Recompté :
ils sont **huit**, `มี`, `เงิน`, `คน`, `ถ่าน`, `ผม`, `ตั๋ว`, `น้อง`, `ช้อน`,
les quatre autres tirages étant les items du jour. Le paragraphe « Pièges
connus » du même exercice écrit d'ailleurs « atténuée par les **huit** tirages
d'items publiés ». Le fichier se contredit à trente lignes d'écart, et c'est le
chiffre le plus favorable qui est mis en avant. Le plancher anti-hasard, lui,
est exact.

#### N6. Le retour de l'exercice 5 diagnostique une erreur que ses déclencheurs ne produisent pas

« Feedback incorrect, `hǎwwng` ou `tǒua` : "Vous avez interverti les deux
tons." »

Ni l'une ni l'autre de ces saisies n'est une inversion de tons. `hǎwwng` prend
l'initiale et le ton de `หัว` avec le noyau de `ท้อง` : c'est une erreur de
VOYELLE. `tǒua` est exactement la transcription publiée de `ตั๋ว` par
`u08-l8a` item 5, donc un autre mot du parcours, entré au tirage 9 de
l'exercice 2 de cette même leçon : un apprenant qui l'écrit a confondu le mot,
pas le ton. Les vraies inversions, `hóua` pour `หัว` et `thǎwwng` pour `ท้อง`,
ne déclenchent aucun retour.

Le corrigé, lui, est juste : `hǒua` et `tháwwng` sont les bonnes réponses.

#### N7. Décomptes internes du fichier non recomputables

Le tableau des audits annonce « refait le 2026-08-04 par `unicode-thai.mjs`,
**170** chaînes thaïes toutes NFC », et le finding B2 annonce « inventorie
U+0E31 avec **41** occurrences ». Rejoué par moi le même jour sur l'exemplaire
actuel : **180** chaînes thaïes et **46** occurrences de U+0E31. Le dossier
déclare par ailleurs un exemplaire audité de 101 332 octets, SHA-256
`d0c61cc…`, alors que le fichier fait 119 961 octets, SHA-256 `1ca1ea22…`.

Le fait qualitatif est confirmé, toutes NFC et aucune zone à usage privé. Mais
un chiffre qui ne se retrouve plus n'est pas un contrôle : ces décomptes
doivent être recalculés à la consolidation, ou datés de l'exemplaire auquel ils
se rapportent.

#### N8. Page 12, la dernière phrase projette encore une suite

La consigne de sujet sensible est tenue : aucun conseil, aucun numéro, aucune
posologie, aucun canal de soin, et la suppression opérée au finding B7 est
réelle, vérifiée par balayage sur seize motifs.

Il reste, en fin de page 12 : « la possibilité de nommer l'endroit à quelqu'un
qui peut vous aider ». Aucun canal n'est nommé, mais la subordonnée projette
une suite au moment précis où la page dit qu'elle n'en projette aucune. Sur ce
sujet, « la possibilité de nommer l'endroit à quelqu'un » se suffit.

#### N9. Le dialogue publie une traduction française qui contredit la réplique précédente

Réplique 2 : `ปวดหัวครับ`, traduit « J'ai mal à la tête. » Réplique 4 :
`ไม่ปวดครับ ขอบคุณครับ`, traduit « **Je n'ai pas mal.** Merci. »

En thaï l'ellipse porte sur le ventre, puisque la question était
`ปวดท้องไหมครับ`. La traduction française publiée, elle, ne porte pas
l'ellipse et dit le contraire de ce que le même locuteur vient de dire deux
répliques plus haut. Les deux points de langue placés sous le dialogue
signalent la place de `ไหม` et la reprise du verbe, pas cela.

L'incertitude 3 couvre la naturalité de l'échange, pas cette contradiction de
traduction. Correction possible : « Non, pas au ventre. » ne convient pas
puisque la note interdit d'introduire « non » ; « Je n'ai pas mal là. »
conserve l'ellipse.

#### N10. Un piège de l'exercice 3 repose sur un fait d'écran faux

« échanger les paires 7 et 8, qui commencent toutes deux par une syllabe de
trois lettres à l'écran ». `ผมปวดหัวครับ` commence par `ผม`, deux lettres.
`ไม่ปวดครับ` commence par `ไม่`, deux lettres et une marque de ton. Le fait
invoqué pour expliquer la confusion n'existe pas. La confusion, elle, reste
plausible pour d'autres raisons, notamment la longueur des étiquettes, que
l'incertitude 6 signale déjà.

#### N11. Aucun des six assemblages de l'exercice 4 ne dit quelle phrase est demandée

La consigne est « Mettez les tuiles dans l'ordre pour former **la phrase
demandée** », mais aucun des six tirages ne porte de consigne française. Les
tuiles suffisent à rendre chaque assemblage déterminé, donc l'exercice reste
jouable et son plancher tient. Ce qui manque est la mesure du SENS : à
l'assemblage 5, l'apprenant doit produire une QUESTION, `ปวดท้องไหมครับ`, et
rien ne le lui dit, au moment précis où l'exercice 1 déclare écarter les
tirages interrogatifs pour ne pas apprendre à lire `ไหม` comme transparent. Les
six phrases attendues en français doivent être écrites.

#### N12. Citation du RID inexacte d'un caractère

L'item 4 cite l'entrée `อักษรต่ำ` en écrivant « une déclinaison sur deux formes
de marque, la seconde donnant le ton `ตรี`, **série `ค ค่า ค้า`** ». L'entrée
relue le 2026-08-04 donne la série **`คา ค่า ค้า`** : le premier membre est
`คา`, pas `ค`. La règle rapportée est juste, la chaîne citée ne l'est pas.

## Ce qui tient et qu'il faut dire

Cet audit était adversarial et n'a pas trouvé d'erreur de langue. Sont
confirmés par mes propres relevés, sans exception :

- les quatre graphies simples et les six blocs, séquence par séquence, toutes
  NFC, aucune zone privée, aucun empilement ;
- les quatre tons, recalculés par les règles et concordants avec deux sources
  indépendantes chacun ;
- les deux correspondances de finale, `ด` vers /t/ et `บ` vers /p/, contrôlées
  à la table des consonnes ;
- la longueur de `ท้อง`, établie deux fois, par la marque `ː` de Wiktionary et
  par le contraste avec `ห้อง`, relu à la source ;
- la distinction `ปวด` contre `เจ็บ`, qui est le fait le plus lourd de la
  leçon : le RID donne bien à `เจ็บ` la maladie puis la douleur d'un coup ou
  d'une plaie, Wiktionary les donne dans le même ordre, et aucune des deux ne
  les donne à `ปวด`. Le cas `เจ็บท้อง` est réellement lexicalisé au sens de
  l'accouchement, et l'absence de `เจ็บหัว` est réelle dans les trois sources ;
- la réserve sur `หัว`, syllabe vivante « par son noyau » alors que la longueur
  de ce noyau reste NON ÉTABLIE, qui est le point le plus délicat du dossier et
  qui est traité honnêtement ;
- l'intégralité des décomptes de fréquence, sur un artefact retéléchargé dont
  l'empreinte est celle qui est annoncée ;
- l'absence totale de conseil de santé, de numéro, de posologie et de canal de
  soin sur les écrans d'apprenant ;
- l'impossibilité de réussir l'un quelconque des cinq exercices par une réponse
  constante ou une stratégie positionnelle, planchers recalculés un à un.

## Ce qui doit se passer avant `review`

1. B1, B2 et B3 corrigés, chacun re-vérifié à la source et non sur parole.
2. N4 à N12 traités ou explicitement refusés avec motif.
3. La référence du dossier de production réancrée sur
   `verification-9b-passe1.md` pour le contre-audit n° 1, et sur ce fichier
   pour le n° 2.
4. Les incertitudes 1, 2, 5 et 9 restent ouvertes et ne sont pas résolvables
   depuis ce fichier : elles appartiennent à la consolidation de l'unité 9.
5. `Revue native : en attente` reste affiché.
