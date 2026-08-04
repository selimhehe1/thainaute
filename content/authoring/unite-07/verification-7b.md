# Contre-audit adversarial de la leçon 7B

- Cible : `content/authoring/unite-07/lecon-7b.md`, statut `draft`
- Date des relevés : 2026-08-03, tous refaits pour cet audit, sans réutiliser
  aucun relevé du dossier de production
- Posture : adversariale. Chaque affirmation du fichier a été traitée comme
  fausse jusqu’à preuve refaite. Les sources citées n’ont jamais été crues sur
  parole : chacune a été rouverte, et le RID a été interrogé directement pour
  toute question d’orthographe, de sens ou de ton.
- Résultat : **191 faits confirmés par relevé propre, 12 findings dont 6
  bloquants.**

## 1. Ce que la consigne d’audit demandait et qui n’existe pas

La consigne donnait priorité absolue au **tableau des marques de ton** de la
leçon 7A. Deux constats, tous deux vérifiés :

1. `content/authoring/unite-07/` ne contient que `lecon-7b.md`, `lecon-7c.md`,
   `lecon-7d.md` et `lecon-7e.md`. **Il n’existe aucun fichier 7A.**
2. **7B ne contient aucun tableau de marques de ton.** Son seul tableau est
   celui du dialogue. La page 5 fait exactement l’inverse d’un tableau : elle
   montre que le même signe ่ ou ้ ne suffit pas à donner le ton, et renvoie la
   règle à une leçon d’écriture ultérieure.

Le contrôle case par case demandé a donc été fait sur ce que 7B affirme
réellement du système tonal, c’est-à-dire la page 5 et les tons déclarés des
items. La règle sous-jacente a été rederivée à la main pour chaque syllabe, puis
recoupée sur les IPA de Wiktionary et sur la notation de ton de VOLUBILIS.

**La page 5 est juste.** บ้าน (บ, classe moyenne, + mai tho) et ห้อง (ห, classe
haute, + mai tho) donnent bien un ton descendant, น้ำ (น, classe basse, + mai
tho) donne bien un ton haut. Même signe, deux résultats : c’est exact, et la
leçon a raison de ne pas généraliser. Aucune case fausse à signaler, faute de
tableau à corriger.

## 2. Méthode et références reproductibles

