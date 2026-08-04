# Second contre-audit adversarial de `u09-l9d` (Chez le pharmacien)

- Date : 2026-08-04, après la consolidation du même jour
- Fichier audité : `content/authoring/unite-09/lecon-9d.md`
  (157 927 octets, sha256
  `16f0d89d4be7829a7b6e4f84480d370bf89825d6d661187ac34f4f91f546d3d7`)
- Ce document **remplace** le premier contre-audit, dont les douze findings sont
  intégralement consignés, traités et datés dans le dossier de production de la
  leçon (journal du contre-audit interne). Le premier rapport est conservé en
  annexe, plus bas dans ce fichier, sans modification.
- Posture : adversariale. **Aucun relevé de la leçon n'a été cru sur parole, y
  compris ceux que la consolidation déclare « refaits ».** Chaque fait a été
  reproduit par l'auditeur, avec les scripts versionnés, les deux dictionnaires,
  l'exemplaire VOLUBILIS dont l'empreinte a été recalculée, et des calculs
  refaits de zéro.
- Verdict : **6 findings bloquants, 6 findings non bloquants.**
  **224 faits reconfirmés de première main.** Le noyau linguistique tient
  entièrement : graphies, séquences NFC, tons, longueurs, IPA, sens, registres et
  les six dérivations de ton sont exacts, et toutes les références externes
  citées existent et disent ce qu'on leur fait dire. Ce qui casse est ailleurs :
  **trois des cinq exercices peuvent franchir leur seuil sans la compétence
  qu'ils annoncent mesurer**, une coordination inter-leçons est fausse dans un
  sens qui détruirait l'entretien des tons, un contrôle versionné du dépôt échoue
  sur le fichier, et le dialogue rejoue ce que le texte écran a retiré faute de
  source.
- Statut recommandé : reste `draft`. Aucun passage en `review`.

## 1. Méthode et artefacts

| Artefact                  | Empreinte relevée par cet audit                                                         | Provenance                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `VOLUBILIS.ods`           | 15 724 718 o, sha256 `bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc` | `C:/Users/Selim/AppData/Local/Temp/VOLUBILIS.ods`, empreinte identique à l'en-tête de `volubilis-codes.mjs` |
| `VOLUBILIS_Database.xlsx` | **154 octets**, page HTML d'erreur                                                      | même répertoire ; **l'incertitude 7 de la leçon est confirmée sur pièce**                                   |
| RID 2554                  | POST `dictionary.orst.go.th/func_lookup.php`                                            | `rid-lookup.mjs` (27 graphies) et `rid-entry.mjs` (9 corps d'entrée)                                        |
| en.wiktionary             | fetch direct                                                                            | 8 pages rendues, 2 adresses en 404                                                                          |

Scripts versionnés employés : `repo-thai-scan.mjs`, `unicode-thai.mjs`,
`item-fields-check.mjs`, `rid-lookup.mjs`, `rid-entry.mjs`,
`volubilis-codes.mjs`. Calculs de plancher refaits par programmation dynamique
ET par énumération exhaustive, les deux méthodes devant concorder avant qu'un
chiffre soit écrit ici.

## 2. Ce que l'auditeur a confirmé lui-même : 224 faits

### 2.1 RID 2554, 51 faits

- **27 graphies interrogées en présence**, décompte de la leçon reproduit à
  l'identique : **16 attestées** (ยา, ร้าน, ขาย, แล้ว, กี่, วัน, มี, ไหม, ขอ,
  หน่อย, อยู่, ที่ไหน, เภสัชกร, เภสัช, คำเป็น, ร้านม้า) et **11 absentes**
  (ร้านขายยา, ร้านยา, ขายยา, กินยา, กี่วัน, ขอยาหน่อย, มียาไหม, กี่วันแล้ว,
  สองวันแล้ว, สามวันแล้ว, ร้านขายยาอยู่ที่ไหน). Aucune divergence.
- **กี่**, 4 faits : « กี่ ๑ » est le métier à tisser ; « กี่ ๒ » est un ว. qui se
  place devant un autre mot pour « combien » ; **le dictionnaire donne bien
  กี่วัน et กี่บาท comme ses deux exemples** ; il donne aussi ไม่กี่.
- **วัน ๑**, 2 faits : le sens (๑) définit la période de vingt-quatre heures et
  **illustre par un énoncé où le nombre précède วัน**. La leçon décrit
  exactement ce que l'entrée contient.
- **ร้าน**, 3 faits : trois sens dans l'ordre annoncé, **le sens de boutique
  n'est pas le premier**, et les ลูกคำ sont exactement trois, ร้านชำ, ร้านม้า,
  ร้านรวง.
- **ร้านม้า**, 2 faits : plate-forme de bois à six poteaux, emploi funéraire.
  Le contre-exemple de la note culturelle est réel.
- **แล้ว**, 4 faits : deux vedettes ; la première, adverbiale, porte les trois
  exemples d'achèvement ET les deux exemples d'enchaînement cités par la leçon,
  **sous une seule vedette** ; la seconde est verbale.
- **มี**, 1 fait : le sens (๒) se termine bien sur l'exemple มีคนอยู่ไหม.
- **ไหม**, 1 fait : la seconde vedette est le mot interrogatif, donné comme
  venant de หรือไม่.
- **ยา**, 6 faits : « ยา ๑ » porte cinq sens dans l'ordre décrit, le (๑) est le
  sens enseigné, les (๒) et (๓) sont l'opium et le produit d'orfèvrerie, les
  (๔) et (๕) sont verbaux, « ยา ๒ » est le mot de composition de parenté et de
  vocabulaire royal, et la liste des ลูกคำ compte exactement **60** entrées, ce
  que « une soixantaine » décrit fidèlement.
- **ขาย**, 1 fait : échanger un bien contre de l'argent.

Aucune définition n'est reproduite ici, conformément à la politique de sources.

### 2.2 VOLUBILIS, 36 faits

Tous relevés sur le `.ods` d'empreinte recalculée, par
`volubilis-codes.mjs … --feuille=Volubilis`.

- **Clé `TONES` reconfirmée ligne par ligne** : `-x` normal, `¯x` haut, `_x`
  bas, `/x` montant, `\x` descendant. **Et la correction N2 est exacte dans les
  deux sens** : avec le filtre `TONES`, le script ne rend que l'en-tête
  `TONES | ● ● ●` ; sans filtre, les cinq lignes de marqueurs apparaissent.
- **ร้านขายยา** : ThaiPhon `¯rān /khāi -yā`, FRA « pharmacie [f] ; officine [f] »,
  DOM `MEDIC (pharma) ; TOURIST ; (Covid-19)`, segmentation `[ร้าน ขาย ยา]`.
  La suite haut, montant, moyen et les trois macrons sont bien là.
- **ยา** `-yā`, **กี่วัน** `_kī -wan` avec FRA « Combien de jours ? » et
  segmentation `[กี่ วัน]`, **ไม่กี่วัน** `\mai _kī -wan` segmenté `[ไม่ กี่ วัน]`,
  **ในอีกไม่กี่วันข้างหน้า**, **ร้านยา** `¯rān -yā`, **กินยา** `-kin -yā`.
- **ไหม** : quatre entrées, dont une de TYPE `part. (interr.)` avec ThaiPhon
  **`/mai`**, ton montant, sans macron donc voyelle brève.
- **แล้ว** : deux entrées `¯laēo`, l'une « déjà », l'autre « ensuite ; et
  ensuite ; et ». **กี่** : deux entrées `_kī`, le métier et « combien de ? ».
  **มีไหม** : `-mī /mai`.
- **Contrôle d'absence par sous-chaîne reproduit** : le filtre `วันแล้ว` rend
  **une seule ligne** sur la feuille entière, วันแล้ววันเล่า, « jour après
  jour ». Le relevé de la leçon est exact et recomputable.

### 2.3 en.wiktionary, 35 faits

Huit pages ouvertes, deux adresses en 404.

- **ร้าน** : /raːn˦˥/, `ráan`, quatre sens de nom dont la plate-forme, et
  **exactement 29 termes dérivés**, comptés par l'auditeur. **Les neuf formes
  hors moule citées par la note culturelle y figurent toutes.** Le décompte
  corrigé par la consolidation est juste.
- **ไหม** : l'étymologie 1, la particule, porte **deux** prononciations,
  /maj˩˩˦/ et /maj˦˥/, plus la forme alternative มั้ย ; les étymologies 2 et 3
  ne portent que /maj˩˩˦/. La réserve de l'item 5 est fondée.
- **กี่** : /kiː˨˩/, pronom « how many, how much » explicitement suivi d'un
  classificateur ou d'un nom courant, exemples กี่บาท et กี่โมง, et la liste des
  dérivés porte **กี่วัน** et **นี่กี่โมงแล้ว**.
- **แล้ว** : /lɛːw˦˥/, adverbe de fin de phrase, avec les deux exemples
  exactement cités par la leçon, เด็ก ๆ กินข้าวแล้ว et เธอเป็นผู้ใหญ่แล้วนะ.
- **ร้านขายยา** : /raːn˦˥.kʰaːj˩˩˦.jaː˧/, `ráan-kǎai-yaa`, étymologie donnée
  comme ร้าน + ขาย + ยา.
- **ยา** /jaː˧/ avec l'ordre des sens décrit ; **ขาย** /kʰaːj˩˩˦/ « to sell »,
  avec ร้านขายยา dans ses dérivés ; **วัน** /wan˧/, nom « day »,
  classificateur วัน.
- **เก้า** : /kaːw˥˩/, rime `aːw`, **voyelle longue**. La longueur publiée par
  `u03-l3b` et reprise par la réserve de l'exercice 1 est correcte, contre
  l'intuition qui ferait de เ◌า une brève. Vérifié parce que la réserve oppose
  เขา, publié bref, à เก้า, publié long, avec la même apparence graphique.
