# Contre-audit adversarial : leçon 2C

- Fichier audité : `content/authoring/unite-02/lecon-2c.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Consigne : chercher des erreurs, ne rien confirmer sur la foi du dossier de
  production. Chaque URL citée par le rédacteur a été re-ouverte ; chaque ton,
  chaque longueur, chaque IPA, chaque transcription et chaque corrigé ont été
  re-dérivés indépendamment.
- Verdict global : leçon **NON publiable**. 5 findings bloquants, 7 remarques.
  Aucun corrigé d'exercice n'est faux, aucune graphie n'est fausse, mais une
  transcription affichée à l'apprenant porte un ton faux, et l'appareil de
  preuve ne satisfait pas la politique de sourçage.

## Méthode

1. Vérification Unicode par script sur le fichier entier (séquences déclarées
   contre séquences réelles, stabilité NFC/NFD, chasse aux tirets cadratins).
2. Ré-interrogation de chacune des 15 URLs Wiktionary citées, plus 3 URLs de
   contre-épreuve non citées par le rédacteur (น้อย, โทษ, สวัสดี).
3. Téléchargement et interrogation locale de `th_50k.txt` (FrequencyWords),
   50 000 lignes, vérification ligne à ligne des 9 rangs revendiqués.
4. Ouverture des 2 sources universitaires, contrôle des métadonnées et du
   contenu réellement écrit.
5. Requête directe sur `dictionary.orst.go.th/lookup_domain.php` pour contrôler
   l'affirmation d'indisponibilité du RID.
6. Re-dérivation des tons à partir des règles orthographiques thaïes (classe de
   consonne, syllabe vive/morte, longueur vocalique, signe de ton), sans passer
   par les sources.
7. Recoupement interne au dépôt (unités 1 et 2) pour tester les affirmations du
   dossier de production.

## Faits CONFIRMÉS par mes propres vérifications : 81

| Catégorie                                                            | Confirmés |
| -------------------------------------------------------------------- | --------- |
| Unicode et typographie (8 séquences, NFC/NFD, 46 chaînes, tirets)    | 10        |
| Graphies, sens, IPA, gloses, notes d'usage (Wiktionary ré-interrogé) | 30        |
| Tons et longueurs re-dérivés des règles orthographiques (8 items)    | 8         |
| Transcriptions re-dérivées contre `thainaute-fr` v1.1                | 9         |
| Rangs de fréquence (fichier téléchargé, contrôle ligne à ligne)      | 9         |
| Sources universitaires (existence, métadonnées, contenu)             | 7         |
| Corrigés d'exercices et fausseté des distracteurs                    | 4         |
| Contrôles d'infrastructure et de dossier                             | 4         |

### Détail des confirmations notables

**Unicode.** Les 8 séquences `codepoints` déclarées sont exactes, caractère par
caractère. Le fichier est stable en NFC ; les 46 chaînes thaïes distinctes qu'il
contient sont identiques en NFC et en NFD, donc sans risque de normalisation
silencieuse. Le décompte « 46 chaînes » du dossier de production est exact.
Zéro tiret cadratin, zéro demi-cadratin, zéro tiret de remplacement.

**Graphies.** Aucune graphie fausse. ขอบคุณ, ครับ, ค่ะ, ไม่เป็นไร, ขอโทษ, ขอ,
น้ำ, หน่อย sont toutes correctes et correspondent aux entrées consultées.

**Tons.** Les 8 assignations de ton sont correctes et se re-dérivent des règles
orthographiques sans consulter de source : ขอบ (ข haute, syllabe morte, voyelle
longue → bas), คุณ (ค basse, vive → moyen), ครับ (ค basse, morte brève → haut),
ค่ะ (ค basse + mai ek, morte → descendant), ไม่ (ม basse + mai ek → descendant),
เป็น et ไร (vives, sans signe → moyen), ขอ (ข haute, vive → montant), โทษ (ท
basse, morte longue → descendant), น้ำ (น basse + mai tho → haut), หน่อย (ห
préposé rendant น haute, + mai ek → bas). Toutes concordent avec les IPA
Wiktionary re-lues.

**Longueurs.** Les 8 assignations sont correctes. Point le plus fragile testé
en priorité : la longueur brève de หน่อย. Contre-épreuve non demandée par le
rédacteur : en.wiktionary donne น้อย = `/nɔːj˦˥/` **avec** marque de longueur,
et หน่อย = `/nɔj˨˩/` **sans** ; th.wiktionary respelle หน่อย en « หฺน็่อย », avec
le mai taikhu ( ็ ) marqueur de brièveté. L'analyse « brève » est donc bien
celle des deux sources, ce n'est pas une négligence du rédacteur.

**Transcriptions.** 9 transcriptions sur 10 sont conformes à v1.1 après
re-dérivation : `khàwwp·khoun`, `khráp`, `khâ`, `mâi·pen·rai`, `khǎww·thôot`,
`khǎww`, `náam`, `nàwi`, `khǎww náam nàwi`. La dixième est fausse, voir B1.

**Fréquence.** Les 9 rangs revendiqués sont exacts au chiffre près sur le
fichier réel : ขอบคุณ 15 (13 373), ครับ 10 (15 205), ค่ะ 21 (10 059), ไม่เป็นไร
37 (6 846), ขอโทษ 103 (3 156), ขออภัย 1206 (318), น้ำ 1282 (300), หน่อย 777
(502), ขอ 1457 (267). Aucun chiffre inventé.

**Absences déclarées.** Les trois 404 annoncés sont réels et re-vérifiés :
`th.wiktionary.org/wiki/ไม่เป็นไร`, `en.wiktionary.org/wiki/ขอบคุณครับ`. Le
rédacteur n'a rien maquillé.

**Sources universitaires.** Les deux existent et disent exactement ce qu'on leur
fait dire. L'article ThaiJo 280774 est bien « A Comparison of Pragmatic
Competence of "Mai-Pen-Rai"… », Deeana Kasa, _Language and Linguistics_ 43(2),
2025, CC BY-NC-ND 4.0, et son résumé énumère bien les quatre fonctions de
Panpothong & Phakdeephasook (2014). La notice `nsm-approach.net/archives/4176`
est bien la notice de la thèse de Thasanee Mekthawornwathana, Chulalongkorn
2010, et énonce mot pour mot « It has four pragmatic meanings, 'consoling',
'refusing', 'forgiving' and 'responding to thank you' » pour ไม่เป็นไร, et
« 'apologizing', 'introductory device', 'attention-getter', and 'leave-taking
device' » pour ขอโทษ. Le calcul de la note culturelle (trois emplois communs,
un divergent) est arithmétiquement exact contre les deux listes.

**Corrigés.** Les 4 exercices ont un corrigé correct et des distracteurs
réellement faux. Exercice 3 en particulier : `ขอ น้ำ หน่อย ค่ะ` est le bon
ordre, `ครับ` est bien l'élément à retirer, et aucune permutation alternative
n'est acceptable.

## Findings BLOQUANTS

### B1. Ton faux affiché à l'apprenant : `sawàtdii` (dialogue, réplique 2)

La réplique 2 du dialogue transcrit สวัสดีค่ะ en `sawàtdii khâ`. La première
syllabe est écrite sans diacritique, ce qui signifie **ton moyen** dans la
convention. Or elle porte un **ton bas**.

Preuves indépendantes :

- en.wiktionary, entrée « สวัสดี », consultée le 2026-08-03 :
  `/sa˨˩.wat̚˨˩.diː˧/`, romanisation Paiboon `sà-wàt-dii`. Les deux premières
  syllabes sont basses.
- Volubilis v26.2, déjà présent au dépôt dans
  `unite-01/verification-volubilis.md` : romanisation `sawatdī`, et
  `unite-02/lecon-2b.md:555` relève `_sa`, ton bas.
- `CONVENTIONS.md`, amendement v1.1 point 4 : le ton se marque sur la première
  lettre du noyau vocalique. Ton bas = `à`. La forme correcte est `sà·wàt·dii`.

Aggravation : la convention impose aussi le point médian dans les polysyllabes.
Le fichier 2C l'applique partout ailleurs (`khàwwp·khoun`, `mâi·pen·rai`,
`khǎww·thôot`) et pas ici.

Aggravation majeure : `unite-02/lecon-2b.md` (même unité, même journée de
rédaction) a **déjà corrigé** cette erreur, écrit `sà·wàt·dii`, et l'a
explicitement qualifiée de « **Point bloquant pour la publication conjointe des
unités 1 et 2** » (lignes 571 à 578). La leçon 2C réintroduit la forme fautive
après la leçon qui la corrige. L'apprenant verra donc, en 2B puis en 2C, deux
transcriptions différentes du même mot, dont la seconde est fausse.

Régression identique constatée en `lecon-2d.md:542` et `lecon-2e.md:511` et
`:515`, hors périmètre de cet audit mais à corriger dans la même passe.

**Action** : écrire `sà·wàt·dii khâ` réplique 2, puis passer les leçons 2C, 2D,
2E et 1E au peigne avant toute consolidation.

### B2. Aucun item n'a deux sources indépendantes, et le motif invoqué est faux

`CONVENTIONS.md` exige « au moins DEUX sources indépendantes de la politique ».
`docs/content-policy/sources-verification.md` ajoute pour Wiktionary :
« **jamais en source unique** », et fixe la chaîne standard RID → Volubilis →
Wiktionary avec primauté RID en orthographe.

Pour les 8 items, le sourçage de sens et de prononciation repose exclusivement
sur en.wiktionary et th.wiktionary, deux éditions du **même** écosystème
Wikimedia, alimentées par les mêmes modules de prononciation (elles renvoient
d'ailleurs des IPA rigoureusement identiques sur les 6 mots communs, ce qui est
la signature d'une source unique et non d'un recoupement). FrequencyWords
apporte un signal de fréquence, jamais une confirmation de sens ou de ton.

Le rédacteur le reconnaît (incertitude 7) mais justifie l'absence de Volubilis
par : « la base n'est pas présente dans le dépôt et n'a pas été retéléchargée ».
**Cette justification est contredite par le dépôt lui-même** :

- `unite-02/lecon-2b.md:129` : « Volubilis Database v26.2 (juillet 2026, CC
  BY-SA 4.0), base téléchargée et… », puis sept items sourcés « interrogée le
  2026-08-03 ».
- `unite-02/lecon-2e.md:113-120` : fichier `VOLUBILIS Database.xlsx` téléchargé
  le 2026-08-03 depuis l'URL SourceForge, avec extraction de lignes.
- `unite-01/verification-volubilis.md` contient déjà, au dépôt, les gloses
  Volubilis de trois des mots de cette leçon : ขอบคุณ « remercier ; dire merci ;
  être reconnaissant », ครับ « oui ; ouais (fam.) », ค่ะ « oui ; d'accord ».

Le recoupement hors Wikimedia des items 1 et 2 était donc disponible sans une
seule requête réseau, et le recoupement complet était réalisable le jour même
puisque deux leçons voisines l'ont fait. Le recoupement RID manuel, porte
obligatoire et prioritaire en orthographe, n'est pas fait non plus.

**Action** : refaire le recoupement Volubilis des 8 items avant tout passage en
`review`, et corriger la phrase du dossier de production, qui est inexacte.

### B3. Le double emploi de ขอโทษ repose sur une seule source, hors politique

La page 3, l'exercice 2 (dont c'est l'unique bonne réponse) et l'item SRS
`srs-u02-l2c-03` enseignent tous que ขอโทษ sert aussi à interpeller. Le dossier
écrit lui-même, dans les sources de l'item 4 : « **C'est cette notice qui fonde
le double usage enseigné en page 3.** »

Cette notice est `nsm-approach.net/archives/4176`. Je l'ai ouverte : elle
existe, elle dit bien ce qu'on lui fait dire (« attention-getter » figure
littéralement), mais :

1. c'est une **source unique** pour ce fait ;
2. `nsm-approach.net` **ne figure dans aucune catégorie** de
   `docs/content-policy/sources-verification.md` ;
3. ce n'est pas la thèse mais une **notice bibliographique tierce** qui en
   reprend le résumé : la chaîne de vérification s'arrête à un intermédiaire.

Le corrigé d'un exercice et un critère de maîtrise SRS reposent donc sur un fait
mono-sourcé hors politique. Le rédacteur applique pourtant correctement la règle
inverse ailleurs : il écarte « leave-taking device » (incertitude 5) et la
hiérarchie de formalité (incertitude 4) précisément parce qu'elles sont à source
unique. Traitement incohérent d'un fait plus exposé.

**Action** : soit sourcer le double emploi par une deuxième source de la
politique, soit retirer l'exercice 2 et `srs-u02-l2c-03`.

### B4. L'item 8 est déclaré bloquant par son auteur et enseigné dans cinq endroits

Le dossier écrit : « **INCERTAIN, bloquant pour l'item 8** : le naturel exact de
la locution ขอน้ำหน่อย », et les sources de l'item concluent « Aucune entrée de
dictionnaire ne couvre la locution entière ». J'ai re-vérifié : c'est exact,
aucune des sources de la politique n'atteste la suite complète.

Or cette locution est enseignée en page 5, sert de **corrigé** à l'exercice 3,
de **corrigé** à la paire 4 de l'exercice 4, de réplique 3 du dialogue, et de
critère de maîtrise `srs-u02-l2c-04`.

Un item déclaré bloquant ne peut pas porter deux corrigés d'exercice. Les
briques sont attestées (ขอ verbe transitif par th.wiktionary, ขอหน่อย comme
exemple de th.wiktionary, หน่อย « particle to soften a request » par
en.wiktionary) et le patron est grammaticalement plausible, mais la politique ne
raisonne pas en plausibilité.

**Action** : soit obtenir une attestation du bloc complet dans une source de la
politique, soit rétrograder l'item 8 en démonstration non évaluée et retirer les
deux corrigés qui en dépendent.

### B5. La note culturelle repose sur zéro source conforme à la politique

`CONVENTIONS.md` : « au moins DEUX sources indépendantes **de la politique** ».
La note culturelle et une partie de l'item 3 s'appuient sur deux sources qui
existent bel et bien, que j'ai lues, et qui disent exactement ce qu'on leur fait
dire, mais qui ne sont **ni l'une ni l'autre** dans
`docs/content-policy/sources-verification.md` : la revue _Language and
Linguistics_ sur TCI ThaiJo, et `nsm-approach.net`. Le §2 de la politique
énumère limitativement JSEALS et MANUSYA pour les revues ouvertes.

Le compte de sources conformes pour ce fait est donc de **zéro**, pas de deux.
Le rédacteur le signale honnêtement (« à faire trancher avant le passage en
`review` »), mais il publie déjà la note culturelle dans le corps de la leçon.

**Action** : faire trancher l'extension de la politique par le fondateur, ou
retirer la note culturelle de la leçon en attendant.

## Remarques NON bloquantes

### N1. L'extension `awi` n'est pas la convention v1.1

La Méta annonce « convention `thainaute-fr` v1.1 » puis introduit un graphème
absent de la table. `CONVENTIONS.md` n'est pas amendé. Tant que l'extension
n'est pas approuvée, l'affirmation « suit v1.1 » est fausse au sens strict. Le
rédacteur le déclare, mais l'affirmation reste en Méta.

Sur le fond, `awi` est cohérent avec la logique v1.1 (`aw` = /ɔ/ bref, plus la
fermeture en `i`) et ne collisionne avec rien. En revanche, la glose
pédagogique « le o ouvert de "sort", suivi d'un **i bref** » (page 5 et
`note_fr` de l'item 7) décrit une suite de deux voyelles, alors que /ɔj/ est une
voyelle suivie d'une **semi-voyelle**. Un apprenant francophone risque de
produire deux syllabes.

### N2. Risque d'originalité non consigné : la page tierce « the Two-Jobs Word »

Le dossier affirme : « Aucune formulation copiée d'une source ». En cherchant
une deuxième source pour B3, je suis tombé sur une page tierce qui existe et que
le dossier ne mentionne nulle part :

- `https://paithai.app/thai/sorry`, titrée « Sorry in Thai — ขอโทษ
  (khǎw-thôot), the Two-Jobs Word », mention « © 2026 PaiThai · ไปไทย » (tous
  droits réservés), contenant « it does two jobs. It's the apology _and_ the
  "excuse me" ».
