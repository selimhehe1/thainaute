// Croisement des graphies de l'unité 13 avec celles des unités 1 à 12.
//
// POURQUOI. Le dossier de `u13-l13b` annonçait « 7 redéclarations sur 28 »
// en croisant contre « 337 » graphies, alors que
// `repo-thai-scan.mjs 1 12` en rend 353. Le contre-audit interne du
// 2026-08-04 a montré que le 337 venait d'un dépouillement à la main, dont
// la découpe en blocs d'item n'était pas celle du script versionné : une
// leçon qui titre ses items en `####` voyait plusieurs items fondus en un
// seul bloc. Le croisement est donc refait ICI, par une machine, avec la
// convention de comptage de `repo-thai-scan.mjs` recopiée verbatim.
//
// GARDE-FOU. Le script commence par vérifier qu'il retrouve les deux
// cardinaux publiés par `repo-thai-scan.mjs`, 353 pour les unités 1 à 12 et
// 28 pour l'unité 13. Tant que ce contrôle ne passe pas, il sort en code 1
// et rien de ce qu'il imprime ne doit être cité : la convention n'est alors
// pas celle du script de référence.
//
// Usage :
//   node scripts/verification/tmp-13b-croisement.mjs

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

function lessonFiles(minUnit, maxUnit) {
  const files = [];
  for (let unit = minUnit; unit <= maxUnit; unit += 1) {
    const dir = join(AUTHORING, `unite-${String(unit).padStart(2, "0")}`);
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names.sort()) {
      if (/^lecon-.*\.md$/.test(name)) files.push(join(dir, name));
    }
  }
  return files;
}

// Recopie verbatim de `entriesOf` de `repo-thai-scan.mjs`.
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

function graphiesOf(minUnit, maxUnit) {
  const firstSeen = new Map();
  for (const file of lessonFiles(minUnit, maxUnit)) {
    for (const graphie of entriesOf(readFileSync(file, "utf8"))) {
      if (!firstSeen.has(graphie)) firstSeen.set(graphie, file);
    }
  }
  return firstSeen;
}

const anterieur = graphiesOf(1, 12);
const unite13 = graphiesOf(13, 13);

console.log(`graphies distinctes, unités 1 à 12 : ${anterieur.size}`);
console.log(`graphies distinctes, unité 13      : ${unite13.size}`);

let bad = 0;
if (anterieur.size !== 353) bad += 1;
if (unite13.size !== 28) bad += 1;
if (bad > 0) {
  console.log(
    "\nÉCART avec repo-thai-scan.mjs (353 et 28) : convention NON reproduite, ne rien citer.",
  );
  process.exit(1);
}
console.log(
  "contrôle : cardinaux identiques à repo-thai-scan.mjs (353, 28).\n",
);

const inter = [...unite13.keys()].filter((g) => anterieur.has(g));
console.log(`redéclarations (unité 13 ∩ unités 1 à 12) : ${inter.length}`);
for (const g of inter) {
  const rel = (p) => p.replace(ROOT, "").replace(/\\/g, "/");
  console.log(
    `  ${g}\tpubliée par ${rel(anterieur.get(g))}\tredéclarée par ${rel(unite13.get(g))}`,
  );
}

const neuves = [...unite13.keys()].filter((g) => !anterieur.has(g));
console.log(`\ngraphies de l'unité 13 sans antécédent : ${neuves.length}`);

// Collisions d'attribution DANS l'unité 13 : une même graphie déclarée en
// entrée par plusieurs fichiers de la même unité. `repo-thai-scan.mjs` ne les
// montre pas, son index ne retenant qu'un fichier par graphie.
const parGraphie = new Map();
for (const file of lessonFiles(13, 13)) {
  for (const g of entriesOf(readFileSync(file, "utf8"))) {
    if (!parGraphie.has(g)) parGraphie.set(g, new Set());
    parGraphie.get(g).add(file.split(/[\\/]/).pop());
  }
}
const collisions = [...parGraphie.entries()].filter(([, s]) => s.size > 1);
console.log(
  `\ncollisions d'attribution dans l'unité 13 : ${collisions.length}`,
);
for (const [g, s] of collisions) {
  console.log(`  ${g}\t${[...s].sort().join(" + ")}`);
}
const portees13b = collisions.filter(([, s]) => s.has("lecon-13b.md"));
console.log(`  dont portées par lecon-13b.md : ${portees13b.length}`);

// Détail propre à 13B : quelles graphies de 13B sont dans chaque camp.
const b13 = new Map();
for (const file of lessonFiles(13, 13)) {
  if (!file.endsWith("lecon-13b.md")) continue;
  for (const g of entriesOf(readFileSync(file, "utf8"))) b13.set(g, file);
}
console.log(`\ngraphies portées par lecon-13b.md : ${b13.size}`);
for (const g of b13.keys()) {
  console.log(`  ${g}\t${anterieur.has(g) ? "REDÉCLARÉE" : "neuve"}`);
}
