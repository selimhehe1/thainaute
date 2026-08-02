# Mission Claude Code — terminer réellement Thaïnaute

Lis entièrement `AGENTS.md`, puis `docs/PROJECT_BRIEF.md`, avant toute
modification. Le brief reste la source de vérité produit et `AGENTS.md` reste
la source de vérité opérationnelle. Ce document précise le niveau de finition
attendu par le fondateur ; il ne remplace aucune décision `LOCKED`, aucun
critère d'acceptation et aucune règle de sécurité ou de contenu.

## Résultat attendu

La mission n'est pas de terminer seulement le backend, une architecture ou une
preuve technique. Elle est de livrer un produit cohérent et agréable que Selim
peut montrer, tester, faire tester puis publier :

- site public SEO réellement rédigé et illustré ;
- application web complète ;
- applications iOS et Android installables ;
- direction artistique distinctive et homogène ;
- parcours d'apprentissage réel, avec cours et révisions ;
- audio thaï traçable, enregistrement de l'apprenant et retour vocal prudent ;
- comptes, synchronisation, hors-ligne et progression ;
- freemium et paiements testés de bout en bout ;
- studio éditorial, provenance et audit linguistique ;
- confidentialité, accessibilité, observabilité et opérations ;
- builds distribuables et dossier de publication prêt.

Une fixture technique, un écran isolé ou une suite de tests verte ne constitue
pas un produit terminé. Ne jamais annoncer « terminé » tant que la définition
de fin située plus bas n'est pas prouvée point par point.

## Manière de travailler avec Selim

- Claude peut enchaîner plusieurs tranches autonomes sans attendre une validation
  de Selim entre chacune. Ne pas interrompre le travail pour demander un avis de
  confort lorsque le brief et les critères d'acceptation donnent déjà la réponse.
- Rendre néanmoins le résultat observable aux jalons significatifs : URL,
  captures, vidéo courte ou build installable, accompagnés d'un état honnête.
- Expliquer en langage simple ce qui est visible, ce qui est simulé, ce qui est
  réellement connecté et ce qui reste à faire.
- Demander Selim uniquement pour une vraie décision produit, un compte, une
  dépense, un secret, une validation légale ou une action de publication.
- Continuer avec fixtures, mocks et sandbox lorsque l'action externe n'est pas
  encore disponible, sans présenter ces substituts comme de la production.
- Ne jamais engager une dépense, créer une ressource cloud, acheter un domaine ou
  publier une application sans accord explicite au moment de l'action.
- Préserver les changements existants, travailler par branches/PR petites et
  révisables, et ne fusionner qu'avec les validations pertinentes réellement
  passantes.

## Direction artistique — exigence de refonte

L'interface actuelle est une fondation fonctionnelle, pas la direction
artistique finale. Elle doit être repensée et polie sur web, iOS et Android.

### Intention

Créer un « carnet d'exploration du thaï contemporain » : chaleureux, adulte,
lumineux, rassurant et légèrement ludique. La marque doit évoquer la découverte,
la voix et la progression sans devenir enfantine ni touristique.

Respecter la palette du brief (`jasmine`, `ink`, `coral`, `jade`, `saffron`,
`mist`) et les typographies Manrope/Noto Sans Thai, mais les utiliser dans un
véritable système visuel : hiérarchie, grilles, espacements, rayons, ombres,
icônes, illustrations, mouvement, états et densité. Les caractères thaïs doivent
rester grands, respirants et parfaitement lisibles.

### Langage visuel recommandé

- Motif de marque discret inspiré d'une trajectoire, d'une constellation ou
  d'une courbe tonale ; jamais une imitation décorative de l'écriture thaïe.
- Cartes de cours qui donnent une sensation de progression géographique, sans
  copier Duolingo ni transformer le parcours en jeu infantile.
- Visualisation claire des cinq tons par courbes, couleur secondaire, mouvement
  réduit et exemples audio ; la couleur ne doit jamais être le seul signal.
