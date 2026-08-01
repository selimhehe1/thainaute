import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_VOICE_MAX_DURATION_MS,
  LocalVoiceDeletionError,
  LocalVoiceEpochGate,
  LocalVoiceRecorderTerminalLatch,
  LocalVoiceResourceError,
  assertLocalVoiceFileUri,
  classifyLocalVoiceRecorderTerminal,
  deleteLocalVoiceResource,
  getLocalVoiceRemainingMs,
  isFinitePositiveAudioDuration,
  isMpeg4AudioHeader,
  releaseLocalVoicePlayer,
  sanitizeLocalVoiceRecorderUri,
} from "../lib/local-voice-practice";

afterEach(() => {
  vi.useRealTimers();
});

describe("local voice recorder terminal status", () => {
  it("keeps only a clean native completion", () => {
    expect(
      classifyLocalVoiceRecorderTerminal({
        hasError: false,
        isFinished: true,
        mediaServicesDidReset: false,
      }),
    ).toBe("completed");
  });

  it("gives an error or media reset precedence over completion", () => {
    expect(
      classifyLocalVoiceRecorderTerminal({
        hasError: true,
        isFinished: true,
        mediaServicesDidReset: false,
      }),
    ).toBe("discard");
    expect(
      classifyLocalVoiceRecorderTerminal({
        hasError: false,
        isFinished: true,
        mediaServicesDidReset: true,
      }),
    ).toBe("discard");
  });

  it("ignores non-terminal native updates", () => {
    expect(
      classifyLocalVoiceRecorderTerminal({
        hasError: false,
        isFinished: false,
      }),
    ).toBeNull();
  });
});

describe("local voice operation epochs", () => {
  it("accepts only the latest operation while the gate is active", () => {
    const gate = new LocalVoiceEpochGate();
    const first = gate.begin();
    const second = gate.begin();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(gate.isCurrent(first!)).toBe(false);
    expect(gate.isCurrent(second!)).toBe(true);
  });

  it("blocks new work after invalidation until an explicit activation", () => {
    const gate = new LocalVoiceEpochGate();
    const stale = gate.begin();

    gate.invalidate();

    expect(gate.isCurrent(stale!)).toBe(false);
    expect(gate.begin()).toBeNull();

    gate.activate();
    const current = gate.begin();
    expect(current).not.toBeNull();
    expect(gate.isCurrent(current!)).toBe(true);
  });

  it("supersedes pending work and reopens an inactive gate", () => {
    const gate = new LocalVoiceEpochGate();
    const stale = gate.begin();

    gate.invalidate();
    gate.supersede();
    const current = gate.begin();

    expect(gate.isCurrent(stale!)).toBe(false);
    expect(current).not.toBeNull();
    expect(gate.isCurrent(current!)).toBe(true);
  });
});

describe("local voice native terminal latch", () => {
  it("waits for a clean terminal completion and preserves its URI", async () => {
    vi.useFakeTimers();
    const latch = new LocalVoiceRecorderTerminalLatch();
    const result = latch.wait({ settleMs: 25, timeoutMs: 1_000 });

    latch.observe({
      hasError: false,
      isFinished: false,
      url: null,
    });
    await vi.advanceTimersByTimeAsync(200);
    let resolved = false;
    void result.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    latch.observe({
      hasError: false,
      isFinished: true,
      url: "file:///private/cache/voice.m4a",
    });
    await vi.advanceTimersByTimeAsync(25);

    await expect(result).resolves.toEqual({
      outcome: "completed",
      url: "file:///private/cache/voice.m4a",
    });
  });

  it("lets an error arriving during settlement override completion", async () => {
    vi.useFakeTimers();
    const latch = new LocalVoiceRecorderTerminalLatch();
    const result = latch.wait({ settleMs: 50, timeoutMs: 1_000 });

    latch.observe({
      hasError: false,
      isFinished: true,
      url: "file:///private/cache/voice.m4a",
    });
    await vi.advanceTimersByTimeAsync(25);
    latch.observe({
      hasError: true,
      isFinished: true,
      url: "file:///private/cache/voice.m4a",
    });
    await vi.advanceTimersByTimeAsync(50);

    await expect(result).resolves.toEqual({ outcome: "discard", url: null });
  });

  it("never downgrades a discard when a later completion arrives", async () => {
    vi.useFakeTimers();
    const latch = new LocalVoiceRecorderTerminalLatch();

    latch.observe({
      hasError: true,
      isFinished: false,
      url: null,
    });
    latch.observe({
      hasError: false,
      isFinished: true,
      url: "file:///private/cache/late.m4a",
    });
    const result = latch.wait({ settleMs: 10, timeoutMs: 1_000 });
    await vi.advanceTimersByTimeAsync(10);

    await expect(result).resolves.toEqual({ outcome: "discard", url: null });
  });

  it("fails closed on timeout when no terminal event arrives", async () => {
    vi.useFakeTimers();
    const latch = new LocalVoiceRecorderTerminalLatch();
    const result = latch.wait({ settleMs: 25, timeoutMs: 500 });

    await vi.advanceTimersByTimeAsync(500);

    await expect(result).resolves.toBeNull();
  });
});

