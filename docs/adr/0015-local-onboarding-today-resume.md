# ADR-0015 — Onboarding local, Aujourd’hui et reprise de la fixture

- Statut : Accepted for fixture prototype
- Date : 2 août 2026
- Complète : boucle quotidienne locale démontrable de la Phase 2
- Ne résout pas : `OPEN-PRODUCT-001`, `OPEN-LEARN-001`, `OPEN-OFFLINE-001`

## Contexte

La tranche verticale persistait déjà chaque tentative dans IndexedDB ou SQLite,
mais son état React repartait à l’introduction après un rechargement. Il
n’existait ni onboarding local, ni écran `Aujourd’hui`, ni curseur permettant de
reprendre précisément une question ou son résultat.

La fixture embarque volontairement une clé de correction et un signal sans
valeur linguistique. Elle est marquée `draft`, porte un finding bloquant et les
adaptateurs la rangent dans un namespace `demo` distinct de toute outbox
synchronisable. Le propriétaire `anonymous` du contrat ne garantit pas seul
cette séparation : les adaptateurs doivent prouver que ce namespace n’est
jamais transmis à la fusion de compte. La fixture ne peut donc pas servir à
trancher la politique de correction hors
ligne du vrai contenu.

## Décision

Le contrat partagé `thainaute.local-experience/v1` conserve uniquement :

- un onboarding sans texte libre : trois identifiants catégoriels bornés qui
  correspondent aux choix provisoires affichés par chaque client ;
- un checkpoint de leçon identifié par version et exercice ;
- la phase `intro`, `question`, `submitting`, `result` ou `completed` ;
- l’option sélectionnée lorsque la question est ouverte ;
- le payload exact de la tentative, avec son `eventId` réservé avant l’enqueue,
  pour les phases `submitting`, `result` et `completed` ;
- des timestamps UTC canoniques nécessaires à la reprise.

Les libellés et options d’onboarding sont une hypothèse d’interface provisoire,
pas une taxonomie du contrat partagé. Ils ne segmentent pas l’utilisateur, ne
modifient pas le parcours et ne sont jamais envoyés en analytics. Ils pourront
être remplacés avec une migration après la décision `OPEN-PRODUCT-001`.
Lorsqu’un identifiant encore valide pour le contrat n’existe plus dans les
options de l’interface, le client n’en sélectionne aucune par défaut et bloque
la finalisation jusqu’à un nouveau choix explicite.

Le snapshot d’expérience n’est jamais une source de progression. Il réserve
d’abord le payload et l’`eventId` exacts dans `submitting`, puis l’adaptateur
écrit ce même payload dans l’outbox durable. Après un arrêt entre ces deux
écritures, la reprise réessaie le même enqueue idempotent. Elle ne passe à
`result` que si cette tentative exacte est présente et non rejetée ; aucune
recherche approchée par exercice ou date n’est autorisée.

Les adaptateurs conservent le même JSON strict : Dexie sur le web et une table
SQLite locale sur mobile. Une valeur corrompue est signalée et conservée ; elle
n’est jamais remplacée silencieusement par un état vide.

## Migration des premières outboxes de fixture

L’historique du dépôt prouve que la révision de fondation `ceab023` ouvrait la
fixture mobile et web dans l’outbox `learning` par défaut. La séparation vers
`demo` n’apparaît qu’en `7aeb5b9`. Les appareils et navigateurs ayant exécuté
la première révision peuvent donc encore contenir une tentative technique dans
la source de fusion, même si toutes les nouvelles écritures sont isolées.

La migration reconnaît cette ancienne fixture uniquement par l’identité
immuable complète connue de cette révision : exercice
`10000000-0000-4000-8000-000000000004`, version de contenu
`10000000-0000-4000-8000-000000000002`, l’une des deux options techniques
versionnées et `srs-v0`. Un `eventId` déjà présent dans la destination n’est
dédupliqué que si le payload et l’état d’outbox sont strictement identiques.
Toute collision, corruption ou tentative de fixture elle-même concernée par un
lot en vol bloque la migration sans effacement. Un lot ou une fusion saine ne
contenant que de vraies tentatives continue en revanche sa reprise : la
migration conserve son marqueur et ses références byte-identiques.

Le journal SQLite brut historique n’avait aucun namespace. Il est d’abord
rejoué intégralement dans `learning`, puis seule la signature exacte de fixture
est isolée. Un crash entre ces deux transactions laisse donc la source
synchronisable intacte. SQLite permet ensuite de remplacer les snapshots
anonymes `learning` et `demo` dans une transaction exclusive unique. Le
démarrage d’une fusion refait cette isolation dans la même transaction avant de
lire sa source ; le montage `Aujourd’hui` et la leçon suivent le même ordre.
Les entrées Compte (lecture, fusion ou abandon) exécutent également cette
migration avant d’observer la progression anonyme, même lorsqu’elles sont
ouvertes directement.

