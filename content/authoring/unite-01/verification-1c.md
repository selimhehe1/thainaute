# Vérification adversariale indépendante : leçon 1C (u01-l1c)

- Auditeur : agent de contre-audit indépendant (Claude Fable 5, modèle
  `claude-fable-5`), consignes adversariales.
- Date des consultations : 2026-08-03.
- Méthode : re-consultation directe de chaque source (aucun résultat du
  rédacteur réutilisé comme preuve), vérification des codepoints par script
  local sur les chaînes réellement présentes dans le fichier, contrôle NFC,
  recherche de tirets cadratins, vérification de fréquence via le corpus
  `tnc_freq` de PyThaiNLP (politique §4, usage interne), vérification des
  références bibliographiques via l'API Crossref.
- Sources consultées par l'auditeur : en.wiktionary.org, th.wiktionary.org,
  dictionary.orst.go.th (tentative), sourceforge.net/projects/belisan
  (Volubilis, tentative), api.crossref.org, corpus PyThaiNLP `tnc_freq`.

## 1. Vérifications transverses

| Contrôle                                                     | Verdict  | Preuve                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codepoints des 10 items extraits du fichier lui-même         | CONFIRMÉ | Script PowerShell sur `lecon-1c.md` : les séquences réelles sont identiques aux champs `codepoints` déclarés pour les 10 items (voir §2).                                                                                                                           |
| Normalisation NFC de toutes les chaînes thaïes               | CONFIRMÉ | `String.Normalize(FormC)` : NFC=True pour les 10 items ; toutes les autres chaînes (spécimens, ปู่ปาปู, ต้มข่า, série 1A) sont en ordre canonique correct (voyelle souscrite avant signe de ton : ปู่ = U+0E1B U+0E39 U+0E48).                                      |
| Absence de tiret cadratin U+2014 et demi-cadratin U+2013     | CONFIRMÉ | Comptage regex sur le fichier : 0 et 0.                                                                                                                                                                                                                             |
| Structure des sections et contrat de champs (CONVENTIONS.md) | CONFIRMÉ | Ordre Méta, Enseignement, Items, Exercices, SRS, Note culturelle, Dossier respecté ; les 10 items portent tous les champs obligatoires, 2 URLs datées chacun.                                                                                                       |
| Ton rédactionnel (direct, chaleureux, sans culpabilisation)  | CONFIRMÉ | Lecture intégrale ; les feedbacks d'erreur donnent un indice, jamais une punition.                                                                                                                                                                                  |
| Renvois aux prérequis 1A et 1B                               | CONFIRMÉ | `lecon-1a.md` existe et contient la série คา ข่า ค่า ค้า ขา et les items คา / ข่า ; `lecon-1b.md` existe (« Longues et courtes »). Attention : ceci CONTREDIT l'incertitude 6 du dossier, devenue périmée (voir remarques).                                         |
| Renvois unité 3 (dates) et unité 9 (santé)                   | CONFIRMÉ | Conformes au curriculum du brief (unité 3 : chiffres, heure, dates ; unité 9 : santé).                                                                                                                                                                              |
| Références Wayland et Guion (dossier)                        | CONFIRMÉ | api.crossref.org/works/10.1111/j.1467-9922.2004.00283.x et /10.1017/s0142716403000067 consultés le 2026-08-03 : titres, revues, volumes, pages exacts ; les deux résumés confirment le ciblage du contraste ton moyen contre ton bas chez des auditeurs non natifs. |

## 2. Vérification item par item

Notation des tons dans mes sources : Wiktionary note le ton moyen ˧ et le
ton bas ˨˩ dans l'IPA, et le système Paiboon marque le ton bas d'un accent
grave (bpàa) et le moyen d'aucun signe (bpaa). Les deux signaux ont été
contrôlés pour chaque item.

### Item 1 : ปา

