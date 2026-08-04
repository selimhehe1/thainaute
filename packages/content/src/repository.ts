import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import audioJson from "../data/audio/fixture-audio.v1.json";
import fiveMechanicsAudioJson from "../data/audio/five-mechanics-audio.v1.json";
import u01l1aAudioJson from "../data/audio/u01-l1a.v1.json";
import fiveMechanicsLessonJson from "../data/lessons/five-mechanics-fixture.v1.json";
import u01l1aLessonJson from "../data/lessons/u01-l1a.v1.json";
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
 * Première leçon réelle du curriculum, compilée depuis son fichier
 * d'autorat par `content:compile-lesson` (unité 1, leçon 1A : écouter les
 * cinq tons).
 *
 * Elle reste en statut `draft`, visibilité `internal`, et sa porte de
 * publication est fermée : elle est affichable, pas publiable. « Revue
 * native : en attente » demeure vrai.
 */
export function readUnite01Lecon1aBundle(): ContentBundle {
  const lesson = lessonSchema.parse(u01l1aLessonJson);
  const utilisees = new Set(lesson.provenance.sourceIds);
  return {
    lesson,
    audioManifest: audioManifestSchema.parse(u01l1aAudioJson),
    sources: (registreJson as { sources: unknown[] }).sources
      .map((brut) => sourceSchema.parse(sansNotes(brut)))
      .filter((source) => utilisees.has(source.sourceId)),
  };
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