- **RID 2554**, `POST https://dictionary.orst.go.th/func_lookup.php`,
  `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l’audit, une
  requête par graphie espacée de 1,4 s. **31 graphies interrogées le
  2026-08-03**, aucune définition reproduite ici.
- **VOLUBILIS.ods v26.2**, exemplaire local de 15 724 718 octets, SHA-256
  `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc`,
  `content.xml` de 379 601 910 octets, SHA-256
  `3072e4d3751371c01e385fd00a00c9699b21b881d7a113b94a9148057cfab0e7`. Relecture
  par parseur écrit pour cet audit, indépendant de celui du dossier.
- **Wiktionary**, éditions en et th, en rendu (`?action=render`), 20 pages.
- **Unicode 17.0**, `UnicodeData.txt`, 2 198 209 octets, SHA-256
  `2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c`.
- **FrequencyWords**, `th_50k.txt` 2018, 1 504 712 octets, SHA-256
  `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`, rangs
  recalculés ligne à ligne.
- Contrôles mécaniques du fichier de leçon par script : NFC, codepoints,
  typographie, `prettier --check`.

## 3. Findings bloquants

### B1. Page 3 donne un sens faux à ครัว

La page 3 écrit : « ครัว, la cuisine au sens de l’art de cuisiner ».

Quatre relevés disent le contraire, et le quatrième est le fichier lui-même :

- RID 2554, entrée « ครัว ๑ », relevée le 2026-08-03 : le premier sens est un
  bâtiment, une habitation **ou une pièce** servant à préparer la nourriture.
  C’est un lieu, pas une activité.
- VOLUBILIS ligne 39560 : ENG « kitchen ; kitchenette », FRA « cuisine [f] »,
  DOM `ARCHIT ; CULINA ; RID`. Le domaine architectural confirme le lieu.
- en.wiktionary « ครัว » : « kitchen », et l’étymologie de ห้องครัว est donnée
  comme ห้อง + ครัว (« kitchen »). th.wiktionary donne la même définition de
  lieu.
- L’item 4 du fichier écrit lui-même, dans son champ `sources`, que ครัว ๑ est
  « le bâtiment, la maison ou la PIÈCE servant à préparer la nourriture », et
  dans son `note_fr` que « ครัว employé seul désigne aussi la cuisine ».

La page 3 contredit donc à la fois les trois sources et l’item qu’elle
introduit. Un apprenant en sortira avec l’idée que ห้องครัว se décompose en
« pièce » plus « art de cuisiner », ce qui est faux, et cette lecture erronée
est renforcée par la carte SRS 02, qui demande de nommer le second morceau
**et son sens**. **Bloquant : sens faux affiché à l’écran.**

Correction possible sans toucher au reste : « ครัว, la cuisine, la pièce où l’on
prépare les repas », ou « ครัว désigne déjà le lieu de la cuisson ».

### B2. Le feedback de l’exercice 2 décrit une diphtongue qui n’existe pas

Feedback incorrect affiché : « `khroua` glisse d’un o vers un a ».

La diphtongue de ครัว est /ua̯/ : elle part de [u], pas de [o]. Trois preuves
internes et externes :

- l’item 4 du fichier déclare lui-même `ipa` /hɔŋ˥˩.kʰrua̯˧/ ;
- en.wiktionary et th.wiktionary donnent /kʰrua̯˧/, romanisation Paiboon
  `kruua` ;
- la convention `thainaute-fr` v1.1 écrit `ou` pour /u/ et `o` pour /o/. La
  transcription du projet, `khroua`, contient donc `ou`, et la description
  « d’un o vers un a » lit la transcription à rebours de la convention qui la
  produit.

**Bloquant : fait de prononciation faux, affiché à l’apprenant, dans le seul
exercice qui porte sur la discrimination des trois pièces.**

### B3. Le piège déclaré de l’exercice 2 est phonétiquement faux

Pièges connus, exercice 2 : « confondre `nawwn` et `náam`, dont les deux
voyelles sont longues et dont **seule la mélodie et la consonne finale
diffèrent** ».

Les deux voyelles sont bien longues, mais elles n’ont pas le même timbre :
/nɔːn˧/ contre /naːm˦˥/, ce que les champs `ipa` des items 3 et 5 du fichier
écrivent noir sur blanc, et ce que les transcriptions `nawwn` et `náam` montrent
à l’œil. Le timbre est même l’indice le plus saillant des trois.

Conséquence pratique, et c’est pour cela que ce n’est pas une coquette : cette
phrase est la description du piège que la recette audio devra reproduire. Elle
oriente l’enregistrement et la rédaction du feedback vers une opposition qui
n’est pas la bonne. **Bloquant : règle fausse.**

### B4. La note culturelle affirme un fait non sourcé sur les panneaux routiers

Première phrase de la note : « Sur les panneaux routiers de Thaïlande, บ้าน
revient constamment devant un autre mot. »

Les trois sources listées sous la note ont été rouvertes une par une. Aucune ne
porte sur les panneaux routiers :

- RID 2554, entrée « บ้าน » : la partie (๑) donne bien หมู่บ้าน, le village, et
  ถิ่นที่มีมนุษย์อยู่, le territoire habité. Rien sur la signalisation.
- VOLUBILIS ligne 3878 : entrée `n. prop.`, DOM `GEOG ; POLIT`, FRA « village
  de … (suivi du nom) ». Rien sur la signalisation.
- en.wiktionary « บ้าน » : sens « village » et « community », étymologie
  proto-taï au sens de village. Rien sur la signalisation.

Le fait « บ้าน désigne aussi le village » est solidement triple-sourcé et peut
rester. Le fait « on le voit constamment sur les panneaux routiers » n’est
sourcé nulle part, et l’adverbe « constamment » en fait une affirmation de
fréquence. La note se protège elle-même en déclarant plus bas qu’elle n’affirme
rien « d’une règle de translittération sur les panneaux », ce qui montre que
l’auteur avait vu le risque, puis l’a laissé dans la première phrase.
**Bloquant : fait non sourcé dans une note culturelle, alors que le contrat de
leçon exige que chaque fait culturel soit sourcé.**

La dernière phrase, « vous servira donc d’abord à lire une carte », est une
prédiction d’usage du même ordre et tombe avec la première.

### B5. Un absolu non sourcé sur le français, interdit par la section 1 bis

Item 6, `note_fr` : « Rien ne s’intercale entre le verbe et le lieu, alors que
**le français demande une préposition**. »

La seconde moitié est une affirmation générale sur le français, sans source et
sans reformulation vérifiable par l’apprenant. Elle est fausse comme absolu :
le français construit aussi des lieux sans préposition (« habiter Paris »,
« habiter une maison »). La section 1 bis de
`docs/content-policy/sources-verification.md` n’ouvre que deux portes, deux
sources indépendantes ou une observation que l’apprenant peut trancher
lui-même, et interdit explicitement l’absolu non sourcé. **Bloquant.**

Deux autres formulations relèvent de la même catégorie, moins fortes mais à
traiter en même temps : page 7, « parce que le français induit en erreur ici » ;
exercice 4, pièges connus, « insérer une préposition imaginaire entre le verbe
et le lieu, réflexe français direct ». L’incertitude 6, « le français par défaut
entend chambre comme la chambre à coucher », est du même type mais déjà signalée
comme à confirmer, ce qui la rend acceptable en l’état.

Reformulation conforme, sans perte pédagogique : « en français vous placez
« à » devant le lieu ; en thaï, rien ne se place entre le verbe et le lieu :
comparez ผมอยู่บ้าน et « je suis à la maison » ».

### B6. Une source est mal citée, et le fichier se contredit lui-même

Section « Sources de la composition ห้อง + X », point 2 : « th.wiktionary donne
la même étymologie pour ห้องน้ำ, « ห้อง + น้ำ », et **n’a pas de page propre pour
les deux autres** ».

Relevé du 2026-08-03, `https://th.wiktionary.org/wiki/ห้องนอน?action=render`,
HTTP 200 : la page existe, porte la section รากศัพท์ « ห้อง + นอน », la
การแบ่งพยางค์ annotée « ไม่ตามอักขรวิธี ; เสียงสระสั้น », la romanisation
ไพบูลย์พับบลิชชิง `hɔ̂ng-nɔɔn` et l’IPA /hɔŋ˥˩.nɔːn˧/. L’item 3 du même fichier
cite d’ailleurs cette page correctement.