- **404 confirmés** : `ร้านยา` et `กี่วัน` n'ont pas de page. Les deux relevés
  de la leçon sont exacts, y compris celui qui affaiblit sa propre thèse.

### 2.4 Contrôles internes au dépôt, 73 faits

- `repo-thai-scan.mjs 1 8` : **40 fichiers, 383 entrées, 283 graphies**, 92
  ไม้เอก, 66 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา. Identique au dossier.
- Les six `--grep` des unités 1 à 8 : ยา 4 dont ยา en **1C** et non 1D, แล้ว 2,
  วัน 5, กี่ 3, ร้าน 0, ขาย 0. Identiques.
- `repo-thai-scan.mjs 9 9` : **5 fichiers, 46 entrées, 40 graphies**, et les neuf
  `--grep` de coordination sont exacts au motif près : ยา 6, แล้ว 4, วัน 3, กี่ 1,
  ร้าน 2, ขาย 2, ปวด 6, เจ็บ 1, **หมอ 5 sur 9A, 9C et 9E**.
- `--stacked` sur l'unité 9 : **deux graphies d'item à pile de profondeur 2, les
  deux en 9D**, กี่ et ที่. La correction B1 du premier audit est exacte.
- `unicode-thai.mjs` : NFC toutes conformes, **aucun caractère de zone à usage
  privé**, 8 champs `thai`, inventaire des signes cohérent.
- **34 items publiés relus un par un** dans leur leçon d'origine, avec `ton`,
  `longueur`, `ipa` et `transcription` : les vingt spécimens de la réserve de
  l'exercice 1 portent bien la longueur que la leçon leur prête, ตลาดอยู่ที่ไหน
  de `u05-l5e` porte bien l'IPA et la transcription citées, ขอน้ำหน่อย de
  `u02-l2c`, กี่บาท et ห้าสิบบาท de `u03-l3c`, กี่คน et ปลาสองตัว de `u03-l3d`,
  แล้วเจอกัน de `u01-l1e`, แล้วคุณล่ะ de `u06-l6e`, ตรงไป de `u05-l5e`, คะ de
  `u02-l2e` et les items en มี de `u06-l6b` et `u06-l6d` sont tous conformes.
- **`u06-l6d` ne publie pas มีพี่น้องไหม** : reconfirmé. La correction B3 tient.
- `lecon-9e.md` déclare bien ses items 6 et 7 comme des réemplois de `u09-l9d`
  items 7 et 8.
- Le relevé d'unité de `lecon-9a.md` annonce 42 graphies là où le script en rend
  40 : la divergence signalée existe.
- **Aucun tiret cadratin ni demi-cadratin dans le fichier** (0 occurrence).

### 2.5 Arithmétique et section 1 bis, 17 faits

- **Exercice 1, tout le bloc refait indépendamment** : **39 480** séquences
  admissibles, espérance **4,4353** bonnes réponses sur 10 pour un devineur
  optimal, **0,7371 %** d'atteindre 8 sur 10. Les trois chiffres publiés par la
  consolidation sont exacts. L'ancien chiffre retiré, 761 / 9 765 625 =
  0,0078 %, est lui aussi arithmétiquement juste, et son retrait est justifié.
- Exercice 2, hasard pur : 201 / 59 049 = **0,3404 %**. Exact.
- Exercice 3 : atteindre 5 sur 6 est bien impossible, et la probabilité du seuil
  est bien **1 / 720**.
- Réponses constantes : 2 sur 10 à l'exercice 1, 4 sur 10 à l'exercice 2, 2 sur 5
  à l'exercice 5. Exactes.
- Stratégies « khâ pour toute femme » et « khá pour toute femme » à l'exercice 5 :
  **3 sur 5** chacune. Exactes.
- Effet de la longueur à l'exercice 1 : deux tirages brefs sur dix en moyenne,
  gain espéré 0,1 bonne réponse. Exact.
- **Périmètre écran : 1 111 lignes.** Chiffre reproduit exactement.
- **Piles de profondeur 2 sur le fichier entier : 38 chaînes, 11 formes de pile.**
  Reproduit exactement, formes comprises : กี่, ที่, พี่, ลี่, มั้, ขึ้, บี้,
  นั่, นี่, นี้, สื้.
- **Section 1 bis** : le tableau des six formules est exact sur le périmètre
  écran. « bouche française », « francophone », « oreille française »,
  « à la française » et « le français » y sont bien à **0** ; « en français » y
  est bien à **1**, dans le champ `fr` de l'item 6, et c'est bien un énoncé de
  traduction. **9D n'avance effectivement aucun fait de phonétique française.**

### 2.6 Les six dérivations de ton, 12 faits

Refaites sans regarder la table de la leçon, puis confrontées à Wiktionary et à
VOLUBILIS.

| Mot  | Initiale et classe | Marque | Vivante par               | Ton dérivé | Concordance         |
| ---- | ------------------ | ------ | ------------------------- | ---------- | ------------------- |
| ยา   | ย basse            | aucune | noyau า long, sans finale | moyen      | /jaː˧/, `-yā`       |
| ร้าน | ร basse            | ไม้โท  | finale น                  | haut       | /raːn˦˥/, `¯rān`    |
| ขาย  | ข haute            | aucune | finale ย                  | montant    | /kʰaːj˩˩˦/, `/khāi` |
| แล้ว | **ล** basse, non แ | ไม้โท  | finale ว                  | haut       | /lɛːw˦˥/, `¯laēo`   |
| กี่  | ก moyenne          | ไม้เอก | noyau ◌ี long             | bas        | /kiː˨˩/, `_kī`      |
| วัน  | ว basse            | aucune | finale น                  | moyen      | /wan˧/, `-wan`      |

Six dérivations, six concordances, zéro écart. **Les six syllabes sont bien
vivantes**, et par des finales que `u08-l8a` a réellement publiées. La
correspondance de finale annoncée à la page 7, « la syllabe est vivante parce
qu'elle se ferme sur ว », est juste ; celle de l'item 2, « vivante par sa finale
ย », l'est aussi ; aucune correspondance de finale fausse n'a été trouvée dans
cette leçon.

## 3. Findings bloquants

### B1. L'exercice 2 laisse franchir son seuil une session sur cinq à qui n'entend rien

**Le finding le plus grave de cet audit.** La leçon a mesuré l'exercice 1 par
programmation dynamique après le finding N5 du premier audit, puis n'a pas
appliqué la même mesure à l'exercice 2, qui a exactement la même structure et
qui est bien plus exploitable.

L'exercice 2 sert **un ensemble fixe de dix tirages, de répartition annoncée
4 / 3 / 3**, en ordre aléatoire, avec la contrainte « jamais deux fois de suite
la même cible » et un retour après chaque tirage. Ces trois propriétés sont
écrites dans la spécification, et la ligne « réponse constante : 4 sur 10 au
mieux » suppose déjà que l'apprenant connaît la répartition.

Énumération exhaustive faite par l'auditeur, puis reproduite par programmation
dynamique, les deux méthodes concordant :

- séquences admissibles : **248 seulement** ;
- un devineur qui n'entend RIEN, qui compte les cibles déjà sorties et qui
  exploite le retour, obtient **6,75 bonnes réponses sur 10 en moyenne** ;
- il atteint le seuil de 8 sur 10 dans **53 cas sur 248, soit 21,4 %** ;
- distribution complète : 4 → 1, 5 → 22, 6 → 80, 7 → 92, **8 → 42, 9 → 10,
  10 → 1**.

La leçon ne publie que « hasard pur sur trois options : 0,34 % », qui décrit dix
tirages indépendants, c'est-à-dire un exercice que 9D ne fait pas. C'est mot pour
mot l'erreur que le premier audit a fait corriger pour l'exercice 1. La carte
`srs-u09-l9d-04` reprend le même seuil et hérite du même défaut.

**Correction attendue** : abandonner l'ensemble fixe 4 / 3 / 3 au profit d'un
tirage indépendant, ou retirer la contrainte de non-répétition, ou remonter le
seuil, puis republier le plancher mesuré sur l'exercice tel qu'il est spécifié.
Aucune de ces trois options ne peut être choisie sans refaire le calcul.

### B2. L'exercice 4 atteint son seuil sans distinguer คะ de ค่ะ, ce que la leçon déclare impossible

La leçon écrit : « Le seuil de 4 sur 5 n'est atteignable qu'en lisant à la fois
qui parle et si la phrase questionne. » **C'est faux, et la stratégie qui le
réfute est exécutable avec les tuiles réellement fournies.**

Les cinq tirages comptent **trois locuteurs masculins** (2, 4, 5) et deux
féminins (1, question, คะ ; 3, affirmation, ค่ะ). Un apprenant qui lit le
locuteur, sait que ครับ va à un homme, et **ne distingue pas คะ de ค่ะ** :

- en jouant toujours ค่ะ pour une femme : tirages 2, 3, 4, 5 justes, **4 sur 5,
  seuil atteint** ;
- en jouant toujours คะ pour une femme : tirages 1, 2, 4, 5 justes, **4 sur 5,
  seuil atteint**.

Les deux tuiles féminines sont proposées aux deux tirages féminins, donc les deux
stratégies sont jouables. Le finding N4 du premier audit a bien corrigé le
plafond de l'apprenant qui ignore AUSSI le genre (1 sur 5), mais la conclusion
qui en a été tirée ne couvre pas l'apprenant qui lit le genre et rien d'autre.
Or la « quatrième chose mesurée » que l'exercice annonce est précisément
l'accord entre locuteur, type de phrase et particule.

**Correction attendue** : équilibrer les locuteurs, par exemple deux hommes et
trois femmes dont deux questions, de sorte qu'aucune particule féminine
constante ne dépasse 3 sur 5, puis refaire le plancher tirage par tirage.

### B3. L'exercice 5 atteint son seuil sans jamais employer ครับ

