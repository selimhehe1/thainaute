# Contre-audit adversarial de `u10-l10d`

- Fichier audité : `content/authoring/unite-10/lecon-10d.md`
  (142 804 octets, SHA-256 `417a24bb9c4f0e073a7cedd8cd417af26c829a9442d6a45ac6ff6ccd0c6ff552`,
  relevé par `unicode-thai.mjs` le 2026-08-04)
- Date de l'audit : 2026-08-04
- Auditeur : agent de contre-audit interne, consigne adversariale
- Méthode : aucune assertion du dossier de production n'a été crue. Chaque
  chiffre a été recomputé, chaque entrée de dictionnaire réinterrogée, chaque
  page Wiktionary re-téléchargée en `action=raw`, le PDF de l'ORST retéléchargé
  puis redécodé par un décodeur écrit pour cet audit, et chaque réemploi relu
  dans le fichier qui le publie.
- Verdict : **12 findings, dont 11 BLOQUANTS.** Aucun passage à `review`.

---

## 1. Ce qui a été confirmé par l'auditeur (140 faits)

Il faut le dire d'emblée : l'appareil de preuve de ce fichier est, dans sa
majeure partie, exact et recomputable. Les erreurs listées en section 2 sont
d'autant plus signalables qu'elles se détachent sur un fond très solide.

### 1.1 Dictionnaire royal — 28 interrogations, 28 concordances

`node scripts/verification/rid-lookup.mjs` sur les 28 graphies déclarées par le
dossier rend **exactement** la répartition annoncée : 24 `entree`, 4 `absent`.

- Attestées (24) : ราคา, กิโล, ขีด, ครึ่ง, ชั้น, นาฬิกา, ชั่วโมง, นาที,
  กิโลกรัม, ศูนย์, ฬ, บาท, โมง, ทุ่ม, ตี, เที่ยง, ย่ำรุ่ง, บ่าย, เมตร, ลิตร,
  กรัม, เบอร์, สตางค์, เปอร์เซ็นต์.
- Absentes (4) : โล, กก., ชม., ยํ่ารุ่ง.

L'artefact d'encodage décrit à l'arbitrage 7 est **reproduit tel quel** :
`ย่ำรุ่ง` revient `entree`, `ยํ่ารุ่ง` revient `absent`. Le décompte
« 8 + 9 + 7 + 4 = 28 » est arithmétiquement juste.

### 1.2 Corps des entrées RID — 11 entrées relues, 11 citations fidèles

`rid-entry.mjs` a été relancé sur ราคา, กิโล, ขีด, ครึ่ง, ชั้น, นาฬิกา,
ชั่วโมง, นาที, ฬ, ศูนย์ et โมง. Chaque fait cité par la leçon a été retrouvé :

- **นาฬิกา** (๒) porte littéralement `๑ ชั่วนาฬิกา = ๑ ชั่วโมง`, la série
  `๑ นาฬิกา ๒ นาฬิกา ... ๒๔ นาฬิกา` et `เขียนย่อเป็น น.` La source centrale de
  la leçon dit bien ce qu'on lui fait dire.
- **ชั้น** (๕) porte `บ้าน ๒ ชั้น` comme exemple de ลักษณนาม. L'ordre
  nombre + ชั้น de la page 8 est donc bien attesté par le RID.
- **ครึ่ง** porte la lecture `[คฺรึ่ง]`, séquence recomputée
  `U+0E04 U+0E3A U+0E23 U+0E36 U+0E48 U+0E07` : le พินทุ sous le ค est là.
- **ขีด** (๖) définit bien `น้ำหนัก ๑ ใน ๑๐ ของกิโลกรัม ว่า ขีดหนึ่ง`, et
  (๕) porte bien l'étiquette (ปาก) alors que (๖) n'en porte aucune. La réserve
  de registre de l'item 3 est justifiée.
- **กิโล** est bien à double vedette `กิโล, กิโล-`, trois sens, (ปาก) sur (๒),
  aucune étiquette sur (๓) `คำเรียกสั้น ๆ ของกิโลกรัมและกิโลเมตร`, et
  exactement les cinq ลูกคำ listés.
- **ฬ** porte `[ลอ]` (`U+0E25 U+0E2D`), `พยัญชนะตัวที่ ๔๒`, `ฬอ จุฬา`,
  `อักษรต่ำ`, `พยัญชนะต้น`, `ตัวสะกดในมาตรากน`, exemples ว่าวจุฬา ทมิฬ ปลาวาฬ.
- **ศูนย์** porte `[สูนยะ-, สูน]`, et le glyphe de zone privée `U+F70F` est bien
  présent dans le corps de l'entrée, échappé par le script comme annoncé.
