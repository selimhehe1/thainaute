# Conventions d'autorat des leçons Thaïnaute

- Date : 3 août 2026
- Statut : v1, appliquée à partir de l'unité 1
- Ces fichiers d'autorat sont la source éditoriale humaine. Ils précèdent la
  compilation vers les schémas `packages/content` et ne sont JAMAIS publiés
  tels quels. Tout reste `draft` tant que la chaîne d'audit n'est pas passée.

## Format d'un fichier de leçon

Un fichier Markdown par leçon : `unite-XX/lecon-XXy.md` (y = a à e), avec
ces sections dans cet ordre :

1. `## Méta` : identifiant, titre français, objectif observable, prérequis,
   cible phonétique, durée visée.
2. `## Enseignement` : la ou les pages d'enseignement (2 à 4 phrases
   maximum chacune, ton direct et chaleureux, pensées pour une oreille
   française ; spécimen thaï à afficher ; jamais de tiret cadratin).
3. `## Items` : chaque item linguistique avec TOUS les champs du contrat
   (voir ci-dessous).
4. `## Exercices` : les exercices avec mécanique, consigne, options,
   réponse correcte, feedback correct/incorrect explicatif, pièges connus.
5. `## Dialogue` (si la leçon en contient un) : répliques avec locuteur,
   thaï, transcription, français.
6. `## SRS` : les items à réviser et leur critère de maîtrise.
7. `## Note culturelle` (facultative) : contextualisée, chaque fait sourcé.
8. `## Dossier de production` : acteur de génération (modèle, date),
   incertitudes signalées par l'auteur, état des audits.

## Contrat d'un item linguistique

Chaque item comporte obligatoirement :

- `thai` : graphie thaïe (Unicode NFC, jamais normalisée silencieusement) ;
- `codepoints` : la séquence U+XXXX exacte ;
- `ipa` : transcription API ;
- `ton` : par syllabe (moyen, bas, descendant, haut, montant) ;
- `longueur` : par syllabe (courte, longue) ;
- `fr` : traduction française naturelle ;
- `litteral` : traduction littérale si elle éclaire (facultatif) ;
- `transcription` : transcription pédagogique Thaïnaute (voir ci-dessous) ;
- `registre` : neutre, poli, familier, formel ;
- `note_fr` : la difficulté spécifique pour un francophone, si pertinente ;
- `sources` : au moins DEUX sources indépendantes de la politique
  `docs/content-policy/sources-verification.md`, chacune avec URL exacte de
  l'entrée consultée et date de consultation. Le RID prime en orthographe.

## Transcription pédagogique Thaïnaute (thainaute-fr-v1)

Calibrée pour un œil francophone, toujours affichée sous le thaï, jamais
seule. Écarts au RTGS documentés ici :

- Consonnes : `k t p` non aspirées (comme en français) ; `kh th ph`
  aspirées (le h rappelle le souffle) ; `ng` pour ง y compris à l'initiale ;
  `j` pour จ ; `ch` pour ฉ/ช ; `y` pour ย ; `w` pour ว ; `r` pour ร ;
  `l` pour ล ; `s` pour ส/ศ/ษ ; `h` pour ห/ฮ ; `b d` pour บ ด ;
  `bp dt` ne sont PAS utilisés (choix : `p t` non aspirés suffisent à un
  francophone qui ne les aspire jamais).
- Voyelles (lecture française) : `a i o` valeurs françaises ; `ou` pour
  /u/ (อู) ; `é` pour /e/ (เอ) ; `è` pour /ɛ/ (แอ) ; `eu` pour /ɤ/ (เออ) ;
  `ue` pour /ɯ/ (อือ, préciser en leçon : « i avec les lèvres étirées ») ;
  `aw` pour /ɔ/ (ออ).
