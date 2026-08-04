# Vérification adversariale de `lecon-8d.md`

- Fichier audité : `content/authoring/unite-08/lecon-8d.md`
- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial, consigne « trouver des erreurs, pas confirmer »
- Cadre : `content/authoring/CONVENTIONS.md` amendement v1.2 ;
  `docs/content-policy/sources-verification.md` section 1 bis
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Chaque
  relevé a été refait ici, en direct, avec l'outillage versionné du dépôt et
  les exemplaires de fichiers dont l'empreinte est recalculée ci-dessous.

## 0. Portée réelle des deux priorités de la commande d'audit

La commande demandait de traiter en priorité « les deux marques de ton
restantes » pour 8A et le mot ถูก pour 8C. Ni l'une ni l'autre ne s'applique
au fichier audité, mesure faite :

- `content/authoring/unite-08/lecon-8a.md` **n'existe pas** au 2026-08-04. Le
  répertoire contient `lecon-8b.md`, `lecon-8c.md` et `lecon-8d.md`.
- 8D ne demande la lecture d'aucune marque de ton et ne construit aucune case
  de tableau. Les marques ๊ et ๋ n'apparaissent qu'une fois, dans une note de
  coordination du dossier de production qui les renvoie explicitement à 8A.
- ถูก apparaît **zéro fois** dans 8D. C'est un mot de 8C.

L'audit a donc porté sur ce que 8D affirme réellement : huit items, quatre
exercices, un dialogue, quatre cartes SRS, une note culturelle et un dossier
de production.

## 1. Ce qui a été vérifié et confirmé, catégorie par catégorie

Décompte total des faits re-vérifiés et confirmés par l'auditeur : **112**.

### A. Encodage et graphie, 15 faits

Les quinze graphies de la leçon ont été relevées point de code par point de
code. Les séquences écrites dans les champs `codepoints` sont exactes dans les
quinze cas, et la chaîne, sa forme NFC et sa forme NFD sont identiques
partout, ce qui confirme la déclaration de stabilité du dossier.

ขอโทษครับ, ขอโทษค่ะ, ไม่ใช่, อันนี้ไม่ใช่ครับ, อันนี้ไม่ใช่ค่ะ, ปัญหา,
มีปัญหาครับ, มีปัญหาค่ะ, เปลี่ยน, ขอเปลี่ยนหน่อยครับ, ขอเปลี่ยนหน่อยค่ะ, เสีย,
อันนี้เสียครับ, มีปัญหาอะไรคะ, ไม่เป็นไรครับ.

### B. Tons et longueurs par syllabe, 16 faits

Les champs `ton` et `longueur` des huit items sont justes, recalculés à partir
de la classe de l'initiale et de la nature de la syllabe, puis recoupés avec
la colonne ThaiPhon de VOLUBILIS et l'IPA de Wiktionary.

Le point qui méritait le plus de méfiance a été contrôlé séparément :
**หน่อย est bien BREF**, contrairement à ce que la graphie -อย laisse attendre
à un lecteur pressé. La forme phonémique de en.wiktionary est `หฺน็่อย`, avec
ไม้ไต่คู้, et l'IPA rendue est /nɔj˨˩/. La mention « nàwi brève » de l'item 7
est donc correcte, et cohérente avec 2C, 3E et 4C.

### C. IPA, 8 faits

Les huit transcriptions API concordent avec en.wiktionary et th.wiktionary
là où ces pages existent : /maj˥˩.t͡ɕʰaj˥˩/, /pan˧.haː˩˩˦/, /plia̯n˨˩/,
/sia̯˩˩˦/, et les assemblages qui en dérivent.

### D. Royal Institute Dictionary 2554, 13 faits

Neuf relevés de présence par `node scripts/verification/rid-lookup.mjs`, une
requête par graphie :

