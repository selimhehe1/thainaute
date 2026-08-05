#!/usr/bin/env node
// Combien de blocs d'exercices le corpus perd-il a l'extraction, et pourquoi ?
//
// Pourquoi cet outil existe
// -------------------------
// Le compilateur signale les blocs refuses lecon par lecon, ce qui rend le
// total invisible : on voit « un bloc refuse » soixante-cinq fois, jamais
// « 267 blocs sur 297 ». La premiere mesure a montre que 90 % du travail
// pedagogique ecrit n'arrivait pas jusqu'a l'application.
//
// Le classement des causes est ce qui rend l'outil utile : il dit ou porter
// l'effort. La premiere execution a designe deux causes purement
// structurelles (feedback qualifie, consigne qualifiee) qui a elles seules
// bloquaient 188 blocs, sans que le contenu soit en cause.
//
// Usage :
//   node scripts/content/mesurer-extraction-exercices.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const B = new URL("lib/", import.meta.url).href;
const P = await import(B + "parse-authoring.mjs");
const X = await import(B + "extraire-exercices.mjs");
const AUTHORING = join(import.meta.dirname, "..", "..", "content", "authoring");

let total = 0,
  ok = 0;
const causes = new Map();
const parMecanique = new Map();

for (const u of readdirSync(AUTHORING).filter((x) => /^unite-\d\d$/u.test(x))) {
  for (const f of readdirSync(join(AUTHORING, u))
    .filter((x) => /^lecon-/u.test(x))
    .sort()) {
    const texte = readFileSync(join(AUTHORING, u, f), "utf8");
    const meta = P.analyserMeta(texte);
    if (!meta.identifiant) continue;
    const items = P.analyserItems(texte);
    const connues = new Set(
      items.map((i) => String(i.thai ?? i.champs?.thai ?? "")),
    );
    // Resolveur permissif : on ne mesure pas les items manquants ici, on
    // mesure la capacite de l'extracteur a LIRE le bloc.
    const resoudre = (g) => (connues.has(g) ? `fake-${g}` : null);

    for (const bloc of P.analyserBlocsExercice(texte)) {
      total += 1;
      const meca = bloc.mecanique ?? "?";
      if (!parMecanique.has(meca)) parMecanique.set(meca, { total: 0, ko: 0 });
      parMecanique.get(meca).total += 1;
      let r;
      try {
        r = X.extraireBloc(bloc, resoudre);
      } catch (e) {
        r = { ok: false, motif: `exception: ${e.message}` };
      }
      if (r?.ok) {
        ok += 1;
        continue;
      }
      parMecanique.get(meca).ko += 1;
      // On normalise la cause pour regrouper.
      const brut = String(r?.motif ?? r?.erreur ?? "inconnue");
      const cle = brut
        .replace(/tirage \d+/u, "tirage N")
        .replace(/pour .+$/u, "pour <graphie>")
        .replace(/« .*? »/u, "« … »")
        .slice(0, 78);
      causes.set(cle, (causes.get(cle) ?? 0) + 1);
    }
  }
}

console.log(`blocs d'exercices ecrits : ${total}`);
console.log(`extraits  : ${ok}  (${((ok / total) * 100).toFixed(1)} %)`);
console.log(
  `refuses   : ${total - ok}  (${(((total - ok) / total) * 100).toFixed(1)} %)`,
);

console.log("\n--- par mecanique ---");
for (const [m, s] of [...parMecanique].sort((a, b) => b[1].ko - a[1].ko)) {
  console.log(
    `  ${String(m).padEnd(14)} ${String(s.total).padStart(4)} ecrits, ${String(s.ko).padStart(4)} refuses  (${((s.ko / s.total) * 100).toFixed(0)} %)`,
  );
}

console.log("\n--- causes, les plus frequentes d'abord ---");
for (const [c, n] of [...causes].sort((a, b) => b[1] - a[1]).slice(0, 18)) {
  console.log(`  ${String(n).padStart(4)}  ${c}`);
}
