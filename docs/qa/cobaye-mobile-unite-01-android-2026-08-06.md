# Résultats cobaye — mobile Android — 2026-08-06

Recette locale sur l’émulateur `emulator-5554` (`sdk_gphone64_x86_64`),
Android 16 / API 36, avec l’APK release construit localement. Les données
utilisées sont fictives et restent dans le stockage local.

| Scénario | Résultat | Observation                                                                                                                                                                                                                              |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01      | `pass`   | 1A s’ouvre ; six audios et l’association sont accessibles, avec réécoute locale.                                                                                                                                                         |
| C02      | `pass`   | Une réponse juste affiche le retour français puis `Continuer`.                                                                                                                                                                           |
| C03      | `pass`   | Une réponse fausse conserve la tentative, affiche une explication et ne retire aucune vie.                                                                                                                                               |
| C04      | `pass`   | La fermeture forcée de l’application conserve le checkpoint et permet de reprendre la séance.                                                                                                                                            |
| C05      | `pass`   | Le mode avion de l’émulateur a été activé puis rétabli ; la question 1B et la réécoute locale restent disponibles.                                                                                                                       |
| C06      | `pass`   | Le récapitulatif 1A liste les exercices, les maîtrises estimées et les prochaines révisions.                                                                                                                                             |
| C07      | `pass`   | 1D a été rejouée depuis un état Android vierge : 6/6 écoutes, l’association, puis les rappels `ม้า`, `หมา` et `นี้` ont tous reçu un retour positif ; le récapitulatif affiche 10/10 exercices à 250‰ et le retour à l’unité fonctionne. |
| C08      | `pass`   | 1B a été menée de `1/21` à `21/21`, avec audio, association, rappel et lecture ; le récapitulatif puis le retour à l’unité sont accessibles.                                                                                             |
| C09      | `pass`   | 1F a été menée jusqu’au récapitulatif : cinq choix audio, une association de quatre paires et un ordre de mots ont été validés avec les médias locaux.                                                                                   |
| C10      | `pass`   | 1C a été menée jusqu’au récapitulatif : l’ordre de mots avec intrus est validé et la maîtrise/prochaine révision sont affichées.                                                                                                         |
| C11      | `pass`   | 1E a été menée jusqu’au récapitulatif : ordre de mots puis lecture sont validés, avec maîtrise/prochaines révisions locales.                                                                                                             |

Le démarrage 1B échouait avant la correction parce que le checkpoint local
refusait ses 21 exercices (`LOCAL_EXPEDITION_MAX_EXERCISES = 20`). La borne est
maintenant 24, sans troncature silencieuse ; le test Android affiche bien
`ÉCOUTE · 1/21`.

La recette ne remplace ni l’audition native par un francophone, ni l’audit
linguistique, ni les portes de provenance, de licence et de publication. Aucun
service distant ni aucune publication n’ont été utilisés.

Pour C07, le texte Unicode réellement présent dans le champ Android a été
contrôlé avant chaque rappel. La première saisie exploratoire avait utilisé une
mauvaise touche Gboard et n’est pas comptée dans le scénario propre ; aucune
erreur de correction n’a été reproduite avec les trois chaînes vérifiées.

Pendant la saisie de rappel de 1B, le clavier Gboard de l’émulateur a ouvert une
aide de saisie manuscrite ; après fermeture et attente, la saisie ADB et la
validation ont fonctionné. Ce comportement d’émulateur n’a pas été reproduit
comme un défaut de l’application.

La recette a aussi conduit à corriger les en-têtes des expéditions audio :
ils affichent désormais le nombre total d’exercices réellement enchaînés
(par exemple « 21 exercices » pour 1B), et non plus seulement le sous-total
audio.
