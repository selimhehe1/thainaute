# Vérification adversariale de la leçon 1B (u01-l1b)

- Auditeur : Claude Fable 5 (claude-fable-5), audit indépendant du 2026-08-03.
- Mandat : prendre en défaut `lecon-1b.md`. Aucune URL du rédacteur n'a servi
  de preuve : toutes les consultations ci-dessous sont des requêtes propres,
  effectuées le 2026-08-03.
- Méthode :
  - codepoints re-relevés par script local (Node, lecture directe du fichier,
    comparaison caractère par caractère, contrôle NFC, recherche de tirets
    cadratins) ;
  - re-consultation de en.wiktionary.org et th.wiktionary.org pour les 10
    items et pour กินข้าว ;
  - tentative RID : https://dictionary.orst.go.th/ répond mais exige un
    formulaire, aucune entrée consultable par URL (constaté le 2026-08-03) ;
  - tentative Volubilis : https://sourceforge.net/projects/belisan/ ne
    propose que des fichiers téléchargeables, pas de consultation en ligne
    (constaté le 2026-08-03) ;
  - fréquence : FrequencyWords th_50k (Hermit Dave, OpenSubtitles th)
    téléchargé et interrogé localement le 2026-08-03.
- Précaution de lecture : les verdicts de ton s'appuient sur les chiffres de
  contour cités exactement par les entrées (˥˩ descendant, ˩˩˦ montant,
  ˨˩ bas, ˧ moyen, ˦˥ haut), jamais sur des paraphrases.

## Vérification Unicode globale (script local)

- Les 10 séquences `codepoints` déclarées correspondent exactement aux
  graphies `thai` du fichier. CONFIRMÉ (10 correspondances).
- Toutes les chaînes thaïes du fichier (y compris โรคหัด, ยางรถ, กินข้าว et
  les voyelles isolées de la page 5) sont en NFC. CONFIRMÉ.
- Aucun tiret cadratin ni demi-cadratin dans le fichier. CONFIRMÉ.

## Item 1 : เข้า

| Dimension                                             | Verdict  | Preuve (consultée le 2026-08-03)                                                            |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E40 U+0E02 U+0E49 U+0E32 | CONFIRMÉ | script local ; https://en.wiktionary.org/wiki/เข้า ; https://th.wiktionary.org/wiki/เข้า    |
| Sens « entrer »                                       | CONFIRMÉ | en.wiktionary : « to come in, go in, enter » ; th.wiktionary : se déplacer vers l'intérieur |
| Ton descendant                                        | CONFIRMÉ | IPA citée /kʰaw˥˩/ sur les deux entrées, ˥˩ = descendant                                    |
| Longueur courte                                       | CONFIRMÉ | IPA sans ː sur les deux entrées ; Paiboon kâo (contre kâao pour ข้าว)                       |
| IPA /kʰaw˥˩/                                          | CONFIRMÉ | citation exacte identique sur les deux entrées                                              |
| Transcription khâw (thainaute-fr-v1)                  | CONFIRMÉ | kh aspiré, â descendant sur la première voyelle, a simple = courte, w final ; conforme v1   |
| Registre neutre                                       | CONFIRMÉ | aucun marquage de registre contraire sur les deux entrées                                   |
| Fréquence (mot courant)                               | CONFIRMÉ | FrequencyWords th : rang 1450                                                               |

## Item 2 : ข้าว

