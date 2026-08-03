# ADR-0024 : modèle d'exercice et de réponse des cinq mécaniques

- Statut : accepté
- Date : 3 août 2026
- Décideurs : Selim (« OK GO » sur la tranche), Claude (conception)
- Concerne : `packages/content`, `packages/sync`, apps web et mobile,
  schéma `attempt_events`

## Contexte

Le produit exige cinq mécaniques canoniques (`listening`, `association`,
`word_order`, `recall`, `reading`) sur web et mobile, avec réponses typées,
validation côté serveur, compatibilité checkpoint/outbox/idempotence, et
aucun corrigé réel dans le DTO public. Aujourd'hui seul `audio_choice`
(mécanique `listening`) existe, et toute la colonne vertébrale de
synchronisation suppose une réponse à option unique
(`selected_option_id uuid NOT NULL` dans `attempt_events`, `selectedOptionId`
dans les checkpoints et l'outbox). Une association, un ordre de mots ou un
rappel saisi ne tiennent pas dans ce modèle.

## Décision 1 : union discriminée d'exercices dans `packages/content`

`lesson.exercises` devient une union discriminée par `type` :

- `audio_choice` (mécanique `listening`) : inchangé champ pour champ, pour
  que toutes les leçons déjà stockées restent valides.
- `association` : `pairs[2..6]` de `{ id, itemId, labelFr }`. Le côté thaï
  s'affiche depuis l'item référencé (source unique de vérité), le côté
  français est l'étiquette. Les `itemId` des paires sont uniques dans
  l'exercice, sinon l'appariement serait ambigu.
- `word_order` : `tokens[2..12]` de `{ id, thaiRaw, transcription }` et
  `correctOrder` (ids de jetons, uniques, sous-ensemble des jetons). Un
  jeton hors de `correctOrder` est un intrus à retirer, ce qui couvre
  l'action explicite « retirer » exigée par le brief. `audioAssetId` est
  nullable (variante avec ou sans écoute).
- `recall` : `acceptedAnswers[1..8]` de `{ value, kind: thai | transcription }`
  et `answerPolicy { normalization: "nfc", trimWhitespace,
collapseInnerWhitespace }`. La politique Unicode est une donnée du
  contenu, donc auditable, versionnée et hachée avec la leçon.
- `reading` : le stimulus est le thaï de l'item référencé ; `options[2..6]`
  et `correctOptionId`, sans audio requis.

Tous portent `promptFr` et `feedback { correctFr, incorrectFr }`. `skill`
reste distinct de `type` (`audio_choice` garde `skill: "listening"`) : le
`type` nomme la mécanique d'interface, le `skill` la compétence mesurée par
le SRS.

## Décision 2 : clé privée par défaut, clé inhérente assumée

Le DTO public ne transporte jamais `correctOptionId`, `correctOrder` ni
`acceptedAnswers`. Exception documentée : pour `association`, l'appariement
EST le contenu affiché ; impossible de rendre les deux colonnes sans que le
client connaisse les paires. On l'assume : le DTO public d'association
livre les paires, le serveur reste seul à calculer le `rating` qui compte.
Les quatre autres types restent à clé privée, corrigés par le serveur.

## Décision 3 : réponse typée `answer` à côté de `selected_option_id`

À la phase de synchronisation, `attempt_events` gagne une colonne `answer
jsonb` (union taguée par mécanique : option choisie, appariements proposés,
séquence de jetons, texte saisi brut). `selected_option_id` devient
nullable et reste rempli pour les types à option unique (compatibilité des
lignes existantes, aucune réécriture d'événements immuables). Contrainte :
chaque ligne porte soit `selected_option_id`, soit `answer`, selon le type.
Le `payload_sha256` couvre la réponse complète, l'idempotence est
inchangée. Le serveur normalise la saisie de `recall` selon
`answerPolicy` AVANT comparaison et journalise la valeur brute.

## Décision 4 : livraison en quatre phases, chacune verte seule

Plus de 60 fichiers touchent au modèle de réponse actuel. Pour ne jamais
casser main :

- **A. Schémas** : union dans `packages/content`, validation croisée par
  type, fixture technique dédiée aux cinq mécaniques (la fixture partagée
  actuelle reste intacte, des dizaines de tests en dépendent). Aucun
  changement de comportement.
- **B. Lecteur** : le lecteur Expédition web (ADR-0023) joue les cinq
  mécaniques de la fixture en local, checkpoint étendu par type de réponse.
- **C. Synchronisation** : DTO publics, migration `answer`, notation
  serveur par type, outbox et parité mobile.
- **D. Contenu réel** : compilation de l'unité 1 auditée vers ces schémas,
  après la porte RID, franchie le 2026-08-03 pour l unité 1.

## Décision 5 : la progression est le contour tonal, pas une jauge

Une revue adversariale du lecteur a établi que le motif signature ne
signifiait rien : l'écran affichait une courbe décorative interchangeable
avec une ligne droite, alors que les cinq contours tonals sont le sujet
même du produit. La progression d'une séance emprunte donc désormais le
contour du **ton montant** : chaque exercice est un point de passage placé
sur la courbe, et la portion franchie s'encre par subdivision exacte de la
même cubique. La géométrie vit dans `packages/design-tokens` en données
pures, réutilisable par le mobile, et un test verrouille l'égalité entre
la route et `toneCurves.rising` : si l'une change, l'autre doit suivre.

## Phase C, premier palier : la réponse devient durable et typée

La limite de la phase B (une note falsifiable par simple rechargement) est
levée. Le checkpoint de question porte désormais un `draftAnswer` et un
`missedOnce` : la réponse en construction et l'erreur déjà commise sont
écrites au fil des gestes, et l'erreur est un cliquet qui ne se retire
jamais. La note des quatre mécaniques est lue depuis ce champ durable, plus
depuis un état de composant. Les deux champs ont un défaut, donc tous les
instantanés déjà stockés restent lisibles sans migration.

Le contrat de tentative accepte une réponse typée (`answer`) exclusive de
`selectedOptionId`, et un comparateur unique remplace trois copies
divergentes qui ignoraient ce champ (deux réponses différentes pouvaient
passer pour identiques sous le même identifiant d'événement).

Le serveur, lui, **refuse explicitement** toute tentative portant une
réponse typée tant que sa correction autoritaire n'existe pas : mieux vaut
un rejet net qu'une note inventée. Les paliers restants de la phase C sont
la colonne `answer jsonb`, la notation serveur par mécanique, le DTO public
v2 et la parité mobile.

## Conséquences

- Les leçons stockées et la fixture partagée restent valides sans
  migration (l'union est additive).
- Le type TypeScript `AudioChoiceExercise` devient un `Extract` de
  l'union ; les consommateurs qui lisaient `exercises[0]` sans vérifier le
  type doivent désormais discriminer, ce que le compilateur impose.
- La correction immédiate hors-ligne des types à clé privée n'est possible
  qu'en mode fixture locale ; en mode connecté hors-ligne, la tentative
  est journalisée et la correction autoritaire arrive à la
  réconciliation, comme aujourd'hui pour `audio_choice`.
- Les variantes acceptées de `word_order` (ordres alternatifs valides)
  sont reportées : le thaï a un ordre rigide au niveau débutant, et le
  champ pourra s'ajouter de façon additive.
