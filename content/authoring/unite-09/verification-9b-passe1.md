# Contre-audit adversarial de `u09-l9b`

- Fichier audité : `content/authoring/unite-09/lecon-9b.md`
- Empreinte de l'exemplaire audité, rendue par
  `node scripts/verification/unicode-thai.mjs` : 101 332 octets, SHA-256
  `d0c61ccba86fbb793b74b201a5235abc39ef67733699a227c36d15f7140aa63c`
- Date des relevés : 2026-08-04, tous refaits par l'auditeur, aucun repris
  du dossier de production
- Consigne d'audit : chercher des erreurs, ne rien confirmer sur parole,
  re-vérifier chaque item soi-même avec les scripts versionnés
- Statut rendu : **4 findings bloquants, 8 findings non bloquants.**
  `draft` ne doit pas passer en `review` en l'état.

## Ce que j'ai re-vérifié moi-même

**115 faits distincts** re-relevés à la source, sans faire confiance au
dossier. Répartition :

| Source                                   | Faits re-vérifiés | Écarts trouvés |
| ---------------------------------------- | ----------------: | -------------: |
| RID 2554, scripts versionnés             |                20 |              0 |
| en.wiktionary + Appendix                 |                15 |              1 |
| FrequencyWords th_50k                    |                17 |              0 |
| Unicode, `unicode-thai.mjs`              |                13 |              0 |
| Dépôt, `repo-thai-scan.mjs` et relecture |                34 |              3 |
| Recalculs (tons, planchers)              |                16 |              0 |
| **Total**                                |           **115** |          **4** |

### RID 2554, par `rid-entry.mjs` et `rid-lookup.mjs` (20 faits, 0 écart)

Faits cités par référence, aucune définition reproduite ici.

1. `ปวด` vedette autonome, classée `ก.`, définition portant sur une douleur
   continue interne, avec trois exemples d'emploi `ปวดหัว`, `ปวดท้องเยี่ยว`,
   `ปวดฟัน` : conforme aux pages 2 et 4 et à l'item 1.
2. Liste `ลูกคำ` de `ปวด` : les huit dérivés cités par l'item 1 sont les huit
   rendus par le service, dans le même ordre.
3. `ปวด` ne porte AUCUNE lecture entre crochets, donc aucun `พินทุ`.
4. `เจ็บ` vedette autonome, deux sens tous deux `ก.`, le (๑) portant la
   maladie avec l'équivalent de registre royal, le (๒) la sensation après un
   coup ou sur une plaie : conforme à la page 3 et à l'item 6.
5. `ลูกคำ` de `เจ็บ` : contient bien `เจ็บไข้`, `เจ็บใจ`, `เจ็บท้อง`,
   `เจ็บปวด`, `เจ็บป่วย`, et aucun `เจ็บหัว`.
6. `เจ็บท้อง` est bien une vedette, au sens de l'accouchement.
7. `ปวดท้องเบา, ปวดท้องเยี่ยว` : vedette groupée, définie une seule fois,
   `แม่คำ` = `ปวด`. La formulation « deux vedettes définies ensemble » de
   l'item 5 est exacte.
8. `หัว ๑` porte bien NEUF sens, le (๑) étant la partie la plus haute du corps.
9. `หัว ๑` sens (๓) : la boucle initiale d'un caractère. La note culturelle est
   exacte.
10. `หัว ๒` et `หัว ๓`, cette dernière marquée `(โบ)` : conforme à l'item 2.
11. `ท้อง` vedette unique, CINQ sens, le (๑) délimitant la zone décrite par
    l'item 4.
12. Sens (๒) grossesse, (๓) étendue vaste avec les six exemples cités par la
    note culturelle, (๔) forme courbe, (๕) `ก.` porter un enfant.
13. `ศีรษะ` : lecture `[สีสะ]`, défini par `หัว`, marqué comme mot poli employé
    pour les personnes, origine sanskrite. Item 2 exact.
