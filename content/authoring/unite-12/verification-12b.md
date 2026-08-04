# Contre-audit adversarial de `lecon-12b.md`

- Fichier audité : `content/authoring/unite-12/lecon-12b.md`
  (101 679 octets, sha256 `538bdc36dc1b8153d59b3ee5bdcb73154601f58f673bfa8d6b6e9c0370a1fdb0`)
- Date : 2026-08-04
- Passe : contre-audit interne, une passe, consigne adversariale
- Référentiels lus avant l'audit : `content/authoring/CONVENTIONS.md`,
  `docs/content-policy/sources-verification.md` sections 1 bis et 1 ter
- Méthode : aucun chiffre du dossier n'est repris sur parole. Chaque décompte
  a été réexécuté ; les sept heuristiques de plancher et les probabilités
  binomiales ont été recalculées de zéro à partir des tables de tirages telles
  qu'elles sont écrites dans le fichier.

## Verdict

**44 faits vérifiés et confirmés par l'auditeur. 12 findings, dont 3 bloquants.**

La priorité 1 de l'unité, l'absence de promesse non mesurée, **tient** : le
balayage des seize motifs de niveau a été refait indépendamment et les vingt
comptes publiés sont exacts au motif près ; aucune occurrence n'affirme un
niveau, une durée, une équivalence ou une capacité future. Les trois findings
bloquants ne portent pas sur une promesse de niveau, mais sur **trois
affirmations fausses** : une phrase périmée que le fichier lui-même déclare
avoir remplacée, un absolu faux sur un écran d'apprenant, et un contrat
d'exercice que cinq tirages sur dix-huit ne remplissent pas.

## Partie A. Ce que l'auditeur a confirmé lui-même

Rien ci-dessous n'est repris du dossier : tout a été réexécuté.

### A.1 Décomptes de corpus

