# Contre-audit adversarial de `lecon-12d.md`

- Date : 2026-08-04
- Auditeur : agent adversarial indépendant, consigne « trouver des erreurs, pas
  confirmer ». Chaque proposition ci-dessous a été rejouée avant d'être écrite ;
  les pistes qui se sont révélées fausses sont consignées en fin de rapport
  plutôt que tues.
- Fichier audité : `content/authoring/unite-12/lecon-12d.md`, 1234 lignes.
- Priorités reçues : 1. promesses non mesurées ; 2. capacités annoncées sans
  leçon derrière ; 3. mots nouveaux. Puis décodabilité, transcription v1.1,
  tirets cadratins, exercices réussissables par réponse constante.

## 1. Ce que j'ai vérifié moi-même et qui tient (24 faits)

Ces points ont été recomputés, pas relus. Ils sont exacts.

1. **12D ne publie aucun item.** Balayage par fichier avec la convention
   d'entrée de `repo-thai-scan.mjs` : `lecon-12a` 0, `lecon-12b` 0, `lecon-12c`
   13, `lecon-12d` **0**, `lecon-12e` 0. L'affirmation de fond « aucun mot
   nouveau » est vraie pour ce fichier.
2. `node scripts/verification/item-fields-check.mjs
content/authoring/unite-12/lecon-12d.md` rend bien « fichiers contrôlés : 1,
   champs codepoints en faute : 0, écarts de réemploi à lire : 0 », code 0. La
   mise en garde du fichier (« sa sortie est un zéro VIDE, il ne prouve rien
   ici ») est exacte et honnête.
3. `repo-thai-scan.mjs --check-u07` : passe, dix chiffres sur dix.
4. `repo-thai-scan.mjs 1 11` rend exactement ce que le dossier écrit : 55
   fichiers, 512 entrées, 353 graphies distinctes, 114 ไม้เอก, 90 ไม้โท, 1
   ไม้ตรี, 2 ไม้จัตวา, 181 marquées, 89 U+0E4A et 140 U+0E4B en texte entier.
5. Les onze répliques distinctes sont **NFC-stables** : égales à leur propre
   NFC et invariantes par NFD puis NFC. Contrôle recalculé sur les chaînes du
   tableau de dialogue.
6. Les **onze séquences de points de code sont exactes**, y compris les
   décomptes annoncés : 34, 25, 25, 43, 53, 42, 48, 48, 47, 37, 40. Aucun écart,
   aucun signe oublié, les trois U+0020 de la réplique 4 compris.
7. Le tableau de la partie 2 contient exactement **50 lignes**.
8. Pour chacune des 50 lignes, le fichier cité en deuxième colonne contient la
   graphie et la transcription citée. Contrôle rejoué indépendamment.
9. Les cinq blocs qui ne matchent pas un champ `thai` au caractère près
   (กี่วันแล้วคะ, ไปหาหมอไหมคะ, ขอโทษครับ, พูดช้า ๆ ได้ไหมครับ,
   ร้านขายยาอยู่ที่ไหนครับ) sont bien des items publiés, dans des champs `thai`
   de forme double `X / Y` (masculin / féminin). **Ce n'est pas un défaut** :
   piste écartée après vérification.
10. RID : les **20 graphies annoncées attestées le sont**. Relevé rejoué le
    2026-08-04 avec `rid-lookup.mjs` : ตลาด, ยา, หมอ, ร้าน, ขาย, ทุก, วัน, งาน,
    ทำ, พี่, น้อง, ชาย, สาว, หัว, ปวด, เอา, ก็, แต่, และ, แล้ว.
11. RID : les **12 contrôles négatifs rendent bien `absent`** : ร้านขายยา,
    ไปหาหมอ, เข้าใจแล้ว, ไปตลาด, ที่ตลาด, ข้าวผัดหมู, แพงเกินไป, ปวดหัว,
    ทุกวัน, ทำงาน, พี่ชาย, น้องสาว.
12. L'empreinte VOLUBILIS citée (10 848 409 octets, SHA-256 `b9ab7418…`) est
    bien celle documentée dans l'en-tête de `volubilis-lookup.mjs`. Le classeur
    n'étant pas versionné, les numéros de ligne n'ont pas pu être rejoués.
13. Partie 3 : les unités 1 à 11 comptent bien **41 exercices `recall`**
    (relevé par champ `Mécanique : \`recall\``dans les sections`## Exercices`
    des 55 fichiers).