| Dimension                                                                   | Verdict        | Preuve (consultée le 2026-08-03)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E02 U+0E49 U+0E32 U+0E27                       | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/ข้าว ; https://th.wiktionary.org/wiki/ข้าว                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Sens « riz » (et « nourriture » familier)                                   | CONFIRMÉ       | en.wiktionary : rice, food/meal (colloquial) ; th.wiktionary : Oryza sativa, familier « nourriture »                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Ton descendant                                                              | CONFIRMÉ       | IPA citée /kʰaːw˥˩/ sur les deux entrées                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Longueur longue                                                             | CONFIRMÉ       | aː sur les deux entrées                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| IPA /kʰaːw˥˩/                                                               | CONFIRMÉ       | citation exacte identique sur les deux entrées                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Transcription khâaw                                                         | CONFIRMÉ       | aa doublé = longue, ton sur la première voyelle ; conforme v1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Registre neutre                                                             | CONFIRMÉ       | sens de base non marqué                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| note_fr : « en parole rapide familière, la voyelle est parfois raccourcie » | CONTREDIT      | en.wiktionary liste bien une seconde forme /kʰaw˥˩/ mais l'étiquette exactement « archaic, now dialectal », PAS familière ni liée à la parole rapide ; th.wiktionary ne mentionne aucune variante courte. La ligne source de l'item (« variante familière courte signalée, confirmés »), le piège de l'exercice 1 et l'incertitude 5 du dossier reprennent la même erreur d'attribution. Correction proposée : soit supprimer la mention, soit écrire « une forme courte เข้า /kʰaw˥˩/ existe comme graphie et prononciation archaïques, aujourd'hui dialectales » avec la même source. |
| Fréquence (mot courant)                                                     | NON VÉRIFIABLE | FrequencyWords th : rang 13857, mais corpus non segmenté (les lignes sont des blocs de sous-titres, pas des mots), signal inutilisable ; TNC hors service ; à établir via PyThaiNLP tnc_freq au contre-audit                                                                                                                                                                                                                                                                                                                                                                            |

## Item 3 : เขา

| Dimension                                      | Verdict  | Preuve (consultée le 2026-08-03)                                                                                                              |
| ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E40 U+0E02 U+0E32 | CONFIRMÉ | script local ; https://en.wiktionary.org/wiki/เขา ; https://th.wiktionary.org/wiki/เขา                                                        |
| Sens « il, elle » (litteral : montagne, corne) | CONFIRMÉ | pronom de 3e personne, colline/montagne, corne sur les deux entrées (aussi : pigeon, liane, non revendiqués par la leçon)                     |
| Ton montant                                    | CONFIRMÉ | IPA citée /kʰaw˩˩˦/ sur les deux entrées, ˩˩˦ = montant                                                                                       |
| Longueur courte                                | CONFIRMÉ | IPA sans ː sur les deux entrées                                                                                                               |
| IPA /kʰaw˩˩˦/                                  | CONFIRMÉ | citation exacte identique sur les deux entrées                                                                                                |
| Transcription khǎw                             | CONFIRMÉ | ǎ montant, a simple ; conforme v1                                                                                                             |
| Registre neutre                                | CONFIRMÉ | pronom standard non marqué ; en.wiktionary signale par ailleurs une prononciation familière ton haut /kʰaw˦˥/ (graphie เค้า), voir remarque 2 |
| Fréquence (mot courant)                        | CONFIRMÉ | FrequencyWords th : rang 225                                                                                                                  |

## Item 4 : ขาว

| Dimension                                      | Verdict        | Preuve (consultée le 2026-08-03)                                                                  |
| ---------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E02 U+0E32 U+0E27 | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/ขาว ; https://th.wiktionary.org/wiki/ขาว            |
| Sens « blanc »                                 | CONFIRMÉ       | white ; th.wiktionary ajoute le figuré « propre, pur », repris honnêtement par le rédacteur       |
| Ton montant                                    | CONFIRMÉ       | IPA citée /kʰaːw˩˩˦/ sur les deux entrées                                                         |
| Longueur longue                                | CONFIRMÉ       | aː sur les deux entrées                                                                           |
| IPA /kʰaːw˩˩˦/                                 | CONFIRMÉ       | citation exacte identique sur les deux entrées                                                    |
| Transcription khǎaw                            | CONFIRMÉ       | ǎ montant sur la première voyelle, aa = longue ; conforme v1                                      |
| Registre neutre                                | CONFIRMÉ       | non marqué                                                                                        |
| Fréquence (mot courant)                        | NON VÉRIFIABLE | FrequencyWords th : rang 8166, corpus non segmenté, signal inutilisable ; voir finding bloquant 4 |

## Item 5 : หัด

