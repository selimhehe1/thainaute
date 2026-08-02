import type { PublicAudioAsset } from "@thainaute/content/public";
import { describe, expect, it, vi } from "vitest";

import {
  loadVerifiedWebAudio,
  PublicAudioCacheError,
  type PublicAudioCachePorts,
} from "@/lib/client/public-audio-cache";

const bytes = new TextEncoder().encode("signal-fixture").buffer;
const asset = {
  assetId: "10000000-0000-4000-8000-000000000005",
  variant: "natural",
  mimeType: "audio/wav",
  sha256: "a".repeat(64),
  byteLength: bytes.byteLength,
  durationMs: 320,
} as const satisfies PublicAudioAsset;

function response(status: number, body: ArrayBuffer | null = bytes): Response {
  return new Response(body, {
    status,
    headers: {
      ETag: `"sha256-${asset.sha256}"`,
      ...(status === 304
        ? {}
        : {
            "Content-Length": String(asset.byteLength),
            "Content-Type": asset.mimeType,
          }),
    },
  });
}

function ports(input?: {
  readonly cached?: { bytes: ArrayBuffer; mimeType: "audio/wav" } | null;
  readonly fetchResponse?: Response;
  readonly hash?: string;
}) {
  const write = vi.fn<PublicAudioCachePorts["write"]>();
  const remove = vi.fn<PublicAudioCachePorts["remove"]>();
  const revokeObjectUrl = vi.fn<PublicAudioCachePorts["revokeObjectUrl"]>();
  const value: PublicAudioCachePorts = {
    read: vi.fn(async () => input?.cached ?? null),
    write,
    remove,
    fetch: vi.fn(async () => input?.fetchResponse ?? response(200)),
    sha256Hex: vi.fn(async () => input?.hash ?? asset.sha256),
    createObjectUrl: vi.fn(() => "blob:verified"),
    revokeObjectUrl,
  };
  return { value, write, remove, revokeObjectUrl };
}

describe("cache audio web public", () => {
  it("vérifie puis promeut un téléchargement avant de créer l'URL locale", async () => {
    const harness = ports();
    const result = await loadVerifiedWebAudio({
      url: "/api/v1/content/audio",
      asset,
      ports: harness.value,
    });

    expect(result).toMatchObject({
      objectUrl: "blob:verified",
      revalidated: false,
    });
    expect(harness.write).toHaveBeenCalledOnce();
    result.revoke();
    result.revoke();
    expect(harness.revokeObjectUrl).toHaveBeenCalledOnce();
  });

  it("réutilise uniquement un cache intègre après un 304 exact", async () => {
    const harness = ports({
      cached: { bytes, mimeType: "audio/wav" },
      fetchResponse: response(304, null),
    });
    const result = await loadVerifiedWebAudio({
      url: "/api/v1/content/audio",
      asset,
      ports: harness.value,
    });
    expect(result.revalidated).toBe(true);
    expect(harness.write).not.toHaveBeenCalled();
  });

  it("supprime un cache corrompu et refuse une réponse 304 sans copie", async () => {
    const harness = ports({
      cached: { bytes, mimeType: "audio/wav" },
      fetchResponse: response(304, null),
      hash: "b".repeat(64),
    });
    await expect(
      loadVerifiedWebAudio({
        url: "/api/v1/content/audio",
        asset,
        ports: harness.value,
      }),
    ).rejects.toBeInstanceOf(PublicAudioCacheError);
    expect(harness.remove).toHaveBeenCalledWith(`sha256:${asset.sha256}`);
  });

  it("ne remplace jamais le cache avec des octets au mauvais hash", async () => {
    const harness = ports({ hash: "b".repeat(64) });
    await expect(
      loadVerifiedWebAudio({
        url: "/api/v1/content/audio",
        asset,
        ports: harness.value,
      }),
    ).rejects.toBeInstanceOf(PublicAudioCacheError);
    expect(harness.write).not.toHaveBeenCalled();
  });

  it("purge une copie explicitement révoquée par le serveur", async () => {
    const harness = ports({
      cached: { bytes, mimeType: "audio/wav" },
      fetchResponse: response(404, null),
    });
    await expect(
      loadVerifiedWebAudio({
        url: "/api/v1/content/audio",
        asset,
        ports: harness.value,
      }),
    ).rejects.toBeInstanceOf(PublicAudioCacheError);
    expect(harness.remove).toHaveBeenCalledWith(`sha256:${asset.sha256}`);
  });

  it("exige une longueur canonique et borne le flux avant le hash", async () => {
    const malformedLength = ports({
      fetchResponse: new Response(bytes, {
        status: 200,
        headers: {
          ETag: `"sha256-${asset.sha256}"`,
          "Content-Length": `${asset.byteLength}junk`,
          "Content-Type": asset.mimeType,
        },
      }),
    });
    await expect(
      loadVerifiedWebAudio({
        url: "/api/v1/content/audio",
        asset,
        ports: malformedLength.value,
      }),
    ).rejects.toBeInstanceOf(PublicAudioCacheError);

    const oversized = ports({
      fetchResponse: new Response(new Uint8Array(asset.byteLength + 1), {
        status: 200,
        headers: {
          ETag: `"sha256-${asset.sha256}"`,
          "Content-Length": String(asset.byteLength),
          "Content-Type": asset.mimeType,
        },
      }),
    });
    await expect(
      loadVerifiedWebAudio({
        url: "/api/v1/content/audio",
        asset,
        ports: oversized.value,
      }),
    ).rejects.toBeInstanceOf(PublicAudioCacheError);
    expect(oversized.write).not.toHaveBeenCalled();
  });
});
