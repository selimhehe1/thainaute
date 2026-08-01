# ADR-0012 — Enregistrement vocal local et éphémère

- Statut : Accepted
- Date : 1er août 2026
- Complète : DEC-009 et la tranche vocale locale du MVP
- Ne résout pas : OPEN-PRIVACY-001

## Contexte

Le MVP doit permettre à l’apprenant de s’enregistrer puis de comparer sa voix
avec un modèle audio, sans créer prématurément une collecte vocale distante. Une
voix est une donnée personnelle sensible dans son usage : une simple URI, un
nom de fichier ou une erreur native peut aussi révéler des informations qu’il
ne faut ni synchroniser ni journaliser.

Cette tranche doit donc fonctionner sans compte, hors ligne et sans dépendre
d’un serveur. Elle ne couvre ni transcription, ni reconnaissance de parole, ni
notation tonale distante.

## Décision

### Périmètre local uniquement

L’enregistrement reste exclusivement sur l’appareil qui l’a créé :

- les applications natives utilisent le cache applicatif générique privé dans
  lequel `expo-audio` 57.0.3 crée les enregistrements, exclu des sauvegardes et
  non visible dans la galerie ou les fichiers partagés ; cette version ne
  permet de configurer ni le nom du fichier ni un répertoire vocal dédié ;
- le web conserve le `Blob` en mémoire et son URL d’objet pour la durée de la
  session d’exercice ; il n’écrit ni dans IndexedDB, ni dans `localStorage`, ni
  dans un cache de Service Worker ;
- un seul enregistrement apprenant peut être actif ou conservé à la fois dans
  l’exercice ; une nouvelle prise supprime l’ancienne avant de commencer ;
- aucune URI, aucun octet audio et aucune métadonnée de prise ne rejoint
  l’outbox, Supabase, une API, un export de compte ou un mécanisme de
  synchronisation.

La durée maximale est de **20 secondes**. L’interface affiche la durée restante
et arrête automatiquement la capture à la borne, mesurée avec une horloge
monotone lorsque la plateforme le permet. Une prise qui ne peut pas être
finalisée proprement est supprimée, jamais conservée comme fichier partiel.

### Permission microphone

La permission est demandée juste à temps, uniquement après une action explicite
« S’enregistrer ». Elle n’est demandée ni au démarrage, ni pendant
l’onboarding, ni pour lire un audio existant.

Avant l’invite système, l’interface explique en français que la voix reste sur
l’appareil et peut être supprimée immédiatement. Seule la permission microphone
est demandée ; cette tranche ne demande aucune permission biométrique, de
reconnaissance vocale, de fichiers, de contacts ou de publicité.
L’introspection Expo est vérifiée par
`pnpm --filter @thainaute/mobile run config:check` : elle bloque notamment Face
ID, le stockage externe, les overlays, la vibration et l’audio en arrière-plan.

Les états suivants sont distincts et accessibles :

- permission encore indéterminée ;
- permission accordée ;
- permission refusée pour cette tentative, avec possibilité de réessayer ;
- permission bloquée par le système, avec une instruction pour ouvrir les
  réglages ;
- microphone indisponible ou déjà utilisé.

Un refus laisse tout le reste de la leçon utilisable et ne déclenche aucune
culpabilisation.

### Cycle de vie et suppression

« Supprimer ma prise » révoque d’abord toute lecture en cours, libère les
ressources audio, efface immédiatement le fichier de cache natif ou révoque
l’URL d’objet web, puis retire la référence de l’état d’interface. Il n’existe
ni corbeille, ni délai de grâce, ni copie cachée.

La même suppression est exécutée lors :

- du remplacement par une nouvelle prise ;
- de la sortie de l’exercice ou de la déconnexion ;
- du passage de l’application en arrière-plan pendant une capture ;
- d’une interruption, d’une révocation de permission ou d’une erreur de
  finalisation.

La fermeture normale d’un écran ne doit pas dépendre d’une future tâche réseau
pour terminer cette suppression.

Sur Android, l’ouverture du panneau système émet un événement `blur` sans
nécessairement faire passer `AppState` en arrière-plan. Cet événement invalide
toute préparation, capture ou lecture en cours et empêche une reprise native
tardive. Une prise B déjà finalisée reste toutefois disponible : elle n’est
supprimée qu’à la sortie, à une interruption de route ou sur action explicite.

