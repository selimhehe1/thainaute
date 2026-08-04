// Profondeur d'empilement des signes thaïs sur UN FICHIER ENTIER.
//
// POURQUOI CE SCRIPT EXISTE. `repo-thai-scan.mjs --stacked` ne regarde que les
// valeurs du champ `thai` des sections `## Items`. Une leçon empile pourtant
// des signes partout ailleurs : dans ses spécimens d'enseignement, dans ses
// tuiles d'exercice, dans ses répliques de dialogue et jusque dans les formules
// thaïes citées à ses sources. Le contre-audit interne de `u11-l11e` du
// 2026-08-04 a trouvé une ligne d'État des audits annonçant une profondeur
// maximale de 1 sur un fichier qui atteint 2, et une énumération donnée pour
// exhaustive qui omettait notamment นี้, repère affiché à grande taille.
//
// MÊME JEU DE SIGNES Top que `repo-thai-scan.mjs`, relevé depuis
// IndicPositionalCategory-17.0.0.txt : 0E31, 0E34..0E37, 0E47..0E4E. Les signes
// SOUS la lettre (0E38..0E3A) n'en font pas partie, et c'est délibéré : une
// graphie comme อยู่ porte un signe dessous et un dessus, ce qui est une
// contrainte de rendu réelle mais DIFFÉRENTE d'un empilement. Ne pas confondre
// les deux mesures, un contre-audit s'y est déjà trompé.
//
// PIÈGE CONNU. Le relevé porte sur les suites thaïes telles qu'elles sont mises
// en page : une suite coupée par un retour à la ligne se compte en deux
// morceaux. La profondeur maximale et les lettres porteuses n'en changent pas,
// le décompte de sous-chaînes si.
//
// Usage :
//   node scripts/verification/unicode-stack-scan.mjs <fichier.md>
import { readFileSync } from "node:fs";

const TOP_MARKS = new Set([
  "ั","ิ","ี","ึ","ื","็","่","้","๊","๋","์","ํ","๎",
]);

const text = readFileSync(process.argv[2], "utf8");
const runs = text.match(/[฀-๿]+/g) ?? [];

function maxStack(g) {
  let best = 0, run = 0;
  for (const ch of g) {
    if (TOP_MARKS.has(ch)) { run += 1; if (run > best) best = run; }
    else run = 0;
  }
  return best;
}

const byDepth = new Map();
for (const g of runs) {
  const d = maxStack(g);
  if (!byDepth.has(d)) byDepth.set(d, new Set());
  byDepth.get(d).add(g);
}
const depths = [...byDepth.keys()].sort((a, b) => a - b);
console.log("sous-chaînes thaïes distinctes : " + new Set(runs).size);
console.log("profondeur maximale : " + Math.max(...depths));
for (const d of depths) {
  if (d < 2) { console.log(`profondeur ${d} : ${byDepth.get(d).size} graphies`); continue; }
  const list = [...byDepth.get(d)].sort();
  console.log(`\nprofondeur ${d} : ${list.length} graphies`);
  for (const g of list) console.log("  " + g);
}
