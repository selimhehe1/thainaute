// Contre-audit de `u13-l13a` : rejeu du balayage de décodabilité des ÉCRANS.
//
// POURQUOI CE SCRIPT EXISTE. `lecon-13a.md` publie trois chiffres de
// décodabilité (54 chaînes d'écran, 3 577 chaînes de corpus, 50 retrouvées et 4
// instruites) en les disant exécutés, mais aucun script du dépôt ne les rend et
// aucun fichier de travail n'a été versionné. Ce script refait le balayage avec
// la convention que le fichier décrit lui-même : « le balayage joint deux
// phrases séparées par une espace en une seule chaîne ».
//
// Usage :
//   node scripts/verification/tmp-13a-decod.mjs [fichier-lecon.md]

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTHORING = join(ROOT, "content", "authoring");
const cible = process.argv[2] ?? join(AUTHORING, "unite-13", "lecon-13a.md");

// Chaîne thaïe joignant les espaces internes, comme le déclare le dossier.
const RUN = /[฀-๿]+(?: +[฀-๿]+)*/g;
const ECRANS = ["Enseignement", "Exercices", "Dialogue"];

function sections(texte, noms) {
  const gardees = [];
  let on = false;
  for (const ligne of texte.split(/\r?\n/)) {
    if (/^##\s/.test(ligne)) {
      on = noms.some((n) => ligne.trim() === "## " + n);
      continue;
    }
    if (on) gardees.push(ligne);
  }
  return gardees.join("\n");
}

const texte = readFileSync(cible, "utf8");
const ecran = new Set(
  [...sections(texte, ECRANS).matchAll(RUN)].map((m) => m[0]),
);

const corpus = new Set();
let fichiers = 0;
for (let u = 1; u <= 12; u += 1) {
  const dir = join(AUTHORING, `unite-${String(u).padStart(2, "0")}`);
  for (const nom of readdirSync(dir)) {
    if (!/^lecon-.*\.md$/.test(nom)) continue;
    fichiers += 1;
    for (const m of readFileSync(join(dir, nom), "utf8").matchAll(RUN)) {
      corpus.add(m[0]);
    }
  }
}

const absentes = [...ecran].filter((g) => !corpus.has(g));
console.log(`cible                     : ${cible}`);
console.log(`chaînes thaïes d'écran    : ${ecran.size}`);
console.log(
  `corpus 1 à 12             : ${fichiers} fichiers, ${corpus.size} chaînes distinctes`,
);
console.log(`retrouvées telles quelles : ${ecran.size - absentes.length}`);
console.log(`absentes                  : ${absentes.length}`);
for (const a of absentes) console.log(`   ${a}`);
