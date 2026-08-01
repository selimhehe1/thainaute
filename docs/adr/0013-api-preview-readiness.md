# ADR-0013 — Readiness et politique HTTP de l’API de preview

- Statut : Accepted
- Date : 1er août 2026
- Complète : préparation opérationnelle de `/api/v1`
- Ne résout pas : OPEN-API-001 et OPEN-SYNC-002

## Contexte

La sonde `live` prouvait que le processus Next.js répondait et la sonde `ready`
validait seulement sa configuration. Une preview pouvait donc être déclarée
prête alors que Supabase Auth ou Postgres était indisponible. Les protections
HTTP étaient en outre répétées dans les handlers, et les Database Advisors ne
constituaient pas encore une porte CI exécutable.

## Décision

`GET /api/v1/health/live` reste indépendant de toute ressource externe. Il ne
doit servir qu’à décider si le processus web répond.

En mode `supabase`, `GET /api/v1/health/ready` exécute en parallèle :

- un `GET /auth/v1/health` identifié par la clé publiable ;
- un `HEAD` PostgREST sur `content_releases`, sans rapatrier de ligne, avec la
  clé publiable et les privilèges/RLS du rôle `anon`.

Chaque sonde est bornée à 2,5 secondes et échoue fermée. La réponse publique ne
contient que `ok` ou `error`, les codes de configuration déjà fermés et la
release. Aucun corps amont n’est lu ; aucune URL interne, aucun secret ni détail
d’exception n’est journalisé ou renvoyé. En mode `disabled`, aucune dépendance
externe n’est contactée. Storage et SMTP conservent des contrôles synthétiques
séparés.

Toutes les routes `/api/v1/**`, y compris les réponses produites par Next.js,
reçoivent une politique commune : `nosniff`, `no-referrer`, CSP sans source et
sans framing, sandbox, Permissions Policy restrictive et aucune autorisation
CORS implicite. Next.js ne publie plus `X-Powered-By`. Les handlers ajoutent le
challenge `WWW-Authenticate: Bearer` à chaque `401`, tout en conservant les
en-têtes de cache et les ETag du contenu public.

Après migrations, pgTAP et lint PL/pgSQL, la CI bloque tout finding de sécurité
Supabase de niveau `warn` ou `error`. Les findings de performance restent
visibles mais non bloquants tant qu’aucune charge représentative ne permet de
les trancher.

## Conséquences

- la recette de preview dispose d’un signal pour refuser une release si sa
  configuration, Auth ou la Data API ne répond pas ; le branchement à
  l’orchestrateur d’hébergement reste une étape du déploiement autorisé ;
- une panne de dépendance ne compromet pas la sonde de vie ;
- les réponses `304`, `401`, `404`, `405`, `500` et `503` gardent une politique
  HTTP cohérente sans rendre le contenu public non cachable ;
- le test connecté local prouve la readiness contre la stack Supabase réelle ;
- les réglages hébergés, Storage, SMTP et les seuils de rate limit restent des
  portes distinctes avant bêta.

## Références

- [Next.js — headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Next.js — poweredByHeader](https://nextjs.org/docs/pages/api-reference/config/next-config-js/poweredByHeader)
- [Supabase — Auth health](https://supabase.com/docs/guides/troubleshooting/how-do-i-check-gotrueapi-version-of-a-supabase-project-lQAnOR)
- [Supabase — sécuriser la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — Database Advisors](https://supabase.com/docs/guides/database/database-advisors)
