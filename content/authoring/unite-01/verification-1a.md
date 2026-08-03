# Vérification adversariale indépendante : leçon u01-l1a

- Auditeur : Claude Fable 5 (claude-fable-5), consignes adversariales.
- Date des consultations : 2026-08-03. Toutes les URLs ci-dessous sont MES
  consultations, refaites indépendamment ; je n'ai pris aucune URL du
  rédacteur comme preuve.
- Méthode : re-vérification par item (orthographe et codepoints comparés
  caractère par caractère par script Node sur le fichier réel, sens, ton,
  longueur, IPA, conformité de transcription, registre et naturalité,
  cohérence des exercices, règles rédactionnelles). Les étiquettes de ton en
  langage naturel produites par le résumeur d'outillage sont peu fiables
  (il a rendu ˨˩ « falling » et ˩˩˦ « mid ») ; tous mes verdicts de ton
  s'appuient sur les lettres tonales IPA et les romanisations Paiboon,
  concordantes entre les deux sites pour chaque item.
- Tentatives hors Wikimedia : RID 2554, https://dictionary.orst.go.th/ et
  https://dictionary.orst.go.th/index.php?search=%E0%B8%82%E0%B8%B2
  (2026-08-03) : la recherche est un formulaire POST, aucune entrée
  consultable par GET ; message « ไม่พบคำศัพท์ที่ต้องการค้นหา ». Volubilis :
  distribution en fichiers téléchargeables, pas d'interface par entrée
  consultable par l'outillage. Ces échecs sont consignés ; ils fondent le
  finding bloquant B4.

## Contrôles globaux du fichier

- Codepoints : les 14 chaînes `thai` du fichier correspondent exactement aux
  séquences `codepoints` déclarées (script Node, comparaison caractère par
  caractère). Toutes les chaînes thaïes du fichier, spécimens compris, sont
  NFC. VERDICT : CONFIRMÉ.
- Tiret cadratin ou demi-cadratin : zéro occurrence dans le fichier.
  VERDICT : CONFIRMÉ.
- Ton rédactionnel : direct, chaleureux, adulte, sans culpabilisation ni
  promesse non mesurée. VERDICT : CONFIRMÉ.

## Série des cinq tons (items 1 à 5)

### Item 1 : คา

- Orthographe et codepoints U+0E04 U+0E32 : CONFIRMÉ (fichier + entrées).
- Sens « rester coincé, être pris ; herbe à toits de chaume (Imperata
  cylindrica) » : CONFIRMÉ. Sens archaïque « carcan » existe, exclusion
  documentée par l'auteur (incertitude 7).
- IPA /kʰaː˧/, ton moyen, voyelle longue, Paiboon kaa : CONFIRMÉ.
- Transcription « khaa », registre neutre : CONFIRMÉ.
- Mes sources : https://en.wiktionary.org/wiki/คา et
  https://th.wiktionary.org/wiki/คา (2026-08-03).

### Item 2 : ข่า

- Orthographe et codepoints U+0E02 U+0E48 U+0E32 : CONFIRMÉ.
- Sens « galanga (Alpinia galanga), rhizome de cuisine » : CONFIRMÉ. Sens
  secondaires (ethnonyme, claie de séchage) exclus, documenté.
- IPA /kʰaː˨˩/, ton bas, longue, Paiboon kàa : CONFIRMÉ.
- Transcription « khàa », registre neutre : CONFIRMÉ.
- Mes sources : https://en.wiktionary.org/wiki/ข่า et
  https://th.wiktionary.org/wiki/ข่า (2026-08-03).
- Remarque R2 : la note_fr affirme « stable, sans chute » alors que ˨˩ note
  une légère descente en registre bas ; simplification pédagogique à assumer
  explicitement au dossier (le discriminant enseigné, petite chute basse
  contre grande chute depuis le haut, reste correct).

### Item 3 : ค่า

- Orthographe et codepoints U+0E04 U+0E48 U+0E32 : CONFIRMÉ.
- Sens « valeur, prix » : CONFIRMÉ (prix, coût, valeur, valeur
  mathématique). Particule familière exclue, documenté.
