#!/usr/bin/env node
// Liste les graphies déclarées plusieurs fois, et dit où elles divergent.
//
// Pourquoi cet outil
// ------------------
// Le corpus porte 526 identifiants d'items pour 345 graphies : la même carte
// est redéclarée par chaque leçon qui la revoit. Comme le SRS s'indexe sur
// l'identifiant, la maîtrise ne se consolide jamais (voir
// docs/qa/identite-des-items-2026-08-12.md).
//
// Consolider suppose de choisir, pour chaque graphie, UNE déclaration
// publiée. Là où les déclarations sont identiques, la fusion est mécanique.
// Là où elles divergent, personne ne peut trancher à la place d'un humain :
// « forêt » et « forêt, bois » sont la même carte reformulée, alors que la
// soie et la particule de question partagent ไหม sans être le même mot.
//
// Ce script ne décide rien. Il produit la liste de travail, triée par
// gravité : d'abord ce qui peut être un vrai homographe, ensuite les simples
// reformulations.
//
// Usage :
//   node scripts/content/divergences-de-cartes.mjs
//   node scripts/content/divergences-de-cartes.mjs --json

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");

/** Champs dont un écart change ce que l'apprenant voit ou entend. */
const CHAMPS_SENSIBLES = ["translationFr", "register"];

function normaliser(valeur) {
  return (valeur ?? "")
    .normalize("NFC")
    .replaceAll("’", "'")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

/**
 * Deux gloses sont-elles la même, reformulée ?
 *
 * Heuristique volontairement PRUDENTE : elle ne sert qu'à trier la liste de
 * travail, jamais à fusionner. Un faux « proche » coûte une relecture ; un
 * faux « distinct » ne coûte rien.
 */
function glosesProches(a, b) {
  const x = normaliser(a);
  const y = normaliser(b);
  if (x === y) return true;
  if (x.length === 0 || y.length === 0) return false;
  if (x.startsWith(y) || y.startsWith(x)) return true;
  const mots = (valeur) =>
    new Set(valeur.split(/[^\p{L}\p{N}]+/u).filter((mot) => mot.length > 2));
  const ensembleX = mots(x);
  const ensembleY = mots(y);
  if (ensembleX.size === 0 || ensembleY.size === 0) return false;
  let communs = 0;
  for (const mot of ensembleX) if (ensembleY.has(mot)) communs += 1;
  return communs / Math.min(ensembleX.size, ensembleY.size) >= 0.5;
}

function lireCorpus() {
  const parGraphie = new Map();
  for (const fichier of readdirSync(LECONS).sort()) {
    if (!fichier.startsWith("u") || !fichier.endsWith(".json")) continue;
    const lecon = fichier.split(".")[0];
    const paquet = JSON.parse(readFileSync(join(LECONS, fichier), "utf8"));
    for (const item of paquet.items) {
      const graphie = item.thaiRaw.normalize("NFC");
      const declarations = parGraphie.get(graphie) ?? [];
      declarations.push({ lecon, item });
      parGraphie.set(graphie, declarations);
    }
  }
  return parGraphie;
}

function analyser() {
  const parGraphie = lireCorpus();
  const identiques = [];
  const reformulations = [];
  const divergences = [];

  for (const [graphie, declarations] of parGraphie) {
    const identifiants = new Set(declarations.map(({ item }) => item.id));
    if (identifiants.size < 2) continue;

    const ecarts = [];
    for (const champ of CHAMPS_SENSIBLES) {
      const valeurs = [
        ...new Set(declarations.map(({ item }) => normaliser(item[champ]))),
      ];
      if (valeurs.length > 1) ecarts.push({ champ, valeurs });
    }
    // La prononciation ne se reformule pas : un écart y est toujours grave.
    const prononciations = [
      ...new Set(
        declarations.map(({ item }) =>
          JSON.stringify(
            (item.syllables ?? []).map(({ ipa, tone, vowelLength }) => [
              ipa,
              tone,
              vowelLength,
            ]),
          ),
        ),
      ),
    ];
    const prononciationDiverge = prononciations.length > 1;

    const entree = {
      graphie,
      identifiants: identifiants.size,
      lecons: declarations.map(({ lecon }) => lecon),
      ecarts,
      prononciationDiverge,
      gloses: [
        ...new Set(declarations.map(({ item }) => item.translationFr ?? "")),
      ],
    };

    if (ecarts.length === 0 && !prononciationDiverge) {
      identiques.push(entree);
      continue;
    }
    const toutesProches = entree.gloses.every((gloseA) =>
      entree.gloses.every((gloseB) => glosesProches(gloseA, gloseB)),
    );
    if (prononciationDiverge || !toutesProches) divergences.push(entree);
    else reformulations.push(entree);
  }

  return { identiques, reformulations, divergences };
}

const resultat = analyser();

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(resultat, null, 2)}\n`);
} else {
  const total =
    resultat.identiques.length +
    resultat.reformulations.length +
    resultat.divergences.length;
  const lignes = [
    `Graphies déclarées plusieurs fois : ${total}`,
    `  fusion mécanique, aucune décision : ${resultat.identiques.length}`,
    `  reformulation d'une même carte    : ${resultat.reformulations.length}`,
    `  À ARBITRER PAR UN HUMAIN          : ${resultat.divergences.length}`,
    "",
    "À arbitrer :",
  ];
  for (const entree of resultat.divergences) {
    lignes.push(
      `  ${entree.graphie}  (${entree.identifiants} identifiants, ${entree.lecons.join(", ")})`,
    );
    if (entree.prononciationDiverge) {
      lignes.push("     prononciation déclarée différemment selon la leçon");
    }
    for (const glose of entree.gloses) lignes.push(`     « ${glose} »`);
  }
  // Écriture directe en UTF-8 : sur Windows, `console.log` traverse une page
  // de code qui détruit le thaï silencieusement.
  process.stdout.write(`${lignes.join("\n")}\n`);
}
