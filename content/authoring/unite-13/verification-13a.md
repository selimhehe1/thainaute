# Contre-audit adversarial de `lecon-13a.md`

- Cible : `content/authoring/unite-13/lecon-13a.md` (1 792 lignes ; écrans =
  sections `## Enseignement`, `## Exercices`, `## Dialogue`)
- Date : 2026-08-04
- Posture : adversariale. Objectif = trouver des erreurs, pas confirmer. Aucune
  affirmation de ce rapport n'est écrite avant d'avoir été reproduite, soit par
  exécution de script, soit par lecture directe de la source citée. Les
  corrections que je propose sont elles-mêmes vérifiées avant d'être écrites,
  parce que plusieurs consolidateurs récents ont publié des corrections fausses.
- Priorités imposées : (1) toute affirmation de REGISTRE, corps d'entrée relu
  par moi-même ; (2) frontière reconnaissance contre production ; (3) réemplois
  du fondamental par `item-fields-check.mjs` ; puis graphie, NFC, sens, ton,
  longueur, IPA, cohérence, promesses, planchers, section 1 bis.
- Scripts d'appui écrits pour ce contre-audit, tous rejouables et versionnés :
  `scripts/verification/tmp-13a-blocs.mjs`,
  `scripts/verification/tmp-13a-graphie-items.mjs`,
  `scripts/verification/tmp-13a-decod.mjs`,
  `scripts/verification/tmp-13a-registres-unite.mjs`.

## Verdict

**5 findings bloquants, 7 non bloquants. 56 faits vérifiés par moi-même et
confirmés exacts.**

Il faut le dire avant les findings, parce que cela change la façon de les lire :
**l'appareil de preuve mécanique de ce fichier est le plus solide que j'aie
contrôlé.** Les dix-huit corps d'entrée du dictionnaire normatif que le dossier
dit avoir lus, je les ai relus un par un et **les dix-huit disent exactement ce
que le fichier leur fait dire**, y compris les résultats négatifs. Les sept
citations VOLUBILIS tombent sur la bonne ligne, avec le bon nombre de lignes et
la bonne colonne `DOM`. Les cinq rangs de fréquence, les trois empreintes
Unicode avec leurs deux numéros de ligne, l'empreinte du classeur VOLUBILIS que
j'ai retéléchargé, les cinq entrées Wiktionary : tout concorde au caractère
près. Les vingt-trois valeurs de plancher des cinq exercices, je les ai
recalculées à la main tirage par tirage : **les vingt-trois sont justes**, y
compris les deux probabilités binomiales et la simulation « unités 1 à 12
seules » de l'exercice 5, dont j'obtiens bien 7 sur 9 avec les échecs aux
tirages 3 et 9.

Les cinq bloquants ne portent donc pas sur les sources. Ils portent sur ce que
le fichier dit du **dépôt** et de **lui-même** : quatre des cinq sont des
phrases de vérification que le dépôt contredit, et la cinquième est un absolu
sur le français que la page d'à côté dément. Le motif commun est celui que le
fichier nomme lui-même à sa dernière page, appliqué cette fois à ses propres
conclusions : une conclusion tirée d'un script dont on n'a pas lu la convention
d'affichage produit toujours le résultat que l'auteur espère.

**Aucun bloquant sur la priorité 2.** La frontière reconnaissance contre
production est tenue sans exception : les sept items sont polis ou neutres, les
neuf corps d'entrée lus pour la leçon ne portent aucune étiquette `(ปาก)` ni
régionale, et rien de familier, d'intime ou de régional n'est mis en production.
Le piège de référence, จ้า, est non seulement évité mais retourné en matériel
pédagogique honnête, et j'ai relu l'entrée : c'est bien l'adjectif d'intensité,
trois gloses et deux exemples sur la couleur et la lumière, aucune valeur de
particule.

---

## Findings bloquants

### B1. Item 4 : « jamais publiée comme item autonome » est faux, cinq fois

