# Ce que coûte chaque unité avant publication

Document GÉNÉRÉ par `scripts/content/etat-des-unites.mjs`, depuis les
bloqueurs réellement rendus par `getPublicationBlockers`. Le régénérer
après toute modification de contenu.

« Signature suffit » compte les leçons dont TOUS les bloqueurs restants
sont ceux qu'une signature humaine lève. Les deux autres colonnes nomment
les dépendances qu'aucune signature ne lève : une voix à produire, et la
décision juridique sur les trois booléens du dictionnaire royal.

| Unité     | Leçons | Signature suffit | Voix manquante | Dépend du RID |
| --------- | -----: | ---------------: | -------------: | ------------: |
| 01        |      6 |                6 |              0 |             0 |
| 02        |      5 |                5 |              0 |             0 |
| 03        |      5 |                4 |              1 |             0 |
| 04        |      5 |                4 |              1 |             0 |
| 05        |      5 |                4 |              1 |             0 |
| 06        |      5 |                5 |              0 |             0 |
| 07        |      5 |                4 |              1 |             0 |
| 08        |      5 |                3 |              2 |             0 |
| 09        |      5 |                5 |              0 |             0 |
| 10        |      5 |                5 |              0 |             0 |
| 11        |      5 |                5 |              0 |             0 |
| 12        |      5 |                5 |              0 |             0 |
| 13        |      5 |                5 |              0 |             0 |
| **total** | **66** |           **60** |                |               |

## Ce que le tableau dit

**Plus aucune leçon ne dépend de la décision juridique sur le
dictionnaire royal.** Elle a été prise le 13 août 2026 et tracée par
l'ADR-0043 ; les trois booléens de `RID-2554` autorisent la
vérification d'une graphie et sa citation par référence, jamais la
reproduction d'une définition.

6 leçons attendent une voix, et 60
sont publiables dès qu'une signature les couvre.

Ce nombre ne dit pas qu'elles sont prêtes. Il dit ce qui reste à faire
pour les publier, pas ce qu'elles valent : une leçon peut franchir
toutes ces portes en n'ayant qu'un seul exercice jouable. Mesurer ce
point demande `node scripts/content/mesurer-extraction-exercices.mjs`.

La revue par un locuteur natif reste en attente sur tout le corpus, et
aucune signature ne peut en tenir lieu.
