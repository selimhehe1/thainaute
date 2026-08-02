# ADR-0007 — API autoritaire de synchronisation des tentatives

- Statut : Accepted
- Date : 2026-08-01
- Critères concernés : `AC-LEARN-001`, `AC-OFFLINE-001`
- Décisions verrouillées concernées : `DEC-005`, `DEC-007`, `DEC-008`

## Contexte

Le web et les applications mobiles doivent pouvoir rejouer un journal local
après une coupure sans noter eux-mêmes une réponse, sans dupliquer son effet et
sans remplacer silencieusement la progression autoritaire du compte.

L'ADR-0004 fixe déjà le modèle par événements immuables. La présente décision
fixe le premier contrat HTTP et la frontière transactionnelle qui le rend
utilisable par toutes les plateformes.

## Décision

### Contrat HTTP

La commande publique est `POST /api/v1/attempts/batch` :

- `Authorization: Bearer <access-token Supabase>` est obligatoire ;
- `Idempotency-Key` est un UUID obligatoire, distinct de chaque `eventId` ;
- `Content-Type` doit être `application/json` ;
- le corps est limité à 64 Kio réellement lus, même si `Content-Length` est
  absent ou faux ;
- un lot contient de 1 à 50 tentatives et des objets stricts validés avec Zod ;
- chaque tentative cliente contient seulement `eventId`, `deviceId`,
  `exerciseId`, `selectedOptionId`, `answeredAt`, `durationMs`,
  `contentVersionId` et `algorithmVersion` ; `itemId` et `skill` sont refusés ;
- le `userId`, la note, la maîtrise et la prochaine révision ne sont jamais
  acceptés depuis le client.

Le serveur vérifie le jeton avec Supabase Auth et tire l'identité du claim
`sub`. La frontière commune appelle `getClaims(accessToken)`, qui vérifie le
JWT contre le JWKS du projet quand la clé de signature est asymétrique, puis
`getUser(accessToken)`, qui relit l'utilisateur courant auprès d'Auth. Le même
Bearer doit produire deux UUID concordants et un compte permanent. Ainsi, un
ancien JWT encore signé mais rattaché à un utilisateur supprimé est refusé.

Une réponse `200` contient :

- `syncRevision`, curseur monotone autoritaire que le client utilise pour
  ignorer toute réponse arrivée hors ordre ;
- `results`, dans l'ordre du lot, avec `accepted`, `duplicate` ou `rejected` ;
- pour `accepted` et `duplicate`, la note autoritaire `0 | 1` ;
- pour `rejected`, un code fermé parmi `answer_key_not_found`,
  `invalid_submission`, `device_not_registered` et `event_id_collision` ;
- `states`, les projections affectées, uniques et triées par `itemId` puis
  `skill`.

Un rejet propre à une tentative n'annule pas les autres résultats valides du
lot. Les erreurs du contrat, de l'authentification, de l'idempotence ou de
l'infrastructure utilisent une enveloppe fermée
`{ error: { code, message, requestId? } }` et le statut HTTP adapté.

| Statut | Codes globaux                                 |
| ------ | --------------------------------------------- |
| `400`  | `invalid_json`, `invalid_idempotency_key`     |
| `401`  | `unauthorized`                                |
| `409`  | `idempotency_key_reused`, `concurrent_update` |
| `413`  | `payload_too_large`                           |
| `415`  | `unsupported_media_type`                      |
| `422`  | `invalid_request`                             |
| `500`  | `internal_error`                              |
| `503`  | `auth_unavailable`, `database_unavailable`    |

### Calcul et transaction

Le serveur Next.js charge le contenu publié, les événements existants et les
projections, puis calcule en TypeScript :

- l'`itemId` et la dimension `skill` depuis la clé publiée identifiée par
  `(exerciseId, contentVersionId)`, avant toute lecture d'historique ciblée ;
- la validité de la réponse à partir de la version immuable du contenu ;
- la note ;
- la projection SRS déterministe ;
- la réponse publique à conserver pour un éventuel rejeu.

Une clé de correction n'est dérivée que d'un bundle éditorial complet dont le
hash correspond à `lesson_versions.payload_sha256` et qui repasse les portes de
publication partagées : identifiants UUID canoniques, sept audits distincts et
validés, sources connues/autorisées pour l'usage commercial, champs
linguistiques complets, audio non fictif et consentement des voix humaines.
Le payload brut contient `correctOptionId` : la lecture Data API des leçons,
items et métadonnées audio brutes est donc révoquée à `anon` et
`authenticated`. Un futur DTO de contenu client devra expurger les clés et
appliquer les entitlements avant toute exposition distante ou URL audio.

