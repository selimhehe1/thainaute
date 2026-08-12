#!/usr/bin/env node
// Assemble le dossier de preuve d'une unité, celui que le fondateur relit
// avant de signer.
//
// Pourquoi il est GÉNÉRÉ
// ----------------------
// `CLAUDE.md` réserve au fondateur la « validation manuelle du dossier de
// preuve avant changement de statut ». Un dossier écrit à la main se
// désynchronise du contenu au premier correctif, et une signature portée sur
// un dossier périmé ne vaut rien. Celui-ci est recalculé depuis les paquets
// compilés, les manifestes audio et les dossiers de vérification réels.
//
// Ce qu'il ne fait pas
// --------------------
// Il n'approuve rien et ne juge rien. Il rassemble ce qui existe, compte ce
// qui est vérifiable, et dit ce qui manque. Les portes de publication restent
// tenues par `getPublicationBlockers`.
//
// Usage :
//   node scripts/content/dossier-de-preuve.mjs 01
//   node scripts/content/dossier-de-preuve.mjs 01 --write

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO_DATA = join(RACINE, "packages", "content", "data", "audio");
const AUTORAT = join(RACINE, "content", "authoring");

const unite = process.argv[2];
if (unite === undefined || !/^\d{2}$/u.test(unite)) {
  process.stderr.write(
    "Usage : dossier-de-preuve.mjs <unité sur deux chiffres> [--write]\n",
  );
  process.exit(2);
}
const ecrire = process.argv.includes("--write");

const lire = (chemin) => JSON.parse(readFileSync(chemin, "utf8"));

const paquets = readdirSync(LECONS)
  .filter((f) => f.startsWith(`u${unite}-l`) && f.endsWith(".v1.json"))
  .sort()
  .map((f) => ({ nom: f.split(".")[0], lecon: lire(join(LECONS, f)) }));

if (paquets.length === 0) {
  process.stderr.write(`Aucun paquet compilé pour l'unité ${unite}.\n`);
  process.exit(1);
}

const dossierAutorat = join(AUTORAT, `unite-${unite}`);
const fichiersVerification = existsSync(dossierAutorat)
  ? readdirSync(dossierAutorat).filter((f) => f.startsWith("verification-"))
  : [];

const lignes = [];
const ecrit = (...texte) => lignes.push(...texte);

ecrit(
  `# Dossier de preuve, unité ${unite}`,
  "",
  "Document GÉNÉRÉ par `scripts/content/dossier-de-preuve.mjs`. Il est",
  "recalculé depuis les paquets compilés, les manifestes audio et les dossiers",
  "de vérification réellement présents dans le dépôt. Le régénérer après toute",
  "modification de contenu.",
  "",
  "Il ne vaut pas approbation. Il rassemble ce qui existe et nomme ce qui",
  "manque, pour qu'une signature soit un acte informé.",
  "",
);

// Ce que la chaîne a fait, et ce qu'elle n'a pas fait.
const acteurs = new Set();
const auditeurs = new Set();
let auditsPasses = 0;
let auditsTotal = 0;
let findingsOuverts = 0;
for (const { lecon } of paquets) {
  for (const acteur of lecon.provenance.generationActors)
    acteurs.add(acteur.kind);
  for (const audit of lecon.provenance.audits) {
    auditsTotal += 1;
    if (audit.status === "passed") auditsPasses += 1;
    auditeurs.add(audit.auditor.kind);
  }
  findingsOuverts += lecon.provenance.findings.filter(
    (finding) => finding.blocking && finding.status === "open",
  ).length;
}

ecrit(
  "## État de la chaîne",
  "",
  `- Leçons compilées : ${paquets.length}`,
  `- Audits déclarés : ${auditsPasses} passés sur ${auditsTotal}`,
  `- Findings bloquants encore ouverts : ${findingsOuverts}`,
  `- Nature des auteurs déclarés : ${[...acteurs].join(", ")}`,
  `- Nature des auditeurs déclarés : ${[...auditeurs].join(", ")}`,
  "",
);

if (!acteurs.has("human") || !auditeurs.has("human")) {
  ecrit(
    "**Aucun auteur ni auditeur humain n'est encore enregistré.** Les portes",
    "`HUMAN_AUTHOR_MISSING` et `HUMAN_AUDITOR_MISSING` restent donc fermées, et",
    "c'est exactement ce que la signature du fondateur vient lever.",
    "",
    "**Revue par un locuteur natif : en attente.** Elle n'a pas eu lieu, et",
    "aucune signature ne peut en tenir lieu.",
    "",
  );
}

