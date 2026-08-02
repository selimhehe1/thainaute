import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  createPublicContentClient,
  PublicContentApiError,
  PublicContentClientConfigurationError,
  PublicContentProtocolError,
  PublicContentTransportError,
  type CachedPublicLesson,
  type CachedPublicRelease,
} from "../src/public-content-client";
import {
  canonicalPublicLessonHashMaterial,
  canonicalPublicReleaseHashMaterial,
} from "../src/public-content-integrity";
import {
  publicLessonSchema,
  publicLessonResponseSchema,
  publicReleaseSchema,
  publicReleaseResponseSchema,
} from "@thainaute/content/public";
import { describe, expect, it, vi } from "vitest";

const RELEASE_ID = "30000000-0000-4000-8000-000000000001";
const LESSON_ID = "10000000-0000-4000-8000-000000000001";
const VERSION_ID = "10000000-0000-4000-8000-000000000002";
const EXERCISE_ID = "10000000-0000-4000-8000-000000000004";
const ASSET_ID = "10000000-0000-4000-8000-000000000005";
const OPTION_A = "20000000-0000-4000-8000-000000000001";
const OPTION_B = "20000000-0000-4000-8000-000000000002";
const VALIDATED_AT = "2026-08-02T08:00:00.000Z";

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const publicLesson = publicLessonSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  lessonId: LESSON_ID,
  versionId: VERSION_ID,
  revision: 1,
  locale: "fr-FR",
  titleFr: "Boucle technique",
  objectiveFr: "Vérifier la distribution connectée.",
  publishedAt: "2026-08-01T10:00:00.000Z",
  access: "free",
  exercises: [
    {
      id: EXERCISE_ID,
      type: "audio_choice",
      skill: "listening",
      audioAssetId: ASSET_ID,
      promptFr: "Choisissez l'option technique A.",
      options: [
        { id: OPTION_A, labelFr: "Option A" },
        { id: OPTION_B, labelFr: "Option B" },
      ],
    },
  ],
  audioAssets: [
    {
      assetId: ASSET_ID,
      variant: "natural",
      mimeType: "audio/wav",
      sha256: "c".repeat(64),
      byteLength: 5164,
      durationMs: 320,
    },
  ],
});
const CONTENT_HASH = await sha256Hex(
  canonicalPublicLessonHashMaterial(publicLesson),
);
const lessonResponse = publicLessonResponseSchema.parse({
  schemaVersion: 1,
  contentSha256: CONTENT_HASH,
  lesson: publicLesson,
});

const publicRelease = publicReleaseSchema.parse({
  releaseId: RELEASE_ID,
  releaseVersion: 1,
  publishedAt: "2026-08-01T10:00:00.000Z",
  lessons: [
    {
      lessonId: LESSON_ID,
      versionId: VERSION_ID,
      revision: 1,
      titleFr: "Boucle technique",
      objectiveFr: "Vérifier la distribution connectée.",
      access: "free",
      contentSha256: CONTENT_HASH,
    },
  ],
});
const MANIFEST_HASH = await sha256Hex(
  canonicalPublicReleaseHashMaterial(publicRelease),
);
const releaseResponse = publicReleaseResponseSchema.parse({
  schemaVersion: 1,
  manifestSha256: MANIFEST_HASH,
  release: publicRelease,
});

function jsonResponse(
  body: unknown,
  init: { readonly etag?: string; readonly status?: number } = {},
): Response {
  return Response.json(body, {
    status: init.status ?? 200,
    headers: init.etag === undefined ? {} : { ETag: init.etag },
  });
}

