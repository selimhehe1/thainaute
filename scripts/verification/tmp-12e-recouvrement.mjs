import { readFileSync } from "node:fs";
const D = "C:/Users/Selim/Documents/Thainaute/content/authoring/unite-12/";
function sec(t, nom) {
  const L = t.split(/\r?\n/);
  let d = false;
  const o = [];
  for (const l of L) {
    if (/^##\s/.test(l)) {
      d = l
        .replace(/^##\s+/, "")
        .trim()
        .startsWith(nom);
      continue;
    }
    if (d) o.push(l);
  }
  return o.join("\n");
}
function gr(f) {
  const s = sec(readFileSync(D + f, "utf8"), "Exercices");
  const S = new Set();
  for (const m of s.matchAll(/[\u0E00-\u0E7F]+/g)) S.add(m[0]);
  return S;
}
const E = gr("lecon-12e.md");
console.log("graphies distinctes dans ## Exercices de 12E :", E.size);
for (const f of [
  "lecon-12a.md",
  "lecon-12b.md",
  "lecon-12c.md",
  "lecon-12d.md",
]) {
  const G = gr(f);
  const inter = [...E].filter((x) => G.has(x));
  console.log(f, "| graphies:", G.size, "| communes avec 12E :", inter.length);
}
