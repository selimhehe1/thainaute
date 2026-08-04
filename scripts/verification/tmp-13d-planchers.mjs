// Planchers mesurés des exercices de `u13-l13d`.
//
// POURQUOI CE SCRIPT EXISTE. Un exercice doit mesurer ce qu'il annonce. Le
// contrôle minimal est qu'aucune POLITIQUE CONSTANTE, c'est-à-dire une réponse
// donnée sans écouter ni lire, n'atteigne le seuil de réussite. Les chiffres
// cités par la leçon sont produits ici, sur les tirages exacts du fichier.
//
// Convention : une stratégie est comptée « strictement décidée » quand elle
// désigne UNE carte ; quand elle en désigne plusieurs, le compte optimiste lui
// accorde la bonne réponse à chaque fois qu'elle figure parmi les cartes
// désignées, ce qui donne un MAJORANT du plancher.
//
// Usage : node scripts/verification/tmp-13d-planchers.mjs

const ex1 = [
  { audio: "ผม", cartes: ["ผม", "กู", "ฉัน"] },
  { audio: "กู", cartes: ["กู", "ผม", "คุณ"] },
  { audio: "คุณ", cartes: ["คุณ", "มึง", "เธอ"] },
  { audio: "มึง", cartes: ["มึง", "คุณ", "เธอ"] },
  { audio: "เขา", cartes: ["เขา", "มัน", "แก"] },
  { audio: "แก", cartes: ["แก", "เธอ", "เขา"] },
  { audio: "เธอ", cartes: ["เธอ", "แก", "คุณ"] },
  { audio: "มัน", cartes: ["มัน", "เขา", "คน"] },
  { audio: "ครับ", cartes: ["ครับ", "เออ", "ค่ะ"] },
  { audio: "เออ", cartes: ["เออ", "ครับ", "ค่ะ"] },
  { audio: "คะ", cartes: ["คะ", "วะ", "ค่ะ"] },
  { audio: "วะ", cartes: ["วะ", "ค่ะ", "คะ"] },
];

// Les huit formes publiées par 13D, et les formes déjà publiées par les
// unités 1 à 12. Le balayage `repo-thai-scan.mjs 1 12 --grep` du 2026-08-04
// établit qu'aucune des huit n'apparaît dans les unités 1 à 12.
const duJour = new Set(["กู", "มึง", "แก", "มัน", "วะ", "ไอ้", "อี", "เออ"]);

const seuil1 = 10;

// 1. Carte constante : on essaie chaque graphie possible et on garde la meilleure.
const toutesCartes = new Set(ex1.flatMap((t) => t.cartes));
let meilleureConstante = { carte: null, score: 0 };
for (const carte of toutesCartes) {
  const score = ex1.filter((t) => t.audio === carte).length;
  if (score > meilleureConstante.score) meilleureConstante = { carte, score };
}

// 2. Position constante : l'ordre des trois cartes est retiré au hasard.
const esperancePosition = ex1.length / 3;

// 3. Toujours une forme du jour / 4. toujours une forme déjà publiée.
const compter = (predicat) => {
  let strict = 0;
  let ambigu = 0;
  let esperance = 0;
  for (const t of ex1) {
    const designees = t.cartes.filter(predicat);
    if (designees.length === 0) continue; // stratégie inapplicable : 0 point
    if (designees.length === 1) {
      if (designees[0] === t.audio) strict += 1;
    } else {
      ambigu += 1;
      if (designees.includes(t.audio)) esperance += 1 / designees.length;
    }
  }
  return { strict, ambigu, esperance: strict + esperance };
};

const formeDuJour = compter((c) => duJour.has(c));
const dejaPubliee = compter((c) => !duJour.has(c));

// 5 et 6. Toujours la carte la plus longue / la plus courte, en points de code.
const extreme = (sens) => {
  let strict = 0;
  let exaequo = 0;
  let optimiste = 0;
  let esperance = 0;
  for (const t of ex1) {
    const tailles = t.cartes.map((c) => [...c].length);
    const cible = sens === "long" ? Math.max(...tailles) : Math.min(...tailles);
    const designees = t.cartes.filter((c) => [...c].length === cible);
    if (designees.length === 1) {
      if (designees[0] === t.audio) {
        strict += 1;
        optimiste += 1;
        esperance += 1;
      }
    } else {
      exaequo += 1;
      if (designees.includes(t.audio)) {
        optimiste += 1;
        esperance += 1 / designees.length;
      }
    }
  }
  return { strict, exaequo, optimiste, esperance };
};

console.log("=== Exercice 1 (listening), 12 tirages ===");
console.log(
  `carte constante           : au mieux ${meilleureConstante.score} sur 12 (« ${meilleureConstante.carte} ») ; ` +
    `${new Set(ex1.map((t) => t.audio)).size} bonnes réponses distinctes sur 12 tirages`,
);
console.log(
  `position constante        : ${esperancePosition.toFixed(2)} sur 12 en espérance, soit ${((esperancePosition / 12) * 100).toFixed(1)} %`,
);
console.log(
  `toujours une forme du jour: ${formeDuJour.strict} strictement décidés, ${formeDuJour.ambigu} tirage(s) à deux cartes désignées, ` +
    `espérance ${formeDuJour.esperance.toFixed(2)} sur 12`,
);
console.log(
  `toujours une forme publiée: ${dejaPubliee.strict} strictement décidés, ${dejaPubliee.ambigu} tirage(s) à deux cartes désignées, ` +
    `espérance ${dejaPubliee.esperance.toFixed(2)} sur 12`,
);
for (const sens of ["long", "court"]) {
  const r = extreme(sens);
  console.log(
    `toujours la plus ${sens.padEnd(5)}    : ${r.strict} strictement décidés, ${r.exaequo} ex aequo, ` +
      `espérance ${r.esperance.toFixed(2)} sur 12 en tranchant les ex aequo au hasard, ` +
      `${r.optimiste} sur 12 en lui accordant TOUS les ex aequo`,
  );
}
console.log(`seuil                     : ${seuil1} sur 12`);

