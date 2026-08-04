import { readFileSync } from "node:fs";
const cible =
  "C:/Users/Selim/Documents/Thainaute/content/authoring/unite-12/lecon-12e.md";
const texte = readFileSync(cible, "utf8");
const lignes = texte.split(/\r?\n/);
const i = lignes.findIndex((l) => /^## Dossier de production\s*$/.test(l));
const ecrans = lignes.slice(0, i).join("\n");

const TOP = new Set([
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
function stack(g) {
  let best = 0,
    run = 0;
  for (const c of g) {
    if (TOP.has(c)) {
      run++;
      if (run > best) best = run;
    } else run = 0;
  }
  return best;
}
const seqs = new Set();
for (const m of ecrans.matchAll(
  /[\u0E00-\u0E7F]+(?:\s+ๆ)?(?:\s+[\u0E00-\u0E7F]+)*/g,
))
  seqs.add(m[0].trim());
console.log("séquences thaïes distinctes sur les écrans :", seqs.size);
const inst = [...seqs].filter((s) => s.normalize("NFC") !== s);
console.log("séquences non stables en NFC :", inst.length);
const st = [...seqs].filter((s) => stack(s) >= 2);
console.log("séquences à empilement >= 2 :", st.length);
st.forEach((s) => console.log("   ", stack(s), s));
console.log("profondeur maximale :", Math.max(...[...seqs].map(stack)));

// vérification des séquences U+ déclarées dans le dossier
const dossier = lignes.slice(i).join("\n");
function seq(g) {
  return [...g.normalize("NFC")]
    .map(
      (c) =>
        "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    )
    .join(" ");
}
let ok = 0,
  ko = 0;
// table markdown : | graphie | ex | U+... | ...
for (const m of dossier.matchAll(
  /\|\s*([\u0E00-\u0E7F\u0020]+)\s*\|\s*\d\s*\|\s*((?:U\+[0-9A-F]{4}\s*)+)\|/g,
)) {
  const g = m[1].trim();
  const d = m[2].trim().replace(/\s+/g, " ");
  if (seq(g) === d) ok++;
  else {
    ko++;
    console.log(
      "!! codepoints table :",
      g,
      "\n   attendu :",
      seq(g),
      "\n   déclaré :",
      d,
    );
  }
}
// prose : « graphie U+.... ; »
for (const m of dossier.matchAll(
  /([\u0E00-\u0E7F]+)\s+((?:U\+[0-9A-F]{4}\s*)+)(?=[;.])/g,
)) {
  const g = m[1].trim();
  const d = m[2].trim().replace(/\s+/g, " ");
  if (seq(g) === d) ok++;
  else {
    ko++;
    console.log(
      "!! codepoints prose :",
      g,
      "\n   attendu :",
      seq(g),
      "\n   déclaré :",
      d,
    );
  }
}
console.log(
  "\nséquences U+ vérifiées :",
  ok + ko,
  "| conformes :",
  ok,
  "| fautives :",
  ko,
);
