# ADR-0021 — Consentement analytics local v1

- Statut : Accepted for local beta preparation
- Date : 2 août 2026
- Complète : ADR-0015 et la porte analytics de la Phase 1
- Ne choisit pas : fournisseur analytics, hébergement, durée de rétention distante

## Contexte

Les interfaces possèdent déjà un catalogue fermé d'événements produit, mais
utilisent un sink nul. Brancher directement un fournisseur créerait une mesure
non essentielle avant que l'utilisateur ait choisi et risquerait d'associer une
installation à un compte. À l'inverse, différer toute porte de consentement
laisserait les parcours réels difficiles à auditer au moment de la bêta.

Le microphone, le marketing et une éventuelle mesure produit répondent à des
finalités différentes. Ils ne peuvent pas partager une case ou une décision
implicite.

## Décision

### État local et indépendant du compte

Le consentement analytics v1 possède trois états : `unknown`, `denied` et
`granted`. Son snapshot strict contient uniquement `schemaVersion`, `decision`,
`revision` et `updatedAt`.

- `unknown` est la valeur initiale et ferme le flux ;
- accepter ou refuser demande une action explicite ;
- aucun événement antérieur n'est mis en attente ou rejoué après acceptation ;
- le retrait ferme le sink en mémoire avant l'écriture de stockage ;
- aucune connexion, fusion, déconnexion, export ou suppression de compte ne
  modifie automatiquement cette préférence d'installation ;
- une valeur absente, future ou corrompue est traitée comme non consentie et
  n'est réparée qu'après un nouveau choix explicite.

Le web persiste le snapshot dans `localStorage` sous une clé versionnée et suit
les changements provenant d'un autre onglet. Le mobile le persiste dans la
table SQLite globale `local_metadata`, au sein d'une transaction exclusive. Il
n'entre jamais dans un namespace de compte, SecureStore, une outbox ou un
export de compte.

Sur mobile, un refus écrit un tombstone `denied` autoritaire dans une
transaction validée. Il reste prioritaire sur l'ancien snapshot jusqu'à ce
qu'un accord explicite ultérieur écrive le nouveau snapshot et retire le
tombstone dans la même transaction. Lectures et décisions sont sérialisées dans
l'instance du store, et chaque lecture utilise une transaction cohérente.

### Événements et transport

Le catalogue partagé est validé à l'exécution avec des objets stricts et des
valeurs bornées. Il n'accepte aucun champ libre, email, token, identifiant
Supabase, audio, transcription, réponse de l'apprenant ou texte thaï saisi.
Une erreur de validation ou de sink ne bloque jamais l'action produit.

Les providers web et mobile injectent le sink consenti dans les surfaces
existantes. Le transport de cette tranche reste `noOpAnalytics` : aucun SDK,
projet PostHog, identifiant anonyme, cookie ou requête distante n'est créé. Un
futur adaptateur devra rester désactivé par défaut, exposer une purge de son
identifiant local au retrait et faire l'objet d'une revue séparée de région,
rétention, sous-traitance et consentement.

Cette purge devra être idempotente et sérialisée : un nouvel accord ne pourra
réactiver le transport qu'après la fin de toute purge déjà déclenchée, y compris
si le provider a été remonté entre-temps.

Un état `granted` au schéma v1 n'autorise jamais ce futur transport. L'ajout
d'un fournisseur distant, d'un identifiant, d'une finalité, d'un destinataire
ou d'une politique de rétention impose une nouvelle information, une
incrémentation du schéma de consentement et un retour fail-closed à `unknown`.
Une migration ne peut pas convertir silencieusement un ancien accord en nouvel
accord : l'utilisateur doit choisir à nouveau avant la première requête.

### Interface

Un centre de confidentialité existe sur le web et le mobile. Il présente l'état
local, permet l'acceptation, le refus et le retrait, et explique explicitement
que cette build n'a aucun fournisseur distant actif. Les contrôles restent
accessibles même sans compte et l'apprentissage ne dépend jamais du choix.

Les consentements microphone et marketing restent hors de cette préférence.

## Conséquences

- La première ouverture et le refus émettent zéro événement.
- Une acceptation ne concerne que les événements futurs.
- Le changement de compte ne crée aucune association analytics.
- Une panne de stockage pendant un retrait laisse au minimum le processus
  courant fermé et demande à l'utilisateur de retenter la persistance.
- L'activation d'un fournisseur, sa rétention et ses clés restent une tranche
  explicite avant bêta distante ; cet ADR ne les autorise pas et son accord v1
  ne peut pas être réutilisé pour les autoriser.

## Validation attendue

- transitions et snapshots stricts, y compris corruption et version future ;
- rejet des clés supplémentaires et des valeurs sensibles dans les événements ;
- persistance après redémarrage et sérialisation des choix concurrents ;
- synchronisation multi-onglet web sans rejeu ;
- retrait immédiat et appel du reset d'un sink injectable ;
- injection dans onboarding, leçons, signalements, export et suppression ;
- écrans accessibles sur web et mobile ;
- aucun SDK, secret, variable d'environnement, migration cloud ou trafic ajouté.

## Références

- [CNIL — cookies et autres traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
