# Ce que coûterait la voix du corpus, 13 août 2026

Document de décision pour le fondateur. Aucun appel facturé n'a été lancé
pour l'écrire : les volumes viennent du compilateur, les durées des
manifestes déjà produits, et les prix de la page publique d'OpenAI.

## Le volume, mesuré

### Ce qui est produit

**23 fichiers** couvrent quatre leçons de l'unité 1. Durée moyenne
**1,09 seconde**, poids moyen 50 Ko, voix `coral` du modèle
`gpt-audio-1.5`, contrôle de contour F0 sur chacun.

### Ce qui manque aujourd'hui

**32 assets**, répartis sur cinq unités seulement :

| Unité | À produire |
| ----- | ---------: |
| 03    |          8 |
| 04    |          5 |
| 05    |          4 |
| 07    |          6 |
| 08    |          9 |

Ce chiffre est **trompeur si on le lit seul**. Il ne compte que les
exercices d'écoute effectivement compilés, or 91 % des blocs d'écoute
écrits sont encore refusés par l'extraction. Les unités qui affichent zéro
n'ont pas moins besoin de voix : elles ont moins d'exercices d'écoute
compilés.

### Ce qui manque réellement

Un cours de langue veut une voix de référence par carte, pas seulement par
exercice d'écoute compilé. Le corpus porte **345 cartes distinctes**, dont
23 ont déjà leur voix.

**Le besoin réel est donc d'environ 322 assets**, et non 32.

| Unité | Cartes | Unité | Cartes |
| ----- | -----: | ----- | -----: |
| 01    |     46 | 08    |     37 |
| 02    |     35 | 09    |     34 |
| 03    |     60 | 10    |     43 |
| 04    |     37 | 11    |     47 |
| 05    |     38 | 12    |     25 |
| 06    |     40 | 13    |     42 |
| 07    |     47 |       |        |

## Le prix

`gpt-audio-1.5`, tarif public au 13 août 2026 : **64 $ par million de
jetons audio en sortie**, 2,50 $ par million de jetons de texte en entrée.

L'entrée est négligeable : une consigne courte et un mot thaï, quelques
dizaines de jetons par appel.

La sortie est le poste réel. Une prise dure 1,09 seconde en moyenne. Le
nombre de jetons par seconde d'audio n'est pas documenté de façon stable,
et **c'est la seule inconnue de ce chiffrage**. Deux hypothèses encadrent
la réponse :

| Hypothèse          | Jetons par prise | 322 prises | Avec reprises (×1,5) |
| ------------------ | ---------------: | ---------: | -------------------: |
| 50 jetons/seconde  |               55 |      1,1 $ |                1,7 $ |
| 200 jetons/seconde |              218 |      4,5 $ |                6,7 $ |

Le facteur 1,5 couvre les reprises : au banc d'essai du 4 août,
`gpt-audio-1.5` réussissait 5 contours sur 6, et le contrôle F0 refuse une
prise dont le ton ne correspond pas.

## Ce que ce chiffrage dit

**Le coût n'est pas le sujet.** Même en prenant l'hypothèse la plus
défavorable et en doublant par prudence, produire la voix de tout le
corpus coûte **moins de quinze dollars**. Ce n'est pas une décision
budgétaire, c'est une autorisation de principe.

Le vrai coût est ailleurs, et il est humain : aucune de ces voix n'aura été
relue par un locuteur natif. Le contrôle F0 vérifie que le contour tonal
correspond à ce que la leçon déclare. Il ne vérifie ni la naturalité, ni le
débit, ni l'accent. Une voix synthétique déclarée comme telle reste un
substitut assumé, jamais un enregistrement humain.

## Ce que je propose

Un budget plafonné à **20 $**, ce qui laisse une marge large sur toutes les
hypothèses, avec le plafond de 60 appels par exécution déjà présent dans
`packages/content/scripts/generate-audio.ts` et qui reste en place.

Produire dans cet ordre :

1. **L'unité 2**, la plus proche de la publication.
2. Les assets manquants des unités déjà compilables (3, 4, 5, 7, 8).
3. Le reste, au fur et à mesure que l'extraction récupère les exercices
   d'écoute encore refusés.

Rien ne part sans `--run`, et chaque fichier conserve fournisseur, modèle,
voix, paramètres, empreinte, durée et résultat du contrôle tonal.
