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
import fiveMechanicsLessonJson from "../data/lessons/five-mechanics-fixture.v1.json";
import u01l1aLessonJson from "../data/lessons/u01-l1a.v1.json";
import u01l1bLessonJson from "../data/lessons/u01-l1b.v1.json";
import u01l1cLessonJson from "../data/lessons/u01-l1c.v1.json";
import u01l1dLessonJson from "../data/lessons/u01-l1d.v1.json";
import u01l1eLessonJson from "../data/lessons/u01-l1e.v1.json";
import lessonJson from "../data/lessons/unicode-audio-fixture.v1.json";
import registreJson from "../../../content/sources-registry.json";
import sourceJson from "../data/sources/test-only.json";

import {
  audioManifestSchema,
  lessonSchema,
  sourceSchema,
  type ContentBundle,
} from "./schemas";
import { validateBundleMetadata } from "./validation";

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
};

/** Identifiants des leçons réelles disponibles, dans l'ordre du parcours. */
export function compiledLessonIds(): string[] {
  return Object.keys(LECONS_COMPILEES).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
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

export async function validateBundle(bundle: ContentBundle): Promise<void> {
  const { audioManifest } = bundle;
  validateBundleMetadata(bundle);

  for (const entry of audioManifest.entries) {
    await verifyAsset(entry.canonicalPath, entry.sha256, entry.byteLength);
    for (const path of entry.distributionPaths) {
      await verifyAsset(path, entry.sha256, entry.byteLength);
    }
  }
}

export type { ContentBundle } from "./schemas";
