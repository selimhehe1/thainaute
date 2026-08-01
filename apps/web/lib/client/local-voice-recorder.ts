"use client";

export const MAX_LOCAL_VOICE_DURATION_MS = 20_000;
export const LOCAL_VOICE_PERMISSION_TIMEOUT_MS = 10_000;

export type LocalVoiceRecorderErrorCode =
  | "cancelled"
  | "device_unavailable"
  | "empty_recording"
  | "interrupted"
  | "permission_blocked"
  | "permission_denied"
  | "permission_timeout"
  | "unsupported"
  | "unknown";

export class LocalVoiceRecorderError extends Error {
  public readonly code: LocalVoiceRecorderErrorCode;

  public constructor(code: LocalVoiceRecorderErrorCode) {
    super("L’enregistrement vocal local a échoué.");
    this.name = "LocalVoiceRecorderError";
    this.code = code;
  }
}

export interface LocalVoiceCapture {
  readonly blob: Blob;
  readonly durationMs: number;
  readonly stoppedByLimit: boolean;
}

export interface ActiveLocalVoiceRecording {
  readonly completion: Promise<LocalVoiceCapture>;
  readonly startedAt: number;
  cancel(): void;
  interrupt(): void;
  stop(): Promise<LocalVoiceCapture>;
}

export interface LocalVoiceRecorder {
  start(options?: {
    readonly signal?: AbortSignal;
  }): Promise<ActiveLocalVoiceRecording>;
}

interface BrowserLocalVoiceRecorderDependencies {
  readonly clearTimeout?: (
    timeoutId: ReturnType<typeof globalThis.setTimeout>,
  ) => void;
  readonly getMediaDevices?: () => Pick<MediaDevices, "getUserMedia"> | null;
  readonly getMediaRecorder?: () => typeof MediaRecorder | null;
  readonly now?: () => number;
  readonly setTimeout?: (
    callback: () => void,
    delayMs: number,
  ) => ReturnType<typeof globalThis.setTimeout>;
}

export interface BrowserLocalVoiceRecorderOptions {
  readonly maxDurationMs?: number;
  readonly permissionTimeoutMs?: number;
}

const MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
] as const;
const STOP_FINALIZATION_TIMEOUT_MS = 2_000;

type StopReason =
  "cancelled" | "error" | "interrupted" | "limit" | "manual" | null;

function errorCodeForStopReason(
  stopReason: StopReason,
): LocalVoiceRecorderErrorCode {
  if (stopReason === "cancelled" || stopReason === "interrupted") {
    return stopReason;
  }
  return "unknown";
}

function stopTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // La libération reste best-effort et aucun détail natif n'est journalisé.
    }
  }
}

function mapNativeError(error: unknown): LocalVoiceRecorderError {
  if (error instanceof LocalVoiceRecorderError) return error;
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String(error.name)
      : "";

  if (name === "NotAllowedError") {
    return new LocalVoiceRecorderError("permission_denied");
  }
  if (name === "SecurityError") {
    return new LocalVoiceRecorderError("permission_blocked");
  }
  if (
    name === "NotFoundError" ||
    name === "NotReadableError" ||
    name === "OverconstrainedError"
  ) {
    return new LocalVoiceRecorderError("device_unavailable");
  }
  return new LocalVoiceRecorderError("unknown");
}

function chooseMimeType(
  MediaRecorderConstructor: typeof MediaRecorder,
): string | undefined {
  if (typeof MediaRecorderConstructor.isTypeSupported !== "function") {
    return undefined;
  }
  return MIME_TYPE_CANDIDATES.find((candidate) =>
    MediaRecorderConstructor.isTypeSupported(candidate),
  );
}

