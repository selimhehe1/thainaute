// Consolidation 12E — mesure indépendante des dialogues du parcours.
// Lit TOUTES les sections ## Dialogue, quel que soit leur format (tableau ou liste).
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

function nettoie(s) {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function repliques(bloc) {
  const out = [];
  let format = null;
  for (const ligne of bloc) {
    const t = ligne.trim();
    if (t.startsWith("|") && t.endsWith("|")) {
      const cells = t
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c.replace(/\s/g, "")))) continue;
      for (const c of cells) {
        if (THAI.test(c)) {
          out.push({ texte: c, format: "tableau" });
          format = format ?? "tableau";
          break;
        }
      }
      continue;
    }
    const m = t.match(/^[-*]\s+\**(?:Tha[iï])\**\s*[:：]\s*(.+)$/i);
    if (m && THAI.test(m[1])) {
      out.push({ texte: m[1].trim(), format: "liste" });
      format = format ?? "liste";
      continue;
    }
    // Troisième format : « 1. Locuteur : <thaï> », réplique inline après le numéro
    // La partie capturée doit être PUREMENT thaïe : sinon c'est une étiquette de
    // locuteur en français qui contient un prénom thaï, pas une réplique.
    const q = t.match(/^\d+\.\s+[^:：]{0,80}[:：]\s*([฀-๿ ]+)$/);
    if (q && THAI.test(q[1])) {
      out.push({ texte: q[1].trim(), format: "numéroté" });
      format = format ?? "numéroté";
    }
  }
  return { out, format };
}

const res = [];
const parSection = [];
let nbSections = 0;
const parFormat = { tableau: 0, liste: 0, numéroté: 0, aucun: 0 };

for (const f of fichiers()) {
  const lignes = readFileSync(f, "utf8").split(/\r?\n/);
  let dans = false;
  let bloc = [];
  const flush = () => {
    if (!dans) return;
    nbSections += 1;
    const { out, format } = repliques(bloc);
    parFormat[format ?? "aucun"] += 1;
    for (const r of out) {
      const t = nettoie(r.texte);
      res.push({
        fichier: f,
        format: r.format,
        texte: t,
        signes: [...t].length,
        segments: t.split(/\s+/).filter(Boolean).length,
      });
    }
    parSection.push({
      fichier: f,
      format: format ?? "aucun",
      repliques: out.length,
    });
    dans = false;
    bloc = [];
  };
  for (const ligne of lignes) {
    if (/^##\s+Dialogue\b/.test(ligne)) {
      flush();
      dans = true;
      bloc = [];
      continue;
    }
    if (dans && /^##\s/.test(ligne)) {
      flush();
      continue;
    }
    if (dans) bloc.push(ligne);
  }
  flush();
}

console.log(`sections ## Dialogue : ${nbSections}`);
console.log(
  `  tableau : ${parFormat.tableau} | liste : ${parFormat.liste} | numéroté inline : ${parFormat["numéroté"]} | sans réplique : ${parFormat.aucun}`,
);
console.log(`répliques thaïes relevées : ${res.length}`);

const u11 = res.filter((r) => !/unite-12/.test(r.fichier));
const top = (a, n = 8) =>
  [...a].sort((x, y) => y.signes - x.signes).slice(0, n);
const show = (a) =>
  a.forEach((r) =>
    console.log(
      `  ${r.signes} signes / ${r.segments} segments — ${r.fichier} — ${r.texte}`,
    ),
  );

console.log("\n== TOUS FORMATS, unités 1 à 12 ==");
show(top(res));
console.log("\n== TOUS FORMATS, unités 1 à 11 ==");
show(top(u11));
console.log("\n== TABLEAUX SEULS, 1 à 12 ==");
show(
  top(
    res.filter((r) => r.format === "tableau"),
    4,
  ),
);
console.log("\n== TABLEAUX SEULS, 1 à 11 ==");
show(
  top(
    u11.filter((r) => r.format === "tableau"),
    4,
  ),
);

console.log("\n== dialogues les plus longs en répliques ==");
for (const s of [...parSection]
  .sort((a, b) => b.repliques - a.repliques)
  .slice(0, 8)) {
  console.log(`  ${s.repliques} répliques — ${s.fichier} (${s.format})`);
}