describe("client de contenu public", () => {
  it("charge le manifeste et la leçon sans credentials", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(releaseResponse, {
          etag: `"sha256-${MANIFEST_HASH}"`,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(lessonResponse, {
          etag: `"sha256-${CONTENT_HASH}"`,
        }),
      );
    const client = createPublicContentClient({
      baseUrl: "https://thainaute.test",
      fetch: fetcher,
      now: () => VALIDATED_AT,
      sha256Hex,
    });

    const release = await client.getCurrentRelease();
    const lesson = await client.getLesson(VERSION_ID);

    expect(release.revalidated).toBe(false);
    expect(release.entry.response).toEqual(releaseResponse);
    expect(lesson.entry.response).toEqual(lessonResponse);
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://thainaute.test/api/v1/content/releases/current",
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }),
    );
  });

  it("réutilise seulement une entrée strictement revalidée par 304", async () => {
    const cached: CachedPublicLesson = {
      kind: "lesson",
      key: VERSION_ID,
      etag: `"sha256-${CONTENT_HASH}"`,
      validatedAt: "2026-08-01T10:00:00.000Z",
      response: lessonResponse,
    };
    const fetcher = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 304,
        headers: { ETag: cached.etag },
      }),
    );
    const client = createPublicContentClient({
      baseUrl: "",
      fetch: fetcher,
      now: () => VALIDATED_AT,
      sha256Hex,
    });

    const result = await client.getLesson(VERSION_ID, cached);
    expect(result).toEqual({
      revalidated: true,
      entry: { ...cached, validatedAt: VALIDATED_AT },
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      `/api/v1/content/lessons/${VERSION_ID}`,
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          "If-None-Match": cached.etag,
        },
      }),
    );

    fetcher.mockResolvedValueOnce(
      new Response(null, {
        status: 304,
        headers: { ETag: `"sha256-${"d".repeat(64)}"` },
      }),
    );
    await expect(client.getLesson(VERSION_ID, cached)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );

    const altered = cachedPublicLessonSchema.parse({
      ...cached,
      response: {
        ...cached.response,
        lesson: {
          ...cached.response.lesson,
          objectiveFr: "Corps local altéré sous le même hash.",
        },
      },
    });
    await expect(client.getLesson(VERSION_ID, altered)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
  });

  it("refuse un ETag divergent du corps et une réponse non JSON", async () => {
    const alteredResponse = publicLessonResponseSchema.parse({
      ...lessonResponse,
      lesson: {
        ...lessonResponse.lesson,
        objectiveFr: "Corps réseau altéré sous le même hash.",
      },
    });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(lessonResponse, {
          etag: `"sha256-${"d".repeat(64)}"`,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(alteredResponse, {
          etag: `"sha256-${CONTENT_HASH}"`,
        }),
      )
      .mockResolvedValueOnce(
        new Response("erreur libre", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        }),
      );
    const client = createPublicContentClient({
      baseUrl: "https://thainaute.test",
      fetch: fetcher,
      sha256Hex,
    });

    await expect(client.getLesson(VERSION_ID)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
    await expect(client.getLesson(VERSION_ID)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
    await expect(client.getLesson(VERSION_ID)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
  });

  it("classe les refus fermés et les pannes de transport", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: "content_not_found",
              message: "Contenu introuvable.",
              requestId: "request-1",
            },
          },
          { status: 404 },
        ),
      )
      .mockRejectedValueOnce(new Error("token=secret"));
    const client = createPublicContentClient({
      baseUrl: "https://thainaute.test",
      fetch: fetcher,
      sha256Hex,
    });

    await expect(client.getLesson(VERSION_ID)).rejects.toMatchObject({
      constructor: PublicContentApiError,
      code: "content_not_found",
      status: 404,
    });
    await expect(client.getLesson(VERSION_ID)).rejects.toBeInstanceOf(
      PublicContentTransportError,
    );
  });

  it("construit une URL audio opaque et ferme les origines faibles", () => {
    const client = createPublicContentClient({
      baseUrl: "https://api.thainaute.test/",
      fetch: vi.fn(),
      sha256Hex,
    });
    expect(client.audioUrl(VERSION_ID, ASSET_ID)).toBe(
      `https://api.thainaute.test/api/v1/content/lessons/${VERSION_ID}/audio/${ASSET_ID}`,
    );
    expect(() =>
      createPublicContentClient({
        baseUrl: "http://api.thainaute.test",
        fetch: vi.fn(),
        sha256Hex,
      }),
    ).toThrow(PublicContentClientConfigurationError);
    expect(() =>
      createPublicContentClient({
        baseUrl: "https://api.thainaute.test/sous-chemin",
        fetch: vi.fn(),
        sha256Hex,
      }),
    ).toThrow(PublicContentClientConfigurationError);
  });

  it("refuse une réponse ayant traversé une redirection", async () => {
    const redirected = jsonResponse(lessonResponse, {
      etag: `"sha256-${CONTENT_HASH}"`,
    });
    Object.defineProperty(redirected, "redirected", { value: true });
    const client = createPublicContentClient({
      baseUrl: "https://api.thainaute.test",
      fetch: vi.fn().mockResolvedValue(redirected),
      sha256Hex,
    });

    await expect(client.getLesson(VERSION_ID)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
  });

  it("valide strictement aussi le cache de manifeste", async () => {
    const cached: CachedPublicRelease = {
      kind: "release",
      key: "current",
      etag: `"sha256-${MANIFEST_HASH}"`,
      validatedAt: VALIDATED_AT,
      response: releaseResponse,
    };
    const client = createPublicContentClient({
      baseUrl: "",
      fetch: vi.fn().mockResolvedValue(
        new Response(null, {
          status: 304,
          headers: { ETag: cached.etag },
        }),
      ),
      sha256Hex,
    });
    await expect(client.getCurrentRelease(cached)).resolves.toMatchObject({
      revalidated: true,
      entry: { response: releaseResponse },
    });
    const altered = cachedPublicReleaseSchema.parse({
      ...cached,
      response: {
        ...cached.response,
        release: {
          ...cached.response.release,
          publishedAt: "2026-08-02T10:00:00.000Z",
        },
      },
    });
    await expect(client.getCurrentRelease(altered)).rejects.toBeInstanceOf(
      PublicContentProtocolError,
    );
  });
});
