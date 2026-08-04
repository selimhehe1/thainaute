// Planchers mesurés des cinq exercices de `u13-l13c`, calculés sur les tirages
// EXACTS du fichier. Aucun chiffre de plancher n'est écrit à la main.
//
// Convention : un « plancher » est le score qu'obtient une stratégie qui ne
// sait rien de la leçon. On donne l'ESPÉRANCE et, quand la stratégie est
// aléatoire, la PROBABILITÉ D'ATTEINDRE LE SEUIL, qui est la seule quantité
// qui décide si l'exercice mesure ce qu'il annonce.

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n, k) => fact(n) / (fact(k) * fact(n - k));
const atLeast = (n, k, p) => {
  let s = 0;
  for (let i = k; i <= n; i += 1)
    s += binom(n, i) * p ** i * (1 - p) ** (n - i);
  return s;
};
const pct = (x) => `${(x * 100).toFixed(2)} %`;

console.log("=== EXERCICE 1 : listening, 12 tirages, seuil 9 ===");
const ex1 = [
  { audio: "ลองดูสิ", cartes: ["ลองดูสิ", "ลองดู", "ลองดูซิ"] },
  { audio: "ลองดูซิ", cartes: ["ลองดูซิ", "ลองดูสิ", "ลองดู"] },
  { audio: "ไม่รู้สิ", cartes: ["ไม่รู้สิ", "ไม่เข้าใจ", "เข้าใจล่ะ"] },
  { audio: "เอาสิ", cartes: ["เอาสิ", "เอา", "เอาอันนี้"] },
  { audio: "เข้าใจล่ะ", cartes: ["เข้าใจล่ะ", "เข้าใจ", "ไม่เข้าใจ"] },
  {
    audio: "แล้วคุณล่ะครับ",
    cartes: ["แล้วคุณล่ะครับ", "แล้วคุณล่ะคะ", "แล้วเจอกัน"],
  },
  {
    audio: "แล้วคุณล่ะคะ",
    cartes: ["แล้วคุณล่ะคะ", "แล้วคุณล่ะครับ", "แล้วเจอกัน"],
  },
  { audio: "ไหม", cartes: ["ไหม", "ไม้", "ไม่"] },
  { audio: "ไม้", cartes: ["ไม้", "ไหม", "ไม่"] },
  { audio: "ปา", cartes: ["ปา", "ป่า", "ปู"] },
  { audio: "สิ", cartes: ["สิ", "ซิ", "ซี"] },
  { audio: "ซิ", cartes: ["ซิ", "สิ", "ซี"] },
];
const bonnes = ex1.map((t) => t.cartes[0]);
console.log(
  `bonnes réponses distinctes : ${new Set(bonnes).size} sur ${ex1.length}`,
);
const parCarte = new Map();
for (const b of bonnes) parCarte.set(b, (parCarte.get(b) ?? 0) + 1);
console.log(
  `carte constante, meilleur cas : ${Math.max(...parCarte.values())} sur 12`,
);
console.log(
  `position constante (ordre retiré au hasard) : espérance 4 sur 12 ; P(atteindre 9) = ${pct(atLeast(12, 9, 1 / 3))}`,
);

