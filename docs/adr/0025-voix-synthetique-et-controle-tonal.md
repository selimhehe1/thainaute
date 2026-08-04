# ADR-0025 : moteur de voix synthétique et contrôle acoustique du ton

- Statut : accepté
- Date : 4 août 2026
- Décideurs : Selim (fourniture de la clé OpenAI, arbitrage « GPT fait le
  taff », remise en cause du modèle retenu), Claude (banc d'essai et mesure)
- Concerne : `packages/content` (schémas et portes de publication),
  `scripts/verification/`, production audio du curriculum

## Contexte

Le curriculum compte 60 leçons publiables dont le contrat impose un audio
thaï traçable. Aucun budget n'existe pour une voix humaine native au
lancement, et `CLAUDE.md` autorise explicitement une voix synthétique
« clairement déclarée et préalablement comparée entre plusieurs
fournisseurs/modèles ».

En thaï, se tromper de ton ne produit pas un accent approximatif : ขา
(jambe, ton montant) et ค่า (valeur, ton descendant) partagent consonne et
voyelle. Un moteur qui rate le ton ne dégrade pas la qualité, il enseigne un
autre mot. Le choix du moteur est donc une décision pédagogique, pas une
décision de confort.

## Ce qui a été mesuré

Banc d'essai exécuté le 4 août 2026 sur la série de paires minimales
vérifiée en leçon 1A : คา (moyen), ข่า (bas), ค่า (descendant), ค้า (haut),
ขา (montant). Quatre moteurs, deux voix chacun, 55 générations au total.

### Premier instrument, écarté

Le contrôle initial faisait relire l'audio produit par une reconnaissance
vocale et comparait la graphie rendue. Il ne tient pas :

- `gpt-4o-transcribe` ignore le paramètre `language: "th"` sur syllabe
  isolée et rend « Car. », « カー », « 하. » : ni thaï, ni comparable.
- `whisper-1` hallucine `โปรดติดตามตอนต่อไป` (« restez avec nous pour la
  suite »), résidu de sous-titres présent dans ses données, sur 2 cas sur 15.
- Plus grave sur le principe : un transcripteur possède son propre modèle de
  langue et corrige vers le mot le plus probable. Il masque donc exactement
  l'erreur cherchée.

Conclusion : un accord transcripteur/synthèse est une preuve **faible**, un
désaccord une preuve **forte**. Cet instrument ne peut pas attester un ton.

### Second instrument, retenu

Mesure du contour de fréquence fondamentale directement sur le signal
(`scripts/verification/f0-contour.mjs`) : autocorrélation normalisée,
fenêtres de 45 ms au pas de 10 ms, correction des sauts d'octave, contour
exprimé en demi-tons autour de la médiane de l'énoncé. Aucun modèle de
langue n'intervient, donc rien ne peut corriger vers le mot attendu.

Six contrôles par voix : `bas < moyen`, `descendant chute`, `montant
remonte`, `haut ne chute pas`, `moyen reste plat`, `registre déployé`.

### Résultats

| Moteur / voix                        | Note | Tons mesurables |
| ------------------------------------ | ---- | --------------- |
| `gpt-audio-1.5` / alloy              | 5/6  | 5/5             |
| `gpt-audio-1.5` / coral              | 5/6  | 5/5             |
| `tts-1-hd` / onyx                    | 4/6  | 5/5             |
| `tts-1-hd` / shimmer                 | 4/6  | 5/5             |
| `gpt-4o-mini-tts` / onyx             | 4/6  | 5/5             |
| `gpt-4o-mini-tts` / coral            | 4/6  | 5/5             |
| `gpt-4o-mini-tts-2025-12-15` / coral | 4/6  | 5/5             |
| `gpt-4o-mini-tts-2025-12-15` / onyx  | 2/5  | 4/5             |

Trois enseignements :

1. Le modèle audio pleine taille domine les modèles `mini` dédiés à la
   synthèse, sur les deux voix testées.
2. Le snapshot le plus récent (`2025-12-15`) est le plus mauvais du banc,
   sous l'alias qu'il remplace et sous `tts-1-hd`. « Plus récent » n'est pas
   un critère.
3. Le contrôle discriminant est `montant remonte` : `tts-1-hd`,
   `gpt-4o-mini-tts` et le snapshot de décembre produisent un ton montant
   **réalisé descendant**, c'est-à-dire l'inverse exact. `gpt-audio-1.5` est
   le seul moteur à ne produire aucune forme catégoriquement fausse ; ses
   deux points perdus sont des quasi-réussites au seuil.

## Décision 1 : `gpt-audio-1.5` comme moteur de référence

La production audio du curriculum utilise `gpt-audio-1.5` via
`/v1/chat/completions` en modalité audio. `gpt-4o-mini-tts` et `tts-1-hd`
sont écartés pour le contenu pédagogique.

## Décision 2 : la mesure acoustique devient une preuve de plein droit

`audioManifest.entries[].toneCheck` enregistre méthode, outil, ton attendu,
forme observée, pente et étendue en demi-tons, cohérence et horodatage. Le
bloqueur `SYNTHETIC_AUDIO_UNVERIFIED` accepte désormais soit l'aller-retour,
soit la mesure acoustique. Un nouveau bloqueur
`SYNTHETIC_AUDIO_TONE_MISMATCH` refuse un contour incohérent.

Le schéma refuse en outre une attestation complaisante : déclarer
`consistent: true` alors que la forme observée contredit le ton attendu est
une erreur de validation, pas un avertissement.

## Décision 3 : vérification par fichier, jamais par voix

Aucun moteur n'obtient 6/6, et les échecs diffèrent d'une voix à l'autre au
sein d'un même moteur. Valider une voix une fois puis lui faire confiance
serait une généralisation non mesurée. Chaque fichier publié porte son
propre `toneCheck`.

## Décision 4 : le studio affiche l'état du contrôle

`toneStatus` distingue `verified_acoustic`, `verified_transcript_only`,
`mismatch` et `unverified`. Un relecteur ne peut pas approuver une voix
synthétique sans voir si son contour a été mesuré, et une transcription
seule n'est jamais présentée comme une validation du ton.

## Limites assumées

- Les seuils des six contrôles sont une construction interne, calibrée sur
  les contours décrits en leçon 1A. Le **classement** est solide, puisque
  tous les moteurs subissent le même test ; la **note absolue** n'a aucune
  autorité externe.
- Aucun enregistrement natif de référence n'existe encore. La mesure compare
  des formes à des descriptions, pas à une production humaine attestée.
- Le banc porte sur des syllabes isolées, condition défavorable pour tout
  moteur. Il n'anticipe pas le comportement en phrase.
- `Revue native : en attente` reste affiché. Rien dans cet ADR ne constitue
  une validation par un locuteur thaï.

## Suites

- Étendre le banc aux voix restantes de `gpt-audio-1.5` avant la production
  de masse.
- Mesurer la longueur vocalique, seconde difficulté phonémique absente du
  français, non couverte par ce banc.
- Constituer un corpus gold natif dès que les revenus le permettent, puis
  recalibrer les seuils contre de vrais enregistrements.
