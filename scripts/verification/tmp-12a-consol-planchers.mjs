// Recalcul indépendant des planchers de l'exercice 1 de u12-l12a.
// Convolution exacte (Poisson-binomiale), pas de binomiale sur la moyenne.
// Écrit pour la consolidation du 2026-08-04, indépendamment du script d'audit.

const tirages = [
  {
    bonne: "ผมปวดหัวครับ",
    cartes: ["ผมปวดหัวครับ", "ผมไม่สบายครับ", "ผมหาเสื้อครับ"],
  },
  {
    bonne: "ผมไม่สบายครับ",
    cartes: ["ผมไม่สบายครับ", "ผมปวดหัวครับ", "ผมทำงานที่บ้านทุกวันครับ"],
  },
  {
    bonne: "อันนี้เท่าไรครับ",
    cartes: ["อันนี้เท่าไรครับ", "ตัวนี้เท่าไรครับ", "อันนี้ไม่ใช่ครับ"],
  },
  {
    bonne: "ตัวนี้เท่าไรครับ",
    cartes: ["ตัวนี้เท่าไรครับ", "อันนี้เท่าไรครับ", "ตัวนี้ใหญ่เกินไปครับ"],
  },
  {
    bonne: "อันนี้แพงเกินไปครับ",
    cartes: ["อันนี้แพงเกินไปครับ", "ตัวนี้ใหญ่เกินไปครับ", "อันนี้ไม่ใช่ครับ"],
  },
  {
    bonne: "ห้องน้ำอยู่ที่ไหนครับ",
    cartes: [
      "ห้องน้ำอยู่ที่ไหนครับ",
      "ร้านขายยาอยู่ที่ไหนครับ",
      "ตลาดอยู่ที่ไหน",
    ],
  },
  {
    bonne: "ร้านขายยาอยู่ที่ไหนครับ",
    cartes: [
      "ร้านขายยาอยู่ที่ไหนครับ",
      "ห้องน้ำอยู่ที่ไหนครับ",
      "ตลาดอยู่ที่ไหน",
    ],
  },
  {
    bonne: "ขอข้าวผัดสองจานหน่อยครับ",
    cartes: ["ขอข้าวผัดสองจานหน่อยครับ", "ขอเปลี่ยนหน่อยครับ", "ขอน้ำหน่อย"],
  },
  {
    bonne: "ขอเปลี่ยนหน่อยครับ",
    cartes: ["ขอเปลี่ยนหน่อยครับ", "ขอข้าวผัดสองจานหน่อยครับ", "ขอน้ำหน่อย"],
  },
  {
    bonne: "พูดอีกทีได้ไหมครับ",
    cartes: ["พูดอีกทีได้ไหมครับ", "พูดช้า ๆ ได้ไหมครับ", "ไม่เข้าใจครับ"],
  },
  { bonne: "เลี้ยวซ้าย", cartes: ["เลี้ยวซ้าย", "เลี้ยวขวา", "ตรงไป"] },
  { bonne: "ช่วยด้วย", cartes: ["ช่วยด้วย", "ช่วยเรียกหมอครับ", "ไม่เป็นไร"] },
];

// p(bonne réponse) d'une stratégie qui retient un sous-ensemble de cartes,
// puis tire au hasard dans ce sous-ensemble ; sous-ensemble vide => hasard sur les 3.
function proba(t, filtre) {
  const retenues = t.cartes.filter(filtre);
  const pool = retenues.length === 0 ? t.cartes : retenues;
  return pool.includes(t.bonne) ? 1 / pool.length : 0;
}

const plusLongue = (t) => {
  const max = Math.max(...t.cartes.map((c) => [...c].length));
  return proba(t, (c) => [...c].length === max);
};
const plusCourte = (t) => {
  const min = Math.min(...t.cartes.map((c) => [...c].length));
  return proba(t, (c) => [...c].length === min);
};

const strategies = {
  "position constante": () => 1 / 3,
  "finit par ครับ": (t) => proba(t, (c) => c.endsWith("ครับ")),
  "la plus longue": plusLongue,
  "la plus courte": plusCourte,
  "porte ไม่": (t) => proba(t, (c) => c.includes("ไม่")),
  "porte นี้": (t) => proba(t, (c) => c.includes("นี้")),
};

// Poisson-binomiale exacte
function loi(ps) {
  let d = [1];
  for (const p of ps) {
    const n = new Array(d.length + 1).fill(0);
    for (let k = 0; k < d.length; k += 1) {
      n[k] += d[k] * (1 - p);
      n[k + 1] += d[k] * p;
    }
    d = n;
  }
  return d;
}

for (const [nom, f] of Object.entries(strategies)) {
  const ps = tirages.map((t) => f(t));
  const esp = ps.reduce((a, b) => a + b, 0);
  const d = loi(ps);
  const seuil = d.slice(9).reduce((a, b) => a + b, 0);
  const max = ps.filter((p) => p > 0).length;
  const decides = ps.filter((p) => p === 0 || p === 1).length;
  console.log(
    `${nom.padEnd(22)} espérance ${esp.toFixed(4)}  P(>=9) ${(seuil * 100).toFixed(6)} %  score max ${max}  tirages décidés ${decides}`,
  );
  console.log(`   p par tirage : ${ps.map((p) => p.toFixed(3)).join(" ")}`);
}

// combien de tirages portent au moins deux cartes finissant par ครับ
const deuxKhrap = tirages.filter(
  (t) => t.cartes.filter((c) => c.endsWith("ครับ")).length >= 2,
).length;
const unKhrap = tirages
  .map((t, i) => [i + 1, t.cartes.filter((c) => c.endsWith("ครับ")).length])
  .filter(([, n]) => n < 2);
console.log(`\ntirages avec au moins deux cartes en ครับ : ${deuxKhrap} / 12`);
console.log(`tirages avec moins de deux : ${JSON.stringify(unKhrap)}`);

// Exercice 3
const ex3 = [1 / 120, 1 / 24, 1 / 6, 1 / 24, 1 / 120, 1 / 24];
const ex3r = [1 / 24, 1 / 6, 1, 1 / 6, 1 / 6, 1 / 6];
for (const [nom, ps] of [
  ["ex3 politique constante", ex3],
  ["ex3 règles publiées", ex3r],
]) {
  const d = loi(ps);
  console.log(
    `${nom.padEnd(24)} espérance ${ps.reduce((a, b) => a + b, 0).toFixed(4)}  P(>=5) ${(d.slice(5).reduce((a, b) => a + b, 0) * 100).toFixed(6)} %`,
  );
}

// Exercice 5
const ex5c = [1, 1, 0, 0, 0, 0, 0, 0].map(() => 0); // réponse constante : 2 sur 8, déterministe
const ex5cDet = [1, 1, 0, 0, 0, 0, 0, 0];
const ex5h = [1, 1, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25];
for (const [nom, ps] of [
  ["ex5 réponse constante", ex5cDet],
  ["ex5 heuristique de forme", ex5h],
]) {
  const d = loi(ps);
  console.log(
    `${nom.padEnd(24)} espérance ${ps.reduce((a, b) => a + b, 0).toFixed(4)}  P(>=7) ${(d.slice(7).reduce((a, b) => a + b, 0) * 100).toFixed(6)} %`,
  );
}
void ex5c;

// Exercice 2, bijection
console.log(`\nex2 bijection 9 : ${((1 / 362880) * 100).toFixed(6)} %`);
console.log(`ex2 bijection 8 : ${((1 / 40320) * 100).toFixed(6)} %`);
