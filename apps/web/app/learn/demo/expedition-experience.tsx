"use client";

import type { AnalyticsSink } from "@thainaute/analytics";
import type { Lesson, LessonExercise } from "@thainaute/content";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  abandonLocalExpeditionForVersionChange,
  abandonLocalLessonForVersionChange,
  attemptSubmissionSchema,
  clearCompletedLocalExpedition,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  finishLocalLesson,
  ingestAttemptBatch,
  MAX_ATTEMPT_DURATION_MS,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  recordLocalExpeditionResult,
  selectLocalLessonOption,
  startLocalExpedition,
  startLocalLesson,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
} from "@thainaute/sync";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { ExpeditionTrail } from "@/components/brand/expedition-trail";
import { BrandCurve, ToneCurve } from "@/components/brand/tone-curve";
import { buttonClass } from "@/components/ui/button";
import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
  migrateLegacyDemoFixtureAttempts,
} from "@/lib/client/attempt-outbox-store";
import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { useWebAuthSession } from "@/lib/client/auth-session";
import {
  LocalExperienceStorageError,
  WebLocalExperienceStore,
} from "@/lib/client/local-experience-store";

import { ContentReportPanel } from "./content-report-panel";
import { LocalVoiceComparison } from "./local-voice-comparison";
import styles from "./lesson.module.css";

interface ExpeditionProps {
  readonly lesson: Lesson;
  readonly analytics?: AnalyticsSink | undefined;
}

interface Celebration {
  readonly exerciseId: string;
  readonly correct: boolean;
  readonly feedback: string;
}

const MECHANIC_LABELS: Record<LessonExercise["type"], string> = {
  audio_choice: "Écoute",
  association: "Association",
  word_order: "Ordre des mots",
  recall: "Rappel",
  reading: "Lecture",
};

function captureSafely(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // La mesure optionnelle ne bloque jamais la séance locale.
  }
}

function durationBucket(
  durationMs: number,
): "under_10s" | "10_to_30s" | "over_30s" {
  if (durationMs < 10_000) return "under_10s";
  return durationMs <= 30_000 ? "10_to_30s" : "over_30s";
}

