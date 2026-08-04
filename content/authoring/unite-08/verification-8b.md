# Contre-audit adversarial de `unite-08/lecon-8b.md`

- Date de l'audit : 2026-08-04
- Auditeur : agent adversarial indépendant (Claude Opus 5, `claude-opus-5[1m]`)
- Fichier audité : `content/authoring/unite-08/lecon-8b.md`, statut `draft`,
  99 782 octets, 1 419 lignes
- Cadre : `content/authoring/CONVENTIONS.md` (v1 + amendements v1.1 et v1.2,
  dont l'arbitrage v1.2 sur les digrammes) et
  `docs/content-policy/sources-verification.md`, dont la section 1 bis
- Consigne : chercher des erreurs, ne rien accepter sur parole. Toutes les
  sources citées par la leçon ont été RE-CONSULTÉES par l'auditeur. Aucune
  affirmation du dossier de production n'a été reprise sans contrôle.
- Note de périmètre : la consigne portait deux priorités visant d'autres
  leçons, « 8A, les deux marques de ton restantes » et « 8C, le mot ถูก ».
  Le fichier audité est 8B. La première priorité a néanmoins été traitée à
  fond, parce que 8B s'appuie huit fois sur le tableau de `u07-l7a` : les neuf
  cases de ce tableau ont été recalculées une par une, et c'est de là que sort
  le finding F4. La seconde relève de `verification-8c.md`, déjà écrit.

## 1. Ce que l'auditeur a lui-même vérifié

**170 faits atomiques re-vérifiés et trouvés VRAIS, zéro sur parole.** Les
faits trouvés FAUX sont sortis de ce décompte et figurent en section 2.

### 1.1 RID 2554, présence et absence des graphies (15 faits)

Accès : `node scripts/verification/rid-lookup.mjs`, puis requêtes POST directes
sur `https://dictionary.orst.go.th/func_lookup.php`, paramètres
`word=<graphie>&funcName=lookupWord&status=lookup`, en-tête
`x-requested-with: XMLHttpRequest`, une requête par graphie, espacées de
1,2 à 1,4 seconde, agent utilisateur identifiant le projet et l'objet du
contrôle. Aucune définition n'est reproduite ci-dessous : les faits sont cités
par référence, conformément au §1 de la politique de sources.

Attestées comme vedettes autonomes (11) : หา, อยาก, ได้, ต้องการ, ลอง, ดู,
เอา, ห่า, ซื้อ, ขอ, อัน. Contrôle supplémentaire de l'auditeur : ห้า, attestée.

Absentes comme vedettes (3), absences vérifiées et donc informatives :
อยากได้, ลองดู, หาซื้อ.

Les onze présences et les trois absences déclarées par le dossier sont donc
exactes, y compris la troisième, issue d'une requête exploratoire.

### 1.2 RID 2554, contenu des entrées (26 faits)

Chaque assertion de structure du dossier a été recontrôlée sur l'entrée elle
même. Sont confirmés :

- « หา ๑ » : sept acceptions ; la première glosée par deux verbes de rencontre
  et illustrée par deux exemples dont les compléments sont des personnes
  (ไปหาหมอ, เพื่อนมาหา) ; la deuxième, la visite ; la cinquième décrivant
  l'emploi en composition et donnant exactement six exemples, dont ค้นหา,
  ตามหา et เสาะหา ; les deux dernières explicitement prépositionnelles (บ.).
- « หา ๒ » : mot de sollicitation de réponse, catégorie ว., non enseigné.
- Le RID ne met PAS « chercher » en tête de « หา ๑ ». Le dossier le dit, et
  c'est vrai. Point que l'auditeur ajoute et qui n'est pas un finding parce que
  la leçon l'assume : le sens de recherche n'est donné par le RID qu'à
  l'acception 5, laquelle porte la restriction explicite « parfois employé en
  composition avec d'autres mots ». Le sens enseigné en tête d'item repose donc
  sur VOLUBILIS et Wiktionary, et non sur l'autorité n° 1. La leçon l'écrit.
- « อยาก » : vedette unique, deux acceptions ; la première portant la
  prononciation entre crochets avec point souscrit (หฺยาก) et deux exemples
  dont le complément est chaque fois un VERBE (เป็น, มี) ; la seconde glosée
  faim et soif, portant la mention entre parenthèses « employé pour la
  nourriture » et deux exemples à complément nominal d'aliment et de boisson.
  La brique 1 et la brique 2 du dossier sont donc exactes.
- « ต้องการ » : vedette unique, verbe, définie par exactement trois synonymes
  thaïs dont le premier est อยากได้, sans aucun exemple d'emploi et sans
  étiquette de registre. Exact.
- « ลอง ๑ » : nom, deux acceptions, contenants. « ลอง ๒ » : verbe, trois
  acceptions ; la première illustrée par des exemples de dégustation ; la
  deuxième avec exactement cinq exemples dont trois portent sur des objets
  qu'on essaie sur soi ; la troisième, sonder une attitude. Exact au détail
  près, y compris le décompte de cinq et de trois.
- ลองดู ne figure pas dans la liste des mots dérivés de « ลอง ๒ ». Exact.
- « เอา ๑ » : sept acceptions ; première ยึด, troisième พา/นำ, quatrième
  ต้องการ ; la sixième porte l'étiquette (ปาก) ; la septième est ว. « เอา ๒ »
  est un mot ancien de rang de naissance. Exact.
- Aucune étiquette de registre sur les acceptions de « เอา ๑ » portant les sens
  de prendre et de vouloir, aucune sur « อยาก », aucune sur « ต้องการ ». Le
  point 1 de la section « Le registre, fait cherché puis retiré » est exact, et
  son raisonnement par l'absence informative tient : la source étiquette
  ailleurs et n'étiquette pas ici.
- « ได้ » : vedette unique, six acceptions, la première recevoir ou faire sien.
  Valeur d'auxiliaire aux acceptions 2 et 5, exactement comme l'écrit la
  section SRS. Exact.
- « ดู » : vedette unique, trois acceptions ; la troisième est ว. et décrit
  l'emploi postposé à un verbe, avec exactement deux exemples où ดู suit un
  autre verbe (คิด, ชิม). Exact.
- « ห่า ๑ » : esprit tenu pour responsable des épidémies. « ห่า ๒ » : mesure
  ancienne de pluie. Aucune étiquette de registre. Exact sur l'essentiel, avec
  la réserve du F12.
- « ขอ ๒ » : le fait de demander à quelqu'un qu'il donne la chose voulue. Exact
  sur la définition. La seconde moitié de la même phrase du dossier est fausse,
  voir F2.

### 1.3 Wiktionary, éditions en et th (39 faits)

Accès : `?action=render` sur chaque page, requêtes espacées de 0,9 seconde.
Les deux éditions sont bien traitées par le dossier comme un seul écosystème,
ce qui est conforme au §3 de la politique.

- en:หา : IPA /haː˩˩˦/, Paiboon hǎa, Royal Institute `ha`, en tête « See also »
  renvoyant à ห้า et à ห่า, acception « to seek ; to find ; to search ; to look
  (for) » portant bien ผมหากระเทียมไม่เจอ et ช่วยหาหนังสือเล่มนี้ที, acception
  « to visit ; to see ; to meet » portant exactement deux exemples,
  สวัสดีค่ะ มาหาใครคะ et เธอหาหมอคนนี้เดือนละครั้ง, section « Derived terms »
  contenant ค้นหา, มองหา, เสาะหา, เที่ยวหา, แสวงหา et ซื้อหา. Tout est exact
  sauf un composé, voir F7.
- en:อยาก : IPA /jaːk̚˨˩/, ligne « Phonemic » donnant หฺยาก, Paiboon yàak,
  Royal Institute `yak`, acception explicitement étiquetée « auxiliary » glosée
  « to want to ; to wish to » avec อยากไปยุโรป, acception « to be hungry ; to
  be thirsty » avec อยากอาหาร. Exact. C'est bien l'énoncé le plus explicite du
  dossier sur la construction, comme il le dit.
- en:อยากได้ : IPA /jaːk̚˨˩.daːj˥˩/, Paiboon yàak-dâai, Royal Institute
  `yak-dai`, étymologie อยาก + ได้ avec ได้ glosé « to get », verbe « to
  desire, wish to have ». Exact.
- en:ได้ : IPA /daːj˥˩/, Phonemic ด้าย, Paiboon dâai, Royal Institute `dai`,
  « to get ; to obtain ; to receive » avec อยากได้รางวัลชนะเลิศ. Exact.
- en:ต้องการ : IPA /tɔŋ˥˩.kaːn˧/, Paiboon dtɔ̂ng-gaan, Royal Institute
  `tong-kan`, étymologie ต้อง + การ, ligne « Phonemic » portant
  « {Unorthographical ; Short} » et la resyllabation ต็้อง-กาน, acceptions
  « to need », « to want ; to wish ; to desire », « to require ; to demand »,
  plus « to need to ». Exact, y compris l'annotation de brièveté, qui est le
  seul appui hors VOLUBILIS de la longueur COURTE déclarée par l'item 4.
- Contrôle adversarial de la section « ต้องการ suivi d'un verbe, écarté » :
  l'exemple d'usage ฉันต้องการซื้อตั๋ว existe bien et son complément est le
  verbe ซื้อ ; th:ต้องการ glose bien par quatre synonymes dont le dernier,
  อยากทำ, signifie vouloir faire. Les deux pages appartiennent au même
  écosystème, et le RID ne donne aucun exemple : la décision d'écarter le fait
  est donc correctement motivée. Confirmé.
- en:ลอง : IPA /lɔːŋ˧/, Paiboon lɔɔng, Royal Institute `long`, « to try (to
  make an experiment) » avec ลองเดาดูสิ, « to sample », et « Derived terms »
  contenant ลองดู. Exact.
- en:เอา : IPA /ʔaw˧/, Paiboon ao, Royal Institute `ao`, « to bring ; to take »,
  « to desire ; to want » avec เอานี่ป่ะ et เอาน้ำอะไรคะ, exactement deux
  acceptions étiquetées « slang », « See also » renvoyant à ต้องการ et à อยาก.
  Exact.
- en:อันนี้ : classe « Pronoun », glose « this one, this thing », IPA
  /ʔan˧.niː˦˥/. La classe pronominale invoquée par l'item 8 est donc réelle, et
  l'IPA de l'item 8 concorde au symbole près.
- th:หา : สัทอักษรสากล /haː˩˩˦/, ราชบัณฑิตยสภา `ha`, ไพบูลย์พับบลิชชิง hǎa,
  section คำกริยา reprenant les cinq premières acceptions du RID avec les mêmes
  exemples, et section คำบุพบท séparée pour les deux emplois prépositionnels.
  Exact.
- th:อยาก : mêmes IPA et romanisations, การแบ่งพยางค์ หฺยาก, première acception
  étiquetée อกรรม, seconde étiquetée สกรรม, mêmes exemples que le RID. Exact.
- th:ต้องการ : mêmes IPA et romanisations, annotation
  « ไม่ตามอักขรวิธี ; เสียงสระสั้น », acception unique étiquetée
  « อกรรม, สกรรม ». Exact.
- th:เอา : mêmes IPA et romanisations, mêmes acceptions que le RID, étiquette
  ภาษาปาก posée sur la même acception que lui. Exact.
- th:ลอง : mêmes IPA et romanisations, deux รากศัพท์ correspondant aux deux
  vedettes du RID. Exact.
- th:ได้ : même IPA, mêmes romanisations, การแบ่งพยางค์ ด้าย. Exact.
- Les trois 404 déclarés sont réels au 2026-08-04 :
  `https://en.wiktionary.org/wiki/ลองดู`, `https://th.wiktionary.org/wiki/ลองดู`
  et `https://th.wiktionary.org/wiki/อยากได้`. Absences vérifiées, comme
  l'exige l'amendement v1.2 sur la reproductibilité.

### 1.4 Unicode 17.0 (18 faits)

Fichiers récupérés directement sur `unicode.org/Public/17.0.0/ucd/`.

- En-tête de `IndicPositionalCategory.txt` : `IndicPositionalCategory-17.0.0.txt`,
  daté du 2025-07-29. Le dossier annonce exactement cela, à la minute près
  d'écart près qu'il ne prétend pas donner.
- `0E32..0E33 ; Right` ; `0E40..0E44 ; Visual_Order_Left` ;
  `0E47..0E4E ; Top` ; `0E38..0E3A ; Bottom` ; `0E31 ; Top` ;
  `0E34..0E37 ; Top`. Les quatre faits d'encodage employés à l'écran sont donc
  normativement fondés, y compris la justification de la page 5 sur ได้ et
  celle de l'item 6 sur l'absence d'empilement dans ลองดู.
- Les douze noms normatifs et les douze catégories générales du tableau sont
  exacts sans exception : HO HIP, SARA AA, O ANG, YO YAK, KO KAI, SARA AI
  MAIMALAI, SARA E, DO DEK, MAI THO, MAI HAN-AKAT, SARA II, SARA UU, avec Lo
  pour les huit premières hors marques et Mn pour les quatre marques.

### 1.5 FrequencyWords, signal indicatif (20 faits)

Liste `content/2018/th/th_50k.txt` retéléchargée par l'auditeur.

- **Empreinte identique à celle déclarée** : 1 504 712 octets, SHA-256
  `20e7052f2d64222e1420c5d0b4ed6b68cd6290f0cf8b908d8bc6b0af781b6083`. C'est le
  contrôle le plus fort du dossier : la source citée est bit pour bit celle
  qu'il dit avoir employée.
- Les seize couples rang/occurrences cités sont exacts à l'unité : หา 141 et
  2 417, อยาก 3 902 et 100, อยากได้ 13 339 et 29, อยากจะ 14 277, อยากรู้
  19 520, ได้ 36 et 7 022, ต้องการ 2 894 et 136, ต้องการอะไร 1 737 et 226,
  ลอง 3 847 et 101, ลองดู 3 064 et 129, ลองดูสิ 2 226 et 177, เอา 1 480 et
  263, เอาล่ะ 19, อันนี้ 2 932 et 134, ซื้อ 11 010, et เอาอันนี้ bien absent
  des 50 000 premiers jetons.
- Les trois décomptes de la réserve de méthode sont exacts : 45 jetons
  commencent par อยาก, 224 par เอา, et หายใจ comme หายไป commencent bien par
  หา sans en être des emplois. La réserve elle-même est juste et rare : le
  dossier refuse explicitement de tirer un fait de langue de ces rangs.

### 1.6 Le fichier lui-même (9 faits)

- Les huit séquences `codepoints` déclarées sont exactes, caractère par
  caractère, y compris l'ordre logique de อยากได้ où le ไ précède le ด, et les
  neuf points de code de เอาอันนี้.
- Pour les huit graphies, NFC est identique à la chaîne saisie et identique à
  NFD, ce que le dossier affirme et qui est vrai. Contrôle élargi de
  l'auditeur : les 157 graphies thaïes distinctes du fichier entier sont en
  NFC, sans exception.
- Zéro tiret cadratin et zéro demi-cadratin dans tout le fichier, conforme à
  ADR-0022.

### 1.7 Tons, longueurs et transcriptions recalculés (22 faits)

Recalculés par la règle, sans regarder la valeur déclarée, puis comparés.

- Les huit items : หา haute sans marque, syllabe vivante, MONTANT, longue,
  `hǎa` ; อยาก syllabe morte à voyelle longue, BAS, `yàak` ; ได้ dans อยากได้,
  DESCENDANT, `dâai` ; ต้อง moyenne sous ไม้โท, DESCENDANT, การ moyenne sans
  marque, MOYEN, `tâwng·kaan` ; ลอง basse sans marque, vivante, MOYEN, `lawwng`
  avec `aww` pour /ɔː/ long ; ดู moyenne sans marque, MOYEN, `douu` ; เอา
  MOYEN, bref, `ao` ; อัน moyenne sans marque, MOYEN, นี้ basse sous ไม้โท,
  HAUT, `an·níi`. Les huit champs `ton`, les huit champs `longueur` et les huit
  champs `transcription` concordent avec le calcul et entre eux.
- Placement de la marque de ton conforme à l'amendement v1.1 point 4 dans les
  huit cas : marque sur la première lettre du noyau vocalique.
- Les neuf répliques du dialogue recalculées ton par ton : sà·wàt·dii khráp,
  hǎa à·rai khráp, dì·chǎn yàak·dâai thǒung khâ, an·níi mǎi khráp,
  an·níi thâo·rai khá, hâa·sìp bàat khráp, lawwng douu mǎi khráp, ao an·níi
  khâ, kìi bai khráp, thǒung sǎwwng bai khâ, khàwwp·khoun khâ. Aucune erreur.
- Alternance ค่ะ / คะ correcte à la réplique 4, et particule constante par
  locuteur d'un bout à l'autre, comme annoncé.

### 1.8 Cohérence avec le dépôt (21 faits)

Toutes les leçons citées ont été rouvertes.

- แพง est bien l'item 7 de `u02-l2a`, glosé « cher (d'un prix élevé) ». La
  rectification que le dossier s'inflige à lui-même est donc juste, et elle est
  à son honneur.