| Fait vérifié                                 | Résultat                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repo-thai-scan.mjs --check-u07`             | passe, dix chiffres sur dix                                                                                                                                                                       |
| `repo-thai-scan.mjs 1 11`                    | 55 fichiers, 512 entrées, 353 graphies, 114 ไม้เอก, 90 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา : identique au dossier                                                                                         |
| `repo-thai-scan.mjs 12 12`                   | 5 fichiers, 13 entrées, 13 graphies : identique au dossier                                                                                                                                        |
| Dépouillement des 13 items de `lecon-12c.md` | **13 redéclarations, 0 graphie neuve, 13 transcriptions identiques à l'origine.** Confirmé graphie par graphie                                                                                    |
| Croisement corpus 1 à 11                     | **104 graphies déclarées par deux fichiers ou plus, une seule à transcription divergente, สวัสดี** (`sawàtdii` en `u01-l1e` contre `sà·wàt·dii` en `u03-l3e` et `u04-l4e`) : identique au dossier |
| `srs-` distincts, unités 1 à 11              | **275** (271 définitions) : voir finding F5                                                                                                                                                       |

### A.2 Le matériel de la leçon

| Fait vérifié                                          | Résultat                                                                                                                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre d'items publiés par 12B                        | **0**. `unicode-thai.mjs` rend 0 champ `thai`                                                                                                                               |
| Tableau partie 2 / tableau Unicode                    | **61 lignes chacun, ensembles strictement identiques**, aucune graphie d'un seul côté                                                                                       |
| Séquences `U+` recalculées depuis la graphie          | **0 écart sur 61**                                                                                                                                                          |
| Stabilité NFC                                         | **61 sur 61 stables**                                                                                                                                                       |
| Références `uXX-lYz` du tableau                       | **61 sur 61 exactes**, fichier ET numéro d'item vérifiés (y compris la numérotation `1.2`, `1.5`, `2.1`, `2.5` de `u03-l3b`)                                                |
| Transcriptions citées contre le champ publié          | **0 divergence sur 61**                                                                                                                                                     |
| Graphies déclarées par deux fichiers ou plus          | **24 sur 61**, identique au dossier                                                                                                                                         |
| Variantes d'écriture du champ `ton` parmi les 61      | **2** : ไหม et ครับ, identique au dossier                                                                                                                                   |
| Variantes d'écriture du champ `longueur` parmi les 61 | **4** : ไหม, เขา, ไข่, ห้อง, identique au dossier                                                                                                                           |
| Balayage des écrans                                   | **795 lignes**, **78 chaînes thaïes distinctes**, soit 61 + 17 ; les 17 sont exactement celles que le dossier énumère                                                       |
| ได้ seul                                              | **publié par aucun item du dépôt** : confirmé                                                                                                                               |
| ได้ไหม                                                | `u11-l11a` item 5, transcription `dâai mǎi` : confirmé                                                                                                                      |
| `unicode-thai.mjs` sur le fichier                     | 102 chaînes, toutes NFC, aucune zone à usage privé, et les huit comptes de signes exacts (U+0E31 9, U+0E34 4, U+0E35 9, U+0E38 6, U+0E39 8, U+0E3A 8, U+0E48 12, U+0E49 25) |
| Profondeur d'empilement                               | **2, atteinte par ปี่ et นี้ seules**, sur les 61 : confirmé                                                                                                                |
| `item-fields-check.mjs` sur 12B                       | `0 / 0 / 0`, zéro vide, correctement déclaré comme tel par le dossier                                                                                                       |
| Tirets cadratins ou demi-cadratins                    | **aucun dans tout le fichier**                                                                                                                                              |
| Transcription v1.1                                    | conforme : aucune des 61 transcriptions n'emploie `é`, `è`, `eu` ni `oû` ; le ton porte sur la première lettre du noyau partout                                             |

### A.3 Les planchers d'exercice, recalculés de zéro

Les sept heuristiques de l'exercice 1 ont été reconstruites à partir de la
table des dix-huit tirages, puis évaluées en loi de Poisson-binomiale (les
probabilités par tirage ne sont pas constantes, un binomial simple aurait été
faux). **Les sept espérances et les cinq probabilités publiées sont exactes.**

| Stratégie                   | Espérance recalculée                                   | P(atteindre le seuil) recalculée | Publié           |
| --------------------------- | ------------------------------------------------------ | -------------------------------- | ---------------- |
| Réponse constante par carte | 1 sur 18 (18 bonnes réponses = 18 graphies distinctes) | :                                | 1 sur 18 ✓       |
| Position constante          | 6,0000                                                 | 0,014490 %                       | 6, 0,0145 % ✓    |
| Carte la plus longue        | 4,8333                                                 | 0,000000 %                       | 4,83, 0,00 % ✓   |
| Carte la plus courte        | 6,8333 (11 tranchés, 4 justes : 3, 6, 13, 15)          | 0,000000 %                       | 6,83, 0,00 % ✓   |
| Carte avec marque de ton    | 3,8333 (6 tranchés, 6 faux)                            | :                                | 3,83 ✓           |
| Carte sans marque de ton    | 7,3333 (5 tranchés, 2 justes : 6, 17)                  | 0,015003 %                       | 7,33, 0,0150 % ✓ |
| Carte commençant par ห      | 6,1667 (1 tranché, faux)                               | 0,011949 %                       | 6,17, 0,0119 % ✓ |

Exercice 2 : réponse constante **2 sur 8** confirmée (A et B servent deux fois
chacune) ; `(1/6)^8` = 5,954 × 10⁻⁵ % ✓ ; 6,25 % ✓ ; 31,25 % pour 7 sur 8 ✓ ;
0,3906 % sur deux sessions ✓.

Exercice 3 : réponse constante **5 sur 15 garanti** confirmée (structure en
cinq triplets où chaque option est correcte une fois) ; position constante
E = 5, P(X ≥ 12) = 0,028511 % ✓ (publié 0,0285 %).

Exercice 4 : les dix réponses sont **dix chaînes distinctes**, une réponse
constante vaut au mieux 1 sur 10 ✓.

**Aucun des quatre exercices n'est réussissable par une réponse constante.**

### A.4 Les affirmations de niveau, priorité 1

Le balayage des seize motifs et des quatre motifs de phonétique française a été
**refait indépendamment** sur les 795 lignes d'écrans. **Les vingt comptes
publiés sont exacts** : `une bouche française` 0, `un francophone` 1,
`l'oreille française` 0, `francophone` 3, `A1` 1, `A2` 1, `B1` 0, `CECR` 0,
`Cadre européen` 2, `niveau` 4, `heures` 2, `mois` 1, `équivalent` 0,
`équivalence` 2, `diplôme` 1, `examen` 2, `vous serez` 0, `vous saurez` 1,
`bilingue` 0, `couramment` 0.

