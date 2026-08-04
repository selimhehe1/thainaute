# Leçon 12C : Relire tout l’alphabet

## Méta

- Identifiant : `u12-l12c`
- Titre français : Relire tout l’alphabet
- Objectif observable : devant un mot thaï déjà connu, affiché **sans
  transcription et sans être entendu**, l’apprenant nomme la classe de la
  consonne initiale sur 10 tirages sur 12 ; il dit si la syllabe est vivante,
  morte, ou hors du domaine de la méthode, sur 12 tirages sur 14 ; il donne le
  ton, ou déclare qu’il s’arrête, sur 11 tirages sur 14 ; il apparie six mots à
  leur case du tableau, 6 sur 6 ; et il écrit en transcription, accents de ton
  compris, huit mots qu’il vient de lire, 6 sur 8.
- Nature : **dernière leçon d’écriture du parcours.** Le fil « écriture » a
  couvert l’alphabet par blocs des unités 1 à 9, l’unité 10 l’a appliqué à des
  supports réels et a retiré l’échafaudage de transcription. 12C ne rajoute rien
  à ce fil : elle le remonte en entier, en une seule leçon, sur des mots déjà
  publiés, et elle **mesure ce qu’il permet réellement de lire**.
- **Aucun mot nouveau, et c’est vérifié plutôt qu’annoncé.** Les treize items du
  jour sont des RÉEMPLOIS, tous publiés par les unités 1 à 11, chacun repris avec
  la référence de sa leçon d’origine au titre de l’item pour que
  `item-fields-check.mjs` puisse comparer les champs un par un. Le relevé est au
  dossier. Le seul champ propre à 12C est `note_fr`, qui porte le décodage du
  jour et non la difficulté d’origine.
- **Ce que la leçon AJOUTE, et c’est une seule chose, sourcée deux fois.** La
  page 5 de `u10-l10a` énonce la frontière entre syllabe vivante et syllabe morte
  en deux branches : voyelle longue sans finale, ou fermeture sur ง, น, ม, ย, ว
  d’un côté ; fermeture sur un son `k`, `t` ou `p` de l’autre. **Il manque une
  branche** : une syllabe OUVERTE à voyelle BRÈVE est morte elle aussi. Le
  parcours publie sept graphies dans ce cas, et sur les cinq qui ne portent pas
  de marque, le tableau des vivantes donne le mauvais ton cinq fois sur cinq.
  L’ajout est donc une correction de portée, pas un enrichissement : sans lui, la
  méthode donne une réponse fausse à un apprenant qui l’applique correctement.
  Sources et mesure à la partie 3 du dossier, amendement demandé à
  l’arbitrage 1.
- **Ce que la leçon N’enseigne PAS, et le refus est délibéré.** La règle de ton
  des syllabes MORTES existe, elle est écrite dans les trois entrées de classe du
  dictionnaire normatif, et `u10-l10a` l’a lue à son incertitude 1 sans
  l’enseigner faute d’une seconde autorité. **12C apporte cette seconde jambe**,
  sous forme de mesure : sur les 33 graphies mortes sans marque du corpus dont la
  longueur de voyelle est déclarée, la règle du dictionnaire prédit le ton publié
  **33 fois sur 33, zéro contre-exemple**. Et 12C ne l’enseigne pas davantage.
  Une leçon de bilan qui n’enseigne aucun mot nouveau n’est pas le bon endroit
  pour ouvrir une règle de lecture neuve à trois branches ; la mesure est versée
  au dossier et la décision est portée à l’arbitrage 2. **Sur l’écran, la
  consigne reste celle de `u10-l10a` : syllabe morte, on s’arrête.**
- **Coordination d’unité, RECOMPUTÉE au contre-audit interne du 2026-08-04, et
  trois relevés antérieurs s’étaient périmés.** Le fichier a d’abord été écrit
  contre un `content/authoring/unite-12/` VIDE, puis contre trois fichiers
  sœurs. Le relevé qui fait foi est celui du contre-audit :
  `node scripts/verification/repo-thai-scan.mjs 12 12` rend **5 fichiers,
  13 entrées et 13 graphies distinctes**.
  - **Les treize entrées comptées par l’outil sont celles de ce fichier, et
    d’aucun autre.** Un comptage par fichier du motif de champ `thai` rend 13
    pour `lecon-12c.md` et 0 pour `lecon-12a.md`, `lecon-12b.md`,
    `lecon-12d.md` et `lecon-12e.md`, relevé du 2026-08-04. L’outil compte donc comme entrées d’unité 12 les
    treize blocs de RÉEMPLOI de cette leçon. **La phrase « l’unité 12 ne publie
    aucun item » a été retirée** : elle était vraie tant que ce fichier
    n’existait pas, et fausse dès qu’il existe.
  - **Ce qui reste vrai, et c’est le fait dont la leçon a besoin** :
    `repo-thai-scan.mjs 1 11` rend 55 fichiers, 512 entrées, **353 graphies
    distinctes** ; `repo-thai-scan.mjs 1 12` rend 60 fichiers, 525 entrées, et
    les **mêmes 353 graphies distinctes**. Aucune graphie nouvelle n’entre par
    l’unité 12, ni par 12C. Aucune collision d’attribution n’est possible,
    puisque 12C est la seule leçon de l’unité à porter des blocs d’item et que
    ses treize graphies sont toutes publiées ailleurs.
  - **Ce que 12C a vérifié chez ses sœurs plutôt que de le supposer, relevé du
    2026-08-04.** La page 12 de `u12-l12a` ne dit plus ce que ce fichier lui
    faisait dire : elle donne ses propres chiffres, « Sur les 353 graphies que
    le parcours publie, la méthode … se vérifie sur 94 … Pour les 259 autres
    elle ne dit rien : 193 comptent plus d’une syllabe, 38 sont des syllabes
    mortes …, et 28 sont explicitement hors de son domaine ». **Les deux écrans
    concordent sur 353, sur 94 et sur 38 ; ils divergent d’une unité de compte
    sur les polysyllabiques**, 193 chez 12A contre 191 ici, parce que 12A
    absorbe dans son total les deux graphies que `lecture-corpus.mjs` imprime à
    part. La divergence est exposée à la page 13 et portée à l’arbitrage 9.
    La page 6 de `u12-l12e` compte « 353 entrées de vocabulaire distinctes,
    réparties sur 60 leçons », relue le 2026-08-04 : même nombre d’entrées,
    même script, même convention.
  - **Ce que 12C n’a PAS fait** : modifier les quatre autres fichiers. Deux
    écarts de décompte relevés chez `u12-l12a` et `u12-l12e` sont signalés aux
    arbitrages 5 et 9, pas corrigés ici.
- Prérequis, et ils sont lourds, parce que la leçon ne fait que rassembler :
  - `u01-l1a` : les neuf consonnes moyennes, et la première série de tons ;
  - `u03-l3b` : le signe ◌็, qui raccourcit la voyelle sans toucher au ton ;
  - `u04-l4a` : les **neuf** consonnes hautes d’usage courant, la règle du ton,
    et la mise hors domaine des formes en ไ, ใ, เ◌า et ◌ำ ;
  - `u05-l5a` : les **neuf premières** consonnes basses, et le critère de
    CONTACT qui reconnaît une consonne de tête ;
  - `u06-l6a` : **sept** consonnes basses de plus, soit seize des vingt-quatre ;
  - `u07-l7a` : les deux marques ◌่ et ◌้, et les six cases qu’elles ouvrent ;
  - `u08-l8a` : les deux marques ◌๊ et ◌๋, les groupes de consonnes, et la règle
    voulant que la PREMIÈRE lettre du groupe commande ;
  - `u09-l9a` : les **familles de fin**, les finales écrites, et le signe ◌์ qui
    éteint une lettre ;
  - `u10-l10a` : la méthode en trois questions, l’échafaudage de transcription à
    trois états, et la porte des syllabes mortes. 12C la reprend, la corrige d’un
    point et la mesure.
- Cible phonétique : **aucun son nouveau, et aucune graphie nouvelle.** Les
  treize items sont publiés ailleurs, les quinze spécimens du tableau aussi,
  contrôle au dossier, refait par extraction mécanique des écrans au
  contre-audit interne.
- **Fil des tons, et l’écart est SIGNALÉ plutôt que maquillé**, conformément à
  `CONVENTIONS.md`, section « Fil des tons », qui demande pour les unités 8 et
  suivantes qu’une leçon ayant besoin d’un contraste « le rappelle et le fasse
  pratiquer ». Les deux contrastes restent **entretenus, jamais supposés
  acquis**, mais 12C ne les fait pratiquer À L’OREILLE nulle part, parce
  qu’aucun mot n’est audible avant la réponse et qu’il n’y a pas d’exercice
  `listening`.
  1. **montant contre haut**, sur-entraîné en unité 4. Les tirages ขา, สอง et ถุง
     de l’exercice 3 demandent un ton MONTANT, น้อง et แล้ว un ton HAUT, et la
     même page 7 les met côte à côte. **Le contraste est donc travaillé à l’ŒIL,
     pas à l’oreille**, et aucun écran ne rejoue la paire หมา contre ม้า de
     `u01-l1d`.
  2. **moyen contre bas**, sur-entraîné en unité 7. Les tirages กิน et มา
     demandent un ton MOYEN, ป่า et สี่ un ton BAS. Même réserve : aucun écran ne
     rejoue la paire ปา contre ป่า de `u01-l1c`.
     Le seul entretien à l’oreille passe donc par la comparaison A/B proposée après
     chaque réponse de l’exercice 3 et par la page 14, puis par les deux cartes
     existantes. Les apports à `srs-u04-l4a-06` et `srs-u07-l7a-03` sont des
     DEMANDES consignées, à exécuter à la consolidation, et ce dossier établit
     lui-même qu’aucune demande des unités 9 à 12 n’a encore été exécutée. **L’écart
     au fil des tons est donc réel, il est porté à l’arbitrage 3, et il n’est pas
     résolu par cette leçon.**
- **État de l’échafaudage de transcription**, au sens de la page 9 de
  `u10-l10a`, qui définit `absent` par « thaï seul, aucune révélation avant la
  réponse ». La déclaration est faite écran par écran, contre ce que chaque champ
  Interaction dit réellement afficher :
  - les pages 1 à 7 et 13 à 14 sont à l’état `visible` : elles expliquent la
    méthode et ne mesurent rien ;
  - **les pages 8 à 12, l’escalier, sont à l’état `au_toucher`** : le mot est
    seul, on le décode à voix haute, et la transcription apparaît au toucher.
    Demander à voir ne coûte rien et n’est pas une faute ;
  - **les exercices 1, 2, 3 et 5 sont à l’état `absent`.** Aucun d’eux ne mesure
    ce qu’il annonce si une transcription est visible : elle donnerait le ton, la
    classe et la longueur d’un coup, et les planchers écrits plus bas
    deviendraient faux ;
  - **l’exercice 4 est à l’état `absent` lui aussi**, pour la même raison : la
    transcription y donnerait la réponse.
- **Aucun audio avant la réponse, dans aucun exercice, et c’est une contrainte de
  mesure et non de confort.** Cette leçon mesure ce que l’ŒIL sait faire seul.
  Un mot entendu avant la réponse laisse l’oreille répondre à la place de l’œil,
  et les cinq planchers deviennent faux. L’audio est joué APRÈS chaque réponse,
  toujours, et la comparaison A/B est proposée.
- Durée visée : 18 minutes, et elle remonte six blocs d’écriture. Relevé du
  2026-08-04 : `u12-l12a` et `u12-l12b` visent 18 minutes elles aussi et
  `u12-l12d` en vise 20. **La leçon n’est donc pas la plus longue de l’unité**,
  et la phrase qui l’affirmait a été retirée.
- Transcription : convention `thainaute-fr` v1.1.
- Statut : `draft`. **Revue native : en attente.** **Contre-audit interne PASSÉ
  le 2026-08-04**, quatre findings bloquants et huit non bloquants, tous traités
  au dossier. Contre-audit externe NON LANCÉ.

## Enseignement

### Page 1 : ce que cette leçon fait, et ce qu’elle ne fait pas

Vous n’apprendrez aucun mot aujourd’hui. Tous les mots de cette leçon, vous les
avez déjà vus, certains depuis la première unité. Ce qui est neuf, c’est
l’exercice : les prendre un par un, sans transcription et sans les entendre, et
retrouver leur ton par le seul chemin de l’écriture.

Cette leçon ne vous dira pas à quel niveau vous êtes, et aucune page ne vous
comparera à qui que ce soit. Elle ne vous dira pas non plus combien de mots vous
savez lire : elle n’a aucun moyen de le savoir. Ce qu’elle sait dire est plus
petit et plus solide : sur les mots que ce cours a publiés, **combien la méthode
permet d’en lire entièrement, et où exactement elle s’arrête**. De vous, seuls
les cinq exercices de la fin diront quelque chose, et seulement sur les mots
qu’ils tirent.

Spécimen : จาน · ป่า · เปลี่ยน

### Page 2 : les quatre questions, dans l’ordre

`u10-l10a` vous a donné trois questions. En voici quatre, parce que la troisième
en contenait deux : ce que vous REGARDEZ à la fin du mot, et ce que vous en
CONCLUEZ. Posez-les toujours dans cet ordre.

> **Un.** Quelle est la consonne INITIALE, et de quelle CLASSE est-elle ?
> **Deux.** Y a-t-il une MARQUE de ton au-dessus ?
> **Trois.** Par quoi la syllabe se FERME-t-elle, ou ne se ferme-t-elle pas ?
> **Quatre.** La syllabe est-elle VIVANTE ou MORTE ?

La quatrième ne se devine pas : elle se déduit de la troisième, et de la longueur
de la voyelle quand rien ne ferme. Si la réponse est MORTE, vous vous arrêtez, et
c’est la bonne réponse. Si elle est VIVANTE, vous croisez la classe et la marque,
et vous avez le ton.

Spécimen : กิน · รถ

### Page 3 : question un, la consonne initiale et sa classe

C’est la question qui décide de tout, et elle se rate toujours de la même façon :
en prenant la première LETTRE au lieu de la première CONSONNE. Trois cas, et vous
les connaissez tous les trois.

> เ, แ, โ, ใ et ไ s’écrivent AVANT leur consonne. Dans แล้ว, l’initiale est ล.
> Deux consonnes collées comptent pour une seule initiale, et c’est la PREMIÈRE
> qui commande. Dans เปลี่ยน, l’initiale est ป.
> La marque n’est pas toujours posée sur l’initiale. Dans เปลี่ยน toujours, elle
> est empilée au-dessus du ล, par-dessus le ◌ี. C’est quand même ป qui commande.

Une fois la lettre trouvée, il faut sa classe. Les classes sont trois, et le
dictionnaire normatif les énumère lettre par lettre : neuf moyennes, onze
hautes, vingt-quatre basses.

> **MOYENNES**, neuf : ก จ ฎ ฏ ด ต บ ป อ
> **HAUTES**, onze : ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห
> **BASSES**, vingt-quatre : ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ

**Cette liste est celle du dictionnaire, et pas celle de ce cours.** Sur ces
quarante-quatre lettres, ce cours vous en a enseigné trente-quatre comme
initiales : les neuf moyennes en 1A, neuf hautes en 4A, neuf basses en 5A et
sept de plus en 6A. **Dix ne vous ont jamais été enseignées à cette place**, et
les voici pour que vous sachiez qu’elles existent et qu’elles vous manquent :
ฃ, ฐ, ฅ, ฆ, ฌ, ญ, ฑ, ฒ, ณ et ฬ. Quatre d’entre elles, ฆ, ญ, ณ et ฬ, vous les
avez croisées en 9A, mais à la FIN d’une syllabe, où la question de la classe ne
se pose pas. Aucun exercice du jour ne porte sur ces dix lettres, et cette leçon
ne mesure rien à leur sujet.

Spécimen : แล้ว (ล) · เปลี่ยน (ป) · เพลง (พ)

### Page 4 : question deux, la marque

Rien, ou l’une des quatre. Vous les lisez toutes depuis 8A, et leurs noms sont
des numéros.

> ◌่ ไม้เอก · ◌้ ไม้โท · ◌๊ ไม้ตรี · ◌๋ ไม้จัตวา

Deux signes se posent au même endroit et n’en sont pas. Le ◌็ de เจ็บ raccourcit
la voyelle. Le ◌์ de แพทย์, appris en 9A, éteint la lettre qui le porte. Ni l’un
ni l’autre ne change un ton.

Une remarque qui vous évitera une confusion durable : **le numéro de la marque
n’est pas le nom du ton qu’elle produit.** ไม้เอก, la marque un, ne donne pas
toujours le même ton, et le ton qu’elle donne ne s’appelle pas « un ». Ce qui
décide, c’est le croisement avec la classe, et la page 7 vous le remet en entier.

Spécimen : ป่า (◌่) · ห้า (◌้) · เจ็บ (◌็, pas un ton) · แพทย์ (◌์, pas un ton)

### Page 5 : question trois, la finale

Regardez la fin du mot et rangez-la dans l’une des trois cases suivantes. Ce sont
les familles de fin de 9A, réduites à ce que la lecture du ton demande.

> **Rien ne ferme.** Le mot s’arrête sur sa voyelle : มา, ขา, ป่า, พ่อ.
> **Une sonante ferme**, c’est-à-dire ง, น, ม, ย ou ว : กิน, สอง, บ้าน, แล้ว.
> **Un son `k`, `t` ou `p` ferme** : รถ, มาก, ชอบ.

Un piège de lecture à ne pas laisser passer, parce qu’il touche deux mots du
jour. Dans สอง et dans พ่อ, le อ n’est PAS une consonne finale : c’est la
voyelle, le `aww` long. Le อ ne ferme jamais une syllabe thaïe. En revanche, un อ
écrit AVANT une autre consonne peut être une consonne de tête, comme dans อยู่,
et là vous sortez du domaine.

Spécimen : สอง (le อ est une voyelle) · อยู่ (le อ est une tête)

### Page 6 : question quatre, vivante ou morte

C’est la question qui dit si le tableau vous concerne. Elle se répond à partir de
la troisième, plus la longueur de la voyelle lorsque rien ne ferme.

> **VIVANTE** : la syllabe se ferme sur ง, น, ม, ย ou ว ; **ou** rien ne la ferme
> et sa voyelle est LONGUE.
> **MORTE** : la syllabe se ferme sur un son `k`, `t` ou `p` ; **ou** rien ne la
> ferme et sa voyelle est BRÈVE.

Cette seconde branche des mortes est celle que `u10-l10a` n’avait pas donnée, et
elle compte. คะ, และ et เตะ, que vous dites depuis les unités 2, 3 et 11, sont
des syllabes ouvertes à voyelle brève : elles sont MORTES, et si vous leur
appliquez le tableau vous vous trompez à chaque fois. Le dictionnaire normatif
les range explicitement du côté des mortes, et l’autre ouvrage consulté nomme
lui aussi le critère de la voyelle brève sans finale.

Un cas qui surprend, et il vaut mieux le voir maintenant : ถุง a une voyelle
BRÈVE et il est pourtant VIVANT, parce qu’il se ferme sur ง. **C’est la fermeture
qui décide en premier ; la longueur ne décide que si rien ne ferme.**

Spécimen : ถุง (brève, mais VIVANTE) · คะ (brève, ouverte, MORTE)

### Page 7 : le tableau entier, et un mot du jour dans chaque case

Voici les neuf cases, avec un mot que vous allez décoder tout à l’heure. Le
tableau ne vaut QUE pour les syllabes vivantes.

> **MOYENNE** : rien → moyen (กิน) · ◌่ → bas (ป่า) · ◌้ → descendant (บ้าน)
> **HAUTE** : rien → montant (ขา) · ◌่ → bas (สี่) · ◌้ → descendant (ห้า)
> **BASSE** : rien → moyen (มา) · ◌่ → descendant (พ่อ) · ◌้ → haut (น้อง)

Regardez les colonnes plutôt que les lignes, et une seule chose reste à retenir :
**moyenne et haute vont ensemble, la classe basse se détache et se place d’un
cran plus haut.** ป่า et สี่ portent le même ◌่ sur deux classes différentes et
donnent le même ton bas ; พ่อ porte le même ◌่ sur une basse et donne un
descendant. Même signe, deux réponses.

Deux cases manquent à ce tableau et vous les avez apprises en 8A : la classe
moyenne avec ◌๊ donne le ton haut (เก๊), et avec ◌๋ le ton montant (ตั๋ว). Aucun
exercice du jour ne les demande, et le motif est un décompte : ce sont les deux
seuls mots d’UNE SEULE SYLLABE que le parcours publie dans ces deux cases. Une
troisième graphie porte bien un ◌๋ sur une consonne moyenne, กระเป๋า, mais elle
compte deux syllabes et la syllabe marquée est une forme en เ◌า, que 4A a mise
hors du domaine. Deux mots, et un troisième qu’on ne peut pas compter : cela ne
suffit pas à mesurer quoi que ce soit.

Spécimen : ป่า · สี่ · พ่อ

### Page 8 : palier 1, quatre mots nus

On monte l’escalier. À chaque marche, une complication de plus, et rien d’autre.
Ici, la forme la plus simple qui existe : une consonne, une voyelle longue, rien
après. Décodez à voix haute avant de toucher pour voir.

**มา.** Un : l’initiale est ม, basse. Deux : rien au-dessus. Trois : rien ne
ferme. Quatre : voyelle longue, donc VIVANTE. Basse sans marque donne le ton
MOYEN. maa.

**ขา.** Un : ข, haute. Deux : rien. Trois : rien ne ferme. Quatre : longue, donc
vivante. Haute sans marque donne le ton MONTANT. khǎa.

**ป่า.** Un : ป, moyenne. Deux : un ไม้เอก. Trois : rien ne ferme. Quatre :
vivante. Moyenne plus ไม้เอก donne le ton BAS. pàa.

