import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

const lessonsDirectory = join(
  repositoryRoot,
  "packages",
  "content",
  "data",
  "lessons",
);
const audioDirectory = join(
  repositoryRoot,
  "packages",
  "content",
  "data",
  "audio",
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Ce qu'un export distribuable n'a pas le droit de contenir.
 *
 * La liste des six leçons U01 était écrite en dur, et tout leur contenu
 * comptait comme brouillon. C'était vrai le jour où l'ADR-0041 a été prise,
 * ce ne l'est plus depuis la signature de l'unité 1 : cinq de ces leçons
 * sont publiées et ont vocation à être distribuées.
 *
 * La règle réelle n'a jamais été « rien de l'unité 1 », c'était « rien qui
 * ne soit publié ». Le contrôle lit donc le statut de CHAQUE paquet du
 * corpus, ce qui le rend juste pour les 66 leçons au lieu de 6, et le
 * dispense d'être remis à jour à chaque publication.
 */
function partitionnerLeCorpus() {
  const marqueursBrouillon = new Set();
  const empreintesAutorisees = new Set([fixtureAudioHash]);

  for (const fichier of readdirSync(lessonsDirectory)) {
    if (!fichier.endsWith(".v1.json")) continue;
    const lesson = readJson(join(lessonsDirectory, fichier));
    const audioPath = join(audioDirectory, fichier);
    const audio = existsSync(audioPath) ? readJson(audioPath) : { entries: [] };
    // La boucle technique n'est pas un brouillon : elle est délibérément
    // embarquée, et chaque écran qui la sert l'annonce comme fictive. Elle
    // n'enseigne aucun thaï, il n'y a donc rien à protéger.
    if (lesson.visibility === "fixture") continue;

    const publiee =
      lesson.workflowStatus === "published" && lesson.visibility === "public";

    if (publiee) {
      // L'audio d'une leçon publiée a le droit de partir dans la build. On
      // autorise son empreinte, pas son chemin : un fichier renommé mais
      // identique reste le même son, un fichier modifié ne passe pas.
      for (const entry of audio.entries ?? []) {
        if (typeof entry.sha256 === "string") {
          empreintesAutorisees.add(entry.sha256);
        }
      }
      continue;
    }

    for (const marker of [
      lesson.versionId,
      lesson.titleFr,
      lesson.objectiveFr,
      ...(audio.entries ?? []).map((entry) => entry.assetId),
    ]) {
      if (estUnMarqueurUtile(marker)) marqueursBrouillon.add(marker);
    }
  }

  return {
    marqueursBrouillon: [...marqueursBrouillon],
    empreintesAutorisees,
  };
}

/**
 * Un marqueur trop banal ferait échouer tout export sans rien prouver : une
 * suite de chiffres ou de ponctuation se retrouve par hasard dans du code
 * minifié. On ne garde que ce qui identifie vraiment une leçon.
 */
function estUnMarqueurUtile(marker) {
  return (
    typeof marker === "string" &&
    marker.length >= 8 &&
    !/^[\s\d.,;:!?-]*$/u.test(marker)
  );
}

const { marqueursBrouillon: draftMarkers, empreintesAutorisees } =
  partitionnerLeCorpus();

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

  if (wavAssets.length === 0) {
    fail(`${platform} ne contient aucun WAV, pas même la fixture technique.`);
  }

  // Chaque son embarqué doit être la fixture, ou l'audio d'une leçon
  // publiée. L'appariement se fait sur l'empreinte déclarée par le
  // manifeste : un fichier modifié après son contrôle acoustique ne
  // ressemble plus à ce qui a été audité, et ne doit pas partir.
  for (const asset of wavAssets) {
    const wavPath = join(outputRoot, asset.path);
    const empreinte = sha256(readFileSync(wavPath));
    if (!empreintesAutorisees.has(empreinte)) {
      fail(
        `${platform} contient un WAV qui n'est ni la fixture ni l'audio d'une leçon publiée (${asset.path}).`,
      );
    }
  }
  const wavPath = join(outputRoot, wavAssets[0].path);

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
    `Export ${result.platform} sûr: tous ses WAV sont autorisés et ${draftMarkers.length} marqueurs de brouillon sont absents.`,
  );
}
