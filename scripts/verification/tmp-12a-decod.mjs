import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const AUTH = "C:/Users/Selim/Documents/Thainaute/content/authoring";
const RUN = /[\u0E00-\u0E7F]+/g;

// 1. toutes les valeurs de champ `thai` publiees par les unites 1 a 11
const publies = new Set();
const publiesRuns = new Set();
for (let u = 1; u <= 11; u++) {
  const dir = join(AUTH, "unite-" + String(u).padStart(2, "0"));
  for (const f of readdirSync(dir)) {
    if (!/^lecon-.*\.md$/.test(f)) continue;
    const txt = readFileSync(join(dir, f), "utf8");
    for (const m of txt.matchAll(/^\s*-\s+`?thai`?\s*:\s*(.+)$/gm)) {
      const v = m[1].trim();
      publies.add(v);
      for (const p of v.split(/\s*\/\s*/)) {
        const q = p.replace(/\(.*?\)/g, "").trim();
        if (q) publies.add(q);
      }
      for (const r of v.matchAll(RUN)) publiesRuns.add(r[0]);
    }
  }
}
console.log(
  "valeurs `thai` publiees (u1-11), formes distinctes :",
  publies.size,
);

// 2. runs affiches par 12A sur ses ecrans
const lines = readFileSync(
  join(AUTH, "unite-12", "lecon-12a.md"),
  "utf8",
).split(/\r?\n/);
const i = (t) => lines.findIndex((l) => l === t);
const seg = (a, b) => lines.slice(a, b).join("\n");
const ecran =
  seg(i("## Enseignement"), i("## Items")) +
  "\n" +
  seg(i("## Exercices"), i("## SRS"));

// blocs affiches : lignes de citation "> **thai** · tr · fr", specimens, cartes
const runs = new Set();
for (const m of ecran.matchAll(RUN)) runs.add(m[0]);
console.log("runs thais affiches par 12A :", runs.size);

const inconnus = [...runs].filter((r) => !publiesRuns.has(r));
console.log(
  "\nruns AFFICHES qui n'apparaissent dans AUCUN champ `thai` des unites 1-11 :",
  inconnus.length,
);
for (const r of inconnus) console.log("  ", r);

// 3. blocs multi-runs affiches : reconstruits depuis les lignes de citation
const blocs = new Set();
for (const l of ecran.split("\n")) {
  for (const m of l.matchAll(/\*\*([^*]+)\*\*/g)) {
    const t = m[1].trim();
    if (RUN.test(t)) blocs.add(t);
    RUN.lastIndex = 0;
  }
}
console.log("\nblocs entre ** ** affiches :", blocs.size);
const blocsInconnus = [...blocs].filter((b) => !publies.has(b));
console.log(
  "blocs affiches NON publies tels quels comme champ `thai` :",
  blocsInconnus.length,
);
for (const b of blocsInconnus) console.log("  ", b);