Même défaut, symétrique. La leçon écrit que la répartition « un `khráp`, deux
`khâ` et deux `khá` » est choisie « pour qu'aucune [stratégie partielle]
n'atteigne le seuil », et l'objectif de la Méta annonce mesurer « la particule
qui correspond à la fois au locuteur et au type de phrase, ครับ pour un homme,
ค่ะ pour une femme qui affirme et คะ pour une femme qui questionne ».

Les cinq tirages comptent **un seul locuteur masculin**. Un apprenant qui
**ignore complètement le locuteur** et applique la seule règle « question → khá,
sinon khâ » obtient :

- tirage 1, question → `khá` juste ;
- tirage 2, demande → `khâ` juste ;
- tirage 3, question posée par un homme → `khá` faux ;
- tirage 4, affirmation → `khâ` juste ;
- tirage 5, question → `khá` juste ;

soit **4 sur 5, seuil atteint**, sans avoir jamais écrit `khráp`. La moitié de la
compétence annoncée n'est donc pas mesurée. Le plancher publié n'examine que les
deux stratégies « toujours khâ » et « toujours khá » pour une femme, qui plafonnent
bien à 3 sur 5, et pas celle qui ignore le genre.

**Correction attendue** : porter à deux le nombre de tirages masculins, dont un
au moins en question, ou exiger le seuil sur les cinq tirages.

### B4. La coordination attribue à 9E deux cartes de tons qui n'existent pas, et recommande une fusion qui supprimerait l'entretien exigé par le « Fil des tons »

La leçon écrit deux fois, au point 5 de la coordination et à l'incertitude 5, que
`lecon-9e.md` « porte `srs-u09-l9e-06` et `srs-u09-l9e-07` pour exactement les
mêmes deux duels », qu'il y a « quatre cartes pour deux compétences », et
recommande de « garder les deux cartes de 9E, qui closent l'unité, et de rabattre
les siennes dessus ». L'incertitude 5 se déclare « DOUBLE et vérifiée ».

**Relevé de l'auditeur dans `lecon-9e.md` :**

- `srs-u09-l9e-06` porte l'**attribution du locuteur par la seule particule
  finale**, et le contraste ค่ะ contre คะ chez une même locutrice ;
- `srs-u09-l9e-07` porte le suivi d'un **échange entier** de santé sans texte
  affiché.

**Aucune des deux ne mesure un duel de tons.** La seule carte de 9E qui touche
les deux contrastes est `srs-u09-l9e-05`, qui porte le ton d'un mot **LU, sans
audio**, et dont 9E écrit explicitement qu'elle est « complémentaire et non
concurrente des trois cartes auditives de `u09-l9d`, et la compilation ne doit
pas les fusionner : lire un ton et l'entendre ne sont pas la même compétence ».
9E publie par ailleurs sa propre section de coordination, qui décrit correctement
les cartes de 9D.

Le recouvrement annoncé n'existe donc pas, et la recommandation prend le sens
inverse de son intention : appliquée, elle **supprimerait de l'unité 9 le seul
entretien AUDITIF** des contrastes montant contre haut et moyen contre bas, alors
que la section « Fil des tons » de `CONVENTIONS.md` impose qu'à partir de
l'unité 8 les deux contrastes soient entretenus et jamais supposés acquis.

**Correction attendue** : retirer le premier point du 5 de la coordination et
réécrire l'incertitude 5 sur les cartes réelles de 9E. Le recouvrement à signaler,
s'il y en a un, est avec `srs-u09-l9e-06` et les exercices 4 et 5 de 9D, sur la
particule, pas sur les tons.

### B5. Quatre champs `codepoints` sur huit sont non conformes, un script versionné échoue sur le fichier, et le tableau des audits certifie l'inverse

`node scripts/verification/item-fields-check.mjs content/authoring/unite-09/lecon-9d.md`
rend **« champs codepoints en faute : 4 »** et sort en code 1. Les items 3, 4, 5
et 7 factorisent le tronc commun et les deux finales (« … puis U+0E04 U+0E23
U+0E31 U+0E1A pour la forme en ครับ, ou U+0E04 U+0E30 pour la forme en คะ »),
notation que l'en-tête du script décrit comme « pas recomputable graphie par
graphie, ce que le contrat d'item exige », et que `CONVENTIONS.md` exclut en
demandant « la séquence U+XXXX exacte ».

Ce n'est pas une lecture personnelle de l'auditeur : **`lecon-9e.md` a corrigé
exactement ce défaut chez elle** (son finding 12) et écrit noir sur blanc que
« `u09-l9d` item 7, qui publie ce bloc, porte encore la notation factorisée ».

Pendant ce temps, la ligne « Unicode » du tableau des audits de 9D porte
« **CORRIGÉ le 2026-08-04.** NFC stables », et la section « Vérification Unicode »
annonce des séquences « recalculées et vérifiées comme STABLES ». Les deux
énoncés sont vrais sur la normalisation, et muets sur le contrôle qui échoue.
Le tableau Unicode de la leçon, par ailleurs, ne donne pas les graphies des items
3, 4, 5 et 7 telles qu'elles sont déclarées dans le champ `thai`, particule
comprise : il donne des troncs, ce qui masque le point.

**Correction attendue** : écrire les huit séquences en entier, une par graphie,
puis faire passer `item-fields-check.mjs` et le citer dans le dossier.

### B6. Le dialogue rejoue ce que le texte écran a retiré faute de source, et le tableau du périmètre sensible certifie qu'il n'en reste rien

La consolidation a retiré cinq énoncés sur ce qu'un pharmacien dit, fait ou
décide, plus deux voisins, au motif écrit que « la politique du projet ne possède
aucune source de terrain, et la règle est alors la suppression, pas
l'atténuation ». La ligne correspondante du tableau du périmètre sensible affirme
maintenant : « CINQ TROUVÉES ET RETIRÉES le 2026-08-04 […] **Il n'en reste
aucune** ».

**Le dialogue est du texte écran, et il n'a pas été traité.** Il met en scène une
locutrice étiquetée « **Pharmacienne** » qui salue, pose la question de durée
กี่วันแล้วคะ, puis annonce un prix, l'échange se terminant sur un remerciement.
C'est exactement l'énoncé retiré de la page 8, « Voici la question que le
pharmacien vous posera », sous forme jouée plutôt qu'affirmée, et il porte en
plus une affirmation implicite non sourcée : qu'un médicament s'obtient sur cette
seule question. `lecon-9e.md` le lit d'ailleurs ainsi, son item 6 écrivant que
« le dialogue la met dans la bouche de la pharmacienne » et en faisant sa valeur
pédagogique.

L'avertissement ajouté devant le dialogue atténue, il ne supprime pas, et la
leçon s'est elle-même interdit l'atténuation. Surtout, la certification « il n'en
reste aucune » est fausse telle qu'elle est écrite.

**Correction attendue, au choix** : neutraliser l'étiquette de locuteur, ou
retirer du dialogue la question de durée et le prix, ou réécrire la ligne du
tableau pour qu'elle dise ce qui est vrai, à savoir que le dialogue est une mise
en scène non sourcée et que c'est un risque assumé. La troisième option est la
moins bonne : elle rouvre exactement ce que B4 du premier audit a fermé.

**Ce que l'audit n'a PAS trouvé, et qui compte au moins autant.** Aucun nom de
médicament, aucun principe actif, aucune marque, aucune posologie, aucune
quantité, aucune fréquence, aucune durée de traitement, aucun numéro d'urgence,
aucune adresse, aucune information de secours, aucune conduite à tenir. Les seuls
nombres de la leçon comptent des jours écoulés et des bahts. Les quatre premières
lignes du tableau du périmètre sensible sont exactes, et le renvoi de la page 10
vers 9A et 9B existe bien. **Sur le fond du sujet sensible, la leçon tient.**

## 4. Findings non bloquants

### N1. Trois décomptes internes sont faux, dans une section qui fait de la recomputabilité sa thèse

- « le fichier entier porte **163** chaînes thaïes » : `unicode-thai.mjs` en rend
  **195** distinctes, dont 192 hors des champs `thai`. Le périmètre écran en
  porte 136. Aucune des mesures possibles ne donne 163.
- « Le fichier ENTIER porte **trois** occurrences de « en français » » : il y en a
  **quatre**, lignes 577, 1734, 1738 et 1745. L'oubli est celui de la phrase
  d'examen elle-même, dans le paragraphe écrit pour qu'« un auditeur qui balaie le
  fichier entier ne prenne pas un compte brut pour un manquement ».
- « [9E] dont le fichier compte **22** occurrences de คะ » : il en compte **55**.
  Les deux autres chiffres de la même phrase sont justes, une dans 9C et aucune
  dans 9B, ce qui montre que la mesure employée est bien le décompte brut.

Les décomptes voisins, eux, sont exacts et ont été reproduits : 1 111 lignes de
périmètre écran, 38 chaînes à pile de profondeur 2, 11 formes de pile.

### N2. « Les quatre seuls mots à ton haut et voyelle brève publiés par le parcours » : la liste est incomplète et deux attributions sont fausses

Balayage de toutes les entrées des unités 1 à 8 par l'auditeur, sur les champs
`ton` et `longueur` : les monosyllabes publiés à ton haut et voyelle brève sont
**cinq** et non quatre, et deux ne sont pas publiés là où la leçon le dit.

| Graphie | Publiée par       | Ce qu'écrit 9D          |
| ------- | ----------------- | ----------------------- |
| ครับ    | `u01-l1e` item 2  | `u03-l3e`               |
| คะ      | `u02-l2e` item 1  | **absente de la liste** |
| นก      | `u02-l2e` item 13 | `u03-l3e`               |
| รถ      | `u05-l5d` item 2  | `u05-l5d`, exact        |
| เล็ก    | `u08-l8c` item 3  | `u08-l8c`, exact        |