- IPA /kʰaː˥˩/, ton descendant, longue, Paiboon kâa : CONFIRMÉ.
- Transcription « khâa », registre neutre : CONFIRMÉ.
- Mes sources : https://en.wiktionary.org/wiki/ค่า et
  https://th.wiktionary.org/wiki/ค่า (2026-08-03).

### Item 4 : ค้า

- Orthographe et codepoints U+0E04 U+0E49 U+0E32 : CONFIRMÉ.
- Sens « faire commerce, vendre » (« to trade; to sell ») : CONFIRMÉ.
- IPA /kʰaː˦˥/, ton haut, longue, Paiboon káa : CONFIRMÉ.
- Transcription « kháa », registre neutre : CONFIRMÉ.
- Mes sources : https://en.wiktionary.org/wiki/ค้า et
  https://th.wiktionary.org/wiki/ค้า (2026-08-03).
- Remarque R6 : le verbe usuel pour « vendre » est ขาย ; ค้า relève du
  commerce (souvent en composés : การค้า, ค้าขาย). L'item met « faire
  commerce » en premier, correct ; la page 2 dit « vendre » seul, acceptable
  mais « commercer » serait plus précis.

### Item 5 : ขา

- Orthographe et codepoints U+0E02 U+0E32 : CONFIRMÉ.
- Sens « jambe » (et pied de meuble par extension) : CONFIRMÉ. Sens
  secondaires (particule féminine, personne, tour) exclus, documenté.
- IPA /kʰaː˩˩˦/, ton montant, longue, Paiboon kǎa : CONFIRMÉ.
- Transcription « khǎa », registre neutre : CONFIRMÉ.
- Mes sources : https://en.wiktionary.org/wiki/ขา et
  https://th.wiktionary.org/wiki/ขา (2026-08-03).

## Les 9 consonnes moyennes (items 6 à 14)

Pour chaque lettre j'ai re-vérifié : codepoint, classe moyenne (อักษรกลาง),
valeur sonore, nom traditionnel, IPA de la lettre seule, et le mot-image
(orthographe, sens, IPA, ton, longueur). Le fait « les consonnes moyennes
sont exactement ces 9 lettres » est cohérent avec la classe confirmée
individuellement pour chacune des 9 sur les deux sites.

### Item 6 : ก — CONFIRMÉ

U+0E01, classe moyenne, /k/ non aspiré, lettre seule /kɔː˧/, nom
/kɔː˧.kaj˨˩/ ; ไก่ « poule, volaille » /kaj˨˩/ ton bas, voyelle brève.
Ton et longueur du nom (moyen longue + bas courte) : CONFIRMÉ.
Mes sources : https://en.wiktionary.org/wiki/ก,
https://th.wiktionary.org/wiki/ก, https://en.wiktionary.org/wiki/ไก่.

### Item 7 : จ — CONFIRMÉ

U+0E08, classe moyenne, /t͡ɕ/, lettre seule /t͡ɕɔː˧/, nom /t͡ɕɔː˧.t͡ɕaːn˧/ ;
จาน « assiette » /t͡ɕaːn˧/ ton moyen, longue. Ton et longueur du nom
(moyen longue + moyen longue) : CONFIRMÉ. La note_fr (« entre ty et tch
léger, sans souffle, pas le j français ») est exacte pour /t͡ɕ/.
Mes sources : https://en.wiktionary.org/wiki/จ,
https://th.wiktionary.org/wiki/จ, https://en.wiktionary.org/wiki/จาน.

### Item 8 : ฎ — CONFIRMÉ

U+0E0E, classe moyenne, /d/, lettre rare, homophone de ด, nom complet
/dɔː˧.t͡ɕʰa˦˥.daː˧/ ; ชฎา « coiffe traditionnelle » /t͡ɕʰa˦˥.daː˧/ (haut
courte + moyen longue) ; usage en finale d'emprunts pali/sanskrit (กฎ,
มงกุฎ). Tons et longueurs de « daww chá·daa » : CONFIRMÉ.
Mes sources : https://en.wiktionary.org/wiki/ฎ,
https://th.wiktionary.org/wiki/ฎ, https://en.wiktionary.org/wiki/ชฎา.

### Item 9 : ฏ — CONFIRMÉ

