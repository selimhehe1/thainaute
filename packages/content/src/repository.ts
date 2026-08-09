import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import audioJson from "../data/audio/fixture-audio.v1.json";
import fiveMechanicsAudioJson from "../data/audio/five-mechanics-audio.v1.json";
import u01l1aAudioJson from "../data/audio/u01-l1a.v1.json";
import u01l1bAudioJson from "../data/audio/u01-l1b.v1.json";
import u01l1cAudioJson from "../data/audio/u01-l1c.v1.json";
import u01l1dAudioJson from "../data/audio/u01-l1d.v1.json";
import u01l1eAudioJson from "../data/audio/u01-l1e.v1.json";
import u01l1fAudioJson from "../data/audio/u01-l1f.v1.json";
import u02l2aAudioJson from "../data/audio/u02-l2a.v1.json";
import u02l2bAudioJson from "../data/audio/u02-l2b.v1.json";
import u02l2cAudioJson from "../data/audio/u02-l2c.v1.json";
import u02l2dAudioJson from "../data/audio/u02-l2d.v1.json";
import u02l2eAudioJson from "../data/audio/u02-l2e.v1.json";
import u03l3aAudioJson from "../data/audio/u03-l3a.v1.json";
import u03l3cAudioJson from "../data/audio/u03-l3c.v1.json";
import u04l4aAudioJson from "../data/audio/u04-l4a.v1.json";
import u05l5cAudioJson from "../data/audio/u05-l5c.v1.json";
import u05l5eAudioJson from "../data/audio/u05-l5e.v1.json";
import u06l6bAudioJson from "../data/audio/u06-l6b.v1.json";
import u08l8aAudioJson from "../data/audio/u08-l8a.v1.json";
import u09l9aAudioJson from "../data/audio/u09-l9a.v1.json";
import u10l10aAudioJson from "../data/audio/u10-l10a.v1.json";
import u10l10cAudioJson from "../data/audio/u10-l10c.v1.json";
import u10l10dAudioJson from "../data/audio/u10-l10d.v1.json";
import u11l11bAudioJson from "../data/audio/u11-l11b.v1.json";
import u12l12cAudioJson from "../data/audio/u12-l12c.v1.json";
import fiveMechanicsLessonJson from "../data/lessons/five-mechanics-fixture.v1.json";
import u01l1aLessonJson from "../data/lessons/u01-l1a.v1.json";
import u01l1bLessonJson from "../data/lessons/u01-l1b.v1.json";
import u01l1cLessonJson from "../data/lessons/u01-l1c.v1.json";
import u01l1dLessonJson from "../data/lessons/u01-l1d.v1.json";
import u01l1eLessonJson from "../data/lessons/u01-l1e.v1.json";
import u01l1fLessonJson from "../data/lessons/u01-l1f.v1.json";
import u02l2aLessonJson from "../data/lessons/u02-l2a.v1.json";
import u02l2bLessonJson from "../data/lessons/u02-l2b.v1.json";
import u02l2cLessonJson from "../data/lessons/u02-l2c.v1.json";
import u02l2dLessonJson from "../data/lessons/u02-l2d.v1.json";
import u02l2eLessonJson from "../data/lessons/u02-l2e.v1.json";
import u03l3aLessonJson from "../data/lessons/u03-l3a.v1.json";
import u03l3cLessonJson from "../data/lessons/u03-l3c.v1.json";
import u04l4aLessonJson from "../data/lessons/u04-l4a.v1.json";
import u05l5cLessonJson from "../data/lessons/u05-l5c.v1.json";
import u05l5eLessonJson from "../data/lessons/u05-l5e.v1.json";
import u06l6bLessonJson from "../data/lessons/u06-l6b.v1.json";
import u08l8aLessonJson from "../data/lessons/u08-l8a.v1.json";
import u09l9aLessonJson from "../data/lessons/u09-l9a.v1.json";
import u10l10aLessonJson from "../data/lessons/u10-l10a.v1.json";
import u10l10cLessonJson from "../data/lessons/u10-l10c.v1.json";
import u10l10dLessonJson from "../data/lessons/u10-l10d.v1.json";
import u11l11bLessonJson from "../data/lessons/u11-l11b.v1.json";
import u12l12cLessonJson from "../data/lessons/u12-l12c.v1.json";
import lessonJson from "../data/lessons/unicode-audio-fixture.v1.json";
import registreJson from "../../../content/sources-registry.json";
import sourceJson from "../data/sources/test-only.json";

import {
  audioManifestSchema,
  lessonSchema,
  sourceSchema,
  type ContentBundle,
} from "./schemas";
import {
  validateBundleAudioReferences,
  validateBundleStructureMetadata,
} from "./validation";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageDirectory, "../..");

