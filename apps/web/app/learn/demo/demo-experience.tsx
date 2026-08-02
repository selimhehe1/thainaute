"use client";

import { noOpAnalytics, type AnalyticsSink } from "@thainaute/analytics";
import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  confirmLocalLessonResult,
  createAttemptOutboxSnapshot,
  finishLocalLesson,
  idempotencyKeySchema,
  ingestAttemptBatch,
  MAX_ATTEMPT_DURATION_MS,
  openLocalLessonQuestion,
  prepareLocalLessonSubmission,
  selectLocalLessonOption,
  startLocalLesson,
  type AttemptOutboxSnapshot,
  type LocalExperienceSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
} from "@/lib/client/attempt-outbox-store";
import { useWebAuthSession } from "@/lib/client/auth-session";
import {
  LocalExperienceStorageError,
  WebLocalExperienceStore,
} from "@/lib/client/local-experience-store";

import { LocalVoiceComparison } from "./local-voice-comparison";

interface DemoLesson {
  versionId: string;
  title: string;
  objective: string;
  itemId: string;
  thaiRaw: string;
  exercise: {
    id: string;
    prompt: string;
    options: readonly { id: string; labelFr: string }[];
    correctOptionId: string;
    feedback: { correctFr: string; incorrectFr: string };
  };
}

type Stage = "intro" | "question" | "result";
const journalKey = "thainaute.fixture.attempts.v1";
const deviceKey = "thainaute.fixture.device.v1";

function captureSafely(
  analytics: AnalyticsSink,
  event: Parameters<AnalyticsSink["capture"]>[0],
): void {
  try {
    analytics.capture(event);
  } catch {
    // La mesure optionnelle ne bloque jamais la leçon locale.
  }
}

function durationBucket(
  durationMs: number,
): "under_10s" | "10_to_30s" | "over_30s" {
  if (durationMs < 10_000) return "under_10s";
  return durationMs <= 30_000 ? "10_to_30s" : "over_30s";
}

function checkpointMatchesLesson(
  snapshot: LocalExperienceSnapshot,
  lesson: DemoLesson,
): boolean {
  return (
    snapshot.lesson !== null &&
    snapshot.lesson.lessonVersionId === lesson.versionId &&
    snapshot.lesson.exerciseId === lesson.exercise.id
  );
}

function submissionsAreEqual(
  left: ValidatedAttemptSubmission,
  right: ValidatedAttemptSubmission,
): boolean {
  return (
    left.eventId === right.eventId &&
    left.deviceId === right.deviceId &&
    left.exerciseId === right.exerciseId &&
    left.selectedOptionId === right.selectedOptionId &&
    left.answeredAt === right.answeredAt &&
    left.durationMs === right.durationMs &&
    left.contentVersionId === right.contentVersionId &&
    left.algorithmVersion === right.algorithmVersion
  );
}

function ingestDemoOutbox(outbox: AttemptOutboxSnapshot, lesson: DemoLesson) {
  return ingestAttemptBatch({
    existingEvents: [],
    submissions: outbox.entries
      .filter(({ status }) => status !== "rejected")
      .map(({ submission }) => submission),
    answerKeys: [
      {
        exerciseId: lesson.exercise.id,
        itemId: lesson.itemId,
        correctOptionId: lesson.exercise.correctOptionId,
        skill: "listening",
        contentVersionId: lesson.versionId,
      },
    ],
    authenticatedUserId: null,
  });
}

function readLegacySubmissions(): unknown[] {
  const serialized = window.localStorage.getItem(journalKey);
  if (serialized === null) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed))
      throw new Error("Le journal n'est pas un tableau.");
    return parsed;
  } catch (error) {
    throw new AttemptOutboxStorageError(
      "L'ancien journal local est illisible et a été conservé.",
      { cause: error },
    );
  }
}

