// Balayage par SOUS-CHAÎNE de la colonne thaïe de VOLUBILIS, pour `u13-l13e`.
//
// POURQUOI CE SCRIPT EXISTE. `volubilis-lookup.mjs` et sa variante `-full`
// comparent la cellule ENTIÈRE à la graphie cherchée. Une particule finale ne
// se cherche pas ainsi : นะคะ n'est pas une vedette de la base, mais la base
// contient des locutions qui se TERMINENT par นะคะ, et ces locutions sont la
// seule corroboration indépendante de la forme que le dictionnaire normatif
// imprime à son entrée « คะ ». Le piège est le même que celui consigné par
// `u11-l11a` pour `ช้า ๆ` : une recherche exacte rend ABSENT et laisse croire
// que la base ignore la forme.
//
// Usage :
//   node scripts/verification/tmp-13e-volubilis-sous-chaine.mjs <xlsx> <motif> [...]
//
// Affiche, pour chaque motif, TOUTES les lignes dont une cellule CONTIENT le
// motif, avec le numéro de ligne à citer. Aucune troncature.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath, ...patterns] = process.argv.slice(2);

const bytes = readFileSync(archivePath);
console.log(
  `octets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-sub-"));
try {
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Add-Type -AssemblyName System.IO.Compression.FileSystem;` +
        `[System.IO.Compression.ZipFile]::ExtractToDirectory(` +
        `'${archivePath.replaceAll("'", "''")}','${workDir.replaceAll("'", "''")}')`,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const shared = [];
  const sharedXml = readFileSync(
    join(workDir, "xl", "sharedStrings.xml"),
    "utf8",
  );
  for (const item of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const text = [...(item[1] ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
      .map((match) => match[1] ?? "")
      .join("")
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">");
    shared.push(text);
  }
  console.log(`chaines partagees : ${shared.length}`);

  const sheetXml = readFileSync(
    join(workDir, "xl", "worksheets", "sheet1.xml"),
    "utf8",
  );
  const cells = new Map();
  for (const cell of sheetXml.matchAll(
    /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?/g,
  )) {
    const [, column, row, attributes, raw] = cell;
    if (raw === undefined) continue;
    const value = /t="s"/.test(attributes ?? "")
      ? (shared[Number(raw)] ?? "")
      : raw;
    if (value.trim() === "") continue;
    const key = Number(row);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(`${column}=${value}`);
  }
  console.log(`lignes non vides : ${cells.size}\n`);

  for (const pattern of patterns) {
    const target = pattern.normalize("NFC");
    const hits = [];
    for (const [row, values] of cells) {
      const thai = values.find((value) => value.startsWith("E="));
      if (thai === undefined) continue;
      if (thai.slice(2).normalize("NFC").includes(target)) {
        hits.push({ row, values });
      }
    }
    hits.sort((left, right) => left.row - right.row);
    console.log(
      `sous-chaîne « ${target} » en colonne E : ${hits.length} ligne(s)  [TOUTES affichées]`,
    );
    for (const hit of hits) {
      console.log(`  ligne ${hit.row} : ${hit.values.join(" | ")}`);
    }
    console.log("");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