export function readFixtureBundle(): ContentBundle {
  return {
    lesson: lessonSchema.parse(lessonJson),
    audioManifest: audioManifestSchema.parse(audioJson),
    sources: [sourceSchema.parse(sourceJson)],
  };
}

/** Fixture technique couvrant les cinq mécaniques d'exercice (ADR-0024). */
export function readFiveMechanicsFixtureBundle(): ContentBundle {
  return {
    lesson: lessonSchema.parse(fiveMechanicsLessonJson),
    audioManifest: audioManifestSchema.parse(fiveMechanicsAudioJson),
    sources: [sourceSchema.parse(sourceJson)],
  };
}

/**
 * Le registre porte des clés de documentation préfixées par `$`, écrites
 * pour les humains qui le relisent. Le schéma est strict : on les retire
 * avant validation, pour qu'une VRAIE clé inconnue continue d'être refusée.
 */
function sansNotes(brut: unknown): unknown {
  return Object.fromEntries(
    Object.entries(brut as Record<string, unknown>).filter(
      ([cle]) => !cle.startsWith("$"),
    ),
  );
}

/**
 * Registre des leçons réelles compilées depuis `content/authoring` par
 * `content:compile-lesson`.
 *
 * Les imports sont statiques et explicites : le paquet est consommé par un
 * bundler, qui ne sait pas lire un dossier à l'exécution. Ajouter une leçon
 * tient donc en deux lignes, et une leçon absente du registre est
 * simplement introuvable, jamais silencieusement remplacée.
 *
 * Toutes restent en statut `draft` et visibilité `internal` : affichables,
 * pas publiables. « Revue native : en attente » demeure vrai.
 */
const LECONS_COMPILEES: Readonly<
  Record<string, { lesson: unknown; audio: unknown }>
> = {
  "u01-l1a": { lesson: u01l1aLessonJson, audio: u01l1aAudioJson },
  "u01-l1b": {
    lesson: u01l1bLessonJson,
    audio: u01l1bAudioJson,
  },
  "u01-l1c": {
    lesson: u01l1cLessonJson,
    audio: u01l1cAudioJson,
  },
  "u01-l1d": { lesson: u01l1dLessonJson, audio: u01l1dAudioJson },
  "u01-l1e": {
    lesson: u01l1eLessonJson,
    audio: u01l1eAudioJson,
  },
  "u01-l1f": { lesson: u01l1fLessonJson, audio: u01l1fAudioJson },
  "u02-l2a": { lesson: u02l2aLessonJson, audio: u02l2aAudioJson },
  "u02-l2b": { lesson: u02l2bLessonJson, audio: u02l2bAudioJson },
  "u02-l2c": { lesson: u02l2cLessonJson, audio: u02l2cAudioJson },
  "u02-l2d": { lesson: u02l2dLessonJson, audio: u02l2dAudioJson },
  "u02-l2e": { lesson: u02l2eLessonJson, audio: u02l2eAudioJson },
  "u03-l3a": { lesson: u03l3aLessonJson, audio: u03l3aAudioJson },
  "u03-l3c": { lesson: u03l3cLessonJson, audio: u03l3cAudioJson },
  "u04-l4a": { lesson: u04l4aLessonJson, audio: u04l4aAudioJson },
  "u05-l5c": { lesson: u05l5cLessonJson, audio: u05l5cAudioJson },
  "u05-l5e": { lesson: u05l5eLessonJson, audio: u05l5eAudioJson },
  "u06-l6b": { lesson: u06l6bLessonJson, audio: u06l6bAudioJson },
  "u08-l8a": { lesson: u08l8aLessonJson, audio: u08l8aAudioJson },
  "u09-l9a": { lesson: u09l9aLessonJson, audio: u09l9aAudioJson },
  "u10-l10a": { lesson: u10l10aLessonJson, audio: u10l10aAudioJson },
  "u10-l10c": { lesson: u10l10cLessonJson, audio: u10l10cAudioJson },
  "u10-l10d": { lesson: u10l10dLessonJson, audio: u10l10dAudioJson },
  "u11-l11b": { lesson: u11l11bLessonJson, audio: u11l11bAudioJson },
  "u12-l12c": { lesson: u12l12cLessonJson, audio: u12l12cAudioJson },
};

