# Contre-audit adversarial : leçon 3C

- Fichier audité : `content/authoring/unite-03/lecon-3c.md`
- Date de l’audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Consigne : chercher des erreurs, ne rien confirmer sur la foi du dossier de
  production. Chaque source citée a été rouverte, chaque ton, chaque longueur,
  chaque IPA, chaque transcription et chaque corrigé ont été re-dérivés, et le
  RID a été interrogé directement sur chaque fait d’orthographe et de variante.
- Verdict global : leçon **NON publiable en l’état**. 3 findings bloquants,
  9 remarques. Aucune graphie n’est fausse, aucun ton d’item n’est faux, aucun
  corrigé d’exercice n’est faux, et l’appareil de preuve est d’une honnêteté
  inhabituelle : les 32 numéros de ligne Volubilis, les 10 rangs de fréquence et
  les 20 contrôles RID que j’ai refaits tombent juste. Ce qui bloque est
  ailleurs : une explication causale fausse affichée à l’apprenant, un fait
  mono-sourcé attribué au mauvais dictionnaire, et un champ obligatoire du
  contrat d’item qui ne repose que sur une seule famille de sources.

## Méthode

1. Contrôle Unicode par script sur le fichier entier : séquences déclarées contre
   séquences réelles, stabilité NFC/NFD, chasse aux tirets cadratins et
   demi-cadratins, inventaire des apostrophes.
2. Interrogation directe du RID 2554 sur `dictionary.orst.go.th/func_lookup.php`,
   requête POST unique par mot, espacées de 1,4 seconde, agent utilisateur
   identifiant l’audit. 20 mots interrogés, dont 8 non prévus par le rédacteur
   (contre-épreuves). Conservation de la seule présence de la graphie et de la
   concordance du sens, par référence ; aucune définition n’est reproduite ici.
3. Réouverture des 24 pages Wiktionary citées, en `action=raw` et en
   `action=render`, pour lire l’IPA effectivement rendu et non un résumé.
4. Téléchargement de la base Volubilis v26.2 depuis le projet SourceForge cité,
   ouverture locale avec `openpyxl`, vérification une par une des 32 lignes
   citées, plus les 3 recherches par sous-chaîne et le balayage de correspondance
   exacte revendiqués par le dossier.
5. Téléchargement de `th_50k.txt` (FrequencyWords) et contrôle ligne à ligne des
   10 rangs et effectifs revendiqués.
6. Re-dérivation des tons à partir des règles orthographiques thaïes (classe de
   consonne, syllabe vive ou morte, longueur, signe de ton), sans passer par les
   sources, puis confrontation aux IPA relevés.
7. Re-dérivation de chaque transcription contre la table `thainaute-fr` v1.1 et
   son amendement du 3 août 2026.
8. Recoupement interne au dépôt : unités 1 et 2, et leçons 3A et 3B, pour tester
   les affirmations de coordination du dossier de production.

## Faits CONFIRMÉS par mes propres vérifications : 112

| Catégorie                                                              | Confirmés |
| ---------------------------------------------------------------------- | --------- |
| Codepoints déclarés, re-calculés caractère par caractère (9 séquences) | 9         |
| Unicode et typographie du fichier entier (NFC/NFD, cadratins, U+2019)  | 3         |
| RID 2554 interrogé directement (présences, absences, vedettes, sens)   | 20        |
| Wiktionary rouvert (IPA, gloses, notes d’usage, 404 vérifiées)         | 24        |
| Volubilis v26.2 : identité du fichier, 32 lignes, sous-chaînes, tri    | 39        |
| Rangs de fréquence, fichier téléchargé, contrôle ligne à ligne         | 10        |
| Recoupements internes au dépôt (unités 1, 2 et leçons 3A, 3B)          | 7         |

### Ce qui tombe juste et mérite d’être dit

