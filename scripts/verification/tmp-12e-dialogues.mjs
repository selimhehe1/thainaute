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
function sec(t, nom) {
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
const res = [];
for (const f of fichiers(1, 12)) {
  const t = readFileSync(f, "utf8");
  if (!/^##\s+Dialogue/m.test(t)) continue;
  const s = sec(t, "Dialogue");
  const lignes = s.split(/\r?\n/);
  // format tableau
  const rows = lignes.filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l));
  const tableau = rows.length > 1;
  let repliques = 0;
  const thaiCells = [];
  if (tableau) {
    for (const r of rows.slice(1)) {
      const cells = r.split("|").map((c) => c.trim());
      const th = cells.find((c) => /[\u0E00-\u0E7F]/.test(c));
      if (th) {
        repliques++;
        thaiCells.push(th);
      }
    }
  } else {
    for (const l of lignes) {
      const m = l.match(/^\s*-\s*Tha[iï]\s*:\s*(.+)$/);
      if (m) {
        repliques++;
        thaiCells.push(m[1].trim());
      }
    }
  }
  const maxc = thaiCells.reduce(
    (a, c) => ([...c].length > a.n ? { n: [...c].length, s: c } : a),
    { n: 0, s: "" },
  );
  res.push({
    f: f.split(/[\\/]/).pop(),
    u: Number(f.match(/unite-(\d\d)/)[1]),
    tableau,
    repliques,
    max: maxc.n,
    s: maxc.s,
  });
}
console.log("sections ## Dialogue :", res.length);
console.log("en tableau :", res.filter((r) => r.tableau).length);
console.log("en liste   :", res.filter((r) => !r.tableau).length);
console.log("\ntop répliques :");
res
  .sort((a, b) => b.repliques - a.repliques)
  .slice(0, 8)
  .forEach((r) =>
    console.log(
      `  ${r.f} ${r.tableau ? "tab" : "lst"} ${r.repliques} répliques`,
    ),
  );
console.log("\ntop longueur de réplique thaïe (1-12) :");
res
  .sort((a, b) => b.max - a.max)
  .slice(0, 8)
  .forEach((r) => console.log(`  ${r.f} u${r.u} ${r.max} : ${r.s}`));
console.log("\ntop longueur, unités 1-11 :");
res
  .filter((r) => r.u <= 11)
  .sort((a, b) => b.max - a.max)
  .slice(0, 6)
  .forEach((r) => console.log(`  ${r.f} u${r.u} ${r.max} : ${r.s}`));
console.log("\ndialogues sans réplique détectée :");
res.filter((r) => r.repliques === 0).forEach((r) => console.log("  ", r.f));
