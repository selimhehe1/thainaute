#!/usr/bin/env node
// Génère la carte des `require` audio embarqués par l'application mobile.
//
// POURQUOI CET OUTIL EXISTE
// -------------------------
// Cette carte était écrite à la main. L'ADR-0042 a redéfini l'identité
// d'une carte, donc renommé les 23 fichiers audio, et personne n'a mis la
// carte à jour : elle pointait encore vers des noms disparus. Le défaut
// est resté invisible parce que le fichier vivait hors du graphe Expo,
// muré par l'ADR-0041. Il s'est révélé à la seconde où le mur est tombé.
//
// Un fichier généré depuis les manifestes ne peut plus mentir. React
// Native exige un littéral de chaîne dans `require`, donc on émet du code
// plutôt que de lire un dossier à l'exécution.
//
// Usage :
//   node scripts/content/generer-audio-mobile.mjs [--write]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = join(import.meta.dirname, "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO = join(RACINE, "packages", "content", "data", "audio");
const SORTIE = join(
  RACINE,
  "apps",
  "mobile",
  "lib",
  "embedded-audio-sources.generated.ts",
);

function lire(chemin) {
  return JSON.parse(readFileSync(chemin, "utf8"));
}

/** Les leçons publiées, seules à avoir le droit d'entrer dans une build. */
function leconsPubliees() {
  return readdirSync(LECONS)
    .filter((fichier) => fichier.endsWith(".v1.json"))
    .map((fichier) => ({
      cle: fichier.replace(/\.v1\.json$/u, ""),
      lesson: lire(join(LECONS, fichier)),
    }))
    .filter(
      ({ lesson }) =>
        lesson.workflowStatus === "published" && lesson.visibility === "public",
    )
    .sort((a, b) => (a.cle < b.cle ? -1 : 1));
}

const lignes = [
  "// Fichier généré par scripts/content/generer-audio-mobile.mjs.",
  "// Ne pas modifier à la main : la carte écrite à la main avait survécu au",
  "// renommage des assets de l'ADR-0042 en pointant vers des fichiers",
  "// disparus, et le mur de l'ADR-0041 cachait la panne.",
  "",
  "/** Sources audio embarquées, par identifiant d'asset. */",
  "export const EMBEDDED_AUDIO_SOURCES: Readonly<",
  "  Record<string, Readonly<Record<string, number>>>",
  "> = {",
];

let total = 0;
for (const { cle } of leconsPubliees()) {
  const cheminManifeste = join(AUDIO, `${cle}.v1.json`);
  if (!existsSync(cheminManifeste)) continue;
  const entrees = lire(cheminManifeste).entries ?? [];
  if (entrees.length === 0) continue;

  lignes.push(`  ${JSON.stringify(cle)}: {`);
  for (const entree of entrees) {
    // Le chemin canonique est celui que le manifeste déclare : on ne le
    // reconstruit pas, on le cite.
    const chemin = `../../../${entree.canonicalPath}`;
    lignes.push(
      `    ${JSON.stringify(entree.assetId)}: require(${JSON.stringify(chemin)}) as number,`,
    );
    total += 1;
  }
  lignes.push("  },");
}
lignes.push("};", "");

const sortie = lignes.join("\n");
if (process.argv.includes("--write")) {
  writeFileSync(SORTIE, sortie, "utf8");
  process.stdout.write(`Carte audio mobile écrite : ${total} sources.\n`);
} else {
  process.stdout.write(sortie);
}