- **Les 9 séquences de codepoints déclarées sont exactes**, caractère par
  caractère, y compris la réplique 4 du dialogue. Les 83 séquences thaïes du
  fichier sont stables en NFC et identiques en NFD. Zéro tiret cadratin, zéro
  demi-cadratin, zéro apostrophe droite, 319 apostrophes U+2019 : le compte
  annoncé par le dossier est exact au caractère près.
- **Le fait porteur de la leçon est vrai.** J’ai interrogé le RID moi-même :
  เท่าไร est bien enregistré, avec la catégorie adverbiale et le renvoi à la
  vedette mère annoncés ; เท่าไหร่ n’a aucune entrée. Les quatre absences
  attendues (อันนี้, สิบห้า, ห้าสิบ, กี่บาท) sont réelles. Les quatre vedettes
  บาท, les deux vedettes กี่ et les trois vedettes ท sont exactes, et l’entrée
  กี่ ๒ donne bien กี่บาท parmi ses exemples.
- **La base Volubilis existe, la version est la bonne et les 32 numéros de ligne
  cités sont tous exacts.** J’ai retrouvé la ligne 1 annoncée mot pour mot
  (`v. 26.2 (Jul. 2026)`, `114577 entr.`), le total de 114 579 lignes, et le
  balayage de correspondance exacte donne 26 graphies trouvées sur 27, la seule
  absence étant bien ราคาเท่าไร.
