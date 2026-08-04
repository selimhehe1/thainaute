// Contrôle des champs d'item d'une leçon d'autorat : codepoints et fidélité de
// réemploi.
//
// POURQUOI CE SCRIPT EXISTE. Le contre-audit de `u09-l9e` du 2026-08-04 a
// produit deux findings bloquants qui viennent du même geste : décrire un item
// RÉEMPLOYÉ autrement que la leçon qui le publie, tout en écrivant « aucune
// divergence » à sa ligne de sources. Les deux ont été trouvés par une
// relecture humaine. Un troisième défaut, un champ `codepoints` qui factorisait
// deux graphies au lieu de donner les deux séquences, a été trouvé en écrivant
// ce script. Aucun outil du dépôt ne mesurait cela : `repo-thai-scan.mjs`
// compte des graphies, il ne compare pas les champs d'un item à ceux de son
// homonyme publié ailleurs.
//
// La règle de travail est donc : une leçon qui écrit « réemployé sans
// modification » ou « aucune divergence » le fait vérifier par CE script, ou
// elle ne l'écrit pas.
//
// DEUX CONTRÔLES, tous deux sans dépendance.
//
//   1. `codepoints` contre `thai`. Le champ `thai` peut porter plusieurs
//      graphies séparées par ` / ` ou ` · `. Le champ `codepoints` doit alors
//      donner AUTANT de séquences complètes, dans le même ordre. La séquence
//      attendue est recalculée en NFC depuis le champ `thai` lui-même, jamais
//      recopiée. Une notation factorisée du genre « <tronc>, puis <finale A> ou
//      <finale B> » est signalée : elle n'est pas recomputable graphie par
//      graphie, ce que le contrat d'item exige.
//
//   2. Fidélité de réemploi. Pour chaque item dont le TITRE porte une référence
//      de la forme `uXX-lYz`, la graphie du champ `thai` est cherchée dans le
//      fichier référencé, et les champs `ipa`, `ton`, `longueur`,
//      `transcription` et `codepoints` sont comparés. Une différence n'est pas
//      forcément une faute : la leçon d'origine peut écrire « courte » là où la
//      leçon citante écrit « brève », ou porter une parenthèse de motif. Le
//      script montre donc les deux valeurs et laisse l'arbitrage à l'humain,
//      au lieu de rendre un verdict qu'il ne peut pas fonder.
//
// Usage :
//   node scripts/verification/item-fields-check.mjs <fichier-lecon.md> [...]
//   node scripts/verification/item-fields-check.mjs --unite 9
//   node scripts/verification/item-fields-check.mjs --tout
//
// Sortie : une ligne par écart, puis un décompte. Code de sortie 1 si un champ
// `codepoints` est non conforme, 0 sinon ; les écarts de réemploi ne font pas
// échouer le script, ils sont à lire.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Analyse partagée avec le compilateur de contenu. Deux analyses séparées
// divergeraient, et l'une des deux finirait par mentir : c'est exactement ce
// qui s'est produit avec l'unité 1.
import {
  analyserItems,
  sequencePointsDeCode,
} from "../content/lib/parse-authoring.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");

const CHAMPS = ["ipa", "ton", "longueur", "transcription", "codepoints"];
const SEPARATEURS = /\s+\/\s+|\s+·\s+/;

const sequence = sequencePointsDeCode;

function items(chemin) {
  return analyserItems(readFileSync(chemin, "utf8"));
}

function parGraphie(chemin) {
  const index = new Map();
  for (const it of items(chemin)) index.set(it.thai, it);
  return index;
}