| Graphie | Statut relevé |
| ------- | ------------- |
| ใช่     | entree        |
| ปัญหา   | entree        |
| เปลี่ยน | entree        |
| เสีย    | entree        |
| ช่วย    | entree        |
| ผิด     | entree        |
| ไม่ใช่  | absent        |
| มีปัญหา | absent        |
| อันนี้  | absent        |

Le décompte du dossier, « 9 graphies distinctes, 6 attestées et 3 absentes »,
est donc exact.

Quatre contenus d'entrée ont été rapatriés pour contrôler les affirmations de
sens, par requête POST unique sur `func_lookup.php`, faits cités par référence
et définitions non reproduites :

- ปัญหา : vedette unique, catégorie น., trois gloses successives, chacune
  illustrée par un exemple du dictionnaire, le premier contenant bien la
  chaîne du jour sous forme niée ; un seul ลูกคำ, ปัญหาโลกแตก. Conforme.
- เปลี่ยน : vedette unique, catégorie ก., découpe entre crochets avec le
  พินทุ sous la première consonne, second sens de déplacement non enseigné,
  **six** ลูกคำ. Conforme.
- เสีย : vedette « เสีย ๑ », **quatorze** sens numérotés ; (๓) et (๔) sont bien
  ceux que la leçon enseigne, avec les exemples annoncés ; (๖) couvre bien
  l'aliment. Conforme. Une vedette « เสีย ๒ » distincte existe, particule, ce
  que la leçon ne cite pas mais ne contredit pas.
- ใช่ : vedette unique, catégorie ว., deux sens, et le second écrit
  effectivement ไม่ใช่ dans sa propre glose. Conforme.

### E. VOLUBILIS Database v26.2, 28 faits

Exemplaire employé, empreinte recalculée le 2026-08-04 :
`VOLUBILIS_Database.xlsx`, 10 848 409 octets, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`. Le script
versionné rapporte 586 541 chaînes partagées et **114 579 lignes non vides**.
Les trois valeurs correspondent exactement à ce que le dossier annonce.

Les vingt-deux lignes citées ont été rouvertes une par une. Toutes existent,
toutes portent le contenu décrit, y compris les colonnes de type, de domaine,
de découpe et d'étymologie : 1579, 9530, 9531, 9532, 9544, 35102, 36067,
36382, 36432, 36689, 36694, 36753, 36710, 36711, 36712, 51707, 51708, 53870,
55745, 55746, 55747, 66110, 71719 à 71723, 76838, 91869 à 91878.

Quatre recherches négatives refaites, toutes confirmées à zéro occurrence sur
la colonne thaïe : ขอเปลี่ยน, เปลี่ยนหน่อย, ช่วยหน่อย, เปลี่ยนได้ไหม. La
déclaration d'INSTANCE de l'item 7 est donc honnête, et vérifiable.

La contre-observation de la ligne 36694, qui remplit la case du patron par un
NOM et non par un verbe, existe bien et est correctement décrite. C'est un
point à porter au crédit du dossier : il cite une ligne qui affaiblit son
propre argument.

### F. Wiktionary, 11 faits

Six requêtes sur en.wiktionary et cinq sur th.wiktionary, en rendu.

- en : ไม่ใช่, ใช่, ปัญหา, เปลี่ยน, เสีย répondent 200 ; มีปัญหา répond **404**.
- th : ใช่, ปัญหา, เปลี่ยน, เสีย répondent 200 ; ไม่ใช่ et มีปัญหา répondent
  **404**.

Les trois 404 consignés par le dossier sont donc exacts, et la description des
pages qui répondent est fidèle sur la prononciation, la romanisation, la
découpe syllabique et l'absence d'étiquette de registre. La liste de termes
dérivés de ใช่ contient bien ไม่ใช่, ainsi que ใช่ไหม et ใช่ว่า, que la Méta
déclare hors périmètre.

Une exception, traitée en finding F-10 ci-dessous : le nombre de sens verbaux
de en.wiktionary « เปลี่ยน ».

### G. Unicode 17.0, 6 faits

Lignes relues dans les fichiers de la version 17.0, en-tête
`IndicPositionalCategory-17.0.0.txt`, `Date: 2025-07-29, 13:35:52 GMT` :

- `0E0D;THAI CHARACTER YO YING;Lo` : conforme.
- `0E43;THAI CHARACTER SARA AI MAIMUAN;Lo`, ancien nom
  `THAI VOWEL SIGN SARA MAI MUAN` : conforme, y compris l'ancien nom, qui ne
  porte effectivement pas « AI ».
- `0E40..0E44 ; Visual_Order_Left # Lo [5]` : conforme, U+0E43 est bien dans la
  plage.
