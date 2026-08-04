# Leçon 10C : Lire un menu

## Méta

- Identifiant : `u10-l10c`
- Titre français : Lire un menu
- Objectif observable : à la fin de la leçon, devant une ligne écrite en thaï
  bâtie sur le modèle de la carte du jour et sans l’entendre, l’apprenant dit à
  la fois de quel plat il s’agit et combien il coûte, sur 10 lignes sur 12 ; il
  apparie six lignes écrites à leur contenu français, 6 sur 6, alors que trois
  plats et deux prix seulement y circulent, de sorte qu’aucun des deux blocs ne
  suffit ; il reconstruit une de ces lignes à partir de blocs AFFICHÉS, un nom
  de plat entier, un nombre et บาท, dont il doit en retirer un ou deux, sur
  5 lignes sur 6 ; il retrouve la ligne écrite que quelqu’un vient de lire à
  voix haute, sur 10 tirages sur 12 ; et il écrit en transcription les huit
  entrées du jour, accent de ton compris, sur 6 sur 8, sans les entendre avant
  de répondre.
- Nature : première unité du fil LECTURE APPLIQUÉE, et cette leçon en est la
  leçon C. Tout l’alphabet, les quatre marques de ton et les familles de finales
  sont posés depuis 9A. **Aucune lettre nouvelle n’est présentée ici, aucun signe
  nouveau, aucune règle d’écriture nouvelle.** Ce qui est neuf est l’objet lu :
  non plus un mot isolé sur un écran d’exercice, mais une ligne de carte, où deux
  blocs se suivent et où chacun répond à une question différente.
- **Coordination d’unité : le relevé manquant a été FAIT à la consolidation du
  2026-08-04, et il rend une collision réelle.** Au moment d’écrire, le dossier
  `content/authoring/unite-10/` ne contenait aucun autre fichier, ce qui
  interdisait à cette leçon le relevé de collisions que `u09-l9a` avait fait pour
  son unité. Le dossier compte maintenant cinq fichiers, et
  `node scripts/verification/repo-thai-scan.mjs 10 10` rend 5 fichiers,
  32 entrées et 31 graphies distinctes. Trois conséquences, écrites plutôt que
  tues :
  - les trois graphies que cette leçon publie comme neuves, หมู, ราคา et อาหาร,
    sont vérifiées absentes des unités 1 à 9, contrôle mécanique reproduit plus
    bas ; หมู et อาหาร ne sont revendiquées par aucune autre leçon de l’unité 10 ;
  - **ราคา est publié deux fois dans l’unité**, par cette leçon à son item 2 et
    par `lecon-10d.md` à son item 1, qui déclare son attribution en suspens et
    propose que 10C publie, 10C étant la leçon la plus précoce. C’est
    exactement l’arbitrage proposé par `u09-l9a`. **10C ne tranche pas seule** :
    une leçon ne décide pas de l’attribution d’une autre ;
  - le dépouillement demande un outil que le dépôt n’a pas encore, le script
    actuel ne conservant que le premier fichier où une graphie apparaît. Voir
    l’arbitrage 1.
- Ce que cette leçon ne refait pas, et c’est un choix de périmètre :
  `u07-l7e` a déjà mis en scène la question de prix PARLÉE au restaurant, avec
  son item 12 ข้าวผัดเท่าไร et son item 13 สี่สิบบาท. 10C ne rejoue pas cette
  scène. Elle se place de l’autre côté : ce que l’apprenant a devant les yeux
  n’est plus un serveur, c’est une carte écrite qu’il doit lire seul, sans
  personne pour la lui dire.
- Prérequis :
  - leçon 1A : les neuf consonnes moyennes ก จ ฎ ฏ ด ต บ ป อ. Deux servent
    aujourd’hui : le อ qui ouvre อาหาร, et le ก de ไก่ ;
  - leçon 1B : ดู, item 10, transcription `douu`, le mot par lequel la voyelle
    longue ◌ู a été posée dès la première unité. C’est la voyelle de หมู, et
    `u07-l7d` la republie à son item 3 en rappelant cette origine. Elle n’est
    donc pas neuve aujourd’hui, et l’item 1 le dit ;
  - leçon 1D : les mots à ห muet หมา, หนา et หนี, et l’OBSERVATION que sa page
    d’exercice énonce, « dans cette leçon, les mots écrits avec un ห muet portent
    le ton montant ». 1D dit elle-même, dans ses pièges connus, que cette
    observation « vaut pour les mots de cette leçon, pas comme règle générale à
    ce stade ». หมู entre dans la même série, et son ton lui est DONNÉ pour cette
    raison exacte ;
  - leçon 3B : les dix chiffres thaïs ๐ à ๙, item 8, travaillés en reconnaissance
    seule. Toute la colonne de droite de la carte du jour est écrite avec eux. Et
    le patron des dizaines, item 4, qui donne สี่สิบ et ห้าสิบ ;
  - leçon 3C : บาท, item 3, réemployé aujourd’hui à l’item 7 ; ห้าสิบบาท, item 7,
    réemployé à l’item 8 ; สิบห้าบาท, item 8, employé comme spécimen. La carte
    `srs-u03-l3c-04` porte déjà le contraste d’ordre สิบห้า contre ห้าสิบ, et la
    carte du jour ne le duplique pas ;
  - leçon 4A : la règle du ton en syllabe vivante pour les classes moyenne et
    haute, et l’avertissement que เ, แ, โ, ใ et ไ s’écrivent AVANT la consonne
    qu’elles accompagnent. Cet avertissement porte deux mots de la carte, ไก่ et
    ไข่, et un mot du spécimen, น้ำเปล่า. La même leçon publie ไก่, item 2, et
    ไข่, item 3, les deux ingrédients que l’apprenant lit aujourd’hui sans les
    réapprendre ;
  - leçon 4C : ข้าวผัด, item 1, réemployé aujourd’hui à l’item 4 et tête des
    trois noms de plats de la carte. La même leçon publie น้ำเปล่า, item 2, seule
    ligne de la carte qui ne soit pas un ข้าวผัด, et จาน, item 3, le mot de
    comptage de ce qui est servi dans une assiette. จาน n’est pas employé sur la
    carte, et la page 4 dit pourquoi. La même leçon publie aussi la phrase de
    commande ขอข้าวผัดสองจานหน่อยครับ, où จาน est employé ;
  - leçon 5A : le ห qui se prononce contre le ห muet, et surtout le repère de
    contact de sa page 5, « le ห se tait quand une des lettres ง, น, ม, ย, ว ou ร
    est collée juste derrière lui, sans le moindre signe posé sur le ห ». **C’est
    le prérequis central du jour** : il sépare อาหาร, où le ห se prononce, de
    หมู, où il se tait. La même leçon publie ผัด, item 4 ;
  - leçon 6A : la règle du ton sans marque pour la classe BASSE. Elle donne
    aujourd’hui les DEUX tons de ราคา, et c’est le seul mot neuf de la leçon dont
    rien ne soit donné ;
  - leçon 7A : les marques ไม้เอก et ไม้โท et le tableau de leur effet en syllabe
    vivante. Le ไม้โท de ข้าว vient de là. La même leçon range explicitement les
    mots à consonne de tête hors de son tableau ;
  - leçon 7E : ข้าวผัดเท่าไร, item 12, et สี่สิบบาท, item 13. Le second est
    employé tel quel comme spécimen de la carte, ๔๐ บาท. Le premier est
    l’ossature de la réplique 2 du dialogue ;
  - leçon 8A : le tableau entier des onze cases, en syllabe VIVANTE. C’est la
    référence exacte de l’audit de lecture de la page 10 ;
  - leçon 9A : les familles de finales, et en particulier le fait que ร en fin de
    syllabe se lit `n`. **อาหาร est l’application directe de cette leçon** : sa
    dernière lettre est ร, et ce qui sort est un `n`. 9A a publié อาการ, dont
    l’allure est très proche et dont la page 6 faisait déjà exactement ce test ;
  - leçon 9D : ร้านขายยา, item 2, où l’apprenant a lu ร้าน pour la première fois.
    Il le retrouve à la note culturelle, dans ร้านอาหาร, sans que ce mot soit
    enseigné.
- Cible phonétique : aucun son nouveau. Le seul contraste entretenu est
  **montant contre haut**, conformément au fil des tons de `CONVENTIONS.md`, qui
  demande un entretien par le SRS à partir de l’unité 8 et interdit de présenter
  ce contraste comme acquis. Les mots du jour qui le portent sont หมู et la
  deuxième syllabe de อาหาร au ton montant, contre la première syllabe de ร้าน,
  citée à la note culturelle, au ton haut. **La leçon ne crée aucune carte de ton
  nouvelle** ; elle apporte des tirages aux cartes existantes, comme 9A l’avait
  demandé. Voir l’arbitrage 3.
- Bloc de lecture du jour, en deux objets :
  1. **les lignes du jour se lisent en deux blocs**, celui qui dit QUOI et celui
     qui dit COMBIEN. Sur ces lignes, le second se termine par le nom de la
     monnaie ;
  2. **le nom du plat est lui-même un bloc composé**, un plat de base suivi de ce
     qu’on y met. L’apprenant lit ข้าวผัด, qu’il connaît depuis 4C, puis un seul
     mot de plus.
- Règle enseignée, en deux énoncés, et aucun n’est une règle de grammaire :
  - sur les lignes que cette leçon fait lire, ce qui est écrit à gauche nomme, ce
    qui est écrit à droite chiffre, et le mot บาท ferme le bloc de droite. **Cet
    énoncé porte sur nos lignes et sur elles seules** : la leçon ne dit pas
    comment les cartes thaïes réelles sont mises en page, et la carte de la
    page 9 est construite ;
  - quand un nom de plat commence par un plat que vous connaissez, ne relisez pas
    tout : lisez ce qui vient APRÈS, c’est là qu’est la différence entre deux
    lignes voisines.
- Ce que la leçon n’ouvre pas, et il faut le dire, parce que c’est visible sur
  l’écran de l’apprenant :
  - **le ton des syllabes fermées par une occlusive reste hors programme.** ผัด
    et บาท sont dans ce cas, et ils apparaissent respectivement trois et quatre
    fois sur la carte. Leur ton est DONNÉ. C’est exactement le manque de
    curriculum que `u09-l9a` a signalé à son incertitude 6 en demandant qu’il
    soit arbitré au niveau de l’unité 10 ; 10C constate qu’il ne l’a pas été et
    le porte à l’arbitrage 2 ;
  - **la consonne de tête reste hors programme.** Elle commande le ton de หมู.
    Le mécanisme est pourtant sourçable, l’entrée de lettre « ห » du RID
    l’énonce elle-même, et aucune leçon des unités 1 à 9 ne l’enseigne. Voir
    l’incertitude 1 et l’arbitrage 2 ;
  - **le ห nu suivi d’une lettre qui n’est ni une voyelle ni l’une des six de la
    liste de 5A.** 5A ferme elle-même la porte, « la liste complète et ce que ce
    ห muet fabrique viendront plus tard ». 10C fait donc appliquer le repère aux
    DEUX cas qu’il tranche sûrement et dit à l’apprenant de ne rien conclure
    dans le troisième. Voir l’arbitrage 7 ;
  - les formes en ไ, ใ, เ◌า et ◌ำ restent hors du tableau des tons depuis 4A,
    ce qui met ไก่, ไข่, น้ำ et เปล่า hors de portée du calcul ;
  - la grammaire de la composition nominale thaïe n’est ni énoncée ni supposée.
    La leçon ne dit nulle part « en thaï le nom principal vient en premier » :
    aucune source de la politique du projet ne peut porter cette affirmation
    sans une grammaire de référence sur exemplaire, et le projet n’en a pas.
    Elle enseigne un GESTE DE LECTURE sur des lignes précises, pas une règle ;
  - la mise en page des cartes réelles. Voir la contrainte de spécimen.
- **Contrainte de spécimen, et elle est stricte.** La carte de la page 9 est
  **construite pour cette leçon**. Elle ne reproduit aucune carte existante, ne
  porte aucun nom de commerce, aucun nom de rue, aucune adresse. Ses prix ne sont
  pas des prix relevés : ce sont trois nombres déjà enseignés à l’unité 3 et en
  7E, placés là pour être lus. **Ses deux mots de tête de colonne, อาหาร et
  ราคา, sont eux aussi une construction** : les deux mots sont sourcés, leur
  emploi comme en-tête ne l’est pas. La leçon n’affirme rien sur ce que coûte
  quoi que ce soit, ni sur la façon dont les cartes sont mises en page en
  Thaïlande. Ces deux points sont déclarés à l’écran, page 9, et pas seulement
  dans ce dossier.
- Durée visée : 17 minutes.
- Transcription : convention `thainaute-fr` v1.1.
- Statut : `draft`. Revue native : en attente.

## Enseignement

### Page 1 : vous savez déjà lire la moitié d’une carte

Depuis l’unité 4 vous lisez ข้าวผัด, depuis l’unité 3 vous lisez บาท et les
chiffres ๐ à ๙, depuis 9A vous savez qu’un ร à la fin d’un mot sort en `n`.
Mettez ces trois choses ensemble et vous tenez presque une ligne de carte
entière. Il manque deux mots et une manière de regarder. C’est tout le programme
du jour.

Spécimen : ข้าวผัด (khâao·phàt) · ๕๐ บาท (hâa·sìp bàat)

### Page 2 : une ligne, deux blocs

Les lignes que vous allez lire aujourd’hui répondent à deux questions, dans cet
ordre : quoi, puis combien. Ne les lisez pas comme des phrases, lisez-les comme
deux paquets posés côte à côte. Le premier paquet nomme. Le second chiffre, et
il se ferme sur บาท.

> ข้าวผัด · ๕๐ บาท
> ce que c’est · ce que ça coûte

Spécimen : ข้าวผัด ๕๐ บาท

### Page 3 : le bloc de droite, un nombre puis บาท

Vous l’avez déjà rencontré en 3C et en 7E : le nombre vient d’abord, le nom de
la monnaie ensuite, et บาท s’écrit de la même façon dans les trois. ๕๐ บาท se
dit ห้าสิบบาท, ๔๐ บาท se dit สี่สิบบาท, ๑๕ บาท se dit สิบห้าบาท. Attention à
l’ordre des chiffres, le piège de 3C : สิบห้า vaut quinze, ห้าสิบ vaut
cinquante.

Spécimen : ๑๕ บาท (sìp·hâa bàat) contre ๕๐ บาท (hâa·sìp bàat)

### Page 4 : le bloc de gauche est lui aussi un bloc

Regardez ces deux lignes. Elles commencent pareil et ne finissent pas pareil.

> ข้าวผัดหมู
> ข้าวผัดไก่

Le début, ข้าวผัด, vous le connaissez : c’est le riz sauté de 4C. Ce qui suit
dit ce qu’il y a dedans. Le geste de lecture est donc économique : reconnaissez
le début d’un coup d’œil, puis lisez ce qui vient après, parce que c’est là
qu’est toute la différence entre deux lignes voisines. Notez au passage que จาน,
le mot de comptage appris en 4C, ne figure nulle part sur notre carte. Vous le
connaissez d’ailleurs dans une phrase où l’on COMMANDE,
ขอข้าวผัดสองจานหน่อยครับ, et pas dans une ligne qui affiche.

Spécimen : ข้าวผัดหมู (khâao·phàt·mǒuu) contre ข้าวผัดไก่ (khâao·phàt·kài)

### Page 5 : หมู

Trois lettres, ห puis ม puis la voyelle ◌ู. Le ห ne se prononce pas, et vous
savez pourquoi depuis la page 5 de 5A : il se tait quand ง, น, ม, ย, ว ou ร est
collée juste derrière lui sans aucun signe posé sur le ห. C’est le même ห que
dans หมา de 1D et หมอ de 9A. La voyelle est le `ou` long, tenu. Le ton MONTANT
vous est donné : ce que ce ห muet fabrique au ton n’a été enseigné nulle part
dans le parcours.

Spécimen : หมู (mǒuu) · หมา (mǎa) · หมอ (mǎww)

### Page 6 : le même ห, deux comportements, et vous avez déjà le repère

Voici le deuxième mot du jour. Il veut dire la nourriture, ce qui se mange pris
comme catégorie.

> อาหาร

Il porte un ห lui aussi, et celui-là se PRONONCE. Vérifiez avec le repère de 5A
plutôt que de me croire : derrière le ห de อาหาร il y a une voyelle, า, et non
l’une des six lettres ง, น, ม, ย, ว, ร. Derrière le ห de หมู il y a un ม, qui
est de la liste. Un seul coup d’œil à la lettre suivante suffit à trancher.

Ce coup d’œil vous donne une réponse sûre dans deux cas, et il faut savoir
lesquels. Si une VOYELLE est collée derrière le ห, il se prononce. Si l’une des
six lettres de la liste de 5A est collée derrière lui et qu’aucun signe n’est
posé sur le ห, il se tait. Dans tout autre cas, ne concluez rien pour l’instant :
5A vous avait prévenu que la liste complète viendrait plus tard, et elle n’est
pas encore arrivée.

Spécimen : อาหาร (aa·hǎan) contre หมู (mǒuu)

### Page 7 : et sa dernière lettre est un ร qui sort en n

C’est 9A appliqué, sur un mot que vous venez de rencontrer. อาหาร finit à
l’écrit par ร, et ce qui sort à la fin est un `n`, exactement comme dans อาการ
que vous avez lu en 9A. Lisez le mot lettre à lettre, écoutez-le, comparez.

Spécimen : อาหาร (aa·hǎan) · อาการ (aa·kaan)

### Page 8 : ราคา, le prix, et deux tons que vous calculez

Quatre lettres, deux syllabes, et un cadeau : c’est le seul mot neuf du jour
dont vous pouvez calculer les DEUX tons sans qu’on vous les donne. ร est basse,
ค est basse, les deux syllabes se terminent sur une voyelle longue, aucune marque
n’est posée. La règle de 6A donne donc le ton moyen deux fois. Faites le calcul,
puis écoutez : ça vaut mieux que de me croire.

Spécimen : ราคา (raa·khaa)

### Page 9 : la carte, et elle est construite

Voici la carte du jour. Elle a été **fabriquée pour cette leçon** : ce n’est la
copie d’aucune carte existante, elle ne porte le nom d’aucun restaurant, et ses
prix ne sont pas des prix relevés quelque part. Ce sont trois nombres que vous
avez déjà appris, posés là pour que vous les lisiez.

Une précision qui compte, et nous préférons vous la donner : les deux mots posés
en tête de colonnes, อาหาร et ราคา, sont notre mise en page à nous. Les deux
mots existent et sont vérifiés, mais **rien dans nos sources ne dit qu’une carte
thaïe les emploie ainsi**. Ils sont là pour vous dire ce que chaque colonne
contient, pas pour vous montrer à quoi ressemble une carte en Thaïlande.

> อาหาร ／ ราคา
> ข้าวผัดหมู ／ ๕๐ บาท
> ข้าวผัดไก่ ／ ๕๐ บาท
> ข้าวผัดไข่ ／ ๔๐ บาท
> น้ำเปล่า ／ ๑๕ บาท

Deux colonnes, cinq lignes, et vous savez déjà lire chacune d’elles. Prenez le
temps de les parcourir dans les deux sens : de gauche à droite pour savoir ce que
coûte un plat, de droite à gauche pour savoir ce que vous pouvez prendre avec ce
que vous avez.

Spécimen : la carte complète

### Page 10 : ce que vous calculez, et ce qu’on vous donne

Soyons précis, parce que c’est utile et parce que c’est honnête. Sur cette carte,
**douze syllabes DIFFÉRENTES** sont écrites en lettres thaïes. Trois d’entre
elles reviennent plusieurs fois, ce qui fait dix-neuf syllabes à lire en tout.
**Cinq de ces douze ont un ton que vous pouvez calculer aujourd’hui** avec le
tableau de 7A et 8A : อา et หาน de อาหาร, รา et คา de ราคา, et ข้าว. **Les sept
autres vous sont données**, et pour cinq motifs distincts que vous connaissez
déjà :

> ผัด et บาท : la syllabe se ferme sur une occlusive, cas que le tableau ne
> couvre pas encore
> หมู : consonne de tête, mécanisme jamais enseigné
> ไก่ et ไข่ : forme en ไ, hors du tableau depuis 4A
> น้ำ : forme en ◌ำ, hors du tableau depuis 4A
> เปล่า : forme en เ◌า, hors du tableau depuis 4A