- อันนี้ item 5, อันนี้เท่าไรครับ item 6 et ห้าสิบบาท item 7 de `u03-l3c` ;
  ใบ item 3, ถุงสองใบ item 7 et le patron กี่ + classificateur item 8 de
  `u03-l3d` ; ถุง item 8 de `u03-l3a`, transcrit `thǒung` ; ดู item 3 de
  `u07-l7d`, lui-même réemploi de `u01-l1b` item 10 ; ทำงาน item 2 de
  `u07-l7d` ; ห้อง item 2 de `u07-l7a`. Les neuf renvois d'items sont exacts et
  les transcriptions sont reprises sans modification, ce que la leçon promet.
- `srs-u07-l7a-02` porte bien sur la lecture du ton d'un mot écrit et
  `srs-u07-l7a-04` sur la discrimination visuelle de ◌่ et ◌้. Le recouvrement
  déclaré à l'incertitude 7 est réel et correctement décrit.
- Le finding N3 de `u06-l6a` a bien retiré toutes les valeurs `LEV` et `DOM`
  comme preuve. La réserve de portée sur VOLUBILIS est donc conforme au
  précédent qu'elle invoque.
- 6A enseigne bien sept consonnes basses ย ร ล ว ธ ภ ฮ ; 4A enseigne bien neuf
  consonnes hautes dont ห ; les neuf consonnes moyennes viennent de 1A et leur
  règle de ton de 4A. Les trois attributions de classe de la leçon sont justes.