- **La lecture de la notation THAIPHON est correcte**, et je l’ai vérifiée par
  recoupement interne sur une dizaine de lignes : `-` moyen, `_` bas, `\`
  descendant, `¯` haut, `/` montant, macron pour la voyelle longue. La réserve de
  l’incertitude 2 sur `¯røi` est exacte : la ligne 83235 ne porte effectivement
  pas de macron alors que en.wiktionary donne /rɔːj˦˥/.
- **Les 10 rangs de fréquence sont exacts au rang et à l’effectif près**, y
  compris l’absence de กี่ comme jeton isolé.
- **Les 8 items ont des tons, des longueurs et des IPA justes.** Je les ai
  re-dérivés des règles orthographiques puis confrontés aux IPA rendus : rien à
  redire sur เท่าไร, เท่าไหร่, บาท, กี่บาท, อันนี้, ห้าสิบบาท, สิบห้าบาท ni sur
  le bloc complet de l’item 6, dont l’IPA de ครับ (/kʰrap̚˦˥/) est correct.
- **Les corrigés des quatre exercices sont justes et les distracteurs sont
  réellement faux.** Le retrait de ครับ pour Claire et de คะ pour Paul est
  correct, la réponse เท่าไร à la question du dictionnaire normatif est vraie, la
  lettre supplémentaire est bien ห, et la particule ครับ désigne bien l’homme qui
  parle. Les transcriptions du dialogue sont conformes à v1.1 et aux IPA
  (sà·wàt·dii, khâ, khàwwp·khoun, an·níi thâo·rai khráp).
- **Les blocs repris sont réellement repris.** `khàwwp·khoun` est bien la
  transcription de 2C, `awi` a bien été introduit en 2C pour หน่อย, พูด vient bien
  de 2A, et les lignes Volubilis 28944, 28945, 37006 et 37007 concordent avec le
  relevé indépendant de l’unité 2.

## Findings BLOQUANTS

### B1. Le ห de เท่าไหร่ ne fait pas ce que la leçon dit qu’il fait

La page 2 affiche à l’apprenant :

> « Ce ห ne se prononce pas, il est là pour le ton [...] C’est lui qui fait
> descendre la deuxième syllabe au ton bas, rài, alors qu’elle reste plate dans
> เท่าไร. »

et le feedback correct de l’exercice 3, tirage 2, le répète :

> « Ce ห ne se prononce pas : il est là pour le ton de la syllabe qui suit [...]
> C’est pour cela que la deuxième syllabe descend, rài, au lieu de rester plate. »

C’est faux, et c’est contredit par les deux sources que l’item 2 cite lui-même.

- Le ห seul ne donne pas le ton bas. Il fait passer la syllabe sous les règles de
  la classe haute. Une syllabe vive de classe haute sans signe de ton est
  **montante**, pas basse. L’entrée « ห » du RID, citée comme source 1 par
  l’item 2, donne précisément deux exemples, หงอย et หนา, qui sont tous deux
  montants. La source citée démontre donc le contraire de ce que la page affirme.
- en.wiktionary, source 2 de l’item 2, dit que le ห silencieux mène les basses
  isolées « into the tone properties of a high-class consonant ». Il parle de
  classe, jamais de ton bas.
- Le ton bas de ไหร่ vient de la conjonction du ห et du **ไม้เอก** ajouté, que la
  page 2 ne mentionne à aucun moment. Sans le ไม้เอก, ไหร serait montant ; sans le
  ห, ไร่ serait descendant. Aucun des deux signes ne produit le ton bas à lui seul.
- L’analogie avec หน่อย aggrave le problème plutôt qu’elle ne le sauve : หน่อย
  porte lui aussi un ไม้เอก, donc l’apprenant qui généralise la règle telle
  qu’elle est écrite prédira un ton bas pour หนา et หงอย, et se trompera.
- Contradiction interne : le `note_fr` de l’item 2 est, lui, exact et complet
  (« un ห s’insère devant le ร **et une deuxième marque de ton apparaît** »).
  C’est le texte affiché qui a perdu la moitié de l’explication.

Le ton enseigné (rài, bas) est juste ; c’est le mécanisme qui est faux. Comme il
est énoncé deux fois à l’écran et qu’il s’appuie explicitement sur deux sources
qui disent autre chose, il tombe sous « sens faux » et « source mal citée ».

**Correction minimale** : ne plus attribuer le ton au seul ห. Soit s’en tenir à
l’effet observé (« ces deux graphies se disent avec deux mélodies différentes sur
la seconde syllabe »), soit nommer les deux signes ajoutés sans énoncer la règle.

### B2. « Dix pris cinq fois » est mono-sourcé et attribué au mauvais dictionnaire

La page 6 affiche :

> « Le dictionnaire thaï décrit d’ailleurs le premier comme dix pris cinq fois. »

et le `note_fr` de l’item 7 reprend la même formule.

Deux problèmes distincts, l’un et l’autre bloquants.

1. **Attribution fausse.** Partout ailleurs dans cette leçon, « le dictionnaire
   normatif du thaï » désigne le RID, et c’est la clé de la page 2 et de
   l’exercice 3. Or j’ai interrogé le RID : **ห้าสิบ n’a aucune entrée**. Le
   dossier de production le reconnaît d’ailleurs lui-même dans sa liste des
   5 absences. La formulation multiplicative vient en réalité de th.wiktionary, un
   wiki communautaire, qui définit le nombre comme « 10 ห้า หน รวมกัน ». J’ai
   rouvert la page : la définition existe bien, mais elle n’est pas celle d’un
   dictionnaire normatif. L’apprenant lit « le dictionnaire thaï » quelques lignes
   après avoir appris à distinguer ce qui est au dictionnaire de ce qui n’y est
   pas. C’est exactement la confusion que la leçon prétend éviter.
2. **Fait mono-sourcé.** L’incertitude 13 admet que la source est th.wiktionary et
   th.wiktionary seul. J’ai cherché la deuxième source dans l’ensemble autorisé :
   en.wiktionary se borne à donner la composition ห้า + สิบ, Volubilis ligne 15257
   ne donne que la glose « cinquante », et le RID n’a pas d’entrée. La politique
   exige deux sources indépendantes par fait, et ce fait est enseigné, pas
   seulement consigné.

Remarque utile pour la correction : le RID formule bien un fait multiplicatif du
même ordre à l’entrée ร้อย, mais pour ร้อย, pas pour ห้าสิบ. Le transposer à ห้าสิบ
serait une inférence de l’auteur, pas une source.

**Correction minimale** : retirer la phrase de la page 6 et du `note_fr` de
l’item 7, ou l’attribuer explicitement et honnêtement (« le Wiktionnaire thaï »)
et lui trouver une seconde source indépendante avant de l’afficher.

### B3. La longueur des diphtongues de เท่าไร et เท่าไหร่ ne repose que sur Wikimedia

Les champs `longueur` des items 1 et 2 (« thâo brève ; rai brève ») sont des
champs obligatoires du contrat d’item, qui exige au moins deux sources
indépendantes. L’incertitude 2 déclare honnêtement que la brièveté repose sur la
seule absence de marque d’allongement dans l’IPA de Wiktionary. J’ai vérifié que
la situation est bien celle-là et qu’aucune sortie de secours n’existe dans
l’ensemble autorisé :

- Volubilis est effectivement inexploitable pour ce cas, et la démonstration du
  rédacteur est juste : ligne 83235, `¯røi` sans macron alors que la voyelle de
  ร้อย est longue (en.wiktionary : /rɔːj˦˥/). Je confirme la ligne et l’IPA.
- Le RID ne donne pas de valeur de longueur pour เท่าไร.
- La colonne SYLLAB de Volubilis pour la ligne 100805 est `[เท่า-ไร]` : elle
  découpe, elle ne mesure pas.
- Les deux éditions de Wiktionary comptent pour une seule famille, ce que le
  dossier reconnaît explicitement.

Le fait est probablement vrai, et il est déclaré. Il reste mono-sourcé sur un
champ obligatoire, donc il bloque la porte `draft → review` telle que la politique
la définit. Il faut soit une grammaire de référence sur exemplaire, soit descendre
ces deux champs au statut d’inconnu affiché.

## Remarques non bloquantes

### R1. L’exercice 1 viole sa propre contrainte de tirage

L’exercice annonce « jamais deux fois de suite la même cible », puis énumère six
tirages dont la cible est 50, 15, 15, 50, 50, 15. Les tirages 2 et 3 ont la même
cible, les tirages 4 et 5 aussi. Deux fois sur cinq transitions, la contrainte est
rompue. Comme cet exercice porte le critère de maîtrise `srs-u03-l3c-04`
(5 réussites sur 6), la séquence doit être corrigée avant compilation, ou la
contrainte réécrite.

### R2. La leçon se contredit sur ce qui distingue สิบห้า de ห้าสิบ

Le `note_fr` de l’item 8 affirme « Ni le ton ni la longueur ne vous aideront à
trancher, ils sont identiques dans les deux nombres », et les pièges de
l’exercice 1 mettent en garde contre le fait de « chercher un indice dans le ton
ou dans la longueur ». Mais le feedback incorrect du même exercice demande
exactement l’inverse : « Si elle tombe de haut, c’est hâa [...] Si elle est courte
et basse, c’est sìp. » Les deux inventaires de tons sont identiques, mais le ton et
la longueur de la PREMIÈRE syllabe sont justement l’indice décisif. L’apprenant qui
a lu l’item 8 est explicitement dissuadé d’employer la stratégie que l’exercice lui
recommande ensuite. À harmoniser sur la formulation du feedback, qui est la bonne.

### R3. La ligne Volubilis 100807 est mal citée

L’item 2 écrit : « lignes 100806 et 100807 [...] mêmes gloses françaises et
anglaises qu’à เท่าไร. La colonne DOM porte « TOURIST » ». J’ai ouvert les deux
lignes. C’est vrai de la 100806. C’est faux de la 100807, dont la colonne FRA est
**vide**, dont la glose anglaise est « at all ; very much », et dont la colonne DOM
est **vide**. Le fait porteur (aucune des deux lignes ne porte l’étiquette `RID`)
reste vrai, et la notation `\thao_rai` est exacte sur les deux lignes ; seule la
description est trop large. À resserrer sur la ligne 100806.

### R4. « 21 lignes contenant เท่าไร » ne se reproduit pas, et prouve moins que ce qu’on lui fait dire

Deux problèmes.

- Le compte exact de la sous-chaîne เท่าไร sur la colonne THA est de **22 lignes**,
  pas 21. Le dossier donne 21 à trois endroits (item 6, section Volubilis,
  incertitude 7). Aucune convention de comptage évidente ne ramène à 21.
- Surtout, l’incertitude 7 écrit « Le moule [chose] + เท่าไร est attesté par
  21 lignes de Volubilis ». C’est un usage abusif du chiffre. Sur les 22 lignes,
  une bonne moitié sont des emplois adverbiaux négatifs ou concessifs qui
  n’instancient pas le moule interrogatif : ไม่ค่อย...เท่าไร, ไม่มากเท่าไร,
  ไม่เท่าไรหรอก, ...เท่าไรก็ได้, ราคาเท่าไรก็ได้, อายุเท่าไรก็ได้, et ainsi de
  suite. Les lignes qui attestent réellement [chose] + เท่าไร sont environ neuf à
  onze : อายุเท่าไร, น้ำหนักเท่าไร, นี่เท่าไร, เวลาเท่าไร (deux lignes),
  วันที่เท่าไร, วันนี้วันที่เท่าไร, อุณหภูมิเท่าไร, สอบได้ที่เท่าไร, นานเท่าไร.
  C’est suffisant pour attester le moule, et notamment นี่เท่าไร avec un
  démonstratif en tête, qui est bien le cas de la leçon. Mais il faut écrire le bon
  chiffre.

### R5. Le `registre` de l’item 2 sort de l’énumération des CONVENTIONS

`CONVENTIONS.md` impose `registre` parmi neutre, poli, familier, formel. L’item 2
porte « courant, non enregistré par le dictionnaire normatif », qui mélange une
valeur de registre et un fait de lexicographie. La source descriptive citée
étiquette « colloquial », ce que la page 2 traduit d’ailleurs par « familière ».
Mettre `familier` dans le champ et déplacer le fait de non-enregistrement dans
`note_fr`, où il figure déjà.

### R6. Le dossier annonce 14 URLs en.wiktionary, il en cite 13

La section « Accès aux sources » liste quatorze pages en.wiktionary, dont ท. Le
balayage du fichier ne trouve que treize URLs en.wiktionary distinctes, et
`en.wiktionary.org/wiki/ท` n’y figure pas : la valeur positionnelle de la lettre ท
est sourcée par th.wiktionary et le RID, ce qui reste deux sources, dont une hors
Wikimedia. Le compte de th.wiktionary (9 citées plus 2 absences 404) est en
revanche exact, et j’ai vérifié que les deux 404 annoncées en sont bien.

### R7. ร้อย est donné comme attesté au RID sans figurer dans le relevé RID du dossier

L’incertitude 4 affirme que ร้อย est « RID entrée autonome ». Le relevé du dossier
est pourtant exhaustif et nominatif : 19 mots, 14 trouvés, 5 absents, et ร้อย n’y
est pas. J’ai interrogé le RID moi-même : **la graphie est bien attestée**, donc le
fait est vrai. Mais il est affirmé hors traçabilité, ce qui est exactement ce que
la porte RID est censée empêcher. À verser au futur `unite-03/verification-rid.md`.

### R8. Les affirmations de coordination avec 3A et 3B sont périmées

L’incertitude 1 écrit : « Ni `unite-03/lecon-3a.md` ni `unite-03/lecon-3b.md`
n’existaient au moment de la rédaction. » Les deux fichiers existent, et leurs
dates de modification précèdent celle de 3C. Trois conséquences concrètes :

- 3A confirme la cible /t/ contre /tʰ/ et la reconnaissance des chiffres thaïs :
  les renvois de 3C à 3A sont justes.
- 3B s’intitule « Compter de un à cent » et enseigne la fabrication des dizaines
  rondes de trente à quatre-vingt-dix. ห้าสิบ n’est donc pas un mot neuf en 3C,
  alors que 3B est déclarée en prérequis et que 3C source les deux nombres « comme
  s’ils étaient nouveaux ».
- 3B déclare en propre l’extension `awwi` pour /ɔːj/. Le motif de retrait de ร้อย
  donné par l’incertitude 4 (« une deuxième extension non validée ») ne tient donc
  plus tel quel : l’extension est proposée par la leçon qui précède immédiatement.
  À trancher à la consolidation de l’unité, pas à réécrire dans l’urgence.

### R9. L’étiquette DOM `RID` de Volubilis n’est pas une preuve d’absence

L’item 2 s’appuie sur le fait que les lignes de เท่าไหร่ « NE portent PAS
l’étiquette `RID` » pour corroborer le registre. La logique n’est valable que si
l’étiquette est exhaustive, et elle ne l’est pas : la ligne 4504 (บาท) et la
ligne 14524 (ห้า) ne la portent pas non plus, alors que j’ai vérifié que les deux
sont des vedettes du RID. L’absence d’étiquette est donc un indice faible, pas une
corroboration. La preuve réelle reste la requête directe au RID, que j’ai refaite
et qui est solide. Il suffit de le dire dans ces termes.

## Ce que cet audit ne couvre pas

- La naturalité réelle de อันนี้เท่าไรครับ à un étal reste un jugement d’usage. Le
  moule est attesté, les briques le sont, aucune source consultée ne cite la suite
  exacte. L’incertitude 7 a raison de la renvoyer à la revue native.
- La mélodie effectivement dominante à l’oral (incertitude 3) n’est pas tranchable
  par les sources écrites. Le renvoi à la revue native est correct.
- La lisibilité des signes combinatoires de สิบห้าบาท et ห้าสิบบาท aux trois
  largeurs n’a pas été testée : cela demande le rendu, pas le fichier.
- Aucun audio n’existe, donc rien n’a pu être contrôlé côté production sonore.
- **Revue native : en attente.** Rien dans cet audit ne s’y substitue.

## Porte

Statut recommandé : reste `draft`. Les trois findings bloquants doivent être
résolus, et les neuf remarques traitées ou explicitement acceptées, avant tout
passage en `review`.

## Suite donnée (ajout du 2026-08-03, hors périmètre de l’audit)

Cette section est ajoutée après coup par la consolidation. Elle ne modifie aucun
constat ci-dessus : le rapport reste le compte rendu de l’audit tel qu’il a été
rendu.

- `content/authoring/unite-03/lecon-3c.md` a été consolidé le 2026-08-03. Les
  3 findings bloquants sont résolus et les 9 remarques traitées, une par une, au
  « Journal de consolidation du 2026-08-03 » en fin de dossier de production de
  la leçon.
- Aucune attestation n’a été fabriquée pour clore un finding. B2 et B3 portaient
  sur des faits mono-sourcés dont la seconde source n’existe pas dans l’ensemble
  autorisé : le fait de B2 a été SUPPRIMÉ de l’écran, et les champs de B3 sont
  descendus au statut d’inconnu affiché. La piste de repli suggérée par la
  remarque de l’audit sur B2, transposer à ห้าสิบ le fait multiplicatif que le
  RID énonce à ses entrées ร้อย ๑ et ยี่สิบ, a été explicitement REFUSÉE et le
  refus est consigné dans la leçon : ces entrées ne portent pas sur ห้าสิบ.
- Deux incertitudes ont été ouvertes par la consolidation : n° 15, le mécanisme
  de ton de เท่าไหร่, non énonçable sans grammaire de référence ; n° 16, la même
  causalité fausse encore présente dans `unite-02/lecon-2c.md`, hors périmètre
  et non corrigée.
- Le statut de la leçon reste `draft`. Trois portes demeurent ouvertes avant
  `review` : contre-vérification manuelle du RID, création des fichiers de suivi
  de l’unité 3, réconciliation 3B/3C.