Ce n’est pas un trou dans ce que vous savez, c’est la carte de ce qui reste à
apprendre. Lire une carte ne demande pas de calculer les tons : ça demande de
reconnaître des blocs.

Spécimen : ราคา (calculé) contre บาท (donné)

### Page 11 : à vous

Sur nos lignes, le geste tient en trois temps. Un, coupez la ligne en deux à
l’endroit où les chiffres commencent. Deux, à gauche, reconnaissez le début du
nom puis lisez ce qui vient après. Trois, à droite, lisez le nombre, puis lisez
ce qui le suit.

Après les exercices, enregistrez-vous en disant หมู puis อาหาร, et comparez en
A/B avec la voix de référence : ce sont deux ห qui ne font pas la même chose.
L’enregistrement reste privé, sur votre appareil.

## Items

### Item 1 : หมู (NOUVEAU)

- `thai` : หมู
- `codepoints` : U+0E2B U+0E21 U+0E39 (NFC)
- `ipa` : /muː˩˩˦/
- `ton` : montant
- `longueur` : longue
- `fr` : le cochon ; et, dans un nom de plat, le porc
- `transcription` : mǒuu
- `registre` : neutre
- `note_fr` : le seul mot de contenu réellement nouveau de la leçon, et il tombe
  sur une figure que vous lisez depuis l’unité 1. Le ห est écrit et muet, parce
  qu’un ม est collé juste derrière lui sans aucun signe posé sur le ห : c’est le
  repère de la page 5 de 5A, et c’est le même ห que dans หมา appris en 1D et หมอ
  appris en 9A. La voyelle ◌ู est le `ou` long, tenu : c’est exactement celle de
  ดู, que 1B vous a fait apprendre POUR elle et que 7D vous a fait employer. Le
  mot est neuf, la voyelle ne l’est pas. Le ton MONTANT vous est donné : ce
  que ce ห muet fabrique au ton n’est enseigné nulle part dans le parcours, et
  1D disait déjà de son côté que le motif « ห muet égale ton montant » valait
  pour les mots de sa leçon et non comme règle générale. Le mot a plusieurs
  autres emplois que ceux du champ `fr`, dont un familier désignant une personne,
  et la leçon n’en enseigne aucun.
