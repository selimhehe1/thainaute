import {
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
} from "@thainaute/content/mobile";

import {
  createLessonExperienceConfig,
  type LessonExperienceConfig,
} from "./lesson-config";

interface AudioPreviewCopy {
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly questionEyebrow: string;
}

function createAudioPreviewConfig(
  key: EmbeddedUnite01LessonKey,
  modelAudioSource: number,
  expectedAudioAssetId: string,
  copy: AudioPreviewCopy,
): LessonExperienceConfig {
  const bundle = readEmbeddedUnite01LessonBundle(key);
  const firstExercise = bundle.lesson.exercises[0];
  if (firstExercise?.type !== "audio_choice") {
    throw new Error(`The mobile preview ${key} must start with listening.`);
  }

  const firstAudio = bundle.audioManifest.entries.find(
    ({ assetId }) => assetId === firstExercise.audioAssetId,
  );
  if (firstAudio === undefined) {
    throw new Error(`The mobile preview ${key} must include its signal.`);
  }
  if (firstAudio.assetId !== expectedAudioAssetId) {
    throw new Error(`The mobile preview ${key} audio draw changed.`);
  }

  return createLessonExperienceConfig(bundle.lesson, modelAudioSource, {
    allowColdStart: true,
    ...copy,
    outboxNamespace: "learning",
  });
}

const mobileUnit01Lesson1aConfig = createAudioPreviewConfig(
  "u01-l1a",
  require("../../../packages/content/assets/audio/u01-l1a/34626c45-7ae4-5c93-9b97-63f0d3b75fbe.wav") as number,
  "34626c45-7ae4-5c93-9b97-63f0d3b75fbe",
  {
    bannerText: "Unit\u00e9 1A \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Aper\u00e7u r\u00e9el \u2014 non publiable",
    completionPrivacy:
      "Cet extrait interne conserve votre tentative et sa prochaine r\u00e9vision localement sur cet appareil.",
    headerStep: "Aper\u00e7u 1A \u00b7 1 exercice",
    introEyebrow: "APER\u00c7U INTERNE \u00b7 UNIT\u00c9 1A",
    questionEyebrow: "\u00c9COUTE \u00b7 UNIT\u00c9 1A",
  },
);

const mobileUnit01Lesson1dConfig = createAudioPreviewConfig(
  "u01-l1d",
  require("../../../packages/content/assets/audio/u01-l1d/3f6b0947-2cc9-550b-a3fa-4409aefb126b.wav") as number,
  "3f6b0947-2cc9-550b-a3fa-4409aefb126b",
  {
    bannerText: "Unit\u00e9 1D \u00b7 contenu interne \u00b7 audio local",
    bannerTitle: "Aper\u00e7u r\u00e9el \u2014 non publiable",
    completionPrivacy:
      "Cet extrait interne conserve votre tentative et sa prochaine r\u00e9vision localement sur cet appareil.",
    headerStep: "Aper\u00e7u 1D \u00b7 1 exercice",
    introEyebrow: "APER\u00c7U INTERNE \u00b7 UNIT\u00c9 1D",
    questionEyebrow: "\u00c9COUTE \u00b7 UNIT\u00c9 1D",
  },
);

export const mobileUnit01LessonConfigs: Readonly<
  Partial<Record<EmbeddedUnite01LessonKey, LessonExperienceConfig>>
> = {
  "u01-l1a": mobileUnit01Lesson1aConfig,
  "u01-l1d": mobileUnit01Lesson1dConfig,
};

export function getMobileUnit01LessonConfig(
  key: string,
): LessonExperienceConfig | undefined {
  if (!Object.hasOwn(mobileUnit01LessonConfigs, key)) return undefined;
  return mobileUnit01LessonConfigs[key as EmbeddedUnite01LessonKey] as
    LessonExperienceConfig | undefined;
}

export { mobileUnit01Lesson1aConfig, mobileUnit01Lesson1dConfig };
