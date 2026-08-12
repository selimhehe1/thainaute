#!/usr/bin/env tsx
// Compile les pages d'enseignement des leçons dont les exercices restent
// bloqués. Ce paquet est une preview interne : il ne crée ni item, ni exercice,
// ni correction, ni audio.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { analyserEnseignement } from "../../../scripts/content/lib/extraire-enseignement.mjs";
import { analyserLecon } from "../../../scripts/content/lib/parse-authoring.mjs";
import { uuidStable } from "../../../scripts/content/lib/identite.mjs";

import { compilerLecon } from "./compile-items";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");
const LESSONS = join(RACINE, "packages", "content", "data", "lessons");
const TARGET = join(
  RACINE,
  "packages",
  "content",
  "data",
  "drafts",
  "authoring-drafts.v1.json",
);

function lessonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return lessonFiles(path);
    return /^lecon-.*\.md$/u.test(entry.name) ? [path] : [];
  });
}

const entries = lessonFiles(AUTHORING)
  .map((path) => {
    const source = readFileSync(path, "utf8");
    const analysed = analyserLecon(path);
    const lessonId = analysed.meta.identifiant;
    if (lessonId === null) {
      throw new Error(`Identifiant absent : ${relative(RACINE, path)}.`);
    }
    if (existsSync(join(LESSONS, `${lessonId}.v1.json`))) return null;

    const teaching = analyserEnseignement(source);
    if (teaching.length === 0) {
      throw new Error(`Enseignement absent : ${relative(RACINE, path)}.`);
    }

    const itemCompilation = compilerLecon(path);
    const sourceIds = [
      ...new Set(
        (itemCompilation.compiles as { sourceIds?: string[] }[]).flatMap(
          (item) => item.sourceIds ?? [],
        ),
      ),
    ].sort();

    return {
      schemaVersion: 1 as const,
      lessonId,
      versionId: uuidStable("authoring-draft-version", lessonId, "1"),
      revision: 1 as const,
      workflowStatus: "draft" as const,
      visibility: "internal" as const,
      locale: "fr-FR" as const,
      titleFr: analysed.meta.titreFr ?? lessonId,
      objectiveFr: analysed.meta.objectifFr ?? lessonId,
      sourceFile: relative(RACINE, path).replaceAll("\\", "/"),
      sourceIds,
      authoringStatus: ["draft", "review", "approved", "published"].includes(
        analysed.meta.statut ?? "",
      )
        ? (analysed.meta.statut as
            "draft" | "review" | "approved" | "published")
        : ("unknown" as const),
      teaching,
      blockers: [
        {
          code: "EXERCISES_NOT_COMPILED" as const,
          summaryFr:
            "Les pages sont consultables, mais les exercices restent masqués jusqu'à leur compilation et leur audit.",
        },
      ],
    };
  })
  .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
  .sort((left, right) =>
    left.lessonId < right.lessonId
      ? -1
      : left.lessonId > right.lessonId
        ? 1
        : 0,
  );

writeFileSync(
  TARGET,
  `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Aperçus écrits : ${entries.length} leçons textuelles internes, sans exercices ni audio.`,
);
