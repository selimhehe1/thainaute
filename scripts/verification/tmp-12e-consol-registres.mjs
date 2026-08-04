// Consolidation 12E — décompte indépendant des champs `registre` des sections ## Items.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";

function fichiers(maxU) {
  const out = [];
  for (const d of readdirSync(ROOT)) {
    const m = d.match(/^unite-(\d\d)$/);
    if (!m || Number(m[1]) > maxU) continue;
    for (const f of readdirSync(join(ROOT, d))) {
      if (/^lecon-.*\.md$/.test(f)) out.push(join(ROOT, d, f));
    }
  }
  return out.sort();
}

function champs(maxU) {
  const out = [];
  for (const f of fichiers(maxU)) {
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
      const m = l.match(/^\s*[-*]\s*`?registre`?\s*[:：]\s*(.+?)\s*$/i);
      if (m) out.push({ f, v: m[1] });
    }
  }
  return out;
}

for (const maxU of [11, 12]) {
  const c = champs(maxU);
  const has = (v, w) => new RegExp(w, "i").test(v);
  const prio = (v) =>
    has(v, "formel")
      ? "formel"
      : has(v, "familier")
        ? "familier"
        : has(v, "poli")
          ? "poli"
          : has(v, "neutre")
            ? "neutre"
            : "autre";
  const inv = (v) =>
    has(v, "neutre")
      ? "neutre"
      : has(v, "poli")
        ? "poli"
        : has(v, "familier")
          ? "familier"
          : has(v, "formel")
            ? "formel"
            : "autre";
  const cnt = (fn) =>
    c.reduce((a, x) => ((a[fn(x.v)] = (a[fn(x.v)] ?? 0) + 1), a), {});
  const deux = c.filter((x) => has(x.v, "neutre") && has(x.v, "poli"));
  console.log(`\n=== unités 1 à ${maxU} : ${c.length} champs registre ===`);
  console.log(
    "priorité formel>familier>poli>neutre :",
    JSON.stringify(cnt(prio)),
  );
  console.log(
    "priorité inverse                     :",
    JSON.stringify(cnt(inv)),
  );
  console.log(
    `champs portant À LA FOIS « neutre » et « poli » : ${deux.length}`,
  );
  if (maxU === 12) {
    console.log("  échantillon :");
    deux
      .slice(0, 6)
      .forEach((x) => console.log(`   ${x.f.replace(/.*[\\/]/, "")} — ${x.v}`));
    console.log("  hors cases :");
    c.filter((x) => prio(x.v) === "autre").forEach((x) =>
      console.log(`   ${x.f.replace(/.*[\\/]/, "")} — ${x.v}`),
    );
  }
}
