// Consolidation 12E — exercices `recall` du parcours et nature de la réponse attendue.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";
const THAI = /[฀-๿]/;

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

let total = 0;
const parPolitique = { latin: [], chiffres: [], tuiles: [], autre: [] };

for (const f of fichiers()) {
  const txt = readFileSync(f, "utf8");
  const lignes = txt.split(/\r?\n/);
  // découpe en blocs d'exercice : titres ### à l'intérieur de ## Exercices
  let dansEx = false;
  let bloc = null;
  const blocs = [];
  for (const l of lignes) {
    if (/^##\s+Exercices?\b/i.test(l)) {
      dansEx = true;
      continue;
    }
    if (/^##\s/.test(l) && !/^###/.test(l)) {
      if (bloc) {
        blocs.push(bloc);
        bloc = null;
      }
      dansEx = false;
      continue;
    }
    if (!dansEx) continue;
    if (/^###\s/.test(l)) {
      if (bloc) blocs.push(bloc);
      bloc = { titre: l, lignes: [] };
      continue;
    }
    if (bloc) bloc.lignes.push(l);
  }
  if (bloc) blocs.push(bloc);

  for (const b of blocs) {
    const corps = b.lignes.join("\n").replace(/\s+/g, " ");
    if (!/M[ée]canique\s*:\s*`recall`/.test(corps)) continue;
    total += 1;
    const id = `${f.replace(/.*[\\/]/, "")} — ${b.titre.replace(/^###\s*/, "").slice(0, 48)}`;
    if (/alphabet latin uniquement/i.test(corps)) parPolitique.latin.push(id);
    else if (/chiffres arabes uniquement/i.test(corps))
      parPolitique.chiffres.push(id);
    else if (/tuile/i.test(corps)) parPolitique.tuiles.push(id);
    else parPolitique.autre.push(id);
  }
}

console.log(`exercices \`recall\` du parcours : ${total}`);
for (const [k, v] of Object.entries(parPolitique)) {
  console.log(`\n-- ${k} : ${v.length}`);
  v.forEach((x) => console.log("   ", x));
}
