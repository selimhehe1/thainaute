// Balayage des écrans de `lecon-12b.md` : chaînes thaïes, motifs interdits,
// typographie. Fichier de travail, non versionné.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const f = join(ROOT, "content", "authoring", "unite-12", "lecon-12b.md");
const txt = readFileSync(f, "utf8");
const lines = txt.split(/\r?\n/);
const cut = lines.findIndex((l) => l === "## Dossier de production");
const ecrans = lines.slice(0, cut).join("\n");

console.log(`lignes d'écrans : ${cut}`);

const RUN = /[฀-๿]+/g;
const set = new Set();
for (const m of ecrans.matchAll(RUN)) set.add(m[0]);
console.log(`chaînes thaïes distinctes sur les écrans : ${set.size}`);

const tout = new Set();
for (const m of txt.matchAll(RUN)) tout.add(m[0]);
console.log(`chaînes thaïes distinctes, fichier entier : ${tout.size}`);

// Les 61 graphies du matériel, lues dans le tableau Unicode du fichier lui-même.
const uni = [];
const reUni = /^\|\s*([฀-๿]+)\s*\|\s*((?:U\+[0-9A-F]{4}\s*)+)\|$/gm;
let m;
while ((m = reUni.exec(txt))) uni.push(m[1]);
console.log(`lignes du tableau Unicode : ${uni.length}`);
const hors = [...set].filter((g) => !uni.includes(g));
console.log(`chaînes d'écran hors du tableau Unicode : ${hors.length}`);
console.log(hors.join(" "));
const inutiles = uni.filter((g) => !set.has(g));
console.log(
  `graphies du tableau absentes des écrans : ${inutiles.length} ${inutiles.join(" ")}`,
);

// Tableau de la partie 2.
const p2 = [];
const reP2 =
  /^\|\s*([฀-๿]+)\s*\|\s*`([^`]+)`\s*(?:item\s*)?[^|]*\|\s*`([^`]+)`\s*\|$/gm;
while ((m = reP2.exec(txt))) p2.push(m[1]);
console.log(`lignes du tableau de la partie 2 : ${p2.length}`);
const a = new Set(uni);
const b = new Set(p2);
console.log(
  `ensembles identiques : ${a.size === b.size && [...a].every((x) => b.has(x))}`,
);

// NFC.
const nonNfc = [...tout].filter((g) => g.normalize("NFC") !== g);
console.log(`chaînes non NFC : ${nonNfc.length}`);
console.log(`fichier entier NFC stable : ${txt.normalize("NFC") === txt}`);

// Typographie.
const compte = (ch) => txt.split(ch).length - 1;
console.log(`tirets cadratins : ${compte("—")}`);
console.log(`demi-cadratins : ${compte("–")}`);
console.log(`apostrophes droites : ${compte("'")}`);

// Motifs, écrans seuls, insensible à la casse.
const jeu1 = [
  "une bouche française",
  "un francophone",
  "l’oreille française",
  "francophone",
];
const jeu2 = [
  "A1",
  "A2",
  "B1",
  "CECR",
  "Cadre européen",
  "niveau",
  "heures",
  "mois",
  "équivalent",
  "équivalence",
  "diplôme",
  "examen",
  "vous serez",
  "vous saurez",
  "bilingue",
  "couramment",
];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const compter = (jeu, nom) => {
  console.log(`\n# ${nom}`);
  let nonNuls = 0;
  let total = 0;
  for (const mo of jeu) {
    const n = (ecrans.match(new RegExp(esc(mo), "gi")) ?? []).length;
    if (n > 0) {
      nonNuls += 1;
      total += n;
    }
    console.log(`${mo.padEnd(22)}: ${n}`);
  }
  console.log(`motifs non nuls : ${nonNuls}, occurrences : ${total}`);
};
compter(jeu1, "premier jeu, phonétique du français");
compter(jeu2, "second jeu, affirmations de niveau");

// Balayage complémentaire de promesses.
console.log("\n# balayage complémentaire");
for (const mo of [
  "vous pourrez",
  "vous parlerez",
  "vous comprendrez",
  "capable",
  "garanti",
  "rapidement",
  "facilement",
  "certificat",
  "maîtris",
  "atteint",
  "acquis",
  "suffira",
  "assez pour",
  "en six mois",
  "semaines",
]) {
  const n = (ecrans.match(new RegExp(esc(mo), "gi")) ?? []).length;
  if (n > 0) console.log(`${mo.padEnd(22)}: ${n}`);
}