function normalizeRecallInput(
  raw: string,
  policy: Extract<LessonExercise, { type: "recall" }>["answerPolicy"],
): string {
  let value = raw.normalize("NFC");
  if (policy.trimWhitespace) value = value.trim();
  if (policy.collapseInnerWhitespace) value = value.replaceAll(/\s+/gu, " ");
  return value;
}

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function subscribeToReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/** Lecteur Expédition : une carte par exercice, cinq mécaniques (ADR-0023). */
export function ExpeditionExperience({
  lesson,
  analytics: analyticsOverride,
}: ExpeditionProps) {
  const router = useRouter();
  const { analytics: consentAwareAnalytics } = useWebAnalyticsConsent();
  const analytics = analyticsOverride ?? consentAwareAnalytics;
  const { sessionBoundaryRevision } = useWebAuthSession();

  const [store, setStore] = useState<WebAttemptOutboxStore | null>(null);
  const [experienceStore, setExperienceStore] =
    useState<WebLocalExperienceStore | null>(null);
  const [snapshot, setSnapshot] = useState<LocalExperienceSnapshot | null>(
    null,
  );
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [abandonConfirmation, setAbandonConfirmation] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [cardStartedAt, setCardStartedAt] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<readonly string[]>([]);
  const [orderedTokenIds, setOrderedTokenIds] = useState<readonly string[]>([]);
  const [recallValue, setRecallValue] = useState("");
  const [hint, setHint] = useState("");
  const missed = useRef(false);
  const submissionInFlight = useRef(false);
  const finishInFlight = useRef(false);
  const tokenButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingTokenFocus = useRef<string | null>(null);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const lessonAudio = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  const itemsById = useMemo(
    () => new Map(lesson.items.map((item) => [item.id, item])),
    [lesson.items],
  );
  const plan = useMemo(
    () => lesson.exercises.map((exercise) => exercise.id),
    [lesson.exercises],
  );
  const listeningExercise = lesson.exercises.find(
    (exercise) => exercise.type === "audio_choice",
  );

  const stopSignal = useCallback((): void => {
    const audio = lessonAudio.current;
    lessonAudio.current = null;
    if (audio === null) return;
    audio.onended = null;
    audio.onerror = null;
    try {
      audio.pause();
    } catch {
      // Le nettoyage continue sans exposer le détail du navigateur.
    }
    try {
      audio.removeAttribute("src");
      audio.load();
    } catch {
      // Le lecteur détaché sera libéré par le navigateur.
    }
  }, []);

  const playSignal = useCallback((): void => {
    stopSignal();
    setAudioError(false);
    const audio = new Audio("/audio/fixture-tone.wav");
    lessonAudio.current = audio;
    audio.onended = () => {
      if (lessonAudio.current === audio) lessonAudio.current = null;
    };
    audio.onerror = () => {
      if (lessonAudio.current !== audio) return;
      stopSignal();
      setAudioError(true);
    };
    void audio.play().catch(() => {
      if (lessonAudio.current !== audio) return;
      stopSignal();
      setAudioError(true);
    });
  }, [stopSignal]);

  useEffect(() => {
    let active = true;
    const outboxInstance = new WebAttemptOutboxStore("thainaute-demo-v1");
    const experienceInstance = new WebLocalExperienceStore();
    queueMicrotask(() => {
      if (!active) return;
      setStorageStatus("loading");
      setOutbox(createAttemptOutboxSnapshot());
      setSnapshot(null);
      setStore(outboxInstance);
      setExperienceStore(experienceInstance);
    });
    return () => {
      active = false;
      outboxInstance.close();
      experienceInstance.close();
    };
  }, []);

  useEffect(() => {
    const stopOnPageExit = () => stopSignal();
    window.addEventListener("pagehide", stopOnPageExit);
    return () => {
      window.removeEventListener("pagehide", stopOnPageExit);
      stopSignal();
    };
  }, [stopSignal]);

  useEffect(() => {
    if (store === null || experienceStore === null) return;
    let active = true;
    const activeOutboxStore = store;
    const activeExperienceStore = experienceStore;

    async function hydrate(): Promise<void> {
      await migrateLegacyDemoFixtureAttempts();
      let nextOutbox = await activeOutboxStore.read();
      let nextExperience = await activeExperienceStore.read();
      let replayedCelebration: Celebration | null = null;

      // Une tentative réservée avant un crash est re-poussée vers le journal.
      if (nextExperience.lesson?.phase === "submitting") {
        nextOutbox = await activeOutboxStore.enqueue(
          nextExperience.lesson.submission,
        );
        const durableOutbox = nextOutbox;
        nextExperience = await activeExperienceStore.update((current) =>
          confirmLocalLessonResult(
            current,
            durableOutbox,
            new Date().toISOString(),
          ),
        );
      }

      // Un résultat durable interrompu avant sa consignation est rejoué.
      const interrupted = nextExperience.lesson;
      if (
        interrupted !== null &&
        (interrupted.phase === "result" || interrupted.phase === "completed") &&
        interrupted.lessonVersionId === lesson.versionId &&
        nextExperience.expedition !== null &&
        !nextExperience.expedition.results.some(
          ({ exerciseId }) => exerciseId === interrupted.exerciseId,
        )
      ) {
        const durableOutbox = nextOutbox;
        if (interrupted.phase === "result") {
          nextExperience = await activeExperienceStore.update((current) =>
            finishLocalLesson(current, durableOutbox, new Date().toISOString()),
          );
        }
        const answered = lesson.exercises.find(
          (exercise) =>
            exercise.type === "audio_choice" &&
            exercise.id === interrupted.exerciseId,
        );
        if (answered?.type === "audio_choice") {
          const evaluated = ingestAttemptBatch({
            existingEvents: [],
            submissions: durableOutbox.entries
              .filter(({ status }) => status !== "rejected")
              .map((entry) => entry.submission),
            answerKeys: [
              {
                exerciseId: answered.id,
                itemId: answered.itemId,
                correctOptionId: answered.correctOptionId,
                skill: "listening",
                contentVersionId: lesson.versionId,
              },
            ],
            authenticatedUserId: null,
          }).events.find(
            ({ eventId }) => eventId === interrupted.submission.eventId,
          );
          if (evaluated !== undefined) {
            nextExperience = await activeExperienceStore.update((current) =>
              recordLocalExpeditionResult(current, {
                exerciseId: answered.id,
                // La tentative durable fait foi : son horodatage est repris
                // tel quel, pour qu'un rejeu reste idempotent.
                rating: evaluated.rating,
                answeredAt: interrupted.submission.answeredAt,
              }),
            );
            // L'exercice a été noté sans que sa correction ait été montrée :
            // on la présente à la reprise plutôt que de la sauter.
            replayedCelebration = {
              exerciseId: answered.id,
              correct: evaluated.rating === 1,
              feedback:
                evaluated.rating === 1
                  ? answered.feedback.correctFr
                  : answered.feedback.incorrectFr,
            };
          }
        }
      }

      if (!active) return;
      setOutbox(nextOutbox);
      setSnapshot(nextExperience);
      // Toute reprise repart d'une carte vierge : un appariement ou une
      // saisie hérités d'avant l'incident laisseraient la carte injouable.
      setSelectedOptionId(
        nextExperience.lesson?.phase === "question" &&
          nextExperience.lesson.lessonVersionId === lesson.versionId
          ? nextExperience.lesson.selectedOptionId
          : null,
      );
      setSelectedPairId(null);
      setMatchedPairIds([]);
      setOrderedTokenIds([]);
      setRecallValue("");
      setHint("");
      setAudioError(false);
      // Une correction rejouée s'impose ; sinon on laisse à l'écran celle que
      // l'apprenant est peut-être en train de lire.
      if (replayedCelebration !== null) setCelebration(replayedCelebration);
      missed.current = false;
      setCardStartedAt(Date.now());
      setErrorMessage("");
      setAbandonConfirmation(false);
      setStorageStatus("ready");
    }

    void hydrate().catch(() => {
      if (!active) return;
      setStorageStatus("error");
    });

    return () => {
      active = false;
    };
  }, [experienceStore, lesson, storageRetryToken, store]);

  const expedition = snapshot?.expedition ?? null;
  const expeditionMatchesLesson =
    expedition !== null && expedition.lessonVersionId === lesson.versionId;
  const staleExpedition =
    expedition !== null && !expeditionMatchesLesson ? expedition : null;
  const staleLesson =
    snapshot?.lesson != null &&
    snapshot.lesson.lessonVersionId !== lesson.versionId
      ? snapshot.lesson
      : null;

  const results = expeditionMatchesLesson ? expedition.results : [];
  const resolvedIds = new Set(results.map(({ exerciseId }) => exerciseId));
  const celebratedExercise =
    celebration === null
      ? undefined
      : lesson.exercises.find(({ id }) => id === celebration.exerciseId);
  const currentExercise =
    celebratedExercise ??
    lesson.exercises.find(({ id }) => !resolvedIds.has(id));
  const expeditionComplete =
    expeditionMatchesLesson &&
    results.length === plan.length &&
    celebration === null;
  // Le repère d'étape suit l'exercice affiché, pas le nombre de résultats :
  // pendant la correction, le résultat est déjà consigné.
  const currentIndex = plan.indexOf(currentExercise?.id ?? "");
  const currentStep = currentIndex < 0 ? plan.length : currentIndex + 1;

  const stage: "loading" | "error" | "stale" | "intro" | "card" | "recap" =
    storageStatus === "loading" || snapshot === null
      ? "loading"
      : storageStatus === "error"
        ? "error"
        : staleLesson !== null || staleExpedition !== null
          ? "stale"
          : !expeditionMatchesLesson
            ? "intro"
            : expeditionComplete
              ? "recap"
              : "card";

  const registerToken =
    (tokenId: string) =>
    (element: HTMLButtonElement | null): void => {
      if (element === null) tokenButtons.current.delete(tokenId);
      else tokenButtons.current.set(tokenId, element);
    };

  // Un jeton déplacé est démonté puis remonté dans l'autre zone : on rend le
  // focus à sa nouvelle instance juste après le rendu.
  useEffect(() => {
    const tokenId = pendingTokenFocus.current;
    if (tokenId === null) return;
    pendingTokenFocus.current = null;
    tokenButtons.current.get(tokenId)?.focus();
  }, [orderedTokenIds]);

  // Le titre reprend le focus à chaque changement de carte ET au passage en
  // correction : sans cela le bouton validé disparaît et le focus retombe
  // sur le document, ce qui renvoie l'utilisateur clavier tout en haut.
  useEffect(() => {
    stopSignal();
    if (stage === "card" || stage === "recap") {
      queueMicrotask(() => cardHeading.current?.focus());
    }
  }, [stage, currentExercise?.id, celebration?.exerciseId, stopSignal]);

  function resetCardState(): void {
    setSelectedOptionId(null);
    setSelectedPairId(null);
    setMatchedPairIds([]);
    setOrderedTokenIds([]);
    setRecallValue("");
    setHint("");
    missed.current = false;
    setCardStartedAt(Date.now());
  }

  function failStorage(error: unknown): void {
    setStorageStatus("error");
    setErrorMessage(
      error instanceof AttemptOutboxStorageError ||
        error instanceof LocalExperienceStorageError
        ? error.message
        : "La progression locale n'a pas pu être conservée.",
    );
  }

  function beginExpedition(): void {
    if (experienceStore === null || storageStatus !== "ready" || isSaving) {
      return;
    }
    setIsSaving(true);
    const startedAt = new Date().toISOString();
    void experienceStore
      .update((current) =>
        startLocalExpedition(current, {
          lessonVersionId: lesson.versionId,
          exerciseIds: plan,
          startedAt,
        }),
      )
      .then((next) => {
        setSnapshot(next);
        resetCardState();
        captureSafely(analytics, {
          name: "lesson_started",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      })
      .catch(failStorage)
      .finally(() => setIsSaving(false));
  }

  const recordResult = useCallback(
    async (exercise: LessonExercise, rating: 0 | 1): Promise<void> => {
      if (experienceStore === null) return;
      const answeredAt = new Date().toISOString();
      const next = await experienceStore.update((current) =>
        recordLocalExpeditionResult(current, {
          exerciseId: exercise.id,
          rating,
          answeredAt,
        }),
      );
      setSnapshot(next);
      captureSafely(analytics, {
        name: "exercise_answered",
        lessonVersionId: lesson.versionId,
        exerciseType: exercise.type,
        correct: rating === 1,
        durationBucket: durationBucket(
          Math.min(
            MAX_ATTEMPT_DURATION_MS,
            Math.max(0, Date.now() - cardStartedAt),
          ),
        ),
        platform: "web",
      });
      if (next.expedition?.results.length === plan.length) {
        captureSafely(analytics, {
          name: "lesson_completed",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      }
    },
    [analytics, cardStartedAt, experienceStore, lesson.versionId, plan.length],
  );

  function celebrate(exercise: LessonExercise, rating: 0 | 1): void {
    stopSignal();
    setCelebration({
      exerciseId: exercise.id,
      correct: rating === 1,
      feedback:
        rating === 1
          ? exercise.feedback.correctFr
          : exercise.feedback.incorrectFr,
    });
  }

  const advance = useCallback((): void => {
    setCelebration(null);
    setSelectedOptionId(null);
    setSelectedPairId(null);
    setMatchedPairIds([]);
    setOrderedTokenIds([]);
    setRecallValue("");
    setHint("");
    missed.current = false;
    setCardStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (celebration === null || !celebration.correct || reducedMotion) return;
    const timer = window.setTimeout(advance, 800);
    return () => window.clearTimeout(timer);
  }, [advance, celebration, reducedMotion]);

  function settleLocalExercise(exercise: LessonExercise): void {
    const rating: 0 | 1 = missed.current ? 0 : 1;
    setIsSaving(true);
    void recordResult(exercise, rating)
      .then(() => celebrate(exercise, rating))
      .catch(failStorage)
      .finally(() => setIsSaving(false));
  }

  async function settleListeningExercise(
    exercise: Extract<LessonExercise, { type: "audio_choice" }>,
  ): Promise<void> {
    if (
      store === null ||
      experienceStore === null ||
      selectedOptionId === null
    ) {
      return;
    }
    const deviceId = await store.getOrCreateDeviceId(() => crypto.randomUUID());
    const answeredAt = new Date().toISOString();
    const submission = attemptSubmissionSchema.parse({
      eventId: crypto.randomUUID(),
      deviceId,
      exerciseId: exercise.id,
      selectedOptionId,
      answeredAt,
      durationMs: Math.min(
        MAX_ATTEMPT_DURATION_MS,
        Math.max(0, Math.round(Date.parse(answeredAt) - cardStartedAt)),
      ),
      contentVersionId: lesson.versionId,
      algorithmVersion: SRS_ALGORITHM_VERSION,
    });

    const prepared = await experienceStore.update((current) => {
      let session = current;
      if (session.lesson === null) {
        session = startLocalLesson(session, {
          lessonVersionId: lesson.versionId,
          exerciseId: exercise.id,
          startedAt: answeredAt,
        });
        session = openLocalLessonQuestion(session, answeredAt);
      }
      session = selectLocalLessonOption(session, selectedOptionId, answeredAt);
      return prepareLocalLessonSubmission(session, submission, answeredAt);
    });
    if (prepared.lesson?.phase !== "submitting") {
      throw new LocalExperienceStorageError(
        "La tentative locale n'a pas été réservée.",
      );
    }
    const nextOutbox = await store.enqueue(prepared.lesson.submission);
    const settledAt = new Date().toISOString();
    let confirmed = await experienceStore.update((current) =>
      confirmLocalLessonResult(current, nextOutbox, settledAt),
    );
    confirmed = await experienceStore.update((current) =>
      finishLocalLesson(current, nextOutbox, new Date().toISOString()),
    );
    setOutbox(nextOutbox);
    setSnapshot(confirmed);

    const evaluated = ingestAttemptBatch({
      existingEvents: [],
      submissions: nextOutbox.entries
        .filter(({ status }) => status !== "rejected")
        .map((entry) => entry.submission),
      answerKeys: [
        {
          exerciseId: exercise.id,
          itemId: exercise.itemId,
          correctOptionId: exercise.correctOptionId,
          skill: "listening",
          contentVersionId: lesson.versionId,
        },
      ],
      authenticatedUserId: null,
    }).events.find(({ eventId }) => eventId === submission.eventId);
    if (evaluated === undefined) {
      throw new LocalExperienceStorageError(
        "La tentative locale n'a pas pu être évaluée.",
      );
    }
    await recordResult(exercise, evaluated.rating);
    celebrate(exercise, evaluated.rating);
  }

  /** La sélection d'écoute est durable : elle survit à un rechargement. */
  function persistListeningSelection(
    exercise: Extract<LessonExercise, { type: "audio_choice" }>,
    optionId: string,
  ): void {
    setSelectedOptionId(optionId);
    setHint("");
    if (experienceStore === null || storageStatus !== "ready") return;
    const selectedAt = new Date().toISOString();
    void experienceStore
      .update((current) => {
        let session = current;
        if (session.lesson === null) {
          session = startLocalLesson(session, {
            lessonVersionId: lesson.versionId,
            exerciseId: exercise.id,
            startedAt: selectedAt,
          });
          session = openLocalLessonQuestion(session, selectedAt);
        }
        return selectLocalLessonOption(session, optionId, selectedAt);
      })
      .then(setSnapshot)
      .catch(() => {
        setErrorMessage(
          "Le choix reste affiché, mais n'a pas pu être conservé.",
        );
      });
  }

  function submitListening(
    exercise: Extract<LessonExercise, { type: "audio_choice" }>,
  ): void {
    if (submissionInFlight.current) return;
    if (selectedOptionId === null) {
      setHint("Choisissez une option avant de valider.");
      return;
    }
    submissionInFlight.current = true;
    setIsSaving(true);
    void settleListeningExercise(exercise)
      .catch(failStorage)
      .finally(() => {
        submissionInFlight.current = false;
        setIsSaving(false);
      });
  }

  function chooseMatch(
    exercise: Extract<LessonExercise, { type: "association" }>,
    labelPairId: string,
  ): void {
    if (selectedPairId === null) {
      setHint("Touchez d’abord un caractère thaï, puis son étiquette.");
      return;
    }
    if (selectedPairId === labelPairId) {
      const nextMatched = [...matchedPairIds, labelPairId];
      setMatchedPairIds(nextMatched);
      setSelectedPairId(null);
      setHint("");
      if (nextMatched.length === exercise.pairs.length) {
        settleLocalExercise(exercise);
      }
      return;
    }
    missed.current = true;
    setSelectedPairId(null);
    setHint("Cette étiquette appartient à un autre caractère. Réessayez.");
  }

  function submitWordOrder(
    exercise: Extract<LessonExercise, { type: "word_order" }>,
  ): void {
    if (orderedTokenIds.length === 0) {
      setHint("Déplacez les jetons dans la zone de réponse avant de valider.");
      return;
    }
    const expected = exercise.correctOrder;
    const isCorrect =
      orderedTokenIds.length === expected.length &&
      orderedTokenIds.every((tokenId, index) => tokenId === expected[index]);
    if (!isCorrect) {
      missed.current = true;
      setHint(exercise.feedback.incorrectFr);
      return;
    }
    setHint("");
    settleLocalExercise(exercise);
  }

  function submitRecall(
    exercise: Extract<LessonExercise, { type: "recall" }>,
  ): void {
    const normalized = normalizeRecallInput(recallValue, exercise.answerPolicy);
    if (normalized.length === 0) {
      setHint("Saisissez votre réponse avant de valider.");
      return;
    }
    const isCorrect = exercise.acceptedAnswers.some(
      ({ value }) => value === normalized,
    );
    if (!isCorrect) {
      missed.current = true;
      setHint(exercise.feedback.incorrectFr);
      return;
    }
    setHint("");
    settleLocalExercise(exercise);
  }

  function submitReading(
    exercise: Extract<LessonExercise, { type: "reading" }>,
  ): void {
    if (selectedOptionId === null) {
      setHint("Choisissez une option avant de valider.");
      return;
    }
    if (selectedOptionId !== exercise.correctOptionId) {
      missed.current = true;
      setSelectedOptionId(null);
      setHint(exercise.feedback.incorrectFr);
      return;
    }
    setHint("");
    settleLocalExercise(exercise);
  }

  function abandonStaleState(): void {
    if (experienceStore === null || isSaving) return;
    const expectedLesson = staleLesson;
    const expectedExpedition = staleExpedition;
    const durableOutbox = outbox;
    setIsSaving(true);
    void experienceStore
      .update((current) => {
        let next = current;
        if (expectedLesson !== null) {
          next = abandonLocalLessonForVersionChange(
            next,
            expectedLesson,
            {
              lessonVersionId: lesson.versionId,
              exerciseId: plan[0] ?? lesson.versionId,
            },
            durableOutbox,
          );
        }
        if (expectedExpedition !== null) {
          next = abandonLocalExpeditionForVersionChange(
            next,
            expectedExpedition,
            lesson.versionId,
          );
        }
        return next;
      })
      .then((next) => {
        setSnapshot(next);
        setAbandonConfirmation(false);
        resetCardState();
      })
      .catch(failStorage)
      .finally(() => setIsSaving(false));
  }

  function finishExpedition(): void {
    // La navigation n'est pas instantanée : sans verrou, un second clic
    // tenterait de libérer une expédition déjà libérée et basculerait en
    // erreur juste avant de quitter la page.
    if (experienceStore === null || finishInFlight.current) return;
    finishInFlight.current = true;
    setIsSaving(true);
    void experienceStore
      .update((current) => clearCompletedLocalExpedition(current))
      .then(() => {
        router.push("/today");
      })
      .catch((error: unknown) => {
        finishInFlight.current = false;
        setIsSaving(false);
        failStorage(error);
      });
  }

  const listeningProjection =
    listeningExercise?.type === "audio_choice"
      ? ingestAttemptBatch({
          existingEvents: [],
          submissions: outbox.entries
            .filter(({ status }) => status !== "rejected")
            .map((entry) => entry.submission),
          answerKeys: [
            {
              exerciseId: listeningExercise.id,
              itemId: listeningExercise.itemId,
              correctOptionId: listeningExercise.correctOptionId,
              skill: "listening",
              contentVersionId: lesson.versionId,
            },
          ],
          authenticatedUserId: null,
        }).projections.find(
          ({ state }) => state.itemId === listeningExercise.itemId,
        )?.state
      : undefined;

  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  const onboardingCompleted = snapshot?.onboarding.status === "completed";

  const sortedAssociationLabels = (
    exercise: Extract<LessonExercise, { type: "association" }>,
  ) => [...exercise.pairs].sort((a, b) => a.labelFr.localeCompare(b.labelFr));

  const shuffledTokens = (
    exercise: Extract<LessonExercise, { type: "word_order" }>,
  ) => [...exercise.tokens].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <section className={styles.card} aria-labelledby="lesson-title">
      {/* Région d'annonce présente en permanence : une région ajoutée en
          même temps que son contenu n'est pas lue par les lecteurs d'écran. */}
      <p className="srOnly" role="status">
        {celebration === null
          ? ""
          : `${celebration.correct ? "Juste." : "À revoir."} ${celebration.feedback}`}
      </p>
      <div className={styles.pageSpecimen} aria-hidden="true">
        {lesson.items[0]?.thaiRaw}
      </div>
      <div className={styles.fixtureBanner} role="note">
        <strong>Donnée fictive · non publiable</strong>
        <span>
          Ces signes et ce signal valident uniquement la chaîne technique.
        </span>
      </div>

      <div className={styles.networkStatus} aria-live="polite">
        <span
          className={
            online
              ? styles.statusDot + " " + styles.statusDotOnline
              : styles.statusDot
          }
          aria-hidden="true"
        />
        {stage === "loading"
          ? "Préparation du journal local…"
          : stage === "error"
            ? "Journal local indisponible"
            : online
              ? `Journal local prêt · ${pendingAttempts} conservée${pendingAttempts > 1 ? "s" : ""}`
              : "Hors ligne · l’expédition continue avec les ressources déjà chargées"}
      </div>

      {stage === "error" && (
        <div className={styles.body}>
          <h1 id="lesson-title">Le journal local est indisponible.</h1>
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
          <div className={styles.actions}>
            <button
              className={buttonClass("primary")}
              type="button"
              onClick={() => {
                setStorageStatus("loading");
                setStorageRetryToken((current) => current + 1);
              }}
            >
              Réessayer le stockage
            </button>
          </div>
        </div>
      )}

      {stage === "stale" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Version locale plus ancienne</p>
          <h1 id="lesson-title">
            Une session précédente est encore conservée.
          </h1>
          <p className={styles.objective}>
            Thaïnaute ne la remplace jamais automatiquement. Une tentative déjà
            soumise reste dans le journal durable ; une progression non terminée
            sera abandonnée avec son point de reprise.
          </p>
          {abandonConfirmation ? (
            <div className={styles.actions}>
              <p className={styles.inlineError} role="alert">
                Deuxième confirmation : abandonner ce point de reprise et
                démarrer la version actuellement chargée ?
              </p>
              <button
                className={buttonClass("primary")}
                type="button"
                aria-busy={isSaving}
                disabled={isSaving}
                onClick={abandonStaleState}
              >
                {isSaving ? "Remplacement…" : "Confirmer l’abandon et démarrer"}
              </button>
              <button
                className={buttonClass("ghost")}
                type="button"
                disabled={isSaving}
                onClick={() => setAbandonConfirmation(false)}
              >
                Conserver l’ancienne session
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                className={buttonClass("primary")}
                type="button"
                onClick={() => setAbandonConfirmation(true)}
              >
                Abandonner cette ancienne session
              </button>
              <Link className={buttonClass("ghost")} href="/today">
                Retour à Aujourd’hui
              </Link>
            </div>
          )}
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {stage === "intro" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Expédition · {plan.length} exercices</p>
          <h1 id="lesson-title">{lesson.titleFr}</h1>
          <p className={styles.objective}>{lesson.objectiveFr}</p>
          <div
            className={styles.glyph}
            lang="th"
            role="img"
            aria-label="Graphème thaï fictif de test"
          >
            {lesson.items[0]?.thaiRaw}
          </div>
          <div className={styles.actions}>
            {!onboardingCompleted ? (
              <Link className={buttonClass("primary")} href="/today">
                Préparer mon parcours
              </Link>
            ) : (
              <button
                className={buttonClass("primary")}
                type="button"
                aria-busy={isSaving}
                disabled={isSaving}
                onClick={beginExpedition}
              >
                {isSaving ? "Ouverture…" : "Commencer l’expédition"}
              </button>
            )}
            <button
              className={buttonClass("ghost")}
              type="button"
              onClick={playSignal}
            >
              Écouter le signal
            </button>
          </div>
          {audioError && (
            <p className={styles.inlineError} role="alert">
              Le signal audio est indisponible. Vous pouvez continuer.
            </p>
          )}
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {stage === "card" && currentExercise !== undefined && (
        <div className={styles.body}>
          <div className={styles.expeditionProgress}>
            <p className={styles.stepMark} aria-hidden="true">
              {currentStep}
              <small>{plan.length}</small>
            </p>
            <p className={styles.mechanicName}>
              {MECHANIC_LABELS[currentExercise.type]} · exercice {currentStep}{" "}
              sur {plan.length}
            </p>
            <div
              role="progressbar"
              aria-label="Progression de l’expédition"
              aria-valuemin={0}
              aria-valuemax={plan.length}
              aria-valuenow={results.length}
              aria-valuetext={`${results.length} exercice${results.length > 1 ? "s" : ""} sur ${plan.length}`}
            >
              <ExpeditionTrail total={plan.length} completed={results.length} />
            </div>
          </div>

          {celebration !== null ? (
            <div>
              <div className={styles.stampRow}>
                <div
                  className={
                    celebration.correct
                      ? styles.stamp + " " + styles.stampCorrect
                      : styles.stamp
                  }
                >
                  {celebration.correct ? "Juste" : "À revoir"}
                </div>
                {celebration.correct && (
                  <ToneCurve
                    tone="rising"
                    width={72}
                    height={38}
                    strokeWidth={7}
                    className={styles.stampCurve}
                  />
                )}
              </div>
              <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
                {celebration.feedback}
              </h1>
              {/* Toujours offert : l'auto-avance ne doit jamais être la
                  seule façon de continuer, ni précipiter la lecture. */}
              <div className={styles.actions}>
                <button
                  className={buttonClass("primary")}
                  type="button"
                  onClick={advance}
                >
                  Continuer
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
                {currentExercise.promptFr}
              </h1>

              {currentExercise.type === "audio_choice" && (
                <>
                  <button
                    className={styles.audioControl}
                    type="button"
                    onClick={playSignal}
                  >
                    <span aria-hidden="true">▶</span> Réécouter le signal
                  </button>
                  {audioError && (
                    <p className={styles.inlineError} role="alert">
                      Le signal audio est indisponible. Vous pouvez continuer.
                    </p>
                  )}
                  <fieldset className={styles.answerList}>
                    <legend className="srOnly">Options de réponse</legend>
                    {currentExercise.options.map((option) => (
                      <label
                        className={
                          selectedOptionId === option.id
                            ? styles.answer + " " + styles.answerSelected
                            : styles.answer
                        }
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={selectedOptionId === option.id}
                          disabled={isSaving}
                          onChange={() =>
                            persistListeningSelection(
                              currentExercise,
                              option.id,
                            )
                          }
                        />
                        <span>{option.labelFr}</span>
                        <BrandCurve
                          curve="underline"
                          width={200}
                          height={7}
                          strokeWidth={3.5}
                          className={styles.answerUnderline}
                        />
                      </label>
                    ))}
                  </fieldset>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitListening(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "association" && (
                <div className={styles.matchBoard}>
                  <div
                    className={styles.matchColumn}
                    role="group"
                    aria-label="Caractères thaïs"
                  >
                    {currentExercise.pairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          className={
                            matched
                              ? styles.matchTile + " " + styles.matchTileDone
                              : selectedPairId === pair.id
                                ? styles.matchTile +
                                  " " +
                                  styles.matchTileSelected
                                : styles.matchTile
                          }
                          // aria-disabled et non disabled : une tuile
                          // appariée reste atteignable au clavier, sinon le
                          // focus est éjecté à chaque paire trouvée.
                          aria-disabled={matched}
                          aria-pressed={!matched && selectedPairId === pair.id}
                          onClick={() => {
                            if (matched) return;
                            setSelectedPairId(pair.id);
                            setHint("");
                          }}
                        >
                          <span lang="th">
                            {itemsById.get(pair.itemId)?.thaiRaw}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className={styles.matchColumn}
                    role="group"
                    aria-label="Étiquettes françaises"
                  >
                    {sortedAssociationLabels(currentExercise).map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          className={
                            matched
                              ? styles.matchTile + " " + styles.matchTileDone
                              : styles.matchTile
                          }
                          aria-disabled={matched}
                          onClick={() => {
                            if (matched) return;
                            chooseMatch(currentExercise, pair.id);
                          }}
                        >
                          {pair.labelFr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentExercise.type === "word_order" && (
                <>
                  <div
                    className={styles.orderAnswer}
                    role="group"
                    aria-label="Votre réponse, dans l'ordre"
                  >
                    {orderedTokenIds.length === 0 ? (
                      <p className={styles.orderPlaceholder}>
                        Touchez les jetons pour construire votre réponse.
                      </p>
                    ) : (
                      orderedTokenIds.map((tokenId) => {
                        const token = currentExercise.tokens.find(
                          ({ id }) => id === tokenId,
                        );
                        return (
                          <button
                            key={tokenId}
                            ref={registerToken(tokenId)}
                            type="button"
                            className={styles.token}
                            aria-label={`Retirer ${token?.thaiRaw ?? ""} de la réponse`}
                            onClick={() => {
                              setOrderedTokenIds((current) =>
                                current.filter((id) => id !== tokenId),
                              );
                              setHint("");
                              // Le jeton change de zone : le focus le suit,
                              // sinon il retombe sur le document.
                              pendingTokenFocus.current = tokenId;
                            }}
                          >
                            <span lang="th">{token?.thaiRaw}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div
                    className={styles.tokenBank}
                    role="group"
                    aria-label="Jetons disponibles"
                  >
                    {shuffledTokens(currentExercise)
                      .filter(({ id }) => !orderedTokenIds.includes(id))
                      .map((token) => (
                        <button
                          key={token.id}
                          ref={registerToken(token.id)}
                          type="button"
                          className={styles.token}
                          aria-label={`Déplacer ${token.thaiRaw} dans la réponse`}
                          onClick={() => {
                            setOrderedTokenIds((current) => [
                              ...current,
                              token.id,
                            ]);
                            setHint("");
                            pendingTokenFocus.current = token.id;
                          }}
                        >
                          <span lang="th">{token.thaiRaw}</span>
                        </button>
                      ))}
                  </div>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitWordOrder(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "recall" && (
                <>
                  <label className={styles.recallField}>
                    <span>Votre réponse</span>
                    <input
                      type="text"
                      lang="th"
                      autoComplete="off"
                      spellCheck={false}
                      value={recallValue}
                      onChange={(event) => {
                        setRecallValue(event.target.value);
                        setHint("");
                      }}
                    />
                  </label>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitRecall(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {currentExercise.type === "reading" && (
                <>
                  {/* Exercice de lecture : le thaï doit être exposé tel
                      quel, pas remplacé par une étiquette française. */}
                  <p className={styles.glyph} lang="th">
                    {itemsById.get(currentExercise.itemId)?.thaiRaw}
                  </p>
                  <fieldset className={styles.answerList}>
                    <legend className="srOnly">Options de réponse</legend>
                    {currentExercise.options.map((option) => (
                      <label
                        className={
                          selectedOptionId === option.id
                            ? styles.answer + " " + styles.answerSelected
                            : styles.answer
                        }
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={selectedOptionId === option.id}
                          disabled={isSaving}
                          onChange={() => {
                            setSelectedOptionId(option.id);
                            setHint("");
                          }}
                        />
                        <span>{option.labelFr}</span>
                        <BrandCurve
                          curve="underline"
                          width={200}
                          height={7}
                          strokeWidth={3.5}
                          className={styles.answerUnderline}
                        />
                      </label>
                    ))}
                  </fieldset>
                  <button
                    className={buttonClass("primary") + " " + styles.submit}
                    type="button"
                    aria-busy={isSaving}
                    disabled={isSaving}
                    onClick={() => submitReading(currentExercise)}
                  >
                    {isSaving ? "Enregistrement…" : "Valider"}
                  </button>
                </>
              )}

              {hint && (
                <p className={styles.inlineError} role="alert">
                  {hint}
                </p>
              )}
              {errorMessage && (
                <p className={styles.inlineError} role="alert">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Pas de région live sur le récapitulatif : il prend le focus, et une
          région live imbriquée relirait toute la page. */}
      {stage === "recap" && (
        <div className={styles.body}>
          <p className={styles.eyebrow}>Expédition terminée</p>
          <h1 id="lesson-title" ref={cardHeading} tabIndex={-1}>
            La courbe de la séance est complète.
          </h1>
          <div className={styles.recapTrail}>
            <ExpeditionTrail total={plan.length} completed={plan.length} />
          </div>
          <ul className={styles.recapList}>
            {lesson.exercises.map((exercise) => {
              const result = results.find(
                ({ exerciseId }) => exerciseId === exercise.id,
              );
              return (
                <li
                  key={exercise.id}
                  className={
                    result?.rating === 1
                      ? styles.recapRow + " " + styles.recapRowCorrect
                      : styles.recapRow
                  }
                >
                  <span>{MECHANIC_LABELS[exercise.type]}</span>
                  <strong>{result?.rating === 1 ? "Juste" : "À revoir"}</strong>
                </li>
              );
            })}
          </ul>
          <div className={styles.masteryPanel}>
            <div>
              <span>Maîtrise estimée</span>
              <strong>{listeningProjection?.masteryScore ?? 0} ‰</strong>
            </div>
            <div>
              <span>Prochaine révision</span>
              <strong>
                {listeningProjection?.dueAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(listeningProjection.dueAt))
                  : "À calculer"}
              </strong>
            </div>
          </div>
          <LocalVoiceComparison
            modelAudioSrc="/audio/fixture-tone.wav"
            onBeforeCapture={stopSignal}
            sessionBoundaryRevision={sessionBoundaryRevision}
          />
          <p className={styles.note}>
            Cette démonstration technique reste isolée sur cet appareil. Les
            résultats des nouvelles mécaniques seront synchronisés dans une
            étape ultérieure.
          </p>
          <ContentReportPanel
            analytics={analytics}
            contentVersionId={lesson.versionId}
            exerciseId={plan[0] ?? lesson.versionId}
            online={online}
          />
          {errorMessage && (
            <p className={styles.inlineError} role="alert">
              {errorMessage}
            </p>
          )}
          <div className={styles.actions}>
            <button
              className={buttonClass("primary")}
              type="button"
              aria-busy={isSaving}
              disabled={isSaving}
              onClick={finishExpedition}
            >
              {isSaving ? "Clôture…" : "Terminer la séance"}
            </button>
            <Link className={buttonClass("ghost")} href="/account">
              Découvrir le compte
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