14. `กลัว` porte `[กฺลัว]`, séquence `U+0E01 U+0E3A U+0E25 U+0E31 U+0E27`,
    exactement la séquence citée par la section « groupe consonantique ».
15. `ขวด` ne porte aucune lecture entre crochets. Le contraste de notation
    invoqué par la page 10 tient.
16. `อักษรสูง` : ton de base `จัตวา` en `คำเป็น`, onze lettres
    `ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห`.
17. `อักษรต่ำ` : ton de base `สามัญ`, `ไม้โท` donnant `ตรี`, série `ค ค่า ค้า`,
    vingt-quatre lettres dont `ท`. Le ton HAUT de `ท้อง` est donc bien calculé.
18. `อักษรกลาง` : mot mort à initiale moyenne = ton `เอก`, neuf lettres
    `ก จ ฎ ฏ ด ต บ ป อ`. La concordance non enseignée de l'item 1 tient.
19. `คำเป็น` : voyelle longue sans finale, plus les séries `กง กน กม เกย เกอว`.
    `ท้อง` est vivante par `ง` ; la réserve de la leçon sur `หัว`, vivante « par
    son noyau » alors que la longueur du noyau reste NON ÉTABLIE, est honnête et
    nécessaire.
20. `ท้องขึ้น`, `ท้องเดิน`, `ปวดมวน`, `จุก` : aucune de ces quatre entrées
    n'emploie `ปวดท้อง` dans son corps de définition. La recherche décrite au
    dossier a bien échoué, l'incertitude 1 est fondée.

### en.wiktionary (15 faits, 1 écart)

21. `ปวด` : IPA `/pua̯t̚˨˩/`, Paiboon `bpùuat`, Royal Institute `puat`, Verb,
    « to ache; to be in pain ». Exact.
22. `ปวด` : exemple `ผู้ป่วยปวดกลางท้อง` glosé, verbe suivi d'une localisation.
23. **ÉCART, voir finding B4** : la liste des Derived terms de `ปวด` compte
    QUATORZE entrées, dont neuf ne sont pas du moule « ปวด + partie du corps ».
24. `หัว` : IPA `/hua̯˩˩˦/`, Paiboon `hǔua`, RI `hua`, premier sens « head:
    (anatomy) the upper part of the body », classificateur `หัว`, synonymes dont
    `ศีรษะ` et `เศียร`.
25. `หัว` : sens « circle part of a Thai letter, that is the start point to write
    the letter ». La note culturelle le cite mot pour mot, correctement.
26. `ท้อง` : IPA `/tʰɔːŋ˦˥/`, avec la marque `ː`. Paiboon `tɔ́ɔng`, RI `thong`.
27. `ท้อง` : premier sens nominal « (anatomy) abdomen; belly », verbe
    « (colloquial, intransitive) to be pregnant ».
28. `ท้อง` : quatrième sens nominal cité verbatim par la note culturelle, exact.
29. `เจ็บ` : IPA `/t͡ɕep̚˨˩/`, Paiboon `jèp`, RI `chep`, étymologie proto-taï.
30. `เจ็บ` : « to be sick » puis « to be hurt; be in pain ».
31. `เจ็บ` : liste de dérivés de dix-huit entrées, avec `เจ็บท้อง`, `เจ็บใจ`,
    `เจ็บตัว`, SANS `เจ็บหัว`.
32. `เจ็บ` : section « See also » contenant `ปวด`. Exact.
33. `ปวดหัว` : entrée propre, étymologie `ปวด + หัว`, IPA
    `/pua̯t̚˨˩.hua̯˩˩˦/`, Paiboon `bpùuat-hǔua`, RI `puat-hua`, « to have a
    headache ».
34. `ปวดท้อง` : HTTP **404**, et `เจ็บหัว` : HTTP **404**. Les deux absences
    annoncées sont réelles.
