"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buttonClass } from "@/components/ui/button";
import lessonStyles from "./lesson.module.css";

import {
  createBrowserLocalVoiceRecorder,
  type ActiveLocalVoiceRecording,
  type LocalVoiceCapture,
  type LocalVoiceRecorder,
  LocalVoiceRecorderError,
  MAX_LOCAL_VOICE_DURATION_MS,
} from "@/lib/client/local-voice-recorder";

type CapturePhase =
  | "idle"
  | "requesting_permission"
  | "recorded"
  | "recording"
  | "stopping"
  | "error";
type LocalVoiceCaptureMetadata = Pick<
  LocalVoiceCapture,
  "durationMs" | "stoppedByLimit"
>;

const MAX_DURATION_SECONDS = MAX_LOCAL_VOICE_DURATION_MS / 1_000;

function safeRecorderMessage(error: unknown): string {
  if (!(error instanceof LocalVoiceRecorderError)) {
    return "La prise n’a pas pu être créée. Vous pouvez réessayer.";
  }

  switch (error.code) {
    case "permission_blocked":
      return "L’accès au microphone est bloqué par la sécurité du navigateur ou de la page. Vérifiez les autorisations du site, puis réessayez.";
    case "permission_denied":
      return "L’accès au microphone a été refusé. Autorisez-le dans les réglages du navigateur, puis réessayez.";
    case "permission_timeout":
      return "La demande d’accès au microphone a expiré. Vérifiez l’invite du navigateur, puis réessayez.";
    case "device_unavailable":
      return "Le microphone est indisponible ou déjà utilisé par une autre application.";
    case "interrupted":
      return "La prise a été interrompue et supprimée. Vous pouvez recommencer.";
    case "empty_recording":
      return "Aucun son exploitable n’a été enregistré. La prise vide a été supprimée.";
    case "unsupported":
      return "Ce navigateur ne permet pas encore cet enregistrement local.";
    case "cancelled":
      return "";
    case "unknown":
      return "La prise n’a pas pu être finalisée et a été supprimée.";
  }
}

