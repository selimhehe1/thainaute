# Vérification adversariale de `lecon-13d.md`

- Date : 2026-08-04
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), mandat ADVERSARIAL
- Fichier audité : `content/authoring/unite-13/lecon-13d.md`
  (110 407 octets, sha256 `004177a647fef8eac3ad75f0ebed6e8d1d15e69b1f7e28657efc3e0a7f681edb`)
- Référentiels lus avant l'audit :
  `docs/pedagogie/parcours-avance-registres-et-dialectes.md`,
  `content/authoring/CONVENTIONS.md`,
  `docs/content-policy/sources-verification.md`
- Méthode : aucune affirmation du dossier de 13D n'a été reprise de confiance.
  Les huit entrées du dictionnaire normatif ont été ROUVERTES par l'auditeur,
  ainsi que cinq entrées de contrôle. Les lignes VOLUBILIS ont été redumpées
  depuis l'exemplaire empreinté. Les entrées en.wiktionary ont été refetchées en
  rendu. Les rangs de fréquence ont été recalculés depuis `th_50k.txt`. Les
  planchers ont été recalculés À LA MAIN avant d'être comparés au script.

## Résumé

**55 faits confirmés par l'auditeur lui-même. 9 findings, dont 5 bloquants.**

Le fichier est d'une honnêteté méthodologique inhabituelle : il déclare ses
propres trous, écarte deux pièges VOLUBILIS réels, consigne un contrôle négatif
et refuse de fabriquer des phrases. **La priorité 2 est propre** : aucune des
huit formes n'est mise en production nulle part, vérification faite écran par
écran. Les défauts trouvés sont concentrés sur **la qualification des jambes de
source** et sur **deux affirmations livrées à l'apprenant que les sources ne
portent pas**.

---

## Partie A : ce que l'auditeur a confirmé lui-même

### A.1 Corps des entrées du dictionnaire normatif (8 items, rouverts)

Relevés par script indépendant, même endpoint, même corps de requête que
`rid-entry.mjs`, le 2026-08-04.

1. **กู** : `ส. คำใช้แทนตัวผู้พูด ในปัจจุบันมักถือกันว่าไม่สุภาพ, เป็นสรรพนามบุรุษที่ ๑.`
   Vedette autonome unique, ส., pronom de 1re personne. La clause citée par 13D,
   « ในปัจจุบันมักถือกันว่าไม่สุภาพ », est une **sous-chaîne exacte**. CONFIRMÉ.
2. **มึง** : clause « มักถือกันว่าไม่สุภาพหรือหยาบคาย » sous-chaîne exacte, ส.,
   2e personne. CONFIRMÉ.
3. **แก** : DEUX vedettes. « แก ๑ » น., _Corvus splendens_. « แก ๒ » à deux sens
   numérotés : **(๑) ส.** sans étiquette, clause de relation
   « ...ผู้ที่เราพูดด้วยซึ่งเป็นผู้ที่สนิทสนม หรือผู้น้อย » ; **(๒) (ปาก) ส.**,
   3e personne. **La portée de `(ปาก)` décrite par 13D est exacte** : elle porte
   sur le sens (๒), pas sur le (๑). CONFIRMÉ (voir finding 1 pour la
   conséquence).
4. **มัน** : CINQ vedettes. มัน ๑ tubercule, มัน ๒ graisse, มัน ๓ pronom,
   มัน ๔ ก. plaisir, มัน ๕ ว. saveur et brillant. La répartition annoncée par 13D
   est exacte, et la clause qu'elle cite,
   « สำหรับเรียกผู้อื่นอย่างไม่ยกย่อง », est une sous-chaîne exacte de มัน ๓.
   CONFIRMÉ.
5. **วะ** : DEUX vedettes. « วะ ๑ » (๑) อ. interjection d'émotion ; (๒) **ว.**
   « คำบอกเสียงต่อท้ายประโยคแสดงความคุ้นเคยเป็นกันเองหรือแสดงความไม่สุภาพ เช่น
   ไปไหนวะ. » La clause citée est sous-chaîne exacte, l'exemple est bien une
   question, « วะ ๒ » est bien le phénomène de vers. CONFIRMÉ.
6. **ไอ้** : vedette unique น., trois sens. Les deux clauses citées,
   « แสดงว่ามีความสนิทสนมมาก » (sens ๑) et « แสดงความดูหมิ่นเหยียดหยาม » (sens ๒),
   sont des sous-chaînes exactes, et leur COEXISTENCE dans la même entrée est
   réelle. CONFIRMÉ.
