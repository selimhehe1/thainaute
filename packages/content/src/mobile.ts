/**
 * Lecture embarquée pour Expo/React Native.
 *
 * `repository.ts` lit aussi le registre de sources et expose des helpers
 * Node.js destinés au web et aux scripts. Le mobile ne doit pas importer ce
 * module : son bundle garde uniquement les JSON de contenu nécessaires à la
 * tranche locale, sans `node:fs` ni accès au système de fichiers.
 */
import u01l1aAudioJson from "../data/audio/u01-l1a.v1.json";
import u01l1bAudioJson from "../data/audio/u01-l1b.v1.json";
import u01l1cAudioJson from "../data/audio/u01-l1c.v1.json";
import u01l1dAudioJson from "../data/audio/u01-l1d.v1.json";
import u01l1eAudioJson from "../data/audio/u01-l1e.v1.json";
import u01l1fAudioJson from "../data/audio/u01-l1f.v1.json";
import u01l1aLessonJson from "../data/lessons/u01-l1a.v1.json";
import u01l1bLessonJson from "../data/lessons/u01-l1b.v1.json";
import u01l1cLessonJson from "../data/lessons/u01-l1c.v1.json";
import u01l1dLessonJson from "../data/lessons/u01-l1d.v1.json";
import u01l1eLessonJson from "../data/lessons/u01-l1e.v1.json";
import u01l1fLessonJson from "../data/lessons/u01-l1f.v1.json";

import {
  audioManifestSchema,
  lessonSchema,
  type AudioManifest,
  type Lesson,
} from "./schemas";

export interface EmbeddedLessonBundle {
  readonly audioManifest: AudioManifest;
  readonly lesson: Lesson;
}

export const EMBEDDED_UNITE_01_LESSON_KEYS = [
  "u01-l1a",
  "u01-l1b",
  "u01-l1c",
  "u01-l1d",
  "u01-l1f",
  "u01-l1e",
] as const;

export type EmbeddedUnite01LessonKey =
  (typeof EMBEDDED_UNITE_01_LESSON_KEYS)[number];

const embeddedUnite01Bundles: Readonly<
  Record<EmbeddedUnite01LessonKey, EmbeddedLessonBundle>
> = {
  "u01-l1a": {
    audioManifest: audioManifestSchema.parse(u01l1aAudioJson),
    lesson: lessonSchema.parse(u01l1aLessonJson),
  },
  "u01-l1b": {
    audioManifest: audioManifestSchema.parse(u01l1bAudioJson),
    lesson: lessonSchema.parse(u01l1bLessonJson),
  },
  "u01-l1c": {
    audioManifest: audioManifestSchema.parse(u01l1cAudioJson),
    lesson: lessonSchema.parse(u01l1cLessonJson),
  },
  "u01-l1d": {
    audioManifest: audioManifestSchema.parse(u01l1dAudioJson),
    lesson: lessonSchema.parse(u01l1dLessonJson),
  },
  "u01-l1f": {
    audioManifest: audioManifestSchema.parse(u01l1fAudioJson),
    lesson: lessonSchema.parse(u01l1fLessonJson),
  },
  "u01-l1e": {
    audioManifest: audioManifestSchema.parse(u01l1eAudioJson),
    lesson: lessonSchema.parse(u01l1eLessonJson),
  },
};

export function readEmbeddedUnite01LessonBundle(
  key: EmbeddedUnite01LessonKey,
): EmbeddedLessonBundle {
  return embeddedUnite01Bundles[key];
}

export function readEmbeddedUnite01LessonBundles(): readonly EmbeddedLessonBundle[] {
  return EMBEDDED_UNITE_01_LESSON_KEYS.map(
    (key) => embeddedUnite01Bundles[key],
  );
}

export type { Lesson, LessonExercise } from "./schemas";

/** Le premier extrait réel embarqué dans l’application mobile. */
export function readEmbeddedUnite01Lecon1aBundle(): EmbeddedLessonBundle {
  return readEmbeddedUnite01LessonBundle("u01-l1a");
}