- **โมง ๑** énonce bien `ตั้งแต่ ๗ นาฬิกา ถึง ๑๑ นาฬิกา เรียกว่า โมงเช้า ถึง
๕ โมงเช้า`.
- **ชั่วโมง** : `๖๐ นาที`, `ชั่วนาฬิกา ก็เรียก`, แม่คำ `ชั่ว ๑`, sans crochets.
- **นาที** : `๑ ใน ๖๐ ของชั่วโมง`, `เทียบ ส. นาฑี`, aucun ลูกคำ, sans crochets.
- **ราคา** : deux sens, aucune lecture entre crochets, un seul ลูกคำ ราคาตลาด,
  emploi figuré `มักใช้ในความปฏิเสธ`.

### 1.3 Wiktionary — 8 pages retéléchargées, 8 citations fidèles

- `en:นาฬิกา` : `{{lb|th|formal|used as a unit of time}} [[hour]]
(''abbreviation'': {{l|th|น.}})` puis
  `{{th-x|สิบสาม นาฬิกา สิบห้า นาที|thirteen hours [and] fifteen minutes
(= 13:15 hours)}}`. Le patron de la page 10 est réellement porté par cette
  source, indépendamment du RID. `{{th-pron|นา-ลิ-กา}}` corrobore la valeur `l`
  du ฬ.
- `en:ขีด` : `# {{lb|th|colloquial}} [[one-tenth]] [[kilogram]]; 100 [[gram]].`
  Citation exacte au caractère près.
- `en:ครึ่ง` : `{{th-pron|คฺรึ่ง}}`, sens « half; exactly 50% » puis
  « approximately a half », exemples เจ็ดโมงครึ่ง (7:30 a.m.) et ครึ่งวงกลม,
  เดือนครึ่ง non glosé dans les dérivés.
- `en:ชั้น` : exemples `แต่ โรงแรม เรา ไม่ มี ชั้น สิบสาม นะ คะ` et
  `อะพาร์ตเมนต์ ชั้น บน ๆ`.
- `en:ราคา` : `{{th-pron|รา-คา}}`, deux exemples dont l'un contient bien ใบ et
  แพง, et les cinq dérivés cités.
- `en:กิโล` : quatre sens, tous étiquetés `colloquial`, synonymes กิโลเมตร,
  กิโลกรัม et โล.
- `en:น.` : six initialismes dont `{{initialism of|th|นาฬิกา}} (o'clock)`.
- `th:น.` : le même sens porte bien `(ใช้ต่อท้ายเลขเวลา)`.
- Annexe `Appendix:Thai script`, ligne de ฬ : rang 42, `ฬ จุฬา`,
  `IPA Initial l`, `IPA Final n`, `Royal Thai l` / `n`, classe `low`.

### 1.4 Artefacts externes — empreintes reproduites

- PDF ORST « การบอกเวลาในภาษาไทย ตอนที่ ๑ » retéléchargé en HTTP :
  **83 794 octets**, SHA-256
  `e104e0732923b904a11d093533b3eac3e0677d5258bb91d614f63d383c5fa313`.
  **Identique au dossier, octet pour octet.**
- Le refus HTTPS de `legacy.orst.go.th` est reproduit : `curl` sort en erreur 7,
  connexion refusée. La contrainte de reproductibilité signalée à l'arbitrage 2
  est réelle.
- Le PDF a été **redécodé par un décodeur écrit pour cet audit** (inflate des
  flux, reconstruction des trois tables `ToUnicode`, application aux opérateurs
  `Tj`/`TJ`). Les quatre lignes du tableau de divergence sont exactes :
  แบบที่ ๒ donne หก/เจ็ด/แปด/…/สิบเอ็ด โมงเช้า pour ๐๖ à ๑๑, แบบที่ ๓ donne
  โมงเช้า/สอง/สาม/สี่/ห้า โมงเช้า pour ๐๗ à ๑๑. La variation sur ๑๖.๐๐ น.
  (บ่ายสี่โมง contre สี่โมงเย็น) est présente. L'auteure นิตยา กาญจนะวรรณ, le
  résumé de ชลธิชา สุดมุข et la date ๒๖ สิงหาคม ๒๕๕๗ sont exacts.
- **Contrôle négatif de la page `?page_id=10331` reproduit** : la page se
  télécharge (623 820 octets, titre `การอ่านตัวเลขบอกเวลา`) et son corps ne
  contient **aucune** occurrence de นาฬิกา, ni ๑๓.๓๐, ni ๐๘.๒๑. Le refus de
  citer un extrait de moteur de recherche était fondé, et il est exemplaire.

### 1.5 Décomptes internes — 48 chiffres recomputés, 48 exacts

