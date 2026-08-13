#!/usr/bin/env node
// Distribue l'audio des leçons PUBLIÉES vers le site web.
//
// Pourquoi ce script existe
// -------------------------
// Les WAV avaient été retirés de `apps/web/public/` pour ne sortir que par la
// porte éditeur, tant qu'aucune leçon n'était publiable. La signature de
// l'unité 1 change la donne : un cours publié doit s'entendre, et
// `publicAudioSources` ne rend un chemin que si le manifeste porte un
// `distributionPaths` sous `apps/web/public/`. Sans ce pont, une leçon
// publiée s'ouvrait sur une erreur.
//
// La règle, et elle est stricte
// -----------------------------
// SEULES les leçons `published` ET `public` sont distribuées. Un brouillon ne
// dépose rien : c'est la frontière que l'ADR-0041 protège, et la seule chose
// qui empêche un contenu non relu de fuiter dans un dossier public.
//
// Le fichier copié est vérifié par son empreinte avant d'être écrit. Copier
// un octet différent de celui qu'un manifeste déclare rendrait la
// vérification d'intégrité du client mensongère.
//
// Usage :
//   node scripts/content/publier-audio-web.mjs
//   node scripts/content/publier-audio-web.mjs --write

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const MANIFESTES = join(RACINE, "packages", "content", "data", "audio");
const PUBLIC_WEB = join(RACINE, "apps", "web", "public", "audio");
const PREFIXE = "apps/web/public/audio";

const ecrire = process.argv.includes("--write");
const lire = (chemin) => JSON.parse(readFileSync(chemin, "utf8"));
const journal = [];

/** Dossiers déjà distribués, pour retirer ce qui ne l'est plus. */
const distribues = new Set();

for (const fichier of readdirSync(LECONS).sort()) {
  if (!/^u\d{2}-l.*\.v1\.json$/u.test(fichier)) continue;
  const nom = fichier.split(".")[0];
  const lesson = lire(join(LECONS, fichier));
  const publiee =
    lesson.workflowStatus === "published" && lesson.visibility === "public";

  const cheminManifeste = join(MANIFESTES, fichier);
  const manifeste = lire(cheminManifeste);
  const entrees = manifeste.entries ?? [];
  if (entrees.length === 0) continue;

  if (!publiee) {
    // Un brouillon qui aurait été distribué par erreur est REPRIS.
    const restes = entrees.filter(
      ({ distributionPaths }) => (distributionPaths ?? []).length > 0,
    );
    if (restes.length > 0) {
      journal.push(`${nom} : ${restes.length} chemin(s) retiré(s), brouillon`);
      if (ecrire) {
        for (const entree of entrees) entree.distributionPaths = [];
        writeFileSync(
          cheminManifeste,
          `${JSON.stringify(manifeste, null, 2)}\n`,
          "utf8",
        );
        rmSync(join(PUBLIC_WEB, nom), { force: true, recursive: true });
      }
    }
    continue;
  }

  distribues.add(nom);
  let change = false;
  for (const entree of entrees) {
    const source = join(RACINE, entree.canonicalPath);
    if (!existsSync(source)) {
      throw new Error(`Fichier absent pour ${nom} : ${entree.canonicalPath}`);
    }
    const octets = readFileSync(source);
    const empreinte = createHash("sha256").update(octets).digest("hex");
    // Un octet différent de ce que le manifeste déclare rendrait la
    // vérification d'intégrité du client mensongère.
    if (empreinte !== entree.sha256) {
      throw new Error(`Empreinte divergente pour ${nom}/${entree.assetId}`);
    }
    const relatif = `${PREFIXE}/${nom}/${entree.assetId}.wav`;
    if ((entree.distributionPaths ?? []).includes(relatif)) continue;
    journal.push(`${nom} : ${entree.assetId}.wav distribué`);
    change = true;
    if (ecrire) {
      mkdirSync(join(PUBLIC_WEB, nom), { recursive: true });
      copyFileSync(source, join(PUBLIC_WEB, nom, `${entree.assetId}.wav`));
      entree.distributionPaths = [relatif];
    }
  }
  if (ecrire && change) {
    writeFileSync(
      cheminManifeste,
      `${JSON.stringify(manifeste, null, 2)}\n`,
      "utf8",
    );
  }
}

// Un dossier de leçon qui ne correspond plus à aucune leçon publiée est
// retiré. UNIQUEMENT un dossier de leçon : `public/audio` contient aussi la
// fixture technique, et une première version de ce nettoyage l'a effacée.
if (existsSync(PUBLIC_WEB)) {
  for (const entree of readdirSync(PUBLIC_WEB, { withFileTypes: true })) {
    const dossier = entree.name;
    if (!entree.isDirectory() || !/^u\d{2}-l/u.test(dossier)) continue;
    if (distribues.has(dossier)) continue;
    journal.push(`${dossier} : dossier public orphelin retiré`);
    if (ecrire)
      rmSync(join(PUBLIC_WEB, dossier), { force: true, recursive: true });
  }
}

process.stdout.write(
  `${ecrire ? "Distribution écrite" : "Simulation"} : ${journal.length} changement(s).\n${journal.join("\n")}\n`,
);