PostgreSQL ne réimplémente pas ces règles pédagogiques. La RPC
`public.commit_attempt_batch_v1` reçoit uniquement les valeurs déjà calculées
par le serveur et garantit, dans une transaction courte :

- le verrou de la révision de synchronisation du compte ;
- l'insertion immuable des événements ;
- la mise à jour atomique des projections ;
- l'incrément de révision ;
- l'enregistrement de la réponse HTTP exacte associée à l'idempotence.

La fonction est `SECURITY INVOKER`. `EXECUTE` est révoqué à `PUBLIC`, `anon` et
`authenticated`, puis accordé uniquement à `service_role`. La clé secrète
correspondante reste dans l'environnement serveur Next.js ; elle n'est jamais
présente dans le navigateur, le bundle Expo, les logs ou l'analytics. Ce choix
ne transforme donc pas la RPC en API cliente et n'affaiblit pas les politiques
RLS exposées.

### Idempotence et concurrence

Le serveur calcule un SHA-256 canonique du contrat et du corps validé :

- même utilisateur, même `Idempotency-Key` et même hash : la réponse enregistrée
  est rejouée sans réappliquer la progression ;
- même clé avec un autre hash : erreur `409 idempotency_key_reused` ;
- même `eventId` avec une autre identité ou un autre payload : rejet ou conflit
  fermé, jamais écrasement ;
- révision concurrente : rechargement et recalcul bornés à trois tentatives,
  puis `409 concurrent_update`.

Le hash est calculé sur le corps client canonique, l'UUID de la release active et
l'empreinte des clés de correction actuellement éligibles, sans exposer cette
empreinte au client. Il ne porte pas sur les octets JSON bruts : les différences
sans effet de sérialisation ne créent pas de fausse divergence. Une bascule ou
révocation ne peut donc pas rejouer une ancienne correction. Une première
soumission mixte conserve toutefois un résultat par tentative, afin qu'un rejet
de contenu obsolète n'annule pas les tentatives valides du lot. Le hash de
l'événement persistant inclut en revanche les valeurs dérivées autoritaires. Si
un commit antérieur entre alors en conflit, le client classe durablement son lot
en vol comme terminal, libère la file et poursuit les tentatives suivantes ; les
autres erreurs de transport conservent le rejeu exact.

## Sécurité et confidentialité

- Aucun corps, jeton, email, identifiant de contenu ou message d'exception
  libre n'est ajouté aux logs opérationnels.
- Les erreurs de niveau 5xx peuvent journaliser seulement une catégorie fermée,
  la release et un identifiant d'incident/requête opaque.
- Les réponses portent `Cache-Control: no-store` et
  `X-Content-Type-Options: nosniff`.
- Le contenu non publié ou sans clé de réponse autoritaire est refusé.
- Les tables éditoriales brutes contenant les réponses ne sont pas lisibles par
  les rôles clients Supabase.
- L'appareil doit appartenir au compte authentifié.

## Confiance temporelle

`OPEN-SYNC-001` est résolue par l'[ADR-0010](0010-attempt-temporal-trust.md).
Une seule heure serveur est figée pour le lot et ses recalculs. Les nouveaux
événements sont acceptés dans la fenêtre inclusive de trente jours dans le
passé et cinq minutes dans le futur ; les doublons et collisions historiques
sont classés avant cette fenêtre. `answeredAt` reste inchangé et PostgreSQL
attribue séparément le `received_at` d'audit.

## Conséquences et validation

Le même contrat sert au web et au mobile, tout en gardant le calcul autoritaire
côté serveur. La base reste la source durable et la réponse exacte d'un retry
est reproductible après un timeout réseau.

La migration et les tests pgTAP/RLS n'ont pas encore été exécutés contre une
pile Supabase locale : aucun runtime Docker compatible n'est disponible dans
l'environnement de développement actuel. Cette limite doit rester explicite
jusqu'au passage de `pnpm db:reset`, `pnpm db:test` et des advisors Supabase.

Voir aussi le [guide d'exploitation](../OPERATIONS.md) et le
[registre des décisions ouvertes](../OPEN_DECISIONS.md).

## Références officielles

- [Supabase — vérification des claims JWT](https://supabase.com/docs/reference/javascript/auth-getclaims)
- [Supabase — relecture Auth de l'utilisateur](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase — fonctions, `security invoker` et privilèges d'exécution](https://supabase.com/docs/guides/database/functions)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