- `repo-thai-scan.mjs 10 10` : **5 fichiers, 34 entrées, 31 graphies**. Exact.
- `repo-thai-scan.mjs 1 9` : **45 fichiers, 429 entrées, 317 graphies**, dont
  103 ไม้เอก, 76 ไม้โท, 1 ไม้ตรี, 2 ไม้จัตวา, 160 marquées. Exact, ligne à ligne.
- Les **21 comptages `--grep`** cités par la Méta et le dossier sont tous
  exacts : บาท 7, สิบ 13, สอง 10, สาม 5, ห้า 4, ร้อย 1, เท่าไร 4, กี่ 4, อัน 6,
  ใบ 2, บ้าน 5, ขอ 13, ครับ 36, ค่ะ 19, ไหม 9, ที่ไหน 6, ตลาด 5, ห้อง 6, et les
  trois contrôles négatifs โรงแรม 0, เปิด 0, ปิด 0.
- Les **huit items du jour rendent bien 0 graphie** sur les unités 1 à 9.
- Le relevé `--grep ฬ` sur les unités 1 à 9, que le dossier laissait « à faire
  au contrôle d'intégration », a été fait ici : **0**. La lettre est bien neuve.
- `unicode-thai.mjs` : **285 chaînes thaïes distinctes, 8 champs `thai`, NFC
  toutes conformes, aucun caractère de zone à usage privé.** Les huit séquences
  du tableau Unicode sont recalculées identiques.
- `item-fields-check.mjs` : 0 champ `codepoints` en faute, 0 écart de réemploi.
- Recherche de tirets cadratins et demi-cadratins : **0**. ADR-0022 respectée.

### 1.6 Réemplois relus dans le fichier d'origine — 18 sur 20 fidèles

Le contrôle exigé en priorité 1 a été fait à la main, `item-fields-check.mjs`
ne pouvant rien comparer faute d'item titré `uXX-lYz` (limite déjà signalée par
l'arbitrage 6 du fichier, et confirmée par cet audit).

Concordent exactement avec leur leçon d'origine : บาท `bàat`, ห้าสิบบาท
`hâa·sìp bàat`, อันนี้เท่าไรครับ `an·níi thâo·rai khráp` (3C) ; หนึ่ง `nùeng`,
สอง `sǎwwng`, สาม `sǎam`, ห้า `hâa`, เก้า `kâao`, สิบ `sìp`, ยี่สิบ `yîi·sìp`,
ร้อย `ráwwi` (3B) ; ตัว `toua` (3D) ; ขอ `khǎww` (2C) ; ครับ `khráp`
(1E et 5A, mêmes champs dans les deux) ; ตั๋ว `tǒua` (8A) ; สวัสดีครับ
`sà·wàt·dii khráp`, สวัสดีค่ะ `sà·wàt·dii khâ` (2B) ; ขอบคุณครับ
`khàwwp·khoun khráp` (2C).

La citation du champ `registre` de ขอ (« la politesse vient de หน่อย et de la
particule finale ») est **exacte au caractère près**. Le patron de `u04-l4c`
(ขอ + nom + nombre + classificateur + หน่อย + ครับ, instancié par
ขอข้าวผัดสองจานหน่อยครับ) est exact, et la déclaration des deux libertés prises
par ขอสองขีดครับ est honnête.

Deux réemplois divergent : voir les findings **REEMPLOI-SUNY** et **NOYAU-UA**.

### 1.7 Renvois internes au parcours

Vérifiés et exacts : `srs-u04-l4a-06` est bien « montant contre haut à
l'écoute » ; `srs-u07-l7a-03` est bien « le contraste ton moyen contre ton bas
à l'écoute » ; 8A page 11 est bien « le tableau entier, onze cases » ; 8A page
13 est bien « laquelle des deux commande le ton ? » ; 4A page 6 porte bien
l'avertissement sur เ, แ, โ, ใ et ไ.

### 1.8 Collision d'unité

La collision sur ราคา est **réelle et correctement décrite** : `lecon-10c.md`
item 2 titre « ราคา (NOUVEAU) » et porte `thai` ราคา, `codepoints`
U+0E23 U+0E32 U+0E04 U+0E32, `ipa` /raː˧.kʰaː˧/, `ton` raa moyen ; khaa moyen,
`longueur` raa longue ; khaa longue, `fr` le prix, `transcription` raa·khaa,
`registre` neutre. **Les sept champs sont identiques.** Les listes de champs
`thai` de 10A, 10B et 10E citées par la Méta sont exactes.

### 1.9 Tons et transcriptions des huit items

Recalculés indépendamment : ราคา moyen/moyen, กิโล bas/moyen, ขีด bas,
ครึ่ง descendant, ชั้น haut, นาฬิกา moyen/haut/moyen, ชั่วโมง descendant/moyen,
นาที moyen/moyen. Les huit IPA sont cohérentes avec ces tons. Les huit
transcriptions respectent l'amendement v1.1 (marque sur la première lettre du
noyau, doublement de la dernière lettre du graphème pour la longueur), y
compris les cas durs `khrûeng`, `chôua·moong` et `naa·lí·kaa`.

