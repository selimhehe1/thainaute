// Mesures adversariales des chiffres cités par lecon-12e.md.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "C:/Users/Selim/Documents/Thainaute";
const AUTH = join(ROOT, "content", "authoring");

function fichiers(min, max) {
  const out = [];
  for (let u = min; u <= max; u++) {
    const d = join(AUTH, "unite-" + String(u).padStart(2, "0"));
    let names;
    try {
      names = readdirSync(d);
    } catch {
      continue;
    }
    for (const n of names.sort())
      if (/^lecon-.*\.md$/.test(n)) out.push(join(d, n));
  }
  return out;
}

const F = fichiers(1, 12);
const F11 = fichiers(1, 11);
console.log("fichiers 1-12 :", F.length, "| 1-11 :", F11.length);

// --- registres : champs `registre` dans ## Items
function sectionItems(t) {
  const lines = t.split(/\r?\n/);
  let dans = false;
  const out = [];
  for (const l of lines) {
    if (/^##\s/.test(l)) {
      dans = /^##\s+Items\s*$/.test(l);
      continue;
    }
    if (dans) out.push(l);
  }
  return out.join("\n");
}

const cases = { neutre: 0, poli: 0, familier: 0, formel: 0 };
let total = 0;
const autres = [];
for (const f of F) {
  const s = sectionItems(readFileSync(f, "utf8"));
  for (const m of s.matchAll(/^-\s*`?registre`?\s*:\s*(.+)$/gm)) {
    total++;
    const v = m[1].trim().toLowerCase();
    let mis = false;
    for (const k of Object.keys(cases)) {
      if (v.includes(k)) {
        cases[k]++;
        mis = true;
      }
    }
    if (!mis) autres.push(f.split(/[\\/]/).pop() + " :: " + v);
  }
}
console.log("\n== registres (unités 1-12) ==");
console.log("champs registre total :", total, JSON.stringify(cases));
console.log("hors des 4 cases :", autres.length);
autres.slice(0, 20).forEach((a) => console.log("   " + a));

// --- cartes SRS avec identifiant, définies par une puce de sa propre section SRS
function sectionSRS(t) {
  const lines = t.split(/\r?\n/);
  let dans = false;
  const out = [];
  for (const l of lines) {
    if (/^##\s/.test(l)) {
      dans = /^##\s+SRS\s*$/.test(l);
      continue;
    }
    if (dans) out.push(l);
  }
  return out.join("\n");
}
const parUnite = {};
const definis = new Set();
for (const f of F) {
  const u = Number(f.match(/unite-(\d\d)/)[1]);
  const s = sectionSRS(readFileSync(f, "utf8"));
  const ids = new Set();
  for (const m of s.matchAll(/^\s*[-*|]\s*.{0,10}?(srs-[a-z0-9-]+)/gim))
    ids.add(m[1]);
  parUnite[u] = (parUnite[u] || 0) + ids.size;
  ids.forEach((i) => definis.add(i));
}
console.log("\n== cartes SRS (heuristique puce) ==");
console.log(JSON.stringify(parUnite));
console.log(
  "total :",
  Object.values(parUnite).reduce((a, b) => a + b, 0),
);

// --- mécaniques d'exercices déclarées
const meca = {};
const unitesMeca = {};
for (const f of F) {
  const u = Number(f.match(/unite-(\d\d)/)[1]);
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/^-\s*Mécanique\s*:\s*`([a-z_]+)`/gm)) {
    meca[m[1]] = (meca[m[1]] || 0) + 1;
    (unitesMeca[m[1]] = unitesMeca[m[1]] || new Set()).add(u);
  }
}
console.log("\n== mécaniques (ligne '- Mécanique : `x`') ==");
for (const [k, v] of Object.entries(meca))
  console.log(
    k,
    v,
    "unités",
    [...unitesMeca[k]].sort((a, b) => a - b).join(","),
  );
console.log(
  "total :",
  Object.values(meca).reduce((a, b) => a + b, 0),
);

// --- titres d'exercices (### Exercice N : ... (`mecanique`))
const meca2 = {};
for (const f of F) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/^#{3,4}\s+Exercice[^\n]*\(`([a-z_]+)`\)/gm))
    meca2[m[1]] = (meca2[m[1]] || 0) + 1;
}
console.log("\n== mécaniques (titres d'exercice) ==", JSON.stringify(meca2));
console.log(
  "total :",
  Object.values(meca2).reduce((a, b) => a + b, 0),
);

