// Planchers mesurés des exercices de `u13-l13e`, calculés sur le tirage EXACT
// du fichier, jamais estimés à la main.
//
// POURQUOI CE SCRIPT EXISTE. Un exercice doit mesurer ce qu'il annonce. Un
// seuil n'a de sens que si les stratégies qui n'écoutent ni ne lisent restent
// dessous. Les chiffres imprimés ici sont ceux que la leçon cite.
//
// Usage :
//   node scripts/verification/tmp-13e-planchers.mjs

const combinations = (n, k) => {
  let out = 1;
  for (let i = 0; i < k; i += 1) out = (out * (n - i)) / (i + 1);
  return Math.round(out);
};

// Probabilité d'obtenir au moins `need` succès sur `n` tirages indépendants de
// probabilité `p`, plus `certain` tirages gagnés d'avance.
const atLeast = (n, p, need, certain = 0) => {
  const remaining = need - certain;
  if (remaining <= 0) return 1;
  if (remaining > n) return 0;
  let total = 0;
  for (let k = remaining; k <= n; k += 1) {
    total += combinations(n, k) * p ** k * (1 - p) ** (n - k);
  }
  return total;
};

const pct = (x) => `${(x * 100).toFixed(1)} %`;

// ---------------------------------------------------------------------------
// EXERCICE 1 — listening, 12 tirages, 3 cartes, ordre des cartes aléatoire.
// ---------------------------------------------------------------------------
const ex1 = [
  { audio: "ไปครับ", cartes: ["ไปครับ", "ไปนะครับ", "ไปสิ"] },
  { audio: "ไปนะครับ", cartes: ["ไปนะครับ", "ไปครับ", "ไปนะคะ"] },
  { audio: "ไปนะคะ", cartes: ["ไปนะคะ", "ไปค่ะ", "ไปนะครับ"] },
  { audio: "ไปค่ะ", cartes: ["ไปค่ะ", "ไปนะคะ", "ไปครับ"] },
  { audio: "ไปสิ", cartes: ["ไปสิ", "ไปนะ", "ไปเหรอ"] },
  { audio: "ไปเหรอ", cartes: ["ไปเหรอ", "ไปสิ", "ไปนะ"] },
  { audio: "ไปนะ", cartes: ["ไปนะ", "ไปสิ", "ไปเหรอ"] },
  { audio: "ไปไหนวะ", cartes: ["ไปไหนวะ", "ไปไหน", "ไปนะ"] },
  { audio: "ไหม", cartes: ["ไหม", "ไม้", "ไม่"] },
  { audio: "ไม้", cartes: ["ไม้", "ไหม", "ไม่"] },
  { audio: "ป่า", cartes: ["ป่า", "ปา", "ปู"] },
  { audio: "สิ", cartes: ["สิ", "นะ", "เหรอ"] },
];

console.log("===== EXERCICE 1 (listening), 12 tirages, seuil 9 sur 12 =====");
const reponses1 = ex1.map((t) => t.audio);
console.log(
  `bonnes réponses distinctes : ${new Set(reponses1).size} sur ${ex1.length}`,
);

// Stratégie 1 : toujours la même CARTE.
const toutesCartes = [...new Set(ex1.flatMap((t) => t.cartes))];
let meilleureCarte = { carte: null, score: -1 };
for (const carte of toutesCartes) {
  const score = ex1.filter(
    (t) => t.cartes.includes(carte) && t.audio === carte,
  ).length;
  if (score > meilleureCarte.score) meilleureCarte = { carte, score };
}
console.log(
  `S1 carte constante : au mieux ${meilleureCarte.score} sur 12 (« ${meilleureCarte.carte} »)`,
);

// Stratégie 2 : toujours la même POSITION, ordre des cartes tiré au hasard.
console.log(
  `S2 position constante : espérance ${(ex1.length / 3).toFixed(2)} sur 12, soit ${pct(1 / 3)}`,
);
console.log(
  `   probabilité d'atteindre 9 sur 12 : ${pct(atLeast(12, 1 / 3, 9))}`,
);

