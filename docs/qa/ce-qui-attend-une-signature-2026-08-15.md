# Ce qui attend une signature, et ce que coûte le reste

Date : 2026-08-15. Mesuré par `pnpm content:audit --release` et par lecture
des paquets compilés.

## 47 leçons n'attendent que la signature

Sur les 61 leçons non publiées, **47 ne portent plus que les quatre bloqueurs
génériques** : `WORKFLOW_NOT_PUBLISHED`, `VISIBILITY_NOT_PUBLIC`,
`HUMAN_AUTHOR_MISSING`, `HUMAN_AUDITOR_MISSING`.

Les deux premiers se lèvent mécaniquement à la publication. Les deux autres
sont la signature du fondateur.

| Unité   |  Prêtes | Bloquées par autre chose                              |
| ------- | ------: | ----------------------------------------------------- |
| u02     |     3/5 | `l2b`, `l2c` : audio                                  |
| u03     |     3/5 | `l3b` : audio et champs linguistiques ; `l3c` : audio |
| u04     |     4/5 | `l4b` : audio                                         |
| u05     |     4/5 | `l5d` : audio                                         |
| **u06** | **5/5** | rien                                                  |
| u07     |     4/5 | `l7e` : audio                                         |
| u08     |     3/5 | `l8b`, `l8c` : audio                                  |
| u09     |     4/5 | `l9b` : audio                                         |
| u10     |     3/5 | `l10a` : audio ; `l10e` : champs linguistiques        |
| **u11** | **5/5** | rien                                                  |
| **u12** | **5/5** | rien                                                  |
| u13     |     4/5 | `l13d` : audio                                        |

## Le piège de la dispersion

L'audio ne bloque que 13 leçons, ce qui semblait peu. Mais elles sont
**dispersées sur onze unités**, donc aucune de ces onze ne peut publier comme
un tout cohérent. Publier l'unité 2 sans `l2b` ni `l2c` donnerait une séquence
trouée.

Les trois unités complètes, `u06`, `u11` et `u12`, sont exactement celles qui
n'ont **aucun exercice d'écoute**. Les publier d'abord reviendrait à ouvrir le
parcours par ses unités les plus muettes.

## Le coût réel de l'audio, et il est dérisoire

Il faut **73 enregistrements** pour débloquer les 13 leçons.

| Leçon                             |     Prises |
| --------------------------------- | ---------: |
| `u09-l9b`, `u10-l10a`, `u13-l13d` | 12 chacune |
| `u03-l3b`                         |          8 |
| `u08-l8c`                         |          7 |
| `u07-l7e`                         |          6 |
| `u04-l4b`                         |          5 |
| `u05-l5d`                         |          4 |
| `u03-l3c`, `u08-l8b`              |  2 chacune |
| `u01-l1e`, `u02-l2b`, `u02-l2c`   |  1 chacune |

Le chiffrage du 13 août établit que **tout le corpus**, soit 322 prises, coûte
moins de quinze dollars avec `gpt-audio-1.5`, reprises comprises. Ces 73 prises
en représentent moins d'un quart : **moins de quatre dollars**.

Ce n'est donc pas une décision budgétaire. C'est une autorisation de principe :
accepter qu'un appel facturable parte.

## Les trois décisions, par ordre de rendement

1. **Autoriser les 73 prises audio.** Moins de quatre dollars. Débloque les 13
   leçons dispersées, donc la publication d'unités entières au lieu de leçons
   éparses.
2. **Signer les dossiers de preuve**, unité par unité. Chaque signature est un
   fichier `content/signatures/NN.json` versionné, qui nomme le signataire, la
   date, le périmètre, et interdit littéralement de déclarer une revue native.
3. **Re-versionner l'unité 1.** Elle promet à ses apprenants une tolérance de
   saisie que le moteur ne tient pas, corrigée dans la PR #116 mais non
   appliquée au contenu publié, qui est immuable.

## Deux points que la signature ne doit pas masquer

**`u03-l3b` et `u10-l10e` portent `LINGUISTIC_FIELDS_INCOMPLETE`**, un
bloqueur distinct de l'audio. Il faut le traiter, pas le contourner.

**Six unités n'ont aucun exercice d'écoute** (`u06`, `u09` à `u13` pour
partie), ce que `docs/qa/portes-de-publication-2026-08-13.md` documente. Une
signature ne rend pas ces unités complètes : elle les publie telles quelles.
