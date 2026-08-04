# Vérification adversariale de `u12-l12a` « Ce que vous savez faire »

- Fichier audité : `content/authoring/unite-12/lecon-12a.md` (1570 lignes,
  125 744 octets, sha256 `2aed8b3a20a7b1bb59ae2885a5e9063587b680ba570713ea0c0d6f44325fdfb6`)
- Date : 2026-08-04
- Consigne : audit ADVERSARIAL. Priorité 1, promesses non mesurées. Priorité 2,
  rattachement réel des capacités. Priorité 3, aucun mot nouveau.
- Statut rendu : **3 findings bloquants, 9 non bloquants, 21 faits confirmés.**
- Règle appliquée à moi-même : aucune correction n'est écrite ici sans avoir été
  exécutée. Les scripts de contrôle écrits pour cet audit sont versionnés dans
  `scripts/verification/tmp-12a-*.mjs` pour qu'un tiers refasse chaque chiffre.

## 1. Ce que j'ai confirmé moi-même (21 faits)

Chaque ligne a été exécutée pendant cet audit, pas relue dans le dossier de 12A.

| #   | Fait vérifié                                                 | Méthode                                                                                | Résultat                                                                                                                                           |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Convention de comptage valide                                | `repo-thai-scan.mjs --check-u07`                                                       | passe, 10 chiffres sur 10                                                                                                                          |
| 2   | Corpus de référence                                          | `repo-thai-scan.mjs 1 11`                                                              | 55 fichiers, 512 entrées, 353 graphies                                                                                                             |
| 3   | 12A ne publie aucun item                                     | `grep -c "^### Item"` = 0 ; `unicode-thai.mjs` → « champs `thai` : 0 »                 | confirmé                                                                                                                                           |
| 4   | Fidélité de réemploi des 83 lignes du tableau                | `tmp-12a-blocs.mjs`, comparaison `thai` + `transcription` à l'item cité                | **83 / 83, 0 écart**                                                                                                                               |
| 5   | Unicode fichier                                              | `unicode-thai.mjs`                                                                     | 181 sous-chaînes, toutes NFC, aucune zone à usage privé                                                                                            |
| 6   | Empilement                                                   | `unicode-stack-scan.mjs`                                                               | 181 sous-chaînes, profondeur max 2, 52 / 87 / 42                                                                                                   |
| 7   | Typographie                                                  | balayage U+2014, U+2013, U+0027                                                        | **0, 0, 0**                                                                                                                                        |
| 8   | Balayage des affirmations de niveau, sur les écrans          | `tmp-12a-ecrans.mjs`, insensible à la casse                                            | A1/A2/B1/B2/CECR/CEFR/bilingue/couramment/certifi/vous serez/vous saurez/test de niveau = **0** ; niveau 3, heures 3, équival 2, mois 2, garanti 1 |
| 9   | Les 11 occurrences restantes sont des négations              | relecture une par une                                                                  | confirmé, aucune n'affirme                                                                                                                         |
| 10  | Contrôles négatifs RID                                       | `rid-lookup.mjs ทำงาน ทุกวัน พี่ชาย ร้านขายยา`                                         | les 4 rendent `absent`                                                                                                                             |
| 11  | Attestations RID                                             | `rid-lookup.mjs` sur ห้องน้ำ ข้าวผัด เกินไป ที่ไหน เท่าไร ขอบคุณ เข้าใจ ราคา ชั้น ห้าม | les 10 rendent `entree`                                                                                                                            |
| 12  | Vedettes groupées                                            | `rid-lookup.mjs สวัสดี ตรง`                                                            | « สวัสดิ สวัสดิ์ สวัสดี » et « ตรง ตรงๆ », comme annoncé                                                                                           |
| 13  | Adresse Volubilis de l'en-tête morte                         | `curl -I`                                                                              | **HTTP 404** confirmé                                                                                                                              |
| 14  | Divergence unique du corpus                                  | croisement graphie → transcription, unités 1 à 11                                      | **une seule** : สวัสดี, `sawàtdii` (`u01-l1e`) contre `sà·wàt·dii` (`u03-l3e`, `u04-l4e`)                                                          |
| 15  | Portée de la méthode de lecture                              | `lecture-corpus.mjs 1 11`                                                              | 94 VIVANTE juste, **0 écart**, total 353                                                                                                           |
| 16  | Les 12 motifs d'absence de la partie 3                       | `repo-thai-scan.mjs 1 11 --grep`                                                       | 12 résultats sur 12 conformes (ร้อย = 1 dans `u03-l3b`, ใช่ = 2, les deux ไม่ใช่ dans `u08-l8d`)                                                   |
| 17  | 41 exercices `recall`                                        | `grep -c "Mécanique : \`recall\`"` unités 1 à 11                                       | **41**                                                                                                                                             |
| 18  | 13 politiques de saisie mentionnant la saisie thaïe          | grep + relecture                                                                       | **13**, toutes des négations                                                                                                                       |
| 19  | 275 identifiants SRS distincts (u1-11), 280 avec 12a/12d/12e | `grep -rhoE … \| sort -u \| wc -l`                                                     | **275** et **280**                                                                                                                                 |
| 20  | Fondement de l'arbitrage 2                                   | lecture de `u05-l5e` item 10, `u09-l9e` item 10, `u11-l11a` l. 1073, `u12-l12e` l. 224 | l'arbitrage est **fondé**, les quatre citations sont exactes                                                                                       |
| 21  | Espérances des 7 stratégies de plancher                      | `tmp-12a-planchers.mjs`                                                                | **les 7 se reproduisent au centième** (4,00 / 4,33 / 3,33 / 2,83 / 3,00 / 4,00 ; 0,31 et 1,71 ; 3,50)                                              |

