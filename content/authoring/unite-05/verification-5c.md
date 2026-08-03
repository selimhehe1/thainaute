# Contre-audit adversarial de `unite-05/lecon-5c.md`

- Date : 2026-08-03
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), agent indépendant du rédacteur
- Consigne : chercher des erreurs, ne rien tenir pour acquis, réinterroger les
  sources primaires plutôt que le dossier de la leçon, interroger le RID
  directement dès qu'une orthographe ou une variante est en jeu
- Verdict : `draft` maintenu. **7 findings bloquants, 5 findings non bloquants.**
- Faits re-vérifiés et confirmés par l'audit lui-même : **190**
- Revue native : en attente (inchangé)

## 1. Méthode

Rien n'a été repris du dossier de production. Chaque source a été réinterrogée
le jour même, et le fichier VOLUBILIS a été retéléchargé plutôt que cru sur
parole.

- **RID 2554** : 16 requêtes `POST` sur `dictionary.orst.go.th/func_lookup.php`,
  corps `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l'audit,
  espacées de 1,3 seconde. Les 16 graphies du dossier ont été rejouées, plus
  deux graphies de contrôle hors leçon (`เท่าไร`, `เท่าไหร่`) pour vérifier le
  parallèle avec 3C que la leçon invoque. Aucune définition n'est reproduite
  ici : seuls la présence, le nombre de vedettes, le nombre de sens, les
  relations แม่คำ et ลูกคำ, les lectures entre crochets et la présence d'un
  exemple sont consignés par référence.
- **VOLUBILIS** : `VOLUBILIS.ods` retéléchargé depuis
  `https://sourceforge.net/projects/belisan/files/VOLUBILIS.ods/download`.
  Taille 15 724 718 octets et SHA-256
  `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc` :
  identiques à ce que déclare la leçon. `content.xml` relu en flux par un
  parseur expat écrit pour l'audit, avec expansion de
  `table:number-columns-repeated` et `table:number-rows-repeated`, sans aucune
  normalisation Unicode, numérotation remise à 1 par `table:table`. Les 50
  numéros de ligne cités par la leçon ont été relus un par un, et la colonne
  `THA` a été balayée en égalité stricte pour retrouver la position réelle des
  graphies contestées.
- **Wiktionary** : pages `en` et `th` récupérées en wikitexte brut
  (`action=raw`) et en rendu, y compris les 6 pages que la leçon déclare
  absentes, afin de vérifier le 404 plutôt que de le supposer.
- **FrequencyWords** : `content/2018/th/th_50k.txt` retéléchargé et indexé ; les
  16 couples rang plus occurrences cités par la leçon ont été relus dans le
  fichier.
- **Unicode** : propriétés et comportements de normalisation recalculés
  localement (catégorie, classe combinatoire, décomposition, NFC, NFD, NFKC,
  NFKD).
- **Fichier de leçon** : contrôles NFC, codepoints, typographie et détection de
  lettres non thaïes rejoués intégralement sur le fichier tel qu'édité.

## 2. Ce que l'audit confirme

Le dossier de la leçon est, sur l'essentiel, exact et honnête. Les faits
suivants ont été retrouvés à l'identique.