- `0E47..0E4E ; Top # Mn [8]` : conforme.

### H. FrequencyWords, 11 faits

Exemplaire `th_50k.txt`, 1 504 712 octets, SHA-256
`20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`, 50 000
lignes. Les dix rangs cités sont exacts au jeton près : ใช่ 2, ไม่ใช่ 91,
ขอโทษ 103, หน่อย 777, เปลี่ยน 1 155, ขอ 1 457, อันนี้ 2 932, ปัญหา 3 676,
มีปัญหา 7 061, เสีย 16 013.

Complément que l'incertitude 5 déclarait non mesuré, mesuré ici : เสียใจ est au
rang 1 573 (247 occurrences) et เสียชีวิต au rang 7 038 (55 occurrences) dans le
même exemplaire. L'explication proposée par le dossier est donc plausible, et
elle est désormais chiffrée.

### I. Renvois internes au dépôt, 14 faits exacts

Vérifiés dans les fichiers : 2C items 1, 3, 4, 5, 7 et 8 ; 4C items 6 et 7 ;
1E items 2 et 3 ; 3C item 5 ; 4D item 1 ; 5B item 3 ; 6B item 7 ; 6D items 1
et 3 ; 2E item 1 ; 7A page 10 ; les transcriptions héritées `mâi·pen·rai`,
`khàwwp·khoun khráp`, `mâi mii` avec espace, `líao` et `nàwi`.

Deux renvois sont faux, voir F-12.

## 2. Findings

Douze findings. Onze sont bloquants.

### F-01 (BLOQUANT) L'exercice 3 ne mesure pas l'accord locuteur / particule, et son plancher de stratégie décrit une stratégie impossible

L'exercice annonce mesurer « l'accord entre le locuteur annoncé et la
particule », et son plancher de stratégie affirme qu'« un apprenant qui ne lit
pas le locuteur annoncé et met toujours ครับ échoue aux tirages 2, 4 et 5,
soit 2 sur 5 ».

Or les tuiles de chaque tirage ne contiennent QUE la particule correcte :

| Tirage | Locuteur | Tuiles                      | Particules disponibles |
| ------ | -------- | --------------------------- | ---------------------- |
| 1      | homme    | ปัญหา / ครับ / มี           | ครับ seule             |
| 2      | femme    | ไม่ใช่ / ค่ะ / อันนี้       | ค่ะ seule              |
| 3      | homme    | หน่อย / ขอ / ครับ / เปลี่ยน | ครับ seule             |
| 4      | femme    | เปลี่ยน / ค่ะ / หน่อย / ขอ  | ค่ะ seule              |
| 5      | femme    | เสีย / อันนี้ / ค่ะ         | ค่ะ seule              |

Un apprenant qui ignore totalement que ครับ est masculin et ค่ะ féminin
obtient 5 sur 5 sur cette dimension. La stratégie « met toujours ครับ » n'est
pas exécutable, faute de tuile ครับ aux tirages 2, 4 et 5. Le piège annoncé
« associer ผม à ค่ะ ou ดิฉัน à ครับ » ne peut pas non plus se produire :
aucune tuile ผม ou ดิฉัน n'existe dans l'exercice.

