# ADR-0014 — Export portable du compte v1

- Statut : Accepted
- Date : 2 août 2026
- Complète : export de compte du MVP P0
- Ne résout pas : suppression du compte et export asynchrone de gros volumes

## Contexte

Le compte partagé doit pouvoir restituer ses données sans faire transiter un
secret serveur ni contourner la RLS. L'export doit couvrir l'identité Auth
strictement utile, le profil, les appareils, les tentatives et les projections
actuellement persistées. Une pagination implicite ou une progression modifiée
pendant la lecture pourrait sinon produire un fichier valide en apparence mais
incomplet ou incohérent.

## Décision

`GET /api/v1/account/export` exige un Bearer Supabase. La route appelle
`auth.getUser(accessToken)` avec la clé publiable : cette requête réseau valide
le jeton auprès d'Auth avant toute lecture sensible et refuse les utilisateurs
Supabase anonymes.

L'identité exportée suit une whitelist fermée : UUID Auth, email, téléphone,
dates de création, mise à jour, dernière connexion et confirmations, ainsi que
les noms de fournisseurs. Ces noms proviennent uniquement de
`app_metadata.providers`, doivent respecter le format ASCII fermé prévu par le
contrat, puis sont triés et dédupliqués. Les identités OAuth, `user_metadata`,
les autres valeurs de `app_metadata`, les jetons et les données de session ne
sont jamais exportés.

Après validation Auth, un client Supabase propre à la requête utilise la même
clé publiable et le JWT utilisateur via l'option `accessToken`. Les lectures
Data API sont donc exécutées avec le rôle `authenticated` et les politiques RLS
existantes. Elles filtrent aussi explicitement le `user_id` validé. Aucun
`service_role`, clé secrète ou fonction `SECURITY DEFINER` n'intervient.

Le document JSON fermé porte le format `thainaute.account-export/v1` et couvre :

- le profil et sa `syncRevision`, ou `null` pour un compte Auth qui n'a pas
  encore initialisé son profil ;
- les appareils, triés par création puis UUID ;
- les tentatives immuables, triées par réponse puis UUID d'événement ;
- les états d'apprentissage, triés par item puis dimension.

Chaque liste est paginée par 1 000 lignes avec un `count=exact` initial. La
route refuse le document entier plutôt que de le tronquer au-delà de 20
appareils, 10 000 tentatives ou 10 000 états. Elle lit la révision du profil
avant et après les listes. Comme `register_device_v1` peut créer un appareil ou
actualiser son `app_version` sans modifier cette révision, la liste canonique
des appareils est également relue et comparée. Si l'un des deux garde-fous
change, une seconde lecture complète est tentée ; un second changement renvoie
`409 concurrent_update`.

La deadline globale est de 20 secondes et la taille UTF-8 maximale du JSON est
de 4 000 000 octets. Un dépassement de ligne ou de taille renvoie
`409 export_capacity_exceeded`. Une voie asynchrone avec stockage temporaire et
rétention dédiée devra remplacer cette limite si des comptes réels l'atteignent.

Une réponse réussie est téléchargée sous le nom neutre
`thainaute-account-export-v1.json`, avec `Cache-Control: no-store`,
`Pragma: no-cache`, `Vary: Authorization` et `Content-Disposition: attachment`.
Les journaux opérationnels ne contiennent que le type de panne, un request ID
et la release : jamais de jeton, UUID utilisateur, email ou contenu exporté.

## Conséquences

- le serveur réutilise les grants et politiques A/B/anonyme déjà testés sans
  migration, nouvelle variable, secret ou ressource cloud ;
- l’application native ajoute `expo-sharing` 57.0.8, module MIT sans service
  distant, pour remettre le fichier temporaire via le panneau système ;
- le format partagé peut être validé de la même façon sur web, iOS et Android ;
- les prises de voix et la progression anonyme locales ne figurent pas dans ce
  fichier, puisqu'elles n'ont jamais été envoyées au compte ;
- la suppression du compte reste une capacité distincte et devra avoir ses
  propres tests de révocation, cascade et purge ;
- un compte dépassant les bornes reçoit une erreur explicite et aucun fichier
  partiel ; l'export asynchrone est la voie d'évolution documentée.

## Validation

- contrats Zod fermés, ordre canonique, références et whitelist Auth ;
- tests de pagination, capacité, panne et absence de troncature ;
- tests Auth sur les providers et le refus des comptes anonymes ;
- tests du snapshot stable, du retry unique, de la mutation d'appareil et du
  conflit persistant ;
- tests HTTP des headers, de la limite UTF-8, de la deadline et des logs
  expurgés ;
- preuve connectée A/B/anonyme intégrée au parcours Supabase local : A retrouve
  ses deux tentatives, B reçoit un compte vide et l'anonyme reçoit `401`.

## Références

- [Checklist de confidentialité de l’export](../privacy/account-export.md)
- [Supabase — `auth.getUser`](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase — JWT et option `accessToken`](https://supabase.com/docs/guides/auth/jwts)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — clés publiables et secrètes](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase — changements incompatibles](https://supabase.com/changelog?types=breaking-change)