**RID (40 constats).** Les 16 requêtes se rejouent sans erreur : 11 graphies
attestées, 5 absentes, exactement la répartition annoncée. อยู่ est une vedette
unique à 4 sens verbaux et porte bien la lecture [หฺยู่]. ที่ไหน est une vedette
unique de catégorie nominale à 2 sens, dont le premier est un endroit non
déterminé. ไหน compte bien trois vedettes, dont la vedette groupée
« ไหน ๒, ไหนล่ะ, ไหนว่า, ไหนว่าจะ », et ไหน ๑ donne bien คนไหน, อันไหน et ที่ไหน
comme ses propres exemples. ที่ est une vedette unique à 8 sens dont le huitième
est bien une valeur de préposition illustrée par อยู่ที่บ้าน, et sa liste ลูกคำ
contient bien ที่ไหน. ห้องน้ำ est une vedette unique qui range sous la même
graphie la pièce où l'on se lave et les toilettes, avec ห้อง déclaré แม่คำ, et
ห้อง est une vedette unique à 3 sens dont la liste ลูกคำ contient ห้องน้ำ.
สถานี est une vedette unique à 5 sens, porte la lecture [สะถานี] et donne bien
สถานีตำรวจ, สถานีรถไฟ et สถานีขนส่ง parmi ses exemples. นี่ est une vedette
unique à 3 sens qui cite อยู่นี่ et définit le proche ; นั่น est une vedette
unique à 2 sens qui cite ที่นั่น et se définit comme « ที่อยู่ไกลกว่า นี่ »,
donc plus éloigné que นี่. โรงแรม et ตรง sont attestés comme annoncé, ตรง sous
la vedette groupée « ตรง, ตรง ๆ » à 7 sens dont le septième donne bien ตรงนี้ et
ตรงนั้น. Les 5 absences sont réelles, réponse « ไม่พบคำศัพท์ที่ต้องการค้นหา »
pour อยู่ที่ไหน, อยู่ไหน, ที่นี่, ที่นั่น et ตรงไหน. Le parallèle invoqué avec
3C est également exact : เท่าไร a une entrée au RID, เท่าไหร่ n'en a pas, et
en.wiktionary étiquette bien เท่าไหร่ « colloquial ».

**Wiktionary (20 constats).** IPA, romanisations Paiboon, catégories, définitions
et exemples cités sont tous retrouvés tels quels, y compris les trois exemples
de la page ที่ไหน, la respellée ไหฺน, la respellée หฺยู่ de อยู่, la catégorie
« Thai terms with irregular pronunciations », l'étymologie « water room » de
ห้องน้ำ et l'annotation « ไม่ตามอักขรวิธี ; เสียงสระสั้น » de th.wiktionary sur
la même entrée. Les six absences déclarées sont réelles : 404 pour
en.wiktionary อยู่ไหน, อยู่ที่ไหน et ตรงไหน, 404 pour th.wiktionary ที่ไหน,
ที่นี่ et ที่นั่น. Point utile pour la longueur contestée à l'item 5 :
en.wiktionary donne ห้อง SEUL avec la respellée ฮ็่อง, donc déjà brève, ce qui
renforce la lecture que la leçon fait de VOLUBILIS.

**VOLUBILIS (55 constats).** Le fichier est le bon, à l'octet et à l'empreinte
près. Les décomptes de lignes non vides se refont exactement : `Volubilis`
118 571, `Codes` 227, `Romanization` 86, cette dernière feuille comptant bien 94
lignes au total. La feuille `Codes` porte bien l'intitulé `TONES` et, aux lignes
216 à 220, `-x` normal, `¯x` haut, `_x` bas, `/x` montant, `\x` descendant. La
feuille `Romanization` porte bien « Last updated : 22 Mar. 2021 » et donne aux
lignes 41, 45, 49, 58, 59, 71 et 74 les valeurs annoncées, dont `o` pour la
brève เอาะ et `ø` pour la longue ออ. **La reconstruction empirique de la clé `ø`
contre `ǿ` est confirmée sur les douze graphies témoins, zéro écart** : `ǿ` sur
เกาะ 44234, เพราะ 76545, ล็อก 51562, บล็อก 5251, ช็อก 9298, น็อต 66672, et `ø`
sur ขอ 36223, พอ 75034, ของ 36960, สอง 97075, ร้อน 86654, ทอง 106254. Toutes les
autres lignes citées sont exactes au champ près : 117905 à 117908 pour อยู่,
105532 pour ที่ไหน, 105212 à 105217 pour ที่ dont 105215 en `prep.`, 60008 à
60010 pour ไหน, 118283 pour le patron avec ses points de suspension à gauche,
68617 pour ปัญหาอยู่ที่ไหน, 118280 et 118281, 68087, 19595, 68089 et 15331 pour
le schéma verbe plus ไหน, 16813 pour ห้องน้ำ, 16739 et 16740 pour ห้อง dont la
ligne de classificateur, 93043 pour สถานี, 105604 et 105538 pour la paire de
réponse, 118174 pour อยู่นี่, 109880, 109881 et 109882 pour la famille ตรง,
86901 pour โรงแรม, 99804 pour ตลาด. La répartition du domaine `RID` est exacte :
présent pour ที่ไหน et ห้องน้ำ, absent pour อยู่, ไหน, สถานี, ที่นี่, ที่นั่น,
อยู่ที่ไหน et ที่. Le balayage de la colonne `THA` confirme enfin les deux
absences que la leçon revendique : aucune entrée อยู่ไหน, aucune entrée
อยู่ที่นี่.