**พ่อ.** Un : พ, basse. Deux : le MÊME ไม้เอก. Trois : rien ne ferme, le อ est la
voyelle. Quatre : longue, donc vivante. Basse plus ไม้เอก donne le ton
DESCENDANT. phâww.

Les deux derniers portent le même signe et n’ont pas le même ton. La marque seule
ne décide de rien.

Spécimen : มา · ขา · ป่า · พ่อ

### Page 9 : palier 2, les deux marques sur une classe haute

Deux mots, deux cases, et le point de la page 7 vérifié sur pièces.

**สี่.** Un : ส, haute. Deux : un ไม้เอก, empilé au-dessus du ◌ี. Trois : rien ne
ferme. Quatre : voyelle longue, donc vivante. Haute plus ไม้เอก donne le ton BAS,
exactement comme ป่า, qui est une moyenne. sìi.

**ห้า.** Un : ห, haute. Deux : un ไม้โท. Trois : rien ne ferme. Quatre : vivante.
Haute plus ไม้โท donne le ton DESCENDANT. hâa.

Une vigilance sur ห้า, et c’est le seul piège de la page. Vous savez depuis 5A
qu’un ห peut être muet et servir de tête. Le repère est le CONTACT : le ห se tait
quand ง, น, ม, ย, ว ou ร est collé juste derrière lui, sans le moindre signe posé
sur le ห. Dans ห้า, le ห porte un ไม้โท et la lettre suivante est une voyelle :
il est bien l’initiale, et c’est lui qu’on lit. Dans หมา, le ม est collé derrière
un ห nu : là vous sortez du domaine.

Spécimen : ห้า (le ห est l’initiale) contre หมา (le ห est une tête)

### Page 10 : palier 3, la syllabe se ferme

Une consonne de plus à la fin, et la troisième question devient utile.

**กิน.** Un : ก, moyenne. Deux : rien, le ◌ิ est une voyelle. Trois : ferme sur
น. Quatre : sonante, donc VIVANTE. Moyenne sans marque donne le ton MOYEN. kin.

**สอง.** Un : ส, haute. Deux : rien. Trois : ferme sur ง ; le อ est la voyelle et
ne ferme rien. Quatre : vivante. Haute sans marque donne le ton MONTANT. sǎwwng.

**บ้าน.** Un : บ, moyenne. Deux : un ไม้โท. Trois : ferme sur น. Quatre :
vivante. Moyenne plus ไม้โท donne le ton DESCENDANT. bâan.

**น้อง.** Un : น, basse. Deux : le MÊME ไม้โท. Trois : ferme sur ง. Quatre :
vivante. Basse plus ไม้โท donne le ton HAUT. náwwng.

Encore une fois, deux mots, un seul signe, deux tons. Et encore une fois c’est la
classe qui a tranché.

Spécimen : กิน · สอง · บ้าน · น้อง

### Page 11 : palier 4, la voyelle s’écrit avant sa consonne

Une marche de plus, et elle ne change rien à la méthode : elle change seulement
l’endroit où vous regardez.

**แล้ว.** Un : la première lettre écrite est แ, une voyelle ; l’initiale est ล,
en deuxième position, et elle est basse. Deux : un ไม้โท, posé sur le ล. Trois :
ferme sur ว. Quatre : sonante, donc vivante. Basse plus ไม้โท donne le ton HAUT.
láeew.

C’est exactement le décodage que `u09-l9d` avait écrit dans sa note d’item quand
elle a publié ce mot. Vous le refaites seul aujourd’hui.

Spécimen : แล้ว

### Page 12 : palier 5, deux consonnes collées, puis tout à la fois

La dernière marche, et elle empile toutes les autres.

**เพลง.** Un : เ est une voyelle ; viennent ensuite พ et ล, collées, qui comptent
pour une seule initiale, et c’est พ qui commande, basse. Deux : rien. Trois :
ferme sur ง. Quatre : vivante. Basse sans marque donne le ton MOYEN. phleeng.

**เปลี่ยน.** Un : เ est une voyelle ; ป et ล sont collées et comptent pour une
initiale ; c’est ป qui commande, moyenne. Deux : un ไม้เอก, et il n’est PAS sur
le ป : il est empilé au-dessus du ล, par-dessus le ◌ี. Trois : ferme sur น.
Quatre : vivante. Moyenne plus ไม้เอก donne le ton BAS. plìan.

Si vous aviez lu ล comme initiale, une basse, vous auriez obtenu un descendant.
Le mot se dit plìan : c’est bien ป, la première du groupe, qui a commandé. C’est
le mot qui empile le plus de complications de cette leçon : une voyelle écrite
avant sa consonne, deux lettres qui comptent pour une initiale, une marque posée
sur la deuxième et non sur celle qui commande, et une finale.

**Une honnêteté sur les groupes, et elle n’a pas changé depuis 10A.** Deux
consonnes collées ne forment pas toujours un groupe. Dans ตลาด, que vous dites
tà·làat en deux temps, ต et ล ne se lisent pas d’un seul élan. À l’œil, rien ne
distingue ตลาด de ปลา. En cas de doute, fiez-vous à ce que vous entendez.

Spécimen : เพลง · เปลี่ยน · ตลาด (deux temps) contre ปลา (un temps)

### Page 13 : où vous vous arrêtez, et c’est compté

Quatre familles restent hors de la méthode. Les voici avec leur nombre, mesuré
sur les 353 entrées de vocabulaire que ce cours publie, et non estimé.

> **Les syllabes mortes.** 38 entrées. Si vous leur appliquez quand même le
> tableau, il donne le mauvais ton 36 fois sur 38. Les deux exceptions portent
> une marque écrite.
> **Les formes en ไ, ใ, เ◌า et ◌ำ.** 16 entrées, dont ไม่, ไป, น้ำ et เข้า.
> **Les mots à consonne de tête**, un ห ou un อ muet devant la vraie initiale.
> 11 entrées, dont หมา, หนึ่ง, อยู่ et หมอ.
> **Une lettre éteinte par ◌์.** 1 entrée, แพทย์.

Et une cinquième famille, qui n’est pas hors du domaine mais hors de portée pour
une autre raison : **191 entrées comptent plusieurs syllabes**. La méthode se lit
une syllabe à la fois, et ce cours ne vous a jamais appris à couper un mot thaï
en syllabes.

Restent deux entrées que ces cinq familles ne rangent nulle part, et il vaut
mieux les nommer que de laisser le compte tomber faux : une entrée de 3B qui
tient sept nombres sur une seule ligne, et ก็, dont la graphie est trop
irrégulière pour être décomposée. **38 plus 16 plus 11 plus 1 plus 191 plus 2
font 259.**

Reste ce que la méthode lit entièrement : **94 entrées d’une seule syllabe, et
sur ces 94, le tableau donne le ton publié 94 fois sur 94.** Ce n’est pas une
promesse, c’est un décompte, et il porte sur le COURS, pas sur vous. Ce que vous
en avez gardé, seuls les exercices qui suivent le mesureront, et seulement sur ce
qu’ils tirent.

Spécimen : ๙๔ · 94

### Page 14 : ce que la méthode ne dit pas, et ce qui vient ensuite

Ce cours ne vous a pas donné la règle des syllabes mortes. Elle existe, elle est
écrite dans le dictionnaire, elle a quatre branches, et ce cours a choisi de ne
pas l’enseigner plutôt que de l’enseigner à moitié. Vous vous arrêtez donc devant
รถ et devant มาก, et c’est la bonne réponse aujourd’hui.

Il ne vous a pas donné non plus ce que fabrique une consonne de tête, ni comment
se coupent les mots de plusieurs syllabes, ni ce que valent les formes en ไ. Ce
sont quatre chantiers, ils sont nommés, et aucun n’est commencé.

**Ce cours ne vous dit ni à quel niveau vous êtes, ni combien de temps il vous
faudrait pour ces quatre chantiers.** Il n’a fait passer aucun test étalonné et
n’a comparé vos réponses à celles de personne. Ce qu’il sait de vous tient dans
les cinq exercices qui suivent.

Après les exercices, enregistrez-vous en disant ป่า puis พ่อ, et บ้าน puis น้อง,
et comparez en A/B avec la voix de référence. Vous entendrez ce que la classe de
l’initiale fabrique, sur le même signe. L’enregistrement reste privé, sur votre
appareil.

Spécimen : ป่า / พ่อ puis บ้าน / น้อง

## Items

Les treize items sont des **RÉEMPLOIS**. Aucun n’est publié par cette leçon,
aucun n’ouvre de carte de vocabulaire, et les champs `thai`, `codepoints`, `ipa`,
`ton`, `longueur`, `fr` et `transcription` sont repris SANS MODIFICATION de la
leçon qui publie chaque graphie. Chaque titre porte la référence `uXX-lYz` de
cette leçon, ce qui permet à
`node scripts/verification/item-fields-check.mjs content/authoring/unite-12/lecon-12c.md`
de comparer les champs un par un : c’est le contrôle que `u11-l11a` ne pouvait
pas faire faute de références au titre, et son relevé est au dossier. Le champ
`note_fr` est en revanche propre à 12C, puisqu’il porte le décodage du jour.

### Item 1 : มา (réemploi, publié par `u05-l5b` item 2)

- `thai` : มา
- `codepoints` : U+0E21 U+0E32 (NFC)
- `ipa` : /maː˧/
- `ton` : moyen
- `longueur` : longue
- `fr` : venir, arriver ; se déplacer vers celui qui parle
- `transcription` : maa
- `registre` : neutre
- `note_fr` : la première marche de l’escalier, et la forme la plus courte qui
  existe. Un : ม, basse. Deux : rien. Trois : rien ne ferme. Quatre : voyelle
  longue, donc vivante. Basse sans marque donne le ton MOYEN. Retenez la
  surprise plutôt que le résultat : une classe BASSE sans marque donne le ton
  moyen, exactement comme une classe MOYENNE, et c’est la seule case du tableau
  où les deux se rejoignent.
- `sources` :
  - Champs repris sans modification de `u05-l5b` item 2, relu dans le dépôt le
    2026-08-04.
  - RID 2554, Office of the Royal Society, entrée « มา », re-vérifiée le
    2026-08-04 par requête POST unique sur
    https://dictionary.orst.go.th/func_lookup.php avec
    `word=มา&funcName=lookupWord&status=lookup` : graphie attestée comme entrée
    autonome (fait cité par référence, définition non reproduite).
  - VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, feuille `Volubilis`, **ligne
    50905**, relevée le 2026-08-04 par
    `node scripts/verification/volubilis-lookup.mjs <xlsx> มา` (ThaiRom `mā`,
    ThaiPhon `-mā`, TYPE v., ENG « come ; arrive », FRA « venir ; arriver »,
    domaine `RID ; TOURIST`). Le `-` note le ton moyen, le macron la voyelle
    longue, feuille `Codes`, clé `TONES`. La **ligne 50904** donne le sens
    poétique de lune, non enseigné.
  - en.wiktionary, entrée « มา », https://en.wiktionary.org/wiki/มา, consultée en
    rendu le 2026-08-04 (IPA /maː˧/, Paiboon `maa`, Royal Institute `ma`, verbe
    « to move or come towards the speaker’s direction; to arrive »).
  - Classe de ม : RID, entrée « อักษรต่ำ », relevée le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs อักษรต่ำ`, qui énumère les
    vingt-quatre lettres de la classe basse, ม comprise ; annexe
    « Appendix:Thai script » d’en.wiktionary,
    https://en.wiktionary.org/wiki/Appendix:Thai_script, consultée le
    2026-08-04, colonne `Class` valant `low` pour ม ; et VOLUBILIS **ligne 991**,
    อักษรต่ำ, FRA « consonne basse », domaine `GRAMMA ; LINGUA`.

### Item 2 : ขา (réemploi, publié par `u01-l1a` item 5)

- `thai` : ขา
- `codepoints` : U+0E02 U+0E32 (NFC)
- `ipa` : /kʰaː˩˩˦/
- `ton` : montant
- `longueur` : longue
- `fr` : jambe
- `transcription` : khǎa
- `registre` : neutre
- `note_fr` : la même forme que มา, une classe de plus. Un : ข, haute. Deux :
  rien. Trois : rien ne ferme. Quatre : vivante. Haute sans marque donne le ton
  MONTANT. C’est la seule case du tableau qui produit un montant sans aucune
  marque écrite, et c’est pour cela que ce mot ouvre l’exercice 3.
- `sources` :
  - Champs repris sans modification de `u01-l1a` item 5, relu dans le dépôt le
    2026-08-04. **Ce réemploi-ci est le SEUL des treize que
    `item-fields-check.mjs` ne peut pas vérifier**, et le script le dit :
    « graphie absente de u01-l1a ». Elle n’en est pas absente. `u01-l1a` écrit
    ses champs d’item SANS guillemets obliques, `- thai : ขา`, alors que le
    script n’indexe que la forme ``- `thai` :``. `repo-thai-scan.mjs`
    reconnaît les deux formes et trouve bien la graphie. Le contrôle de cet item
    est donc une relecture manuelle, faite le 2026-08-04, et le point est porté à
    l’arbitrage 7. **Écart de notation signalé plutôt que tu** : `u01-l1d` item 3
    republie la même graphie avec les mêmes `ton`, `longueur`, `fr` et
    `transcription`, mais écrit l’`ipa` `/kʰǎː/`, avec un diacritique, là où
    `u01-l1a` écrit `/kʰaː˩˩˦/`, avec des lettres tonales. Les deux notent le ton
    montant. 12C reprend la forme de la leçon de PREMIÈRE publication, qui est
    aussi celle qu’en.wiktionary donne. Point porté à l’arbitrage 4.
  - RID 2554, entrée « ขา », re-vérifiée le 2026-08-04 par la même méthode qu’à
    l’item 1 : graphie attestée comme entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 28947**, relevée le 2026-08-04 (ThaiRom
    `khā`, ThaiPhon `/khā`, TYPE n., ENG « leg ; legs ; limb ; foot », FRA
    « jambe [f] ; … », domaine `ENTOMO ; MEDIC (anato) ; MINENG ; ORNITHO ;
RID ; TOURIST ; ZOOL`). Le `/` note le ton
    montant. Les lignes 28948 à 28951 donnent quatre autres emplois, non
    enseignés.
  - en.wiktionary, entrée « ขา », https://en.wiktionary.org/wiki/ขา, consultée en
    rendu le 2026-08-04 (IPA /kʰaː˩˩˦/, Paiboon `kǎa`, Royal Institute `kha`,
    nom « leg »).
  - Classe de ข : RID, entrée « อักษรสูง », relevée le 2026-08-04, qui énumère
    les onze lettres de la classe haute, ข comprise ; annexe « Appendix:Thai
    script », colonne `Class` valant `high` pour ข ; VOLUBILIS **ligne 990**,
    อักษรสูง, FRA « consonne haute », domaine `GRAMMA ; LINGUA`.

### Item 3 : ป่า (réemploi, publié par `u01-l1c` item 2)

- `thai` : ป่า
- `codepoints` : U+0E1B U+0E48 U+0E32 (NFC)
- `ipa` : /paː˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : forêt
- `transcription` : pàa
- `registre` : neutre
- `note_fr` : la première marque de l’escalier. Un : ป, moyenne. Deux : un
  ไม้เอก. Trois : rien ne ferme. Quatre : vivante. Moyenne plus ไม้เอก donne le
  ton BAS. Ce mot est aussi la moitié d’un repère que le parcours vous fait
  entretenir depuis 1C : ปา reste plat, ป่า descend et reste bas. Écoutez la
  paire avant l’exercice 3.
- `sources` :
  - Champs repris sans modification de `u01-l1c` item 2, relu dans le dépôt le
    2026-08-04. `u02-l2a` item 3 et `u10-l10a` item 4 republient les mêmes
    champs. **Un écart TYPOGRAPHIQUE est rendu par `item-fields-check.mjs` et il
    est laissé tel quel** : `u01-l1c` écrit `U+0E1B U+0E48 U+0E32` et 12C écrit
    la même séquence suivie de « (NFC) », comme les onze autres items et comme
    toutes les leçons depuis l’unité 3. **La séquence de points de code est
    identique**, le script imprime les deux et laisse l’arbitrage à l’humain,
    conformément à ce que son en-tête annonce. Le fichier reste homogène plutôt
    que d’imiter la typographie de l’unité 1 sur un item et pas sur les autres.
  - RID 2554, entrée « ป่า », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 65412**, relevée le 2026-08-04 (ThaiRom
    `pā`, ThaiPhon `_pā`, TYPE n., ENG « forest ; jungle ; woods ; grove », FRA
    « forêt [f] ; bois [m] ; futaie [f] », domaine `MINENG ; NATURA ; ORNITHO ;
SILVA`). Le `_` note le ton bas.
    La **ligne 65413** donne l’emploi adjectival, non enseigné.
  - en.wiktionary, entrée « ป่า », https://en.wiktionary.org/wiki/ป่า, consultée
    en rendu le 2026-08-04 (IPA /paː˨˩/, Paiboon `bpàa`, Royal Institute `pa`,
    nom « forest; wood; woodland; jungle »).
  - Classe de ป : RID, entrée « อักษรกลาง », relevée le 2026-08-04, qui énumère
    les neuf lettres de la classe moyenne, ก จ ฎ ฏ ด ต บ ป อ ; annexe
    « Appendix:Thai script », colonne `Class` valant `mid` pour ป ; VOLUBILIS
    **ligne 974**, อักษรกลาง, FRA « consonne moyenne », domaine
    `GRAMMA ; LINGUA`.

### Item 4 : พ่อ (réemploi, publié par `u06-l6b` item 1)

- `thai` : พ่อ
- `codepoints` : U+0E1E U+0E48 U+0E2D (NFC)
- `ipa` : /pʰɔː˥˩/
- `ton` : descendant
- `longueur` : longue
- `fr` : père ; papa
- `transcription` : phâww
- `registre` : neutre
- `note_fr` : le mot qui prouve la page 7, et c’est pour cela qu’il est ici. Un :
  พ, basse. Deux : le MÊME ไม้เอก que ป่า. Trois : rien ne ferme, le อ est la
  voyelle et non une finale. Quatre : voyelle longue, donc vivante. Basse plus
  ไม้เอก donne le ton DESCENDANT, alors que ป่า donne un bas. Même signe, deux
  réponses, et c’est la classe qui a tranché.
- `sources` :
  - Champs repris sans modification de `u06-l6b` item 1, relu dans le dépôt le
    2026-08-04.
  - RID 2554, entrée « พ่อ », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 72427**, relevée le 2026-08-04 (ThaiRom
    `phø`, ThaiPhon `\phø`, TYPE n., ENG « father ; dad (inf.) », FRA « père [m] ;
    papa [m] », domaine `MINENG ; TOURIST`). Le `\` note le ton descendant.
    **Réserve de lecture, consignée plutôt que tue** : la colonne `ThaiPhon`
    écrit `ø` sans macron pour le noyau `aww`, alors qu’elle marque les autres
    voyelles longues par un macron. Le même `ø` sans macron se lit à สอง et à
    น้อง, dont les trois leçons d’origine publient toutes une voyelle LONGUE.
    **Cette colonne ne vaut donc pas comme fait de longueur pour ce noyau**, et
    la longueur est établie ailleurs, par l’`ipa` d’en.wiktionary. Point porté à
    l’incertitude 2.
  - en.wiktionary, entrée « พ่อ », https://en.wiktionary.org/wiki/พ่อ, consultée
    en rendu le 2026-08-04 (Phonemic `pɔ̂ɔ`, IPA **/pʰɔː˥˩/**, Paiboon `pɔ̂ɔ`,
    Royal Institute `pho`, nom « father »). Le `ː` de /ɔː/ et le doublement `ɔɔ`
    établissent la voyelle longue.
  - Classe de พ : RID, entrée « อักษรต่ำ », relevée le 2026-08-04, พ comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `low` pour พ.

### Item 5 : สี่ (réemploi, publié par `u03-l3b` item 1.4)

- `thai` : สี่
- `codepoints` : U+0E2A U+0E35 U+0E48 (NFC)
- `ipa` : /siː˨˩/
- `ton` : bas
- `longueur` : longue
- `fr` : quatre (le nombre 4)
- `transcription` : sìi
- `registre` : neutre
- `note_fr` : la seconde moitié de la démonstration de la page 7. Un : ส, haute.
  Deux : un ไม้เอก, empilé au-dessus du ◌ี, ce qui fait deux signes sur la même
  lettre. Trois : rien ne ferme. Quatre : voyelle longue, donc vivante. Haute
  plus ไม้เอก donne le ton BAS, le MÊME que ป่า, qui est une moyenne. Retenez le
  partage : moyenne et haute ensemble, basse à part.
- `sources` :
  - Champs repris sans modification de `u03-l3b` item 1.4, relu dans le dépôt le
    2026-08-04.
  - RID 2554, entrée « สี่ », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome, premier sens numéral concordant (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 91868**, relevée le 2026-08-04 (ThaiRom
    `sī`, ThaiPhon `_sī`, TYPE num., ENG « four », FRA « quatre », respelling
    `[สี่]`). Le `_` note le ton bas, le macron la voyelle longue. **La ligne
    citée par `u03-l3b` est 94960, parce que cette leçon citait le `.ods`** ;
    l’amendement v1.3 de `CONVENTIONS.md` fait du `.xlsx` l’artefact de
    référence, et la citation neuve donne donc 91868.
  - en.wiktionary, entrée « สี่ », https://en.wiktionary.org/wiki/สี่, consultée
    en rendu le 2026-08-04 (IPA /siː˨˩/, Paiboon `sìi`, Royal Institute `si`,
    numéral « the number 4 »).
  - Classe de ส : RID, entrée « อักษรสูง », relevée le 2026-08-04, ส comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `high` pour ส.

### Item 6 : ห้า (réemploi, publié par `u03-l3b` item 1.5)

- `thai` : ห้า
- `codepoints` : U+0E2B U+0E49 U+0E32 (NFC)
- `ipa` : /haː˥˩/
- `ton` : descendant
- `longueur` : longue
- `fr` : cinq (le nombre 5)
- `transcription` : hâa
- `registre` : neutre
- `note_fr` : le seul mot du jour où la lettre ห est l’INITIALE et non une tête.
  Un : ห, haute. Deux : un ไม้โท. Trois : rien ne ferme. Quatre : vivante. Haute
  plus ไม้โท donne le ton DESCENDANT. Le repère qui départage les deux emplois de
  ห est celui de la page 5 de `u05-l5a`, le CONTACT : ici le ห porte un signe et
  la lettre suivante est une voyelle, il se prononce. Dans หมา, le ม est collé
  derrière un ห nu, et le ห se tait.
- `sources` :
  - Champs repris sans modification de `u03-l3b` item 1.5, relu dans le dépôt le
    2026-08-04. `u05-l5a` item 1 republie les mêmes champs.
  - RID 2554, entrée « ห้า », re-vérifiée le 2026-08-04 par
    `node scripts/verification/rid-entry.mjs ห้า` : vedette autonome, deux sens
    numérotés dont le (๑) donne le nombre, concordant (faits cités par référence,
    définitions non reproduites).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 14524**, relevée le 2026-08-04 (ThaiRom
    `hā`, ThaiPhon `\hā`, TYPE num., ENG « five », FRA « cinq », domaine `NUM`).
    Le `\` note le ton descendant, le macron la voyelle longue. **La ligne citée
    par `u03-l3b` est 15033, parce que cette leçon citait le `.ods`** ; la
    citation neuve donne 14524, conformément à l’amendement v1.3.
  - en.wiktionary, entrée « ห้า », https://en.wiktionary.org/wiki/ห้า, consultée
    en rendu le 2026-08-04 (IPA /haː˥˩/, Paiboon `hâa`, Royal Institute `ha`,
    numéral « the number 5 »). **Fait relevé et NON enseigné** : la même entrée
    donne pour forme phonémique ฮ่า, c’est-à-dire une réécriture avec une
    initiale de classe basse et un ไม้เอก. Cette réécriture note comment le mot
    SONNE ; elle n’est pas la dérivation que le parcours enseigne, et les deux
    aboutissent au même ton descendant. Rien n’en est dit sur un écran, et le
    point est porté à l’incertitude 3.
  - Critère de CONTACT du ห de tête : page 5 de `u05-l5a`, reprise sans
    reformulation, elle-même re-mesurée par `u10-l10a` sur les 19 graphies
    publiées commençant par ห, zéro contre-exemple, หก compris.

### Item 7 : กิน (réemploi, publié par `u04-l4a` item 1)

- `thai` : กิน
- `codepoints` : U+0E01 U+0E34 U+0E19 (NFC)
- `ipa` : /kin˧/
- `ton` : moyen
- `longueur` : courte
- `fr` : manger, boire, consommer
- `transcription` : kin
- `registre` : neutre
- `note_fr` : le mot par lequel la règle du ton était entrée dans le parcours, en
  4A, et il ferme la boucle ici. Un : ก, moyenne. Deux : rien ; le ◌ิ est une
  voyelle et non une marque, c’est la confusion la plus fréquente à cet endroit.
  Trois : ferme sur น. Quatre : sonante, donc vivante. Moyenne sans marque donne
  le ton MOYEN. Notez que la voyelle est BRÈVE et que cela ne change rien : la
  fermeture décide en premier.
- `sources` :
  - Champs repris sans modification de `u04-l4a` item 1, relu dans le dépôt le
    2026-08-04.
  - RID 2554, entrée « กิน », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 40915**, relevée le 2026-08-04 (ThaiRom
    `kin`, ThaiPhon `-kin`, TYPE v., ENG « eat ; drink ; consume ; chew », FRA
    « manger ; consommer ; … », domaine `CULINA ; HOTEL ; MINENG ; RID ;