U+0E0F, classe moyenne, /t/, lettre rare, homophone de ต, usage en finale
d'emprunts (ปรากฏ, ภูฏาน, ce qui confirme aussi la note_fr sur le Bhoutan) ;
ปฏัก « aiguillon » (forme de ประตัก) /pa˨˩.tak̚˨˩/ (bas courte + bas
courte). J'ai de plus obtenu l'IPA du nom entier /tɔː˧.pa˨˩.tak̚˨˩/ sur
l'entrée lettre en.wiktionary, ce qui lève l'incertitude n° 8 de l'auteur.
Mes sources : https://en.wiktionary.org/wiki/ฏ,
https://th.wiktionary.org/wiki/ฏ, https://en.wiktionary.org/wiki/ปฏัก.

### Item 10 : ด — CONFIRMÉ (transcription : voir finding B2)

U+0E14, classe moyenne, /d/, lettre seule /dɔː˧/, nom /dɔː˧.dek̚˨˩/ ;
เด็ก « enfant » /dek̚˨˩/ ton bas, voyelle /e/ brève. Tons et longueurs de
« daww dèk » : CONFIRMÉ. La note_fr (« é fermé de été, brève ») est exacte.
La graphie « dèk » n'est conforme qu'à l'amendement v1.1 (sous v1, è note
/ɛ/) : couvert par le finding bloquant B2.
Mes sources : https://en.wiktionary.org/wiki/ด,
https://th.wiktionary.org/wiki/ด, https://en.wiktionary.org/wiki/เด็ก.

### Item 11 : ต — CONFIRMÉ

U+0E15, classe moyenne, /t/, lettre seule /tɔː˧/, nom /tɔː˧.taw˨˩/ ;
เต่า « tortue » /taw˨˩/ ton bas, diphtongue brève. Tons et longueurs de
« taww tào » : CONFIRMÉ.
Mes sources : https://en.wiktionary.org/wiki/ต,
https://th.wiktionary.org/wiki/ต, https://en.wiktionary.org/wiki/เต่า.

### Item 12 : บ — CONFIRMÉ (avec remarque R1)

U+0E1A, classe moyenne, /b/ initial, lettre seule /bɔː˧/, nom traditionnel
บ ใบไม้ ; ใบไม้ « feuille d'arbre » /baj˧.maːj˦˥/ (moyen courte + haut
longue), Paiboon bai-máai. Tons et longueurs de « baww bai·máai » :
CONFIRMÉ, y compris la longueur de ไม้ re-vérifiée sur son entrée propre
(/maːj˦˥/).
Mes sources : https://en.wiktionary.org/wiki/บ,
https://th.wiktionary.org/wiki/บ, https://en.wiktionary.org/wiki/ใบไม้,
https://en.wiktionary.org/wiki/ไม้.
Remarque R1 : l'IPA du nom complet sur la page lettre en.wiktionary donne
/bɔː˧.baj˧.maj˦˥/ (maj bref), en contradiction interne avec l'entrée dédiée
ใบไม้ (/maːj˦˥/) et l'entrée ไม้ (/maːj˦˥/). Les entrées dédiées font foi ;
divergence à consigner au dossier de preuve.

### Item 13 : ป — CONFIRMÉ

U+0E1B, classe moyenne, /p/ non aspiré, lettre seule /pɔː˧/, nom
/pɔː˧.plaː˧/ ; ปลา « poisson » /plaː˧/ ton moyen, longue. Tons et longueurs
de « paww plaa » : CONFIRMÉ. Le repère visuel « บ avec une tige qui monte »
est plausible mais non sourcé (voir R7).
Mes sources : https://en.wiktionary.org/wiki/ป,
https://th.wiktionary.org/wiki/ป, https://en.wiktionary.org/wiki/ปลา.

### Item 14 : อ — CONFIRMÉ

U+0E2D, classe moyenne, /ʔɔː˧/ seule, initiale muette (coup de glotte) et
support vocalique (อือ, เออ), nom /ʔɔː˧.ʔaːŋ˨˩/ ; อ่าง « bassine, cuvette,
bac » /ʔaːŋ˨˩/ ton bas, longue. Tons et longueurs de « aww àang » (moyen
longue + bas longue) : CONFIRMÉ. La note_fr (« porte la voyelle sans bruit
propre, petit départ net du souffle ») décrit correctement /ʔ/.
Mes sources : https://en.wiktionary.org/wiki/อ,
https://th.wiktionary.org/wiki/อ, https://en.wiktionary.org/wiki/อ่าง.

