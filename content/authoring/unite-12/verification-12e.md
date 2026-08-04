# Contre-audit adversarial de `lecon-12e.md`

- Cible : `content/authoring/unite-12/lecon-12e.md` (1 606 lignes, écrans =
  lignes 1 à 765)
- Date : 2026-08-04
- Posture : adversariale. Objectif = trouver des erreurs, pas confirmer. Chaque
  affirmation ci-dessous a été reproduite par script ou par lecture directe du
  fichier source avant d'être écrite.
- Priorités imposées : (1) promesses non mesurées, (2) capacités annoncées sans
  leçon derrière, (3) aucun mot nouveau, plus décodabilité, transcription v1.1,
  tirets cadratins, exercices réussissables par réponse constante.
- Scripts d'appui écrits pour cet audit, tous rejouables :
  `scripts/verification/tmp-12e-blocs.mjs`, `tmp-12e-mesures.mjs`,
  `tmp-12e-mesures2.mjs`, `tmp-12e-registres.mjs`, `tmp-12e-dialogues.mjs`,
  `tmp-12e-decod.mjs`, `tmp-12e-unicode.mjs`, `tmp-12e-recouvrement.mjs`.

## Verdict

**4 findings BLOQUANTS, 8 non bloquants.** Les quatre bloquants portent tous sur
des phrases d'écran présentées comme mesurées et qui sont fausses. Trois d'entre
elles sont des LIMITES annoncées, c'est-à-dire exactement la catégorie que la
Méta du fichier déclare avoir « vérifiée le plus durement, parce qu'une limite
annoncée à tort est aussi malhonnête qu'une capacité annoncée à tort ».

La contrainte centrale de l'unité 12 est en revanche **tenue** : aucun niveau du
Cadre européen, aucun nombre d'heures, aucune durée, aucun délai, aucune
équivalence, aucune promesse de résultat, aucune qualification flatteuse de
l'apprenant. J'ai rejoué les douze motifs du balayage et j'obtiens exactement les
douze comptes publiés. Le fichier ne ment pas sur le niveau ; il se trompe sur
son propre corpus.

---

## Findings bloquants

### B1. Le plus long passage entendu est faux, et l'erreur vient de la méthode de mesure

**Page 5, écran d'apprenant.** Le fichier écrit :

> « Le plus long passage de thaï que ce cours vous fasse entendre d'un coup fait
> trois phrases courtes, cinquante-trois signes, et il est dans le dialogue de la
> leçon qui précède celle-ci. Sur les onze unités qui la précèdent, le maximum
> était de deux phrases, quarante signes, dans le dialogue de 7D. »

**Mesure contradictoire.** La réplique 7 du dialogue de `u08-l8e`, donc à
l'intérieur des unités 1 à 11, est :

```
ขอโทษครับ มีปัญหาครับ ตัวนี้ใหญ่เกินไปครับ ขอเปลี่ยนหน่อยครับ
```

soit **quatre phrases et 61 points de code**. Elle est plus longue que les 53 de
`u12-l12d` et de moitié plus longue que les 40 annoncés pour les unités 1 à 11.
Deux autres répliques dépassent aussi le plancher annoncé : `u11-l11d` à 44
points de code et `u07-l7e` à 40 points de code mais en **trois** phrases, pas
deux.

**Cause identifiée.** L'incertitude 4 écrit que « la mesure porte sur les
cellules thaïes des tableaux de dialogue ». Or sur les **43** sections
`## Dialogue` du parcours, **23 seulement sont des tableaux** ; les **20 autres
sont rédigées en liste** (`- Thaï : …`), et `u08-l8e` en fait partie. La mesure
n'a donc jamais lu la moitié des dialogues. Restreint aux seuls tableaux, mon
propre script retrouve exactement 53 (`u12-l12d`) et 40 (`u07-l7d`) : les
chiffres publiés sont ceux d'un balayage qui ignore 20 fichiers.

Deux conséquences de plus, du même défaut : l'incertitude 4 chiffre à « 40 » les
tableaux de dialogue du parcours, alors qu'il y en a 23 ; et la ligne
« dialogue le plus long : 12 répliques (`u11-l11a`) » désigne un seul fichier
alors que trois sont à 12 (`u11-l11a`, `u11-l11d`, `u12-l12d`).

