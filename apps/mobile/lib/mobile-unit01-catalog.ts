import {
  EMBEDDED_UNITE_01_LESSON_KEYS,
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
  type LessonExercise,
} from "@thainaute/content/mobile";

export type MobileUnit01Availability = "preview" | "blocked";
export type MobileUnit01BlockedReason = "audio_pending" | "mechanic_pending";
export type MobileUnit01PreviewMode = "mixed";

export interface MobileUnit01CatalogItem {
  readonly availability: MobileUnit01Availability;
  readonly audioExerciseCount: number;
  readonly blockedReason: MobileUnit01BlockedReason | null;
  readonly exerciseCount: number;
  readonly firstMechanic: LessonExercise["type"];
  readonly key: EmbeddedUnite01LessonKey;
  readonly lessonTitle: string;
  readonly objective: string;
  readonly previewMode: MobileUnit01PreviewMode | null;
}

function createCatalogItem(
  key: EmbeddedUnite01LessonKey,
): MobileUnit01CatalogItem {
  const { audioManifest, lesson } = readEmbeddedUnite01LessonBundle(key);
  const firstExercise = lesson.exercises[0];
  if (firstExercise === undefined) {
    throw new Error(`The embedded lesson ${key} has no exercise.`);
  }

  const audioExercises = lesson.exercises.filter(
    (exercise) => exercise.type === "audio_choice",
  );
  const hasLocalAudio =
    audioExercises.length === 0 ||
    audioExercises.every((exercise) => {
      if (exercise.type !== "audio_choice") return false;
      const audio = audioManifest.entries.find(
        ({ assetId }) => assetId === exercise.audioAssetId,
      );
      return (
        audio?.canonicalPath.includes(`/audio/${key}/`) === true &&
        audio.toneCheck?.consistent === true
      );
    });
  const hasSupportedExercises = lesson.exercises.every(
    (exercise) =>
      exercise.type === "audio_choice" ||
      exercise.type === "association" ||
      exercise.type === "word_order" ||
      exercise.type === "recall" ||
      exercise.type === "reading",
  );
  const previewMode = hasSupportedExercises && hasLocalAudio ? "mixed" : null;
  return {
    availability: previewMode === null ? "blocked" : "preview",
    audioExerciseCount: audioExercises.length,
    blockedReason:
      previewMode !== null
        ? null
        : !hasLocalAudio
          ? "audio_pending"
          : "mechanic_pending",
    exerciseCount: lesson.exercises.length,
    firstMechanic: firstExercise.type,
    key,
    lessonTitle: lesson.titleFr,
    objective: lesson.objectiveFr,
    previewMode,
  };
}

export const mobileUnit01Catalog: readonly MobileUnit01CatalogItem[] =
  EMBEDDED_UNITE_01_LESSON_KEYS.map(createCatalogItem);

export function findMobileUnit01CatalogItem(
  key: string,
): MobileUnit01CatalogItem | undefined {
  return mobileUnit01Catalog.find((item) => item.key === key);
}

export function formatMobileUnit01ExerciseCount(count: number): string {
  return `${count} exercice${count === 1 ? "" : "s"} ${count === 1 ? "local" : "locaux"}`;
}

export function getMobileUnit01BlockedReasonText(
  reason: MobileUnit01BlockedReason,
): string {
  return reason === "audio_pending"
    ? "Audio local à embarquer"
    : "Mécanique mobile en préparation";
}