14. La ventilation annoncée est exacte : **39 « alphabet latin uniquement »**,
    **1 « chiffres arabes »** (`u03-l3e` exercice 4), **1 à tuiles** (`u01-l1d`
    exercice 3), **0 demandant de produire une graphie thaïe**.
15. `srs-u04-l4a-06` et `srs-u07-l7a-03` existent et **ne portent effectivement
    aucun tirage déposé par une leçon postérieure**. L'affirmation de dette est
    vraie.
16. Unité 11 : **35 redéclarations portant sur 26 graphies distinctes**,
    recalculé par croisement des sections `## Items` de l'unité 11 contre celles
    des unités 1 à 10. Le chiffre cité est exact.
17. **0 tiret cadratin et 0 tiret demi-cadratin** dans le fichier (0 U+2014,
    0 U+2013).
18. Exercice 1 : les **30 options sont toutes distinctes**, et les **10 bonnes
    réponses sont dix phrases distinctes**.
19. Exercice 1, heuristiques de longueur : « la plus longue » est correcte
    strictement aux tirages **2, 5 et 9**, avec égalité au tirage **8** ; « la
    plus courte » est correcte strictement aux tirages **1, 7 et 10**, sans
    égalité. Longueurs recomptées option par option. Conforme au dossier.
20. Probabilités : P(X≥8 ; 10, 1/3) = **0,340 %** ; 1/40 320 = **0,0025 %** ;
    P(X≥7 ; 8, 1/4) = **0,0381 %**. Les trois chiffres du fichier sont justes.
21. Exercice 3, dénombrements : 5!/2! = **60**, 8!/3! = **6 720**, 6! = **720** ;
    espérance 1/60 + 4/6720 + 1/720 = **0,0187**, soit **0,31 %** ; stratégie
    naïve 1/120 = 0,00833, soit **0,14 %**. Exacts, et la conclusion « pire que
    le hasard » tient.
22. Exercice 5 : les huit phrases sont bien des items publiés par les leçons
    citées (`u09-l9e`, `u07-l7e`, `u08-l8e`, `u09-l9d`, `u05-l5e`, `u11-l11c`,
    `u06-l6b`) ; ข้าวผัดหมู et ข้าวผัดไก่ sont bien publiés ensemble par
    `u10-l10c` ; la réplique 7 du dialogue de `u11-l11e` est bien
    ตรงไปค่ะ ไม่ไกลค่ะ, `trong pai khâ · mâi klai khâ`.
23. Transcription : conforme à **v1.1**. Aucun `é`, `è`, `eu` ni `oû` de
    qualité vocalique ; les seuls accents sont des marques de ton posées sur la
    première lettre du noyau ; `aee`, `oee`, `aww`, `ouu`, `oo` employés selon
    l'amendement 2.
24. La tolérance `kâw` / `kâww` de la politique de saisie reproduit fidèlement
    la consigne bloquante de la carte SRS de ก็ dans `u11-l11c`.

## 2. Findings

### Priorité 1 — promesses non mesurées

#### F1 `PROMESSE-ILOTS` — BLOQUANT

Page 7 : « Vous en garderez trois ou quatre îlots : un mot de santé, un lieu, un
chiffre, une fin de phrase polie. **C'est suffisant pour l'exercice 1**, qui ne
vous demande pas de restituer, seulement de reconnaître ce qui a été dit. »

Deux problèmes en une phrase. D'abord une **prédiction chiffrée de la
performance de l'apprenant** présentée comme un fait, que rien ne mesure.
Ensuite une **contradiction directe avec l'exercice 1**, qui écrit : « Les trois
options sont en français et diffèrent par un seul élément décisif : une
négation, un mot de temps, un membre de la famille, un chiffre, un plat.
**Reconnaître la silhouette de la phrase ne suffit pas.** » Un apprenant qui
n'attrape que « un mot de santé, un lieu, un chiffre » échoue précisément aux
tirages 2, 5 et 7, que les pièges connus désignent eux-mêmes comme ceux où
l'inversion de sens se joue. La page promet donc un résultat que l'exercice est
construit pour refuser.

#### F2 `PROMESSE-PREPARE` — BLOQUANT

Page 1 : « Le but est de suivre : savoir de quoi on parle, savoir quand ça
change de sujet, savoir quoi répondre. C'est ce que fait quelqu'un qui tient une
conversation, et **c'est ce que les onze unités précédentes vous ont préparé à
faire.** »