Le contraste avec 2C est net, et il montre que la leçon a perdu un dispositif
déjà publié : l'exercice `word_order` de 2C propose `[หน่อย] [ครับ] [ขอ] [ค่ะ]
[น้ำ]` et exige explicitement le RETRAIT de la particule du mauvais genre.

Conséquence en cascade : la carte `srs-u08-l8d-03` exige « sans erreur de
particule », critère que l'exercice qui la nourrit ne peut pas produire.

Erreur arithmétique dans le même paragraphe : « Les trois tirages à quatre
tuiles ou plus interdisent de réussir par élimination ». Il y en a **deux**,
les tirages 3 et 4. Les trois autres n'ont que trois tuiles.

### F-02 (BLOQUANT) L'exercice 1 est réussissable sans écouter : la clé est une période stricte, et aucun ordre aléatoire n'est déclaré

Les huit tirages sont donnés dans un ordre fixe, et la suite des réponses est
exactement périodique de période 3 :

`มีปัญหา, อันนี้ไม่ใช่, ขอเปลี่ยนหน่อย, มีปัญหา, อันนี้ไม่ใช่,
ขอเปลี่ยนหน่อย, มีปัญหา, อันนี้ไม่ใช่`

soit A B C A B C A B. Le genre de la voix alterne lui aussi strictement,
H F H F H F H F.

L'exercice ne déclare PAS d'ordre aléatoire, alors que la maison le déclare
partout ailleurs : `u05-l5b`, `u06-l6a` et `u07-l7c` écrivent « ordre
aléatoire » ou « ordre affiché aléatoire » dans leurs listes de tirages. Tel
qu'écrit, le gabarit est donc la séquence servie.

Deux exploits qui n'exigent aucune compétence :

1. Rejeu. La leçon rejouée une seconde fois donne 8 sur 8 de mémoire de
   position. Le seuil est de 6 sur 8.
2. Première passe. L'apprenant qui répond au hasard aux tirages 1 à 3, puis
   applique le cycle aux tirages 4 à 8, obtient 5 réponses justes garanties
   plus environ 1 au hasard, soit l'espérance exacte du seuil.

Le plancher de stratégie écrit dans la leçon n'examine que deux stratégies, la
réponse constante et le hasard pur uniforme. Il conclut « aucune réponse
constante ne passe donc », ce qui est vrai et insuffisant. La périodicité est
une stratégie strictement moins coûteuse que les deux examinées, et elle
passe.

Le même défaut se propage à `srs-u08-l8d-01`, qui reprend le gabarit sans
exiger de permutation.

### F-03 (BLOQUANT) La carte `srs-u08-l8d-02` exige de LIRE deux mots que la leçon déclare illisibles avec les règles publiées

La carte 02 porte sur « les quatre mots NOUVEAUX du jour, ไม่ใช่, ปัญหา,
เปลี่ยน et เสีย » avec pour critère « reconnaissance à l'écoute **et à la
lecture** ».

La même leçon écrit deux fois le contraire :

- en tête de la section Exercices : `reading` est écartée parce que « les deux
  mots que la leçon donnerait à lire, เปลี่ยน et ไม่ใช่, sortent tous deux des
  règles de lecture publiées », et parce qu'« un exercice de lecture
  mesurerait donc une compétence que le parcours n'a pas encore enseignée » ;
- en fin de section SRS : « aucune carte ne demande de LIRE เปลี่ยน, ni d'en
  déduire le ton, ni de lire le ญ de ปัญหา : ces trois points sont
  explicitement hors périmètre ».

La carte 02 demande exactement cela pour trois des quatre mots. Il faut
trancher : soit la carte se limite à l'écoute, soit la justification du retrait
de `reading` tombe.

### F-04 (BLOQUANT) « il y a », et non « j'ai » : la leçon exclut une lecture que sa propre source donne en premier

La page 4 et l'item 5 enseignent มีปัญหา comme l'emploi existentiel de มี, et
l'item 5 écrit en toutes lettres « « il y a », et non « j'ai » », puis en tire
une conséquence pragmatique : « Vous ne dites donc pas à qui appartient le
problème, ce qui évite d'en attribuer la faute à quelqu'un ; c'est un effet de
la construction thaïe ».

La seule source du dossier qui donne la glose française, VOLUBILIS ligne
55745, relevée ici, écrit dans cet ordre :

- ENG : `have trouble (with) ; have problems ; there's a problem`
- FRA : `avoir un problème ; avoir des problèmes ; il y a un problème`