Seul ห้องครัว est réellement sans page propre en th : la consultation renvoie le
contenu de ครัว, ce que j’ai confirmé (les deux pages rendent le même texte de
1 097 caractères).

L’erreur va dans le sens de la prudence, puisqu’elle sous-déclare une preuve
disponible, mais elle reste une affirmation fausse sur une source citée, en
contradiction directe avec un autre passage du même fichier. **Bloquant :
référence mal citée.**

## 4. Findings non bloquants

### N7. L’exercice 3 ne mesure pas ce qu’il déclare mesurer

Le fichier écrit : « Trois portent sur le verbe et trois sur le lieu, ce qui
interdit de réussir en ne surveillant qu’une seule chose. » Le tirage réel dit
autre chose :

| Tirage | Énoncé thaï            | Ce que les deux options opposent |
| ------ | ---------------------- | -------------------------------- |
| 1      | ผมอยู่บ้านครับ         | le verbe ET le lieu              |
| 2      | ผมไปห้องน้ำครับ        | le verbe                         |
| 3      | ดิฉันอยู่บ้านค่ะ       | le verbe                         |
| 4      | ห้องน้ำอยู่ที่ไหนคะ    | le nom de la pièce               |
| 5      | ห้องนอนอยู่ที่นี่ครับ  | le nom de la pièce               |
| 6      | ห้องครัวอยู่ที่นั่นค่ะ | ที่นี่ contre ที่นั่น            |