Les planchers des exercices 1, 2 et 3 ont été recalculés et sont justes :
2/10 pour une réponse constante à l'exercice 1 ; 8/10 pour l'heuristique
« dernier jeton », qui échoue bien sur les seuls tirages 7 et 8 ; 1/720 puis
1/24 (4,2 %) pour l'exercice 2 ; espérance 1,29/6 et 0,51 % pour l'exercice 3.
**Aucun des cinq exercices n'est réussissable par une réponse constante.**

---

## 2. Findings

### F1 — `FREQ-RARETE-NON-SOURCEE` — BLOQUANT

**Quoi.** La note culturelle affirme à l'écran deux faits de fréquence non
sourcés, dont un superlatif, et le dossier affirme au même moment qu'elle n'en
affirme aucun.

**Preuve.** Ligne 1204 : « นาฬิกา est un mot qui porte son histoire à l'œil nu,
et l'une de ses lettres est **la plus rare de l'alphabet** ». Ligne 1209 : « il
a gardé de cette origine une lettre qui **ne sert presque nulle part ailleurs** ».
Ligne 1255 : « **Ce qui n'est PAS affirmé.** La note ne dit rien de la fréquence
du ฬ dans le thaï écrit, faute d'un relevé de fréquence recevable sur ce
critère ». Les trois phrases sont dans la même section. Aucune source de
fréquence n'est citée, et le §4 de `docs/content-policy/sources-verification.md`
n'a pas été sollicité. Troisième occurrence du même défaut, page 5 ligne 205 :
« Sur un marché, **deux mots reviennent** pour le poids » — assertion d'usage
réel, non sourcée.

**Correction attendue.** Supprimer les trois assertions, ou les fonder sur
PyThaiNLP `tnc_freq` / FrequencyWords, seules ressources de fréquence autorisées.

---

### F2 — `CONSONNE-42-DERNIERE` — BLOQUANT

**Quoi.** Fait faux affiché à l'apprenant, et attribué à une source qui ne le
porte pas.

**Preuve.** Ligne 1204 : « Le ฬ … est la quarante-deuxième **et dernière**
consonne de l'ordre alphabétique. » C'est faux. L'annexe
`Appendix:Thai script`, relue le 2026-08-04, donne : 41 ห, **42 ฬ, 43 อ, 44 ฮ**.
ฬ n'est ni la dernière, ni l'avant-dernière. L'entrée « ฬ » du RID, réinterrogée
le même jour, dit exactement `พยัญชนะตัวที่ ๔๒` et **rien d'autre** : elle ne
contient aucun mot signifiant « dernière ». Le dossier propage l'erreur ligne
1257 : « elle dit seulement que le RID en donne trois exemples et que la lettre
est **la dernière** de l'ordre alphabétique ».

**Effet de bord.** Le dossier écrit aussi (ligne 1233) que « le rang 42 et le
nom de la lettre ne sont … portés que par le RID ». C'est faux dans l'autre
sens : l'annexe Wiktionary porte les deux. Le fait est donc double-sourcé, et
la réserve était inutile — mais elle est écrite, et telle qu'écrite elle
signifie qu'un fait mono-sourcé est affiché à l'écran, ce que la règle 3 du
projet interdit.

---

### F3 — `ETIQUETTE-PRIX-CONTREDITE` — BLOQUANT

**Quoi.** La page 3 enseigne à l'écran, en français, exactement le patron que le
dossier déclare non attesté quinze cents lignes plus bas.

**Preuve.** Page 3, ligne 186 : « ราคา veut dire le prix. **C'est le mot que
vous verrez en tête d'une étiquette**, et la monnaie, บาท, se lit derrière le
nombre ». Item 1, ligne 412 : « **Ce que ces sources n'établissent PAS, et qui
est donc retiré de l'écran** : aucune des trois ne donne le patron
« ราคา + nombre + บาท » que porterait une étiquette de prix. Les exemples
relevés emploient ราคา comme nom dans une phrase, jamais devant un montant
chiffré. » Incertitude 3, ligne 1690 : « Le patron d'une étiquette de prix n'est
pas attesté. »

J'ai revérifié : ni le RID (deux sens nominaux, aucun exemple chiffré), ni
`en:ราคา` (les deux exemples sont `หมวก ใบ นี้ ราคา ไม่ แพง` et
`การไฟฟ้า ขึ้น ราคา ค่า ไฟ อีก แล้ว`, aucun montant), ni la glose VOLUBILIS ne
montrent ราคา en tête d'étiquette. **Le patron n'a pas été retiré de l'écran :
il y est, en français, à la place de la ligne thaïe.**

---

