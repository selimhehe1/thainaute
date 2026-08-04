#!/usr/bin/env node
// Que sait-on compiler, et que faut-il arbitrer ?
//
// Pourquoi ce script existe
// -------------------------
// Le compilateur ne doit publier que ce qu'il sait représenter FIDÈLEMENT.
// Tout le reste doit être visible, compté et nommé, pas silencieusement
// approché. Ce rapport donne l'état exact du corpus face aux schémas, unité
// par unité, et il est reproductible : c'est lui qui décide du périmètre
// d'une tranche de compilation, pas une impression.
//
// Usage :
//   node scripts/content/coverage-report.mjs
//   node scripts/content/coverage-report.mjs --unite 1
//   node scripts/content/coverage-report.mjs --detail

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { analyserItems, graphies } from "./lib/parse-authoring.mjs";
import { decouperItem, formesDuChamp } from "./lib/ipa-thai.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");

/**
 * Verdict d'un item. « compilable » signifie que chaque champ requis par le
 * schéma se dérive mécaniquement et se vérifie ; tout autre verdict nomme
 * précisément ce qui manque.
 */
export function verdictItem(item) {
  const g = graphies(item.thai ?? "");
  const { famille, formes } = formesDuChamp(item.ipa);

  if (formes.length === 0) return { statut: "refus", motif: "aucune IPA" };
  if (formes.some((forme) => decouperItem(forme) === null)) {
    return { statut: "refus", motif: `${famille} non découpable` };
  }
  // Choisir entre une forme standard et une variante familière, ou décider
  // si un bloc composé fait un item ou deux, sont des décisions
  // éditoriales. Le compilateur les signale, il ne les prend pas.
  if (famille === "variante") {
    return { statut: "arbitrage", motif: "variante à trancher" };
  }
  if (famille === "compose") {
    return { statut: "arbitrage", motif: "bloc composé à trancher" };
  }
  if (famille === "separees" && formes.length !== g.length) {
    return {
      statut: "arbitrage",
      motif: `${g.length} graphies pour ${formes.length} IPA`,
    };
  }
  if (!g.every((graphie) => graphie.propre)) {
    return { statut: "arbitrage", motif: "graphie décorée" };
  }
  return { statut: "compilable", motif: famille };
}

function lecons(filtreUnite) {
  const sortie = [];
  for (const dossier of readdirSync(AUTHORING).filter((nom) =>
    /^unite-\d\d$/u.test(nom),
  )) {
    if (filtreUnite !== null && dossier !== `unite-${filtreUnite}`) continue;
    for (const fichier of readdirSync(join(AUTHORING, dossier)).filter((nom) =>
      /^lecon-.*\.md$/u.test(nom),
    )) {
      sortie.push({
        dossier,
        fichier,
        chemin: join(AUTHORING, dossier, fichier),
      });
    }
  }
  return sortie;
}

function main() {
  const args = process.argv.slice(2);
  const detail = args.includes("--detail");
  const index = args.indexOf("--unite");
  const filtre = index >= 0 ? String(args[index + 1]).padStart(2, "0") : null;

  const motifs = new Map();
  const parUnite = new Map();
  const aArbitrer = [];

  for (const { dossier, fichier, chemin } of lecons(filtre)) {
    const compte = parUnite.get(dossier) ?? { compilable: 0, total: 0 };
    for (const item of analyserItems(readFileSync(chemin, "utf8"))) {
      const { statut, motif } = verdictItem(item);
      compte.total += 1;
      if (statut === "compilable") compte.compilable += 1;
      else {
        const cle = `${statut} : ${motif}`;
        motifs.set(cle, (motifs.get(cle) ?? 0) + 1);
        aArbitrer.push(
          `${dossier.slice(6)}/${fichier.slice(6, 9)} ${item.thai} :: ${motif}`,
        );
      }
    }
    parUnite.set(dossier, compte);
  }

  let compilable = 0;
  let total = 0;
  console.log("unité       compilable   couverture");
  for (const [dossier, compte] of parUnite) {
    compilable += compte.compilable;
    total += compte.total;
    const pourcent = Math.round((compte.compilable / compte.total) * 100);
    console.log(
      `${dossier}   ${String(compte.compilable).padStart(3)}/${String(compte.total).padStart(3)}      ${String(pourcent).padStart(3)} %`,
    );
  }

  console.log("");
  console.log(
    `TOTAL : ${compilable}/${total} items compilables (${Math.round((compilable / total) * 100)} %)`,
  );

  if (motifs.size > 0) {
    console.log("\nà arbitrer, par motif :");
    for (const [cle, nombre] of [...motifs.entries()].sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`  ${String(nombre).padStart(3)}  ${cle}`);
    }
  }

  if (detail) {
    console.log("\ndétail :");
    for (const ligne of aArbitrer) console.log(`  ${ligne}`);
  }
}

main();
