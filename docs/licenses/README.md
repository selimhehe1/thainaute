# Polices et licences embarquées

## Manrope

- Famille : Manrope (fonte variable, axe de graisse 200 à 800).
- Source amont : dépôt
  [`google/fonts`](https://github.com/google/fonts/tree/main/ofl/manrope).
- Licence : SIL Open Font License 1.1 ; copie conservée dans
  `OFL-1.1-Manrope.txt`.
- Intégration web : `@fontsource-variable/manrope` 5.2.5, sous-ensembles
  latins, famille CSS « Manrope Variable ».
- Intégration mobile : à venir avec la tranche mobile de la refonte.
- Vérification : 2 août 2026.

## Noto Sans Thai

- Famille : Noto Sans Thai.
- Source amont : dépôt
  [`google/fonts`](https://github.com/google/fonts/tree/main/ofl/notosansthai).
- Licences : SIL Open Font License 1.1 pour la fonte et MIT pour le chargeur
  Expo ; copies conservées dans `OFL-1.1-Noto-Sans-Thai.txt` et
  `MIT-Expo-Google-Fonts.txt`.
- Intégration web : `@fontsource/noto-sans-thai` 5.3.0, sous-ensemble thaï,
  graisses statiques 400 et 600.
- Intégration mobile : `@expo-google-fonts/noto-sans-thai` 0.4.2, fontes
  statiques 400 et 600 chargées localement par `expo-font` 57.0.1.
- Vérification : 2 août 2026.

Les paquets sont épinglés et leurs fichiers sont incorporés aux bundles. Aucun
appel vers Google Fonts ou un autre CDN n’est effectué à l’exécution.