- Longueur : voyelle DOUBLÉE si longue (`aa`, `ouou` s'écrit `oû`), simple
  si courte. Exception lisibilité : les digrammes longs prennent l'accent
  circonflexe (`é` court, `ê` long ; `è` court, `êè` non : `èè`).
  Règle simple retenue : COURTE = graphie simple, LONGUE = graphie doublée
  (`aa`, `ii`, `éé`, `èè`, `oo`, `awaw` s'écrit `aww`), sauf `oû` pour /uː/.
- Tons, par diacritique sur la première voyelle de la syllabe :
  moyen `a` (rien), bas `à`, descendant `â`, haut `á`, montant `ǎ`.
- Séparateur de syllabes : point médian `·` dans les mots polysyllabiques.

## Amendement v1.1 (3 août 2026) : résolution des collisions de diacritiques

Les rédacteurs de l'unité 1 ont détecté trois collisions dans la v1.
Décisions :

1. **Les diacritiques sont réservés aux tons.** Les qualités vocaliques
   n'utilisent plus d'accent : `e` pour /e/ (et non plus `é`), `ae` pour /ɛ/
   (et non plus `è`), `oe` pour /ɤ/ (remplace `eu`, évite la lecture « e »),
   `ue` pour /ɯ/, `o` pour /o/, `aw` pour /ɔ/, `ou` pour /u/. Chaque
   graphème est présenté avec son équivalent français en leçon (« ae se lit
   comme le è de père »).
2. **Longueur** : on double la DERNIÈRE lettre du graphème (`aa`, `ii`,
   `ee`, `aee`, `oee`, `uee`, `oo`, `aww`, `ouu`). `oû` est abandonné.
3. **Diphtongues** : `ai` pour /aj/, `ao` pour /aw/ diphtongue. Règle de
   lecture enseignée : « aw = o ouvert, ao = a puis o ».
4. Le ton se marque sur la PREMIÈRE lettre du noyau vocalique : `khàa`,
   `pòuu`, `dàek`.

La migration des cinq leçons de l'unité 1 vers v1.1 se fait à la
consolidation, après le contre-audit.

## Amendement v1.2 (3 août 2026) : ce qu'est une référence recevable

Un auditeur de l'unité 3 a montré que le contrat d'item était
insatisfaisable tel qu'écrit : il exigeait « l'URL exacte de l'entrée
consultée » pour chaque source, alors que les deux sources les plus fiables
n'en ont pas. Le RID s'interroge en POST sur un endpoint unique, et
Volubilis est un classeur, pas un site. Exiger une URL par entrée
poussait donc soit à citer une URL qui ne mène nulle part, soit à écarter
les meilleures sources.

Ce qui est réellement exigé n'est pas une URL : c'est qu'un tiers puisse
**refaire la consultation à l'identique**. Chaque source porte donc une
référence reproductible, dans la forme que sa nature impose :

- **site avec entrée adressable** : l'URL exacte de l'entrée (Wiktionary) ;
- **service interrogeable** : l'endpoint et la requête exacte, par exemple
  `POST dictionary.orst.go.th/func_lookup.php` avec
  `word=<graphie>&funcName=lookupWord&status=lookup` ;
- **fichier** : nom, version, origine de téléchargement, feuille et numéro
  de ligne (Volubilis `VOLUBILIS.ods` v26.2, feuille `Volubilis`, ligne N) ;
- **standard** : nom, version et fichier ou section (Unicode 17.0,
  `IndicPositionalCategory.txt`).

La date de consultation reste obligatoire dans tous les cas, et
l'exigence de **deux sources indépendantes par fait** ne change pas.

## Arbitrage v1.2 : la marque de ton sur les digrammes

`tè` (เตะ) et `tàe` (แตะ) portent le même ton bas, mais la marque tombe
sur des lettres d'aspect différent, parce que la règle v1.1 la place sur la
première lettre du noyau vocalique. La règle est conservée : elle est
prévisible et sans exception, et la changer imposerait de retranscrire
trois unités. En contrepartie, toute leçon qui présente ensemble deux
voyelles dont l'une s'écrit en digramme doit **montrer la paire côte à
côte** et nommer le noyau, plutôt que laisser l'apprenant deviner pourquoi
l'accent se déplace.

## Règles d'écriture produit

- Jamais de tiret cadratin ni demi-cadratin dans les textes destinés à
  l'écran (règle fondateur, ADR-0022).
- Ton rédactionnel : direct, chaleureux, adulte ; jamais de culpabilisation.
- Une erreur d'apprenant reçoit un indice, jamais une punition.
- Aucune promesse non mesurée (pas de « vous serez bilingue en X mois »).

## Chaîne de production

1. Rédaction originale (aucune copie de formulation, même de source libre).
2. Vérification : chaque fait contrôlé contre deux sources de la politique,
   URL + date consignées dans l'item.
3. Contre-audit interne : agents indépendants par dimension (orthographe,
   sens, prononciation, ton, longueur, registre, naturalité, Unicode,
   licence), consignes adversariales, findings bloquants consignés.
4. Lot de contre-audit externe : prompts préparés pour `GPT-5.6 SOL ULTRA`
   dans `unite-XX/contre-audit-gpt56.md` (aucun appel API sans budget).
5. Résolution des findings, puis passage `draft → review`.
6. `Revue native : en attente` reste affiché partout jusqu'à financement.