Affirmation d'acquis non mesurée, dans la leçon dont l'interdit le plus strict
est de ne rien affirmer sur le niveau atteint. Aucune des cinq mesures du jour
n'établit que le parcours prépare à tenir une conversation, et la page 9 dit
l'inverse sur la capacité voisine (« Vous n'avez jamais suivi une conversation
qui ne vous était pas adressée »). La partie 3 dresse un tableau « affirmation →
comment elle est établie » pour la page 9 seulement : cette affirmation-ci n'y
figure pas et n'a aucune ligne d'établissement.

#### F3 `SUPERLATIF-RESULTAT` — BLOQUANT

Trois superlatifs invérifiables, dont deux en texte apprenant :

- remarque 3 du dialogue : « C'est **le résultat le plus utile du parcours**. » ;
- page 4 : « demander à quelqu'un de ralentir **vaut plus que n'importe quel mot
  du jour** » ;
- Méta : « Durée visée : 20 minutes. **C'est la leçon la plus longue du
  parcours** » — et celui-là est faux et vérifiable : `u10-l10e` porte aussi
  « Durée visée : 20 minutes ». C'est une égalité, pas un maximum.

Les deux premiers relèvent exactement de « toute affirmation flatteuse
invérifiable » ; le troisième est une erreur de fait relevée en une commande.

#### F4 `PROJECTION-FUTUR` — BLOQUANT

Trois énoncés qui projettent une capacité future ou affirment une norme
conversationnelle thaïe qu'aucune source du dossier n'établit :

- exercice 3, feedback correct des tirages 3, 4 et 6 : « C'est ce que vous direz
  **quand vous ne vous arrêterez plus au milieu.** » Le « quand » présuppose
  l'acquisition ;
- exercice 4, feedback correct des tirages 4, 5 et 6 : « **C'est ce qu'une
  conversation vous demandera**, et vous venez de le faire. » ;
- page 8 : « C'est précisément **ce qu'une conversation demande** et ce qu'un mot
  isolé ne mesure pas. »

Le dossier ne cite aucune source pour ce que demande une conversation thaïe
réelle, et la note culturelle est justement absente au motif qu'« énoncer une
norme d'interaction qu'aucune source de la politique du projet ne permet
d'établir » est interdit. La même interdiction s'applique à ces trois phrases.

### Priorité 2 — capacités annoncées

#### F5 `CAPACITE-3-MORCEAUX` — BLOQUANT

L'objectif observable conditionne la réussite à une capacité précise : « il
produit en transcription six énoncés à partir du français seul, sur 4 sur 6,
**dont au moins une réplique complète de trois morceaux** ». Le seuil de 4 sur 6
est construit pour la rendre obligatoire (plancher 2 de l'exercice 4 : les trois
courts plafonnent à 3).

Or **aucune leçon ne l'enseigne**, et le fichier le dit deux fois lui-même :
exercice 3, « aucune leçon antérieure ne le mesure sur des répliques de trois
morceaux » ; exercice 4, « le seul du parcours qui demande une réplique de trois
morceaux d'un seul tenant ». Vérifié indépendamment :

- balayage des exercices `word_order` des unités 1 à 11 : le maximum publié est
  **deux morceaux et deux particules**, `u11-l11a` tirages 5 et 6
  (`[ขอโทษ][ครับ][พูด][อีกที][ได้ไหม][ครับ]` et
  `[ไม่][เข้าใจ][ครับ][พูด][ช้า ๆ][ได้ไหม][ครับ]`) ;
- balayage des 41 corrigés `recall` des unités 1 à 11 : **aucun** ne porte trois
  particules ;
- la seule réplique à trois morceaux et trois particules de tout le parcours est
  une ligne de dialogue de `u11-l11b` (สบายดีค่ะ ขอบคุณค่ะ แล้วคุณล่ะคะ),
  jamais produite par un exercice.

La Méta rattache 25 leçons aux **blocs** employés, aucune à cette **capacité**.
Et la Nature déclare « Elle n'enseigne rien », alors que la page 8 est le seul
endroit du parcours où l'enchaînement de trois morceaux est présenté. Soit la
capacité est rattachée à une leçon qui l'installe, soit elle sort de l'objectif
et du seuil.

#### F6 `KAW-TOUR-DE-PAROLE` — BLOQUANT

