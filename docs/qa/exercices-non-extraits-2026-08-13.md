# Ce qui reste au sol après la récupération des exercices, 13 août 2026

Mesure faite par le compilateur lui-même, `compilerLeconComplete`, et non
par une approximation de son résolveur. La commande qui la rend :

```powershell
pnpm --filter @thainaute/content content:compile-text
```

## Où on en est

| Mesure                     | 12 août | 13 août |
| -------------------------- | ------: | ------: |
| Exercices compilés         |     357 |     392 |
| Blocs d'exercice écartés   |     212 |     204 |
| Leçons sous cinq exercices |      28 |      26 |

Les 204 blocs écartés incluent **7 blocs qui ne sont pas des exercices**
(« Note sur les mécaniques retenues », « Mécaniques écartées et motif »).
Le vrai reste à traiter est donc de 197 blocs.

## Ce que le reste demande, par nature

### 1. Encore mécanique : 36 blocs, options de tirage illisibles

Notations non couvertes, à traiter comme les trois déjà reprises. Elles ne
posent aucune question de contenu, seulement de lecture. Les formes vues :

- options déclarées en sous-liste à puces, où la barre oblique sépare les
  faces d'une même option (`15 bahts / สิบห้าบาท / sìp·hâa bàat`) et non les
  options entre elles ; il faut lire la puce, pas la barre ;
- options décrites en prose non énumérable (« les quatre mêmes affichées
  ensemble aux huit tirages ») dont l'énumération réelle n'existe que dans
  les réponses des tirages ;
- tirages de rejeu de dialogue (« Audio : réplique 3 du dialogue,
  « ไข่เท่าไรคะ », voix féminine »), qui ne portent pas d'options du tout.

### 2. Éditorial, et c'est une décision produit : 37 items introuvables

C'est le point qui ne se règle pas par du code. Un exercice fait entendre
une suite thaïe que la leçon ne déclare pas comme item, donc l'extraction ne
sait pas **quelle carte SRS créditer**.

Deux familles de 18, plus un cas isolé.

**Famille A, le stimulus commence par un item déclaré (18 cas).**

| Leçon    | Stimulus joué       | Item déclaré le plus long qui le commence |
| -------- | ------------------- | ----------------------------------------- |
| u02-l2c  | ขอโทษครับ           | ขอโทษ                                     |
| u05-l5c  | ห้องน้ำอยู่ที่ไหนคะ | ห้องน้ำ                                   |
| u13-l13e | ไปครับ              | ไป                                        |
| u03-l3b  | ๑๐                  | ๑                                         |
| u03-l3e  | สิบฟองสามสิบบาท     | สิบ                                       |

Une règle « créditer le plus long préfixe déclaré » réglerait 16 cas sur 18
correctement. Elle se tromperait sur les deux derniers : `๑๐` n'est pas `๑`,
et créditer `สิบ` pour « dix œufs, trente bahts » attacherait la maîtrise
d'une phrase entière à un seul chiffre. Onze pour cent d'erreur sur une
décision de mémorisation, c'est trop pour l'automatiser.

**Famille B, aucun item déclaré ne recoupe le stimulus (18 cas).**

Deux sous-cas :

- des **distracteurs jamais déclarés** : อ้า, รับ, จอ, ถู, อาน, คือ, ถัง,
  ร้อย, เสื้อ, น้ำเปล่า, ๆ, ก็. Ils servent de contraste dans un exercice
  d'écoute sans jamais être enseignés ;
- des **phrases de bilan** que l'unité 12 rejoue : คุณชื่ออะไรครับ,
  ช่วยเรียกหมอครับ, มีปัญหาครับ, กี่วันแล้วคะ.

Ces phrases de bilan ne sont pas résolubles ailleurs non plus. Sur les 37
graphies cherchées, **2 seulement sont déclarées ailleurs dans le corpus** :
étendre le résolveur à tout le corpus, ce que l'identité de carte globale de
l'ADR-0042 rendrait légitime, ne réglerait presque rien et mérite son propre
ADR.

### 3. Le reste : environ 124 blocs

15 consignes absentes, 12 notations de réponse non reconnues, 12 réponses
absentes des options du bloc, 9 libellés non cités à droite, et une longue
traîne de causes à un ou deux cas. À traiter par famille, comme le reste.

## La décision, prise par le fondateur le 13 août 2026

**Ces phrases deviennent des cartes à part entière.** Selim a tranché en
faveur du contenu contre le raccourci : un apprenant qui reconnaît
`ขอโทษครับ` a reconnu une phrase polie complète, pas un mot nu, et sa
mémoire doit s'accrocher à ce qu'il a réellement entendu.

Ce que cela engage, pour chacune des 37 : une entrée d'autorat complète
avec IPA, syllabation, ton, longueur vocalique, registre et sources, puis
un passage par les sept audits. C'est une tranche éditoriale, pas un
correctif, et elle n'est pas faite ici.

Jusque-là, ces blocs restent refusés. C'est le comportement voulu : un
exercice sans carte identifiable ne doit pas être compilé avec une carte
approchée.

### La question telle qu'elle se posait

Un exercice qui fait entendre `ขอโทษครับ` mesure-t-il la carte `ขอโทษ`, ou
faut-il que `ขอโทษครับ` devienne une carte à part entière ?

Les deux réponses étaient défendables et elles ne coûtaient pas la même
chose. Créditer le préfixe ne demandait aucun contenu nouveau mais attachait
la maîtrise d'une phrase polie à son mot nu.

Les deux échappatoires mécaniques ont été mesurées avant de poser la
question, et toutes deux échouent : la règle du plus long préfixe donne 16
bons cas sur 18, et l'extension du résolveur à tout le corpus n'en règle que
2 sur 37.