`u03-l3e` réemploie นก et ครับ, elle ne les publie pas. **La conclusion tient
malgré tout** : les cinq sont des syllabes mortes, donc aucune n'est utilisable
dans une réserve de vingt syllabes vivantes, et le refus de combler le défaut
reste fondé. Mais l'argument s'appuie sur une liste qui n'est pas celle du dépôt.

### N3. Fausse garantie de longueur sur le duel moyen contre bas de l'exercice 1

La leçon écrit, au plancher et dans les pièges connus, que « ni l'un ni l'autre
duel n'est décidé par la longueur » et que « les deux duels sont tirés sur des
mots de même longueur des deux côtés ».

C'est vrai du duel montant contre haut, dont la contrainte ne cite que des mots
longs des deux côtés, ร้าน / ค้า / ม้า contre ขาย / ขา / หมา. **Ce n'est pas vrai
du duel moyen contre bas** : la contrainte impose « กี่ ou ป่า ou ข่า », tous
longs, et « วัน ou คา ou มา », où วัน est **bref**. Un tirage qui satisfait la
contrainte peut donc opposer une brève à une longue, et la garantie annoncée
n'existe pas de ce côté.

L'effet reste petit, puisque คา et มา sont longs et que la brève ne tombe pas à
tous les coups, mais l'énoncé est faux tel qu'il est écrit, et il a été produit
par la correction du finding B2 du premier audit.

### N4. Le patron มี + nom + ไหม n'a en réalité qu'une jambe externe

La leçon présente deux jambes de sourçage pour le patron dont elle publie la
première instance du parcours.

- **Première jambe, RID** : l'exemple relevé est bien présent, mais il est
  มีคนอยู่ไหม, c'est-à-dire มี + nom + **อยู่** + ไหม. C'est du
  [prédicat] + ไหม, exactement la forme que la leçon dit être celle des six
  graphies déjà publiées, et non la forme nouvelle qu'elle instaure. La leçon
  écrit honnêtement l'exemple avec son อยู่, puis le compte comme jambe.
- **Seconde jambe, VOLUBILIS** : des trois entrées citées, มีไหม ne porte aucun
  nom entre les deux, et มีอะไรให้ช่วยไหมครับ/คะ porte un groupe verbal. Seule
  มีข้อข้องใจอะไรไหม instancie réellement มี + nom + ไหม. Les trois entrées ont
  été relues par l'auditeur sur le `.ods`.

Le thaï lui-même n'est pas en cause et มียาไหม n'a rien de douteux. Ce qui est
surévalué, c'est la force de la preuve : le patron repose sur une seule entrée
externe, alors que la leçon annonce deux jambes.

### N5. Le préambule des exercices est faux

« Cinq mécaniques ne sont pas employées ; quatre le sont » est contradictoire :
seule `reading` n'est pas employée, et quatre des cinq mécaniques canoniques le
sont. Le reste du paragraphe, qui motive l'absence de `reading`, est juste.

### N6. VOLUBILIS n'est pas indépendante du RID pour กี่

Les deux entrées กี่ du `.ods` portent **`RID` en colonne `DOM`**. La réserve
générale du dossier, héritée de `u06-l6a`, dit qu'« une partie des entrées porte
RID en colonne DOM », mais ne signale pas qu'elle touche l'un des six mots du
jour. Le ton de กี่ garde deux jambes réellement indépendantes, en.wiktionary
/kiː˨˩/ et la dérivation par le tableau de `u07-l7a`, mais la présentation compte
VOLUBILIS comme l'une d'elles.

## 5. Points examinés avec suspicion et jugés SAINS

- **Sujet sensible.** Aucun conseil médical, aucune posologie, aucune quantité de
  produit, aucun numéro d'urgence, aucune information de secours, aucune conduite
  à tenir. ยา nomme la catégorie et rien d'autre. Les composés de ยา, กินยา,
  เภสัชกร et les mots de symptôme sont réellement écartés, et le sont pour des
  motifs écrits. **Seul le dialogue pose problème, voir B6.**
- **Distinction ปวด contre เจ็บ.** Hors périmètre de 9D : `--grep` confirme que
  9D ne publie ni l'un ni l'autre, et la leçon renvoie explicitement à 9A et 9B.
  Rien à auditer ici, la question appartient à ces deux fichiers.
- **Section 1 bis.** Le contrôle est exact et l'auditeur l'a reproduit formule par
  formule sur le périmètre écran réel. L'assertion de prosodie française retirée
  avant clôture l'est bel et bien. L'énoncé « inverse du français » de l'item 3
  est un fait de syntaxe que tout lecteur francophone vérifie, il ne relève pas de
  la section 1 bis, et la leçon le signale au lieu de le cacher.
- **Réponse constante.** Aucun des cinq exercices n'est franchissable par une
  réponse constante : 2 sur 10, 4 sur 10, appariement un pour un, ordre à
  construire, saisie libre. Le défaut des exercices 2, 4 et 5 est ailleurs, dans
  les stratégies partielles, et c'est l'objet de B1, B2 et B3.
- **Corrigés.** Les cinq réponses de l'exercice 5, les cinq ordres de
  l'exercice 4, les six paires de l'exercice 3 et les dix réponses de
  l'exercice 2 ont été vérifiés un par un contre les items et les publications du
  parcours. **Aucun corrigé faux.**
- **Registre.** Aucune étiquette de registre sur les six vedettes du RID ;
  ครับ, ค่ะ et คะ sont employés conformément à `u01-l1e` et `u02-l2e`, y compris
  la distinction คะ en question contre ค่ะ en affirmation, correcte partout où
  elle apparaît, dialogue compris.
- **Incertitude 1.** Elle est fondée et l'auditeur l'a reconfirmée de trois côtés :
  กี่วันแล้ว est absent du RID, absent de VOLUBILIS, et son adresse en.wiktionary
  répond 404. La leçon ne cache pas que sa construction centrale n'est pas
  attestée. Elle reste bloquante pour le passage en `review`, et cet audit ne la
  lève pas.
- **Incertitude 7.** Confirmée sur pièce : le `VOLUBILIS_Database.xlsx` du poste
  fait 154 octets et n'est pas un classeur. Le report de la chaîne de citation sur
  le `.ods`, par clé et non par numéro de ligne, est la bonne décision, et
  l'empreinte annoncée est exacte.

## 6. Conclusion

La leçon a un noyau linguistique solide, et le second passage ne l'entame pas :
**224 faits reconfirmés de première main, zéro graphie fausse, zéro ton faux,
zéro longueur fausse, zéro sens faux, zéro registre faux, zéro corrigé faux,
zéro correspondance de finale fausse, et aucune référence externe inventée ou mal
citée.** Les huit références externes ouvertes par l'auditeur existent toutes et
disent toutes ce que la leçon leur fait dire, y compris les deux 404 qui
affaiblissent sa propre thèse.

Ce qui casse est du même genre que ce qu'avait trouvé le premier audit, et au
même endroit : **les contrôles que la leçon fait sur elle-même**. Trois exercices
sur cinq peuvent franchir leur seuil sans la compétence annoncée, dont un dans une
session sur cinq ; une coordination inter-leçons est fausse dans le sens qui
supprimerait l'entretien des tons ; un script versionné du dépôt échoue sur le
fichier pendant que le tableau des audits porte « CORRIGÉ » ; et le dialogue
rejoue ce que le texte a retiré faute de source.

**Statut : reste `draft`.** Aucun passage en `review` avant traitement de B1 à B6,
et de toute façon avant résolution de l'incertitude 1.

---

# Annexe : premier contre-audit du 2026-08-04, conservé sans modification

Les douze findings ci-dessous ont tous été traités par la consolidation du
2026-08-04, et le journal de traitement figure dans le dossier de production de
la leçon. Le présent second audit a vérifié chacune des corrections annoncées et
en a confirmé la substance, à trois réserves près, consignées en N2, N3 et B5
ci-dessus.

## Contre-audit adversarial de `u09-l9d` (Chez le pharmacien)

- Date : 2026-08-04
- Fichier audité : `content/authoring/unite-09/lecon-9d.md`
  (120 332 octets, sha256 `013e6a10c03e1879a371432e91b1b5da3fbcec3fa9a3ba068101a9236827aab0`)
- Posture : adversariale. Aucune source citée par la leçon n'a été crue sur
  parole. Chaque relevé ci-dessous a été REFAIT par l'auditeur, avec les scripts
  versionnés du dépôt ou par requête directe, jamais par lecture du dossier de
  production.
- Verdict : **6 findings bloquants, 6 findings non bloquants.** Le noyau
  linguistique de la leçon (graphies, tons, longueurs, IPA, sens, dérivations)
  est solide et intégralement reconfirmé. Ce qui casse est ailleurs : trois
  contrôles annoncés « vérifiés » sont faux, une référence interne n'existe pas,
  un fait est mono-sourcé, et le texte écran affirme sans source des choses sur
  le fonctionnement d'une pharmacie.
- Statut recommandé : reste `draft`. Aucun passage en `review`.

### 1. Méthode et artefacts employés

| Artefact                      | Empreinte                                    | Provenance                                                                       |
| ----------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| `VOLUBILIS_Database.xlsx`     | 10 848 409 o, sha256 `b9ab7418…20fc0c`       | copie locale, empreinte identique à celle de l'en-tête de `volubilis-lookup.mjs` |
| `VOLUBILIS.ods`               | 15 724 718 o, sha256 `bb9c5da5…4a094cc`      | copie locale, empreinte identique à celle de l'en-tête de `volubilis-codes.mjs`  |
| RID 2554                      | POST `dictionary.orst.go.th/func_lookup.php` | via `rid-lookup.mjs` et `rid-entry.mjs`                                          |
| en.wiktionary                 | `?action=render`                             | fetch direct, page conservée pour relecture                                      |
| `IndicPositionalCategory.txt` | Unicode 17.0                                 | fichier de la base de caractères                                                 |