TOURIST`). Le `-` note le ton
    moyen, et l’absence de macron la voyelle brève. La **ligne 40916** donne un
    second emploi, non enseigné.
  - en.wiktionary, entrée « กิน », https://en.wiktionary.org/wiki/กิน, consultée
    en rendu le 2026-08-04 (IPA /kin˧/, Paiboon `gin`, Royal Institute `kin`,
    verbe « to consume »).
  - Classe de ก : RID, entrée « อักษรกลาง », relevée le 2026-08-04, ก comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `mid` pour ก.

### Item 8 : สอง (réemploi, publié par `u03-l3b` item 1.2)

- `thai` : สอง
- `codepoints` : U+0E2A U+0E2D U+0E07 (NFC)
- `ipa` : /sɔːŋ˩˩˦/
- `ton` : montant
- `longueur` : longue
- `fr` : deux (le nombre 2)
- `transcription` : sǎwwng
- `registre` : neutre
- `note_fr` : le mot qui porte le piège du อ, et c’est la seule raison pour
  laquelle il est ici plutôt qu’un autre montant. Un : ส, haute. Deux : rien.
  Trois : ferme sur ง ; **le อ n’est pas une finale, c’est la voyelle**, le `aww`
  long. Quatre : sonante, donc vivante. Haute sans marque donne le ton MONTANT.
  Le อ ne ferme jamais une syllabe thaïe ; écrit AVANT une consonne, en revanche,
  il peut être une tête, comme dans อยู่.
- `sources` :
  - Champs repris sans modification de `u03-l3b` item 1.2, relu dans le dépôt le
    2026-08-04. `u04-l4e` item 7, `u06-l6e` item 8 et `u10-l10a` item 1
    republient les mêmes champs.
  - RID 2554, entrée « สอง », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome, premier sens numéral concordant (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 93932**, relevée le 2026-08-04 (ThaiRom
    `søng`, ThaiPhon `/søng`, TYPE num., ENG « two », FRA « deux », respelling
    `[สอง]`). Le `/` note le ton montant. Même ligne que celle citée par
    `u10-l10a` ; `u03-l3b` cite 97075, ligne du `.ods`.
  - en.wiktionary, entrée « สอง », https://en.wiktionary.org/wiki/สอง, consultée
    en rendu le 2026-08-04 (IPA /sɔːŋ˩˩˦/, Paiboon `sɔ̌ɔng`, Royal Institute
    `song`, numéral « the number 2 »). Le doublement `ɔɔ` et le `ː` établissent
    la voyelle longue, que la colonne `ThaiPhon` de VOLUBILIS ne marque pas sur
    ce noyau, réserve écrite à l’item 4.
  - Classe de ส : voir l’item 5.

### Item 9 : บ้าน (réemploi, publié par `u07-l7a` item 1)

- `thai` : บ้าน
- `codepoints` : U+0E1A U+0E49 U+0E32 U+0E19 (NFC)
- `ipa` : /baːn˥˩/
- `ton` : descendant
- `longueur` : longue
- `fr` : la maison
- `transcription` : bâan
- `registre` : neutre
- `note_fr` : le mot qui ouvrait l’unité 7 et la case moyenne plus ไม้โท. Un : บ,
  moyenne. Deux : un ไม้โท. Trois : ferme sur น. Quatre : sonante, donc vivante.
  Moyenne plus ไม้โท donne le ton DESCENDANT. Comparez tout de suite avec น้อง,
  qui porte le même signe sur une basse et donne un ton haut.
- `sources` :
  - Champs repris sans modification de `u07-l7a` item 1, relu dans le dépôt le
    2026-08-04. `u07-l7b` item 1 republie les mêmes champs.
  - RID 2554, entrée « บ้าน », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 3744**, relevée le 2026-08-04 (ThaiRom
    `bān`, ThaiPhon `\bān`, TYPE n., ENG « house ; home ; habitation ; dwelling
    place ; … », FRA
    « maison [f] ; logis [m] ; … », domaine `ARCHIT ; HOME ; MINENG ;
TOURIST`). Le `\` note
    le ton descendant, le macron la voyelle longue.
  - en.wiktionary, entrée « บ้าน », https://en.wiktionary.org/wiki/บ้าน,
    consultée en rendu le 2026-08-04 (IPA /baːn˥˩/, Paiboon `bâan`, Royal
    Institute `ban`, nom « place of habitation; residence »).
  - Classe de บ : RID, entrée « อักษรกลาง », relevée le 2026-08-04, บ comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `mid` pour บ.

### Item 10 : น้อง (réemploi, publié par `u06-l6b` item 4)

- `thai` : น้อง
- `codepoints` : U+0E19 U+0E49 U+0E2D U+0E07 (NFC)
- `ipa` : /nɔːŋ˦˥/
- `ton` : haut
- `longueur` : longue
- `fr` : cadet, cadette ; frère ou sœur né après vous
- `litteral` : celui ou celle qui est né après
- `transcription` : náwwng
- `registre` : neutre
- `note_fr` : la troisième démonstration de la même chose, et la dernière. Un :
  น, basse. Deux : le MÊME ไม้โท que บ้าน. Trois : ferme sur ง ; le อ est la
  voyelle, comme dans สอง. Quatre : sonante, donc vivante. Basse plus ไม้โท donne
  le ton HAUT. Trois fois dans cette leçon, deux mots portent le même signe et
  n’ont pas le même ton, et trois fois c’est la classe qui a tranché.
- `sources` :
  - Champs repris sans modification de `u06-l6b` item 4, relu dans le dépôt le
    2026-08-04.
  - RID 2554, entrée « น้อง », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 64026**, relevée le 2026-08-04 (ThaiRom
    `nøng`, ThaiPhon `¯nøng`, TYPE n., ENG « younger brother ; younger sister ;
    younger person »,
    FRA « cadet [m] ; cadette [f] ; personne plus jeune [f] », domaine
    `FAMILIA ; INSOLITE ; RID ; TOURIST`). Le `¯`
    note le ton haut. Les lignes 64027 et 64028 donnent deux autres emplois, non
    enseignés. Longueur non marquée par cette colonne sur le noyau `ø`, réserve
    écrite à l’item 4.
  - en.wiktionary, entrée « น้อง », https://en.wiktionary.org/wiki/น้อง,
    consultée en rendu le 2026-08-04 (Phonemic `nɔ́ɔng`, IPA /nɔːŋ˦˥/, Paiboon
    `nɔ́ɔng`, Royal Institute `nong`, nom « younger brother or younger sister »).
  - Classe de น : RID, entrée « อักษรต่ำ », relevée le 2026-08-04, น comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `low` pour น.

### Item 11 : แล้ว (réemploi, publié par `u09-l9d` item 6)

- `thai` : แล้ว
- `codepoints` : U+0E41 U+0E25 U+0E49 U+0E27 (NFC)
- `ipa` : /lɛːw˦˥/
- `ton` : haut
- `longueur` : longue
- `fr` : en fin de phrase, marque que c’est accompli ou que l’état est désormais
  en place ; se rend en français par « déjà », « maintenant », ou par le seul
  temps du verbe
- `transcription` : láeew
- `registre` : neutre
- `note_fr` : la voyelle s’écrit avant sa consonne, et rien d’autre ne change.
  Un : แ est une voyelle ; l’initiale est ล, en deuxième position, basse. Deux :
  un ไม้โท, posé sur le ล. Trois : ferme sur ว. Quatre : sonante, donc vivante.
  Basse plus ไม้โท donne le ton HAUT. Ce décodage n’est pas neuf : `u09-l9d`
  l’avait écrit dans la note de l’item quand elle a publié le mot. Vous le
  refaites seul.
- `sources` :
  - Champs repris sans modification de `u09-l9d` item 6, relu dans le dépôt le
    2026-08-04. `u10-l10a` item 7 et `u11-l11c` item 5 republient les mêmes
    champs.
  - RID 2554, entrée « แล้ว », re-vérifiée le 2026-08-04 : graphie attestée comme
    entrée autonome (fait cité par référence).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 47342**, relevée le 2026-08-04 (ThaiRom
    `laēo`, ThaiPhon `¯laēo`, TYPE adv., ENG « already », FRA « déjà »,
    respelling `[แล้ว]`). Le `¯` note le ton haut, le macron du `aē` la voyelle
    longue. La **ligne 47343** donne l’emploi d’enchaînement, celui de `u01-l1e`
    et de `u06-l6e`.
  - en.wiktionary, entrée « แล้ว », https://en.wiktionary.org/wiki/แล้ว,
    consultée en rendu le 2026-08-04 (Phonemic `lɛ́ɛo`, IPA /lɛːw˦˥/, Paiboon
    `lɛ́ɛo`, Royal Institute `laeo`, adverbe marquant l’accompli).
  - Position de la voyelle pré-posée : Unicode 17.0, `PropList.txt`, **ligne
    1461**, `0E40..0E44 ; Logical_Order_Exception`, et
    `IndicPositionalCategory.txt`, **ligne 384**, `0E40..0E44 ;
Visual_Order_Left`. Les deux fichiers ont été retéléchargés et empreintés le
    2026-08-04, valeurs au dossier. L’ordre du fichier et l’ordre de l’écran
    coïncident donc, et แ occupe bien la première position dans les deux.
  - Classe de ล : RID, entrée « อักษรต่ำ », relevée le 2026-08-04, ล comprise ;
    annexe « Appendix:Thai script », colonne `Class` valant `low` pour ล.

### Item 12 : เพลง (réemploi, publié par `u02-l2a` item 8)

- `thai` : เพลง
- `codepoints` : U+0E40 U+0E1E U+0E25 U+0E07 (NFC)
- `ipa` : /pʰleːŋ˧/
- `ton` : moyen
- `longueur` : longue
- `fr` : chanson (aussi : morceau de musique)
- `transcription` : phleeng
- `registre` : neutre
- `note_fr` : deux complications d’un coup, et aucune règle nouvelle. Un : เ est
  une voyelle ; พ et ล sont collées et comptent pour une seule initiale ; c’est
  พ qui commande, basse. Deux : rien. Trois : ferme sur ง. Quatre : sonante, donc
  vivante. Basse sans marque donne le ton MOYEN. La leçon d’origine disait « les
  groupes de consonnes ne sont pas au programme d’aujourd’hui » ; ils le sont
  aujourd’hui, et ce mot est le plus simple des deux.
- `sources` :
  - Champs repris sans modification de `u02-l2a` item 8, relu dans le dépôt le
    2026-08-04.
  - RID 2554, entrée « เพลง », re-vérifiée le 2026-08-04 par `rid-entry.mjs` :
    vedette autonome, deux sens numérotés, **et l’entrée porte la lecture entre
    crochets `[เพฺลง]`, U+0E40 U+0E1E U+0E3A U+0E25 U+0E07**. Le signe U+0E3A,
    พินทุ, y est posé sous le พ, ce qui marque le groupe (fait cité par
    référence, définition non reproduite).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 72181**, relevée le 2026-08-04 (ThaiRom
    `phlēng`, ThaiPhon `-phlēng`, TYPE n., ENG « song ; tune », FRA
    « chanson [f] ; mélodie [f] », domaine `CULTURA ; RID ; TOURIST`). Le `-`
    note le ton moyen, le macron la voyelle longue.
  - en.wiktionary, entrée « เพลง », https://en.wiktionary.org/wiki/เพลง,
    consultée en rendu le 2026-08-04 (**Phonemic `เพฺลง`**, IPA /pʰleːŋ˧/,
    Paiboon `pleeng`, Royal Institute `phleng`, nom « song; music »). La forme
    phonémique porte le même พินทุ sous le พ, indépendamment du RID.
  - **Ce que ces deux lectures établissent, et ce qu’elles n’établissent pas.**
    Elles établissent que พ et ล forment ici UNE initiale, et c’est le fait dont
    la page 12 a besoin. Elles n’aident PAS l’apprenant à lire : le พินทุ ne
    s’écrit pas dans le thaï courant, il n’apparaît que dans les lectures de
    dictionnaire. La page 12 conserve donc la position de `u10-l10a`, à savoir
    qu’à l’œil rien ne distingue un groupe de deux consonnes qui n’en forment
    pas un.
  - Classe de พ : voir l’item 4.

### Item 13 : เปลี่ยน (réemploi, publié par `u08-l8a` item 7)

- `thai` : เปลี่ยน
- `codepoints` : U+0E40 U+0E1B U+0E25 U+0E35 U+0E48 U+0E22 U+0E19 (NFC)
- `ipa` : /plia̯n˨˩/
- `ton` : bas
- `longueur` : NON ÉTABLIE, même motif que l’item 3 pour la diphtongue /ia/.
- `fr` : changer, échanger
- `transcription` : plìan
- `registre` : neutre
- `note_fr` : la dernière marche, et elle empile toutes les autres. Un : เ est
  une voyelle ; ป et ล sont collées et comptent pour une initiale ; c’est ป qui
  commande, moyenne. Deux : un ไม้เอก, et **il n’est pas posé sur le ป** : il est
  empilé au-dessus du ล, par-dessus le ◌ี. Trois : ferme sur น. Quatre : sonante,
  donc vivante. Moyenne plus ไม้เอก donne le ton BAS. Le contrôle est immédiat :
  si vous aviez lu ล, une basse, vous auriez obtenu un descendant, et le mot se
  dit plìan.
- `sources` :
  - Champs repris sans modification de `u08-l8a` item 7, relu dans le dépôt le
    2026-08-04. **Le champ `longueur` est recopié à la lettre, renvoi interne
    compris** : « l’item 3 » y désigne l’item 3 de `u08-l8a`, et non un item de
    12C. Une première version de ce fichier avait réécrit ce renvoi pour le
    rendre plus clair, et `item-fields-check.mjs` l’a rendu comme un écart de
    réemploi ; la formulation d’origine est rétablie et l’explication est ici.
    `u08-l8d` item 6 et `u08-l8e` item 11 republient la graphie ;
    **leurs champs `longueur` divergent entre eux, et `u08-l8e` le signale
    lui-même**. 12C reprend la valeur de la leçon de première publication et ne
    tranche pas.
  - RID 2554, entrée « เปลี่ยน », re-vérifiée le 2026-08-04 par `rid-entry.mjs` :
    vedette autonome, ก., **avec la lecture entre crochets `[เปฺลี่ยน]`, U+0E40
    U+0E1B U+0E3A U+0E25 U+0E35 U+0E48 U+0E22 U+0E19**, où le พินทุ est posé sous
    le ป et marque le groupe (fait cité par référence, définition non
    reproduite).
  - VOLUBILIS v26.2, `.xlsx`, **ligne 76838**, relevée le 2026-08-04 (ThaiRom
    `plīen`, ThaiPhon `_plīen`, TYPE v., ENG « change ; alter ; vary », FRA
    « changer ; transformer », **respelling `[เปฺลี่ยน]`**). Le `_` note le ton
    bas, et le respelling porte le même พินทุ que le RID.
  - en.wiktionary, entrée « เปลี่ยน », https://en.wiktionary.org/wiki/เปลี่ยน,
    consultée en rendu le 2026-08-04 (**Phonemic `เปฺลี่ยน`**, IPA /plia̯n˨˩/,
    Paiboon `bplìian`, Royal Institute `plian`, verbe « to change »). Troisième
    lecture concordante sur le groupe.
  - Position de la marque : l’ordre des points de code, ล puis ◌ี puis ◌่,
    place les deux signes sur le ล et non sur le ป. Unicode 17.0,
    `UnicodeData.txt`, **ligne 3244**, `0E35;THAI CHARACTER SARA II;Mn;0;`, et
    **ligne 3259**, `0E48;THAI CHARACTER MAI EK;Mn;107;`. La classe combinatoire
    0 du ◌ี et 107 du ◌่ font que la forme NFC conserve cet ordre, ce qui est
    vérifié au tableau Unicode du dossier.
  - **Divergence de description signalée plutôt que masquée.** `u08-l8a`, qui
    publie ce mot, écrit que « la marque de ton se pose sur la voyelle qui
    suit » ; `u10-l10a` écrit qu’« il est posé au-dessus du ล, la lettre
    d’après ». Les deux visent le même empilement, ◌ี puis ◌่ au-dessus du ล.
    12C écrit la position en toutes lettres, « empilée au-dessus du ล,
    par-dessus le ◌ี », qui est ce que la séquence de points de code établit, et
    porte la divergence de formulation à l’arbitrage 4.
  - Classe de ป : voir l’item 3.

### Blocs et spécimens réemployés, et leur leçon de publication

**Quinze** graphies de plus apparaissent sur un écran de 12C, comme spécimen
ou comme tirage d’exercice, sans être des items. Chacune a été relue dans son
fichier d’origine le 2026-08-04, et 12C n’en modifie ni le sens, ni le ton, ni la
transcription.

**Le décompte disait ONZE, il était faux, et le contre-audit ne l’a pas redressé
du premier coup.** Le contre-audit interne du 2026-08-04 a d’abord trouvé trois
tirages de l’exercice 1, เจอ, เสีย et เสื้อ, absents de ce tableau, du décompte
RID et de la liste Unicode, alors qu’ils sont affichés à l’apprenant. La
correction proposée était de passer à quatorze. **Elle a été vérifiée avant
d’être appliquée, et elle était encore insuffisante** : une extraction
mécanique de toutes les sous-chaînes thaïes des sections `## Enseignement` et
`## Exercices`, confrontée une par une à l’inventaire, rend **106 sous-chaînes
distinctes sur écran**, dont une quinzième graphie absente du tableau, จาน,
spécimen de la page 1 depuis la première version du fichier. Le compte juste est
donc **quinze**, et il est désormais produit par extraction plutôt que par
relecture. Les quatre lignes ajoutées sont signalées par une note.

