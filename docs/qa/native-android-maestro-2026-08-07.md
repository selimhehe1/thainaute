# QA Android natif et Maestro — 2026-08-07

Cette recette reste locale. Aucun déploiement, achat, publication ou service
Supabase distant n'a été utilisé.

## Parcours validé

| Contrôle              | Résultat | Preuve                                                                                                                                  |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Build Android release | `pass`   | `:app:assembleRelease` avec le JBR d'Android Studio et le SDK local API 36.                                                             |
| Installation          | `pass`   | APK installé sur `emulator-5554`, activité `com.thainaute.app/.MainActivity`.                                                           |
| Parcours Maestro      | `pass`   | Onboarding, mode hors connexion, exercice, reprise après relance, correction, maîtrise, prochaine révision, voix locale et suppression. |
| Script canonique      | `pass`   | `pnpm test:e2e:mobile` : 1 flow réussi sur 1.                                                                                           |

Le flow `apps/mobile/maestro/demo.yaml` utilise maintenant
`scrollUntilVisible` pour les deux actions situées hors écran sur un téléphone
réel. Il s'agit uniquement d'une robustesse du test, sans modification du
parcours produit.

## Nettoyage du poste

- `.turbo/cache` supprimé : 77,11 Go d'archives locales.
- `apps/web/.next` supprimé : 4,66 Go de sortie générée.
- `node_modules` généré supprimé puis recréé avec `pnpm install --frozen-lockfile`.
  Les sorties Android/CMake qui s'y étaient accumulées représentaient environ
  17 Go supplémentaires.
- Les sorties générées d'`apps/mobile/android` et `apps/mobile/dist` ont été
  supprimées après validation ; le projet natif source reste présent et les
  artefacts seront régénérés par un prochain build.
- Aucun fichier source, contenu, migration ou lockfile n'a été supprimé.

## Limites

- La recette iOS sur appareil réel reste à effectuer.
- Le build Android release devra être relancé pour produire un nouvel APK après
  le nettoyage des sorties générées ; l'APK installé sur l'émulateur a déjà
  validé le parcours ci-dessus.
- `pnpm content:audit` conserve les portes de publication prévues par le brief :
  provenance, licence, audit linguistique, source autorisée et champs complets
  restent à fermer avant toute publication.
