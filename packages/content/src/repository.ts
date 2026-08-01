import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import audioJson from "../data/audio/fixture-audio.v1.json";
import lessonJson from "../data/lessons/unicode-audio-fixture.v1.json";
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
