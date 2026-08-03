# Recoupement Volubilis : unité 2

- Date : 3 août 2026
- Périmètre à ce jour : **leçon 2B uniquement**. Les leçons 2A, 2C, 2D et 2E
  devront ajouter leurs propres lignes à ce fichier avant leur consolidation.
- Motif de création : finding B1 du contre-audit `unite-02/verification-2b.md`.
  Les citations Volubilis de la leçon 2B portaient une date mais aucune URL,
  aucun numéro d’entrée et aucun artefact reproductible, ce qui faisait
  retomber de fait les huit items sur le seul écosystème Wikimedia.

## Source et méthode

- Base : VOLUBILIS Database v26.2 (juillet 2026), 114 577 entrées, licence
  CC BY-SA 4.0 constatée sur le blog de l’auteur.
- Fichier : `VOLUBILIS Database.xlsx`, téléchargé le 2026-08-03 depuis le
  projet SourceForge officiel (belisan) :
  https://sourceforge.net/projects/belisan/files/VOLUBILIS%20Database.xlsx/download
- Contrôles d’identité du fichier téléchargé : feuille unique nommée
  `Volubilis` ; ligne 1 « VOLUBILIS Database | Multilingual Thai Database
  Tha-Eng-Fra | v. 26.2 (Jul. 2026) | 114577 entr. |
  https://belisan-volubilis.blogspot.com/ » ; propriétés du document
  `dcterms:created` 2026-07-01, auteur « Belisan Surin » ; 114 579 lignes au
  total, soit 2 lignes d’en-tête plus 114 577 entrées, ce qui concorde avec le
  compte annoncé.
- Colonnes de la ligne 2, dans l’ordre : `THAIROM`, `EASYTHAI`, `THAIPHON`,
  `ETYMO`, `THA`, `ENG`, `FRA`, `TYPE`, `USAGE`, `SCIENT/abbrev.`, `DOM`,
  `CLASSIF`, `SYLLAB`, `NOTE`, `SYN`. Les entrées commencent ligne 3.
- Extraction : lecture programmatique de la feuille avec `openpyxl` en mode
  lecture seule, filtrage exact puis par préfixe sur la colonne `THA`, sans
  aucune normalisation Unicode appliquée aux chaînes comparées. Le numéro de
  ligne indiqué ci-dessous est le numéro de ligne de la feuille, il sert
  d’identifiant d’entrée reproductible.
- Usage : consultation de vérification uniquement. La base n’est ni
  redistribuée ni copiée dans le produit ; seuls des extraits courts de
  colonnes sont reproduits ici, avec attribution, comme preuve de recoupement.
- Les colonnes sont reproduites caractère pour caractère, apostrophes droites
  de la source comprises, pour rester vérifiables ligne à ligne. La règle
  Thaïnaute d’apostrophe typographique s’applique à la prose du produit, pas à
  la citation d’une source.
- Cette source est indépendante de l’écosystème Wikimedia : elle lève, pour les
  faits qu’elle couvre, le finding « double sourçage non indépendant ». La
  primauté du RID en orthographe reste une porte MANUELLE avant le passage en
  `review`.

## Lignes citées par la leçon 2B

