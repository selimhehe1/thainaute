// Fidélité de réemploi sur les champs que `item-fields-check.mjs` NE contrôle
// PAS : `fr`, `litteral` et `registre`.
//
// POURQUOI CE SCRIPT EXISTE. `item-fields-check.mjs` compare `ipa`, `ton`,
// `longueur`, `transcription` et `codepoints`, et rien d'autre. Les leçons de
// bilan réemploient pourtant des items entiers et écrivent « repris sans
// modification » : les trois champs restants étaient donc comparés À LA MAIN,
// c'est-à-dire invérifiables par un autre agent. Le contre-audit interne de
// `u11-l11e` du 2026-08-04 a montré ce que ces trois champs peuvent cacher :
// le champ `fr` de คะ, réemployé de `u02-l2e`, porte un sens qu'aucune de ses
// sources ne donne. Le réemploi était fidèle ; c'est la source qui ne l'était
// pas. Sans comparaison mécanique, on ne peut même pas distinguer les deux cas.
//
// Même analyseur de champ et même règle de titre que `item-fields-check.mjs`.
// Une différence n'est pas forcément une faute : le script montre les deux
// valeurs et laisse l'arbitrage à l'humain.
//
// Usage :
//   node scripts/verification/item-fields-fr-check.mjs <fichier-lecon.md>
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const CHAMPS = ["fr", "litteral", "registre"];

function champ(bloc, nom) {
  const re = new RegExp(
    "(?:^|\\n)- `?" + nom + "`? ?: ?([\\s\\S]*?)(?=\\n- `|\\n#|\\n\\n|$)",
  );
  const m = bloc.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : undefined;
}

function items(chemin) {
  const texte = readFileSync(chemin, "utf8");
  const blocs = texte.split(/^#{3,4} /m).slice(1);
  const liste = [];
  for (const b of blocs) {
    const titre = b.split("\n")[0].trim();
    const thai = champ(b, "thai");
    if (thai === undefined) continue;
    const item = { titre, thai };
    for (const c of CHAMPS) item[c] = champ(b, c);
    liste.push(item);
  }
  return liste;
}

const cible = process.argv[2];
let ecarts = 0;
for (const it of items(cible)) {
  const refs = [...it.titre.matchAll(/u(\d\d)-l(\d)([a-e])/g)].map((m) => m[0]);
  for (const ref of new Set(refs)) {
    const m = ref.match(/^u(\d\d)-l(\d)([a-e])$/);
    const f = join(AUTHORING, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
    if (!existsSync(f)) { console.log(`?? ${ref} introuvable`); continue; }
    const src = new Map(items(f).map((x) => [x.thai, x]));
    const o = src.get(it.thai);
    if (o === undefined) { console.log(`?? ${it.thai} absent de ${ref}`); continue; }
    for (const c of CHAMPS) {
      if ((it[c] || "") === (o[c] || "")) continue;
      ecarts += 1;
      console.log(`~~ ${it.titre}\n   champ \`${c}\`\n   ici    : ${it[c] || "(absent)"}\n   ${ref} : ${o[c] || "(absent)"}`);
    }
  }
}
console.log(`\nécarts fr/litteral/registre : ${ecarts}`);