| Graphie | Publiée par       | Ton publié        | Transcription publiée | Rôle dans 12C                    |
| ------- | ----------------- | ----------------- | --------------------- | -------------------------------- |
| ถุง     | `u03-l3a` item 8  | montant           | `thǒung`              | page 6, exercices 2 et 3         |
| คะ      | `u02-l2e` item 1  | haut              | `khá`                 | page 6, exercice 2               |
| และ     | `u11-l11c` item 1 | haut              | `láe`                 | page 6, exercice 2               |
| เตะ     | `u03-l3a` item 5  | bas               | `tè`                  | page 6, exercice 2               |
| รถ      | `u05-l5d` item 2  | haut              | `rót`                 | pages 2, 5, 14, exercices 2 et 3 |
| มาก     | `u04-l4d` item 8  | descendant        | `mâak`                | pages 5, 14, exercice 2          |
| ชอบ     | `u04-l4d` item 6  | descendant        | `châwwp`              | page 5, exercice 2               |
| หมา     | `u01-l1d` item 1  | montant           | `mǎa`                 | pages 9, 13, exercices 2 et 3    |
| ไม่     | `u04-l4d` item 1  | descendant        | `mâi`                 | page 13, exercices 2 et 3        |
| อยู่    | `u05-l5c` item 1  | bas               | `yòuu`                | pages 5, 13                      |
| ตลาด    | `u05-l5d` item 6  | tà bas ; làat bas | `tà·làat`             | page 12                          |
| เจอ     | `u06-l6a` item 6  | moyen             | `joee`                | exercice 1, tirage 3             |
| เสีย    | `u08-l8a` item 3  | montant           | `sǐa`                 | exercice 1, tirage 7             |
| เสื้อ   | `u08-l8a` item 4  | descendant        | `sûea`                | exercice 1, tirage 8             |
| จาน     | `u04-l4c` item 3  | moyen             | `jaan`                | page 1                           |

**Note sur les quatre dernières lignes, et elle est nécessaire.** Elles ont été
ajoutées au contre-audit interne. Leur présence au dépôt est établie par
`node scripts/verification/repo-thai-scan.mjs 1 11 --grep <graphie>`, exécuté le
2026-08-04, qui rend เจอ dans `u06-l6a`, เสีย et เสื้อ dans `u08-l8a`, et จาน
dans `u04-l4c`, republiée par `u04-l4e` ; les champs `ton` et `transcription`
ci-dessus sont relus dans ces fichiers le même jour. **Ces quatre graphies n’ont
PAS été interrogées au RID par ce dossier** : leur attestation d’orthographe
reste celle de leur leçon de publication, et le décompte RID de 24 graphies plus
bas n’a pas été gonflé pour faire croire le contraire. L’exercice 1 ne demande
aux trois premières que la classe de l’initiale, จ moyenne pour เจอ, ส haute pour
les deux autres, classes établies par les entrées de métalangue déjà citées ;
จาน n’est qu’un spécimen et ne demande rien.

Six graphies de plus sont citées une seule fois, en spécimen d’un signe et
jamais d’un ton : เจ็บ et แพทย์ à la page 4, publiées **toutes deux par
`u09-l9a`**, items 1 et 4 ; เก๊ et ตั๋ว à la page 7, publiées par `u08-l8a`
items 6 et 5 ; กระเป๋า à la page 7 également, publiée par `u08-l8a` item 8 ; ปลา
à la page 12, publiée par `u03-l3d` item 5. Trois graphies de la page 13 sont
citées comme exemples de familles hors domaine, ไป, น้ำ et เข้า, publiées par
`u05-l5b`, `u02-l2c` et `u01-l1b`, et deux de plus, หนึ่ง et หมอ, par `u03-l3b`
et `u09-l9a`. **Une dernière, ก็, est nommée à la page 13** comme l’une des deux
entrées que la ventilation ne range nulle part : elle est publiée par `u11-l11c`
item 3, ton descendant, transcription `kâw`, relu le 2026-08-04. Aucune ne
demande de ton à l’apprenant.

**Ce que l’extraction a rendu et qui n’est pas une graphie**, consigné pour que
le décompte de quinze soit reproductible : les lettres et signes isolés des
pages 3 et 4, les quatre noms de marques ไม้เอก, ไม้โท, ไม้ตรี et ไม้จัตวา, les
deux groupes ปล et พล nommés aux tirages 4 et 12 de l’exercice 1, et les deux
chiffres thaïs ๙๔ du spécimen de la page 13. Aucun n’est un mot et aucun
n’ouvre de ligne d’inventaire.

**Deux corrections de référence, faites au contre-audit interne.** La première :
เจ็บ était attribuée à `u08-l8c`, où elle **n’apparaît pas une seule fois**,
recherche faite dans le fichier le 2026-08-04 ; elle est publiée par `u09-l9a`
item 1, au ton bas, transcription `jèp`. La seconde : เก๊ et ตั๋ว sont les items
6 et 5 de `u08-l8a`, dans cet ordre, et non l’inverse.

**Le seul fait linguistique de la page 4 qui ne vienne pas d’un item du jour**,
« le ◌็ raccourcit la voyelle », n’est PAS établi par ce dossier et ne doit pas
en avoir l’air. Il est enseigné et double-sourcé par `u03-l3b`, relue dans le
dépôt le 2026-08-04 : RID 2554, entrée « ไม้ไต่คู้ », consultée par cette leçon
le 2026-08-03, décrivant un signe de cette forme qui donne au mot un son bref ;
et en.wiktionary, même entrée, même jour, « a Thai diacritical symbol ◌็, which
shortens vowels ». La même leçon écarte explicitement th.wiktionary, qui nomme le
signe sans énoncer sa fonction. 12C reprend ce fait sans le ré-interroger, et
`u03-l3b` est inscrite à ses prérequis pour cette raison.

## Exercices

Les cinq exercices sont à l’état d’échafaudage `absent` : **aucun n’affiche de
transcription, et aucun ne joue le mot avant la réponse.** Les planchers écrits
ci-dessous sont faux si l’un ou l’autre est ajouté. Les calculs sont produits par
script sur les tables de tirages telles qu’elles sont écrites, le 2026-08-04, et
le script est reproduit au dossier.

### Exercice 1 : de quelle classe est l’initiale ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : la question un, en entier. Trouver la consonne initiale, ce
  qui suppose de ne pas prendre une voyelle pré-posée pour elle et de savoir
  qu’un groupe compte pour une initiale ; puis nommer sa classe. Les deux moitiés
  sont mesurées ensemble, parce qu’aucune ne sert seule.
- Consigne : « Regardez le mot. De quelle classe est sa consonne initiale ? »
- Interaction : le mot est affiché en grand spécimen thaï, **sans transcription**.
  Trois cartes, MOYENNE, HAUTE, BASSE, chacune avec un pictogramme distinct ; la
  couleur n’est jamais le seul signal. Ordre des trois cartes tiré au hasard à
  chaque tirage. Le mot est joué APRÈS la réponse.
- Tirages : 12 au total, ordre aléatoire. **Six tirages ont leur initiale en
  première position et six en deuxième**, et cette répartition est ce qui rend le
  plancher mesurable.
  1. กิน → MOYENNE (ก, première position).
  2. บ้าน → MOYENNE (บ, première position).
  3. เจอ → MOYENNE (จ, deuxième position, après la voyelle pré-posée เ).
  4. เปลี่ยน → MOYENNE (ป, deuxième position, première lettre du groupe ปล).
  5. ขา → HAUTE (ข, première position).
  6. ห้า → HAUTE (ห, première position, et c’est bien l’initiale).
  7. เสีย → HAUTE (ส, deuxième position).
  8. เสื้อ → HAUTE (ส, deuxième position).
  9. มา → BASSE (ม, première position).
  10. น้อง → BASSE (น, première position).
  11. แล้ว → BASSE (ล, deuxième position).
  12. เพลง → BASSE (พ, deuxième position, première lettre du groupe พล).
- Seuil de réussite : 10 sur 12.
- **Planchers mesurés, quatre stratégies, comptes produits par script le
  2026-08-04.** Un, **réponse constante : 4 sur 12, soit 33,3 %**, la répartition
  étant strictement de quatre tirages par classe. Deux, **« toujours la classe de
  la PREMIÈRE LETTRE écrite »** : elle donne une réponse sur les six tirages dont
  l’initiale est en première position, et ne donne rien sur les six autres, dont
  la première lettre est une voyelle sans classe ; en tirant au hasard sur
  ceux-là, son espérance est de **8 sur 12**, et elle atteint le seuil de 10 dans
  **10,0 % des sessions**. Trois, **« toujours la deuxième lettre »** : par
  symétrie exacte, **8 sur 12** en espérance et **10,0 %** de sessions au seuil.
  Quatre, **« je trouve l’initiale mais je ne connais pas les classes » : 4 sur
  12**. La meilleure des quatre plafonne donc à 8 sur 12 en espérance, contre un
  seuil de 10 : il manque deux tirages, et aucun ne s’obtient sans connaître la
  classe de la lettre.
- **Ce que ce plancher NE dit PAS, et il faut l’écrire.** Un apprenant qui prend
  « la première CONSONNE écrite » a raison sur les douze tirages, parce que c’est
  exactement la règle enseignée. Cet exercice mesure donc deux choses et pas une
  troisième : savoir qu’une voyelle pré-posée n’est pas une consonne, et
  connaître la classe des lettres. Il ne mesure PAS le cas de la consonne de
  tête, où la première consonne n’est pas l’initiale, et c’est volontaire : ces
  mots sortent du domaine, et l’exercice 2 s’en occupe.
- Feedback correct : « Oui. Vous avez trouvé la lettre, et vous connaissez sa
  classe. »
- Feedback correct, tirages 4 et 12 : « Bien vu. Deux consonnes collées comptent
  pour une seule initiale, et c’est la première qui commande. »
- Feedback incorrect, voyelle pré-posée prise pour l’initiale : « เ, แ et โ
  s’écrivent avant leur consonne. Regardez la lettre suivante. » Aucune pénalité.
- Feedback incorrect, deuxième lettre du groupe prise pour l’initiale : « ปล et
  พล se lisent d’un seul élan et comptent pour une initiale. C’est la première
  lettre qui commande le ton. » Aucune pénalité.
- Pièges connus : prendre แ de แล้ว ou เ de เพลง pour l’initiale ; prendre ล dans
  เปลี่ยน, ce qui donnerait une basse au lieu d’une moyenne ; prendre le ◌ิ de
  กิน pour une marque et chercher plus loin ; hésiter sur ห dans ห้า, alors que le
  ห y porte un signe et se prononce.

### Exercice 2 : vivante, morte, ou dehors ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : les questions trois et quatre ensemble, c’est-à-dire la
  PORTÉE de la méthode. C’est l’exercice le plus important de la leçon, parce
  qu’un apprenant qui se trompe ici applique le tableau à un mot dont le tableau
  ne parle pas, et obtient une réponse fausse en croyant bien faire.
- Consigne : « Cette syllabe est-elle vivante, morte, ou hors de la méthode ? »
- Interaction : le mot est affiché en grand spécimen thaï, **sans transcription**.
  Trois cartes, VIVANTE, MORTE, DEHORS, chacune avec un pictogramme distinct.
  Ordre tiré au hasard. Le mot est joué APRÈS la réponse.
- Tirages : 14 au total, ordre aléatoire. **Six tirages portent une syllabe
  OUVERTE, trois longues et trois brèves**, et c’est cette moitié qui mesure la
  branche que la page 6 ajoute.
  1. มา → VIVANTE (ouverte, voyelle longue).
  2. ขา → VIVANTE (ouverte, voyelle longue).
  3. ป่า → VIVANTE (ouverte, voyelle longue).
  4. กิน → VIVANTE (ferme sur น).
  5. สอง → VIVANTE (ferme sur ง).
  6. ถุง → VIVANTE (ferme sur ง, malgré une voyelle brève).
  7. คะ → MORTE (ouverte, voyelle brève).
  8. และ → MORTE (ouverte, voyelle brève).
  9. เตะ → MORTE (ouverte, voyelle brève).
  10. รถ → MORTE (ferme sur ถ, famille du `t`).
  11. มาก → MORTE (ferme sur ก, famille du `k`).
  12. ชอบ → MORTE (ferme sur บ, famille du `p`).
  13. หมา → DEHORS (consonne de tête, ม collé derrière un ห nu).
  14. ไม่ → DEHORS (forme en ไ).
- Seuil de réussite : 12 sur 14.
- **Planchers mesurés, quatre stratégies, comptes produits par script le
  2026-08-04.** Un, **réponse constante : 6 sur 14, soit 42,9 %**, six tirages
  étant vivants et six morts. Deux, et c’est celle qui compte, **« la méthode
  telle que `u10-l10a` l’énonce »**, c’est-à-dire familles de fin connues,
  familles hors domaine connues, et **toute syllabe ouverte réputée vivante** :
  elle rend exactement **11 sur 14, de façon DÉTERMINISTE, et n’atteint donc
  JAMAIS le seuil de 12**. Elle échoue précisément sur คะ, และ et เตะ. Trois,
  **« ce qui finit par une lettre-consonne est mort, le reste est vivant » : 6
  sur 14**. Quatre, **« je reconnais les mots hors domaine et je tire au hasard
  sur le reste » : 8 sur 14 en espérance**. Le seuil est donc franchi par une
  seule chose, connaître les deux branches des mortes, et l’écart avec la
  meilleure stratégie partielle est d’exactement un tirage, jamais gagnable au
  hasard.
- Feedback correct : « Oui. Et vous savez donc si le tableau vous concerne. »
- Feedback correct, tirage 6 : « Exactement. La voyelle est brève, mais c’est la
  fermeture qui décide en premier, et ง laisse la syllabe vivante. »
- Feedback correct, tirages 7 à 9 : « Oui. Rien ne ferme, la voyelle est brève :
  la syllabe est morte, et le tableau ne dit rien d’elle. »
- Feedback incorrect, syllabe ouverte brève dite vivante : « Rien ne ferme cette
  syllabe, et sa voyelle est brève. Comparez avec มา, dont la voyelle est
  longue. » Aucune pénalité.
- Feedback incorrect, consonne de tête non vue : « Regardez ce qui est collé
  derrière le ห ou le อ. Si c’est ง, น, ม, ย, ว ou ร et que rien n’est posé
  dessus, vous êtes dehors. » Aucune pénalité.
- Pièges connus : croire qu’une voyelle brève suffit à rendre une syllabe morte,
  ce que ถุง dément ; croire que toute syllabe ouverte est vivante, ce que คะ,
  และ et เตะ démentent ; prendre le อ de สอง pour une finale ; répondre d’après la
  longueur du mot écrit, alors que มา et รถ ont deux lettres chacun et deux
  réponses différentes.

### Exercice 3 : quel ton, ou faut-il s’arrêter ? (`reading`)

- Mécanique : `reading`
- Ce qu’il mesure : la chaîne entière, les quatre questions puis le croisement.
  C’est le seul exercice du parcours où « je m’arrête » est une bonne réponse, et
  deux tirages sur quatorze la demandent.
- Consigne : « Lisez le mot et donnez son ton. Si la méthode ne le dit pas,
  dites-le. »
- Interaction : le mot est affiché en grand spécimen thaï, **sans transcription**.
  Six cartes, les cinq tons plus « je m’arrête, la méthode ne le dit pas ».
  Chaque ton porte une courbe et un pictogramme distincts ; la couleur n’est
  jamais le seul signal. Ordre tiré au hasard. Le mot est joué APRÈS la réponse,
  et la comparaison A/B est proposée.
- Tirages : 14 au total, ordre aléatoire, jamais deux fois de suite la même
  réponse. **Les neuf cases du tableau sont représentées.**
  1. กิน → MOYEN (moyenne, rien).
  2. มา → MOYEN (basse, rien).
  3. ป่า → BAS (moyenne, ◌่).
  4. สี่ → BAS (haute, ◌่).
  5. บ้าน → DESCENDANT (moyenne, ◌้).
  6. พ่อ → DESCENDANT (basse, ◌่).
  7. ห้า → DESCENDANT (haute, ◌้).
  8. ขา → MONTANT (haute, rien).
  9. สอง → MONTANT (haute, rien).
  10. ถุง → MONTANT (haute, rien).
  11. น้อง → HAUT (basse, ◌้).
  12. แล้ว → HAUT (basse, ◌้).
  13. รถ → JE M’ARRÊTE (syllabe morte).
  14. ไม่ → JE M’ARRÊTE (forme en ไ).
- Seuil de réussite : 11 sur 14.
- **Planchers mesurés, quatre stratégies, comptes produits par script le
  2026-08-04.** Un, **réponse constante : 3 sur 14, soit 21,4 %**, aucune réponse
  n’étant demandée plus de trois fois. Deux, **« je regarde la marque et j’ignore
  la classe », en donnant à chaque marque sa réponse la plus fréquente : 7 sur
  14**, détail des groupes, **rien 3 sur 6, ◌่ 2 sur 4, ◌้ 2 sur 4**. Les six
  tirages sans marque sont กิน, มา, ขา, สอง, ถุง et รถ ; les quatre en ◌่ sont
  ป่า, สี่, พ่อ **et ไม่**, dont le ไม้เอก est visible dans sa séquence de points
  de code ; les quatre en ◌้ sont บ้าน, ห้า, น้อง et แล้ว. **Le détail publié
  antérieurement, « rien 3 sur 7, ◌่ 2 sur 3 », rangeait ไม่ du mauvais côté** :
  il est corrigé ici, le total de 7 sur 14 et la conclusion de l’exercice
  n’étant pas touchés. Trois, **« je
  regarde la classe et j’ignore la marque », même méthode : 6 sur 14**, détail,
  moyenne 1 sur 3, haute 3 sur 5, basse 2 sur 6. Quatre, **« je m’arrête
  toujours » : 2 sur 14**. La meilleure des quatre plafonne à 7 sur 14 contre un
  seuil de 11 : il manque quatre tirages. **Aucune moitié de la règle ne suffit,
  et c’est exactement ce que l’exercice annonce mesurer, le CROISEMENT.**
- Feedback correct : « Oui. Lu, pas entendu. »
- Feedback correct, tirages 13 et 14 : « Bien vu. S’arrêter était la bonne
  réponse, et ce n’est pas un échec. »
- Feedback incorrect, ton de la bonne marque mais de la mauvaise classe :
  « Reprenez la première question. Moyenne et haute vont ensemble ; la basse se
  détache. » La comparaison avec le mot jumeau de la leçon est proposée, ป่า
  contre พ่อ, ou บ้าน contre น้อง. Aucune pénalité.
- Feedback incorrect, tableau appliqué à un mot hors domaine : « Cette
  syllabe-là, le tableau n’en parle pas. Revoyez la quatrième question. » Aucune
  pénalité.
- Pièges connus : lire le ◌ิ de กิน ou le ◌ี de สี่ comme une marque de ton ;
  donner un ton à รถ parce que le mot est familier à l’oreille ; oublier que ขา,
  สอง et ถุง passent tous les trois par la même case, haute sans marque ; croire
  que ไม้โท donne toujours un descendant, ce que น้อง et แล้ว démentent.

### Exercice 4 : chaque mot dans sa case (`association`)

- Mécanique : `association`
- Ce qu’il mesure : que la classe et la marque sont deux informations SÉPARÉES,
  et qu’il faut les tenir toutes les deux. L’exercice ne demande aucun ton : il
  demande le chemin.
- Consigne : « Rangez chaque mot dans sa case. Touchez un mot, puis sa case :
  aucun glisser-déposer n’est nécessaire. »
- Interaction : sélection au clic ou au clavier, jamais de glisser-déposer
  obligatoire. Les six mots sont affichés en grand spécimen thaï, **sans
  transcription**, et les six cases sont écrites en toutes lettres. Les mots sont
  joués APRÈS validation.
- Paires à former : 6, bijection stricte.
  1. มา ↔ « classe basse, aucune marque ».
  2. ขา ↔ « classe haute, aucune marque ».
  3. ป่า ↔ « classe moyenne, ไม้เอก ».
  4. พ่อ ↔ « classe basse, ไม้เอก ».
  5. บ้าน ↔ « classe moyenne, ไม้โท ».
  6. น้อง ↔ « classe basse, ไม้โท ».
- Seuil de réussite : 6 sur 6.
- **Planchers mesurés, trois stratégies, comptes produits par script le
  2026-08-04.** Une réponse constante est structurellement impossible dans une
  bijection : chaque case ne sert qu’une fois. Un, **appariement entièrement au
  hasard : 1 chance sur 720, soit 0,14 %**. Deux, **« je vois la marque, je ne
  connais pas les classes »** : les trois marques ont deux mots chacune, ce qui
  laisse 2 × 2 × 2 = 8 arrangements, soit **1 sur 8, ou 12,5 %**. Trois, **« je
  connais les classes, je ne vois pas la marque »** : trois basses, deux
  moyennes, une haute, ce qui laisse 3! × 2! × 1! = 12 arrangements, soit **1 sur
  12, ou 8,3 %**. **Le plancher retenu est 12,5 %**, très en dessous du seuil, et
  aucun score intermédiaire n’existe entre 4 et 6 : cinq paires correctes en
  imposent une sixième.
- Feedback correct : « Oui. Deux informations, tenues ensemble. »
- Feedback correct, paires 3 et 4 : « Exactement. Le même ไม้เอก, deux cases
  différentes, parce que la classe n’est pas la même. »
- Feedback incorrect : « Prenez les mots deux par deux. ป่า et พ่อ portent le même
  signe ; ce qui les sépare est la lettre du dessous. » Aucune pénalité.
- Pièges connus : ranger พ่อ avec ป่า parce que les deux signes se ressemblent à
  petite taille ; ranger ขา avec มา parce que les deux n’ont aucune marque, en
  oubliant que ข et ม ne sont pas de la même classe ; chercher le ton au lieu du
  chemin, alors que l’exercice n’en demande aucun.

### Exercice 5 : écrivez ce que vous lisez (`recall`)