Relecture de chaque occurrence par son numéro de ligne : **toutes sont des
négations ou des désaveux.** Aucune n'attribue un niveau, une durée, une
équivalence ou une capacité future. Un balayage complémentaire de l'auditeur
sur `vous pourrez`, `vous parlerez`, `vous comprendrez`, `capable`,
`garanti`, `rapidement`, `facilement`, `certificat`, `maîtris`, `atteint`,
`acquis`, `suffira`, `assez pour` n'a rien trouvé d'affirmatif : la seule
occurrence de `capable` est « ce qui n'est pas la même chose que de dire que
vous n'en êtes pas capable », les deux de `acquis` sont « il ne déclare aucun
de ces points acquis » et le rappel du fil des tons.

**La contrainte propre à l'unité 12 est tenue.** C'est le point le plus
important de cet audit et il est confirmé.

### A.5 Capacités et rattachement, priorité 2

| Point annoncé page 1    | Leçon citée                                             | Vérification                                                                                                           |
| ----------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ton moyen contre bas    | `u01-l1c` « Mi contre bas », `u07-l7a`                  | titre exact ; `u07-l7a` porte bien le sur-entraînement mi contre bas                                                   |
| ton montant contre haut | `u01-l1d` « Montant contre haut », `u04-l4a`            | titre exact ; `u04-l4a` porte bien un « bloc de sur-entraînement : le contraste ton montant contre ton haut »          |
| longueur de la voyelle  | `u01-l1b` « Longues et courtes »                        | titre exact ; quatre paires à ton constant, la cinquième ดุ/ดู étant signalée à tons différents par la leçon elle-même |
| souffle                 | `u02-l2a`, `u03-l3a`, `u04-l4a`                         | titres exacts, cibles phonétiques concordantes                                                                         |
| `/h/` initial et ห muet | `u05-l5a` « Le h qu'on oublie et les finales retenues » | page 4 installe le `/h/`, **page 5 installe le ห muet**                                                                |
| finales retenues        | `u05-l5a`                                               | second volet de sa cible phonétique                                                                                    |

Le tableau des douze unités de
`docs/pedagogie/curriculum-fondamental-proposition.md` a été relu ligne à
ligne : les six désignations citées par la partie 1 du dossier sont exactes.
**Aucune capacité n'est annoncée sans leçon derrière elle.**

### A.6 Autres faits confirmés

- La seule paire minimale **montant contre haut** du dépôt dont aucun membre
  ne s'écrit avec un ห est bien **ขา / ค้า**. Les trois autres, หมา/ม้า,
  หนา/น้า et หนี/นี้, portent bien un ห. La réserve de l'exercice 2 est
  exacte.
- Les huit identifiants SRS existants cités existent tous et portent l'objet
  annoncé. `srs-u07-l7a-03` porte bien ปา/ป่า et ปี/ปี่ et n'a ni ปู/ปู่ ni
  ยา/หย่า ; `srs-u05-l5a-01` est bien écrite sur ห้า/อ้า et หก/อก, dont le
  second membre n'a pas de ห.
- La section SRS de `u01-l1b` est bien rédigée en prose, **sans aucun
  identifiant**.
- `u07-l7b` signale bien la brièveté de ห้อง malgré la graphie ออ.
- Vingt-deux des numéros de ligne VOLUBILIS cités par la partie 4 sont
  **recoupés par des citations indépendantes d'autres leçons** du dépôt
  (ปา 65411, ปู 79424, ปู่ 79427, ปี 75796, ปี่ 75797, หมา 50909, ม้า 50906,
  หนี 61955, นี้ 61954, ขา 28947, ค้า 28962, สอง 93932, น้อง 64026,
  ท้อง 102844, หมอ 56111, ห้อง 16174, หก 15998, ห้า 14524, มาก 53109,
  ผัด 69871, กิโล 40885, ขอบคุณ 36465). Le classeur n'étant pas versionné,
  l'auditeur n'a pas pu recomputer les lignes restantes : le point 5 du
  contre-audit demandé par le fichier reste entier.
