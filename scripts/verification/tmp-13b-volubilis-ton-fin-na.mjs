// Ton porté par la finale นะ dans VOLUBILIS, MESURÉ et non trié.
//
// POURQUOI CE SCRIPT EXISTE. Le dossier de `u13-l13b` affirmait, à partir
// d'un filtrage à la main de la sortie de `tmp-13b-volubilis-fin-na.mjs`,
// que les entrées finissant par la particule นะ « portent toutes ¯na, ton
// haut, sans exception ». Le contre-audit interne du 2026-08-04 a montré
// que cette phrase était CIRCULAIRE : le filtre retenait les lignes dont le
// jeton final est `¯na`, puis constatait que le jeton final est `¯na`. Il a
// montré en outre que la liste citée incluait โชคดีนะ, qui est précisément
// la seule ligne de l'inventaire dont VOLUBILIS ne marque PAS la finale.
//
// CE QUE CE SCRIPT MESURE À LA PLACE. Le filtre ne porte plus sur le ton.
// Il retient les lignes dont la colonne `ThaiPhon` SÉPARE la finale นะ en
// un jeton distinct, quel que soit son marqueur de ton, c'est-à-dire un
// jeton final de la forme `na` éventuellement précédé d'un des cinq
// marqueurs de la section TONES de la feuille `Codes` : `-` moyen, `¯`
// haut, `_` bas, `/` montant, `\` descendant. La répartition des marqueurs
// est ensuite COMPTÉE. Le résultat corrobore ou infirme le ton de l'item 1
// sans le supposer.
//
// APPARIEMENT DES VARIANTES. Une cellule peut porter plusieurs variantes
// séparées par `;` ou `=`, dans la colonne thaïe comme dans la colonne
// phonétique. Quand les deux cellules en portent le même nombre, elles sont
// appariées rang par rang et seule la variante thaïe finissant par นะ est
// mesurée ; sinon la cellule phonétique est prise en bloc et c'est son
// dernier jeton qui est lu. Les deux cas sont comptés séparément.
//
// ฐานะ EST ÉCARTÉ DU CONSTAT, ET COMPTÉ À PART. Dans ฐานะ, « statut », la
// syllabe finale นะ appartient au mot et n'est pas la particule. VOLUBILIS
// la transcrit pourtant elle aussi en jeton séparé. Ces lignes sont donc
// isolées, sans quoi le décompte mélangerait deux faits distincts.
//
// Usage :
//   node scripts/verification/tmp-13b-volubilis-ton-fin-na.mjs <VOLUBILIS_Database.xlsx>

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [archivePath] = process.argv.slice(2);
if (archivePath === undefined) {
  console.error("usage: node tmp-13b-volubilis-ton-fin-na.mjs <xlsx>");
  process.exit(2);
}

const bytes = readFileSync(archivePath);
console.log(
  `octets  : ${bytes.length}\nsha256  : ${createHash("sha256").update(bytes).digest("hex")}\n`,
);

const TONE_LABEL = new Map([
  ["-", "moyen"],
  ["¯", "haut"],
  ["_", "bas"],
  ["/", "montant"],
  ["\\", "descendant"],
  ["", "AUCUN MARQUEUR"],
]);

const workDir = mkdtempSync(join(tmpdir(), "volubilis-tonfinna-"));
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

  const split = (cell) =>
    cell
      .split(/[;=]/)
      .map((piece) => piece.trim())
      .filter((piece) => piece !== "");

  const rows = [...cells.entries()].sort((a, b) => a[0] - b[0]);

  let finNa = 0; // colonne thaïe finissant par นะ
  let sansPhon = 0; // aucune colonne ThaiPhon
  let nonSepare = 0; // ThaiPhon ne sépare pas la finale
  let apparie = 0;
  let enBloc = 0;
  const parTon = new Map();
  const detail = [];
  const thana = [];

  for (const [row, map] of rows) {
    const tha = (map.get("E") ?? "").normalize("NFC");
    if (tha === "") continue;
    const thaVariants = split(tha);
    const indexNa = thaVariants.findIndex((piece) => piece.endsWith("นะ"));
    if (indexNa === -1) continue;
    finNa += 1;

    const phon = map.get("C") ?? "";
    if (phon.trim() === "") {
      sansPhon += 1;
      continue;
    }
    const phonVariants = split(phon);
    let cible;
    if (phonVariants.length === thaVariants.length) {
      cible = phonVariants[indexNa];
      apparie += 1;
    } else {
      cible = phonVariants[phonVariants.length - 1];
      enBloc += 1;
    }

    const tokens = (cible ?? "").split(/\s+/).filter((t) => t !== "");
    const last = tokens[tokens.length - 1] ?? "";
    const match = /^([-¯_/\\]?)na$/.exec(last);
    if (match === null) {
      nonSepare += 1;
      continue;
    }
    const marker = match[1] ?? "";
    parTon.set(marker, (parTon.get(marker) ?? 0) + 1);

    const graphie = thaVariants[indexNa] ?? "";
    const ligne = `ligne ${row} : E=${tha} | C=${phon}`;
    if (graphie.endsWith("ฐานะ")) thana.push(ligne);
    else detail.push({ marker, graphie, ligne });
  }

  const separe = [...parTon.values()].reduce((a, b) => a + b, 0);
  console.log(`entrées dont la colonne thaïe finit par นะ : ${finNa}`);
  console.log(`  sans colonne ThaiPhon, non mesurables    : ${sansPhon}`);
  console.log(
    `  avec colonne ThaiPhon, mesurables        : ${apparie + enBloc}`,
  );
  console.log(`    dont variantes appariées rang à rang   : ${apparie}`);
  console.log(`    dont cellule phonétique prise en bloc  : ${enBloc}`);
  console.log(`  ThaiPhon ne séparant PAS la finale       : ${nonSepare}`);
  console.log(`  ThaiPhon séparant la finale en jeton     : ${separe}`);

  console.log(`\n# répartition des marqueurs de ton sur ces ${separe} finales`);
  for (const [marker, count] of [...parTon.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(
      `  « ${marker === "" ? "(rien)" : marker}na » ${TONE_LABEL.get(marker) ?? "?"} : ${count}`,
    );
  }

  console.log(
    `\n# dont composés de ฐานะ, où นะ est une syllabe du mot et non la particule : ${thana.length}`,
  );
  for (const l of thana) console.log(`  ${l}`);

  const particules = detail;
  const hautes = particules.filter((d) => d.marker === "¯");
  console.log(
    `\n# finales นะ hors ฐานะ : ${particules.length}, dont ${hautes.length} marquées ¯ (haut)`,
  );
  const autres = particules.filter((d) => d.marker !== "¯");
  console.log(`# celles qui ne portent PAS ¯ : ${autres.length}`);
  for (const d of autres) {
    console.log(
      `  marqueur « ${d.marker === "" ? "(rien)" : d.marker} » -> ${d.ligne}`,
    );
  }
  console.log(`\n# les ${hautes.length} lignes marquées ¯na, hors ฐานะ`);
  for (const d of hautes) console.log(`  ${d.ligne}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
