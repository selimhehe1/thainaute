# Leçon 10B : Les mots qu’on voit partout

## Méta

- Identifiant : `u10-l10b`
- Titre français : Les mots qu’on voit partout
- Objectif observable : à la fin de la leçon, devant douze mots écrits et sans
  les entendre, l’apprenant choisit le sens de chacun parmi quatre propositions,
  sur 10 mots sur 12 ; à l’écoute, il reconnaît lequel des quatre mots เปิด,
  ปิด, ทางเข้า et ทางออก il vient d’entendre, sur 11 tirages sur 12 ; il
  reconstruit six suites de blocs, quatre composés et deux phrases, sur 5
  tirages sur 6 ; il apparie les huit mots du jour à leurs huit sens, 8 sur 8 ;
  et il écrit en transcription les huit mots du jour, accent de ton compris, sur
  6 mots sur 8, sans les entendre avant de répondre.
- Nature : leçon B de l’unité 10, première unité du fil « lecture appliquée ».
  Elle ne présente AUCUNE lettre nouvelle et n’ouvre aucune règle de ton.
  Tout ce qu’elle demande de lire a été enseigné entre les unités 1 et 9. Son
  objet est un geste, pas un savoir neuf : prendre un mot thaï affiché seul,
  sans phrase autour, sans audio et sans espace pour aider, et en tirer un sens.
- **Coordination d’unité, relevé fait TROIS fois parce que le dépôt a changé
  deux fois sous le fichier. Seul le troisième est cité comme état courant.**
  - **Avant rédaction, le 2026-08-04** : le répertoire
    `content/authoring/unite-10/` n’existait pas. Ce fichier a donc été conçu et
    écrit sans pouvoir lire 10A, 10C, 10D ni 10E, et il ne suppose rien d’elles :
    il ne cite aucune leçon de l’unité 10 comme prérequis et ne s’appuie que sur
    les unités 1 à 9.
  - **Après rédaction, le même jour** :
    `node scripts/verification/repo-thai-scan.mjs 10 10` rendait **5 fichiers,
    34 entrées et 31 graphies distinctes**, et เปิด comme ปิด étaient alors
    revendiquées à la fois par ce fichier et par `lecon-10e.md`. Les quatre
    autres leçons ont été écrites en parallèle et sont apparues pendant la
    rédaction de celle-ci. Ce relevé était exact au moment où il a été fait ; il
    est conservé ici comme état DÉPASSÉ, et non comme chiffre courant.
  - **À la consolidation, le 2026-08-04, état courant** : le même script rend
    **5 fichiers, 32 entrées et 31 graphies distinctes**. `lecon-10e.md` a exécuté
    l’attribution de lui-même, et son texte le dit : elle ne publie plus aucun
    item, et les blocs เปิด et ปิด sont rangés hors de sa section `## Items`, à
    son spécimen 3, avec la mention `(u10-l10b)`. **10B publie donc เปิด et ปิด,
    10E les réemploie, et il n’y a plus rien à arbitrer sur ce point.**
  - **AUCUNE graphie de cette leçon n’est plus en collision, et le contrôle a été
    refait indépendamment.** Un index de travail, écrit pour l’occasion et laissé
    hors du dépôt, reprend la convention d’entrée de `repo-thai-scan.mjs` (un
    bloc de la section `## Items` portant à la fois un champ `thai` et un champ
    `ton`) mais indexe chaque graphie vers TOUS ses fichiers au lieu du premier.
    Il rend, sur l’unité 10 : 32 entrées, 31 graphies, **une seule graphie
    présente dans plus d’un fichier, ราคา, entre `lecon-10c.md` et
    `lecon-10d.md`**, qui ne relève pas de cette leçon. Contributions par
    fichier : 10A 8, 10B 8, 10C 8, 10D 8, 10E 0.
  - **Ce qui tient sans changement** : les huit graphies du jour ne collisionnent
    avec AUCUNE graphie publiée par les unités 1 à 9.
    `node scripts/verification/repo-thai-scan.mjs 1 9 --grep <graphie>` rend
    **zéro** pour chacune des huit, huit relevés et huit zéros, et le même
    script sur `1 9` rend 45 fichiers, 429 entrées et 317 graphies distinctes,
    convention revalidée juste avant par `--check-u07`, dix chiffres sur dix.
  - **La concordance des champs de เปิด et ปิด reste vérifiée champ par champ**,
    et elle garde sa valeur maintenant que 10E réemploie au lieu de publier :
    เปิด porte les mêmes `codepoints` U+0E40 U+0E1B U+0E34 U+0E14, la même IPA
    /pɤːt̚˨˩/, le même ton bas, la même longueur longue, le même `fr` « ouvrir ;
    ouvert » et la même transcription `pòeet` dans les deux fichiers ; ปิด porte
    les mêmes `codepoints` U+0E1B U+0E34 U+0E14, la même IPA /pit̚˨˩/, le même
    ton bas, la même longueur courte, le même `fr` « fermer ; fermé » et la même
    transcription `pìt`. Deux rédactions indépendantes, zéro divergence de fait.
  - **Ce que 10B n’a PAS fait** : modifier `lecon-10e.md`, ni aucun autre fichier
    de l’unité. Une leçon ne réécrit pas la Méta d’une autre. Le déplacement des
    deux blocs est le fait de 10E, constaté ici par relevé, pas demandé par ce
    fichier.
  - **Le relevé de collision ne peut PAS être fait par un script du dépôt, et
    c’est un manque d’outil qui subsiste.** `repo-thai-scan.mjs --grep` n’affiche
    pour chaque graphie que le PREMIER fichier où elle apparaît, propriété
    `firstSeen` de son code : il ne peut ni révéler une collision ni prouver son
    absence, et le zéro ci-dessus repose donc sur un script hors dépôt. Voir
    l’arbitrage 9.
- Prérequis, tous vérifiés dans le dépôt le 2026-08-04 :
  - leçon 1A : les neuf consonnes moyennes, dont ป, qui ouvre เปิด et ปิด, et
    อ, l’appui muet, qui ouvre ออก ;
  - leçon 1B : ข้าว, et surtout **เข้า**, entrer, publié avec `khâo`, ton
    descendant, longueur courte, IPA /kʰaw˥˩/. C’est un item publié que la
    leçon RÉEMPLOIE sans le republier, et qui entre dans deux des huit mots du
    jour. **Son ton est SU depuis 1B, il n’est pas relu** : la forme สระเอา est
    hors du domaine du tableau de 8A depuis `u04-l4a`, et `u07-l7a` nomme เข้า
    parmi les exclusions ;
  - leçon 1C : la paire ปา (paa) contre ป่า (pàa), moyen contre bas, rejouée
    telle quelle à la page 13 ;
  - leçon 1D : ม้า, le cheval, publié `máa`. Il ne sert pas de vocabulaire ici,
    seulement de spécimen à la note culturelle, où il est le premier morceau de
    ทางม้าลาย ;
  - leçon 1E : ครับ et ค่ะ, les deux particules du dialogue ;
  - leçon 2C : น้ำ, l’eau, publié `náam`, second bloc de ห้องน้ำ ; ขอโทษ,
    ขอบคุณครับ et ไม่เป็นไร, trois blocs du dialogue ;
  - leçon 4A : la règle du ton en syllabe VIVANTE pour les consonnes moyennes et
    hautes, et l’avertissement de sa page 6, que เ, แ, โ, ใ et ไ s’écrivent
    AVANT la consonne qu’elles accompagnent. Cet avertissement porte la page 8
    de la leçon du jour, celle qui sépare เปิด de ปิด ;
  - leçon 5A : les neuf premières consonnes basses ค ง ช ซ ท น พ ฟ ม, dont ท,
    qui ouvre ทาง ; et les trois fermetures retenues `p`, `t`, `k` ;
  - leçon 5C : **ห้องน้ำ**, les toilettes, publié `hâwng·náam`, et l’ossature
    ห้องน้ำอยู่ที่ไหนครับ, reprise VERBATIM au dialogue et à l’exercice 3 ;
    อยู่, ที่ไหน, ที่นี่ et ที่นั่น ;
  - leçon 6A : la règle du ton pour les consonnes BASSES en syllabe vivante,
    celle qui donne à ทาง son ton moyen ; et le graphème `oee` pour /ɤː/, vu
    dans เธอ et เจอ ;
  - leçon 7A : les deux premières marques de ton, et surtout sa page dédiée à
    ไม้โท, qui donne **ห้อง** pour exemple d’une consonne HAUTE portant un
    ไม้โท. C’est exactement la lecture de ห้าม, item 7 du jour. La même leçon
    publie **ห้อง**, la pièce, la chambre, `hâwng`, premier bloc de ห้องน้ำ.
    **L’attribution retenue par ce fichier est `u07-l7a`, et elle l’est
    partout**, à la Méta comme aux pages, aux exercices et au SRS ; `u07-l7b`
    republie la même graphie avec des champs `longueur` et `fr` différents,
    dette de l’unité 7 signalée à l’arbitrage 10 et non tranchée ici ;
  - leçon 8A : le tableau des onze cases, en syllabe vivante, qui est l’outil de
    lecture du jour ; et เงิน, publié `ngoen`, première graphie du parcours à
    porter le graphème vocalique réduit เ◌ิ◌ ;
  - leçon 8C : เกินไป, publié `koeen·pai`, seconde graphie à porter เ◌ิ◌, et
    celle qui le porte LONG. Les deux ensemble montrent que ce graphème ne dit
    pas sa longueur, ce qui vaut aussi pour เปิด ;
  - leçon 8D : ขอโทษครับ, bloc du dialogue ;
  - leçon 9A : les familles de finales écrites. Trois des huit mots du jour se
    ferment sur une occlusive, ออก sur ก, เปิด et ปิด sur ด, et c’est 9A qui a
    appris à lire ces fins. La leçon du jour s’appuie dessus et n’y ajoute rien.
- Cible phonétique : aucun son nouveau. La leçon entretient **moyen contre bas**,
  conformément au fil des tons de `CONVENTIONS.md`, parce que ses propres items
  le portent : ทาง est au ton moyen, ออก, เปิด et ปิด sont au ton bas, et le mot
  ทางออก enchaîne les deux dans un seul mot. Repères rejoués à la page 13 : ปา
  contre ป่า, de `u01-l1c`.
  **Montant contre haut n’est PAS entretenu par cette leçon, et c’est déclaré
  plutôt que masqué.** Aucun des huit items ne porte l’un ni l’autre. La leçon
  ne les déclare acquis nulle part, elle ne crée aucune carte qui les mesure, et
  elle laisse `srs-u04-l4a-06` faire ce travail. Une leçon qui n’a pas de matière
  pour un contraste ne doit pas en fabriquer.
- Bloc de lecture du jour : **le mot composé**. Un mot thaï affiché peut en
  contenir deux, écrits l’un contre l’autre sans rien entre eux. Le geste
  enseigné est de chercher, à l’intérieur d’une suite de lettres, un mot qu’on
  connaît déjà.
- Règle enseignée, en trois énoncés :
  - un mot affiché peut être fait de deux mots collés ; on lit d’abord ce qu’on
    reconnaît, puis ce qui reste ;
  - dans les composés du jour, le SENS se construit de gauche à droite et le
    second bloc précise le premier : ทาง est la voie, ทางเข้า est la voie par
    laquelle on entre ;
  - le ton se lit sur la **CONSONNE INITIALE** de la syllabe, jamais sur la
    première lettre écrite. Dans เปิด, la première lettre écrite est เ, et la
    consonne initiale est ป. C’est ป qui commande, pas เ.
- Ce que la leçon n’ouvre pas, et les deux premiers points sont lourds parce
  qu’ils portent sur la matière même du jour :
  - **le TON des syllabes fermées par `k`, `t` ou `p` reste hors programme.** Le
    tableau des onze cases de `u08-l8a` ne couvre que les syllabes VIVANTES.
    Quatre syllabes du jour sont mortes, celle de ออก, celle de เปิด, celle de
    ปิด et la seconde de ทางออก : leurs tons sont DONNÉS par les sources, jamais
    déduits. **C’est exactement le manque que l’incertitude 6 de `u09-l9a`
    demandait d’arbitrer au niveau de l’unité 10.** Cette leçon ne l’arbitre pas,
    elle n’en a pas le pouvoir ; elle mesure ce que le manque coûte, à la page 7
    et à l’arbitrage 1, et elle le dit à l’écran plutôt que de faire semblant ;
  - **le TON de la forme สระเอา reste hors programme lui aussi, et c’est le
    second manque de la leçon.** `u04-l4a` page 8 met en toutes lettres les
    formes écrites avec ไ, ใ, เ-า et -ำ hors du champ de la règle enseignée, en
    demandant de « ne pas chercher à les trancher » ; `u07-l7a` reprend la liste
    et **y nomme เข้า**, deux fois. Or เข้า est la seconde syllabe de ทางเข้า et
    de ห้ามเข้า, soit deux des huit items. **Le ton descendant de ces deux
    syllabes est donc DONNÉ, pas déduit** : il vient de l’item publié par
    `u01-l1b`, où l’apprenant l’a appris à l’oreille, et la leçon ne lui demande
    à aucun moment de le calculer avec le tableau. Le précédent est explicite
    dans le dépôt : le contre-audit de `u07-l7c` a fait retirer la classification
    `vivante` de เช้า au motif qu’affirmer cette classe « aurait tranché devant
    l’auteur ce que le parcours a explicitement différé devant l’apprenant ».
    Cette leçon tient la même ligne ;
  - la consonne de tête, le ห qui précède une lettre basse, et ce qu’il fabrique
    au ton. Aucun mot du jour n’en porte, ce qui est une chance et non un
    hasard : voir l’incertitude 5 sur les deux mots écartés pour cette raison ;
  - la syllabation des mots savants ; les groupes de deux consonnes, déjà traités
    par `u08-l8a` et non rejoués ici ;
  - la longueur du graphème vocalique réduit เ◌ิ◌, qui ne se lit pas à l’œil et
    dont la leçon donne la valeur mot par mot. Voir l’incertitude 2.
- **Contrainte de véracité propre à l’unité 10, vérifiée avant et après
  rédaction.** Cette unité fait lire du thaï d’affichage. Le risque propre du
  sujet est de fabriquer du réel : une enseigne, un commerce, un prix, une rue,
  une station. **Ce fichier n’en contient aucun.** Aucun nom propre thaï n’y
  figure, aucun prix, aucun lieu nommé. Les spécimens de lecture sont
  CONSTRUITS à partir de mots dont chaque source est citée, et ils sont déclarés
  construits partout où ils apparaissent.
  **Et la leçon n’affirme nulle part qu’un mot « se voit partout ».** Le titre
  de travail dit « les mots qu’on voit partout » et **ce titre est un abus que la
  page 14 corrige à l’écran** : le projet n’a aucune source recevable sur la
  fréquence d’affichage d’un mot dans l’espace public thaï. Ce qui est établi et
  enseigné, c’est le SENS de huit mots. Ce qui ne l’est pas, et qui n’est donc
  affirmé nulle part, c’est où ces mots sont écrits, à quelle fréquence, et sous
  quelle forme. Voir l’incertitude 1, et l’arbitrage 3 sur le titre.
- Durée visée : 17 minutes.
- Transcription : convention `thainaute-fr` v1.1.
- Statut : `draft`. Revue native : en attente.

## Enseignement

### Page 1 : aujourd’hui, un mot tout seul

Depuis neuf unités, vous lisez du thaï dans des phrases, avec une traduction
juste dessous et un audio à portée de doigt. À partir d’aujourd’hui, on retire
tout cela. Un mot, seul, sans contexte et sans son. C’est la situation la plus
inconfortable de l’apprentissage, et c’est aussi la seule qui compte quand on
lève les yeux vers quelque chose d’écrit.

Spécimen : ปิด

### Page 2 : un mot peut en contenir deux

Voici le premier outil, et il vaut mieux que n’importe quelle règle. Devant une
suite de lettres qui vous paraît longue, ne la lisez pas d’un bloc : cherchez
dedans un mot que vous connaissez déjà. Le thaï construit énormément de mots en
collant deux mots existants l’un contre l’autre, sans rien entre les deux.

Spécimen : ห้อง + น้ำ → ห้องน้ำ

### Page 3 : ทาง, la voie

Premier bloc du jour, et il en ouvre deux autres. ทาง veut dire la voie, le
chemin, le passage. Trois lettres, aucune surprise : ท que vous lisez depuis la
leçon 5A, la voyelle า longue, et le ง qui ferme sur un `ng`, comme dans โรง
appris en 9A.

Son ton, vous pouvez le déduire tout seul. ท est une consonne BASSE, la syllabe
est vivante puisqu’elle se ferme sur ง, et aucune marque n’est posée : le
tableau de 8A donne alors le ton moyen. Vérifiez-le sur le tableau plutôt que de
me croire.

Spécimen : ทาง (thaang)

### Page 4 : ทางเข้า et ทางออก

Maintenant collez à ทาง un mot que vous avez appris à la leçon 1B, เข้า, entrer.
Vous obtenez ทางเข้า, la voie par laquelle on entre : l’entrée. Collez-lui ออก,
sortir, et vous obtenez ทางออก, la sortie.

Le sens se construit de gauche à droite, et le second bloc précise le premier.
Une voie, puis quel genre de voie.

> ทาง + เข้า → ทางเข้า
> ทาง + ออก → ทางออก

Spécimen : ทางเข้า (thaang·khâo) contre ทางออก (thaang·àwwk)

### Page 5 : où se lit le ton, et l’erreur à ne pas faire

Un rappel qui vaut pour toute la suite du parcours, et qui se trompe très
facilement. Le ton d’une syllabe se lit sur sa **consonne initiale**. Pas sur sa
première lettre écrite. Les deux coïncident souvent, et c’est précisément ce qui
rend l’erreur facile.

Regardez เปิด. La première lettre écrite est เ, qui est une voyelle. La consonne
initiale est ป, la deuxième lettre à l’écran. C’est ป qui décide, avec la
marque posée sur la syllabe s’il y en a une. Le rappel de 4A tient tout entier
là-dedans : เ, แ, โ, ใ et ไ s’écrivent avant la consonne qu’elles accompagnent.

Spécimen : เปิด, consonne initiale ป

### Page 6 : ce que vous lisez tout seul aujourd’hui

Deux des huit mots du jour ont un ton que vous pouvez calculer entièrement, avec
le tableau de 8A et rien d’autre. Faites-le, un par un, avant de regarder la
réponse.

> ทาง : ท basse, syllabe vivante, aucune marque → ton MOYEN
> ห้าม : ห haute, syllabe vivante, ไม้โท → ton DESCENDANT

Le second est celui que vous connaissez le mieux sans le savoir : ห้อง, la
pièce, se lit exactement de la même façon, et c’est l’exemple que la leçon 7A
donnait déjà pour ce croisement.

Trois autres mots vous en laissent lire la MOITIÉ, et c’est déjà beaucoup :
ทางเข้า et ทางออก commencent par ทาง, ห้ามเข้า commence par ห้าม. Sur ces
trois-là, calculez la première syllabe et arrêtez-vous : la page suivante vous
dit pourquoi la seconde ne se calcule pas.

Spécimen : ห้อง (hâwng) puis ห้าม (hâam)

### Page 7 : ce que je vous donne, et pourquoi

Le reste, non, et je préfère vous dire pourquoi plutôt que de vous laisser
chercher. Deux raisons différentes, pas une.

La première : ออก, เปิด et ปิด se ferment sur une occlusive, `k` pour le
premier, `t` pour les deux autres, et la seconde syllabe de ทางออก fait pareil.
Le tableau de 8A ne couvre que les syllabes qui se terminent sur une voyelle ou
sur ง, น, ม, ย, ว. Celles qui se ferment sur `k`, `t` ou `p` obéissent à une
autre règle, et le parcours ne vous l’a pas encore donnée.

La seconde : la syllabe เข้า, celle qui termine ทางเข้า et ห้ามเข้า, s’écrit
avec la forme เ◌า. C’est l’une des quatre formes que la leçon 4A avait mises de
côté, avec ไ, ใ et ◌ำ, en vous demandant expressément de ne pas essayer de les
trancher. Rien n’a changé depuis. Vous connaissez pourtant son ton, et depuis
longtemps : เข้า est un mot de la leçon 1B, vous l’avez appris à l’oreille, il
est descendant. Vous le SAVEZ ; vous ne le calculez pas.

Alors ces tons vous sont donnés, comme l’ont été ceux de กระเป๋า en 8A et ceux
de โรค et แพทย์ en 9A. Ce n’est pas une lacune de votre part, ce sont deux
pièces qui manquent encore au parcours, et elles sont signalées là où elles
manquent.