- Le total de 51 tirages (18 + 8 + 15 + 10) est exact.

## Partie B. Findings

### F1 : BLOQUANT. La Méta garde une phrase que le fichier lui-même déclare fausse

Méta, ligne 87 :

> **Redéclarations : zéro, par construction.** Le croisement des graphies de
> l'unité 12 contre les 353 des unités 1 à 11 est vide, l'unité 12 n'en
> déclarant aucune.

Quinze lignes plus haut, le même bloc Méta écrit l'inverse et le souligne :

> **C'était vrai aux trois premières exécutions et c'est faux à la
> quatrième** : `lecon-12c.md` publie 13 items. […] **les 13 graphies sont
> TOUTES des redéclarations**

**Preuve.** `node scripts/verification/repo-thai-scan.mjs 12 12` rend 5
fichiers et 13 entrées. Le dépouillement des 13 items de `lecon-12c.md`,
refait par l'auditeur, confirme que **les 13 sont des graphies des unités 1 à
11** (มา, ขา, ป่า, พ่อ, สี่, ห้า, กิน, สอง, บ้าน, น้อง, แล้ว, เพลง, เปลี่ยน).
Le croisement n'est donc **pas vide : il contient 13 graphies**.

Le fichier consacre un paragraphe entier, un point de sa liste « ce que ces
contrôles ont trouvé » et son arbitrage 7 à ce défaut précis, et **il subsiste
malgré tout dans la Méta**. C'est la seule contradiction interne franche du
fichier ; elle est bloquante parce qu'elle est exactement le défaut que le
dossier revendique d'avoir corrigé.

**Correction attendue** : réécrire la phrase pour dire ce que le dépouillement
établit, soit « l'unité 12 déclare 13 graphies, toutes redéclarées, aucune
neuve ; 12B n'en déclare aucune ».

### F2 : BLOQUANT. Un absolu faux sur un écran d'apprenant, contredit par la page précédente

Page 3, écran apprenant :

> ขา et ค้า sont **la seule paire du parcours** où les deux mots se disent
> exactement pareil sauf le ton et où aucun des deux ne s'écrit avec un ห.

**Preuve.** Balayage de toutes les graphies monosyllabiques publiées par les
unités 1 à 11, appariées sur leur transcription privée du diacritique de ton :
**au moins vingt paires** répondent à l'énoncé, dont **ปา / ป่า, ปู / ปู่ et
ปี / ปี่** : les trois paires que **la page 2 du même fichier vient
d'afficher**, sous le titre « Deux syllabes identiques, deux hauteurs ». S'y
ajoutent คา/ข่า, คา/ค่า, คา/ค้า, คา/ขา, ข่า/ค่า, ข่า/ค้า, ข่า/ขา, ค่า/ค้า,
ค่า/ขา, เข้า/เขา, ข้าว/ขาว, ม้า/มา, ค่ะ/คะ, พา/ผ่า, พอ/พ่อ, ตัว/ตั๋ว,
ทาน/ถ่าน.

L'affirmation n'est vraie que restreinte au contraste **montant contre haut**,
et cette restriction est exacte : l'auditeur l'a vérifiée séparément et n'a
trouvé que ขา / ค้า. La réserve de l'exercice 2 porte d'ailleurs le
qualificatif (« paire montant contre haut dont aucun membre ne s'écrive avec
un ห ») ; **la page 3 l'a perdu**. Un apprenant qui vient de voir trois
contre-exemples à la page précédente lit une phrase fausse.

**Correction attendue** : ajouter le qualificatif, « la seule paire du
parcours qui oppose le montant au haut et dont aucun des deux mots ne s'écrit
avec un ห ».

### F3 : BLOQUANT. Cinq tirages sur dix-huit ne remplissent pas le contrat annoncé de l'exercice 1

L'exercice 1 déclare mesurer :

> la reconnaissance d'un mot connu […] parmi trois graphies dont **au moins
> une ne s'en distingue que par le point révisé**

et la page 8 en tire la capacité annoncée à l'apprenant : « reconnaître un mot
thaï entendu une fois, **parmi trois mots proches** ».

**Preuve.** Contrôle des dix-huit tirages contre leur point assigné :