- Illustrations originales ou assets à licence vérifiée, avec un style éditorial
  cohérent. Éviter les photos de stock génériques et les emojis comme système
  d'icônes principal.
- Micro-interactions brèves et utiles : réussite, progression, reprise, audio et
  synchronisation. Elles restent désactivables et compatibles avec
  `prefers-reduced-motion`.
- Ton rédactionnel français direct, chaleureux et adulte, sans culpabilisation,
  fausse urgence ni mascotte envahissante.

### Écrans à concevoir, pas seulement à habiller

- identité : logotype final, symbole, favicon, icône d'application, splash et
  règles d'usage ;
- site : accueil, méthode, cours gratuits, guide de prononciation, articles,
  tarifs, confiance linguistique, FAQ, connexion et pages légales ;
- onboarding et première réussite sans compte ;
- Aujourd'hui, Pratiquer, Parcours et Progrès ;
- lecteur de leçon et les cinq mécaniques d'exercices ;
- laboratoire des sons et des tons ;
- enregistrement, comparaison A/B et retour vocal ;
- compte, synchronisation, abonnement, restauration, export et suppression ;
- studio de contenu ;
- états chargement, squelette, vide, erreur, hors-ligne, conflit, reprise et
  réseau lent ;
- paywall honnête, gestion du Premium et limites de quota ;
- notifications, modales, toasts et confirmations ;
- captures App Store/Google Play et visuels de lancement.

### Barre de qualité visuelle

- Vérifier au minimum le web à 390, 768 et 1440 px, ainsi que de vrais écrans
  iOS et Android.
- WCAG 2.2 AA, focus visible, clavier complet, lecteurs d'écran, cibles de
  44 × 44 points et zoom texte.
- Tester les signes combinatoires thaïs à toutes les tailles et ne jamais les
  tronquer.
- Produire des captures de référence pour chaque flux principal et effectuer une
  revue visuelle avant chaque PR d'interface.
- Supprimer les incohérences de marges, composants génériques, textes temporaires,
  fixtures visibles et écrans qui ressemblent à un tableau de bord technique.

## Produit pédagogique à réaliser

Le produit final doit contenir de vrais cours. Selim ne prévoit pas d'acheter des
cours, dictionnaires ou corpus sous licence commerciale. Ne pas acheter, copier,
adapter de trop près ni redistribuer un cours tiers. Produire des leçons originales
spécifiquement pour Thaïnaute, avec `Fable 5 ULTRA` et `GPT-5.6 SOL ULTRA` comme
atelier éditorial principal.

Utiliser les deux modèles avec des rôles séparés : l'un propose la structure,
les dialogues et les explications ; l'autre effectue une contre-relecture
linguistique, pédagogique, Unicode et de naturalité ; puis inverser les rôles
sur les cas sensibles. Conserver prompts, version du modèle, date, sortie,
incertitudes et modifications. Leur accord ne constitue toutefois ni une source
indépendante ni une approbation linguistique.

Si Claude Code ne peut pas appeler directement l'un des deux modèles dans
l'environnement disponible, préparer des lots de prompts et des formats d'import
reproductibles au lieu de remplacer silencieusement le modèle ou de prétendre
avoir obtenu sa revue. Aucun appel API facturable ne doit être lancé sans budget
explicitement autorisé.

Les modèles peuvent préparer des brouillons, des structures, des variantes et
des contrôles, mais ils ne peuvent ni servir de source factuelle ni approuver
seuls du thaï. Utiliser des sources officielles, universitaires ou ouvertes dont
les conditions permettent la consultation et la vérification, sans en copier le
contenu protégé. Écrire tous les exemples et toutes les explications de manière
originale. Tout contenu publié suit obligatoirement :

`draft -> review -> approved -> published`.

### Décision fondateur — lancement sans auditeur natif payé

Selim n'a pas le budget initial pour engager un locuteur ou auditeur thaï. Cette
absence ne doit ni arrêter le curriculum ni bloquer la première mise sur le
marché. La porte initiale de publication repose donc sur une chaîne documentée :

