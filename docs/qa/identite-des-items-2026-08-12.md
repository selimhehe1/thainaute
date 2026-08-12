# Identité des items et consolidation du SRS — 12 août 2026

Constat relevé en préparant le dossier de preuve de l'unité 1. Il ne bloque
aucune tranche technique en cours, mais il doit être tranché **avant** la
première publication, parce qu'un identifiant publié devient immuable et que
la progression des apprenants s'y accroche.

## Ce qui est mesuré

Sur les 66 paquets compilés de `packages/content/data/lessons` :

| Mesure                                        | Valeur |
| --------------------------------------------- | -----: |
| Graphies thaïes distinctes                    |    345 |
| Identifiants d'items distincts                |    526 |
| Graphies portant **plusieurs** identifiants   |    104 |
| Identifiants concernés par cette multiplicité |    285 |

Autrement dit, **plus de la moitié des items du corpus sont des doublons
d'une graphie déjà présente ailleurs**.

Quelques cas réels :

- `ครับ` porte 9 identifiants, dans les leçons 1E, 3E, 4E, 5A, 5E, 11B, 11E,
  13A et 13B ;
- `ไหม` en porte 7 ;
- `ขา`, `ค่ะ`, `ขอบคุณ`, `คะ`, `สอง` en portent 5 chacune.

Sur les 104 graphies concernées, 58 portent une traduction française
**strictement identique** dans toutes leurs occurrences. Les 46 autres
« divergent », mais l'écart est presque toujours une reformulation de la même
définition (« forêt » et « forêt, bois »), pas un sens différent. Le seul
homographe véritablement distinct relevé est `ไหม` : la soie d'un côté, la
particule de question fermée de l'autre.

## Pourquoi cela compte

`public.learner_item_state` est indexée par `(user_id, item_id, dimension)`.
La projection SRS retrouve un état par `itemId`, aussi bien côté serveur que
dans la notation locale.

Conséquence directe : un apprenant qui maîtrise `ครับ` en unité 1 repart de
zéro sur `ครับ` en unité 3, puis en unité 4, puis en unité 5. Neuf états de
maîtrise indépendants pour une seule particule. La répétition espacée ne
consolide jamais, et la file de révisions se remplit de doublons que
l'apprenant perçoit comme des mots différents.

C'est en tension directe avec ce que `docs/PRODUCT_VALIDATION.md` pose comme
preuve d'apprentissage : « rappeler des éléments déjà vus après un délai, et
pas seulement réussir un quiz immédiatement ».

## D'où cela vient

`packages/content/scripts/compile-items.ts` dérive l'identifiant ainsi :

```ts
id: uuidStable("item", identifiantLecon, thaiRaw);
```

L'identifiant de la leçon entre donc dans l'empreinte. Deux leçons qui
déclarent la même graphie produisent deux items.

Un mécanisme de réemploi existe pourtant, et
[ADR-0040](../adr/0040-compilation-cards-reutilisees-et-manches-textuelles.md)
annonce que « la carte conserve son identifiant, sa provenance et ses données
SRS ». Mais dans `compile-lesson.ts`, l'index global ne sert qu'aux graphies
**non déclarées** par la source courante :

```ts
if (!itemsPourResolution.has(graphie) && source.includes(graphie)) {
  itemsPourResolution.set(graphie, item);
}
```

Or les leçons de révision **redéclarent** leurs mots, pour en donner une glose
adaptée au contexte. Le réemploi ne s'applique donc presque jamais, et
l'intention de l'ADR-0040 n'est pas atteinte dans les faits.

Ce n'est pas une faute d'écriture des auteurs : redonner une glose contextuelle
est pédagogiquement sain. C'est la clé d'identité qui ne distingue pas « la
même carte revue » de « une nouvelle carte ».

## Ce que cela change pour l'audio

L'identifiant d'asset audio suit le même chemin
(`uuidStable("audio", identifiant, tirage.itemId)`). Produire la voix du
corpus entier ferait donc synthétiser plusieurs fois les mêmes mots. Sur les
graphies mesurées, c'est environ 35 % d'appels facturés en trop.

Bonne nouvelle en revanche pour la tranche en cours : **l'unité 1 ne réclame
aucun fichier audio supplémentaire**. Ses six leçons demandent 20 assets, et
les 20 sont présents. Les leçons 1C et 1E n'ont simplement aucun exercice
d'écoute. Les seuls fichiers manquants du corpus sont ceux de `u03-l3b` (8) et
`u04-l4b` (5), soit 13 clips, dans des unités que nous ne publions pas encore.

## Options

1. **Identité par graphie et sens, à l'échelle du pack de langue.** La carte
   devient l'unité de mémoire, la leçon n'est plus qu'un contexte
   d'apparition. Consolide le SRS, supprime les doublons audio. Demande de
   traiter les homographes (`ไหม`) par une clé qui porte le sens, et de
   choisir quelle glose est publiée.
2. **Couche « concept » séparée.** Les items restent par leçon, mais le SRS
   s'indexe sur un concept partagé. Plus de code, aucune migration de contenu,
   et deux notions à tenir au lieu d'une.
3. **Statu quo assumé.** Chaque leçon réenseigne. À dire honnêtement dans le
   produit, et à retirer des promesses de mémorisation.

## Recommandation

Trancher avant la publication de l'unité 1. Après publication, changer
l'identité d'un item signifie une nouvelle version de contenu et une
progression orpheline sur les anciens identifiants.

Décision liée : `OPEN-LEARN-001` (seuils de maîtrise et rôle de la
transcription), encore ouverte.

## Décision du fondateur, 12 août 2026

Option 1 retenue : **la carte devient l'unité de mémoire, la leçon n'est
qu'un contexte d'apparition.**

## Ce que la fusion demande réellement

`node scripts/content/divergences-de-cartes.mjs` classe les 104 graphies
concernées :

| Cas                                       | Graphies |
| ----------------------------------------- | -------: |
| Déclarations identiques, fusion mécanique |       50 |
| Même carte reformulée                     |       47 |
| **À arbitrer par un humain**              |    **7** |

Les sept cas, et ce qu'ils demandent :

- `ไหม` : véritable homographe, la soie contre la particule de question
  fermée. Deux cartes distinctes, pas une.
- `ล่ะ` : deux emplois séparés, dernière syllabe du bloc `แล้วคุณล่ะ` d'un
  côté, particule d'insistance de l'autre. Probablement deux cartes.
- `สวัสดีครับ` : **défaut de contenu à corriger avant toute fusion**, les
  deux leçons n'en déclarent pas la même prononciation.
- `คะ`, `พี่`, `น้อง`, `เสีย` : une seule carte, une glose à choisir entre
  une version courte et une version enrichie.

Les 97 autres graphies ne demandent aucune décision : la fusion garde la
déclaration la plus complète, à empreinte de prononciation identique.