| Tirage | Point              | Distracteurs                                      | Le contrat est-il rempli ?                                          |
| ------ | ------------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| 6      | ton montant / haut | ท้อง `tháwwng`, น้อง `náwwng` contre สอง `sǎwwng` | **NON** : les deux distracteurs changent aussi la consonne initiale |
| 14     | le ห               | หมอ `mǎww`, หา `hǎa` contre หมู `mǒuu`            | **NON** : les deux changent aussi la voyelle                        |
| 15     | le ห               | หยุด `yòut`, ใหญ่ `yài` contre หก `hòk`           | **NON** : aucun trait commun avec la cible                          |
| 17     | finales            | ช้อน `cháwwn`, ช้า `cháa` contre ชอบ `châwwp`     | **NON** : ช้อน change aussi le ton                                  |
| 18     | finales            | ทา `thaa`, ถัด `thàt` contre ถูก `thòuuk`         | **NON** : ถัด change aussi la voyelle                               |

Conséquence mesurable : le point 5 (le ห) et le point 6 (les finales) n'ont
**chacun qu'UN tirage sur trois** qui isole réellement le point, le 13 et le 16. Les tirages 15 et 17 se gagnent sans percevoir le point du tout, l'un par
la silhouette syllabique, l'autre par le ton.

Le dossier a calculé sept heuristiques d'aspect avec un soin remarquable et
n'a pas calculé celle-là, qui est la seule qui compte pédagogiquement.
Bloquant parce que la page 8 vend à l'apprenant une capacité que cinq tirages
sur dix-huit ne mesurent pas.

**Correction attendue** : soit remplacer les distracteurs des tirages 6, 14,
15, 17 et 18 par des mots qui isolent le point, soit retirer la phrase « dont
au moins une ne s'en distingue que par le point révisé » et corriger « parmi
trois mots proches » à la page 8.

### F4 : La ligne d'audit qui certifie la contrainte n° 1 de l'unité porte un compte faux

`### État des audits`, dernière ligne certifiante :

> | Affirmations de niveau | **balayage exécuté sur seize motifs**, **six
> occurrences non nulles**, toutes relues et toutes négatives |

Le corps du balayage écrit, lui :

> **Les quinze occurrences non nulles ont ensuite été relues une à une**

**Preuve.** Les deux chiffres se contredisent, et **aucun des deux n'est le
bon**. Somme des comptes que le fichier publie lui-même pour le second jeu :
1 + 1 + 0 + 0 + 2 + 4 + 2 + 1 + 0 + 2 + 1 + 2 + 0 + 1 + 0 + 0 = **17
occurrences**, réparties sur **10 motifs non nuls** ; en ajoutant le premier
jeu, 12 motifs non nuls. Ni 6 ni 15.

La substance tient : l'auditeur a relu chaque occurrence et toutes sont bien
des négations, voir A.4 : mais **la ligne d'état qui garantit la contrainte la
plus stricte de l'unité 12 contient un décompte non exécuté**, dans un dossier
dont la thèse est qu'un chiffre non exécuté produit toujours le résultat que
l'auteur espère.

### F5 : « 247 identifiants de cartes du dépôt » : le vrai nombre est 275

Section SRS :

> Le relevé est au dossier : sur les **247 identifiants de cartes du dépôt**,
> aucun ne mesure la longueur vocalique à l'oreille

**Preuve.** Décompte des identifiants `srs-uXX-lYz-NN` distincts :
**275** pour les unités 1 à 11 (271 si l'on ne compte que les lignes de
définition), **286** en incluant l'unité 12. Aucune lecture ne donne 247. Le
nombre 247 est celui des **graphies distinctes des unités 1 à 7**, publié par
`u08-l8a` : c'est une confusion de relevé.

La conclusion substantielle, elle, **tient** : l'auditeur a balayé toutes les
sections SRS des unités 1 à 11 et **aucune carte identifiée ne mesure la
longueur vocalique à l'oreille**. La section SRS de `u01-l1b` la met bien en
révision (« Discrimination audio : entendre un mot, répondre courte ou
longue ») mais sans identifiant, ce que le dossier dit exactement.
`srs-u12-l12b-01` est donc justifiée ; seul son argument chiffré est faux.

### F6 : Le parcours a bien donné un repère prédictif du ห muet, contrairement à ce que la leçon affirme trois fois

