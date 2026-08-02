# Checklist de confidentialité — voix locale

Cette checklist applique [ADR-0012](../adr/0012-local-voice-recording.md). Elle
n’autorise aucun traitement vocal distant.

## Avant activation

- [ ] La permission microphone est demandée uniquement après l’action explicite
      « S’enregistrer » et sa finalité locale est expliquée en français.
- [ ] Aucune permission biométrique, de reconnaissance vocale, de fichiers ou
      de publicité n’est demandée avec elle ; `config:check` confirme aussi
      l’absence d’overlay, vibration et audio de fond.
- [ ] Le natif écrit seulement dans le cache applicatif générique privé utilisé
      par `expo-audio` 57.0.3, exclu des sauvegardes ; aucun nom de fichier ou
      répertoire vocal dédié n’est configurable dans cette version. Le web
      garde uniquement un `Blob` en mémoire.
- [ ] La capture est plafonnée à 20 secondes et une seule prise peut exister.

## Pendant l’usage

- [ ] Aucun audio, URI, nom de fichier, état de permission ou durée ne rejoint
      une API, la synchronisation, les analytics, Sentry ou les logs.
- [ ] L’URI native reste en mémoire pendant le cycle contrôlé et n’est jamais
      persistée pour préparer un nettoyage après redémarrage.
- [ ] Une interruption, un arrière-plan ou une erreur supprime toute prise
      incomplète et affiche seulement un message sûr.
- [ ] Le natif arrête la prise en arrière-plan et ne la reprend jamais au retour
      au premier plan ; `native:check` verrouille ce contrat dans le patch
      installé.
- [ ] Une erreur, une interruption ou la sortie ferme d’abord le recorder puis
      supprime son chemin interne exact. Un échec de préparation ne vise que le
      nouveau chemin provisoire et ne peut pas effacer la prise précédente.
- [ ] Sur iOS et Android, la recette utilise une build native reconstruite avec
      le patch `expo-audio` versionné, pas Expo Go : ajout/retrait de casque ou
      Bluetooth arrête la prise, n’émet qu’un terminal d’échec et ne reprend
      jamais la capture. Appel/Siri/alarme sont aussi vérifiés sur iOS.
- [ ] Une prise n’active B qu’après terminal natif réussi, fichier privé non
      vide avec entête MPEG-4 et décodage à durée positive ; timeout ou erreur
      supprime la prise et reste fail-closed.
- [ ] Une nouvelle prise efface l’ancienne avant de démarrer.

## Suppression et vérification

- [ ] « Supprimer cette prise locale » arrête la lecture, libère les ressources
      et révoque immédiatement l’URL d’objet web ou tente l’effacement du
      fichier natif privé, sans corbeille.
- [ ] Si le système refuse l’effacement natif, la prise est immédiatement
      non rejouable et son URI reste seulement dans l’état privé du hook, tant
      qu’il reste monté, pour permettre une nouvelle tentative ; l’interface
      signale l’échec sans prétendre que le fichier a déjà disparu.
- [ ] Refaire une prise, sortir de l’exercice, recevoir un événement
      `SIGNED_OUT`, se connecter depuis l’état déconnecté, passer directement
      d’un utilisateur A à B ou subir une interruption déclenche la même
      révocation immédiate et la tentative d’effacement tant que l’application
      contrôle encore le cycle.
- [ ] Une déconnexion dans un autre onglet ou une révocation distante déclenche
      la purge dès que Supabase la signale ou détecte la session invalide ; la
      checklist ne promet pas une détection distante instantanée.
- [ ] Une inspection du stockage confirme l’absence de copie persistante ou de
      sauvegarde ; une inspection réseau confirme l’absence d’upload.
- [ ] Les essais sur iPhone, Android réel et navigateurs pris en charge couvrent
      permission refusée/révoquée, 20 secondes, Bluetooth et tous les cycles
      contrôlés : suppression, refaire, sortie et interruption.
- [ ] La CI a compilé le patch depuis ses sources sur Android et iOS ; la recette
      réelle utilise ensuite une build reconstruite, jamais Expo Go.

### Limite résiduelle connue

- [ ] La preuve de bêta indique qu’un crash natif, ou le démontage du hook après
      un refus d’effacement par le système, peut laisser un fichier orphelin
      dans le cache privé générique jusqu’à sa purge par le système
      d’exploitation. Le redémarrage ne promet ni scan ni purge ciblés : cette
      garantie attend une future capacité sûre permettant d’identifier les
      prises sans persister leur URI ni supprimer indistinctement le cache.

## Porte pour tout traitement distant

- [ ] Aucun upload, transcription, analyse distante, conservation serveur ou
      entraînement n’est ajouté sans une nouvelle décision explicite.
- [ ] `OPEN-PRIVACY-001` reste ouvert pour les mineurs et la durée exacte de
      rétention vocale distante.
