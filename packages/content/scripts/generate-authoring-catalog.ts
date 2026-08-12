#!/usr/bin/env tsx
// Construit le catalogue de parcours à partir des fichiers d'autorat.
//
// Le catalogue ne publie pas le Markdown interne : il porte uniquement une
// identité, un titre, un objectif et l'état de compilation. Les leçons qui ne
// passent pas le compilateur restent visibles comme « à préparer », jamais
// comme un contenu silencieusement tronqué.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const AUTHORING = join(RACINE, "content", "authoring");
const LESSONS = join(RACINE, "packages", "content", "data", "lessons");
const TARGET = join(
  RACINE,
  "packages",
  "content",
  "data",
  "catalog",
  "authoring-lessons.v1.json",
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function champ(text: string, label: string): string | null {
  const lines = text.split(/\r?\n/u);
  const pattern = new RegExp(`^- ${escapeRegExp(label)}\\s*:\\s*(.*)$`, "u");
  const start = lines.findIndex((line) => pattern.test(line));
  if (start < 0) return null;

  const first = lines[start]?.match(pattern)?.[1] ?? "";
  const parts = [first];
  for (const line of lines.slice(start + 1)) {
    if (
      line.trim().length === 0 ||
      /^#{1,6}\s/u.test(line) ||
      /^\s*[-+*]\s/u.test(line) ||
      !/^\s+/u.test(line)
    ) {
      break;
    }
    parts.push(line.trim());
  }

  const value = parts
    .join(" ")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/^`|`$/gu, "");
  return value.length === 0 ? null : value;
}

function section(text: string, heading: string): string | null {
  const start = text.search(new RegExp(`^### ${heading}\\s*$`, "mu"));
  if (start < 0) return null;
  const contentStart = text.indexOf("\n", start);
  if (contentStart < 0) return null;
  const afterHeading = text.slice(contentStart + 1);
  const nextHeading = afterHeading.search(/^### |^## /mu);
  const raw =
    nextHeading < 0 ? afterHeading : afterHeading.slice(0, nextHeading);
  const value = raw.replace(/\s+/gu, " ").trim();
  return value.length === 0 ? null : value;
}

function lessonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return lessonFiles(path);
    return /^lecon-.*\.md$/u.test(entry.name) ? [path] : [];
  });
}

const INTERNAL_NOTE_PATTERN =
  /(?:titre de travail|note (?:interne|éditoriale)|contre-audit|finding\s|tmp-[a-z0-9-]+)/iu;
const UNSUPPORTED_MARKDOWN_PATTERN =
  /(?:__|`|!\[[^\]]*\]\(|\[[^\]]+\]\(|<[^>]+>|^#{1,6}\s|^\s*[-+*]\s)/mu;

function publicMetadata(
  raw: string,
  label: string,
  maximumLength: number,
  sourcePath: string,
  allowInternalNotes = false,
): string {
  // L'emphase et le code inline d'autorat deviennent du texte brut ; le
  // contenu lexical est conservé, aucun champ n'est tronqué.
  const value = raw
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .trim();
  if (value.length === 0 || value.length > maximumLength) {
    throw new Error(
      `${label} public invalide (${value.length}/${maximumLength}) : ${relative(RACINE, sourcePath)}.`,
    );
  }
  if (UNSUPPORTED_MARKDOWN_PATTERN.test(value)) {
    throw new Error(
      `${label} public contient du Markdown non pris en charge : ${relative(RACINE, sourcePath)}.`,
    );
  }
  if (!allowInternalNotes && INTERNAL_NOTE_PATTERN.test(value)) {
    throw new Error(
      `${label} public contient une note éditoriale interne : ${relative(RACINE, sourcePath)}.`,
    );
  }
  return value;
}

const entries = lessonFiles(AUTHORING).map((path) => {
  const source = readFileSync(path, "utf8");
  const lessonId = champ(source, "Identifiant");
  const titleFr = champ(source, "Titre français");
  const objectiveFr =
    champ(source, "Objectif observable") ??
    section(source, "Objectif observable");
  const authoringStatus =
    source.match(/^- Statut\s*:\s*`([^`]+)`/mu)?.[1] ?? "unknown";

  if (lessonId === null || titleFr === null || objectiveFr === null) {
    throw new Error(`Méta de leçon incomplète : ${relative(RACINE, path)}.`);
  }

  const identity = lessonId.match(/^u(\d{2})-l\d+([a-f])$/u);
  if (identity === null) {
    throw new Error(`Identifiant de leçon inattendu : ${lessonId}.`);
  }

  const unitNumber = Number(identity[1]);
  const unitId = `u${identity[1]}`;
  const compiled = existsSync(join(LESSONS, `${lessonId}.v1.json`));

  return {
    schemaVersion: 1 as const,
    lessonId,
    unitId,
    unitNumber,
    lessonLetter: identity[2] ?? "a",
    titleFr: publicMetadata(titleFr, "Titre", 160, path),
    objectiveFr: publicMetadata(objectiveFr, "Objectif", 3_000, path, true),
    authoringStatus: ["draft", "review", "approved", "published"].includes(
      authoringStatus,
    )
      ? (authoringStatus as "draft" | "review" | "approved" | "published")
      : ("unknown" as const),
    compiled,
  };
});

entries.sort((left, right) =>
  left.lessonId < right.lessonId ? -1 : left.lessonId > right.lessonId ? 1 : 0,
);

writeFileSync(
  TARGET,
  `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Catalogue écrit : ${entries.length} leçons, ${entries.filter(({ compiled }) => compiled).length} compilées, ${entries.filter(({ compiled }) => !compiled).length} à préparer.`,
);