| Dimension                               | Verdict  | Preuve                                                                                                                                                                                              |
| --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E1B U+0E32 | CONFIRMÉ | Script local sur le fichier ; graphie identique sur les deux entrées Wiktionary.                                                                                                                    |
| Sens « lancer (jeter avec le bras) »    | CONFIRMÉ | en.wiktionary.org/wiki/ปา (2026-08-03) : « to throw at » ; th.wiktionary.org/wiki/ปา (2026-08-03) : ซัดไปด้วยอาการยกแขนขึ้นสูงแล้วเอี้ยวตัว (jeter en levant le bras haut et en pivotant le corps). |
| Ton moyen                               | CONFIRMÉ | IPA /paː˧/ sur les deux éditions ; Paiboon bpaa sans diacritique.                                                                                                                                   |
| Longueur longue                         | CONFIRMÉ | /aː/ sur les deux éditions.                                                                                                                                                                         |
| IPA /paː˧/                              | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                                                                    |
| Transcription `paa` (v1)                | CONFIRMÉ | p non aspiré, a long doublé, ton moyen sans diacritique : conforme.                                                                                                                                 |
| Registre neutre, adapté débutant        | CONFIRMÉ | Verbe courant (TNC rang 1337, freq 3203) ; aucun marquage de registre sur les entrées.                                                                                                              |

### Item 2 : ป่า

| Dimension                                      | Verdict  | Preuve                                                                                                                                                 |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E1B U+0E48 U+0E32 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                 |
| Sens « forêt »                                 | CONFIRMÉ | en.wiktionary.org/wiki/ป่า (2026-08-03) : « forest; wood; woodland; jungle » ; th.wiktionary.org/wiki/ป่า (2026-08-03) : ที่ที่มีต้นไม้ต่าง ๆ ขึ้นมาก. |
| Ton bas                                        | CONFIRMÉ | IPA /paː˨˩/ sur les deux éditions ; Paiboon bpàa (grave = bas).                                                                                        |
| Longueur longue                                | CONFIRMÉ | /aː/.                                                                                                                                                  |
| IPA /paː˨˩/                                    | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                       |
| Transcription `pàa` (v1)                       | CONFIRMÉ | Ton bas `à` sur la première voyelle : conforme.                                                                                                        |
| Registre neutre, adapté débutant               | CONFIRMÉ | TNC rang 584, freq 8327 : mot courant.                                                                                                                 |

### Item 3 : ปู

| Dimension                               | Verdict  | Preuve                                                                                                                                                 |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E1B U+0E39 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                 |
| Sens « crabe »                          | CONFIRMÉ | en.wiktionary.org/wiki/ปู (2026-08-03) : « crab » ; th.wiktionary.org/wiki/ปู (2026-08-03) : crustacé à 5 paires de pattes dont la première en pinces. |
| Ton moyen                               | CONFIRMÉ | IPA /puː˧/ sur les deux éditions ; Paiboon bpuu.                                                                                                       |
| Longueur longue                         | CONFIRMÉ | /uː/.                                                                                                                                                  |
| IPA /puː˧/                              | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                       |
| Transcription `poû` (v1)                | CONFIRMÉ | Règle v1 : /uː/ s'écrit `oû` ; conforme v1, mais voir remarque 3 (collision, v1.1 tranche pour `ouu`).                                                 |
| Registre neutre, adapté débutant        | CONFIRMÉ | TNC rang 1518, freq 2706.                                                                                                                              |

### Item 4 : ปู่

