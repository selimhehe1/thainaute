# ADR-0026 : étendre le schéma pour la pédagogie réellement rédigée

- Statut : accepté
- Date : 4 août 2026
- Décideurs : Selim (« étendre le schéma » plutôt que compiler avec perte),
  Claude (relevé des écarts et conception)
- Concerne : `packages/content` (schémas, validation, contrats publics),
  `apps/web` (mapper de livraison), phase D de l'ADR-0024

## Contexte

Le curriculum compte 65 leçons, 570 items et 280 blocs d'exercice rédigés,
vérifiés et consolidés. Aucun n'est visible dans l'application : le pont
markdown vers schémas, la phase D de l'ADR-0024, n'a jamais été construit.

En préparant ce pont, une comparaison ligne à ligne entre ce qui est écrit
et ce que les schémas savent stocker a montré que **le schéma est plus
pauvre que le contenu**. Compiler en l'état aurait donc consisté à jeter
une partie de ce qui a été produit, sans que la perte apparaisse nulle part
ailleurs que dans la qualité de l'apprentissage.

## Les trois écarts mesurés

**1. Un bloc d'exercice n'est pas un exercice.** Le markdown écrit
« Tirages : 12 au total, ordre aléatoire » puis « Seuil de réussite : 9 sur
12 ». Un bloc vaut douze exercices Zod. Le contenu modélise des viviers
avec tirage et seuil, le schéma des listes figées, et le lecteur planifie
20 exercices au maximum par expédition. Sans notion de vivier, une séance
enchaînerait les douze tirages d'un même bloc sans savoir qu'ils mesurent
la même chose.

**2. Le retour pédagogique était amputé.** `feedback` valait
`{correctFr, incorrectFr}`, un seul couple de 280 caractères. Le curriculum
écrit des retours conditionnels au distracteur choisi : « confusion ค่ะ
contre คะ : réécoutez la dernière syllabe ». Dire « raté » n'enseigne rien ;
dire _pourquoi_ est exactement le travail de la leçon.

**3. Une option d'écoute est souvent une graphie thaïe.** Le schéma
n'offrait que `labelFr`, 120 caractères, sémantiquement français. Ranger
สบายดีไหมครับ dans un champ français revient à le priver de la porte NFC et
du relevé de points de code, sur une chaîne qui en a précisément besoin.

## Décision 1 : une option peut porter du thaï

`options[]` gagne `thaiRaw` et `transcription`, `labelFr` devient nullable.
Un `superRefine` refuse une option muette des deux côtés, et une
transcription sans graphie à transcrire. `validateBundle` soumet `thaiRaw`
à la même porte NFC que les items.

Le DTO public reçoit `thaiRaw` : le distribuer autrement obligerait le
client à deviner la langue d'une chaîne.

**Il ne reçoit pas `transcription`, et c'est délibéré.** Un test existant a
révélé la fuite avant qu'elle ne parte : sur un exercice de discrimination
tonale opposant ขา et ข่า, joindre `khǎa` et `khàa` aux options revient à
écrire la réponse à côté de la question. Le contenu porte la transcription,
le réseau non.

Le mapper passe au passage d'une recopie à une **projection explicite**. Un
DTO se construit par liste blanche : ajouter un champ au contenu ne doit
jamais le publier par inadvertance, ce qui venait précisément d'arriver.

## Décision 2 : le retour peut cibler le distracteur choisi

`feedback` gagne `variants: [{ selectedOptionId, labelFr, textFr }]`.
`correctFr` et `incorrectFr` restent le repli quand aucune variante ne
correspond.

`validateBundle` refuse une variante qui désigne une option inexistante, et
toute variante ciblée sur une mécanique sans options. Un retour écrit,
relu et audité mais jamais affichable serait un gaspillage silencieux.

## Décision 3 : les exercices s'organisent en viviers

La leçon gagne
`pools: [{ poolId, promptFr, mechanic, drawCount, passRequired, sampleSize }]`
et chaque exercice gagne `poolId` et `drawIndex`.

Contrôles : le seuil ne peut dépasser ni le nombre de tirages écrits ni le
nombre de tirages joués, la mécanique du vivier doit être celle de ses
tirages, et le nombre de tirages portés doit égaler `drawCount`. Un vivier
qui annonce douze tirages et n'en porte que huit ferait mentir son propre
seuil.

## Rétrocompatibilité, et sa preuve

Tous les champs ajoutés portent une valeur par défaut. Les deux fixtures du
dépôt valident **sans avoir été modifiées**, et la suite de tests existante
passe inchangée : c'est la preuve que l'extension est bien additive, pas une
affirmation.

Une seule erreur de typage est apparue dans tout le monorepo, au mapper du
DTO public. C'était l'endroit exact où une décision devait être prise, et
elle a été prise plutôt que contournée par un repli sur `labelFr`.

## Ce que cette décision ne fait pas

- Elle n'affiche rien : le compilateur, l'audio et le branchement suivent.
- Elle ne change pas le lecteur, qui ignore encore `variants` et `pools`.
- Elle ne rend rien publiable : les portes `HUMAN_AUTHOR_MISSING` et
  `HUMAN_AUDITOR_MISSING` restent fermées, le contenu étant généré.
- Elle ne résout pas les trois constats relevés au passage : seule l'écoute
  alimente le SRS, la compétence `tone` n'est produite par aucune mécanique,
  et `association` n'a pas d'`itemId` d'exercice alors que
  `attempt_events.item_id` est `NOT NULL`.