Spécimen : ออก (àwwk) · เปิด (pòeet) · ปิด (pìt) · เข้า (khâo)

### Page 8 : un seul signe sépare ouvert de fermé

Voici le cœur de la leçon, et vous ne l’oublierez plus après l’avoir vu une
fois. เปิด est le verbe ouvrir, et il vaut aussi pour l’état : ouvert. ปิด est
le verbe fermer, et il vaut aussi pour l’état : fermé. Deux sens opposés.

Regardez-les côte à côte. Retirez le เ de เปิด et il ne reste rien d’autre que
ปิด, à la lettre près. Un seul signe à l’écran sépare les deux mots, et ce signe
est celui qui se pose AVANT la consonne initiale.

> เปิด = เ + ป + ิ + ด
> ปิด = ป + ิ + ด

À l’oreille, en revanche, rien ne les confond : เปิด porte un `oee` long, celui
de เธอ et de เจอ, et ปิด un `i` bref. Le contraste est donc facile à entendre et
difficile à voir. C’est exactement l’inverse de ce à quoi on s’attend, et c’est
pour cela que la leçon vous fait travailler les deux séparément.

Spécimen : เปิด (pòeet) contre ปิด (pìt)

### Page 9 : ออก a deux อ, et ils ne font pas le même travail

Trois lettres, et deux d’entre elles sont la même. Ce n’est pas une coquille.
Le premier อ est la consonne initiale, celle qui ne s’entend presque pas, l’appui
muet de la leçon 1A que vous lisez depuis อะไร et อยู่. Le second อ est la
VOYELLE, le `aww` long de ขอ appris en 2C. Et le ก ferme la syllabe sur un `k`.

Le dictionnaire dit lui-même les deux emplois à son entrée de lettre : อ sert de
consonne initiale, et อ sert aussi à écrire la voyelle ออ.

> ออก = อ (consonne) + อ (voyelle) + ก (finale)

Spécimen : ออก (àwwk)

### Page 10 : ห้าม, l’interdiction

ห้าม est un verbe, et il veut dire interdire, défendre. Quatre lettres, un ton
que vous savez calculer, et une lecture sans piège : le ห est ici une vraie
consonne initiale qui se prononce, pas le ห muet de หมา.

Spécimen : ห้าม (hâam)

### Page 11 : ห้ามเข้า, et le mot qui commande

Collez เข้า derrière ห้าม et vous obtenez ห้ามเข้า. Le premier mot commande le
second : ce qui est interdit, c’est d’entrer. C’est la même construction de
gauche à droite qu’à la page 4, mais elle porte cette fois sur une action et non
sur un lieu.

Les deux syllabes portent le même ton, descendant toutes les deux, et vous y
arrivez par deux chemins différents. La première, ห้าม, vous la calculez : ห
haute, syllabe vivante, un ไม้โท posé. La seconde, เข้า, vous la savez depuis la
leçon 1B, et la page 7 vous a dit pourquoi elle ne se calcule pas.

Spécimen : ห้าม (hâam) puis ห้ามเข้า (hâam·khâo)

### Page 12 : ce que vous savez déjà lire

ห้องน้ำ, les toilettes, vous l’avez appris en 5C et vous le dites depuis. Vous
ne l’aviez jamais regardé comme un composé. Regardez-le maintenant : ห้อง, la
pièce, apprise en 7A, plus น้ำ, l’eau, apprise en 2C. Une pièce d’eau.

C’est le meilleur entraînement possible, parce que vous connaissez la réponse
avant de commencer : vous ne mesurez que le geste, pas le vocabulaire.

Spécimen : ห้อง + น้ำ → ห้องน้ำ (hâwng·náam)

### Page 13 : moyen contre bas, on l’entretient

Rien n’est acquis une fois pour toutes, et ce contraste-là est dans les mots du
jour. Reprenez votre repère avant les exercices.

> ปา (paa) contre ป่า (pàa) : la voix reste plate, puis elle descend et reste
> basse

Les mots du jour vous en donnent quatre de plus : ทาง est au ton moyen ; ออก,
เปิด et ปิด sont au ton bas. Et ทางออก les enchaîne dans un seul mot, moyen
d’abord, bas ensuite. Dites-le lentement, en écoutant la marche descendre.

Spécimen : ปา / ป่า puis ทางออก (thaang·àwwk)

### Page 14 : à vous, et une chose que cette leçon ne vous dit pas

Le geste tient en trois temps. Un, cherchez dans le mot un morceau que vous
connaissez déjà. Deux, lisez ce qui reste. Trois, pour chaque syllabe, trouvez la
consonne initiale avant de penser au ton.

Après les exercices, enregistrez-vous en disant เปิด puis ปิด, et comparez en
A/B avec la voix de référence. L’enregistrement reste privé, sur votre appareil.

Et une précision honnête, parce qu’elle change ce que vous devez attendre de
cette leçon. Nous vous avons donné le SENS de huit mots, vérifié deux fois
chacun. Nous ne vous avons rien dit de l’endroit où ils sont écrits, ni de leur
fréquence sur les panneaux, ni de la forme sous laquelle vous les rencontrerez :
nous n’avons pas de source qui l’établisse, et nous préférons vous le dire que
de l’inventer. Vous savez ce que ces mots veulent dire. Le reste s’apprendra en
regardant.

## Items

### Item 1 : ทาง

- `thai` : ทาง
- `codepoints` : U+0E17 U+0E32 U+0E07 (NFC)
- `ipa` : /tʰaːŋ˧/
- `ton` : moyen
- `longueur` : longue
- `fr` : le chemin, la voie
- `transcription` : thaang
- `registre` : neutre
- `note_fr` : le bloc de tête des items 3 et 4, et **l’un des deux seuls mots du
  jour dont tout se lit sans aide**, avec ห้าม. ท est une consonne basse de la
  leçon 5A, la voyelle า est longue, le ง ferme la syllabe sur un `ng` et la rend
  VIVANTE. Basse, vivante, sans marque : le tableau de 8A donne le ton moyen, et
  c’est l’un des deux tons du jour que vous devez pouvoir prédire sans regarder
  la réponse, l’autre étant celui de ห้าม. Le mot a beaucoup d’autres emplois que
  celui du champ `fr`, notamment celui de moyen ou de méthode ; la leçon n’en
  enseigne aucun autre et n’en fait jamais un exercice.