Le dialogue place ก็ **par-dessus une frontière de tour de parole** : Nok dit
แต่แพงเกินไปค่ะ (réplique 11), Ton répond ผมก็ไม่เอาครับ (réplique 12). La page 5
justifie cet emploi ainsi : « C'est la conversation qui porte le sujet, pas
chaque phrase, **exactement comme `u11-l11c` le fait remarquer sur son propre
dialogue** », et la remarque 1 du dialogue le redit.

**Cette citation est fausse, vérification faite dans `u11-l11c`.** Cette leçon
publie ก็ uniquement à l'intérieur d'un seul énoncé : son item 8 est
แพงเกินไปผมก็ไม่เอาครับ, une COMPOSITION dont la `note_fr` détaille l'ordre
« le premier morceau entier, แพงเกินไป … puis le sujet, ผม ; puis ก็ ; puis
seulement le verbe » ; sa Méta fixe la place de ก็ à « juste devant le verbe **du
second morceau** ». Son dialogue (huit répliques) porte ก็ une seule fois, ligne
ต้น « แพงเกินไปผมก็ไม่เอาครับ », motif et conséquence dans la même bouche. **Il
n'y a aucun ก็ inter-locuteurs dans `u11-l11c`.**

12D coupe donc une composition publiée en deux, en attribue la moitié à un autre
locuteur, et fait porter à ก็ un antécédent situé dans le tour de quelqu'un
d'autre. C'est un emploi syntaxique que le parcours ne publie pas, il n'est pas
déclaré à la partie 4, et il est **mesuré** trois fois : exercice 2 paire 5,
exercice 3 tirage 6, exercice 4 tirage 6.

#### F7 `PARTIE4-INCOMPLETE` — BLOQUANT

La partie 4 s'intitule « les **cinq** assemblages composés, déclarés comme tels »
et affirme : « Le dialogue emploie cinq suites que sa leçon d'origine ne publie
pas telles quelles. » Cette exhaustivité est la garantie que rien de neuf ne
passe en fraude. Elle est fausse : au moins quatre suites de plus sont
composées et non déclarées.

| Suite du dialogue             | Ce qu'on trouve réellement dans les unités 1 à 11                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| คุณต้น (réplique 1)           | **0 occurrence** de คุณต้น dans les 55 fichiers. คุณ (`u02-l2d`) + ต้น (`u02-l2e`). `u11-l11b` écrit พี่ต้น, forme que 12D refuse explicitement.                                                         |
| วันนี้สบายดีไหมคะ (r. 1)      | `u07-l7e` ne publie que la forme masculine วันนี้สบายดีไหมครับ.                                                                                                                                          |
| ข้าวผัดหมูอร่อยมากค่ะ (r. 11) | **0 occurrence** de ข้าวผัดหมูอร่อย. `u07-l7e` publie ข้าวผัดอร่อยมากค่ะ, sans หมู.                                                                                                                      |
| แต่แพงเกินไปค่ะ (r. 11)       | **0 occurrence** de แต่แพงเกินไป. `u11-l11c` publie แต่ « en tête du second morceau » d'un même énoncé (อร่อยแต่เผ็ดมากครับ), jamais **après une particule finale**, en ouverture d'une nouvelle phrase. |

Le dernier cas n'est pas cosmétique : `u11-l11c` existe pour enseigner que
« chacun a UNE place, et ce n'est pas la même ». Poser แต่ derrière un ค่ะ qui
ferme est une place différente de celle qui est publiée, et cette place est
mesurée par l'exercice 2, paire 8.

#### F8 `CONTROLE-1-12-FAUX` — BLOQUANT

La Méta érige un contrôle en preuve du fondement du fichier : « le contrôle en
est simple, `node scripts/verification/repo-thai-scan.mjs 1 12` doit rendre
exactement les mêmes chiffres que `1 11` ». La partie 1 et le contrôle 4 le
chiffrent : `12 12` → « 3 fichiers, 0 entrée, 0 graphie » ; `1 12` → « 58
fichiers, 512 entrées, 353 graphies ».

Sorties réelles du 2026-08-04, après écriture des cinq leçons de l'unité :

| Commande | Écrit dans 12D        | Rendu réel                                 |
| -------- | --------------------- | ------------------------------------------ |
| `12 12`  | 3 fichiers, 0, 0      | **5 fichiers, 13 entrées, 13 graphies**    |
| `1 12`   | 58 fichiers, 512, 353 | **60 fichiers, 525 entrées, 353 graphies** |