**FrequencyWords (17 constats).** Le fichier compte bien 50 000 lignes et les 16
couples rang plus occurrences cités par la leçon sont tous exacts, sans une
seule erreur : อยู่ 879 / 440, ที่ไหน 376 / 984, ไหน 860 / 451, อยู่ที่ไหน
1044 / 367, อยู่ไหน 1055 / 363, คุณอยู่ที่ไหน 1128 / 343, ที่นี่ 262 / 1404,
ที่นั่น 1717 / 229, อยู่ที่นี่ 1531 / 252, อยู่นี่ 1542 / 251, ห้องน้ำ
3701 / 105, ห้อง 1079, สถานี 6157 / 64, สถานีรถไฟ 18524, โรงแรม 3469 / 113,
ตลาด 26132.

**Unicode (13 constats).** Toutes les lignes de propriété citées sont exactes.
U+0E33 est bien `Lo`, classe 0, décomposition `<compat> 0E4D 0E32` ; U+0E39 est
bien de classe combinatoire 103 et U+0E48 de classe 107. Les trois comportements
annoncés se reproduisent : NFC et NFD laissent น้ำ intact, NFKC et NFKD le
transforment tous deux en U+0E19 U+0E49 U+0E4D U+0E32, et une saisie inversée
U+0E2D U+0E22 U+0E48 U+0E39 est bien réordonnée silencieusement par NFC vers la
séquence déclarée à l'item 1. **Le risque NFKC de l'incertitude 8 est réel et
correctement décrit.**

**Contrôles locaux (20 constats).** Le fichier compte bien 125 chaînes thaïes
distinctes, toutes stables en NFC, et le fichier entier est stable en NFC. Zéro
tiret cadratin U+2014, zéro demi-cadratin U+2013, zéro U+2015, zéro U+2212, zéro
apostrophe droite, 439 apostrophes typographiques U+2019. Aucune lettre grecque
ni cyrillique ne subsiste : la correction des cinq U+03BD est effective. Les 9
séquences `codepoints` des 8 items sont exactes, ainsi que les 3 séquences de
répliques données en prose.

**Transcription et dérivations (25 constats).** Les 12 transcriptions employées
sont conformes à l'amendement v1.1 : diacritique réservé au ton et posé sur la
première lettre du noyau, doublement de la dernière lettre du graphème pour la
longueur, `ou` pour /u/, `aw` pour /ɔ/, `ai` pour /aj/. `yòuu`, `thîi·nǎi`,
`hâwng·náam`, `sà·thǎa·nii`, `thîi·nîi`, `thîi·nân`, `khráp`, `khá`, `khâ`,
`khǎww·thôot`, `khàwwp·khoun` et `mâi·pen·rai` sont tous corrects. Les tons et
longueurs déclarés ont été recalculés à la main par classe de consonne et type
de syllabe pour les treize syllabes du jour : tous justes. **La page 9 résiste
au contrôle** : en confrontant sa formulation à la page 8 de 4A réellement lue,
une seule syllabe de la leçon tombe effectivement dans le domaine de la règle,
la deuxième de สถานี ; นี en sort par la classe basse de น, สะ par sa forme
morte, ไหน par la voyelle ไ que 4A nomme explicitement parmi ses cas non
couverts, et le reste par les marques de ton.

## 3. Findings bloquants

### B1. Trois numéros de ligne VOLUBILIS faux à l'item 7

L'item 7 écrit : « VOLUBILIS, lignes 37006 et 37007 pour ครับ ... et ligne 28944
pour คะ ». Relecture du fichier dont la leçon donne elle-même l'empreinte :

| ligne citée | contenu réel de la colonne `THA` |
| ----------- | -------------------------------- |
| 37006       | คงจะเป็น, « ce doit être »       |
| 37007       | คงจะต้อง, « must »               |
| 28944       | การยึดทรัพย์, « seizure »        |