describe("local voice file boundary", () => {
  const cacheDirectoryUri = "file:///private/cache/";

  it("accepts an absolute private file URI", () => {
    expect(
      assertLocalVoiceFileUri(
        "file:///private/cache/voice.m4a",
        cacheDirectoryUri,
      ),
    ).toBe("file:///private/cache/voice.m4a");
  });

  it("accepts a normalized descendant but returns the original safe URI", () => {
    const uri = "file:///private/cache/practice/../voice%20one.m4a";

    expect(assertLocalVoiceFileUri(uri, cacheDirectoryUri)).toBe(uri);
  });

  it.each([null, "", "   ", "\n\t"])(
    "treats an absent or blank recorder URI as no recording: %s",
    (uri) => {
      expect(sanitizeLocalVoiceRecorderUri(uri, cacheDirectoryUri)).toBeNull();
    },
  );

  it("sanitizes a valid recorder URI through the private cache boundary", () => {
    expect(
      sanitizeLocalVoiceRecorderUri(
        "file:///private/cache/voice.m4a",
        cacheDirectoryUri,
      ),
    ).toBe("file:///private/cache/voice.m4a");
  });

  it.each([
    " file:///private/cache/voice.m4a",
    "file:///private/cache/voice.m4a ",
    "\tfile:///private/cache/voice.m4a\n",
  ])("rejects an otherwise safe URI surrounded by whitespace: %s", (uri) => {
    expect(() => sanitizeLocalVoiceRecorderUri(uri, cacheDirectoryUri)).toThrow(
      LocalVoiceResourceError,
    );
  });

  it.each([
    "https://example.test/voice.m4a",
    "content://media/external/voice.m4a",
    "data:audio/m4a;base64,AAAA",
    "file://remote-host/cache/voice.m4a",
    "not-a-uri",
  ])(
    "rejects a non-private URI without exposing it in the error: %s",
    (uri) => {
      expect(() => assertLocalVoiceFileUri(uri, cacheDirectoryUri)).toThrow(
        LocalVoiceResourceError,
      );

      try {
        assertLocalVoiceFileUri(uri, cacheDirectoryUri);
      } catch (error) {
        expect(String(error)).not.toContain(uri);
      }
    },
  );

  it.each([
    "file:///private/cache",
    "file:///private/cache-sibling/voice.m4a",
    "file:///private/cache/../documents/voice.m4a",
    "file:///private/cache/%2e%2e/documents/voice.m4a",
    "file:///private/cache/sub/%2e%2e/%2e%2e/documents/voice.m4a",
    "file:///private/cache/%2F..%2Fdocuments/voice.m4a",
    "file:///private/cache/voice%00.m4a",
    "file:///private/cache/voice%ZZ.m4a",
    "file:///private/cache/voice.m4a?keep=true",
    "file:///private/cache/voice.m4a#fragment",
  ])("rejects a cache escape or a non-file target: %s", (uri) => {
    expect(() => assertLocalVoiceFileUri(uri, cacheDirectoryUri)).toThrow(
      LocalVoiceResourceError,
    );
  });

  it("applies the same boundary when sanitizing a recorder URI", () => {
    expect(() =>
      sanitizeLocalVoiceRecorderUri(
        "file:///private/documents/voice.m4a",
        cacheDirectoryUri,
      ),
    ).toThrow(LocalVoiceResourceError);
  });
});

describe("local voice audio validation", () => {
  it("recognizes a structurally plausible MPEG-4 file type box", () => {
    expect(
      isMpeg4AudioHeader(
        Uint8Array.from([
          0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41,
          0x20,
        ]),
      ),
    ).toBe(true);
  });

  it.each([
    Uint8Array.from([]),
    Uint8Array.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]),
    Uint8Array.from([
      0x00, 0x00, 0x00, 0x07, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
    ]),
    Uint8Array.from([
      0x00, 0x00, 0x00, 0x18, 0x6d, 0x6f, 0x6f, 0x76, 0x4d, 0x34, 0x41, 0x20,
    ]),
  ])("rejects a missing or invalid MPEG-4 file type box", (bytes) => {
    expect(isMpeg4AudioHeader(bytes)).toBe(false);
  });

  it.each([Number.NaN, Number.NEGATIVE_INFINITY, 0, -0.001])(
    "rejects an unusable decoded duration: %s",
    (seconds) => {
      expect(isFinitePositiveAudioDuration(seconds)).toBe(false);
    },
  );

  it.each([Number.MIN_VALUE, 0.001, 1, 20])(
    "accepts a finite positive decoded duration: %s",
    (seconds) => {
      expect(isFinitePositiveAudioDuration(seconds)).toBe(true);
    },
  );
});

