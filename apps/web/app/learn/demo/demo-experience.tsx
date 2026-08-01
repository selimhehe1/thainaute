"use client";

import { SRS_ALGORITHM_VERSION } from "@thainaute/domain";
import {
  attemptSubmissionSchema,
  createAttemptOutboxSnapshot,
  idempotencyKeySchema,
  ingestAttemptBatch,
  MAX_ATTEMPT_DURATION_MS,
  type AttemptOutboxSnapshot,
} from "@thainaute/sync";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  AttemptOutboxStorageError,
  WebAttemptOutboxStore,
} from "@/lib/client/attempt-outbox-store";

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

export function DemoExperience({ lesson }: { lesson: DemoLesson }) {
  const [store, setStore] = useState<WebAttemptOutboxStore | null>(null);
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
    const instance = new WebAttemptOutboxStore("thainaute-demo-v1");
    queueMicrotask(() => {
      if (!active) return;
      setStorageStatus("loading");
      setOutbox(createAttemptOutboxSnapshot());
    });
    queueMicrotask(() => {
      if (active) setStore(instance);
    });
    return () => {
      active = false;
      instance.close();
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
    if (store === null) return;
    let active = true;

    void migrateLegacyStorage(store)
      .then(() => store.read())
      .then((snapshot) => {
        if (!active) return;
        setOutbox(snapshot);
        setStorageStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStorageStatus("error");
      });

    return () => {
      active = false;
    };
  }, [store, storageRetryToken]);

  useEffect(() => {
    stopSignal();
    if (stage === "result") resultHeading.current?.focus();
  }, [stage, stopSignal]);

  const localIngestion = ingestAttemptBatch({
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
  const latestProjection = localIngestion.projections.find(
    ({ state }) => state.itemId === lesson.itemId,
  )?.state;

  function startExercise(event: ReactMouseEvent<HTMLButtonElement>) {
    stopSignal();
    setStartedAt(event.timeStamp);
    setStage("question");
  }

  function handleSubmitAnswer(event: ReactMouseEvent<HTMLButtonElement>): void {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSaving(true);

    const durationMs = Math.min(
      MAX_ATTEMPT_DURATION_MS,
      Math.max(0, Math.round(event.timeStamp - startedAt)),
    );
    const answeredAt = new Date().toISOString();
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

    if (store === null || storageStatus !== "ready") {
      setValidationMessage("Le journal local n’est pas encore disponible.");
      return;
    }

    let deviceId: string;
    try {
      deviceId = await store.getOrCreateDeviceId(() => crypto.randomUUID());
    } catch (error) {
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
    const result = ingestAttemptBatch({
      existingEvents: localIngestion.events,
      submissions: [submission],
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

    const acceptedId = result.acceptedEventIds[0];
    const accepted = result.events.find(
      ({ eventId }) => eventId === acceptedId,
    );
    if (accepted === undefined) {
      setValidationMessage("La tentative locale n’a pas pu être évaluée.");
      return;
    }

    try {
      setOutbox(await store.enqueue(submission));
    } catch (error) {
      setValidationMessage(
        error instanceof AttemptOutboxStorageError
          ? error.message
          : "La tentative n’a pas pu être conservée hors ligne.",
      );
      return;
    }
    setLatestRating(accepted.rating);
    setValidationMessage("");
    stopSignal();
    setStage("result");
  }

  const wasCorrect = latestRating === 1;
  const pendingAttempts = outbox.entries.filter(
    ({ status }) => status === "pending",
  ).length;

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
              : "Hors ligne · la tentative restera sur cet appareil"}
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
            ) : (
              <button
                className="button buttonPrimary"
                type="button"
                disabled={storageStatus !== "ready"}
                onClick={startExercise}
              >
                Commencer
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
                  onChange={() => {
                    setSelectedOptionId(option.id);
                    setValidationMessage("");
                  }}
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
          <button
            className="button buttonPrimary submitAnswer"
            type="button"
            aria-busy={isSaving}
            disabled={isSaving}
            onClick={handleSubmitAnswer}
          >
            {isSaving ? "Enregistrement…" : "Valider"}
          </button>
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
          />
          <p className="privacyNote">
            Cette démonstration technique reste isolée sur cet appareil et ne
            sera jamais synchronisée comme contenu pédagogique.
          </p>
          <div className="lessonActions">
            <Link className="button buttonPrimary" href="/account">
              Découvrir le compte
            </Link>
            <Link className="button buttonGhost" href="/">
              Continuer sans compte
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
