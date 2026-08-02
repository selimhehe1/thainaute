# ADR-0017 — Studio privé de prépublication limité à la fixture

- Statut : Accepted for fixture prototype
- Date : 2 août 2026
- Complète : contrôle éditorial démontrable sans contenu réel
- Ne résout pas : `OPEN-CONTENT-001`, `OPEN-LEARN-001`, `OPEN-PRODUCT-001`

## Contexte

La porte de publication de `@thainaute/content` contrôle déjà le schéma, les
références, l’Unicode thaï, les sources, les licences, les sept audits, les
findings et l’audio. Elle n’avait toutefois aucune surface permettant à un
éditeur de comprendre un refus. La seule donnée disponible reste une fixture
synthétique volontairement non publiable.

Introduire maintenant un stockage éditorial, un registre réel de sources ou
une mutation de `lesson_versions` ferait passer des choix encore ouverts pour
des décisions acquises. Une surface publique ou un rôle déduit de
`user_metadata` exposerait en outre des données de travail et des clés de
correction.

## Décision

Le premier studio est un préflight privé, sans édition ni persistance :

- `THAINAUTE_STUDIO_MODE=disabled|fixture` est une variable exclusivement
  serveur et vaut `disabled` par défaut ;
- en mode désactivé ou mal configuré, la page et l’API répondent comme une
  ressource absente ;
- l’accès exige un compte Supabase permanent et le rôle exact
  `content_editor` dans `app_metadata`, relu auprès d’Auth pour chaque revue ;
- `user_metadata`, l’état du client et un JWT seul ne peuvent jamais accorder
  ce droit ; aucun rôle n’est créé ou attribué par le dépôt ;
- l’API relit uniquement la fixture versionnée du dépôt et exécute le moteur
  commun de revue côté serveur ;
- la réponse contient un rapport borné : état du workflow, sources et droits,
  audits, findings, séquences Unicode, état de l’audio et causes de blocage ;
- elle ne contient ni clé de correction, ni Bearer, ni email, ni payload brut ;
- l’action ne modifie aucun fichier, aucune table et aucune release. Elle ne
  peut produire qu’un diagnostic de prépublication, jamais publier.

Les réponses privées utilisent `Cache-Control: no-store`, varient sur
`Authorization` et restent bornées par une échéance serveur. Les journaux
opérationnels ne contiennent que l’opération, une classe d’erreur fermée et un
identifiant de requête.

Le moteur de revue accepte déjà un objet inconnu afin de préparer les futurs
brouillons, mais cette tranche ne fournit aucun endpoint d’import arbitraire.
Le navigateur ne peut demander que la revue de la fixture connue du serveur.

## Conséquences

- Un éditeur autorisé peut voir pourquoi la fixture échoue aux portes de
  publication sans exposer de contenu éditorial au public.
- La même logique typée alimente CLI, tests, API et interface ; un refus ne
  dépend pas d’une réimplémentation visuelle.
- `conflict` devient un état éditorial représentable mais reste non publiable.
- L’absence de source réelle autorisée, d’auditeur autorisé et de décision
  pédagogique reste structurellement visible.
- Aucun schéma SQL, secret, fournisseur ni dépendance n’est ajouté.

## Hors périmètre et suite

Le studio ne stocke pas de brouillon, n’assigne pas d’audit, ne résout pas un
finding, ne reçoit pas de signalement utilisateur et ne crée pas de release.
La tranche suivante devra concevoir le registre canonique des sources et
auditeurs, l’historique immuable lié au hash du payload, les transitions
idempotentes et la publication transactionnelle. Elle restera bloquée pour du
contenu réel tant que `OPEN-CONTENT-001` n’est pas résolue.

## Validation attendue

- chaque cause de blocage critique est couverte par un test du cœur contenu ;
- schéma ou relations invalides échouent fermés avec des problèmes bornés ;
- visibilité non publique et timestamp incohérent empêchent la publication ;
- compte anonyme, supprimé, sans rôle ou rôle placé dans `user_metadata` ne
  reçoit aucun rapport ;
- le rapport HTTP est privé, borné et ne contient ni bundle brut, ni réponse
  correcte, ni information d’identité ;
- l’interface traite chargement, accès absent, erreur, hors ligne et reprise,
  avec focus et annonces accessibles ;
- le mode désactivé demeure le comportement par défaut et `/studio` reste
  non indexable.