**Ce que le fichier écrit** (item 4, champ `note_fr`, que le contrat d'item
destine à l'apprenant) :

> Cette valeur-là a bien été enseignée, en 2B, mais **jamais publiée comme item
> autonome** : le balayage du dépôt le montre, les douze graphies contenant ไหม
> sont soit ไหม la soie, soit des blocs entiers. 13A la publie enfin, en
> redéclarant la graphie avec une valeur différente.

**Mesure contradictoire.** `node scripts/verification/tmp-13a-graphie-items.mjs ไหม 1 12`
rend **six publications de la graphie ไหม comme item** dans les unités 1 à 12,
dont **cinq portent la valeur interrogative** :

| Leçon      | Item | `fr`                                      | `ipa`      | `ton`       |
| ---------- | ---- | ----------------------------------------- | ---------- | ----------- |
| `u01-l1d`  | 9    | la soie                                   | `/mǎj/`    | montant     |
| `u02-l2e`  | 10   | est-ce que (particule de question fermée) | `/maj˩˩˦/` | mǎi montant |
| `u04-l4e`  | 8    | est-ce que (particule de question fermée) | `/maj˩˩˦/` | montant     |
| `u05-l5e`  | 12   | particule de question fermée              | `/maj˩˩˦/` | montant     |
| `u07-l7e`  | 5    | particule de question fermée              | `/maj˩˩˦/` | montant     |
| `u11-l11d` | 2    | est-ce que (particule de question fermée) | `/maj˩˩˦/` | mǎi montant |

Le titre de l'item 5 de `u07-l7e` écrit même, en toutes lettres, que la graphie
a été « publiée par `u02-l2b` **puis isolée par `u02-l2e` item 10** ». Le dépôt
avait déjà tranché l'attribution que 13A revendique.

**Cause identifiée, et elle est reproductible.** Le fichier tire sa conclusion
de la ligne `repo-thai-scan.mjs 1 12 --grep`, qu'il reporte ainsi à son tableau
des contrôles : « ไหม : **12**, dont ไหม seul, publié par `u01-l1d` avec le sens
« la soie » ». Or ce mode **n'affiche qu'un seul fichier par graphie**, le
premier rencontré, et il compte des GRAPHIES distinctes, pas des items. Douze
graphies contenant ไหม, ce n'est pas douze items : le corpus en porte davantage,
et cinq d'entre eux sont exactement l'item que 13A dit inexistant. C'est le même
défaut de lecture de sortie que `u11-l11e` a documenté sur
`volubilis-lookup.mjs`, et que ce dossier cite pourtant comme leçon apprise.

**Conséquence sur la priorité 3, et c'est elle qui rend le finding bloquant.**
Le titre de l'item porte la référence `u01-l1d` item 9, donc
`item-fields-check.mjs` compare l'item du jour à **la soie**. Il en sort trois
« écarts » (`ipa`, `ton`, `codepoints`) que le dossier instruit longuement comme
une dérive de notation entre l'unité 1 et les unités récentes. Ces trois écarts
**disparaissent entièrement** si la référence pointe la bonne leçon : `u02-l2e`
item 10 porte `/maj˩˩˦/`, `mǎi montant`, `courte`, `mǎi` et
`U+0E44 U+0E2B U+0E21 (NFC)`, c'est-à-dire les cinq champs de 13A, à
l'identique. Le seul contrôle de fidélité de réemploi du dépôt a donc été
pointé sur la mauvaise cible, et l'arbitrage rendu porte sur un artefact.

**Correction proposée, vérifiée avant d'être écrite.** Titrer l'item
« ไหม, particule de question (réemploi, publié par `u02-l2e` item 10) », retirer
les trois écarts instruits 1 à 3, retirer la phrase « 13A la publie enfin »,
et corriger la ligne du tableau des blocs réemployés ainsi que la partie 5, qui
attribuent aujourd'hui ไหม à `u01-l1d`. La note peut garder ce qu'elle a de
juste et qui est vérifié : `u01-l1d` publie la graphie pour la soie, annonce la
valeur interrogative « enseignée plus tard », et le dictionnaire normatif
numérote bien ไหม ๑ et ไหม ๒.

### B2. Item 7 : « la seule particule non polie du fondamental » est démentie par la page 4 du même fichier

**Ce que le fichier écrit** (item 7, `note_fr`) :

> le bloc que vous employez d'un seul tenant depuis l'unité 6 se termine par une
> particule finale, et c'est **la seule du parcours fondamental qui ne soit pas
> une politesse**.

**Contradiction interne, sur écran.** La page 4 du même fichier présente quatre
particules et écrit de la quatrième :

> **ไหม** · mǎi · fait de l'énoncé une question
> Les trois premières disent qui parle et sur quel ton de politesse. **La
> quatrième ne dit rien de qui parle** : elle transforme la phrase.

ไหม est donc, dans la leçon elle-même, une particule finale du fondamental qui
n'est pas une politesse. Elle l'est aussi dans le corpus : elle est publiée
comme item par cinq leçons des unités 1 à 12 (voir B1), et elle ferme
réellement des blocs publiés, สบายดีไหม (`u02-l2e`), ไกลไหม (`u05-l5e`),
เขาสูงไหม (`u06-l6c`), ได้ไหม (`u11-l11a`). L'affirmation est fausse, et son
contre-exemple est à six pages d'elle.

**Pourquoi je la classe bloquante alors que le fichier la signale.**
L'incertitude 7 dit que la phrase « est plus forte que le contrôle qui la
porte » et redoute une particule enfouie dans un bloc long. Ce n'est pas le
problème : le contre-exemple n'est pas enfoui, il est enseigné à la page 4 et
publié comme item autonome. Une incertitude qui déclare un risque hypothétique
ne couvre pas une erreur réelle et déjà visible.

**Correction proposée.** « c'est la seule du parcours fondamental, avec ไหม, qui
ne soit pas une politesse » est vraie sous réserve du balayage déclaré ; plus
sûr encore, et suffisant pour le propos de la leçon : « et ce n'est pas une
politesse ». La formulation courte est déjà celle de l'exercice 2, paire 6,
qui est juste.

### B3. Page 3 : un absolu non sourcé sur le français, démenti par la page elle-même

**Ce que le fichier écrit** (page 3, première phrase de l'écran) :

> Le français n'a pas de mot qui fasse exactement cela.

puis, quatorze lignes plus bas, sur la même page :

> Au troisième, c'est **un petit mot** que vous ne sauriez pas traduire tout
> seul, et **qui pourtant fait tout le travail**.

Le « petit mot » en question est « hein », dans l'exemple « Tu viens, hein. » que
la page imprime. La page affirme donc que le français n'a pas de mot qui fasse
ce travail, puis montre un mot français qui le fait, en fin d'énoncé, sans
changer ce dont la phrase parle : les trois traits exacts de la définition
donnée à la page 2.

**Règle violée.** `docs/content-policy/sources-verification.md`, section 1 bis :
« Reste interdit : affirmer un absolu sur le français sans source ni
vérification possible. Les superlatifs et les « toujours » ou « jamais » sont
proscrits dans cette catégorie. » Un « n'a pas de mot qui » est un « jamais »
quantifié sur le lexique entier du français. Le mécanisme 2 invoqué par le
fichier demande de **reformuler en observation**, pas d'asserter puis d'inviter
à vérifier.

**Et l'incertitude 4 affirme le contraire de ce que la page fait** : « **Aucune
affirmation absolue n'est faite sur le français**, ni « jamais », ni
« toujours » ». C'est faux au premier mot de la page. La même page 4 écrit par
ailleurs « Aucune des quatre ne se traduit par un mot français », second absolu
de la même famille, alors que `u02-l2e` publie ไหม avec le `fr` « est-ce que
(particule de question fermée) ».

**Correction proposée, conforme au mécanisme 2.** « Le français fait ce travail
autrement, et vous pouvez en juger vous-même : c'est votre langue. » puis les
trois phrases d'essai. La page garde tout son effet et n'affirme plus rien sur
le lexique français. L'incertitude 4 se réécrit en conséquence.

### B4. Tableau des blocs réemployés : « 0 écart de transcription » est faux, et l'écart porte sur une chaîne exigée en saisie

**Ce que le fichier écrit** (état des audits, ligne « Réemploi ») :

> **vérifié par relecture manuelle**, 40 lignes de blocs comparées à leur leçon
> d'origine le 2026-08-04, **0 écart de transcription et 7 numéros d'items
> corrigés**

Le tableau porte en tête de sa troisième colonne : « Transcription publiée,
**reprise sans modification** ».

**Mesure contradictoire.** `node scripts/verification/tmp-13a-blocs.mjs` rejoue
les 40 lignes (41 contrôles, la ligne « อยู่ · ที่ไหน » en portant deux) contre
le champ `transcription` réel de chaque leçon citée. **Un écart, à la ligne
17** :

```
~~ สบายดี / สบายดีไหม [u02-l2e] transcription
     citée par 13A : sà·baai·dii / sà·baai·dii·mǎi
     publiée par u02-l2e : sà·baai dii / sà·baai dii mǎi
```

`u02-l2e` item 11 publie des ESPACES là où 13A cite des points médians. Les 39
autres lignes concordent, transcription et numéro d'item compris, ce qui rend
cet écart d'autant plus lisible : c'est le seul, et il est présenté comme
inexistant.

**Ce que l'écart révèle, et pourquoi il n'est pas cosmétique.** Le corpus lui
même est en désaccord avec lui-même : `u02-l2b` écrit `sà·baai·dii khráp`,
`u02-l2e` écrit `sà·baai dii`. 13A a silencieusement retenu la graphie de 2B
tout en citant 2E comme source. Or l'exercice 4 de 13A est un `recall` à saisie
libre dont la politique déclare : « Le séparateur `·` est **exigé** à
l'intérieur des mots polysyllabiques publiés comme tels, `sà·baai·dii` », avec
accent de ton obligatoire et non tolérant. Un apprenant qui a appris la forme
publiée par 2E échoue le tirage 5 sur un désaccord interne au dépôt, et le
dossier affirme qu'il n'y en a aucun.

**Correction proposée.** Écrire la valeur réellement publiée par la leçon citée,
ou citer `u02-l2b` items 6 et 7 pour la forme à points médians ; et porter le
désaccord `u02-l2b` contre `u02-l2e` à l'arbitrage, parce qu'une leçon ne
corrige pas l'item d'une autre, règle que ce fichier applique correctement
partout ailleurs.

### B5. Méta : le contrôle des fichiers sœurs est faux comme écrit, et il omet le seul fichier qui compte

**Ce que le fichier écrit** (Méta) :

> **Contrôle fait sur les trois fichiers sœurs le 2026-08-04, après leur
> apparition** : leurs champs `registre` disent tous, en propres termes,
> qu'aucune étiquette n'a été trouvée sur les entrées consultées. Les quatre
> leçons de l'unité concordent donc sans s'être vues.

**Mesure contradictoire**, `node scripts/verification/tmp-13a-registres-unite.mjs 13` :

1. **L'unité compte cinq leçons, pas quatre.** Le fichier le sait : sa propre
   ligne de répartition donne « 7 items en 13A, 8 en 13B, 8 en 13C, 8 en 13D, 2
   en 13E », et `repo-thai-scan.mjs 13 13` rend bien 5 fichiers, 33 entrées, 28
   graphies. Le contrôle a été fait sur l'état à quatre fichiers et n'a jamais
   été refait, alors que la Méta annonce deux réexécutions du relevé de
   coordination et une troisième juste avant de rendre.
2. **`lecon-13d.md` n'a donc jamais été contrôlé, et c'est précisément celui qui
   dément la phrase.** Ses huit items affirment sept fois « **familier** », avec
   étiquettes lues et citées : `(ปาก)` sur le second sens de แก, et des
   descriptions d'impolitesse ou de mépris tirées du corps des entrées pour กู,
   มึง, มัน, วะ, ไอ้, อี, เออ.
3. **Même restreinte aux trois autres, la phrase est fausse.** `lecon-13b.md`
   affirme « poli » sur cinq de ses huit items, `lecon-13c.md` reprend « neutre
   (poli avec la particule) » de `u06-l6e`, `lecon-13e.md` affirme « poli » sur
   son item 2. Ce sont des affirmations de registre, correctement adossées à des
   corps d'entrée lus, mais ce ne sont pas des « aucune étiquette trouvée ».

**Pourquoi bloquant.** C'est une affirmation de vérification portant sur la
dimension que le parcours avancé place au-dessus de toutes les autres, et elle
est fausse dans les deux sens : elle nie des affirmations de registre qui
existent, et elle proclame une concordance d'unité obtenue en n'ouvrant pas le
fichier qui aurait pu la contredire. La conclusion « les quatre leçons de
l'unité concordent, ce qui est le meilleur signal disponible en l'absence de
revue native » est un signal fabriqué.

**Correction proposée.** Restreindre la phrase à son périmètre vrai et vérifié :
« les trois particules du programme, นะ, สิ et ล่ะ, ne portent aucune étiquette
de registre, et les champs `registre` de 13B, 13C et 13E qui les concernent le
disent tous », puis constater séparément que 13D affirme « familier » sur
d'autres graphies, avec étiquettes lues, ce qui est cohérent et non
contradictoire.

---

## Findings non bloquants

### N1. `rid-lookup.mjs` : « 22 graphies interrogées » ; le dossier n'en documente que 12

Le tableau des contrôles mécaniques annonce « **22 graphies interrogées** au
total, dont 10 en contrôle de présence pour cette leçon ». Le dossier documente
les 10 (แล้ว, คุณ, ไป, สบาย, ดี vedettes ; สบายดี, แล้วคุณล่ะ, สบายดีไหม, ไปครับ,
มั้ย absents), puis deux de plus (หวัดดี, ตังค์). **12, et je n'ai trouvé aucune
autre interrogation citée ailleurs dans le fichier** ; en comptant ล่ะ, mentionné
à l'item 7, on arrive à 13. Les dix restantes n'existent nulle part dans le
dossier. J'ai rejoué les douze : les cinq vedettes, les sept absences, tout est
exact. C'est le total qui ne l'est pas, et la sixième priorité du contre-audit
demandée par le fichier lui-même vise exactement ce chiffre en promettant qu'il
est « donné en blocs qui s'additionnent ».

### N2. VOLUBILIS : « recherches exactes rendant ABSENT, consignées (6) » ; il y en a cinq

La liste est : « สบายดีไหมครับ, สบายดีไหมคะ, ไปครับ, ไปค่ะ, ล่ะ **et ล่ะ seul** ».
ล่ะ y figure deux fois pour faire six. J'ai rejoué les cinq recherches sur
l'exemplaire dont j'ai revérifié l'empreinte : les cinq rendent bien ABSENT, et
le faux « absent » de ล่ะ est réel et correctement expliqué. Le décompte, lui,
vaut 5.

### N3. Décodabilité : le corpus est donné à 3 577, je mesure 3 581

`node scripts/verification/tmp-13a-decod.mjs` reproduit **exactement** les trois
chiffres qui portent la démonstration : 54 chaînes thaïes d'écran, 50 retrouvées,
4 instruites, et ce sont bien les quatre mêmes (แล้วคุณ, จ้า, et les deux
cellules de dialogue qui joignent deux phrases publiées). Le quatrième chiffre
ne tombe pas : le corpus des unités 1 à 12 rend **3 581** chaînes distinctes, et
non 3 577, avec la convention que le dossier décrit lui-même, quelle que soit la
variante d'espace testée. Écart de quatre, sans effet sur la conclusion, mais
non reproductible.

### N4. Les planchers et le croisement sont annoncés « produits par script », et aucun script n'est versionné

Le fichier écrit « comptes produits par script le 2026-08-04 » aux cinq
exercices, « le script de calcul simule la stratégie tirage par tirage et
imprime ses deux échecs » à la partie 1, et « convention d'entrée de
`repo-thai-scan.mjs` recopiée telle quelle dans un fichier de travail » à la
partie 5. **Aucun de ces scripts n'est dans le dépôt**, alors que ses quatre
leçons sœurs ont versionné les leurs (`tmp-13b-planchers.mjs`,
`tmp-13c-planchers.mjs`, `tmp-13d-planchers.mjs`, `tmp-13e-planchers.mjs`, plus
`tmp-13d-coordination.mjs`). L'amendement v1.2 exige qu'un tiers puisse refaire
la consultation à l'identique ; l'en-tête de `repo-thai-scan.mjs` va plus loin,
« un décompte interne cité par une leçon est produit par CE script, ou il n'est
pas cité ».

**Je note pour la consolidation que j'ai refait ces calculs à la main et qu'ils
sont tous justes** : réponse constante 1/12 sur douze bonnes réponses distinctes,
position constante 4/12 et 0,386 % d'atteinte de 9 sur 12, carte la plus longue
3 strictement plus 1 ex aequo, la plus courte 2 plus 1, ครับ 2,00 sur 10
applicables, ค่ะ 2,00 sur 7, คะ 3,50 sur 8, ไหม 3,50 sur 11 ; bijection 1/720 et
12,5 % avec espérance 3 ; ordre d'apparition 0,9583 sur 6 et règle de politesse
seule 2,500 sur 6 avec 2,083 % d'atteinte du seuil ; huit réponses distinctes au
`recall` ; 3 sur 9 constant, 0,0965 % au hasard, et 7 sur 9 pour la meilleure
stratégie « unités 1 à 12 seules », avec échecs exactement aux tirages 3 et 9.
Le finding porte sur la reproductibilité, pas sur les valeurs.

### N5. Dialogue : « les douze répliques » contre « treize lignes », dans le même fichier

La contrainte de production écrit « **Les douze répliques** portent DOUZE zones
finales » ; la remarque de lecture, quinze lignes plus bas, écrit « sans une
seule exception **sur treize lignes** » ; et le dossier écrit « les **treize**
répliques du dialogue ». Le tableau en porte treize. J'ai contrôlé les treize
lignes une par une : toutes les répliques de Malee finissent par ค่ะ ou คะ,
toutes celles de Paul par ครับ, et le partage question contre non-question chez
Malee est exact. Seul le douze est faux.

### N6. Item 7 : le sens du bloc ne repose que sur une jambe, et l'état des audits en annonce deux

L'état des audits écrit « Sens : vérifié pour les 7, **sur deux autorités
indépendantes chacune**, la seconde jambe étant en.wiktionary pour les items 1 à
3 et 6, et VOLUBILIS hors `DOM RID` pour les items **4, 5 et 7** ». Pour l'item
7, แล้วคุณล่ะ « et vous ? », la ligne 47348 de VOLUBILIS est la seule source qui
porte le SENS du bloc : le dictionnaire normatif n'a pas la vedette, ce que le
dossier consigne lui-même, et en.wiktionary n'a pas été consulté pour ce bloc,
sa liste d'entrées lues étant ครับ, ค่ะ, คะ, ไหม et สบายดีไหม. Les deux entrées
RID citées à l'item, ล่ะ et l'entrée groupée ไหน ๒, attestent la valeur et la
position de ล่ะ, pas le sens du bloc. La dette vient de `u06-l6e`, qui ne
disposait que de deux lignes du même classeur ; ce qui appartient à 13A est la
phrase « deux autorités indépendantes chacune ».

### N7. Item 4 : la seconde lecture de en.wiktionary est gommée, alors que celle de ค่ะ est consignée

Le fichier se félicite, à juste titre, d'avoir consigné la seconde lecture
`/kʰaʔ˨˩/` de ค่ะ : « La seconde lecture est **consignée plutôt que gommée** ».
J'ai relu la page de ไหม en rendu le même jour : son **étymologie 1**, celle de
la particule, porte **deux** lectures phonémiques, ไหฺม `/maj˩˩˦/` (Paiboon
`mǎi`) et ไม้ `/maj˦˥/` (Paiboon `mái`). 13A ne cite que la première. Ce n'est
pas anodin dans cette leçon précise : le tirage 11 de l'exercice 1 fait entendre
ไหม contre ไม้ et ไม่, et `u01-l1d` avertit dans son propre item 9 que « son ton
en parole courante varie selon les sources ». La même honnêteté que pour ค่ะ
demande une ligne, et elle renforcerait le traitement déjà correct de มั้ย.

---

## Ce que j'ai vérifié et confirmé exact (56 faits)

Relevé le 2026-08-04, par exécution ou lecture directe, jamais par recopie du
fichier audité.

**Dictionnaire normatif, dix-huit corps d'entrée relus par
`node scripts/verification/rid-entry.mjs` (1 à 16).** ครับ : vedette unique, ว.,
lecture `[คฺรับ]`, mot de réponse ou de fin, poli, locuteur homme, aucune
étiquette de registre. ค่ะ : ว., mot de réponse d'une femme puis mot de fin
poli, exemples imprimés ไปค่ะ et ไม่ไปค่ะ, aucune lecture entre crochets, aucune
étiquette. คะ : deux vedettes, คะ ๑ contraction poétique, คะ ๒ ว. après question
ou doute puis **après ซิ ou นะ**, exemples pour les deux cas, aucune étiquette.
ไหม : trois vedettes, ไหม ๒ ว. mot de question venant de หรือไม่ avec un exemple,
ไหม ๑ papillon et soie, ไหม ๓ marqué (โบ) et (กฎ), aucune étiquette sur ไหม ๒.
ล่ะ : vedette unique ว., appuie ce qui précède, deux exemples dont un
interrogatif, équivalent de เล่า, aucune étiquette. จ้า : ว., trois gloses
d'intensité, deux exemples sur la couleur et la lumière, aucune valeur de
particule, aucune étiquette. เว้า : **`(ถิ่น-อีสาน)`** sur la première vedette.
เจ๊ง : **`(ปาก)`** sur le premier sens. แจ๋ว : **`(ปาก)`** sur le second sens
seulement. เยอะ et เชียว : aucune `(ปาก)`, sondages négatifs confirmés. นะ : deux
vedettes, la première décrite du côté de la prière, de l'ordre et de l'appui,
aucune étiquette. สิ : vedette unique, mot de fin d'énoncé donnant du relief,
surtout avec un verbe, aucune étiquette. จ๊ะ : deux vedettes, จ๊ะ ๑ venant après
นะ ou ซิ ou après une question, aucune étiquette. ไหน : entrée groupée
« ไหน ๒, ไหนล่ะ, ไหนว่า, ไหนว่าจะ » attestée. คำลงท้าย : formule de fin de LETTRE
avant la signature, deux exemples épistolaires. วิภัตติ : sens grammatical (ไว)
portant sur la flexion en pali ; อนุภาค : particule au sens de la physique.

**Contrôles de présence (17).** `rid-lookup.mjs` : แล้ว, คุณ, ไป, สบาย, ดี sont
vedettes ; สบายดี, แล้วคุณล่ะ, สบายดีไหม, ไปครับ, มั้ย, หวัดดี et ตังค์ sont
absents.

**VOLUBILIS (18 à 26).** Classeur retéléchargé et empreinte revérifiée avant
citation : `VOLUBILIS_Database.xlsx`, **10 848 409 octets**, SHA-256
`b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c`, **114 579
lignes non vides et 586 541 chaînes partagées**. ครับ lignes 37006 et 37007 (2
lignes), `DOM` `RID ; TOURIST`, et le piège de la ligne 37006 est bien là :
`yeah (inf.)` et `ouais (fam.)` portent sur les GLOSES. ค่ะ ligne 28945 (1),
`\kha`, `(f.)`, `DOM` `CHAT ; RID ; TOURIST`. คะ ligne 28944 (1), `¯kha`,
`DOM` `RID ; TOURIST`. ไหม lignes 51644 à 51647 (4), la 51647 portant TYPE
`part. (interr.)` et `DOM` `TOURIST` **sans `RID`**. แล้วคุณล่ะ ligne 47348 (1),
colonne `DOM` **vide**, marqueurs `¯ - \`. สบายดีไหม ligne 85508 (1), `DOM`
`TOURIST`, SYLLAB `[สะ-บาย ดี ไหฺม]`. นะ ligne 57471 (1), `DOM` `GRAMMA ; RID`,
glose française conforme. Cinq recherches exactes rendant ABSENT.

**Wiktionary, cinq entrées lues en rendu (27 à 31).** ครับ : `Particle`,
`/kʰrap̚˦˥/`, Paiboon `kráp`, RI `khrap`, étiquettes **« formal, humble, men's
speech »**, glose conforme, étymologie « corrupted from ขอรับ », formes
alternatives dont ครัช et คับ. ค่ะ : `Interjection` et `Particle`, `/kʰaʔ˥˩/`
plus seconde lecture `/kʰaʔ˨˩/`, note « formerly used by noblemen, now often
employed by women », étymologie rattachée à ข้า. คะ : `/kʰaʔ˦˥/`, glose
conforme, et **aucune note sur la position de คะ après une autre particule**,
comme le dossier l'affirme. ไหม : étymologie 1 `Particle`, contraction de
หรือ + ไม่, glose « or not? », forme alternative มั้ย, étymologies 2 et 3
distinctes. สบายดีไหม : entrée de guide de conversation, `/sa˨˩.baːj˧.diː˧.maj˩˩˦/`,
et les deux exemples glosés « male speaker, polite » avec ครับ et « female
speaker, polite » avec คะ.

**Unicode (32 à 34).** Les trois empreintes et les trois tailles sont exactes.
`PropList.txt` **ligne 1461** porte bien `0E40..0E44 ; Logical_Order_Exception` ;
`IndicPositionalCategory.txt` **ligne 384** porte bien
`0E40..0E44 ; Visual_Order_Left` ; en-tête `IndicPositionalCategory-17.0.0.txt`
daté du 2025-07-29.

**Fréquence (35 à 36).** `th_50k.txt`, **1 504 712 octets**, SHA-256
`20e7052f...b6083`, 50 000 lignes. ครับ rang 10 (15 205), ค่ะ rang 21 (10 059),
คะ rang 278 (1 335), ล่ะ rang 586 (659), ไหม rang 966 (399).

**Scripts du dépôt (37 à 46).** `repo-thai-scan.mjs 1 12` : 60 fichiers, 525
entrées, 353 graphies, 114 ไม้เอก, 90 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา.
`repo-thai-scan.mjs 13 13` : 5 fichiers, 33 entrées, 28 graphies, 6 ไม้เอก.
`--grep` : นะ 0, ล่ะ 2, ครับ 41. `unicode-thai.mjs` : 7 champs `thai`, 112
chaînes distinctes, 107 hors des champs, NFC toutes conformes, aucune zone à
usage privé. `item-fields-check.mjs` : code 0, 0 champ `codepoints` en faute.
Répartition d'items 7 / 8 / 8 / 8 / 2. Cinq collisions d'attribution, dont
quatre touchent 13A. Onze redéclarations sur sept graphies distinctes, 6 / 3 / 2
/ 0 / 0. Décodabilité 54 / 50 / 4 avec les quatre mêmes chaînes. Trente-neuf des
quarante lignes du tableau des blocs, numéro d'item et transcription compris.

**Réemplois et cohérence (47 à 56).** Les champs `fr`, `registre`, `ipa`, `ton`,
`longueur` et `transcription` des items 1, 2, 3, 5, 6 et 7 concordent avec leurs
leçons d'origine, y compris la réserve héritée de `u09-l9e` sur l'item 6 et le
retrait, hérité de `u06-l6e`, de la valeur de relance de ล่ะ. `u06-l6e` écrit
bien « neutre, courant à l'oral » au registre de son item 1, et l'arbitrage 4 de
13A est fondé. `u01-l1d` item 9 est bien la soie, avec la note annonçant la
valeur interrogative « enseignée plus tard ». Les vingt-trois valeurs de
plancher des cinq exercices sont justes. L'exercice 5 est bien réparti 3 / 3 / 3
par option et ses neuf réponses sont correctes une à une. Le dialogue tient ses
treize fins. Aucun tiret cadratin ou demi-cadratin sur un écran. Aucune promesse
de parler comme un natif, aucune promesse de résultat, aucune durée annoncée
hors « 15 minutes » de durée visée. Aucun exercice n'est franchissable par une
réponse constante.

## Ce que je n'ai PAS pu vérifier

- Les tirages audio, aucun fichier n'étant produit ; la contrainte de voix
  appariées pour les tirages 1 à 4 de l'exercice 1 reste bloquante et non
  résolue, comme le dossier le déclare.
- La naturalité des enchaînements du dialogue, qui demande une oreille native.
  **Revue native : en attente**, et rien dans ce rapport ne la remplace.
- Le total de 22 interrogations de `rid-lookup.mjs` (N1), faute de trace.