Point supplémentaire, à porter au crédit du fichier : **aucun des cinq exercices
n'est réussissable par une réponse constante**, ce que j'ai recalculé sur les
cinq tables de tirages. C'est vrai, et c'est vrai pour les cinq.

## 2. Findings bloquants

### BLOC-1 (bloquant) — citation fabriquée d'une leçon sœur, et un arbitrage entier bâti dessus

12A écrit, à sa section SRS et à son arbitrage 10 :

> **Ce chiffre diverge de celui que publie `u12-l12e`**, qui écrit 271 sans
> donner sa méthode

et

> `u12-l12e` écrit « 271 cartes de révision qui portent un identifiant »

**La chaîne `271` n'apparaît pas une seule fois dans `lecon-12e.md`.**

```
$ grep -c "271" content/authoring/unite-12/lecon-12e.md
0
```

La phrase réelle de `u12-l12e`, ligne 232 : « Le parcours a produit **282 cartes
de révision** qui portent un identifiant ». Le fragment cité entre guillemets par
12A existe donc, mais **le nombre a été remplacé**. Sur ce faux écart, 12A a
écrit un paragraphe de sa section SRS et l'arbitrage 10 tout entier, qui demande
au projet de se doter d'une convention de comptage.

C'est le défaut que 12A nomme elle-même `BALAYAGE-INVENTE` et dont elle dit,
incertitude 8, qu'il « ne se remarque pas » quand il tombe sur la bonne
conclusion. Ici il ne tombe même pas sur la bonne conclusion : l'écart réel est
275 contre 282, pas 275 contre 271.

**Résolution attendue** : réexécuter le comptage, réécrire le paragraphe SRS et
l'arbitrage 10 sur la valeur réelle, ou les supprimer. Aucun passage à `review`
avant, puisque l'objet du fichier est de ne rien affirmer sans mesure.

### BLOC-2 (bloquant) — promesse de résultat en situation réelle, page 11

> C'est la capacité qui rend les huit autres utilisables hors de l'application :
> elle vous laisse rester dans la conversation quand vous n'avez pas tout
> attrapé.

Deux affirmations, aucune mesurée : que la capacité 9 rende les huit autres
utilisables **hors de l'application**, et qu'elle laisse l'apprenant **rester
dans la conversation**. Ce sont des résultats en situation, et le même fichier
écrit à son incertitude 1 :

> **Aucun ne mesure que la phrase sorte sous la pression d'un échange**, ce qui
> est pourtant la seule chose qui compte pour un bilan.

Le fichier promet donc à la page 11 exactement ce qu'il déclare ne pas mesurer à
son dossier. Le balayage par mots-clés ne pouvait pas l'attraper : la phrase ne
contient ni « niveau », ni « heures », ni « vous serez ».