Trois écarts en découlent :

1. le tirage 1 viole la règle que l’exercice se donne deux lignes plus haut,
   « deux propositions françaises par tirage, qui ne diffèrent que sur un
   point » ;
2. le tirage 6 n’oppose ni le verbe ni le nom de la pièce, mais le couple
   déictique de 5C. L’objectif observable déclaré en Méta, « six phrases thaïes
   écrites qui n’opposent que ไป et อยู่ ou que le nom de la pièce », est donc
   faux pour ce tirage ;
3. surtout, **un apprenant qui ne lit jamais le verbe obtient 5 sur 6**, soit
   exactement le seuil de réussite déclaré. Stratégie : choisir toujours
   l’option qui dit « être », et trancher les tirages 4, 5 et 6 sur le lieu. Il
   ne rate que le tirage 2. Un seul des six énoncés thaïs contient ไป, ce qui
   rend le contraste indétectable par le plancher de hasard.

Correction minimale : remplacer le tirage 6 par un énoncé en ไป, et refaire les
options du tirage 1 pour qu’elles n’opposent que le verbe. Le seuil 5 sur 6
devient alors informatif.

### N8. La carte SRS 03 pose un critère que le vivier ne peut pas satisfaire

`srs-u07-l7b-03` exige que le tirage comporte « obligatoirement au moins deux
phrases en ไป et deux en อยู่, faute de quoi la carte se réussit en répondant
toujours la même chose ». Le raisonnement est juste, et il désigne précisément
le défaut de N7. Mais le vivier écrit dans la leçon ne contient **qu’un seul**
énoncé en ไป, celui du tirage 2. La carte est donc insatisfaisable en l’état, et
les deux points doivent être corrigés ensemble.

### N9. L’état des audits se trompe deux fois dans la même ligne

« Trois cibles prioritaires sont désignées par l’auteur : … et le décompte RID
incohérent, incertitude 6. »

- Le décompte RID **est cohérent**. Je l’ai recompté en interrogeant les 29
  graphies : 12 attestées retenues, 6 attestées exploratoires, 11 absentes,
  soit 18 et 11 pour 29 requêtes, ce que le dossier annonce exactement. Les six
  graphies dites exploratoires (รับแขก, นั่งเล่น, บ้านเรือน, น้ำ, คน, เมือง)
  sont bien attestées toutes les six, ce qui était le point faible potentiel du
  décompte.
- L’incertitude 6 ne porte pas sur le RID mais sur la glose française de ห้อง.
  Le RID, c’est l’incertitude 8.

Le point est mineur en soi, mais il envoie l’audit suivant chercher un problème
qui n’existe pas, et il détourne l’attention des trois findings bloquants
ci-dessus. À corriger.

### N10. La citation du RID pour ไป dit plus que la source

Item 7 : « vedette unique dont le premier sens est le déplacement qui s’éloigne
du locuteur, illustré par un exemple où le verbe est suivi directement d’un nom
de lieu, sans préposition, **et par un second du même type** ».

Relevé du 2026-08-03 : l’entrée « ไป » est bien une vedette unique, et son
premier exemple est bien เขาไปตลาด, verbe suivi directement d’un nom de lieu.
Le second exemple donné à la suite est เขาเข็นเรือไม่ไปเพราะเรือเกยตื้น, qui ne
comporte aucun nom de lieu. Le seul autre exemple de type verbe plus lieu de
l’entrée est เขาเดินไปโรงเรียน, et il illustre explicitement l’emploi de ไป
**comme élément accolé à un verbe pour marquer la direction**, après เดิน, ce
qui n’est pas la construction enseignée.