Les vraies positions dans `VOLUBILIS.ods` v26.2 sont **ครับ aux lignes 38457 et
38458** et **คะ à la ligne 30140** (ค่ะ à la 30141). Le texte des cellules cité
par la leçon est exact, mais il appartient à d'autres lignes que celles
indiquées. Sous l'amendement v1.2, le numéro de ligne EST la référence
reproductible : un tiers qui suit la référence atterrit sur des entrées sans
rapport. La circonstance est aggravante, car le dossier de 5C avertit lui-même,
dans sa section VOLUBILIS, que les numéros de l'unité 2 ne sont pas comparables,
puis reprend précisément les numéros de `unite-02/verification-volubilis.md`, qui
avaient été relevés sur un export `.xlsx` différent. Le décalage n'est pas
constant, 28944 vers 30140 et 37006 vers 38457, ce qui exclut toute
transposition mécanique. **Corriger les trois numéros et rejouer, au passage,
tous les numéros hérités de l'unité 2 dans les leçons 3C, 3E, 4D et 4E.**

### B2. Le feedback de l'exercice 3 rejoue l'erreur que la page 5 déclare corrigée

Exercice 3, tirage 1, feedback correct affiché à l'apprenant : « Aucun des deux
dictionnaires consultés ne range l'une ou l'autre parmi ses mots ». C'est faux :
**VOLUBILIS ligne 118283 porte exactement le patron อยู่ที่ไหน**, vérifié dans
le fichier. La leçon le sait, puisque sa section « Ce que la leçon n'affirme
PAS » écrit : « La formulation antérieure de cette page disait "aucun des deux
dictionnaires ne range อยู่ที่ไหน parmi ses mots", ce qui était FAUX pour
VOLUBILIS ... La page a été corrigée ». La correction a été appliquée à la
page 5 mais pas au feedback de l'exercice, où la formulation fautive subsiste
mot pour mot. Un corrigé affiché énonce donc un fait faux, et la leçon se
contredit d'un écran à l'autre. Le compte est en outre incohérent : la leçon
consulte trois dictionnaires, pas deux.

### B3. Une règle fausse dans la note culturelle, réfutée par la source citée

Note culturelle : « chaque fois que vous rencontrerez ห้อง en tête d'un mot, il
s'agira d'une pièce ». C'est une généralisation présentée à l'apprenant comme une
prise fiable, et l'entrée RID « ห้อง » que la note cite juste au-dessus la
contredit : le sens (๓) donne ชั้น avec pour exemple ห้องฟ้า, où ห้อง est bien en
tête et ne désigne pas une pièce, et le sens (๒) donne ตอน avec
พระพุทธคุณเก้าห้อง. La liste ลูกคำ de la même entrée contient de plus ห้องแถว,
qui désigne un bâtiment et non une pièce. **Supprimer la généralisation ou la
borner explicitement aux mots du parcours.**

### B4. Item 6 : le RID mal cité sur ses quatre autres sens

L'item 6 écrit : « cinq sens dont le premier ... Les quatre autres sens, tous
militaires ou maritimes, ne sont pas enseignés ». Le cinquième sens de l'entrée
RID « สถานี » n'est ni militaire ni maritime : c'est
ที่ที่มีหน่วยปฏิบัติการเฉพาะ, illustré par สถานีสื่อสารดาวเทียม,
สถานีสมุทรศาสตร์ et สถานีตรวจอากาศ, soit une station de communication par
satellite, une station océanographique et une station météorologique. Seuls les
sens 2, 3 et 4 sont navals. La caractérisation de la source est donc fausse.

### B5. « la gare » n'est étayée par aucune des trois sources

Page 7 : « สถานี, c'est la station ou la gare » ; item 6, champ `fr` : « la
station, la gare ». Aucune des trois sources citées ne porte ce sens :

- RID, sens 1, หน่วยที่ตั้งเป็นที่พักหรือที่ทำการ, et le dictionnaire emploie
  précisément สถานีรถไฟ, en deux morceaux, pour la gare ferroviaire ;
- VOLUBILIS ligne 93043, relue : ENG « station », FRA « station [f] », rien
  d'autre ;