// Stratégies de forme : longueur, particule finale, présence d'un signe.
const evalHeuristique = (nom, choisir) => {
  let strict = 0;
  let exaequo = 0;
  let inapplicable = 0;
  for (const t of ex1) {
    const gagnants = choisir(t.cartes);
    if (gagnants.length === 0) {
      inapplicable += 1;
    } else if (gagnants.length === 1) {
      if (gagnants[0] === t.audio) strict += 1;
    } else if (gagnants.includes(t.audio)) {
      exaequo += 1;
    }
  }
  console.log(
    `S3 ${nom} : ${strict} strictement décidés, ${exaequo} ex aequo favorables, ${inapplicable} inapplicables → plafond ${strict + exaequo} sur 12`,
  );
};

const plusLongues = (cartes) => {
  const max = Math.max(...cartes.map((c) => [...c].length));
  return cartes.filter((c) => [...c].length === max);
};
const plusCourtes = (cartes) => {
  const min = Math.min(...cartes.map((c) => [...c].length));
  return cartes.filter((c) => [...c].length === min);
};
evalHeuristique("toujours la carte la plus LONGUE", plusLongues);
evalHeuristique("toujours la carte la plus COURTE", plusCourtes);
evalHeuristique("toujours la carte qui finit par ครับ", (cartes) =>
  cartes.filter((c) => c.endsWith("ครับ")),
);
evalHeuristique("toujours la carte qui porte นะ", (cartes) =>
  cartes.filter((c) => c.includes("นะ")),
);
evalHeuristique("toujours la carte qui porte une particule polie", (cartes) =>
  cartes.filter((c) => /(?:ครับ|ค่ะ|คะ)$/.test(c)),
);

// ---------------------------------------------------------------------------
// EXERCICE 2 — association, bijection de 6 paires.
// ---------------------------------------------------------------------------
console.log("\n===== EXERCICE 2 (association), 6 paires, seuil 6 sur 6 =====");
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
console.log(`hasard intégral : 1 sur ${fact(6)}, soit ${pct(1 / fact(6))}`);

// Ce qu'un apprenant du SEUL fondamental peut verrouiller. La prémisse est
// relue dans les fichiers d'origine et non supposée. Le contre-audit interne du
// 2026-08-04, finding REEMPLOI-LA, a montré que la version précédente de ce
// bloc codait en dur « 1E + 6E = deux paires verrouillées », alors que
// `u06-l6e` ne publie PAS la glose de la paire 6 : son champ `fr` renvoie au
// bloc แล้วคุณล่ะ et sa carte 01 écrit qu'elle ne demande jamais d'expliquer les
// autres emplois du mot. La glose vient de `u13-l13c` item 3.
const paires = [
  {
    n: 1,
    particule: "ครับ / ค่ะ",
    verrouillee: true,
    motif: "`u01-l1e` publie les deux avec leur valeur de politesse",
  },
  {
    n: 2,
    particule: "นะ",
    verrouillee: false,
    motif: "publiée par `u13-l13b`, unité 13",
  },
  {
    n: 3,
    particule: "สิ",
    verrouillee: false,
    motif: "publiée par `u13-l13c`, unité 13",
  },
  {
    n: 4,
    particule: "เหรอ",
    verrouillee: false,
    motif: "publiée par aucune leçon, spécimen de 13E",
  },
  {
    n: 5,
    particule: "วะ",
    verrouillee: false,
    motif: "publiée par `u13-l13d`, unité 13",
  },
  {
    n: 6,
    particule: "ล่ะ",
    verrouillee: false,
    genereuse: true,
    motif:
      "graphie publiée par `u06-l6e`, mais sa glose autonome vient de `u13-l13c` item 3",
  },
];

for (const p of paires) {
  console.log(
    `  paire ${p.n} (${p.particule}) : ${p.verrouillee ? "VERROUILLÉE" : p.genereuse ? "ouverte, verrouillable seulement en hypothèse généreuse" : "ouverte"} — ${p.motif}`,
  );
}