La lecture personnelle est donnée EN PREMIER dans les deux langues. Le thaï
omet couramment le sujet, et la phrase est ambiguë entre les deux lectures.
La leçon choisit l'une et déclare l'autre exclue, contre sa propre source.

La conséquence pragmatique ajoutée, « ce qui évite d'en attribuer la faute à
quelqu'un », n'est portée par aucune source du dossier. C'est une affirmation
d'effet communicatif, du même genre que celles que la note culturelle
s'interdit explicitement quelques sections plus bas.

### F-05 (BLOQUANT) La page 1 affirme un fait d'attitude que le dossier déclare ne jamais affirmer

Page 1 : « Aucune des trois ne hausse le ton, et ce n'est pas une question
d'intention : c'est la construction des phrases elles-mêmes qui le fait ».

Le dossier de production, section « Sources du registre », conclut à l'inverse :
« Aucune affirmation n'est faite sur l'intonation, la vitesse, le volume ou
l'attitude, faute de source autorisée pour ce type de fait. »

Et la page 8 écrit elle-même qu'« aucune des sources consultées n'attache
d'étiquette de registre à ไม่ใช่ ». La phrase อันนี้ไม่ใช่ ne possède donc
aucune pièce sourcée de politesse en dehors de la particule finale. Affirmer
que sa CONSTRUCTION empêche de hausser le ton n'est étayé par rien, et la
promesse « comme la page 8 vous le montrera pièce par pièce » n'est pas tenue
pour deux des trois formules.

### F-06 (BLOQUANT) Affirmation de phonétique française hors des deux voies de la section 1 bis

Item 4, `note_fr` : « c'est cette montée finale qu'une oreille française laisse
tomber ».

C'est un fait de perception du français. La section 1 bis n'en admet que deux
formes : sourcé par deux sources indépendantes de la liste, ou reformulé en
observation que l'apprenant vérifie lui-même. Ce n'est ni l'un ni l'autre.
Aucune source du dossier ne porte sur le français, et la formule n'invite à
aucune vérification.

Aggravant de procédure : la chaîne « 1 bis » apparaît **zéro fois** dans
`lecon-8d.md`, alors que `u06-l6a`, `u06-l6b`, `u06-l6c` et `u06-l6e` la
mobilisent nommément et documentent leur traitement, et que l'audit de
`u06-l6e` a classé six énoncés du même type en finding bloquant B4. La Méta de
8D affirme pourtant que la page 5 « traite par une observation que l'apprenant
vérifie lui-même plutôt que par une affirmation sur le français », ce qui
montre que l'auteur connaissait la contrainte et ne l'a appliquée qu'à un
endroit.

### F-07 (BLOQUANT) « à ceci près que le p thaï ne souffle pas » fabrique une différence avec le français que le parcours a déjà niée

Page 5 : « dites le mot français « pli », arrêtez-vous après le `pl`, et vous y
êtes, **à ceci près que** le p thaï ne souffle pas ». L'item 6 répète le
montage : « prononcez le mot français « pli » [...] puis souvenez-vous que le p
thaï de 2A ne souffle pas ».

La locution « à ceci près » présente l'absence de souffle comme une correction
à appliquer au modèle français qui vient d'être donné. Deux textes du dépôt
disent le contraire :

- `CONVENTIONS.md`, transcription pédagogique : « Consonnes : `k t p` non
  aspirées (**comme en français**) » ;
- `u02-l2a`, item ปา, `note_fr` : « C'est le seul des trois p thaïs qu'un
  francophone produit correctement **sans rien changer à ses habitudes** : la
  voyelle démarre immédiatement après les lèvres. »

