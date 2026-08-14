# Les items que le compilateur refuse, et ce qu'ils coûtent vraiment

Date : 2026-08-14. Mesure : compilation à blanc des 66 leçons, puis
recoupement de chaque refus avec les graphies réellement présentes dans le
paquet compilé.

## Pourquoi ce document existe

Jusqu'ici je mesurais les **blocs d'exercices** refusés, jamais les **items**.
C'était mesurer les symptômes en aval : un item refusé rend sa graphie
introuvable, et tous les exercices qui la citent tombent ensuite pour
« item introuvable ».

## Le chiffrage

**61 items sont refusés. 54 sont des pertes réelles, 7 des doublons sans
coût.**

| Motif                                | Pertes réelles | Doublons |
| ------------------------------------ | -------------: | -------: |
| plusieurs graphies dans un seul item |         **37** |        1 |
| aucune source reconnue               |              9 |        4 |
| champ `ipa` de famille « separees »  |              4 |        0 |
| champ `ipa` de famille « variante »  |              2 |        0 |
| graphie décorée                      |              2 |        0 |
| champ `ipa` de famille « compose »   |              0 |        2 |

Un refus est classé **doublon** quand toutes les graphies de l'item titré sont
déjà présentes dans le paquet compilé, déclarées ailleurs dans la même leçon.
Le refus ne coûte alors rien au produit.

## Le piège du message

`u10-l10e` déclare ses graphies **deux fois** : une fois comme item
d'enseignement, une fois comme spécimen de lecture. Les spécimens sont refusés
pour « aucune source reconnue », ce qui laisse croire à un défaut de sourçage.

J'ai converti la prose de sourçage du premier spécimen en champ `sources`. Le
refus a disparu. **Le paquet n'a pas bougé d'un item ni d'un exercice** : neuf
items et dix exercices avant, autant après, seul l'ordre a changé.

Le changement a donc été annulé. Un correctif qui ne corrige rien mais fait
taire un message est pire qu'un message qui reste.

## La porte de sourçage, et pourquoi elle ne doit pas bouger

`compilerItem` compare le champ `sources` à un registre de sources connues.
Un renvoi vers un item d'une autre leçon n'en est pas une, et l'item est
refusé.

C'est correct. Un item doit tracer vers une source externe réelle, pas vers un
autre item : sans cela, une chaîne de renvois pourrait faire croire à une
attestation qui n'existe nulle part. Les trois « instances » de `u08-l8e`
(`ผมหาเสื้อครับ` et deux autres phrases assemblées) sont donc des pertes
légitimes tant qu'elles n'ont pas de sources propres.

## Ce qui reste, dans l'ordre de rendement

1. **37 items à plusieurs graphies.** C'est le gros morceau, et il ne demande
   aucune recherche : les champs sont déjà écrits graphie par graphie. Les
   scinder est une mise en conformité avec l'ADR-0042, qui pose l'identité
   d'une carte comme `(pack, graphie, sens)` : un item à deux graphies
   contredit déjà cette décision.
2. **9 items sans source reconnue**, dont les phrases assemblées de `u08-l8e`.
   Travail éditorial réel.
3. **8 items à IPA multiple** (« separees », « variante »), même famille que la
   notation « compose » corrigée en #107.
4. **2 graphies décorées.**

## Ce que ce document ne dit pas

Il compte des items, pas leur valeur pédagogique. Et il ne dit pas combien
d'exercices chaque item récupéré débloquera : cette mesure ne se fera qu'après,
en recompilant.