| Dimension                                                               | Verdict        | Preuve (consultée le 2026-08-03)                                                                                                                                         |
| ----------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E2B U+0E31 U+0E14                          | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/หัด ; https://th.wiktionary.org/wiki/หัด                                                                                   |
| Sens « s'entraîner, s'exercer » (litteral : rougeole, autre étymologie) | CONFIRMÉ       | en.wiktionary : to practice, to train (étymologie 2), measles (étymologie 1) ; th.wiktionary : ฝึก, ฝึกฝน et maladie virale ; la mention « autre étymologie » est exacte |
| Ton bas                                                                 | CONFIRMÉ       | IPA citée /hat̚˨˩/ sur les deux entrées, ˨˩ = bas                                                                                                                         |
| Longueur courte                                                         | CONFIRMÉ       | IPA sans ː sur les deux entrées                                                                                                                                          |
| IPA /hat̚˨˩/                                                             | CONFIRMÉ       | citation exacte identique sur les deux entrées, y compris le t̚ non relâché (cohérent avec la note_fr)                                                                    |
| Transcription hàt                                                       | CONFIRMÉ       | à bas, a simple ; conforme v1                                                                                                                                            |
| Registre neutre                                                         | CONFIRMÉ       | non marqué                                                                                                                                                               |
| Fréquence (mot courant)                                                 | NON VÉRIFIABLE | absent de FrequencyWords th (corpus non segmenté) ; TNC hors service ; voir finding bloquant 4                                                                           |

## Item 6 : หาด

| Dimension                                      | Verdict        | Preuve (consultée le 2026-08-03)                                                       |
| ---------------------------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E2B U+0E32 U+0E14 | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/หาด ; https://th.wiktionary.org/wiki/หาด |
| Sens « plage »                                 | CONFIRMÉ       | beach, shoal ; th.wiktionary : rivage en pente sableux, de graviers ou de pierres      |
| Ton bas                                        | CONFIRMÉ       | IPA citée /haːt̚˨˩/ sur les deux entrées                                                |
| Longueur longue                                | CONFIRMÉ       | aː sur les deux entrées                                                                |
| IPA /haːt̚˨˩/                                   | CONFIRMÉ       | citation exacte identique sur les deux entrées                                         |
| Transcription hàat                             | CONFIRMÉ       | à bas sur la première voyelle, aa = longue ; conforme v1                               |
| Registre neutre                                | CONFIRMÉ       | non marqué                                                                             |
| Fréquence (mot courant)                        | NON VÉRIFIABLE | absent de FrequencyWords th ; voir finding bloquant 4                                  |

## Item 7 : ยัง

| Dimension                                              | Verdict  | Preuve (consultée le 2026-08-03)                                                                                     |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E22 U+0E31 U+0E07         | CONFIRMÉ | script local ; https://en.wiktionary.org/wiki/ยัง ; https://th.wiktionary.org/wiki/ยัง                               |
| Sens « encore, toujours ; pas encore en négation »     | CONFIRMÉ | still, yet, not yet sur en.wiktionary ; th.wiktionary détaille les emplois d'inaccompli et de réponse « pas encore » |
| Ton moyen                                              | CONFIRMÉ | IPA citée /jaŋ˧/ sur les deux entrées                                                                                |
| Longueur courte                                        | CONFIRMÉ | IPA sans ː sur les deux entrées                                                                                      |
| IPA /jaŋ˧/                                             | CONFIRMÉ | citation exacte identique sur les deux entrées                                                                       |
| Transcription yang                                     | CONFIRMÉ | y pour ย, ng pour ง, aucun diacritique = ton moyen, a simple ; conforme v1                                           |
| Registre neutre                                        | CONFIRMÉ | non marqué                                                                                                           |
| note_fr « mot grammatical très fréquent » et fréquence | CONFIRMÉ | FrequencyWords th : rang 378 malgré la mauvaise segmentation du corpus, signal fort                                  |

## Item 8 : ยาง