**Pourquoi bloquant.** La page 5 est l'écran qui dit à l'apprenant l'échelle de
ce qu'il a écouté. Elle sous-estime le parcours réel de 50 %, et la ligne
suivante enchaîne sur « ce qui n'a donc pas été mesuré sur vous ». Une limite
fausse est un mensonge dans les deux sens.

**Correction attendue** : réexécuter la mesure sur les 43 sections `## Dialogue`
tous formats confondus, corriger les deux phrases de la page 5 et la ligne
correspondante de la partie 2, et réécrire l'incertitude 4 pour qu'elle nomme la
vraie limite (les dialogues en liste), pas seulement les tirages hors dialogue.

---

### B2. « La réponse attendue est toujours en transcription, en alphabet latin » est faux, et le zéro qui l'appuie est un artefact

**Page 4, écran d'apprenant.**

> « Sur les 46 exercices de production du parcours, **aucun ne vous a jamais
> demandé de produire une graphie thaïe** : la réponse attendue est toujours en
> transcription, en alphabet latin. »

Ligne d'appui de la partie 2 : « dont la réponse attendue contient un caractère
thaï | 1 à 12 | **0** ».

**Deux contre-exemples sur les 46.**

1. `u03-l3e`, exercice `recall`, ligne 631 : « Politique de saisie : **chiffres
   arabes uniquement**, aucune saisie thaïe ni latine attendue ». Réponses
   attendues : `30`, `13`, `10`, `3`. Ni transcription, ni alphabet latin.
2. `u01-l1d`, exercice 3 `recall`, ligne 304 : « Composez la réponse en touchant
   la bonne tuile ». Réponses attendues : **ม้า** et **หมา**, plus « haut ». La
   réponse attendue EST une graphie thaïe, et la leçon ajoute une « politique
   Unicode » qui compare ces tuiles en NFC strict.

