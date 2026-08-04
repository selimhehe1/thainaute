// Planchers des cinq exercices de `u13-l13a`, calculés sur les tirages EXACTS
// écrits dans le fichier, et non estimés.
//
// POURQUOI CE SCRIPT EXISTE. `lecon-13a.md` annonçait à ses cinq exercices des
// « comptes produits par script le 2026-08-04 », et à sa partie 1 que « le
// script de calcul simule la stratégie tirage par tirage et imprime ses deux
// échecs ». Aucun script correspondant n'était versionné, alors que les quatre
// leçons sœurs avaient versionné les leurs. Le contre-audit du 2026-08-04 l'a
// rendu comme finding N4 : les valeurs étaient justes, la reproductibilité ne
// l'était pas. Ce script rend la promesse vraie.
//
// Il porte en outre le contrôle de la remarque de conception de l'exercice 2
// sur la longueur, que le fichier énonçait de tête et qui était fausse.
//
// Usage : node scripts/verification/tmp-13a-planchers.mjs

const ligne = (titre) => console.log(`\n===== ${titre} =====`);
const car = (s) => [...s].length;

const binom = (n, k) => {
  let r = 1;
  for (let i = 0; i < k; i += 1) r = (r * (n - i)) / (i + 1);
  return r;
};
const queueBinomiale = (n, seuil, p) => {
  let s = 0;
  for (let k = seuil; k <= n; k += 1)
    s += binom(n, k) * p ** k * (1 - p) ** (n - k);
  return s;
};

// ---------------------------------------------------------------- exercice 1
// 12 tirages, trois cartes chacun, ordre des cartes tiré au hasard.
const ex1 = [
  {
    bonne: "สบายดีไหมครับ",
    cartes: ["สบายดีไหมครับ", "สบายดีครับ", "สบายดีไหมคะ"],
  },
  { bonne: "สบายดีครับ", cartes: ["สบายดีครับ", "สบายดีไหมครับ", "สบายดีค่ะ"] },
  {
    bonne: "สบายดีไหมคะ",
    cartes: ["สบายดีไหมคะ", "สบายดีไหมครับ", "สบายดีค่ะ"],
  },
  { bonne: "สบายดีค่ะ", cartes: ["สบายดีค่ะ", "สบายดีไหมคะ", "สบายดีครับ"] },
  { bonne: "ไปครับ", cartes: ["ไปครับ", "ไปค่ะ", "ไปหาหมอไหมครับ"] },
  { bonne: "ไปค่ะ", cartes: ["ไปค่ะ", "ไปครับ", "ไปหาหมอไหมคะ"] },
  {
    bonne: "ไปหาหมอไหมคะ",
    cartes: ["ไปหาหมอไหมคะ", "ไปหาหมอไหมครับ", "ไปค่ะ"],
  },
  {
    bonne: "ปวดหัวไหมครับ",
    cartes: ["ปวดหัวไหมครับ", "ผมปวดหัวครับ", "ปวดหัวไหมคะ"],
  },
  { bonne: "มียาไหมคะ", cartes: ["มียาไหมคะ", "มียาไหมครับ", "ไปค่ะ"] },
  {
    bonne: "แล้วคุณล่ะคะ",
    cartes: ["แล้วคุณล่ะคะ", "แล้วคุณล่ะครับ", "สบายดีไหมคะ"],
  },
  { bonne: "ไหม", cartes: ["ไหม", "ไม้", "ไม่"] },
  { bonne: "ป่า", cartes: ["ป่า", "ปา", "ปู"] },
];