Le fichier écrit, à l'incertitude 1 :

> il ne pourra pas la prédire sur un mot neuf

et, à la carte `srs-u12-l12b-02` :

> elle mesure le FAIT, jamais la règle qui l'explique, **que le parcours n'a
> pas ouverte**

**Preuve.** `u05-l5a`, page 5, intitulée « Le ห qui, lui, ne se prononce
pas » :

> Le repère est le contact : le ห se tait quand une des lettres ง, น, ม, ย, ว
> ou ร est collée juste derrière lui, sans le moindre signe posé sur le ห.

C'est un repère **prédictif et applicable à un mot neuf**. Ce que `u05-l5a`
laisse fermé est « le rôle du ห de tête **sur le ton** », ce que la Méta de
12B cite d'ailleurs correctement ; la page 6 et l'incertitude 1 laissent
tomber « sur le ton » et transforment une réserve étroite en absence totale.

**Conséquence mesurable, et c'est le vrai coût.** `srs-u12-l12b-02` demande,
sur 8 mots écrits avec un ห, de dire si le souffle s'entend, avec un critère
de **7 sur 8**. Sur les seize mots que 12B propose, **quinze sont tranchés par
le repère de `u05-l5a` sans écouter** : les huit à ห prononcé (ห้า, หิว, หัด,
ห้อง, ห้าม portent un signe sur le ห ; หก, หา, หาด n'ont pas de lettre de la
liste derrière) et sept des huit à ห muet (หมา, หมอ, หมู, หนา, หนี, ไหม,
หยุด). Seul **ใหญ่ échappe au repère**, son ญ ne figurant pas dans la liste.
La carte est donc gagnable **15 sur 16 à l'œil**, soit exactement son critère,
et son unique clause d'exclusion garde contre le mauvais raccourci.

La page 6 aggrave le point en enseignant « Regardez les transcriptions plutôt
que les graphies », qui invite l'apprenant à ignorer un repère que le parcours
lui a réellement donné.