- 2C a bien enseigné ขอ et le patron ขอ … หน่อย, et 4C a bien étendu le patron
  au nombre et au mot de comptage. Les deux renvois, en apparence
  contradictoires, sont tous les deux exacts.
- ผมชื่อ … ครับ est bien une collocation de `u02-l2d`, et son traitement de la
  particule est bien celui que la carte SRS 03 invoque.
- สวัสดี est bien transcrit `sawàtdii` à l'item 1 de `u01-l1e` et `sà·wàt·dii`
  à partir de l'unité 2. L'écart signalé existe, et 8B a raison de ne pas le
  trancher.
- นก est un item publié, `u02-l2e` item 13. Le dialogue n'introduit donc aucun
  mot non publié, ce qu'il affirme.
- **Les neuf cases du tableau de `u07-l7a`, recalculées une par une, sont
  toutes justes** : moyenne rien/moyen, ไม้เอก/bas, ไม้โท/descendant ; haute
  rien/montant, ไม้เอก/bas, ไม้โท/descendant ; basse rien/moyen,
  ไม้เอก/descendant, ไม้โท/haut. Les six mots témoins de 7A sont corrects
  aussi. Aucune case fausse : le tableau complété en 7A tient. C'est ce
  contrôle qui rend le finding F4 démontrable.

