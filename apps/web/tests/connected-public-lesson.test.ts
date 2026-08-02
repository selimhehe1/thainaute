import {
  cachedPublicLessonSchema,
  cachedPublicReleaseSchema,
  type CachedPublicLesson,
  type PublicContentClient,
} from "@thainaute/sync";
import { describe, expect, it, vi } from "vitest";

import {
  ConnectedPublicLessonError,
  loadCurrentConnectedPublicLesson,
  type ConnectedPublicLessonCache,
} from "@/lib/client/connected-public-lesson";

const ids = {
  release: "30000000-0000-4000-8000-000000000001",
  lesson: "10000000-0000-4000-8000-000000000001",
  version: "10000000-0000-4000-8000-000000000002",
  exercise: "10000000-0000-4000-8000-000000000004",
  asset: "10000000-0000-4000-8000-000000000005",
  optionA: "20000000-0000-4000-8000-000000000001",
  optionB: "20000000-0000-4000-8000-000000000002",
} as const;
const contentSha256 = "a".repeat(64);

const release = cachedPublicReleaseSchema.parse({
  kind: "release",
  key: "current",
  etag: `"sha256-${"b".repeat(64)}"`,
  validatedAt: "2026-08-02T08:00:00.000Z",
  response: {
    schemaVersion: 1,
    manifestSha256: "b".repeat(64),
    release: {
      releaseId: ids.release,
      releaseVersion: 1,
      publishedAt: "2026-08-01T10:00:00.000Z",
      lessons: [
        {
          lessonId: ids.lesson,
          versionId: ids.version,
          revision: 1,
          titleFr: "Boucle technique",
          objectiveFr: "Vérifier la boucle.",
          access: "free",
          contentSha256,
        },
      ],
    },
  },
});

function lesson(hash = contentSha256) {
  return cachedPublicLessonSchema.parse({
    kind: "lesson",
    key: ids.version,
    etag: `"sha256-${hash}"`,
    validatedAt: "2026-08-02T08:00:00.000Z",
    response: {
      schemaVersion: 1,
      contentSha256: hash,
      lesson: {
        releaseId: ids.release,
        releaseVersion: 1,
        lessonId: ids.lesson,
        versionId: ids.version,
        revision: 1,
        locale: "fr-FR",
        titleFr: "Boucle technique",
        objectiveFr: "Vérifier la boucle.",
        publishedAt: "2026-08-01T10:00:00.000Z",
        access: "free",
        exercises: [
          {
            id: ids.exercise,
            type: "audio_choice",
            skill: "listening",
            audioAssetId: ids.asset,
            promptFr: "Choisissez A.",
            options: [
              { id: ids.optionA, labelFr: "Option A" },
              { id: ids.optionB, labelFr: "Option B" },
            ],
          },
        ],
        audioAssets: [
          {
            assetId: ids.asset,
            variant: "natural",
            mimeType: "audio/wav",
            sha256: "c".repeat(64),
            byteLength: 5_164,
            durationMs: 320,
          },
        ],
      },
    },
  });
}

function harness(lessonEntry: CachedPublicLesson = lesson()) {
  const writes: string[] = [];
  const cache: ConnectedPublicLessonCache = {
    readCurrentRelease: vi.fn(async () => null),
    readLesson: vi.fn(async () => null),
    writeCurrentRelease: vi.fn(async (entry) => {
      writes.push("release");
      return entry;
    }),
    writeLesson: vi.fn(async (entry) => {
      writes.push("lesson");
      return entry;
    }),
    close: vi.fn(),
  };
  const client: PublicContentClient = {
    getCurrentRelease: vi.fn(async () => ({
      entry: release,
      revalidated: false,
    })),
    getLesson: vi.fn(async () => ({
      entry: lessonEntry,
      revalidated: false,
    })),
    audioUrl: vi.fn((versionId, assetId) => `/audio/${versionId}/${assetId}`),
  };
  return { cache, client, writes };
}

describe("chargement de la leçon connectée", () => {
  it("valide le lien manifeste/leçon avant les deux écritures", async () => {
    const { cache, client, writes } = harness();
    const result = await loadCurrentConnectedPublicLesson({ cache, client });
    expect(result.lesson.response.lesson.versionId).toBe(ids.version);
    expect(result.audioUrl(ids.asset)).toBe(
      `/audio/${ids.version}/${ids.asset}`,
    );
    expect(writes).toEqual(["lesson", "release"]);
    expect(cache.writeCurrentRelease).toHaveBeenCalledWith(release, null);
    expect(cache.close).toHaveBeenCalledOnce();
  });

  it("refuse un hash non annoncé sans contaminer le cache", async () => {
    const { cache, client, writes } = harness(lesson("d".repeat(64)));
    await expect(
      loadCurrentConnectedPublicLesson({ cache, client }),
    ).rejects.toBeInstanceOf(ConnectedPublicLessonError);
    expect(writes).toEqual([]);
    expect(cache.close).toHaveBeenCalledOnce();
  });
});
