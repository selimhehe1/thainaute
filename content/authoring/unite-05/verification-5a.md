# Contre-audit adversarial de `u05-l5a`

- Fichier audité : `content/authoring/unite-05/lecon-5a.md`
- Date de l'audit : 3 août 2026
- Auditeur : agent indépendant, consigne adversariale (chercher des erreurs,
  ne pas confirmer)
- Référentiels appliqués : `content/authoring/CONVENTIONS.md` (v1, amendements
  v1.1 et v1.2, arbitrage v1.2) et `docs/content-policy/sources-verification.md`
- Méthode : aucune source citée par la leçon n'a été crue sur parole. Le RID a
  été réinterrogé en direct par requête POST sur `func_lookup.php` (50 graphies,
  une requête par graphie, espacées d'au moins 1,3 seconde, agent utilisateur
  identifiant le projet, aucune définition stockée hors de ce rapport et
  citations par référence uniquement) ; les entrées Wiktionary ont été
  rechargées en rendu sur les deux éditions ainsi que l'annexe
  « Appendix:Thai script » ; la liste `th_50k.txt` de FrequencyWords a été
  retéléchargée et les rangs recalculés sur ses 50 000 lignes ; les codepoints
  et la stabilité NFC ont été recalculés sur le fichier tel qu'édité ; les
  vingt fichiers de leçon des unités 1 à 4 ont été relus et leurs items
  ré-extraits par script pour contrôler chaque renvoi interne.

## Verdict

**NON RECEVABLE en l'état pour un passage `draft -> review`.**

7 findings bloquants, 5 findings non bloquants.

Il faut dire d'abord ce qui tient, parce que c'est massif : sur 278 faits que
j'ai revérifiés moi-même, 271 se sont révélés exacts, souvent au caractère
près. Les seize valeurs IPA, les quatorze romanisations Paiboon et Royal
Institute, les quarante-deux relevés d'entrées RID, les vingt-deux lignes de
l'annexe Wiktionary, les treize rangs de fréquence, les empreintes SHA-256 de
`VOLUBILIS.ods` et les vingt-deux renvois aux leçons antérieures sont tous
conformes à ce que la leçon leur fait dire. Aucune source n'est inventée.
J'ai même essayé de faire tomber les numéros de ligne VOLUBILIS, qui ne sont
pas vérifiables directement faute du fichier au dépôt : les quarante numéros
cités sont strictement croissants selon l'ordre alphabétique de la colonne
`ThaiRom`, et les lignes 9 à 29 de la feuille `Romanization` forment une
séquence sans trou conforme à l'ordre alphabétique thaï. Rien ne s'y contredit.

Les défauts trouvés sont d'une autre nature. Ce sont trois erreurs de fait
dures (une finale attribuée au mauvais lieu d'articulation sur une page
d'enseignement, un rang de fréquence attribué au mauvais mot, un ensemble de
lettres énuméré de façon incomplète), deux règles présentées comme des repères
utilisables qui échouent sur des mots de la leçon même, une série
d'affirmations non sourcées sur la phonétique du français dont la déclaration
d'incertitude ne couvre que la moitié, et un ton faux sur une forme citée.

## Ce que j'ai revérifié moi-même, et qui est confirmé