35. `Appendix:Thai script` : `◌ว◌` = `sara ua`, IPA `ua`, RTGS `ua` ; `◌ัวะ` =
    `uaʔ`, graphème distinct de `◌ัว`. Les deux jambes de la page 10 et de la
    réserve de longueur tiennent.

### FrequencyWords (17 faits, 0 écart)

36. Artefact re-téléchargé depuis le dépôt d'origine : **1 504 712 octets**,
    SHA-256 `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`.
    C'est **exactement** l'empreinte annoncée par le dossier. 50 000 entrées.
37. Rangs et occurrences re-relevés, tous conformes au mot près :
    `ปวดหัว` 9688 / 40, `ปวดท้อง` 18619 / 21, `หัว` 4611 / 85, `ท้อง` 14151 /
    27, `เจ็บ` 1932 / 202, `คอ` 19130, `ปวดหัวจัง` 34667, `เจ็บไหม` 15540,
    `เจ็บตรงไหน` 41347.
38. Absences confirmées : `ปวด` seul, `ปวดฟัน`, `ไม่ปวด`, `เจ็บหัว`, `เจ็บคอ`.
39. Contrôle de continuité avec `u06-l6d` : `มี` rang 276 / 1 348 occurrences et
    `ไม่` rang 3 / 52 948. Identiques aux valeurs publiées le 2026-08-03 : c'est
    bien le même artefact.

### Unicode (13 faits, 0 écart)

40. Les dix séquences de points de code déclarées par les items 1 à 8 sont
    caractère pour caractère celles rendues par `unicode-thai.mjs`.
41. Toutes les chaînes thaïes du fichier, 170 distinctes, sont en NFC stable.
    Zéro caractère de zone à usage privé.
42. Inventaire des signes conforme : `U+0E31` dans `หัว`, `U+0E49` dans `ท้อง`,
    `U+0E47` dans `เจ็บ`, aucun empilement à deux étages. Ce même inventaire
    fonde le finding B2.

### Contrôles internes au dépôt (34 faits, 3 écarts)

43. `repo-thai-scan.mjs 1 8` rend **40 fichiers, 383 entrées, 283 graphies
    distinctes** : identique au dossier. `--check-u07` passe, la convention de
    comptage est donc valide.
44. `--grep` sur `ปวด`, `เจ็บ`, `หัว`, `ท้อง` : **0** graphie publiée dans les
    unités 1 à 8 pour chacune. Les six items lexicaux sont réellement nouveaux.
45. Comptage de formules avant la section « Dossier de production » : dix
    occurrences de « jamais », une de « toujours », zéro « francophone », zéro
    « bouche française », zéro « oreille française ». Le décompte du dossier est
    exact au chiffre près, et la conformité à la section 1 bis est réelle : la
    seule mention du français, page 1, porte sur sa grammaire et relève de la
    seconde voie ouverte par la politique. Zéro tiret cadratin ou demi-cadratin.
46. Renvois de prérequis vérifiés un par un dans les fichiers cités : `ขวด`
    `khòuat` avec `longueur` NON ÉTABLIE (4C), `เจ็ด` `jèt` et `เอ็ด` (3B),
    `ไม่` / `เผ็ด` / `มาก` (4D), `ผม` / `ดิฉัน` (2D), `ครับ` / `ค่ะ` /
    `ขอบคุณ` (1E), `ขอบคุณครับ` (2C), `สบายดีไหมครับ` (2B), `คน` (3D),
    `ช้อน` / `ถ่าน` (7A), `ตั๋ว` / `เงิน` (8A), `น้อง` `náwwng` (6B), `ห้อง`
    `hâwng` avec IPA `/hɔŋ˥˩/` (7B), `ไม่ไกล` (5E), `ไม่ใช่` (8D),
    `ผมไปตลาดครับ` (5D), `ผมอยู่บ้านครับ` (7B), règle de `ไหม` (2E), finales
    retenues `-p -t -k` (5A), onze hautes moins `ฃ` et `ฐ` (4A). **Deux
    renvois sont faux ou trop larges, findings B6 et B5.**
