import {
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
  type Lesson,
  type LessonExercise,
} from "@thainaute/content/mobile";

import { EMBEDDED_AUDIO_SOURCES } from "./embedded-audio-sources.generated";

type AudioChoiceExercise = Extract<LessonExercise, { type: "audio_choice" }>;

export interface AudioExpeditionExerciseConfig {
  readonly exercise: AudioChoiceExercise;
  readonly item: Lesson["items"][number];
  readonly modelAudioSource: number;
}

export interface AudioExpeditionConfig {
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly exercises: readonly AudioExpeditionExerciseConfig[];
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly key: EmbeddedUnite01LessonKey;
  readonly lesson: Lesson;
  readonly outboxNamespace: "learning";
}

interface AudioExpeditionCopy {
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly headerStep: string;
  readonly introEyebrow: string;
}

function createAudioExpeditionConfig(
  key: EmbeddedUnite01LessonKey,
  modelAudioSources: Readonly<Record<string, number>>,
  copy: AudioExpeditionCopy,
): AudioExpeditionConfig {
  const bundle = readEmbeddedUnite01LessonBundle(key);
  const exercises = bundle.lesson.exercises
    .filter(
      (exercise): exercise is AudioChoiceExercise =>
        exercise.type === "audio_choice",
    )
    .map((exercise) => {
      const item = bundle.lesson.items.find(({ id }) => id === exercise.itemId);
      if (item === undefined) {
        throw new Error(`L'exercice audio ${exercise.id} n'a pas d'item.`);
      }
      const manifestEntry = bundle.audioManifest.entries.find(
        ({ assetId }) => assetId === exercise.audioAssetId,
      );
      if (
        manifestEntry === undefined ||
        !manifestEntry.canonicalPath.includes(`/audio/${key}/`) ||
        manifestEntry.toneCheck?.consistent !== true
      ) {
        throw new Error(
          `L'audio ${exercise.audioAssetId} de ${key} est absent.`,
        );
      }
      const modelAudioSource = modelAudioSources[exercise.audioAssetId];
      if (modelAudioSource === undefined) {
        throw new Error(
          `L'audio local ${exercise.audioAssetId} de ${key} n'est pas embarqu\u00e9.`,
        );
      }
      return { exercise, item, modelAudioSource };
    });

  if (exercises.length === 0) {
    throw new Error(`L'exp\u00e9dition ${key} doit proposer une \u00e9coute.`);
  }

  return {
    ...copy,
    exercises,
    key,
    lesson: bundle.lesson,
    outboxNamespace: "learning",
  };
}

const mobileUnit01AudioExpedition1a = createAudioExpeditionConfig(
  "u01-l1a",
  EMBEDDED_AUDIO_SOURCES["u01-l1a"] ?? {},
  {
    bannerText: "Unit\u00e9 1A \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Exp\u00e9dition r\u00e9elle \u2014 non publiable",
    completionPrivacy:
      "Vos tentatives et prochaines r\u00e9visions restent localement sur cet appareil.",
    headerStep: "Exp\u00e9dition 1A \u00b7 7 exercices",
    introEyebrow: "EXP\u00c9DITION AUDIO \u00b7 UNIT\u00c9 1A",
  },
);

const mobileUnit01AudioExpedition1b = createAudioExpeditionConfig(
  "u01-l1b",
  EMBEDDED_AUDIO_SOURCES["u01-l1b"] ?? {},
  {
    bannerText: "Unit\u00e9 1B \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Exp\u00e9dition r\u00e9elle \u2014 non publiable",
    completionPrivacy:
      "Vos tentatives et prochaines r\u00e9visions restent localement sur cet appareil.",
    headerStep: "Exp\u00e9dition 1B \u00b7 21 exercices",
    introEyebrow: "EXP\u00c9DITION AUDIO \u00b7 UNIT\u00c9 1B",
  },
);

const mobileUnit01AudioExpedition1d = createAudioExpeditionConfig(
  "u01-l1d",
  EMBEDDED_AUDIO_SOURCES["u01-l1d"] ?? {},
  {
    bannerText: "Unit\u00e9 1D \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Exp\u00e9dition r\u00e9elle \u2014 non publiable",
    completionPrivacy:
      "Vos tentatives et prochaines r\u00e9visions restent localement sur cet appareil.",
    headerStep: "Exp\u00e9dition 1D \u00b7 10 exercices",
    introEyebrow: "EXP\u00c9DITION AUDIO \u00b7 UNIT\u00c9 1D",
  },
);

const mobileUnit01AudioExpedition1f = createAudioExpeditionConfig(
  "u01-l1f",
  EMBEDDED_AUDIO_SOURCES["u01-l1f"] ?? {},
  {
    bannerText: "Unit\u00e9 1F \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Exp\u00e9dition r\u00e9elle \u2014 non publiable",
    completionPrivacy:
      "Vos tentatives et prochaines r\u00e9visions restent localement sur cet appareil.",
    headerStep: "Exp\u00e9dition 1F \u00b7 7 exercices",
    introEyebrow: "EXP\u00c9DITION AUDIO \u00b7 UNIT\u00c9 1F",
  },
);

export const mobileUnit01AudioExpeditionConfigs: Readonly<
  Partial<Record<EmbeddedUnite01LessonKey, AudioExpeditionConfig>>
> = {
  "u01-l1a": mobileUnit01AudioExpedition1a,
  "u01-l1b": mobileUnit01AudioExpedition1b,
  "u01-l1d": mobileUnit01AudioExpedition1d,
  "u01-l1f": mobileUnit01AudioExpedition1f,
};

export function getMobileUnit01AudioExpeditionConfig(
  key: string,
): AudioExpeditionConfig | undefined {
  if (!Object.hasOwn(mobileUnit01AudioExpeditionConfigs, key)) return undefined;
  return mobileUnit01AudioExpeditionConfigs[key as EmbeddedUnite01LessonKey] as
    AudioExpeditionConfig | undefined;
}

export {
  mobileUnit01AudioExpedition1a,
  mobileUnit01AudioExpedition1b,
  mobileUnit01AudioExpedition1d,
  mobileUnit01AudioExpedition1f,
};
