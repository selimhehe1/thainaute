// Planchers des cinq exercices de `u13-l13b`, calculés sur les tirages EXACTS
// du fichier, et non estimés.
//
// POURQUOI. La consigne de rédaction de 13B exige qu'un exercice mesure ce
// qu'il annonce : une réponse constante ne doit pas atteindre le seuil, et le
// plancher doit être ÉCRIT. Les leçons antérieures ont montré que ces chiffres
// sont faux dès qu'ils sont posés de tête (contre-audit de `u11-l11a`, trois
// planchers recomptés).
//
// Usage : node scripts/verification/tmp-13b-planchers.mjs

const ligne = (titre) => console.log(`\n===== ${titre} =====`);

// ---------------------------------------------------------------- exercice 1
// 12 tirages, trois cartes chacun, ordre des cartes tiré au hasard.
const ex1 = [
  { bonne: "ไปนะ", cartes: ["ไปนะ", "ไป", "นะ"] },
  { bonne: "ไป", cartes: ["ไป", "ไปนะ", "นะ"] },
  { bonne: "อะไรนะ", cartes: ["อะไรนะ", "อะไร", "นะ"] },
  { bonne: "อะไร", cartes: ["อะไร", "อะไรนะ", "นะ"] },
  { bonne: "นะครับ", cartes: ["นะครับ", "ครับ", "นะคะ"] },
  { bonne: "ครับ", cartes: ["ครับ", "นะครับ", "คะ"] },
  { bonne: "นะคะ", cartes: ["นะคะ", "คะ", "นะครับ"] },
  { bonne: "คะ", cartes: ["คะ", "นะคะ", "ค่ะ"] },
  { bonne: "ค่ะ", cartes: ["ค่ะ", "คะ", "นะคะ"] },
  { bonne: "ไหม", cartes: ["ไหม", "ไม้", "ไม่"] },
  { bonne: "ปา", cartes: ["ปา", "ป่า", "ปู"] },
  { bonne: "ไปนะคะ", cartes: ["ไปนะคะ", "ไปนะครับ", "ไปค่ะ"] },
];

ligne("Exercice 1 (listening), 12 tirages, seuil 9");
console.log(
  `bonnes réponses distinctes : ${new Set(ex1.map((t) => t.bonne)).size} sur ${ex1.length}`,
);
{
  // Réponse constante par CARTE : le score maximal d'une graphie donnée.
  const compte = new Map();
  for (const t of ex1) {
    for (const carte of new Set(t.cartes)) {
      if (carte === t.bonne) compte.set(carte, (compte.get(carte) ?? 0) + 1);
    }
  }
  const meilleure = [...compte.entries()].sort((a, b) => b[1] - a[1])[0];
  console.log(
    `réponse constante par carte : ${meilleure[1]} sur 12 (« ${meilleure[0]} »)`,
  );
  console.log(`position constante : espérance ${(12 / 3).toFixed(0)} sur 12`);

  // « toujours la carte la plus longue » / « la plus courte »
  for (const [nom, cmp] of [
    ["la plus longue", (a, b) => b.length - a.length],
    ["la plus courte", (a, b) => a.length - b.length],
  ]) {
    let stricts = 0;
    let exaequo = 0;
    for (const t of ex1) {
      const tri = [...t.cartes].sort(cmp);
      const ex = tri.filter((c) => c.length === tri[0].length);
      if (ex.length > 1) {
        exaequo += 1;
        continue;
      }
      if (tri[0] === t.bonne) stricts += 1;
    }
    console.log(
      `« toujours ${nom} » : ${stricts} strictement décidés, ${exaequo} ex aequo, plafond ${stricts + exaequo} sur 12`,
    );
  }

  // « toujours la carte qui porte นะ »
  for (const motif of ["นะ", "ครับ", "คะ"]) {
    let applicables = 0;
    let succes = 0;
    for (const t of ex1) {
      const candidats = t.cartes.filter((c) => c.includes(motif));
      if (candidats.length === 0) continue;
      applicables += 1;
      if (candidats.length === 1 && candidats[0] === t.bonne) succes += 1;
    }
    console.log(
      `« toujours la carte qui porte ${motif} » : applicable sur ${applicables} tirages, ${succes} sur 12 strictement décidés`,
    );
  }
}

