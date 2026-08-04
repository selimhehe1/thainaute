// Balayage des graphies publiées dans les fichiers d'autorat, sans dépendance.
//
// POURQUOI CE SCRIPT EXISTE. Plusieurs dossiers de production citent des
// décomptes internes au dépôt en les annonçant « recomputables », sans que
// rien dans le dépôt ne permette de les recomputer. Le contre-audit de
// `u08-l8a` du 2026-08-04 a montré que quatre de ces chiffres étaient faux.
// La règle de travail est désormais : un décompte interne cité par une leçon
// est produit par CE script, ou il n'est pas cité.
//
// CONVENTION DE COMPTAGE, reprise telle quelle de `u07-l7a` et non modifiée :
//   - sont balayées les sections `## Items` des fichiers `lecon-*.md` des
//     unités demandées ;
//   - une ENTRÉE est retenue quand son bloc d'item porte à la fois un champ
//     `thai` et un champ `ton` ;
//   - les leçons 1A et 1B écrivent ces champs sans guillemets obliques : les
//     deux formes, `- thai :` et `` - `thai` : ``, sont reconnues ;
//   - une GRAPHIE est une valeur de champ `thai` distincte, comparée sans
//     normalisation Unicode (le dépôt est en NFC, et normaliser masquerait
//     précisément ce qu'on veut voir).
//
// VALIDATION DE LA CONVENTION. Passé sur les unités 1 à 6, ce script doit
// rendre les sept chiffres publiés par `u07-l7a` : 30 fichiers, 285 entrées,
// 216 graphies, 70 ไม้เอก, 40 ไม้โท, 0 ไม้ตรี, 0 ไม้จัตวา, 99 graphies
// marquées, et 9 puis 7 occurrences de U+0E4A et U+0E4B en texte entier.
// Le mode `--check-u07` fait exactement cette vérification et sort en code 1
// au moindre écart. Tant qu'il ne passe pas, aucun chiffre produit par ce
// script ne doit être cité.
//
// Usage :
//   node scripts/verification/repo-thai-scan.mjs <unite-min> <unite-max>
//   node scripts/verification/repo-thai-scan.mjs --check-u07
//   node scripts/verification/repo-thai-scan.mjs <min> <max> --stacked
//   node scripts/verification/repo-thai-scan.mjs <min> <max> --grep <motif>
//
// Les chemins sont résolus depuis la racine du dépôt, quel que soit le
// répertoire courant.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

const MAI_EK = "่";
const MAI_THO = "้";
const MAI_TRI = "๊";
const MAI_CHATTAWA = "๋";

// Signes thaïs de catégorie positionnelle Top, c'est-à-dire ceux qui
// s'empilent au-dessus de la lettre. Relevé depuis
// IndicPositionalCategory-17.0.0.txt : 0E31, 0E34..0E37, 0E47..0E4E.
const TOP_MARKS = new Set([
  "ั",
  "ิ",
  "ี",
  "ึ",
  "ื",
  "็",
  "่",
  "้",
  "๊",
  "๋",
  "์",
  "ํ",
  "๎",
]);

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

// Découpe la section `## Items` en blocs d'item, puis retient les blocs
// portant à la fois un champ `thai` et un champ `ton`.
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

