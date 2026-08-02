import {
  PUBLIC_AUDIO_MAX_BYTES,
  publicAudioAssetSchema,
  type PublicAudioAsset,
} from "@thainaute/content/public";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ensureMobilePublicAudioCached,
  MobilePublicAudioCacheError,
  type MobilePublicAudioCachePorts,
} from "../lib/mobile-public-audio-cache";

const ASSET_ID = "10000000-0000-4000-8000-000000000005";
const EXPECTED_HASH = "a".repeat(64);
const OTHER_HASH = "b".repeat(64);
const EXPECTED_ETAG = `"sha256-${EXPECTED_HASH}"`;
const AUDIO_BYTES = new Uint8Array([1, 2, 3, 4]);
const CORRUPT_BYTES = new Uint8Array([4, 3, 2, 1]);
const CACHE_ROOT = "file:///private/cache/public-audio/";
const FINAL_URI = `${CACHE_ROOT}${EXPECTED_HASH}.wav`;
const NOW_MS = Date.parse("2026-08-02T12:00:00.000Z");

function audioAsset(
  overrides: Partial<PublicAudioAsset> = {},
): PublicAudioAsset {
  return publicAudioAssetSchema.parse({
    assetId: ASSET_ID,
    variant: "natural",
    mimeType: "audio/wav",
    sha256: EXPECTED_HASH,
    byteLength: AUDIO_BYTES.byteLength,
    durationMs: 320,
    ...overrides,
  });
}

class FakeAudioCachePorts implements MobilePublicAudioCachePorts {
  readonly files = new Map<string, Uint8Array<ArrayBuffer>>();
  readonly modificationTimes = new Map<string, number>();
  readonly requestCalls: {
    readonly accept: string;
    readonly ifNoneMatch?: string;
    readonly maximumBytes: number;
    readonly url: string;
  }[] = [];
  readonly writeCalls: string[] = [];
  readonly moveCalls: {
    readonly destinationUri: string;
    readonly sourceUri: string;
  }[] = [];
  readonly removeCalls: string[] = [];
  directoryCalls = 0;
  networkBytes: Uint8Array<ArrayBuffer> | null = AUDIO_BYTES;
  networkError = false;
  moveError = false;
  moveRaceCreatesValidFinal = false;
  onRequest: (() => void) | undefined;
  retainOnRemove = false;
  randomId = "40000000-0000-4000-8000-000000000001";
  responseContentLength: string | null | undefined;
  responseContentType: string | null | undefined;
  responseEtag: string | null = EXPECTED_ETAG;
  responseRedirected = false;
  responseStatus: number | undefined;
  responseUrl: string | undefined;

  readonly nowMs = (): number => NOW_MS;

  readonly crypto = {
    randomId: () => this.randomId,
    sha256Hex: async (bytes: Uint8Array<ArrayBuffer>): Promise<string> =>
      bytes.every((value, index) => value === AUDIO_BYTES[index]) &&
      bytes.byteLength === AUDIO_BYTES.byteLength
        ? EXPECTED_HASH
        : OTHER_HASH,
  };

  readonly fileSystem = {
    ensureCacheDirectory: async (): Promise<void> => {
      this.directoryCalls += 1;
    },
    listCacheFiles: async () =>
      [...this.files.keys()].map((uri) => ({
        modificationTimeMs: this.modificationTimes.get(uri) ?? null,
        name: uri.slice(CACHE_ROOT.length),
        uri,
      })),
    resolveCacheFile: (name: string): string => `${CACHE_ROOT}${name}`,
    stat: async (
      uri: string,
    ): Promise<{ readonly exists: boolean; readonly size: number | null }> => {
      const bytes = this.files.get(uri);
      return {
        exists: bytes !== undefined,
        size: bytes?.byteLength ?? null,
      };
    },
    readBytes: async (uri: string): Promise<Uint8Array<ArrayBuffer>> => {
      const bytes = this.files.get(uri);
      if (bytes === undefined) throw new Error("missing");
      return bytes;
    },
    writeBytes: async (
      uri: string,
      bytes: Uint8Array<ArrayBuffer>,
    ): Promise<void> => {
      this.writeCalls.push(uri);
      if (this.files.has(uri)) throw new Error("destination exists");
      this.files.set(uri, bytes);
      this.modificationTimes.set(uri, NOW_MS);
    },
    move: async (sourceUri: string, destinationUri: string): Promise<void> => {
      this.moveCalls.push({ sourceUri, destinationUri });
      if (this.moveRaceCreatesValidFinal) {
        this.files.set(destinationUri, AUDIO_BYTES);
        throw new Error("destination exists");
      }
      if (this.moveError || this.files.has(destinationUri)) {
        throw new Error("move failed");
      }
      const bytes = this.files.get(sourceUri);
      if (bytes === undefined) throw new Error("source missing");
      this.files.set(destinationUri, bytes);
      this.files.delete(sourceUri);
      this.modificationTimes.delete(sourceUri);
    },
    remove: async (uri: string): Promise<void> => {
      this.removeCalls.push(uri);
      if (!this.retainOnRemove) {
        this.files.delete(uri);
        this.modificationTimes.delete(uri);
      }
    },
  };