Scripts employés : `unicode-thai.mjs`, `repo-thai-scan.mjs`, `rid-lookup.mjs`,
`rid-entry.mjs`, `volubilis-lookup.mjs`, `volubilis-codes.mjs`.

**Incident constaté pendant l'audit, et il confirme l'incertitude 7 de la
leçon.** L'exemplaire `VOLUBILIS_Database.xlsx` du répertoire de travail a été
écrasé pendant la session par un fichier de 146 octets
(sha256 `55f7d9e9…87e3e0`) qui n'est pas un classeur : `volubilis-lookup.mjs` y
échoue sur l'absence d'enregistrement de fin de répertoire zip. L'audit a été
mené sur une copie dont l'empreinte est celle documentée par le script. La
fragilité que la leçon signale n'est donc pas théorique, elle s'est reproduite
dans la journée.

### 2. Ce que l'auditeur a confirmé lui-même

**189 faits atomiques re-vérifiés, zéro écart** sur tout le noyau linguistique.

#### 2.1 RID 2554, 36 faits

- Les **26 graphies** annoncées ont été réinterrogées une par une. Résultat
  identique au dossier : **15 `entree`** (ยา, ร้าน, ขาย, แล้ว, กี่, วัน, มี,
  ไหม, ขอ, หน่อย, อยู่, ที่ไหน, เภสัชกร, เภสัช, คำเป็น) et **11 `absent`**
  (ร้านขายยา, ร้านยา, ขายยา, กินยา, กี่วัน, ขอยาหน่อย, มียาไหม, กี่วันแล้ว,
  สองวันแล้ว, สามวันแล้ว, ร้านขายยาอยู่ที่ไหน). 15 + 11 = 26, l'arithmétique du
  dossier tient.
- « ยา ๑ » porte bien **cinq** sens, le (๑) nominal étant la chose qui sert à
  soigner ou prévenir la maladie ou à fortifier le corps, avec la variation des
  noms selon forme, couleur, goût ou odeur, mode de préparation et mode d'emploi.
  Les sens (๒) et (๓) sont bien l'opium et un produit de placage des métaux, les
  (๔) et (๕) sont verbaux, et « ยา ๒ » est bien le mot de composition des termes
  de parenté et du vocabulaire royal.
- La liste des ลูกคำ de « ยา ๑ » compte **exactement 60 entrées**. « Une
  soixantaine » est juste au sens strict.
- « แล้ว » : deux vedettes. La première, adverbiale, donne l'achèvement avec
  กินแล้ว, ทำแล้ว, นอนแล้ว, **et la même vedette** donne l'enchaînement avec
  กินแล้วนอน et ขึ้นรถแล้วลงเรือ. « แล้ว ๒ » est verbale. La page 7 de la leçon
  est donc correctement fondée.
- « กี่ ๒ » est bien un ว. « คำประกอบหน้าคำอื่น » valant « combien », et le
  dictionnaire donne bien **กี่วัน et กี่บาท** comme ses deux exemples, plus
  ไม่กี่. « กี่ ๑ » est bien le métier à tisser.
- « วัน ๑ » définit bien la période de vingt-quatre heures et illustre bien par
  un énoncé où le nombre PRÉCÈDE l'unité, ๒ วัน ๑ คืน.
- « ร้าน » définit bien le lieu où l'on vend (สถานที่ขายของ), et ses ลูกคำ sont
  bien exactement ร้านชำ, ร้านม้า, ร้านรวง. Le RID ne lexicalise donc bien ni
  ร้านขายยา, ni ร้านอาหาร, ni ร้านหนังสือ.
- « ขาย » et « ขอ ๒ » disent bien ce que la leçon leur fait dire.
- La citation de seconde main de `u06-l6d` est exacte : l'entrée « มี » porte
  bien l'exemple มีคนอยู่ไหม, au sens (๒).

#### 2.2 VOLUBILIS, 34 faits

Relevé refait sur l'exemplaire d'empreinte `b9ab7418…` : **586 541 chaînes
partagées, 114 579 lignes non vides**, valeurs identiques à celles publiées.
Les dix-huit numéros de ligne cités par la leçon sont tous exacts :

| Graphie                  | Ligne                 | ThaiPhon         | Contrôle                                              |
| ------------------------ | --------------------- | ---------------- | ----------------------------------------------------- |
| ยา                       | 111142                | `-yā`            | FRA « médicament [m] ; remède [m] ; … »               |
| ร้าน                     | 81048                 | `¯rān`           | « magasin ; boutique ; échoppe »                      |
| ขาย                      | 29410                 | `/khāi`          | « vendre ; commercialiser »                           |
| ร้านขายยา                | 81352                 | `¯rān /khāi -yā` | « pharmacie [f] ; officine [f] », `MEDIC (pharma)`    |
| แล้ว                     | 47342 / 47343         | `¯laēo`          | « déjà » / « ensuite ; et ensuite ; et »              |
| กี่                      | 40796                 | `_kī`            | « combien de ? » ; 40795 = le métier à tisser         |
| วัน                      | 108182                | `-wan`           | « jour ; journée ; date »                             |
| กี่วัน                   | 41493                 | `_kī -wan`       | **FRA « Combien de jours ? »**, colonne M `[กี่ วัน]` |
| ไม่กี่วัน                | 52080                 | `\mai _kī -wan`  | colonne M `[ไม่ กี่ วัน]`                             |
| ในอีกไม่กี่วันข้างหน้า   | 57856                 |                  | « d'ici peu de jours »                                |
| ร้านอาหาร / ร้านหนังสือ  | 81049 / 81376         |                  | « restaurant » / « librairie »                        |
| วันแล้ววันเล่า           | 108524                |                  | « jour après jour »                                   |
| เภสัชกร / ร้านยา / กินยา | 70537 / 81419 / 41204 |                  | candidats écartés, tous réels                         |

Les sept blocs déclarés absents le sont : ขอยาหน่อย, มียาไหม, กี่วันแล้ว,
สองวันแล้ว, สามวันแล้ว, ร้านขายยาอยู่ที่ไหน et ขอยา répondent tous `ABSENT`.

Clé `TONES` de la feuille `Codes` du `.ods` relue : `-x` normal, `¯x` high/haut,
`_x` low/bas, `/x` rising/montant, `\x` falling/descendant. Conforme.

#### 2.3 en.wiktionary, 30 faits

Sept pages récupérées en rendu, chacune conservée. Toutes les valeurs citées par
la leçon sont exactes, au caractère près :

- ยา : `/jaː˧/`, Paiboon `yaa`, RI `ya`, sens « medicine; drug », puis
  « tobacco », « (colloquial) cigarette », « (dated) opium » et un sens familier.
- ร้านขายยา : `/raːn˦˥.kʰaːj˩˩˦.jaː˧/`, `ráan-kǎai-yaa`, `ran-khai-ya`,
  « drugstore, pharmacy », étymologie donnée explicitement comme ร้าน + ขาย + ยา.
- ร้าน : `/raːn˦˥/`, `ráan`, « place for selling goods, as shop, store, etc. » ;
  la liste des dérivés porte bien ร้านขายยา, ร้านอาหาร, ร้านหนังสือ, ร้านกาแฟ.
- ขาย : `/kʰaːj˩˩˦/`, `kǎai`, « to sell » ; la liste des dérivés porte bien
  ร้านขายยา.
- แล้ว : `/lɛːw˦˥/`, `lɛ́ɛo`, `laeo` ; l'adverbe est bien défini comme « used at
  the end of a sentence to indicate completion of an action, or beginning of a
  new situation », avec เด็ก ๆ กินข้าวแล้ว et เธอเป็นผู้ใหญ่แล้วนะ.
- กี่ : `/kiː˨˩/`, `gìi`, `ki`, pronom « how many, how much (followed by
  classifier or common noun) », exemples กี่บาท et กี่โมง ; la liste des dérivés
  porte bien กี่วัน et นี่กี่โมงแล้ว.
- วัน : `/wan˧/`, `wan`, « day », classificateur วัน.
- **Les deux 404 annoncés sont réels** : กี่วัน et นี่กี่โมงแล้ว n'ont pas de
  page. La leçon dit vrai en disant que son indice le plus favorable est
  invérifiable.
- Contrôles supplémentaires faits par l'auditeur et non demandés par la leçon :
  หน่อย est bien `/nɔj˨˩/` et explicitement noté « Short », ce qui confirme le
  champ `longueur : nàwi brève` de l'item 4 ; อยู่ est bien `/juː˨˩/`.

#### 2.4 Unicode, 12 faits

`unicode-thai.mjs` sur le fichier : **163 chaînes thaïes distinctes, toutes NFC
stables, aucun caractère de la zone à usage privé.** Les huit champs
`codepoints` correspondent caractère par caractère aux champs `thai`, y compris
les deux formes séparées par `/`. U+0E41 est bien classé `Visual_Order_Left`
dans `IndicPositionalCategory.txt` d'Unicode 17.0, donc le point de rendu
signalé pour แล้ว est réel et correctement décrit.

#### 2.5 Contrôles internes au dépôt, 60 faits

- `repo-thai-scan.mjs --check-u07` passe : la convention de comptage est
  reproduite, les chiffres du script sont donc citables.
- Unités 1 à 8 : **40 fichiers, 383 entrées, 283 graphies, 92 ไม้เอก, 66 ไม้โท,
  1 ไม้ตรี, 2 ไม้จัตวา.** Identique au dossier.
- Les six lignes du tableau `--grep` sont reproduites exactement : ยา rend 4
  graphies dont **ยา en 1C** et non en 1D, แล้ว rend 2 graphies toutes deux en
  emploi de liaison, ร้าน et ขาย rendent 0, วัน rend 5, กี่ rend 3, et
  หมอ / เจ็บ / ปวด rendent 0 dans les unités 1 à 8.
