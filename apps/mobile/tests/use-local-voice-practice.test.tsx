// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalVoicePractice } from "../lib/use-local-voice-practice";

const testState = vi.hoisted(() => ({
  appState: "active",
  appBlurListener: null as (() => void) | null,
  appFocusListener: null as (() => void) | null,
  appStateListener: null as ((state: string) => void) | null,
  createAudioPlayer: vi.fn(),
  files: new Map<
    string,
    {
      deleteCalls: number;
      deleteError?: Error;
      exists: boolean;
      header: Uint8Array;
      retainAfterDelete?: boolean;
      size: number;
    }
  >(),
  modelStatus: {
    didJustFinish: false,
    error: null as Error | null,
    mediaServicesDidReset: false,
    playing: false,
  },
  recorder: {
    getStatus: vi.fn(),
    isRecording: false,
    prepareToRecordAsync: vi.fn(),
    record: vi.fn(),
    stop: vi.fn(),
    uri: null as string | null,
  },
  recorderListener: null as ((status: unknown) => void) | null,
  recorderState: {
    durationMillis: 0,
    isRecording: false,
    mediaServicesDidReset: false,
  },
  requestRecordingPermissionsAsync: vi.fn(),
  setAudioModeAsync: vi.fn(),
  setIsAudioActiveAsync: vi.fn(),
}));

