# Contre-audit adversarial de `unite-03/lecon-3e.md`

- Date : 3 août 2026
- Auditeur : Claude Opus 5 (`claude-opus-5[1m]`), rôle adversarial
- Consigne : chercher des erreurs, ne rien confirmer sur la foi du dossier de
  production. Toute source citée a été re-interrogée ou recalculée.
- Fichier audité : `content/authoring/unite-03/lecon-3e.md` (975 lignes)
- Politiques appliquées : `content/authoring/CONVENTIONS.md`,
  `docs/content-policy/sources-verification.md`
- Verdict de l'audit : **NE PASSE PAS EN `review`.** 5 constats bloquants,
  7 constats non bloquants. 51 faits ont en revanche été confirmés
  indépendamment.
- **Suite donnée, 3 août 2026 : voir la section « Résolution » en fin de
  fichier.** 11 constats sur 12 ont été résolus dans `lecon-3e.md`. Un constat
  bloquant, B2, a été ÉCARTÉ après réexamen : il reposait sur un défaut du
  client HTTP de l'auditeur, non sur le fichier audité.

## Méthode

Rien n'a été repris du champ `sources` du fichier. Les contrôles effectués :

1. Séquences NFC et points de code recalculés caractère par caractère par script
   Node sur les 15 chaînes déclarées et sur les 116 suites thaïes distinctes du
   fichier.
2. Tons re-dérivés à la main par les règles classe de consonne / syllabe morte ou
   vive / longueur / marque de ton, AVANT toute consultation de source.
3. Les 19 URLs Wiktionary citées interrogées en HTTP ; le contenu de 9 d'entre
   elles récupéré et comparé verbatim aux citations du fichier.
4. RID interrogé directement sur `func_lookup.php` avec les paramètres
   documentés, en UTF-8 puis en TIS-620, avec en-têtes jQuery et Referer.
5. Transcriptions confrontées à la table `thainaute-fr` v1.1 (amendement du
   3 août), graphème par graphème.
6. Corrigés d'exercices recalculés depuis le thaï, distracteurs testés un à un.
7. Cohérence de corpus : `grep` sur 1A-1E, 2A-2E, 3A, 3B, 3C pour vérifier ce
   qui est réellement enseigné avant 3E.

Fait notable de contexte : au moment de la rédaction de 3E, l'unité 3 était vide.
Les leçons 3A, 3B et 3C existent désormais au dépôt (écrites après 3E). 3D
n'existe toujours pas. Plusieurs hypothèses consignées à l'incertitude 1 sont
donc désormais vérifiables, et trois se révèlent fausses.

## Constats bloquants

### B1. Ton faux : « เท่าไร et เท่าไหร่ se prononcent de la même façon »

Item 3, `note_fr` :

> La forme เท่าไหร่, très répandue à l'écrit courant, n'a pas d'entrée au RID et
> est étiquetée familière par en.wiktionary ; les deux se prononcent de la même
> façon.

C'est faux. Les deux formes diffèrent sur le ton de la deuxième syllabe.

- Règle recalculée : dans ไหร่, le ห est un ห นำ. Il fait passer ร (classe basse)
  en classe haute ; ไม้เอก sur une syllabe vive de classe haute donne le **ton
  bas**. Dans ไร, ร reste classe basse, syllabe vive sans marque : **ton moyen**.
- en.wiktionary, page récupérée le 2026-08-03, verbatim :
  `/tʰaw˥˩.raj˨˩/`, Paiboon `tâo-rài`. Contre `/tʰaw˥˩.raj˧/` pour เท่าไร.
- Volubilis, cité par 3C lignes 208 à 214 : THAIPHON `\thao_rai` pour เท่าไหร่
  contre `\thao-rai` pour เท่าไร. Le `_` note le ton bas, le `-` le ton moyen.
  Source indépendante de Wikimedia, elle confirme l'écart.
- 3C item 2 enseigne explicitement la différence : « À l'oral, la deuxième
  syllabe descend au ton bas au lieu de rester plate. »