- Les 37 graphies à pile de deux signes des unités 1 à 7 attribuées à `u08-l8a`
  sont bien 37.
- **Dix-sept renvois d'items ont été ouverts un par un** et disent tous ce que
  9D leur fait dire : `u01-l1c` item 9 (ยา, `/jaː˧/`, moyen, longue, `yaa`),
  `u01-l1e` item 5 (แล้วเจอกัน, `/lɛːw˦˥.t͡ɕɤː˧.kan˧/`, `láeew·joee·kan`),
  `u06-l6e` item 2 (แล้วคุณล่ะ, `láeew khoun lâ`), `u07-l7c` item 3 (วัน, moyen,
  brève), `u05-l5c` item 3 (patron), `u05-l5e` items 7 et 8
  (`tà·làat yòuu thîi·nǎi`, `trong pai`), `u02-l2c` items 5, 7 et 8
  (`khǎww náam nàwi`, nàwi bas et brève), `u04-l4c` item 7, `u08-l8d` item 7,
  `u03-l3c` (`kìi bàat`, deux basses de suite), `u03-l3d` items 6 et 8
  (ปลาสองตัว, กี่คน), `u03-l3b` (สอง et สาม montants et longs), `u01-l1d`
  (หมา montant, ม้า haut, ไหม montant), `u01-l1a` (คา, ข่า, ขา, ค้า), `u05-l5b`
  (มา), `u04-l4d` (ไม่), `u08-l8a` (ง่าย). **Zéro divergence de ton, de longueur
  ou de transcription.**
- **Les vingt étiquettes de ton de la réserve de l'exercice 1 sont justes**,
  vérifiées une par une par la règle classe + marque + syllabe vivante.
- **Les six dérivations de ton du jour sont justes et concordent avec les deux
  sources externes** : ยา moyen, ร้าน haut, ขาย montant, แล้ว haut, กี่ bas,
  วัน moyen. Six prédictions, six concordances, aucun écart. Le tableau
  « prédiction puis relevé » du dossier est intégralement reconfirmé.

#### 2.6 Arithmétique et section 1 bis, 17 faits

- `761 / 9 765 625 = 0,0078 %` : juste (somme des termes 8, 9 et 10 d'une
  binomiale 10 et 1/5).
- `201 / 59 049 = 0,34 %` : juste (idem, 10 et 1/3).
- `1 / 720 = 0,14 %` et l'impossibilité de 5 points fixes sur 6 : justes.
- `P(6,4) = 360` et `P(5,4) = 120` : justes.
- Répartition de l'exercice 2 : 4 / 3 / 3, genres alternés H F H F H F H F H F,
  2H+2F pour ขอยาหน่อย, 2H+1F pour มียาไหม, 1H+2F pour กี่วันแล้ว. Tout est
  exact.
- Planchers de l'exercice 5 : « toujours la même particule » plafonne bien à
  2 sur 5, « toujours `khâ` pour une femme » et « toujours `khá` pour une femme »
  plafonnent bien à 3 sur 5.
- **Section 1 bis : conforme, et le contrôle est réellement recomputable.** Le
  périmètre écran fait **exactement 952 lignes**, comme annoncé. Les six formules
  balayées rendent 0, 0, 0, 0, 1 et 0, exactement le tableau du dossier. Un
  balayage plus large fait par l'auditeur (« du français », « en France ») ne
  remonte que des énoncés de TRADUCTION, jamais un fait de phonétique française.
  **Zéro tiret cadratin ou demi-cadratin** dans le périmètre écran, ADR-0022
  respectée.
- **Aucun exercice n'est réussissable par une réponse constante** : 2 sur 10,
  4 sur 10, appariement un pour un, ordre, saisie libre. Vérifié tirage par
  tirage sur les cinq mécaniques.

### 3. Findings bloquants

#### B1. Le contrôle Unicode des piles est faux, et il se contredit lui-même

La section « Vérification Unicode » écrit deux phrases inconciliables :

> ร้าน et แล้ว empilent chacun un seul signe Top […]. **Aucune pile à deux
> étages dans cette leçon** […] : la marge supérieure de ligne n'est pas un point
> de risque ici.

puis, au point suivant :

> กี่ empile U+0E35 puis U+0E48 sur ก : **une seule pile à deux étages dans tout
> le fichier**, et elle est ordinaire.

Les deux sont fausses. Relevé de l'auditeur sur les 163 chaînes thaïes du
fichier : **28 chaînes portent une pile Top de profondeur 2**, réparties sur
**sept formes de pile distinctes** : กี่, ที่, พี่, นี่, นี้, ลี่ (dans
ขอเปลี่ยนหน่อยครับ), ขึ้ (dans ขึ้นรถแล้วลงเรือ) et สื้ (dans ผมหาเสื้อครับ).

Le cas qui compte pour le rendu n'est pas กี่ mais **ที่**, parce qu'il est
présent :

- dans le champ `thai` de l'item 3, `ร้านขายยาอยู่ที่ไหนครับ / …คะ` ;
- dans la chaîne que le dossier désigne lui-même comme la plus longue affichée
  de la leçon, celle dont il demande le contrôle de rendu à 390 px ;
- dans deux répliques du dialogue.

La conclusion « la marge supérieure de ligne n'est pas un point de risque ici »
repose donc sur un décompte faux, et la ligne « Unicode | vérifié » du tableau
des audits certifie un contrôle qui n'a pas été fait. C'est exactement le mode
d'échec que l'en-tête de `unicode-thai.mjs` décrit pour `u08-l8c` : « un contrôle
Unicode annoncé deux signes en comptait sept ».

**Correction attendue** : refaire le décompte par script, réécrire les deux
points, et maintenir la demande de contrôle de rendu à 390 px sur
ร้านขายยาอยู่ที่ไหนครับ en signalant la pile de ที่.

#### B2. La réserve de l'exercice 1 corrèle longueur et ton, et la leçon affirme le contraire

La leçon écrit, au plancher de stratégie :

> stratégie de la longueur de voyelle : **sans effet**, la réserve contient des
> voyelles longues et brèves dans les cinq tons

et, aux pièges connus :

> croire que la voyelle longue appelle un ton plutôt qu'un autre, **ce que la
> composition de la réserve dément**.

Relevé de l'auditeur, longueur par longueur, d'après les items publiés :

| Ton        | Spécimens            | Longueurs                          |
| ---------- | -------------------- | ---------------------------------- |
| moyen      | ยา, วัน, คา, มา      | longue, **brève**, longue, longue  |
| bas        | กี่, หน่อย, ป่า, ข่า | longue, **brève**, longue, longue  |
| montant    | ขาย, ขอ, ขา, หมา     | **longue, longue, longue, longue** |
| haut       | ร้าน, แล้ว, ค้า, ม้า | **longue, longue, longue, longue** |
| descendant | ง่าย, ไม่, ห้า, เก้า | longue, **brève**, longue, longue  |

**Aucun mot bref de la réserve ne porte le ton montant ni le ton haut.** La
phrase « des voyelles longues et brèves dans les cinq tons » est fausse pour deux
tons sur cinq, et la réserve, loin de démentir l'association longueur-ton, en
instancie une : entendre une voyelle brève élimine deux options sur cinq, dont
précisément les deux du duel que l'exercice est censé entretenir.

L'effet ne suffit pas à atteindre 8 sur 10 sans percevoir les tons, donc
l'exercice n'est pas cassé. Ce qui est cassé est l'affirmation, et elle est
double : un plancher de stratégie faux et un piège qui enseigne à l'apprenant
l'inverse de ce que le matériel lui montre. C'est le seul exercice que la section
« Fil des tons » de `CONVENTIONS.md` impose, ce qui rend le défaut non cosmétique.

**Correction attendue** : introduire au moins un mot bref à ton montant et un à
ton haut dans la réserve, ou retirer les deux affirmations. Note : ห้า et เก้า
sont publiés par `u03-l3b` avec `longueur : longue`, ce que l'auditeur a vérifié ;
la leçon les cite correctement comme longs, l'erreur ne vient pas de là.

#### B3. `u06-l6d` ne publie pas มีพี่น้องไหม, et le patron de l'item 5 n'a donc pas la référence qu'on lui donne

La leçon l'écrit trois fois :

> leçon 6B et 6D : มี, **มีพี่น้องไหม**, มีกี่คน et ไม่มี. Le patron
> มี + nom + ไหม vient de là

> `u06-l6b` publie มี et **`u06-l6d` publie มีพี่น้องไหม**, มีกี่คน et ไม่มี

> มี et **มีพี่น้องไหม** [gardent leurs cartes] de `u06-l6b` et `u06-l6d`

Relevé de l'auditeur :

- `u06-l6d` porte huit items : มี, ไม่, ไม่มี, คน, มีกี่คน, พี่น้อง, ครอบครัว,
  มีพี่น้องสองคน. **Aucun n'est มีพี่น้องไหม.**
- Le dossier de `u06-l6d` le dit lui-même, à sa ligne 823 :
  « Codepoints des deux blocs **qui n'ont pas d'item** : มีพี่น้องไหม vaut … ».
  La forme n'apparaît que dans le tableau de dialogue de 6D.
- La section SRS de `u06-l6d` porte six cartes, 01 à 06. **Aucune ne concerne
  มีพี่น้องไหม.** La ligne « hors périmètre » de 9D renvoie donc à une carte
  inexistante, ce qui laisserait le bloc sans carte du tout.