**Résolution attendue** : réécrire en acte vérifiable, du genre « quand vous
n'avez pas compris, vous avez deux phrases à dire au lieu de vous taire », qui
est vrai et que la leçon mesure à l'exercice 2 et à l'auto-contrôle 9.

### BLOC-3 (bloquant) — superlatif invérifiable adressé à l'apprenant, page 5

> Le patron ขอ … หน่อย est celui qui vous rend le plus de services

« Le plus de services » n'est ni défini, ni compté, ni sourcé, nulle part dans le
fichier ni dans le dépôt. C'est une affirmation flatteuse invérifiable sur ce que
l'apprenant va gagner. La seconde moitié de la phrase, elle, est vérifiable et
vraie : « il sert à demander une chose depuis `u02-l2c`, et un acte depuis
`u08-l8d` ».

Même défaut, plus faible, page 7 : « แล้วคุณล่ะ est la brique qui transforme une
réponse en conversation ».

**Résolution attendue** : garder la partie mesurable, supprimer le superlatif, ou
le remplacer par un compte réel d'emplois du patron dans le parcours.

## 3. Findings non bloquants

### NB-1 — toutes les probabilités d'atteindre le seuil sont fausses, et trois sont impossibles

12A annonce ses planchers comme « comptes produits par script le 2026-08-04 » et
« calculés sur les tables de tirages telles qu'elles sont écrites ». J'ai
recalculé les sept stratégies par convolution exacte (Poisson-binomiale) sur les
tables telles qu'écrites : `scripts/verification/tmp-12a-planchers.mjs`.

**Les espérances se reproduisent toutes** (fait confirmé n° 21). **Les
probabilités d'atteindre le seuil, aucune sauf deux.**

| Stratégie                 | Annoncé  | Recalculé           | Écart      |
| ------------------------- | -------- | ------------------- | ---------- |
| Ex.1 position constante   | 0,39 %   | 0,3856 %            | conforme   |
| Ex.1 « finit par ครับ »   | 0,71 %   | **0,4715 %**        | faux       |
| Ex.1 « la plus longue »   | 0,09 %   | **0 %, exactement** | impossible |
| Ex.1 « la plus courte »   | 0,02 %   | **0 %, exactement** | impossible |
| Ex.1 « porte ไม่ »        | 0,04 %   | **0 %, exactement** | impossible |
| Ex.1 « porte นี้ »        | 0,39 %   | 0,3856 %            | conforme   |
| Ex.3 politique constante  | 0,0002 % | **0,000026 %**      | faux       |
| Ex.3 règles publiées      | 0,86 %   | **0,1415 %**        | faux       |
| Ex.5 réponse constante    | 0,038 %  | **0 %**             | impossible |
| Ex.5 heuristique de forme | 1,51 %   | **0,4639 %**        | faux       |

Les trois « impossibles » de l'exercice 1 le sont parce que la stratégie décide
de façon déterministe la plupart des tirages : « la plus longue » plafonne à 4
bonnes réponses sur 12, « la plus courte » à 4, « porte ไม่ » à 7. Aucune ne peut
atteindre 9, quelle que soit la chance. De même à l'exercice 5 : la répartition
étant strictement de 2 tirages par option, une réponse constante vaut
**exactement** 2 sur 8, sans aléa ; sa probabilité d'atteindre 7 est nulle, pas
0,038 %.

**Méthode réellement employée, reconstituée** : chaque chiffre annoncé est la
binomiale de paramètre `espérance / nombre de tirages`. Vérification, exercice 5 :
`P(Bin(8 ; 3,5/8) ≥ 7) = 1,5149 %`, soit le 1,51 % publié. Exercice 3 :
`P(Bin(6 ; 1,7083/6) ≥ 5) = 0,856 %`, soit le 0,86 % publié. Exercice 5, réponse
constante : `P(Bin(8 ; 1/4) ≥ 7) = 0,0381 %`, soit le 0,038 % publié, qui est en
réalité la probabilité d'un tirage entièrement au hasard. La formule ignore la
structure du tirage, c'est-à-dire précisément ce que le fichier promet d'avoir
mesuré.