| Dimension contrôlée                                                                 | Faits confirmés |
| ----------------------------------------------------------------------------------- | --------------- |
| `codepoints` des 7 items, recalculés depuis le champ `thai`                         | 7               |
| Couples graphie + séquence U+XXXX cités en prose                                    | 5               |
| Stabilité NFC des 169 chaînes thaïes et du fichier entier                           | 2               |
| Typographie ADR-0022 (U+2014, U+2013, U+2015, U+2212, U+0027, U+2019, ADR existant) | 7               |
| RID, présence ou absence et nombre de vedettes, 50 graphies interrogées             | 50              |
| RID, faits de structure (listes de classes, séries de mātrā, ห นำ, définitions)     | 9               |
| en.wiktionary, valeurs IPA (16 graphies, dont แปด, ตัด, เผ็ด, ชอบ)                  | 16              |
| en.wiktionary, romanisations Paiboon et Royal Institute des 7 items                 | 14              |
| th.wiktionary, สัทอักษรสากล et ไพบูลย์ des 7 items                                  | 14              |
| Annexe « Appendix:Thai script », rang, initiale, finale et classe                   | 22              |
| Notes d'usage « low consonant class » sur les 9 pages de lettres                    | 9               |
| Respelling phonémique คฺรับ                                                         | 1               |
| FrequencyWords `th_50k.txt`, rangs recalculés sur 50 000 lignes                     | 14              |
| Renvois à des items réellement déclarés dans les unités 1 à 4                       | 22              |
| Numérotation des items de `u03-l3b` (1.5, 2.1, 2.3)                                 | 3               |
| Affirmations portant sur `u04-l4a` et `u04-l4b`                                     | 7               |
| Identité de l'exemplaire VOLUBILIS (empreintes, tailles, décomptes, témoins)        | 16              |
| Cohérence interne des 40 numéros de ligne VOLUBILIS sous tri `ThaiRom`              | 1               |
| Cohérence de la séquence de lignes 9 à 29 de la feuille `Romanization`              | 1               |
| Audit du critère de ห muet, recompté par extraction indépendante                    | 2               |
| Tons recalculés depuis classe + type de syllabe + marque, 12 graphies               | 12              |
| Corrigés des quatre exercices                                                       | 24              |
| Contraintes de tirage déclarées (répartition, non-répétition, trois lieux)          | 3               |
| Conformité `thainaute-fr` v1.1 des 7 items et des 5 spécimens                       | 12              |
| Concordance des champs techniques des 5 items déclarés RÉEMPLOI                     | 5               |
| **Total**                                                                           | **278**         |

Quelques points saillants, parce qu'ils étaient exposés et qu'ils tiennent :

- RID interrogé en direct le 3 août 2026. `หก` porte bien trois vedettes, dont
  une désigne un oiseau de la famille `Psittacidae` ; `อก ๓` porte bien le sens
  ancien de « six » ; `โซ่ ๑` désigne bien un groupe humain et non la chaîne ;
  `ฟัน ๑` est bien le verbe de frappe et `ฟัน ๒` la dent ; l'entrée `ห` donne
  bien `หอ หีบ`, la classe haute, l'emploi de lettre de tête devant les
  `อักษรต่ำเดี่ยว` avec `ห` non prononcé, et exactement les deux exemples `หงอย`
  et `หนา` que la leçon lui prête. Les cinq absences revendiquées
  (`อักษรต่ำเดี่ยว`, `นกฮูก`, `แม่กก`, `แม่กด`, `แม่กบ`) sont réelles.
- L'entrée `อักษรต่ำ` donne bien vingt-quatre lettres, la même liste que celle
  du dossier, le ton de base `สามัญ` en syllabe vivante et la série `คา ค่า ค้า`.
  Elle donne aussi, ce que le dossier signale sans l'écrire, le facteur qui
  sépare `ครับ` de `มาก` : `คำตาย` à voyelle brève prend `ตรี`, à voyelle longue
  prend `โท`. La page 11 a donc raison de s'arrêter là où elle s'arrête.
- Les rangs de fréquence sont exacts au rang près : `ครับ` 10, `ห้า` 1118,
  `มาก` 1301, `หก` 1684, `หิว` 8183, `ผัก` 27047, et `ผัด` est bien absent.
- Les cinq items déclarés RÉEMPLOI ont un `ipa`, un `ton`, une `longueur`, une
  `transcription` et un `registre` rigoureusement identiques à ceux de l'item
  publié d'origine.
- Le contrôle du critère de `ห` muet a été refait indépendamment : les vingt
  fichiers des unités 1 à 4 donnent bien treize graphies simples contenant `ห`
  et onze blocs construits sur elles, et la répartition dix muets contre trois
  prononcés est exacte. C'est en refaisant ce contrôle caractère par caractère
  que le finding B3 est apparu.

## Findings bloquants

### B1. Page 7 : แปด rangé parmi les finales en `k`

**Où.** Page 7 d'enseignement : « ครับ finit sur un p tenu, lèvres fermées, sans
le moindre souffle après. เผ็ด et ตัด finissent sur un t tenu. **มาก, หก et
แปด finissent sur un k tenu.** » Répété à la section « Reprises des unités 1 à
4 » : « ตัด (item de `u03-l3a`) et แปด (item 2.3 de `u03-l3b`) sont cités à la
page 7 comme exemples de finale `-t` et `-k` déjà connues. »

**Pourquoi c'est faux.** แปด s'écrit แ + ป + ด. Sa consonne de fermeture est ด,
qui ferme en `t`.