- en.wiktionary : « station: base, stopping place », avec สถานีรถไฟ rangé en
  terme dérivé.

Le sens « gare » est donc ajouté par la rédaction, sans source, dans un item
dont la leçon revendique la double vérification, et il est immédiatement
contredit par la phrase suivante de la même page, qui explique que le
dictionnaire dit สถานีรถไฟ pour le train. La leçon fait par ailleurs une seconde
affirmation d'usage non sourcée du même ordre à l'item 5 : « c'est le mot à
employer pour demander son chemin ».

### B6. Affirmations phonétiques sur le français sans aucune source

Trois énoncés décrivent ce que fait une bouche francophone :

- page 8 : « En français, vous avez l'habitude de faire monter la voix à la fin
  d'une question » ;
- page 8 : « Si vous ajoutez votre montée par-dessus, vous déformez les deux » ;
- item 5, `note_fr` : « un souffle franc, pas un h muet à la française ».

`docs/content-policy/sources-verification.md` ne comporte aucune source de
phonétique française, ni de phonétique tout court en dehors des transcriptions
de dictionnaires. Aucun des trois énoncés n'est rattaché à une référence. Le
dossier prend pourtant soin de désamorcer l'affirmation symétrique sur le thaï,
sous le titre « Aucune affirmation sur l'intonation de phrase en thaï », et
qualifie la consigne « dites la question comme vous diriez une affirmation » de
conseil de production. Cette précaution laisse intacte la prémisse française, qui
est le fait porteur de toute la page 8 et le fondement du piège annoncé à
l'exercice 1. **Sourcer par une grammaire ou une phonétique du français
recevable, ou reformuler la page en la limitant aux deux tons lexicaux
réellement sourcés.**

### B7. 5A et 5B existent, ce qui invalide trois passages du dossier

La Méta écrit « 5A et 5B ne sont pas encore rédigées au jour de cette
rédaction », et l'incertitude 1 en fait un point à reprendre. Le répertoire
`content/authoring/unite-05/` contient `lecon-5a.md` (90 551 octets),
`lecon-5b.md` (96 417 octets), `lecon-5d.md` et `lecon-5e.md`. Trois
conséquences directes :

1. le motif d'écart de ตรงนี้ et ตรงนั้น, « ตรง ouvre un groupe consonantique
   /tr/ que le parcours n'a pas encore traité », est faux : **5B enseigne ตรง
   comme son item 6**, avant 5C dans l'unité ;
2. l'incertitude 2, qui demande de confirmer que 5D ou 5E porte les verbes de
   direction, est close et mal orientée : c'est 5B qui les porte, sous le titre
   « Aller, venir, tourner » ;
3. l'incertitude 1 est également close : 5A enseigne les consonnes basses
   ค ง ช ซ ท น พ ฟ ม, donc la classe de ท et de น que la page 9 disait ne pas
   pouvoir citer.

À noter aussi que 5E déclare explicitement dépendre de 5C pour อยู่ et ที่ไหน,
et que 5D et 5E enseignent ตลาด, écarté ici faute de vérification. La Méta et la
section des incertitudes doivent être réécrites contre l'état réel de l'unité.

## 4. Findings non bloquants

### N1. Conflit interne de VOLUBILIS sur la longueur de ไหน, non signalé

La leçon pose comme clé de lecture que le macron note la longueur, puis cite
trois lignes qui se contredisent : ligne 105532 `\thī/nai`, sans macron, mais
ligne 118283 `... _yū \thī/nāi` et ligne 68617 `-pan/hā _yū \thī/nāi`, avec
macron. Les trois citations sont exactes, la contradiction est dans la source.
Le fait enseigné, « nǎi brève », reste juste, corroboré par la voyelle ไ, par
les lignes 60008 à 60010 `/nai` et par l'IPA /naj˩˩˦/ sans marque de longueur.
Mais l'item 3 déclare « nǎi brève » en s'appuyant sur une ligne qui écrit le
contraire, sans le dire, alors que la leçon signale scrupuleusement ses autres
divergences de source. **Consigner la contradiction.**

### N2. Citation tronquée de VOLUBILIS 61120