export function LocalVoiceComparison({
  modelAudioSrc,
  onBeforeCapture,
  recorder,
  sessionBoundaryRevision,
}: {
  readonly modelAudioSrc: string;
  readonly onBeforeCapture?: () => void;
  readonly recorder?: LocalVoiceRecorder;
  readonly sessionBoundaryRevision: number;
}) {
  const localRecorder = useMemo(
    () => recorder ?? createBrowserLocalVoiceRecorder(),
    [recorder],
  );
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [capture, setCapture] = useState<LocalVoiceCaptureMetadata | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [remainingSeconds, setRemainingSeconds] =
    useState(MAX_DURATION_SECONDS);
  const activeRecording = useRef<ActiveLocalVoiceRecording | null>(null);
  const permissionRequest = useRef<AbortController | null>(null);
  const recordingUrl = useRef<string | null>(null);
  const modelAudio = useRef<HTMLAudioElement | null>(null);
  const recordedAudio = useRef<HTMLAudioElement | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);
  const operationId = useRef(0);
  const captureBlocksPlayback = useRef(false);
  const lastSessionBoundaryRevision = useRef(sessionBoundaryRevision);

  const stopCountdown = useCallback((): void => {
    if (countdownTimer.current !== null) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  const stopPlaybacks = useCallback((): void => {
    modelAudio.current?.pause();
    recordedAudio.current?.pause();
  }, []);

  const bindRecordedAudio = useCallback(
    (audio: HTMLAudioElement | null): void => {
      recordedAudio.current = audio;
      const url = recordingUrl.current;
      if (audio !== null && url !== null) audio.src = url;
    },
    [],
  );

  const revokeRecordingUrl = useCallback((): void => {
    const url = recordingUrl.current;
    recordingUrl.current = null;
    const audio = recordedAudio.current;
    if (audio !== null) {
      audio.removeAttribute("src");
      audio.load();
    }
    if (url !== null) URL.revokeObjectURL(url);
  }, []);

  function removeCapture(): void {
    stopPlaybacks();
    revokeRecordingUrl();
    setCapture(null);
  }

  const releaseVoiceResources = useCallback((): void => {
    operationId.current += 1;
    captureBlocksPlayback.current = false;

    const controller = permissionRequest.current;
    permissionRequest.current = null;
    controller?.abort();

    const active = activeRecording.current;
    activeRecording.current = null;
    active?.cancel();

    stopCountdown();
    stopPlaybacks();
    revokeRecordingUrl();
  }, [revokeRecordingUrl, stopCountdown, stopPlaybacks]);

  const resetVoiceUi = useCallback(
    (nextMessage = ""): void => {
      releaseVoiceResources();
      setCapture(null);
      setRemainingSeconds(MAX_DURATION_SECONDS);
      setPhase("idle");
      setPlaybackError("");
      setMessage(nextMessage);
    },
    [releaseVoiceResources],
  );

  useEffect(() => {
    mounted.current = true;

    const interruptIfHidden = () => {
      if (document.visibilityState === "hidden") {
        stopPlaybacks();
        const active = activeRecording.current;
        if (active === null) permissionRequest.current?.abort();
        else active.interrupt();
      }
    };
    const cancelOnPageExit = () => {
      resetVoiceUi();
    };
    document.addEventListener("visibilitychange", interruptIfHidden);
    window.addEventListener("pagehide", cancelOnPageExit);

    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", interruptIfHidden);
      window.removeEventListener("pagehide", cancelOnPageExit);
      releaseVoiceResources();
    };
  }, [releaseVoiceResources, resetVoiceUi, stopPlaybacks]);

  useEffect(() => {
    if (lastSessionBoundaryRevision.current === sessionBoundaryRevision) return;
    lastSessionBoundaryRevision.current = sessionBoundaryRevision;
    const hadLocalVoiceActivity =
      permissionRequest.current !== null ||
      activeRecording.current !== null ||
      recordingUrl.current !== null ||
      capture !== null;
    resetVoiceUi(
      hadLocalVoiceActivity
        ? "La session a changé : la prise locale a été supprimée de cet onglet."
        : "",
    );
  }, [capture, resetVoiceUi, sessionBoundaryRevision]);

  function startCountdown(startedAt: number): void {
    stopCountdown();
    setRemainingSeconds(MAX_DURATION_SECONDS);
    countdownTimer.current = setInterval(() => {
      const elapsedMs = Math.max(0, performance.now() - startedAt);
      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil((MAX_LOCAL_VOICE_DURATION_MS - elapsedMs) / 1_000),
        ),
      );
    }, 250);
  }

  function observeCompletion(
    active: ActiveLocalVoiceRecording,
    currentOperationId: number,
  ): void {
    void active.completion
      .then((nextCapture) => {
        if (
          !mounted.current ||
          activeRecording.current !== active ||
          operationId.current !== currentOperationId
        ) {
          return;
        }
        const url = URL.createObjectURL(nextCapture.blob);
        recordingUrl.current = url;
        setCapture({
          durationMs: nextCapture.durationMs,
          stoppedByLimit: nextCapture.stoppedByLimit,
        });
        setPhase("recorded");
        setMessage(
          nextCapture.stoppedByLimit
            ? "Prise terminée automatiquement à vingt secondes."
            : "Prise prête pour la comparaison.",
        );
      })
      .catch((error: unknown) => {
        if (
          !mounted.current ||
          activeRecording.current !== active ||
          operationId.current !== currentOperationId
        ) {
          return;
        }
        const nextMessage = safeRecorderMessage(error);
        setPhase(nextMessage === "" ? "idle" : "error");
        setMessage(nextMessage);
      })
      .finally(() => {
        if (activeRecording.current === active) {
          activeRecording.current = null;
        }
        if (operationId.current === currentOperationId) {
          captureBlocksPlayback.current = false;
          permissionRequest.current = null;
          stopCountdown();
        }
      });
  }

  async function beginRecording(): Promise<void> {
    if (
      phase === "requesting_permission" ||
      phase === "recording" ||
      permissionRequest.current !== null ||
      activeRecording.current !== null
    ) {
      return;
    }

    const currentOperationId = operationId.current + 1;
    operationId.current = currentOperationId;
    captureBlocksPlayback.current = true;
    onBeforeCapture?.();
    removeCapture();
    setMessage("");
    setPlaybackError("");
    setPhase("requesting_permission");
    const controller = new AbortController();
    permissionRequest.current = controller;

    try {
      const active = await localRecorder.start({ signal: controller.signal });
      if (
        !mounted.current ||
        operationId.current !== currentOperationId ||
        controller.signal.aborted
      ) {
        active.cancel();
        return;
      }
      activeRecording.current = active;
      setPhase("recording");
      setMessage(
        "Enregistrement en cours. La prise s’arrêtera automatiquement à vingt secondes.",
      );
      startCountdown(active.startedAt);
      observeCompletion(active, currentOperationId);
    } catch (error) {
      if (!mounted.current || operationId.current !== currentOperationId)
        return;
      const nextMessage = safeRecorderMessage(error);
      captureBlocksPlayback.current = false;
      setPhase(nextMessage === "" ? "idle" : "error");
      setMessage(nextMessage);
      permissionRequest.current = null;
    }
  }

  function stopRecording(): void {
    const active = activeRecording.current;
    if (active === null) return;
    captureBlocksPlayback.current = true;
    setPhase("stopping");
    setMessage("Finalisation locale de la prise…");
    void active.stop().catch(() => undefined);
  }

  function deleteRecording(): void {
    if (capture === null) return;
    resetVoiceUi("Prise locale supprimée de cet onglet.");
  }

  const isRequesting = phase === "requesting_permission";
  const isRecording = phase === "recording";
  const isStopping = phase === "stopping";
  const isCaptureBusy = isRequesting || isRecording || isStopping;

  let recordButtonLabel = "Refaire ma prise";
  if (capture === null) recordButtonLabel = "M’enregistrer";
  if (isRequesting) {
    recordButtonLabel = "Autorisation du microphone…";
  }

  let captureAction: ReactNode;
  if (isRecording) {
    captureAction = (
      <button
        className={buttonClass("ghost")}
        type="button"
        onClick={stopRecording}
      >
        Arrêter l’enregistrement
      </button>
    );
  } else if (isStopping) {
    captureAction = (
      <button
        aria-busy="true"
        className={buttonClass("ghost")}
        disabled
        type="button"
      >
        Finalisation de la prise…
      </button>
    );
  } else {
    captureAction = (
      <button
        className={buttonClass("ghost")}
        disabled={isRequesting}
        type="button"
        onClick={() => void beginRecording()}
      >
        {recordButtonLabel}
      </button>
    );
  }

  return (
    <section
      className={lessonStyles.voiceComparison}
      aria-labelledby="voice-comparison-title"
    >
      <div className={lessonStyles.voiceComparisonHeader}>
        <div>
          <p className={lessonStyles.eyebrow}>Comparaison facultative</p>
          <h2 id="voice-comparison-title">Écouter A, puis votre prise B.</h2>
        </div>
        <span className={lessonStyles.localOnlyBadge}>Local uniquement</span>
      </div>
      <p className={lessonStyles.voicePrivacy}>
        Le navigateur demandera le microphone seulement après votre clic. Votre
        voix reste en mémoire dans cet onglet : elle n’est ni enregistrée dans
        votre compte, ni envoyée, ni analysée.
      </p>

      <div className={lessonStyles.voiceTracks}>
        <article>
          <span className={lessonStyles.voiceTrackLabel}>
            A · signal modèle fictif
          </span>
          <span className="srOnly" id="model-audio-description">
            Signal sonore fictif : une note pure de 440 hertz pendant 0,32
            seconde, sans parole.
          </span>
          <audio
            aria-describedby="model-audio-description"
            aria-label="Lire le signal modèle fictif"
            aria-disabled={isCaptureBusy}
            controls={!isCaptureBusy}
            onError={() =>
              setPlaybackError(
                "La lecture A/B est indisponible. Vous pouvez continuer sans votre prise.",
              )
            }
            onPlay={(event) => {
              if (captureBlocksPlayback.current) {
                event.currentTarget.pause();
                return;
              }
              setPlaybackError("");
              recordedAudio.current?.pause();
            }}
            preload="metadata"
            ref={modelAudio}
            src={modelAudioSrc}
          >
            <track
              default
              kind="captions"
              label="Description française du signal"
              src="/captions/fixture-tone.fr.vtt"
              srcLang="fr"
            />
          </audio>
        </article>
        <article>
          <span className={lessonStyles.voiceTrackLabel}>
            B · votre prise locale
          </span>
          <span className="srOnly" id="local-voice-audio-description">
            Votre propre prise vocale, conservée localement sans transcription
            automatique.
          </span>
          {capture !== null ? (
            <audio
              aria-describedby="local-voice-audio-description"
              aria-label="Lire ma prise locale"
              controls
              onError={() => {
                if (recordingUrl.current !== null) {
                  setPlaybackError(
                    "La lecture A/B est indisponible. La prise reste supprimable.",
                  );
                }
              }}
              onPlay={() => {
                setPlaybackError("");
                modelAudio.current?.pause();
              }}
              preload="metadata"
              ref={bindRecordedAudio}
            >
              <track
                default
                kind="captions"
                label="Description française de la prise locale"
                src="/captions/local-voice.fr.vtt"
                srcLang="fr"
              />
            </audio>
          ) : (
            <p className={lessonStyles.voiceEmpty}>Aucune prise conservée.</p>
          )}
        </article>
      </div>

      {isRecording && (
        <div className={lessonStyles.recordingProgress}>
          <progress
            aria-label="Temps restant pour la prise"
            aria-valuetext={`${remainingSeconds} seconde${remainingSeconds > 1 ? "s" : ""} restante${remainingSeconds > 1 ? "s" : ""}`}
            max={MAX_DURATION_SECONDS}
            value={remainingSeconds}
          />
          <span aria-hidden="true">{remainingSeconds} s restantes</span>
        </div>
      )}

      <div className={lessonStyles.voiceActions}>
        {captureAction}
        {capture !== null && !isRecording && (
          <button
            className={buttonClass("danger")}
            type="button"
            onClick={deleteRecording}
          >
            Supprimer cette prise locale
          </button>
        )}
      </div>

      {message !== "" && (
        <p
          className={
            phase === "error" ? "inlineError voiceMessage" : "voiceMessage"
          }
        >
          <output role={phase === "error" ? "alert" : undefined}>
            {message}
          </output>
        </p>
      )}
      {playbackError !== "" && (
        <p className={lessonStyles.inlineError} role="alert">
          {playbackError}
        </p>
      )}
    </section>
  );
}
