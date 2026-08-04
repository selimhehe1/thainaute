// Consolidation 12E — bilans SRS, exercices, statuts.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";
const RETIREES = new Set(); // les cartes explicitement retirées sont détectées ci-dessous

function fichiers() {
  const out = [];
  for (const d of readdirSync(ROOT)) {
    if (!/^unite-\d\d$/.test(d)) continue;
    for (const f of readdirSync(join(ROOT, d))) {
      if (/^lecon-.*\.md$/.test(f)) out.push(join(ROOT, d, f));
    }
  }
  return out.sort();
}

const parUnite = {};
const meca = {};
let totalEx = 0;
let latin = 0;
let draft11 = 0;
let native11 = 0;
let n11 = 0;

for (const f of fichiers()) {
  const txt = readFileSync(f, "utf8");
  const u = Number(f.match(/unite-(\d\d)/)[1]);
  const self = f.match(/lecon-(\d+)([a-e])\.md/);
  const idSelf = `srs-u${String(u).padStart(2, "0")}-l${self[1]}${self[2]}-`;

  // cartes définies par une puce de la section ## SRS de sa propre leçon
  const lignes = txt.split(/\r?\n/);
  let dans = false;
  const cartes = new Set();
  for (const l of lignes) {
    if (/^##\s+SRS\b/.test(l)) {
      dans = true;
      continue;
    }
    if (/^##\s(?!#)/.test(l)) {
      dans = false;
      continue;
    }
    if (!dans) continue;
    const m = l.match(/^\s*[-*]\s*\**`(srs-u\d\d-l[^`]+)`/);
    if (m && m[1].startsWith(idSelf)) {
      // exclure les cartes déclarées SUPPRIMÉE / RETIRÉE sur la même puce
      if (/SUPPRIM|RETIR/.test(l)) {
        RETIREES.add(m[1]);
        continue;
      }
      cartes.add(m[1]);
    }
  }
  parUnite[u] = (parUnite[u] ?? 0) + cartes.size;

  // exercices par mécanique
  for (const m of txt.matchAll(/^-\s+M[ée]canique\s*:\s*`(\w+)`/gm)) {
    meca[m[1]] = (meca[m[1]] ?? 0) + 1;
    totalEx += 1;
  }

  if (/alphabet\s+latin\s+uniquement/i.test(txt.replace(/\s+/g, " ")))
    latin += 1;

  if (u <= 11) {
    n11 += 1;
    if (/Statut\s*:\s*`draft`/.test(txt)) draft11 += 1;
    if (/Revue native\s*:\s*en attente/i.test(txt)) native11 += 1;
  }
}

console.log("cartes SRS par unité :");
let tot = 0;
for (const u of Object.keys(parUnite).sort((a, b) => a - b)) {
  console.log(`  ${u} : ${parUnite[u]}`);
  tot += parUnite[u];
}
console.log(`  total : ${tot}`);
console.log(
  "cartes explicitement retirées, exclues :",
  [...RETIREES].join(", ") || "(aucune)",
);
console.log(
  "\nexercices par mécanique :",
  JSON.stringify(meca),
  "total",
  totalEx,
);
console.log(
  "\nfichiers écrivant « alphabet latin uniquement » :",
  latin,
  "/ 60",
);
console.log(
  `unités 1 à 11 : ${n11} fichiers | « Statut : draft » ${draft11} | « Revue native : en attente » ${native11}`,
);