L'item 5 cite la ligne 61120 sous la forme « `¯nām` » pour établir la longueur
de น้ำ. La cellule réelle est **`¯nām [=¯nam]`** : la source enregistre elle-même
une variante brève. La troncature intervient dans le seul item dont l'enjeu est
une opposition de longueur, ce qui la rend d'autant moins souhaitable. La
longueur de náam dans ห้องน้ำ reste correctement établie par la ligne 16813,
`\hǿng¯nām`, et par les deux éditions de Wiktionary.

### N3. L'exercice 1 décrit un dispositif que ses propres tirages démentent

Le champ « Ce qu'il mesure » affirme : « La question est identique d'un tirage à
l'autre à un mot près, et ce mot est le premier », et le feedback correct affiche
« Le reste ne change pas ». C'est faux pour les tirages 5 et 6, qui suppriment
en outre ที่. Un tiers des tirages contredit donc l'énoncé affiché, et le
feedback enseigne au passage une généralisation fausse.

### N4. Page 2 : l'ordre des sens du RID est inversé

Page 2 : « อยู่ sert à dire qu'une personne ou une chose est quelque part. Le
dictionnaire lui donne AUSSI les valeurs d'habiter et de rester ». Le contexte
de la page désigne le dictionnaire normatif, puisque la phrase suivante invoque
sa lecture [หฺยู่]. Or le sens (๑) du RID est précisément พัก, อาศัย, loger et
habiter ; la valeur locative « se trouver » n'est portée que par VOLUBILIS
(ligne 117905) et par en.wiktionary. La hiérarchie présentée à l'écran est donc
l'inverse de celle de la source nommée. Le champ `sources` de l'item 1, lui, est
exact.

### N5. Deux objectifs observables ne sont mesurés par aucun exercice

La Méta annonce que l'apprenant « reconstruit le bloc ... sur 3 assemblages sur
3 » et « complète une réponse en plaçant ที่นี่ ou ที่นั่น exactement là où la
question avait ที่ไหน, sur 3 cas sur 4 ». L'exercice `word_order` ne propose que
deux assemblages de question, tirages 1 et 2, et un seul cas de réponse, tirage 3. Aucun autre exercice ne mesure le placement de la case de réponse :
l'exercice 4 associe des énoncés déjà formés. Les seuils annoncés sont donc
inatteignables en l'état.

## 5. Points contrôlés et jugés sains, malgré la suspicion

- **Décomptes du dossier.** Les 16 requêtes RID, les 11 attestations, les 5
  absences, les 125 chaînes thaïes, les 9 séquences de `codepoints`, les 439
  apostrophes, les 12 graphies témoins et les 16 rangs de fréquence sont tous
  exacts. Aucun chiffre du dossier n'a été pris en défaut, à l'exception des
  trois numéros de ligne du finding B1.
- **Décompte total des lignes VOLUBILIS.** Les nombres de lignes NON VIDES se
  refont exactement, 118 571, 227 et 86. Les totaux annoncés, 118 573 et 257, ne
  se refont pas par la méthode décrite, qui donne une plage utilisée s'arrêtant
  à la dernière ligne pleine. L'écart tient probablement au périmètre retenu par
  le tableur pour la plage utilisée. Ce n'est pas un finding, la mesure qui
  sert aux références étant celle des lignes non vides, mais **la description de
  la méthode gagnerait à préciser comment le total est obtenu.**
- **Traitement du désaccord de catégorie sur ที่ไหน.** Le RID classe bien น.,
  VOLUBILIS `adv.`, en.wiktionary `Pronoun`. Le désaccord est réel et la
  décision de ne rien afficher est la bonne.
- **Retrait de l'étymologie sanskrite de สถานี.** Les deux éditions de
  Wiktionary la portent bien, le RID ne porte bien aucune étiquette étymologique
  à cette entrée, et le retrait pour cause de source unique est correct.
- **Retrait de ตรงไหน.** Ligne VOLUBILIS 109880 confirmée, absence au RID
  confirmée, 404 en.wiktionary confirmé. Le retrait est justifié.
- **Absence de `recall`.** Le motif tient : la seule chose que `recall`
  mesurerait ici est la convention de notation `aw` contre `aww`, qui repose sur
  la reconstruction de la clé `ǿ`.
