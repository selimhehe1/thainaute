// Recherche d'une graphie thaïe dans la base Volubilis, sans dépendance.
//
// Le classeur n'est pas versionné : ce script rend la citation
// REPRODUCTIBLE, ce qu'exige l'amendement v1.2 des conventions d'autorat.
// Deux consolidations avaient buté sur ce point, faute de pouvoir vérifier
// les citations d'un autre agent.
//
// Téléchargement (licence CC BY-SA 4.0, projet SourceForge « belisan ») :
//   https://master.dl.sourceforge.net/project/belisan-volubilis/VOLUBILIS_Database.xlsx?viasf=1
// Empreinte de la version employée le 3 août 2026 :
//   10 848 409 octets
//   sha256 b9ab74187a1c369d03bf1a0b94cdc0523edb77a4da72759ee85d81626a20fc0c
//
// Usage :
//   node scripts/verification/volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <mot> [...]
//
// PIÈGE ÉVITÉ : ne jamais faire transiter le XML par la sortie standard de
// PowerShell, dont la page de code détruit silencieusement le thaï. Les
// entrées du zip sont extraites vers des fichiers, puis lues en UTF-8.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath, ...words] = process.argv.slice(2);

if (archivePath === undefined || words.length === 0) {
  console.error(
    "usage: node volubilis-lookup.mjs <VOLUBILIS_Database.xlsx> <graphie> [graphie...]",
  );
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `fichier : ${archivePath}\noctets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-"));
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

  // Table des chaînes partagées : un xlsx stocke le texte hors de la feuille.
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

  // PIÈGE : l'attribut de type t="s" n'est pas collé au r= ; il faut
  // capturer tous les attributs puis les tester.
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

  for (const word of words) {
    const target = word.normalize("NFC");
    const hits = [];
    for (const [row, values] of cells) {
      if (
        values.some(
          (value) =>
            value.slice(value.indexOf("=") + 1).normalize("NFC") === target,
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
    console.log(`${target} : ${hits.length} ligne(s)`);
    for (const hit of hits.slice(0, 5)) {
      console.log(`  ligne ${hit.row} : ${hit.values.slice(0, 8).join(" | ")}`);
    }
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