**Correction attendue** : citer le repère de `u05-l5a` au lieu de le nier, et
donner à `srs-u12-l12b-02` une exclusion de tirage qui neutralise le raccourci
(masquer la graphie, ou n'employer que des mots hors du domaine du repère).

### F7 : L'exercice 2 affiche du thaï alors que la Méta jure qu'il n'en affiche aucun

Méta :

> **exercice 2 : aucun thaï n'est affiché du tout**, ni avant ni pendant. Les
> huit paires ne sont que du son, et **les six étiquettes sont en français**.

**Preuve.** L'étiquette E de l'exercice 2 est :

> Étiquette E : « **le ห** : on l'entend dans un mot, pas dans l'autre ».

Elle porte la lettre thaïe ห (U+0E2B), qui apparaît d'ailleurs à ce titre dans
le balayage des 78 chaînes thaïes des écrans. Le plancher de 6,25 % n'est pas
atteint par ce défaut, l'étiquette ne désignant aucune paire ; mais l'état
`audio_seul` que le fichier demande de créer à l'arbitrage 3 est **défini par
une phrase que son propre exercice contredit**, ce qui compromet la définition
avant même l'arbitrage.

### F8 : Compte faux dans les pièges de l'exercice 3

> Pièges connus : répondre d'après la première lettre seule, **qui est commune
> aux trois mots de quatre triplets sur cinq**

**Preuve.** Triplet 1 : ปี, ปี่, ป่า, initiale commune ป. Triplet 2 : หนี,
นี้, ม้า, initiales ห, น, ม, **pas commune**. Triplet 3 : เขา, ขาว, ข้าว,
consonne initiale commune ข, mais première lettre écrite เ, ข, ข. Triplet 4 :
ตา, ทา, ตัด, initiales ต, ท, ต, **pas commune**. Triplet 5 : ผัก, ผัด, ผ่า,
initiale commune ผ. Le compte est de **trois** triplets sur cinq au mieux, de
deux si l'on compte la première lettre réellement écrite. Jamais quatre.

### F9 : Un feedback d'écran affirme une ressemblance graphique fausse

> Feedback correct, triplet 3 : « Bien vu. **Ces trois mots commencent
> pareil** ; ce qui les sépare est la longueur et le ton, et ça se voit. »

Le triplet 3 est เขา, ขาว, ข้าว. **เขา ne commence pas comme les deux autres**
à l'écran : il commence par la voyelle pré-posée เ. La section Unicode du même
fichier le relève explicitement (« Les voyelles pré-posées sont nombreuses et
l'exercice 3 les affiche sans transcription : เ de เขา et เข้า »). Dans un
exercice de lecture sans transcription, où l'apprenant n'a que la forme, ce
feedback enseigne une observation contredite par ce qu'il a sous les yeux.

### F10 : Un piège de l'exercice 1 se contredit dans sa propre phrase

> au tirage 7, répondre ขาว parce que **le ว se voit**, alors que **rien ne se
> voit dans cet exercice**.

L'exercice 1 affiche « trois cartes en grand spécimen thaï », état `absent`,
c'est-à-dire **thaï visible, transcription et français masqués**. Le ว se voit
donc réellement, et la seconde moitié de la phrase est fausse. Le piège décrit
d'ailleurs un raisonnement qui n'a de sens que si la graphie est visible.

### F11 : Page 8 : une capacité formulée plus large que ce que l'exercice 4 mesure

> écrire en transcription un mot que **vous n'avez ni entendu ni vu**, avec son
> ton et sa longueur

**Preuve.** Les dix formes attendues par l'exercice 4 sont `pàa`, `paa`,
`mǎa`, `máa`, `khâao`, `khâo`, `phàk`, `phàt`, `hǎa`, `hâa`. **Les dix sont
affichées en transcription, avec leur graphie et leur spécimen audio, aux
pages 2 à 7 du même fichier**, quelques minutes avant. Ce qui est vrai, et que
la Méta écrit correctement, est « à partir du français seul », sans modèle au
moment de répondre. La formulation de la page 8 promet une restitution de
mémoire longue que rien ici ne mesure.

### F12 : Contradiction interne dans les demandes SRS

La section SRS demande, dans le même point :

> à `srs-u05-l5a-01` (le `/h/` initial à l'écoute) : les tirages 13, 14 et 15
> de l'exercice 1. […] Les tirages apportés ici sont d'une autre nature […]
> **C'est pour cela que 12B ouvre une carte séparée plutôt que d'élargir
> celle-ci**

Les trois tirages sont donc à la fois **demandés en apport** à
`srs-u05-l5a-01` et déclarés **inadaptés** à cette carte, motif retenu pour
ouvrir `srs-u12-l12b-02`. La consolidation ne peut pas exécuter les deux.

## Partie C. Ce que cet audit n'a pas pu vérifier

- **Les numéros de ligne VOLUBILIS non recoupés.** Le classeur
  `VOLUBILIS_Database.xlsx` n'est pas dans le dépôt et n'a pas été téléchargé.
  Vingt-deux des lignes citées sont corroborées par des citations
  indépendantes d'autres leçons ; les autres restent à recomputer, comme le
  demande le point 5 du contre-audit prévu par le fichier.
- **Les relevés en.wiktionary et RID.** Aucun appel réseau n'a été fait. Les
  IPA citées à la partie 4 sont cohérentes avec les champs `ipa` publiés par
  les leçons d'origine, ce qui est un contrôle de cohérence interne, pas une
  vérification de source.
- **La solidité du plancher de 6,25 % de l'exercice 2**, qui repose sur une
  hypothèse de comportement, non sur un calcul. Le fichier le signale
  lui-même. L'auditeur ajoute une réserve : les huit paires forment un jeu
  **fermé et petit**, et une seconde session se gagne par mémorisation de
  l'appariement, ce qu'aucun des quatre planchers ne modélise. La même réserve
  vaut pour `srs-u12-l12b-03`, qui puise ses six paires dans les huit mêmes.

## Partie D. Priorité du contre-audit externe

1. **F3**, la conformité des dix-huit tirages au contrat annoncé : c'est le
   seul finding qui touche ce que l'apprenant croit avoir prouvé.
2. **F6**, le repère du ห de `u05-l5a` et le plancher de
   `srs-u12-l12b-02`.
3. **F2**, l'absolu de la page 3, à corriger avant tout affichage.
4. Les lignes VOLUBILIS non recoupées.
