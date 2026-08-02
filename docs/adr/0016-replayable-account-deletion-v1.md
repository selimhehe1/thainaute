# ADR-0016 — Suppression de compte reprenable v1

- Statut : Accepted
- Date : 2 août 2026
- Complète : suppression de compte P0 pour les comptes gratuits
- Ne résout pas : rétention finale des reçus, limitation de débit et comptes
  payants futurs

## Contexte

Supprimer directement un utilisateur Auth ne suffit pas. Un access token déjà
émis reste utilisable jusqu'à son expiration, des objets Storage détenus par
l'utilisateur peuvent bloquer le hard delete, et une réponse réseau perdue
après la disparition Auth prive le client de son Bearer pour réessayer. La
suppression doit aussi effacer les données locales du compte initiateur sans
toucher sa progression anonyme ni son identité d'installation.

## Décision

`DELETE /api/v1/account` reçoit un corps JSON fermé
`{ "confirmation": "delete_account" }`, un `Idempotency-Key` UUID canonique et
un secret `Account-Deletion-Continuation` de 32 octets généré par CSPRNG. Ce
secret n'est jamais renvoyé, journalisé, analysé ou stocké en clair.

### Authentification récente

Une première demande exige un Bearer Supabase. Le serveur croise
`auth.getClaims(token)` avec `auth.getUser(token)` : signature, expiration,
existence actuelle, compte permanent et égalité `sub = user.id` doivent toutes
être établies. Il exige ensuite une entrée `amr` de méthode `otp` datant d'au
plus dix minutes, avec une tolérance maximale d'une minute dans le futur. Ni
`iat`, ni `last_sign_in_at`, ni une valeur client ne remplacent cette preuve.
Le `session_id` du JWT doit en outre correspondre au même utilisateur dans
`auth.sessions`; un JWT signé mais issu d'une session déjà révoquée est refusé.
Cette attestation passe par une RPC `SECURITY INVOKER` réservée au
`service_role`, avec lecture limitée aux colonnes `id` et `user_id`.

Le web et le mobile envoient le code à l'adresse exacte du compte courant avec
`shouldCreateUser: false`, vérifient l'OTP puis vérifient que la nouvelle
session appartient encore au même UUID avant de lancer la commande.

### Reçu durable et reprise

Le serveur calcule quatre HMAC-SHA-256 à domaines séparés avec
`ACCOUNT_DELETION_RECEIPT_PEPPER` : sujet, idempotence, requête canonique et
continuation. PostgreSQL ne reçoit ni le pepper, ni le Bearer, ni la
continuation brute.

`private.account_deletion_receipts` conserve un reçu `in_progress` avant tout
effet destructif. Il porte temporairement l'UUID cible avec une FK
`ON DELETE SET NULL` vers Auth. Un trigger `BEFORE UPDATE`, `SECURITY INVOKER`,
transforme cette nullification en transition `completed` horodatée dans la
même transaction que le hard delete. Ainsi, même si le serveur disparaît juste
après `deleteUser`, tous les reçus en cours de la cible sont pseudonymisés. Le
`receipt_id` et le `completed_at` deviennent le reçu public stable
`thainaute.account-deletion-receipt/v1`.

Quatre RPC `SECURITY INVOKER`, au `search_path` vide et exécutables par le seul
`service_role`, attestent la session puis initialisent, reprennent et relisent
ce registre. Seule la transaction FK/trigger peut le finaliser. Anonyme et
`authenticated` n'ont aucun accès au schéma privé, à la
table ou aux RPC. La FK
composite `attempt_events → devices` passe à `ON DELETE CASCADE` afin que les
deux cascades vers `auth.users` ne puissent pas se bloquer selon leur ordre.

Une reprise présente uniquement l'idempotence et la continuation. Si le reçu
est connu, ces 256 bits secrets autorisent exclusivement la fin de cette même
suppression et le rejeu du même reçu ; aucun Bearer n'est alors requis. Un
conflit de corps, secret ou cible est fermé. L'opération locale persiste la
continuation avant l'appel afin de survivre à une perte de réponse ou un
redémarrage, puis ne l'efface qu'après la purge locale.

Sur le web, la création de cette opération est sérialisée entre onglets par
Web Locks ; un navigateur sans cette primitive reste fermé et n'envoie rien.
Les onglets se réveillent par l'événement `storage`, mais une disparition de la
commande ne vaut jamais succès à elle seule. L'interface exige aussi le
tombstone local du sujet avant d'annoncer une suppression terminée ailleurs.

Après réception du reçu serveur, IndexedDB ou SQLite écrit un tombstone opaque
`SHA-256("thainaute/deleted-account-subject/v1\0" || uuid canonique)` et purge
le namespace du compte dans la même transaction. Chaque mutation du store
compte relit ce tombstone dans sa propre transaction : une réponse de sync
tardive ou un second onglet ne peut donc pas ressusciter la progression. Le
marqueur global de fusion n'est retiré que s'il est valide et cible ce compte ;
une valeur illisible est conservée intacte sans bloquer le scellement.

