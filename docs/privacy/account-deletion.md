# Checklist confidentialité — suppression de compte v1

Cette checklist applique l'[ADR-0016](../adr/0016-replayable-account-deletion-v1.md).
Elle ne vaut pas preuve de production tant que les contrôles distants et les
appareils réels ne sont pas cochés.

## Avant l'effet destructif

- [x] Action distincte de la déconnexion et de la suppression de progression
      anonyme.
- [x] Conséquences irréversibles, données locales et export préalable expliqués.
- [x] Double confirmation explicite et OTP email récent.
- [x] `shouldCreateUser: false` pour la réauthentification.
- [x] Même UUID vérifié avant et après l'OTP.
- [x] Bearer vérifié par `getClaims` et `getUser`, comptes anonymes refusés.
- [x] `session_id` encore présent dans `auth.sessions` pour le même sujet.
- [x] Corps, taille, média, UUID et continuation validés strictement.
- [ ] Limitation de débit compte/IP et protections hébergées validées
      (`OPEN-API-001`).

## Reprise et secrets

- [x] Continuation CSPRNG de 32 octets persistée avant le premier appel.
- [x] Continuation absente des réponses, erreurs, logs et analytics.
- [x] HMAC à domaines séparés avec pepper serveur dédié.
- [x] Reçu durable créé avant Storage/Auth et rejouable sans Bearer.
- [x] Seul `user_not_found` avec statut `404`, après reçu durable, vaut
      « déjà supprimé » ; les erreurs d'autorisation restent fermées.
- [x] UUID cible nullifié au reçu final ; aucun secret brut en PostgreSQL.
- [x] FK/trigger finalisent les reçus dans la transaction du hard delete Auth.
- [ ] Rétention des reçus et rotation du pepper décidées (`OPEN-SYNC-002`).

## Données distantes

- [x] FK profil, appareils, tentatives, projection et commits en cascade.
- [x] Relation tentative/appareil en cascade pour ne pas bloquer Auth.
- [x] Registre privé avec RLS, grants minimaux et RPC `SECURITY INVOKER`.
- [x] Aucun bucket utilisateur dans la v1 ; registre Storage explicitement vide.
- [ ] Toute future voix ou fichier distant ajouté au registre et supprimé par
      l'API Storage avant Auth.
- [ ] Migration et 62 tests pgTAP exécutés contre Supabase réel/local.
- [ ] Security et Performance Advisors triés sur preview.

## Appareil initiateur

- [x] Namespace du compte purgé après reçu serveur uniquement.
- [x] Progression anonyme, onboarding et identité d'installation conservés.
- [x] Aucun autre compte local déconnecté ou purgé lors d'un changement de sujet.
- [x] Opération pendante conservée si réseau ou purge locale échoue.
- [x] Création web sérialisée entre onglets ; absence de Web Locks fermée.
- [x] Tombstone opaque et purge du namespace compte dans une même transaction.
- [x] Toute mutation compte relit le tombstone et rejette les réponses tardives.
- [x] Un événement inter-onglets n'annonce un succès qu'après preuve du
      tombstone ; une clé de reprise disparue seule est un incident bloqué.
- [x] Cache d'export mobile ciblé ; voix locale couverte par la frontière de
      session existante.
- [ ] Parcours complet reconstruit sur iPhone réel.
- [ ] Parcours complet reconstruit sur Android réel.

## Paiements futurs

- [x] Aucun droit Premium ni abonnement n'existe dans la tranche actuelle.
- [ ] Annulation RevenueCat/Stripe, factures à conserver et webhooks désordonnés
      définis avant activation des paiements (`OPEN-BILL-001`).
