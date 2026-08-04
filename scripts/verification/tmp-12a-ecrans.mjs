import { readFileSync } from "node:fs";
const f =
  "C:/Users/Selim/Documents/Thainaute/content/authoring/unite-12/lecon-12a.md";
const txt = readFileSync(f, "utf8");
const lines = txt.split(/\r?\n/);
const cut = lines.findIndex((l) => l === "## Dossier de production");
console.log("ligne de coupe :", cut + 1);
const ecrans = lines.slice(0, cut).join("\n");
const RUN = /[\u0E00-\u0E7F]+/g;
const set = new Set();
for (const m of ecrans.matchAll(RUN)) set.add(m[0]);
console.log("sous-chaines thaies distinctes AVANT le dossier :", set.size);
const tout = new Set();
for (const m of txt.matchAll(RUN)) tout.add(m[0]);
console.log("sur le fichier entier :", tout.size);

// motifs de niveau, insensible a la casse, sur les ecrans
const motifs = [
  "A1",
  "A2",
  "B1",
  "B2",
  "CECR",
  "CEFR",
  "niveau",
  "heures",
  "équival",
  "mois",
  "bilingue",
  "couramment",
  "certifi",
  "garanti",
  "vous serez",
  "vous saurez",
  "test de niveau",
];
for (const mo of motifs) {
  const rx = new RegExp(mo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const n = (ecrans.match(rx) || []).length;
  const nTot = (txt.match(rx) || []).length;
  console.log(`${mo.padEnd(16)} ecrans=${n}  fichier=${nTot}`);
}
// tirets cadratins
for (const [nom, ch] of [
  ["cadratin", "\u2014"],
  ["demi-cadratin", "\u2013"],
  ["apostrophe droite", "'"],
]) {
  const n = txt.split(ch).length - 1;
  console.log(nom, ":", n);
}
