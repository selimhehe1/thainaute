export type AnalyticsEvent =
  | {
      name: "onboarding_started";
      platform: "web" | "ios" | "android";
    }
  | {
      name: "onboarding_completed";
      platform: "web" | "ios" | "android";
    }
  | {
      name: "lesson_started";
      lessonVersionId: string;
      platform: "web" | "ios" | "android";
    }
  | {
      name: "exercise_answered";
      lessonVersionId: string;
      exerciseType: "audio_choice";
      correct: boolean;
      durationBucket: "under_10s" | "10_to_30s" | "over_30s";
      platform: "web" | "ios" | "android";
    }
  | {
      name: "lesson_completed";
      lessonVersionId: string;
      platform: "web" | "ios" | "android";
    }
  | {
      name: "review_due";
      lessonVersionId: string;
      platform: "web" | "ios" | "android";
    }
  | {
      name: "review_completed";
      lessonVersionId: string;
      platform: "web" | "ios" | "android";
    }
  | {
      name: "account_export_requested";
      platform: "web" | "ios" | "android";
    }
  | {
      name: "account_deletion_requested";
      platform: "web" | "ios" | "android";
    };

export interface AnalyticsSink {
  capture(event: AnalyticsEvent): void;
}

export function createConsentAwareAnalytics(
  consent: boolean,
  sink: AnalyticsSink,
): AnalyticsSink {
  return {
    capture(event) {
      if (consent) {
        sink.capture(event);
      }
    },
  };
}

export const noOpAnalytics: AnalyticsSink = { capture() {} };
