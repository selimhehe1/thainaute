# Pilote cobaye — mobile, unité 1

Ce protocole vérifie le parcours réellement embarqué sur iOS ou Android. Les
six aperçus internes 1A à 1F sont utilisables pour le pilote, mais ne sont pas
une release publiée et ne valident pas encore la qualité linguistique finale.

## Préparer le test

1. Installer le build mobile de développement sur l’appareil de test.
2. Lancer l’application et terminer l’onboarding avec des réponses de test.
3. Ouvrir `Parcours` puis `Unité 1`.
4. Vérifier que 1A, 1B, 1C, 1D, 1E et 1F sont marquées `APERÇU DISPONIBLE`.

Le pilote ne doit pas utiliser une adresse personnelle, un texte sensible ou un
enregistrement vocal. Les tentatives de ce parcours restent dans le stockage
local de l’appareil.

## Scénario principal

| ID  | Action                                               | Résultat attendu                                                                                                                  |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| C01 | Ouvrir 1A puis commencer l’expédition                | Une expédition de sept exercices s’ouvre (six audios et une association) ; le premier audio est rejouable.                        |
| C02 | Répondre juste à une carte                           | Le retour affiche le français après la validation, puis `Continuer` ouvre la carte suivante.                                      |
| C03 | Répondre faux à une carte                            | L’erreur est annoncée sans vie perdue ni blocage ; le retour pédagogique reste lisible.                                           |
| C04 | Quitter l’application après un choix ou une réponse  | Au retour, l’expédition et la réponse durable sont reprises ; l’expédition n’est pas recréée.                                     |
| C05 | Activer le mode avion pendant l’expédition           | Les audios déjà embarqués et l’enregistrement local continuent de fonctionner.                                                    |
| C06 | Terminer 1A                                          | Le récapitulatif liste les sept exercices, la maîtrise estimée et la prochaine révision.                                          |
| C07 | Refaire le scénario avec 1D                          | Les dix exercices s’enchaînent (six audios, une association et trois rappels) ; aucun audio de 1A n’est utilisé.                  |
| C08 | Ouvrir 1B et terminer son expédition mixte           | Les 21 exercices s’enchaînent (dix audios, une association, six rappels et quatre lectures) ; la reprise fonctionne.              |
| C09 | Ouvrir 1F et terminer son expédition mixte           | Les sept exercices s’enchaînent (cinq audios, une association et un ordre de mots) ; aucun audio d’une autre leçon n’est utilisé. |
| C10 | Ouvrir 1C puis remettre les jetons dans le bon ordre | La réponse en construction est conservée après fermeture ; une erreur reste marquée.                                              |
| C11 | Ouvrir 1E et terminer ses deux exercices             | L’ordre des mots puis la lecture s’enchaînent ; le récapitulatif porte deux révisions.                                            |

Pour C03, faire au moins une erreur avant une bonne réponse. Fermer et rouvrir
l’application avant de continuer : l’erreur ne doit pas être effacée par le
rechargement.

## Preuves à relever

Pour chaque scénario, noter seulement :

- l’identifiant du scénario (`C01` à `C11`) ;
- la plateforme et la version du build ;
- `pass`, `fail` ou `blocked` ;
- une phrase courte décrivant le problème, sans copier de texte personnel ni
  d’audio.

Une capture d’écran peut montrer l’écran de résultat, mais pas une adresse
email, un identifiant de compte ou un contenu libre sensible.

## Critères de passage cobaye

Le pilote est exploitable si :

- C01, C02, C04, C05, C06, C08 et C09 passent sur Android et iOS ;
- aucun fichier audio de 1A n’est joué dans 1D ;
- une erreur ne blanchit pas la réponse au redémarrage ;
- 1C reprend l’ordre des mots et 1E enchaîne ses deux mécaniques ;
- le récapitulatif indique une prochaine révision sans promettre une
  publication ou une maîtrise linguistique définitive ;
- aucun crash, blocage clavier/tactile ou libellé thaï illisible n’est observé.

## Blocages connus et hors périmètre

- Maestro n’est pas installé dans l’environnement actuel : la vérification
  native doit donc être réalisée manuellement sur les appareils.
- La revue native de la qualité des audios 1B et 1F reste à faire, même si leurs
  fichiers sont maintenant validés par empreinte et contrôle tonal.
- Les réponses typées 1C/1E sont maintenant persistées et évaluées localement
  pour le pilote. La synchronisation serveur de ces réponses est couverte par
  le contrat et la migration, mais reste à vérifier sur Supabase local avant
  toute publication.
- La validation du pilote ne franchit pas les portes de provenance, d’audit
  linguistique ou de revue native exigées pour publier l’unité.
