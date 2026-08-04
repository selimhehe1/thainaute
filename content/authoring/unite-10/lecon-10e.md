# Leçon 10E : Une rue thaïe

## Méta

- Identifiant : `u10-l10e`
- Titre français : Une rue thaïe
- Objectif observable : à la fin de la leçon, devant huit supports construits
  affichés en thaï seul, sans transcription et sans audio préalable, l’apprenant
  annonce ce que porte chacun, sur 7 cibles sur 8 ; il apparie six chiffres
  thaïs à leur valeur, 6 sur 6 ; il désigne à l’écoute la carte qui porte le mot
  entendu, sur 7 sur 8 ; il écrit en transcription six des mots lus, accent de
  ton compris, sur 5 sur 6, sans les avoir entendus avant de répondre ; et il
  assemble la question à poser après lecture, sur 3 énoncés sur 4.
- Nature : leçon E de l’unité 10, récapitulatif de lecture et bilan. L’unité 10
  ouvre le fil LECTURE APPLIQUÉE : tout l’alphabet, tous les tons et toutes les
  marques ont été enseignés des unités 1 à 9, et 9A a posé la dernière question
  d’écriture ouverte, celle des finales et du signe ◌์. **Cette leçon n’enseigne
  aucune lettre nouvelle, aucun signe nouveau et aucune règle de lecture
  nouvelle.** Elle fait LIRE du thaï, et elle ne mesure que cela.
- **Coordination d’unité, et il faut le dire avant tout le reste. Le relevé a été
  fait TROIS fois, et il a changé à chaque fois.**
  - **Avant rédaction**, `node scripts/verification/repo-thai-scan.mjs 10 10`
    rend **0 fichier, 0 entrée et 0 graphie** : aucune des leçons 10A à 10D
    n’existe alors dans le dépôt. Tout ce fichier a été conçu et écrit dans cet
    état, c’est-à-dire **sans pouvoir lire les quatre leçons dont il est censé
    faire le bilan**. C’est la situation que `lecon-9e.md` avait déclarée pour
    l’unité 9, et que le contre-audit de `u09-l9a` a ensuite dû réparer par cinq
    arbitrages d’attribution.
  - **Juste après rédaction**, la même commande rend 2 fichiers : `lecon-10c.md`,
    « Lire un menu », est apparue pendant la session, écrite en parallèle.
  - **Au relevé suivant, l’unité est complète**, 5 fichiers, 34 entrées et
    31 graphies distinctes avant correction. 10A, 10B et 10D étaient apparues à
    leur tour. Le tableau des cinq leçons, relevé le 2026-08-04 :
    - `lecon-10a.md` reliste huit graphies déjà publiées par les unités 1 à 9,
      สอง, จาน, แพง, ป่า, ง่าย, ห้า, แล้ว et รถ, et n’en publie aucune de neuve ;
    - `lecon-10b.md`, « Les mots qu’on voit partout », publie ทาง, ออก, ทางเข้า,
      ทางออก, **เปิด**, **ปิด**, ห้าม et ห้ามเข้า ;
    - `lecon-10c.md`, « Lire un menu », publie **cinq** graphies neuves, หมู,
      ราคา, อาหาร et les deux blocs ข้าวผัดหมู et ข้าวผัดไก่, et n’en reliste
      que **trois**, ข้าวผัด, บาท et ห้าสิบบาท. Le contre-audit interne du
      2026-08-04 a corrigé ici une erreur de cette Méta, qui rangeait les deux
      blocs parmi les réemplois : `repo-thai-scan.mjs 1 9 --grep` rend
      **0 occurrence** pour ข้าวผัดหมู comme pour ข้าวผัดไก่, relevé refait à la
      consolidation, ce qui établit qu’elles sont neuves. L’arbitrage 7 disait
      déjà « 10C en place trois » : les deux passages concordent désormais ;
    - `lecon-10d.md` publie ราคา, กิโล, ขีด, ครึ่ง, ชั้น, นาฬิกา, ชั่วโมง et
      นาที ;
    - `lecon-10e.md`, ce fichier, ne publie plus rien, voir ci-dessous.
  - **Une collision réelle a été trouvée, et 10E l’a corrigée chez elle.** 10B
    publie เปิด et ปิด, exactement les deux mots que ce fichier proposait. La
    règle d’attribution du dépôt donne la publication à la leçon la plus précoce.
    **L’arbitrage annoncé par la version antérieure de cette Méta a donc été
    EXÉCUTÉ dans ce fichier** : les deux blocs sont sortis de `## Items` et rangés
    au spécimen 3 comme réemplois de `u10-l10b`. Deux vérifications indépendantes
    de ces deux mots existent donc dans le dépôt, celle de 10B et celle de 10E,
    et `item-fields-check.mjs` rend **0 écart** entre elles sur les cinq champs
    comparés. Le relevé refait après correction donne 32 entrées et 31 graphies.
  - **Une collision reste, et elle ne relève pas de ce fichier** : ราคา est
    publié par 10C et par 10D. Une leçon ne réécrit pas la Méta d’une autre : le
    point est signalé à l’arbitrage 8, pas corrigé ici.
  - **Ce fichier n’a PAS été réécrit pour intégrer le vocabulaire de 10C et de
    10D, et le motif est écrit.** ราคา le prix, อาหาร la nourriture, หมู le porc,
    ทางเข้า et ทางออก auraient fait de bons spécimens, et ราคา irait
    particulièrement bien en tête du tableau de prix du spécimen 7. Mais ces
    fichiers apparaissaient et changeaient pendant la session, et bâtir un
    spécimen sur une cible mouvante est exactement la manœuvre qui a produit les
    cinq collisions de l’unité 9. Seule la correction d’attribution, qui touche
    une erreur avérée, a été faite à chaud. L’enrichissement est proposé à la
    consolidation. Voir l’arbitrage 6.
  - **Un point de convention est signalé, sans être corrigé.** 10A et 10C
    relistent leurs réemplois **à l’intérieur** de `## Items`, huit pour 10A et
    trois pour 10C, en les marquant honnêtement, et `item-fields-check.mjs` rend
    0 écart sur elles : leurs champs sont fidèles. Mais `repo-thai-scan.mjs`, qui ne balaye que `## Items`, compte
    de ce fait onze graphies au crédit de l’unité 10 alors que les unités 1 à 9
    les publient. 10E place les siennes hors de `## Items`. **Les leçons de
    l’unité 10 emploient donc deux conventions différentes pour le même geste**,
    et le décompte de graphies d’une unité dépend de ce choix. Voir
    l’arbitrage 7.
    Trois conséquences sont tirées ici, plutôt que masquées :
  1. **Le vocabulaire de cette leçon est pris dans les unités 1 à 9 seulement.**
     Le relevé du 2026-08-04, `repo-thai-scan.mjs 1 9`, donne 45 fichiers,
     429 entrées et 317 graphies distinctes ; les douze graphies affichées par
     les spécimens du jour ont toutes été retrouvées dans ce corpus par
     `repo-thai-scan.mjs 1 9 --grep <graphie>`, avec le fichier qui les publie.
     Le détail est au dossier de production. **Aucun mot propre à l’unité 10
     n’est employé par un spécimen**, à la seule exception de เปิด et ปิด, que
     10B publie et que le spécimen 3 réemploie. La consigne d’unité demande de
     n’employer que du vocabulaire des unités 1 à 10 : se restreindre aux
     unités 1 à 9 plus deux mots de 10B est un sous-ensemble strict de ce qui est
     permis, et c’est ce que la leçon fait.
  2. **10E ne publie aucun item.** Le relevé des unités 1 à 9 rendait
     **0 occurrence** pour เปิด comme pour ปิด, ce qui les rendait neufs pour le
     parcours ; mais 10B les publie, et la règle d’attribution du dépôt donne la
     publication à la leçon la plus précoce. L’arbitrage a été exécuté dans ce
     fichier, et la section `## Items` en explique le détail. La contrainte
     « pas plus de deux items nouveaux » est donc respectée par zéro, ce que
     `repo-thai-scan.mjs 10 10` vérifie mécaniquement.
  3. **Le bilan SRS de l’unité est écrit comme une DEMANDE, pas comme un acte.**
     Une carte de bilan d’unité doit tirer dans le vocabulaire des cinq leçons.
     Les quatre autres n’étaient lisibles qu’après la rédaction, et 10E n’a donc
     pas pu concevoir son tirage sur elles. Ce qu’elle peut écrire, elle l’écrit ;
     ce qu’elle ne peut pas savoir, elle le laisse en attente et le dit.
- Prérequis, et ils sont nombreux parce que la leçon ne fait que réemployer :
  - leçon 1A : les neuf consonnes moyennes, dont ต, ด et ป, et l’appui muet อ ;
  - leçon 1C : la paire ปา contre ป่า, moyen contre bas, rejouée page 12 ;
  - leçon 1D : la paire หมา contre ม้า, montant contre haut, rejouée page 12 ;
  - leçon 2C : ขอโทษ et น้ำ, ce dernier lu au tableau de prix du jour ;
  - leçon 3B : les dix chiffres thaïs ๐ à ๙, et la lecture des dizaines. C’est
    LE prérequis des spécimens 7 et 8 ; sans lui, un prix n’est pas lisible ;
  - leçon 3C : บาท, lu deux fois aujourd’hui, et les blocs de prix ห้าสิบบาท et
    สิบห้าบาท ;
  - leçon 3E : ไข่, lu au tableau de prix ;
  - leçon 4C : ข้าวผัด, lu au tableau de prix, et le bloc
    ขอข้าวผัดสองจานหน่อยครับ, reconstruit à l’exercice 5 ;
  - leçon 4A : la règle du ton en syllabe vivante, et surtout l’avertissement de
    sa page 6, que เ, แ, โ, ใ et ไ s’écrivent AVANT la consonne qu’elles
    accompagnent. Cet avertissement porte la page 3 du jour ;
  - leçon 5A : la valeur des finales du côté du SON ;
  - leçon 5C : ห้องน้ำ et le bloc ห้องน้ำอยู่ที่ไหนครับ ;
  - leçon 5D : ตลาด et รถเมล์, deux des huit spécimens, et le bloc
    ผมไปตลาดครับ, reconstruit à l’exercice 5. 5D avait signalé, sans
    l’enseigner, que ตลาด « se lit d’une manière que le parcours n’a pas encore
    enseignée » : la page 3 du jour reprend ce constat sans l’ouvrir davantage ;
  - leçon 5E : ตรงไป, et ไม่ไกล ;
  - leçon 8A : เสื้อ, lu à l’étiquette du jour, et la distinction entre une
    lettre finale et une lettre qui appartient au graphème vocalique ;
  - leçon 8E : le bloc ตัวนี้เท่าไรครับ, reconstruit à l’exercice 5, et le prix
    เก้าสิบบาท, repris tel quel à l’étiquette du jour ;
  - leçon 9A : LE prérequis de lecture. Les familles de finales, le signe ◌์ et
    la lettre éteinte, et le geste de lecture en trois temps de sa page 14. 10E
    ne fait que l’appliquer à des supports entiers ;
  - leçon 9D : ร้านขายยา, l’un des huit spécimens, et le bloc
    ร้านขายยาอยู่ที่ไหนครับ, reconstruit à l’exercice 5.
- Cible phonétique : aucun son nouveau. Les deux mots de 10B relus aujourd’hui,
  เปิด et ปิด, n’emploient que des sons déjà enseignés, et leur seule difficulté est de les
  distinguer l’un de l’autre à la lecture comme à l’écoute. **Ce qui les sépare
  est un contraste de VOYELLE, et non une même voyelle en deux longueurs** :
  เปิด porte le `oee` de เกินไป, long, et ปิด le `i` de สิบ, bref. La leçon
  nomme les deux partout où elle explique le contraste, jamais « la longue et la
  brève ». La leçon entretient
  les deux contrastes durs du parcours, conformément au fil des tons de
  `CONVENTIONS.md` :
  1. **moyen contre bas**, sur-entraîné en unité 7. Repère rejoué page 12 : ปา
     contre ป่า (`u01-l1c`). Mots lus aujourd’hui qui le portent : ยา au ton
     moyen, dernière syllabe de ร้านขายยา, contre บาท et ไข่ au ton bas ;
  2. **montant contre haut**, sur-entraîné en unité 4. Repère rejoué page 12 :
     หมา contre ม้า (`u01-l1d`). Le mot ร้านขายยา porte les deux dans le même
     souffle, ráan au ton haut puis khǎai au ton montant.
     **Ces deux contrastes sont entretenus, jamais supposés acquis.** La leçon
     les rappelle avant les exercices et n’en déclare aucun acquis.
- Ce que la leçon enseigne, et c’est peu, volontairement :
  1. **un geste de lecture, appliqué à un support entier plutôt qu’à un mot
     isolé** : trouver la CONSONNE INITIALE de chaque syllabe, puis sa voyelle,
     puis ce qui ferme, puis le ton. Le point dur est le premier, et il est
     répété partout dans ce fichier sous la même forme : **la règle du ton se lit
     sur la consonne INITIALE, jamais sur « la première lettre » du mot.** Les
     deux ne coïncident pas dans **quatre** des douze graphies affichées
     aujourd’hui, เปิด, โรงพยาบาล, ไข่ et เสื้อ ; une cinquième, รถเมล์, est dans
     ce cas à sa SECONDE syllabe et non à la première. Décompte refait
     mécaniquement à la consolidation sur les douze séquences NFC du dossier ;
  2. **rien d’autre.** La leçon ne publie aucun mot. Les deux qu’elle fait le
     plus travailler, เปิด et ปิด, sont publiés par 10B, et elle les reprend
     parce qu’ils forment le contraste de lecture le plus court possible : même
     consonne initiale ป, même lettre finale ด, même ton bas, et une seule
     différence, la voyelle. **Deux voyelles distinctes, pas deux longueurs** :
     `oee` long dans เปิด, `i` bref dans ปิด.
- Ce que la leçon N’ouvre PAS, et il faut être précis :
  - **le ton d’une syllabe fermée par `k`, `t` ou `p` reste hors programme.**
    Les deux mots repris de 10B sont exactement de ce type : เปิด et ปิด se ferment
    tous deux sur un ด. Leurs tons sont donc DONNÉS par les sources, jamais
    déduits, comme l’avaient fait `u08-l8a` pour กระเป๋า et `u09-l9a` pour cinq
    de ses huit items. **L’incertitude 6 de `u09-l9a` demandait précisément que
    ce manque soit arbitré au niveau de l’unité 10.** 10E ne l’arbitre pas, et
    et les quatre autres leçons de l’unité, relues le 2026-08-04, ne l’ouvrent
    pas davantage : 10B donne elle aussi les tons de เปิด et de ปิด. Le point est
    re-signalé
    plutôt que tranché, voir l’incertitude 3 ;
  - **la consonne de tête, ce que le thaï appelle อักษรนำ, n’est pas ouverte.**
    Elle commande pourtant la lecture de ตลาด, spécimen 1, dont le dictionnaire
    donne la lecture [ตะหฺลาด]. La leçon donne cette lecture, elle ne la fait
    pas calculer. `rid-lookup.mjs` rend d’ailleurs `absent` pour อักษรนำ et pour
    พยัญชนะต้น, constat déjà fait par `u08-l8a` et `u09-l9a` ;
  - **la syllabation savante n’est pas ouverte** : elle commande พยาบาล dans
    โรงพยาบาล, et `u09-l9a` l’avait déjà mise hors périmètre ;
  - **les familles เกย et เกอว restent hors du jeu de réponses**, décision de
    `u09-l9a` que 10E ne rouvre pas. Le ย final de ขาย, dans ร้านขายยา, est lu
    aujourd’hui à l’intérieur d’un mot, jamais nommé comme famille ;
  - **la morphologie de composition n’est pas enseignée.** La note culturelle
    fait remarquer que โรง et ร้าน servent de tête à des mots plus longs. Elle
    le fait remarquer, elle ne le fait pas pratiquer, et aucun exercice ne
    demande de composer un mot.
- **Déclaration des spécimens, et elle est le cœur de la contrainte de cette
  unité.** Les huit supports de cette leçon sont **CONSTRUITS pour elle**. Aucun
  ne reproduit un support réel. Aucun ne porte de nom d’enseigne, de nom de
  commerce, de nom de rue ni de nom de station. Les quatre montants affichés sont
  des chiffres de lecture : deux d’entre eux, ๔๐ pour un riz sauté et ๙๐ pour
  une chemise, reprennent des montants déjà publiés par `u07-l7e` et `u08-l8e`
  dans leurs propres dialogues ; les deux autres, ๑๕ et ๑๐, sont choisis parce
  qu’ils se lisent avec des mots déjà appris. **Aucun n’est un relevé de prix, et
  la leçon n’affirme nulle part ce que coûte quoi que ce soit en Thaïlande.**
  Ce que ces supports mesurent est la lecture, pas la reconnaissance d’un lieu.
- Durée visée : 20 minutes.
- Transcription : convention `thainaute-fr` v1.1, amendements v1.2 et v1.3
  appliqués aux références.
- Statut : `draft`. Revue native : en attente. **Contre-audit interne passé le
  2026-08-04** : 78 faits confirmés, 12 findings dont 4 bloquants, tous traités à
  la consolidation du même jour. Contre-audit externe non lancé. Le détail
  finding par finding est au dossier de production.

## Enseignement

### Page 1 : huit supports, et pas un mot de transcription

Vous savez lire. Depuis 9A, vous avez tout : les lettres, les tons, les marques,
les familles de fin et le petit signe qui éteint. Ce qui vous manque n’est plus
une règle, c’est l’habitude. Aujourd’hui vous traversez une rue faite de huit
supports, et chacun s’affiche en thaï seul. Vous décodez d’abord, vous vérifiez
ensuite.

Une chose à savoir avant de commencer, et nous préférons la dire que la taire :
**ces huit supports sont fabriqués pour cette leçon.** Ils ne reproduisent aucune
devanture, aucune rue, aucun tarif. Nous les avons construits avec des mots que
nous pouvons vérifier, plutôt que de recopier un support réel que nous ne
pourrions pas contrôler. Ce que vous exercez ici est votre lecture.

Spécimen : ตลาด

### Page 2 : le geste de lecture, en quatre temps

C’est celui de la page 14 de 9A, élargi. Là-bas, trois temps suffisaient à
trouver le son de fin d’un mot. Ici vous lisez le mot entier, alors vous ajoutez
la voyelle et le ton. Vous refaites les quatre temps pour chaque syllabe, dans
cet ordre.

> Un. Trouvez la CONSONNE INITIALE de la syllabe. Ce n’est pas forcément la
> première lettre écrite.
> Deux. Trouvez sa voyelle, et regardez si elle est courte ou longue.
> Trois. Regardez ce qui ferme la syllabe, et cherchez la famille de cette
> lettre.
> Quatre. Le ton se lit sur la consonne initiale, sa classe, la marque posée et
> la façon dont la syllabe se ferme.

Retenez surtout le premier temps, parce que c’est là que tout se joue. Le ton
d’une syllabe se décide sur sa consonne INITIALE, jamais sur la première lettre
qu’on voit à gauche.

Spécimen : ปิด

### Page 3 : la première lettre écrite n’est pas toujours la consonne initiale

Deux cas vous attendent aujourd’hui, et vous les connaissez tous les deux.
Premier cas, une voyelle s’écrit avant sa consonne. La page 6 de 4A vous a
prévenu pour เ, แ, โ, ใ et ไ. Dans เปิด, la première lettre est เ, et la
consonne initiale est ป. Sur les douze graphies que vous allez lire, quatre
commencent ainsi : เปิด, โรงพยาบาล, ไข่ et เสื้อ. Une cinquième, รถเมล์, ne
commence pas ainsi mais contient le cas dans sa seconde syllabe.

