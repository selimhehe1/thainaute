# Contre-audit adversarial de `lecon-6b.md`

- Date : 3 août 2026
- Fichier audité : `content/authoring/unite-06/lecon-6b.md`
- Posture : adversariale. Aucune source citée par la leçon n'a été crue sur
  parole. Chaque graphie, ton, longueur, IPA, sens, ligne de classeur, ligne de
  standard et rang de fréquence a été rouvert depuis la source primaire pendant
  cet audit.
- Verdict : **NE PASSE PAS en `review`**. 7 findings bloquants, 5 non bloquants.
- Revue native : en attente (inchangé).

## Avertissement sur la consigne d'audit

La consigne demandait de vérifier « la règle de ton de la classe basse énoncée
en 6A ». **Cette prémisse est fausse et il fallait le dire avant tout le reste.**

1. `content/authoring/unite-06/` ne contient aucun fichier `lecon-6a.md`. Le
   dossier ne contient que `lecon-6b.md`. Il n'existe donc pas de 6A.
2. Aucune leçon publiée du parcours n'énonce de règle de ton de la classe basse.
   `u04-l4a` page 8 dit que sa règle ne dit rien de la classe basse.
   `u05-l5a` page 11 le redit et son dossier écrit « Aucune règle de ton de la
   classe basse n'est enseignée ». `u05-l5d` page 7 fait de même.
3. `lecon-6b.md` ne l'énonce pas non plus, et sa page 8 est délibérément
   négative. Sur ce point précis, la leçon est conforme.

Il n'y avait donc aucune règle de classe basse à contrôler. En revanche la
page 8, qui est l'endroit où cette règle aurait dû se trouver, contient une
erreur de fait qui contamine bien la lecture du vocabulaire déjà enseigné. Elle
est le finding B1.

## Méthode de re-vérification

Tout a été refait dans cette session, sans réutiliser les scripts ni les relevés
de l'auteur.