async function migrateLegacyStorage(
  store: WebAttemptOutboxStore,
): Promise<void> {
  const legacyDeviceId = idempotencyKeySchema.safeParse(
    window.localStorage.getItem(deviceKey),
  );
  await store.getOrCreateDeviceId(() =>
    legacyDeviceId.success ? legacyDeviceId.data : crypto.randomUUID(),
  );

  const submissions = readLegacySubmissions().map((candidate) => {
    if (typeof candidate !== "object" || candidate === null) {
      throw new AttemptOutboxStorageError(
        "L'ancien journal local contient une entrée invalide.",
      );
    }
    const legacy = candidate as Record<string, unknown>;
    const submission = attemptSubmissionSchema.safeParse({
      eventId: legacy.eventId,
      deviceId: legacy.deviceId,
      exerciseId: legacy.exerciseId,
      selectedOptionId: legacy.selectedOptionId,
      answeredAt: legacy.answeredAt,
      durationMs: legacy.durationMs,
      contentVersionId: legacy.contentVersionId,
      algorithmVersion: legacy.algorithmVersion,
    });
    if (!submission.success) {
      throw new AttemptOutboxStorageError(
        "L'ancien journal local contient une entrée invalide.",
      );
    }
    return submission.data;
  });

  await store.enqueueMany(submissions);

  window.localStorage.removeItem(deviceKey);
  window.localStorage.removeItem(journalKey);
}

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function DemoExperience({
  lesson,
  analytics = noOpAnalytics,
}: {
  lesson: DemoLesson;
  analytics?: AnalyticsSink;
}) {
  const { sessionBoundaryRevision } = useWebAuthSession();
  const [store, setStore] = useState<WebAttemptOutboxStore | null>(null);
  const [experienceStore, setExperienceStore] =
    useState<WebLocalExperienceStore | null>(null);
  const [experienceSnapshot, setExperienceSnapshot] =
    useState<LocalExperienceSnapshot | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [outbox, setOutbox] = useState<AttemptOutboxSnapshot>(() =>
    createAttemptOutboxSnapshot(),
  );
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [storageRetryToken, setStorageRetryToken] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [latestRating, setLatestRating] = useState<0 | 1 | null>(null);
  const [checkpointMessage, setCheckpointMessage] = useState("");
  const submissionInFlight = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const lessonAudio = useRef<HTMLAudioElement | null>(null);
  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
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
      setExperienceSnapshot(null);
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

    async function hydrateLocalSession(): Promise<void> {
      await migrateLegacyStorage(activeOutboxStore);
      let nextOutbox = await activeOutboxStore.read();
      let nextExperience = await activeExperienceStore.read();

      if (nextExperience.onboarding.status === "completed") {
        if (
          nextExperience.lesson !== null &&
          !checkpointMatchesLesson(nextExperience, lesson) &&
          nextExperience.lesson.phase !== "completed"
        ) {
          throw new LocalExperienceStorageError(
            "Une autre session locale doit être terminée avant celle-ci.",
          );
        }

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
      }

      const checkpoint = nextExperience.lesson;
      let resumedStage: Stage = "intro";
      let resumedOptionId: string | null = null;
      let resumedStartedAt = 0;
      let resumedRating: 0 | 1 | null = null;

      if (
        checkpoint !== null &&
        checkpointMatchesLesson(nextExperience, lesson)
      ) {
        if (checkpoint.phase === "question") {
          resumedStage = "question";
          resumedOptionId = checkpoint.selectedOptionId;
          resumedStartedAt = Date.parse(checkpoint.sessionStartedAt);
        } else if (
          checkpoint.phase === "result" ||
          checkpoint.phase === "completed"
        ) {
          const durableEntry = nextOutbox.entries.find(
            ({ submission }) =>
              submission.eventId === checkpoint.submission.eventId,
          );
          if (
            durableEntry === undefined ||
            durableEntry.status === "rejected" ||
            !submissionsAreEqual(durableEntry.submission, checkpoint.submission)
          ) {
            throw new LocalExperienceStorageError(
              "Le résultat local ne correspond plus au journal durable.",
            );
          }
          const evaluated = ingestDemoOutbox(nextOutbox, lesson).events.find(
            ({ eventId }) => eventId === checkpoint.submission.eventId,
          );
          if (evaluated === undefined) {
            throw new LocalExperienceStorageError(
              "Le résultat local ne peut pas être reconstruit.",
            );
          }
          resumedStage = "result";
          resumedOptionId = checkpoint.submission.selectedOptionId;
          resumedStartedAt = Date.parse(checkpoint.sessionStartedAt);
          resumedRating = evaluated.rating;
        } else if (checkpoint.phase === "submitting") {
          throw new LocalExperienceStorageError(
            "La tentative locale n’a pas pu être finalisée.",
          );
        }
      }

      if (!active) return;
      setOutbox(nextOutbox);
      setExperienceSnapshot(nextExperience);
      setStage(resumedStage);
      setSelectedOptionId(resumedOptionId);
      setStartedAt(resumedStartedAt);
      setLatestRating(resumedRating);
      setValidationMessage("");
      setCheckpointMessage("");
      setStorageStatus("ready");
    }

    void hydrateLocalSession().catch(() => {
      if (!active) return;
      setStorageStatus("error");
    });

    return () => {
      active = false;
    };
  }, [experienceStore, lesson, storageRetryToken, store]);

  useEffect(() => {
    if (
      stage !== "result" ||
      experienceStore === null ||
      experienceSnapshot?.lesson?.phase !== "result"
    ) {
      return;
    }
    let active = true;
    const durableOutbox = outbox;

    void experienceStore
      .update((current) =>
        finishLocalLesson(current, durableOutbox, new Date().toISOString()),
      )
      .then((completed) => {
        if (!active) return;
        setExperienceSnapshot(completed);
        captureSafely(analytics, {
          name: "lesson_completed",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      })
      .catch(() => {
        if (!active) return;
        setCheckpointMessage(
          "Le résultat reste visible, mais sa clôture locale doit être réessayée.",
        );
      });

    return () => {
      active = false;
    };
  }, [
    analytics,
    experienceSnapshot,
    experienceStore,
    lesson.versionId,
    outbox,
    stage,
  ]);

  useEffect(() => {
    stopSignal();
    if (stage === "result") resultHeading.current?.focus();
  }, [stage, stopSignal]);

  const localIngestion = ingestDemoOutbox(outbox, lesson);
  const latestProjection = localIngestion.projections.find(
    ({ state }) => state.itemId === lesson.itemId,
  )?.state;

  function startExercise(): void {
    if (experienceStore === null || storageStatus !== "ready") return;
    stopSignal();
    setIsSaving(true);
    setCheckpointMessage("");
    const openedAt = new Date().toISOString();
    void experienceStore
      .update((current) => {
        let activeSession = current;
        if (
          current.lesson === null ||
          (!checkpointMatchesLesson(current, lesson) &&
            current.lesson.phase === "completed")
        ) {
          activeSession = startLocalLesson(current, {
            lessonVersionId: lesson.versionId,
            exerciseId: lesson.exercise.id,
            startedAt: openedAt,
          });
        }
        if (!checkpointMatchesLesson(activeSession, lesson)) {
          throw new LocalExperienceStorageError(
            "Une autre session locale doit être terminée avant celle-ci.",
          );
        }
        return openLocalLessonQuestion(activeSession, openedAt);
      })
      .then((next) => {
        setExperienceSnapshot(next);
        setStartedAt(
          next.lesson === null
            ? Date.parse(openedAt)
            : Date.parse(next.lesson.sessionStartedAt),
        );
        setStage("question");
        captureSafely(analytics, {
          name: "lesson_started",
          lessonVersionId: lesson.versionId,
          platform: "web",
        });
      })
      .catch((error) => {
        setCheckpointMessage(
          error instanceof LocalExperienceStorageError
            ? error.message
            : "La session n’a pas pu être ouverte localement.",
        );
      })
      .finally(() => setIsSaving(false));
  }

  function selectOption(optionId: string): void {
    setSelectedOptionId(optionId);
    setValidationMessage("");
    setCheckpointMessage("");
    if (experienceStore === null || storageStatus !== "ready") return;

    const selectedAt = new Date().toISOString();
    void experienceStore
      .update((current) =>
        selectLocalLessonOption(current, optionId, selectedAt),
      )
      .then(setExperienceSnapshot)
      .catch((error) => {
        setCheckpointMessage(
          error instanceof LocalExperienceStorageError
            ? error.message
            : "Le choix reste affiché, mais n’a pas pu être conservé.",
        );
      });
  }

  function handleSubmitAnswer(): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);

    const answeredAt = new Date().toISOString();
    const answeredAtMs = Date.parse(answeredAt);
    const durationMs = Math.min(
      MAX_ATTEMPT_DURATION_MS,
      Math.max(0, Math.round(answeredAtMs - startedAt)),
    );
    void persistAnswer(answeredAt, durationMs).finally(() => {
      submissionInFlight.current = false;
      setIsSaving(false);
    });
  }

  async function persistAnswer(
    answeredAt: string,
    durationMs: number,
  ): Promise<void> {
    if (selectedOptionId === null) {
      setValidationMessage("Choisissez une option avant de valider.");
      return;
    }

    if (
      store === null ||
      experienceStore === null ||
      storageStatus !== "ready"
    ) {
      setValidationMessage("Le journal local n’est pas encore disponible.");
      return;
    }

    let deviceId: string;
    try {
      deviceId = await store.getOrCreateDeviceId(() => crypto.randomUUID());
    } catch (error) {
      setStorageStatus("error");
      setValidationMessage(
        error instanceof AttemptOutboxStorageError
          ? error.message
          : "Le journal local est indisponible.",
      );
      return;
    }

    const submission = attemptSubmissionSchema.parse({
      eventId: crypto.randomUUID(),
      deviceId,
      exerciseId: lesson.exercise.id,
      selectedOptionId,
      answeredAt,
      durationMs,
      contentVersionId: lesson.versionId,
      algorithmVersion: SRS_ALGORITHM_VERSION,
    });
    let nextOutbox: AttemptOutboxSnapshot;
    let confirmedExperience: LocalExperienceSnapshot;
    try {
      const prepared = await experienceStore.update((current) => {
        const withSelection = selectLocalLessonOption(
          current,
          selectedOptionId,
          answeredAt,
        );
        return prepareLocalLessonSubmission(
          withSelection,
          submission,
          answeredAt,
        );
      });
      if (prepared.lesson?.phase !== "submitting") {
        throw new LocalExperienceStorageError(
          "La tentative locale n’a pas été réservée.",
        );
      }
      nextOutbox = await store.enqueue(prepared.lesson.submission);
      const durableOutbox = nextOutbox;
      confirmedExperience = await experienceStore.update((current) =>
        confirmLocalLessonResult(
          current,
          durableOutbox,
          new Date().toISOString(),
        ),
      );
      if (
        confirmedExperience.lesson?.phase !== "result" &&
        confirmedExperience.lesson?.phase !== "completed"
      ) {
        throw new LocalExperienceStorageError(
          "La tentative durable n’a pas pu être confirmée.",
        );
      }
    } catch (error) {
      setStorageStatus("error");
      setValidationMessage(
        error instanceof AttemptOutboxStorageError ||
          error instanceof LocalExperienceStorageError
          ? error.message
          : "La tentative n’a pas pu être conservée hors ligne.",
      );
      return;
    }

    const result = ingestDemoOutbox(nextOutbox, lesson);
    const accepted = result.events.find(
      ({ eventId }) => eventId === submission.eventId,
    );
    if (accepted === undefined) {
      setValidationMessage("La tentative locale n’a pas pu être évaluée.");
      return;
    }

    setOutbox(nextOutbox);
    setExperienceSnapshot(confirmedExperience);
    setLatestRating(accepted.rating);
    setValidationMessage("");
    setCheckpointMessage("");
    stopSignal();
    setStage("result");
    captureSafely(analytics, {
      name: "exercise_answered",
      lessonVersionId: lesson.versionId,
      exerciseType: "audio_choice",
      correct: accepted.rating === 1,
      durationBucket: durationBucket(durationMs),
      platform: "web",
    });
  }

  const wasCorrect = latestRating === 1;
  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;
  const onboardingCompleted =
    experienceSnapshot?.onboarding.status === "completed";

  return (
    <section className="lessonCard" aria-labelledby="lesson-title">
      <div className="fixtureBanner" role="note">
        <strong>Donnée fictive — non publiable</strong>
        <span>
          Ce graphème et ce signal valident uniquement la chaîne technique.
        </span>
      </div>

      <div className="networkStatus" aria-live="polite">
        <span
          className={online ? "statusDot online" : "statusDot"}
          aria-hidden="true"
        />
        {storageStatus === "loading"
          ? "Préparation du journal local…"
          : storageStatus === "error"
            ? "Journal local indisponible"
            : online
              ? `Journal local prêt · ${pendingAttempts} conservée${pendingAttempts > 1 ? "s" : ""}`
              : "Hors ligne · la fixture continue avec les ressources déjà chargées"}
      </div>

      {stage === "intro" && (
        <div className="lessonBody">
          <p className="eyebrow">Étape 1 sur 1</p>
          <h1 id="lesson-title">{lesson.title}</h1>
          <p className="lessonObjective">{lesson.objective}</p>
          <div
            className="lessonGlyph"
            lang="th"
            aria-label="Graphème thaï fictif de test"
          >
            {lesson.thaiRaw}
          </div>
          <div className="lessonActions">
            {storageStatus === "error" ? (
              <button
                className="button buttonPrimary"
                type="button"
                onClick={() => {
                  setStorageStatus("loading");
                  setStorageRetryToken((current) => current + 1);
                }}
              >
                Réessayer le stockage
              </button>
            ) : !onboardingCompleted && storageStatus === "ready" ? (
              <Link className="button buttonPrimary" href="/today">
                Préparer mon parcours
              </Link>
            ) : (
              <button
                className="button buttonPrimary"
                type="button"
                aria-busy={isSaving}
                disabled={storageStatus !== "ready" || isSaving}
                onClick={startExercise}
              >
                {isSaving ? "Ouverture…" : "Commencer"}
              </button>
            )}
            <button
              className="button buttonGhost"
              type="button"
              onClick={playSignal}
            >
              Écouter le signal
            </button>
          </div>
          {audioError && (
            <p className="inlineError" role="alert">
              Le signal audio est indisponible. Vous pouvez continuer.
            </p>
          )}
          {checkpointMessage && (
            <p className="inlineError" role="alert">
              {checkpointMessage}
            </p>
          )}
        </div>
      )}

      {stage === "question" && (
        <div className="lessonBody">
          <p className="eyebrow">Écoute · donnée technique</p>
          <h1 id="lesson-title">{lesson.exercise.prompt}</h1>
          <button className="audioControl" type="button" onClick={playSignal}>
            <span aria-hidden="true">▶</span> Réécouter le signal
          </button>
          <fieldset className="answerList">
            <legend className="srOnly">Options de réponse</legend>
            {lesson.exercise.options.map((option) => (
              <label
                className={
                  selectedOptionId === option.id ? "answer selected" : "answer"
                }
                key={option.id}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => selectOption(option.id)}
                />
                <span>{option.labelFr}</span>
              </label>
            ))}
          </fieldset>
          {validationMessage && (
            <p className="inlineError" role="alert">
              {validationMessage}
            </p>
          )}
          {checkpointMessage && (
            <p className="inlineError" role="alert">
              {checkpointMessage}
            </p>
          )}
          {storageStatus === "error" ? (
            <button
              className="button buttonPrimary submitAnswer"
              type="button"
              onClick={() => {
                setStorageStatus("loading");
                setStorageRetryToken((current) => current + 1);
              }}
            >
              Réessayer le stockage
            </button>
          ) : (
            <button
              className="button buttonPrimary submitAnswer"
              type="button"
              aria-busy={isSaving}
              disabled={isSaving || storageStatus !== "ready"}
              onClick={handleSubmitAnswer}
            >
              {isSaving ? "Enregistrement…" : "Valider"}
            </button>
          )}
        </div>
      )}

      {stage === "result" && (
        <div className="lessonBody resultBody" aria-live="polite">
          <p className="eyebrow">Tentative enregistrée localement</p>
          <h1 id="lesson-title" ref={resultHeading} tabIndex={-1}>
            {wasCorrect
              ? lesson.exercise.feedback.correctFr
              : lesson.exercise.feedback.incorrectFr}
          </h1>
          <div className="masteryPanel">
            <div>
              <span>Maîtrise estimée</span>
              <strong>{latestProjection?.masteryScore ?? 0} ‰</strong>
            </div>
            <div>
              <span>Prochaine révision</span>
              <strong>
                {latestProjection?.dueAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(latestProjection.dueAt))
                  : "À calculer"}
              </strong>
            </div>
          </div>
          <LocalVoiceComparison
            modelAudioSrc="/audio/fixture-tone.wav"
            onBeforeCapture={stopSignal}
            sessionBoundaryRevision={sessionBoundaryRevision}
          />
          <p className="privacyNote">
            Cette démonstration technique reste isolée sur cet appareil et ne
            sera jamais synchronisée comme contenu pédagogique.
          </p>
          {checkpointMessage && (
            <p className="inlineError" role="alert">
              {checkpointMessage}
            </p>
          )}
          <div className="lessonActions">
            <Link className="button buttonPrimary" href="/account">
              Découvrir le compte
            </Link>
            <Link className="button buttonGhost" href="/today">
              Retour à Aujourd’hui
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