| Dimension                                      | Verdict  | Preuve                                                                                                                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E1B U+0E39 U+0E48 | CONFIRMÉ | Script local ; ordre canonique voyelle puis ton vérifié.                                                                                                                 |
| Sens « grand-père paternel (le père du père) » | CONFIRMÉ | en.wiktionary.org/wiki/ปู่ (2026-08-03) : « paternal grandfather » ; th.wiktionary.org/wiki/ปู่ (2026-08-03) : พ่อของพ่อ, ผัวของย่า. Voir remarque 5 sur « uniquement ». |
| Ton bas                                        | CONFIRMÉ | IPA /puː˨˩/ sur les deux éditions ; Paiboon bpùu.                                                                                                                        |
| Longueur longue                                | CONFIRMÉ | /uː/.                                                                                                                                                                    |
| IPA /puː˨˩/                                    | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                                         |
| Transcription `pòû` (v1)                       | CONFIRMÉ | Ton bas sur la première lettre du noyau : conforme v1 ; même remarque 3.                                                                                                 |
| Registre neutre, adapté débutant               | CONFIRMÉ | TNC rang 1635, freq 2475.                                                                                                                                                |

### Item 5 : ปี

| Dimension                                         | Verdict  | Preuve                                                                                                                                            |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E1B U+0E35           | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                            |
| Sens « année, an »                                | CONFIRMÉ | en.wiktionary.org/wiki/ปี (2026-08-03) : « year » ; th.wiktionary.org/wiki/ปี (2026-08-03) : durée d'une révolution terrestre, environ 365 jours. |
| Ton moyen                                         | CONFIRMÉ | IPA /piː˧/ sur les deux éditions ; Paiboon bpii.                                                                                                  |
| Longueur longue                                   | CONFIRMÉ | /iː/.                                                                                                                                             |
| IPA /piː˧/                                        | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                  |
| Transcription `pii` (v1)                          | CONFIRMÉ | Conforme.                                                                                                                                         |
| Registre neutre ; « mot très fréquent » (note_fr) | CONFIRMÉ | TNC via PyThaiNLP `tnc_freq` (2026-08-03) : rang 64 sur 106 122 types, freq 69 923. La revendication de haute fréquence est exacte.               |

### Item 6 : ปี่

| Dimension                                          | Verdict  | Preuve                                                                                                                                                                                                 |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E1B U+0E35 U+0E48     | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                                                                 |
| Sens « hautbois thaï (instrument à vent à anche) » | CONFIRMÉ | en.wiktionary.org/wiki/ปี่ (2026-08-03) : « Thai pi (any of a variety of quadruple-reed Thai oboes); wind instrument » ; th.wiktionary.org/wiki/ปี่ (2026-08-03) : instrument à vent à anche, en bois. |
| Ton bas                                            | CONFIRMÉ | IPA /piː˨˩/ sur les deux éditions ; Paiboon bpìi.                                                                                                                                                      |
| Longueur longue                                    | CONFIRMÉ | /iː/.                                                                                                                                                                                                  |
| IPA /piː˨˩/                                        | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                                                                       |
| Transcription `pìi` (v1)                           | CONFIRMÉ | Conforme.                                                                                                                                                                                              |
| Registre neutre ; adéquation débutant              | CONFIRMÉ | TNC rang 5835, freq 357 : mot peu fréquent, mais la leçon ne le présente pas comme vocabulaire courant ; choix justifié comme paire minimale tonale (voir remarque 4).                                 |

### Item 7 : คา

| Dimension                               | Verdict  | Preuve                                                                                                                                                                                                                                                 |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orthographe et codepoints U+0E04 U+0E32 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                                                                                                                 |
| Sens « être coincé, rester pris »       | CONFIRMÉ | en.wiktionary.org/wiki/คา (2026-08-03) : « to be stuck, to be lodged in » ; th.wiktionary.org/wiki/คา (2026-08-03) : ค้างอยู่ ติดอยู่ (exemples ข้าวคาปาก, คาถ้วย). La note_fr (objet qui reste pris dans un passage) correspond aux exemples sourcés. |
| Ton moyen                               | CONFIRMÉ | IPA /kʰaː˧/ sur les deux éditions ; Paiboon kaa.                                                                                                                                                                                                       |
| Longueur longue                         | CONFIRMÉ | /aː/.                                                                                                                                                                                                                                                  |
| IPA /kʰaː˧/                             | CONFIRMÉ | Identique sur les deux éditions ; kh aspiré cohérent avec la note_fr.                                                                                                                                                                                  |
| Transcription `khaa` (v1)               | CONFIRMÉ | `kh` aspiré pour ค : conforme.                                                                                                                                                                                                                         |
| Registre neutre, adapté débutant        | CONFIRMÉ | TNC rang 1089, freq 4093.                                                                                                                                                                                                                              |

