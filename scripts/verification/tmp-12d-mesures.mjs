// Mesures de consolidation de `lecon-12d.md` : séquences Unicode des répliques
// remaniées, planchers des exercices 1, 2, 3 et 5. 2026-08-04.

const cp = (s) =>
  [...s].map(
    (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
  );

const repliques = [
  ["1", "สวัสดีค่ะ คุณต้น วันนี้สบายดีไหมคะ"],
  ["2", "ไม่สบายครับ ปวดหัวมากครับ"],
  ["3 et 5", "กี่วันแล้วคะ ไปหาหมอไหมคะ"],
  ["4", "ขอโทษครับ ไม่เข้าใจครับ พูดช้า ๆ ได้ไหมครับ"],
  ["6", "สองวันแล้วครับ ไม่ไปหาหมอครับ ร้านขายยาอยู่ที่ไหนครับ"],
  ["7", "ร้านขายยาอยู่ที่ตลาดค่ะ ตรงไปค่ะ ไม่ไกลค่ะ"],
  ["8", "เข้าใจแล้วครับ ผมไปตลาดทุกวันครับ แล้วคุณล่ะครับ"],
  ["9", "ดิฉันไปตลาดตอนเช้าค่ะ ดิฉันทำงานที่บ้านทุกวันค่ะ"],
  ["10", "ผมมีพี่ชายและน้องสาวครับ พี่ชายไปตลาดทุกวันครับ"],
  ["11 NOUVELLE", "ข้าวผัดหมูอร่อยแต่แพงเกินไปค่ะ"],
  ["12 NOUVELLE", "แพงเกินไปผมก็ไม่เอาครับ ขอบคุณครับ แล้วเจอกันครับ"],
];

console.log("# Séquences NFC");
for (const [n, s] of repliques) {
  const stable =
    s === s.normalize("NFC") && s === s.normalize("NFD").normalize("NFC");
  console.log(`\nRéplique ${n} : ${s}`);
  console.log(`  points de code : ${[...s].length}, NFC-stable : ${stable}`);
  console.log(`  ${cp(s).join(" ")}`);
}

console.log("\n\n# Exercice 1 : longueurs des options, en caractères");
const tirages = [
  [
    "1",
    "Bonjour Ton. Vous allez bien aujourd’hui ?",
    [
      "Bonjour Ton. Vous n’allez pas bien aujourd’hui ?",
      "Bonjour Ton. Vous allez au marché aujourd’hui ?",
    ],
  ],
  [
    "2",
    "Je ne vais pas bien. J’ai très mal à la tête.",
    [
      "Je vais bien. J’ai un peu mal à la tête.",
      "Je ne vais pas bien. J’ai mal au ventre.",
    ],
  ],
  [
    "3",
    "Depuis combien de jours ? Vous voulez aller voir un médecin ?",
    [
      "Depuis combien de jours ? Vous voulez aller à la pharmacie ?",
      "Combien de personnes ? Vous voulez aller voir un médecin, vous aussi ?",
    ],
  ],
  [
    "4",
    "Pardon. Je ne comprends pas. Vous pouvez parler lentement ?",
    [
      "Pardon. Je ne comprends pas. Vous pouvez répéter ?",
      "Pardon. Je comprends un peu. Vous pouvez parler plus lentement ?",
    ],
  ],
  [
    "5",
    "Ça fait deux jours. Je ne vais pas voir le médecin. Où est la pharmacie ?",
    [
      "Ça fait deux jours. Je vais voir le médecin. Où est la pharmacie ?",
      "Ça fait trois jours. Je ne vais pas voir le médecin. Où est le marché ?",
    ],
  ],
  [
    "6",
    "La pharmacie est au marché. Tout droit. Ce n’est pas loin.",
    [
      "La pharmacie est au marché. Tout droit. C’est loin.",
      "La pharmacie est au marché. Tournez à droite. Ce n’est pas loin.",
    ],
  ],
  [
    "7",
    "J’ai compris. Je vais au marché tous les jours. Et vous ?",
    [
      "Je ne comprends pas. Je vais au marché tous les jours. Et vous ?",
      "J’ai compris. Je vais au marché tous les jours. Et votre frère ?",
    ],
  ],
  [
    "8",
    "Je vais au marché le matin. Je travaille à la maison tous les jours.",
    [
      "Je vais au marché tous les jours. Je travaille à la maison le matin.",
      "Je vais au marché le soir. Je travaille à la maison tous les jours.",
    ],
  ],
  [
    "9",
    "J’ai un grand frère et une petite sœur. Mon grand frère va au marché tous les jours.",
    [
      "J’ai un grand frère et une petite sœur. Ma petite sœur va au marché tous les jours.",
      "J’ai deux grands frères. Mon grand frère va au marché tous les jours.",
    ],
  ],
  [
    "10",
    "Le riz sauté au porc est bon, mais il est trop cher.",
    [
      "Le riz sauté au poulet est bon, mais il est trop cher.",
      "Le riz sauté au porc est bon, mais il est très épicé.",
    ],
  ],
];

const NEG =
  /\bn[e’']\s|\bn[e’']\S*\s(?:\S+\s)?pas\b|n’est pas|ne suis pas|n’allez pas|ne vais pas|ne comprends pas/;
let plusLongue = [],
  plusLongueEgal = [],
  plusCourte = [],
  plusCourteEgal = [];
let negApplicable = [],
  negGagnante = [],
  negAmbigue = [];
const toutesDistinctes = new Set();
for (const [n, ok, ds] of tirages) {
  const opts = [ok, ...ds];
  opts.forEach((o) => toutesDistinctes.add(o));
  const L = opts.map((o) => o.length);
  const max = Math.max(...L),
    min = Math.min(...L);
  const nbMax = L.filter((x) => x === max).length,
    nbMin = L.filter((x) => x === min).length;
  if (L[0] === max) (nbMax === 1 ? plusLongue : plusLongueEgal).push(n);
  if (L[0] === min) (nbMin === 1 ? plusCourte : plusCourteEgal).push(n);
  const neg = opts.map((o) => NEG.test(o));
  const nbNeg = neg.filter(Boolean).length;
  if (nbNeg > 0) {
    negApplicable.push(n);
    if (neg[0]) (nbNeg === 1 ? negGagnante : negAmbigue).push(n);
  }
  console.log(
    `T${n}\tlongueurs ${L.join("/")}\tnég ${neg.map((b) => (b ? "1" : "0")).join("")}`,
  );
}
console.log(`options toutes distinctes : ${toutesDistinctes.size} sur 30`);
console.log(
  `« la plus longue » stricte : ${plusLongue.join(", ")} ; à égalité : ${plusLongueEgal.join(", ") || "aucune"}`,
);
console.log(
  `« la plus courte » stricte : ${plusCourte.join(", ")} ; à égalité : ${plusCourteEgal.join(", ") || "aucune"}`,
);
console.log(`négation présente aux tirages : ${negApplicable.join(", ")}`);
console.log(
  `bonne réponse portant une négation, seule à en porter : ${negGagnante.join(", ") || "aucun"}`,
);
console.log(
  `bonne réponse portant une négation, mais un distracteur aussi : ${negAmbigue.join(", ")}`,
);

console.log("\n# Exercice 3 : arrangements distincts par tirage");
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const arrangements = [
  ["1", 5, [2]],
  ["2", 8, [3]],
  ["3", 8, [3]],
  ["4", 8, [3]],
  ["5", 6, []],
  ["6 NOUVEAU", 9, [3]],
];
let esp = 0;
for (const [n, blocs, doubles] of arrangements) {
  const d = doubles.reduce((a, k) => a * fact(k), 1);
  const total = fact(blocs) / d;
  esp += 1 / total;
  console.log(
    `T${n}\t${blocs} blocs\t${fact(blocs)}/${d} = ${total} arrangements distincts\t1/${total}`,
  );
}
console.log(
  `espérance stratégie constante : ${esp.toFixed(6)} tirage sur 6, soit ${((esp / 6) * 100).toFixed(2)} %`,
);
const esp2 = 1 / 120;
console.log(
  `espérance « particules à la fin » (réussit au seul tirage 5, 1/${fact(5)}) : ${esp2.toFixed(6)}, soit ${((esp2 / 6) * 100).toFixed(2)} %`,
);

console.log("\n# Probabilités binomiales");
const C = (n, k) => fact(n) / (fact(k) * fact(n - k));
const binomAtLeast = (n, k0, p) => {
  let s = 0;
  for (let k = k0; k <= n; k += 1) s += C(n, k) * p ** k * (1 - p) ** (n - k);
  return s;
};
console.log(
  `P(X>=8 ; 10, 1/3) = ${(binomAtLeast(10, 8, 1 / 3) * 100).toFixed(3)} %`,
);
console.log(
  `P(X>=7 ; 8, 1/4)  = ${(binomAtLeast(8, 7, 1 / 4) * 100).toFixed(4)} %`,
);
console.log(`1/8! = 1/${fact(8)} = ${((1 / fact(8)) * 100).toFixed(4)} %`);