Aggravant : la source invoquée est mal citée. 3E retient de en.wiktionary la
seule étiquette « colloquial » et tait l'IPA de la même page, qui contredit
frontalement l'affirmation. Trois sources indépendantes et une règle
d'orthographe élémentaire disent l'inverse de ce que la leçon publie.

**Correction** : supprimer « les deux se prononcent de la même façon ». Écrire
que เท่าไหร่ se prononce thâo·rài, seconde syllabe au ton bas, et aligner sur 3C.

### B2. Le relevé RID n'est pas reproductible, et deux décisions reposent sur des absences

Le dossier de production annonce : « 29 requêtes exécutées sur 29 mots distincts,
0 erreur de requête, 27 mots trouvés, 2 absents. »

J'ai réinterrogé `https://dictionary.orst.go.th/func_lookup.php` avec exactement
les paramètres documentés (`word`, `funcName=lookupWord`, `status=lookup`), et
constaté ceci :

- en UTF-8, le serveur renvoie `ผลการค้นหา "???"` : il reçoit le bon nombre de
  caractères mais les transcode en points d'interrogation ;
- en TIS-620, même résultat avec des caractères de remplacement ;
- avec `Content-Type: ...; charset=UTF-8`, `X-Requested-With` et `Referer`
  identiques à ceux du `$.post` de la page d'accueil, même résultat ;
- la réponse est `ไม่พบคำศัพท์ที่ต้องการค้นหา` (introuvable) pour **tous** les
  mots testés, y compris ไข่ et ฟอง, qui sont certainement au dictionnaire.

Conséquence directe : aujourd'hui, une réponse négative de ce point d'accès ne
porte **aucune information**. Or 3E fonde deux décisions publiées sur des
absences RID :

- item 3 et incertitude 2 : « La même requête, faite le même jour sur
  « เท่าไหร่ », ne retourne aucune entrée » sert à justifier le choix
  orthographique de la leçon ;
- item 14 et incertitude 7 : « requête faite le 2026-08-03 sur « สิบสาม »,
  aucune entrée retournée ».

Et les 27 résultats positifs, avec numérotation fine de vedettes (ไข่ ๑ et ๒,
ฟอง ๒ sur quatre, บาท ๒ sur quatre, คะ ๒, ขอ ๒ sur trois, สวัสดี en vedette
groupée), ne sont vérifiables par personne en l'état.

Je ne conclus pas que le relevé a été inventé : le point d'accès a pu répondre
plus tôt dans la journée et se dégrader depuis, ce que la politique de sources
anticipe déjà pour ce site. Je conclus que la preuve RID de cette leçon est
actuellement invérifiable, que l'argument par l'absence doit être retiré, et que
tout fait qui ne tient que par le RID redevient de fait mono-sourcé.

**Correction** : retirer les deux arguments par absence, ou les remplacer par la
contre-vérification manuelle déjà prévue à l'incertitude 12, effectuée avant
`review` et non après. Le choix orthographique de เท่าไร reste défendable, mais
il doit s'appuyer sur l'étiquette `RID` de la colonne DOM de Volubilis
(ligne 100805, présente) et sur l'étiquette « colloquial » de en.wiktionary,
pas sur une absence non probante.

### B3. Fait mono-sourcé : « ๓๐ correspond à 30 »

Note culturelle :

> Le chiffre thaï ๓๐ correspond à 30 : les deux éditions de Wiktionary donnent
> ๓๐ comme forme thaïe du numéral 30 dans les entrées « สามสิบ ».

Le fichier pose lui-même, dans son dossier de production, que « les deux éditions
sont traitées comme UN seul écosystème, jamais comme deux sources
indépendantes ». Le fait est donc publié sur une source unique, en violation de
la règle des deux sources indépendantes de `CONVENTIONS.md`.

Le fait est vrai, je l'ai vérifié : U+0E53 THAI DIGIT THREE, U+0E50 THAI DIGIT
ZERO. La correction est triviale mais elle est obligatoire.

