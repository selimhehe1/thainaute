// Paires minimales de ton du dépôt : contrôle du finding F2 de la vérification 12B.
// Fichier de travail, non versionné.

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
    if (thai && /^-\s*`?ton`?\s*:/m.test(joined)) {
      entries.push({
        thai,
        ton: field(joined, "ton"),
        transcription: field(joined, "transcription"),
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

const corpus = new Map(); // graphie -> {transcription, ton, files:[]}
for (const file of lessonFiles(1, 11)) {
  for (const e of entriesOf(readFileSync(file, "utf8"))) {
    if (!e.transcription) continue;
    const tr = e.transcription.replace(/`/g, "").trim();
    if (!corpus.has(e.thai)) {
      corpus.set(e.thai, { tr, ton: (e.ton ?? "").trim(), files: [] });
    }
    corpus.get(e.thai).files.push(file.replace(ROOT, "").replace(/\\/g, "/"));
  }
}

// Transcription privée de tout diacritique de ton.
const stripTon = (s) => s.normalize("NFD").replace(/[̀́̂̌]/g, "").normalize("NFC");

// Ton nommé, déduit du diacritique porté par la transcription.
function tonDe(tr) {
  const d = tr.normalize("NFD");
  if (d.includes("̀")) return "bas";
  if (d.includes("́")) return "haut";
  if (d.includes("̂")) return "descendant";
  if (d.includes("̌")) return "montant";
  return "moyen";
}

const mono = [...corpus.entries()].filter(
  ([g, v]) => /^[฀-๿]+$/.test(g) && !/[·\s]/.test(v.tr),
);

const buckets = new Map();
for (const [g, v] of mono) {
  const key = stripTon(v.tr);
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push({ g, ...v, tonDeduit: tonDe(v.tr) });
}

let toutes = [];
for (const [key, arr] of buckets) {
  if (arr.length < 2) continue;
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = i + 1; j < arr.length; j += 1) {
      if (arr[i].tonDeduit === arr[j].tonDeduit) continue;
      toutes.push({ key, a: arr[i], b: arr[j] });
    }
  }
}

const sansHo = toutes.filter(
  (p) => !p.a.g.includes("ห") && !p.b.g.includes("ห"),
);
console.log(
  `# paires monosyllabiques ne différant que par le ton : ${toutes.length}`,
);
console.log(`# dont aucun membre ne s'écrit avec un ห : ${sansHo.length}\n`);
for (const p of sansHo) {
  console.log(
    `${p.a.g} ${p.a.tr} (${p.a.tonDeduit})\t/\t${p.b.g} ${p.b.tr} (${p.b.tonDeduit})`,
  );
}

const mh = sansHo.filter(
  (p) =>
    (p.a.tonDeduit === "montant" && p.b.tonDeduit === "haut") ||
    (p.a.tonDeduit === "haut" && p.b.tonDeduit === "montant"),
);
console.log(`\n# restreint à montant contre haut, sans ห : ${mh.length}`);
for (const p of mh) console.log(`${p.a.g} ${p.a.tr}\t/\t${p.b.g} ${p.b.tr}`);

const mhTous = toutes.filter(
  (p) =>
    (p.a.tonDeduit === "montant" && p.b.tonDeduit === "haut") ||
    (p.a.tonDeduit === "haut" && p.b.tonDeduit === "montant"),
);
console.log(`\n# montant contre haut, ห autorisé : ${mhTous.length}`);
for (const p of mhTous)
  console.log(`${p.a.g} ${p.a.tr}\t/\t${p.b.g} ${p.b.tr}`);
