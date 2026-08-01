import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createBrowserLocalVoiceRecorder,
  LocalVoiceRecorderError,
} from "../lib/client/local-voice-recorder";

class FakeTrack extends EventTarget {
  public muted = false;
  public readyState: MediaStreamTrackState = "live";
  public readonly stop = vi.fn();

  public interrupt(): void {
    this.readyState = "ended";
    this.dispatchEvent(new Event("ended"));
  }

  public mute(): void {
    this.muted = true;
    this.dispatchEvent(new Event("mute"));
  }
}

class FakeStream {
  public constructor(private readonly tracks: FakeTrack[]) {}

  public getTracks(): FakeTrack[] {
    return this.tracks;
  }
}

class FakeMediaRecorder extends EventTarget {
  public static readonly instances: FakeMediaRecorder[] = [];
  public static deferFinalization = false;

  public static isTypeSupported(type: string): boolean {
    return type === "audio/webm;codecs=opus";
  }

  public readonly mimeType: string;
  public state: RecordingState = "inactive";
  public readonly start = vi.fn(() => {
    this.state = "recording";
  });
  public readonly stop = vi.fn(() => {
    if (this.state === "inactive") throw new DOMException("inactive");
    this.state = "inactive";
    if (FakeMediaRecorder.deferFinalization) return;
    this.finalize();
  });

  public finalize(): void {
    const dataEvent = Object.assign(new Event("dataavailable"), {
      data: new Blob(["fixture-audio"], { type: this.mimeType }),
    });
    this.dispatchEvent(dataEvent);
    this.dispatchEvent(new Event("stop"));
  }

  public constructor(
    public readonly stream: MediaStream,
    options?: MediaRecorderOptions,
  ) {
    super();
    this.mimeType = options?.mimeType ?? "audio/webm";
    FakeMediaRecorder.instances.push(this);
  }
}

function asMediaStream(stream: FakeStream): MediaStream {
  return stream as unknown as MediaStream;
}

function recorderDependencies(input: {
  readonly getUserMedia: () => Promise<MediaStream>;
  readonly now?: () => number;
}) {
  return {
    getMediaDevices: () => ({ getUserMedia: input.getUserMedia }),
    getMediaRecorder: () =>
      FakeMediaRecorder as unknown as typeof MediaRecorder,
    ...(input.now === undefined ? {} : { now: input.now }),
  };
}

