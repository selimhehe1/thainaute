# ADR-0043 : le dictionnaire royal cesse de bloquer la publication

- Statut : accepté
- Date : 13 août 2026
- Décideur : Selim Aloui, fondateur
- Concerne : politique de sources, portes de publication, tout le curriculum
- Prolonge l'amendement du 4 août 2026 de
  [docs/content-policy/sources-verification.md](../content-policy/sources-verification.md)

## Contexte

`content/sources-registry.json` portait `commercialUse`, `redistribution` et
`publicationAuthorized` à `false` pour `RID-2554`, le dictionnaire de
l'Office of the Royal Society. Ce n'était pas un oubli : le registre est
conservateur par construction, et ne porte `true` que là où la politique de
sources l'affirme explicitement.

La conséquence était mesurable. `pnpm content:audit` renvoyait **430
bloqueurs actifs sur 66 paquets**, dont **183 dus à ces trois booléens
seuls**, répartis sur **61 leçons sur 66**. L'unité 1 y échappait parce que
ses items citent Volubilis et Wiktionary ; sa leçon `1e`, qui cite le RID, en
avait été exclue au moment de la signature pour cette raison exacte.

Autrement dit, tout le curriculum écrit était retenu par une question à
laquelle aucune ligne de code ne pouvait répondre.

### Ce que le 4 août avait établi

Deux documents officiels du site, jusque-là non lus parce que leur contenu
est en images, répondaient à la question mieux qu'une page de conditions :

1. `notification.php`, image `notification_royin/image2/3.jpg` :
   ประกาศสำนักนายกรัฐมนตรี เรื่อง ระเบียบการใช้ตัวสะกด, annonce du cabinet
   du Premier ministre publiée au Ratchakitchanubeksa (Journal officiel),
   เล่ม ๑๓๐ ตอนพิเศษ ๗๑ ง, du 13 juin 2556 (2013). Elle dispose que tous les
   documents officiels et l'enseignement emploient les graphies du RID 2554.
2. Image `notification_royin/image2/6.jpg` : la préface signée du même
   Premier ministre, qui déclare le dictionnaire publié pour servir de norme
   d'écriture du thaï en un système unique.

Le Copyright Act B.E. 2537 exclut de la protection les notifications
gouvernementales (section 7(3)) et les faits de simple information
(section 7(1)). L'usage que Thaïnaute fait du RID, vérifier qu'une graphie
existe et qu'elle est la forme normative, porte sur de tels faits.

L'analyse s'arrêtait là, volontairement : `CLAUDE.md` réserve la validation
juridique au fondateur.

## Décision

Selim Aloui bascule les trois booléens de `RID-2554` à `true`, dans le
périmètre décrit ci-dessous et dans celui-là seulement.

### Ce que la décision autorise

- Vérifier qu'une graphie existe dans le dictionnaire normatif.
- Constater qu'elle est la forme normative, ou qu'elle ne l'est pas.
- Citer l'entrée par référence dans un dossier de preuve.
- Publier une leçon dont les faits ont été vérifiés ainsi.

### Ce qu'elle n'autorise pas

- Reproduire une définition, sa formulation ou son agencement.
- Moissonner la base, en totalité ou par lots.
- Sortir du cadre de consultation déjà écrit : une requête par mot vérifié,
  espacées d'au moins une seconde, agent utilisateur identifiant le projet,
  conservation de la seule présence de la graphie.

Une compilation garde des droits propres, indépendamment du statut juridique
des faits qu'elle contient. Ces trois booléens n'ont jamais couvert ses
définitions, et ne les couvrent pas davantage aujourd'hui.

## Ce que cette décision n'est pas

**Ce n'est pas un avis d'avocat.** C'est une validation de fondateur appuyée
sur des textes publics identifiés, vérifiables et cités. Elle engage son
auteur, comme la signature d'une unité engage le sien.

**Ce n'est pas une approbation linguistique.** Elle ne change rien à la revue
par un locuteur natif thaï, qui n'a eu lieu sur aucune leçon et que rien
n'autorise à contourner. `signatureUniteSchema` porte toujours
`revueNativeEffectuee: z.literal(false)`.

**Ce n'est pas une publication.** Aucune leçon ne change de statut du fait de
cet ADR. Elle retire une porte parmi sept, pas les six autres.

## Conséquences

`pnpm content:audit` passe de **430 à 247 bloqueurs actifs**. Les 61 leçons
restées internes portent désormais quatre bloqueurs chacune au lieu de sept :

| Bloqueur                 | Ce qui le lève                      |
| ------------------------ | ----------------------------------- |
| `HUMAN_AUTHOR_MISSING`   | une signature d'unité               |
| `HUMAN_AUDITOR_MISSING`  | une signature d'unité               |
| `WORKFLOW_NOT_PUBLISHED` | le geste de publication qui la suit |
| `VISIBILITY_NOT_PUBLIC`  | le geste de publication qui la suit |

La colonne « Dépend du RID » de `docs/content-policy/etat-des-unites.md`
tombe à zéro. Les 13 dossiers de preuve ont été régénérés et sont ressortis
identiques : ils rendent compte des sources, des audits et des findings d'une
leçon, jamais du statut de licence d'une source. C'est une bonne propriété,
et elle méritait d'être vérifiée plutôt que supposée.

Il ne faut pas lire ce chiffre comme « 61 leçons sont prêtes ». Elles
attendent désormais une relecture humaine réelle, et pour beaucoup d'entre
elles une voix. Surtout, deux tiers de leurs exercices écrits n'atteignent
pas encore l'application : `node scripts/content/mesurer-extraction-exercices.mjs`
mesure 209 blocs refusés sur 308. Publier une leçon à un seul exercice ne
servirait personne.

## Réversibilité

Ramener les trois booléens à `false` referme la porte immédiatement et bloque
toute publication ultérieure. Cela ne dépublie rien : une version publiée est
immuable par construction, et une correction crée une nouvelle version. Si la
décision devait être révisée, le geste serait donc de refermer la porte, puis
de publier des versions corrigées des leçons concernées.