| Ligne  | THA           | THAIPHON                | TYPE            | USAGE        | DOM                      | FRA (colonne brute)                                                                          | ENG (colonne brute)                                                                                                                   |
| ------ | ------------- | ----------------------- | --------------- | ------------ | ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 2357   | อรุณสวัสดิ์   | `_a-run _sa_wat`        | n. exp.         |              | TOURIST                  | bonjour                                                                                      | good morning                                                                                                                          |
| 28944  | คะ            | `¯kha`                  | adv.            | (f.)         | RID ; TOURIST            | oui ; [formule de politesse en fin de vocatif ou de phrase interrogative]                    | yes ; do ; would ; [particle used by a woman after a vocative or at the end of a question]                                            |
| 28945  | ค่ะ           | `\kha`                  | adv.            | (f.)         | CHAT ; RID ; TOURIST     | oui ; d’accord ; [formule de politesse en fin de réponse affirmative]                        | yes ; okay ; right ; [politeness marker when answering a question in the affirmative]                                                 |
| 37006  | ครับ          | `¯khrap`                | adv.            | (m.)         | RID ; TOURIST            | oui ; ouais (fam.)                                                                           | yes ; right ; yeah (inf.) ; yep (inf.) ; yup (Am., inf.)                                                                              |
| 37007  | ครับ          | `¯khrap`                | adv.            | (m.)         | RID ; TOURIST            | [formule de politesse en fin de phrase]                                                      | [politeness marker]                                                                                                                   |
| 51647  | ไหม           | `/mai`                  | part. (interr.) |              | TOURIST                  | est-ce que ? ; [particule interrogative]                                                     | right? ; [question particle] ; [interrogative marker]                                                                                 |
| 52700  | ไม่สบาย       | `\mai _sa-bāi`          | v.              |              | MEDIC ; SOCIO ; TOURIST  | être malade ; être souffrant ; se sentir mal                                                 | have a fever ; get a flu ; become feverish ; run a fever ; be ill ; be sick ; be ailing ; not feel well ; do not feel well ; feel bad |
| 69095  | พนมมือ        | `¯pha-nom -meū`         | v. exp.         |              |                          | joindre les mains pour saluer                                                                | put the palms of the hands together in salute ; press the hands together at the chest or forehead in sign of respect                  |
| 78245  | ประนม         | `_pra-nom`              | v.              |              |                          |                                                                                              | make a gesture of respect [by pressing the palms of the hands together at the chest] ; bring both hands together in obeisance         |
| 81943  | ราตรีสวัสดิ์  | `-rā-trī _sa_wat`       | n. exp.         |              | TOURIST                  | bonne nuit                                                                                   | good night                                                                                                                            |
| 85504  | สบายดี        | `_sa-bāi -dī`           | n.              | (reg., Isan) |                          | bonjour ; salut ! (fam.)                                                                     | hello ; hi                                                                                                                            |
| 85505  | สบายดี        | `_sa-bāi -dī`           | v. exp.         |              | SOCIO                    | aller bien ; être en forme ; être frais et dispos                                            | be fine ; be well ; be all right ; feel confortable ; be fit ; be healthy ; be doing well ; be doing great ; be doing good            |
| 85506  | สบายดี        | `_sa-bāi -dī`           | v. exp.         |              | TOURIST                  | ça va bien ; je vais bien                                                                    | It's all right ; I'm fine ; I'm alright                                                                                               |
| 85508  | สบายดีไหม     | `_sa-bāi -dī /mai`      | xp              |              | TOURIST                  | Comment ça va ? ; Ça va bien ? ; Tu vas bien ? ; Vous allez bien ?                           | What's up? ; How are you? ; how's it going? ; Are you OK?                                                                             |
| 90778  | สวัสดี        | `_sa_wat-dī`            | n.              |              |                          |                                                                                              | goodness ; virtue ; prosperity ; beauty ; progress                                                                                    |
| 90779  | สวัสดี        | `_sa_wat-dī`            | n.              |              | INSOLITE ; TOURIST       | bonjour ; bonsoir ; salut ! (fam.)                                                           | hello ; hi ; hi there ; good day ; good morning ; good afternoon ; good evening ; good night                                          |
| 90780  | สวัสดี        | `_sa_wat-dī`            | n.              |              | INSOLITE ; TOURIST       | au revoir ; adieu                                                                            | goodbye ; cheerio                                                                                                                     |
| 90788  | สวัสดีค่ะ     | `_sa_wat-dī ¯kha`       | xp              | (f.)         | TOURIST                  | bonjour ; bonsoir ; salut ! (fam.) ; au revoir ; adieu ; Au revoir !                         | hello ; hi ; hi there ; good day ; good morning ; good afternoon ; good evening ; good night                                          |
| 90790  | สวัสดีครับ    | `_sa_wat-dī ¯khrap`     | xp              | (m.)         | TOURIST                  | bonjour ; Bonjour ! ; bonsoir ; Bonsoir ! ; Salut ! (fam.) ; au revoir ; Au revoir ! ; adieu | hello ; hi ; hi there ; good day ; good morning ; good afternoon ; good evening ; good night                                          |
| 90804  | สวัสดีตอนบ่าย | `_sa_wat-dī -tøn _bāi`  | n. exp.         |              |                          | bonjour ; bon après-midi                                                                     | good afternoon                                                                                                                        |
| 90805  | สวัสดีตอนเช้า | `_sa_wat-dī -tøn ¯chāo` | n. exp.         |              |                          | bonjour ; bon matin                                                                          | good morning                                                                                                                          |
| 90806  | สวัสดีตอนค่ำ  | `_sa_wat-dī -tøn \kham` | n. exp.         |              |                          | bonsoir                                                                                      | good evening ; good night                                                                                                             |
| 90807  | สวัสดียามเช้า | `_sa_wat-dī -yām ¯chāo` | n. exp.         |              |                          | bonjour                                                                                      | good morning                                                                                                                          |
| 107927 | ไหว้          | `\wāi`                  | v.              |              | INSOLITE ; RID ; TOURIST | saluer ; rendre hommage                                                                      | salute ; greet ; pay respect ; kowtow                                                                                                 |
| 109052 | หวัดดี        | `_wat-dī`               | interj.         | (inf.)       | CHAT                     | Salut ! ; Hello !                                                                            | Hi! ; Hello!                                                                                                                          |