**Le zéro est un artefact de balayage.** `u01-l1d` écrit « Réponse : ม้า. » sans
guillemets obliques : tout motif qui cherche une réponse entre `` ` `` ou après
`→` la manque. Mon script reproduit le 0 avec ce motif, et le contre-exemple par
lecture directe.

**Le dépôt savait.** `lecon-12d.md` ligne 958 mesure le même fait correctement :
« **39** portent “alphabet latin uniquement”, **1** “chiffres arabes uniquement”
(`u03-l3e`), **1** se répond en touchant des tuiles thaïes déjà écrites
(`u01-l1d`) ». Deux leçons sœurs de la même unité disent deux choses différentes
du même corpus, et c'est 12E qui a tort.

**Pourquoi bloquant.** Un « toujours » et un « jamais » sur un écran, appuyés sur
un chiffre présenté comme scripté, tous deux réfutables en une lecture.

---

### B3. « Aucune leçon ne mentionne un clavier thaï » est faux sur 15 fichiers

**Page 4, écran d'apprenant, ligne 163.**

> « Aucune leçon ne mentionne un clavier thaï, celle-ci mise à part et seulement
> pour vous dire qu'il n'y en a pas »

Ligne d'appui : « fichiers mentionnant un clavier ou une saisie thaïe | 1 à 12 |
**1** | c'est CE fichier ».

**Mesure contradictoire.** Quinze autres fichiers mentionnent la saisie thaïe :
`u02-l2a`, `u03-l3a`, `u03-l3b`, `u03-l3e`, `u04-l4b`, `u04-l4d`, `u04-l4e`,
`u05-l5b`, `u05-l5e`, `u06-l6e`, `u07-l7e`, `u08-l8e`, `u09-l9e`, `u12-l12a`,
`u12-l12d`. Et `u02-l2d` ligne 535 mentionne explicitement le clavier :

> « elle demanderait à l'apprenant de PRODUIRE des **caractères thaïs au
> clavier**, geste qui n'a pas encore été enseigné »

Là encore le dépôt savait : `lecon-12a.md` ligne 1105 compte « **treize**
déclarations de politique de saisie mentionnant la saisie thaïe » sur les unités
1 à 11, ce que je retrouve exactement (13 fichiers hors unité 12).

**Pourquoi bloquant.** Le chiffre `1` de la partie 2 est faux d'un facteur 16, et
il est le seul appui de la phrase d'écran. La conclusion de la page (« vous ne
savez pas écrire le thaï ») reste vraie ; la preuve avancée pour la soutenir ne
l'est pas, dans une leçon dont la thèse est « tout chiffre avancé est produit par
un script ».

---

### B4. La capacité « vous savez lire des mots et des phrases courtes en thaï » dépasse ce que la leçon qui l'enseigne délivre, et 12E ne le dit nulle part

**Page 4, écran d'apprenant.**

> « Vous savez donc lire des mots et des phrases courtes en thaï, et vous savez
> les écrire dans notre transcription. »

La seule limite que 12E pose ensuite est une limite de **taille** : « La lecture
aussi a une taille … vingt-quatre signes … Vous n'avez jamais lu un paragraphe ».

**Ce que la leçon qui enseigne la lecture déclare.** `u10-l10a` page 10 (« ce que
la méthode ne dit pas ») pose **quatre familles hors méthode**, et la page 8
(« et voici le mur ») instruit l'apprenant de s'arrêter plutôt que de deviner :

1. les syllabes mortes ;
2. les mots écrits avec ไ, ใ, เ◌า ou ◌ำ ;
3. les mots à consonne de tête, ห ou อ muet devant la vraie initiale (หมา, หนี,
   **อยู่**, อร่อย) ;
4. les deux consonnes qui ne forment pas un groupe, « comme dans **ตลาด** ».

**Le contre-exemple est dans 12E elle-même.** Son exercice 5 est un `reading` en
état `absent`, sans transcription et sans audio avant la réponse, et **cinq de
ses huit tirages reposent sur ces familles** : ห้องน้ำอยู่ที่ไหนครับ (น้ำ, อยู่,
ไหน), อันนี้เท่าไรครับ (เท่า, ไร), ขอน้ำหน่อย (น้ำ, หน่อย), **ตลาดอยู่ที่ไหน**
(le mot que `u10-l10a` donne comme archétype du hors méthode), ขอเปลี่ยนหน่อยครับ
(หน่อย, et ปลี่ dont `u10-l10a` page 3 note que la marque n'est même pas posée sur
l'initiale).

L'exercice reste défendable : il mesure la **reconnaissance** de mots déjà vus,
pas le décodage. Mais la page 4 n'annonce pas une reconnaissance, elle annonce
« vous savez lire des mots et des phrases courtes en thaï », sans restriction, et
n'écrit nulle part sur ses neuf écrans que la méthode de décodage laisse quatre
familles dehors. Un balayage des écrans sur `morte`, `décoder`, `deviner`,
`alphabet` ne rend rien de tel.

**Pourquoi bloquant.** C'est une capacité annoncée plus large que ce que la leçon
derrière elle enseigne, dans la seule leçon du parcours dont l'objet déclaré est
« de dire ce que le parcours ne lui a pas donné ». La correction est courte :
reprendre en une phrase la limite que `u10-l10a` écrit déjà, au lieu de ne poser
qu'une limite de longueur.

---

## Findings non bloquants

### N1. Les citations des deux cartes d'entretien des tons sont comptées deux fois, différemment, sans périmètre

- Section SRS : « `srs-u04-l4a-06` … citée par **18 autres fichiers** …
  `srs-u07-l7a-03` … **18 autres fichiers** … **Trente-six citations** ».
- Partie 3, tableau : « **13 autres fichiers** » pour chacune, « **Vingt-six
  citations** ».
- Arbitrage 1 : « le compte est **désormais** de 26 citations », « 13 fichiers
  citant `srs-u04-l4a-06` et 13 citant `srs-u07-l7a-03` ».

**Mesure.** 19 fichiers mentionnent `srs-u04-l4a-06` (le définisseur `u04-l4a`
plus 18 autres) et 19 mentionnent `srs-u07-l7a-03` : **18 + 18 = 36 sur les
unités 1 à 12**, et **13 + 13 = 26 si l'on s'arrête aux unités 1 à 11**. Les deux
chiffres sont donc justes, sur deux périmètres différents, et **aucun des deux
endroits ne dit lequel**, alors que la partie 2 pose en règle « Chaque ligne dit
son périmètre ». Pire, l'arbitrage 1 écrit « désormais 26 » alors que la section
SRS du même fichier a déjà établi 36 en ajoutant les dix demandes de l'unité 12.

**Correction** : donner le périmètre aux trois endroits, et faire porter
l'arbitrage sur 36.

### N2. Le « 134 poli » de la page 3 tient à une règle de départage jamais déclarée, et l'incertitude 3 passe à côté

Page 3 : « Le compte est net … **134** portent l'étiquette « poli », **373**
« neutre », **6** « familier », et **2** seulement « formel » ».

**Mesure.** Il y a bien 525 champs `registre` dans les sections `## Items` des
unités 1 à 12, et je reproduis **exactement 373 / 134 / 6 / 2 plus 10 hors
cases** avec un ordre de priorité `formel > familier > poli > neutre`. Mais
**49 champs portent à la fois « neutre » et « poli »**, de la forme
« neutre (poli avec la particule) ». Avec la priorité inverse, les mêmes données
rendent **422 / 86 / 6 / 1**. Le chiffre affiché à l'apprenant bascule donc de 86
à 134 selon une convention que le fichier n'énonce jamais.

