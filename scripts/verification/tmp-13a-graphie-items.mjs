// Contre-audit de `u13-l13a` : toutes les publications d'une graphie donnée
// comme ITEM, dans les unités demandées, avec les champs qui font le sens.
//
// POURQUOI CE SCRIPT EXISTE. `repo-thai-scan.mjs --grep` répond à la question
// « quelles graphies du corpus contiennent ce motif », et il n'affiche qu'UN
// fichier par graphie. Il ne répond pas à la question « cette graphie a-t-elle
// déjà été publiée comme item, et avec quelle valeur ». `lecon-13a.md` a tiré
// de la première réponse une conclusion qui ne s'y trouve pas : son item 4
// écrit que la valeur interrogative de ไหม n'a « jamais été publiée comme item
// autonome ». Ce script montre le contraire en une commande.
//
// Usage :
//   node scripts/verification/tmp-13a-graphie-items.mjs <graphie> [unite-min] [unite-max]
//
// Convention d'entrée identique à `repo-thai-scan.mjs` : un bloc d'item compte
// quand il porte à la fois un champ `thai` et un champ `ton`.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

const [graphie, minArg, maxArg] = process.argv.slice(2);
if (graphie === undefined) {
  console.error(
    "usage: node tmp-13a-graphie-items.mjs <graphie> [unite-min] [unite-max]",
  );
  process.exit(2);
}
const min = Number(minArg ?? 1);
const max = Number(maxArg ?? 12);

function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)- `?" +
      nom +
      "`? ?: ?([\\s\\S]*?)(?=\\n- `?[a-z_]+`? ?:|\\n#|\\n\\n|$)",
  );
  const m = bloc.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : undefined;
}

let total = 0;
for (let u = min; u <= max; u += 1) {
  const dir = join(AUTHORING, `unite-${String(u).padStart(2, "0")}`);
  let noms;
  try {
    noms = readdirSync(dir);
  } catch {
    continue;
  }
  for (const nom of noms.sort()) {
    if (!/^lecon-.*\.md$/.test(nom)) continue;
    const texte = readFileSync(join(dir, nom), "utf8");
    const section = texte.split(/^## /m).find((s) => s.startsWith("Items"));
    if (section === undefined) continue;
    for (const bloc of section.split(/^#{3,4} /m).slice(1)) {
      if (champ(bloc, "thai") !== graphie) continue;
      if (champ(bloc, "ton") === undefined) continue;
      total += 1;
      console.log(
        `${nom.replace(/^lecon-/, "u" + String(u).padStart(2, "0") + "-l").replace(/\.md$/, "")} :: ${bloc.split("\n")[0].trim()}`,
      );
      for (const c of ["fr", "transcription", "ton", "ipa", "registre"]) {
        console.log(`    ${c} : ${champ(bloc, c)}`);
      }
    }
  }
}
console.log(
  `\npublications de « ${graphie} » comme item, unités ${min} à ${max} : ${total}`,
);