Un crash natif peut interrompre ce nettoyage et laisser un fichier orphelin
dans le cache privé générique jusqu’à sa purge par le système d’exploitation.
L’application ne persiste pas l’URI pour tenter un nettoyage différé. Une
garantie de scan et de purge ciblés au démarrage attend une future capacité sûre
permettant d’identifier uniquement les fichiers créés par cette fonction, sans
inspecter ni supprimer indistinctement le cache applicatif.

### Erreurs, interruptions et concurrence

La capture suit une machine d’état explicite : `idle`, `requesting_permission`,
`recording`, `recorded`, `playing`, `deleting` et `error`. Les commandes
incompatibles sont ignorées ou refusées de façon déterministe : deux captures
ne peuvent jamais être actives simultanément.

Un appel entrant, une perte de focus audio, un changement de route audio, le
passage en arrière-plan, une permission révoquée, un manque d’espace ou une
erreur du moteur arrête la capture et supprime la prise incomplète. L’utilisateur
reçoit un message fixe et sûr, puis peut recommencer. Les messages natifs, URI,
noms de fichiers, durées exactes et objets d’erreur ne sont pas recopiés dans
les logs ou l’interface.

Une interruption de lecture libère le lecteur sans créer de copie. La prise
locale déjà finalisée reste supprimable tant que l’exercice est ouvert.

### Barrière native et validation avant lecture

`expo-audio` 57.0.3 ne fournit pas, seul, le contrat fail-closed requis. Sur
iOS, son implémentation amont met l’enregistreur en pause lors d’une
interruption, peut tenter de le reprendre ensuite et ne respecte pas toujours
le booléen `successfully` du délégué de finalisation. Apple ne garantit par
ailleurs pas l’appel du délégué de fin lorsque l’arrêt est provoqué par une
interruption. Sur Android, le module ne relie pas les notifications de
connexion ou déconnexion d’un périphérique audio au cycle du recorder.

La dépendance exacte est donc corrigée de manière reproductible avec
[`patches/expo-audio@57.0.3.patch`](../../patches/expo-audio@57.0.3.patch),
déclaré dans `pnpm-workspace.yaml` et dont l’empreinte est verrouillée dans
`pnpm-lock.yaml`. Sur iOS, le correctif :

- transforme toute interruption d’une prise logiquement active en arrêt
  terminal, sans reprise automatique ;
- émet lui-même exactement un terminal d’échec, y compris lorsque le délégué
  Apple ne sera jamais rappelé ;
- ignore l’éventuel rappel tardif et recrée le recorder avant la prise suivante
  afin qu’un événement ancien ne puisse pas être attribué à une nouvelle
  prise ;
- traite une finalisation `successfully == false` comme un échec sans URI
  jouable ;
- ferme le recorder avant toute suppression sur échec de préparation, de
  démarrage ou d’encodage, interruption et libération, puis supprime uniquement
  l’URL interne concernée ; les callbacks déjà en file après libération sont
  ignorés et un arrêt provoqué par une erreur ne peut pas émettre un second
  terminal.

Sur iOS, l’ajout ou le retrait d’un périphérique audio arrête aussi toute prise
active. Sur Android, le correctif enregistre un `AudioDeviceCallback` pendant
la vie du module, arrête toute prise active lors d’une connexion ou
déconnexion, libère le `MediaRecorder`, puis émet un terminal d’échec unique ;
le callback est désenregistré à la destruction du module. Aucun de ces
mécanismes n’ajoute de permission système.

Android sérialise en outre les mutations du recorder et vérifie l’identité
native exacte dans chaque callback tardif. Le chemin de sortie d’une nouvelle
préparation reste provisoire et lié à sa génération : il n’est publié qu’après
`MediaRecorder.prepare()` et seul ce nouveau chemin est supprimé si la
préparation échoue, sans toucher une prise précédente. Un arrêt en échec, une
interruption ou la libération ferme le recorder puis supprime le chemin exact,
y compris si une préparation concurrente recrée le fichier après un premier
effacement. La surveillance de route effective commence à l’API 28,
`isClientSilenced` à l’API 29 et `setPrivacySensitive` à l’API 30 ; les versions
antérieures gardent le callback global de périphériques mais doivent être
consignées comme couverture réduite dans la recette réelle.