describe("local voice duration", () => {
  it("never grants more than twenty seconds", () => {
    expect(getLocalVoiceRemainingMs(Number.NaN)).toBe(
      LOCAL_VOICE_MAX_DURATION_MS,
    );
    expect(getLocalVoiceRemainingMs(-1)).toBe(LOCAL_VOICE_MAX_DURATION_MS);
    expect(getLocalVoiceRemainingMs(1_234.9)).toBe(18_766);
    expect(getLocalVoiceRemainingMs(LOCAL_VOICE_MAX_DURATION_MS)).toBe(0);
    expect(getLocalVoiceRemainingMs(25_000)).toBe(0);
  });
});

describe("local voice deletion", () => {
  it("pauses and releases the player before deleting the file", () => {
    const calls: string[] = [];
    let exists = true;

    deleteLocalVoiceResource({
      uri: "file:///private/cache/voice.m4a",
      cacheDirectoryUri: "file:///private/cache/",
      player: {
        pause: () => calls.push("pause"),
        remove: () => calls.push("remove"),
      },
      createFile: () => ({
        get exists() {
          return exists;
        },
        delete: () => {
          calls.push("delete");
          exists = false;
        },
      }),
    });

    expect(calls).toEqual(["pause", "remove", "delete"]);
  });

  it("still releases when pausing an interrupted player fails", () => {
    const remove = vi.fn();
    const deleteFile = vi.fn();
    let exists = true;

    deleteLocalVoiceResource({
      uri: "file:///private/cache/voice.m4a",
      cacheDirectoryUri: "file:///private/cache/",
      player: {
        pause: () => {
          throw new Error("interrupted");
        },
        remove,
      },
      createFile: () => ({
        get exists() {
          return exists;
        },
        delete: () => {
          deleteFile();
          exists = false;
        },
      }),
    });

    expect(remove).toHaveBeenCalledOnce();
    expect(deleteFile).toHaveBeenCalledOnce();
  });

  it("does not delete when player release fails", () => {
    const createFile = vi.fn();

    expect(() =>
      deleteLocalVoiceResource({
        uri: "file:///private/cache/voice.m4a",
        cacheDirectoryUri: "file:///private/cache/",
        player: {
          pause: vi.fn(),
          remove: () => {
            throw new Error("release failed");
          },
        },
        createFile,
      }),
    ).toThrow("release failed");
    expect(createFile).not.toHaveBeenCalled();
  });

  it("does not release or delete an untrusted URI", () => {
    const player = { pause: vi.fn(), remove: vi.fn() };
    const createFile = vi.fn();

    expect(() =>
      deleteLocalVoiceResource({
        uri: "https://example.test/voice.m4a",
        cacheDirectoryUri: "file:///private/cache/",
        player,
        createFile,
      }),
    ).toThrow(LocalVoiceResourceError);
    expect(player.pause).not.toHaveBeenCalled();
    expect(player.remove).not.toHaveBeenCalled();
    expect(createFile).not.toHaveBeenCalled();
  });

  it("fails closed when deletion cannot be confirmed", () => {
    expect(() =>
      deleteLocalVoiceResource({
        uri: "file:///private/cache/voice.m4a",
        cacheDirectoryUri: "file:///private/cache/",
        player: null,
        createFile: () => ({ exists: true, delete: vi.fn() }),
      }),
    ).toThrow(LocalVoiceDeletionError);
  });

  it("treats an already absent cache file as deleted", () => {
    const deleteFile = vi.fn();

    expect(() =>
      deleteLocalVoiceResource({
        uri: "file:///private/cache/voice.m4a",
        cacheDirectoryUri: "file:///private/cache/",
        player: null,
        createFile: () => ({ exists: false, delete: deleteFile }),
      }),
    ).not.toThrow();
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it("offers an explicit release helper for cleanup without deletion", () => {
    const pause = vi.fn();
    const remove = vi.fn();

    releaseLocalVoicePlayer({ pause, remove });

    expect(pause).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
  });
});
