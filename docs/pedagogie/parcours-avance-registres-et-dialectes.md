# Parcours avancé : registre familier et thaïs régionaux

- Date : 4 août 2026
- Origine : décision du fondateur. Le parcours fondamental enseigne du thaï
  central poli à 97 %, ce qui apprend à **produire** sans apprendre à
  **comprendre** ce qu'on entend réellement.
- Statut : plan de production, à exécuter après les douze unités du
  fondamental.

## Le constat qui déclenche ce parcours

Mesure sur les 60 leçons du fondamental, champ `registre` de chaque item :

| Registre | Items | Part  |
| -------- | ----- | ----- |
| neutre   | 348   | 70 %  |
| poli     | 134   | 27 %  |
| familier | 6     | 1,2 % |
| soutenu  | 2     | 0,4 % |

Six items familiers sur cinq cents. Et les trois formes familières
enseignées (หวัดดี, ทีวี, เท่าไหร่) l'ont été **par accident de méthode** :
elles ont été repérées parce que le dictionnaire normatif ne les listait
pas, jamais parce qu'une leçon avait pour objectif de les enseigner.

Aucune leçon n'a jamais reçu pour consigne d'enseigner le registre courant.
Le biais vient des briefs de production, pas des sources.

## Ce que la vérification du 4 août 2026 établit

Le dictionnaire normatif **porte lui-même les étiquettes de registre et de
région**, ce qui rend ce parcours sourçable par la chaîne existante, sans
assouplir aucune règle :

- `กู` : l'entrée écrit « ในปัจจุบันมักถือกันว่าไม่สุภาพ », aujourd'hui
  généralement tenu pour impoli. Le jugement de registre vient du
  dictionnaire, pas de nous.
- `เว้า` : entrée « (ถิ่น-อีสาน) ก. พูด. », soit « dialecte du nord-est,
  verbe, parler ». Le dictionnaire normatif **étiquette les formes
  régionales**.
- Les étiquettes attendues sont `(ปาก)` pour la langue parlée, `(ถิ่น-อีสาน)`
  pour le nord-est, `(ถิ่น-พายัพ)` pour le nord, `(ถิ่น-ปักษ์ใต้)` pour le
  sud.

### Un piège trouvé en le vérifiant, et il est bloquant

`จ้า` renvoie bien une entrée, mais c'est l'**adjectif** « intense, vif »
(สีจ้า, แสงจ้า), pas la particule finale de phrase que l'on voulait
enseigner. Un simple contrôle de présence l'aurait déclarée attestée à
tort.

**Règle nouvelle pour ce parcours** : pour toute affirmation de registre ou
de région, la présence de la graphie ne suffit jamais. Le **corps de
l'entrée doit être lu** avec `scripts/verification/rid-entry.mjs`, et
l'étiquette doit être citée. Sans étiquette lue, pas d'affirmation de
registre.

## Fil A : « Le thaï qu'on entend vraiment »

Trois unités, orientées **compréhension d'abord**. L'apprenant reconnaît
tout, et produit seulement ce qu'il peut produire sans risque.

- **Unité 13, les particules qui portent le ton de la phrase.** นะ, สิ, ล่ะ
  et leurs voisines. Elles ne traduisent pas un mot français : elles
  disent l'attitude. C'est le premier écart entre le thaï de manuel et le
  thaï entendu.
- **Unité 14, s'adresser à quelqu'un pour de vrai.** Le fait central que le
  fondamental n'a pas dit : en thaï on emploie souvent un surnom ou un
  terme de parenté là où le français met un pronom. Les formes très
  familières sont **expliquées et reconnues, jamais mises en production**,
  et la leçon dit pourquoi en citant l'étiquette du dictionnaire.
- **Unité 15, ce qui se contracte à l'oral.** Ce que la parole rapide fait
  aux mots déjà connus, et pourquoi l'apprenant ne les reconnaît pas alors
  qu'il les a appris.

## Fil B : « Les thaïs régionaux »

Deux unités, en **reconnaissance seule**. Aucun objectif de production.

- **Unité 16, l'isan.** Le nord-est, proche du lao, première langue de
  dizaines de millions de personnes. Ce qu'il change sur des mots que
  l'apprenant connaît déjà.
- **Unité 17, le nord et le sud.** Reconnaître, situer, ne pas confondre
  avec une erreur de prononciation.

Ce fil est un **différenciateur produit** : aucune application francophone
ne le propose. Il n'a de sens qu'après le fondamental, et il doit dire
clairement qu'on apprend à reconnaître, pas à parler.

## Ce que ce parcours ne fera pas

- **Pas d'argot de jeunes.** Il change trop vite pour tenir la règle des
  deux sources, et une leçon périmée sur ce terrain est ridicule plutôt
  qu'utile.
- **Pas de production des formes offensantes.** Elles sont expliquées pour
  être comprises, et l'étiquette du dictionnaire est citée.
- **Aucune promesse de « parler comme un natif ».** Le parcours apprend à
  comprendre ce qu'on entend et à choisir son registre en connaissance de
  cause.

## Correction à apporter au fondamental

L'unité 12 doit dire explicitement que le parcours fondamental enseigne le
thaï central poli, et que la langue de tous les jours est un autre registre
que l'apprenant n'a pas encore vu. Sans cette phrase, le fondamental laisse
croire qu'il couvre la langue réelle.
