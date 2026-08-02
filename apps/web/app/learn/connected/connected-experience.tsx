"use client";

import type { PublicAudioAsset } from "@thainaute/content/public";
import type {
  AttemptOutboxEntry,
  LessonExerciseProgress,
} from "@thainaute/sync";
import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { ContentReportPanel } from "../demo/content-report-panel";
import {
  enqueueConnectedWebAttempt,
  readLatestConnectedWebAttempt,
  synchronizeConnectedWebAttempt,
} from "@/lib/client/connected-learning";
import {
  loadCurrentConnectedPublicLesson,
  type ConnectedPublicLesson,
} from "@/lib/client/connected-public-lesson";
import { useWebAuthSession } from "@/lib/client/auth-session";
import { useWebAnalyticsConsent } from "@/lib/client/analytics-consent";
import { readWebLessonProgress } from "@/lib/client/lesson-progress";
import {
  loadVerifiedWebAudio,
  type VerifiedWebAudio,
} from "@/lib/client/public-audio-cache";

type Phase =
  | "loading"
  | "ready"
  | "submitting"
  | "pending"
  | "result"
  | "rejected"
  | "error";

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function matchingAudio(
  connected: ConnectedPublicLesson,
): PublicAudioAsset | null {
  const exercise = connected.lesson.response.lesson.exercises[0];
  if (exercise === undefined) return null;
  return (
    connected.lesson.response.lesson.audioAssets.find(
      ({ assetId }) => assetId === exercise.audioAssetId,
    ) ?? null
  );
}

