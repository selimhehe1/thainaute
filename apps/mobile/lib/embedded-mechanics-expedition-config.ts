import {
  readEmbeddedUnite01LessonBundle,
  type EmbeddedUnite01LessonKey,
  type Lesson,
  type LessonExercise,
} from "@thainaute/content/mobile";

export type MobileMechanicsExercise = Extract<
  LessonExercise,
  { type: "association" | "word_order" | "recall" | "reading" }
>;

export interface MechanicsExpeditionExerciseConfig {
  readonly exercise: MobileMechanicsExercise;
  readonly item: Lesson["items"][number];
}

export interface MechanicsExpeditionConfig {
  readonly bannerText: string;
  readonly bannerTitle: string;
  readonly completionPrivacy: string;
  readonly exercises: readonly MechanicsExpeditionExerciseConfig[];
  readonly headerStep: string;
  readonly introEyebrow: string;
  readonly key: EmbeddedUnite01LessonKey;
  readonly lesson: Lesson;
  readonly outboxNamespace: "learning";
}

function createMechanicsExpeditionConfig(
  key: MechanicsExpeditionConfig["key"],
  copy: Omit<
    MechanicsExpeditionConfig,
    "exercises" | "key" | "lesson" | "outboxNamespace"
  >,
): MechanicsExpeditionConfig {
  const bundle = readEmbeddedUnite01LessonBundle(key);
  const exercises = bundle.lesson.exercises.map((exercise) => {
    if (
      exercise.type !== "association" &&
      exercise.type !== "word_order" &&
      exercise.type !== "recall" &&
      exercise.type !== "reading"
    ) {
      throw new Error(`La leçon ${key} contient une mécanique non supportée.`);
    }
    const itemId =
      exercise.type === "association"
        ? exercise.pairs[0]?.itemId
        : exercise.itemId;
    const item = bundle.lesson.items.find(({ id }) => id === itemId);
    if (item === undefined) {
      throw new Error(`L'exercice ${exercise.id} n'a pas d'item.`);
    }
    return { exercise, item };
  });

  if (exercises.length === 0) {
    throw new Error(`L'expédition ${key} ne contient aucun exercice.`);
  }

  return {
    ...copy,
    exercises,
    key,
    lesson: bundle.lesson,
    outboxNamespace: "learning",
  };
}

const mobileUnit01MechanicsExpedition1c = createMechanicsExpeditionConfig(
  "u01-l1c",
  {
    bannerText: "Unité 1C · contenu interne · mécanique locale",
    bannerTitle: "Expédition réelle — non publiable",
    completionPrivacy:
      "Vos réponses et prochaines révisions restent localement sur cet appareil.",
    headerStep: "Expédition 1C · 1 exercice",
    introEyebrow: "EXPÉDITION ACTIVE · UNITÉ 1C",
  },
);

export const mobileUnit01MechanicsExpeditionConfigs: Readonly<
  Partial<Record<MechanicsExpeditionConfig["key"], MechanicsExpeditionConfig>>
> = {
  "u01-l1c": mobileUnit01MechanicsExpedition1c,
};

export function getMobileUnit01MechanicsExpeditionConfig(
  key: string,
): MechanicsExpeditionConfig | undefined {
  if (!Object.hasOwn(mobileUnit01MechanicsExpeditionConfigs, key)) {
    return undefined;
  }
  return mobileUnit01MechanicsExpeditionConfigs[
    key as MechanicsExpeditionConfig["key"]
  ];
}

export { mobileUnit01MechanicsExpedition1c };
