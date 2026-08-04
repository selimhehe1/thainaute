// Consolidation 12E — balayage des formules interdites sur les ÉCRANS de lecon-12e.md.
// Portée : tout ce qui précède « ## Dossier de production ». Insensible à la casse.
import { readFileSync } from "node:fs";

const f = "content/authoring/unite-12/lecon-12e.md";
const lignes = readFileSync(f, "utf8").split(/\r?\n/);
const n = lignes.findIndex((l) => /^## Dossier de production\s*$/.test(l));
const ecrans = lignes.slice(0, n);

const motifs = [
  [
    "\\bA1\\b|\\bA2\\b|\\bB1\\b|\\bB2\\b|\\bC1\\b|\\bC2\\b|CECR",
    "niveau du Cadre européen",
  ],
  ["cadre européen", "idem"],
  ["heures|heure d’apprentissage", "volume horaire"],
  ["en [0-9]+ (mois|semaines|jours)|d’ici|dans un mois|en quelques", "délai"],
  ["équivalen|équivaut|correspond à un niveau", "équivalence"],
  ["vous serez|vous saurez|vous parlerez|vous pourrez", "promesse de résultat"],
  ["bilingue|fluide|couramment|à l’aise", "qualification de l’apprenant"],
  [
    "rapidement|facilement|sans effort|en un rien de temps",
    "promesse d’effort",
  ],
  ["garanti|assuré|promis|il suffit de", "garantie"],
  [
    "une bouche française|un francophone|l’oreille française|francophone",
    "phonétique française",
  ],
  ["niveau", "à examiner"],
  ["maîtrise|maîtriser", "à examiner"],
  ["capable de", "capacité globale"],
  ["débutant|intermédiaire|avancé", "étiquette de niveau"],
  ["autonome|vous débrouiller", "promesse d’autonomie"],
  ["prêt à|vous maîtrisez", "promesse de résultat"],
];

let totalNonNul = 0;
const lignesTouchees = new Set();
console.log(
  `portion balayée : ${n} lignes (« ## Dossier de production » en ligne ${n + 1}) ; fichier : ${lignes.length} lignes`,
);
for (const [m, quoi] of motifs) {
  const re = new RegExp(m, "gi");
  let c = 0;
  const ou = [];
  ecrans.forEach((l, i) => {
    const k = (l.match(re) ?? []).length;
    if (k) {
      c += k;
      ou.push(`${i + 1}`);
      lignesTouchees.add(i + 1);
    }
  });
  if (c) totalNonNul += c;
  console.log(
    `${String(c).padStart(2)} | ${quoi.padEnd(30)} | ${m}${c ? "  → lignes " + ou.join(", ") : ""}`,
  );
}
const nonNulles = motifs.filter(([m]) =>
  ecrans.some((l) => new RegExp(m, "i").test(l)),
).length;
console.log(
  `\nfamilles de motifs : ${motifs.length} | non nulles : ${nonNulles} | à 0 : ${motifs.length - nonNulles}`,
);
console.log(
  `occurrences non nulles : ${totalNonNul}, réparties sur ${lignesTouchees.size} lignes : ${[...lignesTouchees].sort((a, b) => a - b).join(", ")}`,
);

const ecransTxt = ecrans.join("\n");
const tout = lignes.join("\n");
console.log(
  "tirets cadratin/demi-cadratin, fichier entier :",
  (tout.match(/[—–]/g) ?? []).length,
);
console.log(
  "apostrophe droite, fichier entier :",
  (tout.match(/'/g) ?? []).length,
  "| sur les écrans :",
  (ecransTxt.match(/'/g) ?? []).length,
);
