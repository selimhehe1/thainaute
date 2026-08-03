# Recoupement VOLUBILIS : unité 3

- Date : 3 août 2026
- Périmètre à ce jour : **leçon 3B uniquement**. Les leçons 3A, 3C, 3D et 3E
  devront ajouter leurs propres lignes à ce fichier avant leur consolidation.
- Motif de création : finding M3 du contre-audit `unite-03/verification-3b.md`,
  lui-même rappel du finding B1 de `unite-02/verification-2b.md`. Les citations
  VOLUBILIS de la leçon 3B portaient une date mais aucun numéro d’entrée et
  aucun artefact reproductible, ce qui aurait fait retomber l’item 4 tout entier
  sur le seul écosystème Wikimedia : le RID 2554 n’a aucune entrée numérale pour
  les sept dizaines, ni pour สิบสอง, ni pour ยี่สิบห้า.

## Source et méthode

- Base : VOLUBILIS Database v26.2, licence CC BY-SA 4.0.
- Fichier : `VOLUBILIS.ods`, téléchargé le 2026-08-03 depuis le projet
  SourceForge officiel `belisan`,
  https://sourceforge.net/projects/belisan/files/VOLUBILIS.ods
- Contrôles d’identité effectués le 2026-08-03 sur le contenu décompressé, et
  non sur la seule foi du nom de fichier :
  - `meta.xml` : `dc:date` = `2026-07-01T09:56:28`, `meta:generator` =
    `LibreOffice/26.2.3.2$Windows_X86_64`, `meta:document-statistic`
    `table-count="3"`, `cell-count="1284481"` ;
  - `content.xml` extrait de l’archive : 379 601 910 octets ;
  - feuilles présentes : `Volubilis`, `Codes`, `Romanization` ;
  - ligne 1 de la feuille `Volubilis`, en-tête : `ThaiRom`, `EasyThai`,
    `ThaiPhon`, `Etymo`, `THA`, `ENG`, `FRA`, `LEV`, `TYPE`, `USAGE`, `DOM`,
    `KEY`, `SCIENT_ABBREV`, `NOTE`, `SYLLAB`, `CLASSIF`, `SYN`, `ANT`, `MUNDO`,
    puis les colonnes `LANG_*` ;
  - feuille `Volubilis` : 118 924 lignes au total, dont 118 884 non vides.
- Extraction : parseur SAX écrit pour ce recoupement
  (`consol3b_vol.py`, expat en flux sur `content.xml`), avec expansion explicite
  de `table:number-columns-repeated` et de `table:number-rows-repeated`, sans
  aucune normalisation Unicode appliquée aux chaînes comparées. Le numéro de
  ligne indiqué ci-dessous est le numéro de ligne de la feuille `Volubilis`,
  en-tête comprise ; il sert d’identifiant d’entrée reproductible.
- Double passe de contrôle : une passe en correspondance exacte sur la colonne
  `THA`, une passe tolérante aux espaces de bord. Les deux passes donnent le
  même verdict de présence et d’absence pour les 41 graphies, à une exception
  documentée plus bas (ศูนย์). Les 12 absences sont donc des absences réelles,
  pas des artefacts d’espace parasite.

### Avertissement de numérotation, à lire avant toute comparaison

**Les numéros de ligne de ce fichier ne sont pas comparables à ceux de
`unite-02/verification-volubilis.md`.** Les deux unités n’ont pas recoupé le
même fichier :

|                      | unité 2                   | unité 3               |
| -------------------- | ------------------------- | --------------------- |
| Fichier              | `VOLUBILIS Database.xlsx` | `VOLUBILIS.ods`       |
| Lignes de la feuille | 114 579 (2 d’en-tête)     | 118 924 (1 d’en-tête) |
| Colonne 7            | `TYPE`                    | `LEV`                 |
| Colonne 8            | `USAGE`                   | `TYPE`                |