## 2. Findings

### F1 (BLOQUANT) : le contraste montant contre descendant n'a jamais été enseigné, et 8B affirme qu'il l'a été

Méta, « Cible phonétique », lignes 61 à 64 :

> Le contraste montant contre descendant a eu son passage dédié en `u01-l1d` ;
> c'est ici un réemploi en situation, pas un troisième enseignement.

`unite-01/lecon-1d.md` est titrée « Leçon 1D. Montant contre haut ». Sa cible
phonétique déclarée est « ton montant /˩˩˦/ contre ton haut /˦˥/ ». Ses dix
items sont หมา, ม้า, ขา, ค้า, หนา, น้า, หนี, นี้, ไหม, ไม้, et son critère de
maîtrise est « en mélange aléatoire montant/haut ». 1D n'oppose à aucun moment
le montant au descendant.

Trois aggravations.

1. **8B se contredit elle-même.** Sa propre carte `srs-u08-l8b-04` écrit, à
   quinze lignes de distance : « `u01-l1d` met en révision le contraste montant
   contre haut, et non montant contre descendant ». Les deux phrases ne peuvent
   pas être vraies ensemble.
2. **L'erreur est un récidive documentée.** `unite-04/lecon-4d.md` porte un
   finding d'audit B2 intitulé « contraste descendant contre montant faussement
   dit travaillé en 1D : CORRIGÉ », qui conclut « Référence fausse retirée après
   relecture de `unite-01/lecon-1d.md` ». La même référence fausse revient dans
   8B, mot pour mot dans son intention.
