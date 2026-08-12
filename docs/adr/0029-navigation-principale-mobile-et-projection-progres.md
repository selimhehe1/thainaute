# ADR-0029 — Navigation principale mobile et projection partagée de Progrès

## Statut

Acceptée — tranche mobile interne, 2026-08-06.

> Les éléments U01 embarqués de cette décision sont remplacés par l'ADR-0041 et
> restent hors du graphe Expo distributable.

## Mise à jour — mécaniques typées, 2026-08-06

Le lecteur mobile générique prend désormais en charge les réponses typées
`association` et `recall` en plus de `word_order` et `reading`. Le brouillon est
persisté dans le checkpoint SQLite, repris après relance, puis validé par le
même domaine autoritaire et projeté dans le SRS partagé. Cette capacité reste
interne tant que les portes audio de 1B et 1F ne sont pas franchies.

## Contexte

Le brief prévoit trois surfaces principales sur mobile : `Aujourd’hui`,
`Pratiquer` et `Progrès`. L’extrait mobile de l’unité 1 dispose d’un catalogue
local, de deux expéditions audio, de deux expéditions mécaniques et d’un journal
d’essais durable, mais il n’exposait pas ces trois surfaces de façon cohérente.
Le serveur expose déjà un snapshot autoritaire et idempotent pour les comptes
connectés.

La première tranche doit rester exploitable hors connexion et ne doit pas
transformer un contenu en préparation en leçon lançable.

## Décision

- Ajouter une navigation primaire mobile à trois onglets : `Aujourd’hui`,
  `Pratiquer` et `Progrès`.
- Faire de `Pratiquer` le point d’entrée des aperçus audio et mécaniques dont
  les portes locales sont franchies ; garder les autres leçons visibles et
  explicitement bloquées.
- Construire `Progrès` à partir du journal local `learning` et d’un projecteur
  SRS commun aux expéditions audio et mécaniques. La projection choisit les
  clés de correction adaptées au type de réponse, y compris les réponses
  typées d’ordre des mots. Pour un compte connecté, hydrater le namespace
  compte avec le snapshot serveur existant avant de projeter la vue.
  Les états autoritaires remplacent la projection locale lorsqu’aucune
  tentative locale n’est encore en attente ; une tentative pending reste
  visible localement jusqu’à sa synchronisation.
- Injecter le catalogue dans le projecteur afin que la logique métier reste
  testable sans charger les WAV natifs dans Vitest.
- Ne créer ni table, ni endpoint, ni dépendance : la route snapshot et la
  synchronisation serveur existantes restent la source d’autorité. La fusion
  de la progression anonyme demeure une action explicite du compte.

## Conséquences

La navigation principale est maintenant visible sur mobile après onboarding,
avec des états de chargement, vide, erreur et reprise. Un compte connecté
retrouve les états de maîtrise provenant du serveur, y compris ceux produits
sur un autre appareil ; une panne réseau conserve la dernière projection locale
et l’indique explicitement. Les utilisateurs anonymes restent locaux. Les
contenus 1C et 1E disposent d’une expédition mécanique interne ; 1B et 1F
restent non lançables tant que leurs portes audio ne sont pas franchies.