const stricte = paires.filter((p) => p.verrouillee).length;
const genereuse = paires.filter((p) => p.verrouillee || p.genereuse).length;
const resteStricte = paires.length - stricte;
const resteGenereuse = paires.length - genereuse;
console.log(
  `H1 stricte, ${stricte} paire(s) verrouillée(s) : bijection de ${resteStricte}, 1 sur ${fact(resteStricte)}, soit ${pct(1 / fact(resteStricte))}`,
);
console.log(
  `H2 généreuse, ${genereuse} paires verrouillées : bijection de ${resteGenereuse}, 1 sur ${fact(resteGenereuse)}, soit ${pct(1 / fact(resteGenereuse))}`,
);

// ---------------------------------------------------------------------------
// EXERCICE 3 — word_order, 6 tirages, blocs affichés dans un ordre aléatoire.
// ---------------------------------------------------------------------------
console.log("\n===== EXERCICE 3 (word_order), 6 tirages, seuil 5 sur 6 =====");
const ex3 = [
  { blocs: ["ไป", "นะ", "ครับ"], reponse: ["ไป", "นะ", "ครับ"] },
  { blocs: ["ไป", "นะ", "คะ"], reponse: ["ไป", "นะ", "คะ"] },
  {
    blocs: ["ขอโทษ", "ครับ", "ไป", "นะ", "ครับ"],
    reponse: ["ขอโทษ", "ครับ", "ไป", "นะ", "ครับ"],
  },
  {
    blocs: ["ขอโทษ", "ค่ะ", "ไป", "นะ", "คะ"],
    reponse: ["ขอโทษ", "ค่ะ", "ไป", "นะ", "คะ"],
  },
  {
    blocs: ["ขอบคุณ", "ครับ", "ไป", "นะ", "ครับ"],
    reponse: ["ขอบคุณ", "ครับ", "ไป", "นะ", "ครับ"],
  },
  { blocs: ["ไม่", "ไป", "ค่ะ"], reponse: ["ไม่", "ไป", "ค่ะ"] },
];

const permutations = (items) => {
  if (items.length <= 1) return [items];
  const out = [];
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) out.push([items[i], ...p]);
  }
  return out;
};
const distinctes = (blocs) =>
  [...new Set(permutations(blocs).map((p) => p.join(" ")))].map((s) =>
    s.split(" "),
  );

const politesse = new Set(["ครับ", "ค่ะ", "คะ"]);
// Règles PUBLIÉES avant 13E, et elles seules :
//  (a) 1E : la particule polie ferme la phrase ;
//  (b) 4D : ไม่ se pose immédiatement devant le mot nié ;
//  (c) 8D : ขอโทษ ouvre, immédiatement suivi de sa particule.
// La place de นะ n'est publiée nulle part avant 13E : elle reste ouverte.
const conformeAuxReglesAnciennes = (ordre) => {
  const dernier = ordre[ordre.length - 1];
  if (ordre.some((b) => politesse.has(b)) && !politesse.has(dernier))
    return false;
  const iNon = ordre.indexOf("ไม่");
  if (iNon !== -1 && ordre[iNon + 1] !== "ไป") return false;
  const iPardon = ordre.indexOf("ขอโทษ");
  if (iPardon !== -1) {
    if (iPardon !== 0) return false;
    if (!politesse.has(ordre[1])) return false;
  }
  return true;
};

let esperanceConstante = 0;
let esperanceRegles = 0;
const probasRegles = [];
for (const [index, tirage] of ex3.entries()) {
  const tous = distinctes(tirage.blocs);
  const cible = tirage.reponse.join(" ");
  const conformes = tous.filter((o) => conformeAuxReglesAnciennes(o));
  const pConstante = 1 / tous.length;
  const pRegles = conformes.some((o) => o.join(" ") === cible)
    ? 1 / conformes.length
    : 0;
  esperanceConstante += pConstante;
  esperanceRegles += pRegles;
  probasRegles.push(pRegles);
  console.log(
    `  tirage ${index + 1} : ${tous.length} ordres distincts, ${conformes.length} conformes aux règles anciennes → p(constante) = 1/${tous.length}, p(règles) = ${pRegles === 0 ? "0" : `1/${conformes.length}`}`,
  );
}
console.log(
  `S1 ordre affiché conservé : espérance ${esperanceConstante.toFixed(3)} sur 6, soit ${pct(esperanceConstante / 6)}`,
);
console.log(
  `S2 règles publiées avant 13E : espérance ${esperanceRegles.toFixed(3)} sur 6, soit ${pct(esperanceRegles / 6)}`,
);

