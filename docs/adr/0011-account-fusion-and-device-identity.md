# ADR-0011 — Compte, fusion locale et identité d’installation

- Statut : Accepted
- Date : 1er août 2026
- Complète : ADR-0002, ADR-0004 et ADR-0009

## Contexte

Le parcours commence sans compte, mais la progression durable doit ensuite être
partagée entre web, iOS et Android. Trois risques doivent être fermés ensemble :

- une fusion implicite pourrait rattacher la progression au mauvais compte ;
- une déconnexion pourrait laisser les données du compte suivant visibles sur
  l’appareil ;
- recréer un UUID d’appareil à chaque reconnexion finirait par épuiser la limite
  serveur de vingt appareils.

La table `devices` rend par ailleurs chaque UUID globalement immuable : le même
UUID ne peut pas être transféré d’un compte à un autre.

## Décision

### Authentification

Supabase Auth fournit un code email à six chiffres, valable dix minutes dans la
configuration locale. `auth.users.id` est la seule identité métier ; l’email ne
sert jamais à rapprocher des comptes ou des données. Les utilisateurs Supabase
anonymes sont refusés par le vérificateur serveur.

Le navigateur conserve la session dans le stockage géré par Supabase JS. Les
applications natives utilisent `expo-secure-store`. La session est divisée en
fragments bornés du trousseau, avec manifeste écrit en dernier, pour ne pas
dépendre de la limite de taille variable des plateformes. Aucun jeton n’entre
dans SQLite, l’outbox, Sentry, PostHog ou les logs. Le rafraîchissement natif ne
fonctionne que lorsque l’application est active.

### Identité d’appareil

Chaque installation conserve localement un UUID opaque sans compte. Pour un
compte donné, le client calcule un UUIDv8 à partir de :

```text
SHA-256("thainaute/account-device/v1" || installationId || auth.users.id)
```

Les bits de version et de variante sont normalisés. Le serveur ne reçoit jamais
`installationId` et ne peut donc pas relier deux comptes depuis leurs UUID
d’appareil. Une reconnexion au même compte retrouve le même UUID sans conserver
de clé locale contenant l’UUID utilisateur.

### Fusion et reprise

Après authentification, l’utilisateur choisit explicitement entre fusionner,
garder la progression anonyme pour plus tard ou la supprimer avec confirmation.
La fusion :

1. conserve `eventId` et `answeredAt` ;
2. remplace seulement `deviceId` par celui du compte ;
3. conserve révision et projections du compte, jamais celles de l’espace
   anonyme ;
4. persiste le marqueur et les deux snapshots dans une transaction IndexedDB ou
   SQLite ;
5. reprend le même marqueur après interruption ;
6. ne retire les événements acceptés qu’après accusé serveur complet ; un rejet
   terminal reste classé localement avec son code et n’est pas réessayé.

Les collisions et dépassements de capacité ferment la transaction sans écriture
partielle. Le marqueur checkpoint les accusés même si l’outbox compacte ses
anciens résultats terminaux.

### Synchronisation et déconnexion

Une passe commune enregistre d’abord l’appareil, charge le snapshot autoritaire
`GET /api/v1/progress/snapshot`, puis envoie au plus vingt lots séquentiels. Une
panne réseau laisse `inFlight`, sa clé d’idempotence et son corps inchangés. Le
propriétaire de l’outbox et le sujet de la session relue avant chaque requête
doivent rester identiques ; une bascule de compte coupe la passe avant réseau.
L’UUID et la plateforme d’un appareil restent immuables, tandis que sa version
d’application est actualisée lors d’un rejeu propriétaire.

À la déconnexion, les tentatives non confirmées bloquent la voie normale. Une
suppression reste possible après confirmation explicite. L’application relit
la session et vérifie son sujet, exécute `signOut({ scope: "local" })` pour ce
parcours attendu, puis purge l’outbox, les projections, les marqueurs et les
caches du compte capturé dans une transaction. Cette purge explicite n’est
autorisée que si le journal correspond exactement au snapshot et au marqueur
vus lors de la confirmation, même si une synchronisation concurrente vient de
le solder. Si une autre fenêtre ajoute ou modifie une tentative, la session se
ferme mais le namespace reste verrouillé et récupérable par le même compte.
Seul l’UUID opaque d’installation reste local après une purge réussie.

Une expiration, révocation ou déconnexion reçue depuis un autre contexte ne
purge pas silencieusement des tentatives non confirmées. Le namespace du
dernier compte devient inaccessible sans sa session et reste isolé de l’espace
anonyme comme des autres comptes. Une reconnexion au même `auth.users.id`
permet de le synchroniser ou de le supprimer explicitement. Si ce namespace ne
contient plus aucun lot, événement pending ou fusion active, il peut être purgé
automatiquement dans une transaction lors de la transition de session.

## Conséquences

- Une reconnexion ne consomme pas un nouvel appareil serveur.
- Deux comptes sur la même installation restent séparés localement et côté API.
- La fusion demande une action claire et survit à un crash sans perte
  silencieuse.
- Un rejet serveur laisse la source anonyme disponible ; l’utilisateur doit
  choisir explicitement de la supprimer.
- Une perte de session distante ne détruit pas silencieusement une progression
  non synchronisée et ne la rend pas visible à un autre compte.
- Le SMTP et le modèle OTP du projet hébergé devront être vérifiés avant bêta.

## Validation

- propriétés et cas limites de fusion dans `packages/sync` ;
- transactions réelles IndexedDB et transactions simulées SQLite ;
- tests du coordinateur, du transport Bearer et du rejeu réseau ;
- route de snapshot validée côté HTTP et repository ;
- pgTAP A/B/anonyme et privilèges de la RPC ;
- parcours Playwright/Maestro sans configuration distante.

## Références

- [Supabase — passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase — modèles email locaux](https://supabase.com/docs/guides/local-development/customizing-email-templates)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [RFC 9562 — UUID version 8](https://www.rfc-editor.org/rfc/rfc9562.html#name-uuid-version-8)