- Mécanique : `recall`
- Ce qu’il mesure : la lecture complète, restituée. C’est le seul exercice du
  jour où la réponse n’est pas prise dans une liste, et le seul qui exige la
  voyelle en plus du ton.
- Consigne : « Lisez le mot, puis écrivez-le en transcription Thaïnaute, accent
  de ton compris. Vous l’entendrez après avoir répondu. »
- Politique de saisie : alphabet latin uniquement, casse ignorée, espaces de
  début et de fin ignorés. Comme en `u07-l7a`, `u08-l8a`, `u09-l9a`, `u10-l10a`
  et `u11-l11a`, **l’accent de ton est OBLIGATOIRE et non tolérant** : il fait
  partie de ce qui est mesuré, et il se pose sur la première lettre du noyau
  vocalique, conformément à l’amendement v1.1 de `CONVENTIONS.md`. Aucun de ces
  huit mots n’est polysyllabique, donc le séparateur `·` n’est jamais attendu.
- Tirages et réponses : 8, affichés en thaï seul, ordre aléatoire.
  1. มา → `maa`.
  2. ขา → `khǎa`.
  3. ป่า → `pàa`.
  4. พ่อ → `phâww`.
  5. สี่ → `sìi`.
  6. ห้า → `hâa`.
  7. น้อง → `náwwng`.
  8. แล้ว → `láeew`.
- Seuil de réussite : 6 sur 8.
- **Plancher mesuré : aucun à deviner.** La saisie est libre et il n’y a pas
  d’option. Une réponse constante, quelle qu’elle soit, vaut au mieux **1 sur
  8**, et seulement si elle coïncide exactement avec l’une des huit réponses,
  accent compris. La stratégie « j’écris les lettres et je laisse tomber les
  accents » vaut elle aussi **1 sur 8**, et pas zéro : `maa` est la seule des
  huit réponses dont le ton, moyen, ne se note par aucun signe, donc la seule que
  cette stratégie donne juste. **Le plancher publié antérieurement disait 0 sur 8
  tout en décrivant l’exception dans la même phrase** ; il est corrigé, et le
  verdict de l’exercice ne change pas, le seuil étant de 6 sur 8.
- Feedback correct : « C’est ça. Vous avez lu le mot, le ton et la voyelle. »
- Feedback incorrect, accent absent : « L’accent manque, et il fait partie de la
  réponse. Rien pour le moyen, `à` pour le bas, `â` pour le descendant, `á` pour
  le haut, `ǎ` pour le montant. »
- Feedback incorrect, noyau mal transcrit : « Le ◌อ de พ่อ et de น้อง se
  transcrit `aww`, et l’accent se pose sur son premier `a`. » Le modèle est joué
  et la comparaison A/B est proposée.
- Pièges connus : écrire `phaw` au lieu de `phâww`, en oubliant le doublement du
  `w` de la voyelle longue ; écrire `naawng` au lieu de `náwwng` ; poser l’accent
  sur le `w` plutôt que sur le premier `a` ; écrire `laew` au lieu de `láeew` ;
  écrire `kha` pour ขา en oubliant le doublement du `a` ; écrire `sii` sans
  accent, ce qui donne un ton moyen là où le mot est bas.

### Sur ce qui est absent de cette leçon, et le motif de chacun

Deux des cinq mécaniques canoniques ne figurent pas dans cette leçon, et il n’y a
pas de section `## Dialogue`. Les trois absences sont raisonnées plutôt que
subies.

- **Il n’y a pas de section `## Dialogue`.** Un dialogue met en scène de la
  parole ; 12C ne mesure que ce que l’œil fait d’un mot écrit, et un dialogue y
  ajouterait de l’audio, ce que la Méta écarte des exercices pour préserver les
  planchers. **Relevé du 2026-08-04 sur l’état réel du dépôt** : `u12-l12d` et
  `u12-l12e` portent chacune une section `## Dialogue`, `u12-l12a` n’en porte pas
  non plus. L’unité en compte donc deux, ce qui suffit à son bilan.

- **`word_order` est absent parce que 12C ne lit aucune phrase.** L’objet du jour
  est le décodage d’un mot, une syllabe à la fois. Un exercice d’ordre des mots
  y mesurerait une syntaxe que la leçon n’enseigne pas et n’a pas révisée. Les
  trois autres leçons de l’unité en portent un, `u12-l12a`, `u12-l12d` et
  `u12-l12e`, ce qui a été vérifié dans le dépôt le 2026-08-04.
- **`listening` est absent parce qu’il détruirait les quatre autres planchers.**
  Cette leçon mesure ce que l’ŒIL sait faire seul. Dès qu’un mot est joué avant
  la réponse, l’oreille répond à la place de l’œil : un apprenant qui reconnaît
  รถ à l’audition donne son ton sans rien décoder, et le plancher de l’exercice 3
  devient faux. L’audio est donc systématiquement joué APRÈS la réponse. Les
  trois autres leçons de l’unité portent chacune un exercice `listening`, et le
  parcours en compte largement assez pour que la mécanique soit couverte.

## SRS

- `srs-u12-l12c-01` : nommer la CLASSE de la consonne initiale d’un mot publié,
  affiché sans transcription. Critère de maîtrise : 10 tirages sur 12, sur deux
  sessions espacées. **Contrainte de tirage, bloquante** : au moins cinq tirages
  doivent porter une voyelle pré-posée, sans quoi la carte mesure la
  connaissance des lettres et non le repérage de l’initiale, et son seuil devient
  atteignable par la stratégie « première lettre écrite » mesurée à l’exercice 1.
- `srs-u12-l12c-02` : dire si une syllabe publiée est VIVANTE, MORTE, ou hors du
  domaine de la méthode. Critère : 12 sur 14, sur deux sessions espacées.
  **Contrainte de tirage, bloquante** : au moins trois tirages doivent porter une
  syllabe OUVERTE à voyelle BRÈVE, et au moins trois une syllabe OUVERTE à
  voyelle LONGUE. Sans elles, la carte est franchie par la méthode telle que
  `u10-l10a` l’énonce, dont l’exercice 2 mesure qu’elle plafonne à 11 sur 14.
- `srs-u12-l12c-03` : donner le TON d’un mot publié, ou déclarer que la méthode
  ne le dit pas. Critère : 11 sur 14, sur deux sessions espacées. **Contraintes
  de tirage, bloquantes** : les neuf cases du tableau doivent être représentées,
  et au moins deux tirages doivent appeler « je m’arrête ». Sans la seconde, la
  carte n’entraîne jamais le geste que la leçon considère comme le plus
  important.
- **Aucune carte de ton nouvelle, et c’est une décision.** Le parcours porte déjà
  `srs-u04-l4a-06`, montant contre haut à l’écoute, et `srs-u07-l7a-03`, moyen
  contre bas à l’écoute. 12C n’en crée pas de troisième et leur APPORTE ses
  tirages :
  - à `srs-u04-l4a-06`, montant contre haut : les tirages ขา, สอง et ถุง, tous
    montants, contre น้อง et แล้ว, tous deux hauts, plus la paire de référence
    หมา contre ม้า de `u01-l1d` ;
  - à `srs-u07-l7a-03`, moyen contre bas : les tirages กิน et มา, tous deux
    moyens, contre ป่า et สี่, tous deux bas, plus la paire de référence ปา contre
    ป่า de `u01-l1c`.
    Une leçon ne modifie pas la carte d’une autre : ces deux apports sont des
    DEMANDES consignées, à exécuter à la consolidation. **Inventaire refait le
    2026-08-04 par recherche des deux identifiants dans `content/authoring/`** :
    `srs-u04-l4a-06` est cité par `u04-l4a`, `u09-l9a`, `u09-l9b`, `u09-l9c`,
    `u10-l10a` à `u10-l10e`, `u11-l11a` à `u11-l11e`, `u12-l12a`, `u12-l12d` et
    `u12-l12e` ; `srs-u07-l7a-03` par `u07-l7a`, `u07-l7d`, `u07-l7e`, `u09-l9a`,
    `u09-l9b`, `u10-l10a`, `u10-l10b`, `u10-l10d`, `u10-l10e`, `u11-l11a` à
    `u11-l11e`, `u12-l12a`, `u12-l12d` et `u12-l12e`. **Ni `u04-l4a` ni `u07-l7a`
    ne porte le moindre tirage rapporté par une leçon postérieure**, relecture
    faite le même jour. Avec celle de 12C, les demandes en attente couvrent
    désormais les unités 9 à 12 en entier. Voir l’arbitrage 3.
- Hors périmètre, parce que déjà porté par une carte existante qu’il ne faut ni
  dupliquer ni affaiblir : les treize graphies d’items et les quinze spécimens
  du tableau gardent leurs cartes de vocabulaire d’origine. **Aucune carte de 12C ne demande
  le SENS d’un mot ni sa production** : les trois cartes du jour portent
  uniquement sur la lecture.

## Note culturelle

Le système que vous venez de remonter en entier porte un nom, et ce nom est un
nombre. Le thaï l’appelle ไตรยางศ์, mot venu du sanskrit que le dictionnaire
normatif glose par « trois parts » et dont il précise l’emploi : c’est le nom des
trois groupes de lettres, อักษรสูง, อักษรกลาง et อักษรต่ำ, les hautes, les
moyennes et les basses. Vous n’avez donc pas appris trois listes séparées : vous
avez appris les trois tiers d’un même objet, et cet objet a un nom depuis
longtemps.

Une dernière remarque, et elle est amusante plutôt qu’utile. Le mot ไตรยางศ์
est lui-même illisible par la méthode qu’il nomme. Il commence par un ไ, forme
que la page 8 de `u04-l4a` met hors du domaine ; il compte deux syllabes, que ce
cours ne vous a pas appris à couper ; et il finit par un ศ éteint par un ◌์, le
signe de 9A. Trois des quatre familles de la page 13 sont dans un seul mot, celui
qui donne son nom à la méthode.

**Ce que cette note n’affirme PAS.** Elle ne dit rien de l’enseignement de la
lecture en Thaïlande, ni de l’âge auquel ce mot s’apprend, ni de sa fréquence.
Aucune source de la politique du projet ne permettrait de l’établir, et le cours
ne l’invente pas.

- Sources, toutes consultées le 2026-08-04. **Le nom des trois classes et celui
  du système sont des termes de MÉTALANGUE au sens de la section 1 ter de
  `docs/content-policy/sources-verification.md`** : le dictionnaire normatif y
  fait autorité définitionnelle, la seconde jambe est un usage concordant, et la
  note dit explicitement d’où vient la définition.
  - RID 2554, entrée « ไตรยางศ์ », relevée par
    `node scripts/verification/rid-entry.mjs ไตรยางศ์` : น., glosée par la
    notion de trois parts, avec la précision qu’elle sert de nom aux trois
    groupes de lettres, qu’elle énumère, et une étymologie sanskrite (faits cités
    par référence, définition non reproduite).
  - Usage concordant : VOLUBILIS v26.2, `VOLUBILIS_Database.xlsx`, **ligne
    106020**, relevée le 2026-08-04 (ThaiRom `traiyāng`, ThaiPhon `-trai-yāng`,
    étymologie `ตฺรยํศ (san)`, TYPE n., ENG « three-sound group ; three classes
    of Thai consonants », domaine `GRAMMA ; RID`). La **ligne 106019** donne le
    sens de trois parts. **Réserve déclarée** : les deux lignes portent `RID` en
    colonne de domaine, la corroboration est donc partiellement dépendante de la
    même autorité ; c’est un usage concordant du terme, pas une seconde
    définition indépendante, et la note ne prétend pas le contraire.
  - Noms des trois classes, corroboration indépendante celle-là : VOLUBILIS
    **lignes 974, 990 et 991**, อักษรกลาง, อักษรสูง et อักษรต่ำ, glosées en
    français par « consonne moyenne », « consonne haute » et « consonne basse »,
    domaine `GRAMMA ; LINGUA` **sans marqueur `RID`** ; et annexe
    « Appendix:Thai script » d’en.wiktionary, consultée le 2026-08-04, dont la
    colonne `Class` range chaque lettre en `mid`, `high` ou `low`.
  - **Ce qui a été cherché et NON trouvé, consigné plutôt que tu** :
    en.wiktionary n’a **aucune entrée** pour « ไตรยางศ์ », HTTP 404 sur
    https://en.wiktionary.org/wiki/ไตรยางศ์, vérifié le 2026-08-04. La note ne
    dispose donc pas d’une troisième lecture pour ce terme précis.
  - Le ◌์ et la lettre qu’il éteint : `u09-l9a`, dont la note culturelle publie
    le nom du signe, ทัณฑฆาต, sur ses propres sources. 12C n’y ajoute rien.

## Dossier de production

- Acteur de génération : Claude Opus 5 (`claude-opus-5[1m]`), rédaction originale
  le 2026-08-04. Aucune formulation reprise d’une source ; les définitions
  thaïes, anglaises et françaises citées dans les champs `sources` le sont à
  titre de preuve de consultation, jamais comme texte de leçon. **Aucune
  définition du RID n’est restituée sur un écran d’apprenant**, contrainte issue
  du finding `SENS-MONO` du contre-audit de `u09-l9a`. Le seul contenu du RID
  restitué à l’écran est l’ÉNUMÉRATION des lettres des trois classes, à la
  page 3, et le NOM du système, à la note culturelle, tous deux au titre de la
  section 1 ter.
- Méthode de vérification : chaque fait est vérifié contre au moins deux
  autorités indépendantes réellement consultées le 2026-08-04, méthode d’accès
  consignée fait par fait selon l’amendement v1.2 de `CONVENTIONS.md`, et
  l’artefact VOLUBILIS de référence est le `.xlsx`, conformément à l’amendement
  v1.3. Deux citations `.ods` héritées, celles de `u03-l3b` pour สี่ et ห้า, sont
  **réancrées sur le `.xlsx` dans ce fichier**, lignes 91868 et 14524.
- Toutes les consultations de ce dossier ont été faites le 2026-08-04.
- **Contrainte propre à l’unité 12, vérifiée avant rédaction et re-balayée
  après.** L’unité 12 parle du NIVEAU ATTEINT. Ce fichier **n’affirme aucun
  niveau CECR, aucun nombre d’heures, aucune équivalence, aucune durée
  d’apprentissage et aucune promesse de résultat**. Balayage exécuté le
  2026-08-04 sur les écrans seuls, c’est-à-dire tout ce qui précède la section
  `## Dossier de production`, insensible à la casse, motifs `A1`, `A2`, `B1`,
  `CECR`, `CECRL`, `niveau`, `heures`, `mois`, `semaines`, `équivalent` : les
  seules occurrences de « niveau » sont les deux de la page 1 et de la page 14
  qui **nient** en fournir un, et il n’y a aucune occurrence des autres motifs.
  Le relevé est au tableau des contrôles.
- **Ce que ce fichier affirme sur l’apprenant, et c’est très peu.** Il affirme
  des ACTES mesurés par cinq exercices dont les planchers sont écrits, et rien
  d’autre. Les chiffres de la page 13 décrivent le COURS, pas l’apprenant, et la
  page le dit en toutes lettres.

### Sources employées et méthode d’accès

- **RID 2554** (Office of the Royal Society), autorité n° 1 en orthographe et en
  sens, et ici autorité définitionnelle pour cinq termes de métalangue,
  อักษรกลาง, อักษรสูง, อักษรต่ำ, คำเป็น et คำตาย, plus ไตรยางศ์ à la note
  culturelle, au titre de la section 1 ter de
  `docs/content-policy/sources-verification.md`. Accès par requête POST unique
  par graphie sur https://dictionary.orst.go.th/func_lookup.php, paramètres
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, requêtes espacées d’au moins 1,2 seconde
  par les scripts versionnés `rid-lookup.mjs` et `rid-entry.mjs`, agent
  utilisateur identifiant le projet. Aucun texte de définition n’est recopié.
  - **Décompte : 24 graphies interrogées, 24 attestées, 0 sans entrée.**
  - Attestées et citées comme preuve d’item (13) : มา, ขา, ป่า, พ่อ, สี่, ห้า,
    กิน, สอง, บ้าน, น้อง, แล้ว, เพลง, เปลี่ยน.
  - Attestées et citées comme spécimen ou tirage (5) : รถ, มาก, หมา, ไม่, ตลาด.
  - **Graphies affichées à l’apprenant et NON interrogées ici, déclarées plutôt
    que comptées d’office** : เจอ, เสีย et เสื้อ, tirages 3, 7 et 8 de
    l’exercice 1, จาน, spécimen de la page 1, et ก็, nommée à la page 13, toutes
    cinq trouvées hors inventaire au contre-audit interne. Leur attestation
    d’orthographe est celle de `u06-l6a`, `u08-l8a`, `u04-l4c` et `u11-l11c`,
    qui les publient avec leur propre dossier de sources. Aucune interrogation
    supplémentaire n’a été fabriquée pour arrondir le décompte à 29, et les
    lignes « Orthographe » et « Nouveauté des items » du tableau des audits
    disent la même chose.
  - Interrogées comme entrées de terminologie (6) : อักษรกลาง, อักษรสูง,
    อักษรต่ำ, คำเป็น, คำตาย et ไตรยางศ์. Les trois premières énumèrent les
    lettres de leur classe, 9, 11 et 24 ; les deux suivantes définissent les
    deux types de syllabe ; la dernière nomme le système entier.
  - **Trois lectures entre crochets ont changé le contenu du fichier** : `[เพฺลง]`
    et `[เปฺลี่ยน]`, dont le พินทุ sous la première lettre établit le groupe, et
    `[ตะหฺลาด]`, dont le พินทุ sous un ห inséré établit que ตล n’en est PAS un.
    Ces trois relevés fondent la page 12 et les items 12 et 13.