- **RID 2554** : 23 requêtes POST sur `dictionary.orst.go.th/func_lookup.php`,
  paramètres `word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
  `x-requested-with: XMLHttpRequest`, agent utilisateur identifiant l'audit,
  requêtes espacées de 1,4 seconde. 23 réponses HTTP 200, 16 attestations et
  7 absences. Faits cités par référence, définitions non reproduites.
- **Wiktionary** : 24 pages en et th, en rendu (`action=render`) pour les blocs
  de prononciation et en wikitexte (`action=raw`) pour les définitions et les
  redirections. Les deux éditions comptent pour un seul écosystème.
- **VOLUBILIS.ods v26.2** : re-téléchargement inutile, le fichier local a été
  ré-empreinté puis reparsé par un parseur expat écrit pour cet audit, avec
  expansion de `table:number-columns-repeated` et de
  `table:number-rows-repeated`, numérotation remise à 1 par `table:table`,
  aucune normalisation Unicode.
- **Unicode 17.0** : `UnicodeData.txt` et `IndicPositionalCategory.txt` relus
  ligne à ligne.
- **FrequencyWords** `th_50k.txt` : rangs recalculés depuis le fichier.
- **Dépôt** : les 25 leçons publiées des unités 1 à 5 ont été relues pour
  contrôler chaque renvoi de prérequis.

## Ce qui a été confirmé par moi-même

70 faits vérifiés indépendamment et concordants. Résumé.

### Empreintes et décomptes reproductibles, tous exacts

| Contrôle                        | Annoncé par la leçon | Mesuré par l'audit           |
| ------------------------------- | -------------------- | ---------------------------- |
| `VOLUBILIS.ods` taille          | 15 724 718           | 15 724 718                   |
| `VOLUBILIS.ods` SHA-256         | `bb9c5da5…a094cc`    | identique                    |
| `content.xml` taille            | 379 601 910          | 379 601 910                  |
| `content.xml` SHA-256           | `3072e4d3…fab0e7`    | identique                    |
| Lignes non vides `Volubilis`    | 118 571              | 118 571                      |
| Lignes non vides `Codes`        | 227                  | 227                          |
| Lignes non vides `Romanization` | 86                   | 86                           |
| `th_50k.txt` SHA-256            | `20e7052f…1b6083`    | identique                    |
| Rangs de fréquence              | 19 rangs             | 19 rangs identiques, 0 écart |
| Lignes témoins unités 3 à 5     | 12                   | 12 concordantes              |

### Faits linguistiques confirmés

- Les tons et longueurs des 7 items simples, redérivés de l'orthographe thaïe
  puis recoupés à l'IPA Wiktionary et au marqueur `ThaiPhon` de VOLUBILIS :
  พ่อ, แม่, พี่ descendants et longs ; น้อง haut et long ; ชาย moyen et long ;
  สาว montant et long ; มี moyen et long. Aucun écart.
- Les 9 IPA de la table du dossier, plus les 8 composants de la phrase de
  l'item 8, tous retrouvés à l'identique sur en.wiktionary.
- Le fait central de la leçon est vrai : ni l'entrée « พี่ » ni l'entrée
  « น้อง » du RID ne comporte de mot de sexe. Le contrôle négatif a été refait
  sur les chaînes ชาย, หญิง, ผู้ชาย et ผู้หญิง, zéro occurrence dans chacune.
- Les 7 absences du RID sont réelles et je les ai reproduites : พี่ชาย, พี่สาว,
  น้องชาย, น้องสาว, พ่อแม่, คุณพ่อ, คุณแม่.
- Les listes de ลูกคำ citées sont exactes au mot près, pour « พี่ » comme pour
  « น้อง ».
- Le RID emploie bien les composés dans ses définitions de ลุง, ป้า et น้า.
- Les redirections Wiktionary de คุณพ่อ et de คุณแม่ sont réelles, dans les
  deux éditions, ce qui justifie le retrait des deux mots.
- La réserve de registre sur น้องสาว et น้องชาย est réelle, marquée สแลง côté
  th et `slang` côté en, dans les deux éditions.
- L'absence de la chaîne หนึ่งคน de la colonne `THA` de VOLUBILIS est réelle,
  0 occurrence sur 118 571 lignes.
- Toutes les lignes VOLUBILIS citées existent et portent bien la graphie
  annoncée, y compris les lignes voisines et la ligne 54400.
- Les 5 marqueurs de ton de la feuille `Codes` et les 14 lignes de la feuille
  `Romanization` sont exacts.
- Unicode : `IndicPositionalCategory-17.0.0.txt` porte bien
  `0E40..0E44 ; Visual_Order_Left` sur cinq caractères, et `0E47..0E4E ; Top`,
  ce qui valide la description de la pile de พี่ ; les noms, catégories
  générales et classes combinatoires des 23 codepoints cités sont exacts, dont
  U+0E35 `Mn;0` et U+0E48 et U+0E49 `Mn;107`.
- Contrôle du fichier refait : 112 chaînes thaïes distinctes, 112 stables en
  NFC, fichier entier stable en NFC, 9 déclarations `codepoints` recalculées et
  exactes, 0 écart, 0 tiret cadratin, 0 demi-cadratin, 0 apostrophe droite,
  488 apostrophes typographiques. Conforme à ADR-0022.
- Transcription : conforme à `thainaute-fr` v1.1. Les accents ne notent que le
  ton, ils tombent sur la première lettre du noyau, la longueur est notée par
  doublement, le séparateur est bien `·`. Les graphèmes `aai`, `aao`, `aww` et
  `aee` sont bien déjà employés par des leçons publiées.
- Les 19 renvois de prérequis pointent vers du matériel qui existe réellement :
  ปี et ปี่ en 1C, น้า et ม้า en 1D, ครับ et ค่ะ en 1E, แพง en 2A, คะ en 2B,
  ผม et ดิฉัน en 2D, สอง, สาม et แปด en 3B, คน et ปลาสองตัว en 3D, ชอบ en 4D,
  ไหม et ไม่, rót·mee en 5D, ส parmi les neuf hautes de 4A.
- Les corrigés des exercices 1, 2 et 3 sont justes, les distracteurs sont
  réellement faux, et les contraintes déclarées en Méta sont respectées, y
  compris « jamais deux fois de suite la même cible » et « les quatre mots tous
  cible au moins une fois ».

## Findings bloquants

### B1. Page 8 : « trois d'entre eux portent en plus une marque de ton » est faux

La page 8 écrit, à propos de พ่อ, แม่, พี่ et น้อง : « leurs initiales sont de
la classe basse, et trois d'entre eux portent en plus une marque de ton ».

**Les quatre en portent une**, et le fichier le prouve lui-même par ses propres
champs `codepoints` :

| Mot  | Marque de ton | Codepoint |
| ---- | ------------- | --------- |
| พ่อ  | mai ek        | U+0E48    |
| แม่  | mai ek        | U+0E48    |
| พี่  | mai ek        | U+0E48    |
| น้อง | mai tho       | U+0E49    |

La section Unicode du même dossier écrit d'ailleurs « Marque unique mais
critique sur น้อง et sur แม่ » et « Deux marques empilées sur พี่ ». Le dossier
sait donc que น้อง porte une marque, et la page d'enseignement dit le contraire.

Pourquoi c'est bloquant et non cosmétique : la page 8 est exactement l'endroit
où l'apprenant apprend à délimiter le domaine de la règle de 4A. Lui dire qu'un
des quatre mots est hors domaine par la seule classe basse l'invite à penser
qu'il existe un mot du jour sans marque, donc à chercher une prévisibilité qui
n'existe pas, et à mal rejouer 4A sur le vocabulaire déjà appris.

Correction : « et tous les quatre portent en plus une marque de ton ».

### B2. Note culturelle : le second axe de parenté est faux

La note écrit : « Quatre mots, deux axes : plus âgé ou plus jeune que votre
parent, et de quel côté. »

C'est faux, et c'est contredit par les définitions que la note vient elle-même
de citer trois lignes plus haut. Relevé RID du jour, cité par référence :

| Mot | Axe d'âge | Sexe             | Côté                            |
| --- | --------- | ---------------- | ------------------------------- |
| ลุง | aîné      | masculin, imposé | père **ou** mère, non distingué |
| ป้า | aînée     | féminin, imposé  | père **ou** mère, non distingué |
| น้า | cadet     | non distingué    | mère seulement                  |
| อา  | cadet     | non distingué    | père seulement                  |

Le second axe n'est pas le côté. Pour le couple aîné, le second axe est le
**sexe** et le côté n'est pas distingué. Pour le couple cadet, le second axe est
le **côté** et le sexe n'est pas distingué. La note enseigne donc une grille
symétrique qui n'existe pas.

Corroboration indépendante déjà présente au dossier et contredisant la note :
VOLUBILIS ligne 52850 glose ลุง « [frère aîné du père ou de la mère] » et ligne
67844 glose ป้า « [sœur aînée du père ou de la mère] », côté explicitement non
distingué dans les deux cas, colonne ENG « mother's older brother ; father's
older brother ».

Aggravant : la note est le seul endroit où la leçon généralise sa découverte à
la parenté élargie. Une grille fausse ici défait le bénéfice de la page 3.

### B3. Page 6 attribue au dictionnaire normatif une définition qu'il ne contient pas

La page 6 écrit : « Dans les quatre mots de la page 5, en revanche, le
dictionnaire ne les traite pas comme des mots ajoutés bout à bout : il définit
พี่สาว comme « le พี่ de sexe féminin » ».

Deux problèmes, et le second aggrave le premier.

1. **Mis-attribution.** La phrase précédente dit « le dictionnaire normatif ».
   « le dictionnaire » qui suit se lit donc comme le RID. Or j'ai reposé la
   requête : le RID renvoie « mot non trouvé » pour พี่สาว. Le dossier de la
   même leçon l'écrit noir sur blanc : « Le RID n'a d'entrée pour aucun de
   พี่ชาย, พี่สาว, น้องชาย et น้องสาว ». Le RID ne peut pas définir ce qu'il ne
   lexicalise pas. La leçon fait dire à l'autorité n° 1 une phrase qu'elle n'a
   jamais écrite, sur un écran d'apprentissage.
2. **Fait mono-sourcé.** La formulation vient de th.wiktionary, qui définit
   พี่สาว par « พี่ที่เป็นเพศหญิง ». L'item 5 le reconnaît : « C'est la source
   directe de la formulation de la page 6 ». Or en.wiktionary ne dit pas cela,
   il donne « big sister, elder sister ». Le dossier pose lui-même que les deux
   éditions et l'annexe sont « UN seul écosystème, jamais plusieurs sources
   indépendantes », et la politique interdit Wiktionary « en source unique ». Le
   fait tient donc sur une seule jambe.

Le dossier reproduit la même mis-attribution dans sa section « Le statut des
quatre composés » : « le dictionnaire lui-même définit พี่สาว comme le พี่ de
sexe féminin ».

Correction possible sans perdre le contenu : dire que le mot se comporte comme
un พี่ spécifié et non comme une addition, en l'attribuant à Wiktionary, ou
mieux, en le déduisant de l'emploi que le RID fait du composé dans les entrées
ลุง, ป้า et น้า, emploi que j'ai bien retrouvé et qui, lui, est solide.

### B4. Les « variantes régionales » de Wiktionary ne sont pas des variantes du thaï

L'item 2 écrit : « une variante régionale de Chiang Mai, /mɛː˦˨/, est signalée
et non enseignée ». L'item 4 écrit la même chose pour « une variante régionale
de Khon Kaen, /nɔːŋ˨˧˩/ ».

Vérification faite sur les pages th.wiktionary elles-mêmes :

- /mɛː˦˨/ ne figure pas dans la section ภาษาไทย. Il figure sous la section
  **ภาษาคำเมือง**, le kam mueang, langue du Nord, dont Wiktionary donne
  Chiang Mai comme dialecte de référence.
- /nɔːŋ˨˧˩/ figure sous la section **ภาษาอีสาน**, l'isan, dont Wiktionary donne
  Khon Kaen comme dialecte de référence.

Ce ne sont pas des variantes régionales d'un même mot thaï, ce sont les
prononciations d'autres langues, qui ont leur propre section, leur propre
étymologie et leur propre code de langue. Faire dire à la source qu'elle
« signale une variante régionale » du thaï est une mauvaise citation. Le fait
n'atteint pas l'écran, mais il est consigné dans un champ `sources`, c'est-à-dire
dans la pièce sur laquelle la porte de publication s'appuiera.

Incohérence connexe : la page th de พี่ porte exactement la même structure, avec
/piː˦˨/ sous ภาษาคำเมือง, et l'item 3 n'en dit rien. Le traitement n'est donc
même pas uniforme.

### B5. Le RID est mal cité sur le second emploi de พี่ et sur le premier de น้อง

L'item 3 écrit : « le second en fait un mot placé devant le nom d'une personne
d'âge comparable ». L'item 4 écrit : « signale l'emploi comme mot d'adresse pour
une personne d'âge comparable ».

Le RID ne dit pas « comparable ». Il dit, pour พี่, une personne dont l'âge est
celui d'un พี่, et pour น้อง, une personne dont l'âge est celui d'un น้อง. La
formule thaïe est construite sur คราวพี่ et sur คราวน้อง, c'est-à-dire sur la
tranche d'âge d'un aîné et sur celle d'un cadet.

Traduire les deux par « d'âge comparable » supprime précisément l'asymétrie qui
est le fait central de la leçon, et rend les deux emplois identiques alors qu'ils
sont opposés. La note culturelle, elle, écrit correctement « d'âge comparable à
celui d'un aîné » pour พี่, ce qui montre que la bonne lecture était disponible
et que les deux items la perdent.

### B6. L'incertitude 11 est fausse, et des absolus sur le français ne sont pas sourcés

L'incertitude 11 affirme : « Aucun énoncé sur la phonétique du français. Cette
leçon ne dit rien de ce que fait une bouche française. La section 1 bis de
`docs/content-policy/sources-verification.md` n'a donc pas eu à être mobilisée. »

C'est faux, et l'effet pratique est grave : cette déclaration invite l'audit à
sauter le contrôle 1 bis.

1. **Énoncé de phonétique française présent.** L'item 2, champ `note_fr` :
   « `aee`, le è ouvert du français, tenu ». C'est bien une affirmation sur la
   bouche française, elle identifie la voyelle thaïe แอ à une voyelle du
   français. Elle n'est appuyée par aucune des sources autorisées par la
   section 1 bis, et elle n'est pas reformulée en observation vérifiable.
2. **Absolu non sourcé sur un écran.** Note culturelle : « Le français, lui, dit
   « oncle » et « tante » et s'arrête là. » « S'arrête là » est un absolu, il
   n'est pas sourcé, et il est au moins discutable puisque le français dispose
   couramment de « oncle paternel » et « oncle maternel ». La section 1 bis
   proscrit explicitement cette catégorie d'énoncé.
3. **Absolu négatif non sourcé.** Exercice 2, pièges connus : le français « n'a
   pas de mot pour un frère ou une sœur sans préciser lequel ». Non sourcé.
4. Page 3 : « le français choisit d'abord le sexe », non sourcé. Celui-ci est
   récupérable en observation vérifiable par l'apprenant, qui est locuteur natif,
   ce que la section 1 bis autorise. Il suffit de le formuler ainsi.

Correction attendue : soit deux sources conformes à la section 1 bis, soit une
reformulation en observation vérifiable, et dans tous les cas une réécriture de
l'incertitude 11, qui doit cesser de déclarer le contrôle sans objet.

### B7. Exercice 4, tirage 4 : le corrigé rejette une réponse vraie

Tirage 4 : spécimen แม่ ; question « Cette personne est-elle née avant ou après
vous ? » ; options 1 Avant, 2 Après, 3 Le mot ne le dit pas ; réponse déclarée
correcte : 3.

Sous la question telle qu'elle est écrite, l'option 1 est factuellement vraie :
une mère est née avant son enfant. L'apprenant qui raisonne juste est marqué
faux, et reçoit le feedback « Relisez le mot en entier », qui ne répond pas à
son objection.

Ce que l'exercice veut mesurer est autre chose, et c'est légitime : il veut
savoir si l'apprenant applique la grille พี่ contre น้อง à un mot qui n'en
relève pas. Mais alors la question doit porter sur le mot et non sur la
personne, par exemple « Ce mot vous dit-il si la personne est née avant ou
après vous ? ». La réponse 3 devient alors la seule vraie et le tirage mesure
enfin ce qu'il annonce.

Ce tirage porte 1 point sur 4 d'un objectif observable déclaré en Méta, et il
contrevient à la règle produit « une erreur d'apprenant reçoit un indice, jamais
une punition », puisqu'ici il ne s'agit même pas d'une erreur.

## Findings non bloquants

### N1. IPA de l'item 8 : le ton de สอง est marqué deux fois

Le champ `ipa` de l'item 8 porte `sɔ̌ːŋ˩˩˦`. Le caron sur `ɔ` et la suite `˩˩˦`
notent la même chose. en.wiktionary donne `/sɔːŋ˩˩˦/`, sans caron, et les sept
autres syllabes du même champ n'emploient que les lettres de ton. À corriger en
`sɔːŋ˩˩˦` pour rester cohérent avec le champ, avec la source et avec les items
1 à 7.

### N2. Citations VOLUBILIS tronquées sans le signaler, et un TYPE mal rapporté

Les champs `FRA` sont donnés entre guillemets comme s'ils étaient complets. Ils
ne le sont pas. Relevé fait sur l'exemplaire dont l'empreinte est vérifiée :

| Ligne         | Cité par la leçon                              | Contenu réel non signalé                                                                    |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 75038 พ่อ     | se termine à « paternel [m] (fam.) »           | « ; vieux [m] (fam.) »                                                                      |
| 73507 พี่     | se termine à « amie (plus âgée) [f] »          | « ; [terme général pour désigner qqn de plus âgé] »                                         |
| 73527 พี่ชาย  | se termine à « frère [m] »                     | « ; frangin [m] (fam.) »                                                                    |
| 66453 น้องสาว | « soeur cadette ; petite soeur ; jeune soeur » | saute « soeur = sœur [f] ; soeurette [f] (fam.) » au milieu et omet « frangine [f] (fam.) » |
| 52850 ลุง     | « oncle [m] ; [frère aîné…] »                  | saute « tonton [m] (enf.) »                                                                 |

L'amendement v1.2 exige qu'un tiers puisse refaire la consultation à
l'identique. Une citation raccourcie sans marque de coupe ne le permet pas.

Second point, même famille : la note culturelle écrit que les lignes 73508,
73510, 66381 et 66382 sont « toutes marquées `pr.` ou `pr. pers.` ». La ligne
66381 porte `TYPE` = `n.`, avec « mademoiselle [f] ; jeune fille [f] ». Trois
sur quatre, pas quatre sur quatre.

### N3. « คนหนึ่ง y figure quatre fois » surinterprète le relevé

Le dossier oppose l'absence de หนึ่งคน à la présence de คนหนึ่ง « quatre fois,
lignes 17721, 36898, 38338 et 75324 ». J'ai confirmé l'absence de หนึ่งคน,
0 occurrence, ce qui est solide. Mais les quatre lignes citées ne sont pas des
entrées คนหนึ่ง : ce sont อีกคนหนึ่ง, คนใดคนหนึ่ง, ใครคนหนึ่ง et ผมคนหนึ่งละ.
VOLUBILIS n'a aucune entrée autonome pour คนหนึ่ง. Le contraste existe, mais il
est plus faible que la formulation ne le laisse croire, et la décision
pédagogique s'appuie donc sur un signal plus mince qu'annoncé. À reformuler en
« la chaîne apparaît dans quatre entrées composées ».

### N4. Contradictions internes de périmètre

Quatre, aucune fausse en soi, toutes gênantes pour la cohérence.

1. La section SRS écrit que พี่สาว et น้องชาย « ne sont jamais demandés en
   production à partir du sens français ». L'exercice 3, assemblage 3, donne
   pour cible française « J'ai deux sœurs aînées » et demande de produire
   ผม มี พี่สาว สอง คน ครับ. Les blocs sont fournis, mais la consigne part bien
   du sens français.
2. Les items 5 et 6 déclarent que ย et ว « ne sont pas enseignées ». Le feedback
   de l'exercice 1 dit pourtant à l'apprenant « ชาย finit sur un y, สาว finit
   sur un w ». La transcription de la leçon écrit `chaai` et `sǎao`, où
   l'apprenant ne voit ni y ni w. L'indice renvoie donc à quelque chose qu'il
   n'a ni appris ni sous les yeux.
3. La page 8 annonce « toutes leurs lettres » puis n'en liste que cinq, พ, ม, น,
   ง et อ. Elle omet แ, qui vient de 2A, ainsi que la voyelle ี et les deux
   marques de ton. L'exercice 4 reprend la même liste incomplète.
4. La page 4 écrit « Deux choses les séparent : le souffle du ph et la hauteur de
   la voix » à propos du trio ปี, ปี่, พี่. C'est vrai de ปี contre พี่ et de
   ปี่ contre พี่, mais faux du couple ปี contre ปี่, que seule la hauteur
   sépare. À reformuler par paire.

### N5. Points mineurs à corriger au passage

- Item 7 : « une trentaine de composés » pour มี. J'en compte 26 dans la liste
  des ลูกคำ. Écrire le nombre exact ou « plus de vingt ».
- Item 1 : พ่อ décrit comme l'un des mots les plus courants « après ครับ ». Le
  dossier mesure lui-même แม่ au rang 51 et พ่อ au rang 53, donc แม่ est aussi
  devant. Formulation à resserrer.
- Dossier, section des quatre composés : la définition d'âge de สาว est rendue
  par « d'environ quinze à trente ans ». Le RID écrit une borne ouverte vers le
  haut, littéralement quinze à trente ans **et au-delà**. Nuance à rétablir.
- Item 2 : « le macron y marque la longueur » est une inférence sur la
  romanisation VOLUBILIS, pas un relevé de la feuille `Romanization`, qui donne
  seulement le digramme `aē` pour แอ. À présenter comme inférence.

## Ce que l'audit n'a pas pu trancher

- La naturalité réelle de ผมมีพี่ชายสองคนครับ. La phrase est une composition de
  patrons publiés, ce que la leçon dit honnêtement à son incertitude 3. Aucune
  source autorisée ne l'atteste telle quelle et aucun corpus consultable ne
  permet de la mesurer. Reste ouvert jusqu'à revue native.
- Le rang 6713 de น้อง contre 165 pour พี่. J'ai confirmé les deux mesures sur
  l'exemplaire empreinté. L'écart reste inexpliqué, comme le dit l'incertitude 5,
  et il n'existe aujourd'hui aucune seconde liste de fréquence recevable pour
  l'arbitrer.
- L'audio, inexistant. Deux des quatre objectifs observables ne sont pas
  mesurables en l'état.
- La primauté manuelle du RID en orthographe reste une porte non franchie, comme
  le dit l'incertitude 9. Mon relevé est automatisé lui aussi.

## Conclusion

La partie mesurable de ce dossier est d'une qualité inhabituelle : empreintes,
décomptes, lignes de classeur, codepoints, rangs de fréquence et renvois au
parcours sont exacts sans exception, y compris là où l'auteur déclare ses
propres absences et ses propres réserves. C'est le socle vérifiable, et il tient.

Les sept findings bloquants sont d'une autre nature : ce sont des passages où le
texte rédigé va plus loin que ce que le relevé autorise, ou fait dire à une
source ce qu'elle ne dit pas. Trois d'entre eux atteignent l'écran de
l'apprenant, B1, B2 et B3, et deux enseignent une chose fausse, B1 et B2.

`draft` maintenu. `review` refusé tant que B1 à B7 ne sont pas résolus et que le
contre-audit externe et la contre-vérification RID manuelle n'ont pas eu lieu.