1. génération originale par un premier modèle ;
2. vérification phrase par phrase contre des sources identifiées ;
3. contre-audit indépendant par plusieurs modèles, dont `Fable 5 ULTRA` et
   `GPT-5.6 SOL ULTRA` ;
4. audits séparés orthographe, sens, prononciation, ton, longueur, registre,
   naturalité, Unicode et licence ;
5. blocage de tout conflit, citation introuvable ou confiance insuffisante ;
6. validation manuelle du dossier de preuve avant changement de statut ;
7. signalement simple dans l'application et correction par nouvelle version.

Conserver pour chaque fait la source, la licence, la version, la date, les
modèles/relectures et le niveau de confiance. L'application et le studio doivent
indiquer honnêtement `Revue native : en attente` ; ne jamais employer « validé
par un natif » avant que ce soit vrai.

La revue par un Thaï natif devient une phase financée uniquement si les revenus
de l'application sont suffisants. À ce moment-là, auditer d'abord les leçons les
plus utilisées et les éléments les moins confiants, corriger par versions
immuables et mesurer les erreurs découvertes pour renforcer toute la chaîne.

### Curriculum fondamental à proposer puis faire valider

Le volume minimal de bêta reste une décision `OPEN`. Préparer rapidement une
proposition chiffrée pour Selim au lieu de lancer une production massive sans
accord. La proposition doit couvrir au minimum un parcours débutant cohérent :

1. oreille française, sons, longueur vocalique et cinq tons ;
2. salutations, politesse, pronoms et présentation ;
3. chiffres, heure, dates, prix et quantités ;
4. nourriture, commandes et préférences ;
5. déplacements, directions et transports ;
6. famille, proches et interactions sociales ;
7. maison, habitudes et vie quotidienne ;
8. achats, services et résolution d'un problème simple ;
9. santé, besoins et urgence ;
10. lecture progressive de l'écriture thaïe ;
11. dialogues récapitulatifs en situation réelle ;
12. bilans de maîtrise et révisions adaptatives.

Pour permettre une décision concrète, partir d'une hypothèse de travail de
`12 unités × 5 leçons = 60 leçons`, puis faire valider ce volume, la profondeur
et le niveau cible par Selim. Ne jamais transformer cette hypothèse en engagement
publié sans sa validation.

### Contrat d'une leçon publiable

Chaque leçon doit avoir :

- objectif observable et prérequis ;
- contenu thaï versionné, segmenté et sourcé ;
- traduction française naturelle et explication originale ;
- transcription pédagogique versionnée, ton et longueur par syllabe ;
- audio thaï naturel et pédagogique, avec fournisseur, modèle ou intervenant,
  droits, version et méthode de contrôle explicitement conservés ;
- séquence courte d'enseignement puis pratique ;
- exercices d'écoute, association, ordre des mots, rappel et lecture lorsque
  pédagogiquement pertinents ;
- correction explicative, variantes autorisées et pièges connus ;
- dialogue ou micro-situation naturelle ;
- note culturelle contextualisée et sourcée si elle contient un fait ;
- items SRS et critères de maîtrise ;
- tests Unicode, schéma, licences et portes de publication ;
- validation finale de la chaîne multi-modèles et sources, avec l'état de revue
  native conservé séparément et affiché honnêtement.

Ne pas remplir artificiellement chaque leçon avec les cinq formats : utiliser le
format qui mesure réellement l'objectif, tout en garantissant les cinq mécaniques
dans le produit et une couverture équilibrée sur le parcours.

### Production audio

- Préparer les scripts, conventions de nommage, feuille de session et contrôle
  qualité avant enregistrement.
- Si aucune voix humaine n'est finançable, utiliser au lancement une voix
  synthétique thaïe clairement déclarée et préalablement comparée entre plusieurs
  fournisseurs/modèles. Ne jamais la présenter comme un enregistrement humain.
- Conserver droits, consentement éventuel, attribution, fournisseur, modèle,
  version, paramètres et fichiers sources.
