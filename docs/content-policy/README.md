# Politique de contenu linguistique

- Statut : `REQUIREMENT`
- Portée : lexique, leçons, dialogues, transcriptions, explications et audio

## Principe

Aucun fait linguistique n'est publiable sans provenance, licence, version et
audit. Une sortie d'IA est un brouillon, jamais une source. Deux modèles qui
s'accordent ne constituent pas deux preuves.

## Sources admissibles

1. sources normatives officielles ;
2. publications universitaires et grammaires reconnues ;
3. corpus dont la licence autorise précisément l'usage prévu ;
4. exemples originaux validés par un locuteur natif qualifié.

Une source peut autoriser la vérification sans autoriser la copie. La porte v1
reste volontairement conservatrice : toute source incluse dans un bundle à
publier doit autoriser l'usage commercial et la redistribution. Une source
`synthetic_fixture` est toujours non publiable.

Chaque fiche conserve l'URL ou la référence interne adaptée, le titulaire, la
licence, `versionSource`, la date de consultation et un niveau de confiance
`low`, `medium` ou `high`.

## Cycle et rôles

`draft -> review -> approved -> published`

- chaque génération référence ses acteurs ; un auteur humain responsable est
  obligatoire avant publication et une assistance IA reste identifiée comme
  telle ;
- l'auteur prépare le brouillon et ses preuves ;
- l'auditeur linguistique examine séparément orthographe, sens, prononciation,
  ton, longueur vocalique, registre et naturalité ; chaque dimension référence
  un auditeur humain avant publication ;
- le responsable de publication contrôle sources, licences et conflits ;
- l'auteur ne peut pas clore seul un désaccord matériel qu'il a créé.

Un constat bloquant ouvert impose le statut `draft`, `review` ou `conflict`.
Le passage à `published` doit être refusé mécaniquement.

## Audio

Chaque voix humaine exige une autorisation écrite couvrant le produit
commercial, les territoires, la durée, les retakes et l'interdiction éventuelle
d'entraînement de modèles. Conserver locuteur, variante, registre, date,
matériel d'enregistrement, montage et licence. Une voix de synthèse est
étiquetée comme telle et ne remplace pas l'audit natif.

## Unicode thaï

Conserver la chaîne originale et ses points de code. Ne jamais normaliser,
réordonner, tronquer ou « corriger » silencieusement les signes combinatoires.
Toute transformation explicite conserve l'original et sa version.

## Fixtures de démonstration

Une fixture technique peut contenir un exemple non audité uniquement si elle :

- est marquée `draft` et `publishable: false` ;
- cite une source interne non publiable ;
- possède au moins un constat bloquant explicite ;
- n'est jamais incluse dans une release de contenu.

`pnpm content:validate` vérifie la forme. `pnpm content:audit` vérifie que les
portes de publication et les licences ne sont pas contournées.
