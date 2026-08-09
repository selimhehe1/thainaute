# Vérification connectée Supabase locale — 2026-08-07

Cette recette concerne uniquement la pile Supabase locale et des comptes,
identifiants et contenus de fixture. Aucun service distant, achat, publication
ou donnée personnelle réelle n'a été utilisé.

## Résultats

| Contrôle                       | Résultat                 | Preuve                                                                                              |
| ------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- |
| Réinitialisation et migrations | `pass`                   | Toutes les migrations locales présentes au moment du contrôle s'appliquent sur PostgreSQL 17.       |
| RLS et opérations atomiques    | `pass`                   | 8 fichiers pgTAP, 245 assertions réussies.                                                          |
| Advisors sécurité              | `pass`                   | Aucun problème remonté.                                                                             |
| Advisor performance            | `pass avec informations` | Une clé étrangère sans index couvrant et des index non utilisés sont signalés au niveau informatif. |
| Fusion et idempotence          | `pass`                   | Web → Android simulé → second navigateur ; le rejeu ne double pas la progression.                   |
| UI connectée                   | `pass`                   | Audio privé, correction serveur et progression retrouvée sur un second navigateur.                  |
| Signalement structuré          | `pass`                   | Persistance, doublon, collision de clé, export et isolation RLS vérifiés.                           |
| E2E web général                | `pass`                   | 15 tests réussis, 3 tests connectés ignorés hors configuration Supabase.                            |
| E2E synchronisation connectée  | `pass`                   | 1 scénario Playwright : fusion et rejeu idempotent sur deux navigateurs.                            |
| E2E apprentissage connecté     | `pass`                   | 1 scénario Playwright : audio privé, correction serveur et progression retrouvée.                   |
| E2E signalement connecté       | `pass`                   | 1 scénario Playwright : persistance, doublon, export et isolation.                                  |

## Limites restantes

- `pnpm db:lint` conserve un warning préexistant de variable inutilisée dans
  `commit_attempt_batch_v1_legacy`; il ne dépasse pas le seuil d'échec configuré.
- Les trois scénarios connectés ont été rejoués localement avec les fixtures,
  après injection éphémère des variables générées par Supabase ; aucun secret
  n'a été écrit dans le dépôt.
- `pnpm test:e2e:mobile` passe désormais avec 1 flow Maestro sur l'émulateur
  Android local `Medium_Phone` (API 36).
- La recette iOS sur appareil réel reste à effectuer.
- Les leçons restent des aperçus internes : revue native, provenance, licences,
  audit linguistique et décision `OPEN-PRODUCT-001` ne sont pas clos.