- Prévoir la réenregistrement progressif par des voix natives humaines uniquement
  lorsque les revenus le permettent, en commençant par le fondamental.
- Contrôler bruit, niveau, découpe, débit, ton, longueur et correspondance exacte
  avec la version de contenu.

## Exercices et apprentissage

Livrer les cinq types canoniques sur web et mobile :

- `listening` — écoute et choix ;
- `association` — paires accessibles sans drag obligatoire ;
- `word_order` — séquence avec actions explicites déplacer/retirer ;
- `recall` — rappel dont la politique Unicode et les variantes sont auditables ;
- `reading` — lecture et compréhension.

Les réponses, corrections et clés doivent être typées, validées côté serveur et
compatibles avec checkpoint, outbox, idempotence et reprise. Aucun corrigé réel
ne doit fuiter dans le DTO public. Le SRS, la séance quotidienne, les révisions
dues, la preuve visuelle de maîtrise et la prochaine action doivent former une
boucle complète, compréhensible et identique sur les plateformes.

## Voix et cinq tons

Le MVP conserve l'enregistrement privé local et la comparaison A/B. Pour le
retour intelligent, construire une interface fournisseur indépendante et un
banc d'évaluation, pas une promesse marketing non mesurée.

Comparer au minimum :

- un modèle OpenAI qui reçoit directement l'audio de l'apprenant, la référence
  native et les métadonnées attendues ;
- un fournisseur de pronunciation assessment prenant `th-TH` en charge ;
- une analyse locale explicable du contour F0 et de la durée vocalique.

Mesurer les confusions entre les cinq tons, la reconnaissance du mot, la longueur
vocalique, les faux positifs et la stabilité entre voix. Tant qu'aucun corpus gold
natif n'est finançable, limiter la fonction à une bêta explicitement
expérimentale, afficher des résultats séparés et un niveau de confiance, et ne
faire aucune promesse de notation certaine. En cas de désaccord ou de faible
confiance, proposer de réessayer au lieu d'inventer une note. Constituer un corpus
gold avec au moins deux auditeurs natifs dès que les revenus le permettent. Toute
analyse distante exige consentement, quota serveur, stockage privé, suppression
et budget dur. Obtenir l'accord de Selim avant le premier appel facturable.

## Fonctions indispensables avant une bêta réelle

1. Parcours visible et séance quotidienne avec les cinq exercices.
2. Compte créé après la première réussite, fusion anonyme et synchronisation
   idempotente web/mobile.
3. Hors-ligne utile : contenu/audio disponibles, tentatives journalisées, reprise
   après crash et réconciliation après reconnexion.
4. Progression et SRS partagés, avec révisions dues et explication des états.
5. Studio permettant brouillon, audit, findings bloquants, version et publication.
6. Signalement apprenant sans texte sensible dans l'analytics.
7. Gratuit réellement utilisable jusqu'au bout du fondamental ; Premium limité à
   vitesse, volume, confort et fonctions coûteuses.
8. Stripe Checkout/Billing/Portal sur le web et RevenueCat sur mobile, avec
   entitlement `premium`, webhooks signés, idempotence, restauration, expiration,
   remboursement et période de grâce testés en sandbox.
9. Export et suppression complets, voix privées et purge testée.
10. Analytics soumis au consentement, Sentry/PostHog sans audio, transcription,
    email, token ou texte sensible.
11. Pages légales, support, politique de confidentialité, conditions, mentions,
    gestion des consentements et procédure d'incident.
12. Sauvegarde/restauration, monitoring, alertes, health checks, rate limits,
    quotas, rollback et runbooks.
13. Builds signés de bêta, TestFlight et piste fermée Google Play, avec parcours
    Maestro et Playwright représentatifs.

## Plan d'exécution recommandé

1. Auditer l'état réel du dépôt, les PR et les décisions `OPEN` ; ne pas supposer
   que les branches existantes sont fusionnées ou vertes.