**Preuve, relevée par moi.** en.wiktionary, entrée « แปด », rendu du
2026-08-03 : `/pɛːt̚˨˩/`. RID, entrée « ด » et entrée « ช ๑ », consultées le
2026-08-03 : ด et les lettres de la même série sont `ตัวสะกดในมาตรากด`, pas
`มาตรากก`. Annexe « Appendix:Thai script », ligne 20 : `Royal Thai Final` = `t`,
`IPA Final` = `/t/`. Le fichier `u03-l3b` déclare lui-même, item 2.3,
`ipa : /pɛːt̚˨˩/`.

**Aggravant.** La leçon se contredit elle-même deux fois. Le tableau du « Fait
A » de son propre dossier liste `/pɛːt̚˨˩/` parmi les treize relevés sans
exception, et la section « Reprises » cite « en.wiktionary /tat̚˨˩/ et
/pɛːt̚˨˩/ » à la ligne même où elle range แปด en `-k`. Le tableau de la page 10
est juste, la page 7 ne l'est pas.

**Impact.** Page d'enseignement, pas note d'auteur. Elle apprend une fermeture
fausse sur un mot déjà publié et déjà cartonné en `u03-l3b`, juste avant
l'exercice 2 qui mesure précisément le lieu de fermeture. Le spécimen d'écran
de la page 7 est heureusement `ครับ · เผ็ด · มาก`, qui est correct : la
correction se fait dans le corps du texte seul.

**Correction proposée.** Déplacer แปด dans le groupe `-t` avec เผ็ด et ตัด, et
trouver un troisième mot en `-k` parmi ceux déjà vérifiés au dossier, ou
assumer deux mots en `-k`. Le décompte « Six mots que vous connaissez » reste
valable dans les deux cas.

### B2. Item 4 : rang de fréquence attribué à ข้าวผัด

**Où.** Item 4, champ `sources`, dernière puce : « FrequencyWords `th_50k.txt`,
relevée le 2026-08-03, ผัด est ABSENT des 50 000 premiers tokens, alors que
**ข้าวผัด y figure au rang 13857** en tant que composant de ข้าว. »

**Pourquoi c'est faux.** J'ai retéléchargé
`content/2018/th/th_50k.txt` (50 000 lignes, exemplaire confirmé identique par
les six rangs témoins du dossier, tous exacts) et recalculé les rangs. ข้าวผัด
est **absent** de la liste. Le rang 13857 est celui de ข้าว.

**Aggravant.** Le dossier l'écrit lui-même, à la section « Sources employées et
méthode d'accès » : « Identité du fichier vérifiée le 2026-08-03 en recalculant
six rangs cités par `u04-l4a` : กิน 2444, ไก่ 4644, ไข่ 6464, **ข้าว 13857**,
ขาว 8166, ขา 4562. » Le même nombre est attribué à deux graphies différentes
dans le même fichier. La proposition « en tant que composant de ข้าว » est en
outre inversée : c'est ข้าว qui est composant de ข้าวผัด.

**Impact.** L'incertitude 6 s'appuie sur ce relevé pour conclure que la liste
est mal calibrée pour le vocabulaire du quotidien. La conclusion reste vraie
(ผัด absent, ผัก à 27047), mais l'argument qui la porte est faux et sera repris
tel quel à la consolidation de l'unité.

**Correction proposée.** Écrire que ข้าวผัด est lui aussi absent des 50 000
premiers tokens, ce qui renforce d'ailleurs l'incertitude 6, et retirer la
mention du rang 13857 de cet item.

### B3. Le critère du `ห` muet est faux à la lecture, sur หิว, un mot du jour

**Où.** Page 5 : « Regardez la lettre juste après lui : c'est chaque fois น, ม,
ว, ย ou ร, et dans ce cas le ห se tait. Dans ห้า, หก et **หิว**, ce qui suit
n'appartient pas à cette petite famille, et le ห se prononce. » Page 12 :
« quand la consonne initiale est ห, soufflez, sauf si la lettre juste après elle
est น, ม, ว, ย ou ร ». Spécimen de la page 5 : « หิว (hǐo) contre หมา (mǎa) ».