// ---------------------------------------------------------------- exercice 2
ligne("Exercice 2 (association), 6 paires, seuil 6 sur 6");
{
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  console.log(
    `hasard total : 1 sur ${fact(6)} = ${(100 / fact(6)).toFixed(2)} %`,
  );
  const inconnues = 3; // นะ, อะไรนะ, ไปนะ
  console.log(
    `apprenant qui ne connaît QUE l'antérieur : verrouille ${6 - inconnues} paires, ` +
      `puis 1 sur ${fact(inconnues)} = ${(100 / fact(inconnues)).toFixed(1)} %`,
  );
  // VARIANTE ÉCARTÉE, mesurée pour pouvoir la citer. Elle remplaçait deux des
  // trois paires antérieures par นะครับ et นะคะ, dont les cibles nommaient le
  // genre du locuteur. La connaissance de ครับ et de คะ, publiée en 1E et 2E,
  // verrouille alors ces deux paires EN PLUS des paires antérieures.
  const varianteInconnues = 2; // นะ et อะไรนะ, une fois le genre exploité
  console.log(
    `VARIANTE ÉCARTÉE (cibles nommant le genre) : verrouille ${6 - varianteInconnues} paires, ` +
      `puis 1 sur ${fact(varianteInconnues)} = ${(100 / fact(varianteInconnues)).toFixed(1)} %`,
  );
  console.log(
    "score 5 sur 6 impossible dans une bijection : 5 paires correctes en imposent une sixième",
  );
}

// ---------------------------------------------------------------- exercice 3
ligne("Exercice 3 (word_order), 6 tirages, seuil 5");
{
  // arrangements distincts d'un multiensemble
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const arrangements = (blocs) => {
    const compte = new Map();
    for (const b of blocs) compte.set(b, (compte.get(b) ?? 0) + 1);
    let d = 1;
    for (const c of compte.values()) d *= fact(c);
    return fact(blocs.length) / d;
  };
  const tirages = [
    ["ไป", "นะ", "ครับ"],
    ["ไป", "นะ", "คะ"],
    ["อะไร", "นะ", "ครับ"],
    ["อะไร", "นะ", "คะ"],
    ["ขอโทษ", "ครับ", "อะไร", "นะ", "ครับ"],
    ["ไม่เข้าใจ", "ครับ", "อะไร", "นะ", "ครับ"],
  ];
  let esperance = 0;
  for (const t of tirages) {
    const a = arrangements(t);
    esperance += 1 / a;
    console.log(`  ${t.join(" ")} : ${a} arrangements distincts, 1 sur ${a}`);
  }
  console.log(
    `politique CONSTANTE (garder l'ordre affiché, lui-même tiré au hasard) : ` +
      `espérance ${esperance.toFixed(3)} sur 6, soit ${((esperance / 6) * 100).toFixed(1)} %`,
  );

  // Apprenant qui n'applique que la règle PUBLIÉE : particule en dernier (1E).
  // Il place ครับ / คะ en fin, et lui reste à ordonner les blocs restants.
  let esp2 = 0;
  const detail = [];
  for (const t of tirages) {
    const particules = t.filter((b) => b === "ครับ" || b === "คะ");
    const reste = t.filter((b) => b !== "ครับ" && b !== "คะ");
    // tirages 5 et 6 : deux ครับ, dont un en position interne ; la règle
    // « particule en dernier » ne dit pas où va le premier. On lui accorde
    // le placement du bloc d'ouverture publié, et il lui reste à ordonner
    // le reste.
    const aOrdonner = reste.length + (particules.length > 1 ? 1 : 0);
    const p = 1 / factArr(aOrdonner);
    esp2 += p;
    detail.push(
      `  ${t.join(" ")} : ${aOrdonner} blocs libres, 1 sur ${factArr(aOrdonner)}`,
    );
  }
  function factArr(n) {
    return n <= 1 ? 1 : n * factArr(n - 1);
  }
  for (const d of detail) console.log(d);
  console.log(
    `règles PUBLIÉES seules (particule en dernier, 1E) : espérance ${esp2.toFixed(3)} sur 6, ` +
      `soit ${((esp2 / 6) * 100).toFixed(1)} %`,
  );
}