**Correction** : ajouter `UnicodeData.txt` du standard Unicode, source déjà
autorisée par la politique et déjà employée en 3B pour les dix chiffres thaïs.

### B4. Fait de note culturelle affirmé sans aucune source

Note culturelle, dernière phrase :

> Trente bahts, le prix du dialogue, s'écrirait donc ๓๐ บ.

`CONVENTIONS.md` exige que dans une note culturelle « chaque fait » soit sourcé.
Celui-ci ne l'est pas, et il est douteux. Le fichier peut établir que ๓๐ vaut 30
et que บ. abrège บาท ; il n'établit à aucun moment qu'un prix de marché
s'écrirait en chiffres thaïs. Aucune source d'usage n'a été consultée, le dossier
de production le reconnaît d'ailleurs pour la fréquence et la naturalité
(incertitude 13). L'affirmation contredit en outre l'exercice 4 de la même leçon,
qui n'attend que des chiffres arabes.

**Correction** : supprimer la phrase, ou la réduire au fait sourcé (๓๐ vaut 30,
บ. abrège บาท) sans rien affirmer sur ce qui s'écrit sur un étal.

### B5. Règle sur-généralisée qui produit une forme fausse

Page 4 :

> Devant สิบ, le chiffre multiplie ; derrière สิบ, il s'ajoute.

Énoncée sans réserve, la règle est fausse pour l'unité 1 : elle conduit
l'apprenant à produire *สิบหนึ่ง pour onze, alors que la forme est สิบเอ็ด.

3B item 5 existe précisément pour cette irrégularité, et écrit : « Le mot ne
s'emploie jamais seul pour dire « un » : seul หนึ่ง le fait. » 3B item 6 fait de
สิบเอ็ด et ยี่สิบเอ็ด « les deux blocs à mémoriser ». 3E est le **bilan** de
l'unité : y réénoncer la règle sans son exception défait le travail de 3B.

**Correction** : ajouter la réserve, par exemple que la règle vaut pour deux à
neuf et que l'unité « un » garde la forme เอ็ด déjà vue en 3B.

## Constats non bloquants

### N1. Trois attributions de leçon fausses, désormais vérifiables

- Items 4 (สิบ) et 5 (สาม) : « réemploi, enseigné en **3A** ». 3A s'intitule « Le
  t qui souffle et les voyelles brèves » et ne contient aucun numéral parmi ses
  8 items (ตา, ทา, ตัด, ถัด, เตะ, แตะ, ติด, ถุง). สิบ et สาม sont enseignés en
  **3B**, items 1 et 2.
- Item 7 (บาท) : « réemploi, enseigné en **3B** ». 3B écrit à sa ligne 872 :
  « **บาท n'est pas enseigné dans cette leçon** ». บาท est enseigné en **3C**,
  item 3.
- La Méta répartit de même « les chiffres, les dizaines » sur 3A à 3D.

### N2. Le prérequis 3D n'existe pas, et le patron de classificateur non plus

La page 3 s'ouvre sur « Rappel de 3D » pour le patron nom + nombre +
classificateur. 3D n'existe pas au dépôt. Vérification faite sur 1A-1E, 2A-2E,
3A, 3B et 3C : aucune leçon n'enseigne ce patron. 3E l'introduit donc de fait.

Cela contredit deux affirmations de la leçon : « Items nouveaux : deux » et
« 100 % du lexique du dialogue a été enseigné en unité 1, en unité 2 ou en
unité 3, à l'exception des deux items nouveaux ». La structure elle-même est
nouvelle, et une structure s'apprend comme un item.

### N3. L'objectif observable n'est mesuré par aucun exercice

- « identifie le montant entendu parmi trois montants proches, dont สามสิบ et
  สิบสาม, au moins 3 fois sur 4 » : l'exercice 1 ne comporte que 2 tirages de
  montant sur 4, et l'un des deux (tirage 2) propose des options qui mêlent
  quantité et prix plutôt que trois montants. L'exercice 4 comporte bien
  4 montants mais en saisie libre, pas « parmi trois ».