## Enseignement (pages 1 à 6)

- Page 1 (mélodie lexicale vs intonation) : CONFIRMÉ, description standard
  d'une langue tonale.
- Page 2 (série khaa, ordre des sens coincé/galanga/valeur/vendre/jambe) :
  CONFIRMÉ, cohérent avec les items 1 à 5.
- Page 3 (contours) : CONFIRMÉ dans l'ensemble (˧ plat moyen, ˥˩ chute,
  ˦˥ perché tendu vers le haut, ˩˩˦ départ bas puis montée) ; réserve R2
  sur le bas « n'en bouge plus » face à ˨˩.
- Page 4 (les accents notent le ton, jamais autre chose ; aw = o ouvert de
  « sort ») : « aw = /ɔ/ » CONFIRMÉ. La phrase « jamais autre chose » n'est
  vraie que sous v1.1 : sous v1, é/è notent des qualités vocaliques →
  couvert par B2. « Le petit chapeau rond pour le montant » : CONTREDIT,
  voir B1 (le glyphe employé est le caron ǎ U+01CE, pointu ; le chapeau
  rond est la brève ă U+0103).
- Page 5 (imitation sans notation) : conforme au périmètre MVP voix.
- Page 6 (9 consonnes moyennes, mots-images) : CONFIRMÉ.

## Exercices

- Exercice 1 (listening) : les 5 clés audio → ton sont exactes (คา moyen,
  ข่า bas, ค่า descendant, ค้า haut, ขา montant) ; les distracteurs sont
  réellement faux ; feedbacks cohérents avec les IPA. CONFIRMÉ. Remarque
  R8 : le feedback « le haut reste perché du début à la fin » omet la
  tension montante finale de ˦˥ pourtant décrite page 3 ; harmoniser.
- Exercice 2 (association) : les 5 paires audio → courbe sont exactes.
  CONFIRMÉ. Remarque R4 sur l'usage du point médian dans les libellés.
- Exercice 3 : les 8 clés sont exactes, y compris les pièges : tirage 2,
  ฎ distracteur légitime (son nom commence aussi par « daww » mais le
  mot-image chá·daa diffère de dèk) ; tirages 7 et 8, homophonies ฎ=ด et
  ฏ=ต confirmées par les deux sites. CONFIRMÉ. Remarque R3 : la mécanique
  est étiquetée `reading` alors que les tirages 1 à 6 sont de l'écoute et
  choix (`listening` canonique) ; reclasser ou scinder avant compilation.

## SRS

Plages d'items exactes (1 à 5 tons, 6 à 14 lettres, 8 à 13 pour les paires
sosies ฎ ฏ ด ต บ ป) ; critères mesurables et alignés sur l'objectif ; aucune
production exigée en 1A. CONFIRMÉ.

## Note culturelle

- Fait « chaque consonne porte un nom acrophonique ; ces noms distinguent
  les homophones (ฎ/ด) » : CONFIRMÉ (entrées lettres des deux sites ;
  recoupement https://en.wikipedia.org/wiki/Thai_script, 2026-08-03 :
  « To aid learning, each consonant is traditionally associated with an
  acrophonic Thai word... »).
- Sous-fait « récitation que tous les écoliers thaïlandais apprennent » :
  NON VÉRIFIABLE. Aucune des sources citées par la leçon ne le couvre, et
  mon recoupement Wikipedia confirme la fonction pédagogique des noms mais
  pas une pratique scolaire universelle. Tenté : entrées lettres des deux
  Wiktionary, article Thai script de Wikipedia. → Finding B3.

## Findings BLOQUANTS

- B1 (CONTREDIT) : page 4 décrit le signe du ton montant comme « le petit
  chapeau rond », mais le glyphe réellement employé partout (leçon et
  conventions) est ǎ U+01CE LATIN SMALL LETTER A WITH CARON, un accent
  pointu en forme de v. Le « chapeau rond » est la brève ă U+0103, un autre
  diacritique. Correction proposée : « le petit v ouvert vers le haut »
  (ou décision explicite de passer à la brève, avec amendement des
  conventions et des items). Vérifié par script sur le fichier : U+01CE
  présent, U+0103 absent.