| Dimension                                      | Verdict        | Preuve (consultée le 2026-08-03)                                                                                                                                   |
| ---------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E22 U+0E32 U+0E07 | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/ยาง ; https://th.wiktionary.org/wiki/ยาง                                                                             |
| Sens « caoutchouc (aussi pneu, sève, résine) » | CONFIRMÉ       | resin, rubber, tire, rubber band ; th.wiktionary : latex et sèves, objets en caoutchouc dont pneu et gomme (aussi : arbres Dipterocarpus, oiseau, non revendiqués) |
| Ton moyen                                      | CONFIRMÉ       | IPA citée /jaːŋ˧/ sur les deux entrées                                                                                                                             |
| Longueur longue                                | CONFIRMÉ       | aː sur les deux entrées                                                                                                                                            |
| IPA /jaːŋ˧/                                    | CONFIRMÉ       | citation exacte identique sur les deux entrées                                                                                                                     |
| Transcription yaang                            | CONFIRMÉ       | aa = longue, pas de diacritique = moyen ; conforme v1                                                                                                              |
| Registre neutre                                | CONFIRMÉ       | non marqué                                                                                                                                                         |
| Fréquence (mot courant)                        | NON VÉRIFIABLE | FrequencyWords th : rang 14621, corpus non segmenté, signal inutilisable ; voir finding bloquant 4                                                                 |

## Item 9 : ดุ

| Dimension                               | Verdict        | Preuve (consultée le 2026-08-03)                                                                                                                                                                             |
| --------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E14 U+0E38 | CONFIRMÉ       | script local ; https://en.wiktionary.org/wiki/ดุ ; https://th.wiktionary.org/wiki/ดุ                                                                                                                         |
| Sens « sévère ; gronder »               | CONFIRMÉ       | en.wiktionary : to scold ; fierce, unfriendly, violent (exemple glosé « strict » pour un enseignant) ; th.wiktionary : réprimander avec colère ; redoutable, cruel. Voir remarque 5 sur la nuance « féroce » |
| Ton bas                                 | CONFIRMÉ       | IPA citée /duʔ˨˩/ sur les deux entrées                                                                                                                                                                       |
| Longueur courte                         | CONFIRMÉ       | u bref plus coup de glotte final sur les deux entrées                                                                                                                                                        |
| IPA /duʔ˨˩/                             | CONFIRMÉ       | citation exacte identique sur les deux entrées, coup de glotte inclus ; la note_fr « petit arrêt sec du souffle » est cohérente avec ʔ                                                                       |
| Transcription dòu                       | CONFIRMÉ       | ou = /u/, ò bas sur la première lettre du noyau ; conforme v1                                                                                                                                                |
| Registre neutre                         | CONFIRMÉ       | non marqué                                                                                                                                                                                                   |
| Fréquence (mot courant)                 | NON VÉRIFIABLE | absent de FrequencyWords th ; voir finding bloquant 4                                                                                                                                                        |

## Item 10 : ดู

| Dimension                               | Verdict                     | Preuve (consultée le 2026-08-03)                                                                                                                           |
| --------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E14 U+0E39 | CONFIRMÉ                    | script local ; https://en.wiktionary.org/wiki/ดู ; https://th.wiktionary.org/wiki/ดู                                                                       |
| Sens « regarder »                       | CONFIRMÉ                    | to view, look, watch (plus surveiller, examiner, sembler) sur les deux entrées                                                                             |
| Ton moyen                               | CONFIRMÉ                    | IPA citée /duː˧/ sur les deux entrées                                                                                                                      |
| Longueur longue                         | CONFIRMÉ                    | uː sur les deux entrées                                                                                                                                    |
| IPA /duː˧/                              | CONFIRMÉ                    | citation exacte identique sur les deux entrées                                                                                                             |
| Transcription doû                       | CONFIRMÉ au regard de la v1 | `oû` est la graphie v1 du /uː/ long ; voir remarque 1 : la v1.1 l'abandonne (douu) et le circonflexe entre en collision pédagogique avec le ton descendant |
| Registre neutre                         | CONFIRMÉ                    | non marqué                                                                                                                                                 |
| Fréquence (mot courant)                 | CONFIRMÉ                    | FrequencyWords th : rang 427                                                                                                                               |