// Probabilité exacte que S2 atteigne 5 sur 6, par convolution.
let distribution = [1];
for (const p of probasRegles) {
  const suivante = new Array(distribution.length + 1).fill(0);
  for (const [k, valeur] of distribution.entries()) {
    suivante[k] += valeur * (1 - p);
    suivante[k + 1] += valeur * p;
  }
  distribution = suivante;
}
const pSeuil3 = distribution.slice(5).reduce((a, b) => a + b, 0);
console.log(`   probabilité que S2 atteigne 5 sur 6 : ${pct(pSeuil3)}`);

// ---------------------------------------------------------------------------
// EXERCICE 5 — reading, 10 tirages, 5 options identiques à chaque tirage.
// ---------------------------------------------------------------------------
console.log("\n===== EXERCICE 5 (reading), 10 tirages, seuil 8 sur 10 =====");
const ex5 = [
  { phrase: "ไปครับ", reponse: "A" },
  { phrase: "ไปค่ะ", reponse: "A" },
  { phrase: "ไปนะครับ", reponse: "B" },
  { phrase: "ไปนะคะ", reponse: "B" },
  { phrase: "ไปสิ", reponse: "C" },
  { phrase: "มาสิ", reponse: "C" },
  { phrase: "ไปเหรอ", reponse: "D" },
  { phrase: "ไปหรือ", reponse: "D" },
  { phrase: "ไปไหนวะ", reponse: "E" },
  { phrase: "อะไรวะ", reponse: "E" },
];
const parOption = new Map();
for (const t of ex5)
  parOption.set(t.reponse, (parOption.get(t.reponse) ?? 0) + 1);
console.log(
  `répartition : ${[...parOption.entries()].map(([o, n]) => `${o}=${n}`).join(", ")}`,
);
const meilleureConstante = Math.max(...parOption.values());
console.log(
  `S1 option constante : au mieux ${meilleureConstante} sur 10, soit ${pct(meilleureConstante / 10)}`,
);
console.log(
  `   probabilité d'atteindre 8 sur 10 au hasard uniforme (1 chance sur 5) : ${pct(atLeast(10, 1 / 5, 8))}`,
);

const heuristiques5 = [
  ["porte นะ → B", (p) => (p.includes("นะ") ? "B" : null)],
  ["porte วะ → E", (p) => (p.includes("วะ") ? "E" : null)],
  [
    "finit par une particule polie → A",
    (p) => (/(?:ครับ|ค่ะ|คะ)$/.test(p) ? "A" : null),
  ],
  ["porte สิ → C", (p) => (p.includes("สิ") ? "C" : null)],
  [
    "phrase longue (≥ 6 signes) → A ou B, sinon C",
    (p) => ([...p].length >= 6 ? "A" : "C"),
  ],
];
for (const [nom, regle] of heuristiques5) {
  let justes = 0;
  let applicables = 0;
  for (const t of ex5) {
    const choix = regle(t.phrase);
    if (choix === null) continue;
    applicables += 1;
    if (choix === t.reponse) justes += 1;
  }
  console.log(
    `S2 ${nom} : applicable sur ${applicables} tirages, ${justes} justes → plafond ${justes} sur 10`,
  );
}

// ---------------------------------------------------------------------------
// EXERCICE 4 — recall, saisie libre.
// ---------------------------------------------------------------------------
console.log("\n===== EXERCICE 4 (recall), 8 tirages, seuil 6 sur 8 =====");
const ex4 = [
  "pai khráp",
  "pai khâ",
  "pai ná khráp",
  "pai ná khá",
  "mâi pai khâ",
  "mâi pai khráp",
  "pai",
  "ná",
];
const compte = new Map();
for (const r of ex4) compte.set(r, (compte.get(r) ?? 0) + 1);
console.log(
  `réponses attendues distinctes : ${compte.size} sur ${ex4.length} ; une réponse constante vaut au mieux ${Math.max(...compte.values())} sur 8`,
);