### F4 — `ORST-TROIS-SYSTEMES` — BLOQUANT

**Quoi.** Le refus le plus lourd de la leçon, l'abandon du système oral des
heures, repose sur une lecture fausse du document ORST. Le document ne se
contredit pas : il décrit trois conventions, et le dit en toutes lettres dans
sa première phrase.

**Preuve.** Texte du PDF, redécodé par cet audit :
`การบอกเวลาในภาษาไทยมี ๓ แบบ ดังนี้` — « il y a **trois manières** de dire
l'heure en thaï, les voici ». Le แบบที่ ๒ est la division en deux fois douze
heures ; le แบบที่ ๓ est le découpage traditionnel par période
`เช้า สาย บ่าย เย็น ค่ำ ดึก`. Ce sont deux conventions **coexistantes et
déclarées comme telles**, pas deux affirmations rivales sur un même objet.
L'entrée « โมง ๑ » du RID range d'ailleurs sa propre série sous
`วิธีนับเวลาตามประเพณี`, « manière traditionnelle », c'est-à-dire le แบบที่ ๓ :
elle ne « soutient une lecture contre l'autre », elle décrit la troisième.

Le dossier écrit pourtant, ligne 1414, « **le désaccord est INTERNE à
l'institution normative elle-même** », et la page 12 dit à l'apprenant, ligne
299 : « **nos sources ne s'accordent pas entre elles** sur la lecture des heures
du matin ». C'est une assertion d'écran fausse sur une source publique.

**Portée.** La règle 3 est invoquée à tort pour retirer un pan entier du
curriculum, et la contrainte bloquante de tirage de `srs-u10-l10d-02` est
adossée à ce raisonnement. Le refus peut rester, mais il doit être motivé par
le volume ou la progression, pas par un désaccord de sources qui n'existe pas.

---

### F5 — `SPECIMENS-HEURE-NON-DECLARES` — BLOQUANT

**Quoi.** Deux spécimens de nombres sont affichés à l'apprenant et ne figurent
dans **aucune** des deux listes du dossier, alors que la Méta promet que
« chacun est déclaré comme construit à l'endroit où il apparaît » et que le
tableau d'audit certifie « 42 blocs construits listés et déclarés ».

**Preuve.** Extraction mécanique de tous les blocs `[๐-๙]{1,2}.[๐-๙]{2} น.` du
fichier, puis confrontation aux deux listes :

- **๑๓.๑๕ น.** — affiché page 10 (corps et ligne « Spécimen ») et à l'exercice 3
  tirage 2. `construits = false`, `attestés = false`.
- **๒๐.๔๕ น.** — affiché à l'exercice 3 tirage 3. `construits = false`,
  `attestés = false`.

Ce sont exactement les deux formes que la liste des attestés ne peut pas
couvrir : la seule attestation Wiktionary porte sur la chaîne **orale**
สิบสาม นาฬิกา สิบห้า นาที, et le dossier le dit lui-même (« sa glose écrit
« 13:15 hours » en chiffres arabes et avec un deux-points : c'est une glose
anglaise, pas une assertion sur la typographie thaïe »).