// Nombre maximal de signes Top consécutifs empilés sur une même lettre.
function maxStack(graphie) {
  let best = 0;
  let run = 0;
  for (const ch of graphie) {
    if (TOP_MARKS.has(ch)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

function scan(minUnit, maxUnit) {
  const files = lessonFiles(minUnit, maxUnit);
  const entries = [];
  const firstSeen = new Map();
  let tri = 0;
  let chattawa = 0;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    tri += (text.match(new RegExp(MAI_TRI, "g")) ?? []).length;
    chattawa += (text.match(new RegExp(MAI_CHATTAWA, "g")) ?? []).length;
    for (const graphie of entriesOf(text)) {
      entries.push(graphie);
      if (!firstSeen.has(graphie)) firstSeen.set(graphie, file);
    }
  }

  const graphies = [...firstSeen.keys()];
  const count = (mark) => graphies.filter((g) => g.includes(mark)).length;

  return {
    files,
    entries,
    graphies,
    firstSeen,
    ek: count(MAI_EK),
    tho: count(MAI_THO),
    tri: count(MAI_TRI),
    chattawa: count(MAI_CHATTAWA),
    marked: graphies.filter((g) =>
      [MAI_EK, MAI_THO, MAI_TRI, MAI_CHATTAWA].some((m) => g.includes(m)),
    ).length,
    fullTextTri: tri,
    fullTextChattawa: chattawa,
  };
}

function report(label, r) {
  console.log(`# ${label}`);
  console.log(`fichiers lecon-*.md      : ${r.files.length}`);
  console.log(`entrées (thai + ton)     : ${r.entries.length}`);
  console.log(`graphies distinctes      : ${r.graphies.length}`);
  console.log(`graphies portant ไม้เอก   : ${r.ek}`);
  console.log(`graphies portant ไม้โท    : ${r.tho}`);
  console.log(`graphies portant ไม้ตรี   : ${r.tri}`);
  console.log(`graphies portant ไม้จัตวา : ${r.chattawa}`);
  console.log(`graphies marquées        : ${r.marked}`);
  console.log(`U+0E4A en texte entier   : ${r.fullTextTri}`);
  console.log(`U+0E4B en texte entier   : ${r.fullTextChattawa}`);
}

const args = process.argv.slice(2);

if (args[0] === "--check-u07") {
  const r = scan(1, 6);
  const expected = {
    fichiers: [r.files.length, 30],
    entrées: [r.entries.length, 285],
    graphies: [r.graphies.length, 216],
    ไม้เอก: [r.ek, 70],
    ไม้โท: [r.tho, 40],
    ไม้ตรี: [r.tri, 0],
    ไม้จัตวา: [r.chattawa, 0],
    marquées: [r.marked, 99],
    "U+0E4A texte": [r.fullTextTri, 9],
    "U+0E4B texte": [r.fullTextChattawa, 7],
  };
  let bad = 0;
  for (const [name, [got, want]] of Object.entries(expected)) {
    const ok = got === want;
    if (!ok) bad += 1;
    console.log(
      `${ok ? "OK  " : "ÉCART"} ${name} : obtenu ${got}, attendu ${want}`,
    );
  }
  console.log(
    bad === 0
      ? "\nConvention de comptage REPRODUITE sur les unités 1 à 6."
      : `\n${bad} écart(s) : la convention n'est PAS reproduite, ne rien citer.`,
  );
  process.exit(bad === 0 ? 0 : 1);
}

const min = Number(args[0]);
const max = Number(args[1]);

if (!Number.isInteger(min) || !Number.isInteger(max)) {
  console.error(
    "Usage : node scripts/verification/repo-thai-scan.mjs <unite-min> <unite-max> [--stacked] [--grep <motif>]",
  );
  process.exit(2);
}

const r = scan(min, max);
report(`unités ${min} à ${max}`, r);

// `--pure` restreint aux graphies faites UNIQUEMENT de caractères thaïs,
// c'est-à-dire aux mots isolés. La convention de `u07-l7a` retient la valeur
// du champ `thai` telle quelle, or certaines leçons y écrivent une ossature
// entière avec gloses françaises ; citer « 44 graphies » sans ce filtre
// mélangerait des mots et des phrases.
const isPureThai = (g) => /^[฀-๿]+$/.test(g);

if (args.includes("--stacked")) {
  const pool = args.includes("--pure")
    ? r.graphies.filter(isPureThai)
    : r.graphies;
  const stacked = pool
    .filter((g) => maxStack(g) >= 2)
    .map((g) => ({ g, file: r.firstSeen.get(g), depth: maxStack(g) }));
  console.log(
    `\n# graphies empilant au moins deux signes Top : ${stacked.length}`,
  );
  for (const s of stacked) {
    console.log(
      `${s.g}\t${s.depth}\t${s.file.replace(ROOT, "").replace(/\\/g, "/")}`,
    );
  }
  const maxDepth = Math.max(0, ...stacked.map((s) => s.depth));
  console.log(`profondeur maximale observée : ${maxDepth}`);
}

const grepIndex = args.indexOf("--grep");
if (grepIndex !== -1 && args[grepIndex + 1]) {
  const needle = args[grepIndex + 1];
  const hits = r.graphies.filter((g) => g.includes(needle));
  console.log(`\n# graphies contenant « ${needle} » : ${hits.length}`);
  for (const g of hits) {
    console.log(
      `${g}\t${r.firstSeen.get(g).replace(ROOT, "").replace(/\\/g, "/")}`,
    );
  }
}