### Ordre des effets

1. Valider le transport, l'identité vivante et l'OTP récent.
2. Écrire ou rejouer le reçu `in_progress`.
3. Purger les objets Storage appartenant à l'utilisateur.
4. Révoquer globalement les sessions quand le Bearer initial est encore
   disponible.
5. Exécuter `auth.admin.deleteUser(userId, false)` côté serveur. Les données
   Postgres disparaissent par cascade et les reçus sont finalisés
   transactionnellement par `ON DELETE SET NULL`.
6. Relire idempotemment le reçu demandé. Une ligne encore `in_progress` est un
   invariant fermé et ne peut jamais être convertie en succès par la RPC.
7. Sur l'appareil initiateur seulement, poser atomiquement le tombstone et
   purger le namespace local du compte, puis purger le cache d'export mobile et
   la session locale. La progression anonyme, l'onboarding et l'identité
   d'installation sont conservés.

Le hard delete ne considère une suppression comme déjà effectuée que pour le
code Auth `user_not_found` accompagné du statut `404`, après création du reçu.
La révocation ne tolère que `session_not_found`/`401` ou
`user_not_found`/`404`. L'erreur normalisée `AuthSessionMissingError`/`400` de
`supabase-js` est également tolérée pour cette seule révocation. Un `bad_jwt`,
`not_admin`, code absent, statut
incohérent ou `5xx` reste une panne et interdit de produire un faux reçu
réussi.

### Storage actuel

La v1 ne possède aucun bucket utilisateur : les prises de voix restent locales
et les bundles pédagogiques appartiennent à l'éditeur. Le registre serveur des
emplacements à purger est donc explicitement vide. Toute migration créant un
bucket privé utilisateur doit ajouter et tester son adaptateur de suppression
par l'API Storage avant d'être fusionnée ; supprimer directement les lignes
`storage.objects` est interdit.

## Conséquences et portes restantes

- les anciens JWT d'un utilisateur supprimé sont refusés par toutes les routes
  authentifiées grâce à la relecture `getUser` commune ;
- un échec après écriture du reçu reste reprenable et ne déclenche jamais une
  seconde opération différente ;
- le tombstone local bloque les écritures tardives tant que les données de
  l'application sont conservées ; effacer entièrement le stockage du navigateur
  ou réinstaller l'application efface aussi cette défense locale ;
- la suppression Auth finalise tous les reçus de la cible dans sa transaction,
  ce qui ferme la fenêtre de crash entre hard delete et marquage applicatif ;
- un reçu abandonné avant tout hard delete conserve temporairement l'UUID tant
  que le compte existe. Sa purge/expiration relève de `OPEN-SYNC-002` et reste
  une porte de bêta distante ;
- les reçus terminés restent pseudonymisés mais leur durée de conservation et
  la rotation du pepper relèvent de `OPEN-SYNC-002`, porte de bêta distante ;
- les seuils compte/IP et la protection contre l'abus OTP relèvent de
  `OPEN-API-001`, également avant bêta distante ;
- aucun abonnement n'existe dans cette tranche. Avant d'activer Stripe ou
  RevenueCat, `OPEN-BILL-001` doit définir annulation, maintien des factures et
  ordre des webhooks lors d'une suppression ;
- aucune ressource cloud, variable distante ou publication n'est créée par
  cette décision.

## Validation

- contrats Zod fermés, secret base64url canonique et reçu sans cible ;
- tests service sur OTP ancien, reprise sans Bearer, ordre Storage/Auth/DB,
  pannes intermédiaires et rejeu ;
- tests HTTP sur taille UTF-8, média, headers, deadline, erreurs et absence de
  secret dans les réponses/journaux ;
- tests adaptateurs sur les paramètres RPC et les couples exacts code/statut
  de l'API Admin ;
- 62 assertions pgTAP sur privilèges A/B/anonyme, session active, indexation,
  contraintes, conflits, impossibilité de finaliser par RPC, cascade Auth,
  finalisation transactionnelle, reprise et nullification finale ;
- tests web/mobile sur changement de sujet, réponse perdue, purge locale,
  reprise persistée, concurrence multi-onglets, tombstone atomique et rejet
  d'une réponse de synchronisation tardive.

Les tests PostgreSQL réels, les Advisors et le parcours connecté restent à
exécuter dès qu'un runtime Docker/Podman ou une CI fonctionnelle est disponible.

## Références

- [Checklist de confidentialité](../privacy/account-deletion.md)
- [Contrat PostgreSQL](../privacy/account-deletion-database.md)
- [Supabase — gestion des utilisateurs](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase — suppression Admin](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [Supabase — sessions et JWT](https://supabase.com/docs/guides/auth/sessions)
- [Supabase — champs JWT et `amr`](https://supabase.com/docs/guides/auth/jwt-fields)
- [Supabase — suppression Storage](https://supabase.com/docs/guides/storage/management/delete-objects)
- [Supabase — déconnexion et scopes](https://supabase.com/docs/guides/auth/signout)
