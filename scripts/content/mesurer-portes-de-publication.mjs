#!/usr/bin/env node

/**
 * Ce qui sépare réellement le corpus de la publication.
 *
 * POURQUOI CE SCRIPT EXISTE : le plan supposait que l'audio tenait les 61
 * leçons en brouillon. La mesure dit l'inverse. L'audio n'en bloque que 7 ;
 * les 61 attendent une signature humaine.
 *
 * Il mesure aussi ce qu'aucune porte ne regarde : une unité peut n'avoir
 * AUCUN exercice d'écoute, passer tous les contrôles, et laisser un
 * apprenant traverser une méthode de thaï sans jamais entendre un mot.
 *
 * Usage : node scripts/content/mesurer-portes-de-publication.mjs
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const RACINE = join(import.meta.dirname, "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO = join(RACINE, "packages", "content", "assets", "audio");

/** La mécanique d'écoute s'appelle `audio_choice` dans les paquets compilés. */
const ECOUTE = "audio_choice";

/** Les paquets de démonstration ne sont pas du cours et ne se publient pas. */
const FIXTURES = new Set(["five-mechanics-fixture", "unicode-audio-fixture"]);

function lireLecons() {
  return readdirSync(LECONS)
    .filter((nom) => nom.endsWith(".json"))
    .sort()
    .map((nom) => {
      const slug = nom.replace(/\.v1\.json$/u, "");
      return {
        slug,
        unite: slug.slice(0, 3),
        ...JSON.parse(readFileSync(join(LECONS, nom), "utf8")),
      };
    })
    .filter(({ slug }) => !FIXTURES.has(slug));
}

const unites = new Map();
const muettes = [];
const sansEcoute = [];

for (const lecon of lireLecons()) {
  const exercices = lecon.exercises ?? [];
  const ecoute = exercices.filter(({ type }) => type === ECOUTE).length;
  const aDuSon = existsSync(join(AUDIO, lecon.slug));
  const publiee = lecon.workflowStatus === "published";

  if (!unites.has(lecon.unite)) {
    unites.set(lecon.unite, {
      lecons: 0,
      publiees: 0,
      exercices: 0,
      ecoute: 0,
      sonores: 0,
      muettes: 0,
    });
  }
  const u = unites.get(lecon.unite);
  u.lecons += 1;
  u.exercices += exercices.length;
  u.ecoute += ecoute;
  if (publiee) u.publiees += 1;
  if (aDuSon) u.sonores += 1;

  // Un exercice d'écoute sans fichier : la porte le bloque, et c'est juste.
  if (ecoute > 0 && !aDuSon) {
    u.muettes += 1;
    muettes.push({ slug: lecon.slug, ecoute });
  }
  // Aucune écoute du tout : aucune porte ne s'en plaint, et c'est le trou.
  if (ecoute === 0) sansEcoute.push(lecon.slug);
}

console.log("unité  leçons  publiées  exercices  écoute  avec son  à corriger");
for (const [nom, u] of [...unites].sort()) {
  console.log(
    `  ${nom}  ${String(u.lecons).padStart(5)}  ${String(u.publiees).padStart(8)}` +
      `  ${String(u.exercices).padStart(9)}  ${String(u.ecoute).padStart(6)}` +
      `  ${String(u.sonores).padStart(8)}  ${String(u.muettes).padStart(10)}`,
  );
}

console.log(
  `\n${muettes.length} leçon(s) portent un exercice d'écoute SANS fichier audio.`,
);
console.log("  Ce sont les seules que l'audio bloque réellement :");
for (const { slug, ecoute } of muettes) {
  console.log(`    ${slug} : ${ecoute} exercice(s) d'écoute muet(s)`);
}

const unitesSansEcoute = [...unites].filter(([, u]) => u.ecoute === 0);
const leconsDesUnitesMuettes = unitesSansEcoute.reduce(
  (total, [, u]) => total + u.lecons,
  0,
);

console.log(`\n${sansEcoute.length} leçon(s) n'ont AUCUN exercice d'écoute.`);
console.log(
  `  Dont ${leconsDesUnitesMuettes}, réparties sur ${unitesSansEcoute.length} unité(s) ENTIÈREMENT sans écoute : ` +
    `${unitesSansEcoute.map(([nom]) => nom).join(", ")}.`,
);
console.log(
  "  Aucune porte ne le signale : ces unités se publieraient sans un seul",
);
console.log(
  "  son, et un apprenant les traverserait sans jamais entendre de thaï.",
);

// Le script mesure ; il ne juge pas. Il sort 0 pour rester utilisable en
// tableau de bord sans faire échouer une CI qui n'a rien à corriger ici.
process.exit(0);