- « il attribue chaque réplique à un homme ou à une femme » : mesuré une seule
  fois, au tirage 3.
- La carte `srs-u03-l3e-03` exige « 4 montants correctement transcrits sur 5 »
  alors que l'exercice qui l'alimente n'en produit que 4.

### N4. Distracteur ambigu, exercice 1 tirage 1

Sur l'audio ไข่เท่าไรคะ, l'option 2 « Elle demande combien d'œufs il reste » est
donnée comme fausse. Or เท่าไร signifie bien « combien ». Ce qui exclut l'option
2, c'est l'usage : une quantité d'objets se demande avec กี่ suivi du
classificateur, patron que 3C introduit justement à son item 4 (กี่บาท). Un
distracteur doit être faux, pas seulement moins idiomatique. Le point rejoint
l'incertitude 3 de la leçon, qui reconnaît que ไข่เท่าไร est un assemblage non
attesté.

### N5. Indépendance de sources surévaluée pour ฟอง

th.wiktionary reprend la formulation du RID et ses deux exemples. Vérifié
verbatim le 2026-08-03 : section คำลักษณนาม « ใช้เรียกไข่ และฟอง », exemples
ไข่ฟองหนึ่ง et ไข่ 2 ฟอง. Ce sont exactement les deux exemples que 3E attribue au
RID. th.wiktionary est donc ici un dérivé du RID, pas un recoupement indépendant.

3C signale ce piège pour บาท (« La formulation de cette section est très proche
de celle du RID : elle est comptée comme recoupement, pas comme autorité
indépendante »). 3E ne le signale pas pour ฟอง. L'indépendance tient malgré tout
grâce à Volubilis et en.wiktionary, mais le dossier surévalue son propre
sourçage.

### N6. Vocabulaire de champ non conforme à `CONVENTIONS.md`

- `longueur` doit prendre les valeurs « courte » ou « longue ». 3E écrit
  « brève » dans cinq items et dans tous les champs multisyllabiques. 3B écrit
  bien « courte ». La compilation vers `packages/content` échouera ou normalisera
  silencieusement.
- `litteral` de l'item 2 ne contient pas une traduction littérale mais une note
  d'emploi (« le mot désigne aussi la bulle, et, dans un emploi ancien, l'œuf
  lui-même »). Le contenu est juste et bien sourcé, mais il appartient à
  `note_fr`.

### N7. Faute de français dans la note culturelle

« sur une étale de marché » : il faut « un étal ». La page 1 et la scène du
dialogue écrivent correctement « un étal d'œufs ».

## Faits confirmés par mes propres contrôles

51 faits vérifiés indépendamment, sans reprendre le dossier de production.

### Unicode et graphie (17)

1 à 15. Les 15 séquences de points de code déclarées sont **exactes**, recalculées
caractère par caractère : ไข่, ฟอง, เท่าไร, สิบ, สาม, สามสิบ, บาท,
ขอไข่สิบฟองหน่อย (16 points de code, comptés), สวัสดี, ครับ, ค่ะ, คะ, ขอบคุณ,
นก, สิบสาม. Aucun écart.

16. Les **116** suites thaïes distinctes du fichier sont stables en NFC, y compris
    l'ordre ไ avant sa consonne dans ไข่ et la position de ไม้เอก dans ค่ะ.
17. Zéro tiret cadratin U+2014, zéro demi-cadratin U+2013, zéro U+2212, zéro
    U+2015. 266 apostrophes U+2019, zéro U+0027. La règle ADR-0022 est tenue.

### Tons, longueurs et IPA re-dérivés (11)

18. ไข่ ton bas : ข classe haute, ไม้เอก. IPA `/kʰaj˨˩/` cohérente.
19. ฟอง ton moyen : ฟ classe basse, syllabe vive fermée par ง, aucune marque. La
    justification donnée dans `note_fr` est exacte.