Second cas, plus rare et plus déroutant : une voyelle n’est pas écrite du tout.
ตลาด s’écrit avec quatre lettres et se dit en deux syllabes. Le dictionnaire le
réécrit lui-même ตะหฺลาด pour donner sa lecture, et cette réécriture ajoute
**trois signes** que le mot n’écrit pas : un ะ, un ห et un point souscrit ◌ฺ.
Comptez-les vous-même, quatre signes d’un côté et sept de l’autre. Ce que font
ces trois signes relève d’un mécanisme que le parcours n’a pas ouvert : pour
aujourd’hui, la lecture vous est donnée, et vous n’avez rien à en déduire.

Spécimen : เปิด contre ปิด · ตลาด

### Page 4 : premier panneau

Une flèche, un mot, quatre lettres. Prenez le temps de faire les quatre temps de
la page 2 avant d’ouvrir le rideau. Attention au piège : ce mot compte deux
syllabes, pas une.

> À décoder : ตลาด
> Rideau : tà·làat, le marché. Deux tons bas de suite, et la voix ne remonte pas
> sur la seconde.

Spécimen construit : panneau fléché portant ตลาด

### Page 5 : deuxième panneau

Sept signes en tout, deux mots collés : cinq lettres, et deux marques de ton
posées au-dessus. Vous lisez ce panneau depuis la leçon 5C sans l’avoir jamais vu
écrit en grand.

> À décoder : ห้องน้ำ
> Rideau : hâwng·náam, les toilettes. La première syllabe descend, la seconde
> reste perchée.

Spécimen construit : panneau fléché portant ห้องน้ำ

### Page 6 : une porte, deux faces

Vous avez appris ces deux mots en 10B. Ici, vous les relisez sur une porte, et
ils sont faits pour être comparés : même consonne initiale ป, même lettre finale ด, même ton bas. Une
seule chose les sépare, et c’est la voyelle. **Attention : ce ne sont pas deux
longueurs de la même voyelle, ce sont deux voyelles différentes.** Dans เปิด, le
เ posé devant la consonne et le ◌ิ posé au-dessus forment ensemble le `oee` de
เกินไป, appris en 8C, et il est long ; dans ปิด, sans le เ, il ne reste que le
◌ิ, qui est le `i` bref de สิบ.

> เ + ป + ◌ิ + ด → เปิด, un `oee` long
> ป + ◌ิ + ด → ปิด, un `i` bref

> À décoder : เปิด · ปิด
> Rideau : pòeet, ouvert. pìt, fermé.

Un mot d’honnêteté sur le ton. Ces deux syllabes se ferment sur un ด, donc sur
un `t` retenu, et le tableau des tons de 7A et 8A ne couvre pas encore ce cas.
Leurs tons vous sont donnés, tous les deux bas, et vous n’avez rien à calculer.

Spécimen construit : porte à deux faces, l’une portant เปิด, l’autre ปิด

### Page 7 : troisième panneau, et son piège d’écriture

Neuf signes, trois syllabes : huit lettres, une marque de ton, et deux ย côte à
côte au milieu. Le premier ferme la syllabe qui précède, le second ouvre celle
qui suit. Ne cherchez pas une lettre double : cherchez la frontière entre deux
syllabes.

> À décoder : ร้านขายยา
> Rideau : ráan·khǎai·yaa, la pharmacie. Trois syllabes, trois tons : haut,
> montant, moyen.

Spécimen construit : panneau de service portant ร้านขายยา

### Page 8 : quatrième panneau, le plus long

Neuf lettres, aucune marque de ton, une voyelle écrite avant sa consonne et une
finale ล qui se lit `n`. Vous l’avez appris en 9A et vous le relisez ici en
situation.

> À décoder : โรงพยาบาล
> Rideau : roong·phá·yaa·baan, l’hôpital.

Spécimen construit : panneau de lieu portant โรงพยาบาล

### Page 9 : cinquième panneau, et le petit signe

Six signes : cinq lettres et le ◌์, et l’une des cinq lettres ne se prononce
pas. Repérez le ◌์ et remontez jusqu’à la dernière lettre qui se prononce :
c’est elle qui ferme. Le reste, vous l’avez fait vingt fois en 9A.

> À décoder : รถเมล์
> Rideau : rót·mee, le bus. Le ล est éteint par le ◌์, et rien ne ferme la
> seconde syllabe.

Spécimen construit : panneau de quai portant รถเมล์

### Page 10 : un tableau de prix

Trois lignes, et des chiffres que vous lisez depuis la leçon 3B. Lisez d’abord
le mot, puis le nombre, puis บาท. Les montants sont choisis pour se lire ; ce ne
sont pas des prix relevés quelque part.

> À décoder :
> ข้าวผัด ๔๐ บาท
> ไข่ ๑๕ บาท
> น้ำ ๑๐ บาท
> Rideau : khâao·phàt sìi·sìp bàat · khài sìp·hâa bàat · náam sìp bàat.

Spécimen construit : tableau de prix à trois lignes

### Page 11 : une étiquette

Un mot, un nombre, une unité. Le mot empile deux signes sur la même lettre, un
◌ื et un ◌้ : regardez-les l’un après l’autre plutôt que comme un bloc.

> À décoder : เสื้อ ๙๐ บาท
> Rideau : sûea kâao·sìp bàat, une chemise, quatre-vingt-dix bahts.

Spécimen construit : étiquette de prix

### Page 12 : les deux contrastes, on les entretient

Rien n’est acquis une fois pour toutes, et surtout pas ces deux-là. Reprenez vos
deux repères avant les exercices, puis retrouvez-les dans ce que vous venez de
lire.

> ปา (paa) contre ป่า (pàa) : la voix reste plate, puis elle descend et reste
> basse
> หมา (mǎa) contre ม้า (máa) : la voix creuse puis remonte, contre la voix qui
> reste perchée

Les supports du jour vous en donnent quatre de plus. ยา, la dernière syllabe de
ร้านขายยา, est au ton moyen ; บาท et ไข่ sont au ton bas. Et ร้านขายยา porte les
deux autres dans le même souffle : ráan est haut, khǎai est montant.

Spécimen : ปา / ป่า puis หมา / ม้า

### Page 13 : ce que cette leçon ne vous dit pas

Trois choses, et elles sont dites plutôt que passées sous silence. Un, vos huit
supports sont fabriqués : ils vous entraînent à lire, ils ne vous montrent pas à
quoi ressemble telle rue. Deux, les tons de เปิด et de ปิด vous sont donnés,
parce que le cas des syllabes fermées par un `t` n’est toujours pas au programme.
Trois, ตลาด se lit d’une façon que vous ne pouvez pas encore calculer, et nous
vous donnons sa lecture sans vous demander de la déduire.

Spécimen : ตลาด · เปิด · ปิด

### Page 14 : à vous

Refaites la rue une fois, dans l’ordre, sans ouvrir les rideaux. Vous n’avez pas
besoin d’aller vite : vous avez besoin de faire les quatre temps dans l’ordre,
et surtout de commencer par la consonne initiale de chaque syllabe.

Après les exercices, enregistrez-vous en disant เปิด puis ปิด, et comparez en
A/B avec la voix de référence. La différence porte sur la voyelle, un `oee` long
d’un côté et un `i` bref de l’autre, pas sur le ton, qui est le même.
L’enregistrement reste privé, sur votre appareil.

## Items

**10E ne publie AUCUN item, et c’est un arbitrage exécuté, pas un oubli.**

Ce fichier a été conçu et écrit alors qu’aucune autre leçon de l’unité 10
n’existait dans le dépôt, et il proposait alors deux items nouveaux, เปิด et
ปิด, en déclarant à sa Méta que si une leçon plus précoce les enseignait, la
publication lui reviendrait. **C’est ce qui s’est produit.** `lecon-10b.md`,
« Les mots qu’on voit partout », est apparue pendant la session et les publie à
ses items 5 et 6. La règle d’attribution du dépôt, énoncée par `u09-l9a` et
appliquée à l’unité 8, donne la publication à la leçon la plus précoce : 10B
publie, 10E réemploie.

Les deux blocs, leurs champs et leur dossier de sources sont donc rangés au
spécimen 3 de la section suivante, hors de `## Items`, de sorte que
`repo-thai-scan.mjs` ne compte pas ces deux graphies deux fois. Le relevé du
2026-08-04 le confirme : après ce déplacement, `repo-thai-scan.mjs 10 10` rend
32 entrées et 31 graphies pour cinq fichiers, contre 34 et 31 avant, et
**aucune graphie de l’unité 10 n’est plus revendiquée par deux leçons, sauf
ราคา, que 10C et 10D publient toutes les deux et qui ne relève pas de ce
fichier.**

Le dossier de sources produit par 10E pour ces deux mots est CONSERVÉ tel quel
plutôt que supprimé. Il a été établi indépendamment, avant que 10B soit lisible,
et il concorde champ pour champ avec elle : `item-fields-check.mjs` rend 0 écart
de réemploi sur les cinq champs comparés. Deux vérifications indépendantes qui
convergent valent mieux qu’une seule, et supprimer la seconde ferait perdre cette
preuve.

## Spécimens construits

Les huit supports ci-dessous sont **fabriqués pour cette leçon**. Ils
n’emploient que des graphies publiées par les unités 1 à 9, plus les deux mots
publiés par `u10-l10b`, et aucun ne reproduit un support réel.

**Ce que copie un bloc réemployé, et ce qu’il n’en copie pas.** Chaque bloc donne
`thai`, `codepoints`, `ipa`, `ton`, `longueur`, `transcription`, `fr`, ainsi que
`registre` et `litteral` quand la leçon d’origine les publie, tous **copiés à
l’identique** de sorte que `node scripts/verification/item-fields-check.mjs`
puisse comparer les cinq qu’il sait comparer, `ipa`, `ton`, `longueur`,
`transcription` et `codepoints`. Il ne copie NI le `note_fr` NI le bloc
`sources` de la leçon d’origine : ceux des deux blocs de la porte, เปิด et ปิด,
sont propres à 10E et ont été établis indépendamment avant que 10B soit lisible.
Le contre-audit interne du 2026-08-04 a relevé que dix blocs omettaient
`registre` et quatre `litteral`, champs que le script ne compare pas ; ils ont
été complétés à la consolidation, valeur pour valeur, depuis la leçon qui
publie. Le résultat de la comparaison est au dossier de production.

Ces blocs ne sont **pas** des items publiés par 10E : ils sont placés hors de la
section `## Items`, précisément pour que `repo-thai-scan.mjs`, qui ne balaye que
cette section, ne les compte pas une seconde fois et que le dépôt ne se retrouve
pas avec douze graphies revendiquées deux fois. C’est la réponse structurelle au
problème d’attribution que `u09-l9a` a dû traiter par cinq arbitrages.

### Spécimen 1 : panneau fléché, ตลาด (u05-l5d)

- Support : un panneau fléché portant un seul mot. Construit.
- Ce qu’il fait lire : une syllabe dont la voyelle n’est pas écrite.
- `thai` : ตลาด
- `codepoints` : U+0E15 U+0E25 U+0E32 U+0E14 (NFC)
- `ipa` : /ta˨˩.laːt̚˨˩/
- `ton` : tà bas ; làat bas
- `longueur` : tà courte ; làat longue
- `transcription` : tà·làat
- `fr` : le marché
- `registre` : neutre
- Lecture donnée par le dictionnaire : [ตะหฺลาด], séquence U+0E15 U+0E30 U+0E2B
  U+0E3A U+0E25 U+0E32 U+0E14, relevée le 2026-08-04 par
  `node scripts/verification/rid-entry.mjs ตลาด`. en.wiktionary donne la même
  chose sous la ligne Phonemic, `ตะ-หฺลาด`, page consultée en rendu le même jour.
  Deux autorités indépendantes, même réécriture. Le mécanisme qui la produit
  n’est pas enseigné.

### Spécimen 2 : panneau fléché, ห้องน้ำ (u05-l5c)

- Support : un panneau fléché portant un seul mot. Construit.
- Ce qu’il fait lire : deux marques de ton posées au-dessus, et le ำ.
- `thai` : ห้องน้ำ
- `codepoints` : U+0E2B U+0E49 U+0E2D U+0E07 U+0E19 U+0E49 U+0E33 (NFC)
- `ipa` : /hɔŋ˥˩.naːm˦˥/
- `ton` : hâwng descendant ; náam haut
- `longueur` : hâwng brève ; náam longue
- `transcription` : hâwng·náam
- `fr` : les toilettes ; la salle de bains
- `litteral` : pièce (ห้อง) d’eau (น้ำ)
- `registre` : neutre
- Contre-exemple utile de la page 3 : ce mot commence bel et bien par sa consonne
  initiale, ห. Tous les mots du jour ne commencent pas par une voyelle écrite, et
  l’apprenant doit vérifier plutôt que d’appliquer un réflexe.

### Spécimen 3 : porte à deux faces, เปิด et ปิด (u10-l10b)

- Support : une porte dont une face porte un mot et l’autre l’autre. Construit.
- Ce qu’il fait lire : le contraste de lecture le plus court du parcours, une
  voyelle et rien d’autre.
- Les deux mots sont publiés par `u10-l10b`, items 5 et 6. Leurs champs et le
  dossier de sources établi indépendamment par 10E sont donnés ci-dessous.
- **Ce que ce support n’affirme pas** : il n’affirme pas que telle devanture
  porte tel mot. Il affiche deux mots vérifiés sur un support fabriqué.

#### Spécimen 3, bloc réemployé : เปิด (u10-l10b)

- `thai` : เปิด
- `codepoints` : U+0E40 U+0E1B U+0E34 U+0E14 (NFC)
- `ipa` : /pɤːt̚˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : ouvrir ; ouvert
- `transcription` : pòeet
- `registre` : neutre
- `note_fr` : quatre signes, trois lettres et un ◌ิ, deux façons de se tromper.
  D’abord la première
  lettre écrite est เ, et la consonne initiale est ป : l’avertissement de la
  page 6 de 4A vaut ici, et c’est sur ป que se lit le ton, pas sur เ. Ensuite la
  voyelle s’écrit en deux morceaux qui encadrent la consonne, un เ devant et un
  ◌ิ au-dessus ; c’est la même voyelle que dans เกินไป, appris en 8C, et la
  transcription `oee` est la même. **Le เ ne rallonge pas le ◌ิ : les deux
  ensemble forment un AUTRE graphème vocalique.** Retirer le เ ne raccourcit pas
  cette voyelle, il change de voyelle, et c’est pourquoi la leçon nomme les deux
  partout plutôt que de parler d’une longue et d’une brève. Le ton est BAS et il vous est donné : la
  syllabe se ferme sur un ด, donc sur une occlusive, cas que le tableau de 7A et
  8A ne couvre pas. Le mot a d’autres emplois que les deux du champ `fr`, et la
  leçon n’en enseigne aucun autre.
- `sources` :
  - RID 2554, Office of the Royal Society, entrée « เปิด », relevée le
    2026-08-04 par `node scripts/verification/rid-entry.mjs เปิด`, qui interroge
    https://dictionary.orst.go.th/func_lookup.php par requête POST unique avec
    `word=เปิด&funcName=lookupWord&status=lookup` : graphie attestée comme
    entrée autonome, vedette unique, trois sens verbaux numérotés. Le (๑) est
    l’action de rendre ouvert ce qui était fermé, et de mettre un appareil en
    marche, avec la mention explicite qu’il est le contraire de ปิด, second bloc de
    ce spécimen ; le (๒) est l’ouverture inaugurale d’une activité ; le (๓),
    étiqueté (ปาก), est un sens familier qui n’est PAS enseigné. **L’entrée ne
    porte aucune lecture entre crochets**, ce qui est attendu : les deux lettres
    consonantiques du mot sont les têtes de leur famille. Aucune étiquette de
    registre sur les sens (๑) et (๒). Le bloc ลูกคำ porte dix-neuf composés,
    décompte fait mécaniquement sur la sortie du script le 2026-08-04 et non à
    l’œil, เปิดหัว y comptant pour deux puisque le dictionnaire en fait deux
    vedettes numérotées. Aucun n’est enseigné (faits cités par référence,
    définitions non reproduites).
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, lignes
    77221 à 77225, relevées le 2026-08-04 par
    `node scripts/verification/volubilis-lookup.mjs <xlsx> เปิด` (ThaiRom
    `poēt`, ThaiPhon `_poēt`, cinq lignes). Les quatre premières sont
    étiquetées `v.` et donnent « ouvrir ; s’ouvrir », « allumer ; mettre en
    marche », « ouvrir ; inaugurer » et « révéler ; dévoiler ». **La ligne 77225
    est étiquetée `adj.` et donne « ouvert »** : c’est elle qui fonde le second
    mot du champ `fr`. Le `_` note le ton bas et le macron de `ē` la voyelle
    longue, clé `TONES` de la feuille `Codes` du `.ods`. Le domaine `TOURIST`
    est cité à titre descriptif et n’est employé comme preuve de rien.
  - en.wiktionary, entrée « เปิด », https://en.wiktionary.org/wiki/เปิด,
    consultée en rendu (`action=render`) le 2026-08-04 : Orthographic/Phonemic
    `เปิด`, IPA /pɤːt̚˨˩/, Paiboon `bpə̀ət`, Royal Institute `poet`. La page
    porte **une section Verb et une section Adjective distinctes** ; la section
    Adjective donne « open: uncovered, unclosed », et la section Antonyms donne
    ปิด. Deux sens étiquetés (slang, humorous) ne sont pas enseignés.
  - **Identité de la voyelle, et c’est le fait central de la leçon. Le contraste
    เปิด / ปิด est un contraste de QUALITÉ, pas de durée.** L’annexe
    « Appendix:Thai script » d’en.wiktionary, relevée en source (`action=raw`)
    le 2026-08-04 puis **re-relevée à la consolidation le même jour, même
    empreinte**, donne deux graphèmes DISTINCTS et non deux longueurs d’un même
    graphème : sa ligne 174 porte `เ◌ิ◌` sous le nom « sara oe » avec l’IPA `ɤ`,
    et sa ligne 148 porte `◌ิ` sous le nom « sara i » avec l’IPA `i`. Deux noms,
    deux voyelles. Les deux entrées de mot le confirment au niveau du mot,
    /pɤːt̚˨˩/ contre /pit̚˨˩/. La transcription Thaïnaute code exactement cette
    distinction depuis l’amendement v1.1 de `CONVENTIONS.md`, qui affecte `oe` à
    /ɤ/ et `i` à /i/, et l’arbitrage v1.2 du même fichier **exige** qu’une leçon
    présentant ensemble deux voyelles dont l’une s’écrit en digramme montre la
    paire côte à côte et nomme le noyau : c’est ce que fait désormais la page 6.
    `u10-l10b`, qui publie les deux mots, écrit la même chose à sa page 8, « un
    `oee` long » contre « un `i` bref », relue le 2026-08-04. **Ce finding a été
    trouvé par le contre-audit interne (B1) : la version antérieure de la page 6
    et du feedback de l’exercice 3 décrivait le contraste comme une différence
    de durée, ce qui contredisait à la fois l’annexe et 10B.**
  - **Longueur, et un désaccord apparent qui n’en est pas un.** La même annexe
    ne porte AUCUNE marque d’allongement sur `ɤ` à sa ligne 174, ce qui
    suggérerait une voyelle brève. L’annexe note elle-même les emplacements de
    consonne par des tirets ; ils sont rendus ici par le cercle pointillé
    U+25CC, conformément à la notation employée par tout le dépôt et à
    l’interdiction des tirets longs. **Ce n’est pas un désaccord sur le mot**, c’est une
    généralisation de graphème que le corpus publié contredit déjà dans les deux
    sens : `u08-l8a` publie เงิน avec `longueur : courte` et /ŋɤn˧/, tandis que
    `u08-l8c` publie เกินไป avec `koeen longue` et /kɤːn˧/, les deux mots
    s’écrivant avec le même เ◌ิ◌. Les deux sources qui portent sur LE MOT
    concordent, elles : /pɤːt̚˨˩/ chez en.wiktionary et le macron de `poēt` chez
    VOLUBILIS. Le champ est donc établi à « longue », et l’écart d’échelle entre
    la table de graphèmes et les entrées de mots est déclaré ici plutôt que
    dissimulé. **Partage des rôles, à retenir** : l’annexe établit QUELLE
    voyelle est écrite, les entrées de mot établissent COMBIEN de temps elle
    dure. Aucune des deux ne fait le travail de l’autre.
  - Valeur finale de ด : fait déjà établi et sourcé par `u09-l9a`, relu au
    2026-08-04 sur l’annexe « Appendix:Thai script », ligne 54, où ด porte
    `Royal Thai Final` = `t` et `IPA Final` = `t` contre `d` à l’initiale, et
    sur l’entrée de lettre « ด » du RID, qui range la lettre parmi les ตัวสะกด
    de la มาตรากด. L’annexe employée ici est **byte pour byte celle de
    `u09-l9a`** : 16 236 octets, SHA-256
    `c9776c6afa6404012931df495e27c703ab34d98fb6748a28d216016b624690f3`.
  - Valeur initiale de ป : même annexe, ligne 68, `Royal Thai Initial` = `p`,
    `IPA Initial` = `p`, classe `mid`. Conforme à la convention Thaïnaute, qui
    écrit `p` non aspiré pour ป.
  - Graphème `oee` pour /ɤː/ : convention déjà publiée par `u08-l8c` (เกินไป,
    `koeen·pai`), relue dans le dépôt le 2026-08-04.

