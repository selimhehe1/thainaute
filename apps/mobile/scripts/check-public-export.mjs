import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(mobileRoot, "../..");
const fixtureAudioPath = join(
  mobileRoot,
  "assets",
  "audio",
  "fixture-tone.wav",
);
const fixtureAudio = readFileSync(fixtureAudioPath);
const fixtureAudioHash = createHash("sha256")
  .update(fixtureAudio)
  .digest("hex");

const lessonKeys = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1c",
  "u01-l1d",
  "u01-l1e",
  "u01-l1f",
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectDraftMarkers() {
  const markers = new Set();

  for (const lessonKey of lessonKeys) {
    const lesson = readJson(
      join(
        repositoryRoot,
        "packages",
        "content",
        "data",
        "lessons",
        `${lessonKey}.v1.json`,
      ),
    );
    const audio = readJson(
      join(
        repositoryRoot,
        "packages",
        "content",
        "data",
        "audio",
        `${lessonKey}.v1.json`,
      ),
    );

    for (const marker of [
      lesson.versionId,
      lesson.titleFr,
      lesson.objectiveFr,
      ...audio.entries.map((entry) => entry.assetId),
    ]) {
      if (typeof marker === "string" && marker.length >= 8) {
        markers.add(marker);
      }
    }
  }

  return [...markers];
}

const draftMarkers = collectDraftMarkers();

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function fail(message) {
  throw new Error(`Export mobile public refusé: ${message}`);
}

function verifyExport(outputDirectory) {
  const outputRoot = resolve(mobileRoot, outputDirectory);
  const metadata = readJson(join(outputRoot, "metadata.json"));
  const platformEntries = Object.entries(metadata.fileMetadata ?? {});

  if (platformEntries.length !== 1) {
    fail(`${basename(outputRoot)} doit décrire exactement une plateforme.`);
  }

  const [platform, platformMetadata] = platformEntries[0];
  const assets = platformMetadata.assets ?? [];
  const wavAssets = assets.filter(({ ext }) => ext === "wav");

  if (wavAssets.length !== 1) {
    fail(
      `${platform} contient ${wavAssets.length} WAV; seule la fixture technique est autorisée.`,
    );
  }

  const wavPath = join(outputRoot, wavAssets[0].path);
  const wav = readFileSync(wavPath);
  if (wav.length !== fixtureAudio.length || sha256(wav) !== fixtureAudioHash) {
    fail(`${platform} contient un WAV qui n'est pas la fixture autorisée.`);
  }

  const bundlePath = join(outputRoot, platformMetadata.bundle);
  const bundle = readFileSync(bundlePath);
  const leakedMarker = draftMarkers.find((marker) =>
    bundle.includes(Buffer.from(marker, "utf8")),
  );

  if (leakedMarker !== undefined) {
    fail(
      `${platform} contient encore un identifiant ou texte du contenu U01 draft (${JSON.stringify(leakedMarker.slice(0, 80))}).`,
    );
  }

  return { platform, bundlePath, wavPath };
}

const outputDirectories = process.argv.slice(2);
if (outputDirectories.length === 0) {
  fail("aucun répertoire d'export n'a été fourni.");
}

for (const outputDirectory of outputDirectories) {
  const result = verifyExport(outputDirectory);
  console.log(
    `Export ${result.platform} sûr: fixture WAV unique et ${draftMarkers.length} marqueurs draft absents.`,
  );
}