Il n'y a donc rien à retrancher : le `p` de « pli » est déjà le bon son. La
formulation actuelle est à la fois une affirmation implicite non sourcée sur
le français, donc hors section 1 bis, et une invitation à l'hypercorrection sur
le seul p thaï que l'apprenant réussissait sans effort.

### F-08 (BLOQUANT) « la page 10 de 7A a explicitement mis เปลี่ยน hors du tableau » : c'est faux, et cela déforme la frontière enseignée par 7A

La Méta, la page 5 et l'item 6 attribuent à la page 10 de 7A l'exclusion du
ton de เปลี่ยน, avec l'adverbe « explicitement » à l'item 6.

Texte réel de 7A page 10, relu dans le dépôt. Elle énumère quatre familles :
les syllabes mortes (ค่ะ, ล่ะ) ; les formes déjà écartées par 4A (ไ, ใ, เ◌า,
◌ำ) ; les mots à consonne de tête, « où un **ห ou un อ muet** change la
donne », avec pour seuls exemples หน่อย, ไหว้, อยู่ et อร่อย ; et les deux
marques non encore vues, ไม้ตรี et ไม้จัตวา.

เปลี่ยน n'appartient à aucune des quatre. Ce n'est pas un mot à consonne de
tête : ปล est un vrai groupe consonantique, sans lettre muette. Le dossier de
7A le sait, puisqu'il range เปล่า et กว่า dans un tableau de contre-exemples
QUI N'EST PAS AFFICHÉ par la page 10, et puisqu'il écrit avoir mesuré puis
**refusé d'enseigner** la règle générale « la marque se pose sur la dernière
consonne du groupe initial », au motif qu'elle « exige les notions de groupe
initial et de consonne de tête, que la page 10 met explicitement hors
périmètre ».

Deux dégâts distincts :

1. Le renvoi est faux. L'apprenant à qui l'on dit « la page 10 vous a prévenu »
   n'a jamais rien lu de tel sur les groupes consonantiques.
2. La généralisation induite est fausse et dangereuse pour le tableau des tons.
   8D propose comme critère « la marque n'est pas sur la première consonne,
   donc hors tableau ». Or le ton de เปลี่ยน est parfaitement régulier : ป est
   de classe moyenne, la syllabe est vivante, ไม้เอก donne le ton bas, ce qui
   est exactement la valeur enseignée. Ce n'est pas une exception au tableau,
   c'est un cas dont l'apprenant n'a pas encore la clé d'entrée. Écrire l'un
   pour l'autre fragilise la case que 7A a construite et que 8A doit compléter.

La décision pédagogique de ne pas faire lire ce ton reste bonne. C'est sa
justification qui est fausse.

### F-09 (BLOQUANT) La note culturelle attribue au dictionnaire une forme palie qu'il n'imprime pas

Note culturelle : « Le dictionnaire le rattache au pali **ปญฺห** et signale le
sanskrit ปฺรศฺน ».

Relevé refait le 2026-08-04 par requête POST unique sur `func_lookup.php` : la
vedette ปัญหา porte, en fin d'article, les seules étiquettes d'origine
`(ป.; ส. ปฺรศฺน)`. Le RID donne l'abréviation de langue pour le pali, et une
forme écrite pour le seul sanskrit. **Aucune forme palie ปญฺห n'y figure.**

La source correcte de « pañha » est en.wiktionary, en écriture latine, ou
th.wiktionary. Le dossier de sources de la note, deux paragraphes plus bas, est
d'ailleurs juste : il n'y cite que « les étiquettes d'origine (ป. ; ส. ปฺรศฺน)
figurent en fin de vedette ». C'est le corps de la note, lu par l'apprenant,
qui fabrique l'attribution.

### F-10 (BLOQUANT) « verbe à quatre sens » pour en.wiktionary « เปลี่ยน » : il y en a trois

Item 6, champ `sources` : « en.wiktionary, entrée « เปลี่ยน » [...] verbe à
**quatre** sens dont « to change ; to modify ; to alter » et « to shift ; to
switch ; to replace » ».

