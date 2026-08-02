# ADR-0022 — Direction artistique « Carnet de terrain »

- Statut : Accepted (maquette validée par le fondateur le 2 août 2026)
- Date : 2 août 2026
- Complète : la section direction artistique de `CLAUDE.md`
- Ne choisit pas : le thème sombre, la déclinaison mobile détaillée, les
  illustrations de contenu pédagogique

## Contexte

L'interface actuelle est une fondation fonctionnelle sans identité : un seul
`globals.css` monolithique, aucune bibliothèque de composants, la palette
recopiée à la main, Manrope déclarée mais jamais installée, et une direction
artistique amorcée uniquement sur la page d'accueil. Le brief impose une
refonte distinctive (« carnet d'exploration du thaï contemporain »), la
palette jasmine/ink/coral/jade/saffron/mist, Manrope et Noto Sans Thai,
WCAG 2.2 AA et l'absence de clichés touristiques.

Une maquette complète (identité, palette, typographie, composants, trois
écrans) a été produite, itérée puis validée par le fondateur.

## Décision

### Concept

L'application est un carnet de terrain : un objet éditorial chaleureux,
adulte et lumineux, ni tableau de bord ni jeu. Fond papier jasmine, panneaux
blancs, ombres basses, compositions éditoriales légèrement asymétriques,
halos saffron discrets.

### Signature : la courbe tonale

Les cinq tons thaïs sont dessinés comme des tracés de plume et deviennent le
motif de marque : logotype, progression, soulignés, séparateurs, chargements,
états vides, badges de ton et favicon. Les tracés canoniques vivent dans
`packages/design-tokens/src/motifs.ts` (données pures, réutilisables par le
mobile). La forme et le libellé portent toujours l'information : la couleur
n'est jamais le seul signal.

### Typographie

- Manrope Variable (paquet `@fontsource-variable/manrope`, licence OFL) :
  titres en graisse 800 très serrée (letter-spacing de −0.035 à −0.06 em),
  corps 430, interface 500 à 700 ; les graisses historiques 750 et 850 sont
  normalisées via les tokens.
- Noto Sans Thai : le thaï est toujours rendu environ 18 % plus grand que le
  latin voisin, interligne ample, signes combinatoires jamais tronqués.
- Serif italique corail (Georgia) : accent éditorial rare, jamais un titre
  entier.

### Logotype

« Thaï » en encre, « naute » entièrement en corail. Cette coupe est
invariable sur toutes les surfaces (header, favicon, images sociales,
mobile).

### Règles d'écriture produit

Le tiret cadratin « — » et le tiret demi-cadratin « – » sont bannis de toute
l'interface, des contenus et des documents destinés aux utilisateurs
(décision du fondateur : marqueur d'écriture générée). Utiliser deux-points,
virgule, point ou parenthèses. Plus largement, aucun tic de rédaction ou de
mise en forme reconnaissable comme généré : pas d'emoji en puces, pas
d'emphase mécanique.

### Architecture technique

- `packages/design-tokens` est la source de vérité (couleurs sémantiques,
  typographies, graisses, durées et courbes de mouvement, ombres, rayons,
  motifs SVG). Un script génère `tokens.css`, commité et verrouillé par un
  test anti-dérive ; le web l'importe en tête de `layout.tsx`.
- Le CSS historique est conservé intact dans `app/styles/legacy.css` et
  maigrit à chaque page refaite ; les nouveaux composants utilisent des CSS
  Modules co-localisés sous `apps/web/components/`.
- Les chaînes françaises visibles et l'accessibilité existante (focus
  visible, `aria-live`, cibles 44 px, `prefers-reduced-motion`) sont des
  invariants de la refonte.

## Conséquences

- Toute nouvelle interface consomme les tokens ; ajouter une couleur ou une
  graisse passe par `packages/design-tokens` et la régénération de
  `tokens.css`.
- Le mobile réutilisera les mêmes tokens et motifs sans dépendre du CSS web.
- Les revues de PR d'interface vérifient : zéro tiret banni, contrastes AA,
  rendu des signes combinatoires thaïs, états chargement/vide/erreur.