### Item 8 : ข่า

| Dimension                                      | Verdict  | Preuve                                                                                                                                                |
| ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E02 U+0E48 U+0E32 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                |
| Sens « galanga »                               | CONFIRMÉ | en.wiktionary.org/wiki/ข่า (2026-08-03) : « galangal » (sens unique) ; th.wiktionary.org/wiki/ข่า (2026-08-03) : Alpinia galanga, วงศ์ Zingiberaceae. |
| Ton bas                                        | CONFIRMÉ | IPA /kʰaː˨˩/ sur les deux éditions ; Paiboon kàa.                                                                                                     |
| Longueur longue                                | CONFIRMÉ | /aː/.                                                                                                                                                 |
| IPA /kʰaː˨˩/                                   | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                      |
| Transcription `khàa` (v1)                      | CONFIRMÉ | Conforme ; la note_fr sur « un autre k soufflé (ข) » est exacte (ข aspiré, classe haute).                                                             |
| Registre neutre ; adéquation débutant          | CONFIRMÉ | TNC rang 5607, freq 383 : peu fréquent mais justifié par la paire minimale et la cuisine (voir remarque 4).                                           |

### Item 9 : ยา

| Dimension                               | Verdict  | Preuve                                                                                                                                             |
| --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E22 U+0E32 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                             |
| Sens « médicament »                     | CONFIRMÉ | en.wiktionary.org/wiki/ยา (2026-08-03) : « medicine; drug » (premier sens) ; th.wiktionary.org/wiki/ยา (2026-08-03) : สิ่งที่ใช้แก้หรือป้องกันโรค. |
| Ton moyen                               | CONFIRMÉ | IPA /jaː˧/ sur les deux éditions ; Paiboon yaa.                                                                                                    |
| Longueur longue                         | CONFIRMÉ | /aː/.                                                                                                                                              |
| IPA /jaː˧/                              | CONFIRMÉ | Identique sur les deux éditions.                                                                                                                   |
| Transcription `yaa` (v1)                | CONFIRMÉ | `y` pour ย : conforme ; note_fr « y comme dans yoga » cohérente avec /j/.                                                                          |
| Registre neutre, adapté débutant        | CONFIRMÉ | TNC rang 262, freq 18 095 : très courant.                                                                                                          |

### Item 10 : หย่า

| Dimension                                             | Verdict  | Preuve                                                                                                                                                                                                                           |
| ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orthographe et codepoints U+0E2B U+0E22 U+0E48 U+0E32 | CONFIRMÉ | Script local ; graphie identique sur les deux entrées.                                                                                                                                                                           |
| Sens « divorcer »                                     | CONFIRMÉ | en.wiktionary.org/wiki/หย่า (2026-08-03) : « to divorce (of married persons) » ; th.wiktionary.org/wiki/หย่า (2026-08-03) : เลิกเป็นผัวเมียกัน. Sens secondaire « cesser » (หย่านม) non enseigné, cohérent avec l'incertitude 5. |
| Ton bas                                               | CONFIRMÉ | IPA /jaː˨˩/ sur les deux éditions ; Paiboon yàa.                                                                                                                                                                                 |
| Longueur longue                                       | CONFIRMÉ | /aː/.                                                                                                                                                                                                                            |
| IPA /jaː˨˩/                                           | CONFIRMÉ | Identique sur les deux éditions ; aucun /h/ : la note_fr « ห ne se prononce pas ici » est exacte.                                                                                                                                |
| Transcription `yàa` (v1)                              | CONFIRMÉ | Conforme.                                                                                                                                                                                                                        |
| Registre neutre, adapté débutant                      | CONFIRMÉ | TNC rang 3276, freq 921 ; thème adulte mais registre neutre, cohérent avec le ton de la marque.                                                                                                                                  |