Sur les deux plateformes, un passage en arrière-plan lorsque l’enregistrement
de fond est désactivé produit le même arrêt terminal au lieu d’une pause. Le
retour au premier plan ne reprend jamais automatiquement un recorder ni un
lecteur. L’adaptateur TypeScript remet immédiatement en pause toute reprise
native inattendue qui franchirait néanmoins cette première barrière.

L’adaptateur TypeScript ajoute une seconde défense indépendante : une époque
invalidée par arrière-plan, perte de focus de route ou démontage après chaque
frontière asynchrone ; un latch terminal propre à chaque prise ; un délai
maximum de deux secondes armé avant l’appel à `stop()`, donc couvrant aussi une
promesse `stop()` bloquée ; et un recorder verrouillé jusqu’au remontage de
l’écran si ce terminal manque. Une transition native inattendue de
`recording` vers `false` force également la suppression. Un terminal natif
réussi reçu avant la proximité contrôlée de la borne de 20 secondes est traité
comme une interruption, jamais comme un arrêt automatique valide.

Même après un terminal réussi, B ne devient disponible qu’après validation de
l’URI privée, existence et taille positive du fichier, entête MPEG-4, puis
chargement réel par le décodeur avec une durée finie et positive. A et B passent
par un arbitre unique à époque monotone : une commande devenue obsolète ne peut
plus démarrer un lecteur.

Ce patch natif n’est pas exercé par Expo Go et `expo export` ne compile ni le
Swift ni le Kotlin modifiés. Expo peut aussi utiliser des artefacts natifs
précompilés : `apps/mobile/package.json` impose donc
`expo.autolinking.android.buildFromSource` et
`expo.autolinking.ios.buildFromSource` pour le seul module `expo-audio`. Retirer
ce réglage ferait ignorer les sources corrigées. La CI exécute un prebuild
propre puis compile Android avec Gradle et iOS pour simulateur avec CocoaPods et
Xcode 26.4 sur l’image GitHub macOS 26, sans signature. Une build de développement ou de distribution
reconstruite après `pnpm install` reste obligatoire pour la recette iPhone et
Android réels. Un changement de version d’`expo-audio` exige de revalider le
besoin du patch, de le régénérer avec `pnpm patch`, de contrôler son empreinte
et de refaire tous les scénarios d’interruption sur appareil réel.

### Absence de télémétrie

Cette tranche n’émet aucun événement analytics lié à la capture, même agrégé.
Elle n’ajoute ni breadcrumb Sentry, ni log applicatif, ni métrique contenant un
état de permission, une durée, une URI ou un résultat vocal. Les erreurs
techniques utilisent seulement une catégorie fermée dans l’état local de
l’interface ; cette catégorie n’est elle-même envoyée à aucun outil de
diagnostic.

Une inspection réseau doit confirmer qu’enregistrer, écouter et supprimer une
prise ne produit aucun appel réseau.

## Conséquences

- La comparaison A/B fonctionne sans compte et hors ligne.
- Une réinstallation, un changement d’appareil ou une purge du cache perd la
  prise, ce qui est volontaire et doit être expliqué sans suggérer une
  sauvegarde inexistante.
- L’audio local n’entre pas dans l’export de compte puisqu’il n’est jamais
  détenu par le serveur.
- La suppression est immédiate dans tous les cycles contrôlés, mais un crash
  natif peut laisser un fichier orphelin dans le cache privé jusqu’à sa purge
  par le système d’exploitation. Cette limite résiduelle ne justifie ni la
  persistance d’une URI ni une suppression non ciblée du cache générique.
- Une analyse distante, une transcription, un envoi à un fournisseur, une
  durée de rétention distante ou un usage d’entraînement exigera une décision
  séparée. Cet ADR ne tranche ni la politique concernant les mineurs ni
  `OPEN-PRIVACY-001`.

## Validation

### Tests automatisables

- demande de permission uniquement après action utilisateur ;
- refus, blocage et indisponibilité sans création de fichier ;
- arrêt automatique à 20 secondes avec horloge injectée ;
- suppression immédiate et idempotente lors de « Supprimer ma prise », d’une
  nouvelle prise, de la sortie et de la déconnexion ;
