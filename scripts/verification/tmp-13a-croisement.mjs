// Croisement de coordination de l'unité 13 : collisions d'attribution DANS
// l'unité, et redéclarations de graphies déjà publiées par les unités 1 à 12.
//
// POURQUOI CE SCRIPT EXISTE. `repo-thai-scan.mjs` n'a aucun mode qui rende ce
// dépouillement, constat déjà porté par `u11-l11a`. La partie 5 de
// `lecon-13a.md` annonçait donc « la convention d'entrée de repo-thai-scan.mjs
// recopiée telle quelle dans un fichier de travail », fichier qui n'a jamais
// été versionné. Le contre-audit du 2026-08-04 l'a rendu comme finding N4.
// Ce script versionne la recopie et l'auto-valide : passé sur les unités 1 à
// 12, il doit reproduire le chiffre de 353 graphies distinctes du script de
// référence, faute de quoi la convention a dérivé.
//
// Usage : node scripts/verification/tmp-13a-croisement.mjs [unite]   (défaut 13)

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

const cible = Number(process.argv[2] ?? 13);

// Convention d'entrée de `repo-thai-scan.mjs`, recopiée : un bloc compte comme
// entrée quand il porte à la fois un champ `thai` et un champ `ton`. Deux
// détails de la convention ont chacun cassé une recopie avant celle-ci, et
// l'auto-validation ci-dessous est le seul moyen de les voir :
//   1. les guillemets obliques autour du nom de champ sont FACULTATIFS, parce
//      que les leçons 1A et 1B ne les écrivent pas ; les exiger rend 333
//      graphies au lieu de 353 ;
//   2. la valeur d'un champ `thai` s'arrête à la FIN DE SA LIGNE, elle ne se
//      recolle pas avec les lignes de continuation ; les recoller rend 356
//      graphies au lieu de 353, parce que trois champs `thai` du fondamental
//      passent à la ligne.
const champ = (bloc, nom) => {
  const m = bloc.match(
    new RegExp("^-\\s*`?" + nom + "`?\\s*:\\s*(\\S.*?)\\s*$", "m"),
  );
  return m ? m[1] : undefined;
};
const aChamp = (bloc, nom) =>
  new RegExp("^-\\s*`?" + nom + "`?\\s*:", "m").test(bloc);

function entrees(unite) {
  const dir = join(AUTHORING, `unite-${String(unite).padStart(2, "0")}`);
  const sortie = [];
  let noms;
  try {
    noms = readdirSync(dir);
  } catch {
    return sortie;
  }
  for (const nom of noms.sort()) {
    if (!/^lecon-.*\.md$/.test(nom)) continue;
    const texte = readFileSync(join(dir, nom), "utf8");
    const section = texte.split(/^## /m).find((s) => s.startsWith("Items"));
    if (section === undefined) continue;
    for (const bloc of section.split(/^#{3,4} /m).slice(1)) {
      const thai = champ(bloc, "thai");
      if (thai === undefined || !aChamp(bloc, "ton")) continue;
      sortie.push({
        fichier: nom,
        unite,
        thai,
        titre: bloc.split("\n")[0].trim(),
      });
    }
  }
  return sortie;
}

// --- auto-validation de la recopie ------------------------------------------
const fondamental = [];
for (let u = 1; u <= 12; u += 1) fondamental.push(...entrees(u));
const graphiesFondamental = new Map();
for (const e of fondamental) {
  if (!graphiesFondamental.has(e.thai)) graphiesFondamental.set(e.thai, []);
  graphiesFondamental.get(e.thai).push(e);
}
console.log(
  `auto-validation : unités 1 à 12 = ${fondamental.length} entrées, ` +
    `${graphiesFondamental.size} graphies distinctes ` +
    `(repo-thai-scan.mjs 1 12 doit rendre 525 et 353)`,
);

// --- croisement de l'unité cible --------------------------------------------
const unite = entrees(cible);
const parFichier = new Map();
for (const e of unite) {
  if (!parFichier.has(e.fichier)) parFichier.set(e.fichier, []);
  parFichier.get(e.fichier).push(e);
}

console.log(
  `\nunité ${cible} : ${parFichier.size} fichiers, ${unite.length} entrées, ` +
    `${new Set(unite.map((e) => e.thai)).size} graphies distinctes`,
);

console.log("\n--- collisions d'attribution DANS l'unité ---");
let collisions = 0;
const parGraphie = new Map();
for (const e of unite) {
  if (!parGraphie.has(e.thai)) parGraphie.set(e.thai, new Set());
  parGraphie.get(e.thai).add(e.fichier);
}
for (const [thai, fichiers] of parGraphie) {
  if (fichiers.size < 2) continue;
  collisions += 1;
  console.log(`  ${thai} : ${[...fichiers].sort().join(" + ")}`);
}
console.log(`  total : ${collisions}`);

console.log("\n--- redéclarations de graphies des unités 1 à 12 ---");
let redeclarations = 0;
const graphiesRedeclarees = new Set();
for (const [fichier, liste] of [...parFichier].sort()) {
  const reds = liste.filter((e) => graphiesFondamental.has(e.thai));
  redeclarations += reds.length;
  for (const r of reds) graphiesRedeclarees.add(r.thai);
  console.log(
    `  ${fichier} : ${liste.length} items, ${reds.length} redéclarations` +
      (reds.length
        ? ` : ` +
          reds
            .map(
              (r) =>
                `${r.thai} (${graphiesFondamental
                  .get(r.thai)
                  .map(
                    (o) =>
                      `u${String(o.unite).padStart(2, "0")}-l` +
                      o.fichier.replace(/^lecon-(.*)\.md$/, "$1"),
                  )
                  .join(", ")})`,
            )
            .join(" ; ")
        : ""),
  );
}
console.log(
  `  total : ${redeclarations} redéclarations portant sur ` +
    `${graphiesRedeclarees.size} graphies distinctes`,
);

console.log("\n--- graphies de l'unité ABSENTES des unités 1 à 12 ---");
const neuves = [...new Set(unite.map((e) => e.thai))].filter(
  (t) => !graphiesFondamental.has(t),
);
console.log(`  ${neuves.length} : ${neuves.join(", ")}`);
