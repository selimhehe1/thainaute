// Relevé de rang dans la liste FrequencyWords (OpenSubtitles th, CC BY-SA 4.0)
// pour `u13-l13e`. Signal INDICATIF de naturalité orale, jamais une preuve de
// correction. Lit le fichier en UTF-8 par Node, jamais par un pipe shell, le
// piège de destruction silencieuse du thaï étant déjà consigné par la politique
// de sources.
//
// Usage :
//   node scripts/verification/tmp-13e-frequence.mjs <th_50k.txt> <graphie> [...]

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const [listPath, ...words] = process.argv.slice(2);
const bytes = readFileSync(listPath);
console.log(
  `fichier : ${listPath}\noctets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const lines = bytes
  .toString("utf8")
  .split(/\r?\n/)
  .filter((l) => l !== "");
console.log(`lignes : ${lines.length}\n`);

const rank = new Map();
lines.forEach((line, index) => {
  const [word, count] = line.split(" ");
  if (word !== undefined && !rank.has(word.normalize("NFC"))) {
    rank.set(word.normalize("NFC"), { rank: index + 1, count });
  }
});

for (const word of words) {
  const hit = rank.get(word.normalize("NFC"));
  console.log(
    hit === undefined
      ? `${word} : ABSENT de la liste`
      : `${word} : rang ${hit.rank} / ${lines.length}, ${hit.count} occurrences`,
  );
}
