import { fixtureLesson } from "@thainaute/content/fixture";

type Lesson = typeof fixtureLesson;
type LessonExercise = Lesson["exercises"][number];

export type AudioChoiceExercise = Extract<
  LessonExercise,
  { type: "audio_choice" }
>;

export interface LessonExperienceConfig {
  readonly allowColdStart: boolean;
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly exercise: AudioChoiceExercise;
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly item: Lesson["items"][number];
  readonly lesson: Lesson;
  readonly modelAudioSource: number;
  readonly outboxNamespace: "demo" | "learning";
  readonly questionEyebrow: string;
}

interface LessonExperienceCopy {
  readonly allowColdStart: boolean;
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly outboxNamespace: "demo" | "learning";
  readonly questionEyebrow: string;
}

export function createLessonExperienceConfig(
  lesson: Lesson,
  modelAudioSource: number,
  copy: LessonExperienceCopy,
): LessonExperienceConfig {
  const firstExercise = lesson.exercises[0];
  if (firstExercise?.type !== "audio_choice") {
    throw new Error("L'extrait mobile doit commencer par une écoute.");
  }
  const item = lesson.items.find(({ id }) => id === firstExercise.itemId);
  if (item === undefined) {
    throw new Error("L'extrait mobile doit référencer son item.");
  }

  return { ...copy, exercise: firstExercise, item, lesson, modelAudioSource };
}

export const fixtureLessonConfig = createLessonExperienceConfig(
  fixtureLesson,
  require("../assets/audio/fixture-tone.wav") as number,
  {
    allowColdStart: false,
    bannerText: "Chaîne technique uniquement",
    bannerTitle: "Donnée fictive · non publiable",
    completionPrivacy:
      "Cette démonstration technique reste isolée sur cet appareil et ne sera jamais synchronisée comme contenu pédagogique.",
    headerStep: "1 exercice",
    introEyebrow: "TRANCHE VERTICALE LOCALE",
    outboxNamespace: "demo",
    questionEyebrow: "ÉCOUTE · DONNÉE TECHNIQUE",
  },
);