**Pourquoi c'est faux.** หิว s'écrit ห + ิ + ว. Le signe ิ est une marque non
espaçante qui se pose **au-dessus** de ห. La lettre que l'apprenant voit à la
suite de ห sur la ligne de base est donc ว, qui appartient à la liste énoncée.
Appliquant le critère qu'on vient de lui donner, il conclut que le ห se tait et
prononce `ǐo`. C'est exactement le contraire de ce que la leçon enseigne, sur
le troisième des trois mots à `/h/`, et sur le mot que la page 5 met en
spécimen.

**Preuve, relevée par moi.** Extraction indépendante des champs `thai` des vingt
fichiers des unités 1 à 4 : sur les treize graphies simples contenant ห, deux
(ห้า et หิว) ont un caractère non espaçant immédiatement après ห, U+0E49 pour
ห้า et U+0E34 pour หิว. Dans le cas de ห้า, la lettre de base suivante est า,
hors liste, sans risque. Dans le cas de หิว, c'est ว, dans la liste. Le
parcours contient déjà un mot, ไหว้, où la même séquence visible ห puis ว donne
un ห muet : les deux mots ne se distinguent que par le signe posé au-dessus, et
aucune page ne le dit.

**Aggravant.** Le dossier affirme « dans les trois la lettre suivante
n'appartient pas à cet ensemble », puis « Le critère affiché est donc exact sur
la totalité de ce que l'apprenant a rencontré », puis, à l'État des audits,
« treize graphies simples, **zéro contre-exemple** ». Ces trois affirmations ne
sont vraies que sous la lecture « caractère suivant dans l'ordre logique », qui
n'est ni celle de l'écran ni celle que la page énonce. La leçon avertit
l'apprenant que ไ s'écrit avant sa consonne, ce qui est le même genre de piège,
mais elle ne l'avertit pas qu'un signe vocalique se pose au-dessus.

**Correction proposée.** Formuler le repère sur la **consonne** qui suit, pas
sur « la lettre juste après », et ajouter une phrase du type « les petits
signes posés au-dessus ne comptent pas, regardez la prochaine consonne ». Puis
refaire le contrôle exhaustif avec cette formulation, et corriger l'État des
audits qui annonce zéro contre-exemple.

### B4. « ง, น et ม sont les lettres des finales sonantes de la règle de 4A »

**Où.** Méta, bloc d'écriture : « trois sont les lettres des finales sonantes de
la règle de 4A ». Page 9 : « Les trois dernières, ง, น et ม, n'ont pas de
jumelle : **ce sont** les lettres des finales sonantes de la règle de 4A. »

**Pourquoi c'est faux.** La règle de 4A en compte cinq. Texte relu dans le
dépôt, `u04-l4a` page 6 : « Prenez une syllabe qui se termine sur une voyelle
longue, ou sur **ง, น, ม, ย ou ว**, et qui ne porte aucune marque de ton ».
Le RID confirme le même périmètre, entrée « คำเป็น » consultée le 2026-08-03 :
les séries sont กง, กน, กม, เกย et เกอว, soit les mêmes cinq lettres.
L'article défini rend l'énoncé exhaustif, et l'énoncé exhaustif est faux.

**Aggravant.** La leçon se contredit dans le même fichier. L'item 3 écrit que
หิว a « la syllabe vivante, fermée par ว, donc rien à retenir à la fin ». ว est
donc bien, pour la leçon elle-même, une finale sonante de la règle de 4A, et
elle ne figure pas dans les trois.

**Impact.** C'est une règle affichée. Un apprenant qui retient « les finales
sonantes sont ง, น, ม » ne pourra plus décider du caractère vivant de หิว ni de
ไหว้, deux mots qu'il connaît, et la règle de ton de 4A cessera de fonctionner
pour lui sur ces cas.

**Correction proposée.** Écrire « trois des cinq lettres des finales sonantes »,
ou « trois lettres qui servent aussi de finale sonante », et nommer ย et ว
comme appartenant à la même famille mais restant hors du bloc du jour.

### B5. Incertitude 12 : l'ensemble des consonnes basses isolées est mal énuméré

**Où.** Incertitude 12 : « le RID parle des consonnes basses isolées, ensemble
qui compte aussi **ญ, ณ, ล et ฬ**, absentes du parcours à ce jour ».

**Pourquoi c'est faux.** L'ensemble des `อักษรต่ำเดี่ยว` est ง, ญ, ณ, น, ม, ย,
ร, ล, ว, ฬ. Le repère de la leçon en nomme cinq (น, ม, ว, ย, ร) ; l'incertitude
en ajoute quatre (ญ, ณ, ล, ฬ) ; total neuf. **ง manque.**

