#!/usr/bin/env node
// Migre le corpus vers l'identité de carte par graphie (ADR-0042).
//
// Pourquoi une migration explicite
// --------------------------------
// `compile-text-lessons --write` n'écrit QUE les paquets absents : un
// contenu publié est immuable, et une correction crée une version. Les 66
// paquets sont tous `draft`/`internal` et aucun n'a jamais été publié, donc
// régénérer la version 1 est ici légitime. Ce script rend ce geste explicite
// au lieu de le glisser dans le compilateur, où il détruirait un jour un
// paquet réellement publié.
//
// Ce qu'il faut déplacer avec les identifiants
// -------------------------------------------
// L'identifiant d'un asset audio dérive de celui de l'item, et les WAV sont
// NOMMÉS par cet identifiant. Consolider les cartes renomme donc 23 fichiers
// déjà produits et payés. Leur contenu ne change pas : `sha256`, `byteLength`,
// `durationMs`, la synthèse et le contrôle de contour sont recopiés tels
// quels. Seul le nom bouge.
//
// Usage :
//   node scripts/content/migrer-identite-des-cartes.mjs        (simulation)
//   node scripts/content/migrer-identite-des-cartes.mjs --write

import {
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { uuidStable } from "./lib/identite.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LECONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO = join(RACINE, "packages", "content", "data", "audio");
const ASSETS = join(RACINE, "packages", "content", "assets", "audio");
const PACK = "thai-fr";

const ecrire = process.argv.includes("--write");
const journal = [];

/**
 * Sens déclaré d'une graphie, quand elle en porte un.
 *
 * Relu depuis les sources d'autorat plutôt que déduit : seul un auteur peut
 * dire que deux mots partagent une graphie sans être le même mot.
 */
function sensDeclares() {
  const parGraphie = new Map();
  const racineAutorat = join(RACINE, "content", "authoring");
  for (const unite of readdirSync(racineAutorat, { withFileTypes: true })) {
    if (!unite.isDirectory()) continue;
    const dossier = join(racineAutorat, unite.name);
    for (const fichier of readdirSync(dossier)) {
      if (!/^lecon-.*\.md$/u.test(fichier)) continue;
      const texte = readFileSync(join(dossier, fichier), "utf8");
      for (const bloc of texte.split(/^#{3,4} /mu).slice(1)) {
        const thai = bloc.match(/^- `thai`\s*:\s*(.+)$/mu)?.[1]?.trim();
        const sens = bloc.match(/^- `sens`\s*:\s*(.+)$/mu)?.[1]?.trim();
        if (thai === undefined || sens === undefined) continue;
        parGraphie.set(`${thai.normalize("NFC")}\u0000${sens}`, sens);
      }
    }
  }
  return parGraphie;
}

const SENS = sensDeclares();

function identifiantItem(thaiRaw, sens) {
  return uuidStable("item", PACK, thaiRaw.normalize("NFC"), sens ?? "");
}

for (const fichier of readdirSync(LECONS).sort()) {
  // Les deux fixtures techniques ne sont pas du curriculum : elles gardent
  // leurs identifiants, sur lesquels des tests et des specs sont verrouillés.
  if (!/^u\d{2}-l.*\.v1\.json$/u.test(fichier)) continue;
  const lecon = fichier.split(".")[0];
  const paquet = JSON.parse(readFileSync(join(LECONS, fichier), "utf8"));

  // Ancien identifiant vers nouveau, pour cette leçon.
  const correspondance = new Map();
  for (const item of paquet.items) {
    const sens = [...SENS.keys()]
      .filter((cle) => cle.startsWith(`${item.thaiRaw.normalize("NFC")}\u0000`))
      .map((cle) => SENS.get(cle))
      .find((valeur) => item.translationFr?.includes(valeur));
    correspondance.set(item.id, identifiantItem(item.thaiRaw, sens));
  }

  // Les WAV portent le nom de leur asset, lui-même dérivé de l'item.
  const manifeste = JSON.parse(readFileSync(join(AUDIO, fichier), "utf8"));
  const dossierAssets = join(ASSETS, lecon);
  for (const entree of manifeste.entries ?? []) {
    const ancienItem = [...correspondance.keys()].find(
      (id) => uuidStable("audio", lecon, id) === entree.assetId,
    );
    if (ancienItem === undefined) {
      journal.push(
        `${lecon} : asset ${entree.assetId} sans item, laissé tel quel`,
      );
      continue;
    }
    const nouveau = uuidStable("audio", lecon, correspondance.get(ancienItem));
    if (nouveau === entree.assetId) continue;
    journal.push(`${lecon} : ${entree.assetId} -> ${nouveau}`);
    if (ecrire) {
      renameSync(
        join(dossierAssets, `${entree.assetId}.wav`),
        join(dossierAssets, `${nouveau}.wav`),
      );
      entree.assetId = nouveau;
      // L'entrée porte AUSSI l'item qu'elle prononce et le chemin du fichier.
      // Les oublier laisse un manifeste qui se valide seul mais désigne un
      // item disparu et un fichier renommé.
      entree.itemId = correspondance.get(ancienItem);
      entree.canonicalPath = entree.canonicalPath?.replace(
        /[0-9a-f-]{36}\.wav$/u,
        `${nouveau}.wav`,
      );
    }
  }
  if (ecrire && (manifeste.entries ?? []).length > 0) {
    writeFileSync(
      join(AUDIO, fichier),
      `${JSON.stringify(manifeste, null, 2)}\n`,
      "utf8",
    );
  }

  // Le paquet lui-même est régénéré par le compilateur : on le retire pour
  // que `--write` accepte de le réécrire.
  if (ecrire) rmSync(join(LECONS, fichier));
}

const resume = ecrire ? "Migration appliquée" : "Simulation";
process.stdout.write(
  `${resume} : ${journal.length} asset(s) audio concerné(s).\n${journal.join("\n")}\n`,
);