const contreAudit = join(dossierAutorat, "contre-audit-gpt56.md");
if (existsSync(contreAudit)) {
  const reponses = fichiersVerification.filter((f) =>
    f.startsWith("contre-audit-gpt56-reponses"),
  );
  ecrit(
    "### Contre-audit externe",
    "",
    reponses.length > 0
      ? `Réponses versionnées : ${reponses.join(", ")}.`
      : "Les prompts du contre-audit externe existent, mais **aucun fichier de réponses n'est versionné**. La chaîne annoncée comme multi-modèles est à ce jour mono-modèle, et le dossier doit le dire.",
    "",
  );
}

// Détail par leçon.
for (const { nom, lecon } of paquets) {
  const manifeste = lire(join(AUDIO_DATA, `${nom}.v1.json`));
  const entrees = manifeste.entries ?? [];
  const parMecanique = new Map();
  for (const exercice of lecon.exercises) {
    parMecanique.set(exercice.type, (parMecanique.get(exercice.type) ?? 0) + 1);
  }
  // `u01-l1a` donne `verification-1a.md` : la partie leçon perd son « l ».
  const suffixe = (nom.split("-")[1] ?? "").replace(/^l/u, "");
  const verification = fichiersVerification.find((f) =>
    f.startsWith(`verification-${suffixe}.`),
  );

  ecrit(
    `## ${nom} : ${lecon.titleFr}`,
    "",
    `- Objectif : ${lecon.objectiveFr}`,
    `- Statut : \`${lecon.workflowStatus}\`, visibilité \`${lecon.visibility}\``,
    `- Items : ${lecon.items.length}`,
    `- Exercices : ${lecon.exercises.length} (${[...parMecanique]
      .map(([type, nombre]) => `${type} ${nombre}`)
      .join(", ")})`,
    `- Fichiers audio : ${entrees.length}`,
    "",
  );

  if (verification === undefined) {
    // L'absence d'un dossier n'est pas toujours un manque : une leçon de
    // synthèse peut ne rien introduire de neuf. On le dit, on ne le cache pas.
    const graphies = new Set(lecon.items.map((item) => item.thaiRaw));
    const ailleurs = new Set();
    for (const autre of paquets) {
      if (autre.nom === nom) continue;
      for (const item of autre.lecon.items) ailleurs.add(item.thaiRaw);
    }
    const inedites = [...graphies].filter((g) => !ailleurs.has(g));
    ecrit(
      inedites.length === 0
        ? `**Aucun dossier de vérification propre, et aucun item inédit** : les ${graphies.size} graphies de cette leçon sont toutes vérifiées dans les dossiers des autres leçons de l'unité.`
        : `**Dossier de vérification ABSENT**, alors que la leçon introduit ${inedites.length} graphie(s) qu'aucune autre leçon de l'unité ne porte : ${inedites.join(", ")}.`,
      "",
    );
  } else {
    ecrit(`Dossier de vérification : \`${verification}\`.`, "");
  }

  ecrit(
    "| Graphie | Transcription | Français | Sources |",
    "| --- | --- | --- | --- |",
  );
  for (const item of lecon.items) {
    ecrit(
      `| ${item.thaiRaw} | ${item.transcription.value ?? ""} | ${item.translationFr ?? ""} | ${item.sourceIds.join(", ")} |`,
    );
  }
  ecrit("");

  if (entrees.length > 0) {
    const voix = new Set(entrees.map((e) => e.synthesis?.voice ?? "?"));
    const modeles = new Set(entrees.map((e) => e.synthesis?.model ?? "?"));
    const controles = entrees.filter((e) => e.toneCheck !== null).length;
    const incoherents = entrees.filter(
      (e) => e.toneCheck?.consistent === false,
    ).length;
    ecrit(
      `Audio : voix ${[...voix].join(", ")}, modèle ${[...modeles].join(", ")}, ${controles} fichier(s) sur ${entrees.length} contrôlés par contour F0, ${incoherents} incohérence(s) de ton.`,
      "",
      "Voix **synthétique**, jamais présentée comme un enregistrement humain.",
      "",
    );
  }
}

const sortie = lignes.join("\n").concat("\n");
if (ecrire) {
  const chemin = join(
    RACINE,
    "docs",
    "content-policy",
    `dossier-unite-${unite}.md`,
  );
  writeFileSync(chemin, sortie, "utf8");
  process.stdout.write(`Dossier écrit : ${chemin}\n`);
} else {
  process.stdout.write(sortie);
}