Conséquence sur les priorités : « le plancher de l'exercice 5, à 1,51 %, le plus
proche du seuil du fichier » est le point n° 4 que 12A demande au contre-audit
externe d'attaquer. La valeur réelle est 0,46 %, et le plancher réellement le
plus proche du seuil reste celui de l'exercice 5, mais l'écart au seuil est trois
fois plus grand qu'annoncé.

La conclusion de fond survit : **aucune stratégie sans écoute ni lecture
n'atteint un seuil**, et les vraies valeurs sont toutes plus basses que les
valeurs publiées. C'est pourquoi le finding est non bloquant. Il reste que huit
chiffres présentés comme mesurés ne le sont pas.

### NB-2 — exercice 1 : deux affirmations fausses sur les cartes, répétées dans les pièges

12A écrit :

> Cinq, **« toujours la carte qui finit par ครับ » : AUCUN tirage strictement
> décidé**, parce qu'au moins deux cartes finissent par ครับ dans onze tirages
> sur douze

et reprend la même chose aux pièges connus : « onze tirages sur douze ont au
moins deux cartes finissant par ครับ ».

Compté sur la table de tirages telle qu'écrite :

- **10 tirages** ont au moins deux cartes en ครับ, pas onze ;
- le **tirage 11** (เลี้ยวซ้าย / เลี้ยวขวา / ตรงไป) n'en a **aucune** ;
- le **tirage 12** (ช่วยด้วย / ช่วยเรียกหมอครับ / ไม่เป็นไร) n'en a **qu'une**,
  ช่วยเรียกหมอครับ. La stratégie y est donc **strictement décidée**, et décidée
  faux, la bonne réponse étant ช่วยด้วย.

L'espérance publiée, 4,33 sur 12, est pourtant juste : elle a bien été calculée
en donnant 0 au tirage 12. Le texte contredit donc le calcul qu'il commente.

### NB-3 — page 12 : « 193 comptent plus d'une syllabe », le script en rend 191

La page 12 écrit, sur un écran d'apprenant :

> Pour les 259 autres elle ne dit rien : 193 comptent plus d'une syllabe, 38 sont
> des syllabes mortes […] et 28 sont explicitement hors de son domaine

Le relevé de `lecture-corpus.mjs 1 11`, que le dossier de 12A reproduit
correctement à sa partie 3, rend :

```
hors mesure : plusieurs syllabes             191
hors mesure : pas une graphie simple           1
non classé : forme de syllabe non reconnue     1
```

J'ai réexécuté le script : 191, 1 et 1. L'écran additionne les trois lignes dans
la première et publie 193. Les 38 et les 28 sont exacts (36 + 2, et 16 + 11 + 1).
La graphie non classée est ก็ (`u11-l11c`), qui n'est pas polysyllabique.

C'est deux unités d'écart, sur la page dont la phrase d'ouverture est « et la
part est comptée ».

### NB-4 — rattachement de capacité gonflé : trois leçons citées ne publient aucun des blocs affichés

Page 10, capacité 8 :

> Publié par `u03-l3b` pour les chiffres thaïs, et par `u10-l10a`, `u10-l10b`,
> `u10-l10c`, `u10-l10d` et `u10-l10e`.

et partie 2 : « `u03-l3b`, `u10-l10a` à `u10-l10e` | 6 blocs retrouvés », contrôle
déclaré « en ouvrant les fichiers ».

Les six blocs de la page 10 viennent de deux leçons seulement : ทางเข้า, ทางออก,
เปิด, ปิด, ห้ามเข้า de `u10-l10b`, et ข้าวผัดหมู de `u10-l10c` (chiffres de
`u03-l3b`). **`u10-l10a`, `u10-l10d` et `u10-l10e` n'en publient aucun.**

Le cas de `u10-l10e` est le plus net : `grep -c "^### Item" unite-10/lecon-10e.md`
rend **0**, et 12A l'écrit elle-même quinze lignes plus haut dans sa propre
section Items (« `u10-l10e`, bilan de son unité, ne publie elle non plus aucun
item »). Une leçon qui ne publie aucun item ne peut pas figurer dans une ligne
« Publié par ».

