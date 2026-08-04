// Balayage par SOUS-CHAÎNE de la colonne THA de VOLUBILIS, pour la leçon 13B.
//
// POURQUOI. `volubilis-lookup.mjs` ne fait qu'une comparaison EXACTE de
// cellule. Le dossier de `u11-l11a` a montré qu'une base qui range deux
// orthographes dans une même cellule (« ช้า ๆ = ช้าๆ ») rend alors ABSENT
// pour une graphie pourtant présente. La leçon 13B a le même besoin sur
// นะ, dont les combinaisons avec les particules de politesse peuvent être
// rangées de la même façon.
//
// Usage :
//   node scripts/verification/tmp-13b-volubilis-na.mjs <VOLUBILIS_Database.xlsx> <motif> [...]
//
// Affiche TOUTES les lignes dont une cellule CONTIENT le motif, sans
// troncature de lignes ni de colonnes.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath, ...patterns] = process.argv.slice(2);

if (archivePath === undefined || patterns.length === 0) {
  console.error("usage: node tmp-13b-volubilis-na.mjs <xlsx> <motif> [...]");
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `octets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-13b-"));
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
      if (
        values.some((value) =>
          value
            .slice(value.indexOf("=") + 1)
            .normalize("NFC")
            .includes(target),
        )
      ) {
        hits.push({ row, values });
      }
    }
    hits.sort((left, right) => left.row - right.row);
    console.log(`« ${target} » en SOUS-CHAÎNE : ${hits.length} ligne(s)`);
    for (const hit of hits) {
      console.log(`  ligne ${hit.row} : ${hit.values.join(" | ")}`);
    }
    console.log("");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