- Conséquence linguistique, plus lourde que l'erreur de renvoi :
  `repo-thai-scan.mjs 1 8 --grep ไหม` rend six graphies publiées, ไหม (1D),
  สบายดีไหมครับ et สบายดีไหมคะ (2B), สบายดี / สบายดีไหม (2E), ไกลไหม (5E),
  เขาสูงไหม (6C). **Toutes sont [prédicat] + ไหม.** Aucun item publié du parcours
  n'instancie มี + NOM + ไหม. L'affirmation « le patron มี + nom + ไหม est donc
  déjà publié avec un nom dans la case ; 9D y met ยา » n'est appuyée par aucun
  item.

Le fait de langue lui-même est juste, et l'exemple มีคนอยู่ไหม que le RID donne à
l'entrée « มี » le corrobore, l'auditeur l'a revérifié. Ce qui est faux est la
chaîne de preuve interne, et elle porte l'item 5 tout entier.

**Correction attendue** : soit citer 6D comme dialogue et non comme publication,
en assumant que le patron avec un nom n'est pas encore un item du parcours, soit
faire de มียาไหม la première publication de ce patron et le dire.

#### B4. Le texte écran affirme sans source ce que fait un pharmacien thaï, et le tableau du périmètre sensible certifie le contraire

Le tableau « Contrôle du périmètre sensible » écrit :

| Interdit                                                | Résultat   |
| ------------------------------------------------------- | ---------- |
| affirmation sur le fonctionnement des pharmacies thaïes | **aucune** |

Relevé de l'auditeur dans le périmètre écran :

- page 1 : « la question que le pharmacien vous posera **presque à coup sûr** » ;
- page 2 : « Dans une pharmacie, vous décrivez votre situation et **c'est le
  professionnel en face de vous qui questionne et qui décide** » ;
- page 8 : « **Voici la question que le pharmacien vous posera** », sans
  atténuation ;
- item 7, `note_fr` : « la question **que vous entendrez**, plutôt que celle que
  vous poserez, et c'est pour cela qu'elle est travaillée d'abord à l'écoute » ;
- page 10 : « Tout ce qui suit appartient au professionnel qui vous répond ».

Ce sont bien des affirmations sur le déroulement d'un échange en pharmacie, elles
sont répétées, elles sont structurantes (elles justifient que l'item 7 soit
travaillé en réception), et **aucune n'est sourcée**. La note culturelle dit
d'ailleurs le contraire à son sujet : « Elle ne dit rien non plus de ce qu'on
trouve dans une pharmacie thaïe […] faute d'une source de terrain dans la
politique du projet ». Enfin l'incertitude 1 reconnaît que กี่วันแล้ว n'est
attesté nulle part : la leçon annonce donc à l'apprenant qu'un pharmacien lui
posera une question dont elle ne peut montrer aucune attestation.

Le sujet étant la santé, et la consigne d'audit demandant de bloquer toute
information de conduite dans ce domaine, même sourcée, une affirmation non
sourcée sur le comportement d'un professionnel de santé est bloquante, et la
ligne « aucune » du tableau est une certification fausse.

**Correction attendue** : reformuler en énoncé de langue (« cette question se
construit ainsi ; vous pouvez l'entendre ») plutôt qu'en prédiction de
comportement, et corriger la ligne du tableau.

#### B5. Le ton de ไหม comme particule de question est mono-sourcé, et la source interne dit elle-même qu'il varie

L'item 5 écrit à l'apprenant :

> Cette montée est le TON du mot, publié par `u01-l1d` comme montant : **ne la
> traitez pas comme un signal ajouté par la voix, tenez-la comme vous tiendriez
> n'importe quel autre ton.**

Relevé de l'auditeur :

- `u01-l1d` publie ไหม au sens de **la soie**, et sa `note_fr` écrit :
  « Le même mot écrit sert aussi de particule de question, enseignée plus tard :
  **son ton en parole courante varie selon les sources** (voir dossier de
  production) ». Ses trois sources portent explicitement sur le sens « soie ».
- Le champ `sources` de l'item 5 de 9D ne contient **aucune source externe** pour
  le ton de la particule : quatre renvois internes (`u06-l6b`, `u06-l6d`,
  `u06-l6e`, `u01-l1d`, `u02-l2b`), un exemple RID cité de seconde main pour le
  patron, et trois relevés d'absence. Or le dossier de 9D reconnaît lui-même que
  les publications internes « ne sont pas une source linguistique ».
- La page en.wiktionary de ไหม, source de recoupement autorisée, donne **deux**
  prononciations pour l'entrée, `/maj˩˩˦/` et `/maj˦˥/`, et déclare
  **มั้ย (mái), ton haut, comme forme alternative** de la particule.

La règle des deux sources indépendantes par fait n'est donc pas satisfaite, et
9D transforme une note interne explicitement prudente en assertion sans réserve.
Le risque n'est pas théorique : l'exercice 2 et son feedback demandent à
l'apprenant d'entendre une montée sur mǎi, et l'enregistrement d'une voix
familière peut très bien produire มั้ย.

**Correction attendue** : sourcer le ton de la particule sur deux autorités, ou
reprendre la réserve de 1D telle quelle au lieu de la lever.

#### B6. La note culturelle généralise plus loin que ses sources, et une des sources citées la contredit

Texte écran :

> Vous n'avez donc pas besoin de connaître chaque enseigne par cœur : **il vous
> suffit de repérer ร้าน au début et de lire la suite.**

Dossier, à l'appui :

> une liste de termes dérivés qui porte ร้านขายยา, ร้านอาหาร, ร้านหนังสือ,
> ร้านกาแฟ et une vingtaine d'autres, **tous construits sur le même moule**.
> C'est cette liste, et non le RID, qui fonde la généralité de la note.

Relevé de l'auditeur :

- La liste des dérivés de en.wiktionary compte **29 entrées**, dont au moins neuf
  ne sont pas « ร้าน + ce qu'on y vend » : นั่งร้าน, ร่างร้าน, ห้างร้าน, ออกร้าน,
  ร้านชำ, ร้านม้า, ร้านรวง, เก็บเบี้ยใต้ถุนร้าน, ชาวบ้านร้านตลาด. « Tous
  construits sur le même moule » fait dire à la source plus qu'elle ne dit, et
  c'est la phrase même qui est présentée comme le fondement de la généralité.
- Pire, la leçon cite elle-même ร้านม้า parmi les trois ลูกคำ du RID sans dire ce
  que c'est. L'auditeur a ouvert l'entrée : **ร้านม้า est une plateforme de bois
  surélevée à six poteaux, destinée à recevoir un cercueil avant la crémation.**
  Ce n'est pas un commerce. Appliquer « repérer ร้าน et lire la suite » à ร้านม้า
  donne un contresens complet.
- L'entrée « ร้าน » du RID donne en outre ร้านบวบ et ร้านองุ่น, qui sont des
  treilles à courges et à vigne, pas des boutiques de courges et de raisin.

La note reste défendable si elle est restreinte aux enseignes, ce que le texte
écran ne fait pas : il propose une stratégie de lecture générale.

**Correction attendue** : restreindre explicitement la stratégie aux devantures
et aux trois exemples cités, retirer « tous construits sur le même moule », et ne
plus citer ร้านม้า sans dire qu'il est un contre-exemple.

### 4. Findings non bloquants

#### N1. La section « Coordination avec le reste de l'unité 9 » est périmée

Le dossier écrit « **`lecon-9a.md` n'existe toujours pas** » et bâtit trois de
ses quatre points là-dessus. `lecon-9a.md` existe désormais (116 967 octets).
Conséquences mesurées par l'auditeur avec `repo-thai-scan.mjs 9 9 --grep` :

- ยา ne rend plus 5 graphies mais **6**, et l'une, โรงพยาบาล, est dans 9A. La
  phrase « toutes dans 9D » est fausse ;
- หมอ est publié **trois** fois dans l'unité, pas deux : 9A, 9C et 9E ;
- ปวด est publié par 9A et par 9B, เจ็บ par 9A ;
- « le bloc d'écriture […] appartient à 9A, qui n'existe pas » est faux, et 9A
  traite bien les finales écrites.

Le fond tient : aucune des quatre autres leçons ne publie l'un des six mots de
9D, et 9A déclare explicitement ne pas réenseigner ยา. Mais tous les chiffres de
la section doivent être refaits, et le point 3 réécrit, avant la consolidation.

#### N2. La commande citée pour la clé `TONES` ne rend pas ce qui est cité

Le dossier écrit que la clé a été relue par
`node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> TONES`. Cette
commande exacte ne rend qu'une ligne, l'en-tête `TONES | ● ● ●`. Les cinq lignes
de marqueurs (`-x normal`, `¯x high | haut`, …) ne portent pas la chaîne
« TONES » et sont donc éliminées par le filtre : il faut lancer le script sans
filtre. La clé citée est exacte, l'auditeur l'a obtenue, mais la commande donnée
comme moyen de la recomputer ne la produit pas. Dans un dossier dont la thèse est
la recomputabilité, c'est une faille de forme à corriger.

#### N3. Le décompte « huit numéros de ligne » est faux

La phrase « Les huit numéros de ligne cités par ce dossier sont … » en énumère
neuf dans la même phrase, en ajoute trois (81049, 81376, 108524), et le fichier
en cite cinq autres ailleurs (52080, 57856, 70537, 81419, 41204), soit **au moins
dix-sept**. Tous sont exacts, l'auditeur les a tous vérifiés ; seul le décompte
est faux. Même défaut que la ligne « 26 graphies RID », qui, elle, est juste.

#### N4. Le plancher « 2 sur 5 dans le meilleur des cas » de l'exercice 4 n'est pas atteignable

La stratégie décrite est « garder une particule féminine **sans distinguer** คะ
de ค่ะ ». Un apprenant qui ne les distingue pas en joue une seule ; or le tirage 1
appelle คะ et le tirage 3 appelle ค่ะ. Il ne peut donc gagner qu'**un** des deux
tirages féminins, et le plafond réel est 1 sur 5, non 2 sur 5. La conclusion,
« très en dessous du seuil », est renforcée et non affaiblie. À corriger pour
l'exactitude.

#### N5. Le chiffre « hasard pur » de l'exercice 1 n'est pas une borne sur l'exercice tel qu'il est spécifié

`761 / 9 765 625` est le calcul juste d'une binomiale i.i.d. de paramètres 10 et
1/5, l'auditeur l'a refait. Mais le tirage annoncé n'est pas i.i.d. : il est
contraint à **exactement deux mots par ton** et à **jamais deux fois de suite le
même ton**, et ces deux contraintes sont écrites à l'apprenant. Avec un retour
après chaque tirage, un devineur peut s'en servir (la seconde contrainte ramène
le choix à quatre options après chaque réponse connue, la première ferme les tons
épuisés). L'ordre de grandeur reste très loin de 8 sur 10 et le seuil tient, mais
le chiffre publié doit être présenté comme un repère et non comme la probabilité
de la stratégie optimale.