Les deux exports portent la même version annoncée, v26.2 de juillet 2026, mais
ils ne contiennent ni le même nombre de lignes ni les mêmes colonnes. Une
même graphie n’y porte donc pas le même numéro. Vérifié sur trois lignes de
contrôle : `28945` désigne ค่ะ dans le `.xlsx` de l’unité 2 et un tout autre
mot dans le `.ods` de l’unité 3. À la consolidation de l’unité 3, décider
d’un fichier de référence unique pour tout le curriculum.

### Usage et licence

Consultation de vérification uniquement. La base n’est ni redistribuée ni
copiée dans le produit ; seuls des extraits courts de colonnes sont reproduits
ici, avec attribution, comme preuve de recoupement. Les colonnes citées sont
reproduites caractère pour caractère, apostrophes droites de la source
comprises ; les espaces insécables de la source sont rendus par une espace
ordinaire, et la barre verticale par une barre oblique, pour la seule raison
que ce tableau est en Markdown. La règle Thaïnaute d’apostrophe typographique
s’applique à la prose du produit, pas à la citation d’une source.

## Lignes citées par la leçon 3B

29 graphies trouvées, 43 lignes.

| Ligne  | THA        | ThaiRom   | ThaiPhon      | LEV  | TYPE     | DOM                                                       | FRA (colonne brute)                               | ENG (colonne brute)                                          |
| ------ | ---------- | --------- | ------------- | ---- | -------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| 4656   | บาท        | bāt       | `_bāt`        | A0 B | n.       | ASEAN ; COMM ; ECONO ; INSOLITE ; TOURIST ; VOGUE ; (THA) | baht [m] ; ฿                                      | baht ; ฿                                                     |
| 4657   | บาท        | bāt       | `_bāt`        | U    | n.       |                                                           | pied [m]                                          | foot                                                         |
| 4658   | บาท        | bāt       | `_bāt`        | X    | n.       |                                                           | strophe [f] ; couplet [m]                         | line of verse ; canto ; stanza                               |
| 4659   | บาท        | bāt       | `_bāt`        | A1 B | n.       | TERRA (mineral) ; TOURIST ; UNIT                          | baht [m] (unité de poids équivalant à 15 grammes) | baht (unit of weight equal to 15 grams)                      |
| 13395  | เอ็ด       | et        | `_et`         | S    | v.       | RID                                                       | crier ; faire du vacarme                          | scold ; blame ; reproach ; yell at                           |
| 13396  | เอ็ด       | et        | `_et`         | S    | adj.     |                                                           | bruyant                                           | noisy ; boisterous                                           |
| 15033  | ห้า        | hā        | `\hā`         | A1 B | num.     | NUM                                                       | cinq                                              | five                                                         |
| 15789  | ห้าสิบ     | hā-sip    | `\hā_sip`     | A1 B | num.     | NUM                                                       | cinquante                                         | fifty                                                        |
| 16554  | หก         | hok       | `_hok`        | A1 B | n.       | NUM ; RID                                                 | six                                               | six                                                          |
| 16555  | หก         | hok       | `_hok`        | U    | n.       | RID                                                       | Loriculus                                         | Loriculus                                                    |
| 16556  | หก         | hok       | `_hok`        | S    | v.       | RID                                                       | se renverser ; se répandre                        | spill ; fall ; splatter                                      |
| 16605  | หกสิบ      | hok-sip   | `_hok_sip`    | A1 B | num.     | NUM                                                       | soixante                                          | sixty                                                        |
| 20219  | เจ็ด       | jet       | `_jet`        | A1 B | num.     | NUM                                                       | sept                                              | seven                                                        |
| 20246  | เจ็ดสิบ    | jet-sip   | `_jet_sip`    | A1 B | num.     | NUM                                                       | soixante-dix [m] ; septante (Belg., Sui.)         | seventy                                                      |
| 29048  | เก้า       | kāo       | `\kāo`        | A1 B | num.     | NUM ; RID                                                 | neuf                                              | nine                                                         |
| 29140  | เก้าสิบ    | kāo-sip   | `\kāo_sip`    | A1 B | num.     |                                                           | quatre-vingt-dix [m] ; nonante (Belg., Sui.)      | ninety                                                       |
| 63029  | หนึ่ง      | neung     | `_neung`      | A1 B | art.     |                                                           | un ; une                                          | a ; an ; one                                                 |
| 63030  | หนึ่ง      | neung     | `_neung`      | A1 B | num.     |                                                           | un                                                | one                                                          |
| 63052  | หนึ่งร้อย  | neung røi | `_neung ¯røi` | I    | num.     |                                                           | cent [m] ; 100                                    | one hundred ; 100                                            |
| 67975  | แปด        | paēt      | `_paēt`       | A1 B | num.     |                                                           | huit                                              | eight                                                        |
| 67982  | แปดสิบ     | paēt-sip  | `_paēt_sip`   | A1 B | num.     |                                                           | quatre-vingt [m] ; octante (Sui.)                 | eighty                                                       |
| 86074  | ร้อย       | røi       | `¯røi`        | A0 B | n.       | RID                                                       | cent                                              | hundred                                                      |
| 86075  | ร้อย       | røi       | `¯røi`        | U    | n.       | MILIT ; RID                                               | officier subalterne [m]                           |                                                              |
| 86076  | ร้อย       | røi       | `¯røi`        | U    | v.       | RID                                                       | enfiler                                           | string together ; thread ; cord ; embroider ; weave ; insert |
| 86086  | ร้อยเอ็ด   | røi-et    | `¯røi_et`     | M    | num.     |                                                           | cent un                                           | hundred one ; one hundred and one                            |
| 86087  | ร้อยเอ็ด   | Røi Et    | `¯Røi _Et`    | I    | n. prop. | GEOG (province) ; TOURIST ; (THA)                         | Roi Et                                            | Roi Et                                                       |
| 89867  | สาม        | sām       | `/sām`        | A1 B | num.     |                                                           | trois                                             | three                                                        |
| 90742  | สามสิบ     | sāmsip    | `/sām_sip`    | A1 B | num.     |                                                           | trente                                            | thirty                                                       |
| 94960  | สี่        | sī        | `_sī`         | A1 B | num.     |                                                           | quatre                                            | four                                                         |
| 96037  | สิบ        | sip       | `_sip`        | A1 B | num.     | RID                                                       | dix                                               | ten                                                          |
| 96038  | สิบ        | sip       | `_sip`        | U    | n.       | RID                                                       | [grade de l'armée de terre ou de la police]       |                                                              |
| 96039  | สิบ        | sip       | `_sip`        | U    | n.       |                                                           | dizaine [f]                                       |                                                              |
| 96048  | สิบเอ็ด    | sip-et    | `_sip _et`    | A1 B | num.     |                                                           | onze                                              | eleven                                                       |
| 96096  | สิบสอง     | sip-søng  | `_sip/søng`   | A1 B | num.     |                                                           | douze                                             | twelve                                                       |
| 96206  | สี่สิบ     | si-sip    | `_sī_sip`     | A1 B | num.     |                                                           | quarante                                          | forty                                                        |
| 97075  | สอง        | søng      | `/søng`       | A1 B | num.     |                                                           | deux                                              | two                                                          |
| 98264  | ศูนย์      | sūn       | `/sūn`        | A1 B | num.     | SCIENTIA (math)                                           | zéro [m]                                          | zero ; nought ; nil ; cipher                                 |
| 98265  | ศูนย์      | sūn       | `/sūn`        | A0 B | n.       |                                                           | centre [m] ; foyer [m]                            | centre ; center (Am.) ; heart ; core                         |
| 98266  | ศูนย์      | sūn       | `/sūn`        | U    | n.       |                                                           | centre [m] ; complexe [m]                         | centre ; center (Am) ; complex                               |
| 116882 | ยี่        | yī        | `\yī`         | U    | num.     | RID                                                       | deux ; deuxième                                   | two ; second                                                 |
| 117279 | ยี่สิบ     | yīsip     | `\yī_sip`     | A1 B | num.     | NUM ; RID                                                 | vingt                                             | twenty                                                       |
| 117280 | ยี่สิบเอ็ด | yīsip-et  | `\yī_sip_et`  | A1 B | num.     | NUM                                                       | vingt-et-un                                       | twenty-one                                                   |
| 117282 | ยี่สิบห้า  | yīsip-hā  | `\yī_sip\hā`  | A1 B | num.     | NUM                                                       | vingt-cinq                                        | twenty-five                                                  |

### Note sur ศูนย์

En correspondance exacte, ศูนย์ donne trois lignes, 98264 à 98266. En
correspondance tolérante aux espaces de bord, deux lignes s’ajoutent, 98267
(`ศูนย์ `, `campus [m]`, `n.`) et 98268 (`ศูนย์ `, `nul`, `adj.`), dont la
cellule `THA` porte une espace finale. Aucune des deux ne concerne le sens
numéral enseigné par la leçon. Le contre-audit `verification-3b.md` annonçait
« ศูนย์ 98264 à 98268 » sans signaler cette différence de règle de
correspondance : la plage exacte retenue ici est **98264 à 98266**.

## Absences constatées

12 graphies interrogées et absentes de la colonne `THA`, en correspondance
exacte comme en correspondance tolérante aux espaces :

สองสิบ, สิบหนึ่ง, หนึ่งสิบ, ยี่สิบหนึ่ง, สองร้อย, หนึ่งร้อยเอ็ด, เก้าสิบเก้า,
สามสิบห้า, สี่สิบห้า, ๐, ๑ et ๒.

Ces absences ne sont pas des anomalies. Les six premières sont des formes
librement composées ou fautives ; VOLUBILIS n’indexe pas les chiffres thaïs. La
leçon ne s’en sert qu’en appui de sources positives, jamais comme preuve
autonome. Le total 29 présences plus 12 absences donne bien les 41 graphies
confrontées pour la leçon 3B.

## Réserve d’indépendance : les lignes marquées `DOM = RID`

Constat de ce recoupement, non relevé par le contre-audit : VOLUBILIS documente
la provenance de ses entrées dans la colonne `DOM`, et 19 644 de ses lignes y
portent la mention `RID`. Parmi les lignes citées par la leçon 3B, sept
graphies sont concernées : เอ็ด (13395), หก (16554 à 16556), เก้า (29048),
ร้อย (86074 à 86076), สิบ (96037 et 96038), ยี่ (116882) et ยี่สิบ (117279).

Conséquence à consigner : **pour ces graphies, VOLUBILIS ne peut pas être
comptée comme une autorité pleinement indépendante du RID 2554.** Aucun fait
enseigné en 3B ne tombe pour autant sous le seuil de deux sources
indépendantes, puisque chacune de ces formes est aussi attestée par les deux
éditions de Wiktionary, écosystème distinct des deux précédents. Les formes qui
fondent l’item 4 et l’item 6, les sept dizaines ainsi que สิบเอ็ด, ยี่สิบเอ็ด,
สิบสอง et ยี่สิบห้า, ne portent aucune mention `RID` : leur recoupement hors
Wikimedia tient entièrement.

Ce point est repris à l’incertitude 11 de `unite-03/lecon-3b.md`.

## Ce que ce fichier ne prouve pas

- Il ne prouve pas l’exactitude linguistique de VOLUBILIS, seulement le contenu
  exact de ses cellules à la date indiquée.
- Il ne remplace pas la contre-vérification manuelle du RID 2554, qui garde la
  primauté en orthographe et reste une porte manuelle avant `review`.
- L’URL SourceForge n’a pas pu être réinterrogée depuis cette session : elle
  répond `HTTP 403` à un agent utilisateur scripté, ce qui est un blocage
  anti-robot et non une preuve d’absence. L’identité du fichier repose donc sur
  les contrôles de `meta.xml`, d’en-tête et de contenu listés plus haut.
