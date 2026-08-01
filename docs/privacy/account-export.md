# Checklist de confidentialité — export de compte

Cette checklist complète l’[ADR-0014](../adr/0014-portable-account-export-v1.md).
Elle couvre la première version synchrone de l’export et ne vaut pas procédure
de suppression du compte.

## Périmètre remis à l’utilisateur

- [x] Identité Auth limitée à l’UUID, aux coordonnées du compte, aux dates de
      cycle de vie et aux noms de fournisseurs de connexion.
- [x] Profil, appareils, tentatives et progression synchronisés uniquement.
- [x] Absence de `user_metadata`, identités OAuth détaillées, jetons, secrets,
      données de paiement, journaux internes et réponses idempotentes.
- [x] Exclusion explicite des prises de voix, de la progression anonyme, des
      tentatives encore locales et des caches hors ligne.
- [x] Contrat JSON fermé, versionné et validé avant remise.

## Contrôles serveur

- [x] Jeton vérifié par Supabase Auth avec `getClaims` et `getUser`, puis
      identité liée au `sub` et au claim `is_anonymous` vérifiés ; aucun
      identifiant utilisateur n’est accepté en entrée.
- [x] Lectures avec clé publiable et JWT utilisateur sous RLS, avec filtre
      propriétaire explicite ; aucune clé `service_role` dans ce chemin.
- [x] Bornes strictes et refus du document entier plutôt que troncature.
- [x] Détection d’une mutation pendant la lecture et un seul nouvel essai.
- [x] Réponses `no-store`, délai global et journal opérationnel sans donnée
      exportée, email, UUID utilisateur ni jeton.
- [x] Le point d’instrumentation `account_export_requested` ne porte que la
      plateforme et reste derrière un sink soumis au consentement ; le produit
      utilise le sink nul tant qu’aucun consentement analytics n’est branché.

## Remise web et mobile

- [x] Le client relit la session après la réponse et refuse un document dont le
      sujet ne correspond pas au compte attendu.
- [x] Une frontière de session annule l’opération et invalide tout résultat en
      vol ; le document n’est jamais conservé dans l’état React.
- [x] Le web crée une URL objet temporaire, déclenche le téléchargement, puis la
      révoque.
- [x] Le mobile utilise uniquement un chemin applicatif dédié du cache privé,
      ouvre le panneau natif sur action explicite, puis tente une purge ciblée.
- [x] Le nom de fichier est neutre : aucun email, UUID ou autre identifiant.
- [x] Un échec de purge mobile est affiché et bloque un nouvel export jusqu’à
      ce que le cache dédié puisse être supprimé.

## Limites à expliquer honnêtement

- Le panneau web ou natif remet ensuite le fichier à l’emplacement ou à
  l’application choisis par l’utilisateur ; Thaïnaute ne peut plus garantir sa
  suppression après cette remise.
- Un arrêt brutal du processus mobile ou un refus natif d’effacement peut
  laisser le fichier temporaire dans le cache privé jusqu’à la prochaine purge
  applicative ou celle du système d’exploitation.
- Les données modifiées seulement hors ligne ne figurent pas dans l’export tant
  qu’elles n’ont pas été synchronisées ; l’export ne déclenche jamais cette
  synchronisation implicitement.
- Un compte dépassant les bornes reçoit une erreur sans fichier partiel. Une
  future voie asynchrone devra définir son stockage chiffré et sa rétention
  avant toute implémentation.

## Validation avant bêta

- [ ] Parcours connecté A/B/anonyme contre Supabase local.
- [ ] Téléchargement réel web et parsing du fichier obtenu.
- [ ] Partage puis purge sur appareils iOS et Android reconstruits.
- [ ] Interruption réseau, changement A→B et expiration de session pendant
      chaque étape de la remise.
- [ ] Relecture juridique de la copie utilisateur et intégration à la politique
      de confidentialité publique.