- **VOLUBILIS v26.2** (licence CC BY-SA 4.0), pivot français, corroboration de
  ton, de longueur et de type grammatical.
  - **Exemplaire employé, identifié par empreinte, vérifiée AVANT toute
    citation** : `VOLUBILIS_Database.xlsx`, **10 848 409 octets**, SHA-256
    `b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, soit
    exactement l’empreinte documentée dans l’en-tête de `volubilis-lookup.mjs` et
    celle employée par `u08-l8a`, `u09-l9a`, `u10-l10a` et `u11-l11a`. Le même
    relevé rend **114 579 lignes non vides et 586 541 chaînes partagées**,
    chiffres identiques à ceux de ces quatre leçons.
  - **Numéros de ligne, tous rendus le 2026-08-04** par
    `node scripts/verification/volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <graphie>`,
    **avec le NOMBRE de lignes rendues et non la seule plage**, précaution
    demandée par l’arbitrage 11 de `u11-l11a` : มา 50904 et 50905 (2 lignes),
    ขา 28947 à 28951 (**5 lignes**), ป่า 65412 et 65413 (2), พ่อ 72427 (1),
    สี่ 91868 (1), ห้า 14524 (1), กิน 40915 et 40916 (2), สอง 93932 (1),
    บ้าน 3744 (1), น้อง 64026 à 64028 (3), แล้ว 47342 et 47343 (2),
    เพลง 72181 (1), เปลี่ยน 76838 (1), รถ 84431 (1), มาก 53109 (1),
    หมา 50909 et 50910 (2), ไม่ 51636 à 51638 (3), ตลาด 96552 et 102433 (2),
    ไตรยางศ์ 106019 et 106020 (2), อักษรกลาง 974 (1), อักษรสูง 990 (1),
    อักษรต่ำ 991 (1), คำเป็น 30262 (1), คำตาย 30415 (1), คะ 28944 (1),
    และ 47205 et 47206 (2), ถุง 104171 et 104172 (2).
  - **Une divergence de notation relevée et déclarée, pas tranchée en silence** :
    la colonne `ThaiPhon` marque les voyelles longues par un macron, mais elle
    n’en met jamais sur le noyau `ø`, qui note le `aww`. พ่อ, สอง et น้อง
    portent tous trois `ø` nu alors que leurs trois leçons d’origine publient une
    voyelle LONGUE, corroborée par les `ɔː` d’en.wiktionary. **La colonne ne vaut
    donc pas comme fait de longueur sur ce noyau**, ce qui est écrit à l’item 4
    et repris aux items 8 et 10. Incertitude 2.
  - **Portée réelle de cette source, réserve conservée depuis `u06-l6a`.** La
    colonne `ThaiPhon` est une transcription d’auteur et une partie des entrées
    porte `RID` en colonne `DOM`. VOLUBILIS est donc une corroboration
    partiellement indépendante, ce qui suffit au contrat d’item puisque
    en.wiktionary fournit une seconde jambe pour chacun des treize items. Pour
    les six termes de métalangue, la dépendance est explicitement déclarée là où
    elle existe : les deux lignes de ไตรยางศ์ portent `RID`, les trois lignes des
    classes ne le portent pas, et la ligne de คำตาย ne le porte pas non plus.
- **Wiktionary** (édition en), pour la prononciation, le ton, la longueur et la
  définition. Consulté en rendu, les modèles `{{th-pron}}` n’exposant pas l’IPA
  en wikitexte. Entrées lues le 2026-08-04 : มา, ขา, ป่า, พ่อ, สี่, ห้า, กิน,
  สอง, บ้าน, น้อง, แล้ว, เพลง, เปลี่ยน, คะ. Annexe lue le même jour :
  « Appendix:Thai script », https://en.wiktionary.org/wiki/Appendix:Thai_script,
  colonne `Class` relevée pour ก, ข, ป, พ, ม, ส, ห, บ, น, ล, ง, ร, ต et ค.
  **Entrée interrogée et rendant HTTP 404 : ไตรยางศ์.** **Contrôle négatif
  supplémentaire, consigné parce qu’il change une décision de la leçon** :
  l’annexe « Appendix:Thai script » ne traite ni la syllabe vivante ni la
  syllabe morte, relevé du 2026-08-04. Elle ne peut donc pas servir de seconde
  jambe à la page 6, ce qui est le motif pour lequel cette page passe par la
  section 1 ter. Les éditions en et th et les annexes sont traitées comme UN seul
  écosystème, jamais comme plusieurs sources indépendantes.
- **Unicode Standard 17.0** (Unicode Consortium). Les trois fichiers ont été
  **retéléchargés et empreintés le 2026-08-04** depuis
  https://www.unicode.org/Public/17.0.0/ucd/ :
  - `UnicodeData.txt`, **2 198 209 octets**, SHA-256
    `2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c`, ligne
    3244 pour U+0E35 et ligne 3259 pour U+0E48 ;
  - `PropList.txt`, **145 465 octets**, SHA-256
    `130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd`, ligne
    1461, `0E40..0E44 ; Logical_Order_Exception` ;
  - `IndicPositionalCategory.txt`, **52 257 octets**, SHA-256
    `68cedc29a7e57f984d90fe2c7712f2e6d0c717e253db219607daea8997d6c480`, en-tête
    `IndicPositionalCategory-17.0.0.txt`, ligne 384,
    `0E40..0E44 ; Visual_Order_Left`.
    Les trois empreintes sont **identiques à celles consignées par `u09-l9a`,
    `u10-l10a` et `u11-l11a`**, vérifiées ici plutôt que reprises.

### Partie 1 : ce que le parcours permet réellement de lire, mesuré

C’est le fait central de la leçon, et il ne repose sur aucune estimation. Un
outil a été écrit pour le produire :
`node scripts/verification/lecture-corpus.mjs 1 11`, versionné dans le dépôt le
2026-08-04. Il applique les quatre questions, dans leur ordre, à chaque graphie
publiée d’une seule syllabe, et compare le ton PRÉDIT par le tableau au ton
PUBLIÉ par la leçon d’origine.

**Convention d’entrée, et elle est empruntée, pas réinventée.** La fonction
`entriesOf` est reprise SANS MODIFICATION de `repo-thai-scan.mjs`, au champ `ton`
près, dont ce script a besoin comme valeur. Les deux outils comptent donc
exactement les mêmes graphies, ce qui se vérifie en une ligne :
`repo-thai-scan.mjs 1 11` et `lecture-corpus.mjs 1 11` rendent tous deux
**55 fichiers, 512 entrées et 353 graphies distinctes**.

| Compartiment                                | Graphies |
| ------------------------------------------- | -------- |
| **VIVANTE, le tableau donne le ton publié** | **94**   |
| VIVANTE, ÉCART entre le tableau et la leçon | **0**    |
| MORTE, le tableau des vivantes se TROMPE    | 36       |
| MORTE, le tableau des vivantes tombe juste  | 2        |
| hors domaine : forme en ไ, ใ, เ◌า ou ◌ำ     | 16       |
| hors domaine : consonne de tête             | 11       |
| hors domaine : lettre éteinte par ◌์        | 1        |
| hors mesure : plusieurs syllabes            | 191      |
| hors mesure : pas une graphie simple        | 1        |
| non classé : forme de syllabe non reconnue  | 1        |
| **TOTAL**                                   | **353**  |

**Ce que ce tableau dit, et ce qu’il ne dit pas.**

1. **Zéro écart sur 94.** Sur les 94 graphies vivantes d’une seule syllabe, le
   tableau enseigné aux unités 4 à 8 donne exactement le ton que la leçon
   d’origine publie, 94 fois sur 94. C’est la vérification la plus large que le
   parcours ait de sa propre règle de lecture, et elle porte sur des tons qui
   sont chacun déjà double-sourcés dans leur leçon d’origine.
2. **Le tableau se trompe 36 fois sur 38 syllabes mortes.** Les deux exceptions,
   ค่ะ et ล่ะ, sont **les deux seules mortes du corpus qui portent une marque
   écrite**, toutes les autres étant nues. La consigne « syllabe morte, on
   s’arrête » n’est donc pas une précaution de confort : c’est ce qui évite 36
   réponses fausses.
3. **Le seul compartiment « non classé » est ก็**, publié par `u11-l11c`, dont
   la graphie est irrégulière et dont l’outil ne reconnaît pas la forme. Il est
   IMPRIMÉ plutôt qu’absorbé ailleurs, et il n’entre dans aucun chiffre de la
   page 13.
4. **Le compartiment « plusieurs syllabes » n’est pas un échec de la méthode**,
   c’est une limite de l’outil ET du parcours : le script écarte toute graphie
   dont le champ `ton` nomme deux tons ou plus, parce que segmenter une graphie
   thaïe en syllabes est un problème qu’il ne prétend pas résoudre, et que ce
   cours ne l’enseigne pas non plus. C’est écrit à la page 13 dans ces
   termes-là.
5. **Ce tableau décrit le COURS.** Il ne dit rien de ce qu’un apprenant a
   retenu, et la page 13 le dit à l’écran.

### Partie 2 : le tableau des tons, re-mesuré une seconde fois

`u10-l10a` a mesuré les neuf cases vivantes du tableau sur VOLUBILIS avec
`table-des-tons.mjs`. La mesure a été RÉEXÉCUTÉE ici, sur l’exemplaire déclaré
plus haut, le 2026-08-04, et elle rend exactement les mêmes chiffres :
**2 125 entrées retenues et 9 divergences de la colonne `ThaiPhon`**, aux mêmes
lignes 10400, 18381, 49905, 102568, 105274, 107808, 111646, 111647 et 113117.

| Case          | Attendu    | n   | Observé                           |
| ------------- | ---------- | --- | --------------------------------- |
| moyenne, rien | moyen      | 281 | moyen 280, bas 1                  |
| haute, rien   | montant    | 225 | montant 224, moyen 1              |
| basse, rien   | moyen      | 538 | moyen 537, montant 1              |
| moyenne, ◌่   | bas        | 174 | bas 173, moyen 1                  |
| haute, ◌่     | bas        | 119 | bas 119                           |
| basse, ◌่     | descendant | 305 | descendant 303, bas 2             |
| moyenne, ◌้   | descendant | 199 | descendant 198, haut 1            |
| haute, ◌้     | descendant | 63  | descendant 63                     |
| basse, ◌้     | haut       | 221 | haut 219, descendant 1, montant 1 |

Les neuf divergences ont été ouvertes une par une par `u10-l10a` sur
en.wiktionary, qui a établi que sept fois sur sept c’était VOLUBILIS qui se
trompait. 12C ne rouvre pas cet arbitrage et le cite tel quel. **Deux mesures
indépendantes concordent donc sur le même tableau** : 2 125 entrées de VOLUBILIS
et 94 graphies du corpus publié, zéro contre-exemple des deux côtés.

### Partie 3 : la branche manquante des syllabes mortes, et sa preuve

C’est le seul ajout de 12C à un écran d’apprenant, et il vaut d’être exposé en
entier.

**Ce que `u10-l10a` écrit.** Sa page 5 énonce : « DEDANS : la syllabe tient sur
une voyelle longue et rien ne la ferme, ou elle se ferme sur ง, น, ม, ย ou ว.
DEHORS : elle se ferme sur un son `k`, sur un son `t` ou sur un son `p`. » Une
syllabe OUVERTE à voyelle BRÈVE ne tombe dans aucune de ces deux branches.

**Ce que le dictionnaire normatif écrit.** Entrées « คำเป็น » et « คำตาย »,
relevées le 2026-08-04 par `node scripts/verification/rid-entry.mjs คำเป็น คำตาย`
et citées par référence : la première range les mots à voyelle longue sans
consonne finale, **plus** les séries กง, กน, กม, เกย et เกอว ; la seconde range
les mots **à voyelle brève sans consonne finale**, plus les séries กก, กด et กบ.
La branche manquante est donc écrite noir sur blanc dans la définition normative
du terme que le parcours emploie depuis l’unité 4.

**La seconde jambe, et elle est indépendante.** VOLUBILIS v26.2, `.xlsx`,
**ligne 30415**, relevée le 2026-08-04 : คำตาย, ThaiPhon `-kham-tāi`, TYPE
`n. exp.`, ENG « dead syllable ; word that cannot be inflected ; **syllable
ending with a short vowel** », respelling `[คำ-ตาย]`. **Cette ligne ne porte pas
`RID` en colonne de domaine**, contrairement à celles de ไตรยางศ์, et elle nomme
explicitement le critère de la voyelle brève. La ligne **30262** donne คำเป็น,
« live syllable », sans marqueur `RID` elle non plus. La section 1 ter est donc
satisfaite au-delà de ce qu’elle exige : autorité définitionnelle du RID, ET un
usage concordant indépendant qui nomme le même critère.

**La troisième jambe, et c’est une mesure.** Le parcours publie **sept graphies**
d’une seule syllabe ouverte à voyelle brève, relevées par
`lecture-corpus.mjs 1 11 --detail` le 2026-08-04 :

| Graphie | Publiée par | Classe, marque | Ce que le tableau des vivantes dirait | Ton publié |
| ------- | ----------- | -------------- | ------------------------------------- | ---------- |
| ดุ      | `u07-l7b`   | moyenne, rien  | moyen                                 | **bas**    |
| คะ      | `u02-l2e`   | basse, rien    | moyen                                 | **haut**   |
| เตะ     | `u03-l3a`   | moyenne, rien  | moyen                                 | **bas**    |
| แตะ     | `u03-l3a`   | moyenne, rien  | moyen                                 | **bas**    |
| และ     | `u11-l11c`  | basse, rien    | moyen                                 | **haut**   |
| ค่ะ     | `u01-l1e`   | basse, ◌่      | descendant                            | descendant |
| ล่ะ     | `u06-l6e`   | basse, ◌่      | descendant                            | descendant |

**Cinq sur cinq faux parmi les nues, deux sur deux justes parmi les marquées.**
Le partage est net et il n’a rien d’un hasard : quand une marque est écrite, elle
décide, et la question du type de syllabe ne se pose pas de la même façon. Le
cours ne dit pas cela à l’écran, parce que deux mots ne suffisent pas à fonder
une règle, et le point est porté à l’incertitude 4.

**Ce que 12C ajoute donc à l’écran, et rien de plus** : la page 6 énonce les deux
branches de chaque type au lieu d’une et demie, et l’exercice 2 la mesure. La
correction de la page 5 de `u10-l10a` est demandée à l’arbitrage 1 ; 12C ne
modifie pas le fichier d’une autre leçon.

### Partie 4 : la règle des mortes existe, elle a maintenant une mesure, et elle n’est PAS enseignée

`u10-l10a` a écrit à son incertitude 1 que la règle de ton des syllabes mortes
est lisible dans les trois entrées de classe du RID, qu’elle a quatre branches,
et qu’elle **manque d’une seconde source**. Sa piste de résolution était
d’étendre une mesure empirique à un critère de longueur explicite.

**Les trois entrées, relues ici le 2026-08-04** par
`node scripts/verification/rid-entry.mjs อักษรกลาง อักษรสูง อักษรต่ำ`, disent,
faits cités par référence : pour un mot mort, la classe moyenne a pour ton de
base เอก ; la classe haute également เอก ; la classe basse se dédouble, ตรี si la
voyelle est brève et โท si elle est longue. Traduit dans les noms du parcours :
moyenne et haute donnent BAS ; basse donne HAUT sur voyelle brève et DESCENDANT
sur voyelle longue.

**La mesure.** `lecture-corpus.mjs` applique cette règle aux graphies mortes
SANS marque écrite, en prenant la longueur au champ `longueur` que la leçon
d’origine PUBLIE, jamais en la devinant sur la graphie. Résultat du 2026-08-04 :

```
mortes sans marque, RID confirmé              33
mortes sans marque, RID CONTREDIT              0
mortes, longueur non déclarée                  3
```

Les trois écartées sont ขวด, ปวด et เรียก, dont les leçons d’origine écrivent
`longueur : NON ÉTABLIE` à cause d’une diphtongue. Elles sont écartées plutôt que
tranchées, et le script les imprime.

**Trente-trois sur trente-trois, zéro contre-exemple.** Chacun de ces trente-trois
tons est déjà double-sourcé dans sa leçon d’origine. La seconde jambe que
`u10-l10a` cherchait existe donc maintenant.

**Et 12C n’enseigne pas cette règle.** Trois motifs, dans cet ordre. Un, la
consigne éditoriale de l’unité 12 est de ne rien enseigner de neuf ; une règle de
lecture à quatre branches n’est pas une révision. Deux, une leçon de bilan est le
pire endroit pour installer une règle, parce qu’elle n’a plus d’unité derrière
elle pour l’entretenir. Trois, et c’est le plus important, **la mesure ci-dessus
porte sur 33 mots, pas sur un corpus** : elle suffit à dire que le corpus publié
ne contredit pas la règle, elle ne suffit pas à en faire une règle enseignée
sans une mesure de masse du même genre que celle de la partie 2. L’arbitrage 2
demande cette mesure et la décision qui va avec.

### Partie 5 : les groupes de consonnes, et ce que trois lectures établissent

La page 12 affirme que ปล et พล comptent pour une seule initiale et que ตล n’en
est pas une. Les trois faits sont établis par des lectures de dictionnaire, et
non par une intuition d’auteur.

| Graphie | Lecture donnée par le RID | Lecture donnée par VOLUBILIS    | Forme phonémique en.wiktionary |
| ------- | ------------------------- | ------------------------------- | ------------------------------ |
| เพลง    | `[เพฺลง]`                 | (pas de respelling)             | `เพฺลง`                        |
| เปลี่ยน | `[เปฺลี่ยน]`              | `[เปฺลี่ยน]`                    | `เปฺลี่ยน`                     |
| ตลาด    | `[ตะหฺลาด]`               | `[ที่ ตะ-หฺลาด]` (ligne 102433) | (non relevée)                  |

Le signe U+0E3A, พินทุ, est posé sous la PREMIÈRE lettre du groupe dans les deux
premiers cas, et sous un ห INSÉRÉ dans le troisième, où la lecture donne deux
syllabes, ตะ puis หฺลาด. Les deux premières lignes établissent donc le groupe,
la troisième établit son absence.

**Ce que ces lectures n’établissent PAS, et la page 12 le dit.** Elles n’aident
pas l’apprenant : le พินทุ ne s’écrit pas dans le thaï courant, il n’apparaît
que dans les lectures de dictionnaire. À l’œil, sur un texte réel, rien ne
distingue ตลาด de ปลา, exactement comme `u10-l10a` l’écrivait. La page 12
conserve cette position et n’en propose aucune autre.

### Partie 6 : aucune graphie nouvelle, et le contrôle est exécuté

La leçon annonce qu’elle n’introduit aucun mot. Le contrôle a été fait graphie
par graphie le 2026-08-04, par
`node scripts/verification/repo-thai-scan.mjs 1 11 --grep <graphie>` pour chacune
des treize graphies d’items et des **quinze** spécimens du tableau, plus
lecture du bloc d’item dans le fichier trouvé.

**Le premier passage de ce contrôle portait sur onze spécimens et il était
incomplet.** Le contre-audit interne du 2026-08-04 a trouvé trois graphies
affichées à l’exercice 1, เจอ, เสีย et เสื้อ, qui ne figuraient ni au tableau des
réemplois, ni au décompte RID, ni à la liste Unicode, alors que la section
Unicode nommait elle-même เสื้อ comme tirage de l’exercice 1.

**La correction proposée par l’audit était de passer à quatorze, et elle a été
vérifiée avant d’être appliquée** : elle manquait encore une graphie. Le compte
n’est plus tenu à la main. Toutes les sous-chaînes thaïes des sections
`## Enseignement` et `## Exercices` ont été extraites mécaniquement le
2026-08-04 et confrontées une par une à l’inventaire. **Le compte retombe, et
voici sa décomposition entière** : 106 sous-chaînes distinctes, dont **59
lettres et signes isolés**, **7 chaînes qui ne sont pas des mots**, les quatre
noms de marques ไม้เอก, ไม้โท, ไม้ตรี et ไม้จัตวา, les deux groupes ปล et พล et
les chiffres thaïs ๙๔, et **40 graphies**, soit les 13 items, les 15 du tableau
ci-dessus et les 12 citées une seule fois. **59 plus 7 plus 40 font 106, et
zéro graphie reste hors inventaire.** La quinzième ligne du tableau, จาน, est le
spécimen de la page 1 et n’avait jamais été inventoriée. Le contrôle `--grep` a
été refait sur
les quatre ajoutées, leurs blocs d’item ont été lus, et la conclusion de fond
tient : **aucun mot nouveau n’est introduit.** Ce que le premier passage
établissait était donc vrai par accident et faux par méthode, et le second l’a
été à moitié ; c’est le défaut que `item-fields-check.mjs` attrape sur les
champs, appliqué cette fois à l’inventaire des écrans, où aucun outil ne
l’attrapait. Voir l’incertitude 9.

Les treize items portent leur référence `uXX-lYz` au TITRE, ce qui rend le
contrôle mécanique possible :
`node scripts/verification/item-fields-check.mjs content/authoring/unite-12/lecon-12c.md`
suit chaque référence, retrouve la graphie dans le fichier cité et compare
`ipa`, `ton`, `longueur`, `transcription` et `codepoints`. **C’est précisément le
contrôle que `u11-l11a` ne pouvait pas obtenir**, ses huit items étant nouveaux
et sans référence au titre, ce qui lui rendait un « 0 écart » vide dénoncé à son
arbitrage 10.

**Ici le contrôle a réellement tourné, et il a trouvé trois choses. Elles sont
données telles que le script les rend, y compris celle qui est une faute de
l’auteur.**

1. **Une faute d’auteur, corrigée.** Le champ `longueur` de l’item 13 avait été
   RÉÉCRIT pour clarifier un renvoi interne : « même motif que l’item 3 de
   `u08-l8a` » au lieu de « même motif que l’item 3 », plus une phrase ajoutée.
   C’est exactement le geste que ce script existe pour attraper, décrire
   autrement un champ que l’on déclare reprendre sans modification. **Le champ a
   été rétabli à la lettre** et l’explication est passée en note de sources.
2. **Un écart typographique, laissé tel quel et déclaré.** L’item 3 écrit
   `U+0E1B U+0E48 U+0E32 (NFC)` là où `u01-l1c` écrit la même séquence sans
   « (NFC) ». Le script imprime les deux valeurs et laisse l’arbitrage à
   l’humain, comme son en-tête l’annonce. La séquence est identique.
3. **Une limite de l’outil, qui n’est pas un défaut de la leçon.** Sur l’item 2,
   le script rend « graphie absente de u01-l1a ». Elle n’en est pas absente :
   `u01-l1a` écrit ses champs sans guillemets obliques, `- thai : ขา`, et le
   script n’indexe que ``- `thai` :``. `repo-thai-scan.mjs` reconnaît
   explicitement les deux formes et trouve bien la graphie. **Douze réemplois sur
   treize sont donc vérifiés mécaniquement, le treizième par relecture manuelle**,
   et le point est porté à l’arbitrage 7.

Le relevé complet est au tableau des contrôles mécaniques.

### Vérification Unicode

Séquences NFC recalculées le 2026-08-04 et vérifiées comme STABLES, la forme NFC
étant identique à la chaîne source pour les treize graphies d’items comme pour
les spécimens.

| Item    | Séquence NFC                                     | Empilement max |
| ------- | ------------------------------------------------ | -------------- |
| มา      | U+0E21 U+0E32                                    | 0              |
| ขา      | U+0E02 U+0E32                                    | 0              |
| ป่า     | U+0E1B U+0E48 U+0E32                             | 1              |
| พ่อ     | U+0E1E U+0E48 U+0E2D                             | 1              |
| สี่     | U+0E2A U+0E35 U+0E48                             | **2**          |
| ห้า     | U+0E2B U+0E49 U+0E32                             | 1              |
| กิน     | U+0E01 U+0E34 U+0E19                             | 1              |
| สอง     | U+0E2A U+0E2D U+0E07                             | 0              |
| บ้าน    | U+0E1A U+0E49 U+0E32 U+0E19                      | 1              |
| น้อง    | U+0E19 U+0E49 U+0E2D U+0E07                      | 1              |
| แล้ว    | U+0E41 U+0E25 U+0E49 U+0E27                      | 1              |
| เพลง    | U+0E40 U+0E1E U+0E25 U+0E07                      | 0              |
| เปลี่ยน | U+0E40 U+0E1B U+0E25 U+0E35 U+0E48 U+0E22 U+0E19 | **2**          |

Spécimens, mêmes date et méthode : ถุง U+0E16 U+0E38 U+0E07 ; คะ U+0E04 U+0E30 ;
และ U+0E41 U+0E25 U+0E30 ; เตะ U+0E40 U+0E15 U+0E30 ; รถ U+0E23 U+0E16 ; มาก
U+0E21 U+0E32 U+0E01 ; ชอบ U+0E0A U+0E2D U+0E1A ; หมา U+0E2B U+0E21 U+0E32 ;
ไม่ U+0E44 U+0E21 U+0E48 ; อยู่ U+0E2D U+0E22 U+0E39 U+0E48 ; ตลาด U+0E15 U+0E25
U+0E32 U+0E14 ; ปลา U+0E1B U+0E25 U+0E32 ; ปา U+0E1B U+0E32 ; ม้า U+0E21 U+0E49
U+0E32 ; แพทย์ U+0E41 U+0E1E U+0E17 U+0E22 U+0E4C.

