# ADR-0039 - Cours textuels accessibles avant la production audio

- Statut : Accepted
- Date : 7 août 2026
- Portée : catalogue web et paquets de leçons

## Décision

Le parcours web affiche les 66 leçons présentes dans `content/authoring`.

- Les 24 leçons qui passent actuellement le compilateur sont accessibles
  comme paquets textuels internes, avec leur provenance et leur version.
- Les 42 leçons qui échouent encore à la compilation restent visibles dans le
  catalogue avec leur titre, leur objectif et le statut « À préparer ». Leur
  contenu incomplet n'est pas publié sous une forme tronquée.
- Une leçon compilée peut être consultée et jouée avec ses exercices textuels.
  Un exercice qui exige un audio absent devra rester bloqué sur une lecture de
  cours jusqu'à ce que son manifeste soit complet et vérifié.
- Les manifestes audio vides des leçons textuelles n'inventent aucun son. La
  génération, la vérification acoustique, la relecture et la publication des
  voix constituent une tranche ultérieure.

Les routes du parcours sont `noindex` tant que les leçons restent des brouillons
internes. Aucun déploiement ni changement de ressource cloud n'est impliqué par
cette décision.

## Raisons

Le catalogue complet permet de travailler sur la progression et la navigation
sans confondre une intention éditoriale avec un contenu validé. La séparation
évite également qu'un audio synthétique, absent ou non audité, soit présenté
comme une ressource pédagogique prête à l'emploi.

## Conséquences

La prochaine tranche doit traiter les 42 erreurs de compilation par groupe de
format, puis lancer la production audio uniquement pour les paquets textuels
validés. Les portes de provenance, d'audit et de publication restent
obligatoires.