3. **Le manque pédagogique est déjà déclaré bloquant ailleurs.** L'incertitude
   13 de 4D dit que l'arbitrage sur le volume de travail dû à ce contraste est
   « REQUIS avant `review` », et 4D l'a laissé ouvert. 8B ne cite pas 4D, ne
   mentionne pas cette incertitude, et déclare au contraire « Cible phonétique :
   aucun contraste nouveau ».

Conséquence produit : l'exercice 1 manche A, la carte SRS 04 et la page 3
reposent sur une acquisition qui n'existe pas dans le parcours. La leçon ne
donne au contraste ni page de geste, ni exercice de discrimination dédié, parce
qu'elle le croit acquis.

Correction attendue : retirer la phrase, déclarer l'état exact de 1A, 1C, 1D et
4D, rattacher explicitement 8B à l'incertitude 13 de 4D, et faire arbitrer le
volume de travail avant `review`.

### F2 (BLOQUANT) : référence RID mal citée sur ขอ, et décision éditoriale prise dessus

Section « Items et faits écartés », entrée « ขอ suivi d'un VERBE » :

> Le RID définit « ขอ ๒ » comme le fait de demander à quelqu'un qu'il donne la
> CHOSE voulue, et aucun de ses mots dérivés cités ne montre ขอ devant un verbe
> simple.

La première moitié est exacte. La seconde est fausse. La liste ลูกคำ de
« ขอ ๒ », relevée par l'auditeur le 2026-08-04 sur le même endpoint, contient
ขอยืม, où ยืม est un verbe simple, et aussi ขอร้อง, ของ้อ et ขอเฝ้า. La
formulation « aucun » est un absolu que la source dément immédiatement.

Aggravation : cette phrase est le motif écrit de deux décisions. Elle sert à
écarter la construction ขอ + VERBE, et elle a fait supprimer une réplique du
dialogue (« Une réplique de dialogue construite sur ce moule a été supprimée en
conséquence »). Une décision éditoriale repose donc sur une lecture fausse de
l'autorité n° 1.

L'effet est conservateur, donc l'apprenant n'apprend rien de faux. Le dossier de
preuve, lui, est faux, et l'amendement v1.2 exige qu'un tiers puisse refaire la
consultation : ce tiers trouve le contraire.

### F3 (BLOQUANT) : deux exercices demandent de choisir entre อยากได้ et ต้องการ, que la leçon déclare ne pas départager, et un corrigé pénalise une réponse défendable

« Autres décisions de production » :

> **Pourquoi aucun exercice ne demande de choisir entre อยากได้ et ต้องการ.**
> Parce que la leçon n'enseigne aucune règle qui le permettrait. Un exercice qui
> le demanderait mesurerait une préférence que le dossier n'a pas su établir, et
> pénaliserait une réponse peut-être juste.

Deux exercices le demandent.

- **Exercice 4, tirage 2.** « Je voudrais un sac. » ดิฉัน ___ ถุงค่ะ, réponse
  attendue `yàak·dâai`. Les pièges connus du même exercice écrivent :
  « répondre `tâwng·kaan` au tirage 2, qui n'est pas compté juste parce que la
  phrase française dit l'envie et non le besoin ». C'est exactement le
  départage que la leçon dit refuser, et il est scoré.
- **Exercice 2, paire 4.** « Vous expliquez ce qu'il vous faut. » ↔ ต้องการ,
  face à la paire 3 « Vous dites ce que vous avez envie d'AVOIR. » ↔ อยากได้.
  L'appariement est un pour un : se tromper sur l'une fait perdre l'autre.

La réponse pénalisée est défendable, et c'est le RID qui le dit : sa vedette
« ต้องการ » est définie par trois synonymes dont **le premier est อยากได้**. Le
dictionnaire normatif traite les deux comme équivalents. ดิฉันต้องการถุงค่ะ
pour « Je voudrais un sac » n'a rien de faux.

Aggravation : la carte `srs-u08-l8b-02` déclare « Aucun tirage de cette carte ne
demande de choisir entre อยากได้ et ต้องการ », puis définit son vivier comme
« l'exercice 3 augmenté des tirages 1, 2 et 6 de l'exercice 4 ». Le tirage 2 de
l'exercice 4 est précisément celui qui pénalise `tâwng·kaan`. La carte importe
donc ce qu'elle s'interdit.

Correction attendue : soit retirer le motif de rejet et accepter `tâwng·kaan`
au tirage 2 en le signalant sans le compter faux, soit sourcer la distinction
envie/besoin sur deux jambes indépendantes et l'enseigner avant de la mesurer.
La première voie est la seule que le dossier actuel autorise.

### F4 (BLOQUANT) : « deux graphies seulement se lisent avec le tableau de 7A » est faux, et sert à supprimer la mécanique `reading`

Page 10, texte destiné à l'écran :

> Deux mots du jour se lisent avec le tableau de 7A, sans rien de plus.

Et, en motif de la mécanique écartée :

> Sur huit graphies, deux seulement, ต้องการ et ลอง, se lisent entièrement avec
> le tableau de 7A.