- `sources` :
  - RID 2554, Office of the Royal Society, entrée « หมู ๑ », relevée le
    2026-08-04 par `node scripts/verification/rid-entry.mjs หมู` : graphie
    attestée comme vedette, six vedettes homographes au total. « หมู ๑ » porte
    deux sens nominaux, le (๑) l’animal de la famille des Suidae, décrit par ses
    sabots et son groin, et le (๒), étiqueté (ปาก), une personne facile à
    tromper ou à battre, qui n’est PAS enseigné. Les vedettes « หมู ๒ » à
    « หมู ๖ », un adjectif familier, un poisson, une préparation à fumer, un type
    de barque et une sorte de hache, ne sont pas enseignées non plus.
    **La liste des ลูกคำ de « หมู ๑ » porte à elle seule la preuve de l’emploi
    culinaire du champ `fr`** : elle comprend หมูกรอบ, หมูแดง, หมูตั้ง, หมูแนม,
    หมูแผ่น, หมูยอ, หมูสามชั้น, หมูหย็อง, หมูหัน et หมูแฮม, dix mots dérivés qui
    sont des préparations, et où หมู désigne donc la viande et non l’animal
    vivant (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, ligne
    56943, relevée le 2026-08-04 par
    `node scripts/verification/volubilis-lookup.mjs <xlsx> หมู` (THA « หมู »,
    ThaiRom `mū`, ThaiPhon `/mū`, TYPE n., ENG « pig ; pork ; boar », FRA
    « cochon [m] ; porc [m] », domaine `CULINA ; INSOLITE ; MAMMAL ; MINENG ;
TOURIST ; ZOOL`). Le `/` note le ton montant, feuille `Codes`, clé `TONES` ;
    le macron note la voyelle longue, feuille `Romanization`, où อู vaut `ū`
    contre อุ qui vaut `u`. **C’est cette ligne qui porte le second sens du champ
    `fr` en toutes lettres**, « porc », indépendamment du RID. Les lignes 56944
    et 56945, même graphie, portent un sens d’embonpoint et le sens adjectival
    « facile », aucun des deux n’étant enseigné.
  - en.wiktionary, entrée « หมู », https://en.wiktionary.org/wiki/หมู, consultée
    en rendu le 2026-08-04 (Orthographic `หมู`, **Phonemic `หฺมู`**, IPA
    /muː˩˩˦/, Paiboon `mǔu`, Royal Institute `mu`, nom « pig », classificateur
    ตัว, sens de viande donné comme conditionné à un เนื้อ qui précède). Le
    พินทุ sous le ห dans la forme phonémique note la consonne de tête muette,
    exactement comme pour หมอ relevé par `u09-l9a`. **Ses termes dérivés
    corroborent l’emploi culinaire du champ `fr` indépendamment du RID** :
    หมูกรอบ, หมูกระทะ, หมูปิ้ง, หมูย่าง, หมูสับ et หมูสามชั้น.
  - th.wiktionary, entrée « หมู », https://th.wiktionary.org/wiki/หมู, consultée
    en rendu le 2026-08-04 (respelling หฺมู, สัทอักษรสากล /muː˩˩˦/, ไพบูลย์ `mǔu`,
    ราชบัณฑิตยสภา `mu`, คำนาม, คำลักษณนาม ตัว). Même écosystème que l’édition
    anglaise, comptée comme recoupement et non comme source indépendante.
  - **Réserve honnête sur le second sens du champ `fr`.** Wiktionary conditionne
    la lecture « porc » à la présence de เนื้อ devant le mot, là où VOLUBILIS
    donne « porc » pour le mot nu. Ce qui tient sur DEUX sources indépendantes
    n’est donc pas « หมู nu veut dire la viande » mais « หมู entre dans les noms
    de plats et y désigne la viande » : le RID le montre par ses dix ลูกคำ,
    Wiktionary par ses six termes dérivés. Le champ `fr` est écrit à cette
    portée exacte, et pas plus large. Voir l’incertitude 4.
  - Valeur muette du ห devant une basse seule : RID 2554, entrée de lettre
    « ห », relevée le 2026-08-04 par `node scripts/verification/rid-entry.mjs ห`,
    qui donne la lettre pour อักษรสูง, employée comme พยัญชนะต้น, et qui énonce
    qu’elle sert à mener une basse seule pour la faire fléchir comme une haute,
    le ห n’étant alors pas prononcé, avec หงอย et หนา pour exemples ; et annexe
    « Appendix:Thai script » d’en.wiktionary, relevée le 2026-08-04, où ห porte
    `Class` = high, `IPA Initial` = `h` et une case `IPA Final` vide.
  - Fréquence, signal indicatif : FrequencyWords (Hermit Dave, sous-titres
    OpenSubtitles thaï 2018, contenu CC BY-SA 4.0), liste `th_50k.txt`,
    https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_50k.txt,
    exemplaire relevé le 2026-08-04, 50 000 lignes, SHA-256
    `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083` :
    **หมู au rang 5152, 76 occurrences.** Rang élevé DANS CE CORPUS, et c’est le
    critère sur lequel le mot a été retenu. Ce relevé ne dit rien de la
    fréquence du mot à l’écrit ni sur une carte, et la leçon n’en tire aucune
    promesse d’exposition.

### Item 2 : ราคา (NOUVEAU)

- `thai` : ราคา
- `codepoints` : U+0E23 U+0E32 U+0E04 U+0E32 (NFC)
- `ipa` : /raː˧.kʰaː˧/
- `ton` : raa moyen ; khaa moyen
- `longueur` : raa longue ; khaa longue
- `fr` : le prix
- `transcription` : raa·khaa
- `registre` : neutre
- `note_fr` : le mot le plus rentable de la leçon, pour deux raisons. La première
  est son sens : il nomme exactement la question que pose toute la moitié droite
  d’une ligne, combien. C’est aussi lui que nous avons posé en tête de la colonne
  des chiffres, page 9, et cette mise en page est la nôtre : rien dans nos
  sources ne l’atteste sur une carte réelle. La seconde raison est pédagogique :
  c’est le SEUL mot neuf du jour dont les deux tons se déduisent entièrement de
  ce que vous savez. ร est basse depuis 6A, ค est basse
  depuis 5A, les deux syllabes se terminent sur la voyelle longue า et sont donc
  vivantes, aucune marque n’est posée, et la règle de 6A donne le ton moyen deux
  fois. Vérifiez-le, cela vaut mieux que de me croire. Le ร initial n’a rien de
  nouveau, c’est celui de รถ appris en 5D et de ร้านขายยา appris en 9D.
- `sources` :
  - RID 2554, entrée « ราคา », relevée le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs ราคา` : graphie attestée comme
    vedette unique, deux sens nominaux numérotés, le (๑) la valeur d’une chose
    comptée en argent, le (๒) la somme payée ou convenue lors d’une vente, avec
    un emploi figuré de « valeur » employé surtout à la forme négative. C’est le
    sens (๑) que la leçon enseigne. **Aucune étiquette de registre sur la
    vedette.** L’entrée ne porte PAS de lecture entre crochets. Un seul mot
    dérivé, ราคาตลาด, non enseigné (faits cités par référence, définitions non
    reproduites).
  - VOLUBILIS v26.2, `.xlsx`, ligne 80679, relevée le 2026-08-04 par le script
    versionné (ThaiRom `rākhā`, ThaiPhon `-rā-khā`, TYPE n., ENG « price ;
    value ; cost ; worth », FRA « prix [m] ; coût [m] ; valeur [f] ;
    montant [m] », domaine `COMM ; ECONO (market) ; VOGUE ; (Covid-19)`,
    relevé intégral et non tronqué). Les deux `-`
    notent le ton moyen sur chaque syllabe, clé `TONES` ; les deux macrons notent
    les deux voyelles longues. **Entrée unique pour cette graphie dans la base**,
    ce qui est rare et rend la traduction non ambiguë.
  - en.wiktionary, entrée « ราคา », https://en.wiktionary.org/wiki/ราคา,
    consultée en rendu le 2026-08-04 (Orthographic `ราคา`, Phonemic `รา-คา`, IPA
    /raː˧.kʰaː˧/, Paiboon `raa-kaa`, Royal Institute `ra-kha`, nom « price ;
    cost », emprunt semi-savant au malais `harga`, lui-même du sanskrit अर्घ).
    Termes dérivés relevés : ลดราคา, ราคาถูก, ป้ายราคา et ราคาแพง, dont le
    dernier emploie แพง, item publié de `u02-l2a`. Aucun n’est enseigné.
  - Classe basse de ร et de ค, pour la déduction du ton annoncée à la page 8 :
    RID 2554, entrées de lettre « ร » et « ค », relevées le 2026-08-04, qui
    donnent l’une et l’autre pour อักษรต่ำ ; et annexe « Appendix:Thai script »,
    relevée le même jour, où ร porte `Class` = low et ค porte `Class` = low. Ces
    deux faits étaient déjà employés par `u06-l6a` et par `u05-l5a`, et ils sont
    re-relevés ici plutôt que crus sur parole.
  - Fréquence, signal indicatif : FrequencyWords `th_50k.txt`, exemplaire
    empreinté ci-dessus, relevé le 2026-08-04 : **ราคา au rang 4900, 80
    occurrences.** C’est le rang le plus élevé des trois mots neufs du jour.

### Item 3 : อาหาร (NOUVEAU)

- `thai` : อาหาร
- `codepoints` : U+0E2D U+0E32 U+0E2B U+0E32 U+0E23 (NFC)
- `ipa` : /ʔaː˧.haːn˩˩˦/
- `ton` : aa moyen ; hǎan montant
- `longueur` : aa longue ; hǎan longue
- `fr` : la nourriture ; ce qui se mange, pris comme catégorie
- `transcription` : aa·hǎan
- `registre` : neutre
- `note_fr` : le mot qui fait travailler DEUX acquis d’un coup, et c’est pour
  cela qu’il est ici plutôt qu’ailleurs. D’abord son ห se PRONONCE, parce que la
  lettre collée derrière lui est une voyelle et non l’une des six lettres du
  repère de 5A : mettez-le à côté de หมู, item 1, et vous avez la paire de la
  page 6. Ensuite sa dernière lettre est un ร, et ce qui sort à la fin est un
  `n` : c’est 9A appliqué, et Wiktionary réécrit d’ailleurs le mot อา-หาน. Les
  deux tons se déduisent : อ est moyenne depuis 1A, la première syllabe est
  vivante et nue, donc moyenne ; ห est haute depuis 4A, la seconde est vivante
  par sa finale et nue, donc montante. Le อ initial est l’appui muet de 1A, celui
  de อะไร et de อยู่.
- `sources` :
  - RID 2554, entrée « อาหาร », relevée le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs อาหาร` : graphie attestée comme
    vedette unique, deux sens nominaux, le (๑) ce qui se mange, ce qui soutient
    et entretient la vie, avec อาหารเช้า, อาหารปลา et อาหารนก pour exemples, et
    le (๒) un emploi figuré pour ce qui lui ressemble, avec อาหารตา et อาหารใจ,
    qui n’est PAS enseigné. **Aucune étiquette de registre.** Origine notée
    (ป., ส.), pali et sanskrit. L’entrée ne porte PAS de lecture entre crochets ;
    un seul mot dérivé, อาหารว่าง, non enseigné et non traduit ici faute d’une
    seconde source (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, lignes 337 et 338, relevées le 2026-08-04 par le
    script versionné, **chaque champ recopié en entier et attribué à sa ligne** :
    ligne 337, ThaiRom `āhān`, ThaiPhon `-ā/hān`, TYPE n., FRA « nourriture [f] ;
    alimentation [f] ; aliment [m] ; repas [m] ; plat [m] ; popote [f] (fam.) ;
    bouffe [f] (fam.) ; boustifaille [f] (pop.) », domaine `CULINA ; HOTEL ;
MEDIC ; ORNITHO ; RID ; TOURIST` ; ligne 338, mêmes ThaiRom et ThaiPhon,
    TYPE n., FRA « cuisine [f] ; gastronomie [f] », domaine `CULINA` SEUL. Les
    trois dernières gloses de la ligne 337 ne sont pas enseignées, et leurs
    marques `(fam.)` et `(pop.)` qualifient le mot FRANÇAIS proposé, non le mot
    thaï, dont aucune colonne de registre n’est renseignée sur les deux lignes.
    Elles sont citées parce qu’une citation tronquée sans marque de coupure
    cesse d’être vérifiable. Le `-` puis le `/` notent la
    séquence moyen puis montant, clé `TONES` ; les deux macrons notent les deux
    voyelles longues. **La romanisation se termine par `n` là où la graphie porte
    ร**, ce qui corrobore la finale indépendamment de Wiktionary.
  - en.wiktionary, entrée « อาหาร », https://en.wiktionary.org/wiki/อาหาร,
    consultée en rendu le 2026-08-04 (Orthographic `อาหาร`, **Phonemic
    `อา-หาน`**, IPA /ʔaː˧.haːn˩˩˦/, Paiboon `aa-hǎan`, Royal Institute `a-han`,
    nom « food ; meal ; diet », emprunt au sanskrit आहार ou au pali `āhāra`,
    classificateurs อย่าง, มื้อ, ชนิด et จาน). La forme phonémique réécrit le ร
    final en น, comme le fait le RID pour อาการ dans `u09-l9a`.
  - Valeur finale de ร : RID 2554, entrée de lettre « ร », relevée le 2026-08-04
    par `rid-entry.mjs`, qui range la lettre parmi les ตัวสะกด de la
    มาตรากน ou แม่กน avec การ et วาร pour exemples ; et annexe « Appendix:Thai
    script », relevée le même jour, ligne de ร, colonne `IPA Final` valant `n` et
    `Royal Thai Final` valant `n`. Fait déjà établi et enseigné par `u09-l9a`,
    re-relevé ici plutôt que repris sur parole.
  - Classe haute de ห : mêmes deux relevés qu’à l’item 1.
  - Fréquence, signal indicatif : FrequencyWords `th_50k.txt`, exemplaire
    empreinté à l’item 1, relevé le 2026-08-04 : **อาหาร au rang 2305, 171
    occurrences.** C’est le rang le plus élevé de tout le vocabulaire de cette
    leçon, items réemployés compris.

### Item 4 : ข้าวผัด (réemploi, publié par `u04-l4c` item 1)

- `thai` : ข้าวผัด
- `codepoints` : U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 (NFC)
- `ipa` : /kʰaːw˥˩.pʰat̚˨˩/
- `ton` : khâao descendant ; phàt bas
- `longueur` : khâao longue ; phàt courte
- `fr` : riz sauté
- `litteral` : riz, sauté
- `transcription` : khâao·phàt
- `registre` : neutre
- `note_fr` : réemployé sans aucune modification de champ, contrôle mécanique au
  dossier. Ce que 10C ajoute n’est pas un sens, c’est une POSITION : le mot
  devient ici la tête de trois lignes de carte, et il se lit d’un coup d’œil
  plutôt que lettre à lettre. Deux honnêtetés de lecture. Le ข้าว se calcule, ข
  est haute et le ไม้โท sur une haute en syllabe vivante donne le ton descendant,
  case du tableau de 7A. Le ผัด ne se calcule pas, la syllabe se fermant sur une
  occlusive : son ton bas vous est donné, comme il l’était déjà en 4C et en 5A.
- `sources` :
  - `u04-l4c` item 1, relu dans le dépôt le 2026-08-04, qui publie cette graphie
    avec quatre sources, RID, VOLUBILIS, en.wiktionary et th.wiktionary. Les cinq
    champs comparés par `item-fields-check.mjs` sont repris à l’identique, sans
    la moindre reformulation. Source interne au dépôt, citée comme contrôle de
    cohérence et non comme autorité.
  - RID 2554, entrée « ข้าวผัด », relevée à NEUF le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs ข้าวผัด` : graphie attestée comme
    vedette unique, sens culinaire concordant, du riz cuit sauté à l’huile.
    **Fait nouveau et utile à cette leçon : l’entrée nomme elle-même หมู parmi
    les ingrédients types du plat**, ce qui rattache l’item 5 au dictionnaire
    normatif sans que la leçon ait à inventer quoi que ce soit. Le แม่คำ de
    l’entrée est ข้าว (faits cités par référence, définition non reproduite).
  - VOLUBILIS v26.2, **`.xlsx`, ligne 31810**, relevée le 2026-08-04 (ThaiRom
    `khāophat`, ThaiPhon `\khāo_phat`, TYPE n., FRA « riz sauté [m] ; riz frit
    [m] », domaine `CULINA ; INSOLITE ; RID ; TOURIST`). **Cette citation est
    RÉANCRÉE sur le `.xlsx` conformément à l’amendement v1.3** : `u04-l4c` citait
    la ligne 33137 du `.ods`, exacte mais non recomputable par l’outil versionné.
    Les deux exemplaires donnent la même entrée ; seul le numéro de ligne change.
- Contrôle de réemploi : `node scripts/verification/item-fields-check.mjs
content/authoring/unite-10/lecon-10c.md`, exécuté le 2026-08-04, rend zéro
  écart sur cet item.

### Item 5 : ข้าวผัดหมู (BLOC, ข้าวผัด de l’item 4 et หมู de l’item 1)

- `thai` : ข้าวผัดหมู
- `codepoints` : U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 U+0E2B U+0E21
  U+0E39 (NFC)
- `ipa` : /kʰaːw˥˩.pʰat̚˨˩.muː˩˩˦/ (COMPOSÉE, voir sources)
- `ton` : khâao descendant ; phàt bas ; mǒuu montant
- `longueur` : khâao longue ; phàt courte ; mǒuu longue
- `fr` : riz sauté au porc
- `transcription` : khâao·phàt·mǒuu
- `registre` : neutre
- `note_fr` : la ligne de carte la plus démonstrative du jour. Dix lettres, et
  vous en connaissez déjà sept : lisez ข้าวผัด d’un coup, puis les trois
  dernières. Le ห de หมู est muet, celui de la page 6 ; le ton montant de la
  dernière syllabe vous est donné. Ce bloc n’est PAS un mot que vous devez savoir
  écrire de mémoire : il est là pour être reconnu sur une carte, et sa carte SRS
  ne demande que la reconnaissance.
- `sources` :
  - VOLUBILIS v26.2, `.xlsx`, ligne 31825, relevée le 2026-08-04 par
    `node scripts/verification/volubilis-lookup.mjs <xlsx> ข้าวผัดหมู` (THA
    « ข้าวผัดหมู », ThaiRom `khāophat mū`, ThaiPhon `\khāo_phat /mū`, TYPE
    `n. exp.`, ENG « fried rice with pork ; pork fried rice », FRA « riz sauté au
    porc [m] », **domaine `CULINA (menu) ; (THA)`**). L’étiquette de domaine
    porte le mot `menu` : la base classe elle-même cette suite comme une entrée
    de carte.
  - **Contrôles négatifs, et ils sont décisifs pour la portée de l’item.** La
    suite exacte ข้าวผัดหมู **n’a aucune entrée au RID**, requête du 2026-08-04
    par `node scripts/verification/rid-lookup.mjs ข้าวผัดหมู`, qui rend
    `absent` ; et **elle n’a aucune page sur en.wiktionary**, requête du même
    jour sur https://en.wiktionary.org/wiki/ข้าวผัดหมู, qui rend un HTTP 404.
  - **Ce que la leçon affirme, et ce qu’elle n’affirme pas.** L’attestation du
    BLOC comme expression est MONO-SOURCÉE, VOLUBILIS et rien d’autre. La règle 3
    du projet, un fait qui ne tient pas sur deux sources est retiré, s’applique
    donc à l’affirmation « ข้าวผัดหมู est une expression figée du thaï », qui
    n’est faite NULLE PART, ni à l’écran ni ici. Ce qui est affirmé et qui tient
    sur deux sources indépendantes ou plus, c’est : la lecture et le sens de
    ข้าวผัด, quatre sources par `u04-l4c` plus le relevé RID neuf de l’item 4 ;
    la lecture et le sens de หมู, trois sources à l’item 1 ; le fait que หมู
    entre dans les noms de plats et y désigne la viande, RID par ses dix ลูกคำ et
    Wiktionary par ses six termes dérivés ; et le fait que le RID lui-même nomme
    หมู dans sa définition de ข้าวผัด. La leçon enseigne donc la LECTURE d’une
    ligne, pas la fixité d’une expression. Voir l’incertitude 2.
  - **Portée exacte de ce que le produit demande à l’apprenant, énoncée en
    termes vérifiables sur les exercices.** Ce bloc est LU (exercices 1 et 2,
    page 4, carte de la page 9), ENTENDU (exercice 4, dialogue), CHOISI parmi
    des blocs affichés en entier (exercice 3), et sa transcription est écrite
    d’après la graphie affichée (exercice 5). **Il n’est jamais assemblé morceau
    par morceau, et jamais demandé à partir du français seul**, ni dans les six
    emplois ci-dessus ni au SRS :
    l’apprenant ne construit donc jamais une suite que la leçon ne peut attester
    qu’une fois. Une version antérieure de l’exercice 3 faisait précisément
    l’inverse en donnant ข้าวผัด et หมู comme deux blocs à assembler ; c’est
    corrigé, et le motif est au dossier.
  - `ipa` COMPOSÉE : aucune source consultée ne donne l’IPA de la suite entière.
    Les trois segments sont exactement ceux de `u04-l4c` item 1 et de l’item 1
    ci-dessus, assemblés avec le point de séparation syllabique employé par
    `u09-l9d` pour ร้านขายยา, composé de trois éléments lui aussi. Le champ est
    déclaré composé plutôt que présenté comme relevé.
  - VOLUBILIS corrobore les trois tons indépendamment de la composition :
    `\khāo_phat /mū` donne descendant, bas, montant, dans cet ordre, ce qui est
    exactement la valeur du champ `ton`.

### Item 6 : ข้าวผัดไก่ (BLOC, ข้าวผัด de l’item 4 et l’ingrédient publié en 4A)

- `thai` : ข้าวผัดไก่
- `codepoints` : U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 U+0E44 U+0E01
  U+0E48 (NFC)
- `ipa` : /kʰaːw˥˩.pʰat̚˨˩.kaj˨˩/ (COMPOSÉE, même réserve qu’à l’item 5)
- `ton` : khâao descendant ; phàt bas ; kài bas
- `longueur` : khâao longue ; phàt courte ; kài courte
- `fr` : riz sauté au poulet
- `transcription` : khâao·phàt·kài
- `registre` : neutre
- `note_fr` : la deuxième instance du bloc, et elle est là pour une raison
  précise : elle démontre que seule la FIN change. Mettez-la sous l’item 5 et
  vous voyez que les sept premières lettres sont identiques. C’est tout le geste
  de lecture de la page 4. Attention à une chose sur les trois dernières lettres,
  l’avertissement de 4A vaut : la première lettre écrite est ไ, mais la consonne
  est ก, et la voyelle s’écrit AVANT elle. Le ton bas de ไก่ vous est donné, la
  forme en ไ étant hors du tableau des tons depuis 4A. Aucun ingrédient nouveau
  ici : ไก่ est publié depuis `u04-l4a`.
- `sources` :
  - VOLUBILIS v26.2, `.xlsx`, ligne 31813, relevée le 2026-08-04 par le script
    versionné (THA « ข้าวผัดไก่ », ThaiRom `khāophat kai`, ThaiPhon
    `\khāo_phat _kai`, TYPE `n. exp.`, ENG « fried rice with chicken ; chicken
    fried rice », FRA « riz sauté au poulet [m] », domaine
    `CULINA (menu) ; (THA)`). Les marqueurs donnent descendant, bas, bas.
  - **Contrôles négatifs** : ข้าวผัดไก่ est `absent` du RID, requête du
    2026-08-04 par `rid-lookup.mjs` ; sa page en.wiktionary rend un HTTP 404, même
    date. Même portée d’affirmation qu’à l’item 5, et même incertitude 2.
  - `u04-l4a` item 2, relu dans le dépôt le 2026-08-04, qui publie ไก่ avec
    `/kaj˨˩/`, ton bas, longueur courte et transcription `kài`, sur quatre
    sources dont le RID et VOLUBILIS. Source interne, citée comme contrôle de
    cohérence : les champs de l’item 6 sont la concaténation exacte de ceux de
    `u04-l4c` item 1 et de `u04-l4a` item 2, sans arrondi ni reformulation.
  - VOLUBILIS v26.2, `.xlsx`, ligne 21437, relevée le 2026-08-04 pour ไก่ seul
    (ThaiRom `kai`, ThaiPhon `_kai`, TYPE n., FRA « poulet [m] ; poule [f] ;
    coq [m] », domaine `CULINA ; INSOLITE ; ORNITHO ; RID ; TOURIST ; ZOOL`).
    **Citation RÉANCRÉE sur le `.xlsx`** : `u04-l4a` citait la ligne 22395 du
    `.ods`. La ligne 21438, même graphie, porte un sens étiqueté `(vulg.)` qui
    n’est ni enseigné ni affiché.
  - Fréquence, signal indicatif : FrequencyWords `th_50k.txt`, exemplaire
    empreinté à l’item 1, relevé le 2026-08-04, ไก่ au rang 4644, 84 occurrences.

### Item 7 : บาท (réemploi, publié par `u03-l3c` item 3)

- `thai` : บาท
- `codepoints` : U+0E1A U+0E32 U+0E17 (NFC)
- `ipa` : /baːt̚˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : baht (la monnaie de la Thaïlande)
- `transcription` : bàat
- `registre` : neutre
- `note_fr` : réemployé sans aucune modification de champ, contrôle mécanique au
  dossier. Ce que 10C en fait est un repère VISUEL : sur les quatre lignes de
  notre carte, บาท ferme le bloc de droite et revient identique à chaque fois,
  et c’est donc lui qui vous dit où la ligne se coupe en deux. Vous n’avez pas
  besoin de le relire à chaque fois, vous avez besoin de le repérer. Son ton bas
  vous est donné, la syllabe se fermant sur une occlusive.
- `sources` :
  - `u03-l3c` item 3, relu dans le dépôt le 2026-08-04, qui publie cette graphie
    avec cinq sources et deux relevés séparés sur la valeur finale de ท. Les cinq
    champs comparés par `item-fields-check.mjs` sont repris à l’identique. Source
    interne, citée comme contrôle de cohérence.
  - RID 2554, entrée « บาท ๒ », relevée à NEUF le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs บาท` : quatre vedettes homographes,
    dont la deuxième seule est monétaire, valant cent สตางค์ ou quatre สลึง, avec
    l’abréviation officielle บ. Les vedettes « บาท ๑ », le pied, « บาท ๓ », le
    vers de poésie, et « บาท ๔ », une ancienne unité de temps, ne sont pas
    enseignées. Le relevé rend aussi la lecture entre crochets [บาด, บาดทะ-] de
    « บาท ๑ », séquence U+0E1A U+0E32 U+0E14 pour la première, où le ท final est
    réécrit ด : c’est la preuve de finale du type que `u09-l9a` a systématisée
    (faits cités par référence, définitions non reproduites).
  - VOLUBILIS v26.2, **`.xlsx`, ligne 4504**, relevée le 2026-08-04 (ThaiRom
    `bāt`, ThaiPhon `_bāt`, TYPE n., FRA « baht [m] ; ฿ »). **Citation RÉANCRÉE
    sur le `.xlsx`** : `u03-l3c` citait la ligne 4504 du `.ods` et `u07-l7e` la
    ligne 4656 du même `.ods`, deux valeurs différentes pour la même base, ce qui
    est en soi un motif de réancrage. Les lignes 4505 à 4507 portent les trois
    autres sens, non enseignés.
- Contrôle de réemploi : `item-fields-check.mjs`, exécuté le 2026-08-04, rend
  zéro écart sur cet item.

### Item 8 : ห้าสิบบาท (réemploi, publié par `u03-l3c` item 7)

- `thai` : ห้าสิบบาท
- `codepoints` : U+0E2B U+0E49 U+0E32 U+0E2A U+0E34 U+0E1A U+0E1A U+0E32
  U+0E17 (NFC)
- `ipa` : /haː˥˩.sip̚˨˩ baːt̚˨˩/
- `ton` : hâa descendant ; sìp bas ; bàat bas
- `longueur` : hâa longue ; sìp brève ; bàat longue
- `fr` : cinquante bahts
- `litteral` : cinq dix baht
- `transcription` : hâa·sìp bàat
- `registre` : neutre
- `note_fr` : réemployé sans aucune modification de champ, contrôle mécanique au
  dossier. C’est le bloc de prix du jour, et 10C le fait lire ÉCRIT EN CHIFFRES,
  ๕๐ บาท, là où 3C le faisait entendre. Deux tons se calculent et deux ne se
  calculent pas : ห้า est vivante, ห est haute et porte un ไม้โท, donc ton
  descendant par le tableau de 7A ; สิบ et บาท se ferment sur une occlusive et
  leurs tons vous sont donnés. Le piège d’ordre de 3C reste entier et sa carte
  `srs-u03-l3c-04` le porte déjà : สิบห้า vaut quinze, ห้าสิบ vaut cinquante.
- `sources` :
  - `u03-l3c` item 7, relu dans le dépôt le 2026-08-04, qui publie ce bloc avec
    cinq sources et un fait explicitement retiré après contre-audit. Les cinq
    champs comparés par `item-fields-check.mjs` sont repris à l’identique. Source
    interne, citée comme contrôle de cohérence.
  - VOLUBILIS v26.2, **`.xlsx`, ligne 15257**, relevée le 2026-08-04 par le
    script versionné (THA « ห้าสิบ », ThaiRom `hā-sip`, ThaiPhon `\hā_sip`, TYPE
    num., FRA « cinquante », domaine `NUM`). **Citation RÉANCRÉE sur le
    `.xlsx`** ; `u03-l3c` citait la même ligne 15257 du `.ods`, coïncidence de
    numéro vérifiée et non supposée. Le `\` puis le `_` donnent descendant puis
    bas.
  - **Contrôle négatif** : ห้าสิบ n’a aucune entrée au RID, requête du
    2026-08-04 par `rid-lookup.mjs`, qui rend `absent`, ce qui est attendu d’un
    nombre de formation régulière et ce que `u03-l3c` avait déjà consigné.
  - Lecture du chiffre ๕๐ : `u03-l3b` item 8 publie les dix chiffres thaïs en
    reconnaissance, avec l’Unicode Standard comme autorité d’encodage et dix
    entrées th.wiktionary pour les lectures. Séquence de ๕๐ recalculée le
    2026-08-04 : U+0E55 U+0E50, deux caractères, catégorie générale `Nd`,
    valeurs numériques 5 et 0.
- Contrôle de réemploi : `item-fields-check.mjs`, exécuté le 2026-08-04, rend
  zéro écart sur cet item.

### Graphies employées à l’écran sans être des items

Elles sont affichées, lues et traduites, mais n’ouvrent aucune carte de
vocabulaire, parce qu’une carte existe déjà ailleurs ou parce qu’elles ne sont
pas enseignées. Toutes sont des items publiés du parcours, relus dans le dépôt le
2026-08-04.

- **ข้าวผัดไข่**, ligne 3 de la carte. Bloc de même forme que les items 5 et 6,
  attesté par VOLUBILIS `.xlsx` ligne 31817 (ThaiPhon `\khāo_phat _khai`, FRA
  « riz sauté aux oeufs [m] », domaine `CULINA`), `absent` du RID et sans page
  Wiktionary, mêmes contrôles et même date que l’item 5. Son ingrédient ไข่ est
  publié par `u04-l4a` item 3, `/kʰaj˨˩/`, ton bas, transcription `khài`.
  Transcription du bloc : `khâao·phàt·khài`. **Il n’est PAS publié comme item**,
  pour ne pas faire trois cartes d’un même patron.
- **น้ำเปล่า**, ligne 4 de la carte, item publié de `u04-l4c` item 2,
  transcription `náam·plào`, VOLUBILIS `.xlsx` ligne 59305. Elle est sur la carte
  pour une raison de lecture : c’est la seule ligne qui ne commence PAS par
  ข้าวผัด, et sans elle l’apprenant pourrait croire que toute ligne commence
  ainsi.
- **สี่สิบบาท**, prix de la ligne 3, bloc publié par `u07-l7e` item 13,
  transcription `sìi·sìp bàat`, et **สิบห้าบาท**, prix de la ligne 4, item publié
  de `u03-l3c` item 8, transcription `sìp·hâa bàat`. Aucune carte nouvelle : les
  cartes de 3C et de 7E les portent.
- **ไก่** et **ไข่**, items publiés de `u04-l4a`, lus à l’intérieur des blocs et
  jamais réenseignés.
- **จาน**, item publié de `u04-l4c` item 3, transcription `jaan`, cité à la
  page 4 pour dire qu’il ne figure PAS sur notre carte, et
  **ขอข้าวผัดสองจานหน่อยครับ**, bloc publié par la même leçon, cité au même
  endroit comme la phrase où l’apprenant a déjà vu จาน employé. Aucune carte
  nouvelle, aucune des deux n’est demandée en production.
- **ดู**, item publié de `u01-l1b` item 10, transcription `douu`, republié par
  `u07-l7d` item 3, cité dans la `note_fr` de l’item 1 comme le mot par lequel
  l’apprenant a appris la voyelle ◌ู. Aucune carte nouvelle.
- **อาการ**, item publié de `u09-l9a` item 6, cité à la page 7 comme point de
  comparaison de la finale ร. Aucune carte nouvelle.
- **หมา** (`u01-l1d`) et **หมอ** (`u09-l9a`), cités à la page 5 comme les deux
  autres membres de la série à ห muet. Aucune carte nouvelle.
- **ร้านอาหาร** et **รายการอาหาร**, cités à la note culturelle, en
  reconnaissance seule, jamais demandés en production. Voir les sources de la
  note.

## Exercices

Les cinq mécaniques canoniques sont employées, et chacune mesure une chose
distincte. Le motif de chaque choix est écrit, et aucun exercice n’est là pour
remplir un format.

### Exercice 1 : que dit cette ligne ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : la lecture d’une ligne de carte ENTIÈRE, les deux blocs à la
  fois. La ligne est montrée sans audio préalable. **La construction des options
  est ce qui fait la mesure** : à chaque tirage, les quatre options sont bâties
  sur le même moule, une seule étant juste sur les deux blocs.
  1. bon plat et bon prix, c’est la réponse ;
  2. bon plat, mauvais prix ;
  3. mauvais plat, bon prix ;
  4. mauvais plat et mauvais prix.
     Lire un seul des deux blocs ne peut donc jamais départager : il reste toujours
     deux options compatibles avec ce qu’on a lu.
- Consigne : « Lisez la ligne, puis dites ce que c’est et combien ça coûte. »
- Options : quatre, chacune écrite en français, plat puis prix en chiffres
  arabes. L’ordre des options est aléatoire et la couleur n’est jamais le seul
  signal.
- Tirages : 12 au total, ordre aléatoire. Ils épuisent exactement la matrice de
  quatre plats par trois prix. La position de la bonne réponse est **strictement
  équilibrée, 3 fois par position**.
  1. ข้าวผัดหมู ๕๐ บาท ; plat concurrent ข้าวผัดไก่, prix concurrent ๑๕.
  2. ข้าวผัดหมู ๔๐ บาท ; plat concurrent ข้าวผัดไข่, prix concurrent ๕๐.
  3. ข้าวผัดหมู ๑๕ บาท ; plat concurrent น้ำเปล่า, prix concurrent ๔๐.
  4. ข้าวผัดไก่ ๕๐ บาท ; plat concurrent ข้าวผัดหมู, prix concurrent ๔๐.
  5. ข้าวผัดไก่ ๔๐ บาท ; plat concurrent ข้าวผัดไข่, prix concurrent ๑๕.
  6. ข้าวผัดไก่ ๑๕ บาท ; plat concurrent ข้าวผัดหมู, prix concurrent ๕๐.
  7. ข้าวผัดไข่ ๕๐ บาท ; plat concurrent ข้าวผัดไก่, prix concurrent ๑๕.
  8. ข้าวผัดไข่ ๔๐ บาท ; plat concurrent น้ำเปล่า, prix concurrent ๕๐.
  9. ข้าวผัดไข่ ๑๕ บาท ; plat concurrent ข้าวผัดหมู, prix concurrent ๔๐.
  10. น้ำเปล่า ๕๐ บาท ; plat concurrent ข้าวผัดไก่, prix concurrent ๑๕.
  11. น้ำเปล่า ๔๐ บาท ; plat concurrent ข้าวผัดหมู, prix concurrent ๕๐.
  12. น้ำเปล่า ๑๕ บาท ; plat concurrent ข้าวผัดไข่, prix concurrent ๔๐.
- Seuil de réussite : 10 sur 12.
- **Planchers mesurés.** Une réponse constante en POSITION vaut exactement
  **3 sur 12, soit 25 %**, la bonne position étant équilibrée par construction.
  Une réponse constante en CONTENU est impossible, les quatre options changeant à
  chaque tirage. La meilleure stratégie partielle imaginable est de ne lire qu’un
  seul bloc : elle laisse deux options compatibles, donc **une chance sur deux
  par tirage**, et la probabilité d’atteindre 10 sur 12 avec une pièce non
  truquée est de 79 sur 4096, soit **1,9 %**. Aucun de ces trois chiffres
  n’approche le seuil.
- **Note de construction, à ne pas perdre** : les tirages 10 à 12 mettent un prix
  sur น้ำเปล่า qui n’est pas celui de la carte de la page 9. C’est délibéré et
  c’est dit à l’écran : cet exercice n’est pas la carte, ce sont douze lignes
  d’entraînement, et si les prix y étaient ceux de la carte, un apprenant qui
  aurait mémorisé la carte répondrait sans lire.
- Feedback correct : « Oui. Deux blocs, deux réponses, et il fallait les deux. »
- Feedback correct, tirages 10 à 12 : « Bien vu. Cette ligne ne commence pas par
  ข้าวผัด, et son prix n’est pas celui de la carte : vous avez lu au lieu de
  vous souvenir. »
- Feedback incorrect, bon plat et mauvais prix : « Le nom est bon. Reprenez à
  droite : lisez le chiffre, puis vérifiez que บาท le suit bien. »
- Feedback incorrect, bon prix et mauvais plat : « Le prix est bon. Reprenez à
  gauche, et regardez surtout la FIN du nom : c’est là que deux lignes voisines
  se séparent. » Aucune pénalité, la ligne est ensuite jouée et sa transcription
  affichée.
- Pièges connus : s’arrêter à ข้าวผัด et répondre au premier plat venu, l’erreur
  centrale de la leçon ; confondre ๕๐ et ๑๕, piège d’ordre déjà installé par 3C ;
  confondre ไก่ et ไข่, qui ne diffèrent que par leur deuxième lettre, ก contre ข,
  piège hérité de 4A qui les publie comme jumeaux sonores ; croire que น้ำเปล่า
  est un plat parce qu’il est écrit dans la même colonne ; chercher จาน sur la
  ligne alors que la carte n’en porte pas.

### Exercice 2 : appariez la ligne et ce qu’elle dit (`association`)

- Mécanique : `association`
- Ce qu’il mesure : la même compétence que l’exercice 1, par un chemin qui
  interdit toute réponse répétée, et sur un jeu volontairement plus serré. Six
  lignes ne portent que TROIS plats et DEUX prix : chaque plat y apparaît deux
  fois à des prix différents, et chaque prix trois fois sur des plats différents.
  Ni la lecture du seul plat ni celle du seul prix ne peut donc former la
  bijection.
- Consigne : « Chaque ligne de gauche dit un plat et un prix. Associez-la à ce
  qu’elle dit. Touchez une ligne, puis sa traduction : aucun glisser-déposer
  n’est nécessaire. »
- Interaction : sélection au clic ou au clavier des deux membres d’une paire,
  jamais de glisser-déposer obligatoire. Les cartes de gauche affichent la ligne
  thaïe SEULE, en grand spécimen, sans transcription et sans audio avant la
  réponse.
- Paires à former : 6, bijection stricte.
  1. ข้าวผัดหมู ๕๐ บาท ↔ riz sauté au porc, 50 bahts
  2. ข้าวผัดหมู ๔๐ บาท ↔ riz sauté au porc, 40 bahts
  3. ข้าวผัดไก่ ๕๐ บาท ↔ riz sauté au poulet, 50 bahts
  4. ข้าวผัดไก่ ๔๐ บาท ↔ riz sauté au poulet, 40 bahts
  5. ข้าวผัดไข่ ๕๐ บาท ↔ riz sauté aux œufs, 50 bahts
  6. ข้าวผัดไข่ ๔๐ บาท ↔ riz sauté aux œufs, 40 bahts
- Seuil de réussite : 6 sur 6. Les seuils intermédiaires n’existent pas dans une
  bijection de six : cinq paires correctes en imposent une sixième.
- **Planchers mesurés.** Une réponse constante est structurellement impossible,
  chaque carte de droite n’étant utilisable qu’une fois. Un appariement
  entièrement au hasard réussit une fois sur 720, soit **0,14 %**. Mais
  l’ignorance totale n’est pas l’hypothèse à écarter, ce sont les stratégies
  PARTIELLES, et elles se calculent exactement ici. Lire seulement le PLAT range
  les six lignes en trois groupes de deux et laisse 2 × 2 × 2, soit **huit
  bijections compatibles, une chance sur huit, 12,5 %**. Lire seulement le PRIX
  range les six lignes en deux groupes de trois et laisse 3! × 3!, soit
  **trente-six bijections compatibles, une chance sur trente-six, 2,8 %**. Le
  chiffre à retenir est donc **12,5 %**, le plus favorable des trois, et il reste
  très en dessous d’un seuil qui exige les six paires.
- **Note de construction** : ces six lignes ne sont pas la carte de la page 9. Le
  même plat y porte volontairement deux prix, ce que l’écran dit à l’apprenant,
  précisément pour que la lecture du prix soit obligatoire.
- Feedback correct : « Oui. Trois plats, deux prix, six lignes : il fallait lire
  les deux côtés. »
- Feedback incorrect : « Prenez une ligne de gauche et coupez-la en deux à
  l’endroit où les chiffres commencent. Lisez d’abord la fin du nom, puis le
  nombre. » Aucune pénalité.
- Pièges connus : apparier les deux lignes d’un même plat dans le désordre, ce
  qui est l’erreur exacte que l’exercice cherche ; lire ๔๐ comme quatorze ou ๕๐
  comme quinze, confusion d’ordre héritée de 3C ; confondre ไก่ et ไข่ ; se fier
  à la LONGUEUR de la ligne à l’écran, qui est la même pour les six.

### Exercice 3 : reconstruisez la ligne (`word_order`)

- Mécanique : `word_order`
- Ce qu’il mesure : la découpe d’une de nos lignes en deux blocs et l’ordre dans
  lequel ils se posent, dans le sens FRANÇAIS vers THAÏ, que ni l’exercice 1, qui
  va du thaï au français, ni l’exercice 4, qui part de l’écoute, ne mesurent.
  Choisir le bon nom de plat oblige à en lire la FIN, puisque deux noms proposés
  ne diffèrent que par leur dernière syllabe. C’est aussi pourquoi il porte des
  blocs à RETIRER : sans eux, la seule question serait celle de l’ordre, et
  l’apprenant n’aurait pas à décider ce qui appartient à la ligne.
- **Ce que cet exercice ne fait PAS faire, et c’est une contrainte de
  sourçage.** Les noms de plats sont proposés **entiers et insécables** :
  ข้าวผัดหมู est un seul bloc, jamais ข้าวผัด plus หมู. L’apprenant CHOISIT un
  bloc affiché, il n’en fabrique aucun. C’est la condition qui rend l’exercice
  compatible avec l’attestation mono-sourcée des items 5 et 6, déclarée à
  l’incertitude 2 : la leçon fait lire et reconnaître ces suites, elle ne fait
  jamais composer une suite qu’elle ne peut attester qu’une fois.
- Consigne : « Voici des blocs mélangés. Composez la ligne demandée en les
  remettant dans l’ordre. Les blocs qui ne servent pas doivent être retirés. »
- Interaction : chaque bloc est une cible d’au moins 44 par 44 points, déplaçable
  et retirable par une ACTION EXPLICITE au clic ou au clavier, jamais par un
  glisser-déposer obligatoire, conformément à la règle de mécanique du produit.
  L’ordre d’affichage des blocs est aléatoire à chaque présentation. Un bloc de
  nom de plat ne peut être ni coupé ni fusionné : il se prend ou se retire d’un
  seul geste.
- Tirages : 6, ordre aléatoire. La cible est énoncée en français, les blocs sont
  écrits en thaï, et chaque cible compte exactement trois blocs.
  1. Cible « riz sauté au porc, 50 bahts », ข้าวผัดหมู ๕๐ บาท. Blocs proposés :
     บาท · ๕๐ · ข้าวผัดหมู · ข้าวผัดไก่. Un bloc à retirer, ข้าวผัดไก่.
  2. Cible « riz sauté au poulet, 40 bahts », ข้าวผัดไก่ ๔๐ บาท. Blocs :
     ข้าวผัดไข่ · ๔๐ · บาท · ข้าวผัดไก่. Un bloc à retirer, ข้าวผัดไข่.
  3. Cible « riz sauté aux œufs, 50 bahts », ข้าวผัดไข่ ๕๐ บาท. Blocs : ๕๐ ·
     ข้าวผัดไข่ · บาท · ๑๕. Un bloc à retirer, et c’est un NOMBRE, ๑๕.
  4. Cible « eau plate, 15 bahts », น้ำเปล่า ๑๕ บาท. Blocs : บาท · น้ำเปล่า ·
     ๑๕ · ข้าวผัดหมู · ๔๐. Deux blocs à retirer, et la ligne demandée ne
     commence pas par ข้าวผัด.
  5. Cible « riz sauté au porc, 40 bahts », ข้าวผัดหมู ๔๐ บาท. Blocs :
     ข้าวผัดหมู · ข้าวผัดไก่ · ๔๐ · ๕๐ · บาท. Deux blocs à retirer, un plat et
     un nombre.
  6. Cible « riz sauté au poulet, 15 bahts », ข้าวผัดไก่ ๑๕ บาท. Blocs : ๑๕ ·
     ข้าวผัดไก่ · บาท · ข้าวผัดหมู · ๕๐. Deux blocs à retirer, un plat et un
     nombre.
- Seuil de réussite : 5 sur 6.
- **Planchers RECALCULÉS sur ces six tirages**, et non repris de la version
  précédente de l’exercice. La stratégie constante la plus évidente, « garder les
  blocs dans l’ordre affiché et ne rien retirer », vaut **0 sur 6** : l’ordre
  d’affichage est aléatoire et chaque tirage porte au moins un bloc à retirer.
  Au hasard complet, il faut choisir trois blocs ET les ordonner : 4 × 3 × 2 = 24
  possibilités aux tirages 1, 2 et 3, soit **4,2 %** par tirage ; 5 × 4 × 3 = 60
  aux tirages 4, 5 et 6, soit **1,7 %**. Reste la stratégie la plus dangereuse,
  celle de la FORME : poser un nom de plat d’abord, บาท en dernier, un nombre
  juste avant. **Elle a été mesurée plutôt que supposée inoffensive.** Elle ne
  tranche jamais seule, parce que chaque tirage offre au moins deux candidats à
  une place : deux noms de plats aux tirages 1, 2, 4, 5 et 6, deux nombres aux
  tirages 3, 4, 5 et 6. Elle vaut donc une chance sur deux aux tirages 1, 2 et 3,
  et une sur quatre aux tirages 4, 5 et 6, ce qui donne une espérance de
  **2,25 bonnes réponses sur 6** et une probabilité d’atteindre 5 sur 6 de
  **2,5 %**. Le calcul complet est au dossier.
- Feedback correct : « Oui. Le nom d’abord, le nombre ensuite, บาท pour fermer. »
- Feedback correct, tirages 4 à 6 : « Bien vu, et le plus dur était de retirer.
  Un bloc juste n’a pas sa place partout. »
- Feedback incorrect, bloc en trop conservé : « Relisez votre ligne à voix
  haute. Un bloc y est de trop : lequel ne dit ni ce que c’est, ni combien ça
  coûte ? »
- Feedback incorrect, ordre inversé : « Sur nos lignes, บาท ferme la ligne. Le
  nombre vient juste avant lui, et le nom du plat ouvre. » Aucune pénalité, la
  ligne correcte est ensuite affichée et jouée.
- Pièges connus : poser le nombre avant le nom du plat, ordre du français
  « quarante bahts de riz sauté » ; prendre le mauvais nom de plat parce que ses
  sept premières lettres sont identiques à celles du bon, huit quand les deux
  candidats sont ceux qui commencent par ไ, l’erreur exacte que ce tri cherche ;
  garder les deux noms de plats en pensant que la ligne les
  contient tous les deux ; retirer บาท en le prenant pour un mot en trop ; au
  tirage 4, chercher un ข้าวผัด parce que les trois tirages précédents en avaient
  un.

### Exercice 4 : quelle ligne vient d’être lue ? (`listening`)

- Mécanique : `listening`
- Ce qu’il mesure : le lien entre le bloc ENTENDU et le bloc ÉCRIT, dans le sens
  inverse de l’exercice 1. C’est la compétence réelle de qui commande à voix
  haute ce qu’il a lu, ou vérifie sur la carte ce qu’il vient d’entendre. Les
  options sont ici des lignes ÉCRITES EN THAÏ, jamais des traductions : un
  apprenant qui ne lirait pas ne pourrait pas répondre.
- Consigne : « Écoutez la ligne, puis touchez celle qui est écrite pareil. »
- Options : quatre lignes écrites en thaï, bâties sur le même moule qu’à
  l’exercice 1, bon plat et bon prix, bon plat et mauvais prix, mauvais plat et
  bon prix, mauvais plat et mauvais prix. Ordre aléatoire.
- Tirages : 12 au total, mêmes cibles que l’exercice 1 et mêmes concurrents, la
  position de la bonne réponse étant **strictement équilibrée, 3 fois par
  position**. Chaque ligne est lue par la MÊME voix, contrainte de production
  consignée à l’incertitude 6.
- Seuil de réussite : 10 sur 12.
- **Planchers mesurés.** Une réponse constante en position vaut **3 sur 12, soit
  25 %**. N’entendre que le plat, ou n’entendre que le prix, laisse deux options
  compatibles, donc **une chance sur deux par tirage**, et la probabilité
  d’atteindre 10 sur 12 est de 79 sur 4096, soit **1,9 %**. Le seuil est
  volontairement placé à 10 et non à 9 : à 9 sur 12, la même stratégie partielle
  réussirait dans 299 cas sur 4096, soit 7,3 %, ce qui est trop.
- Feedback correct : « Oui. Vous avez entendu deux choses et vous avez retrouvé
  les deux à l’écrit. »
- Feedback incorrect, bon plat et mauvais prix : « Le nom est bon. Réécoutez la
  fin : le nombre, puis บาท. » Réécoute ralentie proposée.
- Feedback incorrect, bon prix et mauvais plat : « Le prix est bon. Réécoutez le
  début, et surtout la dernière syllabe du nom. » Réécoute ralentie proposée,
  aucune pénalité.
- Pièges connus : entendre `mǒuu` et cocher ไก่ parce que les deux lignes se
  ressemblent à l’œil ; confondre `hâa·sìp` et `sìp·hâa` à l’oreille, le contraste
  d’ordre de 3C ; confondre `kài` et `khài` à l’écoute, jumeaux sonores de 4A qui
  ne diffèrent que par le souffle ; répondre au souvenir de l’exercice 1 plutôt
  qu’à l’écoute, raison pour laquelle l’ordre des douze tirages est de nouveau
  tiré au sort et les options réordonnées.

### Exercice 5 : écrivez ce que vous lisez (`recall`)

- Mécanique : `recall`
- Ce qu’il mesure : la production, sans plancher de hasard et sans aide auditive.
  L’apprenant voit la graphie thaïe, sans l’entendre, et doit produire la
  transcription complète, accent de ton compris.
- Consigne : « Lisez, puis écrivez en transcription Thaïnaute, accent de ton
  compris. Vous n’entendrez le mot qu’après avoir répondu. »
- Politique de saisie : alphabet latin uniquement, casse ignorée, espaces de
  début et de fin ignorés. Comme en `u07-l7a`, `u08-l8a` et `u09-l9a`, l’accent
  de ton est OBLIGATOIRE et non tolérant : il fait partie de ce qui est mesuré.
  Il se pose sur la PREMIÈRE lettre du noyau vocalique, conformément à
  l’amendement v1.1 des conventions, ce qui donne `mǒuu`, `hǎan`, `khâao` et
  `phàt`. Le séparateur de syllabes `·` est facultatif partout ; l’espace entre
  le nombre et บาท au tirage 8 est en revanche exigé, la transcription publiée
  par `u03-l3c` l’écrivant ainsi.
- Tirages et réponses : 8, les huit items du jour. Les numéros sont des
  identifiants, pas un ordre de présentation : l’ordre affiché est aléatoire.
  1. หมู : réponse `mǒuu`.
  2. ราคา : réponse `raa·khaa` ; variante acceptée `raakhaa`.
  3. อาหาร : réponse `aa·hǎan` ; variante acceptée `aahǎan`.
  4. ข้าวผัด : réponse `khâao·phàt` ; variante acceptée `khâaophàt`.
  5. ข้าวผัดหมู : réponse `khâao·phàt·mǒuu` ; variante acceptée `khâaophàtmǒuu`.
  6. ข้าวผัดไก่ : réponse `khâao·phàt·kài` ; variante acceptée `khâaophàtkài`.
  7. บาท : réponse `bàat`.
  8. ห้าสิบบาท : réponse `hâa·sìp bàat` ; variante acceptée `hâasìp bàat`.
- Seuil de réussite : 6 sur 8.
- **Plancher mesuré : aucun.** La saisie est libre, il n’y a pas d’option à
  deviner. Une réponse constante, quelle qu’elle soit, vaut au mieux 1 sur 8, et
  seulement si elle coïncide exactement avec l’une des huit réponses ; deux des
  huit réponses étant des préfixes d’autres, aucune chaîne unique ne peut valoir
  plus de 1.
- Feedback correct : « C’est ça. Vous l’avez lu sans l’entendre. »
- Feedback incorrect, accent absent : « L’accent manque, et il fait partie de la
  réponse. Rien pour le moyen, `à` pour le bas, `â` pour le descendant, `á` pour
  le haut, `ǎ` pour le montant. »
- Feedback incorrect, `h` écrit dans `mǒuu` : « Le ห de ce mot ne se prononce
  pas. Regardez la lettre juste derrière lui : c’est un ม, donc le ห se tait. »
- Feedback incorrect, `h` oublié dans `aa·hǎan` : « Ici le ห se prononce.
  Derrière lui il y a une voyelle, pas une des six lettres du repère de 5A. »
  Le mot est ensuite joué et la comparaison A/B est proposée.
- Pièges connus : écrire `hmǒuu` ou `mǔu` pour หมู, en transcrivant la LETTRE
  plutôt que le son ; écrire `aa·kǎan` pour อาหาร, en confondant avec อาการ de
  9A ; écrire `aa·hǎar` ou `aa·hǎal`, en donnant au ร final sa valeur d’initiale,
  erreur exactement attendue après 9A ; oublier le doublement de `ou` dans
  `mǒuu`, la voyelle étant longue ; écrire `bàad` pour บาท, en transcrivant la
  lettre ท plutôt que le son de fin ; poser l’accent sur la mauvaise lettre du
  noyau, `moǔu` au lieu de `mǒuu`.

## Dialogue

Micro-situation : lire la carte, puis demander confirmation du prix à voix
haute. **Le dialogue est court par décision, quatre répliques**, et il ne
rejoue PAS la commande complète : `u04-l4c` et `u04-l4e` la portent déjà, et
l’ajouter ici aurait demandé une seconde liberté de composition pour un gain
pédagogique nul. Une seule ossature est modifiée, et c’est dit au dossier.

| Locuteur | Thaï                 | Transcription                  | Français                              |
| -------- | -------------------- | ------------------------------ | ------------------------------------- |
| Client   | ขอโทษครับ            | khǎww·thôot khráp              | Pardon.                               |
| Client   | ข้าวผัดหมูเท่าไรครับ | khâao·phàt·mǒuu thâo·rai khráp | Le riz sauté au porc, c’est combien ? |
| Serveuse | ห้าสิบบาทค่ะ         | hâa·sìp bàat khâ               | Cinquante bahts.                      |
| Client   | ขอบคุณครับ           | khàwwp·khoun khráp             | Merci.                                |

Une remarque de lecture, à faire remarquer plutôt qu’à enseigner : la réponse de
la serveuse est exactement la ligne de la carte, moins le nom du plat. Ce que
l’apprenant a lu à l’écrit, il vient de l’entendre à l’oral, dans le même ordre
et avec les mêmes blocs.

## SRS

- `srs-u10-l10c-01` : lire une ligne de carte, plat ET prix, sans audio. Critère
  de maîtrise : 10 lignes sur 12, sur deux sessions espacées, le tirage
  comportant obligatoirement au moins trois plats différents, au moins trois prix
  différents, et au moins une ligne qui ne commence PAS par ข้าวผัด. **Contrainte
  de tirage, et elle est bloquante** : les quatre options d’une ligne sont
  toujours construites sur le moule de l’exercice 1, faute de quoi la carte
  cesserait de mesurer les deux blocs. Cette carte est NOUVELLE au sens strict :
  aucune carte existante du parcours ne mesure la lecture simultanée de deux
  blocs sur une même ligne écrite. `srs-u03-l3c-05` mesure กี่บาท, une question,
  pas une ligne de carte.
- `srs-u10-l10c-02` : le ห écrit, prononcé ou muet, à la LECTURE. Critère :
  7 mots sur 8, sur deux sessions espacées, le tirage comportant obligatoirement
  au moins trois mots où le ห se prononce et au moins trois où il se tait.
  **Motif de création, vérifié plutôt qu’affirmé** : le dépôt compte 243 cartes
  SRS au 2026-08-04, relevé par
  `grep -rn "^- \`srs-" content/authoring/unite-0*/lecon-*.md`. Les cartes dont
l’intitulé porte un ห ont été relues une par une ; `srs-u05-l5a-01`mesure le`/h/`initial à l’ÉCOUTE et`srs-u05-l5a-02` sa présence en PRODUCTION ÉCRITE,
  aucune ne mesure la décision de lecture devant un ห écrit. Réserve de méthode
  déclarée : ce contrôle a porté sur la ligne d’ouverture de chaque carte, pas
  sur son corps. Voir l’arbitrage 4.
- `srs-u10-l10c-03` : vocabulaire nouveau du jour, หมู, ราคา et อาหาร, et eux
  seuls. Critère : reconnaissance à l’écoute et à la lecture, 2 réussites
  espacées. La production à partir du français n’est PAS exigée en 10C.
- `srs-u10-l10c-04` : les blocs de plat ข้าวผัดหมู et ข้าวผัดไก่, en
  RECONNAISSANCE seule. Critère : reconnaître le bloc lu et dire l’ingrédient,
  2 réussites espacées. **Ces deux blocs ne sont jamais à former ni à écrire :
  ils sont lus, entendus, ou choisis entiers parmi des blocs affichés**, jamais
  assemblés à partir de leurs morceaux ni produits de mémoire à partir du
  français. La contrainte vaut pour cette carte comme pour les cinq exercices,
  et elle est directement liée à leur attestation mono-sourcée, voir
  l’incertitude 2.
- **Entretien des tons : aucune carte nouvelle, et c’est une décision.** Le fil
  des tons de `CONVENTIONS.md` demande un ENTRETIEN par le SRS à partir de
  l’unité 8, pas une carte de plus par leçon, et `u09-l9a` a signalé le
  recouvrement pour la cinquième fois sans qu’un arbitrage soit visible dans le
  dépôt au 2026-08-04. 10C ne crée donc pas de carte de ton ; elle APPORTE des
  tirages à la carte existante `srs-u04-l4a-06`, montant contre haut : les
  tirages หมู et la deuxième syllabe de อาหาร du côté montant, et ร้าน du côté
  haut. Une leçon ne modifie pas la carte d’une autre : c’est une DEMANDE
  consignée, à exécuter à la consolidation de l’unité 10. Voir l’arbitrage 3.
- Hors périmètre, parce que déjà porté par une carte existante qu’il ne faut ni
  dupliquer ni affaiblir :
  - ข้าวผัด, น้ำเปล่า et จาน gardent leurs cartes de `u04-l4c` ; ไก่ et ไข่
    celles de `u04-l4a` ; ผัด celle de `u05-l5a` ; บาท celle de `srs-u03-l3c-03` ;
    les chiffres thaïs celles de `u03-l3b` ; สี่สิบบาท celle de `u07-l7e` ;
  - le contraste d’ordre สิบห้า contre ห้าสิบ reste porté par `srs-u03-l3c-04`.
    10C le fait lire en chiffres thaïs et non en lettres, ce qui est une
    variation d’affichage et non une compétence nouvelle : aucune carte n’est
    créée, et un tirage en chiffres est DEMANDÉ à la carte existante ;
  - ข้าวผัดไข่, ร้านอาหาร et รายการอาหาร n’ouvrent aucune carte. Ce sont des
    spécimens d’écran, affichés avec leur traduction. ร้านอาหาร et รายการอาหาร
    ne sont jamais demandés, ni en production ni en reconnaissance. ข้าวผัดไข่
    est lu aux exercices 1, 2 et 4, et choisi ENTIER parmi des blocs affichés à
    l’exercice 3 ; il n’est jamais formé ni écrit, exactement comme les blocs des
    items 5 et 6, et pour la même raison d’attestation ;
  - aucune carte ne demande de CALCULER le ton d’une syllabe fermée par une
    occlusive, ni celui d’un mot à consonne de tête, ni celui d’une forme en ไ,
    ◌ำ ou เ◌า. Les tons de ผัด, บาท, สิบ, หมู, ไก่, ไข่, น้ำ et เปล่า sont
    DONNÉS, et aucune carte ne demande de les retrouver par une règle.
    **Distinction à ne pas perdre, et l’écran la contredirait sans elle** :
    l’exercice 5 fait bel et bien écrire ces tons, accent compris, à partir de la
    graphie et sans audio. C’est une RESTITUTION de ce qui a été donné, pas un
    calcul, et c’est la seule chose que le parcours peut demander tant que les
    deux règles manquantes ne sont pas enseignées. Voir l’arbitrage 2.

## Note culturelle

Le mot อาหาร est un mot qui en fabrique d’autres, et deux de ses composés vous
seront utiles avant même que vous les appreniez.

Le premier est ร้านอาหาร. Vous savez déjà lire ร้าน depuis ร้านขายยา, appris en
9D : c’est la boutique. Collez-lui อาหาร et vous avez le mot qui désigne un
restaurant. Le second est รายการอาหาร, qui désigne la carte elle-même. Regardez
les deux : le mot que vous venez d’apprendre est écrit en entier dans chacun.
Vous ne les avez jamais appris, et vous en lisez déjà un morceau.

อาหาร lui-même vient de loin. Le dictionnaire lui donne une origine pali et
sanskrite, et Wiktionary remonte au sanskrit आहาร. C’est le même type de trajet
que celui de โรค et de อาการ, appris en 9A, et que celui de แพทย์ : une part du
vocabulaire savant du thaï est arrivée par cette route.

- Sources du fait « ร้านอาหาร désigne un restaurant », consultées le 2026-08-04 :
  - VOLUBILIS v26.2, `.xlsx`, ligne 81049, relevée par le script versionné (THA
    « ร้านอาหาร », ThaiRom `rān āhān`, ThaiPhon `¯rān -ā/hān`, TYPE `n. exp.`,
    ENG « restaurant ; foodshop ; eatery (Am) ; eating place ; canteen », FRA
    « restaurant [m] ; resto [m] (fam.) ; restau [m] (fam.) ; taverne [f] »,
    domaine `CULINA ; SURIN ; TOURIST ; (Covid-19)`, relevé intégral et non
    tronqué). Les marqueurs donnent haut, moyen, montant.
  - en.wiktionary, entrée « อาหาร », consultée en rendu le même jour : ร้านอาหาร
    figure dans ses termes dérivés, glosé « restaurant », avec la romanisation
    `ráan-aa-hǎan`. Autorité indépendante de VOLUBILIS pour le sens comme pour
    les trois tons.
  - **Contrôle négatif consigné** : ร้านอาหาร n’a AUCUNE entrée au RID, requête
    du 2026-08-04 par `rid-lookup.mjs`, qui rend `absent`. C’est attendu d’une
    expression composée transparente, et c’est le même traitement que
    `u04-l4c` a réservé à น้ำเปล่า.
- Sources du fait « รายการอาหาร désigne la carte », mêmes date et méthode :
  - VOLUBILIS v26.2, `.xlsx`, ligne 80489 (ThaiRom `rāikān āhān`, ThaiPhon
    `-rāi-kān -ā/hān`, TYPE `n. exp.`, ENG « menu ; bill of fare ; list of
    food », FRA « menu [m] ; carte [f] », domaine `CULINA ; HOTEL ; TOURIST`).
  - en.wiktionary, entrée « อาหาร », termes dérivés, où รายการอาหาร est glosé
    « menu ».
  - **Contrôle négatif** : รายการอาหาร est `absent` du RID, même requête, même
    date.
- Sources de l’origine pali et sanskrite de อาหาร, mêmes date et méthode :
  - RID 2554, entrée « อาหาร », qui note l’origine par (ป., ส.) à ses deux sens.
  - en.wiktionary, entrée « อาหาร », section d’étymologie, qui donne le sanskrit
    आहार (`āhāra`) et le pali `āhāra`, avec des apparentés en khmer, lao et
    birman.
- Ce qui n’est PAS affirmé : la note ne dit rien de la fréquence de ร้านอาหาร,
  de รายการอาหาร ni de อาหาร lui-même, ni en absolu ni les uns par rapport aux
  autres, aucun relevé recevable ne portant sur ce critère ; **elle ne dit pas
  non plus que อาหาร « sert partout », formule d’ubiquité qu’une version
  antérieure de ce fichier employait sans appui** et que le seul signal
  disponible, un corpus de sous-titres, ne peut pas porter ; elle ne dit rien de
  la façon dont les restaurants sont signalés dans la rue, ni de la mise en page
  des cartes, faits qu’aucune source de la politique du projet ne peut porter ;
  elle ne traduit pas อาหารว่าง, mot dérivé
  que le RID enregistre mais qu’aucune seconde source consultée ne glose ici ;
  et elle n’enseigne ni ร้าน seul, jamais publié comme item, ni รายการ, jamais
  rencontré.

## Dossier de production

- Acteur de génération : Claude Opus 5 (`claude-opus-5[1m]`), rédaction originale
  le 2026-08-04. Aucune formulation reprise d’une source ; les définitions
  thaïes, anglaises et françaises citées dans les champs `sources` le sont à
  titre de preuve de consultation, jamais comme texte de leçon.
- Méthode de vérification : chaque fait linguistique est vérifié contre au moins
  deux autorités indépendantes réellement consultées le 2026-08-04, méthode
  d’accès consignée fait par fait selon l’amendement v1.2 de `CONVENTIONS.md`.
  **L’artefact VOLUBILIS de référence est le `.xlsx`**, conformément à
  l’amendement v1.3, et toutes les citations neuves de ce fichier donnent leur
  numéro de ligne dans cet exemplaire.
- Toutes les consultations de ce dossier ont été faites le 2026-08-04.

### Sources employées et méthode d’accès

- **RID 2554** (Office of the Royal Society), autorité n° 1 en orthographe et en
  sens. Accès par requête POST unique par graphie sur
  https://dictionary.orst.go.th/func_lookup.php, paramètres
  `word=<graphie>&funcName=lookupWord&status=lookup`, requêtes espacées par les
  scripts versionnés `rid-lookup.mjs` et `rid-entry.mjs`, agent utilisateur
  identifiant le projet. **Aucune définition n’est reproduite, aucune n’est
  traduite mot à mot, et aucun écran d’apprenant ne restitue une définition du
  RID** : les champs `sources` indiquent en français la teneur du sens retenu,
  parce que c’est le minimum qui prouve une concordance de sens, ce que la
  politique autorise expressément. **Décompte REFAIT le 2026-08-04, requête par
  requête, après qu’un contre-audit interne a montré que le total annoncé
  oubliait deux interrogations consignées ailleurs dans ce même dossier** :
  **22 graphies distinctes interrogées, 0 erreur de requête, 14 attestées comme
  vedettes et 8 absentes.** La somme des cinq listes ci-dessous fait ce total, et
  toutes les listes sont recomputables par
  `node scripts/verification/rid-lookup.mjs <graphie> [...]`.
  - Attestées et citées comme preuve d’item (5) : หมู, ราคา, อาหาร, ข้าวผัด,
    บาท.
  - Attestées et citées comme entrées de LETTRE (4) : ห, ร, ค et ก, la dernière
    pour la seule classe moyenne de ไก่, fait déjà publié par `u04-l4a`.
  - Attestées et citées comme spécimen ou lecture d’appui (4) : ไก่, ไข่, ผัด et
    จาน, toutes items publiés du parcours, interrogées pour contrôle de présence
    et non pour un fait nouveau.
  - Attestée et citée au tri des candidats (1) : กุ้ง, rendue `entree`, mot
    écarté sur le seul critère de fréquence et dont le relevé est conservé plus
    bas.
  - **Absentes comme vedettes (8), et ces absences sont des preuves à part
    entière** : ข้าวผัดหมู, ข้าวผัดไก่, ข้าวผัดกุ้ง, ข้าวผัดไข่, ห้าสิบ,
    ร้านอาหาร, รายการอาหาร et เมนู. Les quatre premières fondent la réserve de
    portée des items 5 et 6 ; ห้าสิบ confirme le constat de `u03-l3c` ;
    ร้านอาหาร et รายการอาหาร celui de la note culturelle ; เมนู est l’un des
    deux motifs indépendants d’écarter ce candidat.
- **VOLUBILIS v26.2** (licence CC BY-SA 4.0), pivot français et corroboration de
  ton et de longueur.
  - **Exemplaire employé, identifié par empreinte, RECALCULÉE le 2026-08-04
    avant toute citation.** Le `.xlsx` présent sur le poste fait 10 848 409
    octets et son SHA-256 est
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`,
    c’est-à-dire exactement l’empreinte documentée dans l’en-tête de
    `volubilis-lookup.mjs` et celle employée par `u08-l8a` et `u09-l9a`.
    **Ce contrôle n’est pas une formalité** : `u09-l9a` a établi que
    l’exemplaire présent sous ce nom avait déjà été une page d’erreur HTML de
    154 octets, et que l’adresse de téléchargement documentée par le script rend
    un 404. L’empreinte a donc été vérifiée AVANT de citer, pas après, et le
    script l’affiche à chaque appel.
  - Le `.ods`, employé pour les seules feuilles `Codes` et `Romanization`, fait
    15 724 718 octets, SHA-256
    `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`, valeur
    identique à celle consignée par `u04-l4a` à `u09-l9a`.
  - **Numéros de ligne, tous rendus le 2026-08-04** par
    `node scripts/verification/volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <graphie>` :
    หมู 56943, ราคา 80679, อาหาร 337 et 338, ข้าวผัด 31810, ข้าวผัดหมู 31825,
    ข้าวผัดไก่ 31813, บาท 4504, ห้าสิบ 15257. Spécimens et contrôles :
    ข้าวผัดไข่ 31817, ข้าวผัดกุ้ง 31822, กุ้ง 46832, ไก่ 21437, ไข่ 29401,
    น้ำเปล่า 59305, สี่สิบ 93087, สิบห้า 92935, แปดสิบ 65547, ร้านอาหาร 81049,
    รายการอาหาร 80489, หมูสับ 57422. Le même relevé donne **114 579 lignes non
    vides et 586 541 chaînes partagées**, chiffres identiques à ceux de
    `u08-l8a` et `u09-l9a`, ce qui confirme qu’il s’agit du même exemplaire.
  - **Réancrage `.ods` vers `.xlsx`, exécuté et non promis.** Cinq graphies
    réemployées par cette leçon portaient dans le dépôt une citation ancrée sur
    le `.ods` : ข้าวผัด (33137 chez `u04-l4c`), ไก่ (22395 chez `u04-l4a`), ไข่,
    บาท (4504 chez `u03-l3c` et 4656 chez `u07-l7e`, deux valeurs incompatibles
    pour la même base) et สี่สิบ (96206 chez `u07-l7e`). **Les citations de CE
    fichier sont ancrées sur le `.xlsx`**, conformément à l’amendement v1.3. La
    dette des unités 4 à 7 n’est pas effacée pour autant : elle reste à traiter
    avant leur passage en `review`, et le cas de บาท montre qu’elle n’est pas
    théorique. Voir l’arbitrage 5.
  - **Notation des tons, citée par CLÉ**, relue le 2026-08-04 par
    `node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> --feuille=Codes`,
    sans filtre : sous l’intitulé `TONES`, les cinq lignes suivantes donnent
    `-x` normal, `¯x` high, `_x` low, `/x` rising, `\x` falling. La commande est
    celle que `u09-l9a` a corrigée après avoir constaté qu’un filtre par
    sous-chaîne ne rendait qu’une ligne.
  - **Notation de la longueur vocalique**, relue le même jour par
    `--feuille=Romanization` : la sortie donne à sa ligne 48 `อุ = u` et à sa
    ligne 49 `อู = ū`, et à sa ligne 38 `อะ = a` contre sa ligne 41 `อา = ā`. Le
    macron note donc la voyelle longue, et c’est ce qui fonde le champ `longueur`
    de หมู, de ราคา et de อาหาร indépendamment de Wiktionary.
  - **Portée réelle de cette source, réserve conservée depuis `u06-l6a`.** La
    colonne `ThaiPhon` est une transcription d’auteur et une partie des entrées
    porte `RID` en colonne de domaine. VOLUBILIS reste donc une corroboration
    partiellement indépendante, ce qui suffit au contrat d’item puisque
    Wiktionary fournit une seconde jambe de ton pour chacun des trois items
    nouveaux. Les colonnes de niveau et de domaine ne sont citées nulle part
    comme preuve, décision prise à la suite du finding N3 de `u06-l6a` ; les
    domaines `CULINA` et `CULINA (menu)` sont mentionnés à titre descriptif, et
    l’item 5 dit explicitement que l’étiquette `menu` n’est pas une seconde
    source.
- **Wiktionary** (éditions en et th, plus l’annexe « Appendix:Thai script »),
  pour le recoupement de prononciation, de ton, de définition, de classe de
  consonne et de valeur de finale. Consulté en rendu (`action=render`), les
  modèles de prononciation n’exposant pas l’IPA en wikitexte ; l’annexe a été
  relevée en source (`action=raw`). **La ligne « Phonemic » est employée ici comme
  preuve centrale pour อาหาร** : elle donne อา-หาน, c’est-à-dire la réécriture du
  ร final en น, indépendamment du RID. Les éditions en et th et l’annexe sont
  traitées comme UN seul écosystème, jamais comme plusieurs sources
  indépendantes. Deux requêtes ont rendu un **HTTP 404**, et ces deux absences
  sont citées comme preuves : https://en.wiktionary.org/wiki/ข้าวผัดหมู et
  https://en.wiktionary.org/wiki/ข้าวผัดกุ้ง, le 2026-08-04.
- **FrequencyWords** (Hermit Dave, sous-titres OpenSubtitles thaï 2018, contenu
  CC BY-SA 4.0), signal indicatif de fréquence. **Exemplaire empreinté, ce
  qu’aucune leçon antérieure n’avait fait** : `th_50k.txt` téléchargé le
  2026-08-04 depuis
  https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_50k.txt,
  50 000 lignes, SHA-256
  `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`. Le rang
  relevé pour บาท, 23 499, est identique à celui consigné par `u03-l3c` le
  2026-08-03, ce qui établit qu’il s’agit du même exemplaire et non d’une version
  nouvelle. Rangs relevés le 2026-08-04 : อาหาร 2305, ไก่ 4644, ราคา 4900, หมู
  5152, บาท 23 499, กุ้ง 35 842 ; ข้าวผัด, ผัด, ข้าวผัดหมู, ข้าวผัดไก่ et
  ข้าวผัดกุ้ง sont ABSENTS des 50 000 premiers jetons. **Portée de ce signal,
  déclarée** : c’est un corpus de sous-titres, mauvais témoin du vocabulaire de
  table, comme `u04-l4c` l’avait déjà consigné à son incertitude 3. Il est
  employé ici pour un usage précis et un seul, trancher lesquels des mots de
  menu candidats sont « à très haute fréquence », ce qui est une question de
  langue générale et non de table.

### Choix des trois mots nouveaux, et le mot ÉCARTÉ

La consigne de cette leçon demandait deux ou trois mots de menu à très haute
fréquence. Le tri a été fait sur le signal empreinté ci-dessus, avant la
rédaction, et il a écarté un candidat qui semblait évident.

| Candidat | Rang `th_50k` | Retenu | Motif                                                      |
| -------- | ------------- | ------ | ---------------------------------------------------------- |
| อาหาร    | 2305          | oui    | rang le plus haut, et deux acquis travaillés d’un coup     |
| ราคา     | 4900          | oui    | rang très haut, et seul mot du jour aux deux tons calculés |
| หมู      | 5152          | oui    | rang très haut, et nommé par le RID dans ข้าวผัด lui-même  |
| กุ้ง     | 35 842        | NON    | rang bas, incompatible avec « très haute fréquence »       |
| เมนู     | absent        | NON    | absent des 50 000 premiers jetons, et absent du RID        |

**กุ้ง a été vérifié entièrement avant d’être écarté**, et le relevé est conservé
plutôt que jeté : entrée « กุ้ง ๑ » au RID, relevée le 2026-08-04, la crevette,
avec dix-sept ลูกคำ ; VOLUBILIS `.xlsx` ligne 46832, ThaiPhon `\kung`, TYPE n.,
FRA « crevette [f] ; écrevisse [f] », domaine `CULINA ; ECONO ; PISCIS ; RID ;
TOURIST` ; en.wiktionary, IPA /kuŋ˥˩/, Paiboon `gûng`, classificateur ตัว ; et
ข้าวผัดกุ้ง attesté par VOLUBILIS ligne 31822, domaine
`CULINA (menu) ; INSOLITE ; (THA)`. Le mot
est parfaitement sourçable et c’est un mot de carte canonique. Il est écarté sur
le seul critère demandé, la fréquence, parce que 35 842 n’est pas « très haute
fréquence » et qu’écrire le contraire aurait été une affirmation sans appui. Sa
transcription serait `kôung`, et il ferait un item de première qualité pour une
leçon qui ne poserait pas ce critère. Voir l’incertitude 5.

**เมนู a été vérifié puis écarté sur DEUX motifs indépendants** : il est absent
des 50 000 premiers jetons de `th_50k.txt`, et il est `absent` du RID, requête du
2026-08-04. VOLUBILIS l’atteste seul, ligne 54672, « menu [m] ; carte [f] ». Un
mot mono-sourcé et non fréquent n’avait aucune raison d’entrer.

### Le spécimen de carte, et ce qu’il est exactement

C’est le point sur lequel cette leçon pouvait le plus facilement mentir, et la
règle appliquée est simple : **rien de ce qui est affiché ne prétend venir du
monde réel.**

- **La carte est COMPOSÉE**, ligne par ligne, à partir de graphies sourcées. Elle
  ne reproduit aucune carte existante, et aucune source n’a été consultée pour
  savoir à quoi ressemble une carte réelle : cela n’aurait pas été vérifiable
  dans le cadre de la politique du projet.
- **Conséquence tenue jusque dans les écrans, et c’est une correction du
  2026-08-04.** Puisque le dossier s’interdit d’affirmer quoi que ce soit sur la
  mise en page des cartes réelles, aucun écran ne peut le faire non plus. Les
  énoncés de la Méta, des pages 2, 3, 4 et 11, de la `note_fr` de l’item 7 et du
  feedback de l’exercice 3 sont donc rattachés aux lignes de CETTE leçon, et les
  deux absolus qu’ils portaient, « toujours » pour บาท et « personne n’écrit »
  pour จาน, sont retirés. Une carte thaïe peut parfaitement écrire un prix sans
  บาท : la leçon ne l’exclut plus.
- **Aucune enseigne, aucun nom de commerce, aucun nom de rue, aucune adresse, et
  aucun numéro de téléphone n’y figure.** Le contrôle a été fait à la relecture :
  le fichier ne contient aucun nom propre en dehors des noms de sources, de
  scripts et de leçons du dépôt.
- **Les prix ne sont pas des prix relevés.** Ce sont trois nombres déjà
  enseignés : ๕๐ pour ห้าสิบบาท, item publié de `u03-l3c` ; ๔๐ pour สี่สิบบาท,
  bloc publié de `u07-l7e` ; ๑๕ pour สิบห้าบาท, item publié de `u03-l3c`. La
  leçon n’affirme nulle part que quoi que ce soit coûte cela. La page 9 le dit à
  l’écran, pas seulement ici.
- **Les quatre lignes de plat sont soit des items publiés, soit des blocs
  attestés, et le détail est donné ligne par ligne plutôt que résumé.** น้ำเปล่า
  est un item publié de `u04-l4c`. ข้าวผัดหมู, ligne 31825, et ข้าวผัดไก่, ligne
  31813, portent le domaine `CULINA (menu) ; (THA)`. **ข้าวผัดไข่, ligne 31817,
  porte `CULINA` SEUL**, sans `(menu)` ni `(THA)` : une version antérieure de ce
  dossier étendait aux trois une étiquette qui ne vaut que pour deux, alors même
  que l’entrée d’écran de ข้าวผัดไข่ l’écrivait correctement. Relevé refait le
  2026-08-04 sur l’exemplaire empreinté, graphie par graphie. Leur attestation
  mono-sourcée est déclarée à l’item 5, et l’étiquette `menu` n’est jamais
  comptée comme une seconde source.
- **Les deux en-têtes de colonne sont une construction de la leçon**, et c’est
  l’élément le plus faible du spécimen. อาหาร et ราคา sont deux mots parfaitement
  sourcés, mais **rien dans les sources consultées n’atteste qu’ils sont employés
  comme en-têtes de colonne sur une carte.** C’est une mise en page inventée pour
  faire lire. **Elle est désormais déclarée là où l’apprenant la voit** : la
  page 9 le dit en toutes lettres, la `note_fr` de l’item 2 ne présente plus cet
  emploi comme un usage réel, et les titres des pages 6 et 8 ne le présentent
  plus du tout. Signalée aussi à l’incertitude 3.
- **Les prix sont écrits en chiffres thaïs**, parce que c’est ce que la leçon
  veut faire pratiquer, `u03-l3b` item 8 les ayant publiés en reconnaissance
  seule. **La leçon ne dit rien de la fréquence relative des chiffres thaïs et
  des chiffres arabes** dans les écrits réels : aucune source de la politique du
  projet ne porte ce fait, et l’affirmer serait exactement le genre d’assertion
  que la section 1 bis proscrit.

### Audit de lecture de la carte, et il a été COMPTÉ

La page 10 affirme que cinq syllabes DISTINCTES sur douze ont un ton calculable
et sept non, et qu’il y a dix-neuf syllabes à lire en tout. Ce décompte a été
fait syllabe par syllabe sur le spécimen exact de la page 9, et non estimé. Les
digits ne sont pas comptés : lire un chiffre est un acte de reconnaissance
publié par `u03-l3b`, et aucune règle de ton ne s’y applique.

**Correction du 2026-08-04** : la page 10 écrivait « douze syllabes sont écrites
en lettres thaïes » là où le dossier écrivait, lui, la phrase juste. Un apprenant
qui compte les syllabes de la carte en trouve dix-neuf et ne retrouvait pas le
chiffre de l’écran, sur la page même qui lui promet un décompte exact. L’écran
porte maintenant les deux nombres et dit lequel est lequel.

| Syllabe écrite | Occurrences | Ton        | Calculable ? | Motif                                            |
| -------------- | ----------- | ---------- | ------------ | ------------------------------------------------ |
| อา (อาหาร)     | 1           | moyen      | OUI          | อ moyenne (1A), vivante, nue, règle de 4A        |
| หาน (อาหาร)    | 1           | montant    | OUI          | ห haute (4A), vivante par sa finale ร lue น (9A) |
| รา (ราคา)      | 1           | moyen      | OUI          | ร basse (6A), vivante, nue, règle de 6A          |
| คา (ราคา)      | 1           | moyen      | OUI          | ค basse (5A), vivante, nue, règle de 6A          |
| ข้าว           | 3           | descendant | OUI          | ข haute + ไม้โท, vivante par ว, tableau de 7A    |
| ผัด            | 3           | bas        | non          | syllabe MORTE, hors du tableau de 7A et 8A       |
| บาท            | 4           | bas        | non          | syllabe MORTE, hors du tableau                   |
| หมู            | 1           | montant    | non          | consonne de tête, mécanisme jamais enseigné      |
| ไก่            | 1           | bas        | non          | forme en ไ, hors du tableau depuis 4A            |
| ไข่            | 1           | bas        | non          | forme en ไ, hors du tableau depuis 4A            |
| น้ำ            | 1           | haut       | non          | forme en ◌ำ, hors du tableau depuis 4A           |
| เปล่า          | 1           | bas        | non          | forme en เ◌า, hors du tableau depuis 4A          |

**Douze syllabes distinctes, cinq calculables et sept données**, 5 plus 7 égale 12. En occurrences, 1 plus 1 plus 1 plus 1 plus 3 égale **7 calculables**, et 3
plus 4 plus 1 plus 1 plus 1 plus 1 plus 1 égale **12 données**, pour un total de
**19 syllabes écrites**. Les trois lectures de chiffres, ห้าสิบ, สี่สิบ et
สิบห้า, ajoutent chacune une syllabe calculable et une donnée, et elles sont
comptées à part pour la raison dite plus haut.

### Sources du fait « ce ห se prononce, celui-là non »

C’est le pivot pédagogique de la leçon, et il tient sur deux autorités
indépendantes plus une leçon publiée du dépôt.

- **RID 2554, entrée de lettre « ห »**, relevée le 2026-08-04 par
  `node scripts/verification/rid-entry.mjs ห`. Elle donne la lettre pour la
  quarante-et-unième de l’alphabet, de classe อักษรสูง, employée comme
  พยัญชนะต้น, **et énonce dans la même clause qu’elle sert à mener une basse
  seule pour la faire fléchir comme une haute, le ห n’étant alors pas
  prononcé**, avec หงอย et หนา pour exemples. La lecture entre crochets de la
  vedette est [หอ], séquence U+0E2B U+0E2D.
- **Annexe « Appendix:Thai script » d’en.wiktionary**, relevée en source le
  2026-08-04 : ห porte `Class` = high, `Royal Thai Initial` = `h`, `IPA Initial`
  = `h`, et une case `IPA Final` VIDE, notée `-`. La lettre n’a donc aucune
  valeur de finale, ce qui est cohérent avec le fait qu’elle n’apparaît jamais en
  fin de syllabe dans le corpus publié.
- **Formes phonémiques, deux mots, deux résultats opposés.** Pour หมู,
  en.wiktionary donne `หฺมู` et th.wiktionary donne `หฺมู` : le พินทุ sous le ห
  note la consonne de tête muette, exactement comme `u09-l9a` l’avait relevé pour
  หมอ. Pour อาหาร, en.wiktionary donne `อา-หาน` : le ห y est conservé dans la
  forme phonémique, donc prononcé, et c’est le ร final qui est réécrit น. **Deux
  mots, deux traitements par la même source, et ils vont dans le sens de la
  page 6.**
- **Ce que dit déjà le dépôt, relu le 2026-08-04** : `u05-l5a` page 5 énonce le
  repère de contact, « le ห se tait quand une des lettres ง, น, ม, ย, ว ou ร est
  collée juste derrière lui, sans le moindre signe posé sur le ห », et son
  dossier consigne que ce critère a été contrôlé exhaustivement à la
  consolidation du 2026-08-03. 10C n’ajoute rien à ce repère : **elle le fait
  appliquer sur une paire où il tranche visiblement**, อาหาร contre หมู.
- **Portée du repère, et pourquoi la page 6 a été récrite le 2026-08-04.** La
  page 6 disait que ce coup d’œil est « un geste que vous pouvez faire sur
  n’importe quel mot ». C’est faux, et deux relevés le montrent. D’abord la
  liste employée est celle de 5A, qui en compte six et qui **se déclare
  elle-même incomplète** : « la liste complète et ce que ce ห muet fabrique
  viendront plus tard ». Ensuite l’entrée de lettre du RID, relue ci-dessus,
  n’énonce pas sa condition sur une liste mais sur une CLASSE, les basses
  seules, classe que le parcours n’a jamais posée. Un apprenant à qui l’on dit
  « n’importe quel mot » applique donc le geste à des mots où la lettre suivante
  est une basse seule hors de la liste des six, et conclut à tort que le ห se
  prononce. La page 6 énonce maintenant les deux cas sûrs, voyelle derrière donc
  ห prononcé, une des six derrière donc ห muet, et ordonne de ne rien conclure
  dans le troisième. **Le contre-exemple n’est pas cité en toutes lettres à
  l’écran** : donner un mot à ห muet hors de la liste reviendrait à enseigner
  sans source la partie de liste que 5A a explicitement reportée. Voir
  l’arbitrage 7.
- **Ce que le dossier N’affirme PAS.** Il ne dit pas comment la consonne de tête
  fabrique le ton, mécanisme hors programme depuis 7A ; il ne dit pas que le
  repère de 5A couvre tous les cas de ห nu, ce que 5A elle-même ne prétend pas
  et ce que l’écran ne dit plus ; il ne donne pas la liste complète des basses
  seules, faute d’une source du projet qui l’énumère ; et il ne dit rien des
  autres consonnes de tête, อ compris.

### Sources et méthode du dialogue

Le dialogue n’est attesté nulle part comme bloc : il est COMPOSÉ à partir
d’ossatures publiées, et chacune est traçable dans le dépôt, relecture du
2026-08-04.

- « ขอโทษครับ » : ขอโทษ est un item publié de `u02-l2c` item 4, transcription
  `khǎww·thôot`, et ครับ de `u01-l1e`. La suite avec particule est employée par
  `u05-l5e`, qui republie ขอโทษ à son item 9.
- « [chose] + เท่าไร + ครับ » : ossature publiée par `u03-l3c` item 6, sous la
  forme อันนี้เท่าไรครับ, puis instanciée par `u07-l7e` item 12 sous la forme
  ข้าวผัดเท่าไร. **La leçon y substitue ข้าวผัดหมู, et cette substitution est la
  SEULE liberté prise dans tout le dialogue.** Elle est de la même nature que
  celle de `u07-l7e`, qui avait déjà remplacé un démonstratif par un nom de plat.
- « ห้าสิบบาทค่ะ » : ห้าสิบบาท est un item publié de `u03-l3c` item 7 et ค่ะ de
  `u01-l1e` et `u02-l2b`. La forme « [prix] + ค่ะ » en réponse à une question de
  prix est employée par `u04-l4e` à sa réplique 7, แปดสิบบาทค่ะ, et par
  `u07-l7e` à sa page de spécimen, สี่สิบบาทค่ะ. Aucune liberté.
- « ขอบคุณครับ » : item publié de `u02-l2c` item 1, transcription
  `khàwwp·khoun khráp`.
- **Ce que cela ne garantit pas** : qu’un locuteur natif formulerait ces quatre
  répliques ainsi. Une composition à partir de blocs corrects peut produire un
  énoncé maladroit. Le dialogue est donc le point le plus incertain de la leçon
  pour l’audit de naturalité, et il a été volontairement RACCOURCI pour réduire
  la surface : la version initiale portait une cinquième réplique,
  ขอข้าวผัดหมูสองจานหน่อยครับ, instance du bloc publié par `u04-l4c` item 7 avec
  la même substitution. Elle a été retirée parce qu’elle aurait fait porter au
  dialogue une SECONDE liberté de composition pour un gain nul : `u04-l4c` et
  `u04-l4e` enseignent déjà la commande, et 10C enseigne la lecture. Le motif est
  consigné plutôt que le retrait masqué. Voir l’incertitude 7.

### Calcul complet du plancher de l’exercice 3

Il est donné ici parce qu’un plancher annoncé sans calcul est exactement le
genre d’attestation que le contre-audit de `u09-l9a` a trouvée fabriquée.

Ce calcul a été REFAIT le 2026-08-04 sur les six tirages actuels, ceux où les
noms de plats sont des blocs insécables. Il n’est pas repris de la version
précédente de l’exercice.

La stratégie de FORME consiste à poser un nom de plat en tête, บาท en queue et un
nombre juste avant lui, sans lire aucun bloc. Elle laisse ouverte la question de
savoir LEQUEL des candidats occupe chaque place :

- tirages 1 et 2 : deux noms de plats concurrents, un seul nombre, donc 1/2 ;
- tirage 3 : un seul nom de plat, deux nombres concurrents, donc 1/2 ;
- tirages 4, 5 et 6 : deux noms de plats et deux nombres concurrents, donc
  1/2 × 1/2 = 1/4.

Espérance : 1/2 + 1/2 + 1/2 + 1/4 + 1/4 + 1/4 = **2,25 sur 6**. Probabilité
d’atteindre le seuil de 5 sur 6, calculée sur ces six probabilités
indépendantes : P(6 succès) = 0,5³ × 0,25³ = 0,001953125 ; P(exactement 5) =
3 × (0,5² × 0,5 × 0,25³) + 3 × (0,5³ × 0,25² × 0,75) = 0,005859375 + 0,017578125
= 0,0234375. Total P(au moins 5) = **0,025390625, soit 2,5 %**.

### Vérification Unicode

Séquences NFC recalculées le 2026-08-04 et vérifiées comme STABLES, la forme NFC
étant identique à la chaîne source pour les huit graphies d’items comme pour tous
les spécimens.

| Item       | Séquence NFC                                                          |
| ---------- | --------------------------------------------------------------------- |
| หมู        | U+0E2B U+0E21 U+0E39                                                  |
| ราคา       | U+0E23 U+0E32 U+0E04 U+0E32                                           |
| อาหาร      | U+0E2D U+0E32 U+0E2B U+0E32 U+0E23                                    |
| ข้าวผัด    | U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14                      |
| ข้าวผัดหมู | U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 U+0E2B U+0E21 U+0E39 |
| ข้าวผัดไก่ | U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 U+0E44 U+0E01 U+0E48 |
| บาท        | U+0E1A U+0E32 U+0E17                                                  |
| ห้าสิบบาท  | U+0E2B U+0E49 U+0E32 U+0E2A U+0E34 U+0E1A U+0E1A U+0E32 U+0E17        |

Spécimens, mêmes date et méthode : ข้าวผัดไข่ U+0E02 U+0E49 U+0E32 U+0E27 U+0E1C
U+0E31 U+0E14 U+0E44 U+0E02 U+0E48 ; น้ำเปล่า U+0E19 U+0E49 U+0E33 U+0E40 U+0E1B
U+0E25 U+0E48 U+0E32 ; สี่สิบบาท U+0E2A U+0E35 U+0E48 U+0E2A U+0E34 U+0E1A
U+0E1A U+0E32 U+0E17 ; สิบห้าบาท U+0E2A U+0E34 U+0E1A U+0E2B U+0E49 U+0E32
U+0E1A U+0E32 U+0E17 ; ไก่ U+0E44 U+0E01 U+0E48 ; ไข่ U+0E44 U+0E02 U+0E48 ;
ร้านอาหาร U+0E23 U+0E49 U+0E32 U+0E19 U+0E2D U+0E32 U+0E2B U+0E32 U+0E23 ; ๕๐
U+0E55 U+0E50 ; ๔๐ U+0E54 U+0E50 ; ๑๕ U+0E51 U+0E55.

Deux graphies ajoutées par la consolidation du 2026-08-04, mêmes date et
méthode : ดู U+0E14 U+0E39, séquence identique au champ `codepoints` de
`u01-l1b` item 10 ; et ขอข้าวผัดสองจานหน่อยครับ U+0E02 U+0E2D U+0E02 U+0E49
U+0E32 U+0E27 U+0E1C U+0E31 U+0E14 U+0E2A U+0E2D U+0E07 U+0E08 U+0E32 U+0E19
U+0E2B U+0E19 U+0E48 U+0E2D U+0E22 U+0E04 U+0E23 U+0E31 U+0E1A, vingt-quatre
unités de code. **C’est la plus longue graphie que cette leçon met sous les yeux
d’un apprenant** : une seule graphie du fichier est plus longue, la cinquième
réplique retirée du dialogue, vingt-sept unités, et elle ne figure que dans ce
dossier. Elle est citée en une seule ligne page 4 et ne doit jamais être coupée
au milieu d’une syllabe.

Points de rendu à contrôler à l’intégration :

- **les trois chiffres thaïs de la carte sont des caractères de catégorie
  générale `Nd`, sans aucun signe combinant**, U+0E50 à U+0E59 portant les noms
  THAI DIGIT ZERO à THAI DIGIT NINE. Le produit doit vérifier qu’aucune fonte de
  substitution ne les rend en chiffres arabes : ce serait supprimer la moitié de
  l’exercice sans erreur visible ;
- **la carte est un TABLEAU, et c’est le vrai risque de rendu du jour.** À
  390 px, deux colonnes de texte thaï doivent rester alignées et lisibles sans
  césure au milieu d’un mot. La ligne la plus large est ข้าวผัดหมู ๕๐ บาท ;
- ข้าวผัดหมู et ข้าวผัดไก่ comptent dix unités de code chacune. **Ce sont les
  deux graphies d’ITEM les plus longues de cette leçon**, et non les plus longues
  du fichier : plusieurs graphies citées sans être des items les dépassent, la
  plus longue atteignant vingt-sept unités, la cinquième réplique retirée du
  dialogue, qui ne figure que dans ce dossier. La plus longue de celles qu’un
  apprenant voit compte vingt-quatre unités, c’est la phrase de commande de 4C
  citée page 4, et ses codes sont donnés ci-dessus. **Aucune commande de
  classement n’est écrite ici** : elle devrait nommer l’intervalle des
  caractères thaïs, donc en poser dans ce fichier, donc changer le décompte
  qu’elle est censée mesurer. Le classement se refait avec l’éditeur de son
  choix, ou avec `unicode-thai.mjs` qui rend chaque chaîne.
  La troncature de fin de ligne ne doit jamais amputer une graphie de son dernier
  caractère, faute de quoi ข้าวผัดหมู deviendrait ข้าวผัดหม, qui n’est pas un
  mot ;
- U+0E40 (`SARA E`), U+0E41 (`SARA AE`) et U+0E44 (`SARA AI MAIMALAI`)
  s’écrivent AVANT la consonne qu’ils accompagnent. Deux graphies de cette leçon
  sont concernées, ไก่ et ไข่, plus le spécimen เปล่า. Les deux propriétés
  relevées par `u09-l9a`, `Logical_Order_Exception` dans `PropList` et
  `Visual_Order_Left` dans `IndicPositionalCategory`, couvrent exactement เ, แ,
  โ, ใ et ไ ; **aucune passe de remplacement de nom ne doit être lancée**, la
  version antérieure de ce point ayant été retirée par `u09-l9a` après avoir été
  cherchée dans le mauvais fichier ;
- น้ำ empile U+0E49 (`MAI THO`) et U+0E33 (`SARA AM`) sur น. C’est la seule
  graphie de la carte à porter une marque de ton, et son rendu doit être vérifié
  à côté de graphies nues ;
- aucun caractère de la zone à usage privé ne figure dans ce fichier. Aucun
  relevé de cette leçon n’a rendu de glyphe U+E000 à U+F8FF.
- **Contrôle mécanique RÉELLEMENT EXÉCUTÉ le 2026-08-04**, et il a trouvé une
  faute que la relecture humaine avait laissée passer. Réexécuté APRÈS la
  consolidation du même jour, `node scripts/verification/unicode-thai.mjs
content/authoring/unite-10/lecon-10c.md` rend **8 champs `thai`, 177 chaînes
  thaïes distinctes dans tout le fichier dont 169 hors des champs `thai`, toutes
  conformes NFC, aucun caractère de la zone à usage privé**, et un inventaire de
  douze signes non consonantiques, tous inchangés. Avant consolidation, les mêmes
  compteurs rendaient 171 et 163 ; l’écart de six est le solde des graphies
  ajoutées par les corrections, dont ดู et la phrase de commande de 4C, et de
  deux graphies d’autres leçons retirées d’une comparaison de longueur devenue
  fausse. **Ce chiffre n’est écrit
  qu’ICI** : une version antérieure le répétait dans le tableau d’état des audits
  avec une valeur différente, 172, ce qu’un contre-audit a relevé. Un décompte
  écrit deux fois finit par diverger, donc il n’est plus écrit qu’une.
  **Ce que ce contrôle a attrapé** : la graphie ลูกคำ, employée six fois dans ce
  fichier comme terme du RID pour un mot dérivé, avait été écrite une fois avec
  la séquence U+0E04 U+0E4D U+0E32, c’est-à-dire `NIKHAHIT` puis `SARA AA`, au
  lieu de U+0E04 U+0E33, `SARA AM`. Les deux rendus se ressemblent à l’écran et
  ne sont pas la même chaîne. La faute est corrigée ; la forme fautive n’est pas
  reproduite ici, pour qu’aucune relecture ultérieure ne la recopie en croyant
  citer un exemple. Après correction, `unicode-thai.mjs` ne rend plus aucun
  U+0E4D dans le fichier. **C’est exactement le motif pour lequel ce script
  existe** : un inventaire Unicode écrit à la main n’est pas un contrôle, et
  celui-ci a été exécuté avant d’écrire la présente ligne, pas après l’avoir
  annoncée.
  L’empreinte que le script affiche n’est pas citée ici : elle change à chaque
  édition du fichier, et une empreinte de soi-même n’est pas reproductible.
  Signes attendus et vérifiés comme intentionnels : U+0E3A (`PHINTHU`), une
  occurrence, dans la forme phonémique หฺมู citée de Wiktionary ; U+0E4C
  (`THANTHAKHAT`), trois occurrences, dans ไพบูลย์, สตางค์ et แพทย์, tous cités
  de sources ou de leçons publiées ; U+0E47 (`MAITAIKHU`), une occurrence, dans
  หมูหย็อง, cité de la liste de ลูกคำ du RID.

### Contrôles internes au dépôt, tous recomputables le 2026-08-04

- **Les trois mots nouveaux sont réellement neufs.**
  `node scripts/verification/repo-thai-scan.mjs 1 9 --grep "หมู"` rend
  **0 graphie**, et il en va de même pour « ราคา » et « อาหาร ». Le même contrôle
  sur « กุ้ง » rend 0 lui aussi, ce qui vaut pour l’écarté.
- **ข้าวผัด est bien un réemploi et pas une redécouverte.**
  `repo-thai-scan.mjs 1 9 --grep "ข้าวผัด"` rend **4 graphies** : ข้าวผัด
  (`u04-l4c`), ขอข้าวผัดสองจานหน่อยครับ (`u04-l4c`), ขอข้าวผัดสองจานหน่อย
  (`u04-l4e`) et ข้าวผัดเท่าไร (`u07-l7e`). Aucune ne porte d’ingrédient : les
  blocs des items 5 et 6 sont donc bien des formes nouvelles dans le dépôt.
- **ร้าน n’est publié qu’à l’intérieur d’un composé.**
  `repo-thai-scan.mjs 1 9 --grep "ร้าน"` rend **2 graphies**, ร้านขายยา et
  ร้านขายยาอยู่ที่ไหนครับ / ร้านขายยาอยู่ที่ไหนคะ, toutes deux de `u09-l9d`.
  C’est ce qui autorise la note culturelle à dire que l’apprenant « sait déjà
  lire ร้าน », et ce qui lui interdit d’en faire un item.
- **État du corpus au moment d’écrire.** `repo-thai-scan.mjs 1 9` rend
  **45 fichiers `lecon-*.md`, 429 entrées et 317 graphies distinctes**, dont 103
  portant ไม้เอก, 76 ไม้โท, 1 ไม้ตรี et 2 ไม้จัตวา.
- **Le dossier de l’unité 10 était vide à l’écriture, il ne l’est plus, et la
  collision annoncée EXISTE.** `ls content/authoring/` rendait les répertoires
  `unite-01` à `unite-09` et aucun `unite-10` avant l’écriture de ce fichier.
  Le relevé demandé par l’arbitrage 1 a été exécuté à la consolidation du
  2026-08-04 : `node scripts/verification/repo-thai-scan.mjs 10 10` rend
  **5 fichiers, 32 entrées et 31 graphies distinctes**, soit exactement une
  graphie publiée deux fois dans l’unité. C’est ราคา : `lecon-10d.md` la publie
  comme son item 1, sous la mention « Attribution en suspens », et propose
  lui-même que 10C publie et que 10D réemploie, 10C étant la leçon la plus
  précoce. 10C ne tranche pas seule et laisse l’arbitrage 1 ouvert.
- **Limite de l’outil, constatée en exécutant ce relevé et signalée plutôt que
  contournée.** `repo-thai-scan.mjs --grep ราคา` sur l’unité 10 ne rend qu’UNE
  ligne, celle de `lecon-10c.md`, alors que la graphie est publiée par deux
  fichiers. Le script tient une table `firstSeen` et ne conserve que le premier
  fichier où une graphie apparaît : **il ne peut donc pas, tel quel, dépouiller
  des collisions**, ce que l’arbitrage 1 lui demandait pourtant. Le seul signal
  de collision qu’il rend est l’écart entre son nombre d’entrées et son nombre
  de graphies, ici 32 contre 31. Voir l’arbitrage 1.
- **Décompte des cartes SRS du dépôt** :
  `grep -rn "^- \`srs-" content/authoring/unite-0*/lecon-*.md`rend **243
lignes**. C’est le décompte sur lequel repose le motif de création de`srs-u10-l10c-02`, avec la réserve de méthode déclarée à cette carte.
- **Toutes les transcriptions citées à l’écran viennent du dépôt**, relues le
  2026-08-04 : ข้าวผัด `khâao·phàt` (`u04-l4c`), น้ำเปล่า `náam·plào`
  (`u04-l4c`), จาน `jaan` (`u04-l4c`), ไก่ `kài` et ไข่ `khài` (`u04-l4a`), ผัด
  `phàt` (`u05-l5a`), บาท `bàat` et ห้าสิบบาท `hâa·sìp bàat` et สิบห้าบาท
  `sìp·hâa bàat` et เท่าไร `thâo·rai` (`u03-l3c`), สี่สิบบาท `sìi·sìp bàat`
  (`u07-l7e`), หมา `mǎa` (`u01-l1d`), หมอ `mǎww` et อาการ `aa·kaan`
  (`u09-l9a`), ขอโทษ `khǎww·thôot` et ขอบคุณครับ `khàwwp·khoun khráp`
  (`u02-l2c`), ครับ `khráp` et ค่ะ `khâ` (`u01-l1e`), ร้านขายยา `ráan·khǎai·yaa`
  (`u09-l9d`).
- **Contrôle de réemploi mécanique** :
  `node scripts/verification/item-fields-check.mjs content/authoring/unite-10/lecon-10c.md`,
  exécuté le 2026-08-04. Il compare les cinq champs `ipa`, `ton`, `longueur`,
  `transcription` et `codepoints` de chaque item dont le titre porte une
  référence `uXX-lYz` à ceux de la leçon d’origine. Sortie exacte du
  2026-08-04 : **1 fichier contrôlé, 0 champ `codepoints` en faute, 0 écart de
  réemploi.** Les items 4, 7 et 8, les trois seuls réemplois stricts, le passent
  sans écart.
  **Un `??` a été produit puis supprimé, et le motif est écrit plutôt que le
  résultat maquillé.** Le titre de l’item 6 portait d’abord la référence
  `u04-l4a`, pour dire d’où vient son ingrédient. Le script l’a résolue, a
  cherché la graphie ข้าวผัดไก่ dans `u04-l4a` et a signalé qu’elle y était
  absente, ce qui est exact : c’est un BLOC, pas un réemploi de graphie. Le
  titre a donc été reformulé sans référence résolvable, et la provenance de ไก่
  est donnée dans le champ `note_fr` et dans les sources. **Règle qui se dégage
  et qui vaut au delà de cette leçon** : une référence `uXX-lYz` dans un titre
  d’item signifie « cette graphie est publiée là », pas « un morceau de cette
  graphie vient de là ».
  **Limite de l’outil, découverte en l’employant et signalée
  plutôt que contournée** : sa reconnaissance de référence est
  `^u(\d\d)-l(\d)([a-e])$`, avec UN SEUL chiffre pour le numéro de leçon. Elle ne
  peut donc pas résoudre une référence à l’unité 10, `u10-l10c` par exemple, ni
  vérifier un réemploi entre deux leçons de cette unité. Voir l’arbitrage 6.

### Sources du fait de phonétique, et pourquoi il n’y en a aucune

Cette leçon n’introduit AUCUN son nouveau et **n’affirme rien sur la phonétique
du français**. La section 1 bis de `docs/content-policy/sources-verification.md`
est donc respectée par construction plutôt que par précaution.

**Balayage réellement exécuté le 2026-08-04**, sur les trois formules nommées par
l’arbitrage 2 de `u08-l8a` et recomptées par `u09-l9a`. **Sa portée est déclarée
AVANT ses chiffres, et c’est ce qui change tout.** Le fichier est coupé au titre
`## Dossier de production` : tout ce qui précède peut atteindre un écran
d’apprenant, tout ce qui suit ne le peut pas. Le balayage porte sur la PREMIÈRE
partie, et sur elle seule.

Résultat, sur tout ce qui précède `## Dossier de production` : les quatre chaînes
`une bouche française`, `un francophone`, `l’oreille française` et `francophone`
y apparaissent **zéro fois, les quatre**. Même chose pour la première partie du
fichier prise dans son ensemble : aucune des sections `Méta`, `Enseignement`,
`Items`, `Exercices`, `Dialogue`, `SRS` ni `Note culturelle` ne nomme ces
formules.

**Le compte sur le fichier ENTIER n’est volontairement pas donné, et le motif est
une leçon de méthode plutôt qu’une dérobade.** Ce paragraphe fait partie du
fichier qu’il mesure : il nomme les formules pour dire qu’il les cherche, donc il
se compte lui-même, et **la moindre reformulation change le résultat**. Le fait a
été constaté et non supposé : trois recomptes successifs, pendant la seule
écriture de cette section, ont rendu trois jeux de valeurs différents, uniquement
parce que le texte du contrôle changeait entre deux exécutions. Un chiffre qui
bouge quand on décrit sa propre mesure n’est pas un chiffre vérifiable, et
l’écrire en dur dans un fichier qui sera relu et corrigé revient à programmer une
fausse attestation pour plus tard. C’est exactement le piège où `u09-l9a` est
tombée en annonçant quatre zéros pour tout son fichier. **La commande est donnée
à la place du chiffre**, et elle est recomputable par quiconque, à n’importe
quelle version :

```
node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');
const i=t.indexOf('## Dossier de production');
for (const f of ['une bouche française','un francophone','l’oreille française','francophone'])
  console.log(f, t.slice(0,i).split(f).length-1);" content/authoring/unite-10/lecon-10c.md
```

**Avertissement à qui corrigera ce fichier** : les apostrophes DROITES de ce bloc
de code sont de la syntaxe JavaScript, pas de la typographie française. Les
remplacer par des apostrophes typographiques, comme la règle d’écriture produit
le demande partout ailleurs, casserait la commande et rendrait le contrôle
irreproductible. C’est le seul endroit du fichier où une apostrophe droite est
correcte, et la commande a été exécutée telle quelle le 2026-08-04.

Le fait de fond a été vérifié séparément, même méthode et même coupure, et
**recompté après la consolidation du 2026-08-04**, qui a fait passer ce nombre de
six à neuf. Avant le dossier, la chaîne exacte `français`, en minuscules,
apparaît **9 fois**, et les neuf ont été relues une par une : le titre français
de la leçon ; la mention d’un « contenu français » dans l’objectif observable ;
« à partir du français seul » dans les sources de l’item 5 ; la description des
options de l’exercice 1 écrites « en français » ; « du thaï au français » et « la
cible est énoncée en français » dans l’exercice 3 ; le piège du même exercice ;
et deux fois « à partir du français » dans les cartes SRS 03 et 04. Trois autres
occurrences portent une majuscule, l’en-tête `Français` du tableau de dialogue et
deux emphases, et le balayage sensible à la casse ne les compte pas ; elles ont
été relues aussi. Aucune n’affirme quoi que ce soit sur la
phonétique. Le seul cas discutable est le piège de l’exercice 3, « poser le nombre
avant le nom du plat, ordre du français » : il porte sur l’ORDRE DES MOTS d’une
langue que l’apprenant parle, il est vérifiable par lui-même en une seconde, et
il relève donc de la seconde voie prévue par la section 1 bis, la reformulation
en observation vérifiable, et non d’une assertion de phonétique.

### Incertitudes signalées par l’auteur

1. **La consonne de tête reste hors programme alors que la leçon en fait lire
   une, et ce n’est plus tenable longtemps.** Le ton de หมู est donné. Le
   mécanisme est pourtant SOURÇABLE, l’entrée de lettre « ห » du RID l’énonce en
   une clause et les deux éditions de Wiktionary le notent par un พินทุ dans la
   forme phonémique. Ce n’est donc pas une incertitude de fait, **c’est un manque
   de curriculum** : aucune leçon des unités 1 à 9 ne l’enseigne, 7A et 8A le
   rangent explicitement hors de leur tableau, 1D en a fait une simple
   observation, et l’unité 10 est censée être celle de la lecture appliquée. À
   arbitrer, voir l’arbitrage 2.
2. **L’attestation des blocs ข้าวผัดหมู et ข้าวผัดไก่ est MONO-SOURCÉE.**
   VOLUBILIS les donne comme `n. exp.` avec le domaine `CULINA (menu) ; (THA)`,
   lignes 31825 et 31813 ; le RID les rend `absent` et Wiktionary rend un
   HTTP 404. La leçon a réduit sa revendication à ce que deux sources portent, la
   lecture et le sens des composants plus le fait que หมู entre dans les noms de
   plats. **La restriction de portée qui rend cette incertitude acceptable existe
   maintenant DANS LE PRODUIT, et pas seulement dans ce dossier** : les cinq
   exercices ont été relus un par un le 2026-08-04, et aucun ne fait former ces
   suites morceau par morceau ni ne les demande à partir du français seul. Elles
   sont lues, entendues, choisies entières, et transcrites depuis la graphie
   affichée. **C’est tout de même une perte réelle** : un apprenant apprend à
   lire une ligne sans qu’on lui garantisse que cette ligne se dit ainsi. Piste
   de résolution : un signal de distribution TNC, ou une grammaire de référence
   sur exemplaire pour la composition nominale.
3. **La mise en page du spécimen est inventée, et c’est son point faible.**
   อาหาร et ราคา sont sourcés comme mots ; rien ne les atteste comme EN-TÊTES DE
   COLONNE. Cette mise en page est une construction pédagogique, désormais
   déclarée à l’écran là où l’apprenant la rencontre, page 9 pour la carte et
   `note_fr` de l’item 2 pour le mot, et plus seulement dans ce dossier. Piste de
   résolution : la faire éprouver au contre-audit externe, qui peut dire si elle
   est plausible, ou renoncer aux en-têtes et ne garder que les quatre lignes.
4. **Le champ `fr` de หมู porte deux sens dont le second est de portée
   restreinte.** VOLUBILIS donne « porc » pour le mot nu, en.wiktionary
   conditionne cette lecture à un เนื้อ qui précède, et le RID ne glose que
   l’animal. La formulation retenue, « et, dans un nom de plat, le porc », est
   exactement ce que les dérivés des deux autorités soutiennent, ni plus ni
   moins. Un apprenant pourrait néanmoins en conclure qu’il peut commander หมู
   tout seul, ce que la leçon ne lui fait jamais faire.
5. **กุ้ง a été écarté sur un signal de fréquence dont la leçon dit elle-même
   qu’il est mal adapté.** `th_50k.txt` est un corpus de sous-titres, mauvais
   témoin du vocabulaire de table, comme `u04-l4c` l’avait consigné. Un mot de
   carte canonique a donc été écarté par un instrument que le dossier reconnaît
   inadapté, ce qui est une décision discutable et non un fait. Piste : un signal
   de fréquence issu d’un corpus écrit, TNC ou PyThaiNLP, ce que le projet n’a
   pas encore mis en place.
6. **Aucun audio n’est produit.** L’exercice 4 en dépend intégralement, et le
   dialogue s’appuie sur l’écoute. Trois contraintes à consigner avant
   enregistrement. Premièrement, les douze tirages de l’exercice 4 doivent être
   produits par la MÊME voix, faute de quoi la variation entre locuteurs
   fournirait un indice parasite. Deuxièmement, les paires ไก่ contre ไข่ et
   `hâa·sìp` contre `sìp·hâa` doivent être enregistrées séparément et vérifiées
   comme réellement distinctes à l’écoute, faute de quoi les pièges consignés
   deviendraient des injustices. Troisièmement, les fermetures de ผัด et de บาท
   doivent être produites sans détente audible, contrôle déjà exigé par
   `u05-l5a`.
7. **Naturalité du dialogue.** Quatre répliques, une seule liberté, mais cette
   liberté porte sur le bloc central. La cinquième réplique retirée est
   documentée plutôt que supprimée en silence. Rien ne garantit qu’un locuteur
   natif dirait ข้าวผัดหมูเท่าไรครับ plutôt qu’autre chose.
8. **RÉSOLUE EN FAIT, PAS EN DÉCISION : la collision d’unité est levée pour deux
   des trois mots et confirmée pour le troisième.** La supposition n’était pas
   vérifiable à l’écriture, le dossier de l’unité 10 étant vide. Elle l’est
   depuis la consolidation du 2026-08-04 : หมู et อาหาร ne sont publiés que par
   10C, et **ราคา est publié à la fois par 10C, item 2, et par `lecon-10d.md`,
   item 1**, avec sept champs concordants et une attribution que 10D déclare
   elle-même en suspens. Ce qui reste ouvert n’est donc plus un doute mais une
   décision d’attribution, qui ne peut pas être prise par une leçon seule. Voir
   l’arbitrage 1.
9. **Le repère du ห de 5A couvre six lettres et 5A déclare sa liste
   incomplète.** 10C a borné son geste aux deux cas qu’il tranche sûrement, ce
   qui est correct mais laisse un troisième cas sans réponse, sur une unité de
   lecture appliquée où l’apprenant rencontrera nécessairement des ห nus.
   Ce n’est pas une incertitude de fait, c’est un manque de curriculum de la
   même famille que l’incertitude 1. Voir l’arbitrage 7.

**Neuf incertitudes, dont huit OUVERTES et une résolue en fait.** Deux touchent
un fait enseigné, la 2 et la 4, et la leçon les traite en restreignant sa
revendication à ce que deux sources portent. Les 1 et 9 sont des manques de
curriculum, la 3 une construction assumée et désormais déclarée à l’écran, la 5
une décision de tri discutable, la 6 une contrainte de production, la 7 une
limite de méthode, la 8 une décision d’attribution qui appartient à la
consolidation.

### État des audits

| Dimension            | État                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe          | vérifiée, 5 items sur 8 attestés comme vedettes du RID le 2026-08-04 ; les 3 autres sont des blocs, dont 2 déclarés mono-sourcés                                                      |
| Sens                 | vérifié pour les 8 traductions ; le second sens de หมู est restreint à sa portée sourçable, voir l’incertitude 4                                                                      |
| Prononciation, ton   | vérifié, 3 items nouveaux sur 3 sur deux sources indépendantes du RID ; 3 items réemployés repris à l’identique et contrôlés mécaniquement                                            |
| Longueur             | vérifiée pour les 3 items nouveaux, macron VOLUBILIS plus IPA Wiktionary, aucune réserve ouverte ; aucun noyau diphtongué neuf n’est introduit                                        |
| Registre             | vérifié, aucune étiquette de registre au RID ni chez VOLUBILIS sur les 3 items nouveaux, donc neutre sur les 3                                                                        |
| Finales écrites      | vérifiée pour อาหาร, ร lu `n`, RID entrée de lettre plus annexe Wiktionary, fait déjà enseigné par `u09-l9a`                                                                          |
| Consonne de tête     | HORS PROGRAMME et signalé, ton de หมู donné, voir l’incertitude 1                                                                                                                     |
| Naturalité           | NON VÉRIFIÉE pour le dialogue et pour la mise en page du spécimen, voir les incertitudes 3 et 7                                                                                       |
| Unicode              | vérifié, `unicode-thai.mjs` réexécuté après consolidation le 2026-08-04, chiffres à la section Vérification Unicode ; il avait trouvé et fait corriger un U+0E4D écrit pour un U+0E33 |
| Décomptes internes   | produits par `repo-thai-scan.mjs`, `item-fields-check.mjs`, `rid-lookup.mjs`, `volubilis-lookup.mjs` et `grep`, chaque chiffre accompagné de la commande qui le rend                  |
| Spécimen             | déclaré CONSTRUIT à l’écran et au dossier, en-têtes de colonne compris ; aucune enseigne, aucun prix relevé, aucun nom propre                                                         |
| Phonétique française | SANS OBJET, aucune assertion sur le français ; balayage réellement exécuté, 0 occurrence des trois formules                                                                           |
| Licence              | vérifiée, aucun texte de définition recopié, aucune formulation reprise, aucun écran ne restitue une définition                                                                       |
| Citations de sources | RECOMPUTÉES le 2026-08-04 sur les artefacts empreintés : 22 requêtes RID, 12 relevés VOLUBILIS et 6 rangs de fréquence refaits, quatre citations tronquées rétablies                  |
| Contre-audit interne | **PASSÉ le 2026-08-04**, consigne adversariale, auditeur sans contact avec le rédacteur : 8 findings bloquants et 4 non bloquants, tous traités, voir la section de résolution        |
| Contre-audit externe | **NON LANCÉ.** Lot à préparer                                                                                                                                                         |
| Revue native         | EN ATTENTE                                                                                                                                                                            |

### Contre-audit interne du 2026-08-04, et ce qu’il a changé

Un auditeur adversarial indépendant, sans contact avec le rédacteur, a relu ce
fichier au sha256 `aab486eca60c55d1bdb1624647171528df47e68bc310496e93ef9ea575b0eea4`
et refusé le passage en `review`. Son relevé est conservé dans
`content/authoring/unite-10/verification-10c.md`, qui n’est pas modifié par cette
consolidation. Il a produit 8 findings bloquants et 4 non bloquants, et il a
recalculé 74 faits qui tiennent. Le point commun de ses huit bloquants mérite
d’être écrit : **le dossier était honnête, les écrans ne l’étaient pas encore.**
Presque tous les findings opposent une réserve correctement écrite ici à une
phrase qui l’oubliait à l’endroit où l’apprenant la lit.

Chaque finding a été traité, et chaque correction a été VÉRIFIÉE avant d’être
appliquée plutôt que recopiée de l’audit.

| Finding          | Traitement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 · MENU-REGLE  | CORRIGÉ par restriction de portée. Tous les énoncés génériques sur la mise en page des cartes sont rattachés aux lignes de cette leçon : les deux points du bloc de lecture et la règle enseignée en Méta, les pages 2, 3 et 4, la `note_fr` de l’item 7 et le feedback de l’exercice 3. Les deux absolus, « บาท ferme la ligne, toujours » et « personne n’écrit จาน », sont supprimés : aucune source de la politique ne les porte et un prix thaï peut s’écrire sans บาท. La page 3 conserve l’ordre nombre puis monnaie, qui n’est pas une règle de mise en page mais la lecture de trois blocs publiés par `u03-l3c` et `u07-l7e`, et « il ne change jamais de forme » devient l’observation vérifiable « บาท s’écrit de la même façon dans les trois ».                                                                                                                                                                                                                                      |
| B2 · ENTETE      | CORRIGÉ par suppression de l’affirmation d’usage. Le titre de la page 8 et la phrase d’ouverture de la page 6 ne présentent plus ces mots comme des en-têtes de carte, et la `note_fr` de l’item 2 ne dit plus « sur une carte ou une étiquette ». La page 9 déclare désormais à l’écran que les deux en-têtes sont notre mise en page et que rien ne les atteste. Ce que la leçon garde de ces deux mots est leur SENS, sourcé deux fois chacun.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| B3 · PROD-MONO   | EXERCICE REFAIT, pas seulement reformulé. Les noms de plats deviennent des blocs INSÉCABLES : ข้าวผัดหมู est un seul jeton, jamais ข้าวผัด plus หมู. L’apprenant choisit un bloc affiché au lieu d’en fabriquer un, ce qui supprime la production de la suite mono-sourcée tout en gardant la mesure. La piste de l’audit a été vérifiée avant d’être suivie, et les planchers ont été RECALCULÉS sur les six nouveaux tirages : la stratégie de forme reste à 2,25 sur 6 d’espérance et 2,5 % de chances d’atteindre le seuil, le hasard complet passe de 0,83 % et 0,28 % à 4,2 % et 1,7 % par tirage, tous très loin de 5 sur 6. Ce que l’exercice mesure a changé et c’est écrit : non plus la composition, mais la découpe en deux blocs et le choix du bon nom dans le sens français vers thaï, que ni l’exercice 1 ni l’exercice 4 ne mesurent. La revendication de non-production est réécrite en termes vérifiables sur le produit, à l’item 5, à `srs-u10-l10c-04` et à l’incertitude 2. |
| B4 · REF-3D      | CORRIGÉ par re-sourçage interne. `node scripts/verification/repo-thai-scan.mjs 1 9 --grep จาน` rend trois graphies, จาน, ขอข้าวผัดสองจานหน่อยครับ et ขอข้าวผัดสองจานหน่อย, toutes dans `u04-l4c` et `u04-l4e`, et zéro dans `u03-l3d`, dont les huit items sont คน, ตัว, ใบ, อัน, ปลา, ปลาสองตัว, ถุงสองใบ et กี่คน. Le prérequis 3D est supprimé, จาน est rattaché à `u04-l4c` item 3 dans le prérequis 4C, et la page 4 renvoie à 4C.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| B5 · DUU         | CORRIGÉ par re-sourçage interne. `--grep ดู` rend ดู dans `u01-l1b` et ลองดู dans `u08-l8b` ; `u01-l1b` publie ดู à son item 10, `/duː˧/`, transcription `douu`, et `u07-l7d` le republie à son item 3 en rappelant qu’il avait été appris « en 1B pour sa voyelle longue ». La `note_fr` de l’item 1 dit maintenant l’inverse de ce qu’elle disait, et ดู est ajouté à la liste des graphies employées à l’écran, où il manquait.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| B6 · FREQ-VOIR   | SUPPRIMÉ, faute de source. Les deux affirmations sont des fréquences d’affichage et une ubiquité, que le seul signal disponible, un corpus de sous-titres que ce dossier déclare inadapté, ne peut pas porter. La page 7 dit maintenant « sur un mot que vous venez de rencontrer », la note culturelle remplace « il sert partout » par une observation que l’apprenant vérifie à l’écran, le mot appris est écrit en entier dans les deux composés, et la clause de non-affirmation de la note est étendue à la fréquence absolue.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| B7 · HO-TOUS     | CORRIGÉ par une règle MEILLEURE que celle proposée. L’audit suggérait « sur les mots de cette leçon » ; c’est vrai mais cela n’apprend rien. La page 6 énonce désormais les deux cas que le repère tranche sûrement, une voyelle derrière donc ห prononcé, une des six lettres derrière donc ห muet, et ordonne de ne rien conclure dans le troisième cas. Fondement relu : 5A déclare elle-même sa liste incomplète, et l’entrée de lettre du RID pose sa condition sur la CLASSE des basses seules et non sur une liste. Le contre-exemple n’est pas cité à l’écran, cela reviendrait à enseigner sans source la liste que 5A a reportée. Manque porté à l’arbitrage 7.                                                                                                                                                                                                                                                                                                                          |
| B8 · VOLU-CITE   | CITATIONS RÉTABLIES après relevé neuf. L’exemplaire a été ré-empreinté avant lecture, 10 848 409 octets, sha256 `b9ab7418…a20fc0c`, puis chaque ligne relue : ข้าวผัดไข่ 31817 porte `CULINA` seul et non `CULINA (menu)`, la généralisation à trois graphies est supprimée ; ราคา 80679 et ร้านอาหาร 81049 reçoivent leur `(Covid-19)` final ; อาหาร 337 reçoit ses trois gloses familières manquantes et son domaine est rendu à la seule ligne 337, la 338 portant `CULINA` seul ; กุ้ง 46832 reçoit son « écrevisse [f] » ; et ข้าวผัดกุ้ง 31822 reçoit `INSOLITE ; (THA)`, troncature de même classe que l’audit n’avait pas relevée.                                                                                                                                                                                                                                                                                                                                                         |
| N1 · RID-20      | CORRIGÉ. Les 22 graphies ont été réinterrogées le 2026-08-04 par `rid-lookup.mjs`. Le total passe de 20 / 13 / 7 à **22 / 14 / 8**, กุ้ง rendant `entree` et เมนู `absent`, et une cinquième sous-liste rend la somme recomputable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| N2 · UNICODE-172 | CORRIGÉ. La ligne du tableau annonçait 172 chaînes là où le corps et le script en rendaient 171. Le tableau ne porte plus de chiffre en double : il renvoie à la section Vérification Unicode, seul endroit où le relevé est écrit, et ce relevé a été refait après consolidation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| N3 · SYLL-12     | CORRIGÉ. La page 10 dit maintenant « douze syllabes DIFFÉRENTES », précise que trois d’entre elles reviennent et donne le total de dix-neuf, ce qui est le décompte du dossier, recompté et confirmé.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| N4 · TON-LECTURE | CORRIGÉ par reformulation, l’exercice étant juste. La déclaration SRS portait sur les cartes et a été lue comme portant sur la leçon entière. Elle dit maintenant qu’aucune carte ne demande de CALCULER ces tons, et signale explicitement que l’exercice 5 les fait restituer de mémoire, accent compris.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Ce que l’audit a attaqué sans le faire tomber est conservé tel quel : les
planchers des exercices 1, 2, 4 et 5, l’audit de lecture syllabe par syllabe, la
matrice de douze tirages de l’exercice 1, les trois réemplois stricts au champ
près, la nouveauté réelle des trois mots du jour, le fait que le RID nomme หมู
dans sa définition de ข้าวผัด, et le caractère construit du spécimen. Ces points
ont été re-vérifiés par l’auditeur et tiennent ; ils ne sont pas retouchés ici,
et un prochain auditeur n’a pas à les refaire.

Un point du relevé de l’auditeur n’est PAS un finding contre cette leçon et
demande une action ailleurs : le dossier de l’unité 10, vide à l’écriture,
compte maintenant cinq fichiers, et `lecon-10d.md` publie ราคา comme son item 1
en proposant lui-même que 10C publie et que 10D réemploie. C’est exactement le
risque annoncé en Méta et porté à l’arbitrage 1, qui devient exécutable.

### Ce que le contre-audit externe doit attaquer en priorité

Le contre-audit interne est passé ; **aucun contre-audit externe n’a relu ce
fichier**, et rien ici ne doit être lu comme validé. Les points à attaquer
d’abord, dans cet ordre :

1. la mise en page du spécimen, en-têtes อาหาร et ราคา compris, à éprouver comme
   plausible ou à démolir ;
2. les blocs ข้าวผัดหมู et ข้าวผัดไก่, mono-sourcés, et la question de savoir si
   une leçon peut faire LIRE ce qu’elle ne peut pas attester deux fois ;
3. **l’exercice 3 dans sa forme neuve**, blocs de plat insécables : ses six
   tirages et ses planchers sont recalculés depuis le contre-audit interne et
   n’ont donc été relus par personne d’autre que leur auteur. Vérifier surtout
   que le passage du bloc composé au bloc entier n’a pas transformé la mesure en
   simple appariement ;
4. les quatre autres planchers, à recalculer aussi ;
5. l’audit de lecture de la page 10, douze syllabes distinctes et dix-neuf
   écrites, cinq calculables, à recompter syllabe par syllabe et à confronter au
   tableau des onze cases de `u08-l8a` ;
6. la formulation neuve du repère du ห à la page 6, ses deux cas sûrs et son cas
   suspendu : elle doit être attaquée comme une règle, pas comme une phrase ;
7. le champ `fr` de หมู et sa portée restreinte ;
8. la naturalité du dialogue, et la substitution de ข้าวผัดหมู dans l’ossature
   de `u07-l7e` ;
9. les numéros de ligne VOLUBILIS, à recomputer graphie par graphie sur
   l’exemplaire empreinté ; ils l’ont été deux fois, mais c’est le contrôle qui a
   déjà rendu le plus de fautes de citation.

### Arbitrages à porter hors de cette leçon

Une leçon ne modifie ni `content/authoring/CONVENTIONS.md`, ni
`docs/content-policy/sources-verification.md`, ni les scripts du dépôt, ni les
cartes SRS d’une autre leçon. Ces points sont donc SIGNALÉS et attendent un
arbitrage au niveau du dépôt.

1. **Le relevé de collisions de l’unité 10 est FAIT, et il rend une collision
   réelle que 10C ne peut pas trancher seule.**
   `node scripts/verification/repo-thai-scan.mjs 10 10`, exécuté le 2026-08-04,
   rend 5 fichiers, 32 entrées et 31 graphies : ราคา est publié par 10C, item 2,
   et par 10D, item 1, cette dernière déclarant elle-même son attribution en
   suspens et proposant que 10C publie. **Arbitrage demandé, en deux parties.**
   D’abord appliquer la règle d’attribution proposée par `u09-l9a`, la leçon la
   plus précoce publie et les autres réemploient, et écrire la décision dans les
   deux fichiers à la fois. Ensuite corriger l’outil : `repo-thai-scan.mjs` ne
   conserve que le premier fichier où une graphie apparaît, `firstSeen` à sa
   ligne 138, et **il ne sait donc pas dépouiller une collision**, ce que cet
   arbitrage lui demandait. Rendre tous les fichiers d’une graphie, ou au
   minimum une liste des graphies vues plus d’une fois.
2. **Le ton des syllabes mortes et la consonne de tête sont les deux dernières
   pièces manquantes de la lecture, et l’unité 10 les rend voyantes.**
   `u09-l9a` avait explicitement demandé, à son incertitude 6, que ce manque soit
   arbitré au niveau de l’unité 10. Il ne l’a pas été : 10C constate que sur les
   douze syllabes de sa carte, sept ont un ton donné, dont trois pour l’un ou
   l’autre de ces deux motifs. **Arbitrage demandé** : soit ouvrir ces deux
   règles dans l’unité 10 ou la suivante, soit acter par écrit que le parcours
   n’enseignera jamais la lecture complète du ton et le dire aux apprenants,
   mais cesser de le signaler leçon après leçon sans trancher.
3. **Le fil des tons demande un entretien, et le parcours répond par une carte de
   plus à chaque leçon.** `u08-l8a` puis `u09-l9a` l’ont signalé, la seconde pour
   la cinquième fois. 10C n’a créé aucune carte de ton et APPORTE ses tirages à
   `srs-u04-l4a-06` ; mais une leçon ne peut pas modifier la carte d’une autre.
   **Arbitrage demandé** : le même que celui de `u09-l9a`, exécuter l’ajout à la
   consolidation ou acter le recouvrement, mais trancher.
4. **Aucun outil du dépôt ne sait dire ce qu’une carte SRS mesure.** Le motif de
   création de `srs-u10-l10c-02` repose sur une lecture humaine des 243 lignes
   d’ouverture de cartes, ce qui ne couvre pas leur corps. C’est la même classe
   de défaut que les findings `COORD-42-3` et `COMPTE-LETTRES` de `u09-l9a`.
   **Arbitrage demandé** : ajouter au dépôt un relevé des cartes SRS par
   compétence mesurée, ou au minimum un script qui les extraie en entier plutôt
   que par leur première ligne.
5. **La dette de réancrage VOLUBILIS des unités 4 à 7 n’est pas théorique.**
   L’amendement v1.3 l’a datée et assumée ; en réemployant บาท, cette leçon a
   constaté que `u03-l3c` cite la ligne 4504 du `.ods` et `u07-l7e` la ligne 4656
   du même `.ods` pour la même graphie. L’une des deux au moins est fausse.
   **Arbitrage demandé** : réancrer les unités 3 à 7 sur le `.xlsx` avant leur
   passage en `review`, en commençant par les graphies citées deux fois.
6. **`item-fields-check.mjs` ne sait pas résoudre une référence à l’unité 10.**
   Sa reconnaissance est `^u(\d\d)-l(\d)([a-e])$`, à un seul chiffre pour le
   numéro de leçon. Aucune leçon de l’unité 10 ne peut donc voir son réemploi
   vérifié depuis une autre leçon de la même unité, et le contrôle de fidélité
   que ce script a été écrit pour rendre obligatoire cesse de fonctionner
   exactement au moment où l’unité 10 en aurait le plus besoin. **Arbitrage
   demandé** : élargir la reconnaissance à `l(\d{1,2})` et vérifier que la
   construction du chemin de fichier suit.
7. **Le repère du ห de 5A est énoncé sur une liste de six lettres que 5A
   déclare elle-même incomplète, et rien dans le dépôt ne dit quand la suite
   arrive.** Le contre-audit interne du 2026-08-04 a montré qu’une leçon de
   lecture appliquée finit mécaniquement par pousser ce repère au delà de ce
   qu’il couvre : 10C l’avait fait, et l’a corrigé en bornant le geste aux deux
   cas sûrs. La correction tient pour 10C, mais elle ne résout pas le manque.
   **Arbitrage demandé** : compléter la liste des basses seules dans une leçon
   des unités 10 ou 11, sur une source du projet qui les énumère, ou acter par
   écrit que le parcours s’en tient à six lettres et le dire aux apprenants.
   10C ne modifie pas `u05-l5a`, conformément à la règle du dépôt.

- Lot de contre-audit externe : à préparer dans
  `content/authoring/unite-10/contre-audit-gpt56.md`, en portant l’incertitude 3
  en tête de lot, puis l’incertitude 2, l’exercice 3 dans sa forme neuve, et
  enfin les incertitudes 1 et 9.
- **Statut : `draft`. Revue native : en attente.** Contre-audit interne PASSÉ le
  2026-08-04, relevé conservé dans `verification-10c.md`, 8 findings bloquants et
  4 non bloquants tous traités et vérifiés un par un. **Cela ne suffit PAS à
  passer en `review`**, et les trois portes restantes sont nommées plutôt que
  sous-entendues : le contre-audit externe n’est pas lancé ; l’incertitude 3, la
  mise en page inventée, reste ouverte et n’est traitée que par une déclaration
  honnête à l’écran ; et l’attribution de ราคา entre 10C et 10D, arbitrage 1,
  n’appartient pas à cette leçon. Les contrôles mécaniques du dépôt applicables
  à ce fichier, `unicode-thai.mjs`, `item-fields-check.mjs`, `repo-thai-scan.mjs`
  sur les unités 1 à 9 puis 10 à 10, `rid-lookup.mjs` sur 22 graphies et
  `volubilis-lookup.mjs` sur l’exemplaire empreinté, ont tous été RÉEXÉCUTÉS
  après consolidation le 2026-08-04 et leurs sorties sont consignées ci-dessus.
