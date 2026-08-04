// Consolidation 12E — mesures de corpus de la partie 2.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";

function fichiers(min, max) {
  const out = [];
  for (const d of readdirSync(ROOT)) {
    const m = d.match(/^unite-(\d\d)$/);
    if (!m) continue;
    const u = Number(m[1]);
    if (u < min || u > max) continue;
    for (const f of readdirSync(join(ROOT, d)))
      if (/^lecon-.*\.md$/.test(f)) out.push([u, join(ROOT, d, f)]);
  }
  return out.sort((a, b) => a[1].localeCompare(b[1]));
}

function entrees(min, max) {
  const out = [];
  for (const [u, f] of fichiers(min, max)) {
    const lignes = readFileSync(f, "utf8").split(/\r?\n/);
    let dans = false;
    for (const l of lignes) {
      if (/^##\s+Items?\b/i.test(l)) {
        dans = true;
        continue;
      }
      if (/^##\s(?!#)/.test(l)) {
        dans = false;
        continue;
      }
      if (!dans) continue;
      const m = l.match(/^\s*[-*]\s*`?thai`?\s*[:：]\s*(.+?)\s*$/i);
      if (m) out.push({ u, f, g: m[1].trim() });
    }
  }
  return out;
}

const e12 = entrees(1, 12);
const g12 = new Set(e12.map((x) => x.g));
console.log(
  "entrées 1 à 12 :",
  e12.length,
  "| graphies distinctes :",
  g12.size,
);
console.log("redéclarations (entrées - graphies) :", e12.length - g12.size);
console.log(
  "graphies portant une espace U+0020 :",
  [...g12].filter((g) => g.includes(" ")).length,
);
console.log(
  "graphies dont le champ thai porte deux formes séparées (/ ou ·) :",
  [...g12].filter((g) => /\s[/·]\s/.test(g)).length,
);
const sansComposite = [...g12].filter((g) => !/[(/·]/.test(g));
const maxLen = Math.max(...sansComposite.map((g) => [...g].length));
console.log(
  "graphie la plus longue hors notation composite :",
  maxLen,
  "points de code,",
  sansComposite.filter((g) => [...g].length === maxLen).length,
  "ex aequo :",
  sansComposite.filter((g) => [...g].length === maxLen).join(" "),
);

// graphies nouvelles par unité
const vues = new Set();
const nouv = {};
for (const x of e12) {
  if (!vues.has(x.g)) {
    vues.add(x.g);
    nouv[x.u] = (nouv[x.u] ?? 0) + 1;
  }
}
console.log(
  "graphies nouvelles par unité :",
  Array.from({ length: 12 }, (_, i) => nouv[i + 1] ?? 0).join(", "),
);
