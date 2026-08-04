import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const AUTH = "C:/Users/Selim/Documents/Thainaute/content/authoring";
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
function itemsSec(t) {
  const L = t.split(/\r?\n/);
  let dans = false;
  const o = [];
  for (const l of L) {
    if (/^##\s/.test(l)) {
      dans = /^##\s+Items\s*$/.test(l);
      continue;
    }
    if (dans) o.push(l);
  }
  return o.join("\n");
}
function champs(min, max) {
  const v = [];
  for (const f of fichiers(min, max)) {
    const s = itemsSec(readFileSync(f, "utf8"));
    for (const m of s.matchAll(/^-\s*`?registre`?\s*:\s*(.+)$/gm))
      v.push({ f: f.split(/[\\/]/).pop(), v: m[1].trim().toLowerCase() });
  }
  return v;
}
for (const [a, b] of [
  [1, 11],
  [1, 12],
]) {
  const V = champs(a, b);
  for (const ordre of [
    ["neutre", "poli", "familier", "formel"],
    ["poli", "formel", "familier", "neutre"],
    ["formel", "familier", "poli", "neutre"],
  ]) {
    const c = { neutre: 0, poli: 0, familier: 0, formel: 0, autre: 0 };
    for (const x of V) {
      const h = ordre.find((k) => x.v.includes(k));
      if (h) c[h]++;
      else c.autre++;
    }
    console.log(
      `${a}-${b} ordre[${ordre[0]}...] total=${V.length}`,
      JSON.stringify(c),
    );
  }
  // premier mot du champ
  const c2 = { neutre: 0, poli: 0, familier: 0, formel: 0, autre: 0 };
  for (const x of V) {
    const w = x.v.replace(/^\*+/, "").match(/^[a-zàâçéèêëîïôûùüÿñæœ]+/);
    const k = w ? w[0] : "";
    if (c2[k] !== undefined) c2[k]++;
    else c2.autre++;
  }
  console.log(`${a}-${b} premier mot`, JSON.stringify(c2));
}
console.log("\n== champs contenant 'formel' (1-12) ==");
for (const x of champs(1, 12))
  if (x.v.includes("formel")) console.log("  ", x.f, "::", x.v.slice(0, 120));
console.log("\n== champs contenant 'familier' (1-12) ==");
for (const x of champs(1, 12))
  if (x.v.includes("familier")) console.log("  ", x.f, "::", x.v.slice(0, 120));
