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
- [x] Preflight billing exécuté après Auth/OTP mais avant la création d'un
      nouveau reçu ; une indisponibilité statique ne crée donc pas de reçu
      serveur inutile.
- [x] Étape de coordination billing appelée avec le `receipt_id` durable avant
      Storage/Auth et rejouée avec le même identifiant après une panne.
- [x] Même en mode billing `disabled`, la base doit prouver l'absence de toute
      identité, entitlement ou événement billing avant le reçu puis avant les
      effets destructifs. Toute trace ou panne de lecture échoue fermée.
- [x] Toute valeur billing active ou invalide échoue fermée avant la création
      d'un nouveau reçu, la purge, la révocation et le hard delete.
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
- [x] Migrations et tests pgTAP ciblés exécutés contre Supabase local.
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

## Paiements et suppression

- [x] Le workflow gratuit conserve son ordre et ses effets lorsque
      `THAINAUTE_BILLING_MODE=disabled`, mais seulement après deux preuves
      négatives de `billing_has_history_v1` ; un ancien événement suffit à le
      fermer.
- [x] Une configuration billing active sans coordinateur externe durable et
      idempotent ne peut supprimer ni Auth ni les mappings de facturation.
- [x] La readiness expose
      `account_deletion_billing_coordinator_missing` pour tout mode actif et
      exige aussi une configuration Supabase/suppression cohérente.
- [x] `billing_unavailable` n'est pas relancé toutes les 30 secondes par les
      bootstraps web/mobile ; la commande locale reste conservée sans boucle et
      une reprise manuelle demeure proposée après une panne transitoire.
- [x] L'interface n'assimile pas la suppression du compte à l'annulation d'un
      abonnement App Store, Google Play ou Stripe.
- [ ] Implémenter le coordinateur réel par fournisseur : état durable par
      `receipt_id`, reprise après panne, traitement des webhooks tardifs et
      preuve de l'absence d'un renouvellement avant le hard delete.
- [ ] Sérialiser le futur coordinateur actif avec les webhooks. Les deux
      lectures actuelles réduisent la fenêtre de course du mode désactivé sans
      constituer une transaction atomique avec les fournisseurs externes.
- [ ] Faire valider les politiques d'échéance, remboursement, factures et
      rétention. Cette protection n'annule volontairement aucun abonnement et
      ne prétend pas pouvoir annuler un achat Apple côté serveur.