C'est le point 4 que le dossier demandait au contre-audit d'attaquer : « un bloc
affiché et non listé serait un manquement à la contrainte d'unité ». Il y en a
deux. Par ailleurs, hors des exercices 1 et 3, **aucun spécimen n'est étiqueté à
l'endroit où il apparaît** : ni les quinze pages d'enseignement, ni les 48
formes écrites de l'exercice 4. La formulation de la Méta est plus forte que ce
que le fichier fait ; celle du dossier (« la page 15 le dit en clair, et les
exercices 1 et 3 l'étiquettent ») est la bonne, et les deux se contredisent.

---

### F6 — `CHIFFRES-ATTRIBUES-A-3A` — BLOQUANT

**Quoi.** Le prérequis le plus lourd de la leçon, de son propre aveu, est
attribué à la mauvaise leçon, six fois, et une citation entre guillemets est
mise dans la bouche d'un fichier qui ne la contient pas.

**Preuve.** `repo-thai-scan.mjs 1 9 --grep ๕` rend **une** graphie,
`๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙`, dans `/content/authoring/unite-03/lecon-3b.md`.
`grep '^### Item' unite-03/lecon-3a.md` rend huit items, de ตา à **ถุง** :
**l'item 8 de 3A est ถุง, pas les chiffres.** 3A ne les traite que comme
« Bloc de reconnaissance » à sa page 7 ; c'est `u03-l3b` **item 8** qui les
publie comme item, avec son champ `thai` et sa transcription
`sǒuun · nùeng · sǎwwng · …`.

Or 10D écrit :

- Méta : « **leçon 3A : les dix chiffres thaïs ๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙**, publiés
  comme **item 8 de cette leçon** » ;
- Méta : « **3A** avertit déjà que ๑ se lit หนึ่ง seul mais เอ็ด en position
  d'unité, et que ๒ se lit สอง sauf dans ๒๐ » — ce sont les items 5 et 3 de 3B ;
- Vérification Unicode : « séquence publiée par **`u03-l3a` item 8** » ;
- Dossier, transcriptions relues : « les dix chiffres et ศูนย์ `sǒuun`
  (`u03-l3a` et `u03-l3b`) » ;
- Statut des spécimens : « un nombre publié par 3B **ou 3A** ».

**Citation déplacée.** Incertitude 10 : « **`u03-l3a` écrit noir sur blanc** que
ses dix chiffres sont « travaillés en reconnaissance seule, jamais en
écriture » ». `grep 'reconnaissance seule, jamais en écriture'` sur les deux
fichiers rend **une seule ligne, `lecon-3b.md:692`**. La phrase n'existe pas
dans 3A. Une citation entre guillemets attribuée à un fichier qui ne la contient
pas est le défaut que `item-fields-check.mjs` a été écrit pour empêcher.

**Nuance à conserver.** La carte `srs-u03-l3a-06` existe bien et porte bien « les
dix chiffres thaïs en reconnaissance » ; le renvoi SRS est donc correct. C'est
l'attribution de la **publication** qui est fausse, et il existe deux cartes
concurrentes, `srs-u03-l3a-06` et `srs-u03-l3b-06`, ce que 10D ne signale pas.

---

### F7 — `REEMPLOI-SUNY` — BLOQUANT

**Quoi.** ศูนย์ est présenté trois fois comme un item publié réemployé. Ce n'est
pas un item, et la leçon d'origine dit le contraire de ce qu'on lui fait dire.

**Preuve.** `repo-thai-scan.mjs 1 9 --grep ศูนย์` rend **0 graphie**. Aucun champ
`thai` du dépôt ne vaut ศูนย์ : le mot n'apparaît chez 3B que dans le `note_fr`
et les `sources` de l'item 8, dont le champ `thai` est la suite des dix chiffres.
`lecon-3b.md:863` est explicite : « **ศูนย์ est révisé dans la carte 06 comme
lecture de ๐ et non comme vocabulaire actif** ».

10D écrit pourtant :

- Note culturelle, sources : « **ศูนย์ est un item publié de `u03-l3b`, dont les
  champs ne sont pas modifiés** » — il n'a pas de champs ;
- SRS, hors périmètre : « … et ศูนย์ **gardent celles de `u03-l3b`** » — il n'a
  pas de carte propre ;
- Note culturelle, écran : « Le zéro, ศูนย์, **que vous écrivez depuis 3B** » —
  3B écrit à la ligne 692 « travaillés en **reconnaissance seule, jamais en
  écriture** », et l'objet du champ n'est de toute façon pas le mot mais le
  chiffre ๐.

La page 4 et la note culturelle affichent donc une graphie jamais publiée en la
présentant comme acquise.

---

### F8 — `NOYAU-UA-GRAPHIE` — BLOQUANT

**Quoi.** Le champ `longueur` de l'item 7 décrit la graphie de deux items
publiés autrement que ne le fait la leçon qui les publie, et réintroduit une
erreur que `u09-l9a` avait explicitement corrigée à son propre contre-audit.

**Preuve.** 10D, item 7 : « Le noyau de la première syllabe est la diphtongue
/ua/, **écrite ◌ัว, exactement comme dans** ตัว (`u03-l3d`), **ขวด**
(`u04-l4c`) **et ปวด** (`u09-l9a`). » Séquences recalculées :

| graphie | séquence NFC                                     | contient U+0E31 |
| ------- | ------------------------------------------------ | --------------- |
| ตัว     | U+0E15 U+0E31 U+0E27                             | oui             |
| ชั่วโมง | U+0E0A U+0E31 U+0E48 U+0E27 U+0E42 U+0E21 U+0E07 | oui             |
| **ขวด** | U+0E02 U+0E27 U+0E14                             | **non**         |
| **ปวด** | U+0E1B U+0E27 U+0E14                             | **non**         |

Ni ขวด ni ปวด ne portent le ◌ั. `u09-l9a` item 2 le publie noir sur blanc :
« Le noyau est la diphtongue /ua/, **écrite ici sous sa forme RÉDUITE ◌ว◌** »,
formulation issue de son propre contre-audit du 2026-08-04. 10D efface cette
correction en décrivant les quatre graphies comme identiques.

---

### F9 — `BALAYAGE-FR-FAUX` — BLOQUANT

**Quoi.** Le « Balayage de conformité, **réellement exécuté** » énumère deux
endroits ; il y en a au moins huit, dont deux affirmations non sourcées sur le
français. Le tableau d'audit certifie « **aucune assertion sur le français** ».

**Preuve.** Balayage mécanique de `[Ff]ran[çc]ai` restreint aux sections d'écran
(`Enseignement`, `Items`, `Exercices`, `Dialogue`, `Note culturelle`) :
**12 occurrences**, lignes 212, 458, 521, 672, 851, 988, 991, 992, 1046, 1118,
1211, 1215. Le dossier n'en reconnaît que deux (« la page 5 » et « la note
culturelle »).

