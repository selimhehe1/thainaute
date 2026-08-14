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

export type AttemptAnswer =
  | {
      readonly kind: "association";
      readonly pairs: readonly {
        readonly promptPairId: string;
        readonly chosenPairId: string;
      }[];
      readonly missedOnce?: boolean | undefined;
    }
  | {
      readonly kind: "word_order";
      readonly tokenIds: readonly string[];
      readonly missedOnce?: boolean | undefined;
    }
  | {
      readonly kind: "recall";
      readonly value: string;
      readonly missedOnce?: boolean | undefined;
    };

/**
 * Les tolérances de saisie d'un rappel.
 *
 * POURQUOI LES TROIS DERNIÈRES EXISTENT : 76 exercices de rappel vivaient
 * dans une leçon qui promet « casse ignorée », « signes de ton facultatifs »
 * ou « point médian facultatif ». Vingt-trois tenaient la promesse en
 * énumérant la variante à la main ; cinquante-trois la trahissaient, faute
 * d'un endroit où la déclarer. Voir `docs/qa/politique-de-saisie-2026-08-14`.
 *
 * Ces champs ne décident d'aucun seuil pédagogique : ils rendent applicable
 * ce que chaque leçon déclare déjà. Une leçon qui ne promet rien garde le
 * comportement strict, ce qui est le cas de toute l'unité 1 publiée.
 */
export interface AttemptAnswerPolicy {
  readonly normalization: "nfc";
  readonly trimWhitespace: boolean;
  readonly collapseInnerWhitespace: boolean;
  readonly ignoreCase?: boolean | undefined;
  readonly ignoreToneMarks?: boolean | undefined;
  readonly ignoreMiddleDot?: boolean | undefined;
}

/**
 * Données créées hors ligne par le client. Les résultats pédagogiques en sont
 * volontairement absents : le serveur les calcule à partir de la version du
 * contenu annoncée.
 */
