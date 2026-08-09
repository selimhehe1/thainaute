import {
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
  type Lesson,
  type LessonExercise,
} from "@thainaute/content/mobile";

import {
  mobileUnit01AudioExpedition1a,
  mobileUnit01AudioExpedition1b,
  mobileUnit01AudioExpedition1d,
  mobileUnit01AudioExpedition1f,
  type AudioExpeditionConfig,
} from "./embedded-audio-expedition-config";
import {
  mobileUnit01MechanicsExpedition1c,
  mobileUnit01MechanicsExpedition1e,
  type MechanicsExpeditionConfig,
  type MobileMechanicsExercise,
} from "./embedded-mechanics-expedition-config";

type AudioChoiceExercise = Extract<LessonExercise, { type: "audio_choice" }>;

type LessonItem = Lesson["items"][number];

type MechanicsExerciseConfig<Exercise extends MobileMechanicsExercise> =
  Exercise extends MobileMechanicsExercise
    ? {
        readonly exercise: Exercise;
        readonly item: LessonItem;
      }
    : never;

export type MobileLessonExerciseConfig =
  | {
      readonly exercise: AudioChoiceExercise;
      readonly item: LessonItem;
      readonly modelAudioSource: number;
    }
  | MechanicsExerciseConfig<MobileMechanicsExercise>;

export interface MobileLessonExpeditionConfig {
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly exercises: readonly MobileLessonExerciseConfig[];
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly key: EmbeddedUnite01LessonKey;
  readonly lesson: Lesson;
  readonly mode: "mixed";
  readonly outboxNamespace: "learning";
}

type ExpeditionConfigSource = AudioExpeditionConfig | MechanicsExpeditionConfig;

function itemIdForMechanicsExercise(
  exercise: MobileMechanicsExercise,
): string | undefined {
  return exercise.type === "association"
    ? exercise.pairs[0]?.itemId
    : exercise.itemId;
}

export function createMobileLessonExpeditionConfig(
  source: ExpeditionConfigSource,
): MobileLessonExpeditionConfig {
  const bundle = readEmbeddedUnite01LessonBundle(source.key);
  const audioSources = new Map(
    source.exercises.flatMap((entry) => {
      if (
        entry.exercise.type !== "audio_choice" ||
        !("modelAudioSource" in entry)
      ) {
        return [];
      }
      return [[entry.exercise.id, entry.modelAudioSource] as const];
    }),
  );
  const exercises = bundle.lesson.exercises.map<MobileLessonExerciseConfig>(
    (exercise) => {
      if (exercise.type === "audio_choice") {
        const modelAudioSource = audioSources.get(exercise.id);
        const item = bundle.lesson.items.find(
          ({ id }) => id === exercise.itemId,
        );
        if (item === undefined || modelAudioSource === undefined) {
          throw new Error(
            `L'audio local ${exercise.id} de ${source.key} n'est pas prêt.`,
          );
        }
        return { exercise, item, modelAudioSource };
      }

      const itemId = itemIdForMechanicsExercise(exercise);
      const item = bundle.lesson.items.find(({ id }) => id === itemId);
      if (item === undefined) {
        throw new Error(
          `L'exercice ${exercise.id} de ${source.key} n'a pas d'item.`,
        );
      }
      return {
        exercise: exercise as MobileMechanicsExercise,
        item,
      } as MobileLessonExerciseConfig;
    },
  );

  if (exercises.length === 0) {
    throw new Error(`L'expédition ${source.key} ne contient aucun exercice.`);
  }

  return {
    bannerText: source.bannerText,
    bannerTitle: source.bannerTitle,
    completionPrivacy: source.completionPrivacy,
    exercises,
    headerStep: source.headerStep,
    introEyebrow: source.introEyebrow,
    key: source.key,
    lesson: bundle.lesson,
    mode: "mixed",
    outboxNamespace: "learning",
  };
}

const mobileUnit01MixedExpedition1a = createMobileLessonExpeditionConfig(
  mobileUnit01AudioExpedition1a,
);
const mobileUnit01MixedExpedition1b = createMobileLessonExpeditionConfig(
  mobileUnit01AudioExpedition1b,
);
const mobileUnit01MixedExpedition1c = createMobileLessonExpeditionConfig(
  mobileUnit01MechanicsExpedition1c,
);
const mobileUnit01MixedExpedition1d = createMobileLessonExpeditionConfig(
  mobileUnit01AudioExpedition1d,
);
const mobileUnit01MixedExpedition1f = createMobileLessonExpeditionConfig(
  mobileUnit01AudioExpedition1f,
);
const mobileUnit01MixedExpedition1e = createMobileLessonExpeditionConfig(
  mobileUnit01MechanicsExpedition1e,
);

export const mobileUnit01MixedExpeditionConfigs: Readonly<
  Partial<Record<EmbeddedUnite01LessonKey, MobileLessonExpeditionConfig>>
> = {
  "u01-l1a": mobileUnit01MixedExpedition1a,
  "u01-l1b": mobileUnit01MixedExpedition1b,
  "u01-l1c": mobileUnit01MixedExpedition1c,
  "u01-l1d": mobileUnit01MixedExpedition1d,
  "u01-l1f": mobileUnit01MixedExpedition1f,
  "u01-l1e": mobileUnit01MixedExpedition1e,
};

export function getMobileUnit01MixedExpeditionConfig(
  key: string,
): MobileLessonExpeditionConfig | undefined {
  if (!Object.hasOwn(mobileUnit01MixedExpeditionConfigs, key)) {
    return undefined;
  }
  return mobileUnit01MixedExpeditionConfigs[key as EmbeddedUnite01LessonKey];
}

export {
  mobileUnit01MixedExpedition1a,
  mobileUnit01MixedExpedition1b,
  mobileUnit01MixedExpedition1c,
  mobileUnit01MixedExpedition1d,
  mobileUnit01MixedExpedition1f,
  mobileUnit01MixedExpedition1e,
};
