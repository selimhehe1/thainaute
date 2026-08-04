import { readFileSync } from "node:fs";
const f =
  "C:/Users/Selim/Documents/Thainaute/content/authoring/unite-12/lecon-12a.md";
const lines = readFileSync(f, "utf8").split(/\r?\n/);
const RUN = /[\u0E00-\u0E7F]+/g;
function idx(t) {
  return lines.findIndex((l) => l === t);
}
const bornes = {
  Meta: [idx("## Méta"), idx("## Enseignement")],
  Enseignement: [idx("## Enseignement"), idx("## Items")],
  Items: [idx("## Items"), idx("## Exercices")],
  Exercices: [idx("## Exercices"), idx("## Auto-contrôle")],
  AutoControle: [idx("## Auto-contrôle"), idx("## SRS")],
  SRS: [idx("## SRS"), idx("## Note culturelle")],
  Note: [idx("## Note culturelle"), idx("## Dossier de production")],
  Dossier: [idx("## Dossier de production"), lines.length],
};
const sets = {};
for (const [k, [a, b]] of Object.entries(bornes)) {
  const s = new Set();
  for (const m of lines.slice(a, b).join("\n").matchAll(RUN)) s.add(m[0]);
  sets[k] = s;
  console.log(
    k.padEnd(14),
    `l.${a + 1}-${b}`.padEnd(12),
    "distinctes:",
    s.size,
  );
}
const ecranStrict = new Set([
  ...sets.Enseignement,
  ...sets.Exercices,
  ...sets.AutoControle,
]);
console.log(
  "\nPERIMETRE ECRAN (Enseignement+Exercices+Auto-controle) :",
  ecranStrict.size,
);
const avecMeta = new Set([...ecranStrict, ...sets.Meta]);
console.log("+ Meta :", avecMeta.size);
const avecItems = new Set([...avecMeta, ...sets.Items]);
console.log("+ Items :", avecItems.size);
const avecSRS = new Set([...avecItems, ...sets.SRS]);
console.log("+ SRS :", avecSRS.size);