Une révision intermédiaire appelait par erreur la migration du journal brut
depuis le namespace `demo`. Son marqueur historique
`demo:legacy_attempt_journal_migrated_v1` constitue la preuve fermée de ce cas.
Une réparation v1 rejoue alors, une seule fois et dans la transaction des deux
snapshots, toutes les entrées non-fixture vers `learning`; la fixture exacte
reste dans `demo`. Collision, état divergent, lot démo concerné ou marqueur
corrompu annulent toute la réparation.

IndexedDB ne permet pas une transaction couvrant deux bases. Le web neutralise
donc d’abord atomiquement la fixture dans une clé de quarantaine de la base
`learning`, que la fusion ne lit jamais, puis la copie vers la base `demo` et
supprime la quarantaine après comparaison stricte. Une interruption peut laisser
une quarantaine ou une copie redondante, jamais une perte ; le rejeu termine la
copie de manière idempotente.

Une ancienne fusion déjà `awaiting_server_ack` et contenant la fixture n’est
pas réécrite automatiquement : son marqueur a pu être observé par le serveur.
Lectures, reprise, préparation de batch et application de réponse échouent alors
fermées, sans modifier les snapshots. Ce cas nécessite une procédure de
récupération explicite avant de reprendre la synchronisation.

Une nouvelle version de fixture ne remplace jamais automatiquement un
checkpoint existant. Le client récupère d’abord toute phase `submitting` en
ré-enqueueant son payload exact, puis en confirmant sa présence non rejetée
dans l’outbox propriétaire. Il affiche ensuite un abandon en deux
confirmations. La transition partagée compare le checkpoint complet attendu
pour refuser une confirmation devenue obsolète et exige que le couple cible
version/exercice soit différent. `intro` et `question` peuvent
être abandonnés sans outbox ; `submitting` et `result` exigent la tentative
durable exacte ; `completed` peut être abandonné car sa clôture a déjà franchi
cette preuve. Le remplacement et le démarrage de la fixture courante sont
persistés dans une seule transaction de l’adaptateur.

Les événements `onboarding_started` et `onboarding_completed` contiennent
uniquement la plateforme. Comme tous les événements de départ, ils utilisent le
sink nul tant que le consentement analytics n’est pas branché.

## Sémantique hors connexion

Cette tranche prouve seulement la reprise de la fixture déjà chargée sur le web
et de la fixture/audio embarqués sur mobile. Elle ne promet ni démarrage web à
froid sans réseau, ni pack de contenu, ni correction immédiate d’une vraie
leçon. `OPEN-OFFLINE-001` devra choisir entre correction différée autoritaire et
matériel local volontairement non secret avant toute généralisation.

## Conséquences

- L’onboarding et la séance interrompue survivent à un redémarrage.
- Le CTA d’`Aujourd’hui` peut distinguer commencer, reprendre, voir le résultat
  et la séance terminée sans inventer une progression parallèle.
- Une mise à jour de fixture conserve l’ancien point de reprise jusqu’à deux
  confirmations explicites et ne perd jamais une soumission en vol.
- Les adaptateurs isolent et testent le namespace `demo` ; le contrat partagé
  ne le présente pas comme une garantie de son seul champ `owner`.
- `srs-v0` reste un calcul technique, jamais une validation pédagogique.
- La fixture reste volontairement une démonstration one-shot : elle affiche la
  prochaine échéance mais ne redémarre pas encore le même couple
  version/exercice. Cette transition appartiendra au vrai plan quotidien après
  résolution de `OPEN-LEARN-001` et `OPEN-SRS-001`.
- Le vrai contenu, le plan quotidien serveur et le démarrage hors ligne à froid
  restent hors de cette décision.

## Validation attendue

- contrats et transitions d’état stricts, sérialisation et corruption ;
- persistance Dexie et SQLite avec reprise après redémarrage ;
- récupération après crash entre checkpoint `submitting` et enqueue, sans
  doublon ni rattachement approché ;
- récupération d’un `submitting` d’ancienne version, abandon explicite à deux
  confirmations et démarrage atomique de la version courante ;
- identifiants d’onboarding inconnus affichés comme choix neutres et incapables
  d’activer la finalisation ;
- onboarding → Aujourd’hui → question → reprise → résultat → clôture sur web et
  mobile ;
- analytics absentes du sink sans consentement et sans réponse d’onboarding ;
- preuve adaptateur que le namespace `demo` n’est jamais exposé à la fusion ;
- migration/rejeu d’une fixture historique, conservation des vraies tentatives,
  rollback sur conflit ou corruption et blocage d’une fusion déjà contaminée.
