# ADR-0044 : le mobile sert le contenu publié

- Statut : accepté
- Date : 13 août 2026
- Concerne : application mobile, exports Expo, contrôle de bundle
- Remplace [ADR-0041](0041-quarantaine-contenu-mobile-distribuable.md)

## Contexte

L'ADR-0041 murait tout le contenu U01 dans le graphe distribuable mobile.
Sa raison était juste : les six leçons étaient `draft`, et un écran marqué
« interne » ne protège rien, le contenu restant extractible d'un APK ou
d'un IPA.

Cette raison a disparu le 13 août pour cinq de ces leçons, signées par le
fondateur et publiées. Elle reste entière pour `u01-l1e`, que la signature
exclut explicitement.

Le coût du mur était devenu visible : environ 6 000 lignes d'écrans jouables
dormaient sous `apps/mobile/internal/`, importées uniquement par leurs
tests, et deux onglets sur trois de la barre principale menaient à
« CONTENU NON PUBLIÉ ».

## Décision

Le graphe distribuable sert les leçons `published` et `public`, et elles
seules. Pratiquer, Progrès, l'unité 1 et le lecteur mixte des cinq
mécaniques redeviennent des routes Expo ordinaires.

Trois gardes remplacent le mur, et aucun n'est une liste écrite à la main.

1. **`packages/content/src/mobile.ts` refuse de se charger** si un paquet
   embarqué n'est pas publié. Un import est statique, donc la liste des
   leçons embarquées est forcément écrite à la main ; l'assertion
   transforme un oubli en panne immédiate plutôt qu'en fuite silencieuse.
2. **`apps/mobile/scripts/check-public-export.mjs` lit le statut de chaque
   paquet du corpus**, au lieu des six leçons U01 codées en dur. Il
   surveille aujourd'hui 182 marqueurs de brouillon au lieu de 6 leçons, et
   n'a plus à être mis à jour à chaque publication. Les WAV sont appariés
   par empreinte : la fixture, ou l'audio d'une leçon publiée, et rien
   d'autre. Un fichier modifié après son contrôle acoustique ne ressemble
   plus à ce qui a été audité et ne passe pas.
3. **`tests/mobile-public-content-boundary.test.mjs`** vérifie qu'aucune
   route Expo ne cite l'identifiant, la version ou le titre d'une leçon en
   brouillon, et échoue si le corpus devient entièrement publié, auquel cas
   l'assertion ne prouverait plus rien.

## Une panne que le mur cachait

La carte des `require` audio mobiles, écrite à la main, pointait encore
vers les noms d'assets d'avant l'ADR-0042, qui a redéfini l'identité d'une
carte et renommé les 23 fichiers. Le bundle ne compilait donc plus. Le
défaut était invisible depuis des jours parce que le fichier vivait hors du
graphe Expo, et il est apparu à la seconde où le mur est tombé.

`scripts/content/generer-audio-mobile.mjs` génère désormais cette carte
depuis les manifestes. React Native exige un littéral de chaîne dans
`require`, d'où un module généré plutôt qu'une lecture de dossier.

C'est le coût réel d'une quarantaine longue : elle met le code hors du
chemin des vérifications, et la dette s'accumule sans bruit.

## Conséquences

L'export mobile embarque 24 WAV au lieu d'un : les 23 voix de l'unité 1 et
la fixture technique. `u01-l1e` sort du bundle, avec sa configuration
d'expédition.

Deux tests perdent une partie de leur matière, et le disent : ils
s'appuyaient sur `u01-l1e`, seule leçon embarquée à porter deux exercices
non audio. L'avance d'exercice en exercice se prouve maintenant sur une
configuration typée qui ne dépend d'aucune leçon publiée, ce qui la rend
indépendante de ce que le corpus publie.

## Ce que cette décision ne fait pas

Elle ne dit rien de la livraison serveur, qui reste la voie prévue pour un
corpus complet et que `THAINAUTE_PUBLIC_CONTENT_MODE` gouverne. Embarquer
convient à une unité publiée et stable ; il faudra mesurer avant d'embarquer
soixante-six leçons et leur audio.

Elle ne prononce rien non plus sur la parité de progression entre le web et
le mobile, qui exige un compte et une synchronisation, donc un Supabase
hébergé. Le critère AC-LEARN-001 du brief reste à démontrer.
