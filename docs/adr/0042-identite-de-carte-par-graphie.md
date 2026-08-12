# ADR-0042 : l'identité d'une carte est sa graphie, pas la leçon

- Statut : accepté
- Date : 12 août 2026
- Concerne : compilation du contenu, SRS, assets audio
- Remplace la partie « identifiant » de
  [ADR-0040](0040-compilation-cards-reutilisees-et-manches-textuelles.md)

## Contexte

`compile-items.ts` dérivait l'identifiant d'un item ainsi :

```ts
uuidStable("item", identifiantLecon, thaiRaw);
```

L'identifiant de la leçon entrait donc dans l'empreinte. Le corpus portait
**526 identifiants pour 345 graphies** : `ครับ` existait en neuf exemplaires,
`ไหม` en sept.

`public.learner_item_state` est indexée par `(user_id, item_id, dimension)`.
Un mot maîtrisé en unité 1 repartait donc de zéro en unité 3, puis 4, puis 5.
La répétition espacée ne consolidait jamais, et la file de révisions
présentait le même mot comme plusieurs mots différents.

L'ADR-0040 annonçait déjà qu'une carte réutilisée « conserve son
identifiant ». Le réemploi ne s'appliquait qu'aux graphies non déclarées par
la source courante, or les leçons de révision redéclarent leurs mots pour en
donner une glose contextuelle. L'intention n'était pas atteinte.

## Décision

1. L'identité d'une carte est `(pack de langue, graphie, sens)`. La leçon
   n'entre plus dans l'empreinte : elle est un contexte d'apparition, pas une
   identité.
2. Le pack de langue reste dans la clé. Deux cours différents ne partagent pas
   leur mémoire.
3. Le champ d'autorat `sens` est le SEUL moyen de séparer deux cartes qui
   partagent une graphie. Il est réservé aux homographes véritables et reste
   une décision d'auteur : aucun script ne peut établir que deux mots
   partagent une graphie sans être le même mot.
4. La migration d'un corpus non publié est un geste explicite
   (`scripts/content/migrer-identite-des-cartes.mjs`), jamais un effet de bord
   du compilateur. `compile-text-lessons --write` continue de n'écrire que les
   paquets absents, pour qu'un contenu publié reste immuable.

## Ce que la décision a demandé

Sur les 104 graphies déclarées plusieurs fois, 97 se fusionnent sans décision.
Les sept autres ont été arbitrées :

- `ไหม` reste **deux cartes** : la soie porte `sens : soie`, la particule de
  question garde le sens par défaut. C'est le seul homographe véritable du
  corpus.
- `สวัสดีครับ` portait une **erreur de contenu** : l'unité 9 séparait ses deux
  dernières syllabes par une espace là où l'unité 2 met un point. Corrigée à
  la source.
- `ล่ะ` publie la valeur d'insistance, celle que le dossier de vérification de
  l'unité 6 établit comme normative. L'ancienne glose n'était pas une
  définition mais une note de périmètre pédagogique.
- `เสีย` publie la glose enrichie, qui contient l'ancienne et ajoute l'emploi
  alimentaire.
- `พี่` et `น้อง` gardent la glose de leur première leçon. L'enrichir cassait
  les exercices de cette leçon, qui citent la glose mot pour mot : la porte
  anti-fabrication a fait son travail.
- `คะ` gardait déjà la formulation la plus précise en première leçon.

## Un défaut découvert au passage

Le découpage phonétique ne coupait que sur le point. L'espace, qui sépare deux
mots, restait donc à l'intérieur d'une syllabe : `/sa˨˩.wat̚˨˩.diː˧ kʰrap̚˦˥/`
rendait trois syllabes dont la dernière valait `diː˧ kʰrap̚˦˥`, étiquetée d'un
seul ton et d'une seule longueur qui n'en décrivaient aucune.

**95 syllabes du corpus sur 984 étaient dans ce cas.** Le contrôle croisé du
ton ne pouvait pas le voir : il comparait ligne à ligne. Corrigé, avec un
garde qui refuse désormais toute syllabe portant une espace interne. Le corpus
compte maintenant 1 141 syllabes, toutes découpées.

## Conséquences

- 526 identifiants deviennent **346**, pour 345 graphies. L'unité en trop est
  la seconde carte de `ไหม`.
- La maîtrise se consolide : `ครับ` est révisé d'unité en unité.
- Les 23 assets audio déjà produits changent de nom, leur identifiant dérivant
  de celui de l'item. Leur contenu, leur empreinte, leur synthèse et leur
  contrôle de contour sont recopiés tels quels. Aucun appel facturé n'a été
  refait.
- Une future production audio ne synthétisera plus le même mot une fois par
  leçon.

## Ce que cette décision ne fait pas

Chaque leçon continue de publier SA glose pour une carte partagée. `ครับ` a
désormais un seul identifiant, donc une seule mémoire, mais cinq formulations
selon la leçon qui l'affiche. Ce n'est pas une incohérence de données, c'est
une glose contextuelle ; cela deviendra un choix à faire le jour où une carte
sera affichée hors de sa leçon. `node scripts/content/divergences-de-cartes.mjs`
liste ces écarts à tout moment.

Aucune porte de publication ne bouge : les 66 paquets restent `draft` et
`internal`.