#### Spécimen 3, bloc réemployé : ปิด (u10-l10b)

- `thai` : ปิด
- `codepoints` : U+0E1B U+0E34 U+0E14 (NFC)
- `ipa` : /pit̚˨˩/
- `ton` : bas
- `longueur` : courte
- `fr` : fermer ; fermé
- `transcription` : pìt
- `registre` : neutre
- `note_fr` : trois signes, deux lettres et un ◌ิ, et la plus courte lecture de
  la leçon. C’est le mot
  jumeau de เปิด : même consonne initiale, même finale, même ton bas, et une
  AUTRE voyelle, le `i` bref de สิบ au lieu du `oee` long de เกินไป. Ce n’est pas
  la même voyelle raccourcie. Une confusion à connaître : ติด, appris en
  3A, s’écrit exactement pareil à une lettre près, la première, et ce n’est pas
  le même mot. Le geste de la page 2 la règle tout seul, à condition de commencer
  par la consonne initiale. Le ton est BAS et il vous est donné, la syllabe étant
  fermée par une occlusive. Le mot a d’autres emplois que les deux du champ `fr`,
  et la leçon n’en enseigne aucun autre.
- `sources` :
  - RID 2554, entrée « ปิด », relevée le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs ปิด` : graphie attestée comme
    entrée autonome, vedette unique, trois sens verbaux numérotés. Le (๑) est
    l’action de boucher ou de barrer pour empêcher l’ouverture ou le passage ;
    le (๒) est l’action de coller ; le (๓) est donné par le dictionnaire comme
    un sens dérivé valant « s’arrêter », **et son premier exemple est
    โรงเรียนปิด**, l’école est fermée, c’est-à-dire l’emploi d’état que
    l’étiquette du jour met en scène. L’entrée ne porte aucune lecture entre
    crochets ni aucune étiquette de registre. Le bloc ลูกคำ porte dix-sept
    composés, décompte fait mécaniquement le 2026-08-04 comme celui de เปิด,
    aucun n’étant enseigné (faits cités par référence, définitions non
    reproduites).
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, lignes
    75953 à 75958, relevées le 2026-08-04 (ThaiRom `pit`, ThaiPhon `_pit`). Les
    cinq premières sont étiquetées `v.` et donnent « fermer ; clore »,
    « fermer ; éteindre », « cacher », « coller ; fixer » et « couvrir ;
    obturer ». **La ligne 75958 est étiquetée `adj.` et donne « fermé ; clos »**,
    exactement symétrique de la ligne 77225 de เปิด. Le `_` note le ton bas et
    l’absence de macron la voyelle brève. Une septième ligne, la 110885, n’a
    rien à voir avec le mot : elle emploie ปิด à l’intérieur d’une expression
    désignant une accolade fermante, et elle n’est pas citée comme preuve.
  - en.wiktionary, entrée « ปิด », https://en.wiktionary.org/wiki/ปิด, consultée
    en rendu le 2026-08-04 : Orthographic/Phonemic `ปิด`, IPA /pit̚˨˩/, Paiboon
    `bpìt`, Royal Institute `pit`. **La section Verb donne เปิด comme antonyme à
    CINQ reprises**, sous « to close », « to block; to stop », « to be out of
    action; to stop work », « to turn off » et « to hide; to conceal », cette
    dernière l’associant à เผย. Décompte produit mécaniquement à la
    consolidation le 2026-08-04, en comptant les lignes portant `Antonym` sur la
    page mise à plat, et non à l’œil : **la version antérieure de ce dossier
    écrivait « à trois reprises », finding B4 du contre-audit interne.** C’est le
    même défaut que le « 19 au lieu de 46 » corrigé à la section Unicode, et la
    règle du dépôt vaut pour les deux : un décompte cité est produit par une
    machine.
  - **Une asymétrie de source est déclarée plutôt que lissée.** en.wiktionary
    donne à เปิด une section Adjective explicite et n’en donne AUCUNE à ปิด, dont
    toutes les acceptions sont rangées sous Verb. L’emploi d’état de ปิด y est
    tout de même présent, sous la forme verbale « to be out of action; to stop
    work (of an organization, a shop, etc.) ». Le second mot du champ `fr`,
    « fermé », tient donc sur deux sources indépendantes concordantes, VOLUBILIS
    ligne 75958 étiquetée `adj.` et le sens (๓) du RID avec son exemple
    โรงเรียนปิด, la troisième source portant le même contenu sous une étiquette
    grammaticale différente. **Ce que la leçon n’affirme PAS** : que ปิด soit un
    adjectif au sens où l’entend une grammaire du thaï. Aucune source consultée
    ne tranche cette question de classe, et la leçon n’en a pas besoin pour
    afficher une traduction.
  - Valeur finale de ด et valeur initiale de ป : mêmes relevés qu’au bloc เปิด,
    même annexe et même empreinte.
  - **Identité de la voyelle** : même annexe, **ligne 148**, où `◌ิ` porte le nom
    « sara i » et l’IPA `i`, contre la ligne 174 qui donne « sara oe » et `ɤ` au
    graphème de เปิด. Ce sont deux voyelles distinctes, et non la même en deux
    longueurs : voir le bloc เปิด pour le dossier complet de ce fait, corrigé au
    contre-audit interne du 2026-08-04.
  - Graphème `i` pour /i/ : convention de l’amendement v1.1 de `CONVENTIONS.md`,
    déjà publiée par le parcours, par exemple สิบ (`u03-l3b`), relue dans le
    dépôt le 2026-08-04 ; `repo-thai-scan.mjs 1 9 --grep สิบ` rend 13 graphies
    contenant สิบ, relevé du même jour.

### Spécimen 4 : panneau de service, ร้านขายยา (u09-l9d)

- Support : un panneau portant un seul mot de trois syllabes. Construit.
- Ce qu’il fait lire : deux ย consécutifs, dont le premier ferme une syllabe et
  le second en ouvre une autre.
- `thai` : ร้านขายยา
- `codepoints` : U+0E23 U+0E49 U+0E32 U+0E19 U+0E02 U+0E32 U+0E22 U+0E22 U+0E32
  (NFC)
- `ipa` : /raːn˦˥.kʰaːj˩˩˦.jaː˧/
- `ton` : ráan haut ; khǎai montant ; yaa moyen
- `longueur` : ráan longue ; khǎai longue ; yaa longue
- `transcription` : ráan·khǎai·yaa
- `fr` : la pharmacie
- `litteral` : boutique vendre médicament
- `registre` : neutre
- Réserve reprise de `u09-l9d` : `rid-lookup.mjs` rend **`absent`** pour cette
  graphie, relevé refait le 2026-08-04. Le mot n’est pas une vedette du
  dictionnaire, il est une composition transparente, et sa preuve d’existence
  vient d’ailleurs : VOLUBILIS `.xlsx` ligne 81352, « pharmacie ; officine »,
  `n. exp.` ; et en.wiktionary, qui le liste parmi les mots dérivés de ร้าน et de
  ขาย, pages consultées en rendu le 2026-08-04.

### Spécimen 5 : panneau de lieu, โรงพยาบาล (u09-l9a)

- Support : un panneau portant un seul mot de quatre syllabes. Construit.
- Ce qu’il fait lire : une voyelle écrite avant sa consonne, et une finale ล qui
  se lit `n`.
- `thai` : โรงพยาบาล
- `codepoints` : U+0E42 U+0E23 U+0E07 U+0E1E U+0E22 U+0E32 U+0E1A U+0E32 U+0E25
  (NFC)
- `ipa` : /roːŋ˧.pʰa˦˥.jaː˧.baːn˧/
- `ton` : roong moyen ; phá haut ; yaa moyen ; baan moyen
- `longueur` : roong longue ; phá courte ; yaa longue ; baan longue
- `transcription` : roong·phá·yaa·baan
- `fr` : l’hôpital
- `registre` : neutre
- Contrainte de rendu reprise de `u09-l9a` : neuf codes, aucun signe suscrit, et
  le mot ne doit pas être coupé au milieu d’une syllabe à 390 px.

### Spécimen 6 : panneau de quai, รถเมล์ (u05-l5d)

- Support : un panneau portant un seul mot. Construit.
- Ce qu’il fait lire : le signe ◌์, seule graphie du parcours qui le portait
  avant l’unité 9.
- `thai` : รถเมล์
- `codepoints` : U+0E23 U+0E16 U+0E40 U+0E21 U+0E25 U+0E4C (NFC)
- `ipa` : /rot̚˦˥.meː˧/
- `ton` : rót haut ; mee moyen
- `longueur` : rót courte ; mee longue
- `transcription` : rót·mee
- `fr` : bus, autobus
- `litteral` : véhicule de service régulier
- `registre` : neutre
- Contrainte de rendu : la troncature de fin de ligne ne doit jamais amputer le
  U+0E4C final, faute de quoi le mot deviendrait un autre mot.

### Spécimen 7 : tableau de prix à trois lignes

- Support : trois lignes, chacune faite d’un mot, d’un nombre en chiffres thaïs
  et de บาท. **Construit.** Les trois montants sont des chiffres de lecture, pas
  un relevé de prix.
- Ce qu’il fait lire : les chiffres thaïs, publiés par `u03-l3b` item 8, et trois
  mots courts déjà appris.
- Lignes du support :
  - `ข้าวผัด ๔๐ บาท`, lu khâao·phàt sìi·sìp bàat. Le montant ๔๐ reprend le
    สี่สิบบาท publié par `u07-l7e` en réponse à ข้าวผัดเท่าไร.
  - `ไข่ ๑๕ บาท`, lu khài sìp·hâa bàat. Le montant ๑๕ se lit avec le bloc
    สิบห้าบาท publié par `u03-l3c`.
  - `น้ำ ๑๐ บาท`, lu náam sìp bàat.
- **Ce que le support n’affirme pas** : ni qu’une carte réelle s’écrive ainsi, ni
  que ces montants aient cours quelque part.

#### Spécimen 7, bloc réemployé : ข้าวผัด (u04-l4c)

- `thai` : ข้าวผัด
- `codepoints` : U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 (NFC)
- `ipa` : /kʰaːw˥˩.pʰat̚˨˩/
- `ton` : khâao descendant ; phàt bas
- `longueur` : khâao longue ; phàt courte
- `transcription` : khâao·phàt
- `fr` : riz sauté
- `litteral` : riz, sauté
- `registre` : neutre

#### Spécimen 7, bloc réemployé : ไข่ (u03-l3e)

- `thai` : ไข่
- `codepoints` : U+0E44 U+0E02 U+0E48 (NFC)
- `ipa` : /kʰaj˨˩/
- `ton` : bas
- `longueur` : courte (diphtongue /aj/)
- `transcription` : khài
- `fr` : œuf
- `registre` : neutre

#### Spécimen 7, bloc réemployé : น้ำ (u02-l2c)

- `thai` : น้ำ
- `codepoints` : U+0E19 U+0E49 U+0E33 (NFC)
- `ipa` : /naːm˦˥/
- `ton` : náam haut
- `longueur` : longue
- `transcription` : náam
- `fr` : eau ; liquide
- `registre` : neutre

#### Spécimen 7, bloc réemployé : บาท (u03-l3c)

- `thai` : บาท
- `codepoints` : U+0E1A U+0E32 U+0E17 (NFC)
- `ipa` : /baːt̚˨˩/
- `ton` : bas
- `longueur` : longue
- `transcription` : bàat
- `fr` : baht (la monnaie de la Thaïlande)
- `registre` : neutre

### Spécimen 8 : étiquette de prix, เสื้อ ๙๐ บาท

- Support : une étiquette portant un mot, un nombre et บาท. **Construit.**
- Ce qu’il fait lire : deux signes empilés sur la même lettre, ◌ื puis ◌้.
- Le montant ๙๐ reprend le เก้าสิบบาท publié par `u08-l8e`, où il répond
  précisément à ตัวนี้เท่าไรครับ posé à propos d’une เสื้อ. Ce n’est donc pas un
  chiffre inventé pour l’occasion, c’est un chiffre du dépôt relu en thaï.

#### Spécimen 8, bloc réemployé : เสื้อ (u08-l8a)

- `thai` : เสื้อ
- `codepoints` : U+0E40 U+0E2A U+0E37 U+0E49 U+0E2D (NFC)
- `ipa` : /sɯa̯˥˩/
- `ton` : descendant
- `longueur` : NON ÉTABLIE, même motif que l’item 3 pour la diphtongue /ɯa/.
  L’IPA d’en.wiktionary ne porte pas de marque d’allongement, l’annexe
  « Appendix:Thai script » donne `ɯːa` pour le graphème, et VOLUBILIS écrit
  `seūa` avec macron. Décision identique à celle de `u05-l5d` pour เรือ, qui
  avait déjà laissé ce champ en réserve. Voir l’incertitude 2.
- `transcription` : sûea
- `fr` : le haut, la chemise (le vêtement du buste)
- `registre` : neutre
- **Lecture de ce champ `longueur`.** Il est reproduit MOT POUR MOT depuis
  `u08-l8a`, parce que c’est la seule façon dont `item-fields-check.mjs` peut
  prouver que le réemploi est fidèle. Ses renvois internes, « l’item 3 » et
  « l’incertitude 2 », désignent des éléments de `u08-l8a` et non de la présente
  leçon. 10E ne rouvre pas cette réserve et ne la tranche pas.

## Exercices

### Exercice 1 : que porte ce support ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : la lecture d’un support entier, sans transcription et sans
  audio préalable. Aucun tirage ne demande un ton, une longueur ni une famille de
  finale : la question est toujours « qu’est-ce que ça dit ». **Quatre des huit
  tirages** portent une graphie dont la première lettre écrite n’est PAS la
  consonne initiale de la syllabe qu’elle ouvre : les tirages 3, 6 et 8 dès le
  premier signe du mot (เปิด, โรงพยาบาล, เสื้อ) et le tirage 7 à sa SECONDE
  syllabe (รถเมล์). Un réflexe de lecture de gauche à droite ne suffit donc pas.
  **Le chiffre était « cinq » avant la consolidation du 2026-08-04** : il a été
  recompté mécaniquement sur les douze séquences NFC du dossier, comme celui de
  la Méta, même famille d’erreur que le finding N6 du contre-audit interne.
- Consigne : « Lisez le support, puis dites ce qu’il porte. Vous n’entendrez le
  mot qu’après avoir répondu. »
- Options : quatre par tirage, prises dans un jeu FIXE de huit réponses, chacune
  correcte exactement une fois sur l’ensemble de l’exercice. Ordre des options
  tiré au sort à chaque affichage. Les huit réponses sont : « le marché », « les
  toilettes », « c’est ouvert », « c’est fermé », « la pharmacie », « l’hôpital »,
  « le bus », « quatre-vingt-dix bahts ».
- Tirages : 8 au total, ordre aléatoire, jamais deux fois de suite la même
  réponse.
  1. ตลาด : « le marché ». Distracteurs : la pharmacie, l’hôpital, le bus.
  2. ห้องน้ำ : « les toilettes ». Distracteurs : le marché, l’hôpital,
     quatre-vingt-dix bahts.
  3. เปิด : « c’est ouvert ». Distracteurs : c’est fermé, les toilettes, le bus.
  4. ปิด : « c’est fermé ». Distracteurs : c’est ouvert, le marché, la
     pharmacie.
  5. ร้านขายยา : « la pharmacie ». Distracteurs : l’hôpital, les toilettes,
     c’est fermé.
  6. โรงพยาบาล : « l’hôpital ». Distracteurs : la pharmacie, le bus, c’est
     ouvert.
  7. รถเมล์ : « le bus ». Distracteurs : le marché, quatre-vingt-dix bahts,
     c’est fermé.
  8. เสื้อ ๙๐ บาท : « quatre-vingt-dix bahts ». Distracteurs : les toilettes,
     c’est ouvert, l’hôpital.
- **Plancher mesuré.** Chaque réponse du jeu est correcte exactement une fois :
  **une réponse constante plafonne donc à 1 sur 8, soit 12,5 %**, très en dessous
  du seuil de 7 sur 8. Un tirage au sort parmi les quatre options donne
  2 réponses justes en moyenne, et atteint le seuil avec une probabilité de
  **0,038 %**. Aucune heuristique de fréquence ne marche non plus : l’option qui
  revient le plus souvent, « l’hôpital », apparaît cinq fois sur les
  trente-deux emplacements d’options et n’est correcte qu’une fois. Le décompte
  est vérifiable depuis la liste ci-dessus : huit tirages fois quatre options font
  trente-deux emplacements, et la somme des apparitions, 4 plus 4 plus 4 plus 4
  plus 4 plus 5 plus 4 plus 3, fait bien trente-deux.
- Seuil de réussite : 7 sur 8.
- Feedback correct : « Oui. Vous avez lu, vous n’avez pas deviné. »
- Feedback correct, tirages 3 et 4 : « Bien vu. Ces deux mots ne diffèrent que
  par leur voyelle, et vous les avez séparés à l’œil. »
- Feedback incorrect : « Reprenez dans l’ordre. Un, où est la consonne initiale
  de la première syllabe ? Deux, quelle est sa voyelle ? Trois, qu’est-ce qui
  ferme la syllabe ? » Aucune pénalité, le support est ensuite joué et sa
  transcription publiée est affichée.
- Pièges connus : prendre เ ou โ pour la consonne initiale, sur les tirages 3, 6
  et 8 ; lire ตลาด en une syllabe, la voyelle de la première n’étant pas écrite ;
  confondre ร้านขายยา et โรงพยาบาล, tous deux longs, tous deux à initiale ร, et
  tous deux des lieux de santé ; répondre au souvenir plutôt qu’à la lecture sur
  les six tirages faits de mots déjà appris, limite réelle signalée à
  l’incertitude 5.

### Exercice 2 : six chiffres thaïs (`association`)

- Mécanique : `association`
- Ce qu’il mesure : la lecture des chiffres thaïs, sans laquelle un tableau de
  prix ou une étiquette n’est pas lisible. C’est la compétence des spécimens 7
  et 8, isolée de toute autre. `u03-l3b` les a publiés en reconnaissance seule,
  et cet exercice reste dans ce périmètre : jamais d’écriture d’un chiffre thaï.
- Consigne : « Chaque signe de gauche est un chiffre. Associez-le à sa valeur.
  Touchez un signe, puis une valeur : aucun glisser-déposer n’est nécessaire. »
- Interaction : sélection au clic ou au clavier des deux membres d’une paire,
  jamais de glisser-déposer obligatoire. Cibles d’au moins 44 par 44 points.
- Paires à former : 6, bijection stricte, chaque valeur employée une seule fois.
  1. ๒ ↔ 2
  2. ๓ ↔ 3
  3. ๕ ↔ 5
  4. ๗ ↔ 7
  5. ๘ ↔ 8
  6. ๙ ↔ 9
- **Plancher mesuré.** Une réponse constante est structurellement impossible :
  chaque carte de droite ne sert qu’une fois. Un appariement entièrement au
  hasard donne **une paire correcte en moyenne** et n’atteint le seuil qu’une
  fois sur 720, soit **0,139 %**. Contrairement à l’exercice d’appariement de
  `u09-l9a`, aucune paire n’est acquise d’avance par une propriété du système :
  la correspondance entre la forme d’un chiffre thaï et sa valeur n’est pas
  dérivable, elle est apprise. Les seuils intermédiaires n’existent pas dans une
  bijection de six, cinq paires correctes en imposant une sixième.
- Choix de tirage à déclarer : **๐, ๑, ๔ et ๖ sont écartés de ce tirage.** Le
  motif est de conception et non de source. ๐ donnerait un point sans lecture à
  quiconque y voit un zéro, et nous préférons ne pas offrir ce point ; les trois
  autres sont écartés pour tenir le tirage à six. L’apprenant les révise par la
  carte SRS, où le tirage est plus large.
- Seuil de réussite : 6 sur 6.
- Feedback correct : « Oui. Un prix ne se devine pas, il se lit. »
- Feedback incorrect : « Reprenez la table des dix chiffres de la leçon 3B. Elle
  reste consultable pendant l’exercice. » Aucune pénalité.
- Pièges connus : confondre ๓ et ๗, dont les boucles se ressemblent à petite
  taille ; confondre ๕ et ๙, dont les deux traits partent du même côté ; chercher
  une ressemblance avec le chiffre arabe, qui n’en fournit aucune ; lire un
  nombre à deux chiffres de droite à gauche, erreur qui ne peut pas se produire
  ici mais qui guette au spécimen 7.

### Exercice 3 : quel support porte ce mot ? (`listening`)

- Mécanique : `listening`
- Ce qu’il mesure : le lien entre ce que l’apprenant entend et ce qu’il vient de
  lire. C’est le seul exercice du jour à passer par l’oreille, et il ne demande
  jamais de nommer un ton : il demande de retrouver une graphie.
- Consigne : « Écoutez le mot, puis touchez la carte qui le porte. »
- Interaction : huit cartes affichées en permanence, en thaï seul, sans
  transcription. **Une même carte peut être TOUCHÉE plusieurs fois** : rien
  n’empêche l’apprenant de désigner deux fois la même, et une carte déjà donnée
  comme correcte n’est ni grisée ni retirée du jeu. Cette autorisation porte sur
  la SAISIE, pas sur le corrigé.
- **Correction différée, et c’est une décision de conception.** À chaque tirage,
  l’apprenant apprend seulement si sa réponse est juste ou fausse, et il peut
  redemander l’audio ralenti ; **la carte correcte n’est jamais nommée avant la
  fin de l’exercice**, où le corrigé complet est affiché d’un coup. Motif au
  paragraphe suivant.
- Tirages : 8 au total, ordre aléatoire. Chaque carte est la bonne réponse
  exactement une fois.
  1. audio ตลาด → carte ตลาด
  2. audio ห้องน้ำ → carte ห้องน้ำ
  3. audio เปิด → carte เปิด
  4. audio ปิด → carte ปิด
  5. audio ร้านขายยา → carte ร้านขายยา
  6. audio โรงพยาบาล → carte โรงพยาบาล
  7. audio รถเมล์ → carte รถเมล์
  8. audio เสื้อ → carte เสื้อ ๙๐ บาท
- **Plancher mesuré.** Chaque carte est correcte exactement une fois : **une
  réponse constante plafonne à 1 sur 8, soit 12,5 %**, sous le seuil de 7 sur 8.
  Un tirage au sort parmi les huit cartes atteint le seuil avec une probabilité
  de **0,00034 %**, soit 8·(7/8)/8⁷ + 1/8⁸, recalculé à la consolidation.
- **Ce que la bijection du corrigé coûte, et pourquoi elle est gardée quand
  même.** La version antérieure de ce fichier écrivait que « aucune réponse ne se
  déduit des précédentes », ce qui était FAUX et constitue le finding N1 du
  contre-audit interne : huit tirages sur huit cartes distinctes forment une
  bijection, donc la huitième réponse est déterminée par les sept autres dès que
  l’apprenant sait lesquelles ont été correctes. La phrase a été retirée. Trois
  mesures ont été pesées, et voici pourquoi c’est la troisième qui est retenue.
  1. **Tirer les huit audios avec remise** fermerait la déduction, mais
     détruirait la propriété la plus forte de l’exercice : une même carte pouvant
     alors être correcte jusqu’à quatre fois sur huit sous la seule contrainte
     « jamais deux fois de suite », une réponse constante plafonnerait à
     **4 sur 8, soit 50 %** au lieu de 12,5 %. On échangerait une garantie
     prouvée contre une garantie plus faible. Écarté.
  2. **Passer à neuf tirages sur huit cartes**, une carte correcte deux fois,
     laisse la déduction ouverte dans 7 cas sur 9 : elle n’est fermée que si
     l’une des deux occurrences de la carte répétée tombe au dernier tirage.
     Écarté aussi, et le calcul est consigné pour qu’on ne le refasse pas.
  3. **Retenue : ne pas nommer la carte correcte avant la fin.** L’apprenant qui
     répond juste sept fois sur les sept premiers tirages a DÉJÀ atteint le seuil
     de 7 sur 8 : la déduction ne lui apporte rien. Le seul cas où elle change le
     résultat est celui d’un apprenant à 6 justes sur 7, et la correction
     différée le fait passer d’une certitude à une chance sur deux dans la
     branche où sa seule erreur a porté sur une carte déjà attribuée par un
     tirage précédent.
     **Fuite résiduelle, déclarée et non lissée** : dans l’autre branche, celle où
     l’apprenant a désigné par erreur l’une des deux cartes encore non attribuées,
     la huitième reste déductible avec certitude. C’est précisément ce que produit
     la confusion centrale de la leçon, เปิด contre ปิด. **La fermeture complète
     demande un arbitrage de mécanique `listening` au niveau du dépôt, pas une
     décision de leçon** : voir l’arbitrage 9.
- Seuil de réussite : 7 sur 8.
- Feedback correct, tirages 3 et 4 : « Oui. Ce sont deux voyelles différentes,
  pas la même en deux longueurs : un `oee` long dans เปิด, un `i` bref dans ปิด.
  Le ton, lui, est le même pour les deux. »
- Feedback incorrect, confusion entre les tirages 3 et 4 : « Réécoutez เปิด puis
  ปิด l’un après l’autre. Les deux descendent et restent en bas ; c’est la
  voyelle qui change, un `oee` d’un côté, un `i` de l’autre. » Réécoute ralentie
  proposée, aucune pénalité, et la carte correcte n’est pas nommée avant la fin
  de l’exercice.
- Feedback incorrect, confusion entre les tirages 5 et 6 : « Les deux commencent
  par un `r`, et c’est la suite qui les sépare. Comptez les syllabes : trois d’un
  côté, quatre de l’autre. »
- Pièges connus : confondre เปิด et ปิด, la confusion centrale de la leçon ;
  confondre ร้านขายยา et โรงพยาบาล sur leur seule première syllabe ; **réussir le
  tirage 8 sans le mériter**, en repérant la carte à ses chiffres ๙๐ alors que
  l’audio ne dit que เสื้อ, cas où la réponse est juste mais où la compétence
  mesurée n’est pas celle qui a servi, formulation corrigée à la consolidation du
  2026-08-04 parce que la version antérieure décrivait ce tirage comme une
  erreur alors qu’il donne la bonne carte ; répondre au souvenir de la page
  plutôt qu’à l’écoute, ce que l’ordre aléatoire limite sans l’annuler.

### Exercice 4 : écrivez ce que vous lisez (`recall`)

- Mécanique : `recall`
- Ce qu’il mesure : la production d’une transcription complète à partir de la
  seule graphie, sans aide auditive et sans options à deviner. Deux choses y sont
  mesurées d’un coup, les sons et l’accent de ton.
- Consigne : « Lisez le mot, puis écrivez-le en transcription Thaïnaute, accent
  de ton compris. Vous n’entendrez le mot qu’après avoir répondu. »
- Politique de saisie : alphabet latin uniquement, casse ignorée, espaces de
  début et de fin ignorés. Comme en `u07-l7a`, `u08-l8a` et `u09-l9a`, l’accent
  de ton est OBLIGATOIRE et non tolérant : il fait partie de ce qui est mesuré.
  Il se pose sur la PREMIÈRE lettre du noyau vocalique, conformément à
  l’amendement v1.1 des conventions. Le séparateur de syllabes `·` est facultatif
  sur les tirages polysyllabiques.
- Tirages et réponses : 6. Les numéros sont des identifiants, pas un ordre de
  présentation ; l’ordre affiché est aléatoire.
  1. เปิด : réponse `pòeet`.
  2. ปิด : réponse `pìt`.
  3. ตลาด : réponse `tà·làat` ; variante acceptée `tàlàat`.
  4. ห้องน้ำ : réponse `hâwng·náam` ; variante acceptée `hâwngnáam`.
  5. รถเมล์ : réponse `rót·mee` ; variante acceptée `rótmee`.
  6. ร้านขายยา : réponse `ráan·khǎai·yaa` ; variante acceptée `ráankhǎaiyaa`.
- **Plancher mesuré : aucun plancher de hasard. La saisie est libre, il n’y a pas
  d’options à deviner. Une réponse constante, quelle qu’elle soit, vaut au mieux
  1 sur 6, soit 16,7 %**, et seulement si elle coïncide avec l’une des six
  réponses attendues. Le seuil de 5 sur 6 est donc hors d’atteinte sans lecture.
- Tirage écarté et motif : **โรงพยาบาล ne figure pas dans cet exercice.** La
  carte `srs-u09-l9a-04` pose que ce mot n’est jamais demandé en écriture, et 10E
  ne contourne pas cette décision sous prétexte que la graphie est affichée.
- Seuil de réussite : 5 sur 6.
- Feedback correct : « C’est ça. Vous avez écrit ce que vous avez lu, sans
  l’entendre. »
- Feedback incorrect, voyelle erronée sur les tirages 1 ou 2 : « Regardez les
  deux mots côte à côte. L’un porte un เ devant sa consonne, l’autre non, et
  c’est toute la différence : `oee` long contre `i` bref. »
- Feedback incorrect, accent absent : « L’accent manque, et il fait partie de la
  réponse. Rien pour le moyen, `à` pour le bas, `â` pour le descendant, `á` pour
  le haut, `ǎ` pour le montant. »
- Feedback incorrect, accent posé sur la mauvaise lettre : « L’accent va sur la
  PREMIÈRE lettre du noyau : `pòeet`, `hâwng`, `khǎai`. » Le mot est ensuite joué
  et la comparaison A/B est proposée.
- Pièges connus : écrire `poèet` ou `poeèt` au lieu de `pòeet`, en posant
  l’accent ailleurs que sur la première lettre du noyau ; écrire `pìd` ou `tàlàad`
  en transcrivant la LETTRE finale plutôt que le son qu’elle ferme ; écrire
  `talàat` en oubliant que la première syllabe porte elle aussi un ton bas ;
  écrire `rót·me` en oubliant le doublement du `e`, la voyelle étant longue ;
  écrire `ráan·khaai·yaa` en oubliant l’accent montant du milieu, seul accent des
  trois syllabes à ne pas être sur la première.

### Exercice 5 : posez la question (`word_order`)

- Mécanique : `word_order`
- Ce qu’il mesure : **la syntaxe des unités 1 à 9, pas la lecture du jour.** Il
  faut le dire clairement plutôt que de laisser croire que tout mesure la même
  chose. Sa place dans un bilan est celle-ci : après avoir lu un support, on a
  souvent une question à poser, et cet exercice ferme la boucle. Les quatre
  énoncés sont des blocs publiés, jamais des compositions.
- Consigne : « Vous venez de lire ce support. Remettez les étiquettes dans
  l’ordre pour poser la question. »
- Interaction : étiquettes déplaçables au clavier comme au pointeur, avec des
  actions explicites déplacer et retirer, jamais de glisser-déposer obligatoire.
  **L’ordre initial des étiquettes n’est jamais l’ordre correct, et n’en est
  jamais à un seul échange près.**
- Tirages et réponses : 4.
  1. Après le spécimen 4 : étiquettes `ร้านขายยา` `อยู่` `ที่ไหน` `ครับ`.
     Réponse : ร้านขายยาอยู่ที่ไหนครับ, bloc publié par `u09-l9d`.
  2. Après le spécimen 7 : étiquettes `ขอ` `ข้าวผัด` `สอง` `จาน` `หน่อย`
     `ครับ`. Réponse : ขอข้าวผัดสองจานหน่อยครับ, bloc publié par `u04-l4c`.
  3. Après le spécimen 8 : étiquettes `ตัวนี้` `เท่าไร` `ครับ`. Réponse :
     ตัวนี้เท่าไรครับ, bloc publié par `u08-l8e`, et c’est exactement la question
     à laquelle ce bloc répond par เก้าสิบบาท dans sa leçon d’origine.
  4. Après le spécimen 1 : étiquettes `ผม` `ไป` `ตลาด` `ครับ`. Réponse :
     ผมไปตลาดครับ, bloc publié par `u05-l5d`.
- **Plancher mesuré, et il tient compte de la seule heuristique qui marche
  vraiment.** Les quatre énoncés ont des structures différentes, de sorte que
  réussir l’un ne donne pas les autres : une demande de lieu, une demande d’objet
  avec compteur, une question de prix et une phrase déclarative. Un ordre tiré au
  sort atteint le seuil de 3 sur 4 avec une probabilité de **0,031 %**. Mais une
  heuristique de position existe et il faut la mesurer plutôt que l’ignorer :
  **ครับ est en dernière place dans les quatre réponses.** Un apprenant qui pose
  ครับ à la fin et range le reste au hasard atteint le seuil avec une probabilité
  de **1,5 %**, calcul fait sur 3!, 5!, 2! et 3! ordres restants. C’est le
  plancher à retenir, et il reste très en dessous du seuil.
- Seuil de réussite : 3 sur 4.
- Feedback correct : « Oui. Vous avez lu le support, et maintenant vous savez
  quoi en dire. »
- Feedback incorrect : « Repartez de ce que vous voulez obtenir. Un lieu ? Une
  chose ? Un prix ? La particule de politesse se pose à la fin, le reste dépend
  de la question. » Aucune pénalité.
- Pièges connus : placer อยู่ après ที่ไหน au tirage 1 ; **intervertir le nombre
  et le compteur au tirage 2**, en plaçant จาน avant สอง, alors que le bloc
  publié par `u04-l4c` donne l’ordre ข้าวผัด puis สอง puis จาน, c’est-à-dire
  l’objet, puis combien, puis dans quoi ; oublier หน่อย, qui adoucit la demande
  et que `u04-l4c` a publié dans le bloc ; **commencer le tirage 4 par ไป**,
  alors que le bloc publié par `u05-l5d` commence par ผม.
- **Deux de ces pièges étaient expliqués par un « calque du français », et ne le
  sont plus.** Le contre-audit interne (finding N8) a montré que l’ordre fautif
  du tirage 2, objet puis compteur puis nombre, n’est le calque d’aucun ordre
  français, et le même reproche vaut pour le tirage 4. La section 1 bis de
  `docs/content-policy/sources-verification.md` n’admet un fait sur le français
  que sourcé par deux sources indépendantes ou reformulé en observation
  vérifiable par l’apprenant : les deux pièges sont donc désormais rattachés à
  l’ordre du BLOC PUBLIÉ, que l’apprenant peut vérifier dans le dépôt, et aucune
  affirmation sur le français n’est faite.

### Couverture des huit spécimens par les exercices

Chaque support entre dans au moins deux exercices, et ce tableau est là pour
qu’un relecteur le vérifie sans reconstituer l’information. **Entrer dans un
exercice n’est pas y être mesuré en entier** : les cellules de l’exercice 2
nomment le seul chiffre du support que son tirage contient, et non le support.
Le paragraphe qui suit le tableau chiffre l’écart.

| Spécimen                   | Ex. 1 | Ex. 2 | Ex. 3 | Ex. 4 | Ex. 5 |
| -------------------------- | ----- | ----- | ----- | ----- | ----- |
| 1 · ตลาด                   | T1    |       | T1    | T3    | T4    |
| 2 · ห้องน้ำ                | T2    |       | T2    | T4    |       |
| 3 · เปิด et ปิด            | T3 T4 |       | T3 T4 | T1 T2 |       |
| 4 · ร้านขายยา              | T5    |       | T5    | T6    | T1    |
| 5 · โรงพยาบาล              | T6    |       | T6    |       |       |
| 6 · รถเมล์                 | T7    |       | T7    | T5    |       |
| 7 · tableau de prix        |       | ๕     |       |       | T2    |
| 8 · étiquette เสื้อ ๙๐ บาท | T8    | ๙     | T8    |       | T3    |

Le spécimen 5 n’est mesuré que deux fois, et c’est assumé : `u09-l9a` le publie
et le mesure déjà de son côté, et sa carte SRS interdit de le demander en
écriture.

**Ce que l’exercice 2 mesure vraiment des spécimens 7 et 8, et ce qu’il ne mesure
pas.** Les deux cellules portaient `tout` avant la consolidation du 2026-08-04,
ce qui était faux et constitue le finding N2 du contre-audit interne. Décompte
refait mécaniquement : les deux supports affichent quatre nombres, ๔๐, ๑๕, ๑๐ et
๙๐, soit **huit tokens de chiffre**, ๔ ๐ ๑ ๕ ๑ ๐ ๙ ๐, pour **cinq chiffres
distincts**, ๐ ๑ ๔ ๕ ๙. L’exercice 2 n’apparie que ๒ ๓ ๕ ๗ ๘ ๙ : il ne touche
donc que **deux des huit tokens** et **deux des cinq chiffres distincts**, ๕ et
๙. Six tokens sur huit et trois chiffres distincts sur cinq sont hors de son
tirage.

**Conséquence, dite plutôt que cachée : la lecture d’un nombre à deux chiffres
n’est mesurée par AUCUN exercice de cette leçon.** Les pages 10 et 11
l’enseignent, l’objectif observable ne la revendique pas, et l’exercice 2 le
reconnaît lui-même dans ses pièges connus. La phrase antérieure, « ce que
l’exercice 2 mesure mieux », affirmait le contraire : elle est retirée. Le
spécimen 7 n’entre pas dans l’exercice 1 pour une autre raison, la seule qui
tienne : sa réponse serait un montant et non un sens, alors que le jeu de huit
réponses de l’exercice 1 est fait de sens. Aucun tirage de montant n’a été ajouté
à chaud : une seconde manche de quatre paires ๔๐ ๑๕ ๑๐ ๙๐ aurait un plancher de
hasard de 1 sur 4!, soit **4,17 %**, le plus faible du fichier, et ses paires
partageant ๐ et ๑ laisseraient passer un apprenant qui ne lit qu’un chiffre sur
deux. Voir l’arbitrage 10 et l’incertitude 8.

## Dialogue

Micro-situation : une porte. Cinq répliques, toutes bâties sur des ossatures
publiées, avec un seul élément qui n’est pas un bloc publié tel quel, เปิด placé
dans la fente du prédicat. Le dialogue ne rejoue pas les huit spécimens et ne cherche pas à le
faire : il montre à quoi sert la lecture d’une porte.

| Locuteur | Thaï         | Transcription      | Français           |
| -------- | ------------ | ------------------ | ------------------ |
| Passant  | ขอโทษครับ    | khǎww·thôot khráp  | Excusez-moi.       |
| Passant  | เปิดไหมครับ  | pòeet mǎi khráp    | C’est ouvert ?     |
| Vendeuse | เปิดค่ะ      | pòeet khâ          | Oui, c’est ouvert. |
| Passant  | ขอบคุณครับ   | khàwwp·khoun khráp | Merci.             |
| Vendeuse | ไม่เป็นไรค่ะ | mâi·pen·rai khâ    | De rien.           |

Une remarque de lecture, à faire remarquer plutôt qu’à enseigner : ขอบคุณ, que
l’apprenant dit depuis la leçon 1E, contient deux finales lues en 9A, le บ de
ขอบ qui ferme sur un `p` et le ณ de คุณ qui ferme sur un `n`.

## SRS

### Cartes créées par 10E

- `srs-u10-l10e-01` : lire un support construit et dire ce qu’il porte. Critère
  de maîtrise : 7 supports sur 8, sans transcription et sans audio, sur deux
  sessions espacées. Contraintes de tirage, toutes bloquantes : au moins un
  support dont la première lettre écrite n’est pas la consonne initiale ; au
  moins un support dont une syllabe a une voyelle non écrite ; au moins un
  support portant un ◌์ ; au moins un support portant des chiffres thaïs ; et
  au moins un support dont la première lettre écrite EST la consonne initiale,
  faute de quoi l’apprenant apprendrait un faux réflexe. Cette carte est nouvelle
  au sens strict : aucune carte existante du parcours ne mesure la lecture d’un
  support entier. `srs-u09-l9a-01` mesure la valeur d’une lettre finale, pas la
  lecture d’un mot dans son support.
- `srs-u10-l10e-02` : lire un chiffre thaï. Critère : 6 sur 6 en bijection, sur
  deux sessions distinctes. Le tirage est pris dans les dix chiffres publiés par
  `u03-l3b` et non dans les six de l’exercice 2 : la carte est donc plus large
  que l’exercice, et ๐, ๑, ๔ et ๖ y entrent. Jamais d’écriture d’un chiffre
  thaï, périmètre fixé par `u03-l3b` et non rouvert ici.
- `srs-u10-l10e-03` : **RETIRÉE, et le motif est écrit.** Cette carte devait
  porter le vocabulaire nouveau du jour, เปิด et ปิด. Or 10B les publie, et une
  carte de vocabulaire appartient à la leçon qui publie le mot : la créer ici
  aurait mis deux cartes sur les deux mêmes mots, exactement le doublon que le
  contre-audit de `u09-l9a` a passé cinq arbitrages à éviter. 10E s’appuie donc
  sur la carte de vocabulaire de 10B et n’en crée pas. **Ce que 10E demande en
  échange** : que le critère de la carte de 10B accepte la reconnaissance de ces
  deux mots LUS SUR UN SUPPORT, et pas seulement isolés, faute de quoi rien dans
  le SRS ne mesure ce que le spécimen 3 enseigne. Une leçon ne modifie pas la
  carte d’une autre : c’est une demande consignée, à exécuter à la
  consolidation.

### Entretien des tons : aucune carte nouvelle, et c’est une décision

Le fil des tons de `CONVENTIONS.md` demande un ENTRETIEN par le SRS à partir de
l’unité 8, pas une carte de plus par leçon. `u08-l8a` puis `u09-l9a` ont signalé
un recouvrement de cartes de ton non tranché, la quatrième et la cinquième fois.
10E ne crée donc pas de carte de ton ; elle APPORTE des tirages aux deux cartes
existantes, et demande qu’ils y soient ajoutés :

- à `srs-u07-l7a-03`, moyen contre bas : les tirages ยา au ton moyen
  (`u09-l9d`), บาท au ton bas (`u03-l3c`) et ไข่ au ton bas (`u03-l3e`), les
  trois étant lus dans les spécimens du jour, plus la paire de référence ปา
  contre ป่า que la carte porte déjà ;
- à `srs-u04-l4a-06`, montant contre haut : le tirage น้ำ au ton haut
  (`u02-l2c`), lu au spécimen 7, plus la paire de référence หมา contre ม้า, qui
  vient de `u01-l1d` et que `u09-l9a` a déjà demandé d’y ajouter sans que ce soit
  visible dans le dépôt au 2026-08-04.

Une leçon ne modifie pas la carte d’une autre : ces apports sont donc des
DEMANDES consignées, à exécuter à la consolidation de l’unité 10. **C’est le
sixième signalement du même recouvrement**, et il vaut mieux le dire ainsi que de
faire semblant de le résoudre. Voir l’arbitrage 2.

### Bilan de maîtrise de l’unité 10

Une leçon E doit proposer la carte de bilan de son unité. 10E la propose, et
déclare ce qu’elle ne peut pas remplir.

- `srs-u10-bilan-01`, **PROPOSÉE, non écrite** : lire dix supports construits
  tirés dans l’ENSEMBLE de l’unité 10 et dire ce que chacun porte. Critère
  proposé : 8 sur 10, sans transcription et sans audio, sur deux sessions
  espacées, avec au moins deux supports par leçon de l’unité. **Ce que 10E ne
  peut pas faire** : constituer le tirage. Le relevé fait avant rédaction,
  `repo-thai-scan.mjs 10 10`, rendait 0 fichier ; les quatre autres leçons ne
  sont apparues qu’après, et la conception de ce bilan n’a donc pas pu s’appuyer
  sur elles. **Le risque de recouvrement est réel et il est nommé** : 10A
  s’intitule « Lire sans transcription », ce qui est très exactement la
  compétence que `srs-u10-l10e-01` mesure, et ses propres cartes peuvent déjà la
  couvrir. **Arbitrage demandé** : écrire cette carte à la consolidation, et
  vérifier à ce moment-là qu’elle ne double ni `srs-u10-l10e-01` ni les cartes de
  10A, 10B, 10C et 10D. Des candidats naturels existent déjà, ราคา et อาหาร chez
  10C, ทางเข้า et ทางออก chez 10B, à condition que la consolidation relise leurs
  champs plutôt que de les croire sur la foi de ce paragraphe.
- Contrainte que la consolidation devra vérifier, et qui est déjà connue :
  aucune carte de l’unité 10 ne doit demander le TON d’une syllabe fermée par
  `k`, `t` ou `p`, tant que l’incertitude 6 de `u09-l9a` n’est pas arbitrée. Les
  tons de เปิด et de ปิด ne sont donc jamais demandés en lecture. Les quatre
  autres leçons de l’unité, relues le 2026-08-04, tiennent la même ligne : 10A
  apprend à RECONNAÎTRE une syllabe morte et à s’arrêter là, 10B, 10C et 10D
  donnent les tons concernés au lieu de les faire calculer.

### Hors périmètre

- ตลาด, ห้องน้ำ, ร้านขายยา, โรงพยาบาล, รถเมล์, เสื้อ, ข้าวผัด, ไข่, น้ำ et บาท
  **gardent leurs cartes d’origine** des unités 2 à 9. Aucune carte de
  vocabulaire n’est créée pour eux, et aucun de leurs champs n’est redéfini ici.
- ปา, ป่า, หมา et ม้า gardent leurs cartes de `u01-l1c` et `u01-l1d`.
- Les blocs reconstruits à l’exercice 5, ร้านขายยาอยู่ที่ไหนครับ,
  ขอข้าวผัดสองจานหน่อยครับ, ตัวนี้เท่าไรครับ et ผมไปตลาดครับ, gardent les cartes
  de `u09-l9d`, `u04-l4c`, `u08-l8e` et `u05-l5d`. 10E ne crée aucune carte de
  syntaxe.
- ติด, cité au bloc ปิด comme confusion possible, garde sa carte de `u03-l3a` et
  n’entre dans aucun tirage du jour.

## Note culturelle

Le dictionnaire thaï range certains mots longs sous un mot court, qu’il appelle
leur แม่คำ, leur mot de rattachement. Vous en lisez déjà un exemple aujourd’hui :
โรงพยาบาล commence par โรง, qui désigne à lui seul une construction couverte d’un
toit, faite pour y habiter, y travailler ou y entreposer. Le dictionnaire range
vingt-huit mots sous cette tête, et deux d’entre eux se lisent avec ce que vous
savez déjà : โรงเรียน, l’école, et โรงแรม, l’hôtel.

Regardez-les. Après โรง, vous lisez เรียน dans le premier et แรม dans le second,
et ce sont deux mots que le dictionnaire donne aussi pour eux-mêmes : เรียน,
apprendre, et แรม, passer la nuit. Ni l’un ni l’autre n’est au programme
d’aujourd’hui, et vous n’avez pas à les retenir.

Un autre mot court se lit en tête aujourd’hui : ร้าน, le lieu où l’on vend. Vous
le lisez au début de ร้านขายยา, le panneau du spécimen 4, et c’est pourquoi la
leçon 9D en donne le mot à mot « boutique vendre médicament ». Une nuance, et
elle est honnête : le dictionnaire ne range PAS ร้านขายยา sous ร้าน comme il
range โรงเรียน sous โรง. Un mot peut donc commencer par un mot que vous
connaissez sans que le dictionnaire en fasse un composé.

Dans les deux cas, le mot du début ne vous donne pas le sens exact du mot long,
mais il vous dit de quel genre de chose il s’agit, et c’est déjà beaucoup quand
on lit vite.

- Sources du fait « โรง désigne une construction couverte et sert de tête à des
  mots plus longs », toutes consultées le 2026-08-04 :
  - RID 2554, entrée « โรง », relevée par
    `node scripts/verification/rid-entry.mjs โรง` : le sens nominal unique est la
    construction couverte d’un toit servant d’habitation, de lieu d’activité ou
    de dépôt, l’entrée donnant elle-même โรงรถ et โรงพิมพ์ pour exemples, et
    précisant que le mot sert aussi de classificateur pour ces constructions.
    **Le bloc ลูกคำ de cette entrée compte 28 composés**, décompte produit
    mécaniquement le 2026-08-04 en dépouillant la sortie du script versionné, et
    non compté à l’œil ; **recompté à l’identique à la consolidation du même
    jour**, sur une requête neuve. Il porte notamment โรงพยาบาล, โรงเรียน et
    โรงแรม.
  - RID 2554, entrées « โรงเรียน » et « โรงแรม », mêmes date et méthode,
    **re-interrogées à la consolidation le 2026-08-04** : la
    première est glosée comme un établissement d’enseignement, la seconde comme
    un lieu de séjour payant pour voyageurs. **Les deux portent explicitement
    โรง comme แม่คำ**, c’est-à-dire comme mot de rattachement.
    **Ce que cela établit, et ce que cela n’établit pas.** Le RID atteste que le
    dictionnaire RANGE ces deux mots longs sous la tête โรง. Il n’écrit nulle
    part qu’ils se décomposent en deux morceaux, et il ne dit rien du second
    morceau. Attribuer au RID une analyse de composition serait le sur-citer :
    c’est ce que faisait la version antérieure de ce dossier, finding B3 du
    contre-audit interne.
  - **RID 2554, entrées « เรียน » et « แรม », interrogées à la consolidation le
    2026-08-04** par `node scripts/verification/rid-entry.mjs`, précisément pour
    sortir les deux gloses affichées à l’apprenant de la source unique où le
    contre-audit les avait trouvées. เรียน est une vedette, en deux entrées
    numérotées ; le sens (๑) de เรียน ๑ est étiqueté `ก.` et vaut recevoir un
    savoir d’un enseignant, se former jusqu’à la maîtrise : c’est « apprendre ».
    แรม est une vedette unique à trois sens ; le (๓) est étiqueté `ก.` et vaut
    passer la nuit, avec พักแรม pour exemple. **Les deux gloses affichées par la
    note tiennent donc désormais sur l’autorité n° 1**, et non sur Wiktionary
    seule.
  - en.wiktionary, entrée « โรง », https://en.wiktionary.org/wiki/โรง, consultée
    en rendu le 2026-08-04 : Orthographic/Phonemic `โรง`, IPA /roːŋ˧/, Paiboon
    `roong`, nom « building or structure, especially one roofed or canopied ».
    Sa liste de mots dérivés porte โรงพยาบาล, โรงเรียน et โรงแรม parmi beaucoup
    d’autres.
  - en.wiktionary, entrées « โรงเรียน » et « โรงแรม », même date et même méthode,
    **récupérées à nouveau à la consolidation le 2026-08-04**.
    La première donne en toutes lettres « From โรง (roong, building) + เรียน
    (riian, to learn) », IPA /roːŋ˧.ria̯n˧/ et une ligne Phonemic qui coupe le mot
    `โรง-เรียน` ; la seconde « From โรง (roong,
    building) + แรม (rɛɛm, to stay overnight) », IPA /roːŋ˧.rɛːm˧/ et une ligne
    Phonemic `โรง-แรม`. **C’est Wiktionary, et Wiktionary seule, qui porte la
    DÉCOMPOSITION en toutes lettres.** La politique de sources l’autorise pour
    recoupement et jamais en source unique : la note ne fait donc pas dire à
    l’apprenant que ces mots sont FORMÉS de deux morceaux. Elle lui fait
    constater ce qu’il lit sur la graphie affichée, et lui donne le sens de
    chaque morceau, sens attestés par trois sources.
  - en.wiktionary, entrées « เรียน » et « แรม », consultées en rendu à la
    consolidation le 2026-08-04 : เรียน, IPA /ria̯n˧/, section Verb « to learn; to
    study » ; แรม, IPA /rɛːm˧/, section Verb de son étymologie 2 « to stay
    overnight; to cause to stay overnight ». **Nuance conservée plutôt que
    lissée** : Wiktionary éclate แรม en quatre étymologies là où le RID n’a
    qu’une vedette à trois sens. Les deux sources concordent sur le SENS cité,
    elles divergent sur le découpage en lemmes, et la note n’enseigne aucun
    découpage.
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, relevée le
    2026-08-04 : ligne 83823, โรง, `n.`, « immeuble ; construction ; bâtiment ;
    établissement » ; ligne 84108, โรงเรียน, `n.`, « école ; établissement
    scolaire » ; ligne 84051, โรงแรม, `n.`, « hôtel ; auberge ». Corroboration
    de sens, pas troisième autorité indépendante sur la composition.
  - **VOLUBILIS v26.2, lignes de เรียน et de แรม, relevées à la consolidation le
    2026-08-04** par `node scripts/verification/volubilis-lookup.mjs` sur
    l’exemplaire authentifié avant citation, 10 848 409 octets, SHA-256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, la même
    empreinte que celle citée plus haut et que celle de l’en-tête du script :
    **ligne 82777**, เรียน, `v.`, colonne française « étudier ; apprendre ; faire
    des études ; assimiler ; se former à/aux » ; **ligne 80214**, แรม, `v.`,
    colonne française « passer la nuit ; loger ». Les deux gloses de la note
    reposent donc sur **trois** sources, dont le pivot français, et non plus sur
    Wiktionary seule. เรียน rend 2 lignes et แรม 3 : la limite d’affichage à cinq
    lignes du script versionné, signalée à l’arbitrage 1, ne joue pas ici et
    aucune variante non versionnée n’a été employée pour ces deux relevés.
  - **Ce que la segmentation doit à quoi.** Deux sources indépendantes coupent
    ces mots au même endroit sans qu’on ait à les croire sur parole : la ligne
    Phonemic de Wiktionary, `โรง-เรียน` et `โรง-แรม`, et la colonne de
    romanisation syllabée de VOLUBILIS, `-rōng-rīen` (ligne 84108) et
    `-rōng-raēm` (ligne 84051). C’est cette coupe, et elle seule, que la note
    demande à l’apprenant de constater sur la graphie affichée.
- Sources du fait « ร้าน désigne le lieu où l’on vend, et sert de tête à
  ร้านขายยา » :
  - RID 2554, entrée « ร้าน », relevée le 2026-08-04 : le mot désigne une
    plateforme surélevée où l’on s’installe ou où l’on vend, et, en toutes
    lettres, le lieu où l’on vend des choses. Le bloc ลูกคำ ne compte que trois
    composés, ร้านชำ, ร้านม้า et ร้านรวง, décompte fait mécaniquement le
    2026-08-04. C’est nettement moins que pour โรง, et cela mérite d’être dit :
    **le dictionnaire ne lexicalise PAS ร้านขายยา**, et `rid-lookup.mjs` rend
    bien `absent` pour cette graphie, relevé du même jour.
  - RID 2554, entrée « ขาย », même date : l’action d’échanger une chose contre de
    l’argent.
  - en.wiktionary, entrées « ร้าน » et « ขาย », consultées en rendu le
    2026-08-04 : ร้าน, IPA /raːn˦˥/, Paiboon `ráan`, nom « place for selling
    goods, as shop, store, etc. », **avec ร้านขายยา dans sa liste de mots
    dérivés** ; ขาย, IPA /kʰaːj˩˩˦/, Paiboon `kǎai`, verbe « to sell », dont la
    liste de dérivés porte également ร้านขายยา. La composition est donc attestée
    des deux côtés.
  - VOLUBILIS v26.2, `.xlsx` : ligne 81048, ร้าน, `n.`, « magasin ; boutique ;
    échoppe » ; ligne 29410, ขาย, `v.`, « vendre » ; ligne 81352, ร้านขายยา,
    `n. exp.`, « pharmacie ; officine ».
- **Ce que la note n’affirme PAS.** Elle ne dit rien de la fréquence de ces mots
  sur des supports réels, aucune source recevable ne mesurant cela ; elle ne dit
  pas que tout mot thaï long se décompose ainsi, ce qui serait faux ; elle ne dit
  rien de l’ancienneté de ces composés ; et elle ne traduit aucun des composés de
  โรง qu’elle ne nomme pas, faute d’avoir à les enseigner.
- **Cette déclaration était contredite par la première phrase de la note, et ne
  l’est plus.** La version antérieure ouvrait sur « un mot long, sur un panneau,
  est souvent un mot court plus une fonction », c’est-à-dire sur une fréquence
  d’affichage que la note déclarait quinze lignes plus bas ne pas affirmer.
  Finding B2 du contre-audit interne. La phrase a été remplacée par un fait de
  lexicographie sourcé, le rangement sous แม่คำ, qui est ce que les sources
  portent réellement. La page 2 portait la même faute, « un support porte souvent
  plusieurs mots », doublement fautive puisque **six des huit supports du jour
  n’en portent qu’un** : elle a été remplacée par le motif véritable du quatrième
  temps de lecture.

## Dossier de production

- Acteur de génération : Claude Opus 5 (`claude-opus-5[1m]`), rédaction originale
  le 2026-08-04. Aucune formulation reprise d’une source ; les définitions
  thaïes, anglaises et françaises citées dans les champs `sources` le sont à
  titre de preuve de consultation, jamais comme texte de leçon. Aucun écran
  d’apprenant ne restitue une définition du RID, contrainte issue du finding
  `SENS-MONO` du contre-audit de `u09-l9a`.
- Méthode de vérification : chaque fait linguistique est vérifié contre au moins
  deux autorités indépendantes réellement consultées le 2026-08-04, méthode
  d’accès consignée fait par fait selon l’amendement v1.2 de `CONVENTIONS.md`,
  et l’artefact Volubilis de référence est le `.xlsx` conformément à
  l’amendement v1.3.
- Toutes les consultations de ce dossier ont été faites le 2026-08-04.
- **Contrainte de sujet propre à l’unité 10, vérifiée avant rédaction et
  re-vérifiée après.** Aucun spécimen de ce fichier ne reproduit une enseigne, un
  nom de commerce, un prix relevé, un nom de rue ou un nom de station. Les huit
  supports sont déclarés construits en Méta, à la page 1, dans la section
  `## Spécimens construits` et à la page 13, soit quatre fois, sur des écrans
  différents. Les quatre montants affichés sont déclarés comme chiffres de
  lecture, et deux d’entre eux sont des reprises littérales de montants déjà
  publiés par `u07-l7e` et `u08-l8e`.