2. Stabiliser et fusionner proprement les tranches déjà écrites.
3. Refaire la fondation visuelle et livrer une navigation cohérente testable.
4. Livrer verticalement les cinq exercices avec reprise web/mobile.
5. Faire valider le curriculum et le volume de bêta, puis produire les leçons par
   unités complètes plutôt que des dizaines de brouillons dispersés.
6. Exécuter la chaîne de génération, sources et audits multi-modèles, produire
   l'audio traçable et publier seulement les versions ayant franchi ces portes.
7. Finaliser hors-ligne, synchronisation, quotas et progression.
8. Implémenter et tester les paiements en sandbox.
9. Construire et évaluer le retour vocal ; ne l'activer que si les métriques sont
   suffisantes.
10. Faire les audits accessibilité, sécurité, RGPD, performance et boutiques.
11. Distribuer une bêta privée de quatre semaines, corriger les problèmes réels,
    puis préparer le go/no-go de lancement.

## Actions que seul Selim peut débloquer

Préparer tout ce qui peut l'être, puis demander une action précise au bon moment :

- résultat et décision de clearance INPI/EUIPO, domaines et dépôt de marque ;
- choix du volume de cours et du niveau cible de la bêta ;
- lorsque les revenus le permettront, budget et recrutement d'un auditeur thaï
  natif et de voix humaines ; ces éléments ne bloquent pas le lancement initial ;
- comptes et accès Apple, Google, Supabase, Vercel, Stripe, RevenueCat, Sentry,
  PostHog et fournisseur vocal ;
- prix, essai, pays de lancement, TVA/fiscalité et validation comptable ;
- politique concernant les mineurs et durées de rétention ;
- budget explicite pour les benchmarks IA ;
- validation juridique des textes et action finale de publication.

Ne pas regrouper toutes ces questions dès le début. Demander seulement celle qui
bloque la prochaine tranche démontrable.

## Définition stricte de « produit totalement terminé »

Thaïnaute n'est terminé que lorsque les preuves suivantes existent :

- aucun écran principal n'affiche de fixture, placeholder ou texte technique ;
- le parcours convenu est original, sourcé, audité par la chaîne multi-modèles,
  enregistré et publié, avec l'absence de revue native clairement tracée ;
- un nouvel utilisateur peut apprendre sans compte, réussir, créer son compte et
  retrouver exactement sa progression sur web, iOS et Android ;
- les cinq formats, le SRS, le hors-ligne, la reprise et la synchronisation ont des
  tests représentatifs passants ;
- le gratuit permet d'atteindre toutes les bases au rythme prévu ;
- les achats et restaurations fonctionnent dans toutes les sandboxes, y compris
  expiration, doublon, remboursement et grâce ;
- export, suppression, purge vocale et consentements sont testés ;
- le rendu est visuellement revu sur les quatre plateformes et satisfait
  l'accessibilité requise ;
- lint, types, tests, contenu, RLS, E2E, builds et audits pertinents sont verts ;
- sauvegarde/restauration et rollback ont été réellement exercés ;
- les builds de bêta sont installables et les pages de boutique sont prêtes ;
- les décisions ouvertes nécessaires sont signées par Selim et documentées ;
- un rapport go/no-go liste les preuves, risques résiduels et actions manuelles ;
- la publication finale attend encore une instruction explicite de Selim.

## État de reprise à vérifier immédiatement

Au dernier passage Codex, le dépôt était propre sur
`feature/analytics-consent-v1` au commit `0d5b4e3`, avec une pile de PR #9 à #17.
Les jobs GitHub de #9 et #10 étaient verts, mais SonarCloud était annulé. À partir
de #11, un test web de reprise était intermittent et l'E2E Supabase connecté
échouait par timeout ou readiness `503`. Cet état peut avoir changé : vérifier
Git, GitHub et les logs avant d'agir.

La démonstration locale se lance avec :

```powershell
pnpm dev:web
```

puis `http://localhost:3000/today`. Elle prouve plusieurs fondations, mais utilise
encore une fixture technique et ne doit pas être confondue avec le cours final.