Les 13 entrées viennent entièrement de `lecon-12c.md` (มา, ขา, ป่า, พ่อ, สี่,
ห้า, กิน, สอง, บ้าน, น้อง, แล้ว, เพลง, เปลี่ยน). **12D publie toujours 0 item**,
fait 1 ci-dessus : le fond tient. Ce qui ne tient pas, c'est le contrôle tel
qu'il est écrit, et le fichier se bloque lui-même : « Toute autre différence
signalerait un item publié par erreur et **devrait bloquer le passage en
`review`**. »

Le fichier avait pourtant anticipé ce piège pour la troisième unité consécutive
et l'a quand même subi : sa Méta annonce « 3 fichiers pour l'unité 12 … 0 entrée
et 0 graphie pour les trois » et en tire que « les trois leçons de l'unité 12
ont pris la même décision ». Deux des cinq n'existaient pas encore, et l'une
d'elles publie.

Sortie constructive : **« graphies distinctes » vaut 353 dans les deux plages**
et ne bouge pas. Un contrôle formulé sur les graphies distinctes, ou restreint à
`lecon-12d.md`, dirait la même chose et resterait vrai quoi que fassent les
leçons sœurs.

### Priorité 3 — mots nouveaux

**Aucun finding.** Contrôlé par balayage par fichier (0 entrée), par
`item-fields-check.mjs`, et par relecture des 50 blocs de la partie 2. Les
seules formes non publiées telles quelles sont des assemblages, traités en F6 et
F7.

### Mesure des exercices

#### F9 `PLANCHER-NEGATION` — non bloquant

Plancher 5 de l'exercice 1 : « « Toujours l'option qui porte une négation » :
**3 sur 10 au plus**, les tirages 2, 5 et 6 … et se trompant sur les tirages
**1, 4 et 7** où c'est justement un distracteur qui la porte. »

Relevé option par option : une négation existe aux tirages 1, 2, 4, 5, 6 et 7 ;
la **bonne réponse** en porte une aux tirages **2, 4, 5 et 6**. Le tirage 4 est
mal classé : la bonne réponse y est « Pardon. **Je ne comprends pas.** Vous
pouvez parler lentement ? ». Le tirage 4 est exactement dans la configuration
des tirages 2, 5 et 6, où le fichier compte l'heuristique gagnante.

Le plafond est donc **4 sur 10**, pas 3. La conclusion générale n'est pas
touchée : la meilleure des cinq stratégies plafonne toujours à 4 sur 10 contre
un seuil de 8 sur 10.

#### F10 `PLANCHER-EX2-PARTICULES` — non bloquant

Plancher de l'exercice 2 : « **quatre** des huit blocs se terminent par ครับ, un
par ค่ะ ».

Décompte réel sur les huit blocs listés : **six** finissent par ครับ
(พูดช้า ๆ ได้ไหมครับ, ร้านขายยาอยู่ที่ไหนครับ, แล้วคุณล่ะครับ, ผมก็ไม่เอาครับ,
แล้วเจอกันครับ, เข้าใจแล้วครับ), **un** par ค่ะ (แต่แพงเกินไปค่ะ) et **un** par
คะ (กี่วันแล้วคะ), ce que le fichier ne mentionne pas.

L'argument s'en trouve renforcé, pas affaibli : la particule trie encore moins
qu'annoncé. Mais un plancher présenté comme mesuré porte un chiffre faux, dans
un dépôt dont la règle est qu'un décompte cité est produit par un outil ou n'est
pas cité.

#### F11 `FEEDBACK-EX3-TROIS` — non bloquant

Feedback correct générique de l'exercice 3 : « Oui. Chaque morceau se ferme sur
sa particule, **et la réplique en compte trois.** »

Ce feedback s'affiche sur toute bonne réponse non couverte par le feedback
spécial des tirages 3, 4 et 6, c'est-à-dire sur les tirages 1, 2 et 5. Or :

- tirage 1 → ไม่สบายครับ ปวดหัวมากครับ : **deux** morceaux, deux particules ;
- tirage 5 → ผมมีพี่ชายและน้องสาวครับ : **un** morceau, une particule.

