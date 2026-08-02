import type { PublicAudioAsset } from "@thainaute/content/public";
import { fetch as expoFetch, type FetchRequestInit } from "expo/fetch";
import { CryptoDigestAlgorithm, digest, randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";

import {
  ensureMobilePublicAudioCached,
  type MobilePublicAudioCachePorts,
  type MobilePublicAudioCacheResult,
} from "./mobile-public-audio-cache";

const CACHE_DIRECTORY_NAME = "thainaute-public-audio-v1";
const CACHE_FILE_NAME_PATTERN = /^[0-9A-Za-z.-]{1,160}$/u;
const PUBLIC_AUDIO_TIMEOUT_MS = 30_000;

type HardenedRequestInit = FetchRequestInit & {
  readonly redirect: "error";
};

type StreamedAudioResponse = Awaited<ReturnType<typeof expoFetch>>;

function bytesToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function cancelBody(response: StreamedAudioResponse): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Le corps ne contient aucune donnée utile hors 200.
  }
}

async function readBoundedBytes(
  response: StreamedAudioResponse,
  maximumBytes: number,
  signal: AbortSignal | undefined,
): Promise<Uint8Array<ArrayBuffer>> {
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength !== null &&
    /^\d+$/u.test(declaredLength) &&
    Number(declaredLength) > maximumBytes
  ) {
    await cancelBody(response);
    throw new Error("oversized response");
  }

  const reader = response.body?.getReader();
  if (reader === undefined) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maximumBytes) {
      throw new Error("oversized response");
    }
    return bytes;
  }

  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  try {
    for (;;) {
      if (signal?.aborted === true) throw new Error("aborted");
      const chunk = await reader.read();
      if (chunk.done) break;
      if (chunk.value.byteLength > maximumBytes - total) {
        await reader.cancel();
        throw new Error("oversized response");
      }
      const copy = new Uint8Array(chunk.value.byteLength);
      copy.set(chunk.value);
      chunks.push(copy);
      total += copy.byteLength;
    }
  } catch (error) {
    try {
      await reader.cancel();
    } catch {
      // L’erreur d’origine reste volontairement opaque au cœur du cache.
    }
    throw error;
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Adaptateur natif injecté à la logique testable du cache audio. */
export function createExpoPublicAudioCachePorts(): MobilePublicAudioCachePorts {
  const directory = new Directory(Paths.cache, CACHE_DIRECTORY_NAME);

  function file(uri: string): File {
    return new File(uri);
  }

  return {
    crypto: {
      randomId: randomUUID,
      async sha256Hex(bytes) {
        return bytesToHex(await digest(CryptoDigestAlgorithm.SHA256, bytes));
      },
    },
    fileSystem: {
      async ensureCacheDirectory() {
        directory.create({ idempotent: true, intermediates: true });
      },
      async listCacheFiles() {
        return directory
          .list()
          .filter((entry): entry is File => entry instanceof File)
          .map((entry) => ({
            modificationTimeMs: entry.modificationTime,
            name: entry.name,
            uri: entry.uri,
          }));
      },
      resolveCacheFile(name) {
        if (!CACHE_FILE_NAME_PATTERN.test(name)) {
          throw new Error("invalid cache file name");
        }
        return new File(directory, name).uri;
      },
      async stat(uri) {
        const target = file(uri);
        return {
          exists: target.exists,
          size: target.exists ? target.size : null,
        };
      },
      async readBytes(uri) {
        return file(uri).bytes();
      },
      async writeBytes(uri, bytes) {
        const target = file(uri);
        target.create({ overwrite: false });
        target.write(bytes);
      },
      async move(sourceUri, destinationUri) {
        await file(sourceUri).move(file(destinationUri), { overwrite: false });
      },
      async remove(uri) {
        const target = file(uri);
        if (target.exists) target.delete();
      },
    },
    network: {
      async request(input) {
        const requestInit: HardenedRequestInit = {
          method: "GET",
          headers: {
            Accept: input.accept,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            ...(input.ifNoneMatch === undefined
              ? {}
              : { "If-None-Match": input.ifNoneMatch }),
          },
          credentials: "omit",
          redirect: "error",
          ...(input.signal === undefined ? {} : { signal: input.signal }),
        };
        const response = await expoFetch(input.url, requestInit);
        const bytes =
          response.status === 200
            ? await readBoundedBytes(response, input.maximumBytes, input.signal)
            : null;
        if (response.status !== 200) await cancelBody(response);
        return {
          bytes,
          contentLength: response.headers.get("content-length"),
          contentType: response.headers.get("content-type"),
          etag: response.headers.get("etag"),
          redirected: response.redirected,
          responseUrl: response.url,
          status: response.status,
        };
      },
    },
    nowMs: Date.now,
  };
}

/**
 * Entrée de production mobile. Le HTTP clair n’est accepté que vers une
 * boucle locale et uniquement dans un build de développement.
 */
export function ensureExpoPublicAudioCached(input: {
  readonly asset: PublicAudioAsset;
  readonly signal?: AbortSignal;
  readonly url: string;
}): Promise<MobilePublicAudioCacheResult> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (input.signal?.aborted === true) controller.abort();
  else input.signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, PUBLIC_AUDIO_TIMEOUT_MS);

  return ensureMobilePublicAudioCached(
    {
      asset: input.asset,
      development: process.env.NODE_ENV === "development",
      url: input.url,
      signal: controller.signal,
    },
    createExpoPublicAudioCachePorts(),
  ).finally(() => {
    clearTimeout(timeout);
    input.signal?.removeEventListener("abort", abort);
  });
}