## Pages d'enseignement

- Page 1, « en français, étirer une voyelle ne change jamais le mot » :
  CONFIRMÉ pour le français standard (la durée vocalique n'y est pas
  phonémique), mais l'absolu est contestable pour le français belge et
  suisse ; voir remarque 4.
- Page 2, description du marquage (simple/doublé, oû, barre de durée,
  couleur jamais seule) : CONFIRMÉ conforme à la convention v1 et à la
  règle d'accessibilité ; collision oû/circonflexe en remarque 1.
- Page 3, « เข้า et ข้าว portent exactement le même ton descendant, seule la
  durée les sépare » : CONFIRMÉ par les IPA citées /kʰaw˥˩/ et /kʰaːw˥˩/.
- Page 4, « une voyelle courte se termine net, souvent avec un petit arrêt
  du souffle » : CONFIRMÉ pour les syllabes ouvertes à voyelle courte du
  type ดุ /duʔ˨˩/ ; le « souvent » évite la surgénéralisation.
- Page 5, ั = a court, า = aa long, ุ = ou court, ู = oû long : CONFIRMÉ
  par les paires หัด/หาด et ดุ/ดู re-vérifiées ci-dessus.

## Exercices (clés de réponse re-vérifiées une à une)

- Exercice 1 (listening, courte ou longue) : หาด longue, หัด courte,
  ดู longue, ดุ courte, ข้าว longue, ยัง courte. Les 6 clés sont exactes.
  CONFIRMÉ (6 vérifications). Le piège « en parole familière ข้าว s'entend
  parfois raccourci » reprend l'erreur d'attribution de l'item 2 :
  CONTREDIT, voir finding bloquant 1.
- Exercice 2 (listening, laquelle des deux) : les 4 clés (ข้าว, เขา, หัด,
  ยาง) sont exactes, les distracteurs sont réellement l'autre membre de la
  paire, et l'affirmation du feedback « le ton était le même dans les deux
  mots » est vraie pour les 4 tirages (descendant, montant, bas, moyen).
  CONFIRMÉ (4 vérifications plus la constance de ton).
- Exercice 3 (association) : เขา courte, ขาว longue, ดุ courte, ดู longue.
  Les 4 associations sont exactes ; l'avertissement sur la paire ดุ/ดู
  (tons différents, seul le choix de durée noté) est cohérent avec les IPA
  /duʔ˨˩/ et /duː˧/. CONFIRMÉ (4 vérifications).
- Exercice 4 (recall) : khâaw/khaaw, khâw/khaw, hàat/haat, hàt/hat, yaang,
  yang. Les 6 clés et variantes sont conformes à la politique déclarée
  (tons facultatifs, doublement obligatoire) et aux transcriptions des
  items. CONFIRMÉ (6 vérifications).

## SRS, note culturelle, rédaction

- SRS : exclusion cohérente de la paire 5 de la production écrite tant que
  les tons bas et moyen ne sont pas maîtrisés ; aucun corrigé contradictoire.
  CONFIRMÉ.
- Note culturelle, fait « ข้าว signifie aussi, familièrement, la nourriture
  ou le repas » : CONFIRMÉ par mes deux consultations (en.wiktionary :
  food, meal, colloquial ; th.wiktionary : ปาก... sens familier
  « nourriture »).
- Note culturelle, illustration กินข้าว « manger, passer à table » :
  NON VÉRIFIABLE en double source. Ma consultation propre de
  https://en.wiktionary.org/wiki/กินข้าว (2026-08-03) confirme le sens
  « to eat food; to have a meal » et l'IPA /kin˧.kʰaːw˥˩/, mais
  https://th.wiktionary.org/wiki/กินข้าว renvoie bien un 404 (constaté le
  2026-08-03), le RID n'est pas consultable par outillage et Volubilis
  n'est pas consultable en ligne. Une seule source exploitable : la
  politique exige deux sources. Le rédacteur l'a signalé (incertitude 3) ;
  le fait reste bloquant tant qu'une deuxième source n'est pas consignée.
