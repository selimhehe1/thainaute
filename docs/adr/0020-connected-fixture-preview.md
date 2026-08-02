# ADR-0020 — Preview connectée limitée à une fixture technique

- Statut : Accepted for local technical preview
- Date : 2 août 2026
- Complète : livraison vérifiée → audio privé → tentative durable → correction
  serveur → progression par leçon sur web et mobile
- Ne résout pas : `OPEN-PRODUCT-001`, `OPEN-LEARN-001`,
  `OPEN-CONTENT-001`, `OPEN-OFFLINE-001`, `OPEN-SRS-001`,
  `OPEN-API-001`, `OPEN-SYNC-002`

## Contexte

La fixture embarquée prouve déjà une boucle locale, et l’API de synchronisation
prouve séparément l’idempotence, l’isolation des comptes et la projection SRS.
Il manque toutefois une capacité utilisateur traversant réellement la même
release depuis Next.js et Expo sans embarquer la clé de correction.

Le curriculum, le contenu thaï réel, les seuils pédagogiques, le contrat hors
ligne et la limitation de débit restent ouverts. La tranche ne peut donc ni
devenir le parcours principal, ni être présentée comme une leçon de thaï, ni
être promue en bêta distante.

## Décision

`THAINAUTE_PUBLIC_CONTENT_MODE=disabled|supabase` est désactivé par défaut. Le
mode Supabase exige un UUID de release explicite et la configuration serveur.
Il ne s’active jamais par la seule présence d’un secret. Tant que
`OPEN-API-001` reste ouvert, ce mode rend la readiness non prête afin
d’empêcher une promotion distante accidentelle.

`GET /api/v1/content/releases/current` construit un manifeste public canonique
depuis toute la release configurée. Une seule ligne absente, non publiée,
payante, incohérente ou bloquée invalide le manifeste complet ; aucune leçon
n’est filtrée silencieusement. Le hash public est calculé sur le DTO expurgé et
ne prétend pas vérifier l’ancien champ SQL `manifest_sha256` de la fixture.

`GET /api/v1/content/lessons/{versionId}` reste sans clé de correction,
`itemId`, provenance interne, chemin Storage ou secret. Les clients relient la
leçon à l’entrée exacte du manifeste avant toute promotion dans IndexedDB ou
SQLite. Sur le web, une ligne IndexedDB corrompue est conservée et bloque une
réécriture implicite. Sur mobile, une ligne SQLite corrompue n’est jamais
servie : elle est supprimée dans une transaction ciblée puis traitée comme un
cache miss afin que la revalidation réseau puisse la réparer. Si la suppression
échoue, la transaction rollbacke et le chargement échoue fermé.
Le client recalcule le SHA-256 sur la représentation canonique exacte du corps
pour tout `200`, toute lecture locale et toute réutilisation après `304` ; un
hash ou ETag déclaré cohérent ne suffit jamais à valider un corps altéré.

`GET /api/v1/content/lessons/{versionId}/audio/{assetId}` est opaque. Le serveur
revérifie release, publication, manifeste audio, taille et hash avant de servir
un objet privé. Les caches web et mobile revalident toujours la publication ;
un `304` n’autorise la copie locale que si l’ETag SHA-256 est exact. Un `200`
est vérifié en entier avant promotion. Le mobile télécharge dans un fichier
`.part`, contrôle longueur et SHA-256, puis le déplace dans le même répertoire.
Une coupure ou une révocation échoue fermée sans servir silencieusement une
copie périmée.

La preview exige un compte permanent, car l’API de tentative autoritaire
actuelle n’accepte pas de sujet anonyme. L’événement exact est écrit dans
l’outbox du compte avant le réseau. En ligne, le serveur choisit
`feedbackFr`, calcule la note et met à jour la projection. Hors ligne ou après
timeout, l’interface affiche uniquement « correction en attente » : elle ne
révèle ni note, ni bonne option, ni maîtrise locale. Le même `eventId` et la
même clé d’idempotence sont rejoués automatiquement au retour en ligne sur
le web, ou par l’action de reprise et le prochain chargement sur mobile.
La route de tentative exige aussi l’UUID explicite de la release active : la
requête et la vérification serveur refusent toute autre release ainsi que toute
leçon exigeant `premium`. Cet UUID entre dans le hash idempotent serveur : une
bascule de release invalide le rejeu d'une ancienne correction sous la même clé.
L'empreinte des clés actuellement éligibles entre aussi dans ce hash : si la
release conserve son UUID mais n'est plus publiée, le registre refuse son ancien
corps. Une première soumission mixte reçoit encore un rejet par tentative. Un
conflit avec un commit antérieur libère durablement le lot local concerné avant
de poursuivre les entrées suivantes, sans transformer une panne réseau en rejet.
Enqueue et synchronisation s’exécutent sous la même
barrière que la création d’une suppression de compte. Le client HTTP relit la
session après la réponse avant de remettre correction ou snapshot à l’appelant.