const strat = (nom, choisir) => {
  let stricts = 0;
  let exaequo = 0;
  for (const t of ex1) {
    const c = choisir(t.cartes);
    if (c === null) continue;
    if (Array.isArray(c)) {
      if (c.includes(t.cartes[0])) exaequo += 1;
      continue;
    }
    if (c === t.cartes[0]) stricts += 1;
  }
  console.log(
    `${nom} : ${stricts} strictement décidés, ${exaequo} tirages non tranchés dont la bonne réponse est parmi les ex aequo ; plafond tout accordé ${stricts + exaequo} sur 12`,
  );
};
const extremes = (cartes, plusGrand) => {
  const tailles = cartes.map((c) => [...c].length);
  const cible = plusGrand ? Math.max(...tailles) : Math.min(...tailles);
  const tie = cartes.filter((c) => [...c].length === cible);
  return tie.length > 1 ? tie : tie[0];
};
strat("« toujours la carte la plus longue »", (c) => extremes(c, true));
strat("« toujours la carte la plus courte »", (c) => extremes(c, false));
strat("« toujours la carte qui porte สิ »", (c) => {
  const h = c.filter((x) => x.includes("สิ"));
  return h.length === 0 ? null : h.length > 1 ? h : h[0];
});
strat("« toujours la carte qui porte ล่ะ »", (c) => {
  const h = c.filter((x) => x.includes("ล่ะ"));
  return h.length === 0 ? null : h.length > 1 ? h : h[0];
});
strat("« toujours la carte qui finit par une particule de politesse »", (c) => {
  const h = c.filter(
    (x) => x.endsWith("ครับ") || x.endsWith("ค่ะ") || x.endsWith("คะ"),
  );
  return h.length === 0 ? null : h.length > 1 ? h : h[0];
});

console.log("\n=== EXERCICE 2 : association, bijection de 6, seuil 6 ===");
console.log(
  `appariement entièrement au hasard : 1 sur ${fact(6)} = ${pct(1 / fact(6))}`,
);
console.log(
  `apprenant qui verrouille les 3 paires publiées avant 13C : bijection de 3, 1 sur ${fact(3)} = ${pct(1 / fact(3))}`,
);
console.log(
  "réponse constante : structurellement impossible, chaque cible ne sert qu'une fois",
);

console.log("\n=== EXERCICE 3 : word_order, 8 tirages, seuil 7 ===");
const ex3 = [
  { blocs: ["ลองดู", "สิ", "ครับ"], cible: "ลองดูสิครับ", det: false },
  { blocs: ["ไม่", "รู้", "สิ"], cible: "ไม่รู้สิ", det: false },
  { blocs: ["เข้าใจ", "ล่ะ", "ครับ"], cible: "เข้าใจล่ะครับ", det: false },
  { blocs: ["แล้ว", "คุณ", "ล่ะ", "ครับ"], cible: "แล้วคุณล่ะครับ", det: true },
  { blocs: ["ไป", "สิ", "ครับ"], cible: "ไปสิครับ", det: false },
  { blocs: ["ไม่", "เข้าใจ", "ครับ"], cible: "ไม่เข้าใจครับ", det: true },
  { blocs: ["เอา", "สิ", "ค่ะ"], cible: "เอาสิค่ะ", det: false },
  { blocs: ["ดู", "สิ", "ค่ะ"], cible: "ดูสิค่ะ", det: false },
];
let esp = 0;
for (const t of ex3) esp += 1 / fact(t.blocs.length);
console.log(
  `politique constante « garder l'ordre affiché », ordre retiré au hasard : espérance ${esp.toFixed(3)} sur 8, soit ${pct(esp / 8)}`,
);
console.log(
  `  détail : ${ex3.map((t) => `${t.blocs.length} blocs → 1 sur ${fact(t.blocs.length)}`).join(", ")}`,
);
const dets = ex3.filter((t) => t.det).length;
const coins = ex3.length - dets;
console.log(
  "apprenant « règles antérieures seules » : politesse en dernier (1E), ไม่ devant le mot nié (4D), แล้วคุณล่ะ bloc figé (6E)",
);
console.log(
  `  ${dets} tirages gagnés d'avance, ${coins} tirages réduits à un choix entre 2 ordres`,
);
console.log(
  `  espérance ${(dets + coins / 2).toFixed(2)} sur 8 ; P(atteindre 7 sur 8) = P(au moins ${7 - dets} succès sur ${coins} à pile ou face) = ${pct(atLeast(coins, 7 - dets, 0.5))}`,
);

