#!/usr/bin/env node
// Ce que coûte chaque unité avant d'être publiable, en une page.
//
// Pourquoi cet outil
// ------------------
// Les treize dossiers de preuve disent chacun la vérité sur leur unité, mais
// aucun ne répond à la question que le fondateur se pose vraiment : par quoi
// commencer, et qu'est-ce qui bloque quoi. Décider unité par unité suppose de
// voir les treize côte à côte.
//
// Il ne juge rien. Il compte les bloqueurs réellement rendus par
// `getPublicationBlockers`, sépare ce qu'une signature lève de ce qu'elle ne
// lève pas, et nomme les deux dépendances externes : la voix à produire et la
// décision juridique sur le dictionnaire royal.
//
// Usage :
//   node scripts/content/etat-des-unites.mjs
//   node scripts/content/etat-des-unites.mjs --write

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getPublicationBlockers } from "../../packages/content/src/audit.ts";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO = join(RACINE, "packages", "content", "data", "audio");
const SOURCE_JURIDIQUE = "RID-2554";

/** Bloqueurs qu'une signature humaine lève, et eux seuls. */
const LEVES_PAR_SIGNATURE = new Set([
  "VISIBILITY_NOT_PUBLIC",
  "WORKFLOW_NOT_PUBLISHED",
  "PUBLISHED_AT_MISSING",
  "HUMAN_AUTHOR_MISSING",
  "HUMAN_AUDITOR_MISSING",
]);

const lire = (chemin) => JSON.parse(readFileSync(chemin, "utf8"));
const registre = lire(join(RACINE, "content", "sources-registry.json"));
const sourcesParId = new Map(
  registre.sources.map((source) => [source.sourceId, source]),
);

const parUnite = new Map();
for (const fichier of readdirSync(LECONS).sort()) {
  const trouve = /^u(\d{2})-l.*\.v1\.json$/u.exec(fichier);
  if (trouve === null) continue;
  const unite = trouve[1];
  const lesson = lire(join(LECONS, fichier));
  const audioManifest = lire(join(AUDIO, fichier));
  const sources = lesson.provenance.sourceIds.flatMap((sourceId) => {
    const source = sourcesParId.get(sourceId);
    return source === undefined ? [] : [source];
  });

  const blockers = getPublicationBlockers({ lesson, audioManifest, sources });
  const codes = new Set(blockers.map(({ code }) => code));
  const etat = parUnite.get(unite) ?? {
    lecons: 0,
    signature: 0,
    audio: 0,
    juridique: 0,
    autres: new Set(),
  };
  etat.lecons += 1;
  if ([...codes].every((code) => LEVES_PAR_SIGNATURE.has(code))) {
    etat.signature += 1;
  }
  if (codes.has("AUDIO_ASSET_MISSING")) etat.audio += 1;
  if (lesson.provenance.sourceIds.includes(SOURCE_JURIDIQUE)) {
    const source = sourcesParId.get(SOURCE_JURIDIQUE);
    if (source?.publicationAuthorized === false) etat.juridique += 1;
  }
  for (const code of codes) {
    if (
      !LEVES_PAR_SIGNATURE.has(code) &&
      code !== "AUDIO_ASSET_MISSING" &&
      !code.startsWith("SOURCE_NOT_")
    ) {
      etat.autres.add(code);
    }
  }
  parUnite.set(unite, etat);
}

const lignes = [
  "# Ce que coûte chaque unité avant publication",
  "",
  "Document GÉNÉRÉ par `scripts/content/etat-des-unites.mjs`, depuis les",
  "bloqueurs réellement rendus par `getPublicationBlockers`. Le régénérer",
  "après toute modification de contenu.",
  "",
  "« Signature suffit » compte les leçons dont TOUS les bloqueurs restants",
  "sont ceux qu'une signature humaine lève. Les deux autres colonnes nomment",
  "les dépendances qu'aucune signature ne lève : une voix à produire, et la",
  "décision juridique sur les trois booléens du dictionnaire royal.",
  "",
  "| Unité | Leçons | Signature suffit | Voix manquante | Dépend du RID |",
  "| ----- | -----: | ---------------: | -------------: | ------------: |",
];

let totalLecons = 0;
let totalSignature = 0;
for (const [unite, etat] of [...parUnite].sort()) {
  totalLecons += etat.lecons;
  totalSignature += etat.signature;
  lignes.push(
    `| ${unite} | ${etat.lecons} | ${etat.signature} | ${etat.audio} | ${etat.juridique} |`,
  );
}
lignes.push(
  `| **total** | **${totalLecons}** | **${totalSignature}** | | |`,
  "",
);

const totalJuridique = [...parUnite.values()].reduce(
  (somme, etat) => somme + etat.juridique,
  0,
);
const totalAudio = [...parUnite.values()].reduce(
  (somme, etat) => somme + etat.audio,
  0,
);

const autres = new Set(
  [...parUnite.values()].flatMap((etat) => [...etat.autres]),
);
lignes.push(
  "## Ce que le tableau dit",
  "",
  `**${totalJuridique} leçons sur ${totalLecons} dépendent de la décision`,
  "juridique sur le dictionnaire royal.** Ce n'est pas une porte parmi",
  "d'autres : c'est LA porte du corpus. L'unité 1 est l'exception, parce que",
  "ses items citent Volubilis et Wiktionary plutôt que le RID.",
  "",
  `Seules ${totalAudio} leçons attendent une voix, et ${totalSignature}`,
  "sont publiables dès qu'une signature les couvre.",
  "",
  "La revue par un locuteur natif reste en attente sur tout le corpus, et",
  "aucune signature ne peut en tenir lieu.",
);

const sortie = `${lignes.join("\n")}\n`;
if (process.argv.includes("--write")) {
  const chemin = join(RACINE, "docs", "content-policy", "etat-des-unites.md");
  writeFileSync(chemin, sortie, "utf8");
  process.stdout.write(`État écrit : ${chemin}\n`);
} else {
  process.stdout.write(sortie);
}