/**
 * Ordre du parcours, décidé, et non déduit d'un tri.
 *
 * Cet ordre était auparavant `Object.keys(...).sort()` : la séquence
 * pédagogique, qui est la décision produit la plus lourde d'un cours de
 * langue, était une conséquence accidentelle de l'ordre alphabétique des
 * identifiants. Elle n'avait donc jamais été écrite, ni discutée.
 *
 * La séquence ci-dessous suit une échelle de difficulté de tâche, et non
 * l'ordre de rédaction des leçons : 2 choix sur le contraste le plus large
 * (1A), la longueur vocalique (1B), 2 choix sur les deux paires réputées les
 * plus confusables (1C puis 1D), 5 choix en synthèse (1F), puis le premier
 * dialogue (1E).
 *
 * Les identifiants ne sont volontairement pas renommés : ils sont cités par
 * des dizaines de leçons du corpus et par les dossiers de vérification. Un
 * renommage casserait ces renvois sans rien apporter.
 *
 * Motif détaillé : `docs/curriculum/ordre-par-difficulte.md`.
 */
const ORDRE_PARCOURS: readonly string[] = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1c",
  "u01-l1d",
  "u01-l1f",
  "u01-l1e",
];

/** Identifiants des leçons réelles disponibles, dans l'ordre du parcours. */
export function compiledLessonIds(): string[] {
  const connus = new Set(Object.keys(LECONS_COMPILEES));
  const ordonnes = ORDRE_PARCOURS.filter((id) => connus.has(id));
  // Une leçon compilée mais absente de l'ordre resterait invisible dans le
  // parcours sans que rien ne le signale. On la place à la fin plutôt que
  // de la perdre en silence.
  const oubliees = [...connus]
    .filter((id) => !ORDRE_PARCOURS.includes(id))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return [...ordonnes, ...oubliees];
}

/** `null` quand l'identifiant ne désigne aucune leçon compilée. */
export function readCompiledLessonBundle(
  identifiant: string,
): ContentBundle | null {
  const brut = LECONS_COMPILEES[identifiant];
  if (brut === undefined) return null;
  const lesson = lessonSchema.parse(brut.lesson);
  const utilisees = new Set(lesson.provenance.sourceIds);
  return {
    lesson,
    audioManifest: audioManifestSchema.parse(brut.audio),
    sources: (registreJson as { sources: unknown[] }).sources
      .map((source) => sourceSchema.parse(sansNotes(source)))
      .filter((source) => utilisees.has(source.sourceId)),
  };
}

/** Première leçon du parcours, celle qu'ouvre la session du jour. */
export function readUnite01Lecon1aBundle(): ContentBundle {
  const bundle = readCompiledLessonBundle("u01-l1a");
  if (bundle === null) throw new Error("Leçon u01-l1a absente du registre.");
  return bundle;
}

/**
 * Adresse publique d'un asset audio, dérivée de son chemin de
 * distribution. Le manifeste dit `apps/web/public/audio/x/y.wav` ; le
 * navigateur attend `/audio/x/y.wav`.
 */
export function publicAudioSources(
  bundle: ContentBundle,
): Record<string, string> {
  const sortie: Record<string, string> = {};
  for (const entree of bundle.audioManifest.entries) {
    const chemin = entree.distributionPaths.find((candidat) =>
      candidat.startsWith("apps/web/public/"),
    );
    if (chemin === undefined) continue;
    sortie[entree.assetId] = chemin.slice("apps/web/public".length);
  }
  return sortie;
}

async function verifyAsset(
  path: string,
  hash: string,
  bytes: number,
): Promise<void> {
  const absolutePath = resolve(repositoryRoot, path);
  const file = await readFile(absolutePath);
  const actualHash = createHash("sha256").update(file).digest("hex");
  if (file.byteLength !== bytes || actualHash !== hash) {
    throw new Error(`Audio incohérent: ${path}.`);
  }
}

export async function validateBundleAudioFiles(
  bundle: ContentBundle,
): Promise<void> {
  const { audioManifest } = bundle;
  for (const entry of audioManifest.entries) {
    await verifyAsset(entry.canonicalPath, entry.sha256, entry.byteLength);
    for (const path of entry.distributionPaths) {
      await verifyAsset(path, entry.sha256, entry.byteLength);
    }
  }
}

/**
 * Exécute les trois portes indépendamment et restitue toutes leurs erreurs.
 * Une référence audio absente ne peut ainsi plus cacher une incohérence
 * structurelle, et inversement.
 */
export async function validateBundle(bundle: ContentBundle): Promise<void> {
  const issues: string[] = [];
  const capture = async (
    phase: string,
    validation: () => void | Promise<void>,
  ): Promise<void> => {
    try {
      await validation();
    } catch (error) {
      issues.push(`[${phase}] ${String(error).replace(/^Error:\s*/u, "")}`);
    }
  };

  await capture("structure", () => validateBundleStructureMetadata(bundle));
  await capture("références audio", () =>
    validateBundleAudioReferences(bundle),
  );
  await capture("fichiers audio", () => validateBundleAudioFiles(bundle));

  if (issues.length > 0) {
    throw new Error(issues.join("\n"));
  }
}

export type { ContentBundle } from "./schemas";
