# ADR 0040 — Compiler les cartes réutilisées et les manches textuelles

- **Statut** : accepté pour la tranche interne du 2026-08-07
- **Décideurs** : équipe produit et contenu
- **Périmètre** : compilation des sources `content/authoring` vers les paquets
  de cours `draft`/`internal`

## Contexte

Les 66 sources d'auteur décrivent aussi des leçons de révision. Ces leçons
réemploient légitimement des cartes publiées dans une leçon précédente, alors
que le compilateur local ne voyait que les items définis dans le fichier
courant. Plusieurs exercices textuels étaient donc bloqués sans que le
contenu soit absent. Les associations pouvaient aussi contenir plus de six
paires, limite imposée par le contrat d'exercice, et certains champs d'items
regroupaient explicitement plusieurs graphies thaïes.

## Décision

1. Le compilateur construit un index déterministe des items de toutes les
   sources d'auteur versionnées. Une carte d'une leçon de révision peut être
   réutilisée si sa graphie exacte apparaît dans la source courante. La carte
   conserve son identifiant, sa provenance et ses données SRS ; aucune carte
   distante, générée ou non sourcée n'est acceptée.
2. Les champs groupés ne sont développés automatiquement que lorsque les
   segments sont explicitement alignés : séparateurs `·` ou liste de chiffres
   thaïs, avec le même nombre de valeurs pour l'IPA, le ton, la longueur et la
   transcription. Toute ambiguïté reste refusée.
3. Une association de plus de six paires est divisée en manches équilibrées,
   avec tous les couples conservés et des identifiants stables par manche.
   Une manche audio de plus de six options reste bloquée jusqu'à une correction
   éditoriale et la production des voix.
4. Ces comportements ne changent pas les portes de publication : les paquets
   restent `workflowStatus: draft`, `visibility: internal`, et un manifeste
   audio vide signifie que la voix est encore à produire.

## Conséquences

- Les 66 leçons disposent d'un paquet textuel compilé et d'un manifeste audio
  associé pour la QA interne.
- La compilation n'efface ni ne réordonne les signes thaïs Unicode ; les
  cartes importées restent traçables vers leur fichier d'origine.
- Le catalogue peut proposer l'aperçu des exercices non audio, mais aucune
  leçon ne devient publiable par cette décision. Les audits linguistiques,
  l'autorisation des sources et les voix restent des portes séparées.

## Validation

La tranche est contrôlée par `content:compile-text --write`,
`content:catalog`, `content:authoring-drafts`, `content:validate` et
`content:audit`. Le résultat attendu est 66 leçons textuellement compilées,
0 bloquée, avec les portes de publication toujours actives.
