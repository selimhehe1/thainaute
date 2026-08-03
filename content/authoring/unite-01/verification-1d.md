# Vérification adversariale de la leçon 1D (u01-1d)

- Auditeur : agent de contre-audit indépendant (Claude Fable 5,
  `claude-fable-5`), consignes adversariales.
- Date des consultations : 2026-08-03. Toutes les URLs ci-dessous sont mes
  propres consultations, refaites indépendamment ; les URLs du rédacteur
  n'ont jamais été prises comme preuve.
- Méthode : recoupement en.wiktionary et th.wiktionary (entrées distinctes,
  contours IPA lus directement), tentative d'accès au RID
  (dictionary.orst.go.th), liste de fréquence FrequencyWords (Hermit Dave,
  OpenSubtitles th, top 50k, politique §4), vérification locale des
  codepoints et de la forme NFC par script Python sur le fichier source.
- Rappel de la règle : tout fait contredit ou non vérifiable est BLOQUANT.

## Vérification locale des codepoints (outillage, 2026-08-03)

Script Python exécuté sur `lecon-1d.md` : extraction des champs `thai`,
comparaison caractère par caractère avec les champs `codepoints` déclarés,
test NFC (`unicodedata.normalize`).

Résultat : les 10 items correspondent exactement à leurs codepoints déclarés
et sont tous en forme NFC. Aucun tiret cadratin ni demi-cadratin dans le
fichier (grep `[—–]` : aucun résultat).

## Item 1. หมา (chien)

- Graphie et codepoints U+0E2B U+0E21 U+0E32 : **CONFIRMÉ** (vérification
  locale ci-dessus).
- Sens « chien » : **CONFIRMÉ**. en.wiktionary : « any canine animal »,
  sens principal chien. th.wiktionary : mammifère de la famille Canidae.
- Ton montant : **CONFIRMÉ**. IPA /maː˩˩˦/ identique sur les deux entrées.
- Longueur longue : **CONFIRMÉ** (/aː/).
- IPA /mǎː/ : **CONFIRMÉ** (équivalent de /maː˩˩˦/).
- Transcription `mǎa` : **CONFORME** (ton sur la première lettre du noyau,
  voyelle doublée pour la longueur).
- Registre « neutre » : **CONTREDIT**. en.wiktionary note explicitement que
  สุนัข « is often used instead » « for formality or politeness », et les
  deux entrées marquent des emplois figurés de หมา comme argotiques,
  vulgaires et injurieux (th.wiktionary : สแลง, หยาบคาย, ดูหมิ่น).
  Correction proposée : registre « courant, familier » avec note_fr
  complétée : « mot normal à l'oral ; สุนัข est la forme polie et formelle ;
  appliqué à une personne, หมา est insultant ».
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/หมา
  - https://th.wiktionary.org/wiki/หมา

## Item 2. ม้า (cheval)

- Graphie et codepoints U+0E21 U+0E49 U+0E32 : **CONFIRMÉ**.
- Sens « cheval » : **CONFIRMÉ** (Equus caballus, sens premier des deux
  entrées ; les autres sens sont secondaires ou argotiques et ne sont pas
  enseignés).
- Ton haut : **CONFIRMÉ**. IPA /maː˦˥/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ** (/aː/).
- IPA /máː/ : **CONFIRMÉ**.
- Transcription `máa` : **CONFORME**.
- Registre « neutre » : **CONFIRMÉ** pour le sens « cheval ».
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/ม้า
  - https://th.wiktionary.org/wiki/ม้า

## Item 3. ขา (jambe)