// ---------------------------------------------------------------------------
// Exercice 2 (association), bijection de 8 paires, seuil 8 sur 8.
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
console.log(
  "\n=== Exercice 2 (association), bijection de 8, seuil 8 sur 8 ===",
);
console.log(
  `réponse constante         : impossible dans une bijection (chaque cible ne sert qu'une fois)`,
);
console.log(
  `appariement au hasard     : 1 sur ${fact(8)} = ${((1 / fact(8)) * 100).toFixed(4)} %`,
);
console.log(
  `sept paires justes        : imposent la huitième, aucun seuil intermédiaire n'existe`,
);

// ---------------------------------------------------------------------------
// Exercice 3 (reading), 4 options.
//
// CONTRE-AUDIT DU 2026-08-04, finding `NOTATION-PLACE-EOE`. Le tirage
// « เออ … » a été RETIRÉ : le dictionnaire normatif ne dit rien de la position
// de เออ, et la notation de place était donc composée par le cours. Les trois
// autres notations (« ไอ้ … », « อี … », « … วะ ») sont écrites dans le corps
// des entrées et restent. L'exercice passe donc de 12 à 11 tirages, et la
// répartition de 4/4/2/2 à 4/4/2/1.
const ex3 = [
  { forme: "กู", reponse: "A" },
  { forme: "มึง", reponse: "A" },
  { forme: "แก", reponse: "A" },
  { forme: "มัน", reponse: "A" },
  { forme: "ไอ้", reponse: "B" },
  { forme: "ไอ้ …", reponse: "B" },
  { forme: "อี", reponse: "B" },
  { forme: "อี …", reponse: "B" },
  { forme: "วะ", reponse: "C" },
  { forme: "… วะ", reponse: "C" },
  { forme: "เออ", reponse: "D" },
];
const seuil3 = 10;
const parOption = new Map();
for (const t of ex3)
  parOption.set(t.reponse, (parOption.get(t.reponse) ?? 0) + 1);

const binomAuMoins = (n, k, p) => {
  const C = (n, r) => fact(n) / (fact(r) * fact(n - r));
  let s = 0;
  for (let i = k; i <= n; i += 1) s += C(n, i) * p ** i * (1 - p) ** (n - i);
  return s;
};

console.log("\n=== Exercice 3 (reading), 4 options ===");
for (const [option, compte] of [...parOption.entries()].sort()) {
  console.log(
    `réponse constante « ${option} »   : ${compte} sur ${ex3.length}, soit ${((compte / ex3.length) * 100).toFixed(1)} %`,
  );
}
const n3 = ex3.length;
console.log(
  `hasard uniforme sur 4     : espérance ${(n3 / 4).toFixed(2)} sur ${n3} ; ` +
    `P(atteindre ${seuil3} sur ${n3}) = ${(binomAuMoins(n3, seuil3, 0.25) * 100).toFixed(4)} %`,
);
console.log(
  `pile ou face sur deux options : P(atteindre ${seuil3} sur ${n3}) = ${(binomAuMoins(n3, seuil3, 0.5) * 100).toFixed(2)} %`,
);
// Stratégie d'un apprenant à MOITIÉ instruit : il a retenu quels blocs sont des
// pronoms, et tire au hasard entre les trois autres options sur les tirages
// restants. C'est la stratégie la plus forte du lot, et elle est citée telle
// quelle par le fichier de leçon.
const nonPronoms = ex3.filter((t) => t.reponse !== "A").length;
const acquis = ex3.length - nonPronoms;
console.log(
  `moitié instruit (les ${acquis} pronoms sûrs, 1/3 sur les ${nonPronoms} autres) : ` +
    `espérance ${(acquis + nonPronoms / 3).toFixed(2)} sur ${n3} ; ` +
    `P(atteindre ${seuil3} sur ${n3}) = ${(binomAuMoins(nonPronoms, seuil3 - acquis, 1 / 3) * 100).toFixed(2)} %`,
);
console.log(`seuil                     : ${seuil3} sur ${n3}`);

// ---------------------------------------------------------------------------
// Exercice 4 (recall), 8 tirages, saisie libre, seuil 6 sur 8.
const ex4 = [
  "phǒm",
  "dì·chǎn",
  "khoun",
  "khoun",
  "khǎo",
  "khráp",
  "khá",
  "khoun",
];
const compteRep = new Map();
for (const r of ex4) compteRep.set(r, (compteRep.get(r) ?? 0) + 1);
const meilleure = [...compteRep.entries()].sort((a, b) => b[1] - a[1])[0];
console.log(
  "\n=== Exercice 4 (recall), 8 tirages, saisie libre, seuil 6 sur 8 ===",
);
console.log(
  `réponse constante         : au mieux ${meilleure[1]} sur 8 (« ${meilleure[0]} »), soit ${((meilleure[1] / 8) * 100).toFixed(1)} %`,
);
console.log(
  `réponses distinctes       : ${compteRep.size} pour 8 tirages (${[...compteRep.entries()].map(([r, n]) => `${r}×${n}`).join(", ")})`,
);