**Preuve, relevée par moi.** en.wiktionary, page « ห », rendu du 2026-08-03,
note d'usage, que le dossier cite précisément comme sa deuxième jambe pour ce
fait : « A silent, high-class ห "leads" low-class nasal stops (ง, ญ, น and ม)
and non-plosives (ว, ย, ร and ล) ». ง y est la **première** lettre citée. RID,
entrée « ห », consultée le 2026-08-03 : elle nomme l'ensemble
`อักษรต่ำเดี่ยว` sans l'énumérer, et l'entrée `อักษรต่ำเดี่ยว` est absente du
dictionnaire, ce que le dossier constate par ailleurs correctement ; la source
qui énumère est donc Wiktionary, et Wiktionary porte ง.

**Aggravant, et c'est ce qui rend le finding bloquant plutôt que documentaire.**
La borne « absentes du parcours à ce jour » est fausse pour ง : ง est enseignée
le jour même, page 9, comme l'une des neuf lettres du bloc d'écriture. Un
apprenant de 5A a donc ง en main, et le repère de la page 12 lui dit de souffler
devant หง, ce qui est faux. Le même raisonnement vaut pour ล dès qu'une leçon
l'introduira, ce que l'incertitude 1 envisage explicitement (« par exemple
ajouter ร, ล, ว et ย »).

**Correction proposée.** Corriger l'énumération (dix lettres), retirer
l'affirmation « absentes du parcours à ce jour » au moins pour ง, et décider si
ง entre dans le repère des pages 5 et 12 dès cette leçon, puisqu'elle y est
enseignée.

### B6. Affirmations phonétiques sur le français, sans source, et déclaration d'incertitude incomplète

**Où, et ce qui est affirmé.**

1. Page 6, écran : « Le français, lui, relâche ses fins de mots avec un petit
   bruit de détente et souvent une voyelle à peine dite ».
2. Méta, cible phonétique : « Le francophone **ne produit aucun** `/h/` dans sa
   propre langue et l'omet donc par défaut. »
3. Page 1, écran : « Vous écrivez un h dans "hôtel" et vous ne le prononcez
   pas. »
4. Item 6, `note_fr` : « C'est **l'erreur la plus visible** d'un francophone
   débutant, qui dit volontiers un "khrappe" en deux temps. »
5. Exercice 3, pièges connus : « oublier le h sur ห้า et หก, **l'erreur par
   défaut** d'un francophone ».

**Pourquoi c'est bloquant.** `docs/content-policy/sources-verification.md`
n'autorise aucune source portant sur la phonétique du français. Aucune des cinq
affirmations n'est sourcée. Le contrat d'item exige deux sources indépendantes
par fait, et une affirmation sur ce que fait ou ne fait pas une bouche
française est un fait, pas une image pédagogique.

