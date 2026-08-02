# Mesure facultative et consentement

- Portée : préversion locale de Thaïnaute
- Version : 1
- Dernière mise à jour : 2 août 2026

## État actuel

Thaïnaute n'envoie actuellement aucune mesure produit à un fournisseur distant.
Le transport analytics est désactivé par défaut et aucun projet PostHog, cookie
analytics ou identifiant publicitaire n'est configuré dans cette tranche.

L'application permet néanmoins de choisir dès maintenant entre autoriser ou
refuser une future mesure facultative. L'absence de choix équivaut à un refus
technique : aucun événement n'est conservé pour un envoi ultérieur.

## Ce que la porte pourra autoriser

Le catalogue actuel décrit uniquement des étapes bornées comme le début ou la
fin d'un onboarding, d'une leçon ou d'une révision, ainsi que la plateforme. Il
peut inclure une version opaque de leçon, le type fermé d'exercice, un résultat
booléen et une tranche de durée.

Il exclut les emails, numéros de téléphone, tokens, réponses libres, contenus
linguistiques saisis, audio, transcriptions, URI locales et identifiants de
compte. Un événement qui ne correspond pas exactement au catalogue est rejeté.

## Où le choix est conservé

- Web : stockage local du navigateur, synchronisé entre les onglets du même
  site.
- iOS et Android : base SQLite privée de l'installation.

Le snapshot contient seulement l'état du choix, sa version, sa révision et la
date du dernier changement. Il est indépendant du compte Thaïnaute, n'est pas
inclus dans l'export du compte et n'est pas transféré lors d'une synchronisation.

Le choix persiste jusqu'à sa modification, l'effacement du stockage du site ou
la désinstallation de l'application.

## Modifier ou retirer le choix

Le centre « Confidentialité » permet d'accepter, refuser ou retirer à tout
moment. Le retrait coupe immédiatement les futurs événements dans l'application
ouverte et demande au stockage local de conserver ce refus. Aucun événement
passé n'est rejoué lors d'une acceptation ultérieure.

Sur mobile, un marqueur local de refus reste prioritaire sur l'ancien choix. Il
n'est retiré que si un nouvel accord explicite est enregistré dans la même
transaction ; un redémarrage ne restaure donc pas silencieusement l'ancien
accord.

Une préférence absente ou illisible ferme la mesure. L'interface demande alors
un nouveau choix explicite ; elle n'active jamais la mesure par déduction.

La permission microphone et le consentement marketing restent des décisions
séparées. Refuser la mesure n'empêche aucune leçon, fonctionnalité gratuite,
export ou suppression de compte.

## Avant toute activation distante

Une tranche ultérieure devra documenter et faire valider le fournisseur, la
région de traitement, les sous-traitants, les durées de conservation, la purge
de l'identifiant local, les variables de configuration et les tests réseau. Le
présent document n'autorise aucune activation distante.

Même si son état vaut `granted`, le choix local v1 ne pourra pas être repris
pour cette activation. Le schéma devra changer, l'ancien choix redevenir
techniquement `unknown` et une information complète devra précéder un nouvel
accord explicite avant tout envoi.