// --- sections ## Dialogue
let nbDial = 0;
let nbTables = 0;
let maxRepl = { n: 0, f: "" };
let maxLenAll = { n: 0, f: "", s: "" };
let maxLen11 = { n: 0, f: "", s: "" };
for (const f of F) {
  const t = readFileSync(f, "utf8");
  const u = Number(f.match(/unite-(\d\d)/)[1]);
  const lines = t.split(/\r?\n/);
  let dans = false;
  const bloc = [];
  for (const l of lines) {
    if (/^##\s/.test(l)) {
      dans = /^##\s+Dialogue/.test(l);
      if (dans) nbDial++;
      continue;
    }
    if (dans) bloc.push(l);
  }
  const rows = bloc.filter((l) => /^\|/.test(l));
  const data = rows.filter((l) => !/^\|\s*-+/.test(l)).slice(1);
  if (rows.length > 0) nbTables++;
  if (data.length > maxRepl.n)
    maxRepl = { n: data.length, f: f.split(/[\\/]/).pop() };
  for (const r of data) {
    for (const cell of r.split("|")) {
      const c = cell.trim();
      if (!/[\u0E00-\u0E7F]/.test(c)) continue;
      const n = [...c].length;
      if (n > maxLenAll.n) maxLenAll = { n, f: f.split(/[\\/]/).pop(), s: c };
      if (u <= 11 && n > maxLen11.n)
        maxLen11 = { n, f: f.split(/[\\/]/).pop(), s: c };
    }
  }
}
console.log("\n== dialogues ==");
console.log("sections ## Dialogue :", nbDial, "| avec tableau :", nbTables);
console.log("plus de répliques :", JSON.stringify(maxRepl));
console.log("cellule thaïe la plus longue 1-12 :", JSON.stringify(maxLenAll));
console.log("cellule thaïe la plus longue 1-11 :", JSON.stringify(maxLen11));

// --- graphies : particule finale, longueur max
const gr = new Set();
for (const f of F) {
  const s = sectionItems(readFileSync(f, "utf8"));
  const blocs = s.split(/^#{3,4} /m);
  for (const b of blocs) {
    const thai = b.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    const ton = /^-\s*`?ton`?\s*:/m.test(b);
    if (thai && ton) gr.add(thai[1]);
  }
}
console.log("\n== graphies ==", gr.size);
const finales = [...gr].filter((g) => /(ครับ|ค่ะ|คะ|ค่า)$/.test(g));
console.log("se terminant par une particule finale :", finales.length);
const pures = [...gr].filter((g) => /^[\u0E00-\u0E7F\u0020]+$/.test(g));
const tri = pures.sort((a, b) => [...b].length - [...a].length);
console.log("plus longues (pures) :");
tri.slice(0, 6).forEach((g) => console.log("  ", [...g].length, g));
const l24 = pures.filter((g) => [...g].length === 24);
console.log("graphies de 24 points de code :", l24.length, l24.join(" | "));

// --- recall : réponses avec caractère thaï
let recall = 0;
for (const f of F) {
  const t = readFileSync(f, "utf8");
  recall += (t.match(/^-\s*Mécanique\s*:\s*`recall`/gm) || []).length;
}
console.log("\nrecall (ligne mécanique) :", recall);

// --- mentions de statut
let draft = 0,
  native = 0;
const sansDraft = [],
  sansNative = [];
for (const f of F11) {
  const t = readFileSync(f, "utf8");
  if (/Statut\s*:\s*`draft`/.test(t)) draft++;
  else sansDraft.push(f.split(/[\\/]/).pop());
  if (/Revue native\s*:\s*en attente/i.test(t)) native++;
  else sansNative.push(f.split(/[\\/]/).pop());
}
console.log("\n== statuts (1-11) ==");
console.log(
  "draft :",
  draft,
  "/",
  F11.length,
  "manquants:",
  sansDraft.join(","),
);
console.log(
  "revue native :",
  native,
  "/",
  F11.length,
  "manquants:",
  sansNative.join(","),
);

// --- citations des cartes de tons
for (const carte of ["srs-u04-l4a-06", "srs-u07-l7a-03"]) {
  const citants = [];
  for (const f of F) {
    const t = readFileSync(f, "utf8");
    if (t.includes(carte)) citants.push(f.split(/[\\/]/).pop());
  }
  console.log(
    `\n${carte} : ${citants.length} fichiers le mentionnent →`,
    citants.join(", "),
  );
}

// --- "alphabet latin uniquement" et clavier thaï
let latin = 0,
  clavier = [];
for (const f of F) {
  const t = readFileSync(f, "utf8");
  if (t.includes("alphabet latin uniquement")) latin++;
  if (/clavier thaï|clavier thai|saisie thaïe/i.test(t))
    clavier.push(f.split(/[\\/]/).pop());
}
console.log("\nalphabet latin uniquement :", latin, "/", F.length);
console.log("clavier/saisie thaïe :", clavier.length, clavier.join(","));
