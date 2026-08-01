import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioPlayer,
  type AudioStatus,
  type RecordingStatus,
} from "expo-audio";
import { File, FileMode, Paths } from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  LOCAL_VOICE_MAX_DURATION_MS,
  LocalVoiceEpochGate,
  LocalVoiceRecorderTerminalLatch,
  type LocalVoiceRecorderTerminalResult,
  deleteLocalVoiceResource,
  getLocalVoiceRemainingMs,
  isFinitePositiveAudioDuration,
  isMpeg4AudioHeader,
  releaseLocalVoicePlayer,
  sanitizeLocalVoiceRecorderUri,
} from "./local-voice-practice";

const LOCAL_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: "cache" as const,
};

const PLAYBACK_AUDIO_MODE = {
  allowsBackgroundRecording: false,
  allowsRecording: false,
  interruptionMode: "doNotMix" as const,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
};

const RECORDING_AUDIO_MODE = {
  ...PLAYBACK_AUDIO_MODE,
  allowsRecording: true,
};

const RECORDER_HEALTH_GRACE_MS = 400;
const RECORDER_TERMINAL_SETTLE_MS = 75;
const RECORDER_TERMINAL_TIMEOUT_MS = 2_000;
const RECORDING_PLAYER_TIMEOUT_MS = 2_500;

type VoiceOperation =
  "idle" | "permission" | "stopping" | "deleting" | "playback";
type VoicePlaybackTarget = "model" | "recording";
type StopReason = "background" | "interruption" | "limit" | "manual" | "route";
type RecorderSessionPhase = "preparing" | "recording" | "stopping";

export interface VoicePlaybackState {
  paused: boolean;
  target: VoicePlaybackTarget;
}

interface RemovableSubscription {
  remove(): void;
}

interface RecorderSession {
  readonly epoch: number;
  readonly latch: LocalVoiceRecorderTerminalLatch;
  readonly protectedRecordingUri: string | null;
  forceDiscard: boolean;
  observedRecording: boolean;
  phase: RecorderSessionPhase;
  preserveProtectedRecording: boolean;
  startedAtMillis: number | null;
  terminalArmed: boolean;
}

interface NativeStopResult {
  readonly stopFailed: boolean;
  readonly terminal: LocalVoiceRecorderTerminalResult | null;
}

interface VoiceFeedback {
  readonly error: string;
  readonly notice: string | null;
}

function monotonicNow(): number {
  return (
    globalThis as unknown as { readonly performance: { now(): number } }
  ).performance.now();
}

export interface LocalVoicePractice {
  readonly canPlayRecording: boolean;
  readonly deleteRecording: () => Promise<boolean>;
  readonly durationMillis: number;
  readonly error: string;
  readonly hasRecording: boolean;
  readonly isBusy: boolean;
  readonly isRecording: boolean;
  readonly notice: string;
  readonly pausePlayback: () => void;
  readonly playModel: () => Promise<void>;
  readonly playRecording: () => Promise<void>;
  readonly playback: VoicePlaybackState | null;
  readonly remainingSeconds: number;
  readonly startRecording: () => Promise<void>;
  readonly stopRecording: () => Promise<void>;
}

function stopNotice(reason: StopReason): string {
  if (reason === "limit") {
    return "Limite de 20 secondes atteinte. Votre essai est prêt.";
  }
  if (
    reason === "background" ||
    reason === "interruption" ||
    reason === "route"
  ) {
    return "Prise interrompue et supprimée du cache local. Vous pouvez recommencer quand vous le souhaitez.";
  }
  return "Enregistrement terminé. Comparez maintenant A et B.";
}

function permissionError(canAskAgain: boolean): string {
  if (canAskAgain) {
    return "Accès au microphone refusé pour cette fois. Appuyez de nouveau sur « M’enregistrer » pour réessayer.";
  }
  return "Accès au microphone bloqué. Autorisez Thaïnaute dans les réglages de l’appareil pour utiliser cet exercice optionnel.";
}

function isDiscardingStopReason(reason: StopReason): boolean {
  return (
    reason === "background" || reason === "interruption" || reason === "route"
  );
}

function mustDiscardStoppedRecording(
  session: RecorderSession,
  result: NativeStopResult,
): boolean {
  return (
    session.forceDiscard ||
    result.stopFailed ||
    result.terminal === null ||
    result.terminal.outcome === "discard"
  );
}

function discardedStopFeedback(
  reason: StopReason,
  session: RecorderSession,
  result: NativeStopResult,
  audioModeFailed: boolean,
): VoiceFeedback {
  if (result.terminal === null) {
    return {
      error:
        "La finalisation native n’a pas été confirmée. La prise a été supprimée et l’enregistrement reste verrouillé jusqu’à la réouverture de cet écran.",
      notice: null,
    };
  }
  if (result.stopFailed) {
    return {
      error:
        "La finalisation a échoué. La prise incomplète a été supprimée du cache local.",
      notice: null,
    };
  }
  if (result.terminal.outcome === "discard") {
    return {
      error:
        "Une interruption audio a été détectée. La prise incomplète a été supprimée du cache local.",
      notice: null,
    };
  }
  if (session.forceDiscard) {
    return { error: "", notice: stopNotice("interruption") };
  }
  if (audioModeFailed) {
    return {
      error:
        "La prise interrompue a été supprimée, mais la session audio devra être relancée.",
      notice: null,
    };
  }
  return { error: "", notice: stopNotice(reason) };
}