- La leçon 2C titre sa page 3 « un mot, deux gestes différents » et écrit
  « ขอโทษ **fait deux métiers**. Il sert à s'excuser, et il sert à attirer
  poliment l'attention ». Le site tiers utilise en outre `khǎw-thôot` et
  `mâi-bpen-rai`, très proches de `khǎww·thôot` et `mâi·pen·rai`.

La métaphore « deux métiers » est banale et la coïncidence est possible. Mais
sur une page tous droits réservés, avec ce degré de recouvrement, le point doit
être tranché à la main avant publication et consigné au dossier.

### N3. Sur-interprétation de FrequencyWords

Les 9 rangs sont exacts, mais la liste est tokenisée aux espaces sur un corpus
de sous-titres. J'ai regardé son sommet : rang 1 « เธ » et rang 4 « เน » sont
des fragments, et « you », « the », « i », « to » occupent les rangs 11, 13, 17
et 25 d'une liste censée être thaïe.

Conséquence : la phrase de l'item 3, « ไม่เป็นไร rang 37, **en un seul jeton, ce
qui confirme une formule figée** », n'est pas une inférence valide. En thaï
sous-titré, un jeton délimité par des espaces est un groupe de souffle, pas une
unité lexicale. Symétriquement, le rang 1457 de ขอ ne mesure rien du tout ; le
rédacteur le pressent (« Rang volontairement consigné tel quel ») mais le
consigne quand même comme signal.

