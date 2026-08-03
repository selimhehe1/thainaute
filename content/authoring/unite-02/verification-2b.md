# Vérification adversariale : unité 2, leçon 2B

- Date : 3 août 2026
- Fichier audité : `content/authoring/unite-02/lecon-2b.md`
- Rôle : contre-auditeur adversarial, indépendant du rédacteur. Mandat :
  chercher des erreurs, pas confirmer le travail.
- Modèle auditeur : Claude Opus 5 (`claude-opus-5[1m]`), distinct du rôle de
  rédacteur assumé dans le dossier de production de la leçon.
- Méthode : re-vérification personnelle de chaque item, sans faire confiance
  aux citations du rédacteur. Chaque URL citée a été ouverte. Les codepoints
  ont été recalculés depuis le fichier, pas relus.
- Résultat : **76 faits confirmés personnellement, 12 findings dont 7
  bloquants.** La leçon reste `draft` et n'est pas promouvable en `review`.

---

## 1. Ce que j'ai confirmé moi-même

### 1.1 Unicode et typographie (9 faits)

Les 8 champs `thai` ont été extraits du fichier par script, puis leurs
codepoints recalculés et comparés aux champs `codepoints` déclarés.

| Item | Graphie       | Codepoints recalculés                                                                      | Déclaré | NFC |
| ---- | ------------- | ------------------------------------------------------------------------------------------ | ------- | --- |
| 1    | ไหว้          | U+0E44 U+0E2B U+0E27 U+0E49                                                                | exact   | ok  |
| 2    | สวัสดีครับ    | U+0E2A U+0E27 U+0E31 U+0E2A U+0E14 U+0E35 U+0E04 U+0E23 U+0E31 U+0E1A                      | exact   | ok  |
| 3    | สวัสดีค่ะ     | U+0E2A U+0E27 U+0E31 U+0E2A U+0E14 U+0E35 U+0E04 U+0E48 U+0E30                             | exact   | ok  |
| 4    | สบายดีไหมครับ | U+0E2A U+0E1A U+0E32 U+0E22 U+0E14 U+0E35 U+0E44 U+0E2B U+0E21 U+0E04 U+0E23 U+0E31 U+0E1A | exact   | ok  |
| 5    | สบายดีไหมคะ   | U+0E2A U+0E1A U+0E32 U+0E22 U+0E14 U+0E35 U+0E44 U+0E2B U+0E21 U+0E04 U+0E30               | exact   | ok  |
| 6    | สบายดีครับ    | U+0E2A U+0E1A U+0E32 U+0E22 U+0E14 U+0E35 U+0E04 U+0E23 U+0E31 U+0E1A                      | exact   | ok  |
| 7    | สบายดีค่ะ     | U+0E2A U+0E1A U+0E32 U+0E22 U+0E14 U+0E35 U+0E04 U+0E48 U+0E30                             | exact   | ok  |
| 8    | หวัดดี        | U+0E2B U+0E27 U+0E31 U+0E14 U+0E14 U+0E35                                                  | exact   | ok  |

Aucune séquence n'est modifiée par une normalisation NFC. Aucune graphie
fausse détectée. Neuvième fait : balayage du fichier pour U+2014 et U+2013,
**zéro occurrence**, la règle « jamais de tiret cadratin » (ADR-0022) est
respectée.

### 1.2 en.wiktionary, pages ouvertes une par une (27 faits)

Toutes les URL citées par le rédacteur existent et disent bien ce qu'on leur
fait dire, avec les nuances signalées plus bas.

- **ไหว้** : IPA /waːj˥˩/ confirmé ; Paiboon `wâai` ; nom « wai, an expression
  of respect or reverence by pressing the palms together, accompanied by a bow
  if rendered to a person of higher status or to a sacred figure or object » ;
  verbe « to perform a wai », « to pay respect ». Conforme à la citation.
- **สวัสดี** : IPA /sa˨˩.wat̚˨˩.diː˧/ confirmé ; interjection « used to express
  a greeting or farewell » confirmée, donc l'arrivée comme le départ.