- Graphie et codepoints U+0E02 U+0E32 : **CONFIRMÉ**.
- Sens « jambe » : **CONFIRMÉ** (etymology 1 : « anatomical leg » ;
  th.wiktionary : membre allant de l'aine à la cheville).
- Ton montant : **CONFIRMÉ**. IPA /kʰaː˩˩˦/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ**.
- IPA /kʰǎː/ : **CONFIRMÉ** (aspiration kʰ présente dans les deux entrées).
- Transcription `khǎa` : **CONFORME** (`kh` aspiré selon les conventions).
- Registre « neutre » : **CONFIRMÉ** pour le sens « jambe » (les sens
  archaïques ou féminins relèvent d'autres étymologies, non enseignées).
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/ขา
  - https://th.wiktionary.org/wiki/ขา

## Item 4. ค้า (faire commerce, vendre)

- Graphie et codepoints U+0E04 U+0E49 U+0E32 : **CONFIRMÉ**.
- Sens « faire commerce, vendre » : **CONFIRMÉ** (« to trade; to sell » ;
  th.wiktionary : acheter et vendre des biens ou services, verbe transitif).
- Ton haut : **CONFIRMÉ**. IPA /kʰaː˦˥/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ**.
- IPA /kʰáː/ : **CONFIRMÉ**.
- Transcription `kháa` : **CONFORME**.
- Registre et note sur les composés (การค้า) : **CONFIRMÉ** sur le fond,
  les deux entrées listent การค้า, ค้าขาย, ลูกค้า, สินค้า, ร้านค้า.
  Voir remarque non bloquante 3 (format du champ) et remarque 2 (fréquence
  en emploi isolé).
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/ค้า
  - https://th.wiktionary.org/wiki/ค้า

## Item 5. หนา (épais)

- Graphie et codepoints U+0E2B U+0E19 U+0E32 : **CONFIRMÉ**.
- Sens « épais, épaisse » : **CONFIRMÉ** (en.wiktionary : « thick »,
  antonyme บาง ; th.wiktionary : adjectif épais/dense, nom abstrait
  ความหนา).
- Ton montant : **CONFIRMÉ**. IPA /naː˩˩˦/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ**.
- IPA /nǎː/ : **CONFIRMÉ**.
- Transcription `nǎa` : **CONFORME**.
- Registre « neutre » : **CONFIRMÉ**.
- Note_fr sur le ห muet : **CONFIRMÉ** (le ห nam n'est pas prononcé, le mot
  commence par /n/ dans l'IPA des deux entrées).
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/หนา
  - https://th.wiktionary.org/wiki/หนา

## Item 6. น้า (oncle ou tante plus jeune que la mère)

- Graphie et codepoints U+0E19 U+0E49 U+0E32 : **CONFIRMÉ**.
- Sens précis « frère ou sœur cadet de la mère, côté maternel » :
  **CONFIRMÉ**. en.wiktionary : « younger sibling of one's mother; maternal
  uncle or aunt » et, en second sens, « person younger than one's mother ».
  th.wiktionary : cadet de la mère, et personne plus jeune que la mère à qui
  l'on s'adresse.
- Ton haut : **CONFIRMÉ**. IPA /naː˦˥/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ**.
- IPA /náː/ : **CONFIRMÉ**.
- Transcription `náa` : **CONFORME**.
- Registre « neutre, familial » : **CONFIRMÉ**.
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/น้า
  - https://th.wiktionary.org/wiki/น้า

## Item 7. หนี (fuir)

- Graphie et codepoints U+0E2B U+0E19 U+0E35 : **CONFIRMÉ**.
- Sens « fuir, s'échapper » : **CONFIRMÉ** (« to escape; to flee; to evade;
  to avoid » ; th.wiktionary : s'enfuir, éviter, verbe transitif).
- Ton montant : **CONFIRMÉ**. IPA /niː˩˩˦/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ** (/iː/).
- IPA /nǐː/ : **CONFIRMÉ**.
- Transcription `nǐi` : **CONFORME**.
- Registre « neutre » : **CONFIRMÉ**.
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/หนี
  - https://th.wiktionary.org/wiki/หนี

## Item 8. นี้ (ce, cette)

- Graphie et codepoints U+0E19 U+0E35 U+0E49 : **CONFIRMÉ** (ordre correct :
  voyelle U+0E35 puis ton U+0E49).
- Sens « ce, cette (démonstratif) » : **CONFIRMÉ** (déterminant « this /
  these » ; th.wiktionary : mot accompagnant un nom proche ou désigné).
- Ton haut : **CONFIRMÉ**. IPA /niː˦˥/ sur les deux entrées.
- Longueur longue : **CONFIRMÉ**.
- IPA /níː/ : **CONFIRMÉ**.
- Transcription `níi` : **CONFORME**.
- Note_fr « un des mots les plus fréquents du thaï » : **CONFIRMÉ** par mon
  contrôle indépendant : rang 318 sur 50 000 dans FrequencyWords th_50k
  (token isolé ; encore plus fréquent en composés comme วันนี้, คนนี้).
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/นี้
  - https://th.wiktionary.org/wiki/นี้
  - https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_50k.txt

## Item 9. ไหม (la soie)

- Graphie et codepoints U+0E44 U+0E2B U+0E21 : **CONFIRMÉ**.
- Sens « la soie » : **CONFIRMÉ** (en.wiktionary : silkworm, thread, silk ;
  th.wiktionary étymologie 1 : bombyx et fil de soie).
- Ton montant pour le sens « soie » : **CONFIRMÉ**. IPA /maj˩˩˦/ sur les
  deux entrées pour ce sens.
- Longueur courte : **CONFIRMÉ**. L'IPA des deux entrées est /maj/ sans
  marque de longueur, en contraste direct avec ไม้ /maːj/.
- IPA /mǎj/ : **CONFIRMÉ**.
- Transcription `mǎy` : **CONTREDIT** (non-conformité aux conventions).
  La v1 ne définit aucune notation pour la diphtongue /aj/ (le `y` de la
  table des consonnes note ย à l'initiale, pas un off-glide), et
  l'amendement v1.1 §3 impose `ai` pour /aj/. Correction proposée : `mǎi`.
- Registre « neutre » : **CONFIRMÉ**.
- Note_fr sur la particule interrogative homographe : fond **CONFIRMÉ**
  (divergence réelle entre sources), voir remarque non bloquante 1 pour une
  imprécision du dossier de production.
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/ไหม
  - https://th.wiktionary.org/wiki/ไหม

## Item 10. ไม้ (le bois, l'arbre)

- Graphie et codepoints U+0E44 U+0E21 U+0E49 : **CONFIRMÉ**.
- Sens « le bois, l'arbre, la plante » : **CONFIRMÉ** (plant, tree, wood,
  timber ; th.wiktionary : terme générique des végétaux, bois, classifieur
  d'objets en bois).
- Ton haut : **CONFIRMÉ**. IPA /maːj˦˥/ sur les deux entrées.
- Longueur longue malgré la graphie courte : **CONFIRMÉ**. Les deux entrées
  donnent /aː/ avec marque de longueur, et l'entrée anglaise oppose la
  romanisation « mai » à la voyelle réellement longue.
- IPA /máːj/ : **CONFIRMÉ**.
- Transcription `máay` : **CONTREDIT** (même non-conformité que l'item 9 :
  v1.1 impose `ai` pour /aj/). Correction proposée : `máai`, ET décision de
  convention à trancher : la notation de la longueur dans les diphtongues
  (/aj/ court contre /aːj/ long) n'est définie ni en v1 ni en v1.1.
- Registre « neutre » : **CONFIRMÉ**.
- URLs consultées le 2026-08-03 :
  - https://en.wiktionary.org/wiki/ไม้
  - https://th.wiktionary.org/wiki/ไม้

## Recoupement RID et indépendance des sources

- Tentative 1 : https://dictionary.orst.go.th/ le 2026-08-03. Page
  d'accueil accessible, formulaire de recherche présent, aucun contenu
  d'entrée accessible, pas de recherche par URL constatée.
- Tentative 2 : https://dictionary.orst.go.th/lookup_graph.php?word=หมา le
  2026-08-03 : HTTP 404.
- Volubilis : pas d'interface en ligne par entrée (constat de la politique
  confirmé) ; le recoupement exige la base téléchargée.
- Verdict : **NON VÉRIFIABLE** par outillage. Les deux sources de chaque
  item appartiennent au même projet Wiktionary : l'exigence « deux sources
  indépendantes minimum par fait, RID prioritaire » de la politique n'est
  pas encore satisfaite. Le rédacteur l'a lui-même consigné (incertitude 3)
  et a conditionné le passage en `review` au recoupement RID ; cela
  reste bloquant tant que ce recoupement n'est pas fait.

## Exercices

- Exercice 1 (`listening`) : les 6 clés vérifiées contre les tons confirmés
  ci-dessus : หมา montant, น้า haut, ขา montant, นี้ haut, ค้า haut,
  หนี montant. **CONFIRMÉ** (6/6 correctes, distracteur binaire valide).
- Exercice 2 (`association`) : les 5 paires vérifiées : หมา chien,
  ม้า cheval, น้า oncle/tante côté maman, หนี fuir, ไม้ bois. **CONFIRMÉ**.
  Le feedback « ห muet = montant, marque ้ = haut » est vrai pour les 10
  items (4 mots à ห nam tous montants, 5 mots à mai tho sur consonne basse
  tous hauts) et la limite « pas une règle générale » est bien présente
  dans les pièges. **CONFIRMÉ**.
- Exercice 3 (`recall`) : Q1 cheval = ม้า, distracteurs หมา (chien),
  หนา (épais), น้า (parent) tous réellement faux ; Q2 chien = หมา,
  distracteurs ม้า, ไม้, ไหม tous réellement faux ; Q3 ton de นี้ = haut,
  les quatre autres tons étant faux. **CONFIRMÉ** (3/3).
- Politique Unicode NFC strict : cohérente avec les codepoints vérifiés.

## Note culturelle

- Affirmation : น้า désigne le cadet de la mère et s'emploie envers une
  personne plus jeune que la mère, au-delà de la famille : **CONFIRMÉ**.
  en.wiktionary (sens 2 : « person younger than one's mother ») et
  th.wiktionary (personne à qui l'on s'adresse, plus jeune que la mère),
  consultés le 2026-08-03. Voir remarque non bloquante 4 sur la formulation.

## Règles rédactionnelles

- Aucun tiret cadratin ni demi-cadratin : **CONFIRMÉ** (grep négatif).
- Ton rédactionnel direct, chaleureux, adulte, sans culpabilisation ni
  promesse non mesurée : **CONFIRMÉ** à la lecture intégrale.

## Bilan chiffré

- Faits confirmés : 84 au total, soit 50 faits linguistiques de base
  (graphie/codepoints, sens, ton, longueur, IPA sur 10 items), 9 champs de
  registre sur 10, 8 transcriptions conformes sur 10, 14 clés d'exercices,
  1 fait culturel, 2 contrôles rédactionnels.
- Contradictions : 3 champs (registre de l'item 1, transcriptions des items
  9 et 10).
- Non vérifiable : 1 (recoupement RID / indépendance des sources).

## Findings BLOQUANTS

1. **Indépendance des sources non satisfaite et RID non vérifiable.** Tous
   les items reposent sur deux entrées du même projet Wiktionary ; le RID,
   autorité n° 1 de la politique, est inaccessible par outillage (formulaire
   sans GET, 404 sur URL directe, constaté le 2026-08-03). Blocage du
   passage en `review` tant que le recoupement RID (et Volubilis sur
   base téléchargée) n'est pas consigné item par item.
2. **Transcriptions `mǎy` (item 9) et `máay` (item 10) non conformes aux
   conventions.** La v1 ne définit pas /aj/ et la v1.1 impose `ai`.
   Corriger en `mǎi` et `máai` (ou documenter un amendement), et trancher
   dans les conventions la notation de longueur des diphtongues
   (/aj/ contre /aːj/), actuellement non définie.
3. **Registre de หมา (item 1) contredit.** « Neutre » est contredit par les
   deux Wiktionary : สุนัข est la forme polie et formelle, et หมา porte des
   emplois figurés vulgaires et injurieux. Corriger le registre en
   « courant, familier » et compléter la note_fr (สุนัข formel ; หมา
   insultant appliqué à une personne).

## Remarques non bloquantes

1. Incertitude 1 du dossier de production imprécise : pour la particule
   interrogative, th.wiktionary (étymologie 3, consultée le 2026-08-03)
   donne les DEUX prononciations /maj˩˩˦/ et /maj˦˥/, pas seulement
   /maj˦˥/. La divergence norme/usage reste réelle, mais la citer
   exactement avant de trancher la leçon qui enseignera la particule.
2. Signal de fréquence à documenter (FrequencyWords th_50k, consulté le
   2026-08-03) : en token isolé, ค้า est rang ~24216, ไม้ rang ~13728, หนา
   absent du top 50 000 ; ไหม est rang ~966 mais surtout comme particule,
   pas comme « soie ». Cela ne contredit pas les tons ni les sens, mais
   nuance le statut « mots courants » (incertitude 4 du dossier) ; à
   consigner, sachant que la segmentation thaïe des sous-titres sous-estime
   les emplois en composés.
3. Item 4 : le champ `registre` mélange registre (« neutre ») et note
   d'usage (« surtout rencontré en composés ») ; déplacer la seconde partie
   dans `note_fr` pour respecter le contrat de l'item.
4. Note culturelle : la formulation « une personne d'âge comparable, plus
   jeune que votre mère » est ambiguë (comparable à qui ?). Proposer :
   « une personne visiblement plus jeune que votre mère, d'une génération
   proche de la sienne ».