**Cinq spécimens ajoutés au contre-audit interne du 2026-08-04**, séquences
recalculées et vérifiées comme STABLES en NFC le même jour : เจอ U+0E40 U+0E08
U+0E2D ; เสีย U+0E40 U+0E2A U+0E35 U+0E22 ; เสื้อ U+0E40 U+0E2A U+0E37 U+0E49
U+0E2D ; จาน U+0E08 U+0E32 U+0E19 ; ก็ U+0E01 U+0E47. เสื้อ porte une pile de
deux signes au-dessus du ส et figurait déjà, seule des cinq, au relevé
d’empilement plus bas. Les deux graphies de la page 7 citées par le décompte de
la case ◌๋ y sont ajoutées elles aussi : ตั๋ว U+0E15 U+0E31 U+0E4B U+0E27 ;
กระเป๋า U+0E01 U+0E23 U+0E30 U+0E40 U+0E1B U+0E4B U+0E32 ; เก๊ U+0E40 U+0E01
U+0E4A.

Points de rendu à contrôler à l’intégration :

- **Deux ITEMS empilent DEUX signes au-dessus d’une même lettre**, สี่, où
  U+0E35 puis U+0E48 se posent sur le ส, et เปลี่ยน, où les deux mêmes points de
  code se posent sur le ล. Les pages 9 et 12 et les exercices 1, 3 et 5 les
  affichent en grand spécimen : la pile doit rester lisible à 390 px et ne jamais
  être tronquée. C’est la contrainte la plus exposée du fichier, parce que
  l’exercice 1 se gagne sur la lettre qui porte la pile.
  **Décompte élargi, exécuté plutôt que déduit** :
  `node scripts/verification/unicode-stack-scan.mjs content/authoring/unite-12/lecon-12c.md`
  rend, sur les **149** sous-chaînes thaïes du fichier entier, **profondeur
  maximale 2 et sept graphies concernées**, ตั๋ว, ที่, สี่, หนึ่ง, เปลี่ยน,
  เปฺลี่ยน et เสื้อ. Relevé refait après les ajouts du contre-audit interne, le
  2026-08-04 : le total passe de 146 à 149, la profondeur maximale et la liste
  des sept sont inchangées. **Cinq d’entre elles apparaissent sur un ÉCRAN** :
  ตั๋ว à la page 7, หนึ่ง à la page 13, เสื้อ au tirage 8 de l’exercice 1, plus
  les deux items. Les deux autres, ที่ et เปฺลี่ยน, ne figurent que dans le
  dossier, à l’intérieur de lectures de dictionnaire citées ;
- **l’ordre de la pile ne doit jamais être normalisé.** U+0E35 porte la classe
  combinatoire 0 et U+0E48 la classe 107, `UnicodeData.txt` lignes 3244 et 3259 :
  la forme NFC conserve donc l’ordre du fichier, et un composant qui réordonnerait
  ces deux signes changerait la graphie ;
- **les voyelles pré-posées sont nombreuses**, แ de แล้ว, เ de เพลง et de
  เปลี่ยน, plus celles des spécimens. Elles portent `Logical_Order_Exception`
  (`PropList.txt`, ligne 1461) et `Visual_Order_Left`
  (`IndicPositionalCategory.txt`, ligne 384), c’est-à-dire que l’ordre du fichier
  et l’ordre de l’écran coïncident ;
- **l’exercice 1 exige un découpage par POINT DE CODE, pas par grappe de rendu.**
  Il ne demande pas de toucher une lettre, mais son énoncé désigne une lettre
  dans une chaîne, et le feedback met en évidence l’initiale : un composant qui
  découpe เปลี่ยน par grappes visuelles ne peut pas mettre en évidence le ป seul.
  C’est la contrainte que l’arbitrage 4 de `u10-l10a` avait déjà posée pour son
  propre exercice 1, et elle vaut ici aussi.

### Contrôles mécaniques exécutés sur ce fichier

| Contrôle                                  | Ce qu’il a rendu                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `repo-thai-scan.mjs --check-u07`          | passe, dix chiffres sur dix, le 2026-08-04. Aucun décompte de ce dossier n’est cité sans cela                                                                                                                                                                                                                                                                                                          |
| `repo-thai-scan.mjs 1 11`                 | 55 fichiers, 512 entrées, 353 graphies distinctes                                                                                                                                                                                                                                                                                                                                                      |
| `repo-thai-scan.mjs 12 12`                | **relevé du contre-audit, les deux précédents étant périmés** : **5 fichiers, 13 entrées, 13 graphies**, les treize venant toutes de `lecon-12c.md` et aucune des quatre autres leçons. L’outil compte les blocs de réemploi comme des entrées ; aucune collision d’attribution n’est possible pour autant, 12C étant la seule à en porter                                                             |
| `repo-thai-scan.mjs 1 12`                 | **60 fichiers, 525 entrées, 353 graphies**, soit le même corpus de graphies qu’aux unités 1 à 11. C’est ce contrôle-là, et non `12 12`, qui établit qu’aucune graphie nouvelle n’entre                                                                                                                                                                                                                 |
| `lecture-corpus.mjs 1 11`                 | 94 vivantes toutes prédites, **0 écart** ; 38 mortes dont 36 mal prédites ; 16 + 11 + 1 hors domaine ; 191 polysyllabiques ; 1 non classé, ก็. **Total 353, contrôlé par le script lui-même**, qui sort en code 1 si la somme ne retombe pas                                                                                                                                                           |
| `lecture-corpus.mjs 1 11 --detail`        | contrôle séparé de la règle des mortes : **33 confirmés, 0 contredit, 3 longueurs non déclarées**                                                                                                                                                                                                                                                                                                      |
| `table-des-tons.mjs <xlsx>`               | réexécuté : **2 125 entrées et 9 divergences**, aux mêmes lignes que `u10-l10a`. Rien de neuf                                                                                                                                                                                                                                                                                                          |
| `item-fields-check.mjs` sur ce fichier    | **Premier passage** : 0 champ `codepoints` en faute, **2 écarts de réemploi**, 1 référence non suivie. **Après correction de la faute d’auteur** : 0 champ `codepoints` en faute, **1 écart de réemploi**, purement typographique et déclaré, et **1 référence non suivie**, `u01-l1a`, que le script ne sait pas indexer. Code de sortie 0 aux deux passages. Détail à la partie 6                    |
| `unicode-thai.mjs` sur ce fichier         | **NFC toutes conformes, aucun caractère en zone à usage privé.** 13 champs `thai`, **149** chaînes thaïes distinctes dans le fichier dont **136** hors des champs `thai`, relevé refait après les ajouts du contre-audit interne                                                                                                                                                                       |
| `unicode-stack-scan.mjs` sur ce fichier   | **profondeur maximale 2, sept graphies concernées** sur **149**, dont **cinq apparaissent sur un écran**. Liste des sept inchangée après les ajouts. Détail à la section Unicode                                                                                                                                                                                                                       |
| `item-fields-fr-check.mjs` sur ce fichier | **0 écart** sur les champs `fr`, `litteral` et `registre` ; la seule ligne rendue est le même « ขา absent de u01-l1a » que ci-dessus, pour la même raison d’outil                                                                                                                                                                                                                                      |
| `rid-lookup.mjs` et `rid-entry.mjs`       | **24 graphies interrogées, 24 attestées, 0 absence**. Trois lectures entre crochets ont changé le contenu du fichier, celles de เพลง, เปลี่ยน et ตลาด                                                                                                                                                                                                                                                  |
| `volubilis-lookup.mjs`                    | empreinte vérifiée AVANT citation, **27 graphies relevées, nombre de lignes cité pour chacune**. Aucun faux « absent » rencontré, aucune des graphies du jour n’étant une forme redoublée                                                                                                                                                                                                              |
| Balayage des promesses de niveau          | exécuté le 2026-08-04 sur les écrans seuls, insensible à la casse. `A1`, `A2`, `B1`, `CECR`, `heures`, `mois`, `semaines`, `équivalent` : **0 occurrence**. `niveau` : **2 occurrences, toutes deux dans une phrase qui REFUSE d’en donner un**, pages 1 et 14                                                                                                                                         |
| Balayage des formules interdites          | exécuté le 2026-08-04, mêmes motifs et même portée que `u11-l11a`, insensible à la casse : `une bouche française` 0, `un francophone` 0, `l’oreille française` 0, `francophone` 0                                                                                                                                                                                                                      |
| Calcul des planchers                      | exécuté par script sur les tables de tirages telles qu’elles sont écrites, résultats reportés exercice par exercice. **Deux partitions ont été recomptées à la main au contre-audit interne et corrigées**, celle des marques à l’exercice 3 et le plancher sans accent de l’exercice 5                                                                                                                |
| Extraction des graphies d’écran           | **ajoutée au contre-audit interne du 2026-08-04**, sur les sections `## Enseignement` et `## Exercices` : **106 sous-chaînes thaïes distinctes = 59 lettres et signes isolés + 7 chaînes qui ne sont pas des mots + 40 graphies**, ces 40 étant les 13 items, les 15 du tableau et les 12 citées une seule fois. **Zéro graphie hors inventaire.** Script jetable, non versionné, voir l’incertitude 9 |

**Ce que ces contrôles ont trouvé et qui n’était pas prévu.**

1. **Le relevé de coordination d’unité s’est périmé trois fois, et la dernière
   fois c’est ce fichier qui l’a périmé.** `unite-12/` était vide au premier
   constat, portait trois fichiers à la relecture, et en porte cinq au
   contre-audit. Surtout, `repo-thai-scan.mjs 12 12` compte désormais treize
   entrées, qui sont les treize blocs de réemploi de 12C : **la leçon fondait une
   preuve sur un relevé qu’elle invalidait en étant enregistrée.** Les deux
   phrases concernées sont retirées, et la preuve d’absence de graphie nouvelle
   est reportée sur `1 12`, qui ne dépend pas de l’existence du fichier. C’est la
   quatrième unité consécutive écrite en parallèle et en aveugle, et l’arbitrage 1
   de `u11-l11a` demandait explicitement que cela ne se reproduise pas.
2. **La méthode de lecture du parcours a un trou, et il n’avait été vu par
   personne.** La branche « ouverte à voyelle brève » manque à la page 5 de
   `u10-l10a`, et sept graphies publiées tombent dedans. Trouvé en écrivant la
   page 6, confirmé en exécutant `lecture-corpus.mjs`.
3. **La règle des mortes a maintenant sa seconde jambe**, ce que `u10-l10a`
   cherchait à son incertitude 1. Trouvé en ajoutant un compteur de contrôle au
   script, et non en cherchant une source.
4. **Deux notations divergentes de la même graphie dans le dépôt** : `u01-l1a` et
   `u01-l1d` écrivent l’`ipa` de ขา de deux façons, avec lettres tonales et avec
   diacritique. Trouvé en relisant les deux blocs pour choisir la référence de
   l’item 2.
5. **Deux descriptions divergentes de la position du ไม้เอก de เปลี่ยน**, celle
   de `u08-l8a` et celle de `u10-l10a`. Les deux visent le même empilement, mais
   un apprenant qui lit les deux leçons ne peut pas le savoir. Trouvé en écrivant
   la page 12.
6. **La colonne `ThaiPhon` de VOLUBILIS ne marque jamais la longueur du noyau
   `ø`.** Trouvé en cherchant pourquoi พ่อ, สอง et น้อง ne portaient pas de
   macron alors que leurs trois leçons publient une voyelle longue.
7. **Un champ que ce fichier déclarait reprendre sans modification avait été
   réécrit**, celui de `longueur` à l’item 13. Trouvé par
   `item-fields-check.mjs`, pas par l’auteur, et c’est exactement le défaut que
   ce script existe pour attraper. Corrigé, et l’explication est passée en note
   de sources. **C’est la seule faute de fidélité du fichier, et elle a été
   trouvée par un outil**, ce qui est un argument pour l’arbitrage 7 : les
   douze autres items ont été vérifiés mécaniquement, le treizième ne pouvait
   pas l’être.

### Incertitudes signalées par l’auteur

1. **La branche ajoutée à la page 6 corrige `u10-l10a` sans modifier son
   fichier, et les deux leçons se contredisent donc en l’état.** Un apprenant qui
   relit 10A après 12C lira deux définitions différentes de la syllabe morte.
   12C ne modifie pas le fichier d’une autre leçon ; la correction est demandée à
   l’arbitrage 1 et doit être exécutée avant que l’une ou l’autre passe en
   `review`. **C’est le point le plus urgent de ce dossier.**
2. **La longueur du noyau `aww` n’est corroborée que par en.wiktionary.**
   VOLUBILIS ne marque pas le macron sur `ø`, et les trois leçons d’origine de
   พ่อ, สอง et น้อง publient « longue » sans que ce dossier ait pu vérifier sur
   quoi elles s’appuyaient au delà de la même entrée Wiktionary. Le fait n’est
   pas douteux, mais sa double source est plus mince que le dossier ne le
   laisserait croire sans cette ligne. À porter au contre-audit externe.
3. **La forme phonémique ฮ่า donnée par en.wiktionary pour ห้า n’est pas
   expliquée.** Elle décrit comment le mot sonne, avec une initiale de classe
   basse et un ไม้เอก, alors que le parcours dérive le même ton descendant par
   « haute plus ไม้โท ». Les deux chemins arrivent au même endroit et 12C
   n’enseigne que le second, mais le dossier ne sait pas dire pourquoi
   en.wiktionary réécrit ainsi, et il ne l’invente pas. Aucun écran n’en parle.
4. **Le partage « marquée contre nue » des syllabes mortes repose sur deux
   mots.** ค่ะ et ล่ะ sont les deux seules mortes marquées du corpus, et le
   tableau des vivantes tombe juste sur les deux. C’est cohérent avec la façon
   dont une marque écrite fonctionne, mais deux observations ne fondent pas une
   règle, et aucun écran n’en tire quoi que ce soit. À rouvrir avec la mesure de
   masse demandée à l’arbitrage 2.
5. **Aucun audio n’est produit, et cette leçon en dépend d’une façon
   particulière : elle exige qu’il n’arrive PAS trop tôt.** Trois contraintes à
   consigner avant enregistrement. Un, **aucun mot ne doit être audible avant la
   réponse dans les cinq exercices** ; les planchers écrits deviennent faux
   sinon, et c’est bloquant. Deux, les paires de comparaison de la page 14, ป่า
   contre พ่อ et บ้าน contre น้อง, doivent venir de la MÊME voix, sans quoi la
   différence de ton se confond avec la différence de locuteur. Trois, les deux
   syllabes de ตลาด, citées à la page 12 comme contre-exemple de groupe, doivent
   être audibles comme deux temps distincts, faute de quoi la page ne démontre
   rien.
6. **La leçon mesure la lecture d’un mot, jamais celle d’une ligne.** Un
   apprenant peut réussir les cinq exercices et rester incapable de lire une
   enseigne de trois mots, parce que rien ici ne mesure le passage d’un mot au
   suivant ni la coupe en syllabes. `u12-l12e` fait le même constat à sa page 4,
   sur la taille des phrases. Signalé plutôt que résolu : c’est une question de
   conception du parcours.
7. **Le compartiment « plusieurs syllabes » est le plus gros du corpus, 191 sur
   353, et 12C n’en dit rien d’autre que son existence.** L’outil ne sait pas
   segmenter et le cours n’enseigne pas à segmenter. La page 13 l’écrit
   honnêtement, mais cela signifie que la mesure centrale de la leçon porte sur
   un peu plus du quart du vocabulaire publié. C’est le chiffre le plus
   inconfortable du dossier et il est écrit à l’écran plutôt qu’en note.
8. **Le script `lecture-corpus.mjs` est neuf et n’a été relu par personne.** Ses
   94 prédictions correctes sur 94 sont un indice fort qu’il applique bien la
   règle, puisqu’une erreur de parsing produirait des écarts plutôt que des
   accords. Ce n’est pas une preuve de correction. Le compartiment « non classé »
   et le contrôle de somme sont là pour rendre ses trous visibles, et le fichier
   `ก็` est le seul qu’il a trouvés. À attaquer en priorité au contre-audit.

9. **L’inventaire des graphies d’écran n’est vérifié par AUCUN script versionné,
   et il a échoué deux fois.** Le contre-audit interne a trouvé trois graphies
   affichées à l’apprenant, เจอ, เสีย et เสื้อ, absentes du tableau des
   réemplois, du décompte RID et de la liste Unicode, alors que ce fichier fait
   de la recomputabilité son argument central. La correction qu’il proposait, et
   qui semblait complète, en oubliait encore une, จาน, trouvée seulement en
   remplaçant la relecture par une extraction. **Quatre graphies sur quinze,
   plus du quart de l’inventaire, ont échappé au contrôle manuel, deux fois de
   suite.** Les champs d’item ont `item-fields-check.mjs`, les graphies du dépôt
   ont `repo-thai-scan.mjs`, les piles Unicode ont `unicode-stack-scan.mjs` ;
   **rien de versionné ne compare les graphies affichées sur un écran à
   l’inventaire déclaré**, et l’extraction faite ici est un script jetable, non
   versionné, dont la sortie est reproduite au dossier mais pas rejouable. À
   porter au contre-audit externe et, au delà, à la consolidation : c’est un
   outil qui manque, pas une relecture. **Tant qu’il n’existe pas, aucune leçon
   du parcours ne peut affirmer que son inventaire d’écrans est exhaustif**, et
   celle-ci ne l’affirme plus qu’au titre d’une extraction qu’un tiers devra
   refaire.
10. **Deux relevés de ce dossier dépendent encore de l’ordre d’écriture des
    leçons.** Le compte de cartes SRS, 286 au dépôt contre 282 affichés par
    `u12-l12e`, et le nombre de polysyllabiques, 191 ici contre 193 chez
    `u12-l12a`. Aucun des deux n’est faux au moment où il est relevé ; les deux
    peuvent l’être demain. Arbitrages 5 et 9.

**Dix incertitudes sont OUVERTES**, la 1 à la 4 et la 6 à la 10 ; la 5 est une
contrainte de production dont un point est bloquant. Deux touchent un fait
enseigné, la 1 et la 2, et la leçon les traite en déclarant sa réserve.

### État des audits

| Dimension                 | État                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe               | vérifiée, **24 graphies sur 24 attestées comme vedettes du RID** le 2026-08-04. **Cinq graphies affichées ne sont PAS dans ce décompte**, เจอ, เสีย, เสื้อ, จาน et ก็, ajoutées à l’inventaire au contre-audit interne : leur attestation reste celle de `u06-l6a`, `u08-l8a`, `u04-l4c` et `u11-l11c`, et aucune interrogation n’a été fabriquée                                                                                                                                                             |
| Sens                      | vérifié pour les 13 items, RID plus VOLUBILIS plus en.wiktionary. Aucun sens n’est enseigné par 12C : les champs `fr` sont repris de la leçon d’origine et aucune carte ne les demande                                                                                                                                                                                                                                                                                                                        |
| Prononciation, ton        | vérifié, 13 items sur 13 sur deux sources indépendantes au moins, plus la mesure de masse de la partie 2 et la mesure de corpus de la partie 1                                                                                                                                                                                                                                                                                                                                                                |
| Longueur                  | vérifiée pour 12 items sur 13 ; เปลี่ยน porte `NON ÉTABLIE`, valeur reprise sans être comblée. **Une réserve de notation est ouverte et déclarée**, celle du noyau `ø` de VOLUBILIS, incertitude 2                                                                                                                                                                                                                                                                                                            |
| Registre                  | vérifié pour les 13 : tous neutres, valeurs reprises des leçons d’origine. Aucun fait de registre n’est enseigné                                                                                                                                                                                                                                                                                                                                                                                              |
| Métalangue                | six termes traités sous la section 1 ter : อักษรกลาง, อักษรสูง, อักษรต่ำ, คำเป็น, คำตาย et ไตรยางศ์. RID autorité définitionnelle, usage concordant VOLUBILIS pour les six, annexe en.wiktionary pour les trois classes. **Dépendance déclarée là où elle existe**, les deux lignes de ไตรยางศ์ portant `RID`                                                                                                                                                                                                 |
| Naturalité                | **hors périmètre**, et c’est la première fois du parcours qu’un dossier peut l’écrire : 12C ne publie aucune formule, aucun assemblage et aucun emploi. Les 13 items sont des réemplois dont la naturalité a été traitée par leur leçon d’origine                                                                                                                                                                                                                                                             |
| Réemploi                  | **vérifiable par script**, les treize items portant leur référence `uXX-lYz` au titre. C’est la correction du défaut dénoncé par l’arbitrage 10 de `u11-l11a`                                                                                                                                                                                                                                                                                                                                                 |
| Nouveauté des items       | **aucune**, et c’est l’objet : les 13 graphies sont publiées par les unités 1 à 11, contrôle par `repo-thai-scan.mjs 1 11 --grep`. **L’inventaire des ÉCRANS, lui, était incomplet** : 4 graphies sur 15 manquaient au tableau des réemplois, trouvées au contre-audit interne, publiées elles aussi. Inventaire désormais produit par extraction mécanique des deux sections d’écran, 106 sous-chaînes. Preuve d’ensemble reportée sur `repo-thai-scan.mjs 1 12`, qui rend les mêmes 353 graphies que `1 11` |
| Unicode                   | vérifié, séquences NFC stables, **empilement maximal 2 sur deux graphies**, สี่ et เปลี่ยน, contrainte de rendu écrite                                                                                                                                                                                                                                                                                                                                                                                        |
| Portée de la méthode      | **MESURÉE**, et c’est le fait central : 94 sur 94 dans le domaine, 36 erreurs sur 38 hors domaine, 353 graphies ventilées, total contrôlé par le script                                                                                                                                                                                                                                                                                                                                                       |
| Planchers d’exercice      | **mesurés et écrits pour les cinq exercices**, y compris les heuristiques non triviales : « première lettre », « toute ouverte est vivante », « la marque seule », « la classe seule », et deux appariements partiels                                                                                                                                                                                                                                                                                         |
| Promesses de niveau       | **balayage exécuté**, 0 occurrence de tout motif de niveau, de durée ou d’équivalence ; les occurrences de « niveau » nient en donner un. **Le balayage par motifs ne suffisait pas** : le contre-audit interne a trouvé une promesse de résultat que ces motifs ne pouvaient pas voir, page 1, « combien VOUS pouvez lire entièrement », démentie par la page 13. Les deux pages sont réécrites sur la méthode et non sur l’apprenant                                                                        |
| Phonétique française      | **hors périmètre**, aucune assertion sur la bouche ou l’oreille française n’est faite ; balayage à 0 sur les quatre motifs                                                                                                                                                                                                                                                                                                                                                                                    |
| Licence                   | aucun texte de définition recopié, aucune formulation reprise. Le seul contenu du RID restitué à l’écran est l’énumération des lettres des trois classes et le nom du système, au titre de la section 1 ter                                                                                                                                                                                                                                                                                                   |
| Cohérence avec `u10-l10a` | **EN DÉFAUT, et c’est déclaré** : la page 6 de 12C et la page 5 de `u10-l10a` donnent deux définitions différentes de la syllabe morte. 12C a raison sur pièces et ne corrige pas le fichier de l’autre. Incertitude 1, arbitrage 1                                                                                                                                                                                                                                                                           |
| Cohérence avec l’unité 12 | **EN DÉFAUT sur un nombre, et c’est déclaré** : 193 polysyllabiques chez `u12-l12a`, 191 ici, même mesure et même script. Arbitrage 9. Les citations faites de `u12-l12a` et `u12-l12e` ont été refaites contre l’état du dépôt du 2026-08-04                                                                                                                                                                                                                                                                 |
| Fil des tons              | **ÉCART SIGNALÉ.** Les deux contrastes sont travaillés à l’ŒIL, jamais à l’oreille : aucun audio avant réponse, aucun exercice `listening`, et aucun écran ne rejoue les paires หมา/ม้า et ปา/ป่า, recherche à 0 occurrence dans `## Enseignement`. Le mot « rejoué » a été retiré de la Méta. Arbitrage 3                                                                                                                                                                                                    |
| Contre-audit interne      | **PASSÉ le 2026-08-04.** 12 findings, dont 4 bloquants, tous traités : détail à la section suivante                                                                                                                                                                                                                                                                                                                                                                                                           |
| Contre-audit externe      | **NON LANCÉ.** Lot à préparer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Revue native              | EN ATTENTE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

