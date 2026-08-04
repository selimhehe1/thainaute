# Contre-audit adversarial de `unite-07/lecon-7c.md`

- Date : 2026-08-03
- Auditeur : agent indépendant, consigne adversariale (chercher des erreurs,
  ne rien confirmer sur parole)
- Fichier audité : `content/authoring/unite-07/lecon-7c.md`, statut `draft`
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` (v1, amendements
  v1.1 et v1.2, arbitrage v1.2) et `docs/content-policy/sources-verification.md`
  (dont la section 1 bis sur la phonétique du français)
- Méthode : aucune source citée par le fichier n'a été crue sur parole. Chaque
  requête RID a été refaite, chaque page Wiktionary re-téléchargée, le classeur
  VOLUBILIS ré-extrait et relu ligne par ligne, les rangs de fréquence
  recalculés, les empreintes SHA-256 recomputées, `UnicodeData.txt` relu, et
  les renvois internes au dépôt rouverts fichier par fichier.

## Avertissement sur le périmètre de la mission

La consigne reçue demandait en « priorité absolue » de vérifier case par case
le TABLEAU DES MARQUES DE TON de la leçon 7A. Ce fichier est 7C, et
`content/authoring/unite-07/` ne contient pas de `lecon-7a.md` au moment de
l'audit (seulement `lecon-7b.md`, `lecon-7c.md`, `lecon-7d.md`,
`lecon-7e.md`). 7C ne contient aucun tableau des marques de ton : elle
s'appuie sur ceux déjà publiés par `u04-l4a` et `u06-l6a`.

Les deux seules cases de marque de ton sur lesquelles 7C s'appuie réellement
ont donc été vérifiées au dictionnaire, et elles sont JUSTES :

- **consonne BASSE + ไม้โท (้) + syllabe vivante → ton HAUT.** Vérifié sur
  เช้า : le RID donne la lecture entre crochets [ช้าว], en.wiktionary et
  th.wiktionary donnent /t͡ɕʰaːw˦˥/, VOLUBILIS ligne 7626 donne `¯chāo` (`¯`
  = ton haut dans la notation du classeur). Concordant avec les items publiés
  ม้า `máa` et ค้า `kháa` de `u01-l1d`, mêmes conditions.
- **consonne BASSE + ไม้เอก (่) + syllabe vivante → ton DESCENDANT.** Cette
  case n'est pas employée par 7C ; elle est cohérente avec ชื่อ `chûee`
  (`u06-l6a`, page 10) et ค่ะ `khâ` (`u01-l1e`).

La troisième ligne du tableau de `u06-l6a` (basse + vivante + sans marque →
ton MOYEN), dont 7C dépend pour เย็น, วัน et ตอน, a été relue dans
`u06-l6a` page 9 et vérifiée mot à mot : elle est exacte.

## Décompte

- **142 faits distincts re-vérifiés par l'auditeur et confirmés.**
- **12 findings**, dont **5 bloquants**.

Répartition des 142 : 24 faits RID (14 requêtes refaites), 34 faits
Wiktionary (12 pages + 5 états de titre par l'API), 20 faits VOLUBILIS
(empreinte, décomptes, 16 lignes citées avec leurs colonnes), 13 faits de
fréquence (empreinte + 12 rangs), 23 faits Unicode (nom, catégorie générale et
classe combinatoire des 23 caractères des items), 13 contrôles NFC et
codepoints, 15 renvois internes au dépôt.

## Ce que l'audit confirme, et qui est solide

Ce dossier est, sur sa partie mesurable, d'une exactitude inhabituelle. Tout
ce qui suit a été refait indépendamment et concorde au caractère près.

**RID.** Les quatorze requêtes ont été refaites depuis Node.js avec
`URLSearchParams` (le shell de cette machine détruit bien le thaï : j'ai
reproduit l'incident, une graphie passée par `$'\u...'` en Git Bash arrive
mutilée et le RID répond « mot introuvable » sans erreur apparente ; l'avoir
consigné était juste). Concordent exactement : les deux vedettes de เช้า avec
la lecture [ช้าว], l'intervalle ๖.๐๐-๙.๐๐ étendu jusqu'à เที่ยง, les trois
sens ว. dont มาแต่เช้า, le panier กระเช้า de เช้า ๒, les ลูกคำ เช้าตรู่ et
เช้ามืด ; les deux vedettes de เย็น, l'intervalle ๑๖-๑๘ นาฬิกา, l'opposition
explicite à ร้อน, เย็นใจ, et les seize ลูกคำ (comptés : seize) ; les trois
vedettes de วัน, l'exemple เช้าขึ้นมาก็รีบไปทำงานทุกวัน, แมลงวัน et la forêt ;
les trois vedettes de ตอน et les quatre exemples de ตอน ๑ dont
ขอให้มาตอนเช้า et ตอนเหนือของประเทศไทย ; le titre groupé « ทุก ๑, ทุก ๆ » et
surtout le fait que son bloc ลูกคำ contient ทุกวันนี้ et ทุกวี่ทุกวัน mais PAS
ทุกวัน. Les trois absences annoncées (ตอนเช้า, ตอนเย็น, ทุกวัน) sont réelles,
réponse ไม่พบคำศัพท์ที่ต้องการค้นหา. สาย ๑ (๙.๐๐-๑๐.๐๐, entre เช้า et เที่ยง),
บ่าย (entre เที่ยง et เย็น), เที่ยง (quatrième sens, ๑๒ et ๒๔ นาฬิกา), ค่ำ
(début de l'obscurité), ตื่น et นอน : tous conformes.

**Wiktionary.** Les douze pages ont été retéléchargées en `action=render`.
Concordent au caractère près : /t͡ɕʰaːw˦˥/ et le respelling ช้าว, la note
d'usage 06:00-09:00 étendue à 12:00, l'étymologie 2 en /t͡ɕʰaw˦˥/ pour le
panier ; /jen˧/, « cold; cool; chill », l'antonyme ร้อน, « the period of time
from 4 p.m. to 6 p.m. » puis « (loosely) evening; late afternoon » ; /wan˧/,
le classificateur วัน, les étymologies mouche et forêt ; /tɔːn˧/, la section
Preposition et la citation datée de 2022 ชอบตัวเองตอนอยู่กับเธอ ;
/tʰuk̚˦˥/ ; /tɔːn˧.t͡ɕʰaːw˦˥/ avec `dtɔɔn-cháao` et `ton-chao` ;
/tɔːn˧.jen˧/ ; /tʰuk̚˦˥.wan˧/ avec l'exemple
เราเคยขับรถไปทำงานทุกวันแต่เดี๋ยวนี้ชอบขี่จักรยานไป. L'encadré « times of
day » donne bien สาง, รุ่ง, เช้า, สาย, เที่ยงวัน, บ่าย, เย็น, พลบ, ค่ำ, คืน,
เที่ยงคืน. Côté th : les IPA, ไพบูลย์พับบลิชชิง et ราชบัณฑิตยสภา annoncés,
la partition รากศัพท์ 1 adjectif / รากศัพท์ 2 nom de เย็น avec
เวลาใกล้ค่ำ ประมาณ 16-18 นาฬิกา, et l'équivalent français « jour » dans le
bloc คำแปลภาษาอื่น de วัน. L'API confirme ตอนเช้า → เช้า et ตอนเย็น → เย็น
comme redirections, ทุกวัน `missing`, ตอน et ทุก existants.

**VOLUBILIS.** Empreinte recomputée : 10 848 409 octets, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, identique.
Décomptes reproduits à l'unité : **586 541 chaînes partagées, 114 579 lignes
non vides**. Les seize lignes citées existent et portent exactement les valeurs
annoncées, colonne par colonne, y compris les points qui coûtent : `K=CALEND`
pour ตอนเช้า (105405) et ตอนเย็น (105763), colonne `K` vide pour ทุกวัน
(104096), donc trois items réellement adossés à des lignes qui ne recopient pas
le RID, et `-tøn` sans macron pour ตอน, ce qui justifie l'incertitude 5.

**Fréquence.** Empreinte de `th_50k.txt` identique, et les douze rangs
recalculés tombent tous juste : วัน 241, ตอน 992, ทุก 1006, ทุกวัน 2166,
เย็น 5357, ตอนเช้า 5544, เช้า 8619, ตอนเย็น 23461, ครับ 10, ไป 38, ผม 69,
ตลาด 26132.

**Unicode et NFC.** Les vingt-trois caractères des items sont exactement
vingt-trois ; noms normatifs, catégorie générale et classe combinatoire
concordent avec `UnicodeData.txt` (0E31 `Mn;0`, 0E47 `Mn;0`, 0E38 `Mn;103`,
0E49 `Mn;107`, 0E40 et 0E32 et 0E44 en `Lo`). Les huit champs `codepoints`
correspondent exactement au champ `thai` du même item, tout est en NFC, les
quatre phrases citées en prose aussi, et ผมไปตลาดตอนเช้าครับ compte bien
dix-neuf points de code. **Aucun tiret cadratin ni demi-cadratin dans le
fichier.**

**Renvois internes.** `u05-l5d` item 7 est bien ผมไปตลาดครับ avec le patron
annoncé et les transcriptions `phǒm pai tà·làat khráp` ; `u04-l4c` item 7 est
bien ขอข้าวผัดสองจานหน่อยครับ ; les tons publiés `khráp` haut et `rót` haut
justifient la comparaison de mélodie de ทุก ; `máa` et `kháa` sont bien dans
`u01-l1d` ; l'avertissement de `u04-l4a` page 6 sur เ แ โ ใ ไ est cité
littéralement ; la troisième ligne du tableau de `u06-l6a` page 9 et les deux
limites de sa page 10 sont exactes. Le contrôle « aucune de ces cinq graphies
n'est un item publié » en unités 1 à 6 est VRAI, et la liste des huit fichiers
qui les contiennent (`2a, 2b, 2e, 3a, 3c, 3d, 5b, 6d`) est exactement la bonne.

**Transcription.** `cháao`, `tawwn`, `thóuk`, `yen`, `wan` respectent v1.1 :
graphèmes `aw`/`ou`, doublement de longueur, marque de ton sur la première
lettre du noyau. Cohérents avec `khâao` (`u04-l4a`), `sǎwwng` (`u03-l3b`),
`khàwwp·khoun` et `khoun`, `thǒung` (`u03-l3a`).

**Section 1 bis.** La page 7 est conforme à la seconde voie : elle demande à
l'apprenant de dire deux phrases françaises et de juger lui-même, sans énoncer
aucun fait sur le français, sans « toujours » ni « jamais ». Aucune affirmation
absolue non sourcée sur le français dans le fichier.

## Findings

### F1 (BLOQUANT) : ตอนเช้า ne contient pas DEUX น

`note_fr` de l'item 4 : « Piège d'œil à connaître : ตอนเช้า contient DEUX น et
un เ au milieu ». C'est faux. ตอนเช้า = U+0E15 U+0E2D U+0E19 U+0E40 U+0E0A
U+0E49 U+0E32, soit **une seule** occurrence de U+0E19 NO NU. Le champ
`codepoints` du même item le démontre. C'est ตอนเย็น qui en contient deux
(U+0E19 en position 3 et en position 7). L'observation a été écrite sur le
mauvais bloc.

Le défaut n'est pas cosmétique : `note_fr` est affiché, et les « pièges
connus » de l'exercice 4 propagent l'erreur en parlant de « couper après le
**premier** น de ตอนเช้า », qui n'a pas de premier น au sens où il n'en a
qu'un. Un apprenant qui cherche deux น dans ตอนเช้า cherchera une frontière
qui n'existe pas, dans l'exercice même qui mesure la segmentation.

Correction : déplacer l'observation vers l'item 5 (ตอนเย็น), et donner à
l'item 4 le vrai piège d'œil, qui est le เ intercalaire.

### F2 (BLOQUANT) : « le thaï ne pose ni article ni préposition » est une règle fausse, contredite par les sources du fichier lui-même

Page 4 : « Pour dire "le matin" comme complément de temps, le thaï ne pose ni
article ni préposition : il pose ตอน (tawwn) ».

Les deux sources que l'item 4 cite pour ตอน classent précisément ce mot comme
une préposition, et exactement dans l'emploi temporel enseigné :

- VOLUBILIS ligne 105377, relue par mes soins : `H=prep.`, `F=at (+ time) ;
during ; when`, `G=à (+ heure) ; pendant ; durant` ;
- en.wiktionary, entrée « ตอน », section **Preposition** : « (colloquial)
  when; during; at (a point of time) ».

Le fichier cite lui-même ces deux lignes dans son propre dossier de sources.
L'écran affirme donc à l'apprenant le contraire de ce que le dossier a relevé.
S'y ajoute que c'est une règle générale sur le thaï, non sourcée, alors que
l'« Étage 1 » du dossier soutient que « la leçon n'énonce AUCUNE règle
générale ».

Correction possible sans perdre l'intention pédagogique : dire ce qui est
observable (« le thaï pose ตอน devant le moment, et rien d'autre entre les
deux »), sans nier une catégorie grammaticale que les sources attribuent.

### F3 (BLOQUANT) : « cháao monte » réintroduit la confusion haut / montant que `u04-l4a` avait explicitement combattue

Exercice 1, feedback de confusion ตอนเช้า / ตอนเย็น : « cháao monte et dure ;
yen reste à plat et s'arrête vite. »

`u04-l4a` page 9, publiée, oppose les deux contours dans ces termes : « Le
montant part bas et **remonte** sur toute la syllabe ; le haut est **perché dès
le premier instant et y reste**. » 7C décrit donc le ton HAUT de เช้า avec le
verbe que le parcours a réservé au ton MONTANT, dans le feedback d'un exercice
d'écoute, c'est-à-dire au moment exact où l'apprenant construit son image
mentale du contour. La leçon se contredit elle-même deux lignes plus bas, dans
ses « pièges connus », où elle met en garde contre « confondre la hauteur de la
voix du locuteur avec le ton haut de cháao ».

Le ton assigné à เช้า est juste partout ailleurs dans le fichier (haut). C'est
la description qui est fausse au sens du parcours, et elle est bloquante parce
qu'elle enseigne le mauvais contour dans un produit dont les cinq tons sont la
promesse centrale.

Correction : « cháao est perché et dure ; yen reste à plat et s'arrête vite. »

### F4 (BLOQUANT) : la note culturelle affiche un fait mono-sourcé

Note culturelle, texte apprenant : « Les autres arriveront plus tard, et vous
savez déjà comment elles se construiront : ตอน devant, comme pour ตอนเช้า et
ตอนเย็น. »

Le dossier n'apporte qu'UNE source : « La construction en ตอน pour les autres
tranches est attestée par la liste des termes dérivés de l'entrée "ตอน"
d'en.wiktionary ». La politique dit de Wiktionary « jamais en source unique »,
et le fichier lui-même traite les éditions en et th comme un seul écosystème.
Un fait affiché reste donc adossé à une source unique, ce que le contrat
d'item interdit.

La correction est à portée de main, et je l'ai vérifiée : le classeur
VOLUBILIS, dont l'empreinte est déjà consignée dans ce dossier, atteste les
mêmes constructions. Relevé par mes soins le 2026-08-03 sur l'exemplaire
`.xlsx` de SHA-256 `b9ab7418…` :

| Bloc      | Ligne  | Colonnes relevées                                                                   |
| --------- | ------ | ----------------------------------------------------------------------------------- |
| ตอนบ่าย   | 105394 | `C=-tøn _bāi`, `H=n. exp.`, `F=afternoon ; p.m.`, `G=après-midi [m, f]`, `K=CALEND` |
| ตอนสาย    | 105668 | `C=-tøn/sāi`, `H=adv.`, `F=late in the morning`, `G=en fin de matinée`              |
| ตอนค่ำ    | 105535 | `C=-tøn \kham`, `H=n. exp.`, `F=dusk ; sunset ; evening…`, `G=soir [m]`             |
| ตอนเที่ยง | 105700 | `C=-tøn\thīeng`, `H=n. exp.`, `F=noonday ; noon ; midday`, `G=midi`, `K=CALEND`     |

Ajouter ces quatre lignes lève le finding sans rien changer à l'écran.

### F5 (BLOQUANT) : « chacune bornée par ses voisines » fait dire au RID ce qu'il ne dit pas

Note culturelle, dernière phrase du bloc apprenant : « La journée est donc
décrite comme une suite de tranches emboîtées, **chacune bornée par ses
voisines**. »

Relevé RID refait, entrée par entrée : seules TROIS des six tranches nommées
sont définies par leurs voisines.

| Tranche | Définition RID relevée le 2026-08-03                 | Bornée par ses voisines ? |
| ------- | ---------------------------------------------------- | ------------------------- |
| เช้า    | เวลาระหว่างรุ่งสว่างกับสาย, ประมาณ ๖.๐๐-๙.๐๐ น.      | oui                       |
| สาย     | เวลาระหว่างเช้ากับเที่ยง, ประมาณ ๙.๐๐-๑๐.๐๐ น.       | oui                       |
| บ่าย    | เวลาในระหว่างเที่ยงกับเย็น                           | oui                       |
| เที่ยง  | ๑๒ นาฬิกา, point absolu, et ce n'est pas une tranche | non                       |
| เย็น    | เวลาใกล้ค่ำ ประมาณ ๑๖-๑๘ นาฬิกา, chiffres absolus    | non                       |
| ค่ำ     | เวลามืดตอนต้นของกลางคืน                              | non                       |

L'affirmation est présentée à l'apprenant comme une propriété du dictionnaire
normatif. Elle est fausse pour la moitié des entrées citées, et เที่ยง n'est
même pas une tranche mais un point. C'est une source mal citée sur un écran.

Correction : « Trois de ces tranches se définissent par leurs voisines, les
autres par l'heure ou par la lumière. »

### F6 (non bloquant) : le tableau du dossier classe เช้า « vivante » sans source, et contre ce que `u04-l4a` a dit à l'apprenant

Le tableau « Sources des tons et des longueurs » porte pour เช้า : `Syllabe =
vivante`. Aucune source du dossier n'établit cette classification, et
`u04-l4a` page 8, publiée, met explicitement la forme เ-า hors du champ de la
règle : « la règle ne couvre pas toutes les formes de syllabe. Celles qui se
terminent sur un k, un t ou un p, **et celles qui s'écrivent avec ไ, ใ, เ-า ou
-ำ**, comme ไก่ et ไข่, sont d'autres cas ; ne cherchez pas à les trancher
aujourd'hui. »

La cellule est phonologiquement juste (เช้า se ferme sur une semi-voyelle,
donc syllabe vivante), et le dossier n'en tire aucune prédiction, la colonne
« Prédiction » portant `AUCUNE`. La page 8 destinée à l'apprenant ne dit rien
non plus de la nature de la syllabe, ce qui est prudent. Mais le tableau
affirme un fait de classification que le parcours a différé et que le dossier
ne source pas, dans le seul tableau de tons du fichier. À sourcer ou à
remplacer par `non traitée à ce stade (u04-l4a, page 8)`.

### F7 (non bloquant) : la classe de ท n'est pas établie par `u06-l6a`

Dossier, « Sources des tons et des longueurs » : « La classe de ย, de ว et de
ท est établie par `u06-l6a` ». Faux pour ท. La page 7 de `u06-l6a` enseigne
sept lettres basses et ท n'en fait pas partie : ย, ร, ล, ว, ธ, ภ, ฮ. ท est
enseignée par `u05-l5a` (« ท = th, ทอ ทหาร (le soldat), la jumelle de ถ », et
le relevé อักษรต่ำ de son dossier).

Le fichier se contredit lui-même : ses prérequis disent, correctement,
« leçon 5A : les lettres basses ท et ช ». La classe attribuée (basse) est
juste ; c'est la référence qui est fausse.

### F8 (non bloquant) : ก est attribuée à `u04-l4a`, ต à `u03-l3a` ; les deux viennent de `u01-l1a`

Prérequis : « leçon 5A : les lettres basses ท et ช ; leçon 3A : ต et ถ ;
leçon 4A : ก ».

ก et ต sont deux des neuf consonnes moyennes publiées par `u01-l1a` (items 6 à
14, « ก จ ฎ ฏ ด ต บ ป อ »). `u04-l4a` le dit expressément dans son propre
feedback : « c'est l'une des neuf moyennes de 1A, ก จ ฎ ฏ ด ต บ ป อ », et sa
page 5 se présente comme « le deuxième groupe de lettres du parcours, après les
neuf moyennes de 1A ». `u04-l4a` enseigne les neuf consonnes HAUTES. `u03-l3a`
donne le nom de récitation ตอ เต่า et rappelle la classe de ต, mais ne
l'introduit pas.

Seul ถ est correctement attribué à 3A (`u04-l4a` page 5 : « Vous connaissez
déjà ถ depuis 3A »). Le point compte parce que 7C s'appuie sur ก pour déclarer
ทุก syllabe morte : le renvoi qui justifie cette lecture pointe vers la
mauvaise leçon.

### F9 (non bloquant) : la citation RID « วัน ๑, troisième sens » et « un quatrième sens est juridique » ne correspond pas à la numérotation du RID

L'item 3 et l'item 6 localisent l'exemple เช้าขึ้นมาก็รีบไปทำงานทุกวัน au
« troisième sens » de « วัน ๑ », et situent le sens juridique en quatrième
position. Relevé refait : le RID ne numérote que **deux** sens sous วัน ๑,
(๑) et (๒). L'exemple est dans (๑), et le sens juridique EST (๒).

La numérotation employée est en réalité celle de th.wiktionary, qui éclate la
même matière en quatre sens numérotés, dont le troisième est ช่วงเวลากลางวัน
illustré par cet exemple et le quatrième le sens (กฎหมาย). Une numérotation
d'une source a donc été importée silencieusement dans la citation d'une autre.
L'entrée, l'exemple et le fait sont exacts ; le localisateur ne l'est pas, et
un tiers qui chercherait « le troisième sens » au RID ne le trouverait pas.

### F10 (non bloquant) : quatre décomptes du dossier de production sont faux

Tous recomputés :

1. « le relevé de toutes les occurrences […] dans les **vingt-cinq** fichiers
   `lecon-*.md` des unités 1 à 6 » : il y en a **trente** (six unités de cinq
   leçons). La liste des huit fichiers réellement concernés est, elle, exacte.
2. « **Huit** pages relevées côté en, **huit** côté th » : côté th, cinq pages
   seulement existent pour ces huit titres, et le fichier le démontre lui-même
   deux lignes plus loin, puisqu'il constate que ตอนเช้า et ตอนเย็น y sont des
   REDIRECTIONS vers เช้า et เย็น et que ทุกวัน y est MANQUANTE. Vérifié par
   l'API : `redirects` sur ตอนเช้า et ตอนเย็น, `missing` sur ทุกวัน.
3. « les **quatre** variantes féminines citées en prose (ดิฉันไปตลาดตอนเช้าค่ะ,
   ดิฉันไปตลาดทุกวันค่ะ, ดิฉันไปตลาดตอนเย็นค่ะ) » : trois sont listées, et la
   quatrième phrase nommée juste après est masculine.
4. Incertitude 4 : « Il est **six fois** plus bas que celui de son symétrique
   ตอนเช้า ». Recalculé sur l'exemplaire dont l'empreinte est donnée : rangs
   23461 contre 5544, soit **4,23 fois** ; en occurrences brutes, 16 contre 71,
   soit **4,44 fois**. Aucun rapport ne vaut six.

Aucun de ces quatre chiffres ne change une conclusion linguistique, mais ils
figurent dans la section qui atteste des contrôles exécutés. Un dossier de
preuve dont les décomptes ne se reproduisent pas affaiblit ceux qui, eux, se
reproduisent, et le reste de ce dossier se reproduit remarquablement bien.

### F11 (non bloquant) : « une marque combinatoire orpheline » est faux, et contredit la section Unicode du même fichier

« Autres décisions de production », Rendu : « deux commencent par une marque
combinatoire orpheline au tirage 4 (`ดตอนเ`) ».

Le fragment `ดตอนเ` est U+0E14 U+0E15 U+0E2D U+0E19 U+0E40 : cinq caractères
de catégorie générale `Lo`, **aucune marque combinatoire**. Aucune des quatre
propositions du tirage 4 ne commence par une marque : ตอนเย็น commence par ต,
ดตอนเ par ด, เย็นครับ par เ, ผมไปตลาด par ผ.

La contradiction est interne : le point 1 de la section « Codepoints et
Unicode » insiste correctement, quinze lignes plus haut, sur le fait que
« U+0E40 est une LETTRE, pas une marque ». La vraie contrainte de rendu à
signaler à l'audit d'accessibilité est un เ initial ORPHELIN en fin de
fragment, sans sa consonne, ce qui est un problème réel mais différent.

### F12 (non bloquant) : l'« Étage 1 » affirme une discipline de formulation que les feedbacks démentent

« Sources de la place du bloc de temps », Étage 1 : « La formulation "le
complément de temps se place à la fin en thaï" aurait été une règle : elle est
absente du fichier, y compris de la Méta et des feedbacks d'exercice, **où
seule la forme "dans les phrases de cette leçon" est employée**. »

Relevé des feedbacks du fichier :

- exercice 2 : « ครับ et ค่ะ ferment la phrase, **toujours** : le moment passe
  avant elles » ;
- exercice 1, feedback correct : « c'est **toujours** là qu'il faut tendre
  l'oreille » ;
- exercice 4 : « ils ne font **jamais** partie du moment ».

Un seul feedback emploie effectivement la forme prudente annoncée (« Dans les
phrases de cette leçon, le moment attend que le lieu soit dit »). Le fait
sous-jacent sur les particules finales est, lui, correctement adossé aux items
publiés `u01-l1e`, `u02-l2d`, `u04-l4c` et `u05-l5d` : ce n'est donc pas un
fait faux, c'est l'auto-description du fichier qui est inexacte, dans la
section précise où il jure de sa prudence.

## Points mineurs, hors findings

- **`brève` contre `courte`.** `CONVENTIONS.md` fixe le vocabulaire du champ
  `longueur` à « courte, longue ». Les items 1 à 6 écrivent « brève », les
  items 7 et 8 « courte », dans le même fichier. Le dépôt est déjà partagé
  (184 « courte » contre 33 « brève » aux unités 1 à 6) : à trancher à la
  consolidation, pas contre 7C seule.
- **สวัสดี.** Le dialogue transcrit `sà·wàt·dii`, alors que l'item publié
  `u01-l1e` fixe `sawàtdii`. L'écart vient de la migration v1.1 non faite sur
  l'unité 1, et `u03-l3e` comme `u04-l4e` écrivent déjà `sà·wàt·dii`. 7C ne
  revendique pas cette transcription comme héritée, donc aucune fausse
  citation ; à réaligner à la consolidation de l'unité 1.
- **Exercice 4, tirages 5 et 6.** L'affichage promet « deux [propositions]
  chevauchent volontairement une frontière de mot » et `srs-u07-l7c-04` exige
  « au moins deux découpes distractrices chevauchant une frontière de mot à
  chaque tirage ». Aux tirages 5 (ทุกวัน / ตลาดทุกวัน / วันค่ะ / ดิฉันไป) et 6
  (ตอนเช้า / ตลาดตอนเช้า / เช้าค่ะ / ไปตลาด), une seule découpe coupe
  réellement un mot ; l'autre distracteur long est une concaténation de mots
  entiers. Les tirages 1 à 4 respectent le critère.
- **Méta.** « les autres tranches de la journée, สาย, เที่ยง, บ่าย, ค่ำ,
  กลางวัน et กลางคืน. La note culturelle les NOMME sans les enseigner. » La
  note culturelle ne nomme ni กลางวัน ni กลางคืน dans son texte apprenant ;
  ces deux formes n'apparaissent que dans le bloc de sources, que le fichier
  déclare par ailleurs non affiché.
- **Citation VOLUBILIS tronquée.** L'item 2 cite pour la ligne 112724
  `ENG « time before dusk ; late afternoon ; early evening ; evening ; dusk »`.
  La cellule réelle continue : `… ; dusk ; twilight ; gloaming`. Troncature
  sans marque d'omission dans une citation de champ.

## Conclusion

Le dossier de preuve de 7C est, sur tout ce qui est mécaniquement
reproductible, exact : empreintes, décomptes de classeur, numéros de ligne,
colonnes, rangs de fréquence, codepoints, NFC, classes combinatoires, et la
quasi-totalité des relevés RID et Wiktionary. Les cinq tons, les cinq classes
consonantiques et les cinq longueurs des items sont justes, et les trois
prédictions du tableau des tons se vérifient.

Les cinq findings bloquants ne portent pas sur la couche vérifiable : ils
portent sur ce que le fichier DIT à l'apprenant au-delà de ce qu'il a relevé.
Une graphie décrite de travers (F1), une règle grammaticale inventée contre ses
propres sources (F2), un contour de ton décrit avec le mot réservé à un autre
ton (F3), un fait affiché adossé à une seule source alors que la seconde
existe et n'a pas été cherchée (F4), et une généralisation prêtée au
dictionnaire que le dictionnaire ne fait pas (F5).

Les quatre premiers se corrigent chacun en une à quatre lignes, et pour F4 les
lignes VOLUBILIS manquantes sont fournies ci-dessus. Le fichier ne peut pas
passer à `review` avant leur résolution, en plus des deux conditions que
l'auteur s'était déjà fixées (incertitudes 1 et 3).

Revue native : en attente. Aucun locuteur thaï n'a lu ce fichier, et cet audit
ne remplace pas cette revue : il ne dit rien de la naturalité réelle des items
7 et 8, ni des répliques 3 et 4 du dialogue, que l'auteur a lui-même déclarées
comme des assemblages non attestés.
