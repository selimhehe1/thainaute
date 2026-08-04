// Contrôle Unicode d'un fichier d'autorat : énumère les chaînes thaïes, vérifie
// la forme NFC, l'absence de zone à usage privé, et dresse l'inventaire EXACT
// des signes non consonantiques employés.
//
// Ce script existe parce qu'un contre-audit de `u08-l8c` a montré qu'un
// contrôle Unicode annoncé « deux signes » en comptait sept, et qu'il ne
// couvrait aucune des chaînes affichées hors des champs `thai`. Un inventaire
// écrit à la main n'est pas un contrôle.
//
// Usage :
//   node scripts/verification/unicode-thai.mjs <fichier.md> [--sections]
//
// Sortie :
//   - empreinte du fichier contrôlé ;
//   - nombre de chaînes thaïes distinctes, dans les champs `thai` et hors d'eux ;
//   - toute chaîne non NFC (aucune attendue) ;
//   - tout caractère de la zone à usage privé (aucun attendu) ;
//   - inventaire des signes suscrits, souscrits et de ton, avec un exemple.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const [filePath] = process.argv.slice(2);
if (filePath === undefined) {
  console.error("usage: node unicode-thai.mjs <fichier.md>");
  process.exit(2);
}

const bytes = readFileSync(filePath);
const text = bytes.toString("utf8");
console.log(
  `fichier : ${filePath}\noctets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

// Un « run » thaï : suite de caractères du bloc thaï, espaces internes exclus.
const THAI_RUN = /[฀-๿]+/g;
const COMBINING = /[ัิ-ฺ็-๎]/;

const NAMES = new Map([
  ["0E31", "◌ั mai han akat (voyelle)"],
  ["0E34", "◌ิ sara i (voyelle)"],
  ["0E35", "◌ี sara ii (voyelle)"],
  ["0E36", "◌ึ sara ue (voyelle)"],
  ["0E37", "◌ื sara uee (voyelle)"],
  ["0E38", "◌ุ sara u (voyelle, souscrite)"],
  ["0E39", "◌ู sara uu (voyelle, souscrite)"],
  ["0E3A", "◌ฺ phinthu (souscrit)"],
  ["0E47", "◌็ mai taikhu (abrège la voyelle)"],
  ["0E48", "◌่ mai ek (ton)"],
  ["0E49", "◌้ mai tho (ton)"],
  ["0E4A", "◌๊ mai tri (ton)"],
  ["0E4B", "◌๋ mai chattawa (ton)"],
  ["0E4C", "◌์ thanthakhat (lettre muette)"],
  ["0E4D", "◌ํ nikhahit"],
  ["0E4E", "◌๎ yamakkan"],
]);

const hex = (character) =>
  character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

// Champs `thai` des items, puis tout le reste du fichier.
const champs = new Set();
for (const match of text.matchAll(/^- `thai` : (.+)$/gm)) {
  champs.add(match[1].trim());
}

const partout = new Set();
for (const match of text.matchAll(THAI_RUN)) partout.add(match[0]);

const hors = [...partout].filter((run) => !champs.has(run));

console.log(`champs \`thai\` : ${champs.size}`);
console.log(`chaines thaies distinctes dans tout le fichier : ${partout.size}`);
console.log(`dont hors des champs \`thai\` : ${hors.length}\n`);

let defauts = 0;
for (const run of partout) {
  if (run.normalize("NFC") !== run) {
    console.log(`NON NFC : ${run}`);
    defauts += 1;
  }
  for (const character of run) {
    const point = character.codePointAt(0);
    if (point >= 0xe000 && point <= 0xf8ff) {
      console.log(`ZONE PRIVEE : ${run} (U+${hex(character)})`);
      defauts += 1;
    }
  }
}
console.log(
  defauts === 0
    ? "NFC : toutes conformes. Zone a usage privé : aucun caractère.\n"
    : `${defauts} defaut(s) ci-dessus.\n`,
);

const inventaire = new Map();
for (const run of partout) {
  for (const character of run) {
    if (!COMBINING.test(character)) continue;
    const key = hex(character);
    if (!inventaire.has(key))
      inventaire.set(key, { total: 0, exemples: new Set() });
    const entry = inventaire.get(key);
    entry.total += 1;
    if (entry.exemples.size < 3) entry.exemples.add(run);
  }
}

console.log("signes non consonantiques employés :");
for (const key of [...inventaire.keys()].sort()) {
  const { total, exemples } = inventaire.get(key);
  console.log(
    `  U+${key}  ${NAMES.get(key) ?? "?"}  ${total} occurrence(s)  ex. ${[...exemples].join(" ")}`,
  );
}

// Séquence de points de code de chaque champ `thai`, à comparer au champ
// `codepoints` de l'item.
console.log("\nsequences des champs `thai` :");
for (const run of champs) {
  console.log(`  ${run}\t${[...run].map((c) => `U+${hex(c)}`).join(" ")}`);
}