function fichierDeReference(ref) {
  const m = ref.match(/^u(\d\d)-l(\d)([a-e])$/);
  if (!m) return undefined;
  return join(AUTHORING, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
}

function controle(chemin) {
  const court = relative(ROOT, chemin).replace(/\\/g, "/");
  let malCodepoints = 0;
  let ecartsReemploi = 0;

  const lus = items(chemin);
  // Un contrôle qui ne trouve rien doit le DIRE. Jusqu'au 2026-08-04, cet
  // outil exigeait des backticks autour du nom de champ et ne voyait donc
  // aucun item de l'unité 1, écrite avant cette convention : il annonçait
  // « 0 faute » sur un ensemble vide. Le compte par fichier rend cet échec
  // silencieux impossible à répéter.
  console.log(`.. ${court} :: ${lus.length} items lus`);

  for (const it of lus) {
    // 1. codepoints contre thai
    const graphies = it.thai
      .split(SEPARATEURS)
      .map((g) => g.trim())
      .filter(Boolean);
    const attendues = graphies.map(sequence);
    const declarees = [
      ...(it.codepoints || "").matchAll(/U\+[0-9A-F]{4}(?: U\+[0-9A-F]{4})*/g),
    ].map((m) => m[0]);

    if (it.codepoints === undefined) {
      malCodepoints++;
      console.log(`!! ${court} :: ${it.titre}\n   champ \`codepoints\` absent`);
    } else if (
      declarees.length < attendues.length ||
      attendues.some((a, i) => declarees[i] !== a)
    ) {
      malCodepoints++;
      console.log(`!! ${court} :: ${it.titre}`);
      attendues.forEach((a, i) => {
        if (declarees[i] === a) return;
        console.log(`   graphie ${i + 1} : ${graphies[i]}`);
        console.log(`     recalculé : ${a}`);
        console.log(`     déclaré   : ${declarees[i] || "(manquant)"}`);
      });
    }

    // 2. fidélité de réemploi
    const refs = [...it.titre.matchAll(/u(\d\d)-l(\d)([a-e])/g)].map(
      (m) => m[0],
    );
    for (const ref of new Set(refs)) {
      const f = fichierDeReference(ref);
      if (f === undefined || !existsSync(f)) {
        console.log(
          `?? ${court} :: ${it.titre}\n   référence introuvable : ${ref}`,
        );
        continue;
      }
      const source = parGraphie(f);
      const origine = source.get(it.thai);
      if (origine === undefined) {
        console.log(
          `?? ${court} :: ${it.titre}\n   graphie absente de ${ref} : ${it.thai}`,
        );
        continue;
      }
      for (const c of CHAMPS) {
        if ((it[c] || "") === (origine[c] || "")) continue;
        ecartsReemploi++;
        console.log(
          `~~ ${court} :: ${it.titre}\n   champ \`${c}\` différent de ${ref}`,
        );
        console.log(`     ici    : ${it[c] || "(absent)"}`);
        console.log(`     ${ref} : ${origine[c] || "(absent)"}`);
      }
    }
  }

  return { malCodepoints, ecartsReemploi };
}

const argv = process.argv.slice(2);
let cibles = [];

if (argv.includes("--tout")) {
  for (const d of readdirSync(AUTHORING)) {
    const p = join(AUTHORING, d);
    if (!/^unite-\d\d$/.test(d)) continue;
    for (const f of readdirSync(p))
      if (/^lecon-.*\.md$/.test(f)) cibles.push(join(p, f));
  }
} else if (argv.includes("--unite")) {
  const n = String(argv[argv.indexOf("--unite") + 1]).padStart(2, "0");
  const p = join(AUTHORING, "unite-" + n);
  for (const f of readdirSync(p))
    if (/^lecon-.*\.md$/.test(f)) cibles.push(join(p, f));
} else {
  cibles = argv
    .filter((a) => !a.startsWith("--"))
    .map((a) => (existsSync(a) ? a : join(ROOT, a)));
}

if (cibles.length === 0) {
  console.error(
    "usage: node item-fields-check.mjs <lecon.md> | --unite <n> | --tout",
  );
  process.exit(2);
}

let mal = 0;
let ecarts = 0;
for (const c of cibles) {
  const r = controle(c);
  mal += r.malCodepoints;
  ecarts += r.ecartsReemploi;
}

console.log(`\nfichiers contrôlés        : ${cibles.length}`);
console.log(`champs codepoints en faute : ${mal}`);
console.log(`écarts de réemploi à lire  : ${ecarts}`);
process.exit(mal > 0 ? 1 : 0);