Même mécanique, plus discrète, sur cinq autres capacités : `u02-l2e` (capacité 1),
`u03-l3b` et `u03-l3d` (capacité 2), `u04-l4b` (capacité 3), `u05-l5d`
(capacité 4), `u08-l8a` et `u08-l8b` (capacité 6), `u09-l9a` (capacité 7) ne
publient aucun des blocs affichés sur leur page. Pour celles-là le rattachement
reste défendable, ces leçons publiant les briques des blocs (หา, เสื้อ, ปวด,
หมอ, ตลาด, อร่อย, คะ, les classificateurs) ; pour `u10-l10e` il ne l'est pas.

**La capacité 8 elle-même est réellement couverte**, par `u10-l10b`, `u10-l10c`
et `u03-l3b` : le finding porte sur la liste, pas sur la capacité. C'est ce qui
le rend non bloquant.

### NB-5 — l'inventaire de ce que la leçon affiche donne quatre nombres différents

| Endroit du fichier        | Ce qui est annoncé                                                   |
| ------------------------- | -------------------------------------------------------------------- |
| Titre de la section Items | « Les **64** blocs affichés »                                        |
| Corps de la même section  | « Le tableau porte **83** lignes de données »                        |
| Dossier de production     | « Elle affiche en revanche **84** blocs sur des écrans d'apprenant » |
| Vérification Unicode      | « les **94** graphies distinctes que 12A affiche »                   |

J'ai compté avec le tokeniseur des deux scripts que le fichier cite dans le même
paragraphe, celui qui rend 181 sur le fichier entier
(`scripts/verification/tmp-12a-perimetre.mjs`) :

```
Enseignement + Exercices + Auto-contrôle : 106 sous-chaînes distinctes
hors de ce périmètre                     :  75
total fichier                            : 181
```

La soustraction publiée, « 181 sous-chaînes, les **87** supplémentaires n'étant
jamais affichées », suppose 181 − 94. Elle mêle deux unités de comptage : le 181
vient du tokeniseur de `unicode-thai.mjs`, le 94 d'un décompte de blocs. Dans
l'unité du 181, le partage réel est 106 / 75. Le tableau de séquences NFC annonce
par ailleurs « les 32 graphies les plus longues » et « les 62 autres », soit 94,
donc l'erreur se propage.

Le titre « Les 64 blocs affichés » est en outre faux dans les deux sens : le
tableau porte 83 lignes, et une vingtaine d'entre elles (ค่ะ, คะ, ผม, ดิฉัน,
หิวมาก, เสื้อ, ราคา, ชั้น, ๐ ๑ ๒ …) ne sont affichées sur aucun écran.

### NB-6 — deux transcriptions incompatibles de la même rime, affichées à quatre pages d'écart

- Page 6 : **ห้องน้ำอยู่ที่ไหนครับ** · `hâwng·náam yòuu thîi·nǎi khráp`
- Page 9 : **ปวดท้อง** · `pòuat·tháwwng`

Les deux syllabes ont la même rime écrite, ◌อง. Les leçons d'origine les
déclarent pourtant différemment :

| Source                    | `ipa`            | `longueur`             | `transcription` |
| ------------------------- | ---------------- | ---------------------- | --------------- |
| `u05-l5c` item 5, ห้องน้ำ | /hɔŋ˥˩.naːm˦˥/   | « hâwng **brève** »    | `hâwng·náam`    |
| `u09-l9b` item 5, ปวดท้อง | /pua̯t̚˨˩.tʰɔːŋ˦˥/ | « tháwwng **longue** » | `pòuat·tháwwng` |

En convention v1.1, `aw` est la voyelle brève et `aww` la longue. Les deux
transcriptions appliquent donc correctement la règle **à des faits de longueur
contradictoires**. Le croisement de 12A ne pouvait pas le voir : il compare une
graphie à elle-même, et ห้อง et ท้อง sont deux graphies. La ligne
« Prononciation, ton, longueur » du tableau des audits conclut pourtant « aucun
fait neuf […] 0 écart ».

Je ne tranche pas laquelle des deux leçons a raison : il faudrait une source, et
12A n'en établit aucune. Ce qui est établi, c'est que le bilan du parcours
affiche les deux sans le dire.

### NB-7 — relevés d'unité périmés, et une conclusion devenue fausse

12A avait prévu que son relevé se périme, et il s'est périmé une troisième fois
depuis. État au 2026-08-04 après rédaction :