// ---------------------------------------------------------------- exercice 4
ligne("Exercice 4 (recall), 8 tirages, seuil 6");
{
  const reponses = [
    "à·rai ná",
    "à·rai ná khráp",
    "à·rai ná khá",
    "pai ná",
    "pai ná khráp",
    "pai ná khá",
    "à·rai",
    "pai",
  ];
  const compte = new Map();
  for (const r of reponses) compte.set(r, (compte.get(r) ?? 0) + 1);
  const max = Math.max(...compte.values());
  console.log(`réponses distinctes : ${compte.size} sur ${reponses.length}`);
  console.log(`réponse constante : au mieux ${max} sur 8`);
  console.log(
    "tirages gagnables par l'antérieur seul : 2 sur 8 (à·rai de u02-l2d, pai de u05-l5b)",
  );
}

// ---------------------------------------------------------------- exercice 5
ligne("Exercice 5 (reading), 8 tirages, seuil 7");
{
  const tirages = [
    { forme: "อะไรนะครับ", bonne: "A" },
    { forme: "อะไรคะ", bonne: "B" },
    { forme: "ไปนะคะ", bonne: "C" },
    { forme: "ไปครับ", bonne: "D" },
    { forme: "อะไรนะคะ", bonne: "A" },
    { forme: "อะไร", bonne: "B" },
    { forme: "ไปนะครับ", bonne: "C" },
    { forme: "ไปค่ะ", bonne: "D" },
  ];
  const parOption = new Map();
  for (const t of tirages)
    parOption.set(t.bonne, (parOption.get(t.bonne) ?? 0) + 1);
  console.log(
    `répartition : ${[...parOption.entries()].map(([o, n]) => `${o}=${n}`).join(" ")}`,
  );
  console.log(
    `réponse constante : ${Math.max(...parOption.values())} sur 8, soit ${((Math.max(...parOption.values()) / 8) * 100).toFixed(0)} %`,
  );

  const heuristiques = {
    "porte นะ donc A": (f) => (f.includes("นะ") ? "A" : null),
    "commence par อะไร donc A": (f) => (f.startsWith("อะไร") ? "A" : null),
    "commence par ไป donc C": (f) => (f.startsWith("ไป") ? "C" : null),
    "la plus longue donc A": null,
  };
  for (const [nom, fn] of Object.entries(heuristiques)) {
    if (fn === null) continue;
    let applicables = 0;
    let succes = 0;
    for (const t of tirages) {
      const r = fn(t.forme);
      if (r === null) continue;
      applicables += 1;
      if (r === t.bonne) succes += 1;
    }
    console.log(
      `« ${nom} » : applicable sur ${applicables} tirages, ${succes} sur 8 corrects`,
    );
  }

  // Heuristique « je vois นะ ou non, puis je tire à pile ou face »
  const p = 0.5;
  const binom = (n, k) => {
    let r = 1;
    for (let i = 0; i < k; i += 1) r = (r * (n - i)) / (i + 1);
    return r;
  };
  let atLeast7 = 0;
  for (let k = 7; k <= 8; k += 1) atLeast7 += binom(8, k) * p ** 8;
  console.log(
    `« je sépare avec นะ / sans นะ puis je devine » : espérance 4 sur 8 ; ` +
      `atteint 7 sur 8 dans ${(atLeast7 * 100).toFixed(2)} % des sessions`,
  );

  // longueur : la longueur sépare-t-elle A/C de B/D ?
  const longs = tirages.filter((t) => [...t.forme].length >= 5);
  console.log(
    `formes de 5 caractères ou plus : ${longs.map((t) => t.forme + "=" + t.bonne).join(" ")}`,
  );
}
