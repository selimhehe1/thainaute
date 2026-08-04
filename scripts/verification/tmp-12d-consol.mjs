// Contrôles de consolidation de `lecon-12d.md`, 2026-08-04.
// Reprend la convention d'entrée de `repo-thai-scan.mjs` sans la modifier.

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

function entriesOf(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let inItems = false;
  let block = [];
  const flush = () => {
    if (block.length === 0) return;
    const joined = block.join("\n");
    const thai = joined.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    const ton = /^-\s*`?ton`?\s*:/m.test(joined);
    if (thai && ton) entries.push(thai[1]);
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

const short = (f) => f.replace(ROOT, "").replace(/\\/g, "/");

console.log("# 1. Entrées par fichier, unité 12");
for (const f of lessonFiles(12, 12)) {
  const text = readFileSync(f, "utf8");
  console.log(
    `${short(f)}\tentrées ${entriesOf(text).length}\tU+0E4A ${
      (text.match(/๊/g) ?? []).length
    }\tU+0E4B ${(text.match(/๋/g) ?? []).length}`,
  );
}

console.log("\n# 2. lecon-12d.md, signes de ton en texte entier");
const d = readFileSync(join(AUTHORING, "unite-12", "lecon-12d.md"), "utf8");
for (const [nom, ch] of [
  ["U+0E48 ไม้เอก", "่"],
  ["U+0E49 ไม้โท", "้"],
  ["U+0E4A ไม้ตรี", "๊"],
  ["U+0E4B ไม้จัตวา", "๋"],
  ["tiret cadratin U+2014", "—"],
  ["tiret demi-cadratin U+2013", "–"],
  ["apostrophe droite U+0027", "'"],
]) {
  console.log(`${nom} : ${(d.match(new RegExp(ch, "g")) ?? []).length}`);
}
console.log(`NFC stable : ${d === d.normalize("NFC")}`);

console.log(
  "\n# 3. Exercices word_order des unités 1 à 11 : blocs `ครับ`/`ค่ะ`/`คะ` par tirage",
);
const partRe = /^(ครับ|ค่ะ|คะ|ครับ\/ค่ะ)$/;
for (const f of lessonFiles(1, 11)) {
  const text = readFileSync(f, "utf8");
  const sections = text.split(/^### /m);
  for (const sec of sections) {
    if (!/Mécanique\s*:\s*`word_order`/.test(sec)) continue;
    const titre = sec.split("\n")[0];
    for (const line of sec.split(/\r?\n/)) {
      const blocs = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
      if (blocs.length === 0) continue;
      const nbPart = blocs.filter((b) => partRe.test(b.trim())).length;
      if (nbPart >= 3) {
        console.log(
          `${short(f)}\t${titre}\tparticules ${nbPart}\t${line.trim().slice(0, 120)}`,
        );
      }
    }
  }
}
console.log(
  "(aucune ligne ci-dessus = aucun tirage word_order à 3 particules)",
);

console.log(
  "\n# 4. Corrigés `recall` des unités 1 à 11 portant 3 khráp/khâ/khá",
);
let nbRecall = 0;
for (const f of lessonFiles(1, 11)) {
  const text = readFileSync(f, "utf8");
  for (const sec of text.split(/^### /m)) {
    if (!/Mécanique\s*:\s*`recall`/.test(sec)) continue;
    nbRecall += 1;
    const titre = sec.split("\n")[0];
    for (const m of sec.matchAll(/`([^`\n]*kh[rá âa]*[^`\n]*)`/g)) {
      const rep = m[1];
      const n = (rep.match(/kh(ráp|â|á)\b/g) ?? []).length;
      if (n >= 3) console.log(`${short(f)}\t${titre}\t${n}\t${rep}`);
    }
  }
}
console.log(`exercices recall balayés : ${nbRecall}`);