```
$ node scripts/verification/repo-thai-scan.mjs 12 12
fichiers : 5   entrées : 13   graphies distinctes : 13
$ node scripts/verification/repo-thai-scan.mjs 1 12
entrées : 525   graphies distinctes : 353
```

`lecon-12c.md` publie 13 items. Deux lignes du tableau des contrôles mécaniques
sont donc à refaire :

- « `repo-thai-scan.mjs 12 12` […] **0 entrée, 0 graphie** dans les quatre » :
  vrai pour 12A, 12B, 12D et 12E, faux pour l'unité, qui rend maintenant 13 et 13 ;
- « `repo-thai-scan.mjs 1 12` | **512 entrées et 353 graphies, chiffres
  INCHANGÉS** […] l'unité 12 entière n'ajoute rien au corpus » : **525** entrées.
  Seul le « 353 graphies » tient, et c'est lui qui porte la conclusion.

La promesse centrale de 12A, « cette leçon n'enseigne aucun mot », reste vraie et
mesurée : `grep -c "^### Item" lecon-12a.md` rend 0, et `unicode-thai.mjs` rend
« champs `thai` : 0 » sur ce fichier.

### NB-8 — la caractérisation de `u12-l12e` est fausse sur deux points de plus

Au delà du 271 (BLOC-1), 12A décrit deux fois sa leçon sœur de façon inexacte :

- « une page 1 […] qui liste **onze phrases** comme actes ». La page 1 de
  `u12-l12e` annonce « **Douze** actes » et porte douze lignes de bloc.
- « **Sept** des phrases de sa page 1 sont des blocs que 12A affiche aussi ».
  J'ai comparé les douze une par une : **onze** sont affichées par 12A. La seule
  qui ne l'est pas est ผมมีพี่ชายและน้องสาวครับ.

Le recouvrement, que 12A désigne comme « le problème le plus coûteux découvert
pendant la rédaction » et porte à son arbitrage 8, est donc **sous-évalué** par
sa propre mesure. `u12-l12e` a de son côté déjà mesuré et documenté la collision
(« 33 graphies communes entre 12A et 12E, dont onze phrases complètes ») et a
remplacé trois de ses tirages, dont un qui était mot pour mot le tirage 11 de
l'exercice 1 de 12A.

### NB-9 — le seuil de cinq secondes est présenté comme un critère, pas comme le repère que le dossier dit avoir écrit

Sur l'écran de l'auto-contrôle :

> **Le critère est toujours le même : la phrase sort en moins de cinq secondes,
> ou elle ne sort pas.**

L'incertitude 3 du dossier écrit :

> Le critère de cinq secondes de l'auto-contrôle n'est fondé sur rien de mesuré,
> et celui de trois secondes de la ligne 7 non plus. […] **Ils sont écrits comme
> des repères sur l'écran de la leçon.**

Ils ne le sont pas. Seule la ligne 7, les trois secondes, reçoit sa réserve sur
l'écran (« ce n'est pas une mesure d'urgence réelle […] c'est un choix
pédagogique déclaré »). Le seuil de cinq secondes, qui gouverne les neuf
vérifications, est donné sans réserve, en gras, sous le nom de « critère ».

L'écran dit par ailleurs, et c'est à porter au crédit du fichier, qu'un
auto-contrôle « n'est pas une mesure ». Ce qui manque est la réserve sur le
chiffre lui-même.

## 4. Observations mineures, sans finding

- **`[สองจาน]` n'est pas un bloc publié.** L'exercice 3, tirage 1, propose
  [ขอ] [ข้าวผัด] [สองจาน] [หน่อย] [ครับ]. Le parcours publie สอง et จาน
  séparément, et `u04-l4e` les propose comme deux tuiles distinctes. Le
  regroupement retire du tirage l'ordre nombre + classificateur, qui est
  justement ce que l'auto-contrôle 3 et les pièges de l'exercice 4 disent
  mesurer. Aucun mot nouveau, donc pas un finding de priorité 3.
- **« Aucune des six n'est reprise à l'identique d'un exercice antérieur, sauf la
  sixième »** est difficile à soutenir : la même phrase cible est déjà l'objet
  d'un exercice dans `u04-l4e` (tirage 1), `u09-l9b` l. 846 (tirage 3),
  `u10-l10b` l. 978 (tirage 2) et `u07-l7d` l. 896 (tirage 5). Les segmentations
  diffèrent, donc « à l'identique » se défend ; la phrase serait plus honnête en
  disant lesquelles reviennent.