- interruption, arrière-plan et erreur supprimant toute prise partielle dans un
  cycle encore contrôlé par l’application ;
- absence de persistance de l’URI, y compris pour un nettoyage différé après
  redémarrage ;
- absence d’URI, d’audio ou de message natif dans logs et analytics simulés ;
- web : révocation de l’URL d’objet et absence d’écriture persistante ;
- mobile : fichier limité au cache applicatif privé générique et suppression
  physique des cycles contrôlés vérifiée par l’adaptateur de fichiers simulé.
- mobile : invalidation de chaque attente de démarrage lors d’un arrière-plan,
  blur ou démontage ; terminal tardif, erreur prioritaire, timeout et recorder
  verrouillé ; absence, taille nulle, entête invalide ou échec de décodage
  interdisant B ; exclusivité des commandes A/B.
- mobile : introspection native autorisant uniquement le microphone et les
  permissions techniques attendues, sans Face ID, stockage externe, overlay,
  vibration ou audio de fond.
- mobile : `native:check` inspectant le patch réellement installé et refusant
  une empreinte différente, des fins de ligne non reproductibles, l’absence de
  compilation source ciblée, le retour d’une pause/reprise automatique, une
  suppression native non ciblée, l’absence d’un terminal d’échec ou la perte
  des callbacks de route sur iOS et Android ;
- CI native : prebuild propre et compilation effective du Kotlin Android et du
  Swift iOS corrigés avant fusion.

### Limites des simulateurs et tests appareils

Les tests unitaires, Playwright, Maestro, simulateurs et émulateurs ne prouvent
pas le comportement réel du microphone, du focus audio ou de Bluetooth. Avant
bêta, une vérification manuelle est obligatoire sur au moins un iPhone et
l’appareil Android de référence, ainsi que sur les navigateurs web pris en
charge. Elle couvre : refus puis révocation de permission, borne de 20 secondes,
verrouillage et arrière-plan, appel ou interruption audio, haut-parleur et
casque Bluetooth, manque d’espace simulé lorsque possible, suppression puis
refaire, sortie et interruption, crash natif forcé lorsque reproductible,
redémarrage sans promesse de scan ou de purge ciblés, et inspection réseau sans
upload. Le résidu éventuel après crash est consigné comme limite jusqu’à la
purge du cache par le système d’exploitation.

Les résultats, versions d’OS, modèles d’appareils et limites non reproductibles
sont consignés dans la preuve de bêta. Aucun test automatisé ne doit être
présenté comme une validation d’appareil réel.

La recette iOS et Android doit impérativement utiliser une build native
intégrant le patch versionné, jamais Expo Go. Elle vérifie en plus que l’ajout
ou le retrait d’un casque filaire ou Bluetooth produit exactement un terminal
d’échec, aucune reprise de capture, aucun B jouable et aucune prise résiduelle
dans le cycle contrôlé. Sur iOS, un appel, Siri ou une alarme couvre aussi ce
contrat. Les deux builds vérifient qu’une finalisation native en échec et un
terminal absent restent fail-closed.

## Références

- [Cahier des charges — audio, parole et IA](../PROJECT_BRIEF.md#15-audio-parole-et-ia)
- [Checklist de confidentialité de la voix locale](../privacy/local-voice.md)
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Expo — compiler un module précompilé depuis ses sources](https://docs.expo.dev/guides/prebuilt-expo-modules/)
- [Expo SDK 57 — versions natives minimales](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)
- [GitHub Actions — logiciels de l’image macOS 26](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-Readme.md)
- [Apple — changements de route audio](https://developer.apple.com/documentation/avfaudio/responding-to-audio-route-changes)
- [Apple — arrêt et fermeture d’un AVAudioRecorder](<https://developer.apple.com/documentation/avfaudio/avaudiorecorder/stop()>)
- [Android — AudioDeviceCallback](https://developer.android.com/reference/android/media/AudioDeviceCallback)
- [Android — MediaRecorder](https://developer.android.com/reference/android/media/MediaRecorder)
- [Android — partage de l’entrée audio](https://developer.android.com/media/platform/sharing-audio-input)
- [React Native — AppState](https://reactnative.dev/docs/appstate)