Le fait enseigné reste vrai et doublement sourcé, par เขาไปตลาด et par VOLUBILIS
ligne 68037. Seule la phrase « et par un second du même type » doit tomber.

### N11. « la cabine d’un navire » ajoute au classeur ce qu’il ne dit pas

Item 3 et section « Ce que la leçon ne prétend PAS » : le second sens de
ห้องนอน serait, chez VOLUBILIS, « la cabine d’un navire ». La ligne 16823,
relue le 2026-08-03, porte ENG « cabin » et FRA « cabine [f] », sans domaine
maritime ni aucune autre précision. La restriction au navire est une lecture du
dossier, pas une donnée de la base.

### N12. La conformité v1.1 est déclarée vérifiée alors qu’un graphème reste non ratifié

L’état des audits déclare « Conformité de la transcription à la convention
`thainaute-fr` v1.1 : VÉRIFIÉE ». Le contrôle est juste sur tout ce que la
convention couvre : les huit transcriptions n’emploient l’accent que pour le
ton, le portent sur la première lettre du noyau, et notent la longueur par
doublement, `aw` bref contre `aww` long. Je l’ai revérifié caractère par
caractère, y compris en décomposition NFD : seuls U+0300, U+0301, U+0302 et
U+030C apparaissent, jamais sur une qualité vocalique.

Mais `khroua` repose sur le graphème `oua` pour /ua/, que l’amendement v1.1 ne
définit pas : sa règle 3 ne nomme que `ai` et `ao`. `u06-l6d` déclare
explicitement, à son incertitude 2, que `oua` est « une extension proposée par
`u03-l3d` … non ratifiée par un amendement de `CONVENTIONS.md` » et que la
transcription de ครอบครัว devra être refaite si la consolidation la refuse. 7B
réemploie le graphème, hérite du risque, et ne le reporte nulle part.
À porter aux incertitudes de 7B et à la consolidation de l’unité.

## 5. Observations secondaires, sans finding

- **Balayage Unicode.** L’état des audits annonce « aucun caractère hors latin,
  ponctuation courante, plage thaïe et symboles de l’API, les trois seuls signes
  signalés par le balayage étant U+0254, U+0255 et U+0294 ». Mon inventaire
  complet du fichier trouve aussi U+2194 « ↔ » cinq fois, dans les paires de
  l’exercice 1, ainsi que U+00B0, U+00AF et U+01FF. La flèche n’est ni latine,
  ni de la ponctuation courante, ni thaïe, ni un symbole de l’API. La phrase est
  donc trop absolue ; le fond, lui, est sain.
- **Vocabulaire des champs `longueur`.** Le fichier mélange « brève » et
  « courte » pour la même notion, parfois dans un même champ (item 7 : « pai
  courte … hâwng brève »). Le contrat d’item de `CONVENTIONS.md` fixe
  « courte, longue ». Uniformiser à la compilation.
- **Naturalité du dialogue.** Le dossier déclare que la seule extension de
  patron qui mérite discussion est [personne] + อยู่ที่ไหน. L’emploi de บ้าน
  sans possessif dans บ้านไกลไหมคะ est une seconde extension, non déclarée. Elle
  n’est pas fausse, mais elle relève du même jugement d’usage et devrait rejoindre
  la liste soumise à la revue native.
- **Brièveté de ห้อง.** L’incertitude 2 est honnête et reste entière. J’ajoute un
  élément qui la renforce sans changer le décompte de jambes : l’annotation
  « ไม่ตามอักขรวิธี ; เสียงสระสั้น » figure aussi sur la page th de ห้อง
  elle-même, pas seulement sur celle de ห้องน้ำ, et en.wiktionary annote de même
  « Unorthographical ; Short » sur ห้อง, ห้องนอน, ห้องครัว et ห้องน้ำ. Cela reste
  un seul écosystème, donc une seule jambe.

## 6. Ce que j’ai confirmé moi-même

191 faits, tous relevés le 2026-08-03 pour cet audit.

### Ton et longueur, rederivés à la main puis recoupés (24)

