// Variante de volubilis-lookup.mjs SANS AUCUNE TRONCATURE.
//
// POURQUOI CE SCRIPT EXISTE. `volubilis-lookup.mjs` annonce le nombre total de
// lignes trouvées, puis n'en affiche que CINQ (`hits.slice(0, 5)`) et n'affiche
// que les HUIT premières colonnes (`values.slice(0, 8)`), sans le dire dans la
// liste. Le contre-audit interne de `u11-l11e` du 2026-08-04 a montré ce que
// cela coûte : deux citations de plage étaient fausses (ต้น porte sept lignes
// et non cinq, เขา huit et non cinq) et une colonne décisive avait été perdue
// (la colonne `K` de นก, `NOMEN (fem, nickname) ; (THA)`, qui atteste la
// graphie comme surnom féminin). Un dossier qui lit la liste sans la comparer
// au total la prend pour complète.
//
// Tant que `volubilis-lookup.mjs` tronque en silence, TOUTE citation d'une
// plage de cinq lignes VOLUBILIS doit être refaite avec ce script. L'arbitrage
// correspondant est porté par `u11-l11e`, arbitrage 9 : le script versionné
// doit afficher tout, ou dire ce qu'il masque.
//
// Usage :
//   node scripts/verification/volubilis-lookup-full.mjs <VOLUBILIS_Database.xlsx> <graphie> [...]
//
// Même exemplaire, même empreinte et même piège PowerShell que le script
// d'origine, dont l'en-tête reste la référence.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath, ...words] = process.argv.slice(2);

const bytes = readFileSync(archivePath);
console.log(
  `octets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-full-"));
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
  const sharedXml = readFileSync(join(workDir, "xl", "sharedStrings.xml"), "utf8");
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

  const sheetXml = readFileSync(join(workDir, "xl", "worksheets", "sheet1.xml"), "utf8");
  const cells = new Map();
  for (const cell of sheetXml.matchAll(
    /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?/g,
  )) {
    const [, column, row, attributes, raw] = cell;
    if (raw === undefined) continue;
    const value = /t="s"/.test(attributes ?? "") ? (shared[Number(raw)] ?? "") : raw;
    if (value.trim() === "") continue;
    const key = Number(row);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(`${column}=${value}`);
  }
  console.log(`lignes non vides : ${cells.size}\n`);

  for (const word of words) {
    const target = word.normalize("NFC");
    const hits = [];
    for (const [row, values] of cells) {
      if (
        values.some(
          (value) => value.slice(value.indexOf("=") + 1).normalize("NFC") === target,
        )
      ) {
        hits.push({ row, values });
      }
    }
    hits.sort((left, right) => left.row - right.row);
    if (hits.length === 0) {
      console.log(`${target} : ABSENT`);
      continue;
    }
    console.log(`${target} : ${hits.length} ligne(s)  [TOUTES affichées]`);
    for (const hit of hits) {
      console.log(`  ligne ${hit.row} : ${hit.values.join(" | ")}`);
    }
    console.log("");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
