// Croisement graphie -> transcription sur les unités 1 à 11.
// Consolidation du 2026-08-04, écrit pour recontrôler le chiffre publié par 12A.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const AUTH = "C:/Users/Selim/Documents/Thainaute/content/authoring";
const unites = readdirSync(AUTH).filter((d) =>
  /^unite-(0[1-9]|1[01])$/.test(d),
);
const par = new Map();

for (const u of unites) {
  for (const f of readdirSync(join(AUTH, u)).filter((n) =>
    /^lecon-.*\.md$/.test(n),
  )) {
    const ls = readFileSync(join(AUTH, u, f), "utf8").split(/\r?\n/);
    let thai = null;
    for (const l of ls) {
      if (/^### Item /.test(l)) thai = null;
      const mt = l.match(/^-\s+`thai`\s*:\s*(.+)$/);
      if (mt) thai = mt[1].trim();
      const mr = l.match(/^-\s+`transcription`\s*:\s*(.+)$/);
      if (mr && thai) {
        const key = thai;
        if (!par.has(key)) par.set(key, new Map());
        const m = par.get(key);
        const tr = mr[1].trim();
        if (!m.has(tr)) m.set(tr, []);
        m.get(tr).push(`${u}/${f}`);
      }
    }
  }
}

console.log("graphies portant `thai` ET `transcription` :", par.size);
let div = 0;
for (const [g, m] of par) {
  if (m.size > 1) {
    div += 1;
    console.log("DIVERGENCE", g, JSON.stringify([...m.entries()]));
  }
}
console.log("divergences :", div);
