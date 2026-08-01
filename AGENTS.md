# AGENTS.md

## Mission

Construire Thaïnaute conformément à `docs/PROJECT_BRIEF.md`.

Le brief est la source de vérité produit. Ce fichier définit la manière de travailler. En cas de contradiction : sécurité et législation, décisions `LOCKED`, critères d'acceptation, architecture, puis recommandations.

## Avant toute modification

1. Lire entièrement ce fichier et `docs/PROJECT_BRIEF.md`.
2. Inspecter le dépôt, les instructions imbriquées et les changements existants.
3. Identifier les décisions et critères d'acceptation concernés.
4. Consulter les documentations et changelogs officiels des dépendances touchées.
5. Présenter un plan court pour tout changement non trivial.
6. Ne pas continuer si une décision `OPEN` change matériellement le produit.

## Décisions non négociables

- Une base commune de comptes, contenu, progression et entitlements pour toutes les plateformes.
- Le parcours fondamental reste accessible gratuitement au rythme défini dans le brief.
- Le Premium vend vitesse, volume, confort et fonctions coûteuses, pas l'accès aux bases.
- Aucun contenu linguistique publié sans provenance, version et audit.
- Aucun conflit linguistique non résolu ne peut être publié.
- L'IA produit des brouillons et signale l'incertitude ; elle n'est pas une source.
- Les droits Premium et quotas sont autoritaires côté serveur.
- Les voix sont locales et privées par défaut, puis supprimables.
- Aucun secret, token, email, texte libre sensible ou audio dans le code, les logs ou l'analytics.
- Aucune action de production, publication, achat ou création de ressource cloud sans instruction explicite.

## Architecture

- Node.js 24 LTS, TypeScript strict, pnpm workspaces et Turborepo.
- Next.js App Router pour site, web app, studio et API `/api/v1`.
- Expo Router/React Native pour iOS et Android.
- Supabase pour Postgres, Auth et Storage.
- RevenueCat pour les achats mobiles et l'entitlement partagé ; Stripe Billing/Checkout pour le web.
- Partager le domaine métier, le SRS, la synchronisation, les schémas, contrats et design tokens.
- Ne pas forcer le partage des composants web et natifs.
- Ne pas ajouter de microservice sans mesure démontrant que le monolithe ne suffit pas.
- Toute API publique est versionnée, validée avec Zod et documentée.
- Toute mutation répétable reçoit une clé d'idempotence.

## Dépendances

- Vérifier la version stable courante et les notes de rupture avant installation.
- Épingler les versions exactes et enregistrer `pnpm-lock.yaml`.
- Expliquer le besoin, la licence, le coût et l'alternative avant une dépendance importante.
- Préférer une dépendance maintenue et ciblée à un framework supplémentaire.
- Ne jamais modifier manuellement un fichier généré.

## Supabase et données

- RLS obligatoire sur toute table d'un schéma exposé.
- Accorder explicitement les privilèges Data API nécessaires ; ne pas supposer l'auto-exposition.
- Une politique `TO authenticated` doit aussi vérifier le propriétaire de la ligne.
- Les mises à jour ont `USING` et `WITH CHECK`.
- Utiliser `app_metadata`, jamais `user_metadata`, pour une autorisation.
- Les vues accessibles au client utilisent `security_invoker`.
- Ne jamais placer une clé secrète ou `service_role` dans le web ou le mobile.
- Ne jamais ajouter `SECURITY DEFINER` pour contourner une erreur de permission.
- Tester chaque politique avec au moins utilisateur A, utilisateur B et anonyme.
- Créer les migrations avec la CLI, puis exécuter les advisors et les tests adaptés.
- Contenu publié immuable ; une correction crée une nouvelle version.

## Paiements et quotas

- Entitlement initial unique : `premium`.
- Même identifiant stable RevenueCat et Supabase.
- Webhooks signés, idempotents et résistants aux événements en double ou désordonnés.
- Vérification Premium et quotas côté serveur avant toute ressource coûteuse.
- Stripe : Billing + Checkout Sessions + Customer Portal ; pas de renouvellement artisanal par PaymentIntent.
- Utiliser une clé Stripe restreinte et les secrets de plateforme, jamais des clés commitées.
- Ne pas activer Stripe Tax sans inscriptions actives et validation comptable.
- Revérifier les règles Apple et Google courantes avant l'implémentation et avant publication.

## Contenu thaï

- Utiliser uniquement les sources autorisées par `docs/PROJECT_BRIEF.md` et la politique de contenu.
- Auditer séparément orthographe, sens, prononciation, ton, longueur vocalique, registre et naturalité.
- Conserver source, licence, version, date et niveau de confiance.
- Ne jamais copier ou redistribuer un dictionnaire ou corpus au-delà de sa licence.
- Une sortie IA reste `draft` jusqu'au passage de toutes les portes de publication.
- Un désaccord crée un `audit_finding` et bloque la publication.
- Ne pas normaliser, réordonner ou tronquer silencieusement les signes thaïs Unicode.
- Exécuter `pnpm content:validate` et `pnpm content:audit` après toute modification de contenu.

## Sécurité et confidentialité

- Autorisation vérifiée côté serveur et principe du moindre privilège.
- Validation stricte des entrées et fichiers audio.
- Buckets vocaux privés, URL signées courtes et purge documentée.
- Consentements séparés pour microphone, analytics non essentiels et marketing.
- Aucun audio, transcription, email ou token dans PostHog/Sentry.
- Export et suppression de compte couverts par des tests.
- Ne jamais affaiblir une protection pour faire passer un test.

## Expérience et accessibilité

- Une action principale évidente par écran.
- Traiter chargement, vide, erreur, réseau lent, hors ligne et reprise.
- Zones tactiles minimales de 44 × 44 points.
- WCAG 2.2 AA sur le web ; libellés et ordre de lecture natifs sur mobile.
- Respecter la réduction des animations.
- Tester l'écriture thaïe, les signes combinatoires et les tailles de police sur les quatre plateformes.
- Pas de dark pattern, vies punitives, faux rabais ou culpabilisation.

## Travail par tranches

- Préférer une capacité verticale démontrable à plusieurs couches inachevées.
- Ne pas commencer par produire des dizaines de leçons.
- La première tranche doit couvrir contenu → audio → exercice → tentative → maîtrise → prochaine révision sur web et mobile.
- Enregistrer toute décision d'architecture importante dans `docs/adr/`.
- Ne pas étendre le périmètre pendant une correction ciblée.

## Validation

Exécuter les commandes pertinentes parmi :

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm content:validate`
- `pnpm content:audit`
- `pnpm db:test`
- `pnpm test:e2e:web`
- `pnpm test:e2e:mobile`
- `pnpm build`

Ne jamais déclarer un test réussi sans l'avoir exécuté. Si une commande ne peut pas être lancée, expliquer précisément pourquoi et ce qui reste non vérifié.

## Compte rendu final

Toujours indiquer :

- résultat utilisateur livré ;
- fichiers principaux modifiés ;
- commandes et tests réellement exécutés ;
- migrations, dépendances et variables ajoutées ;
- limites, risques et prochaine tranche recommandée.