- **ไม่เข้าใจครับ et เข้าใจนิดหน่อยครับ** sont affichés page 11, mais le tableau
  des 83 lignes documente les formes sans particule, ไม่เข้าใจ et
  เข้าใจนิดหน่อย. Les formes affichées sont légitimes : `u11-l11a` les affiche
  elle-même sur ses propres écrans avec exactement ces transcriptions (l. 154,
  155, 243, 288). Le tableau les documente simplement de façon incomplète.
- **๓๕๓** est affiché comme spécimen à la page 13, alors que la page 12 vient
  d'écrire « Vous ne comptez pas au-delà de cent ». Les chiffres se lisent un à
  un, donc le spécimen est décodable ; le nombre, lui, n'est pas prononçable avec
  ce que le parcours publie.
- **Décodabilité** : hors les deux formes ci-dessus et les signes isolés de la
  page 12 (ไ, ใ, เ◌า, ◌ำ, ◌์), toutes les graphies affichées apparaissent dans un
  champ `thai` des unités 1 à 11. Contrôle exécuté par
  `scripts/verification/tmp-12a-decod.mjs`.
- **Transcription v1.1** : aucune graphie vocalique de la v1.0 (`é`, `è`, `eu`,
  `oû`) n'apparaît dans une transcription. Les marques de ton tombent bien sur la
  première lettre du noyau (`khàwwp`, `pòeet`, `sǒuun`, `chûee`, `láeew`). La
  seule anomalie de longueur est celle de NB-6, et elle est héritée.
- **Volubilis** : le classeur `VOLUBILIS_Database.xlsx` n'est pas présent dans
  l'environnement de cet audit. Les 26 numéros de ligne cités par 12A n'ont donc
  **pas** pu être vérifiés. Ce n'est pas un reproche au fichier, c'est une limite
  du présent contrôle. L'adresse de téléchargement de l'en-tête est bien morte
  (404 confirmé) ; l'adresse de remplacement n'a pas répondu dans le délai imparti
  ici, ce qui ne prouve rien contre elle.

## 5. Ce que cet audit n'a pas couvert

- Les 26 lignes Volubilis (classeur absent, voir ci-dessus).
- Les 47 attestations RID : 10 vérifiées sur 47, plus les 4 contrôles négatifs.
  Le taux de succès est de 14 sur 14 sur l'échantillon.
- La naturalité, qui est héritée et déclarée non vérifiée par le fichier lui-même.
- La question de fond de l'incertitude 1, à savoir qu'un bilan de parcours ne
  mesure aucune capacité en situation. Elle n'est pas résoluble dans la leçon et
  12A a raison de la porter en tête de son lot de contre-audit externe.

## 6. Verdict

12A tient sa promesse la plus difficile : **elle n'enseigne aucun mot nouveau, et
c'est mécaniquement vérifié**, ses 83 réemplois sont fidèles au champ près, et
son balayage des affirmations de niveau se reproduit exactement, y compris le
détail des onze occurrences qui sont toutes des négations. Sur la priorité 1,
telle que le balayage par mots-clés la définit, le fichier est propre.

Il ne l'est pas sur ce que le balayage ne peut pas voir : **deux promesses de
résultat écrites en français ordinaire, pages 5 et 11**, échappent à tous les
motifs cherchés, et l'une d'elles contredit l'incertitude que le fichier ouvre
lui-même. Et il ne l'est pas sur sa méthode : **une citation fabriquée** d'une
leçon sœur, **huit probabilités calculées par une formule qui ignore la table de
tirages**, et **un décompte d'écran qui donne quatre nombres différents**.

Le fichier a prédit son propre défaut. Son incertitude 8 dit qu'« un relevé
inventé qui tombe sur la bonne conclusion ne se remarque pas », et sa priorité 9
de contre-audit demande de « vérifier qu'aucun autre chiffre du dossier n'a subi
le même sort, en les réexécutant tous plutôt qu'en les lisant ». C'est ce que
cet audit a fait. Le sort s'est reproduit sur au moins onze chiffres et une
citation.

**Aucun passage à `review` avant résolution de BLOC-1, BLOC-2 et BLOC-3.**