  readonly network = {
    request: async (input: {
      readonly accept: PublicAudioAsset["mimeType"];
      readonly ifNoneMatch?: string;
      readonly maximumBytes: number;
      readonly signal?: AbortSignal;
      readonly url: string;
    }) => {
      this.requestCalls.push({
        accept: input.accept,
        maximumBytes: input.maximumBytes,
        url: input.url,
        ...(input.ifNoneMatch === undefined
          ? {}
          : { ifNoneMatch: input.ifNoneMatch }),
      });
      this.onRequest?.();
      if (this.networkError) throw new Error("network token=secret");
      const status =
        this.responseStatus ?? (input.ifNoneMatch === undefined ? 200 : 304);
      return {
        bytes: status === 200 ? this.networkBytes : null,
        contentLength:
          this.responseContentLength === undefined
            ? status === 200
              ? String(AUDIO_BYTES.byteLength)
              : null
            : this.responseContentLength,
        contentType:
          this.responseContentType === undefined
            ? status === 200
              ? "audio/wav"
              : null
            : this.responseContentType,
        etag: this.responseEtag,
        redirected: this.responseRedirected,
        responseUrl: this.responseUrl ?? input.url,
        status,
      };
    },
  };
}

function cache(
  ports: FakeAudioCachePorts,
  input: {
    readonly asset?: PublicAudioAsset;
    readonly development?: boolean;
    readonly signal?: AbortSignal;
    readonly url?: string;
  } = {},
) {
  return ensureMobilePublicAudioCached(
    {
      asset: input.asset ?? audioAsset(),
      development: input.development ?? false,
      url: input.url ?? "https://api.thainaute.invalid/audio/opaque",
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    },
    ports,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("cache audio public mobile", () => {
  it("réutilise un final vérifié uniquement après un 304 et un ETag exacts", async () => {
    const ports = new FakeAudioCachePorts();
    ports.files.set(FINAL_URI, AUDIO_BYTES);

    await expect(cache(ports)).resolves.toEqual({
      asset: audioAsset(),
      uri: FINAL_URI,
      reused: true,
    });
    expect(ports.requestCalls).toEqual([
      {
        accept: "audio/wav",
        ifNoneMatch: EXPECTED_ETAG,
        maximumBytes: AUDIO_BYTES.byteLength,
        url: "https://api.thainaute.invalid/audio/opaque",
      },
    ]);
    expect(ports.writeCalls).toHaveLength(0);
    expect(ports.moveCalls).toHaveLength(0);
  });

  it("écrit le corps 200 borné dans un temporaire avant promotion", async () => {
    const ports = new FakeAudioCachePorts();

    await expect(cache(ports)).resolves.toEqual({
      asset: audioAsset(),
      uri: FINAL_URI,
      reused: false,
    });
    expect(ports.requestCalls[0]).not.toHaveProperty("ifNoneMatch");
    expect(ports.writeCalls[0]).toMatch(/\.part$/u);
    expect(ports.moveCalls).toHaveLength(1);
    expect(ports.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
    expect([...ports.files.keys()].some((uri) => uri.endsWith(".part"))).toBe(
      false,
    );
  });

  it("ne conditionne pas la requête si le final local est corrompu", async () => {
    const ports = new FakeAudioCachePorts();
    ports.files.set(FINAL_URI, CORRUPT_BYTES);

    await expect(cache(ports)).resolves.toMatchObject({ reused: false });
    expect(ports.removeCalls).toContain(FINAL_URI);
    expect(ports.requestCalls[0]).not.toHaveProperty("ifNoneMatch");
    expect(ports.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
  });

  it("purge un cache révoqué et ne sert jamais 404, 503 ou une panne réseau", async () => {
    const revoked = new FakeAudioCachePorts();
    revoked.files.set(FINAL_URI, AUDIO_BYTES);
    revoked.responseStatus = 404;
    await expect(cache(revoked)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(revoked.files.has(FINAL_URI)).toBe(false);

    const unavailable = new FakeAudioCachePorts();
    unavailable.files.set(FINAL_URI, AUDIO_BYTES);
    unavailable.responseStatus = 503;
    await expect(cache(unavailable)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(unavailable.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);

    const offline = new FakeAudioCachePorts();
    offline.files.set(FINAL_URI, AUDIO_BYTES);
    offline.networkError = true;
    await expect(cache(offline)).rejects.toMatchObject({
      code: "download_failed",
    });
    expect(offline.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
  });

  it("refuse un 304 impossible à matérialiser ou au mauvais ETag", async () => {
    const missing = new FakeAudioCachePorts();
    missing.responseStatus = 304;
    await expect(cache(missing)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(missing.requestCalls[0]).not.toHaveProperty("ifNoneMatch");

    const wrongEtag = new FakeAudioCachePorts();
    wrongEtag.files.set(FINAL_URI, AUDIO_BYTES);
    wrongEtag.responseEtag = `"sha256-${OTHER_HASH}"`;
    await expect(cache(wrongEtag)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(wrongEtag.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
  });

  it("refuse toute redirection, même vers une autre URL HTTPS", async () => {
    const ports = new FakeAudioCachePorts();
    ports.files.set(FINAL_URI, AUDIO_BYTES);
    ports.responseRedirected = true;
    ports.responseUrl = "https://cdn.thainaute.invalid/audio/opaque";

    await expect(cache(ports)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(ports.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
  });

  it("exige ETag, type MIME et Content-Length exacts sur un 200", async () => {
    const wrongEtag = new FakeAudioCachePorts();
    wrongEtag.responseEtag = null;
    await expect(cache(wrongEtag)).rejects.toMatchObject({
      code: "revalidation_failed",
    });

    const wrongMime = new FakeAudioCachePorts();
    wrongMime.responseContentType = "audio/wav; charset=binary";
    await expect(cache(wrongMime)).rejects.toMatchObject({
      code: "revalidation_failed",
    });

    const wrongLength = new FakeAudioCachePorts();
    wrongLength.responseContentLength = null;
    await expect(cache(wrongLength)).rejects.toMatchObject({
      code: "revalidation_failed",
    });
    expect(wrongEtag.writeCalls).toHaveLength(0);
    expect(wrongMime.writeCalls).toHaveLength(0);
    expect(wrongLength.writeCalls).toHaveLength(0);
  });

  it("refuse taille, limite reçue et empreinte divergentes", async () => {
    const wrongSize = new FakeAudioCachePorts();
    wrongSize.networkBytes = new Uint8Array([1, 2]);
    await expect(cache(wrongSize)).rejects.toMatchObject({
      code: "size_mismatch",
    });

    const oversizedBody = new FakeAudioCachePorts();
    oversizedBody.networkBytes = new Uint8Array([1, 2, 3, 4, 5]);
    await expect(cache(oversizedBody)).rejects.toMatchObject({
      code: "size_mismatch",
    });
    expect(oversizedBody.requestCalls[0]?.maximumBytes).toBe(4);

    const wrongDigest = new FakeAudioCachePorts();
    wrongDigest.networkBytes = CORRUPT_BYTES;
    await expect(cache(wrongDigest)).rejects.toMatchObject({
      code: "digest_mismatch",
    });
    expect(wrongSize.files.size).toBe(0);
    expect(oversizedBody.files.size).toBe(0);
    expect(wrongDigest.files.size).toBe(0);
  });

  it("valide le même corps 200 tout en conservant un final identique", async () => {
    const ports = new FakeAudioCachePorts();
    ports.files.set(FINAL_URI, AUDIO_BYTES);
    ports.responseStatus = 200;

    await expect(cache(ports)).resolves.toMatchObject({ reused: true });
    expect(ports.writeCalls).toHaveLength(1);
    expect(ports.moveCalls).toHaveLength(0);
    expect([...ports.files.keys()]).toEqual([FINAL_URI]);
  });

  it("réutilise le final valide posé par une promotion concurrente", async () => {
    const ports = new FakeAudioCachePorts();
    ports.moveRaceCreatesValidFinal = true;

    await expect(cache(ports)).resolves.toMatchObject({
      uri: FINAL_URI,
      reused: true,
    });
    expect(ports.files.get(FINAL_URI)).toEqual(AUDIO_BYTES);
    expect([...ports.files.keys()].some((uri) => uri.endsWith(".part"))).toBe(
      false,
    );
  });

  it("échoue fermé si la promotion casse sans final concurrent", async () => {
    const ports = new FakeAudioCachePorts();
    ports.moveError = true;

    await expect(cache(ports)).rejects.toMatchObject({
      code: "cache_write_failed",
    });
    expect(ports.files.size).toBe(0);
  });

  it("fait primer une panne de nettoyage d’un temporaire", async () => {
    const ports = new FakeAudioCachePorts();
    ports.moveError = true;
    ports.retainOnRemove = true;

    await expect(cache(ports)).rejects.toMatchObject({
      code: "cache_cleanup_failed",
    });
    expect([...ports.files.keys()].some((uri) => uri.endsWith(".part"))).toBe(
      true,
    );
  });

  it("nettoie les .part anciens sans toucher aux téléchargements récents", async () => {
    const ports = new FakeAudioCachePorts();
    const stale = `${CACHE_ROOT}${OTHER_HASH}.old-id.part`;
    const recent = `${CACHE_ROOT}${OTHER_HASH}.recent-id.part`;
    ports.files.set(stale, CORRUPT_BYTES);
    ports.files.set(recent, CORRUPT_BYTES);
    ports.modificationTimes.set(stale, NOW_MS - 25 * 60 * 60 * 1000);
    ports.modificationTimes.set(recent, NOW_MS - 60 * 60 * 1000);

    await expect(cache(ports)).resolves.toMatchObject({ uri: FINAL_URI });
    expect(ports.files.has(stale)).toBe(false);
    expect(ports.files.get(recent)).toEqual(CORRUPT_BYTES);
  });

  it("autorise HTTP uniquement sur loopback ou LAN privé en développement", async () => {
    const productionLan = new FakeAudioCachePorts();
    await expect(
      cache(productionLan, { url: "http://192.168.1.20:3000/audio" }),
    ).rejects.toMatchObject({ code: "insecure_url" });

    const publicDevelopment = new FakeAudioCachePorts();
    await expect(
      cache(publicDevelopment, {
        development: true,
        url: "http://8.8.8.8:3000/audio",
      }),
    ).rejects.toMatchObject({ code: "insecure_url" });

    const emulatorDevelopment = new FakeAudioCachePorts();
    await expect(
      cache(emulatorDevelopment, {
        development: true,
        url: "http://10.0.2.2:3000/audio",
      }),
    ).resolves.toMatchObject({ uri: FINAL_URI });

    const lanDevelopment = new FakeAudioCachePorts();
    await expect(
      cache(lanDevelopment, {
        development: true,
        url: "http://192.168.1.20:3000/audio",
      }),
    ).resolves.toMatchObject({ uri: FINAL_URI });
  });

  it("annule avant ou pendant le réseau et refuse un manifeste hors limite", async () => {
    const aborted = new FakeAudioCachePorts();
    const controller = new AbortController();
    controller.abort();
    await expect(
      cache(aborted, { signal: controller.signal }),
    ).rejects.toMatchObject({ code: "download_cancelled" });
    expect(aborted.requestCalls).toHaveLength(0);

    const cancelledDuringRequest = new FakeAudioCachePorts();
    const requestController = new AbortController();
    cancelledDuringRequest.onRequest = () => requestController.abort();
    await expect(
      cache(cancelledDuringRequest, { signal: requestController.signal }),
    ).rejects.toMatchObject({ code: "download_cancelled" });
    expect(cancelledDuringRequest.files.size).toBe(0);

    const oversized = new FakeAudioCachePorts();
    await expect(
      cache(oversized, {
        asset: {
          ...audioAsset(),
          byteLength: PUBLIC_AUDIO_MAX_BYTES + 1,
        },
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
    expect(oversized.directoryCalls).toBe(0);
  });

  it("ne révèle ni URL, chemin, empreinte ni erreur native", async () => {
    const ports = new FakeAudioCachePorts();
    ports.networkError = true;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const url = "https://api.thainaute.invalid/audio?token=tres-secret";

    const error = await cache(ports, { url }).catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(MobilePublicAudioCacheError);
    expect(String(error)).not.toContain("tres-secret");
    expect(String(error)).not.toContain(EXPECTED_HASH);
    expect(String(error)).not.toContain("file://");
    expect(String(error)).not.toContain("network token");
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