Le tableau de 7A n'a pas deux colonnes mais trois. Sa page 6, « le tableau
entier, neuf cases », donne pour chaque classe le ton sans marque, avec ไม้เอก
et avec ไม้โท, et précise « La première colonne, vous la connaissez depuis 4A et
6A ». L'auditeur a recalculé les neuf cases : elles sont toutes justes.

Avec ce tableau, la leçon compte non pas deux graphies entièrement lisibles mais
au moins quatre :

- ต้องการ : ต้อง moyenne + ไม้โท, การ moyenne sans marque. Lisible.
- ลอง : basse sans marque, syllabe vivante. Lisible.
- **หา : haute sans marque, syllabe vivante, ton montant. Lisible.**
- **ลองดู : ลอง basse sans marque, ดู moyenne sans marque. Lisible.**
- et dans เอาอันนี้, le bloc อันนี้ est lisible aussi (อัน moyenne sans marque,
  นี้ basse + ไม้โท).

Le cas de หา est le plus gênant, parce que la page 3 de la MÊME leçon vient
d'apprendre au lecteur à le lire avec ce tableau : « 7A vous a dit ce qu'il fait
sur une consonne haute : il donne le ton descendant, là où l'absence de marque
donne le ton montant ». La page 10 lui dit ensuite, implicitement, que หา n'en
fait pas partie. Les deux pages se contredisent à l'écran.

Aggravation : ce décompte faux est l'unique justification du retrait de la
mécanique `reading`, laquelle est l'une des cinq mécaniques canoniques exigées
par le brief. L'argument « un exercice de lecture à deux tirages utiles
mesurerait 7A et non 8B » ne tient plus à quatre tirages, dont un, หา, est le
mot-cible de la leçon.

### F5 (BLOQUANT) : traduction littérale non sourcée dans la note culturelle

Note culturelle, texte destiné à l'écran :

> C'est aussi pour cela que le vendeur vous demande หาอะไร, littéralement
> « vers quoi allez-vous », plutôt qu'une formule de service.

Aucune source ne donne cette glose littérale. L'auditeur a recontrôlé les trois
sources de la note :

- le RID donne bien deux acceptions prépositionnelles à « หา ๑ », mais ce sont
  les acceptions 6 et 7, explicitement étiquetées บ., et elles ne concernent pas
  l'emploi verbal de หาอะไร ;
- en:หา sépare de la même façon une section Verb et une section Preposition ;
- VOLUBILIS ligne 14519 donne la visite, pas un directionnel.

Souder l'emploi prépositionnel sur l'emploi verbal produit une étymologie
populaire, affichée à l'apprenant comme un fait. L'item 1 n'a d'ailleurs aucun
champ `litteral`, ce qui rend la glose orpheline.

Le §7 de `CONVENTIONS.md` exige que chaque fait d'une note culturelle soit
sourcé. Le bloc de sources de cette note ne couvre que deux faits, « หา désigne
aussi le fait d'aller voir une personne » et « หา entre dans une famille de
composés ». La glose littérale n'y figure pas.

Second point de la même note, plus discutable mais du même ordre : « Retenez
seulement que หา n'est pas un verbe de constat mais un verbe d'effort »
généralise à la forme nue l'acception 5 du RID, dont le texte restreint
explicitement la valeur d'effort à l'emploi en composition avec d'autres mots.

### F6 (BLOQUANT) : référence RID mal citée sur เอา, dans la preuve du patron central

Item 8, bloc « Attestation du moule verbe + อันนี้ » :

> Le RID atteste par ailleurs เอา suivi d'un complément direct dans les exemples
> de ses première et troisième acceptions.

Recontrôle : l'unique exemple de la première acception de « เอา ๑ » est
เอาไว้อยู่, où ไว้ et อยู่ sont postverbaux et où il n'y a aucun complément
nominal. La troisième acception, elle, donne bien เอาตัวมา, avec un complément
direct.

Le fait visé est vrai, et le dossier aurait pu le prouver sans effort : les
acceptions 4 et 5 fournissent เอาชื่อ, เอาหน้า et เอาถ้อยคำ. C'est la citation
qui est fausse, sur la moitié de ce qu'elle avance, dans le bloc de preuve du
patron le plus important de la leçon.

### F7 (BLOQUANT) : composé cité comme présent chez Wiktionary alors qu'il en est absent

Note culturelle, sources du fait « หา entre dans une famille de composés » :

> en.wiktionary, entrée « หา », section « Derived terms » : la liste porte
> plusieurs dizaines de composés en หา, dont ค้นหา, ตามหา, มองหา et เสาะหา.

Relevé de l'auditeur sur la page rendue le 2026-08-04 : ค้นหา présent, มองหา
présent, เสาะหา présent, **ตามหา ABSENT**. Sont également absents สืบหา, que le
dossier ne cite pas.

Le fait général survit, puisque trois des quatre composés cités sont là et que
le RID en donne six. Mais la citation nomme quatre éléments et l'un n'existe
pas dans la source nommée. ตามหา figure bien dans le RID, à l'acception 5 ; il a
vraisemblablement été reporté d'une source sur l'autre sans contrôle. C'est
exactement le type d'erreur que l'amendement v1.2 vise.

### F8 (non bloquant) : `ao` est ratifié dans `CONVENTIONS.md`, et la leçon s'invente un blocage

Méta :

> Deux graphèmes non ratifiés dans `CONVENTIONS.md` sont repris tels quels de
> leçons antérieures [...] `aai` pour /aːj/ [...] et `ao` pour la diphtongue
> /aw/ [...] Leur ratification reste une porte de sortie vers `review`.