## Ce que l’extraction confirme, et ce qu’elle ne confirme pas

- CONFIRMÉ : les dix citations Volubilis du premier jet de la leçon 2B étaient
  exactes. Aucune glose, aucune étiquette d’usage et aucun domaine n’avait été
  inventé ou déformé. Le problème du finding B1 portait uniquement sur la
  reproductibilité, pas sur la véracité.
- CONFIRMÉ : สวัสดีครับ (90790) et สวัสดีค่ะ (90788) existent comme entrées à
  part entière, marquées `(m.)` et `(f.)`, avec des gloses couvrant l’arrivée
  et le départ. C’est ce qui autorise la leçon à enseigner le bloc entier.
- CONFIRMÉ : la répartition des deux particules féminines est explicite et
  systématique dans la base, คะ « en fin de vocatif ou de phrase
  interrogative » (28944) contre ค่ะ « en fin de réponse affirmative » (28945).
- CONSTAT UTILISÉ AVEC PRUDENCE : la base ne pratique pas cette séparation pour
  ครับ. Elle donne deux entrées, 37006 « oui ; ouais (fam.) » et 37007
  « [formule de politesse en fin de phrase] », sans restriction de type de
  phrase. Ce contraste interne à une même source est cité dans la leçon comme
  une observation, jamais comme la preuve qu’aucune autre forme masculine
  n’existe en question.
- NON CONFIRMÉ, recherche par préfixe menée le 2026-08-03 : la base ne contient
  **aucune** entrée `หวัดดีครับ` ni `หวัดดีค่ะ`. Cette absence ne prouve rien
  dans un sens ni dans l’autre et n’est utilisée comme argument nulle part.
- RETIRÉ DE LA LEÇON malgré la confirmation de la ligne : l’étiquette
  `(reg., Isan)` de สบายดี (85504) existe bien dans la base, mais elle reste à
  source unique. en.wiktionary ne donne à สบายดี ni sens de salutation ni
  étiquette régionale, donc aucun recoupement n’est possible. La note
  culturelle qui s’appuyait dessus a été supprimée (finding B2).
- NON ENSEIGNÉ malgré la confirmation des lignes : les gloses de ประนม (78245)
  et พนมมือ (69095) mentionnent une hauteur de mains, mais elles portent sur
  d’autres mots que ไหว้ et elles donnent elles-mêmes deux hauteurs
  concurrentes, poitrine ou front. Le détail « devant la poitrine » a été
  retiré de la leçon (finding B5).
- HORS PORTÉE : les domaines de la base (`TOURIST`, `CHAT`, `SOCIO`, `MEDIC`,
  `INSOLITE`, `RID`) sont des domaines thématiques, pas des étiquettes de
  registre. Aucune conclusion d’usage n’en est tirée dans la leçon.
- PORTE NON FRANCHIE : le domaine `RID` porté par ไหว้, ครับ, คะ et ค่ะ est un
  indice indirect, ce n’est pas une consultation du RID. La
  contre-vérification manuelle RID reste requise avant le passage en `review`.
