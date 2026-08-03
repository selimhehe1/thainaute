# Contre-audit adversarial de `unite-04/lecon-4e.md`

- Date : 3 août 2026
- Posture : adversariale. Objectif de la passe : trouver des erreurs, pas
  confirmer le dossier. Aucune source citée par la leçon n'a été crue sur
  parole ; chaque fait a été re-dérivé ou re-consulté.
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` (contrat d'item,
  transcription v1.1, amendement v1.2 sur la référence reproductible) et
  `docs/content-policy/sources-verification.md`.
- Limite d'environnement, déclarée d'entrée : le RID 2554 ne répond qu'en POST
  sur `func_lookup.php` et n'a PAS pu être interrogé depuis ce poste (la
  requête GET équivalente renvoie une page vide, `curl` est bloqué). Toutes les
  affirmations « RID » de la leçon sont donc contrôlées indirectement, par le
  miroir th.wiktionary et par recoupement interne au dépôt. Le fichier
  `VOLUBILIS Database.xlsx` n'est pas au dépôt : les numéros de ligne ne sont
  contrôlables que par cohérence entre leçons.

## 1. Ce que j'ai confirmé moi-même

**64 faits** re-vérifiés indépendamment. Décomposition :

### 1.1 Unicode et typographie, par script sur le fichier (4)

Extraction de toutes les suites U+0E00 à U+0E7F, test NFC, recalcul des champs
`codepoints` depuis les champs `thai`, comptage des signes typographiques.

| Assertion du dossier                                         | Recalcul                   | Verdict |
| ------------------------------------------------------------ | -------------------------- | ------- |
| fichier stable en NFC                                        | stable                     | exact   |
| 118 suites thaïes distinctes, 0 instable                     | 118 distinctes, 0 instable | exact   |
| 15 champs `codepoints` sur 15 identiques                     | 15/15, 0 écart             | exact   |
| 0 U+2014, 0 U+2013, 0 U+2015, 0 U+2212, 0 U+0027, 390 U+2019 | idem à l'unité près        | exact   |

L'item 14 porte bien deux graphies dans un seul champ (ค่ะ puis คะ) et la
concaténation attendue est celle qui est écrite. ADR-0022 est respecté : zéro
tiret cadratin, zéro demi-cadratin.

### 1.2 Ton et longueur, re-dérivés de l'orthographe (15)

Méthode : classe de la consonne initiale, type de syllabe (vive ou morte),
marque de ton, longueur du noyau. Aucune source consultée pour cette étape.

- เผ็ด : ผ haute + syllabe morte brève, sans marque, donc **ton bas**, brève.
  Concorde avec le champ `ton` et avec /pʰet̚˨˩/.
- ไม่ : ม basse + ไม้เอก, donc **descendant** ; diphtongue /aj/ brève.
- ไหม : ห นำ rend ม haute, syllabe vive sans marque, donc **montant**, brève.
- ข้าวผัด : ข haute + ไม้โท donc **descendant** sur un /aːw/ long ; ผ haute +
  morte brève donc **bas**.
- จาน : จ moyenne, vive, sans marque, donc **moyen** ; /aː/ long.
- ขอ : ข haute, vive longue, donc **montant**.
- หน่อย : ห นำ + ไม้เอก donc **bas** ; brièveté confirmée par le respelling
  หฺน็่อย de en.wiktionary, qui porte le ไม้ไต่คู้. Le champ « nàwi courte » est
  juste, contrairement à ce qu'une lecture rapide de `-อย` laisserait croire.
- สอง : ส haute, vive, donc **montant**, longue.
- เท่าไร : ท basse + ไม้เอก donc **descendant** ; ร basse vive donc **moyen**.
- แปดสิบ : ป moyenne + morte longue donc **bas** ; ส haute + morte brève donc
  **bas**. Longue puis brève, exactement comme la note de l'item 10 le dit.
- บาท : บ moyenne + morte longue donc **bas**, longue.
- สวัสดี : bas, bas, moyen.
- ครับ : ค basse + morte brève donc **haut**.
- ค่ะ descendant, คะ haut.
- ขอบคุณ : ข haute + morte longue donc **bas** ; ค basse vive donc **moyen**,
  avec un /u/ bref.

Aucun ton faux, aucune longueur fausse dans les quinze items. L'arbitrage de
l'item 9 est également juste : เท่าไหร่ porte ห นำ plus ไม้เอก sur la seconde
syllabe, donc un ton bas là où ไร porte un ton moyen. La leçon a raison
d'enseigner la graphie normative.

### 1.3 Transcription `thainaute-fr` v1.1, re-dérivée (15)

Règle appliquée : diacritique de ton sur la PREMIÈRE lettre du noyau, doublement
de la DERNIÈRE lettre du graphème pour la longueur. Les quinze transcriptions
sont conformes : `phèt`, `mâi`, `mǎi`, `khâao·phàt`, `jaan`, `khǎww`, `nàwi`,
`sǎwwng`, `thâo·rai`, `pàeet·sìp` (bien `aee` et non `aeet`), `bàat`,
`sà·wàt·dii`, `khráp`, `khâ` / `khá`, `khàwwp·khoun`. Aucun graphème hors v1.1.

Le seul point discutable est `aao` pour /aːw/, que la v1.1 ne prévoit pas
formellement (le doublement de la dernière lettre donnerait `aoo`, qui
entrerait en collision avec `oo`). La leçon ne l'invente pas : elle l'hérite de
3B et de 4C, et j'ai vérifié que le report est phonétiquement défendable, la
prononciation de เก้า étant respelée ก้าว par en.wiktionary, donc /kaːw˥˩/ avec
un a LONG comme dans ข้าว. Ce n'est pas un défaut de 4E, c'est une lacune de
l'amendement v1.1 à porter à la consolidation.

### 1.4 Sources réellement re-consultées (11)

Toutes le 3 août 2026, en wikitexte brut et en rendu.

1. **en.wiktionary « จาน »** : la section `Classifier` distincte existe bien,
   glosée « plates of food », en plus du bloc nominal `{{th-noun|ใบ|ลูก}}`. La
   leçon a raison de la traiter comme seconde autorité indépendante du RID pour
   le fait de la page 4.
2. **th.wiktionary « จาน »** : la section คำลักษณนาม existe, énonce
   เรียกสิ่งของที่บรรจุอยู่ในจาน et donne ข้าวจานหนึ่ง puis ข้าว 2 จาน. La
   « réserve d'indépendance » de l'item 5 est donc exacte au mot près, y compris
   la remarque « à la seule différence des chiffres ». Corollaire utile : ce
   miroir corrobore l'exemple ข้าว ๒ จาน que la page 4 attribue au RID.
3. **th.wiktionary « ไม่ »** : ligne de définition
   คำปฏิเสธความหมายของคำที่อยู่ถัดไป, ถ้าอยู่ท้ายคำ ต้องมีคำ หา อยู่หน้า,
   exemples ไม่กิน, ไม่ดี et หากินไม่. La description que l'item 2 fait de
   l'entrée RID, y compris « un emploi final résiduel avec หา en tête », est
   exacte.
4. **en.wiktionary « ไม่ »** : /maj˥˩/, Paiboon `mâi`, adverbe « no; not »,
   exemples ไม่ชอบ et ไม่อยู่บ้าน, sections conjonction, interjection et nom
   présentes. Conforme au dossier.
5. **en.wiktionary « เผ็ด »** : /pʰet̚˨˩/, Paiboon `pèt`, Institut royal
   `phet`, adjectif « spicy; hot; pungent; peppery », citation de
   ประชุมโคลงโลกนิติ où พริก et เผ็ด figurent ensemble. Les quatre affirmations
   de l'item 1 sont exactes.
6. **en.wiktionary « ไหม »** : étymologie 1 « From contraction of หรือ (“or”) +
   ไม่ (“not”) ». Citation exacte.
7. **en.wiktionary « ไหม »**, prononciation : /maj˩˩˦/, Paiboon `mǎi`, variante
   มั้ย donnée avec /maj˦˥/. Conforme à l'item 8.
8. **en.wiktionary « ข้าวผัด »** : /kʰaːw˥˩.pʰat̚˨˩/, Paiboon `kâao-pàt`,
   étymologie ข้าว + ผัด. Conforme.
9. **en.wiktionary « แปดสิบ »** : /pɛːt̚˨˩.sip̚˨˩/, Paiboon `bpɛ̀ɛt-sìp`,
   numéral 80, chiffre ๘๐. Conforme.
10. **en.wiktionary « เก้า »** : respelling ก้าว, donc /kaːw˥˩/. Valide le
    renvoi `aao` de l'item 4 sur le plan phonétique.
11. **en.wiktionary « หน่อย »** : respelling หฺน็่อย, /nɔj˨˩/, voyelle brève.
    Valide « nàwi courte » de l'item 6.

### 1.5 FrequencyWords, recompté à la ligne (4)

Les 25 premières lignes de `content/2018/th/th_50k.txt` ont été relues
verbatim : ไม่ est bien au **rang 3 avec 52 948 occurrences**, ครับ au **rang
10**, ขอบคุณ au **rang 15**, ค่ะ au **rang 21**. Les quatre chiffres du dossier
sont exacts au jeton près.

### 1.6 Corrigés d'exercices, re-résolus (10)

Les dix tirages ont été re-résolus sans regarder la clé : exercice 1 tirages 1
à 5, exercice 2, exercice 3 tirages 1 à 3, exercice 4. **Aucun corrigé faux.**
Tous les distracteurs sont réellement faux : « dix riz sautés » et « deux
poissons » ne sont pas dans la réplique 2 ; « dix-huit bahts » inverse bien
l'ordre de แปดสิบ ; « deux riz sautés, piquants » ignore bien le ไม่ initial de
l'exercice 4. Les feedbacks incorrects disent vrai, y compris
« Une syllabe longue qui monte, c'est สอง ; une syllabe brève et basse, c'est
สิบ », que j'ai re-dérivée. La politique de saisie de l'exercice 3 est cohérente
avec elle-même : `phet mai` est refusé au tirage 1 et accepté au tirage 3, ce
qui est correct puisque l'audio diffère.

### 1.7 Cohérences internes (1)

Le prix tient : 80 bahts pour deux assiettes, soit 40 l'assiette, et la leçon
ne prétend pas que ce soit un prix de marché.

### 1.8 La règle de ton de 4A (3)

Le fichier `unite-04/lecon-4a.md` existe désormais. Sa règle, énoncée page 6,
a été re-dérivée intégralement :

> syllabe vivante, c'est-à-dire terminée par une voyelle longue ou par
> ง, น, ม, ย, ว, et sans aucune marque de ton : consonne MOYENNE donne ton
> MOYEN, consonne HAUTE donne ton MONTANT.

**Cette règle est juste, et elle est correctement bornée.** Trois contrôles :

1. Elle est vraie sur tous les spécimens de la page 7 : ตา, ปลา, อัน, กิน en
   moyen ; ผม, ฉัน, สอง, สาม, ขา, ขาว en montant. Aucun contre-exemple.
2. Elle est **sous-générale, jamais sur-générale**, ce qui est le sens sûr de
   l'erreur. Elle ne couvre pas les vivantes en สระเกิน (ไป, เอา, ทำ), donc elle
   ne dit rien de faux à leur sujet ; la page 8 exclut explicitement les
   syllabes marquées, la classe basse et les syllabes mortes.
3. La liste des neuf hautes ข ฉ ถ ผ ฝ ศ ษ ส ห est exacte, et la remarque
   « le dictionnaire en compte onze, les deux absentes sont ฃ et ฐ » est exacte
   elle aussi.

Vérification de non-contamination sur 4E : la règle prédit correctement les
tons de จาน (moyen), สอง et ขอ (montant), et 4E ne réénonce aucune règle de
ton. **Aucune contamination détectée.** En revanche 4E ne cite jamais 4A dans
ses Prérequis, voir le finding N6.

## 2. Findings

### Bloquants

#### B1. VOLUBILIS : numéros de ligne contradictoires avec 4C et 3B

L'amendement v1.2 n'exige pas d'URL mais **la reproductibilité** : pour un
fichier, « nom, version, origine de téléchargement, feuille et numéro de
ligne ». Or, pour le même fichier, la même version v26.2, la même feuille
`Volubilis` et le même jour, les numéros divergent entre leçons :

| graphie | 4E    | ailleurs       | écart |
| ------- | ----- | -------------- | ----- |
| จาน     | 18351 | 19011 (4C)     | 660   |
| ข้าวผัด | 31810 | 33137 (4C)     | 1327  |
| ข้าว    | 31421 | 32719 (4C, 4B) | 1298  |
| สอง     | 93932 | 97075 (3B)     | 3143  |
| แปดสิบ  | 65547 | 67982 (3B)     | 2435  |
| เช็คบิล | 8108  | 8439 (4C)      | 331   |
| คิดเงิน | 34218 | 35622 (4C)     | 1404  |

Aggravant : le dossier annonce un « contrôle de concordance » et le fait porter
sur quatre lignes seulement, ไข่ 29401, ค่ะ 28945, หน่อย 62548 et เท่าไร 100805,
qui concordent effectivement avec 3E, puis en conclut que « ce dossier et celui
de 3E parlent bien du même export ». Le contrôle a été fait sur l'échantillon
qui passe. Sept graphies citées ailleurs dans la même leçon ne passent pas.

Pourquoi c'est bloquant et pas cosmétique : le dossier fait de VOLUBILIS
l'unique attestation du ton et de la longueur **hors écosystème Wikimedia**
pour les cinq items porteurs (เผ็ด, ไม่, ไม่เผ็ด, ข้าวผัด, จาน). Si la référence
n'est pas rejouable, ces faits retombent de facto sur une seule famille de
sources, ce que la politique interdit. À refaire : rejouer l'extraction, fixer
un export unique et de préférence citer aussi la valeur de la colonne `THA`
avec le numéro de ligne, pour que l'identification ne dépende plus du seul
compteur.

#### B2. Note culturelle : un fait de pratique affirmé sans source

Texte affiché : « La variété la plus présente dans une cuisine du quotidien est
le พริกขี้หนู ». Les trois sources citées pour ce bloc (VOLUBILIS 73836,
en.wiktionary « พริกขี้หนู », RID « พริก ๑ ») attestent une chose et une seule :
un petit piment très fort, rattaché au genre. **Aucune n'atteste une fréquence
d'emploi en cuisine.** La même note, six lignes plus bas, écrit : « Ce qui n'est
PAS affirmé : ... ni de la place du piment dans l'alimentation quotidienne ».
La leçon affirme donc à l'écran exactement ce qu'elle déclare ne pas affirmer.
Correction : supprimer « la plus présente dans une cuisine du quotidien » et
s'en tenir à « une petite variété très forte », qui est double-sourcée.

#### B3. Page 5 : « aucune ne franchit encore notre porte de vérification » est faux

Texte affiché : « Le thaï a bien des expressions dédiées pour l'addition ;
aucune ne franchit encore notre porte de vérification, et une leçon ultérieure
les introduira quand ce sera le cas. » Or `unite-04/lecon-4c.md`, page 6 et
item 8, enseigne **คิดเงิน** (khít·ngoen) comme item nouveau, avec deux
autorités : VOLUBILIS ligne 35622 et le bloc de synonymes de en.wiktionary
« เช็กบิล ». La leçon ultérieure annoncée est en réalité une leçon ANTÉRIEURE de
la même unité.

Le motif de rejet de 4E est lui-même erroné : « คิดเงิน. VOLUBILIS ligne 34218.
Absente du RID, et HTTP 404 sur les deux éditions de Wiktionary. Une seule
autorité : rejetée. » Le contrôle n'a cherché qu'une page dédiée et a manqué
l'attestation par liste de synonymes que 4C a trouvée le même jour. Deux
leçons de la même unité tirent donc des conclusions opposées du même corpus,
et c'est 4E qui a le contrôle le moins complet. À trancher à la consolidation,
mais la phrase de la page 5 ne peut pas rester en l'état.

#### B4. L'origine de ไหม attribuée au RID n'est corroborée par aucun miroir

Affiché page 3 : « le dictionnaire de l'Institut royal indique que ไหม vient de
หรือไม่ ». Sourcé item 2 par « RID 2554, vedette ไหม ๒ ... l'entrée énonce que
le mot sert à interroger et qu'il vient de หรือไม่, avec l'exemple กินไหม », et
présenté comme l'une des « deux autorités indépendantes » du fait.

Trois signaux contre :

1. Le RID n'est pas interrogeable depuis ce poste, donc le fait est
   invérifiable par un tiers dans l'état actuel du dossier.
2. Le seul miroir reproductible du RID, th.wiktionary « ไหม », que j'ai lu en
   wikitexte : l'origine หรือไม่ y figure en **étymologie 3** (แผลงมาจาก
   หรือไม่), pas dans la ligne de définition, et l'exemple donné n'est PAS
   กินไหม mais **ไปเที่ยวชลบุรีสนุกไหม**.
3. `unite-02/lecon-2b.md`, la leçon qui établit ไหม, attribue cette origine à
   th.wiktionary **seul**, jamais au RID, et son relevé th.wiktionary
   correspond mot pour mot à ce que je viens de lire.

Si le RID ne porte pas cette étymologie, alors la phrase de la page 3 est une
citation fausse ET le fait ne tient plus que sur l'écosystème Wikimedia,
c'est-à-dire une source unique au sens de la règle que la leçon elle-même
applique partout ailleurs (incertitude 7). À rejouer et à consigner
littéralement avant `review`. Même remarque, moins exposée, pour la
numérotation « ไหม ๒ » et pour l'exemple กินไหม.

### Non bloquants, mais à corriger avant `review`

#### N5. Les « deux items nouveaux » ne sont pas nouveaux

`unite-04/lecon-4d.md` enseigne déjà **ไม่** (item 1), **เผ็ด** (item 2) et
**ไม่เผ็ด** (item 3), avec sa page 2 « ไม่ se place devant » et sa page 7
« ไม่ contre ไหม ». Les pages 2 et 3 de 4E réenseignent donc du contenu déjà
posé, et les cartes `srs-u04-l4e-01`, `-02` et `-03` recouvrent
`srs-u04-l4d-01`, `-03`, `-05` et `-06`. La Nature annoncée
(« Elle n'introduit que deux items »), l'Objectif observable et le bilan SRS
reposent sur une prémisse fausse : **4E n'introduit aucun item nouveau**, c'est
une leçon de synthèse pure.

Corollaire : l'incertitude 1 affirme que « les fichiers `unite-04/lecon-4a.md`
à `unite-04/lecon-4d.md` N'EXISTAIENT PAS au dépôt : le répertoire
`content/authoring/unite-04/` a été créé par cette leçon ». Les cinq fichiers
existent aujourd'hui, et `lecon-4c.md` est antérieur à `lecon-4e.md`. Le
« contrat d'entrée » est donc tenu pour ข้าวผัด et จาน (4C, items 1 et 3), ce
qui est une bonne nouvelle, mais le décompte d'items et l'incertitude 1 sont à
réécrire entièrement.

#### N6. Item 4 : le contraste kh mal attribué

Note affichée : « Les deux syllabes commencent par une consonne soufflée, kh
puis ph, les deux familles travaillées en 2A et en 3A. » Faux : 2A traite les
labiales (/p/ contre /pʰ/) et 3A les dentales (/t/ contre /tʰ/). Le contraste
/k/ contre /kʰ/ est le sujet propre de `unite-04/lecon-4a.md`, intitulée
« Le k qui souffle et la règle du ton ». Les Prérequis de 4E ne citent 4A nulle
part alors que ข้าวผัด, ขอ, ขอบคุณ et ครับ en dépendent.

#### N7. Item 3 : « la négation ouvre le groupe, elle ne le ferme pas » est trop général

La note affichée nie ce que le champ `sources` de l'item 2 reconnaît, et ce que
j'ai lu dans le miroir : l'entrée énonce ถ้าอยู่ท้ายคำ ต้องมีคำ หา อยู่หน้า,
avec l'exemple หากินไม่. La simplification est acceptable pour un débutant,
l'affirmation absolue ne l'est pas. Reformuler en « devant, dans tout ce que
vous direz à ce stade », plutôt que « en thaï ».

#### N8. Le décompte RID annoncé recomputable ne se recompute pas

Le dossier écrit « 19 retenues, 2 exploratoires, 7 absentes, soit 28 requêtes
sur 28 graphies distinctes » et dit ce décompte recomputable à partir des trois
listes. J'ai recompté : les trois listes donnent bien 19 + 2 + 7 = 28. Mais
l'item 4 déclare avoir re-consulté ici « ข้าว » et « ผัด », qui ne figurent dans
aucune des trois listes. Le total réel est d'au moins 30, et l'assertion de
recomputabilité tombe.

#### N9. Contradiction 4E contre 4C sur th.wiktionary « จาน », où 4E a raison

4C écrit : « Cette édition ne porte pas de section de classificateur propre ».
J'ai vérifié : **c'est faux**, la section คำลักษณนาม existe, avec ses deux
exemples. 4E décrit la page correctement. Le finding est donc à porter sur 4C,
mais il est consigné ici parce que deux dossiers de la même unité ne peuvent
pas rester contradictoires sur une page publique et vérifiable.

#### N10. L'objectif observable sur-promet sur l'exercice 3

« il place ไม่ devant ce qu'il nie et ไหม à la fin de la question, sans erreur
d'ordre, aux trois tirages de l'exercice 3 ». Le tirage 2 est เผ็ด seul, sans
ไม่ ni ไหม : l'objectif n'est mesurable que sur deux tirages sur trois.

#### N11. Item 5 : le compteur de l'assiette vide n'est donné qu'à moitié

Le champ `fr` et la note ne montrent que ใบ. Les deux sources citées, RID
« จาน ๑ » et en.wiktionary, donnent **ใบ ou ลูก**, et le champ `sources` de la
leçon l'écrit correctement. L'écran doit soit compléter, soit assumer la
réduction par une phrase explicite.

#### N12. Rangs de fréquence profonds non recomptés

J'ai pu relire verbatim le haut de la liste et confirmer quatre rangs au jeton
près (voir 1.5). Les rangs profonds annoncés (สวัสดี 54, สอง 273, คะ 278, ไหม
966, เท่าไร 10465, บาท 23499, จาน 29060, เผ็ด 37523 avec 10 occurrences) n'ont
pas pu être recomptés depuis ce poste. Signal indicatif, sans effet sur le
contenu, mais à recompter localement puisque le dossier les présente comme
relevés.

## 3. Ce que cette passe ne couvre pas

- Le RID 2554 n'a pas pu être interrogé. Toutes les assertions « RID » restent
  à rejouer et à consigner littéralement, en particulier B4, la numérotation des
  vedettes (จาน ๑, ขอ ๒, บาท ๒, คะ ๒, พริก ๑, ไหม ๒) et le nombre de vedettes
  annoncé pour chaque graphie.
- `VOLUBILIS Database.xlsx` n'est pas au dépôt. B1 est établi par contradiction
  interne, pas par lecture du fichier.
- Naturalité réelle des quatre assemblages du dialogue, en particulier
  เผ็ดไหมคะ : hors de portée d'un audit non natif. L'incertitude 4 de la leçon
  est honnête et reste ouverte.
- Audio : aucune piste produite, donc rien à auditer.
- Revue native : **en attente**. Rien dans ce rapport ne l'anticipe ni ne la
  remplace.

## 4. Verdict

La leçon est linguistiquement solide sur ce qui est vérifiable de façon
autonome : **aucune graphie fausse, aucun ton faux, aucune longueur fausse,
aucun corrigé faux, aucune IPA fausse, aucun distracteur juste, aucun tiret
cadratin, transcription v1.1 conforme, Unicode conforme, et la règle de ton
de 4A qui la surplombe est correcte et bien bornée.**

Les quatre bloquants ne portent pas sur la langue mais sur la **chaîne de
preuve** et sur **trois phrases affichées à l'apprenant** qui disent plus que
ce que les sources soutiennent. Statut maintenu à `draft`. Passage à `review`
subordonné à la résolution de B1 à B4.