## 3. Exercices

| Contrôle                                                                                                                                                          | Verdict        | Preuve                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exercice 1, écoute 1 : ป่า = ton bas                                                                                                                              | CONFIRMÉ       | /paː˨˩/ vérifié ci-dessus.                                                                                                                                                                                                                                                                                                                                                                                         |
| Exercice 1, écoute 2 : ปี = ton moyen                                                                                                                             | CONFIRMÉ       | /piː˧/.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 1, écoute 3 : ปู่ = ton bas                                                                                                                              | CONFIRMÉ       | /puː˨˩/.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Exercice 1, écoute 4 : ยา = ton moyen                                                                                                                             | CONFIRMÉ       | /jaː˧/.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 1, écoute 5 : หย่า = ton bas                                                                                                                             | CONFIRMÉ       | /jaː˨˩/.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Exercice 1, écoute 6 : คา = ton moyen                                                                                                                             | CONFIRMÉ       | /kʰaː˧/.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Exercice 2, paire ป่า / forêt                                                                                                                                     | CONFIRMÉ       | Item 2.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 2, paire ปู / crabe                                                                                                                                      | CONFIRMÉ       | Item 3.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 2, paire ปู่ / grand-père paternel                                                                                                                       | CONFIRMÉ       | Item 4.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 2, paire ยา / médicament                                                                                                                                 | CONFIRMÉ       | Item 9.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Exercice 3, cohérence interne (la réponse ปู่ ปา ปู correspond à l'audio annoncé, l'intrus ป่า est bien absent de l'audio, les glosses des feedbacks sont justes) | CONFIRMÉ       | Recoupement interne avec les items 1 à 4.                                                                                                                                                                                                                                                                                                                                                                          |
| Exercice 3, grammaticalité et naturalité de la phrase construite ปู่ปาปู (« Papy lance un crabe », ordre SVO, nom nu sans classificateur)                         | NON VÉRIFIABLE | Aucune source de la politique accessible par outillage ne permet de valider la syntaxe : les grammaires de référence papier ne sont pas acquises, Wiktionary ne valide pas des phrases, le RID est inaccessible par URL directe (404 constaté le 2026-08-03 sur dictionary.orst.go.th/lookup_graph.php?word=ป่า). L'auteur l'avait marquée INCERTAIN ; je confirme que le doute ne peut pas être levé aujourd'hui. |
| SRS : paires et critères cohérents avec les items                                                                                                                 | CONFIRMÉ       | Les 5 paires reprennent exactement les 10 items ; critères mesurables et non culpabilisants.                                                                                                                                                                                                                                                                                                                       |

## 4. Note culturelle

| Contrôle                                                                                                                                                                                 | Verdict                                          | Preuve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| « rhizome aromatique de la famille du gingembre, utilisé en cuisine et dans la pharmacopée traditionnelle », présenté comme « fait vérifié : entrées ข่า de Wiktionary anglais et thaï » | CONTREDIT                                        | Ma consultation du 2026-08-03 de en.wiktionary.org/wiki/ข่า montre un sens unique « galangal », SANS mention de la famille du gingembre, de la cuisine ni de la médecine (seul un lien « voir aussi » vers ginger). Seule th.wiktionary.org/wiki/ข่า atteste ces faits (วงศ์ Zingiberaceae, เหง้า, ใช้ปรุงอาหารและทำยาได้). L'attribution aux DEUX entrées est fausse ; le fait ne repose que sur UNE source de la politique, sous le minimum de deux. Correction proposée : réattribuer la vérification à th.wiktionary seule et ajouter une seconde source (RID, entrée ข่า, consultation manuelle) ou retirer les précisions famille/pharmacopée. |
| Lien ข่า / soupe ต้มข่า au lait de coco                                                                                                                                                  | NON VÉRIFIABLE (en tant que fait à deux sources) | Le fait lui-même est exact sur l'unique source : en.wiktionary.org/wiki/ต้มข่า (2026-08-03) confirme « spicy chicken curry in coconut milk with galangal root ». J'ai re-testé th.wiktionary.org/wiki/ต้มข่า le 2026-08-03 : 404 confirmé, comme le déclarait l'auteur. Aucune seconde source de la politique accessible par outillage. Le marquage INCERTAIN de l'auteur est correct ; le fait reste sous-sourcé.                                                                                                                                                                                                                                   |

## 5. Sources et méthodologie du rédacteur

| Contrôle                                    | Verdict                                     | Preuve                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recoupement RID 2554 (autorité orthographe) | NON VÉRIFIABLE                              | Tentatives du 2026-08-03 : la page d'accueil dictionary.orst.go.th répond (formulaire de recherche dynamique), mais aucune entrée n'est joignable par URL directe (404). La contre-vérification RID des 10 items reste à faire manuellement, comme l'auteur l'avait signalé (incertitude 1).                                                                  |
| Recoupement Volubilis (pivot français)      | NON VÉRIFIABLE                              | sourceforge.net/projects/belisan (2026-08-03) : fichiers téléchargeables uniquement, dernière mise à jour 2026-07-01, pas d'interrogation en ligne par entrée. Le recoupement reste à faire lors du contre-audit, comme annoncé dans le dossier.                                                                                                              |
| Indépendance des deux sources par item      | CONTESTABLE (traité en finding bloquant B3) | Les 10 items ne citent que deux éditions de Wiktionary (même projet, communautés distinctes). La politique impose « deux sources indépendantes » et interdit Wiktionary « en source unique » ; le dossier reconnaît lui-même que le recoupement RID/Volubilis « reste requis avant review ». En lecture adversariale, l'exigence n'est pas encore satisfaite. |
| Fréquence TNC via PyThaiNLP                 | CONFIRMÉ (usage interne)                    | `tnc_freq` interrogé localement le 2026-08-03 (106 122 types). Réserve de licence : chaîne de droits TNC vers PyThaiNLP non documentée (politique §4) ; utilisable en vérification interne seulement, jamais cité en preuve produit.                                                                                                                          |
| Tentative FrequencyWords (Hermit Dave)      | NON VÉRIFIABLE                              | Fetch du fichier th_50k.txt le 2026-08-03 : réponse de l'outil incohérente (rangs contradictoires, confusion ข่า/ข่าว), inexploitable comme preuve. Remplacée par le contrôle TNC ci-dessus.                                                                                                                                                                  |

## 6. Findings BLOQUANTS

- **B1. Note culturelle, attribution de vérification fausse (CONTREDIT).**
  L'entrée en.wiktionary ข่า ne contient ni « famille du gingembre » ni
  usage cuisine/pharmacopée ; ces faits ne sont attestés que par
  th.wiktionary. La mention « fait vérifié : entrées ข่า de Wiktionary
  anglais et thaï » est inexacte et le fait n'a qu'une seule source de la
  politique. Corriger l'attribution et ajouter une seconde source (RID en
  consultation manuelle) ou retirer les précisions.
