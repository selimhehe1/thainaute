import {
  applyAttemptToState,
  type AttemptEvent,
  type LearnerItemState as DomainLearnerItemState,
} from "@thainaute/domain";
import {
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";

import { ingestAudioExpeditionOutbox } from "./audio-expedition-state";
import { ingestMechanicsExpeditionOutbox } from "./mechanics-expedition-state";
import type { AudioExpeditionConfig } from "./embedded-audio-expedition-config";
import type { MechanicsExpeditionConfig } from "./embedded-mechanics-expedition-config";
import type { MobileLessonExpeditionConfig } from "./mobile-lesson-expedition-config";
import { ingestMobileLessonOutbox } from "./mobile-lesson-expedition-state";

export type MobileProgressConfig =
  | AudioExpeditionConfig
  | MechanicsExpeditionConfig
  | MobileLessonExpeditionConfig;
export type MobileProgressMode = "audio" | "mechanics" | "mixed";
export type MobileProgressConfigs = Readonly<
  Record<string, MobileProgressConfig | undefined>
>;

export interface MobileLessonProgress {
  readonly attemptedCount: number;
  readonly confirmedItems: number;
  readonly dueCount: number;
  readonly exerciseCount: number;
  readonly key: MobileProgressConfig["key"];
  readonly lessonTitle: string;
  readonly masteryPermille: number;
  readonly mode: MobileProgressMode;
  readonly nextReviewAt: string | null;
  readonly reviewedItems: number;
  readonly successfulAttempts: number;
}

export interface MobileActiveExpedition {
  readonly completedCount: number;
  readonly key: MobileProgressConfig["key"];
  readonly mode: MobileProgressMode;
  readonly totalCount: number;
}

export interface MobileLearningProgress {
  readonly activeExpedition: MobileActiveExpedition | null;
  readonly attemptedCount: number;
  readonly confirmedItems: number;
  readonly dueCount: number;
  readonly lessons: readonly MobileLessonProgress[];
  readonly masteryPermille: number;
  readonly reviewedItems: number;
  readonly successfulAttempts: number;
}

function assertValidTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError("La date de projection locale doit être ISO valide.");
  }
  return timestamp;
}

function outboxForLesson(
  outbox: AttemptOutboxSnapshot,
  config: MobileProgressConfig,
): AttemptOutboxSnapshot {
  return {
    ...outbox,
    entries: outbox.entries.filter(
      ({ status, submission }) =>
        status !== "rejected" &&
        submission.contentVersionId === config.lesson.versionId,
    ),
  };
}

function isAudioConfig(
  config: MobileProgressConfig,
): config is AudioExpeditionConfig {
  return config.exercises.every(
    ({ exercise }) => exercise.type === "audio_choice",
  );
}

function isMechanicsConfig(
  config: MobileProgressConfig,
): config is MechanicsExpeditionConfig {
  return (
    !isMixedConfig(config) &&
    config.exercises.every(({ exercise }) => exercise.type !== "audio_choice")
  );
}

function isMixedConfig(
  config: MobileProgressConfig,
): config is MobileLessonExpeditionConfig {
  return "mode" in config && config.mode === "mixed";
}

function modeForConfig(config: MobileProgressConfig): MobileProgressMode {
  if (isMixedConfig(config)) return "mixed";
  if (isAudioConfig(config)) return "audio";
  if (isMechanicsConfig(config)) return "mechanics";
  throw new Error("Configuration mobile non supportée.");
}

function stateKey(itemId: string, skill: string): string {
  return `${itemId}\u0000${skill}`;
}

function ingestProgressOutbox(
  outbox: AttemptOutboxSnapshot,
  config: MobileProgressConfig,
) {
  if (isMixedConfig(config)) return ingestMobileLessonOutbox(outbox, config);
  if (isAudioConfig(config)) return ingestAudioExpeditionOutbox(outbox, config);
  if (isMechanicsConfig(config)) {
    return ingestMechanicsExpeditionOutbox(outbox, config);
  }
  throw new Error("Configuration mobile non supportée.");
}

