// Consolidation 12E — recouvrement de graphies entre les sections ## Exercices
// des cinq leçons de l'unité 12. Méthode déclarée : séquences thaïes maximales,
// espaces internes conservés pour ๆ, comparées à l'identique.
import { readFileSync } from "node:fs";

const F = ["a", "b", "c", "d", "e"].map(
  (x) => `content/authoring/unite-12/lecon-12${x}.md`,
);

function exercices(f) {
  const lignes = readFileSync(f, "utf8").split(/\r?\n/);
  let dans = false;
  const buf = [];
  for (const l of lignes) {
    if (/^##\s+Exercices?\b/i.test(l)) {
      dans = true;
      continue;
    }
    if (/^##\s(?!#)/.test(l)) {
      dans = false;
      continue;
    }
    if (dans) buf.push(l);
  }
  const s = new Set();
  for (const m of buf.join("\n").matchAll(/[฀-๿]+(?:\s+ๆ)?(?:\s+[฀-๿]+)*/g))
    s.add(m[0].trim());
  return s;
}

const sets = Object.fromEntries(
  F.map((f) => [f.slice(-5, -3).toUpperCase(), exercices(f)]),
);
for (const k of Object.keys(sets))
  console.log(`${k} : ${sets[k].size} séquences distinctes dans ## Exercices`);
console.log("");
for (const k of ["2A", "2B", "2C", "2D"]) {
  const commun = [...sets["2E"]].filter((g) => sets[k].has(g));
  console.log(`recouvrement 12${k[1]} ∩ 12E : ${commun.length}`);
}