7. **อี** : DEUX vedettes. « อี ๑ » น., ordre des emplois exactement celui décrit
   par 13D ; les deux clauses citées sont des sous-chaînes exactes. « อี ๒ » ne
   porte que des noms de jeux et de figures de jeux. CONFIRMÉ.
8. **เออ** : vedette unique **อ.**, clause
   « มักเป็นคำที่ผู้ใหญ่ใช้กับผู้น้อย หรือระหว่างเพื่อนที่สนิทสนมกัน »
   sous-chaîne exacte, plus le second emploi de rappel. CONFIRMÉ (voir findings
   3 et 4).

### A.2 Entrées de contrôle rouvertes

9. **ว่ะ** : le service ne rend **aucune vedette**, seulement le formulaire de
   proposition de mot. Le contrôle négatif de 13D est exact. CONFIRMÉ.
10. **จ้า**, piège de référence du parcours : `ว. จัด, ยิ่ง, แรง, (ใช้แก่สี แสง
หรือเสียง) เช่น สีจ้า แสงจ้า.` C'est bien un modificateur d'intensité et
    **pas** une particule finale. Le piège est confirmé sur pièce, et **13D n'y
    tombe pas**. CONFIRMÉ.
11. **เว้ย** : clause « ใช้ในลักษณะที่ไม่สุภาพหรือเป็นกันเอง » sous-chaîne
    exacte. CONFIRMÉ.
12. **เธอ** : l'entrée ne porte **aucune** étiquette de registre ni
    d'impolitesse : uniquement une clause de relation
    « มักใช้ในระหว่างเพื่อนผู้หญิงด้วยกัน หรือใช้กับผู้มีศักดิ์ตํ่ากว่า ». La
    phrase de la page 10 sur ฉัน et เธอ est donc exacte côté RID. CONFIRMÉ, et
    c'est ce qui fonde le finding 3.
13. **Étiquettes grammaticales** des huit vedettes : ส. ส. ส. ส. ว. น. น. อ.
    Elles correspondent exactement à la clé annoncée par l'exercice 3.
    CONFIRMÉ.

### A.3 VOLUBILIS, exemplaire et lignes

