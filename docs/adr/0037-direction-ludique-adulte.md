# ADR-0037 - Direction ludique adulte

- Statut : Accepted
- Date : 7 août 2026
- Complète : ADR-0022 et ADR-0023 sur l'expression visuelle et la motivation
- Ne change pas : la gouvernance du contenu, le socle gratuit, les règles de
  confidentialité ou les exclusions de gamification punitive

## Contexte

La direction « Carnet de terrain » apporte à Thaïnaute une identité chaleureuse
et crédible, mais elle ne doit pas devenir une interface trop sobre. Le produit
doit donner envie de revenir, comme un bon jeu de piste, sans se présenter comme
une application pour enfants ni copier l'identité visuelle d'un concurrent.

## Décision

Thaïnaute adopte une direction **ludique adulte** :

- les couleurs, les courbes, les étapes et les micro-récompenses rendent la
  progression visible et plaisante ;
- les textes, les situations et les explications restent pensés pour des
  adultes francophones ;
- les cartes peuvent être légèrement vivantes, inclinées ou animées, à condition
  de rester lisibles et de respecter `prefers-reduced-motion` ;
- les accents ludiques utilisent les tokens partagés, jamais une couleur codée
  localement dans un écran ;
- les interactions restent accessibles sans son, sans couleur seule et sans
  animation ;
- aucune mascotte, illustration, palette, typographie, formulation ou mise en
  page reconnaissable d'une autre application n'est réutilisée.

La formule de contrôle est : **ludique dans la mécanique, adulte dans le fond,
original dans l'identité**.

## Conséquences

Le web et le mobile utilisent davantage les halos, badges, courbes, cartes
actives et transitions courtes. La progression réelle reste la récompense : pas
de vies, de monnaie virtuelle, de coffre aléatoire, de classement agressif ou
de culpabilisation. Les ajouts visuels doivent être testés avec les états de
chargement, vide, erreur, hors connexion et réduction des animations.