- **Ton et longueur de tous les items.** Recalculés à la main, tous justes, y
  compris le ton haut de คะ en fin de question contre le ton descendant de ค่ะ
  en fin de réponse, que VOLUBILIS confirme aux lignes 30140 et 30141.
- **Corrigés des exercices 2, 3 et 4.** Ordres, particules et distracteurs sont
  tous corrects, à l'exception du feedback visé par B2.
- **Aucune information pratique de voyage.** À part l'affirmation d'usage
  relevée en B5, la leçon tient son engagement de ne rien dire de la
  signalétique, des lieux publics ni des usages sociaux.

## 6. Suite

- Statut : `draft` maintenu. Les sept findings bloquants doivent être résolus
  avant tout passage en `review`.
- B1 déborde de la leçon : les numéros VOLUBILIS hérités de l'unité 2 doivent
  être rejoués dans 3C, 3E, 4D et 4E.
- B7 impose une relecture de la Méta et des incertitudes contre l'état réel de
  l'unité 5, désormais complète en rédaction.
- B6 appelle soit une source de phonétique française recevable, à ajouter à
  `docs/content-policy/sources-verification.md`, soit une reformulation de la
  page 8 et de la `note_fr` de l'item 5.
- Le lot de contre-audit externe `unite-05/contre-audit-gpt56.md` reste à
  préparer, sans appel API facturable.
- Revue native : en attente, inchangé.

## 7. Suite donnée, ajoutée le 2026-08-03 après consolidation

Note ajoutée par le consolidateur de 5C. **Aucun finding, aucune preuve et
aucun verdict des sections 1 à 6 n'a été modifié** : le rapport d'audit reste
tel que son auteur l'a rendu, et seule la présente section est ajoutée, pour que
le lecteur du rapport sache où en est sa résolution.

- Les **12 findings** ont été traités dans `unite-05/lecon-5c.md`, section
  « Consolidation du 2026-08-03 : traitement des douze findings », qui donne une
  ligne par finding et le sort exact de chacun.
- Les **7 findings bloquants sont résolus** : B1 corrigé, B2 corrigé, B3
  supprimé, B4 référence retirée, B5 supprimé, B6 supprimé, B7 réécrit en trois
  passages. Les **5 non bloquants** sont également traités : N1 consigné, N2
  citation rétablie, N3 reformulé, N4 reformulé, N5 traité des deux côtés,
  seuils de la Méta et tirage supplémentaire.
- **Rien n'a été corrigé sur la seule foi de ce rapport.** Chaque fait contesté
  a été rejugé contre la source primaire avant correction : `VOLUBILIS.ods` relu
  après contrôle de son empreinte SHA-256, qui concorde, et entrées RID « ห้อง »,
  « ห้องแถว », « ห้องฟ้า », « สถานี », « อยู่ », « ที่ », « ที่ไหน », « ไหน »,
  « นี่ » et « นั่น » réinterrogées par requête POST directe. Les 12 findings
  sont **tous confirmés** par cette contre-vérification, y compris les trois
  numéros de ligne de B1 et le cinquième sens non naval de B4.
- Deux points du rapport ont conduit à une conclusion PLUS large que celle qu'il
  proposait : B1 a été tracé jusqu'à six leçons et deux dossiers hors unité 5,
  consigné à l'incertitude 10 de la leçon et **non corrigé depuis 5C** ; et B7,
  au-delà des trois passages visés, a aussi fait rouvrir les décisions de
  production sur ตลาด et โรงแรม.
- B6 n'a pas été reformulé mais **supprimé** : aucune source de phonétique
  française n'étant disponible dans l'inventaire, la piste « sourcer par une
  grammaire recevable » que proposait le rapport n'était pas ouvrable sans
  fabriquer une attestation. La prémisse a donc été retirée des quatre endroits
  où elle apparaissait, page 8, `note_fr` des items 5 et 7, et clôture de la
  page 10.
- Statut : `draft` maintenu, comme le demandait la section 6. Les portes encore
  ouvertes ne sont plus les findings mais la contre-vérification RID manuelle,
  le lot de contre-audit externe, l'audit d'accessibilité, la production audio,
  l'arbitrage de titre et la revue native.
- Revue native : en attente, inchangé.