47. Les trois cartes SRS alimentées sans création existent réellement et portent
    les contrastes annoncés : `srs-u04-l4a-06` montant contre haut,
    `srs-u07-l7a-03` et `srs-u07-l7e-03` moyen contre bas.
48. `u08-l8a` : le finding N1 sur le faux groupe `ขว` est bien marqué CORRIGÉ ;
    les deux empreintes SHA-256 du classeur et les chiffres 114 579 / 586 541
    sont cités à l'identique ; l'incertitude 2 couvre bien la longueur des trois
    voyelles glissées, dont `/ua/` ; l'arbitrage n° 2 sur la section 1 bis est
    caractérisé correctement et 9B y répond réellement.

### Recalculs (16 faits, 0 écart)

49. Planchers de hasard refaits : exercice 3, permutations de huit étiquettes
    avec au moins six points fixes = `C(8,6)·D(2) + C(8,7)·D(1) + D(0)` = **29**,
    soit 29 / 40 320 ≈ 0,072 % ; exercice 4, espérance
    `4/24 + 1/6 + 1/120` = **0,3417** assemblage et
    `P(≥ 5 sur 6)` ≈ **9,1 · 10⁻⁷** ; exercices 1 et 2, réponse constante
    plafonnée à 3/9 et 3/12. Les quatre chiffres du dossier sont exacts.
50. Les douze tons de l'exercice 2 recalculés un par un depuis la classe de
    l'initiale, la marque et le caractère vivant ou mort de la syllabe :
    `มี` `เงิน` `คน` moyens, `ปวด` `เจ็บ` `ถ่าน` bas, `หัว` `ผม` `ตั๋ว`
    montants, `ท้อง` `น้อง` `ช้อน` hauts. Aucun tirage ne porte le ton
    descendant, conformément à ce que la carte annonce.

### Priorité « correspondances de finales »

La consigne d'audit portait cette priorité sur 9A. **9A n'existe pas** dans
`content/authoring/unite-09/` : le répertoire ne contient que 9B, 9C, 9D et 9E.
La priorité a donc été appliquée à ce que 9B annonce comme finales : `ด` de
`ปวด` et de `เจ็ด` rendu `t`, `บ` de `เจ็บ` rendu `p`, `ง` de `ท้อง` rendu `ng`.
Les trois correspondances sont justes, concordantes avec `u05-l5a` (`เป็ด`,
`กาบ`, `นก`) et avec les IPA relevées. **Une seule anomalie, finding B9** : un
piège de l'exercice 5 décrit la finale `ด` comme rendant `d`.

## Findings

### B1. BLOQUANT. Exercice 1, tirage 6 : le corrigé fait dire à une question ce qu'elle ne dit pas

Consigne de l'exercice, ligne 665 : « Écoutez, puis dites où la personne a
mal. » Tirage 6, ligne 676 :

> 6. Audio ปวดท้องไหมครับ (pòuat·tháwwng mǎi khráp) : au ventre.

`ปวดท้องไหมครับ` est une QUESTION posée à l'interlocuteur. Le dialogue de la
même leçon, ligne 891, la traduit lui-même « Et au ventre, vous avez mal ? ».
Le locuteur ne dit donc pas qu'il a mal : il demande. Le corrigé « au ventre »
répond à une autre question que la consigne, celle de la partie du corps
NOMMÉE, et c'est d'ailleurs la lecture que trahit l'option 3, « elle ne nomme
aucune partie du corps », qui parle de nomination et non de douleur.

Conséquence pédagogique : l'unique tirage interrogatif de la leçon apprend à
traiter `ไหม` comme transparent, au moment précis où l'assemblage 5 de
l'exercice 4 et la règle de `u02-l2e` demandent le contraire.

Correction minimale : soit retirer le tirage 6, soit aligner la consigne sur ce
qui est réellement mesuré (« quelle partie du corps est nommée ? ») et
requalifier les libellés des trois options en conséquence.