- `sources` :
  - RID 2554, Office of the Royal Society, entrée « ทาง ๑ », consultée le
    2026-08-04 par requête POST unique sur
    https://dictionary.orst.go.th/func_lookup.php avec
    `word=ทาง&funcName=lookupWord&status=lookup`, relevée par
    `node scripts/verification/rid-entry.mjs ทาง` : graphie attestée comme
    entrée autonome, deux vedettes. « ทาง ๑ » porte neuf sens nominaux, dont le
    (๑), l’endroit où l’on circule, la voie ou la surface servant au passage,
    avec ทางเดินรถ, ทางเท้า, ทางข้าม et ทางแยก pour exemples, et le (๒), le
    passage ou l’ouverture, avec ทางประตู et ทางหน้าต่าง. Ce sont ces deux sens
    que la leçon enseigne. Les sens (๓) à (๙), occasion, direction, méthode,
    région, camp et manière musicale, ne sont PAS enseignés. « ทาง ๒ », la
    palme, n’est pas enseigné non plus. La liste des mots dérivés porte
    **ทางออก**, item 4 de cette leçon, et ne porte PAS ทางเข้า, point relevé à
    l’item 3 (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, ligne
    100079, relevée le 2026-08-04 par
    `node scripts/verification/volubilis-lookup.mjs <xlsx> ทาง` (THA « ทาง »,
    ThaiRom `thāng`, ThaiPhon `-thāng`, TYPE n., FRA « chemin [m] ; route [f] ;
    voie [f] ; passage [m] ; sentier [m] »). Le `-` note le ton moyen et le
    macron la voyelle longue, clé `TONES` et notation de longueur de la feuille
    `Codes`. Les lignes 100080 à 100082 donnent direction, moyen et l’emploi
    prépositionnel, non enseignés.
  - en.wiktionary, entrée « ทาง », https://en.wiktionary.org/wiki/ทาง, consultée
    en rendu le 2026-08-04 (Orthographic `ทาง`, IPA /tʰaːŋ˧/, Paiboon `taang`,
    Royal Institute `thang`, nom « way, route, or course for travel », plus
    occasion, côté et méthode).
  - Classe de ท et règle du ton : faits déjà publiés par le parcours, relus dans
    le dépôt le 2026-08-04. `u05-l5a` publie ท parmi les neuf consonnes basses,
    `u06-l6a` publie la règle du ton pour les basses en syllabe vivante, et
    `u08-l8a` publie le tableau des onze cases, ligne BASSE, colonne « rien »,
    qui donne le ton moyen.

### Item 2 : ออก

- `thai` : ออก
- `codepoints` : U+0E2D U+0E2D U+0E01 (NFC)
- `ipa` : /ʔɔːk̚˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : sortir
- `transcription` : àwwk
- `registre` : neutre
- `note_fr` : le mot qui fait la démonstration de la page 9. Deux อ de suite, et
  les deux ne font pas le même travail : le premier est la consonne initiale, le
  second est la voyelle `aww` longue de ขอ, apprise en 2C. Le ก ferme sur un `k`
  sec, comme dans มาก appris en 4D, et rend donc la syllabe MORTE. Le ton est
  BAS et il vous est donné : le tableau de 8A ne couvre pas les syllabes fermées
  par une occlusive. Le mot a de nombreux autres emplois, la leçon n’en enseigne
  aucun autre.
- `sources` :
  - RID 2554, entrée « ออก ๓ », consultée le 2026-08-04 par requête POST unique
    sur https://dictionary.orst.go.th/func_lookup.php : graphie attestée comme
    entrée autonome, trois vedettes. « ออก ๓ » porte seize sens, dont le (๑),
    verbal, le mouvement vers l’extérieur ou hors d’un abri, avec เลือดออก,
    แดดออก et รถออก pour exemples. C’est ce sens que la leçon enseigne. **Le sens
    (๑๑) est cité séparément à l’item 4** : il pose ออก comme le contraire de
    เข้า et donne ทางออก pour exemple. Les vedettes « ออก ๑ », titre de noblesse
    ancien, et « ออก ๒ », un rapace, ne sont PAS enseignées (faits cités par
    référence, définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, ligne 64631, relevée le 2026-08-04 par le script
    versionné (ThaiRom `øk`, ThaiPhon `_øk`, TYPE v., FRA « sortir ; aller
    dehors ; s’éloigner ; quitter »). Le `_` note le ton bas, clé `TONES`. **La
    longueur est établie par la feuille `Romanization` et non par un macron** :
    relue le 2026-08-04 par
    `node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> --feuille=Romanization`,
    elle romanise la voyelle ออ par `ø`, exemple ลอม → `løm`, et la voyelle
    brève เอาะ par `o`, exemple เลาะ → `lo`. Le `ø` de `_øk` note donc la
    voyelle LONGUE. Les lignes 64632 à 64634 donnent partir, émettre et un
    emploi adverbial, non enseignés.
  - en.wiktionary, entrée « ออก », https://en.wiktionary.org/wiki/ออก, consultée
    en rendu le 2026-08-04 (Orthographic `ออก`, IPA /ʔɔːk̚˨˩/, Paiboon `ɔ̀ɔk`,
    Royal Institute `ok`, verbe « to come or go out, into view, or into being »).
    L’IPA porte le /ʔ/ initial, qui corrobore que le premier อ est une consonne,
    et le /ɔː/ long, seconde jambe de la longueur.
  - Les deux emplois de la lettre อ : RID 2554, entrée « อ ๑ », relevée le
    2026-08-04 par `node scripts/verification/rid-entry.mjs อ`, qui donne pour la
    quarante-troisième consonne, de classe moyenne, l’emploi de พยัญชนะต้น,
    consonne initiale, ET l’emploi de รูปสระ ออ, forme de la voyelle ออ, avec รอ
    et ปอ pour exemples. Fait déjà publié par `u01-l1a` pour l’appui muet, relu
    dans le dépôt le même jour.
  - Graphème `aww` pour /ɔː/ : convention déjà publiée par `u02-l2c` (ขอ,
    `khǎww`), relue dans le dépôt le 2026-08-04.

### Item 3 : ทางเข้า

- `thai` : ทางเข้า
- `codepoints` : U+0E17 U+0E32 U+0E07 U+0E40 U+0E02 U+0E49 U+0E32 (NFC)
- `ipa` : /tʰaːŋ˧.kʰaw˥˩/
- `ton` : thaang moyen ; khâo descendant
- `longueur` : thaang longue ; khâo courte
- `fr` : l’entrée
- `litteral` : la voie (ทาง) par où l’on entre (เข้า)
- `transcription` : thaang·khâo
- `registre` : neutre
- `note_fr` : le premier composé du jour, et le plus transparent. Ses deux blocs
  vous sont connus : ทาง est l’item 1, เข้า est publié depuis la leçon 1B avec
  la même transcription `khâo`. **Un seul des deux tons se calcule** : ท basse
  et vivante sans marque donne moyen. Le second est DONNÉ, et il vous est connu
  depuis 1B : เข้า s’écrit avec la forme เ◌า, que 4A a mise hors du tableau et
  que 7A nomme parmi ses exclusions. Attention tout de même à l’ordre d’écriture
  de la seconde syllabe : la première lettre visible après le ง est เ, et la
  consonne initiale est le ข qui la suit. C’est l’avertissement de 4A, et il vaut
  ici pour la lecture, même là où le ton ne se calcule pas.
- `sources` :
  - **RID 2554 : la graphie n’est PAS une vedette, et c’est dit plutôt que
    contourné.** `node scripts/verification/rid-lookup.mjs ทางเข้า` rend
    `absent` le 2026-08-04, et la liste des mots dérivés de l’entrée « ทาง ๑ »
    ne la porte pas non plus, alors qu’elle porte ทางออก. **Le dictionnaire
    l’atteste cependant, ailleurs et clairement** : l’entrée « เข้า ๑ », relevée
    le même jour par `rid-entry.mjs`, donne au sens (๗) une valeur adverbiale
    définie comme le contraire de ออก, et l’illustre par deux exemples dont le
    premier est **ทางเข้า**, le second étant ขาเข้า. La graphie est donc
    attestée par le RID comme exemple d’une de ses entrées, pas comme vedette.
    C’est une attestation plus faible qu’une vedette, et elle est citée pour ce
    qu’elle est.
  - VOLUBILIS v26.2, `.xlsx`, ligne 100188, relevée le 2026-08-04 par le script
    versionné (THA « ทางเข้า », ThaiRom `thāng khao`, ThaiPhon `-thāng\khao`,
    TYPE n. exp., ENG « entrance ; entry », FRA « entrée [f] »). Les marqueurs
    donnent ton moyen puis descendant, clé `TONES` ; le macron donne la première
    syllabe longue et son absence la seconde brève. Entrée unique pour cette
    graphie dans la base.
  - en.wiktionary, entrée « ทางเข้า », https://en.wiktionary.org/wiki/ทางเข้า,
    consultée en rendu le 2026-08-04 (Orthographic `ทางเข้า`, **Phonemic
    `ทาง-เค่า`**, IPA /tʰaːŋ˧.kʰaw˥˩/, Paiboon `taang-kâo`, Royal Institute
    `thang-khao`, nom « entrance », « lobby, foyer », étymologie donnée comme
    composé de ทาง et de เข้า). La forme phonémique réécrit เข้า en เค่า, une
    consonne basse portant un ไม้เอก : c’est la même valeur de ton, descendant,
    obtenue par l’autre moitié du tableau de 8A, et elle corrobore donc le ton
    indépendamment de la romanisation.
  - Réemploi de เข้า : item publié par `u01-l1b`, relu champ par champ dans le
    dépôt le 2026-08-04, `transcription : khâo`, `ton : descendant`,
    `longueur : courte`, `ipa : /kʰaw˥˩/`,
    `codepoints : U+0E40 U+0E02 U+0E49 U+0E32`. Les quatre valeurs que la
    présente leçon reprend pour la seconde syllabe de ทางเข้า, ton descendant,
    longueur courte, /kʰaw˥˩/ et `khâo`, sont donc les mêmes. **Comparaison faite
    à la main, et non par un script : voir la note de méthode du dossier, qui dit
    pourquoi `item-fields-check.mjs` ne peut pas la faire ici.** La leçon ne
    republie pas เข้า et ne lui ouvre aucune carte.

### Item 4 : ทางออก

- `thai` : ทางออก
- `codepoints` : U+0E17 U+0E32 U+0E07 U+0E2D U+0E2D U+0E01 (NFC)
- `ipa` : /tʰaːŋ˧.ʔɔːk̚˨˩/
- `ton` : thaang moyen ; àwwk bas
- `longueur` : thaang longue ; àwwk longue
- `fr` : la sortie
- `litteral` : la voie (ทาง) par où l’on sort (ออก)
- `transcription` : thaang·àwwk
- `registre` : neutre
- `note_fr` : le symétrique exact de l’item 3, et le mot qui enchaîne les deux
  tons du contraste entretenu aujourd’hui : moyen d’abord, bas ensuite. Le
  premier ton se déduit, le second vous est donné, la seconde syllabe se fermant
  sur un `k`. Une chose à savoir sur ce mot, et elle est enseignée à la note
  culturelle plutôt qu’ici : il a une seconde vie figurée, la solution à un
  problème, et c’est celle-là que le dictionnaire met en vedette.
- `sources` :
  - RID 2554, entrée « ทางออก », consultée le 2026-08-04 par requête POST unique
    sur https://dictionary.orst.go.th/func_lookup.php : graphie attestée comme
    entrée autonome, vedette unique, dont le แม่คำ est ทาง ๑. **La vedette porte
    l’étiquette (สำ), locution figée, et son sens est FIGURÉ** : l’issue au sens
    de la solution, glosée par ทางรอด et วิธีแก้ปัญหา. Le sens concret enseigné
    par la leçon, la sortie physique, **n’est pas dans cette vedette**. Il est en
    revanche attesté par le RID à un autre endroit, et cité pour ce qu’il est :
    l’entrée « ออก ๓ », relevée le même jour, donne au sens (๑๑) une valeur
    adverbiale définie comme le contraire de เข้า, illustrée par le seul exemple
    **ทางออก**. Le dictionnaire pose donc ทางเข้า et ทางออก de façon symétrique,
    chacun dans l’entrée de l’autre mot du couple (faits cités par référence,
    définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, lignes 100290 et 100291, relevées le 2026-08-04
    par le script versionné. **Les deux sens y sont séparés, ce qui est la
    corroboration la plus nette du dossier** : ligne 100290, ThaiRom `thāng-øk`,
    ThaiPhon `-thāng_øk`, TYPE n. exp., ENG « exit ; way out ; outlet », FRA
    « sortie [f] ; issue [f] » ; ligne 100291, mêmes romanisations, TYPE n., ENG
    « solution », FRA « solution [f] ». Les marqueurs donnent ton moyen puis
    bas ; le macron donne la première syllabe longue et le `ø` la seconde longue,
    par la feuille `Romanization` citée à l’item 2.
  - en.wiktionary, entrée « ทางออก », https://en.wiktionary.org/wiki/ทางออก,
    consultée en rendu le 2026-08-04 (Orthographic `ทางออก`, **Phonemic
    `ทาง-ออก`**, IPA /tʰaːŋ˧.ʔɔːk̚˨˩/, Paiboon `taang-ɔ̀ɔk`, Royal Institute
    `thang-ok`, nom, sens 1 « way out; exit; outlet », sens 2 étiqueté
    **(figurative, idiomatic)** « way out; solution », étymologie donnée comme
    composé de ทาง et de ออก). Le partage des deux sens est donc porté par deux
    sources indépendantes, VOLUBILIS et Wiktionary, et le RID les place
    différemment ; les trois relevés sont donnés tels quels.

### Item 5 : เปิด

- `thai` : เปิด
- `codepoints` : U+0E40 U+0E1B U+0E34 U+0E14 (NFC)
- `ipa` : /pɤːt̚˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : ouvrir ; ouvert
- `transcription` : pòeet
- `registre` : neutre
- `note_fr` : la moitié de la paire centrale du jour. Trois choses à tenir
  ensemble. D’abord la consonne initiale est ป, pas เ : c’est ป qui commande le
  ton, et c’est le point que la page 5 martèle. Ensuite le noyau vocalique est le
  graphème réduit เ◌ิ◌, celui de เงิน appris en 8A et de เกินไป appris en 8C, et
  il se lit ici LONG, comme dans `koeen`, et non bref comme dans `ngoen` : ce
  graphème ne dit pas sa longueur à l’œil, la leçon vous la donne mot par mot.
  Enfin le ด ferme sur un `t`, comme 9A vous l’a appris, ce qui rend la syllabe
  morte et met son ton hors de votre portée pour l’instant. Il est BAS et il vous
  est donné.
- `sources` :
  - RID 2554, entrée « เปิด », consultée le 2026-08-04 par requête POST unique
    sur https://dictionary.orst.go.th/func_lookup.php : graphie attestée comme
    entrée autonome, vedette unique, trois sens verbaux. Le (๑) est le fait de
    rendre découvert ce qui était fermé, avec เปิดประตู pour exemple, et il porte
    la mention explicite ตรงข้ามกับ ปิด, « le contraire de ปิด », qui établit
    l’opposition enseignée par la page 8. Le (๒) est l’inauguration, avec
    เปิดร้านใหม่. Le (๓), étiqueté (ปาก), familier, veut dire s’enfuir et n’est
    PAS enseigné. Longue liste de mots dérivés, dont เปิดเผย, non enseignés
    (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, lignes 77221 et 77225, relevées le 2026-08-04 par
    le script versionné. Ligne 77221 : ThaiRom `poēt`, ThaiPhon `_poēt`, TYPE v.,
    FRA « ouvrir ; s’ouvrir ; déballer ; défaire ». **Ligne 77225 : mêmes
    romanisations, TYPE adj., ENG « open ; on », FRA « ouvert »**, et c’est cette
    ligne, une ligne d’emploi ADJECTIVAL, qui soutient le second membre du champ
    `fr`. Elle ne dit rien du support sur lequel le mot serait écrit, et rien ici
    ne le lui fait dire. Le `_` note le ton bas, clé `TONES`, et le macron sur le
    `ē` la voyelle longue. Les lignes 77222 à 77224 donnent allumer, inaugurer et
    révéler, non enseignés.
  - en.wiktionary, entrée « เปิด », https://en.wiktionary.org/wiki/เปิด,
    consultée en rendu le 2026-08-04 (Orthographic `เปิด`, IPA /pɤːt̚˨˩/,
    Paiboon `bpə̀ət`, Royal Institute `poet`, verbe « to open », « to turn on »,
    « to inaugurate », **et une entrée ADJECTIVE distincte, « open: uncovered,
    unclosed, unfastened »**). Le /ɤː/ est la seconde jambe de la longueur, et
    l’entrée adjective la seconde jambe du sens affiché.
  - Graphème `oee` pour /ɤː/ et forme réduite เ◌ิ◌ : convention déjà publiée par
    `u01-l1e` (แล้วเจอกัน, `láeew·joee·kan`) et `u06-l6a` (เธอ, `thoee`), forme
    réduite déjà publiée par `u08-l8a` (เงิน, `ngoen`) et `u08-l8c` (เกินไป,
    `koeen·pai`), toutes relues dans le dépôt le 2026-08-04. **Réserve déclarée**
    sur la source VOLUBILIS de ce graphème : la feuille `Romanization` l’intitule
    `เ◌ิ (เออะ ลดรูป)`, c’est-à-dire forme réduite de la voyelle BRÈVE เออะ, tout
    en le romanisant `oē` avec macron, c’est-à-dire long, et en donnant เหลิง →
    `loēng` pour exemple. L’intitulé et la romanisation de cette ligne ne
    concordent pas. La longueur de เปิด ne repose donc PAS sur elle : elle repose
    sur le macron de la ligne 77221 et sur l’IPA de Wiktionary. Voir
    l’incertitude 2. **Note de citation** : l’intitulé de la feuille emploie un
    tiret demi-cadratin là où ce dossier écrit ◌, ce caractère étant proscrit par
    les conventions du projet ; la ligne se retrouve à l’identique en cherchant
    la chaîne « เออะ ลดรูป » dans la feuille.

### Item 6 : ปิด

- `thai` : ปิด
- `codepoints` : U+0E1B U+0E34 U+0E14 (NFC)
- `ipa` : /pit̚˨˩/
- `ton` : bas
- `longueur` : courte
- `fr` : fermer ; fermé
- `transcription` : pìt
- `registre` : neutre
- `note_fr` : l’autre moitié de la paire, et le mot le plus court du jour. Trois
  lettres, et il suffit d’ajouter un เ devant pour obtenir son contraire. Le
  fait est mécanique et vous pouvez le vérifier vous-même : retirez le premier
  signe de เปิด et ce qui reste est exactement ปิด. La voyelle ◌ิ est brève, celle
  de จิต et de สิบ. Le ด ferme sur un `t`, la syllabe est morte, et le ton BAS
  vous est donné.
- `sources` :
  - RID 2554, entrée « ปิด », consultée le 2026-08-04 par requête POST unique
    sur https://dictionary.orst.go.th/func_lookup.php : graphie attestée comme
    entrée autonome, vedette unique, trois sens verbaux. Le (๑) est le fait de
    bloquer ou d’empêcher l’ouverture ou le passage, avec ปิดฝาหม้อ et ปิดถนน
    pour exemples. Le (๒) est le fait d’apposer, avec ปิดประกาศ. **Le (๓) donne
    par extension le sens d’arrêt, et son premier exemple est โรงเรียนปิด**,
    l’école est fermée : c’est cet emploi, un emploi d’ÉTAT et non d’action, qui
    soutient le second membre du champ `fr`. Il ne porte rien sur le support où
    le mot serait écrit. Longue liste de mots dérivés, dont ปิดบัง, non enseignés
    (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, sept lignes pour cette graphie, dont 75953 et
    75958, relevées le 2026-08-04 par le script versionné. Ligne 75953 : ThaiRom
    `pit`, ThaiPhon `_pit`, TYPE v., FRA « fermer ; clore ; clôturer ;
    terminer ». **Ligne 75958 : mêmes romanisations, TYPE adj., ENG « closed »,
    FRA « fermé ; clos »**. Le `_` note le ton bas et l’absence de macron la
    voyelle brève. Les lignes 75954 à 75957 donnent éteindre, cacher, coller et
    couvrir, non enseignés ; la ligne 110885 est une expression de typographie
    sans rapport. **Note de méthode** : la sortie par défaut du script versionné
    n’affiche que les cinq premières lignes d’une graphie ; les sept ont été lues
    en portant ce plafond à quarante dans une copie de travail du script, et la
    ligne 75958 se trouve au-delà du plafond par défaut.
  - en.wiktionary, entrée « ปิด », https://en.wiktionary.org/wiki/ปิด, consultée
    en rendu le 2026-08-04 (Orthographic `ปิด`, IPA /pit̚˨˩/, Paiboon `bpìt`,
    Royal Institute `pit`, verbe « to close », avec เปิด donné comme antonyme, et
    un sens 4 « to be out of action; to stop work (of an organization, shop) »
    qui est la seconde jambe du sens affiché). **Wiktionary ne donne PAS d’entrée
    adjective pour ปิด, là où il en donne une pour เปิด.** L’asymétrie est
    signalée ; elle ne gêne pas, le sens « fermé » tenant sur le RID (๓) et sur
    ce sens 4, plus la ligne adjective de VOLUBILIS.
  - Écart d’un seul code entre เปิด et ปิด : recalculé le 2026-08-04, la séquence
    NFC de เปิด est U+0E40 U+0E1B U+0E34 U+0E14 et celle de ปิด est U+0E1B
    U+0E34 U+0E14 ; le retrait du premier code de la première rend une chaîne
    strictement identique à la seconde, contrôle exécuté et non supposé.

### Item 7 : ห้าม

- `thai` : ห้าม
- `codepoints` : U+0E2B U+0E49 U+0E32 U+0E21 (NFC)
- `ipa` : /haːm˥˩/
- `ton` : descendant
- `longueur` : longue
- `fr` : interdire ; il est interdit de
- `transcription` : hâam
- `registre` : neutre
- `note_fr` : un mot dont vous pouvez lire le ton entièrement. ห est une consonne
  HAUTE, le ม ferme la syllabe sur un `m` et la rend VIVANTE, un ไม้โท est posé :
  le tableau de 8A donne le ton descendant, et c’est exactement la lecture de
  ห้อง publiée par `u07-l7a`. Une chose à ne pas confondre : ce ห se prononce,
  c’est une vraie consonne initiale. Ce n’est pas le ห muet de หมา. Le repère est
  celui qu’a publié `u05-l5a`, repris ici mot pour mot plutôt que reformulé : le
  ห se tait quand une des lettres ง, น, ม, ย, ว ou ร est collée juste derrière
  lui, sans le moindre signe posé sur le ห. Dans ห้าม, **les deux conditions
  manquent** : un ไม้โท est posé sur le ห, et ce qui suit immédiatement le ห
  n’est pas une de ces six lettres mais la voyelle, le ม ne venant qu’à la fin.
  C’est le motif exact que 5A donne pour ห้า et pour หิว, où le ห se prononce
  lui aussi.
- `sources` :
  - RID 2554, entrée « ห้าม », consultée le 2026-08-04 par requête POST unique
    sur https://dictionary.orst.go.th/func_lookup.php : graphie attestée comme
    entrée autonome, vedette unique à deux sens. Le (๑) est verbal, le fait de
    faire s’abstenir d’un acte ou de ne pas laisser faire ce qui est prescrit :
    c’est le sens enseigné. Le (๒) est un nom d’usage ancien désignant l’épouse
    d’un prince, dans นางห้าม et หม่อมห้าม ; il n’est PAS enseigné. **La liste
    des mots dérivés porte ห้ามไม่ให้ et ห้ามเข้าเขตกำหนด**, deux formes où ห้าม
    précède ce qui est interdit, ce qui corrobore la construction de l’item 8
    (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, ligne 14994, relevée le 2026-08-04 par le script
    versionné (ThaiRom `hām`, ThaiPhon `\hām`, TYPE v., ENG « forbid ; prohibit ;
    disallow ; ban », FRA « interdire ; défendre ; bannir ; proscrire ;
    prohiber »). Le `\` note le ton descendant, clé `TONES`, et le macron la
    voyelle longue. Entrée unique pour cette graphie dans la base.
  - en.wiktionary, entrée « ห้าม », https://en.wiktionary.org/wiki/ห้าม,
    consultée en rendu le 2026-08-04 (Orthographic `ห้าม`, **Phonemic `ฮ่าม`**,
    IPA /haːm˥˩/, Paiboon `hâam`, Royal Institute `ham`, verbe « to forbid; to
    prohibit; to inhibit », « to stop; to prevent; to block », plus un sens
    nominal archaïque non enseigné). **L’entrée porte une note d’emploi** : le
    verbe fonctionne typiquement devant un autre verbe, exemple ห้ามถามคำถาม.
    C’est la seconde jambe de la construction enseignée à l’item 8. La forme
    phonémique ฮ่าม, consonne basse plus ไม้เอก, redonne le même ton descendant
    par l’autre moitié du tableau de 8A.
  - Classe de ห et lecture du croisement : RID, entrée « ห », relevée le
    2026-08-04 par `rid-entry.mjs`, qui donne la quarante et unième consonne,
    nommée หอ หีบ, **de classe HAUTE**, employée comme consonne initiale ; et
    `u07-l7a`, relue dans le dépôt le même jour, qui publie « consonne HAUTE +
    ไม้โท → ton DESCENDANT, comme ห้อง ».

### Item 8 : ห้ามเข้า

- `thai` : ห้ามเข้า
- `codepoints` : U+0E2B U+0E49 U+0E32 U+0E21 U+0E40 U+0E02 U+0E49 U+0E32 (NFC)
- `ipa` : /haːm˥˩.kʰaw˥˩/
- `ton` : hâam descendant ; khâo descendant
- `longueur` : hâam longue ; khâo courte
- `fr` : entrée interdite ; défense d’entrer
- `litteral` : interdire (ห้าม) d’entrer (เข้า)
- `transcription` : hâam·khâo
- `registre` : neutre
- `note_fr` : le mot le plus chargé du jour à l’écran, avec deux ไม้โท dans huit
  lettres : c’est une densité inhabituelle et elle est là pour être remarquée.
  Les deux syllabes sont descendantes, mais **une seule des deux se calcule** :
  ห est haute, la syllabe est vivante, un ไม้โท est posé, le tableau de 8A donne
  descendant. Le ton de เข้า, lui, est celui de l’item publié par `u01-l1b` ;
  la forme เ◌า est hors du tableau depuis 4A, et 7A la nomme. Sur la
  construction, retenez seulement que ห้าม se place AVANT ce qui est interdit :
  c’est ce que dit la note d’emploi de Wiktionary, et ce que montrent les mots
  dérivés du dictionnaire.
- `sources` :
  - **RID 2554 : la graphie n’est PAS une vedette.**
    `node scripts/verification/rid-lookup.mjs ห้ามเข้า` rend `absent` le
    2026-08-04. Le dictionnaire porte en revanche, à la liste des mots dérivés de
    « ห้าม », la forme plus longue ห้ามเข้าเขตกำหนด, et la forme ห้ามไม่ให้ :
    la construction est donc attestée par le RID, le bloc de deux mots ne l’est
    pas. Ce point est cité pour ce qu’il est, et la graphie ne repose donc que
    sur les deux sources suivantes.
  - VOLUBILIS v26.2, `.xlsx`, lignes 15020 et 15021, relevées le 2026-08-04 par
    le script versionné. Ligne 15020 : ThaiRom `hām khao`, ThaiPhon
    `\hām \khao`, TYPE v. exp., ENG « no entry ; no admittance ; access denied ;
    keep out », FRA « défense d’entrer ; interdiction d’entrer ; entrée
    interdite ; On n’entre pas ! ». Ligne 15021 : mêmes romanisations, ENG « no
    entry », FRA « sens interdit ». **Ce second sens, celui du code de la route,
    n’est PAS enseigné** ; il est relevé pour être écarté explicitement. Les deux
    `\` donnent les deux tons descendants, le macron donne la première syllabe
    longue et son absence la seconde brève.
  - en.wiktionary, entrée « ห้ามเข้า », https://en.wiktionary.org/wiki/ห้ามเข้า,
    consultée en rendu le 2026-08-04 (Orthographic `ห้ามเข้า`, **Phonemic
    `ห้าม-เค่า`**, IPA /haːm˥˩.kʰaw˥˩/, Paiboon `hâam-kâo`, catégorie
    grammaticale « Phrase », sens « do not enter »). **Wiktionary la classe comme
    une PHRASE et non comme un nom**, ce que la leçon respecte en la traduisant
    par une formule et non par un substantif.
  - Réemploi de เข้า : mêmes champs et même contrôle qu’à l’item 3, item publié
    par `u01-l1b`.

## Exercices

### Exercice 1 : que dit ce mot ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : la lecture d’un mot affiché SEUL, sans audio préalable, sans
  phrase autour et sans transcription. Le mot est montré en grand spécimen ; la
  transcription et l’audio n’apparaissent qu’après la réponse. **Quatre des douze
  tirages sont des composés**, les tirages 2, 3, 9 et 10, et **chacun des quatre
  voit figurer parmi ses distracteurs le sens d’au moins un de ses propres
  blocs**, propriété vérifiée tirage par tirage : ทางเข้า a « entrer » et « le
  chemin, la voie » en face de lui, ทางออก a « sortir » et « le chemin, la
  voie », ห้ามเข้า a « il est interdit de » et « entrer », ห้องน้ำ a « la pièce »
  et « l’eau ». Une lecture partielle, qui s’arrête au premier bloc reconnu,
  échoue donc au lieu de passer.
- Consigne : « Lisez le mot, puis choisissez ce qu’il veut dire. Vous
  n’entendrez le mot qu’après avoir répondu. »
- Options : quatre par tirage, tirées du jeu des douze sens de l’exercice. Le jeu
  d’options change d’un tirage à l’autre ; aucune option n’est absurde, toutes
  appartiennent au champ du jour.
- Tirages : 12, ordre aléatoire. **La POSITION de la bonne réponse est
  équilibrée, trois fois à chacune des quatre places.**
  1. ทาง : options « le chemin, la voie » ✔, « l’entrée », « la sortie »,
     « sortir ». Bonne réponse en position 1.
  2. ทางเข้า : « entrer », « l’entrée » ✔, « le chemin, la voie », « la sortie ».
     Position 2.
  3. ทางออก : « sortir », « le chemin, la voie », « la sortie » ✔, « l’entrée ».
     Position 3.
  4. ออก : « la sortie », « le chemin, la voie », « entrer », « sortir » ✔.
     Position 4.
  5. เข้า : « entrer » ✔, « sortir », « l’entrée », « la sortie ». Position 1.
     Item publié de `u01-l1b`.
  6. เปิด : « fermé », « ouvert » ✔, « il est interdit de », « entrer ».
     Position 2.
  7. ปิด : « ouvert », « entrée interdite », « fermé » ✔, « sortir ». Position 3.
  8. ห้าม : « entrée interdite », « fermé », « l’entrée », « il est interdit
     de » ✔. Position 4.
  9. ห้ามเข้า : « entrée interdite » ✔, « il est interdit de », « entrer »,
     « la sortie ». Position 1.
  10. ห้องน้ำ : « la pièce », « les toilettes » ✔, « l’eau », « l’entrée ».
      Position 2. Item publié de `u05-l5c`.
  11. ห้อง : « l’eau », « les toilettes », « la pièce » ✔, « ouvert ».
      Position 3. Item publié de `u07-l7a`.
  12. น้ำ : « les toilettes », « la pièce », « ouvert », « l’eau » ✔.
      Position 4. Item publié de `u02-l2c`.
- Seuil de réussite : 10 sur 12. **Planchers mesurés, trois stratégies sans
  lecture ayant été recalculées sur les douze jeux d’options écrits ci-dessus, à
  la consolidation du 2026-08-04, et non estimées.** Chaque plafond est donné
  sous départage TOUJOURS favorable au tricheur : quand deux options d’un même
  tirage sont à égalité, le tirage est compté comme gagné.
  - Une position constante, « toujours la première option » ou n’importe laquelle
    des trois autres, plafonne à **3 sur 12, soit 25 %**, la répartition étant
    strictement de trois bonnes réponses par place, recomptée place par place.
  - La stratégie « prendre l’option la plus longue » plafonne à **3 sur 12**,
    correcte aux tirages 1, 8 et 10, sans aucune égalité. **Il n’existe PAS
    d’option la plus longue du jeu** : « le chemin, la voie » et « il est
    interdit de » font 18 signes chacune, et quatre mots chacune. Comptée en mots
    plutôt qu’en signes, la même stratégie plafonne à **4 sur 12**, deux tirages
    gagnés à coup sûr et deux par égalité.
  - La stratégie « prendre la plus courte » plafonne à **4 sur 12** : deux
    tirages gagnés à coup sûr, les 7 et 12, et deux gagnés seulement si l’égalité
    entre « entrer » et « sortir », six signes chacun, tombe du bon côté, aux
    tirages 4 et 5.
  - Un tirage entièrement au hasard entre quatre options atteint le seuil de
    10 sur 12 **environ une fois sur 26 500**.

  Les quatre valeurs sont sous le seuil, la plus haute d’un facteur deux et demi.
  **Ces chiffres remplacent ceux de la version `draft`, qui donnaient 1 sur 12 et
  3 sur 12 et étaient faux** ; le détail est à la ligne `PLANCHER-EX1-FAUX` du
  contre-audit consolidé.

- Feedback correct : « Oui. Un mot seul, sans phrase et sans son, et vous l’avez
  lu. »
- Feedback correct, tirages 2, 3, 9 et 10 : « Bien vu, et c’est le cas
  difficile : vous n’avez pas répondu au premier morceau reconnu, vous avez lu
  le mot entier. »
- Feedback incorrect, réponse égale au sens d’un bloc du mot : « Vous avez
  reconnu un morceau, et c’était le bon. Maintenant lisez ce qui suit : le
  second bloc change le sens du premier. » Aucune pénalité, le mot est ensuite
  joué et sa transcription affichée.
- Feedback incorrect, confusion entre เปิด et ปิด : « Comptez les signes. L’un
  des deux porte un เ devant sa consonne initiale, l’autre non, et c’est toute
  la différence. » Les deux mots sont affichés côte à côte, puis joués.
- Pièges connus : répondre au premier bloc reconnu et s’arrêter là, l’erreur
  attendue sur les tirages 2, 3, 9 et 10 ; confondre เปิด et ปิด, l’erreur la
  plus prévisible du tirage, et la seule que la leçon traite par un exercice
  entier ; prendre le เ de เปิด pour la consonne initiale et chercher son sens du
  côté de เข้า, qui commence lui aussi par เ ; répondre « sortir » pour ทางออก et
  « la sortie » pour ออก, c’est-à-dire inverser le bloc et le composé ; répondre
  au souvenir sur les tirages 5, 10, 11 et 12, qui sont des items déjà publiés,
  limite signalée à l’incertitude 4.

### Exercice 2 : quel mot entendez-vous ? (`listening`)

- Mécanique : `listening`
- Ce qu’il mesure : la reconnaissance à l’oreille des quatre mots que l’écrit
  confond le plus. Deux contrastes y sont mesurés, et un seul par tirage :
  เปิด contre ปิด, qui ne diffèrent que par le noyau vocalique, `oee` long contre
  `i` bref, à ton, consonne initiale et consonne finale identiques ; et ทางเข้า
  contre ทางออก, qui ne diffèrent que par leur second bloc. **Cet exercice est le
  seul du jour où l’écrit n’apparaît pas avant la réponse.**
- Consigne : « Écoutez, puis touchez le mot que vous venez d’entendre. »
- Options : quatre, FIXES pour les douze tirages, affichées en graphie thaïe et
  en transcription : เปิด, ปิด, ทางเข้า, ทางออก. L’ordre des quatre est mélangé à
  chaque tirage, de sorte qu’aucune place ne porte toujours la même réponse.
- Tirages : 12, ordre aléatoire, jamais deux fois de suite le même mot.
  Répartition strictement 3 par option.
  1. Audio เปิด (pòeet). 2. Audio ปิด (pìt). 3. Audio ทางออก (thaang·àwwk).
  2. Audio ทางเข้า (thaang·khâo). 5. Audio ปิด. 6. Audio ทางเข้า.
  3. Audio เปิด. 8. Audio ทางออก. 9. Audio ปิด. 10. Audio ทางเข้า.
  4. Audio เปิด. 12. Audio ทางออก.
- Seuil de réussite : 11 sur 12. **Planchers mesurés, trois stratégies
  calculées.** Une réponse constante plafonne à **3 sur 12, soit 25 %**, la
  répartition étant de trois tirages par option. La stratégie partielle
  « compter les syllabes », qui distingue sans effort les deux monosyllabes des
  deux bisyllabes mais ne tranche pas à l’intérieur de chaque paire, ramène
  chaque tirage à pile ou face : son espérance est de **6 sur 12**, et elle
  atteint le seuil de 11 sur 12 **une fois sur 315**. Un tirage entièrement au
  hasard entre quatre options atteint le seuil **moins d’une fois sur 400 000**.
  Le seuil est haut, et c’est délibéré : la discrimination visée est facile à
  l’oreille, c’est à l’œil qu’elle est difficile, et l’exercice 1 mesure l’œil.
- Feedback correct : « Oui. À l’oreille, ces deux-là ne se ressemblent pas du
  tout. »
- Feedback correct, tirages เปิด et ปิด : « Exactement. Un `oee` long d’un côté,
  un `i` bref de l’autre, et le même ton bas pour les deux : c’est la voyelle qui
  fait tout. »
- Feedback incorrect, confusion เปิด et ปิด : « Réécoutez les deux l’un après
  l’autre. Le premier tient sa voyelle, le second la coupe net. » Réécoute
  ralentie proposée, aucune pénalité.
- Feedback incorrect, confusion ทางเข้า et ทางออก : « Les deux commencent
  pareil. Écoutez seulement la fin : la seconde moitié n’est pas la même. »
  Réécoute proposée, aucune pénalité.
- Pièges connus : chercher le ton pour trancher entre เปิด et ปิด, alors qu’ils
  l’ont identique et que c’est la voyelle qui les sépare ; se décider sur la
  première syllabe de ทางเข้า et ทางออก, qui est la même ; répondre à la place et
  non au son, raison pour laquelle l’ordre des quatre options est mélangé à
  chaque tirage ; entendre le `k` final de ทางออก comme un `t`, confusion
  attendue et déjà travaillée par 9A.

### Exercice 3 : remettez les blocs dans l’ordre (`word_order`)

- Mécanique : `word_order`
- Ce qu’il mesure : la composition, c’est-à-dire le geste inverse de la lecture.
  Les quatre premiers tirages demandent de CHOISIR deux blocs parmi quatre et de
  les ordonner, ce que la mécanique permet par ses actions explicites déplacer et
  retirer : les deux blocs de trop doivent être écartés, et un ordre inversé est
  faux. Les deux derniers tirages demandent d’ordonner quatre blocs d’une phrase
  entière, sans retrait.
- Consigne, tirages 1 à 4 : « Voici quatre blocs. Deux suffisent. Écartez les
  deux autres et mettez les bons dans l’ordre. »
- Consigne, tirages 5 et 6 : « Remettez ces quatre blocs dans l’ordre. »
- Interaction : sélection au clic ou au clavier, actions « déplacer » et
  « retirer » explicites, jamais de glisser-déposer obligatoire, conformément à
  la règle de mécanique du produit. Chaque bloc est une cible d’au moins 44 par
  44 points.
- Tirages : 6, ordre aléatoire, blocs mélangés à chaque présentation.
  1. Cible « l’entrée ». Blocs proposés : ทาง, เข้า, ห้าม, ออก. Réponse ทางเข้า.
  2. Cible « la sortie ». Blocs proposés : ออก, ห้าม, ทาง, เข้า. Réponse ทางออก.
  3. Cible « défense d’entrer ». Blocs proposés : เข้า, ทาง, ออก, ห้าม. Réponse
     ห้ามเข้า.
  4. Cible « les toilettes ». Blocs proposés : น้ำ, ทาง, ห้อง, เข้า. Réponse
     ห้องน้ำ. Les deux blocs utiles sont des items publiés, ห้อง par `u07-l7a` et
     น้ำ par `u02-l2c`.
  5. Cible « Où est la sortie ? ». Blocs proposés : ครับ, ที่ไหน, ทางออก, อยู่.
     Réponse ทางออกอยู่ที่ไหนครับ.
  6. Cible « Où sont les toilettes ? ». Blocs proposés : อยู่, ห้องน้ำ, ครับ,
     ที่ไหน. Réponse ห้องน้ำอยู่ที่ไหนครับ, **item publié VERBATIM par
     `u05-l5c`**.
- Seuil de réussite : 5 sur 6. **Plancher mesuré, et calculé sous l’hypothèse la
  plus DÉFAVORABLE.** Une réponse constante n’existe pas : les blocs sont
  mélangés à chaque présentation, et valider l’ordre proposé revient à tirer au
  sort. Sur un tirage à retrait, choisir deux blocs ordonnés parmi quatre donne
  une chance sur douze. Sur un tirage de phrase, ordonner quatre blocs donne une
  chance sur vingt-quatre. **Les deux tirages de phrase partagent une seule et
  même ossature, `[lieu] + อยู่ + ที่ไหน + ครับ` : ils sont donc traités comme
  réussis ou ratés ENSEMBLE**, ce qui augmente la probabilité d’un succès au
  hasard et constitue bien l’hypothèse défavorable. Le seuil de 5 sur 6 exige
  alors les deux phrases plus au moins trois tirages à retrait sur quatre, soit
  une probabilité de 45 sur 497 664, c’est-à-dire **environ une fois sur
  11 000**.
- Feedback correct, tirages 1 à 4 : « Oui. Et vous avez écarté les deux blocs de
  trop, ce qui est la moitié du travail. »
- Feedback correct, tirages 5 et 6 : « Oui. C’est la même phrase que celle de la
  leçon 5C, avec un autre lieu devant. »
- Feedback incorrect, ordre inversé : « Les deux bons blocs, mais dans l’autre
  sens. En thaï comme en français, ici, c’est le premier mot qui dit de quoi on
  parle et le second qui précise. »
- Feedback incorrect, bloc en trop conservé : « Un bloc de trop est resté.
  Relisez la cible : combien de morceaux lui faut-il ? » Aucune pénalité, le
  nombre de blocs attendus est rappelé à l’écran.
- Pièges connus : construire ห้ามออก au tirage 3, en prenant le mauvais second
  bloc, forme que la leçon n’enseigne pas et dont aucune source n’a été
  consultée ; construire เข้าทาง au tirage 1, ordre inversé, **forme qui existe
  en thaï avec un tout autre sens, et l’affirmation est sourcée** : le RID 2554
  la porte comme vedette autonome, relevée le 2026-08-04 par
  `node scripts/verification/rid-entry.mjs เข้าทาง`, avec เข้า ๑ pour แม่คำ et un
  sens verbal qui n’a rien de spatial, celui de tomber juste ou d’arriver dans ce
  qu’on sait faire ; elle figure aussi dans la liste des ลูกคำ de « เข้า ๑ »
  citée à l’item 3. La leçon ne l’enseigne pas ; placer ครับ ailleurs
  qu’à la fin aux tirages 5 et 6, alors que sa place est fixée depuis l’unité 2 ;
  chercher un bloc manquant au tirage 4, où les deux blocs utiles sont des mots
  appris il y a plusieurs unités et non des mots du jour.

### Exercice 4 : appariez le mot et son sens (`association`)

- Mécanique : `association`
- Ce qu’il mesure : les huit items du jour, tous ensemble, sans qu’aucune option
  ne serve deux fois. C’est la seule carte qui les met tous en concurrence, et
  c’est donc elle qui interdit d’avoir appris quatre mots sur huit.
- Consigne : « Chaque mot de gauche a un sens et un seul. Associez-les. Touchez
  un mot, puis un sens : aucun glisser-déposer n’est nécessaire. »
- Interaction : sélection au clic ou au clavier des deux membres d’une paire.
  Les cartes de gauche affichent la graphie thaïe SEULE, en grand spécimen, sans
  transcription et sans audio avant la réponse.
- Paires à former : 8, bijection stricte.
  1. ทาง ↔ « le chemin, la voie »
  2. ออก ↔ « sortir »
  3. ทางเข้า ↔ « l’entrée »
  4. ทางออก ↔ « la sortie »
  5. เปิด ↔ « ouvert »
  6. ปิด ↔ « fermé »
  7. ห้าม ↔ « il est interdit de »
  8. ห้ามเข้า ↔ « entrée interdite »
- Seuil de réussite : 8 sur 8. **Sept paires correctes en imposent une huitième :
  le score 7 sur 8 n’existe pas dans une bijection**, et le seuil est donc bien
  la seule valeur de passage possible. **Plancher mesuré, calculé sous
  l’hypothèse la plus DÉFAVORABLE.** Une réponse constante est structurellement
  impossible, chaque carte de droite n’étant utilisable qu’une fois. Un
  appariement entièrement au hasard réussit une fois sur 40 320. Mais l’ignorance
  totale n’est pas l’hypothèse réaliste : un apprenant qui ne lit rien voit
  quand même que trois graphies commencent par la même suite de lettres et deux
  autres par une autre, et peut supposer que les sens correspondants se
  regroupent de la même façon. En lui accordant ce regroupement en entier, il
  reste **6 arrangements pour le groupe de ทาง, 6 pour le reste et 2 pour le
  groupe de ห้าม, soit 72 arrangements, donc une chance sur 72, ou 1,4 %.** C’est
  ce chiffre qui doit être retenu, et il est très en dessous d’un score parfait
  exigé. **Une seconde stratégie a été mesurée et neutralisée à la conception** :
  apparier le mot thaï le plus long au sens français le plus long. Elle échoue,
  et le calcul a été refait à la consolidation du 2026-08-04 sur les huit paires
  écrites ci-dessus. La graphie la plus longue est ห้ามเข้า, huit points de code,
  et son sens « entrée interdite » fait seize signes, ce qui n’est que le
  troisième sens le plus long. Les deux sens les plus longs sont à ÉGALITÉ à
  dix-huit signes, « le chemin, la voie » et « il est interdit de », et ils sont
  portés par ทาง et ห้าม, trois et quatre points de code, deux des graphies les
  plus courtes du jeu. La stratégie appariait donc systématiquement de travers.
  **La version `draft` écrivait que « il est interdit de » était le sens le plus
  long : c’était faux, il y a égalité**, voir la ligne `PLANCHER-EX1-FAUX` du
  contre-audit consolidé. La conclusion, elle, ne change pas.
- Feedback correct : « Oui. Huit mots, huit sens, et trois d’entre eux sont faits
  de deux autres. »
- Feedback correct, paires 3, 4 et 8 : « Oui, et vous avez lu les deux moitiés.
  C’est exactement le geste de la leçon. »
- Feedback incorrect : « Prenez le mot de gauche et cherchez dedans un mot que
  vous connaissez déjà. Puis lisez ce qui reste. » Aucune pénalité, le tableau
  des huit mots reste consultable pendant l’exercice.
- Pièges connus : intervertir ทางเข้า et ทางออก, la confusion la plus prévisible,
  les deux ne différant que par leur seconde moitié ; intervertir เปิด et ปิด,
  déjà travaillée par les exercices 1 et 2 ; donner à ทาง le sens de ทางเข้า
  parce qu’il en est le début ; donner à ห้าม le sens de ห้ามเข้า pour la même
  raison ; chercher un sens de « sortie » pour ออก, qui est le verbe et non le
  lieu.

### Exercice 5 : écrivez ce que vous voyez (`recall`)

- Mécanique : `recall`
- Ce qu’il mesure : la production, sans plancher de hasard et sans aide
  auditive. L’apprenant voit le mot ÉCRIT, sans l’entendre, et doit produire la
  transcription complète. Deux choses y sont mesurées d’un coup : la lecture des
  lettres, et l’accent de ton, qui distingue notamment `thaang` de `àwwk` à
  l’intérieur d’un même mot.
- Consigne : « Lisez le mot, puis écrivez-le en transcription Thaïnaute, accent
  de ton compris. Vous n’entendrez le mot qu’après avoir répondu. »
- Politique de saisie : alphabet latin uniquement, casse ignorée, espaces de
  début et de fin ignorés. Comme en `u07-l7a`, `u08-l8a` et `u09-l9a`, l’accent
  de ton est OBLIGATOIRE et non tolérant : il fait partie de ce qui est mesuré.
  Il se pose sur la PREMIÈRE lettre du noyau vocalique, conformément à
  l’amendement v1.1 des conventions, ce qui donne `àwwk`, `pòeet`, `pìt` et
  `hâam`. Le séparateur de syllabes `·` est facultatif sur les trois
  polysyllabes.
- Tirages et réponses : 8, les huit items du jour. Les numéros sont des
  identifiants, pas un ordre de présentation : l’ordre affiché est aléatoire.
  1. ทาง : réponse `thaang`.
  2. ออก : réponse `àwwk`.
  3. ทางเข้า : réponse `thaang·khâo` ; variante acceptée `thaangkhâo`.
  4. ทางออก : réponse `thaang·àwwk` ; variante acceptée `thaangàwwk`.
  5. เปิด : réponse `pòeet`.
  6. ปิด : réponse `pìt`.
  7. ห้าม : réponse `hâam`.
  8. ห้ามเข้า : réponse `hâam·khâo` ; variante acceptée `hâamkhâo`.
- **Plancher mesuré : aucun. La saisie est libre, il n’y a pas d’options à
  deviner. Une réponse constante, quelle qu’elle soit, vaut au mieux 1 sur 8, et
  seulement si elle coïncide avec l’une des huit réponses.** Seuil de réussite :
  6 sur 8.
- Feedback correct : « C’est ça. Vous l’avez lu sans l’entendre. »
- Feedback incorrect, accent absent : « L’accent manque, et il fait partie de la
  réponse. Rien pour le moyen, `à` pour le bas, `â` pour le descendant. »
- Feedback incorrect, accent posé sur la mauvaise lettre : « L’accent va sur la
  PREMIÈRE lettre du noyau : `àwwk`, `pòeet`, `hâam`. » Le mot est ensuite joué
  et la comparaison A/B est proposée.
- Feedback incorrect, tirage 4 : « Les deux syllabes n’ont pas le même ton.
  La première est moyenne et ne prend rien, la seconde est basse et prend un
  accent. » Le mot est joué lentement.
- Pièges connus : écrire `thaangawwk` sans accent, en traitant le composé comme
  un seul bloc à ton unique, erreur attendue et instructive ; écrire `pòet` pour
  เปิด, en oubliant que le noyau est long ; écrire `pìit` pour ปิด, en lui
  donnant la longueur du précédent ; écrire `hâamkhao` sans accent sur la seconde
  syllabe, alors que les deux sont descendantes ; écrire `awwk` sans accent parce
  que le mot commence par une consonne muette et qu’on cherche le ton du côté du
  ก final ; transcrire la LETTRE plutôt que le son en écrivant `pòeed` ou `pìd`,
  erreur que 9A a déjà consignée.

### Les cinq mécaniques sont employées, et c’est une première pour une leçon A ou B

`reading`, `listening`, `word_order`, `association` et `recall` sont toutes les
cinq présentes, et aucune n’est décorative. C’est notable parce que `u06-l6a` et
`u09-l9a` avaient toutes deux écarté `word_order` en écrivant que leur objet
n’avait pas d’ordre à reconstruire, ce qui était juste dans les deux cas. Ici
l’objet EST une composition : trois des huit items sont faits de deux blocs, et
un ordre inversé produit autre chose. La mécanique mesure donc bien ce qu’elle
annonce, et elle n’a pas été ajoutée pour remplir la grille.

## Dialogue

Micro-situation : un visiteur demande son chemin à une employée. **Aucun lieu
n’est nommé, aucune enseigne n’est citée, et c’est une contrainte de l’unité
plutôt qu’un choix de style.** Le dialogue emploie deux des huit mots du jour et
ne cherche pas à les caser tous. Toutes les ossatures sont des blocs publiés ;
le détail est donné au dossier de production.

| Locuteur | Thaï                  | Transcription                   | Français                |
| -------- | --------------------- | ------------------------------- | ----------------------- |
| Visiteur | ขอโทษครับ             | khǎww·thôot khráp               | Excusez-moi.            |
| Visiteur | ทางออกอยู่ที่ไหนครับ  | thaang·àwwk yòuu thîi·nǎi khráp | Où est la sortie ?      |
| Employée | อยู่ที่นั่นค่ะ        | yòuu thîi·nân khâ               | C’est là-bas.           |
| Visiteur | ห้องน้ำอยู่ที่ไหนครับ | hâwng·náam yòuu thîi·nǎi khráp  | Où sont les toilettes ? |
| Employée | อยู่ที่นี่ค่ะ         | yòuu thîi·nîi khâ               | C’est ici.              |
| Visiteur | ขอบคุณครับ            | khàwwp·khoun khráp              | Merci.                  |
| Employée | ไม่เป็นไรค่ะ          | mâi·pen·rai khâ                 | De rien.                |

Deux remarques de lecture, à faire remarquer plutôt qu’à enseigner. D’abord la
quatrième réplique est un item publié depuis la leçon 5C, mot pour mot :
l’apprenant la dit peut-être depuis des semaines sans avoir jamais vu que
ห้องน้ำ y est un composé. Ensuite l’employée répond deux fois sans répéter le nom
du lieu, comportement déjà rencontré en 3C, 4E, 8A et 9A.

## SRS

- `srs-u10-l10b-01` : lire un mot affiché seul et donner son sens. Critère de
  maîtrise : 10 mots sur 12, sans audio et sans transcription avant la réponse,
  sur deux sessions espacées, le tirage comportant obligatoirement au moins trois
  composés, au moins deux blocs isolés dont le sens est distinct de celui du
  composé qui les contient, et la paire เปิด contre ปิด dans chaque tirage.
  **Cette carte est NOUVELLE au sens strict** : aucune carte du parcours ne
  mesure la lecture d’un mot affiché hors phrase. `srs-u09-l9a-01` mesure le son
  qui ferme un mot, pas son sens.
- `srs-u10-l10b-02` : la paire เปิด contre ปิด, aux deux sens du terme. Critère :
  11 tirages sur 12, sur deux sessions distinctes, la moitié des tirages étant
  présentée à l’écrit sans audio et l’autre moitié à l’écoute sans écrit. Aucune
  session ne présente les deux en même temps : c’est justement leur dissociation
  que la carte mesure. **Le doublon signalé par la version `draft` n’existe
  pas** : `lecon-10e.md` avait prévu une carte sur les deux mêmes graphies,
  `srs-u10-l10e-03`, et l’a RETIRÉE en le disant, au motif qu’une carte de
  vocabulaire appartient à la leçon qui publie le mot. Relevé fait dans son
  texte le 2026-08-04. Il n’y a donc rien à vérifier avant production sur ce
  point.
- `srs-u10-l10b-03` : composition. Reconstruire ทางเข้า, ทางออก, ห้ามเข้า et
  ห้องน้ำ à partir de blocs mélangés, avec au moins deux blocs de trop à écarter.
  Critère : 5 tirages sur 6, sur deux sessions espacées. Les blocs de trop sont
  toujours pris parmi ทาง, เข้า, ออก, ห้าม, ห้อง et น้ำ, jamais parmi du
  vocabulaire non enseigné.
- `srs-u10-l10b-04` : vocabulaire nouveau du jour, ทาง, ออก, ทางเข้า, ทางออก,
  เปิด, ปิด, ห้าม et ห้ามเข้า, et eux seuls. Critère : reconnaissance à l’écoute
  et à la lecture, 2 réussites espacées. La production à partir du français
  n’est PAS exigée par cette leçon. **Un point de critère est ajouté à la
  consolidation du 2026-08-04, et il vient d’une demande écrite par une autre
  leçon** : `lecon-10e.md`, qui réemploie เปิด et ปิด à son spécimen 3, demande
  que la reconnaissance de ces deux mots vaille aussi LUE SUR UN SUPPORT et pas
  seulement isolée, faute de quoi rien dans le SRS ne mesurerait ce que son
  spécimen enseigne. La demande est accordée, elle porte sur la carte de 10B et
  sur elle seule, et aucun fichier de l’unité n’a été modifié pour cela.
- **Entretien des tons : aucune carte nouvelle, et c’est une décision, pas un
  oubli.** Le fil des tons de `CONVENTIONS.md` demande un ENTRETIEN par le SRS à
  partir de l’unité 8, pas une carte de plus par leçon, et `u08-l8a` puis
  `u09-l9a` ont signalé le recouvrement des cartes de ton sans qu’il soit
  tranché. 10B ne crée donc pas une carte de plus ; elle APPORTE des tirages à
  une carte existante et le demande :
  - à `srs-u07-l7a-03`, moyen contre bas : les tirages ทาง au ton moyen, ออก,
    เปิด et ปิด au ton bas, plus le mot ทางออก qui enchaîne les deux dans une
    seule graphie, ce qu’aucun tirage existant de cette carte ne fait ;
  - **à `srs-u04-l4a-06`, montant contre haut : RIEN.** Aucun item du jour ne
    porte l’un ni l’autre de ces deux tons. La leçon ne les déclare pas acquis
    pour autant, et elle ne fabrique pas de tirage artificiel pour faire nombre.
    C’est un écart au fil des tons qui est SIGNALÉ et non tranché, conformément à
    la dernière phrase de la section « Fil des tons » de `CONVENTIONS.md`.
    Une leçon une, comme `u09-l9a`, apporte à la carte ; une leçon deux, comme
    celle-ci, n’a rien à lui apporter. Le contraste reste entretenu par la carte
    elle-même.
    Une leçon ne modifie normalement pas la carte d’une autre : cet apport est
    donc une DEMANDE consignée, à exécuter à la consolidation de l’unité 10, et
    non un acte. Voir l’arbitrage 2.
- Hors périmètre, parce que déjà porté par une carte existante qu’il ne faut ni
  dupliquer ni affaiblir :
  - เข้า garde sa carte de `u01-l1b`, ห้องน้ำ celle de `u05-l5c`, ห้อง celle de
    `u07-l7a`, น้ำ celle de `u02-l2c`, ปา et ป่า celles de `u01-l1c`, ม้า celle
    de `u01-l1d`. Aucune carte n’est créée pour eux ;
  - ทางม้าลาย, ม้าลาย, ทางเท้า et ทางด่วน sont des spécimens de note culturelle,
    affichés avec leur traduction, jamais demandés en production ni en
    reconnaissance. Aucune carte ;
  - **aucune carte ne demande le TON d’une syllabe que le tableau de 8A ne
    couvre pas, et il y en a deux familles, pas une.** D’un côté les syllabes
    fermées par `k`, `t` ou `p` : ออก, เปิด, ปิด et la seconde syllabe de
    ทางออก. De l’autre la forme สระเอา, hors du tableau depuis 4A : la seconde
    syllabe de ทางเข้า et celle de ห้ามเข้า, toutes deux เข้า. Aucun de ces six
    tons n’est demandé en LECTURE. Ils ne sont demandés qu’en reconnaissance à
    l’écoute par `srs-u10-l10b-04`, et en écriture guidée par l’exercice 5, où le
    mot est sous les yeux et où la transcription publiée sert de corrigé.

## Note culturelle

ทาง est un mot à qui le dictionnaire fait beaucoup d’enfants. Sa liste de mots
dérivés en compte dix-sept, et il suffit d’en lire trois pour voir le procédé :
ทางเท้า, la voie des pieds, c’est-à-dire le trottoir ; ทางด่วน, la voie rapide ;
et ทางม้าลาย, la voie du zèbre, que le dictionnaire définit comme la surface
peinte de bandes noires et blanches alternées où les piétons traversent la rue.

Ce dernier mérite qu’on s’y arrête, parce qu’il contient un mot que vous avez
appris à la leçon 1D. ม้า, le cheval. Collez-lui ลาย et vous obtenez ม้าลาย, le
zèbre, que le dictionnaire décrit comme un animal du genre Equus ressemblant à un
cheval mais portant des rayures noires et blanches en travers du corps. Le zèbre
thaï est donc, littéralement, un cheval rayé, et le passage piéton une voie de
zèbre. Wiktionary note que le composé s’est très probablement formé sur le modèle
de l’anglais zebra crossing.

Un second point, et il concerne directement un mot du jour. ทางออก mène une
double vie. Dans son usage concret, c’est la sortie. Mais quand le dictionnaire
lui donne une vedette, ce n’est pas ce sens-là qu’il retient : il l’étiquette
comme une locution figée et le glose par l’issue au sens de la solution, la
manière de se tirer d’un problème. Wiktionary donne les deux sens et marque le
second comme figuré et idiomatique, VOLUBILIS les sépare en deux lignes. Le mot
qui dit par où l’on sort est donc aussi celui qu’on emploie pour dire qu’on a
trouvé comment s’en sortir. C’est la même image qu’en français, et elle n’a pas
été empruntée : les deux langues sont arrivées là chacune de son côté, ce que le
dossier n’affirme pas comme un fait d’histoire mais constate comme une
coïncidence.

- Sources du fait « le dictionnaire range ทางเท้า, ทางด่วน et ทางม้าลาย parmi les
  dérivés de ทาง », toutes consultées le 2026-08-04 :
  - RID 2554, entrée « ทาง ๑ », relevée par
    `node scripts/verification/rid-entry.mjs ทาง` : la liste des ลูกคำ porte
    dix-sept formes, dont ทางเท้า, ทางด่วน, ทางม้าลาย, ทางข้าม, ทางผ่าน et
    ทางออก. Décompte fait sur la sortie du script, pas de mémoire.
  - RID 2554, entrées « ทางเท้า » et « ทางม้าลาย », mêmes date et méthode : la
    première est définie comme la voie surélevée en bord de rue où l’on marche,
    avec บาทวิถี pour synonyme ; la seconde comme la surface aménagée pour la
    traversée des piétons, peinte de bandes noires et blanches alternées. Les
    deux portent ทาง ๑ pour แม่คำ (faits cités par référence, définitions non
    reproduites).
  - VOLUBILIS v26.2, `.xlsx`, lignes 100411, 100138 et 100254, relevées par le
    script versionné : ทางเท้า, FRA « trottoir [m] » ; ทางด่วน, FRA « voie
    expresse [f] ; autoroute [f] » ; ทางม้าลาย, FRA « passage pour piétons
    [m] ; passage clouté [m] ».
- Sources du fait « ม้าลาย est le zèbre et son แม่คำ est ม้า » :
  - RID 2554, entrée « ม้าลาย », même date et méthode : mammifère du genre Equus,
    de la famille des Equidae, de forme proche du cheval mais portant des rayures
    noires et blanches nettement contrastées en travers du corps, originaire
    d’Afrique. Son แม่คำ est « ม้า ๑ » (fait cité par référence, définition non
    reproduite).
  - en.wiktionary, entrée « ทางม้าลาย »,
    https://en.wiktionary.org/wiki/ทางม้าลาย, consultée en rendu le 2026-08-04
    (Orthographic `ทางม้าลาย`, Phonemic `ทาง-ม้า-ลาย`, IPA
    /tʰaːŋ˧.maː˦˥.laːj˧/, Paiboon `taang-máa-laai`, nom « zebra crossing »,
    étymologie donnée comme ทาง plus ม้าลาย, ce dernier glosé « zebra », avec la
    mention que le composé est vraisemblablement un calque de l’anglais zebra
    crossing).
  - ม้า est un item publié de `u01-l1d`, `máa`, ton haut, relu dans le dépôt le
    2026-08-04. ม้าลาย et ทางม้าลาย ne sont PAS enseignés comme vocabulaire.
- Sources de la double vie de ทางออก : les trois relevés sont donnés en entier à
  l’item 4 et ne sont pas répétés ici.
- **Ce qui n’est PAS affirmé.** La note ne dit rien de la date d’apparition de
  ทางม้าลาย en thaï, aucune source consultée ne la donnant. Elle ne dit pas que
  l’image de la sortie comme solution a été empruntée par une langue à l’autre :
  aucune source consultée ne l’établit, et la formulation retenue le dit
  explicitement. Elle ne dit rien non plus de la fréquence de ces mots sur les
  panneaux, faute de source, ce qui est le point de vigilance de toute l’unité.

## Dossier de production

- Acteur de génération : Claude Opus 5 (`claude-opus-5[1m]`), rédaction originale
  le 2026-08-04. Aucune formulation reprise d’une source ; les définitions
  thaïes, anglaises et françaises citées dans les champs `sources` le sont à
  titre de preuve de consultation, jamais comme texte de leçon.
- Méthode de vérification : chaque fait linguistique est vérifié contre au moins
  deux autorités indépendantes réellement consultées le 2026-08-04, méthode
  d’accès consignée fait par fait selon l’amendement v1.2 de `CONVENTIONS.md`,
  et l’artefact VOLUBILIS de référence est le `.xlsx` conformément à l’amendement
  v1.3.
- Toutes les consultations de ce dossier ont été faites le 2026-08-04.
- **Contrainte de véracité de l’unité, vérifiée avant rédaction et re-balayée
  après.** Ce fichier ne contient aucun nom de commerce, aucune enseigne, aucun
  prix, aucun nom de rue, de station ni de quartier. Le dialogue ne nomme pas le
  lieu où il se déroule. Les seuls noms propres qui y figurent sont ceux des
  sources et des scripts du dépôt. Les spécimens d’écran et d’exercice sont soit
  des items publiés du parcours, soit les items du jour, soit des composés dont
  chaque bloc est sourcé ; aucun n’est présenté comme le relevé d’un panneau
  réel.

### Sources employées et méthode d’accès

- **RID 2554** (Office of the Royal Society), autorité n° 1 en orthographe et en
  sens. Accès par requête POST unique par graphie sur
  https://dictionary.orst.go.th/func_lookup.php, paramètres
  `word=<graphie>&funcName=lookupWord&status=lookup`, requêtes espacées d’au
  moins 1,2 seconde par les scripts versionnés `rid-lookup.mjs` et
  `rid-entry.mjs`, agent utilisateur identifiant le projet. Aucun texte de
  définition n’est recopié, aucune définition n’est traduite mot à mot, et
  **aucun écran d’apprenant ne restitue une définition du RID**. Les champs
  `sources` indiquent en français la teneur du sens retenu, parce que c’est le
  minimum qui prouve une concordance, ce que la politique autorise expressément.
  **Décompte refait à la consolidation du 2026-08-04, et corrigé.** La version
  `draft` annonçait « 26 interrogées, 22 attestées, 4 absentes » et le présentait
  comme recomputable depuis cinq listes. L’arithmétique de ces cinq listes était
  juste, mais elles ne portaient PAS toutes les graphies dont le fichier rapporte
  lui-même un résultat RID : cinq manquaient à la section « Mots vérifiés puis
  écartés », une à l’incertitude 5, et cinq requêtes ont été ajoutées par la
  consolidation. Total réel : **37 graphies distinctes interrogées, 0 erreur de
  requête, 28 attestées comme vedettes et 9 absentes.** Les huit listes ci-dessous
  se somment à ce total, et c’est ce que « recomputable » doit vouloir dire.
  - Attestées et citées comme preuve d’item (6) : ทาง, ออก, ทางออก, เปิด, ปิด,
    ห้าม.
  - Attestées et citées comme preuve d’attestation indirecte pour un item non
    lexicalisé (1) : เข้า. Son sens (๗) porte l’exemple ทางเข้า, seule
    attestation RID de l’item 3.
  - Attestées et citées comme spécimen, comme lettre ou comme note culturelle
    (7) : ห้องน้ำ, อ, ห, ทางเท้า, ทางม้าลาย, ม้าลาย, ลาย. La dernière est
    interrogée pour contrôle et n’est citée nulle part comme preuve.
  - Attestées, interrogées, NON citées comme preuve (8) : ระวัง, ชาย, หญิง,
    ผู้ชาย, ผู้หญิง, สุภาพบุรุษ, สุภาพสตรี et บุหรี่. Motifs à la section
    « Mots vérifiés puis écartés ».
  - **Attestées, interrogées pour instruire un mot ÉCARTÉ (2)** : ผลัก et ดึง.
    Les deux sont des vedettes ; les deux relevés ont été refaits à la
    consolidation du 2026-08-04. Elles manquaient aux listes de la version
    `draft`.
  - **Attestée, interrogée pour une question de CLASSE de lettre (1)** :
    อักษรต่ำ, citée à l’incertitude 5 et absente elle aussi des listes de la
    version `draft`.
  - **Attestées, interrogées par la CONSOLIDATION du 2026-08-04 (3)** : เข้าทาง,
    qui source désormais un piège de l’exercice 3 ; ญ et เดี่ยว, interrogées pour
    instruire l’incertitude 5.
  - **Absentes comme vedettes (9), et ces absences ont orienté la rédaction** :
    ทางเข้า, ห้ามเข้า, ห้องน้ำชาย et ห้องน้ำหญิง ; puis ห้ามสูบบุหรี่, สูบบุหรี่
    et ห้ามจอด, trois blocs écartés dont l’absence est rapportée à la section
    « Mots vérifiés puis écartés » sans avoir été comptée ; puis อักษรต่ำเดี่ยว
    et อักษรเดี่ยว, interrogées par la consolidation et **absentes toutes les
    deux**, ce qui a fait tomber un raisonnement de l’incertitude 5, voir plus
    bas. Les deux premières sont des items du jour dont le dossier déclare
    l’attestation plus faible ; ห้องน้ำชาย et ห้องน้ำหญิง ont fait écarter tout
    le bloc des toilettes genrées.
- **VOLUBILIS v26.2** (licence CC BY-SA 4.0), pivot français et corroboration de
  ton et de longueur.
  - **Exemplaires employés, identifiés par empreinte recalculée le 2026-08-04, et
    l’avertissement du brief a été pris au sérieux avant toute citation.** Le
    `.xlsx` présent sur le poste fait **10 848 409 octets**, SHA-256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, valeur
    identique à celle documentée dans l’en-tête de `volubilis-lookup.mjs` et à
    celle employée par `u08-l8a` et `u09-l9a`. Ce n’est donc PAS la page d’erreur
    de 154 octets qui s’était déjà glissée sous ce nom, et l’empreinte a été
    recalculée avant la première citation, pas après. Le `.ods`, employé pour les
    deux feuilles de clés, fait **15 724 718 octets**, SHA-256
    `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, valeur
    identique à celle consignée par `u04-l4a` à `u09-l9a`.
  - **Numéros de ligne, tous rendus le 2026-08-04** par
    `node scripts/verification/volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <graphie>` :
    ทาง 100079, ออก 64631, ทางเข้า 100188, ทางออก 100290 et 100291, เปิด 77221 et
    77225, ปิด 75953 et 75958, ห้าม 14994, ห้ามเข้า 15020 et 15021. Spécimens et
    contrôles : ห้องน้ำ 16245, ทางเท้า 100411, ทางด่วน 100138, ทางม้าลาย 100254,
    ระวัง 82106 et 82107, ชาย 6494, หญิง 113139, ห้องน้ำชาย 16247. Le même relevé
    donne 114 579 lignes non vides et 586 541 chaînes partagées, chiffres
    identiques à ceux de `u08-l8a` et `u09-l9a`.
  - **Limite du script versionné, découverte en s’en servant et consignée plutôt
    que contournée.** `volubilis-lookup.mjs` annonce le nombre exact de lignes
    trouvées mais n’en AFFICHE que les cinq premières. La graphie ปิด en compte
    sept, et sa ligne 75958, la seule qui porte l’emploi adjectival « fermé »,
    est la sixième : elle est invisible dans la sortie par défaut. Les sept
    lignes ont été lues en portant ce plafond à quarante dans une copie de
    travail du script, laissée hors du dépôt. **Un dossier qui aurait cité la
    sortie par défaut aurait conclu, à tort, que VOLUBILIS ne porte pas le sens
    affiché de ปิด.** Correction demandée à l’arbitrage 4.
  - **Notation des tons, citée par CLÉ et non par numéro de ligne**, relue le
    2026-08-04 par
    `node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> --feuille=Codes`,
    les cinq lignes suivant immédiatement l’intitulé `TONES` : `-x` normal,
    `¯x` high, `_x` low, `/x` rising, `\x` falling. La commande est celle que
    `u09-l9a` avait corrigée, et elle a été réexécutée ici plutôt que reprise.
  - **Feuille `Romanization`, citée par CLÉ elle aussi**, relue le même jour par
    `--feuille=Romanization`. Deux lignes servent de preuve : ออ romanisé `ø`
    avec ลอม → `løm`, contre เอาะ romanisé `o` avec เลาะ → `lo`, ce qui établit
    que le `ø` de `_øk` note la voyelle longue et fonde la longueur de ออก ; et
    la ligne `เ◌ิ (เออะ ลดรูป)`, romanisée `oē` avec เหลิง → `loēng`, dont
    l’intitulé et la romanisation se contredisent et qui n’est donc PAS employée
    comme preuve. Voir l’incertitude 2. Cette ligne se retrouve en cherchant la
    chaîne « เออะ ลดรูป » ; le ◌ y remplace un tiret demi-cadratin que les
    conventions du projet proscrivent.
  - **Portée réelle de cette source, réserve conservée depuis `u06-l6a`.** La
    colonne `ThaiPhon` est une transcription d’auteur et une partie des entrées
    porte `RID` en colonne `DOM`. VOLUBILIS reste donc qualifiée de corroboration
    partiellement indépendante, ce qui suffit au contrat d’item puisque
    Wiktionary fournit une seconde jambe de ton pour chacun des huit items. Les
    colonnes `LEV` et `DOM` ne sont citées nulle part comme preuve, décision
    prise à la suite du finding N3 de `u06-l6a`. **Ce point compte
    particulièrement ici** : plusieurs entrées du jour portent `TOURIST` en
    colonne `DOM`, ce qui aurait été commode pour appuyer une phrase du genre
    « ces mots se voient partout ». Cette étiquette est un domaine de
    classement, pas un relevé de fréquence d’affichage, et elle n’est employée
    nulle part comme telle.
- **Wiktionary** (édition en), pour le recoupement de prononciation, de ton, de
  définition et d’étymologie. Consulté en rendu (`action=render`), les modèles
  `{{th-pron}}` n’exposant pas l’IPA en wikitexte. **La ligne « Phonemic » est
  employée trois fois comme preuve de ton** : ทาง-เค่า pour ทางเข้า, ห้าม-เค่า
  pour ห้ามเข้า et ฮ่าม pour ห้าม. Dans les trois cas, la réécriture emploie une
  consonne BASSE portant un ไม้เอก, donc l’autre moitié du tableau de `u08-l8a`,
  et rend le même ton descendant : la corroboration ne dépend donc pas de la
  romanisation. Les éditions en et th sont traitées comme UN seul écosystème,
  jamais comme plusieurs sources indépendantes.
- **Unicode Standard 17.0** (Unicode Consortium), pour les faits d’encodage et de
  position des signes. Les trois fichiers ont été retéléchargés et empreintés le
  2026-08-04 depuis https://www.unicode.org/Public/17.0.0/ucd/, et les trois
  empreintes sont identiques à celles consignées par `u09-l9a` :
  `UnicodeData.txt`, SHA-256
  `2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c` ;
  `PropList.txt`, SHA-256
  `130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd` ;
  `IndicPositionalCategory.txt`, en-tête `IndicPositionalCategory-17.0.0.txt`,
  SHA-256 `68cedc29a7e57f984d90fe2c7712f2e6d0c717e253db219607daea8997d6c480`.

### Sources du fait central de la leçon, la composition

Le fait le plus lourd de la leçon est celui-ci : **trois des huit mots du jour
sont faits de deux mots qui existent séparément, écrits l’un contre l’autre.** Il
n’est pas énoncé comme une règle générale du thaï, ce que le dossier ne pourrait
pas soutenir avec les sources dont il dispose ; il est établi mot par mot.

| Composé  | Bloc 1 | Bloc 2 | Attestation du composé                                                                                           | Attestation des blocs                    |
| -------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| ทางเข้า  | ทาง    | เข้า   | RID exemple sous « เข้า ๑ » (๗) ; VOLUBILIS 100188 ; Wiktionary, étymologie explicite                            | RID vedettes « ทาง ๑ » et « เข้า ๑ »     |
| ทางออก   | ทาง    | ออก    | RID vedette, sens figuré, plus exemple sous « ออก ๓ » (๑๑) ; VOLUBILIS 100290 ; Wiktionary, étymologie explicite | RID vedettes « ทาง ๑ » et « ออก ๓ »      |
| ห้ามเข้า | ห้าม   | เข้า   | VOLUBILIS 15020 ; Wiktionary, catégorie Phrase. RID : ABSENT comme vedette                                       | RID vedettes « ห้าม » et « เข้า ๑ »      |
| ห้องน้ำ  | ห้อง   | น้ำ    | Item publié par `u05-l5c` ; RID vedette ; VOLUBILIS 16245                                                        | Items publiés par `u07-l7a` et `u02-l2c` |

Quatre composés, dont trois enseignés comme items et un réemployé. **Deux d’entre
eux ne sont pas des vedettes du RID**, ทางเข้า et ห้ามเข้า, et le dossier le dit
à chaque fois plutôt que de laisser croire à une symétrie qui n’existe pas. Pour
ทางเข้า, l’absence est compensée par une attestation interne au dictionnaire, à
l’entrée de son second bloc. Pour ห้ามเข้า, elle ne l’est pas : le RID atteste la
CONSTRUCTION, par ses dérivés ห้ามไม่ให้ et ห้ามเข้าเขตกำหนด et par sa définition
de ห้าม, mais pas le bloc de deux mots. Cet item repose donc sur deux sources et
non trois, ce qui satisfait la règle sans la dépasser.

**Le sens de la composition, de gauche à droite, est-il une règle ?** Le dossier
ne l’affirme pas. Il constate qu’il en va ainsi pour les quatre composés
ci-dessus, tous glosés par les sources d’une manière qui place le premier bloc
en tête, et la leçon dit « dans les composés du jour » plutôt que « en thaï ».
Une règle générale sur l’ordre des éléments d’un composé thaï demanderait une
grammaire de référence sur exemplaire, que le projet n’a pas acquise. Voir
l’incertitude 3.

### Ce que la leçon donne au lieu de le faire lire, et ce que cela coûte

C’est la limite la plus voyante du fichier, et elle ne lui appartient pas.
**Six syllabes sur onze portent un ton que l’apprenant ne peut pas calculer, et
elles sortent du tableau par DEUX portes différentes.**

- **Quatre syllabes MORTES**, fermées par `k` ou `t` : celle de ออก, celle de
  เปิด, celle de ปิด et la seconde de ทางออก. Le tableau des onze cases de
  `u08-l8a` ne couvre que les syllabes vivantes.
- **Deux syllabes en สระเอา** : la seconde de ทางเข้า et celle de ห้ามเข้า, qui
  sont toutes deux เข้า. `u04-l4a` page 8 met en toutes lettres les formes
  écrites avec ไ, ใ, เ-า et -ำ hors du champ de la règle, et `u07-l7a` y nomme
  เข้า, à sa Méta et à sa page des exclusions. Leur ton descendant est donc SU,
  depuis l’item publié par `u01-l1b`, et non déduit.

**Ce second cas est une correction de la consolidation du 2026-08-04, et il
faut dire d’où venait la faute.** La version `draft` comptait ces deux syllabes
comme déductibles, faisait calculer เข้า à l’apprenant à sa page 6, et écrivait
« 7 sur 11 ». C’était exactement l’erreur que le contre-audit de `u07-l7c` avait
déjà sanctionnée sur เช้า, en retirant une cellule `vivante` au motif que
l’affirmer « aurait tranché devant l’auteur ce que le parcours a explicitement
différé devant l’apprenant ». Le décompte ci-dessous est refait syllabe par
syllabe contre le périmètre réel de `u08-l8a`.

| Item      | Syllabes | Tons déductibles | Tons donnés | Motif du ton donné    |
| --------- | -------- | ---------------- | ----------- | --------------------- |
| ทาง       | 1        | 1                | 0           |                       |
| ออก       | 1        | 0                | 1           | syllabe morte         |
| ทางเข้า   | 2        | 1                | 1           | สระเอา                |
| ทางออก    | 2        | 1                | 1           | syllabe morte         |
| เปิด      | 1        | 0                | 1           | syllabe morte         |
| ปิด       | 1        | 0                | 1           | syllabe morte         |
| ห้าม      | 1        | 1                | 0           |                       |
| ห้ามเข้า  | 2        | 1                | 1           | สระเอา                |
| **total** | **11**   | **5**            | **6**       | 4 mortes, 2 en สระเอา |

Cinq sur onze. **La MAJORITÉ des syllabes d’une leçon de lecture ont un ton que
l’apprenant ne peut pas lire**, et deux items sur huit seulement, ทาง et ห้าม,
se lisent entièrement. C’est cohérent avec `u04-l4a`, `u05-l5a`, `u07-l7a`,
`u08-l8a` et `u09-l9a`, qui ont toutes exclu ces cas ; mais **`u09-l9a` a
explicitement demandé que le manque des syllabes mortes soit arbitré au niveau de
l’unité 10**, à son incertitude 6. Cette leçon ne peut pas trancher seule un
point de curriculum : elle le mesure, l’affiche à sa page 7 en nommant les deux
motifs, et le porte à l’arbitrage 1. Une unité de lecture appliquée qui doit
donner six tons sur onze n’est pas dans un état stable.

### Mots vérifiés puis écartés, et pourquoi

Le brief demandait six à huit items sur le vocabulaire de l’espace public et
demandait de ne retenir que ceux qui se double-sourcent. Plusieurs candidats ont
été vérifiés puis écartés, et le motif est écrit pour que les leçons 10C à 10E
n’aient pas à refaire le travail.

- **ระวัง, attention, prenez garde.** ÉCARTÉ, et non faute de sources : il est
  attesté trois fois, RID vedette unique à deux sens verbaux, VOLUBILIS lignes
  82106 et 82107 avec FRA « faire attention ; prendre garde » et une seconde
  ligne d’emploi exclamatif, en.wiktionary IPA /ra˦˥.waŋ˧/, Paiboon `rá-wang`.
  Le motif est de volume : la leçon était déjà à huit items, plafond du brief, et
  ระวัง n’entre dans aucun des deux systèmes que la leçon construit, ni la
  composition avec ทาง, ni la paire เปิด contre ปิด. **Il est prêt à être publié
  par une autre leçon de l’unité**, avec ses trois relevés déjà faits.
- **ชาย et หญิง, homme et femme.** ÉCARTÉS, et pour deux raisons cumulées.
  D’abord une raison de source : le brief citait les toilettes, et le bloc
  correspondant ne tient pas. `rid-lookup.mjs` rend `absent` pour ห้องน้ำชาย
  comme pour ห้องน้ำหญิง le 2026-08-04 ; VOLUBILIS porte ห้องน้ำชาย à la ligne
  16247, FRA « toilettes hommes », mais **ห้องน้ำหญิง est ABSENT de VOLUBILIS**.
  Un des deux blocs tient sur une seule source et l’autre sur aucune : la règle
  du projet les retire tous les deux, et la leçon n’enseigne donc AUCUNE forme de
  toilettes genrées et n’en affiche aucune. Ensuite une raison de lecture, propre
  à หญิง : le mot s’ouvre sur un ห qui ne se prononce pas devant ญ, or la page 5
  de `u05-l5a` énumère six lettres derrière lesquelles le ห se tait, ง, น, ม, ย,
  ว et ร, et **ญ n’est pas dans cette liste**. Le RID énonce à son entrée « ห »
  une clause plus large, `ใช้นำอักษรตํ่าเดี่ยว`, la lettre précédant une consonne
  basse ISOLÉE sans se prononcer ; **mais le projet n’a aucune source qui dise
  quelles lettres sont des อักษรต่ำเดี่ยว**, point instruit à la consolidation du
  2026-08-04 et détaillé à l’incertitude 5. Cette clause n’a de toute façon
  jamais été enseignée, et ญ n’a jamais été lue comme consonne INITIALE dans le
  parcours : `u08-l8d` ne l’a rencontrée qu’en position finale, dans ปัญหา, et en
  déclarant le mécanisme non enseigné. Publier หญิง dans une leçon de lecture
  appliquée aurait donc demandé de donner en bloc un mot de quatre lettres dont
  deux ne se lisent pas avec ce que l’apprenant sait. Voir l’incertitude 5.
- **ห้ามสูบบุหรี่, défense de fumer.** ÉCARTÉ. VOLUBILIS le porte à la ligne
  15045, mais `rid-lookup.mjs` rend `absent` pour le bloc entier comme pour
  สูบบุหรี่, et le mot บุหรี่ n’a jamais été enseigné. Le bloc aurait demandé
  deux mots nouveaux hors thème pour illustrer une construction que ห้ามเข้า
  illustre déjà avec un mot connu.
- **ห้ามจอด, défense de stationner.** ÉCARTÉ pour le même motif : VOLUBILIS ligne
  15016, RID `absent` pour le bloc, et จอด non enseigné.
- **ผลัก et ดึง, pousser et tirer.** NON RETENUS et non instruits au delà d’un
  contrôle de présence : les deux sont des vedettes du RID, mais ผลัก commence
  par un groupe de deux consonnes dont la lecture du ton relève de la page 13 de
  `u08-l8a`, et surtout le projet n’a aucune source sur ce qui est écrit sur une
  porte en Thaïlande. Les enseigner sous l’étiquette « ce qu’on lit sur les
  portes » aurait été exactement l’affirmation que le brief interdit.

### Ce que la leçon N’AFFIRME PAS sur l’affichage, et le contrôle qui le vérifie

C’est le point de vigilance central de l’unité 10. Il a été traité par un
balayage exécuté plutôt que par une déclaration d’intention, **et ce balayage a
dû être refait à la consolidation du 2026-08-04, parce que le premier était
calibré pour manquer la faute réelle.**

**Ce que le premier balayage a manqué, et pourquoi.** Il ne comptait que cinq
formules de FRÉQUENCE, `partout`, `on voit partout`, `sur tous les`,
`toujours écrit` et `en Thaïlande`. Les cinq rendaient bien zéro. Mais le fichier
affirmait quatre fois, sur des écrans d’apprenant, **où** ces mots sont écrits :
« เปิด veut dire ouvrir, et sur une porte, ouvert » et sa symétrique à la page 8,
« c’est cette ligne qui soutient la traduction affichée sur une porte » aux
sources des items 5 et 6, et « le mot que vous lirez sur une porte » à la note
culturelle. Aucune source du dossier ne porte sur un support d’affichage : les
lignes VOLUBILIS 77225 et 75958 établissent un emploi ADJECTIVAL, le sens (๓) du
RID sur ปิด établit un emploi d’ÉTAT, et rien de plus. **Un contrôle qui ne
cherche que les formules qu’on n’a pas écrites n’est pas un contrôle**, et
c’était d’autant plus grave que ce fichier écarte ผลัก et ดึง en invoquant
exactement ce motif. Les quatre phrases ont été réécrites ; les faits qu’elles
portaient, l’emploi adjectival et l’emploi d’état, restent enseignés parce
qu’eux sont sourcés.

**Le balayage refait, sur deux familles au lieu d’une.** Sections
`Enseignement`, `Items`, `Exercices`, `Dialogue` et `Note culturelle`,
c’est-à-dire les seuls écrans d’apprenant, champs `sources` des items compris
puisque c’est là que deux des quatre fautes se trouvaient. 1 033 lignes
balayées, texte recollé et espaces normalisés avant recherche, sans quoi un
retour à la ligne casse la formule et le contrôle rend zéro pour une mauvaise
raison :

```
FRÉQUENCE                          LIEU
partout          : 0               sur une porte    : 0
on voit partout  : 0               sur les portes   : 0
sur tous les     : 0               sur la porte     : 0
toujours écrit   : 0               sur un panneau   : 0
en Thaïlande     : 0               sur les panneaux : 2
souvent écrit    : 0               sur le panneau   : 0
très courant     : 0               sur une enseigne : 0
                                   affiché sur      : 0
                                   affichée sur     : 0
                                   vous lirez sur   : 0
                                   on lit sur       : 0
                                   écrit sur        : 0
                                   dans la rue      : 0
                                   devant les       : 0
```

**Les deux occurrences non nulles sont des DÉNÉGATIONS, et le balayage les rend
avec leur contexte plutôt qu’avec un nombre seul**, faute de quoi un zéro et un
deux se liraient pareil. Ce sont « Nous ne vous avons rien dit de l’endroit où
ils sont écrits, ni de leur fréquence sur les panneaux » à la page 14, et
« Elle ne dit rien non plus de la fréquence de ces mots sur les panneaux, faute
de source » à la note culturelle. Aucune des deux n’affirme quoi que ce soit.

**Le titre de la leçon, lui, contient « partout », et c’est assumé et corrigé.**
Le titre de travail donné par le brief est « Les mots qu’on voit partout ». Il
est conservé comme titre, parce que changer un titre imposé n’est pas du ressort
d’une leçon, mais **il est faux au sens strict** : aucune source du projet
n’établit qu’un mot thaï est affiché partout, souvent, ou seulement quelque part.
La page 14 le dit à l’apprenant en toutes lettres, et l’arbitrage 3 demande soit
un titre exact, soit une source de fréquence d’affichage.

Ce que la leçon affirme et soutient : le SENS de huit mots, chacun sur au moins
deux sources indépendantes. Ce qu’elle n’affirme nulle part : où ces mots sont
écrits, à quelle fréquence, sous quelle forme typographique, avec ou sans
pictogramme, en thaï seul ou avec de l’anglais. Aucune source de la politique du
projet ne couvre ce genre de fait, et aucune n’a été invoquée pour le suggérer.

### Sources et méthode du dialogue

Le dialogue n’est attesté nulle part comme bloc : il est COMPOSÉ à partir
d’ossatures publiées, et chacune est traçable dans le dépôt, relecture du
2026-08-04.

- « ขอโทษครับ » : item publié de `u08-l8d`, `khǎww·thôot khráp`.
- « [lieu] + อยู่ที่ไหน + ครับ » : ossature des items publiés
  ห้องน้ำอยู่ที่ไหนครับ (`u05-l5c`), ตลาดอยู่ที่ไหน (`u05-l5e`),
  พี่ชายอยู่ที่ไหน (`u06-l6e`) et ร้านขายยาอยู่ที่ไหนครับ (`u09-l9d`). La leçon
  y substitue ทางออก, et cette substitution est la SEULE liberté prise. **Quatre
  précédents publiés, contre un seul pour la substitution équivalente de
  `u09-l9a`** : le geste est établi dans le dépôt.
- « ห้องน้ำอยู่ที่ไหนครับ » : item publié de `u05-l5c`, repris MOT POUR MOT,
  sans aucune substitution. C’est la seule réplique du dialogue qui ne soit pas
  une composition.
- « อยู่ที่นั่น » : composé de อยู่ (`u05-l5c`, `yòuu`) et de ที่นั่น
  (`u05-l5c`, `thîi·nân`), sur le modèle de l’item publié อยู่ที่นี่
  (`u06-l6e`).
- « อยู่ที่นี่ » : item publié de `u06-l6e`, `yòuu thîi·nîi`.
- « ค่ะ » : item publié de `u01-l1e`, `khâ`.
- « ขอบคุณครับ » : item publié de `u02-l2c`, `khàwwp·khoun khráp`.
- « ไม่เป็นไร » : item publié de `u02-l2c`, `mâi·pen·rai`, déjà employé en
  réponse à un remerciement par `u05-l5e` et `u09-l9a`.
- **Ce que cela ne garantit pas** : qu’un locuteur natif enchaînerait ces sept
  répliques ainsi, ni qu’il demanderait la sortie en disant ทางออกอยู่ที่ไหนครับ
  plutôt qu’autrement. Une composition à partir de blocs corrects peut produire
  un énoncé maladroit. Le dialogue est donc marqué comme le point le plus
  incertain de la leçon pour l’audit de naturalité. Voir l’incertitude 6.

### Contrôles internes au dépôt, tous recomputables le 2026-08-04

- **La convention de comptage a été validée avant emploi.**
  `node scripts/verification/repo-thai-scan.mjs --check-u07` passe sans écart le
  2026-08-04, dix chiffres sur dix. Aucun chiffre interne n’est cité par ce
  fichier sans la commande qui le rend.
- **État du corpus au moment d’écrire.**
  `node scripts/verification/repo-thai-scan.mjs 1 9` rend 45 fichiers
  `lecon-*.md`, 429 entrées, 317 graphies distinctes, 103 portant ไม้เอก, 76
  ไม้โท, 1 ไม้ตรี et 2 ไม้จัตวา.
- **Les huit graphies du jour sont neuves au regard des unités 1 à 9.**
  `node scripts/verification/repo-thai-scan.mjs 1 9 --grep <graphie>` rend
  **0** pour ทาง, 0 pour ออก, 0 pour ทางเข้า, 0 pour ทางออก, 0 pour เปิด, 0 pour
  ปิด, 0 pour ห้าม et 0 pour ห้ามเข้า. Huit relevés, huit zéros.
- **État courant des collisions dans l’unité 10 : aucune ne touche cette leçon.**
  `node scripts/verification/repo-thai-scan.mjs 10 10` rend le 2026-08-04
  **5 fichiers, 32 entrées et 31 graphies distinctes**, et l’index de travail
  décrit à la Méta rend **une seule graphie présente dans plus d’un fichier**,
  ราคา, entre `lecon-10c.md` et `lecon-10d.md`. Le point est répété ici parce que
  c’est la section des contrôles et qu’un contrôle qui rend un résultat gênant
  doit apparaître au même endroit que ceux qui rassurent.
- **Une INFÉRENCE de la version `draft` est retirée ici, parce qu’elle était
  invalide, indépendamment des chiffres.** Elle disait : « 34 moins 31 fait 3, et
  ce sont bien trois collisions ». La différence entre le nombre d’entrées et le
  nombre de graphies distinctes compte des DOUBLONS D’ENTRÉE, pas des graphies en
  collision : une graphie publiée quatre fois pèse 3 dans cette différence et ne
  fait qu’UNE collision, et deux entrées d’un même fichier pèsent sans qu’il y ait
  de collision entre leçons. Cette différence ne peut donc ni nommer les
  collisions ni les compter. **Elle ne prouvait rien avant, elle ne prouve rien
  maintenant que l’écart vaut 1**, et c’est précisément le manque d’outil que
  l’arbitrage 9 demande de combler par un mode `--collisions`.
- **Les quatre graphies réemployées sont bien publiées, et par qui.** Le même
  script rend เข้า dans `u01-l1b`, ห้องน้ำ dans `u05-l5c` avec ses deux blocs
  ห้อง dans `u07-l7a` et น้ำ dans `u02-l2c`.
- **`item-fields-check.mjs` a été exécuté, et il ne prouve PAS ce qu’on pourrait
  croire.** La commande
  `node scripts/verification/item-fields-check.mjs content/authoring/unite-10/lecon-10b.md`
  rend le 2026-08-04 « champs codepoints en faute : 0 » et « écarts de réemploi à
  lire : 0 ». **Le premier chiffre est une vraie preuve** : les huit séquences
  `codepoints` du fichier ont été recalculées depuis les champs `thai` et
  comparées. **Le second est VIDE de sens ici, et le dire est le point de cette
  note.** Le contrôle de réemploi du script ne se déclenche que sur un item dont
  le TITRE porte une référence de la forme `uXX-lYz`. Aucun titre de ce fichier
  n’en porte, et pour une raison de fond : เข้า n’est pas un item réemployé de
  cette leçon, c’est un BLOC à l’intérieur de deux de ses items, ทางเข้า et
  ห้ามเข้า. Le script compare des items entiers, il ne sait pas comparer une
  syllabe d’un composé au mot publié dont elle vient. Zéro écart signifie donc
  ici « rien n’a été comparé », et non « tout concorde ». La concordance des
  champs de เข้า a été établie à la main, en relisant l’item de `u01-l1b`, et
  elle est écrite en toutes lettres à l’item 3. **Écrire « contrôlé par le
  script » aurait été exactement le défaut que les findings `BALAYAGE-INVENTE` et
  `COORD-42-3` de `u09-l9a` ont sanctionné.** Manque d’outil porté à
  l’arbitrage 7.
- **Le graphème vocalique réduit เ◌ิ◌ n’est pas neuf, et il n’a pas de longueur
  fixe.** Balayage des sections `## Items` des unités 1 à 9 le 2026-08-04 : deux
  graphies publiées le portent, เงิน (`u08-l8a`), transcrite `ngoen`, donc
  BRÈVE, et เกินไป (`u08-l8c`), transcrite `koeen·pai`, donc LONGUE. Le dépôt
  porte donc lui-même les deux valeurs, ce qui corrobore la réserve de
  l’incertitude 2 au lieu de la contredire.
- **Toutes les transcriptions citées à l’écran viennent du dépôt, pas d’une
  reconstruction.** Relues le 2026-08-04 : เข้า `khâo` (`u01-l1b`), ปา `paa` et
  ป่า `pàa` (`u01-l1c`), ม้า `máa` (`u01-l1d`), ครับ `khráp` et ค่ะ `khâ`
  (`u01-l1e`), น้ำ `náam`, ขอโทษ `khǎww·thôot`, ขอบคุณครับ `khàwwp·khoun khráp`
  et ไม่เป็นไร `mâi·pen·rai` (`u02-l2c`), อยู่ `yòuu`, ที่ไหน `thîi·nǎi`,
  ที่นั่น `thîi·nân`, ที่นี่ `thîi·nîi` et ห้องน้ำอยู่ที่ไหนครับ
  `hâwng·náam yòuu thîi·nǎi khráp` (`u05-l5c`), ห้องน้ำ `hâwng·náam` et ห้อง
  `hâwng` (`u05-l5c` et `u07-l7a`), อยู่ที่นี่ `yòuu thîi·nîi` (`u06-l6e`),
  เธอ `thoee` (`u06-l6a`), เงิน `ngoen` (`u08-l8a`), เกินไป `koeen·pai`
  (`u08-l8c`), ขอโทษครับ `khǎww·thôot khráp` (`u08-l8d`).

### Vérification Unicode

Séquences NFC recalculées le 2026-08-04 et vérifiées comme STABLES, la forme NFC
étant identique à la chaîne source pour les huit graphies d’items comme pour les
sept graphies réemployées ou citées.

| Item     | Séquence NFC                                            |
| -------- | ------------------------------------------------------- |
| ทาง      | U+0E17 U+0E32 U+0E07                                    |
| ออก      | U+0E2D U+0E2D U+0E01                                    |
| ทางเข้า  | U+0E17 U+0E32 U+0E07 U+0E40 U+0E02 U+0E49 U+0E32        |
| ทางออก   | U+0E17 U+0E32 U+0E07 U+0E2D U+0E2D U+0E01               |
| เปิด     | U+0E40 U+0E1B U+0E34 U+0E14                             |
| ปิด      | U+0E1B U+0E34 U+0E14                                    |
| ห้าม     | U+0E2B U+0E49 U+0E32 U+0E21                             |
| ห้ามเข้า | U+0E2B U+0E49 U+0E32 U+0E21 U+0E40 U+0E02 U+0E49 U+0E32 |

Graphies réemployées et spécimens, mêmes date et méthode : เข้า U+0E40 U+0E02
U+0E49 U+0E32 ; ห้องน้ำ U+0E2B U+0E49 U+0E2D U+0E07 U+0E19 U+0E49 U+0E33 ; ห้อง
U+0E2B U+0E49 U+0E2D U+0E07 ; น้ำ U+0E19 U+0E49 U+0E33 ; ม้า U+0E21 U+0E49
U+0E32 ; ม้าลาย U+0E21 U+0E49 U+0E32 U+0E25 U+0E32 U+0E22 ; ทางม้าลาย U+0E17
U+0E32 U+0E07 U+0E21 U+0E49 U+0E32 U+0E25 U+0E32 U+0E22.

Points de rendu à contrôler à l’intégration, tous relevés depuis les fichiers
empreintés plus haut :

- **Le fait de la page 8 est vérifiable mécaniquement, et il a été vérifié.**
  Retirer le premier code de เปิด, U+0E40, rend une chaîne dont la comparaison
  stricte avec ปิด est vraie. Le contrôle a été exécuté le 2026-08-04, il n’est
  pas déduit à l’œil. Le composant qui affiche les deux mots côte à côte doit
  donc les aligner sur leur consonne initiale et non sur leur bord gauche, faute
  de quoi l’argument visuel de la page se perd ;
- U+0E40 (`SARA E`) s’écrit AVANT la consonne qu’il accompagne, et **deux
  propriétés distinctes le disent, toutes deux relues le 2026-08-04** :
  `PropList.txt` porte à sa ligne 1461 `0E40..0E44 ; Logical_Order_Exception` et
  `IndicPositionalCategory.txt` porte à sa ligne 384
  `0E40..0E44 ; Visual_Order_Left`. Les deux couvrent exactement เ, แ, โ, ใ et ไ.
  **Aucune passe de remplacement ne doit être lancée sur l’un de ces deux noms** :
  `u09-l9a` a montré au contre-audit du 2026-08-04 que la « correction » proposée
  reposait sur une preuve cherchée dans le mauvais fichier. Trois items sur huit
  commencent par une voyelle écrite avant sa consonne, ทางเข้า, เปิด et ห้ามเข้า,
  et les composants qui mettent la consonne initiale en évidence doivent le
  gérer ;
- U+0E49 (`MAI THO`) est de catégorie positionnelle `Top` et de classe
  combinatoire **107**, valeur relevée dans `UnicodeData.txt` :
  `0E49;THAI CHARACTER MAI THO;Mn;107;NSM`. ห้ามเข้า empile DEUX ไม้โท, sur ห
  puis sur ข, ce qui en fait la graphie la plus chargée du jour : sa hauteur de
  ligne doit être vérifiée à 390 px sans écrêtage du signe ;
- U+0E34 (`SARA I`) est `Top` et de classe combinatoire **0**, valeur relevée
  dans le même fichier : `0E34;THAI CHARACTER SARA I;Mn;0;NSM`. Aucun mot du jour
  n’empile un ◌ิ et une marque de ton sur la même lettre, profondeur d’un seul
  signe partout ;
- ห้ามเข้า compte huit codes et ทางเข้า sept : ce sont les deux graphies les plus
  longues du jour, toutes deux très en dessous des neuf codes de โรงพยาบาล
  (`u09-l9a`). Aucune contrainte de césure particulière n’est donc introduite ;
- aucun caractère de la zone à usage privé ne figure dans ce fichier.

### Incertitudes signalées par l’auteur

1. **La fréquence d’affichage n’est établie pour aucun des huit mots, et le
   titre de la leçon la sous-entend.** C’est l’incertitude principale du fichier
   et elle est structurelle : la politique de sources du projet couvre
   l’orthographe, le sens, la prononciation, le ton, la longueur, le registre et
   la fréquence LEXICALE, mais rien qui établisse ce qui est écrit dans l’espace
   public d’un pays. Aucune source consultée ne permet d’écrire qu’un de ces
   mots « se voit partout ». La leçon n’écrit donc nulle part cette phrase, la
   page 14 dit à l’apprenant qu’elle ne le sait pas, et le titre imposé reste
   inexact. Piste de résolution : un corpus photographique sous licence
   vérifiable, ou un relevé de fréquence sur un corpus écrit qui distingue les
   genres de texte, ce que le TNC pourrait donner si son interface répond. Voir
   l’arbitrage 3.
2. **La longueur du noyau de เปิด tient sur deux sources qui concordent, mais la
   source qui devrait trancher se contredit.** VOLUBILIS ligne 77221 romanise
   `poēt` avec macron, donc long, et l’IPA de Wiktionary donne /ɤː/, long : deux
   jambes concordantes, et le champ est renseigné « longue ». Mais la feuille
   `Romanization` de la même base intitule le graphème `เ◌ิ (เออะ ลดรูป)`, le ◌
   remplaçant ici un tiret demi-cadratin proscrit par les conventions,
   c’est-à-dire forme réduite de la voyelle BRÈVE, tout en le romanisant `oē`,
   long. **Le dépôt porte d’ailleurs les deux valeurs**, เงิน bref et เกินไป
   long, ce qui montre que le graphème lui-même ne dit pas sa longueur. Le champ
   de เปิด n’est donc pas en cause ; ce qui manque est une règle enseignable, et
   la leçon donne la longueur mot par mot faute de pouvoir en donner une.
3. **L’ordre de composition n’est pas énoncé comme une règle, et la leçon en
   souffre.** Elle dit « dans les composés du jour, le second bloc précise le
   premier », ce que quatre composés sourcés soutiennent, et pas « en thaï ». Un
   apprenant qui rencontrera un composé hors leçon n’aura donc pas de règle à
   appliquer. Piste de résolution : une grammaire de référence sur exemplaire,
   dépense déjà identifiée par la politique de sources et non engagée.
4. **Limite des exercices 1 et 4 : quatre tirages de l’exercice 1 emploient du
   vocabulaire déjà publié**, เข้า, ห้องน้ำ, ห้อง et น้ำ, que l’apprenant peut
   reconnaître de mémoire plutôt que lire. C’est délibéré, la page 12 en fait un
   argument pédagogique, mais cela affaiblit la mesure : le seuil de 10 sur 12
   reste atteignable en lisant réellement les huit autres, ce qui limite l’effet
   sans l’annuler. Même limite que celle consignée par `u09-l9a` à son
   incertitude 5, et elle vaut pour tout exercice de lecture qui emploie du
   vocabulaire connu.
5. **ญ n’a jamais été lue comme consonne initiale, et le parcours ne peut même
   pas dire proprement pourquoi.** Découvert en instruisant หญิง, écarté pour
   cette raison parmi d’autres. **Cette incertitude a été rouverte et RÉÉCRITE à
   la consolidation du 2026-08-04, parce que son raisonnement était fautif.**
   - Ce que la version `draft` écrivait : le RID, à son entrée « ห », énonce une
     clause plus large que la liste de `u05-l5a`, et « ญ tombe sous cette clause,
     l’entrée `อักษรต่ำ` du même dictionnaire la rangeant parmi les vingt-quatre
     consonnes basses ».
   - **Ce que les relevés disent réellement**, tous refaits le 2026-08-04 par
     `node scripts/verification/rid-entry.mjs`. L’entrée « ห » porte
     `ใช้นำอักษรตํ่าเดี่ยวให้ผันอย่างอักษรสูงและตัว ห ไม่ออกเสียง`, avec หงอย et
     หนา pour exemples : la clause porte sur les อักษรต่ำ**เดี่ยว**, les basses
     ISOLÉES, et non sur les basses en général. L’entrée « อักษรต่ำ » liste bien
     vingt-quatre lettres dont ญ, mais **appartenir aux vingt-quatre ne suffit pas
     à être une basse isolée** : ค, ท et พ en font partie sans l’être. L’entrée
     « ญ » dit qu’elle est une อักษรต่ำ et qu’elle sert de พยัญชนะต้น ; elle ne
     dit pas qu’elle est isolée.
   - **Et la source qui trancherait n’existe pas dans le dictionnaire.**
     `อักษรต่ำเดี่ยว` et `อักษรเดี่ยว` ont été interrogées toutes les deux le
     2026-08-04 : le RID ne porte **aucune des deux** comme vedette, il propose
     seulement d’ajouter le mot. L’entrée « เดี่ยว », interrogée elle aussi, n’a
     aucun sens orthographique.
   - **Conclusion, et c’est un retrait, pas une reformulation.** Le fichier
     n’affirme plus que ญ tombe sous la clause du RID : aucune source de la
     politique du projet ne l’établit, et l’écrire aurait été fabriquer une
     attestation. Ce qui reste vrai et suffit à motiver l’écartement de หญิง :
     ญ n’est pas dans la liste des six lettres de `u05-l5a`, et le parcours n’a
     jamais lu ญ en position initiale. **La dette est donc PLUS grande que ce que
     la version `draft` décrivait** : le parcours enseigne une liste, la source
     énonce une classe, et le projet ne dispose d’aucune source qui donne
     l’extension de cette classe. Il en faudrait une avant d’écrire le premier
     mot en หญ, หล ou หน hors liste. Signalé pour l’unité 10, non tranché.
6. **Naturalité du dialogue.** Composé à partir de huit ossatures publiées,
   jamais attesté comme bloc. La substitution de ทางออก dans
   « [lieu] + อยู่ที่ไหน » s’appuie sur quatre précédents publiés, ce qui en fait
   la substitution la mieux établie du parcours à ce jour, mais elle reste une
   composition. Rien ne garantit qu’un locuteur natif demande la sortie de cette
   façon.
7. **Aucun audio n’est produit.** L’exercice 2 en dépend intégralement, et les
   pages 8 et 13 s’appuient sur l’écoute. Trois contraintes à consigner avant
   enregistrement. Premièrement, les douze tirages de l’exercice 2 doivent être
   produits par la MÊME voix, faute de quoi la variation entre locuteurs
   fournirait un indice parasite. Deuxièmement, เปิด et ปิด doivent être
   enregistrés dans la même session et vérifiés comme différant par le seul
   noyau vocalique, sans écart de débit ni d’intensité qui donnerait un second
   indice : l’exercice mesure une voyelle, pas une durée d’enregistrement.
   Troisièmement, les fermetures `k` et `t` de ออก, เปิด et ปิด doivent être
   produites sans détente audible, contrôle déjà exigé par `u05-l5a` et
   `u09-l9a`.
8. **L’attestation de ห้ามเข้า est la plus faible des huit items.** Deux sources,
   VOLUBILIS et Wiktionary, et une absence de vedette au RID. C’est conforme à la
   règle du projet, deux sources indépendantes, mais c’est le minimum et non le
   confort des sept autres. Si une seule des deux se révélait dérivée de l’autre,
   l’item tomberait. Piste de résolution : chercher le bloc dans un corpus écrit
   plutôt que dans un dictionnaire, ce qu’aucune source actuelle du projet ne
   permet de faire proprement.

**Sept incertitudes sont OUVERTES, la 1 à la 6 et la 8 ; la 7 est une contrainte
de production et non une incertitude**, ce qui fait huit entrées pour sept
ouvertes. Le décompte est corrigé le 2026-08-04, la version `draft` annonçant
huit ouvertes puis en listant sept. Deux touchent la matière enseignée, la 2 et
la 8, et la leçon les traite en donnant la valeur au lieu d’une règle pour la
première, et en déclarant la faiblesse pour la seconde. La 1 est la limite propre
au sujet de l’unité et elle est traitée à l’écran. Les 3 et 5 demandent un
arbitrage de parcours plutôt qu’une source, et **la 5 a été REÉCRITE à la
consolidation, son raisonnement étant fautif**. Les 4 et 6 sont des limites de
méthode consignées.

### État des audits

| Dimension               | État                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe             | vérifiée ; 6 items sur 8 attestés comme vedettes du RID le 2026-08-04, les 2 autres, ทางเข้า et ห้ามเข้า, déclarés non lexicalisés et sourcés ailleurs                                                                                                                                                                                |
| Sens                    | vérifié pour les 8 traductions, sur au moins deux sources indépendantes chacune ; les emplois non enseignés sont listés item par item et écartés explicitement                                                                                                                                                                        |
| Prononciation, ton      | vérifié, 8 items sur 8 sur deux sources indépendantes du RID ; 3 corroborations supplémentaires par la ligne Phonemic de Wiktionary                                                                                                                                                                                                   |
| Tons déductibles        | **5 syllabes sur 11** ; les 6 autres sont DONNÉES, 4 syllabes mortes et 2 en สระเอา, deux familles hors programme, décompte au tableau du dossier ; corrigé le 2026-08-04, la valeur `draft` de 7 sur 11 était fausse                                                                                                                 |
| Longueur                | vérifiée pour 8 items sur 8 ; réserve de méthode déclarée sur le graphème เ◌ิ◌, voir l’incertitude 2                                                                                                                                                                                                                                  |
| Registre                | neutre et sourcé pour les 8 ; aucun item ne porte d’étiquette de registre au RID ni chez VOLUBILIS                                                                                                                                                                                                                                    |
| Composition             | vérifiée mot par mot, 4 composés au tableau, 2 non lexicalisés déclarés ; AUCUNE règle générale affirmée, voir l’incertitude 3                                                                                                                                                                                                        |
| Naturalité              | NON VÉRIFIÉE pour le dialogue, voir l’incertitude 6                                                                                                                                                                                                                                                                                   |
| Unicode                 | vérifié, séquences NFC stables, classes combinatoires relevées, aucune zone à usage privé ; l’écart d’un code entre เปิด et ปิด a été calculé, pas supposé                                                                                                                                                                            |
| Décomptes internes      | produits par `repo-thai-scan.mjs`, convention revalidée par `--check-u07` le 2026-08-04 ; `item-fields-check.mjs` exécuté, 0 faute de codepoints, mais son contrôle de réemploi ne s’applique PAS ici et le dossier le dit                                                                                                            |
| Planchers d’exercice    | RECALCULÉS le 2026-08-04 pour les cinq exercices, départage des égalités toujours favorable au tricheur ; l’exercice 1 passe de 1 et 3 sur 12 à 3 et 4 sur 12, l’exercice 4 garde son 1 sur 72 mais change de justification ; tous restent sous leur seuil                                                                            |
| Phonétique française    | SANS OBJET, aucune assertion sur le français ; aucun son nouveau n’est introduit                                                                                                                                                                                                                                                      |
| Véracité de l’affichage | balayage REFAIT et ÉLARGI le 2026-08-04, 7 formules de fréquence et 14 de lieu sur 1 033 lignes d’écran ; 0 affirmation, 2 occurrences qui sont des dénégations et sont citées avec leur contexte ; 4 phrases « sur une porte » retirées, le premier balayage ne les cherchait pas ; le TITRE reste inexact et l’arbitrage 3 le porte |
| Licence                 | vérifiée, aucun texte de définition recopié, aucune formulation reprise, aucune définition restituée sur un écran d’apprenant                                                                                                                                                                                                         |
| Coordination d’unité    | relevé refait une TROISIÈME fois le 2026-08-04 : 5 fichiers, 32 entrées, 31 graphies ; **aucune collision ne touche cette leçon**, `lecon-10e.md` ayant exécuté l’attribution de lui-même ; seule ราคา, entre 10C et 10D, reste, hors de ce fichier                                                                                   |
| Décompte RID            | REFAIT le 2026-08-04 : 37 graphies interrogées, 28 attestées, 9 absentes, en huit listes qui se somment ; le décompte `draft` de 26 omettait 11 graphies dont le fichier rapportait lui-même le résultat                                                                                                                              |
| Contre-audit interne    | **PASSÉ le 2026-08-04**, auditeur adversarial indépendant ; 7 findings bloquants et 5 non bloquants, tous traités, une piste d’audit REFUSÉE et remplacée ; voir la section suivante                                                                                                                                                  |
| Contre-audit externe    | **NON LANCÉ.** Lot à préparer                                                                                                                                                                                                                                                                                                         |
| Revue native            | EN ATTENTE                                                                                                                                                                                                                                                                                                                            |

### Contre-audit interne du 2026-08-04, et ce que la consolidation en a fait

Auditeur adversarial indépendant, consigne « trouver des erreurs, pas
confirmer », rapport dans `verification-10b.md`. **Sept findings bloquants et
cinq non bloquants**, aucun ne portant sur la matière linguistique : l’auditeur a
reproduit à l’identique les 16 relevés RID, les 14 relevés VOLUBILIS et les 10
faits Unicode, et n’a trouvé faux ni un ton, ni une longueur, ni une IPA, ni une
transcription, ni un corrigé d’exercice. Les findings portaient sur ce que la
leçon PRÉTENDAIT que l’apprenant pouvait déduire, sur des chiffres présentés
comme mesurés qui ne l’étaient pas, et sur une affirmation d’affichage que le
fichier s’interdisait ailleurs.

Une ligne par finding, avec ce qui a été fait et ce qui a été refusé.

| Finding                                    | Verdict de la consolidation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SYLLABE-EA-DEDUITE`, bloquant             | **FONDÉ, corrigé partout.** เข้า était présenté comme syllabe vivante dont le ton se déduit, alors que `u04-l4a` page 8 met la forme เ-า hors du champ de la règle et que `u07-l7a` nomme เข้า deux fois parmi les exclusions, ce que j’ai relu dans les deux fichiers. Corrigé à la page 6, à la page 7, à la page 11, aux notes des items 3 et 8, au tableau des tons du dossier, à la ligne d’audit, au SRS et à l’arbitrage 1. Le décompte passe de 7 à **5 déductibles sur 11**, et le coût de l’arbitrage 1 de 4 à **6 syllabes données sur 11**.                                                                                                                                                                           |
| `AFFICHAGE-PORTE-NON-SOURCE`, bloquant     | **FONDÉ, retiré.** Le fichier affirmait quatre fois, sur des écrans d’apprenant, où ces mots sont écrits, sans source, dans le fichier même qui déclare ne jamais le faire et qui écarte ผลัก et ดึง pour ce motif. Les quatre phrases sont réécrites sur ce que les sources établissent réellement, l’emploi adjectival et l’emploi d’état. Le balayage est passé de 5 formules de fréquence à 7 de fréquence et 14 de LIEU, et il rend désormais le contexte de chaque occurrence au lieu d’un nombre seul.                                                                                                                                                                                                                     |
| `COLLISION-NON-REPRODUCTIBLE`, bloquant    | **FONDÉ sur les deux points, et la cause est établie.** J’obtiens 32 entrées et 31 graphies, pas 34 et 31, et une seule graphie dans plus d’un fichier, ราคา entre 10C et 10D. Cause vérifiée dans le texte de `lecon-10e.md` : elle a exécuté l’attribution d’elle-même, ne publie plus aucun item et a RETIRÉ sa carte `srs-u10-l10e-03`. Le relevé `draft` était donc vrai quand il a été fait. Méta, contrôles, carte `srs-u10-l10b-02` et arbitrage 8 réécrits. L’inférence « 34 moins 31 fait 3 » est retirée comme invalide en soi, et pas seulement dépassée.                                                                                                                                                             |
| `PLANCHER-EX1-FAUX`, bloquant              | **FONDÉ, et l’audit sous-estimait encore.** Recalcul fait par moi sur les douze jeux d’options : la stratégie « la plus longue » plafonne à 3 sur 12 et non 1, et il y a ÉGALITÉ à 18 signes entre « le chemin, la voie » et « il est interdit de ». **Deux erreurs de plus, non vues par l’audit** : la stratégie « la plus courte » plafonne à 4 sur 12 et non 3, deux tirages se jouant sur une égalité entre « entrer » et « sortir » ; et le comptage en MOTS ne donne pas le même résultat que celui en signes, il donne 4 sur 12. Les quatre planchers sont réécrits avec un départage toujours favorable au tricheur. L’exercice n’est pas cassé, le seuil étant de 10 sur 12.                                            |
| `COMPOSES-SIX-FAUX`, bloquant              | **FONDÉ, corrigé.** Quatre composés parmi les douze tirages, pas six, aux tirages 2, 3, 9 et 10, comme le reste de l’exercice le disait déjà deux fois. La propriété de conception a été revérifiée tirage par tirage et elle tient pour les quatre ; les quatre sont désormais nommés au lieu de deux.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `ITEM8-SEUL-FAUX`, bloquant                | **FONDÉ, résolu avec le premier finding.** Après correction, ni ทางเข้า ni ห้ามเข้า n’ont leurs deux tons déductibles : les deux notes disent maintenant qu’un seul ton se calcule et que l’autre est celui de l’item publié par `u01-l1b`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `HO-MUET-DIVERGENT`, bloquant              | **FONDÉ, réaligné mot pour mot.** La note de l’item 7 énonçait la règle du ห muet autrement que `u05-l5a`, en sur-généralisant à toutes les basses et en laissant tomber la condition de signe que `u05-l5a` avait dû ajouter à ses findings B3 et B5. La formulation publiée est désormais reprise telle quelle, relue dans `u05-l5a` pages 5 et 12. **Une précision de l’audit a été corrigée au passage** : dans ห้าม, ce ne sont pas une mais DEUX conditions qui manquent, le ห portant un signe et la lettre qui le suit immédiatement étant la voyelle et non le ม. C’est le motif exact que `u05-l5a` donne pour ห้า et หิว.                                                                                              |
| `DECOMPTE-RID-INCOMPLET`, non bloquant     | **FONDÉ, refait.** Le décompte passe de 26, 22 et 4 à **37 interrogées, 28 attestées et 9 absentes**, en huit listes qui se somment au total. Onze graphies manquaient : cinq à la section des mots écartés, une à l’incertitude 5, et cinq requêtes ajoutées par la consolidation.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `PAGE6-HUIT-MOTS`, non bloquant            | **FONDÉ, réécrit avec le premier finding.** La page 6 ne liste plus que ทาง et ห้าม, les deux seuls des huit items entièrement calculables, et renvoie explicitement les trois composés à leur première syllabe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `HONG-ATTRIBUTION`, non bloquant           | **FONDÉ, attribution unifiée sur `u07-l7a`.** Quatre endroits disaient 7B, tout le reste 7A. `repo-thai-scan.mjs --grep ห้อง` sur les unités 1 à 9 rend bien `u07-l7a` comme premier publiant, et mon index rend la graphie dans `lecon-7a.md` ET `lecon-7b.md`, avec des champs `longueur` et `fr` divergents. **C’est une dette de l’unité 7 que ce fichier ne corrige pas** : elle est portée à l’arbitrage 10, nouveau.                                                                                                                                                                                                                                                                                                       |
| `AKSORN-TAM-MAL-CITE`, non bloquant        | **FONDÉ sur le constat, mais la piste de correction est REFUSÉE, et c’est le seul refus de cette consolidation.** L’audit demandait de citer l’entrée `อักษรต่ำเดี่ยว` du RID à la place de `อักษรต่ำ`. **Cette entrée n’existe pas** : interrogée le 2026-08-04, comme `อักษรเดี่ยว`, le RID ne porte ni l’une ni l’autre et propose seulement d’ajouter le mot. Citer une entrée inexistante aurait été fabriquer une attestation. Le fait n’a donc pas été re-sourcé, il a été **SUPPRIMÉ** : le fichier n’affirme plus que ญ tombe sous la clause du RID. L’incertitude 5 est réécrite en entier et la dette y est déclarée plus grande, le projet n’ayant aucune source qui donne l’extension de la classe `อักษรต่ำเดี่ยว`. |
| `PIEGE-KHAOTHANG-NON-SOURCE`, non bloquant | **FONDÉ, sourcé mieux que ce que l’audit proposait.** L’audit suggérait de rattacher เข้าทาง à la liste des ลูกคำ de « เข้า ๑ ». Vérification faite, `เข้าทาง` est en outre une **vedette autonome** du RID, relevée le 2026-08-04, avec เข้า ๑ pour แม่คำ et un sens verbal sans rapport avec l’espace. Le piège cite désormais la vedette, ce qui établit le « tout autre sens » et pas seulement l’existence de la forme.                                                                                                                                                                                                                                                                                                      |

**Trois défauts trouvés par la consolidation elle-même, hors findings d’audit**,
consignés parce qu’ils sont de la même famille que ceux que l’audit a relevés,
un compte qui ne correspond pas à sa propre liste :

1. La note de l’item 1 déclarait ทาง « le seul mot du jour dont tout se lit sans
   aide » et son ton « le seul ton du jour que vous devez pouvoir prédire ».
   **C’était déjà faux dans la version `draft`**, dont la page 6 annonçait quatre
   mots calculables, et cela le reste après correction, ห้าม se lisant lui aussi
   entièrement. Corrigé en « l’un des deux ».
2. La stratégie « prendre la plus courte » de l’exercice 1 était annoncée à
   3 sur 12 « aux seuls tirages 5, 7 et 12 ». Recalcul fait : deux tirages sûrs,
   les 7 et 12, et deux qui dépendent d’une égalité, les 4 et 5. Plafond réel
   4 sur 12. Le contre-audit n’avait relevé que la stratégie voisine.
3. Le paragraphe de synthèse des incertitudes annonçait « Huit incertitudes sont
   OUVERTES » puis en listait sept. Corrigé en sept, la huitième étant la
   contrainte de production d’audio.

### Ce que le contre-audit externe doit attaquer en priorité

Rien ici ne doit être lu comme validé par une source indépendante du projet. Les
points à attaquer d’abord, dans cet ordre. **Les points que le contre-audit
interne a déjà traités n’y figurent plus.**

1. l’attestation de ห้ามเข้า, la plus faible du fichier : VOLUBILIS et
   Wiktionary sont-elles réellement indépendantes sur ce bloc, ou l’une dérive-t-
   elle de l’autre ?
2. le tableau des quatre composés, ligne par ligne, à recomputer par
   `rid-entry.mjs` et `volubilis-lookup.mjs` ;
3. la lecture du sens (๗) de « เข้า ๑ » et du sens (๑๑) de « ออก ๓ », qui portent
   à eux seuls l’attestation RID de ทางเข้า et du sens concret de ทางออก ;
4. le plancher de l’exercice 4, où l’hypothèse de regroupement retenue pourrait
   encore être trop favorable, et ceux des exercices 2, 3 et 5, que le
   contre-audit interne a confirmés sans les refaire tous ;
5. la longueur de เปิด, et la contradiction de la feuille `Romanization` ;
6. la naturalité du dialogue, et en particulier ทางออกอยู่ที่ไหนครับ ;
7. **l’incertitude 5 dans sa forme réécrite** : existe-t-il, dans une source que
   la politique du projet autorise, une définition de la classe
   `อักษรต่ำเดี่ยว` avec son extension ? Tant qu’on n’en a pas, `u05-l5a`
   enseigne une liste que rien ne permet de compléter ;
8. le décompte RID refait, 37, 28 et 9, à recompter depuis les huit listes ;
9. le relevé de collision de l’unité 10, à refaire indépendamment : l’outil du
   dépôt ne sait toujours pas le produire, et le zéro annoncé repose sur un
   script hors dépôt.

### Arbitrages à porter hors de cette leçon

Une leçon ne modifie ni `content/authoring/CONVENTIONS.md`, ni
`docs/content-policy/sources-verification.md`, ni les scripts du dépôt, ni les
cartes SRS d’une autre leçon. Ces points sont donc SIGNALÉS et attendent un
arbitrage au niveau du dépôt.

1. **DEUX familles de syllabes échappent au tableau des tons, pas une, et
   l’unité 10 est celle où le manque devient bloquant.** `u09-l9a` avait porté
   les syllabes mortes à son incertitude 6 en demandant explicitement un
   arbitrage « au niveau de l’unité 10 ». Le contre-audit du 2026-08-04 a montré
   qu’il en manquait une seconde, la forme สระเอา, mise de côté par `u04-l4a`
   page 8 et nommée par `u07-l7a`. **Le coût rechiffré est plus lourd que ce que
   la version `draft` annonçait : 6 syllabes sur 11 ont un ton donné et non lu**,
   4 mortes et 2 en สระเอา, contre 4 sur 11 annoncées. C’est la MAJORITÉ des
   syllabes, et seuls deux des huit items, ทาง et ห้าม, se lisent entièrement.
   Une unité de lecture appliquée dans cet état enseigne un geste incomplet.
   **Arbitrage demandé, et il porte maintenant sur les deux familles** : soit
   ouvrir la règle des syllabes mortes ET la lecture de la forme สระเอา dans une
   leçon de l’unité 10 en amont de celle-ci, soit acter qu’elles sont renvoyées
   après l’unité 10 et assumer que le fil « lecture appliquée » démarre avec plus
   de la moitié de sa matière tonale donnée. Ce fichier ne peut pas trancher et
   n’a pas tranché. **Il a en revanche cessé de faire semblant** : la page 6 ne
   demande plus à l’apprenant un calcul que le parcours lui a interdit de tenter.
2. **Le fil des tons demande un entretien, et le parcours répond par une carte de
   plus à chaque leçon.** `u08-l8a` puis `u09-l9a` ont signalé ce recouvrement
   sans qu’il soit tranché. 10B a choisi, comme 9A, de ne PAS créer de carte de
   ton et d’apporter ses tirages à `srs-u07-l7a-03` ; mais une leçon ne peut pas
   modifier la carte d’une autre, et cet apport reste une demande écrite tant que
   personne ne l’exécute. **Arbitrage demandé** : trancher enfin, dans un sens ou
   dans l’autre, et cesser de le signaler à chaque leçon.
3. **Le titre imposé de cette leçon affirme un fait que le projet ne peut pas
   sourcer.** « Les mots qu’on voit partout » sous-entend une fréquence
   d’affichage, catégorie de fait qu’aucune source de
   `docs/content-policy/sources-verification.md` ne couvre. La leçon a conservé le
   titre, corrigé l’affirmation à l’écran et compté à zéro les formules
   fautives ; mais un titre qui dit le contraire de ce que la page 14 explique est
   une incohérence de produit. **Arbitrage demandé** : soit renommer la leçon,
   par exemple « Les mots de la ville », soit ajouter à la politique de sources
   une catégorie « affichage public » avec ses conditions de recevabilité, ce
   qui bénéficierait à toute l’unité 10.
4. **Le script `volubilis-lookup.mjs` tronque sa sortie sans le dire assez.** Il
   annonce le nombre exact de lignes trouvées, puis n’en affiche que cinq. La
   graphie ปิด en compte sept, et la seule ligne qui porte l’emploi adjectival
   « fermé » est la sixième. Un dossier qui aurait cité la sortie par défaut
   aurait conclu à tort que la base ne porte pas le sens enseigné. **Arbitrage
   demandé** : ajouter au script une option `--tout` ou porter le plafond à une
   valeur qui ne coupe aucune graphie courante, et faire imprimer un
   avertissement explicite quand des lignes sont masquées.
5. **Aucun outil du dépôt ne compare une graphie candidate à l’ensemble des
   graphies publiées avant qu’une leçon ne la publie.** Cette leçon a fait le
   contrôle à la main, huit appels à `repo-thai-scan.mjs --grep`, ce qui est
   praticable pour huit graphies et ne le sera pas pour une unité entière. C’est
   le même besoin que l’arbitrage 3 de `u09-l9a`, sous un autre angle.
   **Arbitrage demandé** : ajouter un mode qui prenne un fichier de leçon en
   entrée et signale toute graphie déjà publiée ailleurs, avec le fichier
   publiant.
6. **L’unité 10 n’a ni plan ni ordre écrit, et ses cinq leçons ont été rédigées
   en parallèle sans se voir.** Ce fichier a commencé alors que le répertoire de
   l’unité était vide et l’a terminé alors qu’il contenait cinq fichiers. Il n’a
   donc rien pu supposer de 10A et a choisi de ne rien supposer du tout : il ne
   cite aucune leçon de l’unité 10 comme prérequis. C’est prudent mais coûteux, et
   c’est exactement le défaut que `u09-l9a` a documenté pour son unité, où cinq
   leçons ont été écrites sans se voir et où le contre-audit a dû instruire cinq
   collisions après coup. **Ici, une collision subsiste, ราคา entre 10C et 10D,
   et une seconde a été résolue par 10E elle-même en cours de session, ce qui a
   fait changer les chiffres de coordination de ce fichier deux fois en une
   journée.** Le coût du défaut de méthode n’est donc pas seulement le doublon,
   c’est aussi que les décomptes d’une leçon vieillissent pendant qu’on les
   écrit. **Arbitrage demandé** : écrire le plan d’une unité AVANT d’en lancer
   les leçons, et pour l’unité 10, trancher rétroactivement l’ordre pédagogique
   et l’attribution des graphies. C’est le deuxième signalement consécutif du
   même défaut de méthode.
7. **`item-fields-check.mjs` ne sait pas contrôler un bloc réemployé à
   l’intérieur d’un composé.** Son contrôle de fidélité ne se déclenche que sur
   un item dont le titre porte une référence `uXX-lYz`, donc sur un item entier
   réemployé. Or l’unité 10 fait exactement l’inverse : elle publie des composés
   dont les blocs sont des items publiés ailleurs. Sur ce fichier, le script rend
   « écarts de réemploi : 0 » alors qu’il n’a comparé aucun champ, et ce zéro se
   lit trop facilement comme une preuve. Le risque est le même que celui du
   finding `BALAYAGE-INVENTE` de `u09-l9a`, à ceci près que le chiffre est
   authentique et que c’est son SENS qui trompe. **Arbitrage demandé** : soit
   ajouter au script un contrôle de bloc, qui cherche chaque graphie publiée à
   l’intérieur des champs `thai` d’une leçon et compare les champs de la syllabe
   correspondante, soit faire imprimer au script « aucun réemploi déclaré, rien
   comparé » plutôt qu’un zéro, ce qui serait déjà suffisant.
8. **L’attribution de เปิด et ปิด est RÉGLÉE, et il reste une seule chose à
   trancher.** La version `draft` demandait ici d’exécuter l’attribution
   proposée. `lecon-10e.md` l’a exécutée d’elle-même dans la même session : elle
   ne publie plus aucun item, range les deux blocs hors de sa section `## Items`
   avec la mention `(u10-l10b)`, et a retiré sa carte `srs-u10-l10e-03` pour ne
   pas doubler celle de 10B. Relevé fait dans son texte le 2026-08-04. **Ce qui
   reste à trancher** : une leçon de bilan se retrouve sans aucun item publié, ce
   qui est peut-être normal et n’a jamais été décidé ; et la collision ราคา entre
   10C et 10D, qui ne concerne pas ce fichier, n’est pas réglée.
9. **`repo-thai-scan.mjs --grep` ne peut PAS révéler une collision, ni en prouver
   l’absence.** Il n’affiche pour chaque graphie que le premier fichier où elle
   apparaît, propriété `firstSeen` de son code. C’est précisément l’outil que
   `u09-l9a` a désigné comme la garantie contre les décomptes inventés, et sur ce
   point il donne un résultat rassurant et incomplet. **L’indice indirect que la
   version `draft` en tirait, l’écart entre le nombre d’entrées et le nombre de
   graphies distinctes, est invalide et a été retiré** : cet écart compte des
   doublons d’entrée, pas des graphies partagées entre fichiers, et il ne sait
   distinguer ni le nombre ni les noms. Le zéro collision annoncé par ce fichier
   repose donc sur un script de travail hors dépôt, ce qui est exactement la
   situation que le dépôt ne devrait pas tolérer. **Arbitrage demandé** : ajouter
   un mode `--collisions` qui liste chaque graphie apparaissant dans plus d’un
   fichier avec TOUS ses fichiers, et le rendre obligatoire avant toute
   consolidation d’unité. Ce mode est la moitié manquante des arbitrages 3 de
   `u09-l9a` et 5 ci-dessus.
10. **NOUVEAU, issu du contre-audit du 2026-08-04. `ห้อง` est publié deux fois
    par l’unité 7, avec des champs différents.** `u07-l7a` le donne
    `longueur : courte` et `fr : la pièce, la chambre` ; `u07-l7b` le republie
    `longueur : brève, malgré la graphie ออ qui fait attendre une voyelle longue`
    et `fr : la pièce ; la salle`. La transcription `hâwng` est identique dans
    les deux, donc rien de ce que 10B affiche n’est faux, mais la carte SRS visée
    par un réemploi est ambiguë. Le même index rend la même situation pour
    ห้องน้ำ, publié par `u05-l5c` et republié par `u07-l7b`. 10B a choisi
    `u07-l7a`, premier publiant, et s’y tient partout. **Arbitrage demandé** :
    trancher l’attribution dans l’unité 7 et aligner les champs, ou déclarer
    lequel des deux items fait foi. Une leçon de l’unité 10 ne peut pas corriger
    une leçon de l’unité 7.

- Lot de contre-audit externe : à préparer dans
  `content/authoring/unite-10/contre-audit-gpt56.md`, en portant l’incertitude 8
  en tête de lot, puis l’incertitude 1, l’incertitude 5 dans sa forme réécrite,
  et le point 3 de la section précédente.
- Statut : `draft`. Revue native : en attente. **Contre-audit interne PASSÉ le
  2026-08-04**, douze findings traités, un refus documenté. **Aucun passage à
  `review` avant l’exécution de l’arbitrage 1**, qui décide de ce que cette leçon
  a le droit de demander en lecture. L’arbitrage 8, qui décidait de ce qu’elle a
  le droit de publier, n’est plus bloquant : l’attribution est faite.

## Constat du relevé RID du 2026-08-04

ทางออก est attesté comme entrée autonome du dictionnaire normatif,
alors que ทางเข้า ne l'est pas, bien que les deux se composent de la
même façon sur ทาง. Cette asymétrie ทางออก contre ทางเข้า est un fait
de langue, pas un défaut de la leçon : une composition transparente
peut se figer d'un seul côté. Les deux restent enseignés comme des
compositions, ce qui demeure exact. Voir verification-rid.md.
