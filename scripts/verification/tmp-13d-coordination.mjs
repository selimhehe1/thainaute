// Coordination de l'unité 13 : qui revendique quelle graphie, et lesquelles
// avaient déjà été publiées par les unités 1 à 12.
//
// POURQUOI CE SCRIPT EXISTE. Trois unités de suite ont été rédigées en
// parallèle, et trois leçons de suite (`u10-l10a`, `u11-l11a`, `u12-l12e`) ont
// écrit « le dossier de l'unité ne contient aucun autre fichier » alors que
// c'était déjà faux à la lecture. `repo-thai-scan.mjs` compte les graphies mais
// ne dit pas QUI les revendique : ce script fait le dépouillement par fichier,
// avec la convention de découpe de `repo-thai-scan.mjs`, à l'identique.
//
// Usage : node scripts/verification/tmp-13d-coordination.mjs [unite]

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const cible = Number(process.argv[2] ?? 13);

// Découpe identique à `repo-thai-scan.mjs`.
function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let inItems = false;
  let block = [];
  const flush = () => {
    if (block.length === 0) return;
    const joined = block.join("\n");
    const thai = joined.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    const ton = /^-\s*`?ton`?\s*:/m.test(joined);
    if (thai && ton) entries.push(thai[1]);
    block = [];
  };
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      flush();
      inItems = /^##\s+Items\s*$/.test(line);
      continue;
    }
    if (!inItems) continue;
    if (/^#{3,}\s/.test(line)) {
      flush();
      continue;
    }
    block.push(line);
  }
  flush();
  return entries;
}

function graphiesDe(unite) {
  const dir = join(AUTHORING, `unite-${String(unite).padStart(2, "0")}`);
  const carte = new Map();
  let noms;
  try {
    noms = readdirSync(dir);
  } catch {
    return carte;
  }
  for (const nom of noms.sort()) {
    if (!/^lecon-.*\.md$/.test(nom)) continue;
    for (const g of entriesOf(readFileSync(join(dir, nom), "utf8"))) {
      if (!carte.has(g)) carte.set(g, []);
      carte.get(g).push(nom);
    }
  }
  return carte;
}

const unite = graphiesDe(cible);
const anterieures = new Set();
for (let u = 1; u < cible; u += 1) {
  for (const g of graphiesDe(u).keys()) anterieures.add(g);
}

const parFichier = new Map();
const collisions = [];
const redeclarations = [];
for (const [g, fichiers] of unite) {
  for (const f of fichiers) parFichier.set(f, (parFichier.get(f) ?? 0) + 1);
  if (fichiers.length > 1) collisions.push(`${g}\t${fichiers.join(", ")}`);
  if (anterieures.has(g)) redeclarations.push(`${g}\t${fichiers.join(", ")}`);
}

console.log(`# unité ${cible}`);
console.log(`fichiers               : ${parFichier.size}`);
console.log(`graphies distinctes    : ${unite.size}`);
for (const [f, n] of [...parFichier.entries()].sort()) {
  console.log(`  ${f} : ${n} entrée(s)`);
}
console.log(`\n# collisions d'attribution : ${collisions.length}`);
for (const c of collisions) console.log(`  ${c}`);
const occurrences = redeclarations.reduce(
  (total, ligne) => total + ligne.split("\t")[1].split(", ").length,
  0,
);
console.log(
  `\n# redéclarations venant des unités 1 à ${cible - 1} : ${occurrences} occurrence(s) sur ${redeclarations.length} graphie(s)`,
);
for (const r of redeclarations) console.log(`  ${r}`);