14. Exemplaire : `VOLUBILIS_Database.xlsx`, **10 848 409 octets**, sha256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`,
    **114 579 lignes non vides**, **586 541 chaînes partagées**. Les quatre
    chiffres annoncés par 13D sont exacts. CONFIRMÉ.
15. **46601** กู : `pr.` / usage `(inf., vulg.)`. CONFIRMÉ.
16. **55151** มึง : `pr.` / usage `(inf., vulg.)`. CONFIRMÉ.
17. **20933 / 20934 / 20935** แก : oiseau `n.` ; pronom 2e `pr.` usage `(inf.)` ;
    pronom 3e `pr.` **sans colonne d'usage**. Le partage en trois reproduit bien
    celui du dictionnaire normatif. CONFIRMÉ.
18. **53684 à 53691** มัน : **huit** lignes ; 53684-53688 tubercule, graisse,
    `enjoy`, deux adjectifs ; 53689 `(obj., anim.)` ; 53690 `pr. impers.` ;
    **53691 seule porte `(pej., vulg.)`**. CONFIRMÉ.
19. **107750** วะ : `part.`, glose de fonction `[informal and impolite particle
…]`, ThaiPhon `¯wa`. **107751** ว่ะ : glose `fucking`, TYPE `X`. CONFIRMÉ.
20. **522** ไอ้ : les `(inf.)` sont bien dans la colonne ANGLAISE
    (`mate (inf.)`, `dude (Am., inf.)`), la colonne d'usage ne porte que `(m.)`,
    et la note `[familiar or derogatory masculine appellation]` est bien en
    **colonne N**. **Le piège est réel et 13D l'écarte correctement.** CONFIRMÉ.
21. **64568** เออ : `(fam.)` est bien dans la glose FRANÇAISE « Ouais ! », et la
    **colonne d'usage est vide**. **Second piège réel, correctement écarté.**
    CONFIRMÉ.
22. **17035 à 17038** อี : quatre lignes ; `(vulg.)` sur la seule 17036, `pref.` ;
    17038 est bien la lettre latine E. CONFIRMÉ.
23. **12841** เอ็ง et **28956 / 28957** ข้า : aucune colonne d'usage. Les motifs
    d'écart de la partie 4 sont exacts. CONFIRMÉ.
24. **110710 / 110711 / 110738** เว้ย et โว้ย : les trois portent bien `RID` en
    colonne de domaine. CONFIRMÉ.

### A.4 en.wiktionary, rouvert en rendu

25. **กู** `/kuː˧/`, Paiboon `guu`, RI `ku`, « (now considered vulgar and
    offensive) a first person pronoun: I », note « Often used together with the
    second person pronoun มึง ». CONFIRMÉ.
26. **มึง** `/mɯŋ˧/`, Paiboon `mʉng`, RI `mueng`, « (vulgar, derogatory,
    offensive) », note symétrique. CONFIRMÉ.
27. **แก** `/kɛː˧/`, trois sens pronominaux tous « colloquial », dont un
    « colloquial, derogatory » et un « colloquial, somewhat dated ». CONFIRMÉ.
28. **มัน** `/man˧/`, quatre sens pronominaux, dont les deux cités mot pour mot.
    CONFIRMÉ.
29. **วะ** `/waʔ˦˥/`, Paiboon `wá`, particule « (vulgar, offensive) used at the
    end of an expression of doubt, interrogation, or suggestion ». CONFIRMÉ.
30. **ไอ้** `/ʔaj˥˩/`, Paiboon `âi`, cinq sens, dont les deux cités. CONFIRMÉ.
31. **อี** `/ʔiː˧/`, Paiboon `ii`, cinq sens, dont les deux cités. CONFIRMÉ.
32. **เออ** `/ʔɤː˧/`, Paiboon `əə`, « (mostly vulgar) exclamation expressing
    agreement, assent, concurrence, approval ». CONFIRMÉ.
33. **เว้ย** et **โว้ย** rendent bien **HTTP 404**. Le motif de retrait de la
    partie 4 est exact sur ce point. CONFIRMÉ.

### A.5 Fréquence

34. `th_50k.txt` : **1 504 712 octets**, sha256
    `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`,
    **50 000 lignes**, et la première ligne est bien un artefact d'encodage
    (`เธ 81142`). CONFIRMÉ.
35. Les huit rangs recalculés : เออ **86**, มัน **159**, แก **372**, กู **1 376**,
    อี **1 482**, ไอ้ **1 597**, วะ **5 438**, มึง **16 138**. **Huit sur huit
    exacts.** CONFIRMÉ.
36. ว่ะ **6 854**, ผม **69**, ค่ะ **21**, เอ็ง **ABSENTE** des 50 000. Les quatre
    chiffres de service sont exacts. CONFIRMÉ.

### A.6 Contrôles mécaniques réexécutés

37. `unicode-thai.mjs` : **8 champs `thai`, 100 chaînes thaïes distinctes dont 92
    hors des champs `thai`, NFC toutes conformes, aucun caractère de la zone à
    usage privé**, et l'inventaire des douze signes non consonantiques est
    identique à celui publié. CONFIRMÉ à l'unité près.
38. Les huit séquences de points de code rendues par le script sont exactement
    celles des champs `codepoints`. Aucun signe combinant isolé ne subsiste :
    la correction annoncée sur le U+0E49 orphelin a bien été appliquée.
    CONFIRMÉ.
39. `item-fields-check.mjs` : `0` / `0`. `item-fields-fr-check.mjs` : `0`.
    **Le « zéro vide » que 13D déclare est exact** : lecture faite du script,
    la comparaison de réemploi n'est déclenchée que par un TITRE d'item portant
    `uXX-lYz`, ce qu'aucun des huit titres neufs ne fait. La déclaration
    d'honnêteté est fondée. CONFIRMÉ.
40. `repo-thai-scan.mjs 13 13` : **5 fichiers, 33 entrées, 28 graphies, 6 ไม้เอก,
    4 ไม้โท**. CONFIRMÉ.
41. `tmp-13d-coordination.mjs 13` : **5 collisions** (ครับ, ค่ะ, คะ, แล้วคุณล่ะ,
    นะ), **11 redéclarations sur 7 graphies**, ventilation **6 / 3 / 2 / 0**.
    **Aucune des huit graphies de 13D n'apparaît dans la liste des collisions.**
    CONFIRMÉ.
42. `tmp-13d-registres.mjs 1 12` : **525 / 421 / 84 / 5 / 2 / 13**. CONFIRMÉ au
    chiffre près.
43. Les cinq `familier` stricts sont bien หวัดดี `u02-l2b`, ฉัน `u02-l2d`,
    เท่าไหร่ `u03-l3c`, เธอ `u06-l6a`, ทีวี `u07-l7d` ; et `u01-l1d` écrit bien
    `registre : courant, familier` pour หมา. CONFIRMÉ sur pièce.
44. `u12-l12e` page 3 écrit bien « 6 portent familier », « 2 formel », « 10 ne
    sont pas étiquetées ». La reproduction annoncée par 13D est exacte, et
    l'écart de 10 contre 13 est réel. CONFIRMÉ.

### A.7 Réemplois du fondamental (priorité 3, relus à la main)

45. Les **18 lignes** du tableau « Blocs réemployés » ont été rouvertes une par
    une dans leur fichier d'origine. **Zéro divergence de transcription.**
    Vérifiés : ผม `phǒm`, ดิฉัน `dì·chǎn`, ฉัน `chǎn (variante familière chán)`,
    คุณ `khoun` (`u02-l2d` items 1-4) ; ครับ `khráp`, ค่ะ `khâ` (`u01-l1e`
    items 2-3) ; คะ `khá` (`u02-l2e` item 1) ; เขา `khǎo` (`u06-l6c` item 1) ;
    เธอ `thoee`, เจอ `joee` (`u06-l6a` items 5-6) ; คน `khon` (`u03-l3d`
    item 1) ; แก้ว `kâeew` (`u04-l4c` item 4) ; แพง `phaeeng` (`u02-l2a`
    item 7) ; หนึ่ง `nùeng` (`u03-l3b` 1.1) ; ปู `pouu` (`u01-l1c` item 3) ;
    ไม่ `mâi` (`u04-l4d` item 1) ; อะไร `à·rai` (`u02-l2d` item 6) ; อีกที
    `ìik·thii` (`u11-l11a` item 4). CONFIRMÉ, avec une réserve d'attribution au
    finding 8.
46. Les citations littérales des leçons antérieures sont exactes, sous-chaîne
    par sous-chaîne : `u03-l3b` « lèvres étirées, jamais arrondies » ;
    `u03-l3d` « un n prononcé, jamais comme le “on” nasal français » ;
    `u02-l2d` « mot présenté en reconnaissance seulement » ; `u06-l6a` page 11
    porte bien sur เธอ contre คุณ devant un inconnu ; `u11-l11a` note bien que
    Paul ne dit « oui » à aucun moment. CONFIRMÉ.
47. Les registres des formes remises en PRODUCTION par l'exercice 4 ont été
    relus : ผม `poli`, ดิฉัน `poli`, คุณ `poli`, เขา `neutre`, ครับ `poli`,
    คะ `poli`. **Aucune forme `familier` n'est mise en production.** CONFIRMÉ.

### A.8 Planchers, recalculés à la main puis comparés

48. **Exercice 1**, les six stratégies recalculées tirage par tirage sur les
    douze tirages écrits dans le fichier : carte constante **1**, position
    constante **4,00**, « toujours une forme du jour » **6,00**, « toujours une
    forme publiée » **3,50**, « la plus longue » **3,17** (et **6** avec tous les
    ex aequo), « la plus courte » **4,17** (et **8** avec tous les ex aequo).
    **Les six valeurs tombent juste, et le plafond de 8 sur 12 contre un seuil
    de 10 est exact.** CONFIRMÉ.
49. **Exercice 3** : réponses constantes 4 / 4 / 2 / 2 ; hasard uniforme
    espérance 3, `P(≥10) = 79/2 097 152 ≈ 0,0038 %` ; pile ou face
    `79/4 096 = 1,93 %` ; « moitié instruit » espérance `4 + 8/3 = 6,67` et
    `P(≥10) = 129/6 561 = 1,97 %` ; version à huit tirages `9/81 = 11,1 %`.
    **Les cinq chiffres tombent juste.** CONFIRMÉ.
50. **Exercice 2** : `1/8! = 1/40 320 = 0,0025 %`. **Exercice 4** : réponse
    constante au mieux **3 sur 8** (`khoun` aux tirages 3, 4 et 8) et **six**
    réponses distinctes. CONFIRMÉ.
51. `tmp-13d-planchers.mjs` réexécuté : **sa sortie est identique, ligne à ligne,
    aux chiffres du fichier de leçon**, et sa liste de tirages est celle du
    fichier. Le point 5 de la liste de contre-audit est donc satisfait.
    CONFIRMÉ.
52. **Aucun des quatre exercices n'est réussissable par une réponse constante** :
    1 sur 12, impossible par construction, 4 sur 12, 3 sur 8, contre des seuils
    de 10, 8, 10 et 6. CONFIRMÉ.

### A.9 Divers

53. **Zéro tiret cadratin ou demi-cadratin** dans tout le fichier (ADR-0022).
    CONFIRMÉ.
54. **Dérivations tonales** refaites à la main : ก et อ classe moyenne, syllabes
    vivantes sans marque → moyen ; ม classe basse, vivantes → moyen ; ว classe
    basse, syllabe morte à voyelle brève → **haut** ; ไม้โท sur classe moyenne →
    **descendant**. **Les huit résultats concordent avec les huit IPA de
    en.wiktionary.** Les huit transcriptions sont conformes à l'amendement v1.1
    (`kouu`, `mueng`, `kaee`, `man`, `wá`, `âi`, `ii`, `oee`). CONFIRMÉ.
55. **Cohérence avec `u13-l13e`** : 13E défère bien วะ à 13D comme item, donne la
    même transcription `wá`, et traite ไปไหนวะ et อะไรวะ comme SPÉCIMENS. Aucune
    divergence de fait entre les deux fichiers. **Aucune promesse de « parler
    comme un natif » nulle part** ; la page 12 la refuse explicitement.
    CONFIRMÉ.

---

## Partie B : findings

### Finding 1 : `REG-KAEE-PORTEE`, BLOQUANT

**L'affirmation de registre sur แก n'a pas de première jambe.**

L'auditeur a rouvert l'entrée. Sur la vedette « แก ๒ », le sens **(๑)**, le seul
que la leçon enseigne, se lit
`ส. คำใช้แทนผู้ที่เราพูดด้วยซึ่งเป็นผู้ที่สนิทสนม หรือผู้น้อย, เป็นสรรพนามบุรุษที่ ๒`
: **aucune étiquette**, seulement une clause de relation. L'étiquette `(ปาก)` est
posée sur le sens **(๒)**, le pronom de troisième personne, que la leçon
n'enseigne pas et écarte explicitement.

Restent les deux autres jambes. VOLUBILIS **20934**, la seule ligne qui porte
`(inf.)` sur la valeur enseignée, porte **`K=GRAMMA ; RID`** en colonne de
domaine : par le critère que 13D applique elle-même à เว้ย et โว้ย, cette ligne
« se déclare dérivée de la première source ». Et en.wiktionary étiquette
« colloquial », or `sources-verification.md` § 1 quater écrit noir sur blanc :
« Les marques `(inf.)` de Volubilis et “colloquial” ou “informal” de Wiktionary
servent de **seconde jambe, jamais de première**. »

Le champ `registre` de l'item 3 affirme pourtant **« familier »**, et la page 10
range แก parmi les huit formes qui « portent en plus une étiquette de registre
marquée ». C'est la structure exacte du piège จ้า, un cran plus fin : la graphie
est attestée, l'entrée décrit bien le mot enseigné, mais **l'étiquette lue porte
sur autre chose que ce que la leçon enseigne**.

À la décharge du fichier : il **déclare** la portée de `(ปาก)` en trois endroits
et la porte lui-même en tête de sa liste de contre-audit. Il a vu le fait ; il
n'en a pas tiré la conséquence sur son propre champ `registre`.

**Correction attendue** : soit requalifier le champ (`registre` de relation, pas
de registre) et récrire la clé 3 de l'exercice 2 en conséquence, soit produire
une première jambe qui étiquette le sens (๑), soit retirer แก du lot des huit.

### Finding 2 : `DOM-RID-SIX`, BLOQUANT

**Le décompte des lignes VOLUBILIS dérivées du RID est faux, et c'est le critère
qui a servi à retirer deux formes.**

Le dossier écrit : « **Six des lignes citées ici portent `RID`** : ไอ้ 522,
อี 17035 à 17037, เว้ย 110710 et 110711, โว้ย 110738. » Deux erreurs
indépendantes, l'une et l'autre vérifiées par redump de l'exemplaire.

1. **L'énumération se compte elle-même à sept**, pas à six : 522 + (17035, 17036, 17037) + (110710, 110711) + 110738 = 7.
2. **Au moins cinq lignes citées de plus portent `RID` en colonne K** et ne sont
   pas déclarées :
   - **46601** (กู) `K=RID`
   - **55151** (มึง) `K=RID`
   - **20933** (แก, l'oiseau) `K=FAUNA ; ORNITHO ; RID ; SPECIES ; (THA)`
   - **20934** (แก, le pronom enseigné) `K=GRAMMA ; RID`
   - **53684** (มัน, le tubercule) `K=RID`

Le vrai décompte est donc **12 lignes citées sur `RID`**, pas six. Ce n'est pas
un détail comptable : c'est **exactement le motif** invoqué à la partie 4 pour
retirer เว้ย et โว้ย. Appliqué correctement, il atteint la ligne 20934, qui est
la jambe VOLUBILIS de แก (finding 1), et il affaiblit la ligne de กู et de มึง.

**Conséquence directe sur un écran d'apprenant** : la page 4 écrit de กู et มึง
« **Les trois concordent, ce qui est rare et ce qui vaut d'être dit.** » Deux des
trois ne sont pas indépendantes. Les deux formes survivent, en.wiktionary étant
une seconde jambe réelle, mais la phrase vendue à l'apprenant surestime
l'indépendance des sources.

### Finding 3 : `PAGE10-CRITERE-EOE`, BLOQUANT

**Le critère que la page 10 donne à l'apprenant est faux pour เออ.**

La page 10 est la charnière pédagogique du fichier : elle explique pourquoi ฉัน
et เธอ, déjà publiés comme `familier`, ne sont PAS dans le lot du jour. Elle
écrit : « Les huit formes du jour, elles, portent en plus une étiquette de
registre marquée, écrite par le dictionnaire normatif **ou par les deux autres
sources**. »

Vérifié sur pièce, forme par forme :

| Source        | เธอ (exclue)                                                                                     | เออ (incluse)                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| RID           | clause de relation seule : « มักใช้ในระหว่างเพื่อนผู้หญิงด้วยกัน หรือใช้กับผู้มีศักดิ์ตํ่ากว่า » | clause de relation seule : « มักเป็นคำที่ผู้ใหญ่ใช้กับผู้น้อย หรือระหว่างเพื่อนที่สนิทสนมกัน » |
| VOLUBILIS     | :                                                                                                | **colonne d'usage VIDE** (ligne 64568)                                                         |
| en.wiktionary | :                                                                                                | « (mostly vulgar) »                                                                            |

Les deux clauses RID sont **de la même forme grammaticale et de la même nature** :
une relation entre personnes. La page 10 déclare cette forme insuffisante pour
เธอ et suffisante pour เออ dans le même paragraphe.

Et le second membre de la disjonction ne sauve pas เออ : « les deux autres
sources » n'en marque **qu'une**, puisque l'item 8 du fichier écrit lui-même,
huit lignes plus bas, « **VOLUBILIS n'étiquette donc pas เออ**, et il ne compte
pas comme jambe de registre pour cet item ».

Le fichier se contredit donc à l'intérieur de lui-même, et la contradiction porte
sur la seule phrase qui justifie à l'apprenant qu'il ne doit pas dire เออ.

### Finding 4 : `NOTATION-PLACE-EOE`, BLOQUANT

**« เออ … » est une notation de place que le dictionnaire normatif ne porte pas.**

L'introduction des exercices promet : « Les seules combinaisons affichées sont
des **notations de place**, “ไอ้ …”, “อี …”, “… วะ” et “เออ …”, **qui reproduisent
ce que le dictionnaire normatif dit de la position de chaque mot**, et rien de
plus. »

Trois des quatre tiennent, vérifiées sur les corps rouverts :

- ไอ้ … : `คำประกอบหน้าชื่อผู้ชาย…` : position AVANT le nom, écrite. ✅
- อี … : `คำประกอบหน้าชื่อผู้หญิง…` : écrite. ✅
- … วะ : `คำบอกเสียงต่อท้ายประโยค…` : fin de phrase, écrite. ✅
- **เออ … : l'entrée n'écrit AUCUNE position.** Elle donne
  `อ. คำที่เปล่งออกมาเพื่อบอกรับหรืออนุญาต…`, c'est-à-dire une fonction
  (interjection d'accord) et une relation, **jamais un rang dans l'énoncé**. ❌

L'étiquette `อ.` signifie _interjection_, pas _initiale d'énoncé_. La quatrième
notation est donc **composée par le cours**, dans un fichier dont c'est
précisément la règle centrale de ne rien composer, et dont la page 12 promet à
l'apprenant : « jamais dans une phrase que le cours aurait fabriquée ».

**Charge portée** : l'option D de l'exercice 3, « ça sert à répondre, **en tête
de ce qu'on dit** », est la clé des tirages 11 et 12, soit 2 des 12 tirages, et
le tirage 12 affiche la notation fabriquée. La partie positionnelle de l'option D
n'est pas sourcée.

### Finding 5 : `PAIRE-KOU-MUENG`, BLOQUANT

**La page 4 attribue au dictionnaire normatif une mise en paire qu'il ne fait
pas.**

Page 4, deuxième phrase : « **Les deux dictionnaires que la leçon consulte les
signalent d'ailleurs l'un par l'autre.** »

Vérifié en rouvrant les deux entrées :

- RID « กู » : `ส. คำใช้แทนตัวผู้พูด ในปัจจุบันมักถือกันว่าไม่สุภาพ,
เป็นสรรพนามบุรุษที่ ๑.` : **มึง n'y figure pas.**
- RID « มึง » : `ส. คำใช้แทนผู้ที่เราพูดด้วย, มักถือกันว่าไม่สุภาพหรือหยาบคาย,
เป็นสรรพนามบุรุษที่ ๒.` : **กู n'y figure pas.**
- VOLUBILIS 46601 et 55151 : **aucune colonne de renvoi** (la colonne `O`, celle
  qui porte les renvois croisés : visible par exemple sur เว้ย 110710,
  `O=wōi (โว้ย)` : est absente des deux lignes).

**Une seule source sur trois** met les deux mots en paire : en.wiktionary, par sa
note d'usage. Et le fichier le SAIT : la ligne `sources` de l'item 1 écrit
« C'est cette note d'usage **qui autorise la page 4** à traiter กู et มึง comme
une paire », au singulier.

La phrase de la page 4 est donc démentie par la ligne de sources de son propre
item, et elle est fausse quelle que soit la lecture de « les deux dictionnaires ».

### Finding 6 : `KAEE-PLUS-JEUNE`, non bloquant

**La clé de l'exercice 2 rend `ผู้น้อย` par « plus jeune » alors que la même page
le rend correctement par « de rang inférieur ».**

`ผู้น้อย` désigne un subordonné, un cadet en rang, pas spécifiquement un cadet en
âge. Le fichier le sait et l'écrit bien deux fois :

- page 5, prose : « ou à quelqu'un **de rang inférieur** » ✅
- item 3, `registre` : « ou de **rang inférieur** » ✅

Mais les trois surfaces qui atteignent réellement l'apprenant écrivent autre
chose :

- page 5, spécimen : « แก · kaee · toi, entre proches ou vers quelqu'un **de plus
  jeune** »
- item 3, champ `fr` : « adressé à quelqu'un de proche ou **de plus jeune** »
- exercice 2, **clé 3** : « tu, toi, adressé à quelqu'un de proche ou **de plus
  jeune** »

L'exercice 2 déclare mesurer « ce que chacune des huit formes dit du rapport
entre les personnes, **tel que le dictionnaire normatif l'écrit** ». Sa clé ne
dit pas ce que le dictionnaire écrit. en.wiktionary ajoute d'ailleurs une
dimension absente des deux : « a person of **equal or lower** status ».

### Finding 7 : `ARBITRAGE8-SIX`, non bloquant

**L'arbitrage 8 se trompe d'un cran, et c'est un arbitrage porté à la politique.**

Il écrit : « **Six des huit items de 13D n'en portent aucune** [étiquette entre
parenthèses] ». L'auditeur a relu les huit corps : **une seule** entrée porte une
étiquette entre parenthèses, `(ปาก)` sur « แก ๒ » sens (๒) : et encore, sur le
sens que la leçon n'enseigne pas. Les sept autres n'en portent aucune.

Le compte exact est donc **sept sur huit**, ou **huit sur huit** si l'on tient
compte du fait que la seule étiquette parenthésée du lot ne couvre pas la valeur
enseignée. L'argument de l'arbitrage est juste et se trouve même **renforcé** par
le chiffre correct ; c'est le chiffre qui est faux, et il part vers
`sources-verification.md`.

### Finding 8 : `ATTRIB-KHA-2E`, non bloquant

**Divergence d'attribution silencieuse sur คะ, non détectable par
`item-fields-check.mjs`.**

13D écrit page 7 « c'est la syllabe de คะ **apprise en 2E** » et page 11 « … คะ
…, 1E et 2E ». Or `u02-l2e` intitule son propre item 1 :
« **คะ (réemploi, enseigné en 2B)** ».

Les champs concordent parfaitement (`khá`, `poli`) : c'est pourquoi le contrôle
mécanique ne voit rien, et pourquoi le « zéro vide » déclaré par 13D ne couvre
pas ce cas. Mais la leçon d'origine réelle diverge. À trancher : soit 2E est la
première publication autonome de คะ (défendable, 2B ne l'isole pas comme item),
soit l'attribution suit le titre de 2E. Les deux fichiers ne peuvent pas dire
deux choses.

### Finding 9 : `FR-ALLONGEMENT`, non bloquant

**Affirmation sur le français non conforme à la section 1 bis.**

Item 5, `note_fr` : « **Un francophone a tendance à allonger la dernière syllabe
d'une phrase** ; ici il ne faut pas. »

C'est une affirmation empirique sur la prosodie du français. La section 1 bis de
`sources-verification.md` n'en admet que deux formes : sourcée par deux sources
indépendantes, ou **reformulée en observation vérifiable par l'apprenant**. Elle
n'est ni l'une ni l'autre : aucune source n'est citée, et le contrôle proposé
juste après (« dites khá puis wá … et vérifiez qu'ils durent le même temps »)
compare **deux syllabes thaïes** et ne teste donc pas la tendance française
affirmée.

Le fait sous-jacent est probablement vrai et l'énoncé est prudemment hedgé, mais
le fichier applique par ailleurs la section 1 bis avec rigueur (les six autres
`note_fr` reformulent toutes en contrôle personnel). C'est le seul écart.

---

## Partie C : ce que l'audit a cherché et n'a PAS trouvé

Consigné pour que le contre-audit suivant ne le refasse pas à vide.

- **Priorité 2, frontière reconnaissance / production : RIEN.** Les quatre
  exercices, les trois cartes SRS, les douze pages et la Méta ont été relus une
  par une. La seule mécanique de production, l'exercice 4, ne fait écrire que
  `phǒm`, `dì·chǎn`, `khoun`, `khǎo`, `khráp`, `khá`, dont les registres
  d'origine sont `poli` ou `neutre`, relus dans leurs fichiers. ฉัน et เธอ, les
  deux réemplois `familier`, ne servent que de distracteurs à l'exercice 1.
  L'enregistrement et la comparaison A/B sont désactivés et la Méta l'inscrit.
- **Aucun exercice réussissable par une réponse constante** : les quatre
  planchers ont été recalculés à la main et tombent tous très en dessous du
  seuil.
- **Aucune promesse de parler comme un natif**, et la page 12 la refuse
  explicitement.
- **Unicode** : aucun signe combinant isolé, aucune graphie hors NFC, aucun
  caractère de zone à usage privé, les huit `codepoints` exacts.
- **Les deux pièges VOLUBILIS de la partie 3 sont réels et correctement
  écartés** : la mention de registre porte bien sur la glose (anglaise pour ไอ้,
  française pour เออ) et non sur le mot thaï. Le point 2 de la liste de
  contre-audit est satisfait.
- **Le retrait de เว้ย et โว้ย est fondé** : les deux graphies rendent bien HTTP
  404 sur en.wiktionary et leurs trois lignes VOLUBILIS portent bien `RID`. Le
  point 3 de la liste de contre-audit est satisfait, contre la leçon.
- **Les planchers reproduisent le script tirage par tirage.** Le point 5 de la
  liste de contre-audit est satisfait.
- **Aucune collision d'attribution dans l'unité 13 ne concerne 13D**, vérifiée
  sur l'état réel du dossier.

## Partie D : à porter au contre-audit suivant

1. Les findings 1, 2 et 3 sont **le même défaut vu de trois côtés** : le fichier
   qualifie ses jambes de source avec plus de générosité qu'il ne s'en accorde à
   lui-même quand il écarte une forme. Les corriger ensemble, pas séparément.
2. Le finding 4 est le seul endroit du fichier où quelque chose est **fabriqué**.
   Il vaut la peine d'être corrigé avant tout le reste, parce que c'est la
   promesse centrale de la leçon.
3. La question ouverte du finding 1 : que faire d'un mot dont l'étiquette porte
   sur un autre sens que celui enseigné : n'est pas propre à 13D. Elle mérite une
   règle dans `sources-verification.md`, à côté du piège จ้า, qu'elle prolonge.

- **Revue native : EN ATTENTE.** Rien dans cet audit ne la remplace. Quatre des
  neuf findings portent sur des jugements sociaux dont aucune chaîne de
  dictionnaires ne peut établir la force réelle.
