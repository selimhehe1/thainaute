export const ANALYTICS_CONSENT_SCHEMA_VERSION = 1 as const;

export type AnalyticsConsentDecision = "unknown" | "denied" | "granted";

export interface AnalyticsConsentSnapshot {
  readonly schemaVersion: typeof ANALYTICS_CONSENT_SCHEMA_VERSION;
  readonly decision: AnalyticsConsentDecision;
  readonly revision: number;
  readonly updatedAt: string | null;
}

export type AnalyticsPlatform = "web" | "ios" | "android";
export type AnalyticsExerciseType =
  "audio_choice" | "association" | "word_order" | "recall" | "reading";

type PlatformOnlyAnalyticsEvent = {
  readonly platform: AnalyticsPlatform;
};

type LessonAnalyticsEvent = PlatformOnlyAnalyticsEvent & {
  readonly lessonVersionId: string;
};

export type AnalyticsEvent =
  | (PlatformOnlyAnalyticsEvent & {
      readonly name: "onboarding_started";
    })
  | (PlatformOnlyAnalyticsEvent & {
      readonly name: "onboarding_completed";
    })
  | (LessonAnalyticsEvent & {
      readonly name: "lesson_started";
    })
  | (LessonAnalyticsEvent & {
      readonly name: "exercise_answered";
      readonly exerciseType: AnalyticsExerciseType;
      readonly correct: boolean;
      readonly durationBucket: "under_10s" | "10_to_30s" | "over_30s";
    })
  | (LessonAnalyticsEvent & {
      readonly name: "lesson_completed";
    })
  | (LessonAnalyticsEvent & {
      readonly name: "review_due";
    })
  | (LessonAnalyticsEvent & {
      readonly name: "review_completed";
    })
  | (PlatformOnlyAnalyticsEvent & {
      readonly name: "content_reported";
    })
  | (PlatformOnlyAnalyticsEvent & {
      readonly name: "account_export_requested";
    })
  | (PlatformOnlyAnalyticsEvent & {
      readonly name: "account_deletion_requested";
    });

export interface AnalyticsSink {
  capture(event: AnalyticsEvent): void;
}

export type AnalyticsConsentReader = () => unknown;
export type AnalyticsConsentSource =
  boolean | AnalyticsConsentSnapshot | AnalyticsConsentReader;

type StrictRecord = Readonly<Record<string, unknown>>;

const CONSENT_KEYS = [
  "schemaVersion",
  "decision",
  "revision",
  "updatedAt",
] as const;
const PLATFORM_ONLY_KEYS = ["name", "platform"] as const;
const LESSON_KEYS = ["name", "lessonVersionId", "platform"] as const;
const EXERCISE_ANSWERED_KEYS = [
  "name",
  "lessonVersionId",
  "exerciseType",
  "correct",
  "durationBucket",
  "platform",
] as const;
const ANALYTICS_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function toStrictRecord(value: unknown): StrictRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const prototype = Object.getPrototypeOf(value) as unknown;
  if (prototype !== Object.prototype && prototype !== null) {
    return null;
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string")) {
    return null;
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of ownKeys) {
    if (typeof key !== "string") {
      return null;
    }
    const descriptor = descriptors[key];
    if (
      descriptor === undefined ||
      !("value" in descriptor) ||
      descriptor.enumerable !== true
    ) {
      return null;
    }
  }

  return value as StrictRecord;
}

function hasExactKeys(
  record: StrictRecord,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(record);
  return (
    actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(record, key))
  );
}

function isCanonicalUtcTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }

  const timestamp = Date.parse(value);
  return (
    Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
  );
}

function isConsentDecision(value: unknown): value is AnalyticsConsentDecision {
  return value === "unknown" || value === "denied" || value === "granted";
}

function assertCanonicalUtcTimestamp(value: unknown): asserts value is string {
  if (!isCanonicalUtcTimestamp(value)) {
    throw new TypeError(
      "updatedAt must be a canonical UTC ISO timestamp with milliseconds",
    );
  }
}

export function createInitialAnalyticsConsentSnapshot(
  updatedAt: string | null = null,
): AnalyticsConsentSnapshot {
  if (updatedAt !== null) {
    assertCanonicalUtcTimestamp(updatedAt);
  }

  return Object.freeze({
    schemaVersion: ANALYTICS_CONSENT_SCHEMA_VERSION,
    decision: "unknown",
    revision: 0,
    updatedAt,
  });
}

export function parseAnalyticsConsentSnapshot(
  value: unknown,
): AnalyticsConsentSnapshot | null {
  try {
    const record = toStrictRecord(value);
    if (record === null || !hasExactKeys(record, CONSENT_KEYS)) {
      return null;
    }

    const { schemaVersion, decision, revision, updatedAt } = record;
    if (
      schemaVersion !== ANALYTICS_CONSENT_SCHEMA_VERSION ||
      !isConsentDecision(decision) ||
      !Number.isSafeInteger(revision) ||
      typeof revision !== "number" ||
      revision < 0 ||
      (updatedAt !== null && !isCanonicalUtcTimestamp(updatedAt))
    ) {
      return null;
    }

    if (
      (revision === 0 && decision !== "unknown") ||
      (revision > 0 && decision === "unknown") ||
      (decision !== "unknown" && updatedAt === null)
    ) {
      return null;
    }

    return Object.freeze({
      schemaVersion: ANALYTICS_CONSENT_SCHEMA_VERSION,
      decision,
      revision,
      updatedAt,
    });
  } catch {
    return null;
  }
}

