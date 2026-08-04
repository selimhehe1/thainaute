// Mesure du champ `registre` sur les fichiers d'autorat, et relevé des items
// que le parcours fondamental déclare `familier`.
//
// POURQUOI CE SCRIPT EXISTE. Le plan
// `docs/pedagogie/parcours-avance-registres-et-dialectes.md` publie un tableau
// « 348 neutre / 134 poli / 6 familier / 2 soutenu », soit 490 items, alors que
// `repo-thai-scan.mjs` compte 525 entrées sur les unités 1 à 12 au 2026-08-04.
// La leçon 13D s'appuie sur ce constat : elle doit donc le RECOMPTER plutôt que
// le recopier, et dire ce qui a bougé.
//
// PIÈGE ÉVITÉ, et il a coûté une première version fausse de ce script. Une
// découpe en blocs sur les seuls titres `### Item` rend 490 entrées, soit 35 de
// moins que `repo-thai-scan.mjs`, parce que plusieurs leçons titrent leurs items
// autrement (`### 1. …`, `#### …`) ou posent un premier bloc avant tout titre.
// La CONVENTION DE DÉCOUPE est donc reprise à l'identique de
// `repo-thai-scan.mjs` : à l'intérieur de la seule section `## Items`, un bloc
// va d'un titre de niveau 3 ou plus au suivant, et il est retenu quand il porte
// à la fois un champ `thai` et un champ `ton`. Ce script ne fait qu'ajouter la
// lecture du champ `registre` sur le même bloc.
//
// La valeur de `registre` est ramenée à son PREMIER mot en minuscules :
// « neutre (poli avec la particule) » compte comme `neutre`, ce qui est la
// lecture la plus conservatrice pour le constat visé, puisqu'elle ne gonfle
// jamais la part du registre familier.
//
// Usage :
//   node scripts/verification/tmp-13d-registres.mjs [unite-min] [unite-max]

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const min = Number(process.argv[2] ?? 1);
const max = Number(process.argv[3] ?? 12);

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

// Découpe identique à `repo-thai-scan.mjs`, champ `registre` en plus.
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
    const registre = joined.match(/^-\s*`?registre`?\s*:\s*(\S.*?)\s*$/m);
    if (thai && ton) {
      entries.push({
        thai: thai[1],
        registre: registre === null ? null : registre[1],
      });
    }
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

const total = new Map();
const familiers = [];
let entrees = 0;

for (const file of lessonFiles(min, max)) {
  const court = file.slice(AUTHORING.length + 1).replaceAll("\\", "/");
  for (const entry of entriesOf(readFileSync(file, "utf8"))) {
    entrees += 1;
    const valeur =
      entry.registre === null
        ? "(champ absent)"
        : (entry.registre.toLowerCase().match(/^[a-zàâçéèêëîïôûùüÿñæœ]+/) ?? [
            "(illisible)",
          ])[0];
    total.set(valeur, (total.get(valeur) ?? 0) + 1);
    if (valeur === "familier") {
      familiers.push(`${court}\t${entry.thai}\t${entry.registre}`);
    }
  }
}

console.log(`# unités ${min} à ${max}`);
console.log(`entrées (thai + ton)      : ${entrees}`);
for (const [valeur, compte] of [...total.entries()].sort(
  (a, b) => b[1] - a[1],
)) {
  const part = ((compte / entrees) * 100).toFixed(1);
  console.log(
    `${valeur.padEnd(24)}  : ${String(compte).padStart(4)}  ${part} %`,
  );
}
console.log(`\n# items déclarés « familier » : ${familiers.length}`);
for (const ligne of familiers) console.log(ligne);