20. สิบ ton bas, brève : ส classe haute, syllabe morte à voyelle brève.
21. สาม ton montant, longue : ส classe haute, syllabe vive.
22. บาท ton bas, longue : บ classe moyenne, syllabe morte à voyelle longue.
23. ขอ ton montant, longue : ข classe haute, syllabe vive ouverte.
24. หน่อย ton bas, **voyelle brève** : ห นำ plus ไม้เอก. Confirmé par
    en.wiktionary, `/nɔj˨˩/` sans marque de longueur, et cohérent avec 2C.
25. ค่ะ descendant contre คะ haut : classe basse, syllabe morte brève, avec et
    sans ไม้เอก. La répartition enseignée (ค่ะ affirmation ou demande, คะ
    question) est correcte et correctement appliquée aux 8 répliques.
26. นก ton haut, brève.
27. ครับ ton haut, brève.
28. เท่าไร : thâo descendant, rai moyen. IPA `/tʰaw˥˩.raj˧/` cohérente.

### Contenu des sources, récupéré et comparé verbatim (9)

29. en.wiktionary ไข่ : `/kʰaj˨˩/`, Paiboon `kài`, et la ligne de classificateurs
    verbatim « (_classifier_ **ใบ** _or_ **ฟอง** _or_ **ลูก**) ». La citation de
    3E est fidèle.
30. en.wiktionary ฟอง : `/fɔːŋ˧/`, Paiboon `fɔɔng`, section Classifier verbatim
    « _Classifier for eggs and bubbles._ ». Fidèle.
31. th.wiktionary ฟอง : section คำลักษณนาม « ใช้เรียกไข่ และฟอง », exemples
    ไข่ฟองหนึ่ง et ไข่ 2 ฟอง. Fidèle (voir toutefois N5).
32. th.wiktionary ฟอง : le sens nominal « ไข่ » porte la marque
    « (ทางการ, ล้าสมัย) », formel et vieilli. Le champ `litteral` de l'item 2,
    « dans un emploi ancien, l'œuf lui-même », est donc exact et bien fondé.
33. en.wiktionary หน่อย : `/nɔj˨˩/`, voyelle brève. L'item 8 est correct.
34. en.wiktionary สามสิบ : `/saːm˩˩˦.sip̚˨˩/`, numéral 30, forme thaïe ๓๐, et une
    seconde étymologie « a kind of herb, _Asparagus racemosus_ Willd. ». Les
    trois éléments cités par 3E sont exacts, y compris la plante.
35. th.wiktionary สามสิบ : définition « จำนวน 30 คือ 10 สาม หน รวม กัน ». La
    formulation de la page 4 (« trois fois dix ») en découle légitimement.
36. en.wiktionary ฟ : « the 31st consonant letter of the Thai alphabet », « This
    letter belongs to the Thai low consonant class », nom ฟอ ฟัน, U+0E1F. Les
    quatre éléments cités sont exacts.
37. th.wiktionary บาท, รากศัพท์ 2 : « มาตราเงินตามวิธีประเพณี 100 สตางค์หรือ
    4 สลึง เท่ากับ 1 บาท » et « ชื่อมาตราชั่งตามวิธีประเพณี ... เท่ากับเงิน ทอง
    หรือนาก หนัก 15 กรัม ». La note culturelle est exacte sur les deux valeurs,
    sur les trois métaux, et a eu raison de laisser นาก non traduit.

### URLs (2)

38. Les **19** URLs Wiktionary citées répondent HTTP 200 le 2026-08-03. Aucune
    URL inventée, aucune page morte.
39. Le décompte du dossier de production est exact : 10 pages `en` et 9 pages
    `th`, soit 19 pages distinctes, plus le point d'accès RID.

### Corrigés et distracteurs (5)

40. Exercice 1 : les 4 corrigés sont justes (1, 1, 2, 1). Les distracteurs des
    tirages 2, 3 et 4 sont bien faux. Réserve sur le tirage 1, voir N4.
41. Exercice 2 : ขอ ไข่ สิบ ฟอง หน่อย ค่ะ est l'ordre correct, et ครับ est bien
    le seul élément à retirer. Les 7 éléments proposés sont cohérents.
