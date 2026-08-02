"use client";

import type { PublicAudioAsset } from "@thainaute/content/public";

import { browserBytesSha256Hex } from "./sha256";

const CACHE_NAME = "thainaute-public-audio-v1";
const PUBLIC_AUDIO_TIMEOUT_MS = 30_000;

export class PublicAudioCacheError extends Error {
  public constructor() {
    super("Le signal audio vérifié est momentanément indisponible.");
    this.name = "PublicAudioCacheError";
  }
}

interface VerifiedAudioBytes {
  readonly bytes: ArrayBuffer;
  readonly mimeType: PublicAudioAsset["mimeType"];
}

export interface PublicAudioCachePorts {
  readonly read: (key: string) => Promise<VerifiedAudioBytes | null>;
  readonly write: (key: string, value: VerifiedAudioBytes) => Promise<void>;
  readonly remove: (key: string) => Promise<void>;
  readonly fetch: (url: string, init: RequestInit) => Promise<Response>;
  readonly sha256Hex: (bytes: ArrayBuffer) => Promise<string>;
  readonly createObjectUrl: (blob: Blob) => string;
  readonly revokeObjectUrl: (url: string) => void;
}

export interface VerifiedWebAudio {
  readonly objectUrl: string;
  readonly revalidated: boolean;
  readonly revoke: () => void;
}

function cacheKey(asset: PublicAudioAsset): string {
  return `sha256:${asset.sha256}`;
}

async function defaultPorts(): Promise<PublicAudioCachePorts> {
  if (
    typeof globalThis.caches === "undefined" ||
    typeof globalThis.fetch !== "function" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new PublicAudioCacheError();
  }
  const cache = await globalThis.caches.open(CACHE_NAME);
  const requestFor = (key: string) =>
    new Request(
      new URL(
        `/__thainaute_cache/audio/${encodeURIComponent(key)}`,
        globalThis.location.origin,
      ),
    );
  return {
    async read(key) {
      const response = await cache.match(requestFor(key));
      if (response === undefined) return null;
      const mimeType = response.headers.get("content-type");
      if (mimeType !== "audio/wav" && mimeType !== "audio/mpeg") return null;
      return { bytes: await response.arrayBuffer(), mimeType };
    },
    async write(key, value) {
      await cache.put(
        requestFor(key),
        new Response(value.bytes, {
          headers: { "Content-Type": value.mimeType },
          status: 200,
        }),
      );
    },
    async remove(key) {
      await cache.delete(requestFor(key));
    },
    fetch: globalThis.fetch.bind(globalThis),
    sha256Hex: browserBytesSha256Hex,
    createObjectUrl: URL.createObjectURL.bind(URL),
    revokeObjectUrl: URL.revokeObjectURL.bind(URL),
  };
}

async function verify(
  value: VerifiedAudioBytes,
  asset: PublicAudioAsset,
  ports: PublicAudioCachePorts,
): Promise<boolean> {
  return (
    value.mimeType === asset.mimeType &&
    value.bytes.byteLength === asset.byteLength &&
    (await ports.sha256Hex(value.bytes)) === asset.sha256
  );
}

function audioEtag(asset: PublicAudioAsset): string {
  return `"sha256-${asset.sha256}"`;
}

function asObjectUrl(
  value: VerifiedAudioBytes,
  revalidated: boolean,
  ports: PublicAudioCachePorts,
): VerifiedWebAudio {
  const objectUrl = ports.createObjectUrl(
    new Blob([value.bytes], { type: value.mimeType }),
  );
  let revoked = false;
  return {
    objectUrl,
    revalidated,
    revoke() {
      if (revoked) return;
      revoked = true;
      ports.revokeObjectUrl(objectUrl);
    },
  };
}

async function readExactResponseBytes(
  response: Response,
  expectedLength: number,
): Promise<ArrayBuffer> {
  const reader = response.body?.getReader();
  if (reader === undefined) throw new PublicAudioCacheError();

  const output = new Uint8Array(expectedLength);
  let offset = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (chunk.value.byteLength > expectedLength - offset) {
        await reader.cancel();
        throw new PublicAudioCacheError();
      }
      output.set(chunk.value, offset);
      offset += chunk.value.byteLength;
    }
  } catch (error) {
    try {
      await reader.cancel();
    } catch {
      // La cause reste volontairement opaque pour l'interface.
    }
    if (error instanceof PublicAudioCacheError) throw error;
    throw new PublicAudioCacheError();
  } finally {
    reader.releaseLock();
  }
  if (offset !== expectedLength) throw new PublicAudioCacheError();
  return output.buffer;
}

/**
 * Revalide toujours la publication distante avant d'utiliser le cache. Une
 * coupure réseau ne transforme donc pas implicitement cette preview en mode
 * hors connexion et ne résout pas OPEN-OFFLINE-001.
 */
export async function loadVerifiedWebAudio(input: {
  readonly url: string;
  readonly asset: PublicAudioAsset;
  readonly ports?: PublicAudioCachePorts;
}): Promise<VerifiedWebAudio> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  try {
    const ports = input.ports ?? (await defaultPorts());
    const key = cacheKey(input.asset);
    let cached = await ports.read(key);
    if (cached !== null && !(await verify(cached, input.asset, ports))) {
      await ports.remove(key);
      cached = null;
    }

    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), PUBLIC_AUDIO_TIMEOUT_MS);
    const response = await ports.fetch(input.url, {
      method: "GET",
      headers: {
        Accept: input.asset.mimeType,
        ...(cached === null ? {} : { "If-None-Match": audioEtag(input.asset) }),
      },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: controller.signal,
    });
    if (response.status === 304) {
      if (
        cached === null ||
        response.headers.get("etag") !== audioEtag(input.asset)
      ) {
        throw new PublicAudioCacheError();
      }
      return asObjectUrl(cached, true, ports);
    }
    if (response.status === 404) {
      if (cached !== null) await ports.remove(key);
      throw new PublicAudioCacheError();
    }
    if (
      response.status !== 200 ||
      response.headers.get("etag") !== audioEtag(input.asset) ||
      response.headers.get("content-type")?.split(";", 1)[0]?.trim() !==
        input.asset.mimeType
    ) {
      throw new PublicAudioCacheError();
    }

    const contentLength = response.headers.get("content-length");
    if (
      contentLength === null ||
      !/^\d+$/u.test(contentLength) ||
      Number(contentLength) !== input.asset.byteLength
    ) {
      throw new PublicAudioCacheError();
    }
    const downloaded = {
      bytes: await readExactResponseBytes(response, input.asset.byteLength),
      mimeType: input.asset.mimeType,
    } as const;
    if (!(await verify(downloaded, input.asset, ports))) {
      throw new PublicAudioCacheError();
    }
    await ports.write(key, downloaded);
    return asObjectUrl(downloaded, false, ports);
  } catch (error) {
    if (error instanceof PublicAudioCacheError) throw error;
    throw new PublicAudioCacheError();
  } finally {
    if (timeout !== null) clearTimeout(timeout);
  }
}
