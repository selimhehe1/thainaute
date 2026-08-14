# La tolérance que les leçons promettent, et que le moteur ne sait pas tenir

Date : 2026-08-14. Découvert en traitant la famille « prose résiduelle après la
clé » du plan d'extraction.

## Le constat

**76 exercices de rappel vivent dans une leçon qui promet une tolérance de
saisie. 23 la tiennent. 53 la trahissent.**

Un apprenant qui écrit `ngaai` dans `u08-l8a` serait compté faux, alors que la
leçon annonce « variante sans accents acceptée ».

Aucun de ces exercices n'est publié aujourd'hui : les unités concernées sont en
brouillon. Le défaut deviendrait visible le jour de leur publication.

## La cause, et elle n'est pas éditoriale

Les leçons écrivent des politiques de saisie précises :

> Politique de saisie : alphabet latin uniquement, casse ignorée, espaces de
> début et de fin ignorés, espaces multiples réduites à une. Les signes de ton
> restent FACULTATIFS à ce stade. Le point médian à l'intérieur des mots
> polysyllabiques est facultatif.

Le schéma n'en porte que trois éléments
(`packages/content/src/schemas.ts`, `answerPolicy`) :

```ts
normalization: z.literal("nfc"),
trimWhitespace: z.boolean(),
collapseInnerWhitespace: z.boolean(),
```

Et l'évaluateur applique exactement ces trois-là
(`packages/domain/src/attempt.ts`, `normalizeRecallValue`) : NFC, espaces de
bord, espaces multiples. **Ni casse, ni signes de ton, ni point médian.**

La tolérance promise n'est donc pas représentable. Les auteurs la contournent
en énumérant la variante à la main, ce qu'ils ont fait 23 fois et oublié 53
fois. Ce n'est pas une négligence : c'est le format qui n'offre pas l'endroit.

## Ce que cela explique aussi

Huit blocs sont refusés à l'extraction pour « prose résiduelle après la clé »,
sur des phrases comme « variante sans accents acceptée ». L'extracteur a raison
de refuser : cette phrase énonce une règle qu'il ne peut ni vérifier ni
transmettre, puisque le schéma n'a pas de champ pour la porter.

Corriger ces huit blocs sans corriger la politique reviendrait à ignorer la
phrase, donc à rendre l'exercice **plus strict** que la leçon ne l'annonce.

## Deux corrections possibles, et c'est une décision produit

**Étendre la politique.** Ajouter à `answerPolicy` des champs
`ignoreCase`, `ignoreToneMarks`, `ignoreMiddleDot`, et les appliquer dans
`normalizeRecallValue`. C'est l'architecture juste : la règle est déclarée une
fois, vérifiable, et l'auteur n'a plus à énumérer.

Cela touche le schéma de contenu, donc la forme des paquets compilés, et
demande de trancher une question pédagogique : **jusqu'à quand les signes de
ton sont-ils facultatifs ?** Les leçons disent « à ce stade », ce qui suppose
qu'ils cessent de l'être plus tard. Personne n'a fixé ce moment.

**Énumérer à la compilation.** Dériver la forme nue de chaque clé et l'ajouter
aux réponses acceptées. Plus simple, mais cela déplace une règle dans des
données, multiplie les variantes stockées, et ne dit toujours pas quand la
tolérance doit cesser.

## Ce que ce document ne fait pas

Il ne tranche pas. Le seuil de tolérance est une décision pédagogique du
fondateur, pas une évidence technique : exiger le ton dès l'unité 1 est
défendable, l'exiger seulement à partir de l'unité 5 aussi.

Il ne corrige pas non plus les 53 exercices, parce que les corriger un par un
sans décision de politique reproduirait le contournement qui a déjà échoué 53
fois.

## Mesure rejouable

Le décompte se refait en comparant, pour chaque exercice de rappel d'une leçon
dont la source déclare une tolérance, la clé accentuée à sa forme dépouillée de
diacritiques et de points médians.