- **Contrainte de vocabulaire, vérifiée mécaniquement.** Les douze graphies
  thaïes affichées par les spécimens sont ตลาด, ห้องน้ำ, เปิด, ปิด, ร้านขายยา,
  โรงพยาบาล, รถเมล์, ข้าวผัด, ไข่, น้ำ, บาท et เสื้อ. Les dix qui ne sont pas des
  spécimens ont été cherchées une par une par
  `node scripts/verification/repo-thai-scan.mjs 1 9 --grep <graphie>` le
  2026-08-04, avec le résultat suivant, où le fichier indiqué est celui de la
  première publication :

  | Graphie   | Occurrences dans 1 à 9 | Première publication |
  | --------- | ---------------------- | -------------------- |
  | ตลาด      | 5                      | `u05-l5d`            |
  | ห้องน้ำ   | 3                      | `u05-l5c`            |
  | ร้านขายยา | 2                      | `u09-l9d`            |
  | โรงพยาบาล | 1                      | `u09-l9a`            |
  | รถเมล์    | 1                      | `u05-l5d`            |
  | ข้าวผัด   | 4                      | `u04-l4c`            |
  | ไข่       | 2                      | `u03-l3e`            |
  | น้ำ       | 7                      | `u02-l2c`            |
  | บาท       | 7                      | `u03-l3c`            |
  | เสื้อ     | 2                      | `u08-l8a`            |

  เปิด et ปิด rendent **0 occurrence** par la même commande, ce qui établit
  qu’ils sont neufs pour les unités 1 à 9 ; ils sont publiés par `u10-l10b` et
  réemployés ici.