L'apprenant reçoit donc un texte faux sur deux des six tirages, au moment précis
où il vient de réussir. Accessoirement, la liste du feedback spécial (« tirages
3, 4 et 6 ») omet le **tirage 2**, qui porte lui aussi trois morceaux et trois
particules, ce que le plancher 2 du même exercice reconnaît d'ailleurs en le
comptant parmi les tirages 1, 2, 3, 4 et 6 où la règle naïve échoue.

### Dossier de preuve

#### F12 `SOURCES-ATTRIBUTION` — non bloquant

Deux attributions de source vérifiables et fausses.

**(a) Unicode.** Le dossier écrit que l'empreinte de `UnicodeData.txt` est
« **identique à celle consignée par `u09-l9a`, `u10-l10a` et `u11-l11a`**,
vérifiée ici plutôt que reprise ». Recherche du SHA-256 `2e1efc1dcb…` dans
`content/authoring/` : il apparaît dans `u07-l7b`, `u08-l8d`, `u09-l9a`,
`u10-l10b`, `u10-l10e`, `u11-l11a`, `u11-l11c` et `u12-l12c`. **`u10-l10a` ne
mentionne nulle part `UnicodeData.txt`** et ne consigne pas cette empreinte : il
consigne `PropList.txt` et deux autres fichiers, avec d'autres empreintes. La
citation VOLUBILIS voisine, elle, est exacte pour les quatre leçons nommées.

**(b) Divergence สบายดีไหม, incertitude 2.** Le fichier écrit : la forme
`sà·baai·dii·mǎi` est portée « par l'item de `u02-l2b` … et par le dialogue de
`u11-l11e` », la forme avec espace « par le dialogue de `u07-l7e` », d'où
« **deux fichiers contre un** », et la tolérance de saisie accepte
« `sà·baai dii` … la divergence entre `u02-l2b` et `u07-l7e` étant réelle ».
Relevé réel :

- `sà·baai·dii·mǎi` : `u02-l2b`, `u09-l9b`, `u11-l11b`, `u11-l11e` — **quatre**
  fichiers ;
- `sà·baai·dii mǎi` : `u07-l7e`, `u11-l11d` — **deux** fichiers ;
- et une **troisième** forme que l'incertitude ignore : `sà·baai dii` /
  `sà·baai dii mǎi`, publiée en champ `transcription` d'item par `u02-l2e` et
  par `u11-l11e`.

Donc « deux contre un » est faux, et surtout la forme tolérée `sà·baai dii`
**n'est pas celle de `u07-l7e`** : `u07-l7e` écrit `sà·baai·dii mǎi`, l'espace
tombant entre `dii` et `mǎi`. La forme `sà·baai dii` vient de `u02-l2e` et de
`u11-l11e`. L'arbitrage 5 (« Correction de la transcription de สบายดีไหม dans
`u07-l7e` ») vise donc le mauvais fichier et rate `u11-l11d`, `u02-l2e` et
`u11-l11e`.

## 3. Remarques secondaires, non retenues comme findings

- **Enumération du point médian, exercice 4.** La politique de saisie liste les
  mots où `·` est exigé : `khâo·jai`, `pòuat·hǒua`, `tà·làat`, `thóuk·wan`,
  `phîi·chaai`, `náwwng·sǎao`, `khàwwp·khoun`, `láeew·joee·kan`,
  `ráan·khǎai·yaa`, `thîi·nǎi`. Quatre de ces dix (`phîi·chaai`, `náwwng·sǎao`,
  `ráan·khǎai·yaa`, `thîi·nǎi`) n'apparaissent dans **aucun** des six corrigés,
  et deux mots qui y apparaissent, `sà·baai` (tirage 1) et `khǎww·thôot`
  (tirage 4), n'y sont pas listés. La règle générale qui précède la liste les
  couvre, donc la correction ne casse pas ; la liste est simplement à refaire
  sur les corrigés réels. Même remarque pour la tolérance `sà·baai dii`, qui ne
  s'applique à aucun tirage de l'exercice 4.
- **Divergence non déclarée avec `u11-l11e`.** 12D rend `·` obligatoire ;
  `u11-l11e` traite « le point médian et l'espace comme équivalents à la
  saisie », précisément parce que le dépôt diverge. 12D déclare sa divergence
  avec `u08-l8d` et `u09-l9d` sur les accents de ton, mais pas celle-ci.
- **Transitions mal désignées.** « Ce que le contre-audit doit attaquer » n° 1
  vise « les transitions 8 vers 9 et 10 vers 11 ». La transition 8 → 9 est une
  réponse directe à la question de Ton (« Et vous ? ») et n'a rien d'abrupt ;
  la transition réellement abrupte et non désignée est **9 → 10**, du travail à
  la famille.
