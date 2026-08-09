#!/usr/bin/env tsx
// Compile les leçons textuellement compilables sans fabriquer d'audio.
//
// Les fichiers qui échouent restent nommés dans la sortie. Les manifestes
// vides sont explicites : le site peut montrer l'enseignement, mais ne doit
// jamais prétendre qu'un exercice d'écoute possède déjà une voix.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { compilerLeconComplete } from "./compile-lesson";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");
const LESSONS = join(RACINE, "packages", "content", "data", "lessons");
const AUDIO = join(RACINE, "packages", "content", "data", "audio");
const shouldWrite = process.argv.includes("--write");

function lessonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return lessonFiles(path);
    return /^lecon-.*\.md$/u.test(entry.name) ? [path] : [];
  });
}

const successes: string[] = [];
const failures: { id: string; reason: string }[] = [];

for (const sourcePath of lessonFiles(AUTHORING)) {
  const source = readFileSync(sourcePath, "utf8");
  const identifier = source.match(/^- Identifiant\s*:\s*`([^`]+)`/mu)?.[1];
  if (identifier === undefined) {
    failures.push({
      id: relative(RACINE, sourcePath),
      reason: "identifiant absent",
    });
    continue;
  }

  try {
    const result = compilerLeconComplete(sourcePath);
    const lessonPath = join(LESSONS, `${identifier}.v1.json`);
    const audioPath = join(AUDIO, `${identifier}.v1.json`);

    if (shouldWrite && !existsSync(lessonPath)) {
      writeFileSync(
        lessonPath,
        `${JSON.stringify(result.lesson, null, 2)}\n`,
        "utf8",
      );
    }
    if (shouldWrite && !existsSync(audioPath)) {
      writeFileSync(
        audioPath,
        `${JSON.stringify(
          {
            schemaVersion: 1,
            manifestId: result.lesson.audioManifestId,
            lessonVersionId: result.lesson.versionId,
            entries: [],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }
    successes.push(identifier);
  } catch (error) {
    failures.push({
      id: identifier,
      reason:
        String(error)
          .replace(/^Error:\s*/u, "")
          .split("\n")[0] ?? "erreur inconnue",
    });
  }
}

console.log(
  `${shouldWrite ? "Compilation écrite" : "Compilation simulée"} : ${successes.length} leçons textuelles prêtes, ${failures.length} bloquées.`,
);
for (const identifier of successes) console.log(`  PASS ${identifier}`);
for (const failure of failures)
  console.log(`  FAIL ${failure.id} : ${failure.reason}`);

if (failures.length > 0) process.exitCode = 1;