42. Exercice 3 : corrigé 1 juste ; « Trente œufs pour dix bahts » et « Treize œufs
    pour trente bahts » sont bien faux.
43. Exercice 4 : 30, 13, 10 et 3 sont les quatre bonnes réponses.
44. Le corrigé de l'exercice 2 coïncide exactement avec la réplique 5 du
    dialogue, particule comprise.

### Transcription (3)

45. Les 16 transcriptions sont conformes à `thainaute-fr` v1.1 : `aww` pour /ɔː/
    long (fawwng, khàwwp, khǎww), `ai` pour /aj/, `ao` pour /aw/, `ou` pour /u/,
    `ii` et `aa` pour les longues, ton porté par la première lettre du noyau.
46. `awi` est bien la seule notation hors table, et elle est bien héritée de 2C,
    où elle est introduite et sourcée (2C lignes 18 à 22 et item 7). 3E ne crée
    aucun graphème, contrairement à ce qu'un bilan pourrait être tenté de faire.
47. Les numéros de ligne Volubilis sont cohérents d'une leçon à l'autre là où ils
    se recoupent : คะ 28944 (2B, 2D, 3C, 3E), ค่ะ 28945 (3C, 3E), ครับ 37006 et
    37007 (3C, 3E), บาท 4504 (3C, 3E), เท่าไร 100805 (3C, 3E). Ils sont en outre
    monotones selon un tri alphabétique latin sur la romanisation, ce qui est le
    tri attendu d'une base à pivot français.

### Cohérence de corpus (4)

48. ไข่ et ฟอง n'apparaissent dans **aucune** leçon antérieure. Les deux items
    sont réellement nouveaux.
49. La lettre ฟ n'apparaît dans aucun champ `thai` antérieur : ses deux
    occurrences au dépôt sont une citation de source en 2A et une note de
    convention en 2D. « Nouvelle à l'œil » est exact.
50. นก est bien enseigné en 2E, item 13. La réutilisation du personnage est
    correctement justifiée.
51. ขอ, หน่อย et le patron ขอ … หน่อย sont bien enseignés en 2C, items 5, 7 et 8.

## Ce qu'il reste à faire avant `review`

1. Corriger B1 (ton de เท่าไหร่) et aligner sur 3C.
2. Retirer les arguments par absence RID, ou exécuter la contre-vérification
   manuelle de l'incertitude 12 avant, et non après, le passage en `review`.
3. Sourcer ๓๐ sur `UnicodeData.txt` et supprimer l'affirmation d'usage sur
   « ๓๐ บ. ».
4. Ajouter la réserve เอ็ด à la règle de la page 4.
5. Corriger les attributions de leçon (3A vers 3B, 3B vers 3C) et trancher le
   sort de 3D avant la consolidation de l'unité.
6. Aligner les valeurs de `longueur` sur « courte / longue ».
7. Reprendre l'objectif observable ou les exercices pour qu'ils se mesurent
   réellement.
8. Corriger « une étale » en « un étal ».

Statut inchangé : `draft`. Revue native : en attente.

## Résolution

- Date : 3 août 2026
- Consolidateur : Claude Opus 5 (`claude-opus-5[1m]`), passe de consolidation
- Fichier modifié : `content/authoring/unite-03/lecon-3e.md`
- Règle appliquée : un fait contredit est corrigé s'il peut être re-sourcé
  réellement, sinon supprimé ; un fait mono-sourcé est re-sourcé par une source
  réellement consultée, sinon retiré ; aucune attestation n'est fabriquée pour
  satisfaire un constat.

### Constats bloquants

- **B1, ton de เท่าไหร่ : CORRIGÉ.** La page en.wiktionary de เท่าไหร่ a été
  récupérée à la consolidation et donne bien `/tʰaw˥˩.raj˨˩/`, Paiboon
  `tâo-rài`, respelling เท่า-ไหฺร่, « colloquial alternative form of เท่าไร ».
  L'affirmation « les deux se prononcent de la même façon » est supprimée et
  remplacée par l'écart de ton réel, la page est ajoutée aux sources de
  l'item 3, et la formulation est alignée sur 3C item 2.