export function applyAnalyticsConsentDecision(
  current: AnalyticsConsentSnapshot,
  decision: Exclude<AnalyticsConsentDecision, "unknown">,
  updatedAt: string,
): AnalyticsConsentSnapshot {
  const parsedCurrent = parseAnalyticsConsentSnapshot(current);
  if (parsedCurrent === null) {
    throw new TypeError("current analytics consent snapshot is invalid");
  }
  if (decision !== "granted" && decision !== "denied") {
    throw new TypeError("analytics consent decision must be granted or denied");
  }
  assertCanonicalUtcTimestamp(updatedAt);
  if (parsedCurrent.revision === Number.MAX_SAFE_INTEGER) {
    throw new RangeError("analytics consent revision cannot be incremented");
  }

  return Object.freeze({
    schemaVersion: ANALYTICS_CONSENT_SCHEMA_VERSION,
    decision,
    revision: parsedCurrent.revision + 1,
    updatedAt,
  });
}

function isPlatform(value: unknown): value is AnalyticsPlatform {
  return value === "web" || value === "ios" || value === "android";
}

function isAnalyticsIdentifier(value: unknown): value is string {
  return typeof value === "string" && ANALYTICS_IDENTIFIER.test(value);
}

const ANALYTICS_EXERCISE_TYPES: readonly AnalyticsExerciseType[] = [
  "audio_choice",
  "association",
  "word_order",
  "recall",
  "reading",
];

function isExerciseType(value: unknown): value is AnalyticsExerciseType {
  return ANALYTICS_EXERCISE_TYPES.includes(value as AnalyticsExerciseType);
}

function parseAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  try {
    const record = toStrictRecord(value);
    if (record === null || typeof record.name !== "string") {
      return null;
    }

    const platform = record.platform;
    if (!isPlatform(platform)) {
      return null;
    }

    switch (record.name) {
      case "onboarding_started":
      case "onboarding_completed":
      case "content_reported":
      case "account_export_requested":
      case "account_deletion_requested":
        if (!hasExactKeys(record, PLATFORM_ONLY_KEYS)) {
          return null;
        }
        return Object.freeze({ name: record.name, platform });

      case "lesson_started":
      case "lesson_completed":
      case "review_due":
      case "review_completed": {
        if (
          !hasExactKeys(record, LESSON_KEYS) ||
          !isAnalyticsIdentifier(record.lessonVersionId)
        ) {
          return null;
        }
        return Object.freeze({
          name: record.name,
          lessonVersionId: record.lessonVersionId,
          platform,
        });
      }

      case "exercise_answered": {
        if (
          !hasExactKeys(record, EXERCISE_ANSWERED_KEYS) ||
          !isAnalyticsIdentifier(record.lessonVersionId) ||
          !isExerciseType(record.exerciseType) ||
          typeof record.correct !== "boolean" ||
          (record.durationBucket !== "under_10s" &&
            record.durationBucket !== "10_to_30s" &&
            record.durationBucket !== "over_30s")
        ) {
          return null;
        }
        return Object.freeze({
          name: record.name,
          lessonVersionId: record.lessonVersionId,
          exerciseType: record.exerciseType,
          correct: record.correct,
          durationBucket: record.durationBucket,
          platform,
        });
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function validateAnalyticsEvent(
  value: unknown,
): value is AnalyticsEvent {
  return parseAnalyticsEvent(value) !== null;
}

function hasGrantedConsent(source: AnalyticsConsentSource): boolean {
  try {
    const value = typeof source === "function" ? source() : source;
    if (typeof value === "boolean") {
      return value;
    }
    return parseAnalyticsConsentSnapshot(value)?.decision === "granted";
  } catch {
    return false;
  }
}

function discardRejectedCapture(result: unknown): void {
  if (
    (typeof result === "object" && result !== null) ||
    typeof result === "function"
  ) {
    void Promise.resolve(result).catch(() => undefined);
  }
}

export function createConsentAwareAnalytics(
  consent: AnalyticsConsentSource,
  sink: unknown,
): AnalyticsSink {
  return Object.freeze({
    capture(event: AnalyticsEvent): void {
      try {
        if (!hasGrantedConsent(consent)) {
          return;
        }

        const validatedEvent = parseAnalyticsEvent(event);
        if (validatedEvent === null) {
          return;
        }

        if (
          (typeof sink !== "object" || sink === null) &&
          typeof sink !== "function"
        ) {
          return;
        }

        const capture = (sink as { readonly capture?: unknown }).capture;
        if (typeof capture !== "function") {
          return;
        }

        const result = Reflect.apply(capture, sink, [
          validatedEvent,
        ]) as unknown;
        discardRejectedCapture(result);
      } catch {
        // Analytics is best-effort and must never break the learning experience.
      }
    },
  });
}

export const noOpAnalytics: AnalyticsSink = Object.freeze({ capture() {} });