### Sources employées et méthode d’accès

- **RID 2554** (Office of the Royal Society), autorité n° 1 en orthographe et en
  sens. Accès par requête POST unique par graphie sur
  https://dictionary.orst.go.th/func_lookup.php, paramètres
  `word=<graphie>&funcName=lookupWord&status=lookup`, requêtes espacées d’au
  moins 1,2 seconde par les scripts versionnés `rid-lookup.mjs` et
  `rid-entry.mjs`, agent utilisateur identifiant le projet. Décompte recomputable
  depuis les listes ci-dessous, dont la somme fait le total : **23 graphies
  distinctes interrogées, 0 erreur de requête, 21 attestées comme vedettes et
  2 absentes.** Le total était de 21 avant la consolidation du 2026-08-04 ;
  เรียน et แรม ont été ajoutées à ce moment-là pour résoudre le finding B3.
  **Cinq de ces graphies ont été re-interrogées par la consolidation elle-même**,
  sur des requêtes neuves et non sur la foi du dossier : ตลาด, โรง, ร้าน,
  โรงเรียน et โรงแรม, plus les deux nouvelles. Les autres restent au crédit du
  relevé d’auteur, re-vérifié par le contre-audit.
  - Attestées et citées comme preuve d’item (2) : เปิด, ปิด.
  - Attestées et citées comme spécimen ou comme contrôle de graphie publiée
    (10) : ตลาด, ห้องน้ำ, โรงพยาบาล, รถเมล์, เสื้อ, บาท, ข้าวผัด, ไข่, น้ำ,
    สถานี. La dernière n’est pas affichée par un spécimen : elle a été
    interrogée pendant la conception, comme candidate à un neuvième support,
    puis écartée pour tenir la fourchette de six à huit spécimens.
  - Attestées et citées à la note culturelle (7) : โรง, โรงเรียน, โรงแรม, ร้าน,
    ขาย, et depuis la consolidation du 2026-08-04 เรียน et แรม, ces deux
    dernières précisément pour que les gloses « apprendre » et « passer la nuit »
    cessent de reposer sur en.wiktionary seule.
  - Attestée, interrogée, citée au bloc ปิด comme confusion et non comme preuve
    (1) : ติด.
  - Attestée, interrogée, non citée (1) : หยุด, cherchée comme candidate à un
    support portant un seul mot et écartée. Le motif est celui de la contrainte
    d’unité : afficher หยุด sur un panneau aurait laissé croire que la leçon
    reproduit une signalisation réelle, ce qu’aucune source du projet ne permet
    d’affirmer.
  - **Absentes comme vedettes (2)** : ร้านขายยา et น้ำเปล่า. La première est une
    composition transparente déjà publiée par `u09-l9d`, dont la preuve
    d’existence vient de VOLUBILIS et de Wiktionary ; la seconde avait été
    envisagée pour la ligne d’eau du tableau de prix, et a été remplacée par น้ำ,
    qui est une vedette du RID et dont les champs publiés sont plus simples à
    réemployer fidèlement.
