// Dépouille la feuille `Codes` du classeur Volubilis, celle qui donne la clé
// des abréviations et des marqueurs de ton employés par la colonne ThaiPhon.
//
// Ce script existe parce qu'un contre-audit de `u08-l8c` a montré qu'une leçon
// citait la feuille `Codes` du classeur `.xlsx`, où elle n'existe PAS : le
// `.xlsx` ne porte qu'une feuille, `Volubilis`. La clé est dans l'exemplaire
// `.ods`, qui en porte trois. Une citation irreproductible est une citation
// fausse, au sens de l'amendement v1.2 des conventions d'autorat.
//
// Téléchargement (licence CC BY-SA 4.0, projet SourceForge « belisan ») :
//   https://sourceforge.net/projects/belisan/files/
// Empreinte de l'exemplaire employé le 2026-08-04 :
//   15 724 718 octets
//   sha256 bb9c5da574a92a6add867b85713860caebfd90188fc51ff335c083a204a094cc
//
// Usage :
//   node scripts/verification/volubilis-codes.mjs <VOLUBILIS.ods> [filtre]
//
// Sans filtre, la feuille entière est affichée. Avec un filtre, seules les
// lignes qui le contiennent le sont : `TONES`, `adj.`, `adv.`, `v.`...
//
// PIÈGE ÉVITÉ, le même que pour le `.xlsx` : ne jamais faire transiter le XML
// par la sortie standard de PowerShell, dont la page de code détruit
// silencieusement le thaï.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const argv = process.argv.slice(2);
const sheetArg = argv.find((a) => a.startsWith("--feuille="));
const feuilleVoulue = sheetArg ? sheetArg.slice("--feuille=".length) : "Codes";
const [archivePath, filtre] = argv.filter((a) => !a.startsWith("--feuille="));
if (archivePath === undefined) {
  console.error(
    "usage: node volubilis-codes.mjs <VOLUBILIS.ods> [filtre] [--feuille=Codes|Romanization|Volubilis]",
  );
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `fichier : ${archivePath}\noctets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-codes-"));
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

  const xml = readFileSync(join(workDir, "content.xml"), "utf8");
  const feuilles = [
    ...xml.matchAll(/<table:table [^>]*table:name="([^"]*)"/g),
  ].map((match) => match[1]);
  console.log(`feuilles : ${feuilles.join(" | ")}\n`);

  const debut = xml.indexOf(`table:name="${feuilleVoulue}"`);
  if (debut < 0) {
    console.log(`feuille \`${feuilleVoulue}\` : ABSENTE de cet exemplaire`);
    process.exit(1);
  }
  const sheet = xml.slice(debut, xml.indexOf("</table:table>", debut));

  // Les entrées sont citées par leur CLÉ, jamais par un numéro de ligne : le
  // format ODS compresse les lignes répétées, et une numérotation dérivée du
  // XML ne correspondrait pas à celle d'un tableur.
  for (const [row] of sheet.matchAll(
    /<table:table-row[\s\S]*?<\/table:table-row>/g,
  )) {
    const cells = [
      ...row.matchAll(
        /<table:table-cell[^>]*>([\s\S]*?)<\/table:table-cell>|<table:table-cell[^>]*\/>/g,
      ),
    ].map((match) =>
      (match[1] ?? "")
        .replace(/<[^>]+>/g, "")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .trim(),
    );
    const ligne = cells.filter((cell) => cell !== "").join(" | ");
    if (ligne === "") continue;
    if (filtre === undefined || ligne.includes(filtre))
      console.log(`  ${ligne}`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
