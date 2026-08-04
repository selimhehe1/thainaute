// Balayage des cellules de la colonne THA (E) de VOLUBILIS qui SE TERMINENT par
// une graphie donnée. Sert aux particules finales, que ni la comparaison exacte
// ni le balayage par sous-chaîne ne dépouillent proprement (สิ est contenu dans
// สิบ, dix, et dans des dizaines de composés).
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
const workDir = mkdtempSync(join(tmpdir(), "vol-end-"));
try {
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Add-Type -AssemblyName System.IO.Compression.FileSystem;[System.IO.Compression.ZipFile]::ExtractToDirectory('${archivePath.replaceAll("'", "''")}','${workDir.replaceAll("'", "''")}')`,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  const shared = [];
  const sharedXml = readFileSync(
    join(workDir, "xl", "sharedStrings.xml"),
    "utf8",
  );
  for (const item of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(
      [...(item[1] ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
        .map((m) => m[1] ?? "")
        .join("")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">"),
    );
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
  for (const word of words) {
    const target = word.normalize("NFC");
    const hits = [];
    for (const [row, values] of cells) {
      const tha = values.find((v) => v.startsWith("E="));
      if (tha === undefined) continue;
      const s = tha.slice(2).normalize("NFC").trim();
      if (s.endsWith(target)) hits.push({ row, values, s });
    }
    hits.sort((a, b) => a.row - b.row);
    console.log(
      `### colonne E se terminant par « ${target} » : ${hits.length} ligne(s)`,
    );
    for (const hit of hits)
      console.log(`  ligne ${hit.row} : ${hit.values.join(" | ")}`);
    console.log("");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
