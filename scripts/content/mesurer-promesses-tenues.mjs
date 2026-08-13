#!/usr/bin/env node

/**
 * Une leçon promet un objectif. Ses exercices le mesurent, ou pas.
 *
 * POURQUOI CE SCRIPT EXISTE : `u01-l1e` annonce que l'apprenant « comprend à
 * l'écoute un échange réel de 4 répliques ». Elle contient deux exercices, un
 * ordre des mots et une lecture, et aucun fichier audio. Elle promet de
 * l'écoute et n'en fait faire aucune.
 *
 * Ce n'est pas un jugement de goût sur la pédagogie : c'est une contradiction
 * entre ce qu'une leçon déclare et ce qu'elle contient, et elle est
 * vérifiable.
 *
 * ATTENTION AUX MOTIFS. En JavaScript, `\b` est une frontière de mot ASCII et
 * `\w` ne contient aucune lettre accentuée : `\bécout\w+` ne correspond
 * JAMAIS. Une première version de ce script ratait pour cette raison toutes
 * les promesses écrites en « écoute ». Les motifs ci-dessous utilisent donc
 * `\p{L}` et des assertions explicites.
 *
 * Usage : node scripts/content/mesurer-promesses-tenues.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const LECONS = join(
  import.meta.dirname,
  "..",
  "..",
  "packages",
  "content",
  "data",
  "lessons",
);

/** Ni lettre avant, ni lettre après : une vraie limite de mot, accents compris. */
function mot(alternatives) {
  return new RegExp(`(?<!\\p{L})(?:${alternatives})(?!\\p{L})`, "iu");
}

/**
 * Volontairement étroit : mieux vaut rater une promesse que d'en inventer une.
 * Chaque entrée liste les mécaniques qui, à elles seules, tiennent la promesse.
 */
const PROMESSES = [
  {
    nom: "écoute",
    motif: mot(
      "à l['’]écoute|écout\\p{L}*|entend\\p{L}*|à l['’]oreille|auditi\\p{L}*",
    ),
    mecaniques: ["audio_choice"],
  },
  {
    nom: "lecture",
    motif: mot("lit|lire|lecture|lis\\p{L}*|déchiffr\\p{L}*"),
    mecaniques: ["reading"],
  },
  {
    nom: "rappel",
    motif: mot("de mémoire|rappel\\p{L}*|restitu\\p{L}*"),
    mecaniques: ["recall"],
  },
];

const manquements = [];
let total = 0;

for (const fichier of readdirSync(LECONS)
  .filter((nom) => nom.endsWith(".json"))
  .sort()) {
  const slug = fichier.replace(/\.v1\.json$/u, "");
  if (slug.includes("fixture")) continue;

  const lecon = JSON.parse(readFileSync(join(LECONS, fichier), "utf8"));
  const objectif = lecon.objectiveFr ?? "";
  const presentes = new Set((lecon.exercises ?? []).map(({ type }) => type));
  total += 1;

  const nonTenues = PROMESSES.filter(
    ({ motif, mecaniques }) =>
      motif.test(objectif) && !mecaniques.some((m) => presentes.has(m)),
  ).map(({ nom }) => nom);

  if (nonTenues.length > 0) {
    manquements.push({
      slug,
      exercices: (lecon.exercises ?? []).length,
      statut: lecon.workflowStatus,
      promet: nonTenues,
    });
  }
}

const publiees = manquements.filter(({ statut }) => statut === "published");

console.log(
  `${manquements.length} leçon(s) sur ${total} annoncent un objectif qu'aucun de leurs exercices ne mesure.`,
);
console.log(
  `Dont ${publiees.length} DÉJÀ PUBLIÉE(S), donc visible(s) par un apprenant aujourd'hui.\n`,
);

for (const { slug, exercices, statut, promet } of manquements) {
  const marque = statut === "published" ? "  <<< EN LIGNE" : "";
  console.log(
    `  ${slug.padEnd(10)} ${String(exercices).padStart(2)} exos  ${statut.padEnd(9)}  promet : ${promet.join(", ")}${marque}`,
  );
}

const parPromesse = new Map();
for (const { promet } of manquements) {
  for (const nom of promet)
    parPromesse.set(nom, (parPromesse.get(nom) ?? 0) + 1);
}
console.log("\nPAR PROMESSE NON TENUE");
for (const [nom, n] of [...parPromesse].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${nom}`);
}

// Le script mesure et ne juge pas : le seuil acceptable appartient au
// fondateur. Il sort 0 pour rester utilisable en tableau de bord.
process.exit(0);
