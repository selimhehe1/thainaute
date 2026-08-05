#!/usr/bin/env node
// Construit le manifeste audio d'une leçon qui REUTILISE les enregistrements
// d'une autre.
//
// Pourquoi ce script existe
// -------------------------
// La leçon 1F est une synthèse : ses cinq mots sont exactement ceux de 1A.
// Les réenregistrer coûterait de l'argent pour produire des fichiers
// identiques, et introduirait une seconde voix pour le même mot, ce qui est
// pédagogiquement faux dans une leçon de discrimination tonale.
//
// Les identifiants d'items sont portés par la leçon (UUIDv5 incluant son
// identifiant), donc un manifeste ne se recopie pas tel quel : il faut
// réassocier chaque entrée à l'item de la leçon d'accueil, par la graphie.
//
// L'assetId et les chemins, eux, sont conservés : c'est le même fichier, le
// même enregistrement, la même vérification de contour F0. Le manifeste dit
// donc la vérité plutôt que de simuler une production nouvelle.
//
// Usage :
//   node scripts/content/manifeste-audio-reemploi.mjs <source> <cible>

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";



const RACINE = join(import.meta.dirname, "..", "..");
const [source, cible] = process.argv.slice(2);
if (!source || !cible) {
  console.error("usage : manifeste-audio-reemploi.mjs <source> <cible>");
  process.exit(2);
}

const lire = (dossier, id) =>
  JSON.parse(
    readFileSync(join(RACINE, "packages", "content", "data", dossier, `${id}.v1.json`), "utf8"),
  );

const leconSource = lire("lessons", source);
const leconCible = lire("lessons", cible);
const manifesteSource = lire("audio", source);

// Graphie -> identifiant d'item, de chaque côté.
const parGraphieSource = new Map(leconSource.items.map((i) => [i.thaiRaw, i.id]));
const parGraphieCible = new Map(leconCible.items.map((i) => [i.thaiRaw, i.id]));
const graphieDeSource = new Map([...parGraphieSource].map(([g, id]) => [id, g]));

const entrees = [];
const ignorees = [];
for (const entree of manifesteSource.entries) {
  const graphie = graphieDeSource.get(entree.itemId);
  const idCible = graphie === undefined ? undefined : parGraphieCible.get(graphie);
  if (idCible === undefined) {
    ignorees.push(graphie ?? entree.itemId);
    continue;
  }
  entrees.push({ ...entree, itemId: idCible });
}

if (entrees.length === 0) {
  console.error("aucune entrée réutilisable : les deux leçons ne partagent aucune graphie");
  process.exit(1);
}

// La leçon compilée impose ces deux valeurs : elle déclare l'identifiant du
// manifeste qu'elle attend, et sa propre version. Les dériver ici
// produirait un manifeste que la leçon ne reconnaîtrait pas.
const manifeste = {
  schemaVersion: manifesteSource.schemaVersion,
  manifestId: leconCible.audioManifestId,
  lessonVersionId: leconCible.versionId,
  entries: entrees,
};

for (const [champ, valeur] of Object.entries(manifeste)) {
  if (valeur === undefined) {
    console.error(`champ ${champ} absent de la leçon ${cible} : manifeste non écrit`);
    process.exit(1);
  }
}

const chemin = join(RACINE, "packages", "content", "data", "audio", `${cible}.v1.json`);
writeFileSync(chemin, `${JSON.stringify(manifeste, null, 2)}\n`, "utf8");

console.log(`${cible} : ${entrees.length} entrées réemployées depuis ${source}`);
for (const e of entrees) {
  console.log(`   ${e.synthesis?.sourceText ?? "?"}  ->  ${e.distributionPaths[0]}`);
}
if (ignorees.length > 0) {
  console.log(`   ${ignorees.length} entrées ignorées (graphie absente de ${cible}) : ${ignorees.join(" ")}`);
}
console.log(`écrit : ${chemin}`);