Deux d'entre elles sont des assertions sur la langue française, non sourcées et
non reformulées en observation vérifiable, ce que la section 1 bis de
`docs/content-policy/sources-verification.md` encadre :

- ligne 992, exercice 3 : « puisque **le français laisse les minutes nues** » ;
- ligne 1046, exercice 4 : « où **le thaï inverse ce que le français laisse dans
  le même ordre** » — énoncé qui, de surcroît, ne décrit rien de vérifiable :
  « douze » et « vingt » n'exposent aucun ordre de morphèmes que le thaï
  pourrait inverser.

Le fichier cite lui-même le finding `BALAYAGE-INVENTE` de `u09-l9a` comme le
défaut à ne pas répéter. Il le répète.

---

### F10 — `PLANCHER-EX4-LONGUEUR` — BLOQUANT

**Quoi.** Le plancher de l'exercice 4 annonce un contrôle anti-heuristique qui
ne tient pas. Recomputé, il est faux sur trois tirages sur douze.

**Preuve.** Le fichier écrit : « Aucune stratégie de longueur ne fonctionne non
plus : **dans chaque tirage, au moins deux des quatre options ont le même nombre
de caractères que la bonne réponse.** » Comptage en points de code :

| tirage | bonne réponse (longueur) | distracteurs (longueurs) | même longueur |
| ------ | ------------------------ | ------------------------ | ------------- |
| 7      | ครึ่งชั่วโมง (12)        | 9, 9, 7                  | **0**         |
| 8      | ๒ ชั่วโมง (9)            | 8, 6, 6                  | **0**         |
| 10     | ครึ่งกิโล (9)            | 6, 12, 5                 | **0**         |

Sur les tirages 7 et 8, la bonne réponse est de surcroît **l'option la plus
longue des quatre**. Le comptage par grappes de graphèmes donne le même verdict.
La phrase est fausse telle qu'écrite, quelle que soit la convention de comptage,
et elle figure dans la section que le dossier désigne lui-même comme la
priorité 1 du contre-audit.

**À décharge.** L'heuristique « choisir la plus longue » ne rend que 2 réponses
sur 12 : l'exercice reste sain, et la réponse constante de position plafonne
bien à 3 sur 12. C'est l'affirmation de contrôle qui est fausse, pas l'exercice.

---

### F11 — `ORST-2-IRREPRODUCTIBLE` — BLOQUANT

**Quoi.** Le second document ORST est cité sans référence reproductible, alors
qu'il est la **seule** autorité de deux blocs que le dossier classe parmi les
« Blocs ATTESTÉS » et qu'un exercice présente à l'apprenant comme attesté.

**Preuve.** Le premier document ORST est cité de façon exemplaire : URL exacte,
taille, SHA-256, protocole, méthode d'extraction. Le second, « การใช้เครื่องหมาย
ในการบอกเวลา », n'est cité que par son titre et « même serveur, même contrainte
HTTP » : **aucune URL, aucun `page_id`, aucune taille, aucune empreinte.**
L'amendement v1.2 de `CONVENTIONS.md` exige, pour un « site avec entrée
adressable », « l'URL exacte de l'entrée », et pose comme critère qu'« un tiers
puisse refaire la consultation à l'identique ». Je n'y suis pas parvenu : la
recherche du titre sur `legacy.orst.go.th` ne rend pas la page, et le PDF que
j'ai décodé donne pour exemples ๐๐.๐๐ น., ๑๑.๐๕ น. et ๒๔.๐๐ น., **jamais
๑๓.๓๐ น. ni ๐๘.๒๑ น.**

Conséquence directe : les deux blocs ๑๓.๓๐ น. et ๐๘.๒๑ น., affichés page 9 et à
l'exercice 1 tirage 4 (« **Forme attestée telle quelle** par la règle d'écriture
de l'Office of the Royal Society »), sont **invérifiables en l'état**. Soit la
référence est complétée, soit les deux blocs redescendent dans la liste des
blocs construits.

---

### F12 — `LUKKHAM-CRUENG-SUR-LU` — non bloquant

**Quoi.** Un argument de corroboration fait dire à une source plus qu'elle ne
dit. Le fait enseigné reste vrai par ailleurs, d'où le statut non bloquant.