### Contre-audit interne, passé le 2026-08-04

Auditeur adversarial indépendant, consigne « trouver des erreurs, pas confirmer »,
sans accès réseau : le RID, VOLUBILIS et en.wiktionary n’ont pas pu être
réinterrogés, et rien qui en dépende n’a été confirmé par ce passage. Relevé
complet dans `content/authoring/unite-12/verification-12c.md`. **29 faits ont été
recomputés et tiennent**, dont les dix cases du tableau de la partie 1, les douze
décodages des pages 8 à 12, les 24 transcriptions `thainaute-fr` v1.1 et le
balayage des tirets cadratins, à 0. **Douze findings ont été rendus, quatre
bloquants**, et voici ce que chacun est devenu. Les corrections proposées par
l’audit ont toutes été revérifiées avant d’être appliquées.

1. **F1, bloquant, dix lettres déclarées apprises et jamais enseignées.
   CORRIGÉ.** Vérifié ici : `u04-l4a` enseigne neuf hautes et nomme ฃ et ฐ comme
   absentes, `u05-l5a` neuf basses, `u06-l6a` sept de plus et nomme ฅ ฆ ฌ ญ ฑ ฒ ณ
   ฬ comme non enseignées ; aucune leçon de 1 à 11 ne les introduit ensuite comme
   initiales, recherche du motif d’enseignement de lettre à 0 occurrence pour les
   dix. La page 3 garde les trois listes du dictionnaire, mais dit désormais que
   le cours en a enseigné trente-quatre, nomme les dix autres, et précise
   qu’aucun exercice ne porte sur elles. Les prérequis de la Méta sont corrigés.
2. **F3, bloquant, promesse de résultat en page 1. SUPPRIMÉE.** La page 1
   promettait « combien VOUS pouvez lire entièrement », ce que la page 13 refuse
   explicitement de dire. Les deux pages parlent maintenant de ce que la MÉTHODE
   lit, et la page 1 renvoie explicitement la mesure de l’apprenant aux cinq
   exercices.
3. **F2, bloquant, superlatif flatteur. SUPPRIMÉ.** « Le mot le plus difficile à
   lire du parcours, et vous venez de le lire » n’était adossé à aucune mesure du
   dossier, contredit par la même page 12 sur ตลาด, et élargi sans justification
   par rapport à `u08-l8a`, qui écrit « de la leçon » et non « du parcours »,
   relu ici. Remplacé par un décompte de complications, vérifiable sur le mot.
4. **F4, bloquant, graphies d’écran hors inventaire. CORRIGÉ, et le finding
   était lui-même incomplet.** L’audit en signalait trois, เจอ, เสีย et เสื้อ, et
   proposait de porter le décompte à quatorze. La correction a été vérifiée avant
   d’être appliquée, par extraction mécanique des sous-chaînes thaïes des
   sections `## Enseignement` et `## Exercices` : **une quatrième graphie
   manquait, จาน, spécimen de la page 1**, et une cinquième, ก็, entrait par la
   correction de F11. Le décompte juste est **quinze**, il est désormais produit
   par extraction et non par relecture, et le tableau, la liste Unicode et la
   partie 6 sont refaits en conséquence. Le décompte RID reste à 24 avec une
   ligne qui déclare que ces cinq graphies n’ont pas été interrogées :
   **aucune attestation n’a été fabriquée pour arrondir le chiffre.**
5. **F5, non bloquant, เจ็บ attribuée à `u08-l8c`. CORRIGÉ.** Recherche faite
   dans `lecon-8c.md` : zéro occurrence. La graphie est publiée par `u09-l9a`
   item 1, ton bas, transcription `jèp`, lu sur pièces. Point voisin traité en
   même temps : le fait « le ◌็ raccourcit la voyelle » est désormais rattaché à
   `u03-l3b`, qui l’enseigne et le double-source, et cette leçon entre aux
   prérequis. Une erreur d’ordre voisine a été corrigée dans la foulée, เก๊ et
   ตั๋ว étant les items 6 et 5 de `u08-l8a` et non 5 et 6.
6. **F6, non bloquant, familles de fin mal attribuées. CORRIGÉ.** `u09-l9a`
   intitule sa propre partie « Les familles de fin » et donne les huit มาตรา,
   relu ici ; `u05-l5a` ouvre les fermetures du côté du son. Les prérequis
   créditent maintenant `u09-l9a` des familles de fin, et `u05-l5a` de ce
   qu’elle apporte réellement, les neuf premières consonnes basses et le critère
   de CONTACT.
7. **F7, non bloquant, ไม่ rangé parmi les tirages sans marque. CORRIGÉ.**
   Recompté à la main sur la table de tirages : six sans marque, quatre en ◌่
   dont ไม่, quatre en ◌้. Le détail publié devient « rien 3 sur 6, ◌่ 2 sur 4,
   ◌้ 2 sur 4 » ; le total de 7 sur 14 et le verdict de l’exercice sont
   inchangés. La stratégie symétrique « classe seule » a été recomptée elle
   aussi et tombe juste, 1/3, 3/5, 2/6, somme 14.
8. **F8, non bloquant, « le parcours ne publie que ces deux mots ». CORRIGÉ.**
   `repo-thai-scan.mjs 1 11 --grep ๋` rend deux graphies, ตั๋ว et กระเป๋า, toutes
   deux de `u08-l8a`, le ◌๋ de la seconde étant posé sur ป, moyenne, lu sur
   pièces. La page 7 nomme maintenant กระเป๋า et écrit le motif qui l’écarte,
   deux syllabes et une syllabe marquée en เ◌า.
9. **F9, non bloquant, plancher de l’exercice 5 contradictoire. CORRIGÉ.** La
   phrase affirmait 0 sur 8 tout en décrivant l’exception `maa` dans la même
   phrase. La valeur publiée est 1 sur 8, identique à celle d’une réponse
   constante ; le seuil étant de 6 sur 8, le verdict ne change pas.
10. **F10, non bloquant, relevés de coordination périmés. CORRIGÉS.**
    `repo-thai-scan.mjs 12 12` rend 5 fichiers, 13 entrées et 13 graphies, les
    treize venant de ce fichier : les deux phrases « l’unité 12 ne publie aucun
    item » et « 12C ne publie rien non plus » sont retirées, et la preuve
    d’absence de graphie nouvelle est reportée sur `1 12`, réexécuté, 60
    fichiers, 525 entrées, **353 graphies**. Trois citations périmées sont
    refaites contre le dépôt : `u12-l12e` écrit « 60 leçons » et non 55, annonce
    282 cartes et non 271, et `u12-l12d` vise 20 minutes, ce qui retire à 12C le
    titre de leçon la plus longue de l’unité.
11. **F11, non bloquant, concordance annoncée avec `u12-l12a`. RETIRÉE.** La
    phrase que 12C citait comme actuelle est déclarée antérieure par le dossier
    de 12A, et les deux écrans publient 193 contre 191 pour la même mesure.
    L’affirmation « les deux concordent » est supprimée, la divergence est
    exposée en Méta et portée à l’**arbitrage 9**. Corollaire traité en même
    temps : la page 13 sommait à 351 sur 353 et nomme désormais les deux
    graphies résiduelles.
12. **F12, non bloquant, « Repère rejoué » deux fois. RETIRÉ.** ม้า et ปา
    n’apparaissent pas une seule fois dans la section `## Enseignement`,
    recherche faite, zéro occurrence. La Méta dit maintenant que les deux
    contrastes sont travaillés à l’œil et non à l’oreille, et l’écart à la
    section « Fil des tons » de `CONVENTIONS.md` est signalé à l’arbitrage 3
    plutôt que masqué.

**Ce que ce passage n’a PAS pu faire**, et qui reste entier pour le contre-audit
externe : les 27 relevés VOLUBILIS et l’empreinte du classeur, absent du dépôt ;
les 24 interrogations RID, dont les trois lectures entre crochets qui fondent la
page 12 ; les quatorze entrées en.wiktionary, l’annexe, et le 404 annoncé pour
ไตรยางศ์ ; les trois empreintes Unicode ; et la réexécution de
`table-des-tons.mjs`, qui dépend du classeur. **Rien de tout cela n’est confirmé
par le contre-audit interne, et rien n’a été présenté comme s’il l’était.**

### Ce que le contre-audit doit attaquer en priorité

1. **`lecture-corpus.mjs` lui-même**, incertitude 8. Rejouer son classement à la
   main sur un échantillon des 353 graphies, en particulier les syllabes ouvertes
   et les mots à deux consonnes initiales, et vérifier que les compartiments
   « hors domaine » ne cachent pas des mots que la méthode saurait lire.
2. **La branche ajoutée à la page 6**, en cherchant activement une source qui la
   contredirait, et en vérifiant que les sept graphies du tableau de la partie 3
   sont bien toutes ouvertes et brèves.
3. **Les planchers des exercices 1 et 2**, qui sont les deux plus proches de leur
   seuil : 8 sur 12 contre 10 pour le premier, 11 sur 14 contre 12 pour le
   second. Vérifier en particulier qu’aucune heuristique non listée ne fait mieux.
4. **La décision de ne PAS enseigner la règle des mortes**, partie 4, en pesant
   l’argument inverse : un apprenant qui s’arrête devant 38 graphies de son
   propre vocabulaire est-il mieux servi qu’un apprenant à qui l’on donne une
   règle à quatre branches en fin de parcours.
5. **Les six termes de métalangue**, en vérifiant que la section 1 ter est
   correctement appliquée et que la dépendance VOLUBILIS-RID est déclarée partout
   où elle existe.
6. **Le balayage des promesses de niveau**, en cherchant une formulation qui
   promettrait un niveau sans employer aucun des motifs balayés.
7. **Les treize `note_fr`**, qui portent chacune un décodage complet : vérifier
   les quatre questions une par une sur chaque mot, et notamment que ห้า, สอง et
   เปลี่ยน sont décrits exactement comme la page correspondante les décrit.
8. **L’inventaire des graphies d’écran, une seconde fois et par un autre
   chemin**, incertitude 9. Le contre-audit interne en a trouvé trois qui
   manquaient ; rien ne garantit qu’il les ait toutes trouvées. Extraire
   mécaniquement toutes les sous-chaînes thaïes de la section `## Enseignement`
   et de la section `## Exercices`, et les confronter une par une au tableau des
   réemplois, au décompte RID et à la liste Unicode.

### Arbitrages à porter hors de cette leçon

Une leçon ne modifie ni `content/authoring/CONVENTIONS.md`, ni
`docs/content-policy/sources-verification.md`, ni les cartes SRS d’une autre
leçon, ni le fichier d’une autre leçon. Ces points sont donc SIGNALÉS.

1. **La page 5 de `u10-l10a` doit être corrigée, et c’est bloquant pour les deux
   leçons.** Elle définit la syllabe morte par la seule fermeture sur `k`, `t` ou
   `p`, et laisse sept graphies publiées sans réponse. La définition normative,
   l’usage concordant de VOLUBILIS et la mesure du corpus concordent tous les
   trois : il manque « ouverte à voyelle brève ». **Arbitrage demandé** : corriger
   la page 5 de `u10-l10a` et son exercice 3 si celui-ci en dépend, avant que
   l’unité 10 ou l’unité 12 passe en `review`. Tant que ce n’est pas fait, deux
   leçons du même parcours enseignent deux frontières différentes.
2. **La règle de ton des syllabes mortes a maintenant deux jambes, et le
   parcours doit décider s’il l’enseigne.** Elle est écrite dans les trois
   entrées de classe du RID et confirmée 33 fois sur 33 par le corpus publié,
   zéro contre-exemple. **Arbitrage demandé** : soit étendre `table-des-tons.mjs`
   aux syllabes mortes avec un critère de longueur explicite, ce que l’incertitude
   1 de `u10-l10a` demandait déjà, puis décider en connaissance de cause ; soit
   acter que le parcours s’arrête là et que ces 38 graphies restent des mots
   qu’on sait dire sans savoir les lire. **Ne pas trancher revient à trancher pour
   la seconde option sans le dire.**
3. **Les apports aux deux cartes d’entretien des tons ne sont toujours pas
   exécutés, et ils couvrent maintenant quatre unités.** Recherche des deux
   identifiants dans `content/authoring/` le 2026-08-04 : les unités 9, 10, 11 et
   12 déclarent chacune des apports à `srs-u04-l4a-06`, à `srs-u07-l7a-03` ou aux
   deux, et **ni `u04-l4a` ni `u07-l7a` ne porte le moindre tirage rapporté**.
   `u12-l12e` écrit d’ailleurs à sa page 5, à l’écran et à destination de
   l’apprenant, que cet entretien « est écrit mais pas encore branché ».
   **Arbitrage demandé** : exécuter toutes les demandes ensemble à la
   consolidation, ou décider que ces deux cartes ne prennent plus d’apport et
   créer une carte d’entretien par unité. C’est la quatrième unité consécutive
   qui le demande, et c’est désormais visible par l’apprenant.
   **Point ajouté au contre-audit interne, et il concerne 12C directement.** La
   Méta de ce fichier déclarait « Repère rejoué » pour หมา contre ม้า et pour ปา
   contre ป่า. Recherche faite dans la section `## Enseignement` le 2026-08-04 :
   **ม้า et ปา n’apparaissent sur aucun des quatorze écrans**, zéro occurrence.
   Le mot « rejoué » a été retiré et la Méta dit maintenant que les deux
   contrastes sont travaillés à l’œil et non à l’oreille. Il en résulte un écart
   assumé à la section « Fil des tons » de `CONVENTIONS.md`, qui demande qu’une
   leçon ayant besoin d’un contraste le fasse pratiquer : 12C ne le fait pas,
   parce qu’aucun mot n’y est audible avant la réponse. **Arbitrage demandé, en
   plus du précédent** : décider si une leçon de lecture silencieuse est
   dispensée de cette clause, ou si l’entretien doit passer par les cartes, ce
   qui suppose que les demandes ci-dessus soient enfin exécutées.
4. **Deux divergences de description dans le dépôt, sur des faits que 12C doit
   citer.** Premièrement, `u01-l1a` écrit l’`ipa` de ขา `/kʰaː˩˩˦/` et `u01-l1d`
   `/kʰǎː/` ; les deux notent le ton montant, mais les deux notations coexistent
   dans le parcours et `item-fields-check.mjs` les rend comme un écart.
   Deuxièmement, `u08-l8a` place le ไม้เอก de เปลี่ยน « sur la voyelle qui suit »
   et `u10-l10a` « au-dessus du ล » ; les deux visent le même empilement.
   **Arbitrage demandé** : uniformiser la notation IPA du parcours sur les
   lettres tonales, et fixer une formulation unique pour la position d’une marque
   empilée. Les deux sont des corrections de consolidation, pas de leçon.
5. **Le décompte de cartes de `u12-l12e` a bougé pendant la rédaction, et
   l’arbitrage est réécrit contre l’état réel du dépôt.** La version antérieure
   de ce point attaquait un « 271 » que 12E n’affiche plus : relue le
   2026-08-04, sa page 7 annonce **282 cartes de révision** et son dossier
   explique son propre recomptage. Relevé fait ici le même jour, par recherche
   des identifiants de la forme `srs-uXX-lYz-NN` dans les fichiers `lecon-*.md`
   de `content/authoring/` : **286 identifiants distincts au total, 280 hors
   `lecon-12b.md` et `lecon-12c.md`**. L’écart de 4 entre le 282 affiché par 12E
   et les 286 du dépôt vient de la rédaction parallèle, 12B et 12C ayant été
   enregistrées après le relevé de 12E.
   **Arbitrage demandé** : recompter à la consolidation, corriger le chiffre
   affiché à l’écran de `u12-l12e`, et fixer la convention de comptage. Un
   chiffre affiché à l’apprenant ne doit pas dépendre de l’ordre dans lequel les
   leçons ont été écrites, et il vient de le faire deux fois.
6. **Un nouvel outil a été versionné par cette leçon, et il faut le savoir.**
   `scripts/verification/lecture-corpus.mjs` est ajouté au dépôt le 2026-08-04,
   parce que le chiffre central de la page 13 doit être recomputable et qu’aucun
   outil ne le produisait. Il ne modifie aucun autre script et reprend la
   convention d’entrée de `repo-thai-scan.mjs` sans la changer.
   **Arbitrage demandé** : l’arbitrage 5 de `u10-l10a` posait déjà la question de
   savoir si un fichier de leçon a le droit d’ajouter un outil de vérification.
   Elle n’a pas été tranchée, et une deuxième leçon vient de le faire. Trancher.
7. **`item-fields-check.mjs` ne sait pas lire les items des leçons 1A et 1B.**
   Ces deux fichiers écrivent leurs champs sans guillemets obliques,
   `- thai : ขา`, forme que `repo-thai-scan.mjs` reconnaît explicitement et que
   `item-fields-check.mjs` ignore. Toute leçon qui réemploie une graphie publiée
   par l’unité 1 obtient donc « graphie absente », ce qui ressemble à une faute
   et n’en est pas une. 12C est dans ce cas pour un item sur treize.
   **Arbitrage demandé** : soit accepter les deux formes dans
   `item-fields-check.mjs`, ce qui est une ligne de son expression régulière ;
   soit migrer les items de `u01-l1a` et `u01-l1b` vers la forme à guillemets à
   la consolidation. En l’état, le contrôle rend un faux positif qui
   apprendra à être ignoré, ce qui est le pire des deux mondes.
8. **La quatrième unité consécutive a été écrite en parallèle et en aveugle.**
   L’unité 12 n’a produit aucune collision d’attribution, mais uniquement parce
   qu’aucune de ses leçons ne publie d’item. Le mécanisme, lui, est intact, et il
   a produit ici un écart de décompte visible par l’apprenant, celui de
   l’arbitrage 5. **Arbitrage demandé** : le même que celui de `u11-l11a`, à
   savoir sérialiser la rédaction d’une unité, ou attribuer les graphies avant
   d’écrire, ou acter que la consolidation arbitre systématiquement et prévoir le
   temps correspondant. **Le parcours est terminé et la question n’a jamais été
   tranchée.**
9. **Deux écrans de l’unité 12 publient deux nombres pour la même mesure.** La
   page 12 de `u12-l12a`, relue le 2026-08-04, écrit « 193 comptent plus d’une
   syllabe » ; la page 13 de 12C écrit 191. `lecture-corpus.mjs 1 11`, exécuté le
   même jour, rend **191 polysyllabiques, plus 1 « pas une graphie simple » et 1
   « non classé »**, total 353 des deux façons. 12A absorbe ces deux graphies
   dans son 193, 12C les nomme à part pour que la somme retombe sur 353 sans
   qu’aucune entrée disparaisse. **Les deux choix se défendent et aucun n’est
   faux** ; ce qui n’est pas défendable, c’est que l’apprenant lise deux nombres.
   **Arbitrage demandé** : fixer à la consolidation la convention d’affichage des
   deux graphies résiduelles, puis aligner les deux écrans sur le même nombre.
   12C ne modifie pas le fichier de `u12-l12a`.

- Lot de contre-audit externe : à préparer dans
  `content/authoring/unite-12/contre-audit-gpt56.md`, en portant en tête
  l’incertitude 1 et l’arbitrage 1, qui bloquent deux unités, puis
  `lecture-corpus.mjs` lui-même, puis les planchers des exercices 1 et 2.
- Statut : `draft`. **Revue native : en attente.** **Contre-audit interne passé
  le 2026-08-04**, douze findings traités, dont les quatre bloquants.
  **Aucun passage à `review`** avant contre-audit externe, exécution de
  l’arbitrage 1, résolution de la contrainte audio bloquante de l’incertitude 5,
  et arbitrage des divergences de décompte 5 et 9 avec `u12-l12a` et `u12-l12e`.
