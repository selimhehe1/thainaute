import {
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
  type Lesson,
  type LessonExercise,
} from "@thainaute/content/mobile";

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

const unit01Lesson1aAudioSources = {
  "34626c45-7ae4-5c93-9b97-63f0d3b75fbe":
    require("../../../packages/content/assets/audio/u01-l1a/34626c45-7ae4-5c93-9b97-63f0d3b75fbe.wav") as number,
  "9251e9ef-cd4d-5274-8054-97488c3605d4":
    require("../../../packages/content/assets/audio/u01-l1a/9251e9ef-cd4d-5274-8054-97488c3605d4.wav") as number,
} as const;

const unit01Lesson1bAudioSources = {
  "eb3d8d6a-820f-5b11-b3eb-11c5a0ddd8b2":
    require("../../../packages/content/assets/audio/u01-l1b/eb3d8d6a-820f-5b11-b3eb-11c5a0ddd8b2.wav") as number,
  "402cfd23-810d-5771-9cc8-373dcb6ff2cf":
    require("../../../packages/content/assets/audio/u01-l1b/402cfd23-810d-5771-9cc8-373dcb6ff2cf.wav") as number,
  "4e0040ad-bb5a-53c4-a6a9-a9378b2d0088":
    require("../../../packages/content/assets/audio/u01-l1b/4e0040ad-bb5a-53c4-a6a9-a9378b2d0088.wav") as number,
  "a80861fa-87ce-5755-95af-6e04dd60f149":
    require("../../../packages/content/assets/audio/u01-l1b/a80861fa-87ce-5755-95af-6e04dd60f149.wav") as number,
  "d3f24fd9-1f99-5304-bc7c-eec85e3c10d1":
    require("../../../packages/content/assets/audio/u01-l1b/d3f24fd9-1f99-5304-bc7c-eec85e3c10d1.wav") as number,
  "81300b42-913d-5f40-b652-ae640a0ba287":
    require("../../../packages/content/assets/audio/u01-l1b/81300b42-913d-5f40-b652-ae640a0ba287.wav") as number,
  "c799f3d9-1765-5d31-9607-ab53fd1fa34a":
    require("../../../packages/content/assets/audio/u01-l1b/c799f3d9-1765-5d31-9607-ab53fd1fa34a.wav") as number,
} as const;

const unit01Lesson1dAudioSources = {
  "3f6b0947-2cc9-550b-a3fa-4409aefb126b":
    require("../../../packages/content/assets/audio/u01-l1d/3f6b0947-2cc9-550b-a3fa-4409aefb126b.wav") as number,
  "74e503f6-c2f7-5f77-8367-63a833dc4445":
    require("../../../packages/content/assets/audio/u01-l1d/74e503f6-c2f7-5f77-8367-63a833dc4445.wav") as number,
  "3ce3875e-da10-52ab-b054-e00563e3e074":
    require("../../../packages/content/assets/audio/u01-l1d/3ce3875e-da10-52ab-b054-e00563e3e074.wav") as number,
  "44ebb3a1-f074-562b-95e8-c3b2b0e1c3e0":
    require("../../../packages/content/assets/audio/u01-l1d/44ebb3a1-f074-562b-95e8-c3b2b0e1c3e0.wav") as number,
  "f24014ed-596b-51db-854f-9d772f115fe3":
    require("../../../packages/content/assets/audio/u01-l1d/f24014ed-596b-51db-854f-9d772f115fe3.wav") as number,
  "31dbd568-7b89-5d85-a2b5-b7ea0c09c7d1":
    require("../../../packages/content/assets/audio/u01-l1d/31dbd568-7b89-5d85-a2b5-b7ea0c09c7d1.wav") as number,
} as const;

const unit01Lesson1fAudioSources = {
  "ebfb41d6-5424-578c-9af0-09ee2a549d2d":
    require("../../../packages/content/assets/audio/u01-l1f/ebfb41d6-5424-578c-9af0-09ee2a549d2d.wav") as number,
  "608bb3eb-901b-5b99-a29b-902dd8210067":
    require("../../../packages/content/assets/audio/u01-l1f/608bb3eb-901b-5b99-a29b-902dd8210067.wav") as number,
  "3b429062-aa5f-5cd5-9795-bed448d269b4":
    require("../../../packages/content/assets/audio/u01-l1f/3b429062-aa5f-5cd5-9795-bed448d269b4.wav") as number,
  "d9ec76a1-56cf-5b13-81fa-ab85d9e50744":
    require("../../../packages/content/assets/audio/u01-l1f/d9ec76a1-56cf-5b13-81fa-ab85d9e50744.wav") as number,
  "8a851e1d-0d22-5e8b-aab6-28417c7a7e14":
    require("../../../packages/content/assets/audio/u01-l1f/8a851e1d-0d22-5e8b-aab6-28417c7a7e14.wav") as number,
} as const;

const mobileUnit01AudioExpedition1a = createAudioExpeditionConfig(
  "u01-l1a",
  unit01Lesson1aAudioSources,
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
  unit01Lesson1bAudioSources,
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
  unit01Lesson1dAudioSources,
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
  unit01Lesson1fAudioSources,
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