- **VOLUBILIS v26.2** (licence CC BY-SA 4.0), pivot français et corroboration de
  ton et de longueur.
  - **Exemplaire employé, authentifié avant toute citation.** `VOLUBILIS_Database.xlsx`,
    10 848 409 octets, SHA-256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, empreinte
    affichée par `volubilis-lookup.mjs` à chaque appel et identique à celle
    documentée dans l’en-tête du script comme à celle citée par `u08-l8a` et
    `u09-l9a`. **Le contrôle n’était pas une formalité** : le même répertoire de
    travail contient un fichier de 154 octets qui porte une extension `.xlsx` et
    qui est en réalité une page d’erreur HTML, exactement le piège consigné par
    `u09-l9a`. L’empreinte a donc été vérifiée avant la première citation, pas
    après.
  - **Une seule feuille.** `xl/workbook.xml` de cet exemplaire ne déclare qu’une
    feuille, `<sheet name="Volubilis" sheetId="1"/>`, relevé du 2026-08-04, et
    son chemin d’origine y est lisible, `version 26.2 JUL 2026`. Les feuilles
    `Codes` et `Romanization` que citent les unités 4 à 9 n’existent que dans le
    `.ods` : ce dossier ne les cite donc pas depuis le `.xlsx`, et la clé
    `TONES` est mentionnée comme convention déjà établie, non comme un relevé
    neuf.
  - **Numéros de ligne, tous rendus le 2026-08-04** par
    `node scripts/verification/volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <graphie>` :
    เปิด 77221 à 77225, ปิด 75953 à 75958 plus 110885 hors sujet, โรง 83823 et
    83824, โรงเรียน 84108, โรงแรม 84051, ร้าน 81048, ขาย 29410, ร้านขายยา 81352,
    ตลาด 96552 et 102433, ห้องน้ำ 16245, รถเมล์ 84669, et depuis la consolidation
    du 2026-08-04 **เรียน 82777 et 82778** (la 82777 étiquetée `v.` et glosée
    « étudier ; apprendre ») et **แรม 80212 à 80214** (la 80214 étiquetée `v.` et
    glosée « passer la nuit ; loger »). Le même relevé donne
    114 579 lignes non vides et 586 541 chaînes partagées, chiffres identiques à
    ceux de `u08-l8a` et de `u09-l9a`, ce qui confirme que l’exemplaire est bien
    le même. **Ces trois chiffres ont été revérifiés par la consolidation sur une
    extraction neuve, en même temps que l’empreinte du classeur.**
  - **Limite d’affichage du script versionné, et comment elle a été contournée
    sans le contourner.** `volubilis-lookup.mjs` n’affiche que les cinq premières
    lignes trouvées, alors que ปิด en compte sept. La sixième, la ligne 75958,
    est précisément celle qui porte l’étiquette `adj.` et la traduction
    « fermé ; clos », c’est-à-dire la preuve du second mot du champ `fr`. Elle a
    été lue par une variante de travail du script qui n’en change que la limite
    d’affichage, et la coïncidence des cinq premiers numéros de ligne entre les
    deux sorties valide la variante. **Arbitrage demandé** : porter au script
    versionné une option d’affichage complet, faute de quoi toute entrée à plus
    de cinq lignes est citée sur la foi d’un outil non versionné. Voir
    l’arbitrage 1.
  - **Portée réelle de cette source**, réserve conservée depuis `u06-l6a` et
    reprise par `u09-l9a` : la colonne `ThaiPhon` est une transcription d’auteur
    et une partie des entrées porte `RID` en colonne de domaine. VOLUBILIS reste
    qualifiée de corroboration partiellement indépendante, ce qui suffit au
    contrat d’item puisque Wiktionary fournit une seconde jambe de ton pour les
    deux mots de la porte. Les colonnes de niveau et de domaine ne sont citées nulle
    part comme preuve ; `TOURIST` n’est mentionné qu’à titre descriptif.
- **Wiktionary** (édition en, plus l’annexe « Appendix:Thai script »), pour le
  recoupement de prononciation, de ton, de définition et de valeur de finale.
  Consulté en rendu (`action=render`), les modèles de prononciation n’exposant
  pas l’IPA en wikitexte ; l’annexe a été relevée en source (`action=raw`).
  **Empreinte de l’annexe, recalculée le 2026-08-04 : 16 236 octets, SHA-256
  `c9776c6afa6404012931df495e27c703ab34d98fb6748a28d216016b624690f3`, valeur
  identique octet pour octet à celle consignée par `u09-l9a`. Empreinte
  RE-CALCULÉE par la consolidation le 2026-08-04, sur un téléchargement neuf :
  16 236 octets et la même SHA-256, au bit près.** Les lignes citées
  ici sont la 54 pour ด, la 68 pour ป, la 174 pour le graphème `เ◌ิ◌` et,
  **depuis la consolidation, la 148 pour `◌ิ`**, ajoutée parce que c’est elle qui
  établit que ปิด porte une AUTRE voyelle que เปิด et non la même en plus brève.
  L’annexe compte 219 lignes. Les
  éditions en et th et l’annexe sont traitées comme UN seul écosystème, jamais
  comme plusieurs sources indépendantes.
- **Unicode Standard 17.0** (Unicode Consortium), pour les faits d’encodage, les
  noms normatifs, la classe combinatoire et la position des signes.
  `UnicodeData.txt`, SHA-256
  `2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c`, et
  `IndicPositionalCategory-17.0.0.txt`, SHA-256
  `68cedc29a7e57f984d90fe2c7712f2e6d0c717e253db219607daea8997d6c480`, les deux
  empreintes identiques à celles employées par `u09-l9a`.

### Sources du fait de lecture central, la consonne initiale

La leçon répète une chose et une seule : le ton se lit sur la CONSONNE INITIALE
de la syllabe, jamais sur la première lettre écrite. Ce n’est pas un fait neuf,
c’est un fait du parcours, et il est rappelé ici parce que c’est l’erreur qui
revient le plus souvent.

- `u04-l4a`, page 6, relue dans le dépôt le 2026-08-04 : เ, แ, โ, ใ et ไ
  s’écrivent AVANT la consonne qu’elles accompagnent. La règle du ton en syllabe
  vivante y est énoncée sur la classe de la consonne initiale.
- Unicode 17.0, `IndicPositionalCategory-17.0.0.txt`, ligne 384 :
  `0E40..0E44 ; Visual_Order_Left`, sous le titre de section
  `# Indic_Positional_Category=Visual_Order_Left`. Le standard nomme donc la
  propriété que la page 3 enseigne. `PropList-17.0.0.txt` porte de son côté
  `0E40..0E44 ; Logical_Order_Exception`. **Les deux propriétés coexistent**, et
  ce dossier ne reproduit pas l’erreur que le contre-audit de `u09-l9a` a dû
  retirer : `Visual_Order_Left` est une valeur d’énumération, absente de
  `PropList.txt` par construction et non par inexistence. Aucune passe de
  remplacement ne doit être lancée sur ce nom.
- Relevé propre à cette leçon, vérifiable depuis la liste de la section
  `## Spécimens construits` sans outil : sur les douze graphies affichées,
  **quatre commencent par l’une des cinq voyelles écrites à gauche**, à savoir
  เปิด, โรงพยาบาล, ไข่ et เสื้อ, et **une cinquième en contient une sans
  commencer par elle**, รถเมล์. Le compte est fait sur la liste elle-même, qui
  est écrite en entier dans ce fichier, de sorte qu’un relecteur le refasse en
  regardant plutôt qu’en croyant.
- **Ce relevé était juste ici et faux ailleurs, et les deux endroits ont été
  alignés.** La Méta annonçait « cinq des douze graphies » sans le qualificatif,
  finding N6 du contre-audit interne, et l’exercice 1 annonçait « cinq des huit
  tirages », erreur de la même famille que le contre-audit n’avait pas relevée et
  que la consolidation a trouvée en recomptant. Les deux chiffres sont désormais
  produits par le même décompte mécanique sur les douze séquences NFC : **quatre
  graphies commencent par U+0E40..U+0E44, une seule en contient un sans commencer
  par lui**, et côté exercice 1 les tirages concernés sont les 3, 6 et 8 au
  premier signe plus le 7 à sa seconde syllabe, soit quatre.

### Sources et méthode du dialogue

Le dialogue n’est attesté nulle part comme bloc : il est COMPOSÉ à partir
d’ossatures publiées, et chacune est traçable dans le dépôt, relecture du
2026-08-04.

- « ขอโทษครับ » : item publié de `u08-l8d` et `u08-l8e`, graphie déjà lue en
  `u02-l2c` et `u05-l5e`.
- « [prédicat] + ไหม + ครับ » : ossature des items publiés ไกลไหม (`u05-l5e`),
  เขาสูงไหม (`u06-l6c`), มียาไหมครับ (`u09-l9d`) et ปวดหัวไหมครับ (`u09-l9e`).
  La leçon y place เปิด, publié par `u10-l10b`, dans la fente du prédicat.
  **C’est la
  seule liberté prise dans ce dialogue**, et elle repose sur le fait que เปิด est
  attesté comme prédicat d’état par deux sources, VOLUBILIS ligne 77225 étiquetée
  `adj.` et la section Adjective d’en.wiktionary.
- « [prédicat] + ค่ะ » comme réponse à une question en ไหม : ossature de l’item
  publié ไปครับ / ไปค่ะ (`u09-l9e`), qui répond exactement de cette façon à
  ไปหาหมอไหมครับ. La reprise du prédicat plutôt qu’un « oui » est donc un
  comportement déjà publié, pas une invention.
- « ขอบคุณครับ » : item publié de `u01-l1e` et `u02-l2c`.
- « ไม่เป็นไรค่ะ » : item publié de `u02-l2c`, déjà employé en réponse à un
  remerciement par `u05-l5e` et par `u09-l9a`.
- **Ce que cela ne garantit pas** : qu’un locuteur natif formulerait ces cinq
  répliques ainsi. Une composition à partir de blocs corrects peut produire un
  énoncé maladroit. Le dialogue est marqué comme le point le plus incertain de la
  leçon pour l’audit de naturalité. Voir l’incertitude 4.
- **Une réplique a été écrite puis RETIRÉE, et le motif est consigné.** La
  version initiale faisait répondre « ปิดค่ะ » à « เปิดไหมครับ », ce qui aurait
  employé les deux mots de la porte dans le dialogue. Elle a été retirée parce que
  répondre par l’ANTONYME à une question en ไหม n’est attesté par aucune source
  consultée, alors que répondre en reprenant le prédicat l’est, par `u09-l9e`.
  Employer les deux mots aurait été plus élégant et moins sûr. ปิด est mesuré par
  trois exercices, il ne perd rien.

### Vérification Unicode

Séquences NFC recalculées le 2026-08-04 et vérifiées comme STABLES, la forme NFC
étant identique à la chaîne source pour les douze graphies réemployées et pour
les quatre nombres.

| Graphie   | Séquence NFC                                                   |
| --------- | -------------------------------------------------------------- |
| เปิด      | U+0E40 U+0E1B U+0E34 U+0E14                                    |
| ปิด       | U+0E1B U+0E34 U+0E14                                           |
| ตลาด      | U+0E15 U+0E25 U+0E32 U+0E14                                    |
| ห้องน้ำ   | U+0E2B U+0E49 U+0E2D U+0E07 U+0E19 U+0E49 U+0E33               |
| ร้านขายยา | U+0E23 U+0E49 U+0E32 U+0E19 U+0E02 U+0E32 U+0E22 U+0E22 U+0E32 |
| โรงพยาบาล | U+0E42 U+0E23 U+0E07 U+0E1E U+0E22 U+0E32 U+0E1A U+0E32 U+0E25 |
| รถเมล์    | U+0E23 U+0E16 U+0E40 U+0E21 U+0E25 U+0E4C                      |
| ข้าวผัด   | U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14               |
| ไข่       | U+0E44 U+0E02 U+0E48                                           |
| น้ำ       | U+0E19 U+0E49 U+0E33                                           |
| บาท       | U+0E1A U+0E32 U+0E17                                           |
| เสื้อ     | U+0E40 U+0E2A U+0E37 U+0E49 U+0E2D                             |

Nombres affichés, mêmes date et méthode : ๔๐ = U+0E54 U+0E50 ; ๑๕ = U+0E51
U+0E55 ; ๑๐ = U+0E51 U+0E50 ; ๙๐ = U+0E59 U+0E50. Les dix chiffres portent dans
`UnicodeData.txt` les noms THAI DIGIT ZERO à THAI DIGIT NINE, la catégorie
générale `Nd`, la classe combinatoire 0 et les valeurs numériques 0 à 9, relevé
du 2026-08-04.

**Une décision de forme est déclarée ici plutôt que subie.** Les chiffres ne sont
PAS relistés comme bloc à champs dans ce fichier. `u03-l3b` item 8 les publie
sous une graphie unique séparée par des espaces, `๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙`, et son
champ `codepoints` omet les U+0020 : `item-fields-check.mjs` signale donc déjà
cet item comme non conforme, relevé du 2026-08-04 sur `lecon-3b.md`. Relister ce
bloc ici aurait dupliqué le défaut ou créé un écart de réemploi artificiel. Les
chiffres sont donc cités en prose et par référence. **Arbitrage demandé** :
corriger le champ `codepoints` de `u03-l3b` item 8, ou décider que le contrat
d’item admet une graphie composite séparée par des espaces. Voir l’arbitrage 3.