beforeEach(() => {
  FakeMediaRecorder.instances.splice(0);
  FakeMediaRecorder.deferFinalization = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("adaptateur MediaRecorder local", () => {
  it("ne demande le microphone qu'au démarrage explicite puis libère les pistes", async () => {
    const track = new FakeTrack();
    const getUserMedia = vi.fn(() =>
      Promise.resolve(asMediaStream(new FakeStream([track]))),
    );
    let now = 100;
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({ getUserMedia, now: () => now }),
    );

    expect(getUserMedia).not.toHaveBeenCalled();
    const active = await recorder.start();
    expect(getUserMedia).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });

    now = 850;
    await expect(active.stop()).resolves.toMatchObject({
      durationMs: 750,
      stoppedByLimit: false,
    });
    expect(track.stop).toHaveBeenCalledOnce();
    expect(FakeMediaRecorder.instances[0]?.start).toHaveBeenCalledWith(250);
  });

  it("expire une permission silencieuse et arrête aussi une piste arrivée tardivement", async () => {
    vi.useFakeTimers();
    const track = new FakeTrack();
    let resolvePermission!: (stream: MediaStream) => void;
    const getUserMedia = vi.fn(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolvePermission = resolve;
        }),
    );
    const recorder = createBrowserLocalVoiceRecorder(
      { permissionTimeoutMs: 50 },
      recorderDependencies({ getUserMedia }),
    );

    const start = recorder.start();
    const rejection = expect(start).rejects.toMatchObject({
      code: "permission_timeout",
    });
    await vi.advanceTimersByTimeAsync(50);
    await rejection;

    resolvePermission(asMediaStream(new FakeStream([track])));
    await vi.runAllTicks();
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("supprime une prise partielle quand la piste est interrompue", async () => {
    const track = new FakeTrack();
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );
    const active = await recorder.start();
    const rejection = expect(active.completion).rejects.toMatchObject({
      code: "interrupted",
    });

    track.interrupt();

    await rejection;
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("supprime une prise partielle quand la piste microphone devient muette", async () => {
    const track = new FakeTrack();
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );
    const active = await recorder.start();
    const rejection = expect(active.completion).rejects.toMatchObject({
      code: "interrupted",
    });

    track.mute();

    await rejection;
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("refuse une piste deja muette avant de demarrer le MediaRecorder", async () => {
    const track = new FakeTrack();
    track.muted = true;
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );

    await expect(recorder.start()).rejects.toMatchObject({
      code: "interrupted",
    });
    expect(track.stop).toHaveBeenCalledOnce();
    expect(FakeMediaRecorder.instances[0]?.start).not.toHaveBeenCalled();
  });

  it("fait primer une interruption sur un arret manuel encore en finalisation", async () => {
    FakeMediaRecorder.deferFinalization = true;
    const track = new FakeTrack();
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );
    const active = await recorder.start();
    const completion = active.stop();
    const rejection = expect(completion).rejects.toMatchObject({
      code: "interrupted",
    });

    active.interrupt();
    FakeMediaRecorder.instances[0]?.finalize();

    await rejection;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(FakeMediaRecorder.instances[0]?.stop).toHaveBeenCalledOnce();
  });

  it("fait primer une annulation sur un arret manuel encore en finalisation", async () => {
    FakeMediaRecorder.deferFinalization = true;
    const track = new FakeTrack();
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );
    const active = await recorder.start();
    const completion = active.stop();
    const rejection = expect(completion).rejects.toMatchObject({
      code: "cancelled",
    });

    active.cancel();
    FakeMediaRecorder.instances[0]?.finalize();

    await rejection;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(FakeMediaRecorder.instances[0]?.stop).toHaveBeenCalledOnce();
  });

  it("fait primer une interruption sur la limite encore en finalisation", async () => {
    vi.useFakeTimers();
    FakeMediaRecorder.deferFinalization = true;
    const track = new FakeTrack();
    const recorder = createBrowserLocalVoiceRecorder(
      { maxDurationMs: 50 },
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
      }),
    );
    const active = await recorder.start();
    const rejection = expect(active.completion).rejects.toMatchObject({
      code: "interrupted",
    });

    await vi.advanceTimersByTimeAsync(50);
    active.interrupt();
    FakeMediaRecorder.instances[0]?.finalize();

    await rejection;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(FakeMediaRecorder.instances[0]?.stop).toHaveBeenCalledOnce();
  });

  it("arrête automatiquement la prise à vingt secondes", async () => {
    vi.useFakeTimers();
    const track = new FakeTrack();
    let now = 0;
    const recorder = createBrowserLocalVoiceRecorder(
      { maxDurationMs: 20_000 },
      recorderDependencies({
        getUserMedia: () =>
          Promise.resolve(asMediaStream(new FakeStream([track]))),
        now: () => now,
      }),
    );
    const active = await recorder.start();
    const completion = expect(active.completion).resolves.toMatchObject({
      durationMs: 20_000,
      stoppedByLimit: true,
    });

    now = 20_000;
    await vi.advanceTimersByTimeAsync(20_000);

    await completion;
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("classe un refus sans exposer le message natif", async () => {
    const denied = Object.assign(new Error("adresse privée sensible"), {
      name: "NotAllowedError",
    });
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () => Promise.reject(denied),
      }),
    );

    await expect(recorder.start()).rejects.toEqual(
      new LocalVoiceRecorderError("permission_denied"),
    );
  });

  it("classe un blocage de sécurité séparément d'un refus", async () => {
    const blocked = Object.assign(new Error("origine privée sensible"), {
      name: "SecurityError",
    });
    const recorder = createBrowserLocalVoiceRecorder(
      {},
      recorderDependencies({
        getUserMedia: () => Promise.reject(blocked),
      }),
    );

    await expect(recorder.start()).rejects.toEqual(
      new LocalVoiceRecorderError("permission_blocked"),
    );
  });
});
