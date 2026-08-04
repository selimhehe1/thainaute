// Contrôles de consolidation de `lecon-12b.md`. Fichier de travail, non versionné.
// Convention d'entrée reprise à l'identique de repo-thai-scan.mjs.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

function lessonFiles(minUnit, maxUnit) {
  const files = [];
  for (let unit = minUnit; unit <= maxUnit; unit += 1) {
    const dir = join(AUTHORING, `unite-${String(unit).padStart(2, "0")}`);
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names.sort()) {
      if (/^lecon-.*\.md$/.test(name)) files.push(join(dir, name));
    }
  }
  return files;
}

// Entrées : blocs de `## Items` portant à la fois `thai` et `ton`.
// On renvoie aussi transcription, ton, longueur, fr quand ils existent.
function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let inItems = false;
  let block = [];

  const field = (joined, name) => {
    const m = joined.match(
      new RegExp(`^-\\s*\`?${name}\`?\\s*:\\s*(\\S.*?)\\s*$`, "m"),
    );
    return m ? m[1] : null;
  };

  const flush = () => {
    if (block.length === 0) return;
    const joined = block.join("\n");
    const thai = field(joined, "thai");
    const ton = field(joined, "ton");
    if (thai && /^-\s*`?ton`?\s*:/m.test(joined)) {
      entries.push({
        thai,
        ton,
        transcription: field(joined, "transcription"),
        longueur: field(joined, "longueur"),
        fr: field(joined, "fr"),
      });
    }
    block = [];
  };

  for (const line of lines) {
    if (/^##\s/.test(line)) {
      flush();
      inItems = /^##\s+Items\s*$/.test(line);
      continue;
    }
    if (!inItems) continue;
    if (/^#{3,}\s/.test(line)) {
      flush();
      continue;
    }
    block.push(line);
  }
  flush();
  return entries;
}

const rel = (f) => f.replace(ROOT, "").replace(/\\/g, "/");

// ---------------------------------------------------------------- unités 1-11
const corpus = new Map(); // graphie -> [{file, transcription, ton, longueur, fr}]
for (const file of lessonFiles(1, 11)) {
  const text = readFileSync(file, "utf8");
  for (const e of entriesOf(text)) {
    if (!corpus.has(e.thai)) corpus.set(e.thai, []);
    corpus.get(e.thai).push({ file: rel(file), ...e });
  }
}
console.log(`# unités 1 à 11 : ${corpus.size} graphies distinctes`);

// ---------------------------------------------------------------- unité 12
console.log("\n# unité 12, fichier par fichier");
const u12 = new Map();
for (const file of lessonFiles(12, 12)) {
  const text = readFileSync(file, "utf8");
  const es = entriesOf(text);
  console.log(`${rel(file)} : ${es.length} entrée(s)`);
  for (const e of es) {
    if (!u12.has(e.thai)) u12.set(e.thai, []);
    u12.get(e.thai).push({ file: rel(file), ...e });
  }
}
console.log(`unité 12 : ${u12.size} graphies distinctes`);

console.log("\n# croisement unité 12 contre unités 1 à 11");
let neuves = 0;
let redecl = 0;
let divergentes = 0;
for (const [g, decls] of u12) {
  const origine = corpus.get(g);
  if (!origine) {
    neuves += 1;
    console.log(`NEUVE   ${g}   (${decls.map((d) => d.file).join(", ")})`);
    continue;
  }
  redecl += 1;
  const trs = new Set(
    [...origine, ...decls].map((d) => (d.transcription ?? "").trim()),
  );
  const flag = trs.size === 1 ? "IDENTIQUE" : "DIVERGENTE";
  if (trs.size !== 1) divergentes += 1;
  console.log(
    `REDECL  ${g}\t${flag}\t{${[...trs].join(" | ")}}\torigine ${origine
      .map((o) => o.file)
      .join(", ")}`,
  );
}
console.log(
  `\nredéclarées ${redecl}, neuves ${neuves}, transcriptions divergentes ${divergentes}`,
);

// ---------------------------------------------------------------- identifiants SRS
const srsRe = /srs-u\d{2}-l\d{1,2}[a-z]-\d{2}/g;
function srsScan(minU, maxU) {
  const all = new Set();
  const defs = new Set();
  for (const file of lessonFiles(minU, maxU)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.match(srsRe) ?? []) all.add(m);
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*-\s*`?(srs-u\d{2}-l\d{1,2}[a-z]-\d{2})`?\s*:/);
      if (m) defs.add(m[1]);
    }
  }
  return { all, defs };
}
const s111 = srsScan(1, 11);
const s112 = srsScan(1, 12);
console.log(
  `\n# identifiants SRS distincts : unités 1 à 11 = ${s111.all.size} (dont ${s111.defs.size} lignes de définition) ; unités 1 à 12 = ${s112.all.size} (dont ${s112.defs.size})`,
);
