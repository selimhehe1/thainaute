# État du catalogue de cours — 7 août 2026

## Résultat

- 66 fichiers d'autorat détectés dans `content/authoring`.
- 13 unités cartographiées : l'unité 1 contient 6 leçons, les unités 2 à 13
  en contiennent 5 chacune.
- 66 paquets de leçons textuels compilés, 0 bloqué par le compilateur.
- Le catalogue interne contient 66 entrées compilées ; les sources restent
  `draft` (65 entrées) ou `unknown` (la source historique `u01-l1d`), et
  aucune entrée n'est publiée.
- 66 manifestes audio sont présents : 62 sont vides et 4 contiennent des
  fichiers déjà existants. Aucun son n'a été généré dans cette tranche.
- Les paquets restent réservés à la QA interne : `workflowStatus: draft` et
  `visibility: internal`.

## Portée compilée

Les 66 paquets contiennent 340 exercices textuellement exploitables :

| Mécanique      | Exercices |
| -------------- | --------: |
| `association`  |        29 |
| `audio_choice` |        41 |
| `reading`      |        21 |
| `recall`       |        95 |
| `word_order`   |       154 |

Les exercices audio sont conservés comme contrats textuels, mais ne sont pas
considérés comme prêts tant que les fichiers et leurs contrôles de provenance
ne sont pas présents. Les associations réutilisent uniquement des cartes
déjà sourcées ; les nouvelles fermetures ajoutées dans les leçons 5A, 6A,
6D, 6E, 7E, 8E, 9D, 9E, 11D, 12B et 12D restent des exercices de QA interne.

## Portes restantes

La compilation textuelle n'est plus la porte bloquante. Restent avant toute
publication : l'audit humain de chaque contenu, la vérification de toutes les
sources et licences, les voix locales privées, la validation audio, les tests
de bout en bout complémentaires selon la cible et la décision explicite de
publication. Les paiements ne sont pas inclus dans cette tranche.

## Validation mobile

- Maestro CLI `2.8.0` est installé localement avec Java 17 ; aucune dépendance
  du produit n'a été ajoutée.
- Une APK Android locale `release` signée debug a été construite et installée
  sur l'émulateur `emulator-5554` pour embarquer le bundle JavaScript.
- `pnpm test:e2e:mobile` : `1/1 Flow Passed` en 50 secondes.
- Le scénario couvre l'onboarding, la séance locale, la reprise, une tentative,
  l'enregistrement vocal local et sa suppression, la fin de séance et l'écran
  de compte hors connexion.

## Commande de référence

```text
pnpm --filter @thainaute/content content:compile-text
```

La commande retourne maintenant `66 leçons textuelles prêtes, 0 bloquée`.
Avec `--write`, elle régénère les paquets manquants sans publier les cours.
