#!/usr/bin/env tsx
// Génère l'index statique des paquets d'autorat compilés.
//
// Le catalogue donne les métadonnées, mais le serveur web doit aussi pouvoir
// ouvrir chaque paquet sans lire le disque à l'exécution. Les imports JSON
// explicites permettent à Next.js d'embarquer les données et font échouer le
// build si un fichier compilé manque.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = join(
  PACKAGE_ROOT,
  "data",
  "catalog",
  "authoring-lessons.v1.json",
);
const LESSONS = join(PACKAGE_ROOT, "data", "lessons");
const AUDIO = join(PACKAGE_ROOT, "data", "audio");
const OUTPUT = join(PACKAGE_ROOT, "src", "authoring-compiled.generated.ts");

interface CatalogEntry {
  lessonId: string;
  compiled: boolean;
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as {
  entries: CatalogEntry[];
};
const entries = catalog.entries
  .filter(({ compiled }) => compiled)
  .sort((left, right) => left.lessonId.localeCompare(right.lessonId));

for (const { lessonId } of entries) {
  const lessonPath = join(LESSONS, `${lessonId}.v1.json`);
  const audioPath = join(AUDIO, `${lessonId}.v1.json`);
  if (!existsSync(lessonPath) || !existsSync(audioPath)) {
    throw new Error(`Paquet d'autorat incomplet : ${lessonId}.`);
  }
}

const identifiantModule = (lessonId: string): string =>
  lessonId.replaceAll("-", "");

const imports = entries
  .flatMap(({ lessonId }) => {
    const moduleId = identifiantModule(lessonId);
    return [
      `import ${moduleId}LessonJson from "../data/lessons/${lessonId}.v1.json";`,
      `import ${moduleId}AudioJson from "../data/audio/${lessonId}.v1.json";`,
    ];
  })
  .join("\n");

const records = entries
  .map(({ lessonId }) => {
    const moduleId = identifiantModule(lessonId);
    return `  "${lessonId}": { lesson: ${moduleId}LessonJson, audio: ${moduleId}AudioJson },`;
  })
  .join("\n");

const output = `// Fichier généré par scripts/generate-authoring-module.ts. Ne pas modifier à la main.
${imports}

export const AUTHORING_COMPILED = {
${records}
} as const;
`;

writeFileSync(OUTPUT, output, "utf8");
console.log(`Index statique écrit : ${entries.length} paquets d'autorat.`);