**Aggravant.** L'incertitude 3 est censée couvrir exactement ce risque, et elle
ne déclare que **deux** énoncés : la comparaison avec le souffle sur une vitre
(page 2, qui est effectivement une image et n'affirme rien) et la description du
relâchement français (page 6). Les trois autres, dont l'absolu « aucun `/h/` »
et le superlatif « l'erreur la plus visible », ne sont pas déclarés. L'énoncé 2
est de surcroît contestable au fond : le français produit un `[h]` dans les
interjections et dans plusieurs variétés régionales et emprunts, et la
généralisation absolue n'est ni nécessaire à la leçon ni tenable.

**Impact.** Trois de ces cinq énoncés sont à l'écran. La leçon ne peut pas
franchir la porte `draft -> review` en affirmant sans source ce que fait une
bouche française.

**Correction proposée, au choix.** Soit sourcer par un article de phonétique en
accès libre recevable, ce que la politique ne prévoit pas aujourd'hui et qui
demanderait un ajout à `docs/content-policy/sources-verification.md` ; soit
réécrire les cinq énoncés en observations adressées et non en faits (« vous
allez sans doute », « beaucoup de francophones ») et retirer les absolus
« aucun », « par défaut » et « la plus visible » ; soit les déclarer TOUS les
cinq à l'incertitude 3 comme décisions pédagogiques assumées. La solution
mixte est probablement la bonne, mais elle doit être explicite.

### B7. `khàp` donné comme « la forme relâchée » de ครับ : ton faux et non sourcé

**Où.** Exercice 3, pièges connus : « confondre `khráp` et **`khàp`**, la forme
relâchée n'étant pas enseignée. »

**Pourquoi c'est faux.** La marque `à` note le ton bas dans la convention
`thainaute-fr` v1.1. La forme relâchée de ครับ porte le ton **haut**.

**Preuve, relevée par moi.** en.wiktionary, entrée « ครับ », rendu du
2026-08-03, section « Alternative forms » : ครัช (krách), คร้าบ (kráap), คับ
(káp), คัฟ (káf), ค้าบ (káap), งับ (ngáp), ฮับ (háp). Les sept portent le ton
haut, aucune le ton bas. Le calcul le confirme : คับ a une initiale de classe
basse et une syllabe morte à voyelle brève, donc `ตรี`, le ton haut, par la
règle que le RID énonce à l'entrée `อักษรต่ำ` consultée le même jour.
VOLUBILIS, cité par l'item 6 lui-même, donne d'ailleurs `khrap [= khap]` sans
changement de marqueur de ton.

**Impact.** Le champ « pièges connus » alimente la politique de tolérance de
l'exercice `recall` et sera lu par l'implémenteur. Le fait est de surcroît non
sourcé : aucune des deux jambes exigées par le contrat d'item n'accompagne
cette affirmation.

**Correction proposée.** Écrire `kháp`, ou mieux, retirer la forme relâchée du
champ et se contenter de « ne pas oublier le r de `khráp` », puisque la leçon
dit elle-même que cette forme n'est pas enseignée.

## Findings non bloquants

### N1. L'objectif « 4 mots sur 5 » n'est mesurable par aucun exercice

La Méta déclare : « il écrit en transcription le h initial, présent ou absent,
correctement sur 4 mots sur 5 ». L'exercice 3 compte six tirages. Trois
seulement portent un `/h/` initial vrai : ห้า, อ้า et หก. Les trois autres,
ผัด, ผัก et ครับ, contiennent un `h` de digramme dont la page 3 dit
explicitement qu'il fait un autre métier, et le feedback incorrect de
l'exercice le confirme en séparant « tirages 1 à 3 » (le souffle) de « tirages
4 à 6 » (la fermeture). La carte `srs-u05-l5a-02` reprend le « 4 sur 5 ». Le
vivier existe (ห้า, หก, หิว, อ้า, อก, soit exactement cinq mots), mais
l'exercice de la leçon n'en tire que trois et n'emploie ni หิว ni อก.
À arbitrer : soit porter l'exercice 3 à cinq tirages `/h/`, soit écrire
l'objectif sur 3 mots sur 3.

### N2. Les cinq items RÉEMPLOI redéclarent un champ `fr` différent de l'original

Comparaison faite champ par champ contre les items publiés : `ipa`, `ton`,
`longueur`, `transcription` et `registre` concordent partout, mais `fr` diverge
cinq fois sur cinq. ห้า « cinq » contre « cinq (le nombre 5) » en `u03-l3b` ;
หก « six » contre « six (le nombre 6) » ; หิว « avoir faim, avoir envie de
manger ou de boire » contre « avoir faim » en `u04-l4b` ; มาก « beaucoup, très »
contre « beaucoup ; très » en `u04-l4d` ; ครับ « particule polie de fin de
phrase, employée par un homme ; oui » contre « particule de politesse d'un
locuteur homme (fin de phrase) » en `u01-l1e`. La leçon dit pourtant qu'aucune
carte de vocabulaire n'est recréée. Il faut décider avant compilation quelle
version fait foi, faute de quoi deux gloses différentes du même item pourront
être publiées. Cas particulier de หิว : la glose élargie de 5A est la plus
fidèle au RID que j'ai relu, c'est donc `u04-l4b` qu'il faudrait aligner, pas
l'inverse.

### N3. « ฟ (deux vedettes) » : le RID n'en donne qu'une

Liste des 43 graphies retenues comme preuve, section « Sources employées ».
RID interrogé le 2026-08-03 : la lettre `ฟ` a une vedette unique. Deux vedettes
existent pour le mot `ฟัน`, ce qui est probablement l'origine de la confusion,
et le dossier a raison sur `ช` (deux), `ท` (trois) et `น` (deux), que j'ai
vérifiées. Le fait employé à l'écran, `ฟ` = `f`, classe basse, `ฟอ ฟัน`, reste
exact et doublement sourcé. Correction purement documentaire.

### N4. Page 3 : « dans le premier, le h ne s'entend pas »

La page dit deux phrases plus haut que ce `h` « signale la bouffée d'air », puis
affirme qu'il « ne s'entend pas » dans `phàt`. L'aspiration est audible ; ce que
la page veut dire est qu'elle n'est pas un segment séparable. La formulation
actuelle se contredit et peut conduire l'apprenant à supprimer l'aspiration de
ผ, alors que le contraste de souffle est acquis depuis 2A et réemployé le jour
même. Reformuler du type « ne s'entend pas tout seul, il colle à la consonne »,
ce que la page dit d'ailleurs très bien pour `hâa` juste après.

### N5. `srs-u05-l5a-04` mesure trois lettres qu'aucun exercice n'entraîne

La carte demande la valeur initiale des neuf lettres, « sans erreur », alors que
l'exercice 4 exclut volontairement ง, น et ม puisqu'elles n'ont pas de jumelle,
et que le seul endroit où leur son est donné est le bloc dense de la page 9.
La carte est donc plus exigeante que la leçon n'entraîne, et son critère
« sans erreur » est le plus dur des six alors qu'il porte sur le contenu le
moins pratiqué. À revoir avec l'arbitrage de charge de l'incertitude 10.

## Ce que j'ai cherché et n'ai pas trouvé

Pour que le rapport soit utile, voici les hypothèses adversariales que j'ai
testées et qui n'ont rien donné.

- **Sources inventées.** Aucune. Les cinquante interrogations RID, les seize
  relevés IPA, les vingt-deux lignes de l'annexe Wiktionary, les neuf notes de
  classe, les quatorze rangs de fréquence et les vingt-deux renvois internes
  correspondent tous à ce que la leçon leur fait dire.
- **Tons faux dans les items.** Aucun. Les sept `ton` et les cinq spécimens
  sont conformes au calcul par classe, type de syllabe et marque, et conformes
  aux lettres tonales des deux éditions de Wiktionary.
- **Codepoints ou NFC.** Aucun écart : 7 items sur 7, 5 couples de prose sur 5,
  169 chaînes stables, fichier stable.
- **Tiret cadratin.** Zéro U+2014, zéro U+2013, zéro U+2015, zéro U+2212, zéro
  apostrophe droite. ADR-0022 existe et porte bien la règle.
- **Corrigés faux ou distracteurs vrais.** Les vingt-quatre corrigés sont
  justes. Les distracteurs des exercices 1 et 2 sont tous des mots attestés et
  glosés correctement, et les paires minimales sont réelles, pas fabriquées :
  ห้า/อ้า et หก/อก partagent bien ton, voyelle et finale ; ผัด/ผัก et
  รัก/รับ/รัด ne diffèrent bien que par la dernière lettre.
- **Fait mono-sourcé sur un écran.** Je n'en ai pas trouvé, hors les
  affirmations sur le français du finding B6, qui sont zéro-sourcées.
- **Information pratique de voyage non sourcée.** Aucune. La note culturelle
  s'en tient aux noms de récitation et au sens des neuf mots-images, tous
  double-sourcés, et elle déclare explicitement ce qu'elle n'affirme pas.
- **Numéros de ligne VOLUBILIS fantaisistes.** Non vérifiables directement
  faute du fichier au dépôt, mais j'ai testé leur cohérence : les quarante
  numéros cités dans ce dossier et dans `u04-l4a` sont strictement croissants
  selon l'ordre alphabétique de la colonne `ThaiRom`, et les treize lignes
  citées de la feuille `Romanization` occupent les positions 9 à 29 dans
  l'ordre alphabétique thaï sans un seul trou. Rien ne permet de les mettre en
  doute.

## Suite

- Corriger B1, B2, B4, B5 et B7, qui sont des corrections de texte sans
  arbitrage produit.
- Trancher B3, qui demande une reformulation du repère et un nouveau contrôle
  exhaustif, et corriger l'État des audits qui annonce zéro contre-exemple.
- Trancher B6 avec le fondateur ou par une décision éditoriale écrite, puisque
  la politique de sources ne couvre pas le français.
- Reprendre ensuite les contrôles Unicode, NFC et typographie, que toute
  retouche invalide, conformément à ce que le dossier prévoit lui-même.
- Statut maintenu : `draft`. Revue native : en attente.
