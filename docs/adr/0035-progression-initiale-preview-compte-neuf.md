# ADR-0035 — Progression initiale de la preview pour un compte neuf

- Statut : Accepted
- Date : 7 août 2026
- Complète : première lecture de progression par leçon après création d’un compte
- Ne résout pas : la création de profil, l’enregistrement d’appareil ou le contrat
  du snapshot générique

## Contexte

Un compte Auth permanent peut ouvrir la preview connectée avant d’avoir
enregistré un appareil. Dans cet intervalle, la RPC autoritaire
`get_progress_snapshot_v1` renvoie `TP002` car aucune ligne `profiles` n’existe
encore. Afficher une erreur serveur pour une leçon neuve masque alors un état
valide : l’apprenant n’a simplement aucune tentative.

Le snapshot générique reste utilisé pour l’hydratation et la synchronisation du
compte. Son contrat doit continuer à refuser un profil absent afin de ne pas
inventer une identité ou une révision de synchronisation.

## Décision

Le dépôt de snapshot expose une lecture dédiée à la progression par leçon :

- `readForLesson` appelle la même RPC et transforme uniquement le SQLSTATE
  `TP002` en `{ syncRevision: 0, states: [] }` ;
- toute autre erreur RPC ou toute réponse mal formée reste une panne fermée ;
- `GET /api/v1/progress/lessons/{versionId}` utilise cette lecture dédiée ;
- `GET /api/v1/progress/snapshot` continue d’utiliser `read` et son contrat
  strict ;
- cette lecture ne crée aucun profil, appareil, événement, progression ou
  analytics. La prochaine mutation autorisée conserve la responsabilité de
  créer le profil dans son propre parcours.

La conversion est faite côté serveur, après authentification et validation de
la version publiée. Aucun code SQL, secret, UUID utilisateur ou détail interne
ne traverse le contrat public de progression par leçon.

## Conséquences

- une preview neuve affiche l’état `new` sans faux incident opérationnel ;
- une vraie panne de base ou d’authentification reste visible comme indisponible
  et observable sans données sensibles ;
- le comportement des autres consommateurs de `get_progress_snapshot_v1` ne
  change pas ;
- la création du profil reste liée à l’enregistrement explicite d’un appareil,
  conformément aux décisions de synchronisation existantes.

## Validation

- test unitaire de `TP002` pour `readForLesson` et refus correspondant de `read` ;
- E2E connecté : compte neuf, leçon, tentative, correction et relecture sur un
  second navigateur ;
- pgTAP maintient le refus d’un profil absent pour la RPC générique.