L'incertitude 3 signale les **10** champs non classés, c'est-à-dire la plus
petite des deux sources de doute, et ignore les **49**.

**Défaut annexe, même sujet.** L'incertitude 3 et la ligne « Registre » du
tableau des audits disent « **512** champs `registre` », alors que la page 3 et le
tableau des mesures disent 525 et que la ventilation publiée n'est reproductible
que sur 525 (512 est le compte des unités 1 à 11).

### N3. « Les seuils que vous avez franchis disent que vous reconnaissez et produisez le contenu de ces onze unités »

Page 2, écran. La production est mesurée par **46 exercices `recall` sur 60
leçons**, et les seuils tolèrent l'échec : 7 sur 10 dans l'exercice 4 de 12E même.
Rien ne mesure la production sur les 353 graphies du parcours. La phrase
généralise d'un échantillon de tirages à « le contenu de ces onze unités ». Elle
est immédiatement tempérée par la phrase suivante, ce qui la rend non bloquante,
mais elle reste plus large que ce qui est mesuré, dans la page qui explique
précisément que le cours n'a mesuré que ses propres tirages.

### N4. « 46 ne sont pas des mots mais des phrases complètes » : la métrique mesure autre chose

Page 6. La ligne d'appui est « graphies se terminant par une particule finale |
46 », et je confirme le 46. Mais **5 des 46 sont les particules elles-mêmes** :
ครับ, ค่ะ, คะ, « ค่ะ / คะ », « ค่ะ · คะ », tous glosés « particule de politesse »
par leur leçon d'origine. Ce sont des mots, pas des phrases. Plusieurs autres
(สวัสดีครับ, ขอบคุณครับ) sont des formules d'un mot plus la particule. Le proxy
mesuré est présenté à l'apprenant comme ce qu'il n'est pas.

### N5. Les comptes que le dossier fait sur lui-même

Trois familles d'erreurs de comptage, toutes dans les sections qui se réclament
d'une exécution scriptée. Les **comptes de motifs du balayage sont eux exacts** :
j'ai rejoué les douze et j'obtiens 0/1/1/0/2/0/0/0/0/0/2/1, à l'identique.