Page relue en rendu le 2026-08-04. La section Verb porte **trois** sens
numérotés, puis passe à Derived terms :

1. to change ; to modify ; to alter ; to make different
2. to change ; to undergo a change ; to become different
3. to shift ; to switch ; to replace

Le décompte est faux. Le fait n'en dépend pas, mais un dossier de preuve dont
un décompte vérifiable est faux perd sa valeur de dossier.

### F-11 (BLOQUANT) L'étiquette « polite » de Wiktionary ne porte pas sur la construction enseignée

Le dossier écrit, en pièce 3 des sources du patron : cet exemple « attache ขอ à
เปลี่ยน, confirme la première personne, et fournit **la seule étiquette de
registre du dossier qui porte directement sur la construction enseignée** ».
La table « Sources du registre » reprend la même lecture pour la ligne
« ขอ + เปลี่ยน ».

Exemple réel, relevé sur la page en rendu le 2026-08-04 :

`ฉันขอเปลี่ยนกาแฟเป็นน้ำเปล่าได้ไหมคะ`, glosé « May I replace coffee for still
water? », annoté « female speaker, polite ».

Trois écarts avec ce que le dossier lui fait dire :

1. La phrase **ne contient pas หน่อย**. La construction enseignée est
   ขอ + VERBE + หน่อย ; l'exemple est ขอ + groupe verbal + ได้ไหม.
2. Elle contient คะ, et ได้ไหม, qui sont les porteurs évidents de la politesse
   annotée. L'annotation « female speaker, polite » est une note d'usage sur la
   PHRASE d'exemple, du type que Wiktionary applique pour signaler le genre du
   locuteur et le registre de l'énoncé ; ce n'est pas une étiquette de registre
   attachée au lemme ni à un patron.
3. ได้ไหม est par ailleurs déclaré hors périmètre par la Méta de 8D. Le dossier
   s'appuie donc sur la partie de l'exemple qu'il a écartée pour établir le
   registre de la partie qu'il enseigne.

Le champ `registre` de l'item 7 reste défendable, mais par la particule finale
seule, publiée et sourcée par 1E. La seconde jambe revendiquée n'en est pas une.

### F-12 (BLOQUANT) Deux renvois internes faux dans les dossiers de preuve

Vérifiés dans le dépôt le 2026-08-04 :

1. Item 1, `sources` : « à la leçon 5E, **item 8**, qui le réemploie déjà ».
   L'item 8 de `u05-l5e` est ตรงไป. ขอโทษ y est l'**item 9**.
2. Section SRS : « ขอโทษ garde ses cartes `srs-u02-l2c-01` et
   `srs-u02-l2c-03` ». La carte `srs-u02-l2c-01` de `u02-l2c` porte sur le
   « bloc **ขอบคุณ** + particule ». La carte qui porte sur ขอโทษ et ses deux
   valeurs est `srs-u02-l2c-03`, et elle seule. La carte de ไม่เป็นไร est la
   `-02`.

La conclusion de la section SRS, ne pas créer de carte de vocabulaire pour
ขอโทษ, tient toujours par la seule carte `-03`. C'est la traçabilité qui est
atteinte : un dossier dont on ne peut pas suivre les renvois n'est pas un
dossier auditable.

### F-13 (non bloquant) Contradiction interne d'une phrase avec elle-même, page 2

Page 2 : « Un détail d'écriture que vous savez déjà lire, **même si personne ne
vous l'a dit pour cette lettre** : le ใ de ใช่ s'écrit AVANT le ช [...]
exactement comme le ไ de ไม่ et comme **les cinq voyelles signalées par 4A** ».

`u04-l4a` nomme les cinq lettres en toutes lettres, ใ comprise : « เ, แ, โ, ใ
et ไ sont des voyelles qui s'écrivent AVANT leur consonne ». La section Unicode
de 8D le redit : « il est exactement celui que 4A avait publié pour เ, แ, โ, ใ
et ไ ». La proposition concessive est donc fausse, et démentie par la suite de
sa propre phrase.