- **B2, reproductibilité du relevé RID : ÉCARTÉ, constat non reproduit.** Le
  point d'accès `func_lookup.php` a été réinterrogé à la consolidation avec les
  paramètres documentés et un corps encodé en
  `application/x-www-form-urlencoded; charset=UTF-8`. Il répond normalement et
  en thaï. Huit mots ont été réinterrogés : ไข่ (deux vedettes, ไข่ ๒ étant bien
  un nom de bananier), ฟอง (quatre vedettes, ฟอง ๒ portant les deux exemples
  cités par la leçon), เท่าไร, สิบ (deux vedettes), สาม, บาท (quatre vedettes,
  บาท ๒ portant la subdivision monétaire, l'abréviation et les 15 grammes),
  สตางค์, et สามสิบ réduit à son renvoi botanique. Tous sont trouvés, avec
  exactement la numérotation de vedettes que le fichier annonçait, y compris
  ไข่ et ฟอง que l'audit disait introuvables. Les DEUX absences invoquées par la
  leçon, เท่าไหร่ et สิบสาม, sont elles aussi reproduites : le service renvoie
  son message d'absence. La prémisse du constat, « une réponse négative ne porte
  aucune information », est donc fausse à la date de la consolidation. Les
  arguments par absence des items 3 et 14 sont MAINTENUS, et le relevé de
  reproductibilité est versé au dossier de production de la leçon. Le constat
  est imputé à un artefact d'encodage du client HTTP employé par l'auditeur.
  Nuance conservée : la porte de contre-vérification MANUELLE du RID
  (incertitude 12) reste ouverte et n'est pas remplacée par ce réexamen.
- **B3, « ๓๐ vaut 30 » mono-sourcé : CORRIGÉ.** `UnicodeData.txt` a été
  téléchargé et interrogé localement ; les lignes
  `0E53;THAI DIGIT THREE;Nd;0;L;;3;3;3;N;;;;;` et
  `0E50;THAI DIGIT ZERO;Nd;0;L;;0;0;0;N;;;;;` sont citées verbatim. La page
  en.wiktionary du chiffre ๓ a été consultée en propre comme second signal. Le
  fait repose désormais sur deux autorités indépendantes, dont une hors
  écosystème Wikimedia.
- **B4, « s'écrirait donc ๓๐ บ. » : SUPPRIMÉ.** Aucune source d'usage ne
  soutenait cette phrase et aucune source de la politique ne permet de la
  soutenir. Elle est retirée. La note culturelle ne conserve que la valeur des
  signes. Une clause « ce qui n'est PAS affirmé » et une incertitude 15 gardent
  trace de ce qui n'a pas été mesuré.
- **B5, règle sur-généralisée : CORRIGÉ.** La page 4 restreint la règle à deux à
  neuf et renvoie à เอ็ด, enseigné en 3B items 5 et 6, en donnant สิบเอ็ด comme
  forme de onze. La page reste à quatre phrases.

### Constats non bloquants

- **N1, attributions de leçon : CORRIGÉ.** Vérifié sur les fichiers : 3A
  n'enseigne aucun numéral, สิบ est 3B item 2.5, สาม est 3B item 1.3, สามสิบ est
  3B item 4, บาท est 3C item 3. Les titres des items 4, 5, 6 et 7 portent
  maintenant la leçon ET le numéro d'item, et la ligne de prérequis de la Méta a
  été réécrite.
- **N2, prérequis 3D : CADUC.** Le constat était exact au moment de l'audit mais
  ne l'est plus. `lecon-3d.md` existe désormais au dépôt et enseigne le patron
  nom + nombre + classificateur, notamment à ses items 6 et 7. Le « Rappel de
  3D » de la page 3 est donc fondé, « Items nouveaux : deux » tient, et 3D
  n'enseigne pas ฟอง, qu'elle range explicitement parmi les classificateurs
  rencontrés mais non enseignés. Aucune correction de contenu n'était requise ;
  la réserve de la Méta et l'incertitude 1 ont été mises à jour.
- **N3, objectif non mesuré : CORRIGÉ.** Le tirage 2 de l'exercice 1 ne propose
  plus que des montants ; un tirage 5 a été ajouté sur la réplique 8 pour que
  l'attribution de locuteur soit mesurée deux fois ; l'objectif observable et la
  carte `srs-u03-l3e-03` énoncent des seuils qui correspondent aux tirages
  réellement produits. Aucun contenu thaï nouveau n'a été créé.
- **N4, distracteur ambigu : CORRIGÉ.** L'option 2 du tirage 1 devient « Elle
  commande dix œufs », franchement fausse pour la réplique 3 et empruntée à un
  autre acte du même dialogue. Le distracteur ne repose plus sur une nuance
  d'usage entre เท่าไร et กี่. Le feedback incorrect a été réécrit.
- **N5, indépendance surévaluée pour ฟอง : CORRIGÉ.** Vérifié en propre :
  th.wiktionary reprend les deux exemples de l'entrée RID. La source porte
  maintenant une réserve d'indépendance explicite, sur le modèle de celle que 3C
  applique à บาท, et l'indépendance de l'item est rattachée à Volubilis et à
  en.wiktionary.
- **N6, champs non conformes : CORRIGÉ.** Les 14 champs `longueur` emploient
  « courte » et « longue ». Le champ `litteral` de l'item 2 est supprimé et son
  contenu a rejoint `note_fr`. Le mot « brève » subsiste dans quatre phrases de
  prose, où il est le terme phonétique français usuel et non une valeur de
  champ.
- **N7, faute de français : CORRIGÉ.** « une étale » devient « un étal ».

### Contrôles techniques refaits après édition

- Fichier entier stable en NFC ; 128 suites thaïes distinctes, toutes stables.
- 14 déclarations de `codepoints` recalculées depuis les champs `thai` :
  0 écart, item 11 à deux formes compris.
- 0 tiret cadratin U+2014, 0 demi-cadratin U+2013, 0 U+2212, U+2015, U+2012.
- 371 apostrophes U+2019, 0 apostrophe droite U+0027.
- Transcriptions conformes à `thainaute-fr` v1.1 ; aucun graphème abandonné par
  l'amendement ; `sìp·èt` repris de 3B, `thâo·rài` repris de 3C ; `awi` reste la
  seule notation hors table, héritée de 2C.

### Incertitudes restantes après résolution

Résolues : 1 (cohérence 3A-3D), 2 (orthographe de la question de prix), et le
volet « classificateur générique » de la 6.

Toujours ouvertes, et bloquantes pour `review` ou pour la publication :

1. Incertitude 12, contre-vérification MANUELLE du RID, non couverte par le
   relevé automatisé même reproduit.
2. Incertitude 3, naturalité des trois assemblages du dialogue, ไข่เท่าไร,
   สิบฟองสามสิบบาท et ขอไข่สิบฟองหน่อย, non attestés tels quels.
3. Incertitude 13, fréquence et naturalité non mesurées pour ไข่ et ฟอง.
4. Incertitude 15, ce qui s'écrit réellement sur un étal de marché, non
   documenté et volontairement non affirmé.
5. Incertitude 5, notation `awi` héritée de 2C, et incertitude 2 de 3D pour
   `oua` : deux extensions de la table de transcription encore à valider.
6. Incertitudes 8, 9 et 11, registre marchand, genre du vendeur et réalisme du
   prix, à trancher à la revue native ou à l'audit de pédagogie.
7. Production audio entièrement à faire, avec la contrainte renforcée de deux
   voix stables, désormais nécessaire à deux tirages et non plus à un seul.
8. Lot de contre-audit externe `unite-03/contre-audit-gpt56.md` à préparer,
   aucun appel facturable sans budget validé par le fondateur.

Statut après résolution : `draft`. Revue native : en attente. La leçon reste
non publiable, et son passage en `review` reste subordonné à la
contre-vérification manuelle du RID et à l'audit de naturalité.