### B2. BLOQUANT. Page 5 : « rien n'est posé au-dessus » de `หัว` est faux, et le dossier se contredit lui-même

Page 5, lignes 149 à 153 :

> ห est l'une des consonnes hautes de 4A, le ว appartient à la voyelle ◌ัว comme
> dans ตัว et ขวด, il n'y a donc aucune consonne finale, et **rien n'est posé
> au-dessus**. La règle de 4A donne le ton MONTANT.

`หัว` = `U+0E2B U+0E31 U+0E27`. Le `◌ั` (`MAI HAN-AKAT`) EST un signe suscrit,
de catégorie positionnelle `Top`. Le dossier de la même leçon l'écrit noir sur
blanc, ligne 1338 : « หัว porte U+0E31 (`MAI HAN-AKAT`, `Top`) seul », et
`unicode-thai.mjs` le confirme (`U+0E31`, 41 occurrences, exemple `หัว`).

L'apprenant a donc le signe sous les yeux à la seconde où on lui dit qu'il n'y a
rien au-dessus, sur l'un des deux mots-clés de la leçon, et à l'endroit exact où
il apprend à calculer un ton. Bloquant parce que la phrase fausse est la règle
elle-même, pas un ornement.

Correction : « aucune MARQUE DE TON n'est posée au-dessus ». La marque de ton et
le signe vocalique sont deux choses distinctes, et la leçon 7A a déjà installé
ce vocabulaire.

### B3. BLOQUANT. Item 7 : décompte de tons faux, réfuté par le champ `ton` du même item

Item 7, `note_fr`, ligne 600 :

> Un point d'oreille : **trois tons montants sur quatre syllabes** dans la forme
> masculine, phǒm, hǒua, puis khráp qui est haut et non montant.

Le champ `ton` du même item, ligne 592 : « phǒm montant ; pòuat bas ; hǒua
montant ; khráp haut ». **Deux** montants sur quatre, pas trois. La phrase se
réfute en s'énumérant : elle annonce trois montants puis nomme deux montants et
un haut, et laisse de côté `pòuat`, qui est bas.

Bloquant au titre du « ton faux » : c'est une affirmation de ton, sur un écran
d'apprenant, dans une leçon dont l'objectif est précisément d'annoncer le ton
d'un mot entendu.

### B4. BLOQUANT. Item 1 : la source Wiktionary est citée pour dire ce qu'elle ne dit pas

Item 1, `sources`, lignes 295 et 296 :

> Les termes dérivés listés par cette même entrée sont **tous du même moule**,
> ปวดท้อง, ปวดฟัน, ปวดหลัง, ปวดหู, ปวดหัว.

Relevé du 2026-08-04 sur `https://en.wiktionary.org/wiki/ปวด` : la section
Derived terms compte **quatorze** entrées. Neuf ne sont pas du moule « ปวด +
partie du corps » : `เจ็บปวด`, `ปวดกะโหลก`, `ปวดมวน`, `ปวดเมื่อย`, `ปวดร้าว`,
`ปวดแสบปวดร้อน`, `มีอาการปวดหัว`, `ยาแก้ปวด`, `ยาบรรเทาปวด`. Le « tous » est
faux, et la sélection n'est pas signalée comme telle.

Ce n'est pas cosmétique : cette liste est l'une des trois jambes qui établissent
le moule, et c'est sur ce moule seul que repose l'enseignement de `ปวดท้อง`, le
bloc le plus faiblement attesté de la leçon (item 5, incertitude 1). Une jambe
qui dit moins que ce qu'on lui fait dire affaiblit l'unique argument disponible.

À noter : la même liste est citée CORRECTEMENT à l'item 5, avec le verbe
« porte » et sans quantificateur. La correction consiste à reprendre cette
formulation à l'item 1.

### B5. Non bloquant. `u01-l1d` ne publie pas de courbes de ton

Deux affirmations :

- exercice 2, ligne 708 : « Options : quatre [...] chacune avec sa courbe,
  **exactement comme en `u01-l1d` et `u04-l4a`** » ;