`CONVENTIONS.md`, amendement v1.1, point 3, dit en toutes lettres :
« **Diphtongues** : `ai` pour /aj/, `ao` pour /aw/ diphtongue ». `ao` est donc
ratifié, et c'est précisément la forme que 8B emploie pour เอา.

Seul `aai` est réellement non ratifié, la règle de longueur v1.1 point 2
donnant `aii` par doublement de la dernière lettre. L'incertitude 6 crée donc un
demi-blocage inexistant vers `review`, et le lot de contre-audit externe partira
avec une consigne fausse.

### F9 (non bloquant) : la politique de saisie de l'exercice 4 se contredit et affaiblit ce qu'elle mesure

Exercice 4, « Politique de saisie » :

> L'accent de ton est OBLIGATOIRE et non tolérant, comme en 7A : c'est lui qui
> sépare `hǎa` de `hâa` [...] Le point médian est ignoré, une saisie
> `yaak dâai` étant acceptée pour `yàak·dâai` dès lors que les accents sont
> corrects.

La saisie donnée en exemple d'acceptation, `yaak dâai`, est dépourvue de
l'accent obligatoire sur la première syllabe. Les pièges connus du même exercice
écrivent la même chose correctement, `yàak dâai`. Un implémenteur qui suit la
politique à la lettre acceptera une réponse sans accent, ce qui vide le seul
mécanisme dont l'exercice dispose pour séparer `hǎa` de `hâa`, et qui contredit
le retour d'erreur « L'accent manque ».

### F10 (non bloquant) : affirmations sur le français hors du cadre de la section 1 bis

La section 1 bis n'autorise un fait sur le français que sourcé par deux jambes
indépendantes, ou reformulé en observation vérifiable par l'apprenant, et elle
proscrit les absolus non vérifiables. Trois énoncés ne passent ni l'une ni
l'autre porte.

- Exercice 3, pièges connus : « placer le complément avant le verbe, par calque
  d'un **ordre français** qui n'existe pas ici ». Le français place son
  complément d'objet APRÈS le verbe, comme le thaï. Il n'existe pas d'ordre
  français à calquer qui produirait l'erreur décrite, hors clitiques, absents de
  tous les tirages. L'énoncé est à la fois non sourcé et douteux.
- Item 5 : « Le mot couvre deux gestes que **le français sépare mal**. » Fait de
  sémantique française, non sourcé, non reformulé en observation.
- Note culturelle, à l'écran : « Un même verbe thaï dit deux choses que **le
  français sépare**. » Même statut, et cette fois devant l'apprenant.

Le reste de la leçon est en revanche exemplaire sur ce point : la note de
l'item 2 dit « au mieux, une phrase que les sources ne soutiennent pas » plutôt
que d'affirmer un absolu, et aucune promesse de performance n'apparaît nulle
part.

### F11 (non bloquant) : deux défauts de spécification des exercices

- **Exercice 1, manche A.** La règle annoncée est « jamais deux fois de suite la
  même cible ». La suite de référence donnée juste en dessous est หา, ห้า, ห้า,
  หา, ห้า, หา : les tirages 2 et 3 ont la même cible. Le tirage de référence
  viole la contrainte qu'il illustre. Le plancher de stratégie constante, lui,
  est juste : 3 sur 6 en manche A, 1 sur 4 en manche B, 4 sur 10 au total contre
  un seuil de 8, et aucune réponse constante n'approche le seuil. Vérifié.
- **Exercice 2.** Le seuil est « 5 paires justes sur 6 » avec une correspondance
  « strictement un pour un ». Dans un appariement bijectif à six paires, un score
  de 5 est impossible : la sixième est forcée. Le seuil annoncé est en réalité
  6 sur 6, ce qui n'est pas ce que la Méta promet à l'apprenant.

Les planchers des exercices 3 et 4 ont été recalculés et sont exacts : aucune
réponse constante n'atteint 3 sur 4 ni 4 sur 6, et `yàak`, la réponse la plus
fréquente de l'exercice 4, plafonne bien à 2 sur 6.

### F12 (non bloquant) : renvois internes faux et décomptes d'audit non recomputables

Aucun de ces points n'atteint l'apprenant, mais tous dégradent un dossier qui se
présente comme reproductible.

- **Prérequis** : ไหม est dite « employée à la réplique 3 et à la réplique 5 du
  dialogue ». C'est aux répliques 3 et 6, ce que disent correctement la note de
  la réplique 6 et le tableau des reprises. La réplique 5 est ห้าสิบบาทครับ.
- **Prix du dialogue** : la note de la réplique 5 dit que le prix fait entendre
  hâa « quatre répliques après le hǎa de la réplique 1 », ce qui est exact ; les
  « Autres décisions de production » disent « deux répliques après ».
- **Décompte RID** : « 14 graphies distinctes interrogées en 21 requêtes »,
  présenté comme « recomputable depuis les listes ci-dessous ». Les listes
  totalisent bien 14 graphies, mais elles omettent เอาอันนี้, dont l'item 8
  écrit pourtant « RID, requête du 2026-08-04 : aucune entrée ». Par ailleurs le
  passage de contrôle porte sur huit graphies et l'écart annoncé suppose sept
  doublons, combinaison qui ne se reconstitue pas.