ligne("Exercice 1 (listening), 12 tirages, seuil 9 sur 12");
{
  const distinctes = new Set(ex1.map((t) => t.bonne)).size;
  const compte = new Map();
  for (const t of ex1) {
    for (const carte of new Set(t.cartes)) {
      if (carte === t.bonne) compte.set(carte, (compte.get(carte) ?? 0) + 1);
    }
  }
  const meilleure = [...compte.entries()].sort((a, b) => b[1] - a[1])[0];
  console.log(`bonnes réponses distinctes : ${distinctes} sur ${ex1.length}`);
  console.log(
    `1. réponse constante par carte : ${meilleure[1]} sur 12 (« ${meilleure[0]} »)`,
  );

  const p = 1 / 3;
  console.log(
    `2. position constante : espérance ${(12 * p).toFixed(2)} sur 12 ; ` +
      `atteint 9 sur 12 dans ${(queueBinomiale(12, 9, p) * 100).toFixed(3)} % des sessions`,
  );

  let n = 3;
  for (const [nom, cmp] of [
    ["la carte la plus longue", (a, b) => car(b) - car(a)],
    ["la carte la plus courte", (a, b) => car(a) - car(b)],
  ]) {
    let stricts = 0;
    let exaequo = 0;
    for (const t of ex1) {
      const tri = [...t.cartes].sort(cmp);
      const tetes = tri.filter((c) => car(c) === car(tri[0]));
      if (tetes.length > 1) {
        if (tetes.includes(t.bonne)) exaequo += 1;
        continue;
      }
      if (tri[0] === t.bonne) stricts += 1;
    }
    console.log(
      `${n}. « toujours ${nom} » : ${stricts} strictement décidés, ` +
        `${exaequo} ex aequo favorable, plafond ${stricts + exaequo} sur 12`,
    );
    n += 1;
  }

  for (const [nom, test] of [
    ["qui finit par ครับ", (c) => c.endsWith("ครับ")],
    ["qui finit par ค่ะ", (c) => c.endsWith("ค่ะ")],
    ["qui finit par คะ", (c) => c.endsWith("คะ")],
    ["qui porte ไหม", (c) => c.includes("ไหม")],
  ]) {
    let applicables = 0;
    let esperance = 0;
    for (const t of ex1) {
      const retenues = [...new Set(t.cartes)].filter(test);
      if (retenues.length === 0) continue;
      applicables += 1;
      if (retenues.includes(t.bonne)) esperance += 1 / retenues.length;
    }
    console.log(
      `${n}. « toujours la carte ${nom} » : espérance ${esperance.toFixed(2)} sur 12, ` +
        `applicable sur ${applicables} tirages`,
    );
    n += 1;
  }
}

// ---------------------------------------------------------------- exercice 2
// Bijection stricte de 6 paires.
const ex2 = [
  {
    phrase: "ห้องน้ำอยู่ที่ไหนครับ",
    desc: "une seule particule, celle d’un homme",
    groupe: "A",
  },
  {
    phrase: "แล้วคุณล่ะครับ",
    desc: "deux particules, la dernière étant celle d’un homme",
    groupe: "A",
  },
  {
    phrase: "สบายดีค่ะ",
    desc: "une seule particule, celle d’une femme",
    groupe: "B",
  },
  {
    phrase: "แล้วคุณล่ะคะ",
    desc: "deux particules, la dernière étant celle d’une femme",
    groupe: "B",
  },
  { phrase: "ตลาดอยู่ที่ไหน", desc: "aucune particule", groupe: "C" },
  {
    phrase: "แล้วคุณล่ะ",
    desc: "une seule particule, et ce n’est pas une politesse",
    groupe: "C",
  },
];