- section « Sources des deux tons calculés », lignes 1208 à 1210 : « Seconde
  jambe, les deux contours sont déjà décrits et **illustrés par les courbes
  publiées de `u01-l1d`** et `u04-l4a`. »

Relecture de `unite-01/lecon-1d.md` : le mot « courbe » n'y figure pas une seule
fois, et ses six tirages sont formulés « Options : Montant / Haut », en texte,
sans contour dessiné. Seul `u04-l4a` publie des cartes à contour (ligne 540 :
« deux cartes, "montant" avec une courbe qui part en bas et remonte [...] Un
contour dessiné accompagne chaque carte »). 1D décrit les contours, en mots et
en gestes ; il ne les illustre pas.

Accessoirement, l'identifiant réellement déclaré par cette leçon est `u01-1d`,
pas `u01-l1d` : l'unité 1 est irrégulière sur ce point, 1A, 1C et 1E déclarant
`u01-l1a`, `u01-l1c` et `u01-l1e`. À trancher à la consolidation, mais la
citation de 9B ne résout aujourd'hui aucun identifiant existant.

### B6. Non bloquant. Page 8 : l'exemple est attribué à 6D alors qu'il est publié par 6B

Page 8, ligne 182 : « Rappelez-vous 6D : [qui] + มี + ce qu'on a + particule,
comme dans `ผมมีพี่ชายสองคนครับ`. »

`ผมมีพี่ชายสองคนครับ` est l'item 8 de **`u06-l6b`** (lignes 604 à 606). L'item 8
de `u06-l6d` est `มีพี่น้องสองคน`, sans pronom ni particule finale. `u06-l6d`
cite bien la phrase dans son propre dossier, mais l'apprenant l'a rencontrée en
6B, et c'est en 6B qu'il ira la chercher.

Même famille : l'item 7 de 9B écrit que « `u06-l6d` publie `มีพี่น้องสองคน` et
son instance complète » ; 6D ne publie comme item que `มีพี่น้องสองคน`, qu'il
nomme lui-même « l'instance complète du patron ». La formulation de 9B laisse
croire à deux items là où il n'y en a qu'un.

### B7. Non bloquant, à arbitrer par le fondateur. Page 12 : une injonction de santé subsiste

Balayage complet du fichier sur `médecin`, `pharmac`, `urgence`, `hôpital`,
`1669`, `médicament`, `posologie`, `gravité`, `docteur`, `traitement`,
`secours`, `appelez`, `consultez` : **aucun numéro d'appel, aucune posologie,
aucune consigne de secours, aucune indication de gravité**. `หมอ` et `ยา` sont
explicitement écartés et jamais montrés. Sur ce point la leçon tient ce qu'elle
promet, et c'est rare sur un sujet de santé.

Reste une phrase, page 12, ligne 224 : « pour un problème réel, adressez-vous à
un médecin ou à un pharmacien. »

C'est la seule phrase du fichier qui oriente un comportement de santé, à
l'impératif, et qui nomme un canal de soin. La consigne d'audit demande de
signaler comme bloquant « tout conseil médical, même sourcé ». Je ne la classe
pas bloquante, pour une raison que j'assume : c'est la clause de non-conseil
standard, la supprimer sèchement laisserait la leçon muette là où elle est
aujourd'hui prudente, et le paragraphe dit d'abord « cette leçon ne vous le dira
pas ». Mais la forme est une injonction, pas un constat de périmètre, et une
reformulation coûte une phrase : « ce que vous faites ensuite ne relève pas
d'une leçon de langue ». **Décision à Selim.**

### B8. Non bloquant. Méta : une extension de transcription employée partout, jamais déclarée

Ligne 102 : « Transcription : convention `thainaute-fr` v1.1. »

