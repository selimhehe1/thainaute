export const SRS_ALGORITHM_VERSION = "srs-v0" as const;

export type AlgorithmVersion = typeof SRS_ALGORITHM_VERSION;

export const SKILL_DIMENSIONS = [
  "listening",
  "reading",
  "recall",
  "production",
  "tone",
] as const;

export type SkillDimension = (typeof SKILL_DIMENSIONS)[number];

export type AttemptRating = 0 | 1;

/**
 * Données créées hors ligne par le client. Les résultats pédagogiques en sont
 * volontairement absents : le serveur les calcule à partir de la version du
 * contenu annoncée.
 */
export interface AttemptSubmission {
  readonly eventId: string;
  readonly deviceId: string;
  readonly exerciseId: string;
  readonly selectedOptionId: string;
  readonly answeredAt: string;
  readonly durationMs: number;
  readonly contentVersionId: string;
  readonly algorithmVersion: string;
}

/** Soumission enrichie exclusivement avec la clé de correction autoritaire. */
export interface ResolvedAttemptSubmission extends AttemptSubmission {
  readonly itemId: string;
  readonly skill: SkillDimension;
}

/** Clé de correction serveur, issue d'une release de contenu immuable. */
export interface ExerciseAnswerKey {
  readonly exerciseId: string;
  readonly itemId: string;
  readonly correctOptionId: string;
  readonly skill: SkillDimension;
  readonly contentVersionId: string;
}

/** Événement autoritaire et immuable, prêt à être persisté. */
export interface AttemptEvent extends ResolvedAttemptSubmission {
  readonly userId: string | null;
  readonly rating: AttemptRating;
  readonly algorithmVersion: AlgorithmVersion;
}

export type AttemptEvaluationErrorCode =
  | "unsupported_algorithm"
  | "exercise_mismatch"
  | "content_version_mismatch"
  | "invalid_timestamp"
  | "invalid_duration";

export class AttemptEvaluationError extends Error {
  public readonly code: AttemptEvaluationErrorCode;

  public constructor(code: AttemptEvaluationErrorCode, message: string) {
    super(message);
    this.name = "AttemptEvaluationError";
    this.code = code;
  }
}

/**
 * Transforme une soumission non fiable en événement évalué. Les champs qui
 * déterminent la progression sont dérivés de la clé serveur.
 */
export function evaluateAttempt(
  submission: AttemptSubmission,
  answerKey: ExerciseAnswerKey,
  authoritativeUserId: string | null,
): AttemptEvent {
  if (submission.algorithmVersion !== SRS_ALGORITHM_VERSION) {
    throw new AttemptEvaluationError(
      "unsupported_algorithm",
      `Version SRS non prise en charge : ${String(submission.algorithmVersion)}`,
    );
  }

  if (submission.exerciseId !== answerKey.exerciseId) {
    throw new AttemptEvaluationError(
      "exercise_mismatch",
      "L'exercice ne correspond pas à la clé de correction.",
    );
  }

  if (submission.contentVersionId !== answerKey.contentVersionId) {
    throw new AttemptEvaluationError(
      "content_version_mismatch",
      "La version du contenu ne correspond pas à la clé de correction.",
    );
  }

  if (!Number.isFinite(Date.parse(submission.answeredAt))) {
    throw new AttemptEvaluationError(
      "invalid_timestamp",
      "answeredAt doit être un horodatage ISO valide.",
    );
  }

  if (
    !Number.isSafeInteger(submission.durationMs) ||
    submission.durationMs < 0
  ) {
    throw new AttemptEvaluationError(
      "invalid_duration",
      "durationMs doit être un entier positif ou nul.",
    );
  }

  return {
    ...submission,
    itemId: answerKey.itemId,
    skill: answerKey.skill,
    userId: authoritativeUserId,
    rating: submission.selectedOptionId === answerKey.correctOptionId ? 1 : 0,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}