function projectLessonProgress(
  outbox: AttemptOutboxSnapshot,
  config: MobileProgressConfig,
  nowTimestamp: number,
): MobileLessonProgress {
  const lessonOutbox = outboxForLesson(outbox, config);
  const ingestion = ingestProgressOutbox(lessonOutbox, config);
  const localStates = new Map(
    ingestion.projections.map(
      ({ state }) => [stateKey(state.itemId, state.skill), state] as const,
    ),
  );
  const pendingIngestion = ingestProgressOutbox(
    {
      ...lessonOutbox,
      entries: lessonOutbox.entries.filter(
        ({ status }) => status === "pending",
      ),
    },
    config,
  );
  const pendingEvents = new Map<string, AttemptEvent[]>();
  for (const event of pendingIngestion.events) {
    const itemEvents =
      pendingEvents.get(stateKey(event.itemId, event.skill)) ?? [];
    itemEvents.push(event);
    pendingEvents.set(stateKey(event.itemId, event.skill), itemEvents);
  }
  const authoritativeStates = new Map(
    outbox.authoritativeStates
      .filter((state) =>
        config.exercises.some(({ exercise }) => exercise.skill === state.skill),
      )
      .map((state) => [stateKey(state.itemId, state.skill), state] as const),
  );
  const uniqueTargets = [
    ...new Map(
      config.exercises.map(
        ({ exercise, item }) =>
          [
            stateKey(item.id, exercise.skill),
            { itemId: item.id, skill: exercise.skill },
          ] as const,
      ),
    ).values(),
  ];
  const resolvedStates = uniqueTargets
    .map((target) => {
      const key = stateKey(target.itemId, target.skill);
      const localState = localStates.get(key);
      const authoritativeState = authoritativeStates.get(key);
      if (authoritativeState !== undefined) {
        const pending = pendingEvents.get(key);
        if (pending !== undefined && pending.length > 0) {
          return (
            projectAuthoritativeStateWithPending(authoritativeState, pending) ??
            localState
          );
        }
        return projectAuthoritativeState(authoritativeState);
      }
      return localState;
    })
    .filter((state): state is DomainLearnerItemState => state !== undefined);
  const dueDates = resolvedStates
    .map((state) => state.dueAt)
    .filter((dueAt): dueAt is string => dueAt !== null)
    .sort((left, right) => Date.parse(left) - Date.parse(right));
  const dueCount = dueDates.filter(
    (dueAt) => Date.parse(dueAt) <= nowTimestamp,
  ).length;
  const masteryTotal = resolvedStates.reduce(
    (total, state) => total + state.masteryScore,
    0,
  );

  return {
    attemptedCount: resolvedStates.reduce(
      (total, state) => total + state.totalAttempts,
      0,
    ),
    confirmedItems: resolvedStates.filter(
      (state) => state.status === "confirmed",
    ).length,
    dueCount,
    exerciseCount: config.exercises.length,
    key: config.key,
    lessonTitle: config.lesson.titleFr,
    masteryPermille:
      resolvedStates.length === 0
        ? 0
        : Math.round(masteryTotal / resolvedStates.length),
    mode: modeForConfig(config),
    nextReviewAt: dueDates[0] ?? null,
    reviewedItems: resolvedStates.length,
    successfulAttempts: resolvedStates.reduce(
      (total, state) => total + state.successfulAttempts,
      0,
    ),
  };
}

type AuthoritativeLearnerItemState =
  AttemptOutboxSnapshot["authoritativeStates"][number];

function projectAuthoritativeState(
  state: AuthoritativeLearnerItemState,
): DomainLearnerItemState {
  return {
    itemId: state.itemId,
    skill: state.skill,
    masteryScore: state.masteryPermille,
    status: state.status,
    totalAttempts: state.attemptCount,
    successfulAttempts: state.successfulAttempts,
    consecutiveCorrect: state.consecutiveCorrect,
    lastRating: null,
    lastAnsweredAt: null,
    lastEventId: null,
    dueAt: state.dueAt,
    algorithmVersion: state.algorithmVersion,
  };
}

function projectAuthoritativeStateWithPending(
  state: AuthoritativeLearnerItemState,
  pendingEvents: readonly AttemptEvent[],
): DomainLearnerItemState | null {
  try {
    return pendingEvents.reduce(
      (current, event) => applyAttemptToState(current, event),
      projectAuthoritativeState(state),
    );
  } catch {
    return null;
  }
}

function availableConfigs(
  configs: MobileProgressConfigs,
): readonly MobileProgressConfig[] {
  return Object.values(configs).filter(
    (config): config is MobileProgressConfig => config !== undefined,
  );
}

export function projectMobileLearningProgress(input: {
  readonly configs: MobileProgressConfigs;
  readonly experience: LocalExperienceSnapshot;
  readonly now: string;
  readonly outbox: AttemptOutboxSnapshot;
}): MobileLearningProgress {
  const nowTimestamp = assertValidTimestamp(input.now);
  const configs = availableConfigs(input.configs);
  const lessons = configs.map((config) =>
    projectLessonProgress(input.outbox, config, nowTimestamp),
  );
  const active = input.experience.expedition;
  const activeConfig =
    active === null
      ? undefined
      : configs.find(
          (config) => config.lesson.versionId === active.lessonVersionId,
        );
  const activeExpedition =
    active === null || activeConfig === undefined
      ? null
      : {
          completedCount: active.results.length,
          key: activeConfig.key,
          mode: modeForConfig(activeConfig),
          totalCount: active.exerciseIds.length,
        };
  const reviewedItems = lessons.reduce(
    (total, lesson) => total + lesson.reviewedItems,
    0,
  );
  const masteryTotal = lessons.reduce(
    (total, lesson) => total + lesson.masteryPermille * lesson.reviewedItems,
    0,
  );

  return {
    activeExpedition,
    attemptedCount: lessons.reduce(
      (total, lesson) => total + lesson.attemptedCount,
      0,
    ),
    confirmedItems: lessons.reduce(
      (total, lesson) => total + lesson.confirmedItems,
      0,
    ),
    dueCount: lessons.reduce((total, lesson) => total + lesson.dueCount, 0),
    lessons,
    masteryPermille:
      reviewedItems === 0 ? 0 : Math.round(masteryTotal / reviewedItems),
    reviewedItems,
    successfulAttempts: lessons.reduce(
      (total, lesson) => total + lesson.successfulAttempts,
      0,
    ),
  };
}