- Tiret cadratin : aucun dans le fichier (script local). CONFIRMÉ.
- Ton rédactionnel : direct, chaleureux, sans culpabilisation ni promesse
  chiffrée non mesurée (le « 80 % » de l'objectif est un critère interne de
  maîtrise, pas une promesse marketing). CONFIRMÉ.

## Findings BLOQUANTS

1. CONTREDIT : la « variante familière raccourcie » de ข้าว est une erreur
   d'attribution. en.wiktionary étiquette la forme courte /kʰaw˥˩/
   « archaic, now dialectal », pas familière ni de parole rapide ;
   th.wiktionary ne signale aucune variante. À corriger dans la note_fr de
   l'item 2, la ligne de sources de l'item 2, le piège de l'exercice 1 et
   l'incertitude 5 du dossier de production.
2. NON VÉRIFIABLE : กินข้าว (note culturelle) n'a qu'une source exploitable
   (en.wiktionary ; th.wiktionary 404 confirmé le 2026-08-03). Deuxième
   source obligatoire avant `review`, sinon retirer l'illustration.
3. NON VÉRIFIABLE au sens de la politique : le double sourçage des 10 items
   repose exclusivement sur en.wiktionary + th.wiktionary, deux communautés
   du même écosystème Wikimedia dont les modules de prononciation sont
   apparentés ; ce ne sont pas deux sources indépendantes. RID injoignable
   hors formulaire (constaté) et Volubilis non consultable en ligne
   (constaté). Recoupement hors Wikimedia (RID manuel ou Volubilis fichiers
   locaux) requis pour les 10 items avant `review`.
4. NON VÉRIFIABLE : la qualification « mots thaïs courants » (objectif) n'a
   pas pu être établie pour ข้าว, ขาว, ยาง, หัด, หาด, ดุ avec les sources
   accessibles (FrequencyWords th non segmenté donc inexploitable pour ces
   mots ; TNC hors service). Fréquence confirmée seulement pour เขา, ยัง,
   ดู, เข้า. Vérification TNC ou PyThaiNLP tnc_freq requise au contre-audit.

## Remarques non bloquantes

1. Collision de diacritiques déjà actée par l'amendement v1.1 : `oû`
   (longueur) utilise le même circonflexe que le ton descendant (`â`). La
   leçon est conforme à la v1 et la migration est planifiée, mais 1B devra
   bien migrer (doû devient douu) et la phrase de la page 2 ainsi que la
   note de l'item 10 devront être réécrites à la consolidation.
2. เขา « il, elle » : en.wiktionary atteste la prononciation familière très
   répandue en ton haut /kʰaw˦˥/ (graphie เค้า). La leçon enseigne la forme
   standard montante, ce qui est correct, mais une note (ou un choix
   d'audio conscient) éviterait la surprise face à des locuteurs réels.
3. Champ `litteral` détourné aux items 3 et 5 : « montagne, corne » et
   « rougeole » sont des homographes d'autres étymologies, pas des
   traductions littérales. Déplacer vers note_fr ou créer un champ
   « homographes » au schéma.
4. Page 1 : préciser « en français standard », car des contrastes de durée
   subsistent en français belge et suisse ; l'absolu actuel est attaquable.
5. ดุ : le sens adjectival central des deux dictionnaires est plutôt
   « féroce, méchant » (fierce, violent ; redoutable, cruel) ; « sévère »
   est défendable (exemple de l'enseignant strict) mais l'audit sens
   pourrait préférer « féroce ; gronder » ou « sévère, féroce ; gronder ».

## Décompte

- Faits linguistiques CONFIRMÉS : 75 (70 sur les 8 dimensions des 10 items
  hors fréquence, 4 confirmations de fréquence, 1 fait de note culturelle).
- Vérifications d'exercices cohérentes : 20 clés de réponse exactes.
- CONTREDIT : 1 (variante « familière » de ข้าว, finding 1).
- NON VÉRIFIABLE : 8 (กินข้าว ; indépendance des sources des 10 items,
  compté comme un finding global ; fréquence de 6 mots).