- B2 (CONTREDIT / conventions) : le fichier relève nominalement de la
  convention v1 (la migration v1.1 est prévue « à la consolidation »), or
  « dèk » (è = /ɛ/ en v1), « kài », « tào », « bai·máai » et la phrase de la
  page 4 « les accents y notent le ton, jamais autre chose » ne sont
  corrects que sous v1.1. De plus, la graphie de la diphtongue LONGUE /aːj/
  de « máai » n'est définie ni en v1 ni en v1.1 (le doublement « de la
  dernière lettre » donnerait « aii », la leçon écrit « aai »). Correction
  proposée : déclarer explicitement la leçon en v1.1 et ajouter à v1.1 la
  règle des diphtongues longues (« /aːj/ s'écrit aai, /aːw/ s'écrit aao »),
  puis re-passer les transcriptions.
- B3 (NON VÉRIFIABLE) : note culturelle, sous-fait « récitation que tous
  les écoliers thaïlandais apprennent » sans source qui le couvre (voir
  ci-dessus). Correction proposée : reformuler (« utilisée pour
  l'apprentissage de l'alphabet ») ou sourcer la pratique scolaire.
- B4 (NON VÉRIFIABLE / politique de sources) : chaque fait de la leçon
  repose exclusivement sur en.wiktionary + th.wiktionary, deux communautés
  Wikimedia ; la politique interdit Wiktionary en source unique et fait
  primer le RID. Mes propres tentatives RID du 2026-08-03 (deux URLs,
  ci-dessus) échouent sur un formulaire POST ; Volubilis n'est pas
  consultable par entrée via l'outillage. L'auteur l'avait signalé
  (incertitude 2) ; je confirme que la double source réellement
  indépendante n'existe pas encore pour les 14 items. Correction proposée :
  recoupement manuel RID ou import Volubilis local pour les 14 orthographes
  et sens avant tout passage `review`.

## Remarques non bloquantes

- R1 : incohérence interne d'en.wiktionary sur la longueur de ไม้ dans le
  nom de บ (page lettre : maj bref ; entrées ใบไม้ et ไม้ : maːj long) ;
  les entrées dédiées font foi ; à consigner au dossier de preuve.
- R2 : ton bas décrit « stable, sans chute » alors que ˨˩ note une légère
  descente ; simplification pédagogique à assumer explicitement.
- R3 : exercice 3 étiqueté `reading` alors que les tirages 1 à 6 relèvent
  de la mécanique `listening` (écoute et choix) ; reclasser ou scinder.
- R4 : le point médian · sert de séparateur de liste dans le spécimen de la
  page 3 et dans les cartes de l'exercice 2, alors que la convention le
  réserve à la séparation syllabique ; choisir un autre séparateur visuel.
- R5 : le résumeur d'outillage a rendu des étiquettes de ton fausses et un
  nom tronqué (« บ ไม้ ») pendant mes consultations ; tout audit futur doit
  s'appuyer sur les lettres tonales IPA citées, jamais sur les étiquettes
  en langage naturel (rejoint l'incertitude 6 de l'auteur).
- R6 : « vendre » seul en page 2 pour ค้า ; « commercer » serait plus
  exact, ขาย étant le verbe usuel de « vendre ».
- R7 : repères visuels (« dent » de ต, « tige » de ป, « socle brisé » de
  ฎ/ฏ) non sourcés, déjà signalés par l'auteur (incertitude 5) ; à valider
  sur les assets définitifs.
- R8 : feedback « haut » de l'exercice 1 (« reste perché du début à la
  fin ») à harmoniser avec la page 3 et l'item 4 (« se tend vers le
  haut »), conformément à ˦˥.

## Bilan chiffré

- Faits linguistiques confirmés : 107 (items 1 à 5 : 25 ; items 6 à 14 :
  63 ; note culturelle : 1 ; clés d'exercices : 18), plus les contrôles
  globaux (codepoints NFC, zéro tiret cadratin, ton rédactionnel).
- Findings bloquants : 4 (B1 à B4).
- Remarques non bloquantes : 8 (R1 à R8).
- Conséquence : la leçon reste `draft` ; B1 à B4 doivent être résolus avant
  `draft → review`.