Classe de la consonne initiale, marque de ton, type de syllabe, puis contrôle
sur l’IPA de Wiktionary et sur la notation VOLUBILIS.

- descendant : บ้าน (บ moyenne + mai tho), ห้อง (ห haute + mai tho), ค่ะ (ค basse
  - mai ek), ไม่ (ม basse + mai ek) ;
- haut : น้ำ (น basse + mai tho), ครับ (ค basse, syllabe fermée brève), คะ (ค
  basse, syllabe brève) ;
- moyen : นอน, ครัว, ไป ;
- bas : อยู่ (อ conducteur de classe moyenne + mai ek ; le RID donne [หฺยู่]),
  ดิ ;
- montant : ผม, ฉัน, ไหม (ห conducteur).
- Longueurs : `bâan`, `nawwn`, `náam`, `yòuu` longues ; `hâwng`, `pai`, `phǒm`,
  `khráp`, `khâ` brèves. La brièveté de ห้อง est confirmée par les deux éditions
  de Wiktionary et corroborée par le `ǿ` de VOLUBILIS.

### RID 2554, 31 graphies interrogées (29)

- Attestées : บ้าน (deux parties, sens nominal jusqu’au village et au territoire
  habité), ห้อง (trois sens, le premier étant la partie d’un bâtiment séparée par
  des cloisons), ห้องน้ำ (แม่คำ ห้อง), นอน (premier sens : s’allonger pour se
  reposer), ครัว ๑ et ครัว ๒, อยู่ (quatre sens, exemples เขาอยู่บ้านหลังนี้ et
  วันนี้เขาอยู่บ้าน), ไป (exemple เขาไปตลาด), ที่ (sens ๘ prépositionnel,
  exemple อยู่ที่บ้าน), กลับ (exemple กลับบ้าน au premier sens), เรือน, ประตู,
  หน้าต่าง, รับแขก, นั่งเล่น, บ้านเรือน, น้ำ, คน, เมือง, ห้องโถง, ห้องชุด.
- Absentes : ห้องนอน, ห้องครัว, ห้องรับแขก, ห้องนั่งเล่น, ห้องอาหาร, ห้องเรียน,
  ไปบ้าน, อยู่บ้าน, อยู่ที่บ้าน, ที่บ้าน, กลับบ้าน.
- La liste ลูกคำ de ห้อง contient bien ห้องน้ำ et ne contient ni ห้องนอน ni
  ห้องครัว.
- Décompte du dossier recomputé et confirmé : 18 attestées, 11 absentes, 29
  requêtes.

### VOLUBILIS, 44 relevés (44)

- Les 21 lignes citées par le dossier portent toutes exactement le contenu
  annoncé : 3876 et 3878 (บ้าน et le toponyme), 16739 et 16740 (ห้อง et le
  classificateur), 16799, 16813, 16817, 16822, 16823, 16862, 39560, 43365,
  62506, 66352, 67993, 68006, 68007, 68037, 81679, 105222, 117905, 117906,
  117970, 118281.
- Les douze graphies témoins de la clé `ø` contre `ǿ` concordent toutes.
- Les quatre lignes témoins d’exemplaire concordent : 15033, 16554, 52937, 38457.
- Décomptes de lignes non vides identiques à ceux du dossier : `Volubilis`
  118 571, `Codes` 227, `Romanization` 86.
- 3 385 lignes portent `ǿ` en colonne `ThaiPhon`, chiffre identique.
- **En-tête : 41 colonnes dont une sans intitulé, en position 31, entre
  `LANG_VIE` et `LANG_RUS1`.** Le relevé du dossier est exact, y compris sur la
  colonne muette. Il a fallu corriger mon propre parseur pour l’établir, les
  cellules vides autofermantes faisant disparaître la colonne.
- Les deux empreintes SHA-256 sont identiques à celles consignées.

### Wiktionary, 25 relevés (25)