### N4. Citation de seconde main présentée comme un travail indépendant

Les quatre fonctions de ไม่เป็นไร proviennent de **Panpothong & Phakdeephasook
(2014)**, que la leçon n'a jamais ouvert : elle cite Kasa (2025), qui les cite.
La note culturelle parle de « deux travaux **indépendants** » alors que l'un des
deux n'a pas été consulté et que les deux relèvent du même département
(Chulalongkorn : Mekthawornwathana 2010 ; Panpothong y enseigne). La formule
« deux travaux indépendants » surestime la solidité du recoupement.

### N5. Preuve inexacte sur l'indisponibilité du RID

Le dossier écrit : « la page renvoie « ไม่พบคำศัพท์ที่ต้องการค้นหา » sans
exécuter la requête, y compris via `lookup_domain.php` ». J'ai récupéré la page
moi-même : la réponse brute fait 16 165 octets et **ne contient aucune
occurrence** de cette chaîne. C'est un squelette JavaScript (`Refresh_Table`,
`var word`), le message n'apparaissant qu'après exécution côté client.

La conclusion (RID inexploitable par outillage) est juste et je la confirme ;
la preuve consignée ne l'est pas. Une preuve mal décrite dans un dossier
d'audit est un précédent à corriger.

### N6. L'exercice 2 est étiqueté `reading` alors que la leçon nie l'écriture