function createRecorderSession(
  epoch: number,
  protectedRecordingUri: string | null,
): RecorderSession {
  return {
    epoch,
    forceDiscard: false,
    latch: new LocalVoiceRecorderTerminalLatch(),
    observedRecording: false,
    phase: "preparing",
    preserveProtectedRecording: protectedRecordingUri !== null,
    protectedRecordingUri,
    startedAtMillis: null,
    terminalArmed: false,
  };
}

function recordingStartIsBlocked(
  operation: VoiceOperation,
  hasRecorderSession: boolean,
  hasStopInFlight: boolean,
): boolean {
  return operation !== "idle" || hasRecorderSession || hasStopInFlight;
}

function playbackStartIsBlocked(
  operation: VoiceOperation,
  hasRecorderSession: boolean,
  hasStopInFlight: boolean,
): boolean {
  return (
    hasRecorderSession ||
    hasStopInFlight ||
    (operation !== "idle" && operation !== "playback")
  );
}

function playbackError(target: VoicePlaybackTarget): string {
  return target === "model"
    ? "Le modèle audio est momentanément indisponible."
    : "Votre essai local ne peut pas être lu. Vous pouvez toujours le supprimer.";
}

export function useLocalVoicePractice(
  modelPlayer: AudioPlayer,
): LocalVoicePractice {
  const recorderStatusListenerRef = useRef<(status: RecordingStatus) => void>(
    () => undefined,
  );
  const recorder = useAudioRecorder(LOCAL_RECORDING_OPTIONS, (status) => {
    recorderStatusListenerRef.current(status);
  });
  const recorderState = useAudioRecorderState(recorder, 100);
  const modelStatus = useAudioPlayerStatus(modelPlayer);

  const [operation, setOperation] = useState<VoiceOperation>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [canPlayRecording, setCanPlayRecording] = useState(false);
  const [playback, setPlayback] = useState<VoicePlaybackState | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const mountedRef = useRef(true);
  const routeFocusedRef = useRef(false);
  const windowFocusedRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const captureGateRef = useRef(new LocalVoiceEpochGate());
  const playbackGateRef = useRef(new LocalVoiceEpochGate());
  const playbackDeactivationRequiredRef = useRef(false);
  const audioDeactivationInFlightRef = useRef<Promise<void> | null>(null);
  const operationRef = useRef<VoiceOperation>("idle");
  const recorderSessionRef = useRef<RecorderSession | null>(null);
  const recorderPoisonedRef = useRef(false);
  const recordingUriRef = useRef<string | null>(null);
  const recordingPlayableRef = useRef(false);
  const playbackRef = useRef<VoicePlaybackState | null>(null);
  const recordingPlayerRef = useRef<AudioPlayer | null>(null);
  const recordingPlayerSubscriptionRef = useRef<RemovableSubscription | null>(
    null,
  );
  const pendingRecordingPlayerRef = useRef<AudioPlayer | null>(null);
  const pendingPlayerValidationCancelRef = useRef<(() => void) | null>(null);
  const recordingPlayerWasPlayingRef = useRef(false);
  const modelWasPlayingRef = useRef(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopInFlightRef = useRef<Promise<string | null> | null>(null);

  const setOperationState = useCallback((next: VoiceOperation) => {
    operationRef.current = next;
    if (mountedRef.current) setOperation(next);
  }, []);

  const finishOperation = useCallback(
    (expected: VoiceOperation) => {
      if (operationRef.current === expected) setOperationState("idle");
    },
    [setOperationState],
  );

  const setPlaybackState = useCallback((next: VoicePlaybackState | null) => {
    playbackRef.current = next;
    if (mountedRef.current) setPlayback(next);
  }, []);

  const setRecordingState = useCallback(
    (uri: string | null, playable: boolean) => {
      recordingUriRef.current = uri;
      recordingPlayableRef.current = uri !== null && playable;
      if (mountedRef.current) {
        setRecordingUri(uri);
        setCanPlayRecording(uri !== null && playable);
      }
    },
    [],
  );

  const showError = useCallback((next: string) => {
    if (mountedRef.current) setError(next);
  }, []);

  const showNotice = useCallback((next: string) => {
    if (mountedRef.current) setNotice(next);
  }, []);

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current === null) return;
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const clearHealthTimer = useCallback(() => {
    if (healthTimerRef.current === null) return;
    clearTimeout(healthTimerRef.current);
    healthTimerRef.current = null;
  }, []);

  const readRecorderUri = useCallback((): string | null => {
    try {
      return recorder.uri;
    } catch {
      return null;
    }
  }, [recorder]);

  const deactivateAudioSession = useCallback((): Promise<void> => {
    playbackDeactivationRequiredRef.current = true;
    const currentTask = audioDeactivationInFlightRef.current;
    if (currentTask !== null) return currentTask;

    let task: Promise<void>;
    task = setIsAudioActiveAsync(false)
      .catch(() => undefined)
      .finally(() => {
        if (audioDeactivationInFlightRef.current === task) {
          audioDeactivationInFlightRef.current = null;
        }
      });
    audioDeactivationInFlightRef.current = task;
    return task;
  }, []);

  const isCaptureContextCurrent = useCallback((epoch: number): boolean => {
    return (
      mountedRef.current &&
      routeFocusedRef.current &&
      windowFocusedRef.current &&
      appStateRef.current === "active" &&
      captureGateRef.current.isCurrent(epoch)
    );
  }, []);

  const isPlaybackContextCurrent = useCallback((epoch: number): boolean => {
    return (
      mountedRef.current &&
      routeFocusedRef.current &&
      windowFocusedRef.current &&
      appStateRef.current === "active" &&
      playbackGateRef.current.isCurrent(epoch)
    );
  }, []);

  const detachRecordingPlayer = useCallback((): AudioPlayer | null => {
    recordingPlayerSubscriptionRef.current?.remove();
    recordingPlayerSubscriptionRef.current = null;
    recordingPlayerWasPlayingRef.current = false;
    const player = recordingPlayerRef.current;
    recordingPlayerRef.current = null;
    return player;
  }, []);

  const cancelPendingPlayerValidation = useCallback(() => {
    pendingPlayerValidationCancelRef.current?.();
    pendingPlayerValidationCancelRef.current = null;
    const player = pendingRecordingPlayerRef.current;
    pendingRecordingPlayerRef.current = null;
    try {
      releaseLocalVoicePlayer(player);
    } catch {
      // The cache remains private even if a native player is already invalid.
    }
  }, []);

  const pauseBothPlayers = useCallback(
    (markCurrentAsPaused: boolean) => {
      try {
        modelPlayer.pause();
      } catch {
        // A released or interrupted model player is handled by its status.
      }
      try {
        recordingPlayerRef.current?.pause();
      } catch {
        // The recording remains deletable even if its player was interrupted.
      }

      const current = playbackRef.current;
      if (markCurrentAsPaused && current !== null && !current.paused) {
        setPlaybackState({ ...current, paused: true });
      } else if (!markCurrentAsPaused) {
        setPlaybackState(null);
      }
    },
    [modelPlayer, setPlaybackState],
  );

  const pausePlayback = useCallback(() => {
    playbackGateRef.current.supersede();
    pauseBothPlayers(true);
    finishOperation("playback");
    if (recorderSessionRef.current === null) {
      void deactivateAudioSession();
    }
  }, [deactivateAudioSession, finishOperation, pauseBothPlayers]);

  const attachRecordingPlayer = useCallback(
    (player: AudioPlayer) => {
      const previousPlayer = detachRecordingPlayer();
      try {
        releaseLocalVoicePlayer(previousPlayer);
      } catch {
        throw new Error("previous local player release failed");
      }

      const subscription = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (!mountedRef.current) return;

          if (status.error !== null || status.mediaServicesDidReset === true) {
            recordingPlayerWasPlayingRef.current = false;
            recordingPlayableRef.current = false;
            setCanPlayRecording(false);
            setPlaybackState(null);
            showError(
              "La lecture de votre essai a été interrompue. Supprimez cette prise puis recommencez.",
            );
            return;
          }

          if (status.playing) {
            const current = playbackRef.current;
            const authorized =
              current?.target === "recording" &&
              !current.paused &&
              mountedRef.current &&
              routeFocusedRef.current &&
              windowFocusedRef.current &&
              appStateRef.current === "active";
            if (!authorized) {
              recordingPlayerWasPlayingRef.current = false;
              try {
                player.pause();
              } catch {
                // A stale native auto-resume is still denied in local state.
              }
              return;
            }
            recordingPlayerWasPlayingRef.current = true;
            return;
          }

          if (status.didJustFinish) {
            recordingPlayerWasPlayingRef.current = false;
            if (playbackRef.current?.target === "recording") {
              setPlaybackState(null);
            }
            return;
          }

          if (
            recordingPlayerWasPlayingRef.current &&
            playbackRef.current?.target === "recording" &&
            !playbackRef.current.paused
          ) {
            recordingPlayerWasPlayingRef.current = false;
            setPlaybackState({ paused: true, target: "recording" });
            showNotice(
              "Lecture interrompue. Appuyez sur « Reprendre ma voix » pour continuer.",
            );
          }
        },
      );

      recordingPlayerRef.current = player;
      recordingPlayerSubscriptionRef.current = subscription;
    },
    [detachRecordingPlayer, setPlaybackState, showError, showNotice],
  );

  const disposeRecordingUri = useCallback(
    (uri: string): boolean => {
      cancelPendingPlayerValidation();
      let localUri: string;
      try {
        const sanitized = sanitizeLocalVoiceRecorderUri(uri, Paths.cache.uri);
        if (sanitized === null) {
          setRecordingState(null, false);
          return true;
        }
        localUri = sanitized;
      } catch {
        setRecordingState(null, false);
        showError(
          "La référence locale était invalide. Aucune lecture n’est autorisée ; le cache système assurera la purge finale.",
        );
        return true;
      }

      try {
        const player = detachRecordingPlayer();
        deleteLocalVoiceResource({
          cacheDirectoryUri: Paths.cache.uri,
          createFile: (candidateUri) => new File(candidateUri),
          player,
          uri: localUri,
        });
      } catch {
        setRecordingState(localUri, false);
        showError(
          "La suppression locale n’a pas abouti. Le fichier reste signalé afin que vous puissiez réessayer.",
        );
        return false;
      }

      setRecordingState(null, false);
      if (playbackRef.current?.target === "recording") {
        setPlaybackState(null);
      }
      return true;
    },
    [
      cancelPendingPlayerValidation,
      detachRecordingPlayer,
      setPlaybackState,
      setRecordingState,
      showError,
    ],
  );

  const discardRecorderUri = useCallback(
    (uri: string | null): boolean => {
      if (uri === null || uri.trim() === "") {
        setRecordingState(null, false);
        return true;
      }
      return disposeRecordingUri(uri);
    },
    [disposeRecordingUri, setRecordingState],
  );

  const waitForRecordingPlayer = useCallback(
    async (player: AudioPlayer): Promise<boolean> => {
      return await new Promise((resolve) => {
        let settled = false;
        let subscription: RemovableSubscription | null = null;

        const finish = (ready: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          subscription?.remove();
          if (pendingPlayerValidationCancelRef.current === cancel) {
            pendingPlayerValidationCancelRef.current = null;
          }
          resolve(ready);
        };
        const inspect = (status: AudioStatus) => {
          if (status.error !== null || status.mediaServicesDidReset === true) {
            finish(false);
            return;
          }
          if (
            status.isLoaded &&
            isFinitePositiveAudioDuration(status.duration)
          ) {
            finish(true);
          }
        };
        const cancel = () => finish(false);
        const timeout = setTimeout(
          () => finish(false),
          RECORDING_PLAYER_TIMEOUT_MS,
        );

        pendingPlayerValidationCancelRef.current = cancel;
        try {
          subscription = player.addListener("playbackStatusUpdate", inspect);
          if (settled) subscription.remove();
          inspect(player.currentStatus);
        } catch {
          finish(false);
        }
      });
    },
    [],
  );

  const validateAndAttachRecording = useCallback(
    async (uri: string, session: RecorderSession): Promise<string | null> => {
      let localUri: string;
      let player: AudioPlayer | null = null;
      try {
        const sanitized = sanitizeLocalVoiceRecorderUri(uri, Paths.cache.uri);
        if (sanitized === null) return null;
        localUri = sanitized;

        const file = new File(localUri);
        if (!file.exists || file.size <= 0) return null;

        const handle = file.open(FileMode.ReadOnly);
        let header: Uint8Array;
        try {
          header = handle.readBytes(Math.min(32, file.size));
        } finally {
          handle.close();
        }
        if (!isMpeg4AudioHeader(header)) return null;

        player = createAudioPlayer(localUri, {
          keepAudioSessionActive: false,
          updateInterval: 100,
        });
        pendingRecordingPlayerRef.current = player;
        const ready = await waitForRecordingPlayer(player);
        if (!ready) return null;
        if (
          session.forceDiscard ||
          recorderSessionRef.current !== session ||
          !isCaptureContextCurrent(session.epoch)
        ) {
          return null;
        }

        attachRecordingPlayer(player);
        pendingRecordingPlayerRef.current = null;
        player = null;
        setRecordingState(localUri, true);
        return localUri;
      } catch {
        return null;
      } finally {
        const ownsPendingPlayer =
          player !== null && pendingRecordingPlayerRef.current === player;
        if (ownsPendingPlayer) {
          pendingRecordingPlayerRef.current = null;
        }
        if (player !== null && ownsPendingPlayer) {
          try {
            releaseLocalVoicePlayer(player);
          } catch {
            // The file is still passed through the deletion boundary below.
          }
        }
      }
    },
    [
      attachRecordingPlayer,
      isCaptureContextCurrent,
      setRecordingState,
      waitForRecordingPlayer,
    ],
  );

  const abortPreparingSession = useCallback(
    async (session: RecorderSession): Promise<boolean> => {
      session.forceDiscard = true;
      clearStopTimer();
      clearHealthTimer();
      try {
        await recorder.stop();
      } catch {
        // A recorder that never started may reject stop; its URI is still purged.
      }
      const currentRecorderUri = readRecorderUri();
      const protectsExistingRecording =
        session.preserveProtectedRecording &&
        (currentRecorderUri === null ||
          currentRecorderUri === session.protectedRecordingUri);
      const deleted = protectsExistingRecording
        ? true
        : discardRecorderUri(currentRecorderUri);
      if (recorderSessionRef.current === session) {
        recorderSessionRef.current = null;
      }
      if (mountedRef.current) setIsRecording(false);

      try {
        if (
          mountedRef.current &&
          routeFocusedRef.current &&
          windowFocusedRef.current &&
          appStateRef.current === "active"
        ) {
          await setAudioModeAsync(PLAYBACK_AUDIO_MODE);
        } else {
          await deactivateAudioSession();
        }
      } catch {
        // The next explicit action will establish a fresh audio session.
      }
      return deleted;
    },
    [
      clearHealthTimer,
      clearStopTimer,
      deactivateAudioSession,
      discardRecorderUri,
      readRecorderUri,
      recorder,
    ],
  );

  const stopNativeRecorder = useCallback(
    async (session: RecorderSession): Promise<NativeStopResult> => {
      let stopFailed = false;
      const terminalPromise = session.latch.wait({
        settleMs: RECORDER_TERMINAL_SETTLE_MS,
        timeoutMs: RECORDER_TERMINAL_TIMEOUT_MS,
      });
      const markStopFailure = () => {
        stopFailed = true;
        session.forceDiscard = true;
        session.latch.observe({
          hasError: true,
          isFinished: true,
          url: null,
        });
      };

      try {
        // A logically active recorder is always stopped, even when the native
        // property reports a transient paused state.
        void recorder.stop().catch(markStopFailure);
      } catch {
        markStopFailure();
      }

      const terminal = await terminalPromise;
      return { stopFailed, terminal };
    },
    [recorder],
  );

  const restoreAudioAfterStop = useCallback(
    async (
      session: RecorderSession,
      result: NativeStopResult,
    ): Promise<boolean> => {
      const canRestorePlaybackMode =
        result.terminal !== null &&
        !result.stopFailed &&
        !session.forceDiscard &&
        mountedRef.current &&
        routeFocusedRef.current &&
        windowFocusedRef.current &&
        appStateRef.current === "active";

      try {
        if (canRestorePlaybackMode) {
          await setAudioModeAsync(PLAYBACK_AUDIO_MODE);
        } else {
          await deactivateAudioSession();
        }
        return false;
      } catch {
        return true;
      }
    },
    [deactivateAudioSession],
  );

  const discardStoppedRecording = useCallback(
    (
      reason: StopReason,
      session: RecorderSession,
      result: NativeStopResult,
      audioModeFailed: boolean,
    ): null => {
      const deleted = discardRecorderUri(
        result.terminal?.url ?? readRecorderUri(),
      );
      if (!deleted || !mountedRef.current) return null;

      const feedback = discardedStopFeedback(
        reason,
        session,
        result,
        audioModeFailed,
      );
      showError(feedback.error);
      if (feedback.notice !== null) showNotice(feedback.notice);
      return null;
    },
    [discardRecorderUri, readRecorderUri, showError, showNotice],
  );

  const retainStoppedRecording = useCallback(
    async (
      reason: StopReason,
      session: RecorderSession,
      terminalUri: string | null,
      audioModeFailed: boolean,
    ): Promise<string | null> => {
      if (terminalUri === null || terminalUri.trim() === "") {
        const deleted = discardRecorderUri(readRecorderUri());
        if (deleted) {
          showError(
            "L’enregistrement s’est terminé sans produire de fichier local utilisable.",
          );
        }
        return null;
      }

      const retainedUri = await validateAndAttachRecording(
        terminalUri,
        session,
      );
      if (retainedUri === null) {
        const terminalDeleted = discardRecorderUri(terminalUri);
        const fallbackUri = readRecorderUri();
        const fallbackDeleted =
          fallbackUri === terminalUri || discardRecorderUri(fallbackUri);
        if (terminalDeleted && fallbackDeleted) {
          showError(
            "La prise locale est absente, vide ou illisible. Elle a été supprimée et ne peut pas être écoutée.",
          );
        }
        return null;
      }

      if (audioModeFailed) {
        showError(
          "Votre essai est conservé dans le cache, mais la session audio devra être relancée avant l’écoute.",
        );
      } else {
        showError("");
        showNotice(stopNotice(reason));
      }
      return retainedUri;
    },
    [
      discardRecorderUri,
      readRecorderUri,
      showError,
      showNotice,
      validateAndAttachRecording,
    ],
  );

  const stopRecordingInternal = useCallback(
    (reason: StopReason): Promise<string | null> => {
      const existingStop = stopInFlightRef.current;
      if (existingStop !== null) return existingStop;

      const session = recorderSessionRef.current;
      if (session === null) return Promise.resolve(recordingUriRef.current);
      if (session.phase === "preparing") {
        return abortPreparingSession(session).then(() => null);
      }

      clearStopTimer();
      clearHealthTimer();
      session.phase = "stopping";
      if (isDiscardingStopReason(reason)) {
        session.forceDiscard = true;
      }
      if (mountedRef.current) setIsRecording(false);
      setOperationState("stopping");

      const task = (async (): Promise<string | null> => {
        const result = await stopNativeRecorder(session);
        if (result.terminal === null) {
          recorderPoisonedRef.current = true;
          session.forceDiscard = true;
        }

        const audioModeFailed = await restoreAudioAfterStop(session, result);
        if (mustDiscardStoppedRecording(session, result)) {
          return discardStoppedRecording(
            reason,
            session,
            result,
            audioModeFailed,
          );
        }

        return await retainStoppedRecording(
          reason,
          session,
          result.terminal?.url ?? null,
          audioModeFailed,
        );
      })().finally(() => {
        session.terminalArmed = false;
        if (recorderSessionRef.current === session) {
          recorderSessionRef.current = null;
        }
        if (stopInFlightRef.current === task) {
          stopInFlightRef.current = null;
        }
        finishOperation("stopping");
      });

      stopInFlightRef.current = task;
      return task;
    },
    [
      abortPreparingSession,
      clearHealthTimer,
      clearStopTimer,
      discardStoppedRecording,
      finishOperation,
      restoreAudioAfterStop,
      retainStoppedRecording,
      setOperationState,
      stopNativeRecorder,
    ],
  );

  const abortStalePreparingSession = useCallback(
    async (session: RecorderSession): Promise<boolean> => {
      if (isCaptureContextCurrent(session.epoch)) return false;
      await abortPreparingSession(session);
      return true;
    },
    [abortPreparingSession, isCaptureContextCurrent],
  );

  const prepareRecordingSession = useCallback(
    async (session: RecorderSession): Promise<boolean> => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (await abortStalePreparingSession(session)) return false;
      if (!permission.granted) {
        recorderSessionRef.current = null;
        showError(permissionError(permission.canAskAgain));
        return false;
      }

      const previousUri = recordingUriRef.current;
      if (previousUri !== null && !disposeRecordingUri(previousUri)) {
        recorderSessionRef.current = null;
        return false;
      }
      session.preserveProtectedRecording = false;

      const pendingDeactivation = audioDeactivationInFlightRef.current;
      if (pendingDeactivation !== null) await pendingDeactivation;
      if (await abortStalePreparingSession(session)) return false;

      playbackDeactivationRequiredRef.current = false;
      await setIsAudioActiveAsync(true);
      if (await abortStalePreparingSession(session)) return false;

      await setAudioModeAsync(RECORDING_AUDIO_MODE);
      if (await abortStalePreparingSession(session)) return false;

      // Explicit options force a fresh AVAudioRecorder after an interruption
      // and detach any possible late delegate callback on iOS.
      await recorder.prepareToRecordAsync(LOCAL_RECORDING_OPTIONS);
      return !(await abortStalePreparingSession(session));
    },
    [abortStalePreparingSession, disposeRecordingUri, recorder, showError],
  );

  const startPreparedRecorder = useCallback(
    (session: RecorderSession): boolean => {
      session.terminalArmed = true;
      session.phase = "recording";
      session.startedAtMillis = monotonicNow();
      try {
        recorder.record({
          forDuration: LOCAL_VOICE_MAX_DURATION_MS / 1_000,
        });
      } catch (recordingError) {
        session.phase = "preparing";
        session.startedAtMillis = null;
        session.terminalArmed = false;
        throw recordingError;
      }

      if (session.forceDiscard || session.phase !== "recording") return false;
      session.observedRecording = recorder.getStatus().isRecording;
      return true;
    },
    [recorder],
  );

  const armRecordingHealthChecks = useCallback(
    (session: RecorderSession): void => {
      stopTimerRef.current = setTimeout(() => {
        void stopRecordingInternal("limit");
      }, LOCAL_VOICE_MAX_DURATION_MS);
      healthTimerRef.current = setTimeout(() => {
        healthTimerRef.current = null;
        if (
          recorderSessionRef.current !== session ||
          session.phase !== "recording"
        ) {
          return;
        }

        let current: ReturnType<typeof recorder.getStatus>;
        try {
          current = recorder.getStatus();
        } catch {
          session.forceDiscard = true;
          void stopRecordingInternal("interruption");
          return;
        }
        if (current.isRecording) {
          session.observedRecording = true;
          return;
        }
        session.forceDiscard = true;
        void stopRecordingInternal("interruption");
      }, RECORDER_HEALTH_GRACE_MS);
    },
    [recorder, stopRecordingInternal],
  );

  const handleRecordingStartFailure = useCallback(
    async (session: RecorderSession): Promise<void> => {
      if (session.phase === "recording") {
        session.forceDiscard = true;
        await stopRecordingInternal("interruption");
        return;
      }

      const deleted = await abortPreparingSession(session);
      if (deleted) {
        showError(
          "Le microphone n’a pas pu démarrer. Aucune prise incomplète n’a été conservée ni envoyée.",
        );
      }
    },
    [abortPreparingSession, showError, stopRecordingInternal],
  );

  const startRecording = useCallback(async (): Promise<void> => {
    if (
      recordingStartIsBlocked(
        operationRef.current,
        recorderSessionRef.current !== null,
        stopInFlightRef.current !== null,
      )
    )
      return;
    if (recorderPoisonedRef.current) {
      showError(
        "La session d’enregistrement doit être réinitialisée. Quittez puis rouvrez cet écran avant de recommencer.",
      );
      return;
    }

    const epoch = captureGateRef.current.begin();
    if (epoch === null || !isCaptureContextCurrent(epoch)) return;
    playbackGateRef.current.supersede();
    pauseBothPlayers(false);
    setOperationState("permission");
    showError("");
    showNotice("Le microphone est demandé uniquement après cette action.");

    const session = createRecorderSession(epoch, recordingUriRef.current);
    recorderSessionRef.current = session;

    try {
      if (!(await prepareRecordingSession(session))) return;
      if (!startPreparedRecorder(session)) {
        await stopRecordingInternal("interruption");
        return;
      }
      if (!isCaptureContextCurrent(epoch)) {
        session.forceDiscard = true;
        await stopRecordingInternal("interruption");
        return;
      }

      if (mountedRef.current) setIsRecording(true);
      showNotice(
        "Enregistrement local en cours. Arrêt automatique après 20 secondes.",
      );
      armRecordingHealthChecks(session);
    } catch {
      await handleRecordingStartFailure(session);
    } finally {
      finishOperation("permission");
    }
  }, [
    armRecordingHealthChecks,
    finishOperation,
    handleRecordingStartFailure,
    isCaptureContextCurrent,
    pauseBothPlayers,
    prepareRecordingSession,
    setOperationState,
    startPreparedRecorder,
    showError,
    showNotice,
    stopRecordingInternal,
  ]);

  const stopRecording = useCallback(async (): Promise<void> => {
    await stopRecordingInternal("manual");
  }, [stopRecordingInternal]);

  const deleteRecording = useCallback(async (): Promise<boolean> => {
    if (
      operationRef.current !== "idle" ||
      recorderSessionRef.current !== null ||
      stopInFlightRef.current !== null
    ) {
      return false;
    }

    playbackGateRef.current.supersede();
    playbackDeactivationRequiredRef.current = true;
    pauseBothPlayers(false);
    setOperationState("deleting");
    try {
      const uri = recordingUriRef.current;
      const deleted = uri === null || disposeRecordingUri(uri);
      if (deleted) {
        showError("");
        showNotice("Essai vocal supprimé du cache local.");
      }
      await deactivateAudioSession();
      return deleted;
    } finally {
      finishOperation("deleting");
    }
  }, [
    deactivateAudioSession,
    disposeRecordingUri,
    finishOperation,
    pauseBothPlayers,
    setOperationState,
    showError,
    showNotice,
  ]);

  const abortStalePlayback = useCallback(
    async (epoch: number): Promise<boolean> => {
      if (isPlaybackContextCurrent(epoch)) return false;

      const mustDeactivate =
        playbackDeactivationRequiredRef.current ||
        !mountedRef.current ||
        !routeFocusedRef.current ||
        !windowFocusedRef.current ||
        appStateRef.current !== "active";
      if (mustDeactivate) await deactivateAudioSession();
      return true;
    },
    [deactivateAudioSession, isPlaybackContextCurrent],
  );

  const startPlaybackTarget = useCallback(
    async (target: VoicePlaybackTarget, epoch: number): Promise<void> => {
      const player =
        target === "model" ? modelPlayer : recordingPlayerRef.current;
      if (
        player === null ||
        (target === "recording" && !recordingPlayableRef.current)
      ) {
        throw new Error("missing validated local recording player");
      }

      await player.seekTo(0);
      if (await abortStalePlayback(epoch)) return;

      if (target === "model") {
        recordingPlayerRef.current?.pause();
      } else {
        modelPlayer.pause();
      }
      setPlaybackState({ paused: false, target });
      player.play();
    },
    [abortStalePlayback, modelPlayer, setPlaybackState],
  );

  const playTarget = useCallback(
    async (target: VoicePlaybackTarget): Promise<void> => {
      if (
        playbackStartIsBlocked(
          operationRef.current,
          recorderSessionRef.current !== null,
          stopInFlightRef.current !== null,
        )
      ) {
        return;
      }
      if (target === "recording" && !recordingPlayableRef.current) return;

      const epoch = playbackGateRef.current.begin();
      if (epoch === null || !isPlaybackContextCurrent(epoch)) return;
      const pendingDeactivation = audioDeactivationInFlightRef.current;
      if (pendingDeactivation !== null) await pendingDeactivation;
      if (!isPlaybackContextCurrent(epoch)) return;
      playbackDeactivationRequiredRef.current = false;
      setOperationState("playback");
      pauseBothPlayers(false);
      showError("");

      try {
        await setIsAudioActiveAsync(true);
        if (await abortStalePlayback(epoch)) return;
        await setAudioModeAsync(PLAYBACK_AUDIO_MODE);
        if (await abortStalePlayback(epoch)) return;

        // Reassert exclusivity after every asynchronous SDK boundary.
        pauseBothPlayers(false);
        await startPlaybackTarget(target, epoch);
      } catch {
        if (isPlaybackContextCurrent(epoch)) {
          setPlaybackState(null);
          showError(playbackError(target));
        }
      } finally {
        if (playbackGateRef.current.isCurrent(epoch)) {
          finishOperation("playback");
        }
      }
    },
    [
      abortStalePlayback,
      finishOperation,
      isPlaybackContextCurrent,
      pauseBothPlayers,
      setOperationState,
      setPlaybackState,
      showError,
      startPlaybackTarget,
    ],
  );

  const playModel = useCallback(async (): Promise<void> => {
    await playTarget("model");
  }, [playTarget]);

  const playRecording = useCallback(async (): Promise<void> => {
    await playTarget("recording");
  }, [playTarget]);

  const deactivateVoice = useCallback(
    async (reason: "background" | "blur" | "route" | "unmount") => {
      captureGateRef.current.invalidate();
      playbackGateRef.current.invalidate();
      playbackDeactivationRequiredRef.current = true;
      cancelPendingPlayerValidation();
      pauseBothPlayers(false);
      finishOperation("playback");

      const session = recorderSessionRef.current;
      if (session !== null) {
        session.forceDiscard = true;
        if (session.phase !== "preparing") {
          await stopRecordingInternal(
            reason === "background" ? reason : "route",
          );
        }
      }

      if (reason === "route" || reason === "unmount") {
        const uri = recordingUriRef.current;
        if (uri !== null) disposeRecordingUri(uri);
      }

      await deactivateAudioSession();
    },
    [
      cancelPendingPlayerValidation,
      deactivateAudioSession,
      disposeRecordingUri,
      finishOperation,
      pauseBothPlayers,
      stopRecordingInternal,
    ],
  );

  useEffect(() => {
    recorderStatusListenerRef.current = (status) => {
      const session = recorderSessionRef.current;
      if (session === null || !session.terminalArmed) return;
      session.latch.observe(status);

      if (status.hasError || status.mediaServicesDidReset === true) {
        session.forceDiscard = true;
        if (session.phase === "recording") {
          void stopRecordingInternal("interruption");
        }
      } else if (status.isFinished && session.phase === "recording") {
        const elapsedMillis =
          session.startedAtMillis === null
            ? 0
            : monotonicNow() - session.startedAtMillis;
        if (
          elapsedMillis >=
          LOCAL_VOICE_MAX_DURATION_MS - RECORDER_HEALTH_GRACE_MS
        ) {
          void stopRecordingInternal("limit");
        } else {
          session.forceDiscard = true;
          void stopRecordingInternal("interruption");
        }
      }
    };

    return () => {
      recorderStatusListenerRef.current = () => undefined;
    };
  }, [stopRecordingInternal]);

  useEffect(() => {
    const session = recorderSessionRef.current;
    if (session === null || session.phase !== "recording") return;

    if (recorderState.mediaServicesDidReset) {
      session.forceDiscard = true;
      void stopRecordingInternal("interruption");
      return;
    }
    if (recorderState.isRecording) {
      session.observedRecording = true;
      return;
    }
    if (!session.observedRecording) return;

    if (
      recorderState.durationMillis >=
      LOCAL_VOICE_MAX_DURATION_MS - RECORDER_HEALTH_GRACE_MS
    ) {
      void stopRecordingInternal("limit");
    } else {
      session.forceDiscard = true;
      void stopRecordingInternal("interruption");
    }
  }, [
    recorderState.durationMillis,
    recorderState.isRecording,
    recorderState.mediaServicesDidReset,
    stopRecordingInternal,
  ]);

  useEffect(() => {
    if (modelStatus.playing) {
      const current = playbackRef.current;
      const authorized =
        current?.target === "model" &&
        !current.paused &&
        mountedRef.current &&
        routeFocusedRef.current &&
        windowFocusedRef.current &&
        appStateRef.current === "active";
      if (!authorized) {
        modelWasPlayingRef.current = false;
        try {
          modelPlayer.pause();
        } catch {
          // A stale native auto-resume is still denied in local state.
        }
        return;
      }
      modelWasPlayingRef.current = true;
      return;
    }

    if (modelStatus.didJustFinish) {
      modelWasPlayingRef.current = false;
      if (playbackRef.current?.target === "model") setPlaybackState(null);
      return;
    }

    if (
      modelWasPlayingRef.current &&
      playbackRef.current?.target === "model" &&
      !playbackRef.current.paused
    ) {
      modelWasPlayingRef.current = false;
      setPlaybackState({ paused: true, target: "model" });
      showNotice(
        "Lecture interrompue. Appuyez sur « Reprendre le modèle » pour continuer.",
      );
    }
  }, [
    modelStatus.didJustFinish,
    modelStatus.playing,
    modelPlayer,
    setPlaybackState,
    showNotice,
  ]);

  useEffect(() => {
    if (
      modelStatus.error === null &&
      modelStatus.mediaServicesDidReset !== true
    ) {
      return;
    }
    modelWasPlayingRef.current = false;
    if (playbackRef.current?.target === "model") setPlaybackState(null);
    showError("La lecture du modèle a été interrompue.");
  }, [
    modelStatus.error,
    modelStatus.mediaServicesDidReset,
    setPlaybackState,
    showError,
  ]);

  useFocusEffect(
    useCallback(() => {
      routeFocusedRef.current = true;
      if (appStateRef.current === "active" && windowFocusedRef.current) {
        captureGateRef.current.activate();
        playbackGateRef.current.activate();
      }

      return () => {
        routeFocusedRef.current = false;
        void deactivateVoice("route");
      };
    }, [deactivateVoice]),
  );

  useEffect(() => {
    mountedRef.current = true;

    const changeSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        appStateRef.current = nextState;
        if (nextState === "active") {
          if (routeFocusedRef.current && windowFocusedRef.current) {
            captureGateRef.current.activate();
            playbackGateRef.current.activate();
          }
          return;
        }

        if (playbackRef.current !== null) {
          showNotice(
            "Audio mis en pause en arrière-plan. La reprise reste manuelle.",
          );
        }
        void deactivateVoice("background");
      },
    );
    const blurSubscription = AppState.addEventListener("blur", () => {
      windowFocusedRef.current = false;
      void deactivateVoice("blur");
    });
    const focusSubscription = AppState.addEventListener("focus", () => {
      windowFocusedRef.current = true;
      if (appStateRef.current !== "active" || !routeFocusedRef.current) return;
      captureGateRef.current.activate();
      playbackGateRef.current.activate();
    });

    return () => {
      mountedRef.current = false;
      routeFocusedRef.current = false;
      windowFocusedRef.current = false;
      changeSubscription.remove();
      blurSubscription.remove();
      focusSubscription.remove();
      clearStopTimer();
      clearHealthTimer();
      void deactivateVoice("unmount");
    };
  }, [clearHealthTimer, clearStopTimer, deactivateVoice, showNotice]);

  return useMemo(
    () => ({
      canPlayRecording,
      deleteRecording,
      durationMillis: recorderState.durationMillis,
      error,
      hasRecording: recordingUri !== null,
      isBusy: operation !== "idle",
      isRecording,
      notice,
      pausePlayback,
      playModel,
      playRecording,
      playback,
      remainingSeconds: Math.ceil(
        getLocalVoiceRemainingMs(recorderState.durationMillis) / 1_000,
      ),
      startRecording,
      stopRecording,
    }),
    [
      canPlayRecording,
      deleteRecording,
      error,
      isRecording,
      notice,
      operation,
      pausePlayback,
      playModel,
      playRecording,
      playback,
      recorderState.durationMillis,
      recordingUri,
      startRecording,
      stopRecording,
    ],
  );
}