- **B2. Note culturelle, fait ต้มข่า sous-sourcé (NON VÉRIFIABLE à deux
  sources).** Une seule source de la politique (en.wiktionary ต้มข่า) ;
  th.wiktionary 404 confirmé par l'auditeur. Trouver une seconde source ou
  retirer la phrase avant publication (l'auteur l'avait déjà marqué
  INCERTAIN ; je confirme le blocage).
- **B3. Recoupement hors Wiktionary absent pour les 10 items (NON
  VÉRIFIABLE).** RID inaccessible par outillage (confirmé : recherche
  dynamique, URL directe 404) et Volubilis sans interrogation en ligne
  (confirmé). Les deux éditions de Wiktionary ne suffisent pas à satisfaire
  l'exigence de deux sources indépendantes de la politique ; la
  contre-vérification manuelle RID (orthographe, autorité n° 1) et le pivot
  Volubilis sont obligatoires avant tout passage en `review`.
- **B4. Phrase construite ปู่ปาปู (exercice 3) non vérifiable.** Grammaire
  (SVO, nom nu sans classificateur) et naturalité non confirmables avec les
  sources de la politique accessibles aujourd'hui ; doit rester INCERTAIN
  et bloquer la publication tant qu'une grammaire de référence papier ou un
  relecteur qualifié ne l'a pas confirmée.

