// Recalcul independant des planchers annonces par u12-l12a.
const T = [
  {
    audio: "ผมปวดหัวครับ",
    cards: ["ผมปวดหัวครับ", "ผมไม่สบายครับ", "ผมหาเสื้อครับ"],
  },
  {
    audio: "ผมไม่สบายครับ",
    cards: ["ผมไม่สบายครับ", "ผมปวดหัวครับ", "ผมทำงานที่บ้านทุกวันครับ"],
  },
  {
    audio: "อันนี้เท่าไรครับ",
    cards: ["อันนี้เท่าไรครับ", "ตัวนี้เท่าไรครับ", "อันนี้ไม่ใช่ครับ"],
  },
  {
    audio: "ตัวนี้เท่าไรครับ",
    cards: ["ตัวนี้เท่าไรครับ", "อันนี้เท่าไรครับ", "ตัวนี้ใหญ่เกินไปครับ"],
  },
  {
    audio: "อันนี้แพงเกินไปครับ",
    cards: ["อันนี้แพงเกินไปครับ", "ตัวนี้ใหญ่เกินไปครับ", "อันนี้ไม่ใช่ครับ"],
  },
  {
    audio: "ห้องน้ำอยู่ที่ไหนครับ",
    cards: [
      "ห้องน้ำอยู่ที่ไหนครับ",
      "ร้านขายยาอยู่ที่ไหนครับ",
      "ตลาดอยู่ที่ไหน",
    ],
  },
  {
    audio: "ร้านขายยาอยู่ที่ไหนครับ",
    cards: [
      "ร้านขายยาอยู่ที่ไหนครับ",
      "ห้องน้ำอยู่ที่ไหนครับ",
      "ตลาดอยู่ที่ไหน",
    ],
  },
  {
    audio: "ขอข้าวผัดสองจานหน่อยครับ",
    cards: ["ขอข้าวผัดสองจานหน่อยครับ", "ขอเปลี่ยนหน่อยครับ", "ขอน้ำหน่อย"],
  },
  {
    audio: "ขอเปลี่ยนหน่อยครับ",
    cards: ["ขอเปลี่ยนหน่อยครับ", "ขอข้าวผัดสองจานหน่อยครับ", "ขอน้ำหน่อย"],
  },
  {
    audio: "พูดอีกทีได้ไหมครับ",
    cards: ["พูดอีกทีได้ไหมครับ", "พูดช้า ๆ ได้ไหมครับ", "ไม่เข้าใจครับ"],
  },
  { audio: "เลี้ยวซ้าย", cards: ["เลี้ยวซ้าย", "เลี้ยวขวา", "ตรงไป"] },
  { audio: "ช่วยด้วย", cards: ["ช่วยด้วย", "ช่วยเรียกหมอครับ", "ไม่เป็นไร"] },
];

function poissonBinomAtLeast(ps, k) {
  let dist = [1];
  for (const p of ps) {
    const nd = new Array(dist.length + 1).fill(0);
    for (let i = 0; i < dist.length; i++) {
      nd[i] += dist[i] * (1 - p);
      nd[i + 1] += dist[i] * p;
    }
    dist = nd;
  }
  let s = 0;
  for (let i = k; i < dist.length; i++) s += dist[i];
  return s;
}
const pct = (x) => (x * 100).toFixed(4) + " %";

function strat(nom, filtre) {
  const ps = [];
  let decides = 0;
  const detail = [];
  T.forEach((t, i) => {
    const sel = t.cards.filter(filtre(t));
    let p;
    if (sel.length === 0) p = 1 / t.cards.length;
    else {
      if (sel.length === 1) decides++;
      p = sel.includes(t.audio) ? 1 / sel.length : 0;
    }
    ps.push(p);
    detail.push(`t${i + 1}:sel=${sel.length},p=${p.toFixed(3)}`);
  });
  const esp = ps.reduce((a, b) => a + b, 0);
  console.log(
    `${nom.padEnd(34)} decides(unique)=${decides}  esperance=${esp.toFixed(3)}/12  P(>=9)=${pct(poissonBinomAtLeast(ps, 9))}`,
  );
  console.log("   ", detail.join(" "));
}

console.log("== EXERCICE 1 (listening), seuil 9/12");
strat("position constante", () => () => false); // toutes indecises -> 1/3
strat("finit par ครับ", () => (c) => c.endsWith("ครับ"));
strat("la plus longue", (t) => {
  const max = Math.max(...t.cards.map((c) => [...c].length));
  return (c) => [...c].length === max;
});
strat("la plus courte", (t) => {
  const min = Math.min(...t.cards.map((c) => [...c].length));
  return (c) => [...c].length === min;
});
strat("porte ไม่", () => (c) => c.includes("ไม่"));
strat("porte นี้", () => (c) => c.includes("นี้"));

// combien de tirages ont >= 2 cartes finissant par ครับ
const n2 = T.filter(
  (t) => t.cards.filter((c) => c.endsWith("ครับ")).length >= 2,
).length;
const n1 = T.filter(
  (t) => t.cards.filter((c) => c.endsWith("ครับ")).length === 1,
).length;
const n0 = T.filter(
  (t) => t.cards.filter((c) => c.endsWith("ครับ")).length === 0,
).length;
console.log(
  `\ntirages avec >=2 cartes en ครับ : ${n2} ; avec exactement 1 : ${n1} ; avec 0 : ${n0}`,
);

console.log("\n== EXERCICE 3 (word_order), seuil 5/6");
const blocs = [5, 4, 3, 4, 5, 4];
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const psConst = blocs.map((b) => 1 / fact(b));
console.log(
  "politique constante : esperance",
  psConst.reduce((a, b) => a + b, 0).toFixed(4),
  " P(>=5) =",
  pct(poissonBinomAtLeast(psConst, 5)),
);
const psRegles = [1 / 24, 1 / 6, 1, 1 / 6, 1 / 6, 1 / 6];
console.log(
  "regles publiees : esperance",
  psRegles.reduce((a, b) => a + b, 0).toFixed(4),
  " P(>=5) =",
  pct(poissonBinomAtLeast(psRegles, 5)),
);

console.log("\n== EXERCICE 5 (reading), seuil 7/8, 4 options, 2 par option");
const psConst5 = new Array(8).fill(0); // reponse constante : exactement 2 justes, deterministe
console.log("reponse constante : score deterministe 2/8, P(>=7) = 0 %");
const psHeur = [1, 1, ...new Array(6).fill(0.25)];
console.log(
  "heuristique decidant 2 tirages, 6 au hasard 1/4 : esperance",
  psHeur.reduce((a, b) => a + b, 0).toFixed(2),
  " P(>=7) =",
  pct(poissonBinomAtLeast(psHeur, 7)),
);
const psAlea = new Array(8).fill(0.25);
console.log(
  "tirage entierement au hasard 1/4 : P(>=7) =",
  pct(poissonBinomAtLeast(psAlea, 7)),
);

console.log("\n== EXERCICE 2 (association), bijection");
console.log("9! =", fact(9), " 1/9! =", pct(1 / fact(9)));
console.log("8! =", fact(8), " 1/8! =", pct(1 / fact(8)));