`GET /api/v1/progress/lessons/{versionId}` exige le JWT permanent, recharge le
bundle gratuit de la release active et mappe la progression personnelle vers
`exerciseId`. Il expose compétence, état, maîtrise provisoire, compteurs,
version d’algorithme et `dueAt`, jamais l’`itemId` éditorial. Le client relit la
session avant et après la requête ; une réponse du compte A ne peut pas être
remise après A→B.

Cette garantie d'expurgation vise les DTO de contenu et de progression par
leçon introduits ici. Pour compatibilité avec l'ADR-0007, la réponse générique
v1 de synchronisation et son snapshot local conservent encore un `itemId`
opaque afin de fusionner les projections autoritaires. La preview ne le lit,
ne l'affiche et ne le renvoie jamais dans une commande ; elle recharge sa vue
via `exerciseId`. Retirer cet identifiant du snapshot générique serait une
rupture distincte touchant hydratation, fusion et export, hors de cette tranche.

Les routes `/learn/connected` et `/connected-lesson` sont des surfaces
techniques séparées. Elles portent en permanence « fixture technique »,
« aucune valeur pédagogique » et « non publiable ». La démo locale sans compte
et les écrans `Aujourd’hui`/`Parcours` restent inchangés jusqu’aux décisions
produit.

## Fixture Storage locale

Le script `pnpm fixture:bootstrap-local-audio` est le seul créateur de bucket
de cette tranche. Il exige `THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP=1`, une URL HTTP
de boucle locale et la clé serveur du processus. Il vérifie la fixture avant et
après upload, crée uniquement le bucket privé local `bucket-prive` et ne
journalise aucune clé. Il refuse toute cible hébergée.

Aucun bucket, projet Supabase, variable distante, achat ou déploiement n’est
créé. Une future activation hébergée exigera une instruction explicite, un
bucket privé configuré séparément et les gates sécurité de l’environnement.

## Conséquences et limites

- Le web et le mobile consomment les mêmes UUID, release, correction et
  projection autoritaires.
- Les caches de contenu public ne sont pas des données de compte et survivent à
  sa suppression ; outbox, reports et progression restent isolés et purgés par
  sujet.
- L’audio local est adressé par hash, sans titre, email, UUID utilisateur ou
  chemin Storage distant dans son nom.
- `srs-v0` est seulement affiché comme projection technique provisoire. Cette
  ADR ne valide aucun seuil pédagogique.
- La première réussite anonyme P0 n’est pas couverte : choisir une correction
  anonyme serveur ou un matériel local est une décision produit ouverte.
- Aucun vrai contenu thaï n’est ajouté. La fixture ne peut être chargée hors du
  test local.
- L’absence de rate-limit et de politique de rétention idempotente interdit la
  bêta distante même si la readiness technique des dépendances passe.

## Validation attendue

- manifeste et leçon : schémas stricts, ordre, hash, `200`, `304`, corruption,
  release révoquée et absence d’`itemId` dans les DTO publics ;
- audio : objet inconnu, relation invalide, Range/ETag, taille/hash divergents,
  téléchargement interrompu, nettoyage `.part` et revalidation obligatoire ;
- tentative : enqueue avant réseau, feedback serveur correct/incorrect, rejeu
  exact, réponse perdue, attente sans note, changement A→B, release inactive et
  leçon Premium ;
- progression par leçon : utilisateur A, utilisateur B, anonyme, version hors
  release et absence d’`itemId` ;
- UI web/mobile : chargement, compte absent, audio, pending, rejet, résultat,
  reprise, prochaine échéance et signalement de la version exacte ;
- E2E local : Supabase, Storage privé, OTP, un événement serveur, deuxième
  client sans cache et refus RLS d’un autre sujet.

## Références

- [ADR-0004 — Offline et synchronisation](0004-offline-sync.md)
- [ADR-0007 — API de tentatives autoritaire](0007-authoritative-attempt-sync-api.md)
- [ADR-0008 — Livraison publique du contenu](0008-public-content-delivery.md)
- [ADR-0013 — Readiness de la preview API](0013-api-preview-readiness.md)
- [ADR-0019 — Signalements structurés](0019-structured-content-reports.md)
