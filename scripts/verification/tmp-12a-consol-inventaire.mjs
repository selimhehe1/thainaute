// Inventaire de ce que u12-l12a affiche réellement, consolidation du 2026-08-04.
// Une seule unité de comptage : la sous-chaîne thaïe rendue par le tokeniseur
// employé par unicode-thai.mjs et unicode-stack-scan.mjs.
import { readFileSync } from "node:fs";

const F =
  "C:/Users/Selim/Documents/Thainaute/content/authoring/unite-12/lecon-12a.md";
const lines = readFileSync(F, "utf8").split(/\r?\n/);
const RUN = /[\u0E00-\u0E7F]+/g;
const idx = (t) => lines.findIndex((l) => l === t);

const ecran = lines
  .slice(idx("## Enseignement"), idx("## Items"))
  .concat(lines.slice(idx("## Exercices"), idx("## SRS")))
  .join("\n");
const fichier = lines.join("\n");

const set = (t) => new Set([...t.matchAll(RUN)].map((m) => m[0]));
const sEcran = set(ecran);
const sFichier = set(fichier);
console.log("sous-chaînes distinctes, périmètre d’écran :", sEcran.size);
console.log("sous-chaînes distinctes, fichier entier    :", sFichier.size);
console.log(
  "hors périmètre d’écran                     :",
  sFichier.size - sEcran.size,
);

// lignes du tableau des blocs
const start = lines.findIndex((l) => l.startsWith("### Les "));
const end = lines.findIndex((l) => l.startsWith("**Le tableau porte"));
const rows = [];
for (let i = start; i < end; i += 1) {
  const l = lines[i];
  if (!l.startsWith("|")) continue;
  const c = l.split("|").map((s) => s.trim());
  if (c.length < 4 || c[1].startsWith("---") || c[1] === "Bloc") continue;
  rows.push(c[1]);
}
console.log("\nlignes de données du tableau :", rows.length);

// jeton exact : la sous-chaîne du tableau est-elle une sous-chaîne rendue par
// le tokeniseur sur un écran ?
const toutes = [];
const aucune = [];
for (const r of rows) {
  const graphies = [...r.matchAll(RUN)].map((m) => m[0]);
  if (graphies.every((g) => sEcran.has(g))) toutes.push(r);
  else if (!graphies.some((g) => sEcran.has(g))) aucune.push(r);
}
console.log(
  "lignes dont TOUTES les sous-chaînes sont des jetons d’écran :",
  toutes.length,
);
console.log(
  "lignes dont AUCUNE ne l’est                                 :",
  aucune.length,
);
console.log(aucune.join(" · "));
console.log(
  "lignes partiellement affichées :",
  rows.length - toutes.length - aucune.length,
);

// blocs affichés sur les pages d'enseignement : lignes de citation « > **thaï** · … »
const ens = lines.slice(idx("## Enseignement"), idx("## Items"));
const blocsPages = ens.filter((l) => /^> \*\*[\u0E00-\u0E7F]/.test(l)).length;
console.log(
  "\nlignes de bloc des pages d’enseignement (> **thaï** · …) :",
  blocsPages,
);

// tableau des séquences NFC
const nfcStart = lines.findIndex((l) => l.startsWith("| Graphie affichée"));
let nfc = 0;
for (let i = nfcStart + 2; i < lines.length && lines[i].startsWith("|"); i += 1)
  nfc += 1;
console.log("lignes du tableau des séquences NFC :", nfc);

// lignes partiellement affichées, détail
const partielles = rows.filter((r) => {
  const g = [...r.matchAll(RUN)].map((m) => m[0]);
  return !g.every((x) => sEcran.has(x)) && g.some((x) => sEcran.has(x));
});
console.log("\ndétail des lignes partiellement affichées :");
for (const p of partielles) console.log("   ", p);