Points de rendu à contrôler à l’intégration, tous relevés depuis
`IndicPositionalCategory-17.0.0.txt` et `UnicodeData.txt` du 2026-08-04 :

- **เสื้อ empile deux signes de catégorie `Top` sur la même lettre**, U+0E37
  (`SARA UEE`, classe combinatoire 0) puis U+0E49 (`MAI THO`, classe 107). C’est
  la profondeur maximale du corpus : `repo-thai-scan.mjs 1 9 --stacked --pure`
  rend **46 graphies** empilant au moins deux signes et une profondeur maximale
  de 2, relevé du 2026-08-04, et เสื้อ en fait partie. **Une première version de
  ce paragraphe annonçait 19, chiffre lu sur la fin de la sortie du script au
  lieu de sa ligne de total** ; il a été recompté avant publication. C’est
  exactement le défaut que l’arbitrage 6 de `u09-l9a` a demandé de bannir, et il
  s’est présenté ici aussi. Sur une étiquette affichée en grand,
  les deux signes doivent rester lisibles l’un au-dessus de l’autre et ne pas
  fusionner ;
- **ห้องน้ำ code sa marque de ton AVANT le ำ**, U+0E19 puis U+0E49 puis U+0E33.
  U+0E33 est de catégorie générale `Lo`, pas une marque combinante, et porte une
  décomposition de compatibilité `<compat> 0E4D 0E32` que la forme NFC ne défait
  pas : la séquence reste stable, ce qui a été vérifié plutôt que supposé. Le
  rendu doit poser le ◌้ au-dessus du น et non au-dessus du ำ ;
- **รถเมล์ porte son U+0E4C en dernière position** : la troncature de fin de
  ligne ne doit jamais l’amputer, faute de quoi le mot deviendrait un autre mot.
  Contrainte déjà consignée par `u09-l9a` pour โทรศัพท์ ;
- **โรงพยาบาล et ร้านขายยา comptent neuf codes chacun**, les deux graphies les
  plus longues affichées aujourd’hui. Les deux doivent être vérifiées à 390 px
  sans césure au milieu d’une syllabe ;
- **cinq graphies contiennent une voyelle écrite à gauche**, เปิด, โรงพยาบาล,
  รถเมล์, ไข่ et เสื้อ, toutes couvertes par `0E40..0E44`. Cela doit rester
  visible dans les composants qui mettent la consonne initiale en évidence, faute
  de quoi la page 3 perdrait son argument ;
- aucun caractère de la zone à usage privé ne figure dans ce fichier.

### Contrôles internes au dépôt, tous recomputables le 2026-08-04

- `node scripts/verification/repo-thai-scan.mjs --check-u07` passe sans écart,
  dix chiffres sur dix. La convention de comptage est donc reproduite avant tout
  emploi, conformément à l’en-tête du script.
- `node scripts/verification/repo-thai-scan.mjs 1 9` rend 45 fichiers,
  429 entrées, 317 graphies distinctes, 103 portant ไม้เอก, 76 ไม้โท, 1 ไม้ตรี
  et 2 ไม้จัตวา.
- `node scripts/verification/repo-thai-scan.mjs 10 10` rendait **0 fichier**
  avant l’écriture de ce fichier. L’unité s’est ensuite remplie pendant la
  session, et la commande a rendu successivement 2 fichiers, puis 5 fichiers avec
  **34 entrées et 31 graphies**, puis, après le déplacement des deux blocs de
  เปิด et ปิด hors de `## Items`, **5 fichiers, 32 entrées et 31 graphies**.
  **10E contribue 0 entrée à ce total**, ce qui est la vérification mécanique de
  la contrainte « pas plus de deux items nouveaux » : elle est respectée par
  zéro, l’attribution étant revenue à 10B. Les douze graphies réemployées par 10E
  sont hors de `## Items` et ne sont donc pas comptées.
- `node scripts/verification/item-fields-check.mjs content/authoring/unite-10/lecon-10e.md`
  rend **0 champ `codepoints` en faute et 0 écart de réemploi**, relevé du
  2026-08-04. C’est le contrôle qui prouve que les douze blocs réemployés, dont
  ceux de เปิด et ปิด repris de `u10-l10b`, portent exactement les champs de la
  leçon qui les publie. Pour mémoire, le même script passé sur `--tout` avant
  l’écriture de ce fichier rendait 45 fichiers contrôlés, 13 champs `codepoints`
  en faute et 38 écarts de réemploi ; passé sur `--tout` après, il rend
  50 fichiers et **les mêmes 13 et 38** : les cinq fichiers de l’unité 10
  n’ajoutent ni aux uns ni aux autres.
- **Tous ces contrôles ont été REJOUÉS après la consolidation du 2026-08-04**, y
  compris après l’ajout de `registre` et de `litteral` aux douze blocs
  réemployés : `item-fields-check.mjs` sur ce fichier rend toujours **0 et 0**,
  `--unite 10` rend **0 et 0** sur les cinq fichiers, `--tout` rend toujours
  **50 fichiers, 13 et 38**, et `repo-thai-scan.mjs 10 10` rend toujours
  **5 fichiers, 32 entrées, 31 graphies**. Compléter deux champs que le script ne
  compare pas n’a donc rien déplacé de ce qu’il compare, ce qui est la preuve
  qu’attendait le finding N3.
- **Contrôles de forme, rejoués sur le fichier consolidé** : 0 tiret cadratin,
  0 tiret demi-cadratin, 0 apostrophe droite U+0027, toutes les apostrophes du
  fichier étant en U+2019, fichier NFC-stable dans son entier, 164 suites thaïes
  distinctes toutes NFC-stables, 0 caractère de la zone à usage privé. Les douze
  graphies affichées rendent au décompte mécanique **quatre** débuts en
  U+0E40..U+0E44 et **une** occurrence interne sans début, ce qui est la source
  des chiffres de la Méta et de l’exercice 1.

### Incertitudes signalées par l’auteur

1. **Ce bilan a été conçu à l’aveugle, et cela se voit encore.** Le fichier a
   été écrit alors qu’AUCUNE autre leçon de l’unité n’existait dans le dépôt ;
   les quatre autres sont apparues ensuite, pendant la même session. Un bilan
   conçu dans ces conditions est un bilan partiel, quelle que soit la rigueur de
   ce qui suit. **Un des risques annoncés s’est réalisé et a été corrigé** : 10B
   publie เปิด et ปิด, l’attribution lui est revenue, et les deux blocs sont
   sortis de `## Items`. **Trois risques restent OUVERTS.** La carte
   `srs-u10-l10e-01` peut recouvrir les cartes de 10A, dont le titre même, « Lire
   sans transcription », désigne la compétence qu’elle mesure. Les spécimens
   n’emploient aucun mot de 10C ni de 10D, alors que ราคา, อาหาร, หมู, กิโล et
   ครึ่ง auraient été de bons candidats. Et le spécimen 7, un tableau de prix,
   recouvre partiellement le sujet de 10C, « Lire un menu », ce qui est normal
   pour un bilan mais doit être vérifié plutôt que supposé normal. Les trois sont
   des questions de recouvrement, pas des erreurs de fait. Piste de résolution :
   la consolidation de l’unité, avec le relevé `repo-thai-scan.mjs 10 10` refait
   à ce moment-là.
2. **La classe grammaticale de ปิด dans son emploi d’état n’est pas établie.**
   VOLUBILIS lui donne une ligne `adj.` ; en.wiktionary ne lui donne aucune
   section Adjective, alors qu’il en donne une à เปิด, et range le même contenu
   sous Verb ; le RID ne pose aucune étiquette. La traduction « fermé » tient sur
   deux sources concordantes, le sens ne pose donc pas de problème, mais la
   leçon n’enseigne AUCUNE règle de classe et se contente d’afficher les deux
   traductions. Piste de résolution : une grammaire de référence sur exemplaire,
   la première des trois listées par la politique de sources.
3. **Le ton des syllabes fermées par une occlusive reste hors programme, et
   l’incertitude 6 de `u09-l9a` demandait que ce soit arbitré au niveau de
   l’unité 10.** 10E ne l’arbitre pas, et **aucune des quatre autres leçons ne
   l’arbitre non plus**, relevé du 2026-08-04 : 10A range le ton des syllabes
   mortes hors programme et apprend seulement à les reconnaître, 10B écrit que
   4 de ses 11 syllabes ont un ton donné et non calculé, 10C et 10D tiennent la
   même ligne. **L’unité 10 tout entière a donc reçu la question posée par
   `u09-l9a` et l’a laissée ouverte, cinq fois.** เปิด et ปิด en sont des
   exemples directs, et leurs tons sont donnés plutôt que calculés. Ce n’est pas
   une incertitude de fait, c’est un manque de curriculum, et c’est le sixième
   signalement. Il ne peut plus être traité leçon par leçon.
4. **Naturalité du dialogue.** Composé à partir de cinq ossatures publiées,
   jamais attesté comme bloc. La seule liberté prise est de placer เปิด dans la
   fente du prédicat d’une question en ไหม, et elle repose sur deux attestations
   de l’emploi d’état. La réplique retirée « ปิดค่ะ » est documentée plus haut
   plutôt que supprimée en silence.
5. **Limite de fond des exercices 1 et 3 : ils emploient du vocabulaire déjà
   su.** Six des huit tirages de l’exercice 1 et six des huit de l’exercice 3
   portent sur des mots publiés avant l’unité 10, que l’apprenant peut
   reconnaître de mémoire plutôt que lire. **C’est structurel pour une leçon de
   lecture appliquée** : lire du thaï réel suppose de lire des mots connus, et
   introduire du vocabulaire inconnu pour éviter ce biais reviendrait à mesurer
   autre chose. Les seuils restent atteignables en écartant les tirages de
   mémoire, ce qui limite l’effet sans l’annuler. La même limite avait été
   signalée par l’incertitude 5 de `u09-l9a`. Piste de résolution : mesurer, sur
   les données produit, l’écart de réussite entre les tirages เปิด et ปิด, jamais
   vus, et les six autres.
6. **Aucun audio n’est produit.** L’exercice 3 en dépend intégralement. Trois
   contraintes à consigner avant enregistrement. Premièrement, les huit tirages
   doivent être produits par la MÊME voix, faute de quoi la variation entre
   locuteurs fournirait un indice parasite. Deuxièmement, เปิด et ปิด doivent
   être enregistrés dans la même session et vérifiés comme distincts **par la
   seule voyelle, un `oee` long contre un `i` bref**, leur ton étant identique :
   un enregistrement qui les séparerait aussi
   par la hauteur mesurerait autre chose que ce que l’exercice annonce.
   **La voyelle est nommée ici depuis la consolidation du 2026-08-04** : la
   version antérieure disait « la SEULE voyelle » sans jamais dire laquelle, ce
   qui laissait la production audio sans critère de contrôle, et c’est un des
   symptômes du finding B1.
   Troisièmement, les fermetures `t` doivent être produites sans détente audible,
   contrôle déjà exigé par `u05-l5a` et `u09-l9a`.
7. **Les seuils de cette leçon n’ont pas été calibrés sur des apprenants.** Les
   planchers sont calculés, donc exacts ; les seuils, 7 sur 8, 6 sur 6, 7 sur 8,
   5 sur 6 et 3 sur 4, sont choisis par cohérence avec `u09-l9a` et non mesurés.
   Un seuil trop haut sur un bilan décourage, un seuil trop bas ne mesure rien.
   Piste de résolution : les revoir après la bêta, sur des taux de réussite
   réels.

8. **La lecture d’un nombre à deux chiffres est enseignée et n’est mesurée par
   aucun exercice.** Les pages 10 et 11 font lire ๔๐, ๑๕, ๑๐ et ๙๐ ; l’exercice 2
   n’apparie que des chiffres isolés, et seulement ๕ et ๙ parmi ceux que les
   spécimens affichent ; l’exercice 1 écarte le spécimen 7 parce que son jeu de
   réponses est fait de sens. L’objectif observable ne revendique pas cette
   compétence, la leçon est donc cohérente avec elle-même, mais l’écart entre ce
   qui est enseigné et ce qui est mesuré est réel. **Incertitude ouverte par la
   consolidation du 2026-08-04, à partir du finding N2.** Piste de résolution à
   l’arbitrage 10, avec le calcul de plancher qui interdit la solution la plus
   évidente.
9. **L’exercice 3 garde une fuite de déduction, bornée et mesurée.** La
   correction différée ramène le dernier tirage d’une certitude à une chance sur
   deux dans une branche seulement ; dans l’autre, celle où l’unique erreur de
   l’apprenant a porté sur une carte encore non attribuée, il reste déductible.
   C’est le cas que produit la confusion เปิด contre ปิด, donc le plus fréquent.
   **Incertitude ouverte par la consolidation du 2026-08-04, à partir du finding
   N1.** Piste de résolution à l’arbitrage 9 : la fermeture complète demande de
   trancher, au niveau de la mécanique `listening` du dépôt, si un corrigé peut
   ne pas être une bijection sans dégrader le plancher de réponse constante.

**Neuf incertitudes sont signalées, dont HUIT ouvertes**, la 1 à la 5 plus les 7,
8 et 9 ;
la 6 est une contrainte de production, pas une question ouverte. Une seule touche
un fait enseigné, la 2, et la leçon la
traite en n’enseignant pas le point litigieux. Les 1 et 3 demandent un arbitrage
de parcours plutôt qu’une source. Les 4, 5 et 7 sont des limites de méthode
consignées. Les 8 et 9 sont nées du contre-audit interne et sont des limites de
MESURE : ce qui n’est pas mesuré est nommé plutôt que couvert par un tableau
optimiste.

### Contre-audit interne, PASSÉ le 2026-08-04, et ce qu’il a changé

Un agent de contre-audit indépendant, à consigne adversariale, a relu ce fichier
le 2026-08-04. Son rapport est `content/authoring/unite-10/verification-10e.md`,
32 879 octets, SHA-256
`0279fff50019201e92393ac5c6628854d80407e9816a5cba50d9c007642951b2`, empreinte
relevée avant lecture. Il rend **78 faits re-vérifiés et confirmés**, et
**12 findings, dont 4 BLOQUANTS**.

**Méthode de la consolidation.** Aucun finding n’a été appliqué sur parole.
Chacun a été re-mesuré avant correction, sur des relevés neufs du 2026-08-04 :
RID re-interrogé pour ตลาด, โรง, ร้าน, โรงเรียน, โรงแรม, เรียน et แรม ;
en.wiktionary re-récupéré en rendu pour ปิด, เปิด, โรงเรียน, โรงแรม, เรียน et
แรม ; annexe « Appendix:Thai script » re-téléchargée en source et re-empreintée ;
`VOLUBILIS_Database.xlsx` re-empreinté avant citation ; `repo-thai-scan.mjs`,
`item-fields-check.mjs` et un décompte mécanique des séquences NFC rejoués. Deux
chiffres du rapport d’audit ont été trouvés faux à cette re-mesure et ne sont pas
repris tels quels, voir N2 et N5 ci-dessous.

| Finding                                                   | Verdict de la re-mesure                                                                                                                                                                                                   | Ce qui a été fait                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1** contraste เปิด / ปิด enseigné comme une durée      | **CONFIRMÉ.** Annexe ligne 174 `sara oe` IPA `ɤ`, ligne 148 `sara i` IPA `i` : deux graphèmes distincts. Vérifié sur un téléchargement neuf, 16 236 o, même SHA-256. Mots : /pɤːt̚˨˩/ contre /pit̚˨˩/                       | CORRIGÉ en huit endroits : Méta (cible phonétique et « ce que la leçon enseigne »), page 6 réécrite avec la paire côte à côte, page 14, `note_fr` de เปิด et de ปิด, feedbacks correct et incorrect de l’exercice 3, incertitude 6. Un bloc de sources neuf établit la QUALITÉ, l’ancien garde la LONGUEUR                                                                                                |
| **B2** fréquence d’affichage non sourcée                  | **CONFIRMÉ**, et le décompte de l’audit est exact : six des huit supports ne portent qu’un mot                                                                                                                            | SUPPRIMÉ aux deux endroits. Note culturelle : ouverture remplacée par le rangement sous แม่คำ, fait de lexicographie attesté par le RID. Page 2 : motif du quatrième temps remplacé par le motif réel, vérifié contre la page 14 de `u09-l9a`                                                                                                                                                             |
| **B3** gloses de เรียน et แรม mono-sourcées, RID sur-cité | **CONFIRMÉ.** Le RID atteste le rattachement à โรง et rien de plus                                                                                                                                                        | RE-SOURCÉ, pas supprimé : RID interrogé pour เรียน (sens ๑, `ก.`) et แรม (sens ๓, `ก.`), plus VOLUBILIS lignes 82777 et 80214 avec pivot français. Les deux gloses tiennent sur TROIS sources. « Deux autorités indépendantes, même analyse » est retiré et remplacé par ce que chaque source porte réellement. La décomposition reste attribuée à Wiktionary seule, et n’est plus affirmée à l’apprenant |
| **B4** « trois reprises » au lieu de cinq                 | **CONFIRMÉ par décompte mécanique** : 5 lignes portant `Antonym` sur la page ปิด mise à plat, sous « to close », « to block; to stop », « to be out of action; to stop work », « to turn off » et « to hide; to conceal » | CORRIGÉ en « cinq reprises », avec la méthode de décompte consignée dans la citation elle-même                                                                                                                                                                                                                                                                                                            |
| **N1** « aucune réponse ne se déduit des précédentes »    | **CONFIRMÉ faux** : huit tirages sur huit cartes forment une bijection                                                                                                                                                    | Phrase RETIRÉE. Trois mesures pesées et chiffrées ; retenue la correction différée. Les deux écartées le sont sur calcul, tirage avec remise faisant passer le plancher de réponse constante de 1/8 à 4/8. Fuite résiduelle déclarée et portée à l’incertitude 9 et à l’arbitrage 9                                                                                                                       |
| **N2** couverture de l’exercice 2 surestimée              | **CONFIRMÉ sur le fond, FAUX sur le chiffre.** L’audit écrit « cinq des huit tokens sont hors tirage » ; le recompte donne **six sur huit** (๔ ๐ ๑ ๑ ๐ ๐), soit trois chiffres distincts sur cinq                         | Cellules `tout` remplacées par ๕ et ๙. Note corrigée. Le chiffre publié est celui de la consolidation, pas celui de l’audit. Ajout d’une manche de montants ÉCARTÉ sur calcul de plancher, 1/4! = 4,17 %                                                                                                                                                                                                  |
| **N3** champs `registre` et `litteral` omis               | **CONFIRMÉ** par extraction champ par champ des leçons qui publient                                                                                                                                                       | COMPLÉTÉ : `registre : neutre` ajouté aux dix blocs, `litteral` aux quatre qui en ont un, valeurs copiées à l’identique. Le préambule dit maintenant exactement ce qui est copié et ce qui ne l’est pas, `note_fr` et `sources` de la porte étant propres à 10E                                                                                                                                           |
| **N4** Méta décrit mal 10C                                | **CONFIRMÉ mécaniquement** : `--grep` rend 0 occurrence dans les unités 1 à 9 pour ข้าวผัดหมู comme pour ข้าวผัดไก่                                                                                                       | CORRIGÉ : 10C publie cinq graphies neuves et n’en reliste que trois. La Méta concorde désormais avec l’arbitrage 7                                                                                                                                                                                                                                                                                        |
| **N5** réécriture de ตลาด                                 | **CONFIRMÉ** : `[ตะหฺลาด]` fait sept codes contre quatre, trois signes ajoutés, ะ, ห et ◌ฺ. Relevé refait par `rid-entry.mjs`                                                                                             | CORRIGÉ, mais **PAS avec la formulation proposée par l’audit**. Voir l’écart déclaré ci-dessous                                                                                                                                                                                                                                                                                                           |
| **N6** « cinq des douze graphies »                        | **CONFIRMÉ** : quatre au niveau du mot, une cinquième à sa seconde syllabe                                                                                                                                                | CORRIGÉ dans la Méta. Une erreur de la MÊME famille, non relevée par l’audit, a été trouvée à l’exercice 1, « cinq des huit tirages » : corrigée en quatre                                                                                                                                                                                                                                                |
| **N7** « lettres » flottant                               | **CONFIRMÉ** : ห้องน้ำ fait 7 codes dont 5 lettres, ร้านขายยา 9 codes dont 8 lettres                                                                                                                                      | CORRIGÉ aux pages 5 et 7, et aussi à la page 9 et dans les deux `note_fr` de la porte, que l’audit n’avait pas relevées. Le vocabulaire du parcours entier n’est PAS tranché ici, voir l’arbitrage 11                                                                                                                                                                                                     |
| **N8** « calque du français »                             | **CONFIRMÉ** : l’ordre fautif décrit n’est le calque d’aucun ordre français                                                                                                                                               | SUPPRIMÉ, et le piège du tirage 4 avec, même défaut non relevé par l’audit. Les deux sont rattachés à l’ordre du bloc publié, vérifiable par l’apprenant, conformément à la section 1 bis de la politique de sources                                                                                                                                                                                      |