function dueAtLabel(value: string | null): string {
  if (value === null) return "après la première correction";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ConnectedExperience() {
  const auth = useWebAuthSession();
  const { analytics } = useWebAnalyticsConsent();
  const userId =
    auth.status === "signed_in" ? (auth.session?.user.id ?? null) : null;
  const subjectKey = `${auth.sessionBoundaryRevision}:${userId ?? "signed-out"}`;
  const subjectKeyRef = useRef("");

  const [connected, setConnected] = useState<ConnectedPublicLesson | null>(
    null,
  );
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<AttemptOutboxEntry | null>(null);
  const [progress, setProgress] = useState<LessonExerciseProgress | null>(null);
  const [message, setMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [verifiedAudio, setVerifiedAudio] = useState<VerifiedWebAudio | null>(
    null,
  );
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const startedAt = useRef(0);
  const operationRevision = useRef(0);
  const audioOperationRevision = useRef(0);
  const syncInFlight = useRef(new Set<string>());
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const online = useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  );

  useLayoutEffect(() => {
    subjectKeyRef.current = subjectKey;
  }, [subjectKey]);

  const loadProgress = useCallback(
    async (expectedUserId: string, lesson: ConnectedPublicLesson) => {
      try {
        const response = await readWebLessonProgress({
          userId: expectedUserId,
          versionId: lesson.lesson.response.lesson.versionId,
        });
        const exerciseId = lesson.lesson.response.lesson.exercises[0]?.id;
        return (
          response.exercises.find(
            (exercise) => exercise.exerciseId === exerciseId,
          ) ?? null
        );
      } catch {
        return null;
      }
    },
    [],
  );

  const applyTerminalEntry = useCallback(
    async (
      entry: AttemptOutboxEntry,
      lesson: ConnectedPublicLesson,
      expectedUserId: string,
      expectedSubjectKey: string,
    ) => {
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setAttempt(entry);
      setSelectedOptionId(entry.submission.selectedOptionId);
      if (entry.status === "pending") {
        setPhase("pending");
        setMessage(
          "Réponse enregistrée sur cet appareil. La correction arrivera après reconnexion.",
        );
        return;
      }
      if (entry.status === "rejected") {
        setPhase("rejected");
        setMessage(
          "Le serveur a refusé cette tentative. Elle reste conservée pour diagnostic et ne produit aucune maîtrise.",
        );
        return;
      }

      setPhase("result");
      setMessage(
        entry.feedbackFr ??
          "Correction serveur enregistrée. Cette ancienne tentative locale ne contenait pas encore le détail explicatif.",
      );
      const nextProgress = await loadProgress(expectedUserId, lesson);
      if (subjectKeyRef.current !== expectedSubjectKey) return;
      setProgress(nextProgress);
      queueMicrotask(() => resultHeading.current?.focus());
    },
    [loadProgress],
  );

  const synchronize = useCallback(
    async (
      entry: AttemptOutboxEntry,
      lesson: ConnectedPublicLesson,
      expectedUserId: string,
      expectedSubjectKey: string,
    ) => {
      if (entry.status !== "pending") return;
      const synchronizationKey = `${expectedSubjectKey}:${entry.submission.eventId}`;
      if (subjectKeyRef.current === expectedSubjectKey) {
        setPhase("pending");
        setMessage("Réponse enregistrée. Correction par le serveur en cours…");
      }
      if (syncInFlight.current.has(synchronizationKey)) return;
      syncInFlight.current.add(synchronizationKey);
      try {
        const synchronized = await synchronizeConnectedWebAttempt({
          userId: expectedUserId,
          eventId: entry.submission.eventId,
        });
        await applyTerminalEntry(
          synchronized,
          lesson,
          expectedUserId,
          expectedSubjectKey,
        );
      } catch {
        if (subjectKeyRef.current !== expectedSubjectKey) return;
        setPhase("pending");
        setMessage(
          "Réponse enregistrée sur cet appareil. La correction sera reprise avec ce même événement.",
        );
      } finally {
        syncInFlight.current.delete(synchronizationKey);
      }
    },
    [applyTerminalEntry],
  );

  useEffect(() => {
    operationRevision.current += 1;
    audioOperationRevision.current += 1;
    const revision = operationRevision.current;
    const expectedSubjectKey = subjectKey;
    let active = true;
    verifiedAudio?.revoke();
    queueMicrotask(() => {
      if (!active) return;
      setConnected(null);
      setVerifiedAudio(null);
      setAudioMessage("");
      setAudioBusy(false);
      setSelectedOptionId(null);
      setAttempt(null);
      setProgress(null);
      setMessage("");
      setPhase("loading");
    });

    void (async () => {
      try {
        const lesson = await loadCurrentConnectedPublicLesson();
        if (
          !active ||
          revision !== operationRevision.current ||
          subjectKeyRef.current !== expectedSubjectKey
        ) {
          return;
        }
        setConnected(lesson);
        startedAt.current = Date.now();
        const exercise = lesson.lesson.response.lesson.exercises[0];
        if (exercise === undefined) throw new Error("empty");
        if (userId === null) {
          setPhase("ready");
          return;
        }
        const persisted = await readLatestConnectedWebAttempt({
          userId,
          contentVersionId: lesson.lesson.response.lesson.versionId,
          exerciseId: exercise.id,
        });
        if (
          !active ||
          revision !== operationRevision.current ||
          subjectKeyRef.current !== expectedSubjectKey
        ) {
          return;
        }
        if (persisted === null) {
          setPhase("ready");
          const initialProgress = await loadProgress(userId, lesson);
          if (
            !active ||
            revision !== operationRevision.current ||
            subjectKeyRef.current !== expectedSubjectKey
          ) {
            return;
          }
          setProgress(initialProgress);
          return;
        }
        await applyTerminalEntry(persisted, lesson, userId, expectedSubjectKey);
        if (persisted.status === "pending" && navigator.onLine) {
          await synchronize(persisted, lesson, userId, expectedSubjectKey);
        }
      } catch {
        if (!active || subjectKeyRef.current !== expectedSubjectKey) return;
        setPhase("error");
        setMessage(
          "La preview connectée n'est pas activée ou son contenu vérifié est indisponible.",
        );
      }
    })();

    return () => {
      active = false;
      operationRevision.current += 1;
      audioOperationRevision.current += 1;
    };
    // verifiedAudio est volontairement exclu : il ne doit pas relancer la leçon.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    applyTerminalEntry,
    loadProgress,
    retryToken,
    subjectKey,
    synchronize,
    userId,
  ]);

  useEffect(
    () => () => {
      verifiedAudio?.revoke();
    },
    [verifiedAudio],
  );

  const prepareAudio = useCallback(async () => {
    if (connected === null || audioBusy) return;
    const asset = matchingAudio(connected);
    if (asset === null) {
      setAudioMessage("Le signal annoncé est introuvable.");
      return;
    }
    setAudioBusy(true);
    setAudioMessage("");
    const expectedSubjectKey = subjectKeyRef.current;
    const audioRevision = ++audioOperationRevision.current;
    try {
      const next = await loadVerifiedWebAudio({
        url: connected.audioUrl(asset.assetId),
        asset,
      });
      if (
        audioRevision !== audioOperationRevision.current ||
        subjectKeyRef.current !== expectedSubjectKey
      ) {
        next.revoke();
        return;
      }
      setVerifiedAudio((previous) => {
        previous?.revoke();
        return next;
      });
      setAudioMessage("Signal vérifié et prêt à être écouté.");
    } catch {
      if (
        audioRevision !== audioOperationRevision.current ||
        subjectKeyRef.current !== expectedSubjectKey
      ) {
        return;
      }
      setAudioMessage(
        "Le signal n'a pas pu être vérifié. L'exercice reste bloqué par prudence.",
      );
    } finally {
      if (
        audioRevision === audioOperationRevision.current &&
        subjectKeyRef.current === expectedSubjectKey
      ) {
        setAudioBusy(false);
      }
    }
  }, [audioBusy, connected]);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const exercise = connected?.lesson.response.lesson.exercises[0];
      if (
        connected === null ||
        exercise === undefined ||
        userId === null ||
        selectedOptionId === null ||
        phase === "submitting" ||
        phase === "pending"
      ) {
        return;
      }
      const expectedSubjectKey = subjectKeyRef.current;
      setPhase("submitting");
      setMessage("Enregistrement durable de la réponse…");
      try {
        const durable = await enqueueConnectedWebAttempt({
          userId,
          contentVersionId: connected.lesson.response.lesson.versionId,
          exerciseId: exercise.id,
          selectedOptionId,
          durationMs: Date.now() - startedAt.current,
        });
        if (subjectKeyRef.current !== expectedSubjectKey) return;
        setAttempt(durable);
        setPhase("pending");
        if (online) {
          await synchronize(durable, connected, userId, expectedSubjectKey);
        } else {
          setMessage(
            "Réponse enregistrée sur cet appareil. Aucune correction locale n'est révélée hors ligne.",
          );
        }
      } catch {
        if (subjectKeyRef.current !== expectedSubjectKey) return;
        setPhase("error");
        setMessage(
          "La réponse n'a pas pu être conservée. Rien n'a été envoyé ni effacé.",
        );
      }
    },
    [connected, online, phase, selectedOptionId, synchronize, userId],
  );

  const retrySynchronization = useCallback(() => {
    if (
      connected === null ||
      attempt === null ||
      attempt.status !== "pending" ||
      userId === null
    ) {
      return;
    }
    void synchronize(attempt, connected, userId, subjectKeyRef.current);
  }, [attempt, connected, synchronize, userId]);

  useEffect(() => {
    if (
      !online ||
      connected === null ||
      attempt?.status !== "pending" ||
      userId === null
    ) {
      return;
    }
    void synchronize(attempt, connected, userId, subjectKeyRef.current);
  }, [attempt, connected, online, synchronize, userId]);

  if (phase === "loading" || auth.status === "loading") {
    return (
      <section className="connectedPanel" aria-busy="true" aria-live="polite">
        <p className="eyebrow">Contenu vérifié</p>
        <h1>Chargement de la boucle connectée…</h1>
      </section>
    );
  }

  if (connected === null) {
    return (
      <section className="connectedPanel" role="alert">
        <p className="eyebrow">Preview fermée par défaut</p>
        <h1>La boucle connectée n’est pas disponible ici.</h1>
        <p className="lede">{message}</p>
        <button
          className="button buttonGhost"
          type="button"
          onClick={() => setRetryToken((current) => current + 1)}
        >
          Réessayer
        </button>
      </section>
    );
  }

  const lesson = connected.lesson.response.lesson;
  const exercise = lesson.exercises[0];
  if (exercise === undefined) return null;
  const result = attempt?.status === "synced" ? attempt : null;

  return (
    <article className="connectedPanel">
      <div className="connectedBanner" role="note">
        Fixture technique locale · aucune valeur pédagogique · non publiable
      </div>
      <p className="eyebrow">
        Release {lesson.releaseVersion} · contenu gratuit
      </p>
      <h1>{lesson.titleFr}</h1>
      <p className="lede connectedLede">{lesson.objectiveFr}</p>

      <section
        className="connectedAudio"
        aria-labelledby="connected-audio-title"
      >
        <div>
          <h2 id="connected-audio-title">1. Vérifier le signal</h2>
          <p>
            Le fichier privé est contrôlé par taille et SHA-256 avant lecture.
          </p>
        </div>
        {verifiedAudio === null ? (
          <button
            className="button buttonGhost"
            type="button"
            aria-busy={audioBusy}
            disabled={audioBusy}
            onClick={() => void prepareAudio()}
          >
            {audioBusy ? "Vérification…" : "Préparer l’audio"}
          </button>
        ) : (
          <audio controls preload="metadata" src={verifiedAudio.objectUrl}>
            Votre navigateur ne permet pas la lecture audio.
          </audio>
        )}
        {audioMessage !== "" && <p role="status">{audioMessage}</p>}
      </section>

      <form className="connectedQuestion" onSubmit={submit}>
        <fieldset
          disabled={
            verifiedAudio === null ||
            phase === "submitting" ||
            phase === "pending"
          }
        >
          <legend>2. {exercise.promptFr}</legend>
          <div className="connectedOptions">
            {exercise.options.map((option) => (
              <label key={option.id}>
                <input
                  checked={selectedOptionId === option.id}
                  name="connected-answer"
                  type="radio"
                  value={option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                />
                <span>{option.labelFr}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {userId === null ? (
          <div className="connectedAccountGate">
            <p>
              Cette preview utilise une correction serveur et exige un compte
              permanent. La démo gratuite sans compte reste disponible.
            </p>
            <Link className="button buttonPrimary" href="/account">
              Me connecter
            </Link>
            <Link className="button buttonGhost" href="/learn/demo">
              Ouvrir la démo locale
            </Link>
          </div>
        ) : (
          <button
            className="button buttonPrimary connectedSubmit"
            type="submit"
            aria-busy={phase === "submitting"}
            disabled={
              selectedOptionId === null ||
              verifiedAudio === null ||
              phase === "submitting" ||
              phase === "pending"
            }
          >
            {phase === "submitting"
              ? "Conservation…"
              : phase === "pending"
                ? "Correction en attente"
                : "Valider ma réponse"}
          </button>
        )}
      </form>

      {message !== "" && (
        <section
          className={`connectedStatus connectedStatus-${phase}`}
          aria-live={phase === "result" ? "polite" : "assertive"}
        >
          {phase === "result" ? (
            <>
              <p className="eyebrow">
                {result?.rating === 1 ? "Réponse validée" : "À retravailler"}
              </p>
              <h2 ref={resultHeading} tabIndex={-1}>
                Correction autoritaire
              </h2>
            </>
          ) : null}
          <p>{message}</p>
          {phase === "pending" && online && (
            <button
              className="button buttonGhost"
              type="button"
              onClick={retrySynchronization}
            >
              Reprendre la correction
            </button>
          )}
        </section>
      )}

      {progress !== null && (
        <section className="connectedProgress" aria-labelledby="progress-title">
          <div>
            <p className="eyebrow">Projection serveur provisoire</p>
            <h2 id="progress-title">Maîtrise et prochaine révision</h2>
          </div>
          <dl>
            <div>
              <dt>Maîtrise technique</dt>
              <dd>{Math.round(progress.masteryPermille / 10)} %</dd>
            </div>
            <div>
              <dt>Tentatives</dt>
              <dd>{progress.attemptCount}</dd>
            </div>
            <div>
              <dt>État</dt>
              <dd>{progress.status}</dd>
            </div>
            <div>
              <dt>Prochaine révision</dt>
              <dd>{dueAtLabel(progress.dueAt)}</dd>
            </div>
          </dl>
        </section>
      )}

      <ContentReportPanel
        analytics={analytics}
        contentVersionId={lesson.versionId}
        exerciseId={exercise.id}
        online={online}
      />
    </article>
  );
}
