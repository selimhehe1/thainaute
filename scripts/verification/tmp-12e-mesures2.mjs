import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "C:/Users/Selim/Documents/Thainaute";
const AUTH = join(ROOT, "content", "authoring");
function fichiers(min, max) {
  const out = [];
  for (let u = min; u <= max; u++) {
    const d = join(AUTH, "unite-" + String(u).padStart(2, "0"));
    let n;
    try {
      n = readdirSync(d);
    } catch {
      continue;
    }
    for (const f of n.sort())
      if (/^lecon-.*\.md$/.test(f)) out.push(join(d, f));
  }
  return out;
}
function section(t, nom) {
  const L = t.split(/\r?\n/);
  let dans = false;
  const o = [];
  for (const l of L) {
    if (/^##\s/.test(l)) {
      dans = new RegExp("^##\\s+" + nom).test(l);
      continue;
    }
    if (dans) o.push(l);
  }
  return o.join("\n");
}

// ---- REGISTRES, classification exclusive (première case qui matche)
for (const [min, max] of [
  [1, 11],
  [1, 12],
]) {
  const c = { neutre: 0, poli: 0, familier: 0, formel: 0, autre: 0 };
  let tot = 0;
  const multi = [];
  for (const f of fichiers(min, max)) {
    const s = section(readFileSync(f, "utf8"), "Items");
    for (const m of s.matchAll(/^-\s*`?registre`?\s*:\s*(.+)$/gm)) {
      tot++;
      const v = m[1].trim().toLowerCase();
      const hits = ["neutre", "poli", "familier", "formel"].filter((k) =>
        v.includes(k),
      );
      if (hits.length === 0) c.autre++;
      else {
        c[hits[0]]++;
        if (hits.length > 1)
          multi.push(f.split(/[\\/]/).pop() + " :: " + v.slice(0, 90));
      }
    }
  }
  console.log(`registres ${min}-${max} : total=${tot}`, JSON.stringify(c));
  if (min === 1 && max === 12) {
    console.log("  champs à cases multiples :", multi.length);
    multi.slice(0, 15).forEach((x) => console.log("   ", x));
  }
}

// ---- SRS : identifiants définis par une puce de la section SRS de sa PROPRE leçon
console.log("\n== SRS strict (id préfixé par la leçon elle-même) ==");
const parU = {};
let tot = 0;
const tousDefinis = new Set();
const tousCites = new Set();
for (const f of fichiers(1, 12)) {
  const base = f
    .split(/[\\/]/)
    .pop()
    .replace(/^lecon-|\.md$/g, "");
  const u = f.match(/unite-(\d\d)/)[1];
  const prefixe = `srs-u${u}-l${base}-`;
  const s = section(readFileSync(f, "utf8"), "SRS");
  const ids = new Set();
  for (const line of s.split(/\r?\n/)) {
    if (!/^\s*[-*]\s/.test(line)) continue;
    for (const m of line.matchAll(/`?(srs-[a-z0-9-]+)`?/g))
      if (m[1].startsWith(prefixe)) ids.add(m[1]);
  }
  parU[Number(u)] = (parU[Number(u)] || 0) + ids.size;
  tot += ids.size;
  ids.forEach((i) => tousDefinis.add(i));
  for (const m of readFileSync(f, "utf8").matchAll(/(srs-[a-z0-9-]+)/g))
    tousCites.add(m[1]);
}
console.log(JSON.stringify(parU), "total =", tot);
const orphelins = [...tousCites].filter((i) => !tousDefinis.has(i));
console.log("identifiants cités jamais définis :", orphelins.length);
console.log("   ", orphelins.join(", "));

// ---- DIALOGUES : format
console.log("\n== formats de dialogue ==");
let tableaux = 0,
  autres = 0;
const listeAutres = [];
for (const f of fichiers(1, 12)) {
  const t = readFileSync(f, "utf8");
  if (!/^##\s+Dialogue/m.test(t)) continue;
  const s = section(t, "Dialogue");
  const rows = s.split(/\r?\n/).filter((l) => /^\|/.test(l));
  if (rows.length > 2) tableaux++;
  else {
    autres++;
    listeAutres.push(f.split(/[\\/]/).pop());
  }
}
console.log("dialogues en tableau :", tableaux, "| autres :", autres);
console.log("   ", listeAutres.join(", "));

// ---- plus longue séquence thaïe dans TOUTE section Dialogue, tous formats
let best = { n: 0, f: "", s: "" },
  best11 = { n: 0, f: "", s: "" };
for (const f of fichiers(1, 12)) {
  const t = readFileSync(f, "utf8");
  if (!/^##\s+Dialogue/m.test(t)) continue;
  const u = Number(f.match(/unite-(\d\d)/)[1]);
  const s = section(t, "Dialogue");
  for (const m of s.matchAll(/[\u0E00-\u0E7F][\u0E00-\u0E7F\u0020ๆ]*/g)) {
    const str = m[0].trim();
    const n = [...str].length;
    if (n > best.n) best = { n, f: f.split(/[\\/]/).pop(), s: str };
    if (u <= 11 && n > best11.n)
      best11 = { n, f: f.split(/[\\/]/).pop(), s: str };
  }
}
console.log(
  "plus longue séquence thaïe en dialogue 1-12 :",
  JSON.stringify(best),
);
console.log(
  "plus longue séquence thaïe en dialogue 1-11 :",
  JSON.stringify(best11),
);

// ---- particule finale
const gr = new Set();
for (const f of fichiers(1, 12)) {
  const s = section(readFileSync(f, "utf8"), "Items");
  for (const b of s.split(/^#{3,4} /m)) {
    const th = b.match(/^-\s*`?thai`?\s*:\s*(\S.*?)\s*$/m);
    if (th && /^-\s*`?ton`?\s*:/m.test(b)) gr.add(th[1]);
  }
}
const part = [...gr].filter((g) => /(ครับ|ค่ะ|คะ|ครับ$)$/.test(g));
console.log("\ngraphies finissant par ครับ/ค่ะ/คะ :", part.length);

// ---- exercices recall : réponse contenant du thaï
console.log("\n== recall : blocs et réponses ==");
let nbRecall = 0,
  avecThai = [];
for (const f of fichiers(1, 12)) {
  const t = readFileSync(f, "utf8");
  const blocs = t.split(/^#{3,4}\s+Exercice /m).slice(1);
  for (const b of blocs) {
    if (!/^-\s*Mécanique\s*:\s*`recall`/m.test(b)) continue;
    nbRecall++;
    const rep = [...b.matchAll(/→\s*`([^`]+)`/g)].map((m) => m[1]);
    if (rep.some((r) => /[\u0E00-\u0E7F]/.test(r)))
      avecThai.push(f.split(/[\\/]/).pop() + " :: " + b.split("\n")[0]);
  }
}
console.log(
  "blocs recall :",
  nbRecall,
  "| réponses avec thaï :",
  avecThai.length,
);
avecThai.forEach((x) => console.log("   ", x));
