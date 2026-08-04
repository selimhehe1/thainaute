# Scripts de vérification du contenu

Ces scripts existent pour une seule raison : rendre **reproductible** ce
qu'un dossier de leçon affirme, comme l'exige l'amendement v1.2 des
conventions d'autorat. Un chiffre qu'un tiers ne peut pas recalculer n'a
pas sa place dans un dossier de preuve.

## Outils permanents

- `rid-lookup.mjs` : présence d'une graphie au dictionnaire royal.
- `rid-entry.mjs` : corps d'une entrée, indispensable dès qu'on affirme un
  registre ou une région, la présence seule ne suffisant jamais.
- `volubilis-lookup.mjs` : numéro de ligne à citer dans le classeur
  Volubilis, avec empreinte du fichier.
- `volubilis-codes.mjs`, `volubilis-lookup-full.mjs` : lecture des feuilles
  annexes et des cellules complètes.
- `repo-thai-scan.mjs` : décompte des graphies publiées, par unité.
- `unicode-thai.mjs`, `unicode-stack-scan.mjs` : conformité NFC et signes
  empilés.
- `item-fields-check.mjs`, `item-fields-fr-check.mjs` : un item réemployé
  est-il décrit exactement comme sa leçon d'origine le publie.
- `table-des-tons.mjs`, `lecture-corpus.mjs` : mesures transverses.

## Scripts `tmp-*`

Écrits par une consolidation pour établir un chiffre précis, puis **cités
par le dossier de la leçon**. Ils sont versionnés pour cette raison, et
leur nom ne change pas : le renommer casserait la citation qu'ils servent
à rendre vérifiable.

Ils ne sont pas maintenus et peuvent devenir faux si le contenu change.
Ils prouvent ce qui a été mesuré à une date, rien d'autre.