- **ครับ** : IPA /kʰrap̚˦˥/ confirmé ; « (formal, humble, men's speech)
  employed by males to express affirmation or assent, or to politely end any
  expression ». Confirmé aussi : **aucune** distinction question / affirmation.
- **ค่ะ** : IPA /kʰaʔ˥˩/ confirmé ; « used at the end of an indicative
  expression, request, or wish » ; « formerly used by noblemen, now often
  employed by women ».
- **คะ** : IPA /kʰaʔ˦˥/ confirmé ; « used at the end of an expression of doubt,
  interrogation, or suggestion » ; même note sur les femmes.
- **สบายดีไหม** : la page existe ; IPA /sa˨˩.baːj˧.diː˧.maj˩˩˦/ confirmé ;
  « how are you? » ; **la note d'usage homme ครับ / femme คะ existe bien**.
  C'est le point le plus important de la leçon, il est correctement sourcé.
- **ไหม** : particule interrogative confirmée, « or not? », variante familière
  มั้ย confirmée.
- **สบายดี** : IPA /sa˨˩.baːj˧.diː˧/ ; « to be well (in health), happy,
  contented » ; composé de สบาย + ดี confirmé ; **aucun sens de salutation,
  aucune étiquette régionale** (utile pour le finding B2).
- **ไม่สบาย** : IPA /maj˥˩.sa˨˩.baːj˧/ ; « unwell, sick, ill » ; **aucun sens
  « bof » ou « moyen »**. La précaution de la page 5 est justifiée.
- **หวัดดี** : la page existe ; IPA /wat̚˨˩.diː˧/ ; « alternative form of
  สวัสดี » ; étiquettes **childish, colloquial** confirmées.
- **อรุณสวัสดิ์** : existe, « good morning », IPA /ʔa˨˩.run˧.sa˨˩.wat̚˨˩/.
  Vérifié pour tester la page 2 (voir finding N3).

### 1.3 th.wiktionary (12 faits)

- **ไหว้** : page existante. « ทำความเคารพโดยยกมือขึ้นประนม » présent au mot
  près. Double IPA /waːj˥˩/ et /waj˥˩/ confirmée. Inclinaison de la tête
  confirmée, formulée « ต้องก้มศีรษะลงแต่พองาม ».
- **สวัสดี** : page existante ; découpage « สะ-หฺวัด-ดี » confirmé ; emploi
  « เมื่อพบหรือจากกัน » (à la rencontre comme à la séparation) confirmé ;
  **หวัดดี figure bien dans les คำพ้องความ**, aux côtés de ดี, ฮัลโหล, โหล.
- **คะ** : page existante ; « คำลงท้ายที่ผู้หญิงใช้ในการถาม หรือบอกให้ทราบ
  อย่างสุภาพ » ; **l'exemple มีอะไรให้ฉันช่วยไหมคะ existe réellement**, il
  montre bien คะ juste après ไหม.
- **สบาย** : page existante ; les deux IPA /sa˨˩.baːj˧/ et /sa˧.baːj˧/ sont
  bien présentes ; découpage สะ-บาย ; sens 6 « ไม่เจ็บไม่ไข้ ».
- **สบายดี** : **404 confirmé.** Le rédacteur avait raison.
- **หวัดดี** : **404 confirmé.** Le rédacteur avait raison.

Les deux constats de page inexistante sont exacts et honnêtement consignés.
C'est un bon point de méthode, à souligner autant que les findings.

### 1.4 Lao et note culturelle (1 fait)

- **ສະບາຍດີ** (en.wiktionary, section lao) : verbe « to be well, to be fine »
  et interjection « hello » confirmés, avec l'exemple ສະບາຍດີບໍ່.

### 1.5 Tons, longueurs, IPA, transcription (16 faits)

Chaque syllabe des 8 items a été recontrôlée contre l'IPA des sources et
contre les règles de classe consonantique.

- `sà` /sa˨˩/ bas court, `wàt` /wat̚˨˩/ bas court (ว sous ห implicite, classe
  haute, syllabe morte, voyelle brève), `dii` /diː˧/ moyen long, `khráp`
  /kʰrap̚˦˥/ haut court, `baai` /baːj˧/ moyen long (บ classe moyenne, finale
  sonante), `mǎi` /maj˩˩˦/ montant court, `khá` /kʰaʔ˦˥/ haut court (ค classe
  basse, syllabe morte brève), `khâ` /kʰaʔ˥˩/ descendant court (mai ek sur
  classe basse). **Aucun ton faux, aucune longueur fausse.**
- Conformité `thainaute-fr-v1.1` vérifiée règle par règle sur les 8
  transcriptions : diacritique réservé au ton, porté par la PREMIÈRE lettre du
  noyau (`wâai`, `khàwwp`, `mǎi`) ; doublement de la DERNIÈRE lettre du
  graphème pour la longueur (`aa`, `ii`, `aww`) ; `ou` pour /u/, `aw` pour /ɔ/,
  `ai` pour /aj/ ; point médian `·` à l'intérieur des polysyllabes et espace
  entre mots. **Conforme.** `khàwwp·khoun` est de plus identique à la
  transcription de `lecon-1e.md`, donc cohérent entre unités.

### 1.6 Exercices (4 faits)

- **Exercice 1** : corrigé juste (คะ interrogatif, ค่ะ affirmatif). Voir
  cependant le finding N1 sur la validité de la mesure.
- **Exercice 2** : `สบายดี ไหม คะ` est l'ordre correct et ค่ะ est bien le
  distracteur à retirer. Corrigé juste.
- **Exercice 3** : les trois appariements sont justes. J'ai vérifié la
  formulation du feedback : les blocs 1 et 3 finissent bien par khâ, seul le
  bloc 2 finit par khá et seul lui contient ไหม. Exact.
- **Exercice 4** : corrigé juste. Contrôle caractère par caractère : สบายดี a
  bien บ en deuxième position, สวัสดี a bien ว, et สวัสดี a bien un ส de plus
  au milieu. บ est bien une des neuf consonnes moyennes de l'unité 1.

### 1.7 Sources et environnement (4 faits)

- **TNC** : `https://www.arts.chula.ac.th/ling/tnc/` renvoie bien **404**.
- **RID** : `dictionary.orst.go.th` charge bien, l'interface de recherche est
  présente et la recherche renvoie bien « ไม่พบคำศัพท์ที่ต้องการค้นหา ». Le
  constat du rédacteur est exact, y compris sur l'impossibilité d'outiller.
- **Volubilis SourceForge** : la page projet n'affiche **aucune licence**,
  ce qui confirme l'incertitude 10 du rédacteur. Dernière mise à jour affichée
  2026-07-01, cohérente avec une v26.2 de juillet 2026.
- **Volubilis licence** : CC BY-SA 4.0 corroborée hors SourceForge (blog de
  l'auteur, fichier `corpus_license.md` de PyThaiNLP).

### 1.8 Cohérence inter-fichiers (3 faits)

- Les prérequis annoncés (สวัสดี, ครับ, ค่ะ, ขอบคุณ, แล้วเจอกัน, neuf
  consonnes moyennes) correspondent bien au contenu de l'unité 1.
- Le dialogue n'emploie effectivement aucun mot hors unité 1 et leçon 2B.
- La divergence de transcription signalée en incertitude 7 est **réelle** :
  `lecon-1e.md` écrit `sawàtdii` (ligne 26, 37, 85), la leçon 2B écrit
  `sà·wàt·dii`. Le rédacteur l'a correctement détectée et déclarée.

---

## 2. Findings

### B1. BLOQUANT. Volubilis : 10 citations, aucune URL, aucun artefact reproductible

`CONVENTIONS.md` exige pour chaque source « URL exacte de l'entrée consultée
et date de consultation ». Les 10 citations Volubilis de la leçon portent une
date mais **aucune URL** ni aucun identifiant d'entrée. Aucun fichier
Volubilis n'existe dans le dépôt, aucun script d'interrogation, aucune table
d'extraction. L'unité 1 avait produit `unite-01/verification-volubilis.md`
avec la table des gloses extraites ; l'unité 2 n'a rien de tel.

Conséquence en cascade, et c'est le vrai problème : Volubilis est la **seule**
source non-Wikimedia de la leçon. Le dépôt lui-même déclare que en.wiktionary
et th.wiktionary ne comptent pas comme deux sources indépendantes
(`verification-volubilis.md`, « elle lève le finding double sourçage non
indépendant des vérifications 1A à 1E »). Tant que les citations Volubilis ne
sont pas reproductibles, **les 8 items reposent de facto sur une source
unique**, l'écosystème Wikimedia.

Correction attendue : joindre la table d'extraction Volubilis de l'unité 2 sur
le modèle de l'unité 1, avec la ligne brute par entrée citée.

### B2. BLOQUANT. Note culturelle : trois faits learner-facing sous-sourcés

Le bloc contient trois assertions, aucune correctement étayée.

1. « la base Volubilis marque l'emploi de สบายดี comme salutation d'un usage
   régional, isan » : **source unique**, et non vérifiable (voir B1). J'ai
   contrôlé en.wiktionary สบายดี : **aucune étiquette régionale et aucun sens
   de salutation**, donc pas de recoupement possible.
2. « En lao, ສະບາຍດີ est bien une interjection de salutation » : vrai, je l'ai
   confirmé, mais sur **en.wiktionary seul**. Source unique.
3. « isan, c'est à dire le thaï du nord-est, voisin du lao » : **aucune
   source**. La formulation est de plus contestable, l'isan est classé par les
   linguistes comme une variété du lao écrite en alphabet thaï, pas comme un
   dialecte du thaï dont le lao serait le voisin.

S'ajoute une quatrième assertion sans aucune source : « Beaucoup de guides
francophones affirment que sabaidi veut dire bonjour en thaï ». Le dossier
reconnaît lui-même que les seuls documents trouvés sur ce point sont « des
blogs et des sites de voyage, hors politique de sources ».

Correction attendue : retirer la note culturelle, ou la réduire au seul fait
recoupable et le sourcer deux fois.

### B3. BLOQUANT. Item 8 et page 6 : « หวัดดี s'emploie sans particule de politesse » est faux

Page 6 : « Elle est marquée familière par nos sources, sans particule de
politesse. » Item 8, `note_fr` : « Elle s'emploie sans particule de politesse,
**ce qui suffit à en faire** une forme réservée aux proches et aux messages
écrits. » L'affirmation n'est pas une observation périphérique, elle sert de
prémisse à la règle d'emploi enseignée.

Or **aucune des trois sources citées ne dit cela**. J'ai relu en.wiktionary
หวัดดี : étiquettes `childish, colloquial`, définition « alternative form of
สวัสดี », rien sur les particules. Pire, la note d'usage de en.wiktionary sur
สวัสดี, que le rédacteur cite par ailleurs, dit l'inverse : la forme peut être
abrégée en หวัดดี ou ดี, et peut être suivie de ครับ ou ค่ะ selon le registre
et le genre du locuteur. หวัดดีครับ et หวัดดีค่ะ sont des formes courantes.

Correction attendue : supprimer la prémisse et refonder la page 6 sur les
étiquettes réellement attestées.

### B4. BLOQUANT. Page 6 : « surtout dans les messages écrits entre amis » contredit l'incertitude 9 de la même leçon

L'unique appui de cette restriction est le domaine `CHAT` de Volubilis. Or
l'incertitude 9 du dossier de production pose explicitement la règle
inverse : « Volubilis classe une partie des blocs enseignés dans le domaine
TOURIST, qui est un domaine thématique de la base et non une étiquette de
registre. **Aucune conclusion d'usage n'en a été tirée.** »

La leçon tire donc d'un domaine Volubilis exactement la conclusion d'usage
qu'elle déclare ne pas tirer, et elle le fait sur une source unique non
vérifiable. en.wiktionary n'attache aucune restriction écrit/oral à หวัดดี.

### B5. BLOQUANT. Page 1 et dialogue : « devant la poitrine » est une source détournée

Page 1 : « les paumes se joignent devant la poitrine ». Réplique 1 du
dialogue : « elle joint les mains devant la poitrine ».

J'ai ouvert les deux entrées ไหว้. en.wiktionary dit « pressing the palms
together », **sans hauteur**. th.wiktionary dit « ยกมือขึ้นประนม », **sans
hauteur**. La poitrine ne vient que de la glose Volubilis d'un **autre mot**,
ประนม, citée dans l'item comme entrée « voisine ».

Deux problèmes : un fait attribué à des sources qui ne le disent pas, et une
auto-contradiction, puisque l'incertitude 6 déclare que « la hauteur des mains
selon le rang » n'a pas deux sources autorisées et n'est donc pas enseignée.
La hauteur des mains est précisément ce que « devant la poitrine » enseigne.

### B6. BLOQUANT. SRS et page 2 : la prémisse « l'unité 1 n'enseignait que le mot seul » est fausse

La leçon écrit : « `srs-u02-l2b-01` : bloc สวัสดี + particule. [...] Remplace
`srs-u01-l1e-01`, **qui portait sur le mot seul**. »

`lecon-1e.md`, ligne 290, dit littéralement :

> `srs-u01-l1e-01` : bloc สวัสดี + particule. Critère de maîtrise : produire
> la salutation avec la particule correspondant au locuteur indiqué, 3
> réussites sur des sessions distinctes.

Même portée, même critère, même nombre de réussites. `srs-u02-l2b-01` n'est
pas un remplacement, c'est un **doublon exact**, et la justification donnée
est factuellement fausse sur le contenu du dépôt.

La même prémisse fausse porte toute la page 2 : « Vous connaissez déjà สวัสดี.
À partir de maintenant, ne le stockez plus tout seul dans votre mémoire :
rangez-le avec votre particule, en un seul bloc. » L'unité 1 enseigne déjà le
bloc, `lecon-1e.md` ligne 37 affiche déjà « sawàtdii khráp / sawàtdii khâ ».
La page 2 vend comme une nouveauté ce qui a déjà été fait une leçon plus tôt,
et son SRS crée un doublon au lieu de renforcer l'item existant.

### B7. BLOQUANT. Page 4 : « ครับ ne bouge pas, question ou pas » n'a aucune attestation directe

L'affirmation est donnée à l'apprenant sans réserve. Le dossier la classe
lui-même en « INFÉRENCE À FAIBLE RISQUE » et « argument du silence ».

Vérification : en.wiktionary ครับ ne distingue effectivement pas les deux
emplois, mais l'absence de distinction n'est pas une attestation.
**th.wiktionary ครับ n'a pas été consulté**, il est absent de la liste des
pages th.wiktionary du dossier. Volubilis ne glose ครับ que « oui ; ouais
(fam.) » d'après la table de l'unité 1, ce qui ne couvre que l'affirmatif.

Le fait est donc à zéro attestation positive, dans une leçon dont c'est un des
quatre messages clés. Soit on l'appuie sur une grammaire de référence, soit on
le retire de l'écran.

### N1. Non bloquant mais grave. L'exercice 1 ne mesure pas ce qu'il annonce

Les deux stimuli sont สบายดีไหมคะ et สบายดีค่ะ. Ils ne diffèrent pas seulement
par la particule finale : le premier contient **ไหม**, une syllabe de plus, au
ton montant, absente du second. Un apprenant peut donc réussir 100 pour cent
en comptant les syllabes ou en repérant mǎi, **sans jamais discriminer khá de
khâ**.

Or l'objectif de la Méta est « il distingue à l'écoute la particule de
question คะ de la particule d'affirmation ค่ะ », et la note de production 1
affirme que l'exercice « mesure le contraste de ton ». Il ne le mesure pas.
Le piège listé « se fier au début du bloc, identique dans les deux cas » est
techniquement vrai pour สบายดี mais passe à côté du vrai indice gratuit, qui
est au milieu. Le feedback incorrect « seule la direction change » décrit mal
les stimuli réellement entendus.

Le corrigé restant juste, ce n'est pas bloquant au sens strict, mais
l'exercice est invalide pour son objectif. Correction simple : opposer
สบายดีไหมคะ à un bloc de même longueur, ou opposer directement คะ et ค่ะ
isolés. Le critère `srs-u02-l2b-04` a le même défaut potentiel.

### N2. Non bloquant. Le feedback de l'exercice 1 confond ton haut et ton montant

« La dernière syllabe monte (khá) : c'est une question. » khá est un ton
**haut** (`á`), pas un ton **montant** (`ǎ`), et `CONVENTIONS.md` distingue
formellement les deux diacritiques. La leçon vient d'enseigner mǎi montant
deux pages plus tôt, et la page 3 dit correctement « deux mouvements vers le
haut qui ne se ressemblent pas ». Le feedback défait cette distinction au
moment précis où l'apprenant en a besoin.

### N3. Non bloquant. Page 2 : affirmation d'usage non mesurée

« Ce bloc couvre toute la journée [...] Le thaï courant ne vous demande pas de
choisir entre un bonjour et un bonsoir. » C'est une affirmation d'usage, du
type que l'incertitude 1 s'interdit explicitement faute de mesure de
fréquence (TNC hors service, RID non interrogeable). Son seul appui est la
glose Volubilis « bonjour ; bonsoir », donc une source unique non vérifiable.

J'ai confirmé par ailleurs que อรุณสวัสดิ์ existe bien sur en.wiktionary avec
le sens « good morning », et l'incertitude 8 recense aussi ราตรีสวัสดิ์ et
สวัสดีตอนเช้า. Des formules horaires existent donc. La phrase reste
défendable au sens « vous n'êtes pas obligé de choisir », mais elle est
formulée comme un constat sur « le thaï courant » sans mesure d'usage.

### N4. Non bloquant. Dialogue : trois traductions françaises pour une même chaîne thaïe

- Réplique 3, สบายดีไหมคะ, traduit « Vous allez bien ? »
- Réplique 5, สบายดีไหมครับ, traduit « Et vous ? »
- Item 4, `fr`, สบายดีไหมครับ, « comment allez-vous ? »

« Et vous ? » ne contient aucun équivalent de สบายดี. Dans une leçon de
débutant où la ligne française est le seul point d'appui de compréhension,
donner trois rendus dont un non littéral pour la même chaîne brouille
l'ancrage. La didascalie « il renvoie la question » explique l'intention mais
ne répare pas la ligne de traduction.

### N5. Non bloquant. Dialogue : la réplique 2 met en scène un point que le dossier déclare non enseignable

Réplique 2 : « Paul (homme), **il rend le geste** ». L'incertitude 6 dit
explicitement que « la question de savoir s'il faut rendre un wai à un employé
de service » n'a pas deux sources autorisées, et que « la page 1 s'en tient
volontairement au strict minimum ». Le dialogue enseigne pourtant ce
comportement par l'exemple, ce qui est plus prescriptif qu'une phrase de cours.

---

## 3. Synthèse

- **Faits confirmés personnellement : 76.** Le socle linguistique dur de la
  leçon est solide : les 8 graphies, les 8 séquences de codepoints, tous les
  tons, toutes les longueurs, toutes les IPA, les 4 corrigés d'exercice et la
  conformité `thainaute-fr-v1.1` sont **corrects**. Aucune source n'est
  inventée : les 16 URL citées existent toutes et les deux 404 annoncés sont
  réels. C'est un travail de vérification honnête sur la couche lexicale.
- **7 findings bloquants.** Aucun ne porte sur une graphie, un ton ou une IPA.
  Tous portent sur la **couche d'usage et de sourçage** : un appareil de
  preuve Volubilis non reproductible qui fait retomber toute la leçon sur une
  source unique (B1), une note culturelle à trois faits sous-sourcés (B2),
  deux affirmations d'usage sur หวัดดี dont une fausse et une auto-contredite
  (B3, B4), un détail gestuel attribué à des sources qui ne le disent pas
  (B5), une prémisse pédagogique fausse sur le contenu de l'unité 1 qui crée
  un doublon SRS (B6), et une règle enseignée sans attestation (B7).
- **Lecture d'ensemble.** Le rédacteur a été rigoureux là où il a vérifié et
  imprudent là où il a raconté. Les incertitudes 1, 2, 5, 6 et 9 du dossier
  identifient correctement les zones fragiles, mais le corps de la leçon
  franchit à plusieurs reprises les limites que ces incertitudes posent. La
  discipline de sourçage est bonne dans la section `## Items` et faible dans
  les pages d'enseignement, le dialogue et la note culturelle.
- **Statut recommandé : reste `draft`.** Ne pas promouvoir en `review` avant
  résolution de B1 à B7. Le recoupement manuel RID reste par ailleurs une
  porte non franchie.
- Revue native : en attente.