La « Note sur les mécaniques retenues » justifie l'absence de `recall` par :
« l'écriture thaïe n'est pas encore enseignée ». Or l'exercice 2 affiche
ขอโทษครับ « sans transcription » et demande de l'interpréter. Le même argument
s'y applique : l'exercice mesure la reconnaissance d'une forme globale déjà vue
en page 3, pas une lecture. Étiquette de mécanique à revoir, ou ajouter la
transcription sous le spécimen.

### N7. Objectif observable non mesurable par la leçon

La Méta promet « distingue à l'écoute ขอบคุณ de ขอโทษ **au moins 4 fois sur 5** »
alors que la leçon ne contient qu'**un seul** item `listening` (exercice 1). Le
critère 4/5 n'est atteignable qu'au SRS (`srs-u02-l2c-05`), donc plus tard.
Reformuler l'objectif, ou porter l'exercice 1 à cinq items.

## Points re-confirmés comme ouverts (déjà connus, non régressifs)

- Contradiction de statut social sur ขอบคุณ, finding B3 de la vérification 1E :
  re-constatée par moi le 2026-08-03. en.wiktionary « Used to thank a person of
  equal or lower status » ; th.wiktionary « คำที่ใช้แก่บุคคลที่เสมอกัน
  หรือผู้น้อยใช้แก่ผู้ใหญ่ ». Correctement non enseignée, toujours non tranchée.
