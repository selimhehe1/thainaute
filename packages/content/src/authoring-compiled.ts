import registreJson from "../../../content/sources-registry.json";

import { authoringCatalog } from "./catalog";
import {
  audioManifestSchema,
  lessonSchema,
  sourceSchema,
  type ContentBundle,
} from "./schemas";
import { AUTHORING_COMPILED } from "./authoring-compiled.generated";

function sansNotes(brut: unknown): unknown {
  return Object.fromEntries(
    Object.entries(brut as Record<string, unknown>).filter(
      ([cle]) => !cle.startsWith("$"),
    ),
  );
}

const sources = (registreJson as { sources: unknown[] }).sources.map((source) =>
  sourceSchema.parse(sansNotes(source)),
);

const compiledIds = authoringCatalog
  .filter(({ compiled }) => compiled)
  .map(({ lessonId }) => lessonId);

/** Tous les paquets issus de l'autorat et compilés pour la QA interne. */
export function authoringCompiledLessonIds(): string[] {
  return [...compiledIds];
}

/** Lit un paquet compilé d'autorat embarqué dans le bundle serveur. */
export function readAuthoringCompiledLessonBundle(
  lessonId: string,
): ContentBundle | null {
  if (!compiledIds.includes(lessonId)) return null;
  const raw = AUTHORING_COMPILED[lessonId as keyof typeof AUTHORING_COMPILED];
  if (raw === undefined) {
    throw new Error(`Index de paquets d'autorat incomplet : ${lessonId}.`);
  }

  const lesson = lessonSchema.parse(raw.lesson);
  const audioManifest = audioManifestSchema.parse(raw.audio);
  const usedSourceIds = new Set(lesson.provenance.sourceIds);
  return {
    lesson,
    audioManifest,
    sources: sources.filter((source) => usedSourceIds.has(source.sourceId)),
  };
}