Or tout le vocabulaire de la leçon repose sur le graphème `oua` (`pòuat`,
`hǒua`, et les rappels `khòuat`, `tǒua`), qui ne figure ni dans la v1, ni dans
l'amendement v1.1, ni dans l'amendement v1.2 de `CONVENTIONS.md`. Les leçons
voisines le déclarent, elles :

- `u06-l6d` : « convention `thainaute-fr` v1.1, plus le graphème `oua` pour la
  diphtongue /ua/, **extension proposée par `u03-l3d` et non encore ratifiée**
  (incertitude 2) » ;
- `u06-l6c` : « plus un graphème **NON RATIFIÉ** » ;
- `u05-l5d` : `oua` « n'appartient ni à l'amendement v1.1, ni à l'amendement
  v1.2 ».

9B le présente à l'inverse comme une « convention publiée par `u04-l4c` »
(item 1) et n'ouvre aucune incertitude sur ce point, alors que la page 10 et
l'exercice 5 en font le cœur de leur enseignement. Un lecteur du seul fichier 9B
conclura que `oua` est ratifié. Ajouter la mention d'écart, comme 6C et 6D.

Point voisin, plus léger : la lignée de la réserve de longueur citée par
l'item 1 (`u03-l3d`, `u04-l4c`, `u05-l5d`, `u08-l8a`) omet `u06-l6d`, qui porte
pourtant la même réserve sur le même noyau `/ua/` (`khroua`, ligne 511), et
retient `u05-l5d`, dont la réserve porte sur `/ɯa/`.

### B9. Non bloquant, mais c'est une correspondance de finale. Exercice 5, piège `jèd`

Exercice 5, pièges connus, ligne 867 :

> écrire `jèd` au lieu de `jèp` **en lisant la finale de เจ็ด**, publié en 3B

Lire la finale de `เจ็ด` ne donne pas `d` : `u03-l3b` publie `เจ็ด` avec
`transcription : jèt` et IPA `/t͡ɕet̚˨˩/`, la page 11 de 9B affiche elle-même
« เจ็ด (jèt) », et `u05-l5a` a établi la correspondance `ด` finale → `t` sur
`เป็ด`. Le piège, tel qu'il est rédigé, attribue au parcours une correspondance
de finale qu'il n'enseigne pas, et il la met par écrit dans le fichier d'où
sortira le contenu produit.

Correction : « écrire `jèd`, en notant la finale par sa lettre au lieu de son
son » ; l'erreur d'apprenant décrite est réelle, c'est son explication qui est
fausse.

### B10. Non bloquant. Dialogue : une traduction qui ajoute un mot absent du thaï et diverge de l'item publié

Ligne 889 :

| Locuteur | Thaï          | Français         |
| -------- | ------------- | ---------------- |
| Collègue | สบายดีไหมครับ | Bonjour, ça va ? |

Le thaï ne contient aucune salutation, et `u02-l2b` publie ce bloc avec
`fr : vous allez bien ? (locuteur homme)`. Deux traductions différentes du même
bloc dans le même parcours, dont l'une ajoute un mot que le thaï ne porte pas.

De la même famille, plus défendable : « ไม่ปวดครับ ขอบคุณครับ » rendu « Non, je
n'ai pas mal. Merci. », où le « Non » est une glose d'usage et non un mot du
thaï.

### B11. Non bloquant. Tableau de preuve : `ปวดฟัน` sous-évalué

Tableau de l'étage 2, ligne 1120 : `ปวดฟัน` est classé « listé sous "ปวด" »
chez en.wiktionary. Or `https://en.wiktionary.org/wiki/ปวดฟัน` rend un HTTP
**200** : la graphie a sa propre entrée, donc « présent » au sens de la légende
que le dossier pose lui-même trois lignes plus haut. L'erreur va dans le sens
défavorable à la leçon, mais un tableau qui sert de preuve doit être juste dans
les deux sens, sinon il ne prouve plus rien.

### B12. Non bloquant, mais structurel. VOLUBILIS n'est pas recomputable dans cet environnement