- **Piège incohérent, exercice 5.** « lire พี่ชาย au tirage 7 et répondre C
  parce que la phrase est longue » : lire พี่ชาย conduit à D, qui est la bonne
  réponse. Le piège tel qu'il est écrit ne décrit aucune erreur possible.
- **« La réplique 12 est réservée à l'exercice 4 »** : elle est aussi le tirage
  6 de l'exercice 3, et deux de ses blocs sont les paires 5 et 6 de l'exercice 2.
- **Naturalité de la réplique 12.** Ton dit « Alors je ne le prends pas » alors
  que rien ne lui a été proposé à l'achat : Nok émet une appréciation sur un
  plat, pas une offre. Point déjà couvert par l'incertitude 3 et par l'état
  « exposé » de l'audit de naturalité, mentionné ici pour mémoire.

## 4. Pistes explorées et ABANDONNÉES après vérification

Consignées parce que plusieurs consolidateurs ont récemment appliqué des
corrections d'audit fausses. Aucune de ces cinq pistes ne doit être « corrigée ».

1. **« Cinq blocs de la partie 2 ne sont pas des items. »** Faux. กี่วันแล้วคะ,
   ไปหาหมอไหมคะ, ขอโทษครับ, พูดช้า ๆ ได้ไหมครับ et ร้านขายยาอยู่ที่ไหนครับ sont
   des items publiés, dans des champs `thai` de forme double `X / Y`.
2. **« Les spécimens des pages 1, 2, 3, 5, 7 et 9 montrent du thaï sans
   transcription, contre la convention. »** Abandonné : c'est le format de
   spécimen de tout le dépôt, `u11-l11e` compris, dont les dix spécimens sont
   nus. Ce n'est pas propre à 12D et ne se corrige pas ici.
3. **« `dâai` pour ได้ note une voyelle longue à tort. »** Abandonné : la forme
   est publiée telle quelle par `u11-l11a`, 12D la réemploie sans la modifier.
   Le point, s'il existe, appartient à `u11-l11a`.
4. **« `sǎao` pour สาว est incohérent avec `ao` = diphtongue /aw/. »**
   Abandonné : forme publiée par `u06-l6e`, réemploi fidèle.
5. **« Les huit phrases de l'exercice 5 ne sont pas décodables. »** Abandonné :
   `u10-l10c` et `u10-l10d` écrivent que « tout l'alphabet, les quatre marques
   de ton et les familles de finales sont posés depuis 9A », et les huit phrases
   sont des items publiés des unités 5 à 11.

## 5. Ce qui n'a pas pu être vérifié

- **Numéros de ligne VOLUBILIS** (22 consultations citées) : le classeur n'est
  pas versionné et n'est pas présent dans le dépôt. Seule l'empreinte citée a
  été confrontée à l'en-tête de `volubilis-lookup.mjs`, où elle est identique.
- **Empreintes de `UnicodeData.txt` et de `th_50k.txt`** : les deux fichiers sont
  absents du dépôt. Seule la cohérence des empreintes entre fichiers d'autorat a
  pu être contrôlée, et c'est ce contrôle qui produit F12(a).
- **Ligne 3257 pour U+0E46** : non recomputable pour la même raison ; la valeur
  concorde avec celle de `u11-l11a`.

## 6. Verdict

Le fichier est solide sur ce qu'il mesure mécaniquement : Unicode, RID, relevé
des exercices `recall`, dénombrements combinatoires, réemploi des 50 blocs. Ces
parties ont été rejouées et tiennent.

Il échoue sur ce que l'unité 12 s'était donné pour seul objet : **ne rien
affirmer qui ne soit mesuré**. Quatre énoncés de texte apprenant promettent ou
flattent (F1 à F4), deux constructions syntaxiques sont mesurées sans être
publiées ni déclarées (F6, F7), une capacité est exigée au seuil sans leçon
derrière (F5), et le contrôle qui devait prouver « aucun mot nouveau » ne passe
plus (F8).

**Passage en `review` : non.** Huit findings bloquants à résoudre. Aucun ne
demande de retoucher le thaï du dialogue, sauf F6 et F7 qui demandent soit une
déclaration d'assemblage en partie 4, soit un remaniement des répliques 11 et 12.
