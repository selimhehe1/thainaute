// Inventaire des entrées VOLUBILIS dont la colonne THA se TERMINE par นะ.
//
// POURQUOI. La leçon 13B doit choisir ses items parmi des combinaisons
// RÉELLEMENT attestées, et non parmi celles qui lui arrangent. Ce script
// rend l'inventaire complet, de sorte que le choix soit contrôlable et que
// les combinaisons écartées le soient sur pièce.
//
// Usage :
//   node scripts/verification/tmp-13b-volubilis-fin-na.mjs <VOLUBILIS_Database.xlsx>

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath] = process.argv.slice(2);
if (archivePath === undefined) {
  console.error("usage: node tmp-13b-volubilis-fin-na.mjs <xlsx>");
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `octets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-finna-"));
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
    if (!cells.has(key)) cells.set(key, new Map());
    cells.get(key).set(column, value);
  }
  console.log(`lignes non vides : ${cells.size}\n`);

  const rows = [...cells.entries()].sort((a, b) => a[0] - b[0]);
  let count = 0;
  for (const [row, map] of rows) {
    const tha = (map.get("E") ?? "").normalize("NFC");
    if (tha === "") continue;
    const variants = tha
      .split(/[;=]/)
      .map((piece) => piece.trim())
      .filter((piece) => piece !== "");
    if (!variants.some((piece) => piece.endsWith("นะ"))) continue;
    count += 1;
    const cols = ["A", "C", "E", "F", "G", "H", "I", "K", "M"]
      .filter((c) => map.has(c))
      .map((c) => `${c}=${map.get(c)}`)
      .join(" | ");
    console.log(`  ligne ${row} : ${cols}`);
  }
  console.log(`\nTOTAL entrées THA finissant par นะ : ${count}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