## 3. Points de méfiance levés, à ne pas rouvrir

Ces points avaient l'air suspects et ne le sont pas. Ils sont consignés pour
éviter qu'un audit suivant refasse le travail.

- **หน่อย « brève »** n'est pas une erreur de longueur. Voir section B.
- **`plìan` et `sǐa` sans doublement de voyelle** sont conformes : la
  convention v1.1 double la dernière lettre du GRAPHÈME de voyelle simple, et
  `u05-l5b` a publié `líao` pour เลี้ยว sur le même modèle, avec le ton posé
  sur le `i`.
- **La chaîne ขอเปลี่ยนหน่อย est bien introuvable** dans les sources. La
  déclaration d'INSTANCE est exacte et vérifiable, recherche par sous-chaîne
  refaite ici sur les 114 579 lignes.
- **Les trois 404 Wiktionary sont réels**, y compris celui de th.wiktionary pour
  ไม่ใช่, qui ressemblait à une invention commode.
- **Le décompte RID 9 / 6 / 3** est exact, contrôle refait mot par mot.
- **La contre-observation de la ligne 36694** est un vrai geste d'honnêteté :
  le dossier cite une ligne qui remplit la case du patron par un nom, alors
  qu'il argumente pour le verbe.
- **Aucun tiret cadratin ni demi-cadratin** dans le fichier, règle fondateur
  ADR-0022 respectée.

## 4. Réserves mineures, sans finding

- Exercice 4 : « ordre aléatoire, jamais deux fois de suite le même locuteur »
  avec trois hommes et deux femmes ne laisse qu'un seul ordre possible,
  H F H F H. L'aléa annoncé n'existe pas ; la contrainte, elle, est bonne.
- Exercice 3, piège connu : « le dictionnaire montre **toujours** la chose
  d'abord » est trop fort. Le même article du RID donne, à son sens (๑), des
  exemples où เสีย précède son complément. La règle est vraie pour les deux
  sens enseignés, et il suffit de le dire.
- Item 8 : la leçon présente le registre de เสีย appliqué à une personne comme
  un DÉSACCORD entre deux sources. Le RID, autorité n° 1, donne aussi ce sens
  sans étiquette, ce qui fait deux sources sans étiquette contre une. La
  décision d'écarter l'emploi reste bonne ; sa présentation comme un simple
  match nul est incomplète.
- คะ est attribué à `u02-l2e` item 1. L'item existe bien, mais 2E lui-même
  l'annonce comme « réemploi, enseigné en 2B ». Le renvoi de première
  publication est 2B.
- Exercice 2 : le feedback incorrect propose cinq catégories pour six paires, et
  les paires 3 et 4, désignées comme la confusion principale, tombent toutes
  deux dans la même catégorie. L'indice ne discrimine donc pas là où il faudrait.

## 5. Verdict

- Faits re-vérifiés et confirmés par l'auditeur : **112**.
- Findings : **13**, dont **12 bloquants**.
- Le dossier de sources externes de cette leçon est, à trois exceptions près
  (F-09, F-10, F-11), d'une exactitude inhabituelle : lignes VOLUBILIS,
  empreintes, rangs de fréquence, relevés Unicode et codes de statut HTTP sont
  tous reproductibles à l'identique.
- Le point faible n'est pas la vérification externe, c'est la **cohérence
  interne** : renvois au dépôt approximatifs (F-08, F-12, F-13), exercices dont
  la mesure annoncée n'est pas la mesure réelle (F-01, F-02), carte SRS qui
  contredit une exclusion écrite deux fois (F-03), et retour des affirmations
  non sourçables sur le français et sur l'attitude (F-04, F-05, F-06, F-07),
  que les unités 5 à 7 avaient pourtant appris à traquer.
- Statut recommandé : reste `draft`. Ne pas passer en `review` avant résolution
  des douze findings bloquants.
- Revue native : en attente.
