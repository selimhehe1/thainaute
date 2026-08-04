// Consolidation 12E — décodabilité et forme.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/authoring";
const CIBLE = "content/authoring/unite-12/lecon-12e.md";

// 1. corpus publié par les unités 1 à 11 : graphies entières et fragments de cellule composite
const publiees = new Set();
for (const d of readdirSync(ROOT)) {
  const m = d.match(/^unite-(\d\d)$/);
  if (!m || Number(m[1]) > 11) continue;
  for (const f of readdirSync(join(ROOT, d))) {
    if (!/^lecon-.*\.md$/.test(f)) continue;
    const lignes = readFileSync(join(ROOT, d, f), "utf8").split(/\r?\n/);
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
      const t = l.match(/^\s*[-*]\s*`?thai`?\s*[:：]\s*(.+?)\s*$/i);
      if (!t) continue;
      const brut = t[1].trim();
      publiees.add(brut);
      for (const p of brut.split(/\s*[/·]\s*/)) {
        const g = p.replace(/\([^)]*\)/g, "").trim();
        if (g) publiees.add(g);
      }
    }
  }
}
// répliques de dialogue des unités 1 à 11, employées telles quelles
for (const d of readdirSync(ROOT)) {
  const m = d.match(/^unite-(\d\d)$/);
  if (!m || Number(m[1]) > 11) continue;
  for (const f of readdirSync(join(ROOT, d))) {
    if (!/^lecon-.*\.md$/.test(f)) continue;
    const lignes = readFileSync(join(ROOT, d, f), "utf8").split(/\r?\n/);
    let dans = false;
    for (const l of lignes) {
      if (/^##\s+Dialogue\b/.test(l)) {
        dans = true;
        continue;
      }
      if (/^##\s(?!#)/.test(l)) {
        dans = false;
        continue;
      }
      if (!dans) continue;
      const t = l.trim().match(/^[-*]\s+\**Tha[iï]\**\s*[:：]\s*(.+)$/i);
      if (t) publiees.add(t[1].trim());
      if (l.trim().startsWith("|"))
        for (const c of l.trim().slice(1, -1).split("|")) {
          const g = c.trim();
          if (/[฀-๿]/.test(g)) publiees.add(g);
        }
    }
  }
}

// 2. graphies d'écran de 12E
const lignes = readFileSync(CIBLE, "utf8").split(/\r?\n/);
const n = lignes.findIndex((l) => /^## Dossier de production\s*$/.test(l));
const ecrans = lignes.slice(0, n).join("\n");
const vues = new Set();
for (const m of ecrans.matchAll(/[฀-๿]+(?:\s+ๆ)?(?:\s+[฀-๿]+)*/g))
  vues.add(m[0].trim());

const EXCEPTIONS = new Set(["เ", "แ", "โ", "ใ", "ไ", "ไม้จัตวา"]);
const inconnues = [...vues].filter(
  (g) => !publiees.has(g) && !EXCEPTIONS.has(g),
);
console.log("graphies d’écran :", vues.size);
console.log(
  "non publiées par les unités 1 à 11, hors exceptions déclarées :",
  inconnues.length,
);
inconnues.forEach((g) => console.log("   ", g));

// 3. transcription v1.1 : pas de é, è, eu, oû
const NOYAU = /[éè]|\beu\b|oû/;
const suspects = [];
lignes.forEach((l, i) => {
  if (
    NOYAU.test(
      l.replace(/[A-Za-zÀ-ÿ]*[éè][A-Za-zÀ-ÿ]*/g, (w) =>
        /^[a-z·]+$/i.test(w) && !/^(?:é|è)/.test(w) ? w : "",
      ),
    )
  ) {
  }
});
const codeFence = /`([^`]+)`/g;
const mauvais = [];
for (const m of readFileSync(CIBLE, "utf8").matchAll(codeFence)) {
  const t = m[1];
  if (!/^[a-zA-Zàâäéèêëîïôöùûüçǎǐǒǔāēīōūáíóúàìòùâîôûǎ·\s]+$/.test(t)) continue;
  if (/[éè]|oû|(^|[^a-z])eu([^a-z]|$)/.test(t)) mauvais.push(t);
}
console.log(
  "\ntranscriptions entre guillemets obliques employant é, è, eu ou oû :",
  mauvais.length,
  mauvais.join(" | "),
);