ligne("Exercice 2 (association), 6 paires, seuil 6 sur 6");
{
  const n = ex2.length;
  let fact = 1;
  for (let i = 2; i <= n; i += 1) fact *= i;
  console.log(
    `1. bijection : réponse constante impossible ; appariement au hasard = ` +
      `1 sur ${fact}, soit ${(100 / fact).toFixed(2)} %`,
  );

  // « tout retenu des unités 1 à 12, rien de 13A » : ครับ masculin, ค่ะ et คะ
  // féminines, mais ล่ะ inconnue comme particule. Les couples indiscernables
  // sont ceux qui ne se départagent que par ล่ะ.
  const groupes = new Map();
  for (const p of ex2) groupes.set(p.groupe, (groupes.get(p.groupe) ?? 0) + 1);
  const couples = [...groupes.values()].filter((v) => v === 2).length;
  console.log(
    `2. « unités 1 à 12 seules » : ${couples} couples indiscernables de 2, ` +
      `donc 1 chance sur ${2 ** couples} d'atteindre 6 sur 6, ` +
      `soit ${(100 / 2 ** couples).toFixed(1)} % ; espérance ${(couples * 1).toFixed(0)} paires sur 6`,
  );

  // Contrôle de conception : la longueur aide-t-elle ?
  const parPhrase = [...ex2].sort((a, b) => car(b.phrase) - car(a.phrase));
  const parDesc = [...ex2].sort((a, b) => car(b.desc) - car(a.desc));
  const rangs = parPhrase.filter((p, i) => p.desc === parDesc[i].desc).length;
  console.log(
    `3. appariement par RANG de longueur (phrase la plus longue avec la ` +
      `description la plus longue) : ${rangs} paires justes sur 6`,
  );
  console.log(
    `   phrase la plus longue : ${parPhrase[0].phrase} (${car(parPhrase[0].phrase)} car.), ` +
      `sa description fait ${car(parPhrase[0].desc)} car. et se classe ` +
      `${parDesc.findIndex((d) => d.desc === parPhrase[0].desc) + 1}e sur 6 en longueur`,
  );
  console.log(
    `   description la plus courte : « ${parDesc[5].desc} » (${car(parDesc[5].desc)} car.), ` +
      `elle va à ${parDesc[5].phrase} (${car(parDesc[5].phrase)} car.), ` +
      `qui se classe ${parPhrase.findIndex((p) => p.phrase === parDesc[5].phrase) + 1}e sur 6 en longueur`,
  );
}

// ---------------------------------------------------------------- exercice 3
// 6 tirages de word_order ; ordre d'apparition des blocs tiré au hasard.
const ex3 = [
  { blocs: ["สบายดี", "ไหม", "ครับ"], politesse: "ครับ" },
  { blocs: ["แล้ว", "คุณ", "ล่ะ", "คะ"], politesse: "คะ" },
  { blocs: ["มี", "ยา", "ไหม", "คะ"], politesse: "คะ" },
  { blocs: ["ปวดหัว", "ไหม", "ครับ"], politesse: "ครับ" },
  { blocs: ["ไป", "ค่ะ"], politesse: "ค่ะ" },
  { blocs: ["ห้องน้ำ", "อยู่", "ที่ไหน", "ครับ"], politesse: "ครับ" },
];

ligne("Exercice 3 (word_order), 6 tirages, seuil 5 sur 6");
{
  const factorielle = (n) => (n <= 1 ? 1 : n * factorielle(n - 1));

  const pConstante = ex3.map((t) => 1 / factorielle(t.blocs.length));
  const espConstante = pConstante.reduce((a, b) => a + b, 0);
  console.log(
    `1. politique constante (garder l'ordre d'apparition, tiré au hasard) : ` +
      pConstante.map((p) => `1/${Math.round(1 / p)}`).join(" + ") +
      ` = ${espConstante.toFixed(4)} sur 6, soit ${((espConstante / 6) * 100).toFixed(1)} %`,
  );

  // « la politesse en dernier », seule règle publiée avant 13A ; le reste au
  // hasard.
  const pRegle = ex3.map((t) => 1 / factorielle(t.blocs.length - 1));
  const espRegle = pRegle.reduce((a, b) => a + b, 0);
  console.log(
    `2. « la politesse en dernier » seule : ` +
      pRegle.map((p) => `1/${Math.round(1 / p)}`).join(" + ") +
      ` = ${espRegle.toFixed(4)} sur 6, soit ${((espRegle / 6) * 100).toFixed(1)} %`,
  );

  // Loi de Poisson binomiale exacte sur les six tirages, pour P(>= 5).
  let dist = [1];
  for (const p of pRegle) {
    const suiv = new Array(dist.length + 1).fill(0);
    for (let k = 0; k < dist.length; k += 1) {
      suiv[k] += dist[k] * (1 - p);
      suiv[k + 1] += dist[k] * p;
    }
    dist = suiv;
  }
  const atteinte = dist[5] + dist[6];
  console.log(
    `   loi exacte des succès : ` +
      dist.map((v, k) => `P(${k})=${(v * 100).toFixed(3)}%`).join(" "),
  );
  console.log(
    `   P(atteindre 5 sur 6) = ${(atteinte * 100).toFixed(3)} % ` +
      `(= 1/${(1 / atteinte).toFixed(0)})`,
  );
}