- **Décompte Wiktionary** : « dix pages en anglais et neuf en thaï », pour neuf
  graphies nommées plus ห่า. `https://en.wiktionary.org/wiki/อันนี้` n'y figure
  pas, alors que l'item 8 la cite comme un relevé du 2026-08-04. La page existe
  et dit bien ce qu'on lui fait dire, mais elle n'est pas dans le compte.
- **Item 1, source VOLUBILIS** : la feuille est citée « `sheet1` », alors que
  l'amendement v1.2 donne pour forme de référence la feuille `Volubilis`. Le
  reste du dossier ne nomme aucune feuille. Harmoniser.
- **Tableau des reprises** : นก, employé neuf fois à l'écran comme locutrice,
  n'y figure pas, alors que le tableau se dit exhaustif des reprises citées à
  l'écran. L'item existe bien (`u02-l2e`, item 13), le renvoi manque.
- **Objectif observable** : il annonce un choix « parmi หา, อยาก, อยากได้,
  ต้องการ, **ลอง** et เอา », mais la carte 5 de l'exercice 2 est ลองดู, pas ลอง.

Point connexe, signalé sans être compté comme finding parce que la leçon déclare
déjà une réserve voisine : l'exercice 4, tirage 5, attend `lawwng douu` pour
« J'essaie, pour voir. », soit ลองดูค่ะ à la première personne. L'incertitude 3
ne couvre que l'emploi absolu de la réplique 6 du dialogue. Les deux formes
attestées par les sources du dossier sont l'impératif ลองดูสิ et l'interrogatif
ลองดูไหมครับ ; la déclarative en ค่ะ n'est attestée nulle part. À verser à
l'incertitude 3 plutôt qu'à laisser hors périmètre.

## 3. Ce que l'audit CONFIRME, sans réserve

Il faut le dire aussi nettement que les findings, parce que c'est rare.

- **L'empreinte SHA-256 de la liste de fréquence est exacte au bit près**, et
  les vingt faits de fréquence qui en dépendent sont exacts à l'unité. Un
  dossier qui donne une empreinte vérifiable et qui la tient est une exception.
- **Les huit séquences de codepoints sont exactes**, les 157 graphies thaïes du
  fichier sont en NFC, et les dix-huit faits Unicode, en-tête de fichier daté
  compris, sont conformes à Unicode 17.0.
- **Les onze présences et trois absences RID sont exactes**, y compris les
  absences, qui sont le genre de fait qu'un dossier négligent invente.
- **Les vingt-six faits de structure des entrées RID sont exacts**, jusqu'aux
  décomptes fins : sept acceptions pour หา ๑, six exemples à l'acception 5,
  cinq exemples dont trois vêtements à ลอง ๒ acception 2, trois synonymes pour
  ต้องการ. L'auditeur cherchait un décompte gonflé et n'en a trouvé aucun.
- **Les trois 404 Wiktionary sont réels.** Déclarer une absence vérifiée est
  plus coûteux que de l'omettre, et le dossier l'a fait trois fois.
- **Les deux faits retirés l'ont été à raison.** La différence de registre entre
  อยาก, ต้องการ et เอา n'est étiquetée par aucune des deux sources qui
  étiquettent ailleurs, l'auditeur l'a vérifié entrée par entrée. Et la
  construction ต้องการ + VERBE repose bien sur le seul écosystème Wiktionary,
  le RID ne donnant aucun exemple. Refuser d'enseigner ces deux faits est la
  bonne décision, prise pour le bon motif.
- **Le tableau des neuf cases de 7A est juste, case par case.** La priorité de
  la consigne visait ce point : aucune case n'est fausse, et les trois mots de
  8B qui s'y appuient (ต้อง, การ, ลอง) y sont correctement placés. Ce qui est
  faux, c'est le décompte de ce que le tableau couvre, pas le tableau.
- **Les vingt-deux tons, longueurs et transcriptions recalculés concordent**,
  items et dialogue confondus, y compris le placement v1.1 de la marque de ton.
- **Aucun corrigé réel ne fuite dans un champ destiné à l'apprenant**, et ห่า,
  mot grossier correctement identifié comme tel par deux sources, est
  effectivement absent de tout écran et de tout tirage.

## 4. Verdict

**`draft` maintenu. Passage à `review` refusé.**

Sept findings bloquants. F1 est le plus grave : il n'est pas une erreur de
citation mais un trou pédagogique, il récidive une erreur déjà corrigée en 4D,
et 8B se contredit elle-même à son sujet. F3 et F4 touchent l'écran et les
corrigés. F2, F5, F6 et F7 sont des références mal citées ou non sourcées, dont
trois portent sur l'autorité n° 1 et une sur une note culturelle affichée.

Ordre de traitement recommandé :

1. F1, avec arbitrage explicite rattaché à l'incertitude 13 de `u04-l4d` ;
2. F3, en cessant de scorer un départage que le dossier refuse d'établir ;
3. F4, avec réexamen de la mécanique `reading` une fois le décompte corrigé ;
4. F5, F2, F6, F7, recitations et suppressions ;
5. F8 à F12, qui sont des corrections de texte et d'arithmétique.

Le lot de contre-audit externe pour `GPT-5.6 SOL ULTRA` devra être élargi : il
ne vise aujourd'hui que les deux faits retirés, qui sont précisément les deux
points que cet audit confirme comme bien traités. Les cibles utiles sont F1,
F3 et F4.

Revue native : en attente, et les incertitudes 1, 2 et 3 restent les bonnes
premières questions à lui poser.
