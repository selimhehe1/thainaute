#!/usr/bin/env node

/**
 * Pourquoi chaque graphie refusée est introuvable, et comment la résoudre.
 *
 * POURQUOI CE SCRIPT EXISTE : « item introuvable pour <graphie> » est la
 * première cause de refus du corpus. Le motif est unique, mais il recouvre
 * quatre situations qui ne se corrigent pas du tout de la même façon, et
 * rien ne les distinguait. Chaque graphie demandait donc une enquête.
 *
 * SCINDER    la graphie est déjà déclarée, mais à l'intérieur d'un item qui
 *            en porte PLUSIEURS, séparées par un point médian. Tous les
 *            champs sont déjà écrits graphie par graphie : il n'y a rien à
 *            sourcer, seulement un item à couper en deux.
 * COMPOSER   la graphie est la concaténation exacte d'items existants. On
 *            déclare un item composé dont tous les champs dérivent d'eux,
 *            sans ajouter aucun fait linguistique. Méthode prouvée sur
 *            `u01-l1e` (PR #104).
 * REFERENCER la graphie est déjà un item, mais d'une AUTRE leçon. Le
 *            curriculum se construit : la reprise est légitime, elle doit
 *            être déclarée avec un renvoi vers l'item d'origine.
 * ECRIRE     rien ne la couvre. C'est un vrai manque éditorial, et il doit
 *            rester bloqué plutôt qu'être comblé par une invention.
 *
 * Usage : node scripts/content/trier-graphies-refusees.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const RACINE = join(import.meta.dirname, "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");

const P = await import(
  new URL("lib/parse-authoring.mjs", import.meta.url).href
);
const X = await import(
  new URL("lib/extraire-exercices.mjs", import.meta.url).href
);

/** Le corpus sépare les graphies d'un même item par un point médian. */
const SEPARATEUR_GRAPHIES = /\s*[·]\s*/u;

function lireCorpus() {
  const lecons = [];
  for (const unite of readdirSync(AUTHORING)
    .filter((nom) => /^unite-\d\d$/u.test(nom))
    .sort()) {
    for (const fichier of readdirSync(join(AUTHORING, unite))
      .filter((nom) => /^lecon-/u.test(nom))
      .sort()) {
      const texte = readFileSync(join(AUTHORING, unite, fichier), "utf8");
      const slug = `u${unite.slice(6)}-l${fichier.replace("lecon-", "").replace(".md", "")}`;

      // Les graphies DÉCLARÉES par l'item, et celles qu'il porte réellement.
      // Un item à plusieurs graphies n'en résout aucune prise isolément.
      const entieres = new Set();
      const parties = new Set();
      for (const item of P.analyserItems(texte)) {
        const brut = String(item.thai ?? item.champs?.thai ?? "").normalize(
          "NFC",
        );
        if (brut === "") continue;
        entieres.add(brut);
        for (const morceau of brut.split(SEPARATEUR_GRAPHIES)) {
          if (morceau !== "" && morceau !== brut) parties.add(morceau);
        }
      }
      lecons.push({ slug, texte, entieres, parties });
    }
  }
  return lecons;
}

/** Découpe gloutonne, le plus long d'abord. Rend null si un reste est inconnu. */
function decouper(cible, vocabulaire) {
  const tries = [...vocabulaire].sort((a, b) => b.length - a.length);
  const suite = [];
  let reste = cible;
  while (reste.length > 0) {
    const suivant = tries.find((graphie) => reste.startsWith(graphie));
    if (suivant === undefined) return null;
    suite.push(suivant);
    reste = reste.slice(suivant.length);
  }
  return suite.length >= 2 ? suite : null;
}

const lecons = lireCorpus();
const toutesGraphies = new Map();
for (const { slug, entieres, parties } of lecons) {
  for (const graphie of [...entieres, ...parties]) {
    if (!toutesGraphies.has(graphie)) toutesGraphies.set(graphie, []);
    toutesGraphies.get(graphie).push(slug);
  }
}

const verdicts = [];
for (const { slug, texte, entieres, parties } of lecons) {
  const resoudre = (graphie) =>
    entieres.has(graphie.normalize("NFC")) ? "présent" : null;

  for (const bloc of P.analyserBlocsExercice(texte)) {
    let resultat;
    try {
      resultat = X.extraireBloc(bloc, resoudre);
    } catch {
      continue;
    }
    if (resultat?.ok) continue;

    const brut = String(resultat?.motif ?? "").match(
      /item introuvable pour ([฀-๿]+)/u,
    )?.[1];
    if (brut === undefined) continue;
    const graphie = brut.normalize("NFC");

    let action;
    let detail;
    if (parties.has(graphie)) {
      action = "SCINDER";
      detail = "déjà déclarée dans un item à plusieurs graphies de cette leçon";
    } else {
      const local = decouper(graphie, entieres);
      const global = decouper(graphie, new Set(toutesGraphies.keys()));
      if (local !== null) {
        action = "COMPOSER";
        detail = local.join(" + ");
      } else if (toutesGraphies.has(graphie)) {
        action = "REFERENCER";
        detail = `item de ${toutesGraphies.get(graphie).join(", ")}`;
      } else if (global !== null) {
        action = "COMPOSER";
        detail = `${global.join(" + ")} (composants hors leçon)`;
      } else {
        action = "ECRIRE";
        detail = "aucun item du corpus ne la couvre";
      }
    }
    verdicts.push({ slug, graphie, mecanique: bloc.mecanique ?? "?", action, detail });
  }
}

const parAction = new Map();
for (const { action } of verdicts) {
  parAction.set(action, (parAction.get(action) ?? 0) + 1);
}

console.log(`${verdicts.length} bloc(s) refusés pour « item introuvable ».\n`);
for (const action of ["SCINDER", "COMPOSER", "REFERENCER", "ECRIRE"]) {
  const nombre = parAction.get(action) ?? 0;
  console.log(`  ${String(nombre).padStart(3)}  ${action}`);
}
console.log();

for (const action of ["SCINDER", "COMPOSER", "REFERENCER", "ECRIRE"]) {
  const lignes = verdicts.filter((v) => v.action === action);
  if (lignes.length === 0) continue;
  console.log(`## ${action}`);
  for (const { slug, graphie, mecanique, detail } of lignes) {
    console.log(
      `  ${slug.padEnd(9)} ${mecanique.padEnd(11)} ${graphie}  ${detail}`,
    );
  }
  console.log();
}

// Le script trie et ne corrige rien. Il sort 0 pour rester utilisable en
// tableau de bord sans faire échouer une CI qui n'a rien à corriger ici.
process.exit(0);