1. **Deux renvois de ligne faux.** « `équivalen`, 2 occurrences, lignes 21 et
   **102** » : la seconde est à la **ligne 115** (la ligne 102 est
   « > pas dans ce qu'on vous propose »). « `maîtrise`, 1 occurrence … Elle est à
   la **ligne 677** » : elle est à la **ligne 714** (la ligne 677 est « **Et voici
   pourquoi cette demande a toutes les chances… »).
2. **Deux auto-comptes faux.** « Les **six** occurrences non nulles ont été
   ouvertes une par une » : il y a **7 occurrences** réparties sur **5 lignes non
   nulles** (six est le nombre de points de l'énumération, dont deux ne sont pas
   des occurrences). Et le tableau des audits écrit « **neuf** familles de motifs,
   **toutes à 0** sur les écrans, **trois** occurrences examinées » : il y a
   **douze** familles (l'arbitrage 8 dit lui-même « ses douze motifs »), **cinq**
   sont non nulles, et **sept** occurrences ont été examinées.
3. **Deux tailles d'échantillon fausses.** Le tableau de la partie 1 a 26 lignes,
   mais **4 portent « non relevée » en colonne RID** (สิบห้า, ห้าสิบ, ไม่เป็นไร,
   แล้วเจอกัน) : « `rid-lookup.mjs` : **26 graphies interrogées** » est donc à 22.
   De même **4 portent « non relevée » en colonne VOLUBILIS** (เกินไป, อยู่, และ,
   แต่) : les « **21** gloses VOLUBILIS » et « les **vingt et une** lignes
   relevées » sont **22**.

### N6. Les « trois références mortes » sont trois décisions écrites, pas trois oublis

Réserve 2 du bilan SRS et arbitrage 6 : « Trois identifiants sont cités par une
section SRS sans être définis nulle part … un bilan qui tairait trois références
mortes ne serait pas un bilan … **Arbitrage demandé** : les définir ou les
retirer ».

L'énoncé littéral est vrai, la qualification ne l'est pas. Les trois sont des
décisions consignées, dans la section même que 12E a lue :

- `srs-u04-l4c-04`, `u04-l4c` ligne 707 : « Carte **SUPPRIMÉE** le 2026-08-03 …
  la numérotation reste 01, 02, 03, avec un **trou assumé en 04**, pour que les
  historiques de révision déjà écrits ne pointent pas sur une carte devenue autre
  chose » ;
- `srs-u11-l11e-02`, `u11-l11e` ligne 1492 : « **RETIRÉE avant publication**, et
  le motif est écrit plutôt que la carte discrètement supprimée … ses tirages
  deviennent une demande adressée à `srs-u01-l1e-04` » ;
- `srs-u10-bilan-01`, `u10-l10e` ligne 1254 : « **PROPOSÉE, non écrite** », ce que
  `lecon-12a.md` ligne 841 rapporte d'ailleurs correctement.

L'arbitrage demande de corriger ce qui est déjà tranché, et « les retirer »
détruirait le trou assumé que `u04-l4c` documente exprès. À reformuler en
« consigner que trois identifiants sont volontairement non définis ».

Note : les décomptes par unité du bilan, eux, sont **justes**, parce qu'ils
excluent ces cartes retirées. Je reproduis 4/28/33/30/33/33/28/27/27/18/10/11 et
le total de 282.

### N7. Trois renvois inexacts de la Méta

1. « Ils sont aux **tirages 8 à 11** de l'exercice 1 ». L'exercice lui-même, la
   partie 3 et la section SRS disent tous **tirages 8, 9 et 11** ; le tirage 10
   oppose la longueur, pas les deux contrastes de tons. La Méta est la seule à
   inclure le 10.
2. « sur les paires publiées par `u01-l1c` et `u01-l1d` », répété en partie 3. Le
   tableau des blocs de 12E dit lui-même autre chose : คา / ข่า / ค่า viennent de
   **`u01-l1a`** items 1, 2 et 3, ดู / ดุ de **`u01-l1b`**, ปู de `u01-l1c`, มา de
   **`u05-l5b`**.
3. « la règle du ton … se lit sur la consonne initiale … `u04-l4a` **le dit à sa
   page 8** ». La page 8 de `u04-l4a` (« ce que la règle ne dit pas encore »,
   lignes 140 à 154) ne dit rien de tel ; l'énoncé sur เ, แ, โ, ใ et ไ écrits avant
   leur consonne est à la **ligne 121, donc page 6**, et la règle complète est à la
   **page 3 de `u10-l10a`** (« question un, la consonne initiale »). Renvoi faux
   dans le paragraphe qui existe pour corriger un renvoi faux commis ailleurs.

### N8. อยู่ et ขอ ne commencent pas par la même lettre

Exercice 5, pièges connus : « confondre อยู่ et ขอ, qui commencent par la même
**lettre muette de départ** ». C'est faux. อยู่ commence par **อ** (U+0E2D),
muet ici, et `u05-l5c` item 1 consigne la lecture [หฺยู่] du dictionnaire normatif
pour l'attester. ขอ commence par **ข** (U+0E02), consonne initiale bien
prononcée, son อ étant la voyelle. Les deux mots partagent la lettre อ, mais pas
en position initiale, et elle n'est muette que dans l'un des deux. À réécrire en
« les deux portent un อ, muet dans อยู่, voyelle dans ขอ ».

---

## Ce que j'ai vérifié moi-même et qui tient

56 faits confirmés, chacun rejoué et non repris du fichier.

**Corpus et conventions de comptage (1 à 8)**

1. `repo-thai-scan.mjs --check-u07` passe, dix chiffres sur dix.
2. `1 11` rend 55 fichiers, 512 entrées, 353 graphies.
3. `1 12` rend 60 fichiers, 525 entrées, 353 graphies.
4. `12 12` rend 5 fichiers, 13 entrées, 13 graphies.
5. Treize entrées de plus et zéro graphie de plus entre `1 11` et `1 12` : les 13
   items de `lecon-12c.md` sont tous des redéclarations. Le 353 de la page 6 porte
   bien sur le parcours complet.
6. 12E ne publie aucun item : **priorité 3 tenue, aucun mot nouveau**.
7. Graphie la plus longue hors notation composite : **24 points de code, 3 ex
   aequo** (ขอข้าวผัดสองจานหน่อยครับ, ผมทำงานที่บ้านทุกวันครับ,
   ผมมีพี่ชายและน้องสาวครับ).
8. 46 graphies se terminent par une particule finale.

**Réemploi, priorité 3 (9 à 14)**

9. Le tableau des blocs réemployés compte **90 lignes** ; le tableau des cellules
   composites en compte **7** ; total **97**, conforme au chiffre annoncé.
10. Les 90 transcriptions du premier tableau sont **identiques caractère pour
    caractère** au champ `transcription` de leur leçon d'origine. 0 écart.
11. Les 7 cellules composites citées sont **exactement** le champ `thai` de
    l'item d'origine, et la forme masculine affichée figure bien dans la cellule.
12. Les **89 numéros d'item** cités sont exacts ; le quatre-vingt-dixième,
    « `u03-l3b` item 1.2 », renvoie bien au sous-item `#### 1.2 สอง`.
13. `u09-l9b` item 7 est bien le seul bloc dont 12E cite les deux formes, et les
    deux figurent dans la cellule.
14. La réplique de `u07-l7d` affichée page 5 est bien la réplique 4 de son
    tableau de dialogue, transcription reprise sans modification.

**Décodabilité, Unicode, forme (15 à 23)**

15. **100 graphies thaïes distinctes** sur les écrans, chiffre exact.
16. **0 séquence instable en NFC**, aucun caractère hors du bloc thaï.
17. **18 graphies à empilement 2**, profondeur maximale 2, réparties en **8 sans
    transcription et 10 avec**. La ventilation nominale des deux listes est juste.
18. Les **46 séquences U+** écrites au dossier sont toutes exactes.
19. Décodabilité : **toute** graphie d'écran est publiée par les unités 1 à 11,
    aux trois exceptions déclarées par le dossier (les cinq voyelles antéposées,
    ไม้จัตวา en métalangue, la réplique de `u07-l7d`).
20. **0 tiret cadratin ni demi-cadratin** sur les 1 606 lignes.
21. Apostrophe droite : **2** dans le fichier entier, **0** sur les 765 lignes
    d'écran, et les deux sont bien dans les extraits de commande.
22. La portion balayée fait bien **765 lignes** (`## Dossier de production` en
    ligne 766) et le fichier bien **1 606 lignes**.
23. Transcription **conforme v1.1** : aucun `é`, `è`, `eu` ni `oû` résiduel,
    marque de ton systématiquement sur la première lettre du noyau vocalique
    (`láeew`, `sǎwwng`, `pòuat`, `thóuk`, `phôuut`, `koeen`).

**Promesses interdites, priorité 1 (24 à 26)**

24. Les **douze comptes de motifs** du balayage sont exacts : 0 / 1 / 1 / 0 / 2 /
    0 / 0 / 0 / 0 / 0 / 2 / 1.
25. Aucun niveau CECR, aucun volume horaire, aucun délai, aucune équivalence,
    aucune promesse de résultat, aucune qualification de l'apprenant, aucune
    promesse d'effort, aucune garantie sur les écrans. J'ai ajouté six familles de
    motifs que 12E ne balaie pas (`capable de`, `débutant|intermédiaire|avancé`,
    `en X temps`, `autonome|vous débrouiller`, `prêt à`, `vous maîtrisez`) :
    **aucune n'attrape de promesse**.
26. Aucune assertion de phonétique française, ce qui respecte la section 1 bis de
    la politique de sources.

**Exercices et planchers (27 à 40)**

27. Exercice 1 : les 12 bonnes réponses viennent bien de **huit** unités, 1, 3, 4,
    5, 7, 8, 9 et 11.
28. Exercice 1 : les tirages 1 à 7 viennent de **sept unités différentes**, et la
    ventilation 7 + 3 + 1 + 1 fait bien 12.
29. Exercice 1, réponse constante par carte : **1 sur 12**, les douze bonnes
    réponses étant douze graphies distinctes.
30. Exercice 1, position constante : espérance 4 sur 12, et
    **P(X ≥ 9 ; n = 12, p = 1/3) = 0,386 %**, recalculé terme à terme.
31. Exercice 1, « la carte la plus longue » : **1 tirage strict** (le 12) et
    **5 ex aequo** (3, 6, 8, 10, 11). Plafond 6 sur 12, exactement comme écrit.
32. Exercice 1, « la carte la plus courte » : **2 stricts** (5 et 9) et **4 ex
    aequo** (2, 6, 8, 10). Plafond 6 sur 12.
33. Exercice 1, « la carte qui porte ไม่ » : applicable sur 3 tirages (4, 7, 8),
    juste 2 fois, fausse au 8 où la réponse est ไหม.
34. Exercice 2 : les six demandes viennent bien de **six unités**, 2, 3, 5, 8, 9
    et 11 ; 1/720 = 0,14 % ; 1 sur 120 et 1 sur 24 ; **le score 5 sur 6 est bien
    structurellement impossible**.
35. Exercice 2 : **aucune contrepartie française ne reprend un fragment de la
    transcription affichée**, vérifié paire par paire.
36. Exercice 3 : six phrases venues de **cinq unités**, 4 à 8. Les trois ordres
    invoqués sont bien publiés par `u01-l1e` (particule finale), `u02-l2c` (ขอ) et
    `u03-l3d` (chose, nombre, mot de comptage).
37. Exercice 3, les trois planchers recalculés : **0,136 sur 6 = 2,27 %**,
    **0,558 sur 6 = 9,31 %**, **1,083 sur 6 = 18,06 %**. Les trois sont exacts au
    millième.
38. Exercice 4 : dix formules venues de **huit unités**, 1, 2, 3, 4, 5, 8, 9 et
    11 ; dix chaînes de réponse distinctes ; **P(X ≥ 7 ; n = 10, p = 0,1) ≈ 9,1 ×
    10⁻⁶**, soit bien moins d'une session sur cent mille.
39. Exercice 5 : huit phrases venues de **quatre unités**, 2, 3, 5 et 8, dont
    **quatre de l'unité 8** ; répartition **strictement 2 par option** ; plancher
    constant 2 sur 8 et **P(X ≥ 7 ; n = 8, p = 1/4) = 0,038 %** ; les trois
    heuristiques lexicales plafonnent bien à 2 sur 8 chacune.
40. **Aucun des cinq exercices n'est réussissable par une réponse constante**, et
    la meilleure heuristique de chacun reste sous le seuil. Priorité « exercices
    non réussissables par une réponse constante » tenue.

**Capacités annoncées, priorité 2 (41 à 45)**

41. Page 1 : **douze actes**, un par unité pour les unités 1 à 10 et **deux pour
    l'unité 11**, exactement comme annoncé.
42. Chacun des douze est rattaché à une leçon qui le publie, et les douze
    rattachements sont exacts (voir points 10 à 12).
43. Les cinq exercices réunis puisent bien dans **dix unités, 1 à 9 et 11**.
44. Page 6, « vous n'avez pas de mot pour dire oui » : le seul item du parcours
    glosé « Oui. » est **ไปครับ / ไปค่ะ** (`u09-l9e`), c'est-à-dire une reprise du
    verbe. Aucun ใช่ autonome n'est publié. La capacité déclarée absente l'est
    réellement.
45. Page 3 : les trois spécimens de registre sont exacts, ดิฉัน en 2D,
    รับประทาน marqué « formel » en 4B, หวัดดี marqué « familier » en 2B, et l'un
    des deux « formel » porte bien une divergence entre ses sources (`u02-l2e` :
    « formel selon en.wiktionary, poli selon th.wiktionary »).

**Bilans de parcours (46 à 52)**

46. Bilan SRS : **282 cartes**, et la ventilation par unité est exacte,
    4/28/33/30/33/33/28/27/27/18/10/11, une fois exclues les deux cartes
    explicitement retirées.
47. Réserve 1 : l'unité 1 n'a bien que 4 cartes identifiées, celles de `u01-l1e` ;
    les quatre autres leçons décrivent leurs cartes en prose.
48. Bilan d'exercice : **69 / 52 / 46 / 45 / 44 = 256**, et les cinq mécaniques
    sont bien employées par les douze unités.
49. **46 exercices `recall`** sur le parcours.
50. **42 fichiers sur 60** écrivent « alphabet latin uniquement ».
51. Statuts, unités 1 à 11 : **54 sur 55** portent « Statut : `draft` » (manque
    `u01-l1d`) et **53 sur 55** portent « Revue native : en attente » (manquent
    `u01-l1d` et `u06-l6d`). Exact.
52. **43 sections `## Dialogue`** dans le parcours.

**Coordination d'unité et sources (53 à 56)**

53. Les trois tirages annoncés comme redondants le sont : `12A` tirage 11 est bien
    « เลี้ยวซ้าย, contre เลี้ยวขวา et ตรงไป » ; `12A` tirage 12 porte bien l'audio
    ช่วยด้วย ; `12B` tirage 1 est bien « ปา, contre ป่า et ปู » ; `12B` tirage 7
    (เขา, contre ขาว et ข้าว) partage bien deux cartes sur trois avec l'ancien
    tirage 10.
54. `lecon-12d.md` s'intitule bien « Une dernière conversation » et porte bien un
    dialogue de **douze tours**.
55. `u10-l10a` page 9 définit bien les **trois états** de l'échafaudage de
    transcription, et 12E les emploie conformément.
56. L'exemplaire VOLUBILIS cité (10 848 409 octets, sha256 `b9ab7418…`, 114 579
    lignes non vides, 586 541 chaînes partagées) est **identique** à l'en-tête de
    `volubilis-lookup.mjs` et aux relevés de `u08-l8a`, `u09-l9a`, `u10-l10a` et
    `u11-l11a`. Les numéros de ligne eux-mêmes n'ont pas pu être rejoués, le
    classeur n'étant pas versionné : c'est une limite de cet audit, pas un
    finding.

## Limites de cet audit

- Le classeur VOLUBILIS n'est pas dans le dépôt : les 22 numéros de ligne de la
  partie 1 n'ont pas été rejoués.
- Aucun appel réseau : les présences et absences RID de la partie 1 n'ont pas été
  recontrôlées, ni la réserve sur ที่ไหน de l'incertitude 2.
- Le recouvrement de graphies entre sections `## Exercices` de l'unité 12 dépend
  de la tokenisation : je retrouve 11 avec 12B et 5 avec 12C, comme annoncé, mais
  35 avec 12A et 14 avec 12D là où le fichier écrit 33 et 12. L'écart est trop
  sensible à la méthode pour être porté en finding ; il mérite d'être tranché à
  la consolidation.
- Aucun audio n'existe : tout ce qui touche au débit, à la voix et aux finales
  retenues reste invérifiable.