// ---------------------------------------------------------------- exercice 4
const ex4 = [
  "khráp",
  "khâ",
  "khá",
  "mǎi",
  "sà·baai·dii·mǎi khráp",
  "sà·baai·dii khâ",
  "pai khâ",
  "láeew khoun lâ khá",
];

ligne("Exercice 4 (recall), 8 tirages, seuil 6 sur 8");
console.log(
  `réponses attendues distinctes : ${new Set(ex4).size} sur ${ex4.length} ; ` +
    `une réponse constante vaut donc au mieux 1 sur 8`,
);

// ---------------------------------------------------------------- exercice 5
const ex5 = [
  { phrase: "สบายดีครับ", bonne: "A", fin: "ครับ", avant: "ดี" },
  { phrase: "ไปค่ะ", bonne: "A", fin: "ค่ะ", avant: "ไป" },
  { phrase: "แล้วคุณล่ะ", bonne: "A", fin: "ล่ะ", avant: "คุณ" },
  { phrase: "ตลาดอยู่ที่ไหน", bonne: "B", fin: "ไหน", avant: "ที่" },
  { phrase: "แล้วเจอกัน", bonne: "B", fin: "กัน", avant: "เจอ" },
  { phrase: "ไปหาหมอ", bonne: "B", fin: "หมอ", avant: "หา" },
  { phrase: "สบายดีไหมครับ", bonne: "C", fin: "ครับ", avant: "ไหม" },
  { phrase: "มียาไหมคะ", bonne: "C", fin: "คะ", avant: "ไหม" },
  { phrase: "แล้วคุณล่ะคะ", bonne: "C", fin: "คะ", avant: "ล่ะ" },
];

ligne("Exercice 5 (reading), 9 tirages, seuil 8 sur 9");
{
  const parOption = new Map();
  for (const t of ex5)
    parOption.set(t.bonne, (parOption.get(t.bonne) ?? 0) + 1);
  const constante = Math.max(...parOption.values());
  console.log(
    `répartition : ${[...parOption.entries()]
      .sort()
      .map(([o, n]) => `${o}=${n}`)
      .join(" ")}`,
  );
  console.log(
    `1. réponse constante : ${constante} sur 9, soit ${((constante / 9) * 100).toFixed(1)} %`,
  );
  console.log(
    `2. au hasard entre trois options : atteint 8 sur 9 dans ` +
      `${(queueBinomiale(9, 8, 1 / 3) * 100).toFixed(4)} % des sessions`,
  );

  // Meilleure stratégie avec les seules unités 1 à 12 : l'apprenant reconnaît
  // ครับ, ค่ะ et คะ comme politesses (1E, 2E) et ไหม comme marque de question
  // (2B) ; rien ne lui a jamais dit que ล่ะ en était une.
  const politesses = new Set(["ครับ", "ค่ะ", "คะ"]);
  const particulesConnues = new Set(["ครับ", "ค่ะ", "คะ", "ไหม"]);
  let succes = 0;
  const echecs = [];
  ex5.forEach((t, i) => {
    let reponse;
    if (!particulesConnues.has(t.fin)) reponse = "B";
    else if (particulesConnues.has(t.avant)) reponse = "C";
    else reponse = "A";
    if (reponse === t.bonne) succes += 1;
    else
      echecs.push(
        `tirage ${i + 1} (${t.phrase}) : répond ${reponse}, attendu ${t.bonne}`,
      );
  });
  console.log(
    `3. meilleure stratégie « unités 1 à 12 seules » : ${succes} sur 9 ; ` +
      `politesses reconnues ${[...politesses].join(", ")}`,
  );
  for (const e of echecs) console.log(`   échec ${e}`);
}