export interface AttemptSubmission {
  readonly eventId: string;
  readonly deviceId: string;
  readonly exerciseId: string;
  readonly selectedOptionId?: string | undefined;
  readonly answer?: AttemptAnswer | undefined;
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
export interface OptionExerciseAnswerKey {
  readonly exerciseId: string;
  readonly itemId: string;
  readonly skill: SkillDimension;
  readonly contentVersionId: string;
  /** Absence historique de `kind` = exercice à option unique. */
  readonly kind?: "option";
  readonly correctOptionId: string;
}

export interface AssociationExerciseAnswerKey extends Omit<
  OptionExerciseAnswerKey,
  "kind" | "correctOptionId"
> {
  readonly kind: "association";
  readonly pairIds: readonly string[];
}

export interface WordOrderExerciseAnswerKey extends Omit<
  OptionExerciseAnswerKey,
  "kind" | "correctOptionId"
> {
  readonly kind: "word_order";
  readonly validTokenIds: readonly string[];
  readonly correctOrder: readonly string[];
}

export interface RecallExerciseAnswerKey extends Omit<
  OptionExerciseAnswerKey,
  "kind" | "correctOptionId"
> {
  readonly kind: "recall";
  readonly acceptedAnswers: readonly string[];
  readonly answerPolicy: AttemptAnswerPolicy;
}

export type TypedExerciseAnswerKey =
  | AssociationExerciseAnswerKey
  | WordOrderExerciseAnswerKey
  | RecallExerciseAnswerKey;

/** Compatibilité de nom pour les exercices historiques à option unique. */
export type ExerciseAnswerKey = OptionExerciseAnswerKey;

export type AnyExerciseAnswerKey = ExerciseAnswerKey | TypedExerciseAnswerKey;

export function exerciseAnswerKeyKind(
  answerKey: AnyExerciseAnswerKey,
): "option" | TypedExerciseAnswerKey["kind"] {
  return answerKey.kind ?? "option";
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
  | "invalid_answer"
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
  answerKey: AnyExerciseAnswerKey,
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

  const rating = evaluateAnswer(submission, answerKey);

  return {
    eventId: submission.eventId,
    deviceId: submission.deviceId,
    exerciseId: submission.exerciseId,
    ...(submission.selectedOptionId === undefined
      ? {}
      : { selectedOptionId: submission.selectedOptionId }),
    ...(submission.answer === undefined ? {} : { answer: submission.answer }),
    answeredAt: submission.answeredAt,
    durationMs: submission.durationMs,
    contentVersionId: submission.contentVersionId,
    itemId: answerKey.itemId,
    skill: answerKey.skill,
    userId: authoritativeUserId,
    rating,
    algorithmVersion: SRS_ALGORITHM_VERSION,
  };
}

function normalizeRecallValue(
  value: string,
  policy: AttemptAnswerPolicy,
): string {
  let normalized =
    policy.normalization === "nfc" ? value.normalize("NFC") : value;
  if (policy.trimWhitespace) normalized = normalized.trim();
  if (policy.collapseInnerWhitespace) {
    normalized = normalized.replace(/\s+/gu, " ");
  }
  if (policy.ignoreCase === true) normalized = normalized.toLowerCase();
  if (policy.ignoreMiddleDot === true) {
    normalized = normalized.replaceAll("·", "");
  }
  if (policy.ignoreToneMarks === true) {
    // Les signes de ton de la transcription Thaïnaute sont des diacritiques
    // combinants une fois la chaîne décomposée. On ne touche QUE ceux-là :
    // les caractères thaïs, eux, portent leurs marques de ton dans des points
    // de code dédiés du bloc U+0E00, que cette plage ne contient pas. Une
    // réponse écrite en thaï reste donc comparée à l'identique.
    normalized = normalized
      .normalize("NFD")
      .replace(/[̀-ͯ]/gu, "")
      .normalize("NFC");
  }
  return normalized;
}

function invalidAnswer(message: string): never {
  throw new AttemptEvaluationError("invalid_answer", message);
}

function evaluateAnswer(
  submission: AttemptSubmission,
  answerKey: AnyExerciseAnswerKey,
): AttemptRating {
  if (answerKey.kind === undefined || answerKey.kind === "option") {
    if (
      submission.selectedOptionId === undefined ||
      submission.answer !== undefined
    ) {
      return invalidAnswer("Une option unique est attendue.");
    }
    return submission.selectedOptionId === answerKey.correctOptionId ? 1 : 0;
  }

  if (
    submission.answer === undefined ||
    submission.selectedOptionId !== undefined
  ) {
    return invalidAnswer("Une réponse typée est attendue.");
  }

  if (answerKey.kind === "association") {
    if (submission.answer.kind !== "association") {
      return invalidAnswer(
        "La réponse d'association ne correspond pas à l'exercice.",
      );
    }
    if (submission.answer.pairs.length !== answerKey.pairIds.length) {
      return 0;
    }
    const expected = new Set(answerKey.pairIds);
    const seenPrompts = new Set<string>();
    const seenChoices = new Set<string>();
    const correct =
      submission.answer.pairs.every((pair) => {
        if (
          !expected.has(pair.promptPairId) ||
          !expected.has(pair.chosenPairId) ||
          pair.promptPairId !== pair.chosenPairId ||
          seenPrompts.has(pair.promptPairId) ||
          seenChoices.has(pair.chosenPairId)
        ) {
          return false;
        }
        seenPrompts.add(pair.promptPairId);
        seenChoices.add(pair.chosenPairId);
        return true;
      }) && seenPrompts.size === expected.size;
    return correct && submission.answer.missedOnce !== true ? 1 : 0;
  }

  if (answerKey.kind === "word_order") {
    if (submission.answer.kind !== "word_order") {
      return invalidAnswer("L'ordre de mots ne correspond pas à l'exercice.");
    }
    if (
      submission.answer.tokenIds.some(
        (tokenId) => !answerKey.validTokenIds.includes(tokenId),
      )
    ) {
      return invalidAnswer("Un jeton ne appartient pas à l'exercice.");
    }
    const correct =
      submission.answer.tokenIds.length === answerKey.correctOrder.length &&
      submission.answer.tokenIds.every(
        (tokenId, index) => tokenId === answerKey.correctOrder[index],
      );
    return correct && submission.answer.missedOnce !== true ? 1 : 0;
  }

  if (answerKey.kind !== "recall" || submission.answer.kind !== "recall") {
    return invalidAnswer("Le rappel ne correspond pas à l'exercice.");
  }
  const normalized = normalizeRecallValue(
    submission.answer.value,
    answerKey.answerPolicy,
  );
  const correct = answerKey.acceptedAnswers.some(
    (accepted) =>
      normalizeRecallValue(accepted, answerKey.answerPolicy) === normalized,
  );
  return correct && submission.answer.missedOnce !== true ? 1 : 0;
}