Le classeur n'est pas versionné et n'est pas présent sur la machine. Les points
de téléchargement cités par l'en-tête de `scripts/verification/volubilis-lookup.mjs`
répondent, au 2026-08-04 :

- `master.dl.sourceforge.net/project/belisan-volubilis/VOLUBILIS_Database.xlsx?viasf=1` → **HTTP 404** ;
- `sourceforge.net/projects/belisan-volubilis/files/` → **HTTP 404** ;
- API REST et `best_release.json` → **HTTP 403**.

Conséquence honnête : **aucune** citation VOLUBILIS de cette leçon n'a pu être
re-vérifiée par moi. Cela couvre les lignes 79445, 79446, 16463, 79452, 79453,
102844, 79472, 19427 à 19430, 19458, 19459, 79450, 79459, 34820, 34821, 92228,
la clé `TONES`, la feuille `Romanization` et les deux empreintes SHA-256 du
classeur. Ce n'est pas un défaut de 9B : le dossier cite l'empreinte exacte que
documente le script versionné, et ses reprises de chiffres de `u08-l8a`
(114 579 lignes, 586 541 chaînes) sont exactes. Mais VOLUBILIS est l'une des
deux jambes pour six items sur huit, et l'amendement v1.2 exige qu'un tiers
puisse « refaire la consultation à l'identique ». Aujourd'hui il ne le peut pas.

Action : archiver l'exemplaire employé hors du dépôt Git mais dans un stockage
accessible, ou consigner un second point de téléchargement vivant.

## Ce que je n'ai PAS pu prendre en défaut

Par honnêteté d'auditeur adversarial, et parce que la liste est aussi
informative que celle des findings :

- **Le fait central de la leçon tient.** `เจ็บ` couvre bien la maladie et la
  douleur d'un coup ou d'une plaie, ce que ni le RID, ni Wiktionary n'attribuent
  à `ปวด`. J'ai relu les deux entrées à la source. La distinction est réellement
  sourcée, et la leçon a la prudence de dire qu'elle décrit ce que les sources
  attribuent, pas ce que la langue interdit.
- **La mise en garde de la page 4 est juste et nécessaire.** `เจ็บคอ` existe
  chez VOLUBILIS et pas au RID : une règle « `ปวด` pour le corps » serait fausse,
  et la leçon l'écrit.
- **`เจ็บท้อง` est correctement traité** : le RID le lexicalise bien au sens de
  l'accouchement, la divergence avec VOLUBILIS est consignée et non tranchée.
- **Aucun exercice n'est réussissable par une réponse constante**, et les quatre
  planchers annoncés sont exacts au recalcul.
- **Aucune assertion non sourcée sur le français**, contrôle mécanique refait et
  confirmé au chiffre près.
- **Aucun conseil médical, aucun numéro, aucune posologie**, hors le point B7.
- **Aucun corrigé faux hors le tirage 6 de l'exercice 1** : les douze tons de
  l'exercice 2, les huit paires de l'exercice 3, les six assemblages de
  l'exercice 4 et les huit réponses de l'exercice 5 sont justes.
- **Unicode irréprochable** : dix séquences NFC stables, aucun empilement,
  aucune zone à usage privé, et les avertissements de rendu sur `U+0E40`,
  `U+0E44` et la classe combinatoire 0 de `U+0E47` sont exacts.

## Conclusion

Le dossier de production de 9B est, sur le fond des sources, le plus solide que
j'aie eu à contredire : les vingt faits RID, les quinze faits Wiktionary, les
dix-sept relevés de fréquence et les quatre décomptes internes sont exacts, y
compris là où ils désavantagent la leçon. Les quatre findings bloquants ne
portent pas sur la recherche, ils portent sur des phrases écrites : une question
traitée comme une affirmation, un signe suscrit déclaré absent, un décompte de
tons qui se contredit dans le même item, et un quantificateur de trop sur une
liste de dérivés.

`draft` maintenu. Les quatre bloquants sont corrigeables en moins d'une heure et
aucun ne demande une nouvelle recherche.