- Variante de ton bas de ค่ะ (`/kʰaʔ˨˩/`) : présente sur les deux éditions,
  re-vérifiée, correctement écartée de l'enseignement.
- Réplique 4 du dialogue : ค่ะ seul est bien « คำรับที่ผู้หญิงใช้ », un mot
  d'acquiescement (Volubilis, déjà au dépôt : « oui ; d'accord »). Le rendre par
  « Voilà » est une glose de geste ; la note de production le dit, mais
  l'apprenant lira quand même « ค่ะ = Voilà ». À surveiller à la mise en écran.
- `unite-02/contre-audit-gpt56.md` : absent, conformément à ce que déclare le
  dossier. Lot externe toujours à préparer.

## Bilan chiffré

- Faits CONFIRMÉS par vérification indépendante : **81**
- Findings BLOQUANTS : **5** (B1 à B5)
- Remarques non bloquantes : **7** (N1 à N7)
- Erreurs de graphie : 0
- Erreurs de ton dans les champs `ton` des items : 0
- Erreur de ton dans une transcription affichée : 1 (B1)
- Sources inventées : 0
- Sources qui ne disent pas ce qu'on leur fait dire : 0
- Corrigés d'exercice faux : 0
- Tirets cadratins : 0

La leçon est linguistiquement solide et honnêtement documentée. Ce qui la bloque
n'est pas une erreur de thaï, c'est une transcription régressée par rapport à la
leçon voisine et un appareil de preuve qui ne satisfait pas la politique alors
que les moyens de le satisfaire étaient disponibles le jour même.

Passage `draft → review` interdit tant que B1 à B5 ne sont pas résolus.
Revue native : en attente, non financée.