## 7. Remarques non bloquantes

1. **Incertitude 6 du dossier périmée.** `lecon-1a.md` et `lecon-1b.md`
   existent désormais et les renvois de 1C (série คา ข่า ค่า ค้า ขา, items
   คา et ข่า, leçon 1B « Longues et courtes ») sont cohérents avec leur
   contenu. Mettre à jour le dossier de production.
2. **Ton bas décrit comme « plat et stable ».** L'IPA du fichier et des
   sources (˨˩) note un léger contour descendant dans le registre bas. La
   simplification pédagogique est défendable (opposition au ton descendant
   ˥˩ enseigné plus tard) mais devrait être documentée, et l'audio devra
   suivre la réalisation native, pas la description simplifiée.
3. **Collision de transcription `poû` / `pòû` confirmée.** Conforme v1,
   mais le circonflexe de longueur ressemble au futur diacritique du ton
   descendant. L'amendement v1.1 la résout (`ouu`, `oû` abandonné) :
   migrer ces deux transcriptions à la consolidation (incertitude 2 de
   l'auteur, validée par l'auditeur).
4. **ปี่ (rang TNC 5835) et ข่า (rang 5607) sont les items les moins
   fréquents de la leçon.** Acceptables ici comme paires minimales tonales,
   mais ne pas les réutiliser ailleurs comme vocabulaire « courant ».
5. **ปู่ « désigne uniquement le père du père ».** Exact en terme de
   parenté (th.wiktionary : พ่อของพ่อ, ผัวของย่า), mais le mot sert aussi
   d'appellatif respectueux envers des hommes âgés (par exemple หลวงปู่).
   Préciser si le mot est réutilisé dans l'unité famille.
6. **Réserve de licence sur le contrôle de fréquence.** `tnc_freq` de
   PyThaiNLP est revendiqué CC0 mais la chaîne de droits TNC vers PyThaiNLP
   n'est pas documentée : garder ce contrôle en interne, ne jamais le citer
   en preuve produit.
7. **Nuance de glose pour ปา.** en.wiktionary glose « to throw at » (lancer
   sur une cible) ; la définition thaïe décrit le geste complet du bras. La
   traduction « lancer (jeter avec le bras) » est fidèle, mais la nuance
   « viser quelqu'un/quelque chose » pourra compter quand le verbe sera
   réutilisé en phrase.

## 8. Synthèse chiffrée

- Faits vérifiés CONFIRMÉS : 91 (70 contrôles item par item : 10 items sur
  7 dimensions ; 21 contrôles transverses : 9 en §1, 11 exercices/SRS en
  §3, 1 contrôle TNC de méthodologie en §5).
- CONTREDIT : 1 (attribution de vérification de la note culturelle, B1).
- NON VÉRIFIABLES : 4 (phrase ปู่ปาปู B4 ; fait ต้มข่า B2 ; recoupements
  RID et Volubilis, fusionnés dans B3).
- Findings bloquants : 4 (B1 à B4). La leçon reste en `draft` ; aucun
  passage en `review` possible avant résolution de B1 à B4.
- Remarques non bloquantes : 7.
- Revue native : en attente (inchangé).
