# Contre-audit adversarial de `u11-l11d`

- Fichier audité : `content/authoring/unite-11/lecon-11d.md`
  (sha256 `f6095c7f1fbdbfca951b0c25d2fe1fd5c9ee16c7aec4a93aecddcbc325891e44`,
  133 736 octets, rendus par `unicode-thai.mjs` au moment de l'audit)
- Date : 2026-08-04
- Consigne : adversariale. Chercher des erreurs, pas des confirmations, et
  re-vérifier soi-même chaque proposition avant de l'écrire.
- Cadre : `content/authoring/CONVENTIONS.md` (v1 et amendements v1.1 à v1.3) et
  `docs/content-policy/sources-verification.md`, sections 1 bis et 1 ter.
- Verdict : la leçon reste `draft`. **Sept findings bloquants, cinq non
  bloquants.** Aucun passage en `review` avant résolution des sept.

Ce rapport remplace une version antérieure du même fichier. Quatre de ses
findings y figuraient déjà et **n'ont pas été corrigés dans la leçon** : ils sont
re-vérifiés ici par exécution, pas repris de confiance. Trois findings bloquants
sont nouveaux.

## Méthode réellement exécutée

Rien n'est repris du dossier de production de la leçon. Tout est recalculé ou
reconsulté.

Scripts versionnés exécutés le 2026-08-04 :

```
node scripts/verification/item-fields-check.mjs content/authoring/unite-11/lecon-11d.md
node scripts/verification/item-fields-check.mjs content/authoring/unite-07/lecon-7e.md
node scripts/verification/unicode-thai.mjs      content/authoring/unite-11/lecon-11d.md
node scripts/verification/repo-thai-scan.mjs --check-u07
node scripts/verification/repo-thai-scan.mjs 1 11
node scripts/verification/repo-thai-scan.mjs 11 11
node scripts/verification/rid-lookup.mjs <25 graphies>
node scripts/verification/rid-entry.mjs   เขา
```

Consultations externes refaites en rendu (`action=render`) : en.wiktionary pour
เขา, ล่ะ, ไหม, เจอกัน, ตอนเช้า, ตอนเย็น, ทุกวัน, วันนี้, แล้ว, plus contrôle de
code HTTP sur แล้วคุณล่ะ et แล้วเจอกัน, plus relevé d'IPA et de romanisation
Paiboon sur ปา, ป่า, หมา, ม้า, หนี, นี้, ตลาด, หนึ่ง, สอง, ผม, ทุก, ครับ, ไกล,
มาก, น้องสาว, ไป.

Contrôles ad hoc écrits pour cet audit, tous rejouables :

- comparaison des champs **que `item-fields-check.mjs` ne compare pas** (`fr`,
  `litteral`, `registre`) entre chaque réemploi et sa leçon d'origine ;
- balayage des 55 fichiers `lecon-*.md` pour les sections `## Dialogue` et le
  nombre de répliques, les trois formats du parcours étant reconnus ;
- relevé des graphies d'items de l'unité 11 et détection des doublons de fiche ;
- comptage des empilements de signes de catégorie positionnelle Top ;
- balayage du corpus à la recherche d'un énoncé publié portant deux compléments
  de temps ;
- recalcul complet des planchers des cinq exercices, dépouillement bloc par bloc.

**Limite d'exécution, dite d'emblée.** `VOLUBILIS_Database.xlsx` n'est pas dans
le dépôt et l'adresse de téléchargement donnée par l'en-tête de
`volubilis-lookup.mjs` répond **HTTP 404**, re-vérifiée le 2026-08-04 sur
`master.dl.sourceforge.net`, `downloads.sourceforge.net` et
`sourceforge.net/projects/belisan-volubilis/files/`. **Aucun des treize numéros
de ligne VOLUBILIS de ce fichier n'a pu être recomputé.** L'arbitrage 1 de la
leçon, qui demande la correction de cet en-tête pour la troisième fois, est donc
fondé et confirmé par exécution. Un contrôle de cohérence est cependant possible
et il passe : les treize numéros cités par 11D et 11C
(เจอกัน 19977 < เขา 31404 < คุณ 38543 < ก็ 42625 < แล้วเจอกัน 47344 <
แล้วคุณล่ะ 47348 < ไหม 51647 < สบายดี 85504 < ทำงาน 99613 < ทุกวัน 104096 <
ตอนเช้า 105405 < ตอนเย็น 105763 < วันนี้ 108632) sont **strictement croissants
dans l'ordre alphabétique de la colonne de romanisation**, ce qui est le tri de
la feuille. Ce n'est pas une preuve d'exactitude, c'est une preuve qu'ils ne sont
pas tirés au hasard. Le seul qui entre en conflit avec le dépôt est celui de
เขา, finding B5.

## Ce que j'ai confirmé moi-même : 54 faits

### Réemplois (priorité 1)

1. `item-fields-check.mjs` rend **0 champ `codepoints` en faute et 0 écart de
   réemploi** sur les huit items.
2. Le script ne compare que `ipa`, `ton`, `longueur`, `transcription` et
   `codepoints` (constante `CHAMPS`, ligne 53). J'ai donc comparé par script les
   champs `fr`, `litteral` et `registre` des huit items contre leur leçon
   d'origine : **0 écart**, y compris le champ `registre` long de เขา et sa
   parenthèse de renvoi à « l'incertitude 3 ».
3. Les huit séquences `codepoints` recalculées en NFC depuis le champ `thai`
   correspondent aux séquences déclarées, et au tableau de la section Unicode.
4. Les huit pointeurs `uXX-lYz item N` désignent bien l'item annoncé, vérifié par
   lecture des titres `### Item` des dix fichiers d'origine.
5. Les 37 attributions de la section « Couverture lexicale » pointent toutes vers
   un item réellement existant, y compris `u03-l3b` 1.1 et 1.2.
6. L'écart signalé à l'arbitrage 3 est réel et le script le rend : `u07-l7e`
   item 15 porte `ipa : /lɛːw˦˥.t͡ɕɤː˧.kan˧/` sans la parenthèse de `u01-l1e`
   item 5 que 11D recopie.
7. Les sept cartes SRS citées existent toutes dans le dépôt.
8. Groupe A vérifié réplique par réplique : les répliques 1, 2 et 12 sont mot
   pour mot les répliques 1, 2 et 8 du dialogue de `u07-l7e` **pour le thaï et la
   transcription** (voir B4 pour le français) ; les répliques 7 et 10 sont mot
   pour mot les répliques 1 et 8 de `u06-l6e`.
9. Groupe B vérifié : `u06-l6e` réplique 2 porte bien มีค่ะ et
   ดิฉันมีพี่ชายหนึ่งคนค่ะ, réplique 4 porte แล้วคุณล่ะคะ, réplique 5 porte
   ผมมีน้องสาวสองคนครับ, réplique 7 porte อยู่ที่ฝรั่งเศสครับ. `u07-l7c` item 7
   est bien ผมไปตลาดตอนเช้าครับ, `u07-l7d` item 8 bien ผมทำงานที่บ้านทุกวันครับ.
10. `u09-l9e` réplique 7 est bien ไปครับ ขอบคุณครับ et réplique 8 bien
    ไม่เป็นไรค่ะ.
11. Provenance des deux leurres : ไม่ไกลค่ะ est la première phrase de la
    réplique 4 de `u07-l7e` ; ไม่เป็นไรค่ะ est la réplique 8 de `u09-l9e`. Leurs
    cartes d'origine, `u05-l5e` item 2 et `u02-l2c` item 3, existent.

### Décodabilité (priorité 2)

12. **Décodabilité intégrale du dialogue.** Chaque bloc des douze répliques
    résout vers un item publié par les unités 1 à 7. Aucun mot non enseigné.
13. Les deux leurres de l'exercice 1 sont décodables : ไม่ (`u04-l4d` item 1),
    ไม่ไกล (`u05-l5e` item 2), ไม่เป็นไร (`u02-l2c` item 3).
14. Les spécimens des douze pages d'enseignement n'introduisent aucune graphie
    hors parcours ; ปา, ป่า, หมา, ม้า viennent de `u01-l1c` et `u01-l1d`.
15. `u02-l2e` items 12 et 13 publient bien ต้น et นก, et n'affirment rien sur
    leur emploi réel comme prénoms.

### Graphie, Unicode, tons, longueur, transcription

16. `unicode-thai.mjs` : 8 champs `thai`, toutes conformes NFC, aucun caractère
    de zone à usage privé.
17. Aucun tiret cadratin ni demi-cadratin dans le fichier (ADR-0022).
18. Profondeur d'empilement maximale **2**, mesurée par comptage des signes de
    catégorie positionnelle Top consécutifs, et exactement **cinq** graphies
    concernées dans le périmètre déclaré (huit items, douze répliques, deux
    leurres) : นี้ de วันนี้, ที่, พี่, นึ่ง de หนึ่ง, รั่ de ฝรั่งเศส. La
    correction que la leçon s'inflige (1 annoncé, 2 mesuré) est donc juste.
19. Les huit transcriptions respectent `thainaute-fr` v1.1 : marque de ton sur la
    première lettre du noyau, doublement de la dernière lettre du graphème pour
    la longueur (`aww`, `ouu`, `aee`, `oee`, `ii`), `ou` pour /u/, `ai` et `ao`
    pour les diphtongues.
20. Tons de la page 11, tous recoupés sur en.wiktionary : ไป /paj˧/ moyen,
    ตอนเย็น /tɔːn˧.jen˧/ moyen, ตลาด /ta˨˩.laːt̚˨˩/ bas-bas, หนึ่ง /nɯŋ˨˩/ bas,
    ผม /pʰom˩˩˦/ montant, สอง /sɔːŋ˩˩˦/ montant, ครับ /kʰrap̚˦˥/ haut,
    ทุก /tʰuk̚˦˥/ haut, น้องสาว /nɔːŋ˦˥.saːw˩˩˦/ haut puis montant.
21. Paires de référence justes : ปา /paː˧/ contre ป่า /paː˨˩/ ; หมา /maː˩˩˦/
    contre ม้า /maː˦˥/ ; หนี /niː˩˩˦/ contre นี้ /niː˦˥/.
22. Le fil des tons de `CONVENTIONS.md` est respecté : moyen contre bas donné
    comme sur-entraîné en unité 7, montant contre haut en unité 4, les deux
    déclarés **entretenus et jamais acquis**, aucune carte de ton nouvelle.

### Sources

23. RID, 14 graphies déclarées attestées : `rid-lookup.mjs` rend `entree` pour
    แล้ว, คุณ, ล่ะ, ไหม, วัน, นี้, ทุก, ตอน, เช้า, เย็น, เขา, เจอ, กัน, พี่น้อง.
24. Les deux titres groupés annoncés sont exacts : « ทุก ทุกๆ » et « เจอ เจอะ ».
25. RID, 11 contrôles négatifs déclarés : `absent` pour วันนี้, ทุกวัน, ตอนเช้า,
    ตอนเย็น, แล้วคุณล่ะ, แล้วเจอกัน, เจอกัน, สบายดี, ทำงาน, น้องสาว, พี่ชาย.
26. Le décompte 14 + 11 = 25 tient, et il n'est pris nulle part ailleurs.
27. `rid-entry.mjs เขา` rend **cinq vedettes numérotées ๑ à ๕**, la ๔ étiquetée
    ส. et définie comme pronom de troisième personne ; les quatre autres sont des
    noms : monticule, corne, oiseau de la famille Columbidae, liane. La
    description de la leçon est exacte et aucune définition n'est reproduite sur
    un écran d'apprenant, conformément au finding `SENS-MONO` de `u09-l9a`.
28. en.wiktionary เจอกัน : verbe puis interjection à **deux** sens, le second
    étant « used to express a wish or invitation to see or meet someone : see you
    (at that place, on that date, etc) ». L'incertitude 5 le cite avec exactitude
    et sa qualification de mono-sourcé est honnête.
29. en.wiktionary เขา : étymologie 1, Pronoun « he ; she ; they », second sens
    étiqueté `childish`, variante `เค้า` marquée `[informal]`, /kʰaw˩˩˦/ et
    /kʰaw˦˥/, Paiboon `kǎo` et `káo`. Cité exactement. La page porte cinq
    étymologies thaïes, dont la première contient aussi un nom figuré ; la leçon
    a raison de ne pas la compter comme jambe.
30. en.wiktionary : แล้วคุณล่ะ et แล้วเจอกัน rendent bien **HTTP 404**.
31. La section 1 bis est respectée **par construction** : le balayage des quatre
    formules interdites rend quatre zéros sur la portée « écrans », le repère
    `## Dossier de production` étant bien à la ligne 1203. Aucune assertion sur
    la phonétique du français dans le fichier.
32. La section 1 ter n'est pas invoquée à tort : aucun terme de métalangue n'est
    mono-sourcé sur le RID dans la leçon (le seul fait mono-sourcé est celui de
    la note culturelle, finding B5, et il n'est pas métalinguistique).

### Décomptes internes au dépôt

33. `repo-thai-scan.mjs --check-u07` passe, dix chiffres sur dix.
34. `repo-thai-scan.mjs 1 11` rend exactement 55 fichiers, 512 entrées,
    353 graphies, 114 ไม้เอก, 90 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา.
35. `repo-thai-scan.mjs 11 11` rend exactement 5 fichiers, 51 entrées,
    42 graphies, 16 ไม้เอก, 16 ไม้โท.
36. **Quarante** fichiers `lecon-*.md` portent une section `## Dialogue`.
37. **Onze** dialogues de huit répliques, et la liste nominative est exacte :
    `u02-l2e`, `u03-l3e`, `u04-l4d`, `u04-l4e`, `u05-l5e`, `u06-l6e`, `u07-l7e`,
    `u08-l8e`, `u09-l9e`, `u11-l11c`, `u11-l11e`.
38. `u08-l8b` porte bien **neuf** répliques et l'écrit en toutes lettres.
39. `u04-l4c` porte bien **sept** répliques au troisième format.
40. `u11-l11a` porte bien **douze** lignes, dont quatre sont deux phrases
    répétées à deux débits, et **trois** locuteurs. L'argument de continuité de
    11D tient donc, indépendamment du finding N2.
41. Les **neuf doublons de fiche** de l'unité 11 sont exacts, et ma détection les
    retrouve un par un : huit entre `lecon-11b.md` et `lecon-11e.md` (คุณ, ครับ,
    ค่ะ, คะ, ผม, ดิฉัน, ต้น, นก), un entre `lecon-11d.md` et `lecon-11e.md`
    (แล้วคุณล่ะ), les deux fichiers déclarant un réemploi de `u06-l6e` item 2.
    **Aucune collision de publication.**
42. Ce que publient les voisines est décrit exactement : 11B publie คุณพ่อ et
    คุณแม่ en graphies neuves plus deux emplois neufs de พี่ et น้อง ; 11C publie
    และ, แต่ et ก็ plus un emploi neuf de ด้วย ; 11E ne publie rien de neuf.
43. **Aucun énoncé publié du parcours, hors la réplique 11 de 11D, ne réunit deux
    compléments de temps dans une même clause.** Balayage des 55 fichiers sur
    onze blocs de temps. La seule autre cooccurrence est le mot lexicalisé
    ทุกวันนี้ dans le dossier de `u07-l7c`. **L'incertitude 1 est fondée et sa
    gravité n'est pas exagérée.**

### Dialogue et exercices

44. Comptage des particules : ต้น dit ครับ **dix** fois (deux aux répliques 1, 3,
    5 et 9, une aux répliques 7 et 11), นก dit ค่ะ **six** fois et คะ **trois**
    fois, et les trois คะ tombent bien à la fin de ses trois seules questions.
45. Exercice 1 : l'appariement des six places est juste six fois sur six.
46. Exercice 1, hasard pur : 8 × 7 × 6 × 5 × 4 × 3 = 20 160, et 1/20 160 vaut
    bien 0,005 %.
47. Exercice 1, écho lexical : **plafond 2 sur 6 confirmé**, dépouillement refait
    bloc par bloc. ดิฉันไปตลาดตอนเย็นค่ะ partage 2 blocs avec sa vraie place et 3
    avec la place 6 ; มีค่ะ … partage 1 bloc avec sa vraie place et 2 avec la
    place 5 ; สบายดีค่ะ แล้วคุณล่ะคะ est à égalité entre les places 1 et 2 ;
    คุณทำงานที่บ้านทุกวันไหมคะ est à égalité entre les places 2 et 4.
48. Exercice 2 : les trois options de chacun des dix tirages sont bien **du même
    locuteur**, dix fois sur dix, et les trente options sont des répliques
    réelles du dialogue.
49. Exercice 2, position constante : 33,3 % en espérance et
    P(≥ 8/10) = 201/59 049 = **0,34 %**, exact.
50. Exercice 2, écho lexical : juste aux tirages 2, 4 et 7 ; faux aux tirages 3,
    5, 6, 8 et 10 en désignant respectivement les répliques 3, 11, 4, 8 et 6 ;
    égalité au tirage 1 ; aucun signal au tirage 9. Espérance
    3 + 1/2 + 1/3 = **3,83**, plafond **5**. Les cinq désignations fausses sont
    exactes une par une.
51. Exercice 2 : « toujours la plus courte » vaut bien 5 sur 10, aux tirages 1,
    3, 5, 8 et 10 ; « toujours la plus longue » vaut bien 3 sur 10, aux
    tirages 2, 6 et 7.
52. Exercice 3 : chaque réplique est la réponse d'au plus une question, les
    répliques 1 et 2 d'aucune, donc réponse constante ≤ 1 sur 10 ; hasard pur
    10/12 = 0,83 sur 10.
53. Exercice 4 : les six jeux de tuiles se remontent **exactement** en leur
    réplique, y compris le double ครับ du tirage 1 porté par la tuile entière
    สวัสดีครับ ; 120, 720, 720, 120, 720, 720 arrangements et espérance 0,022 ;
    particule finale fixée, 24, 120, 120, 24, 120, 120 et espérance 0,117.
54. Exercice 5 : les huit corrigés sont distincts deux à deux, donc une réponse
    constante vaut au plus 1 sur 8, et chacun est conforme à la transcription du
    dialogue et à la convention v1.1.

---

## Findings

Sept bloquants, cinq non bloquants.

---

### B1. `ECRAN-OUI` (BLOQUANT) : la page 4 affirme que le cours n'a pas de mot pour « oui », alors qu'il en publie un depuis l'unité 5

**Ce qui est écrit,** page 4, texte d'écran :

> Le thaï de ce cours n'a pas de mot pour « oui ». Vous l'avez appris en 9E : on
> répond en reprenant le mot de la question.

**Ce que j'ai mesuré dans le dépôt.** `u05-l5e` item 10 s'intitule
« ครับ (réemploi, enseigné en `u01-l1e` ; **seconde valeur montrée ici**) » et
porte :

- `fr` : particule de politesse d'un homme en fin de phrase ; **et, employé
  seul, oui**
- `note_fr` : « Dit seul, ครับ répond. »
- deux sources concordantes : RID « ครับ » (คำรับ, mot de réponse) et VOLUBILIS,
  deux lignes séparées dont l'une glosée « oui ; ouais (fam.) ».

Cette valeur n'est pas une note de dossier : `u05-l5e` la **montre à l'écran**,
et c'est même l'unique motif d'existence de l'item. Du côté féminin, `u06-l6e`
item 15 relève que le RID définit ค่ะ comme mot de réponse affirmative et que
VOLUBILIS le glose « oui ; d'accord ».

**Pourquoi c'est bloquant.** L'apprenant qui lit la page 4 de 11D a appris six
unités plus tôt qu'un mot de son cours veut dire « oui ». On lui dit maintenant
le contraire, sur un écran, dans une leçon dont l'argument central est
« vous avez déjà tout ». Ce n'est pas une simplification pédagogique : c'est une
affirmation vérifiable et fausse, réfutée par un champ `fr` du dépôt.

**Aggravant, mineur mais du même geste.** La même phrase attribue le procédé à
9E. Le procédé est publié par `u02-l2b` sur สบายดีไหม, puis par `u06-l6e`
réplique 2 (มีค่ะ), et **la leçon l'écrit elle-même** dans son groupe B :
« publié par `u06-l6e` réplique 2 (มีค่ะ) et par `u09-l9e` réplique 7 (ไปครับ) ».
L'écran et le dossier ne disent pas la même chose.

**Correction attendue.** Remplacer par une formulation vraie et plus utile :
« Le thaï n'a pas de “oui” à toutes fins. ครับ et ค่ะ dits seuls répondent, et
l'autre façon, que vous employez depuis 2B et 6E, est de reprendre le mot de la
question. » Aligner ensuite l'attribution sur celle du groupe B.

---

### B2. `ECRAN-ALORS` (BLOQUANT) : la page 2 affirme que le cours n'a pas de mot pour « alors », que `u11-l11c` publie dans la même unité

**Ce qui est écrit,** page 2, texte d'écran :

> **Deux.** Rien n'annonce le virage. Le thaï de ce cours n'a pas de mot pour
> « alors » ou « au fait ».

**Ce que j'ai mesuré.** `content/authoring/unite-11/lecon-11c.md`, item 3,
statut **NOUVEAU** :

- `thai` : ก็
- `fr` : **alors, du coup** (marque que le second morceau découle du premier ; se
  place devant le verbe de ce second morceau)
- instance publiée, item 8 : แพงเกินไปผมก็ไม่เอาครับ, « C'est trop cher, alors je
  ne le prends pas. »

11C appartient à la même unité et la précède dans l'ordre des leçons.

**Ce que la leçon a vu, et ce qu'elle n'a pas fait.** La Méta identifie le
problème avec une honnêteté remarquable, corrige la puce « ce que la leçon
n'ouvre pas », dit que la version précédente était fausse et porte le sujet à
l'arbitrage 7. Elle conclut, à juste titre, que le **dialogue** n'a pas à
recevoir de connecteur : un connecteur à la couture des répliques 7 ou 11
rendrait le virage explicite et détruirait ce que les exercices 1 et 2 mesurent.
Mais elle écrit « la page 2 dit que c'est normal plutôt que de le masquer », et
la page 2 n'a pas été relue : elle porte encore l'absolu.

**Pourquoi c'est bloquant.** Le choix de composition est recevable ; dire à
l'apprenant que le mot n'existe pas dans son cours ne l'est pas. Un finding
déjà signalé et non corrigé sur un écran est plus grave qu'un finding neuf.

**Correction attendue.** Réécrire sans absolu, en gardant le propos :
« Rien n'annonce le virage ici. Le thaï a des mots de liaison, et vous en avez vu
dans cette unité, mais une conversation peut tourner sans aucun d'eux : c'est une
QUESTION qui la fait tourner. »

---

### B3. `ECRAN-PARTICULE-SEULE` (BLOQUANT) : la page 10 fait de la particule finale le seul indice de locuteur, ce que le dialogue et les exercices de la leçon démentent

**Ce qui est écrit.** Page 10, écran :

> Aucun des deux personnages ne redit son prénom après le début. Sur douze
> répliques, ce qui vous dit qui parle est la particule finale, **et elle seule**.

et section Dialogue : « la particule finale est donc **le seul indice de
locuteur** sur douze répliques ».

**Ce que j'ai mesuré sur les douze répliques.** Six d'entre elles portent un
pronom de première personne **genré**, publié par `u02-l2d` items 1 et 2 :

| Réplique    | Pronom | Locuteur      |
| ----------- | ------ | ------------- |
| 3, 5, 9, 11 | ผม     | ต้น, un homme |
| 6, 8        | ดิฉัน  | นก, une femme |

Une réplique sur deux porte donc **deux** indices de locuteur, pas un. Et la
leçon s'en sert elle-même, deux fois :

- exercice 3, « le cœur de l'exercice » : « Ce qui les sépare est le bloc de
  temps … **et le pronom, ผม contre ดิฉัน** » ;
- exercice 5, pièges connus : « écrire `phǒm` au tirage 4, **où la locutrice est
  une femme et dit `dì·chǎn`** » ;
- feedback incorrect de l'exercice 3 : « Et regardez le début : ผม ou ดิฉัน. »

**Pourquoi c'est bloquant.** L'écran enseigne une stratégie d'écoute
(« même si un mot vous échappe, vous savez qui parle ») fondée sur une
exclusivité fausse, et la leçon corrige cette exclusivité trois écrans plus loin
sans jamais la retirer. Un apprenant qui applique la page 10 à la lettre
n'écoutera pas le pronom, qui est précisément le second discriminant que
l'exercice 3 lui demande d'employer. C'est une consigne d'apprentissage
auto-contradictoire, pas une nuance rédactionnelle.

**Aggravant.** « Aucun des deux personnages ne **redit** son prénom après le
début » suppose qu'ils le disent au début. Aucune des douze répliques ne contient
un prénom : ต้น et นก ne sont que des étiquettes de locuteur, exactement comme
`u07-l7e` l'écrit pour son propre dialogue.

**Correction attendue.** « Sur douze répliques, deux choses vous disent qui
parle : la particule finale, présente partout, et le pronom ผม ou ดิฉัน, présent
une fois sur deux. Les prénoms, eux, ne sont jamais prononcés. » La page garde
son intérêt et devient vraie.

---

### B4. `GLOSE-R12` (BLOQUANT) : la réplique 12, déclarée « zéro liberté », change de traduction et y fait entrer le sens mono-sourcé

**Ce qui est écrit.** Section « Ce que le dialogue prend comme liberté »,
groupe A, « réemploi intégral, **zéro liberté** » :

> réplique 12, แล้วเจอกันค่ะ : c'est la réplique 8 du dialogue de `u07-l7e`, mot
> pour mot.

**Ce que j'ai mesuré.** Le thaï et la transcription sont identiques. **Le
français ne l'est pas.**

|               | `u07-l7e` réplique 8 | `u11-l11d` réplique 12 |
| ------------- | -------------------- | ---------------------- |
| Thaï          | แล้วเจอกันค่ะ        | แล้วเจอกันค่ะ          |
| Transcription | láeew·joee·kan khâ   | láeew·joee·kan khâ     |
| Français      | **À plus tard.**     | **À tout à l'heure.**  |

Le champ `fr` de l'item 8 de 11D, recopié sans modification de `u01-l1e` item 5,
dit lui aussi « à plus tard (prise de congé courante) ». La réplique diverge donc
à la fois de la leçon qu'elle déclare recopier et de son propre item.

**Pourquoi c'est bloquant, et ce n'est pas une nuance de style.** « À plus tard »
est indéterminé ; « à tout à l'heure » dit en français **le même jour**. C'est
exactement la lecture que la leçon déclare partout ne PAS enseigner :

- Méta : « Le parcours ne publie AUCUN mot pour “prendre rendez-vous” … Le seul
  appui trouvé pour une lecture de rendez-vous est **mono-sourcé** … et il n'est
  enseigné nulle part » ;
- page 9 : « aucune réplique ne dit “rendez-vous”, “d'accord” ni “à ce soir” …
  Ce qui fait le rendez-vous, c'est l'ordre » ;
- incertitude 5 : le second sens de เจอกัน qui autoriserait cette lecture est
  mono-sourcé. **J'ai confirmé que ce sens existe bien sur en.wiktionary**
  (« invitation to see or meet someone : see you at that place, on that date »)
  et la leçon a raison de ne pas l'enseigner.

La colonne française **dit avec des mots** ce que la page 9 promet de ne faire
porter que par la situation, et elle le dit sur la foi d'une source unique. C'est
une infraction directe à la règle des deux sources, au point exact que la leçon
avait elle-même désigné comme le plus exposé.

**Nuance à porter au dossier, pas à décharge.** Le corpus est incohérent :
`u02-l2e` glose déjà แล้วเจอกันครับ par « À tout à l'heure », tandis que
`u01-l1e` et `u07-l7e` disent « à plus tard ». Cette incohérence est antérieure à
11D et mérite un arbitrage de parcours, mais elle n'autorise pas une réplique
déclarée « mot pour mot » à changer de glose en silence.

**Correction attendue.** Rétablir « À plus tard. », ou sortir la réplique du
groupe A et déclarer la modification comme une liberté à auditer. Ajouter un
arbitrage sur la glose divergente de `u02-l2e`.

---

### B5. `VOLU-KHAO-CINQ-LIGNES` (BLOQUANT) : le relevé Volubilis de เขา contredit le dépôt, et la note culturelle devient mono-sourcée

**Ce qui est écrit.** Note culturelle, seconde jambe du seul fait qu'elle
affirme :

> La base Volubilis fait le même partage, avec cinq lignes pour la même graphie
> et les mêmes valeurs.
> … **lignes 31400 à 31404** … cinq lignes pour la même graphie `เขา`,
> respectivement « mount ; mountain ; hill », « horn … », « dove … », « vine » et
> « he ».

et item 7 : « ligne 31404 … ENG « he », FRA « il » … **Les lignes 31400 à 31403
donnent les quatre sens nominaux** ».

**Ce que le dépôt dit de la même base v26.2.** `u06-l6c` item 1 relève **huit**
lignes pour เขา, dont **quatre pronominales** :

- 32698 à 32701 : les quatre sens nominaux, ThaiPhon `/khao` seul ;
- 32702 et 32704 : `pr. pers.`, ThaiPhon `/khao = ¯khao`, DOM `RID ; TOURIST`,
  FRA « il » puis « elle » ;
- 32703 et 32705 : `pr. pers. (DOP)`, « lui » et « elle ».

**L'arithmétique rend le conflit difficile à écarter.** Le décalage entre les
deux formats est constant sur ce mot : 32698 − 1298 = 31400 et
32702 − 1298 = 31404. Les deux relevés désignent donc **les mêmes lignes**, et
11D reproduit d'ailleurs mot pour mot le contenu que `u06-l6c` donne à 32702
(ThaiPhon `/khao = ¯khao`, TYPE `pr. pers.`, DOM `RID ; TOURIST`). 11D s'arrête
simplement à la première ligne pronominale, là où il devrait en rester trois
(31405 à 31407).

**Conséquences, et il y en a deux.**

1. Si la base porte huit lignes dont quatre pronominales, **le « même partage »
   que le RID n'existe pas** : Volubilis ne découpe pas เขา en cinq. La seule
   jambe restante de la note culturelle est le RID, et le fait devient
   **mono-sourcé**. Ce fait n'est pas métalinguistique : la section 1 ter ne le
   couvre pas, et la règle des deux sources s'applique sans exception.
2. `u06-l6c` fonde le fait « une seule graphie pour il et pour elle » sur
   précisément **deux** lignes glosées « il » et « elle ». Le relevé de 11D n'en
   connaît qu'une, glosée « il ». 11D recopie pourtant `fr : il, elle (la
personne dont on parle)`. **Une des deux jambes du champ `fr` d'un réemploi
   disparaît sans que la leçon le remarque**, ce qui est exactement le défaut de
   priorité 1 que `item-fields-check.mjs` ne peut pas voir.

**Ce que je n'ai PAS pu faire, et il faut le dire.** Je n'ai pas pu trancher par
mesure directe : le classeur n'est pas versionné et les trois adresses de
téléchargement essayées répondent 404. Mais un conflit non arbitré entre deux
relevés du dépôt sur la même base, sur un fait qui porte une note culturelle
entière, ne peut pas franchir une porte de publication ; et l'amendement v1.2
exige qu'un tiers puisse refaire la consultation, ce qu'aujourd'hui il ne peut
pas.

**Correction attendue.** Reverser l'artefact ou une adresse qui fonctionne
(arbitrage 1, quatrième demande), relever de nouveau เขา, réconcilier
explicitement avec `u06-l6c`. Tant que ce n'est pas fait, ramener la note
culturelle à sa jambe RID, que j'ai reconfirmée par `rid-entry.mjs` et qui est
solide, et retirer l'affirmation Volubilis.

---

### B6. `EX2-CORRIGE-5-10` (BLOQUANT) : deux tirages de l'exercice 2 ont un leurre aussi juste que la clé, et la leçon le démontre elle-même

**Ce qui est écrit.** Consigne de l'exercice 2 : « Écoutez. **Laquelle de ces
trois répliques peut venir juste après ?** »

**Tirage 5.** Joué ดิฉันไปตลาดตอนเย็นค่ะ (réplique 6). Clé :
คุณมีพี่น้องไหมครับ (réplique 7). Leurre : **วันนี้ผมไปตลาดตอนเย็นครับ**
(réplique 11).

**Tirage 10.** Joué วันนี้ผมไปตลาดตอนเย็นครับ (réplique 11). Clé :
แล้วเจอกันค่ะ (réplique 12). Leurre : **ดิฉันไปตลาดตอนเย็นค่ะ** (réplique 6).

**Ce que la leçon dit du même couple, page 8, écran :**

> À la réplique 6, นก a dit qu'elle va au marché le soir. Cinq répliques plus
> loin … ต้น y revient. … Le lien tient parce que les deux répliques emploient
> les mêmes mots.

et feedback du tirage 9 : « Cette réplique **ne répond pas à ce qui vient d'être
dit** : elle rouvre un sujet laissé cinq répliques plus tôt. »

**Pourquoi c'est bloquant.** La leçon enseigne explicitement que la réplique 11
est une **réponse** à la réplique 6. Sous une consigne qui demande ce qui **peut**
venir juste après, et non ce qui vient effectivement après dans ce dialogue-ci,
un apprenant qui a compris la page 8 choisira le leurre au tirage 5, et il aura
raison : « Moi je vais au marché le soir. » → « Aujourd'hui je vais au marché le
soir. » est un enchaînement parfaitement cohérent, c'est même celui que la leçon
met en scène. Le tirage 10 est le miroir exact. **On pénalise l'apprenant qui a
retenu l'écran le plus important de la leçon.**

**Effet de bord sur les planchers, qui sont par ailleurs justes.** Le
dépouillement d'écho compte les tirages 5 et 10 comme deux échecs de la stratégie
(« elle désigne les répliques 11 et 6 »). Si ces deux cartes sont acceptables,
l'espérance de l'écho lexical n'est plus 3,83 mais 5,83 sur 10, et son plafond
n'est plus 5 mais 7 sur 10, pour un seuil fixé à 8. La marge de l'exercice
devient un seul tirage.

**Correction attendue.** Une des deux, pas les deux à moitié. Soit reformuler la
consigne en « Laquelle vient juste après **dans cette conversation** ? », ce qui
change ce que l'exercice mesure et oblige à revoir la Méta. Soit remplacer les
deux leurres incriminés par des répliques qui ne peuvent pas suivre, et
**recalculer les quatre planchers** de l'exercice.

---

### B7. `EX5-REPLIQUE-ENTIERE` (BLOQUANT) : l'exercice 5 exige la réplique entière et corrige des fragments

**Ce qui est écrit.**

> l'apprenant lit une consigne française qui décrit un MOMENT de la conversation,
> et **produit la réplique entière** en transcription, accent de ton compris.

Politique de saisie : « alphabet latin uniquement, casse ignorée, espaces de
début et de fin ignorés ». Aucune tolérance sur le contenu.

**Ce que j'ai mesuré.** **Cinq** corrigés sur huit ne sont pas des répliques
entières mais des segments :

| Tirage | Consigne                                      | Corrigé                              | Réplique réelle                             |
| ------ | --------------------------------------------- | ------------------------------------ | ------------------------------------------- |
| 1      | « นก répond qu'elle va bien. »                | `sà·baai·dii khâ`                    | R2 = `sà·baai·dii khâ · láeew khoun lâ khá` |
| 2      | « นก rend la parole. »                        | `láeew khoun lâ khá`                 | l'autre moitié de la même R2                |
| 3      | « ต้น dit qu'il va au marché le matin. »      | `phǒm pai tà·làat tawwn·cháao khráp` | R5 = `thóuk·wan khráp · phǒm pai …`         |
| 6      | « นก répond oui, en un mot. »                 | `mii khâ`                            | R8, trois segments                          |
| 7      | « ต้น dit que son frère aîné est en France. » | `khǎo yòuu thîi fà·ràng·sèet khráp`  | R9 = `phǒm mii phîi·chaai … · khǎo yòuu …`  |

Le tirage 6 se sauve par « en un mot ». Les tirages 1, 3 et 7 non, et les
tirages 1 et 2 découpent la **même** réplique en deux réponses attendues, ce qui
rend l'ambiguïté structurelle et non accidentelle.

**Pourquoi c'est bloquant.** Un apprenant qui applique la consigne écrite et
produit la réplique entière au tirage 1 est marqué faux **alors qu'il a raison**,
et le feedback qu'on lui renverra portera sur un accent de ton qu'il a
correctement posé. C'est un corrigé qui pénalise la bonne réponse.

**Correction attendue.** Soit remplacer « produit la réplique entière » par
« produit ce que la consigne décrit » et désambiguïser les consignes 1, 3 et 7,
soit accepter la réplique entière comme variante correcte et l'écrire dans la
politique de saisie. Ne pas laisser le correcteur serveur arbitrer.

---

### N1. `LEX-32-VS-37` (non bloquant) : la couverture lexicale annonce 32 blocs et en liste 37

**Ce qui est écrit,** trois fois : « Trente-deux blocs distincts sont employés »,
« les trente-deux blocs employés par le dialogue gardent leurs cartes d'origine »,
« Trente-deux blocs distincts, tous publiés avant l'unité 11 ».

**Ce que j'ai compté**, par script, sur la liste qui suit immédiatement :

```
unité 1 (3)  : ครับ ค่ะ แล้วเจอกัน
unité 2 (12) : สวัสดีครับ สบายดีครับ สบายดีค่ะ สบายดี ไหม คะ ผม ดิฉัน คุณ ฝรั่งเศส ต้น นก
unité 3 (3)  : หนึ่ง สอง คน
unité 4 (1)  : มาก
unité 5 (4)  : ไป อยู่ ตลาด ไกล
unité 6 (8)  : พี่ชาย น้องสาว มี เขา พี่น้อง แล้วคุณล่ะ อยู่ที่ฝรั่งเศส ไกลมาก
unité 7 (6)  : ตอนเช้า ตอนเย็น ทุกวัน ทำงาน ที่บ้าน วันนี้
```

3 + 12 + 3 + 1 + 4 + 8 + 6 = **37**, et 37 pointeurs `uXX-lYz` dans la section.

**Aggravant.** Deux des 37, ต้น et นก, ne sont prononcées dans **aucune**
réplique. Les compter parmi « les blocs employés par le dialogue » est faux
indépendamment du total.

**Ce qui n'est pas en cause.** J'ai vérifié les 37 attributions une par une :
elles pointent toutes vers un item existant. **La décodabilité, elle, est
intacte** ; c'est le cardinal qui est faux.

**Pourquoi ce n'est pas bloquant, mais doit être corrigé.** Le chiffre porte la
phrase « Compréhension : 100 % du lexique du dialogue est couvert » et définit le
périmètre « hors périmètre » de la section SRS. Un périmètre SRS défini par un
cardinal faux n'est pas exécutable tel quel à la consolidation.

**Correction attendue.** Écrire 35 blocs réellement prononcés, plus les deux
prénoms d'étiquette comptés à part, et refaire les trois occurrences.

---

### N2. `DIALOGUE-11B-DIX` (non bloquant) : `u11-l11b` a dix répliques, pas onze, et quatre voisines portent un dialogue, pas trois

**Ce qui est écrit,** deux fois : « `u11-l11b` affiche **onze** lignes réparties
en DEUX panneaux séparés » et « Dans l'unité 11, `u11-l11a` en affiche douze,
`u11-l11b` **onze** et `u11-l11d` douze ». Plus, en Méta : « **trois** voisines
de l'unité 11 … en ont douze, onze et huit ».

**Ce que j'ai mesuré.** `lecon-11b.md` porte **dix** répliques numérotées de 1 à
10, cinq au panneau A et cinq au panneau B. Ses quatorze lignes de tableau se
décomposent en 2 en-têtes + 2 séparateurs + **10** répliques. Et **quatre**
voisines portent un dialogue, pas trois : 11A douze lignes, 11B dix, 11C huit,
11E huit. La leçon le sait d'ailleurs ailleurs, puisqu'elle range 11C et 11E dans
sa liste des onze dialogues à huit répliques.

**Origine probable.** 11B écrit « onze » pour ses **items** (« quinze items :
quatre neufs et onze réemplois »). Un « onze » d'items a été lu comme un « onze »
de répliques.

**Ce qui survit.** La conclusion de fond tient et je l'ai vérifiée : 11A a douze
lignes mais **trois** locuteurs et quatre lignes répétées ; 11B est coupée en
deux panneaux ; 11D reste bien le plus long échange continu à deux du parcours,
devant les neuf répliques de `u08-l8b`.

---

### N3. `EX1-DEJA-DONNE` (non bloquant) : quatre des six appariements de l'exercice 1 sont donnés en toutes lettres par les pages d'enseignement

**Ce qui est écrit.** Exercice 1 : « Ce qu'il mesure : la tenue du fil, **et elle
seule** … **L'apprenant n'a jamais lu le dialogue avant cet exercice.** »

**Ce que j'ai mesuré,** page par page, sur les six places à remplir :

| Place | Couple attendu | Donné avant l'exercice ?                                                                  |
| ----- | -------------- | ----------------------------------------------------------------------------------------- |
| 2     | R3 → R4        | partiellement, page 4 montre R4 → « ทุกวันครับ »                                          |
| 4     | R7 → R8        | **oui**, page 4 : « คุณมีพี่น้องไหมครับ → มีค่ะ » ; page 5 remontre R7                    |
| 5     | R9 → R10       | **oui**, pages 6 et 7 : เขาอยู่ที่ฝรั่งเศสครับ puis ไกลมากค่ะ, avec l'explication du lien |
| 6     | R11 → R12      | **oui**, page 9 affiche les deux répliques l'une sous l'autre                             |
| 3     | R5 → R6        | la page 8 affiche R6 et R11 côte à côte                                                   |

L'affirmation « n'a jamais lu le dialogue » est littéralement vraie, et
trompeuse : l'apprenant n'a pas lu la conversation dans l'ordre, mais il a lu
quatre des six couples, dont deux affichés comme des paires.

**Pourquoi c'est un finding malgré tout.** Les cinq planchers de l'exercice sont
calculés contre des heuristiques aveugles (réponse constante, hasard, écho
lexical) et **aucun ne modélise la mémoire des pages d'enseignement**, qui est de
loin la stratégie la plus rentable ici. Le seuil de 6 sur 6 devient atteignable
sans avoir suivi le fil.

**Correction attendue.** Soit déplacer les couples des pages 7, 8 et 9 vers
l'après-exercice, soit reconnaître la fuite dans la section « ce que l'exercice
mesure » et rétrograder la revendication « la tenue du fil, et elle seule ».

---

### N4. `HABITUDE-NON-SOURCEE` (non bloquant) : une règle de discours non sourcée porte la fin du dialogue, et une liberté est classée en groupe B

**Premier point.** Item 4, champ `note_fr` :

> นก demande ทุกวันไหมคะ à la réplique 4, ต้น répond ทุกวันครับ à la 5, et **à
> partir de là tout ce qu'il dit au présent se lit comme une habitude**, sauf ce
> qui porte วันนี้.

C'est une règle de portée discursive, affirmée sans source, et elle est
**load-bearing** : c'est elle qui fait que la réplique 5 se lit « je vais au
marché le matin, d'habitude » et que la réplique 11 se lit comme un plan. Or
ทุกวัน répond à une question sur le TRAVAIL À LA MAISON, et la phrase suivante
change de sujet pour le marché. Rien dans les sources du dossier n'établit que le
cadre habituel se propage ainsi. À rapprocher de l'incertitude 2, qui reconnaît
que le parcours n'enseigne aucun temps.

**Second point.** Groupe B, réplique 5 :

> la première applique le patron « répondre en reprenant le mot de la question »,
> publié par `u06-l6e` réplique 2 (มีค่ะ) et par `u09-l9e` réplique 7 (ไปครับ).

J'ai vérifié les deux précédents : **ils reprennent tous deux un VERBE**. La
réplique 5 reprend un **adverbial de temps** (ทุกวันครับ). C'est une extension du
patron à une autre partie du discours, pas une « substitution dans une fente que
la leçon d'origine remplit elle-même », qui est la définition du groupe B donnée
par la leçon. La liberté n'est donc pas déclarée, et l'affirmation « Groupe C, la
seule composition inédite. **Une** réplique » s'en trouve affaiblie.

**Correction attendue.** Reformuler la note de l'item 4 en observation
(« ต้น a dit ทุกวัน juste avant : c'est ce qui vous fait entendre la suite comme
une habitude ») et déplacer la première phrase de la réplique 5 en groupe C, ou
créer un groupe B bis pour les extensions de patron, avec renvoi à l'audit de
naturalité.

---

### N5. `PARENTE-U11` (non bloquant) : ต้น et นก ont trois parentés incompatibles dans la même unité, et la section de coordination ne le voit pas

**Ce que j'ai mesuré dans les cinq fichiers de l'unité 11 :**

- `u11-l11b`, panneau B, réplique 6 : **พี่ชายชื่อต้นค่ะ**, Nok présente Ton comme
  son **frère aîné** ;
- `u11-l11e`, en tête de dialogue : « **ต้น (Ton), un homme.** Il est le cadet,
  น้อง, de Nok. **นก (Nok), une femme.** Elle est l'aînée, พี่, de Ton » ;
- `u11-l11d`, répliques 7 à 9 : les deux se **découvrent** mutuellement une
  fratrie. Ton a un frère aîné en France, Nok a deux sœurs cadettes, et ni l'un
  ni l'autre ne mentionne l'autre comme membre de sa fratrie.

Les trois lectures sont deux à deux incompatibles, et 11B précède 11D.

**Ce qui n'est pas en cause pour 11D.** `u02-l2e` items 12 et 13 n'établissent
aucune parenté, la scène de 11D (deux voisins) est donc licite en elle-même, et
le personnage de 11D est cohérent avec l'emploi que `u09-l9e` décrit pour ces
deux prénoms.

**Pourquoi c'est un finding.** La section « Coordination d'unité » de 11D est
minutieuse : elle relève neuf doublons de fiche, le recouvrement de fond avec
11A, l'arrivée des trois connecteurs de 11C, et déclare avoir relu les sections
`## Items` des quatre voisines le 2026-08-04. Elle passe à côté d'une
contradiction que l'apprenant, lui, rencontrera en deux leçons d'intervalle. Cela
renforce l'arbitrage 4 plus qu'aucun des faits déjà cités.

**Correction attendue.** Ajouter le point à l'arbitrage 4 et demander à la
consolidation de fixer une fois pour toutes le statut de ต้น et นก : personnages
récurrents avec une biographie, ou étiquettes de locuteur sans continuité.

---

## Points mineurs, consignés sans numéro de finding

- **Méta et page 11 ne s'accordent pas.** La Méta annonce que la page 11 rejoue
  « ปา contre ป่า **et ปู contre ปู่** » et « หมา contre ม้า **et หนี contre
  นี้** ». La page 11 ne montre que ปา/ป่า et หมา/ม้า. Les deux autres paires
  n'apparaissent que dans les apports SRS.
- **« sur les cinquante fichiers de leçon »** (groupe C) alors que le corpus en
  compte 55 au moment du même dossier. Mon propre balayage des 55 confirme
  néanmoins la conclusion.
- **« le seul qui change de sujet deux fois »** est une exclusivité sur quarante
  dialogues affirmée sans méthode. Le balayage documenté compte des répliques,
  pas des sujets. `u07-l7e` enchaîne santé, marché, nourriture, prix, congé, et
  `u11-l11e` enchaîne santé, prénoms, direction. À rétrograder ou à mesurer.
- **La réplique 9 porte quatre empilements de profondeur 2, pas trois.** La
  section Unicode nomme พี่, หนึ่ง et ฝรั่งเศส et oublie le ที่ de
  อยู่ที่ฝรั่งเศส, qu'elle avait pourtant listé deux lignes plus haut. Le fond
  (profondeur 2, cinq graphies) est confirmé ; c'est l'exemple qui est
  sous-compté, sur la carte la plus longue de l'exercice 1.
- **Exercice 3, tirage 9** : « Quelle réplique réagit à **cette** distance ? »
  n'a aucun antécédent, puisque l'exercice pose que les dix questions sont
  affichées dans un ordre aléatoire.
- **Note culturelle** : « personne, en thaï, n'hésite une seconde » est un absolu
  psycholinguistique qu'aucune source du dossier ne mesure, dans une note qui
  vient d'écrire qu'elle n'affirmera rien de non mesuré.

## Ce que je ne peux pas conclure, et pourquoi

- **Les treize numéros de ligne VOLUBILIS.** Le classeur n'est pas versionné,
  l'adresse répond 404. Aucun n'a pu être recomputé ni infirmé. Seul celui de
  เขา est signalé, parce qu'il entre en conflit avec un relevé du dépôt
  (finding B5). Les douze autres restent **en suspens, et non validés** ; leur
  seul appui est la cohérence de tri décrite en tête de ce rapport.
- **La naturalité du dialogue à douze tours.** J'ai confirmé que la réplique 11
  est sans précédent dans le corpus, ce qui rend l'incertitude 1 réelle et bien
  placée en tête du lot externe. Je n'ai aucun moyen de dire si un locuteur natif
  l'accepte, pas plus que pour la réplique 6 donnée sans qu'on la demande ni pour
  la réplique 8 qui cumule trois gestes.
- **Le degré de respect que porte เขา** (incertitude 3, héritée de 6C). Aucune
  source de la politique ne le mesure. La reprise du champ `registre` tel quel,
  avec redirection du renvoi dans `note_fr`, est la bonne décision et je la
  confirme comme conforme au contrôle de réemploi.
- **Le registre de ดิฉัน + คุณ entre deux voisins qui se croisent dans la rue.**
  Aucune source de la politique ne mesure ce degré de formalité. C'est une
  question pour la revue native, pas pour cet audit ; elle est couverte par la
  ligne « Naturalité : NON VÉRIFIÉE » du tableau des audits.

## Verdict

**Sept findings bloquants.** Trois portent une affirmation fausse sur un écran
d'apprenant (B1, B2, B3), deux portent un corrigé qui pénalise une bonne réponse
(B6, B7), un porte une glose qui fait entrer un sens mono-sourcé dans une
réplique déclarée sans liberté (B4), un porte la seule jambe restante d'une note
culturelle et sa recomputabilité (B5).

Le reste du fichier est d'une solidité inhabituelle et il faut le dire aussi
nettement que les défauts. **Les huit réemplois sont fidèles au caractère près,
y compris sur les trois champs que le script ne contrôle pas** ; les 25 relevés
RID sont exacts à l'unité, y compris les deux titres groupés et les onze
contrôles négatifs ; les entrées Wiktionary sont citées sans embellissement, et
le seul sens qui arrangerait la leçon est explicitement déclaré mono-sourcé et
non enseigné ; la décodabilité du dialogue est intégrale ; les neuf doublons de
fiche et les trois décomptes de corpus se reproduisent au chiffre près ; et les
planchers des cinq exercices, y compris les deux dépouillements d'écho lexical
que la leçon avait d'abord écrits faux, sont tous exacts après recalcul
indépendant.

Les erreurs trouvées ne sont pas dans la matière linguistique. Elles sont dans
quatre phrases d'écran, deux corrigés, une glose française et deux cardinaux,
c'est-à-dire dans les endroits que ce dossier avait les moyens d'attraper et
qu'aucun de ses scripts ne regarde.
