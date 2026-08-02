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

Le snapshot d’expérience n’est jamais une source de progression. Il réserve
d’abord le payload et l’`eventId` exacts dans `submitting`, puis l’adaptateur
écrit ce même payload dans l’outbox durable. Après un arrêt entre ces deux
écritures, la reprise réessaie le même enqueue idempotent. Elle ne passe à
`result` que si cette tentative exacte est présente et non rejetée ; aucune
recherche approchée par exercice ou date n’est autorisée.

Les adaptateurs conservent le même JSON strict : Dexie sur le web et une table
SQLite locale sur mobile. Une valeur corrompue est signalée et conservée ; elle
n’est jamais remplacée silencieusement par un état vide.

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
- Les adaptateurs isolent et testent le namespace `demo` ; le contrat partagé
  ne le présente pas comme une garantie de son seul champ `owner`.
- `srs-v0` reste un calcul technique, jamais une validation pédagogique.
- Le vrai contenu, le plan quotidien serveur et le démarrage hors ligne à froid
  restent hors de cette décision.

## Validation attendue

- contrats et transitions d’état stricts, sérialisation et corruption ;
- persistance Dexie et SQLite avec reprise après redémarrage ;
- récupération après crash entre checkpoint `submitting` et enqueue, sans
  doublon ni rattachement approché ;
- onboarding → Aujourd’hui → question → reprise → résultat → clôture sur web et
  mobile ;
- analytics absentes du sink sans consentement et sans réponse d’onboarding ;
- preuve adaptateur que le namespace `demo` n’est jamais exposé à la fusion.
