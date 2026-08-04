// Consolidation 12E — graphies du parcours se terminant par une particule finale.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";
const PART = ["ครับ", "ค่ะ", "คะ", "ครับผม", "จ้ะ", "ฮะ"];

function fichiers() {
  const out = [];
  for (const d of readdirSync(ROOT)) {
    if (!/^unite-\d\d$/.test(d)) continue;
    for (const f of readdirSync(join(ROOT, d))) {
      if (/^lecon-.*\.md$/.test(f)) out.push(join(ROOT, d, f));
    }
  }
  return out.sort();
}

const graphies = new Map(); // graphie -> {f, fr}
for (const f of fichiers()) {
  const lignes = readFileSync(f, "utf8").split(/\r?\n/);
  let dans = false;
  let courant = null;
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
    const t = l.match(/^\s*[-*]\s*`?thai`?\s*[:：]\s*(.+?)\s*$/i);
    if (t) {
      courant = t[1].trim();
      if (!graphies.has(courant)) graphies.set(courant, { f, fr: "" });
      continue;
    }
    const fr = l.match(/^\s*[-*]\s*`?fr`?\s*[:：]\s*(.+?)\s*$/i);
    if (fr && courant && graphies.get(courant) && !graphies.get(courant).fr)
      graphies.get(courant).fr = fr[1].trim();
  }
}

console.log("graphies distinctes relevées :", graphies.size);
const fin = [...graphies.entries()].filter(([g]) =>
  PART.some((p) => g.trim().endsWith(p)),
);
console.log("graphies se terminant par une particule finale :", fin.length);
const seules = fin.filter(
  ([g]) =>
    PART.some((p) => g.trim() === p) ||
    /^[\s·/]*(?:ครับ|ค่ะ|คะ)(?:[\s·/]+(?:ครับ|ค่ะ|คะ))*[\s·/]*$/.test(g.trim()),
);
console.log(
  "\ndont la graphie EST une particule (ou une paire de particules) :",
  seules.length,
);
seules.forEach(([g, v]) =>
  console.log(`   ${g}  —  ${v.f.replace(/.*[\\/]/, "")}  —  ${v.fr}`),
);
console.log("\nliste complète des", fin.length, ":");
fin.forEach(([g, v]) =>
  console.log(`   ${g}  —  ${v.f.replace(/.*[\\/]/, "")}`),
);