console.log("\n=== EXERCICE 4 : recall, 8 tirages, saisie libre, seuil 6 ===");
const ex4 = [
  "sì",
  "sí",
  "lâ",
  "lawwng douu sì",
  "ao sì",
  "mâi róuu sì",
  "khâo·jai lâ",
  "láeew khoun lâ",
];
console.log(
  `réponses attendues distinctes : ${new Set(ex4).size} sur ${ex4.length}`,
);
console.log(
  `réponse constante, meilleur cas : ${Math.max(...ex4.map((r) => ex4.filter((x) => x === r).length))} sur 8`,
);

console.log("\n=== EXERCICE 5 : reading, 8 tirages, 4 options, seuil 7 ===");
const ex5 = [
  { thai: "ลองดูสิ", rep: "A" },
  { thai: "ไปสิ", rep: "A" },
  { thai: "ไม่รู้สิ", rep: "B" },
  { thai: "เข้าใจล่ะ", rep: "B" },
  { thai: "แล้วคุณล่ะครับ", rep: "C" },
  { thai: "แล้วคุณล่ะคะ", rep: "C" },
  { thai: "ไม่เข้าใจครับ", rep: "D" },
  { thai: "ผมไปตลาดครับ", rep: "D" },
];
for (const o of ["A", "B", "C", "D"]) {
  console.log(
    `  option ${o} : ${ex5.filter((t) => t.rep === o).length} tirages`,
  );
}
const cst = Math.max(
  ...["A", "B", "C", "D"].map((o) => ex5.filter((t) => t.rep === o).length),
);
console.log(
  `réponse constante : ${cst} sur 8, soit ${pct(cst / 8)} ; borne déterministe, P(atteindre 7) = 0`,
);
const regle = (t) =>
  t.thai.includes("สิ") ? "A" : t.thai.includes("ล่ะ") ? "C" : "D";
const scoreRegle = ex5.filter((t) => regle(t) === t.rep).length;
console.log(
  `heuristique « je vois สิ donc A, je vois ล่ะ donc C, aucune particule donc D » : ${scoreRegle} sur 8, DÉTERMINISTE, donc P(atteindre 7) = 0`,
);
console.log(
  `  détail : ${ex5.map((t) => `${t.thai} → ${regle(t)} ${regle(t) === t.rep ? "juste" : `FAUX, attendu ${t.rep}`}`).join(" | ")}`,
);
const parLongueur = [...ex5].sort(
  (a, b) => [...a.thai].length - [...b.thai].length,
);
console.log(
  `heuristique « les deux plus courtes sont D » : les deux plus courtes sont ${parLongueur
    .slice(0, 2)
    .map(
      (t) => `${t.thai} (${[...t.thai].length} caractères, réponse ${t.rep})`,
    )
    .join(" et ")}`,
);
const nSi = ex5.filter((t) => t.thai.includes("สิ")).length;
const nLa = ex5.filter((t) => t.thai.includes("ล่ะ")).length;
const nNi = 8 - nSi - nLa;
const bonsSi = ex5.filter(
  (t) => t.thai.includes("สิ") && (t.rep === "A" || t.rep === "B"),
).length;
const bonsLa = ex5.filter(
  (t) => t.thai.includes("ล่ะ") && (t.rep === "B" || t.rep === "C"),
).length;
console.log(
  `heuristique « je vois la particule mais j'ignore ce qu'elle fait » : ${nSi} tirages en สิ tirés au hasard entre A et B, ${nLa} tirages en ล่ะ tirés entre B et C, ${nNi} tirages sans particule donnés à D`,
);
console.log(
  `  espérance ${(nNi + bonsSi / 2 + bonsLa / 2).toFixed(2)} sur 8 ; P(atteindre 7) = P(au moins ${7 - nNi} succès sur ${bonsSi + bonsLa} à pile ou face) = ${pct(atLeast(bonsSi + bonsLa, 7 - nNi, 0.5))}`,
);