async function requestMicrophone(input: {
  readonly mediaDevices: Pick<MediaDevices, "getUserMedia">;
  readonly permissionTimeoutMs: number;
  readonly signal?: AbortSignal;
  readonly setTimeout: (
    callback: () => void,
    delayMs: number,
  ) => ReturnType<typeof globalThis.setTimeout>;
  readonly clearTimeout: (
    timeoutId: ReturnType<typeof globalThis.setTimeout>,
  ) => void;
}): Promise<MediaStream> {
  if (input.signal?.aborted === true) {
    throw new LocalVoiceRecorderError("cancelled");
  }

  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
  let abortHandler: (() => void) | undefined;
  const request = input.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = input.setTimeout(() => {
      reject(new LocalVoiceRecorderError("permission_timeout"));
    }, input.permissionTimeoutMs);
  });
  const aborted = new Promise<never>((_, reject) => {
    if (input.signal === undefined) return;
    abortHandler = () => {
      reject(new LocalVoiceRecorderError("cancelled"));
    };
    input.signal.addEventListener("abort", abortHandler, { once: true });
  });

  try {
    return await Promise.race([request, timeout, aborted]);
  } catch (error) {
    if (
      error instanceof LocalVoiceRecorderError &&
      (error.code === "cancelled" || error.code === "permission_timeout")
    ) {
      void request.then(stopTracks).catch(() => undefined);
    }
    throw mapNativeError(error);
  } finally {
    if (timeoutId !== undefined) input.clearTimeout(timeoutId);
    if (abortHandler !== undefined) {
      input.signal?.removeEventListener("abort", abortHandler);
    }
  }
}