- IPA confirmés : /baːn˥˩/, /hɔŋ˥˩/, /hɔŋ˥˩.nɔːn˧/, /hɔŋ˥˩.kʰrua̯˧/,
  /hɔŋ˥˩.naːm˦˥/, /nɔːn˧/, /kʰrua̯˧/, /juː˨˩/, /paj˧/.
- Étymologies confirmées mot pour mot pour les trois composés.
- Classificateurs déclarés confirmés : ที่, บ้าน, หลัง, แห่ง pour บ้าน ; ห้อง
  pour ห้อง, ห้องนอน et ห้องครัว.
- Les quatre absences déclarées sont réelles : อยู่บ้าน, ที่บ้าน, ไปบ้าน et
  ไปห้องน้ำ renvoient HTTP 404 en en. La page en de บ้าน porte bien อยู่บ้าน et
  ที่บ้าน dans ses termes dérivés, et ne porte pas ไปบ้าน.
- th de ห้องครัว rend bien le contenu de ครัว.

### Unicode, 24 relevés (24)

Les 23 caractères cités sont exacts, noms normatifs et classes combinatoires
comprises, dont `0E49;THAI CHARACTER MAI THO;Mn;107`,
`0E48;THAI CHARACTER MAI EK;Mn;107`, `0E39;THAI CHARACTER SARA UU;Mn;103` et
`0E31;THAI CHARACTER MAI HAN-AKAT;Mn;0`. L’empreinte du fichier concorde.

### Fréquence, 20 relevés (20)

Les 19 rangs et occurrences cités sont exacts au token près, y compris
l’absence de ห้องรับแขก des 50 000 premiers tokens, et l’empreinte du fichier
concorde. L’écart entre ไปบ้าน (rang 49 549, 8 occurrences) et กลับบ้าน
(rang 1 582, 246 occurrences) est réel, ce qui soutient la reformulation
assumée de la consigne, incertitude 1.

### Fichier et cohérence de parcours (29)

- Les 8 champs `codepoints` sont exacts, recalculés depuis les champs `thai`,
  l’item 8 sur ses deux graphies, 30 points de code au total.
- Fichier stable en NFC ; 118 chaînes thaïes distinctes, 0 instable.
- 0 tiret cadratin, 0 demi-cadratin, 0 apostrophe droite, 0 guillemet droit,
  436 apostrophes typographiques. `prettier --check` passe.
- Les 12 transcriptions reprises de leçons publiées le sont mot pour mot :
  `hâwng·náam`, `yòuu`, `pai`, `phǒm pai tà·làat khráp`, `sǎwwng`,
  `khàwwp·khoun`, `toua`, `khrâwwp·khroua`, `klai mǎi`, `mâi klai`,
  `yòuu thîi·nǎi`, `phǒm`.
- Les six champs réemployés de l’item ห้องน้ำ sont identiques à ceux publiés par
  `u05-l5c`.
- นก est bien un personnage féminin et ต้น masculin dans `u02-l2e`, ce qui rend
  l’accord des particules du dialogue correct.
- Les 19 corrigés des quatre exercices et les quatre répliques du dialogue sont
  justes, et tous les distracteurs sont réellement faux.

## 7. Verdict

La leçon est solide sur ce qui est le plus difficile à vérifier : ses tons, ses
longueurs, ses codepoints, ses lignes de classeur, ses rangs de fréquence et
ses absences déclarées sont tous exacts, souvent au caractère près. Le dossier
de production est d’une honnêteté inhabituelle, y compris quand il consigne ce
qui manque.

Les défauts sont ailleurs, et ils sont réels : une glose fausse à la page 3, deux
descriptions phonétiques fausses dans l’exercice 2, un fait culturel non sourcé,
un absolu non sourcé sur le français, une source mal citée, et un exercice dont
le seuil de réussite peut être franchi sans lire ce qu’il prétend mesurer.

**Passage en `review` refusé tant que B1 à B6 ne sont pas corrigés.** N7 et N8
doivent être traités ensemble avant la production audio, puisqu’ils changent le
vivier de l’exercice 3.
