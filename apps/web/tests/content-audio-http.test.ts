import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createPublishedAudioHttpHandler } from "../lib/server/content-delivery/audio-http";
import { ContentInfrastructureError } from "../lib/server/content-delivery/errors";
import { verifyPublishedBundleRow } from "../lib/server/content-delivery/verified-bundle";
import {
  makePublishableBundle,
  makePublishedLessonRow,
} from "./content-delivery-test-data";

const VERSION_ID = "10000000-0000-4000-8000-000000000002";
const ASSET_ID = "10000000-0000-4000-8000-000000000005";

async function fixtureAudio(): Promise<ArrayBuffer> {
  const file = await readFile(
    resolve(process.cwd(), "public/audio/fixture-tone.wav"),
  );
  return file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength,
  ) as ArrayBuffer;
}

function verifiedBundle() {
  const verified = verifyPublishedBundleRow(
    makePublishedLessonRow(makePublishableBundle()),
  );
  if (verified === null) throw new Error("Bundle publié de test invalide.");
  return verified;
}

async function dependencies() {
  const bytes = await fixtureAudio();
  return {
    repository: {
      loadPublishedBundle: vi.fn(async () => verifiedBundle()),
    },
    objectStore: {
      download: vi.fn(
        async () => new Blob([bytes], { type: "audio/wav" }) as Blob | null,
      ),
    },
    activeReleaseId: verifiedBundle().release.id,
    requestIdFactory: () => "audio-request-1",
    reportOperationalFailure: vi.fn(),
  };
}

function request(headers?: HeadersInit): Request {
  return new Request(
    `http://localhost/api/v1/content/lessons/${VERSION_ID}/audio/${ASSET_ID}`,
    headers === undefined ? {} : { headers },
  );
}

describe("transport HTTP audio publié", () => {
  it("vérifie puis sert l'objet complet avec un ETag fort", async () => {
    const deps = await dependencies();
    const response = await createPublishedAudioHttpHandler(deps)(
      request(),
      VERSION_ID,
      ASSET_ID,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/wav");
    expect(response.headers.get("content-length")).toBe("5164");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("etag")).toBe(
      '"sha256-801031380b85885ed9edd1bfe0050a4e93a61208fae8b8c5f01bbd3d553c118a"',
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array(await fixtureAudio()),
    );
    expect(deps.objectStore.download).toHaveBeenCalledWith({
      bucket: "bucket-prive",
      objectPath: "chemin-interne.wav",
    });
  });

  it("sert une plage unique et refuse une plage invalide sans télécharger", async () => {
    const partialDeps = await dependencies();
    const partial = await createPublishedAudioHttpHandler(partialDeps)(
      request({ Range: "bytes=10-19" }),
      VERSION_ID,
      ASSET_ID,
    );
    expect(partial.status).toBe(206);
    expect(partial.headers.get("content-range")).toBe("bytes 10-19/5164");
    expect((await partial.arrayBuffer()).byteLength).toBe(10);

    const invalidDeps = await dependencies();
    const invalid = await createPublishedAudioHttpHandler(invalidDeps)(
      request({ Range: "bytes=99999-100000" }),
      VERSION_ID,
      ASSET_ID,
    );
    expect(invalid.status).toBe(416);
    expect(invalid.headers.get("content-range")).toBe("bytes */5164");
    expect(invalidDeps.objectStore.download).not.toHaveBeenCalled();
  });

  it("répond 304 seulement après avoir revérifié la publication", async () => {
    const deps = await dependencies();
    const response = await createPublishedAudioHttpHandler(deps)(
      request({
        "If-None-Match":
          '"sha256-801031380b85885ed9edd1bfe0050a4e93a61208fae8b8c5f01bbd3d553c118a"',
      }),
      VERSION_ID,
      ASSET_ID,
    );

    expect(response.status).toBe(304);
    expect(deps.repository.loadPublishedBundle).toHaveBeenCalledOnce();
    expect(deps.objectStore.download).not.toHaveBeenCalled();
  });

  it("révoque aussi un audio mis en cache quand sa release n'est plus active", async () => {
    const deps = await dependencies();
    deps.activeReleaseId = "20000000-0000-4000-8000-000000000001";
    const response = await createPublishedAudioHttpHandler(deps)(
      request({
        "If-None-Match":
          '"sha256-801031380b85885ed9edd1bfe0050a4e93a61208fae8b8c5f01bbd3d553c118a"',
      }),
      VERSION_ID,
      ASSET_ID,
    );

    expect(response.status).toBe(404);
    expect(deps.objectStore.download).not.toHaveBeenCalled();
  });

  it("ferme un objet altéré sans exposer sa localisation", async () => {
    const deps = await dependencies();
    const altered = new Uint8Array(await fixtureAudio());
    altered[0] = (altered[0] ?? 0) ^ 0xff;
    deps.objectStore.download.mockResolvedValueOnce(
      new Blob([altered.buffer], { type: "audio/wav" }),
    );

    const response = await createPublishedAudioHttpHandler(deps)(
      request(),
      VERSION_ID,
      ASSET_ID,
    );
    const body = JSON.stringify(await response.json());
    expect(response.status).toBe(404);
    expect(body).not.toContain("bucket-prive");
    expect(body).not.toContain("chemin-interne");
    expect(deps.reportOperationalFailure).toHaveBeenCalledWith({
      operation: "published_audio_read",
      errorKind: "content_integrity_failed",
      requestId: "audio-request-1",
    });
  });

  it("masque une panne Storage", async () => {
    const deps = await dependencies();
    deps.objectStore.download.mockRejectedValueOnce(
      new ContentInfrastructureError(),
    );
    const response = await createPublishedAudioHttpHandler(deps)(
      request(),
      VERSION_ID,
      ASSET_ID,
    );
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("Storage");
  });
});
