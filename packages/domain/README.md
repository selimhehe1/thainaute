# Domaine métier

Ce package contient les règles pures de la première tranche verticale. Il ne
dépend ni de React, ni du stockage, ni de l'heure système.

## SRS v0

`srs-v0` est volontairement simple et vérifiable, en attendant une calibration
sur des données pédagogiques :

- réponse correcte : `+250` points de maîtrise (maximum `1000`) ;
- réponse incorrecte : `-250` points (minimum `0`) ;
- intervalles après réponses correctes consécutives : 1, 3, 7, 14 puis 30 jours ;
- nouvelle tentative 10 minutes après une réponse incorrecte ;
- maîtrise confirmée à partir de `750` points et de trois réussites.

Les dates sont calculées exclusivement depuis `answeredAt`. Aucun appel à
`Date.now()` ne rend la projection non reproductible.

Vitest et fast-check sont des dépendances de développement MIT et gratuites,
déjà imposées par le brief pour les règles de progression et leurs propriétés.