#### N6. Contradiction interne sur le nombre de voix de l'exercice 2

« les **six** voix ne sont pas assignées aux rôles : les mêmes **deux** voix
disent les trois phrases », alors que le dialogue en annonce trois. « Six »
désigne vraisemblablement les six combinaisons phrase × genre, mais la phrase se
contredit en son milieu et doit être réécrite avant la production audio, qui s'en
servira de feuille de session.

### 5. Points examinés et jugés SAINS, malgré la suspicion

Consignés parce qu'un contre-audit qui ne dit que ce qui casse est inutilisable.

- **Périmètre sensible, hors le B4.** Aucun nom de médicament, aucune marque,
  aucun principe actif, aucune posologie, aucune quantité de prise, aucune durée
  de traitement, aucun numéro d'urgence, aucune conduite à tenir. Les seuls
  nombres comptent des jours écoulés. ยา nomme bien la catégorie, et les soixante
  ลูกคำ du RID sont tous écartés, ce que l'auditeur a vérifié en les lisant.
  กินยา est écarté avec le bon motif. Le dialogue s'arrête au prix et l'échange
  raccourci est signalé à l'écran.
- **Distinction ปวด contre เจ็บ** : hors sujet pour 9D, qui ne publie ni l'un ni
  l'autre. `repo-thai-scan.mjs 1 8` confirme 0 graphie pour les deux. La question
  appartient à 9A et 9B, qui les publient tous les deux, et le doublon
  9A / 9B sur ปวด est à trancher là-bas.
- **Correspondances de finales** : 9D n'en ouvre aucune. Elle s'appuie sur la
  série ง, น, ม, ย, ว publiée par `u04-l4a` (ligne 117) et rappelée par
  `u08-l8a` (ligne 1456), ce que l'auditeur a vérifié dans les deux fichiers. Les
  six syllabes du jour sont bien vivantes, par les finales น (ร้าน, วัน), ย
  (ขาย), ว (แล้ว) ou par un noyau long sans finale (ยา, กี่). Aucune finale
  annoncée n'est fausse.
- **Registre** : aucune étiquette de registre sur les six vedettes du RID,
  vérifié entrée par entrée. Les particules ครับ, ค่ะ et คะ sont employées
  conformément à `u01-l1e` et `u02-l2e` : คะ en question, ค่ะ en affirmation,
  ครับ dans les deux cas pour un homme. Les cinq tirages de l'exercice 5 et les
  cinq de l'exercice 4 sont corrects sur ce point.
- **Corrigés** : les cinq réponses de l'exercice 5, les cinq ordres de
  l'exercice 4, les six paires de l'exercice 3 et les dix cibles de l'exercice 2
  ont été revérifiés un par un. Aucun corrigé faux.
- **Aucun exercice réussissable par une réponse constante**, aucun réussissable
  en comptant les syllabes, en écoutant la particule, en lisant le genre de la
  voix ou en se fiant au rôle. Ces verrous sont réels.
- **Honnêteté du dossier** : les trois relevés d'absence les plus gênants pour la
  leçon (กี่วันแล้ว absent partout, ร้านขายยา absent du RID, กี่วัน sans page
  Wiktionary) sont exacts et écrits en clair. L'incertitude 1 est correctement
  qualifiée de bloquante. Le retrait documenté d'une assertion de prosodie
  française à l'item 5 est réel : le périmètre écran ne contient effectivement
  plus aucun fait de phonétique du français.

### 6. Conclusion

Le noyau linguistique de 9D est le plus solide qu'un audit puisse espérer à ce
stade : **189 faits re-vérifiés, aucun écart** sur les graphies, les séquences
NFC, les tons, les longueurs, les IPA, les sens, les dérivations, les renvois
internes et l'arithmétique des planchers. Aucune référence n'est inventée, aucun
numéro de ligne n'est faux, aucune page citée n'est absente sauf celles que la
leçon déclare elle-même absentes.

Ce qui bloque n'est pas le thaï, c'est la certification. Trois contrôles annoncés
comme passés ne le sont pas (Unicode des piles, longueur de la réserve, périmètre
sensible), une référence interne n'existe pas (มีพี่น้องไหม), un fait est
mono-sourcé (le ton de ไหม particule), et une note culturelle généralise contre
une de ses propres sources. Les six sont réparables sans toucher au contenu
enseigné.

- Statut au moment de l’audit : `draft`. **Contre-audit interne : NON PASSÉ.**
- Passage en `review` conditionné à la résolution des six findings bloquants,
  à celle de l’incertitude 1 de la leçon, et à la reprise de la section de
  coordination après l’apparition de `lecon-9a.md`.
- Revue native : en attente.

### 7. Suite donnée, consolidation du 2026-08-04

Section ajoutée APRÈS l’audit, par la consolidation de `lecon-9d.md`. **Rien
au-dessus de cette ligne n’a été modifié** : un audit qu’on réécrit une fois
traité ne prouve plus rien. Le journal détaillé, avec ce qui a été revérifié
avant d’être appliqué, est dans la section « Journal du contre-audit interne »
du dossier de production de la leçon.

Chaque relevé de cet audit a été REFAIT par la consolidation avec les scripts
versionnés et les sources, jamais accepté sur parole. Les douze findings sont
traités.

| Finding                              | Fondé | Suite                                                                                                                                                                                                                                                             |
| ------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 piles Unicode                     | oui   | Corrigé. Deux piles de profondeur 2 dans les items, dont ที่ dans l’item 3, relevées par `repo-thai-scan.mjs 9 9 --stacked`. Décompte sur fichier entier non recomputable : arbitrage 4 ouvert. L’audit annonce sept formes et en énumère huit                    |
| B2 longueur et ton dans la réserve   | oui   | Corrigé autrement que proposé. เขา (bref, montant, vivant) remplace ขอ ; le mot bref à ton haut est REFUSÉ après mesure, les seuls publiés étant des syllabes mortes. Défaut résiduel chiffré, incertitude 8                                                      |
| B3 มีพี่น้องไหม                      | oui   | Corrigé. Les trois affirmations et le renvoi SRS sont réécrits ; มียาไหม est assumé comme première instance publiée du patron, et le patron est re-sourcé sur le RID et sur trois entrées VOLUBILIS                                                               |
| B4 comportement du pharmacien        | oui   | Corrigé par SUPPRESSION, aucune source ne permettant de re-sourcer. Cinq énoncés retirés, deux voisins avec eux, table des remplacements publiée                                                                                                                  |
| B5 ton de ไหม particule              | oui   | Corrigé par RE-SOURÇAGE réel : entrée VOLUBILIS `part. (interr.)` ThaiPhon `/mai`, et en.wiktionary étymologie 1 avec ses deux prononciations et มั้ย. La réserve de 1D est reprise, l’assertion levée est retirée, une contrainte de production audio est écrite |
| B6 note culturelle                   | oui   | Corrigé. 29 dérivés recomptés, neuf hors moule ; « tous construits sur le même moule » retiré ; ร้านม้า cité comme contre-exemple ; stratégie de lecture générale retirée de l’écran                                                                              |
| N1 coordination périmée              | oui   | Corrigé, section refaite par script, plus une divergence de décompte d’unité signalée entre 9A et le script                                                                                                                                                       |
| N2 commande `TONES`                  | oui   | Corrigé, commande sans filtre, vérifiée dans les deux sens                                                                                                                                                                                                        |
| N3 décompte des lignes VOLUBILIS     | oui   | Sans objet par retrait : le `.xlsx` de référence n’est pas lisible sur le poste, les dix-sept numéros sont retirés et tous les faits relevés à nouveau par clé sur le `.ods`                                                                                      |
| N4 plancher de l’exercice 4          | oui   | Corrigé, 1 sur 5 et non 2 sur 5                                                                                                                                                                                                                                   |
| N5 chiffre de hasard de l’exercice 1 | oui   | Corrigé et remplacé par une mesure de l’exercice réel : 4,4 sur 10 en moyenne et 0,74 % d’atteindre le seuil, contre 0,0078 % publié. Incertitude 9 ouverte                                                                                                       |
| N6 nombre de voix                    | oui   | Corrigé, six enregistrements et deux voix, distinctes des trois du dialogue                                                                                                                                                                                       |

**Incertitudes restantes de la leçon après consolidation : 1, 2, 3
(partiellement), 4, 5, 6, 7, 8 et 9.** Une seule est bloquante, la 1, la
naturalité de กี่วันแล้ว, qui attend une source que la politique du projet ne
possède pas. Les 3 et 7 demandent des arbitrages hors leçon. Quatre arbitrages
sont ouverts au niveau du dépôt, dont deux nouveaux : l’artefact VOLUBILIS, et
l’absence d’un décompte de piles sur fichier entier.

- Statut après consolidation : `draft`. **Contre-audit interne : PASSÉ le
  2026-08-04.**
- Passage en `review` conditionné à la seule incertitude 1, qui ne dépend pas de
  cette leçon.
- Revue native : **en attente**, inchangé.