**Preuve.** Item 4 : « Mots dérivés ครึ่ง ๆ กลาง ๆ, ครึ่งชาติ, ครึ่งซีก et
ครึ่งต่อครึ่ง … : **les quatre placent ครึ่ง DEVANT ce qu'il divise**, ce qui
corrobore l'ordre enseigné. » Les quatre ลูกคำ sont exacts, je les ai
réinterrogés. Mais ครึ่ง ๆ กลาง ๆ est une réduplication idiomatique et
ครึ่งต่อครึ่ง est « moitié contre moitié » : dans ni l'un ni l'autre ครึ่ง ne
précède « ce qu'il divise ». Deux sur quatre, pas quatre sur quatre.

L'ordre enseigné reste solidement établi par ailleurs : ครึ่งชั่วโมง attesté
comme bloc (VOLUBILIS 37746), la glose « préf. » de VOLUBILIS, et l'exemple
ครึ่งวงกลม de `en:ครึ่ง` que j'ai relu. Il n'y a rien à retirer de l'écran, il y
a une phrase de dossier à corriger.

---

## 3. Points non retenus comme findings, mais à consigner

- **VOLUBILIS non vérifiable ici.** `VOLUBILIS_Database.xlsx` n'est pas dans le
  dépôt et n'a pas pu être téléchargé dans le cadre de cet audit. Les quinze
  numéros de ligne cités, l'empreinte `b9ab7418…a20fc0c` et les deux décomptes
  (114 579 lignes, 586 541 chaînes) **n'ont donc pas été recomputés**. C'est une
  lacune de cet audit, pas un finding contre la leçon ; elle est écrite pour que
  personne ne croie ces chiffres relus.
- **« 71 glyphes appariés » pour le PDF ORST.** Mon décodeur en apparie **65**
  distincts sur trois tables `ToUnicode`. L'écart tient probablement à la
  convention de comptage (entrées cumulées contre codes distincts). Le texte
  décodé, lui, concorde ; je ne retiens donc pas de finding, mais le chiffre
  n'est pas recomputable tel qu'énoncé.
- **« DEUX mots du jour commencent à l'écrit par une voyelle ».** Ni กิโล ni
  ชั่วโมง ne commencent par une voyelle : le โ est en seconde syllabe, ce que la
  phrase dit elle-même trois mots plus loin. Formulation à corriger, fait juste.
- **« une échelle qui va de 1 à 24 ».** Exact pour la série orale du RID, mais le
  document ORST que la leçon cite écrit ๐๐.๐๐ น. La règle d'écriture et la série
  de lecture ne couvrent pas le même intervalle ; aucune conséquence à l'écran,
  aucun spécimen à ๐๐ n'étant affiché.
- **« ขีด descend et reste en bas » (page 15).** Description du ton BAS par le
  verbe « descend », alors que « descendant » est le nom du ton de ครึ่ง dans la
  même leçon. Risque de confusion terminologique, à reformuler.
- **Lecture des minutes ๐๐.** L'exercice 2 paire 2 (๐๕.๐๐ น. ↔ `hâa naa·lí·kaa`)
  et l'exercice 4 tirage 5 supposent que les minutes à ๐๐ ne se disent pas.
  La page 10 enseigne le patron complet `[heure] นาฬิกา [minutes] นาที` et ne dit
  nulle part ce qui arrive à ๐๐. Le corrigé n'est pas faux, mais il repose sur
  une règle non enseignée.
- **`item-fields-check.mjs` n'a rien pu comparer**, aucun item n'étant titré avec
  une référence `uXX-lYz`. L'arbitrage 6 du fichier, qui demande d'étendre le
  contrôle aux transcriptions citées hors des champs `thai`, est **confirmé par
  cet audit** : c'est exactement par là que F6, F7 et F8 sont passés.

---

## 4. Condition de levée

Aucun passage `draft → review` avant :

1. correction ou suppression des assertions de F1, F2, F3, F4 et F9, toutes
   visibles par l'apprenant ;
2. rectification des attributions de F6, F7 et F8, qui touchent le contrat de
   réemploi ;
3. déclaration des deux spécimens de F5 et alignement des deux formulations
   contradictoires (Méta contre dossier) ;
4. recalcul et réécriture du plancher de l'exercice 4 (F10) ;
5. référence reproductible pour le second document ORST, ou reclassement des
   blocs ๑๓.๓๐ น. et ๐๘.๒๑ น. en blocs construits (F11) ;
6. correction de la phrase de corroboration de F12 ;
7. re-passage de `repo-thai-scan.mjs`, `rid-lookup.mjs` et `unicode-thai.mjs`
   après correction, les chiffres du dossier devant rester exacts ;
8. relevé VOLUBILIS refait par un auditeur disposant de l'exemplaire
   authentifié, cet audit n'ayant pas pu le faire.

`Revue native : en attente` reste affiché.