**Deux écarts déclarés, où la correction proposée par l’audit n’a pas été
appliquée telle quelle.**

1. **N5.** L’audit proposait d’écrire à l’apprenant que « c’est ce ห qui commande
   le ton bas de la seconde syllabe ». **Refusé.** Cette phrase enseignerait le
   mécanisme de la consonne de tête, que la Méta place explicitement hors
   programme, et l’affirmerait sans source : aucune des sources de ce dossier ne
   porte cette règle, et la politique n’admet pas un fait grammatical non sourcé.
   La correction retenue dit ce que la réécriture AJOUTE, trois signes nommés,
   fait vérifiable à l’écran par comptage, et laisse le mécanisme fermé.
2. **N2.** Le chiffre de l’audit, « cinq des huit tokens hors tirage », est faux :
   le recompte donne six. Le fichier publie le chiffre re-mesuré. L’audit avait
   probablement compté les cinq chiffres DISTINCTS affichés au lieu des huit
   tokens.

**Ce que la consolidation a trouvé en plus de l’audit**, et qui est corrigé :
l’exercice 1 annonçait « cinq des huit tirages » au lieu de quatre ; les
`note_fr` de เปิด et de ปิด comptaient des « lettres » en incluant le ◌ิ ; la
page 9 faisait de même avec le ◌์ ; le piège du tirage 4 de l’exercice 5
expliquait une erreur par le français sans plus de fondement que celui du
tirage 2 ; et un piège de l’exercice 3 décrivait comme une erreur un tirage qui
donne la bonne carte.

**Cible mouvante, signalée.** `lecon-10b.md` et `lecon-10c.md` ont changé de
taille et d’empreinte pendant la consolidation, plusieurs fois. Les relevés qui
les concernent sont datés du 2026-08-04 et portent l’empreinte lue au moment de
la lecture : 10B à `d8c2df7efbf2c621` pour les champs de เปิด et ปิด, qui
concordent alors sans écart avec ceux de 10E. **Toute relecture ultérieure doit
refaire ces deux relevés plutôt que les croire**, exactement pour le motif que
l’arbitrage 6 énonce déjà.

### État des audits

| Dimension                 | État                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe               | vérifiée, 12 graphies réemployées sur 12 contrôlées au RID le 2026-08-04, 11 attestées comme vedettes, la douzième étant une composition transparente déjà publiée                                                                                                                                          |
| Sens                      | vérifié pour les 2 traductions doubles de เปิด et ปิด, RID plus VOLUBILIS plus Wiktionary ; la classe grammaticale de l’emploi d’état de ปิด est NON ÉTABLIE, incertitude 2                                                                                                                                 |
| Prononciation, ton        | vérifié pour เปิด et ปิด sur deux sources indépendantes du RID ; les dix autres graphies gardent les champs de la leçon qui les publie                                                                                                                                                                      |
| Longueur                  | vérifiée pour เปิด et ปิด ; l’écart entre la table de graphèmes de l’annexe et les entrées de mots est déclaré au bloc เปิด et tranché par les sources de mot                                                                                                                                               |
| Qualité vocalique         | vérifiée à la consolidation du 2026-08-04, annexe lignes 174 (`sara oe`, `ɤ`) et 148 (`sara i`, `i`) : เปิด et ปิด portent deux voyelles DISTINCTES, fait que le fichier enseignait faussement comme une durée, finding B1                                                                                  |
| Registre                  | neutre et sourcé pour เปิด et ปิด, sur les emplois enseignés seulement                                                                                                                                                                                                                                      |
| Réemploi                  | **0 champ en faute et 0 écart** par `item-fields-check.mjs` le 2026-08-04, contrôle rejoué après consolidation ; 12 blocs réemployés, tous hors de `## Items` pour ne pas être publiés deux fois ; `registre` et `litteral`, que le script ne compare pas, ont été complétés à la consolidation, finding N3 |
| Naturalité                | NON VÉRIFIÉE pour le dialogue, voir l’incertitude 4                                                                                                                                                                                                                                                         |
| Unicode                   | vérifié, séquences NFC stables, empilement maximal 2 relevé par script, aucune zone à usage privé                                                                                                                                                                                                           |
| Décomptes internes        | produits par `repo-thai-scan.mjs`, convention revalidée par `--check-u07` le 2026-08-04 ; aucun chiffre de ce dossier n’est écrit sans la commande qui le rend                                                                                                                                              |
| Planchers d’exercice      | CALCULÉS pour les cinq exercices, y compris pour la meilleure heuristique de position de l’exercice 5 ; les SEUILS, eux, ne sont pas calibrés, voir l’incertitude 7                                                                                                                                         |
| Contrainte de spécimens   | vérifiée, 8 supports construits, déclarés quatre fois sur des écrans différents, aucune enseigne, aucun nom de rue ou de station, aucun prix présenté comme relevé                                                                                                                                          |
| Contrainte de vocabulaire | vérifiée mécaniquement, 10 graphies sur 10 retrouvées dans les unités 1 à 9 par `repo-thai-scan.mjs --grep` ; เปิด et ปิด viennent de `u10-l10b`, donc de l’unité 10                                                                                                                                        |
| Licence                   | vérifiée, aucun texte de définition recopié, aucune formulation reprise, aucune définition restituée sur un écran d’apprenant                                                                                                                                                                               |
| Coordination d’unité      | IMPOSSIBLE À CLORE : 10A, 10B et 10D absentes, 10C apparue après la rédaction et non intégrée, voir l’incertitude 1 et les arbitrages 6 et 7                                                                                                                                                                |
| Contre-audit interne      | **PASSÉ le 2026-08-04**, consigne adversariale, rapport `verification-10e.md` (sha256 `0279fff5…642951b2`) : 78 faits confirmés, 12 findings dont 4 bloquants. **Les 12 sont traités**, 2 avec un écart déclaré et argumenté, plus 6 défauts trouvés par la consolidation elle-même                         |
| Contre-audit externe      | **NON LANCÉ.** Lot à préparer                                                                                                                                                                                                                                                                               |
| Revue native              | EN ATTENTE                                                                                                                                                                                                                                                                                                  |

### Ce que le contre-audit doit attaquer en priorité

**Le contre-audit interne est passé le 2026-08-04 et ses douze findings sont
traités**, mais aucun contre-audit EXTERNE ne l’est, et rien ici ne doit être lu
comme validé. Trois des huit points ci-dessous ont déjà été attaqués et tiennent :
le point 2, les cinq planchers, a été recalculé par l’auditeur puis une seconde
fois à la consolidation, aux mêmes valeurs ; le point 6, la fidélité des douze
blocs, rend toujours 0 écart après complétion de `registre` et `litteral` ; le
point 7, les 28 ลูกคำ de โรง, a été recompté sur une requête neuve, au même
chiffre. Le point 3, le champ `longueur` de เปิด, a reçu une réponse partielle :
l’annexe a été jugée sans autorité sur la LONGUEUR d’un mot, mais le contre-audit
a montré qu’elle en a une sur la QUALITÉ de la voyelle, et c’est ce qui a produit
le finding B1. Les points à attaquer d’abord, dans cet ordre :

1. **la contrainte d’unité**, en cherchant activement toute phrase qui pourrait
   se lire comme une affirmation sur un support réel, un prix réel, une enseigne
   ou un lieu existant. C’est la contrainte la plus facile à enfreindre sans s’en
   apercevoir, parce qu’une leçon qui s’appelle « Une rue thaïe » invite
   naturellement à décrire une rue ;
2. **les cinq planchers d’exercice**, à recalculer un par un, et notamment le
   1,5 % de l’exercice 5, qui dépend de l’hypothèse que ครับ est en dernière
   place dans les quatre réponses. Si une seule des quatre réponses ne finit pas
   par ครับ, le calcul change ;
3. **le champ `longueur` de เปิด**, et la façon dont ce dossier traite l’écart
   entre l’annexe et les entrées de mots. La conclusion est-elle juste, ou
   l’annexe a-t-elle raison contre les deux entrées ?
4. **la ligne 75958 de VOLUBILIS**, lue par une variante de travail du script
   versionné, à recomputer autrement ;
5. **la naturalité du dialogue**, et en particulier le placement de เปิด dans la
   fente du prédicat d’une question en ไหม ;
6. **la fidélité des douze blocs réemployés**, à recomputer par
   `item-fields-check.mjs` plutôt qu’à lire, et en particulier ceux de เปิด et
   ปิด, repris de `u10-l10b` après exécution de l’arbitrage d’attribution ;
7. **le décompte de 28 ลูกคำ sous โรง**, à recompter depuis la sortie du script
   versionné ;
8. **le recouvrement avec 10A**, « Lire sans transcription ». Deux leçons de la
   même unité enseignent la lecture sans transcription, et ce fichier n’a pas pu
   lire l’autre au moment de sa conception. La question à poser est simple : ce
   bilan mesure-t-il autre chose que 10A, ou la répète-t-il ?

### Arbitrages à porter hors de cette leçon

Une leçon ne modifie ni `content/authoring/CONVENTIONS.md`, ni
`docs/content-policy/sources-verification.md`, ni les scripts du dépôt, ni les
cartes SRS d’une autre leçon. Ces points sont donc SIGNALÉS et attendent un
arbitrage au niveau du dépôt.

1. **`volubilis-lookup.mjs` n’affiche que cinq lignes par graphie.** L’entrée ปิด
   en compte sept, et la sixième est celle qui porte la preuve citée au bloc ปิด.
   Un dossier qui a besoin de la sixième ligne doit donc sortir du script
   versionné, ce que l’amendement v1.2 cherche précisément à éviter. **Arbitrage
   demandé** : ajouter une option d’affichage complet, par exemple `--tout`, et
   recomputer ensuite cette citation avec le script versionné seul.
2. **Le fil des tons demande un entretien, et le parcours répond par une carte de
   plus à chaque leçon.** `u08-l8a` puis `u09-l9a` l’ont signalé, et 10E le
   signale pour la sixième fois. Elle a choisi de ne PAS créer de carte de ton et
   d’apporter ses tirages aux deux cartes existantes, `srs-u07-l7a-03` et
   `srs-u04-l4a-06` ; mais une leçon ne peut pas modifier la carte d’une autre.
   **Arbitrage demandé** : soit exécuter l’ajout à la consolidation, soit acter
   que chaque leçon crée sa propre carte et assumer le recouvrement, mais cesser
   de le signaler sans le trancher.
3. **Le champ `codepoints` de `u03-l3b` item 8 est signalé non conforme par
   `item-fields-check.mjs`.** La graphie `๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙` contient neuf
   U+0020 que le champ omet. Ce n’est pas une faute de fait, c’est une graphie
   composite que le contrat d’item n’a pas prévue. **Arbitrage demandé** : soit
   corriger le champ, soit admettre explicitement la graphie composite dans le
   contrat d’item et adapter le script. 10E n’a pas relisté ce bloc pour ne pas
   dupliquer le défaut, et le signale plutôt que de le contourner en silence.
4. **L’attribution de เปิด et ปิด est RÉGLÉE, mais elle laisse une demande.**
   10B publie, 10E réemploie, et le déplacement a été fait dans ce fichier.
   Reste que 10E enseigne à lire ces deux mots SUR UN SUPPORT, et que la carte
   de vocabulaire qui les porte appartient à 10B. **Arbitrage demandé** :
   élargir le critère de la carte de 10B à la reconnaissance sur support, ou
   accepter que le spécimen 3 ne soit pas couvert par le SRS. Une leçon ne
   modifie pas la carte d’une autre.
5. **La carte de bilan d’unité `srs-u10-bilan-01` ne peut pas être écrite par une
   leçon seule.** **Arbitrage demandé** : décider si le bilan d’unité appartient
   à la leçon E ou à la consolidation. Le parcours a jusqu’ici laissé les leçons E
   l’écrire, ce qui suppose qu’elles soient rédigées après les quatre autres ;
   ce n’était le cas ni pour `u09-l9e` ni pour ce fichier.
6. **Les quatre autres leçons sont apparues après la rédaction, et leur
   vocabulaire nouveau n’est pas employé par les spécimens.** ราคา, le prix,
   irait en tête du tableau de prix du spécimen 7 ; อาหาร, หมู, ทางเข้า, ทางออก,
   กิโล et ครึ่ง feraient d’autres spécimens crédibles, et un bilan d’unité
   gagnerait à faire relire ce que l’unité vient d’enseigner. 10E n’a pas intégré
   ces mots à chaud, parce que ces fichiers apparaissaient et changeaient pendant
   la session et qu’une leçon ne bâtit pas un spécimen sur une cible mouvante ;
   seule la correction d’attribution, qui touchait une erreur avérée, a été faite
   immédiatement. **Arbitrage demandé** : à la consolidation, décider quels mots
   de 10A à 10D doivent entrer dans les spécimens, en relisant leurs champs à ce
   moment-là plutôt qu’en les recopiant depuis ici. Le même arbitrage doit
   vérifier que le tableau de prix du spécimen 7 ne fait pas double emploi avec
   le menu de 10C, et que `srs-u10-l10e-01` ne double pas les cartes de 10A.
7. **Les leçons de l’unité 10 emploient deux conventions différentes pour
   relister un item réemployé.** 10A place huit réemplois dans `## Items`, 10C
   en place trois, ce qui les fait compter par `repo-thai-scan.mjs` au crédit de
   l’unité 10 alors que les unités 1 à 9 les publient ; 10E place ses douze
   réemplois hors de `## Items`, précisément pour ne pas être comptée deux fois.
   Les trois fichiers sont fidèles au sens de `item-fields-check.mjs`, qui rend
   0 écart sur chacun : le désaccord porte sur le comptage, pas sur les champs.
   Le relevé du 2026-08-04 chiffre l’effet : sur les 31 graphies que
   `repo-thai-scan.mjs 10 10` attribue à l’unité, **onze sont en réalité
   publiées par les unités 1 à 9**. **Arbitrage demandé** : fixer UNE convention
   dans `CONVENTIONS.md`, puis aligner les cinq fichiers. Sans cela, le décompte
   de graphies d’une unité dépend de l’endroit où chaque auteur a rangé ses
   réemplois, ce qui rend le chiffre ininterprétable.
8. **ราคา est publié deux fois dans l’unité 10**, par 10C item 2 et par 10D
   item 1. C’est une collision d’attribution interne, du même genre que les cinq
   de l’unité 9, et elle ne concerne ni les spécimens ni les cartes de ce
   fichier. 10E la signale parce qu’elle est la leçon de bilan et que personne
   d’autre ne balaye l’unité entière ; elle ne la corrige pas, une leçon ne
   réécrivant pas la Méta d’une autre. **Arbitrage demandé** : appliquer la règle
   du dépôt, 10C publie et 10D réemploie, puis vérifier la concordance des champs
   par `item-fields-check.mjs` et l’absence de carte SRS en double.

9. **Un corrigé de `listening` peut-il ne pas être une bijection ?** Ouvert par le
   finding N1 du contre-audit interne. Huit tirages sur huit cartes distinctes
   garantissent le meilleur plancher de réponse constante du fichier, 1 sur 8,
   mais rendent la dernière réponse déductible. Les deux façons évidentes de
   fermer la déduction ont été chiffrées ici et sont pires : le tirage avec
   remise fait monter le plancher à 4 sur 8, et neuf tirages sur huit cartes
   laissent la déduction ouverte dans 7 cas sur 9. 10E a donc retenu la
   correction différée, qui borne la fuite sans la fermer. **Arbitrage demandé** :
   trancher au niveau de la mécanique `listening` du dépôt, une fois, plutôt que
   leçon par leçon, puisque le compromis est le même partout.
10. **La lecture d’un montant en chiffres thaïs n’est mesurée nulle part.**
    Ouvert par le finding N2. Elle est enseignée aux pages 10 et 11 de cette
    leçon, et `u03-l3b` publie les chiffres en reconnaissance seule. La solution
    la plus évidente, une manche d’appariement de quatre montants, a été écartée
    ici sur calcul : plancher de hasard 1/4! soit 4,17 %, le plus faible du
    fichier, et paires partageant ๐ et ๑. **Arbitrage demandé** : décider si la
    lecture d’un nombre à deux chiffres est une compétence mesurée du parcours,
    et si oui par quelle mécanique et dans quelle leçon. Une leçon de bilan n’est
    pas le bon endroit pour l’inventer.
11. **Le mot « lettres » ne veut pas dire la même chose d’une page à l’autre.**
    Ouvert par le finding N7. Ce fichier compte désormais en « signes » puis
    détaille lettres et marques partout où une marque est en jeu, mais il ne peut
    pas fixer un vocabulaire pour tout le parcours. **Arbitrage demandé** :
    inscrire dans `CONVENTIONS.md` ce que « lettre », « signe » et « marque »
    désignent dans un texte d’écran, puis aligner les unités 1 à 10. Une leçon ne
    modifie pas `CONVENTIONS.md`.

- Lot de contre-audit externe : à préparer dans
  `content/authoring/unite-10/contre-audit-gpt56.md`, en portant l’incertitude 1
  en tête de lot, puis l’incertitude 3 et le point 2 de la section précédente.
- Statut : `draft`. Revue native : en attente. **Contre-audit interne PASSÉ le
  2026-08-04, douze findings traités, deux écarts déclarés.** Contre-audit
  externe non lancé.
  Aucun passage à `review` avant que les arbitrages 4, 5, 6, 7 et 8 soient
  exécutés, avant qu’une relecture croisée des cinq leçons de l’unité ait
  vérifié que ce bilan ne répète pas 10A, et avant que les arbitrages 9, 10 et 11
  ouverts par le contre-audit aient reçu une réponse ou une acceptation
  explicite du manque qu’ils décrivent.