function createPlayer() {
  const currentStatus = {
    didJustFinish: false,
    duration: 1,
    error: null as Error | null,
    isLoaded: true,
    mediaServicesDidReset: false,
    playing: false,
  };
  const listeners = new Set<(status: typeof currentStatus) => void>();
  const player = {
    addListener: vi.fn(
      (_event: string, listener: (status: typeof currentStatus) => void) => {
        listeners.add(listener);
        return { remove: () => listeners.delete(listener) };
      },
    ),
    currentStatus,
    emitStatus(next: Partial<typeof currentStatus>) {
      Object.assign(currentStatus, next);
      for (const listener of listeners) listener(currentStatus);
    },
    pause: vi.fn(),
    play: vi.fn(),
    remove: vi.fn(),
    seekTo: vi.fn().mockResolvedValue(undefined),
  };
  return player;
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

vi.mock("expo-audio", () => ({
  AudioModule: {
    requestRecordingPermissionsAsync:
      testState.requestRecordingPermissionsAsync,
  },
  RecordingPresets: { HIGH_QUALITY: {} },
  createAudioPlayer: testState.createAudioPlayer,
  setAudioModeAsync: testState.setAudioModeAsync,
  setIsAudioActiveAsync: testState.setIsAudioActiveAsync,
  useAudioPlayerStatus: () => testState.modelStatus,
  useAudioRecorder: (
    _options: unknown,
    listener: (status: unknown) => void,
  ) => {
    testState.recorderListener = listener;
    return testState.recorder;
  },
  useAudioRecorderState: () => testState.recorderState,
}));

vi.mock("expo-file-system", () => {
  class MockFile {
    readonly uri: string;

    constructor(uri: string) {
      this.uri = uri;
    }

    get exists(): boolean {
      return testState.files.get(this.uri)?.exists ?? false;
    }

    get size(): number {
      return testState.files.get(this.uri)?.size ?? 0;
    }

    delete(): void {
      const file = testState.files.get(this.uri);
      if (file === undefined) return;
      file.deleteCalls += 1;
      if (file.deleteError !== undefined) throw file.deleteError;
      if (file.retainAfterDelete !== true) file.exists = false;
    }

    open() {
      const file = testState.files.get(this.uri);
      return {
        close: vi.fn(),
        readBytes: vi.fn((length: number) =>
          (file?.header ?? new Uint8Array()).slice(0, length),
        ),
      };
    }
  }

  return {
    File: MockFile,
    FileMode: { ReadOnly: "r" },
    Paths: { cache: { uri: "file:///private/cache/" } },
  };
});

vi.mock("expo-router", async () => {
  const { useEffect } = await import("react");

  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      useEffect(effect, [effect]);
    },
  };
});

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(
      (event: string, listener: ((state: string) => void) | (() => void)) => {
        if (event === "change") {
          testState.appStateListener = listener as (state: string) => void;
        } else if (event === "blur") {
          testState.appBlurListener = listener as () => void;
        } else if (event === "focus") {
          testState.appFocusListener = listener as () => void;
        }
        return {
          remove: vi.fn(() => {
            if (event === "change" && testState.appStateListener === listener) {
              testState.appStateListener = null;
            } else if (
              event === "blur" &&
              testState.appBlurListener === listener
            ) {
              testState.appBlurListener = null;
            } else if (
              event === "focus" &&
              testState.appFocusListener === listener
            ) {
              testState.appFocusListener = null;
            }
          }),
        };
      },
    ),
    get currentState() {
      return testState.appState;
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  testState.appState = "active";
  testState.appBlurListener = null;
  testState.appFocusListener = null;
  testState.appStateListener = null;
  testState.files.clear();
  testState.modelStatus.didJustFinish = false;
  testState.modelStatus.error = null;
  testState.modelStatus.mediaServicesDidReset = false;
  testState.modelStatus.playing = false;
  testState.recorder.isRecording = false;
  testState.recorder.uri = null;
  testState.recorderState.durationMillis = 0;
  testState.recorderState.isRecording = false;
  testState.recorderState.mediaServicesDidReset = false;
  testState.recorder.getStatus.mockImplementation(() => {
    return {
      hasError: false,
      isFinished: false,
      isRecording: testState.recorder.isRecording,
      url: testState.recorder.uri,
    };
  });
  testState.recorder.prepareToRecordAsync.mockResolvedValue(undefined);
  testState.recorder.record.mockImplementation(() => {
    testState.recorder.isRecording = true;
    testState.recorderState.isRecording = true;
  });
  testState.recorder.stop.mockImplementation(async () => {
    testState.recorder.isRecording = false;
    testState.recorderState.isRecording = false;
  });
  testState.requestRecordingPermissionsAsync.mockResolvedValue({
    canAskAgain: true,
    granted: true,
    status: "granted",
  });
  testState.setAudioModeAsync.mockResolvedValue(undefined);
  testState.setIsAudioActiveAsync.mockResolvedValue(undefined);
  testState.createAudioPlayer.mockImplementation(createPlayer);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

type StartBoundary = "activation" | "audio-mode" | "permission" | "prepare";

function deferStartBoundary(boundary: StartBoundary) {
  const deferred = createDeferred<unknown>();
  const provisionalUri =
    boundary === "prepare" ? "file:///private/cache/preparing.m4a" : null;

  if (provisionalUri !== null) {
    testState.recorder.uri = provisionalUri;
    testState.files.set(provisionalUri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 1,
    });
  }

  if (boundary === "permission") {
    testState.requestRecordingPermissionsAsync.mockReturnValue(
      deferred.promise,
    );
  } else if (boundary === "activation") {
    testState.setIsAudioActiveAsync.mockImplementation((active: boolean) =>
      active ? deferred.promise : Promise.resolve(),
    );
  } else if (boundary === "audio-mode") {
    testState.setAudioModeAsync.mockImplementation(
      (mode: { allowsRecording?: boolean }) =>
        mode.allowsRecording ? deferred.promise : Promise.resolve(),
    );
  } else {
    testState.recorder.prepareToRecordAsync.mockReturnValue(deferred.promise);
  }

  return {
    async waitUntilReached(): Promise<void> {
      if (boundary === "permission") {
        await waitFor(() =>
          expect(
            testState.requestRecordingPermissionsAsync,
          ).toHaveBeenCalledOnce(),
        );
      } else if (boundary === "activation") {
        await waitFor(() =>
          expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(true),
        );
      } else if (boundary === "audio-mode") {
        await waitFor(() =>
          expect(testState.setAudioModeAsync).toHaveBeenCalledWith(
            expect.objectContaining({ allowsRecording: true }),
          ),
        );
      } else {
        await waitFor(() =>
          expect(
            testState.recorder.prepareToRecordAsync,
          ).toHaveBeenCalledOnce(),
        );
      }
    },
    resolve(): void {
      deferred.resolve(
        boundary === "permission"
          ? { canAskAgain: true, granted: true, status: "granted" }
          : undefined,
      );
    },
    provisionalUri,
  };
}

async function beginRecording(
  startRecording: () => Promise<void>,
): Promise<void> {
  await act(async () => {
    await startRecording();
  });
  expect(testState.recorder.record).toHaveBeenCalledOnce();
}

function emitRecorderStatus(status: {
  hasError: boolean;
  isFinished: boolean;
  isRecording: boolean;
  mediaServicesDidReset?: boolean;
  url: string | null;
}): void {
  const listener = testState.recorderListener;
  if (listener === null) throw new Error("missing recorder listener");
  listener(status);
}