export function createBrowserLocalVoiceRecorder(
  options: BrowserLocalVoiceRecorderOptions = {},
  dependencies: BrowserLocalVoiceRecorderDependencies = {},
): LocalVoiceRecorder {
  const maxDurationMs = options.maxDurationMs ?? MAX_LOCAL_VOICE_DURATION_MS;
  const permissionTimeoutMs =
    options.permissionTimeoutMs ?? LOCAL_VOICE_PERMISSION_TIMEOUT_MS;
  const now = dependencies.now ?? (() => performance.now());
  const scheduleTimeout =
    dependencies.setTimeout ??
    ((callback, delayMs) => globalThis.setTimeout(callback, delayMs));
  const cancelTimeout =
    dependencies.clearTimeout ??
    ((timeoutId) => globalThis.clearTimeout(timeoutId));
  const getMediaDevices =
    dependencies.getMediaDevices ??
    (() =>
      typeof navigator === "undefined"
        ? null
        : (navigator.mediaDevices ?? null));
  const getMediaRecorder =
    dependencies.getMediaRecorder ??
    (() =>
      typeof MediaRecorder === "undefined" ? null : globalThis.MediaRecorder);

  return {
    async start({ signal } = {}): Promise<ActiveLocalVoiceRecording> {
      const mediaDevices = getMediaDevices();
      const MediaRecorderConstructor = getMediaRecorder();
      if (
        mediaDevices === null ||
        typeof mediaDevices.getUserMedia !== "function" ||
        MediaRecorderConstructor === null
      ) {
        throw new LocalVoiceRecorderError("unsupported");
      }

      const stream = await requestMicrophone({
        mediaDevices,
        permissionTimeoutMs,
        ...(signal === undefined ? {} : { signal }),
        setTimeout: scheduleTimeout,
        clearTimeout: cancelTimeout,
      });
      if (signal?.aborted === true) {
        stopTracks(stream);
        throw new LocalVoiceRecorderError("cancelled");
      }

      let recorder: MediaRecorder;
      try {
        const mimeType = chooseMimeType(MediaRecorderConstructor);
        recorder = new MediaRecorderConstructor(
          stream,
          mimeType === undefined ? undefined : { mimeType },
        );
      } catch {
        stopTracks(stream);
        throw new LocalVoiceRecorderError("unsupported");
      }

      const chunks: Blob[] = [];
      const startedAt = now();
      let stopReason: StopReason = null;
      let settled = false;
      let stopRequested = false;
      const timerState: {
        finalization?: ReturnType<typeof globalThis.setTimeout>;
        limit?: ReturnType<typeof globalThis.setTimeout>;
      } = {};
      let tracksReleased = false;
      let resolveCompletion!: (capture: LocalVoiceCapture) => void;
      let rejectCompletion!: (error: LocalVoiceRecorderError) => void;

      const completion = new Promise<LocalVoiceCapture>((resolve, reject) => {
        resolveCompletion = resolve;
        rejectCompletion = reject;
      });

      const onDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      const trackInterruptionHandlers = new Map<MediaStreamTrack, () => void>();

      const releaseTracks = () => {
        if (tracksReleased) return;
        tracksReleased = true;
        stopTracks(stream);
      };

      const cleanup = () => {
        if (timerState.finalization !== undefined) {
          cancelTimeout(timerState.finalization);
        }
        if (timerState.limit !== undefined) cancelTimeout(timerState.limit);
        recorder.removeEventListener("dataavailable", onDataAvailable);
        recorder.removeEventListener("error", onRecorderError);
        recorder.removeEventListener("stop", onRecorderStop);
        if (signal !== undefined) {
          signal.removeEventListener("abort", onAbort);
        }
        for (const [track, handler] of trackInterruptionHandlers) {
          track.removeEventListener("ended", handler);
          track.removeEventListener("mute", handler);
        }
        releaseTracks();
      };

      const finishWithError = (code: LocalVoiceRecorderErrorCode) => {
        if (settled) return;
        settled = true;
        cleanup();
        rejectCompletion(new LocalVoiceRecorderError(code));
      };

      const requestStop = () => {
        if (settled) return;
        if (stopRequested) return;
        if (recorder.state === "inactive") {
          finishWithError(errorCodeForStopReason(stopReason));
          return;
        }
        try {
          stopRequested = true;
          recorder.stop();
          if (settled) return;
          releaseTracks();
          timerState.finalization = scheduleTimeout(() => {
            finishWithError(errorCodeForStopReason(stopReason));
          }, STOP_FINALIZATION_TIMEOUT_MS);
        } catch {
          finishWithError("unknown");
        }
      };

      function onRecorderError() {
        if (settled) return;
        stopReason = "error";
        requestStop();
      }

      function onRecorderStop() {
        if (settled) return;
        if (
          stopReason === "cancelled" ||
          stopReason === "interrupted" ||
          stopReason === "error" ||
          stopReason === null
        ) {
          finishWithError(errorCodeForStopReason(stopReason));
          return;
        }

        const mimeType =
          recorder.mimeType ||
          chunks.find(({ type }) => type !== "")?.type ||
          "audio/webm";
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size === 0) {
          finishWithError("empty_recording");
          return;
        }

        settled = true;
        cleanup();
        resolveCompletion({
          blob,
          durationMs: Math.min(maxDurationMs, Math.max(0, now() - startedAt)),
          stoppedByLimit: stopReason === "limit",
        });
      }

      function onAbort() {
        if (settled) return;
        stopReason = "cancelled";
        requestStop();
      }

      recorder.addEventListener("dataavailable", onDataAvailable);
      recorder.addEventListener("error", onRecorderError);
      recorder.addEventListener("stop", onRecorderStop);
      if (signal !== undefined) {
        signal.addEventListener("abort", onAbort, { once: true });
      }
      for (const track of stream.getTracks()) {
        const handler = () => {
          if (settled || tracksReleased) return;
          if (
            stopReason === null ||
            stopReason === "limit" ||
            stopReason === "manual"
          ) {
            stopReason = "interrupted";
          }
          requestStop();
        };
        trackInterruptionHandlers.set(track, handler);
        track.addEventListener("ended", handler, { once: true });
        track.addEventListener("mute", handler, { once: true });
      }

      if (
        stream
          .getTracks()
          .some((track) => track.muted || track.readyState === "ended")
      ) {
        settled = true;
        cleanup();
        throw new LocalVoiceRecorderError("interrupted");
      }

      try {
        recorder.start(250);
      } catch {
        settled = true;
        cleanup();
        throw new LocalVoiceRecorderError("unknown");
      }

      if (!settled) {
        timerState.limit = scheduleTimeout(() => {
          if (settled || stopReason !== null) return;
          stopReason = "limit";
          requestStop();
        }, maxDurationMs);
      }

      return {
        completion,
        startedAt,
        cancel() {
          if (settled) return;
          if (
            stopReason === null ||
            stopReason === "limit" ||
            stopReason === "manual"
          ) {
            stopReason = "cancelled";
          }
          requestStop();
        },
        interrupt() {
          if (settled) return;
          if (
            stopReason === null ||
            stopReason === "limit" ||
            stopReason === "manual"
          ) {
            stopReason = "interrupted";
          }
          requestStop();
        },
        stop() {
          if (!settled && stopReason === null) {
            stopReason = "manual";
            requestStop();
          }
          return completion;
        },
      };
    },
  };
}
