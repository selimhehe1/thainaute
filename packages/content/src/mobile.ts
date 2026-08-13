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
import u01l1fAudioJson from "../data/audio/u01-l1f.v1.json";
import u01l1aLessonJson from "../data/lessons/u01-l1a.v1.json";
import u01l1bLessonJson from "../data/lessons/u01-l1b.v1.json";
import u01l1cLessonJson from "../data/lessons/u01-l1c.v1.json";
import u01l1dLessonJson from "../data/lessons/u01-l1d.v1.json";
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
};

export function readEmbeddedUnite01LessonBundle(
  key: EmbeddedUnite01LessonKey,
): EmbeddedLessonBundle {
  return embeddedUnite01Bundles[key];
}

/**
 * Les leçons embarquées qu'une build distribuable a le droit de montrer.
 *
 * L'ADR-0041 murait tout le contenu U01 parce qu'il était en brouillon, et
 * qu'un écran marqué « interne » ne protège rien : le contenu reste
 * extractible d'un APK ou d'un IPA. La raison disparaît pour une leçon
 * signée, elle demeure entière pour les autres.
 *
 * POURQUOI CETTE LISTE EST AUSSI UNE ASSERTION : un import est statique,
 * donc la liste ci-dessus est forcément écrite à la main, et `u01-l1e` y a
 * figuré jusqu'ici alors qu'elle est en brouillon. Filtrer à l'affichage
 * ne suffisait pas : son JSON partait quand même dans le bundle, et
 * `check-public-export.mjs` l'a attrapé. Le module refuse donc de se
 * charger si un paquet embarqué n'est pas publié, ce qui transforme un
 * oubli d'import en panne immédiate plutôt qu'en fuite silencieuse.
 */
export const EMBEDDED_PUBLISHED_LESSON_KEYS = EMBEDDED_UNITE_01_LESSON_KEYS;

for (const key of EMBEDDED_UNITE_01_LESSON_KEYS) {
  const { lesson } = embeddedUnite01Bundles[key];
  if (lesson.workflowStatus !== "published" || lesson.visibility !== "public") {
    throw new Error(
      `Le paquet ${key} est embarqué dans l'application mobile sans être publié. Retirez son import : un brouillon reste extractible d'un APK.`,
    );
  }
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