describe("useLocalVoicePractice", () => {
  it("keeps microphone permission behind the explicit recording action", () => {
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );

    expect(result.current.hasRecording).toBe(false);
    expect(result.current.isBusy).toBe(false);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.remainingSeconds).toBe(20);
    expect(testState.requestRecordingPermissionsAsync).not.toHaveBeenCalled();
    expect(testState.recorder.prepareToRecordAsync).not.toHaveBeenCalled();
    expect(testState.recorder.record).not.toHaveBeenCalled();
    expect(testState.setAudioModeAsync).not.toHaveBeenCalled();
    expect(testState.setIsAudioActiveAsync).not.toHaveBeenCalled();
  });

  it.each([
    { canAskAgain: true, expectedMessage: /réessayer/i },
    { canAskAgain: false, expectedMessage: /réglages/i },
  ])(
    "does not record after a denied permission (canAskAgain=$canAskAgain)",
    async ({ canAskAgain, expectedMessage }) => {
      testState.requestRecordingPermissionsAsync.mockResolvedValue({
        canAskAgain,
        granted: false,
        status: "denied",
      });
      const modelPlayer = createPlayer();
      const { result } = renderHook(() =>
        useLocalVoicePractice(modelPlayer as never),
      );

      await act(async () => {
        await result.current.startRecording();
      });

      expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledOnce();
      expect(testState.recorder.prepareToRecordAsync).not.toHaveBeenCalled();
      expect(testState.recorder.record).not.toHaveBeenCalled();
      expect(result.current.error).toMatch(expectedMessage);
    },
  );

  it.each<StartBoundary>(["permission", "activation", "audio-mode", "prepare"])(
    "cancels safely when the app backgrounds during the %s await",
    async (boundary) => {
      const pending = deferStartBoundary(boundary);
      const modelPlayer = createPlayer();
      const { result } = renderHook(() =>
        useLocalVoicePractice(modelPlayer as never),
      );
      let startPromise!: Promise<void>;

      act(() => {
        startPromise = result.current.startRecording();
      });
      await pending.waitUntilReached();

      act(() => {
        testState.appState = "background";
        testState.appStateListener?.("background");
      });
      await act(async () => {
        pending.resolve();
        await startPromise;
      });

      expect(testState.recorder.record).not.toHaveBeenCalled();
      expect(testState.recorder.stop).toHaveBeenCalled();
      expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(false);
      expect(result.current.isRecording).toBe(false);
      if (pending.provisionalUri !== null) {
        expect(testState.files.get(pending.provisionalUri)).toMatchObject({
          deleteCalls: 1,
          exists: false,
        });
      }
    },
  );

  it("does not start a pending permission request while Android stays blurred", async () => {
    const pending = deferStartBoundary("permission");
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    let startPromise!: Promise<void>;

    act(() => {
      startPromise = result.current.startRecording();
    });
    await pending.waitUntilReached();
    act(() => testState.appBlurListener?.());
    await act(async () => {
      pending.resolve();
      await startPromise;
    });

    expect(testState.recorder.record).not.toHaveBeenCalled();
    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(false);
    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledOnce();

    act(() => testState.appFocusListener?.());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledTimes(2);
    expect(testState.recorder.record).toHaveBeenCalledOnce();

    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await waitFor(() => expect(result.current.isRecording).toBe(false));
  });

  it("discards an active take on Android blur and requires focus before retry", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/android-blur.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);

    act(() => testState.appBlurListener?.());
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledOnce();
    expect(testState.recorder.record).toHaveBeenCalledOnce();

    act(() => testState.appFocusListener?.());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.recorder.record).toHaveBeenCalledTimes(2);

    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });
  });

  it.each<StartBoundary>(["permission", "activation", "audio-mode", "prepare"])(
    "cancels safely when the screen unmounts during the %s await",
    async (boundary) => {
      const pending = deferStartBoundary(boundary);
      const modelPlayer = createPlayer();
      const { result, unmount } = renderHook(() =>
        useLocalVoicePractice(modelPlayer as never),
      );
      let startPromise!: Promise<void>;

      act(() => {
        startPromise = result.current.startRecording();
      });
      await pending.waitUntilReached();
      unmount();

      await act(async () => {
        pending.resolve();
        await startPromise;
      });

      expect(testState.recorder.record).not.toHaveBeenCalled();
      expect(testState.recorder.stop).toHaveBeenCalled();
      expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(false);
      if (pending.provisionalUri !== null) {
        expect(testState.files.get(pending.provisionalUri)).toMatchObject({
          deleteCalls: 1,
          exists: false,
        });
      }
    },
  );

  it("waits for a late native terminal event before discarding the take", async () => {
    vi.useFakeTimers();
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopSettled = false;
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
      void stopPromise.then(() => {
        stopSettled = true;
      });
    });
    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(stopSettled).toBe(false);

    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });

    expect(stopSettled).toBe(true);
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.error).toMatch(/interruption audio/i);
  });

  it("times out fail-closed, deletes the file and poisons the recorder", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/timeout.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2_000);
      await stopPromise;
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.error).toMatch(/finalisation native/i);

    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledOnce();
    expect(testState.recorder.record).toHaveBeenCalledOnce();
    expect(result.current.error).toMatch(/rouvrez/i);
  });

  it("times out even when the native stop promise never settles", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/hung-stop.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    testState.recorder.stop.mockReturnValue(new Promise<void>(() => undefined));
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
      await stopPromise;
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(false);
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.error).toMatch(/finalisation native/i);

    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.error).toMatch(/rouvrez/i);
  });

  it("discards a take when the native recorder stops before its limit", async () => {
    vi.useFakeTimers();
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);

    await act(async () => {
      testState.recorderState.durationMillis = 1_000;
      testState.recorderState.isRecording = false;
      rerender();
      await Promise.resolve();
    });
    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.error).toMatch(/interruption audio/i);
  });

  it("treats an early successful native terminal event as an interruption", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/early-terminal.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });

    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.notice).toMatch(/interrompue et supprimée/i);
  });

  it("rejects a successful terminal emitted reentrantly by record()", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/reentrant-terminal.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    testState.recorder.record.mockImplementation(() => {
      testState.recorder.isRecording = true;
      testState.recorderState.isRecording = true;
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    let startPromise!: Promise<void>;

    act(() => {
      startPromise = result.current.startRecording();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await startPromise;
    });

    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.notice).toMatch(/interrompue et supprimée/i);
  });

  it("never stores an empty terminal URI as a deletion handle", async () => {
    vi.useFakeTimers();
    testState.recorder.uri = "";
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: "",
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });

    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.error).toMatch(/sans produire de fichier/i);
  });

  it("serializes A/B playback so the latest target is the only one played", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/voice.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: Uint8Array.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
      ]),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });

    expect(result.current.canPlayRecording).toBe(true);
    const recordingPlayer = testState.createAudioPlayer.mock.results[0]!
      .value as ReturnType<typeof createPlayer>;
    modelPlayer.play.mockClear();
    modelPlayer.seekTo.mockClear();
    recordingPlayer.play.mockClear();
    recordingPlayer.seekTo.mockClear();
    testState.setIsAudioActiveAsync.mockClear();

    const firstActivation = createDeferred<void>();
    testState.setIsAudioActiveAsync.mockImplementation((active: boolean) =>
      active ? firstActivation.promise : Promise.resolve(),
    );
    let modelPromise!: Promise<void>;
    let recordingPromise!: Promise<void>;
    act(() => {
      modelPromise = result.current.playModel();
      recordingPromise = result.current.playRecording();
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledTimes(2);
    await act(async () => {
      firstActivation.resolve();
      await Promise.all([modelPromise, recordingPromise]);
    });

    expect(modelPlayer.play).not.toHaveBeenCalled();
    expect(recordingPlayer.play).toHaveBeenCalledOnce();
    expect(result.current.playback).toEqual({
      paused: false,
      target: "recording",
    });

    act(() => result.current.pausePlayback());
    await act(async () => {
      await Promise.resolve();
    });
    modelPlayer.play.mockClear();
    recordingPlayer.play.mockClear();
    testState.setIsAudioActiveAsync.mockClear();
    const secondActivation = createDeferred<void>();
    testState.setIsAudioActiveAsync.mockImplementation((active: boolean) =>
      active ? secondActivation.promise : Promise.resolve(),
    );
    act(() => {
      recordingPromise = result.current.playRecording();
      modelPromise = result.current.playModel();
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledTimes(2);
    await act(async () => {
      secondActivation.resolve();
      await Promise.all([recordingPromise, modelPromise]);
    });

    expect(recordingPlayer.play).not.toHaveBeenCalled();
    expect(modelPlayer.play).toHaveBeenCalledOnce();
    expect(result.current.playback).toEqual({
      paused: false,
      target: "model",
    });
  });

  it("keeps a finalized take on Android blur and rejects a stale native resume", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/blur-retained.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: Uint8Array.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
      ]),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });

    const recordingPlayer = testState.createAudioPlayer.mock.results[0]!
      .value as ReturnType<typeof createPlayer>;
    await act(async () => {
      await result.current.playRecording();
    });
    act(() => recordingPlayer.emitStatus({ playing: true }));
    expect(result.current.playback).toEqual({
      paused: false,
      target: "recording",
    });

    act(() => testState.appBlurListener?.());
    await act(async () => {
      await Promise.resolve();
    });
    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 0,
      exists: true,
    });
    expect(result.current.hasRecording).toBe(true);
    expect(result.current.canPlayRecording).toBe(true);
    expect(result.current.playback).toBeNull();

    recordingPlayer.pause.mockClear();
    act(() => recordingPlayer.emitStatus({ playing: true }));
    expect(recordingPlayer.pause).toHaveBeenCalledOnce();
    expect(result.current.playback).toBeNull();

    const permission = createDeferred<{
      canAskAgain: boolean;
      granted: boolean;
      status: string;
    }>();
    testState.requestRecordingPermissionsAsync.mockReturnValue(
      permission.promise,
    );
    act(() => testState.appFocusListener?.());
    let retryPromise!: Promise<void>;
    act(() => {
      retryPromise = result.current.startRecording();
    });
    expect(testState.requestRecordingPermissionsAsync).toHaveBeenCalledTimes(2);
    act(() => testState.appBlurListener?.());
    await act(async () => {
      permission.resolve({
        canAskAgain: true,
        granted: true,
        status: "granted",
      });
      await retryPromise;
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 0,
      exists: true,
    });
    expect(result.current.hasRecording).toBe(true);
    expect(result.current.canPlayRecording).toBe(true);
  });

  it("re-pauses a model player that native code resumes without user action", async () => {
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await act(async () => {
      await result.current.playModel();
    });
    act(() => {
      testState.modelStatus.playing = true;
      rerender();
    });

    act(() => testState.appBlurListener?.());
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      testState.modelStatus.playing = false;
      rerender();
    });
    modelPlayer.pause.mockClear();
    act(() => {
      testState.modelStatus.playing = true;
      rerender();
    });

    expect(modelPlayer.pause).toHaveBeenCalledOnce();
    expect(result.current.playback).toBeNull();
  });

  it("leaves the audio session inactive when playback activation resolves after backgrounding", async () => {
    const activation = createDeferred<void>();
    let nativeAudioActive = false;
    testState.setIsAudioActiveAsync.mockImplementation(
      async (active: boolean) => {
        if (active) {
          await activation.promise;
          nativeAudioActive = true;
        } else {
          nativeAudioActive = false;
        }
      },
    );
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    let playPromise!: Promise<void>;

    act(() => {
      playPromise = result.current.playModel();
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(true);
    act(() => {
      testState.appState = "background";
      testState.appStateListener?.("background");
    });
    await act(async () => {
      activation.resolve();
      await playPromise;
    });

    expect(modelPlayer.play).not.toHaveBeenCalled();
    expect(nativeAudioActive).toBe(false);
  });

  it("does not let an old playback activation disable a new recording after resume", async () => {
    vi.useFakeTimers();
    const oldPlaybackActivation = createDeferred<void>();
    let activationCalls = 0;
    let nativeAudioActive = false;
    testState.setIsAudioActiveAsync.mockImplementation(
      async (active: boolean) => {
        if (!active) {
          nativeAudioActive = false;
          return;
        }

        activationCalls += 1;
        if (activationCalls === 1) await oldPlaybackActivation.promise;
        nativeAudioActive = true;
      },
    );
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    let oldPlayPromise!: Promise<void>;

    act(() => {
      oldPlayPromise = result.current.playModel();
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenNthCalledWith(1, true);
    act(() => {
      testState.appState = "background";
      testState.appStateListener?.("background");
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(testState.setIsAudioActiveAsync).toHaveBeenNthCalledWith(2, false);

    act(() => {
      testState.appState = "active";
      testState.appStateListener?.("active");
    });
    await beginRecording(result.current.startRecording);
    expect(testState.setIsAudioActiveAsync).toHaveBeenNthCalledWith(3, true);
    expect(nativeAudioActive).toBe(true);

    await act(async () => {
      oldPlaybackActivation.resolve();
      await oldPlayPromise;
    });

    expect(modelPlayer.play).not.toHaveBeenCalled();
    expect(testState.recorder.record).toHaveBeenCalledOnce();
    expect(result.current.isRecording).toBe(true);
    expect(nativeAudioActive).toBe(true);
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledTimes(3);

    let stopPromise!: Promise<void>;
    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });
  });

  it("releases a pending recording player exactly once when validation is cancelled", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/pending.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: Uint8Array.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
      ]),
      size: 12,
    });
    const pendingPlayer = createPlayer();
    pendingPlayer.currentStatus.isLoaded = false;
    pendingPlayer.currentStatus.duration = 0;
    testState.createAudioPlayer.mockReturnValue(pendingPlayer);
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });
    expect(testState.createAudioPlayer).toHaveBeenCalledOnce();

    act(() => {
      testState.appState = "background";
      testState.appStateListener?.("background");
    });
    await act(async () => {
      await stopPromise;
    });

    expect(pendingPlayer.remove).toHaveBeenCalledOnce();
    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.canPlayRecording).toBe(false);
  });

  it.each([
    { fileState: "absent", playerState: "ready" },
    { fileState: "empty", playerState: "ready" },
    { fileState: "invalid-header", playerState: "ready" },
    { fileState: "valid", playerState: "decoder-error" },
    { fileState: "valid", playerState: "zero-duration" },
  ] as const)(
    "keeps B unavailable for $fileState file and $playerState decoder",
    async ({ fileState, playerState }) => {
      vi.useFakeTimers();
      const uri = "file:///private/cache/unusable.m4a";
      const validHeader = Uint8Array.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
      ]);
      testState.recorder.uri = uri;
      if (fileState !== "absent") {
        testState.files.set(uri, {
          deleteCalls: 0,
          exists: true,
          header:
            fileState === "invalid-header" ? new Uint8Array(12) : validHeader,
          size: fileState === "empty" ? 0 : 12,
        });
      }

      const candidatePlayer = createPlayer();
      if (playerState === "decoder-error") {
        candidatePlayer.currentStatus.error = new Error("decode failed");
      } else if (playerState === "zero-duration") {
        candidatePlayer.currentStatus.duration = 0;
      }
      testState.createAudioPlayer.mockReturnValue(candidatePlayer);

      const modelPlayer = createPlayer();
      const { result } = renderHook(() =>
        useLocalVoicePractice(modelPlayer as never),
      );
      await beginRecording(result.current.startRecording);
      let stopPromise!: Promise<void>;

      act(() => {
        stopPromise = result.current.stopRecording();
      });
      await act(async () => {
        await Promise.resolve();
      });
      act(() => {
        emitRecorderStatus({
          hasError: false,
          isFinished: true,
          isRecording: false,
          url: uri,
        });
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_600);
        await stopPromise;
      });

      expect(result.current.canPlayRecording).toBe(false);
      expect(result.current.hasRecording).toBe(false);
      expect(result.current.error).toMatch(/absente|vide|illisible/i);
      const file = testState.files.get(uri);
      if (file !== undefined) {
        expect(file).toMatchObject({ deleteCalls: 1, exists: false });
      }
      if (fileState === "valid") {
        expect(candidatePlayer.remove).toHaveBeenCalledOnce();
      } else {
        expect(testState.createAudioPlayer).not.toHaveBeenCalled();
      }
    },
  );

  it("annule une autorisation en attente quand la frontière de session change", async () => {
    const pending = deferStartBoundary("permission");
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(
      ({ revision }) => useLocalVoicePractice(modelPlayer as never, revision),
      { initialProps: { revision: 0 } },
    );
    let startPromise!: Promise<void>;

    act(() => {
      startPromise = result.current.startRecording();
    });
    await pending.waitUntilReached();
    rerender({ revision: 1 });
    await act(async () => {
      pending.resolve();
      await startPromise;
    });

    expect(testState.recorder.record).not.toHaveBeenCalled();
    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    expect(testState.setIsAudioActiveAsync).toHaveBeenCalledWith(false);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.notice).toMatch(
      /session a changé.*n’est plus accessible/i,
    );
  });

  it("reste silencieux quand la frontière change sans activité vocale", async () => {
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(
      ({ revision }) => useLocalVoicePractice(modelPlayer as never, revision),
      { initialProps: { revision: 0 } },
    );

    rerender({ revision: 1 });
    await act(async () => {
      await Promise.resolve();
    });

    expect(testState.recorder.stop).not.toHaveBeenCalled();
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.notice).toBe("");
    expect(result.current.error).toBe("");
  });

  it("arrête et purge une prise active quand la frontière de session change", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/session-active.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(
      ({ revision }) => useLocalVoicePractice(modelPlayer as never, revision),
      { initialProps: { revision: 0 } },
    );
    await beginRecording(result.current.startRecording);

    rerender({ revision: 1 });
    await act(async () => {
      await Promise.resolve();
    });
    expect(testState.recorder.stop).toHaveBeenCalledOnce();
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: false,
    });
    expect(result.current.hasRecording).toBe(false);
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.notice).toMatch(
      /session a changé.*n’est plus accessible/i,
    );

    await act(async () => {
      await result.current.startRecording();
    });
    expect(testState.recorder.record).toHaveBeenCalledTimes(2);
    act(() => {
      emitRecorderStatus({
        hasError: true,
        isFinished: true,
        isRecording: false,
        url: null,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
    });
  });

  it("interdit toute relecture si la purge de session échoue", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/session-undeletable.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: Uint8Array.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
      ]),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result, rerender } = renderHook(
      ({ revision }) => useLocalVoicePractice(modelPlayer as never, revision),
      { initialProps: { revision: 0 } },
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });
    expect(result.current.canPlayRecording).toBe(true);
    const recordingPlayer = testState.createAudioPlayer.mock.results[0]!
      .value as ReturnType<typeof createPlayer>;
    const file = testState.files.get(uri)!;
    file.deleteError = new Error("busy");

    rerender({ revision: 1 });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(file).toMatchObject({ deleteCalls: 1, exists: true });
    expect(recordingPlayer.remove).toHaveBeenCalledOnce();
    expect(result.current.hasRecording).toBe(true);
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.error).toMatch(/suppression locale n’a pas abouti/i);
    expect(result.current.notice).toMatch(
      /session a changé.*n’est plus accessible/i,
    );

    await act(async () => {
      await result.current.playRecording();
    });
    expect(recordingPlayer.play).not.toHaveBeenCalled();

    delete file.deleteError;
    await act(async () => {
      expect(await result.current.deleteRecording()).toBe(true);
    });
    expect(file).toMatchObject({ deleteCalls: 2, exists: false });
  });

  it("keeps a failed invalid-take deletion visible and retryable", async () => {
    vi.useFakeTimers();
    const uri = "file:///private/cache/undeletable-invalid.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      deleteError: new Error("busy"),
      exists: true,
      header: new Uint8Array(12),
      size: 12,
    });
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );
    await beginRecording(result.current.startRecording);
    let stopPromise!: Promise<void>;

    act(() => {
      stopPromise = result.current.stopRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      emitRecorderStatus({
        hasError: false,
        isFinished: true,
        isRecording: false,
        url: uri,
      });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(75);
      await stopPromise;
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: true,
    });
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(true);
    expect(result.current.error).toMatch(/suppression locale n’a pas abouti/i);
    expect(result.current.error).not.toMatch(/elle a été supprimée/i);
  });

  it("does not claim cleanup after a failed preparing-file deletion", async () => {
    const uri = "file:///private/cache/undeletable-preparing.m4a";
    testState.recorder.uri = uri;
    testState.files.set(uri, {
      deleteCalls: 0,
      exists: true,
      header: new Uint8Array(),
      retainAfterDelete: true,
      size: 1,
    });
    testState.recorder.prepareToRecordAsync.mockRejectedValue(
      new Error("prepare failed"),
    );
    const modelPlayer = createPlayer();
    const { result } = renderHook(() =>
      useLocalVoicePractice(modelPlayer as never),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(testState.files.get(uri)).toMatchObject({
      deleteCalls: 1,
      exists: true,
    });
    expect(result.current.canPlayRecording).toBe(false);
    expect(result.current.hasRecording).toBe(true);
    expect(result.current.error).toMatch(/suppression locale n’a pas abouti/i);
    expect(result.current.error).not.toMatch(/aucune prise incomplète/i);
  });
});
