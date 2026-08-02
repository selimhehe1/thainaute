# ADR-0009 — Enregistrement serveur des appareils

- Statut : Accepted
- Date : 2026-08-01

## Contexte

Les tentatives synchronisées référencent un appareil durable. Autoriser le
client à insérer directement `profiles` et `devices` laisserait deux chemins de
création concurrents et compliquerait la garantie qu'un UUID d'installation ne
change jamais de propriétaire.

## Décision

`POST /api/v1/devices/register` est l'unique chemin de création d'un profil et
d'un appareil après vérification du jeton Supabase. Le corps strict contient
seulement `deviceId`, `platform` et `appVersion`. L'identité du compte provient
du claim `sub` vérifié côté serveur, confirmé par une relecture `getUser` du
même Bearer et comparé à `user.id`. Un compte anonyme ou supprimé est refusé.

La route appelle `register_device_v1` avec la clé Supabase secrète. Cette RPC
est `SECURITY INVOKER`, exécutable uniquement par `service_role`, et crée le
profil et l'appareil dans une transaction PostgreSQL. Les insertions directes
de `authenticated` sont révoquées.

L'UUID d'appareil est la clé naturelle d'idempotence. Un rejeu par le même
compte et la même plateforme retourne le même enregistrement et actualise
uniquement `app_version` si la version applicative a changé. Il ne crée pas un
nouvel appareil. Une collision de propriétaire ou de plateforme est refusée
avec un code fermé ; aucun transfert implicite n'est possible.

Un compte peut enregistrer au plus **20 appareils**. La RPC verrouille la ligne
`profiles` du compte avant de compter puis d'insérer : deux créations
concurrentes avec des UUID différents ne peuvent donc pas dépasser le plafond.
La recherche d'un appareil existant précède le comptage, afin qu'un rejeu exact
reste disponible au plafond. Un nouvel appareil au-delà de la limite produit le
SQLSTATE stable `TD004`, traduit en `409 device_limit_reached` sans exposer la
base.

Vingt installations laissent une marge aux réinstallations et aux usages
multi-appareils tout en bornant les écritures obtenues par un compte compromis.
Ce quota transactionnel ne remplace pas la limitation de débit HTTP. Avant la
bêta, une révocation explicite devra permettre de libérer une place sans
transférer silencieusement un UUID existant.

## Conséquences

- les clients doivent s'enregistrer avant d'envoyer leurs tentatives ;
- le vingt-et-unième appareil est refusé tant qu'une révocation explicite n'a
  pas libéré de place ;
- `app_version` représente la dernière version déclarée lors d'un
  enregistrement propriétaire réussi, pas une présence courante ;
- un futur suivi de dernière activité utilisera une mutation séparée et
  explicitement autorisée ;
- pgTAP, les tests RLS et les Security Advisors locaux restent des portes à
  chaque changement de schéma et avant toute promotion.

## Retour arrière

Un retour arrière se fait par une nouvelle migration : révoquer l'exécution de
`register_device_v1`, puis supprimer la fonction après retrait de la route. Ne
restaurer les anciens `GRANT INSERT` et policies client qu'avec une version
cliente explicitement compatible, car cela réouvrirait un second chemin
d'écriture. Les profils et appareils déjà créés restent valides et ne doivent
pas être supprimés.

## Références

- [Supabase — fonctions et privilèges d'exécution](https://supabase.com/docs/guides/database/functions)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
