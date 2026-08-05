#!/usr/bin/env node
// Un son est-il EXIGE par une leçon avant d'être ENSEIGNE ?
//
// Pourquoi cet outil existe
// -------------------------
// Un curriculum de langue se relit dans l'ordre où il a été écrit, ce qui
// masque une faute que personne ne voit à la lecture : un son apparaît dans
// le vocabulaire d'une leçon bien avant la leçon qui apprend à le produire.
// L'apprenant installe alors une prononciation fausse sur ses phrases les
// plus fréquentes, et devra la désapprendre.
//
// Le cas qui a motivé l'outil : /ɯ/ est enseigné à l'unité 6, mais il est
// exigé dès l'unité 2 par ชื่อ (« nom »), c'est-à-dire par la phrase
// « je m'appelle … », l'une des toutes premières qu'un débutant produit.
//
// Ce que l'outil ne fait pas
// --------------------------
// Il ne tranche pas. Certains écarts sont délibérés : les marques de ton
// écrites apparaissent dès l'unité 1 alors que l'écriture est enseignée à
// l'unité 7, parce que l'unité 1 travaille l'oreille et dit explicitement de
// ne pas retenir la graphie. L'outil signale, un humain décide.
//
// Usage :
//   node scripts/content/verifier-dette-phonetique.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { analyserMeta, analyserItems } from "./lib/parse-authoring.mjs";

const RACINE = join(import.meta.dirname, "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");

/**
 * Les difficultés suivies, avec la leçon qui en a la charge.
 *
 * `delibere` marque les écarts assumés, qui sont affichés mais ne comptent
 * pas comme dette.
 */
const DIFFICULTES = [
  {
    nom: "/ɯ/ (le français dit /y/)",
    motif: /[ึื]/u,
    enseignee: "u06-l6a",
  },
  {
    nom: "/ɤ/ (le français dit /ø/)",
    motif: /เ[ก-ฮ][ั-ฺ]*อ/u,
    enseignee: "u06-l6a",
  },
  { nom: "/pʰ/ soufflé", motif: /[พผภ]/u, enseignee: "u02-l2a" },
  { nom: "/tʰ/ soufflé", motif: /[ทถธฒฑฐ]/u, enseignee: "u03-l3a" },
  { nom: "/kʰ/ soufflé", motif: /[คขฆ]/u, enseignee: "u04-l4a" },
  { nom: "/ŋ/ à l'initiale", motif: /^ง/u, enseignee: "u08-l8a" },
  {
    nom: "marque de ton écrite",
    motif: /[่้๊๋]/u,
    enseignee: "u07-l7a",
    delibere:
      "l'unité 1 travaille l'oreille et demande de ne pas retenir la graphie",
  },
];

/** Les leçons du corpus, dans l'ordre du parcours écrit. */
function lireCorpus() {
  const lecons = [];
  for (const unite of readdirSync(AUTHORING).filter((x) => /^unite-\d\d$/u.test(x))) {
    for (const fichier of readdirSync(join(AUTHORING, unite))
      .filter((x) => /^lecon-.*\.md$/u.test(x))
      .sort()) {
      const texte = readFileSync(join(AUTHORING, unite, fichier), "utf8");
      const meta = analyserMeta(texte);
      if (!meta.identifiant) continue;
      lecons.push({ id: meta.identifiant, items: analyserItems(texte) });
    }
  }
  return lecons;
}

const lecons = lireCorpus();
const rang = new Map(lecons.map((l, i) => [l.id, i]));

let dettes = 0;
console.log(
  `${"difficulté".padEnd(28)}${"1re exigence".padEnd(13)}${"enseignée".padEnd(12)}verdict`,
);
console.log("-".repeat(84));

for (const d of DIFFICULTES) {
  let premiere = null;
  let exemple = "";
  for (const lecon of lecons) {
    for (const item of lecon.items) {
      const graphie = item.thai ?? item.champs?.thai ?? "";
      // Les items d'une seule lettre sont l'alphabet, pas du vocabulaire :
      // les compter ferait remonter une exigence qui n'existe pas.
      if (typeof graphie !== "string" || [...graphie].length <= 1) continue;
      if (d.motif.test(graphie)) {
        premiere = lecon.id;
        exemple = graphie;
        break;
      }
    }
    if (premiere !== null) break;
  }

  const rangExigence = premiere === null ? Infinity : rang.get(premiere);
  const rangEnseignement = rang.get(d.enseignee) ?? Infinity;
  const enDette = rangExigence < rangEnseignement;
  if (enDette && d.delibere === undefined) dettes += 1;

  const verdict =
    premiere === null
      ? "jamais exigé"
      : !enDette
        ? "ok"
        : d.delibere !== undefined
          ? `écart assumé de ${rangEnseignement - rangExigence} leçons (${d.delibere})`
          : `DETTE de ${rangEnseignement - rangExigence} leçons (ex. ${exemple})`;

  console.log(
    `${d.nom.padEnd(28)}${(premiere ?? "jamais").padEnd(13)}${d.enseignee.padEnd(12)}${verdict}`,
  );
}

console.log("-".repeat(84));
console.log(
  dettes === 0
    ? "Aucune dette phonétique non assumée."
    : `${dettes} dette(s) phonétique(s) non assumée(s). Voir docs/curriculum/ordre-par-difficulte.md`,
);
// Sortie non bloquante : la dette des unités 2 à 13 est connue, documentée et
// son arbitrage attend une décision produit. Passer en code 1 casserait la CI
// pour un fait déjà tranché comme « à traiter plus tard ».
process.exit(0);
